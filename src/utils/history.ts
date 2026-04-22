import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

export class HistoryManager {
  private scrapedUrls: Set<string> = new Set();
  private githubPat = process.env.GH_PAT;
  private gistId = process.env.GIST_ID;
  private filename = 'gktoday_scraped_url.json';

  async init() {
    if (!this.githubPat) {
      logger.warn('[History] GH_PAT not found. Falling back to local history.');
      this.loadLocalHistory();
      return;
    }

    try {
      if (this.gistId) {
        await this.loadFromGist();
      } else {
        logger.info('[History] GIST_ID not found. Creating a new Gist...');
        await this.createGist();
      }
    } catch (error) {
      logger.error('[History] Failed to initialize Gist history, falling back to local:', error);
      this.loadLocalHistory();
    }
  }

  private loadLocalHistory() {
    const localPath = path.join(process.cwd(), 'scraped_urls.json');
    try {
      if (fs.existsSync(localPath)) {
        const data = fs.readFileSync(localPath, 'utf8');
        const urls = JSON.parse(data);
        this.scrapedUrls = new Set(urls);
        logger.info(`[History] Loaded ${this.scrapedUrls.size} URLs from local history.`);
      }
    } catch (error) {
      logger.error('[History] Failed to load local history:', error);
    }
  }

  private async loadFromGist() {
    try {
      const response = await axios.get(`https://api.github.com/gists/${this.gistId}`, {
        headers: { Authorization: `token ${this.githubPat}` }
      });
      const content = response.data.files[this.filename]?.content;
      if (content) {
        const urls = JSON.parse(content);
        if (Array.isArray(urls)) {
          this.scrapedUrls = new Set(urls);
        } else {
          logger.warn(`[History] Gist content is not an array, initializing empty.`);
          this.scrapedUrls = new Set();
        }
        logger.info(`[History] Loaded ${this.scrapedUrls.size} URLs from Gist ${this.gistId}.`);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`[History] Gist ${this.gistId} not found. Will create a new one on save.`);
        this.gistId = undefined;
      } else {
        throw error;
      }
    }
  }

  private async createGist() {
    const response = await axios.post('https://api.github.com/gists', {
      description: 'Scraped URLs for GKToday Scraper',
      public: false,
      files: {
        [this.filename]: {
          content: JSON.stringify(Array.from(this.scrapedUrls), null, 2)
        }
      }
    }, {
      headers: { Authorization: `token ${this.githubPat}` }
    });
    this.gistId = response.data.id;
    logger.info(`[History] Created new Gist: ${this.gistId}. Please add this to your .env file.`);
  }

  isScraped(url: string): boolean {
    return this.scrapedUrls.has(url);
  }

  addUrl(url: string) {
    this.scrapedUrls.add(url);
  }

  async saveHistory() {
    // Always save locally as backup
    const localPath = path.join(process.cwd(), 'scraped_urls.json');
    try {
      const urls = Array.from(this.scrapedUrls);
      fs.writeFileSync(localPath, JSON.stringify(urls, null, 2));
    } catch (err) {
      logger.error('[History] Failed to save local backup:', err);
    }

    if (!this.githubPat) return;

    try {
      if (!this.gistId) {
        await this.createGist();
      } else {
        await axios.patch(`https://api.github.com/gists/${this.gistId}`, {
          files: {
            [this.filename]: {
              content: JSON.stringify(Array.from(this.scrapedUrls), null, 2)
            }
          }
        }, {
          headers: { Authorization: `token ${this.githubPat}` }
        });
        logger.info(`[History] Saved ${this.scrapedUrls.size} URLs to Gist ${this.gistId}.`);
      }
    } catch (error) {
      logger.error('[History] Failed to save to Gist:', error);
    }
  }
}

export const historyManager = new HistoryManager();
