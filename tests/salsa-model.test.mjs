import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createCouple,landmarks} from '../experiments/salsa-human-models/model.js';
test('static salsa geometry has finite surfaces, plausible bounds and no reference texture',()=>{
 const model=createCouple();model.updateMatrixWorld(true);let meshes=0,triangles=0;
 model.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));triangles+=(o.geometry.index?.count||p.count)/3;assert.equal(o.material.map,null);});
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 assert.ok(meshes>100);assert.ok(triangles>10000);assert.ok(size.y>1.8&&size.y<2);assert.ok(bounds.min.y>=0);assert.ok(size.x<2);assert.equal(model.animations.length,0);assert.deepEqual(model.userData.landmarks,landmarks);
});
