# MakeHuman/MPFB pilot — authorized implementation

Owner accepted the MPFB/MakeHuman pilot and CI execution. This supersedes the earlier prohibition on verified external human bases for this pilot only. Static single clothed male character, code-driven Blender generation, anatomy/appearance validation before the pair. No paid services, GPU rental, merge or production deployment.

## Acceptance
- MPFB-001: pinned, hash-verified Blender and MPFB, plus individually identified CC0 system assets; preserve source/license provenance.
- MPFB-002: actual MPFB anatomical human, rig, eyes/hair/skin and clothing; no fallback to the old primitive model or silently skipped required assets.
- MPFB-003: CPU headless generation and front/angle/side/back clay and material renders with timing, version/source manifests, plus self-contained GLB and blend.
- MPFB-004: meaningful output validation, geometry/rig/material and GLB round-trip checks; owner-only bounded GitHub workflow with audit-before-publication, summary and 1-day artifacts.
- MPFB-005: honest single-character visual pilot, not an exact likeness or completed salsa pair. Existing pair comparison and80 threshold remain unchanged; no fake pair score for this different scene.

## Verified checkpoint1
- Local Blender4.2.0 downloaded; SHA256 matches the existing approved robot workflow pin.
- MPFB releasev2.0.18 commitd0a32e57a7f915cb2f2b95410e2117648c7bbb7e archive SHA256b50c69...65f8.
- Actual local Blender headless smoke succeeded: extension registration via LOCAL extension repository, HumanService.create_human and default rig produced19158 source vertices and163 rig bones. This establishes API/Blender compatibility, not rendering success or appearance quality.
- System assets pack official URL and CC0 declaration identified; archive download/hash verification is pending this checkpoint.

## Capability / decisions
- READY_WITH_ASSUMPTIONS: local headless CPU Blender works; no GPU is needed for the proposed CPU pilot. Runtime and image quality will be measured, not promised.
- DEC-PILOT-001 accepted: use MPFB release2.0.18 with existing Blender4.2.0 and CPU Cycles, procedural orchestration via Python.
- DEC-PILOT-002 accepted within owner scope: CC0 MakeHuman core/system assets, explicit provenance and separate code licenses; no third-party marketplace asset or paid API.
- Keep changes isolated under experiments/makehuman-pilot and a dedicated workflow. Frequent checkpoint commits on the existing PR branch.

## Implemented pilot (2026-10-30)
- Implementation revision: `74c6034af98127d139fc3b437ec1eb90084003a7`.
- MPFB-001 complete: all three input archives downloaded and independently hash-verified; official CC0 asset pack is in the lock. Selected asset descriptors and their SHA-256 hashes are recorded per generation; upstream archive hashes cover textures and fitted geometry.
- MPFB-002 complete: actual MPFB mesh (19,158 source vertices), 163-bone default rig, seven meshes including skin/eyes/hair/eyebrows/lashes/clothing/shoes. No fallback geometry. Closed mouth; no separate teeth/tongue assets in this pilot.
- MPFB-003 complete locally: eight 640x800 material/clay views, packed Blender scene, textured GLB, source/version/license manifest. Final local generation: CPU, 24 samples, 49.23 seconds. Time excludes downloads and CI audit; not a GitHub timing claim.
- MPFB-004: Blender reimports exported GLB after deleting source objects; validator checks actual GLB joints, embedded image/buffer dependencies, meshes, PNG dimensions and manifest. Actual final output passes. Negative checks reject missing source rig and truncated GLB. Owner-only workflow with read-only token, pinned actions, bounded 45-minute job, audit before publication and one-day artifact retention. Validation failures still publish completed generation artifacts for diagnosis, explicitly labeled in Summary, while the workflow remains failed.
- MPFB-005: existing pair, reference and 80% gate unchanged. Pilot does not receive a couple-comparison score or claim likeness.
- Checks at implementation revision: 60 Node tests passed; workflow policy 11 jobs passed including new adversarial artifact/authorization mutations; 37-file production build and license/provenance gate passed. Independent workflow review and final visual/export review PASS.
- First real GitHub pilot run `41141133457` succeeded on preceding implementation revision `14defc88d7f0437b07f03f3fbc10d52303a1399f`, artifact `13017519706` (~30 MB). Final material/rig-validation revision passed generation and validation in run `41141271410`, publishing artifact `13018254580`.
- Outstanding artistic work: pose/camera fitting, appropriate wardrobe/hair, second character, then calibrated reference comparison. The anatomical base is validated; identity and reference matching are not acceptance claims of this pilot.
