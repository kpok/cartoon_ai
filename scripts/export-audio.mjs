import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join} from 'node:path';
import {noteAt,BEAT_SECONDS} from '../src/dialogue.js';
import {episodeCues,episodes} from '../src/episodes.js';
export const SAMPLE_RATE=48000;
export function run(command,args,{input}={}){
 return new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:['pipe','pipe','pipe']});const output=[];let error='';child.stdout.on('data',b=>output.push(b));child.stderr.on('data',b=>{error=(error+b).slice(-12000);});child.on('error',reject);child.stdin.on('error',()=>{});child.on('close',code=>code===0?resolve(Buffer.concat(output)):reject(new Error(`${command} failed (${code}): ${error}`)));child.stdin.end(input);});
}
export function wav(samples){
 const b=Buffer.alloc(44+samples.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(SAMPLE_RATE,24);b.writeUInt32LE(SAMPLE_RATE*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);return b;
}
export function musicSamples(duration,intervals=[]){
 const result=new Float32Array(Math.round(duration*SAMPLE_RATE));
 for(let beat=0;beat*BEAT_SECONDS<duration;beat++){
  const frequency=noteAt(beat);if(!frequency)continue;const start=beat*BEAT_SECONDS;
  for(let i=0;i<SAMPLE_RATE&&Math.round(start*SAMPLE_RATE)+i<result.length;i++){
   const t=i/SAMPLE_RATE,absolute=start+t,duck=intervals.some(c=>absolute>=c.start&&absolute<c.end)?.3:1;
   const envelope=t<.035?t/.035:Math.exp(Math.log(.0001/.18)*(t-.035)/.915);
   const fade=Math.min(1,(duration-absolute)/.2);
   result[Math.round(start*SAMPLE_RATE)+i]+=.065*envelope*duck*Math.sin(2*Math.PI*frequency*t)*Math.max(0,fade);
  }
 }
 return result;
}
export function mixVoice(target,voice,start){
 let peak=0;for(const value of voice){if(!Number.isFinite(value))throw new Error('Dialogue has invalid audio samples');peak=Math.max(peak,Math.abs(value));}if(peak<.0001)throw new Error('Dialogue recording is silent');
 const offset=Math.round(start*SAMPLE_RATE),gain=.58/peak;
 for(let i=0;i<voice.length&&offset+i<target.length;i++)target[offset+i]+=voice[i]*gain;
}
export async function prepareAudio({story,lang,dialogue,voiceDir,temporary,from,duration,ffmpeg='ffmpeg',tts='espeak-ng'}){
 const cues=episodeCues(story,lang),voices=[],intervals=[];
 await mkdir(temporary,{recursive:true});
 for(const cue of dialogue==='none'?[]:cues){
  let file;
  if(dialogue==='recordings'){
   for(const extension of ['wav','mp3']){const candidate=join(voiceDir,story,lang,`${cue.id}.${extension}`);try{await access(candidate);file=candidate;break;}catch{}}
   if(!file)throw new Error(`Missing recording: ${story}/${lang}/${cue.id}.wav (or .mp3)`);
  }else{
   file=join(temporary,`${cue.id}.wav`);
   await run(tts,['-v',lang==='en'?(cue.speakerId==='kitten'?'en-us':'en-gb'): 'pl','-s','165','-p',cue.speakerId==='kitten'?'65':'78','-w',file,'--stdin'],{input:cue.text});
  }
  let decoded=await run(ffmpeg,['-v','error','-i',file,'-vn','-ac','1','-ar',String(SAMPLE_RATE),'-f','f32le','pipe:1']);
  const length=decoded.length/4/SAMPLE_RATE,available=cue.end-cue.start-.08;
  if(length>available){
   if(dialogue==='recordings'||length/available>1.25)throw new Error(`Dialogue ${cue.id} lasts ${length.toFixed(2)}s; maximum ${available.toFixed(2)}s. Supply a shorter recording.`);
   decoded=await run(ffmpeg,['-v','error','-i',file,'-af',`atempo=${length/available+.002}`,'-ac','1','-ar',String(SAMPLE_RATE),'-f','f32le','pipe:1']);
  }
  const samples=new Float32Array(decoded.length/4);for(let i=0;i<samples.length;i++)samples[i]=decoded.readFloatLE(i*4);
  if(samples.length/SAMPLE_RATE>available+.01)throw new Error(`Dialogue ${cue.id} still exceeds its window`);
  voices.push({cue,samples});intervals.push({start:cue.start,end:cue.start+samples.length/SAMPLE_RATE});
 }
 const mix=musicSamples(episodes[story].duration,intervals);for(const {cue,samples} of voices)mixVoice(mix,samples,cue.start);
 const first=Math.round(from*SAMPLE_RATE),clip=mix.slice(first,first+Math.round(duration*SAMPLE_RATE));
 const path=join(temporary,'soundtrack.wav');await writeFile(path,wav(clip));return {path,intervals,voiceCount:voices.length};
}
export function srt(story,lang,from,duration){
 const timestamp=seconds=>{const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
 return episodeCues(story,lang).filter(c=>c.end>from&&c.start<from+duration).map((c,i)=>`${i+1}\n${timestamp(Math.max(0,c.start-from))} --> ${timestamp(Math.min(duration,c.end-from))}\n${c.speaker}: ${c.text}\n`).join('\n');
}
