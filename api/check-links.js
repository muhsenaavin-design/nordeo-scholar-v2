// POST /api/check-links { urls: string[] } → { results: [{ url, ok, status }] }
// Used by the dashboard's "Cek link" button. Only Nordeo's own domain is checked, so the
// function cannot be used to probe other servers.
const ALLOWED = new Set(['nordeoscholar.com', 'www.nordeoscholar.com']);
const MAX_URLS = 30;

async function probe(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return { url, ok: false, status: 'invalid' }; }
  if (parsed.protocol !== 'https:' || !ALLOWED.has(parsed.hostname)) return { url, ok: false, status: 'not checked (outside nordeoscholar.com)' };
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(parsed.href, { method, redirect: 'follow', signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'NordeoLinkCheck/1.0' } });
      if (method === 'HEAD' && (res.status === 405 || res.status === 403)) continue;
      return { url, ok: res.status < 400, status: res.status };
    } catch {
      if (method === 'GET') return { url, ok: false, status: 'unreachable' };
    }
  }
  return { url, ok: false, status: 'unreachable' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const urls = Array.isArray(body.urls) ? [...new Set(body.urls.filter((u) => typeof u === 'string'))].slice(0, MAX_URLS) : [];
  const results = await Promise.all(urls.map(probe));
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ results });
}
