import {createKalinka} from './robot-kalinka.js';
export const MACARENA_DURATION=32;
export const MACARENA_CUES=['Prawa ręka do przodu','Lewa ręka do przodu','Prawa dłoń do góry','Lewa dłoń do góry','Prawa na ramię','Lewa na ramię','Prawa za głowę','Lewa za głowę','Prawa na biodro','Lewa na biodro','Prawa z tyłu','Lewa z tyłu','Biodra w lewo','Biodra w prawo','Kołysanie','Podskok i obrót'];
const smooth=u=>u*u*(3-2*u);
// Each eight-second phrase contains sixteen beats and ends with a quarter turn.
const gestures=[[-1.57,0,0,0],[-1.57,0,0,0],[-1.57,0,0,Math.PI],[-1.57,0,0,Math.PI],[-1.1,.6,-1.9,0],[-1.1,.6,-1.9,0],[-2.5,.7,-1.5,0],[-2.5,.7,-1.5,0],[.15,.6,-1.7,0],[.15,.6,-1.7,0],[.6,.3,-1.4,0],[.6,.3,-1.4,0]];
function armAt(beat,side){let value=[0,.15,-.2,0];for(let i=side;i<=Math.min(beat,11);i+=2)value=gestures[i];return value;}
export function macarenaPose(time){
 const t=((Number.isFinite(time)?time:0)%32+32)%32,phrase=Math.floor(t/8),local=t%8,beat=Math.floor(local*2),u=smooth(Math.min(1,(local*2-beat)/.65));
 const arms=[0,1].map(side=>{const previous=armAt(beat-1,side),next=armAt(beat,side);return next.map((v,i)=>previous[i]+(v-previous[i])*u);});
 const turn=smooth(Math.max(0,Math.min(1,(local-7.5)/.5)));
 return {time:t,beat,arms,yaw:(phrase+turn)*Math.PI/2,sway:Math.sin(local*Math.PI*4)*.10,jump:beat===15?Math.sin(turn*Math.PI)*.24:0};
}
export function createMacarena(model,THREE){
 const body=createKalinka(model,THREE,{bareHead:true}),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot');
 function update(time){
  // Reuse the long-legged costume and grounded standing pose, never Kalinka travel.
  body.update(0);const p=macarenaPose(time);body.root.position.set(0,body.root.position.y+p.jump,0);body.root.rotation.set(0,p.yaw,p.sway*.25);torso.rotation.set(0,0,p.sway);head.rotation.set(0,-p.sway*.5,-p.sway*.5);
  body.limbs.forEach(({arm,elbow,wrist},i)=>{const [pitch,spread,bend,roll]=p.arms[i],sign=i===0?-1:1;arm.rotation.set(pitch,0,sign*spread);elbow.rotation.set(bend,0,0);wrist.rotation.set(0,0,sign*roll);});
  model.updateMatrixWorld(true);return p;
 }
 update(0);return {...body,update};
}
