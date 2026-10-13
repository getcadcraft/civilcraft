# SPDX-License-Identifier: Apache-2.0
"""solids-compare.py — builder S's ACIS check: our reader's ACIS data against the ODA File Converter's DXF of the same DWG.

    python solids-compare.py truth.dxf ours.json out.json
    python solids-compare.py --pair source.dxf written.dxf map.json out.json

--pair (the writer check): the converter's DXF of the source DWG and of our written DWG, in the same version; map.json
= { source handle: written handle }. Every ACIS entity of the source must be in the written file with the same data
(the converter re-saves both the same way: identical apart from the save date, else the same tokens) and every LIGHT
with the same fields.

ours.json = { "<HANDLE>": { "type", "format": "sat"|"sab", "data": text | base64 } } (solids-check.mjs writes it).
For every ACIS entity of the DXF (REGION / 3DSOLID / BODY) by handle: exact = same format and identical data; else both
are loaded by ezdxf's ACIS reader (a black box) and their vertices compared (rounded to 1e-6) — the converter turns SAB
into SAT and back when it writes a DXF of another kind, so bytes differ while the body is the same.
Also lists the DXF's LIGHT entities (name, type, status, plot glyph, intensity, position, target, attenuation, angles,
shadows, colour) for solids-check.mjs.
"""
import base64
import json
import re
import struct
import sys

import ezdxf
from ezdxf.acis import api as acis


def verts(data):
    bodies = acis.load(data)
    pts = set()
    for b in bodies:
        for v in acis.vertices_from_body(b):
            pts.add((round(v.x, 6) + 0.0, round(v.y, 6) + 0.0, round(v.z, 6) + 0.0))
    return sorted(pts)


DATE = re.compile(rb'[A-Z][a-z]{2} [A-Z][a-z]{2} [ 0-9][0-9] [0-9]{2}:[0-9]{2}:[0-9]{2} [0-9]{4}')


def undate(x):
    """the header's save date (the converter stamps its own when it writes the DXF)"""
    if isinstance(x, str):
        return DATE.sub(b'DATE', x.encode('latin1')).decode('latin1')
    return DATE.sub(b'DATE', x)


def sab_tokens(b):
    """SAB → comparable tokens: header numbers, record names, numbers, pointers (strings / logicals / enums skipped).
    Tags as SAB files use them (our own reading of the format, checked on the files at hand)."""
    p = 15
    out = []
    # header: the version (compared), then counts / flags the SAT header may give as 0 (not compared)
    if b[:15] == b'ASM BinaryFile4':
        out.append(('n', struct.unpack_from('<q', b, p)[0])); p += 8 + 8
    else:
        out.append(('n', struct.unpack_from('<i', b, p)[0])); p += 4 + 12
    name = ''
    while p < len(b):
        t = b[p]; p += 1
        if t == 0x02: p += 1
        elif t == 0x03: p += 2
        elif t == 0x04: out.append(('n', struct.unpack_from('<i', b, p)[0])); p += 4
        elif t == 0x05: out.append(('n', struct.unpack_from('<f', b, p)[0])); p += 4
        elif t == 0x06: out.append(('n', struct.unpack_from('<d', b, p)[0])); p += 8
        elif t == 0x07: p += 1 + b[p]
        elif t == 0x08: p += 2 + struct.unpack_from('<H', b, p)[0]
        elif t == 0x09: p += 4 + struct.unpack_from('<I', b, p)[0]
        elif t in (0x0A, 0x0B): pass
        elif t == 0x0C: out.append(('p', struct.unpack_from('<i', b, p)[0])); p += 4
        elif t == 0x0D:
            n = b[p]; name += b[p + 1:p + 1 + n].decode('latin1'); p += 1 + n
            if name.startswith('End-of-') or name == 'End-of-ACIS-data':
                break
            out.append(('r', name)); name = ''
        elif t == 0x0E: n = b[p]; name += b[p + 1:p + 1 + n].decode('latin1') + '-'; p += 1 + n
        elif t in (0x0F, 0x10, 0x11): pass
        elif t == 0x12: p += 4 + struct.unpack_from('<I', b, p)[0]
        elif t in (0x13, 0x14): out.extend(('n', v) for v in struct.unpack_from('<3d', b, p)); p += 24
        elif t == 0x15: p += 4
        elif t == 0x16: out.extend(('n', v) for v in struct.unpack_from('<2d', b, p)); p += 16
        else:
            raise ValueError('SAB tag 0x%02x at %d' % (t, p - 1))
    while out and out[-1][0] == 'r' and out[-1][1].startswith('End'):
        out.pop()
    return out


NUM = re.compile(r'^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$')


def sat_tokens(text):
    lines = [x for x in text.replace('\r', '').split('\n')]
    head = lines[0].split()
    out = [('n', float(head[0]))]
    if len(lines) > 2:
        out += [('n', float(x)) for x in lines[2].split() if NUM.match(x)]
    body = ' '.join(lines[3:]) if len(lines) > 3 else ''
    toks = body.split()
    i = 0
    new_rec = True
    while i < len(toks):
        t = toks[i]; i += 1
        if t.startswith('End-of-'):
            break
        if new_rec:
            if re.match(r'^-\d+$', t):   # record index (some SAT writers number records)
                continue
            out.append(('r', t)); new_rec = False; continue
        if t == '#':
            new_rec = True; continue
        if t.startswith('@'):   # @n string: skip the n characters
            n = int(t[1:]); s = toks[i] if i < len(toks) else ''
            # strings may contain spaces: skip tokens until n characters (+ spaces) are consumed
            used = len(s); i += 1
            while used < n and i < len(toks):
                used += 1 + len(toks[i]); i += 1
            continue
        if t.startswith('$'):
            out.append(('p', int(t[1:]))); continue
        if NUM.match(t):
            out.append(('n', float(t))); continue
        # words (logicals, enums, I/F …) are skipped
    return out


def same_tokens(a, b):
    if len(a) != len(b):
        return 'token count %d vs %d' % (len(a), len(b))
    for i, (x, y) in enumerate(zip(a, b)):
        if x[0] != y[0]:
            return 'token %d kind %s %r vs %s %r' % (i, x[0], x[1], y[0], y[1])
        if x[0] == 'n':
            if abs(x[1] - y[1]) > 1e-12 * max(1, abs(x[1]), abs(y[1])):
                return 'token %d %r vs %r' % (i, x[1], y[1])
        elif x[1] != y[1]:
            return 'token %d %r vs %r' % (i, x[1], y[1])
    return None


def tokens(fmt, data):
    return sab_tokens(data) if fmt == 'sab' else sat_tokens(data)


def truth_acis(e):
    if e.has_binary_data:
        return 'sab', bytes(e.sab)
    return 'sat', '\n'.join(e.sat)


def light_colors(dxf):
    """LIGHT 63 / 421 (the light's own colour, after the AcDbLight marker), read from the DXF text: ezdxf does not map them."""
    out = {}
    enc = 'utf8'
    with open(dxf, 'rb') as f:
        lines = f.read().decode(enc, errors='replace').splitlines()
    i, cur, sub = 0, None, False
    while i + 1 < len(lines):
        c, v = lines[i].strip(), lines[i + 1].strip()
        i += 2
        if c == '0':
            cur = {} if v == 'LIGHT' else None
            sub = False
            continue
        if cur is None:
            continue
        if c == '5' and 'h' not in cur:
            cur['h'] = v.upper(); out[cur['h']] = cur
        elif c == '100':
            sub = v == 'AcDbLight'
        elif sub and c == '63':
            cur['index'] = int(v)
        elif sub and c == '421':
            cur['rgb'] = int(v) & 0xFFFFFF
    return out


def main(dxf, ours_json, out):
    doc = ezdxf.readfile(dxf)
    lc = light_colors(dxf)
    ours = json.load(open(ours_json))
    res = {'entities': {}, 'lights': {}}
    for layout in [doc.modelspace(), *doc.blocks]:
        for e in layout:
            t = e.dxftype()
            h = e.dxf.handle.upper()
            if t in ('3DSOLID', 'REGION', 'BODY'):
                r = {'type': t}
                try:
                    fmt, data = truth_acis(e)
                except Exception as x:  # noqa
                    r['truthError'] = str(x)
                    res['entities'][h] = r
                    continue
                r['truthFormat'] = fmt
                r['truthSize'] = len(data)
                o = ours.get(h)
                if not o or not o.get('format'):
                    r['ours'] = None
                    res['entities'][h] = r
                    continue
                odata = base64.b64decode(o['data']) if o['format'] == 'sab' else o['data']
                r['oursFormat'] = o['format']
                r['oursSize'] = len(odata)
                if o['format'] == fmt:
                    if fmt == 'sat':
                        a = [x.rstrip() for x in undate(data).split('\n') if x.strip()]
                        b = [x.rstrip() for x in undate(odata).replace('\r', '').split('\n') if x.strip()]
                        r['exact'] = a == b
                    else:
                        r['exact'] = undate(data) == undate(odata)
                try:
                    why = same_tokens(tokens(fmt, data), tokens(o['format'], odata))
                    r['sameTokens'] = why is None
                    if why:
                        r['tokenDiff'] = why
                except Exception as x:  # noqa
                    r['tokenError'] = str(x)[:200]
                try:
                    vt = verts(data)
                    vo = verts(odata)
                    r['vertices'] = len(vt)
                    r['sameVertices'] = vt == vo
                except Exception as x:  # noqa
                    r['geomError'] = str(x)[:200]
                res['entities'][h] = r
            elif t == 'LIGHT':
                d = e.dxf
                res['lights'][h] = {
                    'name': d.get('name'), 'type': d.get('type'), 'status': d.get('status'), 'plotGlyph': d.get('plot_glyph'),
                    'intensity': d.get('intensity'), 'position': list(d.get('location', (0, 0, 0))), 'target': list(d.get('target', (0, 0, 0))),
                    'attenuationType': d.get('attenuation_type'), 'useAttenuationLimits': d.get('use_attenuation_limits'),
                    'attenuationStart': d.get('attenuation_start_limits'), 'attenuationEnd': d.get('attenuation_end_limits'),
                    'hotspot': d.get('hotspot_angle'), 'falloff': d.get('falloff_angle'), 'castShadows': d.get('cast_shadows'),
                    'shadowType': d.get('shadow_type'), 'shadowMapSize': d.get('shadow_map_size'), 'shadowMapSoftness': d.get('shadow_map_softness'),
                    'color': d.get('color', 256), 'trueColor': d.get('true_color'), 'layer': d.get('layer'),
                    'lightColor': lc.get(h, {}),
                }
    json.dump(res, open(out, 'w'), indent=1)


def scan(dxf):
    doc = ezdxf.readfile(dxf)
    lc = light_colors(dxf)
    acis_, lights = {}, {}
    for layout in [doc.modelspace(), *doc.blocks]:
        for e in layout:
            t = e.dxftype()
            h = e.dxf.handle.upper()
            if t in ('3DSOLID', 'REGION', 'BODY'):
                try:
                    acis_[h] = (t,) + truth_acis(e)
                except Exception as x:  # noqa
                    acis_[h] = (t, 'error', str(x))
            elif t == 'LIGHT':
                d = e.dxf
                lights[h] = [d.get('name'), d.get('type'), d.get('status'), d.get('plot_glyph'), d.get('intensity'),
                             [round(v, 9) for v in d.get('location', (0, 0, 0))], [round(v, 9) for v in d.get('target', (0, 0, 0))],
                             d.get('attenuation_type'), d.get('use_attenuation_limits'), d.get('attenuation_start_limits'),
                             d.get('attenuation_end_limits'), d.get('hotspot_angle'), d.get('falloff_angle'), d.get('cast_shadows'),
                             d.get('shadow_type'), d.get('shadow_map_size'), d.get('shadow_map_softness'), d.get('color', 256),
                             d.get('true_color'), d.get('layer'), {k: v for k, v in lc.get(h, {}).items() if k != 'h'}]
    return acis_, lights


def pair(src_dxf, out_dxf, map_json, out):
    sa, sl = scan(src_dxf)
    wa, wl = scan(out_dxf)
    m = {k.upper(): v.upper() for k, v in json.load(open(map_json)).items()}
    res = {'acis': {}, 'lights': {}, 'extraAcis': [], 'extraLights': []}
    for h, a in sa.items():
        r = {'type': a[0], 'to': m.get(h)}
        b = wa.get(m.get(h))
        if a[1] == 'error':
            r['sourceError'] = a[2]
        elif not b:
            r['missing'] = True
        elif b[1] == 'error':
            r['writtenError'] = b[2]
        else:
            r['format'] = [a[1], b[1]]
            r['size'] = [len(a[2]), len(b[2])]
            r['exact'] = a[1] == b[1] and undate(a[2]) == undate(b[2])
            if not r['exact']:
                try:
                    why = same_tokens(tokens(a[1], a[2]), tokens(b[1], b[2]))
                    r['sameTokens'] = why is None
                    if why:
                        r['tokenDiff'] = why
                except Exception as x:  # noqa
                    r['tokenError'] = str(x)[:200]
        res['acis'][h] = r
    mapped = set(m.get(h) for h in sa)
    res['extraAcis'] = [h for h in wa if h not in mapped]
    for h, l in sl.items():
        w = wl.get(m.get(h))
        res['lights'][h] = {'to': m.get(h), 'missing': w is None, 'diff': None if w is None else
                            [i for i, (x, y) in enumerate(zip(l, w)) if x != y and not (isinstance(x, float) and isinstance(y, float) and abs(x - y) <= 1e-9 * max(1, abs(x)))]}
    lm = set(m.get(h) for h in sl)
    res['extraLights'] = [h for h in wl if h not in lm]
    json.dump(res, open(out, 'w'), indent=1)


if __name__ == '__main__':
    if sys.argv[1] == '--pair':
        pair(*sys.argv[2:6])
    else:
        main(*sys.argv[1:4])
