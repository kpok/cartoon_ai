import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {referenceCamera} from './camera.js';
const output=new URL('output/',import.meta.url);await mkdir(output,{recursive:true});
const server=spawn(process.execPath,[new URL('serve.mjs',import.meta.url).pathname]);let browser;
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Preview startup timeout')),10000);server.stdout.once('data',()=>{clearTimeout(timer);resolve();});server.once('error',e=>{clearTimeout(timer);reject(e);});server.once('exit',code=>{clearTimeout(timer);reject(new Error('Preview exited: '+code));});});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1024,height:1536},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3001/experiments/salsa-human-models/index.html?comparison=1');await page.waitForSelector('html[data-ready="true"]');
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 if(errors.length)throw new Error(errors.join('\n'));
 await page.locator('canvas[data-view="front"]').screenshot({path:new URL('render.png',output).pathname});
 await writeFile(new URL('capture.json',output),JSON.stringify({camera:referenceCamera,browser:browser.version(),renderer:'Chromium WebGL / SwiftShader',deviceScaleFactor:1},null,2));
 console.log('Fixed-camera 1024×1536 render captured.');
}finally{await browser?.close();server.kill();}
