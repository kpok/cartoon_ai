# Verification checkpoint — 2026-11-01

Runtime6291d64a9d8bc9c09283784f6522ce8b522d31a7. Branch feat/shelter-before-rain. User authorized PR12merge and existing main Pages deployment after checks. Unrelated PR11 remains separate.

- npm test:62/62PASS, no skipped tests.
- npm run build:PASS,43strict public files/CSP/vendor/license inventory.
- npm run check:workflows:PASS,9owner-only jobs, existing permissions/triggers unchanged.
- npx playwright test tests/browser/shelter.spec.js --workers=1:14/14PASS desktop/mobile, including real roof/base geometry, playback/end/replay, speech and PL/EN, late/missing voices, subtitles, seek/language cancellation, visibility/BFCache event lifecycle and WebGL fallbacks.
- Root actual milestone frames inspected3/17/38/65/82/110/138/163/191/226/259/278/292/299s; repeated fixed frames for construction/transport/rain/ending. These are sample visual inspections, not a claim to have watched every second or auditioned physical-device voices.
- Independent plan/review/fix re-reviewPASS. SH-001/002closed, regression coverage added.
- bash scripts/run-public-audit.sh:PASS, secret/privacy history scan,26audit regression testsPASS, license/provenance and dependency checksPASS. Local private-term filter not configured. GitHub source audit41291664350SUCCESS.
- Full local browser regression in progress; no expensive MP4 render competes with it.
- Main CI/regression/deploy and live URL verification pending authorized merge, tracked in state.

Voice/audio limits: SpeechSynthesis is a browser/device service. Matching voices may be absent or remote and may differ in timing/pitch. Captions and explicit status preserve usability; mouth motion is expressive, not phoneme lip-sync. This edition has browser dialogue and procedural melody, no prerecorded audio/MP4 or separately recorded weather effects. No new runtime dependencies, binary assets, paid API, social upload or cloud resources.
