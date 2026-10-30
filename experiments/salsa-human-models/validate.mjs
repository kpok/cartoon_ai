import {spawn} from 'node:child_process';

import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const output=new URL('./output/',import.meta.url);await mkdir(output,{recursive:true});
const server=spawn(process.execPath,[new URL('serve.mjs',import.meta.url).pathname]);let browser;
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Preview startup timed out')),10000);server.stdout.once('data',()=>{clearTimeout(timeout);resolve();});server.once('error',e=>{clearTimeout(timeout);reject(e);});server.once('exit',code=>{clearTimeout(timeout);reject(new Error('Preview exited: '+code));});});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:1050},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3001/experiments/salsa-human-models/index.html');await page.waitForSelector('html[data-ready="true"]');
 for(const view of ['front','side','rear']){await page.locator(`button[data-view="${view}"]`).click();await page.locator('canvas').screenshot({path:new URL(view+'.png',output).pathname});}
 await page.locator('button[data-view="front"]').click();await page.screenshot({path:new URL('comparison.png',output).pathname,fullPage:true});
 const download=page.waitForEvent('download');await page.locator('#download').click();const file=await download;await file.saveAs(new URL('couple.glb',output).pathname);
 const metrics=await page.evaluate(async()=>{const THREE=await import('../../vendor/three.module.js');const {landmarks}=await import('./model.js');const c=new THREE.PerspectiveCamera(34,2/3,.01,30);c.position.set(0,1.12,4.3);c.lookAt(0,.92,0);c.updateMatrixWorld();const reference={womanHead:[.347,.143],manHead:[.579,.096],joinedHands:[.576,.297]};return Object.fromEntries(Object.entries(landmarks).map(([k,v])=>{const p=new THREE.Vector3(...v).project(c),projected=[(p.x+1)/2,(1-p.y)/2],target=reference[k];return [k,{reference:target,projected,normalizedDistance:Math.hypot(projected[0]-target[0],projected[1]-target[1])}]}));});
 await writeFile(new URL('landmarks.json',output),JSON.stringify({purpose:'Manual reference landmark diagnostic, not likeness or identity score',metrics},null,2));
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('Front/side/rear captures, GLB export, landmarks and mobile layout passed.');
}finally{await browser?.close();server.kill();}
