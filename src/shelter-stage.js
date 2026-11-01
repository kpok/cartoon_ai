import * as THREE from '../vendor/three.module.js';
import {clamp,smooth} from './shelter-story.js';

// The established kitten/squirrel primitive recipes, adapted into an isolated film set.
export function createShelterStage(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 if(renderer.getContext().isContextLost()){renderer.dispose();throw new Error('WebGL unavailable');}
 renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,70);
 const sky=new THREE.Color(0xc5e8ef),storm=new THREE.Color(0xa5b9c8);scene.background=sky.clone();scene.fog=new THREE.Fog(sky,16,35);
 scene.add(new THREE.HemisphereLight(0xfff5df,0x749168,2));
 const sun=new THREE.DirectionalLight(0xffebca,2.3);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-5,right:5,top:6,bottom:-4,near:.1,far:25});sun.shadow.normalBias=.03;scene.add(sun);
 const geometries=new Set(),materials=new Map();
 const own=g=>{geometries.add(g);return g;};
 const sphere=own(new THREE.SphereGeometry(1,20,14)),box=own(new THREE.BoxGeometry(1,1,1)),cylinder=own(new THREE.CylinderGeometry(1,1,1,20));
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.82}));return materials.get(color);};
 function mesh(parent,geo,color,pos,scale=[1,1,1]){const m=new THREE.Mesh(geo,mat(color));m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const ball=(p,c,x,y,z,sx,sy=sx,sz=sx)=>mesh(p,sphere,c,[x,y,z],[sx,sy,sz]);
 const block=(p,c,x,y,z,sx,sy,sz)=>mesh(p,box,c,[x,y,z],[sx,sy,sz]);
 const group=parent=>{const g=new THREE.Group();parent.add(g);return g;};
 function curve(parent,points,color,r=.02){return mesh(parent,own(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,r,6,false)),color,[0,0,0]);}
 const ground=block(scene,0x97c58d,0,-.14,0,80,.25,80);ground.receiveShadow=true;
 for(let i=0;i<19;i++){const x=(i-9)*.46;block(scene,0xf3dfbd,x,.5,-3.25,.37,1.15,.10);ball(scene,0xf3dfbd,x,1.08,-3.25,.185,.14,.05);}
 for(const y of [.25,.8])block(scene,0xd9bd92,0,y,-3.35,9,.1,.12);
 for(const x of [-3.8,3.8]){ball(scene,0x699d65,x,.35,-2.7,.9,.65,.7);ball(scene,0x79ae6e,x*.93,.55,-2.7,.6,.6,.6);}
 const flowers=[];for(let i=0;i<12;i++){const f=group(scene);f.position.set((i%2?-1:1)*(2.7+(i%3)*.15),0,-1.8+Math.floor(i/2)*.65);mesh(f,cylinder,0x5b9761,[0,.2,0],[.018,.4,.018]);for(let j=0;j<5;j++)ball(f,[0xf0aac5,0xffda80,0xd6b5e7][i%3],Math.sin(j*1.257)*.08,.43+Math.cos(j*1.257)*.08,0,.065,.06,.03);ball(f,0xffe7a0,0,.43,.02,.045);flowers.push(f);}
 const cloud=group(scene);cloud.position.set(1.9,2.0,-2.3);for(let i=0;i<5;i++)ball(cloud,0xd4dce3,(i-2)*.24,Math.sin(i)*.12,0,.32,.20,.22);
 const branch=group(scene);branch.position.set(2.25,0,-.7);block(branch,0xa17a54,0,.65,0,.08,1.3,.08);block(branch,0xa17a54,-.15,1.25,0,.5,.06,.08);
 const leaf=ball(scene,0x67a66d,0,0,0,.43,.035,.23);
 const logs=group(scene);logs.position.set(-2.2,0,-.45);for(let i=0;i<7;i++){const p=block(logs,0xdba56b,0,.07+i*.065,0,.85,.06,.14);p.rotation.y=i%2?.12:-.1;}
 function actor(kind){
  const squirrel=kind==='squirrel',root=group(scene),body=group(root),fur=squirrel?0xbb7954:0xf2bc7b,cream=squirrel?0xf7d6a8:0xffe1b2;
  ball(body,fur,0,.67,0,.34,.43,.28);ball(body,cream,0,.65,.22,.24,.31,.08);
  const head=group(body);head.position.y=1.2;ball(head,fur,0,.06,0,.46,.41,.35);
  for(const x of [-.28,.28]){if(squirrel){ball(head,fur,x,.42,-.02,.13,.24,.1);ball(head,0xeebda0,x,.44,.055,.065,.13,.035);}else{
   const e=mesh(head,own(new THREE.ConeGeometry(.2,.35,3)),fur,[x,.39,-.02],[1,1,.6]);e.rotation.y=x<0?-.2:.2;
   const inner=mesh(head,own(new THREE.ConeGeometry(.12,.22,3)),0xf1a6a2,[x,.4,.045],[1,1,.3]);inner.rotation.y=e.rotation.y;
  }}
  const eyes=[],brows=[];
  for(const x of [-.18,.18]){
   const eye=group(head);eye.position.set(x,.11,.306);ball(eye,0xfffcf1,0,0,0,.145,.17,.065);
   const pupil=ball(eye,0x3d4245,0,-.005,.059,.075,.105,.035);ball(pupil,0xffffff,-.24,.4,.8,.3,.3,.3);eyes.push({eye,pupil});
   const brow=block(head,0x946744,x,.32,.31,.19,.025,.035);brows.push(brow);ball(head,0xe89d88,x*1.65,-.08,.27,.085,.04,.035);
  }
  for(const x of [-.1,.1])ball(head,cream,x,-.1,.32,.12,.09,.09);ball(head,0x805655,0,-.045,.405,.06,.04,.035);
  const mouth=curve(head,[[-.08,-.18,.37],[0,-.205,.385],[.08,-.18,.37]],0x805655,.012);
  const open=ball(head,0x805655,0,-.19,.385,.065,.04,.018);open.visible=false;
  if(!squirrel)for(const side of [-1,1])for(const y of [-.1,-.16])curve(head,[[side*.24,y,.3],[side*.44,y+.02,.31]],0x966d56,.008);
  const arms=[],hands=[],legs=[];for(const side of [-1,1]){const a=group(body);a.position.set(side*.32,.88,0);ball(a,fur,0,-.15,0,.115,.22,.12);ball(a,cream,0,-.35,.02,.13,.11,.13);const hand=group(a);hand.position.set(0,-.35,.10);arms.push(a);hands.push(hand);
   const leg=group(root);leg.position.set(side*.18,.28,0);ball(leg,fur,0,-.02,0,.135,.2,.14);ball(leg,cream,0,-.19,.08,.17,.1,.22);legs.push(leg);}
  const tail=group(body);tail.position.set(squirrel?.17:.26,.48,-.23);
  if(squirrel){const tuft=ball(tail,0xaa6c4c,.06,.35,-.25,.3,.65,.31);tuft.rotation.x=-.35;ball(tail,0xce9564,.02,.65,-.3,.23,.28,.24);}else curve(tail,[[0,0,0],[.3,.03,-.2],[.45,.25,-.3],[.4,.5,-.25]],fur,.095);
  return {root,body,head,eyes,brows,arms,hands,legs,tail,mouth,open};
 }
 const cat=actor('cat'),squirrel=actor('squirrel');
 const carried=block(cat.hands[0],0xe1ad76,0,0,.08,.8,.09,.13);carried.rotation.z=.2;
 const sketch=group(squirrel.hands[1]);block(sketch,0xffedca,0,0,.03,.6,.45,.025);
 for(let i=0;i<3;i++){const line=block(sketch,0x7aa0ab,0,-.12+i*.10,.05,.42,.012,.012);line.rotation.z=i===2?.18:0;}
 const butterfly=group(scene);const leftWing=group(butterfly),rightWing=group(butterfly);
 for(const [g,sign] of [[leftWing,-1],[rightWing,1]]){ball(g,0xa6bfe9,sign*.15,.08,0,.18,.21,.035);ball(g,0xe9a8cc,sign*.12,-.10,0,.14,.13,.035);ball(g,0xffe6ad,sign*.16,.09,.035,.06,.07,.015);}
 ball(butterfly,0x6b677f,0,0,.025,.035,.18,.035);ball(butterfly,0x6b677f,0,.18,.025,.065);
 for(const x of [-.024,.024])ball(butterfly,0xffffff,x,.19,.075,.018,.023,.01);
 const quick=group(scene),final=group(scene),ghost=group(scene);for(const g of [quick,final,ghost])g.position.set(0,0,-1.0);
 const pieces=[];
 const boardSpec=[[-.65,.56,0,.09,1.12,.12],[.65,.56,0,.09,1.12,.12],[-.65,.56,-.7,.09,1.12,.12],[.65,.56,-.7,.09,1.12,.12],
  [0,.12,-.35,1.4,.10,.9],[0,.48,-.74,1.4,.10,.10],[0,.85,-.74,1.4,.10,.10],[-.65,.5,-.35,.10,.10,.7],[.65,.5,-.35,.10,.10,.7],
  [0,1.18,-.4,1.65,.12,1.25]];
 for(const [i,s] of boardSpec.entries()){
  const [x,y,z,sx,sy,sz]=s;const q=block(quick,0xdab381,x,y,z,sx,sy,sz),f=block(final,i===9?0x89af78:0xdab381,x,y,z,sx,sy,sz);
  pieces.push({q,f,x,y,z,index:i});
 }
 const gutter=group(final);gutter.position.set(.0,1.19,.25);const gutterLeaf=ball(gutter,0x5d9b65,0,0,0,.9,.035,.16);gutterLeaf.rotation.z=-.10;
 curve(gutter,[[-.8,.03,0],[0,0,0],[.8,-.13,.1]],0x44784e,.02);
 for(let i=0;i<10;i++){const b=block(ghost,0x9bc4bc,(i%2?1:-1)*.6,.15+i*.22,-.35,.12,.12,.6);b.material=mat(0x9bc4bc);}
 const barrow=group(scene);block(barrow,0xe7b668,0,.5,0,.85,.13,.85);
 for(const x of [-.44,.44])block(barrow,0xe2aa5b,x,.65,0,.07,.25,.85);
 for(const z of [-.43,.43])block(barrow,0xe2aa5b,0,.65,z,.87,.25,.07);
 for(const x of [-.28,.28]){block(barrow,0x9c795b,x,.56,-.65,.055,.055,.75);block(barrow,0x9c795b,x,.22,-.22,.055,.4,.055);}
 const wheel=mesh(barrow,own(new THREE.TorusGeometry(.21,.055,10,20)),0x667674,[0,.24,.43]);wheel.rotation.y=Math.PI/2;
 const load=group(barrow);for(let i=0;i<5;i++){const b=block(load,0xdca876,0,.65+i*.07,0,.82,.06,.18);b.rotation.y=i%2?.12:-.12;}
 const gutterCarry=ball(cat.hands[1],0x67a66d,0,0,.05,.4,.03,.17);
 const rainPositions=new Float32Array(240*6),rainGeo=own(new THREE.BufferGeometry());rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
 const rainMat=new THREE.LineBasicMaterial({color:0xc0e2f0,transparent:true,opacity:.65});const rainLines=new THREE.LineSegments(rainGeo,rainMat);scene.add(rainLines);
 const drips=[];for(let i=0;i<8;i++)drips.push(ball(scene,0x8dcfe1,0,0,0,.025,.065,.025));
 function apply(a,p,t,speaking){
  a.root.position.set(p.x,p.y+Math.abs(p.step)*.025,p.z);a.root.rotation.y=p.yaw;
  a.body.rotation.z=p.lean;a.head.rotation.set(.03*Math.sin(t),p.look,p.headTilt);
  a.arms[0].rotation.set(-p.arm,0,-.15-p.step*.12);a.arms[1].rotation.set(-Math.max(p.arm*.8,p.otherArm),0,.15+p.step*.12);
  a.legs[0].rotation.x=p.step*.4;a.legs[1].rotation.x=-p.step*.4;a.tail.rotation.z=Math.sin(t*1.5)*.06;
  const blink=Math.sin(t*2.3)>.995?.12:1;
  a.eyes.forEach(({eye,pupil})=>{eye.scale.y=blink;pupil.position.x=p.look*.04;pupil.position.y=-.005-p.worry*.012;});
  a.brows.forEach((b,i)=>b.rotation.z=(i?1:-1)*p.worry*.25);a.mouth.scale.y=1+p.smile*.6;
  a.open.visible=speaking;a.open.scale.y=.025+Math.abs(Math.sin(t*13))*.05;
 }
 function render(s,speaker=null){
  apply(cat,s.cat,s.t,speaker==='kitten');apply(squirrel,s.squirrel,s.t,speaker==='squirrel');
  scene.background.copy(sky).lerp(storm,s.rain*.75);scene.fog.color.copy(scene.background);sun.intensity=2.3-s.rain*.9;
  cloud.position.x=1.9-smooth((s.t-20)/210)*1.2;cloud.scale.setScalar(1+smooth((s.t-180)/60)*.3);
  flowers.forEach((f,i)=>f.rotation.z=Math.sin(s.t*3+i)*s.wind*.08);
  leaf.position.set(s.leaf.x,s.leaf.y,s.leaf.z);leaf.rotation.set(.2,s.leaf.rotation,.1);leaf.visible=s.t<272;
  butterfly.position.set(s.butterfly.x,s.butterfly.y,s.butterfly.z);leftWing.rotation.y=Math.sin(s.t*18)*s.butterfly.flutter*.8;rightWing.rotation.y=-leftWing.rotation.y;
  quick.visible=s.quickVisible;final.visible=s.finalVisible;ghost.visible=s.planVisible&&s.planComplexity>0;
  for(const p of pieces){
   const q=clamp((s.quickBuild*10-p.index)/.8),fall=clamp((s.collapse*11-p.index*.45)/5);
   p.q.visible=q>0;p.q.position.set(p.x+(p.index%2?1:-1)*fall*.65,Math.max(.06,p.y-fall*(p.y-.07)),p.z+fall*.25);p.q.scale.y=q;p.q.rotation.set(fall*.55,0,(p.index%2?1:-1)*(.12+fall*1.1));
   const built=clamp((s.build*11-p.index)/.8);p.f.visible=built>0;p.f.scale.y=built;p.f.rotation.set(p.index===9?-.14:0,0,0);
  }
  ghost.scale.y=.4+s.planComplexity*.7;ghost.rotation.z=Math.sin(s.t*3)*s.planComplexity*.06;
  gutter.visible=s.gutter>0;gutter.scale.x=Math.max(.001,s.gutter);gutterCarry.visible=s.t>=269&&s.t<281;
  carried.visible=s.carrying;sketch.visible=s.blueprint;sketch.rotation.y=.2;
  logs.visible=s.t<238;
  barrow.position.set(s.barrow.x,0,s.barrow.z);barrow.rotation.y=s.barrow.yaw;wheel.rotation.x=s.barrow.roll;load.visible=s.barrow.loaded;
  rainLines.visible=s.rain>0;
  for(let i=0;i<240;i++){
   const x=((i*73)%101)/101*8-4,z=((i*37)%97)/97*6-3,y=3.6-((s.t*3.5+i*.131)%3.6);
   const sheltered=s.finalVisible&&Math.abs(x)<.75&&z>-1.9&&z<-.75&&y<1.3;
   const at=i*6;rainPositions[at]=x;rainPositions[at+1]=sheltered?-1:y;rainPositions[at+2]=z;rainPositions[at+3]=x-.025;rainPositions[at+4]=sheltered?-1:y+.15;rainPositions[at+5]=z;
  }rainGeo.attributes.position.needsUpdate=true;
  for(const [i,d] of drips.entries()){d.visible=s.leak||s.shower;const y=1.12-((s.t*1.8+i*.17)%1.1);d.position.set(s.shower?.92+Math.sin(i)*.07:.05,y,s.shower?-.65:-1.2);}
  const c=s.camera,aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);camera.left=-c.span/2;camera.right=c.span/2;camera.top=c.span/(2*aspect);camera.bottom=-camera.top;
  camera.position.set(c.x+c.targetX,c.y,c.z);camera.lookAt(c.targetX,c.targetY,c.targetZ);camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 function resize(){renderer.setSize(Math.max(1,canvas.clientWidth),Math.max(1,canvas.clientHeight),false);}
 function dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());rainMat.dispose();renderer.dispose();}
 resize();return {render,resize,dispose};
}
