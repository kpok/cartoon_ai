#!/usr/bin/env bash
set -euo pipefail
# Fixed upstream release; the archive checksum is reviewed in source control.
[[ "$(uname -s)-$(uname -m)" == Linux-x86_64 ]] || { echo 'Unsupported scanner platform'; exit 1; }
scanner_dir="${1:?Supply a temporary output directory}"
mkdir -p "$scanner_dir"
curl --silent --show-error --fail --location --retry 2 --max-time 120 https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz -o "$scanner_dir/archive.tar.gz"
printf '%s  %s\n' '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' "$scanner_dir/archive.tar.gz" | sha256sum --check --strict
tar --no-same-owner -xzf "$scanner_dir/archive.tar.gz" -C "$scanner_dir" gitleaks LICENSE
"$scanner_dir/gitleaks" version
