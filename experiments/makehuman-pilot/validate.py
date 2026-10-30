"""Validate complete views and embedded GLB resources before accepting a pilot."""
import json
from pathlib import Path
import struct
import sys

root = Path(sys.argv[1])
manifest = json.loads((root / 'manifest.json').read_text())
assert manifest['glbRoundtrip'] is True, 'GLB import roundtrip missing'
assert manifest['rigBones'] >= 100, 'Missing anatomical rig'
assert manifest['sourceVertices'] >= 10000, 'Missing anatomical mesh'
assert manifest['meshCount'] >= 6, 'Required character assets missing'
for style in ('beauty', 'clay'):
    for view in ('front', 'three-quarter', 'side', 'back'):
        data = (root / f'{style}-{view}.png').read_bytes()
        assert data[:8] == b'\x89PNG\r\n\x1a\n'
        assert struct.unpack('>II', data[16:24]) == (640, 800)
assert (root / 'makehuman-pilot.blend').stat().st_size > 100000
raw = (root / 'makehuman-pilot.glb').read_bytes()
magic, version, length = struct.unpack_from('<III', raw)
assert (magic, version, length) == (0x46546C67, 2, len(raw))
size, kind = struct.unpack_from('<II', raw, 12)
assert kind == 0x4E4F534A
model = json.loads(raw[20:20 + size])
assert len(model.get('meshes', [])) >= 6
assert model.get('materials') and model.get('images')
assert all('uri' not in item for item in model.get('buffers', []) + model.get('images', [])), 'External GLB dependency'
assert all('bufferView' in item for item in model['images']), 'Missing embedded texture'
print('Pilot validated: eight views, anatomical rig, blend and self-contained textured GLB')
