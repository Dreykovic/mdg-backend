import { Service } from 'typedi';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AllowedSitesType } from './recipeScrapping.types';

@Service()
export default class RecipeScrappingService {
  // Store allowed sites in a Set for faster lookup
  private allowedSites = new Set<AllowedSitesType>([
    'allrecipes.com',
    'cooking.nytimes.com',
    'simplyrecipes.com',
  ]);

  // Check if a given URL belongs to an allowed site
  private isValidSite(domain: string): boolean {
    return this.allowedSites.has(domain as AllowedSitesType);
  }

  // Extract the domain name from a URL
  private extractDomain(url: string): string | undefined | null {
    const match = url.match(/^(?:https?:\/\/)?([^/]+)/);
    return match ? match[1] : null;
  }

  // Validate if the URL belongs to an allowed site
  checkUrl(link: string): void {
    const domain = this.extractDomain(link);
    if (!domain || !this.isValidSite(domain)) {
      throw new Error(
        'Invalid URL. Please provide a valid URL from allowed sites.'
      );
    }
  }

  // Fetch and scrape data from a given URL
  async getData(url: string): Promise<string[]> {
    try {
      this.checkUrl(url); // Validate the URL before proceeding

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Extract all h1 titles
      return $('h1')
        .map((_, element) => $(element).text().trim())
        .get();
    } catch (error) {
      throw new Error(`Scraping Error: ${(error as Error).message}`);
    }
  }
}
