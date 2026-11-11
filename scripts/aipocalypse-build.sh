#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${RUNNER_TEMP:?Build output must be outside the checkout}"
project=experiments/aipocalypse-android
output="$RUNNER_TEMP/aipocalypse-build"
mkdir -p "$output"
node --test tests/aipocalypse-production.test.mjs
bash scripts/aipocalypse-prepare.sh
# Generate from source on every build; never silently reuse a stale model.
rm -f "$project/assets/car.glb"
timeout 120 blender --background --factory-startup --python-exit-code 1 --python "$project/generate_car.py" -- --output "$project/assets/car.glb"
test -s "$project/assets/car.glb"
for role in paramedic astronaut; do
  rm -f "$project/assets/$role.glb"
  timeout 120 blender --background --factory-startup --python-exit-code 1 --python "$project/generate_human.py" -- --output "$project/assets/$role.glb" --role "$role"
  test -s "$project/assets/$role.glb"
done
timeout 120 godot --headless --path "$project" --editor --import
timeout 60 godot --headless --path "$project" --script tests/car_test.gd
timeout 60 godot --headless --path "$project" --script tests/playback_test.gd
timeout 60 godot --headless --path "$project" --script tests/scene_test.gd
timeout 60 godot --headless --path "$project" --quit-after 5
# A monotonically increasing CI run number permits installing the next APK as an update.
version_code="${GITHUB_RUN_NUMBER:-1}"
[[ "$version_code" =~ ^[1-9][0-9]*$ ]] && (( version_code < 2100000000 ))
python3 - "$project/export_presets.cfg" "$version_code" <<'PY'
import re, sys
from pathlib import Path
p=Path(sys.argv[1])
s=p.read_text()
s=re.sub(r'^version/code=.*$', 'version/code='+sys.argv[2], s, flags=re.M)
p.write_text(s)
PY
timeout 180 godot --headless --path "$project" --export-release Android "$output/unsigned.apk"
python3 scripts/aipocalypse-validate.py "$output/unsigned.apk"
aapt dump badging "$output/unsigned.apk" > "$output/manifest.txt"
python3 - "$output/manifest.txt" "$version_code" <<'PYVERIFY'
import re, sys
from pathlib import Path
manifest=Path(sys.argv[1]).read_text()
if not re.search(r"^package: name='org\.cartoonai\.aipocalypse' versionCode='" + re.escape(sys.argv[2]) + "'", manifest, re.M):
    raise SystemExit("Unexpected Android application identity or version code")
if "native-code: 'arm64-v8a'" not in manifest:
    raise SystemExit("Expected ARM64-only APK")
if "uses-permission: name='android.permission.INTERNET'" in manifest:
    raise SystemExit("Offline technical demo must not request Internet permission")
print("Android identity, update version and offline permissions verified")
PYVERIFY
