// Sample dominant colors from the brand logo + hero image to derive a grounded palette.
async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(async (origin) => {
    async function sample(src, maxW) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src.startsWith('http') ? src : origin + src;
      await img.decode().catch(() => {});
      const scale = Math.min(1, maxW / (img.naturalWidth || maxW));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((img.naturalWidth || maxW) * scale));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || maxW) * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const buckets = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 200) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
        const entry = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
        entry.r += r; entry.g += g; entry.b += b; entry.n += 1;
        buckets.set(key, entry);
      }
      return [...buckets.values()]
        .sort((a, b) => b.n - a.n)
        .slice(0, 10)
        .map(({ r, g, b, n }) => ({
          hex: '#' + [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''),
          share: +(n / (data.length / 4)).toFixed(3),
        }));
    }
    return {
      logo: await sample('/assets/logo-transparent.png', 440),
      logoLight: await sample('/assets/logo-light.png', 480),
      hero: await sample('/assets/generated/hero-library-v2.webp', 320),
    };
  }, origin);
  return JSON.stringify(result, null, 1);
}
