# SPDX-License-Identifier: Apache-2.0
"""
cad_check.py file.dxf — what ezdxf (an independent reader) sees in a DXF ModelCraft exported (0.4 M2), or in the DXF another
program wrote from ModelCraft's DWG. Every block reference is exploded in 3D by ezdxf itself (its own handling of the
insert's extrusion, rotation and scale), then the world-space faces and lines are measured. Prints JSON:
{version, audit_errors, faces (3DFACE count), area, lines, line_len, inserts, blocks, bbox [[min], [max]], insunits,
colors (distinct ACI of the faces), true_colors}.
"""
import json, math, sys
import ezdxf
from ezdxf.math import Vec3

doc = ezdxf.readfile(sys.argv[1])
aud = doc.audit()
out = {'version': doc.dxfversion, 'audit_errors': len(aud.errors), 'faces': 0, 'area': 0.0, 'lines': 0, 'line_len': 0.0,
       'inserts': 0, 'blocks': len([b for b in doc.blocks if not b.name.startswith('*')]), 'insunits': doc.header.get('$INSUNITS', 0),
       'colors': [], 'true_colors': []}
lo = [math.inf] * 3
hi = [-math.inf] * 3
colors, tcolors = set(), set()

def grow(p):
    for i in range(3):
        lo[i] = min(lo[i], p[i]); hi[i] = max(hi[i], p[i])

def tri(a, b, c):
    return (Vec3(b) - Vec3(a)).cross(Vec3(c) - Vec3(a)).magnitude / 2

def visit(e, depth=0):
    t = e.dxftype()
    if t == 'INSERT':
        out['inserts'] += 1
        for v in e.virtual_entities():
            visit(v, depth + 1)
    elif t == '3DFACE':
        p = [Vec3(e.dxf.get(k)) for k in ('vtx0', 'vtx1', 'vtx2', 'vtx3')]
        out['faces'] += 1
        out['area'] += tri(p[0], p[1], p[2])
        if not p[3].isclose(p[2]):
            out['area'] += tri(p[0], p[2], p[3])
        for q in p:
            grow(q)
        colors.add(e.dxf.color)
        if e.dxf.hasattr('true_color'):
            tcolors.add(e.dxf.true_color)
    elif t == 'LINE':
        a, b = Vec3(e.dxf.start), Vec3(e.dxf.end)
        out['lines'] += 1
        out['line_len'] += (b - a).magnitude
        grow(a); grow(b)

for e in doc.modelspace():
    visit(e)
out['bbox'] = [lo, hi]
out['colors'] = sorted(colors)
out['true_colors'] = sorted(tcolors)
print(json.dumps(out))
