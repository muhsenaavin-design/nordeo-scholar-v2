async (page) => {
 const origin = new URL(page.url()).origin;
 const failures = [];
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(origin);
 await page.waitForTimeout(1800);
 const nav = page.getByRole('navigation', {name:'Navigasi utama'});
 const samples=[];
 for(const name of ['About','Ecosystem','Journals','Contact']) {
   await nav.getByRole('link',{name,exact:true}).click();
   await page.waitForTimeout(150);
   const mid = await page.evaluate(()=>scrollY);
   await page.waitForTimeout(1200);
   const state=await page.evaluate(id=>{
     const section=document.getElementById(id), heading=section.querySelector('h2');
     return {id, y:scrollY, top:section.getBoundingClientRect().top, focused:document.activeElement===heading, animations:heading.getAnimations().map(a=>a.playState), overflow:document.documentElement.scrollWidth>innerWidth};
   },name.toLowerCase());
   if(!state.focused||state.overflow) failures.push(`${name}: focus/overflow`);
   if(state.top<75) failures.push(`${name}: sticky header covers section`);
   samples.push({mid,...state});
 }
 const repeatedBox=await nav.getByRole('link',{name:'Contact',exact:true}).boundingBox();
 await page.mouse.click(repeatedBox.x+repeatedBox.width/2,repeatedBox.y+repeatedBox.height/2);
 await page.waitForTimeout(120);
 if(!await page.locator('#collaboration-heading').evaluate(n=>n.getAnimations().some(a=>a.playState==='running'))) failures.push('Repeated click did not replay arrival');
 await page.goto(origin+'/books');
 await nav.getByRole('link',{name:'Ecosystem',exact:true}).click();
 await page.waitForTimeout(1500);
 if(!page.url().endsWith('/#ecosystem')||!await page.locator('#ecosystem-heading').evaluate(n=>document.activeElement===n)) failures.push('Cross route anchor failed');
 await page.goto(origin);
 await page.waitForTimeout(1800);
 const magnet=page.locator('.magnet');
 const box=await magnet.boundingBox();
 await page.mouse.move(box.x+box.width-10,box.y+10);
 await page.waitForTimeout(220);
 const magnetic=await page.locator('.magnet-inner').evaluate(n=>getComputedStyle(n).transform);
 if(magnetic==='none') failures.push('Magnetic CTA did not move');
 await page.mouse.move(1400,100);
 await page.waitForTimeout(600);
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await nav.getByRole('link',{name:'Journals',exact:true}).click();
 await page.waitForTimeout(1600);
 if(await page.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded')!=='false') failures.push('Mobile drawer remains open');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) failures.push('Mobile overflow');
 await page.screenshot({path:'output/playwright/react-bits-nav-390.png'});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(origin+'/about');
 await page.getByRole('button',{name:'Menu',exact:true}).click();
 await nav.getByRole('link',{name:'About',exact:true}).click();
 await page.waitForTimeout(100);
 const reduced=await page.locator('#about-heading').evaluate(n=>({focus:document.activeElement===n,animations:n.getAnimations().length}));
 if(!reduced.focus||reduced.animations) failures.push('Reduced motion navigation failed');
 await page.emulateMedia({reducedMotion:'no-preference'});
 if(failures.length) throw new Error(JSON.stringify({failures,samples,reduced,magnetic}));
 return {samples,reduced,magnetic,failures};
}
