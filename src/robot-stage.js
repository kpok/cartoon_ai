// Original procedural scenery. All geometry stays local; no external textures or HDRI.
export function createRobotStage(THREE,floorY){
 const group=new THREE.Group();group.name='AI_Ruins_Stage';group.position.y=floorY;
 let seed=72413;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const steel=new THREE.MeshLambertMaterial({color:0x172d39}),dark=new THREE.MeshLambertMaterial({color:0x0b1722});
 const cyan=new THREE.MeshBasicMaterial({color:0x29dbe6,toneMapped:false}),pink=new THREE.MeshBasicMaterial({color:0xd72e91,toneMapped:false});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshBasicMaterial({color:0x08131c}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.045,-25);group.add(floor);
 const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.8,3,.08,64),steel);pad.position.y=-.04;group.add(pad);
 for(const [r,mat] of [[2.73,cyan],[2.52,pink]]){
  const ring=new THREE.Mesh(new THREE.RingGeometry(r-.018,r,96),mat);ring.rotation.x=-Math.PI/2;ring.position.y=.003;group.add(ring);
 }
 const dummy=new THREE.Object3D(),buildings=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),dark,42);
 const windows=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),cyan,126);
 for(let i=0;i<42;i++){
  const side=i%2?-1:1,x=side*(4.5+random()*20),z=-8-random()*35,h=3+random()*11,w=1+random()*2;
  dummy.position.set(x,h/2,z);dummy.rotation.set(0,(random()-.5)*.3,(random()-.5)*.16);dummy.scale.set(w,h,1+random()*2);dummy.updateMatrix();buildings.setMatrixAt(i,dummy.matrix);
  for(let j=0;j<3;j++){dummy.position.set(x+(j-1)*w*.22,h*(.35+random()*.4),z+1.7);dummy.rotation.set(0,0,0);dummy.scale.set(.07,.3+random()*.6,.04);dummy.updateMatrix();windows.setMatrixAt(i*3+j,dummy.matrix);}
 }
 group.add(buildings,windows);
 const rubble=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),steel,38);
 for(let i=0;i<38;i++){
  const sign=i%2?1:-1,size=.2+random()*.65;dummy.position.set(sign*(3.1+random()*8),size*.3,-2-random()*17);dummy.rotation.set(random(),random()*Math.PI,random());dummy.scale.set(size,size*.6,size*1.5);dummy.updateMatrix();rubble.setMatrixAt(i,dummy.matrix);
 }group.add(rubble);
 // Broken transmission gate, behind the dancer rather than across its silhouette.
 const gate=new THREE.Mesh(new THREE.TorusGeometry(5,.17,8,64,Math.PI*1.5),steel);gate.position.set(.8,5.5,-14);gate.rotation.z=-Math.PI/4;group.add(gate);
 const signal=new THREE.Mesh(new THREE.TorusGeometry(4.73,.035,6,64,Math.PI*1.25),cyan);signal.position.copy(gate.position);signal.position.z+=.2;signal.rotation.copy(gate.rotation);group.add(signal);
 const wires=[];
 for(let i=0;i<70;i++){
  const x=(random()-.5)*45,z=4-random()*46,length=1+random()*5;
  wires.push(x,.006,z,x,.006,z-length,x,.006,z-length,x+length*.4,.006,z-length);
 }
 const wireGeometry=new THREE.BufferGeometry();wireGeometry.setAttribute('position',new THREE.Float32BufferAttribute(wires,3));
 group.add(new THREE.LineSegments(wireGeometry,new THREE.LineBasicMaterial({color:0x1e8eaa,transparent:true,opacity:.4})));
 const particles=new Float32Array(100*3);
 for(let i=0;i<100;i++){particles[i*3]=(random()-.5)*34;particles[i*3+1]=.6+random()*10;particles[i*3+2]=-5-random()*25;}
 const sparksGeometry=new THREE.BufferGeometry();sparksGeometry.setAttribute('position',new THREE.BufferAttribute(particles,3));
 const sparks=new THREE.Points(sparksGeometry,new THREE.PointsMaterial({color:0xffad54,size:.035,transparent:true,opacity:.6,sizeAttenuation:true}));group.add(sparks);
 // A small damaged surveillance unit hangs over the ruined city.
 const drone=new THREE.Group();drone.position.set(-4,6.3,-10);
 const body=new THREE.Mesh(new THREE.IcosahedronGeometry(.42,0),steel);body.scale.set(1.5,.65,1);drone.add(body);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),pink);eye.position.z=.4;drone.add(eye);group.add(drone);
 return {group,update(time){sparks.position.y=.2*Math.sin(time*Math.PI/2.5);drone.position.y=6.3+.18*Math.sin(time*Math.PI/2);drone.rotation.z=.08*Math.sin(time*Math.PI/2);}};
}
