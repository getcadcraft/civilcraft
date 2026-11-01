#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cost.mjs — 0.8 EG.76: the making cost (cost.js) against hand arithmetic on the EG.75 aluminium bracket (152.4 × 96.5 × 25 mm, 30 250 mm³):
 *   CNC: stock = box + 3 mm on every face (158.4 × 102.5 × 31 = 503 316 mm³ → 1.3589 kg at 2700 kg/m³ × 6 per kg), removal = stock − part at
 *        10 000 mm³/min × 1.25 finishing, two holes at 0.5 min, 6 min handling, 70 per hour, 60 setup shared by the quantity
 *   printed: 35 % of the volume as filament at 25 per kg (ABS), 15 000 mm³/h at 4 per hour, 5 setup
 *   the quantity shares the setup; the rates are the person's (saved in part.studies.cost, read back safely); refusals say what to try
 *   node tools/partcraft-test/test-cost.mjs [--verbose]    (or runCostTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runCostTests({ ok, section, M }) {
  const [C, D, P, K] = await Promise.all(['cost.js', 'design-it.js', 'part.js', 'kernel.js'].map((f) => import(DEV + f)));
  await import(path.join(HERE, 'fixtures.mjs'));
  const near = (a, b, tol = 0.011) => Math.abs(a - b) <= tol;
  const code = (fn) => { try { fn(); return ''; } catch (e) { return e.code || 'plain'; } };
  const est0 = D.estimate({ generator: 'bracket', force_N: 20 * 4.4482216152605, arm_mm: 152.4, material: 'aluminium', process: 'machined' });
  const part = D.buildPart(est0);
  const regen = K.regenerate(part, M);
  const V = regen.stats.volume, box = regen.stats.bbox, size = [0, 1, 2].map((k) => box.max[k] - box.min[k]);

  section('EG.76 making cost: machined from stock');
  {
    const e = C.estimate(part, regen, { process: 'cnc', qty: 1 });
    const stockV = (size[0] + 6) * (size[1] + 6) * (size[2] + 6), stockKg = stockV * 2700e-9, removal = stockV - V;
    const hStock = stockKg * 6, hCut = removal / 10000 * 1.25 / 60 * 70, hHoles = 2 * 0.5 / 60 * 70, hHand = 6 / 60 * 70;
    const row = (id) => e.rows.find((r) => r.id === id);
    ok(near(size[0], 152.4, 1e-6) && near(size[1], est0.dims.flange_height_mm, 1e-6) && near(size[2], 25, 1e-6), 'the box is 152.4 × ' + est0.dims.flange_height_mm + ' × 25');
    ok(near(row('stock').amount, hStock), `stock ${row('stock').amount} = ${stockKg.toFixed(4)} kg × 6 = ${hStock.toFixed(2)}`);
    ok(near(row('cutting').amount, hCut), `cutting ${row('cutting').amount} = ${(removal / 10000 * 1.25).toFixed(2)} min × 70/h = ${hCut.toFixed(2)}`);
    ok(near(row('holes').amount, hHoles) && e.rows.find((r) => r.id === 'holes').basis.holes === 2, `two bolt holes (circles in the cut): ${row('holes').amount}`);
    ok(near(row('handling').amount, hHand) && near(row('setup').amount, 60), 'handling 6 min = ' + hHand.toFixed(2) + ', the setup of 60 for one part');
    ok(near(e.total, hStock + hCut + hHoles + hHand + 60), `total for one: ${e.total} = ${(hStock + hCut + hHoles + hHand + 60).toFixed(2)}`);
    ok(near(e.total, e.rows.reduce((a, r) => a + r.amount, 0), 0.03), 'the rows add up to the total');
    const e10 = C.estimate(part, regen, { process: 'cnc', qty: 10 });
    ok(near(e10.total, e.total - 60 + 6) && near(e10.rows.find((r) => r.id === 'setup').amount, 6) && near(e10.job, 60), 'ten parts share the setup: 6 each, the unit cost is unchanged');
    ok(e.shares.cutting > e.shares.stock && Math.abs(Object.values(e.shares).reduce((a, v) => a + v, 0) - 1) < 1e-9, 'shares add to 1; cutting is the biggest part of this bracket');
    ok(e.drivers.some((d) => /Most of the stock is cut away \(9\d %\)/.test(d)), 'it says most of the stock is cut away: ' + e.drivers[0]);
    ok(e.notes.some((n) => /placeholders/.test(n)) && e.notes.some((n) => /Not in the estimate/.test(n)), 'and that the rates are placeholders and what is not counted');
    const mine = C.estimate(part, regen, { process: 'cnc', rates: { cnc: { perHour: 100 }, perKg: { al6061: 10 } } });
    ok(near(mine.rows.find((r) => r.id === 'stock').amount, stockKg * 10) && near(mine.rows.find((r) => r.id === 'cutting').amount, hCut * 100 / 70), 'the person\'s rates replace the placeholders: 10 per kg, 100 per hour');
  }

  section('EG.76 making cost: printed');
  {
    const abs = JSON.parse(JSON.stringify(part)); abs.material = { name: 'ABS', density: 1.05 };
    const e = C.estimate(abs, regen, { process: 'printed' });
    const printed = V * 0.35, kg = printed * 1050e-9, hours = printed / 15000;
    ok(near(e.rows[0].amount, kg * 25) && near(e.rows[1].amount, hours * 4) && near(e.total, kg * 25 + hours * 4 + 5), `ABS: filament ${e.rows[0].amount} (${(kg * 1000).toFixed(1)} g × 25/kg), machine ${e.rows[1].amount} (${hours.toFixed(2)} h × 4), setup 5: total ${e.total}`);
    ok(e.drivers.some((d) => /Print time is/.test(d)), 'the driver is the print time');
  }

  section('EG.76 making cost: holes, the saved study, refusals');
  {
    ok(C.holeCount(part) === 2, 'holeCount: two circles in the bolt-hole cut');
    const hp = P.newPart('H');
    const f1 = P.addFeature(hp, 'hole', {}), f2 = P.addFeature(hp, 'hole', {});
    P.addFeature(hp, 'lpattern', { seeds: [f1.id], count: 4 });
    ok(C.holeCount(hp) === 5, 'two hole features, one in a pattern of 4: 2 + 3 more = 5');
    const o = C.optionsFor({ studies: { cost: { process: 'printed', qty: 3, rates: { print: { perHour: 9 } } } }, material: { name: 'nylon' } }, { setup: 20, price_per_kg: 50 });
    ok(o.process === 'printed' && o.qty === 3 && o.rates.print.perHour === 9 && o.rates.print.setup === 20 && o.rates.perKg.nylon === 50, 'the saved study, then the per-call overrides');
    const rd = C.readCost({ process: 'printed', qty: 7.4, rates: { currency: 'eur', cnc: { perHour: 80, mrr: { al6061: 9000, bogus: 1 } }, perKg: { steel: -1, abs: 30 }, evil: { a: 1 }, print: { fill: 'x' } } });
    ok(rd.process === 'printed' && rd.qty === 7 && rd.rates.currency === 'EUR' && rd.rates.cnc.perHour === 80 && rd.rates.cnc.mrr.al6061 === 9000 && !('bogus' in rd.rates.cnc.mrr) && rd.rates.perKg.abs === 30 && !('steel' in rd.rates.perKg) && !rd.rates.evil && !rd.rates.print, 'readCost keeps good numbers, drops negative, unknown and non-numbers');
    ok(C.readCost({ process: 'laser', qty: 'many' }).process === 'cnc' && C.readCost({ qty: 0 }).qty === 1, 'an unknown process is cnc, a bad quantity 1');
    ok(code(() => C.readCost([1])) === 'plain', 'not an object is refused');
    const withStudy = JSON.parse(JSON.stringify(part)); P.setStudy(withStudy, 'cost', { process: 'printed', qty: 4 });
    const back = P.readPart(JSON.parse(P.toJSON(withStudy)));
    ok(back.studies.cost.process === 'printed' && back.studies.cost.qty === 4 && P.fileVersion(back) >= 3, 'part.studies.cost is saved and read back (a file version 3 or later)');
    ok(code(() => C.estimate(part, regen, { process: 'laser' })) === 'invalid_argument' && code(() => C.estimate(part, regen, { qty: 0 })) === 'invalid_argument', 'unknown process and zero quantity: invalid_argument');
    const nomat = JSON.parse(JSON.stringify(part)); delete nomat.material;
    let msg = null; try { C.estimate(nomat, regen, {}); } catch (e) { msg = e; }
    ok(msg && msg.code === 'invalid_argument' && /material/.test(msg.message) && msg.next.length, 'no material: refused, saying what to set');
    ok(code(() => C.estimate(part, null, {})) === 'failed', 'no solid: failed, saying to build the part first');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const H = await import(path.join(REPO, 'tools/cli/headless/part.mjs'));
  const M = (await H.partModules()).man;
  await runCostTests({ ok, section: (m) => { if (VERBOSE) console.log(m); }, M });
  console.log(`cost: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
