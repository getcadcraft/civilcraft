#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""make-block-fixture.py — survey points as blocks, for CivilCraft 0.5 WL.19 (survey points from blocks).

    tools/civilcraft-test/venv/bin/python tools/civilcraft-test/make-block-fixture.py

Writes tools/civilcraft-test/fixtures/cad/survey-blocks.dxf (DXF R2018 by ezdxf, feet) and, when the ODA File Converter
from setup-dwg-readers.sh and xvfb-run are present, survey-blocks-2018.dwg and survey-blocks-2000.dwg converted from it by
ODA (an independent DWG writer), plus survey-blocks.json = the facts the test checks. Made up, no client data:

  SURVEY_PT  a circle + attributes PT, DESC, ELEV; ten references on V-NODE at z = 0 (a 2D drawing: the elevation is in
             ELEV), numbers 101…110 except: one "105" twice (the second must be renumbered), one with no PT; one ELEV "N/A"
  SPOT       a cross, no attributes; three references on V-SPOT inserted at their elevation (3D)
  GROUP      a block holding two SURVEY_PT references; one GROUP reference on V-NODE: the nested ones are NOT points
  SURVEY_PT  one more reference with extrusion (0, 0, -1) at OCS (OX, OY): its world X is -OX
  SPOT       a MINSERT on V-SPOT, 2 columns × 2 rows, 10 ft apart, turned 90°
"""
import json
import math
import os
import shutil
import subprocess
import tempfile

import ezdxf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'fixtures', 'cad')
X0, Y0 = 2000000.0, 500000.0


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = ezdxf.new('R2018', setup=False)
    doc.header['$INSUNITS'] = 2   # feet
    msp = doc.modelspace()
    for name, color in [('V-NODE', 3), ('V-SPOT', 5), ('V-NODE-OCS', 1)]:
        doc.layers.add(name, color=color)

    pt = doc.blocks.new('SURVEY_PT')
    pt.add_circle((0, 0), 0.5)
    pt.add_attdef('PT', (0.7, 0.2), dxfattribs={'height': 0.4})
    pt.add_attdef('DESC', (0.7, -0.3), dxfattribs={'height': 0.3})
    pt.add_attdef('ELEV', (0.7, -0.8), dxfattribs={'height': 0.3})
    spot = doc.blocks.new('SPOT')
    spot.add_line((-0.5, 0), (0.5, 0))
    spot.add_line((0, -0.5), (0, 0.5))
    grp = doc.blocks.new('GROUP')
    for gx in (0, 5):
        r = grp.add_blockref('SURVEY_PT', (gx, 0))
        r.add_auto_attribs({'PT': 'G' + str(gx), 'DESC': 'NESTED', 'ELEV': '1'})

    facts = {'points': [], 'spots': [], 'group': None, 'ocs': None, 'minsert': []}
    descs = ['EP', 'EP', 'TC', 'TC', 'BC', 'CL', 'EP', 'TC', 'BC', 'CL']
    for i in range(10):
        x, y = X0 + 10 * i, Y0 + 3 * i * i
        no = '105' if i == 5 else ('' if i == 7 else str(101 + i))
        elev = 'N/A' if i == 8 else '%.2f' % (100 + 0.37 * i)
        ref = msp.add_blockref('SURVEY_PT', (x, y), dxfattribs={'layer': 'V-NODE'})
        ref.add_auto_attribs({'PT': no, 'DESC': descs[i], 'ELEV': elev})
        facts['points'].append({'x': x, 'y': y, 'pt': no, 'desc': descs[i], 'elev': elev})
    for i, z in enumerate([98.5, 99.25, 101.75]):
        x, y = X0 + 200 + 7 * i, Y0 - 50 - 11 * i
        msp.add_blockref('SPOT', (x, y, z), dxfattribs={'layer': 'V-SPOT'})
        facts['spots'].append({'x': x, 'y': y, 'z': z})
    msp.add_blockref('GROUP', (X0 - 100, Y0), dxfattribs={'layer': 'V-NODE'})
    facts['group'] = {'x': X0 - 100, 'y': Y0}
    OX, OY = -(X0 + 300), Y0 + 40   # OCS of extrusion (0, 0, -1): world X = -OX
    r = msp.add_blockref('SURVEY_PT', (OX, OY, 0), dxfattribs={'layer': 'V-NODE-OCS', 'extrusion': (0, 0, -1)})
    r.add_auto_attribs({'PT': '201', 'DESC': 'OCS', 'ELEV': '50'})
    facts['ocs'] = {'x': -OX, 'y': OY}
    m = msp.add_blockref('SPOT', (X0 + 400, Y0 + 400, 0), dxfattribs={'layer': 'V-SPOT', 'rotation': 90})
    m.grid(size=(2, 2), spacing=(10, 10))   # rows, cols; row spacing along the turned Y, column spacing along the turned X
    # where each cell lands, as ezdxf itself works it out (an independent answer)
    for v in m.multi_insert():
        facts['minsert'].append({'x': v.dxf.insert.x, 'y': v.dxf.insert.y})
    dxf = os.path.join(OUT, 'survey-blocks.dxf')
    doc.saveas(dxf)
    with open(os.path.join(OUT, 'survey-blocks.json'), 'w') as f:
        json.dump(facts, f, indent=1)
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
            got = os.path.join(dst, 'survey-blocks.dwg')
            if not os.path.exists(got):
                raise SystemExit('ODA wrote no DWG for ' + ver)
            out = os.path.join(OUT, 'survey-blocks-' + tag + '.dwg')
            shutil.copy(got, out)
            print('wrote', out)


if __name__ == '__main__':
    main()
