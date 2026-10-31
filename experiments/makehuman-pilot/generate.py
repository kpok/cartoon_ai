# SPDX-License-Identifier: GPL-3.0-or-later
"""Headless MPFB anatomical pilot. Invoke with Blender --background --python."""
import argparse
import hashlib
import shutil
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
parser.add_argument('--scene', choices=('single', 'salsa'), default='single')
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
sys.path.insert(0, str(Path(__file__).resolve().parent))
from face_profiles import apply_profile, add_stubble
from pair_scene import fitted_dress, landmarks, material, partner_pose, world_points
def opaque(obj):
    for slot in obj.material_slots:
        material = slot.material
        if not material or not material.use_nodes:
            continue
        for node in material.node_tree.nodes:
            if node.type == 'BSDF_PRINCIPLED':
                alpha = node.inputs['Alpha']
                for link in list(alpha.links):
                    material.node_tree.links.remove(link)
                alpha.default_value = 1.0

rigs, inventory, selected, all_assets = {}, [], [], []
roles = ('woman', 'man') if args.scene == 'salsa' else ('man',)
for role in roles:
    macro = Target.get_default_macro_info_dict()
    macro.update(gender=0.0 if role == 'woman' else 1.0, age=.35, muscle=.40 if role == 'woman' else .55, weight=.43)
    if role == 'woman':
        macro['race'] = {'asian': .65, 'caucasian': .30, 'african': .05}
    before = set(bpy.context.scene.objects)
    base = Human.create_human(macro_detail_dict=macro)
    face_profile = apply_profile(base, Target, Path(importlib.import_module(module).__file__).parent, role) if args.scene == 'salsa' else None
    rig = Human.add_builtin_rig(base, 'default')
    skin = 'skins/young_' + ('asian_female/young_asian_female' if role == 'woman' else 'caucasian_male/young_caucasian_male') + '.mhmat'
    Human.set_character_skin(str(assets / skin), base, skin_type='MAKESKIN')
    opaque(base)
    required = ['eyes/low-poly/low-poly.mhclo', 'eyebrows/eyebrow001/eyebrow001.mhclo', 'eyelashes/eyelashes01/eyelashes01.mhclo',
                'hair/long01/long01.mhclo' if role == 'woman' else 'hair/short02/short02.mhclo',
                'clothes/shoes03/shoes03.mhclo']
    if role == 'man':
        required.append('clothes/male_casualsuit01/male_casualsuit01.mhclo')
    body_points = list(world_points([base]))
    raw_height = max(v.z for v in body_points) - min(v.z for v in body_points)
    for relative in required:
        path = assets / relative
        if not path.is_file():
            raise FileNotFoundError(path)
        fitted = Human.add_mhclo_asset(str(path), base, subdiv_levels=1, material_type='MAKESKIN')
        if relative.startswith('clothes/'):
            opaque(fitted)
        if args.scene == 'salsa' and 'male_casualsuit' in relative:
            fitted.data.materials.clear()
            fitted.data.materials.append(material('Navy shirt', (.009, .018, .045)))
            fitted.data.materials.append(material('Gray trousers', (.24, .25, .27)))
            for polygon in fitted.data.polygons:
                polygon.material_index = 0 if polygon.center.z > raw_height * .55 else 1
    if role == 'woman':
        fitted_dress(base, rig, raw_height)
    elif args.scene == 'salsa':
        add_stubble(base, rig, raw_height, material)
    meshes = [obj for obj in bpy.context.scene.objects if obj not in before and obj.type == 'MESH']
    rig.name = role + '_Rig'
    for index, obj in enumerate(meshes):
        obj.name = role + '_' + ('body' if obj == base else obj.name.split('.')[-1])
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    if args.scene == 'salsa':
        rig.scale = (1.62 / raw_height,) * 3 if role == 'woman' else (1.80 / raw_height,) * 3
        partner_pose(rig, raw_height, -.10 if role == 'woman' else .27, role)
    rigs[role] = rig
    all_assets.extend([skin] + required)
    inventory.append({'role': role, 'faceProfile': face_profile, 'rig': rig.name, 'rigBones': len(rig.data.bones), 'sourceVertices': len(base.data.vertices), 'meshes': [obj.name for obj in meshes], 'assets': [skin] + required, 'generatedGarments': ['fitted emerald dress'] if role == 'woman' else [], 'generatedDetails': ['900 short beard strands'] if args.scene == 'salsa' and role == 'man' else []})
characters = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
bpy.context.view_layer.update()
points = list(world_points(characters))
minimum = Vector(tuple(min(p[i] for p in points) for i in range(3)))
maximum = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (minimum + maximum) / 2
height = maximum.z - minimum.z
width = maximum.x - minimum.x
if not .5 < height < 30:
    raise RuntimeError('Unexpected character bounds')
expected_landmarks = landmarks(rigs)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.render.resolution_x = 640
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world.color = (.16, .16, .16) if args.scene == 'single' else (.20, .15, .10)
scene.view_settings.view_transform = 'AgX'
def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z', 'Y').to_euler()
bpy.ops.object.camera_add(location=center + Vector((0, -height * 2, 0)))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = max(height, width / .8) * 1.16
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
framing = {}
from bpy_extras.object_utils import world_to_camera_view
for style in ('beauty', 'clay'):
    scene.view_layers[0].material_override = clay if style == 'clay' else None
    for name, angle in [('front', 0), ('three-quarter', 45), ('side', 90), ('back', 180)]:
        rad = math.radians(angle)
        camera.location = center + Vector((math.sin(rad), -math.cos(rad), 0)) * height * 2
        aim(camera, center)
        bpy.context.view_layer.update()
        if style == 'beauty':
            projected = [world_to_camera_view(scene, camera, point) for point in points]
            framing[name] = {'minX': min(p.x for p in projected), 'maxX': max(p.x for p in projected), 'minY': min(p.y for p in projected), 'maxY': max(p.y for p in projected)}
        scene.render.filepath = str(out / (style + '-' + name + '.png'))
        bpy.ops.render.render(write_still=True)
# Dedicated face inspection views are generated by the same geometry renderer.
if args.scene == 'salsa':
    for role in roles:
        target = Vector(expected_landmarks[role]['head']) + Vector((0, -.02, height * .045))
        camera.location = target + Vector((0, -height * 2, 0))
        aim(camera, target)
        camera.data.ortho_scale = height * .28
        for style in ('beauty', 'clay'):
            scene.view_layers[0].material_override = clay if style == 'clay' else None
            scene.render.filepath = str(out / (style + '-face-' + role + '.png'))
            bpy.ops.render.render(write_still=True)
    camera.data.ortho_scale = max(height, width / .8) * 1.16
scene.view_layers[0].material_override = None
camera.location = center + Vector((0, -height * 2, 0))
aim(camera, center)
for image in bpy.data.images:
    if image.source == 'FILE' and image.has_data:
        image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'makehuman-pilot.blend'))
bpy.ops.object.select_all(action='DESELECT')
for obj in characters:
    obj.select_set(True)
for rig in rigs.values():
    rig.select_set(True)
source_vertices = sum(c['sourceVertices'] for c in inventory)
rig_bones = sum(c['rigBones'] for c in inventory)
bpy.ops.export_scene.gltf(filepath=str(out / 'makehuman-pilot.glb'), export_format='GLB', use_selection=True, export_animations=False, export_current_frame=True, export_rest_position_armature=False)
# Verify the exported file opens in a fresh scene rather than trusting export alone.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(out / 'makehuman-pilot.glb'))
if len([obj for obj in bpy.context.scene.objects if obj.type == 'MESH']) < 6:
    raise RuntimeError('GLB roundtrip lost character meshes')
imported_rigs = {}
for role in roles:
    candidates = [obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE' and obj.name.startswith(role + '_')]
    if len(candidates) != 1:
        raise RuntimeError('GLB roundtrip lost distinct rig: ' + role)
    imported_rigs[role] = candidates[0]
actual_landmarks = landmarks(imported_rigs)
landmark_error = max((Vector(expected_landmarks[role][name]) - Vector(actual_landmarks[role][name])).length for role in roles for name in expected_landmarks[role])
if landmark_error > height * .005:
    raise RuntimeError('GLB roundtrip changed pose: ' + str(landmark_error))
shutil.copyfile(Path(__file__).with_name('README.md'), out / 'README.md')
shutil.copyfile(Path(__file__).with_name('inputs.lock.json'), out / 'inputs.lock.json')
manifest = {'pilot': 'Static anatomical pair approximation' if args.scene == 'salsa' else 'Single MPFB male; not a reconstruction of the reference couple', 'scene': args.scene, 'characters': inventory, 'framing': framing, 'poseLandmarks': expected_landmarks, 'roundtripPoseMaxError': landmark_error, 'height': height, 'blender': bpy.app.version_string, 'sourceVertices': source_vertices, 'rigBones': rig_bones, 'meshCount': len(characters), 'assets': sorted(set(all_assets)), 'assetHashes': {relative: hashlib.sha256((assets / relative).read_bytes()).hexdigest() for relative in sorted(set(all_assets))}, 'glbRoundtrip': True, 'seconds': round(time.monotonic() - started, 2), 'device': 'CPU', 'samples': args.samples, 'views': ['front', 'three-quarter', 'side', 'back']}
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
