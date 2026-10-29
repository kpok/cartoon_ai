// SPDX-License-Identifier: GPL-3.0-or-later
// Clip a convex arm shell in world space and close each cut with a flat metal cap.
export function sliceArm(THREE,source){
 const input=source.geometry.index?source.geometry.toNonIndexed():source.geometry;
 const normalMatrix=new THREE.Matrix3().getNormalMatrix(source.matrixWorld),vertices=[];
 for(let i=0;i<input.attributes.position.count;i++){
  const p=new THREE.Vector3().fromBufferAttribute(input.attributes.position,i).applyMatrix4(source.matrixWorld);
  const n=new THREE.Vector3().fromBufferAttribute(input.attributes.normal,i).applyMatrix3(normalMatrix).normalize();
  const uv=input.attributes.uv?new THREE.Vector2().fromBufferAttribute(input.attributes.uv,i):new THREE.Vector2();
  vertices.push({p,n,uv});
 }
 return [[.49,Infinity],[.25,.49],[-Infinity,.25]].map(([low,high])=>{
  const positions=[],normals=[],uvs=[],cuts=new Map();
  function triangle(a,b,c){for(const v of [a,b,c]){positions.push(...v.p.toArray());normals.push(...v.n.toArray());uvs.push(...v.uv.toArray());}}
  function clip(polygon,height,sign){
   const result=[];if(!Number.isFinite(height))return polygon;
   for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length],da=sign*(a.p.y-height),db=sign*(b.p.y-height);
    if(da>=-1e-9)result.push(a);
    if((da>1e-9&&db< -1e-9)||(da< -1e-9&&db>1e-9)){
     const t=da/(da-db),v={p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),uv:a.uv.clone().lerp(b.uv,t)};
     v.p.y=height;result.push(v);
    }
   }
   return result;
  }
  for(let i=0;i<vertices.length;i+=3){
   let polygon=clip(vertices.slice(i,i+3),low,1);polygon=clip(polygon,high,-1);
   for(let j=1;j<polygon.length-1;j++)triangle(polygon[0],polygon[j],polygon[j+1]);
   for(const height of [low,high])if(Number.isFinite(height))for(const v of polygon)if(Math.abs(v.p.y-height)<1e-7){
    if(!cuts.has(height))cuts.set(height,new Map());cuts.get(height).set(v.p.toArray().map(value=>value.toFixed(6)).join(','),v.p);
   }
  }
  for(const [height,points] of cuts){
   const ring=[...points.values()];if(ring.length<3)throw new Error('Incomplete arm cap');
   const center=ring.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).multiplyScalar(1/ring.length);
   ring.sort((a,b)=>Math.atan2(a.z-center.z,a.x-center.x)-Math.atan2(b.z-center.z,b.x-center.x));
   const normalY=height===low?-1:1;if(normalY===1)ring.reverse();
   const vertex=p=>({p,n:new THREE.Vector3(0,normalY,0),uv:new THREE.Vector2()});
   for(let i=0;i<ring.length;i++)triangle(vertex(center),vertex(ring[i]),vertex(ring[(i+1)%ring.length]));
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));return geometry;
 });
}
