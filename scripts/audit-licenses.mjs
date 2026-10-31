import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const json=async p=>JSON.parse(await readFile(p,'utf8'));
export async function auditLicenses(){
 const lock=await json('package-lock.json'),approved=await json('.security/dependencies.json');
 const actual=Object.fromEntries(Object.entries(lock.packages).filter(([p])=>p).map(([p,v])=>[p,Object.fromEntries(['version','license','integrity'].map(k=>[k,v[k]]))]));
 assert.deepEqual(actual,approved,'Dependency inventory changed; review exact licenses/versions/integrity');
 for(const [path,entry] of Object.entries(actual)){
  assert.ok(['MIT','Apache-2.0','ISC'].includes(entry.license),'Unreviewed dependency license');
  assert.match(entry.integrity,/^sha512-[A-Za-z0-9+/=]+$/);
  assert.equal(lock.packages[path].resolved,`https://registry.npmjs.org/${path.slice(13)}/-/${path.split('/').at(-1)}-${entry.version}.tgz`,'Unreviewed package source');
  // Platform-specific optional packages can be absent on this OS.
  if(path==='node_modules/fsevents'&&process.platform!=='darwin')continue;
  const installed=await json(`${path}/package.json`);
  assert.equal(installed.version,entry.version);assert.equal(installed.license,entry.license);
 }
 const assets=await json('.security/assets.json');
 for(const [path,entry] of Object.entries(assets)){
  assert.ok(!(await lstat(path)).isSymbolicLink());const salsaPreview=/^experiments\/salsa-human-models\/review\/(front|side|rear)\.png$/.test(path);const background=path==='assets/kalinka/red-square-ai.png';const reference=background||path==='docs/images/robot-concept.jpg'||['experiments/salsa-human-models/reference/concept.png','experiments/salsa-human-models/reference/concept-cropped.png'].includes(path);
  assert.equal(entry.license,reference?'LicenseRef-All-Rights-Reserved':'CC-BY-4.0');assert.equal(entry.attribution,background?'Kalinka background generated with ChatGPT; supplied by kpok':reference?'Concept image generated with ChatGPT; supplied by kpok':salsaPreview?'Salsa procedural reconstruction by kpok':'Neon Tinker by kpok');assert.ok(entry.origin&&entry.review);
  assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),entry.sha256,'Asset changed; review provenance and metadata');
 }
 for(const path of execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{encoding:'utf8'}).split('\0').filter(Boolean)){
  const content=await readFile(path);
  if(/\.(?:png|glb|jpe?g|gif|webp|mp[34]|wav|ogg|woff2?|ttf|blend|zip|pdf)$/i.test(path)||content.includes(0))assert.ok(Object.hasOwn(assets,path),'Unreviewed binary/media asset');
 }
 const manifest=await json('published/robot/manifest.json');assert.equal(manifest.license,'CC-BY-4.0');assert.equal(manifest.attribution,'Neon Tinker by kpok');assert.equal(manifest.audio,false);
 const lic=await readFile('experiments/dancing-robot/LICENSE','utf8');assert.ok(lic.includes('GNU GENERAL PUBLIC LICENSE')&&lic.includes('Version 3'));
 // Check all repository Python scripts importing Blender's Python API, not only a fixed allowlist.
 const pythonPaths=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard','--','*.py'],{encoding:'utf8'}).split('\0').filter(Boolean);
 for(const file of pythonPaths){
  const source=await readFile(file,'utf8');
  if(/(?:^|\\n)\\s*(?:import\\s+bpy(?:\\s|,|$)|from\\s+bpy\\s+import\\b)/m.test(source)){
   assert.match(source.split('\\n').slice(0,5).join('\\n'),/^# SPDX-License-Identifier: GPL-(?:3\\.0-or-later|3\\.0-only|2\\.0-or-later|2\\.0-only)\\s*$/m,`Missing GPL SPDX identifier in Blender Python script: ${file}`);
  }
 }
 for(const file of ['experiments/dancing-robot/generator.py','scripts/validate-robot.py','experiments/dancing-robot/retarget.mjs'])assert.ok((await readFile(file,'utf8')).split('\n')[0].includes('SPDX-License-Identifier: GPL-3.0-or-later'));
 for(const file of ['LICENSING.md','docs/MEDIA_PROVENANCE.md'])assert.ok((await readFile(file)).length>500);
 // Verify the actual distributed notice, not just a statement in README.
 assert.deepEqual(await readFile('dist/vendor/THREE-LICENSE.txt'),await readFile('node_modules/three/LICENSE'),'Missing or modified upstream notice');
 console.log(`License/provenance gate passed: ${Object.keys(actual).length} locked dependencies, ${Object.keys(assets).length} reviewed binary assets, deployed MIT notice.`);
}
if(process.argv[1]?.endsWith('/audit-licenses.mjs')){try{await auditLicenses();}catch{console.error('License/provenance gate FAILED. Review locally; no file content is logged.');process.exitCode=1;}}
