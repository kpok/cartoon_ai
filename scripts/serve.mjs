import {createStaticServer} from './static-server.mjs';
const directory=process.env.SERVE_DIR||(process.argv.includes('--dist')?'dist':'.');
const port=Number(process.env.PORT||(process.argv.includes('--port')?process.argv[process.argv.indexOf('--port')+1]:null)||3000);
createStaticServer(directory).listen(port,'127.0.0.1',()=>console.log('Preview server ready (localhost only)'));
