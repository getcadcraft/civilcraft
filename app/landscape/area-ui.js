/* SPDX-License-Identifier: Apache-2.0 */
/**
 * area-ui.js — planted areas on the page (0.8 LA.5, session `landscape-arch_PART_4`): the Planted area menu (lawn, bed, meadow,
 * groundcover), drawing one, its Properties (build-up, finished level, clipping, the mix with cultivar and size) and quantities.
 * landscape-ui.js composes it like grade-ui / hard-ui; the maths is planted.js and lib/landscape/areas.js.
 *
 *   createAreaUi(ctx, { edit, LS, U, index, current, speciesSelect, variantPick }) → { menu, tools, closed, hints, command, click,
 *     finish, isMine, pick, props, grip, remove, sceneItems, overlay, elements(), quantities(), updateTools(tool) }
 */
import { AREA_KINDS, EDGINGS, cleanAreas, areaQuantities, areaElements, areaQuantityItems } from './planted.js';
import { inside, edgeDist } from './planting.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const TOOLS = AREA_KINDS.map((k) => 'ls-pa-' + k);

export function createAreaUi(ctx, { edit, LS, U, index, current, speciesSelect, variantPick }) {
  const { el } = ctx;
  const P = () => ctx.project();
  const list = () => LS().areas || [];
  const find = (id) => list().find((a) => a.id === id) || null;
  const uLen = () => (U() === 'm' ? 'm' : 'ft');
  const item = (cmd, label, title) => el('button', { type: 'button', role: 'menuitemcheckbox', dataset: { cmd }, title }, label);
  const menu = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Planted areas' } },   // i18n-ignore: the menu's key
    el('summary', { className: 'cv-tool', title: t('ls.a.menu.title') }, el('i', { className: 'bi bi-grid-3x3-gap', 'aria-hidden': 'true' }), el('span', {}, t('ls.a.menu'))),
    el('div', { className: 'cv-menu-list', role: 'menu' }, ...AREA_KINDS.map((k) => item('ls-pa-' + k, t('ls.a.k.' + k), t('ls.a.k.' + k + '.title')))));
  function updateTools(tool) { for (const b of menu.querySelectorAll('[data-cmd]')) b.setAttribute('aria-checked', String(tool === b.dataset.cmd)); }

  function command(c) {
    if (!TOOLS.includes(c)) return false;
    ctx.setTool(ctx.tool() === c ? 'select' : c);
    if (ctx.tool() === c) ctx.say(t('ls.a.hint'));
    return true;
  }
  function finish(tool, pts) {
    const kind = tool.slice(6), xy = pts.map((p) => ({ x: p.x, y: p.y }));
    if (xy.length < 3) { ctx.say(t('ls.bed.need3')); return false; }
    const id = P().nextId('l'), n = list().filter((a) => a.kind === kind).length + 1, name = t('ls.a.name.' + kind, { n });
    const cur = current(), mix = kind !== 'lawn' && cur && index().has(cur) ? [{ key: cur, pct: 100 }] : [];
    const rec = cleanAreas([{ id, kind, name, pts: xy, mix, seed: n }], U())[0];
    edit(t('ls.gr.undo.draw', { name }), (l) => { l.areas = [...(l.areas || []), rec]; });
    ctx.select({ kind: 'ls-pa', id });
    const q = areaQuantities(find(id), LS(), index(), U());
    ctx.say(t('ls.a.done', { name, a: fixed(q.area, 1), u: uLen(), n: q.plants }) + (q.clipped ? ' ' + t('ls.a.clipped') : ''));
    return true;
  }
  const isMine = (sel) => sel?.kind === 'ls-pa';
  function pick(w, tol) { for (const a of [...list()].reverse()) if (inside(w.x, w.y, a.pts) || edgeDist(w.x, w.y, a.pts) <= tol) return { kind: 'ls-pa', id: a.id }; return null; }
  function grip(sel) { const a = isMine(sel) && find(sel.id); return a ? { list: a.pts, label: t('ls.undo.corner'), get: () => find(sel.id)?.pts } : null; }
  function remove(sel) {
    const a = isMine(sel) && find(sel.id);
    if (!a) return false;
    edit(t('ls.undo.delete'), (l) => { l.areas = l.areas.filter((x) => x.id !== a.id); });
    ctx.say(t('ls.deleted', { name: a.name }));
    return true;
  }

  function props(sel, box, head) {
    const a = isMine(sel) && find(sel.id);
    if (!a) return false;
    head.textContent = t('ls.a.head');
    const put = (fn) => edit(t('ls.h.undo.edit', { name: a.name }), () => fn(find(a.id)));
    const fields = [];
    const num = (label, id, value, set, { blankOk = false, min = 0, max = 100 } = {}) => fields.push(el('label', { for: id }, label), ctx.numInput(value ?? '', (v) => {
      const n = v.trim() === '' ? null : Number(v);
      if (n === null ? !blankOk : !(Number.isFinite(n) && n >= min && n <= max)) return false;
      put((x) => set(x, n)); return true;
    }, { label, id, calc: false }));
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pa-name', value: a.name, maxLength: 120 });
    nm.addEventListener('change', () => put((x) => { x.name = nm.value.trim().slice(0, 120) || a.name; }));
    const kind = el('select', { className: 'cv-select', id: 'cv-pa-kind' }, ...AREA_KINDS.map((k) => el('option', { value: k }, t('ls.a.k.' + k))));
    kind.value = a.kind;
    kind.addEventListener('change', () => put((x) => { x.kind = kind.value; }));
    const edging = el('select', { className: 'cv-select', id: 'cv-pa-edging' }, ...EDGINGS.map((k) => el('option', { value: k }, t('ls.a.e.' + (k || 'none')))));
    edging.value = a.buildup.edging;
    edging.addEventListener('change', () => put((x) => { x.buildup.edging = edging.value; }));
    const chk = (id, label, on, set) => { const c = el('input', { type: 'checkbox', id, checked: on }); c.addEventListener('change', () => put((x) => set(x, c.checked))); return el('label', { className: 'cv-check', for: id }, c, ' ', label); };
    fields.push(el('label', { for: 'cv-pa-name' }, t('ls.b.name')), nm, el('label', { for: 'cv-pa-kind' }, t('ls.a.kind')), kind);
    num(t('ls.a.topsoil', { u: uLen() }), 'cv-pa-top', a.buildup.topsoil, (x, n) => { x.buildup.topsoil = n; });
    num(t('ls.a.mulch', { u: uLen() }), 'cv-pa-mulch', a.buildup.mulch, (x, n) => { x.buildup.mulch = n; });
    fields.push(el('label', { for: 'cv-pa-edging' }, t('ls.a.edging')), edging);
    num(t('ls.a.level', { u: uLen() }), 'cv-pa-level', a.level, (x, n) => { x.level = n; }, { blankOk: true, min: -1e6, max: 1e6 });
    num(t('ls.b.spacing'), 'cv-pa-sp', a.spacing, (x, n) => { x.spacing = n; }, { blankOk: true, min: 0.05, max: 50 });
    const q = areaQuantities(a, LS(), index(), U());
    const mixRows = a.mix.map((m, i) => el('tr', { dataset: { paMix: String(i) } },
      el('td', {}, speciesSelect('cv-pa-mix-' + i, m.key, (k) => put((x) => { x.mix[i] = { key: k, pct: x.mix[i].pct }; })), ...variantPick('cv-pa-mixv-' + i, m, (cv, sup) => put((x) => { const o = x.mix[i]; if (cv) o.cv = cv; else delete o.cv; if (sup) o.sup = sup; else delete o.sup; }))),
      el('td', {}, ctx.numInput(m.pct, (v) => { const n = Number(v); if (!(n > 0 && n <= 100)) return false; put((x) => { x.mix[i].pct = n; }); return true; }, { label: t('ls.b.pct'), id: 'cv-pa-pct-' + i, width: '4.5rem', calc: false })),
      el('td', { className: 'num' }, String(q.mixCounts[i] ?? 0)),
      el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('ls.b.remove'), onclick: () => put((x) => { x.mix.splice(i, 1); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })))));
    const A = U() === 'm' ? (v) => t('ls.area.m', { a: fixed(v, 1) }) : (v) => t('ls.area.ft', { a: fixed(v, 0) });
    const vol = (v) => fixed(v, 2) + (U() === 'm' ? ' m³' : ' ft³');   // i18n-ignore: unit symbols
    box.replaceChildren(el('div', { className: 'cv-props' }, ...fields),
      el('div', { className: 'cv-checks' }, chk('cv-pa-membrane', t('ls.a.membrane'), a.buildup.membrane, (x, v) => { x.buildup.membrane = v; }), chk('cv-pa-clip', t('ls.a.clip'), a.clip, (x, v) => { x.clip = v; })),
      a.level == null ? el('p', { className: 'cv-note' }, t('ls.a.level.none')) : el('p', { className: 'cv-note' }, t('ls.a.level.on')),
      el('table', { className: 'cv-groups cv-ls-mix', 'data-pa-mix': '' }, el('caption', { className: 'cv-note' }, t('ls.b.mix')),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('ls.p.species')), el('th', { scope: 'col' }, t('ls.b.pct')), el('th', { scope: 'col', className: 'num' }, t('ls.b.qty')), el('th', {}))),
        el('tbody', {}, ...mixRows)),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pa-mix-add': '', disabled: a.mix.length >= 20, onclick: () => { const c = current(); if (!c || !index().has(c)) { ctx.say(t('ls.need.species')); return; } put((x) => { x.mix.push({ key: c, pct: x.mix.length ? 20 : 100 }); }); } }, t('ls.a.mixadd'))),
      el('div', { className: 'cv-props', 'data-pa-qty': '' }, ...[[t('ls.a.q.net'), A(q.area)], [t('ls.a.q.perim'), fixed(q.perimeter, 2) + ' ' + uLen()], [t('ls.a.q.edge'), fixed(q.edging, 2) + ' ' + uLen()],
        [t('ls.a.q.top'), vol(q.topsoil)], [t('ls.a.q.mul'), vol(q.mulch)], [t('ls.a.q.mem'), A(q.membrane)], [t('ls.b.count'), String(q.plants)]]
        .flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)])),
      q.clipped ? el('p', { className: 'cv-note', 'data-pa-clipped': '' }, t('ls.a.clipped')) : '',
      q.fill.capped ? el('p', { className: 'cv-report is-error' }, t('ls.b.capped')) : '',
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }

  function overlay(c2d, toScreen, C, sel) {
    const a = isMine(sel) && find(sel.id);
    if (!a) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5; c2d.beginPath();
    a.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.closePath(); c2d.globalAlpha = 0.1; c2d.fillStyle = C.action; c2d.fill(); c2d.globalAlpha = 1; c2d.stroke(); c2d.restore();
  }

  return { menu, tools: TOOLS, closed: new Set(TOOLS), hints: Object.fromEntries(TOOLS.map((x) => [x, 'ls.a.hint'])), command, click: () => false, finish, isMine, pick, props, grip, remove,
    sceneItems: () => [], overlay, elements: () => areaElements(LS(), index(), U(), { zAt: ctx.groundAt }), quantities: () => areaQuantityItems(LS(), index(), U()), updateTools };
}
