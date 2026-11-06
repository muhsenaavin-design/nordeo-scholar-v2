const hex = (h) => h.replace('#','').match(/../g).map(x => parseInt(x,16)/255);
const lum = (c) => { const [r,g,b] = hex(c).map(v => v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4); return 0.2126*r + 0.7152*g + 0.0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((m,n)=>n-m); return +((x+0.05)/(y+0.05)).toFixed(2); };
const rows = [
  ['CURRENT jetsi mark  #fdd535 on #0b7f91', ratio('#fdd535','#0b7f91')],
  ['CURRENT jiel mark   #fdd535 on #7a0c0c', ratio('#fdd535','#7a0c0c')],
  ['CURRENT pengmas     #f2df9b on #2f6b45', ratio('#f2df9b','#2f6b45')],
  ['CURRENT jetsi text  #0b7f91 on #ffffff', ratio('#0b7f91','#ffffff')],
  ['CURRENT jetsi text  #0b7f91 on #fbf9f5', ratio('#0b7f91','#fbf9f5')],
  ['CURRENT jiel text   #7a0c0c on #fbf9f5', ratio('#7a0c0c','#fbf9f5')],
  ['CURRENT pengmas txt #2f6b45 on #fbf9f5', ratio('#2f6b45','#fbf9f5')],
  ['--- candidates: jetsi mark bg, same #fdd535 text ---', 0],
  ['  #0b7f91 (now)', ratio('#fdd535','#0b7f91')],
  ['  #09616f', ratio('#fdd535','#09616f')],
  ['  #085663', ratio('#fdd535','#085663')],
  ['  #074b57', ratio('#fdd535','#074b57')],
  ['  #0a4f5c', ratio('#fdd535','#0a4f5c')],
  ['--- candidates: jetsi mark bg with --accent-bright #e3b341 ---', 0],
  ['  #0b7f91', ratio('#e3b341','#0b7f91')],
  ['  #085663', ratio('#e3b341','#085663')],
  ['--- candidates: jetsi text on paper, keep teal hue ---', 0],
  ['  #0b7f91 (now)', ratio('#0b7f91','#fbf9f5')],
  ['  #0a6b7a', ratio('#0a6b7a','#fbf9f5')],
  ['  #0a5f6c', ratio('#0a5f6c','#fbf9f5')],
  ['  #095562', ratio('#095562','#fbf9f5')],
  ['  #08505c', ratio('#08505c','#fbf9f5')],
  ['--- sanity: white on jetsi mark ---', 0],
  ['  #ffffff on #0b7f91', ratio('#ffffff','#0b7f91')],
];
for (const [label, value] of rows) console.log(value === 0 ? label : String(value).padStart(6) + '  ' + label);
