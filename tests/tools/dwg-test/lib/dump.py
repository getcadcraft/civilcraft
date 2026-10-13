#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
dump.py — read a DXF with ezdxf and write the cc-dwg harness's common entity form (JSON).

  python dump.py <in.dxf> <out.json> [--encoding utf8]

Every entity of every block (model space, paper spaces, block definitions) with: h (handle, upper hex),
t (DXF type; all POLYLINE kinds are POLYLINE with g.kind), layer, owner (block name), space
(model|paper|block) and g (key geometry + text; angles in RADIANS, points [x, y, z]). ATTRIBs are
listed as entities of their own. Anonymous block names (*D12, *U3, *Paper_Space2) are
renumbered by every writer, so owner / INSERT name / DIMENSION block keep only their kind (*D, *U, *Paper_Space); (g.insert = the INSERT's handle); VERTEX/SEQEND are folded into their
POLYLINE. Text: ezdxf's decoding of the DXF, then \\U+XXXX → the character (how CAD programs show it).
Also: header subset, layers, blocks, counts per block per type, ezdxf audit totals.
The JavaScript side (normalize.mjs) builds the same form from our reader's model and libredwg-web.
"""
import json
import math
import re
import sys
import time

import ezdxf
from ezdxf import recover

UNI = re.compile(r'\\U\+([0-9A-Fa-f]{4})')
CARET = re.compile(r'\^([ @-_])')


def uni(s):
    """DXF text → the characters: caret notation (^I = tab, "^ " = ^; DXF reference) and \\U+XXXX."""
    if not isinstance(s, str):
        return s
    if '^' in s:
        s = CARET.sub(lambda m: '^' if m.group(1) == ' ' else chr(ord(m.group(1)) - 64), s)
    return UNI.sub(lambda m: chr(int(m.group(1), 16)), s)
rad = math.radians
ANON = re.compile(r'^\*(?!model_space$)(paper_space)\d*$|^\*([a-z])\d+$', re.I)


def canon(name):
    """Anonymous block names (*D12, *U3, *T5, *Paper_Space2) are renumbered on every save → compare the kind only."""
    m = ANON.match(name or '')
    if not m:
        return name
    return '*Paper_Space' if m.group(1) else '*' + m.group(2).upper()


def P(v):
    return [float(v[0]), float(v[1]), float(v[2]) if len(v) > 2 else 0.0]


def has(e, k):
    try:
        return e.dxf.hasattr(k)
    except Exception:
        return False


def geom(e):
    t = e.dxftype()
    d = e.dxf
    g = {}
    if t == 'LINE':
        g = {'a': P(d.start), 'b': P(d.end)}
    elif t == 'POINT':
        g = {'p': P(d.location)}
    elif t == 'CIRCLE':
        g = {'c': P(d.center), 'r': d.radius}
    elif t == 'ARC':
        g = {'c': P(d.center), 'r': d.radius, 'a0': rad(d.start_angle), 'a1': rad(d.end_angle)}
    elif t == 'ELLIPSE':
        g = {'c': P(d.center), 'maj': P(d.major_axis), 'ratio': d.ratio, 'p0': d.start_param, 'p1': d.end_param}
    elif t == 'LWPOLYLINE':
        g = {'closed': bool(e.closed), 'elev': float(d.elevation) if has(e, 'elevation') else 0.0,
             'pts': [[float(p[0]), float(p[1]), float(p[4])] for p in e.get_points('xyseb')]}
    elif t == 'POLYLINE':
        kind = '3d' if e.is_3d_polyline else 'pface' if e.is_poly_face_mesh else 'mesh' if e.is_polygon_mesh else '2d'
        if kind == 'pface':
            # face records (flag 128 without 64) are indices, not points: compare them as faces
            pv = [v for v in e.vertices if v.dxf.flags & 64]
            fv = [v for v in e.vertices if not v.dxf.flags & 64]
            faces = [[int(v.dxf.get(k, 0) or 0) for k in ('vtx0', 'vtx1', 'vtx2', 'vtx3')] for v in fv]
            g = {'kind': kind, 'closed': bool(e.is_closed), 'pts': [P(v.dxf.location) for v in pv], 'faces': faces}
        else:
            g = {'kind': kind, 'closed': bool(e.is_closed), 'pts': [P(v.dxf.location) for v in e.vertices]}
    elif t in ('TEXT', 'ATTRIB', 'ATTDEF'):
        g = {'ins': P(d.insert), 'h': d.height, 'rot': rad(d.rotation), 'text': uni(d.text)}
        ha, va = d.get('halign', 0), d.get('valign', 0)
        if ha or va:
            g['ha'], g['va'] = ha, va
            if has(e, 'align_point'):
                g['align'] = P(d.align_point)
        if t != 'TEXT':
            g['tag'] = d.tag
        if t == 'ATTDEF':
            g['prompt'] = uni(d.get('prompt', ''))
    elif t == 'MTEXT':
        g = {'ins': P(d.insert), 'h': d.char_height, 'w': d.get('width', 0.0), 'attach': d.get('attachment_point', 1), 'text': uni(e.text)}
    elif t in ('INSERT', 'MINSERT'):
        g = {'name': canon(d.name), 'ins': P(d.insert), 'sx': d.get('xscale', 1.0), 'sy': d.get('yscale', 1.0), 'sz': d.get('zscale', 1.0), 'rot': rad(d.get('rotation', 0.0))}
        if d.get('column_count', 1) > 1 or d.get('row_count', 1) > 1:
            g['cols'], g['rows'] = d.get('column_count', 1), d.get('row_count', 1)
    elif t == 'DIMENSION':
        g = {'dimtype': d.dimtype & 7, 'defp': P(d.defpoint), 'mid': P(d.text_midpoint), 'block': canon(d.get('geometry', '')), 'text': uni(d.get('text', ''))}
    elif t == 'HATCH':
        g = {'pattern': d.pattern_name, 'solid': bool(d.solid_fill), 'loops': len(e.paths)}
    elif t == 'SPLINE':
        g = {'degree': d.degree, 'ctrl': [P(p) for p in e.control_points], 'knots': [float(k) for k in e.knots], 'fit': [P(p) for p in e.fit_points]}
    elif t in ('SOLID', 'TRACE', '3DFACE'):
        g = {'v': [P(d.get(k)) for k in ('vtx0', 'vtx1', 'vtx2', 'vtx3')]}
    elif t == 'VIEWPORT':
        g = {'c': P(d.center), 'w': d.width, 'h': d.height}
    elif t == 'LEADER':
        g = {'pts': [P(v) for v in e.vertices]}
    elif t in ('RAY', 'XLINE'):
        g = {'p': P(d.start), 'dir': P(d.unit_vector)}
    return g


def main():
    src, out = sys.argv[1], sys.argv[2]
    enc = sys.argv[sys.argv.index('--encoding') + 1] if '--encoding' in sys.argv else None
    t0 = time.time()
    audit = {}
    try:
        doc = ezdxf.readfile(src, encoding=enc) if enc else ezdxf.readfile(src)
        aud = doc.audit()
        audit = {'errors': len(aud.errors), 'fixes': len(aud.fixes), 'recovered': False}
    except Exception as ex:   # structure errors → ezdxf's recover mode
        doc, aud = recover.readfile(src)
        audit = {'errors': len(aud.errors), 'fixes': len(aud.fixes), 'recovered': True, 'why': str(ex)[:200]}

    layout_of = {}
    for lay in doc.layouts:
        try:
            layout_of[lay.block_record_handle.upper()] = lay.name
        except Exception:
            pass
    ents, counts, blocks, problems = [], {}, [], []
    for blk in doc.blocks:
        name = blk.name
        low = name.lower()
        space = 'model' if low == '*model_space' else 'paper' if low.startswith('*paper_space') else 'block'
        brh = (blk.block_record_handle or '').upper()
        c = counts.setdefault(name, {})
        n = 0
        for e in blk:
            t = e.dxftype()
            try:
                g = geom(e)
            except Exception as ex:
                g = {'error': str(ex)[:120]}
                problems.append(f'{t} {e.dxf.handle}: {ex}')
            ents.append({'h': (e.dxf.handle or '').upper(), 't': t, 'layer': e.dxf.get('layer', '0'), 'owner': canon(name), 'space': space, 'g': g})
            c[t] = c.get(t, 0) + 1
            n += 1
            if t in ('INSERT', 'MINSERT'):
                for a in e.attribs:
                    if not hasattr(a, 'dxf'):   # a damaged ATTRIB chain in a converter's DXF: count it, keep going
                        problems.append(f'ATTRIB of INSERT {e.dxf.handle}: not an entity')
                        continue
                    try:
                        ga = geom(a)
                    except Exception as ex:
                        ga = {'error': str(ex)[:120]}
                    ga['insert'] = e.dxf.handle.upper()
                    ents.append({'h': (a.dxf.handle or '').upper(), 't': 'ATTRIB', 'layer': a.dxf.get('layer', '0'), 'owner': canon(name), 'space': space, 'g': ga})
                    c['ATTRIB'] = c.get('ATTRIB', 0) + 1
        blocks.append({'name': name, 'record': brh, 'layout': layout_of.get(brh), 'space': space, 'entities': n,
                       'flags': blk.block.dxf.get('flags', 0) if blk.block else 0})
    hdr = {}
    for k in ('$ACADVER', '$DWGCODEPAGE', '$INSUNITS', '$MEASUREMENT', '$EXTMIN', '$EXTMAX', '$LIMMIN', '$LIMMAX', '$HANDSEED', '$CLAYER', '$TEXTSTYLE', '$DIMSTYLE', '$LTSCALE'):
        if k in doc.header:
            v = doc.header[k]
            hdr[k[1:]] = list(v) if hasattr(v, '__len__') and not isinstance(v, str) else v
    layers = [{'h': l.dxf.handle.upper(), 'name': l.dxf.name, 'color': l.dxf.get('color', 7), 'flags': l.dxf.get('flags', 0),
               'linetype': l.dxf.get('linetype', ''), 'lineweight': l.dxf.get('lineweight', -3), 'plot': l.dxf.get('plot', 1)} for l in doc.layers]
    total = {}
    for b in counts.values():
        for t, n in b.items():
            total[t] = total.get(t, 0) + n
    res = {'reader': 'ezdxf ' + ezdxf.__version__, 'dxfversion': doc.dxfversion, 'encoding': doc.encoding, 'audit': audit,
           'header': hdr, 'layers': layers, 'blocks': blocks, 'counts': counts, 'total': total, 'entities': ents,
           'problems': problems[:50], 'ms': round((time.time() - t0) * 1000)}
    with open(out, 'w', encoding='utf8') as f:
        json.dump(res, f, ensure_ascii=False, separators=(',', ':'), default=lambda o: list(o) if hasattr(o, '__iter__') else str(o))


if __name__ == '__main__':
    main()
