extends SceneTree

func _initialize() -> void:
	call_deferred("_test")

func _test() -> void:
	var scene = load("res://main.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	var world = scene.world
	for role in ["paramedic", "astronaut"]:
		var actor: Dictionary = world.actors[role]
		var skeleton: Skeleton3D = actor["skeleton"]
		assert(skeleton.get_bone_count() == 15)
		assert(skeleton.find_bone("head") >= 0)
		assert(actor["player"].has_animation("PhoneGesture"))
		assert(is_equal_approx(actor["player"].get_animation("PhoneGesture").length, 5.0))
		assert(actor["attachment"].bone_name == "right_hand")
		assert(actor["device"].get_parent() == actor["attachment"])
		var triangles := 0
		var skinned_meshes := 0
		var blended_vertices := 0
		for mesh in actor["model"].find_children("*", "MeshInstance3D", true, false):
			assert(mesh.mesh.get_aabb().size.is_finite())
			if mesh.skin != null:
				skinned_meshes += 1
			for surface in range(mesh.mesh.get_surface_count()):
				var arrays: Array = mesh.mesh.surface_get_arrays(surface)
				triangles += arrays[Mesh.ARRAY_INDEX].size() / 3
				if mesh.skin != null:
					var weights: PackedFloat32Array = arrays[Mesh.ARRAY_WEIGHTS]
					var vertices: PackedVector3Array = arrays[Mesh.ARRAY_VERTEX]
					assert(weights.size() == vertices.size() * 4)
					for vertex in range(vertices.size()):
						var total := 0.0
						var influences := 0
						for weight in range(4):
							assert(weights[vertex * 4 + weight] >= 0)
							total += weights[vertex * 4 + weight]
							if weights[vertex * 4 + weight] > 0.001:
								influences += 1
						assert(absf(total - 1.0) < 0.001)
						if influences > 1:
							blended_vertices += 1
		assert(skinned_meshes >= 8 and triangles > 1000 and triangles < 50000)
		assert(blended_vertices >= 20)
		assert(actor["screen"].text == "Hacked by\nAIpokalypse")
	var attachment = world.actors["paramedic"]["attachment"]
	var device = world.actors["paramedic"]["device"]
	var local_transform: Transform3D = device.transform
	var initial_position: Vector3 = Vector3.ZERO
	for time in [0.0, 2.5, 5.0]:
		world.apply_time(time)
		await process_frame
		world.apply_time(time)
		assert(device.transform.is_equal_approx(local_transform))
		var skeleton: Skeleton3D = world.actors["paramedic"]["skeleton"]
		var bone := skeleton.get_bone_global_pose(skeleton.find_bone("right_hand"))
		assert(attachment.global_transform.is_equal_approx(skeleton.global_transform * bone))
		assert(device.global_position.is_finite())
		if time == 0:
			initial_position = device.global_position
		else:
			assert(device.global_position.distance_to(initial_position) > 0.2)
	world.apply_time(10.0)
	var held_position: Vector3 = device.global_position
	assert(world.current_shot == 1)
	assert(world.camera.global_position.distance_to(held_position) < 0.31)
	assert(not world.camera.is_position_behind(held_position))
	world.apply_time(14.99)
	assert(device.global_position.is_equal_approx(held_position))
	world.apply_time(15.0)
	assert(world.current_shot == 2 and world.orbit.visible and not world.street.visible)
	assert(world.orbit_screen.text == "Hacked by\nAIpokalypse")
	world.apply_time(20.0)
	var orbit_pose: Transform3D = world.actors["astronaut"]["device"].global_transform
	world.apply_time(25.0)
	world.apply_time(20.0)
	assert(world.actors["astronaut"]["device"].global_transform.is_equal_approx(orbit_pose))
	scene._control("Start")
	scene.clock.advance(2.0)
	scene._notification(MainLoop.NOTIFICATION_APPLICATION_PAUSED)
	assert(not scene.clock.playing)
	scene.clock.advance(3.0)
	assert(scene.clock.elapsed == 2.0)
	scene._control("Start")
	assert(scene.clock.playing)
	scene._control("Pauza")
	assert(not scene.clock.playing)
	scene._control("Restart")
	assert(scene.clock.elapsed == 0.0 and not scene.clock.playing)
	assert(world.current_shot == 0 and world.street.visible and not world.orbit.visible)
	assert(device.global_position.is_equal_approx(initial_position))
	assert(scene.sound.stream.data.size() == 8820)
	scene.queue_free()
	await process_frame
	print("Human sample integration tests passed")
	quit()
