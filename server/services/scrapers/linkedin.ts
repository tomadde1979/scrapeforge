import puppeteer from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class LinkedInScraper extends BaseScraper {
  constructor(options: ScraperOptions) {
    super('linkedin', options);
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const results: ScrapedProfile[] = [];
      let processed = 0;

      // Search for profiles with keywords
      for (const keyword of this.options.keywords) {
        if (results.length >= this.options.maxProfiles) break;

        const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        
        // Wait for search results
        await this.sleep(3000);

        // Extract profile links from search results
        const profileLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/in/"]'));
          return links.slice(0, 10).map(link => (link as HTMLAnchorElement).href);
        });

        for (const profileUrl of profileLinks) {
          if (results.length >= this.options.maxProfiles) break;

          try {
            await page.goto(profileUrl, { waitUntil: 'networkidle2' });
            await this.sleep(2000);

            const profileData = await page.evaluate(() => {
              const nameElement = document.querySelector('h1');
              const bioElement = document.querySelector('[data-field="summary"]') || 
                                document.querySelector('.pv-about__summary-text');
              const contactSection = document.querySelector('[data-section="contactInfo"]');
              
              return {
                profileName: nameElement?.textContent?.trim() || '',
                bioText: bioElement?.textContent?.trim() || '',
                hasContactInfo: !!contactSection,
              };
            });

            if (this.shouldIncludeProfile(profileData.bioText)) {
              const email = this.extractEmailFromText(profileData.bioText);
              
              results.push({
                profileName: profileData.profileName,
                profileUrl: profileUrl,
                platform: 'linkedin',
                bioText: profileData.bioText,
                email: email || undefined,
                emailSource: email ? 'bio' : undefined,
              });

              processed++;
              onProgress?.(
                Math.min((processed / this.options.maxProfiles) * 100, 100),
                profileData.profileName
              );
            }

            await this.sleep(this.options.rateLimitMs);
          } catch (error) {
            console.error(`Error scraping LinkedIn profile:`, error);
          }
        }
      }

      return results;
    } finally {
      await browser.close();
    }
  }
}
