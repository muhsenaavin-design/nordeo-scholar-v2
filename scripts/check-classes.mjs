import fs from 'node:fs';
const cssFiles = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p = dir+'/'+e.name; if (e.isDirectory()) walk(p); else if (e.name.endsWith('.css')) cssFiles.push(p); } };
walk('src');
const css = cssFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]));
const jsx = [];
const walk2 = (dir) => { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const p = dir+'/'+e.name; if (e.isDirectory()) walk2(p); else if (/\.jsx?$/.test(e.name) && !/\.test\./.test(e.name)) jsx.push(p); } };
walk2('src');
let total = 0;
for (const f of jsx) {
  const t = fs.readFileSync(f,'utf8');
  const used = new Set();
  for (const m of t.matchAll(/class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) for (const w of (m[1]||m[2]||'').split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(w)) used.add(w);
  const missing = [...used].filter(c => !defined.has(c));
  if (missing.length) { total += missing.length; console.log(String(missing.length).padStart(3), f.replace('src/',''), '->', missing.join(' ')); }
}
console.log('css files:', cssFiles.length, '| jsx files:', jsx.length, '| TOTAL undefined:', total);
