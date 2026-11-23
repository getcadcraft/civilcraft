#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Own cases for lib/partlink (0.10 BK.179 / SU.1814): frames, welding, hashing, package and update round trips, the link book, the store.
import * as L from '../index.js';
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) pass++; else { fail++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const throws = (n, fn, code) => { try { fn(); ok(n, false, 'did not throw'); } catch (e) { ok(n, e.code === code, e.code || e.message); } };

// a box 400 x 200 x 3000 mm (a column) as 12 triangles, outward, with its own corner at the origin
const box = (x0, y0, z0, x1, y1, z1) => {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const f = [[0, 3, 2], [0, 2, 1], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
  return f.flatMap((t) => t.flatMap((i) => v[i]));
};
const rot90 = (x, y, tx, ty) => [-y + tx, x + ty];   // turn 90 degrees about Z then move
const worldCol = box(0, 0, 0, 400, 200, 3000);
// placement: turned 90 degrees about Z, at (10000, 5000, 3000) mm  (column-major)
const P = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 10000, 5000, 3000, 1];
// the element's world mesh = local box through P
const toWorld = (tris, M) => { const o = []; for (let i = 0; i < tris.length; i += 3) { const x = tris[i], y = tris[i + 1], z = tris[i + 2]; o.push(M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]); } return o; };
const worldTris = toWorld(worldCol, P);

const M = L.toLocalMatrix(P);
const m = L.localMesh(worldTris, M);
const s = L.meshStats(m);
ok('welded to 8 vertices, 12 triangles', s.vertices === 8 && s.triangles === 12, s);
ok('closed solid', s.closed === true);
ok('volume 400 x 200 x 3000 = 2.4e8 mm3', near(s.volume, 2.4e8, 1), s.volume);
ok('local box back at the origin', s.box.every((v, i) => near(v, [0, 0, 0, 400, 200, 3000][i], 1e-6)), s.box);
const back = L.mapMesh(m, L.fromLocalMatrix(P));
ok('local → world again equals the world mesh volume and box', near(L.meshStats(back).volume, 2.4e8, 1) && near(L.meshStats(back).box[0], 9800, 1e-6) && near(L.meshStats(back).box[4], 5400, 1e-6), L.meshStats(back).box);

// hash: any vertex order, any triangle order, same shape; a moved corner changes it
const tris = worldCol.slice();
const tri = (i) => tris.slice(i * 9, i * 9 + 9);
const reordered = []; for (const i of [5, 1, 11, 0, 7, 3, 2, 9, 4, 10, 6, 8]) reordered.push(...tri(i));
ok('same shape, other triangle order: same hash', L.meshHash(L.localMesh(reordered)) === L.meshHash(L.localMesh(worldCol)));
const wider = L.localMesh(box(0, 0, 0, 450, 200, 3000));
ok('50 mm wider: another hash', L.meshHash(wider) !== L.meshHash(L.localMesh(worldCol)));
const cmp = L.compareMeshes(L.localMesh(worldCol), wider);
ok('compare: volume +12.5 %, not the same, still closed', !cmp.same && near(cmp.volume.pct, 12.5, 1e-6) && cmp.closed.after, cmp.volume);
ok('compare equal', L.compareMeshes(L.localMesh(worldCol), L.localMesh(reordered)).same);

// base64 mesh round trip, exact for float64
const enc = L.encodeMesh(m), dec = L.decodeMesh(enc);
ok('encode/decode f64 is exact', dec.positions.every((v, i) => v === m.positions[i]) && dec.indices.every((v, i) => v === m.indices[i]));
const dec32 = L.decodeMesh(L.encodeMesh(m, { f32: true }));
ok('f32 is within 0.001 mm at this size', dec32.positions.every((v, i) => near(v, m.positions[i], 1e-3)));
throws('a mesh with a wrong length is refused', () => L.decodeMesh({ ...enc, nv: enc.nv + 1 }), 'partlink.err.mesh');
throws('an index past the vertices is refused', () => L.decodeMesh(L.encodeMesh({ positions: Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: Uint32Array.from([0, 1, 5]) })), 'partlink.err.mesh');

// context: a wall 1 m away, a wall 40 m away, a slab touching
const els = [
  { id: 'w1', name: 'Wall 1', cls: 'IfcWall', box: [8000, 5000, 3000, 8400, 5400, 6000], tris: box(8000, 5000, 3000, 8400, 5400, 6000) },
  { id: 'far', name: 'Far wall', cls: 'IfcWall', box: [40000, 0, 0, 40400, 100, 3000], tris: box(40000, 0, 0, 40400, 100, 3000) },
  { id: 'sl', name: 'Slab', cls: 'IfcSlab', box: [9000, 4000, 2800, 12000, 7000, 3000], tris: box(9000, 4000, 2800, 12000, 7000, 3000) },
];
const wbox = [9800, 5000, 3000, 10000, 5400, 6000];
const ctx = L.contextMeshes(els, wbox, { radius: 3000, toLocal: M });
ok('context: the slab and the near wall, the far wall counted outside', ctx.meshes.length === 2 && ctx.outside === 1 && ctx.meshes[0].id === 'sl', { n: ctx.meshes.length, outside: ctx.outside, first: ctx.meshes[0]?.id });
const tight = L.contextMeshes(els, wbox, { radius: 30000, budget: 12, toLocal: M });
ok('context: a budget leaves the rest counted as omitted', tight.meshes.length === 1 && tight.omitted === 1, { n: tight.meshes.length, o: tight.omitted });

// package round trip
const link = L.newLinkId();
ok('link id shape', L.isLinkId(link), link);
const pkg = L.makePackage({ link, source: { app: 'BimCraft', file: 'house.ifc', globalId: '2xYz', ifcClass: 'IfcColumn', name: 'Column C1', placement: P }, mesh: m, context: ctx.meshes, omitted: ctx.omitted });
const json = JSON.stringify(pkg);
const got = L.readPackage(json);
ok('package: survives JSON', got.link === link && got.source.globalId === '2xYz' && got.context.length === 2 && near(L.meshStats(got.mesh).volume, 2.4e8, 1));
ok('package: hash is the mesh hash', got.hash === L.meshHash(got.mesh));
throws('package: not ours', () => L.readPackage('{"format":"x"}'), 'partlink.err.format');
throws('package: bad json', () => L.readPackage('{'), 'partlink.err.format');
throws('package: no placement', () => L.readPackage({ ...pkg, source: { ...pkg.source, placement: [1, 2] } }), 'partlink.err.source');
throws('package: bad link id', () => L.makePackage({ link: 'a/b', source: pkg.source, mesh: m }), 'partlink.err.link');
throws('package: empty mesh', () => L.makePackage({ link, source: pkg.source, mesh: { positions: new Float64Array(0), indices: new Uint32Array(0) } }), 'partlink.err.empty');
throws('package: a newer version is refused', () => L.readPackage({ ...pkg, version: 9 }), 'partlink.err.version');

// update + book
const up1 = L.makeUpdate({ link, rev: 1, mesh: wider, from: { app: 'PartCraft', part: 'Column C1' }, baseHash: got.hash });
const rup = L.readUpdate(JSON.stringify(up1));
ok('update round trip', rup.link === link && rup.rev === 1 && rup.hash === L.meshHash(wider) && near(rup.volume, 2.7e8, 1));
throws('update: rev 0 refused', () => L.makeUpdate({ link, rev: 0, mesh: wider }), 'partlink.err.rev');
const book = new L.LinkBook();
const rec = book.sent({ link, globalId: '2xYz', name: 'Column C1', ifcClass: 'IfcColumn', model: 'house.ifc', hash: got.hash });
ok('book: sent', rec.state === 'sent' && book.get(link));
ok('book: the same element again reuses its link', book.sent({ link: 'otherlink12', globalId: '2xYz', name: 'Column C1', hash: got.hash }).link === link && book.list().length === 1);
ok('book: unknown link ignored', book.receive({ ...rup, link: 'zzzzzzzz12' }) === null);
const r1 = book.receive(rup, { currentHash: got.hash });
ok('book: update marks it changed, not stale', r1.state === 'changed' && r1.pending.rev === 1 && !r1.stale && book.changed().length === 1);
ok('book: the same revision twice is ignored', book.receive(rup) === null);
const r2 = book.receive({ ...rup, rev: 2, baseHash: 'deadbeef' }, { currentHash: got.hash });
ok('book: a newer update replaces and is stale when the element moved on', r2.pending.rev === 2 && r2.stale === true);
const acc = book.accept(link, { hash: rup.hash });
ok('book: accept', acc.state === 'accepted' && acc.rev === 2 && acc.pending === null && book.changed().length === 0);
ok('book: accept twice does nothing', book.accept(link) === null);
book.receive({ ...rup, rev: 3 });
ok('book: reject uses up the revision', book.reject(link).state === 'rejected' && book.receive({ ...rup, rev: 3 }) === null);
ok('pset rows', L.psetRows(book.get(link)).find((r) => r[0] === 'Status')[1] === 'rejected');
ok('book: JSON round trip', new L.LinkBook(JSON.parse(JSON.stringify(book))).get(link).rev === 3);

// the ref a part file keeps, and the axes swap
const ref = L.refFromPackage(got);
ok('ref round trip', JSON.stringify(L.readRef(JSON.parse(JSON.stringify(ref)))) === JSON.stringify(ref) && ref.rev === 0 && ref.hash === got.hash);
ok('ref: junk is null', L.readRef({ link: 'x' }) === null && L.readRef(null) === null);
const yz = L.zUpToYUp(Float64Array.from([1, 2, 3]));
ok('Z up to Y up: (1,2,3) -> (1,3,-2), and back', yz[0] === 1 && yz[1] === 3 && yz[2] === -2 && L.yUpToZUp(yz).join() === '1,2,3');
// store + takeUpdates
const store = L.memoryStore();
await store.put('update', link, { ...up1, rev: 4 });
await store.put('update', 'unknownlink1', up1);
await store.put('update', link + 'x', { format: 'nope' });
const taken = await L.takeUpdates(store, book, { currentHash: () => got.hash });
ok('takeUpdates keeps the taken update as pending', (await store.get('pending', link))?.rev === 4);
ok('takeUpdates: the known link only; the rest dropped from the store', taken.length === 1 && taken[0].pending.rev === 4 && (await store.keys('update')).join() === 'unknownlink1,' + link + 'x', await store.keys('update'));

// 0.11 SU.1814 (su-finish-11): solids travel beside the mesh
const prism = { origin: [-200, -100, 0], x: [1, 0, 0], n: [0, 0, 1], depth: 3000, outer: [[0, 0], [0, 200], [400, 200], [400, 0]], holes: [] };
const cp = L.cleanPrism(prism);
ok('cleanPrism: y = n x x, the outer turned counter-clockwise', cp && cp.y.join() === '0,1,0' && cp.outer[0].join() === '400,0', cp);
ok('cleanPrism refuses a frame that is not square, no depth, an open ring', !L.cleanPrism({ ...prism, x: [1, 0, 0.1] }) && !L.cleanPrism({ ...prism, depth: 0 }) && !L.cleanPrism({ ...prism, outer: [[0, 0], [1, 1]] }) && !L.cleanPrism(null));
const disk = L.cleanPrism({ origin: [0, 0, 3000], x: [1, 0, 0], n: [0, 0, -1], depth: 50, circle: { c: [0, 0], r: 9 } });
ok('cleanPrism: a disk (a hole) keeps its centre and radius', disk && disk.circle.r === 9 && disk.y.join() === '0,-1,0', disk);
ok('cleanPrism: a hole ring runs clockwise', L.cleanPrism({ ...prism, holes: [[[10, 10], [20, 10], [20, 20]]] }).holes[0][1].join() === '20,10');
const yzP = L.mapPrism({ origin: [0, 0, 0], x: [1, 0, 0], n: [0, 1, 0], depth: 10, outer: prism.outer }, (v) => [v[0], -v[2], v[1]]);
ok('mapPrism: Y up to Z up turns the axis', yzP && yzP.n.join() === "0,0,1" && yzP.x.join() === "1,0,0", yzP);
const csg = { kind: 'csg', steps: [{ op: 'base', ...prism }, { op: 'cut', ...disk }] };
ok('cleanSolid: a base and a cut', L.cleanSolid(csg)?.steps.length === 2);
ok('cleanSolid refuses a list that does not start with the base, an unknown op, an empty one', !L.cleanSolid({ kind: 'csg', steps: [{ op: 'cut', ...prism }] }) && !L.cleanSolid({ kind: 'csg', steps: [{ op: 'base', ...prism }, { op: 'xor', ...disk }] }) && !L.cleanSolid({ kind: 'csg', steps: [] }) && !L.cleanSolid({ kind: 'brep', steps: [{ op: 'base', ...prism }] }));
const sm = L.localMesh(box(-200, -100, 0, 200, 100, 3000));
const pk2 = L.readPackage(JSON.stringify(L.makePackage({ link: L.newLinkId(), source: { globalId: 'g', placement: P }, mesh: sm, prism })));
ok('a package carries the element\'s prism; refFromPackage keeps it for the part file', pk2.prism && pk2.prism.depth === 3000 && L.readRef(L.refFromPackage(pk2)).prism.depth === 3000);
const pk3 = L.readPackage(JSON.stringify(L.makePackage({ link: L.newLinkId(), source: { globalId: 'g', placement: P }, mesh: sm })));
ok('a package without one says null', pk3.prism === null && !('prism' in L.refFromPackage(pk3)));
const u2 = L.readUpdate(JSON.stringify(L.makeUpdate({ link: L.newLinkId(), rev: 1, mesh: sm, solid: csg })));
ok('an update carries the solid; the mesh still travels', u2.solid?.steps[1].circle.r === 9 && u2.mesh.indices.length === 36);
const badS = JSON.parse(JSON.stringify(L.makeUpdate({ link: L.newLinkId(), rev: 1, mesh: sm, solid: csg }))); badS.solid.steps[1].depth = "x";
ok('a damaged solid is dropped, the update still reads', L.readUpdate(badS).solid === null && L.readUpdate(badS).mesh.indices.length === 36);

const pk4 = L.readPackage(JSON.stringify(L.makePackage({ link: L.newLinkId(), source: { globalId: 'g', placement: P }, mesh: sm, rev: 3 })));
ok('a second send carries the last revision taken: the receiver saves revision 4 next', pk4.rev === 3 && L.refFromPackage(pk4).rev === 3 && pk3.rev === 0);

// big: 100k triangles weld fast
const big = []; for (let i = 0; i < 100000; i++) { const x = (i % 300) * 10, y = Math.floor(i / 300) * 10; big.push(x, y, 0, x + 10, y, 0, x, y + 10, 0); }
const t0 = Date.now(); const bm = L.localMesh(big); const dt = Date.now() - t0;
ok('100k triangles weld in under 3 s (' + dt + ' ms)', dt < 3000 && bm.indices.length === 300000);
console.log(`partlink: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
