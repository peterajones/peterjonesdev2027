import type { APIRoute } from 'astro';
import { isRateLimited } from '../../lib/rateLimit';
import { sendContactEmail } from '../../lib/mailer';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LEN = 200;
const MAX_MESSAGE_LEN = 5000;
const RATE_LIMIT = 5; // requests
const RATE_WINDOW_MS = 15 * 60 * 1000; // per 15 minutes, per IP

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }

  if (typeof body !== 'object' || body === null) {
    return jsonError('Invalid request body.', 400);
  }

  const { name, email, message, botField } = body as Record<string, unknown>;

  // Honeypot: a real visitor never fills this in (it's visually hidden).
  // Report success without sending anything, so bots don't learn to probe further.
  if (typeof botField === 'string' && botField.trim() !== '') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return jsonError('Name, email, and message are all required.', 400);
  }

  if (name.length > MAX_NAME_LEN) {
    return jsonError('Name is too long.', 400);
  }
  if (message.length > MAX_MESSAGE_LEN) {
    return jsonError('Message is too long.', 400);
  }
  if (!EMAIL_RE.test(email)) {
    return jsonError('Please provide a valid email address.', 400);
  }

  let ip: string;
  try {
    ip = clientAddress;
  } catch {
    // clientAddress throws if the adapter can't determine it (e.g. some
    // static/edge preview contexts) — fall back to a shared bucket rather
    // than failing the request.
    ip = 'unknown';
  }

  if (isRateLimited(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return jsonError('Too many messages sent recently. Please try again later.', 429);
  }

  try {
    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });
  } catch (err) {
    console.error('Failed to send contact email:', err);
    return jsonError('Could not send your message right now. Please try again later.', 500);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
