# SPDX-License-Identifier: Apache-2.0
"""solids-fixture.py — builder S's fixture: 3DSOLID / REGION / BODY with known ACIS data and LIGHTs, made with ezdxf
(its ACIS builder: mesh → body). The ODA File Converter then saves it as DWG in every version
(solids-fixture.sh) and solids-check.mjs compares our reader with the converter's own DXF of those DWGs.

    python solids-fixture.py out-dir

Writes out-dir/solids-sat.dxf (R2000: ACIS as SAT text) and out-dir/solids-sab.dxf (R2018: ACIS as SAB binary).
"""
import math
import sys
import os

import ezdxf
from ezdxf.acis import api as acis
from ezdxf.render import forms, MeshBuilder


def region_mesh():
    m = MeshBuilder()
    m.add_face([(0, 10, 0), (4, 10, 0), (4, 13, 0), (0, 13, 0)])
    return m


def build(version, path):
    doc = ezdxf.new(version)
    doc.layers.add('SOLIDS', color=3)
    doc.layers.add('LIGHTS', color=2)
    msp = doc.modelspace()
    bodies = []
    # a cube (small ACIS data)
    s = msp.add_3dsolid(dxfattribs={'layer': 'SOLIDS'})
    acis.export_dxf(s, [acis.body_from_mesh(forms.cube().translate(2, 2, 0.5))])
    # a cylinder with many sides (several SAT chunks / a bigger SAB record)
    s = msp.add_3dsolid(dxfattribs={'layer': 'SOLIDS', 'color': 5})
    acis.export_dxf(s, [acis.body_from_mesh(forms.cylinder(count=48, radius=2, top_center=(0, 0, 6)).translate(10, 0, 0))])
    # a sphere with many faces: > 256 KB of SAB, so R2013+ stores it as a blob over pages
    if os.environ.get('CC_BIG', '1') == '1':
        s = msp.add_3dsolid(dxfattribs={'layer': 'SOLIDS', 'color': 1})
        acis.export_dxf(s, [acis.body_from_mesh(forms.sphere(count=72, stacks=36, radius=3).translate(20, 0, 3))])
    # a region (one planar face)
    r = msp.add_region(dxfattribs={'layer': 'SOLIDS', 'color': 4})
    acis.export_dxf(r, [acis.body_from_mesh(region_mesh())])
    # a body
    b = msp.add_body(dxfattribs={'layer': 'SOLIDS', 'color': 6})
    acis.export_dxf(b, [acis.body_from_mesh(forms.cube().scale_uniform(2).translate(30, 10, 1))])
    # a solid inside a block, inserted twice
    blk = doc.blocks.new('SOLIDBLK')
    s = blk.add_3dsolid()
    acis.export_dxf(s, [acis.body_from_mesh(forms.cube())])
    msp.add_blockref('SOLIDBLK', (40, 0, 0))
    msp.add_blockref('SOLIDBLK', (44, 0, 0), dxfattribs={'rotation': 30})
    # lights: distant, point, spot (DXF group codes from the public DXF reference)
    for k, (typ, loc, tgt) in enumerate([(1, (0, 0, 20), (0, 0, 0)), (2, (5, 5, 8), (5, 5, 0)), (3, (12, -6, 9), (10, 0, 0))]):
        light = msp.new_entity('LIGHT', {
            'layer': 'LIGHTS', 'version': 1, 'name': 'Light' + str(k + 1), 'type': typ, 'status': 1 if k != 1 else 0,
            'plot_glyph': 1 if k == 2 else 0, 'intensity': 0.5 + k, 'location': loc, 'target': tgt,
            'attenuation_type': k % 3, 'use_attenuation_limits': 1 if k == 1 else 0,
            'attenuation_start_limits': 1.5 * k, 'attenuation_end_limits': 10.0 + k,
            'hotspot_angle': 30 + k, 'falloff_angle': 45 + k,
            'cast_shadows': 1 if k != 0 else 0, 'shadow_type': k % 2, 'shadow_map_size': 256 << k, 'shadow_map_softness': 1 + k,
        })
        if k == 1:
            light.rgb = (255, 200, 120)
        else:
            light.dxf.color = 7 - k
    doc.saveas(path)


def main(out):
    os.makedirs(out, exist_ok=True)
    build('R2000', os.path.join(out, 'solids-sat.dxf'))
    build('R2018', os.path.join(out, 'solids-sab.dxf'))


if __name__ == '__main__':
    main(sys.argv[1])
