extends SceneTree
func _initialize() -> void:
	call_deferred("_test")
func _test() -> void:
	var scene = load("res://main.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	var maximum_nodes := 0
	for shot in scene.timeline.shots:
		scene.clock.seek(float(shot["start"]) + 0.01)
		scene._update_frame()
		assert(scene.world.current_shot["id"] == shot["id"])
		assert(scene.world.props.size() == shot["models"].size() or shot["environment"] == "black")
		assert(scene.world.camera.global_position.is_finite())
		maximum_nodes = maxi(maximum_nodes, scene.world.node_count())
		if shot.get("signature") is Dictionary and shot["signature"]["mode"] == "screen":
			scene.clock.seek(float(shot["signature"]["start"]) + 0.01)
			scene._update_frame()
			assert(scene.world.signature_label != null and scene.world.signature_label.visible)
			var label: Label3D = scene.world.signature_label
			var screen_mesh: MeshInstance3D = label.get_parent().get_child(1)
			assert(label.position.z > screen_mesh.position.z + screen_mesh.mesh.size.z / 2, "Screen text must lie in front of opaque display surface")
		if shot["environment"] == "black":
			assert(scene.card_panel.visible and not scene.world.visible and not scene.ui.visible)
	assert(maximum_nodes < 1800)
	# Repeated location swaps must not leave old shot subtrees alive.
	var counts: Array[int] = []
	for pass_index in range(2):
		for seq in scene.timeline.sequences:
			scene.clock.seek(seq["start"])
			scene._update_frame()
			await process_frame
			if pass_index == 0:
				counts.append(scene.world.node_count())
			else:
				assert(scene.world.node_count() == counts[int(seq["number"]) - 1])
	# Critical cues must change rendered state and reset when seeking backwards.
	scene.clock.seek(413.1)
	scene._update_frame()
	var daylight: float = scene.world.key_light.light_energy
	scene.clock.seek(417.5)
	scene._update_frame()
	assert(scene.world.key_light.light_energy < daylight)
	assert(not scene.world.window_nodes[0].visible and scene.world.window_nodes[14].visible)
	scene.clock.seek(413.1)
	scene._update_frame()
	assert(scene.world.key_light.light_energy == daylight and scene.world.window_nodes[0].visible)
	for t in [476.0, 521.0, 554.0]:
		scene.clock.seek(t)
		scene._update_frame()
		assert(scene.world.scene_root.get_child_count() > 0)
		# Exterior kits have no room walls: floor slabs are thin.
		for child in scene.world.scene_root.get_children():
			if child is MeshInstance3D and child.mesh is BoxMesh:
				assert(child.mesh.size.y < 0.2)
	scene.clock.seek(712.0)
	scene._update_frame()
	assert(scene.world.scene_root.find_children("IgnitionFlame", "", true, false).size() == 1)
	scene.clock.seek(171.6)
	scene._update_frame()
	assert(scene.flash_panel.color.a > 0.7)
	scene.clock.seek(1.0)
	scene._update_frame()
	assert(scene.world.focus_kind == "signal")
	for dialogue in scene.timeline.data["dialogues"]:
		if dialogue["start"] < 845:
			scene.clock.seek(dialogue["start"] + 0.01)
			scene._update_frame()
			scene._control("Obraz")
			assert(scene.subtitle.is_visible_in_tree() and not scene.ui.visible)
			break
	scene._control("Restart")
	scene._control("Start")
	scene._scrub_start()
	scene._scrub(600)
	assert(not scene.clock.playing and scene.world.current_shot["seq"] == 16)
	scene._scrub_end(true)
	assert(scene.clock.playing)
	scene._notification(MainLoop.NOTIFICATION_APPLICATION_PAUSED)
	assert(not scene.clock.playing)
	scene._jump_sequence(17)
	assert(scene.clock.elapsed == 685 and scene.world.current_shot["seq"] == 18)
	for time in [845.0, 849.0, 852.0, 860.0, 862.0, 869.0, 870.0]:
		scene.clock.seek(time)
		scene._update_frame()
		assert(scene.card_text.text == scene.timeline.card_at(time))
		assert(not scene.ui.visible and scene.subtitle.text.is_empty())
		assert(scene.flash_panel.color.a == 0)
	assert(not scene.clock.playing)
	var tap := InputEventScreenTouch.new()
	tap.pressed = true
	scene._unhandled_input(tap)
	scene._update_frame()
	assert(scene.ui.visible)
	scene._control("Start")
	assert(scene.clock.elapsed == 0 and scene.clock.playing)
	scene.queue_free()
	await process_frame
	print("Full animatic149shots, controls and bounded scenes passed; max nodes ", maximum_nodes)
	quit()
