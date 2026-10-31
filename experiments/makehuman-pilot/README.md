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
