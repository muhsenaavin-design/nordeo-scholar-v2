// The journal list the public site shows. The dashboard (menu Jurnal) stores it in site_content
// under "journals"; until that loads, or when the database is unreachable, the list built into
// the site is used. A journal that is not on OJS yet links to its profile page instead of a
// dead OJS address.
import { directoryJournals, journalCategories } from '../data/journal-directory';
import { cachedContent, usePublicContent } from './content';

const CATEGORY_LABEL = Object.fromEntries(journalCategories.filter((c) => c.id !== 'all').map((c) => [c.id, c.label]));
const NOT_ON_OJS = new Set(['pengmas']);

export const JOURNAL_CATEGORIES = journalCategories.filter((c) => c.id !== 'all');

function toList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value || '').split(/[,\n]/).map((v) => v.trim()).filter(Boolean);
}

export function normalizeJournal(entry) {
  const base = directoryJournals.find((j) => j.id === entry.id) || {};
  const journal = {
    ...base,
    ...entry,
    indexing: toList(entry.indexing ?? base.indexing),
    topics: toList(entry.topics ?? base.topics),
  };
  journal.categoryLabel = CATEGORY_LABEL[journal.category] || journal.categoryLabel || '';
  journal.preview = journal.preview || '/assets/ecosystem-journals.webp';
  journal.profileUrl = journal.profileUrl || `/journals#${journal.id}`;
  journal.articleCount = journal.articleCount || 0;
  if (journal.onOjs === false) {
    journal.url = journal.profileUrl;
    journal.displayUrl = 'Belum tersedia di OJS';
  } else if (journal.url) {
    journal.displayUrl = journal.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
  return journal;
}

/** What the dashboard stores for each journal (fields the Admin can edit). */
export function journalSeed() {
  return directoryJournals.map((j) => ({
    id: j.id, short: j.short, name: j.name, category: j.category, description: j.description,
    status: j.status, statusTone: j.statusTone, frequency: j.frequency, latestIssue: j.latestIssue, eissn: j.eissn,
    indexing: j.indexing, topics: j.topics, url: j.url, guidelinesUrl: j.guidelinesUrl || '', cover: j.cover || '',
    visible: true, onOjs: !NOT_ON_OJS.has(j.id),
  }));
}

const STATIC = journalSeed().map(normalizeJournal);
let lastRaw = null;
let lastList = STATIC;

/** The visible journals right now (database copy when loaded, built-in list otherwise). */
export function journalsNow() {
  const raw = cachedContent('journals');
  if (!Array.isArray(raw) || !raw.length) return STATIC;
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastList = raw.filter((j) => j && j.id && j.visible !== false).map(normalizeJournal);
  }
  return lastList;
}

/** Same list, and the component re-renders when the database copy arrives. */
export function useJournals() {
  usePublicContent();
  return journalsNow();
}
