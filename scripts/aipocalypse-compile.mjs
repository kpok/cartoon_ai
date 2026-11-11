import {readFile,writeFile} from 'node:fs/promises';
import {validateProduction} from './aipocalypse-production.mjs';

export function environmentFor(location){
 if(location==='authorial_black')return 'black';
 if(location.includes('shop'))return 'shop';
 if(location.includes('hospital'))return 'hospital';
 if(location.includes('elevator'))return 'elevator';
 if(location.includes('habitat'))return 'habitat';
 if(location.includes('antarctica'))return 'polar';
 if(location.includes('orbital'))return 'orbit';
 if(location.includes('factory'))return 'factory';
 if(location.includes('waterworks'))return 'water';
 if(location.includes('port'))return 'port';
 if(location.includes('missile_site'))return 'launch';
 if(location.includes('control')||location==='military_mission')return 'control';
 if(location.includes('robotaxi_interior'))return 'car_interior';
 if(location.includes('lobby')||location.includes('garage'))return 'lobby';
 return 'street';
}
export function kindFor(name){
 if(/taxi|ambulance|fire_engine|delivery_van|traffic_cars|port_vehicle|car_wreck/.test(name)&&!/terminal|screen|interior|headlights/.test(name))return 'vehicle';
 if(/phone|terminal|screen|console|reader|display|laptop|intercom|monitor|panel|controls|video_feed|radio/.test(name))return 'device';
 if(/paper|notebook|map|chart|card|note/.test(name)&&!name.startsWith('end_title'))return 'paper';
 if(/port_crane/.test(name))return 'crane';
 if(/container/.test(name))return 'container';
 if(name==='factory_robot')return 'robot';
 if(/rocket|conventional_missile/.test(name))return 'rocket';
 if(name==='fictional_drone')return 'drone';
 if(/bed|stretcher|trolley/.test(name))return 'stretcher';
 if(/door|gate|hatch/.test(name))return 'door';
 if(/shelv/.test(name))return 'shelf';
 if(/cup/.test(name))return 'cup';
 if(/water|bottled/.test(name))return 'water';
 if(/gauge|thermometer|wall_clock/.test(name))return 'gauge';
 if(/chair|seats/.test(name))return 'chair';
 if(/counter/.test(name))return 'counter';
 if(/earth/.test(name))return 'earth';
 if(/pipe|valve|workpiece|stop|tool|pen|pencil|bag|blanket|hose|glove|banknotes|food|equipment|headset|belts|freight|gear|speaker/.test(name))return 'prop';
 return 'environment';
}
export function compile(plan,source){
 validateProduction(plan,source);
 return {schema_version:1,duration:870,source_hash:plan.screenplay_sha256,
  sequences:plan.sequences.map(({id,number,title,start,end})=>({id,number,title,start,end})),
  shots:plan.shots.map(s=>({...Object.fromEntries(['id','seq','start','end','location','physical_space','framing','camera','action','characters','animations','effects','signature','card_text','silence'].filter(k=>s[k]!==undefined).map(k=>[k,s[k]])),environment:environmentFor(s.location),models:s.models.map(name=>({name,kind:kindFor(name),status:'rough_proxy'}))})),
  dialogues:plan.dialogues.map(c=>Object.fromEntries(['id','speaker','text','start','end','shot_ids'].map(k=>[k,c[k]]))),
  audio_status:'unrecorded_captions_only',
  opening_disclaimer:'Hipotetyczny scenariusz skrajny. Zakładamy przełamanie kluczowych zabezpieczeń, także nuklearnych. Nie są to potwierdzone możliwości obecnego AI',
  title:'AIpokalypse — OSTATNIE POLECENIE',
 };
}
if(process.argv[1]?.endsWith('/aipocalypse-compile.mjs')){
 const plan=JSON.parse(await readFile('docs/aipocalypse/production/production.json','utf8'));
 const result=compile(plan,await readFile('docs/aipocalypse/SCENARIUSZ_PL.md','utf8'));
 await writeFile('experiments/aipocalypse-android/assets/animatic.json',JSON.stringify(result));
 console.log(`Compiled ${result.shots.length} rough shots/${result.duration}s; audio remains unrecorded`);
}
