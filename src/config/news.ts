// Single source of truth for every RSS feed the site proxies and displays.
// Adding a feed here is enough to get a working /news/[slug] page, a
// /api/rss/[slug] proxy route, and an entry on the /news index — no more
// copy-pasting a near-identical page + API route per feed.
// The /news index groups feeds under these headings, in this order. A
// category with no feeds yet is left off the page.
export const categories = ['Canada', 'International', 'Tech'] as const;
export type Category = (typeof categories)[number];

export interface FeedEntry {
  slug: string;
  title: string;
  pageTitle: string;
  upstreamUrl: string;
  image: string;
  category: Category;
}

export const feeds: FeedEntry[] = [
  {
    slug: 'toronto-today',
    title: 'TorontoToday',
    pageTitle: 'TorontoToday',
    upstreamUrl: 'https://www.torontotoday.ca/rss',
    image: '/images/news/toronto_today.png',
    category: 'Canada',
  },
  {
    slug: 'the-line',
    title: 'The Line',
    pageTitle: 'The Line',
    upstreamUrl: 'https://www.readtheline.ca/feed',
    image: '/images/news/the_line.png',
    category: 'Canada',
  },
  {
    slug: 'western-standard',
    title: 'Western Standard',
    pageTitle: 'Western Standard',
    upstreamUrl: 'https://www.westernstandard.news/feed',
    image: '/images/news/western_standard.png',
    category: 'Canada',
  },
  {
    slug: 'juno-news',
    title: 'Juno News',
    pageTitle: 'Juno News',
    upstreamUrl: 'https://www.junonews.com/feed',
    image: '/images/news/juno_news.png',
    category: 'Canada',
  },
  {
    slug: 'canadian-affairs',
    title: 'Canadian Affairs',
    pageTitle: 'Canadian Affairs',
    upstreamUrl: 'https://www.canadianaffairs.news/feed/',
    image: '/images/news/canadian_affairs.png',
    category: 'Canada',
  },
  {
    slug: 'the-bureau',
    title: 'The Bureau',
    pageTitle: 'The Bureau',
    upstreamUrl: 'https://www.thebureau.news/feed',
    image: '/images/news/the_bureau.png',
    category: 'Canada',
  },
  {
    slug: 'counter-signal',
    title: 'The Counter Signal',
    pageTitle: 'The Counter Signal',
    upstreamUrl: 'https://www.thecountersignal.com/feed/',
    image: '/images/news/counter_signal.png',
    category: 'Canada',
  },
  {
    slug: 'rebel-news',
    title: 'Rebel News',
    pageTitle: 'Rebel News',
    upstreamUrl: 'https://www.rebelnews.com/news.rss',
    image: '/images/news/rebel_news.png',
    category: 'Canada',
  },
  {
    slug: 'the-audit',
    title: 'The Audit',
    pageTitle: 'The Audit',
    upstreamUrl: 'https://www.theaudit.ca/feed',
    image: '/images/news/the_audit.png',
    category: 'Canada',
  },
  {
    slug: 'globe-and-mail',
    title: 'The Globe and Mail',
    pageTitle: 'The Globe and Mail',
    upstreamUrl: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/',
    image: '/images/news/globe_and_mail.png',
    category: 'Canada',
  },
  {
    slug: 'wall-street-journal',
    title: 'The Wall Street Journal',
    pageTitle: 'The Wall Street Journal',
    upstreamUrl: 'https://feeds.content.dowjones.io/public/rss/RSSWorldNews',
    image: '/images/news/wall_street_journal.png',
    category: 'International',
  },
  {
    slug: 'new-york-post',
    title: 'New York Post',
    pageTitle: 'New York Post',
    upstreamUrl: 'https://nypost.com/news/feed/',
    image: '/images/news/new_york_post.png',
    category: 'International',
  },
  {
    slug: 'fox-news',
    title: 'Fox News',
    pageTitle: 'Fox News',
    upstreamUrl: 'https://moxie.foxnews.com/google-publisher/world.xml',
    image: '/images/news/fox_news_intl.png',
    category: 'International',
  },
  {
    slug: 'washington-examiner',
    title: 'Washington Examiner',
    pageTitle: 'Washington Examiner',
    upstreamUrl: 'https://www.washingtonexaminer.com/feed/',
    image: '/images/news/washington_examiner.png',
    category: 'International',
  },
  {
    slug: 'the-free-press',
    title: 'The Free Press',
    pageTitle: 'The Free Press',
    upstreamUrl: 'https://www.thefp.com/feed',
    image: '/images/news/the_free_press.png',
    category: 'International',
  },
  {
    slug: 'unherd',
    title: 'UnHerd',
    pageTitle: 'UnHerd',
    upstreamUrl: 'https://unherd.com/feed/',
    image: '/images/news/unherd.png',
    category: 'International',
  },
  {
    slug: 'mit-technology-review',
    title: 'MIT Technology Review',
    pageTitle: 'MIT Technology Review',
    upstreamUrl: 'https://www.technologyreview.com/feed/',
    image: '/images/news/mit_technology_review.png',
    category: 'Tech',
  },
  {
    slug: 'the-register',
    title: 'The Register',
    pageTitle: 'The Register',
    upstreamUrl: 'https://www.theregister.com/headlines.rss',
    image: '/images/news/the_register.png',
    category: 'Tech',
  },
  {
    slug: 'toms-hardware',
    title: "Tom's Hardware",
    pageTitle: "Tom's Hardware",
    upstreamUrl: 'https://www.tomshardware.com/feeds/all',
    image: '/images/news/toms_hardware.png',
    category: 'Tech',
  },
  {
    slug: 'wired',
    title: 'Wired',
    pageTitle: 'Wired',
    upstreamUrl: 'https://www.wired.com/feed/rss',
    image: '/images/news/wired.png',
    category: 'Tech',
  },
  {
    slug: 'engadget',
    title: 'Engadget',
    pageTitle: 'Engadget',
    upstreamUrl: 'https://www.engadget.com/rss.xml',
    image: '/images/news/engadget.png',
    category: 'Tech',
  },
  {
    slug: '9to5mac',
    title: '9to5Mac',
    pageTitle: '9to5Mac',
    upstreamUrl: 'https://9to5mac.com/feed/',
    image: '/images/news/925_mac.png',
    category: 'Tech',
  },
];

export function getFeed(slug: string): FeedEntry | undefined {
  return feeds.find((f) => f.slug === slug);
}
