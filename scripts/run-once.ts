import { runScraper } from '../src/index';
import { logger } from '../src/utils/logger';
import { categoryCache } from '../src/db/categories';

async function manualRun() {
  const args = process.argv.slice(2);
  const pagesArg = args.find(arg => arg.startsWith('--pages='));
  const pages = pagesArg ? parseInt(pagesArg.split('=')[1]) : 3;

  logger.info(`[Scripts] Starting manual run for ${pages} pages`);
  
  await categoryCache.init();
  await runScraper(pages);
  
  logger.info('[Scripts] Manual run complete');
  process.exit(0);
}

manualRun().catch(err => {
  logger.error('[Scripts] Manual run failed:', err);
  process.exit(1);
});
