# SPDX-License-Identifier: GPL-3.0-or-later
"""Validate the bounded, self-contained Stage A publication bundle."""
import argparse
import json
import math
from pathlib import Path
import struct
import sys
import zlib

MAX_GLB = 10 * 1024 * 1024
MAX_TRIANGLES = 100_000
ALLOWED_EXTENSIONS = {'KHR_materials_ior', 'KHR_materials_specular', 'KHR_materials_clearcoat'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate_glb(path):
    require(path.is_file() and not path.is_symlink(), 'GLB must be a regular file')
    data = path.read_bytes()
    require(20 <= len(data) <= MAX_GLB, 'GLB exceeds 10 MiB budget or is truncated')
    magic, version, length = struct.unpack_from('<4sII', data)
    require(magic == b'glTF' and version == 2 and length == len(data), 'Invalid GLB 2 header')
    chunks = []
    offset = 12
    while offset < len(data):
        require(offset + 8 <= len(data), 'Truncated GLB chunk header')
        size, kind = struct.unpack_from('<II', data, offset)
        offset += 8
        require(size % 4 == 0 and offset + size <= len(data), 'Invalid GLB chunk length')
        chunks.append((kind, data[offset:offset + size]))
        offset += size
    require(len(chunks) == 2 and chunks[0][0] == 0x4E4F534A and chunks[1][0] == 0x004E4942, 'Expected one JSON and one BIN chunk')
    gltf = json.loads(chunks[0][1].decode('utf-8'))
    require(gltf.get('asset', {}).get('version') == '2.0', 'Unexpected glTF version')
    def inspect(value):
        if isinstance(value, dict):
            require('uri' not in value, 'External or data URI is forbidden')
            require(set(value.get('extensions', {})) <= ALLOWED_EXTENSIONS, 'Unsupported nested extension')
            for child in value.values():
                inspect(child)
        elif isinstance(value, list):
            for child in value:
                inspect(child)
        elif isinstance(value, float):
            require(math.isfinite(value), 'Nonfinite JSON value')
    inspect(gltf)
    require(set(gltf.get('extensionsUsed', [])) <= ALLOWED_EXTENSIONS, 'Unsupported GLB extension')
    require(set(gltf.get('extensionsRequired', [])) <= ALLOWED_EXTENSIONS, 'Unsupported required GLB extension')
    require(not gltf.get('images') and not gltf.get('textures'), 'Texture-free mobile model required')
    require(not gltf.get('animations') and not gltf.get('cameras') and not gltf.get('skins'), 'Stage A must be a static model without cameras or skins')
    buffers = gltf.get('buffers', [])
    require(len(buffers) == 1 and 'uri' not in buffers[0], 'GLB buffer must be embedded')
    require(0 < buffers[0].get('byteLength', 0) <= len(chunks[1][1]), 'Invalid binary buffer length')
    views = gltf.get('bufferViews', [])
    for view in views:
        require(view.get('buffer') == 0 and view.get('byteOffset', 0) >= 0 and view.get('byteLength', 0) > 0, 'Invalid buffer view')
        require(view.get('byteOffset', 0) + view['byteLength'] <= buffers[0]['byteLength'], 'Buffer view exceeds binary data')
    accessors = gltf.get('accessors', [])
    binary = chunks[1][1]
    sizes = {5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}
    widths = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
    for accessor in accessors:
        require('sparse' not in accessor, 'Sparse accessors are not supported')
        vi = accessor.get('bufferView', -1)
        require(isinstance(vi, int) and 0 <= vi < len(views), 'Accessor references missing buffer view')
        require(accessor.get('componentType') in sizes and accessor.get('type') in widths, 'Unsupported accessor data type')
        count = accessor.get('count', 0)
        require(isinstance(count, int) and 0 < count <= 1_000_000, 'Invalid accessor count')
        view = views[vi]
        item_size = sizes[accessor['componentType']] * widths[accessor['type']]
        stride = view.get('byteStride', item_size)
        start = accessor.get('byteOffset', 0)
        require(start >= 0 and stride >= item_size and start + (count - 1) * stride + item_size <= view['byteLength'], 'Accessor exceeds buffer view')
        for bound in accessor.get('min', []) + accessor.get('max', []):
            require(isinstance(bound, (float, int)) and math.isfinite(bound), 'Nonfinite accessor bounds')
        if accessor['componentType'] == 5126:
            for i in range(count):
                values = struct.unpack_from('<' + 'f' * widths[accessor['type']], binary, view.get('byteOffset', 0) + start + i * stride)
                require(all(math.isfinite(value) for value in values), 'Nonfinite geometry')
    triangles = 0
    meshes = gltf.get('meshes', [])
    require(meshes and gltf.get('nodes') and gltf.get('scenes'), 'GLB has no scene geometry')
    for mesh in meshes:
        for primitive in mesh.get('primitives', []):
            require(primitive.get('mode', 4) == 4, 'Only triangle primitives are supported')
            attrs = primitive.get('attributes', {})
            require('POSITION' in attrs, 'Primitive has no positions')
            require(isinstance(attrs['POSITION'], int) and 0 <= attrs['POSITION'] < len(accessors), 'Invalid position accessor')
            position = accessors[attrs['POSITION']]
            require(position['type'] == 'VEC3' and position['componentType'] == 5126, 'Invalid position type')
            index = primitive.get('indices', attrs['POSITION'])
            require(isinstance(index, int) and 0 <= index < len(accessors), 'Invalid index accessor')
            indices = accessors[index]
            count = indices['count']
            if 'indices' in primitive:
                require(indices['type'] == 'SCALAR' and indices['componentType'] in {5121,5123,5125}, 'Invalid index type')
                view = views[indices['bufferView']]
                component = {5121:'B',5123:'H',5125:'I'}[indices['componentType']]
                component_size = sizes[indices['componentType']]
                require('byteStride' not in view, 'Index accessor must be tightly packed')
                start = view.get('byteOffset', 0) + indices.get('byteOffset', 0)
                for i in range(count):
                    value = struct.unpack_from('<' + component, binary, start + i * component_size)[0]
                    require(value < position['count'], 'Index exceeds position array')
            require(count % 3 == 0, 'Incomplete triangle')
            triangles += count // 3
    require(0 < triangles <= MAX_TRIANGLES, 'GLB exceeds 100000 triangle budget')
    return {'bytes': len(data), 'triangles': triangles, 'meshes': len(meshes)}


def validate_png(path):
    require(path.is_file() and not path.is_symlink(), 'PNG must be a regular file')
    data = path.read_bytes()
    require(len(data) <= 5 * 1024 * 1024 and data[:8] == b'\x89PNG\r\n\x1a\n', 'Invalid or oversized PNG')
    require(len(data) >= 33 and data[12:16] == b'IHDR', 'Missing PNG dimensions')
    width, height = struct.unpack_from('>II', data, 16)
    require((width, height) == (768, 768), 'Expected 768x768 preview')
    offset = 8
    ended = False
    while offset < len(data):
        require(offset + 12 <= len(data), 'Truncated PNG chunk')
        size = struct.unpack_from('>I', data, offset)[0]
        kind = data[offset+4:offset+8]
        require(offset + 12 + size <= len(data), 'PNG chunk exceeds file')
        payload = data[offset+8:offset+8+size]
        checksum = struct.unpack_from('>I', data, offset+8+size)[0]
        require(zlib.crc32(kind+payload) == checksum, 'PNG CRC mismatch')
        offset += size + 12
        if kind == b'IEND':
            ended = True
            break
    require(ended and offset == len(data), 'PNG incomplete or trailing data')
    return {'bytes':len(data), 'width':width, 'height':height}


def validate(directory, require_blend=False, published=False):
    root = Path(directory)
    require(not root.is_symlink(), 'Bundle cannot be a symlink')
    result = {'glb':validate_glb(root/'robot.glb'), 'png':validate_png(root/('preview.png' if published else 'robot.png'))}
    report_path = root/('manifest.json' if published else 'report.json')
    require(report_path.is_file() and not report_path.is_symlink() and report_path.stat().st_size < 16384, 'Missing or invalid report')
    report = json.loads(report_path.read_text(encoding='utf-8'))
    require(report.get('stage') == 'A' and report.get('schema') == 1 and report.get('resolution') == [768,768], 'Unexpected report schema')
    for key in ['generation_seconds','render_seconds','total_seconds','peak_rss_kib']:
        require(isinstance(report.get(key), (int,float)) and math.isfinite(report[key]) and report[key] >= 0, 'Invalid report measurement: '+key)
    require(report.get('license') == 'CC-BY-4.0', 'Missing output license')
    if require_blend:
        blend = root/'robot.blend'
        require(blend.is_file() and not blend.is_symlink() and blend.stat().st_size <= 50*1024*1024, 'Missing or oversized BLEND')
        require(blend.open('rb').read(7) == b'BLENDER', 'Invalid BLEND header')
    return result


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('directory')
    parser.add_argument('--require-blend',action='store_true')
    parser.add_argument('--published',action='store_true')
    args=parser.parse_args()
    try:
        print(json.dumps(validate(args.directory,args.require_blend,args.published),indent=2))
    except (ValueError,KeyError,TypeError,struct.error,OSError) as error:
        print('Robot validation failed: '+str(error),file=sys.stderr)
        sys.exit(1)
