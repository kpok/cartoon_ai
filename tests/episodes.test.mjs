import test from 'node:test';
import assert from 'node:assert/strict';
import {episodes,meadowVisualTime,episodeCueAt} from '../src/episodes.js';
import {sampleGarden} from '../src/garden-state.js';
import {PlaybackClock} from '../src/story.js';
test('each episode stops and replays at its own duration',()=>{for(const episode of Object.values(episodes)){const c=new PlaybackClock(episode.duration);c.play(0);c.tick(200000);assert.equal(c.time,episode.duration);assert.equal(c.playing,false);c.play(200001);assert.equal(c.time,0);}});
test('shortened first story preserves all artwork in order',()=>{let previous=-1;for(let t=0;t<=65;t+=.25){const value=meadowVisualTime(t);assert.ok(value>=previous);previous=value;}assert.equal(meadowVisualTime(65),120);assert.equal(meadowVisualTime(13),38);assert.equal(meadowVisualTime(44),100);});
test('garden grows only after days and reverses deterministically',()=>{for(let t=0;t<=90;t+=.25){const state=sampleGarden(t);for(const value of Object.values(state))if(typeof value==='number')assert.ok(Number.isFinite(value));assert.deepEqual(state,sampleGarden(t));if(t<49)assert.equal(state.sprout,0);if(t<72)assert.equal(state.flower,0);}assert.ok(sampleGarden(39).night>.9);assert.ok(sampleGarden(74).day>sampleGarden(52).day);assert.equal(sampleGarden(0).flower,0);});
test('both languages have bounded dialogue in both stories',()=>{for(const e of Object.values(episodes))for(const lang of ['pl','en']){let count=0;for(let t=0;t<e.duration;t+=.5){const cue=episodeCueAt(t,lang,e.id);if(cue){assert.ok(cue.text.length>0);count++;}}assert.ok(count>20);assert.equal(episodeCueAt(e.duration,lang,e.id),null);}});
