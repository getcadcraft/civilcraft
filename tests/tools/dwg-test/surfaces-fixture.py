# SPDX-License-Identifier: Apache-2.0
"""surfaces-fixture.py — the SURFACE family fixture (SURFACE, PLANESURFACE, EXTRUDEDSURFACE, LOFTEDSURFACE,
REVOLVEDSURFACE, SWEPTSURFACE, NURBSURFACE) with known ACIS data and distinctive values in every type-specific field,
made with ezdxf (public API only: its ACIS builder makes the sheet bodies, its surface entities the fields). ezdxf has
no PLANESURFACE / NURBSURFACE: extra SURFACE entities are renamed in the DXF text and given their subclass marker and
CLASS entry (DXF reference: AcDbPlaneSurface, AcDbNurbSurface); the ODA File Converter fills in what they lack.
surfaces-fixture.sh then saves each DXF as DWG in all six versions and lets the converter write its DXF of each.

    python surfaces-fixture.py out-dir

Writes out-dir/surfaces-sat.dxf (R2007: ACIS as SAT text) and out-dir/surfaces-sab.dxf (R2018: ACIS as SAB).
"""
import os
import sys

import ezdxf
from ezdxf.acis import api as acis
from ezdxf.math import Matrix44
from ezdxf.render import MeshBuilder, forms


def sheet(x, y, w=4.0, h=3.0, z=0.0):
    m = MeshBuilder()
    m.add_face([(x, y, z), (x + w, y, z), (x + w, y + h, z), (x, y + h, z)])
    return m


def mat(k):
    """A distinctive affine matrix (rotation about z by k/10 rad, scale, translation) — no two alike."""
    return Matrix44.chain(Matrix44.z_rotate(0.1 * k), Matrix44.scale(1 + k / 100), Matrix44.translate(k, 2 * k, 3 * k + 0.25))


def body(e, mesh):
    acis.export_dxf(e, [acis.body_from_mesh(mesh)])


def build(version, path):
    doc = ezdxf.new(version)
    doc.layers.add('SURF', color=4)
    msp = doc.modelspace()
    renames = []   # (handle, new type, subclass marker, [(code, value)] after it)

    s = msp.add_surface(dxfattribs={'layer': 'SURF', 'u_count': 3, 'v_count': 9})
    body(s, sheet(0, 0))

    e = msp.add_extruded_surface(dxfattribs={'layer': 'SURF', 'color': 1, 'u_count': 5, 'v_count': 7})
    body(e, sheet(10, 0))
    e.dxf.class_id = 0
    e.dxf.sweep_vector = (0.5, -0.25, 7.5)
    e.dxf.draft_angle = 0.125
    e.dxf.draft_start_distance = 1.5
    e.dxf.draft_end_distance = 2.75
    e.dxf.twist_angle = 0.375
    e.dxf.scale_factor = 1.0625
    e.dxf.align_angle = 0.4375
    e.dxf.solid = 1
    e.dxf.sweep_alignment_flags = 2
    e.dxf.align_start = 1
    e.dxf.bank = 1
    e.dxf.base_point_set = 1
    e.dxf.sweep_entity_transform_computed = 1
    e.dxf.path_entity_transform_computed = 0
    e.dxf.reference_vector_for_controlling_twist = (0.0, 1.0, 0.5)
    e.transformation_matrix_extruded_entity = mat(1)
    e.sweep_entity_transformation_matrix = mat(2)
    e.path_entity_transformation_matrix = mat(3)

    lo = msp.add_lofted_surface(dxfattribs={'layer': 'SURF', 'color': 2, 'u_count': 4, 'v_count': 8})
    body(lo, sheet(20, 0))
    lo.dxf.plane_normal_lofting_type = 2
    lo.dxf.start_draft_angle = 0.25
    lo.dxf.end_draft_angle = 0.5
    lo.dxf.start_draft_magnitude = 1.25
    lo.dxf.end_draft_magnitude = 2.5
    lo.dxf.arc_length_parameterization = 1
    lo.dxf.no_twist = 0
    lo.dxf.align_direction = 1
    lo.dxf.simple_surfaces = 0
    lo.dxf.closed_surfaces = 1
    lo.dxf.solid = 0
    lo.dxf.ruled_surface = 1
    lo.dxf.virtual_guide = 1
    lo.transformation_matrix_lofted_entity = mat(4)

    r = msp.add_revolved_surface(dxfattribs={'layer': 'SURF', 'color': 3, 'u_count': 2, 'v_count': 10})
    body(r, sheet(30, 0))
    r.dxf.class_id = 0
    r.dxf.axis_point = (30.0, -1.0, 0.5)
    r.dxf.axis_vector = (0.0, 1.0, 0.0)
    r.dxf.revolve_angle = 4.5
    r.dxf.start_angle = 0.75
    r.dxf.draft_angle = 0.0625
    r.dxf.start_draft_distance = 0.875
    r.dxf.end_draft_distance = 1.125
    r.dxf.twist_angle = 0.3125
    r.dxf.solid = 1
    r.dxf.close_to_axis = 1
    r.transformation_matrix_revolved_entity = mat(5)

    w = msp.add_swept_surface(dxfattribs={'layer': 'SURF', 'color': 5, 'u_count': 1, 'v_count': 11})
    body(w, sheet(40, 0))
    w.dxf.swept_entity_id = 0
    w.dxf.path_entity_id = 0
    w.dxf.draft_angle = 0.1875
    w.dxf.draft_start_distance = 0.625
    w.dxf.draft_end_distance = 1.375
    w.dxf.twist_angle = 0.5625
    w.dxf.scale_factor = 1.25
    w.dxf.align_angle = 0.6875
    w.dxf.solid = 0
    w.dxf.sweep_alignment = 1
    w.dxf.align_start = 0
    w.dxf.bank = 1
    w.dxf.base_point_set = 0
    w.dxf.sweep_entity_transform_computed = 1
    w.dxf.path_entity_transform_computed = 1
    w.dxf.reference_vector_for_controlling_twist = (1.0, 0.0, 0.25)
    w.transformation_matrix_sweep_entity = mat(6)
    w.transformation_matrix_path_entity = mat(7)
    w.sweep_entity_transformation_matrix = mat(8)
    w.path_entity_transformation_matrix = mat(9)

    p = msp.add_surface(dxfattribs={'layer': 'SURF', 'color': 6, 'u_count': 0, 'v_count': 0})
    body(p, sheet(50, 0, 6, 2))
    renames.append((p.dxf.handle, 'PLANESURFACE', 'AcDbPlaneSurface', []))

    n = msp.add_surface(dxfattribs={'layer': 'SURF', 'color': 30, 'u_count': 12, 'v_count': 13})
    body(n, sheet(60, 0, 5, 5, 1.0))
    # AcDbNurbSurface groups as the converter writes them (170, 290, 10–13): distinctive values
    renames.append((n.dxf.handle, 'NURBSURFACE', 'AcDbNurbSurface', [('170', '3'), ('290', '1'),
                    ('10', '1.5'), ('20', '2.5'), ('30', '3.5'), ('11', '4.5'), ('21', '5.5'), ('31', '6.5'),
                    ('12', '7.5'), ('22', '8.5'), ('32', '9.5'), ('13', '10.5'), ('23', '11.5'), ('33', '12.5')]))

    # a surface in a block, inserted twice; one in paper space
    blk = doc.blocks.new('SURFBLK')
    b = blk.add_extruded_surface(dxfattribs={'u_count': 2, 'v_count': 3})
    body(b, sheet(0, 0, 1, 1))
    b.dxf.sweep_vector = (0, 0, 2)
    b.dxf.scale_factor = 1.0
    msp.add_blockref('SURFBLK', (80, 0, 0))
    msp.add_blockref('SURFBLK', (84, 0, 0), dxfattribs={'rotation': 30})
    ps = doc.layout('Layout1').add_surface(dxfattribs={'u_count': 4, 'v_count': 4})
    body(ps, forms.cube().scale_uniform(5).translate(100, 100, 0))

    doc.saveas(path)
    patch(path, renames)


def patch(path, renames):
    """Rename SURFACE entities by handle and give them their subclass marker; add their CLASS entries."""
    with open(path, encoding='utf8') as f:
        lines = f.read().split('\n')
    hmap = {h.upper(): (t, m, x) for h, t, m, x in renames}
    out = []
    i = 0
    pending = None
    while i < len(lines):
        code, val = lines[i].strip(), lines[i + 1] if i + 1 < len(lines) else ''
        if code == '0' and pending:
            out.extend(['100', pending[0]])
            for c, v in pending[1]:
                out.extend([c, v])
            pending = None
        if code == '0' and val.strip() == 'SURFACE' and i + 3 < len(lines) and lines[i + 2].strip() == '5' and lines[i + 3].strip().upper() in hmap:
            t, m, x = hmap[lines[i + 3].strip().upper()]
            out.extend([lines[i], t]); pending = (m, x); i += 2; continue
        if i + 1 < len(lines):
            out.extend([lines[i], val])
        else:
            out.append(lines[i])
        i += 2
    text = '\n'.join(out)
    cls = ''.join('  0\nCLASS\n  1\n%s\n  2\n%s\n  3\nObjectDBX Classes\n 90\n     4095\n 91\n        1\n280\n     0\n281\n     1\n' % (t, m)
                  for t, m in sorted(set((t, m) for _, t, m, _x in renames)))
    k = text.index('CLASSES')
    k = text.index('  0\nENDSEC', k)
    text = text[:k] + cls + text[k:]
    with open(path, 'w', encoding='utf8') as f:
        f.write(text)


def main(out):
    os.makedirs(out, exist_ok=True)
    build('R2007', os.path.join(out, 'surfaces-sat.dxf'))
    build('R2018', os.path.join(out, 'surfaces-sab.dxf'))


if __name__ == '__main__':
    main(sys.argv[1])
