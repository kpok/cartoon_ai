import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AnimationMixer,Box3,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
test('published dance articulates limbs and preserves independent scene orbit',async()=>{
 const data=await readFile(new URL('../published/robot/robot.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 assert.equal(gltf.animations.length,1);assert.equal(gltf.animations[0].name,'NeonDance');assert.equal(gltf.animations[0].duration,8);
 const mixer=new AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);gltf.scene.updateMatrixWorld(true);
 const names=['HeadPivot','LeftArmPivot','RightArmPivot','LeftHipPivot','RightHipPivot'];
 const start=names.map(name=>gltf.scene.getObjectByName(name).quaternion.clone());mixer.setTime(.375);
 for(let i=0;i<names.length;i++)assert.ok(start[i].angleTo(gltf.scene.getObjectByName(names[i]).quaternion)>.01,names[i]+' must move');
 mixer.setTime(8);for(let i=0;i<names.length;i++)assert.ok(start[i].angleTo(gltf.scene.getObjectByName(names[i]).quaternion)<.001,'loop must close');
 gltf.scene.rotation.y=.7;mixer.setTime(2);assert.equal(gltf.scene.rotation.y,.7);
 gltf.scene.rotation.y=0;
 for(let frame=0;frame<192;frame++){
  mixer.setTime(frame/24);gltf.scene.updateMatrixWorld(true);const size=new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  assert.ok(size.x>0&&size.x<5&&size.y>0&&size.y<6&&size.z>0&&size.z<5,'bounded motion');
 }
});
