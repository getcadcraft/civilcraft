/* SPDX-License-Identifier: Apache-2.0 */
/**
 * massing-model.mjs: the ModelCraft model both massing tests use (0.10 BK.44), made with the kernel's own push / pull.
 *   Bar      10 x 20 m pulled 9 m                         at (0, 0)      3 floors of 3 m: 200 m2 footprint, 600 m2 gross, 1800 m3
 *   Stepped  20 x 10 m pulled 6 m, then half its top (10 x 10) pulled 3 m more   at (30, 0)
 *                                                          floors 200, 200, 100 = 500 m2 gross; 20*10*6 + 10*10*3 = 1500 m3
 *   L        20 x 20 with a 10 x 10 corner out, pulled 6 m  at (60, 0)   2 floors: 300 m2 footprint, 600 m2 gross, 1800 m3
 * Each is a top-level group. → { model, iids: { bar, stepped, l } }
 */
import path from 'node:path';

export async function buildMassingModel(APP) {
  const M = await import(path.join(APP, 'model.js'));
  const V = await import(path.join(APP, 'vec.js'));
  const { Model, addPolygon, rectPts, pushPull, faceNormal, faceArea } = M;
  const model = new Model(); model.units = 'm';
  const up = (def) => [...def.faces].filter(([, f]) => V.dot(faceNormal(def, f), [0, 0, 1]) > 1 - 1e-9).map(([id]) => id);
  const group = (name, make) => model.change(name, (m) => {
    const before = new Set(m.root.faces.keys());
    make(m.root);
    const mine = [...m.root.faces.keys()].filter((id) => !before.has(id));
    return m.makeGroup(m.root, M.connected(m.root, [{ t: 'f', id: mine[0] }]), 'group', name);
  });
  const bar = group('Bar', (d) => { const b = new Set(d.faces.keys()); addPolygon(d, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 10, 20)); pushPull(d, [...d.faces.keys()].find((id) => !b.has(id)), 9); });
  const stepped = group('Stepped', (d) => {
    const b = new Set(d.faces.keys());
    addPolygon(d, rectPts([30, 0, 0], [1, 0, 0], [0, 1, 0], 20, 10));
    pushPull(d, [...d.faces.keys()].find((id) => !b.has(id)), 6);
    // a line across the top at x = 40 splits it; the half from x = 30 to 40 goes up 3 m more
    M.addEdge(d, [40, 0, 6], [40, 10, 6]);
    const half = up(d).find((id) => !b.has(id) && Math.abs(faceArea(d, d.faces.get(id)) - 100) < 1e-6 && d.faces.get(id).loops[0].every((v) => d.verts.get(v)[0] <= 40 + 1e-9));
    pushPull(d, half, 3);
  });
  const l = group('L', (d) => { const b = new Set(d.faces.keys()); addPolygon(d, [[60, 0, 0], [80, 0, 0], [80, 10, 0], [70, 10, 0], [70, 20, 0], [60, 20, 0]]); pushPull(d, [...d.faces.keys()].find((id) => !b.has(id)), 6); });
  return { model, iids: { bar, stepped, l } };
}
