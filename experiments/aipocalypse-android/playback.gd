extends RefCounted

const DURATION: float = 25.0
var duration: float = DURATION
var elapsed: float = 0.0
var playing: bool = false

func _init(total: float = DURATION) -> void:
	assert(total > 0 and is_finite(total))
	duration = total

func seek(time: float) -> void:
	assert(is_finite(time))
	elapsed = clampf(time, 0, duration)
	if elapsed >= duration:
		playing = false

func start() -> void:
	if elapsed >= duration:
		elapsed = 0.0
	playing = true

func pause() -> void:
	playing = false

func restart() -> void:
	elapsed = 0.0
	playing = false

func advance(delta: float) -> void:
	if playing:
		elapsed = minf(duration, elapsed + maxf(0.0, delta))
		if elapsed >= duration:
			playing = false
