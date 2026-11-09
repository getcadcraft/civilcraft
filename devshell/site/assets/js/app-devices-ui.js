/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-devices-ui.js — input devices in every app (0.8 Track ID, docs/0.8-PART4.md; map docs/apps/app-devices.md): the page side of
 * app-devices.js. Loaded by app-shell.inc for a build whose manifest says "devices": true (AppBuilds::devices; dev builds only —
 * frozen releases have no key, so they never change). Reads #cc-devices {app, appName}.
 *
 * What it does, with nothing changed until the person changes it (every default is "what the app does"):
 *   - trackpad: two-finger scroll → the app / pan / zoom / orbit; pinch → the app (zoom) / nothing; speed, invert (window wheel,
 *     capture phase, before the app's own listener)
 *   - mouse: back / forward side buttons → a command (and the browser's own Back is kept from leaving the app); the wheel's
 *     sideways tilt → the app / pan / nothing
 *   - pen side button, eraser end, two- and three-finger taps: app-phone.js § Pen and touch asks pick('pen.side' …) and runs
 *     the answer through perform()
 *   - 3D mouse (WebHID, after "Connect a 3D mouse"; granted devices reconnect by themselves), game controller (Gamepad API, no
 *     permission) and MIDI controller (Web MIDI, after "Connect"): axes move the view, buttons run commands
 *
 * Views. Moving the view needs the app's own view to take part; an app hands its views over, before or after this module loads:
 *   (window.ccViews ||= []).push({ el, kind: '2d' | '3d', pan(dx, dy), zoom(f, x, y), orbit(dx, dy), fit() });
 *     pan     screen pixels, the content follows (dx > 0 = content moves right)
 *     zoom    f > 1 = closer, about (x, y) in pixels inside el (default its middle)
 *     orbit   pixels as a mouse drag would orbit (a 2D view leaves it out)
 *     fit     everything in view
 * The view under the pointer gets the move; else the last one used; else the biggest one on screen. Without any view, zoom
 * still works for the wheel (a Ctrl + wheel event, the pinch every app already zooms on) and the rest waits.
 *
 * window.ccShellDevices = { app, prefs(), pick(path), perform(action, info), scope(), set(path, value), views(), seen(),
 *   connectSpace(), connectMidi(), state() } for app-phone.js, the Settings card, tests and the console.
 * Words: shell.dev.* in assets/lang/shell.
 */
import * as D from './app-devices.js';
import { installStudioDevices } from './app-devices-studio.js';   // 0.8 ID.8: WebHID / Web MIDI doors in Studio's own window

const cfg = (() => { try { return JSON.parse(document.getElementById('cc-devices')?.textContent || 'null'); } catch (e) { return null; } })();
const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* this tab keeps it */ } } };
const root = document.documentElement;

try { installStudioDevices(window); } catch (e) { /* nothing installed: the doors say "not available here" as before */ }   // no-op without Studio's devices bridge
if (cfg && cfg.app) boot();

function boot() {
  const APP = cfg.app;
  let S = D.readState(store.get(D.STORE));
  if (!S) { let pen = null; try { pen = JSON.parse(store.get('cc-pen') || 'null'); } catch (e) { /* none */ } S = pen ? D.fromPen(pen) : D.emptyState(); }
  let P = D.resolve(S, APP);
  let seen = {}; try { seen = JSON.parse(store.get(D.SEEN_KEY) || '{}') || {}; } catch (e) { seen = {}; }
  const listeners = new Set();
  const changed = () => listeners.forEach((f) => { try { f(); } catch (e) { /* a card's own trouble */ } });
  function save(next) { S = next; P = D.resolve(S, APP); store.set(D.STORE, JSON.stringify(S)); changed(); }
  window.addEventListener('storage', (e) => { if (e.key === D.STORE) { S = D.readState(e.newValue) || D.emptyState(); P = D.resolve(S, APP); changed(); } });
  function markSeen(dev, name) {
    const was = seen[dev];
    seen[dev] = { at: Date.now(), name: String(name || (was && was.name) || '').slice(0, 80) };
    root.classList.add('cc-dev-' + dev);
    if (!was || Date.now() - (was.at || 0) > 60000 || (name && was.name !== name)) { store.set(D.SEEN_KEY, JSON.stringify(seen)); changed(); }
  }
  for (const k of Object.keys(seen)) if (D.DEVICES.includes(k)) root.classList.add('cc-dev-' + k);

  // ---- views ----
  const views = [];
  function register(v) {
    if (!v || !v.el || typeof v.el.getBoundingClientRect !== 'function') return () => {};
    views.push(v);
    return () => { const i = views.indexOf(v); if (i >= 0) views.splice(i, 1); };
  }
  const queued = Array.isArray(window.ccViews) ? window.ccViews : [];
  window.ccViews = { push: (...vs) => { vs.forEach(register); return views.length; }, list: () => views.slice() };
  queued.forEach(register);
  let lastView = null, pointer = { x: -1, y: -1 };
  const live = () => { for (let i = views.length - 1; i >= 0; i--) if (!views[i].el.isConnected) views.splice(i, 1); return views; };
  // on screen: a size, not inside [hidden], not visibility: hidden (CadCraft and TakeoffCraft hide the 2D view that way under 3D)
  const shown = (v) => { const r = v.el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !v.el.closest('[hidden]') && getComputedStyle(v.el).visibility !== 'hidden' ? r : null; };
  // the view whose element holds what is under the point (the innermost when views nest), else the last one registered there
  function viewAt(x, y, target) {
    const hit = target && target.nodeType === 1 ? target : (x >= 0 ? document.elementFromPoint(x, y) : null);
    let best = null;
    if (hit) for (const v of live()) if (v.el.contains(hit) && shown(v) && (!best || best.el.contains(v.el))) best = v;
    if (best) return best;
    for (const v of live().slice().reverse()) { const r = shown(v); if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return v; }
    return null;
  }
  function activeView() {
    const at = viewAt(pointer.x, pointer.y); if (at) return at;
    if (lastView && lastView.el.isConnected && shown(lastView)) return lastView;
    let best = null, area = 0;
    for (const v of live()) { const r = shown(v); if (r && r.width * r.height > area) { best = v; area = r.width * r.height; } }
    return best;
  }
  window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
  window.addEventListener('pointerdown', (e) => { const v = viewAt(e.clientX, e.clientY, e.target); if (v) lastView = v; if (e.pointerType === 'mouse') markSeen('mouse'); }, { capture: true, passive: true });

  function inside(v, x, y) { const r = v.el.getBoundingClientRect(); return x == null ? [r.width / 2, r.height / 2] : [x - r.left, y - r.top]; }
  function move(v, m, cx, cy) {
    if (!v) return false;
    lastView = v;
    if ((m.pan[0] || m.pan[1]) && v.pan) v.pan(m.pan[0], m.pan[1]);
    if (m.zoom !== 1 && v.zoom) { const [x, y] = inside(v, cx, cy); v.zoom(m.zoom, x, y); }
    if ((m.orbit[0] || m.orbit[1])) { if (v.orbit) v.orbit(m.orbit[0], m.orbit[1]); else if (v.pan && v.kind !== '3d') { /* a 2D view has no orbit */ } }
    return true;
  }

  // ---- actions ----
  const say = (text) => { try { window.ccShellScreen?.say?.(text); } catch (e) { /* no screen note */ } };
  function perform(action, info = {}) {
    if (!action || action === 'app' || action === 'off') return false;
    if (action === 'view:fit') {
      const v = activeView();
      if (v && v.fit) { v.fit(); return true; }
      return false;
    }
    const id = D.cmdOf(action);
    if (!id) return false;
    const I = window.ccInput;
    if (!I || !I.commands.some((c) => c.id === id)) { if (info.from) say(T('shell.dev.notcmd', { id })); return false; }
    Promise.resolve(I.run(id)).catch(() => {});
    return true;
  }
  const pickPath = (path) => { let at = P; for (const k of String(path).split('.')) { if (at == null) return null; at = at[k]; } return at == null ? null : at; };

  // ---- skip: dialogs, fields, the help panel, our own Settings ----
  const blocked = (t) => !!(t && t.closest && t.closest('dialog, input, textarea, select, [contenteditable="true"], .help-panel, .cc-in-dlg'));

  // ---- wheel: trackpad and mouse tilt ----
  const mem = { until: 0 };
  const ours = new WeakSet();
  window.addEventListener('wheel', (e) => {
    if (ours.has(e) || blocked(e.target)) return;
    const kind = D.classifyWheel(e, mem);
    if (kind === 'pad' || kind === 'pinch') markSeen('trackpad');
    const v = viewAt(e.clientX, e.clientY, e.target);
    let want = 'app';
    if (kind === 'pad') want = P.trackpad.scroll;
    else if (kind === 'pinch') want = P.trackpad.pinch === 'off' ? 'off' : 'app';
    else if (kind === 'tilt') want = P.mouse.tilt;
    if (want === 'app') return;
    const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (want === 'off') { if (v || e.target.closest('main')) stop(); return; }
    let { dx, dy } = D.wheelPixels(e);
    const k = kind === 'pad' ? P.trackpad.speed * (P.trackpad.invert ? -1 : 1) : 1;
    dx *= k; dy *= k;
    if (kind === 'tilt' && want === 'view:pan') { if (v && v.pan) { stop(); move(v, { pan: [-dx, 0], zoom: 1, orbit: [0, 0] }); } return; }
    if (want === 'view:zoom') {
      stop();
      const f = Math.exp(-dy * 0.0025);
      if (v && v.zoom) { move(v, { pan: [0, 0], zoom: f, orbit: [0, 0] }, e.clientX, e.clientY); return; }
      // no view handed over: the pinch every app already zooms on
      const syn = new WheelEvent('wheel', { bubbles: true, cancelable: true, composed: true, clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY,
        deltaX: 0, deltaY: dy * 0.4, deltaMode: 0, ctrlKey: true });
      ours.add(syn); e.target.dispatchEvent(syn);
      return;
    }
    if (!v) return;   // pan and orbit need the app's view; the app keeps the event
    if (want === 'view:pan' && v.pan) { stop(); move(v, { pan: [-dx, -dy], zoom: 1, orbit: [0, 0] }); }
    else if (want === 'view:orbit' && v.orbit) { stop(); move(v, { pan: [0, 0], zoom: 1, orbit: [-dx, -dy] }); }
  }, { capture: true, passive: false });

  // ---- mouse side buttons ----
  const SIDE = { 3: 'back', 4: 'forward' };
  const sideAct = (e) => (e.pointerType && e.pointerType !== 'mouse' ? null : SIDE[e.button] ? P.mouse[SIDE[e.button]] : null);
  window.addEventListener('pointerdown', (e) => {
    const a = sideAct(e); if (!a || a === 'app' || blocked(e.target)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    perform(a, { from: 'mouse' });
  }, true);
  for (const type of ['pointerup', 'mouseup', 'mousedown', 'auxclick']) {
    window.addEventListener(type, (e) => { const a = sideAct(e); if (a && a !== 'app') { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  }

  // ---- pen and touch: app-phone.js asks ----
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'pen') markSeen('pen'); else if (e.pointerType === 'touch') markSeen('touch'); }, { capture: true, passive: true });

  // ---- one loop for the devices that stream (3D mouse, controller) ----
  let raf = 0, lastT = 0;
  const space = { dev: null, t: [0, 0, 0], r: [0, 0, 0], buttons: 0, prev: 0 };
  const pads = new Map();   // index → previous buttons bitmask
  function needLoop() { return (space.dev && P.spacemouse.on) || (pads.size && P.gamepad.on); }
  function kick() { if (!raf && needLoop()) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }
  function busyUi() { return !!document.querySelector('dialog[open]'); }
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
    let active = false;
    if (space.dev && P.spacemouse.on && !busyUi()) {
      const ax = D.spaceAxes(space, P.spacemouse);
      const m = D.axesToView(D.SPACE_AXES.map((k) => [P.spacemouse.axes[k], ax[k]]), P.spacemouse.speed, dt);
      if (m.pan[0] || m.pan[1] || m.zoom !== 1 || m.orbit[0] || m.orbit[1]) { move(activeView(), { pan: [-m.pan[0], -m.pan[1]], zoom: m.zoom, orbit: m.orbit }); active = true; }
      for (const b of D.pressed(space.prev, space.buttons)) perform(P.spacemouse.buttons[b] || 'off', { from: 'spacemouse' });
      space.prev = space.buttons;
      active = active || !!space.buttons;
    }
    if (pads.size && P.gamepad.on && navigator.getGamepads) {
      for (const gp of navigator.getGamepads()) {
        if (!gp || !pads.has(gp.index)) continue;
        const G = P.gamepad, a = (i) => D.deadZone(gp.axes[i] || 0, G.dead), inv = G.invertY ? -1 : 1;
        const pairs = [];
        const stick = (act, x, y) => {
          if (act === 'view:pan') pairs.push(['pan-x', x], ['pan-y', y * inv]);
          else if (act === 'view:orbit') pairs.push(['orbit-x', x], ['orbit-y', y * inv]);
          else if (act === 'view:zoom') pairs.push(['zoom', -y * inv]);
        };
        stick(G.left, a(0), a(1)); stick(G.right, a(2), a(3));
        if (G.triggers === 'view:zoom' && gp.mapping === 'standard') pairs.push(['zoom', (gp.buttons[7]?.value || 0) - (gp.buttons[6]?.value || 0)]);
        const m = D.axesToView(pairs, G.speed, dt);
        let bits = 0; gp.buttons.forEach((b, i) => { if (b.pressed && i < 31) bits |= 1 << i; });
        if (!busyUi()) {
          if (m.pan[0] || m.pan[1] || m.zoom !== 1 || m.orbit[0] || m.orbit[1]) { move(activeView(), { pan: [-m.pan[0], -m.pan[1]], zoom: m.zoom, orbit: m.orbit }); }
          const prev = pads.get(gp.index) || 0;
          for (const [name, i] of Object.entries(D.PAD_INDEX)) if ((bits & (1 << i)) && !(prev & (1 << i))) perform(G.buttons[name], { from: 'gamepad' });
        }
        pads.set(gp.index, bits);
        active = true;   // a controller is polled while connected
      }
    }
    if (active || needLoop()) raf = requestAnimationFrame(tick);
  }

  // game controllers: no permission; noticed on their first button press
  window.addEventListener('gamepadconnected', (e) => { pads.set(e.gamepad.index, 0); markSeen('gamepad', e.gamepad.id); kick(); changed(); });
  window.addEventListener('gamepaddisconnected', (e) => { pads.delete(e.gamepad.index); changed(); });

  // 3D mouse over WebHID
  function openSpace(dev) {
    if (!dev) return Promise.resolve(false);
    return (dev.opened ? Promise.resolve() : dev.open()).then(() => {
      space.dev = dev;
      dev.addEventListener('inputreport', (e) => { if (D.parseSpaceReport(e.reportId, e.data, space)) kick(); });
      markSeen('spacemouse', dev.productName); changed(); return true;
    }).catch(() => false);
  }
  async function connectSpace() {
    if (!navigator.hid) return { ok: false, why: 'nohid' };
    try {
      const [dev] = await navigator.hid.requestDevice({ filters: D.HID_FILTERS });
      if (!dev) return { ok: false, why: 'none' };
      return { ok: await openSpace(dev), name: dev.productName };
    } catch (e) { return { ok: false, why: 'denied' }; }
  }
  if (navigator.hid && navigator.hid.getDevices) {
    navigator.hid.getDevices().then((list) => { const dev = list.find((d) => d.collections?.some((c) => c.usagePage === 1 && c.usage === 8)) || list[0]; if (dev) openSpace(dev); }).catch(() => {});
    navigator.hid.addEventListener?.('disconnect', (e) => { if (e.device === space.dev) { space.dev = null; changed(); } });
  }

  // MIDI controllers
  const midi = { access: null, learn: null, last: new Map() };
  function onMidi(e) {
    const msg = D.midiMessage(e.data);
    if (!msg) return;
    markSeen('midi', e.target?.name);
    if (midi.learn) { const done = midi.learn; midi.learn = null; done(msg); return; }
    if (!P.midi.on || busyUi()) return;
    const b = D.findBind(P.midi.binds, msg);
    if (!b) return;
    if (msg.type === 'note') { perform(b.action, { from: 'midi' }); return; }
    const key = msg.ch + ':' + msg.n, d = D.knobDelta(msg.v, midi.last.get(key)); midi.last.set(key, msg.v);
    if (d) { const m = D.axesToView([[b.action, d]], 1, 0.6); move(activeView(), { pan: [-m.pan[0], -m.pan[1]], zoom: m.zoom, orbit: m.orbit }); }
  }
  async function connectMidi() {
    if (!navigator.requestMIDIAccess) return { ok: false, why: 'nomidi' };
    try {
      midi.access = await navigator.requestMIDIAccess({ sysex: false });
      const hook = () => midi.access.inputs.forEach((i) => { i.onmidimessage = onMidi; });
      hook(); midi.access.onstatechange = () => { hook(); changed(); };
      changed();
      return { ok: true, count: midi.access.inputs.size };
    } catch (e) { return { ok: false, why: 'denied' }; }
  }
  const midiInputs = () => (midi.access ? [...midi.access.inputs.values()].map((i) => i.name || i.id) : []);
  function learnMidi(ms = 15000) {
    return new Promise((res) => { const t = setTimeout(() => { midi.learn = null; res(null); }, ms); midi.learn = (msg) => { clearTimeout(t); res(msg); }; });
  }

  const api = {
    app: APP, appName: cfg.appName || APP,
    prefs: () => P, pick: pickPath, perform, scope: () => D.scopeOf(S, APP), state: () => S,
    set(path, value, scope = D.scopeOf(S, APP)) { save(D.setIn(S, scope, APP, path, value)); },
    setScope(scope) { save(scope === 'app' ? D.ownCopy(S, APP) : D.useAll(S, APP)); },
    reset(scope = D.scopeOf(S, APP)) { save(D.setProfile(S, scope, APP, {})); },
    setProfile(p, scope = D.scopeOf(S, APP)) { save(D.setProfile(S, scope, APP, p)); },
    addBind(b) { save(D.addBind(S, D.scopeOf(S, APP), APP, b)); },
    removeBind(i) { save(D.removeBind(S, D.scopeOf(S, APP), APP, i)); },
    views: () => live().slice(), seen: () => ({ ...seen }), markSeen,
    connectSpace, connectMidi, learnMidi, midiInputs,
    spaceName: () => (space.dev ? space.dev.productName || 'HID' : ''),
    pads: () => (navigator.getGamepads ? [...navigator.getGamepads()].filter((g) => g && pads.has(g.index)).map((g) => g.id) : []),
    on(f) { listeners.add(f); return () => listeners.delete(f); },
    // tests: feed a 3D mouse report or a frame as if a device sent it
    _space: space, _tick: (ms = 16) => { lastT = performance.now() - ms; tick(performance.now()); },
  };
  window.ccShellDevices = api;
  window.dispatchEvent(new CustomEvent('cc-devices-ready', { detail: { app: APP } }));
  mountSettings(api);
}

// ---- Settings › Global › Input devices ----
function mountSettings(A) {
  const box = document.querySelector('[data-app-settings] [data-dev-settings]');
  if (!box) return;
  const dlg = box.closest('dialog');
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'className') n.className = v; else if (k === 'checked' || k === 'disabled' || k === 'value' || k === 'type' || k === 'open') n[k] = v;
      else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : String(c));
    return n;
  };
  const icon = (c) => el('i', { className: 'bi ' + c, 'aria-hidden': 'true' });
  const openCards = new Set();
  let uid = 0;

  function commands() {
    const I = window.ccInput;
    if (!I || !I.paletteItems) return [];
    return I.paletteItems().map((it) => ({ id: it.id.replace(/^input:/, ''), label: it.label, group: it.group }));
  }
  /** A select of button actions: base choices, then the app's commands by group. */
  function actionSelect(path, value, opts = {}) {
    const s = el('select', { className: 'select-cc', 'data-dev': path, id: 'cc-dev-' + (++uid) });
    const base = [];
    if (opts.app !== false) base.push(['app', T(opts.appLabel || 'shell.dev.act.app')]);
    base.push(['off', T('shell.dev.act.off')], ['view:fit', T('shell.dev.act.fit')]);
    for (const [v, l] of base) s.append(el('option', { value: v }, l));
    const groups = new Map();
    for (const c of commands()) { if (!groups.has(c.group)) groups.set(c.group, []); groups.get(c.group).push(c); }
    for (const [g, list] of groups) {
      const og = el('optgroup', { label: g || T('shell.dev.act.cmds') });
      for (const c of list) og.append(el('option', { value: 'cmd:' + c.id }, c.label));
      s.append(og);
    }
    const id = typeof value === 'string' && value.startsWith('cmd:') ? value.slice(4) : null;
    if (id && ![...s.options].some((o) => o.value === value)) s.append(el('option', { value }, T('shell.dev.act.missing', { id })));
    s.value = value;
    return s;
  }
  function choiceSelect(path, value, list) {
    const s = el('select', { className: 'select-cc', 'data-dev': path, id: 'cc-dev-' + (++uid) });
    for (const [v, k] of list) s.append(el('option', { value: v }, T(k)));
    s.value = value;
    return s;
  }
  const row = (labelKey, control, vars) => el('div', { className: 'shell-row' }, el('label', { for: control.id }, T(labelKey, vars)), control);
  const check = (path, on, labelKey) => el('label', { className: 'shell-check' }, el('input', { type: 'checkbox', 'data-dev': path, checked: !!on }), ' ', T(labelKey));
  const range = (path, value, labelKey, min, max, step) => {
    const i = el('input', { type: 'range', min, max, step, value: String(value), 'data-dev': path, id: 'cc-dev-' + (++uid), 'data-num': '' });
    const out = el('output', { for: i.id, className: 'shell-hint-text' }, Number(value).toFixed(2).replace(/\.?0+$/, ''));
    i.addEventListener('input', () => { out.textContent = Number(i.value).toFixed(2).replace(/\.?0+$/, ''); });
    return el('div', { className: 'shell-row' }, el('label', { for: i.id }, T(labelKey)), i, out);
  };
  const hint = (k, v) => el('p', { className: 'shell-hint-text' }, T(k, v));
  const AXIS = D.AXIS_ACTIONS.map((a) => [a, 'shell.dev.axis.' + a]);

  function card(dev, iconCls, body) {
    const s = A.seen()[dev];
    const d = el('details', { className: 'shell-dev', 'data-dev-card': dev, open: openCards.has(dev) });
    d.addEventListener('toggle', () => { if (d.open) openCards.add(dev); else openCards.delete(dev); });
    const state = dev === 'spacemouse' && A.spaceName() ? T('shell.dev.connected', { name: A.spaceName() })
      : dev === 'gamepad' && A.pads().length ? T('shell.dev.connected', { name: A.pads()[0] })
        : s ? T('shell.dev.seen') : T('shell.dev.notseen');
    d.append(el('summary', {}, icon(iconCls), ' ', el('span', { className: 'shell-dev-name' }, T('shell.dev.' + dev)), ' ', el('span', { className: 'shell-hint-text shell-dev-state', 'data-dev-state': '' }, state)));
    d.append(el('div', { className: 'shell-dev-body' }, body));
    return d;
  }

  function render() {
    const P = A.prefs(), scope = A.scope();
    box.textContent = '';
    // scope: every app, or this app only
    const name = 'devScope' + (++uid);
    const seg = el('div', { className: 'shell-seg', role: 'radiogroup', 'aria-label': T('shell.dev.scope') },
      el('label', {}, el('input', { type: 'radio', name, value: 'all', checked: scope === 'all', 'data-dev-scope': '' }), ' ', icon('bi-grid-3x3-gap'), ' ', T('shell.dev.scope.all')),
      el('label', {}, el('input', { type: 'radio', name, value: 'app', checked: scope === 'app', 'data-dev-scope': '' }), ' ', icon('bi-app'), ' ', T('shell.dev.scope.app', { app: A.appName })));
    box.append(el('p', { className: 'shell-hint-text mb-1' }, T('shell.dev.scope')), seg,
      hint(scope === 'app' ? 'shell.dev.scope.app.hint' : 'shell.dev.scope.all.hint', { app: A.appName }));
    if (!A.views().length) box.append(hint('shell.dev.noview', { app: A.appName }));

    box.append(card('trackpad', 'bi-hand-index-thumb', [
      row('shell.dev.tp.scroll', choiceSelect('trackpad.scroll', P.trackpad.scroll, [['app', 'shell.dev.act.app'], ['view:pan', 'shell.dev.act.pan'], ['view:zoom', 'shell.dev.act.zoom'], ['view:orbit', 'shell.dev.act.orbit']])),
      row('shell.dev.tp.pinch', choiceSelect('trackpad.pinch', P.trackpad.pinch, [['app', 'shell.dev.act.app.zoom'], ['off', 'shell.dev.act.off']])),
      range('trackpad.speed', P.trackpad.speed, 'shell.dev.speed', 0.25, 4, 0.25),
      check('trackpad.invert', P.trackpad.invert, 'shell.dev.invert'),
      hint('shell.dev.tp.hint'),
    ]));
    box.append(card('mouse', 'bi-mouse', [
      row('shell.dev.ms.back', actionSelect('mouse.back', P.mouse.back)),
      row('shell.dev.ms.forward', actionSelect('mouse.forward', P.mouse.forward)),
      row('shell.dev.ms.tilt', choiceSelect('mouse.tilt', P.mouse.tilt, [['app', 'shell.dev.act.app'], ['view:pan', 'shell.dev.act.pan'], ['off', 'shell.dev.act.off']])),
      hint('shell.dev.ms.hint'),
    ]));
    box.append(card('pen', 'bi-pen', [
      row('shell.dev.pen.side', actionSelect('pen.side', P.pen.side, { appLabel: 'shell.pen.app.side' })),
      row('shell.dev.pen.eraser', actionSelect('pen.eraser', P.pen.eraser, { appLabel: 'shell.pen.app.eraser' })),
      hint('shell.dev.pen.hint'),
    ]));
    box.append(card('touch', 'bi-hand-index', [
      row('shell.dev.touch.tap2', actionSelect('touch.tap2', P.touch.tap2, { app: false })),
      row('shell.dev.touch.tap3', actionSelect('touch.tap3', P.touch.tap3, { app: false })),
    ]));

    const sm = P.spacemouse;
    const connect3d = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-connect': 'spacemouse', disabled: !navigator.hid }, icon('bi-usb-plug'), ' ', T('shell.dev.sm.connect'));
    const status3d = el('span', { className: 'shell-hint-text', 'aria-live': 'polite' });
    connect3d.addEventListener('click', async () => { const r = await A.connectSpace(); status3d.textContent = r.ok ? T('shell.dev.connected', { name: r.name || '' }) : T('shell.dev.sm.why.' + r.why); });
    const axisRows = D.SPACE_AXES.map((k) => el('div', { className: 'shell-row shell-dev-axis' },
      el('label', { for: 'cc-dev-ax-' + k + uid }, T('shell.dev.sm.ax.' + k)),
      Object.assign(choiceSelect('spacemouse.axes.' + k, sm.axes[k], AXIS), { id: 'cc-dev-ax-' + k + uid }),
      el('label', { className: 'shell-check' }, el('input', { type: 'checkbox', 'data-dev': 'spacemouse.invert.' + k, checked: sm.invert[k] }), ' ', T('shell.dev.flip'))));
    const btnRows = [0, 1, 2, 3].map((i) => row('shell.dev.sm.button', actionSelect('spacemouse.buttons.' + i, sm.buttons[i] || 'off', { app: i < 2 }), { n: i + 1 }));
    box.append(card('spacemouse', 'bi-joystick', [
      el('div', { className: 'shell-btns' }, connect3d, ' ', status3d),
      navigator.hid ? null : hint('shell.dev.sm.why.nohid'),
      check('spacemouse.on', sm.on, 'shell.dev.on'),
      range('spacemouse.speed', sm.speed, 'shell.dev.speed', 0.25, 4, 0.25),
      range('spacemouse.dead', sm.dead, 'shell.dev.dead', 0, 0.4, 0.02),
      check('spacemouse.dominant', sm.dominant, 'shell.dev.sm.dominant'),
      ...axisRows, ...btnRows,
      hint('shell.dev.sm.hint'),
    ]));

    const G = P.gamepad;
    const stickList = [['off', 'shell.dev.act.off'], ['view:pan', 'shell.dev.act.pan'], ['view:orbit', 'shell.dev.act.orbit'], ['view:zoom', 'shell.dev.act.zoom']];
    box.append(card('gamepad', 'bi-controller', [
      check('gamepad.on', G.on, 'shell.dev.on'),
      row('shell.dev.gp.left', choiceSelect('gamepad.left', G.left, stickList)),
      row('shell.dev.gp.right', choiceSelect('gamepad.right', G.right, stickList)),
      row('shell.dev.gp.triggers', choiceSelect('gamepad.triggers', G.triggers, [['view:zoom', 'shell.dev.act.zoom'], ['off', 'shell.dev.act.off']])),
      check('gamepad.invertY', G.invertY, 'shell.dev.gp.invert'),
      range('gamepad.speed', G.speed, 'shell.dev.speed', 0.25, 4, 0.25),
      range('gamepad.dead', G.dead, 'shell.dev.dead', 0, 0.4, 0.02),
      ...D.PAD_BUTTONS.map((b) => row('shell.dev.gp.b.' + b, actionSelect('gamepad.buttons.' + b, G.buttons[b], { app: false }))),
      hint('shell.dev.gp.hint'),
    ]));

    const M = P.midi;
    const connectM = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-connect': 'midi', disabled: !navigator.requestMIDIAccess }, icon('bi-sliders'), ' ', T('shell.dev.midi.connect'));
    const statusM = el('span', { className: 'shell-hint-text', 'aria-live': 'polite' }, A.midiInputs().join(', '));
    connectM.addEventListener('click', async () => { const r = await A.connectMidi(); statusM.textContent = r.ok ? (A.midiInputs().join(', ') || T('shell.dev.midi.none')) : T('shell.dev.midi.why.' + r.why); });
    const newAct = el('select', { className: 'select-cc', id: 'cc-dev-midi-act' + uid, 'data-dev-midi-new': '' });
    newAct.append(el('optgroup', { label: T('shell.dev.midi.knobs') }, ...D.AXIS_ACTIONS.filter((a) => a !== 'off').map((a) => el('option', { value: 'cc|' + a }, T('shell.dev.axis.' + a)))));
    const btnSel = actionSelect('', 'view:fit', { app: false });
    const padsOg = el('optgroup', { label: T('shell.dev.midi.pads') });
    [...btnSel.options].filter((o) => o.value !== 'off').forEach((o) => padsOg.append(el('option', { value: 'note|' + o.value }, o.textContent)));
    newAct.append(padsOg);
    const learn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-midi-learn': '', disabled: !navigator.requestMIDIAccess }, icon('bi-record-circle'), ' ', T('shell.dev.midi.learn'));
    const learnSay = el('span', { className: 'shell-hint-text', 'aria-live': 'polite' });
    learn.addEventListener('click', async () => {
      if (!A.midiInputs().length) { const r = await A.connectMidi(); if (!r.ok) { learnSay.textContent = T('shell.dev.midi.why.' + r.why); return; } }
      const [type, action] = newAct.value.split('|');
      learnSay.textContent = T(type === 'cc' ? 'shell.dev.midi.turn' : 'shell.dev.midi.press');
      const msg = await A.learnMidi();
      if (!msg) { learnSay.textContent = T('shell.dev.midi.timeout'); return; }
      if (msg.type !== type) { learnSay.textContent = T(type === 'cc' ? 'shell.dev.midi.wantknob' : 'shell.dev.midi.wantpad'); return; }
      A.addBind({ type, ch: msg.ch, n: msg.n, action });
    });
    const list = el('ul', { className: 'shell-dev-binds', 'data-dev-midi-binds': '' });
    M.binds.forEach((b, i) => {
      const what = b.type === 'cc' ? T('shell.dev.axis.' + b.action) : labelOf(b.action);
      const rm = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'aria-label': T('shell.dev.midi.remove') }, icon('bi-x-lg'));
      rm.addEventListener('click', () => A.removeBind(i));
      list.append(el('li', {}, T(b.type === 'cc' ? 'shell.dev.midi.cc' : 'shell.dev.midi.note', { ch: b.ch + 1, n: b.n }), ' — ', what, ' ', rm));
    });
    box.append(card('midi', 'bi-sliders', [
      el('div', { className: 'shell-btns' }, connectM, ' ', statusM),
      check('midi.on', M.on, 'shell.dev.on'),
      el('div', { className: 'shell-row' }, el('label', { for: newAct.id }, T('shell.dev.midi.add')), newAct),
      el('div', { className: 'shell-btns' }, learn, ' ', learnSay),
      M.binds.length ? list : hint('shell.dev.midi.empty'),
    ]));

    // files and reset
    const exp = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-export': '' }, icon('bi-download'), ' ', T('shell.dev.export'));
    const imp = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-import': '' }, icon('bi-upload'), ' ', T('shell.dev.import'));
    const rst = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dev-reset': '' }, icon('bi-arrow-counterclockwise'), ' ', T('shell.dev.reset'));
    const said = el('p', { className: 'shell-hint-text', 'aria-live': 'polite', 'data-dev-said': '' });
    exp.addEventListener('click', () => {
      const text = D.exportProfile(A.prefs(), A.scope() === 'app' ? A.appName : '');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = 'my-devices.ccdevices.json'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    });
    imp.addEventListener('click', () => {
      const f = el('input', { type: 'file', accept: '.json,.ccdevices.json,application/json' });
      f.addEventListener('change', async () => {
        const file = f.files && f.files[0]; if (!file) return;
        if (file.size > D.MAX_FILE) { said.textContent = T('shell.dev.import.size'); return; }
        const r = D.importProfile(await file.text());
        if (r.error) { said.textContent = T('shell.dev.import.' + r.error); return; }
        A.setProfile(r.profile);
        said.textContent = r.dropped.length ? T('shell.dev.import.dropped', { n: r.dropped.length }) : T('shell.dev.import.done');
      });
      f.click();
    });
    rst.addEventListener('click', () => { A.reset(); });
    box.append(el('div', { className: 'shell-btns' }, exp, imp, rst), said);
  }
  function labelOf(action) {
    if (action === 'view:fit') return T('shell.dev.act.fit');
    const id = D.cmdOf(action);
    const c = id && commands().find((x) => x.id === id);
    return c ? c.label : (id || action);
  }

  box.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-dev-scope]')) { A.setScope(t.value); return; }
    const path = t.getAttribute('data-dev');
    if (!path) return;
    const v = t.type === 'checkbox' ? t.checked : t.hasAttribute('data-num') ? Number(t.value) : t.value;
    quiet = true;   // the field already shows it: no re-draw (focus stays where it is)
    try { A.set(path, v); } finally { quiet = false; }
  });
  // re-draw when the stored settings change (this tab, another window) and when the dialog opens (commands, devices seen)
  let quiet = false;
  A.on(() => { if (!quiet && (!dlg || dlg.open)) render(); });
  if (dlg) new MutationObserver(() => { if (dlg.open) render(); }).observe(dlg, { attributes: true, attributeFilter: ['open'] });
  // Startup perf (2026-11-05): the panel builds every action list from the app's whole command palette (~120 ms on CadCraft), and nobody sees it
  // until Settings is open. So it is drawn when the dialog opens (the observer above), not at page load.
  window.addEventListener('cc-input-ready', () => { if (!dlg || dlg.open) render(); });
  if (!dlg || dlg.open) render();
  box.closest('[data-dev-set]')?.removeAttribute('hidden');
}
