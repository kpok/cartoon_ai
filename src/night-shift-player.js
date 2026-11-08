import {DURATION,CHAPTERS,FilmClock,stateAt,cueAt,labels,localeOf,initialFormat} from './night-shift-story.js';
import {createNightStage} from './night-shift-stage.js';
import {FilmSound} from './sound.js';
const $=id=>document.getElementById(id),canvas=$('night-canvas'),clock=new FilmClock();
const query=new URLSearchParams(location.search);
let pictureFormat=initialFormat(query.get('format'),matchMedia('(max-width:650px)').matches);
let locale=localeOf(query.get('lang')),stage,ready=false,disposed=false,frame=null;
const sound=new FilmSound({AudioContextClass:globalThis.AudioContext||globalThis.webkitAudioContext,synth:globalThis.speechSynthesis,UtteranceClass:globalThis.SpeechSynthesisUtterance,locale,duration:DURATION,cueProvider:cueAt,onStatus:text=>{$('audio-status').textContent=text;}});
sound.musicEnabled=false;sound.volume=.12;
const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function draw(){
 const s=stateAt(clock.time),chapter=CHAPTERS.find(c=>c.id===s.chapter),cue=cueAt(clock.time,locale),l=labels[locale];
 if(ready&&!disposed)stage.render(s,clock.playing?cue?.speakerId:null);
 canvas.dataset.time=clock.time.toFixed(3);canvas.dataset.playing=String(clock.playing);canvas.dataset.chapter=s.chapter;
 $('play').textContent=clock.playing?l.pause:l.play;$('play').setAttribute('aria-pressed',String(clock.playing));$('seek').value=String(clock.time);$('time').textContent=`${format(clock.time)} / 1:30`;
 $('chapter-title').textContent=chapter[locale];$('scene-number').textContent=`0${CHAPTERS.indexOf(chapter)+1} / 06`;
 $('scene-note').textContent=s.chapter==='night'?l.date:s.chapter==='line'?l.illustration:s.chapter==='incident'?l.offscreen:s.chapter==='flight'&&s.time>=69?l.hospital:s.chapter==='investigation'?l.final:l.notice;
 $('caption-speaker').textContent=cue?`${cue.speaker}: `:'';$('caption-text').textContent=cue?.text||chapter[locale];$('caption').hidden=!$('captions').checked||clock.time>=DURATION;$('ending').hidden=clock.time<DURATION;$('caption-track').hidden=!$('captions').checked&&clock.time<DURATION;
 for(const b of $('chapters').children)b.setAttribute('aria-current',String(b.dataset.chapter===s.chapter));
}
function cancelFrame(){if(frame!==null)cancelAnimationFrame(frame);frame=null;}
function pause(){if(clock.playing)clock.tick(performance.now());clock.pause();sound.stop();cancelFrame();draw();}
function animate(now){frame=null;if(!ready||disposed||!clock.playing)return;clock.tick(now);sound.update(clock.time,clock.playing);draw();if(clock.playing)frame=requestAnimationFrame(animate);}
function play(){if(!ready||disposed||document.hidden)return;clock.play();sound.start(clock.time);draw();if(frame===null)frame=requestAnimationFrame(animate);}
function seek(value){pause();clock.seek(value);draw();}
function translate(){const l=labels[locale];document.documentElement.lang=locale;document.title=`${l.title} — Cartoon AI`;
 for(const id of ['title','intro','eyebrow','notice','source','ending','failure','restart','fullscreen'])$(id).textContent=l[id];
 for(const [id,key]of [['language-label','language'],['speech-label','voice'],['music-label','music'],['volume-label','volume'],['captions-label','captions'],['seek-label','seek'],['format-label','format'],['landscape-option','landscape'],['portrait-option','portrait']])$(id).textContent=l[key];
 canvas.setAttribute('aria-label',l.canvas);$('home').textContent=l.home;$('home').href=`./?lang=${locale}`;$('fallback').textContent=l.home;$('fallback').href=`./?lang=${locale}`;$('language').value=locale;$('chapters').setAttribute('aria-label',l.chapters);$('status').textContent=disposed?l.failure:ready?l.ready:l.loading;
 $('chapters').replaceChildren(...CHAPTERS.map(c=>{const b=document.createElement('button');b.type='button';b.dataset.chapter=c.id;b.textContent=`${format(c.start)} · ${c[locale]}`;b.disabled=!ready;b.onclick=()=>seek(c.start);return b;}));draw();sound.reportStatus();
}
function fail(){if(disposed)return;clock.pause();sound.stop();cancelFrame();ready=false;disposed=true;canvas.dataset.ready='false';canvas.hidden=true;$('failure-box').hidden=false;for(const id of ['play','restart','seek','fullscreen','speech','music','volume'])$(id).disabled=true;stage?.dispose();translate();}
function applyFormat(){
 const track=$('caption-track');if(pictureFormat==='portrait')$('picture').append(track);else $('notice').after(track);
 $('player').dataset.format=pictureFormat;document.documentElement.dataset.filmFormat=pictureFormat;$('format').value=pictureFormat;
 if(ready&&!disposed){stage.resize();draw();}
}
$('format').onchange=()=>{pictureFormat=initialFormat($('format').value);applyFormat();const url=new URL(location.href);url.searchParams.set('format',pictureFormat);history.replaceState(null,'',url);};
$('play').onclick=()=>clock.playing?pause():play();$('restart').onclick=()=>seek(0);$('seek').oninput=()=>seek(Number($('seek').value));
$('speech').onchange=()=>sound.setDialogue($('speech').checked);$('music').onchange=()=>sound.setMusic($('music').checked);$('volume').oninput=()=>sound.setVolume(Number($('volume').value));$('captions').onchange=draw;
$('language').onchange=()=>{pause();locale=localeOf($('language').value);sound.setLocale(locale);const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);translate();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('player').requestFullscreen();}catch{$('status').textContent=labels[locale].fullMissing;}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{if(event.matches)pause();});
const observer=new ResizeObserver(()=>{if(ready&&!disposed){stage.resize();draw();}});observer.observe(canvas);
window.addEventListener('pagehide',event=>{pause();if(!event.persisted){disposed=true;observer.disconnect();stage?.dispose();speechCleanup();}});
function speechCleanup(){globalThis.speechSynthesis?.removeEventListener?.('voiceschanged',sound.refreshVoices);void sound.context?.close().catch(()=>{});}
window.addEventListener('pageshow',()=>{if(!disposed){clock.pause();sound.stop();draw();}});
applyFormat();translate();try{stage=createNightStage(canvas);ready=true;canvas.dataset.ready='true';for(const id of ['play','restart','seek','fullscreen','speech','music','volume'])$(id).disabled=false;translate();}catch{fail();}
