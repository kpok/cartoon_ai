import {clamp,smooth} from './story.js';
export const GARDEN_DURATION = 90;
export const gardenBeats = [0,7,15,23,30,36,48,57,67,77,85,90];
const pulse = (t,start,end) => smooth((t-start)/.8)*(1-smooth((t-end)/.8));
export function sampleGarden(seconds) {
  const t=clamp(Number.isFinite(seconds)?seconds:0,0,90);
  const phase=Math.min(10,Math.max(0,gardenBeats.findIndex((end,i)=>i>0&&t<end)-1));
  const actualPhase=t===90?10:phase;
  const firstDays=t>=36&&t<48;
  const laterDays=t>=67&&t<73;
  const night=firstDays?Math.sin((t-36)/6*Math.PI)**2:laterDays?Math.sin((t-67)/6*Math.PI)**2:0;
  const day=t<36?1:t<48?2+Math.floor((t-36)/6):t<67?5:t<73?12:18;
  return {
    t,phase:actualPhase,phaseProgress:clamp((t-gardenBeats[actualPhase])/(gardenBeats[actualPhase+1]-gardenBeats[actualPhase])),
    catX:-2.4+1.05*smooth(t/4),potX:.15+1.2*smooth((t-23)/5),
    seedDrop:smooth((t-8)/4),soilCover:smooth((t-12)/2.5),
    water:Math.max(pulse(t,16,21),pulse(t,41,43),pulse(t,61,63)),
    sprout:smooth((t-49)/5),leaves:smooth((t-57)/7),flower:smooth((t-72)/5),
    planting:pulse(t,7,14),checking:pulse(t,30,34),celebrate:pulse(t,80,89),night,day,
    needsWater:actualPhase===2||actualPhase===9,needsLight:actualPhase===3||actualPhase===7||actualPhase===9,needsTime:firstDays||laterDays||actualPhase===9,
  };
}
