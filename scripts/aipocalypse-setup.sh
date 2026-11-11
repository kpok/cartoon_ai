#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TEMP:?Run in GitHub Actions or provide RUNNER_TEMP}"
: "${GITHUB_PATH:?GitHub PATH file required}"
: "${GITHUB_ENV:?GitHub environment file required}"
tools="$RUNNER_TEMP/aipocalypse-tools"
mkdir -p "$tools" "$HOME/.local/share/godot/export_templates/4.6.3.stable"
release=https://github.com/godotengine/godot/releases/download/4.6.3-stable
curl --fail --location --retry 3 --max-time 300 "$release/Godot_v4.6.3-stable_linux.x86_64.zip" -o "$tools/godot.zip"
echo "d0bc2113065e481c9c2c2b2c37daa4e8be3fe9e27f0ab9ab0b6096e9a37907f3  $tools/godot.zip" | sha256sum --check --strict
unzip -q "$tools/godot.zip" -d "$tools"
mv "$tools/Godot_v4.6.3-stable_linux.x86_64" "$tools/godot"
curl --fail --location --retry 3 --max-time 900 "$release/Godot_v4.6.3-stable_export_templates.tpz" -o "$tools/templates.tpz"
echo "3fbe2c0e2dec9d537ab9ec97bcf8da91dcf23357fc51f67092dd068d839290a8  $tools/templates.tpz" | sha256sum --check --strict
for template in android_debug.apk android_release.apk version.txt; do
  unzip -p "$tools/templates.tpz" "templates/$template" > "$HOME/.local/share/godot/export_templates/4.6.3.stable/$template"
done
rm "$tools/godot.zip" "$tools/templates.tpz"
java_sdk="${JAVA_HOME_17_X64:?Hosted runner must provide Java 17}"
android_sdk="${ANDROID_HOME:-/usr/local/lib/android/sdk}"
"$android_sdk/cmdline-tools/latest/bin/sdkmanager" 'platforms;android-36' 'build-tools;35.0.1' 'platform-tools'
mkdir -p "$HOME/.config/godot"
python3 - "$HOME/.config/godot/editor_settings-4.6.tres" "$java_sdk" "$android_sdk" <<'PY'
import json, sys
from pathlib import Path
Path(sys.argv[1]).write_text('[gd_resource type="EditorSettings" format=3]\n\n[resource]\nexport/android/java_sdk_path = ' + json.dumps(sys.argv[2]) + '\nexport/android/android_sdk_path = ' + json.dumps(sys.argv[3]) + '\n')
PY
printf '%s\n' "$tools" "$android_sdk/build-tools/35.0.1" >> "$GITHUB_PATH"
printf 'JAVA_HOME=%s\nANDROID_HOME=%s\n' "$java_sdk" "$android_sdk" >> "$GITHUB_ENV"
"$tools/godot" --version

# Reuse the repository's verified Blender release for CPU-only GLB generation.
curl --fail --location --retry 2 --max-time 300 https://download.blender.org/release/Blender4.2/blender-4.2.0-linux-x64.tar.xz -o "$tools/blender.tar.xz"
echo "4f4fd7646af01f6fee9d420408318381a6e52571268eb7cf9cd5033bd9e7a359  $tools/blender.tar.xz" | sha256sum --check --strict
tar -xf "$tools/blender.tar.xz" -C "$tools"
rm "$tools/blender.tar.xz"
printf '%s\n' "$tools/blender-4.2.0-linux-x64" >> "$GITHUB_PATH"
