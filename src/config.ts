/**
 * Configuration and constants for GKToday Scraper
 */

export const CONFIG = {
  GK_TODAY_URL: 'https://www.gktoday.in/current-affairs/',
  PAGES_TO_SCRAPE: parseInt(process.env.PAGES_TO_SCRAPE || '3'),
  DELAY_BETWEEN_REQUESTS_MS: parseInt(process.env.DELAY_BETWEEN_REQUESTS_MS || '3000'),
  DELAY_BETWEEN_PAGES_MS: parseInt(process.env.DELAY_BETWEEN_PAGES_MS || '5000'),
  MAX_ARTICLES_PER_RUN: parseInt(process.env.MAX_ARTICLES_PER_RUN || '30'),
  TRANSLATE_TO_GUJARATI: process.env.TRANSLATE_TO_GUJARATI !== 'false',
  
  // Selectors for listing page
  LISTING: {
    mainContainer: 'div.column.middle-column',
    articleItem: 'div.home-post-item',
    articleUrl: 'div.post-data h3 a',
    articleTitle: 'div.post-data h3 a',
    articleDate: 'p.home-post-data-meta',
    articleImage: 'div.featured-image img, img.post-featured-image, img.wp-post-image',
    articleExcerpt: 'div.post-data', // We'll need to parse this carefully
  },

  // Selectors for article detail page
  ARTICLE: {
    mainContent: 'main#main.site-main',
    contentBody: '.entry-content, .content-wrap',
    title: 'h1.entry-title, h1#list, h1',
    tags: '.tags a',
    category: '.cat-links a, .post-categories a',
    // Elements to remove from content
    toRemove: [
      '.sharedaddy',
      '.related-posts',
      '#comments',
      '.post-navigation',
      '.sidebar',
      '.widget',
      'script',
      'style',
      'iframe',
      '[class*="ad"]',
      '[class*="banner"]',
      '[class*="social"]',
      '[class*="share"]',
      '.author-bio',
      '.jp-relatedposts',
      '.wp-block-buttons',
    ]
  },

  // Map GKToday categories/tags to our news_categories slugs and UUIDs
  // UUIDs fetched from Supabase
  CATEGORY_MAP: {
    'economy': { slug: 'economy', uuid: '071cb25b-762b-49f8-92a6-a3e2320b9eef' },
    'sports': { slug: 'sports', uuid: '25ee8c8e-3ac5-4bcc-8d1f-9a59e1a0df56' },
    'science': { slug: 'science', uuid: '80d87769-71af-4f63-bb50-e71f0b3044fe' },
    'technology': { slug: 'technology', uuid: '4d3e7449-5f71-46fa-bafd-e0fc95727be2' },
    'politics': { slug: 'politics', uuid: 'e5ac2dbd-ba8a-4809-9556-9942321519d5' },
    'international': { slug: 'international', uuid: '99da1c56-a363-4cd7-93cb-a4f5fa2c2569' },
    'national': { slug: 'national', uuid: '27e88f47-56fc-494e-bd4e-436fd6b1a177' },
    'banking': { slug: 'banking', uuid: '3be3ce6e-37f2-48c1-9160-3a8c39106323' },
    'environment': { slug: 'environment', uuid: 'b21147a4-5915-46af-a20f-e7c0e5ce511c' },
    'education': { slug: 'education', uuid: '99195935-fa27-4fd4-b003-411148b258be' },
    'defence': { slug: 'defence', uuid: 'd903c06a-3efd-4bac-8b4c-e2eda2dacc97' },
    'business': { slug: 'business', uuid: '327a8e36-66f8-4dff-b5b8-78cfe5a47575' },
    'awards': { slug: 'awards-and-honours', uuid: '65f32bac-7794-4cc2-a7f8-f14184aa56f4' },
    'persons': { slug: 'persons', uuid: '7413d384-6170-4784-808e-04066a449b7e' },
    'current affairs': { slug: 'current_affairs', uuid: '6624e756-a258-4c7a-ad8e-8ec46c478bdd' },
    'default': { slug: 'current_affairs', uuid: '6624e756-a258-4c7a-ad8e-8ec46c478bdd' },
  } as Record<string, { slug: string, uuid: string }>
};
