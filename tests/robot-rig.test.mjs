import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AnimationMixer,Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
test('published dance articulates limbs and preserves independent scene orbit',async()=>{
 const data=await readFile(new URL('../published/robot/robot.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 assert.equal(gltf.animations.length,1);assert.equal(gltf.animations[0].name,'ReferenceDance');assert.equal(gltf.animations[0].duration,40);
 const mixer=new AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);gltf.scene.updateMatrixWorld(true);
 const names=['HeadPivot','LeftArmPivot','RightArmPivot','LeftHipPivot','RightHipPivot'];
 const start=names.map(name=>gltf.scene.getObjectByName(name).quaternion.clone());mixer.setTime(.375);
 for(const i of [0,3,4]){let excursion=0;for(const time of [.125,.25,.375,.5,.625,.75,.875,1]){mixer.setTime(time);excursion=Math.max(excursion,start[i].angleTo(gltf.scene.getObjectByName(names[i]).quaternion));}assert.ok(excursion>.01,names[i]+' must move over the intro');}
 mixer.setTime(2);assert.ok(start[1].angleTo(gltf.scene.getObjectByName('LeftArmPivot').quaternion)>.3,'wave arm must lift');
 mixer.setTime(34.1);assert.ok(start[2].angleTo(gltf.scene.getObjectByName('RightArmPivot').quaternion)>.3,'chest arm must cross');
 mixer.setTime(40);for(let i=0;i<names.length;i++)assert.ok(start[i].angleTo(gltf.scene.getObjectByName(names[i]).quaternion)<.001,'loop must close');
 // A head slide must translate sideways rather than merely rotate the face.
 const head=gltf.scene.getObjectByName('HeadPivot');let min=Infinity,max=-Infinity;
 for(let t=1;t<5;t+=1/24){mixer.setTime(t);min=Math.min(min,head.position.x);max=Math.max(max,head.position.x);assert.ok(Math.abs(head.rotation.y)<.08,'face stays mostly forward');}
 assert.ok(max-min>.48,'head slide must visibly translate sideways');
 assert.ok(gltf.scene.getObjectByName('LeftElbowPivot'));assert.ok(gltf.scene.getObjectByName('RightWristPivot'));
 gltf.scene.rotation.y=.7;mixer.setTime(2);assert.equal(gltf.scene.rotation.y,.7);
 gltf.scene.rotation.y=0;
 for(let frame=0;frame<960;frame++){
  mixer.setTime(frame/24);gltf.scene.updateMatrixWorld(true);const size=new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  const foot=gltf.scene.getObjectByName('LeftFootPivot').getWorldPosition(new Vector3());
  assert.ok(foot.y>=-.7501&&foot.y<=-.7349,'planted foot stays above ground with only a small lift');
  assert.ok(size.x>0&&size.x<5&&size.y>0&&size.y<6&&size.z>0&&size.z<5,'bounded motion');
 }
});
