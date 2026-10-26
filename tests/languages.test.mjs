import {test} from 'node:test';
import assert from 'node:assert/strict';
import {messages,normalizeLocale,translate} from '../src/i18n.js';
import {dialogueCues,englishCues,cueAt} from '../src/dialogue.js';
import {FilmSound} from '../src/sound.js';

test('both versions have complete interface translations and safe locale fallback',()=>{
  assert.deepEqual(Object.keys(messages.pl).sort(),Object.keys(messages.en).sort());
  for(const locale of ['pl','en'])for(const key of Object.keys(messages.pl))assert.equal(typeof translate(locale,key),'string');
  for(const invalid of [null,undefined,'de','<script>','EN'])assert.equal(normalizeLocale(invalid),'pl');
  assert.equal(normalizeLocale('en'),'en');
});
test('English story shares timings and character identities with Polish story',()=>{
  assert.equal(englishCues.length,7);
  englishCues.forEach((cue,i)=>{
    const pl=dialogueCues[i];
    for(const key of ['id','start','end','speakerId'])assert.equal(cue[key],pl[key]);
    assert.notEqual(cue.text,pl.text);
    assert.equal(cueAt(cue.start,'en'),cue);
    assert.equal(cueAt(cue.start,'pl'),pl);
    assert.equal(cue.speaker,cue.speakerId==='kitten'?'Kitten':'Butterfly');
  });
});
test('English voice selection prefers local variants and never uses Polish voice',()=>{
  const voices=[{lang:'pl-PL',localService:true},{lang:'en-US',localService:false},{lang:'en_GB',localService:true}];
  const sound=new FilmSound({locale:'en',synth:{getVoices:()=>voices,cancel(){}}});
  assert.equal(sound.voice(),voices[2]);voices.splice(1);assert.equal(sound.voice(),null);
  sound.setLocale('pl');assert.equal(sound.voice(),voices[0]);
});
test('locale switch cancels speech, preserves preferences, and ignores stale callbacks',()=>{
  const spoken=[],statuses=[];let cancelled=0;
  const voices=[{lang:'pl-PL',localService:true},{lang:'en-GB',localService:true}];
  const sound=new FilmSound({synth:{getVoices:()=>voices,cancel:()=>cancelled++,speak:u=>spoken.push(u)},UtteranceClass:class{constructor(text){this.text=text;}},onStatus:s=>statuses.push(s)});
  sound.musicEnabled=false;sound.volume=.23;sound.start(24);const old=spoken[0];
  sound.setLocale('en');assert.equal(sound.playing,false);assert.ok(cancelled>0);assert.equal(sound.musicEnabled,false);assert.equal(sound.volume,.23);
  const status=statuses.at(-1);old.onerror();assert.equal(statuses.at(-1),status);
  sound.start(24);assert.equal(spoken.at(-1).lang,'en-GB');assert.equal(spoken.at(-1).text,cueAt(24,'en').text);
  sound.setLocale('en');voices.splice(1);sound.reportStatus();assert.ok(statuses.at(-1).includes('No English voice'));
});
