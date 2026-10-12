import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import styles from './NewsFeed.module.css';

interface Props {
  slug: string;
  pageTitle: string;
  image: string;
  // Overrides the proxy URL; only the dev-only /news/preview page uses it.
  src?: string;
}

interface Item {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  // Set only when the description carries no <img> of its own.
  thumbnail: string | null;
}

const MEDIA_NS = 'http://search.yahoo.com/mrss/';
const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/';

const isHttpUrl = (url: string | null | undefined): url is string =>
  !!url && /^https?:\/\//i.test(url);

// Media RSS lets `medium`/`type` be omitted, so only reject what's
// declared as something else (video, audio).
const isImage = (el: Element) => {
  const medium = el.getAttribute('medium');
  const type = el.getAttribute('type');
  return (!medium || medium === 'image') && (!type || type.startsWith('image/'));
};

// Most feeds don't put their image in <description>; they use one of the
// standard RSS extensions instead. Checked in order of how reliably each
// gives a full-size image: media:content (thumbnails can be tiny), then
// media:thumbnail, an image enclosure, and finally the first <img> in the
// full article body (content:encoded).
function findThumbnail(item: Element): string | null {
  const urlOf = (els: HTMLCollectionOf<Element>, filter: (el: Element) => boolean = () => true) =>
    Array.from(els).find((el) => filter(el) && isHttpUrl(el.getAttribute('url')))?.getAttribute('url');

  const fromMedia =
    urlOf(item.getElementsByTagNameNS(MEDIA_NS, 'content'), isImage) ??
    urlOf(item.getElementsByTagNameNS(MEDIA_NS, 'thumbnail')) ??
    urlOf(item.getElementsByTagName('enclosure'), (el) => (el.getAttribute('type') ?? '').startsWith('image/'));
  if (fromMedia) return fromMedia;

  const body = item.getElementsByTagNameNS(CONTENT_NS, 'encoded')[0]?.textContent;
  if (!body) return null;
  // DOMParser documents are inert: nothing in them loads or runs.
  const src = new DOMParser().parseFromString(body, 'text/html').querySelector('img')?.getAttribute('src');
  return isHttpUrl(src) ? src : null;
}

const YOUTUBE_ID = '[A-Za-z0-9_-]{11}';
const YOUTUBE_IFRAME = new RegExp(
  `<iframe\\b[^>]*\\bsrc=["']https?://(?:www\\.)?youtube(?:-nocookie)?\\.com/embed/(${YOUTUBE_ID})(?![A-Za-z0-9_-])[^>]*>(?:\\s*</iframe>)?`,
  'gi',
);
// Rebel News writes its embeds as a CMS marker, a paragraph containing only
// `YouTube-embed:ID`. Its other markers (NB-embed, Podcast-embed) point at
// its own player, and the feed gives nothing to turn them into a link.
const YOUTUBE_MARKER = new RegExp(`^YouTube-embed:(${YOUTUBE_ID})$`);
const OTHER_MARKER = /^[A-Za-z]+-embed:\S*$/;

function videoLink(id: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = styles.video;
  link.href = `https://www.youtube.com/watch?v=${id}`;
  link.target = '_new';
  link.rel = 'noreferrer';
  const img = document.createElement('img');
  img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  img.alt = 'Watch video on YouTube';
  img.width = 480;
  img.height = 360;
  img.loading = 'lazy';
  link.append(img);
  return link;
}

// Rebel News opens each description with its subhead wrapped in CMS
// markers: `<p>Subhead:Text of the subhead.#</p>`. Strip the "Subhead:"
// label and the trailing "#", from the opening paragraph only, and only
// when it carries the label, so a "#" anywhere else is left alone.
function stripSubheadMarkers(fragment: DocumentFragment) {
  const first = fragment.querySelector('p');
  if (!first || !/^\s*Subhead:/.test(first.textContent ?? '')) return;
  const texts: Text[] = [];
  const walker = document.createTreeWalker(first, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const head = texts.find((t) => t.data.trim());
  if (head) head.data = head.data.replace(/^\s*Subhead:\s*/, '');
  const tail = texts.findLast((t) => t.data.trim());
  if (tail) tail.data = tail.data.replace(/#\s*$/, '');
}

// Embedded videos become a thumbnail linking to YouTube rather than a
// player: nothing loads from YouTube until a visitor clicks, and the
// sanitizer never has to allow iframes. Iframes are rewritten to the marker
// form before sanitizing (which would strip them). Markers are then swapped
// on the sanitized DOM, never by string replacement: a marker inside an
// attribute value would otherwise let the inserted markup break out of it.
// Only a <p> whose entire text is a marker is touched.
function renderDescription(html: string): string {
  const fragment = DOMPurify.sanitize(html.replace(YOUTUBE_IFRAME, '<p>YouTube-embed:$1</p>'), {
    ALLOWED_TAGS: ['img', 'p', 'a', 'b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'width', 'height'],
    RETURN_DOM_FRAGMENT: true,
  });
  for (const p of Array.from(fragment.querySelectorAll('p'))) {
    const text = p.textContent?.trim() ?? '';
    const id = YOUTUBE_MARKER.exec(text)?.[1];
    if (id) p.replaceWith(videoLink(id));
    else if (OTHER_MARKER.test(text)) p.remove();
  }
  stripSubheadMarkers(fragment);
  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
}

// One component for every feed, replacing 6 copy-pasted pages. It also
// fixes an inconsistency in the 2026 site: some feed pages null-checked
// `<category>`/`<guid>` before reading them, some didn't (a feed item
// missing either would throw). This version is defensive everywhere and
// sanitizes feed HTML before it's rendered, since it's third-party content.
export default function NewsFeed({ slug, pageTitle, image, src }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(src ?? `/api/rss/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Feed request failed');
        return res.text();
      })
      .then((xml) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        if (doc.querySelector('parsererror')) throw new Error('Feed parse failed');

        const parsed: Item[] = Array.from(doc.querySelectorAll('item')).map((item) => {
          const description = item.querySelector('description')?.textContent ?? '';
          return {
            title: item.querySelector('title')?.textContent ?? '',
            link: item.querySelector('link')?.textContent ?? '#',
            description,
            pubDate: item.querySelector('pubDate')?.textContent ?? '',
            thumbnail: /<img\b/i.test(description) ? null : findThumbnail(item),
          };
        });
        setItems(parsed);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, src]);

  return (
    <div className="feeds-container content">
      <div className={styles.newsfeedHeader}>
        <img src={image} alt="news" width={100} height={100} />
        <h2>{pageTitle}</h2>
      </div>

      {error && <p>Sorry, this feed couldn't be loaded right now.</p>}
      {!error && items === null && <p>Loading feed...</p>}

      {items?.map((item) => (
        <article key={item.link}>
          <h3>
            <a href={item.link} className={styles.title} target="_new" rel="noreferrer">
              {item.title}
            </a>
          </h3>
          <p>
            <span className={styles.pubData}>{item.pubDate}</span>
            {item.thumbnail && (
              <img
                className={styles.thumbnail}
                src={item.thumbnail}
                alt=""
                loading="lazy"
                // Publishers do list dead or non-image URLs (a 401, an .mp4
                // tagged as a thumbnail); hide those rather than show a
                // broken-image icon.
                onError={(e) => {
                  e.currentTarget.hidden = true;
                }}
              />
            )}
            <span
              // Feed descriptions legitimately contain an <img> + <p>, so this
              // stays HTML — but it's sanitized since it's third-party content.
              dangerouslySetInnerHTML={{
                __html: renderDescription(item.description),
              }}
            />
          </p>
        </article>
      ))}
    </div>
  );
}
