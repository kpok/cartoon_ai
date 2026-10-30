import {decorateKalinkaSlime} from './kalinka-costume.js';
// Deterministic travelling dance. One scene unit is one nominal metre on the square.
export const KALINKA_DURATION=24;
export const KALINKA_SOLE=.24;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>{const u=clamp(v);return u*u*(3-2*u);};
const blend=(a,b,u)=>a+(b-a)*smooth(u);
const wrap=t=>((t%24)+24)%24;
const window=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
// Seeded once, never randomized during rendering or seeking.
let seed=48271;
const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
export const KALINKA_ROUTE=Array.from({length:8},()=>({x:(random()*2-1)*1.2,z:(random()*2-1)*1.2}));
export function kalinkaTravel(time){const t=wrap(time),i=Math.floor(t/3),u=(t%3)/3,a=KALINKA_ROUTE[i],b=KALINKA_ROUTE[(i+1)%8];return {x:blend(a.x,b.x,u),z:blend(a.z,b.z,u),yaw:.26*Math.sin(t*Math.PI/12)+.08*Math.sin(t*Math.PI/4)};}
export function kalinkaPose(time){
 const t=wrap(Number.isFinite(time)?time:0),root=kalinkaTravel(t),beat=t*2,beatPhase=beat-Math.floor(beat);
 const squat=window(t,2.5,3.2,9.2,10)+window(t,12.5,13.2,17.2,18);
 let flight=0,split=0;
 for(const start of [10,18]){const u=(t-start-.4)/1.2;if(u>=0&&u<=1){flight=Math.sin(Math.PI*u)**2;split=window(u,0,.35,.65,1);}}
 const hop=(1-clamp(squat))*.18*Math.sin(Math.PI*beatPhase)**2;
 const jump=flight*1.05+hop*(1-flight);
 const height=1.46-.60*clamp(squat)+.055*Math.sin(Math.PI*beatPhase)**2;
 const legs=[0,1].map(i=>{
  const side=i===0?-1:1,cycle=t+i*.5,start=Math.floor(cycle)-i*.5,phase=cycle-Math.floor(cycle),swing=clamp((phase-.5)*2);
  const a=kalinkaTravel(start),b=kalinkaTravel(start+1),u=smooth(swing);
  const ax=a.x+side*.33*Math.cos(a.yaw)-.04*Math.sin(a.yaw),az=a.z-side*.33*Math.sin(a.yaw)-.04*Math.cos(a.yaw);
  const bx=b.x+side*.33*Math.cos(b.yaw)-.04*Math.sin(b.yaw),bz=b.z-side*.33*Math.sin(b.yaw)-.04*Math.cos(b.yaw);
  const lift=Math.sin(Math.PI*swing),kick=clamp(squat)*lift*lift;
  let x=ax+(bx-ax)*u+Math.sin(root.yaw)*kick*.98,z=az+(bz-az)*u+Math.cos(root.yaw)*kick*.98;
  let y=KALINKA_SOLE+jump+lift*(.22+.22*clamp(squat));
  // At the jump apex both legs open sideways, with soles level in world space.
  const sx=root.x+side*(.33+1.63*split)*Math.cos(root.yaw),sz=root.z-side*(.33+1.63*split)*Math.sin(root.yaw)-.04;
  x=blend(x,sx,flight);z=blend(z,sz,flight);y=blend(y,KALINKA_SOLE+jump+1.26*split,flight);
  const dx=x-root.x,dz=z-root.z;
  return {x:Math.cos(root.yaw)*dx-Math.sin(root.yaw)*dz-side*.33,
   y:y-(height+KALINKA_SOLE+jump),z:Math.sin(root.yaw)*dx+Math.cos(root.yaw)*dz+.04,
   world:{x,y,z},yaw:blend(a.yaw,b.yaw,swing),stance:phase<=.5&&jump<.025&&flight<.01};
 });
 return {time:t,root,height,jump,flight,split,squat:clamp(squat),legs,lean:.035*Math.sin(t*Math.PI*2),
  armSpread:.65+.35*Math.sin(t*Math.PI*2)+1.15*flight,armSwing:.45*Math.sin(t*Math.PI*2),
  mode:flight>.15?'split':squat>.5?'kicks':'hops'};
}

export function createKalinka(model,THREE){
 const root=model.getObjectByName('DanceRoot'),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot');
 const leather=new THREE.MeshStandardMaterial({color:0x302c32,roughness:.48,metalness:.08});
 const felt=new THREE.MeshStandardMaterial({color:0x394654,roughness:.96});
 const fur=new THREE.MeshStandardMaterial({color:0xcbbca5,roughness:1});
 const stitch=new THREE.MeshStandardMaterial({color:0x9b8977,roughness:.95});
 const geometries=new Set();
 function piece(parent,name,geometry,material,x,y,z){geometries.add(geometry);const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 // Accessories replace the protruding ornaments only in this in-memory variant.
 for(const child of head.children)if(/^(Antenna_|Spoon_|Candy_crown_|Candy_pearl|Suspended_candy_droplet002)/.test(child.name))child.visible=false;
 const shell=model.getObjectByName('Rounded_head_shell');shell.geometry.computeBoundingBox();
 const bounds=shell.geometry.boundingBox.clone().applyMatrix4(shell.matrix);const top=bounds.max.y,width=bounds.max.x-bounds.min.x,depth=bounds.max.z-bounds.min.z;
 const crown=piece(head,'Kalinka_Ushanka_Crown',new THREE.SphereGeometry(1,32,20,0,Math.PI*2,0,Math.PI*.56),felt,0,top-.12,-.04);crown.scale.set(width*.51,.56,depth*.55);
 const band=piece(head,'Kalinka_Ushanka_Front_Trim',new THREE.SphereGeometry(1,28,12),fur,0,top-.11,depth*.43);band.scale.set(width*.46,.19,.16);
 for(const side of [-1,1]){
  const flap=piece(head,side<0?'Kalinka_Ushanka_Left_Flap':'Kalinka_Ushanka_Right_Flap',new THREE.CapsuleGeometry(.2,.50,6,14),felt,side*width*.48,top-.46,-.04);flap.scale.set(.8,1,2.1);flap.rotation.z=side*.09;
  const lining=piece(flap,'Kalinka_Ushanka_Soft_Lining',new THREE.CapsuleGeometry(.15,.42,6,12),fur,0,-.025,.12);lining.scale.set(.9,1,1);
  for(let j=0;j<7;j++){const tuft=piece(flap,'Kalinka_Fur_Tuft',new THREE.SphereGeometry(.037,6,5),fur,Math.sin(j*2.4)*.1,-.3+j*.09,.21);tuft.scale.y=.7;}
 }
 const seamPoints=[];for(let j=0;j<=20;j++){const a=j*Math.PI/20;seamPoints.push(new THREE.Vector3(width*.50*Math.cos(a),top-.12+.55*Math.sin(a),-.04));}
 piece(head,'Kalinka_Crown_Stitching',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints),24,.012,5,false),stitch,0,0,0);
 const limbs=['Left','Right'].map(side=>{
  const hip=model.getObjectByName(side+'HipPivot'),knee=model.getObjectByName(side+'KneePivot'),foot=model.getObjectByName(side+'FootPivot');
  for(const [pivot,next] of [[hip,knee],[knee,foot]])for(const child of pivot.children){child.position.y*=2.6;if(child!==next&&child.isMesh)child.scale.y*=2.6;}
  knee.position.set(0,-.858,0);foot.position.set(0,-.832,0);
  for(const child of knee.children)if(child.isMesh&&/short_shin|shin_candy_inset/.test(child.name))child.visible=false;
  piece(knee,side+'_Kalinka_Boot_Shaft',new THREE.CylinderGeometry(.265,.25,.74,28),leather,0,-.43,0);
  piece(knee,side+'_Kalinka_Boot_Seam',new THREE.CylinderGeometry(.012,.012,.61,8),stitch,.25,-.43,0);
  piece(knee,side+'_Kalinka_Boot_Cuff',new THREE.TorusGeometry(.267,.045,8,28),stitch,0,-.08,0).rotation.x=Math.PI/2;
  piece(knee,side+'_Kalinka_Boot_Buckle',new THREE.BoxGeometry(.12,.085,.045),stitch,0,-.30,.265);
  for(const child of foot.children)if(child.isMesh)child.material=leather;
  return {hip,knee,foot,arm:model.getObjectByName(side+'ArmPivot'),elbow:model.getObjectByName(side+'ElbowPivot'),wrist:model.getObjectByName(side+'WristPivot')};
 });
 model.updateMatrixWorld(true);
 const slime=decorateKalinkaSlime(model,THREE);
 const qz=new THREE.Quaternion(),qx=new THREE.Quaternion(),axisX=new THREE.Vector3(1,0,0),axisY=new THREE.Vector3(0,1,0),axisZ=new THREE.Vector3(0,0,1),desired=new THREE.Quaternion();
 const bootMeshes=[];for(const limb of limbs)limb.hip.traverse(o=>{if(o.isMesh)bootMeshes.push(o);});
 const box=new THREE.Box3();
 function update(time){
  const pose=kalinkaPose(time);root.position.set(pose.root.x,pose.height+KALINKA_SOLE+pose.jump+.1,pose.root.z);root.rotation.set(0,pose.root.yaw,0);
  for(const side of ['Left','Right']){const lid=model.getObjectByName(side+'LidPivot');if(lid)lid.scale.y=.015+.95*Math.max(0,1-Math.abs((pose.time%4.8)-4.2)/.12);}
  torso.rotation.set(.025*Math.sin(pose.time*Math.PI*2),0,pose.lean);head.rotation.set(0,.025*Math.sin(pose.time*Math.PI),-pose.lean*.6);
  limbs.forEach(({hip,knee,foot,arm,elbow,wrist},i)=>{
   const {x,y,z}=pose.legs[i],a=.858,b=.832,d=clamp(Math.hypot(x,y,z),.15,a+b-.001),radial=Math.hypot(x,y);
   const abduction=Math.atan2(x,-y),pitch=-Math.atan2(z,radial)-Math.acos(clamp((d*d+a*a-b*b)/(2*d*a),-1,1));
   qz.setFromAxisAngle(axisZ,abduction);qx.setFromAxisAngle(axisX,pitch);hip.quaternion.copy(qz).multiply(qx);
   knee.rotation.set(Math.PI-Math.acos(clamp((a*a+b*b-d*d)/(2*a*b),-1,1)),0,0);
   desired.setFromAxisAngle(axisY,pose.legs[i].yaw-pose.root.yaw);
   foot.quaternion.copy(hip.quaternion).multiply(knee.quaternion).invert().multiply(desired);
   const side=i===0?-1:1;arm.rotation.set(-.45+side*pose.armSwing,0,side*(pose.armSpread));elbow.rotation.set(-.55-.3*(1-pose.flight),0,0);wrist.rotation.set(.1,0,side*.15*Math.sin(pose.time*Math.PI*2));
  });
  // The targets use the sole offset, but validate real geometry as the final floor guard.
  model.updateMatrixWorld(true);let min=Infinity;for(const mesh of bootMeshes){box.setFromObject(mesh);min=Math.min(min,box.min.y);}
  if(min<0){root.position.y-=min;model.updateMatrixWorld(true);}
  return pose;
 }
 update(0);
 return {update,root,limbs,slime,dispose(){slime.dispose();geometries.forEach(g=>g.dispose());for(const m of [leather,felt,fur,stitch])m.dispose();}};
}
