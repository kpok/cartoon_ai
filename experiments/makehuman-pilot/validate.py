"""Validate rendered views and distinct posed characters in a portable GLB."""
import json
import math
from pathlib import Path
import struct
import sys


def validate_manifest(manifest):
    roles = ['woman', 'man'] if manifest['scene'] == 'salsa' else ['man']
    assert manifest['glbRoundtrip'] is True, 'GLB import roundtrip missing'
    assert math.isfinite(manifest['height']) and manifest['height'] > 0
    assert math.isfinite(manifest['roundtripPoseMaxError']) and 0 <= manifest['roundtripPoseMaxError'] <= manifest['height'] * .005, 'Pose changed during GLB roundtrip'
    assert [character['role'] for character in manifest['characters']] == roles
    if manifest['scene'] == 'salsa':
        assert math.isfinite(manifest['roundtripFaceMaxError']) and 0 <= manifest['roundtripFaceMaxError'] <= manifest['height'] * .002, 'Sculpted face lost in export'
    for character in manifest['characters']:
        assert character['rigBones'] >= 100 and character['sourceVertices'] >= 10000
        assert len(character['meshes']) >= 6
        if manifest['scene'] == 'salsa':
            profile = character['faceProfile']
            assert len(profile['targets']) >= 10
            assert set(profile['targets']) == set(profile['targetHashes'])
            assert all(len(value) == 64 and all(c in '0123456789abcdef' for c in value) for value in profile['targetHashes'].values())
    for view in ('front', 'three-quarter', 'side', 'back'):
        frame = manifest['framing'][view]
        assert all(math.isfinite(value) for value in frame.values())
        assert .01 <= frame['minX'] < frame['maxX'] <= .99, 'Horizontal clipping'
        assert .01 <= frame['minY'] < frame['maxY'] <= .99, 'Vertical clipping'
    return roles


def validate_model(model, manifest):
    roles = validate_manifest(manifest)
    skins = model.get('skins', [])
    assert len(skins) == len(roles), 'Missing distinct exported character rig'
    assert all(len(skin.get('joints', [])) >= 100 for skin in skins)
    owners = set()
    for character in manifest['characters']:
        nodes = [node for node in model.get('nodes', []) if 'mesh' in node and node.get('name', '').startswith(character['role'] + '_')]
        assert {node['name'] for node in nodes} == set(character['meshes']), 'Character mesh inventory lost'
        assigned = {node.get('skin') for node in nodes}
        assert len(assigned) == 1 and None not in assigned, 'Character skin ownership missing'
        owners.update(assigned)
    assert len(owners) == len(roles), 'Characters share an unexpected rig'
    assert model.get('materials') and model.get('images')
    assert all('uri' not in item for item in model.get('buffers', []) + model.get('images', [])), 'External GLB dependency'
    assert all('bufferView' in item for item in model['images']), 'Missing embedded texture'


def main(root):
    manifest = json.loads((root / 'manifest.json').read_text())
    validate_manifest(manifest)
    for style in ('beauty', 'clay'):
        for view in ('front', 'three-quarter', 'side', 'back'):
            data = (root / f'{style}-{view}.png').read_bytes()
            assert data[:8] == b'\x89PNG\r\n\x1a\n'
            assert struct.unpack('>II', data[16:24]) == (640, 800)
            assert len(data) > 1000, 'Truncated image'
    if manifest['scene'] == 'salsa':
        for role in ('woman', 'man'):
            for style in ('beauty', 'clay'):
                data = (root / f'{style}-face-{role}.png').read_bytes()
                assert data[:8] == b'\x89PNG\r\n\x1a\n' and len(data) > 1000
                assert struct.unpack('>II', data[16:24]) == (640, 800)
    assert (root / 'makehuman-pilot.blend').stat().st_size > 100000
    raw = (root / 'makehuman-pilot.glb').read_bytes()
    magic, version, length = struct.unpack_from('<III', raw)
    assert (magic, version, length) == (0x46546C67, 2, len(raw))
    size, kind = struct.unpack_from('<II', raw, 12)
    assert kind == 0x4E4F534A
    model = json.loads(raw[20:20 + size])
    validate_model(model, manifest)
    print(f"Pilot validated: {len(manifest['characters'])} distinct posed characters, eight unclipped views and embedded GLB resources")


if __name__ == '__main__':
    main(Path(sys.argv[1]))
