# SPDX-License-Identifier: Apache-2.0
"""reader-oracle.py — dump a DXF (the ODA File Converter's output) to JSON keyed by entity handle, for
builder R's reader comparison (tools/dwg-test/reader-compare.mjs). Uses ezdxf (tools/civilcraft-test/venv).

    python reader-oracle.py in.dxf out.json

Every graphical entity of every block (model, paper spaces, blocks): its DXF attributes (dxf namespace)
plus the sub-data the namespace does not hold (vertices, knots, hatch paths, attribs).
"""
import json
import math
import sys

import ezdxf
from ezdxf.math import Vec3, Vec2


def val(v):
    if isinstance(v, (Vec3, Vec2)):
        return list(v)
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return str(v)
    if isinstance(v, (tuple, list)):
        return [val(x) for x in v]
    return v


def attribs(e):
    out = {}
    try:
        for k, v in e.dxf.all_existing_dxf_attribs().items():
            out[k] = val(v)
    except Exception as ex:  # noqa
        out['_error'] = str(ex)
    return out


def extra(e, t):
    d = {}
    try:
        if t == 'LWPOLYLINE':
            d['points'] = [list(p) for p in e.get_points('xyseb')]
            d['closed'] = e.closed
        elif t == 'POLYLINE':
            d['vertices'] = [dict(attribs(v), handle=v.dxf.handle) for v in e.vertices]
            d['mode'] = e.get_mode()
        elif t == 'SPLINE':
            d['knots'] = list(e.knots)
            d['weights'] = list(e.weights)
            d['control'] = [list(p) for p in e.control_points]
            d['fit'] = [list(p) for p in e.fit_points]
        elif t == 'HATCH' or t == 'MPOLYGON':
            paths = []
            for p in e.paths:
                pd = {'type': type(p).__name__, 'flags': p.path_type_flags}
                if hasattr(p, 'vertices'):
                    pd['vertices'] = [list(v) for v in p.vertices]
                    pd['closed'] = p.is_closed
                else:
                    edges = []
                    for ed in p.edges:
                        ee = {'type': ed.EDGE_TYPE if hasattr(ed, 'EDGE_TYPE') else type(ed).__name__}
                        for k in ('start', 'end', 'center', 'radius', 'start_angle', 'end_angle', 'ccw', 'major_axis', 'ratio',
                                  'degree', 'rational', 'periodic', 'knot_values', 'control_points', 'weights', 'fit_points'):
                            if hasattr(ed, k):
                                ee[k] = val(getattr(ed, k))
                        edges.append(ee)
                    pd['edges'] = edges
                pd['source_boundary_objects'] = list(getattr(p, 'source_boundary_objects', []))
                paths.append(pd)
            d['paths'] = paths
            d['seeds'] = [list(s) for s in e.seeds] if hasattr(e, 'seeds') else []
            if e.pattern:
                d['pattern_lines'] = [[l.angle, list(l.base_point), list(l.offset), list(l.dash_length_items)] for l in e.pattern.lines]
        elif t == 'INSERT':
            d['attribs'] = [a.dxf.handle for a in e.attribs]
        elif t == 'MTEXT':
            d['text'] = e.text
        elif t == 'MESH':
            pass
        elif t == 'LEADER':
            d['vertices'] = [list(v) for v in e.vertices]
        elif t == 'VIEWPORT':
            d['frozen_layers'] = list(e.frozen_layers) if hasattr(e, 'frozen_layers') else []
        elif t == 'MULTILEADER':
            c = e.context
            d['ml'] = {
                'text': c.mtext.default_content if c.mtext else None,
                'text_insert': list(c.mtext.insert) if c.mtext else None,
                'block_insert': list(c.block.insert) if c.block else None,
                'leaders': [[[list(v) for v in ln.vertices] for ln in ld.lines] for ld in c.leaders],
                'scale': c.scale, 'base_point': list(c.base_point),
            }
        elif t == 'MLINE':
            d['vertices'] = [list(v.location) for v in e.vertices]
    except Exception as ex:  # noqa
        d['_extra_error'] = str(ex)
    return d


def main(src, dst):
    doc = ezdxf.readfile(src)
    out = {'header': {}, 'entities': {}, 'layers': {}, 'blocks': {}, 'layouts': {}, 'objects': {}}
    for k in ('$INSUNITS', '$MEASUREMENT', '$EXTMIN', '$EXTMAX', '$LIMMIN', '$LIMMAX', '$CLAYER', '$TEXTSTYLE', '$DIMSTYLE',
              '$HANDSEED', '$LTSCALE', '$DIMSCALE', '$DWGCODEPAGE', '$ACADVER', '$INSBASE', '$TDCREATE', '$TDUPDATE', '$LUNITS',
              '$LUPREC', '$AUNITS', '$CELTSCALE', '$PDMODE', '$PDSIZE', '$TEXTSIZE', '$FINGERPRINTGUID', '$VERSIONGUID'):
        if k in doc.header:
            out['header'][k[1:]] = val(doc.header[k])
    for l in doc.layers:
        out['layers'][l.dxf.handle] = attribs(l)
    for b in doc.blocks:
        br = b.block_record
        out['blocks'][br.dxf.handle] = {'name': b.name, 'block': b.block.dxf.handle if b.block else None,
                                         'entities': [e.dxf.handle for e in b]}
        for e in b:
            t = e.dxftype()
            rec = {'type': t, 'owner_block': br.dxf.handle, 'block_name': b.name, 'dxf': attribs(e)}
            rec.update(extra(e, t))
            try:
                if e.xdata:
                    rec['xdata'] = {app: [[c, val(v)] for c, v in tags] for app, tags in e.xdata.data.items()}
            except Exception:  # noqa
                pass
            out['entities'][e.dxf.handle] = rec
            if t == 'INSERT':
                for a in e.attribs:
                    ra = {'type': 'ATTRIB', 'owner_block': br.dxf.handle, 'dxf': attribs(a)}
                    out['entities'][a.dxf.handle] = ra
    for lay in doc.layouts:
        out['layouts'][lay.dxf_layout.dxf.handle] = attribs(lay.dxf_layout)
    for o in doc.objects:
        out['objects'][o.dxf.handle] = {'type': o.dxftype()}
    with open(dst, 'w') as f:
        json.dump(out, f)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
