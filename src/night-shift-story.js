export const DURATION = 90;
export const CHAPTERS = [
  {id:'night',start:0,end:12,pl:'Nocna zmiana',en:'The night shift'},
  {id:'line',start:12,end:27,pl:'Linia produkcyjna',en:'The production line'},
  {id:'incident',start:27,end:39,pl:'Nagłe zagrożenie',en:'An emergency'},
  {id:'rescue',start:39,end:57,pl:'Pomoc na miejscu',en:'Help arrives'},
  {id:'flight',start:57,end:73,pl:'Transport do szpitala',en:'Hospital transfer'},
  {id:'investigation',start:73,end:90,pl:'Wyjaśnianie przyczyn',en:'The investigation'},
];
const lines = [
  [1,6,'narrator','Kartoszyno. Piąty listopada, około dwudziestej drugiej czterdzieści.','Kartoszyno. November fifth, at around ten forty in the evening.'],
  [6.5,12,'narrator','W zakładzie przetwórstwa rybnego trwała nocna zmiana.','The night shift was underway at a fish processing plant.'],
  [13,20,'narrator','Według policji, pięćdziesięciotrzyletnia pracownica obsługiwała maszynę do zamykania puszek.','According to police, a fifty-three-year-old worker was operating a can-sealing machine.'],
  [20.5,26.5,'narrator','Wygląd urządzenia w tej animacji jest umowny.','The machine shown in this animation is illustrative.'],
  [28,32,'coworker','Zatrzymajcie linię! Wezwijcie pomoc!','Stop the line! Call for help!'],
  [32.5,38.5,'narrator','Doszło do poważnego wypadku. Jego dokładny przebieg nie jest znany.','A serious accident occurred. Its exact sequence is not known.'],
  [40,46,'narrator','Ratownicy z Krokowej udzielili poszkodowanej pomocy.','Paramedics from Krokowa provided emergency care.'],
  [46.5,50.5,'paramedic','Jesteśmy przy pani. Udzielamy pomocy.','We are here with you. We are helping you.'],
  [51,56.5,'narrator','W relacji opisano poważne obrażenia klatki piersiowej.','The report described serious chest injuries.'],
  [58,64.5,'narrator','Kobietę przekazano załodze Lotniczego Pogotowia Ratunkowego.','The woman was handed over to the air ambulance crew.'],
  [65,72.5,'narrator','Śmigłowiec przetransportował ją do Uniwersyteckiego Centrum Klinicznego w Gdańsku.','A helicopter took her to the University Clinical Centre in Gdańsk.'],
  [74,80,'narrator','Policja wyjaśnia okoliczności. Powiadomiono Państwową Inspekcję Pracy.','Police are investigating. The State Labour Inspectorate was notified.'],
  [81,88.5,'narrator','Dostępny opis nie pozwala ustalić przyczyny wypadku.','The available account does not establish what caused the accident.'],
];
export const localeOf = value => value === 'en' ? 'en' : 'pl';
const speakers = {pl:{narrator:'Narrator',coworker:'Współpracownik',paramedic:'Ratowniczka'},en:{narrator:'Narrator',coworker:'Co-worker',paramedic:'Paramedic'}};
export function cues(locale='pl') {const lang=localeOf(locale);return lines.map(([start,end,speakerId,pl,en],i)=>({id:`night-${i}`,start,end,speakerId,text:lang==='en'?en:pl,speaker:speakers[lang][speakerId],pitch:speakerId==='paramedic'?1.05:.95}));}
const cache={pl:cues('pl'),en:cues('en')};
export const cueAt = (time,locale='pl') => cache[localeOf(locale)].find(c=>time>=c.start&&time<c.end)||null;
export const clamp = (n,lo=0,hi=1) => Math.max(lo,Math.min(hi,n));
export const smooth = n => {const v=clamp(n);return v*v*(3-2*v);};
export function stateAt(value) {const time=clamp(Number.isFinite(value)?value:0,0,DURATION);const chapter=CHAPTERS.find(c=>time<c.end)||CHAPTERS.at(-1);return {time,chapter:chapter.id,progress:clamp((time-chapter.start)/(chapter.end-chapter.start)),lineRunning:time<27};}
export class FilmClock {
  time=0;playing=false;last=null;
  play(){if(this.time>=DURATION)this.time=0;this.playing=true;this.last=null;}
  pause(){this.playing=false;this.last=null;}
  seek(value){this.time=clamp(Number.isFinite(value)?value:0,0,DURATION);this.last=null;}
  tick(now){if(!this.playing)return;if(this.last!==null)this.time=clamp(this.time+Math.max(0,now-this.last)/1000,0,DURATION);this.last=now;if(this.time>=DURATION)this.pause();}
}
export const labels={
 pl:{title:'Nocna zmiana',eyebrow:'ANIMOWANA RELACJA · 3D · 1:30',intro:'Jedna noc. Nagłe zagrożenie. Pomoc, która przychodzi na czas.',home:'← Małe historie',language:'Język filmu',play:'Odtwórz',pause:'Pauza',restart:'Od początku',seek:'Pozycja w filmie',chapters:'Sceny filmu',voice:'Narracja i dialogi',music:'Muzyka',volume:'Głośność muzyki',captions:'Napisy',fullscreen:'Pełny ekran',canvas:'Stylizowana animacja 3D: zakład, linia produkcyjna, ratownicy i transport do szpitala.',notice:'Wizualizacja na podstawie relacji prasowej. Dialogi inscenizowane.',source:'Źródło: artykuł Nadmorski24 przytoczony przez użytkownika. Wygląd zakładu, postacie i maszyna są umowne. Przyczyny wypadku są wyjaśniane.',ready:'Głos zależy od przeglądarki i urządzenia. Napisy są dostępne w obu językach.',failure:'Nie można uruchomić animacji 3D. Spróbuj innej przeglądarki lub wróć do pozostałych historii.',fullMissing:'Pełny ekran jest niedostępny.',ending:'Przyczyny wypadku są wyjaśniane.',date:'KARTOSZYNO · 5 LISTOPADA 2026 · OK. 22:40',offscreen:'Moment wypadku pozostaje poza kadrem.',illustration:'Maszyna poglądowa · mechanizm wypadku nieznany',hospital:'UCK · GDAŃSK',final:'Okoliczności są wyjaśniane',loading:'Przygotowywanie animacji…'},
 en:{title:'The Night Shift',eyebrow:'ANIMATED ACCOUNT · 3D · 1:30',intro:'One night. A sudden emergency. Help when it matters.',home:'← Little stories',language:'Film language',play:'Play',pause:'Pause',restart:'Start over',seek:'Film position',chapters:'Film scenes',voice:'Narration and dialogue',music:'Music',volume:'Music volume',captions:'Captions',fullscreen:'Full screen',canvas:'Stylised 3D animation: a factory, production line, paramedics and hospital transfer.',notice:'Illustration based on a press account. Dialogue is dramatised.',source:'Source: the Nadmorski24 article supplied by the user. The factory, characters and machine are illustrative. The cause remains under investigation.',ready:'Voices depend on your browser and device. Captions are available in both languages.',failure:'3D animation is unavailable. Try another browser or return to the other stories.',fullMissing:'Full screen is unavailable.',ending:'The cause remains under investigation.',date:'KARTOSZYNO · 5 NOVEMBER 2026 · AROUND 22:40',offscreen:'The moment of the accident is kept offscreen.',illustration:'Illustrative machine · accident mechanism unknown',hospital:'UNIVERSITY CLINICAL CENTRE · GDAŃSK',final:'The investigation continues',loading:'Preparing the animation…'}
};
