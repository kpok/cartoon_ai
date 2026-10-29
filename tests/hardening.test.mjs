import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink,cp,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStaticServer} from '../scripts/static-server.mjs';
import {verifyBuild} from '../scripts/verify-build.mjs';
import {validateMovie,publishBundle} from '../scripts/export-validation.mjs';
import {settings} from '../scripts/export-film.mjs';

const temporary=()=>mkdtemp(join(tmpdir(),'cartoon-hardening-'));
test('static server confines public files and rejects symlink escapes and writes',async()=>{
 const dir=await temporary(),root=join(dir,'site');await mkdir(join(root,'src'),{recursive:true});
 await writeFile(join(root,'index.html'),'public');await writeFile(join(dir,'private.js'),'private');
 await symlink(join(dir,'private.js'),join(root,'src','leak.js'));
 await mkdir(join(root,'.git'));await writeFile(join(root,'.git','config'),'private');
 const server=createStaticServer(root);await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const good=await fetch(base);assert.equal(good.status,200);assert.equal(await good.text(),'public');assert.match(good.headers.get('content-security-policy'),/script-src 'self'/);
  const head=await fetch(base,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  for(const path of ['/.git/config','/package.json','/scripts/serve.mjs','/src/leak.js','/%2e%2e%2fprivate.js','/%ZZ'])assert.equal((await fetch(base+path)).status,404,path);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
 }finally{await new Promise(ok=>server.close(ok));await rm(dir,{recursive:true,force:true});}
});
test('build inventory rejects unexpected files, symlinks and unresolved module dependencies',async()=>{
 const dir=await temporary();
 try{
  for(const file of ['index.html','export.html','robot.html'])await cp(new URL(`../${file}`,import.meta.url),join(dir,file));
  await cp(new URL('../src/',import.meta.url),join(dir,'src'),{recursive:true});await mkdir(join(dir,'vendor'));
  for(const file of ['three.module.js','three.core.js'])await cp(new URL(`../node_modules/three/build/${file}`,import.meta.url),join(dir,'vendor',file));
  await cp(new URL('../node_modules/three/LICENSE',import.meta.url),join(dir,'vendor','THREE-LICENSE.txt'));
  for(const file of ['GLTFLoader.js','OrbitControls.js','BufferGeometryUtils.js','SkeletonUtils.js'])await cp(new URL(`../vendor/${file}`,import.meta.url),join(dir,'vendor',file));
  await cp(new URL('../published/',import.meta.url),join(dir,'published'),{recursive:true});
  await mkdir(join(dir,'assets/kalinka'),{recursive:true});
  await cp(new URL('../assets/kalinka/red-square-ai.png',import.meta.url),join(dir,'assets/kalinka/red-square-ai.png'));
  await verifyBuild(dir);
  await writeFile(join(dir,'credentials.json'),'private');await assert.rejects(verifyBuild(dir),/Unexpected build file/);await unlink(join(dir,'credentials.json'));
  await unlink(join(dir,'src','app.js'));await symlink(new URL('../src/app.js',import.meta.url),join(dir,'src','app.js'));await assert.rejects(verifyBuild(dir),/symlink/);await unlink(join(dir,'src','app.js'));
  await writeFile(join(dir,'src','app.js'),"import './missing.js';");await assert.rejects(verifyBuild(dir),/missing or escaping/);
  await writeFile(join(dir,'src','app.js'),"import 'https://example.com/app.js';");await assert.rejects(verifyBuild(dir),/external or absolute/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('export rejects prototype keys even with explicit valid clip duration',()=>{
 for(const story of ['constructor','toString','__proto__'])assert.throws(()=>settings(['--story',story,'--duration','1']),/story must/);
});
const config={width:360,height:640,fps:5,duration:3};
const movie=()=>({format:{duration:'3.000'},streams:[{codec_type:'video',codec_name:'h264',pix_fmt:'yuv420p',width:360,height:640,nb_frames:'15',avg_frame_rate:'5/1',duration:'3.000'},{codec_type:'audio',codec_name:'aac',sample_rate:'48000',channels:1,duration:'3.000'}]});
test('actual MP4 probe validation rejects missing, nonfinite and mismatched media properties',()=>{
 validateMovie(movie(),config);
 const mutations=[p=>{p.format.duration='NaN';},p=>{delete p.streams[0].duration;},p=>{p.streams.push({...p.streams[1]});},p=>{p.streams[0].avg_frame_rate='0/0';},p=>{p.streams[0].avg_frame_rate='30/1';},p=>{p.streams[0].nb_frames='14';},p=>{p.streams[1].channels=2;},p=>{p.streams[1].sample_rate='44100';},p=>{p.streams[1].duration='2';}];
 for(const change of mutations){const probe=movie();change(probe);assert.throws(()=>validateMovie(probe,config));}
});
test('exclusive bundle publication preserves existing files and competing publishers',async()=>{
 const dir=await temporary(),a=join(dir,'a'),b=join(dir,'b');await mkdir(a);await mkdir(b);
 for(const ext of ['mp4','srt','json']){await writeFile(join(a,`film.${ext}`),'a');await writeFile(join(b,`film.${ext}`),'b');}
 try{
  const out=join(dir,'film.mp4');await writeFile(join(dir,'film.json'),'keep');
  await assert.rejects(publishBundle(a,out),{code:'EEXIST'});assert.equal(await readFile(join(dir,'film.json'),'utf8'),'keep');await assert.rejects(readFile(join(dir,'film.srt')),{code:'ENOENT'});await unlink(join(dir,'film.json'));
  const results=await Promise.allSettled([publishBundle(a,out),publishBundle(b,out)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  const winner=await readFile(out,'utf8');for(const ext of ['srt','json'])assert.equal(await readFile(join(dir,`film.${ext}`),'utf8'),winner);
 }finally{await rm(dir,{recursive:true,force:true});}
});
