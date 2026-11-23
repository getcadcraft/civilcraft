/* SPDX-License-Identifier: Apache-2.0 */
/**
 * loops-ui.js — the loop binding screen and the controller faceplates (0.8 CH.5, chem-draw_PART_4; lives in lib/process so every host that carries lib/process can use it).
 * A P&ID names the loops (controls.loops); the plant model is a dynamic spec (dynamics.js: tanks, reactors, valves, sources). This screen ties each controller of the
 * drawing to what it reads (pv, e.g. 'T1.h') and drives (mv, e.g. 'valve.V1'), with its set point and tuning, runs the simulation, and shows one faceplate per controller
 * (mode AUTO/MAN, SP, PV, OUT, error) and a trend. Nothing here controls a plant: it is a model. DOM text goes in through textContent; the trend SVG is parsed, never assigned as HTML.
 *   mountLoops(el, { t, loops(), spec(), setSpec(obj), bindings(), setBindings(obj), publish?, tEnd? }) → { run(), rows(), plates() }
 */
import * as DYN from './dynamics.js';
import { loopTable, faceplate } from './draw.js';
import { trendSvg } from './calc.js';

export function mountLoops(el, { t, loops, spec, setSpec, bindings, setBindings, publish = () => {}, tEnd = 600 } = {}) {
  const d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const tbl = mk('div'); tbl.setAttribute('data-loops-table', ''); const plates = mk('div'); plates.setAttribute('data-loops-plates', ''); const msg = mk('div'); msg.setAttribute('aria-live', 'polite');
  const specBox = mk('textarea', 'form-control'); specBox.rows = 6; specBox.spellcheck = false; specBox.setAttribute('data-loops-spec', ''); specBox.setAttribute('aria-label', t('loops.spec')); specBox.style.cssText = 'font-family:monospace;font-size:0.75rem;width:100%;margin:0.375rem 0';
  let state = { auto: {}, sp: {}, out: {} }, lastSim = null;
  const rowsNow = () => loopTable(loops(), bindings());
  const input = (type, value, attrs = {}) => { const i = mk('input', 'form-control'); i.type = type; i.value = value ?? ''; i.style.cssText = 'font-size:0.75rem;padding:0.125rem 0.25rem;min-width:4rem'; for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, v); return i; };
  function drawTable() {
    const rows = rowsNow(), b = bindings();
    if (!rows.length) { tbl.replaceChildren(mk('p', 'text-ink-2', t('loops.none'))); return; }
    const table = mk('table', 'table-cc'); table.style.cssText = 'font-size:0.75rem;width:100%';
    const head = d.createElement('tr'); for (const k of ['loops.col.tag', 'loops.col.pv', 'loops.col.mv', 'loops.col.sp', 'loops.col.kc', 'loops.col.ti', 'loops.col.rng', 'loops.col.action']) head.append(mk('th', '', t(k))); table.append(head);
    for (const r of rows) {
      const tr = d.createElement('tr'); tr.setAttribute('data-loop-row', r.tag);
      const f = { pv: input('text', r.pv, { 'data-bind': 'pv', 'aria-label': t('loops.col.pv') + ' ' + r.tag }), mv: input('text', r.mv, { 'data-bind': 'mv' }), sp: input('number', r.sp, { 'data-bind': 'sp', step: 'any' }), Kc: input('number', r.Kc, { 'data-bind': 'Kc', step: 'any' }), Ti: input('number', r.Ti, { 'data-bind': 'Ti', step: 'any' }), rng: input('number', r.span ? r.span[1] : '', { 'data-bind': 'rng', step: 'any', 'aria-label': t('loops.col.rng') + ' ' + r.tag }) };
      const act = mk('select', 'select-cc'); act.setAttribute('data-bind', 'action'); for (const v of ['reverse', 'direct']) { const o = mk('option', '', t('loops.action.' + v)); o.value = v; act.append(o); } act.value = r.action;
      const save = () => { const nb = { ...bindings() }; const num = (x) => (x.value === '' ? undefined : Number(x.value)); nb[r.tag] = { ...(nb[r.tag] || {}), pv: f.pv.value.trim(), mv: f.mv.value.trim(), sp: num(f.sp), Kc: num(f.Kc), Ti: num(f.Ti), span: f.rng.value === '' ? undefined : [0, Number(f.rng.value)], action: act.value }; setBindings(nb); };
      for (const x of [...Object.values(f), act]) x.addEventListener('change', save);
      tr.append(mk('td', '', r.tag + ' (' + r.loop + ')')); for (const x of [f.pv, f.mv, f.sp, f.Kc, f.Ti, f.rng, act]) { const td = d.createElement('td'); td.append(x); tr.append(td); }
      table.append(tr);
    }
    void b; tbl.replaceChildren(table);
  }
  async function run() {
    let sp; try { sp = JSON.parse(specBox.value); } catch (e) { msg.replaceChildren(mk('p', 'text-danger', t('calc.badjson', { why: String(e.message).slice(0, 120) }))); return null; }
    setSpec(sp);
    const lp = loops(), r = DYN.controllersFromLoops(lp, bindings(), {});
    const ctrls = r.controllers.filter((c) => c.pv && c.mv).map((c) => ({ ...c, span: c.span || [0, Math.max(1e-9, 2 * (Number(c.sp) || 1))], ...(state.sp[c.id] != null ? { sp: state.sp[c.id] } : {}), auto: state.auto[c.id] !== false, ...(state.auto[c.id] === false ? { out: state.out[c.id] ?? 0.5 } : {}) }));
    const probs = r.problems.map((p) => ({ code: p.code, severity: p.severity, text: p.text }));
    if (!ctrls.length) { msg.replaceChildren(mk('p', '', t('loops.nobound'))); plates.replaceChildren(); publish(probs); return null; }
    let sim; try { sim = DYN.simulate({ ...sp, controllers: ctrls }, { tEnd: Number(sp.tEnd) || tEnd }); } catch (e) { msg.replaceChildren(mk('p', 'text-danger', String(e.message))); return null; }
    lastSim = { sim, ctrls }; publish(probs.concat(sim.problems.map((p) => ({ code: p.code, severity: p.severity, text: p.text }))));
    const frag = d.createDocumentFragment();
    for (const c of ctrls) {
      const pvSeries = sim.series[c.pv] || [], out = sim.outputs[c.id] || [], fp = faceplate(c, { pv: pvSeries, out });
      const card = mk('div'); card.setAttribute('data-faceplate', c.id); card.style.cssText = 'border:1px solid currentColor;border-radius:0.25rem;padding:0.5rem;margin:0.5rem 0';
      card.append(mk('strong', '', fp.tag + '  ' + fp.mode));
      const grid = mk('div'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0.25rem;font-size:0.75rem;margin:0.25rem 0';
      const cell = (k, v) => { const x = mk('div'); x.append(mk('div', 'text-ink-2', t(k)), mk('div', 'tabular', v)); return x; };
      const f4 = (v) => (Number.isFinite(v) ? String(+v.toPrecision(4)) : '—');
      grid.append(cell('loops.sp', f4(fp.sp)), cell('loops.pv', f4(fp.pv)), cell('loops.out', Number.isFinite(fp.out) ? f4(fp.out * 100) + ' %' : '—'), cell('loops.err', f4(fp.error)));
      card.append(grid);
      const modeBtn = mk('button', 'btn-line btn-sm-cc', fp.mode === 'AUTO' ? t('loops.tomanual') : t('loops.toauto')); modeBtn.type = 'button'; modeBtn.setAttribute('data-faceplate-mode', c.id);
      modeBtn.addEventListener('click', () => { if (fp.mode === 'AUTO') { state.auto[c.id] = false; state.out[c.id] = Number.isFinite(fp.out) ? fp.out : 0.5; } else state.auto[c.id] = true; run(); });
      const spIn = input('number', Number.isFinite(fp.sp) ? fp.sp : '', { 'data-faceplate-sp': c.id, step: 'any', 'aria-label': t('loops.sp') + ' ' + c.id }); spIn.addEventListener('change', () => { if (spIn.value !== '') { state.sp[c.id] = Number(spIn.value); run(); } });
      const outIn = input('number', Number.isFinite(fp.out) ? +(fp.out * 100).toFixed(1) : '', { 'data-faceplate-out': c.id, step: 'any', 'aria-label': t('loops.out') + ' ' + c.id }); outIn.disabled = fp.mode === 'AUTO'; outIn.addEventListener('change', () => { state.out[c.id] = Math.max(0, Math.min(1, Number(outIn.value) / 100)); run(); });
      const bar = mk('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.25rem;align-items:center'; bar.append(modeBtn, mk('label', '', t('loops.sp') + ' '), spIn, mk('label', '', t('loops.out') + ' % '), outIn); card.append(bar);
      try { const sv = new d.defaultView.DOMParser().parseFromString(trendSvg(sim.t, { [c.pv]: pvSeries, ['OUT ' + c.id]: out }), 'image/svg+xml'); if (!sv.querySelector('parsererror')) { const box = mk('div'); box.style.cssText = 'max-height:14rem;overflow:auto'; box.append(d.importNode(sv.documentElement, true)); card.append(box); } } catch { /* the trend is optional */ }
      frag.append(card);
    }
    plates.replaceChildren(frag);
    msg.replaceChildren(...[mk('p', '', t('loops.done', { n: ctrls.length, steps: sim.steps })), ...probs.map((p) => mk('p', 'text-ink-2', p.text))]);
    return lastSim;
  }
  const runBtn = mk('button', 'btn-line btn-sm-cc', t('loops.run')); runBtn.type = 'button'; runBtn.setAttribute('data-loops-run', ''); runBtn.addEventListener('click', () => { state = { auto: {}, sp: {}, out: {} }; run(); });
  const redraw = mk('button', 'btn-line btn-sm-cc', t('loops.refresh')); redraw.type = 'button'; redraw.setAttribute('data-loops-refresh', ''); redraw.addEventListener('click', drawTable);
  specBox.value = JSON.stringify(spec(), null, 1);
  el.replaceChildren(mk('p', 'text-ink-2', t('loops.lede')), tbl, mk('p', '', t('loops.spec')), specBox, runBtn, redraw, msg, plates);
  drawTable();
  return { run, rows: rowsNow, plates: () => lastSim, refresh: drawTable, state: () => state };
}
