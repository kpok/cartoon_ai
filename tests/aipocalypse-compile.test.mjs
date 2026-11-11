import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compile,environmentFor,kindFor} from '../scripts/aipocalypse-compile.mjs';
const plan=JSON.parse(readFileSync('docs/aipocalypse/production/production.json','utf8'));
const source=readFileSync('docs/aipocalypse/SCENARIUSZ_PL.md','utf8');
test('runtime compilation retains all shots, exact cards, dialogue timing and explicit proxy status',()=>{
 const runtime=compile(plan,source);
 assert.equal(runtime.duration,870);assert.equal(runtime.shots.length,149);assert.equal(runtime.sequences.length,22);
 assert.equal(runtime.audio_status,'unrecorded_captions_only');
 assert.deepEqual(runtime.dialogues.map(c=>[c.id,c.start,c.end]),plan.dialogues.map(c=>[c.id,c.start,c.end]));
 assert.deepEqual(runtime.shots.map(s=>[s.id,s.start,s.end,s.card_text]),plan.shots.map(s=>[s.id,s.start,s.end,s.card_text]));
 for(const shot of runtime.shots)for(const model of shot.models)assert.equal(model.status,'rough_proxy');
});
test('distinct location families and critical story props keep their intended builders',()=>{
 const families=new Set(plan.shots.map(s=>environmentFor(s.location)));
 for(const family of ['street','shop','control','port','factory','hospital','habitat','polar','orbit','launch','car_interior','elevator','water','black'])assert.ok(families.has(family));
 for(const [name,kind] of [['port_crane','crane'],['factory_robot','robot'],['fictional_rocket','rocket'],['fictional_drone','drone'],['phone','device'],['taxi','vehicle'],['notebook','paper']])assert.equal(kindFor(name),kind);
});
