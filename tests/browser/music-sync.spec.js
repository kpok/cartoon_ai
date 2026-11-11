import {test,expect} from '@playwright/test';
test('103 BPM preview keeps seeking and export on the musical timeline',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/robot.html?dance=macarena&sync=music&export=1');
 await page.waitForFunction(()=>window.robotExportReady===true);
 const duration=64*60/103;await expect(page.locator('#dance-time')).toHaveAttribute('max',String(duration));
 const t=15*60/103+.001;await page.evaluate(t=>window.renderRobotFrame(t),t);
 await expect(page.locator('#dance-readout')).toContainText('Podskok i obrót');
 await page.evaluate(()=>window.renderRobotFrame(0));await expect(page.locator('#robot-canvas')).toHaveAttribute('data-time','0.000');
 await expect(page.evaluate(t=>window.renderRobotFrame(t),duration)).rejects.toThrow('Invalid robot export frame');
});
