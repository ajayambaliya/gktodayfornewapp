import { logger } from './utils/logger';
import { categoryCache } from './db/categories';
import { gkTodayScraper } from './scrapers/gktoday';
import { formatMobileHTML } from './formatters/html';
import { translator } from './translators/google';
import { insertNews, checkExists, generateSlug, calculateReadTime, NewsInsert } from './db/news';
import { applyNewsTemplate } from './formatters/template';
import { CONFIG } from './config';
import { scheduleDailyScrape } from './scheduler/cron';
import { historyManager } from './utils/history';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  logger.info('=== GKToday News Scraper Initializing ===');
  
  // Initialize caches
  await categoryCache.init();
  await historyManager.init();
  
  const scrapeOnStart = process.env.SCRAPE_ON_START === 'true';
  
  if (scrapeOnStart) {
    logger.info('[Main] SCRAPE_ON_START is true. Running initial scrape...');
    await runScraper();
  }

  // Start scheduler
  scheduleDailyScrape(runScraper);
  
  logger.info(`[Main] Scheduler started. Cron: ${process.env.CRON_SCHEDULE || '0 1 * * *'}`);
}

export async function runScraper(pages: number = CONFIG.PAGES_TO_SCRAPE) {
  logger.info(`[Main] Starting scrape run for ${pages} pages...`);
  
  try {
    // 1. Get listings
    const articles = await gkTodayScraper.scrapeListing(pages);
    logger.info(`[Main] Found ${articles.length} articles in listing`);

    let newCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // 2. Process each article
    for (const article of articles) {
      try {
        // Check history first (local/gist)
        if (historyManager.isScraped(article.url)) {
          logger.debug(`[Main] Skipping already scraped URL (History): ${article.url}`);
          skipCount++;
          continue;
        }

        // Check DB as second layer
        const exists = await checkExists(article.url);
        if (exists) {
          logger.debug(`[Main] Skipping existing article (DB): ${article.url}`);
          historyManager.addUrl(article.url); // Sync history if it exists in DB but not in history
          await historyManager.saveHistory();
          skipCount++;
          continue;
        }

        // Delay to be respectful
        await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_BETWEEN_REQUESTS_MS));

        // Scrape detail
        const details = await gkTodayScraper.scrapeArticle(article.url);
        const fullArticle = { ...article, ...details };

        if (!fullArticle.body) {
          logger.warn(`[Main] Empty body for article: ${article.url}`);
          errorCount++;
          continue;
        }

        // Format HTML (English)
        const formattedBodyEn = formatMobileHTML(fullArticle.body);
        
        // Translation
        let titleGu = null;
        let bodyGu = null;
        let isTranslated = false;

        if (CONFIG.TRANSLATE_TO_GUJARATI) {
          logger.info(`[Main] Translating: ${fullArticle.title}`);
          titleGu = await translator.translate(fullArticle.title);
          bodyGu = await translator.translate(formattedBodyEn); // Translate formatted HTML
          isTranslated = !!(titleGu && bodyGu);
        }

        // Determine category
        const catSlug = categoryCache.getSlugFromText(fullArticle.category || fullArticle.excerpt);
        const categoryId = categoryCache.getUuid(catSlug);

        // Prepare Insert
        const newsInsert: NewsInsert = {
          title: fullArticle.title,
          title_gu: titleGu,
          body: formattedBodyEn,
          body_gu: bodyGu,
          image_url: fullArticle.imageUrl,
          source: 'GKToday',
          source_url: fullArticle.url,
          category: fullArticle.category || 'Current Affairs',
          category_id: categoryId,
          published_at: fullArticle.date,
          is_active: true,
          is_featured: false,
          is_translated: isTranslated,
          translated_at: isTranslated ? new Date().toISOString() : null,
          translation_source: 'google',
          content_type: 'html',
          tags: fullArticle.tags || [],
          slug: generateSlug(fullArticle.title, fullArticle.date),
          read_time_minutes: calculateReadTime(formattedBodyEn)
        };

        // Apply Beautiful Template to Gujarati Body
        if (newsInsert.body_gu && isTranslated) {
          const templatedHtml = applyNewsTemplate({
            title_gu: titleGu || '',
            category: fullArticle.category || 'Current Affairs',
            url: fullArticle.url,
            body_gu: bodyGu || '',
            image_url: fullArticle.imageUrl || ''
          });
          
          newsInsert.body_gu = templatedHtml;
          
          // Force main fields to Gujarati so the app displays it
          newsInsert.title = titleGu || newsInsert.title;
          newsInsert.body = templatedHtml;
        }

        // Insert to DB
        const success = await insertNews(newsInsert);
        if (success) {
          logger.info(`[Main] Successfully inserted: ${fullArticle.title}`);
          historyManager.addUrl(article.url);
          await historyManager.saveHistory();
          newCount++;
        } else {
          skipCount++;
        }

      } catch (err) {
        logger.error(`[Main] Error processing article ${article.url}:`, err);
        errorCount++;
      }
    }

    logger.info(`[Main] Run complete: ${newCount} new, ${skipCount} skipped, ${errorCount} errors`);

  } catch (err) {
    logger.error('[Main] Critical error in scraper run:', err);
  }
}

if (require.main === module) {
  main().catch(err => {
    logger.error('[Main] Fatal initialization error:', err);
    process.exit(1);
  });
}
