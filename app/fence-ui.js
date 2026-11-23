/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fence-ui.js — the Fences window (0.10 SU.1814b): a fence along the selected line (feature line, alignment, pipe, parcel edge or a drawn outline), posts and
 * rails or panels or pickets, gates, raked or stepped on the ground, a schedule, plan symbols on fence layers, IFC elements. The numbers are lib/fence's
 * (copied to fence/index.js with node tools/fence/sync.mjs civilcraft; lib/fence/test/fence.test.mjs, bin/test-civilcraft-sitegen.mjs). Every change is one undo step
 * (state.fences); the layout is worked out again from the record each time.
 *
 *   createFence(ctx) → { command(c) → handled, sceneItems(mm), layouts() → [{ rec, layout }], open(), refreshWindow() }
 *   ctx = { root, el, project, units, say, refocus, download(name, blob), fileStem(), selected() → { kind, id, name, pts, closed? } | null, groundAt(x, y), refresh() }
 */
import { t } from './i18n.js';
import { LAYERS } from './scene.js';
import * as F from './fence/index.js';
import { fixed } from './units.js';
/** A field name (`stallW`) as the lower-case words of its language key (`stall-w`). */
const kb = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

for (const [name, key, aci] of F.FENCE_LAYERS) if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: 'green', aci, get label() { return t(key); } });

export function createFence(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const list = () => P().state.fences || [];
  const edit = (label, fn) => P().change(label, (s) => { s.fences ||= []; fn(s.fences, s); if (!s.fences.length) delete s.fences; });
  const zAt = (x, y) => { const z = ctx.groundAt(x, y); return Number.isFinite(z) ? z : null; };
  let dlg = null, form = { style: 'panel', terrain: 'raked' }, item = null, types = null;   // item: the Library fence type chosen in the window (0.11 SU.1814b, lib/fence typeFromItem)
  const layoutOf = (rec) => F.build(rec, { zAt, units: U() });

  function longestMiddle(pts, closed, width) {
    const P2 = closed ? [...pts, pts[0]] : pts;
    let best = null, s0 = 0;
    for (let i = 0; i + 1 < P2.length; i++) { const l = Math.hypot(P2[i + 1].x - P2[i].x, P2[i + 1].y - P2[i].y); if (l > width + 1e-6 && (!best || l > best.l)) best = { s: s0 + (l - width) / 2, l }; s0 += l; }
    return best ? best.s : null;
  }
  function make(withGate) {
    const g = ctx.selected();
    if (!g || !g.pts || g.pts.length < 2) { ctx.say(t('fc.err.nosel')); return; }
    const d = F.defaults(U()), v = (k) => { const n = Number(form[k]); return n > 0 ? n : d[k]; };
    const closed = g.closed === true || g.kind === 'parcel';
    const patch = item ? F.typeFromItem(item, U()) : null;   // a Library fence type: its sizes first, a size typed in the window wins
    const typed = (k) => Number(form[k]) > 0;
    const rec = { id: P().nextId('fc'), name: g.name || '', pts: g.pts.map((p) => ({ x: p.x, y: p.y })), closed, ...(patch || {}), style: patch?.style && !form.styleSet ? patch.style : form.style, terrain: patch?.terrain && !form.terrainSet ? patch.terrain : form.terrain, gates: [] };
    for (const k of ['height', 'postSpacing']) if (typed(k) || !patch || patch[k] === undefined) rec[k] = v(k);
    if (withGate) { const w = v('gateWidth'), s = longestMiddle(rec.pts, closed, w); if (s !== null) rec.gates.push({ s, width: w, name: '' }); else ctx.say(t('fc.err.gate')); }
    const c = F.clean(rec, U());
    if (!c) { ctx.say(t('fc.err.nosel')); return; }
    edit(t('fc.undo.add'), (l) => { l.push(c); });
    ctx.say(t('fc.made', { name: c.name || c.id })); render(); ctx.refresh();
  }
  function csv(rec) {
    const lay = layoutOf(rec);
    ctx.download(ctx.fileStem() + '-fence-' + rec.id + '.csv', new Blob(['﻿' + F.scheduleCsv(lay, U())], { type: 'text/csv' }));
  }
  const setField = (rec, k, v) => { edit(t('fc.undo.edit'), (l) => { const r = l.find((x) => x.id === rec.id); const c = F.clean({ ...r, [k]: v }, U()); if (c) Object.assign(r, c); }); render(); ctx.refresh(); };
  const problemText = (p, lay) => t('fc.p.' + p.code, { ...p, gap: fixed(p.gap ?? 0, 2), limit: fixed(p.limit ?? 0, 2), by: fixed(p.by ?? 0, 2), count: p.count ?? 0, u: U(), panel: p.panel ?? '', s: fixed(p.s ?? 0, 1), name: p.name || '' }) + (lay ? '' : '');

  function render() {
    if (!dlg) return;
    const body = dlg.querySelector('[data-fc-body]'), u = U();
    const num = (rec, k, w = '5rem') => { const i = el('input', { type: 'text', className: 'cv-input', value: String(rec[k]), 'aria-label': t('fc.f.' + kb(k), { u }), style: 'width:' + w, onchange: () => { const n = Number(i.value); if (!(n > 0)) { i.value = String(rec[k]); return; } setField(rec, k, n); } }); return i; };
    const sel = (rec, k, opts) => { const s = el('select', { className: 'cv-select', 'aria-label': t('fc.f.' + kb(k), { u }), onchange: () => setField(rec, k, s.value) }, ...opts.map((o) => el('option', { value: o, selected: rec[k] === o }, t('fc.o.' + o)))); return s; };
    const cards = list().map((rec) => {
      const lay = layoutOf(rec), S = lay.stats, kinds = Object.entries(S.postsByKind).map(([k, n]) => n + ' ' + t('fc.k.' + k)).join(', ');
      return el('div', { className: 'cv-card', 'data-fc-row': rec.id },
        el('div', { className: 'cv-row' }, el('strong', {}, rec.name || rec.id), rec.type ? el('span', { className: 'cv-note', 'data-fc-typeof': '' }, t('fc.type.of', { name: rec.type })) : '', el('button', { type: 'button', className: 'cv-x', 'aria-label': t('fc.remove'), 'data-fc-remove': rec.id, onclick: () => { edit(t('fc.undo.remove'), (l) => { l.splice(l.findIndex((x) => x.id === rec.id), 1); }); render(); ctx.refresh(); } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))),
        el('div', { className: 'cv-row' }, sel(rec, 'style', F.STYLES), sel(rec, 'terrain', F.TERRAIN), el('label', {}, t('fc.f.height', { u }), ' ', num(rec, 'height')), el('label', {}, t('fc.f.post-spacing', { u }), ' ', num(rec, 'postSpacing'))),
        el('p', { className: 'cv-note', 'data-fc-sum': '' }, t('fc.sum', { len: fixed(S.length, 1), u, posts: lay.posts.length, kinds, panels: lay.panels.length, gates: lay.gates.length, steps: S.steps, area: fixed(S.panelArea, 1) })),
        lay.problems.length ? el('ul', { className: 'cv-note', 'data-fc-problems': '' }, ...lay.problems.map((p) => el('li', {}, problemText(p, lay)))) : '',
        el('div', { className: 'cv-row' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fc-gate': rec.id, onclick: () => { const w = F.defaults(u).gateWidth, s = longestMiddle(rec.pts, rec.closed, w); if (s === null) { ctx.say(t('fc.err.gate')); return; } edit(t('fc.undo.edit'), (l) => { const r = l.find((x) => x.id === rec.id); r.gates = [...(r.gates || []), { s, width: w, name: '' }].slice(0, 200); }); render(); ctx.refresh(); } }, t('fc.addgate')),
          rec.gates.length ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fc-nogate': rec.id, onclick: () => { edit(t('fc.undo.edit'), (l) => { l.find((x) => x.id === rec.id).gates = []; }); render(); ctx.refresh(); } }, t('fc.nogates')) : '',
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fc-csv': rec.id, onclick: () => csv(rec) }, t('fc.csv'))));
    });
    body.replaceChildren(cards.length ? el('div', {}, ...cards) : el('p', { className: 'cv-note' }, t('fc.none')));
  }
  function open() {
    if (dlg) { dlg.remove(); dlg = null; }
    const id = 'cv-fc', d = F.defaults(U());
    const fld = (k, def) => { form[k] ??= ''; const i = el('input', { type: 'text', className: 'cv-input', id: id + '-' + k, placeholder: String(def), style: 'width:5rem', value: form[k] === '' ? '' : String(form[k]), onchange: () => { form[k] = i.value; } }); return el('label', { for: id + '-' + k }, t('fc.f.' + kb(k), { u: U() }), ' ', i); };
    const style = el('select', { className: 'cv-select', 'data-fc-style': '', 'aria-label': t('fc.f.style'), onchange: () => { form.style = style.value; form.styleSet = true; } }, ...F.STYLES.map((o) => el('option', { value: o, selected: form.style === o }, t('fc.o.' + o))));
    const terr = el('select', { className: 'cv-select', 'data-fc-terrain': '', 'aria-label': t('fc.f.terrain'), onchange: () => { form.terrain = terr.value; form.terrainSet = true; } }, ...F.TERRAIN.map((o) => el('option', { value: o, selected: form.terrain === o }, t('fc.o.' + o))));
    // 0.11 SU.1814b: the Library picker. Fence types are Library items of kind fence-type (lib/fence libraryTypes); a Library item file can be read too
    const file = el('input', { type: 'file', accept: '.json,application/json', hidden: true, 'data-fc-typefile': '' });
    const typeNote = el('span', { className: 'cv-note', 'data-fc-typenote': '' }, item ? t('fc.type.using', { name: item.name || '' }) : '');
    const opt = (value, text, selected = false) => el('option', { value, selected }, text);
    const typeSel = el('select', { className: 'cv-select', 'data-fc-type': '', 'aria-label': t('fc.f.type') }, opt('', t('fc.type.none')), ...(item ? [opt('x', item.name || t('fc.type.file'), true)] : []), opt('#file', t('fc.type.file')));
    const use = (it) => {
      item = it;
      typeNote.textContent = it ? t('fc.type.using', { name: it.name || '' }) : '';
      if (it) { const pt = F.typeFromItem(it, U()); if (pt?.style) { style.value = pt.style; form.style = pt.style; form.styleSet = false; } if (pt?.terrain) { terr.value = pt.terrain; form.terrain = pt.terrain; form.terrainSet = false; } }
    };
    typeSel.onchange = async () => {
      const v = typeSel.value;
      if (v === '') { use(null); return; }
      if (v === '#file') { typeSel.value = item ? 'x' : ''; file.click(); return; }
      if (v === 'x') return;
      const row = (types || []).find((r) => 'u:' + r.uuid === v), it = row ? await F.loadLibraryType(row) : null;
      if (!it) { ctx.say(t('fc.err.type')); typeSel.value = ''; use(null); return; }
      use(it);
    };
    file.onchange = async () => {
      const f = file.files?.[0]; file.value = '';
      if (!f) return;
      const it = F.typeFromFile(await f.text());
      if (!it) { ctx.say(t('fc.err.type')); return; }
      [...typeSel.options].filter((o) => o.value === 'x').forEach((o) => o.remove());
      typeSel.insertBefore(opt('x', it.name || t('fc.type.file')), typeSel.lastElementChild); typeSel.value = 'x'; use(it);
    };
    const fillTypes = async () => {
      types = await F.libraryTypes();
      const keep = typeSel.value;
      for (const r of types) typeSel.insertBefore(opt('u:' + r.uuid, r.name), typeSel.lastElementChild);
      if (!types.length) typeSel.title = t('fc.type.empty');
      typeSel.value = keep;
    };
    fillTypes();
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-fc-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('fc.title')), close),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('fc.lede')),
        el('div', { className: 'cv-row' }, el('label', {}, t('fc.f.type'), ' ', typeSel), file, typeNote),
        el('div', { className: 'cv-row' }, style, terr, fld('height', d.height), fld('postSpacing', d.postSpacing), fld('gateWidth', d.gateWidth)),
        el('div', { className: 'cv-row' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-fc-fromsel': '', onclick: () => make(false) }, t('fc.fromsel')), el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fc-fromsel-gate': '', onclick: () => make(true) }, t('fc.fromsel.gate'))),
        el('p', { className: 'cv-note' }, t('fc.defaults')), el('div', { 'data-fc-body': '' }))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; ctx.refocus(); });
    ctx.root.append(dlg); render(); dlg.showModal();
  }
  return {
    command(c) { if (c === 'fences') { open(); return true; } return false; },
    layouts: () => list().map((rec) => ({ rec, layout: layoutOf(rec) })),
    sceneItems: (mm) => list().flatMap((rec) => F.planItems(layoutOf(rec), { mmPerUnit: mm })),
    open, refreshWindow: () => render(),
  };
}
