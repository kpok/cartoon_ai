"""Counterexamples for separate eye-registered face inspection."""
import copy
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from compare_faces import compare_face, eye_transform, aligned_face


class FaceMetricTests(unittest.TestCase):
    def setUp(self):
        self.config = json.loads(Path(__file__).with_name('face-comparison.json').read_text())
        self.eyes = [[52, 66], [108, 66]]
        self.image = Image.new('RGB', (160, 192), '#505050')
        draw = ImageDraw.Draw(self.image)
        draw.ellipse((20, 12, 140, 184), fill='#c68e69')
        for x, y in self.eyes:
            draw.ellipse((x - 13, y - 7, x + 13, y + 7), fill='white')
            draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill='#203040')
        draw.line((80, 70, 76, 114, 86, 115), fill='#713d21', width=3)
        draw.arc((50, 125, 110, 153), 5, 175, fill='#742d2d', width=4)

    def score(self, model, anchors=None):
        return compare_face(self.image, model, self.eyes, self.eyes if anchors is None else anchors, self.config)[0]['faceScorePercent']

    def test_identical_is_100(self):
        self.assertAlmostEqual(self.score(self.image), 100, places=10)

    def test_uniform_scale_rotation_translation_with_anchors(self):
        angle, scale, tx, ty = math.radians(12), 1.5, 65, 60
        a, b = scale * math.cos(angle), scale * math.sin(angle)
        determinant = a * a + b * b
        inverse = (a / determinant, b / determinant, -(a * tx + b * ty) / determinant,
                   -b / determinant, a / determinant, (b * tx - a * ty) / determinant)
        model = self.image.transform((400, 420), Image.Transform.AFFINE, inverse, Image.Resampling.BICUBIC)
        anchors = [[a * x - b * y + tx, b * x + a * y + ty] for x, y in self.eyes]
        self.assertGreater(self.score(model, anchors), 95)
        transform = eye_transform(anchors, self.config['targetEyes'], model.size)
        matrix = transform['matrix']
        self.assertAlmostEqual(matrix[0][0], matrix[1][1])
        self.assertAlmostEqual(matrix[0][1], -matrix[1][0])
        self.assertGreater(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0], 0)

    def test_color_damage_declines(self):
        self.assertLess(self.score(ImageOps.invert(self.image)), 90)

    def test_blur_declines(self):
        self.assertLess(self.score(self.image.filter(ImageFilter.GaussianBlur(5))), 99)

    def test_changed_features_decline(self):
        altered = self.image.copy()
        ImageDraw.Draw(altered).rectangle((65, 83, 98, 119), fill='black')
        self.assertLess(self.score(altered), 99)

    def test_invalid_missing_reversed_and_outside_anchors(self):
        for anchors in (None, [], [[52, 66]], [[108, 66], [52, 66]], [[52, 66], [52, 66]], [[float('nan'), 60], [108, 66]], [[-1, 66], [108, 66]], [[10, 10], [11, 90]]):
            with self.assertRaises(ValueError):
                eye_transform(anchors, self.config['targetEyes'], self.image.size)

    def test_clipped_face_is_error(self):
        with self.assertRaises(ValueError):
            aligned_face(self.image.crop((0, 0, 160, 120)), self.eyes, self.config)

    def test_wrong_source_hash_is_error_no_scores(self):
        config = copy.deepcopy(self.config)
        config['sourceSha256'] = '0' * 64
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'config.json').write_text(json.dumps(config))
            process = subprocess.run([sys.executable, str(Path(__file__).with_name('compare_faces.py')), '--model-dir', directory, '--output', directory, '--config', str(root / 'config.json')], capture_output=True)
            self.assertEqual(process.returncode, 2)
            report = json.loads((root / 'face-metrics.json').read_text())
            self.assertEqual(report['status'], 'error')
            self.assertEqual(report['people'], {})
            self.assertIn('hash mismatch', report['error'])


if __name__ == '__main__':
    unittest.main()
