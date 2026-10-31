"""Frozen foreground image score; a technical agreement index, not identity likeness."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import PIL
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
ROLES = ('woman', 'man')
VERSION = 'mpfb-foreground-v1'


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def reference_masks(config, image):
    if image.size != tuple(config['sourceSize']):
        raise ValueError('Unexpected reference dimensions')
    labels = Image.new('L', image.size)
    draw = ImageDraw.Draw(labels)
    if config['painterOrder'] != list(ROLES):
        raise ValueError('Unexpected annotation ownership order')
    for number, role in enumerate(ROLES, 1):
        person = config['people'][role]
        face = person['faceBox']
        if len(face) != 4 or not all(math.isfinite(value) for value in face) or not (0 <= face[0] < face[2] <= image.width and 0 <= face[1] < face[3] <= image.height):
            raise ValueError('Invalid reference face ROI')
        for points in person['polygons'] + person['holes']:
            if len(points) < 3 or any(len(p) != 2 or not all(math.isfinite(v) for v in p) or not (0 <= p[0] < image.width and 0 <= p[1] < image.height) for p in points):
                raise ValueError('Invalid reference polygon')
        for points in person['polygons']:
            draw.polygon([tuple(p) for p in points], fill=number)
        for points in person['holes']:
            draw.polygon([tuple(p) for p in points], fill=0)
    masks = {role: labels.point(lambda p, n=number: 255 if p == n else 0) for number, role in enumerate(ROLES, 1)}
    if any(mask.getbbox() is None for mask in masks.values()):
        raise ValueError('Reference annotation is missing a person')
    return masks


def render_masks(image, cutoff=128):
    if image.mode != 'RGBA':
        raise ValueError('Semantic render must have RGBA ownership/coverage')
    values = {role: [] for role in ROLES}
    for red, green, blue, alpha in image.getdata():
        visible = alpha >= cutoff
        if visible and (green > 2 or max(red, blue) < 16):
            raise ValueError('Invalid semantic render ID color')
        # Blue wins antialiased red/blue ties; ownership remains disjoint.
        values['woman'].append(255 if visible and red > blue else 0)
        values['man'].append(255 if visible and blue >= red else 0)
    result = {}
    for role in ROLES:
        result[role] = Image.new('L', image.size)
        result[role].putdata(values[role])
    return result


def union(masks):
    return ImageChops.lighter(masks['woman'], masks['man'])


def normalize(image, masks, size=(208, 336), margin=8):
    box = union(masks).getbbox()
    if box is None:
        return Image.new('RGB', size, (128, 128, 128)), {role: Image.new('L', size) for role in ROLES}, None
    width, height = box[2] - box[0], box[3] - box[1]
    scale = min((size[0] - 2 * margin) / width, (size[1] - 2 * margin) / height)
    tx = (size[0] - scale * width) / 2 - scale * box[0]
    ty = (size[1] - scale * height) / 2 - scale * box[1]
    inverse = (1 / scale, 0, -tx / scale, 0, 1 / scale, -ty / scale)
    # Remove the photographic background BEFORE resampling to prevent edge bleed.
    clean = Image.composite(image.convert('RGB'), Image.new('RGB', image.size, (128, 128, 128)), union(masks))
    normalized = clean.transform(size, Image.Transform.AFFINE, inverse, Image.Resampling.BICUBIC, fillcolor=(128, 128, 128))
    result = {role: mask.transform(size, Image.Transform.AFFINE, inverse, Image.Resampling.NEAREST, fillcolor=0) for role, mask in masks.items()}
    return normalized, result, {'bbox': list(box), 'uniformScale': scale, 'translation': [tx, ty], 'policy': 'one pair-wide foreground-bounds fit; no independent role or face alignment'}


def foreground_ssim(a, b, support, window=8):
    total, weight = 0.0, 0
    for y in range(0, a.height, window):
        for x in range(0, a.width, window):
            box = (x, y, min(x + window, a.width), min(y + window, a.height))
            included = [i for i, value in enumerate(support.crop(box).tobytes()) if value]
            n = len(included)
            if not n:
                continue
            for ca, cb in zip(a.crop(box).split(), b.crop(box).split()):
                va, vb = list(ca.tobytes()), list(cb.tobytes())
                aa, bb = [va[i] for i in included], [vb[i] for i in included]
                ma, mb = sum(aa) / n, sum(bb) / n
                variance_a = sum((v - ma) ** 2 for v in aa) / n
                variance_b = sum((v - mb) ** 2 for v in bb) / n
                covariance = sum((u - ma) * (v - mb) for u, v in zip(aa, bb)) / n
                score = ((2 * ma * mb + 6.5025) * (2 * covariance + 58.5225)) / ((ma * ma + mb * mb + 6.5025) * (variance_a + variance_b + 58.5225))
                total += n * score
                weight += n
    return max(0.0, min(1.0, total / weight)) if weight else 0.0


def edges(image, threshold=40):
    result = image.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda p: 255 if p >= threshold else 0)
    ImageDraw.Draw(result).rectangle((0, 0, image.width - 1, image.height - 1), outline=0, width=1)
    return result


def count(mask):
    return sum(mask.histogram()[1:])


def edge_f1(a, b):
    aa, bb = edges(a), edges(b)
    na, nb = count(aa), count(bb)
    if not na or not nb:
        return 0.0
    precision = count(ImageChops.multiply(aa, bb.filter(ImageFilter.MaxFilter(3)))) / na
    recall = count(ImageChops.multiply(bb, aa.filter(ImageFilter.MaxFilter(3)))) / nb
    return 2 * precision * recall / (precision + recall) if precision + recall else 0.0


def person_score(a, b, ma, mb):
    support = ImageChops.lighter(ma, mb)
    intersection = count(ImageChops.multiply(ma, mb))
    iou = intersection / count(support) if count(support) else 0.0
    neutral = Image.new('RGB', a.size, (128, 128, 128))
    aa, bb = Image.composite(a, neutral, ma), Image.composite(b, neutral, mb)
    structure = foreground_ssim(aa, bb, support)
    missing = ma.getbbox() is None or mb.getbbox() is None
    return {'silhouetteIoU': iou, 'foregroundRGBSSIM': structure, 'edgeF1Diagnostic': edge_f1(aa, bb),
            'scorePercent': 0.0 if missing else 100 * math.sqrt(iou * structure), 'missingCandidate': mb.getbbox() is None}


def evaluate(reference, render, reference_ownership, render_ownership, size=(208, 336), margin=8):
    if any(reference_ownership[role].getbbox() is None for role in ROLES):
        raise ValueError('Reference annotation is missing a person')
    a, ma, ta = normalize(reference, reference_ownership, size, margin)
    b, mb, tb = normalize(render, render_ownership, size, margin)
    people = {role: person_score(a, b, ma[role], mb[role]) for role in ROLES}
    return {'people': people, 'scorePercent': min(person['scorePercent'] for person in people.values()),
            'transforms': {'reference': ta, 'render': tb}}, (a, b, ma, mb)


def mask_rgb(masks):
    return Image.merge('RGB', (masks['woman'], Image.new('L', masks['woman'].size), masks['man']))


def report_images(reference, original_masks, normalized, config, output):
    a, b, ma, mb = normalized
    a.save(output / 'reference-normalized.png')
    b.save(output / 'render-normalized.png')
    overlay = Image.blend(reference.convert('RGB'), mask_rgb(original_masks), .40)
    overlay.save(output / 'reference-annotation.png')
    overlap = Image.merge('RGB', (union(ma), union(mb), ImageChops.multiply(union(ma), union(mb))))
    overlap.save(output / 'overlap.png')
    neutral = Image.new('RGB', a.size, (128, 128, 128))
    aa, bb = Image.composite(a, neutral, union(ma)), Image.composite(b, neutral, union(mb))
    difference = ImageChops.difference(aa, bb)
    difference.save(output / 'difference.png')
    panel = Image.new('RGB', (a.width * 5, a.height + 28), '#222222')
    draw = ImageDraw.Draw(panel)
    for index, (name, picture) in enumerate([('Reference', a), ('MPFB render', b), ('Reference IDs', mask_rgb(ma)), ('Render IDs', mask_rgb(mb)), ('Difference', difference)]):
        draw.text((index * a.width + 8, 7), name, fill='white')
        panel.paste(picture, (index * a.width, 28))
    panel.save(output / 'comparison.png')


def face_diagnostics(a, b, ma, mb, config, transform):
    result = {}
    scale, (tx, ty) = transform['uniformScale'], transform['translation']
    for role in ROLES:
        left, top, right, bottom = config['people'][role]['faceBox']
        box = (max(0, round(left * scale + tx)), max(0, round(top * scale + ty)), min(a.width, round(right * scale + tx)), min(a.height, round(bottom * scale + ty)))
        if box[0] >= box[2] or box[1] >= box[3]:
            raise ValueError('Face ROI outside canonical frame')
        result[role] = person_score(a.crop(box), b.crop(box), ma[role].crop(box), mb[role].crop(box))
        result[role]['referenceAnchoredBox'] = list(box)
        result[role]['note'] = 'Same pair transform and fixed reference ROI; includes pose/framing mismatch, not identity recognition. Excluded from headline.'
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--reference', type=Path, default=ROOT.parent / 'salsa-human-models/reference/concept-cropped.png')
    parser.add_argument('--config', type=Path, default=ROOT / 'comparison.json')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    result = {'algorithm': VERSION, 'status': 'error', 'scorePercent': None, 'passed': False,
              'meaning': 'Foreground technical image agreement; not percent identity likeness. New scale, not comparable with procedural34.1109%.',
              'thresholdMeaning': '80 is an aspirational engineering target, not a calibrated likeness probability.'}
    exit_code = 2
    try:
        config = json.loads(args.config.read_text())
        if config['version'] != VERSION or config['analysisSize'] != [208, 336] or config['margin'] != 8 or config['ssimWindow'] != 8 or config['alphaCutoff'] != 128 or config['edgeThreshold'] != 40 or config['edgeTolerance'] != 1 or config['thresholdPercent'] != 80:
            raise ValueError('Unrecognized frozen metric configuration')
        if PIL.__version__ != config['pillowVersion']:
            raise ValueError('Metric requires pinned Pillow version')
        if digest(args.reference) != config['sourceSha256']:
            raise ValueError('Reference source hash mismatch')
        reference = Image.open(args.reference).convert('RGB')
        render = Image.open(args.model_dir / 'beauty-front.png').convert('RGB')
        semantic = Image.open(args.model_dir / 'segmentation-front.png')
        if render.size != (640, 800) or semantic.size != render.size:
            raise ValueError('Unexpected render/semantic dimensions')
        manifest = json.loads((args.model_dir / 'manifest.json').read_text())
        if manifest['scene'] != 'salsa' or not manifest.get('semanticMask'):
            raise ValueError('Missing same-camera semantic provenance')
        reference_ownership = reference_masks(config, reference)
        render_ownership = render_masks(semantic, config['alphaCutoff'])
        measured, normalized = evaluate(reference, render, reference_ownership, render_ownership)
        result.update(measured)
        result['faceDiagnostics'] = face_diagnostics(*normalized, config, measured['transforms']['reference'])
        result.update(status='measured', thresholdPercent=80, passed=result['scorePercent'] >= 80,
                      config=config, pillowVersion=PIL.__version__, sha256={'reference': digest(args.reference), 'render': digest(args.model_dir / 'beauty-front.png'), 'semantic': digest(args.model_dir / 'segmentation-front.png'), 'config': digest(args.config), 'algorithmCode': digest(__file__)})
        report_images(reference, reference_ownership, normalized, config, args.output)
        exit_code = 0 if result['passed'] else 1
    except (ValueError, KeyError, OSError, TypeError) as error:
        result['error'] = str(error)
    (args.output / 'metrics.json').write_text(json.dumps(result, indent=2, allow_nan=False) + '\n')
    lines = ['## MPFB foreground comparison v1', '', result['meaning'], '', result['thresholdMeaning'], '']
    if result['status'] == 'measured':
        lines += [f"**Pair score: {result['scorePercent']:.4f}% — {'PASS' if result['passed'] else 'FAIL'} / target80**", '', '| Person | Score | Silhouette IoU | Foreground SSIM | Edge F1 diagnostic |', '|---|---:|---:|---:|---:|']
        for role, person in result['people'].items():
            lines.append(f"| {role} | {person['scorePercent']:.4f}% | {person['silhouetteIoU']:.4f} | {person['foregroundRGBSSIM']:.4f} | {person['edgeF1Diagnostic']:.4f} |")
        lines += ['', 'Headline = minimum person score; person =100sqrt(IoU*foregroundSSIM). Pure background is excluded.', '', 'Reference masks are manual approximations; inspect reference-annotation.png, especially hair/hands. One shared uniform transform per pair; no person/face alignment.', '', 'Face ROIs are diagnostic and use only the same reference pair transform. They are not face recognition and do not change the headline.']
        for role, face in result['faceDiagnostics'].items():
            lines.append(f"- {role} face ROI: foreground SSIM={face['foregroundRGBSSIM']:.4f}, edge F1={face['edgeF1Diagnostic']:.4f}")
    else:
        lines += ['**ERROR: no valid score**', '', result.get('error', 'Unknown error')]
    summary = '\n'.join(lines) + '\n'
    (args.output / 'summary.md').write_text(summary)
    print(summary)
    return exit_code


if __name__ == '__main__':
    sys.exit(main())
