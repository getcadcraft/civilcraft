# SPDX-License-Identifier: Apache-2.0
"""surfaces-compare.py — the SURFACE family check: our reader against the ODA File Converter's DXF of the same DWG.

    python surfaces-compare.py truth.dxf ours.json out.json
    python surfaces-compare.py --pair source.dxf written.dxf map.json out.json

ours.json = { "<HANDLE>": { type, acis: { format, data }, …model fields } } (surfaces-check.mjs writes it).
Every surface of the DXF (SURFACE PLANESURFACE EXTRUDEDSURFACE LOFTEDSURFACE REVOLVEDSURFACE SWEPTSURFACE NURBSURFACE):
  fields — the model fields the DXF gives, from the DXF's own group codes (per subclass: AcDbModelerGeometry, AcDbSurface,
           the class's own), mapped to the model names surface-read.js uses; surfaces-check.mjs compares them;
  acis   — our ACIS data against the DXF's: identical (save date aside) when both are the same format, else the same
           tokens (solids-compare.py's SAT/SAB tokenizer) — as solids-check does.
--pair (the writer check): the converter's DXF of the source DWG and of our written DWG (same version); map.json =
{ source handle: written handle }. Every surface of the source must be in the written file with the same type, the same
fields and the same ACIS data.
ezdxf (a black box) reads the ACIS: it has no PLANESURFACE / NURBSURFACE, so they are renamed SURFACE in a copy first.
"""
import importlib.util
import json
import os
import re
import sys
import tempfile

import ezdxf

_spec = importlib.util.spec_from_file_location('solids_compare', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'solids-compare.py'))
SC = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(SC)

TYPES = ('SURFACE', 'PLANESURFACE', 'EXTRUDEDSURFACE', 'LOFTEDSURFACE', 'REVOLVEDSURFACE', 'SWEPTSURFACE', 'NURBSURFACE')

# DXF code → model field, per subclass. 'M' = a 16-value matrix (the code repeated), 'P' = a point (code, +10, +20).
SWEEP = {42: 'draftAngle', 43: 'startDraftDistance', 44: 'endDraftDistance', 45: 'twistAngle', 48: 'scaleFactor', 49: 'alignAngle',
         46: ('sweepEntityTransform', 'M'), 47: ('pathEntityTransform', 'M'), 290: 'solid', 70: 'alignment', 71: 'miterOption',
         292: 'alignStart', 293: 'bank', 294: 'basePointSet', 295: 'sweepTransformComputed', 296: 'pathTransformComputed',
         11: ('twistRefVector', 'P')}
MAP = {
    'AcDbSurface': {71: 'uIsolines', 72: 'vIsolines'},
    'AcDbExtrudedSurface': {**SWEEP, 90: 'profileEntity', 10: ('sweepVector', 'P'), 40: ('matrix', 'M')},
    'AcDbSweptSurface': {**SWEEP, 90: 'sweepEntity', 91: 'pathEntity', 40: ('sweepEntityMatrix', 'M'), 41: ('pathEntityMatrix', 'M')},
    'AcDbRevolvedSurface': {90: 'revolveEntity', 10: ('axisPoint', 'P'), 11: ('axisVector', 'P'), 40: 'revolveAngle', 41: 'startAngle',
                            42: ('matrix', 'M'), 43: 'draftAngle', 44: 'startDraftDistance', 45: 'endDraftDistance', 46: 'twistAngle',
                            290: 'solid', 291: 'closeToAxis'},
    'AcDbLoftedSurface': {40: ('matrix', 'M'), 70: 'normal', 41: 'startDraftAngle', 42: 'endDraftAngle', 43: 'startDraftMagnitude',
                          44: 'endDraftMagnitude', 290: 'arcLengthParameterization', 291: 'noTwist', 292: 'alignDirection',
                          293: 'simpleSurfaces', 294: 'closedSurfaces', 295: 'solid', 296: 'ruledSurface', 297: 'virtualGuide'},
    'AcDbNurbSurface': {170: 'nurbs170', 290: 'nurbs290', 10: ('nurbs10', 'P'), 11: ('nurbs11', 'P'), 12: ('nurbs12', 'P'), 13: ('nurbs13', 'P')},
}
# entity ids: the model keeps them only when not 0 ({classId, raw}); 0 → absent
ENT_FIELDS = {'profileEntity', 'sweepEntity', 'pathEntity', 'revolveEntity'}


def num(v):
    try:
        return int(v)
    except ValueError:
        return float(v)


def tags(path):
    with open(path, encoding='utf8', errors='surrogateescape') as f:
        lines = f.read().replace('\r', '').split('\n')
    return [(lines[i].strip(), lines[i + 1]) for i in range(0, len(lines) - 1, 2)]


def scan_fields(path):
    """{ HANDLE: { type, layer, color, fields, guid? } } from the DXF tags."""
    out = {}
    cur = None
    sub = None
    xapp = None
    for c, v in tags(path):
        if c == '0':
            cur = None
            if v.strip() in TYPES:
                cur = {'type': v.strip(), 'fields': {}, 'xguid': []}
            sub = None
            continue
        if cur is None:
            continue
        code = int(c)
        if code == 5 and 'handle' not in cur:
            cur['handle'] = v.strip().upper(); out[cur['handle']] = cur; continue
        if code == 100:
            sub = v.strip(); continue
        if code == 1001:
            xapp = v.strip(); sub = None; continue
        if xapp == 'ACAD_OBJECT_CHANGE_GUID' and code in (1070, 1071):
            cur['xguid'].append(int(v)); continue
        if code == 8 and sub == 'AcDbEntity':
            cur['layer'] = v.strip()
        elif code == 62 and sub == 'AcDbEntity':
            cur['color'] = int(v)
        elif sub == 'AcDbModelerGeometry' and code == 290:
            cur['hasGuid'] = int(v) == 1
        elif sub == 'AcDbModelerGeometry' and code == 2:
            cur['guid'] = v.strip().lower()
        m = MAP.get(sub)
        if not m:
            continue
        base = code
        axis = None
        if code not in m and code - 10 in m and isinstance(m[code - 10], tuple) and m[code - 10][1] == 'P':
            base, axis = code - 10, 'y'
        elif code not in m and code - 20 in m and isinstance(m[code - 20], tuple) and m[code - 20][1] == 'P':
            base, axis = code - 20, 'z'
        spec = m.get(base)
        if spec is None:
            continue
        if isinstance(spec, tuple):
            name, kind = spec
            if kind == 'M':
                cur['fields'].setdefault(name, []).append(float(v))
            else:
                p = cur['fields'].setdefault(name, {'x': 0.0, 'y': 0.0, 'z': 0.0})
                p[axis or 'x'] = float(v)
        else:
            val = num(v)
            if code in (290, 291, 292, 293, 294, 295, 296, 297):
                val = val == 1
            if spec in ENT_FIELDS:
                val = val or None   # absent in the model when 0
            cur['fields'][spec] = val
    for r in out.values():
        if 'guid' not in r and len(r['xguid']) >= 12:
            v = r['xguid']
            d4 = ''.join('%02x' % (x & 0xFF) for x in v[4:12])
            r['guid'] = '{%08x-%04x-%04x-%s-%s}' % (v[1] & 0xFFFFFFFF, v[2] & 0xFFFF, v[3] & 0xFFFF, d4[:4], d4[4:])
            r['hasGuid'] = v[0] == 1
        del r['xguid']
    return out


def scan_acis(path):
    """{ HANDLE: (format, data) | ('error', text) } — ezdxf on a copy with PLANESURFACE / NURBSURFACE renamed SURFACE."""
    with open(path, encoding='utf8', errors='surrogateescape') as f:
        t = f.read()
    t = re.sub(r'(\n  0\r?\n)(PLANESURFACE|NURBSURFACE)(\r?\n)', r'\1SURFACE\3', t)
    fd, tmp = tempfile.mkstemp(suffix='.dxf')
    with os.fdopen(fd, 'w', encoding='utf8', errors='surrogateescape') as f:
        f.write(t)
    try:
        doc = ezdxf.readfile(tmp)
    finally:
        os.unlink(tmp)
    out = {}
    for layout in [doc.modelspace(), *doc.blocks]:
        for e in layout:
            if e.dxftype() not in TYPES:
                continue
            h = e.dxf.handle.upper()
            if h in out:
                continue
            try:
                out[h] = SC.truth_acis(e)
            except Exception as x:  # noqa
                out[h] = ('error', str(x)[:200])
    return out


def cmp_acis(fmt, data, ofmt, odata):
    r = {}
    if fmt == ofmt:
        if fmt == 'sat':
            a = [x.rstrip() for x in SC.undate(data).split('\n') if x.strip()]
            b = [x.rstrip() for x in SC.undate(odata).replace('\r', '').split('\n') if x.strip()]
            r['exact'] = a == b
        else:
            r['exact'] = SC.undate(data) == SC.undate(odata)
    if not r.get('exact'):
        try:
            why = SC.same_tokens(SC.tokens(fmt, data), SC.tokens(ofmt, odata))
            r['sameTokens'] = why is None
            if why:
                r['tokenDiff'] = why
        except Exception as x:  # noqa
            r['tokenError'] = str(x)[:200]
    return r


def main(dxf, ours_json, out):
    import base64
    fields = scan_fields(dxf)
    acis = scan_acis(dxf)
    ours = json.load(open(ours_json))
    res = {}
    for h, t in fields.items():
        r = dict(t)
        a = acis.get(h)
        o = ours.get(h)
        if not a:
            r['truthError'] = 'no ACIS in the DXF'
        elif a[0] == 'error':
            r['truthError'] = a[1]
        elif not o or not (o.get('acis') or {}).get('format'):
            r['oursAcis'] = None
        else:
            oa = o['acis']
            odata = base64.b64decode(oa['data']) if oa['format'] == 'sab' else oa['data']
            r['acisFormat'] = [oa['format'], a[0]]
            r.update(cmp_acis(a[0], a[1], oa['format'], odata))
        res[h] = r
    json.dump(res, open(out, 'w'), indent=1)


def pair(src_dxf, out_dxf, map_json, out):
    sf, sa = scan_fields(src_dxf), scan_acis(src_dxf)
    wf, wa = scan_fields(out_dxf), scan_acis(out_dxf)
    m = {k.upper(): v.upper() for k, v in json.load(open(map_json)).items()}
    res = {'surfaces': {}, 'extra': []}
    for h, s in sf.items():
        to = m.get(h)
        r = {'type': s['type'], 'to': to}
        w = wf.get(to)
        if not w:
            r['missing'] = True
        else:
            r['writtenType'] = w['type']
            diff = []
            for k in set(s['fields']) | set(w['fields']):
                x, y = s['fields'].get(k), w['fields'].get(k)
                if not same(x, y):
                    diff.append([k, x, y])
            for k in ('layer', 'color', 'guid', 'hasGuid'):
                if s.get(k) != w.get(k):
                    diff.append([k, s.get(k), w.get(k)])
            r['diff'] = diff
            a, b = sa.get(h), wa.get(to)
            if not a or a[0] == 'error':
                r['sourceError'] = a[1] if a else 'no ACIS'
            elif not b or b[0] == 'error':
                r['writtenError'] = b[1] if b else 'no ACIS'
            else:
                r['format'] = [a[0], b[0]]
                r.update(cmp_acis(a[0], a[1], b[0], b[1]))
        res['surfaces'][h] = r
    mapped = set(m.get(h) for h in sf)
    res['extra'] = [h for h in wf if h not in mapped]
    json.dump(res, open(out, 'w'), indent=1)


def same(x, y):
    if isinstance(x, list) and isinstance(y, list):
        return len(x) == len(y) and all(same(a, b) for a, b in zip(x, y))
    if isinstance(x, dict) and isinstance(y, dict):
        return all(same(x.get(k), y.get(k)) for k in set(x) | set(y))
    if isinstance(x, float) or isinstance(y, float):
        try:
            return abs(float(x) - float(y)) <= 1e-9 * max(1.0, abs(float(x)))
        except (TypeError, ValueError):
            return False
    return x == y


if __name__ == '__main__':
    if sys.argv[1] == '--pair':
        pair(*sys.argv[2:6])
    else:
        main(*sys.argv[1:4])
