import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateProduction, sourceBeats, renderStoryboard} from '../scripts/aipocalypse-production.mjs';

const source = readFileSync('docs/aipocalypse/SCENARIUSZ_PL.md', 'utf8');
const plan = JSON.parse(readFileSync('docs/aipocalypse/production/production.json', 'utf8'));
const changed = edit => {const copy=structuredClone(plan); edit(copy); return copy;};

test('whole-film plan preserves screenplay beats, complete runtime and generated storyboard', () => {
  const result = validateProduction(plan, source);
  assert.equal(result.duration, 870);
  assert.equal(result.sequences, 22);
  assert.ok(result.shots > result.beats);
  assert.deepEqual(JSON.parse(readFileSync('docs/aipocalypse/production/source-beats.json','utf8')),sourceBeats(source));
  assert.equal(readFileSync('docs/aipocalypse/production/STORYBOARD.md','utf8'),renderStoryboard(plan));
});

test('missing time, overlapping time, duplicate shots and missing assets block delivery', () => {
  for (const edit of [p=>p.shots[1].start++,p=>p.shots[1].start--,p=>p.shots[1].id=p.shots[0].id,p=>p.shots[0].asset_refs.push('model:not_registered'),p=>p.shots.splice(3,1)]) {
    assert.throws(()=>validateProduction(changed(edit),source));
  }
});

test('signature carrier and per-site presence cannot disappear', () => {
  const shot=plan.shots.find(s=>s.signature);
  assert.throws(()=>validateProduction(changed(p=>p.shots.find(s=>s.id===shot.id).signature.device=''),source));
  assert.throws(()=>validateProduction(changed(p=>{for(const s of p.shots)if(s.seq===1)s.signature=null;}),source));
});

test('mandatory launch cuts, silent ending and exact final words are protected', () => {
  for(const edit of [p=>p.shots.find(s=>s.start===711).start++,p=>p.shots.find(s=>s.start===849).audio.push('music'),p=>p.shots.find(s=>s.start===852).card_text='Inny finał',p=>p.shots.find(s=>s.start===869).end++])assert.throws(()=>validateProduction(changed(edit),source));
});

test('source changes, stale asset reuse and dialogue loss of provenance are rejected', () => {
  assert.throws(()=>validateProduction(plan,source+'\nzmiana'));
  assert.throws(()=>validateProduction(changed(p=>p.assets[0].uses=[]),source));
  assert.throws(()=>validateProduction(changed(p=>p.dialogues[0].text='Nieistniejąca kwestia'),source));
});

test('dialogue coverage, rescue ellipsis, interrupted calls and continuity are protected', () => {
  assert.throws(()=>validateProduction(changed(p=>p.dialogues.pop()),source));
  assert.throws(()=>validateProduction(changed(p=>{const c=p.dialogues.find(c=>c.text==='Nie żyje');c.start=375;}),source));
  assert.throws(()=>validateProduction(changed(p=>{const c=p.dialogues.find(c=>c.text==='Powiedz jej…');c.end=350;}),source));
  assert.throws(()=>validateProduction(changed(p=>p.continuity[0].states[0].shot_ids=[]),source));
  assert.throws(()=>validateProduction(changed(p=>p.shots[0].models.push('hidden_dependency')),source));
  const fragments=plan.dialogues.filter(c=>c.source_beat==='S09-B04');
  assert.equal(new Set(fragments.map(c=>c.shot_id)).size,3);
  assert.deepEqual(plan.dialogues.filter(c=>c.source_beat==='S10-B03').map(c=>c.text),['Nie żyje','Przecież dzwoniłem od razu']);
});
