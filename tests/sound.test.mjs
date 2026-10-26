import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FilmSound} from '../src/sound.js';
import {cueAt,dialogueCues,noteAt} from '../src/dialogue.js';
function fixture({deferred=false,reject=false,voices=[{lang:'pl-PL',localService:true}]}={}) {
  const log={notes:[],spoken:[],cancel:0,suspend:0,contexts:0,status:[]};
  let resolveResume;
  const param=()=>({value:0,setTargetAtTime(){},cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  class Context {
    constructor(){log.contexts++;this.currentTime=0;this.state='running';this.destination={};}
    createGain(){return {gain:param(),connect(){},disconnect(){}};}
    createOscillator(){const item={frequency:{},connect(){},disconnect(){},start:time=>log.notes.push(time),stop(){}};return item;}
    resume(){if(reject)return Promise.reject(new Error('blocked'));if(deferred)return new Promise(resolve=>{resolveResume=resolve;});return Promise.resolve();}
    suspend(){log.suspend++;this.state='suspended';return Promise.resolve();}
  }
  const synth={getVoices:()=>voices,speak:u=>log.spoken.push(u),cancel:()=>log.cancel++,addEventListener:(type,fn)=>{log.voicesChanged=fn;}};
  const sound=new FilmSound({AudioContextClass:Context,synth,UtteranceClass:class{constructor(text){this.text=text;}},onStatus:s=>log.status.push(s)});
  return {sound,log,voices,resolve:()=>resolveResume?.()};
}
test('dialogues fit story, have no overlapping windows and deterministic boundaries',()=>{
  dialogueCues.forEach((cue,i)=>{assert.ok(cue.start>=0&&cue.end<=120&&cue.start<cue.end);if(i)assert.ok(dialogueCues[i-1].end<=cue.start);assert.equal(cueAt(cue.start),cue);assert.notEqual(cueAt(cue.end),cue);});
  assert.equal(cueAt(0),null);assert.equal(cueAt(120),null);assert.equal(noteAt(0),noteAt(16));
});
test('sound is gesture initialized and speech never queues on each frame',()=>{
  const {sound,log}=fixture();sound.update(10,true);assert.equal(log.contexts,0);
  sound.start(10);for(let t=10;t<16;t+=.05)sound.update(t,true);
  assert.equal(log.spoken.length,1);sound.update(16,true);assert.equal(sound.speaking,false);
  sound.stop();assert.equal(sound.playing,false);assert.equal(sound.nodes.size,0);
});
test('pause, seek, toggles and end cancel active speech and scheduled music',()=>{
  const {sound,log}=fixture();sound.start(0);sound.update(0,true);assert.ok(log.notes.length>0);
  sound.seek(24);sound.context.state='running';sound.update(24,true);assert.equal(log.spoken.length,1);
  sound.setDialogue(false);assert.equal(sound.speaking,false);sound.update(25,true);assert.equal(log.spoken.length,1);
  sound.setDialogue(true);sound.update(25,true);assert.equal(log.spoken.length,2);
  sound.setMusic(false);assert.equal(sound.nodes.size,0);
  sound.seek(10);sound.update(10,true);assert.equal(log.spoken.at(-1).text,cueAt(10).text);
  sound.update(120,false);assert.equal(sound.playing,false);assert.equal(sound.speaking,false);
});
test('large timestamp jumps skip old notes and expired dialogue',()=>{
  const {sound,log}=fixture();sound.start(0);const before=log.notes.length;
  sound.update(100,true);assert.equal(log.spoken.length,0);assert.ok(log.notes.length-before<=1);
  sound.seek(28.5);sound.update(28.5,true);assert.equal(log.spoken.length,0);
});
test('pause invalidates pending context resume; rejection has visible fallback',async()=>{
  const {sound,log,resolve}=fixture({deferred:true});sound.start(0);sound.stop();resolve();await Promise.resolve();assert.equal(sound.playing,false);assert.ok(log.suspend>=2);
  const failed=fixture({reject:true});failed.sound.start(0);await new Promise(resolve=>setTimeout(resolve,0));assert.ok(failed.log.status.at(-1).includes('Muzyka jest niedostępna'));
});
test('late Polish voices, voice preference and speech failure are handled',()=>{
  const f=fixture({voices:[]});f.sound.start(10);assert.equal(f.log.spoken.length,0);assert.ok(f.log.status.at(-1).includes('Brak polskiego głosu'));
  f.voices.push({lang:'pl-PL',localService:false},{lang:'pl-PL',localService:true});f.log.voicesChanged();f.sound.update(11,true);assert.equal(f.log.spoken.length,1);assert.equal(f.log.spoken[0].voice.localService,true);
  f.log.spoken[0].onerror();assert.ok(f.log.status.at(-1).includes('Nie udało się'));
  f.sound.stop();f.log.spoken[0].onend();assert.equal(f.sound.speaking,false);
});
test('seek and replay can repeat current cue while volume remains bounded',()=>{
  const {sound,log}=fixture();sound.start(24);sound.stop();sound.start(24);assert.equal(log.spoken.length,2);
  sound.setVolume(5);assert.equal(sound.volume,1);sound.setVolume(-1);assert.equal(sound.volume,0);
});
