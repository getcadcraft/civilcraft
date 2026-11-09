/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-follow.js — follow someone's view, and the people list with what each person is doing (0.9 ED.1 / ED.2; owner
 * 2026-11-03: "allow students to follow the teacher or allow instructor to look at student progress"). For every app.
 * Canonical copy here; each app's dev/ carries a byte-identical copy (node tools/shell/sync.mjs). live-presence.js mounts it
 * for the apps that use the shared presence layer; CadCraft and MarkupCraft mount it from their own live UI.
 *
 *   attachFollow(client, view, { t }) → detach()      (detach.api = the same object as globalThis.ccLiveFollow)
 *
 * What each window adds to its presence (merged into whatever else it sends, never replacing it):
 *   vw  where it is looking: { k: '2d', c: [x, y], u: model units per CSS px, w, h }  (from toModel, or the app's snap())
 *                         or { k: '3d', e: eye, t: target, up?, f?: fov, o?: 1 = parallel, z?: parallel height }
 *   ld  1 while the host asks everyone to follow them ("Follow me"); only a host's ld counts.
 * Nothing new on the wire beyond presence, which the server keeps newest-only; nothing is saved in the file.
 *
 * `view` is the app's presence view (live-presence.js) plus, all optional:
 *   snap()        this window's view as a vw body (3D apps: their camera); without it a 2D view is read with toModel
 *   apply(vw)     move this window's view to someone's vw (3D apps' cameras; a 2D app may set its centre and zoom itself,
 *                 showing all of the leader's view: fitUnits); without it a 2D view is moved with pan/zoom below
 *   pan(dx, dy), zoom(f, x, y)   the 2D view's own moves; else the view's entry in window.ccViews (Track ID) is used
 *   goSpace(key)  open someone's sheet / storey / space; without it the follower is told where they are instead
 * Following stops by itself when the follower moves their own view (pan, zoom, orbit by any means): this window only ever
 * moves its view to the leader's, so a view that moved while the leader's did not was moved by the person.
 *
 * The people list (ED.2): everyone in the session with their colour, name, what they are running, the sheet they are on,
 * how many edits this window saw from them and when the last one was (LiveClient.personEdits), and Follow. The host also
 * gets "Ask everyone to follow me". Names come from other people and reach the page as text only.
 */

import { attachClassroom } from './live-classroom.js';   // 0.9 ED.3: the class room (one line; the module does nothing until a teacher starts one)

export const VIEW_EVERY = 120;        // ms between samples of this window's view
export const LIST_EVERY = 1000;       // ms between refreshes of an open people list
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const vec = (a, n) => (Array.isArray(a) && a.length === n && a.every(fin) ? a.map(r6) : null);
const pos = (v) => (fin(v) && v > 0 ? r6(v) : null);

/** A view body, checked (ours before it goes out, someone else's as it came in): a clean copy or null. */
export function viewBody(v) {
  if (!v || typeof v !== 'object') return null;
  if (v.k === '2d') {
    const c = vec(v.c, 2), u = pos(v.u), w = pos(v.w), h = pos(v.h);
    return c && u && w && h ? { k: '2d', c, u, w, h } : null;
  }
  if (v.k === '3d') {
    const e = vec(v.e, 3), t = vec(v.t, 3);
    if (!e || !t || (e[0] === t[0] && e[1] === t[1] && e[2] === t[2])) return null;
    const out = { k: '3d', e, t };
    const up = vec(v.up, 3); if (up) out.up = up;
    const f = pos(v.f); if (f && f < 180) out.f = f;
    if (v.o) out.o = 1;
    const z = pos(v.z); if (z) out.z = z;
    return out;
  }
  return null;
}

/** Model units per CSS px that show all of someone's 2D view in a w × h window (a smaller window zooms out). */
export function fitUnits(their, w, h) {
  if (!their || !(w > 0) || !(h > 0)) return null;
  return their.u * Math.max(their.w / w, their.h / h);
}

/** Two 2D views the same, to within `px` pixels of centre and 1 % of scale. */
export function same2d(a, b, px = 1.5) {
  if (!a || !b) return false;
  const u = Math.max(a.u, b.u);
  return Math.abs(a.c[0] - b.c[0]) <= u * px && Math.abs(a.c[1] - b.c[1]) <= u * px && Math.abs(Math.log(a.u / b.u)) <= 0.01;
}

/** Two 3D views the same: eye and target within 0.5 % of the viewing distance, same projection. */
export function same3d(a, b) {
  if (!a || !b) return false;
  const d = Math.hypot(a.e[0] - a.t[0], a.e[1] - a.t[1], a.e[2] - a.t[2]) || 1, tol = d * 0.005;
  const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) <= tol;
  return near(a.e, b.e) && near(a.t, b.t) && !!a.o === !!b.o && (!a.z || !b.z || Math.abs(Math.log(a.z / b.z)) <= 0.01);
}

/** "Edited …" for a time `ms` ago: [key, vars]. */
export function agoKey(ms) {
  if (!fin(ms) || ms < 60000) return ['live.class.edited_now', {}];
  if (ms < 3600000) return ['live.class.edited_min', { n: Math.floor(ms / 60000) }];
  return ['live.class.edited_h', { n: Math.floor(ms / 3600000) }];
}

/**
 * snap() / apply() for a three.js camera with OrbitControls-like `controls` (target, update()). `scale`: three units per
 * model unit (DetailCraft draws mm at 0.001). `render()` asks the app to draw again.
 */
export function threeFollow({ camera, controls, scale = 1, render = null }) {
  const s = scale || 1;
  return {
    snap() {
      const c = camera(), k = controls();
      if (!c || !c.position || !k || !k.target) return null;
      const o = !!c.isOrthographicCamera;
      const out = { k: '3d', e: [c.position.x / s, c.position.y / s, c.position.z / s], t: [k.target.x / s, k.target.y / s, k.target.z / s] };
      if (c.up) out.up = [c.up.x, c.up.y, c.up.z];
      if (o) { out.o = 1; out.z = c.zoom || 1; } else if (fin(c.fov)) out.f = c.fov;
      return out;
    },
    apply(v) {
      const c = camera(), k = controls();
      if (!c || !c.position || !k || !k.target || !v || v.k !== '3d') return false;
      c.position.set(v.e[0] * s, v.e[1] * s, v.e[2] * s);
      k.target.set(v.t[0] * s, v.t[1] * s, v.t[2] * s);
      if (v.up && c.up) c.up.set(v.up[0], v.up[1], v.up[2]);
      if (c.isOrthographicCamera && v.o && v.z) c.zoom = v.z;
      else if (c.isPerspectiveCamera && !v.o && v.f) c.fov = v.f;
      if (c.updateProjectionMatrix) c.updateProjectionMatrix();
      if (k.update) k.update();
      if (k.dispatchEvent) { try { k.dispatchEvent({ type: 'change' }); } catch { /* not an event target */ } }
      if (render) { try { render(); } catch { /* the view is gone */ } }
      return true;
    },
  };
}

// ---- in the page -----------------------------------------------------------------------------------------------------

export function attachFollow(client, view, opts = {}) {
  if (!client || !view || typeof document === 'undefined') return () => {};
  const tr = typeof opts.t === 'function' ? opts.t : (k) => k;
  const t = (k, v = {}) => { try { return String(tr(k, v)); } catch { return k; } };
  const call = (f, ...a) => { try { return f ? f(...a) : undefined; } catch { return undefined; } };
  const offs = [];
  offs.push(attachClassroom(client, view, { t: opts.t }));
  const clean = (s, max = 40) => { s = String(s ?? '').replace(/[\u0000-\u001f\u007f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max - 1) + '…' : s; };
  const nameOf = (c) => { const p = client.peers && client.peers.get(c); return clean(p && p.name, 24) || t('live.someone'); };
  const gone = (p) => !p || p.state === 'gone' || p.state === 'removed' || p.state === 'left';
  const colourOf = typeof opts.colour === 'function' ? opts.colour : () => '#1f6fd1';
  const el = () => { try { return view.el || null; } catch { return null; } };
  const box = () => { const e = el(); if (!e) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; };

  // ---- this window's view ------------------------------------------------------------------------------------------
  const ccView = () => {
    const e = el(), list = (typeof window !== 'undefined' && window.ccViews) || [];
    if (!e) return null;
    return list.find((x) => x && x.el === e) || list.find((x) => x && x.el && (x.el.contains(e) || e.contains(x.el))) || null;
  };
  function mine() {
    if (call(view.hidden)) return null;
    if (view.snap) return viewBody(call(view.snap));
    const r = box(); if (!r) return null;
    const w = r.width, h = r.height;
    const a = call(view.toModel, w / 2, h / 2, w, h), b = call(view.toModel, w / 2 + 10, h / 2, w, h);
    if (!a || !b || a.length !== 2 || b.length !== 2) return null;
    const u = Math.hypot(b[0] - a[0], b[1] - a[1]) / 10;
    return viewBody({ k: '2d', c: a, u, w, h });
  }
  const pan = (dx, dy) => { if (view.pan) return view.pan(dx, dy); const v = ccView(); if (v && v.pan) v.pan(dx, dy); };
  const zoom = (f, x, y) => { if (view.zoom) return view.zoom(f, x, y); const v = ccView(); if (v && v.zoom) v.zoom(f, x, y); };
  /** One step toward someone's 2D view: zoom about the centre to their scale, then pan their centre to ours. */
  function step2d(their) {
    const r = box(); if (!r) return;
    const w = r.width, h = r.height, now = mine();
    if (!now || now.k !== '2d') return;
    const want = fitUnits(their, w, h);
    if (want && Math.abs(Math.log(now.u / want)) > 0.002) zoom(now.u / want, w / 2, h / 2);
    const s = call(view.toScreen, their.c, w, h);
    if (s && fin(s[0]) && fin(s[1]) && (Math.abs(w / 2 - s[0]) > 0.5 || Math.abs(h / 2 - s[1]) > 0.5)) pan(w / 2 - s[0], h / 2 - s[1]);
  }

  // ---- what this window sends ------------------------------------------------------------------------------------------
  let lead = false, sent = '';
  function send() {
    const vw = mine(), ld = lead && isHost() ? 1 : 0;
    const k = JSON.stringify([vw, ld]);
    if (k === sent) return;
    sent = k;
    try { client.setPresence({ ...(client.lastPresence || {}), vw, ld }); } catch { /* the session ended */ }
  }

  // ---- following ------------------------------------------------------------------------------------------------------------
  const isHost = () => client.role === 'host';
  let following = 0, byLead = false, leadSeen = 0, target = '', expect = null, tries = 0, wentTo = '', note = null;
  const raw = (c) => { const m = client.presence; const p = m && m.get ? m.get(c) : null; return p && typeof p === 'object' ? p : null; };
  const leaderNow = () => {
    for (const [c, p] of client.peers || []) {
      if (c === client.c || gone(p) || p.role !== 'host') continue;
      const q = raw(c); if (q && q.ld === 1) return c;
    }
    return 0;
  };
  function follow(c, viaLead = false) {
    following = c || 0; byLead = !!(c && viaLead); target = ''; expect = null; tries = 0; wentTo = ''; note = null;
    if (c) { lead = false; }   // a follower is not leading
    render();
  }
  function stop() { follow(0); }
  function track() {
    const leader = leaderNow();
    if (leader && leader !== leadSeen) { leadSeen = leader; if (following !== leader) follow(leader, true); }
    if (!leader) { if (byLead && following) stop(); leadSeen = 0; }
    if (!following) return;
    const p = client.peers && client.peers.get(following);
    if (!p || gone(p)) { stop(); return; }
    const q = raw(following) || {}, their = viewBody(q.vw);
    const here = String(call(view.space) || ''), sp = typeof q.sp === 'string' ? q.sp : '';
    if (sp !== here) {
      if (view.goSpace && wentTo !== sp) { wentTo = sp; call(view.goSpace, sp); target = ''; expect = null; return; }
      note = { key: 'live.follow.elsewhere', vars: { name: nameOf(following), where: clean(call(view.spaceName, sp) || sp) } };
      return;
    }
    wentTo = '';
    if (!their) { note = null; return; }
    const now = mine();
    if (!now || now.k !== their.k) { note = { key: 'live.follow.cant', vars: { name: nameOf(following) } }; return; }
    note = null;
    const tk = JSON.stringify(their);
    const settled = their.k === '2d' ? same2d(now, { ...their, u: fitUnits(their, now.w, now.h) || their.u }) : same3d(now, their);
    if (tk !== target) {                      // the leader moved: go there
      target = tk; tries = 0; expect = null;
    } else if (expect && !(their.k === '2d' ? same2d(now, expect, 3) : same3d(now, expect))) {
      stop(); note = null; return;            // our view moved and theirs did not: the person moved it
    }
    if (!settled && tries < 6) {
      tries++;
      if (view.apply) call(view.apply, their);          // the app moves its own view (a camera, or a 2D view's centre and zoom)
      else if (their.k === '2d') step2d(their);
      else { note = { key: 'live.follow.cant', vars: { name: nameOf(following) } }; return; }
    }
    expect = mine();
  }
  const timer = setInterval(() => { send(); track(); }, VIEW_EVERY);
  offs.push(() => clearInterval(timer));

  // ---- the chip and the people list ----------------------------------------------------------------------------------
  const ui = document.createElement('div');
  ui.className = 'cc-live-people';
  ui.dataset.liveFollow = '';
  Object.assign(ui.style, { position: 'absolute', left: '0', top: '0', zIndex: '6', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px',
    font: '600 12px system-ui, sans-serif', pointerEvents: 'none', maxWidth: '22rem' });
  const btnStyle = { pointerEvents: 'auto', font: 'inherit', cursor: 'pointer', border: '1px solid rgba(23,32,43,.35)', borderRadius: '3px', padding: '4px 8px',
    background: 'var(--ws-panel-bg, #ffffff)', color: 'var(--ws-ink, #17202b)', lineHeight: '1.2' };
  const mk = (tag, style, text) => { const n = document.createElement(tag); if (style) Object.assign(n.style, style); if (text !== undefined) n.textContent = text; return n; };
  const toggle = mk('button', btnStyle); toggle.type = 'button'; toggle.setAttribute('aria-expanded', 'false');
  const chip = mk('div', { pointerEvents: 'auto', display: 'none', alignItems: 'center', gap: '8px', padding: '4px 6px 4px 10px', borderRadius: '3px', color: '#fff', background: '#1f6fd1' });
  const chipText = mk('span'); const chipBtn = mk('button', { ...btnStyle, padding: '2px 8px' }); chipBtn.type = 'button';
  chip.append(chipText, chipBtn);
  const panel = mk('div', { pointerEvents: 'auto', display: 'none', minWidth: '16rem', maxHeight: '60vh', overflowY: 'auto', padding: '8px', borderRadius: '3px',
    background: 'var(--ws-panel-bg, #ffffff)', color: 'var(--ws-ink, #17202b)', border: '1px solid rgba(23,32,43,.35)', boxShadow: '0 4px 16px rgba(0,0,0,.18)', font: '400 12px system-ui, sans-serif' });
  panel.setAttribute('role', 'region');
  ui.append(toggle, chip, panel);
  let open = false;
  toggle.addEventListener('click', () => { open = !open; render(); });
  chipBtn.addEventListener('click', () => { if (following) { const c = following; stop(); if (byLead || c === leaderNow()) leadSeen = c; } else { const l = leaderNow(); if (l) follow(l, true); } });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { open = false; render(); toggle.focus(); } });

  let mounted = null;
  function place() {
    const e = el(), host = e && (e.parentElement || e);
    if (!host) { if (ui.isConnected) ui.remove(); mounted = null; return; }
    if (mounted !== host) { host.append(ui); mounted = host; }
    const r = e.getBoundingClientRect(), pr = (ui.offsetParent || host).getBoundingClientRect();
    ui.style.left = (r.left - pr.left + 8) + 'px'; ui.style.top = (r.top - pr.top + 8) + 'px';
  }
  function people() {
    const out = [];
    for (const [c, p] of client.peers || []) if (!gone(p)) out.push({ c, p });
    if (client.c && !out.some((x) => x.c === client.c)) out.unshift({ c: client.c, p: { c: client.c, role: client.role, name: (client.o && client.o.name) || '' } });
    out.sort((a, b) => (a.c === client.c ? -1 : b.c === client.c ? 1 : (a.p.role === 'host' ? -1 : b.p.role === 'host' ? 1 : a.c - b.c)));
    return out;
  }
  function row({ c, p }) {
    const me = c === client.c, q = raw(c) || {};
    const li = mk('li', { display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: '2px 8px', alignItems: 'center', padding: '6px 2px', borderTop: '1px solid rgba(23,32,43,.15)' });
    li.dataset.c = String(c);
    const dot = mk('span', { width: '10px', height: '10px', borderRadius: '50%', background: colourOf(c) });
    const who = mk('span', { fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, me ? t('live.class.you') : nameOf(c));
    if (p.role === 'host') who.append(mk('span', { fontWeight: '400', opacity: '.75' }, ' · ' + t('live.class.host')));
    let act = null;
    if (!me) {
      act = mk('button', { ...btnStyle, padding: '2px 8px' }, following === c ? t('live.class.stop') : t('live.class.follow'));
      act.type = 'button';
      act.addEventListener('click', () => { if (following === c) stop(); else follow(c); });
    }
    li.append(dot, who, act || mk('span'));
    const bits = [];
    const cmd = typeof q.cmd === 'string' ? clean(q.cmd, 32) : '';
    if (cmd) bits.push(t('live.class.running', { cmd }));
    const sp = typeof q.sp === 'string' ? q.sp : '';
    if (sp) { const where = clean(call(view.spaceName, sp) || sp); if (where) bits.push(t('live.class.on', { where })); }
    const ed = typeof client.personEdits === 'function' ? client.personEdits(c) : null;
    if (ed && ed.n) {
      const clock = (client.o && client.o.clock) || Date.now;
      if (ed.at) { const [k, v] = agoKey(clock() - ed.at); bits.push(t(k, v)); }
      bits.push(t('live.class.edits', { n: ed.n }));
    } else bits.push(t('live.class.no_edits'));
    const line = mk('span', { gridColumn: '2 / 4', opacity: '.8' }, bits.join(' · '));
    li.append(line);
    return li;
  }
  function render() {
    place();
    if (!mounted) return;
    const list = people();
    toggle.textContent = t('live.class.button', { n: list.length });
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // the chip: following someone, where they are, or a host asking everyone to follow
    const leader = leaderNow();
    let text = '', btn = '', colour = '#1f6fd1';
    if (following) { text = note ? t(note.key, note.vars) : t('live.follow.following', { name: nameOf(following) }); btn = t('live.follow.stop'); colour = colourOf(following); }
    else if (leader) { text = t('live.follow.asks', { name: nameOf(leader) }); btn = t('live.follow.rejoin'); colour = colourOf(leader); }
    chip.style.display = text ? 'flex' : 'none';
    chip.style.background = colour;
    chipText.textContent = text; chipBtn.textContent = btn;
    // the list
    panel.style.display = open ? 'block' : 'none';
    if (!open) return;
    panel.replaceChildren();
    panel.setAttribute('aria-label', t('live.class.title'));
    const head = mk('div', { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' });
    head.append(mk('strong', null, t('live.class.title')));
    const close = mk('button', { ...btnStyle, padding: '2px 8px' }, t('live.class.close')); close.type = 'button';
    close.addEventListener('click', () => { open = false; render(); toggle.focus(); });
    head.append(close);
    panel.append(head);
    if (isHost()) {
      const b = mk('button', { ...btnStyle, display: 'block', width: '100%', margin: '4px 0 6px', textAlign: 'left' }, lead ? t('live.class.lead_off') : t('live.class.lead_on'));
      b.type = 'button'; b.setAttribute('aria-pressed', lead ? 'true' : 'false');
      b.addEventListener('click', () => { lead = !lead; if (lead) following = 0; send(); render(); });
      panel.append(b);
    }
    const ul = mk('ul', { listStyle: 'none', margin: '0', padding: '0' });
    for (const x of list) ul.append(row(x));
    panel.append(ul);
  }
  const listTimer = setInterval(render, LIST_EVERY);
  offs.push(() => clearInterval(listTimer), () => ui.remove());
  if (typeof client.on === 'function') {
    for (const ev of ['peer', 'applied', 'welcome']) { const off = client.on(ev, () => render()); if (typeof off === 'function') offs.push(off); }
  }
  render();

  const api = {
    follow: (c) => follow(Number(c) || 0),
    stop,
    lead(on) { lead = !!on; if (lead) following = 0; send(); render(); },
    get following() { return following; },
    get leading() { return lead; },
    get note() { return note; },
    open(on = true) { open = !!on; render(); },
    mine,
    tick() { send(); track(); render(); },
    get ui() { return ui; },
    get el() { return el(); },
    view,
    client,
    detach() { for (const f of offs.reverse()) { try { f(); } catch { /* already gone */ } } offs.length = 0; },
  };
  const detach = () => { api.detach(); if (globalThis.ccLiveFollow === api) globalThis.ccLiveFollow = null; };
  detach.api = api;
  globalThis.ccLiveFollow = api;
  return detach;
}
