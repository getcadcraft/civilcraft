/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-panel.js — the Laser panel (0.7 SU.772, session `make-07`): drawing layers → cut / score / engrave / fill / picture with
 * power, speed and passes, a preview of the head's moves, GRBL laser-mode G-code to save, and (Web Serial, after a click) framing
 * the job and sending it. Imports only the other lib/laser modules; the page's DOM helper, words and drawing come from the app
 * (`host`), so the copy in each app is byte-identical (tools/laser/sync.mjs).
 *
 *   laserPanel(host) → { panel() → [nodes], plan() → plan | null, refresh(), link, dispose() }
 *   host = {
 *     el(tag, props, …children), t(key, fills)                 the app's DOM helper and i18n
 *     cls: { block, note, head, table, btn, primary, link, select, input, error }
 *     job() → saved settings (any shape; cleanJob is applied) · setJob(label, next)     one undo step, saved with the project
 *     layers() → [name]                                        the drawing's layers that have something to send
 *     input() → { shapes, pictures }                           what to burn (laser-plan.js input), read fresh each time
 *     version() → number                                       changes whenever the drawing changes (the preview goes stale)
 *     download(name, data, type), print(text), fileName()      saving and the status line
 *     confirm(text) → Promise<boolean>                          the app's yes / no dialog
 *     serial → navigator.serial (optional; absent = no Connect button)
 *     rerender()                                                ask the app to call panel() again
 *   }
 * Safety, by construction: nothing connects or sends until a button is clicked; "Send job" stays off until the job has been
 * framed (the head traced the box with the laser off) since the last change; sending asks the person to confirm.
 * Words: keys laser.* (tools/laser/lang.mjs is the one table; tools/laser/sync.mjs writes it into each app's language files).
 */
import { MODES, DITHER_NAMES, cleanJob, jobFor, DEFAULTS } from './laser-model.js';
import { plan as makePlan } from './laser-plan.js';
import { gcode, gcodeLines, frameLines } from './laser-gcode.js';
import { GrblLink } from './laser-serial.js';

const MODE_COLORS = { image: '#6a4c93', fill: '#8a6d1a', engrave: '#2a7f62', score: '#2f6fb5', cut: '#c0392b' };

export function laserPanel(host) {
  const { el, t } = host;
  const C = host.cls;
  let cache = null;            // { key, plan }
  let framedKey = '';          // the plan the head last traced the box of
  const serial = host.serial || null;                    // absent = no Connect button (never the browser's own by default)
  const link = new GrblLink({ serial, onLine: (l) => log(l), onState: () => host.rerender?.(), onProgress: () => host.rerender?.() });
  const lines = [];
  const log = (l) => { lines.push(l); if (lines.length > 40) lines.shift(); };
  let progress = null;

  const current = () => jobFor(cleanJob(host.job()), host.layers());
  const keyOf = (job) => host.version() + '|' + JSON.stringify(job);
  function planNow() {
    const job = current(), key = keyOf(job);
    if (!cache || cache.key !== key) cache = { key, job, plan: makePlan(job, host.input()) };
    return cache;
  }
  function change(label, fn) { const next = JSON.parse(JSON.stringify(current())); fn(next); return host.setJob(label, cleanJob(next)); }

  const sel = (value, options, onchange, attrs = {}) => el('select', { className: C.select, onchange: (e) => onchange(e.target.value), ...attrs }, ...options.map(([v, label]) => el('option', { value: v, selected: v === value }, label)));
  const btn = (label, onclick, attrs = {}) => el('button', { type: 'button', className: C.btn, onclick, ...attrs }, label);
  const field = (label, control) => el('label', { className: 'lp-field' }, el('span', {}, label), control);
  const num = (value, onchange, attrs = {}) => el('input', { type: 'text', inputMode: 'decimal', className: C.input + ' lp-num', value: String(value), onchange: (e) => { const v = Number(String(e.target.value).replace(',', '.')); if (Number.isFinite(v)) onchange(v); else host.rerender?.(); }, ...attrs });
  const check = (label, value, onchange, attrs = {}) => el('label', { className: 'lp-check' }, el('input', { type: 'checkbox', checked: !!value, onchange: (e) => onchange(e.target.checked), ...attrs }), el('span', {}, label));
  const note = (text, attrs = {}) => el('p', { className: C.note, ...attrs }, text);
  const head = (text, ...extra) => el('div', { className: C.head }, el('h3', {}, text), ...extra);
  const td = (v, n) => el('td', { className: n ? 'n' : '' }, v);

  // ---- layers ----
  function layersBlock() {
    const job = current();
    const rows = job.layers.map((l, i) => {
      const set = (label, k, v) => change(label, (x) => { x.layers[i][k] = v; });
      const label = t('laser.undo-layer');
      const more = l.mode === 'fill' || l.mode === 'image';
      return [
        el('tr', { 'data-lp-layer': l.name },
          td(l.name),
          el('td', {}, sel(l.mode, MODES.map((m) => [m, t('laser.mode-' + m)]), (v) => change(label, (x) => { const d = DEFAULTS[v]; const keep = x.layers[i]; x.layers[i] = { name: keep.name, mode: v, ...d, power: keep.mode === 'off' ? d.power : keep.power, speed: keep.mode === 'off' ? d.speed : keep.speed, passes: keep.passes }; }), { 'data-lp': 'mode', 'aria-label': t('laser.col-mode') })),
          l.mode === 'off' ? el('td', { colSpan: 3 }, note(t('laser.not-sent'))) : [
            el('td', {}, num(l.power, (v) => set(label, 'power', v), { 'data-lp': 'power', 'aria-label': t('laser.col-power') })),
            el('td', {}, num(l.speed, (v) => set(label, 'speed', v), { 'data-lp': 'speed', 'aria-label': t('laser.col-speed') })),
            el('td', {}, num(l.passes, (v) => set(label, 'passes', v), { 'data-lp': 'passes', 'aria-label': t('laser.col-passes') }))]),
        more ? el('tr', { className: 'lp-more' }, el('td', { colSpan: 6 }, el('div', { className: 'lp-row' },
          field(t('laser.f-interval'), num(l.interval, (v) => set(label, 'interval', v), { 'data-lp': 'interval' })),
          field(t('laser.f-angle'), num(l.angle, (v) => set(label, 'angle', v), { 'data-lp': 'angle' })),
          field(t('laser.f-overscan'), num(l.overscan, (v) => set(label, 'overscan', v), { 'data-lp': 'overscan' })),
          check(t('laser.f-bidi'), l.bidirectional, (v) => set(label, 'bidirectional', v), { 'data-lp': 'bidirectional' }),
          l.mode === 'fill' ? check(t('laser.f-cross'), l.crosshatch, (v) => set(label, 'crosshatch', v), { 'data-lp': 'crosshatch' }) : null,
          l.mode === 'image' ? [
            field(t('laser.f-dither'), sel(l.dither, DITHER_NAMES.map((d) => [d, t('laser.dither-' + d)]), (v) => set(label, 'dither', v), { 'data-lp': 'dither' })),
            l.dither === 'threshold' ? field(t('laser.f-threshold'), num(l.threshold, (v) => set(label, 'threshold', v), { 'data-lp': 'threshold' })) : null,
            l.dither === 'gray' ? [field(t('laser.f-levels'), num(l.levels, (v) => set(label, 'levels', v), { 'data-lp': 'levels' })), field(t('laser.f-minpower'), num(l.minPower, (v) => set(label, 'minPower', v), { 'data-lp': 'minpower' }))] : null,
            field(t('laser.f-gamma'), num(l.gamma, (v) => set(label, 'gamma', v), { 'data-lp': 'gamma' })),
            check(t('laser.f-invert'), l.invert, (v) => set(label, 'invert', v), { 'data-lp': 'invert' })] : null))) : null,
      ];
    }).flat().filter(Boolean);
    return el('div', { className: C.block },
      head(t('laser.h-layers')),
      job.layers.length ? el('div', { className: 'lp-wrap' }, el('table', { className: C.table, 'data-lp-layers': '' },
        el('thead', {}, el('tr', {}, ...[t('laser.col-layer'), t('laser.col-mode'), t('laser.col-power'), t('laser.col-speed'), t('laser.col-passes')].map((h, i) => el('th', { scope: 'col', className: i > 1 ? 'n' : '' }, h)))),
        el('tbody', {}, ...rows))) : note(t('laser.no-layers')),
      note(t('laser.start-values')));
  }

  // ---- machine ----
  function machineBlock() {
    const m = current().machine;
    const set = (k, v) => change(t('laser.undo-machine'), (x) => { x.machine[k] = v; });
    return el('details', { className: C.block + ' lp-machine', 'data-lp-machine': '' }, el('summary', {}, t('laser.h-machine')),
      el('div', { className: 'lp-row' },
        field(t('laser.f-smax'), num(m.sMax, (v) => set('sMax', v), { 'data-lp': 'smax' })),
        field(t('laser.f-rapid'), num(m.rapid, (v) => set('rapid', v), { 'data-lp': 'rapid' })),
        field(t('laser.f-bedw'), num(m.bedW, (v) => set('bedW', v), { 'data-lp': 'bedw' })),
        field(t('laser.f-bedh'), num(m.bedH, (v) => set('bedH', v), { 'data-lp': 'bedh' })),
        field(t('laser.f-framepower'), num(m.framePower, (v) => set('framePower', v), { 'data-lp': 'framepower' })),
        field(t('laser.f-origin'), sel(current().origin, [['job', t('laser.origin-job')], ['drawing', t('laser.origin-drawing')]], (v) => change(t('laser.undo-machine'), (x) => { x.origin = v; }), { 'data-lp': 'origin' }))),
      el('div', { className: 'lp-row' },
        check(t('laser.f-dynamic'), m.dynamic, (v) => set('dynamic', v), { 'data-lp': 'dynamic' }),
        check(t('laser.f-lasermode'), m.setLaserMode, (v) => set('setLaserMode', v), { 'data-lp': 'lasermode' }),
        check(t('laser.f-air'), m.air, (v) => set('air', v), { 'data-lp': 'air' })),
      note(t('laser.machine-note')));
  }

  // ---- preview ----
  function previewCanvas(p, job) {
    const W = 640, H = 360;
    const cv = el('canvas', { width: W, height: H, className: 'lp-canvas', 'data-lp-canvas': '', role: 'img', 'aria-label': t('laser.preview-label') });
    const ctx = cv.getContext?.('2d');
    if (!ctx || !p.bounds) return cv;
    const bw = job.machine.bedW, bh = job.machine.bedH;
    const x0 = Math.min(0, p.bounds.x0), y0 = Math.min(0, p.bounds.y0);
    const x1 = Math.max(p.bounds.x1, bw || 0), y1 = Math.max(p.bounds.y1, bh || 0);
    const sc = Math.min((W - 20) / Math.max(x1 - x0, 1e-6), (H - 20) / Math.max(y1 - y0, 1e-6));
    const X = (x) => 10 + (x - x0) * sc, Y = (y) => H - 10 - (y - y0) * sc;
    ctx.clearRect(0, 0, W, H);
    if (bw > 0 && bh > 0) { ctx.strokeStyle = '#8a8f98'; ctx.setLineDash([4, 3]); ctx.strokeRect(X(0), Y(bh), bw * sc, bh * sc); ctx.setLineDash([]); }
    ctx.lineWidth = 1;
    for (const op of p.ops) {
      let px = 0, py = 0;
      for (const m of op.moves) {
        const fast = (m.start && !m.link) || m.rapid;
        if (m.s > 0) { ctx.strokeStyle = MODE_COLORS[op.mode] || '#c0392b'; ctx.beginPath(); ctx.moveTo(X(px), Y(py)); ctx.lineTo(X(m.x), Y(m.y)); ctx.stroke(); }
        else if (fast) { ctx.strokeStyle = 'rgba(138,143,152,0.35)'; ctx.beginPath(); ctx.moveTo(X(px), Y(py)); ctx.lineTo(X(m.x), Y(m.y)); ctx.stroke(); }
        px = m.x; py = m.y;
      }
    }
    ctx.strokeStyle = '#1b7f3b'; ctx.setLineDash([6, 4]); ctx.strokeRect(X(p.bounds.x0), Y(p.bounds.y1), (p.bounds.x1 - p.bounds.x0) * sc, (p.bounds.y1 - p.bounds.y0) * sc); ctx.setLineDash([]);
    return cv;
  }
  const mm = (v) => String(Math.round(v * 10) / 10);
  const dur = (s) => (s >= 3600 ? Math.floor(s / 3600) + ' h ' + Math.round((s % 3600) / 60) + ' min' : s >= 60 ? Math.round(s / 60) + ' min' : Math.max(1, Math.round(s)) + ' s');

  function previewBlock() {
    const { plan: p, job } = planNow();
    const out = [head(t('laser.h-preview'), btn(t('laser.save'), saveGcode, { 'data-lp-save': '', disabled: !p.ops.length }))];
    if (!p.ops.length) { out.push(note(t('laser.nothing'), { 'data-lp-nothing': '' })); for (const w of p.warnings) out.push(note(t('laser.warn-' + w.code, { layer: w.layer || '', w: mm(w.w || 0), h: mm(w.h || 0) }), { className: C.note + ' lp-warn' })); return el('div', { className: C.block }, ...out); }
    out.push(previewCanvas(p, job));
    out.push(note(t('laser.stats', { w: mm(p.bounds.x1 - p.bounds.x0), h: mm(p.bounds.y1 - p.bounds.y0), burn: mm(p.stats.burn), time: dur(p.stats.time), ops: p.ops.length }), { 'data-lp-stats': '' }));
    out.push(note(t('laser.est-note')));
    for (const w of p.warnings) out.push(note(t('laser.warn-' + w.code, { layer: w.layer || '', w: mm(w.w || 0), h: mm(w.h || 0) }), { className: C.note + ' lp-warn', 'data-lp-warn': w.code }));
    return el('div', { className: C.block }, ...out);
  }
  function saveGcode() {
    const { plan: p, job } = planNow();
    if (!p.ops.length) { host.print(t('laser.nothing')); return; }
    host.download(host.fileName() + '.gcode', gcode(job, p), 'text/plain');
    host.print(t('laser.saved', { n: gcodeLines(job, p).length }));
  }

  // ---- the machine connection ----
  async function connect() { const r = await link.connect(); if (!r.ok) host.print(t('laser.err-' + r.error)); else host.print(t('laser.connected')); host.rerender?.(); }
  async function frame() {
    const { plan: p, job, key } = planNow();
    if (!p.ops.length) return;
    const text = frameLines(job, p);
    if (!link.state.connected) { host.download(host.fileName() + '-frame.gcode', text.join('\n') + '\n', 'text/plain'); host.print(t('laser.frame-saved')); return; }
    const ok = await host.confirm(t('laser.confirm-frame'));
    if (!ok) return;
    const r = await link.sendLines(text, { confirmed: true });
    if (r.ok) { framedKey = key; host.print(t('laser.framed')); } else host.print(t('laser.err-send', { why: r.error }));
    host.rerender?.();
  }
  async function send() {
    const { plan: p, job, key } = planNow();
    if (!p.ops.length || framedKey !== key) return;
    const ok = await host.confirm(t('laser.confirm-send'));
    if (!ok) return;
    progress = { done: 0, total: 0 };
    host.print(t('laser.sending'));
    const r = await link.sendLines(gcodeLines(job, p, { comments: false }), { confirmed: true, onProgress: (q) => { progress = q; host.rerender?.(); } });
    progress = null;
    host.print(r.ok ? t('laser.sent', { n: r.sent }) : t('laser.err-send', { why: r.error }));
    host.rerender?.();
  }
  function machineLinkBlock() {
    const s = link.state, { key } = planNow();
    const framed = framedKey === key;
    const out = [head(t('laser.h-send'))];
    if (!GrblLink.supported(serial)) { out.push(note(t('laser.no-serial'), { 'data-lp-noserial': '' })); return el('div', { className: C.block }, ...out); }
    out.push(note(t('laser.send-note')));
    out.push(el('div', { className: 'lp-row' },
      s.connected ? btn(t('laser.disconnect'), async () => { await link.disconnect(); host.rerender?.(); }, { 'data-lp-disconnect': '' }) : el('button', { type: 'button', className: C.primary, onclick: connect, 'data-lp-connect': '' }, t('laser.connect')),
      btn(t('laser.frame'), frame, { 'data-lp-frame': '', disabled: s.running }),
      el('button', { type: 'button', className: C.primary, onclick: send, 'data-lp-send': '', disabled: !s.connected || !framed || s.running }, t('laser.send')),
      btn(s.hold ? t('laser.resume') : t('laser.pause'), () => (s.hold ? link.resume() : link.hold()), { 'data-lp-pause': '', disabled: !s.running }),
      el('button', { type: 'button', className: C.btn + ' lp-stop', onclick: () => link.stop().then(() => host.print(t('laser.stopped'))), 'data-lp-stop': '', disabled: !s.connected }, t('laser.stop'))));
    out.push(note(s.connected ? t('laser.state', { state: s.state || '…' }) + (framed ? ' ' + t('laser.is-framed') : ' ' + t('laser.frame-first')) : t('laser.not-connected'), { 'data-lp-state': '' }));
    if (progress && progress.total) out.push(el('progress', { value: progress.done, max: progress.total, className: 'lp-progress' }));
    if (lines.length) out.push(el('pre', { className: 'lp-log', 'data-lp-log': '' }, lines.slice(-8).join('\n')));
    return el('div', { className: C.block }, ...out);
  }

  return {
    panel() { return [el('p', { className: 'lp-aid', 'data-lp-aid': '' }, t('laser.aid')), layersBlock(), previewBlock(), machineLinkBlock(), machineBlock()]; },
    plan() { return planNow().plan; },
    refresh() { cache = null; },
    get link() { return link; },
    dispose() { link.disconnect(); },
  };
}
