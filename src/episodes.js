import {clamp} from './story.js';
export const episodes = Object.freeze({
  meadow: {id:'meadow',duration:65,renderer:'2d',
    pl:{title:'Kotek i motyl',intro:'Nowy przyjaciel i mała pomocna łapka. Krótsza, żwawsza przygoda.',canvas:'Kotek poznaje motyla, pomaga mu przy kwiatku i wraca do koszyka.',ending:'Dobranoc, kotku.',tag:'Przyjaźń · 2D',card:'Poznaj motyla i pomóż przyjacielowi.'},
    en:{title:'Kitten and Butterfly',intro:'A new friend and a little helping paw. A shorter, livelier adventure.',canvas:'A kitten meets a butterfly, helps it at a flower and returns to its basket.',ending:'Good night, little kitten.',tag:'Friendship · 2D',card:'Meet a butterfly and help a friend.'}},
  garden: {id:'garden',duration:90,renderer:'3d',
    pl:{title:'Kotek i małe nasionko',intro:'Od nasionka do kwiatka. Odkryj, dlaczego rośliny potrzebują wody, światła i czasu.',canvas:'Trójwymiarowy ogród: kotek sadzi nasionko, podlewa i obserwuje wzrost rośliny przez wiele dni.',ending:'Woda, światło i czas. Rośnij zdrowo!',tag:'Woda, światło i czas · 3D',card:'Posadź nasionko i zobacz, jak rośnie.'},
    en:{title:'Kitten and the Little Seed',intro:'From a seed to a flower. Discover why plants need water, light and time.',canvas:'A three-dimensional garden: a kitten plants a seed, waters it and watches the plant grow over many days.',ending:'Water, light and time. Grow, little flower!',tag:'Water, light and time · 3D',card:'Plant a little seed and watch it grow.'}},
});
export const normalizeStory = value => value === 'garden' ? 'garden' : 'meadow';
export const getEpisode = value => episodes[normalizeStory(value)];
export const formatTime = t => `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;

// Keep the original artwork timeline, but remove most of the long walks and waits.
const pacing = [[0,0],[4,5],[9,18],[13,38],[19,38],[24,58],[39,78],[44,100],[49,100],[54,112],[65,120]];
export function meadowVisualTime(seconds){
  const t=clamp(Number.isFinite(seconds)?seconds:0,0,65);
  const i=pacing.findIndex((p,i)=>i>0&&t<=p[0]);
  if(i<0)return 120;
  const a=pacing[i-1],b=pacing[i];
  return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);
}
const meadowLines=[
  [3,8,'kitten','Piękny dzień! Poszukam przyjaciela.','A lovely day! Let us find a friend.'],
  [9,14,'kitten','Cześć, motylku! Pobawimy się?','Hello, little butterfly! Shall we play?'],
  [15,20,'butterfly','Chodź ze mną do kwiatka!','Come to the flower with me!'],
  [25,30,'kitten','Podam ci łapkę. Delikatnie!','Here is my paw. Nice and gently!'],
  [33,39,'butterfly','Dziękuję! Jesteś dobrym przyjacielem.','Thank you! You are a kind friend.'],
  [44,49,'kitten','Razem jest tak wesoło!','Being together is so much fun!'],
  [56,63,'kitten','Czas odpocząć. Dobranoc, motylku!','Time to rest. Good night, little butterfly!'],
];
const gardenLines=[
  [1,6,'kitten','Małe nasionko! Posadzimy je razem?','A little seed! Shall we plant it?'],
  [8,14,'kitten','Do ziemi, nasionko. Delikatnie przykryjemy.','Into the soil. We will cover it gently.'],
  [16,22,'kitten','Trochę wody. Wystarczy kilka kropelek.','A little water. Just a few drops.'],
  [24,29,'butterfly','Tu jest jasno! Postawmy tu doniczkę.','It is bright here! Put the pot here.'],
  [30,36,'kitten','Jeszcze nie rośnie? Potrzebuje czasu!','Not growing yet? It needs time!'],
  [38,44,'butterfly','Dzień i noc. Sprawdzamy ziemię i czekamy.','Day and night. We check the soil and wait.'],
  [49,55,'kitten','Spójrz! Mały kiełek! Udało się!','Look! A tiny sprout! We did it!'],
  [58,65,'butterfly','Listki korzystają ze światła, by rosnąć.','The leaves use light to help the plant grow.'],
  [69,76,'kitten','Minęło wiele dni. Wyrósł piękny kwiatek!','Many days have passed. A beautiful flower!'],
  [78,84,'butterfly','Co pomaga rosnąć? Woda, światło i czas!','What helps plants grow? Water, light and time!'],
  [85,90,'kitten','Dbajmy o rośliny. Do zobaczenia!','Let us care for plants. See you soon!'],
];
const cueCache=new Map();
export function episodeCues(story='meadow',locale='pl'){
  const id=normalizeStory(story),lang=locale==='en'?'en':'pl',key=`${id}:${lang}`;
  if(!cueCache.has(key))cueCache.set(key,Object.freeze((id==='garden'?gardenLines:meadowLines).map(([start,end,speakerId,pl,en],index)=>Object.freeze({
    id:`${id}-${index}`,start,end,speakerId,speaker:lang==='en'?(speakerId==='kitten'?'Kitten':'Butterfly'):(speakerId==='kitten'?'Kotek':'Motyl'),text:lang==='en'?en:pl,
  }))));
  return cueCache.get(key);
}
export function episodeCueAt(time,locale='pl',story='meadow'){
  return episodeCues(story,locale).find(c=>time>=c.start&&time<c.end)||null;
}
export function gardenNote(state,locale='pl'){
  const en=locale==='en';
  const notes=en?['A little seed','Plant gently','A few drops of water','A bright place','Growing takes time','Days and nights pass','A tiny sprout!','Leaves need light','Many days later','Water · light · time','We helped it grow!']:
    ['Małe nasionko','Sadzimy delikatnie','Kilka kropli wody','Jasne miejsce','Wzrost wymaga czasu','Mijają dni i noce','Mały kiełek!','Listki potrzebują światła','Wiele dni później','Woda · światło · czas','Pomogliśmy mu urosnąć!'];
  const icons=['✦','🌱','💧','☀','◷','☾','🌱','☀','🌼','💧 ☀ ◷','♡'];
  return `${icons[state.phase]} ${notes[state.phase]} · ${en?'Day':'Dzień'} ${state.day}`;
}
