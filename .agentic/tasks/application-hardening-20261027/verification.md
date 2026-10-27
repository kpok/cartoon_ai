# Verification

Baseline remote: 2ff1afaa7d03a7c4a59b1e15c9cb600fff0649b7.
Date: 2026-10-27. Scope: files in the application-hardening commit carrying this report.

- AC-001: prototype story names rejected by CLI and render surface; player safely falls back.
- AC-002: Node regression tests cover public GET/HEAD, write denial, forbidden repository
  files, malformed paths and resolved symlink escape. Preview defaults to localhost.
- AC-003: npm run build passed, 16 intended files, local dependency inventory, policy and
  locked Three.js verified. Mutation tests reject unexpected files, symlinks and missing/
  external imports. CI=true npm run test:e2e: 30/30 passed on dist, desktop+mobile,
  including CSP inline-script denial and no external page resources for both cartoons.
- AC-004: malformed probe mutations rejected; existing sidecar retained, partial own links
  rolled back and two competing publishers produce exactly one consistent bundle.
  npm run test:export passed: two actual 3-second portrait movies (meadow PL/garden EN),
  H264/AAC, exact dimensions/frame count/timing, non-silent sound and SRT, other locale
  audio generation and recordings failure paths. FFmpeg system executable; eSpeak NG
  from Ubuntu apt packages extracted in /tmp with environment overrides, no project change.
- AC-005: npm test 34/34; check:workflows 5 guarded jobs; git diff --check passed;
  independent plan and implementation reviews found no open blockers.

Initial local browser attempt lacked executable and did not exercise app code. Installed
pinned Playwright Chromium and reran complete browser suite successfully. Initial system
apt install was unavailable; extracted packages provided local test runtime instead.

Remote CI/Pages: pending when this source commit was prepared; do not infer success here.
No admin changes, real TTS API secrets, Play publication or Android additions.
Limitations: static server assumes trusted local filesystem; CSP inline styles permitted;
Pages meta is not framing protection; browser speech service network behavior not proven;
three-file export isn't a single crash-atomic transaction (MP4 is completion marker).
