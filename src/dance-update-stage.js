import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {updatePose} from './dance-update-story.js';

export async function createUpdateStage(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#131b36');
 const camera=new THREE.OrthographicCamera(-3,3,5,-1,.05,80);
 camera.position.set(0,2.5,13);camera.lookAt(0,2.5,0);
 scene.add(new THREE.HemisphereLight(0xe8f4ff,0x657595,3));
 for(const [color,power,pos] of [[0xffffff,5,[3,7,6]],[0x65d9ff,3,[-4,3,4]],[0xff8bcf,4,[3,4,-3]]]){
  const light=new THREE.DirectionalLight(color,power);light.position.set(...pos);scene.add(light);
 }
 // A local procedural reflection studio keeps the metallic model legible.
 const studio=new THREE.Scene();studio.background=new THREE.Color('#8596b6');
 for(const [pos,color] of [[[0,3,4],0xffffff],[[-4,1,0],0x87c9e8],[[4,1,0],0xe8a1d8]]){
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));panel.position.set(...pos);panel.lookAt(0,0,0);studio.add(panel);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.1,.1,50);scene.environment=environment.texture;pmrem.dispose();
 studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 let model;
 try{model=(await new GLTFLoader().loadAsync(new URL('../published/robot/robot.glb',import.meta.url).href)).scene;}
 catch(error){environment.dispose();renderer.dispose();throw error;}
 scene.add(model);
 const names=['DanceRoot','TorsoPivot','HeadPivot','SmilePivot',...['Left','Right'].flatMap(s=>['HipPivot','KneePivot','FootPivot','ArmPivot','ElbowPivot','WristPivot','GazePivot','BrowPivot','LidPivot'].map(p=>s+p))];
 const nodes=Object.fromEntries(names.map(name=>{const node=model.getObjectByName(name);if(!node)throw new Error(`Missing pilot rig node: ${name}`);return [name,node];}));
 const rest=new Map(Object.values(nodes).map(n=>[n,{position:n.position.clone(),quaternion:n.quaternion.clone(),scale:n.scale.clone()}]));
 const root=nodes.DanceRoot;model.updateMatrixWorld(true);
 const floorOffset=-new THREE.Box3().setFromObject(model).min.y+.02;
 const floor=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.5,.1,64),new THREE.MeshStandardMaterial({color:0x26345c,roughness:.8}));floor.position.y=-.06;scene.add(floor);
 const ring=new THREE.Mesh(new THREE.RingGeometry(2.29,2.33,64),new THREE.MeshBasicMaterial({color:0x75dce2,toneMapped:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.002;scene.add(ring);
 function badge(x,y){
  const group=new THREE.Group();group.position.set(x,y,1.5);scene.add(group);
  const background=new THREE.Mesh(new THREE.CircleGeometry(.29,32),new THREE.MeshBasicMaterial({color:0x10162c}));group.add(background);
  const segments=[];
  for(let i=0;i<16;i++){
   const part=new THREE.Mesh(new THREE.RingGeometry(.225,.27,3,1,i*Math.PI/8+.025,Math.PI/8-.05),new THREE.MeshBasicMaterial({color:0xffc45b,toneMapped:false}));group.add(part);segments.push(part);
  }
  const arrow=new THREE.Group();group.add(arrow);
  const shaft=new THREE.Mesh(new THREE.PlaneGeometry(.05,.18),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));arrow.add(shaft);
  const tip=new THREE.Mesh(new THREE.CircleGeometry(.095,3),shaft.material);tip.position.y=.10;arrow.add(tip);
  return {group,segments,arrow};
 }
 const badges=[badge(-1.55,.8),badge(1.55,.8),badge(-1.65,2.0),badge(1.65,2.0)];
 const footMeshes=[];for(const side of ['Left','Right'])nodes[side+'FootPivot'].traverse(o=>{if(o.isMesh)footMeshes.push(o);});
 const footBox=new THREE.Box3();
 function render(time){
  const p=updatePose(time);
  for(const [node,r] of rest){node.position.copy(r.position);node.quaternion.copy(r.quaternion);node.scale.copy(r.scale);}
  root.position.y+=floorOffset;root.rotation.y=p.turn;
  nodes.TorsoPivot.rotation.z=p.lean;nodes.HeadPivot.rotation.x=p.lookDown;
  nodes.HeadPivot.rotation.z=-p.lean*.7;
  for(const [i,side] of ['Left','Right'].entries()){
   const sign=i===0?-1:1,kick=i===0?p.left:p.right;
   nodes[side+'HipPivot'].rotation.set(-kick*1.10,0,sign*kick*.12);
   nodes[side+'KneePivot'].rotation.x=kick*.75;
   nodes[side+'FootPivot'].rotation.x=kick*.35;
   const arm=i===0?p.arm:p.finalArm;
   nodes[side+'ArmPivot'].rotation.set(-.22-p.restraint*.65-p.sync*(i===1?.7:0),0,sign*(.12+p.relief*.7+Math.abs(arm)*1.3));
   nodes[side+'ElbowPivot'].rotation.x=-.35-p.restraint*.65+arm*.45;
   nodes[side+'WristPivot'].rotation.z=arm*.9;
   nodes[side+'GazePivot'].position.y-=p.lookDown*.35;
   nodes[side+'GazePivot'].position.x+=p.alarm*.045*(i===0?1:-1);
   nodes[side+'BrowPivot'].rotation.z=sign*(.12-p.relief*.2+p.alarm*.2);
   const blink=Math.abs((p.time%4.2)-3.7)<.07;nodes[side+'LidPivot'].scale.y=blink?1:.015;
  }
  // The second foot reaches across to restrain the first; it visibly fails.
  nodes.RightHipPivot.rotation.z-=p.restraint*.48;
  nodes.RightKneePivot.rotation.x+=p.restraint*.35;
  nodes.SmilePivot.rotation.z=p.alarm*.10;nodes.SmilePivot.position.y+=p.alarm*.035-p.relief*.025;
  model.updateMatrixWorld(true);let lowest=Infinity;
  for(const mesh of footMeshes)lowest=Math.min(lowest,footBox.setFromObject(mesh).min.y);
  if(lowest<.015){root.position.y+=.015-lowest;model.updateMatrixWorld(true);}
  const specs=[[p.time>=.25&&p.time<3,p.leftProgress],[p.time>=7&&p.time<11.6,p.rightProgress],
   [p.time>=17.25&&p.time<21,p.handProgress],[p.time>=21,p.finalProgress]];
  badges.forEach((b,i)=>{const [visible,progress]=specs[i];b.group.visible=visible;b.arrow.rotation.z=progress>=1?0:-p.time*2;for(let j=0;j<16;j++){b.segments[j].visible=j<Math.max(1,Math.ceil(progress*16));b.segments[j].material.color.set(progress>=1?0x7fffb2:0xffc45b);}});
  renderer.render(scene,camera);return p;
 }
 function resize(width=canvas.clientWidth||360,height=canvas.clientHeight||640){
  renderer.setSize(width,height,false);const vertical=6.8;camera.left=-vertical*width/height/2;camera.right=-camera.left;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();
 }
 function dispose(){const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();renderer.dispose();}
 resize();render(0);return {render,resize,dispose};
}
