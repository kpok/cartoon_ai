# AIpokalypse Android — stage 0

Scope: approved first technical APK only. Existing screenplay and logo unchanged. No merge authorized. Branch feat/aipocalypse-film; draft PR19.

Plan: isolate Godot4.6.3 Compatibility project; code-generated mesh and8second deterministic playback; CPU CI imports/tests/exports ARM64; externally sign with stable repository secrets; publish signed APK only, retention1day.

Plan review: independent policy agent confirmed feasibility and requirement for stable signing, preserving existing workflow owner gates. Implementation review pending.

App commit:1745d665091040ade592588ff5d54adb7cc73bf7. Local Godot4.6.3 import, playback_test.gd and headless main scene startup passed. Test covers idle/pause/negative delta/end/replay/restart. Visual/audio/realdevice acceptance not yet tested.

Signing administration is not exposed by the GitHub connector; local gh is unauthenticated. Never commit or publish keystore material. Missing secrets must fail signing closed. APK delivery and update acceptance remain pending until signed CI and device test.

Independent implementation review: app_review found license accessibility issue; fixed by official Godot license-page button and bundled license text. Added scene integration test covering actual controls/background notification and sound data. ci_review found no confirmed implementation blockers; actual export/signing and phone acceptance remain required.

Verification: npm test70/70; workflow guards5/5; license/provenance gate passed; Godot scene integration passed (headless ObjectDB shutdown warning remains; no assertion/runtime failure). CI scripts bash-n and Python validator fixture checks passed per CI implementer. No claim of rendered-device or signed-APK success.
