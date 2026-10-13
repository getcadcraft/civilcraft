# SPDX-License-Identifier: Apache-2.0
"""fixture.py <out.dxf> — an R2000 DXF made by ezdxf (another program), for bin/test-cadcraft.mjs.

What CadCraft must read back from it: a rectangle and a circle in the model; a linear, an aligned,
a radius and a 3-point angular dimension (with the geometry blocks ezdxf draws for them); two
layouts, "Sheet A" (A3 landscape, mm) with a viewport showing the model centre (100, 50) at 1:2
and a text, and "Sheet B" (Letter, inches) with one line; a layer that does not plot.
"""
import sys
import ezdxf
from ezdxf.math import Vec2

doc = ezdxf.new('R2000', setup=True)
doc.header['$INSUNITS'] = 4  # millimetres
doc.layers.add('NOPLOT', color=3).dxf.plot = 0
msp = doc.modelspace()
msp.add_lwpolyline([(0, 0), (200, 0), (200, 100), (0, 100)], close=True)
msp.add_circle((100, 50), 30)
msp.add_linear_dim(base=(100, -20), p1=(0, 0), p2=(200, 0), dimstyle='EZDXF').render()
msp.add_aligned_dim(p1=(0, 0), p2=(200, 100), distance=15, dimstyle='EZDXF').render()
msp.add_radius_dim(center=(100, 50), radius=30, angle=45, dimstyle='EZDXF').render()
msp.add_angular_dim_3p(base=(40, 20), center=(0, 0), p1=(200, 0), p2=(200, 100), dimstyle='EZDXF').render()
msp.add_line((0, 0), (10, 10), dxfattribs={'layer': 'NOPLOT'})

a = doc.layouts.new('Sheet A')
a.page_setup(size=(420, 297), margins=(0, 0, 0, 0), units='mm')
a.add_viewport(center=(210, 150), size=(200, 100), view_center_point=(100, 50), view_height=200)
a.add_text('SHEET A', dxfattribs={'height': 5, 'insert': (20, 20)})
b = doc.layouts.new('Sheet B')
b.page_setup(size=(11, 8.5), margins=(0, 0, 0, 0), units='inch')
b.add_line((1, 1), (10, 7.5))
# ezdxf adds the default "Layout1"; take it away so the two named sheets are the only ones
doc.layouts.delete('Layout1')
doc.saveas(sys.argv[1])
