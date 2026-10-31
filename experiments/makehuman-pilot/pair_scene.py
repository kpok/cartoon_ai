# SPDX-License-Identifier: GPL-3.0-or-later
"""Static partner pose and fitted garment over real MPFB anatomy."""
import math
import bpy
from mathutils import Matrix, Vector
from mathutils.kdtree import KDTree
from mathutils.bvhtree import BVHTree


def material(name, color, roughness=.65):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    node = mat.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value = (*color, 1)
    node.inputs['Roughness'].default_value = roughness
    return mat


def world_points(objects):
    graph = bpy.context.evaluated_depsgraph_get()
    for obj in objects:
        evaluated = obj.evaluated_get(graph)
        mesh = evaluated.to_mesh()
        try:
            for vertex in mesh.vertices:
                yield evaluated.matrix_world @ vertex.co
        finally:
            evaluated.to_mesh_clear()


def fitted_dress(base, rig, height):
    """Fit the bodice by ray casting; keep the skirt attached to the pelvis."""
    graph = bpy.context.evaluated_depsgraph_get()
    body = base.evaluated_get(graph)
    evaluated_mesh = body.to_mesh(preserve_all_data_layers=True, depsgraph=graph)
    bone_names = set(rig.data.bones.keys())
    def torso_weights(vertex):
        return [(base.vertex_groups[g.group].name, g.weight) for g in vertex.groups
                if base.vertex_groups[g.group].name in bone_names and base.vertex_groups[g.group].name.startswith(('spine', 'pelvis', 'root', 'breast')) and g.weight > .001]
    allowed = {v.index for v in evaluated_mesh.vertices if sum(w for _, w in torso_weights(v)) > .3}
    surface = BVHTree.FromPolygons([v.co for v in evaluated_mesh.vertices],
                                 [list(p.vertices) for p in evaluated_mesh.polygons if all(i in allowed for i in p.vertices)])
    vertices, faces, torso = [], [], []
    sides, rings = 64, 32
    for row in range(rings):
        t = row / (rings - 1)
        z = height * (.54 + .20 * t)
        for col in range(sides):
            angle = 2 * math.pi * col / sides
            radial = Vector((math.sin(angle), -math.cos(angle), 0))
            center = Vector((0, -.025 * height, z))
            location, _, _, _ = surface.ray_cast(center + radial * height, -radial, height * 2)
            if location is None:
                raise RuntimeError('Dress bodice ray missed anatomical torso: ' + str((row, col, height, z)))
            vertices.append(tuple(location + radial * height * .006))
            torso.append(True)
            if row and col:
                a = row * sides + col
                faces.append((a - sides - 1, a - sides, a, a - 1))
        if row:
            a = row * sides
            faces.append((a - 1, a - sides, a, a + sides - 1))
    # Open front slit and layered, asymmetric folds are deliberate garment edges.
    for layer in range(3):
        offset = len(vertices)
        for row in range(18):
            t = row / 17
            for col in range(sides):
                opening = .40 * max(0, (t - .35) / .65)
                angle = -.12 + opening / 2 + (2 * math.pi - opening) * col / (sides - 1)
                wave = math.sin(angle * 7 + t * 2 + layer) * .012 * t
                radius = height * (.135 + t * (.08 + .016 * layer) + wave)
                z = height * (.535 - t * (.105 + .035 * layer) + .025 * math.sin(angle + .4) * t)
                vertices.append((radius * math.sin(angle), -.025 * height - radius * .76 * math.cos(angle), z))
                torso.append(False)
                if row and col:
                    a = offset + row * sides + col
                    faces.append((a - 1, a, a - sides, a - sides - 1))
    mesh = bpy.data.meshes.new('Fitted emerald dress')
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    garment = bpy.data.objects.new('dress', mesh)
    bpy.context.collection.objects.link(garment)
    garment.data.materials.append(material('Emerald satin', (.006, .13, .075), .38))
    # Match only vertices with actual anatomical rig influences, excluding helpers.
    bone_names = set(rig.data.bones.keys())
    valid = [v for v in evaluated_mesh.vertices if v.index in allowed]
    tree = KDTree(len(valid))
    for index, vertex in enumerate(valid):
        tree.insert(vertex.co, index)
    tree.balance()
    groups = {name: garment.vertex_groups.new(name=name) for name in bone_names}
    for index, coordinate in enumerate(vertices):
        if not torso[index]:
            groups['root'].add([index], 1, 'REPLACE')
            continue
        _, nearest, _ = tree.find(Vector(coordinate))
        weights = torso_weights(valid[nearest])
        total = sum(weight for _, weight in weights)
        for name, weight in weights:
            groups[name].add([index], weight / total, 'REPLACE')
    body.to_mesh_clear()
    garment.parent = rig
    modifier = garment.modifiers.new('Anatomical rig', 'ARMATURE')
    modifier.object = rig
    smooth = garment.modifiers.new('Smooth fabric folds', 'SUBSURF')
    smooth.levels = 1
    solid = garment.modifiers.new('Cloth thickness', 'SOLIDIFY')
    solid.thickness = height * .0015
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    return garment


def partner_pose(rig, height, offset, role):
    rig.location.x = offset
    rig.rotation_euler.z = math.radians(35 if role == 'woman' else -12)
    # Targets are in world space; IK deforms the anatomical mesh and fitted assets.
    targets = {'woman': {'R': (-.10, -.29, 1.05), 'L': (.12, -.04, 1.40)},
               'man': {'R': (.03, -.29, 1.07), 'L': (.28, .07, .99)}}[role]
    poles = {'woman': {'R': (-.45, -.40, 1.04), 'L': (-.02, -.35, 1.28)},
             'man': {'R': (.30, -.40, 1.17), 'L': (.50, .30, 1.10)}}[role]
    for bone in rig.pose.bones:
        bone.rotation_mode = 'XYZ'
    bpy.context.view_layer.update()
    inverse = rig.matrix_world.inverted()
    for side, target in targets.items():
        names = [name + '.' + side for name in ('upperarm01', 'upperarm02', 'lowerarm01', 'lowerarm02')]
        bones = [rig.pose.bones[name] for name in names]
        shoulder = rig.matrix_world @ bones[0].head
        upper = sum(bone.length for bone in bones[:2]) * rig.scale.x
        lower = sum(bone.length for bone in bones[2:]) * rig.scale.x
        delta = Vector(target) - shoulder
        distance = min(delta.length, (upper + lower) * .98)
        direction = delta.normalized()
        hand = shoulder + direction * distance
        pole = Vector(poles[side]) - shoulder
        bend = (pole - direction * pole.dot(direction)).normalized()
        along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
        elbow = shoulder + direction * along + bend * math.sqrt(max(0, upper * upper - along * along))
        # Treat the two twist bones in each limb segment as one anatomical bone.
        # A generic four-link IK solver can fold these twist bones into extra elbows.
        for segment, begin, finish in ((bones[:2], shoulder, elbow), (bones[2:], elbow, hand)):
            local_direction = (inverse @ finish - inverse @ begin).normalized()
            cursor = inverse @ begin
            for bone in segment:
                rest = bone.bone.matrix_local.to_quaternion()
                rotation = (rest @ Vector((0, 1, 0))).rotation_difference(local_direction) @ rest
                bone.matrix = Matrix.LocRotScale(cursor, rotation, Vector((1, 1, 1)))
                bpy.context.view_layer.update()
                cursor = cursor + local_direction * bone.bone.length
    wrist = rig.pose.bones['wrist.R']
    rest = wrist.bone.matrix_local.to_quaternion()
    desired = Vector((1, 0, .2) if role == 'woman' else (-1, 0, -.2))
    local_direction = (inverse.to_3x3() @ desired).normalized()
    rotation = (rest @ Vector((0, 1, 0))).rotation_difference(local_direction) @ rest
    wrist.matrix = Matrix.LocRotScale(wrist.head.copy(), rotation, Vector((1, 1, 1)))
    bpy.context.view_layer.update()
    for bone in rig.pose.bones:
        if bone.name.startswith('finger') and '-1.' not in bone.name:
            bone.rotation_euler.x = .35
    head = rig.pose.bones['head']
    head.rotation_euler.y = -rig.rotation_euler.z * .8
    bpy.context.view_layer.update()


def landmarks(rigs):
    result = {}
    for role, rig in rigs.items():
        result[role] = {name: list(rig.matrix_world @ rig.pose.bones[name].head)
                        for name in ('head', 'wrist.L', 'wrist.R', 'foot.L', 'foot.R')}
    return result
