import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {kalinkaPose,kalinkaTravel,createKalinka,KALINKA_DURATION} from '../src/robot-kalinka.js';
import {kalinkaCameraPose} from '../src/kalinka-stage.js';
async function variant(){const d=await readFile(new URL('../published/robot/robot.glb',import.meta.url)),g=await new GLTFLoader().parseAsync(d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength),'');const m=new THREE.AnimationMixer(g.scene);m.clipAction(g.animations[0]).play();m.setTime(0);m.stopAllAction();return {model:g.scene,...createKalinka(g.scene,THREE)};}

test('Kalinka follows a bounded irregular loop with reachable legs, kicks, hops and two aerial splits',()=>{
 let left=false,right=false,hops=false,split=false;const points=[];
 for(let t=0;t<24;t+=.01){const p=kalinkaPose(t);assert.ok(p.height>.7&&p.height<1.7);assert.ok(Math.abs(p.root.x)<=1.5&&Math.abs(p.root.z)<=1.5);
  for(const l of p.legs)assert.ok(Math.hypot(l.x,l.y,l.z)<1.69);
  left ||= p.mode==='kicks'&&p.legs[0].z>.8;right ||= p.mode==='kicks'&&p.legs[1].z>.8;hops ||= p.mode==='hops'&&p.jump>.1;split ||= p.split>.95&&p.jump>.9;
 }for(let t=0;t<24;t+=3)points.push(kalinkaTravel(t));assert.ok(new Set(points.map(p=>p.x.toFixed(1))).size>=5);
 assert.ok(left&&right&&hops&&split);assert.deepEqual(kalinkaPose(0),kalinkaPose(KALINKA_DURATION));
 const a=kalinkaPose(23.9999),b=kalinkaPose(.0001);for(const k of ['x','z','yaw'])assert.ok(Math.abs(a.root[k]-b.root[k])<.001);
 for(const t of [0,3,5,11,14,19,23]){kalinkaPose(22);assert.deepEqual(kalinkaPose(t),kalinkaPose(t));}
});

test('actual GLB soles and all lower leg geometry stay above the world floor, including split and landing',async()=>{
 const v=await variant(),box=new THREE.Box3();let maxFlight=0,contacts=0;
 const meshes=[];for(const l of v.limbs)l.hip.traverse(o=>{if(o.isMesh)meshes.push(o);});
 for(let frame=0;frame<24*60;frame++){
  const t=frame/60,p=v.update(t);v.model.updateMatrixWorld(true);
  for(const mesh of meshes){box.setFromObject(mesh);assert.ok(box.min.y>=-1e-6,`${mesh.name} below floor at ${t}: ${box.min.y}`);}
  for(let i=0;i<2;i++){const footBox=new THREE.Box3().setFromObject(v.limbs[i].foot);if(p.legs[i].stance){assert.ok(footBox.min.y<.035,`support floats at ${t}`);contacts++;}
   if(p.flight>.9)maxFlight=Math.max(maxFlight,footBox.min.y);
  }
 }assert.ok(contacts>200);assert.ok(maxFlight>1);
 v.update(11);assert.ok(Math.abs(v.limbs[0].foot.getWorldPosition(new THREE.Vector3()).x-v.limbs[1].foot.getWorldPosition(new THREE.Vector3()).x)>3.7,'aerial split must open almost horizontally');for(const l of v.limbs){const b=new THREE.Box3().setFromObject(l.foot);assert.ok(b.min.y>1.5,'split must clearly clear the ground');}
 assert.ok(v.model.getObjectByName('LeftLidPivot').scale.y<.02,'eyes must remain open outside blinks');
 assert.notEqual(v.model.getObjectByName('Kalinka_Ushanka_Crown').geometry.type,'BoxGeometry');
 v.dispose();
});

test('planted feet remain anchored while the robot travels and rotates; seeking restores skeleton',async()=>{
 const v=await variant(),point=new THREE.Vector3();
 for(const [a,b,index] of [[4.02,4.24,0],[4.52,4.74,1],[14.02,14.24,0]]){
  v.update(a);const first=v.limbs[index].foot.getWorldPosition(point).clone();v.update(b);const second=v.limbs[index].foot.getWorldPosition(point).clone();
  assert.ok(first.distanceTo(second)<.002,`planted foot slides ${first.distanceTo(second)}`);
 }
 const snapshot=t=>{v.update(t);return v.limbs.map(l=>[...l.hip.quaternion.toArray(),...l.foot.getWorldPosition(new THREE.Vector3()).toArray()]);};
 const first=snapshot(3.75);snapshot(19);assert.deepEqual(snapshot(3.75),first);v.dispose();
});

test('camera movement is gentle, loops and preserves room on narrow screens',()=>{
 for(const aspect of [.5,.85,1.57]){let previous=kalinkaCameraPose(0,aspect);for(let t=.01;t<24;t+=.01){const p=kalinkaCameraPose(t,aspect);for(const k of ['x','y','z'])assert.ok(Math.abs(p.position[k]-previous.position[k])<.03);previous=p;}assert.deepEqual(kalinkaCameraPose(0,aspect),kalinkaCameraPose(24,aspect));}
});


test('actual visible robot fits drone frames across travel, kicks and split jumps',async()=>{
 const v=await variant(),bounds=new THREE.Box3(),part=new THREE.Box3(),point=new THREE.Vector3();
 for(const aspect of [.5625,.85,1.57])for(let t=0;t<24;t+=.25){v.update(t);bounds.makeEmpty();v.model.traverseVisible(o=>{if(o.isMesh)bounds.union(part.setFromObject(o));});const p=kalinkaCameraPose(t,aspect),camera=new THREE.PerspectiveCamera(40,aspect,.05,150);camera.position.set(p.position.x,p.position.y,p.position.z);camera.lookAt(p.target.x,p.target.y,p.target.z);camera.updateMatrixWorld(true);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){point.set(x,y,z).project(camera);assert.ok(Math.abs(point.x)<.97&&Math.abs(point.y)<.97,`clipped at ${t}, aspect ${aspect}: ${point.x}, ${point.y}`);}
 }v.dispose();
});
