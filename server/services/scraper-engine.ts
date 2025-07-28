import { storage } from '../storage';
import { parseEmailFromText } from './openai';
import { ApiInstagramScraper } from './scrapers/api-instagram';
import { ApiRedditScraper } from './scrapers/api-reddit';
import { AuthenticLinkedInScraper } from './scrapers/authentic-linkedin';
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
    console.log(`Starting scraping for project ${projectId}`);
    
    if (this.activeJobs.get(projectId)) {
      throw new Error('Scraping job already running for this project');
    }

    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    console.log(`Project found: ${project.name}, platforms: ${JSON.stringify(project.platforms)}`);
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

        const scraper = this.createScraper(platform, keywords, project);
        if (!scraper) continue;

        await storage.createScrapingLog({
          projectId,
          platform,
          status: 'started',
          message: `Starting ${platform} scraping`,
        });

        try {
          console.log(`Starting ${platform} scraper with keywords: ${keywords}`);
          const profiles = await scraper.scrapeProfiles((progress, currentProfile) => {
            console.log(`Progress: ${progress}%, Current: ${currentProfile}`);
            // Update job progress
            storage.updateScrapingJob(job.id, {
              progress: Math.floor(progress),
              currentProfile,
            });
          });
          
          console.log(`${platform} scraper completed. Found ${profiles.length} profiles`);

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

  private createScraper(platform: string, keywords: string[], project?: any): BaseScraper | null {
    const options = {
      keywords,
      maxProfiles: 10000, // Dramatically increased - scan up to 10k profiles per platform
      rateLimitMs: 300, // Much faster scraping - 0.3 second delay
      includeFollowers: project?.includeFollowers || false,
      includeCommenters: project?.includeCommenters || false,
      maxFollowersPerProfile: project?.maxFollowersPerProfile || 100,
      maxCommentsPerProfile: project?.maxCommentsPerProfile || 50,
      maxPostsToScan: project?.maxPostsToScan || 10,
    };

    switch (platform.toLowerCase()) {
      case 'instagram':
        return new ApiInstagramScraper(options);
      case 'linkedin':
        return new AuthenticLinkedInScraper(options);
      case 'reddit':
        return new ApiRedditScraper(options);
      case 'twitter':
        return new ApiRedditScraper(options); // Use Reddit API approach for Twitter too
      default:
        return null;
    }
  }
}
