#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-rib.mjs — the Rib feature (0.4 P20) on the exact kernel: a gusset in an L-bracket (legs 100, walls 10, 40 deep) from
 * a line on the mid plane. Volumes against hand geometry: the triangle between the line and the walls × the thickness; the
 * three thickness sides by their extent; a line that stops short of the walls (carried on to them) gives the same rib; a
 * bent chain fills its polygon; the open side and bad profiles are refused in words; the file round trip.
 *   node tools/partcraft-test/test-rib.mjs [--verbose]    (or runRibTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runRibTests({ ok, section, oc }) {
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const why = (r) => [...r.results].filter(([, x]) => x.status !== 'ok').map(([k, x]) => `${k}: ${x.message}`).join('; ');
  const poly = (sk, pts, closed) => { let prev = null, first = null; for (let i = 0; i + 1 < pts.length; i++) { prev = S.addLine(sk, prev ? prev.p2 : pts[i], pts[i + 1]); if (!first) first = prev; } if (closed) S.addLine(sk, prev.p2, first.p1); };
  /** The L-bracket (76000) and a sketch on the plane 20 in front of the front plane (the bracket's middle). */
  const bracket = (draw, rib = {}) => {
    const part = P.newPart('Bracket');
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: (() => { const sk = S.newSketch(); poly(sk, [[0, 0], [100, 0], [100, 10], [10, 10], [10, 100], [0, 100]], true); return sk; })() });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 40 });
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [{ kind: 'base', name: 'front' }], d: 20 });
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'ref', feature: pl.id }, sketch: (() => { const sk = S.newSketch(); draw(sk); return sk; })() });
    const rb = P.addFeature(part, 'rib', { sketch: s2.id, t: 4, ...rib });
    return { part, rb, s2 };
  };
  const line = (a, b) => (sk) => S.addLine(sk, a, b);

  section('rib: a gusset from an open sketch (brep-rib.js)');
  {
    let { part, rb } = bracket(line([10, 60], [60, 10]), { flip: false });
    let r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 76000 + 1250 * 4), `a line from wall to wall: by default toward the body's centre (the inside corner): + the triangle 50·50/2 × 4 = 81000 (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    ok(near(r.stats.bbox.min[2], 0) && near(r.stats.bbox.max[2], 40), 'it stays inside the bracket\'s depth');
    rb.flip = true;
    r = B.regenerateBrep(part, oc);
    ok(!allOk(r) && /never meets the body/.test(why(r)), `Flip: the other side, which nothing closes, is refused: "${why(r)}"`);
    rb.flip = false;
    for (const [side, z0, z1] of [['front', 20, 24], ['back', 16, 20], ['mid', 18, 22]]) {
      rb.side = side;
      r = B.regenerateBrep(part, oc);
      ok(allOk(r) && rel(r.stats.volume, 81000), `thickness ${side}: still 81000`);
      // the rib's own faces: its z extent
      const zs = r.faces.filter((f) => (f.name || '').startsWith(rb.id + '.rib:')).flatMap((f) => (f.box ? [f.box.min[2], f.box.max[2]] : f.at ? [f.at[2]] : []));
      if (zs.length) ok(Math.min(...zs) >= z0 - 1e-6 && Math.max(...zs) <= z1 + 1e-6, `thickness ${side}: the rib's faces lie between z ${z0} and ${z1}`);
    }
    // drawn the other way round: the same side
    ({ part } = bracket(line([60, 10], [10, 60])));
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 81000), 'the same line drawn from its other end fills the same side');
    // a line that stops short of the walls, on the same line x + y = 70: carried on to them, the same rib
    ({ part } = bracket(line([25, 45], [45, 25]), { flip: false }));
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 81000), `a line drawn short of both walls on the same line: carried on to them, the same 81000 (${r.stats.volume.toFixed(6)})`);
    // a bent chain (10,60) → (40,40) → (60,10): the polygon (10,10) (60,10) (40,40) (10,60) has area 1500
    ({ part } = bracket((sk) => { const a = S.addLine(sk, [10, 60], [40, 40]); S.addLine(sk, a.p2, [60, 10]); }, { flip: false }));
    r = B.regenerateBrep(part, oc);
    ok(allOk(r) && rel(r.stats.volume, 76000 + 1500 * 4), `a bent chain fills its polygon: 76000 + 1500 × 4 (${r.stats.volume.toFixed(6)})${allOk(r) ? '' : ' — ' + why(r)}`);
    // bad profiles
    ({ part } = bracket((sk) => S.addRect(sk, [20, 20], [40, 40]), { flip: false }));
    r = B.regenerateBrep(part, oc);
    ok(!allOk(r) && /one open chain of lines/.test(why(r)), `a closed rectangle is refused: "${why(r)}"`);
    ({ part } = bracket((sk) => { S.addLine(sk, [20, 50], [50, 20]); S.addLine(sk, [60, 60], [70, 70]); }, { flip: false }));
    r = B.regenerateBrep(part, oc);
    ok(!allOk(r) && /one open chain of lines/.test(why(r)), 'two separate lines are refused');
  }

  section('rib: the file');
  {
    const { part, rb, s2 } = bracket(line([10, 60], [60, 10]), { flip: true, side: 'front', t: 2.5 });
    ok(P.dependsOn(rb).includes(s2.id) && P.EXACT_ONLY.has('rib') && P.fileVersion(part) === 3, 'it depends on its sketch, is exact-kernel only, and makes the file version 3');
    const back = P.readPart(P.toJSON(part)).features.find((f) => f.type === 'rib');
    ok(back.t === 2.5 && back.side === 'front' && back.flip === true && back.sketch === s2.id, 'the rib round-trips through the file');
    const bad = (mut) => { const j = JSON.parse(P.toJSON(part)); mut(j.features.find((f) => f.type === 'rib')); try { P.readPart(JSON.stringify(j)); return ''; } catch (e) { return e.message; } };
    ok(/its side is bad/.test(bad((f) => { f.side = 'left'; })) && /its thickness is bad/.test(bad((f) => { f.t = 0; })) && /its sketch is bad/.test(bad((f) => { f.sketch = 'f99'; })), 'tampered side, thickness and sketch are refused');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runRibTests({ ok, section, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
