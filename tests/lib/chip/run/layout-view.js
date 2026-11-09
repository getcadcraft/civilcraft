/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout-view.js — the floorplan / placement / routing view of the Chip design add-on (0.9 HD.6): the shapes of a DEF (chip-formats'
 * defShapes: die, rows, cells, pins, wires, vias, in micrometres) drawn as SVG, y up, with three switches (the Floorplan tab; Floorplan = die + rows + pins,
 * Placement = cells, Routing = wires + vias by layer) and wheel zoom / drag pan. Our own code; no library.
 *
 *   layoutSvg(shapes, { show: { floorplan, placement, routing }, layers }) → svg text   (pure, tested in Node)
 *   mountLayout(el, shapes, { t }) → { set(shapes), destroy() }
 */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const PALETTE = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777'];

export function layerColours(shapes) {
  const names = [...new Set((shapes.wires || []).map((w) => w.layer))].sort();
  return Object.fromEntries(names.map((n, i) => [n, PALETTE[i % PALETTE.length]]));
}

export function bounds(shapes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const p of shapes.die || []) add(p[0], p[1]);
  for (const c of [...(shapes.cells || []), ...(shapes.rows || []), ...(shapes.pins || [])]) { add(c.box[0], c.box[1]); add(c.box[2], c.box[3]); }
  for (const w of shapes.wires || []) { add(w.a[0], w.a[1]); add(w.b[0], w.b[1]); }
  return Number.isFinite(x0) ? [x0, y0, x1, y1] : [0, 0, 1, 1];
}

export function layoutSvg(shapes, { show = { floorplan: true, placement: true, routing: true }, layers = layerColours(shapes) } = {}) {
  const [x0, y0, x1, y1] = bounds(shapes), w = x1 - x0 || 1, h = y1 - y0 || 1, pad = Math.max(w, h) * 0.03;
  const P = [];
  P.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0 - pad} ${-(y1 + pad)} ${w + 2 * pad} ${h + 2 * pad}" class="chip-layout-svg" preserveAspectRatio="xMidYMid meet">`);
  P.push(`<g transform="scale(1,-1)" stroke-width="${Math.max(w, h) / 600}" vector-effect="non-scaling-stroke">`);
  if (show.floorplan) {
    if (shapes.die) P.push(`<polygon class="chip-die" points="${shapes.die.map((p) => p.join(',')).join(' ')}" fill="none" stroke="currentColor"/>`);
    for (const r of shapes.rows || []) P.push(`<rect class="chip-row" x="${r.box[0]}" y="${r.box[1]}" width="${r.box[2] - r.box[0]}" height="${r.box[3] - r.box[1]}" fill="none" stroke="#94a3b8" stroke-dasharray="${w / 200}"><title>${esc(r.name)}</title></rect>`);
    for (const p of shapes.pins || []) P.push(`<rect class="chip-pin" x="${p.box[0]}" y="${p.box[1]}" width="${p.box[2] - p.box[0] || w / 300}" height="${p.box[3] - p.box[1] || w / 300}" fill="#f59e0b"><title>${esc(p.name)} (${esc(p.layer)})</title></rect>`);
  }
  if (show.placement) for (const c of shapes.cells || []) P.push(`<rect class="chip-cell${c.status === 'FIXED' ? ' is-fixed' : ''}" x="${c.box[0]}" y="${c.box[1]}" width="${c.box[2] - c.box[0]}" height="${c.box[3] - c.box[1]}" fill="rgba(100,116,139,.18)" stroke="#64748b"><title>${esc(c.name)} ${esc(c.model)}${c.orient ? ' ' + esc(c.orient) : ''}</title></rect>`);
  if (show.routing) {
    for (const wr of shapes.wires || []) P.push(`<line class="chip-wire" x1="${wr.a[0]}" y1="${wr.a[1]}" x2="${wr.b[0]}" y2="${wr.b[1]}" stroke="${layers[wr.layer] || '#2563eb'}" stroke-width="${wr.width || w / 400}" stroke-linecap="square" opacity="${wr.special ? 0.45 : 0.85}"><title>${esc(wr.net)} (${esc(wr.layer)})</title></line>`);
    for (const v of shapes.vias || []) P.push(`<rect class="chip-via" x="${v.at[0] - w / 400}" y="${v.at[1] - w / 400}" width="${w / 200}" height="${w / 200}" fill="#111827"><title>${esc(v.name)} (${esc(v.net)})</title></rect>`);
  }
  P.push('</g></svg>');
  return P.join('');
}

export function mountLayout(el, shapes, { t = (k) => k } = {}) {
  const d = el.ownerDocument;
  el.textContent = '';
  el.classList.add('chip-layout');
  const show = { floorplan: true, placement: true, routing: true };
  const bar = d.createElement('div'); bar.className = 'chip-waves-bar';
  const view = d.createElement('div'); view.className = 'chip-layout-view';
  const legend = d.createElement('div'); legend.className = 'chip-muted chip-legend';
  let cur = shapes, vb = null;
  for (const k of ['floorplan', 'placement', 'routing']) {
    const lab = d.createElement('label'); lab.className = 'chip-check';
    const cb = Object.assign(d.createElement('input'), { type: 'checkbox', checked: true });
    cb.setAttribute('data-chip-show', k);
    cb.addEventListener('change', () => { show[k] = cb.checked; draw(); });
    lab.append(cb, d.createTextNode(' ' + t('chip.layout.' + k)));
    bar.append(lab);
  }
  const draw = () => {
    view.innerHTML = layoutSvg(cur, { show });
    const svg = view.firstChild;
    if (vb) svg.setAttribute('viewBox', vb.join(' '));
    const L = layerColours(cur);
    legend.textContent = '';
    for (const [n, c] of Object.entries(L)) { const s = d.createElement('span'); s.style.color = c; s.textContent = '■ ' + n + '  '; legend.append(s); }
    const cells = (cur.cells || []).length, wires = (cur.wires || []).length;
    legend.append(d.createTextNode(t('chip.layout.counts', { cells, wires, unknown: cur.unknownMacros || 0 })));
  };
  view.addEventListener('wheel', (e) => {
    e.preventDefault();
    const svg = view.firstChild; if (!svg) return;
    const b = (vb || svg.getAttribute('viewBox').split(' ').map(Number)).slice(), f = e.deltaY > 0 ? 1.2 : 1 / 1.2, r = svg.getBoundingClientRect();
    const px = b[0] + ((e.clientX - r.left) / r.width) * b[2], py = b[1] + ((e.clientY - r.top) / r.height) * b[3];
    vb = [px - (px - b[0]) * f, py - (py - b[1]) * f, b[2] * f, b[3] * f]; svg.setAttribute('viewBox', vb.join(' '));
  }, { passive: false });
  let drag = null;
  view.addEventListener('pointerdown', (e) => { const svg = view.firstChild; if (svg) drag = { x: e.clientX, y: e.clientY, b: (vb || svg.getAttribute('viewBox').split(' ').map(Number)).slice(), r: svg.getBoundingClientRect() }; });
  view.addEventListener('pointermove', (e) => { if (!drag) return; const k = drag.b[2] / drag.r.width; vb = [drag.b[0] - (e.clientX - drag.x) * k, drag.b[1] - (e.clientY - drag.y) * k, drag.b[2], drag.b[3]]; view.firstChild.setAttribute('viewBox', vb.join(' ')); });
  view.addEventListener('pointerup', () => { drag = null; });
  const fit = Object.assign(d.createElement('button'), { type: 'button', className: 'chip-btn', textContent: t('chip.wave.fit') });
  fit.addEventListener('click', () => { vb = null; draw(); });
  bar.append(fit);
  el.append(bar, view, legend);
  draw();
  return { set(s) { cur = s; vb = null; draw(); }, destroy() { el.textContent = ''; } };
}
