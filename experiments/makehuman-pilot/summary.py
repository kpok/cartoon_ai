import json
import os
from pathlib import Path
import sys
root = Path(sys.argv[1])
m = json.loads((root / 'manifest.json').read_text())
print('## MakeHuman / MPFB anatomical pilot\n')
print('Validation: **' + os.environ['VALIDATION_STATUS'] + '**. Failed validation artifacts are diagnostic only.\n')
print(('Two anatomical characters in a static partner pose; approximate wardrobe, no identity claim.' if m['scene'] == 'salsa' else 'Single anatomical male pilot.') + '\n')
print(f"CPU generation: {m['seconds']} s; Blender {m['blender']}; {m['rigBones']} rig bones; {m['meshCount']} meshes.\n")
print('Eight PNGs: material and clay renders from front, three-quarter, side and back. Includes textured GLB, editable Blender scene and pinned input provenance.\n')
print('[Download pilot artifacts](' + os.environ['ARTIFACT_URL'] + ') — retained for one day.\n')
print(f"Export roundtrip pose error: {m['roundtripPoseMaxError']:.6f} world units. The roundtrip measurement is reported; validation status above determines acceptance.\n")
print('The previous procedural-scene score is unchanged; this MPFB scene has no calibrated reference-comparison result yet.')
