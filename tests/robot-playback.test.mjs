import test from 'node:test';
import assert from 'node:assert/strict';
import {DanceClock} from '../src/robot-playback.js';
test('dance clock loops, pauses and ignores time spent hidden',()=>{
 const c=new DanceClock(8);c.setPlaying(true);c.tick(1000);assert.equal(c.tick(2500),1.5);c.setPlaying(false);assert.equal(c.tick(9000),1.5);
 c.setPlaying(true);c.tick(10000);assert.equal(c.tick(11000),2.5);c.suspend();assert.equal(c.tick(90000),2.5);assert.equal(c.tick(96000),.5);
 c.seek(4);assert.equal(c.time,4);c.seek(-2);assert.equal(c.time,0);c.seek(99);assert.ok(c.time<8);c.seek(NaN);assert.ok(c.time<8);
 c.restart();assert.equal(c.time,0);assert.equal(c.tick(NaN),0);assert.throws(()=>new DanceClock(0));
});
