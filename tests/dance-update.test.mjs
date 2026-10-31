import test from 'node:test';
import assert from 'node:assert/strict';
import {updatePose,UPDATE_CUES,UPDATE_DURATION} from '../src/dance-update-story.js';
import {updateSamples,UPDATE_SAMPLE_RATE} from '../src/dance-update-audio.js';
test('story progresses from unilateral fault to synchronization and final arm escalation',()=>{
 const first=updatePose(.65);assert.ok(first.left>.8);assert.equal(first.right,0);
 assert.ok(updatePose(4).restraint>.9);assert.ok(updatePose(9).sync>.9);
 for(const t of [11.6,12.4,14.8])assert.ok(Math.abs(updatePose(t).left-updatePose(t).right)<1e-9);
 assert.ok(updatePose(14).relief>.9);assert.notEqual(updatePose(18).arm,0);
 assert.equal(updatePose(22).finalArm,0);assert.notEqual(updatePose(23.5).finalArm,0);
 assert.equal(updatePose(24).time,24);assert.equal(updatePose(100).time,24);
 const saved=updatePose(5);updatePose(23);assert.deepEqual(updatePose(5),saved);
 for(let t=0;t<=24;t+=1/24)for(const [key,value] of Object.entries(updatePose(t)))if(typeof value==='number')assert.ok(Number.isFinite(value),key);
});
test('authored sound has deterministic finite bounded PCM with quiet gaps and audible events',()=>{
 const samples=updateSamples();assert.equal(samples.length,UPDATE_DURATION*UPDATE_SAMPLE_RATE);
 assert.deepEqual(updateSamples(.5),samples.slice(0,.5*UPDATE_SAMPLE_RATE));
 let peak=0;for(const s of samples){assert.ok(Number.isFinite(s));peak=Math.max(peak,Math.abs(s));}assert.ok(peak>.1&&peak<=.85);
 assert.ok(samples.slice(0,.2*UPDATE_SAMPLE_RATE).every(s=>s===0));
 for(const cue of UPDATE_CUES){const segment=samples.slice(Math.round(cue.time*UPDATE_SAMPLE_RATE),Math.round((cue.time+.04)*UPDATE_SAMPLE_RATE));assert.ok(segment.some(s=>Math.abs(s)>.01),`${cue.kind}@${cue.time}`);}
 for(const duration of [0,-1,25,NaN,Infinity])assert.throws(()=>updateSamples(duration));
});
