import { cueAt, noteAt, BEAT_SECONDS } from './dialogue.js';
import { normalizeLocale, translate } from './i18n.js';

export class FilmSound {
  constructor({ AudioContextClass, synth, UtteranceClass, onStatus = () => {}, locale = 'pl' } = {}) {
    this.locale = normalizeLocale(locale);
    this.AudioContextClass = AudioContextClass;
    this.synth = synth;
    this.UtteranceClass = UtteranceClass;
    this.onStatus = onStatus;
    this.musicEnabled = true;
    this.dialogueEnabled = true;
    this.volume = 0.4;
    this.playing = false;
    this.time = 0;
    this.generation = 0;
    this.nodes = new Set();
    this.lastBeat = -1;
    this.lastCue = null;
    this.spokenCue = null;
    this.speaking = false;
    this.speechFailed = false;
    this.musicFailed = false;
    this.refreshVoices = () => this.reportStatus();
    synth?.addEventListener?.('voiceschanged', this.refreshVoices);
  }

  voice() {
    const voices = this.synth?.getVoices?.() || [];
    const matching = voices.filter(voice => String(voice.lang).toLowerCase().replace('_', '-').split('-')[0] === this.locale);
    return matching.find(voice => voice.localService) || matching[0] || null;
  }

  reportStatus() {
    const messages = [];
    if (this.musicEnabled && (!this.AudioContextClass || this.musicFailed)) {
      messages.push(translate(this.locale, 'musicUnavailable'));
    }
    if (this.dialogueEnabled) {
      if (!this.UtteranceClass || !this.voice()) {
        messages.push(translate(this.locale, 'voiceMissing'));
      } else if (this.speechFailed) {
        messages.push(translate(this.locale, 'speechFailed'));
      } else if (!this.voice().localService) {
        messages.push(translate(this.locale, 'remoteVoice'));
      }
    }
    this.onStatus(messages.join(' '));
  }

  unlock() {
    if (!this.musicEnabled || !this.AudioContextClass) return;
    try {
      if (!this.context) {
        this.context = new this.AudioContextClass();
        this.master = this.context.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.context.destination);
      }
      const generation = this.generation;
      // Resume is requested in the user gesture, never from an animation callback.
      Promise.resolve(this.context.resume()).then(() => {
        if (generation !== this.generation || !this.playing || !this.musicEnabled) {
          if (!this.playing || !this.musicEnabled) this.context.suspend().catch(() => {});
          return;
        }
        this.musicFailed = false;
        this.reportStatus();
      }).catch(() => {
        if (generation !== this.generation) return;
        this.musicFailed = true;
        this.reportStatus();
      });
    } catch {
      this.musicFailed = true;
      this.reportStatus();
    }
  }

  start(time) {
    this.stop();
    this.playing = true;
    this.time = time;
    this.lastBeat = Math.ceil(time / BEAT_SECONDS) - 1;
    this.speechFailed = false;
    this.unlock();
    this.update(time, true);
    this.reportStatus();
  }

  setLocale(locale) {
    this.stop();
    this.locale = normalizeLocale(locale);
    this.speechFailed = false;
    this.reportStatus();
  }

  cancelSpeech() {
    this.utterance = null;
    this.speaking = false;
    this.synth?.cancel?.();
  }

  stopNotes() {
    const now = this.context?.currentTime || 0;
    for (const { oscillator, gain } of this.nodes) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.005);
      try { oscillator.stop(now + 0.025); } catch { /* Already stopped. */ }
    }
    this.nodes.clear();
  }

  stop() {
    this.generation += 1;
    this.playing = false;
    this.stopNotes();
    this.cancelSpeech();
    this.lastCue = null;
    this.spokenCue = null;
    if (this.context) this.context.suspend().catch(() => {});
  }

  seek(time) {
    const playing = this.playing;
    this.stop();
    this.time = time;
    this.playing = playing;
    this.lastBeat = Math.ceil(time / BEAT_SECONDS) - 1;
    // A seek while playing is a user gesture, so the browser may resume audio.
    if (playing) this.unlock();
  }

  setMusic(enabled) {
    this.musicEnabled = enabled;
    this.generation += 1;
    this.stopNotes();
    this.lastBeat = Math.ceil(this.time / BEAT_SECONDS) - 1;
    if (enabled && this.playing) this.unlock();
    else if (this.context) this.context.suspend().catch(() => {});
    this.reportStatus();
  }

  setDialogue(enabled) {
    this.dialogueEnabled = enabled;
    this.cancelSpeech();
    this.spokenCue = null;
    this.reportStatus();
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
    if (this.master) {
      this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.03);
    }
  }

  speak(cue) {
    const voice = this.voice();
    if (!this.dialogueEnabled || !voice || !this.UtteranceClass || this.spokenCue === cue.id) return;
    this.cancelSpeech();
    this.spokenCue = cue.id;
    const utterance = new this.UtteranceClass(cue.text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = cue.speakerId === 'butterfly' ? 1.35 : 1.05;
    utterance.volume = 0.7;
    utterance.onend = () => {
      if (this.utterance === utterance) this.speaking = false;
    };
    utterance.onerror = () => {
      if (this.utterance !== utterance) return;
      this.speaking = false;
      this.speechFailed = true;
      this.reportStatus();
    };
    this.utterance = utterance;
    this.speaking = true;
    try { this.synth.speak(utterance); }
    catch { utterance.onerror(); }
  }

  scheduleNote(beat, time) {
    const frequency = noteAt(beat);
    if (frequency === null) return;
    const context = this.context;
    const start = context.currentTime + Math.max(0, beat * BEAT_SECONDS - time);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duck = this.dialogueEnabled && cueAt(beat * BEAT_SECONDS, this.locale) ? 0.3 : 1;
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18 * duck, start + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.95);
    oscillator.connect(gain);
    gain.connect(this.master);
    const entry = { oscillator, gain };
    this.nodes.add(entry);
    oscillator.onended = () => {
      this.nodes.delete(entry);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(start + 1);
  }

  update(time, playing) {
    this.time = time;
    if (!playing || time >= 120) {
      if (this.playing) this.stop();
      return;
    }
    if (!this.playing) return;
    const cue = cueAt(time, this.locale);
    if ((cue?.id || null) !== this.lastCue) {
      this.cancelSpeech();
      this.lastCue = cue?.id || null;
      this.spokenCue = null;
    }
    // Never queue missed dialogue after a stalled frame or a seek near cue end.
    if (cue && time < cue.end - 2) this.speak(cue);
    if (this.musicEnabled && this.context?.state === 'running') {
      const current = Math.floor(time / BEAT_SECONDS);
      const last = Math.min(Math.floor((time + 0.2) / BEAT_SECONDS), 149);
      this.lastBeat = Math.max(this.lastBeat, current - 1);
      for (let beat = this.lastBeat + 1; beat <= last; beat += 1) {
        if (beat * BEAT_SECONDS >= time - 0.04) this.scheduleNote(beat, time);
        this.lastBeat = beat;
      }
    }
  }
}
