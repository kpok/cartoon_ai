extends RefCounted

var data: Dictionary
var shots: Array
var sequences: Array

func _init() -> void:
	var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://assets/animatic.json"))
	assert(parsed is Dictionary, "Compiled animatic data missing or malformed")
	data = parsed
	assert(data.get("schema_version") == 1 and data.get("duration") == 870)
	shots = data["shots"]
	sequences = data["sequences"]
	assert(shots.size() == 149 and sequences.size() == 22)
	var cursor := 0.0
	for shot in shots:
		assert(shot["start"] == cursor and shot["end"] > cursor)
		cursor = shot["end"]
	assert(cursor == 870)

func index_at(time: float) -> int:
	var t := clampf(time, 0, 870)
	var low := 0
	var high := shots.size() - 1
	while low < high:
		var mid := (low + high) / 2
		if t >= float(shots[mid]["end"]):
			low = mid + 1
		else:
			high = mid
	return low

func shot_at(time: float) -> Dictionary:
	return shots[index_at(time)]

func caption_at(time: float) -> String:
	if time >= 845:
		return ""
	var lines: Array[String] = []
	for cue in data["dialogues"]:
		if time >= float(cue["start"]) and time < float(cue["end"]):
			lines.append("%s: %s" % [cue["speaker"], cue["text"]])
	var signature = shot_at(time).get("signature")
	if signature is Dictionary and signature["mode"] == "voice" and time >= signature["start"] and time < signature["end"]:
		lines.append("Urządzenie: Hacked by AIpokalypse [głos do nagrania]")
	return "\n".join(lines)

func card_at(time: float) -> String:
	if time >= 35 and time < 48:
		return data["opening_disclaimer"]
	if time >= 48 and time < 55:
		return data["title"] + "\n17 minut wcześniej • 06:00 UTC"
	if time >= 735 and time < 745:
		return "Mija ponad dwadzieścia minut"
	return shot_at(time).get("card_text", "")

static func stamp(time: float) -> String:
	var value := int(time)
	return "%02d:%02d" % [value / 60, value % 60]
