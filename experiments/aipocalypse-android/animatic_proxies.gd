extends RefCounted

var car_scene: PackedScene = preload("res://assets/car.glb")
var human_scenes := {"paramedic": preload("res://assets/paramedic.glb"), "astronaut": preload("res://assets/astronaut.glb")}

func mesh(parent: Node3D, shape: Mesh, at: Vector3, color: Color) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.mesh = shape
	node.position = at
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.8
	node.material_override = material
	parent.add_child(node)
	return node

func box(parent: Node3D, at: Vector3, size: Vector3, color: Color) -> MeshInstance3D:
	var shape := BoxMesh.new()
	shape.size = size
	return mesh(parent, shape, at, color)

func sphere(parent: Node3D, at: Vector3, radius: float, color: Color) -> MeshInstance3D:
	var shape := SphereMesh.new()
	shape.radius = radius
	shape.height = radius * 2
	shape.radial_segments = 16
	shape.rings = 8
	return mesh(parent, shape, at, color)

func cylinder(parent: Node3D, at: Vector3, radius: float, height: float, color: Color, top: float = -1) -> MeshInstance3D:
	var shape := CylinderMesh.new()
	shape.bottom_radius = radius
	shape.top_radius = radius if top < 0 else top
	shape.height = height
	shape.radial_segments = 16
	return mesh(parent, shape, at, color)

func label(parent: Node3D, at: Vector3, text: String, pixel: float = 0.0014) -> Label3D:
	var node := Label3D.new()
	node.text = text
	node.position = at
	node.font_size = 48
	node.pixel_size = pixel
	node.outline_size = 2
	parent.add_child(node)
	return node

func device(parent: Node3D, name: String) -> Node3D:
	var root := Node3D.new()
	parent.add_child(root)
	var handheld := name in ["phone", "radio", "desk_phone", "headset"]
	var size := Vector3(0.10, 0.19, 0.018) if handheld else Vector3(1.0, 0.62, 0.10)
	box(root, Vector3.ZERO, size, Color("202b36"))
	box(root, Vector3(0, 0, size.z * 0.5 + 0.001), size * Vector3(0.90, 0.86, 0.1), Color("050d17"))
	var screen := label(root, Vector3(0, 0, size.z * 0.5 + 0.004), "", 0.00024 if handheld else 0.0013)
	screen.modulate = Color("ff344b")
	root.set_meta("screen", screen)
	if not handheld:
		box(root, Vector3(0, -0.36, -0.03), Vector3(0.10, 0.15, 0.12), Color("333e48"))
		box(root, Vector3(0, -0.43, 0), Vector3(0.52, 0.04, 0.3), Color("333e48"))
	elif name == "radio":
		box(root, Vector3(0.03, 0.13, 0), Vector3(0.008, 0.10, 0.008), Color("151b24"))
	return root

func actor(parent: Node3D, id: String) -> Dictionary:
	var orbital := id.contains("astronaut")
	var model: Node3D = human_scenes["astronaut" if orbital else "paramedic"].instantiate()
	parent.add_child(model)
	var coat := Color("ee541b") if id.contains("paramedic") or id.contains("fire") else Color("41688b")
	if id.contains("doctor") or id.contains("nurse") or id.contains("hospital"):
		coat = Color("b6d6d5")
	elif id.contains("vendor"):
		coat = Color("9b784e") if id.contains("manila") else Color("567e79")
	for part in model.find_children("*", "MeshInstance3D", true, false):
		if part.mesh is ArrayMesh:
			for surface in range(part.mesh.get_surface_count()):
				var original: Material = part.get_active_material(surface)
				if original != null and original.resource_name.contains("Workwear"):
					var copy := original.duplicate() as StandardMaterial3D
					copy.albedo_color = coat
					part.set_surface_override_material(surface, copy)
	var skeleton: Skeleton3D = model.find_children("*", "Skeleton3D", true, false)[0]
	var player: AnimationPlayer = model.find_children("*", "AnimationPlayer", true, false)[0]
	player.play("PhoneGesture")
	player.pause()
	return {"node": model, "skeleton": skeleton, "player": player, "id": id}

func build(parent: Node3D, descriptor: Dictionary) -> Node3D:
	var kind: String = descriptor["kind"]
	var name: String = descriptor["name"]
	if kind == "device":
		var node := device(parent, name)
		node.set_meta("kind", kind)
		return node
	var root := Node3D.new()
	root.set_meta("kind", kind)
	parent.add_child(root)
	match kind:
		"vehicle":
			var car: Node3D = car_scene.instantiate()
			root.add_child(car)
			if name in ["ambulance", "fire_engine", "delivery_van"]:
				for part in car.find_children("*", "MeshInstance3D", true, false):
					if part.name in ["Cabin", "Roof"]:
						part.visible = false
				box(root, Vector3(-0.25, 1.0, 0), Vector3(2.5, 1.25, 1.5), Color("d9e0e2") if name != "fire_engine" else Color("b83c2e"))
				box(root, Vector3(-0.25, 1.0, 0.77), Vector3(2.45, 0.2, 0.025), Color("ef6b25"))
			if name.contains("wreck"):
				car.rotation.y = 0.45
				car.scale.x = 0.8
		"counter":
			box(root, Vector3(0, 0.48, 0), Vector3(2.4, 0.95, 0.8), Color("7a6554"))
		"shelf":
			for level in range(4):
				box(root, Vector3(0, 0.2 + level * 0.45, 0), Vector3(1.7, 0.05, 0.5), Color("7d888c"))
				for item in range(5):
					box(root, Vector3(-0.6 + item * 0.3, 0.34 + level * 0.45, 0), Vector3(0.18, 0.22, 0.23), Color("74a3a0") if item % 2 == 0 else Color("cda266"))
		"paper":
			box(root, Vector3.ZERO, Vector3(0.55, 0.01, 0.38), Color("e4dcc8"))
			var writing := label(root, Vector3(0, 0.01, 0), "Rozliczymy\npóźniej" if name == "notebook" else "BRAK POTWIERDZENIA", 0.0005)
			writing.rotation.x = -PI / 2
		"cup":
			cylinder(root, Vector3(0, 0.08, 0), 0.065, 0.16, Color("dedbd3"))
			box(root, Vector3(0.075, 0.08, 0), Vector3(0.055, 0.08, 0.035), Color("dedbd3"))
		"crane":
			box(root, Vector3(0, 2.5, 0), Vector3(0.3, 5, 0.3), Color("d39c3c"))
			box(root, Vector3(1.7, 4.8, 0), Vector3(4.4, 0.3, 0.4), Color("d39c3c"))
			box(root, Vector3(2.7, 3.5, 0), Vector3(0.04, 2.6, 0.04), Color("737b84"))
		"container":
			box(root, Vector3(0, 0.65, 0), Vector3(2.5, 1.3, 1.2), Color("457b8b") if name != "refrigerated_containers" else Color("b9c7c5"))
			for index in range(8):
				box(root, Vector3(-1.1 + index * 0.31, 0.65, 0.61), Vector3(0.025, 1.2, 0.025), Color("75949e"))
		"robot":
			cylinder(root, Vector3(0, 0.2, 0), 0.45, 0.4, Color("4c555e"))
			var arm := Node3D.new()
			arm.name = "MovingArm"
			arm.position.y = 0.4
			root.add_child(arm)
			box(arm, Vector3(0, 0.75, 0), Vector3(0.35, 1.5, 0.35), Color("b99433"))
			box(arm, Vector3(0.65, 1.4, 0), Vector3(1.6, 0.3, 0.3), Color("b99433"))
		"rocket":
			cylinder(root, Vector3(0, 1.1, 0), 0.20, 2.2, Color("c2c8c8"))
			cylinder(root, Vector3(0, 2.4, 0), 0.20, 0.4, Color("636d76"), 0)
		"drone":
			box(root, Vector3.ZERO, Vector3(1.5, 0.2, 0.35), Color("6e7a83"))
			box(root, Vector3.ZERO, Vector3(0.3, 0.10, 2.6), Color("6e7a83"))
			box(root, Vector3(-0.6, 0.25, 0), Vector3(0.25, 0.5, 0.6), Color("6e7a83"))
		"door":
			box(root, Vector3(0.4, 1.05, 0), Vector3(0.8, 2.1, 0.1), Color("60727e"))
			box(root, Vector3(0.67, 1, 0.09), Vector3(0.15, 0.04, 0.04), Color("c3c9c8"))
		"stretcher":
			box(root, Vector3(0, 0.65, 0), Vector3(0.8, 0.15, 1.9), Color("8eaea9"))
			for x in [-0.3, 0.3]:
				for z in [-0.7, 0.7]:
					box(root, Vector3(x, 0.3, z), Vector3(0.05, 0.6, 0.05), Color("b0b8bc"))
		"chair":
			box(root, Vector3(0, 0.5, 0), Vector3(0.6, 0.1, 0.55), Color("546876"))
			box(root, Vector3(0, 0.88, -0.25), Vector3(0.6, 0.75, 0.08), Color("546876"))
		"water":
			for index in range(3):
				cylinder(root, Vector3(index * 0.12 - 0.12, 0.13, 0), 0.045, 0.26, Color("6cabb9"))
		"gauge":
			cylinder(root, Vector3.ZERO, 0.16, 0.04, Color("d4d7cd")).rotation.x = PI / 2
			label(root, Vector3(0, 0, 0.03), "09:22" if name == "wall_clock" else "02", 0.0006)
		"earth":
			sphere(root, Vector3.ZERO, 1.1, Color("216da1"))
			sphere(root, Vector3(-0.2, 0.25, 1.05), 0.3, Color("648568")).scale = Vector3(1, 1.5, 0.06)
		"prop":
			box(root, Vector3(0, 0.08, 0), Vector3(0.3, 0.16, 0.24), Color("ad9d79"))
		"environment":
			if name.contains("stairs") or name.contains("underground"):
				for index in range(6):
					box(root, Vector3(0, index * 0.15, -index * 0.25), Vector3(1.3, 0.15, 0.3), Color("73808b"))
			elif name.contains("signal"):
				box(root, Vector3(0, 1.4, 0), Vector3(0.08, 2.8, 0.08), Color("555d64"))
				box(root, Vector3(0, 2.65, 0), Vector3(0.35, 0.8, 0.25), Color("171f28"))
				sphere(root, Vector3(0, 2.45, 0.16), 0.09, Color("39d96e"))
			elif name.contains("pipe"):
				cylinder(root, Vector3(0, 0.6, 0), 0.12, 1.2, Color("748997"))
			elif name.contains("habitat_exterior"):
				cylinder(root, Vector3(0, 1, 0), 0.8, 2.4, Color("a8b2b8")).rotation.z = PI / 2
				cylinder(root, Vector3(0, 1, 0.85), 0.3, 0.1, Color("3b778e")).rotation.x = PI / 2
			elif name.contains("polar_station_exterior"):
				box(root, Vector3(0, 1, 0), Vector3(4, 2, 2), Color("b4c9cc"))
				for index in range(4):
					box(root, Vector3(-1.4 + index * 0.9, 1.2, 1.01), Vector3(0.5, 0.5, 0.02), Color("e1c78d") if index == 0 else Color("283d4d"))
			else:
				# An explicit rough architectural proxy, never a silently substituted final model.
				box(root, Vector3(0, 0.7, 0), Vector3(1.6, 1.4, 0.25), Color("637c8b"))
	return root
