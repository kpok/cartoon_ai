# SPDX-License-Identifier: GPL-3.0-or-later
"""Generate a standalone car GLB; Blender +X is forward, +Z is up."""
import argparse
import math
from pathlib import Path
import sys

import bpy


def material(name, color, metallic=0.0, roughness=0.45):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1.0)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return mat


def box(name, position, size, mat, bevel=0.04, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=position)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        modifier = obj.modifiers.new('Soft edges', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 2
        obj.modifiers.new('Normals', 'WEIGHTED_NORMAL')
    obj.parent = parent
    return obj


def generate(output):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    body = material('Crimson paint', (0.55, 0.018, 0.035), 0.55, 0.3)
    glass = material('Dark blue glass', (0.035, 0.13, 0.19), 0.3, 0.18)
    rubber = material('Rubber', (0.018, 0.022, 0.028), 0.0, 0.85)
    metal = material('Alloy', (0.45, 0.49, 0.55), 0.8, 0.25)
    white = material('Headlamp', (0.95, 0.87, 0.56))
    red = material('Tail lamp', (0.75, 0.005, 0.01))
    box('Body', (0, 0, 0.52), (3.6, 1.55, 0.54), body, 0.13)
    box('Cabin', (-0.2, 0, 1.0), (1.8, 1.32, 0.65), glass, 0.18)
    box('Roof', (-0.2, 0, 1.34), (1.45, 1.25, 0.08), body)
    for side in (-1, 1):
        box('Window pillar', (-0.1, side * 0.67, 1.03), (0.09, 0.04, 0.55), body, 0.01)
        box('Door handle', (-0.45, side * 0.79, 0.65), (0.22, 0.025, 0.04), metal, 0.01)
        box('Headlamp', (1.81, side * 0.52, 0.61), (0.04, 0.4, 0.15), white, 0.01)
        box('Tail lamp', (-1.81, side * 0.54, 0.61), (0.04, 0.3, 0.15), red, 0.01)
    for x, end in ((-1.12, 'Rear'), (1.12, 'Front')):
        for y, side in ((-0.78, 'Left'), (0.78, 'Right')):
            pivot = bpy.data.objects.new('Wheel_' + end + '_' + side, None)
            bpy.context.collection.objects.link(pivot)
            pivot.location = (x, y, 0.34)
            bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.34, depth=0.22,
                                               rotation=(math.pi / 2, 0, 0))
            tire = bpy.context.object
            tire.name = 'Tire'
            tire.data.materials.append(rubber)
            tire.parent = pivot
            tire.location = (0, 0, 0)
            # Spokes make wheel rotation legible; pivots export on the axle.
            for angle in range(0, 360, 60):
                spoke = box('Spoke', (0, 0, 0), (0.46, 0.025, 0.045), metal, 0.01, pivot)
                spoke.location = (0, 0.12 if y > 0 else -0.12, 0)
                spoke.rotation_euler.y = math.radians(angle)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', export_yup=True,
                              export_apply=True, export_cameras=False, export_lights=False)
    if output.stat().st_size > 2_000_000:
        raise RuntimeError('Car exceeds 2 MB budget')
    print('CAR_GENERATED', output.name, output.stat().st_size)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    generate(args.output.resolve())
