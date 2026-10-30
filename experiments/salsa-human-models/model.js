import * as THREE from '../../vendor/three.module.js';
import {referenceCamera} from './camera.js';
export const palette={dress:0x00624e,shirt:0x18253e,trousers:0x85858a};
const camera=new THREE.PerspectiveCamera(referenceCamera.fov,referenceCamera.aspect,referenceCamera.near,referenceCamera.far);
camera.position.set(...referenceCamera.position);camera.lookAt(...referenceCamera.target);camera.updateMatrixWorld();
// Measured reference landmarks set geometry placement, never camera or image pixels.
function point(x,y,z=0){const ray=new THREE.Vector3(x*2-1,1-y*2,.5).unproject(camera).sub(camera.position).normalize();return camera.position.clone().addScaledVector(ray,(z-camera.position.z)/ray.z);}
export const landmarks={womanHead:point(.347,.143).toArray(),manHead:point(.579,.096).toArray(),joinedHands:point(.576,.297,.27).toArray()};
export function createCouple(){
 const root=new THREE.Group();root.name='Detailed static salsa couple';
 const mat=(color,roughness=.65,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness,...extra});
 const ws=mat(0xc58c60,.55),ms=mat(0xd0a080,.56),emerald=mat(palette.dress,.43,{sheen:.8,sheenColor:new THREE.Color(0x5caa8a)}),navy=mat(palette.shirt,.76),gray=mat(palette.trousers,.82),black=mat(0x121313,.3),bronze=mat(0x9d5c30,.32,{metalness:.55}),hair=mat(0x20140d,.6),maleHair=mat(0x63462e,.6);
 const vec=p=>p.isVector3?p.clone():new THREE.Vector3(...p);
 function mesh(name,geometry,material,parent=root){const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function oval(name,p,s,m,parent=root){const o=mesh(name,new THREE.SphereGeometry(1,24,16),m,parent);o.position.copy(vec(p));o.scale.set(...s);return o;}
 function curve(name,points,r,m,parent=root){return mesh(name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(vec)),Math.max(12,points.length*5),r,6,false),m,parent);}
 // Continuous elliptical rings replace intersecting cylinder/sphere limb joints.
 function sweep(name,knots,m,depth=1,sides=28){
  const path=new THREE.CatmullRomCurve3(knots.map(k=>vec(k[0]))),rows=(knots.length-1)*10,frames=path.computeFrenetFrames((knots.length-1)*10,false),vertices=[],indices=[];
  for(let j=0;j<=rows;j++){const t=j/rows,c=path.getPoint(t);const u=t*(knots.length-1),i=Math.min(knots.length-2,Math.floor(u)),f=u-i,requestedRadius=THREE.MathUtils.lerp(knots[i][1],knots[i+1][1],f),before=Math.max(0,t-1/rows),after=Math.min(1,t+1/rows),turn=path.getTangent(before).angleTo(path.getTangent(after)),bendLimit=turn>1e-5?.5*path.getPoint(before).distanceTo(path.getPoint(after))/turn:Infinity,r=Math.min(requestedRadius,bendLimit);
   for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,fold=name.includes('trouser')?1+.018*Math.cos(a*8+t*22):1;const v=frames.normals[j].clone().multiplyScalar(Math.cos(a)*r*fold).addScaledVector(frames.binormals[j],-Math.sin(a)*r*depth).add(c);vertices.push(v.x,v.y,v.z);}}
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const i=j*(sides+1)+k;indices.push(i,i+sides+1,i+1,i+1,i+sides+1,i+sides+2);}
  // End caps are fans, not separate spheres with coplanar joint seams.
  for(const j of [0,rows]){const c=path.getPoint(j/rows),center=vertices.length/3;vertices.push(c.x,c.y,c.z);for(let k=0;k<sides;k++){const i=j*(sides+1)+k;if(j===0)indices.push(center,i,i+1);else indices.push(center,i+1,i);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const o=mesh(name,g,m);o.userData={surface:'sweep',rows,sides};return o;
 }
 function torso(name,anchors,m){const v=[],ix=[],sides=48,rings=[];const path=new THREE.CatmullRomCurve3(anchors.map(r=>r[0]));for(let j=0;j<=60;j++){const u=j/60*(anchors.length-1),i=Math.min(anchors.length-2,Math.floor(u)),f=u-i;rings.push([path.getPoint(j/60),THREE.MathUtils.lerp(anchors[i][1],anchors[i+1][1],f),THREE.MathUtils.lerp(anchors[i][2],anchors[i+1][2],f)]);}
  for(const [c,rx,rz] of rings)for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;const fold=1+.012*Math.sin(a*9+c.y*38)+.009*Math.sin(a*5-c.y*51);v.push(c.x+Math.cos(a)*rx*fold,c.y,c.z+Math.sin(a)*rz*fold);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const k=j*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const material=m.clone();material.side=THREE.DoubleSide;return mesh(name,g,material);
 }
 function head(name,p,skin,hairMaterial,female){
  const g=new THREE.Group();g.name=name+' head';g.position.copy(p);g.rotation.set(0,female?.24:-.18,female?-.10:.12);root.add(g);
  const rings=[[-.135,.025,.038],[-.117,.058,.060],[-.085,.079,.073],[-.04,.092,.083],[.01,.101,.086],[.06,.100,.084],[.105,.085,.071],[.13,.04,.04]];
  const v=[],ix=[],sides=56;
  for(const [y,rx,rz] of rings)for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,cheek=1+.035*Math.cos(a*2);v.push(Math.cos(a)*rx*cheek,y,Math.sin(a)*rz);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const k=j*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  for(const row of [0,rings.length-1]){const index=v.length/3;v.push(0,rings[row][0],0);for(let i=0;i<sides;i++){const k=row*(sides+1)+i;if(row===0)ix.push(index,k,k+1);else ix.push(index,k+1,k);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();mesh(name+' shaped face',geo,skin,g);
  oval(name+' nose bridge',[0,-.007,.085],[.014,.033,.015],skin,g);oval(name+' nose tip',[0,-.031,.103],[.018,.013,.017],skin,g);
  for(const x of [-1,1]){oval(name+' nose wing',[x*.014,-.034,.097],[.011,.010,.012],skin,g);oval(name+' nostril',[x*.012,-.04,.105],[.005,.003,.004],mat(0x6b3d29),g);
   oval(name+' ear',[x*.10,-.006,-.004],[.018,.030,.016],skin,g);oval(name+' ear concha',[x*.109,-.006,.008],[.006,.018,.006],mat(female?0x9c6245:0xa96e55),g);
   const ex=x*.041;oval(name+' eye',[ex,.018,.078],[.023,.009,.011],mat(0xe4d4c1,.38),g);oval(name+' iris',[ex,.018,.088],[.009,.008,.004],mat(0x4a3321,.3),g);oval(name+' pupil',[ex,.018,.091],[.004,.005,.002],black,g);oval(name+' eye highlight',[ex-.003,.021,.093],[.002,.002,.001],mat(0xffffff,.1),g);
   curve(name+' upper eyelid',[[ex-.024,.018,.079],[ex,.029,.086],[ex+.024,.018,.079]],.003,skin,g);curve(name+' eyebrow',[[ex-.026,.046,.078],[ex,.053,.082],[ex+.025,.046,.077]],female?.004:.005,hairMaterial,g);
   if(female){curve(name+' gold earring',[[x*.105,-.026,.015],[x*.107,-.065,.016],[x*.097,-.071,.019]],.0025,bronze,g);}}
  const lip=mat(female?0x9d4640:0xa06a59,.5);
  curve(name+' smile upper',[[-.035,-.064,.070],[0,-.07,.085],[.035,-.057,.069]],.004,lip,g);
  curve(name+' smile lower',[[-.032,-.066,.071],[0,-.079,.082],[.032,-.059,.07]],.004,lip,g);
  oval(name+' visible teeth',[0,-.071,.080],[.025,.005,.003],mat(0xe7d8c2,.4),g);
  oval(name+' scalp',[0,.104,-.017],[.103,.048,.081],hairMaterial,g);
  if(female)oval(name+' back hair volume',[0,-.10,-.07],[.107,.19,.067],hairMaterial,g);
  const count=female?70:60;
  for(let i=0;i<count;i++){const a=i*2.39996,seed=(Math.sin(i*7.13)+1)/2;
   if(female){const side=Math.cos(a),back=Math.sin(a);if(back>.55&&Math.abs(side)<.75)continue;const points=[];for(let j=0;j<8;j++){const t=j/7;points.push([side*(.085+t*.055)+Math.sin(t*15+i)*.013,.12-t*(.38+seed*.08),-.025-Math.abs(back)*.045+Math.sin(t*13+i)*.018]);}curve(name+' wavy hair lock '+i,points,i%3===0?.010:.006,hairMaterial,g);}
   else{const x=Math.cos(a)*.087,z=Math.sin(a)*.062;curve(name+' curled quiff '+i,[[x,.105,z-.02],[x-.025,.13+seed*.033,z+.009],[x+.004,.139+seed*.025,z+.026],[x+.017,.11+seed*.013,z+.017]],.007,maleHair,g);}}
 }
 const wh=point(.347,.143),mh=point(.579,.096);head('Woman',wh,ws,hair,true);head('Man',mh,ms,maleHair,false);
 sweep('Woman neck',[[point(.353,.239),.044],[point(.350,.190),.038],[point(.347,.165),.043]],ws,.9);
 sweep('Man neck',[[point(.607,.218),.053],[point(.595,.167),.044],[point(.586,.133),.049]],ms,.9);
 torso('Fitted navy shirt',[[point(.665,.369,-.015),.205,.095],[point(.672,.334,-.02),.20,.103],[point(.669,.287,-.02),.22,.115],[point(.650,.23,-.02),.235,.11],[point(.621,.195,-.02),.17,.085],[point(.605,.185,-.015),.06,.05]],navy);
 torso('Woman upper torso',[[point(.367,.282,-.01),.125,.08],[point(.349,.251,-.01),.12,.075],[point(.349,.230,-.01),.075,.055]],ws);
 torso('Emerald fitted bodice',[[point(.365,.39),.145,.09],[point(.395,.36),.13,.083],[point(.395,.315),.125,.09],[point(.376,.278),.16,.105],[point(.355,.255),.14,.09]],emerald);
 oval('Woman upper shoulder',point(.327,.239,-.01),[.07,.065,.06],ws);
 for(const [a,b,c] of [[point(.31,.223),point(.305,.25,.015),point(.333,.284,.09)],[point(.374,.235),point(.41,.269,.08),point(.435,.29,.095)]])curve('Dress shoulder strap',[a,b,c],.007,emerald);
 const shirtSeam=mat(0x28374c,.8);
 curve('Shirt front placket',[point(.616,.202,.10),point(.623,.28,.11),point(.626,.362,.092)],.008,shirtSeam);
 for(let i=0;i<6;i++)oval('Shirt button',point(.627,.235+i*.023,.116),[.004,.004,.002],mat(0xb9ad95));
 function patch(name,points,m){const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p[0],p[1])));const o=mesh(name,new THREE.ShapeGeometry(shape),m);return o;}
 for(const side of [-1,1]){const c=point(.605+side*.033,.196,.10);const collar=patch('Pointed shirt collar',[[-.055,.03],[.045,0],[.02,-.095],[-.028,-.025]],navy);collar.position.copy(c);collar.rotation.z=side*.5;}
 // Smooth anatomical leg profiles and contiguous trouser volumes.
 const legs=[
 ['Woman back',[[.335,.39,.00,.09],[.359,.59,.025,.07],[.300,.705,.04,.048],[.275,.767,.04,.029]],ws],
 ['Woman front',[[.405,.385,.10,.095],[.437,.585,.13,.075],[.430,.718,.15,.05],[.420,.802,.15,.029]],ws],
 ['Man back trouser',[[.626,.397,-.035,.102],[.615,.526,-.015,.089],[.656,.66,-.01,.077],[.719,.786,.01,.065]],gray],
 ['Man front trouser',[[.711,.399,.025,.105],[.698,.546,.03,.093],[.746,.69,.04,.082],[.790,.811,.065,.067]],gray]];
 torso('Trouser pelvis',[[point(.672,.418),.18,.095],[point(.665,.382),.20,.097],[point(.664,.365),.20,.096]],gray);
 for(const [name,points,m] of legs){sweep(name,points.map(([x,y,z,r])=>[point(x,y,z),r]),m,.88);const last=points.at(-1),p=point(last[0],last[1],last[2]);
  if(name.startsWith('Man')){const shoe=oval(name+' leather derby',p.clone().add(new THREE.Vector3(-.035,-.030,.058)),[.11,.048,.18],black);shoe.rotation.y=-.65;const sole=oval(name+' layered sole',p.clone().add(new THREE.Vector3(-.035,-.062,.058)),[.113,.014,.183],mat(0x24201d));sole.rotation.y=-.65;
   for(let i=0;i<5;i++)curve(name+' lace '+i,[p.clone().add(new THREE.Vector3(-.035,-.005,.03+i*.015)),p.clone().add(new THREE.Vector3(.015,-.008,.04+i*.015))],.0025,mat(0x5a534b));
   const seam=points.map(([x,y,z])=>point(x+.025,y,z+.055));curve(name+' outer seam',seam,.0016,mat(0x676669));
  }else{const foot=p.clone().add(new THREE.Vector3(.012,-.075,.060));sweep(name+' ankle',[[p,.029],[p.clone().add(new THREE.Vector3(0,-.04,.015)),.026],[foot,.026]],ws,.9);oval(name+' foot',foot,[.044,.033,.13],ws);oval(name+' sandal sole',foot.clone().add(new THREE.Vector3(0,-.028,.01)),[.05,.009,.14],bronze);curve(name+' stiletto heel',[foot.clone().add(new THREE.Vector3(0,-.025,-.065)),new THREE.Vector3(foot.x-.008,.012,foot.z-.064)],.006,bronze);
   for(const dz of [-.035,.045,.085])curve(name+' sandal strap',[foot.clone().add(new THREE.Vector3(-.043,0,dz)),foot.clone().add(new THREE.Vector3(0,.035,dz+.012)),foot.clone().add(new THREE.Vector3(.043,0,dz+.024))],.004,bronze);
   for(let i=0;i<5;i++)oval(name+' toe '+i,foot.clone().add(new THREE.Vector3(-.027+i*.014,-.002,.118-i*.004)),[.008,.012,.019],ws);
  }}
 // Overlapping ruffle panels are real double-sided surfaces around the body.
 function skirt(name,top,bottom,spread,phase){const vertices=[],indices=[],rows=24,cols=96;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,a=1.20+i/cols*(Math.PI*2-.70),wave=Math.sin(a*7+t*8+phase),r=.15+t*spread+wave*.020*t;const center=point(.351-.015*t,top+(bottom-top)*t,-.01);vertices.push(center.x+Math.cos(a)*r,center.y+.023*wave*t,center.z+Math.sin(a)*r*.68);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*(cols+1)+i;indices.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const silk=emerald.clone();silk.side=THREE.DoubleSide;mesh(name,g,silk);}
 skirt('Silk skirt body',.365,.588,.28,0);skirt('Upper cascading ruffle',.385,.477,.10,1);skirt('Middle cascading ruffle',.445,.544,.20,2);skirt('Lower cascading ruffle',.510,.601,.27,3);
 const arms=[
 ['Woman joined',[[.327,.239,.05,.061],[.359,.283,.09,.055],[.420,.333,.16,.044],[.500,.318,.23,.034],[.558,.304,.27,.025]],ws],
 ['Woman shoulder',[[.389,.253,-.03,.053],[.462,.265,-.02,.046],[.508,.219,.005,.035],[.563,.182,.015,.024]],ws],
 ['Man joined',[[.748,.224,.015,.080],[.767,.278,.06,.063],[.758,.309,.13,.050],[.735,.322,.17,.043],[.673,.315,.22,.041],[.593,.301,.27,.029]],ms],
 ['Man back',[[.543,.229,-.09,.074],[.513,.289,-.11,.063],[.468,.310,-.12,.048],[.438,.337,-.09,.030]],ms]];
 function hand(name,p,skin,angle){const g=new THREE.Group();g.position.copy(p);g.rotation.z=angle;root.add(g);oval(name+' palm',[0,0,0],[.038,.048,.023],skin,g);
  for(let i=0;i<4;i++){const x=-.026+i*.016,len=.043+(i===1?.012:0);curve(name+' bent finger '+i,[[x,-.025,.005],[x,-.045,.020],[x,-len,.04],[x,-len+.01,.052]],.007,skin,g);oval(name+' fingernail '+i,[x,-len+.008,.057],[.005,.007,.0015],mat(0xd8af90),g);}
  curve(name+' thumb',[[.028,.007,.013],[.046,-.01,.032],[.032,-.027,.049]],.009,skin,g);}
 for(const [name,pts,skin] of arms){sweep(name+' arm',pts.map(([x,y,z,r])=>[point(x,y,z),r]),skin,.9);hand(name,point(...pts.at(-1).slice(0,3)),skin,name==='Woman joined'?-.7:.65);
  if(name.startsWith('Man')){const portion=pts.slice(0,3).map(([x,y,z,r])=>[point(x,y,z),r+.006]);sweep(name+' rolled sleeve',portion,navy,.95);}}
 for(let i=0;i<6;i++){const y=.27+i*.013;curve('Bodice fabric gathering '+i,[point(.335,y,.073),point(.387,y+.01,.101),point(.435,y-.004,.071)],.0018,mat(0x085b49));}
 root.userData={landmarks,palette,static:true,revision:'continuous-anatomy-and-clothing-v2'};return root;
}
