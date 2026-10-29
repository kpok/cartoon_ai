import {test,expect} from '@playwright/test';
test('robot loads locally with orbit controls and preserves story navigation',async({page,baseURL})=>{
 const external=[],violations=[],errors=[];
 page.on('request',request=>{if(new URL(request.url()).origin!==new URL(baseURL).origin)external.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{document.addEventListener('securitypolicyviolation',event=>{window.policyViolations??=[];window.policyViolations.push(event.effectiveDirective);});});
 await page.goto('/');await page.locator('a[href="./robot.html"]').click();
 await expect(page.locator('#robot-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});
 await expect(page.locator('#robot-canvas')).toBeVisible();
 const manifest=await (await page.request.get('/published/robot/manifest.json')).json();
 expect(manifest.body).toBe('humanoid');
 const binary=await (await page.request.get('/published/robot/robot.glb')).body();
 const jsonLength=binary.readUInt32LE(12),gltf=JSON.parse(binary.subarray(20,20+jsonLength).toString('utf8'));
 const names=gltf.nodes.map(node=>node.name);
 for(const side of ['Left','Right'])for(const part of ['short thigh','knee joint','short shin','rounded foot'])expect(names).toContain(`${side} ${part}`.replaceAll(" ","_"));

 await page.getByRole('button',{name:'Wstrzymaj taniec'}).click();await page.waitForTimeout(300);
 const canvas=page.locator('#robot-canvas'),initial=await canvas.screenshot();
 await page.getByRole('button',{name:'Obróć w lewo'}).click();
 await expect.poll(async()=>!(await canvas.screenshot()).equals(initial),{timeout:10000}).toBe(true);
 await page.getByRole('button',{name:'Przybliż model'}).click();await page.getByRole('button',{name:'Widok początkowy'}).click();
 const box=await canvas.boundingBox();
 await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.5,{steps:5});await page.mouse.up();
 expect(await page.evaluate(()=>window.policyViolations||[])).toEqual(violations);expect(external).toEqual([]);expect(errors).toEqual([]);
 await page.getByRole('link',{name:'Małe historie'}).click();await expect(page.locator('button[data-story="meadow"]')).toBeVisible();await expect(page.locator('button[data-story="garden"]')).toBeVisible();
});
test('robot failed download retains useful PNG fallback',async({page})=>{
 await page.route('**/published/robot/robot.glb*',route=>route.abort());await page.goto('/robot.html');
 await expect(page.getByRole('status')).toContainText('Podgląd 3D jest niedostępny');await expect(page.locator('#preview')).toBeVisible();await expect(page.locator('#robot-canvas')).toBeHidden();await expect(page.getByRole('link',{name:'Pobierz model GLB'})).toBeVisible();
});

test('dance advances, pauses and restarts independently of orbit',async({page})=>{
 await page.goto('/robot.html');const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-ready','true');
 await expect.poll(async()=>Number(await canvas.getAttribute('data-time'))).toBeGreaterThan(.2);
 await page.locator('#dance-toggle').click();const time=await canvas.getAttribute('data-time');await page.waitForTimeout(250);expect(await canvas.getAttribute('data-time')).toBe(time);
 await page.getByRole('button',{name:'Obróć w lewo'}).click();expect(await canvas.getAttribute('data-time')).toBe(time);
 await page.locator('#dance-restart').click();await expect(canvas).toHaveAttribute('data-time','0.000');
 await page.locator('#dance-toggle').click();await expect.poll(async()=>Number(await canvas.getAttribute('data-time'))).toBeGreaterThan(.2);
});
test('reduced motion pauses autoplay and context loss stops rendering',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/robot.html');const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-ready','true');await expect(canvas).toHaveAttribute('data-playing','false');
 await canvas.evaluate(element=>element.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(canvas).toBeHidden();await expect(page.locator('#preview')).toBeVisible();await expect(page.locator('#dance-toggle')).toBeDisabled();
});

test('timeline seeks to reference gestures while paused and orbit remains usable',async({page})=>{
 await page.goto('/robot.html');const canvas=page.locator('#robot-canvas');await expect(canvas).toHaveAttribute('data-ready','true');await page.locator('#dance-toggle').click();
 const seek=async time=>{await page.locator('#dance-time').evaluate((element,value)=>{element.value=value;element.dispatchEvent(new Event('input',{bubbles:true}));},time);};
 await seek(2);await expect(canvas).toHaveAttribute('data-time','2.000');await expect(page.locator('#dance-readout')).toContainText('Powitanie');
 const wave=await canvas.screenshot();await seek(22.5);await expect(page.locator('#dance-readout')).toContainText('przysiad');
 await expect.poll(async()=>!(await canvas.screenshot()).equals(wave)).toBe(true);
 await page.getByRole('button',{name:'Obróć w lewo'}).click();await expect(canvas).toHaveAttribute('data-time','22.500');
 await page.locator('#dance-restart').click();await expect(canvas).toHaveAttribute('data-time','0.000');await expect(page.locator('#dance-time')).toHaveValue('0');
});
test('robot export renders exact repeatable frames without player controls',async({page})=>{
 await page.setViewportSize({width:360,height:640});await page.goto('/robot.html?export=1');
 await page.waitForFunction(()=>window.robotExportReady===true);const canvas=page.locator('#robot-canvas');
 expect(await page.evaluate(()=>window.renderRobotFrame(0))).toEqual({time:0,width:360,height:640});const first=await canvas.screenshot();
 await page.evaluate(()=>window.renderRobotFrame(22.5));expect((await canvas.screenshot()).equals(first)).toBe(false);
 await page.evaluate(()=>window.renderRobotFrame(0));expect((await canvas.screenshot()).equals(first)).toBe(true);
 await expect(page.evaluate(()=>window.renderRobotFrame(-1))).rejects.toThrow('Invalid robot export frame');
});
