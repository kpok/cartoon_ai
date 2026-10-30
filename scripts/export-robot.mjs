import {parseArgs} from 'node:util';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve,join,dirname} from 'node:path';
import {mkdtemp,mkdir,rm,writeFile,copyFile,rename,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '@playwright/test';
import {createStaticServer} from './static-server.mjs';
import {run} from './export-audio.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function robotSettings(args){
 const {values:v}=parseArgs({args,options:{width:{type:'string',default:'720'},duration:{type:'string'},dance:{type:'string',default:'original'},out:{type:'string',default:'robot-video/robot-dance.mp4'}}});
 const dance=v.dance;if(!['original','kalinka'].includes(dance))throw new Error('Expected dance original or kalinka');
 const maximum=dance==='kalinka'?24:40;
 const width=Number(v.width),duration=Number(v.duration??maximum),fps=24;
 if(![360,720,1080].includes(width)||!Number.isFinite(duration)||duration<=0||duration>maximum||Math.abs(duration*fps-Math.round(duration*fps))>1e-6)throw new Error(`Expected width360/720/1080 and duration within${maximum}s on the24fps grid`);
 if(!v.out.endsWith('.mp4'))throw new Error('Output must end in .mp4');
 return {dance,width,height:width*16/9,fps,duration,frames:Math.round(duration*fps),out:resolve(v.out)};
}
export async function exportRobot(config){
 const temporary=await mkdtemp(join(tmpdir(),'robot-movie-'));let browser,server,encoder,encoderDone;let encoderFailure,encoderError='',interrupted=false;
 const interrupt=()=>{interrupted=true;encoder?.kill('SIGTERM');};process.on('SIGINT',interrupt);process.on('SIGTERM',interrupt);
 try{
  server=createStaticServer(join(root,'dist'));await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
  browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/robot.html?export=1&dance=${config.dance}`);
  await page.waitForFunction(()=>window.robotExportReady===true,null,{timeout:30000});
  const video=join(temporary,'robot.mp4');
  encoder=spawn('ffmpeg',['-v','error','-f','image2pipe','-framerate',String(config.fps),'-vcodec','png','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart','-y',video],{stdio:['pipe','ignore','pipe']});
  encoder.stderr.on('data',buffer=>{encoderError=(encoderError+buffer).slice(-12000);});encoder.stdin.on('error',error=>{encoderFailure=error;});
  encoderDone=new Promise((ok,fail)=>{encoder.on('error',fail);encoder.on('close',code=>code===0?ok():fail(new Error(`Encoder failed (${code}): ${encoderError}`)));});encoderDone.catch(error=>{encoderFailure=error;});
  const canvas=page.locator('#robot-canvas');
  for(let frame=0;frame<config.frames;frame++){
   if(interrupted)throw new Error('Export interrupted');if(encoderFailure)throw encoderFailure;if(errors.length)throw new Error(errors.join('\n'));
   const rendered=await page.evaluate(time=>window.renderRobotFrame(time),frame/config.fps);
   if(rendered.width!==config.width||rendered.height!==config.height)throw new Error('Unexpected export surface size');
   const png=await canvas.screenshot({animations:'allow',timeout:30000});
   if(!encoder.stdin.write(png))await Promise.race([once(encoder.stdin,'drain'),encoderDone.then(()=>{throw new Error('Encoder closed before all frames');})]);
   if(frame%(config.fps*5)===0)console.log(`${frame}/${config.frames} frames`);
  }
  encoder.stdin.end();await encoderDone;encoder=null;
  if(interrupted||errors.length)throw new Error('Export interrupted or renderer failed');
  const probe=JSON.parse((await run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',video])).toString());
  const streams=probe.streams||[],v=streams[0];
  if(streams.length!==1||v?.codec_type!=='video'||v.codec_name!=='h264'||v.pix_fmt!=='yuv420p'||v.width!==config.width||v.height!==config.height||v.avg_frame_rate!=='24/1'||Number(v.nb_frames)!==config.frames||!Number.isFinite(Number(probe.format?.duration))||Math.abs(Number(probe.format.duration)-config.duration)>.05)throw new Error('MP4 validation failed');
  await mkdir(dirname(config.out),{recursive:true});
  const partial=config.out+'.partial';await copyFile(video,partial);await rename(partial,config.out);
  const manifest=JSON.parse(await readFile(join(root,'published/robot/manifest.json'),'utf8'));
  const metadata={...config,model_sha256:manifest.files['robot.glb'].sha256,audio:false,codec:'h264',pix_fmt:'yuv420p',source_commit:process.env.GITHUB_SHA??'local',streams:streams.length};
  await writeFile(config.out.replace(/\.mp4$/,'.json'),JSON.stringify(metadata,null,2)+'\n');console.log(`Validated MP4: ${config.out}`);return metadata;
 }finally{
  process.off('SIGINT',interrupt);process.off('SIGTERM',interrupt);if(encoder){encoder.stdin.destroy();encoder.kill('SIGKILL');await encoderDone?.catch(()=>{});}
  await browser?.close();if(server)await new Promise(ok=>server.close(ok));await rm(temporary,{recursive:true,force:true});
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{await exportRobot(robotSettings(process.argv.slice(2)));}catch(error){console.error(error.message);process.exitCode=1;}}
