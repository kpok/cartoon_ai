# Last Strawberry — fifth film

Baseline: 0c3b2b6d79e91a6d189cc04501ab6260a234976e.
Authorized: local implementation, frequent remote checkpoints on feat/last-strawberry,
separate PR, tests, merge to main and existing GitHub Pages deployment.

Analysis: existing Three.js vendor, static server, explicit build inventory and owner-only
CI can host a separate procedural film without dependencies, downloaded assets or audio.
No AGENTS.md found in repository. Existing four gallery entries remain intact.

Acceptance:
- AC-001: fifth gallery tile opens a 160-second silent 3D cat-and-squirrel story.
- AC-002: strawberry rivalry, chase, wheelbarrow, soft leaves, cooperation, sharing, apple ending.
- AC-003: portrait-first responsive player; play/pause, restart, scrub, chapter markers, end state.
- AC-004: deterministic poses and camera after seeking; bounded clock; hidden tab suspension.
- AC-005: no audio, external requests or new dependencies; existing CSP and owner-only CI preserved.
- AC-006: build, workflow/security checks, targeted state/browser tests and existing regressions pass.
- AC-007: independent review, merged PR, successful Pages deployment and live smoke verification.

Plan: timeline + procedural stage -> player/gallery -> tests and visual QA -> independent review
and corrections -> CI -> merge -> verify deployment. Commit each useful slice before broader testing.
Original procedural geometry, no imported artwork or Tom and Jerry characters. No MP4 in this task.

Status: independent plan review PASS. First three remote checkpoints contain timeline, procedural stage, player and fifth tile. Build passes. Next: desktop/mobile visual inspection, meaningful timeline/browser tests, independent code review. No workflows changed.
