import { PlaybackClock, DURATION } from './story.js';
import { render } from './draw.js';
import { cueAt } from './dialogue.js';
import { FilmSound } from './sound.js';
import { normalizeLocale, translate } from './i18n.js';

const $ = id => document.getElementById(id);
const canvas = $('film'), ctx = canvas.getContext('2d'), clock = new PlaybackClock();
let started = false, frame = null;
let locale = normalizeLocale(new URL(location.href).searchParams.get('lang'));
const t = key => translate(locale, key);
const sound = new FilmSound({
  locale,
  AudioContextClass: window.AudioContext || window.webkitAudioContext,
  synth: window.speechSynthesis,
  UtteranceClass: window.SpeechSynthesisUtterance,
  onStatus: message => { $('sound-status').textContent = message; $('sound-status').hidden = !message; },
});
const format = time => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

function sync() {
  sound.update(clock.time, clock.playing);
  const cue = cueAt(clock.time, locale);
  render(ctx, clock.time, { talking: sound.speaking && clock.playing, speaker: cue?.speakerId });
  const subtitle = $('subtitle');
  subtitle.hidden = !$('captions').checked || !cue;
  const text = cue ? `${cue.speaker}: ${cue.text}` : '';
  if (subtitle.textContent !== text) subtitle.textContent = text;
  $('seek').value = clock.time;
  $('time').textContent = `${format(clock.time)} / 2:00`;
  $('seek').setAttribute('aria-valuetext', `${format(clock.time)} ${t('of')} 2:00`);
  $('play').textContent = clock.playing ? 'Ⅱ' : '▶';
  $('play').setAttribute('aria-label', t(clock.playing ? 'pause' : clock.time === DURATION ? 'replay' : 'play'));
  $('start').hidden = started;
  $('ended').hidden = clock.time < DURATION;
}

function applyTranslations() {
  document.documentElement.lang = locale;
  document.title = t('title');
  document.querySelector('meta[name="description"]').content = t('description');
  for (const [attribute, target] of [['data-i18n', null], ['data-i18n-aria', 'aria-label'], ['data-i18n-title', 'title']]) {
    document.querySelectorAll(`[${attribute}]`).forEach(element => {
      const text = t(element.getAttribute(attribute));
      if (target) element.setAttribute(target, text);
      else element.textContent = text;
    });
  }
  $('home').href = `?lang=${locale}`;
  $('language').value = locale;
  $('fullscreen').setAttribute('aria-label', t(document.fullscreenElement ? 'exitFullscreen' : 'fullscreen'));
  sound.reportStatus();
}

function animate(now) {
  frame = null;
  clock.tick(now);
  sync();
  if (clock.playing) frame = requestAnimationFrame(animate);
}
function play() {
  started = true;
  clock.play(performance.now());
  sound.start(clock.time);
  sync();
  if (frame === null) frame = requestAnimationFrame(animate);
}
function pause() {
  clock.tick(performance.now());
  clock.pause();
  sound.stop();
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  sync();
}
function seek(time) {
  started = true;
  clock.seek(time);
  sound.seek(clock.time);
  sync();
}
function changeLocale(value, updateUrl) {
  // Changing languages keeps the position and preferences, but never resumes audio.
  pause();
  locale = normalizeLocale(value);
  sound.setLocale(locale);
  applyTranslations();
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('lang', locale);
    history.pushState(null, '', url);
  }
  sync();
}
$('language').onchange = event => changeLocale(event.target.value, true);
window.addEventListener('popstate', () => changeLocale(new URL(location.href).searchParams.get('lang'), false));
$('start').onclick = play;
$('play').onclick = () => clock.playing ? pause() : play();
$('again').onclick = play;
$('restart').onclick = () => seek(0);
$('seek').oninput = event => seek(Number(event.target.value));
const player = $('player');
$('fullscreen').hidden = !player.requestFullscreen;
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await player.requestFullscreen();
  } catch { $('fullscreen').title = t('noFullscreen'); }
};
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').setAttribute('aria-label', t(document.fullscreenElement ? 'exitFullscreen' : 'fullscreen'));
});
document.addEventListener('visibilitychange', () => { if (document.hidden && clock.playing) pause(); });
window.addEventListener('pagehide', pause);
$('music').onclick = () => { sound.setMusic(!sound.musicEnabled); $('music').setAttribute('aria-pressed', String(sound.musicEnabled)); sync(); };
$('dialogue').onclick = () => { sound.setDialogue(!sound.dialogueEnabled); $('dialogue').setAttribute('aria-pressed', String(sound.dialogueEnabled)); sync(); };
$('volume').oninput = event => sound.setVolume(Number(event.target.value) / 100);
$('captions').onchange = sync;
document.addEventListener('keydown', event => {
  if (event.target.closest('input,button,a,textarea,select') || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.code === 'Space') { event.preventDefault(); clock.playing ? pause() : play(); }
  if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
    event.preventDefault();
    seek(clock.time + (event.code === 'ArrowRight' ? 5 : -5));
  }
});
applyTranslations();
sync();
