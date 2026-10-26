import {test,expect} from '@playwright/test';
test('silent film can play, pause, seek to end and replay',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'Odtwórz bajkę'})).toBeVisible();await page.getByRole('button',{name:'Odtwórz bajkę'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Pauza',exact:true}).click();const slider=page.getByRole('slider',{name:'Pozycja w bajce'});const paused=await slider.inputValue();expect(Number(paused)).toBeGreaterThan(0);await page.waitForTimeout(300);expect(await slider.inputValue()).toBe(paused);await slider.fill('120');await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();await page.getByRole('button',{name:'Obejrzyj jeszcze raz'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();expect(Number(await slider.inputValue())).toBeLessThan(2);expect(errors).toEqual([]);});
test('all story scenes render, backwards seeking and restart work without overflow',async({page})=>{await page.goto('/');const slider=page.getByRole('slider',{name:'Pozycja w bajce'});for(const t of ['10','28','48','68','88','115','0']){await slider.fill(t);await expect(slider).toHaveValue(t);await expect(page.locator('#ended')).toBeHidden();}await slider.fill('88');await page.getByRole('button',{name:'Od początku'}).click();await expect(slider).toHaveValue('0');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('canvas')).toBeVisible();expect(await page.locator('audio,video,iframe').count()).toBe(0);});
test('clock reaches natural end without waiting two minutes',async({page})=>{await page.clock.install();await page.goto('/');await page.getByRole('button',{name:'Odtwórz bajkę'}).click();await page.clock.fastForward(119000);await page.clock.runFor(1200);await expect(page.getByRole('slider',{name:'Pozycja w bajce'})).toHaveValue('120');await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();});

test('audio controls, Polish captions and missing-voice fallback',async({page})=>{
  await page.addInitScript(()=>{
    const voices=[];const spoken=[];let cancels=0;
    Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>voices,speak:u=>spoken.push(u.text),cancel:()=>cancels++,addEventListener(){}}});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text;}}});
    window.audioTest={voices,spoken,get cancels(){return cancels;}};
  });
  await page.goto('/');
  await expect(page.locator('#sound-status')).toContainText('Brak polskiego głosu');
  const music=page.getByRole('button',{name:'♫ Muzyka',exact:true});
  await music.click();await expect(music).toHaveAttribute('aria-pressed','false');
  await page.getByRole('slider',{name:'Pozycja w bajce'}).fill('24');
  await expect(page.locator('#subtitle')).toContainText('Cześć, motylku!');
  await page.getByLabel('Napisy',{exact:true}).uncheck();await expect(page.locator('#subtitle')).toBeHidden();
  await page.getByLabel('Napisy',{exact:true}).check();
  await page.evaluate(()=>window.audioTest.voices.push({lang:'pl-PL',localService:true}));
  await page.getByRole('button',{name:'Odtwórz',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.audioTest.spoken.length)).toBe(1);
  await page.getByRole('button',{name:'◌ Dialogi',exact:true}).click();
  await expect(page.getByRole('button',{name:'◌ Dialogi',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Pauza',exact:true}).click();
  expect(await page.evaluate(()=>window.audioTest.cancels)).toBeGreaterThan(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
