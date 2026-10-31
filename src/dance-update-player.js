import {createUpdateStage} from './dance-update-stage.js';
import {UPDATE_DURATION} from './dance-update-story.js';
import {updateSamples,UPDATE_SAMPLE_RATE} from './dance-update-audio.js';
const $=id=>document.getElementById(id),canvas=$('robot-canvas');
const exporting=new URLSearchParams(location.search).get('export')==='1';
if(exporting)document.documentElement.classList.add('pilot-export');
let stage,context,buffer,source,gain,frame=null,playing=false,time=0,origin=0,generation=0,unavailable=false;
let muted=false,audioFailed=false;
const now=()=>context?context.currentTime:performance.now()/1000;
function readTime(){return playing?Math.min(UPDATE_DURATION,Math.max(0,now()-origin)):time;}
function stopSource(){if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}canvas.dataset.audioPlaying='false';}
function sync(){
 canvas.dataset.audioPlaying=String(playing&&!muted&&Boolean(source));canvas.dataset.time=time.toFixed(3);canvas.dataset.playing=String(playing);canvas.dataset.muted=String(muted);$('seek').value=String(time);
 $('readout').textContent=`${time.toFixed(1)} / 24 s`;$('play').textContent=playing?'Wstrzymaj':'Odtwórz';$('play').setAttribute('aria-pressed',String(playing));
 $('mute').textContent=muted?'Włącz efekty':'Wycisz efekty';$('mute').setAttribute('aria-pressed',String(muted));
}
function draw(){if(!stage||unavailable)return;const pose=stage.render(time);canvas.dataset.chapter=pose.chapter;$('chapter').textContent=pose.chapter;sync();}
function pause(){generation++;time=readTime();playing=false;stopSource();if(frame!==null)cancelAnimationFrame(frame);frame=null;sync();}
function animate(){frame=null;if(!playing||unavailable)return;time=readTime();if(time>=UPDATE_DURATION){playing=false;stopSource();}draw();if(playing)frame=requestAnimationFrame(animate);}
async function play(){
 if(unavailable||!stage||exporting)return;
 const token=++generation;stopSource();time=readTime();playing=false;
 if(time>=UPDATE_DURATION)time=0;
 try{
  if(!audioFailed){
   if(!context){context=new AudioContext({sampleRate:UPDATE_SAMPLE_RATE});gain=context.createGain();gain.connect(context.destination);const samples=updateSamples();buffer=context.createBuffer(1,samples.length,UPDATE_SAMPLE_RATE);buffer.copyToChannel(samples,0);}
   await context.resume();
   if(token!==generation||document.hidden)return;
   if(context.state!=='running')throw new Error('Audio unavailable');
  }
 }catch{
  if(token!==generation)return;audioFailed=true;await context?.close().catch(()=>{});context=null;
  $('status').textContent='Dźwięk niedostępny. Film można obejrzeć bez efektów.';$('mute').disabled=true;
 }
 if(token!==generation||document.hidden)return;
 origin=now()-time;playing=true;
 if(context){gain.gain.value=muted?0:1;source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.start(0,time);canvas.dataset.audioPlaying=String(!muted);}
 sync();if(frame===null)frame=requestAnimationFrame(animate);
}
function fail(){pause();unavailable=true;canvas.dataset.ready='false';canvas.hidden=true;$('preview').hidden=false;$('status').textContent='Nie udało się uruchomić filmu 3D. Dostępny jest podgląd robota.';for(const id of ['play','restart','seek','mute'])$(id).disabled=true;stage?.dispose();}
$('play').onclick=()=>{if(playing)pause();else void play();};
$('restart').onclick=()=>{pause();time=0;draw();};
$('seek').oninput=()=>{const target=Number($('seek').value);pause();time=Number.isFinite(target)?Math.max(0,Math.min(UPDATE_DURATION,target)):0;draw();};
$('mute').onclick=()=>{muted=!muted;if(gain)gain.gain.value=muted?0:1;canvas.dataset.audioPlaying=String(playing&&!muted&&Boolean(source));sync();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches)pause();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
window.addEventListener('pagehide',event=>{pause();if(!event.persisted){unavailable=true;observer.disconnect();stage?.dispose();void context?.close();}});
const observer=new ResizeObserver(()=>{if(stage&&!unavailable){stage.resize();draw();}});observer.observe(canvas);
try{
 stage=await createUpdateStage(canvas);if(unavailable){stage.dispose();}else{
 canvas.hidden=false;$('preview').hidden=true;stage.resize();canvas.dataset.ready='true';$('status').textContent='24 sekundy · efekty dźwiękowe uruchomią się po naciśnięciu Odtwórz.';
 for(const id of ['play','restart','seek','mute'])$(id).disabled=false;draw();
 if(exporting){stage.resize(innerWidth,innerHeight);window.renderRobotFrame=value=>{if(unavailable||!Number.isFinite(value)||value<0||value>=UPDATE_DURATION)throw new Error('Invalid robot export frame');time=value;draw();return {time,width:canvas.width,height:canvas.height};};window.inspectUpdateFrame=value=>{if(unavailable||!Number.isFinite(value)||value<0||value>=UPDATE_DURATION)throw new Error('Invalid pilot inspection time');stage.render(value,false);return stage.frameBounds();};window.robotExportReady=true;}
 }
}catch{fail();}
