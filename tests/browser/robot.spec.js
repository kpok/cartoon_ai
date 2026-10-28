import {test,expect} from '@playwright/test';
test('robot loads locally with orbit controls and preserves story navigation',async({page,baseURL})=>{
 const external=[],violations=[],errors=[];
 page.on('request',request=>{if(new URL(request.url()).origin!==new URL(baseURL).origin)external.push(request.url());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{document.addEventListener('securitypolicyviolation',event=>{window.policyViolations??=[];window.policyViolations.push(event.effectiveDirective);});});
 await page.goto('/');await page.locator('a[href="./robot.html"]').click();
 await expect(page.locator('#robot-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});
 await expect(page.locator('#robot-canvas')).toBeVisible();
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
 await page.route('**/published/robot/robot.glb',route=>route.abort());await page.goto('/robot.html');
 await expect(page.getByRole('status')).toContainText('Podgląd 3D jest niedostępny');await expect(page.locator('#preview')).toBeVisible();await expect(page.locator('#robot-canvas')).toBeHidden();await expect(page.getByRole('link',{name:'Pobierz model GLB'})).toBeVisible();
});
