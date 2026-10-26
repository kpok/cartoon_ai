import {PlaybackClock} from './story.js';
import {render} from './draw.js';
import {FilmSound} from './sound.js';
import {normalizeLocale,translate} from './i18n.js';
import {getEpisode,normalizeStory,episodes,formatTime,meadowVisualTime,episodeCueAt,gardenNote} from './episodes.js';
import {sampleGarden} from './garden-state.js';

const $=id=>document.getElementById(id);
let url=new URL(location.href),locale=normalizeLocale(url.searchParams.get('lang')),episode=getEpisode(url.searchParams.get('story'));
let clock=new PlaybackClock(episode.duration),started=false,frame=null;
const ctx=$('film').getContext('2d');
let gardenView=null,gardenPromise=null,gardenError=false;
const t=key=>translate(locale,key);
const sound=new FilmSound({locale,duration:episode.duration,cueProvider:(time,lang)=>episodeCueAt(time,lang,episode.id),
  AudioContextClass:window.AudioContext||window.webkitAudioContext,synth:window.speechSynthesis,UtteranceClass:window.SpeechSynthesisUtterance,
  onStatus:message=>{$('sound-status').textContent=message;$('sound-status').hidden=!message;},
});
const ready=()=>episode.id!=='garden'||Boolean(gardenView&&!gardenError);

function sync(){
  sound.update(clock.time,clock.playing);
  const cue=episodeCueAt(clock.time,locale,episode.id);
  if(episode.id==='garden'){
    if(gardenView&&!gardenError)gardenView.render(clock.time,{talking:sound.speaking&&clock.playing,speaker:cue?.speakerId});
    $('scene-note').textContent=gardenNote(sampleGarden(clock.time),locale);
  }else render(ctx,meadowVisualTime(clock.time),{talking:sound.speaking&&clock.playing,speaker:cue?.speakerId});
  const text=cue?`${cue.speaker}: ${cue.text}`:'';
  if($('subtitle').textContent!==text)$('subtitle').textContent=text;
  $('subtitle').hidden=!$('captions').checked||!cue;
  $('seek').value=clock.time;
  $('time').textContent=`${formatTime(clock.time)} / ${formatTime(episode.duration)}`;
  $('seek').setAttribute('aria-valuetext',`${formatTime(clock.time)} ${t('of')} ${formatTime(episode.duration)}`);
  $('play').textContent=clock.playing?'Ⅱ':'▶';
  $('play').setAttribute('aria-label',t(clock.playing?'pause':clock.time===episode.duration?'replay':'play'));
  $('start').hidden=started||!ready();$('ended').hidden=clock.time<episode.duration;
  for(const id of ['play','start','again','seek','restart'])$(id).disabled=!ready();
  $('render-status').hidden=ready();
  $('render-message').textContent=t(gardenError?'noWebgl':'loading3d');
  $('back-to-meadow').hidden=!gardenError;
  $('scene-note').hidden=episode.id!=='garden'||!ready();
}
function applyTranslations(){
  const info=episode[locale];
  document.documentElement.lang=locale;document.title=`${info.title} — ${t('brand')}`;
  document.querySelector('meta[name="description"]').content=info.intro;
  for(const [attribute,target] of [['data-i18n',null],['data-i18n-aria','aria-label'],['data-i18n-title','title']]){
    document.querySelectorAll(`[${attribute}]`).forEach(element=>{
      const text=t(element.getAttribute(attribute));if(target)element.setAttribute(target,text);else element.textContent=text;
    });
  }
  $('story-title').textContent=info.title;$('story-intro').textContent=info.intro;
  $('story-badge').textContent=`${episode.renderer.toUpperCase()} · ${formatTime(episode.duration)}`;
  $('start-duration').textContent=`${formatTime(episode.duration)} · ${t('watch')}`;
  $('ending-line').textContent=info.ending;
  $('player').setAttribute('aria-label',info.title);
  for(const id of ['film','garden-film'])$(id).setAttribute('aria-label',info.canvas);
  $('home').setAttribute('aria-label',info.title);
  $('home').href=`?lang=${locale}&story=${episode.id}`;
  $('language').value=locale;$('seek').max=episode.duration;
  document.querySelectorAll('button[data-story]').forEach(button=>{
    const item=episodes[button.dataset.story];
    button.setAttribute('aria-pressed',String(item.id===episode.id));
    button.querySelector('.card-title').textContent=item[locale].title;
    button.querySelector('.card-detail').textContent=item[locale].card;
    button.querySelector('.card-tag').textContent=`${item[locale].tag} · ${formatTime(item.duration)}`;
  });
  $('fullscreen').setAttribute('aria-label',t(document.fullscreenElement?'exitFullscreen':'fullscreen'));
  sound.reportStatus();
}
async function prepareGarden(){
  if(gardenView&&!gardenError)return;
  if(!gardenPromise){
    gardenError=false;
    gardenPromise=import('./garden-view.js').then(({createGardenView})=>{
      gardenView=createGardenView($('garden-film'),{onContextLost:()=>{
        gardenError=true;$('garden-film').dataset.ready='false';pause();gardenView?.dispose();gardenView=null;gardenPromise=null;sync();
      }});
      $('garden-film').dataset.ready='true';
    }).catch(()=>{gardenError=true;gardenPromise=null;$('garden-film').dataset.ready='false';});
  }
  await gardenPromise;
  // A completed asynchronous load must not switch the selected episode or start playback.
  if(episode.id==='garden')sync();
}
function animate(now){frame=null;clock.tick(now);sync();if(clock.playing)frame=requestAnimationFrame(animate);}
function play(){if(!ready())return;started=true;clock.play(performance.now());sound.start(clock.time);sync();if(frame===null)frame=requestAnimationFrame(animate);}
function pause(){clock.tick(performance.now());clock.pause();sound.stop();if(frame!==null)cancelAnimationFrame(frame);frame=null;sync();}
function seek(time){if(!ready())return;started=true;clock.seek(time);sound.seek(clock.time);sync();}
function writeUrl(){const next=new URL(location.href);next.searchParams.set('lang',locale);next.searchParams.set('story',episode.id);history.pushState(null,'',next);}
function chooseStory(value,updateUrl=true){
  pause();episode=getEpisode(value);clock=new PlaybackClock(episode.duration);started=false;
  sound.setEpisode(episode.duration,(time,lang)=>episodeCueAt(time,lang,episode.id));
  $('film').hidden=episode.id==='garden';$('garden-film').hidden=episode.id!=='garden';
  $('player').dataset.story=episode.id;applyTranslations();if(updateUrl)writeUrl();sync();
  if(episode.id==='garden')prepareGarden();
}
function changeLocale(value,updateUrl=true){pause();locale=normalizeLocale(value);sound.setLocale(locale);applyTranslations();if(updateUrl)writeUrl();sync();}
$('language').onchange=event=>changeLocale(event.target.value);
document.querySelectorAll('button[data-story]').forEach(button=>button.onclick=()=>chooseStory(button.dataset.story));
$('back-to-meadow').onclick=()=>chooseStory('meadow');
window.addEventListener('popstate',()=>{
  const next=new URL(location.href);const nextLocale=normalizeLocale(next.searchParams.get('lang')),nextStory=normalizeStory(next.searchParams.get('story'));
  if(nextLocale!==locale)changeLocale(nextLocale,false);
  if(nextStory!==episode.id)chooseStory(nextStory,false);
});
$('start').onclick=play;$('again').onclick=play;$('play').onclick=()=>clock.playing?pause():play();
$('restart').onclick=()=>seek(0);$('seek').oninput=event=>seek(Number(event.target.value));
const player=$('player');$('fullscreen').hidden=!player.requestFullscreen;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen();}catch{$('fullscreen').title=t('noFullscreen');}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',t(document.fullscreenElement?'exitFullscreen':'fullscreen'));sync();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&clock.playing)pause();});window.addEventListener('pagehide',pause);
window.addEventListener('resize',()=>sync());
$('music').onclick=()=>{sound.setMusic(!sound.musicEnabled);$('music').setAttribute('aria-pressed',String(sound.musicEnabled));sync();};
$('dialogue').onclick=()=>{sound.setDialogue(!sound.dialogueEnabled);$('dialogue').setAttribute('aria-pressed',String(sound.dialogueEnabled));sync();};
$('volume').oninput=event=>sound.setVolume(Number(event.target.value)/100);$('captions').onchange=sync;
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,button,a,textarea,select')||event.ctrlKey||event.metaKey||event.altKey)return;
  if(event.code==='Space'){event.preventDefault();clock.playing?pause():play();}
  if(event.code==='ArrowRight'||event.code==='ArrowLeft'){event.preventDefault();seek(clock.time+(event.code==='ArrowRight'?5:-5));}
});
chooseStory(episode.id,false);
