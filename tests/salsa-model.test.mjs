import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
const framing=JSON.parse(await readFile(new URL('../experiments/salsa-human-models/reference/framing.json',import.meta.url),'utf8'));
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {referenceCamera} from '../experiments/salsa-human-models/camera.js';
import {createCouple,landmarks} from '../experiments/salsa-human-models/model.js';
test('static salsa geometry has finite surfaces, plausible bounds and no reference texture',()=>{
 const model=createCouple();model.updateMatrixWorld(true);let meshes=0,triangles=0;
 model.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));triangles+=(o.geometry.index?.count||p.count)/3;assert.equal(o.material.map,null);});
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 assert.ok(meshes>100);assert.ok(triangles>10000);assert.ok(size.y>1.8&&size.y<2.3);assert.ok(bounds.min.y>=0);assert.ok(size.x<2);assert.equal(model.animations.length,0);assert.deepEqual(model.userData.landmarks,landmarks);
});

test('detailed sweep normals face outward through bent joints',()=>{
 const model=createCouple();
 model.traverse(o=>{if(o.userData.surface!=='sweep')return;
  const {sides,rows}=o.userData,p=o.geometry.attributes.position,n=o.geometry.attributes.normal;
  for(let row=1;row<rows;row++){
   const center=new THREE.Vector3();for(let i=0;i<sides;i++)center.add(new THREE.Vector3().fromBufferAttribute(p,row*(sides+1)+i));center.divideScalar(sides);
   for(let i=0;i<sides;i++){const index=row*(sides+1)+i,radial=new THREE.Vector3().fromBufferAttribute(p,index).sub(center).normalize();assert.ok(radial.dot(new THREE.Vector3().fromBufferAttribute(n,index))>0,`${o.name}: inward surface at row ${row}`);}
  }
 });
});
test('reference camera keeps detailed geometry inside the capture frame',()=>{
 const c=new THREE.PerspectiveCamera(referenceCamera.fov,referenceCamera.aspect,referenceCamera.near,referenceCamera.far);c.position.set(...referenceCamera.position);c.lookAt(...referenceCamera.target);c.updateMatrixWorld();
 const model=createCouple();model.updateMatrixWorld(true);
 // Project real vertices: a world AABB combines unrelated front-depth/head-height extremes.
 model.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const projected=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld).project(c);const px=(projected.x+1)*referenceCamera.width/2,py=(1-projected.y)*referenceCamera.height/2;const [left,top,right,bottom]=framing.cropBox;assert.ok(px>=left&&px<right&&py>=top&&py<bottom,`${o.name}: geometry clipped by fixed subject crop (${px.toFixed(1)},${py.toFixed(1)})`);}});
});
test('unified trousers form an outward closed surface without collapsed triangles',()=>{
 const model=createCouple(),pants=model.getObjectByName('Continuous tailored trousers'),g=pants.geometry,positions=g.attributes.position,normals=g.attributes.normal,index=g.index,edges=new Map();let volume=0;
 assert.equal(pants.userData.surface,'implicit-trousers');assert.equal(model.getObjectByName('Trouser pelvis'),undefined);
 for(let i=0;i<normals.count;i++){const n=new THREE.Vector3().fromBufferAttribute(normals,i);assert.ok(Number.isFinite(n.length())&&Math.abs(n.length()-1)<1e-5,'Invalid garment normal');}
 for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)],v=ids.map(i=>new THREE.Vector3().fromBufferAttribute(positions,i));assert.equal(new Set(ids).size,3);assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).lengthSq()>0,'Zero-area garment triangle');volume+=v[0].dot(v[1].clone().cross(v[2]))/6;for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;edges.set(key,(edges.get(key)||0)+1);}}
 const neighbors=Array.from({length:positions.count},()=>[]);for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);neighbors[a].push(b,c);neighbors[b].push(a,c);neighbors[c].push(a,b);}const visited=new Set([0]),pending=[0];while(pending.length){for(const v of neighbors[pending.pop()])if(!visited.has(v)){visited.add(v);pending.push(v);}}assert.equal(visited.size,positions.count,'Garment includes disconnected shells');
 const camera=new THREE.PerspectiveCamera(referenceCamera.fov,referenceCamera.aspect,referenceCamera.near,referenceCamera.far);camera.position.set(...referenceCamera.position);camera.lookAt(...referenceCamera.target);camera.updateMatrixWorld();const ray=new THREE.Raycaster();pants.updateMatrixWorld(true);for(const [x,y] of [[.656,.66],[.746,.69]]){ray.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);assert.ok(ray.intersectObject(pants,false).length,'A calf disappeared during component filtering');}
 assert.ok(volume>0,'Inward garment winding');assert.ok([...edges.values()].every(count=>count===2),'Garment has an open or non-manifold edge');
});
