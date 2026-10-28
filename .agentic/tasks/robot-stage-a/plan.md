# Robot Stage A — implementation

Baseline cc8879fc1a1adc030f3f47097b38b9503e6031b3. User authorized generation, main commit and Pages deployment; stop before dance/MP4.

AC-001: procedural bpy head/shoulders, no AI calls or secrets; PNG GLB BLEND and timings.
AC-002: selected <=10MiB, <=100k triangle self-contained texture-free GLB persisted in published/robot; all builds preserve it.
AC-003: third link on existing Pages, touch orbit/zoom/reset with loading/error fallback. Existing stories unchanged.
AC-004: owner-only manual generation read-only artifacts; promotion by reviewed commit; existing CI builds/tests and deployment permissions stay separate.
AC-005: automated security/unit/browser/model validation and independent plan/code review. Real Android aesthetics remain owner acceptance.

Plan review identified persistence, strict inventory/policy integration, GLB content validation and per-page CSP. All incorporated. Selected robot.glb, preview.png and manifest.json tracked; BLEND/trial renders only artifacts or local ignored output. First generation runs locally with checksum-verified Blender4.2.0; subsequent manual workflow reproduces. Normal tested Pages deployment publishes selected assets without Blender running on every push.
