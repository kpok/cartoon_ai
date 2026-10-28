# Short-legged humanoid draft

Base: e4885a4ea7d3099fd2fde6c04e28292a779363eb, inspected 2026-10-28.
User: preserve oversized head and existing short arms; add similarly short legs.
Authority: draft branch only; do not change main, published/robot or deploy Pages.
No separate dance existed remotely at inspection; only main branch was present.

Changes: optional bust/humanoid generator variant (default humanoid on draft branch),
small waist/pelvis, left/right hips, thighs, knees, shins, ankles and rounded feet.
Existing 112 bust mesh positions/dimensions/topology preserved by executable check.
Leg/arm length ratio 0.73, 133 meshes / 56784 triangles, within current mobile budget.
Full-body camera includes feet. No armature or animation added in this shape refinement.

Validation: official Blender4.2.0 Linux archive SHA256 matched existing trusted workflow pin.
Python compile passed. check_humanoid.py passed in real Blender. Generator rendered CPU
32 samples, 768x768; generation1.85s, render7.84s, total9.68s on local tool host.
Existing validate-robot.py --require-blend passed generated GLB1,352,524bytes and
PNG798,668bytes, plus BLEND. Visual inspection confirmed full visible short-legged body.
Source generated before commit: report source_commit unknown; actual generator SHA256
997b5f10cd61ebfab5163f2c0c29fd284e1ba7f61e67c0fbcc0bf37d9eaaa72d.
One selected PNG stored with branch for review; GLB/BLEND remain local outputs.
No CI render, merge, website publication or admin setting change performed.
