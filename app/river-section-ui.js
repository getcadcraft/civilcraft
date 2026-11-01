/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-section-ui.js — the section editor of the river tool (0.8 SU.957 step 2, lab): the section's ground drawn as a plot with
 * handles to drag — the left and right bank, a levee on either side (its place and crest), ineffective flow areas — and the
 * same numbers typed beside it. Apply = one undo step (river-ui.js passes the edit). The geometry is river.js / river-solve.js
 * (bin/test-civilcraft-river.mjs); this file is only the dialog.
 *
 *   openSectionEditor({ el, root, t, section, units, onApply(patch), say }) → dialog
 *     patch = { banks: [oL, oR], levees: { left: {o, z} | null, right: … } | null, ineff: [{ o0, o1, trigger }] }
 */

const NS = 'http://www.w3.org/2000/svg';
const svg = (name, attrs = {}, ...kids) => { const n = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); n.append(...kids); return n; };
const r3 = (v) => Math.round(v * 1000) / 1000;

export function openSectionEditor({ el, root, t, section, units = 'm', onApply, say = () => {} }) {
  const pts = section.pts, lo = pts[0].o, hi = pts[pts.length - 1].o;
  const zs = pts.map((p) => p.z), zmin = Math.min(...zs), zmax = Math.max(...zs);
  const st = {
    banks: [section.banks[0], section.banks[1]],
    left: section.levees?.left ? { ...section.levees.left } : null,
    right: section.levees?.right ? { ...section.levees.right } : null,
    ineff: (section.ineff || []).map((r) => ({ ...r })),
  };
  const W = 760, H = 300, m = { l: 48, r: 14, t: 14, b: 28 };
  const kx = (W - m.l - m.r) / Math.max(hi - lo, 1e-9), pad = (zmax - zmin || 1) * 0.15, z0 = zmin - pad, z1 = zmax + pad * 2.5, ky = (H - m.t - m.b) / (z1 - z0);
  const X = (o) => m.l + (o - lo) * kx, Y = (z) => H - m.b - (z - z0) * ky, O = (x) => lo + (x - m.l) / kx;
  const plot = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', class: 'cv-rv-editor-plot', 'data-rve-plot': '', role: 'img', 'aria-label': t('sx.su957.ed.aria'), style: 'max-width:100%;touch-action:none;background:var(--sheet,#fff)' });
  const layer = svg('g');
  plot.append(layer);
  const inputs = {};
  const num = (id, val, label, w = '5rem') => { const i = el('input', { type: 'text', className: 'cv-input', id: 'cv-rve-' + id, inputMode: 'decimal', value: val === null || val === undefined ? '' : String(r3(val)), style: 'width:' + w, 'aria-label': label, ['data-rve-' + id]: '' }); inputs[id] = i; return i; };
  let drag = null;

  function handle(o, cls, label, onMove, z = null) {
    const g = svg('g', { class: 'cv-rve-h ' + cls, tabindex: '0', role: 'slider', 'aria-label': label, 'aria-valuenow': r3(o), style: 'cursor:ew-resize' });
    const x = X(o);
    g.append(svg('line', { x1: x, x2: x, y1: m.t, y2: H - m.b, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-dasharray': '5 3' }), svg('rect', { x: x - 6, y: m.t, width: 12, height: H - m.t - m.b, fill: 'transparent' }),
      svg('circle', { cx: x, cy: m.t + 8, r: 5, fill: 'currentColor' }));
    if (z !== null) g.append(svg('line', { x1: x - 14, x2: x + 14, y1: Y(z), y2: Y(z), stroke: 'currentColor', 'stroke-width': 3 }));
    g.addEventListener('pointerdown', (e) => { drag = { onMove, g }; g.setPointerCapture?.(e.pointerId); e.preventDefault(); });
    g.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { onMove(o + (e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 5 : 0.5) * Math.max(0.01, (hi - lo) / 400)); e.preventDefault(); } });
    return g;
  }
  plot.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const b = plot.getBoundingClientRect(), x = ((e.clientX - b.left) / b.width) * W;
    drag.onMove(Math.max(lo, Math.min(hi, O(x))));
  });
  const stop = () => { drag = null; };
  plot.addEventListener('pointerup', stop); plot.addEventListener('pointercancel', stop);

  const clampBank = (which, o) => (which === 0 ? Math.max(lo, Math.min(o, st.banks[1] - (hi - lo) * 0.01)) : Math.min(hi, Math.max(o, st.banks[0] + (hi - lo) * 0.01)));
  function draw() {
    layer.replaceChildren();
    // grid ticks
    const nice = (v) => { const e = 10 ** Math.floor(Math.log10(v)), f = v / e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e; };
    const step = nice((hi - lo) / 8);
    for (let o = Math.ceil(lo / step) * step; o <= hi + 1e-9; o += step) layer.append(svg('line', { x1: X(o), x2: X(o), y1: H - m.b, y2: H - m.b + 4, stroke: 'currentColor' }), svg('text', { x: X(o), y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'currentColor' }, String(r3(o))));
    const zst = nice((z1 - z0) / 5);
    for (let z = Math.ceil(z0 / zst) * zst; z <= z1; z += zst) layer.append(svg('line', { x1: m.l - 4, x2: m.l, y1: Y(z), y2: Y(z), stroke: 'currentColor' }), svg('text', { x: m.l - 7, y: Y(z) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'currentColor' }, String(r3(z))));
    layer.append(svg('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: 'currentColor' }), svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: H - m.b, stroke: 'currentColor' }));
    // ineffective areas (shaded) and the cut-off ground behind levees
    st.ineff.forEach((r) => layer.append(svg('rect', { x: X(r.o0), y: m.t, width: Math.max(1, X(r.o1) - X(r.o0)), height: H - m.t - m.b, fill: '#c9a227', 'fill-opacity': 0.25, 'data-rve-ineff-shade': '' })));
    if (st.left) layer.append(svg('rect', { x: X(lo), y: m.t, width: Math.max(1, X(st.left.o) - X(lo)), height: H - m.t - m.b, fill: '#888', 'fill-opacity': 0.2 }));
    if (st.right) layer.append(svg('rect', { x: X(st.right.o), y: m.t, width: Math.max(1, X(hi) - X(st.right.o)), height: H - m.t - m.b, fill: '#888', 'fill-opacity': 0.2 }));
    // the ground, and the channel between the banks
    layer.append(svg('rect', { x: X(st.banks[0]), y: m.t, width: X(st.banks[1]) - X(st.banks[0]), height: H - m.t - m.b, fill: '#2e6fb0', 'fill-opacity': 0.08 }));
    layer.append(svg('path', { d: pts.map((p, i) => (i ? 'L' : 'M') + X(p.o).toFixed(1) + ' ' + Y(p.z).toFixed(1)).join(''), fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'data-rve-ground': '' }));
    // handles
    for (const w of [0, 1]) layer.append(handle(st.banks[w], 'rve-bank', t(w ? 'sx.su957.ed.br' : 'sx.su957.ed.bl'), (o) => { st.banks[w] = clampBank(w, o); sync(); }));
    if (st.left) layer.append(handle(st.left.o, 'rve-levee', t('sx.su957.ed.ll'), (o) => { st.left.o = Math.min(o, st.banks[0]); sync(); }, st.left.z));
    if (st.right) layer.append(handle(st.right.o, 'rve-levee', t('sx.su957.ed.lr'), (o) => { st.right.o = Math.max(o, st.banks[1]); sync(); }, st.right.z));
    st.ineff.forEach((r, i) => { for (const k of ['o0', 'o1']) layer.append(handle(r[k], 'rve-ineff', t('sx.su957.ed.ia', { k: i + 1 }), (o) => { r[k] = o; if (r.o0 > r.o1) [r.o0, r.o1] = [r.o1, r.o0]; sync(); })); });
    layer.append(svg('text', { x: m.l + 6, y: H - m.b - 6, 'text-anchor': 'start', 'font-size': 11, fill: 'currentColor' }, t('sx.su957.ed.plot', { u: units })));
  }
  const parse = (i) => { const s = i.value.trim(); if (s === '') return null; const n = Number(s); return Number.isFinite(n) ? n : NaN; };

  // the typed side
  const bl = num('bl', st.banks[0], t('sx.su957.ed.bl')), br = num('br', st.banks[1], t('sx.su957.ed.br'));
  const lcb = el('input', { type: 'checkbox', id: 'cv-rve-lc', 'data-rve-lc': '', checked: !!st.left }), rcb = el('input', { type: 'checkbox', id: 'cv-rve-rc', 'data-rve-rc': '', checked: !!st.right });
  const llo = num('llo', st.left?.o ?? null, t('sx.su957.ed.ll')), llz = num('llz', st.left?.z ?? null, t('sx.su957.ed.crest')), lro = num('lro', st.right?.o ?? null, t('sx.su957.ed.lr')), lrz = num('lrz', st.right?.z ?? null, t('sx.su957.ed.crest'));
  const ineffBox = el('div', { 'data-rve-ineff-list': '' });
  const msg = el('p', { className: 'cv-note', role: 'status', 'data-rve-msg': '' });
  function sync() { // plot → inputs
    bl.value = String(r3(st.banks[0])); br.value = String(r3(st.banks[1]));
    llo.value = st.left ? String(r3(st.left.o)) : ''; llz.value = st.left ? String(r3(st.left.z)) : '';
    lro.value = st.right ? String(r3(st.right.o)) : ''; lrz.value = st.right ? String(r3(st.right.z)) : '';
    lcb.checked = !!st.left; rcb.checked = !!st.right;
    renderIneff(false);
    draw();
  }
  function fromInputs() { // inputs → state
    const a = parse(bl), b = parse(br);
    if (Number.isFinite(a) && Number.isFinite(b) && a >= lo && b <= hi && b > a) st.banks = [a, b]; else msg.textContent = t('sx.su957.ed.bad');
    const lv = (cb, o, z, key) => { if (!cb.checked) { st[key] = null; return; } const oo = parse(o), zz = parse(z); st[key] = Number.isFinite(oo) && Number.isFinite(zz) ? { o: Math.max(lo, Math.min(hi, oo)), z: zz } : st[key] || { o: key === 'left' ? st.banks[0] - (st.banks[0] - lo) / 2 : st.banks[1] + (hi - st.banks[1]) / 2, z: zmax }; };
    lv(lcb, llo, llz, 'left'); lv(rcb, lro, lrz, 'right');
    if (st.left && st.left.o > st.banks[0]) st.left.o = st.banks[0];
    if (st.right && st.right.o < st.banks[1]) st.right.o = st.banks[1];
    sync();
  }
  function renderIneff(rebuild = true) {
    if (!rebuild && ineffBox.children.length === st.ineff.length) {   // only the numbers moved
      st.ineff.forEach((r, i) => { const c = ineffBox.children[i]; c.querySelector('[data-rve-i0]').value = String(r3(r.o0)); c.querySelector('[data-rve-i1]').value = String(r3(r.o1)); });
      return;
    }
    ineffBox.replaceChildren(...st.ineff.map((r, i) => {
      const a = el('input', { type: 'text', className: 'cv-input', inputMode: 'decimal', value: String(r3(r.o0)), style: 'width:5rem', 'aria-label': t('sx.su957.ed.ifrom', { k: i + 1 }), 'data-rve-i0': '' });
      const b = el('input', { type: 'text', className: 'cv-input', inputMode: 'decimal', value: String(r3(r.o1)), style: 'width:5rem', 'aria-label': t('sx.su957.ed.ito', { k: i + 1 }), 'data-rve-i1': '' });
      const z = el('input', { type: 'text', className: 'cv-input', inputMode: 'decimal', value: r.trigger === null ? '' : String(r3(r.trigger)), placeholder: t('sx.su957.ed.always'), style: 'width:6rem', 'aria-label': t('sx.su957.ed.itrig', { k: i + 1 }), 'data-rve-it': '' });
      const upd = () => { const x = parse(a), y = parse(b), q = parse(z); if (Number.isFinite(x) && Number.isFinite(y)) { r.o0 = Math.max(lo, Math.min(x, y)); r.o1 = Math.min(hi, Math.max(x, y)); } r.trigger = Number.isFinite(q) ? q : null; sync(); };
      for (const n of [a, b, z]) n.addEventListener('change', upd);
      return el('div', { className: 'cv-inline', style: 'display:flex;flex-wrap:wrap;align-items:center;gap:.4rem', 'data-rve-ineff': String(i) }, t('sx.su957.ed.ia', { k: i + 1 }), ' ', a, ' – ', b, ' ', t('sx.su957.ed.iwhile'), ' ', z, ' ',
        el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('sx.su957.ed.idel', { k: i + 1 }), onclick: () => { st.ineff.splice(i, 1); renderIneff(true); draw(); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })));
    }));
  }
  for (const n of [bl, br, llo, llz, lro, lrz, lcb, rcb]) n.addEventListener('change', fromInputs);
  const addIneff = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-rve-add': '', onclick: () => {
    if (st.ineff.length >= 20) return;
    const c = st.banks[0], w = Math.max((c - lo) / 2, (hi - lo) * 0.05);
    st.ineff.push({ o0: Math.max(lo, c - w), o1: c, trigger: null }); renderIneff(true); draw();
  } }, t('sx.su957.ed.add'));

  const id = 'cv-rve-' + Math.random().toString(36).slice(2, 7);
  const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sx.su957.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const row = (label, ...inputs) => el('div', { className: 'cv-inline', style: 'display:flex;flex-wrap:wrap;align-items:center;gap:.4rem' }, el('strong', {}, label), ...inputs);
  const apply = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-rve-apply': '', onclick: () => {
    fromInputs();
    if (!(st.banks[1] > st.banks[0])) return;
    onApply({ banks: [st.banks[0], st.banks[1]], levees: st.left || st.right ? { left: st.left ? { o: st.left.o, z: st.left.z } : null, right: st.right ? { o: st.right.o, z: st.right.z } : null } : null, ineff: st.ineff.filter((r) => r.o1 > r.o0).map((r) => ({ o0: r.o0, o1: r.o1, trigger: r.trigger })) });
    dlg.close(); say(t('sx.su957.ed.done'));
  } }, t('sx.su957.ed.apply'));
  const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', id, 'aria-labelledby': id + '-h', 'data-rve-dialog': '' },
    el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('sx.su957.ed.title', { rs: r3(section.rs) })), close),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('sx.su957.ed.lede')), plot,
        el('div', { className: 'cv-rve-rows', style: 'display:grid;gap:.7rem;margin-top:.7rem' },
          row(t('sx.su957.ed.banks', { u: units }), t('sx.su957.ed.left'), ' ', bl, ' ', t('sx.su957.ed.right'), ' ', br),
          row(t('sx.su957.ed.levees'), el('label', { className: 'cv-check' }, lcb, ' ', t('sx.su957.ed.left')), ' ', llo, ' ', llz, ' ', el('label', { className: 'cv-check' }, rcb, ' ', t('sx.su957.ed.right')), ' ', lro, ' ', lrz),
          row(t('sx.su957.ed.ineff')), ineffBox, addIneff), el('p', { className: 'cv-note' }, t('sx.su957.ed.note')), msg),
      el('div', { className: 'cv-dlg-foot' }, apply, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('sx.su957.close')))));
  close.onclick = () => dlg.close();
  dlg.addEventListener('close', () => dlg.remove());
  renderIneff(true); draw();
  root.append(dlg);
  dlg.showModal();
  return dlg;
}
