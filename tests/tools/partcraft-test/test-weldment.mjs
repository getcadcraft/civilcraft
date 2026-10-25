#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-weldment.mjs — Structural members (0.7 D7.50; weldment.js, kernel.js `member`, part.js version 5).
 *   - a 500 × 300 rectangle of HSS2X2X1/4, mitred: volume = the section's area × the 1600 mm centreline (a symmetric section
 *     cut by planes through the line's corners), the cut list 2 × 550.8 and 2 × 350.8, 45° both ends; butt: the same volume,
 *     550.8 / 500 / 300 / 249.2, square ends; W8X31 mitred to the same rule; rotated 90° the frame is bf high instead of d; the
 *     bottom-middle anchor puts it on top of the sketch plane;
 *   - a table frame in 3D (a top rectangle on a plane 500 up, four legs from sketches on two front planes): three members at each
 *     top corner (one runs through, the others cut to fit), caps on the four feet; a crossbar from one long side's middle to the
 *     other's: both ends cut to fit; gussets at a rectangle's corners; caps on an open L (2 × the section's outline × t);
 *   - the file: version 5, read back, tampering refused; the cut list as CSV (header + a row per group).
 *   node tools/partcraft-test/test-weldment.mjs [--verbose]    (or runWeldmentTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runWeldmentTests({ ok, section, M = null }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), W = await import(DEV + 'weldment.js');
  const SEC = await import(DEV + 'shapes/sections.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
  /** The faceted area the members are built with (outline(p, 4)): outer less its holes. */
  const area = (name) => { const loops = SEC.outline(SEC.findSection(name), 4); return Math.abs(SEC.shoelace(loops[0])) - loops.slice(1).reduce((s, l) => s + Math.abs(SEC.shoelace(l)), 0); };
  const outerArea = (name) => Math.abs(SEC.shoelace(SEC.outline(SEC.findSection(name), 4)[0]));
  const frame = (props = {}, plane = { kind: 'base', name: 'top' }) => {
    const part = P.newPart('Frame');
    const sk = S.newSketch(); const r = S.addRect(sk, [0, 0], [500, 300]);
    const s = P.addFeature(part, 'sketch', { plane, sketch: sk });
    const m = P.addFeature(part, 'member', { segs: r.lines.map((l) => ({ sketch: s.id, line: l })), ...props });
    return { part, m, s, sk, r };
  };
  const build = (part) => K.regenerate(part, M);
  const rows = (g, id) => W.cutList(g.results.get(id).info);
  const sig = (rs) => rs.filter((x) => x.kind === 'member').map((x) => `${x.qty}×${x.length.toFixed(1)}@${x.angles.join('/')}`).sort().join(' ');

  section('structural members: a rectangle');
  {
    const A = area('HSS2X2X1/4');
    const f = frame({ section: 'HSS2X2X1/4', corner: 'miter' });
    const g = build(f.part);
    ok(g.results.get(f.m.id).status === 'ok' && rel(g.stats.volume, A * 1600, 1e-9), `mitred HSS2x2x1/4: volume ${g.stats.volume.toFixed(1)} = area ${A.toFixed(2)} × 1600 mm of centreline`);
    ok(sig(rows(g, f.m.id)) === '2×350.8@45/45 2×550.8@45/45', 'cut list: 2 × 550.8 and 2 × 350.8, 45° at both ends (long point to long point)');
    const b = frame({ section: 'HSS2X2X1/4', corner: 'butt' });
    const gb = build(b.part);
    const rb = rows(gb, b.m.id);
    ok(rel(gb.stats.volume, A * 1600, 1e-9) && sig(rb) === '1×249.2@0/0 1×300.0@0/0 1×500.0@0/0 1×550.8@0/0' && rb.every((x) => x.ends.every((e) => e === 'square')), 'butt: the same volume; 550.8 runs through, 500 and 300 run on, 249.2 between: every end square');
    const AW = area('W8X31');
    const w = frame({ section: 'W8X31', corner: 'miter' });
    const gw = build(w.part);
    const p = SEC.findSection('W8X31');
    ok(rel(gw.stats.volume, AW * 1600, 1e-9) && rel(gw.stats.bbox.max[1] - gw.stats.bbox.min[1], p.d, 1e-9), `mitred W8x31: area × centreline, ${p.d.toFixed(1)} high (its depth, web upright)`);
    const p2 = SEC.findSection('W12X26');   // deeper than wide, so a turn shows
    const h = (props) => { const g2 = build(frame({ section: 'W12X26', ...props }).part); return g2.stats.bbox.max[1] - g2.stats.bbox.min[1]; };
    ok(rel(h({}), p2.d, 1e-9) && rel(h({ rotate: 90 }), p2.bf, 1e-9), `W12x26 upright ${p2.d.toFixed(1)} high; rotated 90° ${p2.bf.toFixed(1)} high (its flange width)`);
    const an = frame({ section: 'HSS2X2X1/4', anchor: 'bc' });
    const ga = build(an.part);
    ok(Math.abs(ga.stats.bbox.min[1]) < 1e-9 && rel(ga.stats.bbox.max[1], 50.8, 1e-9), 'anchor bottom middle: the frame sits on the sketch plane (0 … 50.8 up)');
    const faces = g.faces.filter((x) => x.name?.startsWith(f.m.id + '.m'));
    ok(faces.length >= 16 && faces.some((x) => /\.end[01]$/.test(x.name)), `named faces: each member's flat sides and its cut ends (${faces.length})`);
  }

  section('structural members: in 3D, fits, caps, gussets');
  {
    // a table: top 500 × 300 on a plane 500 up, legs at the four corners from two front planes (z 0 and z −300)
    const part = P.newPart('Table');
    const top = S.newSketch(); const rt = S.addRect(top, [0, 0], [500, 300]);
    const sTop = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 500, 0], n: [0, 1, 0] }, sketch: top });
    const legs = (z) => { const sk = S.newSketch(); const a = S.addLine(sk, [0, 0], [0, 500]), b = S.addLine(sk, [500, 0], [500, 500]); return { sk, ids: [a.id, b.id], z }; };
    const L1 = legs(0), L2 = legs(-300);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 0, 0], n: [0, 0, 1] }, sketch: L1.sk });
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 0, -300], n: [0, 0, 1] }, sketch: L2.sk });
    const m = P.addFeature(part, 'member', { segs: [...rt.lines.map((l) => ({ sketch: sTop.id, line: l })), ...L1.ids.map((l) => ({ sketch: s1.id, line: l })), ...L2.ids.map((l) => ({ sketch: s2.id, line: l }))], section: 'HSS2X2X1/4', caps: { t: 6 } });
    const g = build(part);
    const r = rows(g, m.id);
    const caps = r.find((x) => x.kind === 'cap');
    const mem = r.filter((x) => x.kind === 'member');
    ok(g.results.get(m.id).status === 'ok' && mem.reduce((s, x) => s + x.qty, 0) === 8 && caps?.qty === 4, `a table frame from three sketches on three planes: 8 members, caps on the 4 feet (${g.stats.volume.toFixed(0)} mm³)`);
    ok(mem.some((x) => x.ends.includes('fit')), 'at each top corner three members meet: one runs square, the others are cut to fit against it');
    ok(rel(g.stats.bbox.max[1] - g.stats.bbox.min[1], 500 + 6 + 25.4, 1e-9), 'from the caps under the feet (6) to the top of the top rails (25.4 above 500)');
    // a crossbar between the long sides' middles: both ends cut to fit
    const f = frame({ section: 'HSS2X2X1/4' });
    const xb = S.addLine(f.sk, [250, 0], [250, 300]);
    f.m.segs.push({ sketch: f.s.id, line: xb.id });
    const gx = build(f.part);
    const cross = rows(gx, f.m.id).find((x) => x.kind === 'member' && x.ends.join() === 'fit,fit');
    const ro = SEC.findSection('HSS2X2X1/4').ro;
    ok(gx.results.get(f.m.id).status === 'ok' && cross && Math.abs(cross.length - (249.2 + 2 * ro)) < 0.06, `a crossbar ending on the middle of two rails: both ends cut to fit, ${cross?.length} long point to long point (249.2 between the rails' faces + its corners into their corner radius, 2 × ${ro.toFixed(2)})`);
    // gussets at the four corners
    const gu = frame({ section: 'HSS2X2X1/4', gussets: { size: 100, t: 6 } });
    const gg = build(gu.part);
    const gr = rows(gg, gu.m.id).find((x) => x.kind === 'gusset');
    ok(gr?.qty === 4 && Math.abs(gr.angle - 90) < 1e-6 && gg.stats.volume > area('HSS2X2X1/4') * 1600, 'gussets: 4, at 90° corners, the frame heavier by them');
    // caps on an open L: two free ends
    const lp = P.newPart('L'); const lk = S.newSketch(); const a1 = S.addLine(lk, [0, 0], [400, 0]), a2 = S.addLine(lk, [400, 0], [400, 200]);
    const ls = P.addFeature(lp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: lk });
    const plain = P.addFeature(lp, 'member', { segs: [a1.id, a2.id].map((l) => ({ sketch: ls.id, line: l })), section: 'C6X13' });
    const v0 = build(lp).stats.volume;
    plain.caps = { t: 8 };
    const gl = build(lp);
    ok(rel(gl.stats.volume - v0, 2 * outerArea('C6X13') * 8, 1e-9) && rows(gl, plain.id).find((x) => x.kind === 'cap')?.qty === 2, 'caps on an open L of C6x13: two, each the channel\'s outline × 8 (a mirror image at the start, so it matches)');
  }

  section('structural members: the file and the cut list');
  {
    const f = frame({ section: 'IPE200', corner: 'butt', caps: null, gussets: { size: 80, t: 8 } });
    const text = P.toJSON(f.part);
    const j = JSON.parse(text);
    ok(j.version === 5 && P.readPart(text).features[1].section === 'IPE200', 'saved as version 5; read back');
    const bad = (fn) => { const q = JSON.parse(text); fn(q.features[1]); try { P.readPart(JSON.stringify(q)); return false; } catch (e) { return /bad/.test(e.message); } };
    ok(bad((x) => { x.section = 'IPE9999'; }) && bad((x) => { x.segs = [{ sketch: 'f99', line: 'e1' }]; }) && bad((x) => { x.anchor = 'zz'; }) && bad((x) => { x.corner = 'weld'; }) && bad((x) => { x.gussets = { size: -1, t: 3 }; }) && bad((x) => { x.caps = { t: 'thick' }; }),
      'tampered members refused (an unknown section, a line of a missing sketch, anchor, corners, gussets, caps)');
    const g = build(f.part);
    const rs = rows(g, f.m.id);
    const csv = W.cutListCsv(rs, { head: ['Item', 'Qty', 'Piece', 'Section', 'Size', 'Ends', 'Members'], member: 'Member', cap: 'End cap', gusset: 'Gusset', square: 'square', fit: 'cut to fit' });
    const lines = csv.trim().split('\n');
    ok(lines.length === rs.length + 1 && lines[0] === 'Item,Qty,Piece,Section,Size,Ends,Members' && lines.some((l) => /,Gusset,Gusset,80 x 80 x 8,/.test(l)) && lines.some((l) => /,Member,IPE200,/.test(l)), `the CSV: a header and ${rs.length} rows (members by length, the gussets)`);
    const deps = P.dependsOn(f.m);
    ok(deps.length === 1 && deps[0] === f.s.id, 'the member depends on its sketch');
  }
  K.clearCheckpoints();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runWeldmentTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
