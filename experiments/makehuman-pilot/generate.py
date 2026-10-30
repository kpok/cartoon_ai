# SPDX-License-Identifier: GPL-3.0-or-later
"""Headless MPFB anatomical pilot. Invoke with Blender --background --python."""
import argparse
import importlib
import json
import math
from pathlib import Path
import sys
import time
import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--addon', required=True)
parser.add_argument('--assets', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('--samples', type=int, default=24)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
started = time.monotonic()
out = Path(args.output).resolve()
out.mkdir(parents=True, exist_ok=True)
assets = Path(args.assets).resolve()
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.preferences.extension_repo_add(name='Pilot MPFB', type='LOCAL', use_custom_directory=True, custom_directory=str(Path(args.addon).resolve()))
repo = list(bpy.context.preferences.extensions.repos)[-1]
module = 'bl_ext.' + repo.module + '.mpfb'
bpy.ops.preferences.addon_enable(module=module)
mpfb = importlib.import_module(module)
mpfb.set_preference('mpfb_second_root', str(assets))
importlib.import_module(module + '.services.locationservice').LocationService.update_second_root()
Human = importlib.import_module(module + '.services.humanservice').HumanService
Target = importlib.import_module(module + '.services.targetservice').TargetService
macro = Target.get_default_macro_info_dict()
macro.update(gender=1.0, age=.35, muscle=.55, weight=.43)
base = Human.create_human(macro_detail_dict=macro)
rig = Human.add_builtin_rig(base, 'default')
selected = ['eyes/low-poly/low-poly.mhclo', 'eyebrows/eyebrow001/eyebrow001.mhclo', 'eyelashes/eyelashes01/eyelashes01.mhclo', 'hair/short02/short02.mhclo', 'clothes/male_casualsuit01/male_casualsuit01.mhclo', 'clothes/shoes01/shoes01.mhclo']
skin = 'skins/young_caucasian_male/young_caucasian_male.mhmat'
Human.set_character_skin(str(assets / skin), base, skin_type='MAKESKIN')
for relative in selected:
    path = assets / relative
    if not path.is_file():
        raise FileNotFoundError(path)
    Human.add_mhclo_asset(str(path), base, subdiv_levels=1, material_type='MAKESKIN')
characters = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
for obj in characters:
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
bpy.context.view_layer.update()
points = [obj.matrix_world @ Vector(corner) for obj in characters for corner in obj.bound_box]
minimum = Vector(tuple(min(p[i] for p in points) for i in range(3)))
maximum = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (minimum + maximum) / 2
height = maximum.z - minimum.z
if not .5 < height < 30:
    raise RuntimeError('Unexpected character bounds')
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.render.resolution_x = 640
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.16, .16, .16)
scene.view_settings.view_transform = 'AgX'
def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.camera_add(location=center + Vector((0, -height * 2, 0)))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = height * 1.18
scene.camera = camera
for location, power, size in [((-1, -1, 1.5), 100, 1), ((1, -.5, .8), 60, 1), ((0, 1, 1.2), 80, .8)]:
    bpy.ops.object.light_add(type='AREA', location=center + Vector(location) * height)
    light = bpy.context.object
    light.data.energy = power * height * height
    light.data.shape = 'DISK'
    light.data.size = size * height
    aim(light, center)
clay = bpy.data.materials.new('Clay inspection')
clay.diffuse_color = (.45, .45, .45, 1)
clay.use_nodes = True
clay.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value = (.45, .45, .45, 1)
for style in ('beauty', 'clay'):
    scene.view_layers[0].material_override = clay if style == 'clay' else None
    for name, angle in [('front', 0), ('three-quarter', 45), ('side', 90), ('back', 180)]:
        rad = math.radians(angle)
        camera.location = center + Vector((math.sin(rad), -math.cos(rad), 0)) * height * 2
        aim(camera, center)
        scene.render.filepath = str(out / (style + '-' + name + '.png'))
        bpy.ops.render.render(write_still=True)
scene.view_layers[0].material_override = None
for image in bpy.data.images:
    if image.source == 'FILE' and image.has_data:
        image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'makehuman-pilot.blend'))
bpy.ops.object.select_all(action='DESELECT')
for obj in characters:
    obj.select_set(True)
rig.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out / 'makehuman-pilot.glb'), export_format='GLB', use_selection=True, export_animations=False)
manifest = {'pilot': 'Single MPFB male; not a reconstruction of the reference couple', 'blender': bpy.app.version_string, 'sourceVertices': len(base.data.vertices), 'rigBones': len(rig.data.bones), 'meshCount': len(characters), 'assets': [skin] + selected, 'seconds': round(time.monotonic() - started, 2), 'device': 'CPU', 'samples': args.samples, 'views': ['front', 'three-quarter', 'side', 'back']}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
