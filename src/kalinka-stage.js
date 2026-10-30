import {kalinkaPose} from './robot-kalinka.js';

export function kalinkaCameraPose(time,aspect=1){
 const p=kalinkaPose(time),phase=p.time*Math.PI/12;
 const distance=Math.max(13.8,7.9/Math.max(.4,aspect));
 const yaw=.10*Math.sin(phase)+.035*Math.sin(phase*3);
 const target={x:p.root.x*.50,y:3.05+p.flight*.15,z:p.root.z*.5};
 return {target,position:{x:target.x+Math.sin(yaw)*distance,y:target.y+1.65+.35*Math.sin(phase),z:target.z+Math.cos(yaw)*distance}};
}

export async function createKalinkaStage(THREE){
 const group=new THREE.Group();group.name='Kalinka_Spatial_Square';
 const resources=[],materials=[],textures=[];
 const geometry=g=>{resources.push(g);return g;};
 const material=m=>{materials.push(m);return m;};
 function mesh(name,g,m,x,y,z){const o=new THREE.Mesh(g,m);o.name=name;o.position.set(x,y,z);group.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
 const base=material(new THREE.MeshStandardMaterial({color:0x777572,roughness:1}));
 const floor=mesh('Kalinka_Ground',geometry(new THREE.PlaneGeometry(100,100)),base,0,-.04,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 const stone=material(new THREE.MeshStandardMaterial({color:0x98958f,roughness:.92}));
 const rows=176,columns=88,paving=new THREE.InstancedMesh(geometry(new THREE.BoxGeometry(.43,.035,.28)),stone,rows*columns);
 paving.name='Kalinka_Individual_Paving_Stones';paving.receiveShadow=true;
 const matrix=new THREE.Matrix4(),color=new THREE.Color();let seed=97531,index=0;
 const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  matrix.makeScale(.94+random()*.06,1,.94+random()*.06);matrix.setPosition((col-columns/2)*.455+(row%2)*.2275,-.0175,(row-rows/2)*.30);
  paving.setMatrixAt(index,matrix);color.setHSL(.09+random()*.025,.06+random()*.07,.42+random()*.17);paving.setColorAt(index,color);index++;
 }group.add(paving);
 const metal=material(new THREE.MeshStandardMaterial({color:0x454c50,roughness:.65,metalness:.45}));
 const limestone=material(new THREE.MeshStandardMaterial({color:0xb9ac94,roughness:1}));
 const glass=material(new THREE.MeshStandardMaterial({color:0xffe5b4,roughness:.4,emissive:0xffcf7b,emissiveIntensity:.18}));
 for(const x of [-4.4,4.4]){
  mesh('Kalinka_Lamp_Base',geometry(new THREE.CylinderGeometry(.28,.4,.18,16)),metal,x,.09,-4.3);
  mesh('Kalinka_Lamp_Post',geometry(new THREE.CylinderGeometry(.055,.095,3.3,12)),metal,x,1.8,-4.3);
  mesh('Kalinka_Lantern',geometry(new THREE.SphereGeometry(.25,12,12)),glass,x,3.6,-4.3);
  mesh('Kalinka_Lantern_Cap',geometry(new THREE.ConeGeometry(.33,.24,8)),metal,x,3.9,-4.3);
 }
 for(const x of [-4.3,4.3])for(const z of [-1.5,2]){
  mesh('Kalinka_Square_Bollard',geometry(new THREE.CylinderGeometry(.16,.22,.65,16)),limestone,x,.325,z);
  mesh('Kalinka_Bollard_Top',geometry(new THREE.SphereGeometry(.19,12,8)),limestone,x,.67,z);
 }
 let backgroundReady=false;
 try{
  const texture=await new THREE.TextureLoader().loadAsync(new URL('../assets/kalinka/red-square-ai.png',import.meta.url).href);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
  const matte=mesh('Kalinka_Distant_AI_Matte',geometry(new THREE.PlaneGeometry(64,36)),material(new THREE.MeshBasicMaterial({map:texture,toneMapped:false})),0,3.6,-24);
  matte.castShadow=false;matte.receiveShadow=false;backgroundReady=true;
 }catch{
  // Keep the real floor and parallax props usable when the decorative image is unavailable.
  for(const [x,c] of [[-7,0xdcc7a3],[0,0xc88e77],[7,0xdcc7a3]])mesh('Kalinka_Backdrop_Fallback',geometry(new THREE.BoxGeometry(5,5,1)),material(new THREE.MeshStandardMaterial({color:c,roughness:1})),x,2.5,-18);
 }
 return {group,backgroundReady,update(){},dispose(){resources.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
