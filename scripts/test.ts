import { gkTodayScraper } from '../src/scrapers/gktoday';
import { formatMobileHTML } from '../src/formatters/html';
import { translator } from '../src/translators/google';
import { categoryCache } from '../src/db/categories';
import { generateSlug, calculateReadTime } from '../src/db/news';
import { logger } from '../src/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

async function testUrl() {
  const args = process.argv.slice(2);
  const url = args.find(arg => !arg.startsWith('--')) || 'https://www.gktoday.in/current-affairs/arthur-law-named-2026-world-economic-forum-young-global-leader/';

  logger.info(`[Test] Testing URL: ${url}`);
  
  await categoryCache.init();
  
  // 1. Scrape
  const details = await gkTodayScraper.scrapeArticle(url);
  if (!details.body) {
    logger.error('[Test] Failed to scrape body');
    return;
  }

  // 2. Format
  const formatted = formatMobileHTML(details.body);
  logger.info('[Test] Formatted HTML (first 500 chars):');
  console.log(formatted.substring(0, 500));

  // 3. Translate
  logger.info('[Test] Translating title and body...');
  const titleGu = await translator.translate(details.title || 'Sample Title');
  const bodyGu = await translator.translate(formatted);

  logger.info(`[Test] Translated Title: ${titleGu}`);
  logger.info('[Test] Translated Body (first 200 chars):');
  console.log(bodyGu?.substring(0, 200));

  // 4. Payload Preview
  const payload = {
    title: details.title || 'Sample Title',
    title_gu: titleGu,
    body: formatted,
    body_gu: bodyGu,
    category: details.category,
    detected_category_id: categoryCache.getUuid(categoryCache.getSlugFromText(details.category || '')),
    slug: generateSlug(details.title || 'Sample Title', new Date().toISOString()),
    read_time: calculateReadTime(formatted),
    tags: details.tags
  };

  logger.info('[Test] Would insert payload:');
  console.log(JSON.stringify(payload, null, 2));
}

testUrl().catch(console.error);
