import {test,expect} from '@playwright/test';

test('built cartoons retain CSP and load only same-origin page resources',async({page,baseURL})=>{
 const external=[],violations=[];
 page.on('request',request=>{if(new URL(request.url()).origin!==new URL(baseURL).origin)external.push(request.url());});
 await page.addInitScript(()=>{window.policyViolations=[];document.addEventListener('securitypolicyviolation',event=>window.policyViolations.push(event.effectiveDirective));});
 for(const story of ['meadow','garden']){
  const response=await page.goto(`/?story=${story}&lang=en&format=portrait`);
  expect(response.status()).toBe(200);
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content',/script-src 'self'/);
  if(story==='garden')await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true');
  await page.locator('#start').click();await page.locator('#play').click();
  violations.push(...await page.evaluate(()=>window.policyViolations));
 }
 expect(violations).toEqual([]);expect(external).toEqual([]);
 await page.evaluate(()=>{const script=document.createElement('script');script.textContent='window.inlineInjectionExecuted=true';document.body.append(script);});
 expect(await page.evaluate(()=>window.inlineInjectionExecuted)).toBeUndefined();
 await expect.poll(()=>page.evaluate(()=>window.policyViolations)).toContain('script-src-elem');
});
test('untrusted story names fall back in player and fail closed on export surface',async({page})=>{
 await page.goto('/?story=__proto__&lang=constructor');await expect(page.locator('#player')).toHaveAttribute('data-story','meadow');await expect(page.locator('html')).toHaveAttribute('lang','pl');
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/export.html?story=constructor&lang=en&width=360&height=640');
 await expect.poll(()=>errors).toContain('Invalid render settings');expect(await page.evaluate(()=>window.exportReady)).toBeUndefined();
});
