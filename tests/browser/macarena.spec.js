import {captureRobotFrame} from './robot-frames.js';
import {test,expect} from '@playwright/test';
test('Macarena tile opens local fiesta and deterministic portrait export frames',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.locator('a[href="./robot.html?dance=macarena"]').click();await expect(page.locator('#robot-canvas')).toHaveAttribute('data-ready','true',{timeout:30000});await expect(page.locator('#robot-canvas')).toHaveAttribute('data-background','photo');
 await page.setViewportSize({width:390,height:844});await page.goto('/robot.html?dance=macarena&export=1');await page.waitForFunction(()=>window.robotExportReady===true);
 const a=await captureRobotFrame(page,3.4);await expect(page.locator('#dance-readout')).toContainText('za głowę');
 const jump=await captureRobotFrame(page,7.8),restored=await captureRobotFrame(page,3.4);
 if(!restored.equals(a)||jump.equals(a))for(const [name,body]of [['initial',a],['jump',jump],['restored',restored]])await testInfo.attach(name,{body,contentType:'image/png'});
 expect(jump.equals(a)).toBe(false);expect(restored.equals(a)).toBe(true);expect(errors).toEqual([]);
 await expect(page.evaluate(()=>window.renderRobotFrame(32))).rejects.toThrow('Invalid robot export frame');
});
