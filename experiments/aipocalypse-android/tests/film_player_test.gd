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
