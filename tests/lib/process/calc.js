/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc.js — the calculator registry: every Track CH engine behind one door a panel can open (0.8 CH.1–CH.16, rule 41/39). DOM-free.
 * Each calculator is { id, group, rows: ['CH.n'…], input (a sample the person edits; plain JSON), run(input) -> { lines, problems, svg?, text? } }.
 * `lines` are { k, v, u? } for a results table; `problems` are the shared Problem shape ({ code, severity, text }).
 * The engines are imported when a calculator runs, so a host that carries only part of lib/process (equip/, safety/, ../cfd) still lists
 * every calculator and says plainly which one it cannot run.
 *
 *   CALCS · list() · get(id) · run(id, input) -> Promise<result> · flatten(obj) · toCsv(lines)
 * Every number is only as good as its input: the engines' own review notes (typed constants "not confirmed") come back as Problems.
 */
import { makeCalcs4 } from './calc4.js';
const NOTE = 'A calculation aid, not an engineering approval: constants were typed without the standards open and are marked for review.';

export function flatten(obj, { max = 80, prefix = '' } = {}) {
  const out = [];
  const walk = (v, key, depth) => {
    if (out.length >= max || v === undefined || typeof v === 'function') return;
    if (v === null) { out.push({ k: key, v: '—' }); return; }
    if (typeof v === 'number') { out.push({ k: key, v: Number.isFinite(v) ? +v.toPrecision(6) : String(v) }); return; }
    if (typeof v === 'string' || typeof v === 'boolean') { out.push({ k: key, v: String(v).slice(0, 200) }); return; }
    if (Array.isArray(v)) {
      if (!v.length) return;
      if (v.every((x) => typeof x === 'number')) { out.push({ k: key, v: v.length + ' values, ' + (+v[0].toPrecision(5)) + ' … ' + (+v[v.length - 1].toPrecision(5)) }); return; }
      if (depth >= 3) return;
      v.slice(0, 12).forEach((x, i) => walk(x, key + '[' + (x && typeof x === 'object' && (x.id || x.name) ? (x.id || x.name) : i) + ']', depth + 1));
      return;
    }
    if (typeof v === 'object') { if (depth >= 3) return; for (const [k2, x] of Object.entries(v)) walk(x, key ? key + '.' + k2 : k2, depth + 1); }
  };
  walk(obj, prefix, 0);
  return out;
}
export const toCsv = (lines) => 'quantity,value\n' + lines.map((l) => '"' + String(l.k).replace(/"/g, '""') + '","' + String(l.v).replace(/"/g, '""') + '"').join('\n') + '\n';

const prob = (code, severity, text) => ({ code, severity, text, source: { kind: 'engine', name: 'process' } });
const fromEngine = (list) => (Array.isArray(list) ? list : []).map((p) => (typeof p === 'string' ? prob('process.note', 'info', p) : { source: { kind: 'engine', name: 'process' }, ...p, text: p.text || p.message || String(p.code || '') }));
const strip = (o, ...keys) => { const c = { ...o }; for (const k of keys) delete c[k]; return c; };
const ok = (obj, extra = {}) => ({ lines: flatten(obj), problems: fromEngine(obj && obj.problems), ...extra });

/** A small trend chart (numbers only, our own drawing): the first `max` series against time. */
export function trendSvg(t, series, { width = 480, height = 200, max = 4 } = {}) {
  const names = Object.keys(series).slice(0, max), W = width, H = height, m = 34, t1 = t[t.length - 1] || 1, cols = ['#d33', '#36c', '#2a8', '#c80'];
  const f = (n) => (Number.isFinite(n) ? +n.toFixed(2) : 0);
  let g = '';
  names.forEach((nm, k) => {
    const y = series[nm], lo = Math.min(...y), hi = Math.max(...y), span = hi - lo || 1;
    g += '<polyline fill="none" stroke="' + cols[k % cols.length] + '" stroke-width="1.5" points="' + t.map((tt, i) => f(m + (W - m - 6) * tt / t1) + ',' + f(H - 18 - (H - 28) * (y[i] - lo) / span)).join(' ') + '"/>';
    g += '<text x="' + (m + 4 + k * 100) + '" y="11" font-size="9" fill="' + cols[k % cols.length] + '">' + nm.replace(/[<>&"]/g, '') + ' ' + (+lo.toPrecision(3)) + '…' + (+hi.toPrecision(3)) + '</text>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect x="' + m + '" y="14" width="' + (W - m - 6) + '" height="' + (H - 32) + '" fill="none" stroke="currentColor" stroke-opacity=".3"/>' + g + '<text x="' + m + '" y="' + (H - 4) + '" font-size="9" fill="currentColor">0</text><text x="' + (W - 40) + '" y="' + (H - 4) + '" font-size="9" fill="currentColor">' + (+t1.toPrecision(4)) + ' s</text></svg>';
}

const FLUID_W = { kind: 'liquid', rho: 998, mu: 1e-3 };

export const CALCS = [
  { id: 'flash', group: 'thermo', rows: ['CH.1'], title: 'Flash and saturation',
    input: { components: ['methane', 'propane', 'nhexane'], model: 'pr', T: 320, P: 5e5, z: [0.3, 0.3, 0.4] },
    async run(i) {
      const { Thermo } = await import('./thermo.js'); const th = new Thermo({ components: i.components, model: i.model || 'pr', kij: i.kij, params: i.params, henry: i.henry });
      const z = i.z, f = th.flashPT(i.T, i.P, z), out = { vaporFraction: f.vf ?? f.beta ?? f.V };
      Object.assign(out, strip(f, 'problems'));
      try { out.bubbleT = th.bubbleT(z, i.P)?.T; out.dewT = th.dewT(z, i.P)?.T; } catch { /* two-phase only */ }
      return ok(out);
    } },
  { id: 'vlle', group: 'thermo', rows: ['CH.1'], title: 'Three-phase flash (vapour and two liquids, activity model)',
    input: { components: ['water', 'nbutane', 'npentane'], model: 'nrtl', params: { a: [[0, 3.5, 3.5], [3.5, 0, 0.1], [3.5, 0.1, 0]], b: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], alpha: 0.3 }, T: 300, P: 1.5e5, z: [0.4, 0.3, 0.3] },
    async run(i) {
      const { Thermo } = await import('./thermo.js'), { flashVLLE, vlleResiduals } = await import('./vlle.js');
      const th = new Thermo({ components: i.components, model: i.model || 'nrtl', params: i.params }), r = flashVLLE(th, i.T, i.P, i.z), res = vlleResiduals(th, r);
      const lines = [{ k: 'state', v: r.state }, { k: 'converged', v: String(r.converged) }];
      for (const p of r.phases) lines.push({ k: p.type, v: 'fraction ' + p.frac.toPrecision(5) + ', x = ' + p.x.map((v, j) => th.ids[j] + ' ' + v.toPrecision(4)).join(', ') });
      lines.push({ k: 'iso-fugacity residual (ln)', v: res.iso.toExponential(2) }, { k: 'balance residual', v: res.bal.toExponential(2) });
      return { lines, problems: r.notes.map((n) => prob('thermo.vlle', 'warning', n)).concat([prob('thermo.params', 'info', 'The interaction parameters are the ones you typed; none are shipped as the parameters of a pair.')]) };
    } },
  { id: 'purefluid', group: 'thermo', rows: ['CH.1'], title: 'Pure fluid from CoolProp (loads the first time)',
    input: { fluid: 'water', T: 373.15, P: 101325, addComponentAs: '' },
    async run(i) {
      const CP = await import('./coolprop.js'); let cp;
      try { cp = await CP.loadCoolProp(i.url ? { url: i.url } : undefined); } catch (e) { return { lines: [], problems: [prob('coolprop.load', 'error', e.message)] }; }
      try {
        const out = CP.props(cp, i.fluid, i.T, i.P), lines = flatten({ ...out });
        let sat = null; try { sat = CP.saturation(cp, i.fluid, i.T); } catch { /* single phase only */ }
        if (sat) lines.push(...flatten({ saturation: sat }, { prefix: '' }));
        const problems = [prob('coolprop.source', 'info', 'Properties are CoolProp\'s own correlations (MIT licence), moved onto the CH.1 reference state: elements at 298.15 K for H, ideal gas at 1 bar for S.')];
        if (i.addComponentAs) { const { defineComponent } = await import('./data.js'), c = CP.componentFromFluid(cp, i.fluid, { newId: String(i.addComponentAs) }); defineComponent(c); lines.push({ k: 'component added', v: c.id + ' (Tc ' + c.Tc.toFixed(2) + ' K, Pc ' + c.Pc.toFixed(2) + ' bar, omega ' + c.omega.toFixed(4) + ')' }); for (const n of c.notes) problems.push(prob('coolprop.note', 'info', n)); }
        return { lines, problems };
      } catch (e) { return { lines: [], problems: [prob('coolprop.fluid', 'error', e.message)] }; }
    } },
  { id: 'flowsheet', group: 'flowsheet', rows: ['CH.2', 'CH.1'], title: 'Steady-state flowsheet',
    input: { thermo: { components: ['methane', 'propane', 'nhexane'], model: 'pr' }, feeds: { f: { flows: { methane: 3, propane: 3, nhexane: 4 }, T: 300, P: 5e5 } },
      units: [{ id: 'F', type: 'flash', in: ['f'], out: ['v', 'l'], p: { T: 310, P: 5e5 } }, { id: 'C', type: 'compressor', in: ['v'], out: ['vc'], p: { Pout: 15e5, eff: 0.75 } }] },
    async run(i) {
      const { solve } = await import('./flowsheet.js'), { balanceReport } = await import('./report.js'); const r = solve(i);
      const lines = []; for (const [id, s] of Object.entries(r.streams || {})) lines.push({ k: id, v: `T ${s.T?.toFixed(1)} K, P ${(s.P / 1e5).toFixed(2)} bar, F ${s.F?.toPrecision(5)} mol/s, vapour ${s.vf?.toFixed(3)}` });
      lines.push({ k: 'converged', v: String(r.converged) });
      let rep = null; try { rep = balanceReport(i, r); } catch { /* optional */ }
      return { lines: lines.concat(rep ? flatten(rep.summary || rep.totals || {}, { max: 12, prefix: 'balance' }) : []), problems: fromEngine(r.problems).concat(fromEngine(rep && rep.problems)) };
    } },
  { id: 'column', group: 'flowsheet', rows: ['CH.3'], title: 'Distillation and reactors',
    input: { thermo: { components: ['benzene', 'toluene'], model: 'ideal' }, feeds: { f: { flows: { benzene: 50, toluene: 50 }, T: 365, P: 101325 } },
      units: [{ id: 'C1', type: 'shortcut', in: ['f'], out: ['d', 'b'], p: { lightKey: 'benzene', heavyKey: 'toluene', recLK: 0.99, recHK: 0.99, P: 101325 } }] },
    async run(i) {
      const { solve } = await import('./flowsheet.js'); const r = solve(i), u = (r.units || {}), lines = [];
      for (const [id, s] of Object.entries(r.streams || {})) lines.push({ k: id, v: `F ${s.F?.toPrecision(5)} mol/s, T ${s.T?.toFixed(1)} K` });
      lines.push(...flatten(u, { max: 30, prefix: 'units' }));
      return { lines, problems: fromEngine(r.problems) };
    } },
  { id: 'reactor', group: 'flowsheet', rows: ['CH.3'], title: 'Conversion reactor',
    input: { thermo: { components: ['co', 'hydrogen', 'methanol'], model: 'pr' }, feeds: { f: { flows: { co: 1, hydrogen: 2 }, T: 500, P: 50e5 } },
      units: [{ id: 'R', type: 'conversion', in: ['f'], out: ['o'], p: { reactions: [{ stoich: { co: -1, hydrogen: -2, methanol: 1 }, key: 'co', X: 0.3 }] } }] },
    async run(i) {
      const { solve } = await import('./flowsheet.js'); const r = solve(i), lines = [];
      for (const [id, s] of Object.entries(r.streams || {})) lines.push({ k: id, v: `F ${s.F?.toPrecision(5)} mol/s, T ${s.T?.toFixed(1)} K` });
      return { lines, problems: fromEngine(r.problems) };
    } },
  { id: 'dynamics', group: 'time', rows: ['CH.5'], title: 'Dynamic simulation',
    input: { spec: { tanks: [{ id: 'T1', A: 2, h0: 4, rho: 1000 }], valves: [{ id: 'V1', from: 'T1', to: null, k: 0.002, open: 1 }] }, tEnd: 600 },
    async run(i) {
      const { simulate } = await import('./dynamics.js'); const r = simulate(i.spec, { tEnd: i.tEnd }), lines = [{ k: 'time points', v: String(r.t.length) }];
      for (const [name, s] of Object.entries(r.series || {})) lines.push({ k: name, v: `${+s[0].toPrecision(5)} → ${+s[s.length - 1].toPrecision(5)}` });
      lines.push({ k: 'steps', v: String(r.steps) });
      return { lines, problems: fromEngine(r.problems), series: r.series, t: r.t, svg: trendSvg(r.t, r.series) };
    } },
  { id: 'batch', group: 'time', rows: ['CH.6'], title: 'Batch recipe schedule',
    input: { recipe: { name: 'r', equipment: [{ id: 'R-1', cls: 'reactor', cap: 1000, clean: 1 }, { id: 'R-2', cls: 'reactor', cap: 1000, clean: 1 }, { id: 'F-1', cls: 'filter' }],
      steps: [{ id: 'chg', name: 'Charge', cls: 'reactor', dur: 1, size: 800 }, { id: 'rxn', name: 'React', sameAs: 'chg', dur: 5, after: ['chg'] }, { id: 'flt', name: 'Filter', cls: 'filter', dur: 2, after: ['rxn'] }] }, batches: 3, interval: 0 },
    async run(i) {
      const B = await import('./batch.js'); const s = B.schedule(i.recipe, { batches: i.batches, interval: i.interval });
      return { lines: flatten({ makespan: s.makespan, firstBatchHours: s.firstBatchHours, tasks: s.tasks.length }).concat(s.tasks.slice(0, 20).map((t) => ({ k: 'task ' + (t.id || t.name), v: `${t.start ?? t.s} → ${t.end ?? t.e}` }))), problems: fromEngine(s.problems), svg: B.occupancySvg(s) };
    } },
  { id: 'ferment', group: 'time', rows: ['CH.6'], title: 'Fermentation (Monod, fed-batch)',
    input: { par: { mumax: 0.4, Ks: 0.5, Yxs: 0.5, X0: 0.1, S0: 20, V0: 10 }, tEnd: 40 },
    async run(i) { const B = await import('./batch.js'), r = B.fermentation(i.par, { tEnd: i.tEnd }); return ok({ end: { X: r.X.at(-1), S: r.S.at(-1), P: r.P.at(-1), V: r.V.at(-1) }, mass: r.mass, problems: r.problems }); } },
  { id: 'tune', group: 'time', rows: ['CH.5'], title: 'Controller tuning from a step test',
    input: { K: 2, tau: 120, theta: 15, type: 'PI', lambda: 60 },
    async run(i) { const D = await import('./dynamics.js'); const out = {}; for (const m of ['zn', 'cohen-coon', 'imc', 'simc']) { try { out[m] = D.tune(m, { K: i.K, tau: i.tau, theta: i.theta }, { type: i.type, lambda: i.lambda }); } catch (e) { out[m] = 'not available: ' + e.message; } } return { lines: flatten(out), problems: [prob('tune.review', 'info', 'Tuning rules are starting points; test them in a simulation before using them on a plant.')] }; } },
  { id: 'batchbal', group: 'time', rows: ['CH.6'], title: 'Batch mass balance (charge, react, transfer, discharge)',
    input: { components: ['co', 'hydrogen', 'methanol'], ops: [{ op: 'charge', vessel: 'R-1', comp: 'co', mol: 100 }, { op: 'charge', vessel: 'R-1', comp: 'hydrogen', mol: 200 }, { op: 'react', vessel: 'R-1', nu: { co: -1, hydrogen: -2, methanol: 1 }, key: 'co', conversion: 0.5 }, { op: 'transfer', from: 'R-1', to: 'R-2', fraction: 0.4 }, { op: 'discharge', vessel: 'R-2' }] },
    async run(i) { const B = await import('./batch.js'); const r = B.inventory(i.components, i.ops); return { lines: flatten({ inventory: r.inventory, discharged: r.discharged, atomError: r.atomError }), problems: r.atomError > 1e-9 ? [prob('batch.atoms', 'error', 'Atoms charged and atoms held do not match.')] : [] }; } },
  { id: 'engine', group: 'flowsheet', rows: ['CH.7'], title: 'Solve with an engine (ours or a permissive add-on)',
    input: { engine: 'ours', def: { thermo: { components: ['methane', 'propane'], model: 'pr' }, feeds: { f: { flows: { methane: 1, propane: 1 }, T: 280, P: 10e5 } }, units: [{ id: 'F', type: 'flash', in: ['f'], out: ['v', 'l'], p: { T: 280, P: 10e5 } }] } },
    async run(i) {
      const E = await import('./engines.js'); const lic = E.checkLicense('GPL-3.0'), lic2 = E.checkLicense('BSD-3-Clause');
      const r = await E.solveWith(i.def, i.engine || 'ours'); const lines = flatten(r.result || r, { max: 40 });
      lines.push({ k: 'licence gate: GPL-3.0', v: lic.ok ? 'allowed' : 'refused' }, { k: 'licence gate: BSD-3-Clause', v: lic2.ok ? 'allowed' : 'refused' });
      return { lines, problems: fromEngine(r.problems) };
    } },
  { id: 'exchanger', group: 'equipment', rows: ['CH.8'], title: 'Shell-and-tube exchanger rating',
    input: { hot: { fluid: { rho: 850, cp: 2100, k: 0.13, mu: 5e-3 }, mdot: 6, Tin: 120, Tout: 70 }, cold: { fluid: { rho: 995, cp: 4180, k: 0.62, mu: 8e-4 }, mdot: 4, Tin: 25 }, tube: { do: 0.019, di: 0.0157, L: 3, passes: 2, kw: 45 }, shell: { Ds: 0.45, baffleSpacing: 0.15, pitch: 0.0254, layout: 'triangular' }, foulingShell: 2e-4, foulingTube: 1e-4 },
    async run(i) { const X = await import('./equip/exchanger.js'); const r = X.rateShellTube(i); const lay = X.tubeLayout({ Ds: i.shell.Ds, do: i.tube.do, pitch: i.shell.pitch, layout: i.shell.layout, passes: i.tube.passes }); return { lines: flatten(strip(r, 'problems')).concat([{ k: 'tubes in the layout', v: String(lay.n) }]), problems: fromEngine(r.problems), svg: X.tubeSheetSVG(lay, { Ds: i.shell.Ds, do: i.tube.do }) }; } },
  { id: 'vessel', group: 'equipment', rows: ['CH.9'], title: 'Pressure vessel (ASME VIII-1 screening)',
    input: { P: 1.0, D: 1000, S: 138, E: 1, ca: 3, headType: 'ellipsoidal', orientation: 'vertical', L: 2400, support: 600, nozzles: [{ name: 'N1', at: 1800, side: 'right' }], flat: { d: 300, C: 0.33 }, mdmt: { baseMDMT: null, tn: 12, reduction: null },
      nozzle: { vessel: { t: 12, tr: 6, S: 138 }, nozzle: { d: 100, tn: 8, trn: 2, Sn: 138, pad: { Dp: 300, te: 10 } } } },
    async run(i) {
      const V = await import('./equip/vessel.js'); const sh = V.shell({ P: i.P, R: i.D / 2, S: i.S, E: i.E, ca: i.ca }), hd = V.head({ type: i.headType, P: i.P, D: i.D, S: i.S, E: i.E, ca: i.ca }), nz = V.nozzleReinforcement(i.nozzle), ds = V.dataSheet({ P: i.P, D: i.D, S: i.S, E: i.E, ca: i.ca });
      const extra = {}; const problems = [prob('vessel.review', 'info', NOTE)];
      if (i.flat) extra.flatHead = V.flatHead({ P: i.P, d: i.flat.d, S: i.S, E: i.E, C: i.flat.C, ca: i.ca });
      if (i.mdmt) { try { extra.mdmt = V.mdmt({ ...i.mdmt, tr: sh.t, E: i.E, ca: i.ca }); for (const n of extra.mdmt.notes || []) problems.push(prob('vessel.mdmt', 'info', n)); } catch (e) { problems.push(prob('vessel.mdmt', 'warning', e.message)); } }
      for (const n of [].concat(sh.notes || [], hd.notes || [], nz.notes || [], extra.flatHead ? extra.flatHead.notes : [])) problems.push(prob('vessel.note', 'info', n));
      if (!nz.ok) problems.push(prob('vessel.nozzle', 'error', 'The opening is not reinforced enough: available ' + nz.available.toFixed(0) + ' mm² of ' + nz.A.toFixed(0) + ' mm² needed (UG-37).'));
      const sp = { orientation: i.orientation, D: i.D, L: i.L, support: i.support, nozzles: i.nozzles, shellT: Math.max(sh.tMin, hd.tMin) };
      return { lines: flatten({ shell: sh, head: hd, nozzle: nz, ...extra, plant: V.plantParams({ orientation: i.orientation, D: i.D, L: i.L, support: i.support }) }), problems, text: ds.text, svg: V.vesselSvg(sp) };
    } },
  { id: 'network', group: 'equipment', rows: ['CH.10'], title: 'Pipe network, pump and gas flow',
    input: { fluid: FLUID_W, nodes: [{ id: 'T', z: 0, P: 101325 }, { id: 'X', z: 0 }, { id: 'D', z: 10, P: 101325 }], links: [{ id: 'pu', a: 'T', b: 'X', kind: 'pump', D: 0.1, curve: [[0, 40], [0.02, 36], [0.04, 24]] }, { id: 'pi', a: 'X', b: 'D', D: 0.1, L: 200, K: 5, fit: [{ method: '3K', id: 'valve-gate-valve-standard-beta-1', count: 1 }, { method: '3K', id: 'elbow-90deg-threaded-standard-r-d-1', count: 4 }] }], fittingPack: 'draft',
      _help: 'A link may carry fit: a list of fittings from the fitting pack ("draft" = the bundled DRAFT 2-K/3-K table). Their K is worked out at each step of the solution from that link\'s own Reynolds number and diameter and added to the typed K. The result lists K, the fittings\' share and Re for each link.' },
    async run(i) {
      const N = await import('./equip/network.js'), problems = [];
      let net = i; if (i.fittingPack === 'draft') { const F = await import('./equip/fittingk.js'); net = { ...i, fittingPack: (await F.bundled()).pack }; problems.push(prob('fittingk.draft', 'warning', F.DRAFT_NOTE)); }
      const r = N.solveNetwork(net); const res = ok(r); if (problems.length) res.problems = [...problems, ...(res.problems || [])]; return res;
    } },
  { id: 'hammer', group: 'equipment', rows: ['CH.10'], title: 'Water hammer (method of characteristics)',
    input: { L: 1000, D: 0.3, a: 1000, f: 0, Hres: 300, V0: 2, tau: [[0, 1], [1, 0]], tEnd: 9, N: 50 },
    async run(i) { const N = await import('./equip/network.js'); const r = N.hammer(i); return ok({ ...strip(r, 'history', 'series', 'profile'), joukowsky: N.joukowsky(i.a, i.V0, 998) }); } },
  { id: 'pipestress', group: 'equipment', rows: ['CH.11'], title: 'Pipe stress (B31.3 screening)',
    input: { points: [[0, 0, 0], [3000, 0, 0], [3000, 3000, 0], [3000, 3000, 3000]], size: '4', material: { E: 200000, alpha: 1.2e-5, Sh: 138, Sc: 138 }, Thot: 200, P: 2, supports: [{ s: 0, type: 'anchor' }, { s: 9000, type: 'anchor' }] },
    async run(i) { const PS = await import('./equip/pipestress.js'); const r = PS.analyse(i); return ok(strip(r, 'model', 'displacements', 'forces'), { problems: fromEngine(r.problems).concat([prob('pipestress.review', 'info', NOTE)]) }); } },
  { id: 'relief', group: 'equipment', rows: ['CH.12'], title: 'Relief valve sizing (API 520 style)',
    input: { gas: { W: 1, k: 1.4, M: 0.02897, T: 300, Z: 1, P1: 1e6, Kd: 0.975 }, liquid: { Q: 0.01, rho: 998, dP: 1e6 }, fire: { A: 40, drainage: 'adequate' },
      steam: { W: 2, P1: 1.2e6, Ksh: 1 }, disc: 'none', outlet: { D: 0.15, L: 40, K: 3, Pdown: 130000, Pset: 1e6 }, thrust: { Ae: 0.0081 } },
    async run(i) {
      const R = await import('./equip/relief.js'); const problems = [prob('relief.review', 'info', NOTE)], extra = {};
      const Kc = R.discKc(i.disc || 'none'); for (const n of Kc.notes) problems.push(prob('relief.disc', 'info', n));
      const g = R.gasArea({ ...i.gas, Kc: Kc.Kc }), l = R.liquidArea(i.liquid), f = R.fireHeat(i.fire);
      if (i.steam) { extra.steam = R.steamArea({ ...i.steam, Kc: Kc.Kc }); extra.steamOrifice = R.orificeLetter(extra.steam.A); for (const n of extra.steam.notes) problems.push(prob('relief.steam', 'info', n)); }
      if (i.outlet) { extra.outlet = R.outletLine({ W: i.gas.W, k: i.gas.k, M: i.gas.M, T: i.gas.T, Z: i.gas.Z, ...i.outlet }); if (!extra.outlet.ok) problems.push(prob('relief.outlet', 'warning', 'The outlet line back pressure is ' + (extra.outlet.fractionOfSet != null ? (100 * extra.outlet.fractionOfSet).toFixed(1) + ' % of the set pressure' : 'above what the pipe allows') + (extra.outlet.mach >= 1 ? ' and the exit is sonic' : '') + '.')); for (const n of extra.outlet.notes) problems.push(prob('relief.outlet', 'info', n)); }
      if (i.thrust) { extra.thrust = R.reactionForce({ ...i.gas, Ae: i.thrust.Ae }); for (const n of extra.thrust.notes) problems.push(prob('relief.thrust', 'info', n)); }
      return { lines: flatten({ gas: g, gasOrifice: R.orificeLetter(g.A), liquid: l, liquidOrifice: R.orificeLetter(l.A), fire: f, ...extra }), problems };
    } },
  { id: 'mixing', group: 'equipment', rows: ['CH.13'], title: 'Mixing time and residence time (finite volume or lattice Boltzmann)',
    input: { method: 'fv', n: 12, nu: 0.01, lid: 1, target: 0.3, lbm: { n: 40, impeller: 5e-4, level: 0.05, flowThrough: false } },
    async run(i) {
      if (i.method === 'lbm') {                                           // 0.8 CH.13 (owner 2026-10-29): mixing handed to the lattice Boltzmann method, the method of PartCraft's lbm2d
        const L = await import('../cfd/lbm.js'), o = i.lbm || {}, n = Math.min(Math.max(o.n | 0 || 40, 16), 128), problems = [prob('lbm.scope', 'info', '2-D, laminar, an impeller stand-in (a momentum source), no turbulence model: k-epsilon is not built. A laminar mixing time is not a turbulent one.'), prob('lbm.review', 'info', NOTE)];
        if (o.flowThrough) {
          const S = L.createMixer({ nx: 2 * n, ny: n / 2 + 2, tau: 0.8, tauD: 0.8, solid: (x, y) => y === 0 || y === n / 2 + 1, flow: { u: 0.04, C: 0 } }); L.step(S, 3000);
          const r = L.rtd(S, { steps: o.steps || 9000, every: 5 });
          return { lines: flatten({ cells: S.N, meanResidenceTime: r.mean, nominalVQ: r.nominal, variance: r.variance, tracerRecovered: r.area }), problems, text: L.vtk(S, 'rtd channel').slice(0, 4000) };
        }
        const S = L.createMixer({ nx: n, ny: n, tau: 0.8, tauD: 0.55, solid: (x, y) => x === 0 || x === n - 1 || y === 0 || y === n - 1, sources: o.impeller ? [{ x: n / 2, y: n / 2, r: Math.max(2, n / 16), fx: o.impeller, fy: 0 }] : [] });
        L.setTracer(S, (x) => (x < n / 2 ? 1 : 0)); const m = L.mixingTime(S, { level: o.level || 0.05, maxSteps: 80000, every: 100 });
        if (!m.reached) problems.push(prob('cfd.mixing', 'warning', 'The tracer did not mix to the level within the step limit.'));
        return { lines: flatten({ cells: S.N, mixingTimeSteps: m.steps, level: o.level || 0.05, impellerForce: o.impeller || 0, tracerMass: [...S.C].reduce((a, c, k) => a + (S.solid[k] ? 0 : c), 0) }), problems, text: L.vtk(S, 'stirred tank').slice(0, 4000) };
      }
      const { Flow, mixingTime } = await import('../cfd/fv.js'); const f = new Flow({ nx: i.n, ny: i.n, nu: i.nu, bc: { left: { type: 'wall' }, right: { type: 'wall' }, bottom: { type: 'wall' }, top: { type: 'wall', u: i.lid } } });
      f.run({ steady: 1e-4, maxSteps: 600 }); const sc = f.addScalar('c', { D: 0.005, c0: 0 }); for (let j = 0; j < i.n; j++) for (let k = 0; k < i.n / 2; k++) sc.C[k + i.n * j] = 1;
      const m = mixingTime(f, 'c', { target: i.target, tMax: 300 });
      return { lines: [{ k: 'cells', v: String(i.n * i.n) }, { k: 'mixing time (s)', v: m.time == null ? 'not reached' : +m.time.toPrecision(4) }, { k: 'history points', v: String(m.history.length) }], problems: m.time == null ? [prob('cfd.mixing', 'warning', 'The tracer did not mix to the target within the time limit.')] : [], vtkBytes: f.vtk().length };
    } },
  { id: 'hazop', group: 'safety', rows: ['CH.14'], title: 'HAZOP worksheet',
    input: { nodes: [{ name: 'Feed tank', equipment: ['T-101'], lines: ['2"-PL-100'] }], rows: [{ node: 'N1', guideword: 'more', parameter: 'flow', causes: ['Control valve fails open'], consequences: ['Tank overfills'], safeguards: ['High level alarm'], S: 4, L: 3 }, { node: 'N1', guideword: 'less', parameter: 'flow', causes: ['Pump trips'], consequences: ['No transfer'], S: 2, L: 3 }] },
    async run(i) {
      const H = await import('./safety/hazop.js'); const h = H.newHazop(); for (const n of i.nodes) H.addNode(h, n); for (const r of i.rows) H.addRow(h, r, { who: 'panel' });
      const rep = H.report(h, { title: 'HAZOP' }), cov = H.coverage(h, h.nodes[0].id), chk = H.check(h, {});
      return { lines: flatten({ rows: h.rows.map((r) => ({ id: r.id, text: `${r.guideword} ${r.parameter}: ${r.risk || '—'}` })), coverage: cov }), problems: fromEngine(chk), text: H.toCsv(rep) };
    } },
  { id: 'lopa', group: 'safety', rows: ['CH.15'], title: 'LOPA and SIF verification',
    input: { scenario: { id: 'L1', target: 1e-5, initiating: [{ id: 'IE1', f: 0.1 }], modifiers: [{ p: 0.5 }], ipls: [{ id: 'a', pfd: 0.1 }, { id: 'b', pfd: 0.01 }] }, hazop: { nodes: [{ name: 'Feed tank', equipment: ['T-101'], lines: [] }], rows: [{ node: 'N1', guideword: 'more', parameter: 'level', causes: ['Inlet valve fails open'], consequences: ['Tank overfills'], safeguards: ['High level alarm'], S: 4, L: 3 }] }, sif: { id: 'SIF1', subsystems: [{ name: 'sensor', arch: '1oo2', lambdaDU: 5e-7, TI: 8760, beta: 0.05 }, { name: 'logic', arch: '1oo1', lambdaDU: 1e-8, TI: 8760 }, { name: 'valve', arch: '1oo1', lambdaDU: 1e-6, TI: 8760 }] } },
    async run(i) {
      const L = await import('./safety/lopa.js'); const l = L.cleanLopa({ scenarios: [i.scenario], sifs: [i.sif] }), sc = L.scenarioResult(l.scenarios[0]), v = L.verifySif(l.sifs[0]);
      let fromRow = null;
      if (i.hazop) { const H = await import('./safety/hazop.js'), h = H.newHazop(); for (const n of i.hazop.nodes) H.addNode(h, n); const rows = i.hazop.rows.map((r) => H.addRow(h, r, { who: 'panel' })); const s0 = L.scenarioFromRow(h, rows[0].id); fromRow = L.scenarioResult(L.cleanLopa({ scenarios: [{ ...s0, target: i.scenario.target, initiating: s0.initiating.map((x) => ({ ...x, f: x.f ?? 0.1 })) }] }).scenarios[0]); }
      return { lines: flatten({ scenario: sc, sif: { pfdAvg: v.pfdAvg, sil: v.sil, subsystems: v.subsystems }, fromHazopRow: fromRow }), problems: fromEngine(L.check(l)).concat([prob('lopa.review', 'info', L.REVIEW.note)]) };
    } },
  { id: 'consequence', group: 'safety', rows: ['CH.16'], title: 'Consequence screening',
    input: { id: 'C1', kind: 'jetfire', at: { x: 10, y: 20, z: 2 }, params: { mdot: 5, dHc: 50e6, chi: 0.2, levels: [4700, 12500] } },
    async run(i) {
      const C = await import('./safety/consequence.js'), Z = await import('./safety/zones.js'); const r = C.runCase(i), gj = Z.siteGeoJson(r.zones, { name: 'consequence ' + (i.id || '') });
      return { lines: flatten({ results: r.results, zones: r.zones.map((z) => ({ id: z.id, type: z.type, r: z.r })) }).concat([{ k: 'site plan (CivilCraft GeoJSON features)', v: String(gj.features.length) }, { k: '3D volumes (BimCraft)', v: String(C.to3D(r.zones).length) }]),
        problems: fromEngine(r.problems), zones: r.zones, geojson: JSON.stringify(gj), dxf: Z.siteDxf(r.zones) };
    } },
  { id: 'area', group: 'safety', rows: ['CH.17'], title: 'Hazardous area classification (zones from release sources)',
    input: { sources: [{ id: 'RS1', tag: 'P-101', kind: 'seal', grade: 'secondary', substance: { name: 'methane', lfl: 0.044, M: 0.016043 }, rate: 0.001, at: { x: 5, y: 5, z: 1 }, ventilation: { degree: 'medium', availability: 'good', C: 0.02, indoor: true } }], section: { axis: 'x', at: 5 } },
    async run(i) {
      const A = await import('./safety/area.js'); let srcs = i.sources, pre = [];
      if (Array.isArray(i.pidItems) && i.pidItems.length) {               // release sources read from the P&ID (CH.17): grade by what each item is, substance by its service
        const Z = await import('./safety/zones.js'), g = Z.sourcesFromPid(i.pidItems, { substances: i.substances, ventilation: i.ventilation, hole: i.hole, toMetres: i.toMetres, z: i.z });
        srcs = g.sources.concat(Array.isArray(i.sources) ? i.sources : []); pre = fromEngine(g.problems).concat(g.assumptions.map((a) => prob('area.assumption', 'info', 'Assumed: ' + a)));
      }
      const cl = A.classify(A.cleanSources(srcs));
      const lines = cl.zones.map((z) => ({ k: z.id + (z.tag ? ' ' + z.tag : ''), v: `${z.zone}, radius ${z.extent ? +z.extent.toPrecision(4) : 0} m (${z.extentFrom})` }));
      lines.push({ k: 'plan shapes (CadCraft layers AREA-ZONE*)', v: String(A.planShapes(cl.zones).length) }, { k: 'section shapes', v: String(A.sectionShapes(cl.zones, i.section || {}).length) }, { k: '3D volumes (BimCraft)', v: String(A.volumes(cl.zones).length) });
      return { lines, problems: pre.concat(fromEngine(cl.problems), cl.notes.map((n) => prob('area.note', 'info', n))), zones: cl.zones };
    } },
  { id: 'inventory', group: 'safety', rows: ['CH.18'], title: 'Chemical inventory, SDS gaps, compatibility and thresholds',
    input: { items: [{ chem: { name: 'Hydrochloric acid 32 %', cas: '7647-01-0', groups: ['acid'] }, qty: 600, location: { id: 'R-1', kind: 'room' }, process: 'U1', sds: { rev: '2025', sections: { 1: 'x', 2: 'x' } } }, { chem: { name: 'Sodium hypochlorite', cas: '7681-52-9', groups: ['hypochlorite', 'oxidiser'] }, qty: 400, location: { id: 'R-1', kind: 'room' }, process: 'U1' }, { chem: { name: 'Ethanol', cas: '64-17-5', groups: ['flammable'] }, qty: 4500, location: { id: 'T-5', kind: 'tank', tag: 'T-5' }, process: 'U2' }, { chem: { name: 'Acetone', cas: '67-64-1', groups: ['flammable'] }, qty: 1500, location: { id: 'T-6', kind: 'tank', tag: 'T-6' }, process: 'U2' }], thresholdPack: 'example' },
    async run(i) {
      const I = await import('./safety/inventory.js'); const inv = I.newInventory(); for (const it of i.items) I.addItem(inv, it);
      const pack = I.cleanThresholdPack(i.thresholdPack && i.thresholdPack !== 'example' ? i.thresholdPack : I.EXAMPLE_THRESHOLDS), ctx = pack ? { thresholdPacks: [pack] } : {};
      const lines = I.locationTable(inv).map((r) => ({ k: 'location ' + (r.id || r.location || '?'), v: JSON.stringify(r).slice(0, 160) }));
      for (const c of I.compatibility(inv)) lines.push({ k: 'incompatible in ' + c.location, v: `${c.a} + ${c.b}: ${c.pair.effect}` });
      if (pack) for (const t of I.thresholds(inv, pack)) lines.push({ k: 'threshold ' + t.rule + ' (' + t.key + ')', v: `${t.qty} of ${t.threshold} kg, ${(t.ratio * 100).toFixed(0)} %${t.over ? ' OVER' : t.near ? ' near' : ''}` });
      return { lines, problems: fromEngine(I.check(inv, ctx)).concat([prob('inventory.review', 'info', I.REVIEW.note)]), text: I.toCsv(inv) };
    } },
  { id: 'air', group: 'environment', rows: ['CH.19'], title: 'Stack air dispersion (screening)',
    input: { source: { id: 'S1', x: 0, y: 0, hs: 60, d: 2, vs: 15, Ts: 400, Q: { SO2: 100 } }, species: 'SO2', terrain: 'rural', Ta: 293.15 },
    async run(i) {
      const D = await import('./env/dispersion.js'); const sc = D.screen(i.source, { species: i.species, terrain: i.terrain, Ta: i.Ta });
      const lines = flatten({ worstCase: sc.max }, { max: 20 }); if (sc.averaging) lines.push(...flatten(sc.averaging, { max: 12, prefix: 'averaging' }));
      return { lines, problems: fromEngine(sc.problems).concat([prob('air.review', 'info', D.REVIEW.note), prob('air.notpermit', 'info', 'A screening aid. It is not a permit model and not an engineering approval. AERMOD is not built in this release.')]) };
    } },
  { id: 'water', group: 'environment', rows: ['CH.20'], title: 'Activated sludge plant, screens, clarifier and disinfection',
    input: { plant: { tanks: [{ id: 'A1', V: 1000 }, { id: 'A2', V: 1000 }, { id: 'O1', V: 1333, aerated: true, KLa: 240 }, { id: 'O2', V: 1333, aerated: true, KLa: 240 }], Qin: 18446, Qint: 55338, Qr: 18446, Qw: 385, capture: 0.998, influent: { SI: 30, SS: 69.5, XI: 51.2, XS: 202.3, XBH: 28.2, XBA: 0, XP: 0, SO: 0, SNO: 0, SNH: 31.6, SND: 6.9, XND: 10.6, SALK: 7 } },
      clarifier: { Q: 0.2, A: 400, vs: 0.0003 }, disinfection: { k: 0.2, n: 1, C: 2, t: 30 } },
    async run(i) {
      const W = await import('./env/water.js'); const r = W.activatedSludge(i.plant), lines = flatten({ converged: r.converged, balances: r.balances, effluent: r.effluent, srt: r.srt }, { max: 40 });
      if (i.clarifier) lines.push(...flatten(W.idealClarifier(i.clarifier), { prefix: 'clarifier' })); if (i.disinfection) lines.push(...flatten(W.chickWatson(i.disinfection), { prefix: 'disinfection' }));
      return { lines, problems: fromEngine(r.problems).concat([prob('water.review', 'info', W.REVIEW.note)]) };
    } },
  { id: 'emissions', group: 'environment', rows: ['CH.21'], title: 'Emissions and carbon per stream and unit',
    input: { thermo: { components: ['methane', 'co2'], model: 'ideal' }, streams: { v: { F: 1, T: 300, P: 101325, z: [0.9, 0.1] } }, units: { H1: { Q: 2e6 } }, tags: { v: 'vent' }, fired: { H1: { fuel: 'natural_gas', efficiency: 0.85 } }, electric: {}, hours: 8000 },
    async run(i) {
      const { Thermo } = await import('./thermo.js'), E = await import('./emissions.js'); const th = new Thermo(i.thermo), r = E.emissionsReport(th, { streams: i.streams, units: i.units }, { tags: i.tags, fired: i.fired, electric: i.electric, hours: i.hours });
      return { lines: flatten({ rows: r.rows, total: r.total ?? r.totals, perYearKg: r.perYear }, { max: 40 }), problems: fromEngine(r.problems.map((t) => (typeof t === 'string' ? { severity: 'warning', text: t, code: 'emissions.input' } : t))).concat([prob('emissions.sources', 'info', 'Factors: ' + E.GWP_SOURCE + '; ' + E.FUEL_SOURCE + '.')]) };
    } },
  { id: 'pinch', group: 'economics', rows: ['CH.22'], title: 'Pinch analysis and heat integration',
    input: { streams: [{ Ts: 20, Tt: 135, CP: 2 }, { Ts: 170, Tt: 60, CP: 3 }, { Ts: 80, Tt: 140, CP: 4 }, { Ts: 150, Tt: 30, CP: 1.5 }], dTmin: 10, dTs: [5, 10, 20, 40], h: 1000 },
    async run(i) {
      const P = await import('./pinch.js'); const t = P.problemTable(i.streams, i.dTmin), cc = P.compositeCurves(i.streams, i.dTmin), u = P.minUnits(i.streams, i.dTmin), tr = P.tradeoff(i.streams, i.dTs, i.h);
      const lines = flatten({ QHmin: t.QHmin, QCmin: t.QCmin, pinchHot: t.pinchHot, pinchCold: t.pinchCold, minimumUnits: u.total }); for (const r of tr) lines.push({ k: 'dTmin ' + r.dTmin, v: `QH ${+r.QHmin.toPrecision(4)}, QC ${+r.QCmin.toPrecision(4)}, area ${+Number(r.area).toPrecision(4)}` });
      const f = (n) => +n.toFixed(1), xs = cc.hot.concat(cc.cold).map((p) => p[0]), ys = cc.hot.concat(cc.cold).map((p) => p[1]), x1 = Math.max(...xs) || 1, y0 = Math.min(...ys), y1 = Math.max(...ys) || 1, px = (x) => f(30 + 440 * x / x1), py = (y) => f(190 - 170 * (y - y0) / ((y1 - y0) || 1));
      const pl = (c, col) => '<polyline fill="none" stroke="' + col + '" stroke-width="1.5" points="' + c.map((p) => px(p[0]) + ',' + py(p[1])).join(' ') + '"/>';
      return { lines, problems: [prob('pinch.note', 'info', 'Targets only; the heat-exchanger network grid is not drawn. Stream data in temperature (K or C, one scale) and CP (kW/K).')], svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" width="480" height="200"><rect x="30" y="20" width="440" height="170" fill="none" stroke="currentColor" stroke-width="0.5"/>' + pl(cc.hot, '#d33') + pl(cc.cold, '#36c') + '</svg>' };
    } },
  { id: 'cost', group: 'economics', rows: ['CH.23'], title: 'Capital and operating cost (index and prices are yours)',
    input: { rows: [{ name: 'P-101', kind: 'pump_centrifugal', A: 10 }, { name: 'V-101', kind: 'vessel_vertical', A: 20 }, { name: 'E-101', kind: 'hx_fixed_tube', A: 100 }], index: { base: 397, now: null }, indexPack: null, indexCsv: '', indexYear: null, plant: 'fluid', power: [{ name: 'P-101', power: 12000, price: null }], hours: 8000, takeoffPack: false },
    async run(i) {
      const C = await import('./cost.js'), K = await import('./costpack.js'); const extra = [];
      let index = i.index && i.index.now ? i.index : null, indexNote = null;
      if ((i.indexPack || i.indexCsv) && i.indexYear) {                   // the index comes from a data pack (CH.23): CEPCI or the person's own series
        const rp = i.indexCsv ? K.parseIndexCsv(i.indexCsv, { base: i.indexBase || undefined, name: 'Pasted index', series: 'index' }) : K.readIndexPack(i.indexPack === 'cepci-starter' ? K.STARTER : i.indexPack);
        if (!rp.ok) extra.push(prob('cost.indexpack', 'error', rp.error));
        else {
          for (const p of rp.problems) extra.push(prob(p.code, p.severity, p.text));
          const base = rp.pack.base || C.TURTON_BASE.year, q = K.ratio(rp.pack, base, i.indexYear);
          if (q.error) extra.push(prob('cost.indexpack', 'error', q.error)); else { index = { base: q.from, now: q.to }; indexNote = rp.pack.series + ' ' + base + ' → ' + i.indexYear + ' (' + q.from + ' → ' + q.to + ', ratio ' + q.ratio.toFixed(4) + ') from the pack "' + rp.pack.name + '"'; }
        }
      }
      const idx = index, r = C.capital(i.rows, { index: idx, plant: i.plant }), op = C.operating(i.power || [], i.hours);
      const lines = r.rows.map((x) => ({ k: x.name, v: Math.round(x.cost) + ' USD purchased' })).concat(flatten({ purchased: r.purchased, installed: r.installed, lang: r.lang, operatingPerYear: op.perYear }));
      const out = { lines, problems: extra.concat(r.notes.map((n) => prob('cost.note', 'warning', n)), op.missing.map((n) => prob('cost.price', 'warning', 'No energy price given for ' + n + ': it is listed, not guessed.')), [prob('cost.index', idx ? 'info' : 'warning', idx ? (indexNote || 'Cost index supplied by the person (base ' + idx.base + ', now ' + idx.now + ').') : 'No cost index given: these are base-year (2001) costs, not today\'s. Give an index or a cost-index data pack and a year.'), prob('cost.estimate', 'info', 'A class 4–5 estimate from textbook correlations: ±30 to ±50 %. ' + NOTE)]) };
      if (i.takeoffPack) {                                                 // hand the equipment list to TakeoffCraft's price library as a pack
        const pk = K.takeoffPack(r, { ...(typeof i.takeoffPack === 'object' ? i.takeoffPack : {}), plant: i.plant, indexNote });
        out.text = JSON.stringify(pk, null, 1); out.lines.push({ k: 'takeoffPack', v: pk.items.length + ' items for TakeoffCraft (Export as .ccpack.json from the CSV/JSON text below)' });
      }
      return out;
    } },
  { id: 'structure', group: 'chemistry', rows: ['CH.24'], title: 'Structure from SMILES, Joback estimates and a component (RDKit optional)',
    input: { smiles: 'CCCCCC', id: 'hexj', rdkit: false },
    async run(i) {
      const C = await import('./env/cheminfo.js'); const problems = []; let rd = null, desc = null, mol = null, own = null;
      if (i.rdkit) {
        try { const RK = await import('./env/rdkit.js'); rd = await RK.loadRDKit(); desc = RK.describe(rd, i.smiles); if (!desc.valid) problems.push(prob('rdkit.invalid', 'error', 'RDKit cannot read this SMILES.')); }
        catch (e) { problems.push(prob('rdkit.load', 'warning', e.message + ' The built-in reader is used instead.')); }
      }
      try { mol = C.parse(desc && desc.valid ? desc.canonical : i.smiles); } catch (e) { own = e; }
      if (!mol) return { lines: desc && desc.valid ? flatten({ canonical: desc.canonical, descriptors: desc.descriptors, inchi: desc.inchi }) : [], problems: problems.concat([prob('cheminfo.parse', 'error', own.message)]), svg: desc && desc.valid ? desc.svg : undefined, text: desc && desc.valid ? desc.molblock : undefined };
      const j = C.joback(mol), lines = flatten({ formula: C.formula(mol), molarMassGmol: C.molarMass(mol), estimates: strip(j, 'problems') }, { max: 30 });
      if (desc && desc.valid) lines.unshift(...flatten({ canonical: desc.canonical, descriptors: desc.descriptors, inchi: desc.inchi }, { max: 20 }));
      return { lines, problems: problems.concat(fromEngine(j.problems), [prob('cheminfo.review', 'info', C.REVIEW.note)]), svg: desc && desc.valid && desc.svg ? desc.svg : C.toSvg(mol), text: desc && desc.valid ? desc.molblock : C.toMol(mol, i.id || '') };
    } },
  { id: 'md', group: 'chemistry', rows: ['CH.25'], title: 'Molecular dynamics (Lennard-Jones liquid)',
    input: { n: 3, rho: 0.8442, T: 1.0, steps: 300, dt: 0.004, seed: 7, q: 0, pme: null, constraints: [], _help: 'q: charge of +-q on alternate atoms (0 = none). With q, pme { grid, order } uses the smooth particle-mesh Ewald sum instead of the plain one. constraints: [[i, j, d]] holds those bonds rigid (SHAKE).' },
    async run(i) {
      const MD = await import('../molecular/md.js'), IO = await import('../molecular/io.js'); const aL = Math.cbrt(4 / i.rho), n = Math.min(Math.max(2 | i.n, 2), 6);
      const q = +i.q || 0, atoms = MD.fccAtoms(n, aL).map((a, k) => (q ? { ...a, q: k % 2 ? q : -q } : a)), rc = Math.min(2.5, n * aL / 2 - 1e-6), L = n * aL;
      const ewald = q ? { alpha: 3.2 / rc, kmax: 6, ...(i.pme && i.pme.grid ? { pme: { grid: Math.min(Math.max(i.pme.grid | 0, 8), 48), order: Math.min(Math.max(i.pme.order | 0 || 4, 3), 8) } } : {}) } : null;
      const cons = Array.isArray(i.constraints) ? i.constraints.filter((c) => Array.isArray(c) && c.length === 3 && c.every(Number.isFinite)).slice(0, 64) : [];
      const s = MD.createSystem({ box: [L, L, L], types: { A: { sigma: 1, eps: 1, mass: 1 } }, atoms, rc, T0: i.T, seed: i.seed, ...(ewald ? { ewald } : {}), ...(cons.length ? { constraints: cons } : {}) });
      MD.run(s, Math.min(i.steps | 0, 3000), i.dt, { thermostat: { type: 'berendsen', T: i.T, tau: 0.5 } }); const e = MD.energies(s);
      return { lines: flatten({ atoms: s.N, energies: e, units: 'reduced (Lennard-Jones)', ...(ewald ? { longRange: ewald.pme ? 'smooth particle-mesh Ewald ' + ewald.pme.grid + '^3, order ' + ewald.pme.order : 'plain Ewald sum' } : {}), ...(cons.length ? { constrainedBonds: cons.length, worstBondError: s.shakeInfo && s.shakeInfo.worst } : {}) }), problems: [prob('md.review', 'info', MD.ARGON.note)], text: IO.toXYZ(s, 'LJ liquid').split('\n').slice(0, 12).join('\n') };
    } },
  { id: 'lims', group: 'plant', rows: ['CH.26'], title: 'Lab results to a proposed stream (LIMS / CSV)',
    input: { thermo: { components: ['methanol', 'water'], model: 'ideal' }, samplesCsv: 'id,name,project,collected,temperature\nS-1,Feed,P1,2026-10-27,300\n', resultsCsv: 'id,sample,analyte,value,unit\nR1,S-1,Methanol,10,%\n', map: { analytes: { Methanol: { component: 'methanol', basis: 'mass_pct' } }, balance: 'water' } },
    async run(i) {
      const { Thermo } = await import('./thermo.js'), L = await import('./env/lims.js'); const th = new Thermo(i.thermo), ad = L.csvAdapter({ samplesCsv: i.samplesCsv, resultsCsv: i.resultsCsv });
      const samples = await ad.listSamples(), s = samples[0]; if (!s) throw new Error('The samples CSV has no rows.'); const res = await ad.listResults(s.id), p = L.proposeStream(s, res, i.map, th, { system: 'csv' });
      return { lines: flatten({ sample: s.id, proposed: p.stream, review: p.review }), problems: fromEngine(p.problems).concat([prob('lims.proposal', 'info', L.DISCLAIMER)]) };
    } },
  { id: 'historian', group: 'plant', rows: ['CH.27'], title: 'Plant historian snapshot (CSV; REST or OPC UA through Studio)',
    input: { csv: 'tag,time,value,quality\nTI-101,2026-10-28T11:59:30Z,350,Good\nPI-101,2026-10-28T11:59:50Z,12,Good\n', now: '2026-10-28T12:00:00Z', map: [{ tag: 'TI-101', target: { kind: 'process', id: 'S1', prop: 'T' }, unit: 'C', high: 300, label: 'Reactor T' }, { tag: 'PI-101', target: { kind: 'process', id: 'S1', prop: 'P' }, unit: 'bar', low: 15 }] },
    async run(i) {
      const H = await import('./env/historian.js'); const sn = await H.snapshot(H.csvAdapter({ text: i.csv }), i.map, { now: Date.parse(i.now), staleAfterS: 120 });
      return { lines: sn.rows.map((r) => ({ k: r.tag + (r.label ? ' ' + r.label : ''), v: `${+Number(r.raw).toPrecision(5)} ${r.unit} -> ${r.value == null ? '--' : +Number(r.value).toPrecision(6)} SI, ${r.state}` })), problems: fromEngine(sn.problems).concat([prob('historian.note', 'info', H.DISCLAIMER)]) };
    } },
  ...makeCalcs4({ flatten, prob, fromEngine, strip, trendSvg }),   // chem-draw_PART_4: the round-4 engines (calc4.js)
];

export const list = () => CALCS.map(({ id, group, rows, title }) => ({ id, group, rows, title }));
/** A calculator with a picker (CH.10 fittings): the options to choose from, [{ label, set: { …input fields } }]. null = none. */
export async function pickerOf(id) {
  if (id !== 'fittingk') return null;
  const F = await import('./equip/fittingk.js'), b = await F.bundled();
  return F.listFittings(b.pack).map((f) => ({ label: '[' + f.method + '] ' + f.label, set: { method: f.method, fitting: f.id } }));
}
export const get = (id) => CALCS.find((c) => c.id === id) || null;
/** The five calculators that wait for one engineer's review together (O7; owner 2026-10-29): CH.9 vessel, CH.11 pipe stress, CH.12 relief, CH.16 consequence, CH.17 area. Every output says so. */
export const REVIEW_PENDING = new Set(['vessel', 'pipestress', 'relief', 'consequence', 'area', 'vessel2', 'pipestress2', 'relief2', 'blast', 'heavygas']);
export const NOT_REVIEWED = 'Not engineer-reviewed. This is a lab study aid; one engineer will review the vessel, pipe stress, relief, consequence and hazardous-area calculators together before any result is used for design.';
/** CH.21 (EG.30 running totals): the one number a run gives the status bar, in the shell's base units: { measure: 'carbon'|'cost'|'time', value, currency?, label }. null = nothing to say. */
export function figuresOf(id, r) {
  const get = (k) => { const l = (r.lines || []).find((x) => x.k === k); const v = l && Number(l.v); return Number.isFinite(v) ? v : null; };
  if (id === 'emissions') { const v = get('perYearKg'); return v == null ? null : { measure: 'carbon', value: v, label: 'Process emissions per year' }; }
  if (id === 'cost') { const v = get('installed'); return v == null ? null : { measure: 'cost', value: v, currency: 'USD', label: 'Installed plant cost (screening estimate)' }; }
  if (id === 'batch') { const v = get('makespan'); return v == null ? null : { measure: 'time', value: v, label: 'Batch campaign length' }; }
  return null;
}
export async function run(id, input) {
  const c = get(id); if (!c) return { id, ok: false, lines: [], problems: [prob('calc.unknown', 'error', 'No calculator called ' + id)] };
  try {
    const r = await c.run(input ?? c.input);
    if (REVIEW_PENDING.has(id)) {
      r.lines = [...(r.lines || []), { k: 'review', v: 'NOT ENGINEER-REVIEWED' }];
      r.problems = [prob('process.notreviewed', 'warning', NOT_REVIEWED), ...(r.problems || [])];
      if (typeof r.text === 'string') r.text = 'NOT ENGINEER-REVIEWED\n' + r.text;
    }
    const fig = figuresOf(id, r); if (fig) r.figures = fig;
    return { id, ok: true, ...r };
  }
  catch (e) {
    const missing = /Cannot find module|Failed to fetch|Failed to resolve|Importing a module script failed|not found/i.test(String(e && e.message));
    return { id, ok: false, lines: [], problems: [prob('calc.failed', 'error', missing ? 'This host does not carry that part of the process engine.' : String(e && e.message || e))] };
  }
}
