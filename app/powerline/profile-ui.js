/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/profile-ui.js — the line profile (0.7 PL.2): the ground along an overhead line (from the surface), its supports from
 * the ground to the top, the conductor's lowest phase at the chosen load case, the clearance it must keep (dashed), obstacles
 * the spans cross, and the spans that fail drawn in red. Drag a support sideways to move it along the line, or drag its top to
 * set its height above the ground. Built in the page by powerline-ui.js (a panel like CivilCraft's own profile). The Line select
 * picks the overhead line (selecting another line on the plan switches to it too, through powerline-ui.js); the pointer over the
 * profile reads the chainage, ground, conductor and clearance there. Measure (0.7 PL.10): two clicks on the profile give the
 * horizontal distance, the height difference, the straight distance and the slope between them (a click snaps to the ground,
 * the conductor or a support's top within a few pixels).
 *
 *   createProfileUi(ctx, { P, edit, U, analysis(lineId), selectSupport(lineId, i), onLine(lineId),
 *                                                     under(lineId) → [{ kind, name, ch, z }] (underground.js lineUnderground) }) → { panel, show(lineId), hide(), shown(), redraw(), lineId, readAt(ch), measureBetween(a, b),
 *                                                                                         screenOf(i, 'top'|'foot') → page point (tests) }
 */

import { conductorCurve } from './checks.js';
import { between } from '../measure.js';
import { unitM } from './units.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

export function createProfileUi(ctx, { P, edit, U, analysis, selectSupport, onLine, under }) {
  const { el, root } = ctx;
  let lineId = null, caseId = null, drag = null, hover = -1, cursor = null;   // cursor = the pointer's chainage, or null
  let measOn = false, mA = null, mB = null, mLive = null, last = null;   // Measure: its two points { ch, z }; last = { g, res } of the latest draw
  const caseSel = el('select', { className: 'cv-select', id: 'cv-pl-prof-case', 'data-pl-prof-case': '', 'aria-label': t('pl.prof.case') });
  caseSel.addEventListener('change', () => { caseId = caseSel.value; redraw(); });
  const lineSel = el('select', { className: 'cv-select', id: 'cv-pl-prof-line', 'data-pl-prof-line': '', 'aria-label': t('pl.prof.line') });
  lineSel.addEventListener('change', () => { if (lineSel.value) { show(lineSel.value); onLine?.(lineSel.value); } });
  const at = el('span', { className: 'cv-pl-prof-at', 'data-pl-prof-at': '' });
  const measBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-prof-measure': '', 'aria-pressed': 'false', title: t('pl.prof.meas.title') },
    el('i', { className: 'bi bi-rulers', 'aria-hidden': 'true' }), ' ', t('pl.prof.meas'));
  measBtn.addEventListener('click', () => { measOn = !measOn; mA = mB = mLive = null; measBtn.setAttribute('aria-pressed', String(measOn)); if (measOn) ctx.say(t('pl.prof.meas.hint')); redraw(); });
  const read = el('span', { className: 'cv-note cv-prof-read', 'data-pl-prof-read': '' });
  const title = el('h2', { className: 'cv-h' }, t('pl.prof.head'));
  const close = el('button', { type: 'button', className: 'cv-x', 'data-pl-prof-close': '', 'aria-label': t('pl.prof.close'), onclick: () => hide() }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const canvas = el('canvas', { className: 'cv-canvas', 'data-pl-prof': '', tabIndex: 0, 'aria-label': t('pl.prof.canvas') });
  const panel = el('div', { className: 'cv-profile cv-pl-profile', 'data-pl-profile': '', hidden: true },
    el('div', { className: 'cv-profile-bar' }, title, el('label', { for: 'cv-pl-prof-line' }, t('pl.prof.line')), lineSel, el('label', { for: 'cv-pl-prof-case' }, t('pl.prof.case')), caseSel, measBtn, read, close),
    el('div', { className: 'cv-prof-canvas' }, canvas, at));
  const host = root.querySelector('[data-profile-panel]');
  if (host) host.after(panel);
  const c2d = canvas.getContext('2d');
  let W = 1, H = 1, dpr = 1;
  new ResizeObserver(() => { const r = canvas.parentElement.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height); dpr = window.devicePixelRatio || 1; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); redraw(); }).observe(canvas.parentElement);
  const pad = { l: 58, r: 16, t: 14, b: 26 };
  let frame = null;   // { ch0, ch1, z0, z1 } in project units

  const line = () => P().state.powerlines?.lines.find((l) => l.id === lineId) || null;
  function show(id) {
    lineId = id; cursor = null; mA = mB = mLive = null;
    fillLines();
    const R = P().state.powerlines.rules;
    caseSel.replaceChildren(...R.cases.map((c) => el('option', { value: c.id }, c.name)));
    if (!R.cases.some((c) => c.id === caseId)) caseId = R.hotCase && R.cases.some((c) => c.id === R.hotCase) ? R.hotCase : R.cases[0].id;
    caseSel.value = caseId;
    panel.hidden = false;
    root.querySelector('[data-profile-panel]')?.setAttribute('hidden', '');
    redraw();
  }
  /** The Line select: every overhead line in the project, this one chosen (refilled when lines are added or renamed). */
  function fillLines() {
    const ls = P().state.powerlines?.lines || [], name = (l) => l.name || l.id;
    if (lineSel.options.length !== ls.length || ls.some((l, k) => lineSel.options[k].value !== l.id || lineSel.options[k].textContent !== name(l))) lineSel.replaceChildren(...ls.map((l) => el('option', { value: l.id }, name(l))));
    lineSel.value = lineId || '';
  }
  function hide() { panel.hidden = true; lineId = null; ctx.refocus(); }

  function groundSamples(l) {
    const out = [];
    let ch = 0;
    for (let i = 0; i < l.supports.length - 1; i++) {
      const a = l.supports[i], b = l.supports[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(8, Math.ceil(L / (U() === 'm' ? 2 : 6)));
      for (let j = i ? 1 : 0; j <= n; j++) { const tt = j / n; out.push({ ch: ch + tt * L, z: ctx.groundAt(a.x + (b.x - a.x) * tt, a.y + (b.y - a.y) * tt) }); }
      ch += L;
    }
    return out;
  }
  const sx = (ch) => pad.l + (ch - frame.ch0) / (frame.ch1 - frame.ch0) * (W - pad.l - pad.r);
  const sy = (z) => H - pad.b - (z - frame.z0) / (frame.z1 - frame.z0) * (H - pad.t - pad.b);
  const toCh = (x) => frame.ch0 + (x - pad.l) / (W - pad.l - pad.r) * (frame.ch1 - frame.ch0);
  const toZ = (y) => frame.z0 + (H - pad.b - y) / (H - pad.t - pad.b) * (frame.z1 - frame.z0);

  function redraw() {
    if (panel.hidden) return;
    const l = line();
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(root);
    const C = { bg: css.getPropertyValue('--sheet-2').trim() || '#fff', ink: css.getPropertyValue('--ink').trim() || '#000', ink2: css.getPropertyValue('--ink-2').trim() || '#555',
      line: css.getPropertyValue('--line').trim() || '#ccc', red: css.getPropertyValue('--layer-red').trim() || '#c00', blue: css.getPropertyValue('--layer-blue').trim() || '#06c',
      green: css.getPropertyValue('--layer-green').trim() || '#080', action: css.getPropertyValue('--action').trim() || '#06c', ochre: css.getPropertyValue('--layer-ochre').trim() || '#a70' };
    c2d.fillStyle = C.bg; c2d.fillRect(0, 0, W, H);
    if (!l || l.supports.length < 2) { read.textContent = t('pl.prof.none'); frame = null; return; }
    const res = analysis(l.id);
    fillLines();
    const um = unitM(U());
    const g = groundSamples(l);
    const sup = res?.supports || [];
    const preview = drag?.preview || null;
    // frame
    const chs = res?.ch || [];
    let z0 = Infinity, z1 = -Infinity;
    for (const p of g) if (p.z != null) { z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
    for (const s of sup) if (s.attachZ != null) z1 = Math.max(z1, s.attachZ + 1 / um);
    const unders = under ? under(l.id) : [];
    if (Number.isFinite(z0)) {
      for (const u of unders) if (u.z != null) z0 = Math.min(z0, u.z);
      for (const sp of res?.spans || []) for (const o of sp.obstacles) if (o.top != null) z1 = Math.max(z1, o.top);
    }
    if (!Number.isFinite(z0)) { read.textContent = t('pl.prof.noground'); frame = null; return; }
    const span = Math.max(1, z1 - z0);
    frame = { ch0: 0, ch1: Math.max(1, chs[chs.length - 1] || 1), z0: z0 - span * 0.08, z1: z1 + span * 0.1 };
    // grid + labels
    c2d.font = '11px system-ui, sans-serif'; c2d.fillStyle = C.ink2; c2d.strokeStyle = C.line; c2d.lineWidth = 1;
    const step = niceStep((frame.z1 - frame.z0) / 5);
    for (let z = Math.ceil(frame.z0 / step) * step; z <= frame.z1; z += step) { const y = sy(z); c2d.beginPath(); c2d.moveTo(pad.l, y); c2d.lineTo(W - pad.r, y); c2d.stroke(); c2d.fillText(fixed(z, step < 1 ? 1 : 0), 4, y + 4); }
    const cstep = niceStep(frame.ch1 / 8);
    for (let ch = 0; ch <= frame.ch1; ch += cstep) { const x = sx(ch); c2d.fillText(fixed(ch, 0), x - 10, H - 8); }
    // ground
    c2d.strokeStyle = C.ink; c2d.lineWidth = 1.5; c2d.beginPath();
    let pen = false;
    for (const p of g) { if (p.z == null) { pen = false; continue; } const x = sx(p.ch), y = sy(p.z); pen ? c2d.lineTo(x, y) : c2d.moveTo(x, y); pen = true; }
    c2d.stroke();
    // required clearance above the ground (dashed)
    const R = P().state.powerlines.rules, need = (R.clearances.find((c) => c.id === (l.clearance || 'ground'))?.min_m ?? 0) / um;
    c2d.strokeStyle = C.ochre; c2d.setLineDash([5, 4]); c2d.lineWidth = 1; c2d.beginPath(); pen = false;
    for (const p of g) { if (p.z == null) { pen = false; continue; } const x = sx(p.ch), y = sy(p.z + need); pen ? c2d.lineTo(x, y) : c2d.moveTo(x, y); pen = true; }
    c2d.stroke(); c2d.setLineDash([]);
    // obstacles crossed (drawn ones, and the Landscape's plants and walls: 0.7 PL.11), ground to top
    for (const sp of res?.spans || []) {
      const plants = new Map();   // a plant's canopy is crossed twice: drawn once, as a crown between the two crossings
      for (const o of sp.obstacles) {
        const ch = chs[sp.i] + o.at_m / um, gz = groundAtCh(g, ch);
        if (gz == null || o.top == null) continue;
        if (o.kind === 'plant') { const p = plants.get(o.id) || { ch0: ch, ch1: ch, gz, top: o.top, ok: true }; p.ch0 = Math.min(p.ch0, ch); p.ch1 = Math.max(p.ch1, ch); p.ok = p.ok && o.ok; plants.set(o.id, p); continue; }
        c2d.fillStyle = o.ok ? (o.source === 'landscape' ? C.green : C.ochre) : C.red; c2d.globalAlpha = 0.5;
        c2d.fillRect(sx(ch) - 3, sy(o.top), 6, sy(gz) - sy(o.top));
        c2d.globalAlpha = 1;
      }
      for (const p of plants.values()) {
        const mid = (p.ch0 + p.ch1) / 2, rx = Math.max(4, (sx(p.ch1) - sx(p.ch0)) / 2), base = p.gz + (p.top - p.gz) * 0.35, ry = Math.max(3, (sy(base) - sy(p.top)) / 2);
        c2d.globalAlpha = 0.45; c2d.fillStyle = p.ok ? C.green : C.red;
        c2d.beginPath(); c2d.ellipse(sx(mid), sy(p.top) + ry, rx, ry, 0, 0, 2 * Math.PI); c2d.fill();
        c2d.globalAlpha = 1; c2d.strokeStyle = p.ok ? C.green : C.red; c2d.lineWidth = 2;
        c2d.beginPath(); c2d.moveTo(sx(mid), sy(p.gz)); c2d.lineTo(sx(mid), sy(base)); c2d.stroke();
      }
    }
    // what crosses under the line: cable routes and pipes (0.7 PL.12), at their top, with a tick from the ground
    for (const u of unders) {
      const gz = groundAtCh(g, u.ch);
      if (gz == null) continue;
      const z = u.z != null ? u.z : gz, x = sx(u.ch);
      c2d.strokeStyle = C.ink2; c2d.lineWidth = 1; c2d.setLineDash([2, 2]); c2d.beginPath(); c2d.moveTo(x, sy(gz)); c2d.lineTo(x, sy(z)); c2d.stroke(); c2d.setLineDash([]);
      c2d.fillStyle = u.kind === 'pipe' ? C.blue : C.ochre; c2d.beginPath(); c2d.arc(x, sy(z), 3.5, 0, 2 * Math.PI); c2d.fill();
      c2d.fillStyle = C.ink2; c2d.fillText(u.name, x + 5, sy(z) + 12);
    }
    // conductor curves, the failing spans in red
    for (const sp of res?.spans || []) {
      const pts = conductorCurve(res, sp.i, caseId, U(), 40);
      if (!pts.length) continue;
      const bad = sp.clear[caseId] && !sp.clear[caseId].ok || sp.obstacles.some((o) => !o.ok);
      c2d.strokeStyle = bad ? C.red : C.blue; c2d.lineWidth = bad ? 2.5 : 1.75; c2d.beginPath();
      pts.forEach((p, j) => (j ? c2d.lineTo(sx(p.ch), sy(p.z)) : c2d.moveTo(sx(p.ch), sy(p.z)))); c2d.stroke();
      if (sp.clear[caseId]) { const lo = sp.clear[caseId]; const ch = chs[sp.i] + lo.at_m / um; c2d.fillStyle = bad ? C.red : C.ink2; c2d.fillText(fixed(lo.min_m / um, 1), sx(ch) - 8, sy(groundAtCh(g, ch) ?? frame.z0) + 14); }
    }
    // supports: ground to top, the attachment marked
    l.supports.forEach((p, i) => {
      const s = sup[i] || {}, gz = s.groundZ;
      if (gz == null) return;
      const ch = preview && preview.i === i ? preview.ch : chs[i];
      const top = preview && preview.i === i && preview.top != null ? preview.top : s.aboveGround_m != null ? gz + s.aboveGround_m / um : gz;
      const bad = (res?.issues || []).some((x) => x.support === i && x.sev === 'error');
      c2d.strokeStyle = bad ? C.red : i === hover ? C.action : C.ink; c2d.lineWidth = i === hover ? 4 : 3;
      c2d.beginPath(); c2d.moveTo(sx(ch), sy(gz)); c2d.lineTo(sx(ch), sy(top)); c2d.stroke();
      if (s.attachZ != null) { c2d.fillStyle = C.blue; c2d.fillRect(sx(ch) - 3, sy(s.attachZ) - 3, 6, 6); }
      c2d.fillStyle = C.ink; c2d.fillText(p.name || String(i + 1), sx(ch) - 6, sy(top) - 6);
    });
    last = { g, res };
    drawCursor(res, g, C, need);
    drawMeasure(C);
    const issues = (res?.issues || []).filter((x) => x.sev === 'error').length;
    read.textContent = (res?.ok ? t('pl.prof.read', { n: l.supports.length, len: fixed(frame.ch1, 1), u: U() }) : t('pl.prof.notsolved')) + (issues ? ' ' + t('pl.prof.issues', { n: issues }) : '');
  }
  /** The pointer's chainage: a thin line, the ground and the conductor marked, and the numbers in the bar. */
  function drawCursor(res, g, C, need) {
    if (cursor == null || !frame || cursor < frame.ch0 || cursor > frame.ch1) { at.textContent = ''; return; }
    const x = sx(cursor), gz = groundAtCh(g, cursor);
    c2d.strokeStyle = C.ink2; c2d.lineWidth = 1; c2d.setLineDash([2, 3]); c2d.beginPath(); c2d.moveTo(x, pad.t); c2d.lineTo(x, H - pad.b); c2d.stroke(); c2d.setLineDash([]);
    const cz = conductorAt(res, cursor);
    const dot = (z, col) => { c2d.fillStyle = col; c2d.beginPath(); c2d.arc(x, sy(z), 3.5, 0, 2 * Math.PI); c2d.fill(); };
    if (gz != null) dot(gz, C.ink);
    if (cz != null) dot(cz, C.action);
    const clr = cz != null && gz != null ? cz - gz : null, dash = '–';   // i18n-ignore: an empty value
    at.textContent = t('pl.prof.at', { ch: fixed(cursor, 1), u: U(), g: gz != null ? fixed(gz, 2) : dash, c: cz != null ? fixed(cz, 2) : dash, clr: clr != null ? fixed(clr, 2) : dash })
      + (clr != null && clr < need - 1e-9 ? ' ' + t('pl.prof.at.low', { need: fixed(need, 2), u: U() }) : '');
  }
  /** The conductor's elevation at chainage ch under the chosen load case (null off the spans or before it is worked out). */
  function conductorAt(res, ch) {
    const chs = res?.ch || [];
    const i = chs.findIndex((c, k) => k < chs.length - 1 && ch >= c && ch <= chs[k + 1]);
    if (i < 0) return null;
    const pts = conductorCurve(res, i, caseId, U(), 80);
    for (let k = 1; k < pts.length; k++) if (pts[k].ch >= ch) { const a = pts[k - 1], b = pts[k], tt = (ch - a.ch) / Math.max(1e-9, b.ch - a.ch); return a.z + (b.z - a.z) * tt; }
    return null;
  }
  /** A click on the profile as a point { ch, z }: snapped to the ground, the conductor or a support's top within 8 px. */
  function profPoint(s) {
    const ch = toCh(s.x), cands = [];
    if (last) {
      const gz = groundAtCh(last.g, ch), cz = conductorAt(last.res, ch);
      if (gz != null) cands.push({ ch, z: gz });
      if (cz != null) cands.push({ ch, z: cz });
      (last.res?.supports || []).forEach((sp, i) => { if (sp.groundZ != null && sp.aboveGround_m != null) cands.push({ ch: last.res.ch[i], z: sp.groundZ + sp.aboveGround_m / unitM(U()) }); });
    }
    let best = null, bd = 8;
    for (const c of cands) { const d = Math.hypot(sx(c.ch) - s.x, sy(c.z) - s.y); if (d <= bd) { bd = d; best = c; } }
    return best || { ch, z: toZ(s.y) };
  }
  /** Measure: the two points (or the first and the pointer), joined, with the numbers in the label. */
  function drawMeasure(C) {
    measBtn.setAttribute('aria-pressed', String(measOn));
    if (!measOn || !mA || !frame) return;
    const b = mB || mLive;
    const dot = (p) => { c2d.fillStyle = C.action; c2d.beginPath(); c2d.arc(sx(p.ch), sy(p.z), 4, 0, 2 * Math.PI); c2d.fill(); };
    dot(mA);
    if (!b) { at.textContent = t('pl.prof.meas.first'); return; }
    c2d.strokeStyle = C.action; c2d.lineWidth = 1.5; c2d.setLineDash([4, 3]); c2d.beginPath(); c2d.moveTo(sx(mA.ch), sy(mA.z)); c2d.lineTo(sx(b.ch), sy(b.z)); c2d.stroke(); c2d.setLineDash([]);
    if (mB) dot(mB);
    const m = between(mA, b);
    if (m) at.textContent = t('pl.prof.meas.read', { dx: fixed(m.dx, 2), dz: fixed(m.dz, 2), s: fixed(m.slope, 2), g: m.grade_pct != null ? fixed(m.grade_pct, 1) : '–', u: U() });   // i18n-ignore: an empty value
  }
  const groundAtCh = (g, ch) => { for (let i = 1; i < g.length; i++) if (g[i].ch >= ch) { const a = g[i - 1], b = g[i]; if (a.z == null || b.z == null) return a.z ?? b.z; const tt = (ch - a.ch) / Math.max(1e-9, b.ch - a.ch); return a.z + (b.z - a.z) * tt; } return g[g.length - 1]?.z ?? null; };
  const niceStep = (r) => { const p = 10 ** Math.floor(Math.log10(Math.max(1e-9, r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };

  // ---- dragging a support: sideways along the line, or its top for the height ----
  const local = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function hitSupport(s) {
    const l = line(), res = l ? analysis(l.id) : null;
    if (!l || !res || !frame) return null;
    for (const [i, p] of l.supports.entries()) {
      const sp = res.supports[i];
      if (!sp || sp.groundZ == null) continue;
      const x = sx(res.ch[i]), top = sy(sp.aboveGround_m != null ? sp.groundZ + sp.aboveGround_m / unitM(U()) : sp.groundZ);
      if (Math.abs(s.x - x) <= 7 && Math.abs(s.y - top) <= 8) return { i, part: 'top' };
      if (Math.abs(s.x - x) <= 6 && s.y > top && s.y < sy(sp.groundZ) + 4) return { i, part: 'pole' };
      void p;
    }
    return null;
  }
  canvas.addEventListener('pointerdown', (e) => {
    const s = local(e);
    canvas.focus({ preventScroll: true });
    if (measOn && frame) { const p = profPoint(s); if (!mA || mB) { mA = p; mB = null; } else mB = p; redraw(); return; }
    const h = hitSupport(s);
    if (!h) return;
    selectSupport(lineId, h.i);
    drag = { ...h, preview: null };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const s = local(e);
    if (measOn) { cursor = frame ? toCh(s.x) : null; mLive = mA && !mB && frame ? profPoint(s) : null; canvas.style.cursor = 'crosshair'; redraw(); return; }
    if (!drag) { const h = hitSupport(s); hover = h ? h.i : -1; canvas.style.cursor = h ? (h.part === 'top' ? 'ns-resize' : 'ew-resize') : 'crosshair'; cursor = frame ? toCh(s.x) : null; redraw(); return; }
    const l = line(), res = analysis(lineId);
    if (!l || !res) return;
    const i = drag.i;
    if (drag.part === 'top') drag.preview = { i, ch: res.ch[i], top: Math.max(res.supports[i].groundZ + 1 / unitM(U()), toZ(s.y)) };
    else if (i > 0 && i < l.supports.length - 1) drag.preview = { i, ch: Math.min(res.ch[i + 1] - 0.5, Math.max(res.ch[i - 1] + 0.5, toCh(s.x))), top: null };
    redraw();
  });
  canvas.addEventListener('pointerleave', () => { if (!drag && (cursor != null || hover >= 0 || mLive)) { cursor = null; hover = -1; mLive = null; redraw(); } });
  canvas.addEventListener('pointerup', () => {
    const d = drag; drag = null;
    if (!d?.preview) { redraw(); return; }
    const l = line(), res = analysis(lineId);
    if (!l || !res) return;
    const i = d.i;
    if (d.part === 'top') {
      const h = d.preview.top - res.supports[i].groundZ;
      edit(t('pl.undo.height'), (s) => { const p = s.lines.find((x) => x.id === lineId).supports[i]; p.h = +h.toFixed(3); });
      ctx.say(t('pl.prof.height', { name: l.supports[i].name || i + 1, h: fixed(h, 2), u: U() }));
    } else {
      const at = pointAtCh(l, res.ch, i, d.preview.ch);
      edit(t('pl.undo.move'), (s) => { const p = s.lines.find((x) => x.id === lineId).supports[i]; p.x = at.x; p.y = at.y; });
      ctx.say(t('pl.prof.moved', { name: l.supports[i].name || i + 1, ch: fixed(d.preview.ch, 2), u: U() }));
    }
    ctx.refresh();
  });
  /** Where chainage ch falls on the polyline prev → this → next (the support slides along its two spans). */
  function pointAtCh(l, ch, i, c) {
    const a = l.supports[i - 1], b = l.supports[i], n = l.supports[i + 1];
    if (c <= ch[i]) { const tt = (c - ch[i - 1]) / Math.max(1e-9, ch[i] - ch[i - 1]); return { x: a.x + (b.x - a.x) * tt, y: a.y + (b.y - a.y) * tt }; }
    const tt = (c - ch[i]) / Math.max(1e-9, ch[i + 1] - ch[i]);
    return { x: b.x + (n.x - b.x) * tt, y: b.y + (n.y - b.y) * tt };
  }

  /** Where support i's top (or foot) is on the page: tests drag it like a person would. */
  function screenOf(i, part = 'top') {
    const l = line(), res = l ? analysis(l.id) : null, s = res?.supports[i];
    if (!frame || !s || s.groundZ == null) return null;
    const r = canvas.getBoundingClientRect(), z = part === 'top' && s.aboveGround_m != null ? s.groundZ + s.aboveGround_m / unitM(U()) : s.groundZ;
    return { x: r.left + sx(res.ch[i]), y: r.top + sy(z) };
  }
  /** What the bar reads at chainage ch (tests: the same as the pointer there). */
  function readAt(ch) { cursor = ch; redraw(); return at.textContent; }
  /** Measure between two profile points (tests): turns Measure on, sets both points, returns the label. */
  function measureBetween(a, b) { measOn = true; mA = a; mB = b; redraw(); return at.textContent; }
  return { panel, show, hide, shown: () => !panel.hidden, redraw, screenOf, readAt, measureBetween, get lineId() { return lineId; } };
}
