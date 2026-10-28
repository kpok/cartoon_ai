# SPDX-License-Identifier: GPL-3.0-or-later
"""Run inside Blender: verify compact full-body proportions and preserved bust geometry."""
from pathlib import Path
import random
import runpy

from mathutils import Vector

source = Path(__file__).with_name('generator.py')
generator = runpy.run_path(str(source))
random.seed(27)
bust = generator['build']('bust')

def snapshot(objects):
    return {obj.name: (tuple(obj.location), tuple(obj.dimensions), len(obj.data.vertices), len(obj.data.polygons)) for obj in objects}

original = snapshot(bust)
random.seed(27)
humanoid = generator['build']('humanoid')
current = snapshot(humanoid)
for name, geometry in original.items():
    assert current[name] == geometry, f'Existing bust changed: {name}'
for side in ['Left', 'Right']:
    for part in ['hip joint', 'short thigh', 'knee joint', 'short shin', 'ankle joint', 'rounded foot', 'sole']:
        assert f'{side} {part}' in current, f'Missing {side} {part}'
objects = {obj.name: obj for obj in humanoid}
head_width = objects['Rounded head shell'].dimensions.x
feet = [objects[f'{side} rounded foot'] for side in ['Left', 'Right']]
assert all(foot.dimensions.x < head_width / 4 for foot in feet), 'Feet are too wide for oversized head'
# A leg, hip to sole, stays comparable to the approved short arm, shoulder to arm end.
arm = objects['Upper arm']
arm_length = objects['Shoulder armour'].location.z + objects['Shoulder armour'].dimensions.z / 2 - (arm.location.z - arm.dimensions.z / 2)
leg_length = objects['Left hip joint'].location.z - (objects['Left sole'].location.z - objects['Left sole'].dimensions.z / 2)
assert .65 <= leg_length / arm_length <= 1.2, 'Legs must remain approximately arm-sized'
triangles = sum(sum(len(p.vertices) - 2 for p in obj.data.polygons) for obj in humanoid)
assert triangles <= 100000, 'Mobile triangle budget exceeded'
lowest = min((obj.matrix_world @ Vector(corner)).z for obj in humanoid for corner in obj.bound_box)
assert lowest < -.9, 'Full body did not extend beneath original bust'
print(f'Humanoid geometry passed: preserved {len(original)} bust meshes; {len(humanoid)} total; {triangles} triangles; leg/arm ratio {leg_length / arm_length:.2f}')
