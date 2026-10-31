import {UPDATE_CUES,UPDATE_DURATION} from './dance-update-story.js';
export const UPDATE_SAMPLE_RATE=48000;
export const effectDuration=kind=>({update:.28,click:.045,tap:.10,success:.65})[kind];
function noise(i){let n=(i+1)|0;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return ((n^(n>>>16))>>>0)/2147483648-1;}
export function effectSample(kind,t){
 const duration=effectDuration(kind);if(!duration||t<0||t>=duration)return 0;
 const edge=Math.min(1,t/.004,(duration-t)/.012);
 if(kind==='click')return edge*Math.exp(-t*90)*noise(Math.floor(t*UPDATE_SAMPLE_RATE));
 if(kind==='tap')return edge*Math.exp(-t*45)*(.75*Math.sin(2*Math.PI*110*t)+.25*noise(Math.floor(t*UPDATE_SAMPLE_RATE)));
 if(kind==='update'){const f=t<.13?660:990;return edge*.65*Math.sin(2*Math.PI*f*t);}
 const note=Math.min(2,Math.floor(t/.18)),f=[523.25,659.25,783.99][note];
 return edge*Math.min(1,(t-note*.18)/.008)*Math.exp(-((t-note*.18)*5))*.65*Math.sin(2*Math.PI*f*t);
}
export function updateSamples(duration=UPDATE_DURATION){
 if(!Number.isFinite(duration)||duration<=0||duration>UPDATE_DURATION)throw new Error('Invalid update audio duration');
 const samples=new Float32Array(Math.round(duration*UPDATE_SAMPLE_RATE));
 for(const cue of UPDATE_CUES){
  const start=Math.round(cue.time*UPDATE_SAMPLE_RATE),count=Math.ceil(effectDuration(cue.kind)*UPDATE_SAMPLE_RATE);
  for(let i=0;i<count&&start+i<samples.length;i++)samples[start+i]+=cue.gain*effectSample(cue.kind,i/UPDATE_SAMPLE_RATE);
 }
 // A fixed ceiling preserves dynamics and prevents overlapping cues from clipping.
 for(let i=0;i<samples.length;i++)samples[i]=Math.max(-.85,Math.min(.85,samples[i]));
 return samples;
}
