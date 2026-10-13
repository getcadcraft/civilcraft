#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
crs_check.py — PROJ (pyproj) as the second reader for bin/test-civilcraft-crs.mjs. Reads a JSON list of jobs on
stdin, writes a JSON list of answers (same order) on stdout. Never used by the app.

    tools/civilcraft-test/venv/bin/python tools/civilcraft-test/crs_check.py < jobs.json

Jobs:
  {op:'fwd', code, pts:[[lon,lat]…]}        WGS 84 lon/lat → EPSG:code with the transformation PROJ picks (no grids
                                             installed and no network, so PROJ has the same grid-free choices the
                                             catalog had) → [[x,y]…]; also 'desc' (the operation PROJ used)
  {op:'inv', code, pts:[[x,y]…]}            EPSG:code → WGS 84 lon/lat
  {op:'own', code, pts:[[lon,lat]…]}        the projection maths only: the system's own geographic CRS → the system
  {op:'proj4', def, pts:[[lon,lat]…]}       WGS 84 lon/lat → the same proj4 definition the catalog carries
  {op:'factors', code, pts:[[x,y]…]}        Proj(EPSG:code): grid → own lon/lat, then get_factors → [{lon,lat,km,kp,conv}]
  {op:'between', a, b, pts:[[x,y]…]}        EPSG:a → EPSG:b
  {op:'wkt', code}                          {esri, gdal} WKT1 strings
  {op:'read', wkt, code, pts?}              {epsg: to_epsg(70) | null, same: CRS(wkt) equals EPSG:code (axis order ignored),
                                             proj4: the definition PROJ reads from it, diff: with pts, the largest gap
                                             between the WKT's and EPSG:code's projection of the same lon/lat}
  {op:'info', code}                         {area:[w,s,e,n], unit, name, geographic}
"""
import json, sys, math, warnings
warnings.filterwarnings('ignore')
from pyproj import CRS, Proj, Transformer

WGS = CRS.from_epsg(4326)
_crs, _tr = {}, {}

def crs(code):
    if code not in _crs:
        _crs[code] = CRS.from_epsg(int(code))
    return _crs[code]

def tr(a, b):
    k = (a, b)
    if k not in _tr:
        _tr[k] = Transformer.from_crs(a, b, always_xy=True)
    return _tr[k]

def num(v):
    return v if isinstance(v, float) and math.isfinite(v) else None

def pts(t, ps, inverse=False):
    out = []
    for p in ps:
        try:
            x, y = t.transform(p[0], p[1], direction='INVERSE' if inverse else 'FORWARD')
            out.append([num(x), num(y)])
        except Exception:
            out.append(None)
    return out

def run(j):
    op = j['op']
    if op == 'fwd':
        t = tr(WGS, crs(j['code']))
        return {'pts': pts(t, j['pts']), 'desc': t.description}
    if op == 'inv':
        t = tr(crs(j['code']), WGS)
        return {'pts': pts(t, j['pts']), 'desc': t.description}
    if op == 'own':
        c = crs(j['code'])
        return {'pts': pts(tr(c.geodetic_crs, c), j['pts'])}
    if op == 'proj4':
        return {'pts': pts(tr(WGS, CRS.from_proj4(j['def'])), j['pts'])}
    if op == 'between':
        t = tr(crs(j['a']), crs(j['b']))
        return {'pts': pts(t, j['pts']), 'desc': t.description}
    if op == 'factors':
        p = Proj(crs(j['code']))
        out = []
        for x, y in j['pts']:
            lon, lat = p(x, y, inverse=True)
            f = p.get_factors(lon, lat)
            out.append({'lon': lon, 'lat': lat, 'km': f.meridional_scale, 'kp': f.parallel_scale, 'conv': f.meridian_convergence})
        return out
    if op == 'wkt':
        c = crs(j['code'])
        return {'esri': c.to_wkt('WKT1_ESRI'), 'gdal': c.to_wkt('WKT1_GDAL')}
    if op == 'read':
        try:
            c = CRS.from_wkt(j['wkt'])
        except Exception as e:
            return {'error': str(e)[:200]}
        same = None
        if j.get('code'):
            try:
                same = c.equals(crs(j['code']), ignore_axis_order=True)
            except Exception:
                same = None
        try:
            p4 = c.to_proj4()
        except Exception:
            p4 = None
        diff = None
        if j.get('code') and j.get('pts'):
            # the same lon/lat (each on its own datum) through the WKT and through EPSG:code: the largest gap, in the system's units
            e = crs(j['code'])
            a = pts(tr(c.geodetic_crs, c), j['pts']) if c.is_projected else j['pts']
            b = pts(tr(e.geodetic_crs, e), j['pts']) if e.is_projected else j['pts']
            diff = max((math.hypot(p[0] - q[0], p[1] - q[1]) if p and q and None not in p + q else float('inf')) for p, q in zip(a, b))
            diff = diff if math.isfinite(diff) else 1e99
        return {'epsg': c.to_epsg(70), 'same': same, 'proj4': p4, 'diff': diff}
    if op == 'info':
        c = crs(j['code'])
        a = c.area_of_use
        return {'area': [a.west, a.south, a.east, a.north] if a else None, 'unit': c.axis_info[0].unit_name if c.axis_info else None,
                'name': c.name, 'geographic': c.is_geographic}
    raise ValueError('unknown op ' + op)

out = []
for j in json.load(sys.stdin):
    try:
        out.append(run(j))
    except Exception as e:
        out.append({'error': str(e)[:200]})
json.dump(out, sys.stdout)
