async page=>{
 const origin=new URL(page.url()).origin;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:1000});await page.goto(origin);
 await page.locator('.discoverability-section').scrollIntoViewIfNeeded();await page.mouse.move(10,100);await page.waitForTimeout(800);
 const position=()=>page.locator('.logoloop__track').evaluate(n=>new DOMMatrix(getComputedStyle(n).transform).m41);
 const start=await position();await page.waitForTimeout(650);const moving=await position();if(Math.abs(start-moving)<4)throw Error('Logo loop is not moving');
 if(await page.getByRole('button',{name:/jeda animasi/i}).count())throw Error('Pause button still visible');
 const logo=page.locator('.logoloop');await logo.hover();await page.waitForTimeout(1600);const hover=await position();await page.waitForTimeout(600);if(Math.abs(hover-await position())<4)throw Error('Hover unexpectedly stops the loop');
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('.discoverability-section').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
  const state=await page.evaluate(async()=>{const images=[...document.querySelectorAll('.platform-logo img')];images.forEach(i=>i.loading='eager');await Promise.all(images.map(i=>i.decode()));return {white:getComputedStyle(document.body).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth}});
  if(await page.locator('.discovery-evidence-grid p').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize))<16)throw Error('Evidence copy below 16px');
  if(state.white!=='rgb(255, 255, 255)'||state.overflow)throw Error(JSON.stringify(state));
  await page.screenshot({path:`output/playwright/nordeo-discovery-${width}.png`});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+'/?motion=reduced');if(await page.locator('.logoloop').count())throw Error('Reduced motion still looping');if(await page.locator('.platform-static a').count()!==6)throw Error('Static logos missing');
 if(!await page.getByRole('link',{name:/instagram @nordeoscholar/i}).count())throw Error('Official social link missing');
 if(errors.length)throw Error(errors.join('\n'));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>localStorage.removeItem('nordeo-motion'));await page.goto(origin);return {start,moving,hover,errors};
}
