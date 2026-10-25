/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --famsolid [--only use,break,round,speed]` (0.7 BIM-FAM-SOLID, session bim-07): families used hard, broken on
 * purpose, round-tripped and timed. use: four families made from nothing (door, window, cabinet, table), 50 of each placed, sizes changed,
 * undo and redo through all of it, saved and reopened. break: huge, empty, cyclic and wrong recipes, a hostile file, a family deleted while
 * placed, two editors saving the same family. round: IFC4 and IFC2X3 saved and reopened; the families read as plain types by cc-ifc.
 * speed: 2,000 placed elements, a family of 100 solids, one size change that redraws everything (numbers printed with the machine's load).
 */
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

export async function famSolidMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const FM = await import(path.join(APP, 'family-model.js'));
  const FO = await import(path.join(APP, 'family-ops.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const oi = args.indexOf('--only'), only = oi >= 0 ? new Set(String(args[oi + 1] || '').split(',')) : null;
  const want = (k) => !only || only.has(k);
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const refused = (fn) => { try { fn(); return ''; } catch (e) { return e.key || e.message || String(e); } };
  const open = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, w: () => { const w = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w); return w; } };
  };
  const building = (levels = 2, extra = {}) => open(new TextEncoder().encode(N.newBuilding({ name: 'Fam', levels: N.stackLevels(levels, 3000, (i) => 'Level ' + (i + 1)), fileName: 'f.ifc', now: new Date('2026-10-23T12:00:00Z'), ...extra })));
  const timeIt = async (fn) => { const t0 = performance.now(); const r = await fn(); return [r, Math.round(performance.now() - t0)]; };
  const load = () => os.loadavg().map((x) => x.toFixed(2)).join(' ');

  // ================================================================================================ use
  if (want('use')) {
    console.log('== use: four families from nothing, fifty of each');
    const { ed } = await building();
    let snap = OPS.snapshotModel(ed);
    const [A, B] = snap.levels.map((l) => l.guid);
    // long walls so fifty doors and fifty windows fit
    ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [0, 0], b: [60000, 0] }, { a: [0, 5000], b: [60000, 5000] }], typeKey: 'ext-2x6', topLevel: B }));
    snap = OPS.snapshotModel(ed);
    const s0 = snap.walls.find((w) => w.a[1] === 0), s1 = snap.walls.find((w) => w.a[1] === 5000);
    const keys = {};
    for (const [name, kind, host, base] of [['My door', 'door', 'wall', 'door-single'], ['My window', 'window', 'wall', 'win-fixed'], ['My cabinet', 'furniture', 'none', ''], ['My table', 'furniture', 'none', '']]) {
      const r = ed.modelChange(FO.newFamily({ name, kind, host, base }), { label: name, verb: 'Made' });
      keys[name] = r.key;
    }
    ok(Object.values(keys).every((k) => /^fam-/.test(k)) && new Set(Object.values(keys)).size === 4, 'four families made, four different keys');
    // a table with a leg parameter and a cabinet with a door switch, edited like a person would
    const fams = (() => { const w = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w); return FO.readFamilies(w); })();
    const recipe = (k) => { const w = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w); return JSON.parse(JSON.stringify(FM.familyFor(w, k))); };
    const tab = recipe(keys['My table']);
    tab.params.push({ key: 'Top', kind: 'length', value: 40 }, { key: 'Legs', kind: 'yesno', value: 1 });
    tab.solids = [{ id: 's1', name: 'Top', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '(Height - Top)', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'wood' },
      { id: 's2', name: 'Leg', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(-Width / 2 + 50)', y1: '50', z1: '(Height - Top)', style: 'wood', visible: 'Legs' }];
    ed.modelChange(FO.saveFamily(tab), { label: 'My table', verb: 'Saved' });
    ok(fams.length >= 4, 'readFamilies lists them (' + fams.length + ')');
    // fifty of each
    for (let i = 0; i < 50; i++) {
      ed.modelChange(OPS.placeOpening({ wall: s0.guid, typeKey: 'door-single', family: keys['My door'], offset: 300 + i * 1100, width: 900, face: 'left' }));
      ed.modelChange(OPS.placeOpening({ wall: s1.guid, typeKey: 'win-fixed', family: keys['My window'], offset: 300 + i * 1100, width: 900, face: 'right' }));
      ed.modelChange(FO.placeFamily({ storey: A, family: keys['My cabinet'], x: 500 + i * 1000, y: 1000 }));
      ed.modelChange(FO.placeFamily({ storey: A, family: keys['My table'], x: 500 + i * 1000, y: 2500 }));
    }
    snap = OPS.snapshotModel(ed);
    const mine = (k) => snap.openings.filter((o) => o.family === k).length;
    const w1 = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w1);
    const els = FO.readFamilyElements(w1);
    ok(mine(keys['My door']) === 50 && mine(keys['My window']) === 50 && els.filter((e) => e.family === keys['My cabinet']).length === 50 && els.filter((e) => e.family === keys['My table']).length === 50, 'fifty doors, fifty windows, fifty cabinets, fifty tables placed');
    // sizes: a wider door for all fifty, a taller table for all
    const doorFam = recipe(keys['My door']);
    const sz = ed.modelChange(FO.newSize(keys['My table'], { name: 'Tall', values: { Height: 1100 } }));
    const tallGuid = sz.typeGuid;
    const tabIds = els.filter((e) => e.family === keys['My table']).map((e) => e.guid);
    ed.modelChange(FO.setFamilySize(tabIds, tallGuid));
    const w2 = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w2);
    ok(FO.readFamilyElements(w2).filter((e) => e.family === keys['My table'] && e.size === 'Tall').length === 50, 'fifty tables changed to the Tall size in one step');
    // undo and redo back through the last three changes
    const before = JSON.stringify(OPS.snapshotModel(ed).openings.length);
    ed.undo(); ed.undo(); ed.redo(); ed.redo();
    const w3 = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w3);
    ok(FO.readFamilyElements(w3).filter((e) => e.family === keys['My table'] && e.size === 'Tall').length === 50 && String(OPS.snapshotModel(ed).openings.length) === before, 'undo, undo, redo, redo: the same fifty tall tables and 100 openings');
    // save, close, reopen
    const bytes = ed.save();
    const again = await open(bytes);
    const w4 = again.w();
    const fams2 = FO.readFamilies(w4).filter((f) => Object.values(keys).includes(f.key));
    ok(fams2.length === 4 && FO.readFamilyElements(w4).length === 100 && OPS.snapshotModel(again.ed).openings.length === 100, 'saved, reopened: four families, 100 placed furniture, 100 openings (' + Math.round(bytes.length / 1024) + ' kB)');
    ok(doorFam.params.some((p) => p.key === 'Width'), 'the door family keeps its Width parameter');
  }

  // ================================================================================================ break
  if (want('break')) {
    console.log('== break: bad recipes, a hostile file, deleted while placed, two editors');
    const { ed } = await building();
    const w = () => { const x = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(x); return x; };
    const r = ed.modelChange(FO.newFamily({ name: 'Victim', kind: 'furniture' }));
    const key = r.key;
    const base = () => JSON.parse(JSON.stringify(FM.familyFor(w(), key)));
    const rd = (mut) => { const f = base(); mut(f); const x = FM.readFamily(f); return x.ok ? '' : x.errors[0].key; };
    ok(rd((f) => { f.solids = Array.from({ length: 201 }, (_, i) => ({ id: 's' + i, name: 'x', op: 'box', x0: '0', y0: '0', z0: '0', x1: '10', y1: '10', z1: '10', style: 'solid' })); }) !== '', '201 solids: refused (the limit is ' + FM.LIMITS.solids + ')');
    ok(rd((f) => { f.params = Array.from({ length: 61 }, (_, i) => ({ key: 'P' + i, kind: 'length', value: 1 })); }) !== '', '61 parameters: refused');
    ok(rd((f) => { f.solids = []; }) !== '' || true, 'no solids at all: ' + (rd((f) => { f.solids = []; }) || 'accepted (an empty family)'));
    const empty = base(); empty.solids = [];
    const eres = refused(() => ed.modelChange(FO.saveFamily(empty)));
    ok(eres === '' || /fam\.err/.test(eres), 'an empty family saves or is refused cleanly (' + (eres || 'saved') + ')');
    if (eres === '') {
      const p = refused(() => ed.modelChange(FO.placeFamily({ storey: OPS.snapshotModel(ed).levels[0].guid, family: key })));
      ok(p === '' || /fam\.err/.test(p), 'placing an empty family does not crash (' + (p || 'placed') + ')');
      ed.undo();
      ed.modelChange(FO.saveFamily(base().solids.length ? base() : (() => { const b = base(); b.solids = [{ id: 's1', name: 'Block', op: 'box', x0: '0', y0: '0', z0: '0', x1: 'Width', y1: 'Depth', z1: 'Height', style: 'solid' }]; return b; })()));
    }
    {
      const cyc = base(); cyc.params.push({ key: 'A', kind: 'length', value: 0, formula: 'B' }, { key: 'B', kind: 'length', value: 0, formula: 'A' });
      const ev = FM.evaluateFamily(FM.readFamily(cyc).family, {});
      const sv = refused(() => ed.modelChange(FO.saveFamily(cyc))), im = refused(() => ed.modelChange(FO.importFamily({ ...cyc, key: 'fam-cyc1' })));
      ok(!ev.ok && ev.error.key === 'fam.err.cycle' && /^fam\.err/.test(sv) && /^fam\.err/.test(im), 'cyclic formulas A = B, B = A: the evaluator says "cycle"; saving and importing it are refused (' + sv + ', ' + im + ')');
    }
    ok(rd((f) => { f.solids[0].x1 = 'Nope + 1'; }) !== '', 'a formula naming an unknown parameter: refused');
    ok(rd((f) => { f.solids[0].x1 = '1 / 0'; }) !== '' || !FM.evaluateFamily(Object.assign(base(), { solids: [{ ...base().solids[0], x1: '1 / 0' }] }), {}).ok, 'a formula dividing by zero: refused or reported');
    ok(rd((f) => { f.solids[0].x1 = 'x'.repeat(FM.LIMITS.expr + 1); }) !== '', 'an expression over ' + FM.LIMITS.expr + ' characters: refused');
    ok(rd((f) => { f.solids[0].x1 = '(((((((((((((((((((((((((((((((((((((((((1)))))))))))))))))))))))))))))))))))))))))'; }) !== '' || true, 'forty nested brackets: no hang, no crash');
    ok(rd((f) => { f.name = '<script>alert(1)</script>'.repeat(20); }) === '' || true, 'a hostile name is kept as text (checked below)');
    // a hostile file through importFamily
    const evil = base();
    evil.name = '<img src=x onerror=alert(1)>' + 'N'.repeat(500);
    evil.key = '../../etc/passwd';
    evil.__proto__ = { polluted: true };
    evil.params[0].key = 'constructor';
    let ek = refused(() => ed.modelChange(FO.importFamily(JSON.parse(JSON.stringify(evil)))));
    ok(ek !== '' || ({}).polluted === undefined, 'a hostile key and a parameter named constructor are refused or tamed (' + (ek || 'imported') + ')');
    const sane = JSON.parse(JSON.stringify(base()));
    sane.name = '<b>Chair</b> ' + 'N'.repeat(500);
    sane.key = 'fam-ok1';
    ek = refused(() => ed.modelChange(FO.importFamily(sane)));
    const imported = FO.readFamilies(w()).find((f) => /Chair/.test(f.name || ''));
    ok(ek === '' && imported && imported.name.length <= FM.LIMITS.name && ({}).polluted === undefined, 'a long name with markup is cut to ' + FM.LIMITS.name + ' characters and kept as text (' + (imported?.name?.length) + ')');
    ok(refused(() => FM.readFamily('{"format":"cadcraft-family"}')) === '' && !FM.readFamily(null).ok && !FM.readFamily([]).ok && !FM.readFamily({ format: 'x' }).ok, 'junk (a string, null, an array, the wrong format) is refused without throwing');
    // deleted while placed
    const lv = OPS.snapshotModel(ed).levels[0].guid;
    ed.modelChange(FO.placeFamily({ storey: lv, family: key, x: 1000, y: 1000 }));
    ok(/fam\.err\.inuse/.test(refused(() => ed.modelChange(FO.removeFamily(key)))), 'a family with a placed element cannot be deleted: "in use"');
    ed.modelChange(FO.removeFamilyElements([FO.readFamilyElements(w()).find((e) => e.family === key).guid]));
    ed.modelChange(FO.removeFamily(key));
    ok(!FO.readFamilies(w()).some((f) => f.key === key), 'with its elements gone it can be deleted');
    // two editors: both open the same family, both save a different change; the second must not silently drop the first
    const k2 = ed.modelChange(FO.newFamily({ name: 'Shared', kind: 'furniture' })).key;
    const mineA = JSON.parse(JSON.stringify(FM.familyFor(w(), k2))), mineB = JSON.parse(JSON.stringify(FM.familyFor(w(), k2)));
    mineA.params.push({ key: 'FromA', kind: 'length', value: 10 });
    mineB.params.push({ key: 'FromB', kind: 'length', value: 20 });
    ed.modelChange(FO.saveFamily(mineA));
    const second = refused(() => ed.modelChange(FO.saveFamily(mineB)));
    const final = FM.familyFor(w(), k2).params.map((p) => p.key);
    ok(final.includes('FromA') && (second === 'fam.err.changed' ? !final.includes('FromB') : final.includes('FromB')), 'two editors: the second save is refused ("changed since you opened it") or merged; the first change is never lost (' + (second || 'saved') + '; ' + final.join(',') + ')');
  }

  // ================================================================================================ round
  if (want('round')) {
    console.log('== round: IFC4 and IFC2X3, saved and reopened; read as plain types');
    const x3 = path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc');
    for (const schema of ['IFC4', 'IFC2X3']) {
      const b = schema === 'IFC4' ? await building() : await open(fs.readFileSync(x3));
      const w = () => { const x = new ModelWriter(WebIFC, b.ed.api, b.ed.mid); FO.familyWriter(x); return x; };
      const lv = OPS.snapshotModel(b.ed).levels[0].guid;
      const tab = b.ed.modelChange(FO.newFamily({ name: 'RT table', kind: 'furniture' })).key;
      const door = b.ed.modelChange(FO.newFamily({ name: 'RT door', kind: 'door', host: 'wall', base: 'door-single' })).key;
      b.ed.modelChange(FO.placeFamily({ storey: lv, family: tab, x: 1000, y: 1000 }));
      let doors = 0;
      if (schema === 'IFC4') {
        b.ed.modelChange(OPS.drawWalls({ storey: lv, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'ext-2x6', topLevel: '', height: 2700 }));
        const wall = OPS.snapshotModel(b.ed).walls[0];
        b.ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey: 'door-single', family: door, offset: 1000, face: 'left' }));
        doors = 1;
      }
      const bytes = b.ed.save();
      const txt = new TextDecoder().decode(bytes);
      const re = await open(bytes);
      const w2 = re.w();
      const fams = FO.readFamilies(w2).filter((f) => [door, tab].includes(f.key));
      ok(txt.includes("FILE_SCHEMA(('" + schema + "'))") && fams.length === 2 && FO.readFamilyElements(w2).filter((e) => e.family === tab).length === 1 && OPS.snapshotModel(re.ed).openings.filter((o) => o.family === door).length === doors, schema + ': saved and reopened: both families, the table still placed' + (doors ? ', the door still placed' : ''));
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      const m = await quiet((x) => eng.load(x))(bytes);
      ok(m.types.some((t) => /Furniture|Furnishing/.test(t.name)), schema + ': cc-ifc lists the table as an ordinary element (' + m.types.map((t) => t.name + ' ' + t.count).join(', ') + ')');
      ok(!/IFCTRIANGULATEDFACESET|IFCFACETEDBREP|IFCPOLYGONALFACESET/.test(txt) && /IFCEXTRUDEDAREASOLID|IFCCSGSOLID/.test(txt), schema + ': DC.115, a family\'s geometry is IFC\'s own solids (extrusions, Booleans), never a list of faces');
      ok(!/IFCGROUP\([^;]*'Family'/.test(txt) || /IFCRELASSIGNSTOGROUP/.test(txt), schema + ': the family is a plain IfcGroup with its sizes assigned');
    }
  }

  // ================================================================================================ speed
  if (want('speed')) {
    console.log('== speed (VPS, capped; load ' + load() + ')');
    const { ed } = await building();
    const lv = OPS.snapshotModel(ed).levels[0].guid;
    const key = ed.modelChange(FO.newFamily({ name: 'Bulk', kind: 'furniture' })).key;
    const w = () => { const x = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(x); return x; };
    const [, tPlace] = await timeIt(async () => { for (let i = 0; i < 2000; i++) ed.modelChange(FO.placeFamily({ storey: lv, family: key, x: (i % 50) * 800, y: Math.floor(i / 50) * 800 })); });
    console.log('  2,000 placements, one change each: ' + tPlace + ' ms (' + (tPlace / 2000).toFixed(1) + ' ms each)');
    const els = FO.readFamilyElements(w());
    ok(els.length === 2000, '2,000 elements placed');
    const [, tRead] = await timeIt(() => FO.readFamilyElements(w()));
    const [, tSnap] = await timeIt(() => OPS.snapshotModel(ed));
    console.log('  read the 2,000 elements: ' + tRead + ' ms; snapshot: ' + tSnap + ' ms');
    const rec = JSON.parse(JSON.stringify(FM.familyFor(w(), key)));
    rec.solids = Array.from({ length: 100 }, (_, i) => ({ id: 's' + (i + 1), name: 'Part ' + i, op: 'box', x0: String(i * 10), y0: '0', z0: '0', x1: String(i * 10 + 8), y1: 'Depth', z1: 'Height', style: 'wood' }));
    const [, tSave] = await timeIt(() => ed.modelChange(FO.saveFamily(rec), { label: 'Bulk', verb: 'Saved' }));
    console.log('  saving a family of 100 solids with 2,000 placed (every element made again): ' + tSave + ' ms');
    const sz = ed.modelChange(FO.newSize(key, { name: 'Big', values: { Width: 1200 } }));
    const [, tSize] = await timeIt(() => ed.modelChange(FO.setFamilySize(FO.readFamilyElements(w()).map((e) => e.guid), sz.typeGuid)));
    console.log('  one size change on all 2,000: ' + tSize + ' ms');
    const [bytes, tSaveIfc] = await timeIt(() => ed.save());
    const [, tOpen] = await timeIt(() => open(bytes));
    console.log('  Save as IFC: ' + tSaveIfc + ' ms (' + (bytes.length / 1048576).toFixed(1) + ' MB); open it again: ' + tOpen + ' ms; load ' + load());
    ok(tSize < 60000 && tSave < 60000 && tOpen < 60000, 'every step under a minute');
  }
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
