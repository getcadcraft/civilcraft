# SPDX-License-Identifier: Apache-2.0
"""dae_check.py — second reader for ModelCraft's Collada export (bin/test-modelcraft.mjs via formats.mjs).
   venv/bin/python -I dae_check.py <file.dae>  → JSON
Validates the file against the Collada 1.4.1 schema (schema/collada_schema_1_4_1.xsd from Khronos when
present, else the copy bundled with pycollada), then reads it with pycollada on its own: world-space
triangles of the visual scene (instance_node and node matrices applied, units and up axis as written),
their area and bounds (also converted to Z up, meters: zbounds, area_m2), the geometry / node / material counts and the material colours in use.
"""
import json, os, sys
import numpy as np
import lxml.etree
import collada
from collada.schema import ColladaResolver, COLLADA_SCHEMA_1_4_1

path = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
xsd = os.path.join(here, 'schema', 'collada_schema_1_4_1.xsd')
parser = lxml.etree.XMLParser()
parser.resolvers.add(ColladaResolver())
if os.path.exists(xsd):
    schema_doc, schema_src = lxml.etree.parse(xsd, parser), 'khronos'
else:
    import io
    schema_doc, schema_src = lxml.etree.parse(io.BytesIO(COLLADA_SCHEMA_1_4_1.encode('utf-8')), parser), 'pycollada'
schema = lxml.etree.XMLSchema(schema_doc)
doc = lxml.etree.parse(path)
valid = schema.validate(doc)
errors = [str(e) for e in schema.error_log][:10]

c = collada.Collada(path)
area, lo, hi, tris = 0.0, None, None, 0
colours = set()
by_colour = {}
for bg in c.scene.objects('geometry'):
    for prim in bg.primitives():
        if isinstance(prim, (collada.polylist.BoundPolylist, collada.polygons.BoundPolygons)):
            prim = prim.triangleset()
        if not isinstance(prim, collada.triangleset.BoundTriangleSet):
            continue
        key = ''
        if prim.material is not None:
            d = prim.material.effect.diffuse
            if isinstance(d, tuple):
                key = '#' + ''.join('%02x' % int(round(x * 255)) for x in d[:3])
                colours.add(key)
        v = prim.vertex[prim.vertex_index]   # (n, 3, 3)
        if not len(v):
            continue
        tris += len(v)
        a = float(np.linalg.norm(np.cross(v[:, 1] - v[:, 0], v[:, 2] - v[:, 0]), axis=1).sum() / 2)
        area += a
        by_colour[key] = by_colour.get(key, 0.0) + a
        flat = v.reshape(-1, 3)
        lo = flat.min(0) if lo is None else np.minimum(lo, flat.min(0))
        hi = flat.max(0) if hi is None else np.maximum(hi, flat.max(0))
# the same bounds in ModelCraft's frame (Z up, meters), converted here on our own
zb = None
if lo is not None:
    corners = np.array([[x, y, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])])
    up = c.assetInfo.upaxis
    if up == 'Y_UP':
        corners = np.stack([corners[:, 0], -corners[:, 2], corners[:, 1]], 1)
    elif up == 'X_UP':
        corners = np.stack([-corners[:, 1], -corners[:, 2], corners[:, 0]], 1)
    corners = corners * (c.assetInfo.unitmeter or 1.0)
    zb = [corners.min(0).tolist(), corners.max(0).tolist()]
print(json.dumps({
    'valid': bool(valid), 'schema': schema_src, 'errors': errors,
    'up': c.assetInfo.upaxis, 'meter': c.assetInfo.unitmeter,
    'geometries': len(c.geometries), 'nodes': len(c.nodes), 'materials': len(c.materials),
    'triangles': tris, 'area': area, 'bounds': [lo.tolist(), hi.tolist()] if lo is not None else None,
    'colours': sorted(colours), 'area_by_colour': by_colour, 'zbounds': zb, 'area_m2': area * (c.assetInfo.unitmeter or 1.0) ** 2,
}))
