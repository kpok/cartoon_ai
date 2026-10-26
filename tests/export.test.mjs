import test from 'node:test';
import assert from 'node:assert/strict';
import {settings} from '../scripts/export-film.mjs';
import {musicSamples,mixVoice,wav,srt,SAMPLE_RATE} from '../scripts/export-audio.mjs';
test('export settings reject invalid geometry, clips and voice modes',()=>{
 const c=settings([]);assert.equal(c.width,1080);assert.equal(c.height,1920);assert.equal(c.fps,30);assert.equal(c.dialogue,'tts');
 for(const args of [['--story','unknown'],['--lang','xx'],['--width','361'],['--fps','0'],['--duration','91'],['--from','NaN'],['--dialogue','recordings'],['--duration','0.01']])assert.throws(()=>settings(args));
 assert.equal(settings(['--format','landscape']).height,1080);
});
test('offline music is finite, non-silent, ducked and bounded in WAV',()=>{
 const normal=musicSamples(2),ducked=musicSamples(2,[{start:0,end:2}]);let power=0;
 for(let i=0;i<normal.length;i++){assert.ok(Number.isFinite(normal[i]));power+=normal[i]**2;assert.ok(Math.abs(ducked[i])<=Math.abs(normal[i])+.000001);}
 assert.ok(power>1);assert.equal(normal.length,2*SAMPLE_RATE);const encoded=wav(normal);assert.equal(encoded.toString('ascii',0,4),'RIFF');assert.equal(encoded.length,44+normal.length*2);
 const target=new Float32Array(100);mixVoice(target,new Float32Array([.1,.2]),0);assert.ok(Math.abs(target[1]-.58)<.0001);assert.throws(()=>mixVoice(target,new Float32Array([0]),0),/silent/);
});
test('subtitle export clips to requested interval and selected language',()=>{
 const result=srt('garden','en',2,3);assert.match(result,/00:00:00,000 --> 00:00:03,000/);assert.match(result,/little seed/);assert.doesNotMatch(result,/Małe/);
});
