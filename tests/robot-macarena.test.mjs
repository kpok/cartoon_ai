import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {macarenaPose,createMacarena} from '../src/robot-macarena.js';
import {kalinkaCameraPose} from '../src/kalinka-stage.js';
test('Macarena has alternating gestures, four quarter turns and repeatable seeking',()=>{
 assert.deepEqual(macarenaPose(0),macarenaPose(32));
 for(let phrase=0;phrase<4;phrase++)assert.ok(Math.abs(macarenaPose(phrase*8+1).yaw-phrase*Math.PI/2)<1e-8);
 assert.notDeepEqual(macarenaPose(.4).arms[0],macarenaPose(.4).arms[1]);
 assert.ok(Math.abs(macarenaPose(.4).arms[1][2]-1.75)<1e-8,'right hand must lead');
 assert.equal(macarenaPose(.4).arms[0][2],-.45,'left hand waits on rear hip');
 for(const boundary of [8,16,24,32])for(let side=0;side<2;side++)for(let axis=0;axis<4;axis++)assert.ok(Math.abs(macarenaPose(boundary-1e-6).arms[side][axis]-macarenaPose(boundary).arms[side][axis])<1e-5,'phrase boundary must be continuous');
 assert.deepEqual(macarenaPose(.9).arms[0],macarenaPose(.9).arms[1]);
 const a=macarenaPose(12);macarenaPose(30);assert.deepEqual(macarenaPose(12),a);
});
test('Macarena actual model keeps bare head, sneakers, grounded soles and fits portrait camera',async()=>{
 const data=await readFile(new URL('../published/robot/robot.glb',import.meta.url));const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);mixer.stopAllAction();const v=createMacarena(model,THREE);
 assert.equal(model.getObjectByName('Kalinka_Ushanka_Crown').visible,false);
 const hipSamples=[],kneeSamples=[];
 for(let t=0;t<32;t+=.0625){const pose=v.update(t);hipSamples.push(v.root.position.x);for(const l of v.limbs){kneeSamples.push(l.knee.rotation.x);let minimum=Infinity;l.hip.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++)minimum=Math.min(minimum,new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).y);});assert.ok(minimum>=-1e-5,`visible leg or sole below floor at ${t}`);const ankle=l.foot.getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(ankle.y-(.24+pose.jump))<.01,`planted ankle slides vertically at ${t}`);}}
 assert.ok(Math.max(...hipSamples)-Math.min(...hipSamples)>.4,'hips must visibly sway');assert.ok(Math.max(...kneeSamples)-Math.min(...kneeSamples)>.25,'knees must visibly flex');assert.ok(Math.max(...kneeSamples)<.8,'gentle knee bounce must not become a deep crouch');
 for(const t of [.4,.9,1.4,1.9]){v.update(t);const sides=t<.5?[1]:[0,1];for(const side of sides){const l=v.limbs[side],shoulder=l.arm.getWorldPosition(new THREE.Vector3()),wrist=l.wrist.getWorldPosition(new THREE.Vector3()),reach=l.elbow.position.length()+l.wrist.position.length();assert.ok(wrist.distanceTo(shoulder)/reach>.99,'forward arm must straighten');}}
 const torso=model.getObjectByName('TorsoPivot');
 for(let beat=0;beat<12;beat++){const p=v.update(beat*.5+.4);for(let side=0;side<2;side++){const actual=torso.worldToLocal(v.limbs[side].wrist.getWorldPosition(new THREE.Vector3())),[x,y,z]=p.arms[side];assert.ok(actual.distanceTo(new THREE.Vector3((side===0?-1:1)*x,y,z))<.005,`wrist misses anatomical target at beat ${beat}`);}}
 for(const aspect of [390/844,16/9]){const p=kalinkaCameraPose(0,aspect),camera=new THREE.PerspectiveCamera(40,aspect,.05,150);camera.position.set(p.position.x,p.position.y,p.position.z);camera.lookAt(p.target.x,p.target.y,p.target.z);camera.updateMatrixWorld();for(let t=0;t<32;t+=.5){v.update(t+.4);model.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++){const point=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).project(camera);assert.ok(Math.abs(point.x)<.97&&Math.abs(point.y)<.97,`visible robot leaves camera at ${t}, aspect ${aspect}`);}});}}
 v.update(3);const before=model.getObjectByName('RightWristPivot').matrixWorld.clone();v.update(28);v.update(3);assert.deepEqual(model.getObjectByName('RightWristPivot').matrixWorld.elements,before.elements);v.dispose();
});

test('pelvis completes an ellipse before each jump with continuous entry and exit',()=>{
 for(let phrase=0;phrase<4;phrase++){
  const offset=phrase*8,points=Array.from({length:201},(_,i)=>macarenaPose(offset+6+i*1.25/200));
  assert.ok(Math.max(...points.map(p=>p.hipX))>.255);assert.ok(Math.min(...points.map(p=>p.hipX))<-.255);
  assert.ok(Math.max(...points.map(p=>p.hipZ))>.295);
  let area=0;for(let i=1;i<points.length;i++)area+=points[i-1].hipX*points[i].hipZ-points[i].hipX*points[i-1].hipZ;
  assert.ok(area>.23,'pelvis must circle, rather than only rock sideways');
  for(const p of points)assert.equal(p.jump,0,'roll must finish before takeoff');
  assert.ok(macarenaPose(offset+7.75).jump>.2);
  for(const boundary of [5.8,6,7.25,7.5]){const a=macarenaPose(offset+boundary-1e-7),b=macarenaPose(offset+boundary+1e-7);for(const key of ['hipX','hipZ','height','yaw','sway'])assert.ok(Math.abs(a[key]-b[key])<1e-5,`pelvis snaps at ${boundary}`);}
 }
});
