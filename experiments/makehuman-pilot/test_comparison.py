"""Behavioral counterexamples for the frozen foreground agreement index."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image, ImageChops, ImageDraw, ImageOps
from compare import evaluate, reference_masks, render_masks


class MetricTests(unittest.TestCase):
    def setUp(self):
        self.image = Image.new('RGB', (160, 240), (24, 48, 70))
        self.masks = {role: Image.new('L', self.image.size) for role in ('woman', 'man')}
        for role, box, color in [('woman', (22, 20, 69, 220), (20, 140, 60)), ('man', (88, 10, 139, 220), (30, 40, 170))]:
            ImageDraw.Draw(self.masks[role]).rectangle(box, fill=255)
            ImageDraw.Draw(self.image).rectangle(box, fill=color)
            ImageDraw.Draw(self.image).line((box[0], 80, box[2], 140), fill='white', width=3)

    def score(self, image=None, masks=None):
        return evaluate(self.image, self.image if image is None else image, self.masks, self.masks if masks is None else masks)[0]

    def test_self_is_100(self):
        self.assertAlmostEqual(self.score()['scorePercent'], 100, places=10)

    def test_background_change_has_no_effect(self):
        image = Image.composite(self.image, Image.new('RGB', self.image.size, 'magenta'), ImageChops.lighter(*self.masks.values()))
        self.assertAlmostEqual(self.score(image)['scorePercent'], 100, places=10)

    def test_padding_has_no_effect(self):
        image = ImageOps.expand(self.image, border=(11, 33, 48, 17), fill='yellow')
        masks = {role: ImageOps.expand(mask, border=(11, 33, 48, 17), fill=0) for role, mask in self.masks.items()}
        self.assertAlmostEqual(self.score(image, masks)['scorePercent'], 100, places=8)
        transform = self.score(image, masks)['transforms']['render']
        self.assertIn('uniformScale', transform)
        self.assertNotIn('scaleX', transform)

    def test_missing_either_person_is_zero(self):
        for role in self.masks:
            masks = copy.deepcopy(self.masks)
            masks[role] = Image.new('L', self.image.size)
            result = self.score(masks=masks)
            self.assertEqual(result['scorePercent'], 0)
            self.assertTrue(result['people'][role]['missingCandidate'])

    def test_all_missing_render_is_zero(self):
        self.assertEqual(self.score(masks={role: Image.new('L', self.image.size) for role in self.masks})['scorePercent'], 0)

    def test_invalid_reference_empty_is_error(self):
        with self.assertRaises(ValueError):
            evaluate(self.image, self.image, {role: Image.new('L', self.image.size) for role in self.masks}, self.masks)

    def test_swapped_roles_decline(self):
        self.assertLess(self.score(masks={'woman': self.masks['man'], 'man': self.masks['woman']})['scorePercent'], 30)

    def test_shifted_person_declines(self):
        masks = copy.deepcopy(self.masks)
        masks['woman'] = ImageChops.offset(masks['woman'], 15, 0)
        self.assertLess(self.score(masks=masks)['scorePercent'], 90)

    def test_foreground_color_corruption_declines(self):
        image = ImageOps.invert(self.image)
        self.assertLess(self.score(image)['scorePercent'], 90)

    def test_semantic_ties_are_disjoint(self):
        image = Image.new('RGBA', (3, 1))
        image.putdata([(255, 0, 0, 255), (128, 0, 128, 255), (0, 0, 255, 127)])
        masks = render_masks(image)
        self.assertEqual(list(masks['woman'].getdata()), [255, 0, 0])
        self.assertEqual(list(masks['man'].getdata()), [0, 255, 0])
        self.assertIsNone(ImageChops.multiply(*masks.values()).getbbox())

    def test_invalid_semantic_color_is_error(self):
        with self.assertRaises(ValueError):
            render_masks(Image.new('RGBA', (1, 1), (0, 255, 0, 255)))
        with self.assertRaises(ValueError):
            render_masks(Image.new('RGB', (1, 1)))

    def test_wrong_reference_hash_produces_error_not_score(self):
        config = json.loads(Path(__file__).with_name('comparison.json').read_text())
        config['sourceSha256'] = '0' * 64
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'config.json').write_text(json.dumps(config))
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('compare.py')), '--model-dir', directory, '--output', directory, '--config', str(root / 'config.json')], capture_output=True)
            self.assertEqual(result.returncode, 2)
            report = json.loads((root / 'metrics.json').read_text())
            self.assertEqual(report['status'], 'error')
            self.assertIsNone(report['scorePercent'])
            self.assertIn('hash mismatch', report['error'])

    def test_reference_polygon_bounds_and_empty_role_are_errors(self):
        config = json.loads(Path(__file__).with_name('comparison.json').read_text())
        image = Image.new('RGB', tuple(config['sourceSize']))
        config['people']['woman']['polygons'] = []
        with self.assertRaises(ValueError):
            reference_masks(config, image)
        config['people']['woman']['polygons'] = [[[-1, 0], [5, 0], [0, 8]]]
        with self.assertRaises(ValueError):
            reference_masks(config, image)


if __name__ == '__main__':
    unittest.main()
