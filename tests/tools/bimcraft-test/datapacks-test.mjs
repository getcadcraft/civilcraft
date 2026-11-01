/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --datapacks` (0.8 EG.14 / EG.17 / EG.15, session dec-eg_PART_3): swappable data sources — pack format, a factor file (ICE / EC3 style
 * CSV), a cost book (RSMeans style CSV), NASA POWER and PVGIS answers (hand-written fixtures of the documented response shape, NOT captured from the live
 * services), the climate cache and the clear-sky fallback; then the three panes' "Load from a source file / Fetch climate" buttons on a stand-in DOM.
 */
import path from 'node:path';

export async function datapacksMode({ APP }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const imp = (f) => import(path.join(APP, f));
  const DP = await imp('data-packs.js'), CF = await imp('carbon-factors.js'), CC = await imp('cost5d.js');

  console.log('== pack format');
  {
    const p = DP.makePack('carbon-factors', 'My Source', 'My source', { name: 'ICE v3', url: 'https://example.org', license: 'per its terms', retrieved: '2026-10-29' }, [{ id: 'a', match: ['steel'], basis: 'kg', density: 7850, a1a3: 1.5 }]);
    const r = DP.readPack(JSON.stringify(p));
    ok(r.ok && r.pack.rows.length === 1 && r.pack.rows[0].checked === false && r.pack.rows[0].source === 'steel' || r.pack.rows[0].source === 'ICE v3', 'a carbon pack reads back; its rows are unchecked and carry a source');
    ok(!DP.readPack(JSON.stringify({ ...p, source: { name: '' } })).ok, 'a pack with no source name is refused (numbers must say where they come from)');
    ok(!DP.readPack('{').ok && !DP.readPack('{"format":"x"}').ok, 'bad JSON and a wrong format are refused');
    const bp = DP.readPack(JSON.stringify(DP.makePack('price-book', 'cb', 'cb', { name: 'my book' }, [{ id: 'c', match: ['concrete'], unit: 'cy', mat: 150, lab: 40 }, { id: 'bad', match: ['x'], unit: 'zz', mat: 1 }])));
    ok(bp.ok && bp.pack.rows.length === 1 && bp.errors.length === 1, 'a price pack keeps the good row and reports the bad one');
    ok(!DP.readPack(JSON.stringify(DP.makePack('climate', 'c', 'c', { name: 'n' }, { ghi: [1, 2], tAmb: [] }))).ok, 'a climate pack needs twelve values of each');
    const cp = DP.readPack(JSON.stringify(DP.makePack('climate', 'c', 'c', { name: 'my file' }, { ghi: Array(12).fill(4), tAmb: Array(12).fill(15) })));
    ok(cp.ok && cp.pack.data.ghi.length === 12, 'a climate pack with twelve and twelve is read');
  }

  console.log('== EG.14 a factor file (header synonyms, units)');
  {
    const csv = 'Material,Declared Unit,GWP total (kgCO2e)\nReady-mix concrete C30,m3,300\nStructural steel,tonne,1700\n"Mineral wool, slab",kg,1.2\nMystery,furlong,5\n';
    const r = DP.carbonFromFile(csv, { source: 'ICE-style file' });
    ok(r.rows.length === 3 && r.errors.length === 1 && r.errors[0].code === 'unit', 'three rows read, the unknown unit refused', JSON.stringify(r.errors));
    const steel = r.rows.find((x) => /steel/.test(x.id));
    ok(steel && steel.basis === 'kg' && near(steel.a1a3, 1.7, 1e-9), 'a per-tonne figure becomes per kg (1700 → 1.7)', JSON.stringify(steel));
    const conc = r.rows[0];
    ok(conc.basis === 'm3' && conc.a1a3 === 300 && conc.checked === false && conc.origin === 'yours' && conc.source === 'ICE-style file' && /unreviewed/.test(conc.note), 'a per-m³ row: unchecked, yours, source named, labelled unreviewed');
    const hdr = DP.carbonFromFile('Name,kgCO2e/kg,Density\nTimber,0.4,500\n');
    ok(hdr.rows.length === 1 && hdr.rows[0].basis === 'kg' && hdr.rows[0].density === 500, 'the unit is read from a "kgCO2e/kg" header');
    const mapped = DP.carbonFromFile('A,B,C\nBrick,0.2,kg\n', { map: { name: 'A', gwp: 'B', unit: 'C' } });
    ok(mapped.rows.length === 1 && near(mapped.rows[0].a1a3, 0.2, 1e-12), 'columns can be chosen by name');
    ok(DP.carbonFromFile('foo,bar\n1,2\n').errors[0].code === 'header', 'a file with no name/figure columns says header');
    ok(DP.carbonFromFile("Material,Unit,GWP\n'=cmd|x,kg,1\n", { density: 1000 }).rows[0]?.match.join().startsWith('cmd'), 'a guarded formula cell (leading quote) is read back as plain text')
    const m = CF.matchRow(r.rows, { material: 'Structural steel' });
    ok(m && m.id.includes('steel'), 'an imported row matches by its name through the existing matcher');
  }

  console.log('== EG.17 a cost book');
  {
    const csv = 'Description,Unit,Material,Labor\nConcrete slab on grade,CY,"$145.50",62\nDrywall 5/8 in,SF,0.6,0.9\nFraming lumber,LF,1.1,\nBad,furlong,1,1\n';
    const r = DP.priceFromCostBook(csv, { source: 'my cost book 2026' });
    ok(r.rows.length === 3 && r.errors.length === 1, 'three rows priced, one refused for its unit', JSON.stringify(r.errors));
    const c = r.rows[0];
    ok(c.unit === 'cy' && c.mat === 145.5 && c.lab === 62 && c.source === 'my cost book 2026' && /unreviewed/.test(c.note), 'dollar signs and commas are read; unit CY → cy; source and label kept');
    ok(r.rows[1].unit === 'sf' && r.rows[2].lab === 0 && r.rows[2].mat === 1.1, 'SF → sf; an empty labor cell is 0');
    ok(DP.priceFromCostBook('x,y\n1,2\n').errors[0].code === 'header', 'a file with no description/unit/price columns says header');
    ok(CC.cleanPriceRow(r.rows[0]).row !== null, 'imported rows pass the price table\'s own check');
  }

  console.log('== EG.15 climate');
  {
    const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const g = [2, 2.9, 4, 5, 5.9, 6.5, 6.3, 5.6, 4.5, 3.2, 2.1, 1.7], t = [-1, 0, 5, 10, 15, 20, 23, 22, 17, 11, 5, 1];
    const nasa = { properties: { parameter: { ALLSKY_SFC_SW_DWN: Object.fromEntries(M.map((m, i) => [m, g[i]]).concat([['ANN', 4]])), T2M: Object.fromEntries(M.map((m, i) => [m, t[i]]).concat([['ANN', 10]])) } } };
    const n = DP.parseNasaPower(nasa);
    ok(n && n.ghi.join() === g.join() && n.tAmb.join() === t.join(), 'NASA POWER: twelve months of GHI (kWh/m²/day) and temperature, ANN ignored');
    ok(DP.parseNasaPower({ properties: { parameter: { ALLSKY_SFC_SW_DWN: { ...nasa.properties.parameter.ALLSKY_SFC_SW_DWN, JUN: -999 }, T2M: nasa.properties.parameter.T2M } } }) === null, 'NASA\'s -999 "no data" is refused, not used');
    const DIM = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const pv = { outputs: { monthly: [2019, 2020].flatMap((y) => g.map((x, i) => ({ year: y, month: i + 1, 'H(h)_m': x * DIM[i], T2m: t[i] }))) } };
    const p = DP.parsePvgis(pv);
    ok(p && p.ghi.every((x, i) => near(x, g[i], 0.006)) && p.tAmb.join() === t.join(), 'PVGIS: monthly kWh/m² averaged over years and divided by the days', JSON.stringify(p?.ghi));
    ok(DP.parsePvgis({ outputs: { monthly: [] } }) === null && DP.parsePvgis({}) === null, 'PVGIS: an empty or wrong answer gives null');
    ok(/power\.larc\.nasa\.gov.*latitude=40\.000/.test(DP.nasaPowerUrl(40, -105)) && /re\.jrc\.ec\.europa\.eu.*lat=40\.000&lon=-105\.000/.test(DP.pvgisUrl(40, -105)) && DP.nasaPowerUrl(95, 0) === null, 'the request addresses carry the site; an impossible latitude gives none');
    const mem = new Map(), store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
    let calls = 0;
    const f = async () => { calls++; return { ok: true, json: async () => nasa }; };
    const a = await DP.fetchClimate('nasa', 40, -105, { fetch: f, store });
    ok(a.ok && a.from === 'network' && calls === 1 && mem.size === 1, 'first fetch goes to the network once and is cached');
    const b = await DP.fetchClimate('nasa', 40.02, -105.03, { fetch: f, store });
    ok(b.ok && b.from === 'cache' && calls === 1, 'a site within the same 0.1° cell is answered from the cache with no network call');
    const off = await DP.fetchClimate('pvgis', 40, -105, { fetch: async () => { throw new Error('offline'); }, store });
    ok(!off.ok && off.fallback === 'clear', 'offline with nothing cached: falls back to the clear-sky ceiling and says so');
    const re = await DP.fetchClimate('nasa', 40, -105, { fetch: async () => { throw new Error('offline'); }, store, refresh: true });
    ok(re.ok && re.from === 'cache', 'a failed refresh still returns the cached answer');
    const bad = await DP.fetchClimate('nasa', 41, -100, { fetch: async () => ({ ok: true, json: async () => ({}) }), store });
    ok(!bad.ok && bad.error === 'answer' && bad.fallback === 'clear', 'an answer we do not understand is not used');
    ok((await DP.fetchClimate('nope', 1, 1, {})).error === 'provider', 'an unknown provider is refused');
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
