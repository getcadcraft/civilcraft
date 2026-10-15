# SPDX-License-Identifier: Apache-2.0
"""make.py — VP.3 fixture: per-viewport layer overrides, written by ezdxf (outside black box) as the other program keeps
them (layer extension dictionary → ADSK_XREC_LAYER_*_OVR XRECORDs, viewport handle + value), then converted to DWG in all
six versions by the ODA File Converter (tools/civilcraft-test/setup-dwg-readers.sh).
  tools/cadcraft-test/venv/bin/python make.py && node ../../make-vp-overrides-dwg.mjs (or run bin/test-cadcraft.mjs)
Model: a WALLS line (red, Continuous, 0.25) and a NOTES line (green). Sheet "Overrides": viewport A shows WALLS as colour 5,
DASHED, 0.70 mm, 50 % transparent; viewport B shows NOTES as true colour #FF8000."""
import ezdxf

doc = ezdxf.new('R2018', setup=True)
doc.header['$INSUNITS'] = 4
doc.layers.add('WALLS', color=1, linetype='Continuous', lineweight=25)
doc.layers.add('NOTES', color=3)
msp = doc.modelspace()
msp.add_line((0, 0), (1000, 0), dxfattribs={'layer': 'WALLS'})
msp.add_line((0, 200), (1000, 200), dxfattribs={'layer': 'NOTES'})
lay = doc.layouts.new('Overrides')
lay.page_setup(size=(420, 297), margins=(0, 0, 0, 0), units='mm')
a = lay.add_viewport(center=(110, 150), size=(200, 120), view_center_point=(500, 100), view_height=400)
b = lay.add_viewport(center=(320, 150), size=(180, 120), view_center_point=(500, 100), view_height=400)
a.frozen_layer_names = ['NOTES']
w = doc.layers.get('WALLS').get_vp_overrides()
w.set_color(a.dxf.handle, 5)
w.set_linetype(a.dxf.handle, 'DASHED')
w.set_lineweight(a.dxf.handle, 70)
w.set_transparency(a.dxf.handle, 0.5)
w.commit()
n = doc.layers.get('NOTES').get_vp_overrides()
n.set_rgb(b.dxf.handle, (255, 128, 0))
n.commit()
doc.saveas('vp-overrides.dxf')
print('vp A', a.dxf.handle, 'vp B', b.dxf.handle)
