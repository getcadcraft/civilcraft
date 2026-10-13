#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
make-crs-db.py — writes civilcraft/dev/crs-db.json, the coordinate systems CivilCraft offers, from the
PROJ database that pyproj ships (EPSG registry).

    tools/civilcraft-test/venv/bin/python tools/civilcraft-test/make-crs-db.py

Kept: geographic 2D systems and projected systems in metres / international feet / US survey feet whose
proj4 definition proj4js can run without grid files (no +nadgrids). Datums whose good shifts need a grid file (NAD27,
OSGB36, …) get PROJ's first grid-free shift instead, with its EPSG accuracy (NAD27: ~20 m) — or none, accuracy unknown. Deprecated codes are left out. Each entry:
    [code, name, proj4, unit ('m'|'ft'|'ftUS'|'deg'), [west, south, east, north] area of use in degrees,
     shift accuracy in metres (how well the datum shift to WGS 84 is known, from EPSG) | null]
and crs-wkt.json { "<code>": "<ESRI WKT1>" } for shapefile .prj files (written only on export, so loaded lazily).
The datum shift to WGS 84 is the first transformation PROJ offers that needs no grid file, written as +towgs84
(position vector; coordinate-frame rotations are negated). NAD83 → a null shift (EPSG says good to about 4 m; the help says
so). Systems whose datum has no grid-free shift, or whose axes run west/south, or whose projection proj4js lacks are left out,
and so is any system where proj4js (tools/civilcraft-test/crs-proj4js.mjs, the vendored copy) and PROJ, given the same
definition, differ by more than 1 cm at five points inside its area of use.
"""
import json, os, sys, warnings
from pyproj import CRS
from pyproj.database import query_crs_info
from pyproj.enums import PJType
from pyproj.transformer import TransformerGroup

warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public_html', 'assets', 'apps', 'civilcraft', 'dev', 'crs-db.json')
WKT_OUT = os.path.join(os.path.dirname(OUT), 'crs-wkt.json')   # code → ESRI WKT1 (shapefile .prj), loaded only on export

UNITS = {'metre': 'm', 'foot': 'ft', 'US survey foot': 'ftUS', 'degree': 'deg'}
rows, skipped, wkts = [], {}, {}

WGS84 = CRS.from_epsg(4326)
shifts = {}   # geodetic CRS name → (towgs84 string | '' for none needed, accuracy m | None) or None (no usable shift)

def shift_for(crs):
    """The datum shift PROJ would pick first among those that need no grid file, as proj4 +towgs84 (position vector)."""
    g = crs.geodetic_crs
    key = g.to_wkt()
    if key in shifts:
        return shifts[key]
    out = None
    try:
        ts = TransformerGroup(g, WGS84, always_xy=True).transformers
        ts = [t for t in ts if 'allpark' not in t.name] + [t for t in ts if 'allpark' in t.name]   # ballpark (no shift) last
        for t in ts:
            p = t.to_proj4() or ''
            if 'grids' in p:
                continue
            if 'allpark' in t.name:   # nothing better: no shift, accuracy unknown (the UI warns)
                out = ('', None); break
            if t.name == 'noop' or p.strip() == '+proj=noop':
                out = ('', t.accuracy if t.accuracy and t.accuracy > 0 else None); break
            steps = [x for x in p.split('+step') if 'proj=helmert' in x]
            if len(steps) != 1:
                continue
            kv = dict(tok[1:].split('=', 1) for tok in steps[0].split() if tok.startswith('+') and '=' in tok)
            v = [float(kv.get(k, 0)) for k in ('x', 'y', 'z', 'rx', 'ry', 'rz', 's')]
            if kv.get('convention') == 'coordinate_frame':
                v[3], v[4], v[5] = -v[3], -v[4], -v[5]
            elif any(v[3:6]) and kv.get('convention') != 'position_vector':
                continue
            out = (','.join(('%.10g' % n) for n in (v if any(v[3:]) else v[:3])), t.accuracy if t.accuracy and t.accuracy > 0 else None)
            break
    except Exception:
        out = None
    shifts[key] = out
    return out

def skip(why):
    skipped[why] = skipped.get(why, 0) + 1

for kind in (PJType.GEOGRAPHIC_2D_CRS, PJType.PROJECTED_CRS):
    for info in query_crs_info(auth_name='EPSG', pj_types=kind, allow_deprecated=False):
        try:
            crs = CRS.from_epsg(int(info.code))
        except Exception:
            skip('unreadable'); continue
        axis = crs.axis_info
        if not axis:
            skip('no axes'); continue
        unit = UNITS.get(axis[0].unit_name)
        if not unit:
            skip('unit ' + axis[0].unit_name); continue
        try:
            p4 = crs.to_proj4()
        except Exception:
            skip('no proj4'); continue
        p4 = p4.replace(' +nadgrids=@null', '').replace(' +wktext', '')   # web Mercator's "no shift" marker
        if not p4 or 'nadgrids' in p4 or 'geoidgrids' in p4 or '+proj=' not in p4:
            skip('grid shift'); continue
        if kind == PJType.PROJECTED_CRS and '+proj=longlat' in p4:
            skip('odd'); continue
        if '+proj=mod_krovak' in p4 or '+proj=col_urban' in p4:
            skip('projection proj4js lacks'); continue
        axis_tok = [t for t in p4.split() if t.startswith('+axis=')]
        if axis_tok and axis_tok[0] not in ('+axis=enu', '+axis=neu'):
            skip('axis order'); continue
        toks = [t for t in p4.split() if t not in ('+no_defs', '+type=crs') and not t.startswith('+axis=')]
        sh = shift_for(crs)
        if sh is None:
            skip('no datum shift without a grid'); continue
        acc = sh[1]
        if sh[0] and not any(t.startswith('+towgs84=') for t in toks):
            if any(t.startswith('+datum=') for t in toks):   # spell the ellipsoid out so our shift is the one used
                e = crs.ellipsoid
                toks = [t for t in toks if not t.startswith('+datum=')] + ['+a=%.10g' % e.semi_major_metre,
                        ('+rf=%.12g' % e.inverse_flattening) if e.inverse_flattening else '+b=%.10g' % e.semi_minor_metre]
            toks.append('+towgs84=' + sh[0])
        p4 = ' '.join(toks)
        a = info.area_of_use
        area = [round(a.west, 3), round(a.south, 3), round(a.east, 3), round(a.north, 3)] if a else None
        rows.append([int(info.code), info.name, p4, unit, area, round(acc, 2) if acc else None])
        try:
            w = crs.to_wkt('WKT1_ESRI')
            if w: wkts[int(info.code)] = w
        except Exception:
            pass

# Keep only systems where proj4js (what the app runs) agrees with PROJ on the same definition to 1 cm at five points
# inside the area of use (its middle and four points a quarter of the way in).
import subprocess, tempfile
from pyproj import Transformer
def sample(area):
    if not area: return [[0, 0]]
    w, s_, e, n = area
    if e < w: e += 360
    pts = [[w + (e - w) * fx, s_ + (n - s_) * fy] for fx, fy in ((.5, .5), (.25, .25), (.75, .25), (.25, .75), (.75, .75))]
    return [[(x + 180) % 360 - 180, y] for x, y in pts]
cand = [[r[0], r[2], sample(r[4])] for r in rows]
with tempfile.TemporaryDirectory() as td:
    fi, fo = os.path.join(td, 'in.json'), os.path.join(td, 'out.json')
    json.dump(cand, open(fi, 'w'))
    subprocess.run(['node', os.path.join(HERE, 'crs-proj4js.mjs'), fi, fo], check=True)
    got = json.load(open(fo))
src = CRS.from_proj4('+proj=longlat +datum=WGS84 +no_defs')
kept = []
for r, (code, p4, pts) in zip(rows, cand):
    g = got.get(str(code))
    if not isinstance(g, list):
        skip('proj4js cannot run it'); continue
    try:
        # the projection maths, not the datum choice: PROJ would pick regional NAD83 shifts (Hawaii, Alaska: < 1 m) where
        # proj4js — and the app — treat NAD83 as WGS 84 (EPSG: good to about 4 m)
        t = Transformer.from_crs(src, CRS.from_proj4(p4.replace('+datum=NAD83', '+ellps=GRS80 +towgs84=0,0,0')), always_xy=True)
        worst = 0
        for (lon, lat), xy in zip(pts, g):
            X, Y = t.transform(lon, lat)
            if xy is None or not all(map(lambda v: v == v and abs(v) != float('inf'), (X, Y))):
                worst = float('inf'); break
            worst = max(worst, ((X - xy[0]) ** 2 + (Y - xy[1]) ** 2) ** .5)
    except Exception:
        worst = float('inf')
    if worst > 0.01:
        skip('proj4js differs from PROJ by more than 1 cm'); continue
    kept.append(r)
rows = kept
wkts = {k: v for k, v in wkts.items() if any(r[0] == k for r in rows)}

rows.sort(key=lambda r: r[0])
with open(OUT, 'w') as f:
    f.write('{"source":"EPSG registry via PROJ ' + __import__('pyproj').proj_version_str + '","fields":["code","name","proj4","unit","area","shiftAccuracy"],"crs":[\n')
    f.write(',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in rows))
    f.write('\n]}\n')
with open(WKT_OUT, 'w') as f:
    f.write('{\n' + ',\n'.join('"%d":%s' % (k, json.dumps(v, ensure_ascii=False)) for k, v in sorted(wkts.items())) + '\n}\n')
print(len(wkts), 'ESRI WKT →', os.path.relpath(WKT_OUT), os.path.getsize(WKT_OUT), 'bytes', file=sys.stderr)
print(len(rows), 'systems →', os.path.relpath(OUT), os.path.getsize(OUT), 'bytes; skipped', skipped, file=sys.stderr)
