import test from 'node:test';
import assert from 'node:assert/strict';
import {assessPulse} from '../scripts/robot-sync-metrics.mjs';
const reference={pulse_candidate_seconds:.43793487803947007,grid_origin_seconds:13.309488910485939,expected_animation_pulse_period_range:[.422934878,.452934878]};
test('music sync rejects wrong phase even when tempo is correct',()=>{
 const events=Array.from({length:12},(_,i)=>reference.grid_origin_seconds+i*reference.pulse_candidate_seconds);
 assert.equal(assessPulse(events,reference).pass,true);
 assert.equal(assessPulse(events.map(t=>Math.round(t*24)/24),reference).pass,true);
 assert.equal(assessPulse(events.map(t=>t+reference.pulse_candidate_seconds/2),reference).pass,false);
 assert.equal(assessPulse(events.map((t,i)=>t+i*.08),reference).pass,false);
 assert.equal(assessPulse([],reference).pass,false);
});
