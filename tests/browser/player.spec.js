import {test,expect} from '@playwright/test';
test('silent film can play, pause, seek to end and replay',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'Odtwórz bajkę'})).toBeVisible();await page.getByRole('button',{name:'Odtwórz bajkę'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Pauza',exact:true}).click();const slider=page.getByRole('slider',{name:'Pozycja w bajce'});const paused=await slider.inputValue();expect(Number(paused)).toBeGreaterThan(0);await page.waitForTimeout(300);expect(await slider.inputValue()).toBe(paused);await slider.fill('65');await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();await page.getByRole('button',{name:'Obejrzyj jeszcze raz'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();expect(Number(await slider.inputValue())).toBeLessThan(2);expect(errors).toEqual([]);});
test('all story scenes render, backwards seeking and restart work without overflow',async({page})=>{await page.goto('/');const slider=page.getByRole('slider',{name:'Pozycja w bajce'});for(const t of ['5','12','21','29','42','58','0']){await slider.fill(t);await expect(slider).toHaveValue(t);await expect(page.locator('#ended')).toBeHidden();}await slider.fill('42');await page.getByRole('button',{name:'Od początku'}).click();await expect(slider).toHaveValue('0');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#film')).toBeVisible();expect(await page.locator('audio,video,iframe').count()).toBe(0);});
test('clock reaches natural end without waiting two minutes',async({page})=>{await page.clock.install();await page.goto('/');await page.getByRole('button',{name:'Odtwórz bajkę'}).click();await page.clock.fastForward(64000);await page.clock.runFor(1200);await expect(page.getByRole('slider',{name:'Pozycja w bajce'})).toHaveValue('65');await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();});

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
  await page.getByRole('slider',{name:'Pozycja w bajce'}).fill('10');
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

test('English link, translated speech and switching preserve playback preferences',async({page})=>{
  await page.addInitScript(()=>{
    const spoken=[];let cancels=0;
    const voices=[{lang:'pl-PL',localService:true},{lang:'en-GB',localService:true}];
    Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>voices,speak:u=>spoken.push({text:u.text,lang:u.lang}),cancel:()=>cancels++,addEventListener(){}}});
    Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text;}}});
    window.languageTest={spoken,get cancels(){return cancels;}};
  });
  await page.goto('/?lang=en&demo=1#scene');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('heading',{level:1})).toHaveText('Kitten and Butterfly.');
  await expect(page.getByRole('button',{name:'Play the story',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'♫ Music',exact:true}).click();
  await page.getByRole('slider',{name:'Music volume',exact:true}).fill('25');
  await page.getByRole('slider',{name:'Story position',exact:true}).fill('10');
  await expect(page.locator('#subtitle')).toContainText('Kitten: Hello, little butterfly!');
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>window.languageTest.spoken[0]?.lang)).toBe('en-GB');
  await page.locator('#language').selectOption('pl');
  await expect(page.locator('html')).toHaveAttribute('lang','pl');
  await expect(page.getByRole('button',{name:'Odtwórz',exact:true})).toBeVisible();
  await expect(page.locator('#subtitle')).toContainText('Kotek: Cześć, motylku!');
  const position=Number(await page.locator('#seek').inputValue());expect(position).toBeGreaterThanOrEqual(10);expect(position).toBeLessThan(13);
  await expect(page.locator('#music')).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('#volume')).toHaveValue('25');
  expect(await page.evaluate(()=>window.languageTest.cancels)).toBeGreaterThan(0);
  expect(page.url()).toContain('lang=pl');expect(page.url()).toContain('demo=1#scene');
  await page.goBack();await expect(page.locator('html')).toHaveAttribute('lang','en');
  await expect(page.getByRole('button',{name:'Play',exact:true})).toBeVisible();
  await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('English voice fallback and translated end screen work',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'pl-PL',localService:true}],cancel(){},addEventListener(){}}}));
  await page.goto('/?lang=en');
  await expect(page.locator('#sound-status')).toContainText('No English voice');
  await page.getByRole('slider',{name:'Story position',exact:true}).fill('65');
  await expect(page.getByRole('button',{name:'Watch again',exact:true})).toBeVisible();
  await expect(page.locator('#ended')).toContainText('Good night, little kitten.');
  await page.getByRole('button',{name:'Watch again',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
});

test('unsupported language parameter falls back to Polish',async({page})=>{
  await page.goto('/?lang=unknown');
  await expect(page.locator('html')).toHaveAttribute('lang','pl');
  await expect(page.locator('#language')).toHaveValue('pl');
  await expect(page.getByRole('button',{name:'Odtwórz bajkę',exact:true})).toBeVisible();
});

test('3D garden renders, seeks backwards, switches language and episodes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?story=garden&lang=pl');
 await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true',{timeout:20000});
 const slider=page.locator('#seek');await expect(slider).toHaveAttribute('max','90');
 const start=await page.locator('#garden-film').screenshot();
 for(const t of ['10','18','26','40','52','62','74','82','89','0']){await slider.fill(t);await expect(slider).toHaveValue(t);}
 await slider.fill('74');const grown=await page.locator('#garden-film').screenshot();expect(start.equals(grown)).toBe(false);
 await page.locator('#language').selectOption('en');await expect(slider).toHaveValue('74');await expect(page.locator('h1')).toContainText('Little Seed');
 await slider.fill('90');await expect(page.locator('#ended')).toBeVisible();await page.locator('#again').click();await expect(slider).not.toHaveValue('90');
 await page.locator('button[data-story="meadow"]').click();await expect(slider).toHaveAttribute('max','65');await expect(page.locator('#film')).toBeVisible();
 expect(errors).toEqual([]);
});
test('missing WebGL offers a working first story',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
 await page.goto('/?story=garden');await expect(page.locator('#back-to-meadow')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await page.locator('#back-to-meadow').click();await expect(page.locator('#play')).toBeEnabled();await expect(page.locator('#film')).toBeVisible();
});
