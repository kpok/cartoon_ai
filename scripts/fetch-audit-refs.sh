#!/usr/bin/env bash
set -euo pipefail
trap 'echo "Audit ref verification failed; inspect locally" >&2' ERR
# Fail rather than silently scanning a shallow or incomplete set of advertised refs.
[[ "$(git rev-parse --is-shallow-repository 2>/dev/null)" == false ]]
git fetch --quiet --force --prune origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*' >/dev/null 2>&1
audit_refs="$(git ls-remote --heads --tags origin 2>/dev/null)"
[[ -n "$audit_refs" ]]
while read -r oid ref; do
 [[ "$ref" == *'^{}' ]] && continue
 if [[ "$ref" == refs/heads/* ]]; then local_ref="refs/remotes/origin/${ref#refs/heads/}"; else local_ref="$ref"; fi
 [[ "$(git rev-parse "$local_ref" 2>/dev/null)" == "$oid" ]] || { echo 'Audit refs changed or are incomplete; retry'; exit 1; }
done <<< "$audit_refs"
echo 'All advertised branch and tag heads verified.'
