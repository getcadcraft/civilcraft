# SPDX-License-Identifier: Apache-2.0
"""gen_dae.py — writes a Collada file with pycollada (a program other than ModelCraft) for the import test.
   venv/bin/python -I gen_dae.py <out.dae>
Y up, units in inches (unit meter 0.0254), like many DCC exports:
  - "Box": a 10 × 20 × 30 in box as <triangles>, red material bound through bind_material
  - "Plate": a 40 × 40 in square as one <polylist> quad, blue material
  - node "Placed box": translate(100, 0, 0) · rotate(Y, 90°) · scale(1, 2, 1) → the box
  - library node "Post" (the plate under a <matrix> lift of 5 in), placed twice with instance_node
    from nodes "Post A" (translate 0 0 -50) and "Post B" (matrix: translate 60 0 -50)
"""
import sys
import numpy as np
import collada
from collada import source, geometry, material, scene, asset

out = sys.argv[1]
mesh = collada.Collada()
mesh.assetInfo.upaxis = asset.UP_AXIS.Y_UP
mesh.assetInfo.unitmeter = 0.0254
mesh.assetInfo.unitname = 'inch'

def mat(name, rgb):
    eff = material.Effect(name + '-effect', [], 'lambert', diffuse=rgb)
    m = material.Material(name + '-material', name, eff)
    mesh.effects.append(eff); mesh.materials.append(m)
    return m

red, blue = mat('red', (1.0, 0.0, 0.0)), mat('blue', (0.0, 0.0, 1.0))

# box 10 × 20 × 30 (x, y, z) from the origin, 12 triangles, outward winding
X, Y, Z = 10.0, 20.0, 30.0
v = np.array([[0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0], [0, 0, Z], [X, 0, Z], [X, Y, Z], [0, Y, Z]], dtype=float)
quads = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
tri = []
for a, b, c, d in quads:
    tri += [a, b, c, a, c, d]
src = source.FloatSource('box-pos', v.flatten(), ('X', 'Y', 'Z'))
g = geometry.Geometry(mesh, 'box-geom', 'Box', [src])
il = source.InputList(); il.addInput(0, 'VERTEX', '#box-pos')
g.primitives.append(g.createTriangleSet(np.array(tri), il, 'redsym'))
mesh.geometries.append(g)

pv = np.array([[0, 0, 0], [40, 0, 0], [40, 0, 40], [0, 0, 40]], dtype=float)   # in the XZ plane (the floor, Y up)
psrc = source.FloatSource('plate-pos', pv.flatten(), ('X', 'Y', 'Z'))
pg = geometry.Geometry(mesh, 'plate-geom', 'Plate', [psrc])
il2 = source.InputList(); il2.addInput(0, 'VERTEX', '#plate-pos')
pg.primitives.append(pg.createPolylist(np.array([0, 3, 2, 1]), np.array([4]), il2, 'bluesym'))
mesh.geometries.append(pg)

box_node = scene.GeometryNode(g, [scene.MaterialNode('redsym', red, inputs=[])])
plate_node = scene.GeometryNode(pg, [scene.MaterialNode('bluesym', blue, inputs=[])])
lift = np.identity(4); lift[1, 3] = 5.0
post = scene.Node('Post', children=[plate_node], transforms=[scene.MatrixTransform(lift.flatten())])
mesh.nodes.append(post)
placed = scene.Node('Placed_box', children=[box_node], transforms=[
    scene.TranslateTransform(100, 0, 0), scene.RotateTransform(0, 1, 0, 90), scene.ScaleTransform(1, 2, 1)])
mB = np.identity(4); mB[0, 3] = 60.0; mB[2, 3] = -50.0
a = scene.Node('Post_A', children=[scene.NodeNode(post)], transforms=[scene.TranslateTransform(0, 0, -50)])
b = scene.Node('Post_B', children=[scene.NodeNode(post)], transforms=[scene.MatrixTransform(mB.flatten())])
vs = scene.Scene('scene', [placed, a, b])
mesh.scenes.append(vs)
mesh.scene = vs
mesh.write(out)
