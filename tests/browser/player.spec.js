import {test,expect} from '@playwright/test';
test('silent film can play, pause, seek to end and replay',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'Odtwórz bajkę'})).toBeVisible();await page.getByRole('button',{name:'Odtwórz bajkę'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();await page.waitForTimeout(1200);await page.getByRole('button',{name:'Pauza',exact:true}).click();const slider=page.getByRole('slider',{name:'Pozycja w bajce'});const paused=await slider.inputValue();expect(Number(paused)).toBeGreaterThan(0);await page.waitForTimeout(300);expect(await slider.inputValue()).toBe(paused);await slider.fill('65');await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();await page.getByRole('button',{name:'Obejrzyj jeszcze raz'}).click();await expect(page.getByRole('button',{name:'Pauza',exact:true})).toBeVisible();expect(Number(await slider.inputValue())).toBeLessThan(2);expect(errors).toEqual([]);});
test('all story scenes render, backwards seeking and restart work without overflow',async({page})=>{await page.goto('/');const slider=page.getByRole('slider',{name:'Pozycja w bajce'});for(const t of ['5','12','21','29','42','58','0']){await slider.fill(t);await expect(slider).toHaveValue(t);await expect(page.locator('#ended')).toBeHidden();}await slider.fill('42');await page.getByRole('button',{name:'Od początku'}).click();await expect(slider).toHaveValue('0');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#film')).toBeVisible();expect(await page.locator('audio,video,iframe').count()).toBe(0);});
test('clock reaches natural end with controlled animation timestamps',async({page})=>{
  await page.clock.install({time:new Date('2026-01-01T08:00:00Z')});
  await page.goto('/');
  // Stop wall-clock auto-advancement before starting the animation.
  await page.clock.pauseAt(new Date('2026-01-01T10:00:00Z'));
  await page.getByRole('button',{name:'Odtwórz bajkę'}).click();
  await page.clock.runFor(100);
  const slider=page.getByRole('slider',{name:'Pozycja w bajce'});
  expect(Number(await slider.inputValue())).toBeGreaterThan(0);
  await page.clock.fastForward(64000);
  await page.clock.runFor(1100);
  await expect(slider).toHaveValue('65');
  await expect(page.getByRole('button',{name:'Obejrzyj jeszcze raz'})).toBeVisible();
  await expect(page.locator('#play')).toHaveAttribute('aria-label','Odtwórz ponownie');
});

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
  expect(page.url()).toContain('lang=pl');expect(new URL(page.url()).searchParams.get('demo')).toBe('1');expect(new URL(page.url()).hash).toBe('#scene');
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

test('3D garden renders, seeks backwards, switches language and episodes',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?story=garden&lang=pl');
 await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true',{timeout:20000});
 const slider=page.locator('#seek');await expect(slider).toHaveAttribute('max','90');
 const start=await page.locator('#garden-film').screenshot();
 for(const t of ['10','18','26','40','52','62','74','82','89','0']){await slider.fill(t);await expect(slider).toHaveValue(t);}
 await slider.fill('74');const grown=await page.locator('#garden-film').screenshot({path:testInfo.outputPath('garden-grown.png')});await testInfo.attach('garden-grown',{body:grown,contentType:'image/png'});expect(start.equals(grown)).toBe(false);
 await page.locator('#language').selectOption('en');await expect(slider).toHaveValue('74');await expect(page.locator('h1')).toContainText('Little Seed');
 await slider.fill('90');await expect(page.locator('#ended')).toBeVisible();await page.locator('#again').click();await expect(slider).not.toHaveValue('90');
 await page.locator('button[data-story="meadow"]').click();await expect(slider).toHaveAttribute('max','65');await expect(page.locator('#film')).toBeVisible();
 expect(errors).toEqual([]);
});
test('missing WebGL offers a working first story',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
 await page.goto('/?story=garden');await expect(page.locator('#back-to-meadow')).toBeVisible();await expect(page.locator('#play')).toBeDisabled();await page.locator('#back-to-meadow').click();await expect(page.locator('#play')).toBeEnabled();await expect(page.locator('#film')).toBeVisible();
});

test('context loss pauses garden and leaves the first story usable',async({page})=>{
 await page.goto('/?story=garden');await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true',{timeout:20000});
 await page.locator('#start').click();
 await page.locator('#garden-film').evaluate(canvas=>canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
 await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','false');await expect(page.locator('#play')).toBeDisabled();await page.locator('#back-to-meadow').click();await expect(page.locator('#play')).toBeEnabled();
});
test('finishing an async 3D load never switches the selected story',async({page})=>{
 await page.route('**/src/garden-view.js',async route=>{await new Promise(resolve=>setTimeout(resolve,400));await route.continue();});
 await page.goto('/?story=garden');await page.locator('button[data-story="meadow"]').click();await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true',{timeout:20000});await expect(page.locator('#player')).toHaveAttribute('data-story','meadow');await expect(page.locator('#seek')).toHaveValue('0');await expect(page.locator('#film')).toBeVisible();
});

test('portrait format keeps time, language and navigation for both cartoons',async({page},testInfo)=>{
 for(const story of ['meadow','garden']){
  await page.goto(`/?story=${story}&lang=en&format=portrait`);
  if(story==='garden')await expect(page.locator('#garden-film')).toHaveAttribute('data-ready','true',{timeout:20000});
  await expect(page.locator('#player')).toHaveAttribute('data-format','portrait');
  const picture=await page.locator('.picture').boundingBox();expect(picture.width/picture.height).toBeCloseTo(9/16,2);
  for(const t of story==='garden'?['0','18','52','74','0']:['0','12','29','58','0'])await page.locator('#seek').fill(t);
  await page.locator('#seek').fill('12');await page.locator('#format').selectOption('landscape');await expect(page.locator('#seek')).toHaveValue('12');await expect(page.locator('#format')).toHaveValue('landscape');
  await page.goBack();await expect(page.locator('#format')).toHaveValue('portrait');await expect(page.locator('#seek')).toHaveValue('12');
  await page.locator('#language').selectOption('pl');await expect(page.locator('#format')).toHaveValue('portrait');
  await page.screenshot({path:testInfo.outputPath(`${story}-portrait.png`),fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('export surface renders exact frames without player UI',async({page},testInfo)=>{
 for(const story of ['meadow','garden'])for(const lang of ['pl','en']){
  await page.setViewportSize({width:360,height:640});await page.goto(`/export.html?story=${story}&lang=${lang}&width=360&height=640`);await page.waitForFunction(()=>window.exportReady);
  for(const t of story==='garden'?[0,18,52,74]:[0,12,29,58]){
   await page.evaluate(t=>window.renderFrame(t),t);await page.locator('#frame').screenshot({path:testInfo.outputPath(`${story}-${lang}-${t}.png`)});
  }
  await page.evaluate(()=>window.renderFrame(0));const a=await page.locator('#frame').screenshot();await page.evaluate(()=>window.renderFrame(35));await page.evaluate(()=>window.renderFrame(0));const b=await page.locator('#frame').screenshot();expect(a.equals(b)).toBe(true);expect(await page.locator('button').count()).toBe(0);
 }
});
