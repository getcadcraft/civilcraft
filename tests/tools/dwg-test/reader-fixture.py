# SPDX-License-Identifier: Apache-2.0
"""reader-fixture.py — builder R's feature fixture: a DXF (made with ezdxf) holding what the corpus lacks
(true colours, colour books, transparency, every lineweight, MINSERT, 3D polylines, meshes, polyface,
splines by control points and by fit points, rational splines, hatches with every edge type, gradients,
images, wipeouts, leaders, tolerances, rays/xlines, shapes of text, multi-line attributes, xdata, xrecords,
groups, UCS/views, linetypes with dashes and text). The ODA File Converter then saves it as DWG in every
version and reader-compare.mjs checks our reader against the converter's own DXF of those DWGs.

    python reader-fixture.py out.dxf
"""
import math
import sys

import ezdxf
from ezdxf import colors
from ezdxf.math import Vec3


def main(out):
    doc = ezdxf.new('R2018', setup=True)
    msp = doc.modelspace()
    doc.layers.add('TC', true_color=colors.rgb2int((10, 200, 30)), lineweight=35)
    doc.layers.add('Off', color=3).off()
    doc.layers.add('Frozen').freeze()
    doc.layers.add('Locked').lock()
    doc.layers.add('NoPlot').dxf.plot = 0
    doc.appids.add('CCDWG')
    # linetypes with dashes and text
    doc.linetypes.add('CCDASH', pattern=[0.75, 0.5, -0.25], description='Dash __ __')
    try:
        doc.linetypes.add('CCTEXT', pattern='A,.5,-.2,["GAS",STANDARD,S=.1,U=0.0,X=-0.1,Y=-.05],-.25', description='Gas --GAS--', length=1.1)
    except Exception:  # noqa
        pass
    # true colours, transparency, lineweights
    for i, lw in enumerate([0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211, -1, -2, -3]):
        e = msp.add_line((i, 0), (i, 5), dxfattribs={'lineweight': lw, 'layer': 'TC'})
        if i % 3 == 0:
            e.rgb = (i * 9 % 256, 255 - i * 7 % 256, 100)
        if i % 4 == 1:
            e.transparency = (i % 10) / 10
        if i % 5 == 2:
            e.dxf.color = i + 1
    c = msp.add_circle((40, 0), 3, dxfattribs={'color': 256, 'linetype': 'CCDASH', 'ltscale': 2.5})
    c.set_xdata('CCDWG', [(1000, 'hello'), (1040, 3.25), (1070, 7), (1071, 123456), (1010, (1, 2, 3)), (1002, '{'), (1000, 'x'), (1002, '}'), (1005, c.dxf.handle)])
    msp.add_arc((50, 0), 2, 10, 250, dxfattribs={'thickness': 2})
    msp.add_arc((55, 0), 2, 300, 30, dxfattribs={'extrusion': (0, 0, -1)})
    msp.add_ellipse((60, 0), major_axis=(4, 1, 0), ratio=0.4, start_param=0.3, end_param=5.1)
    msp.add_point((65, 0, 2), dxfattribs={'angle': 30})
    msp.add_ray((70, 0), (1, 1, 0))
    msp.add_xline((72, 0), (1, -0.5, 0))
    msp.add_solid([(80, 0), (84, 0), (80, 3), (84, 4)])
    msp.add_trace([(90, 0), (94, 0), (90, 3), (94, 4)])
    msp.add_3dface([(100, 0, 0), (104, 0, 1), (104, 3, 2), (100, 3, 3)], dxfattribs={'invisible_edges': 5})
    # text
    msp.add_text('Left', dxfattribs={'height': 1.5, 'rotation': 12, 'oblique': 15, 'width': 0.8}).set_placement((0, 20))
    from ezdxf.enums import TextEntityAlignment
    for k, al in enumerate([TextEntityAlignment.CENTER, TextEntityAlignment.RIGHT, TextEntityAlignment.MIDDLE_CENTER, TextEntityAlignment.TOP_RIGHT, TextEntityAlignment.FIT, TextEntityAlignment.ALIGNED]):
        t = msp.add_text('Al' + str(k) + ' ÄÖü°±', dxfattribs={'height': 1})
        if al in (TextEntityAlignment.FIT, TextEntityAlignment.ALIGNED):
            t.set_placement((10 + k * 10, 20), (16 + k * 10, 21), align=al)
        else:
            t.set_placement((10 + k * 10, 20), align=al)
    m = msp.add_mtext('Line one\\PLine two {\\H2x;big} \\U+2205 ∅ 中文', dxfattribs={'char_height': 1.2, 'width': 20, 'attachment_point': 5, 'style': 'OpenSans'})
    m.dxf.insert = (0, 30)
    m.dxf.text_direction = (0.8, 0.6, 0)
    m.dxf.line_spacing_factor = 1.5
    m2 = msp.add_mtext('Background', dxfattribs={'char_height': 1, 'insert': (30, 30)})
    m2.set_bg_color(2, scale=1.4)
    # polylines
    lw = msp.add_lwpolyline([(0, 40, 0.1, 0.2, 0.5), (5, 40, 0, 0, 0), (5, 45, 0.3, 0.3, -1), (0, 45)], format='xyseb', close=True)
    lw.dxf.elevation = 3
    lw2 = msp.add_lwpolyline([(10, 40), (15, 42), (20, 40)])
    lw2.dxf.const_width = 0.25
    msp.add_polyline2d([(30, 40), (35, 40), (35, 45)], dxfattribs={'flags': 1})
    p2 = msp.add_polyline2d([(40, 40, 0, 0, 0.5), (45, 40, 0.2, 0.4, 0), (45, 45)], format='xyseb')
    p2.dxf.elevation = (0, 0, 2.5)
    msp.add_polyline3d([(50, 40, 0), (55, 40, 1), (55, 45, 3), (50, 45, 2)], close=True)
    mesh = msp.add_polymesh((3, 4))
    for mi in range(3):
        for ni in range(4):
            mesh.set_mesh_vertex((mi, ni), (60 + mi, 40 + ni, (mi * ni) % 3))
    pf = msp.add_polyface()
    pf.append_face([(70, 40, 0), (72, 40, 0), (72, 42, 1), (70, 42, 1)])
    pf.append_face([(72, 40, 0), (74, 41, 0), (72, 42, 1)])
    # splines
    msp.add_spline(fit_points=[(0, 60), (3, 62), (6, 58), (9, 61), (12, 60)])
    sp = msp.add_open_spline([(20, 60), (22, 64), (25, 57), (28, 63), (30, 60)], degree=3)
    sp.dxf.flags = sp.dxf.flags | 8
    msp.add_rational_spline([(40, 60), (42, 64), (45, 57), (48, 63)], weights=[1, 2, 0.5, 1], degree=3)
    try:
        cs = msp.add_spline()
        cs.set_closed([(60, 60), (63, 62), (66, 58), (62, 56)])
    except Exception as ex:  # noqa
        pass
    # hatches: solid with polyline path, pattern with edge paths, gradient
    h = msp.add_hatch(color=3)
    h.paths.add_polyline_path([(0, 70, 0), (5, 70, 0.5), (5, 75, 0), (0, 75, 0)], is_closed=True)
    h2 = msp.add_hatch(color=4)
    h2.set_pattern_fill('ANSI31', scale=0.5, angle=30)
    ep = h2.paths.add_edge_path()
    ep.add_line((10, 70), (15, 70))
    ep.add_arc((15, 72.5), 2.5, -90, 90, ccw=True)
    ep.add_ellipse((12.5, 75), (2.5, 0), 0.4, 0, 180, ccw=True)
    ep.add_line((10, 75), (10, 70))
    ep2 = h2.paths.add_edge_path(flags=16)
    ep2.add_spline(control_points=[(11, 71), (12, 73), (13, 71), (11, 71)], knot_values=[0, 0, 0, 0, 1, 1, 1, 1], degree=3)
    h2.set_seed_points([(12, 72)])
    h3 = msp.add_hatch()
    h3.set_gradient((255, 0, 0), (0, 0, 255), rotation=45, name='LINEAR')
    h3.paths.add_polyline_path([(20, 70), (25, 70), (25, 75)], is_closed=True)
    h4 = msp.add_hatch(color=6)
    h4.set_pattern_fill('ANSI31', scale=1, angle=0)
    ep4 = h4.paths.add_edge_path()
    ep4.add_arc((32.5, 72.5), 2.5, 0, 360, ccw=False)
    # blocks: attributes, MINSERT, nested
    blk = doc.blocks.new('CCBLK', base_point=(1, 1))
    blk.add_line((0, 0), (2, 2))
    blk.add_circle((1, 1), 0.5, dxfattribs={'color': 0})
    blk.add_attdef('TAG1', (0, -1), dxfattribs={'height': 0.4, 'prompt': 'Enter tag'})
    blk.add_attdef('TAG2', (0, -2), dxfattribs={'height': 0.3, 'flags': 1})
    try:
        ml = blk.add_attdef('MLTAG', (0, -3), dxfattribs={'height': 0.3})
        mt = msp.add_mtext('first line\\Psecond line', dxfattribs={'char_height': 0.3, 'width': 5})
        ml.embed_mtext(mt)
    except Exception as ex:  # noqa
        print('multi-line attdef:', ex)
    ins = msp.add_blockref('CCBLK', (0, 90), dxfattribs={'xscale': 2, 'yscale': 3, 'zscale': 1, 'rotation': 15})
    ins.add_auto_attribs({'TAG1': 'value one', 'TAG2': 'secret'})
    try:
        a = ins.add_attrib('MLTAG', '', (0, 87), dxfattribs={'height': 0.3})
        mt2 = msp.add_mtext('attrib line 1\\Pattrib line 2', dxfattribs={'char_height': 0.3, 'width': 6, 'insert': (0, 87)})
        a.embed_mtext(mt2)
    except Exception as ex:  # noqa
        print('multi-line attrib:', ex)
    mi = msp.add_blockref('CCBLK', (20, 90), dxfattribs={'column_count': 3, 'row_count': 2, 'column_spacing': 4, 'row_spacing': 5})
    nest = doc.blocks.new('NEST')
    nest.add_blockref('CCBLK', (0, 0))
    nest.add_lwpolyline([(0, 0), (3, 0), (3, 3)])
    msp.add_blockref('NEST', (40, 90), dxfattribs={'xscale': -1})
    # dimensions
    dim = msp.add_linear_dim(base=(0, 105), p1=(0, 100), p2=(10, 100))
    dim.render()
    dim2 = msp.add_aligned_dim(p1=(20, 100), p2=(28, 104), distance=2)
    dim2.render()
    dim3 = msp.add_radius_dim(center=(40, 102), radius=3, angle=45)
    dim3.render()
    dim4 = msp.add_diameter_dim(center=(50, 102), radius=3, angle=30)
    dim4.render()
    dim5 = msp.add_angular_dim_3p(base=(62, 106), center=(60, 100), p1=(65, 100), p2=(60, 105))
    dim5.render()
    dim6 = msp.add_ordinate_x_dim(feature_location=(70, 100), offset=(2, 3))
    dim6.render()
    # leader, tolerance, mline
    msp.add_leader([(0, 120), (3, 123), (6, 123)])
    ld = msp.add_leader([(0, 130), (3, 133), (6, 133)], dxfattribs={'text_height': 2.5, 'text_width': 7.25, 'has_hookline': 1, 'hookline_direction': 1, 'annotation_type': 0, 'has_arrowhead': 0})
    lm = msp.add_mtext('Leader note', dxfattribs={'insert': (6.5, 134), 'char_height': 2.5, 'width': 7.25})
    ld.dxf.annotation_handle = lm.dxf.handle
    msp.new_entity('TOLERANCE', dxfattribs={'insert': (10, 120), 'content': '{\\Fgdt;j}%%v0.1%%v%%v', 'dimstyle': 'Standard'})
    try:
        msp.add_mline([(20, 120), (25, 120), (25, 125)])
    except Exception:  # noqa
        pass
    # image and wipeout
    try:
        imgdef = doc.add_image_def(filename='pic.png', size_in_pixel=(640, 480))
        msp.add_image(imgdef, insert=(40, 120), size_in_units=(6.4, 4.8), rotation=10)
        msp.add_wipeout([(50, 120), (55, 120), (55, 124), (50, 124)])
    except Exception:  # noqa
        pass
    # paper space layout with viewports
    lay = doc.layouts.new('Sheet A')
    lay.page_setup(size=(420, 297), margins=(10, 10, 10, 10), units='mm')
    lay.add_viewport(center=(150, 150), size=(200, 120), view_center_point=(30, 60), view_height=80)
    vp = lay.add_viewport(center=(330, 100), size=(120, 80), view_center_point=(5, 5), view_height=20)
    vp.dxf.view_twist_angle = 15
    vp.frozen_layers = ['Frozen']
    lay.add_text('Paper text', dxfattribs={'height': 5}).set_placement((20, 20))
    # objects: xrecord in named dictionary, group
    xr = doc.objects.add_xrecord(doc.rootdict.dxf.handle)
    xr.reset([(1, 'text'), (40, 2.5), (70, 9), (10, (1, 2, 3)), (90, 99999), (290, 1), (330, doc.rootdict.dxf.handle)])
    doc.rootdict['CC_XREC'] = xr
    g = doc.groups.new('CCGROUP')
    g.extend([c, lw])
    u = doc.ucs.add('CCUCS')
    u.dxf.origin = (1, 2, 3); u.dxf.xaxis = (1, 0, 0); u.dxf.yaxis = (0, 0.6, 0.8)
    v = doc.views.add('CCVIEW')
    v.dxf.center = (10, 10); v.dxf.height = 30; v.dxf.width = 40
    doc.header['$REALWORLDSCALE'] = 0
    doc.header['$SHADOWPLANELOCATION'] = 2.5
    doc.header['$INSUNITS'] = 4
    doc.header['$LTSCALE'] = 2.0
    doc.saveas(out)


if __name__ == '__main__':
    main(sys.argv[1])
