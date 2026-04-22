# GKToday News Scraper (Gujarat Gov Job Prep App)

A standalone Node.js scraper that fetches daily current affairs from GKToday, translates them into Gujarati using Google Cloud Translate, formats the HTML for mobile display, and inserts them into Supabase.

## Features
- **GKToday Scraping**: Extracts articles from listing and detail pages.
- **Gujarati Translation**: Automated translation via Google Cloud Translation API.
- **Mobile-First HTML**: Sanitizes and formats content for React Native `RenderHTML`.
- **Deduplication**: Uses `source_url` with unique constraints in Supabase to prevent duplicates.
- **Categorization**: Automatically maps GKToday categories to internal app category UUIDs.
- **Daily Automation**: Configured for GitHub Actions and local cron scheduling.

## Prerequisites
- Node.js 20+
- Supabase Project with `news` and `news_categories` tables.
- Google Cloud Project with Cloud Translation API enabled.
- Service Account JSON for Google Cloud.

## Installation
```bash
cd gktoday-scraper
npm install
```

## Configuration
1. Copy `.env.example` to `.env`.
2. Fill in your Supabase URL and Service Role Key.
3. Set your Google Project ID and path to credentials.

## Scripts

### Test a single URL
Test scraping and translation without inserting into the database:
```bash
npm run test -- https://www.gktoday.in/current-affairs/some-article-url/
```

### Manual Scrape Run
Run the scraper once (scrapes last 3 pages by default):
```bash
npm run run-once -- --pages=3
```

### Backfill Historical Data
Scrape multiple pages of historical data:
```bash
npm run backfill -- --pages=10
```

### Development Mode
Runs with `ts-node-dev` for auto-reloading:
```bash
npm run dev
```

## Database Migration
Ensure you have run the migration located at `supabase/migrations/20260420_news_bilingual.sql` to add the necessary columns and constraints to your news table.

## GitHub Actions
The project includes a workflow in `.github/workflows/daily-scrape.yml` that runs every day at 1 AM UTC. Ensure you add the following secrets to your GitHub repository:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (The full content of your service account JSON file)

## Implementation Details
- **HTML Sanitization**: Uses `cheerio` to strip unwanted tags (scripts, ads, social buttons) and inject mobile-responsive styles.
- **Translation**: Uses `mimeType: 'text/html'` in Google Translate to preserve formatting tags during translation.
- **Rate Limiting**: Includes delays between requests to respect GKToday's servers.
