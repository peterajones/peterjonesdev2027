import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP is not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in the environment.'
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export async function sendContactEmail({ name, email, message }: ContactMessage) {
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!to) {
    throw new Error('CONTACT_TO_EMAIL is not set in the environment.');
  }

  await getTransporter().sendMail({
    to,
    from,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    `,
  });
}
