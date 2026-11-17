/* SPDX-License-Identifier: Apache-2.0 */
/**
 * local-reqs-test.mjs: local requirements as regulation packs (booklet rows BK.67, BK.156, BK.157, session bk-r3-regs), DOM-free:
 *   node bin/test-bimcraft.mjs --localreqs
 * The four optional pack sections (process, submission, conventions, notes) and their honesty rules, the inheritance of a city over a
 * country, what the permit package reads (permit-submission.js), the paper text heights and the office standard they offer, and the
 * standard notes on a sheet (sheet-notes.js through composeSheet and the sheet record in the IFC).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function localReqsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 400) + ')' : '')); };
  const REGS = path.join(APP, 'addons/regs');
  const R = await import(path.join(REGS, 'lib/regs.js'));
  const SEC = await import(path.join(REGS, 'lib/sections.js'));
  const LOC = await import(path.join(REGS, 'lib/local.js'));
  const PV = await import(path.join(APP, 'packver.js'));
  const PS = await import(path.join(APP, 'permit-submission.js'));
  const CL = await import(path.join(APP, 'permit-checklist.js'));
  const SN = await import(path.join(APP, 'sheet-notes.js'));
  const RS = await import(path.join(APP, 'res-sheets.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const { t, missing } = await import(path.join(APP, 'i18n.js'));
  R.setReleaseCheck(PV.validatePackVersion);
  const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

  // ------------------------------------------------------------------ the shipped packs
  console.log('== the shipped packs: sections valid, honestly labelled');
  const dir = path.join(REGS, 'packs');
  const files = [...read(path.join(dir, 'index.json')).packs.map((id) => path.join(dir, id + '.json')), path.join(ROOT, 'tools/library/regulations/world/za-wc-cape-town.json')];
  const map = new Map(), raw = new Map();
  for (const f of files) { const r = R.cleanPack(read(f)); if (r.ok) { map.set(r.pack.id, r.pack); raw.set(r.pack.id, read(f)); } else ok(false, f + ' is valid', r.errors); }
  ok(map.size === files.length, 'every bundled pack and the Cape Town Library pack clean (' + map.size + ')');
  const withSec = [...map.values()].filter((p) => SEC.SECTION_KEYS.some((k) => p[k]));
  ok(withSec.map((p) => p.id).sort().join() === 'gb-eng-planning,us-or-portland,us-sample-practice,za-sans10143,za-sans10400,za-wc-cape-town', 'six packs carry local-requirement sections', withSec.map((p) => p.id));
  ok(withSec.every((p) => ['unchecked', 'draft'].includes(p.review.state) && p.review.note.length > 40), 'none of them is marked reviewed: every one says it is unchecked or a draft, with a note');
  ok(withSec.every((p) => p.release?.version === '0.1.0' && p.release.changelog.length === 1), 'each carries a release record 0.1.0 (for discussion) with its changelog, through the shared validator');
  const srcsOf = (p) => SEC.SECTION_KEYS.flatMap((k) => p[k]?.sources || []);
  ok(withSec.every((p) => srcsOf(p).length > 0 && srcsOf(p).every((s) => /^https:\/\//.test(s.url) && /^\d{4}-\d{2}-\d{2}$/.test(s.fetched) && s.licence)), 'every section cites sources: an https address, the date it was read, a licence line');
  const sample = map.get('us-sample-practice');
  ok(/MADE-UP/.test(sample.name) && /MADE-UP/.test(sample.review.note) && sample.authority === 'community' && sample.review.state === 'unchecked' && sample.source.url === 'https://example.com/made-up', 'the teaching pack says MADE-UP in its name and its review note, community level, unchecked, example.com source');
  const textOf = JSON.stringify(sample.notes) + JSON.stringify(sample.conventions) + JSON.stringify(sample.submission);
  ok((textOf.match(/MADE-UP/g) || []).length >= 25 && sample.notes.items.every((n) => /MADE-UP/.test(n.clause)), 'and every clause it cites is marked MADE-UP');
  const figs = withSec.flatMap((p) => (p.process?.steps || []).flatMap((s) => [s.fee && { p, s, f: s.fee }, s.time && { p, s, f: s.time }].filter(Boolean)));
  ok(figs.length === 3 && figs.every((x) => x.p.process.sources[x.f.source].fetched >= '2026-11-11' && /^https:\/\//.test(x.p.process.sources[x.f.source].url)), 'every fee and time frame in any pack has its source and the date it was read (3 in all: the Portland fee statement and two Cape Town time frames)', figs.length);
  const por = map.get('us-or-portland'), cpt = map.get('za-wc-cape-town');
  ok(por.process.steps.length === 7 && por.process.steps.every((s) => !s.time) && por.process.steps.filter((s) => s.fee).map((s) => s.id).join() === 'intake-fees' && !/\d/.test(por.process.steps.find((s) => s.id === 'intake-fees').fee.text.replace(/not on/, '')), 'Portland: 7 steps, no time frame (the pages state none), one fee statement that gives no amount');
  ok(cpt.process.steps.length === 6 && /30 days/.test(cpt.process.steps.find((s) => s.id === 'circulate').time.text) && /60 days/.test(cpt.process.steps.find((s) => s.id === 'circulate').time.text) && cpt.process.sources[1].url.startsWith('https://www.capetown.gov.za/') && cpt.process.steps.every((s) => !s.fee), 'Cape Town: 6 steps, the stated 30 and 60 day time frames with the City page as source, no fee amount (the tariff PDF was not readable)');
  ok(por.submission.format.fileFormats[0] === 'pdf' && por.submission.format.singleFile === true && por.submission.format.orientation === 'landscape' && por.submission.format.sheetSizes === undefined && por.submission.format.maxFileMB === undefined, 'Portland format: one PDF, landscape; sheet size and file size left out because the pages do not state them');

  // ------------------------------------------------------------------ the format refuses what it must
  console.log('== bad sections are refused with reasons');
  const base = () => ({ format: R.FORMAT, version: 1, id: 'xx-test', name: 'Test', jurisdiction: { country: 'US', level: 'country' }, review: { state: 'unchecked', note: 'x' }, rules: [] });
  const src = (o = {}) => ({ title: 'A page', url: 'https://example.org/p', fetched: '2026-11-11', licence: 'ours', ...o });
  const why = (mut) => { const o = base(); mut(o); const r = R.cleanPack(o); return r.ok ? '' : r.errors.join(' | '); };
  const proc = (steps, sources = [src()]) => ({ authority: 'A', sources, steps });
  ok(why((o) => { o.process = proc([{ id: 'a', title: 'T', source: 0 }]); }) === '', 'a small process is accepted');
  ok(/a fee needs the source it was read from, with the date/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T', fee: { text: '$10' } }]); })), 'a fee with no source is refused');
  ok(/a time frame needs the source/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T', time: { text: '30 days', source: 3 } }]); })), 'a time frame naming a source that is not there is refused');
  ok(/fetched must be the date it was read/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T', fee: { text: '$10', source: 0 } }], [src({ fetched: 'last week' })]); })) && /a fee needs the source/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T', fee: { text: '$10', source: 0 } }], [src({ fetched: 'last week' })]); })), 'a fee whose source has no real date is refused twice over');
  ok(/url must be an https address/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T' }], [src({ url: 'javascript:alert(1)' })]); })) && /url must be an https address/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T' }], [src({ url: 'http://example.org' })]); })), 'a source that is not an https address is refused');
  ok(/used twice/.test(why((o) => { o.process = proc([{ id: 'a', title: 'T' }, { id: 'a', title: 'U' }]); })) && /lower-case words/.test(why((o) => { o.process = proc([{ id: 'A b', title: 'T' }]); })), 'an id used twice, or not lower-case words with dashes');
  ok(/no steps/.test(why((o) => { o.process = proc([]); })) && /process is an object/.test(why((o) => { o.process = 'x'; })), 'a process with no steps, or not an object');
  ok(/say what satisfies it/.test(why((o) => { o.submission = { sources: [src()], drawings: [{ id: 'a', title: 'T' }] }; })) && /holds no format/.test(why((o) => { o.submission = { sources: [src()] }; })), 'a required drawing that says nothing about what satisfies it; a submission with nothing in it');
  ok(/unknown view kind/.test(why((o) => { o.submission = { sources: [src()], drawings: [{ id: 'a', title: 'T', satisfy: [{ view: ['hologram'] }] }] }; })) && /orientation is landscape/.test(why((o) => { o.submission = { sources: [src()], format: { orientation: 'sideways' } }; })) && /a sheet size is like/.test(why((o) => { o.submission = { sources: [src()], format: { sheetSizes: ['A1 big'] } }; })), 'unknown view kind, orientation or sheet size');
  ok(/mm in the height or the FONT size in pt|height in mm or the FONT size/.test(why((o) => { o.conventions = { sources: [src()], text: [{ id: 'a', use: 'U', mm: 3, pt: 10 }] }; })) && /kind is one of/.test(why((o) => { o.conventions = { sources: [src()], text: [{ id: 'a', use: 'U', mm: 3, kind: 'poster' }] }; })) && /mm is a number above 0/.test(why((o) => { o.conventions = { sources: [src()], text: [{ id: 'a', use: 'U', mm: -1 }] }; })), 'a text height must be mm or pt (not both), name a known kind, and be above 0');
  ok(/discipline is one of/.test(why((o) => { o.notes = { sources: [src()], items: [{ id: 'a', discipline: 'astrology', title: 'T', text: 'x' }] }; })) && /text is missing/.test(why((o) => { o.notes = { sources: [src()], items: [{ id: 'a', discipline: 'general', title: 'T' }] }; })), 'a note needs a known discipline and its text');
  ok(/release\.version: must be MAJOR/.test(why((o) => { o.release = { version: '1.0', changelog: [] }; })) && why((o) => { o.release = { version: '0.1.0', changelog: [{ version: '0.1.0', date: '2026-11-11', added: ['x'] }] }; }) === '', 'a release record goes through the shared validator: "1.0" is refused, 0.1.0 with a changelog is accepted');
  const hostile = R.cleanPack({ ...base(), process: proc([{ id: 'a', title: 'T‮\u0000 <b>', who: 'x', evil: 1 }]) });
  ok(hostile.ok && !/[\u0000‮]/.test(hostile.pack.process.steps[0].title) && hostile.pack.process.steps[0].evil === undefined, 'control and direction characters are taken out; unknown fields are dropped');
  const old = R.cleanPack(base());
  ok(old.ok && !('process' in old.pack) && !('submission' in old.pack) && !('conventions' in old.pack) && !('notes' in old.pack) && !('release' in old.pack), 'a pack without sections cleans to what it always did: no new keys');

  // ------------------------------------------------------------------ a city on a country
  console.log('== a city pack inherits the country\'s submission, and changes it');
  const za = R.resolve(map, 'za-sans10400'), ct = R.resolve(map, 'za-wc-cape-town');
  ok(za.sections.submission.drawings.length === 10 && za.sections.submission.documents.length === 4 && !za.sections.process, 'SANS 10400: 10 drawings and 4 papers, no process');
  const cs = ct.sections.submission;
  ok(cs.drawings.length === 13 && cs.documents.length === 17 && cs.drawings.find((d) => d.id === 'site-plan').from === 'za-wc-cape-town' && cs.drawings.find((d) => d.id === 'layout-plans').from === 'za-sans10400' && cs.documents.some((d) => d.id === 'form-declaration' && d.from === 'za-sans10400') && cs.documents.some((d) => d.id === 'title-deed' && d.from === 'za-wc-cape-town'), 'Cape Town: 13 drawings and 17 papers; its own site plan wins, the national layout plans and declaration form stay', [cs.drawings.length, cs.documents.length]);
  ok(ct.sections.process.from === 'za-wc-cape-town' && ct.sections.process.steps[4].time.src.url.includes('capetown.gov.za') && ct.review.state === 'unchecked', 'the process is the city\'s and each time frame resolves its source; the chain is unchecked as a whole');

  // ------------------------------------------------------------------ what the apps read
  console.log('== window.ccRegsLocal: lists, notes and paper text heights');
  const L = LOC.makeLocal({ list: () => [...map.values()].map((p) => ({ id: p.id, name: p.name, review: p.review })), profile: (id) => R.resolve(map, id), active: () => ['us-or-portland'] });
  const listed = L.list();
  ok(listed.length === 6 && listed.find((x) => x.id === 'us-or-portland').has.join() === 'process,submission,conventions' && listed.find((x) => x.id === 'us-sample-practice').has.join() === 'submission,conventions,notes', 'six packs offer something; Portland has process, submission, conventions; the sample has submission, conventions, notes');
  const th = L.textHeights(['us-or-portland']);
  ok(th.length === 2 && th.every((x) => x.pt === 12 && x.mm === 3.04 && x.estimated) && th.map((x) => x.kind).join() === 'text,dimension', '12 pt is a FONT size: 12 x 25.4/72 x 0.718 = 3.04 mm capital height, flagged estimated');
  ok(JSON.stringify(L.standard(['us-or-portland']).heights) === '{"text":3.04,"dimension":3.04}' && JSON.stringify(L.standard(['us-sample-practice']).heights) === '{"text":3,"dimension":2.5,"title":5}', 'the office standard offered: Portland text and dimension 3.04, the sample 3 / 2.5 / 5');
  const both = L.standard(['us-or-portland', 'us-sample-practice']);
  ok(both.heights.text === 3.04 && both.from.title === 'us-sample-practice' && both.conflicts.map((c) => c.kind).join() === 'text,dimension', 'two packs: the first ticked wins a kind, and the disagreement is reported', both);
  ok(L.textHeights().length === 2, 'with no ids it reads the ticked packs');
  ok(L.notes('us-sample-practice').length === 8 && L.notes('us-sample-practice', { discipline: 'electrical' }).map((n) => n.id).join() === 'elec-code' && L.notes('us-sample-practice').every((n) => n.pack === 'us-sample-practice' && n.clause && n.review === 'unchecked') && L.notes('us-or-portland').length === 0, 'eight sample notes, filtered by discipline, each with its pack, clause and review state; Portland has none (the pages state no standard notes)');
  const cv = L.conventions(['us-or-portland', 'za-sans10143']);
  ok(cv.marks.length === 7 && cv.marks.find((m) => m.id === 'scale-list').rule === 'draw.scale.listed' && cv.marks.filter((m) => m.pack === 'us-or-portland').length === 4, 'conventions: Portland\'s four marks and SANS 10143\'s three, the latter tied to its draw.* rules');

  // ------------------------------------------------------------------ the permit package
  console.log('== the permit package reads the pack: format, drawings, papers, process (advisory only)');
  const CP = CL.cleanChecklist(SEC.checklistFromSections(R.resolve(map, 'us-sample-practice')));
  ok(CP.pack && CP.problems.length === 0 && CP.pack.items.length === 3 && CP.pack.subFormat.sheetSizes.join() === 'a1,a3' && CP.pack.items[0].scale.maxDenominator === 200, 'the sample pack\'s submission makes a checklist: 2 drawings and 1 paper, its format and the site plan scale kept');
  const pkgP = CL.cleanChecklist(SEC.checklistFromSections(R.resolve(map, 'us-or-portland'))).pack;
  ok(pkgP.items.length === 12 && pkgP.items.filter((i) => i.supplied).length === 5 && pkgP.items.find((i) => i.id === 'sections').scale.maxDenominator === 48 && pkgP.items.find((i) => i.id === 'site-plan').scale.maxDenominator === 120 && pkgP.review === 'unchecked', 'Portland: 7 drawings and 5 papers; site plan 1:120 and sections 1:48 at the coarsest; unverified');
  const sheet = (id, number, title, paper, views, fields = {}) => ({ id, number, title, paper, views, fields });
  const facts0 = { sheets: [
    sheet('sheet-1', 'A-001', 'Site plan', 'a3', [{ kind: 'plan', ref: 'L1', ratio: 500 }], { project: 'House' }),
    sheet('sheet-2', 'A-101', 'Ground floor', 'letter', [{ kind: 'plan', ref: 'L1', ratio: 100 }]),
    sheet('sheet-3', 'A-102', 'First floor', 'a3:p', [{ kind: 'plan', ref: 'L2', ratio: 0 }])], counts: {}, site: {}, levelName: new Map() };
  let rows = CL.resolveChecklist(CP.pack, facts0, {});
  const by = (id) => rows.find((r) => r.id === id);
  ok(by('site-plan').status === 'linked' && by('site-plan').by[0].id === 'sheet-1' && by('floor-plans').status === 'linked' && by('floor-plans').by.length === 3 && by('application-form').status === 'missing', 'the site plan is found by its title, the floor plans by their views; the form is a paper you supply');
  const adv = PS.formatAdvice(CP.pack, rows, facts0);
  const codes = adv.map((a) => a.code + ':' + a.id).sort().join(' ');
  ok(codes === 'submission.orientation:sheet-3 submission.paper:sheet-2 submission.scale:site-plan:sheet-1:L1 submission.titleblock:date submission.titleblock:drawnby', 'format advice: letter is not an listed size, a portrait sheet where landscape is asked for, the site plan at 1:500 against 1:200, and the two title block fields no sheet carries (drawn by, date); a view fitted to the sheet (ratio 0) is not judged', codes);
  const all = PS.advice(CP.pack, rows, facts0);
  ok(all.length === 6 && all.filter((a) => a.code === 'submission.document.missing').length === 1 && all.every((a) => !!a.vars), 'advice adds the missing paper (6 in all); an "if applicable" item is never nagged');
  const probs = PS.problemsFor(all, t);
  ok(probs.length === 6 && probs.every((p) => p.severity === 'note' && p.source.name === 'submission' && p.text && p.about.length === 1) && /Not yet supplied: Application form/.test(probs.find((p) => p.code === 'submission.document.missing').text), 'as Problems every one is a note (advisory, never blocking), with its words in the language file');
  const emptyRows = CL.resolveChecklist(CP.pack, { sheets: [], counts: {}, site: {}, levelName: new Map() }, {});
  ok(PS.advice(CP.pack, emptyRows, { sheets: [] }).map((a) => a.code).sort().join() === 'submission.document.missing,submission.drawing.missing,submission.drawing.missing', 'no sheets at all: the two drawings and the paper are missing, nothing else is said');
  const md = PS.processMarkdown(R.resolve(map, 'za-wc-cape-town') && CL.cleanChecklist(SEC.checklistFromSections(R.resolve(map, 'za-wc-cape-town'))).pack, t);
  ok(/## Approval process: City of Cape Town|## Approval process: /.test(md) && /30 days for an area under 500 m2/.test(md) && /https:\/\/www\.capetown\.gov\.za\/work-and-business\/planning-portal\/[^)]* read 2026-11-11/.test(md) && /The authority decides what it requires/.test(md), 'the cover section prints Cape Town\'s steps, the time frame with its page and the date read, and says the authority decides');
  const pmd = PS.processMarkdown(pkgP, t), fmd = PS.formatMarkdown(pkgP, t);
  ok(/Fee: Fees are based on the estimated cost/.test(pmd) && /read 2026-11-11/.test(pmd) && !/Time:/.test(pmd) && /\*\*File formats:\*\* PDF \(all drawings in one file\)/.test(fmd) && /Copies:\*\* One set online; four sets if submitted in person/.test(fmd) && !/Sheet sizes/.test(fmd), 'Portland: the fee line with its source, no invented time; the format prints one PDF and the copies and leaves out the sheet size');
  ok(PS.formatLines({}, t).length === 0 && PS.processRows(null).length === 0 && PS.processMarkdown({}, t) === '' && PS.advice(CL.cleanChecklist({ ...require_generic() }).pack, [], { sheets: [] }).length === 0, 'a list with no pack sections adds nothing (the generic list is unchanged)');
  function require_generic() { return JSON.parse(fs.readFileSync(path.join(APP, 'permit-checklists/generic.json'), 'utf8')); }
  const pk = await import(path.join(APP, 'permit-package.js'));
  const cover = pk.permitMarkdown({ project: { name: 'X' }, comments: [], checklist: [CL.checklistMarkdown(CP.pack, rows, t), PS.formatMarkdown(CP.pack, t), PS.processMarkdown(CP.pack, t)].filter(Boolean).join('\n') });
  ok(/## Submission format: /.test(cover) && /\*\*Sheet sizes:\*\* A1, A3/.test(cover) && /\*\*Orientation:\*\* Landscape/.test(cover) && /No representation is made/.test(cover), 'the cover carries the submission format section, inside the one permit package');

  // ------------------------------------------------------------------ standard notes on a sheet
  console.log('== standard notes on a sheet, with the pack and clause they came from');
  const offered = L.notes('us-sample-practice', {});
  const picked = SN.pickNotes(offered, ['gen-dimensions', 'arch-fire']);
  ok(picked.length === 2 && picked[0].id === 'gen-dimensions' && picked[1].pack === 'us-sample-practice' && picked[1].clause === 'MADE-UP A1' && picked[1].packName.startsWith('MADE-UP') && picked[1].review === 'unchecked', 'pickNotes keeps the pack\'s order and each note\'s pack, clause and review state');
  const notes = SN.cleanSheetNotes({ title: 'General notes', items: [...picked, { id: '', text: 'no id' }, { id: 'x', text: '', pack: 'p' }] });
  ok(notes.items.length === 2 && SN.cleanSheetNotes(null) === null && SN.cleanSheetNotes({ items: [] }) === null && SN.cleanSheetNotes({ items: Array.from({ length: 60 }, (_, i) => ({ id: 'n' + i, text: 't', pack: 'p' })) }).items.length === SN.MAX_NOTES, 'cleaning drops notes with no id, text or pack, an empty list is nothing, and the list is capped at ' + SN.MAX_NOTES);
  const words = { title: 'General notes', from: (v) => 'Notes from ' + v.packs + (v.unverified ? ': unverified' : '') };
  const items = SN.notesItems(notes, { x: 100, y: 200, width: 70, size: 7, words });
  ok(items[0].s === 'General notes' && items[0].bold && items[0].y === 200 && items.filter((i) => i.bold && /^[12]$/.test(i.s)).length === 2 && /^Notes from MADE-UP.*: unverified$/.test(items[items.length - 1].s), 'the block has a heading, numbered notes and a source line that says unverified');
  ok(items.every((i) => i.x >= 100 && i.y <= 200) && Math.min(...items.map((i) => i.y)) >= 200 - SN.notesHeight(notes, { width: 70, size: 7 }) - 0.01 && items.slice(1, -1).filter((i) => i.x === 107).every((i) => i.s.length <= Math.floor((70 - 7) / (7 * 25.4 / 72 * 0.52))), 'every line stays in the column and above the height it reports; no line is wider than the column allows');
  const flat = items.map((i) => i.s).join(' ');
  ok(/\[MADE-UP G1\]/.test(flat) && /\[MADE-UP A1\]/.test(flat), 'each note carries its clause on the printed sheet');
  const input = { plans: [], elevations: [], sections: [], schedules: [] };
  const plain = RS.composeSheet({ number: 'A-1', title: 'T', paper: 'a3', views: [] }, input, { paper: 'a3', units: 'mm' });
  const withN = RS.composeSheet({ number: 'A-1', title: 'T', paper: 'a3', views: [], notes }, input, { paper: 'a3', units: 'mm' });
  const added = withN.items.slice(plain.items.length);
  const colX = RS.legendBlock('a3').x;
  ok(added.length >= 6 && added.every((i) => i.t === 'text'), 'composeSheet puts the notes on the sheet (' + added.length + ' text items more)');
  ok(added[0].x === colX && added[0].y === RS.legendBlock('a3').y && /General notes/.test(added[0].s) && /unverified/.test(added[added.length - 1].s), 'in the legend column, with the words from the language file and the unverified source line');
  const legend = [{ n: 1, kind: 'layer', key: 'A', text: 'First' }, { n: 2, kind: 'layer', key: 'B', text: 'Second' }];
  const both2 = RS.composeSheet({ number: 'A-1', title: 'T', paper: 'a3', views: [], legend, notes }, input, { paper: 'a3', units: 'mm' });
  const nHead = both2.items.find((i) => /General notes/.test(i.s || ''));
  ok(nHead && nHead.y < RS.legendBlock('a3').y - 20, 'with a keynote legend as well, the notes start below it (not on top of it)', nHead);
  const arr = RS.arrangeSheet({ number: 'A', title: 'T', paper: 'a3', views: [], notes }, input, { paper: 'a3', units: 'mm' });
  ok(arr && typeof arr.fits === 'boolean', 'Arrange for me still works on a sheet with notes');
  console.log('== the annotation standard is offered the pack text heights (BK.10)');
  const AP = await import(path.join(APP, 'anno-from-packs.js'));
  const LOCAL = LOC.makeLocal({ list: () => [...map.values()].map((p) => ({ id: p.id, name: p.name, review: p.review })), profile: (id) => R.resolve(map, id), active: () => ['us-or-portland', 'us-sample-practice'] });
  globalThis.window = { ccRegsLocal: LOCAL };
  const ps = AP.packSizes();
  ok(ps && ps.heights.text === 3.04 && ps.heights.title === 5 && ps.conflicts.length === 2 && ps.estimated.sort().join() === 'dimension,text' && ps.from.title === 'us-sample-practice', 'two ticked packs: Portland\'s 3.04 mm (a font size, estimated) wins text and dimension, the sample gives title; two disagreements reported', ps);
  ok(/Filled from .*MADE-UP.*2 sizes differ.*a font size/.test(AP.packNote(ps, t)), 'the dialog note names the packs, the disagreements and the estimate: ' + AP.packNote(ps, t));
  globalThis.window = {};
  ok(AP.packSizes() === null, 'with the add-on off nothing is offered');
  delete globalThis.window;
  console.log('== the sheet record in the IFC keeps them');
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  let ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Notes house', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'n.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const made = ed.modelChange(V.saveSheet({ number: 'A-9', title: 'Notes', paper: 'a3', views: [], notes })).sheet;
  let back = V.readSheets(W()).find((s) => s.id === made);
  ok(back.notes?.items.length === 2 && back.notes.items[1].pack === 'us-sample-practice' && back.notes.items[1].clause === 'MADE-UP A1' && back.notes.items[0].review === 'unchecked', 'saved on the project with each note\'s pack, clause and review state');
  ed = await boot(ed.save());
  back = V.readSheets(W()).find((s) => s.id === made);
  ok(back.notes?.items.length === 2 && back.notes.items[0].text === picked[0].text, 'and still there after save and reopen');
  const nn = ed.modelChange(V.saveSheet({ number: 'A-10', title: 'Plain', paper: 'a3', views: [] })).sheet;
  ok(V.readSheets(W()).find((s) => s.id === nn).notes === null, 'a sheet without notes reads back with none: older files and sheets are unchanged');
  ok(!['sheet.notes.', 'permit.sub.'].some((p) => require_missing(p).length), 'every sheet.notes.* and permit.sub.* string used is in the language file', require_missing('sheet.notes.').concat(require_missing('permit.sub.')));
  function require_missing(prefix) { return missing().filter((k) => k.startsWith(prefix)); }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
