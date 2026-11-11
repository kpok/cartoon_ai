#!/usr/bin/env python3
"""Reject malformed APK exports or missing ARM64 Godot runtime before publication."""
import json
import sys
from pathlib import Path
from zipfile import ZipFile


def validate(path: Path) -> None:
    if not path.is_file() or path.stat().st_size == 0:
        raise ValueError("APK missing or empty")
    with ZipFile(path) as archive:
        bad = archive.testzip()
        if bad:
            raise ValueError(f"Corrupted APK member: {bad}")
        names = set(archive.namelist())
        for required in ("AndroidManifest.xml", "classes.dex", "lib/arm64-v8a/libgodot_android.so"):
            if required not in names:
                raise ValueError(f"Missing APK member: {required}")
        if not any(name.startswith("assets/") for name in names):
            raise ValueError("APK has no application assets")
        timelines = [name for name in names if name.endswith("/animatic.json")]
        if len(timelines) != 1:
            raise ValueError("APK must contain exactly one compiled film timeline")
        timeline = json.loads(archive.read(timelines[0]))
        if timeline.get("duration") != 870 or len(timeline.get("shots", [])) != 149 or len(timeline.get("sequences", [])) != 22:
            raise ValueError("APK film timeline is incomplete")
        if any(name.endswith((".keystore", ".jks")) for name in names):
            raise ValueError("Signing material must not be packaged")
    print("APK structure, full film timeline and ARM64 runtime verified")


if __name__ == "__main__":
    validate(Path(sys.argv[1]))
