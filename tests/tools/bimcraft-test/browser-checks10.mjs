/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-checks10.mjs: the audit, the verification state, the as-built handover package and plans marked unverified, on the real
 * /lab page (0.10 BK.65, BK.20, BK.49, BK.64; session bk-r3-checks-10). Run as root: node tools/bimcraft-test/browser-checks10.mjs
 * [--shots <dir>]. Built on the shared harness bk-page.mjs; the model is THE small house (fixtures/bimcraft/small-house.ifc), so the
 * numbers are the ones worked by hand in checks10-test.mjs. The PDF with a text layer is made here from fixtures/raster/plan-truth.json
 * (plan A's faces and swing arcs, its three room names as real text).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { openLab, REPO } from './bk-page.mjs';

const FIXTURE = path.join(REPO, 'fixtures/bimcraft/small-house.ifc');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-checks10-'));
const L = await openLab({ tag: 'bimchecks10', units: 'mm', viewport: { width: 1600, height: 1400 } });
const { page, ok } = L;
if (process.argv.includes('--stacks')) page.on('pageerror', (e) => console.log('  STACK ' + String(e.stack).slice(0, 1200)));
const status = () => page.textContent('[data-status]');
const noOffer = () => page.evaluate(() => document.querySelector('.nh-offer [data-k="no"]')?.click());
const download = async (fn) => { await noOffer(); const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), fn()]); const f = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(f); return { name: dl.suggestedFilename(), file: f }; };
const audit = () => page.evaluate(() => { const P = window.ccProblems.store.list({}).filter((p) => p.id.startsWith('bimcraft.audit:')); const by = {}; for (const p of P) by[p.code] = (by[p.code] || 0) + 1; return { n: P.length, by, errors: P.filter((p) => p.severity === 'error').length, texts: P.map((p) => p.text) }; });
const sumOf = (set) => page.evaluate((s) => { const li = document.querySelector(`[data-audit-sum="${s}"]`); return li ? { found: Number(li.dataset.found), text: li.textContent } : null; }, set);
const runAudit = async () => { await page.click('[data-audit-run]'); await L.waitStatus(/^Audit done/); };
const verifyOpen = async () => { await page.waitForSelector('[data-verify]'); await page.evaluate(() => { const d = document.querySelector('[data-verify]'); if (!d.open) d.open = true; }); };
const stateAttr = () => page.evaluate(() => document.querySelector('[data-verify-state]')?.dataset.verifyState || '');
const marks = () => page.evaluate(() => (window.bimcraftPlan.view.overlay?.symbols || []).filter((s) => s.verify).map((s) => s.verify + ':' + (s.texts?.[0]?.text || '') + ':' + (s.dashed?.length || 0)));

try {
  console.log('== BK.65 the Audit section on the small house');
  await page.setInputFiles('[data-file]', FIXTURE);
  await L.waitStatus(/^Opened /, 120000);
  if (!(await page.evaluate(() => !!window.bimcraftPlan?.state?.on))) await page.click('[data-model-toggle]');
  await page.waitForFunction(() => window.bimcraftPlan?.state?.on && window.bimcraftPlan.state.data?.walls?.length === 5, null, { timeout: 120000 });
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);   // View › Plan: the plan alone
  await L.settled();
  await page.evaluate(() => document.querySelector('[data-audit-open]').click());
  await page.waitForSelector('[data-audit-run]');
  ok(await page.locator('[data-audit-set]').count() === 6 && await page.evaluate(() => [...document.querySelectorAll('[data-audit-set]')].every((c) => c.checked)), 'Tools › Audit opens the section: six rule sets, all ticked');
  ok(/No project stage is set/.test(await page.textContent('[data-audit-need]')), 'with no project stage it says the LOD is not checked');
  await runAudit();
  let a = await audit();
  ok(a.n === 0 && (await sumOf('rooms')).found === 0 && /Nothing found/.test((await sumOf('tags')).text), 'the house as drawn: nothing found, each rule set says so', a);
  await page.selectOption('[data-audit-stage]', 'submission');
  await page.waitForFunction(() => /asks for LOD 300/.test(document.querySelector('[data-audit-need]')?.textContent || ''));
  ok(await page.evaluate(() => window.ccDocInfo.info.get().stage) === 'submission', 'the stage chosen here is the drawing details\' project stage (one field)');
  await runAudit();
  a = await audit();
  // worked in checks10-test.mjs: 5 doors and windows at LOD 200 are below 300; 10 elements with no tag are one note
  ok(a.n === 6 && a.by['audit.lod.below'] === 5 && a.by['audit.lod.untagged'] === 1 && a.errors === 0, 'at Submission: 5 elements below LOD 300 and one note for the 10 with no tag, in the Problems list, none an error', a);
  ok(/Asked: LOD 300\. Below it: 5\. With no LOD tag: 10\./.test((await sumOf('lod')).text) && (await sumOf('lod')).found === 6, 'the LOD line: asked 300, 5 below, 10 untagged');
  const rep = await page.evaluate(() => { const r = window.ccProblems.report(); const s = (r.checkSets || []).find((c) => c.kind === 'audit'); return { rows: r.rows.filter((x) => x.id.startsWith('bimcraft.audit:')).length, set: s ? { title: s.title, n: s.specs.length, fail: s.counts.fail, lod: s.specs.find((x) => /LOD/.test(x.name)) } : null, legal: r.notLegalAdvice }; });
  ok(rep.rows === 6 && rep.set && rep.set.n === 6 && rep.set.fail === 1 && rep.set.lod.failed === 6 && rep.set.lod.applicable === 15 && /Submission/.test(rep.set.title), 'the check report (the shared Problems report) carries the 6 findings and the six rule sets, the LOD one failed', rep);
  const html = await download(() => page.click('[data-audit-report]'));
  const htmlText = fs.readFileSync(html.file, 'utf8');
  ok(/\.html$/.test(html.name) && /Audit: Submission stage/.test(htmlText) && /D1 is at LOD 200; the Submission stage asks for LOD 300\./.test(htmlText), 'The check report downloads the report page: the audit heading and the findings are in it');
  await L.shot('checks10-01-audit');
  // an office table: Submission asks LOD 200
  await page.evaluate(() => { document.querySelector('[data-audit-table]').open = true; });
  await page.selectOption('[data-audit-lod="submission"]', '200');
  await page.waitForFunction(() => /asks for LOD 200/.test(document.querySelector('[data-audit-need]')?.textContent || ''));
  await runAudit();
  a = await audit();
  ok(a.n === 1 && a.by['audit.lod.untagged'] === 1, 'the table set to LOD 200 for Submission: nothing is below, the untagged note stays', a);
  await page.evaluate(() => { document.querySelector('[data-audit-table]').open = true; });
  await page.selectOption('[data-audit-lod="submission"]', '');
  // the Problems panel: a finding picks its element, and can be accepted (never blocking)
  const picked = await page.evaluate(async () => { const p = window.ccProblems.store.list({}).find((x) => x.id.startsWith('bimcraft.audit:')); const ok2 = window.ccProblems.store.accept(p.id, { by: 'Test' }); return { ok: !!ok2, open: window.ccProblems.store.list({}).filter((x) => x.id.startsWith('bimcraft.audit:') && !x.accepted).length }; });
  ok(picked.ok && picked.open === 0, 'a finding is accepted in the Problems list like any other (advisory, nothing blocked)', picked);

  console.log('== BK.64 / BK.49 Properties › Verification, the plan\'s marks, the schedule');
  await L.frame(-500, -500, 10500, 7500);
  await L.mouseClick(4000, 0);   // the south wall, between its door and its window
  await verifyOpen();
  ok(await stateAttr() === 'none' && /No mark/.test(await page.textContent('[data-verify-state]')), 'a wall drawn by hand: no mark');
  await page.click('[data-verify-un]');
  await L.waitStatus(/1 element marked as unverified/); await L.settled();
  await verifyOpen();
  ok(await stateAttr() === 'unverified', 'Mark as unverified: the wall says Unverified');
  let m = await marks();
  ok(m.length === 1 && m[0] === 'unverified:?:4', 'the plan draws it with a dashed box and a "?"', m);
  await L.shot('checks10-02-unverified');
  await page.fill('[data-verify-by]', '');
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.author'); } catch (e) { /* none */ } });
  await page.fill('[data-verify-by]', 'Ann Lee');
  await page.click('[data-verify-checked]');
  await L.waitStatus(/1 element marked as checked/); await L.settled();
  await verifyOpen();
  ok(await stateAttr() === 'checked' && /Checked by Ann Lee on \d{4}-\d\d-\d\d/.test(await page.textContent('[data-verify-state]')) && (await marks()).length === 0, 'Mark as checked: who and when are shown; the plan mark goes');
  await page.selectOption('[data-verify-method]', 'laser');
  await page.click('[data-verify-field]');
  await L.waitStatus(/1 element marked as field-verified \(LOD 500\)/); await L.settled();
  await verifyOpen();
  ok(await stateAttr() === 'field-verified' && /Field-verified \(LOD 500\) by Ann Lee on .*laser distance meter/.test(await page.textContent('[data-verify-state]')), 'Mark as field-verified: LOD 500, who, when and how');
  m = await marks();
  ok(m.length === 1 && m[0].startsWith('field-verified:✓'), 'the plan shows a tick on it', m);
  const inFile = await page.evaluate(async () => { const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const A = window.bimcraftRes.api, e = A.ed(), w = new ModelWriter(e.W, e.api, e.mid); const id = A.selectedKeys()[0] - A.kb(); return w.readPset(id, 'CadCraft_Verification'); });
  ok(inFile.State === 'field-verified' && inFile.By === 'Ann Lee' && inFile.Method === 'laser' && inFile.LevelOfDevelopment === 'LOD 500', 'in the IFC: CadCraft_Verification on the wall', inFile);
  const before = (await L.changes()).length;
  await page.keyboard.press('Escape'); await page.mouse.move(10, 10);
  await page.keyboard.press('Control+z'); await L.settled();
  ok((await L.changes()).length === before - 1 && (await page.evaluate(() => window.bimcraftVerify.records()[0]?.record.state)) === 'checked', 'one Ctrl+Z: checked again');
  await page.keyboard.press('Control+y'); await L.settled();
  // a door: Tools › Mark as checked on the pick, and its lintel note
  await L.mouseClick(2957, 0);
  await page.waitForFunction(() => !!document.querySelector('[data-verify-lintel]'));
  await page.evaluate(() => document.querySelector('[data-verify-mark]').click());
  await L.waitStatus(/1 element marked as checked/); await L.settled();
  ok((await page.evaluate(() => window.bimcraftVerify.records().map((x) => x.record.state).sort().join())) === 'checked,field-verified', 'Mark as checked (Tools) marks the picked door today: two elements carry a mark');
  await verifyOpen();
  await page.fill('[data-verify-lintel]', 'Precast lintel by the engineer');
  await page.keyboard.press('Enter');
  await L.waitStatus(/Lintel note saved/); await L.settled();
  ok(true, 'a door takes a lintel or header note in Properties');
  if (await page.getAttribute('[data-msched-sec] > h2', 'aria-expanded') === 'false') await page.click('[data-msched-sec] > h2', { position: { x: 20, y: 10 } });
  await page.selectOption('[data-msched-kind]', 'verification');
  const sch = await page.evaluate(() => document.querySelector('[data-msched]')?.innerText || '');
  ok(/Field-verified \(LOD 500\)/.test(sch) && /Checked/.test(sch) && /Ann Lee/.test(sch) && /0 unverified, 1 checked, 1 field-verified/.test(sch), 'Schedules › Verification lists both with state, who and the totals', sch.slice(0, 300));
  // the audit at Close-out: the field-verified wall passes LOD 500
  await page.selectOption('[data-audit-stage]', 'close-out');
  await runAudit();
  ok(/Asked: LOD 500\. Below it: 5\. With no LOD tag: 9\./.test((await sumOf('lod')).text), 'at Close-out (LOD 500): the field-verified wall passes; 5 below, 9 untagged', (await sumOf('lod')).text);
  await page.uncheck('[data-audit-marks]');
  ok((await marks()).length === 0, 'Show verification marks in the plan, unticked: no marks');
  await page.check('[data-audit-marks]');

  console.log('== BK.49 the handover package with the as-built part');
  await page.evaluate(() => { window.ccProblems.close(); document.querySelector('[data-rtab="assets"]').click(); }); await page.waitForSelector('[data-rpane="assets"]:not([hidden])');
  await page.waitForSelector('[data-ho]');
  if (!(await page.evaluate(() => document.querySelector('[data-ho]')?.open))) await page.click('[data-ho] > summary');
  const pkg = await download(() => page.click('[data-ho-build]'));
  const st = await status();
  ok(/-handover-package\.zip$/.test(pkg.name) && /As-built: 1 of \d+ elements field-verified\./.test(st), 'the handover package is built and says how much is field-verified: ' + st);
  const out = path.join(TMP, 'pkg');
  execFileSync('unzip', ['-q', '-o', pkg.file, '-d', out]);
  const names = execFileSync('find', [out, '-type', 'f'], { encoding: 'utf8' }).trim().split('\n').map((f) => path.relative(out, f)).sort();
  ok(['README.md', 'handover-documents.csv', 'small-house COBie.xlsx', 'small-house-as-built.ifc', 'as-built/as-built-statement.md', 'as-built/verified-elements.csv', 'as-built/as-built-drawings.pdf'].every((n) => names.includes(n)), 'one zip: cover, document list, COBie, the as-built IFC, the statement, the verified elements and the as-built drawings', names);
  const ifc = fs.readFileSync(path.join(out, 'small-house-as-built.ifc'), 'utf8');
  ok(/CadCraft_AsBuilt/.test(ifc) && /'FieldVerified',\$,IFCINTEGER\(1\)/.test(ifc) && /CadCraft_Verification/.test(ifc) && /'State',\$,IFCLABEL\('field-verified'\)/.test(ifc), 'the as-built IFC states it: CadCraft_AsBuilt on the project (1 field-verified) and the wall\'s own record');
  const pdf = fs.readFileSync(path.join(out, 'as-built/as-built-drawings.pdf'));
  ok(pdf.subarray(0, 5).toString() === '%PDF-' && pdf.length > 5000, 'the as-built drawings are the drawing set as a PDF (' + pdf.length + ' bytes)');
  const csv = fs.readFileSync(path.join(out, 'as-built/verified-elements.csv'), 'utf8');
  ok(csv.split('\r\n').filter((l) => /,field-verified,Ann Lee,/.test(l)).length === 1 && csv.split('\r\n').filter((l) => /,checked,/.test(l)).length === 1, 'verified-elements.csv: the wall field-verified, the door checked');
  const readme = fs.readFileSync(path.join(out, 'README.md'), 'utf8');
  ok(/## As-built model/.test(readme) && /1 field-verified \(measured on site, LOD 500\), 1 checked/.test(readme) && /as-built\/as-built-drawings\.pdf/.test(readme), 'the cover lists the as-built files and the totals');
  await page.evaluate(() => document.querySelector('[data-rtab="props"]').click());

  console.log('== BK.64 a PDF with text becomes walls, doors and rooms, all unverified; rooms named from the text');
  const truth = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/raster/plan-truth.json'), 'utf8')).A;
  const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
  const { PDFDocument, StandardFonts, pushGraphicsState, popGraphicsState, setLineWidth, moveTo, lineTo, stroke, appendBezierCurve } = PDFLib;
  const PT = 72 / 25.4, ptx = (v) => v / 50 * PT;
  const doc = await PDFDocument.create({ updateMetadata: false });
  const pg = doc.addPage([297 * PT, 210 * PT]);
  const ops = [pushGraphicsState()];
  for (const [x1, y1, x2, y2] of truth.faces) ops.push(setLineWidth(0.5), moveTo(ptx(x1), ptx(y1)), lineTo(ptx(x2), ptx(y2)), stroke());
  for (const c of truth.arcs) {
    const t0 = c.a0 * Math.PI / 180, t1 = c.a1 * Math.PI / 180, k = 4 / 3 * Math.tan((t1 - t0) / 4);
    const at = (t) => [c.cx + c.r * Math.cos(t), c.cy + c.r * Math.sin(t)], d = (t) => [-c.r * Math.sin(t), c.r * Math.cos(t)];
    const P0 = at(t0), P3 = at(t1), D0 = d(t0), D3 = d(t1);
    ops.push(setLineWidth(0.5), moveTo(ptx(P0[0]), ptx(P0[1])), appendBezierCurve(ptx(P0[0] + k * D0[0]), ptx(P0[1] + k * D0[1]), ptx(P3[0] - k * D3[0]), ptx(P3[1] - k * D3[1]), ptx(P3[0]), ptx(P3[1])), stroke());
  }
  ops.push(popGraphicsState());
  pg.pushOperators(...ops);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  // plan A: a partition at x 7350 and one at y 5750 left of it → three rooms; a name in each, a dimension and the scale outside
  for (const [s, x, y, size] of [['KITCHEN', 2400, 2600, 10], ['BED 1', 2400, 8300, 10], ['LIVING', 9500, 5000, 10], ['12000', 6800, 600, 7], ['1:50', 12000, 300, 7]]) pg.drawText(s, { x: ptx(x), y: ptx(y), size, font });
  const pdfFile = path.join(TMP, 'plan-text.pdf');
  fs.writeFileSync(pdfFile, await doc.save({ useObjectStreams: false }));
  page.on('dialog', (d) => d.accept().catch(() => {}));
  await page.reload({ waitUntil: 'networkidle' });   // a fresh page: the empty state's New building
  await L.newBuilding({ name: 'From a PDF', levels: 1, height: '3000 mm' });
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);
  await page.waitForFunction(() => window.bimcraftPlan?.state?.on && window.bimcraftPlan.state.data?.walls?.length === 0, null, { timeout: 60000 });
  await page.evaluate(() => document.querySelector('[data-trace-open]').click());   // inside the Build menu: its own click, as the menu gives it
  await page.setInputFiles('[data-trace-file]', pdfFile);
  await page.waitForSelector('[data-plans-make]', { timeout: 30000 });
  await page.fill('[data-plans-ratio]', '50');
  await page.waitForFunction(() => /^Makes 6 walls, 3 doors and 2 windows/.test(document.querySelector('[data-plans-count]')?.textContent || ''), null, { timeout: 30000 });
  await page.click('[data-plans-make]');
  await L.settled();
  ok(/What was recognised is marked unverified until you check it\./.test(await status()), 'the status line says what was recognised is unverified: ' + await status());
  const made = await page.evaluate(() => { const S = window.bimcraftPlan.state, R = window.bimcraftVerify.records(); const c = {}; for (const x of R) { const k = x.cls + ':' + x.record.state + ':' + x.record.source; c[k] = (c[k] || 0) + 1; } return { walls: S.data.walls.length, openings: S.data.openings.length, rooms: S.data.derived.spaces.map((x) => x.name).sort(), records: c, total: R.length }; });
  // plan-truth.json A: 6 walls, 3 doors, 2 windows; its two partitions close 3 rooms
  ok(made.walls === 6 && made.openings === 5 && made.total === 14 && made.records['IfcWall:unverified:pdf'] === 6 && made.records['IfcDoor:unverified:pdf'] === 3 && made.records['IfcWindow:unverified:pdf'] === 2 && made.records['IfcSpace:unverified:pdf'] === 3, '6 walls, 3 doors, 2 windows and 3 rooms, every one unverified, source PDF', made);
  ok(made.rooms.join() === 'BED 1,KITCHEN,LIVING', 'the three rooms take their names from the page\'s text: ' + made.rooms.join(', '));
  m = await marks();
  ok(m.length === 14 && m.every((x) => x.startsWith('unverified:?')), 'the plan marks all 14 with a dashed box and "?"', m.length);
  await L.shot('checks10-03-traced');
  await page.evaluate(() => document.querySelector('[data-audit-open]').click());
  await page.selectOption('[data-audit-stage]', '');
  await runAudit();
  a = await audit();
  ok(a.by['audit.unverified'] === 14 && !a.by['audit.room.unnamed'] && /was recognised from a PDF and has not been checked by a person\./.test(a.texts.find((x) => /recognised/.test(x)) || ''), 'the audit lists the 14 unverified elements; the rooms have names', a.by);
  // pick everything, Mark as checked
  await page.evaluate(() => { const A = window.bimcraftRes.api, S = window.bimcraftPlan.state, k = A.kb(); A.host.select([...S.data.walls, ...S.data.openings, ...S.data.derived.spaces].map((x) => k + x.id)); });
  await page.waitForFunction(() => document.querySelector('[data-verify]')?.dataset.count === '14');
  await verifyOpen();
  ok(/14 elements: 14 unverified, 0 checked, 0 field-verified, 0 with no mark\./.test(await page.textContent('[data-verify-state]')), 'Properties for the selection: 14 unverified');
  await page.fill('[data-verify-by]', 'Ann Lee');
  await page.click('[data-verify-checked]');
  await L.waitStatus(/14 elements marked as checked/); await L.settled();
  ok((await marks()).length === 0 && (await page.evaluate(() => window.bimcraftVerify.records().every((x) => x.record.state === 'checked' && x.record.source === 'pdf'))), 'Mark as checked for the selection: one step, every mark gone from the plan, each still says it came from a PDF');
  await runAudit();
  ok(!(await audit()).by['audit.unverified'], 'the audit no longer lists them');
  // BK.49: what the scan compare hands over (its button calls this with the keys the scan matched): field-verified, method scan
  const viaScan = await page.evaluate(() => { const A = window.bimcraftRes.api, S = window.bimcraftPlan.state, k = A.kb(); return window.bimcraftVerify.fromScan(S.data.walls.slice(0, 2).map((x) => k + x.id), { by: 'Ann Lee', note: 'Matched a scan within 50 mm' }); });
  await L.waitStatus(/2 elements marked as field-verified/); await L.settled();
  const scanned = await page.evaluate(() => window.bimcraftVerify.records().filter((x) => x.record.state === 'field-verified').map((x) => x.record.method + '|' + x.record.note + '|' + x.record.source));
  ok(viaScan === true && scanned.length === 2 && scanned.every((x) => x === 'scan|Matched a scan within 50 mm|pdf'), 'elements a scan matched become field-verified with the method scan and the tolerance in the note (two walls)', scanned);
  await page.mouse.move(10, 10); await page.keyboard.press('Escape');
} catch (e) { ok(false, 'the run stopped: ' + String(e.message || e).slice(0, 400)); await L.shot('checks10-stopped').catch(() => {}); }
const code = L.done();
await L.close();
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(code);
