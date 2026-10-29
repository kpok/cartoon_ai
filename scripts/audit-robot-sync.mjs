// Compare actual procedural bounce events against independently measured reference timing.
// This diagnostic may fail: it must not be presented as a visual-similarity certificate.
import {readFile,writeFile} from 'node:fs/promises';
import {assessPulse} from './robot-sync-metrics.mjs';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const reference=JSON.parse(await readFile(new URL('../docs/sync-audit/audio-grid.json',import.meta.url),'utf8'));
const bytes=await readFile(new URL('../published/robot/robot.glb',import.meta.url));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const clip=gltf.animations[0],track=clip.tracks.find(t=>t.name==='DanceRoot.position');
if(!track)throw new Error('Published model has no root motion track');
// Exclude deliberate crouch/bow envelopes; verify phase before and after them.
const windows=[[1,7.5],[11.5,17],[17.5,21.5],[32.5,38.5]];
const measured=windows.map(([start,end])=>{
 const events=[];
 for(let i=1;i<track.times.length-1;i++){
  const t=track.times[i],value=track.values[i*3+1];
  if(t>=start&&t<end&&value<track.values[(i-1)*3+1]&&value<=track.values[(i+1)*3+1])events.push(t);
 }
 return {window_seconds:[start,end],...assessPulse(events,reference)};
});
const result={pass:measured.every(window=>window.pass),windows:measured,scope:'Base knee pulse across four clean windows spanning1–38.5s; gesture shapes and lyric hey are not certified.'};
if(process.argv.includes('--report'))await writeFile(new URL('../docs/sync-audit/rhythm-result.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));if(!result.pass)process.exitCode=1;
