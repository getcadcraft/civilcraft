#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-mesh-import.mjs — STL / OBJ / 3MF meshes opened as solid bodies (0.7 D7.49; meshimport.js, kernel.js meshImport,
 * meshfaces.js face hints, part.js version 5).
 *   - readers: one reference body (a block with a through hole and a boss, made by manifold) written as binary STL, text STL,
 *     OBJ (quads, negative indices, v/vt forms) and 3MF (ours, stored) and, when tools/partcraft-test/venv has trimesh, by
 *     trimesh too (its 3MF is deflated): every read + repair gives the same closed body and volume; a 3MF with components,
 *     transforms and inches; units and up axis;
 *   - repair: a missing triangle, a flipped one, a cracked seam, a whole flat face gone, a ring-shaped face gone (left open,
 *     reported), doubled triangles; the report lines;
 *   - untrusted: cut-off files at many lengths and flipped bytes never throw anything but a reader error (mesh.err.*);
 *     tampered kept meshes are refused when the part is opened;
 *   - kernel: the body's volume (and with cm / up y), its flat faces named `<id>.flat:<k>` (a curved hole's facets are not
 *     faces), a sketch on a flat face → a pocket of the exact volume, cut and intersect with a block, a pattern of the body
 *     (the geometric fallback), a mesh fillet on an edge between two of its flat faces, an open mesh = a feature error; saved
 *     as version 5 and read back; the text form (.pcscript) round trip; a 200 k triangle body timed (VPS, capped: not for copy).
 *   node tools/partcraft-test/test-mesh-import.mjs [--verbose]    (or runMeshImportTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PY = path.join(HERE, 'venv/bin/python');

export async function runMeshImportTests({ ok, section, M = null }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const MI = await import(DEV + 'meshimport.js');
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), X = await import(DEV + 'export.js'), S = await import(DEV + 'sketch.js');
  const SC = await import(DEV + 'script.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
  const u8 = (x) => (x instanceof Uint8Array ? x : x instanceof ArrayBuffer ? new Uint8Array(x) : new Uint8Array(x.buffer, x.byteOffset, x.byteLength));
  const enc = (s) => new TextEncoder().encode(s);
  const throwsCode = async (fn) => { try { await fn(); return null; } catch (e) { return e.code || ('other: ' + e.message); } };

  // the reference body, in the file's own axes (Z up): a 40 × 30 × 20 block, a Ø10 hole through it along z, a 10 × 10 × 5 boss
  const refBody = M.Manifold.cube([40, 30, 20]).subtract(M.Manifold.cylinder(30, 5, 5, 48).translate([12, 15, -5])).add(M.Manifold.cube([10, 10, 5]).translate([25, 10, 20]));
  const g = refBody.getMesh();
  const REF = { positions: Float32Array.from(g.vertProperties), indices: Uint32Array.from(g.triVerts) };
  const VOL = refBody.volume();
  // stlBinary / threeMf write PartCraft's Y-up as Z-up ((x, y, z) → (x, −z, y)); hand them the body turned Y-up so the files are Z-up as REF
  const yUp = { positions: new Float32Array(REF.positions.length), indices: REF.indices };
  for (let i = 0; i < REF.positions.length; i += 3) { yUp.positions[i] = REF.positions[i]; yUp.positions[i + 1] = REF.positions[i + 2]; yUp.positions[i + 2] = -REF.positions[i + 1]; }
  const files = {};
  files.stl = u8(X.stlBinary(yUp, 'ref'));
  {
    let s = 'solid ref\n';
    for (let t = 0; t < REF.indices.length / 3; t++) {
      s += '  facet normal 0 0 1\n    outer loop\n';
      for (let k = 0; k < 3; k++) { const v = REF.indices[t * 3 + k]; s += `      vertex ${REF.positions[v * 3]} ${REF.positions[v * 3 + 1]} ${REF.positions[v * 3 + 2]}\n`; }
      s += '    endloop\n  endfacet\n';
    }
    files.stlText = enc(s + 'endsolid ref\n');
  }
  {
    // quads where two triangles share a diagonal and lie flat would need detection: write triangles, half as negative indices
    let s = '# reference\no ref\n';
    const nv = REF.positions.length / 3;
    for (let i = 0; i < nv; i++) s += `v ${REF.positions[i * 3]} ${REF.positions[i * 3 + 1]} ${REF.positions[i * 3 + 2]}\nvt 0 0\n`;
    for (let t = 0; t < REF.indices.length / 3; t++) {
      const c = [0, 1, 2].map((k) => REF.indices[t * 3 + k]);
      s += t % 2 ? `f ${c.map((v) => v + 1 + '/1').join(' ')}\n` : `f ${c.map((v) => v - nv).join(' ')}\n`;
    }
    // one quad: a separate flat square far off, as a second piece
    s += 'o square\nv 100 0 0\nv 110 0 0\nv 110 10 0\nv 100 10 0\nv 100 0 10\nv 110 0 10\nv 110 10 10\nv 100 10 10\n';
    s += 'f -8 -5 -6 -7\nf -4 -3 -2 -1\nf -8 -7 -3 -4\nf -7 -6 -2 -3\nf -6 -5 -1 -2\nf -5 -8 -4 -1\n';
    files.obj = enc(s);
  }
  files.mf = u8(X.threeMf(yUp, 'ref'));

  section('meshes as bodies: the readers');
  const readFix = async (bytes, name) => { const r = await MI.readMeshFile(bytes, name); return { r, rep: MI.repairMesh(r) }; };
  const solidVol = (rep) => { const m = new M.Manifold(new M.Mesh({ numProp: 3, vertProperties: Float32Array.from(rep.positions), triVerts: rep.indices })); const v = m.volume(); m.delete(); return v; };
  for (const [key, name] of [['stl', 'ref.stl'], ['stlText', 'ref.stl'], ['mf', 'ref.3mf']]) {
    const { r, rep } = await readFix(files[key], name);
    ok(rep.report.closed && rep.report.holesFilled === 0 && rel(solidVol(rep), VOL, 1e-6), `${key}: read (${r.format}), closed, the body's volume ${VOL.toFixed(3)} mm³`);
  }
  {
    const { r, rep } = await readFix(files.obj, 'ref.obj');
    ok(r.format === 'obj' && r.objects === 2 && rep.report.closed && rep.report.shells === 2 && rel(solidVol(rep), VOL + 1000, 1e-6), 'obj: v/vt, negative indices and quads read; two pieces = two shells, the volumes add up');
  }
  {
    const r = await MI.readMeshFile(files.mf, 'ref.3mf');
    ok(r.unit === 'mm', '3mf: says its unit (millimetres)');
    const s = await MI.readMeshFile(files.stl, 'ref.stl');
    ok(s.unit === null && MI.meshFormat('x.STL') === 'stl' && MI.meshFormat('noext', files.mf) === '3mf', 'stl: no unit (asked on import); the format from the name, a zip by its first bytes');
  }
  // a 3MF with a component used twice, a transform each, a build transform and inches
  {
    const vs = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
    const ts = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
    const model = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="inch" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
 <resources>
  <object id="1" type="model"><mesh><vertices>${vs.map((v) => `<vertex x="${v[0]}" y="${v[1]}" z="${v[2]}"/>`).join('')}</vertices><triangles>${ts.map((t) => `<triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}"/>`).join('')}</triangles></mesh></object>
  <object id="2" type="support"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh></object>
  <object id="3" type="model"><components><component objectid="1"/><component objectid="1" transform="2 0 0 0 1 0 0 0 1 3 0 0"/></components></object>
 </resources>
 <build><item objectid="3" transform="1 0 0 0 1 0 0 0 1 0 0 10"/><item objectid="2"/></build>
</model>`;
    const rels = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>';
    const zip = u8(X.zipStored([{ name: '[Content_Types].xml', data: enc('<Types/>') }, { name: '_rels/.rels', data: enc(rels) }, { name: '3D/3dmodel.model', data: enc(model) }]));
    const r = await MI.readMeshFile(zip, 'parts.3mf');
    const rep = MI.repairMesh(r);
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < rep.positions.length; i += 3) { lo = Math.min(lo, rep.positions[i]); hi = Math.max(hi, rep.positions[i]); }
    ok(r.unit === 'in' && r.objects === 2 && rep.report.shells === 2 && rel(solidVol(rep), 1 + 2, 1e-9) && lo === 0 && hi === 5 && r.notes.some((n) => n.key === 'mesh.note.3mf_skipped'),
      '3mf: a component used twice (one stretched ×2 and moved), the build transform, inches kept as the file unit, the support object left out and said');
  }
  // trimesh as a second writer (its 3MF is deflated)
  if (fs.existsSync(PY)) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-mesh-'));
    try {
      fs.writeFileSync(path.join(dir, 'in.stl'), files.stl);
      const py = spawnSync(PY, ['-c', `import trimesh,sys
m = trimesh.load(sys.argv[1] + '/in.stl')
m.export(sys.argv[1] + '/t.3mf'); m.export(sys.argv[1] + '/t.obj'); m.export(sys.argv[1] + '/t.stl', file_type='stl_ascii')
print(m.is_watertight, m.volume)`, dir], { encoding: 'utf8' });
      const [wt, tv] = py.stdout.trim().split(/\s+/);
      ok(py.status === 0 && wt === 'True' && rel(+tv, VOL, 1e-5), 'trimesh reads our STL as watertight with the same volume');
      for (const f of ['t.3mf', 't.obj', 't.stl']) {
        const { rep } = await readFix(u8(fs.readFileSync(path.join(dir, f))), f);
        ok(rep.report.closed && rel(solidVol(rep), VOL, 1e-5), `trimesh's ${f}: read, closed, the same volume`);
      }
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  } else ok(true, 'trimesh not installed (tools/partcraft-test/venv): second-writer checks skipped');

  section('meshes as bodies: repair');
  const base = await MI.readMeshFile(files.stl, 'ref.stl');
  const tris = (r) => r.indices.length / 3;
  const mutate = (fn) => { const r = { positions: Float64Array.from(base.positions), indices: Uint32Array.from(base.indices) }; fn(r); return r; };
  const facesOn = (r, axis, at) => { const out = []; for (let t = 0; t < tris(r); t++) if ([0, 1, 2].every((k) => Math.abs(r.positions[r.indices[t * 3 + k] * 3 + axis] - at) < 1e-6)) out.push(t); return out; };
  const drop = (r, list) => { const s = new Set(list); r.indices = Uint32Array.from([...r.indices].filter((_, i) => !s.has(Math.floor(i / 3)))); };
  {
    const r = mutate((q) => { drop(q, [0]); const t = 5; [q.indices[t * 3 + 1], q.indices[t * 3 + 2]] = [q.indices[t * 3 + 2], q.indices[t * 3 + 1]]; });
    const rep = MI.repairMesh(r);
    ok(rep.report.closed && rep.report.holesFilled === 1 && rep.report.flipped === 1 && rel(solidVol(rep), VOL, 1e-6), 'a missing triangle filled and a flipped one turned: closed, the same volume');
  }
  {
    const r = mutate((q) => { q.positions[0] += 0.004; });
    const rep = MI.repairMesh(r);
    ok(rep.report.closed && rep.report.gapsClosed > 0 && rel(solidVol(rep), VOL, 1e-4), 'a corner 0.004 mm off its neighbours (a crack): the gap closed');
  }
  {
    const r = mutate((q) => drop(q, facesOn(q, 1, 0)));   // the y = 0 side: one flat rectangle
    const rep = MI.repairMesh(r);
    ok(rep.report.closed && rep.report.holesFilled === 1 && rel(solidVol(rep), VOL, 1e-6), 'a whole flat face missing: its flat border filled');
  }
  {
    const r = mutate((q) => drop(q, facesOn(q, 2, 0)));   // the bottom: a rectangle with the hole through it = two loops in one plane
    const rep = MI.repairMesh(r);
    const lines = MI.reportLines(rep.report).map((l) => l.key);
    ok(!rep.report.closed && rep.report.holesLeft === 2 && rep.report.openEdges > 4 && lines.includes('mesh.rep.holes_left'), 'a ring-shaped face missing: left open (two borders in one plane would be filled over the hole) and reported');
  }
  {
    const r = mutate((q) => { const extra = q.indices.slice(0, 6); const flip = [extra[3], extra[5], extra[4]]; q.indices = Uint32Array.from([...q.indices, ...extra.slice(0, 3), ...flip]); });
    const rep = MI.repairMesh(r);
    ok(rep.report.closed && rep.report.duplicates >= 2 && rel(solidVol(rep), VOL, 1e-6), 'a triangle doubled the same way (one kept) and one doubled the other way (an inner wall: both gone… then the hole filled)');
  }
  {
    const r = mutate(() => {});
    const rep = MI.repairMesh(r);
    const lines = MI.reportLines(rep.report, base.notes).map((l) => l.key);
    ok(rep.report.welded > 0 && lines.length === 1 && lines[0] === 'mesh.rep.welded', 'a clean STL: only the joined corners are reported');
  }

  section('meshes as bodies: untrusted files');
  {
    let bad = 0, readers = 0, n = 0;
    const lens = new Set();
    for (const f of [files.stl, files.mf, files.stlText]) for (let i = 0; i < 60; i++) lens.add(f === files.stl ? Math.floor(f.length * i / 60) : Math.floor(f.length * i / 60));
    for (const [f, name] of [[files.stl, 'cut.stl'], [files.mf, 'cut.3mf'], [files.stlText, 'cut.stl'], [files.obj, 'cut.obj']]) {
      for (let i = 0; i < 60; i++) {
        const cut = f.subarray(0, Math.floor(f.length * i / 60));
        n++;
        const code = await throwsCode(async () => { const r = await MI.readMeshFile(cut, name); MI.repairMesh(r); });
        if (code === null) continue;
        if (/^mesh\.err\./.test(code)) readers++; else { bad++; if (bad < 4) console.log('    unexpected:', name, cut.length, code); }
      }
    }
    ok(bad === 0 && readers > 40, `${n} cut-off files: each read what it could or said why (${readers} reader errors), nothing else thrown`);
    let seed = 7;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    bad = 0;
    for (let k = 0; k < 80; k++) {
      const src = k % 2 ? files.mf : files.stl;
      const b = Uint8Array.from(src);
      for (let j = 0; j < 8; j++) b[Math.floor(rnd() * b.length)] = Math.floor(rnd() * 256);
      const code = await throwsCode(async () => { const r = await MI.readMeshFile(b, k % 2 ? 'x.3mf' : 'x.stl'); MI.repairMesh(r); });
      if (code !== null && !/^mesh\.err\./.test(code)) { bad++; if (bad < 4) console.log('    unexpected:', k, code); }
    }
    ok(bad === 0, '80 files with flipped bytes: read or refused with a reason, nothing else thrown');
  }

  section('meshes as bodies: the part');
  const { rep: clean } = await readFix(files.stl, 'ref.stl');
  const meshPart = (opts = {}) => {
    const part = P.newPart('Mesh');
    const f = P.addFeature(part, 'import', { file: 'ref.stl', mesh: MI.encodeMesh(clean), units: 'mm', up: 'z', op: 'add', report: clean.report, ...opts });
    return { part, f };
  };
  {
    const { part, f } = meshPart();
    const r = K.regenerate(part, M);
    ok(r.results.get(f.id).status === 'ok' && rel(r.stats.volume, VOL, 1e-6), 'built on the mesh kernel: the body\'s volume');
    ok(!('step' in f), 'addFeature leaves no STEP text on a body from a mesh');
    const bb = r.stats.bbox;
    ok(rel(bb.max[1] - bb.min[1], 25, 1e-6) && rel(bb.max[2] - bb.min[2], 30, 1e-6), 'Z up in the file → Y up here (25 high, 30 deep)');
    const flats = r.faces.filter((x) => x.name?.startsWith(f.id + '.flat:'));
    ok(flats.length >= 9 && r.faces.every((x) => x.type === 'plane') && !r.faces.some((x) => /cylinder/.test(x.type)), `its flat faces named (${flats.length} faces on ${new Set(flats.map((x) => x.name)).size} planes); the hole's facets are not faces`);
    const holeTris = [...r.mesh.triFace].filter((x) => x < 0).length;
    ok(holeTris > 40 && !r.mesh.edgeSegs, 'the hole\'s triangles stay unnamed (the view draws its own edges)');
    // the boss's top: the plane at file z 25 → y 25 here
    const cands = r.candidates.get(f.id);
    const top = cands.find((c) => c.frame.n[1] > 0.999 && Math.abs(c.frame.o[1] - 25) < 1e-4);
    ok(!!top && cands.length >= 9, 'flat faces are offered to sketches (the boss\'s top among them)');
    // a 4 × 4 square sketched on the boss's top about its centre (world x 30, z −15 → sketch 30, 15), cut 3 deep: 48 mm³
    const sk = S.newSketch(); S.addRect(sk, [28, 13], [32, 17]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: f.id, face: 'flat', entity: top.ref.entity }, sketch: sk });
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, op: 'cut', depth: 3 });
    const r2 = K.regenerate(part, M);
    const frame = r2.frames.get(s1.id);
    ok(r2.results.get(e1.id).status === 'ok' && frame && Math.abs(frame.o[1] - 25) < 1e-6, 'a sketch sits on the flat face (its frame on the boss\'s top)');
    ok(rel(VOL - r2.stats.volume, 48, 1e-6), `a 4 × 4 × 3 pocket in the boss: ${(VOL - r2.stats.volume).toFixed(4)} mm³ removed (48)`);
    // the file: version 5, read back, the same body; tampered meshes refused
    const text = P.toJSON(part);
    const j = JSON.parse(text);
    ok(j.version === 5 && P.VERSION === 5 && j.features[0].mesh.nt === clean.indices.length / 3, 'saved as version 5 (a 0.6 PartCraft refuses it by its version)');
    const back = P.readPart(text);
    const r3 = K.regenerate(back, M);
    ok(rel(r3.stats.volume, r2.stats.volume, 1e-9) && back.features[0].report.closed === true, 'read back: the same body, the repair report kept');
    const tamper = (fn) => { const q = JSON.parse(text); fn(q.features[0]); try { P.readPart(JSON.stringify(q)); return false; } catch (e) { return /mesh|units|operation/.test(e.message); } };
    ok(tamper((x) => { x.mesh.nt += 1; }) && tamper((x) => { x.mesh.i = x.mesh.i.slice(0, -8) + 'AAAAAAAA'.replace(/A/g, '/'); }) && tamper((x) => { x.mesh.v = x.mesh.v.slice(4); }) && tamper((x) => { x.units = 'parsec'; }) && tamper((x) => { x.op = 'melt'; }) && tamper((x) => { x.step = 'ISO-10303-21;'; }),
      'tampered meshes refused on open (a count, an index out of range, short data, units, operation, mesh and STEP together)');
    // the text form
    let sc = null;
    try { sc = SC.scriptToPart(SC.partToScript(part).text).part; } catch (e) { sc = e; }
    ok(sc && !(sc instanceof Error) && rel(K.regenerate(sc, M).stats.volume, r2.stats.volume, 1e-9), 'the text form (.pcscript) round trip keeps the mesh body' + (sc instanceof Error ? ': ' + sc.message : ''));
  }
  {
    const r = K.regenerate(meshPart({ units: 'cm' }).part, M), ry = K.regenerate(meshPart({ up: 'y' }).part, M);
    ok(rel(r.stats.volume, VOL * 1000, 1e-6) && rel(ry.stats.bbox.max[1] - ry.stats.bbox.min[1], 30, 1e-6), 'units cm: ×1000 the volume; up Y: kept as in the file (30 high)');
  }
  {
    // cut and intersect with a 20 × 10 × 50 block through the middle
    const mk = (op) => {
      const part = P.newPart('Cut');
      const s = S.newSketch(); S.addRect(s, [10, -30], [30, 0]);
      const bs = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: s });
      P.addFeature(part, 'extrude', { sketch: bs.id, depth: 50, end: 'mid' });
      P.addFeature(part, 'import', { file: 'ref.stl', mesh: MI.encodeMesh(clean), units: 'mm', up: 'z', op });
      return K.regenerate(part, M);
    };
    const block = M.Manifold.cube([20, 30, 50]).translate([10, -30, -25]);
    const body = (() => { const t = new M.Manifold(new M.Mesh({ numProp: 3, vertProperties: (() => { const q = new Float32Array(REF.positions.length); for (let i = 0; i < q.length; i += 3) { q[i] = REF.positions[i]; q[i + 1] = REF.positions[i + 2]; q[i + 2] = -REF.positions[i + 1]; } return q; })(), triVerts: REF.indices })); return t; })();
    const rc = mk('cut'), ri = mk('intersect'), ra = mk('add');
    ok(rel(rc.stats.volume, block.subtract(body).volume(), 1e-6) && rel(ri.stats.volume, block.intersect(body).volume(), 1e-6) && rel(ra.stats.volume, block.add(body).volume(), 1e-6), 'the body cuts, intersects and adds to a block (each to manifold\'s own answer)');
    ok(rc.faces.some((x) => /\.flat:/.test(x.name)) && rc.faces.some((x) => /\.side:|\.start|\.end/.test(x.name)), 'after the cut, both the block\'s faces and the mesh body\'s flat faces keep their names');
  }
  {
    // a linear pattern of the body: copies lose manifold's face ids (they are new originals) and are named by their geometry
    const { part, f } = meshPart();
    const pf = P.addFeature(part, 'lpattern', { seeds: [f.id], dir: { kind: 'world', axis: 'x' }, count: 3, spacing: 60 });
    const r = K.regenerate(part, M);
    ok(r.results.get(pf.id).status === 'ok' && rel(r.stats.volume, 3 * VOL, 1e-6) && r.faces.some((x) => (x.name || '').endsWith('#2')), 'a pattern of the body: three copies, the copies\' flat faces named (…#2)');
  }
  {
    // a mesh fillet on an edge between two of its flat faces (the block's top and its front)
    const { part, f } = meshPart();
    const r = K.regenerate(part, M);
    const e = r.edges.find((x) => x.type === 'line' && x.faces.every((nm) => nm.startsWith(f.id + '.flat:')) && Math.abs(x.a[1] - 20) < 1e-6 && Math.abs(x.b[1] - 20) < 1e-6 && Math.abs(x.a[2]) < 1e-6 && Math.abs(x.b[2]) < 1e-6);
    let okF = false, why = 'no edge';
    if (e) {
      const fl = P.addFeature(part, 'fillet', { edges: [{ faces: e.faces, at: e.at }], r: 2 });
      const r2 = K.regenerate(part, M);
      why = r2.results.get(fl.id).message || '';
      okF = r2.results.get(fl.id).status === 'ok' && rel(VOL - r2.stats.volume, (4 - Math.PI) * 40, 1e-2);   // the arc is faceted (64 a turn)
    }
    ok(okF, 'a mesh fillet (r 2) on the front top edge of the body: the volume removed is (4 − π) × 40 mm³ to the faceting' + (okF ? '' : ' — ' + why));
  }
  {
    // an open mesh: the feature says why
    const open = MI.repairMesh(mutate((q) => drop(q, facesOn(q, 2, 0))));
    const part = P.newPart('Open');
    const f = P.addFeature(part, 'import', { file: 'open.stl', mesh: MI.encodeMesh(open), units: 'mm', up: 'z', op: 'add', report: open.report });
    const r = K.regenerate(part, M);
    ok(r.results.get(f.id).status === 'error' && /does not close/.test(r.results.get(f.id).message) && !r.mesh, 'an open mesh: a feature error that says it does not close (with the counts), no body');
  }
  {
    // a big body: a sphere of ~200 k triangles through read → repair → build (VPS, capped: timings for the log only)
    const sph = M.Manifold.sphere(50, 320);
    const sg = sph.getMesh();
    const big = u8(X.stlBinary({ positions: Float32Array.from(sg.vertProperties), indices: Uint32Array.from(sg.triVerts) }, 'sphere'));
    const t0 = performance.now();
    const rd = await MI.readMeshFile(big, 'sphere.stl');
    const t1 = performance.now();
    const rp = MI.repairMesh(rd);
    const t2 = performance.now();
    const part = P.newPart('Big');
    P.addFeature(part, 'import', { file: 'sphere.stl', mesh: MI.encodeMesh(rp), units: 'mm', up: 'z', op: 'add', report: rp.report });
    const t3 = performance.now();
    const r = K.regenerate(part, M);
    const t4 = performance.now();
    const ntri = sg.triVerts.length / 3;
    ok(rp.report.closed && rel(r.stats.volume, sph.volume(), 1e-5) && r.stats.faces === 0, `a ${Math.round(ntri / 1000)} k triangle sphere: closed, its volume, no flat faces`);
    console.log(`    timings (VPS, capped; load ${os.loadavg()[0].toFixed(1)}): read ${(t1 - t0).toFixed(0)} ms, repair ${(t2 - t1).toFixed(0)} ms, encode ${(t3 - t2).toFixed(0)} ms, build ${(t4 - t3).toFixed(0)} ms, file ${(P.toJSON(part).length / 1048576).toFixed(1)} MB`);
    sph.delete();
  }
  K.clearCheckpoints();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runMeshImportTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
