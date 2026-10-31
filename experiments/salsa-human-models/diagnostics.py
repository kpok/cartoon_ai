"""Coarse render regression and color/foreground diagnostics; never an identity score."""
import json
import sys
from pathlib import Path
from PIL import Image
root = Path(__file__).parent
samples = {}
for view in ('front', 'side', 'rear'):
    image = Image.open(root / 'output' / f'{view}.png').convert('RGB')
    small = image.resize((16, 24), Image.Resampling.BOX)
    samples[view] = list(small.getdata())
    pixels = list(image.getdata())
    # Heuristic palette occupancy includes lighting and excludes neutral background/floor.
    emerald = sum(g > r * 1.15 and g > b * 1.05 for r, g, b in pixels)
    navy = sum(b > r * 1.15 and b > g * 1.05 and b < 130 for r, g, b in pixels)
    print(view, json.dumps({'emeraldPixelFraction': emerald / len(pixels), 'navyPixelFraction': navy / len(pixels)}))
baseline = root / 'regression.json'
if '--update' in sys.argv:
    baseline.write_text(json.dumps(samples))
else:
    expected = json.loads(baseline.read_text())
    for view, actual in samples.items():
        error = sum(abs(a-b) for x,y in zip(actual, expected[view]) for a,b in zip(x,y)) / (16*24*3)
        print(view, 'mean absolute RGB error:', round(error, 3))
        assert error < 3, f'{view}: render regression; inspect before updating baseline'
