import {test} from 'node:test';
import assert from 'node:assert/strict';
import {kalinkaPose} from '../src/robot-kalinka.js';
test('Kalinka keeps targets reachable and alternates kicks while the support foot stays down',()=>{
 let left=false,right=false;
 for(let t=0;t<24;t+=.01){
  const p=kalinkaPose(t);
  assert.ok(p.height>.5&&p.height<1.7);
  assert.ok(p.legs.some(leg=>leg.z===0&&leg.y===-p.height));
  for(const leg of p.legs)assert.ok(Math.hypot(leg.y,leg.z)<1.69);
  left ||= p.legs[0].z>1;right ||= p.legs[1].z>1;
 }
 assert.ok(left&&right);
 assert.deepEqual(kalinkaPose(0),kalinkaPose(24));
});
