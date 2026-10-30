// Pure, seekable choreography: every pose depends only on the requested story time.
export const DURATION = 160;
export const CHAPTERS = [
 {start:0,end:16,id:'rivals',pl:'Dwie łapki, jedna truskawka',en:'Two paws, one strawberry'},
 {start:16,end:34,id:'tricks',pl:'Bardzo uprzejme podstępy',en:'Very polite tricks'},
 {start:34,end:46,id:'escape',pl:'Truskawka ucieka!',en:'The runaway strawberry'},
 {start:46,end:65,id:'chase',pl:'Kto kogo ominie?',en:'After you! No, after you!'},
 {start:65,end:80,id:'boarding',pl:'Wszyscy do taczki',en:'All aboard the wheelbarrow'},
 {start:80,end:103,id:'ride',pl:'Przygoda na kółku',en:'A little ride'},
 {start:103,end:116,id:'plates',pl:'Za mały talerzyk',en:'A plate too small'},
 {start:116,end:130,id:'pot',pl:'Tak blisko…',en:'So close…'},
 {start:130,end:145,id:'help',pl:'Razem dosięgniemy',en:'A little help'},
 {start:145,end:155,id:'share',pl:'Po połowie smakuje lepiej',en:'Better when shared'},
 {start:155,end:160,id:'apple',pl:'Następna przygoda — razem',en:'The next adventure — together'},
];
export const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
const ease = v => {const x=clamp(v);return x*x*(3-2*x);};
const mix = (a,b,u) => a+(b-a)*ease(u);
export function sampleStory(value) {
 const t=Number.isFinite(value)?clamp(value,0,DURATION):0;
 const chapter=CHAPTERS.find(c=>t<c.end)||CHAPTERS.at(-1),u=(t-chapter.start)/(chapter.end-chapter.start);
 const actor=(x,yaw)=>({x,y:0,z:0,yaw,lean:0,arm:0,otherArm:0,step:0,hop:0,look:0,squash:1,eyes:1,smile:0});
 const cat=actor(-.85,.35),squirrel=actor(.85,-.35);
 const berry={x:0,y:1.23,z:.06,visible:true,rotation:0,halves:0};
 const pot={x:0,y:0,z:0,tilt:0},barrow={x:1.4,y:0,z:-2.35,tilt:0,roll:0};
 const state={t,chapter:chapter.id,progress:clamp(u),cat,squirrel,berry,pot,barrow,plates:true,leaves:0,apple:0,appleX:0,appleZ:.3,cooperation:false};
 const walk=(a,speed=8)=>{a.step=Math.sin(t*speed);a.hop=Math.abs(Math.sin(t*speed))*.045;};
 switch(chapter.id){
 case 'rivals':
  cat.arm=.8+Math.sin(t*2)*.12;squirrel.arm=.8+Math.sin(t*2+1)*.12;
  cat.look=squirrel.look=Math.sin(t*.8)*.3;
  if(t>6){cat.x=-.85+Math.sin(t*1.4)*.1;squirrel.x=.85+Math.sin(t*1.4)*.1;}
  break;
 case 'tricks':{
  const beat=Math.floor((t-16)/4.5),phase=((t-16)%4.5)/4.5,shift=Math.sin((t-16)*Math.PI/4.5)*.4;
  pot.x=berry.x=shift;cat.arm=beat%2?1.3:.6;squirrel.arm=beat%2?.6:1.3;
  cat.yaw=beat%2?mix(.35,-.7,Math.sin(phase*Math.PI)):.45;
  squirrel.yaw=beat%2?-.45:mix(-.35,.7,Math.sin(phase*Math.PI));
  cat.look=squirrel.look=phase<.5?.4:-.3;break;}
 case 'escape':
  pot.tilt=Math.sin(u*Math.PI*4)*.12*(1-u);berry.x=mix(0,1.65,u);berry.z=mix(0,.3,u);
  berry.y=.25+Math.abs(Math.sin(u*Math.PI*3))*.6*(1-u);berry.rotation=t*3;
  cat.x=mix(-.85,-.4,u);squirrel.x=mix(.85,.4,u);cat.lean=.3;squirrel.lean=-.3;cat.arm=squirrel.arm=1.3;
  cat.eyes=squirrel.eyes=1.2;break;
 case 'chase':{
  const q=(t-46)/19,arc=q*Math.PI*3;
  cat.x=Math.sin(arc)*1.25;cat.z=Math.cos(arc)*.6+.5;
  squirrel.x=Math.sin(arc+.65)*1.25;squirrel.z=Math.cos(arc+.65)*.6+.5;
  cat.yaw=Math.cos(arc)*1.1;squirrel.yaw=Math.cos(arc+.65)*1.1;
  walk(cat,11);walk(squirrel,13);cat.arm=squirrel.arm=.6;
  berry.x=mix(1.65,1.3,q);berry.z=mix(.3,-2.35,q);berry.y=.24;berry.rotation=t*4;
  if(q>.6){cat.x=mix(cat.x,-.45,(q-.6)/.4);squirrel.x=mix(squirrel.x,.45,(q-.6)/.4);cat.z=squirrel.z=-.6;cat.step=squirrel.step=Math.sin(t*6)*.35;}
  break;}
 case 'boarding':
  cat.x=mix(-.45,1.05,u);squirrel.x=mix(.45,1.7,u);cat.z=mix(-.6,-2.35,u);squirrel.z=mix(-.6,-2.35,u);
  cat.y=Math.sin(clamp((u-.25)/.75)*Math.PI)*.65+mix(0,.48,u);squirrel.y=Math.sin(clamp((u-.45)/.55)*Math.PI)*.7+mix(0,.48,u);
  cat.arm=squirrel.arm=.8;walk(cat);walk(squirrel);
  berry.x=1.4;berry.y=.78;berry.z=-2.35;break;
 case 'ride':{
  const q=clamp(u/.75),sway=Math.sin(t*5)*.12;
  barrow.x=mix(1.4,0,q);barrow.z=mix(-2.35,.65,q);barrow.roll=q*15;barrow.tilt=u<.75?sway:Math.sin((u-.75)*Math.PI*4)*.18*(1-u)*4;
  cat.x=barrow.x-.32;squirrel.x=barrow.x+.32;cat.z=squirrel.z=barrow.z;
  cat.y=squirrel.y=u<.78?.48:mix(.48,0,(u-.78)/.22);cat.lean=sway;squirrel.lean=-sway;cat.arm=squirrel.arm=u>.55?1.4:.7;
  cat.eyes=squirrel.eyes=u>.55?1.25:1;berry.x=barrow.x+Math.sin(t*4)*.22;berry.z=barrow.z;berry.y=.85;
  state.leaves=clamp((u-.7)/.15);if(u>.85){cat.x=-.6;squirrel.x=.6;berry.x=0;berry.z=.5;berry.y=.25;}
  break;}
 case 'plates':
  cat.x=-.7;squirrel.x=.7;cat.z=squirrel.z=.4;cat.arm=squirrel.arm=1;
  berry.x=Math.sin(u*Math.PI*4)*.25;berry.z=.8;berry.y=.25;
  if(u>.75){berry.x=mix(0,0,(u-.75)*4);berry.z=mix(.8,-.1,(u-.75)*4);berry.y=mix(.25,.45,(u-.75)*4);}
  state.leaves=1;break;
 case 'pot':
  cat.x=-.65;squirrel.x=.5;cat.arm=1.4;cat.lean=.3;
  if(u>.35){squirrel.x=mix(.5,.08,(u-.35)/.4);squirrel.y=mix(0,.85,(u-.35)/.4);squirrel.lean=mix(0,2.5,(u-.35)/.4);squirrel.arm=1.5;cat.look=.35;}
  berry.x=0;berry.z=0;berry.y=.22;state.leaves=1;break;
 case 'help':
  cat.x=-.52;cat.arm=1.7;cat.lean=.2;
  squirrel.x=.12;squirrel.y=u<.55?.65:mix(.65,0,(u-.55)/.45);squirrel.lean=u<.55?2.5:mix(2.5,0,(u-.55)/.45);squirrel.arm=1.4;
  berry.x=u<.55?.08:mix(.08,.45,(u-.55)/.45);berry.y=u<.2?.22:mix(.22,1.15,(u-.2)/.5);berry.z=.35;
  cat.smile=squirrel.smile=clamp((u-.5)*2);state.cooperation=true;state.leaves=1;break;
 case 'share':
  cat.x=-.7;squirrel.x=.7;cat.z=squirrel.z=.6;cat.arm=squirrel.arm=.7;
  berry.x=0;berry.y=.55;berry.z=1.05;berry.halves=clamp(u*4);berry.visible=u<.85;
  cat.smile=squirrel.smile=1;cat.squash=squirrel.squash=.88;state.cooperation=true;state.leaves=1;break;
 case 'apple':
  cat.x=-.7;squirrel.x=.7;cat.z=squirrel.z=.6;cat.smile=squirrel.smile=1;
  berry.visible=false;state.apple=clamp(u*4);state.appleZ=mix(-1.8,1.2,u);state.appleX=Math.sin(u*Math.PI)*.15;
  if(u>.5){cat.x=mix(-.7,-.45,(u-.5)*2);squirrel.x=mix(.7,.45,(u-.5)*2);cat.arm=squirrel.arm=.9;walk(cat,7);walk(squirrel,7);}
  state.cooperation=true;state.leaves=1;break;
 }
 // The pot stays in the original position; props return explicitly after arbitrary seeks.
 if(t>=103){barrow.x=1.65;barrow.z=-1.85;}
 return state;
}

export class StoryClock {
 constructor(){this.time=0;this.playing=false;this.last=null;}
 play(){if(this.time>=DURATION)this.time=0;this.playing=true;this.last=null;}
 pause(){this.playing=false;this.last=null;}
 seek(value){if(Number.isFinite(value))this.time=clamp(value,0,DURATION);this.last=null;if(this.time===DURATION)this.pause();}
 restart(){this.time=0;this.last=null;}
 suspend(){this.last=null;}
 tick(now){if(!Number.isFinite(now))return this.time;if(this.playing&&this.last!==null)this.time=clamp(this.time+Math.max(0,now-this.last)/1000,0,DURATION);this.last=this.playing?now:null;if(this.time===DURATION)this.pause();return this.time;}
}
