import fs from 'node:fs';
const css = fs.readFileSync('src/styles.css','utf8');
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m=>m[1]));
const glob = (dir, acc=[]) => {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = dir + '/' + e.name;
    if (e.isDirectory()) glob(p, acc);
    else if (/\.jsx?$/.test(e.name) && !/\.test\./.test(e.name)) acc.push(p);
  }
  return acc;
};
const files = glob('src');
const report = [];
for (const f of files) {
  const t = fs.readFileSync(f,'utf8');
  const used = new Set();
  for (const m of t.matchAll(/class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    for (const w of (m[1]||m[2]||'').split(/\s+/)) if (/^[a-zA-Z][\w-]*$/.test(w)) used.add(w);
  }
  const missing = [...used].filter(c => !defined.has(c));
  if (missing.length) report.push([f, missing.length, missing.join(' ')]);
}
report.sort((a,b)=>b[1]-a[1]);
console.log('files scanned:', files.length);
for (const [f,n,list] of report) console.log(String(n).padStart(4), f, '->', list.slice(0,180));
