import { chromium, Browser, Page } from 'playwright';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';
import UserAgent from 'user-agents';

export class HeadlessLinkedInScraper extends BaseScraper {
  private browser: Browser | null = null;
  private userAgents: string[] = [];

  constructor(options: ScraperOptions) {
    super('headless-linkedin', options);
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
    console.log('Starting headless LinkedIn scraping with keywords:', this.options.keywords.join(', '));
    
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
        
        const profilesFromKeyword = await this.searchKeyword(keyword, onProgress);
        results.push(...profilesFromKeyword);
        
        // Update progress
        processed += profilesFromKeyword.length;
        onProgress?.(
          Math.min((processed / this.options.maxProfiles) * 100, 100),
          `Completed keyword: ${keyword}`
        );

        // Anti-ban delay between searches
        await this.randomDelay(8000, 12000);
      }

    } catch (error) {
      console.error('Headless LinkedIn scraping error:', error);
      console.log('💡 Tip: Headless browser scraping requires system dependencies that may not be available in all environments');
      console.log('💡 Consider using API-based scraping or deploying to a system with full browser support');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    console.log(`Headless LinkedIn scraping completed. Found ${results.length} profiles.`);
    return results.slice(0, this.options.maxProfiles);
  }

  private async searchKeyword(keyword: string, onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    if (!this.browser) return [];

    const results: ScrapedProfile[] = [];
    const context = await this.browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    const page = await context.newPage();

    try {
      // Search for keyword on LinkedIn
      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}`;
      console.log(`Searching LinkedIn for: ${keyword}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await this.randomDelay(3000, 5000);

      // Wait for search results
      await page.waitForSelector('.search-results-container', { timeout: 15000 });

      // Scroll to load more results
      for (let i = 0; i < 2; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await this.randomDelay(2000, 3000);
      }

      // Get profile links from search results
      const profileLinks = await page.$$eval(
        '.search-results-container a[href*="/in/"]', 
        links => links.slice(0, 15).map(link => (link as HTMLAnchorElement).href)
      );

      console.log(`Found ${profileLinks.length} LinkedIn profiles for keyword ${keyword}`);

      // Visit each profile and extract data
      for (let i = 0; i < Math.min(profileLinks.length, 10); i++) {
        if (results.length >= 30) break; // Safety limit

        const profileUrl = profileLinks[i];
        const profile = await this.scrapeLinkedInProfile(page, profileUrl, onProgress);
        
        if (profile) {
          results.push(profile);
          onProgress?.(
            Math.min(((i + 1) / Math.min(profileLinks.length, 10)) * 100, 100),
            profile.profileName
          );
        }

        // Anti-ban delay between profiles
        await this.randomDelay(5000, 8000);
      }

    } catch (error) {
      console.error(`Error searching LinkedIn for ${keyword}:`, error);
    } finally {
      await context.close();
    }

    return results;
  }

  private async scrapeLinkedInProfile(page: Page, profileUrl: string, onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile | null> {
    try {
      console.log(`Scraping LinkedIn profile: ${profileUrl}`);
      
      // Navigate to profile
      await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await this.randomDelay(3000, 5000);

      // Extract profile data
      const profileData = await page.evaluate(() => {
        const getName = () => {
          const nameEl = document.querySelector('h1.text-heading-xlarge') ||
                        document.querySelector('h1[data-test="profile-name"]') ||
                        document.querySelector('.pv-text-details__name h1');
          return nameEl?.textContent?.trim() || '';
        };

        const getHeadline = () => {
          const headlineEl = document.querySelector('.text-body-medium.break-words') ||
                            document.querySelector('.pv-text-details__headline') ||
                            document.querySelector('[data-test="profile-headline"]');
          return headlineEl?.textContent?.trim() || '';
        };

        const getAbout = () => {
          const aboutEl = document.querySelector('#about ~ .pv-shared-text-with-see-more span[aria-hidden="true"]') ||
                         document.querySelector('.pv-about__summary-text span') ||
                         document.querySelector('.summary-text span');
          return aboutEl?.textContent?.trim() || '';
        };

        const getContactInfo = () => {
          const contactEls = document.querySelectorAll('a[href*="mailto:"]');
          const emails = Array.from(contactEls).map(el => 
            (el as HTMLAnchorElement).href.replace('mailto:', '')
          );
          return emails[0] || '';
        };

        return {
          name: getName(),
          headline: getHeadline(),
          about: getAbout(),
          email: getContactInfo()
        };
      });

      // Extract email from text content if not found in contact info
      const bioText = `${profileData.headline} ${profileData.about}`;
      const email = profileData.email || this.extractEmailFromText(bioText);
      
      if (email && this.shouldIncludeProfile(bioText)) {
        return {
          profileName: profileData.name,
          profileUrl,
          platform: 'linkedin',
          bioText,
          email,
          emailSource: profileData.email ? 'bio' : 'bio'
        };
      }

    } catch (error) {
      console.error(`Error scraping LinkedIn profile ${profileUrl}:`, error);
    }

    return null;
  }

  protected extractEmailFromText(text: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  }
}