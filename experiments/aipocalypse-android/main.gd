extends Node3D

const Playback = preload("res://playback.gd")
const Timeline = preload("res://film_timeline.gd")
var clock = Playback.new(870)
var timeline = Timeline.new()
var world: Node3D
var ui: Control
var status: Label
var notes: Label
var subtitle: Label
var slider: HSlider
var sequence_picker: OptionButton
var card_panel: ColorRect
var card_text: Label
var flash_panel: ColorRect
var dragging := false
var resume_after_drag := false
var entered_finale := false
var finale_revealed := false
var manual_hidden := false
var previous_black := false
var black_revealed := false

func _ready() -> void:
	world = preload("res://animatic_world.gd").new()
	add_child(world)
	_build_ui()
	_update_frame()

func _panel(parent: Node) -> PanelContainer:
	var node := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.025, 0.035, 0.05, 0.88)
	style.content_margin_left = 16
	style.content_margin_right = 16
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	node.add_theme_stylebox_override("panel", style)
	parent.add_child(node)
	return node

func _label(parent: Node, size: int) -> Label:
	var node := Label.new()
	node.add_theme_font_size_override("font_size", size)
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	parent.add_child(node)
	return node

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	flash_panel = ColorRect.new()
	flash_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	flash_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	flash_panel.color = Color(1, 1, 1, 0)
	layer.add_child(flash_panel)
	card_panel = ColorRect.new()
	card_panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	card_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	card_panel.color = Color.BLACK
	layer.add_child(card_panel)
	card_text = Label.new()
	card_text.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	card_text.offset_left = 90
	card_text.offset_right = -90
	card_text.offset_top = 80
	card_text.offset_bottom = -80
	card_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	card_text.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	card_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	card_text.add_theme_font_size_override("font_size", 42)
	card_text.add_theme_color_override("font_outline_color", Color.BLACK)
	card_text.add_theme_constant_override("outline_size", 4)
	card_panel.add_child(card_text)
	ui = MarginContainer.new()
	ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_theme_constant_override("margin_left", 12)
	ui.add_theme_constant_override("margin_right", 12)
	ui.add_theme_constant_override("margin_top", 8)
	ui.add_theme_constant_override("margin_bottom", 8)
	layer.add_child(ui)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 6)
	ui.add_child(column)
	var top := VBoxContainer.new()
	_panel(column).add_child(top)
	var heading := _label(top, 18)
	heading.text = "AIpokalypse • ANIMATIK ROBOCZY • uproszczone modele, głosy do nagrania"
	status = _label(top, 21)
	notes = _label(top, 17)
	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	column.add_child(spacer)
	var bottom := VBoxContainer.new()
	_panel(column).add_child(bottom)
	var captions := MarginContainer.new()
	captions.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE)
	captions.offset_top = -230
	captions.offset_bottom = -170
	captions.offset_left = 40
	captions.offset_right = -40
	captions.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(captions)
	subtitle = _label(captions, 26)
	subtitle.add_theme_color_override("font_outline_color", Color.BLACK)
	subtitle.add_theme_constant_override("outline_size", 6)
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	slider = HSlider.new()
	slider.max_value = 870
	slider.step = 0.1
	slider.custom_minimum_size.y = 32
	slider.drag_started.connect(_scrub_start)
	slider.drag_ended.connect(_scrub_end)
	slider.value_changed.connect(_scrub)
	bottom.add_child(slider)
	var controls := HBoxContainer.new()
	controls.alignment = BoxContainer.ALIGNMENT_CENTER
	bottom.add_child(controls)
	for title in ["Start", "Pauza", "Restart", "−10 s", "+10 s", "Obraz"]:
		var button := Button.new()
		button.text = title
		button.custom_minimum_size = Vector2(120, 48)
		button.add_theme_font_size_override("font_size", 22)
		button.pressed.connect(_control.bind(title))
		controls.add_child(button)
	sequence_picker = OptionButton.new()
	sequence_picker.custom_minimum_size = Vector2(640, 42)
	sequence_picker.add_theme_font_size_override("font_size", 20)
	for sequence in timeline.sequences:
		sequence_picker.add_item("%02d • %s • %s" % [sequence["number"], Timeline.stamp(sequence["start"]), sequence["title"]])
	sequence_picker.item_selected.connect(_jump_sequence)
	bottom.add_child(sequence_picker)

func _control(action: String) -> void:
	match action:
		"Start": clock.start()
		"Pauza": clock.pause()
		"Restart": clock.restart()
		"−10 s": clock.seek(clock.elapsed - 10)
		"+10 s": clock.seek(clock.elapsed + 10)
		"Obraz":
			manual_hidden = true
			ui.hide()
	_update_frame()

func _jump_sequence(index: int) -> void:
	clock.seek(timeline.sequences[index]["start"])
	_update_frame()

func _scrub_start() -> void:
	resume_after_drag = clock.playing
	clock.pause()
	dragging = true

func _scrub(value: float) -> void:
	clock.seek(value)
	_update_frame()

func _scrub_end(_changed: bool) -> void:
	dragging = false
	if resume_after_drag and clock.elapsed < 870:
		clock.start()

func _process(delta: float) -> void:
	clock.advance(delta)
	_update_frame()

func _update_frame() -> void:
	if not is_instance_valid(world) or not is_instance_valid(ui):
		return
	world.apply_time(clock.elapsed)
	var shot: Dictionary = world.current_shot
	status.text = "%s / 14:30 • %02d/22 • %s • %s" % [Timeline.stamp(clock.elapsed), shot["seq"], shot["id"], str(shot["location"]).replace("_", " ")]
	notes.text = shot["action"]
	subtitle.text = timeline.caption_at(clock.elapsed)
	subtitle.visible = not subtitle.text.is_empty()
	if not dragging:
		slider.set_value_no_signal(clock.elapsed)
	sequence_picker.select(int(shot["seq"]) - 1)
	var black: bool = shot["environment"] == "black"
	var words: String = timeline.card_at(clock.elapsed)
	card_panel.visible = black or not words.is_empty()
	card_panel.color = Color(0, 0, 0, 1.0 if black else 0.82)
	var opening_card: bool = clock.elapsed >= 35 and clock.elapsed < 55
	if opening_card:
		card_panel.color.a = 0.65
	card_text.offset_top = 380 if opening_card else 80
	card_text.offset_bottom = -45 if opening_card else -80
	card_text.text = words
	var finale: bool = clock.elapsed >= 845
	if finale and not entered_finale:
		finale_revealed = false
		ui.hide()
	elif not finale and entered_finale:
		ui.show()
	if black and not previous_black:
		black_revealed = false
	if black and not finale and not black_revealed:
		ui.hide()
	elif not black and previous_black and not manual_hidden:
		ui.show()
	previous_black = black
	entered_finale = finale
	if finale and not finale_revealed:
		ui.hide()
	# No explosion audio is fabricated. Light is a rough cue only at the scripted sites.
	var flash := 0.0
	if int(shot["seq"]) == 20 and shot["location"] in ["warsaw_center", "manila_shop", "nairobi_shop"] and ("distant_flash" in shot["effects"] or "distant_detonation" in shot["effects"]):
		var p: float = (clock.elapsed - shot["start"]) / float(shot["end"] - shot["start"])
		flash = 0.88 * clampf(1 - absf(p - 0.55) * 8, 0, 1)
	if "offscreen_impact_light" in shot["effects"]:
		var impact_p: float = (clock.elapsed - shot["start"]) / float(shot["end"] - shot["start"])
		flash = maxf(flash, 0.75 * clampf(1 - absf(impact_p - 0.65) * 10, 0, 1))
	flash_panel.color.a = flash
	world.visible = not black

func _unhandled_input(event: InputEvent) -> void:
	var touched: bool = event is InputEventScreenTouch and event.pressed
	var clicked: bool = event is InputEventMouseButton and event.pressed
	if (touched or clicked) and is_instance_valid(ui) and not ui.visible:
		finale_revealed = true
		black_revealed = true
		manual_hidden = false
		ui.show()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		clock.pause()
