# Verification evidence

Baseline6199a1:39 reachable commits, all authors nickname+noreply; exact GitHub
service committer is the only additional identity. No history rewrite needed.
Full checkout advertised main and two robot branches; no tags were advertised.
Local additional checkpoint commits increase subsequent scan counts.

Checks on the final implementation working tree:
- `npm test`:42 passed.
- Python audit tests with verified Gitleaks:18 passed. Cases include deleted
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

No fresh local browser/MP4 render was run: this change alters audit/docs/notices and
PNG metadata, not rendering logic. Existing main CI will run the browser/export
regression after merge. Original reference recording, private audit attachment,
private-term inputs and raw scanner findings are excluded from commits.
