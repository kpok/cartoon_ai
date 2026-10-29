// Measure tempo and phase independently; matching tempo alone can still be off-beat.
export function assessPulse(events,reference){
 const expected=reference.pulse_candidate_seconds,origin=reference.grid_origin_seconds;
 const meanIndex=(events.length-1)/2,meanTime=events.reduce((a,b)=>a+b,0)/events.length;
 let top=0,bottom=0;for(let i=0;i<events.length;i++){top+=(i-meanIndex)*(events[i]-meanTime);bottom+=(i-meanIndex)**2;}
 const period=top/bottom;
 const errors=events.map(time=>Math.abs(time-(origin+Math.round((time-origin)/expected)*expected))).sort((a,b)=>a-b);
 const maxError=errors.length?errors.at(-1):Infinity,medianError=errors.length?errors[Math.floor(errors.length/2)]:Infinity;
 const range=reference.expected_animation_pulse_period_range;
 return {pass:events.length>=8&&Number.isFinite(period)&&period>=range[0]&&period<=range[1]&&maxError<=1/48+.012&&medianError<=1/48,
  measured_animation_pulse_seconds:period,reference_pulse_candidate_seconds:expected,period_difference_percent:(period/expected-1)*100,
  phase_max_error_seconds:maxError,phase_median_error_seconds:medianError,pulse_events_seconds:events,
  criterion:'At least8 knee-down accents, period within15ms of reference and phase errors max32.84ms/median20.84ms (half a24fps frame plus measured12ms audio-grid uncertainty). This is not a visual similarity or lyric-recognition test.'};
}
