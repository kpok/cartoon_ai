import {PlaybackClock,DURATION} from './story.js';
import {render} from './draw.js';
const $=id=>document.getElementById(id);
const canvas=$('film'),ctx=canvas.getContext('2d'),clock=new PlaybackClock();
let started=false,frame=null;
const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function sync(){
 render(ctx,clock.time);$('seek').value=clock.time;$('time').textContent=`${format(clock.time)} / 2:00`;
 $('seek').setAttribute('aria-valuetext',`${format(clock.time)} z 2:00`);
 $('play').textContent=clock.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',clock.playing?'Pauza':clock.time===DURATION?'Odtwórz ponownie':'Odtwórz');
 $('start').hidden=started;$('ended').hidden=clock.time<DURATION;
}
function animate(now){frame=null;clock.tick(now);sync();if(clock.playing)frame=requestAnimationFrame(animate);}
function play(){started=true;clock.play(performance.now());sync();if(frame===null)frame=requestAnimationFrame(animate);}
function pause(){clock.tick(performance.now());clock.pause();if(frame!==null)cancelAnimationFrame(frame);frame=null;sync();}
function toggle(){clock.playing?pause():play();}
$('start').onclick=play;$('play').onclick=toggle;
$('again').onclick=play;
$('restart').onclick=()=>{clock.seek(0);sync();};
$('seek').oninput=e=>{started=true;clock.seek(Number(e.target.value));sync();};
const player=$('player');
$('fullscreen').hidden=!player.requestFullscreen;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen();}catch{$('fullscreen').title='Pełny ekran jest niedostępny w tej przeglądarce';}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Opuść pełny ekran':'Pełny ekran');});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&clock.playing)pause();});
document.addEventListener('keydown',e=>{if(e.target.closest('input,button,a,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();toggle();}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();started=true;clock.seek(clock.time+(e.code==='ArrowRight'?5:-5));sync();}});
sync();
