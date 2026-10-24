// Mailing-list signup. With VITE_NEWSLETTER_ENDPOINT set, the address is POSTed as
// { email, interests, source }. Without it there is no list to join yet, so the form hands the
// visitor a prepared email to the Nordeo inbox instead of pretending to subscribe them.
import { contact } from '../config/links';

const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT || '';

export function subscribeMailto(email, interests = []) {
  const subject = encodeURIComponent('Subscribe to Nordeo Scholar updates');
  const topics = interests.length ? interests.join(', ') : 'all updates';
  const body = encodeURIComponent(`Please add ${email} to the Nordeo Scholar mailing list. Topics: ${topics}.`);
  return `mailto:${contact.general}?subject=${subject}&body=${body}`;
}

export async function subscribe(email, interests = [], source = 'landing') {
  if (!endpoint) return { mode: 'email', href: subscribeMailto(email, interests) };
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, interests, source }) });
  if (!response.ok) throw new Error('We could not save your address. Please try again in a moment.');
  return { mode: 'remote' };
}
