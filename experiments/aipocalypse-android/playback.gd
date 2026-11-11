extends RefCounted

const DURATION: float = 8.0
var elapsed: float = 0.0
var playing: bool = false

func start() -> void:
	if elapsed >= DURATION:
		elapsed = 0.0
	playing = true

func pause() -> void:
	playing = false

func restart() -> void:
	elapsed = 0.0
	playing = false

func advance(delta: float) -> void:
	if playing:
		elapsed = minf(DURATION, elapsed + maxf(0.0, delta))
		if elapsed >= DURATION:
			playing = false
