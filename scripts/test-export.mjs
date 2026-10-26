import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {exportFilm,settings} from './export-film.mjs';
import {episodeCues} from '../src/episodes.js';
import {run,prepareAudio,wav,musicSamples} from './export-audio.mjs';
const directory=await mkdtemp(join(tmpdir(),'cartoon-smoke-'));
try{
 for(const [story,lang,from] of [['meadow','pl',3],['garden','en',1]]){
  const out=join(directory,`${story}.mp4`);
  const result=await exportFilm(settings(['--story',story,'--lang',lang,'--width','360','--fps','5','--from',String(from),'--duration','3','--out',out]));
  assert.equal(result.frames,15);assert.equal(result.streams[0].width,360);assert.equal(result.streams[0].height,640);assert.ok(result.voiceCount>0);
  const samples=await run('ffmpeg',['-v','error','-i',out,'-vn','-f','f32le','-ac','1','pipe:1']);let energy=0;for(let i=0;i<samples.length;i+=4)energy+=samples.readFloatLE(i)**2;assert.ok(energy/(samples.length/4)>.00001,'soundtrack is silent');
  assert.match(await readFile(out.replace('.mp4','.srt'),'utf8'),/00:00:00,000/);
 }
 for(const [story,lang] of [['meadow','en'],['garden','pl']]){
  const audio=await prepareAudio({story,lang,dialogue:'tts',temporary:join(directory,`${story}-${lang}`),from:0,duration:1,tts:process.env.ESPEAK_PATH||'espeak-ng'});assert.ok(audio.voiceCount>0);
 }
 await assert.rejects(prepareAudio({story:'garden',lang:'en',dialogue:'recordings',voiceDir:directory,temporary:directory,from:0,duration:1}),/Missing recording/);
 const voiceRoot=join(directory,'voices'),voiceFolder=join(voiceRoot,'meadow','en');await mkdir(voiceFolder,{recursive:true});
 for(const cue of episodeCues('meadow','en'))await writeFile(join(voiceFolder,`${cue.id}.wav`),wav(musicSamples(.2)));
 const recorded={story:'meadow',lang:'en',dialogue:'recordings',voiceDir:voiceRoot,temporary:join(directory,'recorded'),from:0,duration:5};
 assert.equal((await prepareAudio(recorded)).voiceCount,7);
 await writeFile(join(voiceFolder,'meadow-0.wav'),wav(musicSamples(7)));await assert.rejects(prepareAudio(recorded),/maximum/);
 console.log('Both portrait exporters passed: H264/AAC, exact frames/duration, non-silent automatic dialogue+music, SRT.');
}finally{await rm(directory,{recursive:true,force:true});}
