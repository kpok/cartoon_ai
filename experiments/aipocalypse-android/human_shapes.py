# SPDX-License-Identifier: GPL-3.0-or-later
"""Continuous weighted garment geometry for the procedural human generator."""
import math
import bpy


def loft(rig, name, rings, materials, weights, material_rule=None, segments=24):
    """Rings contain x/y/z center and x/y radius in world-space rest pose."""
    vertices=[]
    for x,y,z,rx,ry in rings:
        for index in range(segments):
            angle=2*math.pi*index/segments
            vertices.append((x+rx*math.cos(angle),y+ry*math.sin(angle),z))
    faces=[]
    for row in range(len(rings)-1):
        for index in range(segments):
            nxt=(index+1)%segments
            faces.append((row*segments+index,row*segments+nxt,(row+1)*segments+nxt,(row+1)*segments+index))
    faces += [tuple(reversed(range(segments))),tuple((len(rings)-1)*segments+i for i in range(segments))]
    mesh=bpy.data.meshes.new(name+'Mesh')
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    for material in materials:mesh.materials.append(material)
    groups={}
    for index,vertex in enumerate(vertices):
        values=weights(vertex)
        if abs(sum(values.values())-1)>1e-6 or any(value<0 for value in values.values()):
            raise ValueError('Weights must be nonnegative and normalized')
        for bone,value in values.items():
            if value<=0:continue
            if bone not in groups:groups[bone]=obj.vertex_groups.new(name=bone)
            groups[bone].add([index],value,'REPLACE')
    modifier=obj.modifiers.new('Armature','ARMATURE')
    modifier.object=rig
    obj.parent=rig
    for polygon in mesh.polygons:
        polygon.use_smooth=True
        if material_rule:
            center=sum((mesh.vertices[index].co for index in polygon.vertices),start=mesh.vertices[polygon.vertices[0]].co*0)/len(polygon.vertices)
            polygon.material_index=material_rule(center)
    return obj


def limbs(rig, side, sign, cloth, reflective, female):
    arm=[(sign*0.23,0,1.445,0.065,0.07),
         (sign*0.245,0,1.39,0.074,0.072),
         (sign*0.275,0,1.24,0.063,0.06),
         (sign*0.29,0,1.13,0.052,0.055),
         (sign*0.29,0,1.055,0.057,0.054),
         (sign*0.29,0,0.95,0.045,0.043),
         (sign*0.29,0,0.88,0.035,0.034)]
    # Consecutive rings run bottom-to-top so the outward winding stays consistent.
    def arm_weights(vertex):
        upper=max(0,min(1,(vertex[2]-1.06)/0.14))
        return {side+'_upper_arm':upper,side+'_forearm':1-upper}
    loft(rig,side+'Sleeve',list(reversed(arm)),[cloth,reflective],arm_weights,
         lambda p:1 if not female and 1.19<p.z<1.24 else 0)
    leg=[(sign*0.10,0,0.105,0.06,0.06),
         (sign*0.10,0,0.25,0.066,0.065),
         (sign*0.10,0,0.36,0.073,0.07),
         (sign*0.10,0,0.49,0.071,0.075),
         (sign*0.10,0,0.56,0.072,0.075),
         (sign*0.10,0,0.76,0.09,0.09),
         (sign*0.10,0,0.96,0.105,0.10)]
    def leg_weights(vertex):
        upper=max(0,min(1,(vertex[2]-0.46)/0.14))
        return {side+'_thigh':upper,side+'_shin':1-upper}
    loft(rig,side+'Trousers',leg,[cloth,reflective],leg_weights,
         lambda p:1 if not female and 0.25<p.z<0.36 else 0)


def shaped_head(rig, skin, hair):
    rings=[(0,0,1.50,0.035,0.045),(0,-0.004,1.53,0.060,0.064),
           (0,0,1.57,0.087,0.077),(0,0,1.62,0.100,0.088),
           (0,0,1.67,0.104,0.094),(0,0.004,1.71,0.102,0.094),
           (0,0.010,1.75,0.095,0.086),(0,0.012,1.79,0.065,0.062),
           (0,0.012,1.805,0.02,0.02)]
    return loft(rig,'ShapedHead',rings,[skin,hair],lambda vertex:{'head':1},
                lambda p:1 if p.z>(1.741 if p.y<0 else 1.66) else 0,segments=32)


def finger_curve(rig, name, points, skin, bone):
    from mathutils import Vector
    vertices=[]
    sides=10
    for index,(point,radius) in enumerate(points):
        center=Vector(point)
        previous=Vector(points[max(0,index-1)][0])
        following=Vector(points[min(len(points)-1,index+1)][0])
        tangent=(following-previous).normalized()
        side=tangent.cross(Vector((1,0,0))).normalized()
        up=tangent.cross(side).normalized()
        for step in range(sides):
            angle=2*math.pi*step/sides
            vertices.append(center+radius*(math.cos(angle)*side+math.sin(angle)*up))
    faces=[]
    for row in range(len(points)-1):
        for index in range(sides):
            nxt=(index+1)%sides
            faces.append((row*sides+index,row*sides+nxt,(row+1)*sides+nxt,(row+1)*sides+index))
    faces += [tuple(reversed(range(sides))),tuple((len(points)-1)*sides+i for i in range(sides))]
    mesh=bpy.data.meshes.new(name+'Mesh')
    mesh.from_pydata(vertices,[],faces)
    mesh.materials.append(skin)
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    group=obj.vertex_groups.new(name=bone)
    group.add(list(range(len(vertices))),1,'REPLACE')
    modifier=obj.modifiers.new('Armature','ARMATURE')
    modifier.object=rig
    obj.parent=rig
    for polygon in mesh.polygons:polygon.use_smooth=True
    return obj
