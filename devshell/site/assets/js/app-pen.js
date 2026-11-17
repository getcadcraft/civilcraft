/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — event names, setting values and geometry; the words are shell.dev.pen.* in assets/lang/shell. */
/**
 * app-pen.js — the pen, once, for every app (0.10 SU.1807, session pen-10; the ask is /suggest #1807: an iPad with an Apple Pencil,
 * pen-first CAD and BIM). One module: the pure part (exported, DOM-free, Node tests import it as is) and the page part, which
 * app-devices-ui.js loads (a dynamic import) ONLY when the page carries <script type="application/json" id="cc-pen">{"on":true}</script>.
 * The tag is printed by app-shell.inc only when the .env switch PEN_SHARED=1 (rule 62: off until the owner turns it on), so with the
 * switch off nothing in this file runs and nothing a person sees changes.
 *
 * What it does, and what the browser makes possible (found out, not assumed):
 *   - pen vs touch, palm rejection: while a pen is near (hovering, 0.6 s after leaving) or down, a touch on a drawing view is dropped,
 *     and so is a palm-sized contact (over 40 px). app-phone.js § Pen and touch already does this on pages that carry it
 *     (data-shell-ui, window.ccShellPen); this module takes it over only where that is absent, so no touch is handled twice.
 *   - hover preview: pointermove of a pen with no button down is "hover" (Apple Pencil from the M2 iPad Pro / Pencil Pro hover on
 *     iPadOS 16.1+; Wacom / Surface / Android pens hover in Chromium). A ring follows it (`.cc-pen-ring`, a setting), `html.cc-pen-hover`
 *     is set, and window gets 'cc-pen-hover' {x, y, tiltX, tiltY, altitude, azimuth, height?} for an app's own preview.
 *   - pressure and tilt to sketch tools: 'cc-pen-stroke' {phase: 'down' | 'move' | 'up', samples: [{x, y, pressure, width, tilt,
 *     altitude, azimuth, t}]} on window, coalesced samples included (getCoalescedEvents), and window.ccPen.widthFor(pressure, opts).
 *     Sketch tools (ModelCraft sketch, CadCraft freehand, MarkupCraft pen) take their line width and shading from it.
 *   - the Pencil's double-tap and squeeze: NO web API exposes them. Apple's UIPencilInteraction / the Pencil Pro squeeze are native
 *     (UIKit) and reach neither Safari nor a WKWebView, so a plain browser on an iPad cannot see them; the Studio for iPad shell
 *     (IPAD, a 1.0 row) can forward them: it dispatches window 'cc-pencil' {detail: {kind: 'double-tap' | 'squeeze'}}, which this
 *     module maps through the person's setting (Settings › Global › Input devices › Pen: Double-tap, Squeeze). Pens that do show their
 *     buttons in the browser (Windows / Android / Wacom) get a double-press of the barrel button read as 'double-tap'. Until the native
 *     bridge exists the two settings work only through that and through window.ccPen.pencil(kind) (tests).
 *   - gestures behind a setting (pen.gestures, off): scribble out (a zig-zag) and circle (a closed loop), found when the stroke ends,
 *     dispatched as a cancelable 'cc-pen-gesture' {kind, bbox, points, center}; an app that handles it calls preventDefault (it knows
 *     what lies under the stroke); if nobody does, the command the person mapped to it (pen.scribble, pen.circle: any command, 'off'
 *     by default) runs. A gesture is not recognised while a barrel button or the eraser end is down.
 *
 * Words: shell.dev.pen.* (hover, double, squeeze, gestures, scribble, circle, hint). Settings live in the device profile
 * (app-devices.js: pen.double / squeeze / hover / gestures / scribble / circle), every app or one app.
 */

export const PALM_MS = 600;
export const PALM_PX = 40;
export const DOUBLE_MS = 350;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** Tilt (degrees, the Pointer Events tiltX / tiltY, each -90…90) → { altitude (rad, π/2 = upright), azimuth (rad), tilt 0…1 (0 upright, 1 flat) }. */
export function tiltAngles(tiltX, tiltY) {
  const tx = Math.tan(clamp(num(tiltX), -89.9, 89.9) * Math.PI / 180), ty = Math.tan(clamp(num(tiltY), -89.9, 89.9) * Math.PI / 180);
  const m = Math.hypot(tx, ty);
  const altitude = m === 0 ? Math.PI / 2 : Math.PI / 2 - Math.atan(m);
  const azimuth = m === 0 ? 0 : Math.atan2(ty, tx);
  return { altitude, azimuth, tilt: clamp((Math.PI / 2 - altitude) / (Math.PI / 2), 0, 1) };
}

/** A line width factor 0…1 from pressure: min + (1 - min) * pressure^gamma (gamma < 1 = a lighter touch draws thicker). A mouse (0.5 for
 *  every press, or 0 hovering) is the caller's to pass as pressure 0.5. */
export function widthFor(pressure, opts = {}) {
  const min = clamp(num(opts.min, 0.15), 0, 1), gamma = clamp(num(opts.gamma, 1), 0.2, 4);
  return min + (1 - min) * Math.pow(clamp(num(pressure), 0, 1), gamma);
}

/** One pointer event → a plain sample (a copy, safe to keep). */
export function sampleOf(e, opts = {}) {
  const a = tiltAngles(e.tiltX, e.tiltY);
  const pressure = clamp(num(e.pressure), 0, 1);
  return { x: num(e.clientX), y: num(e.clientY), pressure, width: widthFor(pressure, opts), tilt: a.tilt, altitude: a.altitude, azimuth: a.azimuth,
    twist: num(e.twist), t: num(e.timeStamp) };
}

/** The pen near, and which touches to drop. mem is kept by the caller: { penDown, penAt, dropped: Set }. now = a clock in ms. */
export class PalmGate {
  constructor(opts = {}) { this.ms = opts.ms ?? PALM_MS; this.px = opts.px ?? PALM_PX; this.penDown = false; this.penAt = -1e9; this.dropped = new Set(); }
  pen(type, now) {   // 'down' | 'move' | 'up' | 'leave' of a pen
    if (type === 'down') this.penDown = true; else if (type === 'up') this.penDown = false;
    this.penAt = now;
  }
  near(now) { return this.penDown || now - this.penAt < this.ms; }
  /** A touch lands: true = drop it (and every move and lift of it, see follows). */
  touchDown(e, now) {
    if (this.near(now) || num(e.width) > this.px || num(e.height) > this.px) { this.dropped.add(e.pointerId); return true; }
    return false;
  }
  follows(id, last = false) { const has = this.dropped.has(id); if (has && last) this.dropped.delete(id); return has; }
}

/** Direction reversals along one axis, counting only swings of at least `min` px (so jitter is not a stroke). */
function swings(vals, min) {
  let dir = 0, ext = vals[0], n = 0;   // ext = the latest extreme in the current direction
  for (let i = 1; i < vals.length; i++) {
    const v = vals[i];
    if (dir === 0) { if (Math.abs(v - ext) >= min) { dir = v > ext ? 1 : -1; ext = v; } continue; }
    if (dir > 0) { if (v > ext) ext = v; else if (ext - v >= min) { dir = -1; ext = v; n++; } }
    else if (v < ext) ext = v; else if (v - ext >= min) { dir = 1; ext = v; n++; }
  }
  return n;
}

/** A finished stroke (points [{x, y}]) → { kind: 'scribble' | 'circle', bbox: {x, y, w, h}, center: {x, y}, points } or null.
 *  scribble: a zig-zag, at least 4 direction reversals along its longer axis, a path at least 3.5 times its own diagonal, inside 260 px.
 *  circle: a closed loop (ends within a quarter of its size), turning one way through at least 300 degrees, rounder than 2:1, 40 px or more. */
export function classifyStroke(points) {
  if (!Array.isArray(points) || points.length < 8) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, len = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
    if (i) len += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
  }
  const w = x1 - x0, h = y1 - y0, diag = Math.hypot(w, h), big = Math.max(w, h);
  if (diag < 24) return null;
  const bbox = { x: x0, y: y0, w, h }, center = { x: x0 + w / 2, y: y0 + h / 2 };
  if (big <= 260 && len >= 3.5 * diag) {
    const axis = w >= h ? points.map((p) => p.x) : points.map((p) => p.y);
    if (swings(axis, Math.max(8, big * 0.15)) >= 4) return { kind: 'scribble', bbox, center, points };
  }
  if (big >= 40 && Math.min(w, h) / big >= 0.5) {
    const a = points[0], b = points[points.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y) <= 0.25 * diag) {
      let turn = 0, pos = 0, neg = 0;
      for (let i = 2; i < points.length; i++) {
        const ux = points[i - 1].x - points[i - 2].x, uy = points[i - 1].y - points[i - 2].y, vx = points[i].x - points[i - 1].x, vy = points[i].y - points[i - 1].y;
        if (!(ux || uy) || !(vx || vy)) continue;
        const d = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
        turn += d; if (d > 0) pos += d; else neg -= d;
      }
      if (Math.abs(turn) >= 300 * Math.PI / 180 && Math.min(pos, neg) <= 0.25 * Math.max(pos, neg)) return { kind: 'circle', bbox, center, points };
    }
  }
  return null;
}

/** Barrel-button double press → 'double-tap'. mem { at }; call with the time of each barrel press. */
export function barrelDouble(mem, now, ms = DOUBLE_MS) {
  const hit = now - (mem.at ?? -1e9) <= ms;
  mem.at = hit ? -1e9 : now;
  return hit;
}

// ---- the page ----
const tag = typeof document !== 'undefined' ? (() => { try { return JSON.parse(document.getElementById('cc-pen')?.textContent || 'null'); } catch (e) { return null; } })() : null;
if (tag && tag.on === true) boot();

function boot() {
  const root = document.documentElement;
  const prefs = () => (window.ccShellDevices && window.ccShellDevices.prefs ? window.ccShellDevices.prefs().pen : null) || { hover: true, gestures: false, double: 'app', squeeze: 'app', scribble: 'off', circle: 'off' };
  const perform = (a, info) => (window.ccShellDevices && window.ccShellDevices.perform ? window.ccShellDevices.perform(a, info) : false);
  const gate = new PalmGate(), mem = {}, now = () => performance.now();
  const ownPalm = () => !window.ccShellPen;   // app-phone.js already drops palms where it runs
  const onView = (t) => {
    if (!t || t.nodeType !== 1 || t.closest('dialog, input, textarea, select, [contenteditable="true"], .help-panel')) return false;
    const list = window.ccViews && window.ccViews.list ? window.ccViews.list() : [];
    if (list.length) return list.some((v) => v.el && v.el.contains(t));
    return !!t.closest('canvas, svg, [data-stage], main');
  };
  const send = (name, detail, cancelable = false) => { const ev = new CustomEvent(name, { detail, cancelable }); window.dispatchEvent(ev); return ev; };

  // the ring
  let ring = null;
  function ringAt(s, on) {
    if (!on) { if (ring) ring.hidden = true; return; }
    if (!ring) {
      ring = document.createElement('div'); ring.className = 'cc-pen-ring'; ring.setAttribute('aria-hidden', 'true');
      ring.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border:1.5px solid currentColor;border-radius:50%;pointer-events:none;z-index:2147483000;opacity:.7;color:var(--bs-primary,#0d6efd)';
      document.body.append(ring);
    }
    ring.hidden = false;
    const k = 1 + 0.6 * s.tilt;   // a leaning pen draws a wider footprint
    ring.style.transform = 'translate(' + s.x + 'px,' + s.y + 'px) scale(' + k.toFixed(2) + ')';
  }

  let stroke = null, lastSample = null;
  function down(e) {
    gate.pen('down', now());
    if (e.buttons & 0x32 && (e.button === 2 || e.button === 5 || (e.buttons & 2) || (e.buttons & 32))) { if (e.button === 2 && barrelDouble(mem, now())) pencil('double-tap'); }
    stroke = { pts: [], plain: !(e.button === 2 || e.button === 5 || (e.buttons & 2) || (e.buttons & 32)), id: e.pointerId };
    const s = sampleOf(e); lastSample = s; stroke.pts.push(s);
    ringAt(s, false);
    send('cc-pen-stroke', { phase: 'down', samples: [s], pointerId: e.pointerId });
  }
  function move(e) {
    gate.pen('move', now());
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const evs = list.length ? list : [e];
    const samples = evs.map((c) => sampleOf(c)); lastSample = samples[samples.length - 1];
    if (stroke && e.buttons) {   // down
      stroke.pts.push(...samples);
      send('cc-pen-stroke', { phase: 'move', samples, pointerId: e.pointerId });
      return;
    }
    // hover: no button, no contact
    const on = prefs().hover !== false && onView(e.target);
    root.classList.toggle('cc-pen-hover', on);
    ringAt(lastSample, on);
    if (on) send('cc-pen-hover', { ...lastSample, tiltX: num(e.tiltX), tiltY: num(e.tiltY), height: Number.isFinite(e.altitude) ? e.altitude : undefined });
  }
  function up(e) {
    gate.pen('up', now());
    const s = sampleOf(e), st = stroke; stroke = null;
    send('cc-pen-stroke', { phase: 'up', samples: [s], pointerId: e.pointerId });
    if (e.type === 'pointercancel' || !st || !st.plain || !prefs().gestures || !onView(e.target)) return;
    const g = classifyStroke(st.pts);
    if (!g) return;
    const ev = send('cc-pen-gesture', g, true);
    if (ev.defaultPrevented) return;
    const a = prefs()[g.kind];
    if (a && a !== 'off') perform(a, { from: 'pen' });
  }
  function pencil(kind) {
    const a = kind === 'squeeze' ? prefs().squeeze : prefs().double;
    const ev = send('cc-pencil-action', { kind, action: a }, true);
    if (ev.defaultPrevented) return false;
    return a && a !== 'app' ? perform(a, { from: 'pen' }) : false;
  }
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') { root.classList.add('cc-pen'); down(e); return; }
    if (e.pointerType === 'touch' && ownPalm() && onView(e.target) && gate.touchDown(e, now())) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'pen') move(e);
    else if (e.pointerType === 'touch' && ownPalm() && gate.follows(e.pointerId)) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
  }, true);
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, (e) => {
      if (e.pointerType === 'pen') up(e);
      else if (e.pointerType === 'touch' && ownPalm() && gate.follows(e.pointerId, true)) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }
    }, true);
  }
  window.addEventListener('pointerleave', (e) => { if (e.pointerType === 'pen') { gate.pen('leave', now()); root.classList.remove('cc-pen-hover'); ringAt(null, false); } }, true);
  window.addEventListener('cc-pencil', (e) => { const k = e.detail && e.detail.kind; if (k === 'double-tap' || k === 'squeeze') pencil(k); });

  Object.defineProperty(window, 'ccPen', {
    value: { on: true, tiltAngles, widthFor, sampleOf, classifyStroke, near: () => gate.near(now()), down: () => gate.penDown, last: () => lastSample, pencil },
    configurable: true,
  });
  window.dispatchEvent(new CustomEvent('cc-pen-ready'));
}
