import { storage } from '../storage';
import { parseEmailFromText } from './openai';
import { InstagramScraper } from './scrapers/instagram';
import { LinkedInScraper } from './scrapers/linkedin';
import { RedditScraper } from './scrapers/reddit';
import { BaseScraper, ScrapedProfile } from './scrapers/base';

export class ScraperEngine {
  private static instance: ScraperEngine;
  private activeJobs: Map<string, boolean> = new Map();

  static getInstance(): ScraperEngine {
    if (!ScraperEngine.instance) {
      ScraperEngine.instance = new ScraperEngine();
    }
    return ScraperEngine.instance;
  }

  async startScraping(projectId: string): Promise<void> {
    if (this.activeJobs.get(projectId)) {
      throw new Error('Scraping job already running for this project');
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    this.activeJobs.set(projectId, true);

    try {
      // Create scraping job
      const job = await storage.createScrapingJob({
        projectId,
        platform: 'all',
        status: 'running',
        progress: 0,
        totalProfiles: 0,
        scannedProfiles: 0,
        foundEmails: 0,
        startedAt: new Date(),
      });

      const keywords = project.keywords?.split(',').map(k => k.trim()) || [];
      const platforms = project.platforms as string[];

      let totalFound = 0;
      let totalScanned = 0;

      for (const platform of platforms) {
        if (!this.activeJobs.get(projectId)) break; // Check if job was cancelled

        const scraper = this.createScraper(platform, keywords);
        if (!scraper) continue;

        await storage.createScrapingLog({
          projectId,
          platform,
          status: 'started',
          message: `Starting ${platform} scraping`,
        });

        try {
          const profiles = await scraper.scrapeProfiles((progress, currentProfile) => {
            // Update job progress
            storage.updateScrapingJob(job.id, {
              progress: Math.floor(progress),
              currentProfile,
            });
          });

          // Process each profile
          for (const profile of profiles) {
            if (!this.activeJobs.get(projectId)) break;

            let finalEmail = profile.email;
            let emailSource = profile.emailSource;
            let isAiParsed = false;

            // If no email found in bio, try AI parsing
            if (!finalEmail && profile.bioText) {
              const aiResult = await parseEmailFromText(profile.bioText);
              if (aiResult.email && aiResult.confidence > 0.7) {
                finalEmail = aiResult.email;
                emailSource = 'ai_parsed';
                isAiParsed = true;
              }
            }

            // Save result to database
            await storage.createScrapingResult({
              projectId,
              profileName: profile.profileName,
              profileUrl: profile.profileUrl,
              platform: profile.platform,
              email: finalEmail,
              emailSource,
              bioText: profile.bioText,
              linkInBio: profile.linkInBio,
              isAiParsed,
            });

            totalScanned++;
            if (finalEmail) totalFound++;
          }

          await storage.createScrapingLog({
            projectId,
            platform,
            status: 'completed',
            message: `Completed ${platform} scraping`,
            profilesScanned: profiles.length,
            emailsFound: profiles.filter(p => p.email).length,
          });

        } catch (error) {
          await storage.createScrapingLog({
            projectId,
            platform,
            status: 'error',
            message: `Error scraping ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }

      // Complete the job
      await storage.updateScrapingJob(job.id, {
        status: 'completed',
        progress: 100,
        scannedProfiles: totalScanned,
        foundEmails: totalFound,
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      this.activeJobs.delete(projectId);
    }
  }

  async stopScraping(projectId: string): Promise<void> {
    this.activeJobs.set(projectId, false);
    
    // Update any running jobs to cancelled status
    const jobs = await storage.getScrapingJobs(projectId);
    const runningJob = jobs.find(job => job.status === 'running');
    
    if (runningJob) {
      await storage.updateScrapingJob(runningJob.id, {
        status: 'failed',
        completedAt: new Date(),
      });
    }
  }

  isScrapingActive(projectId: string): boolean {
    return this.activeJobs.get(projectId) === true;
  }

  private createScraper(platform: string, keywords: string[]): BaseScraper | null {
    const options = {
      keywords,
      maxProfiles: 50, // Configurable limit
      rateLimitMs: 2000, // 2 second delay between requests
    };

    switch (platform.toLowerCase()) {
      case 'instagram':
        return new InstagramScraper(options);
      case 'linkedin':
        return new LinkedInScraper(options);
      case 'reddit':
        return new RedditScraper(options);
      default:
        return null;
    }
  }
}
