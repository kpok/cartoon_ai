import * as THREE from '../../vendor/three.module.js';
export const landmarks = {womanHead:[-.48,1.55,0],manHead:[.42,1.7,0],joinedHands:[.08,1.12,.36]};
export const palette = {dress:0x00624e,shirt:0x18253e,trousers:0x85858a};
// All surfaces are generated geometry; the reference is never mapped onto the models.
export function createCouple(){
 const root=new THREE.Group();root.name='Salsa couple';
 const material=(color,roughness=.65)=>new THREE.MeshStandardMaterial({color,roughness});
 const emerald=material(palette.dress,.4),navy=material(palette.shirt),gray=material(palette.trousers),black=material(0x161516),bronze=material(0x995b32,.3);
 function ellipsoid(name,p,s,m,parent=root){const o=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),m);o.name=name;o.position.set(...p);o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function limb(name,a,b,r1,r2,m){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,start.distanceTo(end),20),m);o.name=name;o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());o.castShadow=true;root.add(o);ellipsoid(name+' joint',b,[r2,r2,r2],m);return o;}
 function hand(name,p,skin){ellipsoid(name,p,[.044,.065,.026],skin);for(let i=0;i<4;i++)limb(name+' finger '+i,[p[0]-.025+i*.016,p[1]-.035,p[2]+.01],[p[0]-.025+i*.016,p[1]-.09,p[2]+.025],.009,.007,skin);}
 function head(name,p,skin,hair,female){
  const g=new THREE.Group();g.position.set(...p);root.add(g);g.rotation.y=female?.18:-.16;
  ellipsoid(name+' face',[0,0,0],[.10,.137,.092],skin,g);
  ellipsoid(name+' jaw',[0,-.075,.025],[.075,.063,.066],skin,g);
  ellipsoid(name+' nose',[0,-.015,.094],[.018,.032,.023],skin,g);
  for(const x of [-.098,.098])ellipsoid(name+' ear',[x,-.005,0],[.02,.035,.019],skin,g);
  for(const x of [-.04,.04]){ellipsoid(name+' eye white',[x,.025,.081],[.026,.011,.012],material(0xeee2d3),g);ellipsoid(name+' iris',[x,.025,.091],[.011,.010,.005],material(0x39271b),g);ellipsoid(name+' pupil',[x,.025,.095],[.005,.006,.003],black,g);ellipsoid(name+' brow',[x,.049,.081],[.03,.006,.007],hair,g);}
  ellipsoid(name+' lips',[0,-.062,.085],[.035,.009,.009],material(female?0x9b4243:0x95625a),g);
  ellipsoid(name+' hair cap',[0,.092,-.015],[.105,.062,.089],hair,g);
  for(let i=0;i<(female?18:12);i++){const a=i*2.399;ellipsoid(name+' hair lock',[Math.cos(a)*.082,.11+Math.sin(i*3)*.018,Math.sin(a)*.065],[.037,.035,.035],hair,g);}
  if(female)for(let i=0;i<16;i++){const a=i/15*Math.PI;ellipsoid(name+' long hair',[Math.cos(a)*.10,-.11,-.05-Math.sin(a)*.055],[.039,.20,.04],hair,g);}
 }
 const ws=material(0xc59065),ms=material(0xd3a080);
 head('Woman',landmarks.womanHead,ws,material(0x211710),true);head('Man',landmarks.manHead,ms,material(0x68472d),false);
 for(const [x,y,skin] of [[-.48,1.39,ws],[.42,1.54,ms]])limb('Neck',[x,y-.04,0],[x,y+.07,0],.045,.044,skin);
 ellipsoid('Navy shirt',[.43,1.25,-.015],[.205,.265,.115],navy);ellipsoid('Emerald bodice',[-.46,1.16,0],[.135,.205,.103],emerald);
 ellipsoid('Woman waist',[-.47,1.02,0],[.115,.09,.095],emerald);ellipsoid('Man hips',[.43,.97,0],[.17,.105,.10],gray);
 // A rippled asymmetric skirt retains a visible slit on the reference-facing side.
 const vertices=[],indices=[],rows=24,cols=80;
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,a=.35+i/cols*(Math.PI*2-.7),r=.12+t*.18+Math.sin(a*8+t*9)*.018*t;vertices.push(-.47+Math.cos(a)*r,1.04-t*(.46+.06*Math.sin(a*3)),Math.sin(a)*r);}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*(cols+1)+i;indices.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const dress=emerald.clone();dress.side=THREE.DoubleSide;const skirt=new THREE.Mesh(geo,dress);skirt.name='Rippled slit skirt';root.add(skirt);
 for(const [name,hip,knee,ankle,mat] of [
 ['Woman left',[-.53,.94,0],[-.62,.48,.06],[-.69,.13,.02],ws],['Woman right',[-.39,.94,.04],[-.30,.49,.15],[-.35,.12,.20],ws],
 ['Man left',[.33,.94,0],[.28,.54,.07],[.43,.08,.12],gray],['Man right',[.53,.94,0],[.57,.51,-.07],[.68,.08,.10],gray]]){const woman=name.startsWith('Woman');limb(name+' thigh',hip,knee,woman?.084:.095,woman?.058:.075,mat);limb(name+' shin',knee,ankle,woman?.058:.075,woman?.032:.06,mat);ellipsoid(name+' shoe',[ankle[0],.055,ankle[2]+.055],[woman?.043:.072,.04,woman?.10:.14],woman?bronze:black);if(woman)limb(name+' heel',[ankle[0],.025,ankle[2]-.04],[ankle[0],.10,ankle[2]-.03],.012,.015,bronze);}
 const arms=[['Woman joined',[-.56,1.34,.03],[-.39,1.04,.20],[.06,1.12,.35],ws],['Woman shoulder',[-.36,1.35,0],[-.10,1.30,.04],[.25,1.49,0],ws],['Man joined',[.60,1.44,0],[.71,1.12,.18],[.10,1.14,.37],ms],['Man back',[.26,1.44,-.03],[.09,1.13,-.12],[-.36,1.08,-.09],navy]];
 for(const [name,a,b,c,skin] of arms){limb(name+' upper arm',a,b,.052,.041,skin);limb(name+' forearm',b,c,.041,.027,skin);hand(name+' hand',c,skin===navy?ms:skin);}
 for(let i=0;i<5;i++)ellipsoid('Shirt button',[.42,1.08+i*.075,.102],[.008,.008,.005],gray);
 root.userData={landmarks,palette,static:true};return root;
}
