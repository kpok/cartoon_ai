// One authored timeline drives the poses, icons and procedural soundtrack.
export const UPDATE_DURATION=24;
export const UPDATE_FPS=24;
export const UPDATE_PERIOD=.8;
export const UPDATE_CHAPTERS=[
 [0,3,'Pierwsza noga żyje własnym życiem'],[3,7,'Nieudana próba zatrzymania'],
 [7,11,'Synchronizacja drugiej nogi'],[11,17,'Wreszcie razem!'],
 [17,21,'Teraz aktualizuje się ręka'],[21,24,'Jeszcze jedna aktualizacja…'],
];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{const u=clamp(x);return u*u*(3-2*u);};
const window=(t,a,b,fade=.25)=>smooth((t-a)/fade)*smooth((b-t)/fade);
export function updatePose(value){
 const t=Number.isFinite(value)?clamp(value,0,UPDATE_DURATION):0;
 const cycle=(start)=>Math.sin(Math.PI*(((Math.max(0,t-start)/UPDATE_PERIOD)%1)))**2;
 const left=window(t,.25,17)*cycle(.25),right=window(t,7,11)*cycle(7)+window(t,11,17)*cycle(.25);
 const restraint=window(t,3,7),sync=window(t,7,11),relief=window(t,11,17);
 const arm=window(t,17.25,24.5)*Math.sin((t-17.25)*Math.PI*3);
 const finalArm=smooth((t-23.3)/.3)*Math.sin((t-23.3)*Math.PI*3);
 return {time:t,chapter:UPDATE_CHAPTERS.find(([a,b])=>t>=a&&t<b)?.[2]??UPDATE_CHAPTERS.at(-1)[2],
  left,right,restraint,sync,relief,arm,finalArm,
  lookDown:window(t,.5,11)*.28,alarm:smooth((t-21)/.3),
  leftProgress:1,rightProgress:clamp((t-7)/4),handProgress:clamp((t-17)/.4),finalProgress:clamp((t-21)/2.3),
  lean:restraint*.16*Math.sin(t*8),turn:window(t,12,15)*Math.sin((t-12)/3*Math.PI)*.5};
}
const cues=[{time:.25,kind:'update',gain:.34},{time:3.1,kind:'click',gain:.25},
 {time:7,kind:'click',gain:.24},{time:11,kind:'success',gain:.28},
 {time:17.25,kind:'update',gain:.34},{time:21,kind:'click',gain:.24},{time:23.3,kind:'update',gain:.34}];
// Impacts occur at the exact cycle boundaries when the foot returns to rest.
for(const [start,end,side] of [[.25,16.9,'left'],[7,10.9,'right'],[11.45,16.9,'right']]){
 for(let time=start+UPDATE_PERIOD;time<end;time+=UPDATE_PERIOD)cues.push({time:Number(time.toFixed(6)),kind:'tap',gain:side==='left'?.25:.20});
}
export const UPDATE_CUES=Object.freeze(cues.sort((a,b)=>a.time-b.time).map(Object.freeze));
