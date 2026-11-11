#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TEMP:?Build output directory required}"
# Never substitute a newly generated key: updates require the same persistent certificate.
for name in AIPOCALYPSE_KEYSTORE_BASE64 AIPOCALYPSE_KEYSTORE_PASSWORD AIPOCALYPSE_KEY_ALIAS; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::Configure repository secret $name before publishing an installable APK."
    exit 1
  fi
done
output="$RUNNER_TEMP/aipocalypse-build"
key_dir="$(mktemp -d "$RUNNER_TEMP/aipocalypse-signing.XXXXXX")"
trap 'rm -rf "$key_dir"' EXIT
umask 077
printf '%s' "$AIPOCALYPSE_KEYSTORE_BASE64" | base64 --decode > "$key_dir/release.keystore"
unset AIPOCALYPSE_KEYSTORE_BASE64
zipalign -P 16 -f 4 "$output/unsigned.apk" "$output/aligned.apk"
apksigner sign --ks "$key_dir/release.keystore" --ks-key-alias "$AIPOCALYPSE_KEY_ALIAS" --ks-pass env:AIPOCALYPSE_KEYSTORE_PASSWORD --key-pass env:AIPOCALYPSE_KEYSTORE_PASSWORD --out "$output/AIpokalypse.apk" "$output/aligned.apk"
apksigner verify --verbose "$output/AIpokalypse.apk"
zipalign -c -P 16 4 "$output/AIpokalypse.apk"
python3 scripts/aipocalypse-validate.py "$output/AIpokalypse.apk"
(cd "$output" && sha256sum AIpokalypse.apk > AIpokalypse.apk.sha256)
rm "$output/unsigned.apk" "$output/aligned.apk"
