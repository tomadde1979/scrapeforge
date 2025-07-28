import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class RealRedditScraper extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(options: ScraperOptions) {
    super('real-reddit', options);
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    console.log('Starting REAL Reddit scraping with keywords:', this.options.keywords.join(', '));
    
    const results: ScrapedProfile[] = [];
    let processed = 0;

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: '/home/runner/.cache/puppeteer/chrome/linux-138.0.7204.168/chrome-linux64/chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--single-process',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1366, height: 768 });

      // Search for each keyword
      for (const keyword of this.options.keywords) {
        if (results.length >= this.options.maxProfiles) break;

        console.log(`Searching Reddit for: ${keyword}`);
        onProgress?.(processed / this.options.maxProfiles * 100, `Searching: ${keyword}`);

        // Search Reddit
        await this.page.goto(`https://www.reddit.com/search/?q=${encodeURIComponent(keyword)}&type=user`, {
          waitUntil: 'networkidle2'
        });
        await this.sleep(3000);

        // Extract user profiles
        const userProfiles = await this.extractUserProfiles();
        
        for (const userProfile of userProfiles) {
          if (results.length >= this.options.maxProfiles) break;

          try {
            const profile = await this.scrapeUserProfile(userProfile);
            if (profile && profile.email) {
              results.push(profile);
              processed++;
              onProgress?.(processed / this.options.maxProfiles * 100, profile.profileName);
            }
          } catch (error) {
            console.log(`Error processing Reddit user ${userProfile}:`, error.message);
          }

          await this.sleep(this.options.rateLimitMs);
        }
      }

    } catch (error) {
      console.error('Reddit scraping error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    console.log(`Real Reddit scraping completed. Found ${results.length} profiles with emails.`);
    return results;
  }

  private async extractUserProfiles(): Promise<string[]> {
    try {
      await this.page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      const userLinks = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/user/"]'));
        return links.slice(0, 20).map(link => (link as HTMLAnchorElement).href);
      });

      return userLinks;
    } catch (error) {
      console.log('Could not extract Reddit user profiles');
      return [];
    }
  }

  private async scrapeUserProfile(profileUrl: string): Promise<ScrapedProfile | null> {
    try {
      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      await this.sleep(2000);

      const profileData = await this.page.evaluate(() => {
        // Extract username
        const usernameElement = document.querySelector('[data-testid="user-profile-link"]');
        const usernameText = usernameElement?.textContent;
        const username = usernameText ? usernameText.replace('u/', '') : '';

        // Extract bio/description
        const bioElement = document.querySelector('[data-testid="user-profile-description"]');
        const bioText = bioElement?.textContent || '';

        return { username, bioText };
      });

      if (!profileData.username) return null;

      // Extract email from bio
      const email = this.extractEmailFromText(profileData.bioText);
      if (!email) return null;

      return {
        profileName: `u/${profileData.username}`,
        profileUrl,
        platform: 'reddit',
        bioText: profileData.bioText,
        email,
        emailSource: 'bio',
      };

    } catch (error) {
      console.log('Error scraping Reddit profile:', error.message);
      return null;
    }
  }
}