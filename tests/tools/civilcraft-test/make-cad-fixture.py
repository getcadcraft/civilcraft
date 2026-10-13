#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""make-cad-fixture.py — the CAD linework fixture for CivilCraft 0.4 V1 (open DWG/DXF as linework).

    tools/civilcraft-test/venv/bin/python tools/civilcraft-test/make-cad-fixture.py

Writes tools/civilcraft-test/fixtures/cad/site-linework.dxf (DXF R2018, written by ezdxf, US survey feet) and, when the
ODA File Converter from setup-dwg-readers.sh and xvfb-run are present, site-linework-2018.dwg and site-linework-2000.dwg
converted from it by ODA — an independent DWG writer. The drawing is made up (no client data):

  a hill   z = 120 - 0.0004 * ((x - X0)^2 + (y - Y0)^2)   (X0, Y0 = 2,000,500 / 500,500, state-plane sized)
  C-TOPO-MAJR / C-TOPO-MINR  contours 100 … 119 ft as closed LWPOLYLINEs of four bulged arcs (exact circles) at their
                             elevation (majors every 5 ft)
  C-TOPO-BRKL   a 3D POLYLINE across the top, its vertices on the hill
  V-BNDY        a closed LWPOLYLINE rectangle at elevation 0 (2D: the surface boundary)
  V-NODE        POINTs with z on the hill (spot elevations)
  C-ROAD        LINE + ARC + an open LWPOLYLINE with a bulge, all 2D
  L-PLNT        three INSERTs of block TREE (a circle and a cross on layer 0 → they take L-PLNT)
  TEST-OCS      an LWPOLYLINE with extrusion (0,0,-1): its OCS x is world -x
  C-TOPO-SPLN   a SPLINE through fit points
  ANNO          TEXT (not linework: counted, left out)
  paper space   a LINE (left out)

The facts the test checks are in the JS test (bin/test-civilcraft-cad.mjs), computed from the same formula.
"""
import math
import os
import shutil
import subprocess
import tempfile

import ezdxf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'fixtures', 'cad')
X0, Y0 = 2000500.0, 500500.0


def hill(x, y):
    return 120 - 0.0004 * ((x - X0) ** 2 + (y - Y0) ** 2)


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = ezdxf.new('R2018', setup=False)
    doc.header['$INSUNITS'] = 21          # US survey feet
    doc.header['$MEASUREMENT'] = 0
    for name, color in [('C-TOPO-MAJR', 1), ('C-TOPO-MINR', 8), ('C-TOPO-BRKL', 2), ('V-BNDY', 7), ('V-NODE', 3),
                        ('C-ROAD', 5), ('L-PLNT', 3), ('TEST-OCS', 6), ('C-TOPO-SPLN', 4), ('ANNO', 7)]:
        doc.layers.add(name, color=color)
    msp = doc.modelspace()
    b = math.tan(math.pi / 8)             # 90° arcs
    for z in range(100, 120):
        r = math.sqrt((120 - z) / 0.0004)
        pts = [(X0 + r, Y0, 0, 0, b), (X0, Y0 + r, 0, 0, b), (X0 - r, Y0, 0, 0, b), (X0, Y0 - r, 0, 0, b)]
        pl = msp.add_lwpolyline(pts, format='xyseb', close=True,
                                dxfattribs={'layer': 'C-TOPO-MAJR' if z % 5 == 0 else 'C-TOPO-MINR', 'elevation': float(z)})
    ridge = [(X0 + dx, Y0 + dx * 0.25, hill(X0 + dx, Y0 + dx * 0.25)) for dx in range(-400, 401, 50)]
    msp.add_polyline3d(ridge, dxfattribs={'layer': 'C-TOPO-BRKL'})
    msp.add_lwpolyline([(X0 - 450, Y0 - 450), (X0 + 450, Y0 - 450), (X0 + 450, Y0 + 450), (X0 - 450, Y0 + 450)],
                       close=True, dxfattribs={'layer': 'V-BNDY'})
    for (dx, dy) in [(0, 0), (100, 50), (-150, 120), (210, -180), (-300, -260)]:
        x, y = X0 + dx, Y0 + dy
        msp.add_point((x, y, hill(x, y)), dxfattribs={'layer': 'V-NODE'})
    msp.add_line((X0 - 500, Y0 - 300), (X0 + 500, Y0 - 300), dxfattribs={'layer': 'C-ROAD'})
    msp.add_arc((X0 + 500, Y0 - 200), 100, 270, 360, dxfattribs={'layer': 'C-ROAD'})
    msp.add_lwpolyline([(X0 - 500, Y0 - 340, 0, 0, 0.5), (X0 - 300, Y0 - 340, 0, 0, 0), (X0 - 200, Y0 - 380)],
                       format='xyseb', dxfattribs={'layer': 'C-ROAD'})
    tree = doc.blocks.new('TREE', base_point=(0, 0))
    tree.add_circle((0, 0), 10)
    tree.add_line((-10, 0), (10, 0))
    tree.add_line((0, -10), (0, 10))
    for (dx, dy, s, rot) in [(-350, 300, 1, 0), (-320, 340, 2, 45), (-280, 300, 1.5, 90)]:
        msp.add_blockref('TREE', (X0 + dx, Y0 + dy), dxfattribs={'layer': 'L-PLNT', 'xscale': s, 'yscale': s, 'rotation': rot})
    # OCS x = world -x for extrusion (0,0,-1): the polyline's OCS points (-(X0+10), Y0+400) … are world (X0+10, Y0+400) …
    msp.add_lwpolyline([(-(X0 + 10), Y0 + 400), (-(X0 + 60), Y0 + 400), (-(X0 + 60), Y0 + 440)],
                       dxfattribs={'layer': 'TEST-OCS', 'extrusion': (0, 0, -1)})
    msp.add_spline([(X0 + 300, Y0 + 300, 0), (X0 + 340, Y0 + 360, 0), (X0 + 400, Y0 + 380, 0), (X0 + 440, Y0 + 430, 0)],
                   dxfattribs={'layer': 'C-TOPO-SPLN'})
    msp.add_text('SITE', dxfattribs={'layer': 'ANNO', 'height': 10, 'insert': (X0, Y0 - 420)})
    doc.paperspace().add_line((0, 0), (10, 10))
    dxf = os.path.join(OUT, 'site-linework.dxf')
    doc.saveas(dxf)
    print('wrote', dxf)

    oda = os.path.join(HERE, 'venv', 'dwg-readers', 'oda', 'AppRun')
    xvfb = shutil.which('xvfb-run')
    if not (os.path.exists(oda) and xvfb):
        print('ODA File Converter or xvfb-run missing: no DWG written')
        return
    for ver, tag in [('ACAD2018', '2018'), ('ACAD2000', '2000')]:
        with tempfile.TemporaryDirectory() as tmp:
            src, dst = os.path.join(tmp, 'in'), os.path.join(tmp, 'out')
            os.makedirs(src); os.makedirs(dst)
            shutil.copy(dxf, src)
            subprocess.run([xvfb, '-a', oda, src, dst, ver, 'DWG', '0', '1', '*.dxf'], check=False, timeout=600,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            got = os.path.join(dst, 'site-linework.dwg')
            if not os.path.exists(got):
                raise SystemExit('ODA wrote no DWG for ' + ver)
            out = os.path.join(OUT, 'site-linework-' + tag + '.dwg')
            shutil.copy(got, out)
            print('wrote', out)


if __name__ == '__main__':
    main()
