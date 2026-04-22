import { gkTodayScraper } from '../src/scrapers/gktoday';
import { formatMobileHTML } from '../src/formatters/html';
import { translator } from '../src/translators/google';
import { logger } from '../src/utils/logger';
import { applyNewsTemplate } from '../src/formatters/template';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function preview() {
  const args = process.argv.slice(2);
  const url = args.find(arg => !arg.startsWith('--')) || 'https://www.gktoday.in/lt-signs-green-ammonia-supply-deal-with-japan/';

  logger.info(`[Preview] Processing URL: ${url}`);
  
  // 1. Scrape
  const details = await gkTodayScraper.scrapeArticle(url);
  if (!details.body) {
    logger.error('[Preview] Failed to scrape body');
    return;
  }

  // 2. Format
  const formatted = formatMobileHTML(details.body);

  // 3. Translate
  logger.info('[Preview] Translating to Gujarati...');
  const titleGu = await translator.translate(details.title || 'Sample Title');
  const bodyGu = await translator.translate(formatted);

  // 4. Generate HTML using shared template
  const html = applyNewsTemplate({
    title_gu: titleGu || '',
    category: details.category || 'Current Affairs',
    url: url,
    body_gu: bodyGu || '',
    image_url: details.imageUrl || ''
  });

  const outputPath = path.join(process.cwd(), 'preview.html');
  fs.writeFileSync(outputPath, html);
  
  logger.info(`[Preview] Saved beautiful preview to: ${outputPath}`);
  logger.info('[Preview] Opening in browser...');
}

preview().catch(console.error);