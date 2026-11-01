#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-native.mjs — 0.7.1 71.27 (owner 2026-10-26): CivilCraft saves the project as a pair, <name>.civilcraft.json + <name>.ifc
 * (IFC 4.3 with the project embedded), and opens either (ifc-native.js). Every case of the owner's list: both matching, the IFC changed by
 * another program (IfcOpenShell deletes an element and changes a property: tools/civilcraft-test/ifc-edit.py), one file older than the
 * other, only the IFC (intact / changed: keep what still matches), only the JSON, an IFC that is not CivilCraft's; the round trip byte for
 * byte; IfcOpenShell validation (rules on) of the native file; sizes and times on the showcase projects and a 50,000-point site.
 *
 *   node bin/test-civilcraft-native.mjs [--verbose] [--no-ifcopenshell]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/ifc');
const VERBOSE = process.argv.includes('--verbose');
const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');
const IOS = !process.argv.includes('--no-ifcopenshell') && fs.existsSync(PY);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
(await mod('i18n.js')).init({ strings: EN });
const PJ = await mod('project.js'), NA = await mod('ifc-native.js'), RD = await mod('ifc-civil-read.js'), PB = await mod('problems-civilcraft.js');
await mod('ifc-native-ui.js');   // loaded, so a slip shows here first

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const section = (s) => console.log('\n== ' + s);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-native-'));
const enc = (s) => new TextEncoder().encode(s);
const edit = (src, dst, ...args) => JSON.parse(execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-edit.py'), src, dst, ...args], { encoding: 'utf8' }));
const T0 = new Date('2026-10-26T10:00:00Z'), T1 = new Date('2026-10-26T11:00:00Z');

try {
  const json0 = fs.readFileSync(path.join(FIX, 'demo.civilcraft.json'), 'utf8');
  const p = PJ.Project.fromJSON(JSON.parse(json0)).project;

  section('save: the pair');
  const w = await NA.writePair(p, { stem: 'demo', now: T0 });
  ok(w.jsonName === 'demo.civilcraft.json' && w.ifcName === 'demo.ifc', 'names: demo.civilcraft.json + demo.ifc');
  const obj = JSON.parse(w.jsonText);
  ok(obj.pair?.ifc === 'demo.ifc' && obj.pair.schema === 'IFC4X3_ADD2' && obj.pair.entityHash === w.entityHash && obj.pair.savedAt === T0.toISOString(), 'the JSON names its IFC, the schema, the IFC\'s element fingerprint and when', obj.pair);
  ok(/FILE_SCHEMA\(\('IFC4X3_ADD2'\)\);/.test(w.ifcText) && /'CadCraft_Native'/.test(w.ifcText) && w.ifcText.includes("'" + w.jsonHash + "'"), 'the IFC is IFC 4.3 with CadCraft_Native on the project, naming the JSON\'s hash');
  const r0 = await NA.readNative(enc(w.ifcText));
  ok(r0.native && r0.native.jsonText === w.jsonText && r0.native.jsonName === 'demo.civilcraft.json' && r0.current.all === w.entityHash, 'read back: the embedded project is the JSON file byte for byte; the elements are as written');
  ok(Object.keys(r0.native.elements).length > 50 && Object.values(r0.native.elements).every(([tag]) => tag), 'every element CivilCraft wrote is recorded with the object it came from', Object.keys(r0.native.elements).length);
  // the round trip: open the JSON, save again (same moment): the same JSON text
  const p2 = PJ.Project.fromJSON(JSON.parse(w.jsonText)).project, w2 = await NA.writePair(p2, { stem: 'demo', now: T0 });
  ok(w2.jsonText === w.jsonText && w2.ifcText === w.ifcText, 'open → save gives both files byte for byte again');
  const p3 = PJ.Project.fromJSON(JSON.parse(r0.native.jsonText)).project;
  ok(JSON.stringify({ ...p3.toJSON(), saved: 0 }) === JSON.stringify({ ...p2.toJSON(), saved: 0 }), 'the project opened from the IFC alone is the same project');
  const ifc0 = path.join(TMP, 'demo.ifc');
  fs.writeFileSync(ifc0, w.ifcText);
  if (IOS) {
    const v = JSON.parse(execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-check.py'), ifc0, '--samples', '2'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
    ok(v.nproblems === 0 && v.counts.IfcAlignment === 1 && v.counts.IfcRoad === 1, 'other tools see a valid IFC 4.3: IfcOpenShell (rules on) finds nothing', v.problems);
  }

  section('open: the cases');
  const both = (ifcText, jsonText, names = ['demo.ifc', 'demo.civilcraft.json']) => NA.readNative(enc(ifcText)).then((r) => NA.decide({ ifc: { name: names[0], native: r.native, current: r.current }, json: jsonText === null ? null : { name: names[1], text: jsonText } }));
  let d = await both(w.ifcText, w.jsonText);
  ok(d.open === 'json' && d.text === w.jsonText && !d.warnings.length, 'both, matching: the JSON opens, no warning');
  if (IOS) {
    edit(ifc0, path.join(TMP, 'resaved.ifc'), '--resave');
    d = await both(fs.readFileSync(path.join(TMP, 'resaved.ifc'), 'utf8'), w.jsonText);
    ok(d.open === 'json' && !d.warnings.length, 'the IFC re-saved by IfcOpenShell (its own formatting, nothing changed): still a match');
    const did = edit(ifc0, path.join(TMP, 'edited.ifc'), '--delete', 'Lot 1', '--set', 'Pad A', 'CadCraft_Pad', 'Elevation', '111');
    const edited = fs.readFileSync(path.join(TMP, 'edited.ifc'), 'utf8');
    d = await both(edited, w.jsonText);
    ok(did.length === 2 && d.open === 'json' && d.warnings[0]?.code === 'ifc.native.changed' && d.warnings[0].msg.vars.missing === 1 && d.warnings[0].msg.vars.changed === 1, 'the IFC changed by another program (an element deleted, a property changed): the JSON opens, warning ifc.native.changed (1 changed, 1 removed)', d.warnings);
    ok(d.diff.missing[0]?.tag === 'el|parcel|r6' && d.diff.changed[0]?.tag === 'el|pad|p2', 'and it knows which: the parcel removed, the pad changed', d.diff);
    ok(d.warnings[0].fixes.join() === 'ifcSave,ifcTake', 'offering: save now (writes both again) or show the IFC\'s geometry');
    // only the changed IFC: keep what still matches
    d = await both(edited, null);
    ok(d.open === 'embedded' && d.reconcile && d.warnings[0]?.code === 'ifc.native.changed', 'only the changed IFC: the embedded copy, reconciled, with the warning');
    const r1 = await NA.readNative(enc(edited)), read = RD.readCivilIfc(enc(edited), { units: 'm' }).alignments.map((a) => ({ ...a, gidTag: (r1.native.elements[a.gid]?.[0] || '').replace(/^el\|/, '') }));
    const rc = NA.reconcile(JSON.parse(d.text), d.diff, read);
    ok(rc.obj.parcels.length === 0 && rc.dropped.includes('Lot 1') && rc.obj.pads.length === 1 && rc.obj.pads[0].z === 110.5, 'the removed parcel is left out; the pad stays CivilCraft\'s (its change is warned, never silently taken)', rc);
    // an alignment changed elsewhere takes the IFC's own alignment
    edit(ifc0, path.join(TMP, 'al.ifc'), '--set', 'Main road', 'CadCraft_Alignment', 'StartStation', '1000.5', '--delete', 'P-1');
    const alT = fs.readFileSync(path.join(TMP, 'al.ifc'), 'utf8'), da = await both(alT, null), ra = await NA.readNative(enc(alT));
    const rda = RD.readCivilIfc(enc(alT), { units: 'm' }).alignments.map((a) => ({ ...a, gidTag: (ra.native.elements[a.gid]?.[0] || '').replace(/^el\|/, '') }));
    const rca = NA.reconcile(JSON.parse(da.text), da.diff, rda);
    ok(rca.replaced.includes('Main road') && rca.dropped.includes('P-1') && rca.obj.network.pipes.length === 0 && rca.obj.network.structures.length === 2, 'an alignment changed in the IFC takes the IFC\'s geometry; a removed pipe is left out', { replaced: rca.replaced, dropped: rca.dropped });
    ok(PJ.Project.fromJSON(rca.obj).project.alignment(rca.obj.alignments[0]).ok, 'the reconciled project opens and its alignment builds');
  }
  // one file older than the other
  p2.change('rename', (s) => { s.name = 'IFC demo road'; s.alignments[0].name = 'Main road B'; });
  const wNew = await NA.writePair(p2, { stem: 'demo', now: T1 });
  d = await both(w.ifcText, wNew.jsonText);
  ok(d.open === 'json' && d.text === wNew.jsonText && d.warnings[0]?.code === 'ifc.native.stale' && d.warnings[0].msg.key === 'ifc.native.stale.ifc', 'the JSON newer than the IFC: the JSON opens, warning ifc.native.stale (the IFC is older)');
  d = await both(wNew.ifcText, w.jsonText);
  ok(d.open === 'embedded' && d.text === wNew.jsonText && d.warnings[0]?.msg.key === 'ifc.native.stale.json', 'the IFC newer than the JSON: the project inside the IFC opens, warning ifc.native.stale (the JSON is older)');
  d = await both(w.ifcText, null);
  ok(d.open === 'embedded' && d.text === w.jsonText && !d.warnings.length, 'only the IFC, intact: the embedded project opens as it was saved');
  d = NA.decide({ json: { name: 'demo.civilcraft.json', text: w.jsonText } });
  ok(d.open === 'json' && d.warnings[0]?.code === 'ifc.native.missing', 'only the JSON: it opens, warning ifc.native.missing (written on the next save)');
  d = NA.decide({ json: { name: 'old.civilcraft.json', text: json0 } });
  ok(d.open === 'json' && !d.warnings.length, 'a project file from before the pair opens as it always did');
  const foreign = await NA.readNative(fs.readFileSync(path.join(FIX, 'demo-4x3.ifc')));
  ok(!foreign.native && NA.decide({ ifc: { name: 'x.ifc', native: null, current: foreign.current } }).open === 'import', 'an IFC CivilCraft did not save natively: the IFC import, as before');
  d = NA.decide({ ifc: { name: 'x.ifc', native: null, current: foreign.current }, json: { name: 'demo.civilcraft.json', text: w.jsonText } });
  ok(d.open === 'json' && d.warnings[0]?.msg.key === 'ifc.native.foreign', 'a JSON beside an IFC that is not its own: the JSON, with that said');
  // the Problems panel entries
  const pr = PB.civilProblems({ native: [{ ...NA.decide({ json: { name: 'demo.civilcraft.json', text: w.jsonText } }).warnings[0], text: 'x', fixes: [{ id: 'ifcSave', action: 'ifcSave', text: 'Save' }] }] });
  ok(pr.length === 1 && pr[0].code === 'ifc.native.missing' && pr[0].fixes[0].action === 'ifcSave' && pr[0].severity === 'warning', 'the warning goes to the Problems panel with its fix');
  for (const k of ['ifc.native.changed', 'ifc.native.changed.alone', 'ifc.native.stale.ifc', 'ifc.native.stale.json', 'ifc.native.missing', 'ifc.native.foreign', 'ifc.native.fix.save', 'ifc.native.fix.take', 'ifc.pair.saved', 'ifc.pair.ask']) ok(typeof EN[k] === 'string', 'words: ' + k);

  section('size and time (owner: "blob size sane — measure on the showcase project")');
  const rows = [];
  for (const f of ['civilcraft-garden.civilcraft.json', 'civilcraft-power-lines.civilcraft.json', 'civilcraft-site-massing.civilcraft.json']) {
    const q = PJ.Project.fromJSON(JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/showcase', f), 'utf8'))).project;
    const t0 = performance.now(), x = await NA.writePair(q, { stem: 's', now: T0 }), t1 = performance.now(), y = await NA.readNative(enc(x.ifcText)), t2 = performance.now();
    rows.push([f, x.jsonText.length, x.embeddedBytes, x.ifcText.length, Math.round(t1 - t0), Math.round(t2 - t1)]);
    ok(y.native.jsonText === x.jsonText, f + ': round trip');
  }
  {
    const q = new PJ.Project(); q.state.units = 'm';
    const pts = []; for (let i = 0; i < 50000; i++) pts.push({ n: i + 1, x: 1000 + (i % 250) * 2 + ((i * 7919) % 13) * 0.01, y: 2000 + Math.floor(i / 250) * 2, z: 100 + Math.sin(i / 300) * 3, d: 'G' });
    q.setPoints(pts, 'big.csv');
    const t0 = performance.now(), x = await NA.writePair(q, { stem: 'big', now: T0 }), t1 = performance.now(), y = await NA.readNative(enc(x.ifcText)), t2 = performance.now();
    rows.push(['50,000 survey points (TIN ~100k triangles)', x.jsonText.length, x.embeddedBytes, x.ifcText.length, Math.round(t1 - t0), Math.round(t2 - t1)]);
    ok(y.native.jsonText === x.jsonText && t1 - t0 < 60000 && t2 - t1 < 30000, '50,000 points: written and read back (' + Math.round(t1 - t0) + ' ms / ' + Math.round(t2 - t1) + ' ms)');
    ok(x.embeddedBytes < x.ifcText.length / 2, 'the embedded project stays well under half the IFC (' + Math.round(x.embeddedBytes / 1024) + ' KB of ' + Math.round(x.ifcText.length / 1024) + ' KB)');
  }
  console.log('  project | JSON bytes | embedded (gzip) | IFC bytes | write ms | read ms');
  for (const r of rows) console.log('  ' + r.join(' | '));
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
