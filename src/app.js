import {PlaybackClock,DURATION} from './story.js';
import {render} from './draw.js';
import {cueAt} from './dialogue.js';
import {FilmSound} from './sound.js';
const $=id=>document.getElementById(id);
const canvas=$('film'),ctx=canvas.getContext('2d'),clock=new PlaybackClock();
let started=false,frame=null;
const sound=new FilmSound({AudioContextClass:window.AudioContext||window.webkitAudioContext,synth:window.speechSynthesis,UtteranceClass:window.SpeechSynthesisUtterance,onStatus:message=>{$('sound-status').textContent=message;$('sound-status').hidden=!message;}});
sound.reportStatus();
const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function sync(){
 sound.update(clock.time,clock.playing);
 const cue=cueAt(clock.time);
 render(ctx,clock.time,{talking:sound.speaking&&clock.playing,speaker:cue?.speaker});
 const subtitle=$('subtitle');subtitle.hidden=!$('captions').checked||!cue;
 const text=cue?`${cue.speaker}: ${cue.text}`:'';if(subtitle.textContent!==text)subtitle.textContent=text;$('seek').value=clock.time;$('time').textContent=`${format(clock.time)} / 2:00`;
 $('seek').setAttribute('aria-valuetext',`${format(clock.time)} z 2:00`);
 $('play').textContent=clock.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',clock.playing?'Pauza':clock.time===DURATION?'Odtwórz ponownie':'Odtwórz');
 $('start').hidden=started;$('ended').hidden=clock.time<DURATION;
}
function animate(now){frame=null;clock.tick(now);sync();if(clock.playing)frame=requestAnimationFrame(animate);}
function play(){started=true;clock.play(performance.now());sound.start(clock.time);sync();if(frame===null)frame=requestAnimationFrame(animate);}
function pause(){clock.tick(performance.now());clock.pause();sound.stop();if(frame!==null)cancelAnimationFrame(frame);frame=null;sync();}
function toggle(){clock.playing?pause():play();}
$('start').onclick=play;$('play').onclick=toggle;
$('again').onclick=play;
$('restart').onclick=()=>{clock.seek(0);sound.seek(0);sync();};
$('seek').oninput=e=>{started=true;clock.seek(Number(e.target.value));sound.seek(clock.time);sync();};
const player=$('player');
$('fullscreen').hidden=!player.requestFullscreen;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen();}catch{$('fullscreen').title='Pełny ekran jest niedostępny w tej przeglądarce';}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Opuść pełny ekran':'Pełny ekran');});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&clock.playing)pause();});
window.addEventListener('pagehide',()=>pause());
$('music').onclick=()=>{sound.setMusic(!sound.musicEnabled);$('music').setAttribute('aria-pressed',String(sound.musicEnabled));sync();};
$('dialogue').onclick=()=>{sound.setDialogue(!sound.dialogueEnabled);$('dialogue').setAttribute('aria-pressed',String(sound.dialogueEnabled));sync();};
$('volume').oninput=e=>sound.setVolume(Number(e.target.value)/100);
$('captions').onchange=sync;
document.addEventListener('keydown' ,e=>{if(e.target.closest('input,button,a,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();toggle();}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();started=true;clock.seek(clock.time+(e.code==='ArrowRight'?5:-5));sound.seek(clock.time);sync();}});
sync();
