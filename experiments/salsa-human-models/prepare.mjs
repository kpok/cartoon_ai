import {readFile,writeFile} from 'node:fs/promises';
await import('../../scripts/vendor.mjs');
await writeFile(new URL('exporter.js',import.meta.url),(await readFile(new URL('../../node_modules/three/examples/jsm/exporters/GLTFExporter.js',import.meta.url),'utf8')).replaceAll("from 'three'","from '../../vendor/three.module.js'"));
await writeFile(new URL('marching.js',import.meta.url),('// Generated from locked Three.js (MIT); notice: ../../vendor/THREE-LICENSE.txt.\n'+await readFile(new URL('../../node_modules/three/examples/jsm/objects/MarchingCubes.js',import.meta.url),'utf8')).replaceAll("from 'three'","from '../../vendor/three.module.js'"));
