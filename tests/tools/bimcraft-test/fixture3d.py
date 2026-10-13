# SPDX-License-Identifier: Apache-2.0
"""fixture3d.py <out.dxf> — an R2018 DXF made by ezdxf with every 3D entity type BimCraft's 3D
drawing view knows about, for `node bin/test-bimcraft.mjs --dwg3d`. make-fixture3d.sh turns it into
DWGs (AutoCAD 2000 and 2018) with the ODA File Converter; the test reads both DWGs (readDwg) and this
DXF (dxf-model.js).

Units: millimetres. Everything sits inside the box (0,0,0)–(10000, 8000, 4000) except where noted;
the test checks counts and bounds against the numbers below, so keep them in step.

  layer FLAT    a LWPOLYLINE rectangle 0..10000 × 0..8000 at z 0 (2D linework stays flat)
  layer LINES   a 3D LINE (1000,1000,0)-(2000,2000,1500); a LINE with thickness 800
  layer PLINE   LWPOLYLINE at elevation 1200, closed, thickness 300; 2D POLYLINE (bulged) at elevation 600
  layer P3D     a 3D POLYLINE of 5 vertices (libredwg-web read 4 from the AutoCAD 2000 DWG)
  layer FACES   two 3DFACEs (a quad and a triangle)
  layer PFACE   a POLYFACE mesh cube 1000 mm (8 vertices, 6 faces)
  layer PMESH   a 4 × 3 POLYMESH (12 vertices, 6 quads)
  layer CIRC    CIRCLE r 400 thickness 1000; ARC thickness 500; a CIRCLE with extrusion (1,0,0) (a wall disc)
  layer BLK     block CUBE (a polyface-free cube of 6 3DFACEs, 500 mm) inserted 3 times: plain, rotated + scaled
                at z 2000, and with extrusion (0,-1,0); block NEST holds one CUBE insert, inserted once
  layer SOLIDS  3DSOLID, BODY, REGION (ACIS), SURFACE (extruded), MESH — "Not drawn yet"
  layer TEXT    a TEXT at z 0
"""
import sys
import ezdxf
from ezdxf.render import forms

doc = ezdxf.new('R2018', setup=False)
doc.header['$INSUNITS'] = 4
msp = doc.modelspace()
for name, color in [('FLAT', 7), ('LINES', 1), ('PLINE', 2), ('P3D', 3), ('FACES', 4), ('PFACE', 5),
                    ('PMESH', 6), ('CIRC', 30), ('BLK', 140), ('SOLIDS', 8), ('TEXT', 7)]:
    doc.layers.add(name, color=color)

msp.add_lwpolyline([(0, 0), (10000, 0), (10000, 8000), (0, 8000)], close=True, dxfattribs={'layer': 'FLAT'})

msp.add_line((1000, 1000, 0), (2000, 2000, 1500), dxfattribs={'layer': 'LINES'})
msp.add_line((3000, 1000, 0), (4000, 1000, 0), dxfattribs={'layer': 'LINES', 'thickness': 800})

lw = msp.add_lwpolyline([(5000, 1000), (6000, 1000), (6000, 2000), (5000, 2000)], close=True,
                        dxfattribs={'layer': 'PLINE', 'elevation': 1200, 'thickness': 300})
p2 = msp.add_polyline2d([(7000, 1000), (8000, 1000), (8000, 2000)], dxfattribs={'layer': 'PLINE'})
p2.dxf.elevation = (0, 0, 600)
p2.vertices[0].dxf.bulge = 0.5

msp.add_polyline3d([(1000, 3000, 0), (2000, 3000, 500), (2000, 4000, 1000), (1000, 4000, 1500), (1000, 3000, 2000)],
                   dxfattribs={'layer': 'P3D'})

msp.add_3dface([(3000, 3000, 0), (4000, 3000, 0), (4000, 4000, 1000), (3000, 4000, 1000)], dxfattribs={'layer': 'FACES'})
msp.add_3dface([(4500, 3000, 0), (5000, 3000, 0), (4750, 3500, 800)], dxfattribs={'layer': 'FACES'})

cube = forms.cube().scale_uniform(1000).translate(6500, 3500, 500)
pf = msp.add_polyface(dxfattribs={'layer': 'PFACE'})
pf.append_faces([[cube.vertices[i] for i in f] for f in cube.faces])
pf.optimize()

pm = msp.add_polymesh((4, 3), dxfattribs={'layer': 'PMESH'})
for m in range(4):
    for n in range(3):
        pm.set_mesh_vertex((m, n), (8000 + m * 500, 3000 + n * 500, (m * n) * 100))

msp.add_circle((1500, 6000), 400, dxfattribs={'layer': 'CIRC', 'thickness': 1000})
msp.add_arc((3000, 6000), 400, 0, 180, dxfattribs={'layer': 'CIRC', 'thickness': 500})
# OCS: extrusion +X — the circle stands in the YZ plane. OCS centre (oy, oz, ox): world (4500, 6000, 1000).
c = msp.add_circle((6000, 1000, 4500), 300, dxfattribs={'layer': 'CIRC', 'extrusion': (1, 0, 0)})

blk = doc.blocks.new('CUBE', base_point=(0, 0, 0))
cb = forms.cube().scale_uniform(500).translate(250, 250, 250)
for f in cb.faces:
    blk.add_3dface([cb.vertices[i] for i in f])
nest = doc.blocks.new('NEST')
nest.add_blockref('CUBE', (0, 0, 0))
msp.add_blockref('CUBE', (5000, 5500, 0), dxfattribs={'layer': 'BLK'})
msp.add_blockref('CUBE', (6500, 5500, 2000), dxfattribs={'layer': 'BLK', 'rotation': 45, 'xscale': 2, 'yscale': 1, 'zscale': 2})
# extrusion (0,-1,0): the block's Z points to -Y; OCS insert (ix, iz?, ...) — world placement checked in the test
msp.add_blockref('CUBE', (8000, 0, -6000), dxfattribs={'layer': 'BLK', 'extrusion': (0, -1, 0)})
msp.add_blockref('NEST', (9000, 7000, 0), dxfattribs={'layer': 'BLK'})

# Unsupported 3D: ACIS bodies and the like (counted, never guessed)
from ezdxf.acis import api as acis_api
from ezdxf.render import forms as F
body = acis_api.body_from_mesh(F.cube().scale_uniform(400).translate(9000, 1000, 200))
s3 = msp.add_3dsolid(dxfattribs={'layer': 'SOLIDS'})
acis_api.export_dxf(s3, [body])
b = msp.add_body(dxfattribs={'layer': 'SOLIDS'})
acis_api.export_dxf(b, [acis_api.body_from_mesh(F.cube().scale_uniform(300).translate(9000, 2000, 150))])
r = msp.add_region(dxfattribs={'layer': 'SOLIDS'})
acis_api.export_dxf(r, [acis_api.body_from_mesh(F.cube().scale_uniform(200).translate(9000, 2500, 100))])
sf = msp.add_extruded_surface(dxfattribs={'layer': 'SOLIDS'})
acis_api.export_dxf(sf, [acis_api.body_from_mesh(F.cube().scale_uniform(200).translate(9000, 3000, 100))])
mesh = msp.add_mesh(dxfattribs={'layer': 'SOLIDS'})
with mesh.edit_data() as md:
    md.vertices = [(9500, 7000, 0), (9900, 7000, 0), (9900, 7400, 0), (9500, 7400, 0)]
    md.faces = [(0, 1, 2, 3)]

msp.add_text('3D FIXTURE', dxfattribs={'layer': 'TEXT', 'height': 200, 'insert': (500, 7500)})

doc.audit()
doc.saveas(sys.argv[1])
