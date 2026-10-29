# Verification evidence

Baseline6199a1:39 reachable commits, all authors nickname+noreply; exact GitHub
service committer is the only additional identity. No history rewrite needed.
Full checkout advertised main and two robot branches; no tags were advertised.
Local additional checkpoint commits increase subsequent scan counts.

Checks on the final implementation working tree:
- `npm test`:42 passed.
- Python audit tests with verified Gitleaks:25 passed. Cases include deleted
  historical content, other branch, annotated tag, shallow clone, unknown identity,
  encoded private terms/emails, GLB/PNG metadata, redacted failure messages,
  merge-only secret, ignorefile bypass, unknown license, modified/new asset and
  missing distributed notice.
- `bash scripts/run-public-audit.sh`:passed end-to-end locally with private terms
  supplied only through environment; exact terms/results are not recorded here.
- Gitleaks8.30.1 archive verified against pinned SHA-256; history uses `-m` so
  merge-only additions are included. No finding baseline or allow suppression.
- Six lockfile dependencies, four binary assets, exact Three.js MIT notice passed.
- npm advisory lookup:0 vulnerabilities at verification time; high/critical or
  registry errors fail the automated gate.
- Build:28 bounded public files; CSP, local dependencies and notices passed.
- Robot reproduction byte-identical; published validator and rhythm checks passed.
- Both PNGs retained identical IHDR/IDAT/palette/transparency payloads; only ancillary
  metadata was removed. GLB and scene/choreography code were not changed.
- Independent implementation re-review PASS; exact scope in reviews.md.
- Remote checkpoint7d738a2:Public repository audit run40928558376 succeeded.

Administrative read: repository rulesets endpoint returned an empty list. Legacy
branch protection was inaccessible to the integration (403); no claim that branch
protection is absent. No administrative settings were changed. Required checks and
optional PRIVATE_TERMS secret must be configured by the owner.

A fresh local browser run passed all42 tests (1.6m) at original rendering quality.
CI functional software-WebGL workers are serialized after an initial remote run
had3 screenshot/navigation timeouts. The assertions and30s timeouts are unchanged.
No new full-length MP4 was generated for this audit. Original reference recording, private audit attachment,
private-term inputs and raw scanner findings are excluded from commits.

## Remote delivery

Implementation1642226ea028a92da4b1c741773f7ff716d136a2 fast-forwarded to main.
Main audit40930005702 succeeded. Film checks/Pages run40930005796: test and deploy
succeeded. Live served robot manifest equals the audited source. Branch audit
40929884412 succeeded before merge. Remaining owner actions are administrative
required-check enforcement and optional PRIVATE_TERMS; no history rewrite performed.

Supplemental coverage: raw reachable commit/tag messages and historical filenames
are piped privately to a third Gitleaks stdin scan; nested annotated tag metadata
is also inspected. Commit-message-only secret and nested-tag regressions passed.

## Final verified delivery

Implementation41bb650a98f6734ed6012f7fa132bd9ea985e459 is on main.
Public audit40932480394 succeeded. Film checks/Pages40932480640 completed with
all three jobs successful: test, Browser and export regression, and Pages deploy.
The CI resource change preserved assertions/timeouts and original rendering quality.
Source-scoped independent reviews and25 adversarial audit tests passed.

The initial browser failure is retained as evidence, not treated as a clean run.
The final corrected run above supersedes it. The optional private-term filter is
not configured on GitHub yet; known private terms were checked locally without
recording them in source, hashes or public reports. Owner instructions remain in
docs/PUBLIC_AUDIT.md. No administrative permissions or legal clearance are claimed.

Delivery state: HANDOFF / complete. This final verification supersedes the
pre-CI ready-for-review state.json checkpoint. Owner administration remains a
separate manual action, with instructions in docs/PUBLIC_AUDIT.md.
