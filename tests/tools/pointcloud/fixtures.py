# SPDX-License-Identifier: Apache-2.0
"""
fixtures.py — point clouds for bin/test-pointcloud.mjs and the browser tests (0.5 SG.1). Written by laspy (+ lazrs for
LAZ) and plain Python, never by CadCraft or BimCraft, and read back by laspy so the apps' reader is checked against an
independent one.

Run with tools/civilcraft-test/venv/bin/python (laspy + lazrs + pyproj, as CivilCraft's terrain tests):
  make <dir>         the fixtures into <dir>; prints JSON: what laspy reads from each (count, bounds, first points, colours,
                     intensities, classes, the slice counts the tests check)
  big <path> <n>     a format-0 LAS of n points (the > 200 MB check)
  building <dir>     BimCraft's IFC fixture (tools/bimcraft-test/ifc-fixture.mjs: a 10 × 6 m box of walls, 3 m high) scanned:
                     building-local.xyz in the model's own coordinates (metres) and building-mga56.las in EPSG:28356 through
                     the fixture's IfcMapConversion (GEOREF: E 334567.8, N 6251234.5, H 42, X axis 30° north of east)

The scan: a 6 m × 4 m room, 3 m high, at UTM 14N (EPSG:32614) round E 620 000, N 3 349 000 — floor, ceiling, four walls with
a 0.9 m door gap in the south wall (x 1.0–1.9) — plus a column (0.4 m square at x 4–4.4, y 2–2.4). Walls are red-brown,
floor grey, ceiling white, the column blue; classes: floor 2 (ground), walls and column 6 (building), ceiling 1.
"""
import json
import os
import sys

import numpy as np
import laspy
from pyproj import CRS

E0, N0 = 620000.0, 3349000.0


def scan(step=0.05):
    pts, rgb, cls = [], [], []

    def grid(a0, a1, b0, b1):
        a = np.arange(a0, a1 + 1e-9, step)
        b = np.arange(b0, b1 + 1e-9, step)
        A, B = np.meshgrid(a, b)
        return A.ravel(), B.ravel()

    x, y = grid(0, 6, 0, 4)                      # floor and ceiling
    pts += [np.stack([x, y, np.zeros_like(x)], 1), np.stack([x, y, np.full_like(x, 3.0)], 1)]
    rgb += [np.tile([128, 128, 128], (len(x), 1)), np.tile([245, 245, 240], (len(x), 1))]
    cls += [np.full(len(x), 2), np.full(len(x), 1)]
    a, z = grid(0, 6, step, 3 - step)            # south (y = 0, door gap) and north (y = 4) walls
    keep = ~((a > 1.0) & (a < 1.9) & (z < 2.1))
    for yy, m in ((0.0, keep), (4.0, np.ones_like(a, bool))):
        pts.append(np.stack([a[m], np.full(m.sum(), yy), z[m]], 1)); rgb.append(np.tile([170, 90, 60], (m.sum(), 1))); cls.append(np.full(m.sum(), 6))
    b, z = grid(step, 4 - step, step, 3 - step)  # west and east walls
    for xx in (0.0, 6.0):
        pts.append(np.stack([np.full(len(b), xx), b, z], 1)); rgb.append(np.tile([170, 90, 60], (len(b), 1))); cls.append(np.full(len(b), 6))
    for (x0, y0, x1, y1) in ((4.0, 2.0, 4.4, 2.0), (4.0, 2.4, 4.4, 2.4)):   # the column's faces along x
        s, z = grid(x0, x1, step, 3 - step)
        pts.append(np.stack([s, np.full(len(s), y0), z], 1)); rgb.append(np.tile([40, 80, 200], (len(s), 1))); cls.append(np.full(len(s), 6))
    for xx in (4.0, 4.4):                                                   # and along y
        s, z = grid(2.0 + step, 2.4 - step, step, 3 - step)
        pts.append(np.stack([np.full(len(s), xx), s, z], 1)); rgb.append(np.tile([40, 80, 200], (len(s), 1))); cls.append(np.full(len(s), 6))
    P = np.concatenate(pts)
    return P, np.concatenate(rgb).astype(np.uint16), np.concatenate(cls).astype(np.uint8)


def make(out):
    os.makedirs(out, exist_ok=True)
    P, RGB, CLS = scan()
    n = len(P)
    k = np.arange(n)
    inten = (k * 37 % 4000).astype(np.uint16)
    res = {'count': int(n), 'files': []}

    def write(name, version, fmt, laz=False, bits16=True, crs=True):
        hdr = laspy.LasHeader(point_format=fmt, version=version)
        hdr.scales = np.array([0.001, 0.001, 0.001])
        hdr.offsets = np.array([E0, N0, 0.0])
        if crs:
            hdr.add_crs(CRS.from_epsg(32614))
        L = laspy.LasData(hdr)
        L.x, L.y, L.z = P[:, 0] + E0, P[:, 1] + N0, P[:, 2] + 100.0
        L.classification = CLS
        L.intensity = inten
        if 'red' in L.point_format.dimension_names:
            c = RGB * 257 if bits16 else RGB
            L.red, L.green, L.blue = c[:, 0], c[:, 1], c[:, 2]
        path = os.path.join(out, name)
        L.write(path, laz_backend=laspy.LazBackend.Lazrs) if laz else L.write(path)
        r = laspy.read(path)
        h = r.header
        info = {'file': name, 'format': h.point_format.id, 'version': str(h.version), 'count': int(h.point_count), 'laz': laz,
                'min': [float(v) for v in h.mins], 'max': [float(v) for v in h.maxs],
                'epsg': (h.parse_crs().to_epsg() if h.parse_crs() else None),
                'xyz': np.stack([np.asarray(r.x), np.asarray(r.y), np.asarray(r.z)], 1)[:50].tolist(),
                'intensity': np.asarray(r.intensity)[:50].astype(int).tolist(),
                'cls': np.asarray(r.classification)[:50].astype(int).tolist(),
                'classes': {str(int(c)): int((np.asarray(r.classification) == c).sum()) for c in np.unique(np.asarray(r.classification))}}
        if 'red' in r.point_format.dimension_names:
            info['rgb16'] = np.stack([np.asarray(r.red), np.asarray(r.green), np.asarray(r.blue)], 1)[:50].astype(int).tolist()
        res['files'].append(info)

    write('room-f2-12.las', '1.2', 2)
    write('room-f3-12.las', '1.2', 3, bits16=False)
    write('room-f7-14.las', '1.4', 7)
    write('room-f8-14.las', '1.4', 8)
    write('room-f0-12-nocrs.las', '1.2', 0, crs=False)
    write('room-f3-12.laz', '1.2', 3, laz=True)
    write('room-f7-14.laz', '1.4', 7, laz=True)

    # text clouds (same points, local coordinates): x y z r g b, and PTS (count, then x y z i r g b)
    with open(os.path.join(out, 'room.xyz'), 'w') as f:
        f.write('# a comment line\n')
        for p, c in zip(P, RGB):
            f.write('%.3f %.3f %.3f %d %d %d\n' % (p[0], p[1], p[2], c[0], c[1], c[2]))
    with open(os.path.join(out, 'room.pts'), 'w') as f:
        f.write('%d\n' % n)
        for p, c, i in zip(P, RGB, inten):
            f.write('%.3f,%.3f,%.3f,%d,%d,%d,%d\n' % (p[0], p[1], p[2], i, c[0], c[1], c[2]))
    res['files'].append({'file': 'room.xyz', 'count': int(n)})
    res['files'].append({'file': 'room.pts', 'count': int(n)})

    # what the tests check: points in a 0.1 m slice at 1.2 m (walls and the column only), and on the column's faces
    sl = np.abs(P[:, 2] - 1.2) <= 0.05
    res['slice_12'] = int(sl.sum())
    res['slice_12_column'] = int((sl & (P[:, 0] >= 4.0 - 1e-9) & (P[:, 0] <= 4.4 + 1e-9) & (P[:, 1] >= 2.0 - 1e-9) & (P[:, 1] <= 2.4 + 1e-9)).sum())
    res['classes'] = {str(int(c)): int((CLS == c).sum()) for c in np.unique(CLS)}
    print(json.dumps(res))


def sample(P):
    """Every 997th point, rounded: the 'hashed sample' the readers are compared on."""
    return np.round(P[::997], 4).tolist()


def formats(out):
    """
    0.6 PF.2: the same room as PLY (plyfile: binary little / big endian, ascii; an element before the vertices with a list,
    faces after), PCD (Open3D: ascii, binary, binary_compressed; and an organised ascii PCD with NaN holes and intensity
    written here) and PTX (written here with numpy: two scans, each with its own transform, unmeasured 0 0 0 points). Each
    file is read back by plyfile / Open3D (PTX: the transform done by numpy) and what they read is printed for the test.
    Run with the corpus venv (testfiles/pointcloud-corpus/venv: numpy, plyfile, open3d; outside every repo).
    """
    import plyfile
    import open3d as o3d
    os.makedirs(out, exist_ok=True)
    P, RGB, CLS = scan()
    n = len(P)
    inten = ((np.arange(n) * 37) % 4000) / 4000.0
    res = {'count': int(n), 'files': []}

    def o3d_read(path):
        pc = o3d.io.read_point_cloud(path, remove_nan_points=True, remove_infinite_points=True)
        Q = np.asarray(pc.points)
        C = np.round(np.asarray(pc.colors) * 255).astype(int) if pc.has_colors() else None
        return Q, C

    # ---- PLY
    def ply(name, text, byte_order, xyz_type, rgb_type, rgb_scale, with_faces, with_camera, offset):
        v = np.zeros(n, dtype=[('x', xyz_type), ('y', xyz_type), ('z', xyz_type), ('red', rgb_type), ('green', rgb_type), ('blue', rgb_type), ('intensity', 'f4')])
        v['x'], v['y'], v['z'] = P[:, 0] + offset[0], P[:, 1] + offset[1], P[:, 2] + offset[2]
        for k, c in enumerate(('red', 'green', 'blue')):
            v[c] = RGB[:, k] * rgb_scale
        v['intensity'] = inten
        els = []
        if with_camera:
            cam = np.zeros(2, dtype=[('id', 'i4'), ('tags', 'O')])
            cam['id'] = [7, 8]
            cam['tags'] = [np.array([1, 2, 3], 'i4'), np.array([4], 'i4')]
            els.append(plyfile.PlyElement.describe(cam, 'camera', val_types={'tags': 'i4'}, len_types={'tags': 'u1'}))
        els.append(plyfile.PlyElement.describe(v, 'vertex'))
        if with_faces:
            f = np.zeros(2, dtype=[('vertex_indices', 'O')])
            f['vertex_indices'] = [np.array([0, 1, 2], 'i4'), np.array([2, 3, 0], 'i4')]
            els.append(plyfile.PlyElement.describe(f, 'face'))
        path = os.path.join(out, name)
        plyfile.PlyData(els, text=text, byte_order=byte_order).write(path)
        r = plyfile.PlyData.read(path)['vertex']
        Q = np.stack([np.asarray(r['x'], 'f8'), np.asarray(r['y'], 'f8'), np.asarray(r['z'], 'f8')], 1)
        C = np.stack([np.asarray(r[c], 'f8') for c in ('red', 'green', 'blue')], 1)
        Q3, _ = o3d_read(path)
        res['files'].append({'file': name, 'count': int(len(Q)), 'min': Q.min(0).tolist(), 'max': Q.max(0).tolist(),
                             'xyz': Q[:50].tolist(), 'sample': sample(Q), 'rgb8': (C[:50] / rgb_scale).round().astype(int).tolist(),
                             'faces': 2 if with_faces else 0, 'o3d_count': int(len(Q3)), 'o3d_sample': sample(Q3),
                             'intensity': np.asarray(r['intensity'][:50], 'f8').tolist()})

    ply('room-le.ply', False, '<', 'f4', 'u1', 1, False, False, (0, 0, 0))
    ply('room-be-double.ply', False, '>', 'f8', 'u2', 257, True, True, (E0, N0, 100.0))
    ply('room-ascii.ply', True, '=', 'f4', 'u1', 1, True, True, (0, 0, 0))

    # ---- PCD (Open3D writes x y z rgb, rgb packed as a float)
    pc = o3d.geometry.PointCloud()
    pc.points = o3d.utility.Vector3dVector(P)
    pc.colors = o3d.utility.Vector3dVector(RGB / 255.0)
    for name, ascii_, comp in (('room-ascii.pcd', True, False), ('room-binary.pcd', False, False), ('room-compressed.pcd', False, True)):
        path = os.path.join(out, name)
        o3d.io.write_point_cloud(path, pc, write_ascii=ascii_, compressed=comp)
        Q, C = o3d_read(path)
        with open(path, 'rb') as fh:
            head = fh.read(400).split(b'DATA')[1].split(b'\n')[0].strip().decode()
        res['files'].append({'file': name, 'data': head, 'count': int(len(Q)), 'min': Q.min(0).tolist(), 'max': Q.max(0).tolist(),
                             'xyz': Q[:50].tolist(), 'sample': sample(Q), 'rgb8': C[:50].tolist()})
    # an organised cloud: 3 rows, every 5th point a hole (nan), an intensity field; Open3D drops the holes
    W = n // 3
    Q = P[:W * 3].copy()
    holes = (np.arange(len(Q)) % 5) == 4
    path = os.path.join(out, 'room-organised.pcd')
    with open(path, 'w') as f:
        f.write('# .PCD v0.7 - Point Cloud Data file format\nVERSION 0.7\nFIELDS x y z intensity\nSIZE 4 4 4 4\nTYPE F F F F\nCOUNT 1 1 1 1\n'
                'WIDTH %d\nHEIGHT 3\nVIEWPOINT 1 2 3 1 0 0 0\nPOINTS %d\nDATA ascii\n' % (W, W * 3))
        for k, p in enumerate(Q):
            f.write('nan nan nan 0\n' if holes[k] else '%.4f %.4f %.4f %.4f\n' % (p[0], p[1], p[2], inten[k]))
    Q3, _ = o3d_read(path)
    res['files'].append({'file': 'room-organised.pcd', 'count': int(len(Q3)), 'holes': int(holes.sum()), 'sample': sample(Q3),
                         'min': Q3.min(0).tolist(), 'max': Q3.max(0).tolist()})

    # ---- PTX: two scans of the room from two stations; each scan's points in its own frame, then the transform
    def rot(deg):
        a = np.radians(deg)
        return np.array([[np.cos(a), np.sin(a), 0], [-np.sin(a), np.cos(a), 0], [0, 0, 1]])   # rows = the scanner's axes
    halves = (P[: n // 2], P[n // 2:])
    rgb_halves = (RGB[: n // 2], RGB[n // 2:])
    stations = ((rot(30), np.array([E0 + 2.0, N0 + 1.5, 101.0])), (rot(-75), np.array([E0 + 4.5, N0 + 3.0, 101.2])))
    world, missing = [], 0
    path = os.path.join(out, 'room-two-scans.ptx')
    with open(path, 'w') as f:
        for (R, T), W_, C in zip(stations, halves, rgb_halves):
            # the scanner frame: world = local · R + T  →  local = (world − T) · Rᵀ (R is orthonormal)
            Wd = W_ + np.array([E0, N0, 100.0])
            L = (Wd - T) @ R.T
            cols, rows = 100, int(np.ceil(len(L) / 100))
            f.write('%d\n%d\n' % (cols, rows))
            f.write('%.4f %.4f %.4f\n' % tuple(T))
            for r_ in R:
                f.write('%.9f %.9f %.9f\n' % tuple(r_))
            for r_ in R:
                f.write('%.9f %.9f %.9f 0\n' % tuple(r_))
            f.write('%.4f %.4f %.4f 1\n' % tuple(T))
            for k in range(cols * rows):
                if k < len(L) and k % 50 != 49:
                    f.write('%.5f %.5f %.5f %.4f %d %d %d\n' % (L[k, 0], L[k, 1], L[k, 2], inten[k], C[k, 0], C[k, 1], C[k, 2]))
                    world.append(Wd[k])
                else:
                    f.write('0 0 0 0.5 0 0 0\n')
                    missing += 1
    Wt = np.array(world)
    res['files'].append({'file': 'room-two-scans.ptx', 'count': int(len(Wt)), 'missing': int(missing), 'scans': 2,
                         'min': Wt.min(0).tolist(), 'max': Wt.max(0).tolist(), 'xyz': Wt[:50].tolist(), 'sample': sample(Wt)})
    print(json.dumps(res))


def pye57_read(path):
    """What pye57 (libE57Format) reads from an E57: every scan with its pose applied, invalid points dropped, in file order."""
    import pye57
    r = pye57.E57(path)
    Q, C, I, scans = [], [], [], []
    for i in range(r.scan_count):
        h = r.get_header(i)
        fields = list(h.point_fields)
        d = r.read_scan(i, transform=True, intensity='intensity' in fields, colors='colorRed' in fields, ignore_missing_fields=True)
        keep = np.ones(len(d['cartesianX']), bool)
        if 'cartesianInvalidState' in d:
            keep &= np.asarray(d['cartesianInvalidState']) == 0
        if 'sphericalInvalidState' in d:
            keep &= np.asarray(d['sphericalInvalidState']) == 0
        Q.append(np.stack([d['cartesianX'], d['cartesianY'], d['cartesianZ']], 1)[keep])
        if 'colorRed' in d:
            C.append(np.stack([d['colorRed'], d['colorGreen'], d['colorBlue']], 1)[keep])
        if 'intensity' in d:
            I.append(np.asarray(d['intensity'])[keep])
        scans.append({'name': h.name if hasattr(h, 'name') else '', 'points': int(h.point_count)})
    Q = np.concatenate(Q) if Q else np.zeros((0, 3))
    out = {'count': int(len(Q)), 'scans': len(scans), 'images': int(r.image_count) if hasattr(r, 'image_count') else None}
    if len(Q):
        out.update({'min': Q.min(0).tolist(), 'max': Q.max(0).tolist(), 'sample': sample(Q), 'xyz': Q[:50].tolist()})
    if C and len(C) == len(scans):
        out['rgb'] = np.concatenate(C)[:50].astype(int).tolist()
    return out


def e57(out):
    """0.6 PF.1: our own E57s (pye57 writes them): two scans with poses, colours and intensity; one with intensity only."""
    import pye57
    os.makedirs(out, exist_ok=True)
    rng = np.random.default_rng(57)
    res = {'files': []}
    for name, scans, colour in (('posed-two-scans.e57', [((1, 0, 0, 0), (0, 0, 0)), ((np.cos(np.pi / 8), 0, 0, np.sin(np.pi / 8)), (10.0, 5.0, 1.5))], True),
                                ('intensity-only.e57', [((1, 0, 0, 0), (E0, N0, 100.0))], False)):
        path = os.path.join(out, name)
        w = pye57.E57(path, mode='w')
        for k, (rot, tr) in enumerate(scans):
            n = 1500
            d = {'cartesianX': rng.random(n) * 4, 'cartesianY': rng.random(n) * 3, 'cartesianZ': rng.random(n) * 2, 'intensity': rng.random(n)}
            if colour:
                for c in ('colorRed', 'colorGreen', 'colorBlue'):
                    d[c] = rng.integers(0, 256, n).astype(np.uint8)
            w.write_scan_raw(d, name='scan%d' % k, rotation=np.array(rot, float), translation=np.array(tr, float))
        w.close()
        res['files'].append({'file': name, **pye57_read(path)})
    print(json.dumps(res))


def big_e57(path, n):
    """A one-scan E57 of n points with colours (pye57, doubles): made once into testfiles/generated/pointcloud/ (rule 13)."""
    import pye57
    if os.path.exists(path):
        print(json.dumps({'file': path, 'count': int(n), 'size': os.path.getsize(path), 'kept': True}))
        return
    k = np.arange(n, dtype=np.int64)
    d = {'cartesianX': E0 + (k % 3001) * 0.01, 'cartesianY': N0 + (k // 3001) * 0.01, 'cartesianZ': 100.0 + (k % 89) * 0.01,
         'colorRed': (k % 256).astype(np.uint8), 'colorGreen': ((k // 7) % 256).astype(np.uint8), 'colorBlue': ((k // 13) % 256).astype(np.uint8)}
    w = pye57.E57(path, mode='w')
    w.write_scan_raw(d, name='big')
    w.close()
    print(json.dumps({'file': path, 'count': int(n), 'size': os.path.getsize(path), 'kept': False}))


def ptx_read(path):
    """A PTX by the format as written in the file: each scan's points · its 4 × 4 (rows; last row the translation); 0 0 0 dropped."""
    lines = [l.split() for l in open(path) if l.strip()]
    k, Q, scans = 0, [], 0
    while k + 10 <= len(lines):
        cols, rows = int(lines[k][0]), int(lines[k + 1][0])
        M = np.array([[float(v) for v in lines[k + 6 + j][:4]] for j in range(4)])
        P = np.array([[float(v) for v in l[:3]] for l in lines[k + 10:k + 10 + cols * rows]])
        P = P[~np.all(P == 0, axis=1)]
        Q.append(np.hstack([P, np.ones((len(P), 1))]) @ M)
        k += 10 + cols * rows
        scans += 1
    Q = np.concatenate(Q)[:, :3]
    return {'count': int(len(Q)), 'scans': scans, 'min': Q.min(0).tolist(), 'max': Q.max(0).tolist(), 'sample': sample(Q), 'xyz': Q[:50].tolist()}


def one(path):
    """One corpus file read by its second reader (pye57, plyfile, Open3D, numpy for PTX); or why it can't be."""
    ext = path.rsplit('.', 1)[-1].lower()
    item = {}
    try:
        if ext == 'e57':
            item.update(pye57_read(path))
        elif ext == 'ptx':
            item.update(ptx_read(path))
        else:
            if ext == 'ply':
                import plyfile
                v = plyfile.PlyData.read(path)['vertex']
                Q = np.stack([np.asarray(v[c], 'f8') for c in ('x', 'y', 'z')], 1)
            else:
                import open3d as o3d
                with open(path, 'rb') as fh:
                    head = fh.read(4096)
                if b'binary_compressed' in head:
                    raise ValueError('binary_compressed')
                Q = np.asarray(o3d.io.read_point_cloud(path, remove_nan_points=True, remove_infinite_points=True).points)
            if not len(Q):
                raise ValueError('no points')
            item.update({'count': int(len(Q)), 'min': Q.min(0).tolist(), 'max': Q.max(0).tolist(), 'sample': sample(Q), 'xyz': Q[:50].tolist()})
        if not item.get('count'):
            raise ValueError('no points')
    except Exception as e:   # the second reader refuses it: so must we (plainly)
        item = {'refused': str(e)[:200] or type(e).__name__}
    print(json.dumps(item))


def corpus(root):
    """Every public corpus file through `one`, each in its own process (a broken E57 can crash libE57Format)."""
    import subprocess
    res = {'files': []}
    for dirpath, _, names in sorted(os.walk(root)):
        if '/venv' in dirpath or '/.git' in dirpath:
            continue
        for name in sorted(names):
            ext = name.rsplit('.', 1)[-1].lower()
            if ext not in ('e57', 'ply', 'pcd', 'ptx'):
                continue
            path = os.path.join(dirpath, name)
            item = {'file': os.path.relpath(path, root), 'kind': ext}
            p = subprocess.run([sys.executable, '-I', os.path.abspath(__file__), 'one', path], capture_output=True, text=True, timeout=300)
            try:
                item.update(json.loads(p.stdout.strip().splitlines()[-1]))
            except Exception:
                item['refused'] = 'the second reader stopped (exit %d)' % p.returncode
            res['files'].append(item)
    print(json.dumps(res))


def big(path, n):
    hdr = laspy.LasHeader(point_format=0, version='1.2')
    hdr.scales = np.array([0.001, 0.001, 0.001])
    hdr.offsets = np.array([E0, N0, 0.0])
    L = laspy.LasData(hdr)
    k = np.arange(n, dtype=np.int64)
    L.x = E0 + (k % 10007) * 0.01
    L.y = N0 + (k // 10007) * 0.01
    L.z = 100.0 + (k % 97) * 0.01
    L.classification = np.full(n, 2, np.uint8)
    L.write(path)
    print(json.dumps({'file': path, 'count': int(n), 'size': os.path.getsize(path)}))


def building(out):
    os.makedirs(out, exist_ok=True)
    step = 0.1
    pts = []
    z = np.arange(0.0, 3.0 + 1e-9, step)
    for (x0, y0, x1, y1) in ((0, 0, 10, 0), (10, 0, 10, 6), (10, 6, 0, 6), (0, 6, 0, 0)):   # wall axes, as the IFC places them
        n = int(round(max(abs(x1 - x0), abs(y1 - y0)) / step))
        s_ = np.arange(n) / n
        X, Z = np.meshgrid(x0 + (x1 - x0) * s_, z)
        Y, _ = np.meshgrid(y0 + (y1 - y0) * s_, z)
        pts.append(np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1))
    P = np.concatenate(pts)
    with open(os.path.join(out, 'building-local.xyz'), 'w') as f:
        for p in P:
            f.write('%.3f %.3f %.3f\n' % tuple(p))
    E, N, H, rot = 334567.8, 6251234.5, 42.0, np.radians(30)
    mx = E + P[:, 0] * np.cos(rot) - P[:, 1] * np.sin(rot)
    my = N + P[:, 0] * np.sin(rot) + P[:, 1] * np.cos(rot)
    hdr = laspy.LasHeader(point_format=6, version='1.4')
    hdr.scales = np.array([0.001, 0.001, 0.001])
    hdr.offsets = np.array([E, N, 0.0])
    hdr.add_crs(CRS.from_epsg(28356))
    L = laspy.LasData(hdr)
    L.x, L.y, L.z = mx, my, P[:, 2] + H
    L.classification = np.full(len(P), 6, np.uint8)
    L.write(os.path.join(out, 'building-mga56.las'))
    print(json.dumps({'count': int(len(P))}))


if __name__ == '__main__':
    if sys.argv[1] == 'make':
        make(sys.argv[2])
    elif sys.argv[1] == 'building':
        building(sys.argv[2])
    elif sys.argv[1] == 'big':
        big(sys.argv[2], int(sys.argv[3]))
    elif sys.argv[1] == 'formats':
        formats(sys.argv[2])
    elif sys.argv[1] == 'e57':
        e57(sys.argv[2])
    elif sys.argv[1] == 'corpus':
        corpus(sys.argv[2])
    elif sys.argv[1] == 'one':
        one(sys.argv[2])
    elif sys.argv[1] == 'big-e57':
        big_e57(sys.argv[2], int(sys.argv[3]))
