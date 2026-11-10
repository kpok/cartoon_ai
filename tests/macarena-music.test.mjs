import {test} from 'node:test';
import assert from 'node:assert/strict';
import {musicTiming} from '../src/macarena-music.js';
import {macarenaPose} from '../src/robot-macarena.js';
test('reference tempo maps musical beats to existing gestures without drift',()=>{
 const t=musicTiming({offset:2.125});assert.ok(Math.abs(t.duration-37.281553398)<1e-8);
 for(let beat=0;beat<64;beat++){const seconds=t.beatTime(beat);assert.ok(Math.abs(t.choreographyTime(seconds)-beat*.5)<1e-12);assert.ok(Math.abs(macarenaPose(t.choreographyTime(seconds)+1e-8).beat-beat%16)<1e-6);}
 assert.equal(t.choreographyTime(0),0);
 const circle=t.beatTime(12),hop=t.beatTime(15);assert.ok(hop>circle);assert.ok(Math.abs(t.choreographyTime(hop)-7.5)<1e-12);
});
test('tempo calibration rejects invalid values',()=>{for(const bpm of [NaN,0,200])assert.throws(()=>musicTiming({bpm}));for(const offset of [-1,Infinity])assert.throws(()=>musicTiming({offset}));});
