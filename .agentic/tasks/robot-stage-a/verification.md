# Verification

Baseline cc8879fc1a1adc030f3f47097b38b9503e6031b3; Stage A working tree.
- Official Blender4.2.0 Linux archive SHA256 verified: 4f4fd7646af01f6fee9d420408318381a6e52571268eb7cf9cd5033bd9e7a359.
- Actual generation/render: selected manifest records final timings (33.265s while other tests active), 46,320 triangles, GLB 1,122,872 bytes. First isolated run ~10.9s; not a guarantee for Actions.
- PNG/GLB/BLEND actual output validation PASS; selected publication validation PASS.
- Python adversarial validator tests 2/2 PASS.
- Node unit tests 34/34 PASS before final CI split; repeated final checks logged locally and enforced CI.
- Workflow security policy PASS with 7 owner-only jobs; strict build inventory PASS 26 files.
- Independent code review PASS.
- Full local Playwright controlled suite in progress at publication preparation; result and hosted CI/live checks will be recorded in follow-up documentation. Earlier overloaded runs interrupted, not counted as passes.
- Real Android visual acceptance remains owner task. Emulator is not a physical-device test.
- No dance or MP4 implemented. No cloud resources or social account access used.

Publication gate was explicitly changed by user: fast validation/build then deploy, full browser/export regression runs in parallel. If regression fails, repair and redeploy rather than claim completion.
