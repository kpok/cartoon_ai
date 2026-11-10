# Robot Macarena

Baseline: 87ec683 (asset branch), main a5cfecd. PR #18 created as draft before implementation.

## Acceptance
- AC1: Separate home tile opens Macarena while original dance and Kalinka remain accessible.
- AC2: Reuse long-legged slime costume, bare original head and both committed fiesta references.
- AC3: Deterministic sixteen-beat gesture phrase, hip sways and quarter-turn hops, four phrases / 32 seconds.
- AC4: Pause, seek, restart, automatic/manual camera, reduced motion and export-frame hook work on desktop and mobile.
- AC5: Owner-only branch CI passes before authorized main merge; Pages deploy waits for build and browser/export regression.

## Plan and evidence
Reuse existing GLB and Kalinka costume with an explicit bare-head option; a separate Macarena controller owns choreography. Parameterize backdrop of existing spatial stage. Preserve static server and build allowlists and register media provenance. No audio recording is bundled.

Independent plan review identified missing branch CI and premature deployment before regression; both corrected. Independent implementation review identified anatomical hand ordering and phrase-boundary discontinuity; fixes in progress. Local tests: 70 passed, build and workflow policy passed, desktop/mobile Macarena browser tests passed before gesture review fixes. Existing GLB validation, generation reproduction and sync checks passed. First remote CI found unregistered new media; provenance inventory corrected and license-gate tests passed.

Authority: user explicitly authorized branch commits, draft PR, main merge after successful CI, and Pages deployment. Git CLI push is unavailable; commits are transferred with GitHub Git database API and compare-and-swap branch updates. Remote commit IDs differ from local IDs but file contents match.
