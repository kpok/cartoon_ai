extends Node3D

const Timeline = preload("res://film_timeline.gd")
const Proxies = preload("res://animatic_proxies.gd")
var timeline = Timeline.new()
var factory = Proxies.new()
var camera: Camera3D
var scene_root: Node3D
var current_index := -1
var current_shot: Dictionary = {}
var actors: Array[Dictionary] = []
var props: Array[Dictionary] = []
var focus_node: Node3D
var focus_kind := ""
var signature_label: Label3D
var environment: Environment
var fx_nodes: Array[Node3D] = []
var rebuild_count := 0
var key_light: DirectionalLight3D
var window_nodes: Array[MeshInstance3D] = []

func _ready() -> void:
	var world := WorldEnvironment.new()
	environment = Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("243247")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("aabdd1")
	environment.ambient_light_energy = 0.7
	world.environment = environment
	add_child(world)
	var light := DirectionalLight3D.new()
	key_light = light
	light.rotation_degrees = Vector3(-40, -30, 0)
	light.light_energy = 1.1
	add_child(light)
	camera = Camera3D.new()
	camera.near = 0.01
	camera.fov = 48
	add_child(camera)

func _box(at: Vector3, size: Vector3, color: Color) -> MeshInstance3D:
	return factory.box(scene_root, at, size, color)

func _kit(kind: String) -> void:
	var cold := kind in ["polar", "habitat", "orbit"]
	var floor_color := Color("7d969f") if cold else Color("454c55")
	_box(Vector3(0, -0.08, 0), Vector3(16, 0.12, 12), floor_color)
	environment.background_color = Color("153b50") if kind == "habitat" else (Color("9aafb9") if kind == "polar" else Color("253142"))
	if kind in ["polar_exterior", "habitat_exterior"]:
		environment.background_color = Color("a8bec7") if kind == "polar_exterior" else Color("103d56")
		_box(Vector3(0, -0.01, 0), Vector3(16, 0.04, 12), Color("d3e2e7") if kind == "polar_exterior" else Color("355c68"))
		return
	if kind in ["street", "port", "launch", "air"]:
		if kind == "street":
			for index in range(5):
				var x := float(index * 3 - 6)
				_box(Vector3(x, 2, -4), Vector3(2.7, 4, 1.5), Color("8b8a80"))
				for level in range(3):
					window_nodes.append(_box(Vector3(x, 0.8 + level, -3.23), Vector3(1.8, 0.5, 0.03), Color("d6be7e")))
			for index in range(6):
				_box(Vector3(index * 0.55 - 1.5, -0.005, 1.5), Vector3(0.3, 0.025, 2.0), Color("c7c9bd"))
		elif kind == "port":
			for index in range(4):
				_box(Vector3(index * 2.2 - 4, 0.7, -3), Vector3(2, 1.4, 1.1), Color("526e80") if index % 2 == 0 else Color("9a6c4d"))
		elif kind == "launch":
			_box(Vector3(0, 0, -1), Vector3(4, 0.2, 3), Color("646d71"))
			_box(Vector3(-2, 2, -1), Vector3(0.18, 4, 0.18), Color("8c969a"))
		return
	var wall := Color("8fa0aa") if cold else Color("87918f")
	_box(Vector3(-3.5, 1.5, -1), Vector3(0.15, 3, 6), wall)
	if kind not in ["orbit", "habitat"]:
		_box(Vector3(0, 1.5, -3.2), Vector3(7, 3, 0.12), wall)
	if kind == "shop":
		for index in [-1, 1]:
			var shelf := factory.build(scene_root, {"kind":"shelf", "name":"shop_shelves"})
			shelf.position = Vector3(index * 2.4, 0, -2)
		_box(Vector3(0, 0.45, -0.9), Vector3(2.8, 0.9, 0.65), Color("887157"))
	elif kind == "hospital":
		for index in range(3):
			_box(Vector3(index * 1.8 - 2, 1.1, -3.1), Vector3(0.9, 2.2, 0.04), Color("547f8b"))
	elif kind == "control":
		for index in range(3):
			var monitor := factory.device(scene_root, "terminal")
			monitor.position = Vector3(index * 1.5 - 1.5, 1.5, -2.6)
			monitor.get_meta("screen").text = "BRAK\nPOTWIERDZENIA"
	elif kind == "factory":
		_box(Vector3(0, 0.5, -1.5), Vector3(5, 0.3, 0.9), Color("657783"))
		for index in range(6):
			_box(Vector3(index - 2.5, 0.8, -1.5), Vector3(0.3, 0.25, 0.35), Color("929d96"))
	elif kind == "water":
		for index in [-1, 1]:
			factory.cylinder(scene_root, Vector3(index * 1.8, 0.6, -1.5), 0.5, 1.2, Color("567b88"))
			_box(Vector3(index * 1.8, 0.3, -0.4), Vector3(0.2, 0.2, 2), Color("7e9aab"))
	elif kind == "elevator":
		_box(Vector3(2, 1.4, -1), Vector3(0.12, 2.8, 3), Color("717f89"))
		_box(Vector3(-0.8, 0, 0), Vector3(3, 0.04, 3), Color("7a8386"))
	elif kind == "car_interior":
		for x in [-0.65, 0.65]:
			var seat := factory.build(scene_root, {"kind":"chair", "name":"seats"})
			seat.position = Vector3(x, 0, -0.5)
		_box(Vector3(0, 0.5, 1.5), Vector3(2.5, 0.4, 0.5), Color("354454"))
	elif kind in ["orbit", "habitat"]:
		for x in [-2, 2]:
			_box(Vector3(x, 1.5, -2.8), Vector3(0.17, 3, 0.2), wall)
		_box(Vector3(0, 2.7, -2.8), Vector3(4, 0.35, 0.2), wall)
		_box(Vector3(0, 0.3, -2.8), Vector3(4, 0.6, 0.2), wall)
		if kind == "orbit":
			var earth := factory.build(scene_root, {"kind":"earth", "name":"earth"})
			earth.position = Vector3(0.8, 1.3, -4)
		else:
			factory.sphere(scene_root, Vector3(0, 1.6, -4), 0.6, Color("28516c"))
	elif kind == "polar":
		_box(Vector3(2, 1.4, -1.5), Vector3(0.12, 2.8, 3), Color("9aadb4"))

func _position(kind: String, name: String, index: int) -> Vector3:
	match kind:
		"vehicle": return Vector3(-2.0 if name in ["ambulance", "fire_engine"] else 0.0, 0, -0.5)
		"device": return Vector3(-0.8 + float(index % 3) * 0.8, 1.3, 0.8)
		"paper", "cup", "water", "gauge", "prop": return Vector3(-0.35 + float(index % 3) * 0.35, 0.96, 0.65)
		"crane": return Vector3(-3, 0, -2)
		"container": return Vector3(-0.6, 0, -1.4)
		"robot": return Vector3(-1.4, 0, -0.7)
		"rocket": return Vector3(0, 0, -0.5)
		"drone": return Vector3(0, 2.6, -1)
		"stretcher": return Vector3(0, 0, 0.2)
		"door": return Vector3(1.7, 0, -1.7)
		"counter": return Vector3(0, 0, -0.7)
		"earth": return Vector3(0.5, 1.8, -3)
		_: return Vector3(float(index % 3) * 1.8 - 1.8, 0, -2.2)

func _build(index: int) -> void:
	actors.clear()
	props.clear()
	fx_nodes.clear()
	window_nodes.clear()
	signature_label = null
	focus_node = null
	if is_instance_valid(scene_root):
		scene_root.free()
	scene_root = Node3D.new()
	add_child(scene_root)
	current_index = index
	current_shot = timeline.shots[index]
	rebuild_count += 1
	if current_shot["environment"] == "black":
		return
	var kind: String = current_shot["environment"]
	if current_shot["physical_space"] == "military_drone_flight":
		kind = "air"
	for descriptor in current_shot["models"]:
		if descriptor["name"] in ["habitat_exterior", "polar_station_exterior"]:
			kind = "habitat_exterior" if descriptor["name"] == "habitat_exterior" else "polar_exterior"
	_kit(kind)
	var characters: Array = current_shot["characters"]
	for i in range(characters.size()):
		var actor: Dictionary = factory.actor(scene_root, characters[i])
		actor["home"] = Vector3(0.65 + (i % 3) * 0.85 - (0.8 if i > 2 else 0), 0, -0.2 - int(i / 3) * 0.9)
		actor["node"].position = actor["home"]
		actors.append(actor)
	for i in range(current_shot["models"].size()):
		var descriptor: Dictionary = current_shot["models"][i]
		var prop := factory.build(scene_root, descriptor)
		prop.position = _position(descriptor["kind"], descriptor["name"], i)
		if descriptor["name"] == "phone" and actors.size() > 0:
			scene_root.remove_child(prop)
			var skeleton: Skeleton3D = actors[0]["skeleton"]
			var attachment := BoneAttachment3D.new()
			skeleton.add_child(attachment)
			attachment.bone_name = "right_hand"
			attachment.add_child(prop)
			prop.scale = Vector3.ONE * 0.8
			prop.position = Vector3(0, 0.045, 0.045)
			actors[0]["attachment"] = attachment
		props.append({"node":prop,"name":descriptor["name"],"kind":descriptor["kind"],"home":prop.transform})
		if focus_node == null and descriptor["kind"] not in ["environment", "counter", "chair", "shelf"]:
			focus_node = prop
			focus_kind = descriptor["kind"]
	if current_shot["id"] == "S01-U001":
		for prop in props:
			if prop["name"] == "traffic_signal":
				focus_node = prop["node"]
				focus_kind = "signal"
	var signature = current_shot.get("signature")
	if signature is Dictionary and signature["mode"] == "screen":
		var device: Node3D
		for prop in props:
			if prop["kind"] == "device":
				device = prop["node"]
				break
		if device == null:
			device = factory.device(scene_root, "terminal")
			device.position = Vector3(-0.65, 1.35, 0.5)
		signature_label = device.get_meta("screen")
		signature_label.text = "Hacked by\nAIpokalypse"
		if str(current_shot["framing"]).to_lower().contains("detal"):
			focus_node = device
			focus_kind = "device"
	if current_shot["id"] == "S18-U008" and signature_label != null:
		signature_label.text = "STARTY POTWIERDZONE.\nUZBROJENIE NUKLEARNE.\nHacked by AIpokalypse"
	if "cup_fall" in current_shot["animations"] or (int(current_shot["seq"]) == 20):
		for prop in props:
			if prop["kind"] == "cup":
				prop["node"].rotation.z = PI / 2
				prop["home"] = prop["node"].transform
	if "engine_flame" in current_shot["effects"]:
		for prop in props:
			if prop["kind"] == "rocket":
				var flame := factory.sphere(prop["node"], Vector3(0, -0.5, 0), 0.25, Color("ffb637"))
				flame.name = "IgnitionFlame"
				flame.scale = Vector3(1, 3, 1)
	for effect in current_shot["effects"]:
		if effect in ["smoke", "snowstorm", "fire", "brief_dust", "dust_burst", "underwater_haze", "launch_smoke"]:
			for i in range(8):
				var particle := factory.sphere(scene_root, Vector3.ZERO, 0.035 if effect == "snowstorm" else 0.22, Color("d8e7ed") if effect == "snowstorm" else Color("72777a"))
				particle.set_meta("effect", effect)
				fx_nodes.append(particle)

func _has(fragment: String) -> bool:
	for action in current_shot["animations"]:
		if str(action).contains(fragment):
			return true
	return false

func apply_time(time: float) -> void:
	var index: int = timeline.index_at(time)
	if index != current_index:
		_build(index)
	if current_shot["environment"] == "black":
		return
	var local := clampf(time - float(current_shot["start"]), 0, float(current_shot["end"] - current_shot["start"]))
	var progress := local / float(current_shot["end"] - current_shot["start"])
	var blackout := _has("district_blackout") and progress >= 0.35
	key_light.light_energy = 0.12 if blackout else 1.1
	environment.ambient_light_energy = 0.08 if blackout else 0.7
	for i in range(window_nodes.size()):
		window_nodes[i].visible = not blackout or i >= (10 if progress >= 0.65 else 5)
	for actor in actors:
		var node: Node3D = actor["node"]
		var home: Vector3 = actor["home"]
		node.position = home
		node.rotation = Vector3.ZERO
		var player: AnimationPlayer = actor["player"]
		player.seek(minf(local, 5.0) if _has("phone") or _has("radio") or _has("look") or _has("recoil") or _has("handset") else 0.0, true)
		var skeleton: Skeleton3D = actor["skeleton"]
		if _has("kneel") or current_shot["environment"] == "car_interior":
			node.position.y = -0.45
			for side in ["right", "left"]:
				skeleton.set_bone_pose_rotation(skeleton.find_bone(side + "_thigh"), Quaternion(Vector3.RIGHT, 1.1))
				skeleton.set_bone_pose_rotation(skeleton.find_bone(side + "_shin"), Quaternion(Vector3.RIGHT, -1.5))
		if _has("walk") or _has("run") or _has("carry"):
			node.position.x += progress * (2.0 if _has("run") else 0.8)
			for side in ["right", "left"]:
				var phase := 0.0 if side == "right" else PI
				skeleton.set_bone_pose_rotation(skeleton.find_bone(side + "_thigh"), Quaternion(Vector3.RIGHT, sin(local * 7 + phase) * 0.4))
		if current_shot["environment"] == "orbit":
			node.position.y = 0.25 + 0.04 * sin(local)
			node.rotation.z = 0.03 * sin(local * 0.7)
		skeleton.force_update_all_bone_transforms()
		if actor.has("attachment"):
			actor["attachment"].transform = skeleton.get_bone_global_pose(skeleton.find_bone("right_hand"))
	for prop in props:
		var node: Node3D = prop["node"]
		node.transform = prop["home"]
		if prop["name"] == "robotaxi_headlights":
			node.position.x += minf(progress, 0.65) * 4
		match prop["kind"]:
			"vehicle":
				if _has("drive") or _has("collision") or _has("car_spin"):
					node.position.x += progress * 3 - 1.5
					if _has("collision") or _has("car_spin"):
						node.rotation.y = maxf(0, progress - 0.4) * 2.5
					if prop["name"] == "delivery_van":
						node.position = Vector3(0.5, 0, 1.5 - progress * 3)
						node.rotation.y = PI / 2
			"container":
				if _has("container_drop"):
					node.position.y = (1 - progress * progress) * 4.0
			"robot":
				if node.has_node("MovingArm"):
					node.get_node("MovingArm").rotation.z = -0.5 * sin(progress * PI) if _has("robot") else 0
			"rocket":
				if _has("rocket"):
					node.position.y = progress * progress * 9 + (1 if current_shot["id"] == "S18-U007" else 0)
				elif _has("missile"):
					node.position.y = 2.4 - progress * 2
			"drone":
				node.position.x = -2 + progress * 4
			"door":
				if _has("open") or _has("close"):
					node.rotation.y = progress * 1.2 * (-1 if _has("close") else 1)
			"cup":
				if _has("cup_fall"):
					node.rotation.z = progress * PI / 2
			"water":
				if _has("pass") or _has("handover"):
					node.position.x += progress
			"stretcher":
				if _has("push") or _has("carry"):
					node.position.x += progress * 1.5
	for i in range(fx_nodes.size()):
		var node := fx_nodes[i]
		var snow: bool = node.get_meta("effect") == "snowstorm"
		node.position = Vector3(sin(i * 2.1 + local) * 3, fposmod(i * 0.7 + local * (-1.0 if snow else 0.25), 3.5), -1.2 + cos(i * 1.7) * 1.5)
		node.scale = Vector3.ONE * (1.0 if snow else 0.6 + progress)
	if signature_label != null:
		var signature: Dictionary = current_shot["signature"]
		signature_label.visible = time >= signature["start"] and time < signature["end"]
	_camera(local, progress)

func _camera(local: float, progress: float) -> void:
	var framing := str(current_shot["framing"]).to_lower()
	var close := framing.contains("detal") or framing.contains("zbliż") or framing.contains("bliski") or framing.contains("blisk") or framing.contains("wąski")
	if close and is_instance_valid(focus_node) and not framing.contains("twarz"):
		var target := focus_node.global_position
		var distance := 1.4
		if focus_kind == "device":
			var size := focus_node.get_child(0) as MeshInstance3D
			if size != null and size.mesh is BoxMesh and size.mesh.size.x < 0.2:
				camera.position = target + focus_node.global_basis.z.normalized() * 0.35
				camera.look_at(target, focus_node.global_basis.y.normalized())
				return
		elif focus_kind == "signal":
			target.y += 2.55
			distance = 1.5
		elif focus_kind in ["vehicle", "rocket"]:
			target.y += 1.0
			distance = 3.8
		elif focus_kind in ["paper", "cup", "gauge", "water", "prop"]:
			distance = 0.9
		camera.position = target + Vector3(0.35, 0.3 if focus_kind != "paper" else 0.65, distance)
		camera.look_at(target)
	elif actors.size() > 0 and not framing.contains("ogóln") and not framing.contains("szerok"):
		var actor: Node3D = actors[0]["node"]
		var target := actor.global_position + Vector3(0, 1.35 if close else 1.0, 0)
		camera.position = target + Vector3(0.7, 0.1, 1.7 if close else 3.7)
		camera.look_at(target)
	else:
		var target := Vector3(0, 1.3, -0.4)
		if current_shot["environment"] == "launch":
			target.y = 3.0
		camera.position = Vector3(5.8 - progress * 0.15, 3.8, 8.3)
		if framing.contains("góry"):
			camera.position = Vector3(1, 8, 3)
		camera.look_at(target)

func node_count() -> int:
	return _count(scene_root) if is_instance_valid(scene_root) else 0

func _count(node: Node) -> int:
	var result := 1
	for child in node.get_children():
		result += _count(child)
	return result
