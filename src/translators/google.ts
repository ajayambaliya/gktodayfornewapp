import translate from 'google-translate-api-next';
import { logger } from '../utils/logger';

export class GoogleTranslator {
  async translate(text: string, targetLanguage: string = 'gu'): Promise<string | null> {
    if (!text || text.trim() === '') return null;

    try {
      const res = await translate(text, { to: targetLanguage });
      
      // Simple validation: if target is Gujarati, the result should contain non-ASCII characters
      if (this.isTranslated(res.text)) {
        return res.text;
      } else {
        logger.warn(`[Translator] Translation seems to have failed (returned English) for: ${text.substring(0, 30)}...`);
        return null;
      }
    } catch (error) {
      logger.error(`[Translator] Error translating to ${targetLanguage}:`, error);
      return null;
    }
  }

  private isTranslated(text: string): boolean {
    // Gujarati characters are in the range \u0A80-\u0AFF
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    return gujaratiRegex.test(text);
  }

  async translateBatch(texts: string[], targetLanguage: string = 'gu'): Promise<(string | null)[]> {
    if (!texts || texts.length === 0) return [];

    const results: (string | null)[] = [];
    for (const text of texts) {
      const result = await this.translate(text, targetLanguage);
      results.push(result);
      // Small delay to avoid rate limits on free API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return results;
  }
}

export const translator = new GoogleTranslator();
