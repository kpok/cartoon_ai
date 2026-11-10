import {createKalinka} from './robot-kalinka.js';
export const MACARENA_DURATION=32;
export const MACARENA_CUES=['Prawa ręka do przodu','Lewa ręka do przodu','Prawa dłoń do góry','Lewa dłoń do góry','Prawa na ramię','Lewa na ramię','Prawa za głowę','Lewa za głowę','Prawa na biodro','Lewa na biodro','Prawa z tyłu','Lewa z tyłu','Biodra w lewo','Biodra w prawo','Kołysanie','Podskok i obrót'];
const smooth=u=>u*u*(3-2*u);
// Targets are in torso coordinates. Mirroring keeps the original asymmetric head intact.
const gestures=[[.99,.69,1.55,0],[.99,.69,1.55,0],[.99,.69,1.55,Math.PI],[.99,.69,1.55,Math.PI],[-.55,.85,.5,0],[-.55,.85,.5,0],[.98,2.22,-.72,0],[.98,2.22,-.72,0],[.58,.05,.42,0],[.58,.05,.42,0],[.55,.05,-.45,0],[.55,.05,-.45,0]];
function armAt(beat,side){let value=gestures[11];for(let i=side;i<=Math.min(beat,11);i+=2)value=gestures[i];return value;}
export function macarenaPose(time){
 const t=((Number.isFinite(time)?time:0)%32+32)%32,phrase=Math.floor(t/8),local=t%8,beat=Math.floor(local*2),u=smooth(Math.min(1,(local*2-beat)/.65));
 // Left is index zero in the actual GLB, while the dance starts with the right hand.
 const arms=[0,1].map(side=>{const parity=1-side,previous=armAt(beat===0?15:beat-1,parity),next=armAt(beat,parity);return next.map((v,i)=>previous[i]+(v-previous[i])*u);});
 const turn=smooth(Math.max(0,Math.min(1,(local-7.5)/.5)));
 return {time:t,beat,arms,yaw:(phrase+turn)*Math.PI/2,sway:Math.sin(local*Math.PI*4)*.10,jump:beat===15?Math.sin(turn*Math.PI)*.24:0};
}
export function createMacarena(model,THREE){
 const body=createKalinka(model,THREE,{bareHead:true}),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot'),geometries=[];
 // The large head needs longer articulated arms for the hands to reach behind it.
 function lengthen(pivot,next){const direction=next.position.clone().normalize(),e=new THREE.Matrix4().elements,k=2;for(let row=0;row<3;row++)for(let col=0;col<3;col++)e[col*4+row]+=(direction.getComponent(row)*direction.getComponent(col))*k;const stretch=new THREE.Matrix4().fromArray(e);
  for(const child of pivot.children){if(child===next){child.position.applyMatrix4(stretch);continue;}if(!child.isMesh||/Shoulder_|ElbowBearing/.test(child.name))continue;child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix).applyMatrix4(stretch);geometries.push(geometry);child.geometry=geometry;child.position.set(0,0,0);child.quaternion.identity();child.scale.set(1,1,1);}
 }
 const chains=body.limbs.map(l=>{lengthen(l.arm,l.elbow);lengthen(l.elbow,l.wrist);return {...l,upper:l.elbow.position.clone(),lower:l.wrist.position.clone()};});
 function solve(l,target,sign,roll){const origin=l.arm.position,delta=target.clone().sub(origin),a=l.upper.length(),b=l.lower.length(),distance=Math.min(delta.length(),a+b-.0001),direction=delta.normalize();
  const along=(a*a-b*b+distance*distance)/(2*distance),outward=new THREE.Vector3(sign,0,0).addScaledVector(direction,-sign*direction.x).normalize(),elbow=origin.clone().addScaledVector(direction,along).addScaledVector(outward,Math.sqrt(Math.max(0,a*a-along*along)));
  l.arm.quaternion.setFromUnitVectors(l.upper.clone().normalize(),elbow.clone().sub(origin).normalize());
  const forearmDirection=target.clone().sub(elbow).applyQuaternion(l.arm.quaternion.clone().invert()).normalize();l.elbow.quaternion.setFromUnitVectors(l.lower.clone().normalize(),forearmDirection);
  l.wrist.quaternion.copy(l.arm.quaternion).multiply(l.elbow.quaternion).invert().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),sign*roll));
 }
 function update(time){
  body.update(0);const p=macarenaPose(time);body.root.position.set(0,body.root.position.y+p.jump,0);body.root.rotation.set(0,p.yaw,0);torso.rotation.set(0,0,p.sway);head.rotation.set(0,-p.sway*.5,-p.sway*.5);
  chains.forEach((l,i)=>{const [x,y,z,roll]=p.arms[i],sign=i===0?-1:1;solve(l,new THREE.Vector3(sign*x,y,z),sign,roll);});
  model.updateMatrixWorld(true);return p;
 }
 update(0);return {...body,update,dispose(){body.dispose();geometries.forEach(g=>g.dispose());}};
}
