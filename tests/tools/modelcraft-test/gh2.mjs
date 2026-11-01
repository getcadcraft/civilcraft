#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gh2.mjs — known answers for the modifier stack on a group or component (0.8 GH.2, session model-08; group-mods.js, the
 * kernel's isStacked / bakeModifiers; GitHub modelcraft#4, draft PR #5). The lamp of the issue: a shade whose proportions and
 * repeated parts follow a recipe that keeps the source.
 *
 *   node tools/modelcraft-test/gh2.mjs      on its own
 *   run({ok, close, section, APP})          from bin/test-modelcraft.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run({ ok, close, section, APP }) {
  const imp = (f) => import(pathToFileURL(path.join(APP, f)));
  const I18N = await imp('i18n.js');
  if (!I18N.t('app.gmod.bad').includes(' ')) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const M = await imp('model.js'), G = await imp('group-mods.js'), MD = await imp('mesh/modifiers.js'), V = await imp('vec.js');
  M.setMeshHooks({ clean: MD.cleanMods, cleanGroup: G.cleanGroup });
  const J = (x) => JSON.stringify(x);

  /** A model with a 1 m cube as a component "Shade" placed once; → {m, src (def id), iid}. */
  const cube = (w = 1, d = 1, h = 1, name = 'Shade') => {
    const m = new M.Model();
    m.change('box', (mm) => { M.addPolygon(mm.root, [[0, 0, 0], [w, 0, 0], [w, d, 0], [0, d, 0]], [0, 0, 1]); M.pushPull(mm.root, [...mm.root.faces.keys()].at(-1), h); });
    const iid = m.change('group', (mm) => mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'component', name));
    return { m, iid, src: m.root.insts.get(iid).def };
  };
  const stack = (m, iid, ops) => m.change('stack', (mm) => {
    const src = mm.def(mm.root.insts.get(iid).def);
    const out = G.modifierDef(mm, src, ops);
    mm.root.insts.get(iid).def = out.id;
    return out.id;
  });
  const X = (m) => { const b = m.bbox(m.root, V.IDENT); return [b.min[0], b.max[0]]; };
  const item = (type, params) => ({ ...MD.newMod(type), params: { ...MD.newMod(type).params, ...params } });
  const array = (count, abs) => item('array', { count, rel: [0, 0, 0], abs });

  section('Group modifier stack (0.8 GH.2): order matters');
  {
    // the PR's example: a 1 m box; Array 3 copies 3 m apart then red Scale 2 → 14 m; reversed → 8 m
    const a = cube(); const id = stack(a.m, a.iid, [array(3, [3, 0, 0]), item('scale', { factors: [2, 1, 1] })]);
    ok(close(X(a.m)[1] - X(a.m)[0], 14, 1e-9), `Array then Scale: ${J(X(a.m))} is 14 m wide`);
    const b = cube(); stack(b.m, b.iid, [item('scale', { factors: [2, 1, 1] }), array(3, [3, 0, 0])]);
    ok(close(X(b.m)[1] - X(b.m)[0], 8, 1e-9), `Scale then Array: ${J(X(b.m))} is 8 m wide`);
    ok(a.m.def(id).insts.size === 3 && a.m.def(id).mods.src === a.src, 'the result holds three placements of the source');
    const edge = a.m.defs.size;
    ok(a.m.defs.get(a.src).faces.size === 6, 'the source geometry is untouched');
    // relative step: rel 1 touches (a 1 m box → 1 m step); after a scale it follows the scaled size
    const r = cube(); stack(r.m, r.iid, [item('scale', { factors: [3, 1, 1] }), item('array', { count: 2, rel: [1, 0, 0], abs: [0, 0, 0] })]);
    ok(close(X(r.m)[1], 6, 1e-9), 'rel 1 after a ×3 scale steps by the scaled size: 2 copies reach 6 m');
    // disabled items are skipped
    const e = cube(); stack(e.m, e.iid, [{ ...array(5, [1, 0, 0]), on: false }, item('scale', { factors: [2, 2, 2] })]);
    ok(close(X(e.m)[1], 2, 1e-9), 'an item that is off does nothing');
  }

  section('The lamp of the issue: change the recipe, the shape follows');
  {
    // a 0.3 m shade, repeated 3 times 0.5 m apart, proportions first: tall and narrow, then edited
    const L = cube(0.3, 0.3, 0.3, 'Shade');
    const id = stack(L.m, L.iid, [item('scale', { factors: [1, 1, 2] }), array(3, [0.5, 0, 0])]);
    const size = () => { const b = L.m.bbox(L.m.root, V.IDENT); return [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]].map((v) => +v.toFixed(6)); };
    ok(J(size()) === J([1.3, 0.3, 0.6]), `shade 0.3 × 0.3 × 0.6, three of them: ${J(size())}`);
    L.m.change('proportions', (mm) => { const ops = structuredClone(mm.def(id).mods.ops); ops[0].params.factors = [1, 1, 3]; ops[1].params.count = 4; G.setModifiers(mm, mm.def(id), ops); });
    ok(J(size()) === J([1.8, 0.3, 0.9]), `taller shade and a fourth one: ${J(size())}`);
    L.m.undo();
    ok(J(size()) === J([1.3, 0.3, 0.6]), 'undo goes back to the first recipe');
  }

  section('Group modifier stack: the source stays live');
  {
    const a = cube(); const id = stack(a.m, a.iid, [array(3, [3, 0, 0])]);
    const before = J(a.m.def(id).insts);
    a.m.change('push', (mm) => { const top = [...mm.def(a.src).faces].find(([, f]) => Math.abs(M.faceNormal(mm.def(a.src), f)[2] - 1) < 1e-6)[0]; M.pushPull(mm.def(a.src), top, 1); });
    const bb = a.m.bbox(a.m.root, V.IDENT);
    ok(close(bb.max[2], 2, 1e-9) && J(a.m.def(id).insts) === before, 'push/pull the source: every copy gets taller, the placements need no re-evaluation');
    ok(close(a.m.bbox(a.m.root, V.IDENT).max[0], 7, 1e-9), 'and the row is still 7 m long');
  }

  section('Group modifier stack: file, undo, copies');
  {
    const a = cube(); const id = stack(a.m, a.iid, [array(3, [3, 0, 0]), item('scale', { factors: [2, 1, 1] })]);
    const file = JSON.parse(JSON.stringify(a.m.toJSON()));
    ok(file.defs.find((d) => d.id === id).mods.src === a.src && file.defs.find((d) => d.id === id).mods.ops.length === 2, 'the file holds the recipe on the derived definition');
    const b = new M.Model(); b.load(file);
    ok(M.isStacked(b.def(id)) && J(b.def(id).mods.ops) === J(a.m.def(id).mods.ops) && close(X(b)[1] - X(b)[0], 14, 1e-9), 'it opens again with the same recipe and size');
    // purge keeps the source of a live stack
    b.purge();
    ok(b.defs.has(a.src), 'Purge unused keeps the source');
    // a reader that does not know the hook keeps the stack as plain data, and still shows placements
    M.setMeshHooks({ cleanGroup: null });
    const c = new M.Model(); c.load(JSON.parse(JSON.stringify(file)));
    ok(M.isStacked(c.def(id)) && c.def(id).insts.size === 3 && J(JSON.parse(JSON.stringify(c.toJSON())).defs.find((d) => d.id === id).mods) === J(file.defs.find((d) => d.id === id).mods), 'without the hook (another app) the recipe is kept untouched and the placements still show');
    M.setMeshHooks({ cleanGroup: G.cleanGroup });
    // undo
    a.m.undo(); ok(!M.isStacked(a.m.def(a.m.root.insts.get(a.iid).def)), 'one undo takes the stack away');
    a.m.redo(); ok(M.isStacked(a.m.def(a.m.root.insts.get(a.iid).def)) && close(X(a.m)[1] - X(a.m)[0], 14, 1e-9), 'and redo puts it back');
    // change an item = one undo step
    const sid = a.m.root.insts.get(a.iid).def;
    a.m.change('edit', (mm) => G.setModifiers(mm, mm.def(sid), [array(2, [3, 0, 0])]));
    ok(a.m.def(sid).insts.size === 2 && close(X(a.m)[1], 4, 1e-9), 'changing the stack is one change');
    a.m.undo(); ok(a.m.def(sid).insts.size === 3, 'and one undo');
    // invalid input rolls back
    let threw = false; try { a.m.change('bad', (mm) => G.setModifiers(mm, mm.def(sid), [array(40, [1, 0, 0]), array(40, [0, 1, 0])])); } catch { threw = true; }
    ok(threw && a.m.def(sid).insts.size === 3, 'too many copies is refused and nothing changes');
    threw = false; try { a.m.change('bad', (mm) => G.setModifiers(mm, mm.def(sid), [item('bevel', {})])); } catch { threw = true; }
    ok(threw, 'a type a group cannot take (bevel) is refused');
    // copy / paste / unique
    const clip = a.m.copyClip([], [{ t: 'i', id: a.iid }]);
    const sel = a.m.pasteClip([], clip, V.translation([0, 10, 0]));
    const pasted = a.m.def(a.m.root.insts.get(sel[0].id).def);
    ok(sel.length === 1 && M.isStacked(pasted) && pasted.mods.src && a.m.defs.has(pasted.mods.src), 'copy and paste carry the stack and its source');
    const d2 = new M.Model(); d2.load(JSON.parse(JSON.stringify(a.m.toJSON())));
    const second = d2.root.insts.get(a.iid);
    const dup = d2.change('dup', (mm) => mm.place(mm.root, second.def, V.translation([0, 20, 0])));
    d2.change('unique', (mm) => mm.makeUnique(mm.root, dup));
    const u = d2.def(d2.root.insts.get(dup).def);
    ok(M.isStacked(u) && u.id !== second.def && u.mods.src === d2.def(second.def).mods.src && u.insts.size === 3, 'Make unique copies the recipe and keeps the same source');
  }

  section('Group modifier stack: guards and Bake');
  {
    const a = cube(); const id = stack(a.m, a.iid, [array(3, [3, 0, 0])]);
    const must = (fn, what) => { let e = null; try { a.m.change('x', fn); } catch (err) { e = err; } ok(e && /Bake/i.test(e.message), what + (e ? '' : ' (nothing thrown)')); };
    must((mm) => mm.explode(mm.root, a.iid), 'Explode the result: bake first');
    must((mm) => mm.setDefSize(id, 0, 5), 'Resize the result: bake first');
    const D = await imp('dynamic.js');
    must((mm) => D.stretchDef(mm, mm.def(id), [5, 1, 1], 'S'), 'Stretch the result: bake first');
    const before = a.m.root.insts.size;
    a.m.change('bake', (mm) => mm.bakeModifiers(id));
    const baked = a.m.def(id);
    ok(!M.isStacked(baked) && baked.faces.size === 18 && baked.insts.size === 0 && close(X(a.m)[1], 7, 1e-9), 'Bake: independent geometry (3 × 6 faces), no placements, the same size');
    ok(a.m.defs.get(a.src).faces.size === 6 && a.m.root.insts.size === before, 'the source and the placement stay');
    a.m.undo(); ok(M.isStacked(a.m.def(id)), 'one undo brings the stack back');
    a.m.redo(); ok(!M.isStacked(a.m.def(id)) && a.m.def(id).faces.size === 18, 'and redo bakes again');
    const bad = new M.Model();
    let thr = false; try { bad.load({ format: 'modelcraft', version: 1, units: 'm', nextId: 1, defs: [{ id: 'root', kind: 'root', name: 'M', next: 1, verts: [], edges: [], faces: [], insts: [{ id: 1, def: 'd1', m: V.IDENT }] }, { id: 'd1', kind: 'component', name: 'A', next: 1, mods: { src: 'd1', ops: [] }, verts: [], edges: [], faces: [], insts: [] }] }); } catch { thr = true; }
    ok(thr, 'a file whose stack is its own source is refused');
  }

  section('The mesh stack still works, and scale is one more item');
  {
    const md = MD.MODS;
    ok(md.scale && J(md.scale.defaults) === '{"factors":[1,1,1]}' && J(MD.cleanMods([{ type: 'scale', params: { factors: [2, 'x', 0] } }])[0].params.factors) === '[1,1,1]', 'scale is in the shared registry; bad factors fall back');
    ok(J(G.cleanGroupOps([item('scale', {}), item('bevel', {}), item('array', { mode: 'radial' }), item('mirror', {})]).map((i) => i.type)) === '["scale"]', 'a group keeps scale and linear array only');
    const Mesh = (await imp('mesh.js')).Mesh;
    const mesh = Mesh.fromLists([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], [[0, 1, 2, 3]]);
    const out = MD.applyMod(mesh, { type: 'scale', on: true, params: { factors: [2, 3, 1] } });
    const b = out.bounds();
    ok(close(b.max[0], 2) && close(b.max[1], 3), 'a mesh scaled by the same item: 1 × 1 becomes 2 × 3');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
  const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
  await run({ ok, close, section: (s) => console.log('\n== ' + s), APP: path.join(ROOT, 'public_html/assets/apps/modelcraft/dev') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
