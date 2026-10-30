import json
import os
from pathlib import Path
import sys
root = Path(sys.argv[1])
m = json.loads((root / 'manifest.json').read_text())
print('## MakeHuman / MPFB anatomical pilot\n')
print('Validation: **' + os.environ['VALIDATION_STATUS'] + '**. Failed validation artifacts are diagnostic only.\n')
print('Single anatomical male with clothing; not yet a reconstruction of the reference couple.\n')
print(f"CPU generation: {m['seconds']} s; Blender {m['blender']}; {m['rigBones']} rig bones; {m['meshCount']} meshes.\n")
print('Eight PNGs: material and clay renders from front, three-quarter, side and back. Includes textured GLB, editable Blender scene and pinned input provenance.\n')
print('[Download pilot artifacts](' + os.environ['ARTIFACT_URL'] + ') — retained for one day.\n')
print('The existing couple comparison score is not applicable to this single-character pilot.')
