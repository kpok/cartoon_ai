import assert from 'node:assert/strict';
import {readdir,readFile,lstat} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {publicFile,CONTENT_POLICY,ROBOT_POLICY} from './static-server.mjs';
export async function verifyBuild(directory='dist'){
 const expected=['assets/kalinka/red-square-ai.png','index.html','export.html','robot.html','strawberry.html','published/robot/robot.glb','published/robot/preview.png','published/robot/manifest.json','vendor/GLTFLoader.js','vendor/OrbitControls.js','vendor/BufferGeometryUtils.js','vendor/SkeletonUtils.js','vendor/three.module.js','vendor/three.core.js','vendor/THREE-LICENSE.txt',...['strawberry-story.js','strawberry-stage.js','strawberry-player.js','strawberry.css','app.js','dialogue.js','draw.js','episodes.js','export-frame.js','garden-state.js','garden-view.js','i18n.js','sound.js','story.js','style.css','robot-view.js','robot-kalinka.js','kalinka-stage.js','robot-stage.js','robot-playback.js','robot.css'].map(f=>`src/${f}`)].sort();
 const files=[];
 async function walk(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const name=prefix+entry.name,path=resolve(dir,entry.name);
   assert.ok(!entry.isSymbolicLink(),`Build contains symlink: ${name}`);
   if(entry.isDirectory()){assert.ok(['src','vendor','published','published/robot','assets','assets/kalinka'].includes(name),`Unexpected build directory: ${name}`);await walk(path,name+'/');}
   else{assert.ok(entry.isFile()&&publicFile(name),`Unexpected build file: ${name}`);files.push(name);}
  }
 }
 assert.ok(!(await lstat(directory)).isSymbolicLink(),'Build root must not be a symlink');
 await walk(directory);assert.deepEqual(files.sort(),expected,'Build file inventory differs from intended static assets');
 for(const name of ['index.html','export.html','robot.html','strawberry.html']){
  const html=await readFile(resolve(directory,name),'utf8');
  assert.ok(html.includes(`<meta http-equiv="Content-Security-Policy" content="${name==='robot.html'?ROBOT_POLICY:CONTENT_POLICY}">`),`${name}: missing reviewed CSP`);
 }
 for(const name of files){
  if(!/\.(html|js|css)$/.test(name))continue;
  const text=await readFile(resolve(directory,name),'utf8');
  const references=name.endsWith('.html')?[...text.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m=>m[1]):name.endsWith('.js')?[...text.matchAll(/\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]/g)].map(m=>m[1]||m[2]):[...text.matchAll(/url\(\s*['"]?([^'"\s)]+)/g)].map(m=>m[1]);
  for(const reference of references){
   assert.ok(reference.startsWith('./')||reference.startsWith('../'),`${name}: external or absolute dependency ${reference}`);
   const target=relative(resolve(directory),resolve(directory,dirname(name),reference.split(/[?#]/)[0]));
   assert.ok(files.includes(target||'index.html'),`${name}: missing or escaping dependency ${reference}`);
  }
 }
 assert.deepEqual(await readFile(resolve(directory,'vendor/THREE-LICENSE.txt')),await readFile(new URL('../node_modules/three/LICENSE',import.meta.url)),'Upstream license notice differs');
 for(const name of ['three.module.js','three.core.js'])assert.deepEqual(await readFile(resolve(directory,'vendor',name)),await readFile(new URL(`../node_modules/three/build/${name}`,import.meta.url)),'Vendored Three.js differs from locked dependency');
 for(const [name,path] of [['GLTFLoader.js','loaders/GLTFLoader.js'],['OrbitControls.js','controls/OrbitControls.js'],['BufferGeometryUtils.js','utils/BufferGeometryUtils.js'],['SkeletonUtils.js','utils/SkeletonUtils.js']]){
  const source=await readFile(new URL(`../node_modules/three/examples/jsm/${path}`,import.meta.url),'utf8');
  assert.equal(await readFile(resolve(directory,'vendor',name),'utf8'),source.replace(/^.*@three_import.*$/gm,'').replaceAll("from 'three'","from './three.module.js'").replaceAll("from '../utils/BufferGeometryUtils.js'","from './BufferGeometryUtils.js'").replaceAll("from '../utils/SkeletonUtils.js'","from './SkeletonUtils.js'"),'Vendored addon differs from locked dependency');
 }
 console.log(`Built site verified: ${files.length} public files, no symlinks, CSP and locked Three.js.`);
 return files;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{await verifyBuild(process.argv[2]||'dist');}catch(error){console.error(error.message);process.exitCode=1;}}
