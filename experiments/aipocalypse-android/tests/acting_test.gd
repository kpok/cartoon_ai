extends SceneTree

func _initialize() -> void:
	call_deferred("_test")

func _values(actor: Dictionary) -> Array[float]:
	var values: Array[float] = []
	for mesh in actor["model"].find_children("*", "MeshInstance3D", true, false):
		if not mesh.mesh is ArrayMesh:
			continue
		for index in range(mesh.mesh.get_blend_shape_count()):
			values.append(mesh.get_blend_shape_value(index))
	return values

func _test() -> void:
	var scene = load("res://sample.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	var world = scene.world
	for role in ["paramedic", "astronaut"]:
		var actor: Dictionary = world.actors[role]
		var animation: Animation = actor["player"].get_animation("PhoneGesture")
		var morph_tracks := 0
		for index in range(animation.get_track_count()):
			if animation.track_get_type(index) == Animation.TYPE_BLEND_SHAPE:
				morph_tracks += 1
		assert(morph_tracks == 3)
		assert(actor["player"].get_animation_list().size() == 1)
		world._pose(actor, 0)
		var initial := _values(actor)
		assert(initial.size() == 3)
		for value in initial:
			assert(absf(value) < 0.001)
		world._pose(actor, 3.1)
		var skeleton: Skeleton3D = actor["skeleton"]
		var head := skeleton.get_bone_global_pose(skeleton.find_bone("head"))
		var phone: Transform3D = actor["device"].global_transform
		world._pose(actor, 3.4)
		assert(skeleton.get_bone_global_pose(skeleton.find_bone("head")).is_equal_approx(head))
		assert(actor["device"].global_transform.is_equal_approx(phone))
		for value in _values(actor):
			assert(absf(value) < 0.001)
		world._pose(actor, 3.8)
		assert(not skeleton.get_bone_global_pose(skeleton.find_bone("head")).is_equal_approx(head))
		for value in _values(actor):
			assert(value > 0.5)
		world._pose(actor, 5.0)
		var expression := _values(actor)
		var device: Node3D = actor["device"]
		assert(device.global_basis.y.normalized().dot(Vector3.UP) > 0.5)
		var face := skeleton.global_transform * skeleton.get_bone_global_pose(skeleton.find_bone("head"))
		var face_center := face.origin + face.basis.y.normalized() * 0.22
		assert(device.global_basis.z.normalized().dot((face_center - device.global_position).normalized()) > 0.5)
		world._pose(actor, 0)
		for value in _values(actor):
			assert(absf(value) < 0.001)
		world._pose(actor, 5.0)
		assert(_values(actor) == expression)
	world.apply_time(0)
	var wide_camera: Vector3 = world.camera.position
	world.apply_time(3.1)
	var reading_camera: Transform3D = world.camera.transform
	assert(world.camera.position.distance_to(wide_camera) > 1.0)
	world.apply_time(3.4)
	assert(world.camera.transform.is_equal_approx(reading_camera))
	world.apply_time(12)
	world.apply_time(3.4)
	assert(world.camera.transform.is_equal_approx(reading_camera))
	scene.queue_free()
	await process_frame
	print("Imported acting and expression tests passed")
	quit()
