import puppeteer from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class InstagramScraper extends BaseScraper {
  constructor(options: ScraperOptions) {
    super('instagram', options);
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

        await page.goto(`https://www.instagram.com/explore/tags/${keyword}/`, { 
          waitUntil: 'networkidle2' 
        });

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Get profile links from hashtag page
        const profileLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/p/"]'));
          return links.slice(0, 20).map(link => (link as HTMLAnchorElement).href);
        });

        for (const postUrl of profileLinks) {
          if (results.length >= this.options.maxProfiles) break;

          try {
            await page.goto(postUrl, { waitUntil: 'networkidle2' });
            await this.sleep(1000);

            // Extract profile info from post page
            const profileData = await page.evaluate(() => {
              const profileLink = document.querySelector('a[href*="/"]');
              const profileName = profileLink?.getAttribute('href')?.replace('/', '') || '';
              return {
                profileName,
                profileUrl: profileLink ? `https://www.instagram.com${profileLink.getAttribute('href')}` : '',
              };
            });

            if (profileData.profileName) {
              // Visit actual profile
              await page.goto(profileData.profileUrl, { waitUntil: 'networkidle2' });
              await this.sleep(1000);

              const bioData = await page.evaluate(() => {
                const bioElement = document.querySelector('div[data-testid="UserDescription"]');
                const linkElement = document.querySelector('a[href*="http"]');
                
                return {
                  bioText: bioElement?.textContent || '',
                  linkInBio: linkElement?.getAttribute('href') || undefined,
                };
              });

              if (this.shouldIncludeProfile(bioData.bioText)) {
                const email = this.extractEmailFromText(bioData.bioText);
                
                results.push({
                  profileName: `@${profileData.profileName}`,
                  profileUrl: profileData.profileUrl,
                  platform: 'instagram',
                  bioText: bioData.bioText,
                  linkInBio: bioData.linkInBio,
                  email: email || undefined,
                  emailSource: email ? 'bio' : undefined,
                });

                processed++;
                onProgress?.(
                  Math.min((processed / this.options.maxProfiles) * 100, 100),
                  `@${profileData.profileName}`
                );
              }
            }

            await this.sleep(this.options.rateLimitMs);
          } catch (error) {
            console.error(`Error scraping Instagram profile:`, error);
          }
        }
      }

      return results;
    } finally {
      await browser.close();
    }
  }
}
