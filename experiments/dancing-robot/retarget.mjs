// SPDX-License-Identifier: GPL-3.0-or-later
// Deterministic GLB retargeter. No renderer, Blender, AI API or video encoder is used.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from '../../node_modules/three/build/three.module.js';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from '../../node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import {DURATION,FPS,pose,CUES} from './choreography.mjs';

// GLTFExporter uses the browser FileReader interface for its binary Blob.
globalThis.FileReader=class {
 readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
 readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.();}).catch(error=>this.onerror?.(error));}
};
const baseURL=new URL('./assets/rig-base.glb',import.meta.url);
const input=await readFile(baseURL);
const gltf=await new GLTFLoader().parseAsync(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength),'');
const scene=gltf.scene;
// Discard the old clip but retain its bind hierarchy and every approved visible surface.
scene.updateMatrixWorld(true);
const nodes={};scene.traverse(o=>{if(o.name.endsWith('Pivot')||o.name==='DanceRoot')nodes[o.name]=o;});
function joint(name,worldPosition,parent){
 const obj=new THREE.Group();obj.name=name;obj.position.copy(worldPosition);scene.add(obj);scene.updateMatrixWorld(true);parent.attach(obj);nodes[name]=obj;return obj;
}
for(const [side,sign] of [['Left',-1],['Right',1]]){
 const arm=nodes[side+'ArmPivot'];
 const source=arm.children.find(o=>o.isMesh&&o.name.startsWith('Upper_arm'));
 if(!source)throw new Error('Missing approved arm mesh');
 const elbow=joint(side+'ElbowPivot',new THREE.Vector3(sign*1.22,.49,0),arm);
 const wrist=joint(side+'WristPivot',new THREE.Vector3(sign*1.22,.25,0),elbow);
 const geometry=source.geometry.index?source.geometry.toNonIndexed():source.geometry.clone();
 // Partition existing triangles into rigid shoulder/forearm/hand pieces; do not rescale.
 const parts=[[],[],[]],position=geometry.attributes.position;
 for(let i=0;i<position.count;i+=3){
  let height=0;
  for(let j=0;j<3;j++)height+=new THREE.Vector3().fromBufferAttribute(position,i+j).applyMatrix4(source.matrixWorld).y/3;
  const bucket=height>.49?0:height>.25?1:2;
  for(let j=0;j<3;j++)parts[bucket].push(i+j);
 }
 for(let part=0;part<3;part++){
  const split=new THREE.BufferGeometry();
  for(const [name,attribute] of Object.entries(geometry.attributes)){
   const values=[];for(const index of parts[part])for(let k=0;k<attribute.itemSize;k++)values.push(attribute.array[index*attribute.itemSize+k]);
   split.setAttribute(name,new THREE.BufferAttribute(new attribute.array.constructor(values),attribute.itemSize,attribute.normalized));
  }
  const mesh=new THREE.Mesh(split,source.material);mesh.name=side+['UpperArm','Forearm','Hand'][part];
  mesh.position.copy(source.position);mesh.quaternion.copy(source.quaternion);mesh.scale.copy(source.scale);arm.add(mesh);scene.updateMatrixWorld(true);
  (part===0?arm:part===1?elbow:wrist).attach(mesh);
 }
 arm.remove(source);
 // Small recessed joints close the cut when bent, inside the original rest silhouette.
 for(const [parent,radius] of [[elbow,.215],[wrist,.17]]){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,16,10),arm.children.find(o=>o.name.startsWith('Shoulder_joint')).material);
  mesh.name=side+(parent===elbow?'ElbowBearing':'WristBearing');parent.add(mesh);
 }
}
const bases=Object.fromEntries(Object.entries(nodes).map(([name,node])=>[name,node.position.clone()]));
const tracks={};for(const name of Object.keys(nodes))tracks[name]={position:[],quaternion:[]};
const times=[],bounds=new THREE.Box3(),box=new THREE.Box3();
const upper=new THREE.Vector3(0,-.33,.05),lower=new THREE.Vector3(0,-.32,-.03),l1=upper.length(),l2=lower.length();
function rotate(name,xyz){nodes[name].quaternion.setFromEuler(new THREE.Euler(...xyz));}
function groundLeg(side,sign,p,index){
 const hip=nodes[side+'HipPivot'],knee=nodes[side+'KneePivot'],foot=nodes[side+'FootPivot'];
 const hipWorld=bases[side+'HipPivot'];
 const target=new THREE.Vector3(sign*(.33+.06*p.wide)-p.rootX,-.75+p.footLift[index]-p.rootY,-.02).sub(hipWorld);
 const distance=target.length();if(distance>l1+l2||distance<Math.abs(l1-l2))throw new Error('Unreachable planted foot');
 const direction=target.clone().normalize(),pole=new THREE.Vector3(0,0,1);
 pole.addScaledVector(direction,-pole.dot(direction)).normalize();
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 const bend=Math.sqrt(Math.max(0,l1*l1-along*along));
 const kneeVector=direction.clone().multiplyScalar(along).addScaledVector(pole,bend);
 hip.quaternion.setFromUnitVectors(upper.clone().normalize(),kneeVector.clone().normalize());
 const inverse=hip.quaternion.clone().invert();
 const lowerLocal=target.clone().sub(kneeVector).applyQuaternion(inverse).normalize();
 knee.quaternion.setFromUnitVectors(lower.clone().normalize(),lowerLocal);
 foot.quaternion.copy(hip.quaternion).multiply(knee.quaternion).invert();
}
function solveArm(side,pose){
 const arm=nodes[side+'ArmPivot'],elbow=nodes[side+'ElbowPivot'],wrist=nodes[side+'WristPivot'];
 arm.position.add(new THREE.Vector3(...pose.shoulder));
 const upper=bases[side+'ElbowPivot'],lower=bases[side+'WristPivot'];
 const l1=upper.length(),l2=lower.length();
 // Work in torso coordinates, so shoulders and hands follow torso weight shifts.
 const target=new THREE.Vector3(...pose.target).sub(bases.TorsoPivot).sub(arm.position);
 const distance=target.length();if(distance>l1+l2||distance<Math.abs(l1-l2))throw new Error('Unreachable hand: '+side+' '+distance);
 const direction=target.clone().normalize();
 const pole=new THREE.Vector3(side==='Left'?-.8:.8,-.7,.1);
 pole.addScaledVector(direction,-pole.dot(direction)).normalize();
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
 const bend=Math.sqrt(Math.max(0,l1*l1-along*along));
 const elbowVector=direction.clone().multiplyScalar(along).addScaledVector(pole,bend);
 arm.quaternion.setFromUnitVectors(upper.clone().normalize(),elbowVector.clone().normalize());
 const lowerLocal=target.clone().sub(elbowVector).applyQuaternion(arm.quaternion.clone().invert()).normalize();
 elbow.quaternion.setFromUnitVectors(lower.clone().normalize(),lowerLocal);
 const handOrientation=new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.hand));
 wrist.quaternion.copy(arm.quaternion).multiply(elbow.quaternion).invert().multiply(handOrientation);
}
for(let frame=0;frame<=DURATION*FPS;frame++){
 const time=frame/FPS,p=pose(time);times.push(time);
 for(const [name,node] of Object.entries(nodes)){node.position.copy(bases[name]);node.quaternion.identity();}
 nodes.DanceRoot.position.x+=p.rootX;nodes.DanceRoot.position.y+=p.rootY;
 nodes.HeadPivot.position.x+=p.headX;rotate('HeadPivot',p.head);rotate('TorsoPivot',p.torso);
 for(const side of ['Left','Right']){
  solveArm(side,p.arms[side]);
 }
 groundLeg('Left',-1,p,0);groundLeg('Right',1,p,1);
 scene.updateMatrixWorld(true);box.setFromObject(scene);bounds.union(box);
 for(const [name,node] of Object.entries(nodes)){tracks[name].position.push(...node.position.toArray());tracks[name].quaternion.push(...node.quaternion.toArray());}
}
const keyframes=[];
for(const [name,values] of Object.entries(tracks)){
 keyframes.push(new THREE.VectorKeyframeTrack(name+'.position',times,values.position),new THREE.QuaternionKeyframeTrack(name+'.quaternion',times,values.quaternion));
 nodes[name].position.copy(bases[name]);nodes[name].quaternion.identity();
}
const clip=new THREE.AnimationClip('ReferenceDance',DURATION,keyframes);
const output=await new GLTFExporter().parseAsync(scene,{binary:true,animations:[clip],onlyVisible:true});
const targetURL=new URL('../../published/robot/robot.glb',import.meta.url);
if(process.argv.includes('--check')){
 const existing=await readFile(targetURL);if(!existing.equals(Buffer.from(output)))throw new Error('Published GLB differs from deterministic choreography');
 console.log('Reference choreography reproduces the published GLB byte-for-byte');process.exit(0);
}
await writeFile(targetURL,Buffer.from(output));
const manifestURL=new URL('../../published/robot/manifest.json',import.meta.url);
const manifest=JSON.parse(await readFile(manifestURL,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
manifest.animation={name:clip.name,duration:DURATION,fps:FPS,reference_timing:true,music_synchronized:false,cues:CUES,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
manifest.retarget={script:'experiments/dancing-robot/retarget.mjs',sha256:hash(await readFile(new URL(import.meta.url))),choreography_sha256:hash(await readFile(new URL('./choreography.mjs',import.meta.url))),base_sha256:hash(input)};
manifest.provenance_note='Stage A geometry/preview metrics retained. ReferenceDance is deterministically retargeted from the archived approved rig. Hand-timed adaptation of supplied recording; no recording, audio or MP4 is published. Arms are segmented in-place; recessed joints added without rescaling.';
manifest.files['robot.glb']={bytes:output.byteLength,sha256:hash(Buffer.from(output))};
await writeFile(manifestURL,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({bytes:output.byteLength,duration:DURATION,frames:times.length,bounds:manifest.animation.bounds}));
