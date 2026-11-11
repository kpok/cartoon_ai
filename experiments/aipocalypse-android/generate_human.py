# SPDX-License-Identifier: GPL-3.0-or-later
"""Generate a skinned adult and deterministic five-second phone gesture."""
import argparse
import math
from pathlib import Path
import sys
from mathutils import Vector
import bpy

sys.path.insert(0,str(Path(__file__).resolve().parent))
from human_shapes import limbs, shaped_head, finger_curve
from human_motion import POSES, EXPRESSION


def generate(output, role):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    female = role == 'astronaut'
    def mat(name, color):
        material = bpy.data.materials.new(name)
        material.diffuse_color = (*color, 1)
        material.use_nodes = True
        material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*color, 1)
        material.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.7
        return material
    skin = mat('Skin', (0.52, 0.32, 0.22))
    cloth = mat('Workwear', (0.04, 0.12, 0.23) if female else (0.85, 0.16, 0.025))
    dark = mat('Boots and trim', (0.035, 0.045, 0.06))
    reflective = mat('Reflective bands', (0.56, 0.61, 0.63))
    hair = mat('Hair', (0.055, 0.035, 0.025))
    eye = mat('Eyes', (0.055, 0.065, 0.07))
    white = mat('Eye whites', (0.74, 0.72, 0.68))
    bone_specs = {
        'root': ((0,0,0.9),(0,0,1.02),None),
        'spine': ((0,0,1.02),(0,0,1.43),'root'),
        'head': ((0,0,1.43),(0,0,1.77),'spine'),
    }
    for side, sign in [('right',1),('left',-1)]:
        bone_specs.update({
            side+'_upper_arm': ((sign*0.23,0,1.43),(sign*0.29,0,1.13),'spine'),
            side+'_forearm': ((sign*0.29,0,1.13),(sign*0.29,0,0.88),side+'_upper_arm'),
            side+'_hand': ((sign*0.29,0,0.88),(sign*0.29,0,0.77),side+'_forearm'),
            side+'_thigh': ((sign*0.10,0,0.94),(sign*0.10,0,0.53),'root'),
            side+'_shin': ((sign*0.10,0,0.53),(sign*0.10,0,0.12),side+'_thigh'),
            side+'_foot': ((sign*0.10,0,0.12),(sign*0.10,-0.16,0.07),side+'_shin'),
        })
    armature = bpy.data.armatures.new('HumanRig')
    rig = bpy.data.objects.new('HumanRig', armature)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for name,(head,tail,parent) in bone_specs.items():
        bone = armature.edit_bones.new(name)
        bone.head, bone.tail = head, tail
        if parent: bone.parent = armature.edit_bones[parent]
        if 'arm' in name or 'hand' in name:
            bone.align_roll(Vector((0,-1,0)))
    bpy.ops.object.mode_set(mode='OBJECT')

    def bind(obj, name, material, bone):
        obj.name = name
        obj.data.materials.append(material)
        group = obj.vertex_groups.new(name=bone)
        group.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
        modifier = obj.modifiers.new('Armature', 'ARMATURE')
        modifier.object = rig
        obj.parent = rig
        for polygon in obj.data.polygons: polygon.use_smooth = True
        return obj
    def oval(name, center, scale, material, bone):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=center)
        obj = bpy.context.object
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        return bind(obj,name,material,bone)
    def limb(name, start, end, radius, material, bone):
        start,end=Vector(start),Vector(end)
        obj=oval(name,(start+end)/2,(radius,radius,(end-start).length/2+radius*0.25),material,bone)
        obj.rotation_euler=(end-start).to_track_quat('Z','Y').to_euler()
        return obj
    # A continuous tapered garment avoids disconnected ellipsoids at the shoulders/waist.
    rings = [(0.90,0.17,0.115),(1.05,0.18,0.125),(1.08,0.185,0.127),
             (1.105,0.19,0.128),(1.26,0.215,0.13),(1.40,0.23,0.12),(1.47,0.17,0.09)]
    vertices=[]
    for z,width,depth in rings:
        for index in range(24):
            angle=2*math.pi*index/24
            vertices.append((width*(0.91 if female else 1)*math.cos(angle),depth*math.sin(angle),z))
    faces=[]
    for row in range(len(rings)-1):
        for index in range(24):
            next_index=(index+1)%24
            faces.append((row*24+index,row*24+next_index,(row+1)*24+next_index,(row+1)*24+index))
    faces += [tuple(reversed(range(24))),tuple((len(rings)-1)*24+i for i in range(24))]
    mesh=bpy.data.meshes.new('JacketMesh')
    mesh.from_pydata(vertices,[],faces)
    obj=bpy.data.objects.new('Jacket',mesh)
    bpy.context.collection.objects.link(obj)
    bind(obj,'Jacket',cloth,'spine')
    obj.data.materials.append(reflective)
    obj.data.materials.append(dark)
    if not female:
        for polygon in obj.data.polygons:
            if polygon.index//24==2:polygon.material_index=1
            if polygon.index//24==5:polygon.material_index=2
    oval('Pelvis',(0,0,0.96),(0.16,0.115,0.13),cloth,'root')
    oval('Neck',(0,0,1.48),(0.065,0.06,0.085),skin,'head')
    shaped_head(rig,skin,hair)
    if female: oval('Hair bun',(0,0.10,1.70),(0.06,0.05,0.055),hair,'head')
    oval('Nose bridge',(0,-0.101,1.657),(0.015,0.017,0.030),skin,'head')
    oval('Nose tip',(0,-0.116,1.64),(0.019,0.015,0.014),skin,'head')
    oval('Mouth',(0,-0.09,1.587),(0.029,0.005,0.003),dark,'head')
    for sign in (-1,1):
        oval('Eye white',(sign*0.043,-0.089,1.68),(0.019,0.009,0.009),white,'head')
        oval('Pupil',(sign*0.043+0.002,-0.099,1.678),(0.0065,0.004,0.007),eye,'head')
        oval('Upper eyelid',(sign*0.043,-0.096,1.688),(0.022,0.007,0.004),skin,'head')
        oval('Brow',(sign*0.043,-0.089,1.705),(0.03,0.012,0.006),hair,'head')
        oval('Ear',(sign*0.106,0,1.65),(0.017,0.025,0.04),skin,'head')
    for side, sign in [('right',1),('left',-1)]:
        limbs(rig,side,sign,cloth,reflective,female)
        oval('Boot',(sign*0.10,-0.05,0.075),(0.075,0.135,0.075),dark,side+'_foot')
        oval('Palm',(sign*0.29,-0.002,0.835),(0.042,0.024,0.052),skin,side+'_hand')
        for finger in range(4):
            x=sign*0.29+(finger-1.5)*0.017
            if side=='right':
                finger_curve(rig,'Grip finger',[
                    ((x,-0.012,0.803),0.0075),((x,-0.027,0.775),0.007),
                    ((x,-0.052,0.762),0.0068),((x,-0.065,0.775),0.0067),
                    ((x,-0.065,0.802),0.0035)],skin,side+'_hand')
            else:
                oval('Finger',(x,-0.005,0.78),(0.009,0.016,0.045),skin,side+'_hand')
        if side=='right':
            finger_curve(rig,'Grip thumb',[
                ((0.337,-0.015,0.855),0.011),((0.333,-0.040,0.852),0.010),
                ((0.329,-0.059,0.845),0.008),((0.326,-0.061,0.835),0.004)],skin,side+'_hand')
        else:
            oval('Thumb',(sign*0.337,-0.018,0.835),(0.013,0.023,0.033),skin,side+'_hand')

    def detail_box(name,center,size,material,bone):
        bpy.ops.mesh.primitive_cube_add(size=1,location=center)
        obj=bpy.context.object
        obj.dimensions=size
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        bind(obj,name,material,bone)
        for polygon in obj.data.polygons:polygon.use_smooth=False
    for sign in (-1,1):
        detail_box('Chest pocket',(sign*0.10,-0.121,1.26),(0.075,0.018,0.095),cloth,'spine')
        detail_box('Pocket flap',(sign*0.10,-0.133,1.30),(0.081,0.01,0.018),dark,'spine')
        detail_box('Cargo pocket',(sign*0.165,-0.012,0.77),(0.035,0.115,0.115),cloth,('right' if sign>0 else 'left')+'_thigh')
        detail_box('Boot sole',(sign*0.10,-0.05,0.023),(0.15,0.25,0.035),dark,('right' if sign>0 else 'left')+'_foot')
    detail_box('Jacket zipper',(0,-0.135,1.26),(0.006,0.009,0.29),dark,'spine')
    bpy.ops.mesh.primitive_torus_add(major_radius=0.067,minor_radius=0.012,major_segments=32,minor_segments=8,location=(0,0,1.465))
    bind(bpy.context.object,'Collar',dark,'spine')

    bpy.context.scene.render.fps=24
    bpy.context.scene.frame_start=0
    bpy.context.scene.frame_end=120
    rig.animation_data_create()
    rig.animation_data.action=bpy.data.actions.new('PhoneGesture')
    for frame,values in POSES:
        upper,forearm,wrist,pitch,yaw,spine,shoulder=values
        rotations={'right_upper_arm':(upper,0,0),'right_forearm':(forearm,0,0),
                   'right_hand':(wrist,0,0),'head':(pitch,yaw,0),
                   'spine':(spine,0,0),'left_upper_arm':(shoulder,0,0)}
        for name,rotation in rotations.items():
            bone=rig.pose.bones[name]
            bone.rotation_mode='XYZ'
            bone.rotation_euler=rotation
            bone.keyframe_insert(data_path='rotation_euler',frame=frame)
    for curve in rig.animation_data.action.fcurves:
        for point in curve.keyframe_points:point.interpolation='LINEAR'
    output.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',export_yup=True,
                              export_animations=True,export_frame_range=True,export_force_sampling=True,
                              export_cameras=False,export_lights=False)
    if output.stat().st_size>3_000_000:raise RuntimeError('Human GLB exceeds3MB')
    print('HUMAN_GENERATED',role,output.stat().st_size)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--role',choices=['paramedic','astronaut'],required=True)
    args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
    generate(args.output.resolve(),args.role)
