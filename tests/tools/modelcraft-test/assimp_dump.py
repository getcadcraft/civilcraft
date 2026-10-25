# SPDX-License-Identifier: Apache-2.0
"""
assimp_dump.py — the black-box oracle for ModelCraft's clean-room FBX reader (0.7 XF.6, tools/modelcraft-test/fbx.mjs):
Assimp (BSD-3) through the assimp-py wheel in /var/www/CADCRAFT/oracles/fbx-venv (`pip install assimp-py`), outside every
repo. Only its output is used, never its code.

  python -I assimp_dump.py <file.fbx>  →  JSON {faces, points: [x, y, z, …] (world, the file's own axes and unit)}
"""
import json
import sys

import assimp_py

s = assimp_py.import_file(sys.argv[1], assimp_py.Process_Triangulate)
pts = []


def walk(n, M):
    T = n.transformation
    if not isinstance(T[0], (list, tuple)):
        T = [T[i * 4:i * 4 + 4] for i in range(4)]
    W = [[sum(M[i][k] * T[k][j] for k in range(4)) for j in range(4)] for i in range(4)]
    for mi in n.mesh_indices:
        vs = s.meshes[mi].vertices
        if vs and not isinstance(vs[0], (list, tuple)):
            vs = [vs[i:i + 3] for i in range(0, len(vs), 3)]
        for v in vs:
            pts.extend([W[r][0] * v[0] + W[r][1] * v[1] + W[r][2] * v[2] + W[r][3] for r in range(3)])
    for c in n.children:
        walk(c, W)


walk(s.root_node, [[1 if i == j else 0 for j in range(4)] for i in range(4)])
print(json.dumps({"faces": sum(m.num_faces for m in s.meshes), "points": pts}))
