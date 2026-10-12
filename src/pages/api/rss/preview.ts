import type { APIRoute } from 'astro';

// Dev-only proxy for /news/preview: fetches whatever feed URL it's given, so
// a candidate feed can be evaluated without adding it to config/news.ts. It
// 404s outside `astro dev` — an open "fetch any URL" endpoint in production
// would let anyone use the server to reach arbitrary hosts.
export const prerender = false;

const json = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return json({ error: 'Not found' }, 404);

  let target: URL;
  try {
    target = new URL(url.searchParams.get('url') ?? '');
  } catch {
    return json({ error: 'Missing or invalid url parameter' }, 400);
  }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return json({ error: 'Only http(s) URLs are allowed' }, 400);
  }

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'peterjones.dev RSS proxy' },
    });
    if (!upstream.ok) return json({ error: `Upstream feed error ${upstream.status}` }, 502);

    return new Response(await upstream.text(), {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch {
    return json({ error: 'Failed to fetch feed' }, 500);
  }
};
