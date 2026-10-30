import {createServer} from 'node:http';
import {readFile,realpath,stat} from 'node:fs/promises';
import {resolve,relative,isAbsolute,extname} from 'node:path';

export const CONTENT_POLICY="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'";
export const ROBOT_POLICY=CONTENT_POLICY.replace("connect-src 'none'","connect-src 'self'");
export function publicFile(path){
 return ['index.html','export.html','robot.html','strawberry.html','assets/kalinka/red-square-ai.png'].includes(path)||/^src\/[a-z0-9-]+\.(js|css)$/.test(path)||['vendor/three.module.js','vendor/three.core.js','vendor/THREE-LICENSE.txt','vendor/GLTFLoader.js','vendor/OrbitControls.js','vendor/BufferGeometryUtils.js','vendor/SkeletonUtils.js','published/robot/robot.glb','published/robot/preview.png','published/robot/manifest.json'].includes(path);
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.txt':'text/plain; charset=utf-8','.glb':'model/gltf-binary','.png':'image/png','.json':'application/json; charset=utf-8'};
export function createStaticServer(directory){
 const root=resolve(directory);
 return createServer(async(req,res)=>{
  const headers={'X-Content-Type-Options':'nosniff','Content-Security-Policy':CONTENT_POLICY,'Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
  const reply=(status,body='')=>{res.writeHead(status,headers);res.end(req.method==='HEAD'?'':body);};
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');reply(405);return;}
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   const file=pathname==='/'?'index.html':pathname.slice(1);
   if(file==='robot.html')headers['Content-Security-Policy']=ROBOT_POLICY;
   if(!publicFile(file)){reply(404);return;}
   const [canonicalRoot,path]=await Promise.all([realpath(root),realpath(resolve(root,file))]);
   const rel=relative(canonicalRoot,path);
   if(rel==='..'||rel.startsWith('../')||rel.startsWith('..\\')||isAbsolute(rel)){reply(404);return;}
   if(!(await stat(path)).isFile()){reply(404);return;}
   const body=await readFile(path);
   res.writeHead(200,{...headers,'Content-Type':mime[extname(file)],'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
  }catch{reply(404);}
 });
}
