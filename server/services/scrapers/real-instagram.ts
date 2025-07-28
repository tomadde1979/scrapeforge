import puppeteer, { Browser, Page } from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class RealInstagramScraper extends BaseScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor(options: ScraperOptions) {
    super('real-instagram', options);
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    console.log('Starting REAL Instagram scraping with keywords:', this.options.keywords.join(', '));
    
    const results: ScrapedProfile[] = [];
    let processed = 0;

    try {
      // Launch browser with stealth settings for Replit
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
      
      // Set viewport and user agent for stealth
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Navigate to Instagram
      await this.page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
      await this.sleep(2000);

      // Search for each keyword
      for (const keyword of this.options.keywords) {
        if (results.length >= this.options.maxProfiles) break;

        console.log(`Searching for keyword: ${keyword}`);
        onProgress?.(processed / this.options.maxProfiles * 100, `Searching: ${keyword}`);

        // Navigate to search
        await this.page.goto(`https://www.instagram.com/explore/tags/${keyword.toLowerCase()}/`, { 
          waitUntil: 'networkidle2' 
        });
        await this.sleep(3000);

        // Extract post links from hashtag page
        const postLinks = await this.extractPostLinks();
        console.log(`Found ${postLinks.length} posts for keyword: ${keyword}`);

        // Process each post to find profiles
        for (const postLink of postLinks) {
          if (results.length >= this.options.maxProfiles) break;

          try {
            const profile = await this.scrapeProfileFromPost(postLink);
            if (profile && profile.email) {
              results.push(profile);
              processed++;
              onProgress?.(processed / this.options.maxProfiles * 100, profile.profileName);
              console.log(`Found email: ${profile.email} from ${profile.profileName}`);
            }
          } catch (error) {
            console.log(`Error processing post ${postLink}:`, error.message);
          }

          // Rate limiting
          await this.sleep(this.options.rateLimitMs);
        }
      }

    } catch (error) {
      console.error('Instagram scraping error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }

    console.log(`Real Instagram scraping completed. Found ${results.length} profiles with emails.`);
    return results;
  }

  private async extractPostLinks(): Promise<string[]> {
    try {
      // Wait for posts to load
      await this.page.waitForSelector('article a[href*="/p/"]', { timeout: 10000 });
      
      // Extract post URLs
      const postLinks = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('article a[href*="/p/"]'));
        return links.slice(0, 20).map(link => (link as HTMLAnchorElement).href);
      });

      return postLinks;
    } catch (error) {
      console.log('Could not extract post links, trying alternative method');
      return [];
    }
  }

  private async scrapeProfileFromPost(postUrl: string): Promise<ScrapedProfile | null> {
    try {
      // Navigate to post
      await this.page.goto(postUrl, { waitUntil: 'networkidle2' });
      await this.sleep(2000);

      // Extract profile username from post
      const profileData = await this.page.evaluate(() => {
        // Try to find the profile link
        const profileLink = document.querySelector('article header a[href^="/"]');
        if (!profileLink) return null;

        const href = profileLink.getAttribute('href');
        if (!href) return null;
        
        const username = href.replace('/', '') || '';
        const profileUrl = `https://instagram.com/${username}`;
        
        return { username, profileUrl };
      });

      if (!profileData) return null;

      // Navigate to profile page
      await this.page.goto(profileData.profileUrl, { waitUntil: 'networkidle2' });
      await this.sleep(2000);

      // Extract bio and contact info
      const profileInfo = await this.page.evaluate(() => {
        // Try to find bio text
        const bioElement = document.querySelector('section main div div div span, section main div h1 + div span');
        const bioText = bioElement?.textContent || '';

        // Try to find external link
        const linkElement = document.querySelector('section main div a[href^="http"]');
        const href = linkElement?.getAttribute('href');
        const linkInBio = href || undefined;

        return { bioText, linkInBio };
      });

      // Extract email from bio
      const email = this.extractEmailFromText(profileInfo.bioText);
      
      // Navigate back to avoid issues
      await this.page.goto(profileData.profileUrl, { waitUntil: 'networkidle2' });
      
      // If no email in bio, try to extract from link in bio
      let finalEmail = email;
      let emailSource: 'bio' | 'bio_link' = 'bio';

      if (!email && profileInfo.linkInBio) {
        try {
          await this.page.goto(profileInfo.linkInBio, { waitUntil: 'networkidle2', timeout: 10000 });
          await this.sleep(2000);

          const linkPageText = await this.page.evaluate(() => document.body?.textContent || '');
          const linkEmail = this.extractEmailFromText(linkPageText);
          
          if (linkEmail) {
            finalEmail = linkEmail;
            emailSource = 'bio_link';
          }
        } catch (error) {
          console.log('Could not access link in bio:', profileInfo.linkInBio);
        }
      }

      if (!finalEmail) return null;

      return {
        profileName: `@${profileData.username}`,
        profileUrl: profileData.profileUrl,
        platform: 'instagram',
        bioText: profileInfo.bioText,
        linkInBio: profileInfo.linkInBio,
        email: finalEmail,
        emailSource,
      };

    } catch (error) {
      console.log('Error scraping profile from post:', error.message);
      return null;
    }
  }
}