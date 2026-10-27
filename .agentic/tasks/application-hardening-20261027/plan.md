# Application hardening

Baseline remote: 2ff1afaa7d03a7c4a59b1e15c9cb600fff0649b7, inspected 2026-10-27.
References: daily_logic PR 1 (Android release artifact validation, not directly portable)
and sprint1-20261026/reviews.md (integrity, async boundaries, immutable dependencies).
Existing owner-only gates, least privilege, action pins and isolated concurrency retained.
No Android work, new credentials, administrative changes or third-party runtime services.

AC-001: reject inherited story keys in CLI and export URL; preserve safe player fallbacks.
AC-002: shared GET/HEAD static server restricts files, confines resolved paths, loopback default.
AC-003: browser Content Security Policy blocks external/inline scripts and connections;
verify actual built files and exercise dist in browser tests before Pages artifact upload.
AC-004: validate actual MP4 finite duration, stream cardinality/codecs/geometry/fps/frames/audio;
prevent overwriting any output bundle member, including concurrent publication.
AC-005: targeted regression tests, full existing Node/browser/export checks, independent review.

Capabilities: local checkout and GitHub connector source reads/writes available. GitHub admin
not available and not requested. Commit/push main and existing automatic Pages allowed by session.
No new material architecture choice: retain vanilla JS/Three.js/Playwright/FFmpeg and hosted CI.
Independent plan reviewer: hardening_plan_review; code review will use a fresh subagent.
