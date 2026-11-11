extends Node3D

var camera: Camera3D
var street: Node3D
var orbit: Node3D
var actors: Dictionary = {}
var current_shot: int = 0

func _ready() -> void:
	var environment := WorldEnvironment.new()
	var settings := Environment.new()
	settings.background_mode = Environment.BG_COLOR
	settings.background_color = Color("202c3b")
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color("b6c3d5")
	settings.ambient_light_energy = 0.65
	environment.environment = settings
	add_child(environment)
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-40, -35, 0)
	light.light_color = Color("ffe0bc")
	light.light_energy = 1.1
	add_child(light)
	camera = Camera3D.new()
	camera.near = 0.01
	camera.fov = 48
	add_child(camera)
	street = Node3D.new()
	add_child(street)
	orbit = Node3D.new()
	add_child(orbit)
	_build_street()
	_build_orbit()
	actors["paramedic"] = _actor("paramedic", street, Vector3(0.5, 0, 0.3))
	actors["astronaut"] = _actor("astronaut", orbit, Vector3(30, 0.25, 0))
	apply_time(0.0)

func _box(parent: Node3D, position: Vector3, size: Vector3, color: Color) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	node.mesh = mesh
	node.position = position
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.75
	node.material_override = material
	parent.add_child(node)
	return node

func _sphere(parent: Node3D, position: Vector3, radius: float, color: Color) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2
	mesh.radial_segments = 24
	mesh.rings = 12
	node.mesh = mesh
	node.position = position
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	node.material_override = material
	parent.add_child(node)
	return node

func _screen(parent: Node3D, position: Vector3, size: Vector2, pixel_size: float) -> Label3D:
	_box(parent, position, Vector3(size.x, size.y, 0.005), Color("091321"))
	var text := Label3D.new()
	text.text = "Hacked by\nAIpokalypse"
	text.position = position + Vector3(0, 0, 0.004)
	text.font_size = 48
	text.pixel_size = pixel_size
	text.modulate = Color("ff334d")
	text.outline_size = 2
	parent.add_child(text)
	return text

func _build_street() -> void:
	_box(street, Vector3(0, -0.07, 0), Vector3(14, 0.12, 9), Color("323a43"))
	_box(street, Vector3(0, -0.01, -2.5), Vector3(14, 0.16, 1.5), Color("6a6d70"))
	for index in range(5):
		var x := float(index * 3 - 6)
		_box(street, Vector3(x, 2, -4.0), Vector3(2.8, 4, 1.2), Color("777c82"))
		for level in range(3):
			_box(street, Vector3(x, 0.8 + level, -3.38), Vector3(1.7, 0.6, 0.025), Color("26374c"))
	# A deliberately simple ambulance silhouette reuses the verified car chassis/wheels.
	var ambulance: Node3D = load("res://assets/car.glb").instantiate()
	ambulance.position = Vector3(-2.0, 0, -0.9)
	street.add_child(ambulance)
	for part in ambulance.find_children("*", "MeshInstance3D", true, false):
		if part.name in ["Cabin", "Roof"]:
			part.visible = false
		if part.name == "Body":
			var white := StandardMaterial3D.new()
			white.albedo_color = Color("e0e3e4")
			part.material_override = white
	_box(ambulance, Vector3(-0.25, 1.07, 0), Vector3(2.6, 1.35, 1.52), Color("e0e3e4"))
	_box(ambulance, Vector3(-0.25, 1.05, 0.77), Vector3(2.55, 0.22, 0.025), Color("ec4f13"))
	_box(ambulance, Vector3(1.1, 1.08, 0.68), Vector3(0.55, 0.5, 0.025), Color("2c4e62"))
	_box(ambulance, Vector3(0.7, 1.8, 0), Vector3(0.6, 0.1, 0.8), Color("2667b8"))

func _build_orbit() -> void:
	_box(orbit, Vector3(30, -0.2, -0.2), Vector3(5, 0.15, 5), Color("515d68"))
	_box(orbit, Vector3(28, 1.3, -0.7), Vector3(0.15, 3, 4), Color("64727d"))
	for x in [28.8, 30.7, 31.8]:
		_box(orbit, Vector3(x, 1.5, -1.8), Vector3(0.15, 3, 0.2), Color("76838d"))
	_box(orbit, Vector3(30, 2.7, -1.8), Vector3(4, 0.3, 0.2), Color("76838d"))
	_box(orbit, Vector3(30, 0.3, -1.8), Vector3(4, 0.6, 0.2), Color("76838d"))
	_sphere(orbit, Vector3(30.7, 1.3, -3), 0.85, Color("247fc1"))
	# Restrained geometric land/cloud patches are a placeholder for the later Earth asset.
	_sphere(orbit, Vector3(30.5, 1.45, -2.23), 0.25, Color("557d65"))
	_sphere(orbit, Vector3(30.95, 1.1, -2.27), 0.18, Color("b7d3db"))
	var console := Node3D.new()
	orbit.add_child(console)
	console.position = Vector3(28.95, 1.0, 0.1)
	_box(console, Vector3.ZERO, Vector3(0.85, 0.65, 0.25), Color("344251"))
	_screen(console, Vector3(0, 0.03, 0.14), Vector2(0.7, 0.43), 0.00085)
	for index in range(4):
		_box(orbit, Vector3(28.2, 0.6 + index * 0.45, -1.0), Vector3(0.3, 0.3, 0.45), Color("98a5af"))

func _actor(role: String, parent: Node3D, position: Vector3) -> Dictionary:
	var model: Node3D = load("res://assets/%s.glb" % role).instantiate()
	parent.add_child(model)
	model.position = position
	var skeleton: Skeleton3D = model.find_children("*", "Skeleton3D", true, false)[0]
	var player: AnimationPlayer = model.find_children("*", "AnimationPlayer", true, false)[0]
	assert(skeleton.find_bone("right_hand") >= 0 and player.has_animation("PhoneGesture"))
	player.play("PhoneGesture")
	player.pause()
	var attachment := BoneAttachment3D.new()
	skeleton.add_child(attachment)
	attachment.bone_name = "right_hand"
	var phone := Node3D.new()
	phone.name = "Phone" if role == "paramedic" else "Radio"
	attachment.add_child(phone)
	phone.position = Vector3(0, 0.045, 0.045)
	phone.rotation.z = PI
	_box(phone, Vector3.ZERO, Vector3(0.075, 0.145, 0.012), Color("111821"))
	var screen := _screen(phone, Vector3(0, 0, 0.008), Vector2(0.067, 0.127), 0.00022)
	if role == "astronaut":
		_box(phone, Vector3(0.025, 0.11, 0), Vector3(0.009, 0.09, 0.009), Color("111821"))
	return {"model": model, "skeleton": skeleton, "player": player, "attachment": attachment, "device": phone, "screen": screen}

func apply_time(time: float) -> void:
	var t := clampf(time, 0, 25)
	current_shot = 0 if t < 10 else (1 if t < 15 else 2)
	street.visible = current_shot < 2
	orbit.visible = current_shot == 2
	_pose(actors["paramedic"], minf(t, 5.0))
	_pose(actors["astronaut"], minf(maxf(t - 15, 0), 5.0))
	var astronaut: Node3D = actors["astronaut"]["model"]
	astronaut.position.y = 0.25 + 0.035 * sin(maxf(t - 15, 0) * 0.7)
	astronaut.rotation.z = 0.035 * sin(maxf(t - 15, 0) * 0.5)
	if current_shot == 0:
		camera.position = Vector3(2.2 - t * 0.018, 1.5, 4.1)
		camera.look_at(Vector3(-0.1, 1.0, 0))
	elif current_shot == 1:
		var device: Node3D = actors["paramedic"]["device"]
		camera.position = device.global_position + device.global_basis.z.normalized() * 0.30
		camera.look_at(device.global_position, device.global_basis.y.normalized())
	else:
		camera.position = Vector3(31.4, 1.55, 3.5)
		camera.look_at(Vector3(29.8, 1.2, -0.1))

func _pose(actor: Dictionary, time: float) -> void:
	var player: AnimationPlayer = actor["player"]
	player.seek(time, true)
	var skeleton: Skeleton3D = actor["skeleton"]
	skeleton.force_update_all_bone_transforms()
	var attachment: BoneAttachment3D = actor["attachment"]
	attachment.transform = skeleton.get_bone_global_pose(skeleton.find_bone("right_hand"))
