# MakeHuman anatomical pilot

This code-only CPU experiment uses pinned MPFB 2.0.18 anatomy. The default CLI scene remains a neutral male. GitHub CI now uses `--scene salsa`: an adult female and male, separate anatomical rigs, a static partner pose, an emerald fitted dress, navy shirt and gray trousers. It replaces neither the old procedural salsa scene nor its source image or comparison gate. No image-generation service, generated photograph, reference-photo projection or external model-generation API is used. Existing licensed CC0 MakeHuman skin, eye and hair textures remain inputs.

Faces use explicit profiles in `face_profiles.py`: 17 female and 15 male geometry targets shape the jaw, chin, cheeks, nose, eyelids, brows and lips. The male also has 1,800 short code-generated beard strands. Profile values and exact upstream target hashes are saved per character. They are artistic approximations of visible reference features, not an identity reconstruction. Adult MPFB age=.5 is used for this scene.

The owner-only workflow runs on main and the experiment branch, or manual dispatch. It downloads SHA-256-pinned inputs, runs the public audit, generates eight 640x800 whole-scene Cycles CPU renders and four face inspections (material/clay for each person), exports a packed blend and textured GLB, validates both character inventories, camera margins, joints, embedded textures and reimported pose/face geometry, then uploads a one-day artifact. Summary reports measured generation time and actual validation status. Completed generation artifacts remain available for diagnostics if validation fails; the workflow still fails.

The dress is a repository-generated fitted garment, not an upstream asset or cloth simulation. The bodice fits the anatomical torso and excludes arm influences; the skirt uses pelvis/root weighting. Hair and footwear are official asset approximations and differ from the reference. Mouths have subtle closed-lip expressions; there are no separate teeth/tongue assets. The figures, grip, garment folds, hair and lighting still require artistic refinement. No calibrated similarity percentage is claimed for this new scene.

## Reproduce

Requires Python 3.12 and Linux x64. Downloads approximately 650 MB; allow several GB disk space.

```bash
python3 experiments/makehuman-pilot/prepare.py /tmp/makehuman-inputs
/tmp/makehuman-inputs/blender/blender-4.2.0-linux-x64/blender --background --factory-startup --offline-mode --threads 4 --python-exit-code 1 --python experiments/makehuman-pilot/generate.py -- --addon /tmp/makehuman-inputs/mpfb/mpfb2-d0a32e57a7f915cb2f2b95410e2117648c7bbb7e/src --assets /tmp/makehuman-inputs/systemAssets --output /tmp/makehuman-output --scene salsa
python3 experiments/makehuman-pilot/validate.py /tmp/makehuman-output
```

## Licenses and provenance

Blender and MPFB code: GPL-3.0-or-later. Upstream code is downloaded for execution, not copied into this repository or output artifacts. MPFB core mesh and selected official MakeHuman system assets: CC0-1.0. The input lock records immutable release commit, exact download hashes and official asset source. Selected asset filenames appear in the output manifest. See <https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html> and <https://github.com/makehumancommunity/mpfb2>. Generated images and anatomical assets derive from the CC0 inputs; generator script is GPL-3.0-or-later.

Keep anatomy inspections and calibrated reference-comparison measurements separate. Only scripts/configuration are committed; runtime meshes and renders are CI artifacts.

## Foreground comparison v1

`comparison.json` freezes the manually reviewed visible-person polygons and source image SHA-256 before the first score. A full-scene semantic render assigns woman=red/man=blue while retaining original material alpha and actual mutual occlusion. The camera must match `beauty-front.png`. Hair wisps, sandals and intertwined hands remain approximate in the manual reference annotation; inspect the published annotation overlay.

Each image receives one shared aspect-preserving scale+translation from the entire pair's foreground bounds into208x336 with8px margins. There is no per-person/face registration, stretch, color fitting or score search. Photo backgrounds are neutralized before resampling. Each person's RGB block-SSIM uses only the union of its reference/render foreground pixels; pure-background windows receive no weight. Per-person score is `100*sqrt(silhouetteIoU*foregroundRGBSSIM)` and the pair score is the minimum of both people. Missing candidate person scores0. Invalid reference/semantic configuration produces an error, not a number. Edge F1 and fixed reference-face ROI diagnostics are excluded from the headline.

This is a technical image-agreement index, not identity recognition, percent likeness or a calibrated probability.80 is the retained aspirational engineering target. The new index is not numerically comparable with the old procedural-scene34.1109%. First measurement defines a separate baseline; future deltas require identical algorithm/config/source hashes. Do not tune annotations or weights to inflate a measured result.

```bash
python3 -m venv /tmp/mpfb-comparison
/tmp/mpfb-comparison/bin/python -m pip install --only-binary=:all: -r experiments/salsa-human-models/requirements.txt
/tmp/mpfb-comparison/bin/python -m unittest discover -s experiments/makehuman-pilot -p test_comparison.py
/tmp/mpfb-comparison/bin/python experiments/makehuman-pilot/compare.py --model-dir /tmp/makehuman-output --output /tmp/makehuman-comparison
```

Exit0 meets80; exit1 means a valid score below80; exit2 means no valid score. The model artifact uploads before comparison dependencies/tests and the gate. Comparison JSON, Markdown, reference annotation, normalized images, semantic-mask panel, silhouette overlap and difference images upload even when the comparison fails. The Summary includes per-person/components, face diagnostics and report link; one-day retention applies.
