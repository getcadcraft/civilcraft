/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --ep` (0.8 round 2, EG.13, session `energy_PART_2`): the EnergyPlus step. The IDF from the hand-worked room E1 and from the
 * showcase house (shape, boundaries, window, layered construction, gains, a year run period), the engine harness against a stand-in Emscripten module,
 * the readers for eplusout.err / .eio / .eso on files written in EnergyPlus's documented layouts, the comparison with energy-bim.js, the Problems,
 * the licence gate and the engine address checks. EnergyPlus itself is not on this machine: with EP_NATIVE=<path to the energyplus 26.2 binary> the
 * IDFs are also run natively (as ops-idf.mjs does for the spike). The wasm engine is not built in the repo (owner's licence answers wait), so no
 * test here has run it: that is said in the log, not hidden.
 */
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { energyBuilding } from './ops-energy.mjs';

export async function epMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const imp = (f) => import(path.join(APP, f));
  const open = async (data) => {
    const { IfcEditor } = await imp('ifc-edit.js');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(typeof data === 'string' ? new TextEncoder().encode(data) : data);
    return new IfcEditor(WebIFC, eng);
  };
  const EP = await imp('energy-ep.js'), RUN = await imp('energy-ep-run.js'), E = await imp('energy-bim.js');

  console.log('== EG.13 the IDF from the model');
  const ed = await open(energyBuilding({ site: true }));
  const d = EP.prepareModel(WebIFC, ed.api, ed.mid, { name: 'E1' });
  ok(d.ok && d.zones === 1 && d.windows === 1 && d.skipped.length === 0 && d.surfaces === 6, 'E1: one zone, six merged faces, one window, nothing skipped', JSON.stringify(d.skipped));
  const objs = d.text.split(/;\s*\n/).map((x) => x.replace(/^(!.*\n)+/gm, '').trim()).filter(Boolean);
  const of = (type) => objs.filter((o) => o.startsWith(type + ','));
  const split = (o) => o.split(/,\s*\n\s*/).map((x) => x.trim());
  const surf = of('BuildingSurface:Detailed').map(split);
  ok(surf.map((x) => x[2] + ':' + x[6]).sort().join(' ') === 'Floor:Ground Roof:Outdoors Wall:Outdoors Wall:Outdoors Wall:Outdoors Wall:Outdoors', 'floor on the ground, roof and four walls outdoors');
  ok(/^Version,\s*\n\s*26\.2;/m.test(d.text) && of('SimulationControl')[0].includes('No,\n  No,\n  Yes,\n  No,\n  No,\n  1') , 'version 26.2; sizing periods only for the design mode (no weather-file run)', of('SimulationControl')[0]);
  ok(!/RunPeriod/.test(d.text) && of('People').length === 0 && of('Lights').length === 0, 'design mode: no run period and no gains (as the design aid\'s heat loss has none)');
  ok(d.zoneOf.size === 1 && [...d.zoneOf.keys()][0] === [...d.zoneOf.keys()][0].toUpperCase() && d.notes.includes('ep.note.nosite') === false, 'zone names are kept upper case for matching EnergyPlus\'s output; the site is read (51°30′) so no "no site" note');
  const ns = await open(energyBuilding({ site: false }));
  const none = EP.prepareModel(WebIFC, ns.api, ns.mid, {});
  ok(none.ok && none.notes.includes('ep.note.nosite') && /Site:Location,\s*\n\s*Site,\s*\n\s*51\.5,/.test(none.text), 'a model without a site still writes (51.5° default) and says so in notes');

  const year = EP.prepareModel(WebIFC, ed.api, ed.mid, { name: 'E1', mode: 'year' });
  ok(/RunPeriod,\s*\n\s*Year,\s*\n\s*1,\s*\n\s*1,/.test(year.text) && /\nPeople,\s*\n/.test(year.text) && /\nLights,\s*\n/.test(year.text) && /\nElectricEquipment,\s*\n/.test(year.text), 'year mode: a run period, people, lights and equipment per m²');
  ok((year.text.match(/Zone Ideal Loads Zone Total Heating Energy/g) || []).length === 1 && (year.text.match(/Zone Ideal Loads Zone Total Cooling Energy/g) || []).length === 1, 'year mode asks for the heating and cooling energy of each ideal-loads object');
  const peo = year.text.match(/People,\s*\n\s*([^,]*),\s*\n\s*([^,]*),\s*\n\s*Always on,\s*\n\s*Area\/Person,\s*\n\s*,\s*\n\s*,\s*\n\s*([\d.]+),/);
  ok(peo && Number(peo[3]) === 10, 'people at 10 m² a person (the inputs)');

  // thermal mass: layers from the file
  const lay = await open(energyBuilding({ layers: true, site: true }));
  const lm = EP.prepareModel(WebIFC, lay.api, lay.mid, { name: 'E1 layers', mass: true });
  const lf = EP.prepareModel(WebIFC, lay.api, lay.mid, { name: 'E1 layers', mass: false });
  ok(lm.notes.includes('ep.note.layers') && /\nMaterial,\s*\n/.test(lm.text) && !/\nMaterial,\s*\n/.test(lf.text), 'mass: walls with known layers are written layer by layer (Material, with density and specific heat); without it, no-mass');
  const mats = (lm.text.match(/\nMaterial,\s*\n[^;]*;/g) || []).map((m) => m.replace(/\s+/g, '').split(','));
  ok(mats.length >= 2 && mats.every((m) => [3, 4, 5, 6].every((i) => Number(m[i]) > 0)), 'each layer has a thickness, conductivity, density and specific heat above 0', JSON.stringify(mats.slice(0, 2)));
  ok(EP.EP_THERMAL.every(([k, rho, cp]) => rho > 0 && cp > 0) && EP.EP_NAME === 'EnergyPlus version 26.2.0', 'thermal table sane; the engine is named "EnergyPlus version 26.2.0" (clause 4)');

  // the showcase house
  const house = path.resolve(ROOT, 'fixtures/showcase/bimcraft-house.ifc');
  if (fs.existsSync(house)) {
    const hed = await open(fs.readFileSync(house));
    const h = EP.prepareModel(WebIFC, hed.api, hed.mid, { name: 'Showcase house' });
    ok(h.ok && h.zones === 5 && h.windows === 9 && h.skipped.length === 0, 'showcase house: 5 zones, 9 windows, nothing skipped', `${h.zones} zones, ${h.windows} windows, ${h.skipped.length} skipped`);
  } else console.log('  --   fixtures/showcase/bimcraft-house.ifc not here');

  console.log('== EG.13 reading what EnergyPlus writes (documented layouts)');
  const err = EP.parseErr(' ** Warning ** x\n ** Severe  ** bad thing\n ** Fatal  ** stop\n ************* EnergyPlus Terminated--Fatal Error Detected.');
  ok(!err.completed && err.fatal && err.severe === 1 && err.warnings === 1 && err.messages.length === 2, 'eplusout.err: severe, fatal and warnings counted');
  ok(EP.parseErr(' ************* EnergyPlus Completed Successfully-- 0 Warning; 0 Severe Errors').completed, 'a completed run is recognised');
  const eio = ' Zone Sizing Information, ZONE R 1, Cooling, 1212.39656, 10.0\n Zone Sizing Information, ZONE R 1, Heating, 762.32511, 0.0\n Zone Sizing Information, ZONE B, Heating, abc\n Other, x\n';
  const sz = EP.parseSizing(eio);
  ok(sz.size === 1 && near(sz.get('ZONE R 1').heating, 762.32511, 1e-9) && near(sz.get('ZONE R 1').cooling, 1212.39656, 1e-9), 'eplusout.eio: design heating and cooling per zone, bad rows skipped');
  const eso = ['Program Version,EnergyPlus, Version 26.2.0, YMD=2026.10.28 12:00', '1,5,Environment Title[],Latitude[deg],Longitude[deg],Time Zone[],Elevation[m]', '2,7,Day of Simulation[],Month[],Day of Month[],DST Indicator[1=yes 0=no],Hour[],StartMinute[],EndMinute[],DayType',
    '7,1,ZONE R 1 IDEAL,Zone Ideal Loads Zone Total Heating Energy [J] !RunPeriod [Value,Min,Month,Day,Hour,Minute,Max,Month,Day,Hour,Minute]', '8,1,ZONE R 1 IDEAL,Zone Ideal Loads Zone Total Cooling Energy [J] !RunPeriod [Value,Min,Month,Day,Hour,Minute,Max,Month,Day,Hour,Minute]',
    '9,1,ZONE R 1 IDEAL,Zone Ideal Loads Zone Total Heating Energy [J] !Hourly', 'End of Data Dictionary', '1,"E1",51.50,0.00,0.00,0.00', '7,7.2E+09,0,1,1,1,0,9,1,2,1,2,0', '8,3.6E+09,0,1,1,1,0,9,1,2,1,2,0', '9,1.0,0', 'End of Data'].join('\n');
  const ye = EP.yearByZone(EP.parseEso(eso));
  ok(ye.size === 1 && near(ye.get('ZONE R 1').heating, 2000, 1e-6) && near(ye.get('ZONE R 1').cooling, 1000, 1e-6), 'eplusout.eso: RunPeriod joules to kWh (7.2E9 J = 2000 kWh), hourly rows ignored');

  console.log('== EG.13 comparison and Problems');
  const ours = [{ id: 'r1', heat: { total: 755.2 }, cool: { total: 1000 } }];
  const zoneOf = new Map([['ZONE R 1', { id: 'r1', name: 'Room 1' }]]);
  const cmp = EP.compareDesign(sz, ours, zoneOf);
  ok(cmp.length === 1 && near(cmp[0].dHeating, (762.32511 - 755.2) / 755.2, 1e-9) && near(cmp[0].dCooling, 0.21239656, 1e-8), 'ratio (EnergyPlus − ours) / ours: heating +0.94 % (the spike\'s E1 figures), cooling +21 %');
  const pr = EP.problemsEp(cmp, { completed: true, severe: 0 }, { tolerance: 0.15 });
  ok(pr.length === 0, 'inside 15 % on heating: no problem (cooling differs by design: ours has a peak, theirs a sized day)');
  const pr2 = EP.problemsEp([{ ...cmp[0], dHeating: 0.4, ep: { heating: 1000 }, ours: { heating: 700 } }], { completed: false, severe: 2, messages: ['Fatal ** x'] });
  ok(pr2.length === 2 && pr2[0].source.name === 'bimcraft.energy.ep' && pr2[0].severity === 'error' && pr2[1].code === 'heat.differs', 'a failed run is an error; a 40 % gap is a note naming the room');

  console.log('== EG.13 the engine harness (a stand-in for the Emscripten module)');
  const calls = [];
  const fakeFactory = async (opts) => {
    const files = new Map();
    opts.print('hello');
    return { FS: { mkdir: (p) => calls.push('mkdir ' + p), writeFile: (p, b) => { files.set(p, b); }, readFile: (p) => { if (!files.has(p)) throw new Error('ENOENT'); return files.get(p); } },
      callMain: (a) => { calls.push(a.join(' ')); files.set('/work/out/eplusout.err', ' ************* EnergyPlus Completed Successfully--'); files.set('/work/out/eplusout.eio', eio); throw Object.assign(new Error('exit'), { status: 0 }); } };
  };
  const rw = await RUN.runWith(fakeFactory, { idf: 'IDF', idd: new Uint8Array([1]), epw: null });
  ok(calls.some((c) => c === '-d /work/out -i /work/Energy+.idd -D /work/in.idf'), 'no weather file: design days only (-D), output to /work/out', calls.join(' | '));
  ok(rw.files.err.includes('Completed') && rw.files.eio.includes('Zone Sizing') && rw.files.eso === '' && rw.log[0] === 'hello', 'the answer files are read back; a missing eso is empty; the engine\'s own prints are kept');
  calls.length = 0;
  await RUN.runWith(fakeFactory, { idf: 'IDF', idd: new Uint8Array([1]), epw: new Uint8Array([2]) });
  ok(calls.some((c) => c === '-d /work/out -i /work/Energy+.idd -w /work/in.epw /work/in.idf'), 'with a weather file: -w, no -D (a year)', calls.join(' | '));
  const sim = await RUN.simulate({ idf: 'IDF', mode: 'design', zoneOf, ours, run: async () => ({ files: { err: ' EnergyPlus Completed Successfully', eio, eso: '' }, log: [] }) });
  ok(sim.err.completed && sim.cmp.length === 1 && sim.problems.length === 0, 'simulate(): design mode returns the sizing comparison');
  const sim2 = await RUN.simulate({ idf: 'IDF', mode: 'year', epw: new Uint8Array([1]), zoneOf, ours, run: async () => ({ files: { err: ' EnergyPlus Completed Successfully', eio: '', eso }, log: [] }) });
  ok(sim2.year.get('ZONE R 1').heating === 2000, 'simulate(): year mode returns kWh per zone');
  let thrown = null;
  try { await RUN.simulate({ idf: 'IDF', mode: 'year', run: async () => ({ files: {} }) }); } catch (x) { thrown = x.key; }
  ok(thrown === 'ep.err.noweather', 'a year with no weather file is refused before anything runs');
  let t2 = null;
  try { await RUN.runInWorker({}, { engine: null }); } catch (x) { t2 = x.key; }
  ok(t2 === 'ep.err.noengine', 'no engine address: refused with a key the pane words');

  console.log('== EG.13 the gate and the engine address');
  ok(RUN.EP_GATE.licenceCleared === false, 'the owner\'s licence answers are not in: the gate is shut');
  ok(RUN.epGate({ pathname: '/use/bimcraft' }) === 'licence' && RUN.epGate({ pathname: '/lab/bimcraft' }) === null && RUN.epGate({ pathname: '/labx/y' }) === 'licence', 'offered only in /lab while the gate is shut');
  const V = RUN.validEngineUrl;
  ok(V('https://example.org/ep/') === 'https://example.org/ep' && V('/assets/ep') === '/assets/ep' && V('http://localhost:8080/e') === 'http://localhost:8080/e', 'https, the site\'s own path and localhost are accepted');
  ok(V('http://example.org/e') === null && V('//evil.example/x') === null && V('javascript:alert(1)') === null && V('https://a.b/"x') === null && V('') === null && V('https://a.b/ x') === null, 'plain http, protocol-relative, javascript: and quoted addresses are refused');


  console.log('== EG.13 the pane and the assistant tools');
  {
    const store = new Map();
    globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) };
    globalThis.location = { pathname: '/use/bimcraft' };
    class Node { constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.listeners = {}; this.className = ''; this.value = ''; }
      setAttribute(k, v) { this.attrs[k] = v; } getAttribute(k) { return this.attrs[k]; } addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
      append(...k) { for (const c of k) this.children.push(typeof c === 'string' ? { text: c } : c); } replaceChildren(...k) { this.children = []; this.append(...k); } click() {}
      get textContent() { return this.children.map((c) => (c.text !== undefined ? c.text : c.textContent)).join(''); } }
    const doc = { createElement: (tag) => new Node(tag, doc) };
    const find = (n, pred, out = []) => { if (n.attrs && pred(n)) out.push(n); for (const c of n.children || []) if (c.attrs) find(c, pred, out); return out; };
    const click = async (n) => { for (const fn of n.listeners.click || []) await fn({}); await new Promise((r) => setTimeout(r, 0)); };
    const UI = await imp('energy-ep-ui.js');
    const pane = new Node('div', doc);
    // the opt-in add-on (0.8 owner decision 2026-10-29): switched off, the pane says how to switch it on and the tools refuse, whatever the area
    globalThis.location = { pathname: '/lab/bimcraft' };
    UI.mountEnergyEp(pane, { ed: () => ed });
    ok(find(pane, (n) => n.attrs['data-ep-gate'] === 'addon').length === 1 && find(pane, (n) => n.attrs['data-ep-save'] !== undefined).length === 0, 'add-on off (even in /lab): only the "switch on the add-on" line');
    { const AG0 = await imp('energy-agents.js'); let e0 = null; try { await AG0.energyTools({ ed: () => ed }).find((x) => x.name === 'energyplus_export').run({}); } catch (x) { e0 = x; } ok(e0?.code === 'unsupported' && /add-on/i.test(e0.message), 'add-on off: the assistant tool is refused and names the add-on'); }
    { const m = JSON.parse(fs.readFileSync(path.join(APP, 'addons/energyplus/addon.json'), 'utf8')); ok(m.default === 'off' && m.apps.join() === 'bimcraft', 'the energyplus add-on is off by default'); ok(JSON.parse(fs.readFileSync(path.join(APP, 'addons/index.json'), 'utf8')).addons.includes('energyplus'), 'bundled list names it'); const A = await import(pathToFileURL(path.join(APP, 'addons/energyplus/main.js')).href); const off = A.activate(); ok(globalThis.bimcraftEpAddon === true, 'activate switches the step on'); off(); ok(globalThis.bimcraftEpAddon === false, 'its cleanup switches it off'); globalThis.bimcraftEpAddon = true; }
    globalThis.location = { pathname: '/use/bimcraft' };
    pane.replaceChildren();
    UI.mountEnergyEp(pane, { ed: () => ed });
    ok(find(pane, (n) => n.attrs['data-ep-gate'] !== undefined).length === 1 && find(pane, (n) => n.attrs['data-ep-save'] !== undefined).length === 0, 'in /use while the gate is shut: only the gate line, no button');
    const AG = await imp('energy-agents.js'), CT = await import(path.join(ROOT, 'tools/mcp/contract.mjs'));
    const tools = AG.energyTools({ ed: () => ed }), T = Object.fromEntries(tools.map((x) => [x.name, x]));
    const checks = tools.map((x) => [x.name, CT.checkTool(x, { app: 'bimcraft' })]);
    ok(checks.every(([, r]) => !r.errors.length && !r.warnings.length), 'the contract checker finds no error or warning in the ' + tools.length + ' tools', checks.map(([n, r]) => n + ': ' + [...r.errors, ...r.warnings].join('; ')).join(' | '));
    let e1 = null; try { await T.energyplus_export.run({}); } catch (x) { e1 = x; }
    ok(e1?.code === 'unsupported' && e1.next.length >= 1, 'the tools are refused in /use while the gate is shut, with something to try');
    globalThis.location = { pathname: '/lab/bimcraft' };
    const saved = [];
    pane.replaceChildren();
    const ui = UI.mountEnergyEp(pane, { ed: () => ed, save: async (name, text) => saved.push([name, text.length]), problems: { source: () => ({ set: () => {} }) } });
    ok(find(pane, (n) => n.attrs['data-ep-save'] !== undefined).length === 1, 'in /lab: the pane shows');
    ok(find(pane, (n) => n.attrs['data-ep-run'] === 'design')[0].attrs.disabled !== undefined, 'Simulate is off until an engine address is set');
    await click(find(pane, (n) => n.attrs['data-ep-save'] !== undefined)[0]);
    ok(saved.length === 1 && saved[0][0] === 'model.idf' && saved[0][1] > 1000, 'Save writes model.idf without any engine', JSON.stringify(saved) + pane.textContent.slice(0, 120));
    const idf = await T.energyplus_export.run({ mode: 'design' });
    ok(idf.zones === 1 && idf.windows === 1 && idf.idf.startsWith('! EnergyPlus input') && idf.engine === 'EnergyPlus version 26.2.0' && idf.truncated === false, 'energyplus_export returns counts and the text');
    let e2 = null; try { await T.energyplus_run.run({}); } catch (x) { e2 = x; }
    ok(e2?.code === 'unsupported' && /engine/i.test(e2.message), 'energyplus_run with no engine address: unavailable, says what to do');
    store.set('bimcraft.ep', JSON.stringify({ url: 'https://example.org/ep' }));
    RUN.hooks.run = async (job) => ({ files: { err: ' EnergyPlus Completed Successfully', eio: ' Zone Sizing Information, ' + [...d.zoneOf.keys()][0] + ', Heating, 760.0\n Zone Sizing Information, ' + [...d.zoneOf.keys()][0] + ', Cooling, 1200.0', eso: '' }, log: [job.design ? 'design' : 'year'] });
    const run = await T.energyplus_run.run({ mode: 'design' });
    ok(run.completed && run.design.length === 1 && Math.abs(run.design[0].epHeatingW - 760) < 0.1 && run.design[0].heatingDiff < 2, 'energyplus_run with a stand-in engine: design loads beside ours', JSON.stringify(run.design));
    let e3 = null; try { await T.energyplus_run.run({ mode: 'year' }); } catch (x) { e3 = x; }
    ok(e3?.code === 'invalid_argument', 'a year with no weather text: refused');
    ui.show();
    const dbtn = find(pane, (n) => n.attrs['data-ep-run'] === 'design')[0];
    ok(dbtn.attrs.disabled === undefined, 'with an engine address saved, Simulate is on');
    await click(dbtn);
    ok(find(pane, (n) => n.attrs['data-ep-table'] !== undefined).length === 1 && /EnergyPlus|ep\.counts|severe/i.test(pane.textContent), 'Simulate fills the comparison table', pane.textContent.slice(0, 200));
    RUN.hooks.run = async () => { throw Object.assign(new Error('boom'), { key: 'ep.err.fetch' }); };
    await click(find(pane, (n) => n.attrs['data-ep-run'] === 'design')[0]);
    ok(find(pane, (n) => n.attrs['data-ep-table'] !== undefined).length === 0 && ui.state.bad === true, 'a failed engine clears the table and says so');
    delete globalThis.location; delete globalThis.localStorage;
  }

  const ep = process.env.EP_NATIVE;
  if (ep && fs.existsSync(ep)) {
    console.log('== EG.13 native EnergyPlus (EP_NATIVE)');
    const dir = fs.mkdtempSync(path.join(ROOT, 'tmp', 'eg-ep-'));
    try {
      for (const [label, text] of [['E1', d.text], ['E1 layers', lm.text]]) {
        const sub = path.join(dir, label.replace(/\W+/g, '_')); fs.mkdirSync(sub); fs.writeFileSync(path.join(sub, 'in.idf'), text);
        try { execFileSync(ep, ['-D', '-d', sub, path.join(sub, 'in.idf')], { encoding: 'utf8', timeout: 120000 }); } catch { /* the err file says */ }
        const e2 = EP.parseErr(fs.existsSync(path.join(sub, 'eplusout.err')) ? fs.readFileSync(path.join(sub, 'eplusout.err'), 'utf8') : '');
        ok(e2.completed && e2.severe === 0, label + ': native EnergyPlus completes with 0 severe', e2.messages.join(' | '));
        const szN = EP.parseSizing(fs.existsSync(path.join(sub, 'eplusout.eio')) ? fs.readFileSync(path.join(sub, 'eplusout.eio'), 'utf8') : '');
        if (label === 'E1') { const c1 = EP.compareDesign(szN, d.ours, d.zoneOf); ok(c1.length === 1 && Math.abs(c1[0].dHeating) < 0.05, 'E1: native design heating within 5 % of energy-bim.js (the spike saw +0.9 %)', JSON.stringify(c1[0]?.dHeating)); }
        console.log('  ..   ' + label + ' design loads: ' + [...szN].map(([z, v]) => z + ' ' + v.heating + '/' + v.cooling).join('; '));
      }
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  } else console.log('  --   EP_NATIVE not set: EnergyPlus itself not run here (wasm build waits on the owner\'s licence answers)');

  console.log(`\nep: ${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
