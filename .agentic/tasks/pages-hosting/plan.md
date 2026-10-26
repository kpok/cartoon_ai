# GitHub Pages delivery

Baseline: 25ad016acc1d8cb00d73996bc4c57f61ba5df560, main, private repo kpok/cartoon_ai. User requested GitHub hosting through Actions. Current static dist supports project subpaths through relative assets.

AC: publish tested dist after successful unit/E2E/build; no PR publishing; job-scoped Pages/OIDC permissions; one-time activation instructions; preserve repository visibility. Existing tests remain unchanged.

Connector supports repository source writes but Pages settings endpoint is not exposed. Owner must enable Pages source GitHub Actions and set ENABLE_GITHUB_PAGES=true. Deployment stays gated until activation, avoiding a knowingly failing deploy on an unconfigured private repository. Eligible GitHub plan unknown; private Pages requires supported paid plan. No account upgrade or repository visibility change authorized.

Validation: YAML parsed with BaseLoader and checked dependency, permissions, packaging path and activation gate. npm test 5/5 PASS; npm run build PASS. Independent workflow review requested. Runtime app source unchanged; previous six E2E cases still applicable, rerun by CI on delivery. Actual public deployment pending owner activation and plan eligibility.
