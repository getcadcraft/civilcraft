/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wave-view.js — the waveform viewer of the Chip design add-on (0.9 HD.4): signals of a VCD (vcd.js readVcd) drawn on a canvas, one row
 * each; wheel or the +/− buttons zoom around the pointer, drag pans, a click puts the cursor and the value column shows every signal's
 * value there; Hex / Dec / Bin for buses; a filter box; Fit. Our own code; no plotting library.
 *
 *   waveSegments(sig, t0, t1) → [{ a, b, v }]          the pure part (tested in Node): value spans inside [t0, t1]
 *   mountWaves(el, vcd, { t = (k) => k, height = 22 }) → { setVcd(vcd), fit(), cursor(time), destroy() }
 */
import { valueAt, formatValue } from './vcd.js';

export function waveSegments(sig, t0, t1) {
  const out = [];
  const { t, v } = sig;
  let k = 0;
  while (k < t.length && t[k] <= t0) k++;
  let cur = k > 0 ? v[k - 1] : '', a = t0;
  for (; k < t.length && t[k] < t1; k++) { if (cur !== '') out.push({ a, b: t[k], v: cur }); a = t[k]; cur = v[k]; }
  if (cur !== '') out.push({ a, b: t1, v: cur });
  return out;
}

const css = (el, name, fallback) => (getComputedStyle(el).getPropertyValue(name) || '').trim() || fallback;

export function mountWaves(el, vcd, { t = (k) => k, height = 22 } = {}) {
  const d = el.ownerDocument;
  el.textContent = '';
  el.classList.add('chip-waves');
  const bar = d.createElement('div'); bar.className = 'chip-waves-bar';
  const filter = Object.assign(d.createElement('input'), { type: 'search', placeholder: t('chip.wave.filter'), className: 'chip-input' });
  filter.setAttribute('aria-label', t('chip.wave.filter'));
  const radix = d.createElement('select'); radix.className = 'chip-input';
  radix.setAttribute('aria-label', t('chip.wave.radix'));
  for (const [v, l] of [['hex', 'Hex'], ['dec', 'Dec'], ['bin', 'Bin']]) radix.append(Object.assign(d.createElement('option'), { value: v, textContent: l }));
  const btn = (label, title, fn) => { const b = Object.assign(d.createElement('button'), { type: 'button', className: 'chip-btn', textContent: label, title }); b.addEventListener('click', fn); return b; };
  const info = d.createElement('span'); info.className = 'chip-muted';
  const wrap = d.createElement('div'); wrap.className = 'chip-waves-wrap';
  const canvas = d.createElement('canvas'); canvas.className = 'chip-waves-canvas'; canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  wrap.append(canvas);
  let state = { vcd, t0: 0, t1: Math.max(1, vcd?.end || 1), cursor: null, rows: [] };
  const NAME_W = () => Math.min(220, Math.max(110, canvas.clientWidth * 0.32)), VAL_W = 70;
  const visible = () => { const q = filter.value.trim().toLowerCase(); return (state.vcd?.signals || []).filter((s) => !q || s.path.toLowerCase().includes(q)).slice(0, 400); };
  const draw = () => {
    const rows = visible();
    state.rows = rows;
    const dpr = globalThis.devicePixelRatio || 1, W = Math.max(200, wrap.clientWidth || 600), H = Math.max(height * 2, (rows.length + 1) * height);
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const g = canvas.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fg = css(el, '--chip-fg', '#1b1f24'), mute = css(el, '--chip-muted', '#6b7280'), line = css(el, '--chip-wave', '#0a7a3b'), xz = css(el, '--chip-xz', '#c2410c'), grid = css(el, '--chip-grid', 'rgba(127,127,127,.25)'), cur = css(el, '--chip-cursor', '#2563eb');
    g.clearRect(0, 0, W, H);
    g.font = '12px ui-monospace, Menlo, Consolas, monospace';
    const nw = NAME_W(), x0 = nw + VAL_W, span = Math.max(1e-9, state.t1 - state.t0), X = (tt) => x0 + ((tt - state.t0) / span) * (W - x0 - 4);
    // time ruler
    g.fillStyle = mute; g.strokeStyle = grid;
    const step = Math.pow(10, Math.floor(Math.log10(span / 6)));
    const nice = [1, 2, 5, 10].map((m) => m * step).find((s) => span / s <= 10) || step * 10;
    for (let tt = Math.ceil(state.t0 / nice) * nice; tt <= state.t1; tt += nice) { const x = X(tt); g.beginPath(); g.moveTo(x, height); g.lineTo(x, H); g.stroke(); g.fillText(String(+tt.toPrecision(6)), x + 2, 14); }
    g.fillText((state.vcd?.timescale ? state.vcd.timescale.n + state.vcd.timescale.unit : ''), 4, 14);
    rows.forEach((s, i) => {
      const y = (i + 1) * height, mid = y + height / 2, hi = y + 4, lo = y + height - 4;
      g.fillStyle = fg; g.fillText(s.path.length > 28 ? '…' + s.path.slice(-27) : s.path, 4, mid + 4);
      if (state.cursor !== null) { g.fillStyle = cur; g.fillText(formatValue(valueAt(s, state.cursor), s.width, radix.value).slice(0, 9), nw + 4, mid + 4); }
      for (const seg of waveSegments(s, state.t0, state.t1)) {
        const a = X(seg.a), b = X(seg.b), bad = /[xz]/.test(seg.v);
        g.strokeStyle = bad ? xz : line;
        g.beginPath();
        if (s.width === 1 && !bad && s.kind !== 'real') { const yy = seg.v === '1' ? hi : lo; g.moveTo(a, hi); g.lineTo(a, lo); g.moveTo(a, yy); g.lineTo(b, yy); }
        else {
          const e = Math.min(3, (b - a) / 2);
          g.moveTo(a, mid); g.lineTo(a + e, hi); g.lineTo(b - e, hi); g.lineTo(b, mid); g.lineTo(b - e, lo); g.lineTo(a + e, lo); g.closePath();
          if (b - a > 30) { g.fillStyle = bad ? xz : fg; g.fillText(formatValue(seg.v, s.width, radix.value).slice(0, Math.floor((b - a) / 7)), a + 4, mid + 4); }
        }
        g.stroke();
      }
    });
    if (state.cursor !== null && state.cursor >= state.t0 && state.cursor <= state.t1) { g.strokeStyle = cur; g.beginPath(); g.moveTo(X(state.cursor), height); g.lineTo(X(state.cursor), H); g.stroke(); }
    info.textContent = t('chip.wave.info', { n: (state.vcd?.signals || []).length, shown: rows.length, cursor: state.cursor === null ? '—' : String(state.cursor) });
    canvas.setAttribute('aria-label', info.textContent);
  };
  const timeAt = (px) => { const nw = NAME_W(), x0 = nw + VAL_W, W = canvas.clientWidth; return state.t0 + ((px - x0) / Math.max(1, W - x0 - 4)) * (state.t1 - state.t0); };
  const zoom = (f, around = (state.t0 + state.t1) / 2) => {
    const end = Math.max(1, state.vcd?.end || 1), span = Math.min(end, Math.max(1e-6, (state.t1 - state.t0) * f));
    let a = around - (around - state.t0) * (span / (state.t1 - state.t0));
    a = Math.max(0, Math.min(end - span, a)); state.t0 = a; state.t1 = a + span; draw();
  };
  const fit = () => { state.t0 = 0; state.t1 = Math.max(1, state.vcd?.end || 1); draw(); };
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.25 : 0.8, timeAt(e.offsetX)); }, { passive: false });
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.offsetX, t0: state.t0, t1: state.t1, moved: false }; canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.offsetX - drag.x; if (Math.abs(dx) > 3) drag.moved = true;
    if (!drag.moved) return;
    const per = (drag.t1 - drag.t0) / Math.max(1, canvas.clientWidth - NAME_W() - VAL_W), end = Math.max(1, state.vcd?.end || 1), span = drag.t1 - drag.t0;
    const a = Math.max(0, Math.min(end - span, drag.t0 - dx * per)); state.t0 = a; state.t1 = a + span; draw();
  });
  canvas.addEventListener('pointerup', (e) => { if (drag && !drag.moved && e.offsetX > NAME_W() + VAL_W) { state.cursor = Math.round(timeAt(e.offsetX)); draw(); } drag = null; });
  canvas.addEventListener('keydown', (e) => { if (e.key === '+' || e.key === '=') zoom(0.8); else if (e.key === '-') zoom(1.25); else if (e.key === 'f') fit(); });
  filter.addEventListener('input', draw); radix.addEventListener('change', draw);
  bar.append(btn('+', t('chip.wave.zoomin'), () => zoom(0.5)), btn('−', t('chip.wave.zoomout'), () => zoom(2)), btn(t('chip.wave.fit'), t('chip.wave.fit'), fit), radix, filter, info);
  el.append(bar, wrap);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => draw()) : null;
  ro?.observe(wrap);
  draw();
  return {
    setVcd(v) { state.vcd = v; state.cursor = null; fit(); },
    fit, cursor(time) { state.cursor = time; draw(); }, state: () => ({ t0: state.t0, t1: state.t1, cursor: state.cursor, rows: state.rows.length }),
    destroy() { ro?.disconnect(); el.textContent = ''; },
  };
}
