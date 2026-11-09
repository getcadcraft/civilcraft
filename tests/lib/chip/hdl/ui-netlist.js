/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Chip design add-on — Netlist panel (0.9 HD.2): pick a Verilog module, see its netlist as a schematic (lib/schematic underneath),
 * zoom/pan, click a wire to light its net, click a box to jump to its line, save the picture (SVG) or the netlist (JSON).
 *
 *   panels(ctx) → [{id:'chip-netlist', title, mount(el, ctx)}]
 *   ctx adds to the Source panel's: schematic (the cc-schematic module namespace) or schematicUrl (where to import it from); without
 *   either the drawing uses its own connectivity and the engine's checks are skipped. cellLibrary?() → {type: {pins: {pin: dir}}} (HD.3).
 * DOM-light: netlistView() is the DOM-free part.
 */
import { sessionFor } from './session.js';
import { buildNetlist, netlistStats } from './netlist.js';
import { layoutNetlist, renderSvg, checkWithEngine } from './schem.js';
import { tr, h, ensureCss, reveal } from './ui-source.js';
import { sortRows } from './problems.js';

export const NET_SOURCE = 'netlist';

/** Everything the panel shows for one module, without a DOM: {netlist, layout, svg, problems, stats}. */
export function netlistView(modules, name, opts = {}) {
  const nl = buildNetlist(modules, name, { cells: opts.cells || {} });
  let problems = nl.problems;
  if (opts.schematic) {
    // the engine's checks repeat ours for drivers; keep ours and add only what the engine found that we did not
    const eng = checkWithEngine(nl, opts.schematic).problems;
    const have = new Set(problems.map((p) => p.code + '|' + p.msg.vars.net));
    problems = sortRows([...problems, ...eng.filter((p) => !have.has(p.code + '|' + p.msg.vars.net))]);
  }
  const layout = layoutNetlist(nl, opts.schematic || null);
  const svg = renderSvg(layout, { highlight: opts.highlight, title: name, tooBigText: opts.tooBigText });
  return { netlist: { ...nl, problems }, layout, svg, problems, stats: netlistStats(nl) };
}

function mountNetlist(el, ctx) {
  const doc = el.ownerDocument, ses = sessionFor(ctx), T = (k, v) => tr(ctx, k, v);
  ensureCss(doc);
  const modSel = h(doc, 'select', { 'aria-label': T('chip.net.module') });
  const btn = (k, fn) => h(doc, 'button', { type: 'button', text: T(k), onclick: fn });
  const info = h(doc, 'div', { class: 'chip-sum', role: 'status' });
  const view = h(doc, 'div', { class: 'chip-net-view', style: 'flex:1 1 auto;min-height:240px;overflow:hidden;border:1px solid var(--ws-line,#bbb);cursor:grab;touch-action:none;background:var(--chip-bg,#fff)' });
  const list = h(doc, 'ul', { class: 'chip-list' });
  let cur = null, vb = null, highlight = null;
  let S = ctx.schematic || null;                               // the cc-schematic module: given, or loaded from ctx.schematicUrl
  if (!S && ctx.schematicUrl) import(ctx.schematicUrl).then((m) => { S = m; if (modSel.value) draw(); }).catch(() => { /* drawn without the engine */ });
  // option values: "src|<module>" for project sources, "out|<file>|<module>" for files the tool runs wrote (a synthesized netlist)
  const pick = () => {
    const v = modSel.value || '';
    if (v.startsWith('out|')) { const i = v.lastIndexOf('|'), file = v.slice(4, i), o = (ses.result.outputs || []).find((x) => x.file === file); return { name: v.slice(i + 1), modules: o ? o.modules : [], label: v.slice(i + 1) }; }
    return { name: v.slice(4), modules: ses.result.modules, label: v.slice(4) };
  };
  const draw = () => {
    const { name, modules } = pick();
    if (!name) { view.replaceChildren(h(doc, 'div', { class: 'chip-empty', text: T('chip.net.none') })); info.textContent = ses.result.modules.some((m) => m.lang === 'vhdl') ? T('chip.net.vhdlNote') : ''; list.replaceChildren(); return; }
    cur = netlistView(modules, name, { schematic: S, cells: ctx.cellLibrary ? ctx.cellLibrary() : {}, highlight, tooBigText: T('chip.net.tooBig', { n: 0 }) });
    view.innerHTML = cur.svg;                                   // our own SVG text: every string in it went through esc()
    const svg = view.querySelector('svg');
    if (svg) { svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = '100%'; if (vb) svg.setAttribute('viewBox', vb.join(' ')); }
    const s = cur.stats;
    info.textContent = T('chip.net.stats', { cells: s.cells, nets: s.nets, ports: s.ports }) + (cur.layout.selfLoops ? ' ' + T('chip.net.loops', { n: cur.layout.selfLoops }) : '') + (highlight ? ' ' + netInfo(highlight) : '');
    list.replaceChildren(...cur.problems.slice(0, 300).map((r) => h(doc, 'li', { onclick: () => reveal(ctx, r.file, r.line, r.col) }, h(doc, 'span', { class: 'chip-sev ' + r.severity, text: T('chip.src.sev.' + r.severity) }), ' ', r.line ? r.file + ':' + r.line + ' ' : '', T(r.msg.key, r.msg.vars))));
    if (ctx.problems && ctx.problems.set) ctx.problems.set(NET_SOURCE, cur.problems);
  };
  const netInfo = (id) => { const n = cur && cur.netlist.nets.find((x) => x.id === id); return n ? T('chip.net.net', { name: n.name, pins: n.pins.length }) : ''; };
  const fillMods = () => {
    const opts = ses.result.modules.filter((m) => m.lang === 'verilog').map((m) => ({ value: 'src|' + m.name, text: m.name })).sort((a, b) => (a.text < b.text ? -1 : 1));
    for (const o of ses.result.outputs || []) for (const m of o.modules) opts.push({ value: 'out|' + o.file + '|' + m.name, text: m.name + ' (' + o.file + ')' });
    const values = opts.map((o) => o.value), top = ses.result.hier && 'src|' + ses.result.hier.top;
    const keep = values.includes(modSel.value) ? modSel.value : values.includes(top) ? top : values[0] || '';
    modSel.replaceChildren(...opts.map((o) => h(doc, 'option', { value: o.value, text: o.text, selected: o.value === keep })));
    modSel.value = keep;
  };
  const zoom = (f, cx = 0.5, cy = 0.5) => {
    const svg = view.querySelector('svg'); if (!svg) return;
    const b = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/).map(Number);
    const nw = b[2] * f, nh = b[3] * f;
    vb = [b[0] + (b[2] - nw) * cx, b[1] + (b[3] - nh) * cy, nw, nh]; svg.setAttribute('viewBox', vb.join(' '));
  };
  const fit = () => { vb = null; draw(); };
  const save = async (kind) => {
    if (!cur) return;
    const name = pick().name + (kind === 'svg' ? '.schematic.svg' : '.netlist.json');
    const svgFull = renderSvg(cur.layout, { title: pick().name });
    await ctx.files.write(name, kind === 'svg' ? svgFull : JSON.stringify(cur.netlist, null, 1));
    info.textContent = T('chip.net.saved', { name });
  };
  view.addEventListener('wheel', (e) => { e.preventDefault(); const r = view.getBoundingClientRect(); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); }, { passive: false });
  let drag = null;
  view.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: false }; });
  view.addEventListener('pointermove', (e) => {
    if (!drag) return; const svg = view.querySelector('svg'); if (!svg) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; if (!drag.moved) return;
    const b = svg.getAttribute('viewBox').split(/\s+/).map(Number), r = view.getBoundingClientRect();
    vb = [b[0] - dx * b[2] / r.width, b[1] - dy * b[3] / r.height, b[2], b[3]]; svg.setAttribute('viewBox', vb.join(' '));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  view.addEventListener('pointerup', (e) => {
    const was = drag; drag = null; if (was && was.moved) return;
    const w = e.target.closest && e.target.closest('[data-net]'), c = e.target.closest && e.target.closest('[data-cell]');
    if (w) { highlight = highlight === w.getAttribute('data-net') ? null : w.getAttribute('data-net'); draw(); return; }
    if (c && cur) { const cell = cur.netlist.cells.find((x) => x.id === c.getAttribute('data-cell')); if (cell) { info.textContent = T('chip.net.cell', { name: cell.name, type: cell.type, file: cell.file, line: cell.line }); reveal(ctx, cell.file, cell.line, cell.col); } }
  });
  modSel.addEventListener('change', () => { vb = null; highlight = null; draw(); });
  el.replaceChildren(h(doc, 'div', { class: 'chip-src' },
    h(doc, 'div', { class: 'chip-bar' }, h(doc, 'label', {}, T('chip.net.module') + ' ', modSel), btn('chip.net.draw', fit), btn('chip.net.zoomIn', () => zoom(1 / 1.3)), btn('chip.net.zoomOut', () => zoom(1.3)), btn('chip.net.fit', fit), btn('chip.net.saveSvg', () => save('svg')), btn('chip.net.saveJson', () => save('json'))),
    info, view, list));
  const off = ses.on('checked', () => { fillMods(); draw(); });
  if (!ses.loaded) ses.load(); else { fillMods(); draw(); }
  return { refresh: () => ses.load(), destroy: () => { off(); el.replaceChildren(); } };
}

export function panels(ctx) {
  return [{ id: 'chip-netlist', title: tr(ctx, 'chip.net.title'), mount: (el, c = ctx) => mountNetlist(el, c) }];
}
