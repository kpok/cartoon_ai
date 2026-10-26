const polishCues = [
  { id: 'morning', start: 10, end: 16, speaker: 'Kotek', text: 'Jaki piękny dzień! Poszukam przyjaciela.' },
  { id: 'hello', start: 24, end: 29, speaker: 'Kotek', text: 'Cześć, motylku! Pobawimy się?' },
  { id: 'reply', start: 31, end: 37, speaker: 'Motyl', text: 'Cześć, kotku! Chodź ze mną do kwiatka.' },
  { id: 'help', start: 62, end: 68, speaker: 'Kotek', text: 'Podam ci łapkę. Delikatnie!' },
  { id: 'thanks', start: 71, end: 77, speaker: 'Motyl', text: 'Dziękuję, kotku! Jesteś dobrym przyjacielem.' },
  { id: 'friends', start: 86, end: 92, speaker: 'Kotek', text: 'Razem jest tak wesoło!' },
  { id: 'goodnight', start: 111, end: 118, speaker: 'Kotek', text: 'Czas odpocząć. Dobranoc, motylku!' },
];
const englishText = [
  'What a lovely day! I will look for a friend.',
  'Hello, little butterfly! Shall we play?',
  'Hello, little kitten! Come to the flower with me.',
  'Here is my paw. Nice and gently!',
  'Thank you, little kitten! You are a kind friend.',
  'Being together is so much fun!',
  'Time to rest. Good night, little butterfly!',
];
export const dialogueCues = Object.freeze(polishCues.map(cue => Object.freeze({
  ...cue, speakerId: cue.speaker === 'Motyl' ? 'butterfly' : 'kitten',
})));
export const englishCues = Object.freeze(dialogueCues.map((cue, index) => Object.freeze({
  ...cue, speaker: cue.speakerId === 'butterfly' ? 'Butterfly' : 'Kitten', text: englishText[index],
})));
export function cueAt(time, locale = 'pl') {
  return (locale === 'en' ? englishCues : dialogueCues).find(cue => time >= cue.start && time < cue.end) || null;
}

// A sparse, original pentatonic melody; no downloaded music or samples.
const melody = [72, 76, 79, null, 81, 79, 76, null, 74, 76, 79, 76, 72, null, 67, null];
export const BEAT_SECONDS = 0.8;
export function noteAt(beat) {
  const midi = melody[((beat % melody.length) + melody.length) % melody.length];
  return midi === null ? null : 440 * 2 ** ((midi - 69) / 12);
}
