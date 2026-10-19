/* SPDX-License-Identifier: Apache-2.0 */
/**
 * structs-ui.js — the structure builder in the page (0.6 WL.27): the network's Structure types (Properties of the project),
 * the builder dialog (shape, sizes, wall, floor slab, sump, frame and cover, with a plan and a section drawn as you type),
 * saving a type as a library item (.json for LibraryCraft) and opening one, and the Type choice in a structure's
 * Properties. Everything it changes is one undo step (project.change); structs.js does the sums.
 *
 *   createStructs(ctx)   ctx = { root, el, project: () => Project, units: () => 'ft'|'m', say, refocus, download(bytes,
 *                                 name, type), select(sel) }
 *   → { block() → nodes (the network's types), structureRow(x) → nodes (a structure's Type), open(typeId | null) (the
 *       builder), openItem(file) (a library item .json → a type), itemFor(typeId) → the library item (tests) }
 */

import { t } from './i18n.js';
import { KINDS, SHAPES, MAX_TYPES, typeDefaults, cleanType, typeWords, typePlan, typeItem, typeFromItem, applyType } from './structs.js';
import { DIA_UNIT } from './pipes.js';

export function createStructs(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const net = () => P().state.network;
  const types = () => net()?.types || [];
  const dU = () => DIA_UNIT[U()].name;
  const uShort = () => (U() === 'm' ? 'm' : 'ft');

  /** Put a type (new or edited) into the network; structures of that type follow its sizes (their own sump stays). */
  function saveType(k, label) {
    const p = P();
    if (!k.id) k.id = p.nextId('u');
    p.change(label, (s) => {
      const n = s.network;
      n.types = n.types || [];
      const i = n.types.findIndex((x) => x.id === k.id);
      if (i >= 0) n.types[i] = k; else n.types.push(k);
      n.structures = n.structures.map((x) => (x.type === k.id ? { ...applyType(x, k), sumpDepth: x.sumpDepth } : x));
    });
    return k.id;
  }
  function removeType(id) {
    const k = types().find((x) => x.id === id);
    if (!k) return;
    const used = net().structures.filter((x) => x.type === id).length;
    P().change(t('st.undo.remove', { name: k.name }), (s) => {
      s.network.types = s.network.types.filter((x) => x.id !== id);
      s.network.structures = s.network.structures.map((x) => (x.type === id ? applyType(x, null) : x));
    });
    ctx.say(t(used ? 'st.removed.used' : 'st.removed', { name: k.name, n: used }));
  }

  function itemFor(id) { const k = types().find((x) => x.id === id); return k ? typeItem(k, U()) : null; }
  function saveItem(id) {
    const item = itemFor(id);
    if (!item) return;
    const name = (item.name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 80) || 'structure') + '.item.json';
    ctx.download(new TextEncoder().encode(JSON.stringify(item, null, 2)), name, 'application/json');
    ctx.say(t('st.item.saved', { name }));
  }
  async function openItem(file) {
    let obj;
    try { obj = JSON.parse(await file.text()); } catch { ctx.say(t('st.lib.notjson', { file: file.name })); return null; }
    const r = typeFromItem(obj, U());
    if (!r.type) { ctx.say(t('st.lib.refused', { file: file.name, why: r.why })); return null; }
    if (types().length >= MAX_TYPES) { ctx.say(t('st.max', { n: MAX_TYPES })); return null; }
    const id = saveType(r.type, t('st.undo.open', { name: r.type.name }));
    ctx.say(t('st.lib.opened', { name: r.type.name }));
    return id;
  }

  function block() {
    if (!net()) return [];
    const out = [el('h3', { className: 'cv-h3' }, t('st.head'))];
    const list = types();
    if (list.length) {
      out.push(el('ul', { className: 'cv-plainlist cv-st-types', 'data-st-types': '' }, ...list.map((k) => {
        const used = net().structures.filter((x) => x.type === k.id).length;
        return el('li', { 'data-st-type': k.id },
          el('strong', {}, k.name), ' ', el('span', { className: 'cv-note' }, t('st.used', { n: used })), ' ',
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-st-edit': k.id, onclick: () => open(k.id) }, t('st.edit')), ' ',
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-st-item': k.id, onclick: () => saveItem(k.id) }, t('st.item.save')), ' ',
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-st-remove': k.id, onclick: () => removeType(k.id) }, t('st.remove')));
      })));
    } else out.push(el('p', { className: 'cv-note' }, t('st.none')));
    const file = el('input', { type: 'file', accept: '.json,application/json', className: 'visually-hidden', 'data-st-file': '', tabIndex: -1 });
    file.addEventListener('change', async () => { const f = file.files[0]; file.value = ''; if (f) await openItem(f); });
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-st-new': '', onclick: () => open(null) }, t('st.new')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-st-open': '', onclick: () => file.click() }, t('st.lib.open')), file));
    out.push(el('p', { className: 'cv-note' }, t('st.note')));
    return out;
  }

  function structureRow(x) {
    if (!net()) return [];
    const sel = el('select', { className: 'cv-select', id: 'cv-st-type', 'data-st-pick': '' },
      el('option', { value: '' }, t('st.pick.none')), ...types().map((k) => el('option', { value: k.id }, k.name)));
    sel.value = x.type || '';
    sel.addEventListener('change', () => {
      const k = types().find((q) => q.id === sel.value) || null;
      P().change(k ? t('st.undo.assign', { name: k.name }) : t('st.undo.unassign'), (s) => { s.network.structures = s.network.structures.map((q) => (q.id === x.id ? applyType(q, k) : q)); });
    });
    const k = types().find((q) => q.id === x.type);
    return [el('div', { className: 'cv-props' }, el('label', { for: 'cv-st-type' }, t('st.type')), sel),
      el('p', { className: 'cv-note', 'data-st-words': '' }, k ? typeWords(k, U()) : t('st.pick.note'))];
  }

  // ---- the builder dialog ----
  function open(id) {
    const n = net();
    if (!n) return;
    const was = id ? types().find((x) => x.id === id) : null;
    let k = was ? JSON.parse(JSON.stringify(was)) : { ...typeDefaults(U(), 'round'), id: null };
    const dlgId = 'cv-st-dlg';
    const field = (key, label, unit, get, set, attrs = {}) => {
      const inp = el('input', { type: 'text', className: 'cv-input', id: dlgId + '-' + key, inputMode: 'decimal', value: String(get() ?? ''), style: 'width:7rem', ...attrs });
      inp.addEventListener('input', () => { const v = Number(inp.value); if (inp.value.trim() !== '' && Number.isFinite(v) && v >= 0) { set(v); inp.removeAttribute('aria-invalid'); } else inp.setAttribute('aria-invalid', 'true'); draw(); });
      return { inp, nodes: [el('label', { for: inp.id }, label), el('div', { className: 'cv-row' }, inp, el('span', { className: 'cv-unit' }, unit))] };
    };
    const name = el('input', { type: 'text', className: 'cv-input', id: dlgId + '-name', value: was ? k.name : '', maxLength: 80, placeholder: t('st.f.name.ph') });
    const kind = el('select', { className: 'cv-select', id: dlgId + '-kind', 'data-st-kind': '' }, ...KINDS.map((x) => el('option', { value: x }, t('st.kind.' + x))));
    kind.value = k.kind;
    const shape = el('select', { className: 'cv-select', id: dlgId + '-shape', 'data-st-shape': '' }, ...SHAPES.map((x) => el('option', { value: x }, t('st.shape.' + x))));
    shape.value = k.shape;
    const fshape = el('select', { className: 'cv-select', id: dlgId + '-fshape', 'data-st-fshape': '' }, el('option', { value: '' }, t('st.f.frame.none')), ...SHAPES.map((x) => el('option', { value: x }, t('st.shape.' + x))));
    fshape.value = k.frame ? k.frame.shape : '';
    const sizes = el('div', { className: 'cv-st-part', 'data-st-sizes': '' }), fsizes = el('div', { className: 'cv-st-part', 'data-st-fsizes': '' });   // one grid: these lay their cells into it
    const canvas = el('canvas', { className: 'cv-st-canvas', width: 560, height: 240, 'data-st-canvas': '', role: 'img', 'aria-label': t('st.canvas') });
    const words = el('p', { className: 'cv-note', 'aria-live': 'polite', 'data-st-dlg-words': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-st-save': '' }, t(was ? 'st.save' : 'st.add'));
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('st.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    function buildSizes() {
      const d = typeDefaults(U(), k.shape);
      if (k.shape === 'round') { k.dia = k.dia || d.dia; delete k.w; delete k.l; } else { k.w = k.w || d.w; k.l = k.l || d.l; delete k.dia; }
      const f = [];
      if (k.shape === 'round') f.push(field('dia', t('st.f.dia'), dU(), () => k.dia, (v) => { k.dia = v; }));
      else f.push(field('w', t('st.f.w'), dU(), () => k.w, (v) => { k.w = v; }), field('l', t('st.f.l'), dU(), () => k.l, (v) => { k.l = v; }));
      f.push(field('wall', t('st.f.wall'), dU(), () => k.wall, (v) => { k.wall = v; }), field('base', t('st.f.base'), dU(), () => k.base, (v) => { k.base = v; }),
        field('sump', t('st.f.sump'), uShort(), () => k.sump, (v) => { k.sump = v; }), field('depth', t('st.f.depth'), uShort(), () => k.depth, (v) => { k.depth = v; }));
      sizes.replaceChildren(el('label', { for: shape.id }, t('st.f.shape')), shape, ...f.flatMap((x) => x.nodes));
      const ff = [];
      if (k.frame) {
        const fd = typeDefaults(U(), k.frame.shape).frame;
        if (k.frame.shape === 'round') { k.frame.dia = k.frame.dia || fd.dia; ff.push(field('fdia', t('st.f.fdia'), dU(), () => k.frame.dia, (v) => { k.frame.dia = v; })); }
        else { k.frame.w = k.frame.w || fd.w; k.frame.l = k.frame.l || fd.l; ff.push(field('fw', t('st.f.fw'), dU(), () => k.frame.w, (v) => { k.frame.w = v; }), field('fl', t('st.f.fl'), dU(), () => k.frame.l, (v) => { k.frame.l = v; })); }
        ff.push(field('fh', t('st.f.fh'), dU(), () => k.frame.h, (v) => { k.frame.h = v; }));
      }
      fsizes.replaceChildren(el('label', { for: fshape.id }, t('st.f.frame')), fshape, ...ff.flatMap((x) => x.nodes));
    }
    shape.addEventListener('change', () => { k.shape = shape.value; buildSizes(); draw(); });
    kind.addEventListener('change', () => { k.kind = kind.value; draw(); });
    fshape.addEventListener('change', () => { const s = fshape.value; k.frame = s ? { shape: s, h: k.frame?.h ?? typeDefaults(U()).frame.h } : null; buildSizes(); draw(); });
    name.addEventListener('input', draw);
    function draw() {
      const c = cleanType({ ...k, name: name.value }, U());
      go.disabled = !c;
      words.textContent = c ? typeWords(c, U()) : t('st.bad');
      if (c) drawType(canvas, c, U());
    }
    const dlg = el('dialog', { className: 'cv-dialog cv-stdlg', 'aria-labelledby': dlgId + '-h', 'data-st-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: dlgId + '-h' }, t(was ? 'st.title.edit' : 'st.title.new')), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-props' }, el('label', { for: name.id }, t('st.f.name')), name, el('label', { for: kind.id }, t('st.f.kind')), kind, sizes, fsizes),
          canvas, words,
          el('p', { className: 'cv-note' }, t('st.dlg.note', { d: dU() }))),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('st.cancel')), go)));
    closeBtn.onclick = () => dlg.close();
    go.onclick = () => {
      const c = cleanType({ ...k, name: name.value }, U());
      if (!c) return;
      if (!was && types().length >= MAX_TYPES) { ctx.say(t('st.max', { n: MAX_TYPES })); return; }
      c.id = was ? was.id : null;
      saveType(c, t(was ? 'st.undo.edit' : 'st.undo.add', { name: c.name }));
      dlg.close();
      ctx.say(t(was ? 'st.saved' : 'st.added', { name: c.name }));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    buildSizes(); draw();
    dlg.showModal();
    name.focus();
  }

  return { block, structureRow, open, openItem, itemFor };
}

/** The type's plan (left) and a section through it (right), in the page's colours. */
function drawType(canvas, k, units) {
  const g = canvas.getContext('2d');
  if (!g) return;
  const cs = getComputedStyle(canvas), ink = cs.getPropertyValue('--ink').trim() || '#000', ink2 = cs.getPropertyValue('--ink-2').trim() || '#555', act = cs.getPropertyValue('--action').trim() || '#1e48c8';
  const W = canvas.width, H = canvas.height;
  g.clearRect(0, 0, W, H);
  const plan = typePlan(k, units), ents = plan.entities;
  // plan: fit the outside shape into the left half
  let ext = 0;
  for (const e of ents) ext = Math.max(ext, e.type === 'circle' ? e.r : Math.max(...e.pts.map((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])))));
  const s = (Math.min(W / 2, H) * 0.42) / (ext || 1), cx = W / 4, cy = H / 2;
  g.lineWidth = 1;
  for (const e of ents) {
    g.strokeStyle = e.layer === 'FRAME' ? act : e.layer === 'STRUCTURE' ? ink : ink2;
    g.lineWidth = e.layer === 'STRUCTURE' ? 2 : 1;
    g.beginPath();
    if (e.type === 'circle') g.arc(cx, cy, e.r * s, 0, Math.PI * 2);
    else e.pts.forEach((p, i) => (i ? g.lineTo(cx + p[0] * s, cy - p[1] * s) : g.moveTo(cx + p[0] * s, cy - p[1] * s)));
    g.closePath(); g.stroke();
  }
  // section: walls, floor slab, sump line and frame, to one scale (the depth may be squeezed to fit, said by the ratio)
  const M = units === 'm' ? 1 : 25.4, Umm = units === 'm' ? 1000 : 1200000 / 3937;
  const inside = (k.shape === 'round' ? k.dia : k.l) * M, wall = (k.wall || 0) * M, base = (k.base || 0) * M, depth = k.depth * Umm, sump = k.sump * Umm;
  const fh = k.frame ? (k.frame.h || 0) * M : 0, fw = k.frame ? (k.frame.shape === 'round' ? k.frame.dia : k.frame.l) * M : 0;
  const totalW = inside + 2 * wall, totalH = depth + base;
  const sx = Math.min((W / 2) * 0.8 / totalW, (H * 0.85) / totalH), ox = (3 * W) / 4, top = H * 0.07;
  const X = (x) => ox + x * sx, Y = (z) => top + z * sx;   // z down from the rim
  g.fillStyle = ink2; g.globalAlpha = 0.18;
  g.fillRect(X(-totalW / 2), Y(fh), wall * sx, (depth - fh) * sx);
  g.fillRect(X(inside / 2), Y(fh), wall * sx, (depth - fh) * sx);
  g.fillRect(X(-totalW / 2), Y(depth), totalW * sx, base * sx);
  g.globalAlpha = 1; g.strokeStyle = ink; g.lineWidth = 1.5;
  g.strokeRect(X(-totalW / 2), Y(fh), totalW * sx, (depth + base - fh) * sx);
  g.strokeRect(X(-inside / 2), Y(fh), inside * sx, (depth - fh) * sx);
  if (k.frame) { g.strokeStyle = act; g.strokeRect(X(-fw / 2), Y(0), fw * sx, fh * sx); }
  if (sump > 0) { g.strokeStyle = act; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(X(-inside / 2), Y(depth - sump)); g.lineTo(X(inside / 2), Y(depth - sump)); g.stroke(); g.setLineDash([]); }
}
