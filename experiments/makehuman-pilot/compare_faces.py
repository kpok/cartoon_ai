"""Separate eye-registered face diagnostics, not identity recognition or a global gate."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import shutil
import sys
import PIL
from PIL import Image, ImageChops, ImageDraw, ImageOps, ImageStat
from compare import foreground_ssim, edge_f1

ROOT = Path(__file__).resolve().parent
VERSION = 'mpfb-face-v1'


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def eye_transform(eyes, target, image_size):
    if not isinstance(eyes, (list, tuple)) or len(eyes) != 2 or any(not isinstance(p, (list, tuple)) or len(p) != 2 or not all(isinstance(v, (int, float)) and math.isfinite(v) for v in p) for p in eyes):
        raise ValueError('Invalid eye anchors')
    if not all(0 <= x < image_size[0] and 0 <= y < image_size[1] for x, y in eyes):
        raise ValueError('Eye anchor outside image')
    dx, dy = eyes[1][0] - eyes[0][0], eyes[1][1] - eyes[0][1]
    distance = math.hypot(dx, dy)
    if dx <= 0 or distance < max(4, min(image_size) * .02) or abs(math.degrees(math.atan2(dy, dx))) > 60:
        raise ValueError('Reversed, degenerate or implausible eye anchors')
    ex, ey = target[1][0] - target[0][0], target[1][1] - target[0][1]
    a = (ex * dx + ey * dy) / (distance * distance)
    b = (ey * dx - ex * dy) / (distance * distance)
    tx = target[0][0] - a * eyes[0][0] + b * eyes[0][1]
    ty = target[0][1] - b * eyes[0][0] - a * eyes[0][1]
    determinant = a * a + b * b
    inverse = (a / determinant, b / determinant, -(a * tx + b * ty) / determinant,
               -b / determinant, a / determinant, (b * tx - a * ty) / determinant)
    return {'matrix': [[a, -b, tx], [b, a, ty]], 'inverse': list(inverse),
            'uniformScale': math.sqrt(determinant), 'rotationDegrees': math.degrees(math.atan2(b, a)),
            'eyeDistancePixels': distance, 'eyeLineDegrees': math.degrees(math.atan2(dy, dx))}


def aligned_face(image, eyes, config):
    transform = eye_transform(eyes, config['targetEyes'], image.size)
    size = tuple(config['analysisSize'])
    mask = Image.new('L', size)
    ImageDraw.Draw(mask).ellipse(config['innerFaceOval'], fill=255)
    inverse = transform['inverse']
    # Every scored pixel must come from real source pixels, not affine fill padding.
    for y in range(size[1]):
        for x in range(size[0]):
            if mask.getpixel((x, y)):
                sx = inverse[0] * x + inverse[1] * y + inverse[2]
                sy = inverse[3] * x + inverse[4] * y + inverse[5]
                if not (1 <= sx < image.width - 1 and 1 <= sy < image.height - 1):
                    raise ValueError('Scored inner face is clipped by input crop')
    result = image.convert('RGB').transform(size, Image.Transform.AFFINE, inverse, Image.Resampling.BICUBIC, fillcolor=(128, 128, 128))
    return result, mask, transform


def compare_face(reference, model, reference_eyes, model_eyes, config):
    a, mask, ta = aligned_face(reference, reference_eyes, config)
    b, _, tb = aligned_face(model, model_eyes, config)
    neutral = Image.new('RGB', a.size, (128, 128, 128))
    aa, bb = Image.composite(a, neutral, mask), Image.composite(b, neutral, mask)
    structure = foreground_ssim(aa, bb, mask)
    mae = sum(ImageStat.Stat(ImageChops.difference(a, b), mask=mask).mean) / 3
    return {'faceScorePercent': 100 * structure, 'innerFaceRGBSSIM': structure,
            'edgeF1Diagnostic': edge_f1(aa, bb), 'colorMAE255Diagnostic': mae,
            'transforms': {'reference': ta, 'model': tb}, 'sourceEyes': reference_eyes, 'modelEyes': model_eyes}, (a, b, mask)


def save_panel(role, reference, model, aligned, output):
    a, b, mask = aligned
    reference.save(output / f'reference-face-{role}.png')
    a.save(output / f'reference-face-{role}-aligned.png')
    b.save(output / f'model-face-{role}-aligned.png')
    difference = ImageChops.multiply(ImageChops.difference(a, b).convert('RGB'), mask.convert('RGB'))
    difference.save(output / f'face-{role}-difference.png')
    panel = Image.new('RGB', (800, 224), '#222222')
    draw = ImageDraw.Draw(panel)
    for index, (label, picture) in enumerate([('Original native crop', reference), ('Model portrait', model), ('Reference aligned', a), ('Model aligned', b), ('Inner-face difference', difference)]):
        draw.text((index * 160 + 3, 5), label, fill='white')
        thumbnail = ImageOps.contain(picture, (160, 192), Image.Resampling.LANCZOS)
        panel.paste(thumbnail, (index * 160 + (160 - thumbnail.width) // 2, 28 + (192 - thumbnail.height) // 2))
    panel.save(output / f'face-{role}-panel.png')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--reference', type=Path, default=ROOT.parent / 'salsa-human-models/reference/concept-cropped.png')
    parser.add_argument('--config', type=Path, default=ROOT / 'face-comparison.json')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    report = {'algorithm': VERSION, 'status': 'error', 'people': {}, 'excludedFromGlobalHeadline': True,
              'meaning': 'Separate eye-registered technical face appearance index, not identity likeness. Lighting, expression and 3D yaw remain differences. No calibrated pass threshold.'}
    code = 2
    try:
        config = json.loads(args.config.read_text())
        if config['version'] != VERSION or config['analysisSize'] != [160, 192] or config['targetEyes'] != [[52, 66], [108, 66]] or config['innerFaceOval'] != [22, 26, 138, 186] or PIL.__version__ != config['pillowVersion']:
            raise ValueError('Unknown frozen face configuration or Pillow version')
        if digest(args.reference) != config['sourceSha256']:
            raise ValueError('Reference source hash mismatch')
        source = Image.open(args.reference).convert('RGB')
        if source.size != tuple(config['sourceSize']):
            raise ValueError('Reference source dimensions mismatch')
        manifest = json.loads((args.model_dir / 'manifest.json').read_text())
        for role in ('woman', 'man'):
            face = config['people'][role]
            box = face['sourceCrop']
            if len(box) != 4 or not all(isinstance(v, int) for v in box) or not (0 <= box[0] < box[2] <= source.width and 0 <= box[1] < box[3] <= source.height):
                raise ValueError('Invalid native source crop')
            reference = source.crop(box)
            source_eyes = [[x - box[0], y - box[1]] for x, y in face['sourceEyes']]
            portrait = manifest['faceCameras'][role]
            if portrait['image'] != f'beauty-face-{role}.png' or portrait['resolution'] != [640, 800]:
                raise ValueError('Unexpected portrait camera provenance')
            path = args.model_dir / portrait['image']
            model = Image.open(path).convert('RGB')
            if model.size != (640, 800):
                raise ValueError('Unexpected portrait dimensions')
            measured, aligned = compare_face(reference, model, source_eyes, portrait['eyes'], config)
            measured.update(sourceCrop=box, nativeSourceSize=list(reference.size),
                            projectedEyeMeaning=portrait['anchorMeaning'], modelImageSha256=digest(path))
            report['people'][role] = measured
            save_panel(role, reference, model, aligned, args.output)
            for label, picture, anchors in (('reference', reference, source_eyes), ('model', model, portrait['eyes'])):
                overlay = picture.copy()
                draw = ImageDraw.Draw(overlay)
                radius = max(3, round(picture.width * .006))
                for index, (x, y) in enumerate(anchors):
                    color = 'red' if index == 0 else 'lime'
                    draw.line((x - radius, y, x + radius, y), fill=color, width=1)
                    draw.line((x, y - radius, x, y + radius), fill=color, width=1)
                overlay.save(args.output / f'{label}-face-{role}-anchors.png')
            shutil.copyfile(path, args.output / f'model-face-{role}.png')
            before = Image.open(args.model_dir / f'clay-face-{role}-control.png').convert('RGB')
            after = Image.open(args.model_dir / f'clay-face-{role}.png').convert('RGB')
            if before.size != after.size or before.size != (640, 800):
                raise ValueError('Invalid same-camera clay control views')
            panel = Image.new('RGB', (1280, 828), '#222222')
            draw = ImageDraw.Draw(panel)
            draw.text((10, 6), 'Same camera/light: body control L0', fill='white')
            draw.text((650, 6), 'Body Catmull-Clark L1; stubble hidden in both', fill='white')
            panel.paste(before, (0, 28)); panel.paste(after, (640, 28))
            panel.save(args.output / f'surface-control-{role}.png')
        report.update(status='measured', config=config, sourceSha256=digest(args.reference),
                      configSha256=digest(args.config), algorithmCodeSha256=digest(__file__),
                      modelManifestSha256=digest(args.model_dir / 'manifest.json'), pillowVersion=PIL.__version__,
                      surfaceDetail={c['role']: c['surfaceDetail'] for c in manifest['characters']})
        code = 0
    except (ValueError, KeyError, OSError, TypeError) as error:
        report.update(status='error', people={}, error=str(error))
    (args.output / 'face-metrics.json').write_text(json.dumps(report, indent=2, allow_nan=False) + '\n')
    lines = ['## Separate face inspection v1', '', report['meaning'], '']
    if report['status'] == 'measured':
        lines += ['| Person | Face technical index | Edge F1 diagnostic | Color MAE (0-255) |', '|---|---:|---:|---:|']
        for role, face in report['people'].items():
            lines.append(f"| {role} | {face['faceScorePercent']:.4f}% | {face['edgeF1Diagnostic']:.4f} | {face['colorMAE255Diagnostic']:.2f} |")
        lines += ['', 'Native reference crops are real existing pixels, not generated enlargements. Each face has its own analytical two-eye uniform scale/rotation/translation; no reflection, affine warp, color fitting or score search.', '', 'Rig eye-globe centres approximate iris centres. This is a separate versioned diagnostic; it does not change the whole-pair foreground metric or its80target.', '', 'Inspect native crops, aligned views/differences and same-camera L0/L1 clay controls. More vertices smooth contours, not reconstruct missing likeness.']
        for role, detail in report['surfaceDetail'].items():
            lines.append(f"- {role}: evaluated head vertices {detail['controlHeadVertices']} -> {detail['evaluatedHeadVertices']}; dense export body {detail['exportBakedVertices']} vertices.")
    else:
        lines += ['**ERROR: no valid face score**', '', report.get('error', 'Unknown error')]
    summary = '\n'.join(lines) + '\n'
    (args.output / 'face-summary.md').write_text(summary)
    print(summary)
    return code


if __name__ == '__main__':
    sys.exit(main())
