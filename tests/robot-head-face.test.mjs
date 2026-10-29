import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {AnimationMixer} from 'three';
test('actual GLB has a fast accented head slide and mechanical expressions',async()=>{
 const b=await readFile(new URL('../published/robot/robot.glb',import.meta.url));const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const clip=g.animations[0],track=clip.tracks.find(t=>t.name==='HeadPivot.position');const peaks=[];let min=Infinity,max=-Infinity;
 for(let i=1;i<track.times.length-1;i++)if(track.times[i]>=1&&track.times[i]<5){const x=track.values[i*3];min=Math.min(min,x);max=Math.max(max,x);if(x>track.values[(i-1)*3]&&x>=track.values[(i+1)*3])peaks.push(track.times[i]);}
 assert.ok(peaks.length>=8,'head must not drift at the old two-beat cadence');const period=(peaks.at(-1)-peaks[0])/(peaks.length-1);assert.ok(period>.41&&period<.46,'one head cycle per beat');assert.ok(max-min>.50&&max-min<.60,'bounded visible head slide');
 const mixer=new AnimationMixer(g.scene);mixer.clipAction(clip).play();mixer.setTime(0);const lid=g.scene.getObjectByName('LeftLidPivot');assert.ok(lid.scale.y<.02);mixer.setTime(1.8);assert.ok(lid.scale.y>.85,'blink closes shutter');
 mixer.setTime(2.4);assert.ok(lid.scale.y<.02,'shutter reopens');assert.ok(g.scene.getObjectByName('LeftBrowPivot'));assert.ok(g.scene.getObjectByName('SmilePivot'));
});

test('the actual greeting hand reaches both user-specified hey times',async()=>{
 const b=await readFile(new URL('../published/robot/robot.glb',import.meta.url));const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
 const mixer=new AnimationMixer(g.scene);mixer.clipAction(g.animations[0]).play();
 const torso=g.scene.getObjectByName('TorsoPivot'),hand=g.scene.getObjectByName('LeftWristPivot');
 for(const peak of [2,5.5]){
  let bestTime=null,bestHeight=-Infinity;
  for(let frame=Math.round((peak-.3)*24);frame<=Math.round((peak+.3)*24);frame++){
   const time=frame/24;mixer.setTime(time);g.scene.updateMatrixWorld(true);const position=hand.position.clone();hand.getWorldPosition(position);torso.worldToLocal(position);
   if(position.y>bestHeight){bestHeight=position.y;bestTime=time;}
  }
  assert.ok(Math.abs(bestTime-peak)<=1/24,'hand peak must coincide with sung hey');assert.ok(bestHeight>1.2,'hand must be visibly raised');
 }
});
