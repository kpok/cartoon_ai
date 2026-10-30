import {readFile,writeFile} from 'node:fs/promises';
await import('../../scripts/vendor.mjs');
await writeFile(new URL('exporter.js',import.meta.url),(await readFile(new URL('../../node_modules/three/examples/jsm/exporters/GLTFExporter.js',import.meta.url),'utf8')).replaceAll("from 'three'","from '../../vendor/three.module.js'"));
