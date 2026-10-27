import assert from 'node:assert/strict';
import {link,unlink} from 'node:fs/promises';
import {join} from 'node:path';

export function validateMovie(probe,config){
 const streams=probe?.streams;assert.ok(Array.isArray(streams)&&streams.length===2,'MP4 must contain exactly two streams');
 const video=streams.find(s=>s.codec_type==='video'),audio=streams.find(s=>s.codec_type==='audio');
 assert.ok(video&&audio,'MP4 requires video and audio');
 assert.equal(video.codec_name,'h264');assert.equal(video.pix_fmt,'yuv420p');
 assert.equal(video.width,config.width);assert.equal(video.height,config.height);
 assert.equal(Number(video.nb_frames),Math.round(config.duration*config.fps));
 const ratio=String(video.avg_frame_rate).split('/');assert.equal(ratio.length,2,'Invalid frame rate');
 const fps=Number(ratio[0])/Number(ratio[1]);assert.ok(Number.isFinite(fps)&&Math.abs(fps-config.fps)<.00001,'Unexpected frame rate');
 assert.equal(audio.codec_name,'aac');assert.equal(Number(audio.sample_rate),48000);assert.equal(audio.channels,1);
 for(const [name,value] of [['container',probe.format?.duration],['video',video.duration],['audio',audio.duration]]){
  const duration=Number(value);assert.ok(Number.isFinite(duration)&&duration>0&&Math.abs(duration-config.duration)<=.1,`Invalid ${name} duration`);
 }
}
export async function publishBundle(staging,out){
 const created=[];
 try{
  // Hard links create each destination exclusively. MP4 is the final completion marker.
  for(const extension of ['srt','json','mp4']){
   const destination=out.replace(/\.mp4$/i,`.${extension}`);
   await link(join(staging,`film.${extension}`),destination);created.push(destination);
  }
 }catch(error){
  // Roll back only files this invocation created; never replace another writer's output.
  for(const destination of created.reverse())await unlink(destination);
  throw error;
 }
}
