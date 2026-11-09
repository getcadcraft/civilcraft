#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-iges-solid.mjs — cc-nurbs 0.9 SU.747c (session nurbs-s3-09, owner's order 2026-11-06): a solid written to IGES as ONE manifold solid B-rep
 * (186 -> 514 -> 510 -> 508 -> 504 -> 502) and read back as a solid. The structure is checked by a second, independent small parser written here
 * from IGES 5.3 § 4.49, 4.143-4.147 (pointer types, indexes in range, every edge used exactly twice once each way once the face-uses are applied).
 * No IGES reader of another program exists in this repo (the vendored OpenCascade exports only its STEP reader), so that is the limit of the proof.
 *   node tools/nurbs/test-iges-solid.mjs [--verbose]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as N from '../../lib/nurbs/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, failN = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' — ' + x : '')); } else { failN++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.abs(b);
const code = (f) => { try { f(); return null; } catch (e) { return e && e.code ? e.code : String(e); } };
const f4 = (x) => (Math.round(x * 1e4) / 1e4).toString();
const log = (m) => console.log('  ' + m);
const section = (n) => console.log('== ' + n);
const mod = await import(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await (mod.default || mod)(); M.setup();
const { solid: B, blend: BL } = N;

/** An independent reader of the topology part of an IGES file: DE number → { type, form, P (strings) }. */
function parse(text) {
  const L = text.split('\n').filter((l) => l.length >= 73), sec = { D: [], P: [] };
  for (const l of L) if (sec[l[72]]) sec[l[72]].push(l);
  const out = new Map();
  for (let k = 0; k + 1 < sec.D.length; k += 2) {
    const a = sec.D[k], b = sec.D[k + 1], type = +a.slice(0, 8), ptr = +a.slice(8, 16), cnt = +b.slice(24, 32), form = +b.slice(32, 40);
    const body = sec.P.slice(ptr - 1, ptr - 1 + cnt).map((l) => l.slice(0, 64)).join('');
    const P = body.replace(/;\s*$/, '').split(',').map((x) => x.trim());
    out.set(k + 1, { type, form, P, status: a.slice(64, 72) });
  }
  return out;
}
function check(text, label, expect) {
  const E = parse(text), by = (t) => [...E.entries()].filter(([, e]) => e.type === t);
  const msbo = by(186), shells = by(514), faces = by(510), loops = by(508), els = by(504), vls = by(502);
  ok(msbo.length === 1 && shells.length === 1 && els.length === 1 && vls.length === 1, label + ': one 186, one 514, one 504, one 502', [msbo, shells, els, vls].map((x) => x.length).join('/'));
  ok(msbo[0][1].P[1] == shells[0][0] && msbo[0][1].P[2] === '1' && msbo[0][1].P[3] === '0', label + ': 186 points at the shell, orientation true, no voids');
  ok(shells[0][1].form === 1, label + ': the shell is form 1 (closed)');
  ok(faces.length === expect.faces && faces.every(([, e]) => e.form === 1), label + ': ' + expect.faces + ' faces, all form 1', String(faces.length));
  const nF = +shells[0][1].P[1];
  ok(nF === faces.length, label + ': the shell lists every face');
  const nE = +els[0][1].P[1], nV = +vls[0][1].P[1];
  ok(nE === expect.edges && nV === expect.verts, label + ': ' + nV + ' vertices, ' + nE + ' edges');
  // pointers: loop -> edge list; face -> 128 and 508s; edge list -> 126 and 502, indexes in range
  let good = true;
  const use = Array.from({ length: nE }, () => [0, 0]);
  const flipOf = new Map(shells[0][1].P.slice(2).map((x, i, a) => (i % 2 === 0 ? [+x, a[i + 1] === '1'] : null)).filter(Boolean));
  for (const [de, f] of faces) {
    const s = E.get(+f.P[1]); if (!s || s.type !== 128) good = false;
    const nl = +f.P[2];
    for (let k = 0; k < nl; k++) {
      const l = E.get(+f.P[4 + k]); if (!l || l.type !== 508 || l.form !== 1) { good = false; continue; }
      const n = +l.P[1];
      for (let j = 0; j < n; j++) {
        const [t, ed, ndx, of, kk] = l.P.slice(2 + 5 * j, 7 + 5 * j).map(Number);
        if (t !== 0 || ed !== els[0][0] || ndx < 1 || ndx > nE || kk !== 0) { good = false; continue; }
        // the effective direction: the loop's flag, turned round when the shell uses this face reversed
        const eff = flipOf.get(de) ? !!of : !of;
        use[ndx - 1][eff ? 0 : 1]++;
      }
    }
  }
  ok(good, label + ': every pointer lands on the entity the spec names, every index is in range');
  ok(use.every(([a, b]) => a === 1 && b === 1), label + ': every edge is used twice, once each way (face-uses applied)');
  let curvesOk = true;
  for (let i = 0; i < nE; i++) {
    const [c, sv, sx, tv, tx] = els[0][1].P.slice(2 + 5 * i, 7 + 5 * i).map(Number);
    const ce = E.get(c);
    if (!ce || ce.type !== 126 || sv !== vls[0][0] || tv !== vls[0][0] || sx < 1 || sx > nV || tx < 1 || tx > nV) curvesOk = false;
  }
  ok(curvesOk, label + ': every edge has a 126 curve and two vertex indexes in the vertex list');
  ok(els[0][1].status.slice(2, 4) === '01' && els[0][1].status.slice(6, 8) === '01' && vls[0][1].status.slice(2, 4) === '01', label + ': 502 and 504 are physically dependent, 504 hierarchy 01');
  const euler = nV - nE + nF - (loops.length - nF);
  ok(euler === expect.euler, label + ': V − E + F − (loops − F) = ' + expect.euler, String(euler));
}

const volOf = (d) => B.sew(B.facesOf(d, B.solids(d)[0].id)).volume;
const cases = [];
{ const r = B.box(N.doc.newDoc(), { corner: [0, 0, 0], size: [100, 60, 40] }); cases.push(['box', r.doc, { faces: 6, edges: 12, verts: 8, euler: 2 }]); }
{ const r = B.cylinder(N.doc.newDoc(), { radius: 20, height: 50 }); cases.push(['cylinder', r.doc, { faces: 3, edges: 5, verts: 4, euler: 2 }]); }
{ const r = B.sphere(N.doc.newDoc(), { radius: 25 }); cases.push(['sphere', r.doc, { faces: 1, edges: 1, verts: 2, euler: 2 }]); }
{
  const b = B.box(N.doc.newDoc(), { corner: [0, 0, 0], size: [100, 60, 40] }), f = B.solid(b.doc, b.id).faces;
  const r = BL.fillet(M, b.doc, b.id, f[1], f[2], { radius: 5 });
  cases.push(['filleted box', r.doc, { faces: 7, edges: 15, verts: 10, euler: 2 }]);
}
{
  let d = N.doc.newDoc(); const b = B.box(d, { corner: [0, 0, 0], size: [100, 60, 40] }); d = b.doc;
  const c = B.cylinder(d, { base: [50, 30, -10], radius: 15, height: 60 }); d = c.doc;
  const r = B.boolean(M, d, b.id, c.id, 'subtract', {});
  cases.push(['box - cylinder', r.doc, { faces: 7, edges: 17, verts: 12, euler: 0 }]);
}

section('IGES: a solid as one 186');
for (const [label, doc, ex] of cases) {
  const t0 = Date.now();
  const rep = N.iges.writeIgesReport(doc, { time: '2026-11-06T00:00:00' });
  const s = rep.solids[0];
  ok(s && s.closed, label + ': written as one manifold solid B-rep', JSON.stringify(s));
  if (!s || !s.closed) continue;
  check(rep.text, label, ex);
  const back = N.iges.readIges(rep.text), bs = B.solids(back);
  const v0 = volOf(doc), sw = bs.length ? B.sew(B.facesOf(back, bs[0].id)) : null;
  ok(bs.length === 1 && bs[0].faces.length === s.faces && sw.closed, label + ': read back as one solid of ' + s.faces + ' faces that closes', sw ? String(sw.closed) : 'none');
  ok(sw && rel(sw.volume, v0) < 1e-3, label + ': same volume within 0.1 %', sw ? f4(sw.volume) + ' vs ' + f4(v0) : '');
  ok(back.items.length === doc.items.length, label + ': no stray curves or surfaces read beside the solid', back.items.length + ' items');
  log(label + ': V ' + s.vertices + ', E ' + s.edges + ', F ' + s.faces + ', read back ' + f4(sw.volume) + ' vs ' + f4(v0) + ', ' + rep.text.length + ' bytes, ' + (Date.now() - t0) + ' ms');
}
{
  // a second pass: the file read back is written again and gives the same structure
  const [, doc] = cases[0];
  const again = N.iges.readIges(N.iges.writeIges(N.iges.readIges(N.iges.writeIges(doc, { time: '2026-11-06T00:00:00' })), { time: '2026-11-06T00:00:00' }));
  ok(B.solids(again).length === 1 && Math.abs(volOf(again) - 240000) < 1, 'write, read, write, read: one solid, 240 000 mm³ (box)');
}
section('IGES: other cases');
{
  // no solids: written as before (no 186), loose faces next to a solid stay surfaces
  let d = N.doc.newDoc(); d = N.doc.add(d, 'surface', N.construct.planarPatch([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]])).doc;
  ok(!/^ {5}186/m.test(N.iges.writeIges(d)) && N.iges.readIges(N.iges.writeIges(d)).items.length === 1, 'no solids: written and read as before');
  const b = B.box(N.doc.newDoc(), { size: [10, 10, 10] });
  const both = { ...b.doc, items: [...b.doc.items, { id: 'loose', name: 'loose', kind: 'surface', surface: N.construct.planarPatch([[0, 0, 100], [10, 0, 100], [10, 10, 100], [0, 10, 100]]) }] };
  const back = N.iges.readIges(N.iges.writeIges(both));
  ok(back.items.length === 7 && B.solids(back).length === 1 && B.solids(back)[0].faces.length === 6, 'a solid and a loose face: 7 surfaces, one solid of 6');
  // a solid that does not close is written as faces, with the reason
  const open = { ...b.doc, solids: [] }; open.items = open.items.slice(0, 5);
  const o = N.iges.writeIgesReport({ ...open, solids: [{ id: 'b1', name: 'open', faces: open.items.map((i) => i.id) }] });
  ok(o.solids[0] && !o.solids[0].closed && o.solids[0].why, 'faces that do not close: no 186, the report says why', JSON.stringify(o.solids[0]));
  ok(N.iges.readIges(o.text).items.length === 5, 'the open faces are still written as surfaces');
}
{
  // untrusted files: cut at many places and with broken pointers never throws anything but NurbsError
  const txt = N.iges.writeIges(cases[0][1], { time: '2026-11-06T00:00:00' });
  let other = 0, thrown = 0;
  for (let cut = 300; cut < txt.length; cut += Math.floor(txt.length / 60)) { const c = code(() => N.iges.readIges(txt.slice(0, cut))); if (c) thrown++; if (c && !String(c).startsWith('nurbs.err.')) other++; }
  ok(other === 0, 'a truncated file gives a nurbs.err.* code or a result, nothing else', thrown + ' refused');
  // a loop that points at the wrong entity
  const lines = txt.split('\n'), P = lines.map((l, i) => [l, i]).filter(([l]) => l[72] === 'P');
  const bad = lines.slice(); const ix = P.find(([l]) => /^508,/.test(l.slice(0, 64).trim()));
  if (ix) { bad[ix[1]] = '508,3,0,9999,1,1,0;'.padEnd(72, ' ') + bad[ix[1]].slice(72); }
  const c = code(() => N.iges.readIges(bad.join('\n')));
  ok(c === null || String(c).startsWith('nurbs.err.'), 'a loop with a bad pointer: refused in words or skipped', String(c));
}
console.log((failN ? 'FAILED — ' : '') + 'iges-solid: ' + pass + ' passed, ' + failN + ' failed');
process.exit(failN ? 1 : 0);
