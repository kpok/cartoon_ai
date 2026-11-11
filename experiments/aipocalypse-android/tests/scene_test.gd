extends SceneTree

func _initialize() -> void:
	call_deferred("_test")

func _test() -> void:
	var scene = load("res://main.tscn").instantiate()
	root.add_child(scene)
	scene.set_process(false)
	scene._control("Start")
	scene.clock.advance(2.0)
	scene._notification(MainLoop.NOTIFICATION_APPLICATION_PAUSED)
	assert(not scene.clock.playing)
	scene.clock.advance(2.0)
	assert(scene.clock.elapsed == 2.0)
	scene._control("Start")
	assert(scene.clock.playing)
	scene._control("Pauza")
	assert(not scene.clock.playing)
	scene._control("Restart")
	assert(scene.clock.elapsed == 0.0 and not scene.clock.playing)
	assert(scene.sound.stream.data.size() == 8820)
	assert(scene.status.text.contains("0.0 / 8.0"))
	scene.queue_free()
	await process_frame
	print("Scene integration tests passed")
	quit()
