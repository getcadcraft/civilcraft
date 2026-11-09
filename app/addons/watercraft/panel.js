/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the WaterCraft tab (0.9 WN.7): five folds over the project's Water mains — Demands, Fire flow, Criticality, Water quality, Notes.
 * Long runs go a few nodes or outages at a time with a pause between, so the page stays alive and Stop works.
 */
import { el, field, numInput, select, table, download } from './ui.js';

const fx = (v, d = 1) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: d }) : '–');

export function mountPanel(ctx, root) {
  const { t, WN } = ctx;
  const U = () => ctx.units();
  const unit = { q: () => (U() === 'm' ? 'L/s' : 'gpm'), p: () => (U() === 'm' ? 'kPa' : 'psi') };   // i18n-ignore: unit symbols
  const status = el('p', { className: 'wn-note', role: 'status' });
  const say = (m) => { status.textContent = m || ''; };
  let stop = false;
  const stopBtn = el('button', { type: 'button', className: 'btn-line', hidden: true, onclick: () => { stop = true; } }, t('wn.stop'));
  const needNet = () => { const w = ctx.model(); if (!w || !w.nodes?.length || !w.pipes?.length) { say(t('wn.err.nonet')); return null; } return w; };
  const pause = () => new Promise((r) => setTimeout(r, 0));
  /** Run `fn(batch)` over ids a few at a time; returns the merged rows, or what was done when Stop was pressed. */
  async function batched(ids, size, fn, label) {
    stop = false; stopBtn.hidden = false; const rows = [];
    try {
      for (let i = 0; i < ids.length && !stop; i += size) { rows.push(...fn(ids.slice(i, i + size))); say(t(label, { done: Math.min(i + size, ids.length), n: ids.length })); await pause(); }
    } finally { stopBtn.hidden = true; }
    return { rows, stopped: stop };
  }
  const fold = (title, ...kids) => el('details', {}, el('summary', {}, title), ...kids);
  const errWords = (e) => { const k = 'wn.err.' + (e && e.code); const w = e && e.code ? t(k) : k; return w !== k ? w : t('wn.err.other', { why: String((e && e.message) || e) }); };

  // ---- Demands
  const loadsBox = el('textarea', { rows: 6, placeholder: 'id, x, y, kind, amount' });
  const shareChk = el('input', { type: 'checkbox' }), peak = numInput(1, { min: 0.1 });
  const pat = select([['', t('wn.pat.keep')], ['residential', t('wn.pat.res')], ['commercial', t('wn.pat.com')], ['flat', t('wn.pat.flat')]], '');
  const demOut = el('div');
  let lastAlloc = null;
  const parseLoads = (text) => text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l, i) => {
    const [id, x, y, kind, amount] = l.split(/[,;\t]/).map((s) => s.trim());
    const a = Number(amount), per = WN.UNIT_DEMANDS[kind]?.per;
    return { id: id || 'L' + (i + 1), x: Number(x), y: Number(y), kind, ...(kind === 'flow' || !per ? { flow: a } : per === 'acre' ? { area: a } : { count: a }) };
  });
  const demandRun = (apply) => {
    const w = needNet(); if (!w) return;
    const loads = parseLoads(loadsBox.value);
    if (!loads.length) return say(t('wn.err.noloads'));
    const alloc = WN.allocateDemands(w, loads.map((l) => (l.kind === 'flow' ? { ...l, kind: 'flow' } : l)), { units: U(), share: shareChk.checked, radius: shareChk.checked ? 300 * (U() === 'm' ? 0.3048 : 1) : null, peak: Number(peak.value) || 1 });
    lastAlloc = alloc;
    demOut.replaceChildren(el('p', {}, t('wn.dem.result', { total: fx(alloc.total, 2), u: unit.q(), n: [...alloc.demands.values()].filter((v) => v > 0).length, bad: alloc.unallocated.length })),
      alloc.unallocated.length ? el('p', { className: 'wn-note' }, t('wn.dem.unalloc', { ids: alloc.unallocated.slice(0, 8).map((u) => u.load?.id ?? '?').join(', ') })) : null,
      el('button', { type: 'button', className: 'btn-line', onclick: () => download('wn-demands.csv', WN.demandCsv(alloc)) }, t('wn.csv')));
    if (!apply) return;
    ctx.project().change(t('wn.dem.undo'), (st) => {
      st.water = WN.applyDemands(st.water, alloc, { mode: 'replace' });
      if (pat.value) st.water.settings = { ...st.water.settings, pattern: WN.diurnalPattern(pat.value, Math.max(1, Math.round(86400 / (st.water.settings.step || 3600)))) };
    });
    say(t('wn.dem.applied'));
  };
  const demands = fold(t('wn.sec.demands'), el('p', { className: 'wn-note' }, t('wn.dem.help', { kinds: Object.keys(WN.UNIT_DEMANDS).join(', ') })),
    field(t('wn.dem.loads'), loadsBox), el('label', {}, shareChk, ' ' + t('wn.dem.share')), field(t('wn.dem.peak'), peak), field(t('wn.dem.pattern'), pat),
    el('p', { className: 'wn-note' }, t('wn.dem.starting')),
    el('div', { className: 'wn-row' }, el('button', { type: 'button', className: 'btn-line', 'data-wn-dem-check': '', onclick: () => demandRun(false) }, t('wn.dem.check')),
      el('button', { type: 'button', className: 'btn-plot', 'data-wn-dem-apply': '', onclick: () => demandRun(true) }, t('wn.dem.apply'))), demOut);

  // ---- Fire flow
  const needed = numInput(1000, { min: 1 }), resid = numInput(20, { min: 0 });
  const crit = select([['system', t('wn.fire.system')], ['node', t('wn.fire.node')]], 'system'), multIn = numInput(1, { min: 0.1 });
  const fireOut = el('div');
  let lastFire = null;
  const setUnitsDefaults = () => { if (U() === 'm') { needed.value = 63; resid.value = 140; } };
  const fireRun = async () => {
    const w = needNet(); if (!w) return;
    setUnitsDefaults();
    const ids = WN.hydrantNodes(ctx.water.cleanWater(w, U()));
    const opts = { needed: Number(needed.value), residual: Number(resid.value), criterion: crit.value, mult: Number(multIn.value) || 1 };
    let meta = null;
    const { rows, stopped } = await batched(ids, 3, (b) => { const r = WN.fireFlowAll(w, U(), { ...opts, nodes: b }); meta = r; return r.rows; }, 'wn.progress.nodes');
    rows.sort((a, b) => a.available - b.available);
    lastFire = { rows, needed: meta?.needed ?? opts.needed, residual: meta?.residual ?? opts.residual, pass: rows.filter((r) => r.pass).length, fail: rows.filter((r) => !r.pass).length };
    fireOut.replaceChildren(el('p', {}, t('wn.fire.result', { pass: lastFire.pass, fail: lastFire.fail, needed: fx(lastFire.needed, 0), q: unit.q(), res: fx(lastFire.residual, 0), p: unit.p() }) + (stopped ? ' ' + t('wn.stopped') : '')),
      table([t('wn.col.node'), t('wn.col.avail', { q: unit.q() }), t('wn.col.pAt', { p: unit.p() }), t('wn.col.limit'), t('wn.col.result')],
        rows.slice(0, 60).map((r) => ({ cls: r.pass ? '' : 'bad', cells: [r.name, fx(r.available, 0), fx(r.pressureAtNeeded, 1), t('wn.limit.' + r.limitedBy), r.pass ? t('wn.meets') : t('wn.short')] }))),
      rows.length > 60 ? el('p', { className: 'wn-note' }, t('wn.more', { n: rows.length - 60 })) : null,
      el('button', { type: 'button', className: 'btn-line', onclick: () => download('wn-fire-flow.csv', WN.fireCsv(lastFire, { q: unit.q() })) }, t('wn.csv')));
    say(t('wn.done'));
  };
  const fire = fold(t('wn.sec.fire'), el('p', { className: 'wn-note' }, t('wn.fire.help')), field(t('wn.fire.needed', { q: unit.q() }), needed), field(t('wn.fire.resid', { p: unit.p() }), resid),
    field(t('wn.fire.crit'), crit), field(t('wn.fire.mult'), multIn), el('button', { type: 'button', className: 'btn-plot', 'data-wn-fire-run': '', onclick: fireRun }, t('wn.run')), fireOut);

  // ---- Criticality
  const by = select([['pipe', t('wn.crit.pipe')], ['segment', t('wn.crit.segment')]], 'pipe');
  const critOut = el('div');
  let lastCrit = null;
  const critRun = async () => {
    const w = needNet(); if (!w) return;
    const clean = ctx.water.cleanWater(w, U());
    const ids = by.value === 'segment' ? WN.isolationSegments(clean).map((s) => s.id) : clean.pipes.filter((p) => p.kind === 'pipe' && p.status !== 'closed').map((p) => p.id);
    let meta = null;
    const { rows, stopped } = await batched(ids, 4, (b) => { const r = WN.criticality(w, U(), { by: by.value, only: b }); meta = r; return r.rows; }, 'wn.progress.outages');
    rows.sort((a, b) => b.unservedDemand - a.unservedDemand || b.lowNodes - a.lowNodes);
    lastCrit = { rows, base: meta?.base };
    critOut.replaceChildren(el('p', {}, t('wn.crit.result', { n: rows.length, cut: rows.filter((r) => r.unservedDemand > 0).length }) + (stopped ? ' ' + t('wn.stopped') : '')),
      table([t('wn.col.outage'), t('wn.col.cut', { q: unit.q() }), t('wn.col.cutn'), t('wn.col.low'), t('wn.col.minp', { p: unit.p() })],
        rows.slice(0, 40).map((r) => ({ cls: r.unservedDemand > 0 ? 'bad' : '', cells: [r.name, fx(r.unservedDemand, 1), r.unservedNodes.length, r.lowNodes, fx(r.minPressure, 1)] }))),
      el('button', { type: 'button', className: 'btn-line', onclick: () => download('wn-criticality.csv', WN.criticalCsv(lastCrit)) }, t('wn.csv')));
    say(t('wn.done'));
  };
  const critFold = fold(t('wn.sec.crit'), el('p', { className: 'wn-note' }, t('wn.crit.help')), field(t('wn.crit.by'), by),
    el('button', { type: 'button', className: 'btn-plot', 'data-wn-crit-run': '', onclick: critRun }, t('wn.run')), critOut);

  // ---- Water quality
  const mode = select([['age', t('wn.q.age')], ['chlorine', t('wn.q.chlorine')], ['trace', t('wn.q.trace')]], 'age');
  const hours = numInput(48, { min: 1, max: 720 }), bulk = numInput(0.5, { min: 0 }), wall = numInput(0, { min: 0 }), srcC = numInput(1, { min: 0 }), minC = numInput(0.2, { min: 0 }), maxAge = numInput(72, { min: 1 });
  const traceSel = select([], '');
  const refreshTrace = () => { const w = ctx.model(); traceSel.replaceChildren(...((w?.nodes || []).filter((n) => n.kind !== 'junction').map((n) => el('option', { value: n.id }, n.name || n.id)))); };
  const qOut = el('div');
  let lastQ = null;
  const qRun = () => {
    const w = needNet(); if (!w) return;
    try {
      say(t('wn.q.running'));
      const m = mode.value;
      lastQ = WN.waterQuality(w, U(), { mode: m, hours: Number(hours.value), bulk: Number(bulk.value), wall: Number(wall.value), reservoirC: Number(srcC.value), minC: Number(minC.value), maxAge: Number(maxAge.value), traceNode: traceSel.value });
    } catch (e) { return say(errWords(e)); }
    const u = lastQ.mode === 'age' ? 'h' : lastQ.mode === 'chlorine' ? 'mg/L' : '%';   // i18n-ignore: unit symbols
    const rows = [...lastQ.nodes].filter(([, n]) => n.kind === 'junction').sort((a, b) => (lastQ.mode === 'chlorine' ? a[1].min - b[1].min : b[1].max - a[1].max));
    qOut.replaceChildren(el('p', {}, t('wn.q.result', { n: lastQ.problems.length })), table([t('wn.col.node'), t('wn.col.last', { u }), t('wn.col.max', { u }), t('wn.col.min', { u })],
      rows.slice(0, 40).map(([id, n]) => ({ cls: lastQ.problems.some((p) => p.id === id) ? 'bad' : '', cells: [id, fx(n.last, 2), fx(n.max, 2), fx(n.min, 2)] }))),
      el('p', { className: 'wn-note' }, t('wn.q.limits')), el('button', { type: 'button', className: 'btn-line', onclick: () => download('wn-quality.csv', WN.qualityCsv(lastQ)) }, t('wn.csv')));
    say(t('wn.done'));
  };
  const qFold = fold(t('wn.sec.quality'), el('p', { className: 'wn-note' }, t('wn.q.help')), field(t('wn.q.mode'), mode), field(t('wn.q.hours'), hours),
    field(t('wn.q.bulk'), bulk), field(t('wn.q.wall'), wall), field(t('wn.q.srcc'), srcC), field(t('wn.q.minc'), minC), field(t('wn.q.maxage'), maxAge), field(t('wn.q.tracenode'), traceSel),
    el('button', { type: 'button', className: 'btn-plot', 'data-wn-q-run': '', onclick: qRun }, t('wn.run')), qOut);
  qFold.addEventListener('toggle', refreshTrace);
  refreshTrace();

  root.append(el('p', { className: 'wn-note' }, t('wn.numbers')), el('p', { className: 'wn-note' }, t('wn.privacy')), demands, fire, critFold, qFold, stopBtn, status);
  ctx.run = { demandRun, fireRun, critRun, qRun, get last() { return { alloc: lastAlloc, fire: lastFire, crit: lastCrit, quality: lastQ }; }, set: { loads: (s) => { loadsBox.value = s; }, mode: (m) => { mode.value = m; }, trace: (id) => { traceSel.value = id; }, by: (v) => { by.value = v; } } };
}
