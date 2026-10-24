// Extract the saturated accent pixels from the brand logo (ignores white/black background).
async (page) => {
  const origin = new URL(page.url()).origin;
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
  return JSON.stringify(await page.evaluate(async (origin) => {
    async function saturated(src, maxW) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = origin + src;
      await img.decode().catch(() => {});
      const scale = Math.min(1, maxW / (img.naturalWidth || maxW));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const buckets = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < 0.06 || max < 60) continue;
        const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
        const entry = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
        entry.r += r; entry.g += g; entry.b += b; entry.n += 1;
        buckets.set(key, entry);
      }
      return [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, 6).map(({ r, g, b, n }) => ({
        hex: '#' + [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''),
        pixels: n,
      }));
    }
    return { logo: await saturated('/assets/logo-transparent.png', 440), light: await saturated('/assets/logo-light.png', 480) };
  }, origin), null, 1);
}

