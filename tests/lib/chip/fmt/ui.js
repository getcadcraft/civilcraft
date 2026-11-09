/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui.js — the Chip design add-on's format panels. The host mounts them; nothing here reaches outside the element it is given.
 *
 *   panels(ctx) → [{ id, title, mount(el, ctx) }]
 *     ctx = { files: { list(), read(name), readBytes(name), write(name, data) }, problems: { set(source, rows) }, t(key, vars) }
 *     (list may return names or { name }; read / readBytes may return a value or a promise)
 *
 *   chip-layout       Layout: open a GDSII / OASIS file, layer list (show/hide, colour, counts), cell hierarchy (pick the top), a canvas
 *                     with pan (drag) and zoom (wheel), fit; load a layer map; save as GDSII or OASIS.
 *   chip-library      Library and floorplan: Liberty and LEF cells side by side; DEF floorplan (die, rows, cells, pins, wires).
 *   chip-constraints  Constraints and sign-off data: SDC list in plain words (checked against the DEF's pins), SPEF nets, SDF delays,
 *                     and a STIL test-pattern writer.
 */
import { openFile } from './open.js';
import { buildIndex, planView, fitView, zoomView } from './view.js';
import { writeGds } from './gds.js';
import { writeOasis } from './oasis.js';
import { readLayerMap, layerInfo, mapFromLayerNames } from './layermap.js';
import { defShapes } from './def.js';
import { writeStil } from './stil.js';
import { layerRows, hierarchyRows, defaultTop, libraryRows, constraintRows, parasiticRows, delayRows, stilSignals, parseVectors } from './panels-model.js';
import { checkSdc } from './sdc.js';
import { PATH, pathOutline } from './layout.js';

// ---------------------------------------------------------------- words
let EN = null;
async function loadEn() { if (EN) return EN; try { EN = await (await fetch(new URL('./strings.en.json', import.meta.url))).json(); } catch { EN = {}; } return EN; }
export function words(ctx) {
  return (k, vars) => { let s = ctx?.t ? ctx.t(k, vars) : undefined; if (!s || s === k) s = EN?.[k] ?? k; if (vars) s = s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] !== undefined ? String(vars[v]) : m)); return s; };
}
const h = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (v === undefined || v === null || v === false) continue; if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v === true ? '' : v); } for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : String(c)); return e; };
const names = async (ctx) => (await ctx.files.list()).map((f) => (typeof f === 'string' ? f : f.name));
const bytesOf = async (ctx, n) => { if (ctx.files.readBytes) { const b = await ctx.files.readBytes(n); if (b) return b instanceof Uint8Array ? b : new Uint8Array(b); } const s = await ctx.files.read(n); return typeof s === 'string' ? new TextEncoder().encode(s) : new Uint8Array(s); };
const ext = (n) => (/\.([a-z0-9]+)$/i.exec(n)?.[1] || '').toLowerCase();
const fileSelect = (t, list, exts, onPick, label) => { const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, t('chip.fmt.pick')), ...list.filter((n) => exts.includes(ext(n))).map((n) => h('option', { value: n }, n))); sel.addEventListener('change', () => sel.value && onPick(sel.value)); return sel; };
const CSS = '.ccchip{font:inherit;display:flex;flex-direction:column;gap:.4rem;min-height:0}.ccchip .row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center}.ccchip canvas{width:100%;height:340px;border:1px solid var(--ws-line,#8884);background:var(--ws-panel-bg,#111);touch-action:none}.ccchip ul{list-style:none;margin:0;padding:0;max-height:180px;overflow:auto}.ccchip li{display:flex;gap:.35rem;align-items:center;padding:1px 0}.ccchip .sw{width:.8rem;height:.8rem;border-radius:2px;display:inline-block}.ccchip .muted{opacity:.7;font-size:.9em}.ccchip table{border-collapse:collapse;font-size:.9em;width:100%}.ccchip td,.ccchip th{padding:1px 4px;text-align:left;border-bottom:1px solid var(--ws-line,#8883)}.ccchip textarea{width:100%;min-height:5rem;font-family:monospace}.ccchip details{border-top:1px solid var(--ws-line,#8883);padding-top:.3rem}';
function shell(el, cls) { el.replaceChildren(); const root = h('div', { class: 'ccchip ' + cls }); if (!document.getElementById('ccchip-css')) document.head.append(h('style', { id: 'ccchip-css' }, CSS)); el.append(root); return root; }

// ---------------------------------------------------------------- layout canvas painting
function paintLayout(cv, st) {
  const g = cv.getContext('2d'), W = cv.width, H = cv.height, v = st.view; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  if (!st.index) return null;
  const t0 = performance.now(), plan = planView(st.index, st.top, v, { minPx: 4, tinyPx: 0.4 });
  const base = [v.scale, 0, 0, -v.scale, -v.x0 * v.scale, v.y1 * v.scale]; // database units → pixels, y up
  const cache = st.cache; g.globalAlpha = 0.55;
  const pathFor = (cell, layerKey, idx) => {
    const c = st.lib.cells[cell], S = c.shapes, key = cell + '|' + layerKey;
    if (!idx && cache.has(key)) return cache.get(key);
    const p = new Path2D(), [L, D] = layerKey.split('/').map(Number), each = idx || { length: S.n };
    for (let q = 0; q < each.length; q++) { const i = idx ? idx[q] : q; if (S.layer[i] !== L || S.dt[i] !== D) continue; if (S.kind[i] === PATH) { const o = pathOutline(S.get(i)); if (o.length < 3) continue; p.moveTo(o[0][0], o[0][1]); for (let k = 1; k < o.length; k++) p.lineTo(o[k][0], o[k][1]); p.closePath(); continue; } const xy = S.coords(i); p.moveTo(xy[0], xy[1]); for (let k = 2; k < xy.length; k += 2) p.lineTo(xy[k], xy[k + 1]); p.closePath(); }
    if (!idx) cache.set(key, p); return p;
  };
  for (const row of st.layers) {
    if (!st.hidden.has(row.key)) {
      g.fillStyle = row.color; g.strokeStyle = row.color;
      for (const d of plan.draws) {
        if (!st.cellLayers.get(d.cell)?.has(row.key)) continue;
        const m = d.m, M = [base[0] * m[0] + base[2] * m[1], base[1] * m[0] + base[3] * m[1], base[0] * m[2] + base[2] * m[3], base[1] * m[2] + base[3] * m[3], base[0] * m[4] + base[2] * m[5] + base[4], base[1] * m[4] + base[3] * m[5] + base[5]];
        g.setTransform(...M); const p = pathFor(d.cell, row.key, d.idx); g.fill(p);
      }
    }
  }
  for (const d of plan.density) { const m = d.m; g.setTransform(base[0] * m[0] + base[2] * m[1], base[1] * m[0] + base[3] * m[1], base[0] * m[2] + base[2] * m[3], base[1] * m[2] + base[3] * m[3], base[0] * m[4] + base[2] * m[5] + base[4], base[1] * m[4] + base[3] * m[5] + base[5]); g.fillStyle = '#7f8c99'; for (const b of d.bins) { g.globalAlpha = 0.15 + 0.7 * b[4] / (d.max || 1); g.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]); } }
  g.globalAlpha = 0.9; g.strokeStyle = '#9aa4b1'; g.lineWidth = 1;
  for (const b of plan.boxes) { const m = b.m; g.setTransform(1, 0, 0, 1, 0, 0); const pts = [[b.box[0], b.box[1]], [b.box[2], b.box[1]], [b.box[2], b.box[3]], [b.box[0], b.box[3]]].map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]).map(([x, y]) => [(x - v.x0) * v.scale, (v.y1 - y) * v.scale]); g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.closePath(); g.stroke(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  return { ...plan.stats, boxes: plan.boxes.length + plan.stats.density, ms: Math.round(performance.now() - t0) };
}

// ---------------------------------------------------------------- panel 1: layout
async function mountLayout(el, ctx) {
  await loadEn(); const t = words(ctx), root = shell(el, 'ccchip-layout');
  const st = { lib: null, index: null, top: null, view: null, map: null, hidden: new Set(), open: new Set(), cache: new Map(), cellLayers: new Map(), layers: [], file: '' };
  const list = await names(ctx);
  const status = h('div', { class: 'muted', role: 'status' }, t('chip.lay.empty'));
  const cv = h('canvas', { width: 800, height: 340, 'aria-label': t('chip.lay.canvas') });
  const layerList = h('ul', { 'aria-label': t('chip.lay.layers') }), hierList = h('ul', { 'aria-label': t('chip.lay.hierarchy') });
  const draw = () => { if (!st.index) return; const r = paintLayout(cv, st); if (r) status.textContent = t('chip.lay.drawn', { shapes: r.shapes, inst: r.instances, boxes: r.boxes, tiny: r.tiny, ms: r.ms }) + (r.truncated ? ' ' + t('chip.lay.truncated') : ''); };
  const fit = () => { if (!st.index) return; const r = cv.getBoundingClientRect(); cv.width = Math.max(200, Math.round(r.width || 800)); cv.height = Math.max(150, Math.round(r.height || 340)); st.view = fitView(st.index, st.top, cv.width, cv.height); draw(); };
  const renderLayers = () => {
    st.layers = layerRows(st.lib, st.map, st.top);
    layerList.replaceChildren(...st.layers.map((r) => h('li', {}, h('input', { type: 'checkbox', checked: !st.hidden.has(r.key), 'aria-label': r.name, onchange: (e) => { if (e.target.checked) st.hidden.delete(r.key); else st.hidden.add(r.key); draw(); } }), h('span', { class: 'sw', style: 'background:' + r.color }), h('span', {}, r.name), h('span', { class: 'muted' }, r.key + ' · ' + t('chip.lay.counts', { stored: r.stored, flat: r.flat })))));
  };
  const renderHier = () => {
    hierList.replaceChildren(...hierarchyRows(st.lib, st.top, st.open).map((r) => h('li', { style: 'padding-left:' + r.depth + 'rem' },
      r.kids ? h('button', { type: 'button', 'aria-expanded': r.open ? 'true' : 'false', 'aria-label': (r.open ? t('chip.lay.close') : t('chip.lay.open')) + ' ' + r.name, onclick: () => { if (st.open.has(r.path)) st.open.delete(r.path); else st.open.add(r.path); renderHier(); } }, r.open ? '−' : '+') : h('span', { style: 'width:1.2rem' }),
      h('button', { type: 'button', class: 'linkish', onclick: () => { st.top = r.name; st.open = new Set([r.name]); renderLayers(); renderHier(); fit(); } }, r.name), h('span', { class: 'muted' }, r.depth ? '×' + r.placed : t('chip.lay.top')), r.loop ? h('span', { class: 'muted' }, t('chip.lay.loop')) : null)));
  };
  const open = async (n) => {
    status.textContent = t('chip.lay.reading', { name: n }); const b = await bytesOf(ctx, n); const t0 = performance.now(), r = openFile(n, b);
    ctx.problems?.set('chip.fmt.layout', r.problems);
    if (!r.model || !(r.kind === 'gds' || r.kind === 'oasis')) { status.textContent = t('chip.lay.notlayout'); return; }
    st.lib = r.model; st.file = n; st.cache.clear(); st.index = buildIndex(st.lib); st.top = defaultTop(st.lib); st.open = new Set([st.top]);
    if (!st.map && st.lib.layerNames) st.map = mapFromLayerNames(st.lib.layerNames);
    st.cellLayers = new Map(st.lib.order.map((c) => { const S = st.lib.cells[c].shapes, s = new Set(); for (let i = 0; i < S.n; i++) s.add(S.layer[i] + '/' + S.dt[i]); return [c, s]; }));
    renderLayers(); renderHier(); fit(); status.textContent = t('chip.lay.read', { name: n, cells: st.lib.order.length, ms: Math.round(performance.now() - t0) }) + ' ' + status.textContent;
  };
  const loadMap = async (n) => { const r = readLayerMap(await ctx.files.read(n)); ctx.problems?.set('chip.fmt.layermap', r.problems); if (r.map) { st.map = r.map; if (st.lib) { renderLayers(); draw(); } } };
  const save = async (kind) => { if (!st.lib) return; const probs = [], base = (st.file || 'layout').replace(/\.[^.]+$/, ''), name = base + (kind === 'gds' ? '.gds' : '.oas'); const data = kind === 'gds' ? writeGds(st.lib, { problems: probs }) : writeOasis(st.lib, { problems: probs }); await ctx.files.write(name, data); ctx.problems?.set('chip.fmt.write', probs); status.textContent = t('chip.lay.saved', { name, bytes: data.length }); };
  // pan and zoom
  let drag = null;
  cv.addEventListener('pointerdown', (e) => { if (!st.view) return; drag = { x: e.clientX, y: e.clientY, v: st.view }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => { if (!drag) return; const k = cv.width / cv.getBoundingClientRect().width / drag.v.scale, dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k; st.view = { ...drag.v, x0: drag.v.x0 - dx, x1: drag.v.x1 - dx, y0: drag.v.y0 + dy, y1: drag.v.y1 + dy }; draw(); });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('wheel', (e) => { if (!st.view) return; e.preventDefault(); const r = cv.getBoundingClientRect(), px = st.view.x0 + (e.clientX - r.left) / r.width * (st.view.x1 - st.view.x0), py = st.view.y1 - (e.clientY - r.top) / r.height * (st.view.y1 - st.view.y0); st.view = zoomView(st.view, e.deltaY < 0 ? 1.25 : 0.8, px, py); draw(); }, { passive: false });
  root.append(
    h('div', { class: 'row' }, fileSelect(t, list, ['gds', 'gds2', 'gdsii', 'oas', 'oasis'], open, t('chip.lay.file')), fileSelect(t, list, ['map', 'json', 'layermap', 'lyrmap'], loadMap, t('chip.lay.map')),
      h('button', { type: 'button', onclick: fit }, t('chip.lay.fit')), h('button', { type: 'button', onclick: () => save('gds') }, t('chip.lay.savegds')), h('button', { type: 'button', onclick: () => save('oasis') }, t('chip.lay.saveoas'))),
    cv, status,
    h('details', { open: true }, h('summary', {}, t('chip.lay.layers')), layerList),
    h('details', { open: true }, h('summary', {}, t('chip.lay.hierarchy')), hierList));
  root._chip = { open, st, fit, draw }; // for tests in the host page
}

// ---------------------------------------------------------------- panel 2: library and floorplan
async function mountLibrary(el, ctx) {
  await loadEn(); const t = words(ctx), root = shell(el, 'ccchip-library'), list = await names(ctx);
  const st = { liberty: null, lef: null, def: null }, table = h('div'), cv = h('canvas', { width: 800, height: 340, 'aria-label': t('chip.fmt.floorplan') }), status = h('div', { class: 'muted', role: 'status' }, t('chip.fmt.libempty'));
  const probs = {};
  const show = () => {
    const rows = libraryRows(st.liberty, st.lef);
    table.replaceChildren(rows.length ? h('table', {}, h('thead', {}, h('tr', {}, ...['chip.fmt.col.cell', 'chip.fmt.col.area', 'chip.fmt.col.size', 'chip.fmt.col.leak', 'chip.fmt.col.pins', 'chip.fmt.col.arcs'].map((k) => h('th', {}, t(k))))),
      h('tbody', {}, ...rows.map((r) => h('tr', {}, h('td', {}, r.name + (r.seq ? ' (' + r.seq + ')' : '')), h('td', {}, r.area ?? ''), h('td', {}, r.size ? r.size[0] + ' × ' + r.size[1] : ''), h('td', {}, r.leakage ?? ''), h('td', {}, (r.pins || []).join(', ')), h('td', {}, r.arcs ?? ''))))) : '');
    paintFloor();
  };
  const paintFloor = () => {
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); if (!st.def) return;
    const s = defShapes(st.def, st.lef), die = s.die || [[0, 0], [1, 0], [1, 1], [0, 1]], xs = die.map((p) => p[0]), ys = die.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const k = Math.min(cv.width / (x1 - x0), cv.height / (y1 - y0)) * 0.94, ox = (cv.width - (x1 - x0) * k) / 2, oy = (cv.height - (y1 - y0) * k) / 2, X = (x) => ox + (x - x0) * k, Y = (y) => cv.height - oy - (y - y0) * k;
    const rect = (b, fill, stroke) => { g.beginPath(); g.rect(X(b[0]), Y(b[3]), (b[2] - b[0]) * k, (b[3] - b[1]) * k); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.stroke(); } };
    g.lineWidth = 1; g.beginPath(); die.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.closePath(); g.strokeStyle = '#9aa4b1'; g.stroke();
    for (const r of s.rows) rect(r.box, null, '#5a6470');
    for (const c of s.cells) rect(c.box, c.status === 'FIXED' ? '#c0392b55' : '#2e6fd155', '#2e6fd1');
    for (const w of s.wires) { g.strokeStyle = w.special ? '#d4a017' : '#27ae60'; g.lineWidth = Math.max(1, w.width * k); g.beginPath(); g.moveTo(X(w.a[0]), Y(w.a[1])); g.lineTo(X(w.b[0]), Y(w.b[1])); g.stroke(); }
    for (const p of s.pins) rect(p.box, '#8e44ad', null);
    status.textContent = t('chip.fmt.floorinfo', { cells: s.cells.length, wires: s.wires.length, pins: s.pins.length, unknown: s.unknownMacros });
  };
  const open = async (n) => { const r = openFile(n, await ctx.files.read(n)); probs[r.kind || 'x'] = r.problems; ctx.problems?.set('chip.fmt.library', Object.values(probs).flat()); if (r.kind === 'liberty') st.liberty = r.model; else if (r.kind === 'lef') st.lef = r.model; else if (r.kind === 'def') st.def = r.model; else { status.textContent = t('chip.fmt.notlib'); return; } status.textContent = t('chip.fmt.opened', { name: n }); show(); };
  root.append(h('div', { class: 'row' }, fileSelect(t, list, ['lib', 'lef', 'tlef', 'def'], open, t('chip.fmt.libfile'))), status, table, cv);
  root._chip = { open, st };
}

// ---------------------------------------------------------------- panel 3: constraints, parasitics, delays, patterns
async function mountConstraints(el, ctx) {
  await loadEn(); const t = words(ctx), root = shell(el, 'ccchip-constraints'), list = await names(ctx);
  const st = { sdc: null, def: null, spef: null, sdf: null }, out = h('div'), status = h('div', { class: 'muted', role: 'status' }, t('chip.fmt.conempty'));
  const probs = {};
  const show = () => {
    const parts = [];
    if (st.sdc) { const rows = constraintRows(st.sdc, t); parts.push(h('h4', {}, t('chip.fmt.sdc.title')), h('ul', { 'aria-label': t('chip.fmt.sdc.title') }, ...rows.map((r) => h('li', {}, h('span', { class: 'muted' }, r.line ? t('chip.fmt.line', { n: r.line }) : ''), r.text)))); }
    if (st.spef) parts.push(h('h4', {}, t('chip.fmt.spef.title')), h('table', {}, h('tr', {}, ...['chip.fmt.col.net', 'chip.fmt.col.total', 'chip.fmt.col.ground', 'chip.fmt.col.coupling', 'chip.fmt.col.res', 'chip.fmt.col.nodes'].map((k) => h('th', {}, t(k)))), ...parasiticRows(st.spef).map((r) => h('tr', {}, h('td', {}, r.name), h('td', {}, r.total), h('td', {}, +r.ground.toPrecision(6)), h('td', {}, +r.coupling.toPrecision(6)), h('td', {}, +r.resistance.toPrecision(6)), h('td', {}, r.nodes)))));
    if (st.sdf) parts.push(h('h4', {}, t('chip.fmt.sdf.title')), h('table', {}, h('tr', {}, ...['chip.fmt.col.inst', 'chip.fmt.col.kind', 'chip.fmt.col.from', 'chip.fmt.col.to', 'chip.fmt.col.rise', 'chip.fmt.col.fall'].map((k) => h('th', {}, t(k)))), ...delayRows(st.sdf, 'typ').map((r) => h('tr', {}, h('td', {}, r.instance || '—'), h('td', {}, r.kind + (r.mode === 'INCREMENT' ? ' +' : '')), h('td', {}, (r.edge ? r.edge + ' ' : '') + (r.from ?? '')), h('td', {}, r.to), h('td', {}, r.rise ?? ''), h('td', {}, r.fall ?? '')))));
    out.replaceChildren(...parts);
  };
  const recheck = () => { const extra = st.sdc && st.def ? checkSdc(st.sdc, { ports: st.def.pins.map((p) => p.name) }) : []; ctx.problems?.set('chip.fmt.constraints', [...Object.values(probs).flat(), ...extra]); };
  const open = async (n) => { const r = openFile(n, await ctx.files.read(n)); probs[r.kind || 'x'] = r.problems; if (r.kind === 'sdc') st.sdc = r.model; else if (r.kind === 'def') st.def = r.model; else if (r.kind === 'spef') st.spef = r.model; else if (r.kind === 'sdf') st.sdf = r.model; else { status.textContent = t('chip.fmt.notcon'); return; } recheck(); status.textContent = t('chip.fmt.opened', { name: n }); show(); };
  // STIL writer
  const vec = h('textarea', { 'aria-label': t('chip.fmt.stil.vectors'), placeholder: t('chip.fmt.stil.hint') }), per = h('input', { type: 'number', value: '100', min: '1', step: 'any', 'aria-label': t('chip.fmt.stil.period') }), strobe = h('input', { type: 'number', value: '90', min: '0', step: 'any', 'aria-label': t('chip.fmt.stil.strobe') });
  const sigInfo = h('div', { class: 'muted' });
  const sigs = () => { const s = stilSignals({ def: st.def, sdc: st.sdc }); sigInfo.textContent = s.signals.length ? t('chip.fmt.stil.order', { list: s.signals.map((x) => x.name + (x.clock ? '~' : '')).join(' ') }) : t('chip.fmt.stil.nosig'); return s; };
  const writeIt = async () => { const s = sigs(); if (!s.signals.length) return; const r = writeStil({ title: st.def?.design || 'patterns', signals: s.signals, period: Number(per.value), drive: 0, strobe: Number(strobe.value), vectors: parseVectors(vec.value) }); ctx.problems?.set('chip.fmt.stil', r.problems); if (r.text && !r.problems.some((p) => p.severity === 'error')) { const name = (st.def?.design || 'patterns') + '.stil'; await ctx.files.write(name, r.text); status.textContent = t('chip.fmt.stil.saved', { name }); } else status.textContent = t('chip.fmt.stil.errors'); };
  root.append(h('div', { class: 'row' }, fileSelect(t, list, ['sdc', 'def', 'spef', 'sdf'], async (n) => { await open(n); sigs(); }, t('chip.fmt.confile'))), status, out,
    h('details', {}, h('summary', {}, t('chip.fmt.stil.title')), h('p', { class: 'muted' }, t('chip.fmt.stil.about')), sigInfo,
      h('div', { class: 'row' }, h('label', {}, t('chip.fmt.stil.period'), ' ', per), h('label', {}, t('chip.fmt.stil.strobe'), ' ', strobe)), vec, h('button', { type: 'button', onclick: writeIt }, t('chip.fmt.stil.write'))));
  root._chip = { open, st, writeIt, vec, per, strobe };
}

/** The panels the add-on mounts (titles through ctx.t, English fallback). */
const TITLES = { 'chip.lay.title': 'Layout', 'chip.fmt.lib.title': 'Cell library and floorplan', 'chip.fmt.con.title': 'Constraints and timing data' };
export function panels(ctx) {
  const w = words(ctx), t = (k) => { const s = w(k); return s === k ? TITLES[k] : s; };
  return [
    { id: 'chip-layout', title: t('chip.lay.title'), mount: (el, c) => mountLayout(el, c || ctx) },
    { id: 'chip-library', title: t('chip.fmt.lib.title'), mount: (el, c) => mountLibrary(el, c || ctx) },
    { id: 'chip-constraints', title: t('chip.fmt.con.title'), mount: (el, c) => mountConstraints(el, c || ctx) },
  ];
}
export { layerInfo };
