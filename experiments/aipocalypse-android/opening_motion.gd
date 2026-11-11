extends RefCounted

const CONTACT := 15.1
const STOP := 17.6

static func state(time: float) -> Dictionary:
	var t := clampf(time, 0, 35)
	var taxi := Vector3(lerpf(-11.0, -1.3, clampf((t - 4.0) / (CONTACT - 4.0), 0, 1)), 0, 1.2)
	var van_z := -10.0
	if t >= 7 and t < 11:
		van_z = lerpf(-10.0, -5.0, (t - 7) / 4)
	elif t >= 11:
		var brake := clampf((t - 11) / (CONTACT - 11), 0, 1)
		van_z = lerpf(-5.0, -1.2, 1 - pow(1 - brake, 2))
	var spin := 0.0
	if t >= CONTACT:
		var slide := clampf((t - CONTACT) / (STOP - CONTACT), 0, 1)
		var ease := 1 - pow(1 - slide, 3)
		taxi = Vector3(-1.3, 0, 1.2).lerp(Vector3(1.4, 0, 3.1), ease)
		spin = -0.85 * ease
		van_z += 0.45 * ease
	return {"taxi":taxi, "taxi_yaw":spin, "van":Vector3(1.1, 0, van_z), "van_yaw":-PI / 2, "impact":t >= CONTACT, "stopped":t >= STOP}
