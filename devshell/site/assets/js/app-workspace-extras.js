/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-extras.js — three parts of the workspace layout engine (assets/js/app-workspace.js) asked for by Discord, 2026-10-24
 * (0.7 part 9, WS.20–WS.22; map docs/apps/app-workspace.md): the parts of the "Toolbox and info box" way of working that the engine
 * did not have yet. Each works in every app through what the app already has (its adapter, its Properties, its input registry);
 * no app gives new code for them.
 *
 *   myTools(E)     the toolbox's "My tools" group (toolbox option `mine`): MINE_SLOTS empty slots a person fills with any toolbox
 *                  tool or any command of the app's registry (click an empty slot, right-click a tool, or drag one in); kept per app
 *                  in localStorage cc-ws-mytools:<app> as 'tbx:<toolbox id>' | 'cmd:<registry id>' (a slot whose tool is not in this
 *                  build stays kept and shows empty)
 *   petPalette(E)  block `petpalette` (place `float`): a small palette by the pointer when something is picked in the drawing with
 *                  no tool running — the app's edit commands for a selection (adapter pet(state) → registry ids, else PET_IDS that
 *                  the registry has and the build shows), its Properties and a close button; Esc, the wheel, another click in the
 *                  drawing, a running tool or an empty selection put it away
 *   infoFields(E)  the info box's selection slot shows the picked element's main fields (adapter fields(state) → [{label, control}],
 *                  else fieldsIn(the Properties palette)): each a small twin of the app's own control, so a change goes through the
 *                  app's own input and change events — one code path, as everywhere in the layouts
 *
 * E = the engine's helpers: { A (adapter), app, T, el, btn, can, tool, runTool, explain, say, soon, state, stage }.
 */
export const MINE_SLOTS = 8;
export const PET_IDS = ['modify.move', 'edit.move', 'modify.copy', 'modify.rotate', 'modify.mirror', 'modify.offset', 'modify.stretch', 'modify.scale',
  'modify.array', 'edit.duplicate', 'edit.copy', 'edit.cut', 'edit.delete'];
const PET_MAX = 8;
const FIELDS_MAX = 6;

const reg = () => window.ccInput || null;
const tx = (k) => (k && window.ccShellT?.has?.(k) ? window.ccShellT(k) : String(k || ''));
const regCmd = (id) => reg()?.commands.find((c) => c.id === id) || null;
const regBuilt = (c) => !!(c && c.sel && document.querySelector(c.sel));
/** A registry command as the blocks show it: {label, icon, built}. */
export function regTool(id) { const c = regCmd(id); return { label: c ? tx(c.label) : id, icon: c?.icon || 'bi-dot', built: regBuilt(c) }; }
const regWhy = (id) => { const I = reg(); return !I ? 'no-registry' : I.why ? I.why(id) : ''; };

/** The labelled, editable controls inside `node` (a Properties pane), in order: [{label, control}] (at most `max`). */
export function fieldsIn(node, max = FIELDS_MAX) {
  if (!node) return [];
  const out = [];
  for (const c of node.querySelectorAll('input, select')) {
    if (out.length >= max) break;
    if (c.matches('[type="hidden"], [type="file"], [type="button"], [type="submit"], [type="reset"], [type="image"], [readonly]')) continue;
    const label = labelOf(c);
    if (label) out.push({ label, control: c });
  }
  return out;
}
function labelOf(c) {
  const l = c.labels?.[0];
  if (l) { const k = l.cloneNode(true); for (const x of k.querySelectorAll('input, select, textarea, button, option')) x.remove(); const s = k.textContent.replace(/\s+/g, ' ').trim(); if (s) return s; }
  if (c.getAttribute('aria-label')) return c.getAttribute('aria-label').trim();
  const dt = c.closest('dd')?.previousElementSibling;
  return dt?.tagName === 'DT' ? dt.textContent.replace(/\s+/g, ' ').trim() : '';
}

// =========================================================== My tools ===========================================================
export function myTools(E) {
  const KEY = 'cc-ws-mytools:' + E.app;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const slots = () => { const v = read(); return Array.from({ length: MINE_SLOTS }, (_, i) => (typeof v[i] === 'string' && /^(tbx|cmd):[\w.:-]{1,80}$/.test(v[i]) ? v[i] : null)); };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { E.say(E.T('shell.ws.mine.nostore'), true); } E.redraw(); };
  const toolboxIds = () => new Set((E.A.toolbox ? E.A.toolbox() : []).flatMap((g) => g.tools));
  /** What a slot holds: {kind, id, label, icon, built} or null. */
  function entry(ref) {
    if (!ref) return null;
    const [kind, id] = [ref.slice(0, 3), ref.slice(4)];
    if (kind === 'tbx') { if (!toolboxIds().has(id)) return null; const t = E.A.tool(id, 'toolbox'); return t.built === false ? null : { kind, id, label: t.label, icon: t.icon, built: true }; }
    const t = regTool(id); return t.built ? { kind, id, ...t } : null;
  }
  const icon = (ic) => (typeof ic === 'string' ? E.el('i', { className: 'bi ' + ic, 'aria-hidden': 'true' }) : ic ? ic.cloneNode(true) : E.el('i', { className: 'bi bi-square', 'aria-hidden': 'true' }));
  const sig = () => JSON.stringify(slots().map((r) => (entry(r) ? r : null)));
  /** The group, drawn with the toolbox (o.collapse: a <details> like the others). */
  function group(o, shut) {
    const buttons = slots().map((ref, i) => {
      const x = entry(ref);
      if (!x) return E.el('button', { type: 'button', className: 'tbx-tool tbx-empty', 'data-tbx-mine': i, 'data-mine-empty': '', title: E.T('shell.ws.mine.add.hint') },
        E.el('i', { className: 'bi bi-plus-square-dotted', 'aria-hidden': 'true' }), E.el('span', {}, E.T('shell.ws.mine.empty')));
      return E.el('button', { type: 'button', className: 'tbx-tool', 'data-tbx-mine': i, 'data-mine-ref': ref, 'aria-pressed': 'false', draggable: 'true', title: x.label }, icon(x.icon), E.el('span', {}, x.label));
    });
    const body = E.el('div', { className: 'tbx-tools tbx-mine' }, buttons);
    const label = E.T('shell.ws.mine');
    return o.collapse ? E.el('details', { className: 'tbx-group', open: !shut.has('mine'), 'data-tbx-group': 'mine' }, E.el('summary', {}, label), body)
      : E.el('section', { className: 'tbx-group', 'data-tbx-group': 'mine' }, E.el('div', { className: 'tbx-group-title' }, label), body);
  }
  const canOf = (x) => (x.kind === 'tbx' ? E.can(x.id, 'toolbox') : (() => { const w = regWhy(x.id); return { enabled: !w, reason: w === 'no-registry' ? '' : w }; })());
  /** Lit / greyed like the toolbox's own tools. */
  function refresh(list) {
    for (const b of list.querySelectorAll('[data-mine-ref]')) {
      const x = entry(b.dataset.mineRef); if (!x) continue;
      const a = canOf(x);
      b.setAttribute('aria-pressed', x.kind === 'tbx' && E.A.pressed?.(x.id, 'toolbox') ? 'true' : 'false');
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      b.title = x.label + (a.enabled ? '' : ' — ' + a.reason);
    }
  }
  function run(b) {
    const x = entry(b.dataset.mineRef); if (!x) return;
    if (x.kind === 'tbx') { E.runTool(x.id, 'toolbox', b); return; }
    const w = regWhy(x.id);
    if (w && w !== 'no-registry') { E.explain(x.label, w); return; }
    Promise.resolve(reg()?.run(x.id)).then(() => E.soon());
  }
  function put(i, ref) { const v = slots(); if (ref) { const at = v.indexOf(ref); if (at >= 0 && at !== i) v[at] = v[i]; } v[i] = ref; write(v); }
  function add(ref) {
    const v = slots();
    if (v.includes(ref)) { E.say(E.T('shell.ws.mine.there')); return; }
    const i = v.findIndex((r) => !entry(r));
    if (i < 0) { E.say(E.T('shell.ws.mine.full'), true); return; }
    v[i] = ref; write(v); E.say(E.T('shell.ws.mine.added', { name: entry(ref)?.label || '' }));
  }
  /** Choose what goes in slot i: the toolbox's tools, then every command of the app's registry; a search narrows both. */
  function pick(i) {
    const items = [];
    for (const g of E.A.toolbox ? E.A.toolbox() : []) for (const id of g.tools) { const x = entry('tbx:' + id); if (x) items.push({ ref: 'tbx:' + id, x, group: g.label }); }
    const seen = new Set(items.map((it) => it.x.label.toLowerCase()));
    for (const c of reg()?.commands || []) { const x = entry('cmd:' + c.id); if (x && !seen.has(x.label.toLowerCase())) items.push({ ref: 'cmd:' + c.id, x, group: E.T('shell.ws.mine.commands') }); }
    const query = E.el('input', { type: 'search', placeholder: E.T('shell.ws.inv.find'), 'aria-label': E.T('shell.ws.inv.find') });
    const list = E.el('div', { className: 'ws-mine-list', role: 'list' });
    const dlg = E.el('dialog', { className: 'ws-dialog ws-mine-pick', 'aria-label': E.T('shell.ws.mine.pick') }, E.el('h2', {}, E.T('shell.ws.mine.pick')), query, list,
      E.el('div', { className: 'ws-dialog-actions' }, slots()[i] ? E.btn(E.T('shell.ws.mine.remove'), { 'data-mine-clear': '' }) : null, E.btn(E.T('shell.ws.close'), { 'data-ws-dismiss': '' })));
    const render = () => {
      const q = query.value.trim().toLowerCase();
      list.replaceChildren(...items.filter((it) => !q || it.x.label.toLowerCase().includes(q) || it.group.toLowerCase().includes(q)).slice(0, 200).map((it) =>
        E.el('div', { role: 'listitem' }, E.el('button', { type: 'button', className: 'ws-mine-item', 'data-mine-pick': it.ref }, icon(it.x.icon), E.el('span', {}, it.x.label), E.el('small', {}, it.group)))));
    };
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.minePick) { put(i, b.dataset.minePick); dlg.close(); }
      else if (b.hasAttribute('data-mine-clear')) { put(i, null); dlg.close(); }
      else if (b.hasAttribute('data-ws-dismiss')) dlg.close();
    });
    query.addEventListener('input', render);
    document.body.append(dlg); render(); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal(); query.focus();
  }
  // a small menu by the pointer (right-click or the context-menu key on a tool): add to My tools, or change / remove a slot
  let menu = null;
  function closeMenu() { if (!menu) return; menu.box.remove(); menu.doc.removeEventListener('pointerdown', menu.away, true); menu.doc.removeEventListener('keydown', menu.key, true); menu = null; }
  function openMenu(e, items) {
    closeMenu();
    const doc = e.target.ownerDocument, r = e.target.closest('button').getBoundingClientRect();
    const box = E.el('div', { className: 'ws-ctx-menu', role: 'menu' }, items.map(([text, fn]) => {
      const b = E.el('button', { type: 'button', role: 'menuitem' }, text); b.addEventListener('click', () => { closeMenu(); fn(); }); return b;
    }));
    const x = e.clientX || r.left + 8, y = e.clientY || r.bottom;
    box.style.left = Math.min(x, doc.defaultView.innerWidth - 240) + 'px'; box.style.top = Math.min(y, doc.defaultView.innerHeight - 40 * items.length - 8) + 'px';
    doc.body.append(box);
    const away = (ev) => { if (!box.contains(ev.target)) closeMenu(); };
    const key = (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeMenu(); } };
    doc.addEventListener('pointerdown', away, true); doc.addEventListener('keydown', key, true);
    menu = { box, doc, away, key };
    box.querySelector('button')?.focus();
  }
  /** Engine listeners call these; each returns true when it handled the event. */
  const on = {
    click(b) {
      if (!b.hasAttribute('data-tbx-mine')) return false;
      if (b.hasAttribute('data-mine-empty')) pick(Number(b.dataset.tbxMine)); else run(b);
      return true;
    },
    contextmenu(e) {
      const b = e.target.closest?.('[data-tbx-tool], [data-tbx-mine]'); if (!b) return false;
      e.preventDefault();
      if (b.dataset.tbxTool) { const ref = 'tbx:' + b.dataset.tbxTool; openMenu(e, [[E.T('shell.ws.mine.add'), () => add(ref)]]); return true; }
      const i = Number(b.dataset.tbxMine);
      openMenu(e, b.hasAttribute('data-mine-empty') ? [[E.T('shell.ws.mine.pick'), () => pick(i)]]
        : [[E.T('shell.ws.mine.change'), () => pick(i)], [E.T('shell.ws.mine.remove'), () => put(i, null)]]);
      return true;
    },
    dragstart(e) {
      const b = e.target.closest?.('[data-tbx-tool], [data-mine-ref]'); if (!b || !e.dataTransfer) return false;
      e.dataTransfer.setData('text/x-cc-tool', b.dataset.tbxTool ? 'tbx:' + b.dataset.tbxTool : b.dataset.mineRef);
      e.dataTransfer.effectAllowed = 'copyMove'; return true;
    },
    dragover(e) { if (e.target.closest?.('[data-tbx-mine]') && [...(e.dataTransfer?.types || [])].includes('text/x-cc-tool')) { e.preventDefault(); return true; } return false; },
    drop(e) {
      const b = e.target.closest?.('[data-tbx-mine]'); const ref = e.dataTransfer?.getData('text/x-cc-tool');
      if (!b || !ref || !/^(tbx|cmd):/.test(ref)) return false;
      e.preventDefault(); put(Number(b.dataset.tbxMine), ref); return true;
    },
  };
  return { group, sig, refresh, on, closeMenu, slots, add, put };
}

// =========================================================== pet palette ===========================================================
export function petPalette(E) {
  const box = E.el('div', { className: 'ws-pet ws-block', 'data-ws-blk': 'petpalette', role: 'toolbar', 'aria-label': E.T('shell.ws.pet'), hidden: true });
  let at = null, down = null, sig = '';
  const ids = (s) => {
    if (E.A.pet) return E.A.pet(s) || [];
    const I = reg(); if (!I) return [];
    const have = new Set(I.commands.filter((c) => regBuilt(c)).map((c) => c.id));
    const out = PET_IDS.filter((id) => have.has(id));
    return (out.includes('modify.copy') ? out.filter((id) => id !== 'edit.copy') : out).slice(0, PET_MAX);
  };
  function draw(list) {
    const s = JSON.stringify(list); if (s === sig) return; sig = s;
    box.replaceChildren(...list.map((id) => {
      const t = regTool(id), ic = E.el('i', { className: 'bi ' + t.icon, 'aria-hidden': 'true' });
      return E.el('button', { type: 'button', className: 'ws-pet-tool', 'data-ws-pet': id, 'aria-label': t.label, title: t.label }, ic);
    }), E.A.showProperties ? E.el('button', { type: 'button', className: 'ws-pet-tool', 'data-ws-props': '', 'aria-label': E.T('shell.ws.props'), title: E.T('shell.ws.props') }, E.el('i', { className: 'bi bi-card-list', 'aria-hidden': 'true' })) : null,
    E.el('button', { type: 'button', className: 'ws-pet-tool ws-pet-close', 'data-ws-pet-close': '', 'aria-label': E.T('shell.ws.pet.close'), title: E.T('shell.ws.pet.close') }, E.el('i', { className: 'bi bi-x', 'aria-hidden': 'true' })));
  }
  function hide() { at = null; box.hidden = true; }
  function refresh(s) {
    const idle = !s.tool || s.tool === 'select';
    const list = at && s.document && !s.busy && !s.other && idle && (s.selection?.length || 0) > 0 ? ids(s) : [];
    if (!list.length) { box.hidden = true; if (at && !(s.selection?.length) && !s.busy) at = null; return; }
    draw(list);
    for (const b of box.querySelectorAll('[data-ws-pet]')) { const w = regWhy(b.dataset.wsPet); b.setAttribute('aria-disabled', w && w !== 'no-registry' ? 'true' : 'false'); b.title = regTool(b.dataset.wsPet).label + (w && w !== 'no-registry' ? ' — ' + w : ''); }
    box.hidden = false;
    const r = E.stage.getBoundingClientRect(), w = box.offsetWidth || 240, h = box.offsetHeight || 36;
    box.style.left = Math.max(4, Math.min(at.x - r.left + 14, r.width - w - 4)) + 'px';
    box.style.top = Math.max(4, Math.min(at.y - r.top + 14, r.height - h - 4)) + 'px';
  }
  const inDrawing = (t) => !!t?.closest?.('.ws-fill') && !box.contains(t);
  const on = {
    pointerdown(e) { if (box.contains(e.target)) return; down = e.button === 0 && inDrawing(e.target) ? { x: e.clientX, y: e.clientY } : null; if (!box.hidden || at) hide(); },
    pointerup(e) { if (down && e.button === 0 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5 && inDrawing(e.target)) { at = { x: e.clientX, y: e.clientY }; E.soon(); setTimeout(E.soon, 120); } down = null; },
    wheel() { if (at) hide(); },
    keydown(e) { if (e.key === 'Escape' && at) hide(); },
    click(b) {
      if (b.hasAttribute('data-ws-pet-close')) { hide(); return true; }
      const id = b.dataset.wsPet; if (!id) return false;
      const w = regWhy(id);
      if (w && w !== 'no-registry') { E.explain(regTool(id).label, w); return true; }
      Promise.resolve(reg()?.run(id)).then(() => E.soon());
      return true;
    },
  };
  return { el: box, refresh, hide, on };
}

// =========================================================== info box: the picked element's fields ===========================================================
export function infoFields(E) {
  const wrap = E.el('span', { className: 'tbx-fields' });
  const twins = new Map();   // control → its twin
  let ctrls = [];
  const fields = (s) => {
    if (E.A.fields) return E.A.fields(s) || [];
    const p = E.A.palettes?.properties?.body?.();
    return p?.isConnected ? fieldsIn(p) : [];
  };
  function twin({ label, control: c }) {
    let t;
    if (c.tagName === 'SELECT') t = E.el('select', {});
    else t = E.el('input', { type: c.type === 'checkbox' || c.type === 'number' || c.type === 'color' ? c.type : 'text' });
    for (const k of ['min', 'max', 'step', 'placeholder', 'inputMode']) if (c[k] !== undefined && c[k] !== '' && k in t) t[k] = c[k];
    t.setAttribute('aria-label', label);
    // one commit per change: Enter commits, and the browser's own change on blur must not commit the same value again (a second undo step)
    const commit = () => {
      const v = c.type === 'checkbox' ? t.checked : t.value;
      if (v === t._sent || (c.type === 'checkbox' ? c.checked === v : c.value === v)) return;
      t._sent = v;
      if (c.type === 'checkbox') c.checked = v; else c.value = v;
      c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true }));
      E.soon();
    };
    t.addEventListener('focus', () => { t._sent = undefined; });
    t.addEventListener('change', commit);
    t.addEventListener('keydown', (e) => { if (e.key === 'Enter' && t.tagName === 'INPUT') { e.preventDefault(); commit(); } if (e.key === 'Escape') { sync(c, t, true); t.blur(); } });
    return E.el('label', { className: 'tbx-field', title: label }, E.el('span', {}, label), t);
  }
  function sync(c, t, force = false) {
    if (!force && t.ownerDocument.activeElement === t) return;
    if (c.tagName === 'SELECT') {
      const want = [...c.options].map((o) => o.value + '\u0001' + o.text).join('\u0002');
      if (t.dataset.opts !== want) { t.replaceChildren(...[...c.options].map((o) => E.el('option', { value: o.value, disabled: o.disabled }, o.text))); t.dataset.opts = want; }
      t.value = c.value;
    } else if (c.type === 'checkbox') t.checked = c.checked;
    else t.value = c.value;
    t.disabled = c.disabled;
  }
  /** Fills `body` (the info box's selection slot) with the fields, or empties them; returns how many are shown. */
  function render(body, s, before) {
    const list = (s.selection?.length && s.document && !s.other ? fields(s) : []).filter((f) => f?.control?.isConnected).slice(0, FIELDS_MAX);
    if (!list.length) { wrap.remove(); return 0; }
    const same = list.length === ctrls.length && list.every((f, i) => f.control === ctrls[i]);
    if (!same) {
      ctrls = list.map((f) => f.control);
      for (const k of [...twins.keys()]) if (!ctrls.includes(k)) twins.delete(k);
      wrap.replaceChildren(...list.map((f) => { if (!twins.has(f.control)) twins.set(f.control, twin(f)); return twins.get(f.control); }));
    }
    for (const c of ctrls) sync(c, twins.get(c).querySelector('select, input'));
    if (wrap.parentNode !== body) body.insertBefore(wrap, before || null);
    return list.length;
  }
  return { render, clear: () => { wrap.remove(); twins.clear(); ctrls = []; } };
}
