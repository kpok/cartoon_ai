// SPDX-License-Identifier: GPL-3.0-or-later
// Deterministic mechanical expressions; not lip-sync or speech generation.
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const blink=(t,at,length=.18)=>smooth((t-at)/.075)*smooth((at+length-t)/.075);
export function expression(time,heyWeight=0,heyCues=[]){
 const t=((time%40)+40)%40,seam=smooth(t/.3)*smooth((40-t)/.35);
 const natural=Math.max(...[1.72,4.05,6.3,12.65,17.45,22.1,27.8,31.4,36].map(at=>blink(t,at)));
 return {leftBlink:Math.max(natural,...heyCues.map(peak=>blink(t,peak+.10,.20))),rightBlink:natural,
  gazeX:seam*.022*Math.sin(t*Math.PI/2),gazeY:seam*(.009*Math.sin(t*Math.PI)+.012*heyWeight),
  browLeft:seam*(.045*Math.sin(t*Math.PI/2)+.07*heyWeight),browRight:seam*(-.025*Math.sin(t*Math.PI/2)+.04*heyWeight),
  smileY:-seam*(.012+.025*heyWeight),smileRoll:seam*.012*Math.sin(t*Math.PI/2)};
}
