async page => {
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5180/');
 await page.waitForTimeout(2500);
 const nav=page.getByRole('navigation',{name:'Navigasi utama'});
 for(const name of ['Journals','Ecosystem','About','Contact','Contact']) {
  const box=await nav.getByRole('link',{name,exact:true}).boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:12});
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(2000);
 }
}
