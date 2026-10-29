// SPDX-License-Identifier: GPL-3.0-or-later
// Hand-timed from the supplied foreground dancer; no reference video/audio is bundled.
export const DURATION=40;
export const FPS=24;
// Measured independently from the supplied audio (13–28s); times include its43.104ms offset.
export const RHYTHM={period:.43793487803947007,accent:13.309488910485939};
export const CUES=[
 [0,5.8,'Boczne ruchy głowy'],[5.8,8.45,'Gesty przy barkach'],[8.45,9.6,'Powitanie'],
 [9.6,17.4,'Kołysanie i opuszczanie rąk'],[17.4,21.7,'Niewidzialna gitara'],
 [21.7,24.3,'Sprężysty przysiad'],[24.3,28.3,'Otwarte dłonie i zbliżenie rąk'],
 [28.3,32.2,'Pochylenie i otwarcie ramion'],[32.2,36.9,'Dłoń na piersi i obrót'],[36.9,40,'Gesty przy twarzy i powrót']
];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const window=(t,a,b,fade=.35)=>smooth((t-a)/fade)*smooth((b-t)/fade);
export function phaseAt(t){return CUES.find(([a,b])=>t>=a&&t<b)?.[2]??CUES[0][2];}
export function pose(seconds){
 const t=((seconds%DURATION)+DURATION)%DURATION;
 // A knee-down accent occurs on the measured sound grid, not half a beat later.
 const beat=2*Math.PI*(t-RHYTHM.accent)/RHYTHM.period+Math.PI,sway=Math.sin(beat/2),pulse=.5-.5*Math.cos(beat);
 const intro=window(t,0,6,.2)+window(t,37,40,.65);
 const wave=window(t,8.45,9.6,.20),guitar=window(t,17.4,21.7,.35);
 const squat=window(t,21.7,24.3,.55),palms=window(t,24.3,25.6,.30);
 const together=window(t,25.4,28.3,.35),bow=window(t,28.3,30.5,.45);
 const open=window(t,30.5,32.2,.35),chest=window(t,32.6,36.9,.35);
 const lowered=window(t,10.0,17.4,.4),turn=window(t,34.8,36.9,.35);
 // Keep the matched gestures and reserve only the final .35s for closing the silent loop.
 const seam=smooth(t/.25)*smooth((40-t)/.35);
 const result={
  headX:seam*(intro*.21*Math.sin(beat/2)+.035*Math.sin(beat/2-.3)),
  head:[seam*(.015*Math.sin(beat)-.10*bow),seam*(.035*Math.sin(beat/2-.3)+.13*guitar-.18*turn),seam*(-intro*.022*Math.sin(beat/2)+.025*sway)],
  torso:[seam*(.03*pulse+.35*squat+.30*bow-.06*guitar),seam*(.06*sway+.14*guitar-.48*turn),seam*(-.025*sway-.045*wave)],
  rootX:seam*.055*sway,rootY:-.024-seam*(.012*pulse+.18*squat+.09*bow),
  wide:seam*squat,footLift:[seam*.015*Math.max(0,Math.sin(beat/2)),seam*.015*Math.max(0,-Math.sin(beat/2))],
  arms:{}
 };
 for(const [side,sign] of [['Left',-1],['Right',1]]){
  let target=[sign*.78,.8+(side==='Right'?.025:0),.42];
  let hand=[-Math.PI/2,0,.07*Math.sin(beat+(side==='Right'?.7:0))];
  let shoulder=[0,0,0];
  const blend=(weight,point,orientation,offset=[0,0,0])=>{
   target=target.map((v,i)=>v+(point[i]-v)*weight);
   hand=hand.map((v,i)=>v+(orientation[i]-v)*weight);
   shoulder=shoulder.map((v,i)=>v+(offset[i]-v)*weight);
  };
  blend(lowered,[sign*.99,.48+.045*Math.sin(beat/2+(side==='Right'?1:0)),.30],[-.5,0,sign*.10*Math.sin(beat)]);
  if(side==='Left')blend(wave,[-1.04,1.30,.20],[-Math.PI,.08,.35*Math.sin(beat*1.4)],[0,.12,0]);
  else blend(wave,[.74,.61,.35],[-1.1,0,.1]);
  blend(guitar,side==='Left'?[-1.38,.63,.32]:[.69,.59+.045*Math.sin(beat),.39],side==='Left'?[0,0,-Math.PI/2]:[-.7,0,.20*Math.sin(beat)]);
  blend(squat,[sign*1.13,.40,.34],[0,0,sign*.15]);
  blend(palms,[sign*.83,.74,.49],[-Math.PI/2,sign*.4,sign*.2]);
  blend(together,[sign*.29,.78,.25],[0,0,-sign*Math.PI/2],[-sign*.20,0,0]);
  blend(bow,[sign*.85,.42,.33],[-.4,0,sign*.2]);
  blend(open,[sign*1.37,.49,.22],[-.4,0,sign*.65]);
  if(side==='Right')blend(chest,[.57,.96,.40],[0,0,-Math.PI/2],[-.10,.06,0]);
  blend(window(t,37.0,38.6,.25),[sign*.95,1.20+(side==='Right'?.03:0),.20],[-Math.PI,0,sign*.15],[0,.10,0]);
  if(side==='Left')blend(window(t,38.7,39.8,.25),[-1.35,.70,.30],[0,0,-Math.PI/2]);
  // The same held starting pose closes the loop; it never snaps to hanging arms.
  const ready=[sign*.78,.8+(side==='Right'?.025:0),.42];
  target=target.map((value,i)=>ready[i]+(value-ready[i])*seam);
  hand=hand.map((value,i)=>[-Math.PI/2,0,0][i]+(value-[-Math.PI/2,0,0][i])*seam);
  shoulder=shoulder.map(value=>value*seam);
  result.arms[side]={target,hand,shoulder};
 }
 return result;
}
