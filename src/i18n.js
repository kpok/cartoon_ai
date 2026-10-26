export const normalizeLocale = value => value === 'en' ? 'en' : 'pl';
export const messages = {
  pl: {
    title: 'Kotek i motyl — mała bajka', description: 'Dwuminutowa bajka o kotku i motylu z muzyką i polskimi dialogami. Animacja tworzona z kodu, bez reklam.',
    brand: 'małe historie', home: 'Kotek i motyl — strona główna', badge: 'MUZYKA I DIALOGI · 2 MIN',
    eyebrow: 'MAŁA PRZYGODA, WIELKA PRZYJAŹŃ', heading: 'Kotek i motyl', intro: 'Dwa małe serduszka. Jeden spokojny dzień w ogrodzie.',
    player: 'Odtwarzacz bajki Kotek i motyl', canvas: 'Animacja: kotek poznaje motyla w ogrodzie, pomaga mu i wraca do koszyka.',
    watch: 'Obejrzyj bajkę', start: 'Odtwórz bajkę', quietMinutes: '2 minuty spokoju', goodnight: 'Dobranoc, kotku.', again: 'Obejrzyj jeszcze raz',
    play: 'Odtwórz', pause: 'Pauza', replay: 'Odtwórz ponownie', togglePlay: 'Odtwórz / pauza', restart: 'Od początku', time: 'Czas odtwarzania', seek: 'Pozycja w bajce', of: 'z',
    fullscreen: 'Pełny ekran', exitFullscreen: 'Opuść pełny ekran', noFullscreen: 'Pełny ekran jest niedostępny w tej przeglądarce',
    soundSettings: 'Ustawienia dźwięku', music: 'Muzyka', dialogue: 'Dialogi', volume: 'Głośność muzyki', captions: 'Napisy', language: 'Język bajki / Story language',
    footnote: 'Łagodna melodia, kilka słów i mała przyjaźń. Dźwięk możesz wyłączyć.', footer: 'Narysowane kodem, opowiedziane ruchem.', enjoy: 'Miłego oglądania ♡',
    musicUnavailable: 'Muzyka jest niedostępna w tej przeglądarce.', voiceMissing: 'Brak polskiego głosu. Dialogi są dostępne w napisach.',
    speechFailed: 'Nie udało się odtworzyć głosu. Dialogi są dostępne w napisach.', remoteVoice: 'Polski głos może wymagać połączenia z internetem.',
  },
  en: {
    title: 'Kitten and Butterfly — a little story', description: 'A two-minute kitten story with gentle music and English dialogue. Animated with code, without ads.',
    brand: 'little stories', home: 'Kitten and Butterfly — home', badge: 'MUSIC & DIALOGUE · 2 MIN',
    eyebrow: 'A LITTLE ADVENTURE, A BIG FRIENDSHIP', heading: 'Kitten and Butterfly', intro: 'Two little hearts. One peaceful day in the garden.',
    player: 'Kitten and Butterfly story player', canvas: 'Animation: a kitten meets a butterfly in the garden, helps it and returns to its basket.',
    watch: 'Watch the story', start: 'Play the story', quietMinutes: '2 peaceful minutes', goodnight: 'Good night, little kitten.', again: 'Watch again',
    play: 'Play', pause: 'Pause', replay: 'Play again', togglePlay: 'Play / pause', restart: 'Start over', time: 'Playback time', seek: 'Story position', of: 'of',
    fullscreen: 'Full screen', exitFullscreen: 'Exit full screen', noFullscreen: 'Full screen is unavailable in this browser',
    soundSettings: 'Sound settings', music: 'Music', dialogue: 'Dialogue', volume: 'Music volume', captions: 'Captions', language: 'Story language / Język bajki',
    footnote: 'A gentle melody, a few words and a little friendship. Sound is optional.', footer: 'Drawn with code, told through movement.', enjoy: 'Enjoy the story ♡',
    musicUnavailable: 'Music is unavailable in this browser.', voiceMissing: 'No English voice is available. You can read the dialogue in captions.',
    speechFailed: 'The voice could not be played. You can read the dialogue in captions.', remoteVoice: 'The English voice may need an internet connection.',
  },
};
export const translate = (locale, key) => messages[normalizeLocale(locale)][key];
