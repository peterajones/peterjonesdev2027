// Production entry point: Astro's standalone server, with security headers on
// every response. Prerendered pages and public files are served without
// running Astro's middleware, so the headers have to be set out here.
import http from 'node:http';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler, options } = await import('./dist/server/entry.mjs');

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline': the theme script and Astro's small bundled scripts are
  // inline. Hashes would have to be regenerated on every change to them.
  "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // https: because news feeds carry images from any number of publishers.
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://api.openweathermap.org https://api.exchangeratesapi.io https://maps.googleapis.com https://places.googleapis.com https://jsonplaceholder.typicode.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
};

const port = Number(process.env.PORT ?? options.port ?? 4321);
const host = process.env.HOST ?? 'localhost';

http
  .createServer((req, res) => {
    for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
    handler(req, res);
  })
  .listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
