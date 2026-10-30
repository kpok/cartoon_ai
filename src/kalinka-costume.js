import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

// Surface-following puddles and drips, merged by material and anatomical pivot.
export function decorateKalinkaSlime(model,THREE){
 const materials=[new THREE.MeshPhysicalMaterial({color:0x19dce8,roughness:.16,metalness:.04,clearcoat:1,clearcoatRoughness:.09}),new THREE.MeshPhysicalMaterial({color:0xfa38c7,roughness:.18,metalness:.03,clearcoat:1,clearcoatRoughness:.1})];
 const sphere=new THREE.SphereGeometry(1,14,10),geometries=[],meshes=[];
 const up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),matrix=new THREE.Matrix4();
 function coat(parent,label,center,radii,angles,size){
  const batches=[[],[]];
  const surface=(theta,phi,offset=.035)=>new THREE.Vector3(center.x+(radii.x+offset)*Math.sin(theta)*Math.sin(phi),center.y+(radii.y+offset)*Math.cos(phi),center.z+(radii.z+offset)*Math.cos(theta)*Math.sin(phi));
  angles.forEach((angle,i)=>{
   const color=i%2,phi=.55+(i%3)*.16,start=surface(angle,phi),normal=start.clone().sub(center).divide(radii).normalize();
   q.setFromUnitVectors(up,normal);matrix.compose(start,q,new THREE.Vector3(size*(1.1+i%2*.3),size*.26,size*.9));batches[color].push(sphere.clone().applyMatrix4(matrix));
   const points=[];for(let j=0;j<7;j++){const u=j/6;points.push(surface(angle+Math.sin(u*Math.PI)*.09,phi+u*(.8+(i%3)*.14)));}
   batches[color].push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,size*.22,7,false));
   const end=points.at(-1);matrix.compose(end,new THREE.Quaternion(),new THREE.Vector3(size*.36,size*.52,size*.36));batches[color].push(sphere.clone().applyMatrix4(matrix));
  });
  for(let i=0;i<2;i++)if(batches[i].length){const geometry=mergeGeometries(batches[i],false);batches[i].forEach(g=>g.dispose());geometries.push(geometry);const mesh=new THREE.Mesh(geometry,materials[i]);mesh.name=`Kalinka_Slime_${label}_${i===0?'Cyan':'Pink'}`;mesh.userData.slimeRegion=label;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);meshes.push(mesh);}
 }
 function onShell(name,label,angles,size){const shell=model.getObjectByName(name);if(!shell)return;shell.updateMatrix();shell.geometry.computeBoundingBox();const b=shell.geometry.boundingBox.clone().applyMatrix4(shell.matrix),center=b.getCenter(new THREE.Vector3()),radii=b.getSize(new THREE.Vector3()).multiplyScalar(.5);coat(shell.parent,label,center,radii,angles,size);}
 const around=[0,.75,1.5,2.25,3,3.75,4.5,5.25];
 onShell('Chest_shell','Torso_All_Sides',around,.23);
 onShell('Rounded_head_shell','Head_Back',[1.45,1.95,2.5,3.05,3.65,4.2,4.8],.30);
 for(const side of ['Left','Right']){
  onShell(side+'UpperArm',side+'_Upper_Arm',around,.12);
  onShell(side+'Forearm',side+'_Forearm',around,.115);
  onShell(side+'_short_thigh',side+'_Thigh',around,.14);
  onShell(side+'_Kalinka_Boot_Shaft',side+'_Boot_Splash',[.5,2.5,4.2],.075);
 }
 coat(model.getObjectByName('DanceRoot'),'Waist',new THREE.Vector3(0,.02,-.04),new THREE.Vector3(.48,.17,.34),[.4,1.9,3.3,4.7],.11);
 sphere.dispose();return {meshes,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
