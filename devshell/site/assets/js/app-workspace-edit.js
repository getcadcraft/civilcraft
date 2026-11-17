/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-edit.js — change a layout on the screen (0.10 UI.5 + UI.6). Two ways in, one result: a layout of the person's own.
 *
 *   Right-click a tool (ribbon, tool rows, toolbox)   Remove from here · Move earlier / later · Move to another group · Add a tool… · New group ·
 *                                                     Rename the group · Reset this block          (UI.6: what a block holds, layout format v2 `tools`)
 *   Arrange mode (Settings › Layout › Arrange)        every block gets a handle; drag it to a place on the slot map (the format's places are the rule: a
 *                                                     place the block cannot go to says so), or press Enter on the handle for a menu of places (UI.5)
 *
 * Neither changes a built-in layout. The first change makes "My <layout name>" (`file:my-<id>`, the person's imported-file path, so it exports and
 * imports byte for byte like any file) and chooses it; later changes edit that file. Every change is one undoable step while Arrange mode is on.
 * Everything goes through the format (validateLayout, resolveLayout) by importText: this file never writes a layout the format would refuse.
 *
 *   layoutEditor(E) → { contextmenu(e) → bool, arrange(on?), arranging(), undo(), redo(), reset(), derive(), editTools(at, change) }
 * E = { F, T, el, say, current() → { key, layout } | null, builtin(id), importText(text), use(key), reload(), remove(key), caps(), dataFor(kind) → the app's lists (built tools only),
 *       label(id, block), openMenu(e, items), commands() → [{ id, label }], extra(button) → [[text, fn]] (a block's own entries), root }
 */
import { editTools, specFromData } from './app-workspace-tools.js';

const KINDS = { ribbon: 'ribbon', toolrows: 'toolrows', toolbox: 'toolbox' };
const PLACE_LABEL = { top: 'Top', bottom: 'Bottom', 'left-panel': 'Left panel', 'right-panel': 'Right panel', 'stage-top': 'Over the drawing, top', 'stage-bottom': 'Over the drawing, bottom',
  'stage-left': 'Drawing, left column', 'stage-right': 'Drawing, right column', 'view-top': 'View tabs, top', 'view-bottom': 'View bar, bottom', float: 'Floating', none: 'Hidden' };
const clone = (x) => JSON.parse(JSON.stringify(x));

export function layoutEditor(E) {
  const { F, T, el } = E;
  const word = (k, fb) => { const s = T(k); return s && s !== k ? s : fb; };
  const undoStack = [], redoStack = [];
  let arranging = false, layer = null, bar = null, map = null, drag = null;

  // ------------------------------------------------------------------ the layout of my own
  /** A copy of the layout in use, ready to change: the person's own file in place, or "My <name>" made from a built-in or an add-on's. */
  function derive() {
    const c = E.current(); if (!c) return null;
    const L = clone(c.layout);
    if (c.key.startsWith('file:') && /^my-/.test(L.id)) return L;
    const nm = (L.nameKey && E.T(L.nameKey) !== L.nameKey ? E.T(L.nameKey) : L.name);
    const id = ('my-' + L.id.replace(/^my-/, '')).slice(0, 40).replace(/-+$/, '');
    delete L.nameKey; delete L.hintKey; delete L.author; delete L.license;
    return { ...L, version: 2, id, name: ('My ' + nm).slice(0, F.LIMITS.name), description: word('shell.ws.arr.desc', 'A layout arranged on the screen.') };
  }
  /** Save a layout object through the format and use it. `push` = this is a new step (Arrange's undo). */
  function commit(obj, push = true) {
    const c = E.current();
    if (push && c) { undoStack.push(JSON.stringify(c.layout)); redoStack.length = 0; }
    const r = F.validateLayout(obj);
    if (!r.ok) { E.say(T('shell.ws.bad', { why: T('shell.ws.why.' + r.error) }), true); return false; }
    const done = E.importText(F.exportLayout(r.layout));
    if (!done?.ok) { E.say(done?.message || T('shell.ws.bad', { why: T('shell.ws.why.unknown') }), true); return false; }
    if (c && c.key === done.key) E.reload(); else E.use(done.key);
    setTimeout(() => { placeHandles(); syncBar(); }, 250);
    return true;
  }
  function undo() { const t = undoStack.pop(); const c = E.current(); if (!t || !c) return false; redoStack.push(JSON.stringify(c.layout)); const r = commitText(t); return r; }
  function redo() { const t = redoStack.pop(); const c = E.current(); if (!t || !c) return false; undoStack.push(JSON.stringify(c.layout)); return commitText(t); }
  function commitText(t) { const o = JSON.parse(t); const r = F.validateLayout(o); if (!r.ok) return false; const done = E.importText(F.exportLayout(r.layout)); if (!done?.ok) return false; if (E.current()?.key === done.key) E.reload(); else E.use(done.key); syncBar(); return true; }
  /** Back to the built-in this layout came from (or classic), and forget the person's file. */
  function reset() {
    const c = E.current(); if (!c || !c.key.startsWith('file:')) return false;
    const base = c.layout.id.replace(/^my-/, ''), has = !!E.builtin(base);
    E.use(has ? base : 'standard'); E.remove(c.key); undoStack.length = 0; redoStack.length = 0; E.say(word('shell.ws.edit.reset.done', 'The built-in layout is back.')); return true;
  }

  // ------------------------------------------------------------------ UI.6: what a block holds
  const blockOf = (L, kind) => L.blocks.find((b) => b.block === kind);
  function specFor(L, kind) { const b = blockOf(L, kind); return b?.tools || specFromData(kind, E.dataFor(kind)); }
  function editTool(at, change, kind) {
    const L = derive(); if (!L) return false;
    const b = blockOf(L, kind); if (!b) return false;
    const r = editTools(specFor(L, kind), at, change);
    if (!r.changed) return false;
    b.tools = r.spec;
    return commit(L);
  }
  function resetBlock(kind) { const L = derive(); const b = L && blockOf(L, kind); if (!b?.tools) return false; delete b.tools; return commit(L); }

  /** Pick one tool: the app's own tools first, then every command of its input registry. */
  function pickTool(kind, done) {
    const own = E.caps().tools.map((id) => ({ id, label: E.label(id, kind), group: word('shell.ws.edit.own', 'Tools') }));
    const cmds = E.commands().map((c) => ({ id: '+cmd:' + c.id, label: c.label, group: word('shell.ws.mine.commands', 'Commands') }));
    const seen = new Set(own.map((x) => x.label.toLowerCase()));
    const items = [...own, ...cmds.filter((x) => !seen.has(x.label.toLowerCase()))].filter((x) => x.label);
    const query = el('input', { type: 'search', placeholder: word('shell.ws.inv.find', 'Find'), 'aria-label': word('shell.ws.inv.find', 'Find') });
    const list = el('div', { className: 'ws-mine-list', role: 'list' });
    const dlg = el('dialog', { className: 'ws-dialog ws-mine-pick', 'aria-label': word('shell.ws.edit.add', 'Add a tool') }, el('h2', {}, word('shell.ws.edit.add', 'Add a tool')), query, list,
      el('div', { className: 'ws-dialog-actions' }, el('button', { type: 'button', 'data-ws-dismiss': '' }, T('shell.ws.close'))));
    const render = () => {
      const q = query.value.trim().toLowerCase();
      list.replaceChildren(...items.filter((x) => !q || x.label.toLowerCase().includes(q)).slice(0, 200).map((x) => el('button', { type: 'button', className: 'ws-mine-row', role: 'listitem', 'data-ws-pick': x.id }, x.label, el('small', {}, ' ' + x.group))));
    };
    query.addEventListener('input', render); render();
    dlg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.hasAttribute('data-ws-dismiss')) { dlg.close(); return; } if (b.dataset.wsPick) { dlg.close(); done(b.dataset.wsPick); } });
    dlg.addEventListener('close', () => dlg.remove()); E.root.ownerDocument.body.append(dlg); dlg.showModal(); query.focus();
  }

  /** The right-click menu of a tool button; true when it took the event. */
  function contextmenu(e) {
    const c = E.current(); if (!c) return false;
    const b = e.target.closest?.('.ws-tool[data-ws-command], .tbx-tool[data-tbx-tool]'); if (!b) return false;
    const toolbox = !!b.dataset.tbxTool, id = b.dataset.tbxTool || b.dataset.wsCommand, kind = toolbox ? 'toolbox' : (b.dataset.wsBlock === 'toolrows' ? 'toolrows' : b.dataset.wsBlock === 'ribbon' ? 'ribbon' : null);
    if (!kind || !KINDS[kind] || !blockOf(c.layout, kind)) return false;
    const gEl = b.closest('[data-ws-group], [data-tbx-group], [data-tr-group]'); if (!gEl) return false;
    const group = gEl.dataset.wsGroup || gEl.dataset.tbxGroup || gEl.dataset.trGroup;
    const tab = kind === 'ribbon' ? b.closest('.ws-ribbon')?.dataset.wsTabId : undefined;
    const at = { group, tool: id, tab };
    const items = [
      ...(E.extra ? E.extra(b) : []),
      [word('shell.ws.edit.remove', 'Remove from here'), () => editTool(at, { op: 'remove' }, kind)],
      [word('shell.ws.edit.earlier', 'Move earlier'), () => editTool(at, { op: 'move', by: -1 }, kind)],
      [word('shell.ws.edit.later', 'Move later'), () => editTool(at, { op: 'move', by: 1 }, kind)],
      [word('shell.ws.edit.add', 'Add a tool…'), () => pickTool(kind, (tool) => editTool(at, { op: 'add', tool }, kind))],
      [word('shell.ws.edit.group', 'New group…'), () => { const name = E.root.ownerDocument.defaultView.prompt(word('shell.ws.edit.group.name', 'Name of the group'), ''); if (name) editTool(at, { op: 'group', name }, kind); }],
      [word('shell.ws.edit.rename', 'Rename the group…'), () => { const name = E.root.ownerDocument.defaultView.prompt(word('shell.ws.edit.rename.name', 'Name of the group'), gEl.getAttribute('aria-label') || ''); if (name !== null) editTool(at, { op: 'rename', name }, kind); }],
      ...(blockOf(c.layout, kind)?.tools ? [[word('shell.ws.edit.reset.block', 'Reset this block'), () => resetBlock(kind)]] : []),
    ];
    e.preventDefault(); E.openMenu(e, items); return true;
  }

  // ------------------------------------------------------------------ UI.5: arrange by dragging
  const blockEls = () => {
    const out = [];
    for (const r of E.root.ownerDocument.querySelectorAll('[data-ws-blk]')) { const kind = r.dataset.wsBlk; if (!out.some((x) => x.kind === kind)) out.push({ kind, el: r }); }
    return out;
  };
  function allowed(kind) { return F.BLOCKS[kind]?.places || []; }
  function moveBlock(kind, place) {
    const L = derive(); if (!L) return false;
    const b = blockOf(L, kind); if (!b || b.place === place) return false;
    if (!allowed(kind).includes(place)) { E.say(word('shell.ws.arr2.cannot', '{name} cannot go there.').replace('{name}', kind), true); return false; }
    b.place = place; b.order = Math.min(F.LIMITS.order, 1 + Math.max(-1, ...L.blocks.filter((x) => x !== b && x.place === place).map((x) => x.order)));
    const ok = commit(L);
    if (ok) E.say(word('shell.ws.arr2.moved', '{name} moved to {place}.').replace('{name}', kind).replace('{place}', PLACE_LABEL[place] || place));
    return ok;
  }
  function buildMap() {
    const cell = (place, cls = '') => el('button', { type: 'button', className: 'ws-arr-place ' + cls, 'data-ws-place': place, tabindex: -1 }, PLACE_LABEL[place]);
    return el('div', { className: 'ws-arr-map', role: 'presentation', 'aria-hidden': 'true' },
      cell('top', 'ws-ap-top'), el('div', { className: 'ws-ap-mid' }, cell('left-panel', 'ws-ap-lp'),
        el('div', { className: 'ws-ap-stage' }, cell('stage-top'), cell('view-top'), el('div', { className: 'ws-ap-row' }, cell('stage-left'), el('div', { className: 'ws-ap-draw' }, 'Drawing'), cell('stage-right')), cell('view-bottom'), cell('stage-bottom')),
        cell('right-panel', 'ws-ap-rp')), cell('bottom', 'ws-ap-bottom'), el('div', { className: 'ws-ap-side' }, cell('float'), cell('none')));
  }
  function placeHandles() {
    if (!arranging || !layer) return;
    layer.replaceChildren(...blockEls().map(({ kind, el: n }) => {
      const r = n.getBoundingClientRect();
      const h = el('button', { type: 'button', className: 'ws-arr-handle', 'data-ws-arrange': kind, 'aria-label': word('shell.ws.arr2.handle', 'Move {name}').replace('{name}', kind), title: word('shell.ws.arr2.handle', 'Move {name}').replace('{name}', kind) }, '⋮⋮');
      h.style.left = Math.max(0, r.left) + 'px'; h.style.top = Math.max(0, r.top) + 'px';
      h.addEventListener('pointerdown', (ev) => { if (ev.button !== 0) return; drag = { kind, x: ev.clientX, y: ev.clientY, on: false, h }; h.setPointerCapture(ev.pointerId); ev.preventDefault(); });
      h.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); const r2 = h.getBoundingClientRect();
        E.openMenu({ target: h, clientX: r2.left, clientY: r2.bottom }, allowed(kind).map((p) => [PLACE_LABEL[p] || p, () => moveBlock(kind, p)])); } });
      return h;
    }));
  }
  const doc = () => E.root.ownerDocument;
  const onMove = (ev) => {
    if (!drag) return;
    if (!drag.on && Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 5) return;
    drag.on = true; map.hidden = false;
    for (const p of map.querySelectorAll('[data-ws-place]')) { const ok = allowed(drag.kind).includes(p.dataset.wsPlace); p.classList.toggle('ws-ap-ok', ok); p.classList.toggle('ws-ap-no', !ok); p.title = ok ? '' : word('shell.ws.arr2.cannot', '{name} cannot go there.').replace('{name}', drag.kind); }
    const under = doc().elementFromPoint(ev.clientX, ev.clientY)?.closest?.('[data-ws-place]');
    for (const p of map.querySelectorAll('.ws-ap-hot')) p.classList.remove('ws-ap-hot');
    under?.classList.add('ws-ap-hot'); drag.over = under?.dataset.wsPlace || null;
  };
  const onUp = () => {
    if (!drag) return; const d = drag; drag = null; map.hidden = true;
    for (const p of map.querySelectorAll('.ws-ap-hot, .ws-ap-ok, .ws-ap-no')) p.classList.remove('ws-ap-hot', 'ws-ap-ok', 'ws-ap-no');
    if (d.on && d.over) moveBlock(d.kind, d.over);
  };
  function syncBar() { if (!bar) return; bar.querySelector('[data-ws-arr-undo]').disabled = !undoStack.length; bar.querySelector('[data-ws-arr-redo]').disabled = !redoStack.length; setTimeout(placeHandles, 120); }
  function arrange(on = !arranging) {
    if (on === arranging) return arranging;
    const d = doc();
    if (!on) { arranging = false; layer?.remove(); bar?.remove(); map?.remove(); layer = bar = map = null; d.body.classList.remove('ws-arranging'); d.removeEventListener('pointermove', onMove); d.removeEventListener('pointerup', onUp); d.defaultView.removeEventListener('resize', placeHandles); return false; }
    if (!E.current()) return false;
    arranging = true; d.body.classList.add('ws-arranging');
    layer = el('div', { className: 'ws-arr-layer' }); map = buildMap(); map.hidden = true;
    const btn = (key, fb, attr) => el('button', { type: 'button', [attr]: '' }, word(key, fb));
    bar = el('div', { className: 'ws-arr-bar', role: 'toolbar', 'aria-label': word('shell.ws.arr2.bar', 'Arrange') },
      el('span', {}, word('shell.ws.arr2.hint', 'Drag a block by its handle to a place, or press Enter on a handle.')),
      btn('shell.ws.arr2.undo', 'Undo', 'data-ws-arr-undo'), btn('shell.ws.arr2.redo', 'Redo', 'data-ws-arr-redo'), btn('shell.ws.arr2.reset', 'Reset', 'data-ws-arr-reset'), btn('shell.ws.arr2.done', 'Done', 'data-ws-arr-done'));
    bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-ws-arr-undo')) undo(); else if (b.hasAttribute('data-ws-arr-redo')) redo(); else if (b.hasAttribute('data-ws-arr-reset')) { reset(); arrange(false); } else if (b.hasAttribute('data-ws-arr-done')) arrange(false); });
    d.body.append(layer, map, bar);
    d.addEventListener('pointermove', onMove); d.addEventListener('pointerup', onUp); d.defaultView.addEventListener('resize', placeHandles);
    placeHandles(); syncBar();
    return true;
  }
  return { contextmenu, arrange, arranging: () => arranging, undo, redo, reset, derive, editTools: editTool, moveBlock, handles: placeHandles, undoDepth: () => undoStack.length };
}
