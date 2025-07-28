import puppeteer from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class RedditScraper extends BaseScraper {
  constructor(options: ScraperOptions) {
    super('reddit', options);
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

      // Search for posts with keywords
      for (const keyword of this.options.keywords) {
        if (results.length >= this.options.maxProfiles) break;

        const searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(keyword)}&type=user`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        
        await this.sleep(2000);

        // Extract user links from search results
        const userLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/user/"]'));
          return links.slice(0, 15).map(link => (link as HTMLAnchorElement).href);
        });

        for (const userUrl of userLinks) {
          if (results.length >= this.options.maxProfiles) break;

          try {
            await page.goto(userUrl, { waitUntil: 'networkidle2' });
            await this.sleep(1500);

            const profileData = await page.evaluate(() => {
              const usernameElement = document.querySelector('[data-testid="user-name"]') ||
                                    document.querySelector('h1');
              const bioElement = document.querySelector('[data-testid="user-bio"]') ||
                               document.querySelector('.ProfileHeaderCard__bio');
              
              return {
                username: usernameElement?.textContent?.trim() || '',
                bioText: bioElement?.textContent?.trim() || '',
              };
            });

            if (profileData.bioText && this.shouldIncludeProfile(profileData.bioText)) {
              const email = this.extractEmailFromText(profileData.bioText);
              
              results.push({
                profileName: profileData.username.startsWith('u/') ? profileData.username : `u/${profileData.username}`,
                profileUrl: userUrl,
                platform: 'reddit',
                bioText: profileData.bioText,
                email: email || undefined,
                emailSource: email ? 'bio' : undefined,
              });

              processed++;
              onProgress?.(
                Math.min((processed / this.options.maxProfiles) * 100, 100),
                profileData.username
              );
            }

            await this.sleep(this.options.rateLimitMs);
          } catch (error) {
            console.error(`Error scraping Reddit profile:`, error);
          }
        }
      }

      return results;
    } finally {
      await browser.close();
    }
  }
}
