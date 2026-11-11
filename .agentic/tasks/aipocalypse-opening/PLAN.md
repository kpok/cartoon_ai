# Opening visual pass — 0–55 seconds

Baseline: 9997de0830dfd0e4356f4dd65fb756e7c94bb75b. Branch feat/aipocalypse-film, draft PR #19. Authorized: local implementation, small commits, branch updates and signed CPU Android CI. No merge. All artifacts retain one-day expiry.

## Analysis

READY_WITH_ASSUMPTIONS. Current player has canonical 870 s / 149 shots; sequence 1 rebuilds generic street props per cut and lacks a coherent junction. Source screenplay requires a bystander at the crashed taxi, not the later returning paramedic. Preserve the approved eight cuts (0/4/7/11/14/18/22/29/35 s), disclaimer 35–48 and title 48–55, dialogue and signature intervals. No new audio generation or dependency purchase.

Capabilities: repository read/write and Godot CPU rendering available; GitHub connector writes available; no local Android SDK verified, use existing signed CI. Physical Android playback is unverified. No changes to signing or workflow guards.

## Acceptance

- AC1: recognizable four-way wet junction at dawn, orthogonal lanes, stop lines, crossings, sidewalks and cafe. Two conflicting full green signals remain visible in a wide shot.
- AC2: taxi and van trajectories derive from absolute sequence time; approach, brake, contact, taxi rotation and stopped aftermath remain consistent across cuts and arbitrary seeks. No gore.
- AC3: shot-specific composition explains green signal, driver/check, second-axis approach, braking, collision, cafe cup, physical signature display and kneeling bystander calling beside unresponsive driver.
- AC4: bystander phone bound to hand; restrained head/arm gesture; seated drivers stay inside vehicles; cafe cup state resets on seek.
- AC5: all other 139 shots remain on existing builders (149 total; ten shots in opening sequences), full timeline/cards/dialogue unchanged. Opening uses a dedicated procedural scene; existing world exposes current-shot prop references for walkthrough tests and frees the whole previous subtree.
- AC6: test source timing, orthogonal signals, trajectory contact/stop/seek repeatability, cup and phone, camera projection of critical subjects; full player regression and representative actual renders. Independent plan/code reviews; signed APK and draft PR evidence.

## Implementation

1. Add dedicated reusable opening set and pure absolute-time vehicle state; keep it isolated from other location builders. Commit scene foundation.
2. Add drivers, cafe, cup, bystander, hand attachment and eight cameras. Integrate sequence 1 only; keep sequence 2 background and existing exact cards. Commit staging and tests.
3. Render representative frames and a short movement sample if available; independent implementation review, bounded fixes and tests. Commit fixes and evidence.
4. Run signed CPU CI, verify artifact and update draft PR. Document rough quality, incomplete sound and pending phone acceptance.

No new material architecture decision: one isolated scene is a reversible extension of existing procedural Godot builders. Rollback by reverting this pass; canonical plan and other scene builders remain unchanged.

Plan review: opening_plan_review PASS. Required evidence: continuity across cuts at 14/18 s, actual vehicle contact and stop, both green axes in one rendered frame, kneeling phone attachment, readable 35–55 s cards. Later Warsaw sets will need a separate continuity pass.
