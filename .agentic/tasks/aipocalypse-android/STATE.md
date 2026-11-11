# AIpokalypse Android — stage 0

Scope: approved first technical APK only. Existing screenplay and logo unchanged. No merge authorized. Branch feat/aipocalypse-film; draft PR19.

Plan: isolate Godot4.6.3 Compatibility project; code-generated mesh and8second deterministic playback; CPU CI imports/tests/exports ARM64; externally sign with stable repository secrets; publish signed APK only, retention1day.

Plan review: independent policy agent confirmed feasibility and requirement for stable signing, preserving existing workflow owner gates. Implementation reviews completed below.

App commit:1745d665091040ade592588ff5d54adb7cc73bf7. Local Godot4.6.3 import, playback_test.gd and headless main scene startup passed. Test covers idle/pause/negative delta/end/replay/restart. Visual/audio/realdevice acceptance not yet tested.

Signing administration is not exposed by the GitHub connector; local gh is unauthenticated. Never commit or publish keystore material. Missing secrets must fail signing closed. APK delivery and update acceptance remain pending until signed CI and device test.

Independent implementation review: app_review found license accessibility issue; fixed by official Godot license-page button and bundled license text. Added scene integration test covering actual controls/background notification and sound data. ci_review found no confirmed implementation blockers; actual export/signing and phone acceptance remain required.

Verification: npm test70/70; workflow guards5/5; license/provenance gate passed; Godot scene integration passed (headless ObjectDB shutdown warning remains; no assertion/runtime failure). CI scripts bash-n and Python validator fixture checks passed per CI implementer. No claim of rendered-device or signed-APK success.

## Verified CI checkpoint

Revision fa8fb9cd793d2e1a76a9245e51c12e89e64d68a5, Actions run https://github.com/kpok/cartoon_ai/actions/runs/42974932390, job130371694023:
- Public audit passed, including configured private-term filter.
- Pinned Godot and Android tools installed successfully.
- Import, playback test, scene integration test, main-scene smoke passed.
- Release unsigned APK export succeeded. Structure/ARM64 runtime, application identity, versionCode and no Internet permission checks passed.
- Sign Android APK failed because all3 signing secrets are empty. Upload skipped; no installable APK was published.

Earlier CI failures repaired: JPEG entropy bytes misclassified as email (metadata parser+adversarial tests), invalid SDK overrides for non-Gradle export (template defaults), required Android ETC2/ASTC import flag. Independent bounded reviews found no blockers in these fixes. Full local privacy scan passed133commits/643historicalblobs; privacy unit suite13passed/4Gitleaksconditional skipped; CI audit includes installed Gitleaks.

Current blocker: configure stable signing secrets described in experiments/aipocalypse-android/README.md, then rerun workflow. Signed verification, artifact upload, phone install/update/visual/audio/performance remain unverified. This is an implemented and export-verified prototype, not complete stage0 acceptance or finished film. No merge performed.
