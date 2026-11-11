# Opening visual pass — verification

Date: 2026-11-11. Branch: feat/aipocalypse-film. Draft PR: #19. No merge.

## Delivered code revisions

- 5ecade7: reviewed plan, pure absolute-time vehicle motion and contact/cut-continuity tests.
- f945bb7: coherent opening set integrated only for sequence 1; CPU Android CI passed.
- ad3c16a: corrected wide camera occlusion, road stop lines, cab detail, cafe/driver gestures, eight shot cameras, opening card layout and integration tests.
- 220fbe8c9f3779953b5e7a031ff07536f988c757: automatically hide playback controls during opening cards, explicit reveal and correct restoration including seek from finale.

## Acceptance evidence

| Criterion | Evidence | Status |
|---|---|---|
| Four-way junction, cafe, both green axes | CPU Compatibility frames at 1/5/8/12/14.2/15.3/17.8/19/25/32 s; four stop lines and orthogonal lamp tests | Passed for stylized visual pass |
| Contact, continuous movement and stopped aftermath | Motion test around every cut; integration test uses imported Body mesh world AABB contact; transforms preserved through 600 s and back | Passed |
| Eight canonical shots, source times/dialogue/signature | Production/compiler checks; no source plan changes; 149-shot walk and 870 s timeline | Passed |
| Cup, seated driver, kneeling call | Cup resets on backwards seek; phone attached to right hand, same transform on scene re-entry; rendered 19/32 s frames | Passed for rough acting |
| Readable 35–55 s cards | Real UI-state frames at 36/49; control hide/reveal, manual clean-view preservation and 845→36 seek checks | Passed |
| Resource bounds | 149-shot test and repeated sequence visits; maximum 539 current-scene nodes | Passed node-count bound |
| Signed APK of final code | Existing owner-only CPU workflow; final run and artifact linked in draft PR | See CI evidence in PR |
| Physical phone performance/full playback | Not measured here | Pending user acceptance |

Checks: opening_motion_test, opening_scene_test, film_player_test, film_timeline_test and playback_test passed locally on Godot 4.6.3. Eight relevant Node production/compiler tests passed. Workflow policy check passed (10 owner-only jobs). Existing full build additionally runs car, retained sample and acting checks; final CI status is linked in PR rather than assumed.

Independent reviews: opening_plan_review PASS with conditions applied. opening_code_review requested four stop lines (OPEN-01) and unobscured opening cards (OPEN-02); both fixed. Final changed-area review PASS after tests and real-state UI frames. Three implementation review rounds, no unresolved blocker.

Actual frames were rendered with Mesa llvmpipe, not AI video. Still-frame review and deterministic checks do not establish smooth phone playback or final artistic quality. No full rendered video was reviewed in this pass.

## Remaining work

The scene is a stylized improvement over generic proxies, not final realism. Cabins, facial acting, steering grip, collision deformation, glass, lighting and material detail can be refined. Driver anatomy and phone attachment retain simplified base rigs. Later Warsaw shots still use prior geography. No recorded dialogue, collision sounds, music or final AI voice added. All subsequent 139 shots and the nuclear finale retain their existing behavior.
