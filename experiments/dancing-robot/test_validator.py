# SPDX-License-Identifier: GPL-3.0-or-later
"""Exercise publication validation against malformed and external resources."""
import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest
import zlib

spec = importlib.util.spec_from_file_location('robot_validator', Path(__file__).resolve().parents[2] / 'scripts/validate-robot.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


def glb(document):
    text = json.dumps(document).encode()
    text += b' ' * (-len(text) % 4)
    binary = struct.pack('<9f', 0,0,0, 1,0,0, 0,1,0)
    return struct.pack('<4sII', b'glTF',2,28+len(text)+len(binary)) + struct.pack('<II',len(text),0x4E4F534A) + text + struct.pack('<II',len(binary),0x004E4942) + binary


def scene():
    return {'asset':{'version':'2.0'},'buffers':[{'byteLength':36}], 'bufferViews':[{'buffer':0,'byteLength':36}], 'accessors':[{'bufferView':0,'componentType':5126,'type':'VEC3','count':3}], 'meshes':[{'primitives':[{'attributes':{'POSITION':0}}]}], 'nodes':[{'mesh':0}], 'scenes':[{'nodes':[0]}]}


class ValidatorTests(unittest.TestCase):
    def test_valid_triangle_and_adversarial_glb(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.glb'
            path.write_bytes(glb(scene()))
            self.assertEqual(validator.validate_glb(path)['triangles'],1)
            changes = [lambda d:d['buffers'][0].update(uri='https://example.com/model.bin'), lambda d:d.update(images=[{'uri':'data:image/png;base64,'}]), lambda d:d.update(extensionsUsed=['KHR_draco_mesh_compression']), lambda d:d['nodes'][0].update(extensions={'EXT_unknown':{}}), lambda d:d['accessors'][0].update(count=4), lambda d:d['accessors'][0].update(min=[float('nan')]), lambda d:d['bufferViews'][0].update(byteLength=400)]
            for change in changes:
                document=scene();change(document);path.write_bytes(glb(document))
                with self.subTest(document=document), self.assertRaises((ValueError,KeyError,struct.error)):
                    validator.validate_glb(path)
            path.write_bytes(glb(scene())[:-1])
            with self.assertRaises(ValueError):
                validator.validate_glb(path)

    def test_png_crc_and_dimensions(self):
        def chunk(kind,payload):
            return struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',zlib.crc32(kind+payload))
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'test.png'
            data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',768,768,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((b'\x00'+b'\x00'*2304)*768))+chunk(b'IEND',b'')
            path.write_bytes(data)
            self.assertEqual(validator.validate_png(path)['width'],768)
            path.write_bytes(data[:-1]+b'\x00')
            with self.assertRaises(ValueError):
                validator.validate_png(path)


if __name__=='__main__':
    unittest.main()
