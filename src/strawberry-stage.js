import * as THREE from '../vendor/three.module.js';

// Original low-poly garden and characters, built from reusable primitive geometry.
export function createStrawberryStage(canvas) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));
 renderer.setClearColor(0xc3e8ef);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xc3e8ef,18,36);
 const camera=new THREE.OrthographicCamera(-3,3,5,-5,.1,60);
 camera.position.set(0,5.3,10);camera.lookAt(0,.65,0);
 scene.add(new THREE.HemisphereLight(0xfff5df,0x8db787,2.8));
 const sun=new THREE.DirectionalLight(0xffebcb,3.2);sun.position.set(-3,8,5);sun.castShadow=true;
 sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:20});sun.shadow.normalBias=.035;scene.add(sun);
 const sphere=new THREE.SphereGeometry(1,24,16),box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,24);
 const materials=new Map();
 const mat=(color,roughness=.8)=>{const key=color+':'+roughness;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness}));return materials.get(key);};
 function mesh(parent,geometry,color,position,scale){const m=new THREE.Mesh(geometry,mat(color));m.position.set(...position);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const ball=(p,c,x,y,z,sx,sy=sx,sz=sx)=>mesh(p,sphere,c,[x,y,z],[sx,sy,sz]);
 const block=(p,c,x,y,z,sx,sy,sz)=>mesh(p,box,c,[x,y,z],[sx,sy,sz]);
 const group=(parent)=>{const g=new THREE.Group();parent.add(g);return g;};
 function curve(parent,points,color,radius=.025){const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,radius,6,false);return mesh(parent,geometry,color,[0,0,0],[1,1,1]);}
 const ground=block(scene,0x8fbe83,0,-.2,0,11,.38,11);ground.receiveShadow=true;
 const lawn=ball(scene,0xabcf8c,0,-.1,0,4,.18,3.8);lawn.receiveShadow=true;
 // A quiet garden backdrop frames the action without imported textures.
 for(let i=0;i<15;i++){const x=(i-7)*.55;block(scene,0xf9e3bd,x,.65,-3.7,.43,1.5,.13);ball(scene,0xf9e3bd,x,1.42,-3.7,.215,.18,.065);}
 for(const y of [.35,1.05])block(scene,0xe5cda6,0,y,-3.8,9,.12,.13);
 for(const x of [-3.3,3.3]){ball(scene,0x6ba76a,x,.35,-2.9,.85,.65,.7);ball(scene,0x7fb673,x*.9,.5,-2.7,.55,.7,.6);}
 for(let i=0;i<20;i++){
  const x=(i%2?-1:1)*(2.25+(i%4)*.16),z=-2.7+Math.floor(i/2)*.48;
  mesh(scene,cylinder,0x5a9b65,[x,.22,z],[.025,.4,.025]);
  const color=[0xf1a5b3,0xffdc8c,0xd3b5e6,0xf6c4a6][i%4];
  for(let k=0;k<5;k++)ball(scene,color,x+Math.cos(k*1.257)*.09,.46+Math.sin(k*1.257)*.09,z,.065,.065,.04);
  ball(scene,0xffe7a2,x,.46,z+.025,.045);
 }
 for(const [x,z] of [[-1.6,1.8],[-.4,2.2],[.8,2],[1.7,1.8]])ball(scene,0xd7d0b5,x,-.02,z,.45,.065,.28);
 const table=group(scene);table.position.set(-1.45,0,-2.2);
 block(table,0xdfb282,0,.78,0,1.1,.12,.65);
 for(const x of [-.4,.4])for(const z of [-.2,.2])block(table,0xb68562,x,.35,z,.08,.7,.08);
 const can=group(scene);can.position.set(-1.65,0,-.85);
 mesh(can,cylinder,0x79b9b5,[0,.27,0],[.22,.48,.22]);const spout=mesh(can,cylinder,0x79b9b5,[.27,.35,0],[.065,.44,.065]);spout.rotation.z=-.8;
 curve(can,[[-.13,.45,0],[-.39,.52,0],[-.4,.12,0],[-.15,.12,0]],0x609c9b,.035);
 const pot=group(scene);mesh(pot,new THREE.CylinderGeometry(.3,.23,.5,28,1,true),0xce8b69,[0,.25,0],[1,1,1]);
 mesh(pot,new THREE.TorusGeometry(.3,.055,8,28),0xe1a281,[0,.49,0],[1,1,1]).rotation.x=Math.PI/2;
 mesh(pot,cylinder,0x594331,[0,.08,0],[.23,.025,.23]);
 const plant=group(pot);curve(plant,[[0,.25,0],[0,.9,0],[.1,1.24,0]],0x559663,.025);
 for(const [x,y,angle] of [[-.15,.72,-.65],[.16,.95,.65],[-.1,1.1,-.7]]){const l=ball(plant,0x61a65b,x,y,0,.18,.065,.09);l.rotation.z=angle;}
 const barrow=group(scene);block(barrow,0xe7b668,0,.56,0,.92,.16,.9);
 for(const x of [-.48,.48])block(barrow,0xe2aa5b,x,.72,0,.08,.28,.9);
 for(const z of [-.45,.45])block(barrow,0xe2aa5b,0,.72,z,.95,.28,.08);
 for(const x of [-.3,.3]){block(barrow,0x9c795b,x,.42,-.7,.065,.065,.8);block(barrow,0x9c795b,x,.2,-.25,.065,.4,.065);}
 const wheel=mesh(barrow,new THREE.TorusGeometry(.22,.065,10,24),0x6d7371,[0,.25,.48],[1,1,1]);wheel.rotation.y=Math.PI/2;
 mesh(barrow,cylinder,0xbbae88,[0,.25,.48],[.035,.27,.035]).rotation.z=Math.PI/2;
 const leafPile=group(scene);leafPile.position.set(0,0,.65);
 const pile=[];for(let i=0;i<24;i++){const a=i*2.4,r=.15+((i*7)%11)/13;const l=ball(leafPile,[0xe6b55d,0xdca475,0xe4c577][i%3],Math.cos(a)*r,.08+Math.sin(i*5)**2*.18,Math.sin(a)*r,.22,.045,.13);l.rotation.set(.15*Math.sin(i),a,.15);pile.push(l);}
 const plates=group(scene);for(const x of [-.8,.8])mesh(plates,cylinder,0xfff5dd,[x,.07,.85],[.3,.035,.3]);
 function fruit(parent,color=0xe95b68){const g=group(parent);const b=ball(g,color,0,0,0,.22,.26,.2);b.rotation.z=.12;
  for(let i=0;i<22;i++){const a=i*2.4,y=-.17+(i%6)*.066,r=Math.sqrt(Math.max(0,1-(y/.26)**2));ball(g,0xffe2a0,Math.sin(a)*.222*r,y,Math.cos(a)*.205*r,.012,.018,.009);}
  for(let i=0;i<5;i++){const l=ball(g,0x539963,Math.cos(i*1.257)*.09,.25,Math.sin(i*1.257)*.09,.105,.025,.045);l.rotation.y=-i*1.257;}
  return g;}
 const berry=fruit(scene),halfLeft=fruit(scene),halfRight=fruit(scene);halfLeft.scale.set(.65,.75,.75);halfRight.scale.set(.65,.75,.75);
 const apple=group(scene);ball(apple,0xefad69,-.11,0,0,.29,.32,.29);ball(apple,0xeaa161,.11,0,0,.29,.32,.29);
 mesh(apple,cylinder,0x886345,[0,.34,0],[.025,.17,.025]);const appleLeaf=ball(apple,0x6eaa66,.13,.37,0,.17,.035,.075);appleLeaf.rotation.z=.4;
 const stone=ball(scene,0xc9bda5,0,.13,1.05,.48,.13,.32);
 function character(kind){
  const root=group(scene),body=group(root),squirrel=kind==='squirrel',fur=squirrel?0xbb7954:0xf2bc7b,cream=squirrel?0xf7d6a8:0xffe1b2;
  ball(body,fur,0,.67,0,.34,.43,.28);ball(body,cream,0,.65,.22,.24,.31,.08);
  const head=group(body);head.position.y=1.2;ball(head,fur,0,.06,0,.46,.41,.35);
  for(const x of [-.28,.28]){if(squirrel){ball(head,fur,x,.42,-.02,.13,.24,.1);ball(head,0xeebda0,x,.44,.055,.065,.13,.035);}else{
   const ear=mesh(head,new THREE.ConeGeometry(.2,.35,3),fur,[x,.39,-.02],[1,1,.6]);ear.rotation.y=x<0?-.2:.2;
   const inner=mesh(head,new THREE.ConeGeometry(.12,.22,3),0xf1a6a2,[x,.4,.045],[1,1,.3]);inner.rotation.y=ear.rotation.y;
  }}
  const eyes=[];for(const x of [-.18,.18]){const white=ball(head,0xfffcf1,x,.11,.306,.145,.17,.065);const pupil=ball(head,0x3d4245,x,.105,.365,.075,.105,.035);ball(head,0xffffff,x-.018,.15,.392,.025,.03,.012);eyes.push(white,pupil);ball(head,0xe89d88,x*1.65,-.08,.27,.085,.04,.035);}
  for(const x of [-.1,.1])ball(head,cream,x,-.1,.32,.12,.09,.09);
  ball(head,0x805655,0,-.045,.405,.06,.04,.035);
  const mouth=curve(head,[[-.08,-.18,.37],[0,-.205,.385],[.08,-.18,.37]],0x805655,.012);
  if(!squirrel){for(const side of [-1,1])for(const y of [-.1,-.16])curve(head,[[side*.24,y,.3],[side*.44,y+.02,.31]],0x966d56,.008);}
  const arms=[];for(const side of [-1,1]){const arm=group(body);arm.position.set(side*.32,.88,0);ball(arm,fur,0,-.15,0,.115,.22,.12);ball(arm,cream,0,-.35,.02,.13,.11,.13);arms.push(arm);}
  const legs=[];for(const side of [-1,1]){const leg=group(root);leg.position.set(side*.18,.28,0);ball(leg,fur,0,-.02,0,.135,.2,.14);ball(leg,cream,0,-.19,.08,.17,.1,.22);legs.push(leg);}
  const tail=group(body);tail.position.set(squirrel?.17:.26,.48,-.23);
  if(squirrel){const t=ball(tail,0xaa6c4c,.06,.35,-.25,.3,.65,.31);t.rotation.x=-.35;ball(tail,0xce9564,.02,.65,-.3,.23,.28,.24);}else{curve(tail,[[0,0,0],[.3,.03,-.2],[.45,.25,-.3],[.4,.5,-.25]],fur,.095);}
  return {root,body,head,arms,legs,tail,eyes,mouth};
 }
 const cat=character('cat'),squirrel=character('squirrel');
 function apply(actor,pose,time){
  actor.root.position.set(pose.x,pose.y+pose.hop,pose.z);actor.root.rotation.set(0,pose.yaw,0);
  actor.body.rotation.set(0,0,pose.lean);actor.body.scale.set(1,pose.squash,1);
  actor.head.rotation.set(Math.sin(time*1.4)*.025,pose.look,Math.sin(time*.9)*.035);
  actor.arms[0].rotation.set(-pose.arm,0,-.15-pose.step*.3);actor.arms[1].rotation.set(-Math.max(pose.arm*.8,pose.otherArm),0,.15+pose.step*.3);
  actor.legs[0].rotation.x=pose.step*.55;actor.legs[1].rotation.x=-pose.step*.55;
  actor.tail.rotation.z=Math.sin(time*2)*.1;
  const blink=Math.sin(time*2.3)>.994?.12:1;
  actor.eyes.forEach(e=>{e.scale.y=(e.geometry===sphere?(e.material===mat(0xfffcf1)?.17:.105):.1)*pose.eyes*blink;});
  actor.mouth.scale.y=1+pose.smile*.7;
 }
 function render(state){
  apply(cat,state.cat,state.t);apply(squirrel,state.squirrel,state.t);
  pot.position.set(state.pot.x,state.pot.y,state.pot.z);pot.rotation.z=state.pot.tilt;plant.visible=state.t<34;
  barrow.position.set(state.barrow.x,state.barrow.y,state.barrow.z);barrow.rotation.z=state.barrow.tilt;wheel.rotation.x=state.barrow.roll;
  berry.position.set(state.berry.x,state.berry.y,state.berry.z);berry.rotation.z=state.berry.rotation;berry.visible=state.berry.visible&&state.berry.halves===0;
  for(const [i,half] of [halfLeft,halfRight].entries()){half.visible=state.berry.visible&&state.berry.halves>0;half.position.set((i?1:-1)*state.berry.halves*.6,state.berry.y,state.berry.z);}
  plates.visible=state.plates;leafPile.scale.y=.45+state.leaves*.55;
  apple.visible=state.apple>0;apple.scale.setScalar(state.apple);apple.position.set(state.appleX,.34,state.appleZ);apple.rotation.x=state.progress*5;
  stone.visible=state.t>=145;
  renderer.render(scene,camera);
 }
 function resize(){const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);const vertical=7.8;camera.left=-vertical*width/height/2;camera.right=vertical*width/height/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();}
 function dispose(){scene.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());renderer.dispose();}
 resize();return {render,resize,dispose};
}
