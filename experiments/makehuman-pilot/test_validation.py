"""Regression cases for losing a partner or changing pose during export."""
import copy
import unittest
from validate import validate_manifest, validate_model


class PairValidationTests(unittest.TestCase):
    def setUp(self):
        self.manifest = {'scene': 'salsa', 'glbRoundtrip': True, 'height': 1.8,
                         'roundtripPoseMaxError': 0, 'roundtripFaceMaxError': 0, 'characters': [
                             {'role': role, 'rigBones': 163, 'sourceVertices': 19158,
                              'faceProfile': {'targets': {str(i): .1 for i in range(10)}, 'targetHashes': {str(i): 'a' * 64 for i in range(10)}},
                              'meshes': [f'{role}_{i}' for i in range(6)]} for role in ('woman', 'man')],
                         'framing': {view: {'minX': .1, 'maxX': .9, 'minY': .1, 'maxY': .9}
                                     for view in ('front', 'three-quarter', 'side', 'back')}}
        self.model = {'skins': [{'joints': list(range(163))} for _ in range(2)],
                      'nodes': [{'name': name, 'mesh': index, 'skin': owner}
                                for owner, character in enumerate(self.manifest['characters'])
                                for index, name in enumerate(character['meshes'])],
                      'materials': [{}], 'images': [{'bufferView': 0}], 'buffers': [{}]}

    def test_complete_pair(self):
        validate_model(self.model, self.manifest)

    def test_missing_partner_rig(self):
        self.model['skins'].pop()
        with self.assertRaises(AssertionError):
            validate_model(self.model, self.manifest)

    def test_missing_partner_mesh(self):
        self.model['nodes'].pop()
        with self.assertRaises(AssertionError):
            validate_model(self.model, self.manifest)

    def test_shared_rig(self):
        for node in self.model['nodes']:
            node['skin'] = 0
        with self.assertRaises(AssertionError):
            validate_model(self.model, self.manifest)

    def test_lost_pose(self):
        self.manifest['roundtripPoseMaxError'] = .1
        with self.assertRaises(AssertionError):
            validate_manifest(self.manifest)

    def test_clipped_or_nonfinite_frame(self):
        for value in (-.01, float('nan')):
            manifest = copy.deepcopy(self.manifest)
            manifest['framing']['front']['minX'] = value
            with self.assertRaises(AssertionError):
                validate_manifest(manifest)

    def test_lost_face_sculpt(self):
        self.manifest['roundtripFaceMaxError'] = .1
        with self.assertRaises(AssertionError):
            validate_manifest(self.manifest)

    def test_missing_face_profile(self):
        self.manifest['characters'][0]['faceProfile']['targetHashes'] = {}
        with self.assertRaises(AssertionError):
            validate_manifest(self.manifest)

    def test_external_texture(self):
        self.model['images'][0]['uri'] = '/tmp/skin.png'
        with self.assertRaises(AssertionError):
            validate_model(self.model, self.manifest)


if __name__ == '__main__':
    unittest.main()
