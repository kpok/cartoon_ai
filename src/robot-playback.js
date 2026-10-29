// Keep the animation clock independent of camera controls and hidden-tab time.
export class DanceClock {
 constructor(duration) {if(!Number.isFinite(duration)||duration<=0)throw new Error('Invalid duration');this.duration=duration;this.time=0;this.playing=false;this.last=null;}
 setPlaying(value) {this.playing=Boolean(value);this.last=null;}
 seek(value) {if(Number.isFinite(value)){this.time=Math.max(0,Math.min(this.duration-1e-5,value));this.last=null;}}
 suspend() {this.last=null;}
 restart() {this.time=0;this.last=null;}
 tick(now) {if(!Number.isFinite(now))return this.time;if(this.playing){if(this.last!==null)this.time=(this.time+Math.max(0,now-this.last)/1000)%this.duration;this.last=now;}return this.time;}
}
