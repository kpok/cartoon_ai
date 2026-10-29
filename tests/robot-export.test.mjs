import test from 'node:test';
import assert from 'node:assert/strict';
import {robotSettings} from '../scripts/export-robot.mjs';
test('robot MP4 export bounds resolution, duration and frame count',()=>{
 const config=robotSettings([]);assert.deepEqual([config.width,config.height,config.fps,config.frames],[720,1280,24,960]);
 for(const args of [['--width','721'],['--width','NaN'],['--duration','41'],['--duration','0'],['--duration','0.01'],['--out','film.webm']])assert.throws(()=>robotSettings(args));
 assert.equal(robotSettings(['--width','360','--duration','0.5']).frames,12);
});
