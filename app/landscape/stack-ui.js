/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stack-ui.js — the ground modifiers' stack and the live level labels on the page (0.8 LA.4, session `landscape-arch_PART_4`): the Levels
 * menu (Spot level, Gradient arrow, Ground modifiers…), the Ground modifiers dialog (every object that shapes the proposed ground in one
 * ordered list; drag a row or use the arrows to reorder; later wins inside overlaps; cut and fill per modifier and in total; overlaps), and
 * the spot levels / gradient arrows that read the proposed (or existing) surface every time they are drawn. The maths is
 * lib/landscape/stack.js; the terrain is CivilCraft's own (project.graded()); the existing ground is never changed.
 *
 *   createStackUi(ctx, { edit, LS, U }) → { menu, tools, closed, hints, command, click, finish, isMine, pick, props, grip, remove,
 *     sceneItems(unitPerMm), overlay, updateTools(tool), modifiers() }
 */
import { gradeItems } from './grade.js';
import { cutFillBy, moveInOrder, levelItems, levelReadout, cleanLevels } from './stack.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const TOOLS = ['ls-spotlevel', 'ls-gradearrow'];
const KIND_KEY = { 'ls-platform': 'ls.gr.platform', 'ls-berm': 'ls.gr.berm', 'ls-swale': 'ls.gr.swale', 'ls-area': 'ls.gr.area', 'ls-paving': 'ls.h.k.paving', 'ls-path': 'ls.h.k.path',
  'ls-steps': 'ls.h.k.steps', 'ls-wall': 'ls.h.k.wall', 'ls-ramp': 'ls.h.k.ramp', 'ls-planted': 'ls.a.head', 'ls-freeform': 'ls.tb.freeform' };

export function createStackUi(ctx, { edit, LS, U }) {
  const { el, root } = ctx;
  const P = () => ctx.project();
  const levels = () => LS().levels || [];
  const find = (id) => levels().find((l) => l.id === id) || null;
  const uLen = () => (U() === 'm' ? 'm' : 'ft');
  const item = (cmd, label, title, role = 'menuitemcheckbox') => el('button', { type: 'button', role, dataset: { cmd }, title }, label);
  const menu = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Levels' } },   // i18n-ignore: the menu's key
    el('summary', { className: 'cv-tool', title: t('ls.lv.menu.title') }, el('i', { className: 'bi bi-layers', 'aria-hidden': 'true' }), el('span', {}, t('ls.lv.menu'))),
    el('div', { className: 'cv-menu-list', role: 'menu' },
      item('ls-stack', t('ls.st.open'), t('ls.st.open.title'), 'menuitem'),
      el('hr'),
      item('ls-spotlevel', t('ls.lv.spot'), t('ls.lv.spot.title')),
      item('ls-gradearrow', t('ls.lv.grade'), t('ls.lv.grade.title'))));
  function updateTools(tool) { for (const b of menu.querySelectorAll('[data-cmd]')) if (TOOLS.includes(b.dataset.cmd)) b.setAttribute('aria-checked', String(tool === b.dataset.cmd)); }

  /** The landscape items that shape the ground, in the stack's order, with the region each one graded (null when it failed). */
  function modifiers() {
    const ls = LS(), mine = gradeItems(ls, U()), all = P().gradeItems(), g = P().graded();
    const regionOf = new Map(all.map((it, i) => [String(it.id), g.regions?.[i] || null]));
    const nameOf = new Map([...(ls.grading || []), ...(ls.hardscape || []), ...(ls.areas || []), ...(ls.freeform || [])].map((x) => [x.id, x.name]));
    return mine.map((it) => ({ id: it.id, kind: it.kind, name: nameOf.get(it.id) || it.name, region: regionOf.get(String(it.id)) || null,
      selKind: it.kind === 'ls-planted' ? 'ls-pa' : /^ls-(platform|berm|swale|area)$/.test(it.kind) ? 'ls-grade' : it.kind === 'ls-freeform' ? 'ls-ff' : 'ls-hard' }));
  }
  function command(c) {
    if (c === 'ls-stack') { dialog(); return true; }
    if (!TOOLS.includes(c)) return false;
    if (!ctx.surface()) { ctx.say(t('ls.gr.need.surface')); return true; }
    ctx.setTool(ctx.tool() === c ? 'select' : c);
    if (ctx.tool() === c) ctx.say(t(c === 'ls-spotlevel' ? 'ls.lv.spot.hint' : 'ls.lv.grade.hint'));
    return true;
  }
  function click(tool, w) {
    if (tool !== 'ls-spotlevel') return false;
    const id = P().nextId('l');
    edit(t('ls.lv.undo.spot'), (l) => { l.levels = cleanLevels([...(l.levels || []), { id, kind: 'spot', x: w.x, y: w.y, on: 'proposed' }]); });
    const r = levelReadout(find(id), ctx.surface());
    ctx.say(r ? t('ls.lv.spot.done', { z: fixed(r.z, 2) }) : t('ls.lv.off'));
    return true;
  }
  function finish(tool, pts) {
    if (tool !== 'ls-gradearrow') return false;
    if (pts.length < 2) { ctx.say(t('ls.hedge.need2')); return false; }
    const a = pts[0], b = pts[pts.length - 1], id = P().nextId('l');
    edit(t('ls.lv.undo.grade'), (l) => { l.levels = cleanLevels([...(l.levels || []), { id, kind: 'grade', x: a.x, y: a.y, x2: b.x, y2: b.y, on: 'proposed' }]); });
    ctx.select({ kind: 'ls-lvl', id });
    const r = levelReadout(find(id), ctx.surface());
    ctx.say(r ? t('ls.lv.grade.done', { pct: fixed(r.pct, 1) }) : t('ls.lv.off'));
    return true;
  }
  const isMine = (sel) => sel?.kind === 'ls-lvl';
  function pick(w, tol) {
    for (const l of [...levels()].reverse()) {
      if (Math.hypot(l.x - w.x, l.y - w.y) <= tol * 1.5) return { kind: 'ls-lvl', id: l.id };
      if (l.kind === 'grade') { const dx = l.x2 - l.x, dy = l.y2 - l.y, L = dx * dx + dy * dy, s = Math.max(0, Math.min(1, ((w.x - l.x) * dx + (w.y - l.y) * dy) / L)); if (Math.hypot(w.x - l.x - s * dx, w.y - l.y - s * dy) <= tol) return { kind: 'ls-lvl', id: l.id }; }
    }
    return null;
  }
  /** A spot moves whole; an arrow by its start (the civilcraft.js grip moves {x, y} of a listed object, one undo step). */
  function grip(sel) {
    const l = isMine(sel) && find(sel.id);
    return l ? { list: levels(), only: levels().indexOf(l), label: t('ls.undo.move'), get: () => P().state.landscape?.levels } : null;
  }
  function remove(sel) {
    const l = isMine(sel) && find(sel.id);
    if (!l) return false;
    edit(t('ls.undo.delete'), (s) => { s.levels = s.levels.filter((x) => x.id !== l.id); });
    return true;
  }
  function props(sel, box, head) {
    const l = isMine(sel) && find(sel.id);
    if (!l) return false;
    head.textContent = t(l.kind === 'grade' ? 'ls.lv.grade' : 'ls.lv.spot');
    const on = el('select', { className: 'cv-select', id: 'cv-lv-on', 'data-lv-on': '' }, el('option', { value: 'proposed' }, t('ls.lv.proposed')), el('option', { value: 'existing' }, t('ls.lv.existing')));
    on.value = l.on;
    on.addEventListener('change', () => edit(t('ls.lv.undo.on'), () => { find(l.id).on = on.value; }));
    const sf = l.on === 'existing' ? ctx.existing?.() : ctx.surface(), r = levelReadout(l, sf);
    const facts = !r ? [[t('ls.lv.reads'), t('ls.lv.off')]] : l.kind === 'grade'
      ? [[t('ls.lv.z1'), fixed(r.z1, 3) + ' ' + uLen()], [t('ls.lv.z2'), fixed(r.z2, 3) + ' ' + uLen()], [t('ls.lv.run'), fixed(r.run, 2) + ' ' + uLen()], [t('ls.lv.gradient'), `${fixed(r.pct, 2)} % (1:${fixed(r.ratio, 1)})`]]
      : [[t('ls.lv.reads'), fixed(r.z, 3) + ' ' + uLen()]];
    box.replaceChildren(el('div', { className: 'cv-props' }, el('label', { for: 'cv-lv-on' }, t('ls.lv.on')), on),
      el('div', { className: 'cv-props', 'data-lv-facts': '' }, ...facts.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)])),
      el('p', { className: 'cv-note' }, t('ls.lv.live')),
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return true;
  }
  function sceneItems(unitPerMm) {
    const L = levels();
    return L.length ? levelItems(L, { proposed: ctx.surface(), existing: ctx.existing?.() || null }, { unitPerMm, fixed: (v) => fixed(v, 2), words: { flat: t('ls.lv.flat') } }) : [];
  }
  function overlay(c2d, toScreen, C, sel) {
    const l = isMine(sel) && find(sel.id);
    if (!l) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.lineWidth = 2.5;
    const a = toScreen(l.x, l.y);
    c2d.beginPath(); c2d.arc(a.x, a.y, 7, 0, 2 * Math.PI);
    if (l.kind === 'grade') { const b = toScreen(l.x2, l.y2); c2d.moveTo(a.x, a.y); c2d.lineTo(b.x, b.y); }
    c2d.stroke(); c2d.restore();
  }

  // ---- the Ground modifiers dialog ----
  function dialog() {
    const body = el('tbody', {}), foot = el('tfoot', {}), over = el('div', { 'data-st-overlaps': '' });
    const vol = (v) => (U() === 'm' ? fixed(v, 1) + ' m³' : fixed(v / 27, 1) + ' CY');   // i18n-ignore: unit symbols
    function reorder(ids) { edit(t('ls.st.undo.order'), (l) => { l.stack = ids; }); render(); }
    function render() {
      const mods = modifiers(), ids = mods.map((m) => String(m.id));
      const cf = cutFillBy(ctx.existing?.() || null, P().graded().surface || null, mods.filter((m) => m.region).map((m) => ({ id: String(m.id), pts: m.region })));
      body.replaceChildren(...mods.map((m, i) => {
        const tr = el('tr', { draggable: 'true', dataset: { stRow: String(m.id) } },
          el('td', { className: 'num' }, String(i + 1)),
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { ctx.select({ kind: m.selKind, id: m.id }); dlg.close(); } }, m.name)),
          el('td', {}, t(KIND_KEY[m.kind] || 'ls.st.kind')),
          el('td', { className: 'num' }, m.region ? vol(cf.by[String(m.id)]?.cut || 0) : t('ls.st.failed')),
          el('td', { className: 'num' }, m.region ? vol(cf.by[String(m.id)]?.fill || 0) : ''),
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'data-st-up': String(m.id), disabled: i === 0, 'aria-label': t('ls.st.up'), title: t('ls.st.up'), onclick: () => reorder(moveInOrder(ids, String(m.id), i - 1)) }, el('i', { className: 'bi bi-arrow-up', 'aria-hidden': 'true' })),
            el('button', { type: 'button', className: 'cv-linkbtn', 'data-st-down': String(m.id), disabled: i === mods.length - 1, 'aria-label': t('ls.st.down'), title: t('ls.st.down'), onclick: () => reorder(moveInOrder(ids, String(m.id), i + 1)) }, el('i', { className: 'bi bi-arrow-down', 'aria-hidden': 'true' }))));
        tr.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(m.id)); e.dataTransfer.effectAllowed = 'move'; });
        tr.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        tr.addEventListener('drop', (e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id && id !== String(m.id) && ids.includes(id)) reorder(moveInOrder(ids, id, i)); });
        return tr;
      }));
      if (!mods.length) body.append(el('tr', {}, el('td', { colSpan: 6, className: 'cv-note' }, t('ls.st.none'))));
      foot.replaceChildren(el('tr', {}, el('th', { scope: 'row', colSpan: 3 }, t('ls.st.total')), el('td', { className: 'num', 'data-st-cut': '' }, vol(cf.total.cut)), el('td', { className: 'num', 'data-st-fill': '' }, vol(cf.total.fill)), el('td', {})));
      over.replaceChildren(el('p', { className: 'cv-note' }, t('ls.st.later')));
    }
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-st-h', 'data-ls-stack': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-st-h' }, t('ls.st.head'))),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('ls.st.lede')),
          el('div', { className: 'cv-ls-schwrap' }, el('table', { className: 'cv-groups', 'data-st-table': '' },
            el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), el('th', { scope: 'col' }, t('ls.b.name')), el('th', { scope: 'col' }, t('ls.a.kind')), el('th', { scope: 'col', className: 'num' }, t('ls.st.cut')), el('th', { scope: 'col', className: 'num' }, t('ls.st.fill')), el('th', {}))),
            body, foot)), over),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-st-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); ctx.refresh(); });
    root.append(dlg);
    render();
    dlg.showModal();
  }

  return { menu, tools: TOOLS, closed: new Set(), hints: { 'ls-spotlevel': 'ls.lv.spot.hint', 'ls-gradearrow': 'ls.lv.grade.hint' }, command, click, finish, isMine, pick, props, grip, remove, sceneItems, overlay, updateTools, modifiers };
}
