/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-dock.js — the dock manager (0.10 UI.21, narrowed by the owner 2026-11-15) and the one head (UI.26, folded into UI.21). Pattern:
 * docs/INTERFACE-PATTERN.md § 3, 4, 5. Loaded by app-workspace.js only while html[data-cc-ws-edit="1"] (the owner's switch, off; rule 62): with the switch off
 * this file is never fetched and every layout looks and behaves as before.
 *
 *   a UNIT     one ribbon group, one tool-row group or one toolbox group. Its grip (far left of the group's name) drags it, or opens the dock menu.
 *   a ZONE     a side place: the left panel, the right panel, the drawing's left or right column. Dropped there, the unit becomes a palette: the zone decides
 *              the orientation (a column of tools), several units in one zone are tabs, the palette collapses to its head. "Put it back", the palette's
 *              close, or a drop on its home bar sends it home (a horizontal zone: the ribbon, the tool rows; the toolbox's column).
 *   the HEAD   one head for every block that leaves for a window and for every palette: grip far left (drag = move, click = the dock menu), the name or
 *              the tabs in the middle, collapse, close far right (at 40 % until hovered or focused). It replaces the ribbon's tear-off handle and the
 *              "…" buttons of the toolbox, the tool rows and the status bar; the menu is the one menu of the window service (app-windows.js `openMenu`).
 *
 * Remembered per app and layout under cc-ws-dock:<app>:<layout> = { zones: { <place>: { units: [key], act: key, collapsed } } }; a unit key is
 * `ribbon:<tab>:<group>`, `toolrows:<group>` or `toolbox:<group>`. Docking changes no layout file: the layout stays the built-in or the person's own.
 * The engine asks isDocked(key) when it draws its bars, so a docked group is drawn once, in its palette (the unit keeps its tools: the same buttons,
 * data-ws-command / data-ws-block, run and lit by the engine).
 *
 * 0.11 (session ui-finish-11, lane dock), in the lab only (H.lab(): the switch AND a lab build, body.shell-lab; since the 0.10 go-live APP_WS_EDIT=1 prints the
 * switch on every build, so a /use page keeps exactly the 0.10 dock manager, rule 62):
 *   UI.26  Pin / Unpin in every dock menu (a pinned block or palette has no close and no Hide, does not drag, and a ribbon stays unfolded until unpinned);
 *          Float on the drawing (a group as a palette over the drawing, dragged by its grip to where it sits; a drop on no zone floats it there);
 *          a close on each ribbon group (far right of its name) and Close in every group's menu; a closed group comes back from its block's menu.
 *   UI.5   a palette of the panel dragged by its tab (or moved from its stack's grip menu) into the other stack, into a stack of its own or into the
 *          other panel: a layout edit (palettes.stacks / place2, format v2) made through the layout editor, so it is undone in Arrange like any move;
 *          Arrange… in every block's menu.
 * Remembered beside the zones: { hidden: [unit key], pinned: [key] } (a key: a unit key, `block:<kind>` or `zone:<place>`) and the floating palette
 * `zones.float = { units, act, collapsed, x, y }`. A /use page reads the same record and leaves those parts alone (it keeps them for the lab).
 *
 *   dockManager(H) → { isDocked(key), decorate(kind, el), refresh(), dock(key, place), undock(key), zones(), state(), head(o), destroy(), pin(key, on), float(key, x, y),
 *                      close(key), reopen(key), movePalette(name, to) }
 * H = { app, layout() → key, T, el, say, tool(id, block), built(id, block), region(place), host(place), groups(kind) → [{ key, id, label, tools }],
 *       redraw(), menu(btn, label, items) → { close }, blocks: { <kind>: { label, tear, isOpen(), open(), back(), extra() → items, unfold?() } }, hide(kind),
 *       stage, doc, lab() → bool, palettes() → { el, away, host, label(n), dom(n), name(dom) } | null, block(kind) → the layout's block | null,
 *       editBlock(kind, fn(block) → false | void) → bool, arrange(), movePal(o, name, to) → { stacks, place2? } | null }
 */

const ZONES = ['left-panel', 'right-panel', 'stage-left', 'stage-right'];
const FLOAT = 'float';   // 0.11 UI.26 (lab): a palette over the drawing
const STORE = 'cc-ws-dock:';
const word = (T, k, fb, v) => { const s = T(k, v); if (s && s !== k) return s; return v ? fb.replace(/\{(\w+)\}/g, (m, n) => (n in v ? v[n] : m)) : fb; };

export function dockManager(H) {
  const { T, el } = H;
  const W = (k, fb, v) => word(T, k, fb, v);
  const ZONE_NAME = { 'left-panel': W('shell.dock.zone.left-panel', 'Left panel'), 'right-panel': W('shell.dock.zone.right-panel', 'Right panel'),
    'stage-left': W('shell.dock.zone.stage-left', 'Drawing, left column'), 'stage-right': W('shell.dock.zone.stage-right', 'Drawing, right column') };
  const HOME = { ribbon: W('shell.dock.home.ribbon', 'the ribbon'), toolrows: W('shell.dock.home.toolrows', 'the tool rows'), toolbox: W('shell.dock.home.toolbox', 'the toolbox') };
  ZONE_NAME[FLOAT] = W('shell.dock.zone.float', 'Floating on the drawing');
  const key = () => STORE + H.app + ':' + (H.layout() || 'standard');
  const lab = () => !!H.lab?.();
  const UNIT_RE = /^(ribbon|toolrows|toolbox):/, PIN_RE = /^((ribbon|toolrows|toolbox):|block:[a-z]+$|zone:[a-z-]+$)/;
  const keys = (v, re, max) => (Array.isArray(v) ? [...new Set(v.filter((k) => typeof k === 'string' && k.length <= 120 && re.test(k)))].slice(0, max) : []);
  let S = read(), palettes = new Map(), overlay = null, drag = null, gone = false;

  // ------------------------------------------------------------------ state
  function read() { try { const o = JSON.parse(localStorage.getItem(key()) || 'null'); return clean(o); } catch (e) { return clean(null); } }
  function clean(o) {
    const z = {};
    for (const p of [...ZONES, FLOAT]) { const q = o?.zones?.[p]; if (!q || !Array.isArray(q.units)) continue; const units = keys(q.units, UNIT_RE, 24); if (units.length) z[p] = { units, act: units.includes(q.act) ? q.act : units[0], collapsed: !!q.collapsed };
      if (p === FLOAT) { z[p].x = Number.isFinite(q.x) ? Math.round(q.x) : 80; z[p].y = Number.isFinite(q.y) ? Math.round(q.y) : 80; } }
    return { zones: z, hidden: keys(o?.hidden, UNIT_RE, 64), pinned: keys(o?.pinned, PIN_RE, 64) };
  }
  function save() { try { if (Object.keys(S.zones).length || S.hidden.length || S.pinned.length) localStorage.setItem(key(), JSON.stringify(S)); else localStorage.removeItem(key()); } catch (e) { /* this page only */ } }
  const ZONES_NOW = () => (lab() ? [...ZONES, FLOAT] : ZONES);   // a /use page: the 0.10 zones only (rule 62)
  const zoneOf = (k) => ZONES_NOW().find((p) => S.zones[p]?.units.includes(k)) || null;
  const closed = (k) => lab() && S.hidden.includes(k);
  const isDocked = (k) => !!zoneOf(k) || closed(k);   // the engine leaves a docked or closed group out of its bar
  const pinned = (k) => lab() && S.pinned.includes(k);
  function pin(k, on) {
    if (!lab() || !PIN_RE.test(k)) return false;
    S.pinned = S.pinned.filter((x) => x !== k); if (on) S.pinned.push(k);
    save();
    if (on && k === 'block:ribbon') H.blocks.ribbon?.unfold?.();   // a pinned ribbon stays open: its fold (auto-hide) is off until unpinned
    markPins(); refresh();
    H.say(on ? W('shell.dock.pinned', '{name} is pinned.', { name: pinName(k) }) : W('shell.dock.unpinned', '{name} is no longer pinned.', { name: pinName(k) }));
    return true;
  }
  const pinName = (k) => (k.startsWith('block:') ? H.blocks[k.slice(6)]?.label || k : k.startsWith('zone:') ? ZONE_NAME[k.slice(5)] || k : unit(k)?.label || k);
  /** The heads of pinned blocks and the grips of pinned groups say so; their close goes (CSS), their drag is off (startDrag). */
  function markPins() {
    for (const n of H.doc.querySelectorAll('[data-dock-pin]')) n.classList.toggle('is-pinned', pinned(n.dataset.dockPin));
  }
  /** UI.26 (lab): a group closed from its menu or its close leaves its bar; its block's menu brings it back. */
  function closeUnit(k) {
    if (!lab() || pinned(k) || !unit(k)) return false;
    const from = zoneOf(k); if (from) leaveZone(k, from);
    if (!S.hidden.includes(k)) S.hidden.push(k);
    save(); H.redraw(); refresh();
    H.say(W('shell.dock.closed', '{name} is closed. Its block\'s menu brings it back.', { name: unit(k).label }));
    return true;
  }
  function reopen(k) {
    if (!S.hidden.includes(k)) return false;
    S.hidden = S.hidden.filter((x) => x !== k); save(); H.redraw(); refresh();
    if (kindOf(k) === 'ribbon') H.ribbonTab?.(k.split(':')[1]);
    H.say(W('shell.dock.back', '{name} is back in {home}.', { name: unit(k)?.label || k, home: HOME[kindOf(k)] }));
    return true;
  }
  const kindOf = (k) => k.split(':')[0];
  const unit = (k) => H.groups(kindOf(k)).find((g) => g.key === k) || null;
  // a panel zone only while the panel shows (a layout may hide the app's own panel: DetailCraft's right one)
  const zonesHere = () => ZONES.filter((p) => (p.endsWith('-panel') ? !!H.host(p)?.getClientRects().length : true));

  function dock(k, place, at = null) {
    const fl = place === FLOAT && lab();
    if (!fl && (!ZONES.includes(place) || !zonesHere().includes(place))) return false;
    if (!unit(k) || pinned(k)) return false;
    const from = zoneOf(k);
    if (from === place && fl && at) { const z = S.zones[FLOAT]; z.x = at.x; z.y = at.y; save(); refresh(); return true; }   // a floating palette moved by its grip
    if (from) leaveZone(k, from);
    S.hidden = S.hidden.filter((x) => x !== k);
    const z = S.zones[place] || (S.zones[place] = { units: [], act: k, collapsed: false, ...(fl ? { x: 80, y: 80 } : {}) });
    if (fl && at) { z.x = at.x; z.y = at.y; }
    z.units.push(k); z.act = k; z.collapsed = false;
    save(); H.redraw(); refresh();
    H.say(fl ? W('shell.dock.floated', '{name} floats on the drawing.', { name: unit(k).label }) : W('shell.dock.docked', '{name} docked in {zone}.', { name: unit(k).label, zone: ZONE_NAME[place] }));
    return true;
  }
  function leaveZone(k, place) {
    const z = S.zones[place]; if (!z) return;
    z.units = z.units.filter((x) => x !== k);
    if (!z.units.length) delete S.zones[place]; else if (z.act === k) z.act = z.units[0];
  }
  function undock(k) {
    const from = zoneOf(k); if (!from) return false;
    const u = unit(k); leaveZone(k, from); save(); H.redraw(); refresh();
    H.say(W('shell.dock.back', '{name} is back in {home}.', { name: u?.label || k, home: HOME[kindOf(k)] }));
    return true;
  }

  // ------------------------------------------------------------------ the one head
  const icon = (bi) => (window.ccBlockIcon ? window.ccBlockIcon({ bi, block: 'dock' }) : el('i', { className: 'bi ' + bi, 'aria-hidden': 'true' }));
  /** One head: grip far left (click = menu, drag = move), name or tabs, collapse, close far right. o = { name, items() → [[text, bi, run]], close?: { label, run },
   *  collapse?: { on() → bool, set(on) }, tabs?: [{ key, label, on }], pick(key), drag?(e, grip) }. → the head element. */
  function head(o) {
    const grip = el('button', { type: 'button', className: 'ws-head-grip shell-grip-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
      'aria-label': W('shell.dock.grip', 'Move or dock {name}', { name: o.name }), title: W('shell.dock.grip', 'Move or dock {name}', { name: o.name }) }, icon('bi-grip-vertical'));
    const h = el('div', { className: 'ws-head', role: 'group', 'aria-label': o.name, 'data-ws-head': '' }, grip);
    if (o.tabs && o.tabs.length > 1) {
      const strip = el('div', { className: 'ws-head-tabs shell-grip-tabs', role: 'tablist', 'aria-label': o.name });
      for (const t of o.tabs) {
        const b = el('button', { type: 'button', className: 'shell-grip-tab', role: 'tab', 'aria-selected': t.on ? 'true' : 'false', tabindex: t.on ? 0 : -1, title: t.label, 'data-dock-tab': t.key }, t.label);
        b.addEventListener('click', (e) => { e.stopPropagation(); o.pick(t.key); });
        b.addEventListener('keydown', (e) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); e.stopPropagation();
          const i = o.tabs.findIndex((x) => x.key === t.key), n = o.tabs.length, to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n; o.pick(o.tabs[to].key, true); });
        strip.append(b);
      }
      h.append(strip);
    } else h.append(el('span', { className: 'ws-head-name' }, o.name));
    if (o.collapse) {
      const c = el('button', { type: 'button', className: 'ws-head-collapse shell-grip-btn', 'aria-expanded': o.collapse.on() ? 'false' : 'true',
        'aria-label': W('shell.dock.collapse', 'Collapse {name}', { name: o.name }), title: W('shell.dock.collapse', 'Collapse {name}', { name: o.name }) }, icon(o.collapse.on() ? 'bi-chevron-up' : 'bi-chevron-down'));
      c.addEventListener('click', (e) => { e.stopPropagation(); o.collapse.set(!o.collapse.on()); });
      h.append(c);
    }
    if (o.close) {
      const x = el('button', { type: 'button', className: 'ws-head-close shell-grip-btn', 'aria-label': o.close.label, title: o.close.label }, icon('bi-x-lg'));
      x.addEventListener('click', (e) => { e.stopPropagation(); o.close.run(); });
      h.append(x);
    }
    let m = null;
    const openIt = () => { if (m) { m.close(); m = null; return; } m = H.menu(grip, o.name, o.items()); if (m) m.onClose = () => { m = null; }; };
    grip.addEventListener('click', (e) => { e.stopPropagation(); if (grip.dataset.dragged) { delete grip.dataset.dragged; return; } openIt(); });
    grip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); openIt(); } });
    h.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); openIt(); });
    if (o.drag) grip.addEventListener('pointerdown', (e) => o.drag(e, grip));
    return h;
  }

  // ------------------------------------------------------------------ a block's head (ribbon, toolbox, tool rows, status bar)
  function blockItems(kind) {
    const B = H.blocks[kind]; if (!B) return [];
    const pk = 'block:' + kind, pin_ = pinned(pk);
    const out = B.isOpen() ? [[W('shell.dock.window.back', 'Put it back'), 'bi-box-arrow-in-down-left', () => B.back()]]
      : B.tear ? [[W('shell.dock.window', 'Open in a window'), 'bi-window-plus', () => B.open()]] : [];   // B.open says when the browser refused
    out.push(...(pin_ && kind === 'ribbon' ? [] : B.extra()));   // a pinned ribbon does not fold
    if (lab()) {
      out.push(pin_ ? [W('shell.dock.unpin', 'Unpin'), 'bi-pin-angle-fill', () => pin(pk, false)] : [W('shell.dock.pin', 'Pin'), 'bi-pin-angle', () => pin(pk, true)]);
      for (const k of S.hidden.filter((x) => kindOf(x) === kind)) { const u = unit(k); if (u) out.push([W('shell.dock.reopen', 'Show {name} again', { name: u.label }), 'bi-eye', () => reopen(k)]); }
      if (H.arrange) out.push([W('shell.dock.arrange', 'Arrange…'), 'bi-grid-1x2', () => H.arrange()]);
    }
    if (!B.isOpen() && !pin_) out.push([W('shell.dock.hide', 'Hide'), 'bi-eye-slash', () => H.hide(kind)]);
    return out;
  }
  function blockHead(kind) {
    const B = H.blocks[kind], pk = 'block:' + kind;
    const hd = head({ name: B.label, items: () => blockItems(kind),
      close: { label: W('shell.dock.close', 'Close {name}', { name: B.label }), run: () => { if (pinned(pk)) return; if (B.isOpen()) B.back(); else H.hide(kind); } } });
    if (lab()) { hd.dataset.dockPin = pk; for (const n of hd.querySelectorAll('.ws-head-grip, .ws-head-close')) n.dataset.dockPin = pk; }
    return hd;
  }
  /** Called by the engine after it draws a block (or a group list): the block's old handle goes, the one head comes in; each group gets its grip. */
  function decorate(kind, node) {
    if (gone || !node) return;
    if (kind === 'ribbon-tabs') {   // the ribbon's tab strip: grip first, close last (it replaces the ⋯ tear handle)
      node.querySelector(':scope > .ws-tear')?.remove();
      if (!H.blocks.ribbon) return;
      const hd = blockHead('ribbon'); hd.classList.add('ws-head-inline');
      const [grip, ...rest] = hd.children; node.prepend(grip); const close = rest.at(-1); if (close?.classList.contains('ws-head-close')) node.append(close);
      return;
    }
    if (kind === 'toolbox' || kind === 'toolrows' || kind === 'statusbar') {
      node.querySelector(':scope .ws-popout-menu')?.remove();
      if (!H.blocks[kind]) return;
      const old = node.querySelector(':scope > .ws-head'); if (old) old.remove();
      const hd = blockHead(kind);
      if (kind === 'toolbox') { const th = node.querySelector(':scope > .tbx-head'); if (th) { th.hidden = true; th.after(hd); } else node.prepend(hd); }
      else { hd.classList.add('ws-head-inline'); node.prepend(hd.firstChild); const close = hd.querySelector('.ws-head-close'); if (close) node.append(close); }
      return;
    }
    if (kind === 'ribbon' || kind === 'toolrows-rows' || kind === 'toolbox-list') groupGrips(kind === 'ribbon' ? 'ribbon' : kind === 'toolrows-rows' ? 'toolrows' : 'toolbox', node);
    if (kind === 'palettes') palGrips();
    markPins();
  }
  function groupGrips(kind, node) {
    const sel = kind === 'ribbon' ? '.ws-group' : kind === 'toolrows' ? '.tr-group' : '.tbx-group';
    const list = H.groups(kind);
    for (const g of node.querySelectorAll(sel)) {
      if (g.querySelector(':scope [data-dock-grip]')) continue;
      const id = g.dataset.wsGroup || g.dataset.trGroup || g.dataset.tbxGroup;
      const u = list.find((x) => x.id === id && (kind !== 'ribbon' || x.tab === node.dataset.wsTabId)); if (!u) continue;
      const b = el('button', { type: 'button', className: 'ws-group-grip shell-grip-btn', 'data-dock-grip': u.key, 'aria-haspopup': 'menu', 'aria-expanded': 'false',
        'aria-label': W('shell.dock.grip', 'Move or dock {name}', { name: u.label }), title: W('shell.dock.grip', 'Move or dock {name}', { name: u.label }) }, icon('bi-grip-vertical'));
      let m = null;
      const openIt = () => { if (m) { m.close(); m = null; return; } m = H.menu(b, u.label, unitItems(u.key)); if (m) m.onClose = () => { m = null; }; };
      b.addEventListener('click', (e) => { e.stopPropagation(); if (b.dataset.dragged) { delete b.dataset.dragged; return; } openIt(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); openIt(); } });
      b.addEventListener('pointerdown', (e) => startDrag(e, b, u.key));
      const at = kind === 'ribbon' ? g.querySelector(':scope > .ws-group-title') : kind === 'toolbox' ? g.querySelector(':scope > summary, :scope > .tbx-group-title') : g;
      (at || g).prepend(b);
      if (lab()) {
        b.dataset.dockPin = u.key;
        if (kind === 'ribbon' && at) {   // UI.26: the group's close, far right of its name
          const x = el('button', { type: 'button', className: 'ws-group-close shell-grip-btn', 'data-dock-close': u.key, 'data-dock-pin': u.key,
            'aria-label': W('shell.dock.close', 'Close {name}', { name: u.label }), title: W('shell.dock.close', 'Close {name}', { name: u.label }) }, icon('bi-x'));
          x.addEventListener('click', (e) => { e.stopPropagation(); closeUnit(u.key); });
          at.append(x);
        }
      }
    }
  }
  /** The dock menu of a unit: the zones it may go to (the ones this page has), home, and the palette's own entries. */
  function unitItems(k) {
    const z = zoneOf(k), out = [], pk = z ? 'zone:' + z : k, pin_ = pinned(pk);
    if (!pin_) {
      for (const p of zonesHere()) if (p !== z) out.push([W('shell.dock.to', 'Dock to {zone}', { zone: ZONE_NAME[p] }), p.startsWith('left') || p === 'stage-left' ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse', () => dock(k, p)]);
      if (lab() && z !== FLOAT) out.push([W('shell.dock.float', 'Float on the drawing'), 'bi-window-stack', () => dock(k, FLOAT, floatSpot())]);
    }
    if (z) {
      const c = !!S.zones[z]?.collapsed;
      out.push([c ? W('shell.dock.open', 'Open') : W('shell.dock.collapse.short', 'Collapse'), c ? 'bi-chevron-down' : 'bi-chevron-up', () => collapse(z, !c)]);
      if (!pin_) out.push([W('shell.dock.home', 'Put it back in {home}', { home: HOME[kindOf(k)] }), 'bi-box-arrow-in-up-left', () => undock(k)]);
    }
    if (lab()) {
      out.push(pin_ ? [W('shell.dock.unpin', 'Unpin'), 'bi-pin-angle-fill', () => pin(pk, false)] : [W('shell.dock.pin', 'Pin'), 'bi-pin-angle', () => pin(pk, true)]);
      if (!pin_ && !z) out.push([W('shell.dock.close', 'Close {name}', { name: unit(k)?.label || k }), 'bi-x-lg', () => closeUnit(k)]);
    }
    return out;
  }
  /** Where Float puts a palette: the drawing's top left, clear of a palette already floating there. */
  const floatSpot = () => (S.zones[FLOAT] ? { x: S.zones[FLOAT].x, y: S.zones[FLOAT].y } : { x: 80, y: 80 });
  function collapse(place, on) { const z = S.zones[place]; if (!z) return; z.collapsed = !!on; save(); refresh(); }

  // ------------------------------------------------------------------ palettes
  function refresh() {
    if (gone) return;
    for (const [p, n] of [...palettes]) if (!S.zones[p] || !n.isConnected || !ZONES_NOW().includes(p)) { n.remove(); palettes.delete(p); }
    for (const p of Object.keys(S.zones)) {
      if (!ZONES_NOW().includes(p)) continue;   // a /use page leaves the lab's floating palette alone
      const z = S.zones[p];
      z.units = z.units.filter((k) => unit(k)); if (!z.units.length) { delete S.zones[p]; palettes.get(p)?.remove(); palettes.delete(p); continue; }
      if (!z.units.includes(z.act)) z.act = z.units[0];
      const u = unit(z.act), block = kindOf(z.act);
      const tools = u.tools.filter((id) => H.built(id, block)).map((id) => H.tool(id, block));
      const body = el('div', { className: 'ws-dock-body', role: 'toolbar', 'aria-orientation': 'vertical', 'aria-label': u.label, hidden: z.collapsed }, tools);
      const hd = head({ name: u.label, items: () => unitItems(z.act),
        tabs: z.units.map((k) => ({ key: k, label: unit(k).label, on: k === z.act })),
        pick: (k, focus) => { z.act = k; save(); refresh(); if (focus) palettes.get(p)?.querySelector('[aria-selected="true"]')?.focus(); },
        collapse: { on: () => !!z.collapsed, set: (on) => collapse(p, on) },
        close: { label: W('shell.dock.home', 'Put it back in {home}', { home: HOME[block] }), run: () => { if (!pinned('zone:' + p)) undock(z.act); } },
        drag: (e, g) => startDrag(e, g, z.act) });
      if (lab()) { hd.dataset.dockPin = 'zone:' + p; for (const n of hd.querySelectorAll('.ws-head-grip, .ws-head-close')) n.dataset.dockPin = 'zone:' + p; }
      const box = el('section', { className: 'ws-dock-palette' + (z.collapsed ? ' is-collapsed' : '') + (p === FLOAT ? ' ws-dock-float' : ''), 'data-dock-zone': p, 'data-dock-act': z.act, 'aria-label': u.label }, hd, body);
      if (p === FLOAT) placeFloat(box, z);
      const old = palettes.get(p);
      if (old) old.replaceWith(box);
      else if (p === FLOAT) H.stage.append(box);
      else { const host = H.region(p); if (!host) continue; const grip = host.querySelector(':scope > .shell-grip'); if (grip) grip.after(box); else host.prepend(box); }
      palettes.set(p, box);
    }
    markPins();
    save();
  }
  /** A floating palette sits at { x, y } inside the drawing area, kept inside it. */
  function placeFloat(box, z) {
    const r = H.stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(z.x, Math.max(0, r.width - 160))), y = Math.max(0, Math.min(z.y, Math.max(0, r.height - 60)));
    box.style.left = x + 'px'; box.style.top = y + 'px';
  }

  // ------------------------------------------------------------------ zones as drop targets (dragging a grip, and Arrange mode)
  function zoneRects() {
    const out = [];
    const sr = H.stage.getBoundingClientRect(), rem = parseFloat(getComputedStyle(H.doc.documentElement).fontSize) || 16;
    for (const p of zonesHere()) {
      let r = null;
      if (p.endsWith('-panel')) { const h = H.host(p); const b = h && h.getBoundingClientRect(); if (b && b.width > 4 && b.height > 4) r = b; }
      else { const reg = H.stage.querySelector(':scope > [data-ws-region="' + p + '"]'); const b = reg?.getBoundingClientRect(); const w = Math.max(b?.width || 0, 6 * rem);
        r = { left: p === 'stage-left' ? sr.left : sr.right - w, top: sr.top, width: w, height: sr.height }; }
      if (r) out.push({ place: p, r });
    }
    return out;
  }
  function homeRect(kind) {
    const n = kind === 'ribbon' ? H.doc.querySelector('.ws-ribbon') : kind === 'toolrows' ? H.doc.querySelector('.tr-toolrows') : H.doc.querySelector('.tbx-toolbox');
    const b = n?.getBoundingClientRect(); return b && b.width > 4 && b.height > 4 ? b : null;
  }
  function showZones(on, k = null) {
    if (!on) { overlay?.remove(); overlay = null; return; }
    if (!overlay) { overlay = el('div', { className: 'ws-dock-zones', 'aria-hidden': 'true' }); H.doc.body.append(overlay); }
    const cell = (place, r, label) => { const z = el('div', { className: 'shell-drop-zone ws-dock-zone', 'data-dock-target': place }, label); Object.assign(z.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); return z; };
    const kids = zoneRects().map(({ place, r }) => cell(place, r, ZONE_NAME[place]));
    // a docked unit's home bar first: the first target under the pointer wins, and the toolbox's home column lies inside the drawing's left zone
    if (k && isDocked(k)) { const r = homeRect(kindOf(k)); if (r) kids.unshift(cell('home', r, W('shell.dock.home', 'Put it back in {home}', { home: HOME[kindOf(k)] }))); }
    overlay.replaceChildren(...kids);
    overlay.classList.toggle('is-passive', !k);
  }
  function startDrag(e, grip, k) {
    if (e.button !== 0) return;
    const z0 = zoneOf(k);
    if (pinned(k) || (z0 && pinned('zone:' + z0))) return;   // UI.26: a pinned unit stays put (a click still opens its menu)
    drag = { k, grip, x: e.clientX, y: e.clientY, on: false, over: null, px: e.clientX, py: e.clientY };
    try { grip.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer */ }
    const move = (ev) => {
      if (!drag) return;
      if (!drag.on) { if (Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 5) return; drag.on = true; showZones(true, k); H.doc.body.classList.add('ws-dock-dragging'); }
      let over = null;
      for (const z of overlay?.children || []) { const r = z.getBoundingClientRect(); const hit = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; z.classList.toggle('is-hot', hit && !over); if (hit && !over) over = z.dataset.dockTarget; }
      drag.over = over; drag.px = ev.clientX; drag.py = ev.clientY;
    };
    const up = () => {
      grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up);
      const d = drag; drag = null; H.doc.body.classList.remove('ws-dock-dragging');
      if (!d?.on) return;
      grip.dataset.dragged = '1'; setTimeout(() => { delete grip.dataset.dragged; }, 0);
      showZones(arranging(), null);
      if (d.over === 'home') undock(d.k); else if (d.over) dock(d.k, d.over);
      else if (lab()) {   // UI.26: dropped on the drawing, on no zone: it floats there
        const r = H.stage.getBoundingClientRect();
        if (d.px >= r.left && d.px <= r.right && d.py >= r.top && d.py <= r.bottom) dock(d.k, FLOAT, { x: Math.round(d.px - r.left - 12), y: Math.round(d.py - r.top - 10) });
      }
    };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
  }
  // Arrange mode (app-workspace-edit.js) shows the zones as drop targets while it is on
  const arranging = () => H.doc.body.classList.contains('ws-arranging');
  let wasArranging = arranging();   // PERF.56 (0.11): the zones only follow the Arrange class, not every other body class
  const bodyObs = new MutationObserver(() => { if (drag) return; const a = arranging(); if (a === wasArranging) return; wasArranging = a; showZones(a, null); });
  bodyObs.observe(H.doc.body, { attributes: true, attributeFilter: ['class'] });
  const onResize = () => { if (overlay && !drag) showZones(arranging(), null); };
  H.doc.defaultView.addEventListener('resize', onResize);

  // ------------------------------------------------------------------ UI.5 (lab): a palette out of its stack
  const palName = (Q, dom) => (dom === 'model' ? 'panel' : dom);
  const otherPanel = (place) => (place === 'left-panel' ? 'right-panel' : 'left-panel');
  /** What a palette may do from where it is: [[text, bi, to]] (only the moves the format allows: two stacks, four in each, the panel's own content stays). */
  function palMoves(name) {
    const b = H.block?.('palettes'); if (!b) return [];
    const o = { ...b, otherPanel: otherPanel(b.place) }, out = [];
    const other = H.host(o.otherPanel), otherOn = !!other?.getClientRects().length;
    const st = H.palettes()?.stacks || [];
    const add = (to, text, bi) => { if (H.movePal(o, name, to)) out.push([text, bi, to]); };
    add('stack:0', W('shell.dock.pal.stack1', 'Into the first stack'), 'bi-box-arrow-in-up');
    if (st.length > 1) add('stack:1', W('shell.dock.pal.stack2', 'Into the second stack'), 'bi-box-arrow-in-down');
    add('own', W('shell.dock.pal.own', 'Into a stack of its own'), 'bi-layout-split');
    if (otherOn) add('other', W('shell.dock.pal.other', 'Into the other panel'), o.place === 'left-panel' ? 'bi-layout-sidebar-reverse' : 'bi-layout-sidebar');
    return out;
  }
  function movePalette(name, to) {
    if (!lab()) return false;
    const label = H.palettes()?.label(name) || name;
    const ok = H.editBlock('palettes', (b) => {
      const r = H.movePal({ ...b, otherPanel: otherPanel(b.place) }, name, to); if (!r) return false;
      delete b.upper; delete b.lower; b.stacks = r.stacks; if (r.place2) b.place2 = r.place2; else delete b.place2;
    });
    if (ok) H.say(W('shell.dock.pal.moved', '{name} moved.', { name: label }));
    return ok;
  }
  function palMenu(btn, name) {
    const items = palMoves(name).map(([text, bi, to]) => [text, bi, () => movePalette(name, to)]);
    if (!items.length) items.push([W('shell.dock.pal.none', 'It cannot move from here'), 'bi-dash-circle', () => {}]);
    return H.menu(btn, H.palettes()?.label(name) || name, items);
  }
  /** Each palette tab drags (a click still picks it; right-click = its menu); each stack's heading gets a grip whose menu moves the palette it shows. */
  function palGrips() {
    const Q = H.palettes?.(); if (!lab() || !Q) return;
    for (const root of [Q.el, Q.away].filter(Boolean)) {
      for (const t of root.querySelectorAll('[data-ws-lower]')) {
        if (t.dataset.dockPal) continue;
        const name = palName(Q, t.dataset.wsLower); t.dataset.dockPal = name;
        t.addEventListener('pointerdown', (e) => palDrag(e, t, name));
        t.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); palMenu(t, name); });
        t.addEventListener('click', (e) => { if (t.dataset.dragged) { delete t.dataset.dragged; e.stopPropagation(); e.preventDefault(); } }, true);
      }
      for (const h of root.querySelectorAll(':scope > .ws-palette > .ws-palette-heading')) {
        if (h.querySelector(':scope > [data-dock-palgrip]')) continue;
        const sec = h.parentElement;
        const shows = () => { const on = sec.querySelector('[data-ws-lower][aria-selected="true"]'); return on ? palName(Q, on.dataset.wsLower) : sec.dataset.wsPalette || null; };
        const g = el('button', { type: 'button', className: 'ws-head-grip ws-pal-grip shell-grip-btn', 'data-dock-palgrip': '', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
          'aria-label': W('shell.dock.pal.grip', 'Move this palette'), title: W('shell.dock.pal.grip', 'Move this palette') }, icon('bi-grip-vertical'));
        let m = null;
        g.addEventListener('click', (e) => { e.stopPropagation(); if (g.dataset.dragged) { delete g.dataset.dragged; return; } if (m) { m.close(); m = null; return; } const n = shows(); if (n) { m = palMenu(g, n); if (m) m.onClose = () => { m = null; }; } });
        g.addEventListener('pointerdown', (e) => { const n = shows(); if (n) palDrag(e, g, n); });
        h.prepend(g);
      }
    }
  }
  /** The drop cells of a palette drag: each stack, a stack of its own (the lower half of a panel with one stack), the other panel. */
  function palCells(name) {
    const Q = H.palettes(); if (!Q) return [];
    const allowed = new Set(palMoves(name).map((x) => x[2])), out = [];
    const secs = [...(Q.el.querySelectorAll(':scope > .ws-palette') || []), ...(Q.away ? Q.away.querySelectorAll(':scope > .ws-palette') : [])];
    secs.forEach((sec, i) => { const to = 'stack:' + i; if (allowed.has(to)) out.push({ to, r: sec.getBoundingClientRect(), label: i ? W('shell.dock.pal.stack2', 'Into the second stack') : W('shell.dock.pal.stack1', 'Into the first stack') }); });
    if (allowed.has('own')) { const r = Q.host.getBoundingClientRect(); out.push({ to: 'own', r: { left: r.left, top: r.top + r.height / 2, width: r.width, height: r.height / 2 }, label: W('shell.dock.pal.own', 'Into a stack of its own') }); }
    if (allowed.has('other')) { const b = H.block('palettes'); const r = H.host(otherPanel(b.place))?.getBoundingClientRect(); if (r) out.push({ to: 'other', r, label: W('shell.dock.pal.other', 'Into the other panel') }); }
    return out;
  }
  function palDrag(e, src, name) {
    if (e.button !== 0) return;
    const d0 = { x: e.clientX, y: e.clientY, on: false, over: null };
    try { src.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer */ }
    const move = (ev) => {
      if (!d0.on) { if (Math.hypot(ev.clientX - d0.x, ev.clientY - d0.y) < 5) return; d0.on = true; H.doc.body.classList.add('ws-dock-dragging'); showCells(palCells(name)); }
      let over = null;
      for (const z of overlay?.children || []) { const r = z.getBoundingClientRect(); const hit = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; z.classList.toggle('is-hot', hit && !over); if (hit && !over) over = z.dataset.dockTarget; }
      d0.over = over;
    };
    const up = () => {
      src.removeEventListener('pointermove', move); src.removeEventListener('pointerup', up); src.removeEventListener('pointercancel', up);
      H.doc.body.classList.remove('ws-dock-dragging');
      if (!d0.on) return;
      src.dataset.dragged = '1'; setTimeout(() => { delete src.dataset.dragged; }, 0);
      showZones(arranging(), null);
      if (d0.over) movePalette(name, d0.over);
    };
    src.addEventListener('pointermove', move); src.addEventListener('pointerup', up); src.addEventListener('pointercancel', up);
  }
  function showCells(cells) {
    if (!overlay) { overlay = el('div', { className: 'ws-dock-zones', 'aria-hidden': 'true' }); H.doc.body.append(overlay); }
    overlay.classList.remove('is-passive');
    overlay.replaceChildren(...cells.map(({ to, r, label }) => { const z = el('div', { className: 'shell-drop-zone ws-dock-zone', 'data-dock-target': to }, label); Object.assign(z.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); return z; }));
  }

  function destroy() {
    gone = true; bodyObs.disconnect(); H.doc.defaultView.removeEventListener('resize', onResize); showZones(false);
    for (const n of palettes.values()) n.remove(); palettes.clear();
  }
  return { isDocked, decorate, refresh, dock, undock, collapse, head, destroy, zones: zonesHere, state: () => JSON.parse(JSON.stringify(S)), reload: () => { S = read(); refresh(); },
    pin, pinned, float: (k, x = 80, y = 80) => dock(k, FLOAT, { x, y }), close: closeUnit, reopen, movePalette, palMoves };
}
