/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbols-test.mjs — the symbol-set registry (lib/symbols, synced to BimCraft's dev/), the electrical and plumbing sets, and plan symbols as
 * IFC annotations (0.8 GH.3-F/G, session gh3sym_PART_3), DOM-free, run by
 *   node bin/test-bimcraft.mjs --symbols
 */
import path from 'node:path';
import fs from 'node:fs';

export async function symbolsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (c, label, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && d ? ' (' + d + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const S = await import(path.join(APP, 'symbol-sets.js'));
  const { PLUMBING_SET } = await import(path.join(APP, 'plumbing-set.js'));
  const EL = await import(path.join(APP, 'res-elec-symbols.js'));
  const RE = await import(path.join(APP, 'res-elec.js'));

  // 0. the copies in dev/ are the library's files, byte for byte
  for (const [from, to] of [['symbol-sets.js', 'symbol-sets.js'], ['symbol-palette.js', 'symbol-palette.js'], ['sets/plumbing-set.js', 'plumbing-set.js']])
    ok(Buffer.compare(fs.readFileSync(path.join(ROOT, 'lib/symbols', from)), fs.readFileSync(path.join(APP, to))) === 0, `dev/${to} is lib/symbols/${from} (run node tools/symbols/sync.mjs bimcraft)`);

  // 1. the plumbing set reads clean and has what was asked for
  const reg = S.createSymbolSets();
  const pr = reg.register(PLUMBING_SET);
  ok(pr.ok && pr.problems.length === 0, 'the plumbing set is read with no problems', JSON.stringify(pr.problems.slice(0, 2)));
  const keys = new Set(PLUMBING_SET.symbols.map((s) => s.key));
  for (const k of ['wc', 'urinal', 'lav', 'bath', 'shower', 'sink.kitchen', 'floordrain', 'hosebib', 'hydrant.wall', 'waterheater', 'cleanout', 'valve.gate', 'valve.globe', 'valve.ball', 'valve.check', 'line.cw', 'line.hw', 'line.waste', 'line.vent']) ok(keys.has(k), 'plumbing symbol ' + k);
  ok(PLUMBING_SET.symbols.every((s) => s.name && s.category && s.nameKey), 'every plumbing symbol has a name, a category and a language key');
  ok(PLUMBING_SET.license === 'Apache-2.0' && /PLUMBING-SOURCES/.test(PLUMBING_SET.source), 'the set names its licence and its sources note');
  ok(['CW', 'HW', 'W', 'V'].every((a) => PLUMBING_SET.symbols.some((s) => s.kind === 'line' && s.abbr === a && s.ents.some((e) => e.type === 'text' && e.s === a))), 'hot, cold, waste and vent line styles carry their abbreviations');
  ok(fs.existsSync(path.join(ROOT, 'lib/symbols/sets/PLUMBING-SOURCES.md')), 'PLUMBING-SOURCES.md exists');
  const sizes = PLUMBING_SET.symbols.filter((s) => s.kind === 'symbol').map((s) => { const b = S.symbolBounds(s); return Math.max(b.x1 - b.x0, b.y1 - b.y0); });
  ok(sizes.every((z) => z > 2 && z < 40), 'fixture sizes are plausible at 1:50 paper mm (2 to 40)');
  const svg = S.symbolSvg(reg.find('plumbing', 'wc'));
  ok(/^<svg /.test(svg) && !/<script|href=|on\w+=/.test(svg), 'the picture is plain SVG with no script or reference');

  // 2. the registry: search, categories, untrusted data
  const t = null;
  ok(reg.search('toilet').length === 0 && reg.search('water closet').some((r) => r.symbol.key === 'wc'), 'search finds by name');
  ok(reg.search('WC')[0]?.symbol.key === 'wc', 'search finds by abbreviation, any case');
  ok(reg.search('', { category: 'valves' }).length === 6, 'six valve types');
  ok(reg.search('gate valve', { set: 'plumbing' }).length === 1, 'words must all match');
  ok(reg.search('lav', { keys: new Set(['plumbing/lav']) }).length === 1 && reg.search('lav', { keys: new Set(['plumbing/wc']) }).length === 0, 'search limited to a key list (favourites)');
  ok(reg.search('cafe').length === 0 && S.createSymbolSets().register({ id: 'x', categories: [{ id: 'a', name: 'Café' }], symbols: [{ key: 'k', category: 'a', name: 'Café', ents: [{ type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }] }] }).ok, 'a set is registered');
  { const r2 = S.createSymbolSets(); r2.register({ id: 'x', categories: [{ id: 'a', name: 'Café' }], symbols: [{ key: 'k', category: 'a', name: 'Café', ents: [{ type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }] }] }); ok(r2.search('cafe').length === 1, 'search ignores accents and case'); }
  const bad1 = S.readSet({ id: 'Bad Id!', symbols: [] });
  ok(!bad1.set && bad1.problems[0].code === 'symbols.set.id', 'a bad set id is refused');
  const bad2 = S.readSet({ id: 'ok', categories: [{ id: 'a' }], symbols: [{ key: 'one', category: 'a', ents: [{ type: 'line', x1: 0, y1: 0, x2: NaN, y2: 1 }] }, { key: 'two', category: 'zzz', ents: [{ type: 'circle', cx: 0, cy: 0, r: 1 }] }, { key: 'two', category: 'a', ents: [{ type: 'circle', cx: 0, cy: 0, r: 1 }] }, { key: 'BAD', ents: [] }, { key: 'huge', category: 'a', ents: [{ type: 'line', x1: 0, y1: 0, x2: 1e9, y2: 1 }] }] });
  ok(bad2.set.symbols.length === 1 && bad2.set.symbols[0].category === 'other', 'bad geometry, repeated keys, bad keys and absurd numbers are dropped; an unknown category goes to Other', JSON.stringify(bad2.set.symbols.map((s) => s.key)));
  const sp = S.setProblems('ok', bad2.problems);
  ok(sp.length >= 4 && sp.every((p) => p.source.kind === 'import' && p.msg.key && p.text && p.about[0].id === 'ok' && p.id), 'set problems speak the shared Problems shape (msg key, text, about, source kind import)');
  const pp = S.placedProblems([{ guid: 'g1', set: 'plumbing', key: 'wc' }, { guid: 'g2', set: 'gone', key: 'zz', tag: 'Z1' }], reg);
  ok(pp.length === 1 && pp[0].code === 'symbols.placed.missing' && pp[0].about[0].id === 'g2', 'a placed symbol whose set is missing is a Problem; a present one is not');

  // 3. favourites: per browser, survive a bad store
  const mem = new Map(); const store = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v) };
  let fv = S.createFavourites(store, 'k');
  ok(fv.toggle('plumbing', 'wc') === true && fv.has('plumbing', 'wc'), 'star a symbol');
  fv = S.createFavourites(store, 'k');
  ok(fv.has('plumbing', 'wc') && !fv.has('plumbing', 'lav'), 'favourites come back from the store');
  ok(fv.toggle('plumbing', 'wc') === false && !S.createFavourites(store, 'k').has('plumbing', 'wc'), 'unstar');
  const fb = S.createFavourites({ getItem() { throw new Error('private'); }, setItem() { throw new Error('full'); } }, 'k');
  ok(fb.toggle('a', 'b') === true && fb.has('a', 'b'), 'a store that throws still works for the session');
  mem.set('k', '{"not":"an array"}'); ok(S.createFavourites(store, 'k').list().size === 0, 'a damaged store reads as empty');

  // 4. geometry: the shared symbolPlan equals the Electrical tool's own
  const elSet = S.createSymbolSets();
  const er = elSet.register({ id: 'electrical', categories: EL.GROUPS.map((g) => ({ id: g, name: g })), symbols: EL.SYMBOLS.map((s) => ({ key: s.key, category: s.group, name: s.key, ents: s.ents })) });
  ok(er.ok && er.set.symbols.length === EL.SYMBOLS.length && er.problems.length === 0, `all ${EL.SYMBOLS.length} electrical symbols register with no problems`, JSON.stringify(er.problems.slice(0, 2)));
  let same = true;
  for (const s of EL.SYMBOLS) {
    const a = RE.symbolPlan(s.key, [1000, 2000], 0.7, 50), b = S.symbolPlan(elSet.find('electrical', s.key), [1000, 2000], 0.7, 50);
    if (JSON.stringify(a) !== JSON.stringify(b)) same = false;
  }
  ok(same, 'symbolPlan gives the same drawing as the Electrical tool for every electrical symbol');
  const g0 = S.symbolPlan(reg.find('plumbing', 'wc'), [0, 0], Math.PI / 2, 50), g1 = S.symbolPlan(reg.find('plumbing', 'wc'), [0, 0], Math.PI / 2, 100);
  const ext = (g) => Math.max(...g.poly.map((p) => p[1])) - Math.min(...g.poly.map((p) => p[1]));
  ok(near(ext(g1) / ext(g0), 2, 0.05), 'a symbol scales with the drawing scale');
  const gr = S.symbolPlan(reg.find('plumbing', 'wc'), [0, 0], 0, 50);   // faces +x
  const w0 = Math.max(...g0.poly.map((p) => p[0])) - Math.min(...g0.poly.map((p) => p[0])), h0 = ext(g0);
  const w1 = Math.max(...gr.poly.map((p) => p[0])) - Math.min(...gr.poly.map((p) => p[0])), h1 = ext(gr);
  ok(near(w0, h1, 1) && near(h0, w1, 1), 'rotating 90 degrees swaps width and depth');

  // 5. plan symbols in an IFC model: place, read back, change, remove, one undo step each
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const PS = await import(path.join(APP, 'plan-symbols.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const text = N.newBuilding({ name: 'Symbols', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-10-29T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  let n0 = ed.changes.length;
  ed.modelChange(PS.placePlanSymbol({ level: L1.guid, set: 'plumbing', key: 'wc', name: 'Water closet', abbr: 'WC', at: [1200, 300], angle: Math.PI / 2 }), { label: 'Water closet' });
  ok(ed.changes.length === n0 + 1, 'placing a plumbing symbol is one undo step');
  ed.modelChange(PS.placePlanSymbol({ level: L1.guid, set: 'plumbing', key: 'line.hw', name: 'Hot water line', tag: '', at: [2000, 1000], angle: 0 }));
  ed.modelChange(PS.placePlanSymbol({ level: L1.guid, set: 'plumbing', key: 'wc', name: 'Water closet', abbr: 'WC', at: [3000, 300], angle: Math.PI }));
  let items = PS.readPlanSymbols(W());
  ok(items.length === 3, 'three plan symbols read back', String(items.length));
  let a = items.find((x) => near(x.at[0], 1200));
  ok(a && a.set === 'plumbing' && a.key === 'wc' && near(a.at[1], 300) && near(a.angle, Math.PI / 2, 1e-3) && a.storey != null, 'position, rotation, set and key are kept');
  ok(a.tag === 'WC1' && items.find((x) => near(x.at[0], 3000)).tag === 'WC2' && items.find((x) => x.key === 'line.hw').tag === '', 'fixtures are tagged WC1, WC2; a line style has no tag');
  ed.undo(); ed.undo(); ed.undo();
  ok(PS.readPlanSymbols(W()).length === 0, 'undo takes them off, one step each');
  ed.redo(); ed.redo(); ed.redo();
  items = PS.readPlanSymbols(W()); ok(items.length === 3, 'redo puts them back');
  a = items.find((x) => near(x.at[0], 1200));
  n0 = ed.changes.length;
  ed.modelChange(PS.changePlanSymbol(a.guid, { angle: 0, tag: 'WC-A' }));
  const a2 = PS.readPlanSymbols(W()).find((x) => x.guid === a.guid);
  ok(ed.changes.length === n0 + 1 && near(a2.angle, 0, 1e-3) && a2.tag === 'WC-A', 'rotate and re-tag is one step');
  n0 = ed.changes.length;
  ed.modelChange(PS.removePlanSymbols([a.guid]));
  ok(PS.readPlanSymbols(W()).length === 2 && ed.changes.length === n0 + 1, 'remove is one step');
  let threw = false; try { ed.modelChange(PS.placePlanSymbol({ level: L1.guid, set: 'Bad Set', key: 'wc', at: [0, 0] })); } catch (e) { threw = true; }
  ok(threw, 'a malformed set id is refused');
  const ifc = new TextDecoder().decode(ed.api.SaveModel ? ed.api.SaveModel(ed.mid) : new Uint8Array());
  ok(!ifc || /CadCraft_PlanSymbol/.test(ifc), 'the file carries the CadCraft_PlanSymbol property set');

  // 6. a symbol that snapped to a wall face follows the wall (0.8 GH.3-G, gh3g2_PART_3): same side, same place along it; one undo step for both;
  //    a deleted wall leaves it where it was and Problems says so
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }], typeKey: 'ext-2x6', topLevel: '', height: 3000, extSide: 'right' }));
  const { readWalls } = await import(path.join(APP, 'model-walls.js'));
  const walls = readWalls(W(), null).filter((x) => x.storey != null);
  const south = walls.find((x) => near(x.a[1], 0, 1) && near(x.b[1], 0, 1));
  const ws = RE.wallSpot(walls.map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t })), [2000, 150], 600);
  ok(!!ws && ws.wall === south.guid, 'wallSpot finds the south wall face');
  n0 = ed.changes.length;
  ed.modelChange(PS.placePlanSymbol({ level: L1.guid, set: 'plumbing', key: 'lav', name: 'Lavatory', abbr: 'LAV', at: ws.at, angle: ws.angle, wall: ws.wall, side: ws.side, offset: ws.offset, base: ws.angle }));
  const lv = PS.readPlanSymbols(W()).find((x) => x.key === 'lav');
  ok(lv && lv.wall === south.guid && lv.side === ws.side && near(lv.offset, ws.offset, 1) && near(lv.base, ws.angle, 1e-3), 'a wall symbol keeps its wall, side and distance along it');
  n0 = ed.changes.length;
  ed.modelChange(OPS.changeWall(south.guid, { a: [0, 500], b: [6000, 500] }));
  let lv2 = PS.readPlanSymbols(W()).find((x) => x.guid === lv.guid);
  ok(near(lv2.at[1] - lv.at[1], 500, 1) && near(lv2.at[0], lv.at[0], 1) && near(lv2.angle, lv.angle, 1e-3), `the wall moves 500: the symbol moves with it (dy ${(lv2.at[1] - lv.at[1]).toFixed(1)}), same face`);
  ok(ed.changes.length === n0 + 1, 'moving the wall is ONE undo step for wall and symbol');
  ed.undo();
  lv2 = PS.readPlanSymbols(W()).find((x) => x.guid === lv.guid);
  ok(near(lv2.at[1], lv.at[1], 1), 'one undo puts wall and symbol back');
  ed.redo();
  const free = PS.readPlanSymbols(W()).find((x) => x.key === 'wc' && near(x.at[0], 3000));
  ok(free && !free.wall, 'a symbol placed free (no wall) is not tied to one');
  ed.modelChange(OPS.removeWalls([south.guid]));
  lv2 = PS.readPlanSymbols(W()).find((x) => x.guid === lv.guid);
  ok(!!lv2 && near(lv2.at[0], lv.at[0], 1), 'the wall is deleted: the symbol stays');
  const lost = PS.symbolsWithoutWall(W(), PS.readPlanSymbols(W()));
  ok(lost.has(lv.guid) && lost.size === 1, 'the symbol that lost its wall is found');
  const probs = S.lostWallProblems(PS.readPlanSymbols(W()).map((x) => ({ ...x, lostWall: lost.has(x.guid) })));
  ok(probs.length === 1 && probs[0].msg.key === 'sym.problem.symbols.placed.nowall' && probs[0].about[0].id === lv.guid && probs[0].severity === 'warning', 'Problems carries one note for it (shared shape)', JSON.stringify(probs[0]));
  ed.undo();
  ok(PS.symbolsWithoutWall(W(), PS.readPlanSymbols(W())).size === 0, 'undo of the wall delete: the wall is back, nothing is lost');
  console.log(bad ? `${bad} FAILED` : 'symbols: all ok');
  return bad ? 1 : 0;
}
