/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mesh.mjs — known answers for ModelCraft's mesh kind (0.7 Track MD; session `mesh`), run by bin/test-modelcraft.mjs
 * § mesh (CadCraft carries the same bytes in dev/m3d/: tools/modelcraft-test/m3d-sync.mjs --check):
 *   run({ok, close, section, APP})
 * MD.1: the half-edge mesh (counts, manifoldness, areas, volumes), attributes, the delta journal (goto, cancel, gc),
 * the file form (round trip, tampered files), the kernel's mesh definitions (convert both ways, undo by deltas, file
 * version 2 only with a mesh, portable snapshots, copy/paste, make unique, explode, previews).
 */
import path from 'node:path';

/** Points and quads of an nx × ny grid of unit squares on the ground (counter-clockwise from above). */
export function gridLists(nx, ny, s = 1) {
  const pts = [], faces = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pts.push([i * s, j * s, 0]);
  const id = (i, j) => j * (nx + 1) + i;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) faces.push([id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)]);
  return { pts, faces };
}
/** A unit cube's 8 points and 6 quads wound outward (origin o, size s). */
export function cubeLists(o = [0, 0, 0], s = 1) {
  const [x, y, z] = o;
  const pts = [[x, y, z], [x + s, y, z], [x + s, y + s, z], [x, y + s, z], [x, y, z + s], [x + s, y, z + s], [x + s, y + s, z + s], [x, y + s, z + s]];
  const faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  return { pts, faces };
}

export async function run({ ok, close, section, APP }) {
  const where = path.basename(path.dirname(APP)) + '/' + path.basename(APP);
  const MM = await import(path.join(APP, 'mesh.js'));
  const M = await import(path.join(APP, 'model.js'));
  const { Mesh, MeshError, FL_SHARP } = MM;
  const allSharp = (m) => { for (let h = 0; h < m.nh; h++) m.hFl[h] |= FL_SHARP; return m; };
  const throwsCode = (fn, code) => { try { fn(); return false; } catch (e) { return e instanceof MeshError && (!code || e.code === code); } };

  section('mesh: the half-edge mesh (0.7 MD.1) — ' + where);
  {
    const { pts, faces } = cubeLists();
    const m = Mesh.fromLists(pts, faces);
    const I = m.info();
    ok(I.verts === 8 && I.faces === 6 && I.edges === 12 && I.boundary === 0 && I.loose === 0, `cube: 8 vertices, 6 faces, 12 edges, no open edge (${I.verts}/${I.faces}/${I.edges}/${I.boundary})`);
    ok(I.closed && close(I.volume, 1, 1e-12) && close(I.area, 6, 1e-12), `cube: closed, volume 1 m³, area 6 m² (${I.volume}, ${I.area})`);
    ok(I.verts - I.edges + I.faces === 2, 'cube: Euler characteristic 2');
    let twinsOk = true;
    for (let h = 0; h < m.nh; h++) { const t = m.hTw[h]; if (t < 0 || m.hTw[t] !== h || m.hV[t] !== m.head(h)) twinsOk = false; }
    ok(twinsOk, 'cube: every half-edge has a twin running the other way');
    let fanOk = true;
    for (let v = 0; v < m.nv; v++) if (m.outgoing(v).length !== 3) fanOk = false;
    ok(fanOk, 'cube: walking round each corner meets its three faces');
    const T = m.triangulate();
    ok(T.n === 12, 'cube: 12 triangles');
    // every triangle faces its face's front
    let front = true;
    for (let i = 0; i < T.n; i++) {
      const [a, b, c] = [0, 1, 2].map((k) => m.pos(m.hV[T.tri[i * 3 + k]]));
      const n = m.faceNormal(T.face[i]);
      const cr = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
      if (cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] <= 0) front = false;
    }
    ok(front, 'cube: every triangle faces the front of its face');
    // smooth vs sharp normals
    const smooth = m.cornerNormals();
    const c0 = m.vHe[0], r3 = 1 / Math.sqrt(3);
    ok(close(Math.abs(smooth[c0 * 3]), r3, 1e-6) && close(Math.abs(smooth[c0 * 3 + 2]), r3, 1e-6), 'no sharp edges: a corner\'s normal is its three faces averaged (1/√3 each way)');
    allSharp(m);
    const flat = m.cornerNormals();
    let flatOk = true;
    for (let h = 0; h < m.nh; h++) { const n = m.faceNormal(m.hF[h]); if (Math.abs(flat[h * 3] - n[0]) + Math.abs(flat[h * 3 + 1] - n[1]) + Math.abs(flat[h * 3 + 2] - n[2]) > 1e-6) flatOk = false; }
    ok(flatOk, 'every edge sharp: each corner takes its own face\'s normal');
  }
  {
    const { pts, faces } = cubeLists();
    const open = Mesh.fromLists(pts, faces.slice(1));
    const I = open.info();
    ok(I.faces === 5 && I.boundary === 4 && !I.closed && I.volume === null, `a box with no bottom: 4 open edges, not closed (${I.boundary})`);
    ok(open.isBoundaryVert(0) && open.outgoing(0).length === 2, 'a corner on the open rim has two faces, walked from the open side');
    // two triangles meeting at one vertex only: that vertex is split into two
    const bow = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [0, 1, 0], [-1, 0, 0], [0, -1, 0]], [[0, 1, 2], [0, 3, 4]]);
    ok(bow.vertexCount === 6 && bow.outgoing(0).length === 1, 'two triangles touching at a point: the point is split, one fan each');
    // three faces on one edge: the third stays open on that side
    const fin = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1]], [[0, 1, 2], [1, 0, 3], [1, 0, 4]]);
    let paired = 0;
    for (let h = 0; h < fin.nh; h++) if (fin.hTw[h] >= 0) paired++;
    ok(fin.faceCount === 3 && paired === 2, 'three faces on one edge: two pair up, the third stays open');
    // a face with a repeated vertex is left out
    const rep = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [0, 1, 0]], [[0, 1, 2], [0, 1, 0]]);
    ok(rep.faceCount === 1, 'a face through one vertex twice is left out');
    // a concave n-gon: an L of 6 corners → 4 triangles, area kept
    const L = Mesh.fromLists([[0, 0, 0], [2, 0, 0], [2, 1, 0], [1, 1, 0], [1, 2, 0], [0, 2, 0]], [[0, 1, 2, 3, 4, 5]]);
    const LT = L.triangulate();
    let area = 0;
    for (let i = 0; i < LT.n; i++) { const [a, b, c] = [0, 1, 2].map((k) => L.pos(L.hV[LT.tri[i * 3 + k]])); area += ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2; }
    ok(LT.n === 4 && close(area, 3, 1e-12) && close(L.faceArea(0), 3, 1e-12), `an L-shaped six-corner face: 4 triangles, all facing up, 3 m² (${area})`);
    // a concave quad is split through its dent
    const dart = Mesh.fromLists([[0, 0, 0], [2, 1, 0], [0, 2, 0], [0.5, 1, 0]], [[0, 1, 2, 3]]);
    const DT = dart.triangulate();
    let dA = 0;
    for (let i = 0; i < DT.n; i++) { const [a, b, c] = [0, 1, 2].map((k) => dart.pos(dart.hV[DT.tri[i * 3 + k]])); dA += ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2; }
    ok(close(dA, dart.faceArea(0), 1e-12) && dA > 0, 'a concave quad: two triangles through the dent, both up, area kept');
  }

  section('mesh: building and removing faces, attributes');
  {
    const m = new Mesh();
    const v = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0]].map((p) => m.addVertex(...p));
    const f0 = m.addFace([v[0], v[1], v[4], v[3]]);
    const f1 = m.addFace([v[1], v[2], v[5], v[4]]);
    ok(m.faceCount === 2 && m.edgeCount === 7 && m.findHe(v[1], v[4]) >= 0 && m.hTw[m.findHe(v[1], v[4])] === m.findHe(v[4], v[1]), 'two quads added one by one share their middle edge');
    ok(throwsCode(() => m.addFace([v[1], v[4], v[0]]), 'nonmanifold'), 'a face that would run the same way along a used edge is refused');
    ok(throwsCode(() => m.addFace([v[0], v[0], v[1]]), 'bad') && throwsCode(() => m.addFace([v[0], v[1]]), 'bad'), 'a face with two corners, or one vertex twice, is refused');
    const w = m.addVertex(5, 5, 0), w2 = m.addVertex(6, 5, 0);
    ok(throwsCode(() => m.addFace([v[4], w, w2]), 'nonmanifold') || false, 'a face touching a vertex at a point only (a second fan) is refused');
    // attributes
    m.addAttr('uv', 'corner', 2);
    m.addAttr('crease', 'edge', 1);
    m.addAttr('weight.arm', 'vertex', 1);
    const h = m.findHe(v[1], v[4]);
    m.setAttr('crease', h, [0.75]);
    ok(close(m.getAttr('crease', m.hTw[h])[0], 0.75, 1e-7), 'an edge value goes on both halves of the edge');
    m.setUV(m.fHe[f0], 0.25, 0.5);
    ok(close(m.uv(m.fHe[f0])[0], 0.25, 1e-7) && close(m.uv(m.fHe[f0])[1], 0.5, 1e-7), 'a corner\'s UV set and read back');
    ok(throwsCode(() => m.addAttr('Bad Name', 'vertex')) && throwsCode(() => m.addAttr('x', 'nowhere')) && throwsCode(() => m.addAttr('y', 'face', 17)) && throwsCode(() => m.addAttr('uv', 'corner', 2), 'exists'), 'bad layer names, domains, sizes and a second "uv" are refused');
    ok(JSON.stringify(m.attrNames()) === '["uv","crease","weight.arm"]' && m.attrInfo('crease').domain === 'edge', 'layers listed with their domains');
    // removing faces: the shared edge opens; a vertex left with two fans is split
    m.setAttr('weight.arm', v[4], [0.5]);
    m.removeFaces([f1]);
    ok(m.faceCount === 1 && m.hTw[m.findHe(v[1], v[4])] < 0 && m.vertDead(v[2]) && m.vertDead(v[5]) && !m.vertDead(v[4]), 'removing a face: its own corners go, the shared edge is open');
    const g = Mesh.fromLists(...Object.values(gridLists(3, 3)));
    // remove the faces touching the middle-left and middle-right of vertex 5 diagonal: leaves two fans at a vertex
    const centre = 5;   // (1,1)
    const before = g.vertexCount;
    // faces of the 3×3 grid: index j*3+i; vertex (1,1) is used by faces 0,1,3,4; remove 1 and 3 → faces 0 and 4 meet at a point
    g.addAttr('weight.leg', 'vertex', 1);
    g.setAttr('weight.leg', centre, [0.3]);
    const made = g.removeFaces([1, 3]);
    ok(made.length === 1 && g.vertexCount === before + 1 && close(g.getAttr('weight.leg', made[0])[0], 0.3, 1e-7), 'two faces left meeting at a point: the point is split, its vertex weights copied');
  }

  section('mesh: the delta journal (undo without copies)');
  {
    const { pts, faces } = gridLists(20, 20);
    const m = Mesh.fromLists(pts, faces);
    const s0 = JSON.stringify(m.toJSON());
    m.begin(); m.setPos(10, 0, 0, 3); m.addAttr('uv', 'corner', 2); m.setUV(0, 1, 2); m.end();
    const v1 = m.v, s1 = JSON.stringify(m.toJSON());
    m.begin(); m.removeFaces([0, 1, 2]); const nv = m.addVertex(9, 9, 9); m.end();
    const v2 = m.v, s2 = JSON.stringify(m.toJSON());
    ok(m.vertexCount === 441 - 3 + 1 && nv >= 441, 'an edit: three faces of the first row removed (the three corners only they used go), a vertex added');
    m.goto(0);
    ok(JSON.stringify(m.toJSON()) === s0 && !m.hasAttr('uv'), 'back to the start: equal to the mesh before any edit (the layer gone too)');
    m.goto(v2);
    ok(JSON.stringify(m.toJSON()) === s2, 'forward two states: equal to the mesh after both edits');
    m.goto(v1);
    m.begin(); m.setPos(0, -1, -1, -1); m.end();
    const v3 = m.v;
    m.goto(v2);
    ok(JSON.stringify(m.toJSON()) === s2, 'a branch: from a third state across to the second one');
    m.goto(v1);
    ok(JSON.stringify(m.toJSON()) === s1, '… and to the first edit\'s state');
    m.begin(); m.setPos(1, 5, 5, 5); m.removeFaces([10]); m.cancel();
    ok(JSON.stringify(m.toJSON()) === s1 && m.v === v1, 'cancel: the open edit is undone in place');
    m.begin(); m.end();
    ok(m.v === v1, 'an edit that changes nothing makes no state');
    const n0 = m.stateCount;
    m.gc(new Set([v3]));
    ok(m.stateCount < n0 && m.hasState(v3) && m.hasState(v1) && !m.hasState(v2), `gc keeps what it is asked to and the path to it (${n0} → ${m.stateCount} states)`);
    m.goto(v3);
    m.gc(new Set());
    ok(m.stateCount === 1 && m.hasState(v3), 'gc with nothing else wanted: only the current state is kept');
    ok(throwsCode(() => m.goto(v1), 'gone'), 'a state let go cannot be gone back to');
  }

  section('mesh: file form');
  {
    const { pts, faces } = cubeLists();
    const m = Mesh.fromLists(pts, faces);
    m.fMat[0] = m.paintIndex('#ff0000'); m.fMat[1] = m.paintIndex('mat:brick-red');
    m.setFaceFlag(2, MM.FL_HIDE);
    m.setEdgeFlag(m.fHe[0], FL_SHARP);
    m.addAttr('uv', 'corner', 2); m.addAttr('crease', 'edge', 1); m.addAttr('weight.top', 'vertex', 1); m.addAttr('group', 'face', 1, 'i32');
    for (let h = 0; h < m.nh; h++) m.setUV(h, h / 10, -h / 10);
    m.setAttr('crease', m.fHe[1], [1]); m.setAttr('weight.top', 6, [0.875]); m.setAttr('group', 3, [7]);
    const j = m.toJSON();
    const r = Mesh.fromJSON(JSON.parse(JSON.stringify(j)));
    ok(JSON.stringify(r.toJSON()) === JSON.stringify(j), 'round trip: the copy writes the same file form');
    ok(r.facePaint(0) === '#ff0000' && r.facePaint(1) === 'mat:brick-red' && (r.fFl[2] & MM.FL_HIDE) && r.edgeFlag(r.fHe[0], FL_SHARP) && r.edgeFlag(r.hTw[r.fHe[0]], FL_SHARP), 'paint, a hidden face and a sharp edge (both halves) kept');
    ok(close(r.getAttr('crease', r.hTw[r.fHe[1]])[0], 1) && close(r.getAttr('weight.top', 6)[0], 0.875) && r.getAttr('group', 3)[0] === 7 && r.attrInfo('group').type === 'i32', 'edge, vertex and integer face layers kept');
    ok(r.info().closed && close(r.info().volume, 1, 1e-12), 'the copy is still a closed 1 m³ cube');
    const bad = (mut, why) => { const x = JSON.parse(JSON.stringify(j)); mut(x); ok(throwsCode(() => Mesh.fromJSON(x), 'bad'), 'refused: ' + why); };
    bad((x) => { x.format = 2; }, 'another format number');
    bad((x) => { x.nv = 9; }, 'more vertices than positions');
    bad((x) => { x.nf = -1; }, 'a negative count');
    bad((x) => { x.nv = 1e9; }, 'a count over the limit');
    bad((x) => { x.p = x.p.slice(0, -4); }, 'positions cut short');
    bad((x) => { const f = new Int32Array(MM.unb64(x.fi, Int32Array, 24)); f[3] = 99; x.fi = MM.b64(f); }, 'a corner pointing past the vertices');
    bad((x) => { const f = new Int32Array(6).fill(2); x.fc = MM.b64(f); }, 'a face with two corners');
    bad((x) => { const p = new Float64Array(24); p[0] = NaN; x.p = MM.b64(p); }, 'a position that is not a number');
    bad((x) => { x.p = '!!!!' + x.p.slice(4); }, 'characters that are not base64');
    const y = JSON.parse(JSON.stringify(j)); y.paints = ['javascript:alert(1)', 'mat:brick-red']; y.attrs.push({ name: 'Bad', domain: 'vertex', size: 1, type: 'f32', data: '' });
    const ry = Mesh.fromJSON(y, { isPaint: M.isPaint });
    ok(ry.facePaint(0) === null && ry.facePaint(1) === 'mat:brick-red' && !ry.hasAttr('Bad'), 'a bad paint string and a bad layer are left out, the rest kept');
  }

  section('mesh: definitions in the kernel');
  {
    const md = new M.Model();
    const d = md.root;
    M.addPolygon(d, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 3));
    const fid = [...d.faces.keys()][0];
    M.pushPull(d, fid, 4);
    const sel = [...d.faces.keys()].map((id) => ({ t: 'f', id }));
    const iid = md.change('group', () => md.makeGroup(d, sel, 'component', 'Block'));
    const gdef = md.def(d.insts.get(iid).def);
    md.change('paint a face', () => { const f = [...gdef.faces.values()][0]; f.color = '#00ff00'; });
    md.place(d, gdef.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1]);
    const vol0 = M.solidInfo(gdef).volume;
    ok(md.toJSON().version === 1, 'a model with no mesh is saved as version 1 (older builds open it)');
    const r = md.change('to mesh', () => md.toMesh(d, iid));
    const mdef = md.def(r.def), mesh = mdef?.mesh;
    ok(mdef?.kind === 'mesh' && mdef instanceof M.MeshDef && !md.def(gdef.id), 'Convert to mesh: a mesh definition, the old one purged');
    ok([...d.insts.values()].every((i) => i.def === r.def), 'every placement of the component now shows the mesh');
    const I = mesh.info();
    ok(I.faces === 6 && I.closed && close(I.volume, vol0, 1e-9) && close(I.volume, 24, 1e-9), `the box as a mesh: 6 quads, closed, 24 m³ (${I.volume})`);
    let sharp = 0;
    for (let h = 0; h < mesh.nh; h++) if (mesh.hFl[h] & FL_SHARP) sharp++;
    ok(sharp === 24, 'its 12 hard edges came over as sharp edges (24 half-edges)');
    ok(mesh.paints.includes('#00ff00'), 'the painted face keeps its paint');
    // the push/pull view of the mesh, for every reader of verts/edges/faces
    ok(mdef.faces.size === 6 && mdef.edges.size === 12 && [...mdef.edges.values()].every((e) => !e.soft) && close(M.solidInfo(mdef).volume, 24, 1e-9), 'readers of faces see 6 faces, 12 hard edges, the same 24 m³');
    ok(md.toJSON().version === M.MESH_FILE_VERSION && M.MESH_FILE_VERSION === 2, 'a model holding a mesh is saved as version 2');
    const bb = md.bbox();
    ok(close(bb.min[0], 0) && close(bb.max[0], 12) && close(bb.max[2], 4), 'the model\'s bounds include both mesh placements');
    // edit by deltas, undo, redo
    const top = [...Array(mesh.nv).keys()].filter((v) => close(mesh.P[v * 3 + 2], 4));
    const stepsBefore = md.undoStack.length;
    md.meshEdit(r.def, 'raise', (m) => { for (const v of top) m.setPos(v, m.P[v * 3], m.P[v * 3 + 1], 5); });
    ok(close(md.def(r.def).mesh.info().volume, 30, 1e-9) && md.undoStack.length === stepsBefore + 1, 'a mesh edit is one undo step: the top raised to 5 m (30 m³)');
    const step = md.lastStep();
    const tokenParts = step.b.parts.filter((p) => p[1].includes('"mesh"'));
    ok(tokenParts.length === 1 && tokenParts[0][1].length < 300 && !tokenParts[0][1].includes('"p":'), `the undo step keeps the mesh as {ref, v} only (${tokenParts[0]?.[1].length} characters)`);
    md.undo();
    ok(close(md.def(r.def).mesh.info().volume, 24, 1e-9), 'undo: back to 24 m³');
    md.redo();
    ok(close(md.def(r.def).mesh.info().volume, 30, 1e-9), 'redo: 30 m³ again');
    // a throw inside the edit leaves nothing changed
    let threw = false;
    try { md.meshEdit(r.def, 'bad', (m) => { m.setPos(0, 99, 99, 99); throw new Error('stop'); }); } catch { threw = true; }
    ok(threw && close(md.def(r.def).mesh.P[2], 0) && md.lastStep() === md.undoStack[md.undoStack.length - 1] && close(md.def(r.def).mesh.info().volume, 30, 1e-9), 'an edit that throws leaves the mesh as it was');
    // portable text: what Live sends and a restore from text reads
    const before = md.lastStep().before;
    ok(!before.includes('"ref"') && before.includes('"kind":"mesh"') && before.includes('"fi":'), 'the step as text carries the mesh\'s data, not its reference');
    const other = new M.Model();
    other.load(JSON.parse(before));
    ok(close(other.def(r.def).mesh.info().volume, 24, 1e-9), 'that text opens elsewhere as the mesh before the edit (24 m³)');
    // the whole file
    const file = JSON.parse(JSON.stringify(md.toJSON()));
    const back = new M.Model();
    back.load(file);
    ok(back.def(r.def)?.mesh && close(back.def(r.def).mesh.info().volume, 30, 1e-9) && back.def(r.def).mesh.paints.includes('#00ff00'), 'saved and opened: the mesh, its volume and paint');
    const newer = { ...file, version: 3 };
    let msg = '';
    try { new M.Model().load(newer); } catch (e) { msg = e.message; }
    ok(/newer/i.test(msg), 'a file from a newer version is refused with the newer-version message');
    const broken = JSON.parse(JSON.stringify(file));
    broken.defs.find((x) => x.kind === 'mesh').mesh.fi = 'AAAA';
    msg = '';
    try { new M.Model().load(broken); } catch (e) { msg = e.message; }
    ok(/mesh is wrong/.test(msg), 'a broken mesh in a file is refused: ' + msg);
    // copy and paste a placement of the mesh
    const clip = md.copyClip([], [{ t: 'i', id: iid }]);
    ok(clip && clip.defs.some((x) => x.kind === 'mesh' && x.mesh.fi), 'copy: the clipboard holds the mesh as data');
    const pasted = md.change('paste', () => md.pasteClip([], JSON.parse(JSON.stringify(clip)), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 20, 0, 1]));
    const pi = pasted.find((s) => s.t === 'i');
    const pdef = pi && md.def(d.insts.get(pi.id).def);
    ok(pdef?.mesh && pdef.id !== r.def && pdef.mesh !== mesh && close(pdef.mesh.info().volume, 30, 1e-9), 'paste: a mesh of its own (a copy), 30 m³');
    // make unique, explode
    const uid = md.change('unique', () => md.makeUnique(d, pi.id));
    ok(md.def(uid)?.mesh && md.def(uid).mesh !== pdef.mesh, 'make unique: a cloned mesh');
    const ex = md.change('explode', () => md.explode(d, pi.id));
    ok(ex.filter((s) => s.t === 'f').length === 6, 'explode a mesh placement: its 6 faces join the model as push/pull faces');
    // back to push/pull
    const gid = md.change('from mesh', () => md.fromMesh(r.def));
    const gd = md.def(gid);
    ok(gd && !gd.mesh && gd.kind === 'component' && close(M.solidInfo(gd).volume, 30, 1e-9) && [...d.insts.values()].filter((i) => i.def === gid).length === 2, 'Convert to geometry: a component again (placed twice), closed, 30 m³');
    md.undo(); md.undo(); md.undo(); md.undo();
    ok(md.def(r.def)?.mesh && close(md.def(r.def).mesh.info().volume, 30, 1e-9), 'undo through explode, unique, paste and convert back: the mesh as it was');
    md.redo(); md.redo(); md.redo(); md.redo();
    ok(md.def(gid) && !md.def(r.def), 'redo all of it again');
    // previews of a mesh edit
    const md2 = new M.Model();
    const mm = Mesh.fromLists(...Object.values(cubeLists()));
    const def2 = md2.change('add', () => { const x = md2.newMeshDef(mm, 'Cube'); md2.place(md2.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    md2.begin();
    for (let k = 1; k <= 20; k++) md2.meshPreview(def2.id, (m) => m.setPos(6, 1 + k / 10, 1, 1));
    md2.commit('drag');
    ok(close(md2.def(def2.id).mesh.P[18], 3, 1e-12) && md2.undoStack.length === 2, 'twenty preview frames, one undo step with the last one');
    md2.undo();
    ok(close(md2.def(def2.id).mesh.P[18], 1, 1e-12), 'undo: the vertex back where it was');
    md2.redo();
    md2.begin(); md2.meshPreview(def2.id, (m) => m.setPos(6, 7, 7, 7)); md2.abort();
    ok(close(md2.def(def2.id).mesh.P[18], 3, 1e-12), 'an aborted preview leaves the mesh as committed');
    for (let k = 0; k < 16; k++) md2.meshEdit(def2.id, 'nudge', (m) => m.setPos(0, 0, 0, -k / 100));
    md2.gcMeshes();
    ok(md2.def(def2.id).mesh.stateCount <= md2.undoStack.length + md2.redoStack.length + 2, `mesh states trimmed to what undo can reach (${md2.def(def2.id).mesh.stateCount} states for ${md2.undoStack.length} steps)`);
    for (let k = 0; k < 17; k++) md2.undo();
    ok(close(md2.def(def2.id).mesh.P[18], 1, 1e-12) && close(md2.def(def2.id).mesh.P[2], 0, 1e-12), 'undo all seventeen steps after trimming still works: both vertices back');
    md2.undo();
    ok(!md2.def(def2.id) && md2.canRedo(), 'one more undo takes the mesh out; redo can bring it back');
    md2.redo();
    ok(md2.def(def2.id)?.mesh && md2.def(def2.id).mesh.info().closed, '… and does');
  }

  // ---------------------------------------------------------------------------------------------------- MD.2
  const O = await import(path.join(APP, 'mesh/ops.js'));
  const SEL = await import(path.join(APP, 'mesh/select.js'));
  const PR = await import(path.join(APP, 'mesh/primitives.js'));
  const cube = () => Mesh.fromLists(...Object.values(cubeLists()));
  const valid = (m) => { for (let h = 0; h < m.nh; h++) { if (m.heDead(h)) continue; const t2 = m.hTw[h]; if (t2 >= 0 && (m.hTw[t2] !== h || m.hV[t2] !== m.head(h))) return false; if (m.hV[m.hNx[h]] !== m.head(h) || m.hPv[m.hNx[h]] !== h) return false; } for (let v = 0; v < m.nv; v++) { if (m.vertDead(v) || m.vHe[v] < 0) continue; if (m.hV[m.vHe[v]] !== v) return false; } return true; };
  const edit = (m, fn) => { m.begin(); const r = fn(m); m.end(); return r; };
  const summary = (m) => { const I = m.info(); return `${I.verts}v ${I.faces}f ${I.edges}e, open ${I.boundary}`; };

  section('mesh operators (0.7 MD.2): counts, closed solids, volumes, areas');
  {
    let m = cube(), r;
    r = edit(m, (x) => { const q = O.extrudeRegion(x, [1]); for (const v of q.verts) x.setPos(v, x.P[v * 3], x.P[v * 3 + 1], x.P[v * 3 + 2] + 1); return q; });
    ok(valid(m) && m.info().closed && close(m.info().volume, 2, 1e-12) && m.faceCount === 10, 'extrude the top face 1 m: 10 faces, closed, 2 m³ — ' + summary(m));
    m = cube(); edit(m, (x) => { const q = O.extrudeIndividual(x, [1, 2]); for (const v of q.verts) { const d = q.dirs.get(v); x.setPos(v, x.P[v * 3] + d[0] / 2, x.P[v * 3 + 1] + d[1] / 2, x.P[v * 3 + 2] + d[2] / 2); } });
    ok(valid(m) && m.info().closed && close(m.info().volume, 2, 1e-12), 'extrude two faces on their own by 0.5 m: closed, 2 m³');
    m = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], [[0, 1, 2, 3]]);
    edit(m, (x) => { const q = O.extrudeEdges(x, [x.findHe(0, 1)]); for (const v of q.verts) x.setPos(v, x.P[v * 3], x.P[v * 3 + 1] - 1, x.P[v * 3 + 2]); });
    ok(valid(m) && m.faceCount === 2 && close(m.info().area, 2, 1e-12), 'extrude an open edge: a second face, 2 m²');
    m = cube(); r = edit(m, (x) => O.insetFaces(x, [1], { thickness: 0.2 }));
    ok(valid(m) && m.info().closed && close(m.faceArea(r.faces[0]), 0.36, 1e-12) && m.faceCount === 10, 'inset the top by 0.2 m: a 0.6 × 0.6 m face in a band of 4');
    m = cube(); r = edit(m, (x) => O.insetFaces(x, [1], { thickness: 0.2, depth: -0.3 }));
    ok(valid(m) && m.info().closed && close(m.info().volume, 1 - (0.3 / 3) * (1 + 0.36 + 0.6), 1e-9), 'inset with depth −0.3 m: the inner face sinks, a frustum of 0.196 m³ taken out');
    m = cube(); edit(m, (x) => O.insetFaces(x, [1, 2], { thickness: 0.1, individual: true }));
    ok(valid(m) && m.info().closed && m.faceCount === 14, 'inset two faces each on its own: 14 faces');
    m = cube(); r = edit(m, (x) => O.bevel(x, { edges: [x.findHe(4, 5)], width: 0.1 }));
    ok(valid(m) && m.info().closed && close(m.info().volume, 1 - 0.005, 1e-12), 'bevel one edge 0.1 m: closed, the chamfer takes 0.005 m³');
    m = cube(); edit(m, (x) => O.bevel(x, { edges: [x.findHe(4, 5)], width: 0.1, segments: 4, profile: 0.5 }));
    ok(valid(m) && m.info().closed && m.faceCount === 12 && m.info().volume > 0.995 && m.info().volume < 1, 'bevel with 4 segments: a rounded strip, between the chamfer and the cube');
    m = cube(); { const all = []; for (let h = 0; h < m.nh; h++) if (m.hTw[h] > h) all.push(h); edit(m, (x) => O.bevel(x, { edges: all, width: 0.1 })); }
    ok(valid(m) && m.info().closed && m.faceCount === 26, 'bevel every edge: 6 faces + 12 strips + 8 corner triangles = 26, closed');
    m = cube(); edit(m, (x) => O.bevel(x, { verts: [6], width: 0.25 }));
    ok(valid(m) && m.info().closed && close(m.info().volume, 1 - 0.25 ** 3 / 6, 1e-12), 'bevel a corner 0.25 m: the cut-off pyramid is 0.25³/6');
    m = cube(); r = edit(m, (x) => O.loopCut(x, x.fHe[2], { cuts: 2 }));
    ok(valid(m) && m.info().closed && m.faceCount === 14 && r.verts.length === 8 && close(m.info().volume, 1, 1e-12), 'loop cut ×2 round a cube: 14 faces, 8 new vertices, volume unchanged');
    m = cube(); r = edit(m, (x) => O.subdivide(x, { faces: [0, 1, 2, 3, 4, 5] }, 2));
    ok(valid(m) && m.info().closed && m.faceCount === 54 && close(m.info().area, 6, 1e-12), 'subdivide every face ×2: 54 faces, area 6 m²');
    m = cube(); edit(m, (x) => O.mergeVerts(x, [4, 5], 'center'));
    ok(valid(m) && m.info().closed && m.vertexCount === 7 && close(m.info().volume, 0.75, 1e-12), 'merge two top corners at their centre: 7 vertices, a wedge of 0.75 m³');
    m = cube(); edit(m, (x) => O.mergeByDistance(x, 0.5, null));
    ok(m.vertexCount === 8, 'merge by distance 0.5 m: nothing is that close, nothing merged');
    m = cube(); r = edit(m, (x) => { const q = O.subdivide(x, { faces: [1] }, 1); return O.dissolveFaces(x, q.faces); });
    ok(valid(m) && m.info().closed && m.faceCount === 6 && close(m.info().area, 6, 1e-12), 'subdivide the top then dissolve its four faces: one face again');
    m = cube(); edit(m, (x) => O.dissolveVerts(x, [0]));
    ok(valid(m) && m.faceCount === 4 && m.vertexCount === 7, 'dissolve a corner: its three faces become one');
    m = cube(); edit(m, (x) => { O.deleteElems(x, { faces: [1] }); return O.fill(x, { verts: [4, 5, 6, 7] }); });
    ok(valid(m) && m.info().closed && close(m.info().volume, 1, 1e-12), 'delete the top then fill its border: closed again, facing out (1 m³)');
    m = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 2], [1, 0, 2], [1, 1, 2], [0, 1, 2]], [[0, 3, 2, 1], [4, 5, 6, 7]]);
    { const es = []; for (let h = 0; h < m.nh; h++) es.push(h); edit(m, (x) => O.bridgeLoops(x, es)); }
    ok(valid(m) && m.info().closed && close(m.info().volume, 2, 1e-12), 'bridge a bottom and a top square: a closed 2 m³ box');
    m = cube(); r = edit(m, (x) => O.bisect(x, [0, 1, 2, 3, 4, 5], { p: [0.5, 0.5, 0.5], n: [1, 1, 1] }));
    ok(valid(m) && m.info().closed && r.edges.length === 6 && close(m.info().volume, 1, 1e-12), 'bisect a cube through its centre at an angle: a hexagon of 6 new edges, volume kept');
    m = cube(); r = edit(m, (x) => O.knife(x, [{ h: x.findHe(0, 1), s: 0.5 }, { h: x.findHe(4, 5), s: 0.5 }, { h: x.findHe(6, 7), s: 0.5 }], [0.5, -5, 0.5]));
    ok(valid(m) && m.info().closed && r.edges.length === 2 && m.faceCount === 8, 'knife from the front across the top: 2 cuts, 8 faces');
    m = cube(); edit(m, (x) => { const q = O.subdivide(x, { faces: [1] }, 2); O.deleteElems(x, { faces: q.faces }); const top = []; for (let v = 0; v < x.nv; v++) if (!x.vertDead(v) && Math.abs(x.P[v * 3 + 2] - 1) < 1e-9) top.push(v); return O.gridFill(x, { verts: top }); });
    ok(valid(m) && m.info().closed && close(m.info().volume, 1, 1e-12), 'grid fill a 12-edge hole: 3 × 3 quads, closed');
    m = Mesh.fromLists([[1, 0, 0], [2, 0, 0], [2, 0, 1], [1, 0, 1]], [[0, 1, 2, 3]]);
    edit(m, (x) => O.spin(x, { faces: [0], center: [0, 0, 0], axis: [0, 0, 1], angle: Math.PI * 2, steps: 32 }));
    const torus = 2 * Math.PI * 1.5 * 1 * Math.cos(Math.PI / 32) * 32 / (2 * Math.PI) * 2 * Math.sin(Math.PI / 32) / (2 * Math.PI / 32 / Math.PI) ;
    ok(valid(m) && m.info().closed && m.info().volume > 9.3 && m.info().volume < 9.43, `spin a square a full turn in 32 steps: a closed ring (${m.info().volume.toFixed(3)} m³; 9.42 for a true one)`);
    void torus;
    m = cube(); edit(m, (x) => O.flipFaces(x, [0, 1, 2, 3, 4, 5]));
    ok(valid(m) && close(m.info().volume, -1, 1e-12), 'flip every face: the cube turned inside out (−1 m³)');
    m = cube(); m.addAttr('uv', 'corner', 2); for (let h = 0; h < m.nh; h++) m.setUV(h, 0.25, 0.75);
    edit(m, (x) => O.extrudeRegion(x, [1]));
    let uvOk = true;
    for (let h = 0; h < m.nh; h++) if (!m.heDead(h) && (Math.abs(m.uv(h)[0] - 0.25) > 1e-6 || Math.abs(m.uv(h)[1] - 0.75) > 1e-6)) uvOk = false;
    ok(uvOk, 'UVs follow: every corner of an extruded cube keeps the UV its source corner had');
    m = cube(); m.addAttr('weight.top', 'vertex', 1); m.setAttr('weight.top', 4, [0.5]);
    r = edit(m, (x) => O.extrudeRegion(x, [1]));
    ok(r.verts.some((v) => close(m.getAttr('weight.top', v)[0], 0.5, 1e-7)), 'vertex weights follow to the extruded copy');
    // proportional weights and slides
    const g = Mesh.fromLists(...Object.values(gridLists(10, 10)));
    const W = O.falloffWeights(g, [60], 3, { mode: 'linear' });
    ok(W[60] === 1 && close(W[61], 2 / 3, 1e-6) && close(W[62], 1 / 3, 1e-6) && W[63] === 0, 'proportional editing, linear falloff over 3 m: 1, 2/3, 1/3, 0');
    const Wc = O.falloffWeights(g, [60], 3, { mode: 'linear', connected: true });
    ok(close(Wc[72], 1 / 3, 1e-6) && W[72] > Wc[72], 'connected falloff measures along edges (the diagonal neighbour is 2 m away, not 1.41)');
    edit(g, (x) => O.applySlide(x, O.slideRails(x, [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65]), 0.5));
    ok(close(g.P[60 * 3 + 1], 4.5, 1e-12) || close(g.P[60 * 3 + 1], 5.5, 1e-12), 'slide an edge loop halfway along its rails');
  }

  section('mesh selection (0.7 MD.2)');
  {
    const g = Mesh.fromLists(...Object.values(gridLists(4, 4)));
    const S = new SEL.MeshSelection(g, 'vert');
    S.pickVert(12, 'set');
    ok(S.counts().verts === 1 && S.counts().edges === 0, 'one vertex: no edge or face');
    S.grow();
    ok(S.counts().verts === 9 && S.counts().faces === 4, 'grow: the 9 vertices of the 4 faces round it');
    S.shrink();
    ok(S.counts().verts === 1, 'shrink: back to the one');
    S.setMode('face'); S.clear(); S.pickFace(5, 'set'); S.grow();
    ok(S.counts().faces === 9, 'faces: grow one face to the 9 round it');
    S.setMode('edge'); S.clear();
    const h = g.findHe(5, 6);
    S.loop(h);
    ok(S.edges().length === 4, 'edge loop across a 4 × 4 grid: 4 edges (from border to border)');
    S.ring(h);
    ok(S.edges().length === 5, 'edge ring: 5 parallel edges');
    const c = Mesh.fromLists(...Object.values(cubeLists()));
    const Sc = new SEL.MeshSelection(c, 'edge');
    Sc.loop(c.findHe(4, 5));
    ok(Sc.edges().length === 1, 'a cube corner has three edges: a loop stops at once');
    Sc.sharp(30);
    ok(Sc.edges().length === 12, 'sharp edges over 30°: all 12 of a cube');
    Sc.setMode('face'); Sc.clear(); Sc.pickFace(0, 'set'); Sc.byAngle(10);
    ok(Sc.faces().length === 1, 'select by angle 10° from one cube face: only it');
    Sc.byAngle(95);
    ok(Sc.faces().length === 6, '… 95°: the whole cube');
    Sc.all(); Sc.invert();
    ok(Sc.empty(), 'all, then invert: nothing');
    const open = Mesh.fromLists(...Object.values(gridLists(3, 3)));
    const So = new SEL.MeshSelection(open, 'edge');
    So.loop(open.findHe(0, 1));
    ok(So.edges().length === 12, 'Alt+click a border edge: the whole open border (12 edges)');
  }

  section('meshes to start from (0.7 MD.2)');
  {
    for (const n of PR.PRIMITIVES) {
      const m = PR.makePrimitive(n, {});
      const I = m.info(), solid = !['plane', 'grid', 'circle'].includes(n);
      ok(valid(m) && m.hasAttr('uv') && (solid ? I.closed && I.volume > 0 : I.boundary > 0), `${n}: ${summary(m)}${solid ? ', closed, ' + I.volume.toFixed(3) + ' m³' : ''}, with UVs`);
    }
    ok(close(PR.makePrimitive('cube', { size: 2 }).info().volume, 8, 1e-12), 'a 2 m cube is 8 m³ and stands on the ground');
    ok(close(PR.makePrimitive('uvsphere', { r: 1, segs: 64, rings: 32 }).info().volume, 4 / 3 * Math.PI, 0.03), 'a 64 × 32 UV sphere of 1 m is within 1 % of 4/3 π');
  }

  section('editing a mesh with the tool, through a camera (0.7 MD.2)');
  {
    const { Camera } = await import(path.join(APP, 'camera.js'));
    const { sceneOf } = await import(path.join(APP, 'infer.js'));
    const { Tools } = await import(path.join(APP, 'tools.js'));
    await import(path.join(APP, 'mesh/edit-tool.js'));
    for (const keys of ['sketchup', 'blender']) {
      const model = new M.Model();
      model.units = 'm';
      const mesh = PR.makePrimitive('cube', { size: 2 });
      const d = model.change('add', (mm) => { const x = mm.newMeshDef(mesh, 'Box'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
      const iid = [...model.root.insts.keys()][0];
      const cam = new Camera();
      cam.setSize(1000, 800);
      cam.eye = [6, -8, 7]; cam.target = [0, 0, 1]; cam.clip(30);
      let state = null, settled = 0;
      const host = { model, cam, path: [iid], sel: [], units: 'm', msgs: [], keys,
        scene() { return sceneOf(model); }, setSel(x) { host.sel = x; }, overlay() {}, tip() {}, vcb() {}, print(x) { host.msgs.push(x); }, changed() {},
        meshEdit(s) { state = s; }, settle() { settled++; } };
      const T = new Tools(host);
      T.set('meshedit', { path: [iid] });
      const tool = T.tool, at = (p) => cam.project(p);
      ok(tool.name === 'meshedit' && state && state.mesh === mesh, keys + ': the tool opens on the mesh and tells the view what to draw');
      // click the top face in face mode
      tool.setMode('face');
      let s = at([0, 0, 2]); T.click(s[0], s[1], { time: 1000 });
      const top = tool.sel.faces();
      ok(top.length === 1 && close(mesh.faceCenter(top[0])[2], 2, 1e-9), keys + ': a click on the top selects the top face');
      // extrude it, typed 1 m
      tool.command('extrude', { x: s[0], y: s[1] });
      T.value('1m');
      ok(close(mesh.info().volume, 12, 1e-9) && mesh.faceCount === 10 && model.undoStack.length === 2, keys + ': extrude, typed 1m: a 2 × 2 × 3 m box (12 m³), one undo step — ' + summary(mesh));
      ok(tool.sel.faces().length === 1 && close(mesh.faceCenter(tool.sel.faces()[0])[2], 3, 1e-9), keys + ': the extruded face is selected, at 3 m');
      // grab it 0.5 m up along blue (locked by the arrow key)
      tool.command('grab', { x: s[0], y: s[1] });
      T.key('ArrowUp');
      T.value('0.5m');
      ok(close(mesh.info().volume, 14, 1e-9), keys + ': move along blue, typed 0.5m: 14 m³');
      // inset typed, then adjust it (Adjust last)
      tool.command('inset', { x: s[0], y: s[1] });
      T.value('0.25m');
      const area = () => Math.max(...tool.sel.faces().map((f) => mesh.faceArea(f)));
      ok(close(area(), 1.5 * 1.5, 1e-9), keys + ': inset 0.25 m: the inner face is 1.5 × 1.5 m');
      ok(tool.adjustLast({ thickness: 0.5 }) && close(area(), 1, 1e-9) && model.undoStack.length === 4, keys + ': Adjust last to 0.5 m: 1 × 1 m, still one step');
      // bevel the top's edges (vertex mode select by box), typed width
      tool.setMode('edge');
      tool.sel.clear(); tool.sel.pickFace(tool.sel.mesh.hF[0] ?? 0, 'set');
      model.undo(); model.undo();   // the inset, the move: back to the extruded box
      ok(close(mesh.info().volume, 12, 1e-9) && mesh.faceCount === 10, keys + ': two undos: the extruded box again (delta undo)');
      // loop cut round the sides: click on a side edge
      tool.command('loopcut');
      const se = at([1, -1, 1]);
      T.move({ x: se[0], y: se[1] });
      T.click(se[0], se[1], { time: 5000 });
      ok(mesh.faceCount === 14 && close(mesh.info().volume, 12, 1e-9), keys + ': loop cut on a side: 4 more faces, the volume kept — ' + summary(mesh));
      // select all, scale ×0.5 typed
      tool.command('select-all');
      tool.command('scale', { x: 500, y: 400 });
      T.value('0.5');
      ok(close(mesh.info().volume, 12 / 8, 1e-9), keys + ': all, scale typed 0.5: an eighth of the volume');
      // Esc in the middle of a move puts everything back
      tool.command('grab', { x: 500, y: 400 });
      T.move({ x: 700, y: 300 });
      T.escape();
      ok(close(mesh.info().volume, 12 / 8, 1e-9) && !tool.op, keys + ': Esc during a move: nothing moved');
      // delete the faces of face mode selection, then undo
      tool.setMode('face'); tool.sel.clear(); tool.sel.pickFace(tool.sel.faces()[0] ?? [...Array(mesh.nf).keys()].find((f) => !mesh.faceDead(f)), 'set');
      const nf = mesh.faceCount;
      tool.command('delete');
      ok(mesh.faceCount === nf - 1, keys + ': delete a face');
      model.undo();
      ok(mesh.faceCount === nf && settled > 0, keys + ': undo brings it back');
      // the tool ends: the view is told to stop drawing the mesh
      T.set('select');
      ok(state === null, keys + ': leaving the tool clears the edit drawing');
    }
  }

  // ---------------------------------------------------------------------------------------------------- MD.3
  section('the modifier stack (0.7 MD.3): each modifier against known shapes');
  {
    const MD = await import(path.join(APP, 'mesh/modifiers.js'));
    const ME = await import(path.join(APP, 'mesh/mod-eval.js'));
    const { pathToFileURL } = await import('node:url');
    const ROOT = path.resolve(APP, '../../../../..');
    const S2 = await import(path.join(APP, 'solids.js'));
    const manifold = await S2.manifold(() => import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href));
    const run = (mesh, type, params = {}, ref = null, opts = {}) => { const m = MD.newMod(type); Object.assign(m.params, params); return MD.evaluate(mesh, [m], { refs: new Map(ref ? [[0, ref]] : []), manifold, ...opts }); };
    const cubeM = () => PR.makePrimitive('cube', { size: 2 });
    const tris = (m) => { const T = m.triangulate(); const a = new Uint32Array(T.n * 3); for (let i = 0; i < T.n * 3; i++) a[i] = m.hV[T.tri[i]]; return { pos: m.P.slice(0, m.nv * 3), tri: a }; };
    const shifted = (m, d) => { for (let v = 0; v < m.nv; v++) for (let k = 0; k < 3; k++) m.P[v * 3 + k] += d[k]; return m; };
    let r = run(shifted(PR.makePrimitive('cube', { size: 1 }), [0.5, 0, 0]), 'mirror', { x: true });
    ok(valid(r.mesh) && r.mesh.info().closed && close(r.mesh.info().volume, 2, 1e-12), 'mirror across X: the copy beside it, 2 m³, closed, facing out');
    r = run(shifted(PR.makePrimitive('plane', { size: 1 }), [0.5, 0, 0]), 'mirror', { x: true, merge: true });
    ok(r.mesh.vertexCount === 6 && r.mesh.info().boundary === 6, 'mirror with merge: the two halves share the edge on the mirror plane (6 vertices)');
    r = run(cubeM(), 'array', { count: 3, rel: [1.5, 0, 0] });
    ok(r.mesh.faceCount === 18 && close(r.mesh.info().volume, 24, 1e-12), 'array of 3, 1.5 × its size apart: 3 cubes, 24 m³');
    r = run(shifted(PR.makePrimitive('cube', { size: 0.5 }), [2, 0, 0]), 'array', { count: 6, mode: 'radial' });
    { const b = r.mesh.bounds(); ok(r.mesh.faceCount === 36 && close(b.max[0], 2.25, 1e-9) && close(b.min[0], -2.25, 1e-9), 'radial array of 6 round blue: 6 cubes in a ring'); }
    r = run(PR.makePrimitive('cube', { size: 0.5 }), 'array', { count: 5, mode: 'curve', rel: [3, 0, 0] }, { pts: [[0, 0, 0], [5, 0, 0], [5, 5, 0]] });
    ok(r.mesh.faceCount === 30 && r.mesh.bounds().max[1] > 1, 'array along a curve, 1.5 m apart: 5 copies, the last round the corner');
    r = run(cubeM(), 'subsurf', { levels: 2 });
    ok(r.mesh.faceCount === 96 && r.mesh.info().closed && close(r.mesh.info().volume, 2.8009, 1e-3), 'subdivision 2 levels: 96 quads, closed');
    r = run(cubeM(), 'subsurf', { levels: 1, renderLevels: 3 }, null, { render: true });
    ok(r.mesh.faceCount === 384, 'renders use the render levels (3: 384 quads)');
    r = run(cubeM(), 'bevel', { width: 0.1, segments: 2 });
    ok(r.mesh.info().closed && r.mesh.info().volume < 8 && r.mesh.info().volume > 7.9, 'bevel modifier on edges sharper than 30°: rounded edges, closed');
    r = run(PR.makePrimitive('plane', { size: 2 }), 'solidify', { thickness: 0.1 });
    ok(r.mesh.info().closed && close(r.mesh.info().volume, 0.4, 1e-9), 'solidify a 2 m plane 0.1 m: a closed slab of 0.4 m³');
    const tgt = shifted(PR.makePrimitive('cube', { size: 1 }), [1, 0, 1.5]);
    r = run(cubeM(), 'boolean', { op: 'difference', target: 'd9' }, { tris: tris(tgt) });
    ok(r.mesh.info().closed && close(r.mesh.info().volume, 7.75, 1e-6), 'boolean difference (manifold-3d): 8 − 0.25 m³');
    r = run(cubeM(), 'boolean', { op: 'union', target: 'd9' }, { tris: tris(tgt) });
    ok(close(r.mesh.info().volume, 8.75, 1e-6), 'boolean union: 8 + 1 − 0.25 m³');
    r = MD.evaluate(cubeM(), [Object.assign(MD.newMod('boolean'), { params: { op: 'difference', target: 'd9' } })], { refs: new Map([[0, { tris: tris(tgt) }]]), manifold: null });
    ok(r.notes.includes('boolean_later') && close(r.mesh.info().volume, 8, 1e-12), 'without manifold loaded yet, a boolean shows the mesh as it is and says so');
    r = run(PR.makePrimitive('grid', { size: 2, x: 20 }), 'displace', { strength: 0.2, scale: 0.5, dir: 'z' });
    { let lo = 1e9, hi = -1e9; for (let v = 0; v < r.mesh.nv; v++) { lo = Math.min(lo, r.mesh.P[v * 3 + 2]); hi = Math.max(hi, r.mesh.P[v * 3 + 2]); } ok(hi - lo > 0.05 && hi <= 0.2 + 1e-9 && lo >= -0.2 - 1e-9, `displace 0.2 m by noise: bumps within ±0.2 m (${lo.toFixed(3)}…${hi.toFixed(3)})`); }
    const a1 = run(PR.makePrimitive('grid', { size: 2, x: 20 }), 'displace', { strength: 0.2, scale: 0.5, dir: 'z', seed: 3 }).mesh, a2 = run(PR.makePrimitive('grid', { size: 2, x: 20 }), 'displace', { strength: 0.2, scale: 0.5, dir: 'z', seed: 3 }).mesh;
    ok(a1.P.slice(0, a1.nv * 3).every((x, i) => x === a2.P[i]), 'displace is the same every time for the same seed');
    r = run(PR.makePrimitive('uvsphere', { r: 1 }), 'decimate', { ratio: 0.25 });
    ok(r.mesh.info().closed && r.mesh.info().tris <= 260 && r.mesh.info().volume > 3.7, `decimate a sphere to a quarter: closed, ${r.mesh.info().tris} triangles, ${r.mesh.info().volume.toFixed(3)} m³ of 4.12`);
    r = run(cubeM(), 'weld', { dist: 0.001 });
    ok(r.mesh.vertexCount === 8, 'weld: nothing that close in a cube');
    const cage = { res: [2, 2, 2], min: [-1, -1, 0], max: [1, 1, 2], disp: new Map([['0,0,1', [0, 0, 1]], ['1,0,1', [0, 0, 1]], ['0,1,1', [0, 0, 1]], ['1,1,1', [0, 0, 1]]]) };
    r = run(cubeM(), 'lattice', { cage: 'd8' }, { cage });
    ok(close(r.mesh.info().volume, 12, 1e-9), 'lattice: the cage\'s top raised 1 m stretches the cube to 12 m³');
    const c3 = { res: [3, 3, 3], min: [-1, -1, 0], max: [1, 1, 2], disp: new Map([['1,1,2', [0, 0, 1]]]) };
    { const p = MD.latticeDisplace([0, 0, 2], c3), q = MD.latticeDisplace([1, 1, 2], c3), w = MD.latticeDisplace([0, 0, 0], c3); ok(close(p[2], 1, 1e-12) && close(q[2], 0, 1e-12) && close(w[2], 0, 1e-12), 'lattice interpolation: a moved cage point moves the mesh there fully, its neighbours not at all'); }
    const ring = Array.from({ length: 33 }, (_, i) => [3 * Math.cos((i * Math.PI) / 32), 3 * Math.sin((i * Math.PI) / 32), 0]);
    r = run(shifted(PR.makePrimitive('grid', { size: 4, x: 20, y: 1 }), [2, 0, 0]), 'curve', { curve: 'd7/arc:1' }, { pts: ring });
    { let ok2 = true; for (let v = 0; v < r.mesh.nv; v++) { const x = r.mesh.P[v * 3], y = r.mesh.P[v * 3 + 1]; if (Math.abs(Math.hypot(x, y) - 3) > 2.01) ok2 = false; } ok(ok2 && r.mesh.bounds().max[1] > 2, 'curve deform: a strip bent round a half circle'); }
    const sph = PR.makePrimitive('uvsphere', { r: 1 });
    r = MD.evaluate(cubeM(), [Object.assign(MD.newMod('subsurf'), { params: { levels: 2, renderLevels: 2 } }), Object.assign(MD.newMod('shrinkwrap'), { params: { target: 'd6', offset: 0 } })], { refs: new Map([[1, { tris: tris(sph) }]]) });
    { let mx = 0; for (let v = 0; v < r.mesh.nv; v++) mx = Math.max(mx, Math.abs(Math.hypot(r.mesh.P[v * 3], r.mesh.P[v * 3 + 1], r.mesh.P[v * 3 + 2] - 1) - 1)); ok(mx < 0.01, `a two-step stack (subdivide, then shrinkwrap onto a sphere): every point within 1 cm of it (${mx.toFixed(4)})`); }
    r = run(MD.evaluate(cubeM(), [Object.assign(MD.newMod('subsurf'), { params: { levels: 2, renderLevels: 2 } })]).mesh, 'smooth', { factor: 0.5, repeat: 3 });
    ok(r.mesh.info().closed && r.mesh.info().volume < 2.8, 'smooth shrinks a subdivided cube a little');
    const m0 = cubeM();
    r = MD.evaluate(m0, [Object.assign(MD.newMod('subsurf'), { on: false })]);
    ok(r.mesh === m0, 'a stack with nothing on shows the mesh itself');
    const bad = MD.cleanMods([{ type: 'array', params: { count: 1e9, rel: ['x'] } }, { type: 'evil' }, null, { type: 'boolean', params: { target: '../etc' } }]);
    ok(bad.length === 2 && bad[0].params.count === 1000 && bad[0].params.rel.join() === '1,0,0' && bad[1].params.target === '', 'a stack from a file: counts clamped, bad vectors and references and unknown types dropped');
    // the cage helper and its file form
    const L = ME.makeLattice(cubeM(), [3, 3, 3]);
    ok(L.mesh.info().closed && Object.keys(L.lattice.ids).length === 26 && ME.cleanLattice(JSON.parse(JSON.stringify(L.lattice)), L.mesh)?.res.join() === '3,3,3', 'a 3 × 3 × 3 lattice cage: 26 points on its surface, closed, its description survives a file');
    ok(ME.cleanLattice({ res: [9, 2, 2], min: [0, 0, 0], max: [1, 1, 1], ids: {} }, L.mesh) === null, 'a cage of 9 points a side is refused (2 to 8)');
  }

  section('modifiers in the model (0.7 MD.3): undo, files, what exports see, Apply, references');
  {
    const MD = await import(path.join(APP, 'mesh/modifiers.js'));
    const ME = await import(path.join(APP, 'mesh/mod-eval.js'));
    const model = new M.Model();
    const ev = new ME.ModEval(model);
    M.setMeshHooks({ clean: MD.cleanMods, cleanLattice: ME.cleanLattice, shown: (d) => ev.shown(d), rendered: (d) => ev.rendered(d) });
    const d = model.change('add', (mm) => { const x = mm.newMeshDef(PR.makePrimitive('cube', { size: 2 }), 'Box'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    model.change('subsurf', (mm) => { mm.def(d.id).mods = [Object.assign(MD.newMod('subsurf'), { params: { levels: 2, renderLevels: 3 } })]; }, [d.id]);
    ok(model.def(d.id).shown.faceCount === 96 && model.def(d.id).mesh.faceCount === 6, 'the definition shows 96 faces; its mesh still has 6');
    ok(model.def(d.id).rendered.faceCount === 384 && model.def(d.id).rendered === model.def(d.id).rendered, 'renders get the render levels (3: 384 faces), worked out once');
    ok(model.def(d.id).faces.size >= 96 && close(M.solidInfo(model.def(d.id)).volume, model.def(d.id).shown.info().volume, 1e-9), 'readers of faces (exports, printing) see the subdivided shape (its warped quads as triangles), the same volume');
    model.undo();
    ok(model.def(d.id).mods.length === 0 && model.def(d.id).shown.faceCount === 6, 'undo takes the modifier off');
    model.redo();
    ok(model.def(d.id).mods.length === 1, 'redo puts it back');
    const file = JSON.parse(JSON.stringify(model.toJSON()));
    const back = new M.Model(); back.load(file);
    ok(back.def(d.id).mods.length === 1 && back.def(d.id).mods[0].params.levels === 2, 'saved and opened: the stack is in the file');
    // Apply: the mesh takes the shape, the modifier goes, one undo step
    const r = ev.now(model.def(d.id), { upTo: 0 });
    model.meshEdit(d.id, 'apply', (me, dd) => { const all = []; for (let f = 0; f < me.nf; f++) if (!me.faceDead(f)) all.push(f); me.removeFaces(all); me.appendMesh(r.mesh); dd.mods = dd.mods.slice(1); });
    ok(model.def(d.id).mesh.faceCount === 96 && model.def(d.id).mods.length === 0 && valid(model.def(d.id).mesh) && model.def(d.id).mesh.info().closed, 'Apply: the mesh itself now has the 96 faces, closed, and the stack is empty');
    model.undo();
    ok(model.def(d.id).mesh.faceCount === 6 && model.def(d.id).mods.length === 1, 'undo Apply: 6 faces and the modifier again');
    // a boolean against another object in the model, resolved through placements
    const tool = model.change('tool', (mm) => { const x = mm.newMeshDef(shiftedCube(), 'Tool'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1.5, 1]); return x; });
    function shiftedCube() { return PR.makePrimitive('cube', { size: 1 }); }
    const refs = MD.refsOf([Object.assign(MD.newMod('boolean'), { params: { op: 'difference', target: tool.id } })]);
    const res = ME.resolveRef(model, model.def(d.id), refs[0]);
    ok(res && res.tris.tri.length === 36 && Math.min(...Array.from(res.tris.pos).filter((_, i) => i % 3 === 2)) === 1.5, 'a reference resolves to the other object\'s triangles in the mesh\'s own space (its placement 1.5 m up)');
    // a curve drawn in the model, as a reference
    model.change('arc', (mm) => { const ap = M.arcPts([0, 0, 0], [0, 0, 1], [1, 0, 0], 3, Math.PI, 8); for (let i = 0; i + 1 < ap.length; i++) M.addEdge(mm.root, ap[i], ap[i + 1]); M.tagCurve(mm.root, ap, 'arc'); });
    const cid = [...model.root.edges.values()].find((e) => e.curve)?.curve;
    const cr = ME.resolveRef(model, model.def(d.id), { kind: 'curve', ref: 'root/' + cid });
    ok(cr && cr.pts.length === 9 && close(Math.hypot(cr.pts[4][0], cr.pts[4][1]), 3, 1e-9), 'a curve in the model resolves to its points (an 8-segment arc of 3 m)');
  }

  section('modifiers in compute\'s pool (0.7 MD.3)');
  {
    const { pathToFileURL } = await import('node:url');
    const ROOT = path.resolve(APP, '../../../../..');
    const { createPool } = await import(path.join(APP, 'compute/pool.js'));
    const { nodeMakeWorker } = await import(path.join(ROOT, 'tools/compute-test/node-pool.mjs'));
    const MD = await import(path.join(APP, 'mesh/modifiers.js'));
    const ME = await import(path.join(APP, 'mesh/mod-eval.js'));
    const pool = createPool({ workerUrl: pathToFileURL(path.join(APP, 'compute/pool-worker.js')).href, size: 2, makeWorker: nodeMakeWorker });
    try {
      const mesh = PR.makePrimitive('cube', { size: 2 }), arr = mesh.toArrays();
      const out = await pool.run(pathToFileURL(path.join(APP, 'mesh/mod-job.js')).href, 'evaluate', { mesh: arr, mods: [Object.assign(MD.newMod('subsurf'), { params: { levels: 3, renderLevels: 3 } })], refs: [] }, { transfer: [arr.p.buffer] });
      const r = Mesh.fromArrays(out.mesh);
      ok(r.faceCount === 384 && r.info().closed && valid(r), 'a subdivision stack worked out in a worker: 384 quads back, closed');
      // the page's evaluator: a big stack goes to the pool, the view shows the mesh until it is ready
      const model = new M.Model();
      let ready = 0;
      const ev = new ME.ModEval(model, { onReady: () => { ready++; }, pool: async () => pool, jobUrl: pathToFileURL(path.join(APP, 'mesh/mod-job.js')).href });
      const d = model.change('add', (mm) => { const x = mm.newMeshDef(PR.makePrimitive('grid', { size: 2, x: 60 }), 'Grid'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
      model.change('mods', (mm) => { mm.def(d.id).mods = [Object.assign(MD.newMod('subsurf'), { params: { levels: 2, renderLevels: 2 } })]; }, [d.id]);
      const first = ev.shown(model.def(d.id));
      ok(first === null, 'a big stack (3 600 faces × 16): nothing yet, the view keeps the mesh');
      for (let i = 0; i < 200 && !ready; i++) await new Promise((res) => setTimeout(res, 20));
      const later = ev.shown(model.def(d.id));
      ok(ready === 1 && later && later.faceCount === 3600 * 16, 'then the pool\'s result: 57 600 faces, and the page is told to redraw');
    } finally { pool.close?.(); pool.terminate?.(); }
  }

  // ---------------------------------------------------------------------------------------------------- MD.4
  section('subdivision surfaces (0.7 MD.4): Catmull-Clark rules, creases, borders, the limit surface, adaptive level');
  {
    const SD = await import(path.join(APP, 'mesh/subdiv.js'));
    const MD = await import(path.join(APP, 'mesh/modifiers.js'));
    const O = await import(path.join(APP, 'mesh/ops.js'));
    const cube = () => PR.makePrimitive('cube', { size: 2 });
    const at = (m, v) => [m.P[v * 3], m.P[v * 3 + 1], m.P[v * 3 + 2]];
    const near = (a, b, e = 1e-12) => a.every((x, i) => Math.abs(x - b[i]) <= e);
    // worked by hand from the published rules for a 2 m cube centred on (0, 0, 1): corner (1, 1, 2) → its face points
    // average (1/3, 1/3, 4/3), its edge midpoints average (2/3, 2/3, 5/3), (F + 2R + 0·V) / 3 = (5/9, 5/9, 14/9)
    const c0 = cube(), corner = [...Array(c0.nv).keys()].find((v) => near(at(c0, v), [1, 1, 2]));
    const s1 = SD.subdivide(c0, 1);
    ok(corner !== undefined && near(at(s1, corner), [5 / 9, 5 / 9, 14 / 9], 1e-12), 'vertex rule: a cube corner moves to (F + 2R + (n − 3)V) / n = (5/9, 5/9, 14/9) m');
    { // an edge point: its two ends and its two faces' points, averaged → (0, 0.75, 1.75) for the top-back edge
      let found = false;
      for (let v = c0.nv; v < s1.nv; v++) if (near(at(s1, v), [0, 0.75, 1.75], 1e-12)) found = true;
      ok(found, 'edge rule: the point on edge (−1, 1, 2)–(1, 1, 2) is the mean of its ends and its two face points, (0, 0.75, 1.75)');
    }
    ok(s1.faceCount === 24 && SD.subdivide(c0, 3).faceCount === 384, 'each n-gon becomes n quads, then four per level (6 → 24 → 384 at level 3)');
    // the limit surface: a level-1 corner pushed to the limit agrees with many more levels
    const lim = SD.limitPositions(s1), deep = SD.subdivide(s1, 6);
    ok(near([lim[corner * 3], lim[corner * 3 + 1], lim[corner * 3 + 2]], at(deep, corner), 2e-4), `limit position of the corner = where six more levels take it (within 0.2 mm: ${Math.max(...[0, 1, 2].map((k) => Math.abs(lim[corner * 3 + k] - deep.P[corner * 3 + k]))).toExponential(2)} m)`);
    // borders: a single open quad keeps its corners; a grid's border stays on its straight edge
    const q = PR.makePrimitive('plane', { size: 2 }), qs = SD.subdivide(q, 3);
    ok([0, 1, 2, 3].every((v) => near(at(qs, v), at(q, v))), 'border rule: an open quad\'s corners stay where they are');
    { const g = PR.makePrimitive('grid', { size: 2, x: 4 }), gs = SD.subdivide(g, 2), b = g.bounds(); let flat = true, inside = true;
      for (let v = 0; v < gs.nv; v++) { if (gs.vertDead(v)) continue; if (Math.abs(gs.P[v * 3 + 2]) > 1e-12) flat = false; if (gs.P[v * 3] < b.min[0] - 1e-12 || gs.P[v * 3] > b.max[0] + 1e-12) inside = false; }
      const ext = gs.bounds();
      ok(flat && inside && close(ext.min[0], b.min[0], 1e-12) && close(ext.max[1], b.max[1], 1e-12), 'border rule: a flat grid stays flat and keeps its outline'); }
    // creases: fully creased edges keep the box for four levels; half-creased edges round off part way
    const cc = cube(), es = []; for (let h = 0; h < cc.nh; h++) if (!cc.heDead(h) && cc.edgeOf(h) === h) es.push(h);
    O.setCrease(cc, es, 1);
    ok(close(SD.subdivide(cc, 3).info().volume, 8, 1e-9), 'every edge creased 1: the cube stays a cube through three levels (8 m³)');
    const half = cube(); O.setCrease(half, es, 0.5);
    const vs = SD.subdivide(half, 4).info().volume, vsm = SD.subdivide(cube(), 4).info().volume;
    ok(vs > vsm + 0.5 && vs < 8, `crease 0.5 (sharp for two levels, then smooth): between the smooth shape and the box (${vsm.toFixed(3)} < ${vs.toFixed(3)} < 8 m³)`);
    ok(O.creaseOfEdges(half, es) === 0.5 && O.creaseOfEdges(PR.makePrimitive('cube', { size: 2 }), es) === 0, 'the panel reads one crease for edges that share it');
    // corner layers (UVs) are carried: every new corner's UV is inside the old face's range
    const uvq = PR.makePrimitive('plane', { size: 2 });
    if (!uvq.hasAttr('uv')) { const cs = uvq.faceCorners(0, []); cs.forEach((c, i) => uvq.setUV(c, [0, 1, 1, 0][i], [0, 0, 1, 1][i])); }
    { const r = SD.subdivide(uvq, 2), a = r.attrArray('uv'); let okUv = !!a; for (let f = 0; f < r.nf; f++) for (const c of r.faceCorners(f, [])) if (a[c * 2] < -1e-9 || a[c * 2] > 1 + 1e-9) okUv = false; ok(okUv && r.faceCount === 16, 'UVs carried to every new corner, inside the original square'); }
    // the modifier: adaptive view level, render level on the limit surface
    const sub = Object.assign(MD.newMod('subsurf'), { params: { levels: 4, renderLevels: 2, adaptive: true, limit: true } });
    let r = MD.evaluate(cube(), [sub], { budget: 400 });
    ok(r.info[0].level === 3 && r.mesh.faceCount === 384, 'adaptive: with a 400-face view budget, level 4 (1 536 faces) shows at level 3 (384), and says so');
    r = MD.evaluate(cube(), [sub], { budget: 0 });
    ok(r.mesh.faceCount === 1536 && r.info[0].level === undefined, 'no budget (Apply): all four levels');
    const rl = MD.evaluate(cube(), [sub], { render: true }).mesh, rp = MD.evaluate(cube(), [{ ...sub, params: { ...sub.params, limit: false } }], { render: true }).mesh;
    const deep2 = SD.subdivide(SD.subdivide(cube(), 2), 6);
    ok(rl.faceCount === 96 && near(at(rl, corner), at(deep2, corner), 2e-4) && !near(at(rp, corner), at(rl, corner), 1e-4), 'renders: the render level (2) with every point on the limit surface');
    ok(MD.subdividedFaces(cube(), 4) === 1536 && MD.subdividedFaces(PR.makePrimitive('cylinder', { r: 1, h: 1 }), 0) === PR.makePrimitive('cylinder', { r: 1, h: 1 }).faceCount, 'faces after n levels counted before working them out');
    // crease through the model: one undo step, saved in the file
    const model = new M.Model();
    const d = model.change('add', (mm) => { const x = mm.newMeshDef(cube(), 'Box'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    const n0 = model.undoStack.length;
    model.meshEdit(d.id, 'crease', (me) => O.setCrease(me, es.slice(0, 4), 1));
    ok(model.undoStack.length === n0 + 1 && O.creaseOfEdges(model.def(d.id).mesh, es.slice(0, 4)) === 1, 'Crease: one undo step on the mesh');
    const back = new M.Model(); back.load(JSON.parse(JSON.stringify(model.toJSON())));
    ok(O.creaseOfEdges(back.def(d.id).mesh, es.slice(0, 4)) === 1, 'creases are saved in the file (the edge layer)');
    model.undo();
    ok(!model.def(d.id).mesh.hasAttr('crease') || O.creaseOfEdges(model.def(d.id).mesh, es.slice(0, 4)) === 0, 'undo takes the crease off');
  }

  // ---------------------------------------------------------------------------------------------------- MD.5
  section('UV tools (0.7 MD.5): seams, islands, unwrap (angle-based, conformal), projections, packing, stretch');
  {
    const U = await import(path.join(APP, 'mesh/uv.js'));
    const { FL_SEAM } = await import(path.join(APP, 'mesh.js'));
    const cube = () => PR.makePrimitive('cube', { size: 2 });
    const live = (m) => { const o = []; for (let f = 0; f < m.nf; f++) if (!m.faceDead(f)) o.push(f); return o; };
    const sMax = (m, mode, fs = live(m)) => { const s = U.stretch(m, mode); return Math.max(...fs.map((f) => s[f])); };
    const sAvg = (m, mode) => { const s = U.stretch(m, mode), fs = live(m); return fs.reduce((a, f) => a + s[f], 0) / fs.length; };
    const inSquare = (m) => { const a = m.attrArray('uv'); return live(m).every((f) => m.faceCorners(f, []).every((h) => a[h * 2] >= -1e-9 && a[h * 2] <= 1 + 1e-9 && a[h * 2 + 1] >= -1e-9 && a[h * 2 + 1] <= 1 + 1e-9)); };
    // islands and wedges
    const c = cube(); U.seamsFromSharp(c, 60);
    const I = U.islands(c);
    ok(I.length === 6 && I.every((x) => x.nW === 4 && !x.closed), 'a cube cut at its sharp edges: 6 islands of 4 UV points each');
    ok(U.islands(cube()).length === 1 && U.islands(cube())[0].closed, 'with no seams it is one closed island');
    // a flat grid: both methods lay it out exactly (no stretch), in the square, the same shape
    for (const method of ['angle', 'conformal']) {
      const g = PR.makePrimitive('grid', { size: 2, x: 10 });
      const r = U.unwrap(g, null, { method });
      const a = g.attrArray('uv'), cs = g.faceCorners(live(g)[0], []);
      const e3 = (h) => { const p = g.P, x = g.hV[h] * 3, y = g.hV[g.hNx[h]] * 3; return Math.hypot(p[y] - p[x], p[y + 1] - p[x + 1], p[y + 2] - p[x + 2]); };
      const e2 = (h) => { const n = g.hNx[h]; return Math.hypot(a[n * 2] - a[h * 2], a[n * 2 + 1] - a[h * 2 + 1]); };
      ok(r.islands === 1 && sMax(g, 'angle') < 1e-4 && sMax(g, 'area') < 1e-4 && inSquare(g) && Math.abs(e2(cs[0]) / e3(cs[0]) - e2(cs[1]) / e3(cs[1])) < 1e-5, `${method}: a flat grid unwraps without stretch (UVs are stored as 32-bit numbers), in the square, its shape kept`);
    }
    // a cylinder's side cut along one line is developable: it unrolls with no stretch
    for (const method of ['angle', 'conformal']) {
      const cy = PR.makePrimitive('cylinder', { r: 1, h: 2 }), n = [0, 0, 0], side = [];
      for (const f of live(cy)) { cy.faceNormal(f, n); if (Math.abs(n[2]) < 0.5) side.push(f); }
      let seam = -1;
      for (let h = 0; h < cy.nh && seam < 0; h++) { const t = cy.hTw[h]; if (t < 0 || cy.heDead(h) || !side.includes(cy.hF[h]) || !side.includes(cy.hF[t])) continue; if (Math.abs(cy.P[cy.hV[h] * 3 + 2] - cy.P[cy.head(h) * 3 + 2]) > 1) seam = h; }
      cy.setEdgeFlag(seam, FL_SEAM, true);
      U.unwrap(cy, side, { method });
      ok(sMax(cy, 'angle', side) < 1e-4, `${method}: a cylinder's side cut along one line unrolls flat (no angle stretch)`);
    }
    // a sphere cut in two hemispheres: angle-based keeps angles truer than conformal on average
    const sph = (method) => { const s = PR.makePrimitive('uvsphere', { r: 1 }); for (let h = 0; h < s.nh; h++) { if (s.heDead(h) || s.hTw[h] < 0) continue; const a = s.hV[h] * 3, b = s.head(h) * 3; if ((Math.abs(s.P[a + 2] - 1) < 1e-6 && Math.abs(s.P[b + 2] - 1) < 1e-6) || (Math.abs(s.P[a + 1]) < 1e-9 && Math.abs(s.P[b + 1]) < 1e-9 && s.P[a] > 0 && s.P[b] > 0)) s.setEdgeFlag(h, FL_SEAM, true); } const r = U.unwrap(s, null, { method }); return { s, r }; };
    const A = sph('angle'), C = sph('conformal');
    ok(A.r.islands === 2 && !A.r.notes.includes('angle_fell') && sAvg(A.s, 'angle') <= sAvg(C.s, 'angle') + 1e-9 && sAvg(A.s, 'angle') < 0.1, `hemispheres: angle-based ${sAvg(A.s, 'angle').toFixed(4)} ≤ conformal ${sAvg(C.s, 'angle').toFixed(4)} average angle stretch`);
    // ABF's constraints hold where it settles
    { const T = new Int32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]), beta = new Float64Array(12).fill(Math.PI / 3), inner = new Uint8Array([1, 0, 0, 0, 0]);
      const a = U.abfAngles(5, T, beta, inner);
      ok(a && [0, 1, 2, 3].every((t) => Math.abs(a[t * 3] + a[t * 3 + 1] + a[t * 3 + 2] - Math.PI) < 1e-8) && Math.abs(a[0] + a[3] + a[6] + a[9] - 2 * Math.PI) < 1e-8, 'ABF on a pyramid of equilateral triangles: each triangle π, the apex 2π (it flattens to a square fan)'); }
    { const r = U.unwrap(cube(), null, { method: 'angle' }); ok(r.notes.includes('closed'), 'unwrapping a closed piece with no seams says to mark seams'); }
    { const pts = U.lscm(3, new Int32Array([0, 1, 2]), new Float64Array([0, 0, 2, 0, 0, 1]), [[0, 0, 0], [1, 4, 0]]); ok(Math.abs(pts[4] - 0) < 1e-6 && Math.abs(pts[5] - 2) < 1e-6, 'LSCM keeps a lone triangle\'s shape exactly (scaled by its pins)'); }
    // projections
    { const b = cube(); U.projectBox(b); ok(inSquare(b) && sMax(b, 'angle') < 1e-9, 'box projection: every face square-on, in the square, no stretch on a cube'); }
    { const cy = PR.makePrimitive('cylinder', { r: 1, h: 2 }), n = [0, 0, 0], side = []; for (const f of live(cy)) { cy.faceNormal(f, n); if (Math.abs(n[2]) < 0.5) side.push(f); }
      U.projectCylinder(cy, side); const a = cy.attrArray('uv');
      ok(side.every((f) => { const us = cy.faceCorners(f, []).map((h) => a[h * 2]); return Math.max(...us) - Math.min(...us) < 0.5; }), 'cylinder projection: no face spans the wrap (the face across it is kept in one piece)'); }
    { const s = PR.makePrimitive('uvsphere', { r: 1 }); U.projectSphere(s); const a = s.attrArray('uv'); ok(live(s).every((f) => s.faceCorners(f, []).every((h) => a[h * 2 + 1] >= -1e-9 && a[h * 2 + 1] <= 1 + 1e-9)), 'sphere projection: latitude from 0 to 1'); }
    { const g = PR.makePrimitive('plane', { size: 2 }); U.projectView(g, null, (p) => [p[0] * 10, -p[1] * 10]); ok(inSquare(g) && sMax(g, 'angle') < 1e-9, 'from view: a plane seen square-on fills the square undistorted'); }
    // packing: inside the square, no overlaps, one texel density
    { const m = cube(); U.seamsFromSharp(m); U.unwrap(m, null, { method: 'conformal' });
      const isl = U.uvIslands(m), a = m.attrArray('uv');
      const box = (fs) => { let x0 = 9, y0 = 9, x1 = -9, y1 = -9; for (const f of fs) for (const h of m.faceCorners(f, [])) { x0 = Math.min(x0, a[h * 2]); x1 = Math.max(x1, a[h * 2]); y0 = Math.min(y0, a[h * 2 + 1]); y1 = Math.max(y1, a[h * 2 + 1]); } return [x0, y0, x1, y1]; };
      const B = isl.map(box);
      let overlap = false; for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) if (B[i][0] < B[j][2] - 1e-9 && B[j][0] < B[i][2] - 1e-9 && B[i][1] < B[j][3] - 1e-9 && B[j][1] < B[i][3] - 1e-9) overlap = true;
      const dens = B.map((b) => (b[2] - b[0]) * (b[3] - b[1]));
      if (!(isl.length === 6 && inSquare(m) && !overlap && Math.max(...dens) - Math.min(...dens) < 1e-5)) console.log('    pack:', isl.length, inSquare(m), overlap, dens.map((x) => x.toFixed(6)).join(' '));
      ok(isl.length === 6 && inSquare(m) && !overlap && Math.max(...dens) - Math.min(...dens) < 1e-5, 'pack: 6 equal faces, equal size, side by side, in the square'); }
    ok(Math.abs(U.bestAngle([[1, 0], [0, 1], [-1, 0], [0, -1]]) % (Math.PI / 2) - Math.PI / 4) < 1e-9, 'the smallest rectangle round a diamond is turned 45°');
    // stretch: one face's UVs made twice as wide is found
    { const g = PR.makePrimitive('grid', { size: 2, x: 4 }); U.unwrap(g, null, { method: 'conformal' }); const f0 = live(g)[5], a = g.attrArray('uv');
      const cs = g.faceCorners(f0, []); let cx = 0; for (const h of cs) cx += a[h * 2]; cx /= cs.length;
      for (const h of cs) g.setAttr('uv', h, [cx + (a[h * 2] - cx) * 2, a[h * 2 + 1]]);
      const s = U.stretch(g, 'angle'); ok(s[f0] > 0.3 && s[live(g)[0]] < 0.05, `stretch: a face made twice as wide in UV shows (${s[f0].toFixed(3)}), its far neighbour does not`); }
    // seams and UVs through the model: one undo step, in the file
    const model = new M.Model();
    const d = model.change('add', (mm) => { const x = mm.newMeshDef(cube(), 'Box'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    const n0 = model.undoStack.length;
    const uv0 = Float32Array.from(model.def(d.id).mesh.attrArray('uv') || []);
    model.meshEdit(d.id, 'seams', (me) => U.seamsFromSharp(me));
    model.meshEdit(d.id, 'unwrap', (me) => U.unwrap(me, null));
    ok(model.undoStack.length === n0 + 2 && U.uvIslands(model.def(d.id).mesh).length === 6, 'Seams at sharp, then Unwrap: two undo steps, six islands');
    const back = new M.Model(); back.load(JSON.parse(JSON.stringify(model.toJSON())));
    const bm = back.def(d.id).mesh;
    let seams = 0; for (let h = 0; h < bm.nh; h++) if (!bm.heDead(h) && bm.hFl[h] & FL_SEAM && bm.edgeOf(h) === h) seams++;
    ok(seams === 12 && U.uvIslands(bm).length === 6, 'saved and opened: the 12 seams and the UVs are in the file');
    model.undo();
    { const a = model.def(d.id).mesh.attrArray('uv') || []; ok(uv0.length > 0 && uv0.every((x, i) => x === a[i]), 'undo takes the unwrap back (the primitive\'s own UVs again)'); }
  }

  // ---------------------------------------------------------------------------------------------------- MD.6
  section('curve objects (0.7 MD.6): Bézier, NURBS and poly splines; bevel, extrude, taper, fill; in the model');
  {
    const CV = await import(path.join(APP, 'mesh/curve.js'));
    const MD = await import(path.join(APP, 'mesh/modifiers.js'));
    const ME = await import(path.join(APP, 'mesh/mod-eval.js'));
    const P = (p) => ({ p, hl: p.slice(), hr: p.slice(), h: 'auto', w: 1, radius: 1, tilt: 0 });
    const shape = (o) => ({ dim: '3d', fill: false, extrude: 0, bevel: { depth: 0, resolution: 4 }, caps: true, taper: [1], ...o });
    const polyArea = (n, r) => 0.5 * n * r * r * Math.sin((2 * Math.PI) / n);
    // a straight tube: the profile polygon's area × its length (36 sides at roundness 8)
    let m = CV.curveMesh(shape({ bevel: { depth: 0.1, resolution: 8 }, splines: [{ type: 'poly', cyclic: false, resolution: 1, order: 4, points: [P([0, 0, 0]), P([2, 0, 0])] }] }));
    ok(valid(m) && m.info().closed && close(m.info().volume, polyArea(36, 0.1) * 2, 1e-9), `a straight tube (bevel 0.1, roundness 8, capped): ${m.info().volume.toFixed(6)} m³ = the 36-gon's area × 2 m`);
    // a ring round a Bézier circle: Pappus (2π R × the profile's area), within the circle's own sampling
    const ring = CV.newCurve('bezier-circle', 2); ring.bevel = { depth: 0.1, resolution: 8 };
    m = CV.curveMesh(ring);
    ok(m.info().closed && Math.abs(m.info().volume / (2 * Math.PI * 1 * polyArea(36, 0.1)) - 1) < 0.01, `a ring round a 1 m Bézier circle: within 1 % of Pappus (${m.info().volume.toFixed(5)})`);
    // the Bézier circle is the standard quarter-circle cubic: its points stay within 0.03 % of the radius
    { const S = CV.sample(CV.newCurve('bezier-circle', 2).splines[0]); const rs = S.pts.map((q) => Math.hypot(q.p[0], q.p[1])); ok(S.closed && Math.max(...rs.map((r) => Math.abs(r - 1))) < 3e-4, 'the Bézier circle: every sampled point within 0.03 % of the radius'); }
    // NURBS: a clamped (open) spline starts and ends on its end points; the eight-point circle is round to 0.4 %
    { const sp = CV.newCurve('path', 4).splines[0]; sp.points[1].p = [-1, 1, 0]; const S = CV.sample(sp); ok(close(S.pts[0].p[0], -2, 1e-12) && close(S.pts[S.pts.length - 1].p[0], 2, 1e-9), 'NURBS (clamped): the curve starts and ends on its end points'); }
    { const S = CV.sample(CV.newCurve('nurbs-circle', 2).splines[0]); const rs = S.pts.map((q) => Math.hypot(q.p[0], q.p[1])); ok(S.closed && Math.max(...rs) / Math.min(...rs) < 1.004 && Math.abs(rs.reduce((x, y) => x + y) / rs.length - 1) < 0.003, `NURBS circle (cyclic, order 3, eight points): radius 1 m, round within ${((Math.max(...rs) / Math.min(...rs) - 1) * 100).toFixed(1)} %`); }
    // filled flat shapes: a frame with a square hole, exactly; a disk
    const sq = (s0) => ({ type: 'poly', cyclic: true, resolution: 1, order: 4, points: [[-s0, -s0, 0], [s0, -s0, 0], [s0, s0, 0], [-s0, s0, 0]].map(P) });
    m = CV.curveMesh(shape({ dim: '2d', fill: true, extrude: 0.5, bevel: { depth: 0, resolution: 0 }, splines: [sq(1), sq(0.5)] }));
    ok(valid(m) && m.info().closed && close(m.info().volume, 3, 1e-12), 'a 2 m square with a 1 m square hole, filled, extruded ±0.5 m: 3 m³ exactly, closed');
    m = CV.curveMesh(shape({ dim: '2d', fill: true, extrude: 0, bevel: { depth: 0, resolution: 0 }, splines: [sq(1)] }));
    { const n = [0, 0, 0]; m.faceNormal(0, n); ok(m.faceCount === 2 && close(m.info().area, 4, 1e-12) && n[2] > 0.99, 'filled with no thickness: one flat face of 4 m² facing up'); }
    { const d = CV.newCurve('bezier-circle', 2); d.fill = true; d.extrude = 0.1; d.bevel.depth = 0.05; const md = CV.curveMesh(d); ok(valid(md) && md.info().closed && md.info().volume > Math.PI * 0.2, 'a filled circle with a rounded edge: closed, bigger than the plain disk (the bevel grows it)'); }
    // taper and radius
    { const a = CV.newCurve('path', 2); a.bevel.depth = 0.1; const b = structuredClone(a); b.taper = [1, 0]; const c = structuredClone(a); c.splines[0].points.forEach((q) => { q.radius = 2; });
      const va = CV.curveMesh(a).info().volume, vb = CV.curveMesh(b).info().volume, vc = CV.curveMesh(c).info().volume;
      ok(vb < va * 0.5 && close(vc / va, 4, 0.05), `taper 1 → 0 thins the tube (${(vb / va).toFixed(2)} of it); radius 2 at every point: four times the volume (${(vc / va).toFixed(3)})`); }
    // a helix: frames that do not flip (closed, the volume of the tube)
    { const pts = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * 4 * Math.PI; pts.push(P([Math.cos(a), Math.sin(a), i / 24])); }
      const h = CV.curveMesh(shape({ bevel: { depth: 0.05, resolution: 4 }, splines: [{ type: 'bezier', cyclic: false, resolution: 6, order: 4, points: pts }] }));
      const L = CV.sample({ type: 'bezier', cyclic: false, resolution: 6, order: 4, points: pts }).length;
      ok(valid(h) && h.info().closed && Math.abs(h.info().volume / (polyArea(20, 0.05) * L) - 1) < 0.03, `a helix tube: closed, its volume the profile × its length within 3 % (no twists)`); }
    // edits keep the shape: a point in the middle of a Bézier segment
    { const sp = CV.newCurve('bezier', 2).splines[0]; const before = CV.sample({ ...sp, resolution: 2 }).pts[3].p, after = CV.insertAfter(sp, 1);
      ok(after.points.length === 5 && after.points[2].p.every((x, i) => Math.abs(x - before[i]) < 1e-12), 'subdivide a Bézier segment: the new point is on the curve where it was'); }
    ok(CV.reverse(CV.newCurve('bezier', 2).splines[0]).points[0].p[0] === 1, 'reverse: the last point first');
    const bad = CV.cleanCurve({ splines: [{ type: 'evil', points: [] }, { type: 'poly', points: [P([0, 0, 0]), { p: [1, 'x', 0] }, P([1, 1, 1])] }], taper: ['a'], text: { string: 'A\u0000B' } });
    ok(bad && bad.splines.length === 1 && bad.splines[0].points.length === 2 && bad.text.string === 'A B' && CV.cleanCurve({ splines: [] }) === null, 'a curve from a file: bad splines and points left out, control characters cleaned, empty refused');
    ok(CV.curveLines(CV.newCurve('bezier', 2)).length === (3 * 12 + 0) * 6, 'the curve\'s own lines for the view: one segment per sample step');
    // in the model: what shows, undo, the file, modifiers on top, to mesh
    const model = new M.Model(), ev = new ME.ModEval(model);
    M.setMeshHooks({ clean: MD.cleanMods, cleanLattice: ME.cleanLattice, cleanCurve: CV.cleanCurve, shown: (d) => ev.shown(d), rendered: (d) => ev.rendered(d), lines: (d) => ev.lines(d) });
    const dd = model.change('add', (mm) => { const x = mm.newMeshDef(new Mesh(), 'Ring'); x.curve = ring; mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    ok(model.def(dd.id).shown.faceCount === CV.curveMesh(ring).faceCount && model.def(dd.id).mesh.faceCount === 0, 'a curve object shows the mesh its curve makes (its own mesh stays empty)');
    model.change('thicker', (mm) => { const c = structuredClone(mm.def(dd.id).curve); c.bevel.depth = 0.2; mm.def(dd.id).curve = c; }, [dd.id]);
    const v2 = model.def(dd.id).shown.info().volume;
    model.undo();
    ok(model.def(dd.id).curve.bevel.depth === 0.1 && model.def(dd.id).shown.info().volume < v2 / 2, 'undo a change of shape: the thinner ring again');
    const back = new M.Model(); back.load(JSON.parse(JSON.stringify(model.toJSON())));
    ok(back.def(dd.id).curve && back.def(dd.id).curve.splines[0].points.length === 4, 'saved and opened: the curve is in the file');
    model.change('mirror', (mm) => { mm.def(dd.id).mods = [Object.assign(MD.newMod('array'), { params: { ...MD.newMod('array').params, count: 2, rel: [1.5, 0, 0] } })]; }, [dd.id]);
    ok(model.def(dd.id).shown.faceCount === 2 * CV.curveMesh(ring).faceCount, 'modifiers work on top of the curve (an array of 2)');
    const made = CV.curveMesh(model.def(dd.id).curve);
    model.meshEdit(dd.id, 'to mesh', (me, d2) => { me.appendMesh(made); d2.curve = null; });
    ok(!model.def(dd.id).curve && model.def(dd.id).mesh.faceCount === made.faceCount && model.def(dd.id).shown.faceCount === 2 * made.faceCount, 'Curve to mesh: the mesh holds the shape, the curve goes, the array stays on top');
    model.undo();
    ok(!!model.def(dd.id).curve && model.def(dd.id).mesh.faceCount === 0, 'undo: a curve object again');
  }

  // ---------------------------------------------------------------------------------------------------- MD.7
  section('sculpting (0.7 MD.7): brushes, mask, symmetry, grab, detail, one undo step per stroke');
  {
    const SC = await import(path.join(APP, 'mesh/sculpt.js'));
    const WS = await import(path.join(APP, 'ws-sculpt.js')).catch(() => null);
    const grid = () => PR.makePrimitive('grid', { size: 2, x: 20 });
    const zAt = (m, x, y) => { let best = null, bd = 1e9; for (let v = 0; v < m.nv; v++) { if (m.vertDead(v)) continue; const d = Math.hypot(m.P[v * 3] - x, m.P[v * 3 + 1] - y); if (d < bd) { bd = d; best = v; } } return m.P[best * 3 + 2]; };
    const zMax = (m) => { let z = -1e9; for (let v = 0; v < m.nv; v++) if (!m.vertDead(v)) z = Math.max(z, m.P[v * 3 + 2]); return z; };
    {
      const m = grid(), S = new SC.Sculptor(m);
      const h = S.hit([0.3, 0.2, 5], [0, 0, -1]);
      ok(h && close(h.p[2], 0, 1e-12) && close(h.p[0], 0.3, 1e-12) && h.n[2] > 0.99, 'the brush finds the surface under the pointer (a grid at z = 0, its normal up)');
      ok(SC.falloff(0) === 1 && SC.falloff(1) === 0 && close(SC.falloff(0.5), 0.5, 1e-12), 'falloff: 1 in the middle, 0 at the edge, smooth');
      S.dab('draw', { p: [0, 0, 0], r: 0.5, strength: 1, pressure: 1 });
      const mid = zAt(m, 0, 0), half = zAt(m, 0.3, 0), out = zAt(m, 0.8, 0);
      ok(mid > 0 && half > 0 && half < mid && out === 0 && close(mid, 0.05, 1e-9), `draw: the middle up by a tenth of the radius (${mid.toFixed(4)}), less towards the edge, nothing outside`);
      S.dab('draw', { p: [0, 0, mid], r: 0.5, strength: 1, pressure: 0.5, invert: true });   // on the surface, as the brush's hit is
      ok(close(zAt(m, 0, 0), mid - 0.025, 1e-6), 'Ctrl (take away) at half pressure: down by half as much');
    }
    {
      const m = grid(), S = new SC.Sculptor(m);
      S.dab('mask', { p: [0.5, 0, 0], r: 0.4, strength: 1 });
      S.dab('mask', { p: [0.5, 0, 0], r: 0.4, strength: 1 });
      S.dab('draw', { p: [0.5, 0, 0], r: 0.4, strength: 1 });
      ok(m.hasAttr('mask') && close(zAt(m, 0.5, 0), 0, 1e-12) && zAt(m, 0.75, 0) >= 0, 'mask: where it is full, draw moves nothing');
      S.maskAll(0);
      S.dab('draw', { p: [0.5, 0, 0], r: 0.4, strength: 1 });
      ok(zAt(m, 0.5, 0) > 0, 'with the mask cleared, it moves again');
    }
    {
      const m = grid(), S = new SC.Sculptor(m);
      S.dab('draw', { p: [0.5, 0.2, 0], r: 0.3, strength: 1, sym: 'x' });
      ok(close(zAt(m, 0.5, 0.2), zAt(m, -0.5, 0.2), 1e-12) && zAt(m, -0.5, 0.2) > 0, 'Mirror X: the same dab on the other side');
    }
    {
      const m = grid(), S = new SC.Sculptor(m);
      S.dab('draw', { p: [0, 0, 0], r: 0.2, strength: 1 });
      const peak = zMax(m);
      for (let i = 0; i < 5; i++) S.dab('smooth', { p: [0, 0, 0], r: 0.5, strength: 1 });
      ok(zMax(m) < peak * 0.6, `smooth: a bump comes down (${peak.toFixed(4)} → ${zMax(m).toFixed(4)})`);
      const m2 = grid(), S2 = new SC.Sculptor(m2);
      S2.dab('draw', { p: [0, 0, 0], r: 0.4, strength: 1 });
      const p2 = zMax(m2);
      for (let i = 0; i < 4; i++) S2.dab('flatten', { p: [0, 0, 0], r: 0.6, strength: 1 });
      ok(zMax(m2) < p2, 'flatten: towards the area\'s plane');
    }
    {
      const m = grid(), S = new SC.Sculptor(m);
      S.grabStart([0, 0, 0], 0.5);
      S.dab('grab', { delta: [0, 0, 0.3] });
      ok(close(zAt(m, 0, 0), 0.3, 1e-12) && close(zAt(m, 0.3, 0), 0.3 * SC.falloff(0.6), 1e-9), 'grab: the middle follows the pointer fully, its neighbours by the falloff');
      S.dab('grab', { delta: [0, 0, 0.1] });
      ok(close(zAt(m, 0, 0), 0.1, 1e-12), 'grab measures from the stroke\'s start, not the last dab');
    }
    {
      const m = grid(), S = new SC.Sculptor(m), before = m.info().volume;
      S.dab('inflate', { p: [0, 0, 0], r: 0.4, strength: 1 });
      ok(zAt(m, 0, 0) > 0, 'inflate: out along the surface\'s own normal');
      void before;
    }
    // detail: edges under the brush split down to a length, a valid mesh, UVs carried
    {
      let m = grid();
      const n0 = WS ? WS.triangulateAll(m) : 0;
      ok(n0 === 400 && valid(m) && close(m.info().area, 4, 1e-12) && m.faceCount === 800, 'make triangles: 400 quads → 800 triangles, the same area');
      const S = new SC.Sculptor(m), f0 = m.faceCount;
      const n = S.dab('draw', { p: [0, 0, 0], r: 0.3, strength: 1, detail: 0.04 });
      ok(m.faceCount > f0 && valid(m) && m.info().boundary === 80, `detail: long edges under the brush split (${f0} → ${m.faceCount} triangles), still a valid sheet with its border`);
      const uv = m.attrArray('uv');
      let uvOk = !!uv; for (let f = 0; f < m.nf; f++) if (!m.faceDead(f)) for (const h of m.faceCorners(f, [])) if (!(uv[h * 2] >= -1e-6 && uv[h * 2] <= 1 + 1e-6)) uvOk = false;
      ok(uvOk && n > 0, 'the new corners carry UVs in the grid\'s range');
    }
    // a stroke through the model: many dabs, one undo step, the view told each time
    {
      const model = new M.Model();
      const d = model.change('add', (mm) => { const x = mm.newMeshDef(grid(), 'Clay'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
      const n0 = model.undoStack.length, me = model.def(d.id).mesh, live0 = me.live, S = new SC.Sculptor(me);
      const st = model.meshStroke(d.id);
      for (let i = 0; i < 10; i++) st.dab(() => S.dab('draw', { p: [-0.5 + i * 0.1, 0, 0], r: 0.3, strength: 0.5 }));
      ok(me.recording && me.live === live0 + 10 && zMax(me) > 0, 'a stroke: ten dabs while the record stays open (the view is told after each)');
      st.end('Sculpt: draw');
      ok(!me.recording && model.undoStack.length === n0 + 1 && model.undoStack[model.undoStack.length - 1].label === 'Sculpt: draw', 'its end: one undo step');
      model.undo();
      ok(zMax(model.def(d.id).mesh) === 0, 'undo: the whole stroke goes');
      const st2 = model.meshStroke(d.id); st2.dab(() => S.dab('draw', { p: [0, 0, 0], r: 0.3, strength: 1 })); st2.cancel();
      ok(model.undoStack.length === n0 && zMax(model.def(d.id).mesh) === 0, 'a cancelled stroke leaves nothing');
    }
  }

  // ---------------------------------------------------------------------------------------------------- MD.8
  section('remesh and retopology (0.7 MD.8): voxel remesh through manifold, projecting onto a target');
  {
    const R = await import(path.join(APP, 'mesh/remesh.js'));
    const { pathToFileURL } = await import('node:url');
    const ROOT = path.resolve(APP, '../../../../..');
    const S2 = await import(path.join(APP, 'solids.js'));
    const MF = await S2.manifold(() => import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href));
    const cube = () => PR.makePrimitive('cube', { size: 2 });
    {
      const G = R.sdfGrid(cube(), { voxel: 0.2 }), at = (x, y, z) => G.d[(Math.round((z - G.min[2]) / G.g) * G.ny + Math.round((y - G.min[1]) / G.g)) * G.nx + Math.round((x - G.min[0]) / G.g)];
      ok(close(at(0, 0, 1), -0.2 * 2, 1e-6) && close(at(0.9, 0, 1), -0.1, 1e-6) && close(at(1.1, 0, 1), 0.1, 1e-6), 'the distance grid: exact near the surface, negative inside, capped two voxels deep');
    }
    let r = R.voxelRemesh(MF, cube(), { voxel: 0.1 });
    ok(valid(r.mesh) && r.mesh.info().closed && close(r.mesh.info().volume, 8, 1e-6) && !r.notes.length, `a 2 m cube remeshed at 0.1 m: closed, still 8 m³ (${r.mesh.faceCount} triangles)`);
    r = R.voxelRemesh(MF, PR.makePrimitive('icosphere', { r: 1 }), { voxel: 0.05 });
    ok(r.mesh.info().closed && Math.abs(r.mesh.info().volume / PR.makePrimitive('icosphere', { r: 1 }).info().volume - 1) < 0.002, 'a sphere at 5 cm: within 0.2 % of its volume');
    { const a = cube(), b = cube(); for (let v = 0; v < b.nv; v++) b.P[v * 3] += 1; a.appendMesh(b);
      r = R.voxelRemesh(MF, a, { voxel: 0.05 }); ok(r.mesh.info().closed && close(r.mesh.info().volume, 12, 1e-6), 'two overlapping cubes in one mesh join: 8 + 8 − 4 = 12 m³ (the winding count, not parity)'); }
    { const g = PR.makePrimitive('grid', { size: 2, x: 4 }); r = R.voxelRemesh(MF, g, { voxel: 0.2 }); ok(r.notes.includes('open'), 'an open mesh is said to be open'); }
    // retopology: points put on a target surface
    { const target = PR.makePrimitive('uvsphere', { r: 1 }), T = target.triangulate(), tri = new Uint32Array(T.n * 3);
      for (let i = 0; i < T.n * 3; i++) tri[i] = target.hV[T.tri[i]];
      const near = R.surfaceNear({ pos: target.P.subarray(0, target.nv * 3), tri });
      const m = PR.makePrimitive('cube', { size: 3 }), vs = []; for (let v = 0; v < m.nv; v++) if (!m.vertDead(v)) vs.push(v);
      const n = R.projectVerts(m, vs, near);
      let worst = 0; for (const v of vs) worst = Math.max(worst, Math.abs(Math.hypot(m.P[v * 3], m.P[v * 3 + 1], m.P[v * 3 + 2] - 1) - 1));
      ok(n === 8 && worst < 0.02, `projecting a cage's 8 corners onto a sphere: each on its surface (within ${worst.toFixed(4)} m of the true sphere, its facets)`); }
    // the Mesh tool snaps moved points onto the target while it moves them
    {
      const model = new M.Model(), ME = await import(path.join(APP, 'mesh/mod-eval.js'));
      void ME;
      const ball = model.change('ball', (mm) => { const x = mm.newMeshDef(PR.makePrimitive('uvsphere', { r: 1 }), 'Ball'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
      const skin = model.change('skin', (mm) => { const x = mm.newMeshDef(PR.makePrimitive('plane', { size: 0.4 }), 'Skin'); mm.place(mm.root, x.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1]); return x; });
      const res = (await import(path.join(APP, 'mesh/mod-eval.js'))).resolveRef(model, model.def(skin.id), { kind: 'object', ref: ball.id });
      const near = R.surfaceNear(res.tris), sm = model.def(skin.id).mesh, vs = [0, 1, 2, 3];
      model.meshEdit(skin.id, 'project', (me) => R.projectVerts(me, vs, near));
      const zs = vs.map((v) => sm.P[v * 3 + 2]);
      ok(zs.every((z) => z < -0.9 && z > -2.1), `the target is found through both placements: the skin (placed 3 m up) lands on the ball's top in its own space (z ≈ ${zs[0].toFixed(3)})`);
    }
  }
}

