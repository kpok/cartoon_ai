import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {macarenaPose,createMacarena} from '../src/robot-macarena.js';
import {kalinkaCameraPose} from '../src/kalinka-stage.js';
test('Macarena has alternating gestures, four quarter turns and repeatable seeking',()=>{
 assert.deepEqual(macarenaPose(0),macarenaPose(32));
 for(let phrase=0;phrase<4;phrase++)assert.equal(macarenaPose(phrase*8+1).yaw,phrase*Math.PI/2);
 assert.notDeepEqual(macarenaPose(.4).arms[0],macarenaPose(.4).arms[1]);
 assert.equal(macarenaPose(.4).arms[1][2],1.55,'right hand must lead');
 assert.equal(macarenaPose(.4).arms[0][2],-.45,'left hand waits on rear hip');
 for(const boundary of [8,16,24,32])for(let side=0;side<2;side++)for(let axis=0;axis<4;axis++)assert.ok(Math.abs(macarenaPose(boundary-1e-6).arms[side][axis]-macarenaPose(boundary).arms[side][axis])<1e-5,'phrase boundary must be continuous');
 assert.deepEqual(macarenaPose(.9).arms[0],macarenaPose(.9).arms[1]);
 const a=macarenaPose(12);macarenaPose(30);assert.deepEqual(macarenaPose(12),a);
});
test('Macarena actual model keeps bare head, long boots, grounded soles and fits portrait camera',async()=>{
 const data=await readFile(new URL('../published/robot/robot.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);mixer.stopAllAction();const v=createMacarena(model,THREE);
 assert.equal(model.getObjectByName('Kalinka_Ushanka_Crown').visible,false);
 for(let t=0;t<32;t+=.125){v.update(t);for(const l of v.limbs){const box=new THREE.Box3().setFromObject(l.foot);assert.ok(box.min.y>=-1e-5,`sole below floor at ${t}`);assert.ok(box.min.y<.4);}}
 const torso=model.getObjectByName('TorsoPivot');
 for(let beat=0;beat<12;beat++){const p=v.update(beat*.5+.4);for(let side=0;side<2;side++){const actual=torso.worldToLocal(v.limbs[side].wrist.getWorldPosition(new THREE.Vector3())),[x,y,z]=p.arms[side];assert.ok(actual.distanceTo(new THREE.Vector3((side===0?-1:1)*x,y,z))<.005,`wrist misses anatomical target at beat ${beat}`);}}
 for(const aspect of [390/844,16/9]){const p=kalinkaCameraPose(0,aspect),camera=new THREE.PerspectiveCamera(40,aspect,.05,150);camera.position.set(p.position.x,p.position.y,p.position.z);camera.lookAt(p.target.x,p.target.y,p.target.z);camera.updateMatrixWorld();for(let t=0;t<32;t+=.5){v.update(t+.4);model.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++){const point=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).project(camera);assert.ok(Math.abs(point.x)<.97&&Math.abs(point.y)<.97,`visible robot leaves camera at ${t}, aspect ${aspect}`);}});}}
 v.update(3);const before=model.getObjectByName('RightWristPivot').matrixWorld.clone();v.update(28);v.update(3);assert.deepEqual(model.getObjectByName('RightWristPivot').matrixWorld.elements,before.elements);v.dispose();
});
