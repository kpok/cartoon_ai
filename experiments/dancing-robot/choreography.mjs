// SPDX-License-Identifier: GPL-3.0-or-later
// Hand-timed from the supplied foreground dancer; no reference video/audio is bundled.
export const DURATION=40;
export const FPS=24;
export const CUES=[
 [0,5.8,'Boczne ruchy głowy'],[5.8,8.5,'Gesty przy barkach'],[8.5,11.3,'Powitanie'],
 [11.3,17.4,'Kołysanie i zmiana podparcia'],[17.4,21.6,'Niewidzialna gitara'],
 [21.6,23.8,'Sprężysty przysiad'],[23.8,28.2,'Otwarte dłonie i zbliżenie rąk'],
 [28.2,32.2,'Pochylenie i otwarcie ramion'],[32.2,36.8,'Dłoń na piersi'],[36.8,40,'Gesty przy twarzy i powrót']
];
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const window=(t,a,b,fade=.35)=>smooth((t-a)/fade)*smooth((b-t)/fade);
export function phaseAt(t){return CUES.find(([a,b])=>t>=a&&t<b)?.[2]??CUES[0][2];}
export function pose(seconds){
 const t=((seconds%DURATION)+DURATION)%DURATION;
 // The first complete phrase spans about .52s per pulse in the recording.
 const beat=2*Math.PI*t/.52,sway=Math.sin(beat/2),pulse=.5-.5*Math.cos(beat);
 const intro=window(t,0,6,.2)+window(t,37,40,.65);
 const wave=window(t,8.5,11.3,.45),guitar=window(t,17.4,21.6,.5);
 const squat=window(t,21.6,23.8,.65),palms=window(t,23.8,27.8,.5);
 const together=window(t,25.1,28.2,.6),bow=window(t,28.2,30.3,.55);
 const open=window(t,30.1,32.2,.55),chest=window(t,32.2,36.8,.5);
 // Fade to the identical start pose during the final .6s, including all oscillators.
 const seam=smooth(t/.25)*smooth((40-t)/.6);
 const result={
  headX:seam*(intro*.21*Math.sin(beat/2)+.035*Math.sin(beat/2-.3)),
  head:[seam*(.015*Math.sin(beat)-.10*bow),seam*(.035*Math.sin(beat/2-.3)+.13*guitar),seam*(-intro*.022*Math.sin(beat/2)+.025*sway)],
  torso:[seam*(.03*pulse+.24*squat+.14*bow-.06*guitar),seam*(.06*sway+.14*guitar),seam*(-.025*sway-.045*wave)],
  rootX:seam*.055*sway,rootY:-.024-seam*(.012*pulse+.135*squat+.06*bow),
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
  if(side==='Left')blend(wave,[-1.04,1.30,.20],[-Math.PI,.08,.35*Math.sin(beat*1.4)],[0,.12,0]);
  else blend(wave,[.74,.61,.35],[-1.1,0,.1]);
  blend(guitar,side==='Left'?[-1.38,.63,.32]:[.69,.59+.045*Math.sin(beat),.39],side==='Left'?[0,0,-Math.PI/2]:[-.7,0,.20*Math.sin(beat)]);
  blend(squat,[sign*1.13,.40,.34],[0,0,sign*.15]);
  blend(palms,[sign*.83,.74,.49],[-Math.PI/2,sign*.4,sign*.2]);
  blend(together,[sign*.29,.78,.25],[0,0,-sign*Math.PI/2],[-sign*.20,0,0]);
  blend(bow,[sign*.85,.42,.33],[-.4,0,sign*.2]);
  blend(open,[sign*1.37,.49,.22],[-.4,0,sign*.65]);
  if(side==='Right')blend(chest,[.57,.96,.40],[0,0,-Math.PI/2],[-.10,.06,0]);
  blend(window(t,36.8,39.2,.5),[sign*.95,1.20+(side==='Right'?.03:0),.20],[-Math.PI,0,sign*.15],[0,.10,0]);
  // The same held starting pose closes the loop; it never snaps to hanging arms.
  const ready=[sign*.78,.8+(side==='Right'?.025:0),.42];
  target=target.map((value,i)=>ready[i]+(value-ready[i])*seam);
  hand=hand.map((value,i)=>[-Math.PI/2,0,0][i]+(value-[-Math.PI/2,0,0][i])*seam);
  shoulder=shoulder.map(value=>value*seam);
  result.arms[side]={target,hand,shoulder};
 }
 return result;
}
