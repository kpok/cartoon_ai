# Emerald & Navy — static reconstruction study

**Status: functioning stylized prototype; reference reconstruction is not complete.**

The source reference is synthetic. Every visible model surface is geometry, not a photograph billboard. No animation or generated video is used. Back surfaces are inferred.

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
- No experiment-specific CI job has been added. Existing main-only workflow restrictions and deployment remain unchanged. Keep PR draft until visual reconstruction and full diagnostics are reviewed.
