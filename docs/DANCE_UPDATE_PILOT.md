# Aktualizacja tańca — pilot01

24-second code-generated comedy. Preview: `dance-update.html`; finite playback, no autoplay or dialogue. Click **Odtwórz** to enable original procedural sound effects. Muting, pausing, seeking, restarting, hiding the page and losing WebGL stop or suppress audio appropriately. Seeking pauses playback; replay after24s starts again at0.

## Story

| Time | Beat |
| --- | --- |
| 0–3s | One leg starts dancing; the update badge confirms the unexpected installation. |
| 3–7s | The other leg tries to pin it down; the robot struggles to balance. |
| 7–11s | The second leg updates and dances out of phase while its badge fills. |
| 11–17s | Both legs synchronize; the robot opens its hands in relief and turns. |
| 17–21s | One arm unexpectedly updates and starts moving. |
| 21–24s | The opposite arm's update progresses; worried expression, then its movement begins before the final cut. |

Icons and gestures carry the story; no readable UI text is required inside the video. The final shot is a cut, not a seamless loop. The pilot intentionally reuses the existing short-legged robot, not Kalinka's costume or borrowed choreography.

## Audio and timing

`src/dance-update-story.js` owns the24-second timing and event grid. `dance-update-audio.js` synthesizes deterministic48kHz mono PCM: two-tone update notifications, filtered-by-envelope mechanical noise clicks, low foot impacts, and a three-note success sting. No samples, speech, external song, paid API, AI audio service or runtime network sound is used. Browser Web Audio plays the same PCM buffer used for export; its clock drives video while audio is available, with a silent performance-clock fallback. Foot impacts are authored at the kick-cycle return boundaries.

These are cartoon effects rather than a physically simulated metal recording. External music is optional and unnecessary for the joke. If music is later added through Facebook, its licensing does not automatically cover YouTube; keep the effects-only master.

## Generate a ready-to-upload master

```bash
npm ci --ignore-scripts
npm run build
npx playwright install chromium
npm run robot:mp4 -- --dance update --width 720
```

Use `--width 720` (space-separated argument); supported widths360/720/1080. Full result:720×1280,24fps,576 frames,24s,H.264/yuv420p plus AAC48kHz mono effects. Default path `robot-video/robot-dance.mp4`; matching JSON records config, model hash and soundtrack provenance. Use `GITHUB_SHA` for exact source commit provenance when running locally. Draft smoke: `--dance update --width 360 --duration 0.5 --out /tmp/update-smoke.mp4`.

GitHub Actions → **Export dancing robot MP4** → `dance: update`. The existing workflow stays owner-only, manual and main-only; a feature branch cannot trigger that renderer. Artifacts expire after1day. Nothing uploads to Facebook or YouTube. Original/Kalinka exports still contain no audio.

## Architecture and validation

The additive pilot uses the existing published GLB without editing it. `dance-update-stage.js` resets named pivots before every pose, renders a static portrait camera and procedural progress badges; export and web preview use the same stage. `dance-update-player.js` owns finite transport and invalidates asynchronous audio resumes on pause/seek/navigation. It creates no audio device until a play gesture. No new dependencies or broader CSP are required.

The exporter renders exact frame times, then muxes synthesized WAV with AAC. Existing audio+video `validateMovie` checks pilot stream counts, codec, resolution, frame count, rate and container/video/audio duration; older silent modes retain their original validation. Tests cover timeline progression, deterministic PCM, finite samples, audible cues, transport, asynchronous audio failure/races, rendering repeatability and fallback.
