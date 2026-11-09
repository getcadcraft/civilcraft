#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-fix09.mjs — ModelCraft 0.9 final fixes, the Node part (session model-fix-09; the browser part is browser-fix09.mjs):
 *   FX.30 Push/Pull and Move that stop "where it touches" say what they touch (collide.js clamp().by: path and the faces near);
 *         a D-shaped face offset inward and pushed back down is no longer stopped by the walls of its own solid
 *         (pieceOf: the piece joins through faces, not edges only)
 *   FX.31 the timeline can toggle play (togglePlay / playing), the Animate toolbar's Play shows Pause (ws-animate toolState),
 *         camera.play is a registered command
 *
 *   node tools/modelcraft-test/test-fix09.mjs [--build dev|x.y]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const bi = process.argv.indexOf('--build');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft', bi > 0 ? process.argv[bi + 1] : 'dev');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const I18N = await import(path.join(APP, 'i18n.js'));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await import(path.join(APP, 'model.js'));
const { Model, addPolygon, rectPts, pushPull, solidInfo, faceNormal } = M;
const { Camera } = await import(path.join(APP, 'camera.js'));
const { sceneOf } = await import(path.join(APP, 'infer.js'));
const { Tools, pieceOf } = await import(path.join(APP, 'tools.js'));
const { collider } = await import(path.join(APP, 'collide.js'));

console.log('== FX.30 what a stop touches');
{
  const m = new Model();
  m.units = 'm';
  const mk = (x0, name) => m.change('b', (mm) => {
    addPolygon(mm.root, rectPts([x0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 1), [0, 0, 1]);
    const f = [...mm.root.faces.keys()].pop(); pushPull(mm.root, f, 1);
    const id = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group');
    mm.def(mm.root.insts.get(id).def).name = name;
    return id;
  });
  const a = mk(0, 'Box A'), b = mk(3, 'Box B');
  const c = collider(sceneOf(m), { moving: (o) => o.path[0] === a });
  const r = c.clamp([4, 0.2, 0.2]);
  ok(r.hit && close(r.delta[0], 2, 1e-3), 'Box A stops at Box B (' + r.delta[0].toFixed(4) + ' of 4)');
  ok(r.by && r.by.path.length === 1 && r.by.path[0] === b, 'the clamp says what stopped it: the path of Box B');
  ok(m.placementAt(r.by.path).inst && m.defs.get(m.placementAt(r.by.path).inst.def).name === 'Box B', 'the path gives the name Box B');
  ok(r.by.tris.length >= 1 && r.by.tris.every(([p, q, s]) => [p, q, s].every((v) => v.length === 3 && v.every(Number.isFinite))), 'and the triangles to highlight (' + r.by.tris.length + ')');
  ok(r.by.tris.every((t) => t.every((p) => p[0] >= 3 - 1e-6)), 'all of them are Box B\'s');
  const free = c.clamp([0, 5, 0]);
  ok(!free.hit && free.by === undefined, 'a move that is not stopped has no "by"');
}

console.log('== FX.30 the D-shaped offset case (a rebuild from the report)');
{
  // a D prism (2 m wide straight part + a half round, 3 m deep, 2 m tall), its top offset inward 0.3, the inner face pushed down
  const m = new Model();
  m.units = 'm';
  const D = [[0, 0, 0], [2, 0, 0]];
  for (let i = 1; i < 12; i++) { const an = -Math.PI / 2 + Math.PI * i / 12; D.push([2 + 1.5 * Math.cos(an), 1.5 + 1.5 * Math.sin(an), 0]); }
  D.push([2, 3, 0], [0, 3, 0]);
  m.change('d', (mm) => { addPolygon(mm.root, D, [0, 0, 1]); pushPull(mm.root, [...mm.root.faces.keys()].pop(), 2); });
  const def = m.root;
  const top = [...def.faces].find(([, f]) => faceNormal(def, f)[2] > 0.99 && def.verts.get(f.loops[0][0])[2] > 1.9)[0];
  let inner = null;
  m.change('off', () => { inner = M.offsetFace(def, top, 0.3).face; });
  ok(inner !== null, 'the offset made an inner face');
  const piece = pieceOf(def, inner);
  ok(piece.filter((s) => s.t === 'f').length === def.faces.size, 'the piece of the inner face is the whole solid (' + piece.filter((s) => s.t === 'f').length + ' of ' + def.faces.size + ' faces)');
  const old = M.connected(def, [{ t: 'f', id: inner }]);
  ok(old.filter((s) => s.t === 'f').length < def.faces.size, 'edges alone gave only part of it (' + old.filter((s) => s.t === 'f').length + '): the cause');
  const cam = new Camera(); cam.setSize(1000, 800); cam.eye = [8, -10, 8]; cam.target = [1.5, 1.5, 1]; cam.clip(30);
  let cache = null;
  const host = { model: m, cam, path: [], sel: [], units: 'm', msgs: [], scene() { if (!cache || cache.version !== m.version) cache = sceneOf(m); return cache; }, setSel(s) { host.sel = s; }, overlay() {}, tip() {}, vcb() {}, print(x) { host.msgs.push(x); }, changed() {}, openContext() {}, closeContext() {} };
  const T = new Tools(host);
  T.collide = true;
  const v0 = solidInfo(m.root).volume, pocketArea = M.faceArea(def, def.faces.get(inner));
  T.set('push');
  const fp = cam.project([1, 1.5, 2]);
  T.click(fp[0], fp[1], { time: 1 });
  T.value('-1.5');
  const info = solidInfo(m.root);
  ok(info.closed && close(info.volume, v0 - pocketArea * 1.5, 0.01), 'pushing the inner face down 1.5 m is not stopped: a pocket 1.5 m deep (volume ' + info.volume?.toFixed(3) + ')');
}
console.log('== FX.31 play and pause');
{
  const { registerWorkspace } = await import(path.join(APP, 'workspaces.js')).then((x) => x);
  void registerWorkspace;
  const reg = await import(path.join(APP, 'input-modelcraft.js'));
  const cmd = reg.COMMANDS.find((c) => c.id === 'camera.play');
  ok(cmd && cmd.sel === '[data-tl-play]' && cmd.keyOnly && cmd.defKeys.length === 0, 'camera.play is a command (the timeline\'s own Play button, no default key: Space is the app\'s)');
  const en = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  ok(en['input.cmd.camera.play'] && en['app.tl.pause.title'], 'its words are in the English catalog');
  const src = fs.readFileSync(path.join(APP, 'ws-animate.js'), 'utf8');
  ok(/togglePlay\(\)/.test(src) && /icon: 'pause-fill'/.test(src), 'the Animate workspace toggles play and shows the pause icon while it plays');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
