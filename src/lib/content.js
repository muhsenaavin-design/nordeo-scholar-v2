// What the public website reads from the database: the content the dashboard manages and the
// published NordeoNews articles. Pages render the static data first and switch to the database
// copy as soon as it arrives, so the site still works when the database cannot be reached.
import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabase';
import { trainingPrograms } from '../data/training';
import { upgradeEditorialPhoto } from './editorial-photos';

let state = { loaded: false, content: {}, news: null };
let started = false;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => state;

// ---------------------------------------------------------------- news row <-> article object
export function rowToNews(row) {
  return {
    ...(row.data || {}),
    id: row.id, slug: row.slug, title: row.title, category: row.category, date: row.date, status: row.status,
    featured: row.featured, popularRank: row.popular_rank ?? undefined, views: row.views || 0, reviewNote: row.review_note || '',
  };
}

export function newsToRow(item) {
  const { id, slug, title, category, date, status, featured, popularRank, reviewNote, views, ...data } = item;
  return {
    id, slug, title, category, date, status: status || 'draft', featured: Boolean(featured),
    popular_rank: Number.isFinite(popularRank) ? popularRank : null, review_note: reviewNote || '', data,
  };
}

export function loadPublicContent(force = false) {
  if (!supabase || (started && !force)) return;
  started = true;
  Promise.all([
    supabase.from('site_content').select('key,value'),
    supabase.from('news').select('*').eq('status', 'published'),
  ]).then(([content, news]) => {
    state = {
      loaded: true,
      content: content.error ? state.content : Object.fromEntries((content.data || []).map((row) => [row.key, row.value])),
      news: news.error || !news.data?.length ? state.news : news.data.map(rowToNews),
    };
    emit();
  }).catch(() => { state = { ...state, loaded: true }; emit(); });
}

export function usePublicContent() {
  useEffect(() => { loadPublicContent(); }, []);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** One content module from the dashboard, or the fallback built into the site. */
export function useContent(key, fallback) {
  const { content } = usePublicContent();
  return content[key] ?? fallback;
}

/** Published articles from the database, or null while they are not available. */
export function cachedNews() {
  return state.news;
}

export function useNewsSource() {
  return usePublicContent().news;
}

// ---------------------------------------------------------------- Academy programmes
const PROGRAM_DEFAULTS = {
  summary: '', time: 'Jam menyusul', duration: 'Menyusul', seats: 'Kuota menyusul', level: 'Semua level', focus: 'Penulisan & publikasi',
  cover: '/assets/ecosystem-training.webp', coverAlt: '', outcomes: [], dateLabel: 'Tanggal menyusul', mode: 'Online',
};
// The dashboard keeps the scheduling fields; the long descriptions stay in the site data.
export function mergePrograms(records) {
  if (!Array.isArray(records)) return trainingPrograms;
  return records
    .filter((record) => record.status !== 'draft')
    .map((record) => upgradeEditorialPhoto({ ...PROGRAM_DEFAULTS, ...(trainingPrograms.find((program) => program.id === record.id) || {}), ...record }));
}

export function usePrograms() {
  return mergePrograms(useContent('programs', null));
}

// ---------------------------------------------------------------- public forms
async function uploadPrivate(file, folder) {
  if (!supabase || !file?.blob) return null;
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^\w.-]+/g, '_')}`;
  const { error } = await supabase.storage.from('submissions').upload(path, file.blob, { contentType: file.type, upsert: false });
  return error ? null : path;
}

const dataUrlToBlob = (dataUrl) => {
  const [head, body] = String(dataUrl).split(',');
  const type = /data:([^;]+)/.exec(head)?.[1] || 'application/octet-stream';
  const bytes = atob(body || '');
  const array = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) array[i] = bytes.charCodeAt(i);
  return new Blob([array], { type });
};

/** Sends a NordeoNews story to the editors. Returns true when the database stored it. */
export async function sendStorySubmission(entry) {
  if (!supabase) return false;
  const image = entry.image?.dataUrl ? await uploadPrivate({ name: entry.image.name || 'cover.jpg', type: entry.image.type || 'image/jpeg', blob: dataUrlToBlob(entry.image.dataUrl) }, 'images') : null;
  const doc = entry.docFile?.dataUrl ? await uploadPrivate({ name: entry.docFile.name, type: entry.docFile.type, blob: dataUrlToBlob(entry.docFile.dataUrl) }, 'documents') : null;
  const { image: _image, docFile: _doc, ...rest } = entry;
  const payload = { ...rest, imagePath: image, imageName: entry.image?.name || '', docPath: doc, docName: entry.docFile?.name || '' };
  const { error } = await supabase.from('news_submissions').insert({
    reference: entry.reference, title: entry.title || '', category: entry.category || '', name: entry.name || '', email: entry.email || '',
    institution: entry.institution || '', mode: entry.mode || 'form', payload,
  });
  return !error;
}

export async function sendRegistration(entry) {
  if (!supabase) return false;
  const { reference, program, name, email, institution, role, ...payload } = entry;
  const { error } = await supabase.from('academy_registrations').insert({ reference, program: program || '', name, email, institution: institution || '', role: role || '', payload });
  return !error;
}

export async function sendComment({ slug, name, email, body, parentId }) {
  if (!supabase) return false;
  const { error } = await supabase.from('news_comments').insert({ article_slug: slug, name, email, body, parent_id: parentId || null });
  return !error;
}

export async function fetchApprovedComments(slug) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('approved_comments', { slug });
  if (error) return null;
  return data.map((row) => ({ id: row.id, parentId: row.parent_id, name: row.name, comment: row.body, at: row.created_at }));
}

export async function sendSubscriber(email, topics = []) {
  if (!supabase) return 'offline';
  const { error } = await supabase.from('subscribers').insert({ email: email.trim().toLowerCase(), topics });
  if (!error) return 'saved';
  return error.code === '23505' ? 'exists' : 'error';
}

export function countView(slug) {
  if (supabase) supabase.rpc('count_news_view', { article_slug: slug }).then(() => {}, () => {});
}
