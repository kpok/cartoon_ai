# Verification

Baseline cc8879fc1a1adc030f3f47097b38b9503e6031b3; Stage A working tree.
- Official Blender4.2.0 Linux archive SHA256 verified: 4f4fd7646af01f6fee9d420408318381a6e52571268eb7cf9cd5033bd9e7a359.
- Actual generation/render: selected manifest records final timings (33.265s while other tests active), 46,320 triangles, GLB 1,121,044 bytes. First isolated run ~10.9s; not a guarantee for Actions.
- PNG/GLB/BLEND actual output validation PASS; selected publication validation PASS.
- Python adversarial validator tests 2/2 PASS.
- Node unit tests 34/34 PASS including clean local vendor preparation and hosted CI.
- Workflow security policy PASS with 7 owner-only jobs; strict build inventory PASS 26 files.
- Independent code review PASS.
- Earlier local full run: 32 pass, two robot test failures (selector ambiguity and screenshot timing); corrected. Final narrow robot run: 4/4 PASS desktop/mobile with rotation image change and failure fallback. Interrupted overlapping overloaded runs not counted.
- Initial hosted run 40765142487 failed because npm test ran before viewer vendor files were generated. Fixed via deterministic pretest vendor step, verified with vendor absent locally.
- Final hosted run [40765251234](https://github.com/kpok/cartoon_ai/actions/runs/40765251234), commit 89ae4d1b81f38dfe203369f582957739c5d61651: fast checks PASS, browser/export regression PASS, Pages deployment PASS.
- Live https://kpok.github.io/cartoon_ai/robot.html checked with Playwright desktop and Pixel7 emulation: model ready, rotate/zoom/reset controls and both story navigation entries PASS, zero page errors. Screenshot visually inspected. Browser proxy required local test trust handling, not any deployed-site CSP/TLS change.
- Follow-up independent CI-fix review PASS. Manual generator workflow delivered but not dispatched; equivalent pinned Blender command ran locally.
- Real Android visual acceptance remains owner task. Emulator is not a physical-device test.
- No dance or MP4 implemented. No cloud resources or social account access used.

Publication gate was explicitly changed by user: fast validation/build then deploy, full browser/export regression runs in parallel. If regression fails, repair and redeploy rather than claim completion.
