#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""dxf_check.py — read a DXF with ezdxf (an independent reader) and print what is in it as JSON, for
bin/test-detailcraft.mjs (DetailCraft's drawing sheets as DXF, and the DXF the DWG readers make of its DWG files).

  tools/detailcraft-test/venv/bin/python tools/detailcraft-test/dxf_check.py <file.dxf> [--encoding cp1252]

Prints {version, insunits, audit_errors, counts{type}, by_layer{layer: {type: n}}, layers{name: {linetype, lineweight}},
linetypes{name: [pattern]}, texts[[value, height, x, y, halign, rotation]], extents[min, max]}."""
import json
import sys

import ezdxf
from ezdxf import recover

path = sys.argv[1]
enc = sys.argv[sys.argv.index('--encoding') + 1] if '--encoding' in sys.argv else None
try:
    doc = ezdxf.readfile(path, encoding=enc) if enc else ezdxf.readfile(path)
except Exception:
    doc, _ = recover.readfile(path)
aud = doc.audit()
msp = doc.modelspace()
counts, by_layer, texts = {}, {}, []
xs, ys = [], []
for e in msp:
    t = e.dxftype()
    counts[t] = counts.get(t, 0) + 1
    by_layer.setdefault(e.dxf.layer, {})
    by_layer[e.dxf.layer][t] = by_layer[e.dxf.layer].get(t, 0) + 1
    if t == 'TEXT':
        texts.append([e.dxf.text, round(e.dxf.height, 4), round(e.dxf.insert.x, 3), round(e.dxf.insert.y, 3), e.dxf.get('halign', 0), round(e.dxf.get('rotation', 0), 3)])
    if t == 'LINE':
        xs += [e.dxf.start.x, e.dxf.end.x]; ys += [e.dxf.start.y, e.dxf.end.y]
    if t in ('LWPOLYLINE',):
        for p in e.get_points('xy'):
            xs.append(p[0]); ys.append(p[1])
    if t == 'POLYLINE':
        for v in e.vertices:
            xs.append(v.dxf.location.x); ys.append(v.dxf.location.y)
layers = {l.dxf.name: {'linetype': l.dxf.linetype, 'lineweight': l.dxf.get('lineweight', -3)} for l in doc.layers}
lts = {}
for lt in doc.linetypes:
    try:
        lts[lt.dxf.name] = [round(v, 4) for v in lt.simplified_line_pattern()]   # on, off, on, off … (mm)
    except Exception:
        lts[lt.dxf.name] = []
print(json.dumps({
    'version': doc.dxfversion, 'insunits': doc.header.get('$INSUNITS', 0), 'audit_errors': len(aud.errors),
    'audit': [str(x.message) for x in aud.errors][:10], 'counts': counts, 'by_layer': by_layer, 'layers': layers,
    'linetypes': lts, 'texts': texts, 'extents': [min(xs) if xs else 0, min(ys) if ys else 0, max(xs) if xs else 0, max(ys) if ys else 0],
}))
