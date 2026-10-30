"""Reference similarity v2 with fixed paired crop: RGB block SSIM (70%) and tolerant edge F1 (30%)."""
import argparse
import hashlib
import json
import os
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat

ROOT = Path(__file__).parent
SIZE = (256, 384)
EXPECTED_SIZE = (1024, 1536)
THRESHOLD = 80.0
FRAMING = json.loads((ROOT/'reference/framing.json').read_text())


def ssim(left, right):
    scores = []
    for a, b in zip(left.split(), right.split()):
        for y in range(0, left.height, 8):
            for x in range(0, left.width, 8):
                box = (x, y, x+8, y+8)
                aa, bb = list(a.crop(box).tobytes()), list(b.crop(box).tobytes())
                ma, mb = sum(aa)/64, sum(bb)/64
                va = sum((v-ma)**2 for v in aa)/64
                vb = sum((v-mb)**2 for v in bb)/64
                cov = sum((u-ma)*(v-mb) for u, v in zip(aa, bb))/64
                scores.append(((2*ma*mb+6.5025)*(2*cov+58.5225))/((ma*ma+mb*mb+6.5025)*(va+vb+58.5225)))
    return max(0.0, min(1.0, sum(scores)/len(scores)))


def edges(image):
    edge = image.convert('L').filter(ImageFilter.FIND_EDGES).point(lambda p: 255 if p >= 40 else 0)
    # FIND_EDGES adds a spurious outer frame; exclude it from the metric.
    ImageDraw.Draw(edge).rectangle((0, 0, edge.width-1, edge.height-1), outline=0, width=1)
    return edge


def edge_f1(a, b):
    a, b = edges(a), edges(b)
    ca, cb = sum(a.histogram()[1:]), sum(b.histogram()[1:])
    if not ca or not cb:
        return 0.0
    hit_a = sum(ImageChops.multiply(a, b.filter(ImageFilter.MaxFilter(3))).histogram()[1:])
    hit_b = sum(ImageChops.multiply(b, a.filter(ImageFilter.MaxFilter(3))).histogram()[1:])
    precision, recall = hit_a/ca, hit_b/cb
    return 2*precision*recall/(precision+recall) if precision+recall else 0.0


def similarity(reference, render, analysis_size=SIZE):
    if reference.size[0]*render.size[1] != reference.size[1]*render.size[0]:
        raise ValueError('Aspect ratios differ; image distortion is forbidden')
    a = reference.convert('RGB').resize(analysis_size, Image.Resampling.LANCZOS)
    b = render.convert('RGB').resize(analysis_size, Image.Resampling.LANCZOS)
    if min(sum(ImageStat.Stat(i).var)/3 for i in (a, b)) < 4:
        raise ValueError('Blank or near-flat image; invalid comparison')
    regions = {}
    width, height = analysis_size
    for name, box in [('fullFrame', (0, 0, width, height)), ('leftHalf', (0, 0, width//2, height)), ('rightHalf', (width//2, 0, width, height))]:
        aa, bb = a.crop(box), b.crop(box)
        structure, edge = ssim(aa, bb), edge_f1(aa, bb)
        regions[name] = {'ssim': structure, 'edgeF1': edge, 'scorePercent': 100*(.7*structure+.3*edge)}
    return {'regions': regions, 'scorePercent': min(r['scorePercent'] for r in regions.values())}


def framed_images(reference, render):
    if reference.size != EXPECTED_SIZE or render.size != EXPECTED_SIZE:
        raise ValueError('Both source and fixed-camera render must be 1024 x 1536')
    left, top, right, bottom = FRAMING['cropBox']
    width, height = FRAMING['analysisSize']
    if not (0 <= left < right <= EXPECTED_SIZE[0] and 0 <= top < bottom <= EXPECTED_SIZE[1]):
        raise ValueError('Invalid fixed crop bounds')
    if width % 16 or height % 8 or (right-left)*height != (bottom-top)*width:
        raise ValueError('Crop analysis must preserve aspect and complete SSIM blocks')
    return reference.crop(FRAMING['cropBox']), render.crop(FRAMING['cropBox'])


def passes_threshold(score):
    return score >= THRESHOLD


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reference', type=Path, default=ROOT/'reference/concept.png')
    parser.add_argument('--render', type=Path, default=ROOT/'output/render.png')
    parser.add_argument('--output', type=Path, default=ROOT/'output')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    result = {'algorithm': 'salsa-reference-v2-paired-crop', 'formula': 'min(fullFrame, leftHalf, rightHalf), each = 100 * (0.7 * RGB-block-SSIM + 0.3 * tolerant-edge-F1)', 'thresholdPercent': THRESHOLD, 'analysisSize': FRAMING['analysisSize'], 'framing': FRAMING, 'edgeThreshold': 40, 'edgeTolerancePixels': 1, 'ssimWindow': [8, 8], 'note': 'Technical full-frame image score, not identity or percent likeness. Background, lighting and framing affect it.'}
    try:
        reference, render = Image.open(args.reference).convert('RGB'), Image.open(args.render).convert('RGB')
        if reference.size != EXPECTED_SIZE or render.size != EXPECTED_SIZE:
            raise ValueError('Both source and fixed-camera render must be 1024 x 1536')
        result['legacyFullImageV1'] = similarity(reference, render)
        reference_crop, render_crop = framed_images(reference, render)
        result.update(similarity(reference_crop, render_crop, tuple(FRAMING['analysisSize'])))
        reference_crop.save(args.output/'reference-cropped.png')
        render_crop.save(args.output/'render-cropped.png')
        result['passed'] = passes_threshold(result['scorePercent'])
        result['croppedSha256'] = {name: hashlib.sha256((args.output/name).read_bytes()).hexdigest() for name in ['reference-cropped.png', 'render-cropped.png']}
        result['sha256'] = {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in [('reference', args.reference), ('render', args.render)]}
        baseline_note = ''
        if result['sha256']['reference'] == FRAMING['sourceSha256']:
            baseline = json.loads((ROOT/'reference/crop-baseline.json').read_text())
            if baseline['framing'] != FRAMING:
                raise ValueError('Crop baseline framing mismatch')
            result['sceneViewerSha256'] = hashlib.sha256((ROOT/'viewer.js').read_bytes()).hexdigest()
            result['cropBaseline'] = {'modelCommit': baseline['modelCommit'], 'scorePercent': baseline['scorePercent'], 'deltaPercentagePoints': result['scorePercent']-baseline['scorePercent']}
            baseline_note = f"Same-crop previous geometry: {baseline['scorePercent']:.4f}%; geometry delta: {result['scorePercent']-baseline['scorePercent']:+.4f} percentage points.\n\n"
        capture = args.render.parent/'capture.json'
        if capture.exists():
            result['capture'] = json.loads(capture.read_text())
        a, b = reference_crop.resize((416, 672)), render_crop.resize((416, 672))
        difference = ImageChops.difference(a, b)
        difference.save(args.output/'difference.png')
        panel = Image.new('RGB', (1248, 720), '#172028')
        draw = ImageDraw.Draw(panel)
        for n, (label, img) in enumerate([('REFERENCE', a), ('3D RENDER / FIXED CAMERA', b), ('ABSOLUTE RGB DIFFERENCE', difference)]):
            panel.paste(img, (416*n, 48))
            draw.text((416*n+16, 16), label, fill='white')
        draw.text((16, 32), f"Final score: {result['scorePercent']:.2f}% / required: 80% / {'PASS' if result['passed'] else 'FAIL'}", fill='white')
        panel.save(args.output/'reference-comparison.png')
        rows = ''.join(f"| {name} | {value['scorePercent']:.4f}% | {value['ssim']:.4f} | {value['edgeF1']:.4f} |\n" for name, value in result['regions'].items())
        summary = f"## Salsa reference comparison\n\n**{result['scorePercent']:.4f}% — {'PASS' if result['passed'] else 'FAIL'}** (required: ≥80%)\n\n| Region | Score | RGB SSIM | Edge F1 |\n|---|---:|---:|---:|\n{rows}\n{baseline_note}Each region = 100 × (0.7 × SSIM + 0.3 × edge F1). Final score is the minimum of full frame, left half and right half, to limit background/one-sided dominance.\n\nFixed paired crop v2: [80,24,912,1368], preserving aspect. Not directly comparable with previous full-image scores. Previous geometry is recorded separately as the crop baseline. Full-image v1 diagnostic: {result['legacyFullImageV1']['scorePercent']:.4f}%. Technical image similarity, not percent likeness. Background, lighting and framing affect the score. No automatic alignment or threshold tuning. See the artifact for the reference/render/difference panel, PNGs, hashes and camera settings.\n"
    except (OSError, ValueError) as error:
        result.update(passed=False, error=str(error))
        summary = f'## Salsa reference comparison\n\n**ERROR / FAIL** — {error}\n'
    (args.output/'metrics.json').write_text(json.dumps(result, indent=2)+'\n')
    (args.output/'summary.md').write_text(summary)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as stream:
            stream.write(summary)
    print(summary)
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
