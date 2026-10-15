# SPDX-License-Identifier: Apache-2.0
"""
dwg_check.py — what a DXF (made from a DWG CadCraft saved, by another program's reader) holds, for
bin/test-cadcraft.mjs: ezdxf's audit, model-space objects by type, layers with their state, blocks with what is in
them, every block reference with its attribute values, text alignment and the ellipses/arcs that must survive.
Run with tools/civilcraft-test/venv/bin/python (it has ezdxf).

  python dwg_check.py <file.dxf> [encoding]   → one JSON object
"""
import json
import sys
from collections import Counter

import ezdxf


def r6(v):
    return round(float(v), 6)


def dump(path, encoding=None):
    doc = ezdxf.readfile(path, encoding=encoding) if encoding else ezdxf.readfile(path)
    aud = doc.audit()
    msp = doc.modelspace()
    model = Counter(e.dxftype() for e in msp)
    layers = {}
    for l in doc.layers:
        layers[l.dxf.name] = {
            'color': abs(l.dxf.color), 'off': l.is_off(), 'frozen': l.is_frozen(), 'locked': l.is_locked(),
            'plot': bool(l.dxf.get('plot', 1)), 'rgb': l.dxf.get('true_color'), 'linetype': l.dxf.get('linetype', ''), 'lineweight': l.dxf.get('lineweight', -3),
            'newvp': bool(l.dxf.get('flags', 0) & 2),   # frozen in new viewports (0.5 VP.2)
        }
    blocks = {}
    for b in doc.blocks:
        n = b.name
        if n.upper() in ('*MODEL_SPACE', '*PAPER_SPACE') or n.upper().startswith('*PAPER_SPACE'):
            continue
        c = Counter(e.dxftype() for e in b)
        blocks[n] = {'entities': dict(c), 'base': [r6(b.block.dxf.base_point.x), r6(b.block.dxf.base_point.y)],
                     'xref': b.block.dxf.get('xref_path', '') if (b.block.dxf.get('flags', 0) & 4) else None,
                     'attdefs': sorted(a.dxf.tag for a in b if a.dxftype() == 'ATTDEF')}
    inserts = []
    for e in msp.query('INSERT'):
        inserts.append({
            'block': e.dxf.name, 'x': r6(e.dxf.insert.x), 'y': r6(e.dxf.insert.y), 'sx': r6(e.dxf.xscale), 'sy': r6(e.dxf.yscale),
            'rot': r6(e.dxf.rotation), 'attribs': {a.dxf.tag: a.dxf.text for a in e.attribs},
        })
    texts = [{'s': t.dxf.text, 'h': t.dxf.get('halign', 0), 'v': t.dxf.get('valign', 0), 'wf': r6(t.dxf.get('width', 1))} for t in msp.query('TEXT')]
    mtexts = [{'s': t.text, 'attach': t.dxf.get('attachment_point', 1), 'width': r6(t.dxf.get('width', 0))} for t in msp.query('MTEXT')]
    ellipses = [{'ratio': r6(e.dxf.ratio), 't0': r6(e.dxf.start_param), 't1': r6(e.dxf.end_param)} for e in msp.query('ELLIPSE')]
    bulged = sum(1 for p in msp.query('LWPOLYLINE') if any(abs(v[4]) > 1e-12 for v in p.get_points('xyseb')))
    colors = Counter(e.dxf.get('color', 256) for e in msp)
    dims = [{'type': e.dxf.get('dimtype', 0) & 7, 'block': e.dxf.get('geometry', ''), 'text': e.dxf.get('text', ''),
             'p13': [r6(e.dxf.defpoint2.x), r6(e.dxf.defpoint2.y)] if e.dxf.hasattr('defpoint2') else None,
             'p14': [r6(e.dxf.defpoint3.x), r6(e.dxf.defpoint3.y)] if e.dxf.hasattr('defpoint3') else None}
            for e in msp.query('DIMENSION')]
    hatches = []
    for e in msp.query('HATCH'):
        pat = e.pattern
        hatches.append({'pattern': e.dxf.pattern_name, 'solid': bool(e.dxf.solid_fill), 'lines': len(pat.lines) if pat else 0,
                        'scale': r6(e.dxf.get('pattern_scale', 1)), 'paths': len(e.paths)})
    layouts = {}
    for lay in doc.layouts:
        if lay.name.upper() == 'MODEL':
            continue
        vps = [v for v in lay if v.dxftype() == 'VIEWPORT']
        layouts[lay.name] = {'viewports': len(vps), 'entities': dict(Counter(x.dxftype() for x in lay if x.dxftype() != 'VIEWPORT')),
                             'views': sorted([r6(v.dxf.width), r6(v.dxf.height)] for v in vps),
                             'frozen': sorted(sorted(str(n).upper() for n in v.frozen_layers) for v in vps)}
    # per-viewport layer overrides (0.5 VP.3), as ezdxf reads them: layer → [{color, lw, tr}] for each viewport it overrides
    vpovr = {}
    vhs = [v.dxf.handle for lay in doc.layouts if lay.name.upper() != 'MODEL' for v in lay if v.dxftype() == 'VIEWPORT']
    for layer in doc.layers:
        ov = layer.get_vp_overrides()
        for vh in vhs:
            if ov.has_overrides(vh):
                vpovr.setdefault(layer.dxf.name.upper(), []).append({'color': ov.get_color(vh), 'lw': ov.get_lineweight(vh), 'tr': round(ov.get_transparency(vh), 2)})
    xclips = []
    try:
        import ezdxf.xclip as XC
        for e in msp.query('INSERT'):
            xc = XC.XClip(e)
            if xc.has_clipping_path:
                xclips.append([[round(v.x, 6), round(v.y, 6)] for v in xc.get_block_clipping_path().vertices])
    except Exception as err:
        xclips = [str(err)]
    hdr = doc.header
    ucs = {'org': [round(v, 6) for v in list(hdr.get('$UCSORG', (0, 0, 0)))[:2]], 'xdir': [round(v, 6) for v in list(hdr.get('$UCSXDIR', (1, 0, 0)))[:2]],
           'named': [[u.dxf.name, round(u.dxf.xaxis[0], 6), round(u.dxf.xaxis[1], 6)] for u in doc.ucs],
           'twist': round(doc.viewports.get('*Active')[0].dxf.view_twist, 6) if doc.viewports.get('*Active') else None,
           'vptwist': sorted(round(v.dxf.view_twist_angle, 6) for lay in doc.layouts if lay.name.upper() != 'MODEL' for v in lay if v.dxftype() == 'VIEWPORT' and v.dxf.view_twist_angle)}
    return {
        'ucs': ucs,
        'xclips': xclips,
        'vpovr': vpovr,
        'version': doc.dxfversion,
        'audit_errors': len(aud.errors),
        'model': dict(model),
        'model_total': sum(model.values()),
        'layers': layers,
        'blocks': blocks,
        'inserts': inserts,
        'texts': texts,
        'mtexts': mtexts,
        'ellipses': ellipses,
        'bulged_polylines': bulged,
        'colors': {str(k): v for k, v in colors.items()},
        'dims': dims,
        'hatches': hatches,
        'layouts': layouts,
        'ltypes': sorted(lt.dxf.name.upper() for lt in doc.linetypes),
        'entity_ltypes': dict(Counter(e.dxf.get('linetype', 'BYLAYER').upper() for e in msp)),
        'entity_lweights': dict(Counter(str(e.dxf.get('lineweight', -1)) for e in msp)),
        'props': props(doc, msp),
        'actives': sorted([r6(v.dxf.lower_left[0]), r6(v.dxf.lower_left[1]), r6(v.dxf.upper_right[0]), r6(v.dxf.upper_right[1])] for v in doc.viewports.get('*Active')),
        'lunits': doc.header.get('$LUNITS'),
        'luprec': doc.header.get('$LUPREC'),
        'insunits': doc.header.get('$INSUNITS'),
        'measurement': doc.header.get('$MEASUREMENT'),
    }


def props(doc, msp):
    # the Properties panel's fields (0.4 part 2, track P) as other programs keep them
    walls = [e for e in msp.query('LINE') if e.dxf.layer == 'Walls' and abs(e.dxf.end.x - 500) < 1e-6 and abs(e.dxf.start.y) < 1e-6]
    lb = [t for t in msp.query('TEXT') if t.dxf.text == 'Left baseline']
    return {
        'th': r6(walls[0].dxf.get('thickness', 0)) if walls else None,
        'tr': walls[0].dxf.get('transparency') if walls else None,
        'obl': [r6(t.dxf.get('oblique', 0)) for t in lb],
        'tstyle': [t.dxf.get('style', '') for t in lb],
        'cw': [r6(p.dxf.get('const_width', 0)) for p in msp.query('LWPOLYLINE') if p.closed],
        'hstyle': [h.dxf.get('hatch_style', 0) for h in msp.query('HATCH') if not h.dxf.solid_fill],
        'dimstyles': sorted(s.dxf.name for s in doc.dimstyles),
        'styles': sorted(s.dxf.name for s in doc.styles),
        'dimstyle': [d.dxf.get('dimstyle', '') for d in msp.query('DIMENSION')],
        'vpstatus': [v.dxf.get('flags', 0) for lay in doc.layouts if lay.name == 'A3 sheet' for v in lay if v.dxftype() == 'VIEWPORT'],
    }


if __name__ == '__main__':
    try:
        print(json.dumps(dump(sys.argv[1], *sys.argv[2:])))
    except Exception as err:  # a reader wrote something ezdxf cannot open: report, don't crash the run
        print(json.dumps({'error': type(err).__name__ + ': ' + str(err)[:300]}))
