# SPDX-License-Identifier: GPL-3.0-or-later
"""Build the original procedural Neon Tinker robot without network services."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import random
import resource
import subprocess
import sys
import time

import bpy
from mathutils import Vector

START = time.monotonic()
MODEL = []


def material(name, color, metal=0, roughness=.3):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Metallic'].default_value = metal
    node.inputs['Roughness'].default_value = roughness
    return mat


def finish(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = True
    MODEL.append(obj)
    return obj


def orb(name, position, scale, mat, segments=24, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=position)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat)


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 8
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for bp, position in zip(spline.bezier_points, points):
        bp.co = position
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return finish(obj, name, mat)


def torus(name, position, major, minor, mat, rotation=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=32, minor_segments=8, location=position,
                                   major_radius=major, minor_radius=minor, rotation=rotation)
    return finish(bpy.context.object, name, mat)


def bolt(position, radius=.075):
    orb('Recessed screw', position, (radius, .035, radius), dark)
    x, y, z = position
    tube('Screw slot', [(x-radius*.5, y-.035, z-radius*.3), (x+radius*.5, y-.035, z+radius*.3)], .012, steel)


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def build():
    global steel, dark
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    steel = material('Warm brushed silver', (.54, .48, .38), .82, .26)
    edge = material('Polished silver edges', (.77, .75, .69), .9, .19)
    dark = material('Graphite recesses', (.014, .021, .035), .45, .3)
    white = material('Porcelain eye and teeth', (.93, .90, .77), .05, .2)
    black = material('Glossy pupils', (.002, .005, .012), .15, .12)
    pink = material('Candy magenta', (.95, .012, .34), .12, .17)
    cyan = material('Electric turquoise', (.006, .77, .72), .16, .18)
    violet = material('Grape violet', (.35, .014, .8), .15, .18)
    iris_mats = [cyan, violet]
    orb('Rounded head shell', (0, 0, 2.55), (1.24, .81, 1.04), steel, 48, 24)
    orb('Chest shell', (0, .07, .69), (.85, .48, .5), steel, 32, 16)
    for z in [1.18, 1.3, 1.42]:
        torus('Neck articulation', (0, 0, z), .25, .075, edge, (0, 0, 0))
    orb('Neck dark core', (0, 0, 1.3), (.24, .24, .31), dark)
    for side in [-1, 1]:
        orb('Shoulder joint', (side*.99, .02, .74), (.38, .38, .38), dark)
        orb('Shoulder armour', (side*1.04, -.02, .89), (.46, .42, .31), edge)
        orb('Upper arm', (side*1.22, 0, .39), (.27, .29, .4), steel)
        orb('Ear housing', (side*1.22, 0, 2.51), (.2, .38, .41), edge)
        orb('Ear candy inset', (side*1.32, -.12, 2.53), (.12, .3, .29), pink if side == -1 else cyan)
        for z in [.58, .87]:
            bolt((side*.65, -.4, z), .06)
    for index, (x, z, size) in enumerate([(-.49, 2.72, .47), (.5, 2.65, .40)]):
        orb('Eye socket dark gasket', (x, -.69, z), (size*1.17, .18, size*1.17), dark)
        ring = torus('Eye socket rim', (x, -.81, z), size*1.05, .055, edge)
        orb('Eyeball', (x, -.83, z), (size, .29, size), white, 32, 16)
        orb('Colored iris', (x+.035, -1.095, z+.01), (size*.54, .055, size*.57), iris_mats[index], 32, 16)
        orb('Pupil', (x+.035, -1.144, z+.01), (size*.28, .028, size*.32), black)
        orb('Eye catchlight', (x-.035, -1.17, z+.105), (.06, .015, .07), white, 16, 8)
        orb('Small catchlight', (x+.10, -1.17, z-.07), (.024, .012, .025), white, 12, 6)
    tube('Playful raised brow', [(-.95,-.77,3.10),(-.62,-.88,3.24),(-.2,-.8,3.11)], .085, edge)
    tube('Relaxed right brow', [(.15,-.93,2.99),(.51,-.98,3.03),(.88,-.8,2.94)], .095, steel)
    orb('Smile dark opening', (0,-.735,1.99), (.74,.17,.29), dark, 40, 16)
    tube('Smile lower chrome lip', [(-.71,-.78,2.03),(-.4,-.88,1.78),(0,-.91,1.72),(.42,-.87,1.83),(.7,-.77,2.07)], .065, edge)
    for i in range(7):
        x = (i-3)*.167
        z = 2.10 - .10*(1-(x/.6)**2)
        orb('Rounded smile tooth', (x,-.902,z), (.078,.055,.115), white, 16, 8)
    orb('Nose', (0,-.99,2.3), (.13,.13,.12), edge)
    for pos in [(-.92,-.59,3.15),(.92,-.59,3.12),(-.97,-.58,2.1),(.95,-.57,2.03),(0,-.64,1.63)]:
        bolt(pos)
    tube('Antenna stalk', [(-.9,0,3.25),(-1.02,.02,3.7)], .055, edge)
    for z in [3.37,3.47,3.57]:
        torus('Antenna collar',(-.97,.015,z), .075,.024,dark,(0,0,0))
    orb('Antenna tip',(-1.05,.02,3.8),(.14,.14,.14),edge)
    tube('Spoon handle',[(.72,.12,3.27),(1.03,.17,3.82)], .055, edge)
    spoon = orb('Spoon bowl',(1.12,.17,3.98),(.17,.055,.27),steel)
    spoon.rotation_euler[1] = .42
    # Separate glossy lobes and rounded drips retain a portable texture-free PBR appearance.
    for i, (x,y,z,s) in enumerate([(-.7,.05,3.35,.47),(-.25,0,3.52,.49),(.28,.06,3.49,.48),(.75,.08,3.32,.4),(-.4,.35,3.35,.43),(.4,.4,3.37,.4)]):
        orb('Candy crown lobe',(x,y,z),(s,.55*s,.3),[pink,cyan,violet][i%3])
    paths = [
        (pink,[(-.8,-.23,3.48),(-.99,-.49,3.18),(-1.05,-.57,2.81),(-1.10,-.56,2.38)],.10),
        (cyan,[(-.15,-.3,3.59),(.05,-.56,3.35),(.18,-.65,3.1),(.22,-.7,2.95)],.105),
        (pink,[(.18,-.32,3.55),(.4,-.56,3.36),(.65,-.59,3.33),(.87,-.54,3.17)],.12),
        (violet,[(.65,-.2,3.45),(.93,-.41,3.18),(1.04,-.49,2.94),(1.12,-.45,2.62)],.11),
        (cyan,[(1.06,.03,3.1),(1.24,-.13,2.83),(1.26,-.2,2.44),(1.22,-.28,2.15)],.10),
        (pink,[(-1.1,.03,3.1),(-1.29,-.1,2.72),(-1.32,-.14,2.31),(-1.27,-.2,2.01)],.095),
        (pink,[(-.4,-.36,3.52),(-.57,-.51,3.37),(-.3,-.63,3.31),(-.18,-.67,3.18)],.11),
        (violet,[(.22,.4,3.55),(.62,.67,3.2),(.88,.64,2.85),(1.04,.47,2.47)],.12),
        (cyan,[(-.91,-.2,1.02),(-1.08,-.34,.95),(-1.19,-.37,.76),(-1.2,-.35,.57)],.09),
        (pink,[(.85,-.1,1.12),(1.03,-.31,1.06),(1.2,-.35,.91),(1.26,-.33,.67)],.09),
    ]
    for mat, points, radius in paths:
        tube('Glossy candy drip', points,radius,mat)
        orb('Rounded drip tip',points[-1],(radius*1.12,radius*1.1,radius*1.4),mat,16,8)
    for i in range(16):
        angle = random.uniform(0,2*math.pi)
        x = random.uniform(-.9,.9)
        y = random.uniform(-.1,.4)
        z = 3.47 + random.uniform(0,.23)
        r = random.uniform(.07,.15)
        orb('Candy pearl',(x,y,z),(r,r,r),[pink,cyan,violet][i%3],16,8)
    for pos, mat in [((-.97,-.35,1.78),cyan),((1.18,-.3,1.84),pink),((.9,.1,3.7),violet)]:
        orb('Suspended candy droplet',pos,(.065,.065,.09),mat,16,8)
    return MODEL


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output',default='robot-output')
    parser.add_argument('--seed',type=int,default=27)
    parser.add_argument('--samples',type=int,default=32,choices=range(1,129))
    args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
    random.seed(args.seed)
    output = Path(args.output).resolve()
    output.mkdir(parents=True,exist_ok=True)
    models = build()
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=args.samples
    scene.cycles.use_denoising=True
    scene.render.resolution_x=scene.render.resolution_y=768
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.film_transparent=False
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.035,.055,.12,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
    try:
        scene.view_settings.view_transform='AgX'
    except TypeError:
        scene.view_settings.view_transform='Filmic'
    for name,pos,power,color,size in [('Key',(-3,-4,6),750,(1,.87,.7),4),('Fill',(3,-2,3.5),600,(.45,.8,1),3),('Rim',(1,3,5),1000,(1,.15,.6),3)]:
        data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
        obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=pos;look_at(obj,(0,0,2))
    bpy.ops.object.camera_add(location=(4,-10,4.5))
    camera=bpy.context.object;camera.name='Portrait camera';camera.data.type='ORTHO';camera.data.ortho_scale=4.85
    look_at(camera,(0,0,2.1));scene.camera=camera
    bpy.ops.object.select_all(action='DESELECT')
    for obj in models: obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(output/'robot.glb'),export_format='GLB',use_selection=True,export_cameras=False,export_lights=False,export_extras=False,export_animations=False)
    # Only the selected portable model enters GLB; the studio remains in the editable BLEND.
    bpy.ops.wm.save_as_mainfile(filepath=str(output/'robot.blend'))
    generation_seconds=time.monotonic()-START
    render_start=time.monotonic()
    scene.render.filepath=str(output/'robot.png')
    bpy.ops.render.render(write_still=True)
    try:
        commit=subprocess.check_output(['git','rev-parse','HEAD'],text=True,stderr=subprocess.DEVNULL).strip()
    except (OSError,subprocess.CalledProcessError):
        commit=os.getenv('GITHUB_SHA','unknown')
    triangles=sum(sum(len(p.vertices)-2 for p in obj.data.polygons) for obj in models)
    report={'schema':1,'generator':'Neon Tinker Stage A','seed':args.seed,'blender':bpy.app.version_string,'source_commit':commit,'generator_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'generation_seconds':round(generation_seconds,3),'render_seconds':round(time.monotonic()-render_start,3),'total_seconds':round(time.monotonic()-START,3),'peak_rss_kib':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,'samples':args.samples,'resolution':[768,768],'triangles_before_export':triangles,'objects':len(models),'audio':False,'stage':'A','license':'CC-BY-4.0','attribution':'Neon Tinker by kpok'}
    (output/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report))


if __name__=='__main__':
    main()
