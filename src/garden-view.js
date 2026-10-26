import * as THREE from '../vendor/three.module.js';
import { sampleGarden } from './garden-state.js';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const mix = (a, b, amount) => a + (b - a) * amount;
const up = new THREE.Vector3(0, 1, 0);

export function createGardenView(canvas, { onContextLost = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  if(renderer.getContext().isContextLost()){renderer.dispose();throw new Error('WebGL context is lost');}
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dbe9df');
  scene.fog = new THREE.Fog('#dbe9df', 17, 35);
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, .1, 60);
  const hemisphere = new THREE.HemisphereLight('#fff8df', '#81986c', 2.8);
  scene.add(hemisphere);
  const sunLight = new THREE.DirectionalLight('#fff0ce', 3.6);
  sunLight.position.set(-3, 7, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  Object.assign(sunLight.shadow.camera, { left: -6, right: 6, top: 6, bottom: -5, near: .5, far: 18 });
  sunLight.shadow.normalBias = .03;
  scene.add(sunLight);

  const geometries = new Set(), materials = new Set();
  const geometry = value => { geometries.add(value); return value; };
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 20, 14));
  const cylinderGeometry = geometry(new THREE.CylinderGeometry(1, 1, 1, 16));
  const coneGeometry = geometry(new THREE.ConeGeometry(1, 1, 20));
  const unitBox = geometry(new THREE.BoxGeometry(1, 1, 1));
  const palettes = new Map();
  const material = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!palettes.has(key)) {
      const value = new THREE.MeshStandardMaterial({ color, roughness: .83, metalness: 0, ...extra });
      materials.add(value); palettes.set(key, value);
    }
    return palettes.get(key);
  };
  const clay = material('#e7a05e'), cream = material('#f6d4a4'), pink = material('#e9a1a0');
  const ink = material('#4f463e'), terracotta = material('#ce8968'), rimClay = material('#e5a385');
  const soilMaterial = material('#7c5b40'), leafMaterial = material('#83ac68');
  const stemMaterial = material('#71965a'), mint = material('#99beb0');
  const flowerMaterial = material('#f2b4a3'), flowerCenter = material('#e9c46c');
  const waterMaterial = material('#8abccc', { transparent: true, opacity: .83 });
  const mesh = (parent, geo, mat, position, scale = [1, 1, 1], cast = true) => {
    const item = new THREE.Mesh(geo, mat);
    item.position.set(...position); item.scale.set(...scale);
    item.castShadow = cast; item.receiveShadow = true;
    parent.add(item); return item;
  };
  const ball = (parent, mat, position, scale, cast = true) => mesh(parent, sphereGeometry, mat, position, scale, cast);
  const box = (parent, mat, position, scale) => mesh(parent, unitBox, mat, position, scale);
  const group = parent => { const value = new THREE.Group(); parent.add(value); return value; };
  const tube = (parent, points, radius, mat) => {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
    return mesh(parent, geometry(new THREE.TubeGeometry(curve, 24, radius, 8, false)), mat, [0, 0, 0]);
  };
  const between = (item, a, b, radius = .12) => {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
    const direction = to.clone().sub(from);
    item.position.copy(from).add(to).multiplyScalar(.5);
    item.scale.set(radius, direction.length(), radius);
    item.quaternion.setFromUnitVectors(up, direction.normalize());
  };
  const ringGeometry = geometry(new THREE.TorusGeometry(1, .12, 10, 28));

  // A small clay diorama is intentionally bounded for mobile GPUs.
  mesh(scene, geometry(new THREE.CylinderGeometry(5.9, 5.5, .5, 48)), material('#b0c596'), [0, -.3, 0], [1, 1, 1], false);
  mesh(scene, geometry(new THREE.CircleGeometry(5.8, 48)), material('#d2ddb0'), [0, -.035, 0], [1, 1, 1], false).rotation.x = -Math.PI / 2;
  const path = mesh(scene, geometry(new THREE.CircleGeometry(1, 48)), material('#e6d8b3'), [.1, -.025, .3], [3.5, 1.65, 1], false);
  path.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 13; i++) {
    const x = -5.3 + i * .88;
    box(scene, material('#eee7cc'), [x, .56, -2.3], [.11, 1.15, .12]);
    mesh(scene, coneGeometry, material('#eee7cc'), [x, 1.21, -2.3], [.095, .18, .095]);
  }
  box(scene, material('#eee7cc'), [0, .82, -2.31], [11.1, .12, .1]);
  box(scene, material('#eee7cc'), [0, .35, -2.31], [11.1, .12, .1]);
  for (const [x, z, size] of [[-4.35,-1.8,1], [4.3,-2.3,.9], [-5,1,.7]]) {
    mesh(scene, cylinderGeometry, material('#ae9678'), [x, 1.1 * size, z], [.17 * size, 2.2 * size, .17 * size]);
    ball(scene, material('#a0bb88'), [x, 2.5 * size, z], [1.05 * size, 1.2 * size, .95 * size]);
    ball(scene, material('#b6cc96'), [x-.5*size, 2.7*size, z+.15], [.73*size, .88*size, .7*size]);
    ball(scene, material('#abc28f'), [x+.6*size, 2.4*size, z], [.72*size, .82*size, .65*size]);
  }
  for (let i = 0; i < 19; i++) {
    const angle = i * 2.399, radius = 3.4 + (i % 3) * .6;
    const x = Math.cos(angle) * radius, z = Math.sin(angle) * radius;
    if (z < -2.2) continue;
    const shrub = ball(scene, material(i % 2 ? '#aec58b' : '#9bb77f'), [x,.11,z], [.3,.17,.27]);
    shrub.rotation.y = angle;
    if (i % 3 === 0) {
      ball(scene, material('#f2ddaa'), [x,.32,z], [.14,.09,.14]);
      ball(scene, flowerMaterial, [x+.12,.28,z-.05], [.1,.07,.1]);
    }
  }
  for (let i = 0; i < 9; i++) {
    const x = -3.8 + i * .95, z = 1.8 + Math.sin(i) * .3;
    ball(scene, material('#d7d0b7'), [x,.025,z], [.12,.06,.09], false);
  }

  const skySun = group(scene);
  skySun.position.set(3.6, 4.9, -4.5);
  ball(skySun, material('#f7d88d', { emissive: '#f1bf60', emissiveIntensity: .4 }), [0,0,0], [.55,.55,.55], false);
  for (let i = 0; i < 8; i++) {
    const angle = i / 8 * Math.PI * 2;
    const ray = mesh(skySun, cylinderGeometry, material('#efc878'), [Math.cos(angle)*.82,Math.sin(angle)*.82,0], [.04,.22,.04], false);
    ray.rotation.z = angle - Math.PI / 2;
  }
  const moon = ball(scene, material('#f9efcf', { emissive: '#f9efcf', emissiveIntensity: .3 }), [-3.5,4.8,-4], [.46,.46,.46], false);
  moon.visible = false;
  const stars = group(scene);
  for (let i = 0; i < 12; i++) {
    ball(stars, material('#f8edc8', { emissive: '#f8edc8', emissiveIntensity: .5 }), [-5+(i*1.7)%10,3.9+(i%3)*.65,-5], [.035,.035,.035], false);
  }
  for (const [x,y,z] of [[-1,4.6,-4], [5.2,3.8,-5]]) {
    const cloud = group(scene); cloud.position.set(x,y,z);
    for (const [cx,cy,cz,s] of [[0,0,0,.42],[-.4,-.1,0,.35],[.45,-.08,0,.3]]) {
      ball(cloud, material('#fff9e9'), [cx,cy,cz], [s*1.6,s,s*.65], false);
    }
  }

  const pot = group(scene);
  mesh(pot, geometry(new THREE.CylinderGeometry(.62,.43,.82,28)), terracotta, [0,.48,0]);
  const rim = mesh(pot, ringGeometry, rimClay, [0,.92,0], [.57,.57,.57]); rim.rotation.x = Math.PI / 2;
  mesh(pot, cylinderGeometry, soilMaterial, [0,.93,0], [.53,.08,.53]);
  const hole = mesh(pot, geometry(new THREE.CircleGeometry(.15,20)), material('#4b3b2e'), [0,.974,0], [1,1,1], false); hole.rotation.x=-Math.PI/2;
  for (let i=0;i<7;i++) ball(pot, material('#987453'), [Math.sin(i*2)*.35,.985,Math.cos(i*2)*.32], [.025,.015,.025], false);
  const potFace = group(pot);
  ball(potFace, material('#e3b899'), [-.16,.56,.535], [.035,.04,.015], false);
  ball(potFace, material('#e3b899'), [.16,.56,.535], [.035,.04,.015], false);
  tube(potFace, [[-.07,.45,.56],[0,.42,.57],[.07,.45,.56]], .012, material('#e3b899'));

  const plant = group(pot);
  plant.position.y = .98;
  const stem = mesh(plant, cylinderGeometry, stemMaterial, [0,.5,0], [.035,1,.035]);
  const plantLeaves = [];
  for (let i=0;i<4;i++) {
    const side=i%2?-1:1;
    const leaf=ball(plant, leafMaterial,[side*.19,.25+i*.2,.02],[.28,.085,.12]);
    leaf.rotation.z=side*.45; leaf.rotation.y=side*.25;
    plantLeaves.push(leaf);
  }
  const blossom = group(plant);
  const petals=[];
  for(let i=0;i<7;i++) {
    const angle=i/7*Math.PI*2;
    const petal=ball(blossom,flowerMaterial,[Math.cos(angle)*.22,Math.sin(angle)*.22,0],[.17,.22,.085]);
    petal.rotation.z=angle-Math.PI/2; petals.push(petal);
  }
  ball(blossom,flowerCenter,[0,0,.09],[.145,.145,.09]);
  const seed = ball(scene,material('#d5b17b'),[0,1.5,0],[.12,.16,.095]);
  seed.rotation.z=.3;

  const cat = group(scene);
  cat.position.z = .45;
  const body = ball(cat,clay,[0,.72,0],[.48,.6,.36]);
  ball(cat,cream,[0,.7,.3],[.32,.4,.12]);
  const leftFoot=ball(cat,clay,[-.27,.19,.2],[.2,.19,.26]);
  const rightFoot=ball(cat,clay,[.27,.19,.2],[.2,.19,.26]);
  const tail=group(cat);
  tube(tail,[[-.32,.5,-.1],[-.72,.48,-.08],[-.9,.8,-.08],[-.72,1,-.08]],.105,clay);
  const head=group(cat);head.position.set(0,1.5,.025);
  ball(head,clay,[0,0,0],[.55,.48,.4]);
  for (const side of [-1,1]) {
    const ear=mesh(head,coneGeometry,clay,[side*.37,.43,-.025],[.22,.49,.2]);ear.rotation.z=-side*.18;
    const inside=mesh(head,coneGeometry,pink,[side*.37,.43,.11],[.12,.29,.06]);inside.rotation.z=-side*.18;
    ball(head,pink,[side*.36,-.1,.34],[.095,.045,.03]);
  }
  ball(head,cream,[0,-.15,.335],[.32,.2,.13]);
  const eyes=[];
  for (const side of [-1,1]) {
    const eye=ball(head,ink,[side*.205,.035,.363],[.055,.075,.035]);eyes.push(eye);
    ball(head,material('#fff8e9'),[side*.205+.015,.06,.39],[.016,.022,.012]);
    for(let line=0;line<2;line++) tube(head,[[side*.3,-.15+line*.07,.39],[side*.54,-.17+line*.1,.37]],.009,ink);
  }
  ball(head,material('#b87e72'),[0,-.115,.455],[.06,.045,.035]);
  tube(head,[[-.09,-.22,.448],[0,-.24,.463],[.09,-.22,.448]],.012,ink);
  const mouth=ball(head,ink,[0,-.23,.458],[.045,.05,.015]);mouth.visible=false;
  for (let i=-1;i<=1;i++) {
    const stripe=ball(head,material('#c1834d'),[i*.13,.34,.245],[.035,.1,.025]);stripe.rotation.z=-i*.17;
  }
  const leftArm=mesh(cat,cylinderGeometry,clay,[-.44,.83,.13],[.13,.5,.13]);
  const leftPaw=ball(cat,clay,[-.45,.56,.17],[.16,.19,.16]);
  const rightArm=mesh(cat,cylinderGeometry,clay,[.44,.83,.13],[.13,.5,.13]);
  const rightPaw=ball(cat,cream,[.45,.56,.17],[.17,.18,.17]);
  ball(rightPaw,pink,[0,-.015,.15],[.06,.07,.025]);

  const wateringCan=group(scene);
  mesh(wateringCan,cylinderGeometry,mint,[0,0,0],[.26,.38,.26]);
  const canRim=mesh(wateringCan,ringGeometry,material('#bfd6c5'),[0,.2,0],[.23,.23,.23]);canRim.rotation.x=Math.PI/2;
  const handle=mesh(wateringCan,ringGeometry,mint,[-.31,.04,0],[.24,.31,.2]);handle.rotation.y=Math.PI/2;
  const spout=mesh(wateringCan,cylinderGeometry,mint,[0,0,0]);between(spout,[.18,.02,0],[.68,.3,0],.08);
  const rose=mesh(wateringCan,cylinderGeometry,material('#d0dec8'),[.7,.31,0],[.14,.08,.14]);rose.rotation.z=-.8;
  const drops=[];
  for(let i=0;i<10;i++)drops.push(ball(scene,waterMaterial,[0,0,0],[.027,.065,.027],false));

  const butterfly=group(scene);
  const wingLeft=group(butterfly),wingRight=group(butterfly);
  for(const [wing,side] of [[wingLeft,-1],[wingRight,1]]) {
    ball(wing,material('#d49e86'),[side*.15,.04,0],[.19,.24,.035]);
    ball(wing,material('#ebc79d'),[side*.12,-.15,0],[.14,.14,.035]);
    ball(wing,material('#f5dcc0'),[side*.19,.07,.025],[.085,.12,.02]);
  }
  ball(butterfly,material('#8e735c'),[0,0,.02],[.035,.2,.035]);
  tube(butterfly,[[-.01,.16,0],[-.065,.26,0]],.008,ink);
  tube(butterfly,[[.01,.16,0],[.065,.26,0]],.008,ink);

  // Reusable camera targets make every frame independent of playback direction.
  const cameraPositions = [
    [5.5,3.7,8.6], [3.5,3,6.4], [3.7,3.3,6.7], [5.6,3.7,8.5], [4.2,3.1,7.2],
    [5.6,4,9], [3.8,2.9,6.4], [4.6,3.1,7.5], [5.3,3.4,8.1], [4.8,3.4,8.8], [5.1,3.3,8.2],
  ];
  const cameraTargets = [
    [-.4,1.1,0], [-.1,1.1,0], [.2,1.2,0], [.2,1.2,0], [.4,1.2,0], [.5,1.2,0],
    [.8,1.35,0], [.8,1.4,0], [.9,1.5,0], [.5,1.45,0], [.6,1.3,0],
  ];
  const daySky=new THREE.Color('#dbe9df'),nightSky=new THREE.Color('#8597b1');
  const dayGround=new THREE.Color('#fff8df'),nightGround=new THREE.Color('#b0bbd5');
  let lastWidth=0,lastHeight=0,disposed=false;
  const onLost=event=>{event.preventDefault();onContextLost();};
  canvas.addEventListener('webglcontextlost',onLost);

  function render(time,{talking=false,speaker=null}={}) {
    if(disposed)return;
    const width=Math.max(1,canvas.clientWidth||1280),height=Math.max(1,canvas.clientHeight||720);
    const portrait=width<height;
    const s=sampleGarden(time),t=s.t;
    // A compact portrait stage keeps the cat, pot and butterfly in one shot.
    if(portrait){s.catX=-1.5+.75*smooth(t/4);s.potX=.15+.7*smooth((t-23)/5);}
    if(width!==lastWidth||height!==lastHeight) {
      renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();lastWidth=width;lastHeight=height;
    }
    const night=s.night*.74;
    scene.background.copy(daySky).lerp(nightSky,night);scene.fog.color.copy(scene.background);
    hemisphere.color.copy(dayGround).lerp(nightGround,night);hemisphere.intensity=2.8-night*.7;
    sunLight.intensity=3.6-night*2.3;
    skySun.scale.setScalar(1-night*.55);skySun.position.y=4.9-night*1.5;
    moon.visible=night>.2;moon.scale.setScalar(.7+night*.3);stars.visible=night>.3;
    pot.position.set(s.potX,0,0);
    hole.scale.setScalar(Math.max(.001,1-s.soilCover));hole.visible=t>=6&&t<15;
    soilMaterial.color.set('#7c5b40').lerp(new THREE.Color('#584632'),Math.max(s.water*.7,t>=16?.35:0));
    const follow=(portrait?.7:1.2)*smooth((t-23)/5);
    cat.position.x=s.catX+follow;
    const walking=t<4?Math.sin(t*10)*.05*(1-smooth((t-3)/1)):t>=23&&t<28?Math.sin(t*10)*.025:0;
    cat.position.y=walking;
    leftFoot.position.z=.2+walking;rightFoot.position.z=.2-walking;
    cat.rotation.y=-.12+Math.sin(t*.7)*.035;
    head.rotation.z=.07*Math.sin(t*.9)+s.checking*.13;
    head.rotation.y=.1+s.planting*.1;
    tail.rotation.x=Math.sin(t*1.8)*.1;
    const blink=Math.cos(t*1.8)>.985;
    for(const eye of eyes)eye.scale.y=blink?.012:.075;
    mouth.visible=talking&&speaker==='kitten';mouth.scale.y=.025+Math.abs(Math.sin(t*14))*.04;
    body.scale.y=.6+Math.sin(t*1.8)*.008;
    const normalPaw=[.49,.6,.2];
    let paw=normalPaw;
    if(t<15) {
      const reach=smooth((t-5)/3);
      paw=[mix(.65,s.potX-cat.position.x-.08,reach),mix(1.32,1.08, s.seedDrop*.55),.18];
    } else if(s.water>.01) {
      paw=[s.potX-cat.position.x-.75,1.75,.15];
    } else if(s.checking>.01) {
      paw=[mix(.49,.8,s.checking),mix(.6,1.15,s.checking),.2];
    } else if(s.celebrate>.01) {
      paw=[.58,.7+s.celebrate*(.5+Math.sin(t*3)*.15),.2];
    }
    between(rightArm,[.35,1.08,.1],paw,.13);rightPaw.position.set(...paw);
    const leftTarget=[-.43,.58+s.celebrate*.65,.16];
    between(leftArm,[-.35,1.08,.1],leftTarget,.13);leftPaw.position.set(...leftTarget);
    seed.visible=t<13;
    const seedStart=[cat.position.x+paw[0],1.53,.45+paw[2]];
    seed.position.set(mix(seedStart[0],s.potX,s.seedDrop),mix(seedStart[1],.92,s.seedDrop),mix(seedStart[2],0,s.seedDrop));
    seed.scale.set(.12*(1-s.soilCover*.8),.16*(1-s.soilCover*.8),.095*(1-s.soilCover*.8));
    wateringCan.visible=s.water>.01;
    wateringCan.position.set(s.potX-.68,1.88,.26);wateringCan.rotation.z=-.72*s.water;
    for(let i=0;i<drops.length;i++) {
      const f=(t*1.9+i*.113)%1;
      drops[i].visible=s.water>.15;
      drops[i].position.set(s.potX+.04+Math.sin(i*4)*.07,1.66-f*.66,.19+(i%3-1)*.055);
      drops[i].scale.set(.027,.045+f*.025,.027);
    }
    plant.visible=s.sprout>.001;
    const plantHeight=.38*s.sprout+.66*s.leaves+.42*s.flower;
    stem.position.y=plantHeight/2;stem.scale.set(.035,plantHeight,.035);
    for(let i=0;i<plantLeaves.length;i++) {
      const amount=i<2?s.sprout:s.leaves;
      const leaf=plantLeaves[i];leaf.visible=amount>.001;
      leaf.position.y=plantHeight*(.3+i*.15);
      leaf.position.x=(i%2?-1:1)*(.12+.1*s.leaves)*amount;
      leaf.scale.set((.15+.14*s.leaves)*amount,.07*amount,.12*amount);
      leaf.rotation.z=(i%2?-1:1)*(.45+Math.sin(t*1.1+i)*.05);
    }
    blossom.position.y=plantHeight;blossom.visible=s.flower>.001;blossom.scale.setScalar(Math.max(.001,s.flower));
    blossom.rotation.z=Math.sin(t*.6)*.04;
    butterfly.position.set(s.potX+(portrait?.8:1.05)+Math.sin(t*.85)*(portrait?.16:.28),1.8+Math.sin(t*1.4)*.2+s.flower*.8,.2+Math.cos(t*.5)*.24);
    butterfly.rotation.y=-.12;
    const flap=.18+Math.sin(t*9)*.55;wingLeft.rotation.y=flap;wingRight.rotation.y=-flap;
    const index=s.phase,previous=Math.max(0,index-1),ease=smooth(s.phaseProgress*4);
    camera.position.fromArray(cameraPositions[previous]).lerp(new THREE.Vector3(...cameraPositions[index]),ease);
    camera.position.x+=Math.sin(t*.22)*.09;
    const target=new THREE.Vector3(...cameraTargets[previous]).lerp(new THREE.Vector3(...cameraTargets[index]),ease);
    if(portrait){
      // Frame actual action bounds rather than cropping the landscape camera.
      const left=cat.position.x-.75;
      const right=Math.max(pot.position.x+.65,butterfly.position.x+.4);
      const center=(left+right)/2;
      const distance=(right-left+1.05)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);
      target.set(center,1.65,0);
      camera.position.set(center+.55+Math.sin(t*.22)*.06,1.65+distance*.2,distance);
    }
    camera.lookAt(target);
    renderer.render(scene,camera);
  }

  function dispose() {
    if(disposed)return;disposed=true;
    canvas.removeEventListener('webglcontextlost',onLost);
    for(const item of geometries)item.dispose();
    for(const item of materials)item.dispose();
    renderer.dispose();
  }
  return { render, dispose };
}
