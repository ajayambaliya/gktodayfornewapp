import axios from 'axios';
import { logger } from '../utils/logger';

export interface RawArticle {
  title: string;
  url: string;
  date: string;
  imageUrl: string | null;
  excerpt: string;
  category?: string;
  body?: string;
  tags?: string[];
}

export abstract class BaseScraper {
  protected userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  protected async fetch(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000,
      });
      return data;
    } catch (error) {
      logger.error(`[BaseScraper] Error fetching URL: ${url}`, error);
      throw error;
    }
  }

  abstract scrapeListing(pages: number): Promise<RawArticle[]>;
  abstract scrapeArticle(url: string): Promise<Partial<RawArticle>>;
}
