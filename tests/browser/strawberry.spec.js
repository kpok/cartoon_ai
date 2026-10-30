import {test,expect} from '@playwright/test';
const seek=async(page,time)=>page.locator('#seek').evaluate((input,t)=>{input.value=String(t);input.dispatchEvent(new Event('input',{bubbles:true}));},time);
async function ready(page,path='/strawberry.html'){await page.goto(path);await expect(page.locator('#strawberry-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});}

test('fifth tile preserves four earlier stories and opens a silent local WebGL film',async({page,baseURL})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL).origin)external.push(r.url());});
 await page.addInitScript(()=>{window.audioCalls=0;window.violations=[];for(const key of ['AudioContext','webkitAudioContext','Audio']){if(window[key])window[key]=class{constructor(){window.audioCalls++;throw Error('Unexpected audio');}};}if(window.speechSynthesis)window.speechSynthesis.speak=()=>{window.audioCalls++;};document.addEventListener('securitypolicyviolation',e=>window.violations.push(e.effectiveDirective));});
 await page.goto('/?lang=en');const gallery=page.locator('.story-library');await expect(gallery.locator(':scope > button, :scope > a')).toHaveCount(5);
 await expect(gallery.locator('button[data-story="meadow"]')).toBeVisible();await expect(gallery.locator('button[data-story="garden"]')).toBeVisible();await expect(gallery.locator('a[href="./robot.html"]')).toBeVisible();await expect(gallery.locator('a[href="./robot.html?dance=kalinka"]')).toBeVisible();
 await page.getByRole('link',{name:/The Last Strawberry/}).click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 const canvas=page.locator('#strawberry-canvas');await expect(canvas).toHaveAttribute('data-ready','true');await expect(canvas).toHaveAttribute('data-playing','false');
 await page.locator('#watch').click();await expect.poll(async()=>Number(await canvas.getAttribute('data-time'))).toBeGreaterThan(.1);
 await page.locator('#play').click();const time=await canvas.getAttribute('data-time');await page.waitForTimeout(180);await expect(canvas).toHaveAttribute('data-time',time);
 const first=await canvas.screenshot();await seek(page,90);await expect(canvas).toHaveAttribute('data-chapter','ride');const ride=await canvas.screenshot();expect(ride.equals(first)).toBe(false);
 await seek(page,150);await expect(canvas).toHaveAttribute('data-chapter','share');expect((await canvas.screenshot()).equals(ride)).toBe(false);
 await seek(page,0);const zero=await canvas.screenshot();await seek(page,135);await seek(page,0);expect((await canvas.screenshot()).equals(zero)).toBe(true);
 await page.getByRole('button',{name:/2:35/}).click();await expect(canvas).toHaveAttribute('data-chapter','apple');await expect(canvas).toHaveAttribute('data-playing','false');
 await seek(page,160);await expect(page.locator('#ended')).toBeVisible();await expect(canvas).toHaveAttribute('data-playing','false');await page.locator('#again').click();await expect.poll(async()=>Number(await canvas.getAttribute('data-time'))).toBeLessThan(5);
 await page.locator('#play').click();await page.locator('#restart').click();await expect(canvas).toHaveAttribute('data-time','0.000');
 expect(await page.locator('audio,video').count()).toBe(0);expect(await page.evaluate(()=>window.audioCalls)).toBe(0);expect(await page.evaluate(()=>window.violations)).toEqual([]);expect(external).toEqual([]);expect(errors).toEqual([]);
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));expect(size.scroll).toBeLessThanOrEqual(size.width);
 await page.locator('#home').click();await expect(gallery).toBeVisible();
});

test('reduced motion waits for user, language changes preserve time, and context loss offers home navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);const canvas=page.locator('#strawberry-canvas');await expect(canvas).toHaveAttribute('data-playing','false');
 await page.locator('#watch').click();await page.locator('#play').click();await seek(page,140);await page.locator('#language').selectOption('en');await expect(canvas).toHaveAttribute('data-time','140.000');await expect(page.locator('#chapter-title')).toHaveText('A little help');
 await canvas.evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(page.locator('#failure')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await expect(page.locator('#seek')).toBeDisabled();await expect(page.locator('#chapters button').first()).toBeDisabled();await expect(page.locator('#fallback-link')).toBeVisible();
});

test('missing WebGL presents a readable fallback without an uncaught error',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args);};});
 await page.goto('/strawberry.html');await expect(page.locator('#failure')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await page.locator('#fallback-link').click();await expect(page.locator('.story-library')).toBeVisible();
});
