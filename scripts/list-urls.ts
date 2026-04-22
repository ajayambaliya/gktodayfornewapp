import { gkTodayScraper } from '../src/scrapers/gktoday';
import { logger } from '../src/utils/logger';

async function listUrls() {
  const articles = await gkTodayScraper.scrapeListing(1);
  articles.forEach(a => console.log(a.url));
  process.exit(0);
}
listUrls();
