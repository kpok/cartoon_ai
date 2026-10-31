# SPDX-License-Identifier: GPL-3.0-or-later
"""Bounded body refinement with editable control cage and explicit dense GLB bake."""
import bpy
from pair_scene import head_surface_points


def evaluated_vertex_count(obj):
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    try:
        return len(mesh.vertices)
    finally:
        evaluated.to_mesh_clear()


def add_body_refinement(body, rig):
    before_body = evaluated_vertex_count(body)
    before_head = len(head_surface_points(body, rig))
    modifier = body.modifiers.new('Anatomical surface Catmull-Clark L1', 'SUBSURF')
    modifier.subdivision_type = 'CATMULL_CLARK'
    modifier.levels = 1
    modifier.render_levels = 1
    # Helper/clothing masks precede smoothing; deformation follows smoothing.
    bpy.context.view_layer.objects.active = body
    body.select_set(True)
    armature = next(m for m in body.modifiers if m.type == 'ARMATURE')
    bpy.ops.object.modifier_move_to_index(modifier=armature.name, index=len(body.modifiers) - 1)
    bpy.context.view_layer.update()
    detail = {'method': 'Catmull-Clark', 'levels': 1, 'modifierOrder': [m.type for m in body.modifiers],
              'controlBodyVertices': before_body, 'evaluatedBodyVertices': evaluated_vertex_count(body),
              'controlHeadVertices': before_head, 'evaluatedHeadVertices': len(head_surface_points(body, rig))}
    if detail['evaluatedHeadVertices'] < before_head * 3:
        raise RuntimeError('Head surface refinement did not increase real density')
    return detail


def bake_body_for_export(body):
    """After saving the editable blend, bake only rest-shape geometry, not its rig."""
    armature = next(m for m in body.modifiers if m.type == 'ARMATURE')
    previous = armature.show_viewport
    try:
        armature.show_viewport = False
        bpy.context.view_layer.update()
        graph = bpy.context.evaluated_depsgraph_get()
        mesh = bpy.data.meshes.new_from_object(body.evaluated_get(graph), preserve_all_data_layers=True, depsgraph=graph)
    finally:
        armature.show_viewport = previous
    mesh.name = body.name + '_dense_export'
    body.data = mesh
    for modifier in list(body.modifiers):
        if modifier.type != 'ARMATURE':
            body.modifiers.remove(modifier)
    bpy.context.view_layer.update()
    return len(mesh.vertices)
