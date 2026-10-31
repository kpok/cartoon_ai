# Dance update pilot — implementation plan

Baseline: afe6164232c901ac8eb78f6012b7faea5f2c9b49 (main). Branch: feat/dance-update-pilot.
Scope: implement the accepted 24-second silent-dialogue comedy with procedural sound effects; no licensed music. Push small checkpoints. No merge or deployment authorized.

## Acceptance criteria
- AC-001: a separate portrait pilot reuses the published robot. One leg dances unexpectedly, attempted restraint fails, the second leg synchronizes, relief, one arm updates, then the other starts at the final beat. Readable reactions and progress icons; no dialogue required.
- AC-002: deterministic seekable 24-second timeline and static camera; no dependence on an external song. Preserve original/Kalinka animations.
- AC-003: original synthesized update beeps, mechanical clicks, foot impacts and success sting at authored cue times; no external samples/API. One timeline drives visual/audio timing. Browser playback starts audio only on user gesture; pause/seek/restart/visibility cannot leave sounds playing.
- AC-004: reproducible vertical H.264 MP4 with embedded AAC sound and metadata. Existing original/Kalinka exports remain silent. Full pilot export validated with ffprobe and sampled frames/audio.
- AC-005: add a discoverable preview, build/public-file inventory, owner-only manual export choice and documentation. Keep restrictive CSP, audit gates, pinned actions, short artifact retention and no secrets expansion.
- AC-006: meaningful timeline/audio, browser and export regression tests; independent plan and implementation reviews; record exact results and limitations.

## Ordered slices / frequent remote checkpoints
1. Persist plan and analysis remotely before implementation; independent plan review.
2. Pure story/cue timeline and procedural PCM synthesis, with focused tests.
3. Robot pose adapter, portrait scene, icons and accessible preview/player, isolated from existing dances.
4. Extend exporter and manual workflow with the new pilot and AAC muxing; browser/export checks.
5. Inspect milestone frames and audio; fix confirmed defects, independent code review, final verification and PR handoff.

## Verification / budget
Reuse Three.js, Playwright, FFmpeg and the existing GLB. No new runtime dependencies, paid API or GPU. Draft360p frames first, one final720p24fps export. Local focused tests then full relevant Node/browser, build, workflow and license/public audit checks where available. Report unavailable checks; CI additional evidence. No cloud resources or social uploads.

## Assumptions and rollback
A standalone pilot page is preferable to adding story/audio complexity to existing dance viewer. Procedural cartoon foot taps do not require exact contact dynamics from the older rig. Final pose is a cut, not a seamless loop. Browser audio opt-in, MP4 includes effects by default. Remove new page/modules and the new export option to roll back; do not alter source GLB.
