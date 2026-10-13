# SPDX-License-Identifier: Apache-2.0
"""
m1_fixture.py out.dxf — a DXF written by ezdxf (an independent writer) with every entity kind ModelCraft's site-plan
import learned in 0.4 M1: splines (control points, rational, fit points), ellipses, TEXT with alignment, MTEXT,
HATCH with an island and with bulges, 3DFACE, SOLID, a rendered DIMENSION and a block reference with an attribute.
Prints a JSON object of facts computed by ezdxf itself (lengths of the flattened curves), or by hand where exact.
Run with tools/cadcraft-test/venv/bin/python (ezdxf 1.4). Units: meters ($INSUNITS 6).
"""
import json, math, sys
import ezdxf
from ezdxf.enums import TextEntityAlignment

out = sys.argv[1]
doc = ezdxf.new('R2010', setup=True)
doc.header['$INSUNITS'] = 6
msp = doc.modelspace()
facts = {}

def plen(pts):
    pts = list(pts)
    return sum(math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1))

# splines
s1 = msp.add_open_spline([(0, 0), (2, 4), (5, -1), (8, 3), (10, 0)], degree=3)
facts['spline_len'] = plen(v.vec2 for v in s1.construction_tool().flattening(1e-5))
s2 = msp.add_rational_spline([(20, 0), (20, 5), (25, 5)], weights=[1, math.sqrt(0.5), 1], degree=2)
facts['quarter_len'] = math.pi * 5 / 2
fit = [(0, 10), (3, 13), (6, 10), (9, 13)]
msp.add_spline(fit_points=fit)
facts['fit'] = fit
# ellipses
msp.add_ellipse((40, 0), major_axis=(4, 0), ratio=0.5)
e2 = msp.add_ellipse((40, 10), major_axis=(0, 3), ratio=0.5, start_param=0, end_param=math.pi / 2)
facts['ellipse_arc_len'] = plen(v.vec2 for v in e2.construction_tool().flattening(1e-5))
# text
t = msp.add_text('CENTER', height=1)
t.set_placement((20, -10), align=TextEntityAlignment.MIDDLE_CENTER)
msp.add_mtext('Room 101\\PKitchen', dxfattribs={'insert': (0, -10), 'char_height': 0.5, 'attachment_point': 1})
# hatches: a 10 x 6 rectangle with a round island; a polyline path with a half-circle bulge
h = msp.add_hatch()
h.paths.add_polyline_path([(50, 0), (60, 0), (60, 6), (50, 6)], is_closed=True, flags=1)
ep = h.paths.add_edge_path(flags=16)
ep.add_arc((55, 3), 1, 0, 360)
facts['hatch1_area'] = 60 - math.pi
h2 = msp.add_hatch()
h2.paths.add_polyline_path([(64, 0, 0), (68, 0, 1), (68, 4, 0), (64, 4, 0)], is_closed=True, flags=1)   # bulge 1 on the 2nd vertex
facts['hatch2_area'] = 16 + math.pi * 2 * 2 / 2
# faces
msp.add_3dface([(70, 0, 0), (72, 0, 0), (72, 2, 3), (70, 2, 3)])
facts['face3d_area'] = 2 * math.hypot(2, 3)
msp.add_solid([(80, 0), (82, 0), (80, 2), (82, 2)])
facts['solid_area'] = 4
# a dimension, drawn as its own block
dim = msp.add_linear_dim(base=(0, -20), p1=(0, -18), p2=(6, -18), dimstyle='EZDXF')
dim.render()
# a block reference with an attribute
blk = doc.blocks.new('TAG')
blk.add_circle((0, 0), 0.5)
blk.add_attdef('NO', (0.7, 0), dxfattribs={'height': 0.4})
ref = msp.add_blockref('TAG', (90, 0))
ref.add_auto_attribs({'NO': 'A-12'})
doc.saveas(out)
print(json.dumps(facts))
