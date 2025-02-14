import { Service } from 'typedi';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AllowedSitesType } from './recipeScrapping.types';
import RecipeScrappingUtil from './recipeScrapping.util';

@Service()
export default class RecipeScrappingService {
  constructor(private readonly recipeScrappingUtil: RecipeScrappingUtil) {}
  extractTimes = ($: cheerio.CheerioAPI) => {
    const times: Record<string, string> = {};

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $('.stats_cookingTimeTable__b0moV dt').each((_, dt) => {
      const label = $(dt).text().trim();
      const value = $(dt).next('dd').text().trim();

      if (label && value) {
        times[label] = value;
      }
    });

    return times;
  };
  // Store allowed sites in a Set for faster lookup
  private allowedSites = new Set<AllowedSitesType>([
    'allrecipes.com',
    'cooking.nytimes.com',
    'simplyrecipes.com',
  ]);

  // Validate if the URL belongs to an allowed site
  checkUrl(link: string): void {
    const domain = this.recipeScrappingUtil.extractDomain(link);
    const isValidSite = this.allowedSites.has(domain as AllowedSitesType);
    if (!domain || !isValidSite) {
      throw new Error(
        'Invalid URL. Please provide a valid URL from allowed sites.'
      );
    }
  }

  // Fetch and scrape data from a given URL
  async getData(url: string): Promise<any> {
    try {
      this.checkUrl(url); // Validate the URL before proceeding

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const titles: string[] = [];
      const description: String = $('.topnote_topnoteParagraphs__A3OtF').text();
      $('h1').each((_, element) => {
        titles.push($(element).text());
      });
      const times = this.extractTimes($);

      return { titles, description, times };
    } catch (error) {
      throw new Error(`Scraping Error: ${(error as Error).message}`);
    }
  }
}
