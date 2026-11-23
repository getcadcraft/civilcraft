/* SPDX-License-Identifier: Apache-2.0 */
/**
 * studies.js — the 0.11 folds of the WaterCraft tab: Parcels (WN.5), Scenarios (WN.8), Shortage and leakage (WN.9), Valves, rules and pump energy (WN.17, WN.13),
 * Emergencies (WN.15), Calibration (WN.11), Sizing and rehabilitation (WN.12). Every fold reads the Water mains of the project, runs the engine in lib/ and
 * shows a table; nothing is written to the project except by the buttons that say "Apply". The text boxes (rules, valves, scenarios, readings) live in the
 * panel while the page is open; copy them out to keep them.
 */
import { el, field, numInput, select, table, download } from './ui.js';
import { parcelArea } from '../../parcels.js';

const fx = (v, d = 1) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: d }) : '–');
const lines = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
const cells = (l) => l.split(/[,;\t]/).map((x) => x.trim());

export function mountStudies(ctx, root, helpers) {
  const { t, WN } = ctx;
  const { say, needNet, errWords, fold } = helpers;
  const U = () => ctx.units();
  const unit = { q: () => (U() === 'm' ? 'L/s' : 'gpm'), p: () => (U() === 'm' ? 'kPa' : 'psi'), l: () => (U() === 'm' ? 'm' : 'ft'), d: () => (U() === 'm' ? 'mm' : 'in') };   // i18n-ignore: unit symbols
  const last = {};
  const area = (txt, rows, ph) => el('textarea', { rows, placeholder: ph || '' }, txt || '');
  const run = (name, fn) => () => { const w = needNet(); if (!w) return; try { say(t('wn.running')); fn(w); say(t('wn.done')); } catch (e) { say(errWords(e)); } };
  const csvBtn = (name, text) => el('button', { type: 'button', className: 'btn-line', onclick: () => download(name, text()) }, t('wn.csv'));
  const btn = (label, attr, fn, cls = 'btn-plot') => el('button', { type: 'button', className: cls, ...attr, onclick: fn }, label);
  const note = (k, v) => el('p', { className: 'wn-note' }, t(k, v));

  // ---------------------------------------------------------------- Parcels (WN.5)
  const parcelKinds = area('', 4, 'r1 = commercial'), defKind = select([['', t('wn.pc.nodefault')], ...Object.keys(WN.UNIT_DEMANDS).map((k) => [k, WN.UNIT_DEMANDS[k].label])], ''), perUnit = numInput(0, { min: 0 });
  const pcOut = el('div');
  const pcRun = (apply) => run('parcels', (w) => {
    const parcels = ctx.project()?.state?.parcels || [];
    if (!parcels.length) return pcOut.replaceChildren(note('wn.pc.none'));
    const kinds = {}; for (const l of lines(parcelKinds.value)) { const [a, b] = l.split('='); if (a && b) kinds[a.trim()] = b.trim(); }
    const r = WN.loadsFromParcels(parcels, { units: U(), kinds, defaultKind: defKind.value || null, areaOf: (p) => { try { return parcelArea(p.pts); } catch (e) { return null; } }, areaPerUnit: Number(perUnit.value) || null });
    const al = WN.allocateDemands(w, r.loads, { units: U() });
    last.parcels = { loads: r.loads, skipped: r.skipped, al };
    pcOut.replaceChildren(el('p', {}, t('wn.pc.result', { n: r.loads.length, total: fx(al.total, 2), u: unit.q(), skipped: r.skipped.length })),
      r.skipped.length ? note('wn.pc.skipped', { ids: r.skipped.slice(0, 8).map((s) => s.id + ' (' + t('wn.pc.why.' + s.why) + ')').join(', ') }) : null,
      table([t('wn.col.node'), t('wn.col.demand', { q: unit.q() })], [...al.demands].filter(([, v]) => v > 0).slice(0, 40).map(([id, v]) => ({ cells: [id, fx(v, 3)] }))), csvBtn('wn-parcel-demands.csv', () => WN.demandCsv(al)));
    if (apply) { ctx.project().change(t('wn.dem.undo'), (st) => { st.water = WN.applyDemands(st.water, al, { mode: 'replace' }); }); say(t('wn.dem.applied')); }
  });
  const parcels = fold(t('wn.sec.parcels'), note('wn.pc.help'), field(t('wn.pc.kinds'), parcelKinds), field(t('wn.pc.default'), defKind), field(t('wn.pc.perunit'), perUnit), note('wn.dem.starting'),
    el('div', { className: 'wn-row' }, btn(t('wn.dem.check'), { 'data-wn-pc-check': '' }, pcRun(false), 'btn-line'), btn(t('wn.dem.apply'), { 'data-wn-pc-apply': '' }, pcRun(true))), pcOut);

  // ---------------------------------------------------------------- Scenarios (WN.8)
  const scText = area('scenario Base\n\nscenario Main out\nclose P1\n\nscenario Peak day\ndemand x1.5', 9);
  const scPdd = el('input', { type: 'checkbox' }), scOut = el('div');
  const scRun = run('scenarios', (w) => {
    const { scenarios, errors } = WN.parseScenarios(scText.value);
    if (!scenarios.length) return scOut.replaceChildren(note('wn.sc.none'));
    const cmp = WN.compareScenarios(w, U(), scenarios, { pdd: scPdd.checked ? {} : null });
    last.scenarios = cmp;
    const head = [t('wn.sc.measure'), ...cmp.names.flatMap((n, i) => (i === 0 ? [n] : [n, '±']))];
    const label = (k) => t('wn.sc.m.' + k, { q: unit.q(), p: unit.p() });
    scOut.replaceChildren(errors.length ? note('wn.sc.errors', { lines: errors.map((e) => e.line).join(', ') }) : null, cmp.notes.length ? note('wn.sc.notes', { what: cmp.notes.slice(0, 4).map((n) => n.scenario + ': ' + n.id).join('; ') }) : null,
      table(head, cmp.metrics.map((m) => ({ cells: [label(m.key), ...m.values.flatMap((v, i) => (i === 0 ? [fx(v, 2)] : [fx(v, 2), m.deltas[i] == null ? '–' : (m.deltas[i] > 0 ? '+' : '') + fx(m.deltas[i], 2)])) ] }))),
      note('wn.sc.lowest'), table([t('wn.col.node'), ...head.slice(1)], [...cmp.nodes].sort((a, b) => Math.min(...a.values.filter((v) => v != null)) - Math.min(...b.values.filter((v) => v != null))).slice(0, 12).map((r) => ({ cells: [r.id, ...r.values.flatMap((v, i) => (i === 0 ? [fx(v, 1)] : [fx(v, 1), r.deltas[i] == null ? '–' : (r.deltas[i] > 0 ? '+' : '') + fx(r.deltas[i], 1)]))] }))),
      el('div', { className: 'wn-row' }, csvBtn('wn-scenarios.csv', () => WN.comparisonCsv(cmp, 'metrics')), btn(t('wn.sc.csvnodes'), {}, () => download('wn-scenarios-nodes.csv', WN.comparisonCsv(cmp, 'nodes')), 'btn-line')));
  });
  const scenarios = fold(t('wn.sec.scenarios'), note('wn.sc.help'), field(t('wn.sc.text'), scText), el('label', {}, scPdd, ' ' + t('wn.sc.pdd')), btn(t('wn.run'), { 'data-wn-sc-run': '' }, scRun), scOut);

  // ---------------------------------------------------------------- Shortage and leakage (WN.9)
  const pmin = numInput(20, { min: 0 }), pref = numInput(40, { min: 1 }), pexp = numInput(0.5, { min: 0.1, step: 0.05 }), pmult = numInput(1, { min: 0.1 });
  const emTxt = area('', 3, 'J5, 3.0'), lkC = numInput(0, { min: 0 }), lkN = numInput(1.18, { min: 0.1, step: 0.01 }), pdOut = el('div');
  const pdRun = run('pdd', (w) => {
    if (U() === 'm') { if (Number(pmin.value) === 20) { pmin.value = 140; pref.value = 280; } }
    const emitters = lines(emTxt.value).map((l) => { const [node, coeff, exp] = cells(l); return { node, coeff: Number(coeff), exp: exp ? Number(exp) : 0.5 }; });
    const r = WN.solvePDD(w, U(), { mult: Number(pmult.value) || 1, pmin: Number(pmin.value), pref: Number(pref.value), exponent: Number(pexp.value), emitters, leak: Number(lkC.value) > 0 ? { coeff: Number(lkC.value), exp: Number(lkN.value) } : null });
    last.pdd = r;
    const short = [...r.served].filter(([, v]) => v.fraction < 0.999).sort((a, b) => a[1].fraction - b[1].fraction);
    pdOut.replaceChildren(el('p', {}, t('wn.pd.result', { req: fx(r.required, 1), del: fx(r.delivered, 1), def: fx(r.deficit, 1), u: unit.q(), leak: fx(r.leakTotal + r.emitterTotal, 1) }) + (r.converged ? '' : ' ' + t('wn.pd.noconv'))),
      short.length ? table([t('wn.col.node'), t('wn.col.req', { q: unit.q() }), t('wn.col.deliv', { q: unit.q() }), t('wn.col.pct'), t('wn.col.pAt', { p: unit.p() })], short.slice(0, 40).map(([id, v]) => ({ cls: 'bad', cells: [id, fx(v.required, 1), fx(v.delivered, 1), fx(100 * v.fraction, 0) + ' %', fx(v.pressure, 1)] }))) : note('wn.pd.allserved'));
  });
  const pdd = fold(t('wn.sec.pdd'), note('wn.pd.help'), field(t('wn.pd.pmin', { p: unit.p() }), pmin), field(t('wn.pd.pref', { p: unit.p() }), pref), field(t('wn.pd.exp'), pexp), field(t('wn.fire.mult'), pmult),
    field(t('wn.pd.emitters'), emTxt), field(t('wn.pd.leakc'), lkC), field(t('wn.pd.leakn'), lkN), btn(t('wn.run'), { 'data-wn-pd-run': '' }, pdRun), pdOut);

  // ---------------------------------------------------------------- Valves, rules, energy (WN.17, WN.13)
  const ruleTxt = area('', 4, 'LINK P1 CLOSED IF NODE T1 ABOVE 140'), valveTxt = area('', 3, 'V1, P7, FCV, 200'), rHours = numInput(24, { min: 1, max: 720 }), rStep = numInput(3600, { min: 60 });
  const rPat = numInput('', { min: 60 }), rEff = numInput(75, { min: 1, max: 100 }), rPrice = numInput(0.12, { min: 0, step: 0.01 }), rTariff = el('input', { type: 'text', placeholder: '1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1' }), enOut = el('div');
  const enRun = run('energy', (w) => {
    const { rules, errors } = WN.parseRules(ruleTxt.value);
    const valves = lines(valveTxt.value).map((l) => { const [id, pipe, type, setting] = cells(l); return { id, pipe, type: String(type || '').toUpperCase(), setting: Number(setting) }; });
    const tariff = rTariff.value.split(/[,\s]+/).map(Number).filter(Number.isFinite);
    const s = WN.simulate(w, U(), { hours: Number(rHours.value), step: Number(rStep.value), patternStep: Number(rPat.value) || undefined, rules, valves, energy: { eff: Number(rEff.value), price: Number(rPrice.value), tariff } });
    last.sim = s;
    const tanks = Object.keys(s.rows[0]?.tanks || {});
    enOut.replaceChildren(errors.length ? note('wn.en.errors', { lines: errors.map((e) => e.line).join(', ') }) : null,
      s.events.length ? table([t('wn.en.at'), t('wn.en.rule')], s.events.slice(0, 20).map((e) => ({ cells: [fx(e.t / 3600, 2) + ' h', e.why] }))) : note('wn.en.noevents'),
      Object.keys(s.energy).length ? table([t('wn.en.pump'), t('wn.en.kwh'), t('wn.en.avgkw'), t('wn.en.peakkw'), t('wn.en.usage'), t('wn.en.cost')], Object.entries(s.energy).map(([id, e]) => ({ cells: [id, fx(e.kwh, 0), fx(e.avgKw, 1), fx(e.peakKw, 1), fx(e.usagePct, 1) + ' %', fx(e.cost, 2)] }))) : null,
      tanks.length ? table([t('wn.col.hour'), ...tanks.map((id) => t('wn.en.level', { id, l: unit.l() }))], s.rows.filter((_, i) => i % Math.max(1, Math.round(3600 / s.reportStep)) === 0).slice(0, 49).map((r) => ({ cells: [fx(r.t / 3600, 1), ...tanks.map((id) => fx(r.tanks[id].level, 2))] }))) : null,
      s.problems.length ? note('wn.en.problems', { n: s.problems.length }) : null);
  });
  const energy = fold(t('wn.sec.energy'), note('wn.en.help'), field(t('wn.en.rules'), ruleTxt), field(t('wn.en.valves', { q: unit.q(), p: unit.p() }), valveTxt), field(t('wn.q.hours'), rHours), field(t('wn.en.step'), rStep), field(t('wn.en.patstep'), rPat),
    field(t('wn.en.eff'), rEff), field(t('wn.en.price'), rPrice), field(t('wn.en.tariff'), rTariff), btn(t('wn.run'), { 'data-wn-en-run': '' }, enRun), enOut);

  // ---------------------------------------------------------------- Emergencies (WN.15)
  const evKind = select([['break', t('wn.em.break')], ['fire', t('wn.em.fire')], ['power', t('wn.em.power')]], 'break'), evPipe = el('input', { type: 'text', placeholder: 'P12' }), evNode = el('input', { type: 'text', placeholder: 'J9' });
  const evFlow = numInput(1000, { min: 1 }), evFrom = numInput(1, { min: 0 }), evTo = numInput(3, { min: 0 }), evHours = numInput(12, { min: 1, max: 72 }), emOut = el('div');
  const emRun = run('emergency', (w) => {
    const kind = evKind.value, ev = { kind, fromHours: Number(evFrom.value), toHours: Number(evTo.value) };
    if (kind === 'break') ev.pipe = evPipe.value.trim(); if (kind === 'fire') { ev.node = evNode.value.trim(); ev.flow = Number(evFlow.value); }
    if (kind === 'power') ev.pumps = evPipe.value.split(/[,\s]+/).filter(Boolean);
    const r = WN.runEmergency(w, U(), ev, { hours: Number(evHours.value), useValves: true });
    last.emergency = r; const s = r.summary;
    emOut.replaceChildren(el('p', {}, t('wn.em.result', { cut: fx(s.unservedDemand, 1), q: unit.q(), n: s.unservedNodes.length, minp: fx(s.minPressure, 1), p: unit.p(), first: s.firstLowAt == null ? t('wn.em.never') : fx(s.firstLowAt, 2) + ' h' })),
      s.tanks.length ? table([t('wn.em.tank'), t('wn.em.start', { l: unit.l() }), t('wn.em.end', { l: unit.l() }), t('wn.em.empty')], s.tanks.map((k) => ({ cls: k.emptyAt != null ? 'bad' : '', cells: [k.id, fx(k.startLevel, 1), fx(k.endLevel, 1), k.emptyAt == null ? '–' : fx(k.emptyAt, 2) + ' h'] }))) : null,
      s.lowNodes.length ? table([t('wn.col.node'), t('wn.em.lowest', { p: unit.p() }), t('wn.em.hourslow')], s.lowNodes.slice(0, 30).map((n) => ({ cls: 'bad', cells: [n.id, fx(n.minPressure, 1), fx(n.hoursLow, 2)] }))) : note('wn.em.nolow'));
  });
  const emerg = fold(t('wn.sec.emerg'), note('wn.em.help'), field(t('wn.em.kind'), evKind), field(t('wn.em.pipe'), evPipe), field(t('wn.em.node'), evNode), field(t('wn.fire.needed', { q: unit.q() }), evFlow),
    field(t('wn.em.from'), evFrom), field(t('wn.em.to'), evTo), field(t('wn.q.hours'), evHours), btn(t('wn.run'), { 'data-wn-em-run': '' }, emRun), emOut);

  // ---------------------------------------------------------------- Calibration (WN.11)
  const readTxt = area('', 6, 'pressure, J5, 62.4\nflow, P3, 410'), grpTxt = area('', 3, 'mains: P1 P2 P3'), dmChk = el('input', { type: 'checkbox' }), calOut = el('div');
  const calRun = run('calibrate', (w) => {
    const observations = lines(readTxt.value).map((l) => { const [kind, id, value, mult] = cells(l); return { kind: kind.toLowerCase(), id, value: Number(value), mult: mult ? Number(mult) : 1 }; });
    const groups = lines(grpTxt.value).map((l) => { const [name, rest] = l.split(':'); return { id: name.trim(), pipes: String(rest || '').split(/[\s,]+/).filter(Boolean) }; });
    const r = WN.calibrate(w, U(), { observations, groups: groups.length ? groups : null, demandFactor: dmChk.checked });
    last.calibrate = r;
    calOut.replaceChildren(el('p', {}, t('wn.cal.result', { a: fx(r.rmseBefore, 2), b: fx(r.rmseAfter, 2) }) + (r.weak.length ? ' ' + t('wn.cal.weak', { ids: r.weak.join(', ') }) : '')),
      table([t('wn.cal.group'), t('wn.cal.from'), t('wn.cal.to'), t('wn.cal.pipes')], r.params.map((p) => ({ cells: [p.id, fx(p.from, 1), fx(p.to, 1), p.pipes.length || '–'] }))),
      table([t('wn.cal.reading'), t('wn.cal.observed'), t('wn.cal.before'), t('wn.cal.after')], r.rows.slice(0, 40).map((x) => ({ cells: [x.kind + ' ' + x.id, fx(x.observed, 1), fx(x.before, 1), fx(x.after, 1)] }))),
      btn(t('wn.cal.apply'), { 'data-wn-cal-apply': '' }, () => { ctx.project().change(t('wn.cal.undo'), (st) => { const c = new Map(r.water.pipes.map((p) => [p.id, p.c])); st.water = { ...st.water, pipes: st.water.pipes.map((p) => (c.has(p.id) && p.kind === 'pipe' ? { ...p, c: Math.round(c.get(p.id) * 10) / 10 } : p)) }; }); say(t('wn.cal.applied')); }));
  });
  const calib = fold(t('wn.sec.calib'), note('wn.cal.help', { q: unit.q(), p: unit.p() }), field(t('wn.cal.readings'), readTxt), field(t('wn.cal.groups'), grpTxt), el('label', {}, dmChk, ' ' + t('wn.cal.dm')), btn(t('wn.run'), { 'data-wn-cal-run': '' }, calRun), calOut);

  // ---------------------------------------------------------------- Sizing and rehabilitation (WN.12)
  const szD = el('input', { type: 'text', value: '' }), szCost = area('', 3, '6 = 38\n8 = 46'), szMin = numInput(20, { min: 1 }), szV = numInput(10, { min: 0.5 }), szOut = el('div');
  const rhTxt = area('', 3, 'line, 120, 90\nreplace, 140, 210'), rhBudget = numInput(0, { min: 0 });
  const szRun = run('sizing', (w) => {
    const ds = szD.value.split(/[,\s]+/).map(Number).filter((x) => x > 0);
    const table0 = {}; for (const l of lines(szCost.value)) { const [d, c] = l.split('='); if (d && c) table0[Number(d)] = Number(c); }
    const r = WN.sizePipes(w, U(), { diameters: ds, cost: (d) => table0[d] ?? 0, minP: Number(szMin.value), vMax: Number(szV.value) });
    last.sizing = r;
    szOut.replaceChildren(el('p', {}, t(r.feasible ? 'wn.sz.ok' : 'wn.sz.no', { n: r.changes.length, cost: fx(r.cost, 0) })),
      table([t('wn.col.pipe'), t('wn.sz.from', { d: unit.d() }), t('wn.sz.to', { d: unit.d() }), t('wn.sz.cost')], r.changes.map((c) => ({ cells: [c.id, fx(c.from, 1), fx(c.to, 1), fx(c.costDelta, 0)] }))),
      r.changes.length ? btn(t('wn.sz.apply'), { 'data-wn-sz-apply': '' }, () => { const to = new Map(r.changes.map((c) => [c.id, c.to])); ctx.project().change(t('wn.sz.undo'), (st) => { st.water = { ...st.water, pipes: st.water.pipes.map((p) => (to.has(p.id) ? { ...p, d: to.get(p.id) } : p)) }; }); say(t('wn.sz.applied')); }) : null);
  });
  const rhRun = run('rehab', (w) => {
    const options = lines(rhTxt.value).map((l) => { const [name, c, cost] = cells(l); return { name, c: Number(c), cost: Number(cost) }; });
    const r = WN.rehabilitate(w, U(), { options, budget: Number(rhBudget.value) > 0 ? Number(rhBudget.value) : Infinity, minP: Number(szMin.value), vMax: Number(szV.value) });
    last.rehab = r;
    szOut.replaceChildren(el('p', {}, t(r.feasible ? 'wn.rh.ok' : 'wn.rh.no', { n: r.picks.length, cost: fx(r.cost, 0) })), table([t('wn.col.pipe'), t('wn.rh.option'), t('wn.sz.cost')], r.picks.map((p) => ({ cells: [p.id, p.option, fx(p.cost, 0)] }))));
  });
  const sizing = fold(t('wn.sec.sizing'), note('wn.sz.help', { d: unit.d() }), field(t('wn.sz.sizes', { d: unit.d() }), szD), field(t('wn.sz.prices'), szCost), field(t('wn.sz.minp', { p: unit.p() }), szMin), field(t('wn.sz.vmax'), szV),
    btn(t('wn.sz.run'), { 'data-wn-sz-run': '' }, szRun), note('wn.rh.help'), field(t('wn.rh.options'), rhTxt), field(t('wn.rh.budget'), rhBudget), btn(t('wn.rh.run'), { 'data-wn-rh-run': '' }, rhRun), szOut);

  root.append(parcels, scenarios, pdd, energy, emerg, calib, sizing);
  return { pcRun, scRun, pdRun, enRun, emRun, calRun, szRun, rhRun, last, set: { parcelKinds: (s) => { parcelKinds.value = s; }, defKind: (s) => { defKind.value = s; }, scenarios: (s) => { scText.value = s; }, emitters: (s) => { emTxt.value = s; }, leak: (c) => { lkC.value = c; },
    rules: (s) => { ruleTxt.value = s; }, patstep: (v) => { rPat.value = v; }, valves: (s) => { valveTxt.value = s; }, readings: (s) => { readTxt.value = s; }, groups: (s) => { grpTxt.value = s; }, sizes: (s) => { szD.value = s; }, prices: (s) => { szCost.value = s; }, minp: (v) => { szMin.value = v; }, event: (o) => { evKind.value = o.kind; evPipe.value = o.pipe || ''; evNode.value = o.node || ''; if (o.flow) evFlow.value = o.flow; } } };
}
