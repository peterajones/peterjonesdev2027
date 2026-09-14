// Single source of truth for every RSS feed the site proxies and displays.
// Adding a feed here is enough to get a working /news/[slug] page, a
// /api/rss/[slug] proxy route, and an entry on the /news index — no more
// copy-pasting a near-identical page + API route per feed.
export interface FeedEntry {
  slug: string;
  title: string;
  pageTitle: string;
  upstreamUrl: string;
  image: string;
}

export const feeds: FeedEntry[] = [
  {
    slug: 'cbc-world-news',
    title: 'CBC World News',
    pageTitle: 'CBC World News',
    upstreamUrl: 'https://www.cbc.ca/webfeed/rss/rss-world',
    image: '/images/news/cbc.jpg',
  },
  {
    slug: 'cbc-top-stories',
    title: 'CBC News Top Stories',
    pageTitle: 'CBC Top Stories',
    upstreamUrl: 'https://www.cbc.ca/webfeed/rss/rss-topstories',
    image: '/images/news/cbc.jpg',
  },
  {
    slug: 'cbc-toronto-news',
    title: 'CBC Toronto News',
    pageTitle: 'CBC Toronto News',
    upstreamUrl: 'https://www.cbc.ca/webfeed/rss/rss-canada-toronto',
    image: '/images/news/cbc.jpg',
  },
  {
    slug: 'cbc-technology-news',
    title: 'CBC Technology News',
    pageTitle: 'CBC Technology News',
    upstreamUrl: 'https://www.cbc.ca/webfeed/rss/rss-technology',
    image: '/images/news/cbc.jpg',
  },
  {
    slug: 'cnbc-international-news',
    title: 'CNBC International News',
    pageTitle: 'CNBC International News',
    upstreamUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362',
    image: '/images/news/cnbc.jpg',
  },
  {
    slug: 'euro-news',
    title: 'CNBC Euro News',
    pageTitle: 'Euro News',
    upstreamUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=19794221',
    image: '/images/news/euronews.jpg',
  },
];

export function getFeed(slug: string): FeedEntry | undefined {
  return feeds.find((f) => f.slug === slug);
}
