import { useState, type SubmitEvent } from 'react';
import styles from './ContactForm.module.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
          // Honeypot — real users never fill this in (it's visually hidden).
          botField: formData.get('bot-field'),
        }),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
        return;
      }

      const body = await res.json().catch(() => null);
      setErrorMessage(body?.error ?? 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.formContainer}>
        <p>Thanks for reaching out — I'll get back to you as soon as I can.</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <form name="contact" onSubmit={handleSubmit}>
        <p style={{ display: 'none' }}>
          <label>
            Don't fill this out if you're human: <input name="bot-field" />
          </label>
        </p>
        <p>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required />
        </p>
        <p>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" className={styles.contactEmail} required />
        </p>
        <p>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" required></textarea>
        </p>
        {status === 'error' && <p className="red-msg">{errorMessage}</p>}
        <p>
          <button type="submit" className={styles.btnSubmit} disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Send'}
          </button>
        </p>
      </form>
    </div>
  );
}
