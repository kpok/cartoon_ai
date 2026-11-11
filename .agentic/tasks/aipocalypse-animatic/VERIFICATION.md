# Full rough animatic — verification

Date: 2026-11-11. Repository: kpok/cartoon_ai. Branch: feat/aipocalypse-film. Draft PR: #19. No merge authorized.

## Implementation revisions

- 5a0e56f7c858f0882ac37b9404b352e6a2ab4946: canonical runtime compiler, 870-second clock, timeline, retained sample scene.
- b2d45bda488f0d34a72f877214c9b3b48f1bb362: full player, procedural proxy scenes, captions, scrubber and sequence picker. Android CI 43029623949 passed; superseded by visual fixes.
- 44cf07f0827e75824a406f0c6f7dafa7c3753af8: reviewed critical visual cues, exterior kits, subtitle overlay, display text depth and APK timeline validation.

- dfbf62e99e1266c3003942d790a791fa990badd2: imported rest orientation retained in leg poses; seated characters placed at seat centers. Narrow independent re-review PASS; rendered car frame and full player regression passed.

- 68cf6f21155dacf84abc90fa72123ad09bf27fcb: explicitly package and validate the Godot license notice alongside runtime JSON.

## Acceptance and evidence

| Criterion | Evidence | Status |
|---|---|---|
| Canonical 870 s / 149 shots / 22 sequences | Production validator, compiler tests and film_timeline_test | Passed |
| Seek, sequence jumps, background pause, restart, terminal state | film_player_test; deterministic transforms | Passed |
| All shots construct; previous scene freed | 149-shot walk; two passes over 22 sequences; maximum 283 stage nodes | Passed for rough animatic |
| Major visual cues | Backward seek resets district lighting; retained lit windows; ignition attached to rocket; impact light; stopping headlights; opening signal focus | Passed |
| Captions without controls; exact finale | Separate overlay; final ranges checked at 845/849/852/860/862/869/870 s | Passed |
| Screen label in front of opaque surface | Geometric assertion and rendered nuclear status frame at 726 s | Passed |
| Android packaging | Runtime JSON explicitly included and APK validator requires complete timeline | CI 43030243560 passed for 44cf07f; final revision run linked in PR #19 |
| Final models, acting, complete sound | Rough proxy builders, reusable rigs and limited gestures; dialogue captions only | Incomplete, intentionally outside this rough pass |
| Phone performance and full playback | Not run on physical Android here | User verification pending |

## Checks

- npm test: 78 tests passed.
- Workflow security check: 10 owner-only jobs passed.
- Godot 4.6.3 headless: car, film timeline, playback, sample scene, acting and full film player tests passed. The retained sample scene test reports an ObjectDB cleanup warning at process exit; full film player test does not report this warning.
- Independent plan review: animatic_plan_review PASS with conditions recorded in PLAN.md.
- Independent implementation review: full_animatic_review requested changes; critical cue, exterior, focus and caption fixes applied; changed-area re-review PASS for rough animatic. Final display-depth and leg-pose fixes additionally verified by actual rendering, regression assertions and narrow independent review.
- Compatibility render on CPU Mesa llvmpipe: representative street, shop, car interior, lobby/elevator, factory, port, hospital, water infrastructure, underwater interior/exterior, polar interior/exterior, orbit, launch/control and final cards. Reviewed still frames, not a complete real-time playback or performance measurement.

## Remaining production work

The 520 asset dependencies in the planning manifest do not mean 520 final assets exist. Repeated simple proxy types currently stand in for many named objects. Natural acting, detailed environments, continuity polish, sound effects, recorded dialogue and final AI voice remain unfinished. No final film or scientific prediction is claimed. The approved screenplay and nuclear ending were preserved.

Current APK and final CI evidence are linked in draft PR #19; documentation-only commits may follow the tested code revision.
