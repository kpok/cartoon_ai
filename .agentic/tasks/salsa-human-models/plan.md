# Salsa human models — experiment plan

Baseline: afe6164232c901ac8eb78f6012b7faea5f2c9b49. Authorized: branch, frequent checkpoint commits, draft PR, static models and tests. No dance animation, merge or production deployment in this stage.

## Acceptance
- AC-001 Preserve the approved emerald/navy concept image byte-for-byte with hash and generation provenance. Fictional adults around 30: Polish dark-blond man and Filipina woman.
- AC-002 Build real 3D geometry with code, including faces, hair, clothing, hands and shoes, posed together as in the reference. No image billboard substitution.
- AC-003 Offer a static browser model viewer with orbit controls and a reproducible reference camera; no animation timeline.
- AC-004 Produce reference/render comparison artifacts, silhouette/landmark/color measurements and visual regression checks. Never describe a metric as proof of identity or photorealism.
- AC-005 Record limitations, actual verification and exact next steps so another session can resume. Keep the PR unmerged for visual review.

## Ordered work
1. Commit original reference, provenance and this plan; open draft PR.
2. Inspect existing Three.js/build/audit conventions; independently review plan.
3. Construct parameterized human meshes and fixed shared pose. Match silhouette, limb landmarks and palette before fine facial details.
4. Add separate viewer and reference camera; render and visually inspect front, side and rear. Record observed deviations honestly.
5. Add geometry and browser checks; make image-comparison diagnostics distinguish source-photo similarity from render regression.
6. Integrate build and CI without weakening trusted workflow restrictions. Independently review code, fix confirmed issues, run relevant checks and update PR.

## Feasibility and assumptions
One reference cannot reveal occluded anatomy or back surfaces. These must be inferred and documented. Procedural primitives alone are unlikely to achieve photographic identity; initial mesh is an experimental reconstruction and must not be mislabeled finished. No third-party human assets or video generator will be introduced. AI-generated reference is the approved design, not documentary photography. Existing Pages deployment is main-only; do not change it or merge merely to preview.

## Progress / resume
- Branch created; approved original copied locally. Models and checks not yet implemented.
- Next: preserve provenance, publish first checkpoint and open PR.

## 2026-10-30 continuation checkpoint
- Implemented procedural static couple, isolated browser viewer, camera presets, GLB download, bounded local preview validation, finite-geometry test, coarse render regression baseline and palette occupancy diagnostics.
- AC-001 preserved; AC-002 partial (stylized geometry, substantial anatomical/clothing/reference deviations); AC-003 implemented; AC-004 partial (three landmark offsets and render regression, source silhouette comparison still missing); AC-005 updated.
- Evidence: 57/57 Node tests, production build (37-file inventory) and license gate passed locally. Browser validation passed desktop captures, GLB download and mobile overflow. Full pre-existing browser suite not rerun. No CI/deployment success claimed for this branch.
- Independent implementation review identified root URL dependency resolution and unbounded preview startup/cleanup defects; both repaired. Review also correctly identified incomplete reference fidelity and diagnostic coverage; these remain explicitly open.
- Next: replace primitive anatomical/clothing surfaces with continuous shaped meshes, align actual reference landmarks and silhouette, inspect new renders, extend diagnostic comparisons, then review experiment CI integration without changing trusted main-only deployment restrictions. Do not merge merely to preview.

## User-directed staged validation follow-up
- Stage 1: owner-only GitHub Actions fixed-camera PNG capture and artifact download, independent of a future 80% similarity gate. Shared camera module and exact 1024×1536 capture. No similarity gate enabled in this stage, per latest instruction.
- Stage 2, pending: source/render/difference panel and explicit technical image metric. Council recommendations: 70% RGB SSIM + 30% tolerant edge F1, report components and caveats, preserve artifacts on gate failure, do not tune threshold to force the current prototype to pass. Reviewers: metric_review and workflow_review, independent read-only proposals. Both accepted with conditions documented in README/workflow. No claim of identity similarity.

- First Actions snapshot run 41118101885: full public audit passed; browser installation failed because ubuntu-latest resolved to Ubuntu 26.04, unsupported by locked Playwright 1.56.1. New snapshot job is pinned to ubuntu-24.04; existing workflows retain their current runner settings.

## Stage 2 implementation checkpoint
- User authorized reference comparison after successful stage-1 snapshot. Same owner-only workflow now publishes snapshot first, then installs isolated pinned Pillow, validates metric, compares fixed-camera PNG to preserved reference and fails below 80%.
- Explicit algorithm salsa-reference-v1: 70% RGB block SSIM + 30% tolerant edge F1. Full-frame technical metric, not identity/likeness. Inputs fixed1024×1536, analysis256×384, no auto-registration or threshold tuning.
- Local current prototype score32.4240735466%; expected failing gate. Local 7 behavioral tests cover identity, shift/color/missing subject, unrelated image, blank/aspect failures, threshold boundary, error reporting and report generation before failing exit.
- Reports: source/render/difference triptych, differencePNG, metricsJSON with hashes/camera and Markdown summary. One-day artifact uploads even after compare failure; original snapshot already uploaded independently.

- Review follow-up: full-frame-only score could exceed80% after erasing one test subject (80.18%). Added fixed full/left/right regions, using the minimum component score and the same80 threshold. No image alignment, trained detector, hand-tuned subject mask or weight change. Regression test now asserts missing-subject failure. Metric remains spatial/technical and cannot guarantee semantic completeness.
