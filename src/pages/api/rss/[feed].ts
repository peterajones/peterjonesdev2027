import type { APIRoute } from 'astro';
import { getFeed } from '../../../config/news';

// Replaces the 6 near-identical Next.js API routes with one dynamic route.
// Exists only to work around RSS feeds not sending CORS headers — the
// browser can't fetch these directly, so we proxy them server-side.
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const feed = getFeed(params.feed ?? '');

  if (!feed) {
    return new Response(JSON.stringify({ error: 'Unknown feed' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const upstream = await fetch(feed.upstreamUrl, {
      headers: { 'User-Agent': 'peterjones.dev RSS proxy' },
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'Upstream feed error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const xml = await upstream.text();

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=600, stale-while-revalidate=60',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch feed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
