export interface ScrapedProfile {
  profileName: string;
  profileUrl: string;
  platform: string;
  bioText: string;
  linkInBio?: string;
  email?: string;
  emailSource?: 'bio' | 'bio_link' | 'ai_parsed';
}

export interface ScraperOptions {
  keywords: string[];
  maxProfiles: number;
  rateLimitMs: number;
}

export abstract class BaseScraper {
  protected platform: string;
  protected options: ScraperOptions;

  constructor(platform: string, options: ScraperOptions) {
    this.platform = platform;
    this.options = options;
  }

  abstract scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]>;

  protected extractEmailFromText(text: string): string | null {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
  }

  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected shouldIncludeProfile(bioText: string): boolean {
    const lowercaseBio = bioText.toLowerCase();
    return this.options.keywords.some(keyword => 
      lowercaseBio.includes(keyword.toLowerCase())
    );
  }
}
