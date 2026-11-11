// Provisional timing metadata, not an audio-derived beat analysis.
export const MACARENA_MUSIC={reference:'https://www.youtube.com/watch?v=zAVPXPOS-c0',bpm:103,beatsPerPhrase:16,phrases:4,phaseVerified:false};
export function musicTiming({bpm=103,offset=0}={}){
 if(!Number.isFinite(bpm)||bpm<60||bpm>180||!Number.isFinite(offset)||offset<0||offset>600)throw new Error('Invalid music timing');
 const beatSeconds=60/bpm,duration=64*beatSeconds;
 return {bpm,offset,beatSeconds,duration,
  choreographyTime(seconds){if(!Number.isFinite(seconds))throw new Error('Invalid audio time');return Math.max(0,seconds-offset)/beatSeconds*.5;},
  beatTime(beat){if(!Number.isFinite(beat)||beat<0)throw new Error('Invalid beat');return offset+beat*beatSeconds;}};
}
