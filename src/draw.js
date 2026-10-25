import {sampleStory} from './story.js';
const TAU=Math.PI*2;
export function render(ctx,time){
 const s=sampleStory(time),t=s.t;
 ctx.clearRect(0,0,1280,720);
 const ellipse=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();};
 const line=(points,c,w=4)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
 const curve=(a,c,w=5)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.bezierCurveTo(...a.slice(2));ctx.stroke();};
 const poly=(p,c)=>{ctx.fillStyle=c;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 const heart=(x,y,k)=>{ctx.save();ctx.translate(x,y);ctx.scale(k,k);ctx.fillStyle='#d39384';ctx.beginPath();ctx.moveTo(0,10);ctx.bezierCurveTo(-35,-10,-14,-35,0,-17);ctx.bezierCurveTo(14,-35,35,-10,0,10);ctx.fill();ctx.restore();};
 const sky=ctx.createLinearGradient(0,0,0,720);sky.addColorStop(0,`rgb(${231-15*s.sunset},${239-22*s.sunset},${223-16*s.sunset})`);sky.addColorStop(1,'#fbefd4');ctx.fillStyle=sky;ctx.fillRect(0,0,1280,720);
 ellipse(1040,130+s.sunset*70,62,62,'#f5d99c');ellipse(1040,130+s.sunset*70,80,80,'#f5d99c25');
 const cloud=(x,y,k)=>{ctx.save();ctx.translate(x,y);ctx.scale(k,k);ellipse(0,0,60,18,'#fffff4aa');ellipse(-25,-13,28,24,'#fffff4aa');ellipse(15,-21,35,28,'#fffff4aa');ctx.restore();};
 cloud(235+Math.sin(t*.015)*20,110,1.15);cloud(720+Math.sin(t*.02)*16,160,.75);cloud(1180,65,.65);
 ellipse(290,490,610,220,'#cad9b3');ellipse(1120,500,690,240,'#bdcfa8');ellipse(660,660,1020,230,'#d5dfb4');
 // Garden fence and winding path stay behind every character.
 for(let x=60;x<1300;x+=87){ctx.fillStyle='#e9e5c9';ctx.fillRect(x,350,19,130);poly([[x,350],[x+9.5,335],[x+19,350]],'#e9e5c9');}ctx.fillStyle='#ece8cf';ctx.fillRect(0,380,1280,13);ctx.fillRect(0,436,1280,13);
 ctx.fillStyle='#eadcba';ctx.beginPath();ctx.moveTo(150,720);ctx.bezierCurveTo(200,570,710,630,905,480);ctx.bezierCurveTo(1010,425,1070,448,1130,460);ctx.bezierCurveTo(900,505,905,590,420,720);ctx.fill();
 // Soft tree canopy and foreground leaves frame the little stage.
 curve([70,525,95,350,100,260,65,170],'#ab9978',39);curve([83,350,160,280,155,255,185,215],'#ab9978',20);
 ellipse(40,150,175,135,'#9ebc8c');ellipse(160,160,140,110,'#aac594');ellipse(72,63,150,110,'#b4cc9a');ellipse(205,92,105,92,'#b3cb99');
 for(let i=0;i<42;i++){const x=(i*137+53)%1280,y=507+(i*43)%186;const a=Math.sin(t*.5+i)*3;line([[x-5,y],[x-8+a,y-12]],'#a6ba84',2);line([[x+4,y],[x+8+a,y-9]],'#a6ba84',2);if(i%3===0){ellipse(x,y-12,5,4,['#fbf6d6','#e7b6a0','#e1ca8c'][i%3]);ellipse(x,y-12,2,2,'#c9a46b');}}
 const flower=(x,y,k,col)=>{ctx.save();ctx.translate(x,y);ctx.scale(k,k);curve([0,0,8,-35,-8,-65,0,-105],'#799b69',5);ellipse(-13,-45,18,8,'#93af7a');ellipse(15,-65,18,8,'#93af7a');for(let i=0;i<6;i++){const a=i*TAU/6;ellipse(Math.cos(a)*16,-105+Math.sin(a)*16,12,12,col);}ellipse(0,-105,12,12,'#edcc7d');ctx.restore();};
 flower(925,600,1.22,'#efc1ac');flower(1125,565,.8,'#f6e5b1');flower(1060,590,.65,'#fff1cd');
 // Basket: the same safe home at the start and the end.
 ellipse(228,578,111,23,'#acb78a38');ctx.fillStyle='#bc9973';ctx.beginPath();ctx.roundRect(135,510,192,68,[12,12,45,45]);ctx.fill();ellipse(231,513,95,25,'#ae8966');ellipse(231,512,78,17,'#e6cfab');for(let i=0;i<7;i++)line([[146+i*25,539],[157+i*22,567]],'#d4b28a',3);curve([140,542,190,555,265,556,321,542],'#d4b28a',3);
 const moving=s.walk;const bounce=Math.sin(t*5)*3*moving;const floor=541;
 ellipse(s.x,floor+35,76,13,'#7f99612b');
 ctx.save();ctx.translate(s.x,floor+bounce);ctx.scale(Math.sign(s.facing)*Math.max(.15,Math.abs(s.facing)),1);
 const fur='#dd9c63',light='#edb980',ink='#634d3e';
 curve([-45,-20,-128,-7,-100,-89,-73,-62+Math.sin(t*1.6)*9],'#cf8d57',20);
 ellipse(0,-25,62,48,fur);ellipse(13,-15,37,31,light);
 const stride=Math.sin(t*5)*14*moving;
 ellipse(-30+stride,12,18,24,fur);ellipse(31-stride,14,18,24,light);
 if(s.help>.01){ctx.save();ctx.translate(34+47*s.help,-29-29*s.help);ctx.rotate(s.help*.8);ellipse(8,-12,16,35,light);ctx.restore();}
 else ellipse(39+stride*.5,-1,15,29,light);
 ctx.save();ctx.translate(22,-82);ctx.rotate(Math.sin(t*.65)*.04*(1-s.sleep)+s.help*.12);
 poly([[-46,-17],[-43,-76],[-7,-39]],fur);poly([[11,-41],[49,-75],[53,-12]],fur);poly([[-36,-31],[-34,-60],[-15,-38]],'#d18d7d');poly([[22,-39],[41,-60],[44,-28]],'#d18d7d');ellipse(4,-13,59,48,fur);ellipse(6,6,40,28,'#f5d6aa');
 line([[-10,-52],[-6,-38]],'#be7f4c',5);line([[5,-56],[7,-41]],'#be7f4c',5);line([[22,-52],[19,-38]],'#be7f4c',5);
 const blink=Math.sin(t*1.1)> .992||s.sleep>.65;
 if(blink){curve([-24,-13,-19,-8,-12,-8,-7,-13],ink,3);curve([18,-13,23,-8,30,-8,35,-13],ink,3);}else{ellipse(-16,-12,5,7*(1-s.sleep*.7),ink);ellipse(28,-12,5,7*(1-s.sleep*.7),ink);ellipse(-14,-14,1.6,2,'#fff7df');ellipse(30,-14,1.6,2,'#fff7df');}
 ellipse(-33,4,10,5,'#e6a28a');ellipse(43,4,10,5,'#e6a28a');poly([[0,1],[12,1],[6,7]],'#b4776b');curve([6,7,1,16,-3,14,-6,12],ink,2);curve([6,7,11,16,15,14,18,11],ink,2);
 line([[-31,9],[-56,4]],ink,1.6);line([[-31,15],[-57,17]],ink,1.6);line([[39,9],[62,4]],ink,1.6);line([[39,15],[64,18]],ink,1.6);ctx.restore();ctx.restore();
 if(s.butterfly>0){ctx.save();ctx.globalAlpha=s.butterfly;ctx.translate(s.bx,s.by);const flutter=.55+Math.abs(Math.sin(t*(s.chapter===3?2:6)))*.45;ctx.scale(flutter,1);ellipse(-15,-8,20,25,'#d8aa88');ellipse(15,-8,20,25,'#d8aa88');ellipse(-12,15,14,16,'#ecd0a1');ellipse(12,15,14,16,'#ecd0a1');ellipse(-17,-10,9,12,'#f0d6b8');ellipse(17,-10,9,12,'#f0d6b8');ellipse(0,1,3,19,'#887159');line([[-1,-15],[-7,-25]],'#887159',1.5);line([[1,-15],[7,-25]],'#887159',1.5);ctx.restore();}
 if(s.heart>0){ctx.save();ctx.globalAlpha=s.heart;heart(855,340-Math.sin(t*.6)*7,.8);ctx.restore();}
 // A small visual wave of thanks; no written language inside the film.
 if(t>84&&t<93){const k=Math.sin((t-84)/9*Math.PI);ctx.save();ctx.globalAlpha=k;heart(s.bx+45,s.by-22,.45);ctx.restore();}
 if(s.sleep>.5){for(let i=0;i<3;i++){const k=(t*.16+i/3)%1;ctx.globalAlpha=(1-k)*s.sleep*.5;ellipse(s.x+65+k*32,414-k*55,4+k*6,4+k*6,'#fffaf0');}ctx.globalAlpha=1;}
 // Foreground foliage adds depth without obscuring the story.
 for(let i=0;i<9;i++){ellipse(15+i*22,732-i%3*8,34,24,'#9bb681');ellipse(1100+i*25,742-i%3*9,33,27,'#a6bb84');}
 ctx.fillStyle=`rgba(145,119,106,${s.sunset*.07})`;ctx.fillRect(0,0,1280,720);
}
