/* SPDX-License-Identifier: Apache-2.0 */
/**
 * permit-checklist-test.mjs: the authority's supporting documents (BK.109, session bk-stages-10), DOM-free:
 *   node bin/test-bimcraft.mjs --permitchecklist
 * Pack validation (every shipped pack, and bad ones), link resolution against the real sheets and schedules of a test model,
 * the missing list, the person's choices kept in the IFC, and the section on the permit package's cover.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function permitChecklistMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const C = await import(path.join(APP, 'permit-checklist.js'));
  const P = await import(path.join(APP, 'permit-package.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MS = await import(path.join(APP, 'model-site.js'));
  const SC = await import(path.join(APP, 'model-site-constraints.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { t, missing } = await import(path.join(APP, 'i18n.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const DIR = path.join(APP, 'permit-checklists');
  const load = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

  console.log('== the shipped packs are valid data, each with its sources, each unverified');
  const index = load('index.json');
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json').sort();
  ok(index.format === 'cadcraft-submission-checklist-index' && index.packs.map((p) => p.file).sort().join() === files.join() && files.length === 1 && files[0] === 'generic.json', 'index.json lists exactly the generic list: the authority lists are regulation packs now (BK.67/156)', files);
  // the four authority lists are the `submission` sections of regulation packs (addons/regs), read through the one engine
  const RG = await import(path.join(APP, 'addons/regs/lib/regs.js'));
  const SEC = await import(path.join(APP, 'addons/regs/lib/sections.js'));
  const regsMap = new Map();
  for (const id of JSON.parse(fs.readFileSync(path.join(APP, 'addons/regs/packs/index.json'), 'utf8')).packs) { const r = RG.cleanPack(JSON.parse(fs.readFileSync(path.join(APP, 'addons/regs/packs', id + '.json'), 'utf8'))); if (r.ok) regsMap.set(id, r.pack); }
  { const r = RG.cleanPack(JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/regulations/world/za-wc-cape-town.json'), 'utf8'))); if (r.ok) regsMap.set(r.pack.id, r.pack); }
  const AUTH = ['za-sans10400', 'za-wc-cape-town', 'gb-eng-planning', 'us-or-portland'];
  const fromPack = (id) => SEC.checklistFromSections(RG.resolve(regsMap, id));
  console.log('   regs packs read:', [...regsMap.keys()].join(' '));
  const packs = new Map();
  for (const f of files) {
    const r = C.cleanChecklist(load(f));
    ok(r.pack && r.problems.length === 0 && r.pack.id + '.json' === f && index.packs.find((p) => p.file === f)?.id === r.pack.id, f + ': valid, its id matches its file and the index', r.problems);
    if (r.pack) packs.set(r.pack.id, r.pack);
  }
  for (const id of AUTH) {
    const r = C.cleanChecklist(fromPack(id));
    ok(r.pack && r.problems.length === 0 && r.pack.id === id && r.pack.fromPack, id + ': a regulation pack\'s submission section makes a valid list', r.problems);
    if (r.pack) packs.set(id, r.pack);
  }
  const auth = [...packs.values()].filter((p) => p.review !== 'generic');
  ok(auth.length === 4 && auth.every((p) => p.sources.length >= 1 && p.sources.every((s) => /^https:\/\//.test(s.url) && /^2026-11-1\d$/.test(s.fetched) && s.licence && s.title)), 'the four authority packs each cite a source: title, https address, date fetched, licence');
  ok([...packs.values()].every((p) => C.isUnverified(p)) && auth.every((p) => p.review === 'unchecked' && p.note.length > 40), 'every pack is unverified by a local practitioner (review "unchecked"), and says so in its data');
  ok(packs.get('generic').review === 'generic' && packs.get('generic').sources.length === 0 && /not any authority/.test(packs.get('generic').note), 'the generic list is marked as no authority\'s');
  ok(['za-sans10400', 'za-wc-cape-town', 'gb-eng-planning', 'us-or-portland'].every((id) => packs.has(id)) && packs.get('za-sans10400').jurisdiction.country === 'ZA' && packs.get('gb-eng-planning').jurisdiction.country === 'GB' && packs.get('us-or-portland').jurisdiction.country === 'US', 'South Africa (national and Cape Town), England and Portland are there, by jurisdiction');
  ok([...packs.values()].every((p) => p.items.every((i) => (i.supplied ? i.satisfy.length === 0 : i.satisfy.length > 0) && i.source < Math.max(1, p.sources.length))), 'every item is either a paper the person supplies or says what in the model satisfies it; its source is one of the pack\'s');
  const za = packs.get('za-sans10400');
  ok(za.items.find((i) => i.id === 'site-plan').clause === 'A2(1)(a), A6' && /building line/.test(za.items.find((i) => i.id === 'site-plan').detail) && /servitude/.test(za.items.find((i) => i.id === 'site-plan').detail) && za.items.find((i) => i.id === 'drainage-installation').clause === 'A2(1)(d)', 'the South African list cites regulation A2 item by item (site plan A2(1)(a) with A6\'s building lines and servitudes; drainage A2(1)(d))');

  console.log('== bad packs are refused with reasons');
  const base = () => JSON.parse(JSON.stringify(fromPack('za-sans10400')));
  const why = (mut) => { const o = base(); mut(o); const r = C.cleanChecklist(o); return r.pack ? '' : r.problems.join(' | '); };
  ok(/not a cadcraft-submission-checklist/.test(C.cleanChecklist({ format: 'x' }).problems[0]) && C.cleanChecklist(null).pack === null && /version/.test(why((o) => { o.version = 2; })), 'another format, nothing, or an unknown version');
  ok(/cite at least one source/.test(why((o) => { o.sources = []; })), 'an authority list with no source', why((o) => { o.sources = []; }));
  ok(/https address/.test(why((o) => { o.sources[0].url = 'http://example.com/x'; })) && /https address/.test(why((o) => { o.sources[0].url = 'javascript:alert(1)'; })) && /fetched must be a date/.test(why((o) => { o.sources[0].fetched = 'last week'; })) && /licence is missing/.test(why((o) => { o.sources[0].licence = ''; })), 'a source without an https address, a fetch date or a licence');
  ok(/used twice/.test(why((o) => { o.items[1].id = o.items[0].id; })) && /unknown view kind/.test(why((o) => { o.items[2].satisfy = [{ view: ['hologram'] }]; })) && /unknown schedule kind/.test(why((o) => { o.items[2].satisfy = [{ schedule: ['secrets'] }]; })) && /say what satisfies it/.test(why((o) => { delete o.items[2].satisfy; })) && /is not one of the pack/.test(why((o) => { o.items[2].source = 7; })), 'a repeated item id, an unknown view or schedule kind, an item nothing satisfies, a source that is not there');
  ok(/must name them/.test(why((o) => { o.review = 'practitioner'; })) && C.cleanChecklist({ ...base(), review: 'practitioner', reviewedBy: 'A. Architect Pr.Arch' }).pack.review === 'practitioner' && C.cleanChecklist({ ...base(), review: 'trust me' }).pack.review === 'unchecked', 'a pack cannot call itself reviewed without naming the practitioner; any other word reads as unchecked');
  const hostile = C.cleanChecklist({ ...base(), name: 'X‮\u0000 <script>', extra: { run: 1 } }).pack;
  ok(hostile && !/[\u0000‮]/.test(hostile.name) && hostile.extra === undefined, 'control and direction characters are taken out; unknown fields are dropped');

  console.log('== a test model: sheets, a door schedule on a sheet, windows with no schedule sheet, a site');
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  let ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Checklist house', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'cl.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [2000, 6000], b: [8000, 6000] }, { a: [8000, 6000], b: [8000, 10000] }], typeKey: 'ext-2x6', height: 2700 }));
  const walls = OPS.snapshotModel(ed).walls;
  ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: walls[1].guid, typeKey: 'win-double-hung', face: 'right' }));
  for (const s of V.readSheets(W())) ed.modelChange(V.deleteSheet(s.id));   // start from no sheets, whatever a new building brings
  const facts = () => {
    const w = W(), snap = OPS.snapshotModel(ed), c = SC.readConstraints(w);
    return C.modelFacts({ sheets: V.readSheets(w), levels: snap.levels, counts: { doors: snap.openings.filter((o) => o.kind === 'door').length, windows: snap.openings.filter((o) => o.kind === 'window').length, rooms: (snap.derived?.spaces || []).length, walls: snap.walls.length },
      site: { outline: (c.site?.points.length || 0) >= 3, buildingLines: c.items.filter((x) => x.kind === 'buildingline').length, servitudes: c.items.filter((x) => x.kind === 'servitude').length } });
  };
  const gen = packs.get('generic');
  let rows = C.resolveChecklist(gen, facts(), {});
  const row = (id) => rows.find((r) => r.id === id);
  ok(rows.length === gen.items.length && rows.every((r) => r.status === 'missing') && C.summary(rows).missing === 11, 'no sheets: all eleven items of the generic list are missing', C.summary(rows));
  ok(row('door-schedule').hint === 'schedule:doors:1' && row('window-schedule').hint === 'schedule:windows:1' && /The model has 1 row for the door schedule, but no sheet holds that schedule yet/.test(C.hintText(row('door-schedule'), t)), 'the model has a door and a window: the hint says the schedule exists but is on no sheet yet');
  const mk = (number, title, views) => ed.modelChange(V.saveSheet({ number, title, paper: 'a3', views })).sheet;
  const sPlan = mk('A-101', 'Ground floor plan', [{ kind: 'plan', ref: L1.guid, x: 200, y: 150, ratio: 100 }]);
  const sElev = mk('A-201', 'North and east', [{ kind: 'elevation', ref: 'north', x: 120, y: 150, ratio: 100 }, { kind: 'elevation', ref: 'east', x: 300, y: 150, ratio: 100 }]);
  const sDoor = mk('A-601', 'Schedules', [{ kind: 'schedule', ref: 'doors', x: 200, y: 150, ratio: 0 }]);
  const sSite = mk('A-001', 'Site plan and locality', []);
  rows = C.resolveChecklist(gen, facts(), {});
  ok(row('floor-plans').status === 'linked' && row('floor-plans').how === 'auto' && row('floor-plans').by.length === 1 && row('floor-plans').by[0].id === sPlan && row('floor-plans').by[0].label === 'A-101 Ground floor plan' && row('floor-plans').by[0].why === 'view:plan', 'Floor plans → sheet A-101 (it holds a floor plan view of Level 1)', row('floor-plans'));
  ok(row('elevations').status === 'linked' && row('elevations').by[0].id === sElev && row('elevations').by[0].why === 'view:elevation', 'Elevations → sheet A-201 (it holds elevation views; its title does not say so)');
  ok(row('door-schedule').status === 'linked' && row('door-schedule').by[0].id === sDoor && row('door-schedule').by[0].why === 'schedule:doors', 'Door schedule → sheet A-601 (the door schedule is placed on it)');
  ok(row('window-schedule').status === 'missing' && row('window-schedule').hint === 'schedule:windows:1', 'Window schedule: still missing (the windows are in the model, their schedule is on no sheet); a sheet titled "Schedules" does not count');
  ok(row('site-plan').status === 'linked' && row('site-plan').by[0].id === sSite && row('site-plan').by[0].why === 'title', 'Site plan → sheet A-001 by its title');
  ok(row('sections').status === 'missing' && row('sections').hint === '' && row('form').status === 'missing' && row('form').by.length === 0, 'Sections: missing (no section view, no sheet titled so); the application form is never found in the model');
  ok(row('floor-plans').by.every((b) => b.id !== sElev && b.id !== sDoor), 'a schedule view is not a plan view; an elevation sheet is not a floor plan');
  ok(JSON.stringify(C.summary(rows)) === JSON.stringify({ linked: 4, supplied: 0, missing: 7, na: 0, total: 11 }), 'summary: 4 linked, 7 missing of 11', C.summary(rows));
  const missingList = rows.filter((r) => r.status === 'missing').map((r) => r.id).join();
  ok(missingList === 'form,ownership,fee,sections,window-schedule,structural,drainage', 'the missing items, in the list\'s order', missingList);

  console.log('== the person\'s choices: supplied, does not apply, a sheet chosen by hand');
  let state = { supplied: { form: true, fee: true }, na: { structural: true, sections: true }, links: { drainage: sPlan, 'window-schedule': 'sheet-999', ghost: sPlan } };
  rows = C.resolveChecklist(gen, facts(), state);
  ok(row('form').status === 'supplied' && row('fee').status === 'supplied' && row('ownership').status === 'missing', 'the form and the fee are marked supplied; the proof of ownership is still missing');
  ok(row('structural').status === 'na' && row('sections').status === 'missing', '"does not apply" is taken only for an item the list marks "if applicable" (structural), not for a required one (sections)');
  ok(row('drainage').status === 'linked' && row('drainage').how === 'manual' && row('drainage').by[0].id === sPlan && row('drainage').by[0].why === 'chosen', 'a sheet chosen by hand links an item nothing matched');
  ok(row('window-schedule').status === 'missing' && row('window-schedule').hint === 'gone' && /not in the model any more/.test(C.hintText(row('window-schedule'), t)), 'a link to a sheet that is gone reads as missing, and says why');
  ok(C.cleanState(state, gen).links.ghost === undefined, 'a choice for an item the list does not have is dropped');
  // kept in the IFC, one undo step, survives save and reopen
  let n0 = ed.changes.length;
  ed.modelChange(C.saveStateOp({ pack: 'generic', state }));
  ok(ed.changes.length === n0 + 1 && C.readState(W()).pack === 'generic' && C.readState(W()).state.supplied.form === true, 'the chosen list and the choices are kept on the project in one undo step');
  const saved = ed.save();
  ok(/CadCraft_SubmissionChecklist/.test(new TextDecoder().decode(saved)), 'the saved IFC carries CadCraft_SubmissionChecklist');
  ed = await boot(saved);
  const back = C.readState(W());
  rows = C.resolveChecklist(gen, facts(), back.state);
  ok(back.pack === 'generic' && row('form').status === 'supplied' && row('drainage').by[0]?.id === sPlan && row('floor-plans').by[0]?.label === 'A-101 Ground floor plan' && C.summary(rows).linked === 5, 'reopened: the same list, choices and links to the real sheets', C.summary(rows));
  ed.modelChange(V.deleteSheet(sPlan));
  rows = C.resolveChecklist(gen, facts(), back.state);
  ok(row('floor-plans').status === 'missing' && row('drainage').status === 'missing' && row('drainage').hint === 'gone', 'the plan sheet deleted: both items that leaned on it are missing again');
  ed.undo();

  console.log('== the South African list on the same model, with the site drawn');
  ed.modelChange(MS.setSiteOutline({ storey: L1.guid, points: [[0, 0], [20000, 0], [20000, 30000], [0, 30000]] }));
  ed.modelChange(SC.setSetbacks({ setbacks: [5000, 1500, 3000, 1500] }));
  ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'servitude', shape: 'strip', pts: [[16000, 0], [16000, 30000]], width: 3000, servitude: 'sewer', name: 'Sewer' }));
  ed.modelChange(V.deleteSheet(sSite));
  rows = C.resolveChecklist(za, facts(), {});
  ok(row('site-plan').status === 'missing' && row('site-plan').hint === 'site:1:1' && /The site is drawn in the model \(1 building lines, 1 servitudes\), but no sheet is titled as a site plan yet/.test(C.hintText(row('site-plan'), t)), 'no site plan sheet: missing, with a hint that the site, a building line and a servitude are drawn');
  ok(row('layout-plans').status === 'linked' && row('layout-elevations').status === 'linked' && row('layout-sections').status === 'missing' && row('drainage-installation').status === 'missing' && row('form-declaration').status === 'missing' && row('energy').status === 'missing' && row('energy').hint === 'schedule:windows:1', 'plans and elevations are linked; sections, the drainage drawing and the form are missing; the energy item points at the windows');
  const sum = C.summary(rows);
  ok(sum.total === 14 && sum.linked === 2 && sum.missing === 12, 'summary: 2 linked, 12 missing of 14', sum);

  console.log('== on the permit package\'s cover; a missing document never blocks');
  const md = C.checklistMarkdown(za, rows, t), csv = C.checklistCsv(za, rows, t);
  ok(/## Supporting documents: South Africa: SANS 10400 \(National Building Regulations\)/.test(md) && /\*\*Unverified by a local practitioner\./.test(md) && /2 linked to the model, 0 supplied by you, 12 missing, 0 do not apply \(14 in all\)/.test(md), 'the section names the list, says it is unverified, and counts');
  ok(/\| Layout drawings: plans \| A2\(1\)\(b\), A7 \| Linked \| A-101 Ground floor plan \|/.test(md) && /\| Site plan \| A2\(1\)\(a\), A6 \| Missing \| The site is drawn in the model/.test(md), 'each row: document, clause, status, and the sheet that satisfies it (or the hint)');
  ok(/### Missing\n\n(- .*\n)*- Application form with the professional's declaration \[A2\(1\)\(g\)\] \(a paper you supply\)/.test(md) && /Missing documents do not stop this package being built/.test(md), 'the missing list, with the line that it does not stop the package');
  ok(/### Sources of this list\n\n- Regulations under the National Building Regulations and Building Standards Act.*https:\/\/www\.gov\.za\/documents\/national-building-regulations-and-building-standards-act-regulations \(read on 2026-11-11\)/.test(md), 'the source, its address and the date it was read');
  const cover = P.permitMarkdown({ project: { name: 'Checklist house' }, comments: [], files: [{ name: P.NAMES.cover }, { name: P.NAMES.documents, note: 'x' }], checklist: md });
  ok(cover.indexOf('## Supporting documents') > cover.indexOf('## Comments a reviewer') && cover.indexOf('## Supporting documents') < cover.indexOf('## Sheets') && /No representation is made/.test(cover), 'permitMarkdown puts the section on the cover, before Sheets');
  ok(!/Supporting documents/.test(P.permitMarkdown({ project: { name: 'x' } })), 'no list chosen: the cover is as before');
  const pk = P.packageFiles({ cover, comments: 'a', ifc: saved, extra: [{ name: P.NAMES.documents, data: new TextEncoder().encode(csv) }] });
  ok(pk.map((f) => f.name).join() === '00-cover.md,01-review-comments.csv,03-model.ifc,04-supporting-documents.csv' && sum.missing === 12, 'with 12 documents missing the package is still made, and carries 04-supporting-documents.csv');
  const lines = csv.trim().split('\r\n');
  ok(lines.length === 15 && lines[0].startsWith('authority list,item,clause') && /Layout drawings: plans,"A2\(1\)\(b\), A7",always,linked,A-101 Ground floor plan,,https:\/\/www\.gov\.za\/.*,2026-11-11,no$/.test(lines.find((l) => /Layout drawings: plans/.test(l))), 'the CSV: one line per document with status, sheet, source, date fetched and "verified: no"', lines[3]);
  ok(missing().filter((k) => /^permit\.cl\./.test(k)).length === 0, 'every permit.cl.* string used is in the language file', missing().filter((k) => /^permit\.cl\./.test(k)));

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
