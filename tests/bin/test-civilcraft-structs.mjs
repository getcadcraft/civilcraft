#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-structs.mjs — CivilCraft 0.6 WL.27: the structure builder (structs.js; the plan, 3D and LandXML of
 * structure types), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-structs.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * By hand: a 48" round manhole with a 5" wall (outside 58" = 736.6 mm radius), a 36" × 48" rectangular inlet; untrusted
 * types; the plan symbol in mm; the library item checked by LibraryCraft's own rules three ways — BimCraft's libitem.js
 * validateItem (the canonical JS), the site's PHP LibraryItemFormat::validate, and the server's converter
 * (tools/library/convert.mjs, kind "item", with its preview) — its 3D body a closed solid facing out with the volume of
 * the outside shape × (depth + slab); read back exactly in feet, and in a metre project (48" → 1219.2 mm); items that are
 * not ours refused with the reason; a network with both types: the plan's rectangle along the outlet pipe and the pipe
 * starting at its wall, the 3D view's box, LandXML RectStruct / CircStruct thickness (1.2 XSD) read back as types; the
 * project file keeps types and drops a dangling one.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const ST = await mod('structs.js');
const PJ = await mod('project.js');
const SC = await mod('scene.js');
const S3 = await mod('site3d.js');
const LX = await mod('landxml.js');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + msg); } else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra).slice(0, 600) : '')); } };
const near = (a, b, tol, msg) => ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol, msg, { got: a, want: b });
const head = (s) => console.log('== ' + s);
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-structs') : fs.mkdtempSync(path.join(os.tmpdir(), 'cv-structs-'));
fs.mkdirSync(OUT, { recursive: true });
const PY = path.join(TOOLS, 'venv/bin/python');

const MH = { id: 'u1', name: 'MH-48', kind: 'manhole', shape: 'round', dia: 48, wall: 5, base: 6, sump: 0.5, depth: 6, frame: { shape: 'round', dia: 24, h: 6 } };
const IN = { id: 'u2', name: 'CB 3x4', kind: 'inlet', shape: 'rect', w: 36, l: 48, wall: 6, base: 8, sump: 1, depth: 5, frame: { shape: 'rect', w: 24, l: 36, h: 4 } };

head('types');
{
  const c = ST.cleanType(MH, 'ft');
  ok(c && c.id === 'u1' && c.dia === 48 && c.frame.dia === 24, 'a round type cleans as it is');
  ok(ST.cleanType({ ...MH, dia: -4 }, 'ft') === null && ST.cleanType({ ...IN, w: 0 }, 'ft') === null && ST.cleanType({ ...MH, dia: 1e6 }, 'ft') === null, 'no size, a negative or a huge one: refused');
  const j = ST.cleanType({ ...MH, id: 'k3', kind: 'castle', shape: 'hex', frame: { shape: 'round', dia: 'x' }, name: '\u0001bad\u0002' }, 'ft');
  ok(j && j.id === null && j.kind === 'manhole' && j.shape === 'round' && j.frame === null && j.name === 'bad', 'junk kind / shape / frame / id / control characters cleaned', j);
  ok(ST.cleanType({ shape: 'round', dia: 48 }, 'ft').name === '48" round manhole, 5" wall', 'a type with no name is named from its sizes');
  const net = { types: [MH, IN] };
  const g = ST.structGeom({ dia: 1, type: 'u1' }, net, 'ft');
  near(g.inW, 4, 1e-12, 'round: inside 4 ft'); near(g.outW, 58 / 12, 1e-12, 'outside 58" = 4.833 ft'); near(g.frame.w, 2, 1e-12, 'frame opening 2 ft');
  const r = ST.structGeom({ dia: 1, type: 'u2' }, net, 'ft');
  ok(r.shape === 'rect' && Math.abs(r.inW - 3) < 1e-12 && Math.abs(r.inL - 4) < 1e-12 && Math.abs(r.outL - 5) < 1e-12, 'rect: inside 3 × 4 ft, outside length 5 ft');
  const n0 = ST.structGeom({ dia: 30 }, net, 'ft');
  ok(n0.shape === 'round' && Math.abs(n0.inW - 2.5) < 1e-12 && n0.type === null, 'no type: round, its own diameter');
  const a = ST.applyType({ id: 's1', dia: 30, sumpDepth: 0 }, IN);
  ok(a.type === 'u2' && a.dia === 36 && a.sumpDepth === 1, 'assigning sets the size and the sump');
  ok(!('type' in ST.applyType(a, null)) && ST.applyType(a, null).dia === 36, 'no type again: keeps its size');
}

head('the plan symbol and the library item');
const items = {};
{
  const p = ST.typePlan(MH, 'ft');
  const [outer, inner, frame] = p.entities;
  near(outer.r, 736.6, 1e-6, 'outside wall circle r 736.6 mm (58" / 2)'); near(inner.r, 609.6, 1e-6, 'inside 609.6'); near(frame.r, 304.8, 1e-6, 'frame opening 304.8');
  ok(outer.layer === 'STRUCTURE' && inner.layer === 'STRUCTURE-DETAIL' && frame.layer === 'FRAME', 'layers: outline, detail, frame');
  const q = ST.typePlan(IN, 'ft').entities[0];
  ok(q.type === 'poly' && Math.abs(q.pts[1][0] - 60 * 25.4 / 2) < 1e-6 && Math.abs(q.pts[2][1] - 48 * 25.4 / 2) < 1e-6, 'rect outline: 60" along X, 48" across', q.pts);
  for (const k of [MH, IN]) items[k.id] = ST.typeItem(k, 'ft');
  // BimCraft's libitem.js (the canonical item rules) and the site's checks are not in CivilCraft's public repo: skipped there
  const LIB = path.join(REPO, 'public_html/assets/apps/bimcraft/dev/libitem.js');
  const LI = fs.existsSync(LIB) ? await import(pathToFileURL(LIB).href) : null;
  if (!LI) console.log('  (no BimCraft libitem.js in this checkout: the library item rules are checked on the site only)');
  for (const [id, it] of Object.entries(items)) {
    if (LI) {
      const v = LI.validateItem(it, { partial: true });
      ok(v.ok, id + ': libitem.js validateItem (partial) accepts the item', v.errors);
      ok(!LI.validateItem(it).ok, id + ': and wants uuid/version/license only when not partial (the library fills those)');
    }
    // the body: a closed solid, faces out, volume = outside area × (depth + slab)
    const P = it.body.positions, I = it.body.indices;
    let vol = 0;
    for (let i = 0; i < I.length; i += 3) {
      const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3;
      vol += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
    }
    const k = id === 'u1' ? MH : IN, H = k.depth * 1200000 / 3937 + k.base * 25.4;
    const area = id === 'u1' ? 0.5 * 48 * (736.6 ** 2) * Math.sin((2 * Math.PI) / 48) : (60 * 25.4) * (48 * 25.4);
    near(vol, area * H, area * H * 1e-9, id + ': body volume = outside area × (depth + slab), positive = faces out');
    near(Math.min(...P.filter((_, j) => j % 3 === 2)), -H, 1e-6, id + ': body from the slab\'s underside up to the rim at z 0');
    const file = path.join(OUT, id + '.item.json');
    fs.writeFileSync(file, JSON.stringify(it));
  }
  // the site's PHP validator (LibraryItemFormat, the rule-for-rule twin)
  if (fs.existsSync(path.join(REPO, 'public_html/core/bootstrap.php'))) try {
    const php = `require '${REPO}/public_html/core/bootstrap.php'; foreach (array_slice($argv, 1) as $f) { $r = LibraryItemFormat::validate(json_decode(file_get_contents($f), true), true); echo json_encode($r), "\\n"; }`;
    const res = execFileSync('php', ['-r', php, ...Object.keys(items).map((id) => path.join(OUT, id + '.item.json'))], { encoding: 'utf8', env: { ...process.env, CC_NO_SESSION: '1' } }).trim().split('\n').map((l) => JSON.parse(l));
    ok(res.length === 2 && res.every((r) => r.ok === true || (Array.isArray(r) && !r.length) || r.errors?.length === 0), 'PHP LibraryItemFormat::validate (partial) accepts both', res);
  } catch (e) { console.log('  (PHP validator not run: ' + String(e.message).split('\n')[0] + ')'); }
  // the server's converter, kind "item"
  for (const id of fs.existsSync(path.join(REPO, 'tools/library/convert.mjs')) ? Object.keys(items) : []) {
    const o = JSON.parse(execFileSync('node', [path.join(REPO, 'tools/library/convert.mjs'), path.join(OUT, id + '.item.json'), path.join(OUT, 'conv-' + id)], { encoding: 'utf8' }));
    ok(o.ok && o.items?.length === 1 && fs.existsSync(o.items[0].preview || path.join(path.dirname(o.items[0].path), 'preview.svg')), id + ': LibraryCraft\'s converter takes it as an item and draws its preview', o);
  }
}

head('library items back');
{
  const r = ST.typeFromItem(items.u1, 'ft');
  const same = (a, b) => ['kind', 'shape', 'dia', 'w', 'l', 'wall', 'base', 'sump', 'depth'].every((k) => (a[k] === undefined && b[k] === undefined) || Math.abs(a[k] - b[k]) < 1e-9 || a[k] === b[k]) && JSON.stringify(a.frame && Object.keys(a.frame).sort()) === JSON.stringify(b.frame && Object.keys(b.frame).sort());
  ok(r.type && same(r.type, MH) && r.type.name === 'MH-48', 'the round type back exactly', r.type);
  const r2 = ST.typeFromItem(items.u2, 'ft');
  ok(r2.type && same(r2.type, IN), 'the rectangular type back exactly', r2.type);
  const m = ST.typeFromItem(items.u1, 'm');
  near(m.type.dia, 1219.2, 1e-9, 'in a metre project: 48" = 1219.2 mm'); near(m.type.depth, 6 * 1200 / 3937, 1e-9, 'depth 6 US survey ft in metres');
  ok(ST.typeFromItem({ ...items.u1, source_attrs: {} }, 'ft').type === null && /not a structure/.test(ST.typeFromItem({ ...items.u1, source_attrs: {} }, 'ft').why), 'a library item that is not ours: refused, said');
  ok(/not a CadCraft library item/.test(ST.typeFromItem({ a: 1 }, 'ft').why), 'not an item at all: said');
  ok(ST.typeFromItem({ ...items.u1, source_attrs: { ...items.u1.source_attrs, 'CC-STRUCT-DIA-MM': '-5' } }, 'ft').type === null, 'a tampered size: refused');
}

head('a network with both types');
{
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -100; x <= 300; x += 50) for (let y = -100; y <= 100; y += 50) pts.push({ n: String(n++), x, y, z: 100 - x * 0.01, d: 'GND' });
  p.setPoints(pts, 'ground');
  p.change('net', (s) => {
    s.network = { name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 }, types: [MH, IN],
      structures: [ST.applyType({ id: 's1', name: 'CB-1', x: 0, y: 0, rim: null, sumpDepth: 0, dia: 48 }, IN), ST.applyType({ id: 's2', name: 'MH-1', x: 100, y: 100, rim: null, sumpDepth: 0, dia: 48 }, MH)],
      pipes: [{ id: 'q1', name: 'P-1', from: 's1', to: 's2', dia: 15, invUp: 93, invDn: 91.5 }] };
  });
  const st = p.state, sc = SC.planScene({ units: 'ft', network: { net: st.network, check: p.networkCheck() } }, { mmPerUnit: 1 / 40 * 304.8 / 1 });
  const polys = sc.items.filter((it) => it.layer === 'C-STRM-STRC' || it.layer === 'C-STRM-PROB');
  const rect = polys.find((it) => it.pts.length === 4), circ = polys.find((it) => it.pts.length === 25);
  ok(rect && circ, 'plan: the inlet is a rectangle, the manhole a circle');
  const e1 = Math.hypot(rect.pts[1].x - rect.pts[0].x, rect.pts[1].y - rect.pts[0].y), ang = Math.atan2(rect.pts[1].y - rect.pts[0].y, rect.pts[1].x - rect.pts[0].x);
  near(e1, 5, 1e-9, 'its long side 5 ft (60" outside)'); near(ang, Math.PI / 4, 1e-9, 'along the outlet pipe (45°)');
  near(Math.hypot(circ.pts[0].x - 100, circ.pts[0].y - 100), 58 / 24, 1e-9, 'the manhole drawn at its outside radius');
  const pipe = sc.items.find((it) => it.layer === 'C-STRM-PIPE' || (it.kind === 'poly' && it.pts.length === 2 && it.layer?.startsWith('C-STRM')));
  near(Math.hypot(pipe.pts[0].x, pipe.pts[0].y), 2.5, 1e-9, 'the pipe starts at the inlet\'s end wall (its outlet: half the 5 ft outside length)');
  near(Math.hypot(pipe.pts[1].x - 100, pipe.pts[1].y - 100), 58 / 24, 1e-9, 'and ends at the manhole\'s outside wall');
  const scene = S3.buildSite3D(S3.siteInput(p), { exag: 1 });
  const sm = scene.meshes.find((m) => m.key === 'structures');
  ok(sm && sm.owners.length === 2 && sm.indices.length / 3 === 12 + 24 * 4, '3D: a box (12 triangles) and a capped cylinder', sm && [sm.owners.length, sm.indices.length / 3]);
  const xml = LX.writeLandXml({ name: 'net', units: 'ft', networks: [{ ...st.network, structures: st.network.structures.map((x) => ({ ...x, rimShown: 100, sump: 90 })) }] });
  ok(/<RectStruct length="48" width="36" thickness="6" desc="CB 3x4"\/>/.test(xml) && /<CircStruct diameter="48" thickness="5" desc="MH-48"\/>/.test(xml), 'LandXML: RectStruct and CircStruct with wall thickness and the type name');
  const f = path.join(OUT, 'net.xml');
  fs.writeFileSync(f, xml);
  if (fs.existsSync(PY)) {
    const c = JSON.parse(execFileSync(PY, [path.join(TOOLS, 'check.py'), 'landxml', f], { encoding: 'utf8' }));
    ok(c.schema === 'valid' || c.schema === 'skipped', 'LandXML 1.2 XSD: ' + c.schema, c.schema_errors);
  }
  const back = LX.readLandXml(xml).networks[0];
  ok(back.structures[0].shapeIn?.shape === 'rect' && back.structures[0].shapeIn.l === 48 && back.structures[1].shapeIn?.wall === 5, 'read back: the shapes come with the structures (the app makes types of them)', back.structures.map((x) => x.shapeIn));
  // the project file: types kept, a dangling type dropped
  const j = p.toJSON();
  j.network.structures.push({ id: 's9', name: 'X', x: 5, y: 5, rim: null, sumpDepth: 0, dia: 48, type: 'u77' });
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(j))).project;
  ok(q.state.network.types.length === 2 && q.state.network.structures[0].type === 'u2' && !('type' in q.state.network.structures[2]), 'the project file keeps the types and drops a type that is not there');
  ok(q.state.seq > 2, 'type ids count toward the next id');
}

if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
