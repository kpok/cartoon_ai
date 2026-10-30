# Emerald & Navy — static reconstruction study

**Status: functioning stylized prototype; reference reconstruction is not complete.**

The source reference is synthetic. The viewer now displays its fixed cropped derivative, with both complete figures and smaller background margins; the full original is preserved. Every visible model surface is geometry, not a photograph billboard. No animation or generated video is used. Back surfaces are inferred.

## Run locally

From the repository root:

```sh
npm ci
node experiments/salsa-human-models/prepare.mjs
node experiments/salsa-human-models/serve.mjs
```

Open http://127.0.0.1:3001/ — redirects to the isolated experiment. Drag to orbit, use reference/side/rear camera buttons, or download the static GLB. No production build or Pages changes are required. Exporter code is derived locally from the locked MIT Three.js package; upstream notice remains in vendor/THREE-LICENSE.txt.

## Verify

```sh
npx playwright install chromium
node experiments/salsa-human-models/validate.mjs
python3 experiments/salsa-human-models/diagnostics.py
npm test
npm run build
node scripts/audit-licenses.mjs
```

Diagnostics require Pillow. Browser validation owns port 3001 temporarily, captures three views and the side-by-side page, exports GLB and checks mobile overflow. `output/` is generated locally. `regression.json` stores coarse 16×24 RGB samples: mean absolute RGB error must stay below 3/255 per view. Update intentionally with `diagnostics.py --update` after visual review. This only detects large render changes on a comparable Chromium/SwiftShader environment, not subtle mesh defects or similarity to the concept. Baseline creation and comparison in one environment do not establish cross-platform stability.

## Visual checkpoint

| Front | Side | Rear |
|---|---|---|
| ![Front](review/front.png) | ![Side](review/side.png) | ![Rear](review/rear.png) |

Original generated renders: CC BY 4.0, Salsa procedural reconstruction by kpok. The concept image retains its separate provenance and rights statement.

## Known limitations / next work

- Faces, hair, hands and shoes are simplified; clothing joins and anatomy remain visibly primitive. No claim of photorealism or identity matching.
- Pose and spacing differ substantially from the concept. Three manually selected image landmarks expose offsets in `review/landmarks.json`; they are diagnostics, not acceptance thresholds.
- Palette occupancy is a coarse lit-pixel heuristic, not a calibrated source/render color difference. Silhouette comparison to the source is still missing.
- GLB includes the model only; lighting and floor belong to the viewer.
- Snapshot CI is implemented as described below. Source similarity CI is implemented in stage 2 below. Existing production workflows and deployment retain their main-only restrictions. Keep PR draft until visual reconstruction and full diagnostics are reviewed.

## GitHub Actions snapshot — stage 1

`Salsa fixed-camera snapshot` runs on owner pushes to this experiment branch and main. It runs the existing repository audit, starts the isolated scene with a fixed 34° camera, captures a **1024×1536 PNG**, and uploads `salsa-fixed-camera-snapshot` for **1 day**. Open the run Summary → Download PNG and camera settings, or download it in the Artifacts section. The ZIP contains `render.png` and `capture.json`.

The upload uses `always()` after a successful audit and capture, so a later validation failure cannot suppress an existing screenshot. A failed audit or failed capture does not publish an artifact. There is no deployment. Stage 2 below adds the source/render/difference panel and the 80% gate, after this snapshot has already been published.

Local snapshot command, after `prepare.mjs` and Playwright installation:

```sh
node experiments/salsa-human-models/capture.mjs
```

The camera is centralized in `camera.js`. It is an approximate reference viewpoint inferred from one image; the original image has no recoverable camera calibration. Snapshot mode changes only page layout, not model geometry or the camera preset.

## Reference similarity — stage 2

After the snapshot artifact is uploaded, the same workflow installs pinned Pillow into an isolated venv, runs the metric tests and compares the actual canvas screenshot with `reference/concept.png`. It fails when the **unrounded score is below 80%**. Comparison is not allowed to fail silently (`continue-on-error` is prohibited).

**Algorithm v1:** compute `100 × (0.7 × RGB block SSIM + 0.3 × tolerant edge F1)` for the full frame, its left half and its right half. The **final score is the minimum** of these three scores; every region must reach 80%. Halves are fixed spatial checks, not detected person masks.

- Region crops are taken after the common resize, preserving pixel shape. This conservative minimum reduces background or one-sided dominance; it still does not guarantee semantic completeness of a person.
- Both input PNGs must be exactly 1024×1536. Version 2 applies the fixed paired subject crop documented below, then resizes both crops to208×336 with Lanczos, without independent registration, auto-cropping or deformation. Legacy v1 full-image analysis256×384 remains a separate diagnostic.
- SSIM is averaged over RGB channels and non-overlapping 8×8 blocks; population variance/covariance, standard 8-bit constants C1=6.5025, C2=58.5225; aggregate clamped to [0,1]. This explicit block implementation differs from Gaussian sliding-window SSIM in some libraries.
- Edge F1 uses grayscale FIND_EDGES, threshold 40/255 and a 1-pixel matching tolerance at analysis resolution. The spurious filter border is excluded. Empty edge sets earn 0. Near-flat inputs fail with an error.
- This is a full-frame technical similarity score, **not percent likeness, identity or perceptual realism**. Background, lighting and framing contribute. The approximate camera is shared with the viewer; the source image does not provide a calibrated camera.
- Threshold and weights are fixed, not tuned to make this prototype pass. The initial full-frame-only diagnostic scored **32.42%**. Independent review reproduced a synthetic missing-subject case that still exceeded 80% globally; fixed left/right checks were added so that this regression now fails. The final minimum-region score is reported in each run. Golden-render regression remains a separate test.

The Actions Summary includes the score, components, threshold and link to `salsa-reference-comparison`. That 1-day artifact contains `reference-comparison.png` (reference / rendered scene / absolute RGB difference), `difference.png`, `metrics.json` (raw score, verdict, SHA-256 hashes and camera capture metadata), and `summary.md`. Reports are written **before** returning failure. The separate `salsa-fixed-camera-snapshot` artifact has already been published, so metric dependency/test/gate failures do not remove the PNG. GitHub Summary links to artifact images; it does not embed local artifact paths as inline images.

Local commands, after generating `output/render.png`:

```sh
python3 -m venv /tmp/salsa-image-comparison
/tmp/salsa-image-comparison/bin/python -m pip install --only-binary=:all: -r experiments/salsa-human-models/requirements.txt
/tmp/salsa-image-comparison/bin/python -m unittest discover -s tests -p test_salsa_comparison.py
/tmp/salsa-image-comparison/bin/python experiments/salsa-human-models/compare.py
```

A below-threshold result intentionally returns exit code 1. Blank, malformed, absent or wrong-size inputs also fail; they write error JSON and Summary when the output directory is writable. If capture or audit itself fails, there is no valid new snapshot to publish.

## Detailed geometry checkpoint

The second model iteration adds continuous curved limbs and trouser profiles, fitted cloth surfaces with fine folds, shaped faces and facial features, curved wavy/curl hair strands, dress ruffles and straps, shirt collars/buttons/placket, bent fingers with nails, and detailed shoes/sandals. These are mesh surfaces, not image textures. Frenet frames prevent ring twisting; bend-radius limits prevent inside-out elbow surfaces. Every interior sweep ring is checked for outward normals, and every transformed vertex is checked against the frozen capture camera.

Geometry positions are inferred from manually measured reference image coordinates at selected depths. Those coordinates are unprojected through the **unchanged** camera. The separate manual landmark report now largely reports construction targets; it must not be presented as independent accuracy validation. The actual source/render pixel comparison remains independent of those target constants.

The revised model occupies about2.18 world units vertically versus the original prototype's roughly1.85, matching more of the source frame. The old arbitrary `<2` geometry bound was replaced by `<2.3` plus a stricter actual-vertex no-clipping test; camera parameters were not changed. Lighting, reference image, metric weights, regions and threshold are unchanged.

Known limitations: stylized facial anatomy and hair, imperfect clothing joins and silhouette, inferred depth/back surfaces, and plain studio background. This iteration is not a finished realistic reconstruction. The three-view golden-render baseline and review PNGs were intentionally refreshed after visual inspection; the reference-comparison test itself is unchanged.

## Fixed subject framing — comparison v2

[View the cropped reference](reference/concept-cropped.png). The original `reference/concept.png` remains byte-for-byte unchanged. The derivative is an exact pixel crop832×1344, with **no generative editing or rescaling**, preserving both full figures including hair, fingertips, skirt and footwear.

`reference/framing.json` freezes the crop `[80,24,912,1368]` in original1024×1536 pixels, with right/bottom exclusive. The exact same crop is applied to the full fixed-camera render. Analysis208×336 preserves this aspect ratio; half-frame regions104×336 still contain complete8×8 SSIM windows. The source crop was chosen visually before new model edits, not optimized against a score. Every actual model vertex must project inside this crop, so later geometry cannot silently lose shoes/hair at the edges.

This changes the scoring frame. **Do not compare v1 scores with v2 as evidence of geometry improvement.** The previous geometry5824bee scored **33.4162% under v2**, recorded before editing in `reference/crop-baseline.json`, alongside render hash, camera and scene revision. The report includes the new v2 score, delta versus that baseline, and a separate legacy v1 diagnostic. The weights70/30, three-region minimum and threshold80% remain fixed.

The comparison artifact now also includes full-resolution `reference-cropped.png` and `render-cropped.png`, in addition to the triptych, difference map, raw hashes/camera metadata and summary. The unchanged full render is still in the separate snapshot artifact. The triptych is1248×720 including its header.

This geometry iteration improves cascading dress layers, neckline/slit closure, wavy hair volume and tousled curls, shirt proportions and button/placket alignment, trouser material color, waist/pocket/seam details and knee folds. These remain stylized modeled surfaces; no reference pixels are used on the models and the plain background/lighting are unchanged.

Latest local results for this iteration: **v2 paired crop33.4162% →34.5677%** (+1.1515 percentage points), and the separate **v1 full-image37.5126% →38.4419%**. Both comparisons use their own consistent frame before/after. Neither meets80%, and neither is a percent-likeness claim. New materials were calibrated against fixed clothing patches in the reference, not by changing scene lighting or using reference textures.
