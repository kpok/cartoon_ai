export const DURATION = 120;
export const chapters = Object.freeze([
  {start:0,end:18,name:'A sleepy morning'}, {start:18,end:38,name:'A new friend'},
  {start:38,end:58,name:'Across the garden'}, {start:58,end:78,name:'A helping paw'},
  {start:78,end:100,name:'Together'}, {start:100,end:120,name:'Home to dream'},
]);
export const clamp = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
export const smooth = v => { const p=clamp(v); return p*p*(3-2*p); };
const lerp=(a,b,p)=>a+(b-a)*smooth(p);
export function sampleStory(seconds){
  const t=clamp(Number.isFinite(seconds)?seconds:0,0,DURATION);
  const chapter=Math.min(5,chapters.findIndex(c=>t<c.end)<0?5:chapters.findIndex(c=>t<c.end));
  let x=235,walk=0,sleep=0,help=0,bx=510,by=340,butterfly=0,heart=0;
  if(t<18){sleep=1-smooth((t-5)/9);x=235;}
  else if(t<38){x=lerp(235,430,(t-18)/20);walk=Math.sin(Math.PI*clamp((t-18)/20));butterfly=smooth((t-18)/4);bx=lerp(900,600,(t-18)/20);by=340+Math.sin((t-18)/20*Math.PI*2)*25;}
  else if(t<58){x=lerp(430,845,(t-38)/20);walk=smooth((t-38)/2)*(1-smooth((t-56)/2));butterfly=1;bx=lerp(600,925,(t-38)/20);by=lerp(340,472,(t-38)/20)+Math.sin((t-38)/20*Math.PI*2)*12;}
  else if(t<78){x=845;butterfly=1;bx=925;by=472;help=Math.sin(Math.PI*clamp((t-61)/14));heart=smooth((t-69)/5);}
  else if(t<100){x=lerp(845,470,(t-78)/22);walk=Math.sin(Math.PI*clamp((t-78)/22));butterfly=1;bx=lerp(925,580,(t-78)/22);by=lerp(472,290,(t-78)/6)+Math.sin((t-78)/22*Math.PI*2)*22;heart=1-smooth((t-78)/6);}
  else{x=lerp(470,235,(t-100)/12);walk=smooth((t-100)/2)*(1-smooth((t-108)/4));sleep=smooth((t-110)/7);butterfly=1-smooth((t-109)/7);bx=lerp(580,1090,(t-100)/17);by=lerp(290,150,(t-100)/17);}
  return {t,chapter,x,walk,sleep,help,bx,by,butterfly,heart,facing:1-2*smooth((t-78)/2),sunset:smooth((t-92)/28)};
}
export class PlaybackClock{
  constructor(duration=DURATION){this.duration=duration;this.time=0;this.playing=false;this.last=null;}
  play(now){if(this.time>=this.duration)this.time=0;this.playing=true;this.last=now;}
  pause(){this.playing=false;this.last=null;}
  seek(time){this.time=clamp(Number.isFinite(time)?time:0,0,this.duration);this.last=null;if(this.time===this.duration)this.pause();}
  tick(now){if(this.playing){if(this.last!==null)this.time=clamp(this.time+Math.max(0,now-this.last)/1000,0,this.duration);this.last=now;if(this.time>=this.duration)this.pause();}return this.time;}
}
