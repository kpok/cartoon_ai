extends Node3D

const Playback = preload("res://playback.gd")
var clock = Playback.new()
var object: MeshInstance3D
var status: Label
var sound: AudioStreamPlayer

func _ready() -> void:
	RenderingServer.set_default_clear_color(Color("080b12"))
	var camera := Camera3D.new()
	camera.position = Vector3(0, 3, 9)
	add_child(camera)
	camera.look_at(Vector3(0, 0, 0))
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-45, -30, 0)
	light.light_energy = 1.5
	add_child(light)
	object = MeshInstance3D.new()
	object.mesh = BoxMesh.new()
	var material := StandardMaterial3D.new()
	material.albedo_color = Color("bd1527")
	material.metallic = 0.4
	object.material_override = material
	add_child(object)
	var board := Label3D.new()
	board.text = "Hacked by AIpokalypse"
	board.position = Vector3(0, 1.4, 0)
	board.font_size = 64
	board.pixel_size = 0.006
	board.modulate = Color("ff344b")
	add_child(board)
	_build_ui()
	_build_sound()
	_update_frame()

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 12)
	layer.add_child(root)
	var logo := TextureRect.new()
	logo.texture = load("res://assets/logo.jpg")
	logo.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	logo.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	logo.custom_minimum_size = Vector2(0, 150)
	root.add_child(logo)
	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(spacer)
	status = Label.new()
	status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	status.add_theme_font_size_override("font_size", 24)
	root.add_child(status)
	var buttons := HBoxContainer.new()
	buttons.alignment = BoxContainer.ALIGNMENT_CENTER
	buttons.add_theme_constant_override("separation", 20)
	root.add_child(buttons)
	for title in ["Start", "Pauza", "Restart"]:
		var button := Button.new()
		button.text = title
		button.custom_minimum_size = Vector2(190, 64)
		button.add_theme_font_size_override("font_size", 26)
		button.pressed.connect(_control.bind(title))
		buttons.add_child(button)
	var credits := Label.new()
	credits.text = "Próba techniczna • 8 s • Godot Engine (MIT) • Logo: kpok"
	credits.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(credits)
	var license_button := Button.new()
	license_button.text = "Licencje silnika"
	license_button.pressed.connect(func(): OS.shell_open("https://godotengine.org/license/"))
	root.add_child(license_button)

func _build_sound() -> void:
	sound = AudioStreamPlayer.new()
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = 22050
	var samples := PackedByteArray()
	samples.resize(4410 * 2)
	for index in range(4410):
		var envelope := sin(PI * float(index) / 4410.0)
		var sample := int(5000.0 * envelope * sin(TAU * 440.0 * index / 22050.0))
		samples.encode_s16(index * 2, sample)
	wav.data = samples
	sound.stream = wav
	add_child(sound)

func _control(action: String) -> void:
	match action:
		"Start":
			if not clock.playing:
				clock.start()
				sound.play()
		"Pauza":
			clock.pause()
			sound.stop()
		"Restart":
			clock.restart()
			sound.stop()
	_update_frame()

func _process(delta: float) -> void:
	clock.advance(delta)
	_update_frame()

func _update_frame() -> void:
	if not is_instance_valid(object):
		return
	var progress: float = clock.elapsed / Playback.DURATION
	object.position = Vector3(lerpf(-2.5, 2.5, progress), -0.3, 0)
	object.rotation = Vector3(progress * PI, progress * TAU, 0)
	status.text = "%s  %.1f / 8.0 s" % ["Odtwarzanie" if clock.playing else "Pauza", clock.elapsed]

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		clock.pause()
		if is_instance_valid(sound):
			sound.stop()
