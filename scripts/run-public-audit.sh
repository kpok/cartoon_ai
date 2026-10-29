#!/usr/bin/env bash
set -euo pipefail
private_terms="${PRIVATE_TERMS:-}"
unset PRIVATE_TERMS
bash scripts/fetch-audit-refs.sh
scanner_dir="$(mktemp -d)"
trap 'rm -rf "$scanner_dir"' EXIT
bash scripts/install-gitleaks.sh "$scanner_dir"
GITLEAKS_PATH="$scanner_dir/gitleaks" python3 scripts/audit-secrets.py
PRIVATE_TERMS="$private_terms" python3 scripts/audit-privacy.py
unset private_terms
GITLEAKS_PATH="$scanner_dir/gitleaks" python3 -m unittest discover -s tests -p 'test_audit*.py'
npm run build
node scripts/audit-licenses.mjs
node scripts/audit-vulnerabilities.mjs
