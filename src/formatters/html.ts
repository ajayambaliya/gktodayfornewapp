import * as cheerio from 'cheerio';
import { decode } from 'html-entities';

/**
 * Formats HTML content for mobile-first display in React Native RenderHTML component.
 * Rules:
 * - Use <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em>, <table>
 * - Remove complex structures, scripts, styles, iframes
 * - Set images and tables to 100% width
 * - Remove inline styles except for essential ones
 */
export const formatMobileHTML = (html: string): string => {
  if (!html) return '';

  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, iframe, link, meta, noscript').remove();
  $('.sharedaddy, .related-posts, #comments, .post-navigation, .sidebar, .widget, [class*="ad"], [class*="banner"], [class*="social"], [class*="share"], .author-bio, .jp-relatedposts, .wp-block-buttons').remove();

  // Strip all hyperlinks but keep text
  $('a').each((_, el) => {
    const $el = $(el);
    $el.replaceWith($el.text());
  });

  // Process all elements
  $('*').each((_, el) => {
    const $el = $(el);
    
    // Remove all attributes except src, style
    const attribs = $el.attr();
    if (attribs) {
      Object.keys(attribs).forEach(attr => {
        if (!['src', 'style'].includes(attr)) {
          $el.removeAttr(attr);
        }
      });
    }

    // Remove inline styles except for specific ones we want to keep/inject
    $el.removeAttr('style');
  });

  // Specific handling for images
  $('img').each((_, el) => {
    const $el = $(el);
    $el.attr('style', 'width:100%;height:auto;');
    $el.removeAttr('srcset');
    $el.removeAttr('sizes');
    $el.removeAttr('width');
    $el.removeAttr('height');
    $el.removeAttr('loading');
    $el.removeAttr('decoding');
  });

  // Specific handling for tables
  $('table').each((_, el) => {
    $(el).attr('style', 'width:100%;border-collapse:collapse;margin:10px 0;');
  });
  $('th, td').each((_, el) => {
    $(el).attr('style', 'border:1px solid #e0e0e0;padding:8px;text-align:left;');
  });

  // Convert divs to p if they contain text directly, or remove them if they are just wrappers
  $('div').each((_, el) => {
    const $el = $(el);
    if ($el.children().length === 0 && $el.text().trim()) {
      $el.replaceWith(`<p>${$el.html()}</p>`);
    } else {
      // If it has children, just unwrap it
      $el.replaceWith($el.html() || '');
    }
  });

  // Clean up "Also Read", "Tags", etc. (text patterns)
  $('p, h2, h3').each((_, el) => {
    const $el = $(el);
    const text = $el.text().toLowerCase();
    if (text.includes('also read:') || text.includes('filed under:') || text.includes('tags:')) {
      $el.remove();
    }
  });

  // Remove empty tags
  $('p, h2, h3, div').each((_, el) => {
    const $el = $(el);
    if (!$el.text().trim() && $el.find('img').length === 0) {
      $el.remove();
    }
  });

  // Final HTML cleanup
  let cleaned = $('body').html() || '';
  
  // Decode HTML entities
  cleaned = decode(cleaned);
  
  // Final string replacements for common GKToday patterns
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
  
  return cleaned.trim();
};
