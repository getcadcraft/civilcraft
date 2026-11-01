/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — event field names, setting values and file-format keys; the words are shell.dev.* in assets/lang/shell. */
/**
 * app-devices.js — the shared input-device engine (0.8 Track ID, docs/0.8-PART4.md; map docs/apps/app-devices.md). DOM-free,
 * import-free: Node tests import it as is. The page side is app-devices-ui.js.
 *
 * Every pointing and button device a person may have, set up once for every app and, when wanted, differently in one app:
 *   trackpad    two-finger scroll (the app's own way, or pan / zoom / orbit), pinch (zoom or nothing), speed, invert
 *   mouse       the back and forward side buttons and the sideways wheel tilt
 *   pen         the side (barrel) button and the eraser end (app-phone.js § Pen and touch runs them)
 *   touch       two- and three-finger taps (app-phone.js)
 *   spacemouse  a 6-axis 3D mouse through WebHID: each axis to pan / zoom / orbit (or nothing), invert, speed, dead zone,
 *               the strongest axis only, its buttons to commands
 *   gamepad     a game controller (Gamepad API): sticks, triggers and buttons
 *   midi        a MIDI controller (Web MIDI): pads and keys to commands, knobs and faders to pan / zoom / orbit, learned
 *
 * An action is a string: 'app' (leave it to the app, as before), 'off' (nothing), 'view:fit', and for gestures 'view:pan' /
 * 'view:zoom' / 'view:orbit', or 'cmd:<id>' (a command of the app's input registry, run by window.ccInput.run — the same path
 * as every menu style). An axis takes one of AXIS_ACTIONS. A command id that an app does not have does nothing there.
 *
 * Stored (localStorage STORE, one origin: every app, the Studio hub and every app window read the same key):
 *   { v: 1, all: <profile>, apps: { <slug>: <profile> } }
 * An app with an entry in `apps` uses it ("Only in this app"); every other app uses `all`. Read back as untrusted (cleanState).
 * Files: format 'cadcraft-devices' v1, '.ccdevices.json', ≤ 100 kB, untrusted (importProfile).
 */
export const FORMAT = 'cadcraft-devices';
export const VERSION = 1;
export const STORE = 'cc-devices';
export const SEEN_KEY = 'cc-devices-seen';
export const MAX_FILE = 100 * 1024;
export const DEVICES = ['trackpad', 'mouse', 'pen', 'touch', 'spacemouse', 'gamepad', 'midi'];

export const CMD_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;
export const AXIS_ACTIONS = ['off', 'pan-x', 'pan-y', 'zoom', 'orbit-x', 'orbit-y'];
export const SCROLL_ACTIONS = ['app', 'view:pan', 'view:zoom', 'view:orbit'];
export const PINCH_ACTIONS = ['app', 'off'];
export const TILT_ACTIONS = ['app', 'view:pan', 'off'];
export const STICK_ACTIONS = ['off', 'view:pan', 'view:orbit', 'view:zoom'];
export const SPACE_AXES = ['tx', 'ty', 'tz', 'rx', 'ry', 'rz'];
export const PAD_BUTTONS = ['a', 'b', 'x', 'y', 'lb', 'rb', 'back', 'start', 'ls', 'rs', 'up', 'down', 'left', 'right'];
/** The standard Gamepad mapping's button index of each name (lt = 6 and rt = 7 are the triggers, read as an axis). */
export const PAD_INDEX = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, back: 8, start: 9, ls: 10, rs: 11, up: 12, down: 13, left: 14, right: 15 };
export const MAX_SPACE_BUTTONS = 32;
export const MAX_MIDI_BINDS = 64;
const RANGES = { speed: [0.1, 5], dead: [0, 0.5] };

export const DEFAULTS = Object.freeze({
  trackpad: { scroll: 'app', pinch: 'app', speed: 1, invert: false },
  mouse: { back: 'app', forward: 'app', tilt: 'app' },
  pen: { side: 'app', eraser: 'app' },
  touch: { tap2: 'cmd:edit.undo', tap3: 'cmd:edit.redo' },
  spacemouse: {
    on: true, speed: 1, dead: 0.06, dominant: false,
    axes: { tx: 'pan-x', ty: 'zoom', tz: 'pan-y', rx: 'orbit-y', ry: 'off', rz: 'orbit-x' },
    invert: { tx: false, ty: false, tz: false, rx: false, ry: false, rz: false },
    buttons: ['app', 'view:fit'],
  },
  gamepad: {
    on: true, speed: 1, dead: 0.15, left: 'view:pan', right: 'view:orbit', triggers: 'view:zoom', invertY: false,
    buttons: { a: 'view:fit', b: 'off', x: 'off', y: 'off', lb: 'cmd:edit.undo', rb: 'cmd:edit.redo', back: 'off', start: 'off', ls: 'off', rs: 'off', up: 'off', down: 'off', left: 'off', right: 'off' },
  },
  midi: { on: true, binds: [] },
});

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const clamp = (v, [lo, hi], def) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def; };
const bool = (v, def) => (typeof v === 'boolean' ? v : def);
const pick = (v, list, def) => (list.includes(v) ? v : def);
export const copy = (v) => JSON.parse(JSON.stringify(v));

/** A button's action: 'app', 'off', 'view:fit' or 'cmd:<id>'; anything else → def. opts.app false: 'app' is not a choice. */
export function cleanAction(v, def = 'off', opts = {}) {
  if (typeof v !== 'string') return def;
  if (v === 'off' || v === 'view:fit') return v;
  if (v === 'app') return opts.app === false ? def : v;
  if (v.startsWith('cmd:') && CMD_RE.test(v.slice(4))) return v;
  return def;
}
export const cmdOf = (a) => (typeof a === 'string' && a.startsWith('cmd:') ? a.slice(4) : null);

/** Every field present and in range; unknown fields dropped. */
export function cleanProfile(p) {
  const o = isObj(p) ? p : {}, D = DEFAULTS, out = copy(D);
  const tp = isObj(o.trackpad) ? o.trackpad : {};
  out.trackpad = { scroll: pick(tp.scroll, SCROLL_ACTIONS, D.trackpad.scroll), pinch: pick(tp.pinch, PINCH_ACTIONS, D.trackpad.pinch),
    speed: clamp(tp.speed, RANGES.speed, 1), invert: bool(tp.invert, false) };
  const ms = isObj(o.mouse) ? o.mouse : {};
  out.mouse = { back: cleanAction(ms.back, 'app'), forward: cleanAction(ms.forward, 'app'), tilt: pick(ms.tilt, TILT_ACTIONS, 'app') };
  const pn = isObj(o.pen) ? o.pen : {};
  out.pen = { side: cleanAction(pn.side, 'app'), eraser: cleanAction(pn.eraser, 'app') };
  const tc = isObj(o.touch) ? o.touch : {};
  out.touch = { tap2: cleanAction(tc.tap2, D.touch.tap2, { app: false }), tap3: cleanAction(tc.tap3, D.touch.tap3, { app: false }) };
  const sm = isObj(o.spacemouse) ? o.spacemouse : {};
  const ax = isObj(sm.axes) ? sm.axes : {}, inv = isObj(sm.invert) ? sm.invert : {};
  out.spacemouse = {
    on: bool(sm.on, true), speed: clamp(sm.speed, RANGES.speed, 1), dead: clamp(sm.dead, RANGES.dead, D.spacemouse.dead), dominant: bool(sm.dominant, false),
    axes: Object.fromEntries(SPACE_AXES.map((k) => [k, pick(ax[k], AXIS_ACTIONS, D.spacemouse.axes[k])])),
    invert: Object.fromEntries(SPACE_AXES.map((k) => [k, bool(inv[k], false)])),
    buttons: (Array.isArray(sm.buttons) ? sm.buttons : D.spacemouse.buttons).slice(0, MAX_SPACE_BUTTONS).map((a) => cleanAction(a, 'off')),
  };
  const gp = isObj(o.gamepad) ? o.gamepad : {}, gb = isObj(gp.buttons) ? gp.buttons : {};
  out.gamepad = {
    on: bool(gp.on, true), speed: clamp(gp.speed, RANGES.speed, 1), dead: clamp(gp.dead, RANGES.dead, D.gamepad.dead), invertY: bool(gp.invertY, false),
    left: pick(gp.left, STICK_ACTIONS, D.gamepad.left), right: pick(gp.right, STICK_ACTIONS, D.gamepad.right), triggers: pick(gp.triggers, ['off', 'view:zoom'], D.gamepad.triggers),
    buttons: Object.fromEntries(PAD_BUTTONS.map((k) => [k, cleanAction(gb[k], D.gamepad.buttons[k], { app: false })])),
  };
  const md = isObj(o.midi) ? o.midi : {};
  out.midi = { on: bool(md.on, true), binds: (Array.isArray(md.binds) ? md.binds : []).map(cleanBind).filter(Boolean).slice(0, MAX_MIDI_BINDS) };
  return out;
}

/** A MIDI binding { type: 'note' | 'cc', ch 0–15, n 0–127, action } — a note takes a button action, a knob an axis action. */
export function cleanBind(b) {
  if (!isObj(b) || (b.type !== 'note' && b.type !== 'cc')) return null;
  const ch = Number(b.ch), n = Number(b.n);
  if (!Number.isInteger(ch) || ch < 0 || ch > 15 || !Number.isInteger(n) || n < 0 || n > 127) return null;
  const action = b.type === 'cc' ? (AXIS_ACTIONS.includes(b.action) && b.action !== 'off' ? b.action : null) : cleanAction(b.action, null, { app: false });
  return action ? { type: b.type, ch, n, action } : null;
}

// ---- stored state: every app, and the apps with their own ----
export function emptyState() { return { v: VERSION, all: cleanProfile({}), apps: {} }; }
const SLUG_RE = /^[a-z0-9-]{1,40}$/;
export function cleanState(s) {
  const o = isObj(s) ? s : {}, apps = {};
  if (isObj(o.apps)) for (const [k, p] of Object.entries(o.apps)) if (SLUG_RE.test(k) && isObj(p)) apps[k] = cleanProfile(p);
  return { v: VERSION, all: cleanProfile(o.all), apps };
}
export function readState(text) {
  if (typeof text !== 'string' || !text) return null;
  try { return cleanState(JSON.parse(text)); } catch (e) { return null; }
}
/** The profile an app runs with. */
export const resolve = (state, app) => (state.apps && state.apps[app]) || state.all;
export const scopeOf = (state, app) => (state.apps && state.apps[app] ? 'app' : 'all');
/** "Only in this app": a copy of the every-app settings to change from. */
export function ownCopy(state, app) {
  if (!SLUG_RE.test(app) || state.apps[app]) return state;
  return { ...state, apps: { ...state.apps, [app]: copy(state.all) } };
}
/** Back to the every-app settings in this app (its own are dropped). */
export function useAll(state, app) {
  if (!state.apps[app]) return state;
  const apps = { ...state.apps }; delete apps[app];
  return { ...state, apps };
}
/** Set one field ('trackpad.scroll', 'spacemouse.axes.tx', 'gamepad.buttons.a', 'spacemouse.buttons.3') in the profile of
 *  the scope ('all' or 'app'); the value is cleaned with the rest of the profile, so a bad value falls back. */
export function setIn(state, scope, app, path, value) {
  let s = scope === 'app' ? ownCopy(state, app) : state;
  const p = copy(scope === 'app' ? s.apps[app] : s.all);
  const keys = String(path).split('.');
  let at = p;
  for (const k of keys.slice(0, -1)) { if (!isObj(at[k]) && !Array.isArray(at[k])) return state; at = at[k]; }
  const last = keys[keys.length - 1];
  if (Array.isArray(at)) { const i = Number(last); if (!Number.isInteger(i) || i < 0 || i >= MAX_SPACE_BUTTONS) return state; while (at.length < i) at.push('off'); at[i] = value; }
  else at[last] = value;
  const clean = cleanProfile(p);
  return scope === 'app' ? { ...s, apps: { ...s.apps, [app]: clean } } : { ...s, all: clean };
}
export function setProfile(state, scope, app, profile) {
  const clean = cleanProfile(profile);
  return scope === 'app' ? { ...state, apps: { ...state.apps, [app]: clean } } : { ...state, all: clean };
}
export function addBind(state, scope, app, bind) {
  const b = cleanBind(bind); if (!b) return state;
  const p = copy(resolve(scope === 'app' ? ownCopy(state, app) : state, scope === 'app' ? app : ''));
  p.midi.binds = [...p.midi.binds.filter((x) => !(x.type === b.type && x.ch === b.ch && x.n === b.n)), b].slice(-MAX_MIDI_BINDS);
  return setProfile(state, scope, app, p);
}
export function removeBind(state, scope, app, index) {
  const p = copy(scope === 'app' ? (state.apps[app] || state.all) : state.all);
  p.midi.binds.splice(index, 1);
  return setProfile(state, scope, app, p);
}

/** From the 0.6 Pen and touch choices (localStorage cc-pen) the first time: the pen's buttons and the taps keep what they did. */
export function fromPen(pen) {
  const P = isObj(pen) ? pen : {}, s = emptyState();
  const act = (v) => (v === 'undo' ? 'cmd:edit.undo' : v === 'redo' ? 'cmd:edit.redo' : 'app');
  s.all.pen = { side: act(P.side), eraser: act(P.eraser) };
  if (P.taps === false) s.all.touch = { tap2: 'off', tap3: 'off' };
  return s;
}

// ---- files ----
export function exportProfile(p, name = '') {
  return JSON.stringify({ format: FORMAT, version: VERSION, name: String(name || '').slice(0, 80), devices: cleanProfile(p) }, null, 2);
}
/** → { profile, dropped: [path…] } or { error: 'size' | 'json' | 'format' | 'version' }. Untrusted. */
export function importProfile(text) {
  if (typeof text !== 'string' || text.length > MAX_FILE) return { error: 'size' };
  let o; try { o = JSON.parse(text); } catch (e) { return { error: 'json' }; }
  if (!isObj(o) || o.format !== FORMAT) return { error: 'format' };
  if (o.version !== VERSION) return { error: 'version' };
  const raw = isObj(o.devices) ? o.devices : {}, profile = cleanProfile(raw), dropped = [];
  const walk = (a, b, path) => {
    if (isObj(a)) { for (const k of Object.keys(a)) { if (!(k in (b || {}))) dropped.push(path + k); else walk(a[k], b[k], path + k + '.'); } return; }
    if (Array.isArray(a)) { if (a.length !== (b || []).length) dropped.push(path.slice(0, -1)); return; }
    if (a !== b) dropped.push(path.slice(0, -1));
  };
  walk(raw, profile, '');
  return { profile, dropped };
}

// ---- wheel: a mouse wheel, a trackpad's two fingers, a pinch (0.7 D7.56's rule, PadDetector in CadCraft's wheel-pad.js) ----
/** mem: { until } kept by the caller between events. → 'pinch' | 'pad' | 'wheel' | 'tilt' (a mouse wheel tilted sideways). */
export function classifyWheel(e, mem = {}) {
  if (e.ctrlKey && e.deltaMode === 0 && !Number.isInteger(e.deltaY)) { mem.until = (e.timeStamp || 0) + 400; return 'pinch'; }
  if (e.ctrlKey) return mem.until > (e.timeStamp || 0) ? 'pinch' : 'wheel';   // Ctrl + a wheel step zooms as a wheel
  if (e.deltaMode !== 0) return e.deltaY === 0 && e.deltaX !== 0 ? 'tilt' : 'wheel';
  const dx = e.deltaX || 0, dy = e.deltaY || 0, t = e.timeStamp || 0;
  const legacy = Number.isFinite(e.wheelDeltaY) && e.wheelDeltaY !== 0 && e.wheelDeltaY % 120 === 0;
  const step = dx === 0 && (legacy || (Number.isInteger(dy) && Math.abs(dy) >= 50));
  if (step) return mem.until > t ? 'pad' : 'wheel';
  if (dy === 0 && Number.isInteger(dx) && Math.abs(dx) >= 50 && !(mem.until > t)) return 'tilt';
  mem.until = t + 400;
  return 'pad';
}
/** The wheel's movement in CSS pixels. */
export function wheelPixels(e) {
  const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
  return { dx: (e.deltaX || 0) * k, dy: (e.deltaY || 0) * k };
}

// ---- 3D mouse (6 axes over HID) ----
/** 3Dconnexion and the older Logitech-made ones; any multi-axis controller (generic desktop page, usage 8). */
export const HID_FILTERS = [{ vendorId: 0x256f }, { vendorId: 0x046d, usagePage: 0x01, usage: 0x08 }, { usagePage: 0x01, usage: 0x08 }];
export const SPACE_FULL = 350;   // the axes' usual full deflection
/** One input report into st { t: [x, y, z], r: [x, y, z], buttons: bitmask }. Report 1 = translation (12 bytes on newer
 *  devices: rotation too), 2 = rotation, 3 = buttons. → true when it was understood. */
export function parseSpaceReport(reportId, view, st) {
  const n = view.byteLength, i16 = (o) => (o + 1 < n ? view.getInt16(o, true) : 0);
  if (reportId === 1) {
    st.t = [i16(0), i16(2), i16(4)];
    if (n >= 12) st.r = [i16(6), i16(8), i16(10)];
    return true;
  }
  if (reportId === 2) { st.r = [i16(0), i16(2), i16(4)]; return true; }
  if (reportId === 3) { let b = 0; for (let i = 0; i < Math.min(n, 4); i++) b |= view.getUint8(i) << (8 * i); st.buttons = b >>> 0; return true; }
  return false;
}
/** The six axes as -1…1 after the dead zone, the person's inverts and "strongest axis only". */
export function spaceAxes(st, sm) {
  const raw = { tx: st.t[0], ty: st.t[1], tz: st.t[2], rx: st.r[0], ry: st.r[1], rz: st.r[2] }, out = {};
  let top = null;
  for (const k of SPACE_AXES) {
    let v = Math.max(-1, Math.min(1, (raw[k] || 0) / SPACE_FULL));
    v = Math.abs(v) <= sm.dead ? 0 : Math.sign(v) * (Math.abs(v) - sm.dead) / (1 - sm.dead);
    if (sm.invert[k]) v = -v;
    out[k] = v;
    if (v && (!top || Math.abs(v) > Math.abs(out[top]))) top = k;
  }
  if (sm.dominant) for (const k of SPACE_AXES) if (k !== top) out[k] = 0;
  return out;
}
/** Sum axis values into view moves for one frame: { pan: [x, y], zoom: f, orbit: [x, y] } (dt in seconds). */
export function axesToView(pairs, speed, dt) {
  const m = { pan: [0, 0], zoom: 1, orbit: [0, 0] };
  for (const [action, v] of pairs) {
    if (!v || action === 'off') continue;
    if (action === 'pan-x') m.pan[0] += v * 900 * speed * dt;
    else if (action === 'pan-y') m.pan[1] += v * 900 * speed * dt;
    else if (action === 'orbit-x') m.orbit[0] += v * 600 * speed * dt;
    else if (action === 'orbit-y') m.orbit[1] += v * 600 * speed * dt;
    else if (action === 'zoom') m.zoom *= Math.exp(v * 1.6 * speed * dt);
  }
  return m;
}
export const deadZone = (v, d) => (Math.abs(v) <= d ? 0 : Math.sign(v) * (Math.abs(v) - d) / (1 - d));
/** Which buttons went down since the last bitmask. */
export function pressed(prev, now) { const out = []; for (let i = 0; i < 32; i++) if ((now & (1 << i)) && !(prev & (1 << i))) out.push(i); return out; }

// ---- MIDI ----
/** [status, data1, data2] → { type: 'note' | 'cc', ch, n, v } (a note on with velocity 0 = a note off, left out) or null. */
export function midiMessage(bytes) {
  if (!bytes || bytes.length < 3) return null;
  const kind = bytes[0] & 0xf0, ch = bytes[0] & 0x0f;
  if (kind === 0x90 && bytes[2] > 0) return { type: 'note', ch, n: bytes[1], v: bytes[2] };
  if (kind === 0xb0) return { type: 'cc', ch, n: bytes[1], v: bytes[2] };
  return null;
}
export const findBind = (binds, msg) => binds.find((b) => b.type === msg.type && b.ch === msg.ch && b.n === msg.n) || null;
/** A knob's change as -1…1 of a turn: absolute (0–127, from the last value) or, for endless encoders that send 1–63 up and
 *  65–127 down around 64, relative. last = the previous value or undefined. */
export function knobDelta(v, last) {
  if (last === undefined) return 0;
  const d = v - last;
  return Math.max(-1, Math.min(1, d / 64));
}
