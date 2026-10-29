# Public repository audit

The owner-only **Public repository audit** workflow runs on every branch/tag push,
including Markdown/docs changes, and manual dispatch. Heavy film rendering stays
manual. CI/Pages, both MP4 exporters and model generation repeat the same audit
before uploading/publishing outputs. A failed audit stops those paths.

## Checks and local use

```sh
npm ci --ignore-scripts
npm run audit:public
python3 -m unittest discover -s tests -p 'test_audit*.py'
```

Linux x86_64, Node 22+, Python 3, Git and curl are required. The audit explicitly
fetches all advertised branch/tag refs and rejects shallow/incomplete history.
It scans commit identities/messages, every historical path and reachable blob,
as well as current tracked/new nonignored files. Gitleaks 8.30.1 is fetched from
the upstream release and verified with a pinned SHA-256. Its default rules scan
history and the working tree. Findings/errors fail without exposing matching
values, filenames, report artifacts or raw scanner logs.

Privacy policy accepts only the nickname+noreply identity and GitHub's exact
service identity. It rejects unapproved email addresses and unreviewed binary
metadata. Third-party copyright/licensing names are legitimate required notices;
this is not a promise that no person's name appears in upstream software.

### Optional private text filter

Generic name recognition is not reliable. To check specific private names, emails,
addresses or other strings without publishing them (or reversible dictionary
hashes), set **Settings → Secrets and variables → Actions → New repository secret**:
`PRIVATE_TERMS`. Value: one private phrase per line. Avoid very short/common words.
The checker matches case-insensitively and normalizes accents. The raw secret is
passed only to the audited step; it is never printed or uploaded. No API service
or subscription is used. Local equivalent: set the `PRIVATE_TERMS` environment
variable privately before running the audit; do not commit a `.env` file.
Without this optional secret, identity/email/metadata/secret/license checks still
run, but arbitrary personal names in prose cannot be reliably identified.

The license gate compares every locked package's exact version, integrity, source
and license against `.security/dependencies.json`, checks installed metadata and
verbatim distributed Three.js notice, and refuses unreviewed binary/media assets.
New assets or dependencies need explicit provenance/license review, not merely
an inventory edit to make CI green. `npm audit` fails on high/critical advisories
or registry errors; it is not a comprehensive security proof.

## Administrative enforcement

In repository rules/branch protection for `main`, require the **audit** check from
Public repository audit and the existing film **test** check. Disallow bypasses,
force pushes and deletion where possible. Protect `.github/`, `.security/`,
`scripts/`, lockfiles and licensing/provenance through CODEOWNERS review when
other collaborators join. Availability of rules depends on GitHub plan/settings.
See `ADMIN_SECURITY_PL.md` for Actions/Pages/fork/token settings. Files cannot
prove or change these administrative settings; confirm them yourself.

Set Git author identity to nickname + the existing GitHub noreply address before
committing. A local audit **before pushing** is the preventive step. For the text
filter, configure the secret before expecting automatic specific-name detection.

## Coverage limits

- A push is public **before** Actions starts. CI can fail and block deployment,
  but cannot retract an initial disclosure. If a real secret leaks, revoke/rotate
  it first; deleting the newest copy is insufficient.
- Full-ref coverage means currently advertised branches/tags and reachable
  history. It does not include deleted/unreachable commits, cached GitHub views,
  forks, third-party clones, PR-only refs, profile information or old artifacts.
- Existing public links/copies cannot be made anonymous retroactively. Nickname
  `kpok` and technical owner/repository IDs intentionally remain.
- Scans cannot establish music/choreography/AI-image copyright ownership or the
  license of content manually uploaded to Facebook. See `MEDIA_PROVENANCE.md`.
- A human can change checks or inventory. Required checks/review rules are the
  administrative enforcement layer. Do not disable failed scanners to publish.
- Old artifacts/logs are not automatically scrubbed. Review/delete them in Actions
  if necessary; removing a local finding does not establish their contents.

The audit note supplied privately is not copied into this repository.
