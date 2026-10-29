// A separate, deterministic long-leg variant; the source GLB stays unchanged.
export function kalinkaPose(time) {
 const t=((time%24)+24)%24;
 const intro=t<3?(1-Math.cos(Math.PI*t/3))/2:t>21?(1+Math.cos(Math.PI*(t-21)/3))/2:1;
 const beat=(t-3)*2, pulse=Math.max(0,Math.sin(Math.PI*(beat-Math.floor(beat))));
 const active=t>=3&&t<21;
 const height=1.58-1.02*intro+(active?.06*pulse:0);
 const side=((Math.floor(beat)%2)+2)%2;
 return {height, lean:active?.07*Math.sin(beat*Math.PI):0,
  legs:[0,1].map(i=>({y:-height+(active&&side===i?.24*pulse:0),z:active&&side===i?1.12*pulse:0})),
  spread:t>=11&&t<19};
}
export function createKalinka(model, THREE) {
 const root=model.getObjectByName('DanceRoot'),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot');
 // Accessories follow their anatomical pivots, including during kicks.
 const leather=new THREE.MeshStandardMaterial({color:0x241b22,roughness:.72,metalness:.12});
 const fur=new THREE.MeshStandardMaterial({color:0x6b5547,roughness:1});
 const trim=new THREE.MeshStandardMaterial({color:0xc8ad88,roughness:1});
 function piece(parent,name,geometry,material,x,y,z){const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 model.updateMatrixWorld(true);
 const shell=model.getObjectByName('Rounded_head_shell');
 const bounds=new THREE.Box3().setFromObject(shell);
 const top=head.worldToLocal(new THREE.Vector3((bounds.min.x+bounds.max.x)/2,bounds.max.y,(bounds.min.z+bounds.max.z)/2));
 const width=bounds.max.x-bounds.min.x,depth=bounds.max.z-bounds.min.z;
 piece(head,'Kalinka_Ushanka_Crown',new THREE.BoxGeometry(width*1.04,.46,depth*.95),fur,top.x,top.y+.18,top.z);
 piece(head,'Kalinka_Ushanka_Front_Trim',new THREE.BoxGeometry(width*1.06,.25,.18),trim,top.x,top.y+.04,top.z+depth*.49);
 for(const side of [-1,1])piece(head,'Kalinka_Ushanka_Earflap',new THREE.BoxGeometry(.24,.68,depth*.67),fur,top.x+side*width*.52,top.y-.27,top.z);
 const limbs=['Left','Right'].map(side=>{
  const hip=model.getObjectByName(side+'HipPivot'),knee=model.getObjectByName(side+'KneePivot'),foot=model.getObjectByName(side+'FootPivot');
  for(const [pivot,next] of [[hip,knee],[knee,foot]])for(const child of pivot.children){
   child.position.y*=2.6;
   if(child!==next&&child.isMesh)child.scale.y*=2.6;
  }
  knee.position.set(0,-.858,0);foot.position.set(0,-.832,0);
  piece(knee,side+'_Kalinka_Boot_Shaft',new THREE.CylinderGeometry(.20,.22,.61,20),leather,0,-.49,0);
  piece(knee,side+'_Kalinka_Boot_Cuff',new THREE.CylinderGeometry(.23,.23,.10,20),trim,0,-.20,0);
  for(const child of foot.children)if(child.isMesh)child.material=leather;
  return {hip,knee,foot,arm:model.getObjectByName(side+'ArmPivot'),elbow:model.getObjectByName(side+'ElbowPivot')};
 });
 return {update(time){
  const pose=kalinkaPose(time);root.position.set(0,pose.height+.38,0);torso.rotation.z=pose.lean;head.rotation.z=-pose.lean*.6;
  limbs.forEach(({hip,knee,foot,arm,elbow},i)=>{
   const {y,z}=pose.legs[i],a=.858,b=.832,d=Math.min(a+b-.001,Math.hypot(y,z));
   hip.rotation.x=-Math.atan2(z,-y)-Math.acos(Math.max(-1,Math.min(1,(d*d+a*a-b*b)/(2*d*a))));
   knee.rotation.x=Math.PI-Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-d*d)/(2*a*b))));
   foot.rotation.x=-hip.rotation.x-knee.rotation.x;
   arm.rotation.z=(i===0?-1:1)*(pose.spread?1.35:.45);arm.rotation.x=pose.spread?-.12:-.65;
   elbow.rotation.x=pose.spread?-.3:-1.45;
  });
 }};
}
