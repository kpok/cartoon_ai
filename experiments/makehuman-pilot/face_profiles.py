# SPDX-License-Identifier: GPL-3.0-or-later
"""Hand-tuned reference-inspired facial geometry; no photo textures or identity claim."""
import hashlib
from pathlib import Path
import random
import bpy
from mathutils import Vector

PROFILES = {
    'woman': {
        'head/head-oval': .30, 'chin/chin-width-decr': .20,
        'chin/chin-height-decr': .10, 'nose/nose-scale-depth-decr': .14,
        'nose/nose-scale-horiz-incr': .10, 'mouth/mouth-upperlip-volume-incr': .20,
        'mouth/mouth-lowerlip-volume-incr': .24, 'mouth/mouth-scale-horiz-incr': .12,
        'mouth/mouth-angles-up': .32, 'mouth/mouth-laugh-lines-in': .15,
        'eyebrows/eyebrows-angle-up': .15,
        'cheek/l-cheek-volume-incr': .16, 'cheek/r-cheek-volume-incr': .16,
        'cheek/l-cheek-bones-incr': .12, 'cheek/r-cheek-bones-incr': .12,
        'eyes/l-eye-corner2-up': .12, 'eyes/r-eye-corner2-up': .12,
    },
    'man': {
        'head/head-square': .24, 'chin/chin-bones-incr': .18,
        'chin/chin-prominent-incr': .18, 'chin/chin-width-incr': .12,
        'nose/nose-scale-vert-incr': .12, 'nose/nose-hump-incr': .08,
        'nose/nose-point-width-decr': .12, 'mouth/mouth-scale-horiz-incr': .18,
        'mouth/mouth-angles-up': .24, 'mouth/mouth-laugh-lines-in': .20,
        'cheek/l-cheek-volume-decr': .12, 'cheek/r-cheek-volume-decr': .12,
        'cheek/l-cheek-bones-incr': .14, 'cheek/r-cheek-bones-incr': .14,
        'eyebrows/eyebrows-trans-down': .08,
    },
}


def apply_profile(base, target_service, addon_root, role):
    root = Path(addon_root) / 'data' / 'targets'
    hashes = {}
    for relative, weight in PROFILES[role].items():
        path = root / (relative + '.target.gz')
        if not path.is_file():
            raise FileNotFoundError(path)
        target_service.load_target(base, str(path), weight=weight)
        hashes[relative] = hashlib.sha256(path.read_bytes()).hexdigest()
    bpy.context.view_layer.update()
    return {'targets': PROFILES[role], 'targetHashes': hashes,
            'description': 'Manually tuned from visible reference features; approximate likeness only'}


def add_stubble(base, rig, height, material):
    """Deterministic short geometry hairs attached to the anatomical head."""
    evaluated = base.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    eligible = [p for p in mesh.polygons if height * .87 < p.center.z < height * .925
                and p.center.y < -height * .05 and abs(p.center.x) < height * .10
                and not (abs(p.center.x) < height * .035 and p.center.z > height * .90)]
    if not eligible:
        evaluated.to_mesh_clear()
        raise RuntimeError('No anatomical beard surface found')
    randomizer = random.Random(101)
    vertices, faces = [], []
    for _ in range(900):
        polygon = randomizer.choice(eligible)
        triangle = [mesh.vertices[index].co for index in polygon.vertices[:3]]
        u, v = randomizer.random(), randomizer.random()
        if u + v > 1:
            u, v = 1 - u, 1 - v
        root = triangle[0] + u * (triangle[1] - triangle[0]) + v * (triangle[2] - triangle[0])
        normal = polygon.normal.normalized()
        tangent = normal.cross(Vector((0, 0, 1))).normalized()
        second = normal.cross(tangent).normalized()
        radius = height * .00020
        end = root + normal * height * randomizer.uniform(.0010, .0020)
        start = len(vertices)
        vertices.extend(tuple(root + axis * radius) for axis in (tangent, second, -tangent, -second))
        vertices.append(tuple(end))
        faces.extend((start + i, start + (i + 1) % 4, start + 4) for i in range(4))
    evaluated.to_mesh_clear()
    data = bpy.data.meshes.new('Short beard strands')
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new('stubble', data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material('Warm brown stubble', (.028, .016, .010), .9))
    obj.vertex_groups.new(name='head').add(list(range(len(vertices))), 1, 'REPLACE')
    obj.parent = rig
    modifier = obj.modifiers.new('Head attachment', 'ARMATURE')
    modifier.object = rig
    return obj
