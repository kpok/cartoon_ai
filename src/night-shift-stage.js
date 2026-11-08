import * as THREE from '../vendor/three.module.js';
import {smooth,REELS_LAYOUT} from './night-shift-story.js';

// All sets are original procedural illustrations, not a model of the real premises.
export function createNightStage(canvas) {
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 if(renderer.getContext().isContextLost()){renderer.dispose();throw new Error('WebGL unavailable');}
 renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,16/9,.1,100);
 scene.background=new THREE.Color(0x172d45);scene.fog=new THREE.Fog(0x172d45,22,55);
 scene.add(new THREE.HemisphereLight(0xc6e8ff,0x334654,2));
 const light=new THREE.DirectionalLight(0xffefda,3);light.position.set(-5,9,6);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-10,right:10,top:8,bottom:-8,near:.1,far:35});light.shadow.normalBias=.04;scene.add(light);
 const geometries=new Set(),materials=new Map();
 const own=g=>{geometries.add(g);return g;};
 const box=own(new THREE.BoxGeometry(1,1,1)),sphere=own(new THREE.SphereGeometry(1,20,14)),cylinder=own(new THREE.CylinderGeometry(1,1,1,20));
 function material(color){if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.65,metalness:color===0x9baeb7?.48:0}));return materials.get(color);}
 function mesh(parent,geometry,color,p,s){const m=new THREE.Mesh(geometry,material(color));m.position.set(...p);m.scale.set(...s);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 const block=(p,c,x,y,z,sx,sy,sz)=>mesh(p,box,c,[x,y,z],[sx,sy,sz]);
 const ball=(p,c,x,y,z,sx,sy=sx,sz=sx)=>mesh(p,sphere,c,[x,y,z],[sx,sy,sz]);
 const cyl=(p,c,x,y,z,r,h)=>mesh(p,cylinder,c,[x,y,z],[r,h,r]);
 const group=p=>{const g=new THREE.Group();p.add(g);return g;};
 function person(parent,{suit=0xd8e3de,skin=0xdab396,hair=0x4b3833,cap=true}={}){
  const root=group(parent),torso=group(root);torso.position.y=.9;
  ball(torso,suit,0,.12,0,.30,.43,.23);block(torso,0xe5e6db,0,-.12,.225,.4,.06,.025);
  const head=group(torso);head.position.y=.65;ball(head,skin,0,.03,0,.245,.29,.23);ball(head,hair,0,.20,-.035,.25,.17,.21);
  if(cap){ball(head,0xdde7e7,0,.25,0,.27,.12,.25);block(head,0xc5d7dd,0,.21,.20,.47,.04,.16);}
  for(const x of [-.085,.085]){ball(head,0xeff3ed,x,.055,.209,.045,.05,.025);ball(head,0x273744,x,.052,.23,.019,.025,.012);}
  ball(head,skin,0,-.015,.235,.045,.045,.04);const mouth=block(head,0x755747,0,-.105,.217,.065,.015,.016);
  const arms=[];for(const side of [-1,1]){const arm=group(torso);arm.position.set(side*.31,.32,0);ball(arm,suit,0,-.20,0,.095,.26,.10);ball(arm,skin,0,-.47,.015,.075,.10,.075);arms.push(arm);}
  const legs=[];for(const side of [-1,1]){const leg=group(root);leg.position.set(side*.14,.65,0);ball(leg,0x354859,0,-.21,0,.10,.31,.11);block(leg,0x263744,0,-.57,.065,.21,.15,.33);legs.push(leg);}
  return {root,head,arms,legs,mouth,pose(t,walk=0,talk=false){torso.rotation.z=Math.sin(t*1.5)*.012;head.rotation.y=Math.sin(t*.75)*.06;for(let i=0;i<2;i++){legs[i].rotation.x=Math.sin(t*5+i*Math.PI)*walk*.5;arms[i].rotation.x=-.15+Math.sin(t*5+i*Math.PI)*walk*.35;}mouth.scale.y=.015*(talk?1+Math.abs(Math.sin(t*14))*3:1);}};
 }
 function ground(parent,color=0x455d69){return block(parent,color,0,-.16,0,45,.3,45);}
 function facade(parent,hospital=false){
  block(parent,hospital?0xd3dcd9:0x657f8e,0,2,-2,10,4,3);block(parent,0x335363,0,4.05,-2,10.5,.20,3.5);
  for(let i=0;i<7;i++){block(parent,0xc0dfd9,-3.9+i*1.3,2.65,-.47,.83,.8,.035);block(parent,0x3c6270,-3.9+i*1.3,2.65,-.43,.04,.8,.025);}
  block(parent,0x233e52,0,1,-.43,1.3,2,.08);block(parent,0x90c7cc,0,1.15,-.36,1.04,1.5,.05);block(parent,0xa4b9bd,0,2.1,.1,3.1,.12,1.6);
  for(const x of [-1.35,1.35])cyl(parent,0xa4b9bd,x,1,.65,.045,2);
  if(hospital){block(parent,0x5db6ad,3.7,1.25,-.4,.7,.7,.05);block(parent,0xecf3e9,3.7,1.25,-.35,.45,.12,.04);block(parent,0xecf3e9,3.7,1.25,-.35,.12,.45,.04);}
  for(const x of [-5.8,5.8]){cyl(parent,0x91aab6,x,1.75,0,.045,3.5);ball(parent,0xffe4ae,x,3.5,0,.15,.08,.15);}
 }
 function van(parent){const g=group(parent);block(g,0xe3eae5,0,.95,0,1.5,1.4,3);block(g,0x294d60,0,1.1,1.53,1.25,.65,.04);block(g,0x3ea6a0,0,.9,1.56,1.5,.16,.04);for(const x of [-.78,.78])for(const z of [-.9,.9]){const w=cyl(g,0x253640,x,.38,z,.31,.15);w.rotation.z=Math.PI/2;}block(g,0x5da1e4,0,1.75,.6,.85,.14,.25);return g;}
 const sets={};for(const id of ['night','line','incident','rescue','flight','investigation']){sets[id]=group(scene);sets[id].visible=false;}
 ground(sets.night,0x304855);facade(sets.night);for(let i=0;i<10;i++)block(sets.night,0xd3caa1,(i-4.5)*.9,.012,4,.45,.025,.08);
 const moon=ball(sets.night,0xc7dddf,5,7,-9,.45);moon.castShadow=false;
 // The line has fixed guards; no unsafe intervention or entanglement is invented.
 function makeLine(parent){
  ground(parent,0x8d9fa4);block(parent,0xb5c7ca,0,2.3,-2.1,13,4.6,.15);
  for(let i=-3;i<=3;i++)block(parent,0x92b2bb,i*1.8,2.5,-1.99,.035,4,.02);
  for(const x of [-4,0,4])block(parent,0xe3ece8,x,4.1,-.5,2,.07,.6);
  const belt=group(parent);block(belt,0x9baeb7,0,1.02,0,8.3,.24,1.0);block(belt,0x3e5962,0,1.16,0,8.1,.045,.69);
  for(const x of [-3.6,-1.5,1.5,3.6])for(const z of [-.37,.37])block(belt,0x9baeb7,x,.48,z,.10,.95,.10);
  for(const z of [-.49,.49])block(belt,0xb7c9cb,0,1.36,z,8.3,.045,.04);
  const machine=group(parent);machine.position.x=.55;
  block(machine,0x557f89,0,1.65,0,1.7,1.1,1.36);block(machine,0x355765,0,1.78,.70,1.47,.74,.035);
  for(const x of [-.8,.8])block(machine,0xb7c9cb,x,1.8,.74,.045,1.12,.06);
  block(machine,0xb7c9cb,0,2.27,0,1.85,.13,1.5);cyl(machine,0x9baeb7,0,1.83,0,.23,.5);
  block(machine,0x355765,1.13,1.8,.55,.45,.6,.18);block(machine,0x8ec5b9,1.13,1.92,.655,.29,.22,.025);ball(machine,0xba6a56,1.13,1.68,.67,.055,.055,.025);
  const cans=[];for(let i=0;i<12;i++){const g=group(parent);cyl(g,0x9baeb7,0,1.36,0,.18,.35);cyl(g,0xc4d0cf,0,1.54,0,.184,.025);block(g,0xd4b98e,0,1.36,.18,.22,.15,.012);cans.push(g);}
  return {cans,machine};
 }
 const line=makeLine(sets.line),worker=person(sets.line);worker.root.position.set(-1.8,0,1.2);worker.root.rotation.y=-.3;
 // A corridor rather than the injured worker is shown during the emergency.
 ground(sets.incident,0x748e99);block(sets.incident,0xb0c4ca,0,2.3,-1.4,13,4.6,.2);block(sets.incident,0x365a69,-2,1.6,-1.25,2.5,3.2,.1);block(sets.incident,0x92b8bd,-2,1.65,-1.16,1.9,2.6,.06);block(sets.incident,0x506d79,2.4,1.1,-1.2,3.2,.12,.05);
 const coworker=person(sets.incident,{suit:0xb9d0ca,skin:0xb88c6d});coworker.root.position.set(.3,0,.5);coworker.root.rotation.y=-.5;
 const rescue=sets.rescue;ground(rescue,0x708993);block(rescue,0x9eb8bf,0,2.2,-2,13,4.4,.15);
 const stretcher=group(rescue);stretcher.position.set(-.25,0,.4);block(stretcher,0xa5b8bd,0,.67,0,2,.12,.8);block(stretcher,0x375c68,0,.79,0,1.9,.13,.7);
 for(const x of [-.65,.65])for(const z of [-.30,.30]){block(stretcher,0x9baeb7,x,.38,z,.04,.6,.04);ball(stretcher,0x2b3d4a,x,.12,z,.10);}
 ball(stretcher,0xdab396,-.69,.97,0,.21,.14,.19);ball(stretcher,0x426c77,.2,.95,0,.73,.19,.33);block(stretcher,0xdce3dc,-.68,.83,0,.5,.06,.57);
 const medic1=person(rescue,{suit:0xcb7b55,cap:false}),medic2=person(rescue,{suit:0xcb7b55,skin:0xa8785e,cap:false});medic1.root.position.set(-.9,0,-.5);medic2.root.position.set(1.2,0,.7);medic2.root.rotation.y=-1;
 const bag=block(rescue,0x975a49,-1.8,.22,1,.5,.4,.34);block(rescue,0xeee6cf,-1.8,.24,1.18,.22,.07,.02);block(rescue,0xeee6cf,-1.8,.24,1.18,.07,.22,.02);
 const flight=sets.flight,departure=group(flight),arrival=group(flight);ground(departure,0x3d5865);facade(departure);const ambulance=van(departure);ambulance.position.set(-3,0,1.5);ambulance.rotation.y=.3;
 const pad=group(flight);ground(pad,0x496573);cyl(pad,0x778d91,0,.015,0,3.2,.04);block(pad,0xd9dfcb,-.7,.05,0,.17,.02,1.5);block(pad,0xd9dfcb,.7,.05,0,.17,.02,1.5);block(pad,0xd9dfcb,0,.05,0,1.4,.02,.16);
 const heli=group(pad);ball(heli,0xe7c25e,0,1.45,0,1.05,.60,.61);ball(heli,0x35596c,.65,1.48,.0,.55,.44,.56);block(heli,0xe7c25e,-1.5,1.45,0,1.7,.16,.18);block(heli,0xe7c25e,-2.2,1.77,0,.15,.75,.10);
 for(const z of [-.51,.51]){block(heli,0x6f878e,0,.8,z,.09,.5,.08);block(heli,0x6f878e,0,.55,z,1.9,.08,.10);}
 cyl(heli,0x526975,0,2.1,0,.05,.4);const rotor=group(heli);rotor.position.y=2.32;block(rotor,0x809397,0,0,0,4.3,.035,.14);block(rotor,0x809397,0,0,0,.14,.035,4.3);
 const tailRotor=group(heli);tailRotor.position.set(-2.25,1.65,.13);block(tailRotor,0x546b78,0,0,0,.65,.045,.035);block(tailRotor,0x546b78,0,0,0,.045,.65,.035);
 ground(arrival,0x425c69);facade(arrival,true);
 const investigation=sets.investigation,stopped=makeLine(investigation),officer=person(investigation,{suit:0x344a65,skin:0xb98a6c,cap:false});officer.root.position.set(-2.1,0,1.1);officer.root.rotation.y=-.4;const cameraProp=block(officer.root,0x293640,.12,1.12,.47,.24,.16,.14);cyl(cameraProp,0x192b39,0,0,0,.045,.09).rotation.x=Math.PI/2;
 const inspect={};
 function resize(){const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
 let activeBounds=null;
 function subjectBounds(s){
  if(s.chapter==='night')return [[-5.3,0,-3.6],[5.3,4.3,1]];
  if(s.chapter==='line')return [[-2.3,0,-.85],[1.8,2.5,1.6]];
  if(s.chapter==='incident')return [[-3.3,0,-1.3],[1.1,3.3,1]];
  if(s.chapter==='rescue')return [[-2.1,0,-.8],[1.7,2,1.4]];
  if(s.chapter==='flight'){
   if(s.time<60)return [[-4.5,0,-1.5],[4.3,4.3,3.3]];
   if(s.time<69){const lift=smooth((s.time-62)/7);return [[-2.5+lift*2,lift*2.5,-2.3],[2.5+lift*2,2.7+lift*2.5,2.3]];}
   return [[-5.3,0,-3.6],[5.3,4.3,1]];
  }
  return [[-2.7,0,-.85],[1.8,2.5,1.6]];
 }
 function corners(bounds){const [min,max]=bounds,result=[];for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])result.push(new THREE.Vector3(x,y,z));return result;}
 function view(pos,target){
  camera.updateProjectionMatrix();camera.position.set(...pos);camera.lookAt(...target);
  if(camera.aspect<1){
   // Fit and shift the subject into the asymmetric Reels-safe band; background stays full-frame.
   const points=corners(activeBounds),center=new THREE.Vector3().addVectors(points[0],points.at(-1)).multiplyScalar(.5);
   const direction=new THREE.Vector3(...pos).sub(new THREE.Vector3(...target)).normalize();
   const right=new THREE.Vector3().crossVectors(camera.up,direction).normalize(),up=new THREE.Vector3().crossVectors(direction,right).normalize();
   const zone=REELS_LAYOUT.subject,tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
   const tanY=tan*(zone.bottom-zone.top)*.94,tanX=tan*camera.aspect*(zone.right-zone.left)*.94;
   let distance=1;
   for(const point of points){const offset=point.clone().sub(center),depth=offset.dot(direction);distance=Math.max(distance,depth+Math.abs(offset.dot(right))/tanX,depth+Math.abs(offset.dot(up))/tanY);}
   camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);
   camera.projectionMatrix.elements[8]=-(zone.left+zone.right-1);camera.projectionMatrix.elements[9]=-(1-zone.top-zone.bottom);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
   scene.fog.near=distance+12;scene.fog.far=distance+50;
  }else{scene.fog.near=22;scene.fog.far=55;}
 }

 function render(s,speaker=null){
  for(const [id,set]of Object.entries(sets))set.visible=id===s.chapter;
  const t=s.time,p=s.progress,wide=camera.aspect<1.5?1.16:1;activeBounds=subjectBounds(s);
  scene.background.set(s.chapter==='night'?0x172d45:0x53717e);scene.fog.color.copy(scene.background);
  if(s.chapter==='night'){view([10.5*wide-p,6.1,12*wide-p],[0,1.5,-1]);}
  if(s.chapter==='line'){line.cans.forEach((c,i)=>{c.position.x=((i*.65+t*.35)%7.8)-3.9;});worker.pose(t,0,false);worker.arms[0].rotation.x=-.6;view([7.7*wide-p*.6,5,9.6*wide],[0,1.35,0]);}
  if(s.chapter==='incident'){coworker.pose(t,.1,speaker==='coworker');coworker.arms[1].rotation.z=-.8-smooth((t-27)/2)*.4;view([5.7*wide,3.5,8*wide],[0,1.3,-.3]);}
  if(s.chapter==='rescue'){medic1.pose(t,0,speaker==='paramedic');medic2.pose(t,0,false);medic1.arms[0].rotation.x=-.8;medic1.arms[1].rotation.x=-.8;medic2.arms[0].rotation.x=-.7;medic2.head.rotation.x=.15;bag.rotation.y=.1;view([5.7*wide-p*.5,4,7.5*wide],[0,1,.1]);}
  if(s.chapter==='flight'){
   const helicopterShot=t>=60&&t<69;departure.visible=t<60;pad.visible=helicopterShot;arrival.visible=t>=69;
   heli.position.set(smooth((t-62)/7)*2,smooth((t-62)/7)*2.5,0);heli.rotation.z=-smooth((t-62)/7)*.08;rotor.rotation.y=t*18;tailRotor.rotation.z=-t*22;
   if(t<60)view([9*wide,5,11*wide],[0,1.5,0]);else if(t<69)view([6.5*wide,4.5,8.5*wide],[0,2,0]);else view([9*wide-(t-69)*.18,5.4,11*wide],[0,1.7,-1]);
  }
  if(s.chapter==='investigation'){stopped.cans.forEach((c,i)=>{c.position.x=i*.65-3.6;});officer.pose(t);officer.arms[0].rotation.x=-1.1;officer.arms[1].rotation.x=-1.1;view([8.5*wide+p,5.2+p*.5,10.5*wide+p],[0,1.4,0]);}
  inspect.chapter=s.chapter;inspect.cansMoving=s.chapter==='line';inspect.people=s.chapter==='rescue'?2:s.chapter==='line'||s.chapter==='incident'||s.chapter==='investigation'?1:0;
  camera.updateMatrixWorld();inspect.aspect=camera.aspect;inspect.subjectCorners=corners(activeBounds).map(point=>{const p=point.project(camera);return {x:p.x,y:p.y,z:p.z};});
  renderer.render(scene,camera);
 }
 resize();return {render,resize,inspect:()=>({...inspect}),dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();}};
}
