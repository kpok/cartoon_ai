extends SceneTree
const Motion = preload("res://opening_motion.gd")
func _initialize() -> void:
	var impact := Motion.state(Motion.CONTACT)
	# The imported car bounds are 3.6 m along X and 1.55 m across Z.
	var taxi_bounds := Rect2(Vector2(impact.taxi.x - 1.8, impact.taxi.z - 0.775), Vector2(3.6, 1.55))
	var van_bounds := Rect2(Vector2(impact.van.x - 0.775, impact.van.z - 1.8), Vector2(1.55, 3.6))
	assert(taxi_bounds.intersects(van_bounds))
	assert(not Motion.state(14).impact and impact.impact)
	for cut in [4.0, 7.0, 11.0, 14.0, 18.0, 22.0, 29.0]:
		var before := Motion.state(cut - 0.0001)
		var after := Motion.state(cut + 0.0001)
		assert(before.taxi.distance_to(after.taxi) < 0.001)
		assert(before.van.distance_to(after.van) < 0.001)
	assert(Motion.state(18).taxi == Motion.state(34.9).taxi)
	assert(Motion.state(18).van == Motion.state(34.9).van)
	assert(Motion.state(7).van_yaw == -PI / 2)
	print("Opening trajectories: orthogonal contact, cut continuity and stopped aftermath passed")
	quit()
