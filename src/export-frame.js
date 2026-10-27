import {render} from './draw.js';
import {episodes,meadowVisualTime,episodeCueAt,gardenNote} from './episodes.js';
import {sampleGarden} from './garden-state.js';

const query=new URLSearchParams(location.search);
const story=query.get('story')||'meadow',locale=query.get('lang')||'pl';
const episode=episodes[story];
const width=Number(query.get('width')),height=Number(query.get('height'));
if(!Object.hasOwn(episodes,story)||!['pl','en'].includes(locale)||!Number.isInteger(width)||!Number.isInteger(height)||width<180||width>3840||height<180||height>3840)throw new Error('Invalid render settings');
const portrait=width<height,canvas=document.querySelector('#frame');
canvas.width=width;canvas.height=height;
const ctx=canvas.getContext('2d');
const scene=document.createElement('canvas');scene.width=width;scene.height=height;
Object.assign(scene.style,{width:`${width}px`,height:`${height}px`,position:'absolute',left:'0',top:'0'});
// Keep a real layout size for WebGL without exposing an extra page screenshot layer.
if(story==='garden')document.body.append(scene);
let garden=null;
if(story==='garden'){const {createGardenView}=await import('./garden-view.js');garden=createGardenView(scene,{onContextLost:()=>{throw new Error('WebGL context lost during export');}});}
function label(text,y,{size,maxWidth,fill='#fffdf3ed',color='#354d43'}={}){
 ctx.font=`600 ${size}px "Trebuchet MS", sans-serif`;
 const lines=[];let line='';for(const word of text.split(' ')){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 const lineHeight=size*1.35,padding=size*.6,boxWidth=Math.min(maxWidth,Math.max(...lines.map(l=>ctx.measureText(l).width)))+padding*2;
 ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(width*.46-boxWidth/2,y-padding,boxWidth,lines.length*lineHeight+padding*2,size*.55);ctx.fill();
 ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='top';lines.forEach((l,i)=>ctx.fillText(l,width*.46,y+i*lineHeight));
}
window.renderFrame=seconds=>{
 if(!Number.isFinite(seconds))throw new Error('Frame timestamp must be finite');
 const t=Math.max(0,Math.min(episode.duration,seconds)),cue=episodeCueAt(t,locale,story);
 const options={talking:query.get('dialogue')!=='none'&&Boolean(cue),speaker:cue?.speakerId,portrait};
 ctx.clearRect(0,0,width,height);
 if(garden){garden.render(t,options);ctx.drawImage(scene,0,0,width,height);}else render(ctx,meadowVisualTime(t),options);
 const unit=width/(portrait?1080:1920);
 if(story==='garden')label(gardenNote(sampleGarden(t),locale),height*(portrait?.13:.05),{size:(portrait?32:28)*unit,maxWidth:width*.72});
 if(query.get('captions')!=='false'&&cue)label(`${cue.speaker}: ${cue.text}`,height*(portrait?.73:.87),{size:(portrait?46:34)*unit,maxWidth:width*(portrait?.7:.8)});
};
window.renderFrame(0);
if(story==='garden')scene.style.visibility='hidden';
window.exportReady=true;
