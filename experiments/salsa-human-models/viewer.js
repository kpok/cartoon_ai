import * as THREE from '../../vendor/three.module.js';
import {OrbitControls} from '../../vendor/OrbitControls.js';
import {GLTFExporter} from './exporter.js';
import {createCouple} from './model.js';
const canvas=document.querySelector('canvas'),status=document.querySelector('#status');
try{
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0xb8a28b);renderer.shadowMap.enabled=true;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,2/3,.01,30),couple=createCouple();scene.add(couple);
 scene.add(new THREE.HemisphereLight(0xfff3df,0x55483c,2));const key=new THREE.DirectionalLight(0xffe5c1,3);key.position.set(-3,5,4);scene.add(key);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x94775b,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=.005;scene.add(floor);
 const controls=new OrbitControls(camera,canvas);controls.target.set(0,.92,0);controls.minDistance=1.5;controls.maxDistance=8;controls.maxPolarAngle=Math.PI/2;controls.enablePan=false;
 function render(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);}
 function view(name){camera.position.set(...({front:[0,1.12,4.3],side:[4.3,1.12,0],rear:[0,1.12,-4.3]}[name]));controls.update();render();canvas.dataset.view=name;}
 controls.addEventListener('change',render);new ResizeObserver(render).observe(canvas);document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
 document.querySelector('#download').onclick=async()=>{try{const data=await new GLTFExporter().parseAsync(couple,{binary:true});const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='salsa-couple.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){status.textContent='Export failed: '+error.message;}};
 view('front');status.textContent='Static mesh study · Drag to orbit · Scroll to zoom';document.documentElement.dataset.ready='true';
}catch(error){status.textContent='3D viewer unavailable: '+error.message;}
