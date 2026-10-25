# SPDX-License-Identifier: Apache-2.0
"""
oracle.py — the OpenUSD library as a black-box test oracle for cc-usd (0.7 XF.2). Test-only: run with the venv outside
every repo (/var/www/CADCRAFT/oracles/usd-venv, usd-core); never shipped, never linked. usd-core ships no command-line
tools, so this calls the same functions `usdcat` and `usdchecker` use.

  python -I oracle.py text <in>                 the layer as text (usdcat <in>)
  python -I oracle.py export <in> <out>         re-save in the format <out>'s extension names (usdcat -o)
  python -I oracle.py flatten <in>              the composed stage, flattened, as text (usdcat --flatten)
  python -I oracle.py check <in>                every registered validator on the stage → JSON [{validator, message}]
  python -I oracle.py points <in>               JSON {prim path: {type, points (world, metres, Z up)…}} of every Mesh
  python -I oracle.py package <out.usdz> <in>…  a .usdz made by the library (UsdUtils.CreateNewUsdzPackage)
  python -I oracle.py many <cmd> <list.json>     run text | points | check on every path in the list → JSON {path: result|null}
                                                (one process for a whole corpus; a file the library can't read → null)
  python -I oracle.py resave <pairs.json>       usdcat in bulk: [[src, dst], …] → JSON {src: ok}
"""
import json
import sys

from pxr import Sdf, Usd, UsdGeom, UsdUtils, UsdValidation, Gf


def text(path, out=None):
    layer = Sdf.Layer.FindOrOpen(path)
    if layer is None:
        raise SystemExit('cannot open ' + path)
    s = layer.ExportToString()
    if out is not None:
        return s
    sys.stdout.write(s)


def export(src, dst):
    layer = Sdf.Layer.FindOrOpen(src)
    if layer is None or not layer.Export(dst):
        raise SystemExit('cannot export ' + src)


def flatten(path):
    stage = Usd.Stage.Open(path)
    sys.stdout.write(stage.ExportToString(addSourceFileComment=False))


def check(path, out=None):
    stage = Usd.Stage.Open(path)
    found = []
    reg = UsdValidation.ValidationRegistry()
    for v in reg.GetOrLoadAllValidators():
        name = v.GetMetadata().name
        try:
            errors = v.Validate(stage)
        except Exception:  # validators that take a prim, not a stage
            errors = []
            for prim in stage.Traverse():
                try:
                    errors += v.Validate(prim)
                except Exception:
                    pass
        for e in errors:
            found.append({'validator': name, 'type': str(e.GetType()), 'message': e.GetMessage()})
    if out is not None:
        return found
    json.dump(found, sys.stdout, indent=1)


def points(path, out=None):
    stage = Usd.Stage.Open(path)
    mpu = UsdGeom.GetStageMetersPerUnit(stage)
    up = UsdGeom.GetStageUpAxis(stage)
    cache = UsdGeom.XformCache()
    res = {}
    for prim in stage.Traverse(Usd.TraverseInstanceProxies()):
        if not prim.IsA(UsdGeom.Mesh):
            continue
        mesh = UsdGeom.Mesh(prim)
        m = cache.GetLocalToWorldTransform(prim)
        pts = mesh.GetPointsAttr().Get() or []
        world = []
        for p in pts:
            q = m.Transform(Gf.Vec3d(p))
            x, y, z = q[0] * mpu, q[1] * mpu, q[2] * mpu
            if up == 'Y':
                x, y, z = x, -z, y
            world.append([x, y, z])
        res[str(prim.GetPath())] = {
            'points': world,
            'counts': list(mesh.GetFaceVertexCountsAttr().Get() or []),
            'indices': list(mesh.GetFaceVertexIndicesAttr().Get() or []),
        }
    if out is not None:
        return res
    json.dump(res, sys.stdout)


def many(cmd, listfile):
    fn = {'text': text, 'points': points, 'check': check}[cmd]
    res = {}
    for p in json.load(open(listfile)):
        try:
            res[p] = fn(p, True)
        except BaseException:  # SystemExit too: the library couldn't read it
            res[p] = None
    json.dump(res, sys.stdout)


def resave(listfile):
    """usdcat in bulk: each [src, dst] pair re-saved by the library (format by dst's extension) → JSON {src: true|false}."""
    res = {}
    for src, dst in json.load(open(listfile)):
        try:
            layer = Sdf.Layer.FindOrOpen(src)
            res[src] = bool(layer is not None and layer.Export(dst))
        except BaseException:
            res[src] = False
    json.dump(res, sys.stdout)


def package(out, *inputs):
    if not UsdUtils.CreateNewUsdzPackage(Sdf.AssetPath(inputs[0]), out):
        raise SystemExit('cannot package')


if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    {'text': text, 'export': export, 'flatten': flatten, 'check': check, 'points': points, 'package': package, 'many': many, 'resave': resave}[cmd](*args)
