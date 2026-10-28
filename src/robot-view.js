import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {OrbitControls} from '../vendor/OrbitControls.js';
const canvas=document.querySelector('#robot-canvas'),preview=document.querySelector('#preview'),status=document.querySelector('#model-status'),viewport=document.querySelector('#viewport');
const buttons=[...document.querySelectorAll('.tools button')];
let renderer,controls,model,homePosition;
function failed(){
 canvas.hidden=true;preview.hidden=false;status.hidden=false;status.textContent='Podgląd 3D jest niedostępny. Możesz obejrzeć render lub pobrać model GLB.';
 canvas.dataset.ready='false';buttons.forEach(button=>{button.disabled=true;});
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100);
 scene.add(new THREE.HemisphereLight(0xdceeff,0x526083,3));
 for(const [color,intensity,position] of [[0xffffff,5,[3,5,5]],[0x48d8ee,3,[-4,2,2]],[0xff71da,4,[3,2,-3]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(...position);scene.add(light);}
 // A procedural studio reflection avoids external HDRI files and image decoders.
 const environment=new THREE.Scene();environment.background=new THREE.Color('#6c7c9b');
 const panelGeometry=new THREE.PlaneGeometry(8,8);
 for(const [position,color] of [[[0,3,4],0xffffff],[[-4,1,0],0x87c9e8],[[4,1,0],0xe8a1d8],[[0,-4,0],0x1a2336]]){const panel=new THREE.Mesh(panelGeometry,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));panel.position.set(...position);panel.lookAt(0,0,0);environment.add(panel);}
 const pmrem=new THREE.PMREMGenerator(renderer),target=pmrem.fromScene(environment,.1,.1,50);scene.environment=target.texture;pmrem.dispose();
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.92;controls.minPolarAngle=Math.PI*.08;
 let frame=null;
 function requestRender(){if(frame!==null||document.hidden)return;frame=requestAnimationFrame(()=>{frame=null;controls.update();renderer.render(scene,camera);});}
 controls.addEventListener('change',requestRender);
 document.addEventListener('visibilitychange',requestRender);
 function resize(){renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);camera.aspect=viewport.clientWidth/viewport.clientHeight;camera.updateProjectionMatrix();requestRender();}
 new ResizeObserver(resize).observe(viewport);resize();
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(frame!==null)cancelAnimationFrame(frame);failed();});
 const loader=new GLTFLoader();
 loader.load(new URL('../published/robot/robot.glb',import.meta.url).href,gltf=>{
  model=gltf.scene;const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  if(!Number.isFinite(size.length())||size.length()===0){failed();return;}
  model.position.sub(center);scene.add(model);
  const radius=size.length()/2,distance=radius/Math.sin(THREE.MathUtils.degToRad(35/2))*1.05;
  homePosition=new THREE.Vector3(distance*.10,radius*.12,distance);camera.position.copy(homePosition);camera.near=radius/100;camera.far=distance+radius*20;camera.updateProjectionMatrix();controls.target.set(0,0,0);controls.minDistance=radius*1.25;controls.maxDistance=distance*2;controls.update();
  canvas.hidden=false;preview.hidden=true;status.hidden=true;canvas.dataset.ready='true';buttons.forEach(button=>{button.disabled=false;});
  requestRender();
 },undefined,failed);
 document.querySelector('#rotate-left').addEventListener('click',()=>{if(model){model.rotation.y-=Math.PI/8;requestRender();}});
 document.querySelector('#zoom-in').addEventListener('click',()=>{camera.position.multiplyScalar(.85);controls.update();});
 document.querySelector('#zoom-out').addEventListener('click',()=>{camera.position.multiplyScalar(1.15);controls.update();});
 document.querySelector('#reset-view').addEventListener('click',()=>{if(!homePosition)return;model.rotation.set(0,0,0);camera.position.copy(homePosition);controls.target.set(0,0,0);controls.update();requestRender();});
}catch{failed();}
