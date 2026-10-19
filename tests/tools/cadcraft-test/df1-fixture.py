# SPDX-License-Identifier: Apache-2.0
"""df1-fixture.py <out.dxf> <truth.json> — 0.6 DF.1: the Discord drawing reports as one ezdxf drawing (another program).

Each case sits on its own layer (CASE_<name>) in model space, so a reader that renumbers handles can still be checked case
by case. The truth file holds, per layer, the plan-view extents (x, y) of everything on it as ezdxf computes them
(ezdxf.bbox over the drawing's own entities: blocks expanded, OCS applied), plus the dimension measurements.

Cases (DF.1 (a) blocks drawn wrong, (c) dimensions off the drawing, (d) lines turned):
  NESTED    a block holding references to another block (rotated, scaled, mirrored), placed rotated and non-uniformly
  NONUNI    non-uniform scale (2, 0.5) at 40°
  NEGX      x scale -1 at 25°;  NEGY  y scale -1 at 20°;  NEGXY  both -1 at 10°
  FLIPINS   a reference with extrusion (0,0,-1) at 30° (a block mirrored in another program, or drawn from below)
  FLIPCIRC  a circle with extrusion (0,0,-1);  FLIPARC  an arc with extrusion (0,0,-1)
  BASEPT    a block whose base point is not its origin, at 45°
  FLIPNEST  a block holding a flipped reference and a flipped arc, placed at 15°
  MINSERT   a 2 × 3 array reference at 20°
  FLIPPOLY  a polyline with bulges and extrusion (0,0,-1);  FLIPHATCH  a hatch with extrusion (0,0,-1)
  FLIPSOLID a 2D solid with extrusion (0,0,-1)
  TILTCIRC  a circle in a tilted plane (extrusion (0, -0.7071, 0.7071)): seen from above, an ellipse
  TILTPOLY  a polyline in a plane turned about Z and tilted (extrusion (0.5, 0.5, 0.7071))
  TILTINS   a reference with extrusion (0.6, 0, 0.8)
  DIMROT    a linear dimension at 30°;  DIMLFAC  a dimension with DIMLFAC 2;  DIMUCS  an aligned dimension at 45°
  CHAIRS    a furniture-like block (seat and back arcs, legs as circles) placed 8 times: rotated, mirrored, flipped
"""
import json
import math
import sys

import ezdxf

out_dxf, out_json = sys.argv[1], sys.argv[2]
doc = ezdxf.new('R2018', setup=True)
doc.header['$INSUNITS'] = 4
msp = doc.modelspace()

def layer(name):
    n = 'CASE_' + name
    if n not in doc.layers:
        doc.layers.add(n)
    return {'layer': n}

# blocks
inner = doc.blocks.new('INNER')
inner.add_circle((2, 0), 1)
inner.add_line((0, 0), (4, 1))
inner.add_arc((0, 0), 3, 10, 100)

outer = doc.blocks.new('OUTER')
outer.add_blockref('INNER', (5, 0), dxfattribs={'rotation': 30, 'xscale': 2, 'yscale': 2})
outer.add_blockref('INNER', (0, 5), dxfattribs={'xscale': 1, 'yscale': -1})
outer.add_lwpolyline([(0, 0), (8, 0), (8, 6)])

chair = doc.blocks.new('CHAIR')
chair.add_lwpolyline([(-9, -9), (9, -9), (9, 9), (-9, 9)], close=True)
chair.add_arc((0, 9), 9, 0, 180)
for x, y in ((-7, -7), (7, -7), (-7, 7), (7, 7)):
    chair.add_circle((x, y), 1)
chair.add_line((-9, 12), (0, 16))

based = doc.blocks.new('BASED', base_point=(10, 10))
based.add_lwpolyline([(10, 10), (30, 10), (30, 20), (10, 20)], close=True)
based.add_circle((25, 15), 3)

flipnest = doc.blocks.new('FLIPNEST')
flipnest.add_blockref('INNER', (3, 2), dxfattribs={'rotation': 20, 'extrusion': (0, 0, -1)})
flipnest.add_arc((6, -2), 2, 0, 90, dxfattribs={'extrusion': (0, 0, -1)})
flipnest.add_line((0, 0), (6, 0))

msp.add_blockref('OUTER', (100, 0), dxfattribs={**layer('NESTED'), 'rotation': 15, 'xscale': 1.5, 'yscale': 0.75})
msp.add_blockref('INNER', (150, 0), dxfattribs={**layer('NONUNI'), 'rotation': 40, 'xscale': 2, 'yscale': 0.5})
msp.add_blockref('INNER', (180, 0), dxfattribs={**layer('NEGX'), 'rotation': 25, 'xscale': -1, 'yscale': 1})
msp.add_blockref('INNER', (210, 0), dxfattribs={**layer('NEGY'), 'rotation': 20, 'xscale': 1, 'yscale': -1})
msp.add_blockref('INNER', (240, 0), dxfattribs={**layer('NEGXY'), 'rotation': 10, 'xscale': -1, 'yscale': -1})
# extrusion (0,0,-1): the insertion point is in the OCS (x runs the other way), so OCS (-270, 0) is world (270, 0)
msp.add_blockref('INNER', (-270, 0), dxfattribs={**layer('FLIPINS'), 'rotation': 30, 'extrusion': (0, 0, -1)})
msp.add_circle((-300, 5), 4, dxfattribs={**layer('FLIPCIRC'), 'extrusion': (0, 0, -1)})
msp.add_arc((-320, 5), 5, 10, 80, dxfattribs={**layer('FLIPARC'), 'extrusion': (0, 0, -1)})
msp.add_blockref('BASED', (350, 0), dxfattribs={**layer('BASEPT'), 'rotation': 45})
msp.add_blockref('FLIPNEST', (400, 0), dxfattribs={**layer('FLIPNEST'), 'rotation': 15})
m = msp.add_blockref('INNER', (450, 0), dxfattribs={**layer('MINSERT'), 'rotation': 20})
m.grid(size=(3, 2), spacing=(12, 9))   # rows, columns
p = msp.add_lwpolyline([(-500, 0, 0, 0, 0.5), (-520, 0, 0, 0, 0), (-520, 15, 0, 0, -1), (-505, 20)], format='xyseb', dxfattribs={**layer('FLIPPOLY'), 'extrusion': (0, 0, -1)})
h = msp.add_hatch(color=3, dxfattribs={**layer('FLIPHATCH'), 'extrusion': (0, 0, -1)})
h.paths.add_polyline_path([(-550, 0), (-570, 0), (-570, 12), (-550, 18)], is_closed=True)
msp.add_solid([(-600, 0), (-620, 0), (-600, 10), (-620, 14)], dxfattribs={**layer('FLIPSOLID'), 'extrusion': (0, 0, -1)})

# tilted planes: give the OCS position so that the world position lands near the case's spot
def ocs_point(ext, world):
    from ezdxf.math import OCS
    return OCS(ext).from_wcs(world)

e1 = (0, -math.sqrt(0.5), math.sqrt(0.5))
msp.add_circle(ocs_point(e1, (650, 0, 0)), 6, dxfattribs={**layer('TILTCIRC'), 'extrusion': e1})
e2 = (0.5, 0.5, math.sqrt(0.5))
o2 = ocs_point(e2, (700, 0, 0))
msp.add_lwpolyline([(o2.x, o2.y), (o2.x + 20, o2.y), (o2.x + 20, o2.y + 10), (o2.x, o2.y + 10)], close=True,
                   dxfattribs={**layer('TILTPOLY'), 'extrusion': e2, 'elevation': o2.z})
e3 = (0.6, 0, 0.8)
msp.add_blockref('INNER', ocs_point(e3, (750, 0, 0)), dxfattribs={**layer('TILTINS'), 'rotation': 35, 'extrusion': e3})

# dimensions (ezdxf draws their blocks; Standard style: closed filled arrowheads — a tick's width would not count)
msp.add_linear_dim(base=(820, 20), p1=(800, 0), p2=(830, 10), angle=30, dimstyle='Standard', dxfattribs=layer('DIMROT')).render()
d = msp.add_linear_dim(base=(860, 15), p1=(850, 0), p2=(880, 0), dimstyle='Standard', override={'dimlfac': 2}, dxfattribs=layer('DIMLFAC'))
d.render()
msp.add_aligned_dim(p1=(900, 0), p2=(920, 20), distance=5, dimstyle='Standard', dxfattribs=layer('DIMUCS')).render()

# a furniture plan: the same chair 8 times, as people place them
spots = [((1000, 0), {}), ((1030, 0), {'rotation': 90}), ((1060, 0), {'rotation': 180}), ((1090, 0), {'xscale': -1}),
         ((1000, 40), {'yscale': -1}), ((-1030, 40), {'extrusion': (0, 0, -1)}), ((-1060, 40), {'extrusion': (0, 0, -1), 'rotation': 60}),
         ((1090, 40), {'xscale': 0.8, 'yscale': 0.8, 'rotation': 45})]
for at, extra in spots:
    msp.add_blockref('CHAIR', at, dxfattribs={**layer('CHAIRS'), **extra})

doc.saveas(out_dxf)

# the truth: plan extents per case layer. Walked here with ezdxf's own insert matrices (Insert.matrix44(), exact for any
# nesting and non-uniform scale — ezdxf.bbox approximates a non-uniformly scaled nested reference) and ezdxf's primitives
# (OCS → WCS, curves flattened to 1e-5, arcs as Béziers: within 3e-4 of a radius); POINTs (a dimension's definition
# points: nothing draws them) and text (each program measures its own font) are left out.
from ezdxf.disassemble import make_primitive
from ezdxf.math import Matrix44

def walk(entities, m, acc):
    for e in entities:
        t = e.dxftype()
        if t in ('POINT', 'TEXT', 'MTEXT', 'ATTRIB'):   # text: each program measures its own font
            continue
        if t == 'INSERT':
            blk = doc.blocks.get(e.dxf.name)
            for mm in ([e.matrix44()] if not e.mcount > 1 else [x.matrix44() for x in e.multi_insert()]):
                walk(blk, mm @ m, acc)
            continue
        if t == 'DIMENSION':
            walk(e.get_geometry_block(), m, acc)
            continue
        prim = make_primitive(e, max_flattening_distance=1e-5)
        for v in prim.vertices():
            w = m.transform(v)
            acc.append((w.x, w.y))

truth = {'format': 'cadcraft-df1-truth', 'version': 2, 'cases': {}, 'chairs': []}
by_layer = {}
for e in msp:
    by_layer.setdefault(e.dxf.layer, []).append(e)
for name, ents in sorted(by_layer.items()):
    if not name.startswith('CASE_'):
        continue
    acc = []
    walk(ents, Matrix44(), acc)
    xs = [p[0] for p in acc]; ys = [p[1] for p in acc]
    truth['cases'][name[5:]] = {'min': [min(xs), min(ys)], 'max': [max(xs), max(ys)], 'n': len(ents)}
for e in by_layer['CASE_CHAIRS']:
    w = e.matrix44().transform((0, 16, 0))   # where the chair's back line ends (block point (0, 16)), world x, y
    truth['chairs'].append([w.x, w.y])
with open(out_json, 'w') as f:
    json.dump(truth, f, indent=1)
print('wrote', out_dxf, out_json)
