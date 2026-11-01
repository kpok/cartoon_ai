import test from 'node:test';import assert from 'node:assert/strict';
import {SHELTER_DURATION,SHELTER_CHAPTERS,shelterState,ShelterClock} from '../src/shelter-story.js';
import {shelterCues,shelterCueAt} from '../src/shelter-dialogue.js';
test('five-minute shelter story has contiguous chapters, distinct failures and a cooperative resolution',()=>{
 assert.equal(SHELTER_DURATION,300);let end=0;for(const c of SHELTER_CHAPTERS){assert.equal(c.start,end);assert.ok(c.end>c.start);end=c.end;}assert.equal(end,300);
 assert.ok(shelterState(18).leaf.x<-2);assert.ok(shelterState(69).quickBuild>.8);assert.ok(shelterState(85).collapse>.9);
 assert.equal(shelterState(110).planVisible,true);assert.ok(shelterState(140).planComplexity>.8);
 assert.equal(shelterState(192).barrow.loaded,true);assert.ok(shelterState(240).build>.9);assert.ok(shelterState(250).rain>.9);
 assert.equal(shelterState(260).leak,true);assert.equal(shelterState(285).leak,false);assert.ok(shelterState(285).gutter>.9);assert.equal(shelterState(292).shower,true);
 assert.ok(shelterState(299).cat.smile>.9);assert.ok(shelterState(260).butterfly.y<.8);
});
test('poses are finite and independent of sampling order, and actors do not teleport at chapter boundaries',()=>{
 const finite=o=>{for(const v of Object.values(o))if(typeof v==='number')assert.ok(Number.isFinite(v));else if(v&&typeof v==='object')finite(v);};
 for(let t=0;t<=300;t+=.25)finite(shelterState(t));
 const first=shelterState(13);shelterState(299);assert.deepEqual(shelterState(13),first);
 for(const c of SHELTER_CHAPTERS.slice(1))for(const actor of ['cat','squirrel']){const a=shelterState(c.start-.001)[actor],b=shelterState(c.start+.001)[actor];assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.01);}
});
test('all localized dialogue fits inside the film with no overlap and stable cue identity',()=>{
 for(const lang of ['pl','en']){let end=0;for(const cue of shelterCues(lang)){assert.ok(cue.start>=end);assert.ok(cue.end<=300&&cue.end>cue.start);assert.ok(cue.text.length>0);assert.equal(shelterCueAt(cue.start+.1,lang).id,cue.id);end=cue.end;}assert.equal(shelterCueAt(300,lang),null);}
 assert.deepEqual(shelterCues('pl').map(c=>c.id),shelterCues('en').map(c=>c.id));
});
test('shelter clock stops at exactly five minutes, seeks backwards and does not count paused wall time',()=>{
 const c=new ShelterClock();c.play();c.tick(0);c.tick(299000);assert.equal(c.time,299);c.tick(301000);assert.equal(c.time,300);assert.equal(c.playing,false);
 c.play();assert.equal(c.time,0);c.tick(1);c.tick(1001);c.pause();c.tick(90000);assert.equal(c.time,1);c.seek(150);c.play();c.tick(99999);assert.equal(c.time,150);c.seek(Infinity);assert.equal(c.time,150);c.seek(300);assert.equal(c.playing,false);
});
