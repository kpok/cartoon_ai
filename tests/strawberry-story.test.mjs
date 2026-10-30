import test from 'node:test';
import assert from 'node:assert/strict';
import {DURATION,CHAPTERS,sampleStory,StoryClock} from '../src/strawberry-story.js';

test('silent comedy has eleven contiguous chapters and a finite deterministic scene at every frame',()=>{
 assert.equal(DURATION,160);assert.equal(CHAPTERS[0].start,0);assert.equal(CHAPTERS.at(-1).end,DURATION);
 for(let i=1;i<CHAPTERS.length;i++)assert.equal(CHAPTERS[i].start,CHAPTERS[i-1].end);
 function finite(value){if(typeof value==='number')assert.ok(Number.isFinite(value));else if(value&&typeof value==='object')Object.values(value).forEach(finite);}
 for(let t=0;t<=DURATION;t+=.125){const state=sampleStory(t);finite(state);assert.equal(state.t,t);for(const actor of [state.cat,state.squirrel]){assert.ok(Math.abs(actor.x)<3);assert.ok(actor.y>=0);}assert.deepEqual(sampleStory(t),state);}
 for(const c of CHAPTERS){sampleStory(159);assert.deepEqual(sampleStory(c.start),sampleStory(c.start));}
 assert.equal(sampleStory(-2).t,0);assert.equal(sampleStory(Infinity).t,0);assert.equal(sampleStory(1000).t,DURATION);
});
test('story milestones include escaped fruit, chase, wheelbarrow, soft landing, help, shared fruit and apple',()=>{
 assert.ok(sampleStory(2).cat.arm>0&&sampleStory(2).squirrel.arm>0);
 assert.ok(sampleStory(44).berry.y<sampleStory(0).berry.y);
 assert.notEqual(sampleStory(48).cat.x,sampleStory(51).cat.x);
 assert.ok(sampleStory(85).cat.y>0);assert.ok(sampleStory(101).leaves>.9);
 assert.ok(sampleStory(128).squirrel.lean>2);
 assert.equal(sampleStory(140).cooperation,true);assert.ok(sampleStory(150).berry.halves>0);
 assert.equal(sampleStory(159).berry.visible,false);assert.ok(sampleStory(159).apple>0);
});
test('clock stops at exact end, replay resets, pause and hidden time never advance the story',()=>{
 const c=new StoryClock();c.tick(1000);assert.equal(c.time,0);c.play();c.tick(1000);c.tick(2000);assert.equal(c.time,1);
 c.pause();c.tick(90000);assert.equal(c.time,1);c.play();c.tick(90000);c.suspend();c.tick(120000);assert.equal(c.time,1);
 c.seek(159);c.tick(120000);c.tick(122000);assert.equal(c.time,160);assert.equal(c.playing,false);
 c.play();assert.equal(c.time,0);assert.equal(c.playing,true);c.seek(160);assert.equal(c.playing,false);
 c.seek(NaN);assert.equal(c.time,160);c.restart();assert.equal(c.time,0);c.play();c.tick(100);c.tick(50);assert.equal(c.time,0);
});
