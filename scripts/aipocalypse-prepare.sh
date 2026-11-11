#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p experiments/aipocalypse-android/assets
cp docs/aipocalypse/assets/logo.jpg experiments/aipocalypse-android/assets/logo.jpg
node scripts/aipocalypse-compile.mjs
