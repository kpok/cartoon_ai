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
export function createKalinka(model) {
 const root=model.getObjectByName('DanceRoot'),torso=model.getObjectByName('TorsoPivot'),head=model.getObjectByName('HeadPivot');
 const limbs=['Left','Right'].map(side=>{
  const hip=model.getObjectByName(side+'HipPivot'),knee=model.getObjectByName(side+'KneePivot'),foot=model.getObjectByName(side+'FootPivot');
  for(const [pivot,next] of [[hip,knee],[knee,foot]])for(const child of pivot.children){
   child.position.y*=2.6;
   if(child!==next&&child.isMesh)child.scale.y*=2.6;
  }
  knee.position.set(0,-.858,0);foot.position.set(0,-.832,0);
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
