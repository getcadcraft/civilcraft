# SPDX-License-Identifier: Apache-2.0
"""mesh_check.py — second reader for ModelCraft's mesh exports (bin/test-modelcraft.mjs via formats.mjs).
   venv/bin/python mesh_check.py <file.glb|.obj|.stl>  → JSON {area, volume, bounds, watertight, triangles}
trimesh loads the file on its own (its own GLB/OBJ/STL readers); scenes are flattened to one mesh in world space.
"""
import json, sys
import trimesh

m = trimesh.load(sys.argv[1], force='mesh', process=True)
m.merge_vertices(merge_norm=True, merge_tex=True)
print(json.dumps({
    'area': float(m.area), 'volume': float(m.volume), 'bounds': m.bounds.tolist(),
    'watertight': bool(m.is_watertight), 'triangles': int(len(m.faces)),
}))
