"""Reference similarity v1: RGB block SSIM (70%) and tolerant edge F1 (30%)."""
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


def similarity(reference, render):
    if reference.size[0]*render.size[1] != reference.size[1]*render.size[0]:
        raise ValueError('Aspect ratios differ; image distortion is forbidden')
    a = reference.convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    b = render.convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    if min(sum(ImageStat.Stat(i).var)/3 for i in (a, b)) < 4:
        raise ValueError('Blank or near-flat image; invalid comparison')
    regions = {}
    for name, box in [('fullFrame', (0, 0, 256, 384)), ('leftHalf', (0, 0, 128, 384)), ('rightHalf', (128, 0, 256, 384))]:
        aa, bb = a.crop(box), b.crop(box)
        structure, edge = ssim(aa, bb), edge_f1(aa, bb)
        regions[name] = {'ssim': structure, 'edgeF1': edge, 'scorePercent': 100*(.7*structure+.3*edge)}
    return {'regions': regions, 'scorePercent': min(r['scorePercent'] for r in regions.values())}


def passes_threshold(score):
    return score >= THRESHOLD


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reference', type=Path, default=ROOT/'reference/concept.png')
    parser.add_argument('--render', type=Path, default=ROOT/'output/render.png')
    parser.add_argument('--output', type=Path, default=ROOT/'output')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    result = {'algorithm': 'salsa-reference-v1', 'formula': 'min(fullFrame, leftHalf, rightHalf), each = 100 * (0.7 * RGB-block-SSIM + 0.3 * tolerant-edge-F1)', 'thresholdPercent': THRESHOLD, 'analysisSize': SIZE, 'edgeThreshold': 40, 'edgeTolerancePixels': 1, 'ssimWindow': [8, 8], 'note': 'Technical full-frame image score, not identity or percent likeness. Background, lighting and framing affect it.'}
    try:
        reference, render = Image.open(args.reference).convert('RGB'), Image.open(args.render).convert('RGB')
        if reference.size != EXPECTED_SIZE or render.size != EXPECTED_SIZE:
            raise ValueError('Both source and fixed-camera render must be 1024 x 1536')
        result.update(similarity(reference, render))
        result['passed'] = passes_threshold(result['scorePercent'])
        result['sha256'] = {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in [('reference', args.reference), ('render', args.render)]}
        capture = args.render.parent/'capture.json'
        if capture.exists():
            result['capture'] = json.loads(capture.read_text())
        a, b = reference.resize((512, 768)), render.resize((512, 768))
        difference = ImageChops.difference(a, b)
        difference.save(args.output/'difference.png')
        panel = Image.new('RGB', (1536, 816), '#172028')
        draw = ImageDraw.Draw(panel)
        for n, (label, img) in enumerate([('REFERENCE', a), ('3D RENDER / FIXED CAMERA', b), ('ABSOLUTE RGB DIFFERENCE', difference)]):
            panel.paste(img, (512*n, 48))
            draw.text((512*n+16, 16), label, fill='white')
        draw.text((16, 32), f"Final score: {result['scorePercent']:.2f}% / required: 80% / {'PASS' if result['passed'] else 'FAIL'}", fill='white')
        panel.save(args.output/'reference-comparison.png')
        rows = ''.join(f"| {name} | {value['scorePercent']:.4f}% | {value['ssim']:.4f} | {value['edgeF1']:.4f} |\n" for name, value in result['regions'].items())
        summary = f"## Salsa reference comparison\n\n**{result['scorePercent']:.4f}% — {'PASS' if result['passed'] else 'FAIL'}** (required: ≥80%)\n\n| Region | Score | RGB SSIM | Edge F1 |\n|---|---:|---:|---:|\n{rows}\nEach region = 100 × (0.7 × SSIM + 0.3 × edge F1). Final score is the minimum of full frame, left half and right half, to limit background/one-sided dominance.\n\nTechnical full-frame image similarity, not percent likeness. Background, lighting and framing affect the score. No automatic alignment or threshold tuning. See the artifact for the reference/render/difference panel, PNGs, hashes and camera settings.\n"
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
