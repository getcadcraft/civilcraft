/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-presence.js — who is where in a Studio Live session, for every app (0.9 SU.1112, session live-cursors-09).
 * Spec docs/STUDIO-LIVE-SPEC.md § 4 (adapter: presence() / drawPresence(peers)) and § 5 (`presence` frames).
 *
 * CadCraft's live.js drew the first cursors (LV.9) and MarkupCraft's live-ui.js the second (SU.910); this is the same
 * layer once, for any app: other people's pointers with their names in their colour, the things they have selected as
 * outlines, and a short list of the people who are on another sheet, storey or space. Canonical copy here; each app's
 * dev/ carries a byte-identical copy (node tools/shell/sync.mjs), so a build stays self-contained.
 *
 *   attachPresence(client, adapter, view, opts) → detach()
 *
 * `client` is the app's LiveClient, `adapter` the app's live adapter (its drawPresence is chained, never replaced: the
 * XR design review keeps its heads and hands). `view` is the app's thin side, the only part that knows its coordinates:
 *
 *   el                    the element the view draws in (canvas); the pointer is read over it, the overlay sits on it
 *   space()               '' or the key of the sheet / storey / space on screen (optional)
 *   spaceName(key)        a short name for someone else's space (optional; else the key)
 *   toModel(x, y, w, h)   pointer in el's CSS px → a model point [x, y] or [x, y, z], or null
 *   toScreen(p, w, h)     model point → [x, y] in el's CSS px, or null (behind the camera, not drawable)
 *   selection()           what is selected, as model boxes [x0, y0, x1, y1] or [x0, y0, z0, x1, y1, z1] (optional)
 *   command()             the tool or command running, shown after the name (optional)
 *   selectionLabel()      shown after the name when no command runs: a selection with no place on screen (optional)
 *   hidden()              true while the view is covered (a 3D view over a plan) (optional)
 *
 * What goes out is `{ sp, cur, sel, cmd }` (CadCraft's keys), merged into whatever else the window sends (XR's `xr`),
 * at most about 30 a second and only when it changed; the client keeps only the newest, so a slow link sends less, never
 * a queue. What comes in is drawn eased toward the newest point, so cursors glide instead of jumping on a slow link.
 * Presence never touches the model: not the file, not the undo history, not storage. Names come from other people and
 * reach the canvas as text only, cut to NAME_MAX.
 *
 * The pure helpers (personColour, cleanName, presenceBody, readPresence, capBoxes, pointsBox, boxRect, ease, threeView) need no
 * page; tools/live-apps-test/test-presence.mjs runs them in Node.
 */

/** Colours for people: the site's eight layer colours; each passes 4.5:1 under white text and on the dark model space. */
import { attachFollow } from './live-follow.js';

export const PEOPLE = ['#c8102e', '#1f6fd1', '#d9640a', '#b5179e', '#9a7b00', '#1d8a4b', '#6a3fd6', '#008c9e'];
export const personColour = (c) => { const n = Math.trunc(Number(c) || 1); return PEOPLE[(((n - 1) % PEOPLE.length) + PEOPLE.length) % PEOPLE.length]; };
export const NAME_MAX = 24, SEL_MAX = 16, CMD_MAX = 32, SPACE_MAX = 160;
export const SEND_EVERY = 33, SLOW_EVERY = 250;

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const round = (v) => Math.round(v * 1000) / 1000;
const CONTROL = /[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g;

/** A name, a space key or a command from someone else: one line, no direction overrides, at most `max` characters. */
export function cleanName(s, max = NAME_MAX) {
  s = String(s ?? '').replace(CONTROL, ' ').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

const point = (p) => (Array.isArray(p) && (p.length === 2 || p.length === 3) && p.every(fin) ? p.map(round) : null);
const box = (b) => (Array.isArray(b) && (b.length === 4 || b.length === 6) && b.every(fin) ? b.map(round) : null);

/** Boxes past `max`: the first max - 1 as they are, the rest as one box round them all (same dimension only). */
export function capBoxes(list, max = SEL_MAX) {
  const ok = (Array.isArray(list) ? list : []).map(box).filter(Boolean);
  if (ok.length <= max) return ok;
  const keep = ok.slice(0, max - 1), rest = ok.slice(max - 1), n = rest[0].length / 2;
  const u = rest[0].slice();
  for (const b of rest) {
    if (b.length !== u.length) continue;
    for (let i = 0; i < n; i++) { u[i] = Math.min(u[i], b[i]); u[n + i] = Math.max(u[n + i], b[n + i]); }
  }
  return [...keep, u];
}

/** What this window sends: { sp, cur, sel, cmd }, every field checked and rounded. */
export function presenceBody({ sp = '', cur = null, sel = null, cmd = '' } = {}) {
  const s = Array.isArray(sel) ? capBoxes(sel) : null;
  return { sp: cleanName(sp, SPACE_MAX), cur: point(cur), sel: s && s.length ? s : null, cmd: cleanName(cmd, CMD_MAX) };
}

/** Someone else's presence as it arrived (any shape: it comes over the network) → { sp, cur, sel, cmd } or null. */
export function readPresence(p) {
  if (!p || typeof p !== 'object') return null;
  const sel = Array.isArray(p.sel) ? p.sel.slice(0, SEL_MAX).map(box).filter(Boolean) : [];
  return { sp: typeof p.sp === 'string' ? cleanName(p.sp, SPACE_MAX) : '', cur: point(p.cur), sel, cmd: typeof p.cmd === 'string' ? cleanName(p.cmd, CMD_MAX) : '' };
}

/**
 * The box round every point inside a model object: arrays of `dims` numbers ([x, y] or [x, y, z]) and {x, y(, z)} records,
 * looked for a few levels down (members' start/end, a mark's pts, an alignment's PIs). null when it holds no point.
 */
export function pointsBox(obj, dims = 3, depth = 4) {
  const lo = new Array(dims).fill(Infinity), hi = new Array(dims).fill(-Infinity);
  let n = 0;
  const put = (p) => { for (let i = 0; i < dims; i++) { lo[i] = Math.min(lo[i], p[i]); hi[i] = Math.max(hi[i], p[i]); } n++; };
  const walk = (v, d) => {
    if (n > 5000 || d < 0 || !v || typeof v !== 'object') return;
    if (Array.isArray(v)) {
      if ((v.length === dims || (dims === 2 && v.length === 3)) && v.every(fin)) { put(v); return; }
      for (const x of v) walk(x, d - 1);
      return;
    }
    if (fin(v.x) && fin(v.y) && (dims === 2 || fin(v.z))) { put(dims === 2 ? [v.x, v.y] : [v.x, v.y, v.z]); return; }
    for (const k of Object.keys(v)) walk(v[k], d - 1);
  };
  walk(obj, depth);
  return n ? [...lo, ...hi] : null;
}

/** A model box on screen: the rectangle round its projected corners [x, y, w, h], or null when none is drawable. */
export function boxRect(b, toScreen) {
  const n = b.length / 2, corners = [];
  if (n === 2) corners.push([b[0], b[1]], [b[2], b[1]], [b[0], b[3]], [b[2], b[3]]);
  else for (let i = 0; i < 8; i++) corners.push([i & 1 ? b[3] : b[0], i & 2 ? b[4] : b[1], i & 4 ? b[5] : b[2]]);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, any = false;
  for (const c of corners) {
    const s = toScreen(c);
    if (!s || !fin(s[0]) || !fin(s[1])) continue;
    any = true;
    x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]);
  }
  return any ? [x0, y0, x1 - x0, y1 - y0] : null;
}

/** Ease a shown point toward the newest one: about 63 % of the way every `tau` ms; a jump of a new space snaps. */
export function ease(shown, target, dt, tau = 70) {
  if (!target) return null;
  if (!shown || shown.length !== target.length) return target.slice();
  const k = 1 - Math.exp(-Math.max(0, dt) / tau);
  return shown.map((v, i) => v + (target[i] - v) * k);
}

// ---- three.js cameras, without importing three.js: its matrices are plain column-major arrays -------------------------
const mul4 = (m, v) => [0, 1, 2, 3].map((r) => m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r] * v[3]);

/**
 * toScreen / toModel for a three.js camera. `camera()` returns the camera (perspective or orthographic), `target()` the
 * point the view turns about (three units), `scale` model units per three unit inverse (DetailCraft draws mm at 0.001).
 * toModel: where the pointer's ray meets the surface under it (`hit(x, y)`, optional) or else the plane through the
 * target facing the camera, so a pointer over empty space still has a place at the depth you are looking at.
 */
export function threeView({ camera, target, scale = 1, hit = null }) {
  const cam = () => { const c = camera(); if (c && c.updateMatrixWorld) c.updateMatrixWorld(); return c; };
  return {
    toScreen(p, w, h) {
      const c = cam();
      if (!c || !c.projectionMatrix || !c.matrixWorldInverse) return null;
      const v = mul4(c.matrixWorldInverse.elements, [p[0] * scale, p[1] * scale, (p[2] || 0) * scale, 1]);
      const q = mul4(c.projectionMatrix.elements, v);
      if (q[3] <= 1e-9) return null;
      const z = q[2] / q[3];
      if (z < -1 || z > 1) return null;
      return [(q[0] / q[3] + 1) / 2 * w, (1 - q[1] / q[3]) / 2 * h];
    },
    toModel(x, y, w, h) {
      if (hit) { const p = hit(x, y, w, h); if (p) return p; }
      const c = cam(), t = target && target();
      if (!c || !c.projectionMatrixInverse || !c.matrixWorld || !t) return null;
      const nx = (x / w) * 2 - 1, ny = 1 - (y / h) * 2;
      const at = (z) => { const v = mul4(c.projectionMatrixInverse.elements, [nx, ny, z, 1]); const e = mul4(c.matrixWorld.elements, [v[0] / v[3], v[1] / v[3], v[2] / v[3], 1]); return [e[0], e[1], e[2]]; };
      const a = at(-1), b = at(1), d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const m = c.matrixWorld.elements, f = [-m[8], -m[9], -m[10]];   // the way the camera looks
      const den = f[0] * d[0] + f[1] * d[1] + f[2] * d[2];
      if (Math.abs(den) < 1e-12) return null;
      const k = (f[0] * (t[0] - a[0]) + f[1] * (t[1] - a[1]) + f[2] * (t[2] - a[2])) / den;
      if (!fin(k)) return null;
      return [(a[0] + d[0] * k) / scale, (a[1] + d[1] * k) / scale, (a[2] + d[2] * k) / scale];
    },
  };
}

// ---- in the page -----------------------------------------------------------------------------------------------------

export function attachPresence(client, adapter, view, opts = {}) {
  if (!client || !view || typeof document === 'undefined' || typeof requestAnimationFrame !== 'function') return () => {};
  const t = typeof opts.t === 'function' ? opts.t : (k, v) => (k === 'live.presence.elsewhere' ? `${v.name}: ${v.where}` : 'Someone');
  const offs = [];
  const call = (f, ...a) => { try { return f ? f(...a) : undefined; } catch { return undefined; } };
  const size = () => { if (!el) return { r: null, w: 0, h: 0 }; const r = el.getBoundingClientRect(); return { r, w: r.width, h: r.height }; };

  // ---- the view's element: it may come later (BimCraft's viewer is made with the first model) or be replaced -----------
  let el = null, host = null, canvas = null, ctx = null, unhome = null;
  let ptr = null, moved = false;
  const onMove = (e) => {
    const { r } = size();
    if (!r) return;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    ptr = x >= 0 && y >= 0 && x <= r.width && y <= r.height ? [x, y] : null; moved = true;
  };
  const onLeave = () => { ptr = null; moved = true; };
  function home() {
    let e = null;
    try { e = view.el || null; } catch { e = null; }
    if (e === el) return !!el;
    if (unhome) { unhome(); unhome = null; }
    el = e; ptr = null; moved = true;
    if (!el) return false;
    host = el.parentElement || el;
    host.addEventListener('pointermove', onMove, { passive: true, capture: true });
    host.addEventListener('pointerleave', onLeave, { passive: true });
    canvas = document.createElement('canvas');
    canvas.className = 'cc-live-presence';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.livePresence = '';
    Object.assign(canvas.style, { position: 'absolute', left: '0', top: '0', pointerEvents: 'none', zIndex: '4' });
    host.append(canvas);
    ctx = canvas.getContext('2d');
    const h0 = host, c0 = canvas;
    unhome = () => { h0.removeEventListener('pointermove', onMove, { capture: true }); h0.removeEventListener('pointerleave', onLeave); c0.remove(); canvas = null; ctx = null; };
    wake();
    return true;
  }
  offs.push(() => { if (unhome) unhome(); unhome = null; el = null; });

  // ---- what this window sends --------------------------------------------------------------------------------------------
  let sent = '', cur = null, sel = null, slowAt = 0;
  function tick() {
    home();
    const now = Date.now(), slow = now - slowAt >= SLOW_EVERY;
    if (moved || slow) {
      moved = false;
      if (!ptr) cur = null;
      else { const { w, h } = size(); cur = w && h ? call(view.toModel, ptr[0], ptr[1], w, h) || null : null; }
    }
    if (slow) { slowAt = now; sel = view.selection ? call(view.selection) || null : null; }
    const body = presenceBody({ sp: call(view.space) || '', cur, sel, cmd: call(view.command) || call(view.selectionLabel) || '' });
    const k = JSON.stringify(body);
    if (k === sent) return;
    sent = k;
    try { client.setPresence({ ...(client.lastPresence || {}), ...body }); } catch { /* the session ended */ }
  }
  const timer = setInterval(tick, SEND_EVERY);
  offs.push(() => clearInterval(timer));

  const shown = new Map();   // c → eased cursor point
  const onScreen = new Map(), boxesOn = new Map();   // c → where its arrow / selection boxes were drawn last frame (tests)
  let raf = 0, last = 0, drawn = false;
  const nameOf = (c) => { const p = client.peers && client.peers.get(c); return cleanName(p && p.name) || cleanName(t('live.someone')); };
  const goneState = (p) => !p || p.state === 'gone' || p.state === 'removed' || p.state === 'left';
  function others() {
    const out = [];
    for (const [c, raw] of client.presence || []) {
      if (c === client.c) continue;
      const peer = client.peers && client.peers.get(c);
      if (peer && goneState(peer)) continue;
      const p = readPresence(raw);
      if (p) out.push([c, p]);
    }
    return out;
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    const dt = last ? Math.min(200, now - last) : 16; last = now;
    const list = others();
    if (!canvas) { last = 0; return; }   // no view yet: home() wakes the loop once there is one
    const { r, w, h } = size();
    // the overlay sits exactly over the view, whatever moved it
    const pr = (canvas.offsetParent || host).getBoundingClientRect();
    const dpr = (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1;
    canvas.style.left = (r.left - pr.left) + 'px'; canvas.style.top = (r.top - pr.top) + 'px';
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawn = false; onScreen.clear(); boxesOn.clear();
    if (!w || !h || call(view.hidden)) { if (list.length) raf = requestAnimationFrame(frame); return; }
    const here = cleanName(call(view.space) || '', SPACE_MAX);   // as it went out, so a long sheet key still matches
    const toScreen = (p) => call(view.toScreen, p, w, h) || null;
    const away = [];
    for (const [c, p] of list) {
      const colour = personColour(c), name = nameOf(c);
      if (p.sp !== here) { away.push([c, name, p.sp]); shown.delete(c); continue; }
      // what they have selected: a dashed box in their colour
      if (p.sel.length) {
        ctx.save(); ctx.strokeStyle = colour; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8; ctx.setLineDash([5, 4]);
        for (const b of p.sel) { const q = boxRect(b, toScreen); if (q && q[2] < w * 4 && q[3] < h * 4) { ctx.strokeRect(q[0] - 4, q[1] - 4, q[2] + 8, q[3] + 8); drawn = true; (boxesOn.get(c) || boxesOn.set(c, []).get(c)).push(q); } }
        ctx.restore();
      }
      // their pointer: an arrow with the name (and what they are running) beside it
      const e = ease(shown.get(c), p.cur, dt);
      if (!e) { shown.delete(c); continue; }
      shown.set(c, e);
      const s = toScreen(e);
      if (!s || s[0] < -20 || s[1] < -20 || s[0] > w + 20 || s[1] > h + 20) continue;
      onScreen.set(c, s);
      ctx.fillStyle = colour;
      ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0] + 3, s[1] + 14); ctx.lineTo(s[0] + 6.5, s[1] + 9); ctx.lineTo(s[0] + 12, s[1] + 9); ctx.closePath(); ctx.fill();
      label(s[0] + 12, s[1] + 24, p.cmd ? name + ' \u2014 ' + p.cmd : name, colour, w, h);
      drawn = true;
    }
    // the people on another sheet, storey or space: one line each, top right
    away.slice(0, 6).forEach(([c, name, sp], i) => {
      const where = cleanName(call(view.spaceName, sp) || sp || '');
      const text = where ? t('live.presence.elsewhere', { name, where }) : name;
      ctx.font = '600 12px system-ui, sans-serif';
      label(w - ctx.measureText(text).width - 16, 22 + i * 20, text, personColour(c), w, h, 0.75);
      drawn = true;
    });
    // keep drawing while anyone is on screen (a 3D view moves under the cursors); stop when nobody is
    if (list.length) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  function label(x, y, text, colour, w, h, alpha = 0.92) {
    ctx.font = '600 12px system-ui, sans-serif';
    const tw = ctx.measureText(text).width + 8;
    x = Math.max(2, Math.min(x, w - tw - 2)); y = Math.max(15, Math.min(y, h - 4));
    ctx.fillStyle = colour; ctx.globalAlpha = alpha;
    ctx.fillRect(x, y - 13, tw, 17);
    ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x + 4, y);
  }
  offs.push(() => { if (raf) cancelAnimationFrame(raf); raf = 0; });

  // someone's presence came in, or someone left: draw again (the adapter's own drawPresence still runs: XR's avatars)
  const prev = adapter ? adapter.drawPresence : null;
  if (adapter) {
    adapter.drawPresence = function (peers) { if (prev) { try { prev.call(this, peers); } catch (e) { console.error(e); } } wake(); };   // i18n-ignore
    offs.push(() => { if (adapter.drawPresence && adapter.drawPresence !== prev) adapter.drawPresence = prev; });
  }
  if (typeof client.on === 'function') {
    const off = client.on('peer', (p) => { if (p && goneState(p)) shown.delete(p.c); wake(); });
    if (typeof off === 'function') offs.push(off);
  }
  wake();

  // follow someone's view, and the people list (0.9 ED.1 / ED.2, live-follow.js); an app can opt out with { follow: false }
  if (opts.follow !== false) { const off = attachFollow(client, view, { t: opts.t, colour: personColour }); offs.push(off); }

  const api = {
    detach() { for (const f of offs.reverse()) { try { f(); } catch { /* already gone */ } } offs.length = 0; },
    /** For tests and the console: what the overlay drew last frame, and the people it knows about. */
    get drawn() { return drawn; },
    get canvas() { return canvas; },
    others: () => others().map(([c, p]) => ({ c, name: nameOf(c), colour: personColour(c), ...p })),
    sent: () => (sent ? JSON.parse(sent) : null),
    at: (c) => onScreen.get(c) || null,
    boxes: (c) => boxesOn.get(c) || [],
    get el() { return el; },
    client,
    tick,
  };
  const detach = () => { api.detach(); if (client.presenceLayer === api) client.presenceLayer = null; if (globalThis.ccLivePresence === api) globalThis.ccLivePresence = null; };
  detach.api = api;
  client.presenceLayer = api; globalThis.ccLivePresence = api;
  return detach;
}
