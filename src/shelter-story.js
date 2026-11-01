// Authored five-minute story. Every pose and prop is a pure function of film time.
export const SHELTER_DURATION=300;
export const SHELTER_CHAPTERS=[
 [0,24,'wind','Wiatr zabiera dach','The wind takes the roof'],[24,45,'promise','Zbudujemy domek','A shelter to build'],
 [45,72,'quick','Kotek już buduje','A very quick builder'],[72,96,'collapse','Za szybko!','Too fast!'],
 [96,122,'plan','Wielki plan wiewiórki','A very big plan'],[122,148,'complicated','Za dużo pomysłów','Too many ideas'],
 [148,174,'listen','Dwa dobre pomysły','Two good ideas'],[174,206,'delivery','Taczka pełna współpracy','A wheelbarrow of teamwork'],
 [206,242,'together','Budujemy razem','Building together'],[242,268,'rain','Próba deszczu','The rain test'],
 [268,288,'repair','Liść zamiast parasola','A leaf with a new job'],[288,300,'shower','Prysznic dla kotka','A kitten shower'],
].map(([start,end,id,pl,en])=>Object.freeze({start,end,id,pl,en}));
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=v=>{const u=clamp(v);return u*u*(3-2*u);};
const mix=(a,b,u)=>a+(b-a)*smooth(u);
// Position anchors describe deliberate walks, pauses and turns instead of stretching a loop.
const CAT=[
 [0,-1.5,.8],[6,-1,.65],[14,.35,.7],[21,1.1,.8],[28,.55,.9],[36,-.8,.8],[45,-1.9,-.1],
 [50,-2.4,-.4],[56,-.6,.2],[61,-2.4,-.4],[67,-.55,.2],[72,-.8,.55],[78,-1.4,.9],[86,-.8,.8],
 [96,-1.5,.8],[104,-.9,.8],[114,-1.6,.9],[122,-.8,.65],[132,-1.5,.9],[140,-.6,.9],
 [148,-1.1,.8],[157,-.65,.65],[166,-.8,.7],[174,-1.8,1.2],[181,-2.3,.8],[189,-1,.8],
 [198,-.8,.9],[206,-1.1,.6],[213,-2.1,-.4],[219,-.8,.2],[226,-1,.65],[234,-.7,.4],
 [242,-1.2,.8],[251,-.7,.7],[259,-.45,.75],[268,-1.4,.6],[274,-.8,-.05],[280,-.6,.3],
 [288,.85,-.6],[292,.9,-.6],[294,1.3,.25],[297,1.1,.3],[300,1.1,.3],
];
const SQUIRREL=[
 [0,1.6,.7],[8,.85,.8],[17,1.4,.6],[24,1.05,.8],[34,1.3,.5],[45,1.15,.7],[56,.9,.6],
 [66,1.2,.8],[73,1.5,1],[82,.8,.75],[96,.85,.6],[104,.65,.7],[113,1.2,.65],
 [122,1.8,-.25],[128,.9,-.1],[137,1.4,.5],[146,.85,.9],[154,.6,.7],[163,.7,.7],
 [174,-.5,.8],[181,-1.1,.8],[189,.2,.8],[198,.5,.9],[206,.9,.6],[215,1.4,-.3],
 [223,.65,.2],[231,1.3,-.3],[239,.75,.3],[246,.95,.9],[255,.7,.7],[264,.95,.65],
 [273,.9,.3],[281,.65,.4],[288,1.7,.7],[294,1.8,.9],[300,1.8,.9],
];
function actorPath(frames,t,side){
 const index=frames.findIndex((row,i)=>i>0&&t<=row[0]),b=frames[index<0?frames.length-1:index],a=frames[index<0?frames.length-1:index-1];
 const u=b[0]===a[0]?1:clamp((t-a[0])/(b[0]-a[0])),distance=Math.hypot(b[1]-a[1],b[2]-a[2]);
 const walk=distance>.25?Math.sin(Math.PI*u)**2:0;
 return {x:mix(a[1],b[1],u),z:mix(a[2],b[2],u),y:0,walk,step:Math.sin(t*9)*walk,
  yaw:side*.22+Math.sin(t*.6)*.035,lean:Math.sin(t*9)*walk*.045,arm:.18+walk*.25,otherArm:.18,
  look:side*-.18,headTilt:0,smile:0,worry:0,mouth:0};
}
export function shelterState(value){
 const t=Number.isFinite(value)?clamp(value,0,SHELTER_DURATION):0;
 const chapter=SHELTER_CHAPTERS.find(c=>t<c.end)||SHELTER_CHAPTERS.at(-1),u=(t-chapter.start)/(chapter.end-chapter.start);
 const cat=actorPath(CAT,t,-1),squirrel=actorPath(SQUIRREL,t,1);
 const wind=smooth((t-3)/3)*(1-smooth((t-24)/5))*.8+.12*Math.sin(t*.7)**2;
 const rain=smooth((t-240)/8)*(1-smooth((t-294)/5));
 const quickBuild=clamp((t-46)/24),collapse=clamp((t-73)/9),build=clamp((t-206)/34);
 const butterfly={x:mix(.5,2.25,clamp((t-8)/10)),y:1.3+Math.sin(t*3)*.07,z:-.5,flutter:1};
 if(t>22&&t<242){butterfly.x=2.25+Math.sin(t*.5)*.05;butterfly.y=1.45+Math.sin(t)*.04;butterfly.z=-.7;butterfly.flutter=.25;}
 if(t>=242){const q=clamp((t-244)/8);butterfly.x=mix(2.25,.05,q);butterfly.y=mix(1.45,.68,q);butterfly.z=mix(-.7,-1.3,q);butterfly.flutter=1-q*.85;}
 if(chapter.id==='wind'){cat.look=.28;cat.worry=.5;cat.arm=.8;squirrel.arm=.65;}
 if(chapter.id==='promise'){cat.arm=.85;squirrel.otherArm=.75;cat.smile=.5;}
 if(chapter.id==='quick'){cat.arm=.9;cat.lean+=.12*Math.sin(t*2);squirrel.arm=.4;squirrel.headTilt=-.12;}
 if(chapter.id==='collapse'){cat.worry=.9;squirrel.worry=.65;cat.arm=1.1;squirrel.arm=.95;cat.y=Math.sin(Math.PI*clamp((t-74)/4))*.3;}
 if(chapter.id==='plan'){squirrel.arm=.9;squirrel.smile=.5;cat.headTilt=.18;cat.worry=.2;}
 if(chapter.id==='complicated'){squirrel.arm=1.15;squirrel.worry=smooth((t-130)/7);cat.arm=.8;cat.worry=.5;}
 if(chapter.id==='listen'){cat.smile=smooth((t-156)/6);squirrel.smile=cat.smile;cat.arm=.65;squirrel.otherArm=.65;}
 if(chapter.id==='delivery'){cat.arm=.95;squirrel.arm=.95;cat.smile=squirrel.smile=.65;}
 if(chapter.id==='together'){cat.arm=.95;squirrel.otherArm=1;cat.smile=squirrel.smile=.7;}
 if(chapter.id==='rain'){cat.worry=.4;squirrel.worry=.4;cat.look=squirrel.look=0;}
 if(chapter.id==='repair'){cat.arm=1.65;squirrel.otherArm=1.3;cat.smile=squirrel.smile=.7;}
 if(chapter.id==='shower'){cat.worry=1-smooth((t-294)/2);cat.arm=.9;cat.headTilt=.18;cat.smile=smooth((t-294)/2);squirrel.smile=1;}
 const leafBlown=clamp((t-6)/9),leaf={x:mix(.5,-2.4,leafBlown),y:mix(1.65,.08,leafBlown)+Math.sin(Math.PI*leafBlown)*1.2,z:mix(-.5,.3,leafBlown),rotation:leafBlown*5};
 const delivery=clamp((t-181)/16),parking=smooth((t-197)/9);
 const barrow={x:t<181?mix(-2.7,-1.5,clamp((t-174)/7)):mix(-1.5,.65,delivery)+parking*2.05,
  z:t<181?mix(-1.4,.8,clamp((t-174)/7)):mix(.8,-1.4,parking),yaw:Math.PI/2,roll:delivery*9+parking*7,loaded:t>=176&&t<212};
 const pushing=smooth((t-174)/7)*(1-smooth((t-198)/8));
 cat.x+=((barrow.x-.95)-cat.x)*pushing;cat.z+=(barrow.z-cat.z)*pushing;cat.yaw+=(Math.PI/2-cat.yaw)*pushing;cat.arm+=(-.15)*pushing;
 squirrel.x+=((barrow.x+.4)-squirrel.x)*pushing;squirrel.z+=((barrow.z-.85)-squirrel.z)*pushing;squirrel.yaw+=(Math.PI/2-squirrel.yaw)*pushing;
 cat.step+=Math.sin(t*9)*pushing*.6;squirrel.step+=Math.sin(t*9+.8)*pushing*.6;
 // Keep the rounded heads from intersecting when the friends come closer to talk.
 const dx=squirrel.x-cat.x,dz=squirrel.z-cat.z,distance=Math.hypot(dx,dz);
 if(distance<.98){const gap=(.98-distance)/2,nx=distance?dx/distance:1,nz=distance?dz/distance:0;cat.x-=nx*gap;cat.z-=nz*gap;squirrel.x+=nx*gap;squirrel.z+=nz*gap;}
 const camera={x:0,y:3.4,z:8.5,targetX:0,targetY:.85,targetZ:-.3,span:5.8};
 // Purposeful shot changes: establish, reaction, failed construction, collaboration, payoff.
 if(['promise','listen'].includes(chapter.id)){camera.targetX=0;camera.span=4.4;camera.y=2.8;}
 if(chapter.id==='plan'){camera.targetX=.25;camera.targetY=1.05;camera.span=6;}
 if(chapter.id==='delivery'){camera.targetX=-.2;camera.span=6.8;}
 if(chapter.id==='rain'&&t>252){camera.targetX=.1;camera.targetY=.8;camera.span=4.2;}
 if(chapter.id==='repair'){camera.targetY=1;camera.span=4.8;}
 if(chapter.id==='shower'){camera.targetX=.8;camera.span=4.5;camera.y=2.8;}
 return {t,chapter:chapter.id,progress:clamp(u),cat,squirrel,butterfly,leaf,barrow,camera,wind,rain,
  quickBuild,collapse,quickVisible:t>=45&&t<96,planVisible:t>=98&&t<148,planComplexity:clamp((t-123)/19),
  build,finalVisible:t>=206,gutter:clamp((t-271)/10),leak:t>=254&&t<280,shower:t>=289&&t<295,
  carrying:chapter.id==='quick'||(chapter.id==='together'&&t<232),blueprint:chapter.id==='plan'||chapter.id==='complicated'};
}
export class ShelterClock{
 constructor(){this.time=0;this.playing=false;this.last=null;}
 play(){if(this.time>=SHELTER_DURATION)this.time=0;this.playing=true;this.last=null;}
 pause(){this.playing=false;this.last=null;}
 seek(value){if(Number.isFinite(value))this.time=clamp(value,0,SHELTER_DURATION);this.last=null;if(this.time===SHELTER_DURATION)this.pause();}
 tick(now){if(!Number.isFinite(now))return this.time;if(this.playing&&this.last!==null)this.time=clamp(this.time+Math.max(0,now-this.last)/1000,0,SHELTER_DURATION);this.last=this.playing?now:null;if(this.time===SHELTER_DURATION)this.pause();return this.time;}
}
