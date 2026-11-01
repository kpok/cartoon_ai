import {test,expect} from '@playwright/test';
async function voices(page,available=true){await page.addInitScript(available=>{
 window.spoken=[];window.cancelCalls=0;window.testVoices=available?[{lang:'pl-PL',localService:true},{lang:'en-GB',localService:true}]:[];
 const synth=new EventTarget();synth.getVoices=()=>window.testVoices;synth.cancel=()=>{window.cancelCalls++;};synth.speak=u=>window.spoken.push({text:u.text,lang:u.lang,pitch:u.pitch});
 Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 },available);}
const ready=async(page)=>{await page.goto('/shelter.html');await expect(page.locator('#shelter-canvas')).toHaveAttribute('data-ready','true');};
const seek=(page,t)=>page.locator('#seek').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('input'));},t);
test('new gallery film plays browser dialogue, cancels on seek and switches language while paused',async({page,baseURL})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL).origin)external.push(r.url());});await voices(page);
 await page.addInitScript(()=>{window.violations=[];document.addEventListener('securitypolicyviolation',e=>window.violations.push(e.effectiveDirective));});
 await page.goto('/');await page.locator('a[href="./shelter.html"]').click();const c=page.locator('#shelter-canvas');await expect(c).toHaveAttribute('data-ready','true');await expect(c).toHaveAttribute('data-playing','false');expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
 await seek(page,9);await page.locator('#play').click();await expect.poll(()=>page.evaluate(()=>window.spoken.length)).toBeGreaterThan(0);expect(await page.evaluate(()=>window.spoken.at(-1).text)).toContain('Wiatr zabrał');
 await page.locator('#play').click();const time=await c.getAttribute('data-time');await page.waitForTimeout(150);await expect(c).toHaveAttribute('data-time',time);
 await seek(page,218);await expect(page.locator('#caption-text')).toContainText('Trzymam');const before=await page.evaluate(()=>window.cancelCalls);await page.locator('#play').click();expect(await page.evaluate(()=>window.spoken.at(-1).pitch)).toBe(1.1);
 await page.locator('#language').selectOption('en');await expect(c).toHaveAttribute('data-playing','false');await expect(page.locator('#caption-text')).toContainText('I am holding');expect(await page.evaluate(()=>window.cancelCalls)).toBeGreaterThan(before);
 await page.locator('#play').click();expect(await page.evaluate(()=>window.spoken.at(-1).lang)).toBe('en-GB');await page.locator('#restart').click();await expect(c).toHaveAttribute('data-time','0.000');
 expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>window.violations)).toEqual([]);
});
test('story milestones restore exactly, chapters seek, and natural end stays at five minutes',async({page})=>{
 await voices(page);await ready(page);const c=page.locator('#shelter-canvas');await seek(page,65);const quick=await c.screenshot();await seek(page,240);expect((await c.screenshot()).equals(quick)).toBe(false);await seek(page,65);expect((await c.screenshot()).equals(quick)).toBe(true);
 await page.locator('button[data-chapter="repair"]').click();await expect(c).toHaveAttribute('data-time','268.000');await expect(c).toHaveAttribute('data-playing','false');
 await seek(page,299.9);await page.locator('#play').click();await expect(c).toHaveAttribute('data-time','300.000');await expect(c).toHaveAttribute('data-playing','false');await expect(page.locator('#ending')).toBeVisible();
 await page.locator('#play').click();await expect.poll(async()=>Number(await c.getAttribute('data-time'))).toBeLessThan(3);await page.locator('#play').click();
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));expect(size.scroll).toBeLessThanOrEqual(size.width);
});
test('missing and late voices keep subtitles usable without queuing old dialogue',async({page})=>{
 await voices(page,false);await ready(page);await expect(page.locator('#audio-status')).toContainText('Brak polskiego głosu');await seek(page,150);await page.locator('#play').click();await expect(page.locator('#caption-text')).toContainText('pospieszyłem');expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
 await page.evaluate(()=>{window.testVoices.push({lang:'pl-PL',localService:true});speechSynthesis.dispatchEvent(new Event('voiceschanged'));});await expect.poll(()=>page.evaluate(()=>window.spoken.length)).toBe(1);expect(await page.evaluate(()=>window.spoken.at(-1).text)).toContain('pospieszyłem');await page.locator('#play').click();
});
test('hiding and restoring the page stops sound and preserves time without autoplay',async({page})=>{
 await voices(page);await ready(page);await seek(page,25);await page.locator('#play').click();const before=await page.evaluate(()=>window.cancelCalls);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});const c=page.locator('#shelter-canvas');await expect(c).toHaveAttribute('data-playing','false');const time=await c.getAttribute('data-time');expect(await page.evaluate(()=>window.cancelCalls)).toBeGreaterThan(before);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});await page.waitForTimeout(150);await expect(c).toHaveAttribute('data-time',time);await expect(c).toHaveAttribute('data-playing','false');
});
test('WebGL failure and context loss retain navigation and stop speech',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});await page.goto('/shelter.html');await expect(page.locator('#failure-box')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await expect(page.locator('#fallback')).toHaveAttribute('href','./?lang=pl');
});
test('context loss while speaking stops controls and active dialogue',async({page})=>{
 await voices(page);await ready(page);await seek(page,25);await page.locator('#play').click();const before=await page.evaluate(()=>window.cancelCalls);await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(page.locator('#failure-box')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();expect(await page.evaluate(()=>window.cancelCalls)).toBeGreaterThan(before);
});
test('actual shelter geometry builds its base first and keeps the final roof thin',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const [{createShelterStage},{shelterState}]=await Promise.all([import('/src/shelter-stage.js'),import('/src/shelter-story.js')]);
  const canvas=document.createElement('canvas');canvas.style.cssText='width:640px;height:360px';document.body.append(canvas);const stage=createShelterStage(canvas);
  try{stage.render(shelterState(210));const early=stage.inspect();stage.render(shelterState(259));const final=stage.inspect();return {early,final};}finally{stage.dispose();canvas.remove();}
 });
 expect(result.early.boards[0].visible).toBe(true);expect(result.early.boards[0].height).toBeCloseTo(.1);expect(result.early.boards.at(-1).visible).toBe(false);
 expect(result.final.roofHeight).toBeLessThan(.35);for(const b of result.final.boards){expect(b.visible).toBe(true);expect(b.height).toBeCloseTo(b.authoredHeight);}
});
