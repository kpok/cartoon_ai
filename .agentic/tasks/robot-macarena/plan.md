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

## Review and verification update

Implementation fixes passed fresh independent review at local be5379d (remote cee41655). Actual GLB tests verify all held wrist targets, right-hand-first sequencing, continuous phrase boundaries, grounded boots and full vertex projection inside portrait/landscape cameras. Full unit suite: 70/70 passed. Macarena browser tests: desktop/mobile passed after fixes. Existing Kalinka focused regression passed.

Remote run42903062497: public audit/build/unit checks passed, browser regression103/106 passed. Failures were an outdated seven-tile gallery inventory (new requirement is eight) on both devices and one30-second software-rendering timeout. Gallery expectations now include explicit Macarena visibility; the affected camera test retains all assertions with a bounded60-second timeout. A local follow-up exposed an existing page-readiness race in the gallery test; language is now asserted after the destination player reports readiness. No behavior assertion was removed.

Private preview deployed successfully at https://cartoon-ai-macarena-preview.dancingpark8.chatgpt.site/robot.html?dance=macarena using the corrected implementation. Final exact-head CI and authorized main merge/Pages deployment remain pending.

## User visual correction

User review of private preview rejected stretched arm slime, bent forward arms, Kalinka boots and missing hip/knee dance. Reopened IMPLEMENT; no merge authorized until corrected implementation passes checks. Updated AC2: match fiesta concept with teal flamingo/lightning shirt, coral shorts, waist pouch, yellow sunglasses and light neon sneakers. Updated AC3: visible pelvic sway and gentle alternating knee flex/footwork, anatomically straight forward arms, compact surface-following slime rather than stretched blades. Motion and costume work are isolated by file ownership; visual checks must compare actual rendered poses against the concept.
