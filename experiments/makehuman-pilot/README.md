# MakeHuman anatomical pilot

This independent CPU experiment uses MPFB 2.0.18 to create a rigged male anatomical mesh with skin, eyes, eyebrows, eyelashes, short hair, shirt/trousers and shoes. It replaces neither the salsa scene nor its reference image. It establishes a more detailed starting mesh; it does not claim person identity, reference pose or an improved couple-comparison percentage.

The owner-only `MakeHuman anatomical pilot` GitHub workflow runs on pushes to main and the authorized experiment branch, or manual dispatch. It downloads SHA-256-pinned inputs, runs the public audit, generates eight 640×800 Cycles CPU PNGs, exports a textured GLB and editable Blender scene, validates deliverables and uploads a one-day artifact. Summary reports actual elapsed generation time. A GPU and paid service are not required. Character fitting and rendering can run unattended; artistic quality and likeness still require reviewing the views.

## Reproduce

Requires Python 3.12 and Linux x64. Downloads approximately 650 MB; allow several GB disk space.

```bash
python3 experiments/makehuman-pilot/prepare.py /tmp/makehuman-inputs
/tmp/makehuman-inputs/blender/blender-4.2.0-linux-x64/blender --background --factory-startup --offline-mode --threads 4 --python-exit-code 1 --python experiments/makehuman-pilot/generate.py -- --addon /tmp/makehuman-inputs/mpfb/mpfb2-d0a32e57a7f915cb2f2b95410e2117648c7bbb7e/src --assets /tmp/makehuman-inputs/systemAssets --output /tmp/makehuman-output
python3 experiments/makehuman-pilot/validate.py /tmp/makehuman-output
```

## Licenses and provenance

Blender and MPFB code: GPL-3.0-or-later. Upstream code is downloaded for execution, not copied into this repository or output artifacts. MPFB core mesh and selected official MakeHuman system assets: CC0-1.0. The input lock records immutable release commit, exact download hashes and official asset source. Selected asset filenames appear in the output manifest. See <https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html> and <https://github.com/makehumancommunity/mpfb2>. Generated images and anatomical assets derive from the CC0 inputs; generator script is GPL-3.0-or-later.

Next experiments should fit the camera and pose before assessing likeness, then test a second character and clothing appropriate to the source. Keep anatomy views and reference-comparison measurements separate.
