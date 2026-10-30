import {test} from 'node:test';
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
 model.traverse(o=>{if(!o.isMesh)return;const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const projected=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld).project(c);assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1,`${o.name}: geometry clipped by fixed camera`);}});
});
