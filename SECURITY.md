# Workflow security

This is a public repository. The policy is **owner-only execution in kpok/cartoon_ai**, not a promise that public source cannot be copied or executed elsewhere.

## Implemented in source

- CI has only `push` to `main` and manual dispatch triggers. Pull requests, fork PRs, comments, schedules, reusable-workflow calls and `pull_request_target` do not trigger it.
- Every job has a pre-runner condition: canonical repository name and immutable ID1433681495, owner ID10676481, initial actor ID10676481/loginkpok, current triggering actor kpok, `refs/heads/main`, and explicit permitted event types. A fork with the same files has a different repository identity and fails the guard. A collaborator's dispatch/rerun fails the actor guard.
- MP4 export is manual-only, owner-only, on `main`. Build and export jobs have only `contents:read`; checkout selects the triggering commit and does not persist Git credentials.
- Default workflow permissions are empty. Only the separate deployment job receives `pages:write` and `id-token:write`; it does not check out or run project code. Deployment requires successful tests, `ENABLE_GITHUB_PAGES=true`, and the same owner/repository/ref/event guard.
- The obsolete history-rewriting workflow was removed. No remaining job has `contents:write` or force-push capability. Removing its file does not rewrite history.
- External actions are pinned to full commit SHAs in `.github/action-pins.json`. The pinned upload-pages-artifact composite also pins its upload-artifact dependency. Updates require reviewing official upstream commits and updating the policy manifest.
- Fixed job-level concurrency prevents overlapping exports/builds; it is evaluated after job authorization, and rejected requests cannot cancel authorized jobs. Runners are GitHub-hosted, with bounded timeouts.
- `npm run check:workflows` parses actual YAML, checks permission ceilings/pins/triggers and evaluates the exact authorization expressions against hostile and valid contexts. `npm test` also tests policy mutations. These checks help prevent accidental regressions; they do not constrain an owner who deliberately changes the checks and workflow together.

Opening a public PR no longer runs CI here. To test an outside contribution, inspect its changes first, then deliberately bring the reviewed code onto trusted main as the owner. Owner execution of malicious code remains dangerous even with read-only tokens; do not merge unreviewed workflow, dependency or script changes.

## Repository administration: separate from YAML

**Not applied by this source change.** The connected GitHub tools cannot modify administrative settings; the inspected browser was not signed into GitHub. Do not assume settings below are enabled just because the YAML has been merged.

In **Settings → Actions → General**:

1. Keep Actions enabled. Restrict allowed actions to the reviewed action/SHA pairs in `.github/action-pins.json`; enable the full-length SHA requirement. Include the nested upload-artifact pin (already in that manifest).
2. Set default workflow token permissions to **Read repository contents and packages**. Disable **Allow GitHub Actions to create and approve pull requests**.
3. Require approval for workflows from **all outside collaborators/contributors** as defense against future reintroduction of PR triggers. This is supplementary; current workflows do not execute PR events at all.

In **Settings → Environments → github-pages**, allow only the exact **branch main**, not tags or broad patterns. Preserve any existing reviewer, wait-timer or custom protection rules. Required human reviewers are optional here because the owner's existing automatic Pages deployment is intended to continue.

A local helper uses your existing authenticated GitHub CLI session, never a token committed to the repository:

```sh
# Authenticate gh yourself as kpok, then inspect the current settings (read-only).
node scripts/github-security-settings.mjs
# Apply the fixed-repository hardening only after reviewing the audit and this document.
node scripts/github-security-settings.mjs --apply
```

The helper verifies owner/repository IDs and admin permission before writes, sets read-only token defaults, all-external-contributor approvals, the reviewed immutable action allowlist, and Pages main-only branches. It reads settings back after application. It refuses to change Pages when existing protections cannot be preserved safely; in that case use the UI for the same restrictions while keeping those protections. Partial API failures are surfaced; settings updates are not transactional. Do not put an administrative PAT into a workflow merely to run this helper. It is intentionally absent from CI.

## Other trust boundaries

- Public readers can read logs, artifacts and deployed files. Never print secrets or include them in `dist/`, screenshots, MP4 metadata, caches or artifacts. Public visibility is not permission to dispatch upstream jobs: GitHub requires write access for manual workflow dispatch/reruns, and our jobs impose the stricter owner policy.
- Fork owners can enable/modify their own copies of workflows using their own accounts. They do not receive this repository's secrets. Our guards cannot prohibit independent copies of public code.
- Anyone who can edit trusted main/workflow files or administer this repository can change these controls. Review **Settings → Collaborators**, GitHub App installations, deploy keys and token access; keep write/admin access limited to identities you trust. CODEOWNERS routes reviews but is not enforcement without branch rules.
- If collaborating later, configure branch rules for main to prevent deletion/force-push and enforce reviewed changes to `.github/`, scripts and dependency locks. Do not blindly require an unavailable second reviewer on a single-owner project. The source change does not configure or claim branch protection.
- Historical runs and old refs use their original workflow definition when rerun. New guards do not retroactively harden them. Remove unnecessary writers, review older runs, and retire the old history-rewrite workflow in the Actions UI if GitHub still lists it. Do not rerun old administrative workflows. Existing in-flight runs are not cancelled by this change.
- Future paid TTS generation should be a separate owner-only manual job using a main-only environment and environment-scoped API credentials. Pass credentials only to the generation step. Do not expose them to PR jobs, build-wide environment variables or the static browser app. Generate reusable audio assets rather than spending credits on every export.

## Validation and limitations

Policy tests simulate hostile contexts; they do not launch real malicious PR code or create forks/accounts. CI checks the actual guarded owner push and the Pages deployment. Repository administration and historical-run retirement need separate authenticated verification. Dependency locks, pinned action code and hosted-runner images reduce some risks but do not guarantee that all dependencies or trusted code are harmless.

References:
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/actions/reference/workflows-and-actions/contexts
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/approve-runs-from-forks
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs
