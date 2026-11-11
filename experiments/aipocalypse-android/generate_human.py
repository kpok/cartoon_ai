# SPDX-License-Identifier: GPL-3.0-or-later
"""Generate a skinned adult and deterministic five-second phone gesture."""
import argparse
import math
from pathlib import Path
import sys
from mathutils import Vector
import bpy


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
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=1, location=center)
        obj = bpy.context.object
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        return bind(obj,name,material,bone)
    def limb(name, start, end, radius, material, bone):
        start,end=Vector(start),Vector(end)
        obj=oval(name,(start+end)/2,(radius,radius,(end-start).length/2+radius*0.25),material,bone)
        obj.rotation_euler=(end-start).to_track_quat('Z','Y').to_euler()
        return obj
    oval('Torso',(0,0,1.23),(0.225 if not female else 0.20,0.125,0.26),cloth,'spine')
    oval('Pelvis',(0,0,0.96),(0.16,0.115,0.13),cloth,'root')
    oval('Neck',(0,0,1.48),(0.065,0.06,0.085),skin,'head')
    oval('Face',(0,-0.012,1.65),(0.106,0.09,0.14),skin,'head')
    oval('Hair cap',(0,0.018,1.72),(0.109,0.083,0.09),hair,'head')
    if female: oval('Hair bun',(0,0.10,1.70),(0.06,0.05,0.055),hair,'head')
    oval('Nose',(0,-0.102,1.65),(0.019,0.023,0.032),skin,'head')
    oval('Mouth',(0,-0.098,1.596),(0.033,0.008,0.005),dark,'head')
    for sign in (-1,1):
        oval('Eye white',(sign*0.043,-0.089,1.68),(0.025,0.009,0.012),white,'head')
        oval('Pupil',(sign*0.043,-0.098,1.68),(0.008,0.005,0.009),eye,'head')
        oval('Brow',(sign*0.043,-0.089,1.705),(0.03,0.012,0.006),hair,'head')
        oval('Ear',(sign*0.106,0,1.65),(0.017,0.025,0.04),skin,'head')
    for side, sign in [('right',1),('left',-1)]:
        for part,radius in [('upper_arm',0.065),('forearm',0.052),('thigh',0.09),('shin',0.065)]:
            bone=side+'_'+part
            start,end,_=bone_specs[bone]
            limb(bone+'_mesh',start,end,radius,cloth,bone)
        oval('Elbow',(sign*0.29,0,1.13),(0.057,0.055,0.06),cloth,side+'_forearm')
        oval('Knee',(sign*0.10,0,0.53),(0.067,0.07,0.07),cloth,side+'_shin')
        oval('Boot',(sign*0.10,-0.05,0.075),(0.075,0.135,0.075),dark,side+'_foot')
        oval('Palm',(sign*0.29,-0.002,0.835),(0.042,0.024,0.052),skin,side+'_hand')
        for finger in range(4):
            x=sign*0.29+(finger-1.5)*0.017
            oval('Finger',(x,-0.005,0.78),(0.009,0.016,0.045),skin,side+'_hand')
        oval('Thumb',(sign*0.337,-0.018,0.835),(0.013,0.023,0.033),skin,side+'_hand')
        if not female:
            oval('Reflective shin',(sign*0.10,0,0.35),(0.067,0.068,0.028),reflective,side+'_shin')
            oval('Reflective sleeve',(sign*0.28,0,1.19),(0.065,0.063,0.025),reflective,side+'_upper_arm')
    if not female: oval('Reflective waist',(0,-0.006,1.08),(0.209,0.128,0.026),reflective,'spine')
    bpy.context.scene.render.fps=24
    bpy.context.scene.frame_start=0
    bpy.context.scene.frame_end=120
    rig.animation_data_create()
    rig.animation_data.action=bpy.data.actions.new('PhoneGesture')
    for frame, lift in [(0,0),(24,0),(72,1),(120,1)]:
        for name,angle in [('right_upper_arm',0.75),('right_forearm',1.35),('head',0.12)]:
            bone=rig.pose.bones[name]
            bone.rotation_mode='XYZ'
            bone.rotation_euler.x=angle*lift
            bone.keyframe_insert(data_path='rotation_euler',frame=frame)
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
