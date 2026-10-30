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
