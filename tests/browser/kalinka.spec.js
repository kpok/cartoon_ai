import {test,expect} from '@playwright/test';
const seek=async(page,t)=>page.locator('#dance-time').evaluate((e,t)=>{e.value=t;e.dispatchEvent(new Event('input',{bubbles:true}));},t);
async function load(page,path='/robot.html?dance=kalinka'){await page.goto(path);await expect(page.locator('#robot-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});}

test('Kalinka loads a spatial scene, energetic split and deterministic drone camera with manual override',async({page,baseURL})=>{
 const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL).origin)external.push(r.url());});
 await page.addInitScript(()=>{window.violations=[];document.addEventListener('securitypolicyviolation',e=>window.violations.push(e.effectiveDirective));});
 await load(page);const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-background','photo');await expect(canvas).toHaveAttribute('data-camera','auto');await page.locator('#dance-toggle').click();
 await seek(page,4);const kicks=await canvas.screenshot(),camera=await canvas.getAttribute('data-camera-position');
 await seek(page,11);await expect(page.locator('#dance-readout')).toContainText('szpagat');const split=await canvas.screenshot();expect(split.equals(kicks)).toBe(false);expect(await canvas.getAttribute('data-camera-position')).not.toBe(camera);
 await seek(page,4);expect((await canvas.screenshot()).equals(kicks)).toBe(true);expect(await canvas.getAttribute('data-camera-position')).toBe(camera);
 await page.getByRole('button',{name:'Obróć w lewo'}).click();await expect(canvas).toHaveAttribute('data-camera','manual');const manual=await canvas.screenshot();expect(manual.equals(kicks)).toBe(false);
 await page.locator('#camera-auto').click();await expect(canvas).toHaveAttribute('data-camera','auto');expect((await canvas.screenshot()).equals(kicks)).toBe(true);
 await page.locator('#dance-restart').click();await expect(canvas).toHaveAttribute('data-time','0.000');await expect(canvas).toHaveAttribute('data-playing','false');
 expect(await page.evaluate(()=>window.violations)).toEqual([]);expect(errors).toEqual([]);expect(external).toEqual([]);
 await page.locator('a[href="./robot.html"]').click();await expect(canvas).toHaveAttribute('data-ready','true');await expect(page.locator('#camera-auto')).toBeHidden();
});

test('reduced motion disables camera autoplay and an unavailable backdrop retains real 3D foreground',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/assets/kalinka/red-square-ai.png',r=>r.abort());await load(page);const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-playing','false');await expect(canvas).toHaveAttribute('data-camera','manual');await expect(canvas).toHaveAttribute('data-background','fallback');
 await seek(page,11);await expect(page.locator('#dance-readout')).toContainText('szpagat');await page.locator('#camera-auto').click();await expect(canvas).toHaveAttribute('data-camera','auto');
 await canvas.evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(canvas).toBeHidden();await expect(page.locator('#camera-auto')).toBeDisabled();await expect(page.locator('#preview')).toBeVisible();
});

test('Kalinka export frames remain deterministic with their own camera and duration',async({page})=>{
 await page.setViewportSize({width:360,height:640});await page.goto('/robot.html?dance=kalinka&export=1');await page.waitForFunction(()=>window.robotExportReady===true);
 const canvas=page.locator('#robot-canvas');await page.evaluate(()=>window.renderRobotFrame(11));const split=await canvas.screenshot();await page.evaluate(()=>window.renderRobotFrame(4));expect((await canvas.screenshot()).equals(split)).toBe(false);await page.evaluate(()=>window.renderRobotFrame(11));expect((await canvas.screenshot()).equals(split)).toBe(true);
 await expect(page.evaluate(()=>window.renderRobotFrame(24))).rejects.toThrow('Invalid robot export frame');
});
