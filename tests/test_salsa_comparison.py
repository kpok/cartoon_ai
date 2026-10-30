"""Exercise image metric behavior and the report-before-failure contract."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image, ImageDraw, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT/'experiments/salsa-human-models/compare.py'
spec = importlib.util.spec_from_file_location('salsa_comparison', SCRIPT)
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)


def fixture():
    image = Image.new('RGB', (256, 384), '#aa9988')
    draw = ImageDraw.Draw(image)
    draw.rectangle((35, 70, 100, 340), fill='#00624e')
    draw.ellipse((140, 80, 220, 300), fill='#18253e')
    draw.rectangle((45, 50, 85, 85), fill='#d0a080')
    return image


class ComparisonTests(unittest.TestCase):
    def test_identical_nonflat_images_score_100(self):
        metrics = comparison.similarity(fixture(), fixture())
        self.assertAlmostEqual(metrics['scorePercent'], 100)
        self.assertTrue(comparison.passes_threshold(metrics['scorePercent']))

    def test_shift_color_and_missing_subject_reduce_score(self):
        source = fixture()
        shifted = ImageChops.offset(source, 50, 0)
        recolored = source.copy()
        ImageDraw.Draw(recolored).rectangle((35, 70, 100, 340), fill='#bb4422')
        missing = source.copy()
        ImageDraw.Draw(missing).rectangle((35, 50, 100, 340), fill='#aa9988')
        for changed in (shifted, recolored, missing):
            self.assertLess(comparison.similarity(source, changed)['scorePercent'], 100)
        self.assertLess(comparison.similarity(source, shifted)['scorePercent'], 80)
        self.assertLess(comparison.similarity(source, missing)['scorePercent'], 80)

    def test_missing_subject_fails_after_fixed_crop(self):
        source = fixture().resize((1024, 1536))
        missing = fixture()
        ImageDraw.Draw(missing).rectangle((35, 50, 100, 340), fill='#aa9988')
        a, b = comparison.framed_images(source, missing.resize((1024, 1536)))
        self.assertLess(comparison.similarity(a, b, (208, 336))['scorePercent'], 80)

    def test_unrelated_image_fails(self):
        other = Image.new('RGB', (256, 384), 'white')
        draw = ImageDraw.Draw(other)
        for y in range(0, 384, 12):
            draw.rectangle((0, y, 255, y+5), fill='black')
        self.assertLess(comparison.similarity(fixture(), other)['scorePercent'], 80)

    def test_blank_and_wrong_aspect_fail_closed(self):
        with self.assertRaises(ValueError):
            comparison.similarity(fixture(), Image.new('RGB', (256, 384), 'black'))
        with self.assertRaises(ValueError):
            comparison.similarity(fixture(), fixture().resize((256, 256)))
        self.assertEqual(comparison.edge_f1(Image.new('RGB', (256, 384)), Image.new('RGB', (256, 384))), 0)

    def test_fixed_crop_preserves_pixels_and_aspect(self):
        with Image.open(ROOT/'experiments/salsa-human-models/reference/concept.png') as source, Image.open(ROOT/'experiments/salsa-human-models/reference/concept-cropped.png') as saved:
            a, b = comparison.framed_images(source.convert('RGB'), source.convert('RGB'))
            self.assertEqual(a.size, (832, 1344))
            self.assertEqual(comparison.FRAMING['analysisSize'], [208, 336])
            self.assertIsNone(ImageChops.difference(a, saved.convert('RGB')).getbbox())
            self.assertAlmostEqual(comparison.similarity(a, b, (208, 336))['scorePercent'], 100)

    def test_exact_threshold_is_inclusive(self):
        self.assertFalse(comparison.passes_threshold(79.999))
        self.assertTrue(comparison.passes_threshold(80))

    def test_cli_writes_reports_before_threshold_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            reference, render = directory/'source.png', directory/'render.png'
            fixture().resize((1024, 1536)).save(reference)
            ImageChops.offset(fixture(), 50, 0).resize((1024, 1536)).save(render)
            command = [sys.executable, str(SCRIPT), '--reference', str(reference), '--render', str(render), '--output', str(directory)]
            summary = directory/'github-summary.md'
            result = subprocess.run(command, capture_output=True, text=True, env={**os.environ, 'GITHUB_STEP_SUMMARY': str(summary)})
            self.assertIn('FAIL', summary.read_text())
            self.assertEqual(result.returncode, 1, result.stderr)
            metrics = json.loads((directory/'metrics.json').read_text())
            self.assertFalse(metrics['passed'])
            self.assertLess(metrics['scorePercent'], 80)
            self.assertIn('sha256', metrics)
            self.assertEqual(metrics['framing']['cropBox'], [80, 24, 912, 1368])
            with Image.open(directory/'render-cropped.png') as cropped:
                self.assertEqual(cropped.size, (832, 1344))
            self.assertIn('legacyFullImageV1', metrics)
            self.assertTrue((directory/'summary.md').is_file())
            with Image.open(directory/'reference-comparison.png') as panel:
                self.assertEqual(panel.size, (1248, 720))
            self.assertTrue((directory/'difference.png').is_file())
            fixture().resize((1024, 1536)).save(render)
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_cli_invalid_input_reports_error(self):
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            reference, render = directory/'source.png', directory/'render.png'
            fixture().save(reference)
            fixture().save(render)
            result = subprocess.run([sys.executable, str(SCRIPT), '--reference', str(reference), '--render', str(render), '--output', str(directory)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn('1024', json.loads((directory/'metrics.json').read_text())['error'])


if __name__ == '__main__':
    unittest.main()
