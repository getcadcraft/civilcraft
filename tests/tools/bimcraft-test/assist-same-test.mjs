/* SPDX-License-Identifier: Apache-2.0 */
/**
 * assist-same-test.mjs — BK.83 (booklet layer 5: the AI assistant stays optional and uses the same commands and undo),
 * session `bk-instep-10`. DOM-free, run by
 *   node bin/test-bimcraft.mjs --assistsame [--only same,scan]
 *
 *   same   Two copies of one new building. On copy A the assistant's tool runs (agents.js modelTools through host.js's
 *          dispatcher, as a connected assistant reaches it); on copy B the command the person's tool runs (the op the Draw
 *          tools commit, named beside each step). After every step: the two models are equal; the assistant's call is exactly
 *          ONE undo step whose label starts "Assistant: "; Undo gives back the model from before the call, exactly; Redo
 *          gives the step again. "Equal" = the same levels, walls, joins, doors and windows, rooms, floors, grid lines and
 *          names, and the same count of every IFC class in the saved file. (The saved TEXT of two copies is not compared:
 *          new GlobalIds are random and a join record lists its two walls in GlobalId order, so two people drawing the same
 *          walls get the same model in a different line order.) "Exactly" for Undo = that, plus the same saved text as before
 *          the call once GlobalIds and STEP line numbers are replaced by their order of appearance.
 *   scan   The apps contain no AI: tools/ai-scan/no-ai-scan.mjs over every app's dev build, the shared shell and lib/
 *          (its header lists every check and the one declared exception, the person's own-key client).
 * The same in the real page (clicks against a connected assistant): tools/bimcraft-test/browser-assist-same.mjs.
 */
import path from 'node:path';

export async function assistSameMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };

  if (want('same')) {
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const OPS = await import(path.join(APP, 'model-ops.js'));
    const N = await import(path.join(APP, 'new-model.js'));
    const AG = await import(path.join(APP, 'agents.js'));
    const MM = await import(path.join(APP, 'model-modify.js'));
    const MF = await import(path.join(APP, 'model-floors.js'));
    const MG = await import(path.join(APP, 'model-grids.js'));
    const MSI = await import(path.join(APP, 'model-site.js'));
    const MR = await import(path.join(APP, 'model-rooms.js'));
    const { createDispatcher } = await import(path.join(APP, 'host.js'));
    const { val } = await import(path.join(APP, 'ifc-util.js'));

    const text0 = N.newBuilding({ name: 'Same', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'same.ifc', now: new Date('2026-11-11T12:00:00Z') });
    const open = async () => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(new TextEncoder().encode(text0)); return new IfcEditor(WebIFC, eng); };
    const A = await open(), B = await open();
    const w = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
    // the assistant's side: the tools on the dispatcher a connected assistant talks to, with Edit allowed
    const d = createDispatcher({ server: { name: 'bimcraft', title: 'BimCraft', version: 'test' }, allowed: () => ['read', 'edit'] });
    for (const def of AG.modelTools({ ed: () => A, apply: async (label, op) => A.modelChange(op, { label: 'Assistant: ' + label }) })) d.tool(def);
    const call = async (name, a = {}) => { const r = await d.call(name, a); if (r.isError) throw new Error(name + ': ' + (r.content?.[0]?.text || 'error')); return r.structuredContent; };

    const r1 = (v) => Math.round(v * 10) / 10, pt = (p) => p.map(r1).join(',');
    /** What the model is, with no GlobalId or line number in it. */
    function stateOf(ed) {
      const s = OPS.snapshotModel(ed), wr = w(ed);
      const wallKey = new Map(s.walls.map((x) => [x.id, pt(x.a) + '>' + pt(x.b)]));
      const loops = s.levels.map((l) => { const L = OPS.loopsOf(ed, l.id); return L.rooms.map((r) => r1(r.area) + '/' + r1(r.perimeter)).sort(); });
      const name = (id) => { try { return String(val(ed.api.GetLine(ed.mid, id, false).Name) ?? ''); } catch (e) { return '?'; } };
      return JSON.stringify({
        levels: s.levels.map((l) => [l.name, r1(l.elevation), r1(l.height)]),
        walls: s.walls.map((x) => [wallKey.get(x.id), x.typeKey, r1(x.t), r1(x.len), r1(x.height), x.extSide, r1(x.baseOffset || 0), x.justification, (x.joins || []).map((j) => j.kind + ':' + j.end).sort().join(' '), name(x.id), s.levels.findIndex((l) => l.id === x.storey)]).sort(),
        openings: s.openings.map((o) => [o.kind, o.typeKey, wallKey.get(o.wall), r1(o.offset), r1(o.width), r1(o.height), r1(o.sill), o.mark, o.hand, o.face, o.family || '', o.sizeName || '', name(o.id)]).sort(),
        rooms: s.derived.spaces.map((sp) => [sp.number, sp.name, pt(sp.seed)]).sort(), derived: [s.derived.floors.length, s.derived.ceilings.length, s.derived.roofs.length],
        loops,
        floors: MF.readDrawnFloors(wr).map((f) => [f.points.map(pt).join(' '), f.kind, f.use, r1(f.thickness), r1(f.offset || 0)]).sort(),
        grids: MG.readGrids(wr).flatMap((g) => g.axes.map((x) => [x.tag, pt(x.a), pt(x.b)])).sort(),
      });
    }
    /** The saved file with GlobalIds and line numbers replaced by their order of appearance; and its count of every class. */
    function fileOf(ed) {
      const txt = new TextDecoder().decode(ed.save());
      const data = txt.slice(txt.indexOf('DATA;'));
      const hist = {};
      for (const m of data.matchAll(/^#\d+\s*=\s*(IFC[A-Z0-9]+)\(/gm)) hist[m[1]] = (hist[m[1]] || 0) + 1;
      const ids = new Map(), guids = new Map();
      const norm = data.replace(/'([0-9A-Za-z_$]{22})'/g, (m, g) => { if (!guids.has(g)) guids.set(g, guids.size); return "'G" + guids.get(g) + "'"; })
        .replace(/#(\d+)/g, (m, n) => { if (!ids.has(n)) ids.set(n, ids.size); return '#L' + ids.get(n); });
      return { hist: JSON.stringify(Object.entries(hist).sort()), norm, lines: data.split('\n').length };
    }
    const guidAt = (ed, a, b) => OPS.snapshotModel(ed).walls.find((x) => pt(x.a) === pt(a) && pt(x.b) === pt(b))?.guid;
    const opening = (ed, kind) => OPS.snapshotModel(ed).openings.find((o) => o.kind === kind);
    const L = (ed) => OPS.snapshotModel(ed).levels;
    const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    const FLOOR = [[1000, 1000], [3000, 1000], [3000, 3000], [1000, 3000]];

    /** Each step: the assistant's tool call on A, and the person's command on B (what their tool commits). */
    const steps = [
      { what: 'walls_add (four walls, closed) = the Wall tool\'s drawWalls',
        tool: () => call('walls_add', { points: P, closed: true, type: 'concrete-200' }),
        user: () => B.modelChange(OPS.drawWalls({ storey: L(B)[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'concrete-200', topLevel: L(B)[1].guid })) },
      { what: 'walls_add (one partition) = the Wall tool\'s drawWalls',
        tool: () => call('walls_add', { level: 'Level 1', points: [[4000, 0], [4000, 5000]], type: 'int-100' }),
        user: () => B.modelChange(OPS.drawWalls({ storey: L(B)[0].guid, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-100', topLevel: L(B)[1].guid })) },
      { what: 'opening_add (a door) = the Door tool\'s placeOpening',
        tool: () => call('opening_add', { wall: guidAt(A, [0, 0], [8000, 0]), kind: 'door', type: 'door-single', offset: 1000 }),
        user: () => B.modelChange(OPS.placeOpening({ wall: guidAt(B, [0, 0], [8000, 0]), typeKey: 'door-single', offset: 1000, sill: 0 })) },
      { what: 'opening_add (a window, its size given) = the Window tool\'s placeOpening',
        tool: () => call('opening_add', { wall: guidAt(A, [8000, 0], [8000, 5000]), kind: 'window', type: 'win-fixed', offset: 2000, width: 1500, height: 1200, sill: 900 }),
        user: () => B.modelChange(OPS.placeOpening({ wall: guidAt(B, [8000, 0], [8000, 5000]), typeKey: 'win-fixed', offset: 2000, width: 1500, height: 1200, sill: 900 })) },
      { what: 'wall_change (move a wall: both ends 1000 east) = Properties / grips\' changeWall',
        tool: () => call('wall_change', { guid: guidAt(A, [8000, 0], [8000, 5000]), a: [9000, 0], b: [9000, 5000] }),
        user: () => B.modelChange(OPS.changeWall(guidAt(B, [8000, 0], [8000, 5000]), { a: [9000, 0], b: [9000, 5000] })) },
      { what: 'wall_change (a type change) = Properties › Wall type\'s changeWall',
        tool: () => call('wall_change', { guid: guidAt(A, [4000, 0], [4000, 5000]), type: 'int-2x4' }),
        user: () => B.modelChange(OPS.changeWall(guidAt(B, [4000, 0], [4000, 5000]), { typeKey: 'int-2x4' })) },
      { what: 'opening_change (slide the door 500 along) = dragging it: changeOpening',
        tool: () => call('opening_change', { guid: opening(A, 'door').guid, offset: 1500 }),
        user: () => B.modelChange(OPS.changeOpening(opening(B, 'door').guid, { offset: 1500 })) },
      { what: 'floor_add = the Floor tool\'s placeDrawnFloor',
        tool: () => call('floor_add', { points: FLOOR, kind: 'concrete' }),
        user: () => B.modelChange(MF.placeDrawnFloor({ storey: L(B)[0].guid, points: FLOOR, kind: 'concrete', use: 'floor', offset: 0 })) },
      { what: 'elements_move (the drawn floor 500 east, 250 north) = the Move tool\'s moveElements',
        tool: () => call('elements_move', { guids: [MF.readDrawnFloors(w(A))[0].guid], by: [500, 250] }),
        user: () => B.modelChange(MM.moveElements([{ guid: MF.readDrawnFloors(w(B))[0].guid, dx: 500, dy: 250 }])) },
      { what: 'levels_add = the Levels panel\'s addLevels',
        tool: () => call('levels_add', { elevations: [6000] }),
        user: () => B.modelChange(MSI.addLevels({ elevations: [6000] })) },
      { what: 'grid_add = Build › Grid\'s placeGrid',
        tool: () => call('grid_add', { origin: [0, 0], u: { count: 3, spacing: 4000 }, v: { count: 2, spacing: 5000 } }),
        user: () => B.modelChange(MG.placeGrid({ storey: L(B)[0].guid, axes: MG.gridLayout({ origin: [0, 0], angle: 0, u: { count: 3, spacing: 4000 }, v: { count: 2, spacing: 5000 }, extend: 1500 }) })) },
      { what: 'element_set (a wall\'s Name) = the Properties panel\'s setAttribute',
        tool: () => call('element_set', { guid: guidAt(A, [0, 0], [9000, 0]), attribute: 'Name', value: 'South wall' }),
        user: () => { const g = guidAt(B, [0, 0], [9000, 0]); B.setAttribute(w(B).byGuid(g), 'Name', 'South wall'); } },
      { what: 'elements_delete (the window) = Delete: removeElements',
        tool: () => call('elements_delete', { guids: [opening(A, 'window').guid] }),
        user: () => B.modelChange(OPS.removeElements({ walls: [], openings: [opening(B, 'window').guid], derived: [] })) },
      { what: 'elements_delete (the partition) = Delete: removeElements',
        tool: () => call('elements_delete', { guids: [guidAt(A, [4000, 0], [4000, 5000])] }),
        user: () => B.modelChange(OPS.removeElements({ walls: [guidAt(B, [4000, 0], [4000, 5000])], openings: [], derived: [] })) },
    ];

    console.log('== BK.83 the assistant\'s tool against the person\'s command, step by step');
    ok(stateOf(A) === stateOf(B) && fileOf(A).norm === fileOf(B).norm, 'both copies start as the same model (the same text)');
    for (const st of steps) {
      const before = stateOf(A), fileBefore = fileOf(A), n0 = A.changes.length;
      let err = '';
      try { await st.tool(); } catch (e) { err = 'assistant: ' + (e.message || e); }
      try { if (!err) await st.user(); } catch (e) { err = 'person: ' + (e.key || e.message || e); }
      if (err) { ok(false, st.what, err); continue; }
      const top = A.changes[A.changes.length - 1], sa = stateOf(A), sb = stateOf(B), fa = fileOf(A), fb = fileOf(B);
      const diff = () => { const a = JSON.parse(sa), b = JSON.parse(sb); return Object.keys(a).filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map((k) => k + ': ' + JSON.stringify(a[k]).slice(0, 160) + ' vs ' + JSON.stringify(b[k]).slice(0, 160)).join(' | '); };
      ok(sa === sb && sa !== before, st.what + ': the models are equal', sa === before ? 'nothing changed' : diff());
      ok(fa.hist === fb.hist, '  … the saved files hold the same count of every IFC class', (() => { const a = new Map(JSON.parse(fa.hist)), b = new Map(JSON.parse(fb.hist)); return [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k)).map((k) => k + ' ' + a.get(k) + '/' + b.get(k)).join(', '); })());
      ok(A.changes.length === n0 + 1 && /^Assistant: \S/.test(String(top?.label || '')), '  … one undo step, "' + (top?.label || '') + '"', (A.changes.length - n0) + ' steps');
      A.undo();
      const fu = fileOf(A);
      ok(stateOf(A) === before && fu.hist === fileBefore.hist && fu.norm === fileBefore.norm && A.changes.length === n0, '  … Undo: the model from before the call, exactly', stateOf(A) === before ? (fu.hist === fileBefore.hist ? 'the saved text differs' : 'the class counts differ') : 'the model differs');
      A.redo();
      ok(stateOf(A) === sb && A.changes.length === n0 + 1, '  … Redo: the step again');
    }
    ok(A.changes.length === steps.length && A.changes.every((c) => /^Assistant: /.test(String(c.label || ''))), steps.length + ' assistant calls made ' + A.changes.length + ' undo steps, every one labelled "Assistant: …"', A.changes.map((c) => c.label).join(' | '));
    // all of it undone: the new building again
    while (A.changes.length) A.undo();
    ok(new TextDecoder().decode(A.save()).split('\n').length === text0.split('\n').length && stateOf(A) === stateOf(await open()), 'every step undone: the new building as it was made');
    // a read tool and a refused edit make no step
    const n1 = A.changes.length;
    await call('model_describe'); await call('walls_list');
    let refused = ''; try { await call('wall_change', { guid: 'nope' }); } catch (e) { refused = e.message; }
    ok(A.changes.length === n1 && refused, 'reading (model_describe, walls_list) and a refused edit make no undo step');
    // elements_move and what the Draw tools keep by outline: only in plan, never mixed with other elements (0.10 fix: it moved the placement alone)
    await call('floor_add', { points: FLOOR, kind: 'concrete' });
    const fg = MF.readDrawnFloors(w(A))[0].guid, n2 = A.changes.length;
    let up = ''; try { await call('elements_move', { guids: [fg], by: [0, 0, 300] }); } catch (e) { up = e.message; }
    ok(/plan/.test(up) && A.changes.length === n2 && MF.readDrawnFloors(w(A))[0].points[0].join() === '1000,1000', 'elements_move of a drawn floor with a height: refused in words, nothing changed', up);
    await call('elements_move', { guids: [fg], by: [500, 250] });
    const f1 = MF.readDrawnFloors(w(A))[0];
    ok(A.changes.length === n2 + 1 && f1.points[0].join() === '1500,1250' && f1.guid === fg, 'elements_move of a drawn floor: its outline moved with it (one step), the same element');
    A.undo(); A.undo();
    const defs = AG.modelTools({ ed: () => A, apply: async () => { throw new Error('x'); } });
    const edits = defs.filter((t) => t.group === 'edit');
    ok(edits.length >= 12 && edits.every((t) => typeof t.run === 'function'), edits.length + ' edit tools listed (' + edits.map((t) => t.name).slice(0, 14).join(', ') + ' …)');
  }

  if (want('scan')) {
    console.log('== BK.83 the apps contain no AI (tools/ai-scan/no-ai-scan.mjs)');
    const S = await import(path.join(ROOT, 'tools/ai-scan/no-ai-scan.mjs'));
    const r = S.scan({ root: ROOT });
    ok(r.files > 1000 && r.roots.length >= 9, 'scanned ' + r.files + ' files in ' + r.roots.length + ' folders (' + r.roots.map((x) => path.basename(path.dirname(x)) === 'apps' ? path.basename(x) : x.split('/').slice(-2).join('/')).join(', ') + ')');
    for (const c of S.CHECKS) { const hits = r.hits.filter((h) => h.check === c.id); ok(!hits.length, c.id + ': ' + c.what, hits.slice(0, 6).map((h) => h.file + (h.line ? ':' + h.line : '') + ' ' + h.match).join(' | ') + (hits.length > 6 ? ' … ' + hits.length + ' in all' : '')); }
    // 0.10 (owner 2026-11-11): no exception list. The own-key client is an add-on outside every app build, scanned under its own rule.
    ok(S.EXCEPTION === undefined && S.exceptionChecks === undefined && S.scan.length <= 1, 'the scan has no exception list (no file of an app, the shell or lib/ may match)');
    const a = S.scanAddons({ root: ROOT });
    ok(a.hits.length === 0, 'the add-on folder (' + a.home + '/, ' + a.files + ' files): no match outside what its rule allows', a.hits.slice(0, 6).map((h) => h.file + ' ' + h.check).join(' | '));
    for (const x of await S.addonChecks({ root: ROOT, result: r, addons: a })) ok(x.ok, 'the own-key add-on: ' + x.what, x.detail);
    {   // the rule refuses what it is for: a made-up repo where another add-on file holds a provider address, and where an app file does
      const fsx = await import('node:fs'), osx = await import('node:os');
      const tmp = fsx.mkdtempSync(path.join(osx.tmpdir(), 'noai-'));
      const put = (rel, text) => { fsx.mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true }); fsx.writeFileSync(path.join(tmp, rel), text); };
      const addr = 'fetch("https://api.' + 'openai.com/v1/x")';
      put(S.ADDON.engine, addr); put(S.ADDON.home + '/' + S.ADDON.id + '/main.js', addr); put(S.ADDON.home + '/other/main.js', addr); put('public_html/assets/js/shell.js', addr); put('public_html/assets/apps/x/dev/a.js', 'ok');
      const ta = S.scanAddons({ root: tmp }), ts = S.scan({ root: tmp });
      ok(ta.allowed.length === 1 && ta.hits.length === 2 && ta.hits.every((h) => h.file !== S.ADDON.engine), 'planted: a provider address in any add-on file but the engine is a finding (2 planted, ' + ta.hits.length + ' found)');
      ok(ts.hits.length === 1 && ts.hits[0].file === 'public_html/assets/js/shell.js', 'planted: a provider address in a shell file is a finding, with nothing to excuse it');
      fsx.rmSync(tmp, { recursive: true, force: true });
    }
    const self = S.selfTest();
    ok(self.every((x) => x.caught), 'the scan catches what it is for: ' + self.length + ' planted samples, one per check', self.filter((x) => !x.caught).map((x) => x.id).join(', '));
  }

  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
