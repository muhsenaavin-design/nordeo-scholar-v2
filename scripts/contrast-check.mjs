const hex = (h) => h.replace('#','').match(/../g).map((x) => parseInt(x,16)/255);
const lum = (c) => { const [r,g,b] = hex(c).map((v) => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*r + 0.7152*g + 0.0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((m,n) => n-m); return +((x+0.05)/(y+0.05)).toFixed(2); };
const blend = (fg, bg, a) => {
  const f = hex(fg), b = hex(bg);
  return '#' + f.map((v,i) => Math.round((v*a + b[i]*(1-a))*255).toString(16).padStart(2,'0')).join('');
};
const rows = [
  ['--ink #142a32 on paper #fbf9f5', ratio('#142a32','#fbf9f5')],
  ['--ink-2 #40585f on white', ratio('#40585f','#ffffff')],
  ['--ink-2 #40585f on surface-2 #f5f2ea', ratio('#40585f','#f5f2ea')],
  ['--ink-3 #5e7278 on white', ratio('#5e7278','#ffffff')],
  ['--ink-3 #5e7278 on surface-2 #f5f2ea', ratio('#5e7278','#f5f2ea')],
  ['--ink-3 #5e7278 on paper #fbf9f5', ratio('#5e7278','#fbf9f5')],
  ['--teal #1e5566 on white', ratio('#1e5566','#ffffff')],
  ['--accent-ink #7a5a0e on white', ratio('#7a5a0e','#ffffff')],
  ['--accent-ink #7a5a0e on surface-2', ratio('#7a5a0e','#f5f2ea')],
  ['--accent #c9a227 fill with --ink text', ratio('#142a32','#c9a227')],
  ['--accent-bright #e3b341 on deep #0f3038', ratio('#e3b341','#0f3038')],
  ['--accent-bright on hero overlay #0c2b33', ratio('#e3b341','#0c2b33')],
  ['--accent-soft #f0e3b8 on deep-2 #0a242b', ratio('#f0e3b8','#0a242b')],
  ['hero body rgba(228,238,240,.92) on #0c2b33', ratio(blend('#e4eef0','#0c2b33',0.92),'#0c2b33')],
  ['hero facts label rgba(226,236,238,.84) on #0c2b33', ratio(blend('#e2ecee','#0c2b33',0.84),'#0c2b33')],
  ['footer link rgba(226,236,238,.86) on #0a242b', ratio(blend('#e2ecee','#0a242b',0.86),'#0a242b')],
  ['footer-bottom rgba(206,222,226,.88) on #0a242b', ratio(blend('#cedee2','#0a242b',0.88),'#0a242b')],
  ['stats dt rgba(226,236,238,.86) on #0f3038', ratio(blend('#e2ecee','#0f3038',0.86),'#0f3038')],
  ['stats note rgba(202,220,224,.92) on #0f3038', ratio(blend('#cadce0','#0f3038',0.92),'#0f3038')],
  ['status live #33512f on #eaf1e6', ratio('#33512f','#eaf1e6')],
  ['status open #6a5310 on #faf3dd', ratio('#6a5310','#faf3dd')],
  ['focus ring --teal on white', ratio('#1e5566','#ffffff')],
  ['focus ring --accent-bright on deep', ratio('#e3b341','#0f3038')],
  ['journal mark text on deep', ratio('#e3b341','#0f3038')],
];
for (const [label, value] of rows) {
  const verdict = value >= 4.5 ? 'AA' : value >= 3 ? 'large/UI only' : 'FAIL';
  console.log(String(value).padStart(6), verdict.padEnd(13), label);
}
