# Car slice verification

Delivered code revision:0cea56b16a3235f7ac225b867201056c83695b2c; generator commit940ebb946e76b2de75f687f178d9200bf504eabb. Branch feat/aipocalypse-film; draft PR19. No merge.

Independent plan review car_plan_review PASS; independent implementation review car_code_review PASS. Confirmed actual imported axleZ, correct rolling sign, four pivots, upright body, no external GLB URIs. No blocking findings.

Local: Blender4.3.2 generation218420B; Godot4.6.3 import and integration test passed. Imported model bounds, ground origin, triangle budget, wheel axes, movement/pause/restart verified. npm test70/70; license/provenance gate and workflowpolicy passed; Bashsyntax and gitdiffcheck passed. CPU Cycles model preview visually inspected: coherent redbody/cabin/wheels/headlights. Preview is not Android renderer proof. Godot headless occasionally emits ObjectDB shutdown warning, no assertion/runtime failures.

CI https://github.com/kpok/cartoon_ai/actions/runs/42977501748 on exact0cea56b:
- Repository audit passed.
- SHA256-pinned Blender4.2.0 generation, Godot import/tests/smoke and release APK export passed.
- APK ARM64, stable ID/version checks, offline permissions and signing verification passed.
- Signed APK+SHA256 published, retention1day; artifact13836056811, size26546611bytes, expires2026-11-12T07:11:03Z.

First technical APK user reported working on Android. New carAPK install/update, actual lighting/readability and phone performance remain device acceptance; cannot infer these from build or Blender preview. Install as update using same certificate/application ID. Next planned content slice: road, physical board and camera movement only after car acceptance.
