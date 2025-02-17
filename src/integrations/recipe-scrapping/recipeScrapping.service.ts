import { Service } from 'typedi';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AllowedSitesType } from './recipeScrapping.types';
import RecipeScrappingUtil from './recipeScrapping.util';
import { log } from 'console';

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
    log('Extracted Times: ', times);

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
  extractTitle($: cheerio.CheerioAPI): string {
    const title: string = $('.pantry--title-display').text().trim();
    log('Extracted Title: ', title);
    return title;
  }
  extractDescription($: cheerio.CheerioAPI): string {
    const description: string = $('.topnote_topnoteParagraphs__A3OtF')
      .text()
      .trim();
    log('Extracted Description: ', description);
    return description;
  }
  extractIngredients($: cheerio.CheerioAPI) {
    const ingredients: Array<{ quantity: string; textData: string }> = [];

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $('.ingredient_ingredient__rfjvs').each((_, item) => {
      const quantityElements = $(item).find('.ingredient_quantity__Z_Mvw');
      const quantity = quantityElements.text().trim();
      const textData = $(item).text().trim();
      const ingredient = { quantity, textData };
      ingredients.push(ingredient);
    });
    log('Extracted Ingrédient: ', ingredients);

    return ingredients;
  }
  extractSteps($: cheerio.CheerioAPI) {
    const steps: Record<string, string> = {};

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $('.preparation_step__nzZHP').each((_, item) => {
      const stepTitleElmt = $(item).find('.preparation_stepNumber__qWIz4');
      const title = stepTitleElmt.text().trim();
      const description = $(item).text().trim();

      steps[title] = description;
    });
    log('Extracted Steps: ', steps);

    return steps;
  }

  async getData(url: string): Promise<any> {
    try {
      this.checkUrl(url); // Validate the URL before proceeding

      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const title = this.extractTitle($);
      const description = this.extractDescription($);
      const times = this.extractTimes($);

      const ingredients = this.extractIngredients($);
      const steps = this.extractSteps($);
      return { title, description, times, ingredients, steps };
    } catch (error) {
      throw new Error(`Scraping Error: ${(error as Error).message}`);
    }
  }
}
