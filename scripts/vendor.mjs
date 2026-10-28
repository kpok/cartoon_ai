import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
await mkdir('vendor',{recursive:true});
for(const name of ['three.module.js','three.core.js'])await cp(`node_modules/three/build/${name}`,`vendor/${name}`);
await cp('node_modules/three/LICENSE','vendor/THREE-LICENSE.txt');

for(const [name,path] of [['GLTFLoader.js','loaders/GLTFLoader.js'],['OrbitControls.js','controls/OrbitControls.js'],['BufferGeometryUtils.js','utils/BufferGeometryUtils.js'],['SkeletonUtils.js','utils/SkeletonUtils.js']]){
 const source=await readFile(`node_modules/three/examples/jsm/${path}`,'utf8');
 await writeFile(`vendor/${name}`,source.replace(/^.*@three_import.*$/gm,'').replaceAll("from 'three'","from './three.module.js'").replaceAll("from '../utils/BufferGeometryUtils.js'","from './BufferGeometryUtils.js'").replaceAll("from '../utils/SkeletonUtils.js'","from './SkeletonUtils.js'"));
}
