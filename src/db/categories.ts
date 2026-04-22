import { getSupabaseClient } from './client';
import { CONFIG } from '../config';
import { logger } from '../utils/logger';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

class CategoryCache {
  private cache: Map<string, string> = new Map(); // slug -> uuid

  async init() {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('news_categories')
        .select('id, slug');

      if (error) throw error;

      data.forEach((cat: any) => {
        this.cache.set(cat.slug, cat.id);
      });
      
      logger.info(`[CategoryCache] Loaded ${this.cache.size} categories from DB`);
    } catch (error) {
      logger.error('[CategoryCache] Failed to load categories, using fallback from config', error);
      // Fallback from config
      Object.values(CONFIG.CATEGORY_MAP).forEach(cat => {
        this.cache.set(cat.slug, cat.uuid);
      });
    }
  }

  getUuid(slug: string): string {
    return this.cache.get(slug) || this.cache.get('current_affairs') || CONFIG.CATEGORY_MAP.default.uuid;
  }

  getSlugFromText(text: string): string {
    const lowerText = text.toLowerCase();
    for (const key in CONFIG.CATEGORY_MAP) {
      if (lowerText.includes(key)) {
        return CONFIG.CATEGORY_MAP[key].slug;
      }
    }
    return 'current_affairs';
  }
}

export const categoryCache = new CategoryCache();
