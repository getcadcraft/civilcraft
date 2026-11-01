/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc-ui.js — the process calculators' panel (0.8 Track CH, rule 41; lives in lib/process so CadCraft's P&ID add-on and BimCraft's Plant add-on carry the same one): one picker
 * over lib/process/calc.js, a JSON input the person edits, a results table, the Problems each run raises (published through `publish`) and CSV out. The engine is the host's synced
 * copy (./calc.js); this file is only the form. DOM text goes in through textContent; an engine's SVG (numbers only, made by our code) is parsed, never assigned as HTML.
 *   mountCalc(el, { t, publish, download, calc?, onRun?, drawingItems?, actions? })  →  { run(id, input), select(id), last(), sketch(), sketchReady() }
 *   onRun(id, input, result)   a host hook after every run (the P&ID add-on keeps the last inputs for PIDRELIEF)
 *   drawingItems()             → { items, toMetres } | null — the host's drawing, for "Sources from the drawing" (CH.17)
 *   actions                    host buttons: [{ id, label, show(calcId, last) → bool, run(last, parsedInput, calcId) }] (Plant adds "Add to the equipment table", "Put the zones in the model")
 * Buttons that only make sense for a result (site plan, TakeoffCraft pack) show only when the last result has the thing.
 */
import * as CALC from './calc.js';

export function mountCalc(el, { t, publish = () => {}, download = null, calc = CALC, onRun = null, drawingItems = null, actions = [] } = {}) {
  const d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const saved = {};                                                      // the person's edits survive switching calculators
  const sel = mk('select', 'select-cc'); sel.setAttribute('data-calc-pick', ''); sel.setAttribute('aria-label', t('calc.pick'));
  const groups = {};
  for (const c of calc.list()) { (groups[c.group] ||= []).push(c); }
  for (const [g, items] of Object.entries(groups)) {
    const og = d.createElement('optgroup'); og.label = t('calc.group.' + g);
    for (const c of items) { const o = d.createElement('option'); o.value = c.id; o.textContent = c.title + ' (' + c.rows.join(', ') + ')'; og.append(o); }
    sel.append(og);
  }
  sel.value = calc.list()[0].id;
  const ta = mk('textarea', 'form-control'); ta.setAttribute('data-calc-input', ''); ta.rows = 10; ta.spellcheck = false; ta.setAttribute('aria-label', t('calc.input'));
  ta.style.cssText = 'font-family:monospace;font-size:0.75rem;width:100%;margin:0.375rem 0';
  const pickSel = mk('select', 'select-cc'); pickSel.setAttribute('data-calc-option', ''); pickSel.setAttribute('aria-label', t('calc.option')); pickSel.hidden = true;   // a calculator with a list to choose from (CH.10 fittings)
  let pickOpts = [];
  async function loadPicker() {
    pickSel.hidden = true; pickOpts = [];
    if (typeof calc.pickerOf !== 'function' || !calc.get(sel.value) || !calc.get(sel.value).picker) return;
    const id = sel.value, opts = await calc.pickerOf(id); if (!opts || id !== sel.value) return;
    pickOpts = opts; pickSel.replaceChildren(...[{ label: t('calc.option.pick') }, ...opts].map((o, k) => { const op = d.createElement('option'); op.value = k ? String(k - 1) : ''; op.textContent = o.label; return op; })); pickSel.value = ''; pickSel.hidden = false;
  }
  pickSel.addEventListener('change', () => {
    const o = pickOpts[Number(pickSel.value)]; if (!o || pickSel.value === '') return;
    let cur = {}; try { cur = JSON.parse(ta.value); } catch { /* start from the sample */ }
    ta.value = JSON.stringify({ ...cur, ...o.set }, null, 1); saved[sel.value] = ta.value; run().catch((e) => out.replaceChildren(mk('p', 'text-danger', String(e && e.message || e))));
  });
  const bar = mk('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.25rem';
  const btn = (key, a, b2) => { const fn = typeof a === 'function' ? a : b2, b = mk('button', 'btn-line btn-sm-cc', typeof a === 'function' ? t(key) : a); b.type = 'button'; b.setAttribute('data-calc', key); b.style.cssText = 'font-size:0.8125rem;padding:0.125rem 0.5rem'; b.addEventListener('click', fn); bar.append(b); return b; };   // btn(key, onClick) takes its label from the words; btn(key, label, onClick) brings its own
  const out = mk('div'); out.setAttribute('data-calc-out', ''); out.setAttribute('aria-live', 'polite');
  const sketchBox = mk('div'); sketchBox.setAttribute('data-calc-sketch', ''); sketchBox.hidden = true; sketchBox.style.cssText = 'margin:0.375rem 0';    // the structure editor (CH.24), mounted the first time the Structure calculator is picked
  let last = null, sketchApi = null;
  async function showSketch(on) {
    sketchBox.hidden = !on;
    if (!on || sketchApi || sketchBox.dataset.loading) return;
    sketchBox.dataset.loading = '1';
    try {
      const [{ mountSketch }, mol] = await Promise.all([import('./sketch-ui.js'), import('./env/molsketch.js')]);
      sketchApi = mountSketch(sketchBox, { t, mol, onUse: ({ smiles }) => { let o = {}; try { o = JSON.parse(ta.value); } catch { /* start again from the sample */ } o.smiles = smiles; ta.value = JSON.stringify(o, null, 1); saved[sel.value] = ta.value; } });
      sketchBox.sketchApi = sketchApi;
      try { const o = JSON.parse(ta.value); if (o.smiles && mol.fromSmiles) sketchApi.setSketch(mol.fromSmiles(o.smiles)); } catch { /* an empty canvas is fine */ }
    } catch (e) { sketchBox.textContent = String(e && e.message || e); }
    delete sketchBox.dataset.loading;
  }
  const sample = (id) => JSON.stringify(calc.get(id).input, null, 1);
  const load = () => { ta.value = saved[sel.value] ?? sample(sel.value); out.replaceChildren(); last = null; showSketch(sel.value === 'structure'); };
  sel.addEventListener('change', () => { load(); loadPicker(); });
  ta.addEventListener('input', () => { saved[sel.value] = ta.value; });

  async function run(id = sel.value, input) {
    if (id !== sel.value) { sel.value = id; load(); }
    let parsed = input;
    if (parsed === undefined) { try { parsed = JSON.parse(ta.value); } catch (e) { out.replaceChildren(mk('p', 'text-danger', t('calc.badjson', { why: String(e.message).slice(0, 120) }))); return null; } }
    out.replaceChildren(mk('p', '', t('calc.running')));
    const r = await calc.run(id, parsed); last = r;
    if (onRun) { try { onRun(id, parsed, r); } catch { /* a host hook must not stop the panel */ } }
    const frag = d.createDocumentFragment();
    if (r.lines.length) {
      const tb = mk('table', 'table-cc'); tb.style.cssText = 'font-size:0.75rem;width:100%';
      for (const l of r.lines) { const tr = d.createElement('tr'); tr.append(mk('td', '', String(l.k)), mk('td', 'tabular', String(l.v) + (l.u ? ' ' + l.u : ''))); tb.append(tr); }
      frag.append(tb);
    }
    if (r.text) { const pre = mk('pre', '', r.text); pre.style.cssText = 'font-size:0.6875rem;max-height:10rem;overflow:auto'; frag.append(pre); }
    if (r.svg) {
      try { const doc = new d.defaultView.DOMParser().parseFromString(r.svg, 'image/svg+xml'); if (!doc.querySelector('parsererror')) { const box = mk('div'); box.style.cssText = 'max-height:14rem;overflow:auto'; box.append(d.importNode(doc.documentElement, true)); frag.append(box); } } catch { /* a drawing is optional */ }
    }
    if (r.problems.length) {
      const ul = mk('ul', 'meta-items'); ul.setAttribute('data-calc-problems', '');
      for (const p of r.problems) ul.append(mk('li', '', t('calc.level.' + (p.severity === 'error' ? 'error' : p.severity === 'warning' ? 'warning' : 'info')) + ': ' + p.text));
      frag.append(ul);
    } else if (r.ok) frag.append(mk('p', 'text-ink-2', t('calc.clean')));
    out.replaceChildren(frag);
    publish(r.problems.map((p, i) => ({ code: p.code || 'process.note', severity: p.severity === 'error' ? 'error' : p.severity === 'warning' ? 'warning' : 'info', text: p.text, about: [{ kind: 'calc', id: id + ':' + (i + 1), label: calc.get(id).title }] })));
    refreshButtons();
    return r;
  }
  btn('calc.run', () => { run().catch((e) => out.replaceChildren(mk('p', 'text-danger', String(e && e.message || e)))); });
  btn('calc.reset', () => { delete saved[sel.value]; load(); });
  const dl = (name, text, mime) => { if (download) { download(name, text, mime); return; } const w = d.defaultView, a = d.createElement('a'); a.href = w.URL.createObjectURL(new w.Blob([text], { type: mime })); a.download = name; a.click(); setTimeout(() => w.URL.revokeObjectURL(a.href), 1000); };
  btn('calc.csv', () => { if (!last || !last.lines.length) return; dl(sel.value + '.csv', '\uFEFF' + calc.toCsv(last.lines), 'text/csv'); });
  const bSite = btn('calc.site', () => { if (last && last.geojson) dl(sel.value + '-site-plan.geojson', last.geojson, 'application/geo+json'); });                 // CH.16: zones for CivilCraft's site plan (Import)
  const bDxf = btn('calc.sitedxf', () => { if (last && last.dxf) dl(sel.value + '-site-plan.dxf', last.dxf, 'application/dxf'); });
  const bTk = btn('calc.takeoff', () => { if (last && last.text && sel.value === 'cost') dl('process-estimate.ccpack.json', last.text, 'application/json'); });        // CH.23: TakeoffCraft pack
  const bDraw = btn('calc.drawing', () => {                                                                                                                              // CH.17: sources from the drawing
    const got = drawingItems && drawingItems(); if (!got) return;
    let o = {}; try { o = JSON.parse(ta.value); } catch { /* start from the sample */ }
    o.pidItems = got.items; o.toMetres = got.toMetres; ta.value = JSON.stringify(o, null, 1); saved[sel.value] = ta.value;
  });
  // host buttons
  const hostBtns = (actions || []).map((a) => { const b = btn('calc.act.' + a.id, a.label, () => {
    try {
      const cur = (() => { try { return JSON.parse(ta.value); } catch { return {}; } })(), r = a.run(last, cur, sel.value);
      if (r && typeof r === 'object' && r.merge) { ta.value = JSON.stringify({ ...cur, ...r.merge }, null, 1); saved[sel.value] = ta.value; }     // an action may fill the input (Plant: the pipe run)
      if (r && typeof r === 'object' && r.say) out.replaceChildren(mk('p', '', String(r.say)));
    } catch (e) { out.append(mk('p', 'text-danger', String(e && e.message || e))); }
  }); b.hidden = true; return [a, b]; });
  const refreshButtons = () => {
    for (const [a, b] of hostBtns) b.hidden = !(a.show ? a.show(sel.value, last) : true);
    bSite.hidden = bDxf.hidden = !(last && last.geojson);
    bTk.hidden = !(last && last.text && sel.value === 'cost' && /takeoffcraft-pack/.test(last.text));
    bDraw.hidden = !(drawingItems && sel.value === 'area');
  };
  sel.addEventListener('change', refreshButtons);
  el.replaceChildren(mk('p', 'text-ink-2', t('calc.lede')), sel, pickSel, ta, sketchBox, bar, out);
  load(); refreshButtons(); loadPicker();
  return { run, select: (id) => { sel.value = id; load(); refreshButtons(); loadPicker(); }, last: () => last, sketch: () => sketchApi, sketchReady: () => (sketchApi ? Promise.resolve(sketchApi) : new Promise((ok) => { const w = () => (sketchApi ? ok(sketchApi) : setTimeout(w, 20)); w(); })) };
}
