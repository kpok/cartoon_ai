# SPDX-License-Identifier: GPL-3.0-or-later
"""Visible semantic IDs from the actual scene, retaining original material alpha."""
import bpy


def render_semantic_mask(scene, characters, destination):
    original_slots = [(obj, [slot.material for slot in obj.material_slots]) for obj in characters]
    settings = (scene.render.film_transparent, scene.render.image_settings.color_mode,
                scene.view_settings.view_transform, scene.view_settings.look,
                scene.view_settings.exposure, scene.view_settings.gamma,
                scene.cycles.samples, scene.cycles.use_denoising, scene.render.filepath)
    cache = {}
    try:
        for obj in characters:
            role = 'woman' if obj.name.startswith('woman_') else 'man'
            for slot in obj.material_slots:
                original = slot.material
                key = (role, original.name)
                if key not in cache:
                    mat = original.copy()
                    mat.name = 'Semantic_' + role + '_' + original.name
                    nodes, links = mat.node_tree.nodes, mat.node_tree.links
                    principled = next(node for node in nodes if node.type == 'BSDF_PRINCIPLED')
                    alpha = principled.inputs['Alpha']
                    emission = nodes.new('ShaderNodeEmission')
                    emission.inputs['Color'].default_value = (1, 0, 0, 1) if role == 'woman' else (0, 0, 1, 1)
                    transparent = nodes.new('ShaderNodeBsdfTransparent')
                    mix = nodes.new('ShaderNodeMixShader')
                    links.new(transparent.outputs[0], mix.inputs[1])
                    links.new(emission.outputs[0], mix.inputs[2])
                    if alpha.is_linked:
                        links.new(alpha.links[0].from_socket, mix.inputs[0])
                    else:
                        mix.inputs[0].default_value = alpha.default_value
                    output = next(node for node in nodes if node.type == 'OUTPUT_MATERIAL')
                    links.new(mix.outputs[0], output.inputs['Surface'])
                    cache[key] = mat
                slot.material = cache[key]
        scene.render.film_transparent = True
        scene.render.image_settings.color_mode = 'RGBA'
        scene.view_settings.view_transform = 'Standard'
        scene.view_settings.look = 'None'
        scene.view_settings.exposure = 0
        scene.view_settings.gamma = 1
        scene.cycles.samples = 8
        scene.cycles.use_denoising = False
        scene.render.filepath = str(destination)
        bpy.ops.render.render(write_still=True)
    finally:
        for obj, materials in original_slots:
            for slot, material in zip(obj.material_slots, materials):
                slot.material = material
        (scene.render.film_transparent, scene.render.image_settings.color_mode,
         scene.view_settings.view_transform, scene.view_settings.look,
         scene.view_settings.exposure, scene.view_settings.gamma,
         scene.cycles.samples, scene.cycles.use_denoising, scene.render.filepath) = settings
