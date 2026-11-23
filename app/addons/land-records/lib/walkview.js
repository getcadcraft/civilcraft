/* SPDX-License-Identifier: Apache-2.0 */
/**
 * walkview.js — the walk screen (0.11 LR.2): a window that fills a phone, made to be used outdoors with one thumb and without looking.
 * One very large button marks a corner; the accuracy the device reports is always in sight; a sketch shows the outline so far. A DOM file
 * of the library (with panel.js); the device is capture.js, the numbers are walk.js.
 *
 *   openWalk(parent, { t, settings: { maxAcc, averageS }, env, name, walk? (carry on with one), onDone(walk | null) }) → view
 *   view = { el, walk, capture, mark(code?) → result, undo(), finish(), cancel(), leave() (the × button: asks once when points would be lost), push(fix), state() }      the tests and the panel reach it here
 *   Every word comes through t('lr.w.…'); nothing is written as HTML.
 */
import { makeCapture } from './capture.js';
import { newWalk, markPoint, undoPoint, addTrack, stats, outline, plane } from './walk.js';

const NS = 'http://www.w3.org/2000/svg';
const h = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) { if (v === undefined || v === null || v === false) continue; if (k === 'className') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
};
const m1 = (v) => (Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: 1 }) : '–');
export const grade = (acc, maxAcc) => (acc === null || acc === undefined ? 'none' : acc <= maxAcc / 3 ? 'good' : acc <= maxAcc ? 'fair' : 'poor');

export function openWalk(parent, { t, settings = {}, env = globalThis, name = '', walk: given = null, onDone = () => {} } = {}) {
  const maxAcc = settings.maxAcc > 0 ? settings.maxAcc : 15, averageS = settings.averageS > 0 ? settings.averageS : 5;
  const walk = given || newWalk({ name, t: Date.now(), device: String(env.navigator?.userAgent || '').slice(0, 80) });
  let track = false, done = false, armed = { media: false, keys: false };
  const acc = h('div', { className: 'lr-w-acc', 'data-lr-acc': '', role: 'status' }), pos = h('div', { className: 'lr-w-pos' });
  const count = h('div', { className: 'lr-w-count', 'data-lr-count': '' }), msg = h('div', { className: 'lr-w-msg', role: 'status', 'aria-live': 'polite', 'data-lr-msg': '' });
  const sketch = document.createElementNS(NS, 'svg'); sketch.setAttribute('class', 'lr-w-sketch'); sketch.setAttribute('role', 'img'); sketch.setAttribute('aria-label', t('lr.w.sketch'));
  const code = h('input', { type: 'text', maxlength: '24', placeholder: t('lr.w.code.ph'), 'aria-label': t('lr.w.code'), 'data-lr-code': '', autocapitalize: 'characters' });
  const big = h('button', { type: 'button', className: 'lr-w-big', 'data-lr-mark': '', disabled: true, onclick: () => mark() }, t('lr.w.mark'));
  const say = (text) => { msg.textContent = text || ''; };

  const cap = makeCapture({
    env, keepS: Math.max(60, averageS * 4),
    onFix: (f) => { if (track) addTrack(walk, f); draw(); },
    onError: (c) => { say(t('lr.w.err.' + c)); draw(); },
    onButton: (what) => (what === 'undo' ? undo() : mark()),
  });

  function draw() {
    const f = cap.last(), g = f ? grade(f.acc, maxAcc) : 'none', st = stats(walk);
    acc.className = 'lr-w-acc lr-w-' + g;
    acc.textContent = !f ? t('lr.w.waiting') : f.acc === null ? t('lr.w.acc.unknown') : t('lr.w.acc.' + g, { m: m1(f.acc) });
    pos.textContent = f ? f.lat.toFixed(6) + ', ' + f.lon.toFixed(6) : '';
    big.disabled = !f;
    count.textContent = st.corners >= 3 ? t('lr.w.count.area', { n: st.points, area: m1(st.area), sigma: st.areaSigma === null ? '?' : m1(st.areaSigma) }) : t('lr.w.count', { n: st.points });
    cap.title(t('lr.w.title', { n: st.points }));
    // the sketch: corners so far, the outline, and where the walker stands
    const pl = plane(walk) || (f ? { toXY: () => ({ x: 0, y: 0 }) } : null);
    sketch.replaceChildren();
    if (!pl) return;
    const ring = outline(walk, pl), me = f && plane(walk) ? pl.toXY(f.lat, f.lon) : null, all = [...ring, ...(me ? [me] : [])];
    if (!all.length) return;
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const p of all) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); }
    const span = Math.max(c - a, d - b, 10), pad = span * 0.15, r = span / 45;
    sketch.setAttribute('viewBox', `${a - pad} ${-(d + pad)} ${c - a + 2 * pad} ${d - b + 2 * pad}`);
    const s = (nm, at) => { const n = document.createElementNS(NS, nm); for (const [k, v] of Object.entries(at)) n.setAttribute(k, String(v)); sketch.append(n); return n; };
    if (ring.length >= 2) s(ring.length >= 3 ? 'polygon' : 'polyline', { points: ring.map((p) => p.x.toFixed(2) + ',' + (-p.y).toFixed(2)).join(' '), fill: ring.length >= 3 ? 'rgba(47,111,218,.15)' : 'none', stroke: '#2f6fda', 'stroke-width': r / 2 });
    ring.forEach((p) => s('circle', { cx: p.x, cy: -p.y, r, fill: '#2f6fda' }));
    if (me) { if (f.acc) s('circle', { cx: me.x, cy: -me.y, r: f.acc, fill: 'rgba(217,130,43,.15)', stroke: '#d9822b', 'stroke-width': r / 4 }); s('circle', { cx: me.x, cy: -me.y, r: r * 0.8, fill: '#d9822b' }); }
  }

  function mark(asCode) {
    if (done) return { ok: false, why: 'done' };
    const c = String(asCode ?? code.value ?? '').trim() || 'C';
    const res = markPoint(walk, cap.recent(averageS), { code: c, maxAcc, t: Date.now() });
    if (res.ok) {
      const p = res.point;
      say(p.acc === null ? t('lr.w.took.unknown', { n: p.n }) : t('lr.w.took', { n: p.n, m: m1(p.acc), k: p.fixes }));
      cap.answer('mark', t('lr.w.spoken', { n: p.n }));
    } else {
      const f = cap.last();
      say(res.why === 'poor' ? t('lr.w.refuse.poor', { m: f && f.acc !== null ? m1(f.acc) : '?', max: m1(maxAcc) }) : t('lr.w.refuse.' + res.why));
      cap.answer('refuse', t('lr.w.spoken.refuse'));
    }
    draw(); return res;
  }
  function undo() {
    if (done) return null;
    const p = undoPoint(walk);
    say(p ? t('lr.w.undone', { n: p.n }) : t('lr.w.undo.none'));
    cap.answer('undo', p ? t('lr.w.spoken.undo') : ''); draw(); return p;
  }
  function close(result) { if (done) return; done = true; cap.end(); try { root.close(); } catch { /* not shown as a dialog */ } root.remove(); onDone(result); }
  // closing without keeping takes two presses once there is something to lose
  let sure = 0;
  function leave() { if (walk.points.length && Date.now() - sure > 6000) { sure = Date.now(); say(t('lr.w.cancel.sure', { n: walk.points.length })); return false; } close(null); return true; }
  function finish() {
    const st = stats(walk);
    if (!walk.points.length) return close(null);
    walk.closed = st.corners >= 3; close(walk);
  }

  const chk = (label, attr, fn, on = false) => { const i = h('input', { type: 'checkbox', [attr]: '' }); i.checked = on; i.addEventListener('change', () => fn(i.checked, i)); return h('label', { className: 'lr-w-chk' }, i, h('span', {}, label)); };
  const remote = chk(t('lr.w.remote'), 'data-lr-remote', (on) => {
    if (on) { armed = cap.arm({ media: true, keys: true, title: t('lr.w.title', { n: walk.points.length }) }); say(armed.media ? t('lr.w.remote.on') : t('lr.w.remote.keys')); }
    else { cap.disarm(); armed = { media: false, keys: false }; say(''); }
  });
  const root = h('dialog', { className: 'lr-walk', 'data-lr-walk': '', 'aria-label': t('lr.w.name') },
    h('div', { className: 'lr-w-top' }, h('strong', {}, t('lr.w.name')), h('button', { type: 'button', className: 'lr-w-x', 'data-lr-cancel': '', 'aria-label': t('lr.w.cancel'), onclick: () => leave() }, '×')),
    acc, pos, sketch, count, big,
    h('div', { className: 'lr-w-row' }, code, h('button', { type: 'button', 'data-lr-undo': '', onclick: () => undo() }, t('lr.w.undo')), h('button', { type: 'button', className: 'lr-w-finish', 'data-lr-finish': '', onclick: () => finish() }, t('lr.w.finish'))),
    msg,
    h('div', { className: 'lr-w-opts' }, remote,
      chk(t('lr.w.awake'), 'data-lr-awake', async (on, i) => { const got = await cap.awake(on); if (on && !got) { i.checked = false; say(t('lr.w.awake.no')); } }),
      chk(t('lr.w.track'), 'data-lr-track', (on) => { track = on; })),
    h('p', { className: 'lr-w-note' }, t('lr.w.notice', { max: m1(maxAcc), s: averageS })));
  parent.append(root);
  root.addEventListener('cancel', (e) => { e.preventDefault(); leave(); });   // Escape, or the phone's back gesture
  try { root.showModal(); } catch { root.setAttribute('open', ''); }   // above everything else on the page
  if (!cap.start()) big.disabled = true;
  cap.arm({ media: false, keys: true });   // keys always; the watch only when asked, because it starts (silent) sound
  draw();
  return { el: root, walk, capture: cap, mark, undo, finish, cancel: () => close(null), leave, push: (f) => cap.push(f), state: () => ({ ...stats(walk), last: cap.last(), armed, track, done }) };
}

export const WALK_CSS = `
.lr-walk{position:fixed;inset:0;z-index:2147483000;box-sizing:border-box;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:none;margin:0;border:0;background:var(--paper,#fff);color:var(--ink,#111);display:flex;flex-direction:column;gap:.5rem;padding:max(.6rem,env(safe-area-inset-top)) .8rem max(.6rem,env(safe-area-inset-bottom));font-size:1.05rem;overflow:auto}
.lr-w-top{display:flex;justify-content:space-between;align-items:center}
.lr-w-x{font-size:1.6rem;line-height:1;min-width:2.75rem;min-height:2.75rem;background:none;border:0;color:inherit}
.lr-w-acc{font-size:1.5rem;font-weight:700;padding:.5rem .7rem;border-radius:.5rem;border:2px solid currentColor}
.lr-w-good{color:#1b7f3b}.lr-w-fair{color:#9a6700}.lr-w-poor{color:#b3261e}.lr-w-none{color:#666}
.lr-w-pos{font-family:ui-monospace,monospace;font-size:.9rem;opacity:.8;min-height:1.2em}
.lr-w-sketch{flex:1 1 8rem;min-height:7rem;max-height:38vh;width:100%;border:1px solid var(--line,#7a8796);border-radius:.5rem}
.lr-w-count{font-weight:600;min-height:1.3em}
.lr-w-big{flex:0 0 auto;min-height:26vh;font-size:2.2rem;font-weight:800;border-radius:1rem;border:0;background:#2f6fda;color:#fff;touch-action:manipulation}
.lr-w-big:disabled{background:#8a94a3}
.lr-w-big:active{background:#1d4fa8}
.lr-w-row{display:flex;gap:.5rem}
.lr-w-row input{flex:1 1 6rem;min-width:0;min-height:3rem;font-size:1.05rem;background:#fff;color:#111;border:1px solid var(--line,#7a8796);border-radius:.4rem;padding:0 .6rem}
.lr-w-row button{min-height:3rem;padding:0 1rem;font-size:1.05rem;border-radius:.4rem;border:1px solid var(--line,#7a8796);background:transparent;color:inherit}
.lr-w-row .lr-w-finish{background:#1b7f3b;color:#fff;border-color:#1b7f3b;font-weight:700}
.lr-w-msg{min-height:2.6em}
.lr-w-opts{display:grid;gap:.35rem}
.lr-w-chk{display:flex;gap:.6rem;align-items:center;min-height:2.4rem}
.lr-w-chk input{width:1.4rem;height:1.4rem}
.lr-w-note{font-size:.85rem;opacity:.85;margin:0}
`;
