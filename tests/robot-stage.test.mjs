import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRobotStage} from '../src/robot-stage.js';
test('Digital rain are deterministic and seek backwards without external assets',()=>{
 const a=createRobotStage(THREE,-2.6),b=createRobotStage(THREE,-2.6);assert.equal(a.group.children.length,b.group.children.length);assert.ok(a.group.children.length<20,'bounded draw objects');
 a.update(0);const drone=a.group.children.at(-1),initial=drone.position.clone();a.update(1);assert.ok(drone.position.distanceTo(initial)>.1);a.update(0);assert.ok(drone.position.distanceTo(initial)<1e-8);
 a.group.traverse(o=>{if(o.material)assert.ok(o.material.map==null,'no remote textures');});
});
