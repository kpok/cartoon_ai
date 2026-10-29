// Procedural digital rain: local geometry only, with deterministic timeline seeking.
export function createRobotStage(THREE,floorY){
 const group=new THREE.Group();group.name='Green_Code_Stage';group.position.y=floorY;
 let seed=72413;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshBasicMaterial({color:0x073d26}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.045,-25);group.add(floor);
 const pad=new THREE.Mesh(new THREE.CylinderGeometry(2.8,3,.08,64),new THREE.MeshLambertMaterial({color:0x176344}));pad.position.y=-.04;group.add(pad);
 for(const [r,color] of [[2.73,0x81ffba],[2.52,0x22dc71]]){
  const ring=new THREE.Mesh(new THREE.RingGeometry(r-.018,r,96),new THREE.MeshBasicMaterial({color,toneMapped:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.003;group.add(ring);
 }
 const grid=new THREE.GridHelper(80,80,0x48e68a,0x167346);grid.position.set(0,.002,-24);group.add(grid);
 // Seven-segment digits form luminous vertical streams without fonts or images.
 const segments=[[-.09,.15,.09,.15],[.09,.15,.09,0],[.09,0,.09,-.15],[-.09,-.15,.09,-.15],[-.09,0,-.09,-.15],[-.09,.15,-.09,0],[-.09,0,.09,0]];
 const digits=[[0,1,2,3,4,5],[1,2],[0,1,6,4,3],[0,1,6,2,3],[5,6,1,2],[0,5,6,2,3],[0,5,6,4,2,3],[0,1,2],[0,1,2,3,4,5,6],[0,1,2,3,5,6]];
 const streams=[];
 for(let layer=0;layer<8;layer++){
  const vertices=[],heads=[];
  for(let column=0;column<20;column++){
   const x=(column-9.5)*1.05+(random()-.5)*.4,z=-9-layer*1.6,offset=random()*20;
   for(let row=0;row<22;row++){
    const y=offset-row*.48;
    for(const index of digits[Math.floor(random()*10)]){
     const [ax,ay,bx,by]=segments[index];(row<2?heads:vertices).push(x+ax,y+ay,z,x+bx,y+by,z);
    }
   }
  }
  const stream=new THREE.Group();
  for(const [points,color,opacity] of [[vertices,0x29f27d,.36+layer*.025],[heads,0xbeffd7,.95]]){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
   stream.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity,toneMapped:false})));
  }
  group.add(stream);streams.push(stream);
 }
 return {group,update(time){for(let i=0;i<streams.length;i++)streams[i].position.y=8-((time*(.7+i*.075)+i*2)%24);}};
}
