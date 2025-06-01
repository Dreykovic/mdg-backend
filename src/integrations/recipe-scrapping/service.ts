import { Service } from 'typedi';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AllowedSitesType } from './types';
import RecipeScrappingUtil from './util';
import { allowedSitesSelectorsConfig, SiteSelectorConfig } from './config';
import logger from '@/core/utils/logger.util';

@Service()
export default class RecipeScrappingService {
  // Store allowed sites in a Set for faster lookup
  private readonly allowedSites = new Set<AllowedSitesType>([
    'allrecipes.com',
    'cooking.nytimes.com',
    'simplyrecipes.com',
  ]);
  constructor(private readonly recipeScrappingUtil: RecipeScrappingUtil) {}
  // Validate if the URL belongs to an allowed site
  checkUrl(link: string): string {
    const domain = this.recipeScrappingUtil.extractDomain(link);
    const isValidSite = this.allowedSites.has(domain as AllowedSitesType);
    if (
      domain === null ||
      domain === undefined ||
      domain === '' ||
      !isValidSite
    ) {
      throw new Error(
        'Invalid URL. Please provide a valid URL from allowed sites.'
      );
    } else {
      return domain;
    }
  }

  extractTimes = (
    $: cheerio.CheerioAPI,
    config: SiteSelectorConfig
  ): Record<string, number | null> => {
    logger.debug(config);
    const extractedTimes: Record<string, string> = {};

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $(config.times.label).each((_, item) => {
      const label = $(item).text().trim();
      const value = $(item).next(config.times.next).text().trim();

      if (label && value) {
        extractedTimes[label] = value;
      }
    });
    logger.debug('Extracted Times: ', extractedTimes);
    const times: Record<string, number | null> = {};
    for (const [key, value] of Object.entries(extractedTimes)) {
      times[key] = this.recipeScrappingUtil.convertTimeToMinutes(value);
    }
    return times;
  };

  // Fetch and scrape data from a given URL
  extractTitle($: cheerio.CheerioAPI, config: SiteSelectorConfig): string {
    const title: string = $(config.title).text().trim();
    logger.debug('Extracted Title: ', title);
    return title;
  }
  extractServings(
    $: cheerio.CheerioAPI,
    config: SiteSelectorConfig
  ): number | null {
    const extractedServings: string = $(config.servings).text().trim();
    logger.debug('Extracted Servigns: ', extractedServings);
    const servings = this.recipeScrappingUtil.parseServings(extractedServings);
    return servings;
  }
  extractDescription(
    $: cheerio.CheerioAPI,
    config: SiteSelectorConfig
  ): string {
    const description: string = $(config.description).text().trim();
    logger.debug('Extracted Description: ', description);
    return description;
  }
  extractIngredients(
    $: cheerio.CheerioAPI,
    config: SiteSelectorConfig
  ): Array<{ quantity: number | null; unit: string | null; name: string }> {
    const extractedIngredients: Array<{
      quantity: string;
      unit: string;
      name: string;
    }> = [];

    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $(config.ingredients.list).each((_, item) => {
      const quantityElement = $(item).find(config.ingredients.quantity);
      const unitElement = $(item).find(config.ingredients.unit);
      const nameElement = $(item).find(config.ingredients.name);
      const quantity = quantityElement.text().trim();
      const unit = $(unitElement).text().trim();
      const name = $(nameElement).text().trim();
      const ingredient = { quantity, unit, name };
      extractedIngredients.push(ingredient);
    });
    logger.debug('Extracted Ingrédient: ', extractedIngredients);
    const ingredients = extractedIngredients.map(
      ({ quantity, unit, name }) => ({
        quantity: quantity
          ? this.recipeScrappingUtil.normalizeQuantity(quantity)
          : null,
        unit: this.recipeScrappingUtil.cleanUnit(unit) || null,
        name,
      })
    );
    return ingredients;
  }
  extractSteps(
    $: cheerio.CheerioAPI,
    config: SiteSelectorConfig
  ): Record<string, string> {
    const steps: Record<string, string> = {};
    let index = 0;
    // Loop through all `<dt>` elements (labels) and extract corresponding `<dd>` values (times)
    $(config.steps.list).each((_, item) => {
      const title = `Step ${++index}`;
      const stepDescriptionElmt = $(item).find(config.steps.description);

      logger.debug(
        'Extracted Step description: ',
        stepDescriptionElmt.before().text()
      );

      const description = stepDescriptionElmt.text().trim();

      steps[title] = description;
    });
    logger.debug('Extracted Steps: ', steps);

    return steps;
  }

  async extractRecipeData(url: string): Promise<any> {
    try {
      const domain: AllowedSitesType = this.checkUrl(url) as AllowedSitesType; // Validate the URL before proceeding

      const { data } = await axios.get(url);
      const urlSelectConfig = allowedSitesSelectorsConfig[domain];
      const $ = cheerio.load(data);
      const title = this.extractTitle($, urlSelectConfig);
      const servings = this.extractServings($, urlSelectConfig);
      const description = this.extractDescription($, urlSelectConfig);
      const times = this.extractTimes($, urlSelectConfig);

      const ingredients = this.extractIngredients($, urlSelectConfig);
      const steps = this.extractSteps($, urlSelectConfig);
      return { title, description, servings, times, ingredients, steps };
    } catch (error) {
      throw new Error(`Scraping Error: ${(error as Error).message}`);
    }
  }
}
