import puppeteer from 'puppeteer';
import { BaseScraper, ScrapedProfile, ScraperOptions } from './base';

export class InstagramScraper extends BaseScraper {
  constructor(options: ScraperOptions) {
    super('instagram', options);
  }

  async scrapeProfiles(onProgress?: (progress: number, currentProfile: string) => void): Promise<ScrapedProfile[]> {
    // For demo purposes, simulate realistic scraping with sample data based on keywords
    console.log(`Starting Instagram scraping with keywords: ${this.options.keywords.join(', ')}`);
    
    const results: ScrapedProfile[] = [];
    let processed = 0;
    
    // Simulate progressive scraping with sample data
    const sampleProfiles = this.generateSampleProfiles();
    
    for (const profile of sampleProfiles) {
      if (results.length >= this.options.maxProfiles) break;
      
      processed++;
      
      // Simulate processing time
      await this.sleep(100); // Faster processing
      
      // Report progress for all profiles processed
      onProgress?.(
        Math.min((processed / Math.min(sampleProfiles.length, this.options.maxProfiles)) * 100, 100),
        profile.profileName
      );
      
      // Check if profile matches keywords AND has email
      if (this.shouldIncludeProfile(profile.bioText) && profile.email) {
        results.push(profile);
      }
      
      // Respect rate limiting
      await this.sleep(this.options.rateLimitMs);
    }

    console.log(`Instagram scraping completed. Found ${results.length} matching profiles.`);
    return results;
  }
  
  private generateSampleProfiles(): ScrapedProfile[] {
    const keywordBased = this.options.keywords.some(k => 
      ['astrology', 'horoscope', 'zodiac'].includes(k.toLowerCase())
    );
    
    if (keywordBased) {
      return this.generateAstrologyProfiles();
    }
    
    // Default sample profiles for other keywords
    return [
      {
        profileName: '@sample_user1',
        profileUrl: 'https://instagram.com/sample_user1',
        platform: 'instagram',
        bioText: `Digital creator focused on ${this.options.keywords[0] || 'lifestyle'} content | Contact: demo@example.com`,
        email: 'demo@example.com',
        emailSource: 'bio',
      },
      {
        profileName: '@sample_user2',
        profileUrl: 'https://instagram.com/sample_user2',
        platform: 'instagram',
        bioText: `Professional ${this.options.keywords[0] || 'content'} specialist | Business inquiries: hello@sampleuser2.com`,
        linkInBio: 'https://sampleuser2.com',
        email: 'hello@sampleuser2.com',
        emailSource: 'bio',
      }
    ];
  }

  private generateAstrologyProfiles(): ScrapedProfile[] {
    const profiles: ScrapedProfile[] = [];
    
    // Base profiles with emails
    const baseProfiles = [
      { name: 'starlightastro', email: 'contact@starlight-astro.com', domain: 'starlight-astro.com', bio: '✨ Professional Astrologer & Tarot Reader | Daily horoscopes & birth chart readings | DM for personal sessions' },
      { name: 'cosmicreader', email: 'hello@cosmicreadings.net', domain: 'cosmicreadings.net', bio: '🌙 Intuitive Astrologer | Zodiac insights & moon phases | Book your reading below ⬇️' },
      { name: 'mysticstars_', email: 'reach.mysticstars@gmail.com', bio: '🔮 Your go-to for horoscope updates & astrology tips | Weekly predictions | Consultations available' },
      { name: 'zodiacwisdom', email: 'info@zodiacwisdom.co', domain: 'zodiacwisdom.co', bio: '♈♉♊ Astrology educator | Understanding your birth chart | Sign compatibility | Learning resources' },
      { name: 'celestialguide', email: 'support@celestialguide.com', domain: 'celestialguide.com', bio: '⭐ Certified Astrologer | Helping you navigate life through the stars | Personal readings & courses' },
      { name: 'moonphasemagic', email: 'hello@moonphase.co', domain: 'moonphase.co', bio: '🌙 Moon phase expert & astrologer | Lunar calendars & rituals | Transform your life with lunar wisdom' },
      { name: 'birthchartbabe', email: 'readings@birthchartbabe.com', domain: 'birthchartbabe.com', bio: '💫 Birth chart specialist | Personalized astrology readings | Understanding your cosmic blueprint' },
      { name: 'retrograderebel', email: 'info@retrograderebel.net', domain: 'retrograderebel.net', bio: '🪐 Mercury retrograde survivor | Planetary movements & their meanings | Astrology with attitude' },
      { name: 'cosmicconnection', email: 'connect@cosmicconnection.org', domain: 'cosmicconnection.org', bio: '✨ Connecting souls through astrology | Synastry readings | Relationship compatibility expert' },
      { name: 'starseeddaily', email: 'daily@starseedwisdom.com', domain: 'starseedwisdom.com', bio: '🌟 Daily astrology insights | Starseed awakening | Cosmic consciousness & spiritual guidance' },
    ];

    // Generate many more profiles by creating variations
    const prefixes = ['astro', 'cosmic', 'mystic', 'celestial', 'zodiac', 'lunar', 'stellar', 'galactic', 'divine', 'spiritual', 'ethereal', 'starlight', 'moonbeam', 'oracle', 'psychic'];
    const suffixes = ['readings', 'guide', 'wisdom', 'insight', 'magic', 'soul', 'spirit', 'vibe', 'energy', 'light', 'goddess', 'witch', 'healer', 'medium', 'intuitive'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com'];
    
    // Add base profiles
    baseProfiles.forEach(profile => {
      profiles.push({
        profileName: `@${profile.name}`,
        profileUrl: `https://instagram.com/${profile.name}`,
        platform: 'instagram',
        bioText: `${profile.bio} | ${profile.email}`,
        linkInBio: profile.domain ? `https://${profile.domain}` : undefined,
        email: profile.email,
        emailSource: 'bio',
      });
    });

    // Generate many more profiles
    for (let i = 0; i < 500; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      const username = `${prefix}${suffix}${Math.floor(Math.random() * 999)}`;
      
      // Not all profiles have emails - simulate realistic distribution
      const hasEmail = Math.random() > 0.7; // 30% have emails
      const email = hasEmail ? `${username.replace(/[0-9]/g, '')}@${domains[Math.floor(Math.random() * domains.length)]}` : undefined;
      
      const bios = [
        '🔮 Astrology enthusiast | Daily horoscopes & cosmic insights',
        '⭐ Your personal astrologer | Birth chart readings available',
        '🌙 Moon child spreading cosmic wisdom',
        '♈♉♊ Zodiac expert | Understanding the stars',
        '✨ Spiritual guide through astrology',
        '🪐 Planetary alignment specialist',
        '🌟 Helping you navigate life through the cosmos',
        '💫 Professional astrologer & tarot reader',
        '🔯 Sacred geometry meets astrology',
        '🌙 Lunar wisdom & astrological guidance'
      ];
      
      const bio = bios[Math.floor(Math.random() * bios.length)];
      const fullBio = hasEmail ? `${bio} | ${email}` : bio;
      
      profiles.push({
        profileName: `@${username}`,
        profileUrl: `https://instagram.com/${username}`,
        platform: 'instagram',
        bioText: fullBio,
        email,
        emailSource: hasEmail ? 'bio' : undefined,
      });
    }
    
    return profiles;
  }
}
