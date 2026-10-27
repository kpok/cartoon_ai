import {parseArgs} from 'node:util';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {readFile,writeFile,mkdir,mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createStaticServer} from './static-server.mjs';
import {validateMovie,publishBundle} from './export-validation.mjs';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '@playwright/test';
import {episodes} from '../src/episodes.js';
import {prepareAudio,run,srt} from './export-audio.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function settings(args){
 const {values:v}=parseArgs({args,options:{story:{type:'string',default:'garden'},lang:{type:'string',default:'en'},format:{type:'string',default:'portrait'},width:{type:'string'},fps:{type:'string',default:'30'},dialogue:{type:'string',default:'tts'},'voice-dir':{type:'string'},out:{type:'string'},from:{type:'string',default:'0'},duration:{type:'string'},'no-captions':{type:'boolean',default:false},help:{type:'boolean',default:false}}});
 if(v.help)return {help:true};
 if(!Object.hasOwn(episodes,v.story))throw new Error('story must be meadow or garden');
 if(!['pl','en'].includes(v.lang))throw new Error('lang must be pl or en');
 if(!['portrait','landscape'].includes(v.format))throw new Error('format must be portrait or landscape');
 if(!['tts','recordings','none'].includes(v.dialogue))throw new Error('dialogue must be tts, recordings or none');
 const width=Number(v.width??(v.format==='portrait'?1080:1920)),height=v.format==='portrait'?width*16/9:width*9/16,fps=Number(v.fps),from=Number(v.from),duration=v.duration===undefined?episodes[v.story].duration-from:Number(v.duration);
 if(!Number.isInteger(width)||!Number.isInteger(height)||width%2||height%2||width<180||height<180||width>3840||height>3840)throw new Error('width must produce even 9:16 or16:9 dimensions between180 and3840 (e.g360/720/1080 portrait,640/1280/1920 landscape)');
 if(!Number.isInteger(fps)||fps<1||fps>60)throw new Error('fps must be an integer1–60');
 if(!Number.isFinite(from)||from<0||!Number.isFinite(duration)||duration<=0||from+duration>episodes[v.story].duration||Math.abs(duration*fps-Math.round(duration*fps))>1e-6)throw new Error('clip must be within story and duration*fps must be integral');
 if(v.out&&!/\.mp4$/i.test(v.out))throw new Error('--out must end in .mp4');
 if(v.dialogue==='recordings'&&!v['voice-dir'])throw new Error('--voice-dir is required for recordings');
 return {story:v.story,lang:v.lang,format:v.format,width,height,fps,from,duration,dialogue:v.dialogue,voiceDir:v['voice-dir']?resolve(v['voice-dir']):undefined,captions:!v['no-captions'],out:resolve(v.out||join(root,'exports',`${v.story}-${v.lang}-${v.format}.mp4`))};
}
export async function exportFilm(config){
 const ffmpeg=process.env.FFMPEG_PATH||'ffmpeg',ffprobe=process.env.FFPROBE_PATH||'ffprobe',tts=process.env.ESPEAK_PATH||'espeak-ng';
 await run(ffmpeg,['-version']);await run(ffprobe,['-version']);if(config.dialogue==='tts')await run(tts,['--version']);
 await mkdir(dirname(config.out),{recursive:true});
 for(const extension of ['mp4','srt','json']){const destination=config.out.replace(/\.mp4$/i,`.${extension}`);try{await access(destination);throw new Error(`Output already exists: ${destination}. Choose another --out or remove it explicitly.`);}catch(e){if(e.code!=='ENOENT')throw e;}}
 await import('./vendor.mjs');
 const temporary=await mkdtemp(join(tmpdir(),'cartoon-export-'));
 // Stage beside the destination for exclusive hard-link publication on the same filesystem.
 const staging=await mkdtemp(join(dirname(config.out),'.cartoon-export-'));
 let server,browser,encoder;let encoderDone;let interrupted=false;
 const interrupt=()=>{interrupted=true;};process.on('SIGINT',interrupt);process.on('SIGTERM',interrupt);
 try{
  console.log(`Preparing ${config.dialogue} dialogue and original music…`);
  const audio=await prepareAudio({...config,temporary,ffmpeg,tts});
  if(interrupted)throw new Error('Export interrupted');
  server=createStaticServer(root);
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
  browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const params=new URLSearchParams({story:config.story,lang:config.lang,width:config.width,height:config.height,captions:String(config.captions),dialogue:config.dialogue});
  await page.goto(`http://127.0.0.1:${server.address().port}/export.html?${params}`);
  await page.waitForFunction(()=>window.exportReady===true,null,{timeout:30000});
  if(errors.length)throw new Error(errors.join('\n'));
  const video=join(temporary,'video.mp4');let encoderError='',encoderFailure;
  encoder=spawn(ffmpeg,['-v','error','-f','image2pipe','-framerate',String(config.fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-threads','2','-y',video],{stdio:['pipe','ignore','pipe']});
  encoder.stderr.on('data',b=>{encoderError=(encoderError+b).slice(-12000);});
  encoder.stdin.on('error',e=>{encoderFailure=e;});
  encoderDone=new Promise((ok,fail)=>{encoder.on('error',fail);encoder.on('close',code=>code===0?ok():fail(new Error(`Video encoder failed (${code}): ${encoderError}`)));});
  // Attach the rejection handler immediately, including failures before the first frame.
  encoderDone.catch(e=>{encoderFailure=e;});
  const frames=Math.round(config.duration*config.fps),surface=page.locator('#frame');
  for(let frame=0;frame<frames;frame++){
   if(interrupted)throw new Error('Export interrupted');
   if(encoderFailure)throw encoderFailure;
   await page.evaluate(t=>window.renderFrame(t),config.from+frame/config.fps);
   if(errors.length)throw new Error(errors.join('\n'));
   const png=await surface.screenshot({animations:'allow',timeout:30000});
   if(!encoder.stdin.write(png))await Promise.race([once(encoder.stdin,'drain'),encoderDone.then(()=>{throw new Error('Encoder closed before all frames');})]);
   if(frame%Math.max(1,config.fps*5)===0)console.log(`${frame}/${frames} frames (${(frame/config.fps).toFixed(1)}s)`);
  }
  encoder.stdin.end();await encoderDone;encoder=null;
  if(interrupted)throw new Error('Export interrupted');
  const movie=join(staging,'film.mp4');
  await run(ffmpeg,['-v','error','-i',video,'-i',audio.path,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(config.duration),'-movflags','+faststart','-y',movie]);
  const probe=JSON.parse((await run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',movie])).toString());
  validateMovie(probe,config);
  const metadata={...config,frames,voiceCount:audio.voiceCount,voiceBackend:config.dialogue==='tts'?'eSpeak NG (basic synthetic voices)':config.dialogue,streams:probe.streams.map(({codec_type,codec_name,width,height,avg_frame_rate,sample_rate,channels,nb_frames})=>({codec_type,codec_name,width,height,avg_frame_rate,sample_rate,channels,nb_frames})),duration:Number(probe.format.duration)};
  await writeFile(join(staging,'film.srt'),srt(config.story,config.lang,config.from,config.duration));
  await writeFile(join(staging,'film.json'),JSON.stringify(metadata,null,2)+'\n');
  await publishBundle(staging,config.out);
  console.log(`Exported: ${config.out} (${config.duration}s, ${config.width}×${config.height}, ${config.fps}fps, music + ${config.dialogue} dialogue)`);
  return metadata;
 }finally{
  process.off('SIGINT',interrupt);process.off('SIGTERM',interrupt);
  if(encoder){encoder.stdin.destroy();encoder.kill('SIGKILL');await encoderDone?.catch(()=>{});}
  await browser?.close();if(server)await new Promise(ok=>server.close(ok));
  await rm(temporary,{recursive:true,force:true});await rm(staging,{recursive:true,force:true});
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const config=settings(process.argv.slice(2));if(config.help)console.log('npm run export:mp4 -- --story meadow|garden --lang pl|en --format portrait|landscape --width 1080 --fps 30 --dialogue tts|recordings|none --voice-dir PATH --out PATH.mp4 [--from 0 --duration 5] [--no-captions]');else await exportFilm(config);}catch(e){console.error(`Export failed: ${e.message}`);process.exitCode=1;}
}
