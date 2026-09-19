import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import styles from './NewsFeed.module.css';

interface Props {
  slug: string;
  pageTitle: string;
  image: string;
}

interface Item {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

// One component for every feed, replacing 6 copy-pasted pages. It also
// fixes an inconsistency in the 2026 site: some feed pages null-checked
// `<category>`/`<guid>` before reading them, some didn't (a feed item
// missing either would throw). This version is defensive everywhere and
// sanitizes feed HTML before it's rendered, since it's third-party content.
export default function NewsFeed({ slug, pageTitle, image }: Props) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/rss/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Feed request failed');
        return res.text();
      })
      .then((xml) => {
        if (cancelled) return;
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        if (doc.querySelector('parsererror')) throw new Error('Feed parse failed');

        const parsed: Item[] = Array.from(doc.querySelectorAll('item')).map((item) => ({
          title: item.querySelector('title')?.textContent ?? '',
          link: item.querySelector('link')?.textContent ?? '#',
          description: item.querySelector('description')?.textContent ?? '',
          pubDate: item.querySelector('pubDate')?.textContent ?? '',
        }));
        setItems(parsed);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

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
            <span
              // Feed descriptions legitimately contain an <img> + <p>, so this
              // stays HTML — but it's sanitized since it's third-party content.
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(item.description, {
                  ALLOWED_TAGS: ['img', 'p', 'a', 'b', 'i', 'em', 'strong', 'br'],
                  ALLOWED_ATTR: ['src', 'alt', 'href', 'title', 'width', 'height'],
                }),
              }}
            />
          </p>
        </article>
      ))}
    </div>
  );
}
