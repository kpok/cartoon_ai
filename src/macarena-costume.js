// Runtime fiesta clothes follow the existing articulated model, without modifying the source GLB.
export function decorateMacarena(model,THREE){
 const geometries=[],materials=[],textures=[];
 const material=(color,options={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,...options});materials.push(m);return m;};
 const teal=material(0x168f98),coral=material(0xf47770),hem=material(0xffa28d),white=material(0xebe6de),pink=material(0xf441bf),cyan=material(0x27e1e5,{emissive:0x127476,emissiveIntensity:.25}),yellow=material(0xffdc28),black=material(0x252533),lens=material(0x151e36,{roughness:.18,metalness:.3}),zip=material(0xd9d2e9,{metalness:.7,roughness:.22});
 const hologram=material(0xa991ef,{metalness:.76,roughness:.22});
 function mesh(parent,name,geometry,mat,x=0,y=0,z=0){geometries.push(geometry);const o=new THREE.Mesh(geometry,mat);o.name='Macarena_'+name;o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function oval(parent,name,mat,position,scale){const o=mesh(parent,name,new THREE.SphereGeometry(1,24,14),mat,...position);o.scale.set(...scale);return o;}
 function line(parent,name,mat,points,r=.014){return mesh(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(8,points.length*4),r,6,false),mat);}
 const torso=model.getObjectByName('TorsoPivot'),root=model.getObjectByName('DanceRoot');
 model.traverse(o=>{
  if(/_Kalinka_Boot_|Kalinka_Slime_(?:Torso|Waist|Left_(?:Upper_Arm|Forearm|Thigh|Boot)|Right_(?:Upper_Arm|Forearm|Thigh|Boot))/.test(o.name))o.visible=false;
 });
 // A generated fabric print keeps every motif local and works in both browser and Node tests.
 const size=256,pixels=new Uint8Array(size*size*4);
 for(let i=0;i<size*size;i++)pixels.set([20,143,153,255],i*4);
 const dot=(x,y,r,color)=>{for(let j=Math.max(0,Math.floor(y-r));j<=Math.min(size-1,y+r);j++)for(let i=Math.max(0,Math.floor(x-r));i<=Math.min(size-1,x+r);i++)if((i-x)**2+(j-y)**2<r*r)pixels.set([...color,255],(j*size+i)*4);};
 const stroke=(x1,y1,x2,y2,r,c)=>{const steps=Math.ceil(Math.hypot(x2-x1,y2-y1));for(let i=0;i<=steps;i++)dot(x1+(x2-x1)*i/steps,y1+(y2-y1)*i/steps,r,c);};
 for(const [x,y] of [[48,52],[170,152]]){
  const c=[255,87,180];for(let a=-15;a<=15;a++)dot(x+a,y,Math.sqrt(Math.max(0,1-a*a/225))*8,c);
  stroke(x+11,y,x+17,y-22,3,c);stroke(x+17,y-22,x+10,y-28,3,c);dot(x+7,y-28,5,c);stroke(x+4,y-28,x-3,y-25,2,[252,210,73]);
  stroke(x-3,y+7,x-3,y+30,1.5,c);stroke(x+3,y+7,x+13,y+21,1.5,c);stroke(x+13,y+21,x+7,y+29,1.5,c);
 }
 for(const [x,y] of [[165,42],[60,166]]){const c=[255,221,39];stroke(x+10,y-20,x-6,y+1,4,c);stroke(x-6,y+1,x+8,y-1,4,c);stroke(x+8,y-1,x-10,y+21,4,c);}
 const print=new THREE.DataTexture(pixels,size,size);print.colorSpace=THREE.SRGBColorSpace;print.wrapS=print.wrapT=THREE.RepeatWrapping;print.repeat.set(2,2);print.magFilter=THREE.LinearFilter;print.needsUpdate=true;textures.push(print);teal.map=print;teal.color.set(0xffffff);teal.side=THREE.DoubleSide;
 // Open-front shirt: cloth wraps the chest and back while the metal centre remains visible.
 const positions=[],uvs=[],indices=[],rows=8,columns=48;
 for(let row=0;row<=rows;row++){const v=row/rows,y=-.25+v*1.37,rx=.72+.24*Math.sin(v*Math.PI*.6),rz=.50+.07*Math.sin(v*Math.PI);for(let col=0;col<=columns;col++){const u=col/columns,a=.38+u*(Math.PI*2-.76);positions.push(Math.sin(a)*rx,y,Math.cos(a)*rz-.025);uvs.push(u,v);if(row<rows&&col<columns){const n=row*(columns+1)+col;indices.push(n,n+1,n+columns+1,n+1,n+columns+2,n+columns+1);}}}
 const jacket=new THREE.BufferGeometry();jacket.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));jacket.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));jacket.setIndex(indices);jacket.computeVertexNormals();mesh(torso,'Teal_Flamingo_Open_Shirt',jacket,teal);
 for(const sign of [-1,1]){
  const lapel=new THREE.Shape();lapel.moveTo(sign*.35,1.12);lapel.lineTo(sign*.12,.71);lapel.lineTo(sign*.49,.82);lapel.lineTo(sign*.58,1.02);lapel.closePath();mesh(torso,'Shirt_Collar',new THREE.ShapeGeometry(lapel),teal,0,0,.54);
  const side=sign<0?'Left':'Right',arm=model.getObjectByName(side+'ArmPivot'),elbow=model.getObjectByName(side+'ElbowPivot'),hip=model.getObjectByName(side+'HipPivot'),knee=model.getObjectByName(side+'KneePivot'),foot=model.getObjectByName(side+'FootPivot');
  const direction=elbow.position.clone().normalize(),sleeve=mesh(arm,side+'_Short_Sleeve',new THREE.CylinderGeometry(.37,.43,.38,24,1,true),teal);sleeve.position.copy(direction.clone().multiplyScalar(.17));sleeve.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().negate());
  // Shorts attach to each hip so knee flex does not stretch their fabric.
  const shorts=mesh(hip,side+'_Coral_Shorts',new THREE.CylinderGeometry(.34,.37,.49,24),coral,0,-.17,0);shorts.scale.z=1.04;
  const cuff=mesh(hip,side+'_Shorts_Cuff',new THREE.CylinderGeometry(.375,.375,.075,24,1,true),hem,0,-.405,0);cuff.scale.z=1.04;
  line(hip,side+'_Shorts_Stitch',hem,[[sign*.30,.03,.16],[sign*.34,-.19,.16],[sign*.35,-.36,.16]],.009);
  for(const o of knee.children)if(o.name===side+'_short_shin')o.visible=true;
  for(const o of foot.children)if(o.isMesh&&o.name!==side+'_ankle_joint')o.visible=false;
  // Sneakers have the same -0.24 sole plane as the original foot geometry.
  oval(foot,side+'_Sneaker_Sole',white,[0,-.18,.14],[.29,.06,.42]);
  oval(foot,side+'_Sneaker_Upper',white,[0,-.065,.12],[.272,.13,.375]);
  oval(foot,side+'_Sneaker_Heel_Pink',pink,[0,.005,-.11],[.265,.16,.16]);
  mesh(foot,side+'_Pink_Ankle_Collar',new THREE.CylinderGeometry(.19,.22,.16,24,1,true),pink,0,.10,-.06);
  const tongue=mesh(foot,side+'_Sneaker_Tongue',new THREE.BoxGeometry(.23,.065,.28),pink,0,.11,.12);tongue.rotation.x=-.18;
  for(let i=0;i<4;i++)line(foot,side+'_Yellow_Laces',yellow,[[-.12,.15-i*.008,.03+i*.068],[.12,.15-i*.008,.065+i*.068]],.012);
  for(const edge of [-1,1])line(foot,side+'_Cyan_Shoe_Stripe',cyan,[[edge*.22,-.05,-.15],[edge*.28,-.06,.02],[edge*.27,-.09,.25],[edge*.21,-.11,.42]],.025);
  line(foot,side+'_Sole_Cyan_Trim',cyan,[[-.23,-.165,.35],[0,-.165,.51],[.23,-.165,.35]],.013);
  // Small surface-bound beads replace stretched drips on the moving arm segments.
  for(const [pivot,shellName] of [[arm,side+'UpperArm'],[elbow,side+'Forearm']]){
   const shell=model.getObjectByName(shellName);shell.updateMatrix();shell.geometry.computeBoundingBox();const b=shell.geometry.boundingBox.clone().applyMatrix4(shell.matrix),centre=b.getCenter(new THREE.Vector3()),extent=b.getSize(new THREE.Vector3());
   for(let i=0;i<3;i++){const x=centre.x+(i-1)*Math.min(.09,extent.x*.18),y=centre.y+(i-1)*Math.min(.055,extent.y*.12),z=b.max.z+.009;const bead=oval(pivot,side+'_Bounded_Arm_Slime',i%2?cyan:pink,[x,y,z],[.055,.08,.025]);bead.userData.slimeRegion='Macarena_Surface_Arm';}
  }
 }
 // Shared waist and accessories remain readable in the small portrait composition.
 const waistband=mesh(root,'Coral_Shorts_Waist',new THREE.CylinderGeometry(.62,.65,.17,32),coral,0,.04,-.04);waistband.scale.z=.65;
 const belt=mesh(root,'Pouch_Belt',new THREE.CylinderGeometry(.655,.655,.095,32,1,true),black,0,.16,-.04);belt.scale.z=.66;
 oval(root,'Holographic_Waist_Pouch',hologram,[.08,.05,.43],[.38,.22,.13]);
 for(const [i,color] of [pink,cyan,yellow].entries())line(root,'Pouch_Iridescent_Band',color,[[-.23+i*.045,-.04,.53],[-.07+i*.06,.12,.56],[.15+i*.06,.18,.51]],.014);
 line(root,'Pouch_Zipper',zip,[[-.23,.15,.50],[.04,.20,.55],[.30,.15,.50]],.012);
 mesh(root,'Pouch_Buckle',new THREE.BoxGeometry(.11,.12,.06),black,0,.16,.42);
 const glasses=new THREE.Group();glasses.name='Macarena_Yellow_Hanging_Sunglasses';glasses.position.set(0,.60,.61);glasses.rotation.z=-.12;torso.add(glasses);
 for(const x of [-.13,.13]){const frame=mesh(glasses,'Sunglasses_Frame',new THREE.TorusGeometry(.115,.023,8,28),yellow,x,0,0);frame.scale.y=1.35;const eye=mesh(glasses,'Sunglasses_Lens',new THREE.CircleGeometry(.099,28),lens,x,0,.008);eye.scale.y=1.35;}
 line(glasses,'Sunglasses_Bridge',yellow,[[-.03,.03,0],[0,.06,0],[.03,.03,0]],.019);line(glasses,'Sunglasses_Arm',yellow,[[.23,.04,0],[.28,.15,-.02],[.22,.25,-.04]],.018);
 return {dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
