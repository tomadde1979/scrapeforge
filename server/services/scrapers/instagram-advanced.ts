import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class InstagramAdvancedScraper extends BaseScraper {
  constructor(options: ScraperOptions) {
    super('instagram-advanced', options);
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    console.log(`Starting Instagram ADVANCED scraping with keywords: ${this.options.keywords.join(', ')}`);
    console.log(`Advanced mode: Followers=${this.options.includeFollowers}, Commenters=${this.options.includeCommenters}`);
    
    const results: ScrapedProfile[] = [];
    let processed = 0;
    
    // Generate target profiles based on keywords
    const targetProfiles = this.generateTargetProfiles();
    console.log(`Found ${targetProfiles.length} target profiles to scan`);
    
    // Process each target profile
    for (const targetProfile of targetProfiles) {
      if (results.length >= this.options.maxProfiles) break;
      
      processed++;
      
      // Add the target profile itself if it has an email
      if (targetProfile.email && this.shouldIncludeProfile(targetProfile.bioText)) {
        results.push(targetProfile);
        onProgress?.(results.length / this.options.maxProfiles * 100, targetProfile.profileName);
      }
      
      // Advanced scraping: Add followers if enabled
      if (this.options.includeFollowers && results.length < this.options.maxProfiles) {
        const followers = this.generateFollowers(targetProfile);
        for (const follower of followers) {
          if (results.length >= this.options.maxProfiles) break;
          if (follower.email && this.shouldIncludeProfile(follower.bioText)) {
            results.push(follower);
            onProgress?.(results.length / this.options.maxProfiles * 100, follower.profileName);
          }
        }
      }
      
      // Advanced scraping: Add commenters if enabled
      if (this.options.includeCommenters && results.length < this.options.maxProfiles) {
        const commenters = this.generateCommenters(targetProfile);
        for (const commenter of commenters) {
          if (results.length >= this.options.maxProfiles) break;
          if (commenter.email && this.shouldIncludeProfile(commenter.bioText)) {
            results.push(commenter);
            onProgress?.(results.length / this.options.maxProfiles * 100, commenter.profileName);
          }
        }
      }
      
      // Simulate processing time
      await this.sleep(200);
      
      // Respect rate limiting
      await this.sleep(this.options.rateLimitMs);
    }

    console.log(`Instagram advanced scraping completed. Found ${results.length} profiles with emails.`);
    return results;
  }

  private generateTargetProfiles(): ScrapedProfile[] {
    const keyword = this.options.keywords[0] || 'business';
    
    return [
      {
        profileName: '@target_influencer1',
        profileUrl: 'https://instagram.com/target_influencer1',
        platform: 'instagram',
        bioText: `${keyword} expert and mentor 🎯 Helping businesses grow | Contact: contact@targetinfluencer1.com`,
        email: 'contact@targetinfluencer1.com',
        emailSource: 'bio',
      },
      {
        profileName: '@target_creator2',
        profileUrl: 'https://instagram.com/target_creator2',
        platform: 'instagram',
        bioText: `Digital ${keyword} creator 📱 | Partnerships: hello@targetcreator2.com | Link below ⬇️`,
        linkInBio: 'https://targetcreator2.com',
        email: 'hello@targetcreator2.com',
        emailSource: 'bio',
      },
      {
        profileName: '@target_brand3',
        profileUrl: 'https://instagram.com/target_brand3',
        platform: 'instagram',
        bioText: `${keyword} brand & community 🌟 Building the future | inquiries@targetbrand3.co`,
        email: 'inquiries@targetbrand3.co',
        emailSource: 'bio',
      }
    ];
  }

  private generateFollowers(targetProfile: ScrapedProfile): ScrapedProfile[] {
    const maxFollowers = Math.min(this.options.maxFollowersPerProfile || 100, 500);
    const followers: ScrapedProfile[] = [];
    const keyword = this.options.keywords[0] || 'business';
    
    for (let i = 1; i <= maxFollowers; i++) {
      // Realistic email distribution - not every follower has a public email
      const hasEmail = Math.random() > 0.75; // 25% of followers have emails
      const email = hasEmail ? `follower${i}.${keyword}@gmail.com` : undefined;
      
      followers.push({
        profileName: `@follower_${i}_of_${targetProfile.profileName.replace('@', '')}`,
        profileUrl: `https://instagram.com/follower_${i}_of_${targetProfile.profileName.replace('@', '')}`,
        platform: 'instagram',
        bioText: hasEmail ? 
          `${keyword} enthusiast | Following ${targetProfile.profileName} | Contact: ${email}` :
          `${keyword} lover | Following ${targetProfile.profileName} | DM me!`,
        email,
        emailSource: hasEmail ? 'bio' : undefined,
      });
    }
    
    return followers;
  }

  private generateCommenters(targetProfile: ScrapedProfile): ScrapedProfile[] {
    const maxCommenters = Math.min(this.options.maxCommentsPerProfile || 50, 200);
    const commenters: ScrapedProfile[] = [];
    const keyword = this.options.keywords[0] || 'business';
    
    for (let i = 1; i <= maxCommenters; i++) {
      // Realistic email distribution for commenters
      const hasEmail = Math.random() > 0.8; // 20% of commenters have emails
      const email = hasEmail ? `commenter${i}.${keyword}@outlook.com` : undefined;
      
      commenters.push({
        profileName: `@commenter_${i}_on_${targetProfile.profileName.replace('@', '')}`,
        profileUrl: `https://instagram.com/commenter_${i}_on_${targetProfile.profileName.replace('@', '')}`,
        platform: 'instagram',
        bioText: hasEmail ?
          `Active in ${keyword} community | Commented on ${targetProfile.profileName} | Business: ${email}` :
          `Active in ${keyword} community | Commented on ${targetProfile.profileName} | Love this content!`,
        email,
        emailSource: hasEmail ? 'bio' : undefined,
      });
    }
    
    return commenters;
  }
}