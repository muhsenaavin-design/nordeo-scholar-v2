// Draft assistant for the news submission form.
//
// When VITE_NEWS_AI_ENDPOINT is set, the form POSTs { task: 'news-draft', input } to it and
// expects the same shape localDraft() returns: { headlines, lead, outline, body, checks }.
// The endpoint is where a real language model belongs, so API keys never reach the browser.
// Without it, localDraft() assembles a structured draft from the author's own fields so the
// workflow can be used and reviewed today.

const endpoint = import.meta.env.VITE_NEWS_AI_ENDPOINT || '';

export const aiMode = endpoint ? 'remote' : 'local';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const sentence = value => {
  const text = clean(value);
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
};
const capitalise = value => value.charAt(0).toUpperCase() + value.slice(1);

const angles = {
  research: ['Temuan baru', 'Riset', 'Studi'],
  campus: ['Kabar kampus', 'Agenda', 'Kolaborasi'],
  opinion: ['Analisis', 'Catatan pakar', 'Perspektif'],
  community: ['Pengabdian', 'Dari komunitas', 'Dampak lapangan'],
  journal: ['Pengumuman jurnal', 'Terbitan baru', 'Call for papers'],
};

export function wordCount(value) {
  const text = clean(value);
  return text ? text.split(' ').length : 0;
}

export function draftChecks(input) {
  const words = wordCount(input.body);
  return [
    { label: 'Judul ≤ 90 karakter', ok: clean(input.title).length > 0 && clean(input.title).length <= 90 },
    { label: 'Lead menjawab apa & siapa', ok: wordCount(input.lead) >= 15 },
    { label: 'Isi 400–900 kata', ok: words >= 400 && words <= 900 },
    { label: 'Ada kutipan narasumber', ok: Boolean(clean(input.quote) && clean(input.quoteSource)) },
    { label: 'Ada tautan sumber atau DOI', ok: /^(https?:\/\/|10\.)/i.test(clean(input.sourceUrl)) },
    { label: 'Ada alasan “mengapa sekarang”', ok: wordCount(input.hook) >= 5 },
  ];
}

export function localDraft(input) {
  const title = clean(input.title) || 'Judul berita Anda';
  const keywords = clean(input.keywords).split(',').map(clean).filter(Boolean);
  const [first = 'riset', second = 'publikasi'] = keywords;
  const angle = angles[input.type] || angles.research;
  const institution = clean(input.institution);
  const hook = clean(input.hook);
  const lead = clean(input.lead);

  const headlines = [
    title,
    `${angle[0]}: ${title.replace(/[.:]$/, '')}`,
    `${capitalise(first)} dan ${second}: ${institution ? `catatan dari ${institution}` : 'apa artinya bagi pembaca'}`,
  ].filter((value, index, list) => list.indexOf(value) === index);

  const draftLead = lead
    ? sentence(lead)
    : sentence(`${institution || 'Tim peneliti'} ${hook ? `menyampaikan kabar terkait ${hook.toLowerCase()}` : 'membagikan temuan terbarunya'}`);

  const outline = [
    { heading: 'Lead', note: 'Apa yang terjadi, siapa yang terlibat, kapan dan di mana — dalam 35–60 kata.' },
    { heading: 'Mengapa penting', note: hook ? sentence(hook) : 'Jelaskan relevansi bagi pembaca umum dan komunitas akademik.' },
    { heading: 'Temuan atau isi utama', note: 'Dua sampai tiga paragraf berisi data, metode singkat, dan batas kesimpulan.' },
    { heading: 'Kutipan narasumber', note: clean(input.quote) ? `“${clean(input.quote)}” — ${clean(input.quoteSource) || 'nama & jabatan'}` : 'Satu kutipan yang menambah sudut pandang, bukan mengulang fakta.' },
    { heading: 'Konteks & langkah berikutnya', note: 'Riset terkait, rencana lanjutan, atau cara pembaca mengakses sumber.' },
  ];

  const body = [
    draftLead,
    hook ? sentence(`Kabar ini penting karena ${hook.charAt(0).toLowerCase()}${hook.slice(1)}`) : '',
    clean(input.body) ? clean(input.body) : '[Tulis isi utama di sini: temuan, data pendukung, dan batas kesimpulan.]',
    clean(input.quote) ? `“${clean(input.quote)},” kata ${clean(input.quoteSource) || '[nama, jabatan]'}.` : '',
    clean(input.sourceUrl) ? `Sumber lengkap dapat dibaca di ${clean(input.sourceUrl)}.` : '',
  ].filter(Boolean).join('\n\n');

  return { headlines, lead: draftLead, outline, body, checks: draftChecks(input), source: 'local' };
}

export async function generateNewsDraft(input, { signal } = {}) {
  if (!endpoint) {
    // A short pause keeps the interaction honest-looking without pretending to be a model.
    await new Promise(resolve => setTimeout(resolve, 450));
    return localDraft(input);
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'news-draft', input }),
    signal,
  });
  if (!response.ok) throw new Error(`Asisten AI tidak merespons (${response.status}).`);
  const result = await response.json();
  return { ...localDraft(input), ...result, checks: draftChecks(input), source: 'remote' };
}
