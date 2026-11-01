/* SPDX-License-Identifier: Apache-2.0 */
// The cost estimate: every rate a labelled placeholder until the shop's own is put in (EG.76); hand-checked arithmetic.
const { ok, section, near, mine } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const A = await mine('lib/analyze.js');
const ES = await mine('lib/estimate.js');
const X = await mine('lib/export.js');

const one = P.cleanProject({ unit: 'mm', runs: [{ id: 'A', wall: 'S', base: [{ kind: 'cab', tpl: 'base-door', w: 600 }] }] });

section('Rates');
{
  ok(ES.DEFAULT_RATES.currency === 'USD' && ES.DEFAULT_RATES.sheet['melamine-18'] === 48, 'defaults exist');
  ok(Object.keys(ES.readRates({ labour: { perHour: 45 }, markup: 0.25 })).length === 0, 'a rate equal to its placeholder is not an override');
  const r = ES.readRates({ labour: { perHour: 60, base: -1, zzz: 3 }, markup: 2e9, tax: 0.1, sheet: { 'melamine-18': 51, nope: 4 }, currency: 'eur', evil: 1, __proto__: { x: 1 } });
  ok(Object.keys(r).sort().join() === 'currency,labour,sheet,tax' && r.sheet['melamine-18'] === 51 && Object.keys(r.sheet).length === 1 && r.labour.perHour === 60 && Object.keys(r.labour).length === 1 && r.tax === 0.1 && r.currency === 'EUR', 'readRates keeps only known, bounded, changed numbers', JSON.stringify(r));
  ok(ES.ratesOf({ labour: { perHour: 60 } }).labour.base === 0.9 && ES.ratesOf({ labour: { perHour: 60 } }).labour.perHour === 60, 'ratesOf merges the overrides over the defaults');
  ok(ES.changedPaths({ labour: { perHour: 60 }, tax: 0.1 }).join() === 'labour.perHour,tax', 'changedPaths');
}

section('Estimate: one 600 base, by hand');
{
  const a = A.analyze(one);
  const e = a.est;
  const by = Object.fromEntries(e.rows.map((r) => [r.key.split(':')[0] + (r.key.includes('hw:') ? r.key : ''), r]));
  // 1 melamine sheet 48, 1 hdf back sheet 22, 1 mdf front sheet 60
  const sheetRows = e.rows.filter((r) => r.key.startsWith('sheet:'));
  ok(sheetRows.length === 3 && sheetRows.reduce((s, r) => s + r.amount, 0) === 130, 'three sheets: melamine 48 + back 22 + front 60 = 130', JSON.stringify(sheetRows.map((r) => [r.detail, r.amount])));
  const hinge = e.rows.find((r) => r.key === 'hw:hinge');
  ok(hinge.qty === 2 && hinge.rate === 2.5 && hinge.amount === 5, 'two hinges at 2.50 = 5.00');
  const labour = e.rows.find((r) => r.key === 'labour');
  ok(labour.qty === 0.9 + 0.2 && near(labour.amount, 49.5), 'labour: one base 0.9 h + one end panel 0.2 h at 45 = 49.50', JSON.stringify(labour));
  ok(e.rows.every((r) => r.placeholder) && e.allPlaceholder && e.placeholders === e.rows.length && e.markupPlaceholder, 'every row is a placeholder');
  ok(near(e.subtotal, e.rows.reduce((s, r) => s + r.amount, 0), 0.01) && near(e.markup, e.subtotal * 0.25, 0.01) && near(e.total, e.subtotal + e.markup, 0.01) && e.tax === 0, 'subtotal, 25 % markup, total');
  ok(e.cabinets === 1 && near(e.perCabinet, e.total, 0.01), 'per cabinet');
  const own = A.analyze({ ...one, rates: { labour: { perHour: 60 }, sheet: { 'melamine-18': 50 } } }).est;
  const lab2 = own.rows.find((r) => r.key === 'labour'), mel = own.rows.find((r) => r.key.startsWith('sheet:') && /melamine/.test(r.detail));
  ok(!lab2.placeholder && lab2.amount === 66 && !mel.placeholder && mel.amount === 50, 'rates the shop changed are no longer placeholders and are used: 1.1 h at 60 = 66, sheet 50');
  ok(own.placeholders === own.rows.length - 2 && !own.allPlaceholder, 'the others stay placeholders: ' + own.placeholders + ' of ' + own.rows.length);
  const cur = A.analyze({ ...one, rates: { currency: 'eur', markup: 0.1, tax: 0.2 } }).est;
  ok(cur.currency === 'EUR' && !cur.markupPlaceholder && near(cur.markup, cur.subtotal * 0.1, 0.01) && near(cur.tax, (cur.subtotal + cur.markup) * 0.2, 0.01), 'currency, markup and tax');
  const inst = A.analyze(one, { install: true }).est;
  ok(inst.rows.some((r) => r.key === 'install' && r.qty === 0.5), 'installation time on request: 0.5 h a cabinet');
  ok(a.est.rows.every((r) => r.path && r.base !== undefined), 'every row says which rate it comes from');
}

section('Estimate: sheets from the nest or from the area');
{
  const a = A.analyze(P.sampleProject());
  const nest = A.runNest(a.build, { tries: 2, timeLimit: 3000 });
  const withNest = A.analyze(P.sampleProject(), { nest }).est;
  const sheetsN = withNest.rows.filter((r) => r.key.startsWith('sheet:')).reduce((s, r) => s + r.qty, 0);
  ok(sheetsN === nest.sheets, 'with a nest the sheets bought are the nest\'s: ' + sheetsN);
  const area = a.est.rows.filter((r) => r.key.startsWith('sheet:')).reduce((s, r) => s + r.qty, 0);
  ok(area >= nest.sheets - 3 && area <= nest.sheets + 1, 'without one the area estimate is close: ' + area + ' against ' + nest.sheets);
  ok(withNest.rows.some((r) => r.key.startsWith('counter:')) && withNest.rows.some((r) => r.key === 'machine'), 'countertops and machine time are in');
  const ff = A.analyze({ ...P.sampleProject(), construction: 'faceframe' }).est;
  ok(ff.rows.some((r) => r.key.startsWith('frame:')) && ff.total > a.est.total, 'a face frame adds hardwood and labour');
  const inch = A.analyze(P.sampleProject('in')).est;
  ok(inch.total > a.est.total * 0.8 && inch.total < a.est.total * 1.25, 'the same kitchen in inches costs about the same: ' + inch.total + ' against ' + a.est.total);
}

section('Estimate CSV says what is a placeholder');
{
  const a = A.analyze(one);
  const csv = X.estimateCsv(a.est, { note: 'NOTE-TEXT' });
  const lines = csv.trim().split('\r\n');
  ok(lines[0] === 'what,detail,qty,unit,rate,amount,placeholder' && lines.slice(1, -1).some((l) => l.endsWith(',yes')), 'a placeholder column, "yes" on every placeholder row');
  ok(lines.at(-1) === 'NOTE-TEXT' && /Total \(USD\)|est\.total \(USD\)/.test(lines.at(-2)), 'a closing note line and the total with its currency');
}
