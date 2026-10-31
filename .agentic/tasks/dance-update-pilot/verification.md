# Delivery verification — 2026-10-31

Runtime:3940fad3a60a6ff316258724c2551d2efa9f1898. Test-only gallery update:51b17349cb5db5eaee02324f0f30604535a03058. Later changes only record evidence. PR11 remains unmerged; no deployment or social upload.

## Acceptance coverage
- AC-001/002: implemented24s story, deterministic pose/cue functions and finite transport. Milestones inspected at0.65/4/9/14/18/22/23.5s; final encoded23.5s image inspected. DU-001 hand clipping fixed with wider camera; independent all576frame bounds maxX0.916897/maxY0.768584 below0.95. Full portrait master recalculated after the fix.
- AC-003: same original synthesized48kHz PCM in browser and AAC export.14pilot desktop/mobile cases pass, including opt-in sound, mute/pause/seek/restart/end, delayed resume invalidation, visibility pause, audio-failure fallback, model/WebGL failure and deterministic rendering.
- AC-004: full720x1280,24fps,576frame MP4. ffprobe: H264/yuv420p video24.000000s and AAC48kHzmono audio24.000000s. Decoded PCM peak0.3426279724, RMS0.0352924909; first audible sample0.2503125s (authored notification0.25s). No clipping or silent soundtrack. File2808492bytes; SHA256 d4a394169119e0ca960b5cb798051421cafc9b26ed9a0d945fc28aa0335d3ad5. Metadata records runtime3940fad. Original/Kalinka separate360p0.5s smoke exports pass with exactly one silent H264 stream each.
- AC-005: discoverable sixth gallery card, isolated player/page, exact43-file build, existing restrictive CSP, owner/main-only manual export choice and unchanged existing dances/model. No new dependencies, external samples/song or audio API.
- AC-006: independent plan review PASS, fresh implementation review PASS, bounded framing and test re-reviews PASS. No required findings remain.

## Commands and outcomes
- `npm test`:59/59PASS; no skipped tests.
- `npm run build`:PASS,43-file inventory and vendored licenses verified.
- `npm run check:workflows`:PASS,9owner-only jobs; no authorization expansion.
- `npm run robot:check` and `npm run robot:sync`:PASS; original GLB byte-identical reproduction and rhythm audit unchanged.
- `python3 -m unittest discover -s experiments/dancing-robot -p 'test_*.py'`:3PASS.
- `python3 scripts/validate-robot.py published/robot --published`:PASS.
- `bash scripts/run-public-audit.sh`:PASS after synchronizing local history to exact policy-compliant remote tree;26audit regression testsPASS, secret/privacy/license/dependency checksPASS. Local private-term filter not configured. Source3940fad remote audit41235192441SUCCESS.
- Final broad `npx playwright test --workers=1`:75/78PASS. Two failures were the pre-update5-card assertion collected before the gallery test update; corrected to6and explicitly assert pilot visibility. One existing desktop manual-Kalinka test hit its30s screenshot limit. No timeout was increased and no behavior assertion removed.
- Narrow final rerun `npx playwright test tests/browser/kalinka.spec.js tests/browser/strawberry.spec.js -g 'manual Kalinka camera changes|library preserves earlier' --workers=1`:4/4PASS on final test tree (desktop18.3s/9.6s, mobile15.6s/10.8s). Thus all78cases have passing coverage across broad run and affected-case rerun, not a claim of a single clean78/78run.
- Unchanged main baseline afe6164, isolated manual-Kalinka desktop case at default30s:PASS16.3s. Observed timing failure is transient; no functional regression reproduced. Initial broad run concurrent with full software render was interrupted after multiple screenshot timeouts and is not counted as final evidence.
- Two framing cases rerun desktop/mobile with all576pose checks:PASS.

## Limitations
No live Pages deployment or end-user social upload. Existing dialogue/TTS film-export integration was not run locally because eSpeak NG is unavailable; that exporter/audio code is unchanged. New pilot audio and both robot silent-export modes were actually encoded/validated. Auditory artistic acceptance remains the owner's review; measured audio/framing checks do not prove the joke or sound will appeal to viewers. One existing software-WebGL timing flake was observed and resolved in isolated rerun.
