import { gkTodayScraper } from '../src/scrapers/gktoday';
import { formatMobileHTML } from '../src/formatters/html';
import { translator } from '../src/translators/google';
import { categoryCache } from '../src/db/categories';
import { insertNews, generateSlug, calculateReadTime, NewsInsert } from '../src/db/news';
import { applyNewsTemplate } from '../src/formatters/template';
import { logger } from '../src/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

async function pushTestArticles() {
  const urls = [
    'https://www.gktoday.in/ins-nireekshak-visits-sri-lanka-for-joint-naval-training/',
    'https://www.gktoday.in/pakistan-tests-taimoor-anti-ship-cruise-missile/',
    'https://www.gktoday.in/ogai-to-regulate-indias-online-gaming-sector-from-may/'
  ];

  logger.info(`[TestPush] Initializing category cache...`);
  await categoryCache.init();

  for (const url of urls) {
    try {
      logger.info(`[TestPush] Processing: ${url}`);
      
      // 1. Scrape
      const details = await gkTodayScraper.scrapeArticle(url);
      if (!details.body) {
        logger.error(`[TestPush] Failed to scrape body for ${url}`);
        continue;
      }

      // 2. Format
      const formattedEn = formatMobileHTML(details.body);

      // 3. Translate
      logger.info(`[TestPush] Translating...`);
      const titleGu = await translator.translate(details.title || 'GKToday Article');
      const bodyGu = await translator.translate(formattedEn);
      
      if (!titleGu || !bodyGu) {
        logger.warn(`[TestPush] Translation failed for ${url}`);
        continue;
      }

      // 4. Template
      logger.info(`[TestPush] Applying premium template...`);
      const templatedHtml = applyNewsTemplate({
        title_gu: titleGu,
        category: details.category || 'Current Affairs',
        url: url,
        body_gu: bodyGu,
        image_url: details.imageUrl || ''
      });

      // 5. Prepare Payload
      const catSlug = categoryCache.getSlugFromText(details.category || '');
      const categoryId = categoryCache.getUuid(catSlug);

      const newsInsert: NewsInsert = {
        title: titleGu, // App uses title for display
        title_gu: titleGu,
        body: templatedHtml, // App uses body for display
        body_gu: templatedHtml,
        image_url: details.imageUrl || null,
        source: 'GKToday',
        source_url: url,
        category: details.category || 'Current Affairs',
        category_id: categoryId,
        published_at: details.date || new Date().toISOString(),
        is_active: true,
        is_featured: false,
        is_translated: true,
        translated_at: new Date().toISOString(),
        translation_source: 'google',
        content_type: 'html',
        tags: details.tags || [],
        slug: generateSlug(details.title || 'article', details.date || new Date().toISOString()),
        read_time_minutes: calculateReadTime(templatedHtml)
      };

      // 6. Push to Supabase (Upsert)
      logger.info(`[TestPush] Pushing to Supabase...`);
      const success = await insertNews(newsInsert);
      
      if (success) {
        logger.info(`[TestPush] SUCCESS: ${url}`);
      } else {
        logger.error(`[TestPush] FAILED to insert: ${url}`);
      }

    } catch (err) {
      logger.error(`[TestPush] Error processing ${url}:`, err);
    }
  }

  process.exit(0);
}

pushTestArticles().catch(err => {
  console.error(err);
  process.exit(1);
});
