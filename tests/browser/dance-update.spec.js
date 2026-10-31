import {test,expect} from '@playwright/test';
const ready=async page=>{await page.goto('/dance-update.html');await expect(page.locator('#robot-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});};
test('pilot starts paused, controls sound and seeks without resuming or leaking sources',async({page})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).hostname!=='127.0.0.1')external.push(r.url());});
 await page.addInitScript(()=>{window.policyViolations=[];document.addEventListener('securitypolicyviolation',e=>window.policyViolations.push(e.effectiveDirective));});
 await ready(page);const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-playing','false');
 await page.locator('#play').click();await expect(canvas).toHaveAttribute('data-audio-playing','true');await expect.poll(async()=>Number(await canvas.getAttribute('data-time'))).toBeGreaterThan(.1);
 await page.locator('#mute').click();await expect(canvas).toHaveAttribute('data-audio-playing','false');await expect(canvas).toHaveAttribute('data-muted','true');
 await page.locator('#play').click();const t=await canvas.getAttribute('data-time');await page.waitForTimeout(180);expect(await canvas.getAttribute('data-time')).toBe(t);
 await page.locator('#seek').evaluate(el=>{el.value='18';el.dispatchEvent(new Event('input'));});await expect(canvas).toHaveAttribute('data-time','18.000');await expect(canvas).toHaveAttribute('data-playing','false');
 await page.locator('#mute').click();await page.locator('#play').click();await expect(canvas).toHaveAttribute('data-audio-playing','true');
 await page.locator('#restart').click();await expect(canvas).toHaveAttribute('data-time','0.000');await expect(canvas).toHaveAttribute('data-audio-playing','false');
 expect(errors).toEqual([]);expect(external).toEqual([]);expect(await page.evaluate(()=>window.policyViolations)).toEqual([]);
});
test('portrait export frames are repeatable, bounded and include all story beats',async({page})=>{
 await page.setViewportSize({width:360,height:640});await page.goto('/dance-update.html?export=1');await page.waitForFunction(()=>window.robotExportReady===true);
 const canvas=page.locator('#robot-canvas');expect(await page.evaluate(()=>window.renderRobotFrame(.65))).toEqual({time:.65,width:360,height:640});const first=await canvas.screenshot();
 for(const t of [4,9,14,18,22,23.5]){await page.evaluate(t=>window.renderRobotFrame(t),t);expect((await canvas.screenshot()).equals(first)).toBe(false);}
 await page.evaluate(()=>window.renderRobotFrame(.65));expect((await canvas.screenshot()).equals(first)).toBe(true);
 for(const t of [-1,24,NaN])await expect(page.evaluate(t=>window.renderRobotFrame(t),t)).rejects.toThrow('Invalid robot export frame');
 await expect(page.locator('#play')).toBeHidden();await expect(canvas).toHaveAttribute('data-audio-playing','false');
 const bounds=await page.evaluate(()=>{let maxX=0,maxY=0;for(let i=0;i<576;i++){const b=window.inspectUpdateFrame(i/24);maxX=Math.max(maxX,b.x);maxY=Math.max(maxY,b.y);}return {maxX,maxY};});
 expect(bounds.maxX).toBeLessThan(.95);expect(bounds.maxY).toBeLessThan(.95);
});
test('pilot ends at24s and preserves its last frame until explicitly replayed',async({page})=>{
 await ready(page);const c=page.locator('#robot-canvas');await page.locator('#seek').evaluate(el=>{el.value='23.85';el.dispatchEvent(new Event('input'));});
 await page.locator('#play').click();await expect(c).toHaveAttribute('data-time','24.000');await expect(c).toHaveAttribute('data-playing','false');await expect(c).toHaveAttribute('data-audio-playing','false');
 await page.waitForTimeout(150);await expect(c).toHaveAttribute('data-time','24.000');
});
test('failed model and lost context stop the film with a useful fallback',async({page})=>{
 await page.route('**/published/robot/robot.glb',r=>r.abort());await page.goto('/dance-update.html');await expect(page.locator('#status')).toContainText('Nie udało');await expect(page.locator('#preview')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();
 await page.unroute('**/published/robot/robot.glb');await ready(page);await page.locator('#play').click();await page.locator('#robot-canvas').evaluate(el=>el.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(page.locator('#robot-canvas')).toBeHidden();await expect(page.locator('#robot-canvas')).toHaveAttribute('data-audio-playing','false');await expect(page.locator('#play')).toBeDisabled();
});
test('a delayed audio resume cannot restart playback after a seek',async({page})=>{
 await page.addInitScript(()=>{const original=AudioContext.prototype.resume;AudioContext.prototype.resume=function(){return new Promise((resolve,reject)=>{window.releasePilotAudio=()=>original.call(this).then(resolve,reject);});};});
 await ready(page);await page.locator('#play').click();await page.waitForFunction(()=>Boolean(window.releasePilotAudio));
 await page.locator('#seek').evaluate(el=>{el.value='12';el.dispatchEvent(new Event('input'));});await page.evaluate(()=>window.releasePilotAudio());
 await expect(page.locator('#robot-canvas')).toHaveAttribute('data-time','12.000');await expect(page.locator('#robot-canvas')).toHaveAttribute('data-playing','false');
});

test('hidden document pauses audio and never resumes it automatically',async({page})=>{
 await ready(page);const canvas=page.locator('#robot-canvas');await page.locator('#play').click();await expect(canvas).toHaveAttribute('data-audio-playing','true');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await expect(canvas).toHaveAttribute('data-playing','false');await expect(canvas).toHaveAttribute('data-audio-playing','false');const time=await canvas.getAttribute('data-time');
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(150);await expect(canvas).toHaveAttribute('data-time',time);
});
test('audio failure gives a silent working player instead of blocking playback',async({page})=>{
 await page.addInitScript(()=>{AudioContext.prototype.resume=()=>Promise.reject(new Error('Unavailable audio device'));});
 await ready(page);await page.locator('#play').click();await expect(page.locator('#status')).toContainText('Dźwięk niedostępny');await expect(page.locator('#mute')).toBeDisabled();
 await expect.poll(async()=>Number(await page.locator('#robot-canvas').getAttribute('data-time'))).toBeGreaterThan(.1);await expect(page.locator('#robot-canvas')).toHaveAttribute('data-audio-playing','false');await page.locator('#play').click();await expect(page.locator('#robot-canvas')).toHaveAttribute('data-playing','false');
});
