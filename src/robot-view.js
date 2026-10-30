import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {createRobotStage} from './robot-stage.js';
import {createKalinka} from './robot-kalinka.js';
import {createKalinkaStage,kalinkaCameraPose} from './kalinka-stage.js';
import {DanceClock} from './robot-playback.js';
import {OrbitControls} from '../vendor/OrbitControls.js';
const canvas=document.querySelector('#robot-canvas'),preview=document.querySelector('#preview'),status=document.querySelector('#model-status'),viewport=document.querySelector('#viewport');
const buttons=[...document.querySelectorAll('.tools button')];
let renderer,controls,model,homePosition,mixer,clock,stage;
let unavailable=false;
const kalinka=new URLSearchParams(location.search).get('dance')==='kalinka';
let variant;
let autoCamera=kalinka&&!reducedMotionCamera();
function reducedMotionCamera(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
const cameraButton=document.querySelector('#camera-auto');
if(kalinka){cameraButton.hidden=false;viewport.classList.add('kalinka-viewport');}
function pose(time){if(variant)variant.update(time);else mixer.setTime(time);}
if(kalinka){document.title='Robot — Kalinka';document.querySelector('h1').innerHTML='Więcej energii.<br><span>Cały plac do tańca.</span>';document.querySelector('.intro > p:last-child').textContent='Eksperyment 02 · skoczne wykopy, szpagaty w powietrzu i wędrujący taniec · 24 sekundy bez dźwięku';document.querySelector('.details').textContent='Robot w dopasowanej uszatce tańczy po nieregularnej trasie na placu 3D: sprężyste przysiady, wymachy rąk i dwa skoki ze szpagatem. Przeciągnięcie wyłącza automatyczną kamerę; przycisk włącza ją ponownie. Bruk, cienie i bliskie rekwizyty są przestrzenne, a daleka architektura to pojedynczy obraz wygenerowany w AI — nie pełne otoczenie 360°. Pobierany GLB pozostaje oryginalnym wariantem.';document.querySelector('.studio-top strong').textContent='ROBOT / KALINKA — PLAC 3D';}

const exporting=new URLSearchParams(location.search).get('export')==='1';
if(exporting)document.documentElement.classList.add('robot-export');
let cues=[];
const timeline=document.querySelector("#dance-time"),readout=document.querySelector("#dance-readout");
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const danceButton=document.querySelector('#dance-toggle');
function syncDance(){if(!clock)return;danceButton.textContent=clock.playing?'Wstrzymaj taniec':'Uruchom taniec';danceButton.setAttribute('aria-pressed',String(clock.playing));canvas.dataset.playing=String(clock.playing);canvas.dataset.time=clock.time.toFixed(3);timeline.value=String(clock.time);const cue=cues.find(([start,end])=>clock.time>=start&&clock.time<end);readout.textContent=`${clock.time.toFixed(1)} / ${clock.duration} s${cue?' · '+cue[2]:''}`;}
function failed(){
 unavailable=true;clock?.setPlaying(false);canvas.dataset.playing="false";
 canvas.hidden=true;preview.hidden=false;status.hidden=false;status.textContent='Podgląd 3D jest niedostępny. Możesz obejrzeć render lub pobrać model GLB.';
 canvas.dataset.ready='false';buttons.forEach(button=>{button.disabled=true;});timeline.disabled=true;
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(exporting?1:Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=kalinka?1.05:1.25;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x083d27);scene.fog=new THREE.Fog(0x0b4c30,24,75);const camera=new THREE.PerspectiveCamera(35,1,.01,100);
 if(kalinka){scene.background=new THREE.Color(0x9fc3dc);scene.fog=null;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;}
 scene.add(new THREE.HemisphereLight(0xdceeff,0x526083,kalinka?1.8:3));
 for(const [color,intensity,position] of [[0xffffff,5,[3,5,5]],[0x48d8ee,3,[-4,2,2]],[0xff71da,4,[3,2,-3]]]){const light=new THREE.DirectionalLight(color,kalinka?intensity*.55:intensity);light.position.set(...position);if(kalinka&&color===0xffffff){light.position.set(-4,9,7);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-7,right:7,top:9,bottom:-5,near:.1,far:30});light.shadow.normalBias=.015;}scene.add(light);}
 // A procedural studio reflection avoids external HDRI files and image decoders.
 const environment=new THREE.Scene();environment.background=new THREE.Color('#6c7c9b');
 const panelGeometry=new THREE.PlaneGeometry(8,8);
 for(const [position,color] of [[[0,3,4],0xffffff],[[-4,1,0],0x87c9e8],[[4,1,0],0xe8a1d8],[[0,-4,0],0x1a2336]]){const panel=new THREE.Mesh(panelGeometry,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));panel.position.set(...position);panel.lookAt(0,0,0);environment.add(panel);}
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(environment,.1,.1,50);scene.environment=target.texture;pmrem.dispose();
 controls=new OrbitControls(camera,canvas);controls.enableDamping=!exporting&&!kalinka;controls.enabled=!exporting;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.92;controls.minPolarAngle=Math.PI*.08;
 let frame=null;
 function syncCamera(){cameraButton.textContent=autoCamera?'Kamera: automatyczna':'Kamera: ręczna';cameraButton.setAttribute('aria-pressed',String(autoCamera));canvas.dataset.camera=kalinka?(autoCamera?'auto':'manual'):'orbit';}
 function updateCamera(time){if(!kalinka||!autoCamera)return;const p=kalinkaCameraPose(time,camera.aspect);camera.position.set(p.position.x,p.position.y,p.position.z);controls.target.set(p.target.x,p.target.y,p.target.z);camera.lookAt(controls.target);canvas.dataset.cameraPosition=camera.position.toArray().map(n=>n.toFixed(4)).join(',');}
 function manualCamera(){if(!kalinka)return;autoCamera=false;syncCamera();}
 controls.addEventListener('start',manualCamera);
 cameraButton.addEventListener('click',()=>{if(unavailable||!clock)return;autoCamera=!autoCamera;syncCamera();updateCamera(clock.time);controls.update();requestRender();});
 function requestRender(){if(frame!==null||document.hidden||unavailable)return;frame=requestAnimationFrame(now=>{frame=null;if(mixer&&clock){pose(clock.tick(now));stage?.update(clock.time);updateCamera(clock.time);syncDance();}controls.update();renderer.render(scene,camera);if(clock?.playing)requestRender();});}
 controls.addEventListener('change',requestRender);
 document.addEventListener('visibilitychange',()=>{clock?.suspend();if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else requestRender();});
 function resize(){renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();requestRender();}
 new ResizeObserver(resize).observe(viewport);resize();
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frame!==null)cancelAnimationFrame(frame);failed();});
 const loader=new GLTFLoader();
 loader.load(new URL('../published/robot/robot.glb?v=head-v4',import.meta.url).href,async gltf=>{
  try{
  const response=await fetch(new URL("../published/robot/manifest.json?v=head-v4",import.meta.url));if(!response.ok)throw new Error("Missing manifest");const manifest=await response.json();cues=manifest.animation.cues;
  if(unavailable)return;
  if(gltf.animations.length!==1||gltf.animations[0].name!=='ReferenceDance'||Math.abs(gltf.animations[0].duration-40)>.01||manifest.animation.duration!==40||!Array.isArray(cues)){failed();return;}
  model=gltf.scene;mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play();mixer.setTime(0);clock=new DanceClock(gltf.animations[0].duration);
  if(kalinka){mixer.stopAllAction();variant=createKalinka(model,THREE);variant.update(0);clock=new DanceClock(24);cues=[[0,3,'Skoczne wejście'],[3,10,'Wędrujące wykopy'],[10,12,'Skok i szpagat'],[12,18,'Sprężyste przysiady'],[18,20,'Finałowy szpagat'],[20,24,'Skoczne kroki']];model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});}
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  if(!Number.isFinite(size.length())||size.length()===0){failed();return;}
  if(!kalinka)model.position.sub(center);scene.add(model);
  if(kalinka){stage=await createKalinkaStage(THREE);canvas.dataset.background=stage.backgroundReady?'photo':'fallback';if(unavailable){stage.dispose();variant.dispose();return;}}else{stage=createRobotStage(THREE,box.min.y-center.y);}
  scene.add(stage.group);stage.update(0);
  const radius=size.length()/2*1.18,distance=radius/Math.sin(THREE.MathUtils.degToRad(35/2))*1.05;
  homePosition=new THREE.Vector3(distance*.10,radius*.12,distance);
  if(exporting&&!kalinka){
   const bounds=manifest.animation.bounds;
   const minimum=new THREE.Vector3(...bounds.min).sub(center),maximum=new THREE.Vector3(...bounds.max).sub(center);
   const halfWidth=Math.max(Math.abs(minimum.x),Math.abs(maximum.x))*1.08,halfHeight=Math.max(Math.abs(minimum.y),Math.abs(maximum.y))*1.08;
   const exportDistance=Math.max(halfHeight,halfWidth/camera.aspect)/Math.tan(THREE.MathUtils.degToRad(35/2))+maximum.z;
   homePosition.set(0,0,exportDistance);
  }camera.position.copy(homePosition);camera.near=radius/100;camera.far=distance+radius*20;camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.minDistance=radius*1.25;controls.maxDistance=distance*2;controls.update();
  if(kalinka){camera.fov=40;camera.near=.05;camera.far=150;controls.minDistance=7;controls.maxDistance=32;const p=kalinkaCameraPose(0,camera.aspect);homePosition.set(p.position.x,p.position.y,p.position.z);camera.position.copy(homePosition);controls.target.set(p.target.x,p.target.y,p.target.z);camera.updateProjectionMatrix();controls.update();syncCamera();}
  canvas.hidden=false;preview.hidden=true;status.hidden=true;canvas.dataset.ready='true';buttons.forEach(button=>{button.disabled=false;});
  timeline.max=String(clock.duration);timeline.disabled=false;clock.setPlaying(!exporting&&!reducedMotion.matches);syncDance();requestRender();
  if(exporting){
   window.renderRobotFrame=time=>{
    if(unavailable||!Number.isFinite(time)||time<0||time>=clock.duration)throw new Error('Invalid robot export frame');
    clock.seek(time);pose(time);stage.update(time);updateCamera(time);syncDance();controls.update();renderer.render(scene,camera);
    return {time,width:canvas.width,height:canvas.height};
   };
   window.robotExportReady=true;
  }
  }catch{failed();}
 },undefined,failed);
 timeline.addEventListener('input',()=>{if(!clock||unavailable)return;clock.seek(Number(timeline.value));pose(clock.time);stage?.update(clock.time);updateCamera(clock.time);syncDance();requestRender();});
 danceButton.addEventListener('click',()=>{if(!clock||unavailable)return;clock.setPlaying(!clock.playing);syncDance();requestRender();});
 document.querySelector('#dance-restart').addEventListener('click',()=>{if(!clock||unavailable)return;clock.restart();pose(0);stage?.update(0);updateCamera(0);syncDance();requestRender();});
 reducedMotion.addEventListener('change',event=>{if(event.matches&&clock){if(kalinka){autoCamera=false;syncCamera();}clock.setPlaying(false);syncDance();requestRender();}});
 document.querySelector('#rotate-left').addEventListener('click',()=>{if(model){if(kalinka){manualCamera();const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/8);camera.position.copy(controls.target).add(offset);controls.update();}else model.rotation.y-=Math.PI/8;requestRender();}});
 document.querySelector('#zoom-in').addEventListener('click',()=>{manualCamera();camera.position.sub(controls.target).multiplyScalar(.85).add(controls.target);controls.update();});
 document.querySelector('#zoom-out').addEventListener('click',()=>{manualCamera();camera.position.sub(controls.target).multiplyScalar(1.15).add(controls.target);controls.update();});
 document.querySelector('#reset-view').addEventListener('click',()=>{if(!homePosition)return;model.rotation.set(0,0,0);camera.position.copy(homePosition);if(kalinka){const p=kalinkaCameraPose(clock.time,camera.aspect);controls.target.set(p.target.x,p.target.y,p.target.z);autoCamera=!reducedMotion.matches;syncCamera();if(autoCamera)updateCamera(clock.time);}else controls.target.set(0,0,0);controls.update();requestRender();});
}catch{failed();}
