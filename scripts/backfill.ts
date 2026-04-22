import { runScraper } from '../src/index';
import { logger } from '../src/utils/logger';
import { categoryCache } from '../src/db/categories';

async function backfill() {
  const args = process.argv.slice(2);
  const pagesArg = args.find(arg => arg.startsWith('--pages='));
  // For backfill, we might want to scrape many pages
  const pages = pagesArg ? parseInt(pagesArg.split('=')[1]) : 10;

  logger.info(`[Scripts] Starting backfill for ${pages} pages`);
  
  await categoryCache.init();
  
  // We can just run the normal scraper with more pages
  // It will skip duplicates automatically
  await runScraper(pages);
  
  logger.info('[Scripts] Backfill complete');
  process.exit(0);
}

backfill().catch(err => {
  logger.error('[Scripts] Backfill failed:', err);
  process.exit(1);
});
