async page => {
 const origin=new URL(page.url()).origin;
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin);await page.evaluate(()=>localStorage.removeItem('nordeo-motion'));await page.reload();
 const css=()=>page.locator('.hero-line > span').first().evaluate(n=>getComputedStyle(n).animationName);
 if(await css()!=='none'||await page.locator('.platform-static').count()!==1)throw Error('System reduced motion not honored initially');
 await page.getByRole('button',{name:'Putar logo ↗',exact:true}).click();
 await page.locator('.logoloop').scrollIntoViewIfNeeded();await page.mouse.move(5,200);await page.waitForTimeout(650);
 const pos=()=>page.locator('.logoloop__track').evaluate(n=>new DOMMatrix(getComputedStyle(n).transform).m41);
 const start=await pos();await page.waitForTimeout(650);const next=await pos();
 if(Math.abs(start-next)<4||await css()!=='type-reveal')throw Error('Explicit motion did not enable CSS and LogoLoop');
 await page.reload();await page.locator('.logoloop').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 if(await page.evaluate(()=>document.documentElement.dataset.motion)!=='full')throw Error('Preference not persisted');
 await page.locator('.logoloop').hover();const hover=await pos();await page.waitForTimeout(650);if(Math.abs(hover-await pos())<4)throw Error('Hover stops loop');
 await page.goto(origin+'/?motion=reduced');
 if(await page.locator('.platform-static').count()!==1||await css()!=='none')throw Error('Reduced-motion URL does not disable all motion');
 if(await page.locator('footer').getByRole('button',{name:/animasi/i}).count()!==0)throw Error('Footer motion control still appears');
 await page.goto(origin+'/?motion=full#discovery');await page.waitForTimeout(1700);
 if(await page.evaluate(()=>document.documentElement.dataset.motion)!=='full')throw Error('Preview URL does not activate motion');
 await page.locator('.logoloop').scrollIntoViewIfNeeded();await page.mouse.move(5,200);await page.waitForTimeout(700);
 const forced=await pos();await page.waitForTimeout(600);if(Math.abs(forced-await pos())<4)throw Error('Preview remains static under system reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>localStorage.removeItem('nordeo-motion'));await page.goto(origin);
 return {systemReducedStart:true,explicitCSS:'type-reveal',start,next,persisted:true,hoverContinuous:true,queryOverride:true};
}
