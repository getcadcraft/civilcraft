#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""
terrain_fixtures.py — fixtures and the second reader for CivilCraft's elevation grids and LiDAR (docs/GIS-SPEC.md §3).
Run with tools/civilcraft-test/venv/bin/python (rasterio = GDAL, laspy + lazrs, pyproj = PROJ).

  make <dir>                 writes the fixture files into <dir> and prints JSON: what rasterio / laspy read from each
  tif <file> <json rows/cols>  reads an exported GeoTIFF with rasterio: crs, transform, nodata, dtype, units, tags, values
  proj <json>                {from, to, pts:[[x,y]…]} → the points through PROJ (always_xy)
  big <file> <n>             a large LAS 1.4 file of n points (the browser check's Cancel)

Every fixture is written by GDAL (rasterio) or laspy, never by CivilCraft, so the readers are checked against files
made by other software. Values are deterministic (no random seeds that change between runs).
"""
import json
import math
import os
import sys

import numpy as np
import rasterio
from rasterio.transform import from_origin
from rasterio.crs import CRS
import laspy
from pyproj import Transformer


def terrain(x, y):
    """A smooth hill and a valley (metres), exact to float32 for small grids."""
    return 120.0 + 0.015 * x - 0.01 * y + 8.0 * np.sin(x / 90.0) * np.cos(y / 70.0)


def write_tif(path, arr, transform, crs, dtype, nodata=None, tiled=False, compress=None, predictor=None, scale=None,
              offset=None, point=False, units=None, count=1):
    prof = dict(driver='GTiff', width=arr.shape[-1], height=arr.shape[-2], count=count, dtype=dtype, transform=transform,
                crs=CRS.from_epsg(crs) if crs else None)
    if nodata is not None:
        prof['nodata'] = nodata
    if tiled:
        prof.update(tiled=True, blockxsize=16, blockysize=16)
    else:
        prof.update(tiled=False, blockysize=7)
    if compress:
        prof['compress'] = compress
    if predictor:
        prof['predictor'] = predictor
    with rasterio.open(path, 'w', **prof) as d:
        if count == 1:
            d.write(arr.astype(dtype), 1)
        else:
            d.write(arr.astype(dtype))
        if scale is not None:
            d.scales = (scale,)
            d.offsets = (offset,)
        if point:
            d.update_tags(AREA_OR_POINT='Point')
        if units:
            d.units = (units,)
    return path


def facts_tif(path, window=None):
    with rasterio.open(path) as d:
        a = d.read(1, masked=False)
        return {
            'file': os.path.basename(path), 'width': d.width, 'height': d.height, 'count': d.count, 'dtype': d.dtypes[0],
            'epsg': d.crs.to_epsg() if d.crs else None, 'geographic': bool(d.crs and d.crs.is_geographic),
            'transform': list(d.transform)[:6], 'nodata': d.nodata, 'scale': d.scales[0], 'offset': d.offsets[0],
            'area_or_point': d.tags().get('AREA_OR_POINT'), 'units': d.units[0] if d.units else None,
            'values': [None if (d.nodata is not None and v == d.nodata) else float(v) for v in a.ravel().tolist()],
        }


def make(out):
    os.makedirs(out, exist_ok=True)
    res = {'rasters': [], 'las': []}
    # --- rasters -----------------------------------------------------------------------------------------------
    W, H = 40, 30
    jj, ii = np.mgrid[0:H, 0:W]
    # UTM 14N, 10 m cells, float32, tiled, DEFLATE, nodata -9999 in a corner block
    x0, y0, c = 620000.0, 3350000.0, 10.0
    z = terrain(ii * c, -jj * c).astype('float32')
    z[0:3, 0:4] = -9999
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'utm-f32-tiled-deflate.tif'), z, from_origin(x0, y0, c, c), 32614, 'float32', nodata=-9999, tiled=True, compress='deflate', predictor=3)))
    # the same grid, stripped, LZW
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'utm-f32-strip-lzw.tif'), z, from_origin(x0, y0, c, c), 32614, 'float32', nodata=-9999, compress='lzw')))
    # pixel-is-point
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'utm-f32-point.tif'), z, from_origin(x0, y0, c, c), 32614, 'float32', nodata=-9999, point=True)))
    # int16 with scale/offset (cm above 100 m), stripped, LZW, predictor 2, nodata -32768
    zi = np.round((terrain(ii * c, -jj * c) - 100.0) / 0.01).astype('int16')
    zi[-2:, -3:] = -32768
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'utm-i16-scale.tif'), zi, from_origin(x0, y0, c, c), 32614, 'int16', nodata=-32768, compress='lzw', predictor=2, scale=0.01, offset=100.0)))
    # state plane Texas Central (US survey feet), 25 ft cells, elevations in feet, units named
    xs, ys, cs = 3111500.0, 10073300.0, 25.0   # overlaps the UTM fixture's area
    zf = (terrain(ii * cs * 0.3048, -jj * cs * 0.3048) / 0.3048006096).astype('float32')
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'sp-ftus.tif'), zf, from_origin(xs, ys, cs, cs), 2277, 'float32', tiled=True, compress='deflate', units='ft')))
    # geographic (WGS 84), 1/3 arc-second like cells near Austin
    gx, gy, gc = -97.75, 30.30, 1.0 / 10800.0
    zg = terrain(ii * 9.6, -jj * 10.3).astype('float32')
    res['rasters'].append(facts_tif(write_tif(os.path.join(out, 'geo-wgs84.tif'), zg, from_origin(gx, gy, gc, gc), 4326, 'float32', nodata=-9999, units='metre')))
    # an RGB image (for map layers: readGeoImage)
    rgb = np.stack([(ii * 6) % 256, (jj * 8) % 256, ((ii + jj) * 3) % 256]).astype('uint8')
    with rasterio.open(os.path.join(out, 'rgb.tif'), 'w', driver='GTiff', width=W, height=H, count=3, dtype='uint8', transform=from_origin(x0, y0, c, c), crs=CRS.from_epsg(32614), photometric='RGB') as d:
        d.write(rgb)
    res['rgb'] = {'file': 'rgb.tif', 'width': W, 'height': H, 'epsg': 32614, 'transform': list(from_origin(x0, y0, c, c))[:6],
                  'pixels': rgb.transpose(1, 2, 0).reshape(-1, 3)[:50].tolist()}
    # ESRI ASCII grid + .prj (GDAL's AAIGrid driver), with nodata
    za = z.astype('float64')
    with rasterio.open(os.path.join(out, 'utm-asc.asc'), 'w', driver='AAIGrid', width=W, height=H, count=1, dtype='float32', transform=from_origin(x0, y0, c, c), crs=CRS.from_epsg(32614), nodata=-9999) as d:
        d.write(za.astype('float32'), 1)
    f = facts_tif(os.path.join(out, 'utm-asc.asc'))
    res['rasters'].append(f)
    # --- LiDAR ---------------------------------------------------------------------------------------------------
    N = 3000
    k = np.arange(N)
    px = 620100.0 + (k * 37 % 211) * 1.37 + (k % 7) * 0.05
    py = 3349700.0 + (k * 53 % 197) * 1.41 + (k % 5) * 0.03
    pz = terrain(px - 620000.0, py - 3350000.0)
    cls = np.where(k % 5 == 0, 5, np.where(k % 7 == 0, 6, np.where(k % 11 == 0, 1, 2))).astype('uint8')
    pz = pz + np.where(cls == 5, 6.0, np.where(cls == 6, 4.0, 0.0))
    crs = CRS.from_epsg(32614)

    def las(name, version, fmt, laz=False, wkt=True, evlr=False, big_class=False):
        hdr = laspy.LasHeader(point_format=fmt, version=version)
        hdr.scales = np.array([0.001, 0.001, 0.001])
        hdr.offsets = np.array([620000.0, 3349000.0, 0.0])
        if wkt:
            hdr.add_crs(pyproj_crs(32614))
        L = laspy.LasData(hdr)
        L.x, L.y, L.z = px, py, pz
        c2 = cls.copy()
        if big_class:
            c2[k % 13 == 0] = 40
        L.classification = c2
        L.intensity = (k % 1000).astype('uint16')
        if evlr:
            from laspy.vlrs.vlrlist import VLRList
            L.evlrs = VLRList()
            L.evlrs.append(laspy.VLR(user_id='CivilCraftTest', record_id=1, description='an EVLR', record_data=b'x' * 70000))
        path = os.path.join(out, name)
        if laz:
            L.write(path, laz_backend=laspy.LazBackend.Lazrs)
        else:
            L.write(path)
        r = laspy.read(path)
        h = r.header
        vals = np.stack([np.asarray(r.x), np.asarray(r.y), np.asarray(r.z)]).T
        cl = np.asarray(r.classification).astype(int)
        res['las'].append({'file': name, 'version': str(h.version), 'format': h.point_format.id, 'count': int(h.point_count),
                           'scale': list(h.scales), 'offset': list(h.offsets), 'min': list(h.mins), 'max': list(h.maxs),
                           'epsg': (h.parse_crs().to_epsg() if h.parse_crs() else None), 'laz': laz,
                           'classes': {str(int(c)): int((cl == c).sum()) for c in np.unique(cl)},
                           'xyz': vals[:200].tolist(), 'cls': cl[:200].tolist(), 'sumz': float(np.asarray(r.z).sum())})

    las('f0-12.las', '1.2', 0)
    las('f1-12.las', '1.2', 1)
    las('f3-12-nocrs.las', '1.2', 3, wkt=False)
    las('f6-14.las', '1.4', 6, big_class=True)
    las('f7-14-evlr.las', '1.4', 7, evlr=True)
    las('f8-14.las', '1.4', 8)
    las('f3-12.laz', '1.2', 3, laz=True)
    las('f6-14.laz', '1.4', 6, laz=True, big_class=True)
    print(json.dumps(res))


def big(path, n):
    """A large LAS 1.4 format 6 file (n points over ~2 km, UTM 14N) for Cancel and responsiveness checks."""
    k = np.arange(n, dtype=np.int64)
    hdr = laspy.LasHeader(point_format=6, version='1.4')
    hdr.scales = np.array([0.001, 0.001, 0.001])
    hdr.offsets = np.array([620000.0, 3349000.0, 0.0])
    hdr.add_crs(pyproj_crs(32614))
    L = laspy.LasData(hdr)
    L.x = 619000.0 + (k * 7919 % 2000003) / 1000.0
    L.y = 3349000.0 + (k * 104729 % 1999993) / 1000.0
    L.z = terrain(np.asarray(L.x) - 620000.0, np.asarray(L.y) - 3350000.0)
    L.classification = np.where(k % 3 == 0, 5, 2).astype('uint8')
    L.write(path)
    print(json.dumps({'file': path, 'count': n}))


def pyproj_crs(code):
    import pyproj
    return pyproj.CRS.from_epsg(code)


def tif(path, cells):
    with rasterio.open(path) as d:
        a = d.read(1)
        out = {'width': d.width, 'height': d.height, 'dtype': d.dtypes[0], 'epsg': d.crs.to_epsg() if d.crs else None,
               'crs_wkt': d.crs.to_wkt() if d.crs else None, 'transform': list(d.transform)[:6], 'nodata': d.nodata,
               'units': d.units[0] if d.units else None, 'tags': d.tags(), 'band_tags': d.tags(1),
               'description': d.tags(ns='TIFF') if hasattr(d, 'tags') else None, 'block': d.block_shapes[0],
               'compression': d.compression.value if d.compression else None,
               'values': [float(a[r, c]) for r, c in cells], 'nodata_count': int((a == d.nodata).sum()) if d.nodata is not None else None}
        print(json.dumps(out))


def proj(spec):
    t = Transformer.from_crs(spec['from'], spec['to'], always_xy=True)
    print(json.dumps([list(t.transform(x, y)) for x, y in spec['pts']]))


if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'make':
        make(sys.argv[2])
    elif mode == 'tif':
        tif(sys.argv[2], json.loads(sys.argv[3]))
    elif mode == 'big':
        big(sys.argv[2], int(sys.argv[3]))
    elif mode == 'proj':
        proj(json.loads(sys.argv[2]))
