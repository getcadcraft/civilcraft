# SPDX-License-Identifier: Apache-2.0
"""make.py — WL.16 fixture: clipped block references, written by ezdxf (outside black box) and saved by the ODA File
Converter in all six versions (make-dwg.sh). Block PLAN: a 100 × 100 square, a line across, a circle (r 30 at 50,50), a
solid-hatched 20 × 20 square at its middle and a text at (5, 90). Reference A at (1000, 500), scale 2, 30°: clipped to the
block-coordinate rectangle (10, 10)–(60, 60). Reference B at (0, 0), plain: clipped to the triangle (0,0) (100,0) (0,100)."""
import ezdxf, ezdxf.xclip as X

doc = ezdxf.new('R2018')
blk = doc.blocks.new('PLAN')
blk.add_lwpolyline([(0, 0), (100, 0), (100, 100), (0, 100)], close=True)
blk.add_line((0, 50), (100, 50))
blk.add_circle((50, 50), 30)
h = blk.add_hatch(color=1); h.paths.add_polyline_path([(40, 40), (60, 40), (60, 60), (40, 60)], is_closed=True)
blk.add_text('TOP LEFT', dxfattribs={'height': 4, 'insert': (5, 90)})
msp = doc.modelspace()
a = msp.add_blockref('PLAN', (1000, 500), dxfattribs={'xscale': 2, 'yscale': 2, 'rotation': 30})
X.XClip(a).set_block_clipping_path([(10, 10), (60, 60)])
b = msp.add_blockref('PLAN', (0, 0))
X.XClip(b).set_block_clipping_path([(0, 0), (100, 0), (0, 100)])
doc.saveas('xclip.dxf')
