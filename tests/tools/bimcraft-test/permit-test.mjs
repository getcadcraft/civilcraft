/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --permit` (0.8 EG.44, session bim_PART_2): the permit package and its likely review comments.
 * Known answers are worked by hand from the rows below.
 */
import path from 'node:path';

export async function permitMode({ APP, ROOT }) {
  const P = await import(path.join(APP, 'permit-package.js'));
  const { zip, unzip } = await import(path.join(APP, 'bcf.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const row = (o) => ({ where: 'Level 1', label: 'Stair riser', clause: 'R311.7.5.1', required: '≤ 7.75 in', found: '7 in', result: 'Meets', source: 'IRC 2021', raw: { id: 'stair.riser.max', ok: true, req: 196.85, found: 177.8, op: '<=', unit: 'mm' }, ...o });
  const rows = [
    row({}),                                                                                              // meets with room: 9.7 % under → no comment
    row({ label: 'Stair tread', clause: 'R311.7.5.2', required: '≥ 10 in', found: '10.2 in', raw: { id: 'stair.tread.min', ok: true, req: 254, found: 259.08, op: '>=', unit: 'mm' } }),   // 2 % over → borderline
    row({ label: 'Hall width', where: 'Hall', clause: 'R311.6', required: '≥ 36 in', found: '34 in', result: 'Fails', raw: { id: 'room.hall.width.min', ok: false, req: 914.4, found: 863.6, op: '>=', unit: 'mm' } }),
    row({ label: 'Escape window sill', where: 'Bedroom 2', clause: 'R310.1', required: '≤ 44 in', found: '–', result: 'Not checked', raw: { id: 'room.egress.sill.max', ok: null, req: 1117.6, found: null, op: '<=', unit: 'mm' } }),
    row({ label: 'No raw', where: 'Study', clause: '', required: '≥ 70 sq ft', found: '60 sq ft', result: 'Fails', raw: undefined }),   // only strings: read from the result word
  ];
  rows[4].raw = undefined; delete rows[4].raw;

  console.log('== likely review comments');
  const c = P.reviewComments(rows);
  ok(c.length === 4, 'four comments from five rows (the row that meets with room has none): ' + c.map((x) => x.kind).join(','));
  ok(c.map((x) => x.kind).join() === 'fail,fail,borderline,unchecked', 'failures first, then the borderline one, then the unchecked');
  const hall = c.find((x) => x.rule === 'Hall width');
  ok(hall && /required ≥ 36 in, the drawing has 34 in/.test(hall.text) && /R311\.6/.test(hall.text) && /Increase it/.test(hall.fix), 'the hall comment states the number, the found value, the clause and the fix: ' + hall?.text);
  const bd = c.find((x) => x.kind === 'borderline');
  ok(bd && /2% of the limit/.test(bd.text) && bd.rule === 'Stair tread', 'a tread 2 % over its minimum is a heads-up: ' + bd?.text);
  ok(P.reviewComments(rows, { margin: 0.01 }).every((x) => x.kind !== 'borderline'), 'a tighter margin of 1 % drops it');
  ok(c.find((x) => x.rule === 'No raw')?.kind === 'fail', 'a row with only strings is read from its result word');
  ok(c.find((x) => x.kind === 'unchecked').text.includes('could not be checked'), 'an unchecked rule becomes a question to answer');

  console.log('== other problems');
  const pc = P.problemComments([
    { text: 'Door has no FireRating', code: 'ids.attribute', severity: 'warning', source: { name: 'IDS' } }, { text: 'Door has no FireRating', code: 'ids.attribute', severity: 'warning', source: { name: 'IDS' } },
    { text: 'x', sourceKind: 'regulation', severity: 'warning' }, { text: 'note only', severity: 'note' }, null,
  ]);
  ok(pc.length === 1 && pc[0].text === 'Door has no FireRating (2 elements)', 'duplicates counted; regulation problems (already in the checks) and notes left out');

  console.log('== cover, CSV, files');
  const md = P.permitMarkdown({ project: { name: 'Smith residence', address: '1 Main St', applicant: 'A. Smith', date: '2026-10-28' }, comments: c, problems: pc,
    report: { sum: { meets: 40, fails: 2, none: 1 } }, sheets: [{ name: 'A-101 Plans', included: true }, { name: 'A-201 Sections' }], forms: [{ name: 'Application form', done: true }], files: [{ name: P.NAMES.cover }, { name: P.NAMES.report, note: 'the regulation check' }] });
  ok(/^# Smith residence/.test(md) && /Rules failed: 2/.test(md) && /2 the drawing fails, 1 it meets by a hair, 1 it could not be checked/.test(md), 'the cover names the project and counts the comments');
  ok(/\[x\] A-101 Plans/.test(md) && /\[ \] A-201 Sections/.test(md) && /\[x\] Application form/.test(md), 'sheets and forms are a checklist');
  ok(/No representation is made/.test(md), 'it ends with the not-legal-advice line');
  const csv = P.commentsCsv([{ kind: 'fail', where: '=1+1', rule: 'a,b', clause: '', required: '', found: '', source: '', text: 'say "hi"', fix: '' }]);
  ok(csv.split('\r\n')[1].startsWith("fail,'=1+1,\"a,b\"") && /"say ""hi"""/.test(csv), 'CSV: formula cells neutralised, commas and quotes quoted');
  const files = P.packageFiles({ cover: md, comments: P.commentsCsv(c), ifc: new Uint8Array([1, 2, 3]), reportPdf: new Uint8Array([4, 5]), extra: [{ name: 'A-101/Plans?.pdf', data: new Uint8Array([9]) }] });
  ok(files.map((f) => f.name).join() === '00-cover.md,01-review-comments.csv,02-regulation-report.pdf,03-model.ifc,A-101_Plans_.pdf', 'five files with fixed names; an extra file name is cleaned');
  const z = zip(files), back = await unzip(z);
  ok(back.size === 5 && back.get('03-model.ifc').length === 3 && new TextDecoder().decode(back.get('00-cover.md')) === md, 'the zip holds them and reads back');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
