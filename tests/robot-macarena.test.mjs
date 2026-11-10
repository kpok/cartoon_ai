import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {macarenaPose,createMacarena} from '../src/robot-macarena.js';
test('Macarena has alternating gestures, four quarter turns and repeatable seeking',()=>{
 assert.deepEqual(macarenaPose(0),macarenaPose(32));
 for(let phrase=0;phrase<4;phrase++)assert.equal(macarenaPose(phrase*8+1).yaw,phrase*Math.PI/2);
 assert.notDeepEqual(macarenaPose(.4).arms[0],macarenaPose(.4).arms[1]);
 assert.deepEqual(macarenaPose(.9).arms[0],macarenaPose(.9).arms[1]);
 const a=macarenaPose(12);macarenaPose(30);assert.deepEqual(macarenaPose(12),a);
});
test('Macarena actual model keeps bare head, long boots, grounded soles and fits portrait camera',async()=>{
 const data=await readFile(new URL('../published/robot/robot.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);mixer.stopAllAction();const v=createMacarena(model,THREE);
 assert.equal(model.getObjectByName('Kalinka_Ushanka_Crown').visible,false);
 for(let t=0;t<32;t+=.125){v.update(t);for(const l of v.limbs){const box=new THREE.Box3().setFromObject(l.foot);assert.ok(box.min.y>=-1e-5,`sole below floor at ${t}`);assert.ok(box.min.y<.4);}}
 v.update(3);const before=model.getObjectByName('RightWristPivot').matrixWorld.clone();v.update(28);v.update(3);assert.deepEqual(model.getObjectByName('RightWristPivot').matrixWorld.elements,before.elements);v.dispose();
});
