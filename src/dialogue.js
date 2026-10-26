export const dialogueCues = Object.freeze([
  { id: 'morning', start: 10, end: 16, speaker: 'Kotek', text: 'Jaki piękny dzień! Poszukam przyjaciela.' },
  { id: 'hello', start: 24, end: 29, speaker: 'Kotek', text: 'Cześć, motylku! Pobawimy się?' },
  { id: 'reply', start: 31, end: 37, speaker: 'Motyl', text: 'Cześć, kotku! Chodź ze mną do kwiatka.' },
  { id: 'help', start: 62, end: 68, speaker: 'Kotek', text: 'Podam ci łapkę. Delikatnie!' },
  { id: 'thanks', start: 71, end: 77, speaker: 'Motyl', text: 'Dziękuję, kotku! Jesteś dobrym przyjacielem.' },
  { id: 'friends', start: 86, end: 92, speaker: 'Kotek', text: 'Razem jest tak wesoło!' },
  { id: 'goodnight', start: 111, end: 118, speaker: 'Kotek', text: 'Czas odpocząć. Dobranoc, motylku!' },
]);
export function cueAt(time) {
  return dialogueCues.find(cue => time >= cue.start && time < cue.end) || null;
}

// A sparse, original pentatonic melody; no downloaded music or samples.
const melody = [72, 76, 79, null, 81, 79, 76, null, 74, 76, 79, 76, 72, null, 67, null];
export const BEAT_SECONDS = 0.8;
export function noteAt(beat) {
  const midi = melody[((beat % melody.length) + melody.length) % melody.length];
  return midi === null ? null : 440 * 2 ** ((midi - 69) / 12);
}
