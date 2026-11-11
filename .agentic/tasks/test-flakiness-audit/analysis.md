# Test flakiness audit — PR20

Baseline c6cbec1d. Scope: 32 test files, Playwright configuration and export smoke script. Static review is not proof that a test never flakes.

## Observed second CI failure

Run42977019173:107/108 passed; mobile Macarena failed strict PNG-buffer equality after3.4→7.8→3.4. Unlike the earlier paused seek failure, this uses synchronous renderRobotFrame, so it is not proven to be the same pre-RAF UI-state race. Retrieved CI trace: source frame metadata390×844 and expected3.4 cue; downsampled trace images from first/restored pose are pixel-identical (277×600). Full screenshot buffers were not retained, so compressed PNG metadata versus subtle full-resolution raster/compositor differences cannot be distinguished retrospectively. Do not claim a proven GPU bug or fix by adding arbitrary image tolerance.

Local unchanged reproduction:12 round trips, identical buffers every time. This does not rule out CI-specific rendering/capture races.

## Corrective actions

Export tests now capture canvas.toDataURL synchronously in the same task as renderRobotFrame. This tests actual unscaled WebGL output and avoids intervening RAF/compositor scaling. Exact image equality and distinct-pose checks remain. Interactive screenshot tests remain separate. Macarena now attaches all three full PNGs on failure for diagnosis. Kalinka interactive seeks await submitted frame time/revision, reusing the already introduced acknowledgment.

## Risk inventory

| Surface | Risk | Evidence / disposition |
|---|---|---|
| robot paused seek | High, confirmed pre-RAF race | Already repaired using frame acknowledgment; do not use requested time as rendered time. |
| Kalinka interactive seeks | High, same confirmed ordering | Added render acknowledgment. Automatic camera buttons still rely on action/screenshot scheduling; use revision acknowledgment in future broadening. |
| Macarena/Kalinka/original export | High, capture-layer coupling | Same-stack drawing-buffer capture, exact PNG equality retained; full mismatch artifacts added for Macarena. |
| Story screenshot round trips (strawberry, shelter, night shift) | Medium | Their draw functions render synchronously before publishing chapter/time; not the robot pre-RAF race. Still exposed to compositor/resize and encoded-image identity; retain user-visible screenshot checks, add raw pixel diagnostics before relaxing anything. |
| player autoplay/start/replay | Medium | Fixed1200ms wait assumes RAF advances; replay bounds<2/<3/<5s use wall clock and may fail under stalls. Prefer controlled clock for exact timing and polling for positive progression. Pause stability holds100–300ms are intentional negative observations, not automatically defective sleeps. |
| Readiness | Medium | Some data-ready assertions default5s despite module/WebGL initialization; readiness is not always first submitted frame. Prefer explicit render-ready contracts per player, not global timeout inflation. |
| Viewport/fullscreen | Medium | Screenshot tests can race ResizeObserver; await dimensions/camera aspect when changing layouts. Existing fixed export viewport is set before navigation, but no guarantee of compositor idleness. |
| Voice/audio mocks | Low–medium | Init-script mocks remove OS voice availability dependence. Some immediate spoken-array assertions should await intended event/predicate if start becomes async. No evidence of a failure currently. |
| Local server reuse | Medium locally, low CI | reuseExistingServer=!CI can serve stale dist on port3000; CI disables reuse. Prefer fresh server in reproducibility runs. |
| Pure timeline/math/geometry tests | Low | Explicit sample times/seeds, no real-time deadlines. Float tolerances mostly explicit; exact snapshots compare same inputs in same process. |
| Filesystem/server tests | Low | mkdtemp, isolated fixtures, ephemeral ports; no shared fixed test paths observed. |
| Python audit tests | Low with prerequisites | Fixtures and mock advisory data deterministic; Gitleaks availability is an environment prerequisite, not a random assertion failure. |
| Export smoke | Environment-sensitive | FFmpeg/espeak/browser versions and runner resources affect duration; asserts frame count/media properties, not bit-identical encoded MP4. Keep dependency failures distinct from flakes. |
| Live vulnerability registry/public audit | External dependency risk | Network/advisory changes may legitimately fail pipeline; do not bypass security gate or label real findings flakes. |

## Per-file static coverage

- `tests/browser/kalinka.spec.js`: browser/render/event risks above.

- `tests/browser/macarena.spec.js`: browser/render/event risks above.

- `tests/browser/music-sync.spec.js`: browser/render/event risks above.

- `tests/browser/night-shift.spec.js`: browser/render/event risks above.

- `tests/browser/player.spec.js`: browser/render/event risks above.

- `tests/browser/robot.spec.js`: browser/render/event risks above.

- `tests/browser/security.spec.js`: browser/render/event risks above.

- `tests/browser/shelter.spec.js`: browser/render/event risks above.

- `tests/browser/strawberry.spec.js`: browser/render/event risks above.

- `tests/episodes.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/export.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/github-settings.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/hardening.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/languages.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/macarena-music.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/night-shift.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-export.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-head-face.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-kalinka.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-macarena.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-playback.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-rig.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-stage.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/robot-sync.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/shelter.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/sound.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/story.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/strawberry-story.test.mjs`: deterministic JS/geometry/filesystem fixture review.

- `tests/test_audit_licenses.py`: isolated Python fixture/environment review.

- `tests/test_audit_privacy.py`: isolated Python fixture/environment review.

- `tests/test_audit_vulnerabilities.py`: isolated Python fixture/environment review.

- `tests/workflow-security.test.mjs`: deterministic JS/geometry/filesystem fixture review.


## Verification and limitations

Targeted original/Macarena/Kalinka export and paused-seek checks repeated desktop/mobile; outcome in delivery response. No global retries or screenshot tolerances added. Independent reviewer execution was unavailable due to agent quota; this audit and fixes have a sequential, non-independent review. Full browser suite is required in CI; local repeats cannot prove permanent non-flakiness.
