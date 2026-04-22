import * as cheerio from 'cheerio';
import { BaseScraper, RawArticle } from './base';
import { CONFIG } from '../config';
import { logger } from '../utils/logger';

export class GKTodayScraper extends BaseScraper {
  async scrapeListing(pages: number = 3): Promise<RawArticle[]> {
    const articles: RawArticle[] = [];
    
    for (let i = 1; i <= pages; i++) {
      const url = i === 1 
        ? CONFIG.GK_TODAY_URL 
        : `${CONFIG.GK_TODAY_URL}page/${i}/`;
      
      logger.info(`[GKToday] Scraping listing page ${i}: ${url}`);
      
      try {
        const html = await this.fetch(url);
        const $ = cheerio.load(html);
        
        const container = $(CONFIG.LISTING.mainContainer);
        const items = container.find(CONFIG.LISTING.articleItem);
        
        items.each((_, el) => {
          const $item = $(el);
          const $link = $item.find(CONFIG.LISTING.articleUrl);
          
          const title = $link.text().trim();
          const articleUrl = $link.attr('href') || '';
          const dateText = $item.find(CONFIG.LISTING.articleDate).text().trim();
          const $img = $item.find(CONFIG.LISTING.articleImage).first();
          const imageUrl = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src') || null;
          
          // Excerpt is text inside post-data but not in h3 or meta
          const $postData = $item.find(CONFIG.LISTING.articleExcerpt);
          const excerpt = $postData.clone().children('h3, p.home-post-data-meta').remove().end().text().trim();

          if (articleUrl) {
            // Skip quiz URLs
            if (articleUrl.includes('daily-current-affairs-quiz')) {
              logger.debug(`[GKToday] Skipping quiz URL: ${articleUrl}`);
              return;
            }

            articles.push({
              title,
              url: articleUrl,
              date: this.parseDate(dateText),
              imageUrl,
              excerpt
            });
          }
        });

        if (i < pages) {
          logger.debug(`[GKToday] Waiting ${CONFIG.DELAY_BETWEEN_PAGES_MS}ms before next page`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_PAGES_MS));
        }
      } catch (error) {
        logger.error(`[GKToday] Error on listing page ${i}:`, error);
      }
    }

    return articles;
  }

  async scrapeArticle(url: string): Promise<Partial<RawArticle>> {
    logger.info(`[GKToday] Scraping article: ${url}`);
    
    try {
      const html = await this.fetch(url);
      const $ = cheerio.load(html);
      
      const main = $(CONFIG.ARTICLE.mainContent);
      const content = main.find(CONFIG.ARTICLE.contentBody).first();
      
      if (content.length === 0) {
        logger.error(`[GKToday] Could not find content body for ${url}`);
        return {};
      }

      // Extract first image from content or main container as a fallback
      // Look for featured image first, then any image in content
      const featuredImg = main.find('img.post-featured-image, img.wp-post-image').first();
      const firstImg = content.find('img').first();
      
      const targetImg = featuredImg.length > 0 ? featuredImg : firstImg;
      const fallbackImageUrl = targetImg.attr('src') || targetImg.attr('data-src') || targetImg.attr('data-lazy-src') || null;

      // Remove unwanted elements
      CONFIG.ARTICLE.toRemove.forEach(selector => {
        content.find(selector).remove();
      });

      const body = content.html() || '';
      const title = main.find(CONFIG.ARTICLE.title).first().text().trim();
      
      const tags: string[] = [];
      main.find(CONFIG.ARTICLE.tags).each((_, el) => {
        tags.push($(el).text().trim());
      });

      const category = main.find(CONFIG.ARTICLE.category).first().text().trim();

      const result: Partial<RawArticle> = {
        title,
        body,
        tags,
        category,
      };

      if (fallbackImageUrl) {
        result.imageUrl = fallbackImageUrl;
      }

      return result;
    } catch (error) {
      logger.error(`[GKToday] Error on article ${url}:`, error);
      return {};
    }
  }

  private parseDate(dateStr: string): string {
    // Format: "April 21, 2026"
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return new Date().toISOString();
      }
      return d.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}

export const gkTodayScraper = new GKTodayScraper();
