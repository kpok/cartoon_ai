extends SceneTree

func _initialize() -> void:
	call_deferred("_test")

func _test() -> void:
	var scene = load("res://main.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	assert(scene.wheels.size() == 4)
	var triangles := 0
	var model_bounds := AABB()
	var first_mesh := true
	for mesh in scene.object.find_children("*", "MeshInstance3D", true, false):
		var bounds: AABB = mesh.global_transform * mesh.get_aabb()
		model_bounds = bounds if first_mesh else model_bounds.merge(bounds)
		first_mesh = false
		for surface in range(mesh.mesh.get_surface_count()):
			var arrays: Array = mesh.mesh.surface_get_arrays(surface)
			triangles += arrays[Mesh.ARRAY_INDEX].size() / 3
	assert(not first_mesh and triangles > 100 and triangles < 20000)
	assert(model_bounds.position.is_finite() and model_bounds.size.is_finite())
	assert(model_bounds.size.x > 3.5 and model_bounds.size.x < 4.0)
	assert(model_bounds.size.y > 1.2 and model_bounds.size.y < 1.6)
	assert(absf(model_bounds.position.y) < 0.01)
	for wheel in scene.wheels:
		assert(is_equal_approx(wheel.position.y, 0.34))
		assert(absf(wheel.position.z) > 0.7)
		assert(wheel.basis.is_equal_approx(Basis.IDENTITY))
	assert(scene.object.rotation.is_zero_approx())
	scene._control("Start")
	scene.clock.advance(2.0)
	scene._update_frame()
	assert(is_equal_approx(scene.object.position.x, -1.25))
	for wheel in scene.wheels:
		assert(is_equal_approx(wheel.rotation.z, -1.25 / 0.34))
		assert(wheel.basis.z.is_equal_approx(Vector3(0, 0, 1)))
	scene._notification(MainLoop.NOTIFICATION_APPLICATION_PAUSED)
	assert(not scene.clock.playing)
	scene.clock.advance(2.0)
	assert(scene.clock.elapsed == 2.0)
	scene._update_frame()
	assert(is_equal_approx(scene.object.position.x, -1.25))
	scene._control("Start")
	assert(scene.clock.playing)
	scene._control("Pauza")
	assert(not scene.clock.playing)
	scene._control("Restart")
	assert(scene.clock.elapsed == 0.0 and not scene.clock.playing)
	assert(scene.object.rotation.is_zero_approx())
	assert(is_equal_approx(scene.object.position.x, -2.5))
	for wheel in scene.wheels:
		assert(wheel.rotation.is_zero_approx())
	assert(scene.sound.stream.data.size() == 8820)
	assert(scene.status.text.contains("0.0 / 8.0"))
	scene.queue_free()
	await process_frame
	print("Scene integration tests passed")
	quit()
