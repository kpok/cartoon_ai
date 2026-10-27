import {rm,mkdir,cp} from 'node:fs/promises';
await import('./vendor.mjs');
await rm('dist',{recursive:true,force:true});await mkdir('dist');
await cp('index.html','dist/index.html');await cp('export.html','dist/export.html');await cp('src','dist/src',{recursive:true});
await cp('vendor','dist/vendor',{recursive:true});
console.log('Two static stories built in dist/');
await (await import('./verify-build.mjs')).verifyBuild();
