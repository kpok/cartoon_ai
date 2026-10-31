# MPFB pair / pose continuation

Baseline: cd8b74f (validated single-character MPFB pilot). User authorized continuation with agentic-deliver and frequent small pushed commits. No merge/deploy or paid inputs.

Analysis: current generator builds one neutral male and exports eight views. Real upstream bases, clothing assets, rigs and CPU CI already work. Next slice adds a female base, explicit pair placement and bone-driven partner pose, a fixed reference-facing camera, warm stage and appropriate emerald/navy palette. The reference image and previous procedural comparison remain unchanged. Single-character mode remains reproducible. Asset downloads must be restored in this fresh runtime.

Acceptance:
- PAIR-001: two distinct anatomical MPFB characters, each rigged and clothed; required assets fail closed; provenance per character.
- PAIR-002: deterministic pair placement/pose and framing; front render keeps both characters' full geometry in frame, additional views expose defects. No identity/80% claim.
- PAIR-003: packed blend and self-contained GLB round-trip preserving both posed characters, materials and rigs; validate exported rig count and character inventory.
- PAIR-004: existing owner-only CPU workflow publishes renders/model/manifest and truthful summary, including diagnostics on validation failure; no new secret or permission.
- PAIR-005: local rendered views and independent code/visual review, relevant tests and real GitHub run evidence.

Plan: checkpoint plan; inspect pinned rig/asset API; implement configurable single/pair construction; validate local low-sample render; checkpoint generator; inspect images/fix pose and framing; update validation/CI/docs; independent implementation review; run tests and CI, push bounded fixes and record evidence. Default bounded budget: three substantive review/repair rounds. CPU only, same 45-minute CI limit.

Assumptions: code-driven artistic approximation, not automatic identity reconstruction. Official CC0 wardrobe may differ from the source and must be explicitly labeled. Pose and camera are configured to approximate the source; do not change the old metric to manufacture an improvement.


## Reference-face steering and decisions
User explicitly requires both people, more face details from the reference, and code-generated models only. No imagegen or generatedasset service is used. PAIR-006: distinct adult facial profiles with source hashes, geometric stubble, four face inspections and a geometric face roundtrip check. The original source image is only a visual reference, never projected onto the mesh.

DEC-PAIR-001 accepted after independent wardrobe council: repository-generated fitted emerald dress over real MPFB anatomy, rather than recoloring the official blouse/straight skirt with a wrong silhouette. Fit/weight/normals validation required; no cloth simulation claim. Council: pair_wardrobe_council. Independent plan review: pair_plan_review PASS; strengthened per-character inventory, rig ownership and pose checks adopted.

Implementation review round1: pair_code_review found inward skirt winding, embedded arm/grip and a misleading unconditional Summary pass phrase. Winding and report corrected. Body weights were independently verified to track the correct bones; occlusion arose from arm targets/rotation, not lost anatomy. Static two-segment arm placement treats twist bones as subdivisions, not extra elbows; body turns toward partner and right wrists orient toward the grip.

Face review round1: face_geometry_review found far hands inside garments and missing face inspection checks. Current corrections move male far hand outside his own hip, woman's raised hand forward of partner shoulder, require portraits/profile hashes, and compare sampled sculpted face positions after GLB import. Adult age=.5 replaces the earlier child/young blend; this was verified against pinned MPFB randomization source. Warm stage is deferred while prioritizing the user's explicit facial/detail work; no background-based score optimization.

Runtime data is disposable and was restored after environment reset; implementation checkpoints are on the PR branch. Local final candidate and CI evidence are pending. No new similarity score or completed photorealistic pair claim.

## Verification checkpoint (2026-10-31)
Implementation: `818355066810df0b0e377b7b523ce5565bb28818`; rendered geometry is unchanged from `3e68400`. The last commit selects the head by anatomical weights instead of a height slab that also included a raised hand.

- Two adult bases: 38,316 source vertices total, 326 bones total, 15 meshes. Distinct required asset inventories and separate skins exported.
- 17 female / 15 male active reference-inspired face morphs with upstream hashes; 1,800 geometric beard strands. Closed-lip expressions, no separate teeth/tongue. Existing approved reference used only as visual guidance; no generated imagery, face-photo textures, marketplace model or model-generation API.
- Eight whole-scene views and four face inspections generated from code. Final local model/render generation (3e68400) completed in 115.87 s at 8 samples; earlier adult-face generation at 24 samples took 215.78 s. Times exclude input downloads/audit.
- Final local output validator PASS. Roundtrip pose error 8.4754e-7 world units. Independent anatomical-head sampling/reimport of exact final geometry: 4,069 head vertices/person, 102 samples/person; maximum error woman0.0008989754, man0.0003297693, unchanged tolerance0.002xsceneheight. Source and reimported GLB are used, not declared counters alone.
- Nine Python regression tests PASS: missing partner rig/mesh, shared rig, lost pose, clipped/nonfinite framing, lost face sculpt/profile and external texture dependencies. Sixty Node tests PASS; production37-file build PASS; workflow policy11owner-only jobs PASS; license/provenance gate PASS; Python compile and git diff checks PASS.
- Independent review ledger: plan PASS; wardrobe council accepted generated garment with conditions; implementation/visual required findings fixed (skirt winding, torso/hand penetration, grip orientation, summary honesty). Face review round2 PASS for exact final geometry; narrow head-measurement round3 PASS. No unresolved blocking finding for this approximate static pair scope.
- Real GitHub run41190400477 (a327b78) succeeded. Run41190570726 (3e68400) succeeded and uploaded artifact13038314086 (~42MB). Final8183550 measurement-only run41190897512 also succeeded, publishing artifact13038219317 (42,296,161bytes) with twelve PNGs, GLB, blend, manifest/provenance and Summary. All defined approximate-model acceptance checks are complete; no merge or deployment.
- Artistic limitations remain: generic likeness, subtle neutral/closed-lip expression, simplified hair cards, fitted non-simulated skirt and approximate footwear/wardrobe. These are not evidence of photorealism or calibrated reference similarity. Original procedural scene, reference and80% gate are unchanged; no new similarity percentage claimed.
