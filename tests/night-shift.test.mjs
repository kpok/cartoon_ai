import test from 'node:test';
import assert from 'node:assert/strict';
import {DURATION,CHAPTERS,cues,cueAt,stateAt,FilmClock,labels} from '../src/night-shift-story.js';
test('six chapters cover the entire film and unsafe line action is never invented',()=>{
 assert.equal(CHAPTERS.length,6);assert.equal(CHAPTERS[0].start,0);assert.equal(CHAPTERS.at(-1).end,DURATION);
 for(let i=1;i<CHAPTERS.length;i++)assert.equal(CHAPTERS[i-1].end,CHAPTERS[i].start);
 assert.equal(stateAt(26.9).lineRunning,true);assert.equal(stateAt(27).lineRunning,false);assert.equal(stateAt(27).chapter,'incident');assert.equal(stateAt(NaN).time,0);assert.equal(stateAt(Infinity).time,0);assert.equal(stateAt(100).time,90);
});
test('both languages have matching cue boundaries, named speakers, short speech budgets and all UI labels',()=>{
 const pl=cues('pl'),en=cues('en');assert.equal(pl.length,en.length);
 for(const lang of ['pl','en']){let last=0;for(const cue of cues(lang)){assert.ok(cue.start>=last);assert.ok(cue.end>cue.start&&cue.end<=DURATION);assert.ok(cue.text&&cue.speaker);assert.ok(cue.text.split(/\s+/).length/(cue.end-cue.start)<2.4,`${lang}: ${cue.text}`);assert.equal(cueAt(cue.start,lang).id,cue.id);last=cue.end;}assert.equal(cueAt(90,lang),null);}
 assert.deepEqual(pl.map(c=>[c.id,c.start,c.end,c.speakerId]),en.map(c=>[c.id,c.start,c.end,c.speakerId]));assert.deepEqual(Object.keys(labels.pl).sort(),Object.keys(labels.en).sort());
});
test('playback clock advances, pauses, seeks, clamps and replays from the end',()=>{
 const c=new FilmClock();c.play();c.tick(1000);c.tick(2000);assert.equal(c.time,1);c.pause();c.tick(9000);assert.equal(c.time,1);c.seek(89.9);c.play();c.tick(10000);c.tick(11000);assert.equal(c.time,90);assert.equal(c.playing,false);c.play();assert.equal(c.time,0);c.seek(-4);assert.equal(c.time,0);c.seek(NaN);assert.equal(c.time,0);
});
test('format choice respects URL overrides and only defaults by initial screen size',async()=>{
 const {initialFormat}=await import('../src/night-shift-story.js');
 assert.equal(initialFormat(null,true),'portrait');assert.equal(initialFormat(null,false),'landscape');assert.equal(initialFormat('landscape',true),'landscape');assert.equal(initialFormat('portrait',false),'portrait');assert.equal(initialFormat('invalid',true),'portrait');
});
test('incident narration states reported entanglement explicitly while leaving only the mechanism unknown',()=>{
 assert.match(cueAt(33,'pl').text,/maszyna wciągnęła kobietę/);assert.match(cueAt(33,'pl').text,/jak doszło do pochwycenia/);
 assert.match(cueAt(33,'en').text,/machine pulled her in/);assert.match(cueAt(33,'en').text,/mechanism remains unknown/);
});
