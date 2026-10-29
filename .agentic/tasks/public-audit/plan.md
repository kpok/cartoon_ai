# Public repository audit remediation

Baseline: `6199a1df62c9fc7bb22e0d812536bce2a9401668`.

Acceptance criteria:
- AC1: inspect every advertised branch/tag, reachable commit identity/message/path/blob, and current tracked files; keep findings and scan inputs out of public logs.
- AC2: fail on Gitleaks findings or scanner errors; pin and verify the scanner download. No uploaded raw scan reports.
- AC3: fail on unexpected authors/emails, unreviewed binary assets, dependency inventory/license changes, missing notices, or high/critical dependency advisories.
- AC4: scan documentation-only pushes too; block Pages and manual render publication on audit failure; preserve owner-only minimal-token workflow guards.
- AC5: preserve existing GPL/CC grants; document unlicensed remainder conservatively; preserve upstream notices. Do not claim legal clearance for reference choreography/audio.
- AC6: strip unnecessary preview metadata without changing pixels; keep the three viewers and animation intact.

Decisions: no history rewrite unless a verified personal-data finding requires one. Do not publish private-name denylist hashes (dictionary-recovery risk); optional PRIVATE_TERMS GitHub secret supplies project-specific text checks. Generic identity/email checks do not need secrets. CI cannot prevent an initial public push, inspect forks/unreachable objects, or establish copyright ownership.

Verification: adversarial temporary git repositories, unit/build/rig/sync checks, independent plan/code review, remote CI. No private names, original audit attachment, raw reference media or scanner findings are committed.
