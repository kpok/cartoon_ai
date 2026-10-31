import {MarchingCubes} from './marching.js';
import {mergeVertices} from '../../vendor/BufferGeometryUtils.js';
import * as THREE from '../../vendor/three.module.js';
import {referenceCamera} from './camera.js';
export const palette={dress:0x00624e,shirt:0x0c153b,trousers:0x9397af};
const camera=new THREE.PerspectiveCamera(referenceCamera.fov,referenceCamera.aspect,referenceCamera.near,referenceCamera.far);
camera.position.set(...referenceCamera.position);camera.lookAt(...referenceCamera.target);camera.updateMatrixWorld();
// Measured reference landmarks set geometry placement, never camera or image pixels.
function point(x,y,z=0){const ray=new THREE.Vector3(x*2-1,1-y*2,.5).unproject(camera).sub(camera.position).normalize();return camera.position.clone().addScaledVector(ray,(z-camera.position.z)/ray.z);}
export const landmarks={womanHead:point(.347,.143).toArray(),manHead:point(.579,.096).toArray(),joinedHands:point(.576,.297,.27).toArray()};
export function createCouple(){
 const root=new THREE.Group();root.name='Detailed static salsa couple';
 const mat=(color,roughness=.65,extra={})=>new THREE.MeshPhysicalMaterial({color,roughness,...extra});
 const ws=mat(0xc58c60,.55),ms=mat(0xd0a080,.56),emerald=mat(palette.dress,.43,{sheen:.8,sheenColor:new THREE.Color(0x5caa8a)}),navy=mat(palette.shirt,.80,{specularIntensity:.35}),gray=mat(palette.trousers,.82),black=mat(0x121313,.3),bronze=mat(0x9d5c30,.32,{metalness:.55}),hair=mat(0x20140d,.6),maleHair=mat(0x63462e,.6);
 const vec=p=>p.isVector3?p.clone():new THREE.Vector3(...p);
 function mesh(name,geometry,material,parent=root){const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function oval(name,p,s,m,parent=root){const o=mesh(name,new THREE.SphereGeometry(1,24,16),m,parent);o.position.copy(vec(p));o.scale.set(...s);return o;}
 function curve(name,points,r,m,parent=root){return mesh(name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(vec)),Math.max(12,points.length*5),r,6,false),m,parent);}
 // Continuous elliptical rings replace intersecting cylinder/sphere limb joints.
 function sweep(name,knots,m,depth=1,sides=28){
  const path=new THREE.CatmullRomCurve3(knots.map(k=>vec(k[0]))),rows=(knots.length-1)*10,frames=path.computeFrenetFrames((knots.length-1)*10,false),vertices=[],indices=[];
  for(let j=0;j<=rows;j++){const t=j/rows,c=path.getPoint(t);const u=t*(knots.length-1),i=Math.min(knots.length-2,Math.floor(u)),f=u-i,requestedRadius=THREE.MathUtils.lerp(knots[i][1],knots[i+1][1],f),before=Math.max(0,t-1/rows),after=Math.min(1,t+1/rows),turn=path.getTangent(before).angleTo(path.getTangent(after)),bendLimit=turn>1e-5?.5*path.getPoint(before).distanceTo(path.getPoint(after))/turn:Infinity,r=Math.min(requestedRadius,bendLimit);
   for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2,fold=name.includes('trouser')?1+.018*Math.cos(a*8+t*22)+.055*Math.exp(-(((t-.36)/.16)**2))*Math.cos(a*2+t*65):1;const v=frames.normals[j].clone().multiplyScalar(Math.cos(a)*r*fold).addScaledVector(frames.binormals[j],-Math.sin(a)*r*depth).add(c);vertices.push(v.x,v.y,v.z);}}
  for(let j=0;j<rows;j++)for(let k=0;k<sides;k++){const i=j*(sides+1)+k;indices.push(i,i+sides+1,i+1,i+1,i+sides+1,i+sides+2);}
  // End caps are fans, not separate spheres with coplanar joint seams.
  for(const j of [0,rows]){const c=path.getPoint(j/rows),center=vertices.length/3;vertices.push(c.x,c.y,c.z);for(let k=0;k<sides;k++){const i=j*(sides+1)+k;if(j===0)indices.push(center,i,i+1);else indices.push(center,i+1,i);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const o=mesh(name,g,m);o.userData={surface:'sweep',rows,sides};return o;
 }
 function torso(name,anchors,m){const v=[],ix=[],sides=48,rings=[];const path=new THREE.CatmullRomCurve3(anchors.map(r=>r[0])),profile=new THREE.CatmullRomCurve3(anchors.map(r=>new THREE.Vector3(r[1],r[2],0)));for(let j=0;j<=60;j++){const u=j/60*(anchors.length-1),i=Math.min(anchors.length-2,Math.floor(u)),f=u-i;const radius=profile.getPoint(j/60);rings.push([path.getPoint(j/60),radius.x,radius.y]);}
  for(const [row,[c,rx,rz]] of rings.entries())for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;const fold=1+.012*Math.sin(a*9+c.y*38)+.009*Math.sin(a*5-c.y*51);const neckline=name==='Emerald fitted bodice'?.07*Math.max(0,Math.sin(a))**4*(row/60)**12:0;v.push(c.x+Math.cos(a)*rx*fold,c.y-neckline,c.z+Math.sin(a)*rz*fold);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const k=j*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const material=m.clone();material.side=THREE.DoubleSide;return mesh(name,g,material);
 }
 function head(name,p,skin,hairMaterial,female){
  const g=new THREE.Group();g.name=name+' head';g.position.copy(p);g.rotation.set(0,female?.42:-.18,female?.22:.12);root.add(g);
  // The neck and face share one continuous skin mesh; no detached cylinder/cap under the jaw.
  const anchors=[[-.36,.065,.060,-.025],[-.27,.046,.047,-.025],[-.19,.043,.048,-.020],[-.145,.047,.052,-.008],[-.125,.054,.059,0],[-.095,.076,.071,0],[-.04,.092,.083,0],[.01,.101,.086,0],[.06,.100,.084,0],[.105,.085,.071,0],[.135,.025,.025,0]];
  const profile=new THREE.CatmullRomCurve3(anchors.map(r=>new THREE.Vector3(r[1],r[2],r[3]))),heights=new THREE.CatmullRomCurve3(anchors.map(r=>new THREE.Vector3(r[0],0,0))),rings=[];
  for(let i=0;i<=88;i++){const t=i/88,u=t*(anchors.length-1),k=Math.min(anchors.length-2,Math.floor(u)),f=u-k,r=profile.getPoint(t);rings.push([heights.getPoint(t).x,r.x,r.y,r.z]);}
  const v=[],ix=[],sides=56;
  for(const [y,rx,rz,cz] of rings)for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,cheek=1+.035*Math.cos(a*2);v.push(Math.cos(a)*rx*cheek,y,cz+Math.sin(a)*rz);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const k=j*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  for(const row of [0,rings.length-1]){const index=v.length/3;v.push(0,rings[row][0],rings[row][3]);for(let i=0;i<sides;i++){const k=row*(sides+1)+i;if(row===0)ix.push(index,k,k+1);else ix.push(index,k+1,k);}}
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
  oval(name+' visible teeth',[0,-.071,.080],[.029,.007,.003],mat(0xeadbc5,.4),g);
  oval(name+' scalp',[0,.104,-.017],[.103,.048,.081],hairMaterial,g);
  if(female){oval(name+' back hair volume',[-.025,-.12,-.075],[.135,.225,.078],hairMaterial,g);oval(name+' flowing hair volume',[-.075,-.20,-.06],[.115,.18,.065],hairMaterial,g);}else oval(name+' swept hair volume',[-.01,.125,-.016],[.102,.062,.075],hairMaterial,g);
  const count=female?70:60;
  for(let i=0;i<count;i++){const a=i*2.39996,seed=(Math.sin(i*7.13)+1)/2;
   if(female){const side=Math.cos(a),back=Math.sin(a);if(back>.55&&Math.abs(side)<.75)continue;const points=[];for(let j=0;j<8;j++){const t=j/7;points.push([side*(.085+t*(side<0?.15:.06))+Math.sin(t*15+i)*.019,.12-t*(.43+seed*.10),-.025-Math.abs(back)*.045+Math.sin(t*13+i)*.018]);}curve(name+' wavy hair lock '+i,points,i%3===0?.0045:.0030,hairMaterial,g);}
   else{const x=Math.cos(a)*.087,z=Math.sin(a)*.062,points=[];for(let j=0;j<=8;j++){const t=j/8,angle=t*Math.PI*2*(.8+seed*.4)+i*.21;points.push([x-.025*t+.012*Math.cos(angle),.10+.055*Math.sin(Math.PI*t)+seed*.025,z-.02+.018*Math.sin(angle)+.02*t]);}curve(name+' tousled curl '+i,points,.0028+seed*.0018,i%5===0?mat(0x795435,.6):maleHair,g);}}
 }
 const wh=point(.347,.143),mh=point(.579,.096);head('Woman',wh,ws,hair,true);head('Man',mh,ms,maleHair,false);

 torso('Fitted navy shirt',[[point(.680,.369,-.015),.18,.095],[point(.690,.334,-.02),.185,.103],[point(.690,.287,-.02),.21,.115],[point(.650,.23,-.02),.235,.11],[point(.621,.195,-.02),.17,.085],[point(.605,.185,-.015),.06,.05]],navy);
 torso('Woman upper torso',[[point(.367,.282,-.01),.125,.08],[point(.349,.251,-.01),.12,.075],[point(.349,.230,-.01),.075,.055]],ws);
 torso('Emerald fitted bodice',[[point(.365,.39),.145,.09],[point(.395,.36),.13,.083],[point(.395,.315),.125,.09],[point(.376,.278),.16,.105],[point(.355,.255),.14,.09]],emerald);
 oval('Woman upper shoulder',point(.327,.239,.05),[.062,.062,.062],ws);
 for(const [a,b,c] of [[point(.31,.223),point(.305,.25,.015),point(.333,.284,.09)],[point(.374,.235),point(.41,.269,.08),point(.435,.29,.095)]])curve('Dress shoulder strap',[a,b,c],.007,emerald);
 const shirtSeam=mat(0x28374c,.8);
 curve('Shirt front placket',[point(.602,.202,.115),point(.604,.28,.12),point(.613,.362,.105)],.008,shirtSeam);
 for(let i=0;i<6;i++)oval('Shirt button',point(.604+i*.0016,.235+i*.023,.13),[.004,.004,.002],mat(0xb9ad95));
 function patch(name,points,m){const shape=new THREE.Shape(points.map(p=>new THREE.Vector2(p[0],p[1])));const o=mesh(name,new THREE.ShapeGeometry(shape),m);return o;}
 for(const side of [-1,1]){const c=point(.605+side*.033,.196,.10);const collar=patch('Pointed shirt collar',[[-.055,.03],[.045,0],[.02,-.095],[-.028,-.025]],navy);collar.position.copy(c);collar.rotation.z=side*.5;}
 // Smooth anatomical leg profiles and contiguous trouser volumes.
 const legs=[
 ['Woman back',[[.335,.39,.00,.09],[.359,.59,.025,.07],[.300,.705,.04,.048],[.275,.767,.04,.029]],ws],
 ['Woman front',[[.387,.38,.015,.055],[.418,.490,.12,.093],[.447,.609,.13,.073],[.430,.718,.15,.05],[.420,.802,.15,.029]],ws],
 ['Man back trouser',[[.640,.374,-.08,.070],[.626,.414,-.10,.102],[.615,.526,-.08,.089],[.656,.66,-.075,.077],[.719,.786,-.07,.065]],gray],
 ['Man front trouser',[[.710,.372,.020,.070],[.711,.418,.025,.105],[.698,.546,.03,.093],[.746,.69,.04,.082],[.790,.811,.065,.067]],gray]];
 torso('Trouser pelvis',[[point(.680,.438),.09,.07],[point(.680,.413),.15,.095],[point(.680,.382),.18,.097],[point(.680,.365),.18,.096]],gray);
 for(const [name,points,m] of legs){sweep(name,points.map(([x,y,z,r])=>[point(x,y,z),r]),m,.88);const last=points.at(-1),p=point(last[0],last[1],last[2]);
  if(name.startsWith('Man')){const shoe=oval(name+' leather derby',p.clone().add(new THREE.Vector3(-.035,-.030,.058)),[.095,.055,.17],black);shoe.rotation.y=-.65;const sole=oval(name+' layered sole',p.clone().add(new THREE.Vector3(-.035,-.062,.058)),[.098,.014,.173],mat(0x24201d));sole.rotation.y=-.65;
   shoe.updateMatrixWorld(true);for(let i=0;i<5;i++){const z=-.06+i*.018,y=.055*Math.sqrt(1-(.028/.095)**2-(z/.17)**2)+.002;curve(name+' visible lace '+i,[shoe.localToWorld(new THREE.Vector3(-.028/.095,y/.055,z/.17)),shoe.localToWorld(new THREE.Vector3(0,(y+.005)/.055,(z+.005)/.17)),shoe.localToWorld(new THREE.Vector3(.028/.095,y/.055,z/.17))],.0018,mat(0x3b3430));}

  }else{const foot=p.clone().add(new THREE.Vector3(.012,-.075,.060));sweep(name+' ankle',[[p,.029],[p.clone().add(new THREE.Vector3(0,-.04,.015)),.026],[foot,.026]],ws,.9);oval(name+' foot',foot,[.044,.033,.13],ws);oval(name+' sandal sole',foot.clone().add(new THREE.Vector3(0,-.028,.01)),[.05,.009,.14],bronze);curve(name+' stiletto heel',[foot.clone().add(new THREE.Vector3(0,-.025,-.065)),new THREE.Vector3(foot.x-.008,.012,foot.z-.064)],.006,bronze);
   for(const dz of [-.035,.045,.085])curve(name+' sandal strap',[foot.clone().add(new THREE.Vector3(-.043,0,dz)),foot.clone().add(new THREE.Vector3(0,.035,dz+.012)),foot.clone().add(new THREE.Vector3(.043,0,dz+.024))],.004,bronze);
   for(let i=0;i<5;i++)oval(name+' toe '+i,foot.clone().add(new THREE.Vector3(-.027+i*.014,-.002,.118-i*.004)),[.008,.012,.019],ws);
  }}
 // Merge the pelvis and both trouser legs into a single closed static surface.
 // Only the result is exported; the marching field and intersecting construction lofts are discarded.
 const construction=root.children.filter(o=>o.isMesh&&(o.name==='Trouser pelvis'||/^Man (back|front) trouser$/.test(o.name)));
 const bounds=new THREE.Box3();for(const o of construction)bounds.expandByObject(o);bounds.expandByScalar(.065);
 const center=bounds.getCenter(new THREE.Vector3()),half=bounds.getSize(new THREE.Vector3()).multiplyScalar(.5),resolution=64;
 const segments=[];
 for(const [name,points] of legs.filter(row=>row[0].startsWith('Man'))){const path=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>point(x,y,z)));let previous=path.getPoint(0);
  const radius=t=>{const u=t*(points.length-1),i=Math.min(points.length-2,Math.floor(u));return THREE.MathUtils.lerp(points[i][3],points[i+1][3],u-i);};
  for(let i=1;i<=32;i++){const t=i/32,p=path.getPoint(t),a=previous,dx=p.x-a.x,dy=p.y-a.y,dz=(p.z-a.z)/.88;segments.push({leg:name.includes('back')?0:1,endY:path.getPoint(1).y,x:a.x,y:a.y,z:a.z/.88,dx,dy,dz,length2:dx*dx+dy*dy+dz*dz,r0:radius((i-1)/32),r1:radius(t)});previous=p;}}
 const pelvis=point(.680,.390,-.025),waist=point(.680,.367).y;
 const smoothMin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
 const field=new MarchingCubes(resolution,gray,false,false,50000);field.isolation=0;
 for(let z=0;z<resolution;z++)for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
  const px=center.x+(x/(resolution/2)-1)*half.x,py=center.y+(y/(resolution/2)-1)*half.y,pz=center.z+(z/(resolution/2)-1)*half.z;
  const ex=(px-pelvis.x)/.18,ey=(py-pelvis.y)/.105,ez=(pz-pelvis.z)/.075;let distance=(Math.sqrt(ex*ex+ey*ey+ez**4)-1)*.10;
  const legDistances=[Infinity,Infinity];for(const s of segments){const ax=px-s.x,ay=py-s.y,az=pz/.88-s.z,t=THREE.MathUtils.clamp((ax*s.dx+ay*s.dy+az*s.dz)/s.length2,0,1),dx=ax-t*s.dx,dy=ay-t*s.dy,dz=az-t*s.dz;const d=Math.max(Math.sqrt(dx*dx+dy*dy+dz*dz)-THREE.MathUtils.lerp(s.r0,s.r1,t),s.endY-py);legDistances[s.leg]=Math.min(legDistances[s.leg],d);}distance=smoothMin(distance,smoothMin(legDistances[0],legDistances[1],.006),.012);
  distance=Math.max(distance,py-waist);field.field[z*resolution*resolution+y*resolution+x]=-distance;
 }
 field.update();const count=field.count;if(count<=0||count>=50000*3)throw new Error('Trouser surface exceeded its bounded mesh buffer');
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(field.geometry.attributes.position.array.slice(0,count*3),3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(field.geometry.attributes.normal.array.slice(0,count*3),3));
 const normals=geometry.attributes.normal;for(let i=0;i<normals.count;i++){const n=new THREE.Vector3().fromBufferAttribute(normals,i).normalize();normals.setXYZ(i,n.x,n.y,n.z);}
 geometry.applyMatrix4(new THREE.Matrix4().compose(center,new THREE.Quaternion(),half));
 // Low-amplitude cloth folds follow the knee region of the finished surface.
 const positions=geometry.attributes.position,knee=point(.615,.526).y;
 for(let i=0;i<positions.count;i++){const p=new THREE.Vector3().fromBufferAttribute(positions,i),normal=new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal,i);const band=Math.exp(-(((p.y-knee)/.12)**2)),fold=.0045*band*Math.sin(p.y*95+p.x*22);p.addScaledVector(normal,fold);positions.setXYZ(i,p.x,p.y,p.z);}
 geometry.deleteAttribute('normal');const joined=mergeVertices(geometry,1e-6),valid=[];
 for(let i=0;i<joined.index.count;i+=3){const a=joined.index.getX(i),b=joined.index.getX(i+1),c=joined.index.getX(i+2);if(a!==b&&b!==c&&c!==a)valid.push(a,b,c);}
 joined.setIndex(valid);let finished=mergeVertices(joined,1e-6);
 // Discard tiny internal closed shells; the garment must have one connected outer component.
 const parent=Array.from({length:finished.attributes.position.count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},unite=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[Math.max(a,b)]=Math.min(a,b);};
 for(let i=0;i<finished.index.count;i+=3){const a=finished.index.getX(i);unite(a,finished.index.getX(i+1));unite(a,finished.index.getX(i+2));}
 const components=new Map();for(let i=0;i<finished.index.count;i+=3){const a=finished.index.getX(i),key=find(a);if(!components.has(key))components.set(key,[]);components.get(key).push(a,finished.index.getX(i+1),finished.index.getX(i+2));}
 if(components.size>1){const largest=[...components.values()].reduce((a,b)=>a.length>b.length?a:b);finished.setIndex(largest);const compact=mergeVertices(finished,1e-6);finished.dispose();finished=compact;}
 finished.computeVertexNormals();geometry.dispose();joined.dispose();
 const trousers=mesh('Continuous tailored trousers',finished,gray);trousers.userData={surface:'implicit-trousers',resolution,triangles:finished.index.count/3,constructionMeshesExported:false};field.geometry.dispose();
 for(const o of construction){root.remove(o);o.geometry.dispose();}
 // Stitching is attached to the final garment surface by ray intersection, not floated in front.
 const trouserThread=mat(0x747580,.85),raycaster=new THREE.Raycaster();trousers.updateMatrixWorld(true);
 function garmentPoint(x,y){raycaster.setFromCamera(new THREE.Vector2(x*2-1,1-y*2),camera);const hit=raycaster.intersectObject(trousers,false)[0];return hit?hit.point.clone().addScaledVector(hit.face.normal,.0015):null;}
 function garmentSeam(name,coordinates,radius=.0018){const points=coordinates.map(([x,y])=>garmentPoint(x,y));if(points.every(Boolean))curve(name,points,radius,trouserThread);}
 garmentSeam('Trouser waistband seam',[[.579,.377],[.675,.374],[.778,.38]],.002);
 garmentSeam('Trouser fly seam',[[.652,.38],[.650,.412],[.663,.438]]);
 garmentSeam('Slanted trouser pocket',[[.753,.383],[.744,.410],[.721,.428]],.002);
 garmentSeam('Pressed front trouser crease',[[.712,.44],[.713,.55],[.746,.69],[.786,.79]],.0012);
 for(const x of [.60,.677,.748])garmentSeam('Trouser belt loop',[[x,.372],[x,.382],[x,.391]],.003);
 const fastener=garmentPoint(.644,.377);if(fastener)oval('Waist fastener',fastener,[.004,.004,.002],trouserThread);
 // Overlapping ruffle panels are real double-sided surfaces around the body.
 function skirt(name,top,bottom,spread,phase){const vertices=[],indices=[],rows=24,cols=96;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,gap=.70*THREE.MathUtils.clamp((t-.30)/.70,0,1),a=.85+gap/2+i/cols*(Math.PI*2-gap),wave=Math.sin(a*7+t*8+phase),r=.15+.03*(1-t)**2+t*spread+wave*.020*t;const center=point(.351-.015*t,top+(bottom-top)*t,-.01);vertices.push(center.x+Math.cos(a)*r,center.y+.023*wave*t,center.z+Math.sin(a)*r*.68);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*(cols+1)+i;indices.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const silk=emerald.clone();silk.side=THREE.DoubleSide;mesh(name,g,silk);}
 skirt('Silk skirt body',.365,.588,.25,0);skirt('Upper cascading ruffle',.385,.477,.18,1);skirt('Middle cascading ruffle',.445,.544,.245,2);skirt('Lower cascading ruffle',.510,.601,.28,3);
 const arms=[
 ['Woman joined',[[.327,.239,.05,.061],[.359,.283,.09,.055],[.420,.333,.16,.044],[.500,.318,.23,.034],[.558,.304,.27,.025]],ws],
 ['Woman shoulder',[[.389,.253,-.03,.053],[.462,.265,-.02,.046],[.508,.219,.005,.035],[.563,.182,.015,.024]],ws],
 ['Man joined',[[.748,.224,.015,.080],[.767,.278,.06,.063],[.758,.309,.13,.050],[.735,.322,.17,.043],[.673,.315,.22,.041],[.593,.301,.27,.029]],ms],
 ['Man back',[[.543,.229,-.09,.074],[.513,.289,-.11,.063],[.468,.310,-.12,.048],[.438,.337,-.09,.030]],ms]];
 function hand(name,p,skin,angle){const g=new THREE.Group();g.position.copy(p);g.rotation.z=angle;g.scale.setScalar(.88);root.add(g);oval(name+' palm',[0,0,0],[.038,.048,.023],skin,g);
  for(let i=0;i<4;i++){const x=-.026+i*.016,len=.043+(i===1?.012:0);curve(name+' bent finger '+i,[[x,-.025,.005],[x,-.045,.020],[x,-len,.04],[x,-len+.01,.052]],.007,skin,g);oval(name+' fingernail '+i,[x,-len+.008,.057],[.005,.007,.0015],mat(0xd8af90),g);}
  curve(name+' thumb',[[.028,.007,.013],[.046,-.01,.032],[.032,-.027,.049]],.009,skin,g);}
 function sleeveShell(name,arm,endFraction){
  const {sides,rows}=arm.userData,last=Math.round(rows*endFraction),position=arm.geometry.attributes.position,v=[],ix=[];
  for(let row=0;row<=last;row++){const center=new THREE.Vector3();for(let i=0;i<sides;i++)center.add(new THREE.Vector3().fromBufferAttribute(position,row*(sides+1)+i));center.divideScalar(sides);
   for(let i=0;i<=sides;i++){const p=new THREE.Vector3().fromBufferAttribute(position,row*(sides+1)+i),radial=p.clone().sub(center).normalize();p.addScaledVector(radial,.005);v.push(p.x,p.y,p.z);}}
  for(let row=0;row<last;row++)for(let i=0;i<sides;i++){const k=row*(sides+1)+i;ix.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}
  // A thin cuff annulus follows the exact underlying arm ring instead of a flat solid end cap.
  const inner=v.length/3;for(let i=0;i<=sides;i++){const p=new THREE.Vector3().fromBufferAttribute(position,last*(sides+1)+i);v.push(p.x,p.y,p.z);}
  for(let i=0;i<sides;i++){const k=last*(sides+1)+i;ix.push(k,inner+i,k+1,k+1,inner+i,inner+i+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const cloth=navy.clone();cloth.side=THREE.DoubleSide;mesh(name+' fitted sleeve',g,cloth);
 }
 for(const [name,pts,skin] of arms){const arm=sweep(name+' arm',pts.map(([x,y,z,r])=>[point(x,y,z),r]),skin,.9);hand(name,point(...pts.at(-1).slice(0,3)),skin,name==='Woman joined'?-.7:.65);
  if(name.startsWith('Man'))sleeveShell(name,arm,2/(pts.length-1));}
 for(let i=0;i<6;i++){const y=.27+i*.013;curve('Bodice fabric gathering '+i,[point(.335,y,.073),point(.387,y+.01,.101),point(.435,y-.004,.071)],.0018,mat(0x085b49));}
 root.userData={landmarks,palette,static:true,revision:'continuous-neck-skin-and-fitted-garments-v4'};return root;
}
