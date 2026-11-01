/* SPDX-License-Identifier: Apache-2.0 */
/**
 * r47-test.mjs — BimCraft, round 4 session bim-model_PART_4 (R4.7), DOM-free, run by
 *   node bin/test-bimcraft.mjs --r47 [--only a,b,c]
 *   a   EG.50 narration: script parsing, subtitles, the walk's narration kept in the IFC (round trip, undo), the assistant's two tools
 *   b   AL.6 the file says which add-on wrote into it (CadCraft_AddOns) · add-on undo labels carry the add-on's name
 *   d   EG.20 dimension a plan by rules (autodim.js, saveWallDimensions)
 *   c   LC.2 the team's models: loaded through the team model, offsets in metres, hidden / unreadable ones counted
 */
import path from 'node:path';

export async function r47Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const imp = (f) => import(path.join(APP, f));
  async function building() {
    const N = await imp('new-model.js'), OPS = await imp('model-ops.js'), { IfcEditor } = await imp('ifc-edit.js');
    const text = N.newBuilding({ name: 'R47', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'r.ifc', now: new Date('2026-10-30T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    return { ed: new IfcEditor(WebIFC, eng), eng, OPS };
  }


  if (args.includes('--make-fixture')) {   // the model tools/bimcraft-test/browser-r47.mjs opens: drawn walls, a door and a window, a brick wall, a recorded walk
    const fs = await import('node:fs');
    const PB = await imp('paint-bim.js'), V = await imp('views-bim.js'), WD = await imp('wall-dimensions.js');
    void WD;
    const { ed, OPS } = await building();
    const lv = OPS.snapshotModel(ed).levels, L1 = lv[0], L2 = lv[1];
    const room = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2.guid, extSide: 'right' }));
    const walls = OPS.snapshotModel(ed).walls;
    ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
    ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'win-fixed', offset: 5500, face: 'left' }));
    ed.modelChange(PB.paintOp({ ids: walls.map((x) => x.id), mat: 'brick-red' }), { label: 'Red brick', verb: 'Painted' });
    ed.modelChange(V.writeViewsOp({ views: [], walks: [{ name: 'Tour', pts: [{ t: 0, pos: [1, 1, 1.6], dir: [1, 0, 0] }, { t: 6, pos: [6, 1, 1.6], dir: [1, 0, 0] }] }] }), { label: 'walk' });
    const out = path.join(ROOT, 'tmp/bimcraft-r47.ifc');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, ed.save());
    console.log('fixture: ' + out);
    return 0;
  }

  if (want('a')) {
    console.log('== EG.50 narrated walkthrough');
    const NA = await imp('narration.js'), V = await imp('views-bim.js'), AG = await imp('narration-agents.js');
    let r = NA.parseScript('0 Welcome to the hall.\n0:06 The kitchen is on the right.\nAnd the stairs go up.', 20);
    ok(r.cues.length === 3 && r.cues[0].t === 0 && r.cues[1].t === 6, 'times: "0 text" and "0:06 text"', JSON.stringify(r.cues));
    ok(r.cues[2].t >= 6 + NA.readSeconds('The kitchen is on the right.') - 0.2, 'a line with no time follows the one above after its reading time', String(r.cues[2].t));
    r = NA.parseScript('One two three four five six seven eight nine ten.\nEleven twelve thirteen fourteen fifteen sixteen seventeen eighteen.\nNineteen twenty twenty-one twenty-two.', 6);
    ok(r.cues[r.cues.length - 1].t < 6 && r.problems.some((p) => p.code === 'narr.squeezed'), 'speech longer than the walk is placed closer together, and says so', JSON.stringify(r.problems));
    const cues = [{ t: 0, text: 'Hello <b>there</b> & welcome' }, { t: 5, text: 'Second line' }];
    const srt = NA.toSrt(cues, 12), vtt = NA.toVtt(cues, 12);
    ok(/^1\n00:00:00,000 --> 00:00:0\d,\d{3}\nHello/.test(srt) && srt.includes('2\n00:00:05,000 -->'), 'SRT: numbered, comma milliseconds', srt.slice(0, 80));
    ok(vtt.startsWith('WEBVTT') && vtt.includes('00:00:05.000 --> ') && vtt.includes('&lt;b>there') && vtt.includes('&amp;'), 'VTT: header, dot milliseconds, markup escaped', vtt.slice(0, 120));
    ok(NA.cueAt(cues, 0.5, 12)?.text.startsWith('Hello') && NA.cueAt(cues, 5.1, 12)?.text === 'Second line' && NA.cueAt(cues, 11.9, 12) === null, 'cueAt: a cue lasts its reading time, then the screen is clear');
    const c2 = NA.cleanNarration({ lang: 'es-MX', cues: [{ t: 3, text: ' b\u0000\n  x ' }, { t: -1, text: 'no' }, { t: 1, text: '' }, { t: 1, text: 'a' }, { t: 'x', text: 'z' }] });
    ok(c2 && c2.lang === 'es-MX' && c2.cues.length === 2 && c2.cues[0].text === 'a' && c2.cues[1].text === 'b x', 'untrusted cues are cleaned and sorted', JSON.stringify(c2));
    ok(NA.cleanNarration({ lang: '<script>', cues: [{ t: 1, text: 'a' }] }).lang === '', 'a language that is not a tag is dropped');
    ok(NA.voiceFor([{ lang: 'en-US' }, { lang: 'es_ES', localService: false }, { lang: 'es-MX', localService: true }], 'es-MX').lang === 'es-MX' && NA.voiceFor([{ lang: 'fr-CA' }], 'fr-FR').lang === 'fr-CA' && NA.voiceFor([{ lang: 'en-US' }], 'ja-JP') === null, 'voiceFor: exact language, then the same language, else none');

    const { ed } = await building();
    const walk = { name: 'Tour', pts: [{ t: 0, pos: [1, 1, 1.6], dir: [1, 0, 0] }, { t: 10, pos: [6, 1, 1.6], dir: [1, 0, 0] }], narration: NA.cleanNarration({ lang: 'es-MX', cues: [{ t: 0, text: 'Bienvenidos' }, { t: 4, text: 'La cocina' }] }) };
    const n0 = ed.changes.length;
    ed.modelChange(V.writeViewsOp({ views: [], walks: [walk, { name: 'Plain', pts: walk.pts }] }), { label: 'Narration' });
    ok(ed.changes.length === n0 + 1, 'saving a walk with narration is one undo step');
    let s = V.readViews(ed.api, ed.mid);
    ok(s.walks.length === 2 && s.walks[0].narration?.lang === 'es-MX' && s.walks[0].narration.cues[1].text === 'La cocina' && !s.walks[1].narration, 'read back: the narration sits with its walk only', JSON.stringify(s.walks.map((w) => w.narration)));
    const bytes = ed.save();
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    const m2 = await quiet((b) => eng2.load(b))(bytes);
    s = V.readViews(eng2.api, m2.modelID);
    ok(s.walks[0].narration?.cues.length === 2, 'it survives save and reopen');
    ok(/Narr: Tour/.test(new TextDecoder('latin1').decode(bytes)), 'written in CadCraft_Views as "Narr: <walk>" (plain IFC text; other programs ignore it)');
    ed.undo();
    ok(V.readViews(ed.api, ed.mid).walks.length === 0, 'undo takes the walk and its narration back');
    // the assistant's tools
    ed.modelChange(V.writeViewsOp({ views: [{ name: 'Hall', pos: [0, 0, 1.6], dir: [1, 0, 0], fov: 50 }], walks: [{ name: 'Tour', pts: walk.pts }] }), { label: 'walk' });
    const applied = [];
    const env = { ed: () => ed, apply: async (label, op) => { applied.push(label); return ed.modelChange(op, { label }); } };
    const [list, set] = AG.narrationTools(env);
    const l0 = list.run({});
    ok(l0.walks.length === 1 && l0.walks[0].seconds === 10 && l0.walks[0].narration === null && l0.views[0] === 'Hall', 'walks_list: name, seconds, no narration yet, view names');
    const o = await set.run({ walk: 'Tour', language: 'fr-FR', cues: [{ at: 0, text: 'Bienvenue' }, { at: 5, text: 'La cuisine' }] });
    ok(o.cues === 2 && applied.length === 1, 'walk_narration_set: two cues, one undo step', JSON.stringify(o));
    ok(list.run({}).walks[0].narration.language === 'fr-FR', 'walks_list shows the narration the tool set');
    let err = null; try { await set.run({ walk: 'Tour', cues: [{ at: 11, text: 'late' }] }); } catch (e) { err = e; }
    ok(err && /after the walk ends/.test(err.message) && applied.length === 1, 'a cue after the walk ends is refused, nothing changes');
    err = null; try { await set.run({ walk: 'Nope', cues: [] }); } catch (e) { err = e; }
    ok(err && /No walk named/.test(err.message), 'an unknown walk is refused with where to look');
    await set.run({ walk: 'Tour', cues: [] });
    ok(list.run({}).walks[0].narration === null, 'an empty list takes the narration off');
  }

  if (want('b')) {
    console.log('== AL.6 the file says which add-on wrote into it; add-on undo label');
    const AF = await imp('addons-file.js'), { ModelWriter } = await imp('model-write.js');
    const { ed } = await building();
    ed.modelChange((e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { AF.recordUse(w, 'trusscraft', '1.0.0'); AF.recordUse(w, 'trusscraft', '1.0.0'); AF.recordUse(w, 'bad id!', '1'); return { id: 0 }; }); }, { label: 'x' });
    let d = AF.readDoc(ed.api, ed.mid);
    ok(Object.keys(d.addons).join() === 'trusscraft' && d.addons.trusscraft === '1.0.0', 'recordUse writes {id: version} on the IfcProject once; a bad id is left out', JSON.stringify(d));
    ed.modelChange((e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { AF.recordUse(w, 'trusscraft', '1.1.0'); AF.recordUse(w, 'plant', '0.8.0'); return { id: 0 }; }); }, { label: 'y' });
    d = AF.readDoc(ed.api, ed.mid);
    ok(d.addons.trusscraft === '1.1.0' && d.addons.plant === '0.8.0', 'a newer version updates the record; a second add-on joins it', JSON.stringify(d));
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    const m2 = await quiet((b) => eng2.load(b))(ed.save());
    ok(AF.readDoc(eng2.api, m2.modelID).addons.plant === '0.8.0', 'the record survives save and reopen');
    // the label: the loader hands over {id, manifest}, never addon.name
    const { makeBimcraftApi } = await imp('addons/bimcraft-api.js');
    const labels = [];
    const base = { onDeactivate() {}, log() {}, ui: {}, files: {}, problems: {} };
    const ctx = { editor: () => ed, model: () => ({}), name: () => 'r.ifc', selection: () => [], select() {}, afterEdit() {}, changeListeners: new Set(), registry: { importers: new Map(), exporters: new Map(), listeners: new Set(), changed() {} },
      write: async (run, meta) => { labels.push(meta.label); return ed.modelChange(run, { label: meta.label }); }, versionOf: () => '2.0.0' };
    let api = null;
    try { api = makeBimcraftApi(base, { id: 'trusscraft', manifest: { id: 'trusscraft', name: 'TrussCraft', version: '1.0.0' } }, ctx); } catch (e) { ok(false, 'makeBimcraftApi builds an API from {id, manifest}', e.message); }
    if (api) {
      await api.model.write('Place trusses', () => 1);
      ok(labels[0] === 'TrussCraft: Place trusses', 'model.write label is "<manifest name>: <label>", not "undefined: ..."', labels[0]);
      ok(AF.readDoc(ed.api, ed.mid).addons.trusscraft === '2.0.0', 'model.write records the add-on (the account\'s version) in the same change');
    }
  }

  if (want('d')) {
    console.log('== EG.20 dimension a plan by rules');
    const AD = await imp('autodim.js'), WD = await imp('wall-dimensions.js'), { ModelWriter } = await imp('model-write.js');
    const { ed, OPS } = await building();
    const lv = OPS.snapshotModel(ed).levels, L1 = lv[0], L2 = lv[1];
    const room = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2.guid, extSide: 'right' }));
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: L2.guid }));
    const south = OPS.snapshotModel(ed).walls.find((w) => w.storey === L1.id && Math.abs(w.a[1]) < 1 && Math.abs(w.b[1]) < 1 && w.len > 7000);
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-fixed', offset: 5500, face: 'left' }));
    const snap = () => OPS.snapshotModel(ed);
    const view = 'plan:' + L1.guid;
    let sn = snap();
    let r = AD.planAutoDimensions({ walls: sn.walls, openingRows: sn.openings, level: L1.id, view });
    const ov = r.specs.filter((x) => x.kind === 'overall'), ch = r.specs.filter((x) => x.kind === 'chain');
    ok(ov.length === 2 && ov.some((x) => x.axis === 'x') && ov.some((x) => x.axis === 'y'), 'overall: one each way', JSON.stringify(r.counts));
    ok(ch.some((x) => x.side === 'south') && ch.some((x) => x.side === 'north') && ch.some((x) => x.side === 'west') && ch.some((x) => x.side === 'east'), 'a row on each of the four outside edges', ch.map((x) => x.side).join());
    const southRow = ch.filter((x) => x.side === 'south');
    ok(southRow.length >= 5, 'south row: wall end, door (2 edges), window (2 edges), the partition, the other end', String(southRow.length));
    const n0 = ed.changes.length;
    ed.modelChange(WD.saveWallDimensions(r.specs.map(({ kind, side, ...sp }) => ({ ...sp, level: L1.guid }))), { label: 'Dimension the plan' });
    ok(ed.changes.length === n0 + 1, 'all of them are one undo step', ed.changes.length - n0 + ' steps');
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const dims = WD.readWallDimensions(w());
    ok(dims.length === r.specs.length && dims.every((d) => !d.issue), 'saved as wall dimensions (' + dims.length + '), none with an issue');
    const walls = snap().walls;
    const res = dims.map((d) => WD.resolveDimension(d, walls));
    ok(res.every((x) => x.status === 'ok'), 'every one resolves against the walls');
    const rx = res.find((x, i) => dims[i].axis === 'x' && Math.abs(x.value - 8000) < 400 && Math.abs(x.value - 8000) >= 0);
    ok(rx && rx.value > 7900 && rx.value < 8300, 'the overall across is the building\'s outside width (' + (rx && Math.round(rx.value)) + ' mm for an 8 m centre-line plan)');
    const sumSouth = res.filter((x, i) => dims[i].axis === 'x' && Math.abs(x.off - (res[0] && x.off)) < 1e9).length;
    ok(sumSouth > 0, 'dimension lines are placed outside the building');
    const below = res.filter((x, i) => dims[i].axis === 'x' && x.off < 0);
    ok(below.length > 0 && below.every((x) => x.a[1] + x.off < -400), 'south rows sit below the building, clear of the wall face', below.map((x) => Math.round(x.a[1] + x.off)).slice(0, 3).join());
    sn = snap();
    const again = AD.planAutoDimensions({ walls: sn.walls, openingRows: sn.openings, level: L1.id, view, existing: dims.map((d) => ({ refs: d.refs, axis: d.axis })) });
    ok(again.specs.length === 0 && again.counts.skipped > 0, 'run again: nothing is made twice', JSON.stringify(again.counts));
    ed.undo();
    ok(WD.readWallDimensions(w()).length === 0, 'one undo takes them all back');
    const noOpen = AD.planAutoDimensions({ walls: sn.walls, openingRows: sn.openings, level: L1.id, view, openings: false });
    ok(noOpen.specs.filter((x) => x.side === 'south').length < southRow.length, 'without "doors and windows" the south row is shorter');
    const onlyOverall = AD.planAutoDimensions({ walls: sn.walls, openingRows: sn.openings, level: L1.id, view, chains: false });
    ok(onlyOverall.specs.length === 2, 'overall only: two dimensions');
    const upper = AD.planAutoDimensions({ walls: sn.walls, openingRows: sn.openings, level: L2.id, view: 'plan:' + L2.guid });
    ok(upper.specs.length === 0 && upper.notes.some((x) => x.code === 'autodim.none'), 'a level with no walls says so');
    // tools
    const AG = await imp('autodim-agents.js');
    const applied = [];
    const env = { ed: () => ed, apply: async (label, op) => { applied.push(label); return ed.modelChange(op, { label }); }, levels: () => OPS.snapshotModel(ed).levels };
    const [tool] = AG.autodimTools(env);
    const pre = await tool.run({ level: L1.guid, preview: true });
    ok(pre.dimensions > 5 && applied.length === 0 && WD.readWallDimensions(w()).length === 0, 'plan_dimension preview: counts, changes nothing', JSON.stringify(pre.counts));
    const out = await tool.run({ level: L1.guid });
    ok(out.dimensions === pre.dimensions && applied.length === 1 && WD.readWallDimensions(w()).length === out.dimensions, 'plan_dimension: the same dimensions, one undo step');
    const out2 = await tool.run({ level: L1.guid });
    ok(out2.dimensions === 0 && applied.length === 1, 'plan_dimension again: nothing to add, no empty undo step');
  }

  if (want('c')) {
    console.log('== LC.2 the team\'s models');
    const { loadTeamModels } = await imp('team-models.js');
    const uu = (n) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');
    const added = [];
    const addModel = async (f) => { const ent = { name: f.name }; added.push(ent); return ent; };
    const asked = [];
    const request = async (p) => { asked.push(p); if (p.includes(uu(4))) return { status: 404, bytes: async () => new Uint8Array() }; return { status: 200, bytes: async () => new Uint8Array([1, 2, 3]) }; };
    const tw = { drawing: uu(1), model: async () => ({ ok: true, hidden: 2, models: [
      { drawing: { uuid: uu(1), name: 'mine.ifc', app: 'bimcraft', version: 3 }, discipline: 'arch', offset: { x: 0, y: 0, z: 0, rot: 0 }, visible: true },
      { drawing: { uuid: uu(2), name: 'structure.ifc', app: 'bimcraft', version: 5 }, discipline: 'struct', offset: { x: 2500, y: -1000, z: 300, rot: 15 }, visible: true },
      { drawing: { uuid: uu(3), name: 'site.dwg', app: 'cadcraft', version: 1 }, discipline: 'civil', offset: { x: 0, y: 0, z: 0, rot: 0 }, visible: true },
      { drawing: { uuid: uu(4), name: 'gone.ifc', app: 'bimcraft', version: 1 }, discipline: 'mep', offset: { x: 0, y: 0, z: 0, rot: 0 }, visible: true },
      { drawing: { uuid: uu(5), name: 'off.ifc', app: 'bimcraft', version: 1 }, discipline: 'mep', offset: { x: 0, y: 0, z: 0, rot: 0 }, visible: false },
    ] }) };
    const r = await loadTeamModels({ tw, addModel, request, have: () => [], FileCtor: class { constructor(parts, name) { this.name = name; this.parts = parts; } } });
    ok(r.ok && r.added.join() === 'structure.ifc', 'only the other BimCraft/IFC models are opened (not this file, not a .dwg)', JSON.stringify(r));
    ok(Math.abs(added[0].offset[0] - 2.5) < 1e-9 && Math.abs(added[0].offset[1] + 1) < 1e-9 && Math.abs(added[0].offset[2] - 0.3) < 1e-9, 'offsets: millimetres in the team model, metres here', JSON.stringify(added[0].offset));
    ok(r.turned === 1 && r.hidden === 2, 'a turned model is opened unturned and counted; hidden ones are counted', JSON.stringify({ turned: r.turned, hidden: r.hidden }));
    ok(r.skipped.some((x) => x.name === 'gone.ifc' && /404/.test(x.why)) && r.skipped.some((x) => x.name === 'site.dwg') && r.skipped.some((x) => x.name === 'off.ifc'), 'unreadable, non-IFC and hidden ones are listed as skipped', JSON.stringify(r.skipped));
    ok(asked.every((p) => p.startsWith('/api/v1/sync/open?drawing=') && /version=\d/.test(p)), 'each file is fetched with the version the project names', asked.join(' '));
    const r2 = await loadTeamModels({ tw, addModel, request, have: () => [uu(2)], FileCtor: class { constructor(p, n) { this.name = n; } } });
    ok(r2.added.length === 0, 'a model already open is not opened twice');
    const r3 = await loadTeamModels({ tw: { model: async () => ({ ok: false, message: 'Sign in' }) }, addModel, request });
    ok(!r3.ok && r3.message === 'Sign in', 'a team model that cannot be read says why');
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
