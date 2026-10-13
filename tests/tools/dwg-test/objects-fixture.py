#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
objects-fixture.py — builder M's multileader / object fixture: ezdxf (public API) writes a DXF with multileaders of
every kind plus groups, xrecords and a dictionary of our own; tools/dwg-test/objects-fixture.mjs has the ODA File
Converter turn it into DWG in all six versions (testfiles/dwg-corpus/_fixtures/objects/<version>/mleaders.dwg).

  tools/civilcraft-test/venv/bin/python tools/dwg-test/objects-fixture.py <out.dxf>

Content: MTEXT multileaders (two leaders left/right, a spline leader, a vertical attachment, text frame, colour and
arrowhead overrides, a multi-line text), block multileaders (a block with two attributes whose values are set per
leader), a group of lines, an xrecord in the named-object dictionary and one in a line's extension dictionary.
"""
import sys
import ezdxf
from ezdxf.math import Vec2
from ezdxf.render import mleader


def main(out):
    doc = ezdxf.new('R2018', setup=True)
    msp = doc.modelspace()
    doc.layers.add('NOTES', color=3)

    # MTEXT content, leaders on both sides
    ml = msp.add_multileader_mtext('Standard')
    ml.set_content('Two leaders\\Psecond line', char_height=2.5, alignment=mleader.TextAlignment.left)
    ml.add_leader_line(mleader.ConnectionSide.left, [Vec2(-40, 10), Vec2(-30, 0)])
    ml.add_leader_line(mleader.ConnectionSide.right, [Vec2(60, -15)])
    ml.build(insert=Vec2(0, 20))

    # overrides: layer, colour, arrowhead size, text frame
    ml = msp.add_multileader_mtext('Standard')
    ml.set_content('Framed', char_height=3.5, color=1)
    ml.set_leader_properties(color=5, lineweight=50)
    ml.set_arrow_properties(size=4)
    ml.multileader.dxf.layer = 'NOTES'
    ml.add_leader_line(mleader.ConnectionSide.left, [Vec2(100, 0), Vec2(105, 8)])
    ml.build(insert=Vec2(120, 20))

    # spline leader
    ml = msp.add_multileader_mtext('Standard')
    ml.set_content('Spline', char_height=2.5)
    ml.set_leader_properties(leader_type=mleader.LeaderType.splines)
    ml.add_leader_line(mleader.ConnectionSide.left, [Vec2(200, 0), Vec2(205, 10), Vec2(212, 4)])
    ml.build(insert=Vec2(230, 20))

    # vertical attachment
    ml = msp.add_multileader_mtext('Standard')
    ml.set_content('Top', char_height=2.5)
    ml.add_leader_line(mleader.ConnectionSide.bottom, [Vec2(300, -20)])
    ml.build(insert=Vec2(300, 10))

    # block content with attributes
    blk = doc.blocks.new('TAG')
    blk.add_circle((0, 0), 5)
    blk.add_attdef('NUM', (0, 0), dxfattribs={'height': 2.5, 'halign': 1, 'valign': 2})
    blk.add_attdef('NOTE', (0, -7), dxfattribs={'height': 1.5})
    for i, (x, num) in enumerate([(0, 'A1'), (60, 'B22')]):
        ml = msp.add_multileader_block('Standard')
        ml.set_content(name='TAG', alignment=mleader.BlockAlignment.center_extents, scale=1.5)
        ml.set_attribute('NUM', num)
        ml.set_attribute('NOTE', 'note %d' % i)
        ml.add_leader_line(mleader.ConnectionSide.left, [Vec2(x - 30, -50)])
        ml.build(insert=Vec2(x, -40))

    # a group, an xrecord in the named-object dictionary, a line with an extension dictionary
    a = msp.add_line((0, -100), (50, -100))
    b = msp.add_line((50, -100), (50, -80))
    doc.groups.new('PAIR').extend([a, b])
    xr = doc.rootdict.add_xrecord('CCDWG_TEST')
    xr.reset([(1, 'hello'), (40, 3.25), (70, 7), (10, (1, 2, 3)), (280, 1), (330, a.dxf.handle)])
    xd = a.new_extension_dict()
    x2 = xd.add_xrecord('CCDWG_LINE')
    x2.reset([(1, 'on a line'), (90, 123456)])
    doc.saveas(out)


if __name__ == '__main__':
    main(sys.argv[1])
