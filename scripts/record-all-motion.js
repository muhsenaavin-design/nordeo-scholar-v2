async page=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5180/?motion=full');await page.waitForTimeout(2200);
 const magnet=await page.locator('.magnet').boundingBox();await page.mouse.move(magnet.x+magnet.width-8,magnet.y+12,{steps:10});await page.waitForTimeout(700);await page.mouse.move(10,150);
 await page.evaluate(()=>document.getElementById('discovery').scrollIntoView({behavior:'smooth',block:'start'}));await page.waitForTimeout(4000);
 const nav=page.getByRole('navigation',{name:'Navigasi utama'});
 for(const name of ['Journals','Ecosystem','About','Contact']) {
  const box=await nav.getByRole('link',{name,exact:true}).boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:8});await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(2200);
 }
 await page.emulateMedia({reducedMotion:'no-preference'});
}
