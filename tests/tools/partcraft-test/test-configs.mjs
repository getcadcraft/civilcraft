#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-configs.mjs — PartCraft configurations (0.4 P18): design-table rows saved in the part (configs.js). A row from the
 * current values (driving parameters only), applying it (the linked extrude follows), matching, rename / delete, rows
 * following renamed and deleted parameters, the part file (round trip, version 3, tampered files refused), CSV in and
 * out (a name that reads as a formula is quoted), and the .pcscript round trip (with the P14 material); 0.6 LC.14: rows that turn
 * features off (applied with the values, the file at version 4, tampered ids dropped).
 *   node tools/partcraft-test/test-configs.mjs [--verbose]    (or runConfigTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runConfigTests({ ok, section }) {
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const PP = await import(DEV + 'params-part.js');
  const CF = await import(DEV + 'configs.js');
  const SC = await import(DEV + 'script.js');
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /** A plate w × 60 extruded d deep; area = w·d is a formula (not driving). */
  const make = () => {
    const part = P.newPart('Plate');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 60]);
    const s = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    const ex = P.addFeature(part, 'extrude', { sketch: s.id, depth: 10 });
    part.params = { vars: [{ name: 'w', expr: '100' }, { name: 'd', expr: '10' }, { name: 'area', expr: 'w*d' }], links: [{ target: `${ex.id}.depth`, expr: 'd' }] };
    return { part, ex };
  };

  section('configurations: rows saved in the part (configs.js)');
  {
    const { part, ex } = make();
    const small = CF.rowFromCurrent(part.params, '  Small\u0007 ');
    ok(small.name === 'Small' && same(small.values, { w: 100, d: 10 }), 'a row from the current values holds the driving parameters only (w, d — not the formula area), its name cleaned');
    let cfg = CF.saveRow(null, small);
    part.params.vars[1].expr = '25';
    cfg = CF.saveRow(cfg, CF.rowFromCurrent(part.params, 'Thick'));
    ok(cfg.rows.length === 2 && cfg.rows[1].values.d === 25, 'a second row with d 25');
    cfg = CF.saveRow(cfg, { name: 'small', values: { w: 120, d: 8 } });
    ok(cfg.rows.length === 2 && cfg.rows[0].name === 'Small' && cfg.rows[0].values.w === 120, 'saving a row whose name differs only in case replaces it and keeps its name');
    CF.applyRow(part.params, cfg.rows[0]);
    const res = PP.applyPartParams(part);
    ok(res.ok !== false && part.params.vars[0].expr === '120' && P.featureById(part, ex.id).depth === 8, 'applying Small: w 120, d 8, and the linked extrude is 8 deep');
    ok(CF.rowMatches(part.params, cfg.rows[0]) && !CF.rowMatches(part.params, cfg.rows[1]), 'the current values match Small, not Thick');
    part.params.vars[1].expr = '9';
    ok(!CF.rowMatches(part.params, cfg.rows[0]), 'after d changes, Small no longer matches (the panel says "active, changed since")');
    let r2 = CF.renameRow({ ...cfg, active: 'Small' }, 'Small', 'Light');
    ok(r2.rows[0].name === 'Light' && r2.active === 'Light', 'rename moves the active mark with it');
    let threw = ''; try { CF.renameRow(cfg, 'Small', 'thick'); } catch (e) { threw = e.message; }
    ok(/already a configuration called thick/.test(threw), `a name already taken is refused: "${threw}"`);
    const d1 = CF.deleteRow({ ...cfg, active: 'Thick' }, 'Thick');
    ok(d1.rows.length === 1 && d1.active === null && CF.deleteRow(d1, 'Small') === null, 'delete clears the active mark; the last row gone leaves no configurations');
    // parameters renamed / deleted
    const before = JSON.parse(JSON.stringify(part.params));
    const after = JSON.parse(JSON.stringify(part.params)); after.vars[0].name = 'width';
    let f = CF.followParams(cfg, before, after);
    ok(same(f.rows[0].values, { width: 120, d: 8 }), 'parameter w renamed width: every row carries its value under the new name');
    const gone = JSON.parse(JSON.stringify(after)); gone.vars.splice(1, 1);
    f = CF.followParams(f, after, gone);
    ok(same(f.rows[0].values, { width: 120 }) && same(f.rows[1].values, { width: 100 }), 'parameter d deleted: it drops out of every row');
  }

  section('configurations: the part file and the script');
  {
    const { part } = make();
    part.configs = { rows: [{ name: 'Small', values: { w: 100, d: 10 } }, { name: 'Large', values: { w: 200, d: 20 } }], active: 'Large' };
    part.material = { name: 'Steel', density: 7.85 };
    const json = P.toJSON(part);
    const back = P.readPart(json);
    ok(JSON.parse(json).version === 3 && same(back.configs, part.configs), 'saved and read back: version 3, both rows and the active one');
    const bad = (mut) => { const j = JSON.parse(json); mut(j); try { P.readPart(JSON.stringify(j)); return ''; } catch (e) { return e.message; } };
    ok(/sets size, but the part has no parameter of that name/.test(bad((j) => { j.configs.rows[0].values.size = 3; })), 'a row naming a parameter the part lacks is refused');
    ok(/value of w is not a number/.test(bad((j) => { j.configs.rows[0].values.w = '1e999'; })), 'a value that is not a number is refused');
    ok(/same name as another/.test(bad((j) => { j.configs.rows[1].name = 'SMALL'; })) && /no name/.test(bad((j) => { j.configs.rows[1].name = ' '; })), 'duplicate (any case) and empty names are refused');
    ok(/configurations are bad/.test(bad((j) => { j.configs.rows = Array.from({ length: 501 }, (_, i) => ({ name: 'r' + i, values: {} })); })), 'more than 500 rows is refused');
    ok(P.readPart(JSON.stringify({ ...JSON.parse(json), configs: { rows: [{ name: 'A', values: {} }], active: 'Nope' } })).configs.active === null, 'an active name that is not a row is dropped');
    const noCfg = JSON.parse(json); delete noCfg.configs; delete noCfg.material;
    ok(P.toJSON(P.readPart(JSON.stringify({ ...noCfg, configs: { rows: [] } }))).includes('"configs"') === false, 'an empty list leaves the file');
    // the script carries both
    const sc = SC.partToScript(back);
    const re = SC.scriptToPart(sc.text).part;
    ok(/^configs json /m.test(sc.text) && /^material json /m.test(sc.text) && same(re.configs, part.configs) && same(re.material, part.material), '.pcscript: "configs json …" and "material json …" lines, read back the same');
  }

  section('configurations: CSV in and out');
  {
    const { part } = make();
    const rows = CF.rowsFromTable('name,w,d\r\nSmall,100,10\r\n"Large, wide",250,12\r\nKeep d,90,\r\n', part.params);
    ok(rows.length === 3 && rows[1].name === 'Large, wide' && same(rows[1].values, { w: 250, d: 12 }) && same(rows[2].values, { w: 90 }), 'a CSV design table becomes rows (a quoted name with a comma; an empty cell sets nothing)');
    let cfg = null; for (const r of rows) cfg = CF.saveRow(cfg, r);
    cfg = CF.saveRow(cfg, { name: '=cmd|calc', values: { w: 1 } });
    const csv = CF.configsCsv(cfg);
    ok(csv.startsWith('name,w,d\r\n') && csv.includes('"Large, wide",250,12\r\n') && csv.includes('Keep d,90,\r\n') && csv.includes("'=cmd|calc,1,\r\n"), 'out again: a quoted name, an empty cell, and a name that reads as a formula gets a leading \'');
    const again = CF.rowsFromTable(csv, part.params);
    ok(same(again.slice(0, 3), rows), 'and back in: the same rows');
    let threw = ''; try { CF.rowsFromTable('name,size\r\nA,3\r\n', part.params); } catch (e) { threw = e.message; }
    ok(/no parameter with that name/.test(threw), 'a column that is not a parameter is refused');
  }

  section('configurations that turn features off (0.6 LC.14: a configurator\'s "with / without" options)');
  {
    const K = await import(DEV + 'kernel.js');
    const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
    const M = await Module(); M.setup();
    // the plate (100 × 60 × d) with a 20 × 20 boss 30 deep on it: 60000 + 20·20·(30 − 10) = 68000 mm³ at d 10
    const { part } = make();
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [20, 20]);
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    const boss = P.addFeature(part, 'extrude', { sketch: s2.id, depth: 30 });
    const vol = () => K.regenerate(part, M).stats.volume;
    const close = (a, b) => Math.abs(a - b) <= 1e-6 * b;
    ok(close(vol(), 68000), 'the plate with its boss: 68000 mm³');
    const withBoss = CF.rowFromCurrent(part.params, 'With boss', part.features);
    ok(withBoss.off === undefined, 'a row saved with every feature on carries no "off" (the file stays as before)');
    P.featureById(part, boss.id).suppressed = true;
    part.params.vars[1].expr = '20';
    const plain = CF.rowFromCurrent(part.params, 'Plain thick', part.features);
    ok(same(plain.off, [boss.id]) && same(plain.values, { w: 100, d: 20 }), 'with the boss suppressed and d 20: the row records the boss as off, and the values');
    let cfg = CF.saveRow(CF.saveRow(null, withBoss), plain);
    cfg = CF.saveRow(cfg, { name: 'Old row', values: { w: 100, d: 10 } });
    ok(CF.controlsFeatures(cfg) && same([...CF.featuresOff(cfg, cfg.rows[2])], []) && same([...CF.featuresOff(cfg, cfg.rows[1])], [boss.id]), 'once a row turns a feature off, the configurations control features: a row without "off" means everything on');
    ok(CF.featuresOff(CF.saveRow(null, withBoss), withBoss) === null, 'configurations that never turn a feature off leave features alone');
    // apply as the panel does: values + features in one go
    const apply = (row) => { CF.applyRow(part.params, row); const off = CF.featuresOff(cfg, row); if (off) for (const f of part.features) { if (off.has(f.id)) f.suppressed = true; else delete f.suppressed; } PP.applyPartParams(part); };
    apply(cfg.rows[0]);
    ok(!P.featureById(part, boss.id).suppressed && close(vol(), 68000) && CF.rowMatches(part.params, cfg.rows[0], part.features, cfg), 'applying "With boss": the boss is on again, 68000 mm³, and the row matches');
    apply(cfg.rows[1]);
    ok(P.featureById(part, boss.id).suppressed && close(vol(), 100 * 60 * 20), 'applying "Plain thick": the boss is off and the plate 20 deep: 120000 mm³');
    ok(CF.rowMatches(part.params, cfg.rows[1], part.features, cfg) && !CF.rowMatches(part.params, cfg.rows[0], part.features, cfg), 'the current part matches "Plain thick", not "With boss"');
    delete P.featureById(part, boss.id).suppressed;
    ok(!CF.rowMatches(part.params, cfg.rows[1], part.features, cfg), 'turning the boss back on by hand: "Plain thick" is changed since (features count)');
    // rename, delete, follow parameters and a design-table import keep "off"
    const rn = CF.renameRow(cfg, 'Plain thick', 'Plain');
    ok(same(rn.rows[1].off, [boss.id]) && same(CF.deleteRow(rn, 'With boss').rows[0].off, [boss.id]), 'rename and delete keep a row\'s features');
    const before = JSON.parse(JSON.stringify(part.params)), after = JSON.parse(JSON.stringify(part.params)); after.vars[0].name = 'width';
    ok(same(CF.followParams(cfg, before, after).rows[1].off, [boss.id]), 'a parameter renamed: the row keeps its features');
    const imp = CF.saveRow(cfg, { name: 'plain thick', values: { w: 110, d: 20 } }, { keepOff: true });
    ok(same(imp.rows[1].off, [boss.id]) && imp.rows[1].values.w === 110, 'a design-table import over a row changes its values and keeps its features');
    ok(CF.saveRow(cfg, { name: 'Plain thick', values: { w: 100, d: 20 } }).rows[1].off === undefined, 'Update (saving over a row) records the features as they are now (all on here)');
    // the file: version 4 only with features off; read back; tampered ids
    part.configs = cfg;
    const json = P.toJSON(part), back = P.readPart(json);
    ok(JSON.parse(json).version === 4 && P.VERSION >= 4 && same(back.configs, cfg),   // 0.7 D7.49 made 5 a real version (mesh bodies)
       'saved and read back: version 4 (a 0.5 PartCraft refuses it by its version), the rows\' features intact');
    part.configs = CF.saveRow(null, withBoss);
    ok(JSON.parse(P.toJSON(part)).version === 3, 'configurations without features off stay version 3');
    const j = JSON.parse(json);
    j.configs.rows[1].off = ['nope', 7, boss.id, boss.id, s2.id];
    const t2 = P.readPart(JSON.stringify(j));
    ok(same(t2.configs.rows[1].off, [s2.id, boss.id]), 'tampered "off": ids the part lacks and non-strings dropped, each once, in the part\'s order');
    j.configs.rows[1].off = ['nope'];
    ok(P.readPart(JSON.stringify(j)).configs.rows[1].off === undefined, 'nothing left after dropping unknown ids: the row has no "off"');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runConfigTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
