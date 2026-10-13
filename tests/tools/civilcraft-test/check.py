#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
check.py — a second, independent reader for what CivilCraft writes (used by bin/test-civilcraft.mjs).

  python3 check.py landxml <file>   → JSON: schema check against landxml-1.2/LandXML-1.2.xsd (needs lxml,
                                      else "schema": "skipped") + a summary read with the standard library
  python3 check.py dxf <file>       → JSON: ezdxf readfile + audit, entity counts by type and layer
                                      (needs ezdxf; else {"skipped": true})
  python3 check.py dxfdump <file> [encoding]   → JSON: every model-space entity in order with its geometry, and the
                                      layers with colours — used to compare what a DWG reader (LibreDWG,
                                      libdxfrw, ODA File Converter) got out of a DWG CivilCraft wrote
Run with tools/civilcraft-test/venv/bin/python when that venv exists (pip install lxml ezdxf).
"""
import json
import os
import sys
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
NS = '{http://www.landxml.org/schema/LandXML-1.2}'


def landxml(path):
    out = {}
    try:
        from lxml import etree
        schema = etree.XMLSchema(etree.parse(os.path.join(HERE, 'landxml-1.2', 'LandXML-1.2.xsd')))
        doc = etree.parse(path)
        ok = schema.validate(doc)
        out['schema'] = 'valid' if ok else 'invalid'
        out['schema_errors'] = [str(e) for e in list(schema.error_log)[:10]]
    except ImportError:
        out['schema'] = 'skipped'
    root = ET.parse(path).getroot()
    pts = root.findall(f'.//{NS}CgPoint')
    out['points'] = len(pts)
    if pts:
        v = [float(x) for x in pts[0].text.split()]
        out['first_point'] = {'name': pts[0].get('name'), 'desc': pts[0].get('desc'), 'n': v[0], 'e': v[1], 'z': v[2] if len(v) > 2 else None}
    surfs = []
    for s in root.findall(f'.//{NS}Surface'):
        P = s.findall(f'.//{NS}P')
        F = s.findall(f'.//{NS}F')
        ids = {p.get('id') for p in P}
        bad = sum(1 for f in F for i in f.text.split() if i not in ids)
        surfs.append({'name': s.get('name'), 'P': len(P), 'F': len(F), 'bad_refs': bad, 'breaklines': len(s.findall(f'.//{NS}Breakline')),
                      'area2d': float(s.find(f'{NS}Definition').get('area2DSurf'))})
    out['surfaces'] = surfs
    als = []
    for a in root.findall(f'.//{NS}Alignment'):
        cg = a.find(f'{NS}CoordGeom')
        als.append({'name': a.get('name'), 'length': float(a.get('length')), 'lines': len(cg.findall(f'{NS}Line')), 'curves': len(cg.findall(f'{NS}Curve')),
                    'radii': [float(c.get('radius')) for c in cg.findall(f'{NS}Curve')],
                    'pvis': len(a.findall(f'.//{NS}PVI')), 'paracurves': [float(c.get('length')) for c in a.findall(f'.//{NS}ParaCurve')],
                    'profsurf_points': sum(len(p.text.split()) // 2 for p in a.findall(f'.//{NS}ProfSurf/{NS}PntList2D'))})
    out['alignments'] = als
    out['networks'] = [{'name': n.get('name'), 'type': n.get('pipeNetType'), 'structs': len(n.findall(f'.//{NS}Struct')), 'pipes': len(n.findall(f'.//{NS}Pipe')),
                        'inverts': len(n.findall(f'.//{NS}Invert'))} for n in root.findall(f'.//{NS}PipeNetwork')]
    u = root.find(f'{NS}Units')
    out['units'] = [c.tag.replace(NS, '') + ':' + (c.get('linearUnit') or '') for c in u] if u is not None else []
    return out


def dxf(path):
    try:
        import ezdxf
    except ImportError:
        return {'skipped': True}
    doc = ezdxf.readfile(path)
    aud = doc.audit()
    counts, layers = {}, {}
    for e in doc.modelspace():
        t = e.dxftype()
        counts[t] = counts.get(t, 0) + 1
        layers[e.dxf.layer] = layers.get(e.dxf.layer, 0) + 1
    elev = sorted({round(e.dxf.elevation.z, 6) for e in doc.modelspace().query('POLYLINE') if e.get_mode() == 'AcDb2dPolyline'})
    texts = [e.dxf.text for e in doc.modelspace().query('TEXT')][:20]
    return {'version': doc.dxfversion, 'errors': len(aud.errors), 'fixes': len(aud.fixes), 'counts': counts, 'layers': layers, 'elevations': elev[:200], 'texts': texts}


def dxfdump(path, encoding=None):
    """encoding: force the text encoding (libdxfrw writes UTF-8 into R2000 files that say ANSI_1252)."""
    try:
        import ezdxf
    except ImportError:
        return {'skipped': True}
    import re
    doc = ezdxf.readfile(path, encoding=encoding) if encoding else ezdxf.readfile(path)
    uni = lambda s: re.sub(r'\\U\+([0-9A-Fa-f]{4})', lambda m: chr(int(m.group(1), 16)), s)   # \U+XXXX as CAD programs show it
    aud = doc.audit()
    xy = lambda v: [v[0], v[1]]
    xyz = lambda v: [v[0], v[1], v[2]]
    ents = []
    for e in doc.modelspace():
        t = e.dxftype()
        d = {'layer': e.dxf.layer}
        if t == 'LWPOLYLINE':
            d.update(t='lwpoly', closed=bool(e.closed), elev=e.dxf.elevation, pts=[[float(p[0]), float(p[1])] for p in e.get_points('xy')])
        elif t == 'POLYLINE':
            d.update(t='poly3d' if e.is_3d_polyline else 'poly2d', closed=bool(e.is_closed), pts=[xyz(v.dxf.location) for v in e.vertices])
            if not e.is_3d_polyline:
                d['elev'] = e.dxf.elevation[2]
        elif t == 'LINE':
            d.update(t='line', a=xyz(e.dxf.start), b=xyz(e.dxf.end))
        elif t == 'ARC':
            d.update(t='arc', c=xy(e.dxf.center), r=e.dxf.radius, a0=e.dxf.start_angle, a1=e.dxf.end_angle)
        elif t == 'CIRCLE':
            d.update(t='circle', c=xy(e.dxf.center), r=e.dxf.radius)
        elif t == 'POINT':
            d.update(t='point', p=xyz(e.dxf.location))
        elif t == 'TEXT':
            d.update(t='text', text=uni(e.dxf.text), ins=xy(e.dxf.insert), h=e.dxf.height, rot=e.dxf.rotation, halign=e.dxf.halign,
                     align=xy(e.dxf.align_point) if e.dxf.hasattr('align_point') else None)
        else:
            d.update(t=t)
        ents.append(d)
    layers = [{'name': l.dxf.name, 'color': l.dxf.color} for l in doc.layers]
    return {'version': doc.dxfversion, 'errors': len(aud.errors), 'fixes': len(aud.fixes), 'layers': layers, 'entities': ents,
            'insunits': doc.header.get('$INSUNITS'), 'measurement': doc.header.get('$MEASUREMENT')}


if __name__ == '__main__':
    mode, path = sys.argv[1], sys.argv[2]
    fn = {'landxml': landxml, 'dxf': dxf, 'dxfdump': dxfdump}[mode]
    print(json.dumps(fn(path, *sys.argv[3:])))
