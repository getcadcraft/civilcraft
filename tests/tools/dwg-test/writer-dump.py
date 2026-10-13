#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
writer-dump.py — builder W's second reader: dump a DXF (written by LibreDWG, libdxfrw or the ODA File Converter from
a DWG cc-dwg wrote) as JSON in the canonical shape tools/dwg-test/writer-check.mjs compares with the source model.

  python3 writer-dump.py <file.dxf> [encoding]

Output: { version, audit: {errors, fixes}, header: {INSUNITS, MEASUREMENT, EXTMIN, EXTMAX}, layers: [...],
          linetypes, styles, dimstyles, blocks: {name: {base, entities}}, layouts: [{name, taborder, block, entities}] }
Entities: { t, layer, color, linetype, lineweight, ...geometry } with angles in degrees as DXF has them.
Run with tools/civilcraft-test/venv/bin/python (ezdxf).
"""
import json
import math
import re
import sys

import ezdxf

UNI = re.compile(r'\\U\+([0-9A-Fa-f]{4})')
# DXF caret escapes (the ODA converter writes them, ezdxf keeps them): "^ " is a caret, "^I" a TAB, "^J" a line feed …
CARET = re.compile(r'\^([ @-_])')
uni = lambda s: CARET.sub(lambda m: '^' if m.group(1) == ' ' else chr(ord(m.group(1)) - 64), UNI.sub(lambda m: chr(int(m.group(1), 16)), s or ''))
xyz = lambda v: [float(v[0]), float(v[1]), float(v[2]) if len(v) > 2 else 0.0]
xy = lambda v: [float(v[0]), float(v[1])]


def color(e):
    d = {'index': e.dxf.get('color', 256)}
    if e.dxf.hasattr('true_color'):
        d['rgb'] = e.dxf.true_color
    return d


def ent(e):
    t = e.dxftype()
    d = {'t': t, 'layer': e.dxf.get('layer', '0'), 'color': color(e), 'linetype': e.dxf.get('linetype', 'BYLAYER'),
         'lineweight': e.dxf.get('lineweight', -1), 'invisible': e.dxf.get('invisible', 0)}
    try:
        if t == 'LINE':
            d.update(start=xyz(e.dxf.start), end=xyz(e.dxf.end))
        elif t == 'POINT':
            d.update(position=xyz(e.dxf.location))
        elif t == 'CIRCLE':
            d.update(center=xyz(e.dxf.center), radius=e.dxf.radius)
        elif t == 'ARC':
            d.update(center=xyz(e.dxf.center), radius=e.dxf.radius, a0=e.dxf.start_angle, a1=e.dxf.end_angle)
        elif t == 'ELLIPSE':
            d.update(center=xyz(e.dxf.center), major=xyz(e.dxf.major_axis), ratio=e.dxf.ratio, s=e.dxf.start_param, e=e.dxf.end_param)
        elif t == 'LWPOLYLINE':
            d.update(closed=bool(e.closed), elevation=e.dxf.get('elevation', 0), pts=[[float(p[0]), float(p[1]), float(p[4])] for p in e.get_points('xyseb')],
                     widths=[[float(p[2]), float(p[3])] for p in e.get_points('xyseb')], constwidth=e.dxf.get('const_width', 0))
        elif t == 'POLYLINE':
            mode = e.get_mode()
            d.update(mode=mode, closed=bool(e.is_closed), flags=e.dxf.flags)
            if mode == 'AcDbPolyFaceMesh':
                d.update(pts=[xyz(v.dxf.location) for v in e.vertices if v.is_poly_face_mesh_vertex],
                         faces=[[v.dxf.get('vtx0', 0), v.dxf.get('vtx1', 0), v.dxf.get('vtx2', 0), v.dxf.get('vtx3', 0)] for v in e.vertices if v.is_face_record])
            else:
                d.update(pts=[xyz(v.dxf.location) for v in e.vertices], bulges=[v.dxf.get('bulge', 0) for v in e.vertices])
                if mode == 'AcDb2dPolyline':
                    d['elevation'] = e.dxf.elevation[2]
                if mode == 'AcDbPolygonMesh':
                    d.update(m=e.dxf.m_count, n=e.dxf.n_count)
        elif t in ('TEXT', 'ATTRIB', 'ATTDEF'):
            d.update(text=uni(e.dxf.text), ins=xyz(e.dxf.insert), h=e.dxf.height, rot=e.dxf.get('rotation', 0), halign=e.dxf.get('halign', 0),
                     valign=e.dxf.get('valign', 0), wf=e.dxf.get('width', 1), style=e.dxf.get('style', 'Standard'),
                     align=xyz(e.dxf.align_point) if e.dxf.hasattr('align_point') else None)
            if t != 'TEXT':
                d.update(tag=e.dxf.tag, flags=e.dxf.get('flags', 0))
            if t == 'ATTDEF':
                d['prompt'] = e.dxf.get('prompt', '')
        elif t == 'MTEXT':
            d.update(text=uni(e.text), ins=xyz(e.dxf.insert), h=e.dxf.char_height, width=e.dxf.get('width', 0), attach=e.dxf.get('attachment_point', 1),
                     style=e.dxf.get('style', 'Standard'))
        elif t == 'INSERT':
            d.update(block=e.dxf.name, ins=xyz(e.dxf.insert), scale=[e.dxf.get('xscale', 1), e.dxf.get('yscale', 1), e.dxf.get('zscale', 1)],
                     rot=e.dxf.get('rotation', 0), attribs=[{'tag': a.dxf.tag, 'text': uni(a.dxf.text), 'layer': a.dxf.layer, 'ins': xyz(a.dxf.insert)} for a in e.attribs],
                     cols=e.dxf.get('column_count', 1), rows=e.dxf.get('row_count', 1))
        elif t == 'DIMENSION':
            d.update(block=e.dxf.get('geometry', ''), dimtype=e.dxf.get('dimtype', 0) & 7, defpoint=xyz(e.dxf.defpoint), textmid=xyz(e.dxf.text_midpoint),
                     text=e.dxf.get('text', ''), style=e.dxf.get('dimstyle', 'Standard'),
                     p13=xyz(e.dxf.defpoint2) if e.dxf.hasattr('defpoint2') else None, p14=xyz(e.dxf.defpoint3) if e.dxf.hasattr('defpoint3') else None)
        elif t in ('SOLID', 'TRACE', '3DFACE'):
            d.update(pts=[xyz(e.dxf.get(k)) for k in ('vtx0', 'vtx1', 'vtx2', 'vtx3')])
        elif t == 'HATCH':
            loops = []
            for p in e.paths:
                if p.type == 1:   # polyline path
                    loops.append({'kind': 'poly', 'pts': [[float(v[0]), float(v[1])] for v in p.vertices]})
                else:
                    loops.append({'kind': 'edges', 'edges': [type(x).__name__ for x in p.edges]})
            d.update(pattern=e.dxf.pattern_name, solid=e.dxf.solid_fill, loops=loops)
        elif t == 'SPLINE':
            d.update(degree=e.dxf.degree, ctrl=[xyz(p) for p in e.control_points], fit=[xyz(p) for p in e.fit_points], knots=[float(k) for k in e.knots])
        elif t in ('RAY', 'XLINE'):
            d.update(start=xyz(e.dxf.start), direction=xyz(e.dxf.unit_vector))
        elif t == 'VIEWPORT':
            d.update(center=xyz(e.dxf.center), width=e.dxf.width, height=e.dxf.height, id=e.dxf.get('id', 0), viewcenter=xy(e.dxf.view_center_point),
                     viewheight=e.dxf.view_height)
    except Exception as x:   # a broken entity is a finding, not a crash
        d['error'] = repr(x)
    return d


def main(path, encoding=None):
    doc = ezdxf.readfile(path, encoding=encoding) if encoding else ezdxf.readfile(path)
    aud = None   # audited after the dump: ezdxf's fixes would delete entities a reader wrote incompletely
    h = doc.header
    out = {
        'version': doc.dxfversion,
        'audit': None,
        'header': {k: (xyz(h.get('$' + k)) if k.startswith('EXT') and h.get('$' + k) is not None else h.get('$' + k)) for k in ('INSUNITS', 'MEASUREMENT', 'EXTMIN', 'EXTMAX')},
        'layers': [{'name': l.dxf.name, 'color': l.dxf.color, 'rgb': l.dxf.get('true_color'), 'off': l.is_off(), 'frozen': l.is_frozen(), 'locked': l.is_locked(),
                    'plot': l.dxf.get('plot', 1), 'lineweight': l.dxf.get('lineweight', -3), 'linetype': l.dxf.get('linetype', 'Continuous')} for l in doc.layers],
        'linetypes': [{'name': lt.dxf.name, 'length': float(lt.simplified_line_pattern() and sum(abs(x) for x in lt.simplified_line_pattern()) or 0)} for lt in doc.linetypes],
        'styles': [{'name': s.dxf.name, 'font': s.dxf.get('font', ''), 'width': s.dxf.get('width', 1)} for s in doc.styles],
        'dimstyles': [{'name': s.dxf.name, 'dimscale': s.dxf.get('dimscale', 1), 'dimtxt': s.dxf.get('dimtxt', 0)} for s in doc.dimstyles],
        'blocks': {},
        'layouts': [],
    }
    for b in doc.blocks:
        if b.name.lower().startswith('*model_space') or b.name.lower().startswith('*paper_space'):
            continue
        out['blocks'][b.name] = {'base': xyz(b.block.dxf.base_point), 'entities': [ent(e) for e in b]}
    for lay in doc.layouts:
        out['layouts'].append({'name': lay.name, 'taborder': lay.dxf.get('taborder', 0), 'block': lay.block_record_handle if hasattr(lay, 'block_record_handle') else '',
                               'entities': [ent(e) for e in lay]})
    aud = doc.audit()
    out['audit'] = {'errors': len(aud.errors), 'fixes': len(aud.fixes)}
    print(json.dumps(out, default=lambda o: list(o) if hasattr(o, '__iter__') else str(o)))


if __name__ == '__main__':
    main(*sys.argv[1:])
