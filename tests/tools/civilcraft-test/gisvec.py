#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""gisvec.py — GDAL (through pyogrio) as the second reader and the fixture writer for CivilCraft's GIS vector files
(bin/test-civilcraft-gisvec.mjs, tools/civilcraft-test/browser-gis-vector.mjs). Test-only; nothing ships.

  gisvec.py make <dir>            write the fixtures (shapefiles, a zip of several, GeoJSON, GeoPackage) + truth.json
  gisvec.py read <file> [layer]   what GDAL reads: every layer, its CRS (EPSG code via pyproj), geometry type, fields
                                  and their types, and every feature (geometry as coordinates, attributes) as JSON
  gisvec.py layers <file>         layer names only
  gisvec.py kml <file.kml>        (0.4 V6) GDAL's KML driver writes a fixture: layers "Trees" (points with height),
                                  "Roads" (lines), "Lots" (polygons, one with a hole), names and number fields, in lon/lat

Geometries go in and out of GDAL as WKB; this file has its own small WKB reader/writer (independent of CivilCraft's).
Run it with tools/civilcraft-test/venv/bin/python (pyogrio 0.13, GDAL 3.12, pyproj).
"""
import json, os, struct, sys, zipfile, datetime
import numpy as np
import pyogrio
from pyogrio import raw
from pyproj import CRS

# ---------------------------------------------------------------- WKB (ISO, little endian)
def wkb(g):
    t, c = g
    hz = has_z(g)
    base = {'Point': 1, 'LineString': 2, 'Polygon': 3, 'MultiPoint': 4, 'MultiLineString': 5, 'MultiPolygon': 6, 'GeometryCollection': 7}[t]
    out = struct.pack('<BI', 1, base + (1000 if hz else 0))
    def pt(p):
        return struct.pack('<ddd', p[0], p[1], p[2] if len(p) > 2 else 0.0) if hz else struct.pack('<dd', p[0], p[1])
    if t == 'Point':
        return out + pt(c)
    if t == 'LineString':
        return out + struct.pack('<I', len(c)) + b''.join(pt(p) for p in c)
    if t == 'Polygon':
        return out + struct.pack('<I', len(c)) + b''.join(struct.pack('<I', len(r)) + b''.join(pt(p) for p in r) for r in c)
    if t == 'MultiPoint':
        return out + struct.pack('<I', len(c)) + b''.join(wkb(('Point', p)) if not hz else wkb_z(('Point', p)) for p in c)
    if t == 'MultiLineString':
        return out + struct.pack('<I', len(c)) + b''.join(wkb_z(('LineString', l)) if hz else wkb(('LineString', l)) for l in c)
    if t == 'MultiPolygon':
        return out + struct.pack('<I', len(c)) + b''.join(wkb_z(('Polygon', p)) if hz else wkb(('Polygon', p)) for p in c)
    if t == 'GeometryCollection':
        return out + struct.pack('<I', len(c)) + b''.join(wkb_z(k) if hz else wkb(k) for k in c)

def wkb_z(g):
    # a child of a Z collection is written Z too
    t, c = g
    return wkb((t, c)) if has_z(g) else wkb((t, add_z(t, c)))

def add_z(t, c):
    if t == 'Point': return list(c) + [0.0] if len(c) == 2 else c
    if t == 'LineString': return [add_z('Point', p) for p in c]
    if t == 'Polygon': return [add_z('LineString', r) for r in c]
    return c

def has_z(g):
    t, c = g
    if t == 'Point': return len(c) > 2
    if t in ('LineString', 'MultiPoint'): return any(len(p) > 2 for p in c)
    if t in ('Polygon', 'MultiLineString'): return any(len(p) > 2 for r in c for p in r)
    if t == 'MultiPolygon': return any(len(p) > 2 for poly in c for r in poly for p in r)
    if t == 'GeometryCollection': return any(has_z(k) for k in c)

def read_wkb(b, o=0):
    le = b[o] == 1
    e = '<' if le else '>'
    t = struct.unpack_from(e + 'I', b, o + 1)[0]
    o += 5
    z = m = False
    if t & 0x80000000: z = True; t &= 0x0fffffff
    if t & 0x40000000: m = True; t &= 0x0fffffff
    if t >= 3000: z = m = True; t -= 3000
    elif t >= 2000: m = True; t -= 2000
    elif t >= 1000: z = True; t -= 1000
    dim = 2 + z + m
    def pt(o):
        v = struct.unpack_from(e + 'd' * dim, b, o)
        return ([v[0], v[1], v[2]] if z else [v[0], v[1]]), o + 8 * dim
    def seq(o):
        n = struct.unpack_from(e + 'I', b, o)[0]; o += 4; out = []
        for _ in range(n):
            p, o = pt(o); out.append(p)
        return out, o
    if t == 1:
        p, o = pt(o); return ('Point', p), o
    if t == 2:
        s, o = seq(o); return ('LineString', s), o
    if t == 3:
        n = struct.unpack_from(e + 'I', b, o)[0]; o += 4; rings = []
        for _ in range(n):
            s, o = seq(o); rings.append(s)
        return ('Polygon', rings), o
    if t in (4, 5, 6, 7):
        n = struct.unpack_from(e + 'I', b, o)[0]; o += 4; kids = []
        for _ in range(n):
            k, o = read_wkb(b, o); kids.append(k)
        name = {4: 'MultiPoint', 5: 'MultiLineString', 6: 'MultiPolygon', 7: 'GeometryCollection'}[t]
        return (name, kids if t == 7 else [k[1] for k in kids]), o
    raise ValueError('wkb type %d' % t)

def jsonable(v):
    if v is None: return None
    if isinstance(v, (np.floating,)): return None if np.isnan(v) else float(v)
    if isinstance(v, (np.integer,)): return int(v)
    if isinstance(v, (np.bool_,)): return bool(v)
    if isinstance(v, np.datetime64) and np.isnat(v): return None
    if isinstance(v, (datetime.date, datetime.datetime, np.datetime64)): return str(v)[:10]
    if isinstance(v, bytes): return v.hex()
    if isinstance(v, float) and v != v: return None
    return v

def epsg_of(crs):
    if not crs: return None
    try:
        c = CRS.from_user_input(crs)
        return c.to_epsg(min_confidence=70)
    except Exception:
        return None

def read(path, only=None):
    out = []
    for name, gtype in pyogrio.list_layers(path):
        if only and name != only: continue
        meta, fids, geom, data = raw.read(path, layer=name, return_fids=True)
        info = pyogrio.read_info(path, layer=name)
        feats = []
        for i in range(len(fids)):
            g = None
            if geom is not None and geom[i] is not None:
                g = list(read_wkb(bytes(geom[i]))[0])
            props = {meta['fields'][k]: jsonable(data[k][i]) for k in range(len(meta['fields']))}
            feats.append({'g': g, 'p': props})
        out.append({'name': name, 'geometry_type': meta.get('geometry_type'), 'crs': meta.get('crs'), 'epsg': epsg_of(meta.get('crs')),
                    'fields': list(meta['fields']), 'dtypes': [str(d) for d in info['dtypes']], 'count': len(fids),
                    'encoding': meta.get('encoding'), 'features': feats})
    return out

# ---------------------------------------------------------------- fixtures
E0, N0 = 3115000.0, 10070000.0   # Texas Central ftUS magnitudes (EPSG:2277)

def write(path, layer, geoms, fields, values, crs, gtype, driver, encoding=None, lco=None, dtypes=None):
    g = np.array([None if x is None else wkb(x) for x in geoms], dtype=object)
    fd = []
    for k, f in enumerate(fields):
        col = [v[k] for v in values]
        dt = (dtypes or {}).get(f)
        if dt == 'datetime64[D]':
            fd.append(np.array([np.datetime64(c) if c else np.datetime64('NaT') for c in col], dtype='datetime64[D]'))
        elif dt:
            fd.append(np.array(col, dtype=dt))
        else:
            fd.append(np.array(col, dtype=object))
    kw = {}
    if encoding: kw['encoding'] = encoding
    raw.write(path, g, fd, fields, layer=layer, driver=driver, crs=crs, geometry_type=gtype, layer_options=lco or {}, **kw)

def make_kml(path):
    """0.4 V6: a KML written by GDAL (the KML driver appends layers as Folders)."""
    lon0, lat0 = -97.7431, 30.2672
    write(path, 'Trees', [('Point', [lon0 + 0.0001 * i, lat0 + 0.0002 * i, 150.0 + i]) for i in range(3)], ['Name', 'Height'], [['Oak %d' % i, 10.5 + i] for i in range(3)], 'EPSG:4326', 'Point Z', 'KML')
    write(path, 'Roads', [('LineString', [[lon0, lat0], [lon0 + 0.001, lat0 + 0.0005], [lon0 + 0.002, lat0]])], ['Name'], [['Main St']], 'EPSG:4326', 'LineString', 'KML', lco=None)
    sq = [[lon0, lat0], [lon0 + 0.001, lat0], [lon0 + 0.001, lat0 + 0.001], [lon0, lat0 + 0.001], [lon0, lat0]]
    hole = [[lon0 + 0.0003, lat0 + 0.0003], [lon0 + 0.0003, lat0 + 0.0006], [lon0 + 0.0006, lat0 + 0.0006], [lon0 + 0.0006, lat0 + 0.0003], [lon0 + 0.0003, lat0 + 0.0003]]
    write(path, 'Lots', [('Polygon', [sq, hole])], ['Name', 'Area'], [['Lot 1', 1234.5]], 'EPSG:4326', 'Polygon', 'KML')

def make(d):
    os.makedirs(d, exist_ok=True)
    truth = {}
    names = ['Héllo wörld', 'Straße — 中文', 'plain', '', 'quote "x", comma']
    # points with every attribute type; one empty geometry
    pts = [('Point', [E0 + 10.5, N0 + 20.25, 501.125]), ('Point', [E0 + 30, N0 + 40, 502.5]), None, ('Point', [E0 + 55.5, N0 + 66.75, 499.0]), ('Point', [E0 - 5, N0 - 7, 498.25])]
    fields = ['NAME', 'COUNT', 'ELEV', 'BUILT', 'OK']
    vals = [[names[i], i * 7 - 3, 500.0 + i * 1.25, '2026-10-%02d' % (i + 1), i % 2 == 0] for i in range(5)]
    dt = {'COUNT': 'int32', 'ELEV': 'float64', 'BUILT': 'datetime64[D]', 'OK': 'bool'}
    write(os.path.join(d, 'pointz.shp'), 'pointz', pts, fields, vals, 'EPSG:2277', 'Point Z', 'ESRI Shapefile', dtypes=dt)
    write(os.path.join(d, 'points2d.shp'), 'points2d', [None if p is None else ('Point', p[1][:2]) for p in pts], fields, vals, 'EPSG:2277', 'Point', 'ESRI Shapefile', dtypes=dt)
    # multipoint
    write(os.path.join(d, 'multipoint.shp'), 'multipoint', [('MultiPoint', [[E0, N0, 1.0], [E0 + 1, N0 + 2, 3.0]]), ('MultiPoint', [[E0 + 5, N0 + 5, 7.0]])], ['ID'], [[1], [2]], 'EPSG:2277', 'MultiPoint Z', 'ESRI Shapefile', dtypes={'ID': 'int32'})
    # lines, multi-part, with z
    lines = [('MultiLineString', [[[E0, N0, 500.0], [E0 + 100, N0 + 10, 501.0], [E0 + 200, N0 + 0, 502.0]], [[E0, N0 + 50, 503.0], [E0 + 50, N0 + 60, 504.0]]]),
             ('MultiLineString', [[[E0 + 10, N0 + 10, 510.0], [E0 + 20, N0 + 30, 511.5]]]), None]
    write(os.path.join(d, 'linez.shp'), 'linez', lines, ['NAME', 'ELEV'], [['ridge', 500.0], ['swale', 510.0], ['empty', None]], 'EPSG:2277', 'MultiLineString Z', 'ESRI Shapefile', dtypes={'ELEV': 'float64'})
    # contours: 2D lines with an elevation field
    cont = [('LineString', [[E0 + i * 10, N0], [E0 + i * 10 + 5, N0 + 50], [E0 + i * 10, N0 + 100]]) for i in range(4)]
    write(os.path.join(d, 'contours.shp'), 'contours', cont, ['CONTOUR'], [[495.0 + i] for i in range(4)], 'EPSG:2277', 'LineString', 'ESRI Shapefile', dtypes={'CONTOUR': 'float64'})
    # polygons: holes, multipolygon
    sq = lambda x, y, s, z=None: [[x, y] + ([z] if z is not None else []), [x + s, y] + ([z] if z is not None else []), [x + s, y + s] + ([z] if z is not None else []), [x, y + s] + ([z] if z is not None else []), [x, y] + ([z] if z is not None else [])]
    polys = [('Polygon', [sq(E0, N0, 100), sq(E0 + 10, N0 + 10, 20), sq(E0 + 50, N0 + 50, 20)]),
             ('MultiPolygon', [[sq(E0 + 200, N0, 50)], [sq(E0 + 300, N0, 40), sq(E0 + 310, N0 + 10, 10)]])]
    write(os.path.join(d, 'polygons.shp'), 'polygons', polys, ['NAME', 'AREA'], [['lot 1', 9200.0], ['lots 2–3', 4000.0]], 'EPSG:2277', 'MultiPolygon', 'ESRI Shapefile', dtypes={'AREA': 'float64'})
    write(os.path.join(d, 'polygonz.shp'), 'polygonz', [('Polygon', [sq(E0, N0, 100, 505.0)])], ['NAME'], [['pad']], 'EPSG:2277', 'Polygon Z', 'ESRI Shapefile')
    # Windows-1252 attribute text: one with a .cpg, one without (LDID only)
    for nm, keep_cpg in (('cp1252', True), ('cp1252nocpg', False)):
        write(os.path.join(d, nm + '.shp'), nm, [('Point', [E0, N0])], ['NAME', 'NOTE'], [['Café crème', 'naïve — “quoted”']], 'EPSG:2277', 'Point', 'ESRI Shapefile', encoding='cp1252')
        if not keep_cpg:
            for ext in ('.cpg', '.CPG'):
                if os.path.exists(os.path.join(d, nm + ext)): os.remove(os.path.join(d, nm + ext))
    # UTM metres
    write(os.path.join(d, 'utm.shp'), 'utm', [('Point', [621160.0, 3349894.0])], ['NAME'], [['utm 14N']], 'EPSG:32614', 'Point', 'ESRI Shapefile')
    # a zip of several shapefiles (one in a folder)
    with zipfile.ZipFile(os.path.join(d, 'several.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for nm in ('pointz', 'linez', 'polygons'):
            for ext in ('shp', 'shx', 'dbf', 'prj', 'cpg'):
                p = os.path.join(d, nm + '.' + ext)
                if os.path.exists(p): z.write(p, ('data/' if nm == 'linez' else '') + nm + '.' + ext)
    # GeoJSON (RFC 7946: lon/lat)
    lon, lat = -97.7431, 30.2672
    gj = [('Point', [lon, lat, 150.5]), ('MultiPoint', [[lon + 0.001, lat], [lon + 0.002, lat + 0.001]]),
          ('LineString', [[lon, lat], [lon + 0.001, lat + 0.001], [lon + 0.002, lat]]),
          ('MultiLineString', [[[lon, lat + 0.01], [lon + 0.001, lat + 0.011]], [[lon + 0.003, lat], [lon + 0.004, lat]]]),
          ('Polygon', [[[lon, lat], [lon + 0.003, lat], [lon + 0.003, lat + 0.003], [lon, lat + 0.003], [lon, lat]], [[lon + 0.001, lat + 0.001], [lon + 0.001, lat + 0.002], [lon + 0.002, lat + 0.002], [lon + 0.002, lat + 0.001], [lon + 0.001, lat + 0.001]]]),
          ('GeometryCollection', [('Point', [lon + 0.005, lat]), ('LineString', [[lon + 0.005, lat], [lon + 0.006, lat]])]), None]
    write(os.path.join(d, 'austin.geojson'), 'austin', gj, ['name', 'n', 'v', 'flag', 'note'], [['p', 1, 1.5, True, 'a'], ['mp', 2, 2.5, False, None], ['l', 3, 3.25, True, 'Ünïcode'], ['ml', 4, 4.5, False, None], ['pg', 5, 5.5, True, 'x'], ['gc', 6, 6.5, False, 'y'], ['none', 7, 7.5, True, 'z']],
          'EPSG:4326', 'Unknown', 'GeoJSON', lco={'RFC7946': 'YES'}, dtypes={'n': 'int32', 'v': 'float64', 'flag': 'bool'})
    # GeoPackage: three tables in EPSG:2277 + one in 4326
    gp = os.path.join(d, 'site.gpkg')
    if os.path.exists(gp): os.remove(gp)
    write(gp, 'survey', pts, fields, vals, 'EPSG:2277', 'Point Z', 'GPKG', dtypes=dt)
    write(gp, 'breaks', lines, ['NAME', 'ELEV'], [['ridge', 500.0], ['swale', 510.0], ['empty', None]], 'EPSG:2277', 'MultiLineString Z', 'GPKG', dtypes={'ELEV': 'float64'})
    write(gp, 'lots', polys, ['NAME', 'AREA'], [['lot 1', 9200.0], ['lots 2–3', 4000.0]], 'EPSG:2277', 'MultiPolygon', 'GPKG', dtypes={'AREA': 'float64'})
    write(gp, 'wgs', [('Point', [lon, lat])], ['NAME'], [['austin']], 'EPSG:4326', 'Point', 'GPKG')
    print(json.dumps({'ok': True, 'dir': d}))

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'make': make(sys.argv[2])
    elif mode == 'read': print(json.dumps(read(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)))
    elif mode == 'layers': print(json.dumps([n for n, _ in pyogrio.list_layers(sys.argv[2])]))
    elif mode == 'kml': make_kml(sys.argv[2])
    else: sys.exit('usage: gisvec.py make <dir> | read <file> [layer] | layers <file>')
