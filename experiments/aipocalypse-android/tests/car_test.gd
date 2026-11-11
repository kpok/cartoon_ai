extends SceneTree
func _initialize() -> void:
	var car = load("res://assets/car.glb").instantiate()
	root.add_child(car)
	var wheels = car.find_children("Wheel_*", "Node3D", true, false)
	assert(wheels.size() == 4)
	for wheel in wheels:
		assert(is_equal_approx(wheel.position.y, 0.34))
		assert(absf(wheel.position.z) > 0.7)
		assert(wheel.basis.is_equal_approx(Basis.IDENTITY))
	print("Car chassis regression passed")
	quit()
