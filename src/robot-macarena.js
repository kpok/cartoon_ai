import {createKalinka} from './robot-kalinka.js';
import {decorateMacarena} from './macarena-costume.js';
export const MACARENA_DURATION=32;
export const MACARENA_CUES=['Prawa ręka do przodu','Lewa ręka do przodu','Prawa dłoń do góry','Lewa dłoń do góry','Prawa na ramię','Lewa na ramię','Prawa za głowę','Lewa za głowę','Prawa na biodro','Lewa na biodro','Prawa z tyłu','Lewa z tyłu','Biodra w lewo','Biodra w prawo','Kołysanie','Podskok i obrót'];
const smooth=u=>u*u*(3-2*u);
// Targets are in torso coordinates. Mirroring keeps the original asymmetric head intact.
const gestures=[[.99,.69,1.75,0],[.99,.69,1.75,0],[.99,.69,1.75,Math.PI],[.99,.69,1.75,Math.PI],[-.55,.85,.5,0],[-.55,.85,.5,0],[.98,2.22,-.72,0],[.98,2.22,-.72,0],[.58,.05,.42,0],[.58,.05,.42,0],[.55,.05,-.45,0],[.55,.05,-.45,0]];
function armAt(beat,side){let value=gestures[11];for(let i=side;i<=Math.min(beat,11);i+=2)value=gestures[i];return value;}
export function macarenaPose(time){
 const t=((Number.isFinite(time)?time:0)%32+32)%32,phrase=Math.floor(t/8),local=t%8,beat=Math.floor(local*2),u=smooth(Math.min(1,(local*2-beat)/.65));
 // Left is index zero in the actual GLB, while the dance starts with the right hand.
 const arms=[0,1].map(side=>{const parity=1-side,previous=armAt(beat===0?15:beat-1,parity),next=armAt(beat,parity);return next.map((v,i)=>previous[i]+(v-previous[i])*u);});
 const turn=smooth(Math.max(0,Math.min(1,(local-7.5)/.5)));
 const rhythm=local*Math.PI*2,hipX=.22*Math.sin(rhythm),hipZ=.06*(1-Math.cos(rhythm)),bounce=.15*(.5-.5*Math.cos(rhythm*2));
 return {time:t,beat,arms,yaw:(phrase+turn)*Math.PI/2+.08*Math.sin(rhythm),footYaw:(phrase+turn)*Math.PI/2,sway:Math.sin(rhythm)*.12,hipX,hipZ,height:1.79-bounce,jump:beat===15?Math.sin(turn*Math.PI)*.24:0};
}
export function createMacarena(model,THREE){
 const body=createKalinka(model,THREE,{bareHead:true}),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot'),geometries=[];
 // The large head needs longer articulated arms for the hands to reach behind it.
 function lengthen(pivot,next){const direction=next.position.clone().normalize(),e=new THREE.Matrix4().elements,k=2;for(let row=0;row<3;row++)for(let col=0;col<3;col++)e[col*4+row]+=(direction.getComponent(row)*direction.getComponent(col))*k;const stretch=new THREE.Matrix4().fromArray(e);
  for(const child of pivot.children){if(child===next){child.position.applyMatrix4(stretch);continue;}if(!child.isMesh||!/^(Left|Right)(UpperArm|Forearm)$/.test(child.name))continue;child.updateMatrix();const geometry=child.geometry.clone().applyMatrix4(child.matrix).applyMatrix4(stretch);geometries.push(geometry);child.geometry=geometry;child.position.set(0,0,0);child.quaternion.identity();child.scale.set(1,1,1);}
 }
 for(const limb of body.limbs)limb.arm.traverse(o=>{if(/Slime|Glossy_candy_drip|Rounded_drip_tip/.test(o.name))o.visible=false;});
 const chains=body.limbs.map(l=>{lengthen(l.arm,l.elbow);lengthen(l.elbow,l.wrist);return {...l,upper:l.elbow.position.clone(),lower:l.wrist.position.clone()};});
 function solve(l,target,sign,roll){const origin=l.arm.position,delta=target.clone().sub(origin),a=l.upper.length(),b=l.lower.length(),distance=Math.min(delta.length(),a+b-.0001),direction=delta.normalize();
  const along=(a*a-b*b+distance*distance)/(2*distance),outward=new THREE.Vector3(sign,0,0).addScaledVector(direction,-sign*direction.x).normalize(),elbow=origin.clone().addScaledVector(direction,along).addScaledVector(outward,Math.sqrt(Math.max(0,a*a-along*along)));
  l.arm.quaternion.setFromUnitVectors(l.upper.clone().normalize(),elbow.clone().sub(origin).normalize());
  const forearmDirection=target.clone().sub(elbow).applyQuaternion(l.arm.quaternion.clone().invert()).normalize();l.elbow.quaternion.setFromUnitVectors(l.lower.clone().normalize(),forearmDirection);
  l.wrist.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),sign*roll);
 }
 const costume=decorateMacarena(model,THREE);
 const axisX=new THREE.Vector3(1,0,0),axisY=new THREE.Vector3(0,1,0),axisZ=new THREE.Vector3(0,0,1);
 function update(time){
  const p=macarenaPose(time),c=Math.cos(p.footYaw),s=Math.sin(p.footYaw);body.root.position.set(p.hipX*c+p.hipZ*s,p.height+p.jump,-p.hipX*s+p.hipZ*c);body.root.rotation.set(0,p.yaw,0);torso.rotation.set(0,-p.sway*.5,-p.sway*.45);head.rotation.set(0,-p.sway*.5,p.sway*.2);
  body.limbs.forEach(({hip,knee,foot},i)=>{const side=i===0?-1:1,world=new THREE.Vector3(side*.39*c-.04*s,.24+p.jump,-side*.39*s-.04*c),local=world.clone().sub(body.root.position).applyAxisAngle(axisY,-p.yaw).sub(hip.position);
   const a=.858,b=.832,d=Math.min(Math.hypot(local.x,local.y,local.z),a+b-.001),radial=Math.hypot(local.x,local.y),abduction=Math.atan2(local.x,-local.y),pitch=-Math.atan2(local.z,radial)-Math.acos(Math.max(-1,Math.min(1,(d*d+a*a-b*b)/(2*d*a))));
   hip.quaternion.setFromAxisAngle(axisZ,abduction).multiply(new THREE.Quaternion().setFromAxisAngle(axisX,pitch));knee.rotation.set(Math.PI-Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-d*d)/(2*a*b)))),0,0);foot.quaternion.copy(hip.quaternion).multiply(knee.quaternion).invert().multiply(new THREE.Quaternion().setFromAxisAngle(axisY,p.footYaw-p.yaw));
  });
  chains.forEach((l,i)=>{const [x,y,z,roll]=p.arms[i],sign=i===0?-1:1;solve(l,new THREE.Vector3(sign*x,y,z),sign,roll);});
  model.updateMatrixWorld(true);
  // Costume may replace shoes after the Kalinka initializer; use current visible geometry.
  let minimum=Infinity;for(const limb of body.limbs)limb.hip.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.attributes.position,e=mesh.matrixWorld.elements;for(let j=0;j<positions.count;j++)minimum=Math.min(minimum,e[1]*positions.getX(j)+e[5]*positions.getY(j)+e[9]*positions.getZ(j)+e[13]);});
  if(minimum<0){body.root.position.y-=minimum;model.updateMatrixWorld(true);}
  return p;
 }
 update(0);return {...body,update,dispose(){costume.dispose();body.dispose();geometries.forEach(g=>g.dispose());}};
}
