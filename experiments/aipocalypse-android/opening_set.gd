extends Node3D

const Motion = preload("res://opening_motion.gd")
var factory: RefCounted
var taxi: Node3D
var van: Node3D
var taxi_model: Node3D
var van_model: Node3D
var signals: Array[Node3D] = []
var display: Node3D
var display_text: Label3D
var cup: Node3D
var cafe_counter: Node3D
var cafe_worker: Dictionary
var taxi_driver: Dictionary
var van_driver: Dictionary
var bystander: Dictionary
var phone: Node3D
var phone_attachment: BoneAttachment3D
var shards: Array[Node3D] = []
var skid_marks: Array[Node3D] = []
var indicator: MeshInstance3D
var references: Dictionary = {}
var last_state: Dictionary = {}

func _box(at: Vector3, size: Vector3, color: String) -> MeshInstance3D:
	return factory.box(self, at, size, Color(color))

func _unlit(node: MeshInstance3D, alpha: float = 1.0) -> void:
	var material: StandardMaterial3D = node.material_override
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.albedo_color.a = alpha
	if alpha < 1:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

func build(builder: RefCounted) -> void:
	factory = builder
	_ground()
	_buildings()
	_cafe()
	signals.append(_signal(Vector3(-3.9, 0, 3.0), -PI / 2))
	signals.append(_signal(Vector3(3.0, 0, -3.9), PI))
	display = factory.device(self, "road_display")
	display.position = Vector3(-4.5, 2.1, -3.1)
	display.rotation.y = PI
	display.scale = Vector3(2.2, 1.3, 1)
	display_text = display.get_meta("screen")
	display_text.text = "Hacked by\nAIpokalypse"
	_box(Vector3(-4.5, 0.85, -3.1), Vector3(0.12, 1.7, 0.12), "59646d")
	taxi = Node3D.new()
	add_child(taxi)
	taxi_model = _vehicle(taxi, false)
	van = Node3D.new()
	add_child(van)
	van_model = _vehicle(van, true)
	taxi_driver = _driver(taxi, "taxi_driver", Vector3(-0.2, -0.02, -0.30))
	van_driver = _driver(van, "van_driver", Vector3(0.65, -0.02, -0.3))
	bystander = factory.actor(self, "bystander_warsaw")
	bystander.node.position = Vector3(2.65, -0.42, 2.1)
	bystander.node.rotation.y = -0.98
	phone = factory.device(self, "phone")
	remove_child(phone)
	phone_attachment = BoneAttachment3D.new()
	bystander.skeleton.add_child(phone_attachment)
	phone_attachment.bone_name = "right_hand"
	phone_attachment.add_child(phone)
	phone.position = Vector3(0, 0.045, 0.045)
	phone.scale = Vector3.ONE * 0.8
	phone.get_meta("screen").text = "112\nŁączenie…"
	for i in range(12):
		var shard: MeshInstance3D = factory.box(self, Vector3.ZERO, Vector3(0.035, 0.008, 0.08), Color("b8d5dd"))
		shards.append(shard)
	for x in [0.65, 1.55]:
		var mark := _box(Vector3(x, 0.012, -2.5), Vector3(0.10, 0.006, 2.3), "101720")
		skid_marks.append(mark)
	references = {"taxi":taxi, "delivery_van":van, "traffic_signal":signals[0], "wet_road":self, "cafe_facade":self, "cup":cup, "cafe_counter":cafe_counter, "road_display":display, "phone":phone}

func _ground() -> void:
	var asphalt := _box(Vector3(0, -0.09, 0), Vector3(36, 0.16, 36), "263342")
	asphalt.material_override.metallic = 0.45
	asphalt.material_override.roughness = 0.23
	for x in [-8.5, 8.5]:
		for z in [-8.5, 8.5]:
			_box(Vector3(x, 0.03, z), Vector3(9, 0.12, 9), "6d7780")
			_box(Vector3(x, 0.10, signf(z) * 4.05), Vector3(9, 0.14, 0.18), "b6bdba")
			_box(Vector3(signf(x) * 4.05, 0.10, z), Vector3(0.18, 0.14, 9), "b6bdba")
	for axis in range(2):
		for side in [-1, 1]:
			for i in range(8):
				var at := Vector3(i * 0.65 - 2.3, 0.004, side * 3.35)
				var size := Vector3(0.34, 0.01, 1.2)
				if axis == 1:
					at = Vector3(at.z, at.y, at.x)
					size = Vector3(size.z, size.y, size.x)
				_box(at, size, "d4d3bd")
			for i in range(4):
				var at := Vector3(0, 0.003, side * (5.6 + i * 2.2))
				var size := Vector3(0.10, 0.01, 1.1)
				if axis == 1:
					at = Vector3(at.z, at.y, at.x)
					size = Vector3(size.z, size.y, size.x)
				_box(at, size, "c3c4b6")
	for i in range(7):
		var puddle: MeshInstance3D = factory.cylinder(self, Vector3(-3 + i * 1.1, 0.003, -1.8 + sin(i * 2) * 2.8), 0.65, 0.003, Color("506376"))
		puddle.scale = Vector3(1.5, 1, 0.4)
		puddle.material_override.roughness = 0.08
	for at in [Vector3(-3.7, 0.009, 2.7), Vector3(2.7, 0.009, -3.7)]:
		var reflection: MeshInstance3D = factory.cylinder(self, at, 0.3, 0.004, Color("48d48e"))
		reflection.scale = Vector3(0.5, 1, 2.6)
		_unlit(reflection, 0.22)

func _buildings() -> void:
	for index in range(4):
		var x := -9.5 if index < 2 else 9.5
		var z := -9.5 if index % 2 == 0 else 10.0
		if index == 1:
			continue
		var height := 6.0 + index
		_box(Vector3(x, height / 2, z), Vector3(7, height, 7), "777b7c" if index % 2 == 0 else "9a8d7c")
		_box(Vector3(x, height + 0.1, z), Vector3(7.3, 0.2, 7.3), "4a535e")
		for level in range(3):
			for column in range(4):
				var color := "d9be83" if (level + column + index) % 3 == 0 else "344c60"
				_box(Vector3(x - 2.5 + column * 1.65, 1.3 + level * 1.7, z - signf(z) * 3.51), Vector3(0.9, 1.0, 0.03), color)
				_box(Vector3(x - signf(x) * 3.51, 1.3 + level * 1.7, z - 2.5 + column * 1.65), Vector3(0.03, 1.0, 0.9), color)
	for at in [Vector3(-4.4, 0, -5.0), Vector3(4.4, 0, 5.0)]:
		_box(at + Vector3(0, 2.4, 0), Vector3(0.10, 4.8, 0.10), "3e4a54")
		var bulb := _box(at + Vector3(0, 4.85, 0), Vector3(0.5, 0.1, 0.25), "ffe1a0")
		_unlit(bulb)

func _cafe() -> void:
	_box(Vector3(-6.4, 1.5, 7), Vector3(6.4, 3, 0.16), "a79c88")
	_box(Vector3(-9.6, 1.5, 5.6), Vector3(0.16, 3, 2.8), "8b8c84")
	_box(Vector3(-6.4, 0.11, 5.5), Vector3(6.4, 0.12, 3.0), "756454")
	_box(Vector3(-6.4, 2.7, 4.0), Vector3(6.4, 0.48, 0.25), "6a3135")
	for x in [-9.5, -3.3]:
		_box(Vector3(x, 1.5, 4.0), Vector3(0.12, 2.5, 0.12), "3c484f")
	var sign_label: Label3D = factory.label(self, Vector3(-6.4, 2.73, 3.85), "K A W I A R N I A", 0.004)
	sign_label.rotation.y = PI
	cafe_counter = factory.build(self, {"kind":"counter", "name":"cafe_counter"})
	cafe_counter.position = Vector3(-6.3, 0.12, 4.85)
	cup = factory.build(self, {"kind":"cup", "name":"cup"})
	for i in range(3):
		var spare: Node3D = factory.build(self, {"kind":"cup", "name":"cup"})
		spare.position = Vector3(-6.5 - i * 0.23, 1.08, 4.7)
	cafe_worker = factory.actor(self, "cafe_worker")
	cafe_worker.node.position = Vector3(-6.3, 0.15, 5.8)
	cafe_worker.node.rotation.y = PI
	for at in [Vector3(-8.8, 0, 4.9), Vector3(-3.7, 0, 5.5)]:
		factory.cylinder(self, at + Vector3(0, 0.7, 0), 0.42, 0.06, Color("ac9071"))
		_box(at + Vector3(0, 0.35, 0), Vector3(0.06, 0.7, 0.06), "343e49")

func _vehicle(parent: Node3D, delivery: bool) -> Node3D:
	var model: Node3D = factory.car_scene.instantiate()
	parent.add_child(model)
	for part in model.find_children("*", "MeshInstance3D", true, false):
		if part.name == "Cabin":
			part.hide()
		if part.name in ["Body", "Roof"]:
			var paint := StandardMaterial3D.new()
			paint.albedo_color = Color("d9d5bd") if delivery else Color("c99434")
			paint.metallic = 0.45
			paint.roughness = 0.3
			part.material_override = paint
	if delivery:
		factory.box(parent, Vector3(-0.65, 1.03, 0), Vector3(1.8, 1.2, 1.5), Color("d9dedb"))
		factory.box(parent, Vector3(-0.65, 1.13, 0.76), Vector3(1.65, 0.14, 0.02), Color("537f8d"))
	else:
		factory.box(parent, Vector3(-0.2, 1.48, 0), Vector3(0.55, 0.19, 0.36), Color("e8d9a7"))
		var roof_sign: Label3D = factory.label(parent, Vector3(-0.2, 1.49, 0.19), "TAXI", 0.00085)
		roof_sign.modulate = Color("182331")
		indicator = factory.box(parent, Vector3(1.83, 0.61, 0.53), Vector3(0.03, 0.16, 0.13), Color("ffab38"))
		_unlit(indicator)
	for z in [-0.69, 0.69]:
		factory.box(parent, Vector3(0.63 if delivery else -0.1, 1.03, z), Vector3(0.035, 0.48, 0.035), Color("4a5259"))
	return model

func _driver(vehicle: Node3D, role: String, at: Vector3) -> Dictionary:
	var actor: Dictionary = factory.actor(vehicle, role)
	actor.node.position = at
	actor.node.scale = Vector3.ONE * 0.72
	actor.node.rotation.y = PI / 2
	return actor

func _pose(actor: Dictionary, bone: String, angles: Vector3) -> void:
	var rig: Skeleton3D = actor.skeleton
	var index := rig.find_bone(bone)
	var rest := rig.get_bone_rest(index).basis.get_rotation_quaternion()
	rig.set_bone_pose_rotation(index, rest * Quaternion.from_euler(angles))

func _seated(actor: Dictionary) -> void:
	for side in ["left", "right"]:
		_pose(actor, side + "_thigh", Vector3(-1.35, 0, 0))
		_pose(actor, side + "_shin", Vector3(1.35, 0, 0))
		_pose(actor, side + "_upper_arm", Vector3(0.6, 0, 0))
		_pose(actor, side + "_forearm", Vector3(0.6, 0, 0))

func apply_time(time: float, shot_id: String, camera: Camera3D) -> void:
	last_state = Motion.state(time)
	taxi.position = last_state.taxi
	taxi.rotation.y = last_state.taxi_yaw
	van.position = last_state.van
	van.rotation.y = last_state.van_yaw
	taxi_model.scale.x = 0.94 if last_state.impact else 1.0
	indicator.visible = time < 15.1 and fmod(time, 0.8) < 0.4
	for vehicle in [taxi, van]:
		for wheel in vehicle.find_children("Wheel_*", "Node3D", true, false):
			wheel.rotation.z = (vehicle.position.x + vehicle.position.z) / 0.34
	for actor in [taxi_driver, van_driver, cafe_worker, bystander]:
		actor.player.seek(0, true)
	_seated(taxi_driver)
	_seated(van_driver)
	_pose(taxi_driver, "head", Vector3(0.42 if time >= 18 else 0.0, 0.12 if time < 7 else 0.0, 0))
	_pose(van_driver, "head", Vector3(0, -0.25 if time >= 11 and time < 14 else 0, 0))
	var cup_p := clampf((time - 18.15) / 0.65, 0, 1)
	cup.position = Vector3(-5.82 - cup_p * 0.08, 1.08 + cup_p * 0.065, 4.65)
	cup.rotation.z = cup_p * PI / 2
	_pose(cafe_worker, "spine", Vector3(-0.07 * cup_p, 0, 0))
	_pose(cafe_worker, "left_upper_arm", Vector3(0.35 + cup_p * 0.5, 0, -0.18))
	bystander.node.visible = time >= 29
	bystander.player.seek(clampf(time - 29, 0, 3), true)
	_pose(bystander, "right_thigh", Vector3(-1.35, 0, 0))
	_pose(bystander, "right_shin", Vector3(1.35, 0, 0))
	_pose(bystander, "left_thigh", Vector3(-0.45, 0, 0))
	_pose(bystander, "left_shin", Vector3(1.9, 0, 0))
	for actor in [taxi_driver, van_driver, cafe_worker, bystander]:
		actor.skeleton.force_update_all_bone_transforms()
	phone_attachment.transform = bystander.skeleton.get_bone_global_pose(bystander.skeleton.find_bone("right_hand"))
	for i in range(shards.size()):
		shards[i].visible = time >= Motion.CONTACT
		var spread := clampf((time - Motion.CONTACT) / 0.7, 0, 1)
		shards[i].position = Vector3(-0.2 + sin(i * 2.3) * spread * 1.4, 0.025, 0.6 + cos(i * 1.7) * spread)
		shards[i].rotation.y = i * 0.9
	for mark in skid_marks:
		mark.visible = time >= 11
		mark.scale.z = clampf((time - 11) / 4.1, 0.01, 1)
	display_text.visible = time >= 22 and time < 29
	_camera(shot_id, camera, time)

func _camera(shot: String, camera: Camera3D, time: float) -> void:
	camera.fov = 44
	match shot:
		"S01-U001":
			camera.position = Vector3(-6.2, 2.7, 2.0)
			camera.look_at(Vector3(-3.9, 2.65, 3.0))
		"S01-U002":
			camera.position = taxi.position + Vector3(1.5, 1.7, -3.0)
			camera.look_at(taxi.position + Vector3(-0.2, 1.0, 0))
		"S01-U003":
			camera.position = Vector3(5.2, 3.7, -8.8)
			camera.look_at(van.position + Vector3(0, 1.1, 1.3))
		"S01-U004":
			camera.position = van.position + Vector3(-1.9, 1.5, 2.3)
			camera.look_at(van.position + Vector3(-0.1, 1.0, 0.6))
		"S01-U005":
			camera.position = Vector3(-10, 7.5, -11)
			camera.look_at(Vector3(-0.1, 1.0, 0.2))
		"S01-U006":
			camera.position = Vector3(-5.05, 1.65, 3.75)
			camera.look_at(cup.position + Vector3(-0.10, 0.04, 0))
		"S01-U007":
			camera.position = Vector3(-6.2, 2.65, -6.0)
			camera.look_at(display.position)
		"S01-U008":
			camera.position = Vector3(4.7, 2.1, 0.5)
			camera.look_at(Vector3(1.65, 1.0, 2.6))

func _signal(at: Vector3, yaw: float) -> Node3D:
	var root := Node3D.new()
	add_child(root)
	root.position = at
	root.rotation.y = yaw
	factory.box(root, Vector3(0, 1.4, 0), Vector3(0.09, 2.8, 0.09), Color("4b555e"))
	factory.box(root, Vector3(0, 2.65, 0), Vector3(0.34, 0.88, 0.24), Color("15212c"))
	for i in range(3):
		var lamp: MeshInstance3D = factory.sphere(root, Vector3(0, 2.91 - i * 0.26, 0.14), 0.095, Color("4de48b") if i == 2 else Color("28353b"))
		lamp.name = "Green" if i == 2 else "InactiveLamp%d" % i
		_unlit(lamp)
	return root
