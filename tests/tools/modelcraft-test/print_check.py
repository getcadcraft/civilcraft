# SPDX-License-Identifier: Apache-2.0
"""print_check.py — second reader for the 3D-printing files of print3d.js (tools/modelcraft-test/print3d.mjs).
   venv/bin/python print_check.py <file.stl|.3mf>
   → JSON {triangles, volume, area, bounds, watertight, winding, colors (3MF base materials), zip_ok}
trimesh reads the file with its own STL / 3MF readers (3MF needs networkx and lxml); a 3MF is also opened as a zip
and its model part parsed with lxml to count the base materials and check the core namespace and unit.
"""
import json, sys, zipfile
import trimesh

path = sys.argv[1]
m = trimesh.load(path, force='mesh', process=True)
m.merge_vertices()
out = {
    'triangles': int(len(m.faces)), 'volume': float(m.volume), 'area': float(m.area), 'bounds': m.bounds.tolist(),
    'watertight': bool(m.is_watertight), 'winding': bool(m.is_winding_consistent),
}
if path.lower().endswith('.3mf'):
    from lxml import etree
    with zipfile.ZipFile(path) as z:
        out['zip_ok'] = z.testzip() is None
        names = z.namelist()
        out['parts'] = names
        root = etree.fromstring(z.read('3D/3dmodel.model'))
    ns = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'
    out['namespace_ok'] = root.tag == '{%s}model' % ns
    out['unit'] = root.get('unit')
    out['colors'] = [b.get('displaycolor') for b in root.iter('{%s}base' % ns)]
print(json.dumps(out))
