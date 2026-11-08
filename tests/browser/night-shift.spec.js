import {test,expect} from '@playwright/test';
async function voices(page,available=true){await page.addInitScript(available=>{window.spoken=[];window.cancels=0;window.availableVoices=available?[{lang:'pl-PL',localService:true},{lang:'en-GB',localService:true}]:[];const synth=new EventTarget();synth.getVoices=()=>window.availableVoices;synth.cancel=()=>window.cancels++;synth.speak=u=>window.spoken.push({text:u.text,lang:u.lang});Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};},available);}
const seek=(page,t)=>page.locator('#seek').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('input'));},t);
const ready=async page=>{await page.goto('/night-shift.html');await expect(page.locator('canvas')).toHaveAttribute('data-ready','true');};
test('gallery language, live dialogue switch, captions, pause, restart and CSP',async({page,baseURL})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL).origin)external.push(r.url());});await voices(page);await page.addInitScript(()=>{window.violations=[];document.addEventListener('securitypolicyviolation',e=>window.violations.push(e.effectiveDirective));});
 await page.goto('/?lang=en');await expect(page.locator('.night-card')).toContainText('The Night Shift');await page.locator('.night-card').click();await expect(page.locator('canvas')).toHaveAttribute('data-ready','true');await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page.locator('#notice')).toContainText('dramatised');expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
 await seek(page,28);await page.locator('#play').click();expect(await page.evaluate(()=>window.spoken.at(-1).text)).toContain('Stop the line');const before=await page.evaluate(()=>window.cancels);
 await page.locator('#language').selectOption('pl');await expect(page.locator('canvas')).toHaveAttribute('data-playing','false');await expect(page.locator('#caption-text')).toContainText('Zatrzymajcie');expect(await page.evaluate(()=>window.cancels)).toBeGreaterThan(before);await expect(page.locator('#home')).toHaveAttribute('href','./?lang=pl');await expect(page).toHaveURL(/lang=pl/);
 await page.locator('#play').click();expect(await page.evaluate(()=>window.spoken.at(-1).lang)).toBe('pl-PL');await page.locator('#play').click();const time=await page.locator('canvas').getAttribute('data-time');await page.waitForTimeout(100);await expect(page.locator('canvas')).toHaveAttribute('data-time',time);
 await page.locator('#captions').uncheck();await expect(page.locator('#caption')).toBeHidden();await page.locator('#captions').check();await expect(page.locator('#caption')).toBeVisible();await page.locator('#restart').click();await expect(page.locator('canvas')).toHaveAttribute('data-time','0.000');
 expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>window.violations)).toEqual([]);
});
test('all six scenes render, deterministic seeking, chapter buttons and natural end',async({page})=>{
 await voices(page);await ready(page);const c=page.locator('canvas'),images=[];
 for(const [t,id]of [[4,'night'],[18,'line'],[30,'incident'],[47,'rescue'],[65,'flight'],[83,'investigation']]){await seek(page,t);await expect(c).toHaveAttribute('data-chapter',id);images.push(await c.screenshot());}
 for(let i=1;i<images.length;i++)expect(images[i].equals(images[i-1])).toBe(false);await seek(page,18);expect((await c.screenshot()).equals(images[1])).toBe(true);
 await page.locator('[data-chapter=rescue]').filter({hasNot:page.locator('canvas')}).last().click();await expect(c).toHaveAttribute('data-time','39.000');await expect(c).toHaveAttribute('data-playing','false');
 await seek(page,89.9);await page.locator('#play').click();await expect(c).toHaveAttribute('data-time','90.000');await expect(c).toHaveAttribute('data-playing','false');await expect(page.locator('#ending')).toBeVisible();await page.locator('#language').selectOption('en');await expect(page.locator('#ending')).toContainText('under investigation');await page.locator('#play').click();await expect.poll(async()=>Number(await c.getAttribute('data-time'))).toBeLessThan(3);await page.locator('#play').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('missing voice, mute, late voice and hidden page keep film usable',async({page})=>{
 await voices(page,false);await ready(page);await expect(page.locator('#audio-status')).toContainText('Brak polskiego głosu');await seek(page,40);await page.locator('#play').click();await expect(page.locator('#caption-text')).toContainText('Ratownicy');expect(await page.evaluate(()=>window.spoken.length)).toBe(0);
 await page.evaluate(()=>{window.availableVoices.push({lang:'pl-PL',localService:true});speechSynthesis.dispatchEvent(new Event('voiceschanged'));});await expect.poll(()=>page.evaluate(()=>window.spoken.length)).toBe(1);await page.locator('#speech').uncheck();const count=await page.evaluate(()=>window.spoken.length);await seek(page,47);await page.locator('#play').click();expect(await page.evaluate(()=>window.spoken.length)).toBe(count);
 const before=await page.evaluate(()=>window.cancels);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('canvas')).toHaveAttribute('data-playing','false');expect(await page.evaluate(()=>window.cancels)).toBeGreaterThan(before);
});
test('WebGL failure keeps translated navigation and stops all playback controls',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:get.call(this,t,...a);};});await page.goto('/night-shift.html');await expect(page.locator('#failure-box')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await page.locator('#language').selectOption('en');await expect(page.locator('#failure')).toContainText('unavailable');await expect(page.locator('#fallback')).toHaveAttribute('href','./?lang=en');
});
test('context loss while speaking cancels speech and retains recovery navigation',async({page})=>{
 await voices(page);await ready(page);await seek(page,28);await page.locator('#play').click();const before=await page.evaluate(()=>window.cancels);await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(page.locator('#failure-box')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();expect(await page.evaluate(()=>window.cancels)).toBeGreaterThan(before);
});
test('portrait/landscape selection keeps playback, language, sound preferences and exact picture ratio',async({page})=>{
 await voices(page);await ready(page);const c=page.locator('canvas'),picture=page.locator('.picture');
 const narrow=page.viewportSize().width<=650;await expect(page.locator('#format')).toHaveValue(narrow?'portrait':'landscape');
 await page.locator('#format').selectOption('portrait');let rect=await picture.boundingBox();expect(rect.width/rect.height).toBeCloseTo(9/16,2);
 await seek(page,47);await page.locator('#speech').uncheck();await page.locator('#play').click();const before=Number(await c.getAttribute('data-time'));
 await page.locator('#format').selectOption('landscape');await expect(c).toHaveAttribute('data-playing','true');expect(Number(await c.getAttribute('data-time'))).toBeGreaterThanOrEqual(before);await expect(page.locator('#speech')).not.toBeChecked();await expect(page.locator('#music')).not.toBeChecked();rect=await picture.boundingBox();expect(rect.width/rect.height).toBeCloseTo(16/9,2);
 await page.locator('#play').click();await seek(page,65);await page.locator('#format').selectOption('portrait');await expect(c).toHaveAttribute('data-time','65.000');await expect(c).toHaveAttribute('data-playing','false');
 await page.locator('#language').selectOption('en');await expect(page.locator('#format-label')).toHaveText('Picture format');await expect(page.locator('#format')).toHaveValue('portrait');await expect(page).toHaveURL(/format=portrait/);await expect(c).toHaveAttribute('data-time','65.000');
 await page.reload();await expect(c).toHaveAttribute('data-ready','true');await expect(page.locator('#language')).toHaveValue('en');await expect(page.locator('#format')).toHaveValue('portrait');
 await page.goto('/night-shift.html?lang=en&format=landscape');await expect(c).toHaveAttribute('data-ready','true');await expect(page.locator('#format')).toHaveValue('landscape');rect=await picture.boundingBox();expect(rect.width/rect.height).toBeCloseTo(16/9,2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('portrait camera fits all authored subject bounds including moving rotor extremes',async({page})=>{
 await page.goto('/night-shift.html?format=portrait');await expect(page.locator('canvas')).toHaveAttribute('data-ready','true');
 const results=await page.evaluate(async()=>{
  const [{createNightStage},{stateAt}]=await Promise.all([import('/src/night-shift-stage.js'),import('/src/night-shift-story.js')]);const canvas=document.createElement('canvas');canvas.style.cssText='width:270px;height:480px';document.body.append(canvas);const stage=createNightStage(canvas),results=[];
  try{for(const t of [0,11.9,12,26.9,27,38.9,39,56.9,57,59.9,60,62,66,68.9,69,72.9,73,90]){stage.render(stateAt(t));results.push({time:t,...stage.inspect()});}return results;}finally{stage.dispose();canvas.remove();}
 });
 for(const result of results){expect(result.aspect).toBeCloseTo(9/16,5);for(const point of result.subjectCorners){expect(Math.abs(point.x),`t=${result.time}`).toBeLessThanOrEqual(.841);expect(Math.abs(point.y),`t=${result.time}`).toBeLessThanOrEqual(.841);expect(point.z).toBeGreaterThan(-1);expect(point.z).toBeLessThan(1);}}
});
test('portrait stays selected after WebGL failure and in fullscreen layout',async({page})=>{
 await ready(page);await page.locator('#format').selectOption('portrait');
 await page.evaluate(async()=>{await document.querySelector('#player').requestFullscreen();});
 const rect=await page.locator('.picture').boundingBox();expect(rect.width/rect.height).toBeCloseTo(9/16,2);await page.evaluate(async()=>{await document.exitFullscreen();});
 await page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(page.locator('#failure-box')).toBeVisible();await page.locator('#language').selectOption('en');await expect(page.locator('#format')).toHaveValue('portrait');await page.locator('#format').selectOption('landscape');await expect(page.locator('#format')).toHaveValue('landscape');await expect(page.locator('#fallback')).toBeVisible();
});
