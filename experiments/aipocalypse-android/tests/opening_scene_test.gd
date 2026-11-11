extends SceneTree
const Motion = preload("res://opening_motion.gd")
func _initialize() -> void:
	call_deferred("_test")
func _seek(scene: Node3D, time: float) -> void:
	scene.clock.seek(time)
	scene._update_frame()
func _onscreen(camera: Camera3D, point: Vector3, viewport: Vector2) -> void:
	assert(not camera.is_position_behind(point))
	var pixel := camera.unproject_position(point)
	assert(Rect2(Vector2(12, 12), viewport - Vector2(24, 24)).has_point(pixel), "Critical subject outside shot")
func _test() -> void:
	var scene = load("res://main.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	_seek(scene, 15.1)
	var opening = scene.world.opening
	assert(opening.stop_lines.size() == 4)
	var viewport: Vector2 = root.get_visible_rect().size
	for signal_node in opening.signals:
		var lamp: Node3D = signal_node.get_node("Green")
		_onscreen(scene.world.camera, lamp.global_position, viewport)
		var facing: Vector3 = signal_node.global_basis.z.normalized()
		assert(facing.dot((scene.world.camera.global_position - lamp.global_position).normalized()) > 0.2)
	assert(absf(opening.signals[0].global_basis.z.dot(opening.signals[1].global_basis.z)) < 0.001)
	var taxi_body: MeshInstance3D = opening.taxi_model.find_child("Body", true, false)
	var van_body: MeshInstance3D = opening.van_model.find_child("Body", true, false)
	var taxi_box: AABB = taxi_body.global_transform * taxi_body.get_aabb()
	var van_box: AABB = van_body.global_transform * van_body.get_aabb()
	assert(taxi_box.intersects(van_box), "Staged collision must have actual model bounds contact")
	_onscreen(scene.world.camera, opening.taxi.position + Vector3.UP, viewport)
	_onscreen(scene.world.camera, opening.van.position + Vector3.UP, viewport)
	for cut in [4.0, 7.0, 11.0, 14.0, 18.0, 22.0, 29.0]:
		_seek(scene, cut - 0.0001)
		var before: Vector3 = scene.world.opening.taxi.global_position
		_seek(scene, cut + 0.0001)
		assert(before.distance_to(scene.world.opening.taxi.global_position) < 0.001)
	_seek(scene, 32.0)
	opening = scene.world.opening
	var stopped: Transform3D = opening.taxi.transform
	var held: Transform3D = opening.phone.global_transform
	var rig: Skeleton3D = opening.bystander.skeleton
	assert(opening.phone_attachment.transform.is_equal_approx(rig.get_bone_global_pose(rig.find_bone("right_hand"))))
	assert(opening.phone.get_parent() == opening.phone_attachment)
	_onscreen(scene.world.camera, opening.bystander.node.global_position + Vector3(0, 1.3, 0), viewport)
	_onscreen(scene.world.camera, opening.taxi_driver.node.global_position + Vector3(0, 1.1, 0), viewport)
	_seek(scene, 34.9)
	assert(stopped.is_equal_approx(scene.world.opening.taxi.transform))
	_seek(scene, 19)
	assert(scene.world.opening.cup.rotation.z > 1.5)
	_seek(scene, 5)
	assert(scene.world.opening.cup.rotation.z == 0)
	assert(not scene.world.opening.bystander.node.visible)
	_seek(scene, 600)
	assert(scene.world.opening == null)
	_seek(scene, 32)
	assert(stopped.is_equal_approx(scene.world.opening.taxi.transform))
	assert(held.is_equal_approx(scene.world.opening.phone.global_transform))
	_seek(scene, 34.9)
	scene.ui.show()
	for t in [35.0, 38.0, 47.99, 48.0, 54.99]:
		_seek(scene, t)
		assert(scene.card_text.text == scene.timeline.card_at(t))
		assert(scene.card_text.offset_top == 380)
		assert(not scene.ui.visible, "Controls must not obscure opening cards")
	_seek(scene, 845)
	_seek(scene, 36)
	assert(not scene.ui.visible)
	var tap := InputEventScreenTouch.new()
	tap.pressed = true
	scene._unhandled_input(tap)
	scene._update_frame()
	assert(scene.ui.visible)
	_seek(scene, 55)
	assert(scene.card_text.offset_top == 80 and scene.world.opening == null)
	_seek(scene, 34)
	scene._control("Obraz")
	_seek(scene, 36)
	_seek(scene, 55)
	assert(not scene.ui.visible, "Manual clean viewing must survive opening cards")
	scene.queue_free()
	await process_frame
	print("Opening set: model contact, two green axes, framing, cup reset, attached phone, continuity and cards passed")
	quit()
