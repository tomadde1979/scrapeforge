import { chromium, Browser, Page } from 'playwright';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';
import UserAgent from 'user-agents';

export class HeadlessInstagramScraper extends BaseScraper {
  private browser: Browser | null = null;
  private userAgents: string[] = [];

  constructor(options: ScraperOptions) {
    super('headless-instagram', options);
    this.initUserAgents();
  }

  private initUserAgents() {
    // Generate realistic user agents
    for (let i = 0; i < 10; i++) {
      const userAgent = new UserAgent();
      this.userAgents.push(userAgent.toString());
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    console.log('Starting headless Instagram scraping with keywords:', this.options.keywords.join(', '));
    
    const results: ScrapedProfile[] = [];
    let processed = 0;

    try {
      // Launch browser with stealth configuration
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      for (const keyword of this.options.keywords) {
        if (results.length >= this.options.maxProfiles) break;
        
        const profilesFromKeyword = await this.scrapeHashtag(keyword, onProgress);
        results.push(...profilesFromKeyword);
        
        // Update progress
        processed += profilesFromKeyword.length;
        onProgress?.(
          Math.min((processed / this.options.maxProfiles) * 100, 100),
          `Completed hashtag: ${keyword}`
        );

        // Anti-ban delay between hashtags
        await this.randomDelay(5000, 8000);
      }

    } catch (error) {
      console.error('Headless Instagram scraping error:', error);
      console.log('💡 Tip: Headless browser scraping requires system dependencies that may not be available in all environments');
      console.log('💡 Consider using API-based scraping or deploying to a system with full browser support');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    console.log(`Headless Instagram scraping completed. Found ${results.length} profiles.`);
    return results.slice(0, this.options.maxProfiles);
  }

  private async scrapeHashtag(hashtag: string, onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    if (!this.browser) return [];

    const results: ScrapedProfile[] = [];
    const context = await this.browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    const page = await context.newPage();

    try {
      // Navigate to hashtag page
      const hashtagUrl = `https://www.instagram.com/explore/tags/${hashtag.replace('#', '')}/`;
      console.log(`Navigating to: ${hashtagUrl}`);
      
      await page.goto(hashtagUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await this.randomDelay(3000, 5000);

      // Wait for posts to load
      await page.waitForSelector('article img', { timeout: 15000 });

      // Scroll to load more posts
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Get post links
      const postLinks = await page.$$eval('article a[href*="/p/"]', links => 
        links.slice(0, 20).map(link => (link as HTMLAnchorElement).href)
      );

      console.log(`Found ${postLinks.length} posts for hashtag ${hashtag}`);

      // Visit each post and extract profile data
      for (let i = 0; i < Math.min(postLinks.length, 10); i++) {
        if (results.length >= 30) break; // Safety limit

        const postUrl = postLinks[i];
        const profile = await this.scrapePostProfile(page, postUrl, onProgress);
        
        if (profile) {
          results.push(profile);
          onProgress?.(
            Math.min(((i + 1) / Math.min(postLinks.length, 10)) * 100, 100),
            profile.profileName
          );
        }

        // Anti-ban delay between posts
        await this.randomDelay(3000, 6000);
      }

    } catch (error) {
      console.error(`Error scraping hashtag ${hashtag}:`, error);
    } finally {
      await context.close();
    }

    return results;
  }

  private async scrapePostProfile(page: Page, postUrl: string, onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile | null> {
    try {
      console.log(`Scraping post: ${postUrl}`);
      
      // Navigate to post
      await page.goto(postUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await this.randomDelay(2000, 4000);

      // Extract username from post
      const username = await page.$eval('article header a[href^="/"]', 
        el => (el as HTMLAnchorElement).href.split('/')[3]
      ).catch(() => null);

      if (!username) return null;

      // Navigate to profile
      const profileUrl = `https://www.instagram.com/${username}/`;
      await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await this.randomDelay(2000, 4000);

      // Extract profile data
      const profileData = await page.evaluate(() => {
        const getName = () => {
          const nameEl = document.querySelector('header section h2') || 
                       document.querySelector('header h1') ||
                       document.querySelector('h2');
          return nameEl?.textContent?.trim() || '';
        };

        const getBio = () => {
          const bioEl = document.querySelector('header section div[dir="auto"]') ||
                       document.querySelector('article div[dir="auto"]') ||
                       document.querySelector('div[data-testid="user-description"]');
          return bioEl?.textContent?.trim() || '';
        };

        const getExternalUrl = () => {
          const linkEl = document.querySelector('header section a[href^="http"]') ||
                        document.querySelector('a[rel="me nofollow noopener noreferrer"]');
          return (linkEl as HTMLAnchorElement)?.href || '';
        };

        return {
          name: getName(),
          bio: getBio(),
          externalUrl: getExternalUrl()
        };
      });

      // Extract email from bio or external URL
      const email = this.extractEmailFromText(profileData.bio + ' ' + profileData.externalUrl);
      
      if (email && this.shouldIncludeProfile(profileData.bio)) {
        return {
          profileName: profileData.name || username,
          profileUrl,
          platform: 'instagram',
          bioText: profileData.bio,
          linkInBio: profileData.externalUrl,
          email,
          emailSource: profileData.bio.includes(email) ? 'bio' : 'bio_link'
        };
      }

    } catch (error) {
      console.error(`Error scraping profile from post ${postUrl}:`, error);
    }

    return null;
  }

  protected extractEmailFromText(text: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  }
}