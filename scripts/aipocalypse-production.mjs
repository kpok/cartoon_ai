import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const ROOT = 'docs/aipocalypse/production/';
export const seconds = value => {
  const [minutes, seconds] = value.split(':').map(Number);
  return minutes * 60 + seconds;
};
export const timestamp = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

export function sourceBeats(source) {
  const body = source.split('## SCENARIUSZ\n')[1]?.split('## Wskazówki reżyserskie')[0];
  assert.ok(body, 'Screenplay section missing');
  const sequences = [];
  for (const section of body.split(/^### /m).slice(1)) {
    const header = section.match(/^(\d{2})\. (.*?) — (\d{2}:\d{2})–(\d{2}:\d{2})/);
    assert.ok(header, 'Invalid sequence header');
    const anchors = [...section.matchAll(/\*\*(\d{2}:\d{2})–(\d{2}:\d{2})\.([^*\n]*)\*\*/g)];
    const beats = anchors.map((match, index) => ({
      id: `S${header[1]}-B${String(index + 1).padStart(2, '0')}`,
      start: seconds(match[1]), end: seconds(match[2]),
      source: section.slice(match.index + match[0].length, anchors[index + 1]?.index ?? section.length).trim(),
      anchor_suffix: match[3].trim(),
    }));
    sequences.push({id: `S${header[1]}`, number: Number(header[1]), title: header[2], start: seconds(header[3]), end: seconds(header[4]), beats});
  }
  return {screenplay_sha256: createHash('sha256').update(source).digest('hex'), sequences};
}

export function sourceDialogues(canonical) {
  const cues = [];
  for (const sequence of canonical.sequences) for (const beat of sequence.beats) {
    const local = [];
    for (const match of beat.source.matchAll(/\*\*([^*\n]+?):\*\*\s*„([^”]+)”/g)) {
      local.push({position: match.index, speaker: match[1], text: match[2]});
    }
    // Preserve chronological source order for speech embedded in action paragraphs.
    if (beat.id === 'S10-B03') local.push({position: beat.source.indexOf('Nie żyje'), speaker: 'DRUGI RATOWNIK', text: 'Nie żyje'});
    if (beat.id === 'S09-B04') for (const text of ['Nie wychodź…', 'Jestem przy…', 'Powiedz jej…']) local.push({position: beat.source.indexOf(text), speaker: 'URWANY GŁOS Z URZĄDZENIA', text});
    local.sort((a,b) => a.position-b.position).forEach((cue,index) => cues.push({id: `${beat.id}-D${index+1}`, source_beat: beat.id, speaker: cue.speaker, text: cue.text}));
  }
  return cues;
}

export function validateProduction(plan, source) {
  const canonical = sourceBeats(source);
  assert.equal(plan.schema_version, 1);
  assert.equal(plan.screenplay_sha256, canonical.screenplay_sha256, 'Screenplay changed; reconcile production plan');
  assert.deepEqual(plan.sequences, canonical.sequences.map(seq => ({...seq, beats: seq.beats.map(({source, ...beat}) => beat)})), 'Source beats drifted');
  assert.equal(plan.sequences.length, 22);
  assert.equal(plan.duration_seconds, 870);
  const assets = new Map(plan.assets.map(asset => [asset.id, asset]));
  assert.equal(assets.size, plan.assets.length, 'Duplicate asset ID');
  const ids = new Set();
  let cursor = 0;
  for (const shot of plan.shots) {
    assert.ok(/^S\d{2}-U\d{3}$/.test(shot.id) && !ids.has(shot.id), 'Duplicate or invalid shot ID');
    ids.add(shot.id);
    assert.equal(shot.start, cursor, `Gap/overlap at ${shot.id}`);
    assert.ok(Number.isInteger(shot.end) && shot.end > shot.start);
    const sequence = canonical.sequences.find(seq => seq.number === shot.seq);
    const beat = sequence?.beats.find(beat => beat.id === shot.source_beat);
    assert.ok(beat && shot.start >= beat.start && shot.end <= beat.end, `Shot crosses source beat: ${shot.id}`);
    for (const field of ['location', 'framing', 'camera', 'action', 'emotional_goal', 'simplification']) assert.ok(shot[field]?.trim(), `Missing ${field}`);
    for (const ref of shot.asset_refs) assert.ok(assets.has(ref), `Unknown asset ${ref}`);
    const expectedRefs = ['characters:character', 'models:model', 'animations:animation', 'effects:effect', 'audio:audio'].flatMap(pair => {
      const [field, kind] = pair.split(':');
      assert.ok(Array.isArray(shot[field]));
      return shot[field].map(id => `${kind}:${id}`);
    });
    expectedRefs.push(`location:${shot.location}`);
    assert.deepEqual([...shot.asset_refs].sort(), expectedRefs.sort(), 'Shot dependency inventory drifted');
    if (shot.signature) {
      assert.ok(['screen', 'voice'].includes(shot.signature.mode));
      assert.ok(shot.signature.device?.trim(), 'Missing physical signature device');
      assert.ok(shot.signature.start >= shot.start && shot.signature.end <= shot.end && shot.signature.end - shot.signature.start >= 2, 'Invalid signature interval');
    }
    cursor = shot.end;
  }
  assert.equal(cursor, 870);
  for (const sequence of canonical.sequences) {
    const shots = plan.shots.filter(shot => shot.seq === sequence.number);
    assert.equal(shots[0]?.start, sequence.start);
    assert.equal(shots.at(-1)?.end, sequence.end);
    // Presence is a plan assertion per physical site/sequence, never a readability claim.
    if (sequence.number < 22) for (const location of new Set(shots.map(shot => shot.location).filter(location => location !== 'authorial_black'))) {
      assert.ok(shots.some(shot => shot.location === location && shot.signature), `Missing signature plan in ${sequence.id}/${location}`);
    }
  }
  const launches = plan.shots.filter(shot => shot.start >= 709 && shot.end <= 722);
  assert.deepEqual(launches.map(shot => [shot.start, shot.end]), [[709, 711], [711, 716], [716, 718], [718, 722]], 'Mandatory launch cuts changed');
  const finale = plan.shots.filter(shot => shot.seq === 22);
  assert.deepEqual(finale.map(shot => [shot.start, shot.end]), [[845,849],[849,852],[852,860],[860,862],[862,869],[869,870]], 'Final black timing changed');
  assert.deepEqual(finale.map(shot => shot.card_text ?? ''), ['', '', 'STWORZYLIŚMY ŚWIAT,\nKTÓREGO NIE POTRAFILIŚMY JUŻ ZATRZYMAĆ.', '', 'KTO ZACHOWA KONTROLĘ,\nGDY STRACIMY JĄ MY?', '']);
  assert.ok(finale[0].signature?.mode === 'voice');
  for (const shot of finale.slice(1)) assert.ok(shot.silence === true && !shot.signature && shot.audio.length === 0, 'Final silence changed');
  for (const asset of plan.assets) {
    assert.ok(asset.uses.length > 0 && asset.uses.every(id => ids.has(id)), 'Unresolved asset usage');
    assert.deepEqual(asset.uses, plan.shots.filter(shot => shot.asset_refs.includes(asset.id)).map(shot => shot.id), 'Stale asset reuse index');
    assert.ok(asset.status && asset.provenance_status && asset.variants.length);
  }
  assert.deepEqual(plan.dialogues.map(({id, source_beat, speaker, text}) => ({id, source_beat, speaker, text})), sourceDialogues(canonical), 'Source dialogue missing or changed');
  const dialogueIds = new Set();
  for (const cue of plan.dialogues) {
    assert.ok(!dialogueIds.has(cue.id) && ids.has(cue.shot_id) && cue.text && cue.speaker);
    dialogueIds.add(cue.id);
    const shot = plan.shots.find(shot => shot.id === cue.shot_id);
    assert.equal(shot.source_beat, cue.source_beat);
    assert.ok(canonical.sequences.flatMap(seq => seq.beats).find(beat => beat.id === cue.source_beat).source.includes(cue.text));
    const beat = canonical.sequences.flatMap(seq => seq.beats).find(beat => beat.id === cue.source_beat);
    assert.ok(cue.start >= beat.start && cue.end <= beat.end && cue.end > cue.start, 'Invalid dialogue interval');
    assert.deepEqual(cue.shot_ids, plan.shots.filter(s => s.start < cue.end && s.end > cue.start).map(s=>s.id), 'Stale dialogue shot coverage');
    assert.ok(cue.shot_ids.includes(cue.shot_id), 'Dialogue owner outside its interval');
    if (cue.source_beat === 'S09-B04') assert.ok(cue.end <= 348, 'Speech overlaps required two-second silence');
    if (cue.text === 'Nie żyje' || cue.text === 'Przecież dzwoniłem od razu') assert.ok(cue.start >= 380, 'Death confirmation must follow rescue ellipsis');
    assert.equal(cue.status, 'placeholder');
  }
  assert.ok(plan.continuity?.length >= 7, 'Continuity ledger missing');
  const continuityIds = new Set();
  for (const track of plan.continuity) {
    assert.ok(track.id && !continuityIds.has(track.id)); continuityIds.add(track.id);
    assert.ok(track.instance_id && track.locations?.length);
    assert.ok(track.asset_refs.every(ref => assets.has(ref)));
    for (const state of track.states) {
      assert.ok(state.state && state.shot_ids.length, 'Missing continuity appearance');
      assert.ok(state.shot_ids.every(id => plan.shots.some(shot => shot.id === id && shot.seq === state.sequence && track.locations.includes(shot.location))), 'Invalid continuity reference');
    }
  }
  return {sequences: canonical.sequences.length, beats: canonical.sequences.reduce((sum, seq) => sum + seq.beats.length, 0), shots: plan.shots.length, assets: assets.size, dialogues: plan.dialogues.length, duration: cursor};
}

export function renderStoryboard(plan) {
  const lines = ['# AIpokalypse — storyboard tekstowy i lista ujęć', '', 'Wygenerowano z production.json. Podziały ujęć i przypisania dialogów są propozycjami realizacyjnymi, nie zatwierdzonym animatikiem. Opis źródłowego przedziału pozostaje w danych. Czas dokładny nie jest dowodem jakości obrazu.', ''];
  for (const sequence of plan.sequences) {
    lines.push(`## ${sequence.id} — ${sequence.title} (${timestamp(sequence.start)}–${timestamp(sequence.end)})`, '');
    for (const shot of plan.shots.filter(shot => shot.seq === sequence.number)) {
      lines.push(`### ${shot.id} • ${timestamp(shot.start)}–${timestamp(shot.end)} • ${shot.location}`, '', `**Kadr:** ${shot.framing}. **Kamera:** ${shot.camera}.`, '', shot.action, '', `**Cel:** ${shot.emotional_goal}`, '', `**Zasoby:** ${shot.asset_refs.join(', ')}`, '', `**Podpis:** ${shot.signature ? `${shot.signature.mode}, ${shot.signature.device}, ${timestamp(shot.signature.start)}–${timestamp(shot.signature.end)}` : 'Brak w tym ujęciu; kontrola na poziomie lokalizacji/sekwencji.'}`, '');
      for (const cue of plan.dialogues.filter(cue => cue.shot_id === shot.id)) lines.push(`**Dialog roboczy (${cue.speaker}, ${timestamp(cue.start)}–${timestamp(cue.end)}):** „${cue.text}”`, '');
      if (shot.card_text) lines.push(`**Plansza:** ${shot.card_text.replaceAll('\n', ' / ')}`, '');
      lines.push(`**Wariant oszczędny:** ${shot.simplification}`, '');
    }
  }
  lines.push('## Rejestr zasobów', '', '| ID | Rodzaj | Liczba użyć | Status |', '|---|---|---:|---|');
  for (const asset of plan.assets) lines.push(`| ${asset.id} | ${asset.kind} | ${asset.uses.length} | ${asset.status} |`);
  return lines.join('\n') + '\n';
}

if (process.argv[1]?.endsWith('/aipocalypse-production.mjs')) {
  const source = await readFile('docs/aipocalypse/SCENARIUSZ_PL.md', 'utf8');
  const plan = JSON.parse(await readFile(ROOT + 'production.json', 'utf8'));
  console.log(validateProduction(plan, source));
  if (process.argv.includes('--write')) await writeFile(ROOT + 'STORYBOARD.md', renderStoryboard(plan));
  else assert.equal(await readFile(ROOT + 'STORYBOARD.md', 'utf8'), renderStoryboard(plan), 'Storyboard stale; regenerate with --write');
}
