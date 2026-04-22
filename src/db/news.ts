import { getSupabaseClient } from './client';
import { logger } from '../utils/logger';
import slugify from 'slugify';

export interface NewsInsert {
  title: string;
  title_gu: string | null;
  body: string;
  body_gu: string | null;
  image_url: string | null;
  source: string;
  source_url: string;
  category: string;
  category_id: string;
  published_at: string;
  is_active: boolean;
  is_featured: boolean;
  is_translated: boolean;
  translated_at: string | null;
  translation_source: string;
  content_type: string;
  tags: string[];
  slug: string;
  read_time_minutes: number;
}

export const insertNews = async (news: NewsInsert): Promise<boolean> => {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('news')
      .upsert(news, { 
        onConflict: 'source_url',
        ignoreDuplicates: false 
      });

    if (error) {
      if (error.code === '23505') {
        logger.debug(`[DB] Duplicate skipped: ${news.source_url}`);
        return false;
      }
      throw error;
    }

    return true;
  } catch (error) {
    logger.error(`[DB] Error inserting news: ${news.source_url}`, error);
    return false;
  }
};

export const checkExists = async (url: string): Promise<boolean> => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from('news')
      .select('id')
      .eq('source_url', url)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    logger.error(`[DB] Error checking existence: ${url}`, error);
    return false;
  }
};

export const generateSlug = (title: string, date: string): string => {
  const base = slugify(title, { lower: true, strict: true });
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `${base}-${dateStr}`;
};

export const calculateReadTime = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};
