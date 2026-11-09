/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui.js — the Factory floor panel (0.9 D8.13), one panel for every host (ModelCraft first, beside the flow add-on; SuperCad Studio next).
 * Machines and cells (from the flow layout), reading them live (monitor.js), the operator screen over the layout, the job queue, history
 * and OEE. Words come from the host's t() with English fallbacks in words.js. DOM text goes in through textContent only.
 *
 *   mountFactory(el, host) → { refresh(), start(), stop(), poll(), state(), machines(), recorder, monitor, jobs(), addJob(job), destroy() }
 *   host = { t, load() → saved | null, save(saved), layout() → flow layout | null, onLayout?(fn),
 *            overlay?: { root() → element over the 3D view, project([x,y,z]) → { x, y } | null }, raf?, caf?,
 *            send?: ccSendToMachine | null, fetch?: fetch | null, bridge?: () → ccStudioBridge | null, policy?: addressPolicy,
 *            download(name, text, type), pickFile(accept) → Promise<{ name, text } | null>, storage?: localStorage, confirm?(text) → boolean, Store?: LiveStore,
 *            setInterval?, clearInterval?, now? }
 */
import { wordsOf } from './words.js';
import { cleanConfig, machinesFrom, cleanSource, KINDS, PROTOCOLS, NODE_KEYS, nextMachineId } from './cells.js';
import { makeShop } from './sim.js';
import { makeRecorder, csvOee } from './record.js';
import { makeMonitor } from './monitor.js';
import { cleanJob, checkJob, sendJob, jobFile, readJobFile, jobFromProgram, outbox, STATES as JOB_STATES } from './jobs.js';
import { requestWrite, writeAllowed } from './guard.js';
import { makeReader } from './mtconnect.js';

export const CSS = `
.ff-p{display:flex;flex-direction:column;gap:.5rem;font-size:.85rem}
.ff-p fieldset{border:1px solid var(--line,#ccd);padding:.4rem .5rem;margin:0;display:flex;flex-direction:column;gap:.35rem}
.ff-p legend{font-weight:600;font-size:.8rem;padding:0 .2rem}
.ff-p .row{display:flex;flex-wrap:wrap;gap:.3rem;align-items:center}
.ff-p label{display:flex;justify-content:space-between;gap:.4rem;align-items:center}
.ff-p label>span{flex:1;color:var(--ink-2,#555)}
.ff-p input[type=number],.ff-p input[type=text],.ff-p select{width:8rem;max-width:60%;font:inherit;padding:.1rem .25rem}
.ff-p button{width:auto;flex:0 0 auto;font:inherit;padding:.15rem .5rem;border:1px solid var(--line,#99a);background:transparent;color:inherit;border-radius:2px;cursor:pointer}
.ff-p button.primary{border-width:2px;font-weight:600}
.ff-p button[aria-pressed=true]{background:var(--line,#dde)}
.ff-p table{width:100%;border-collapse:collapse}
.ff-p td,.ff-p th{padding:.1rem .2rem;border-bottom:1px solid var(--line,#dde);text-align:left;font-weight:normal}
.ff-p td.n{text-align:right;font-variant-numeric:tabular-nums}
.ff-p .msg{color:var(--ink-2,#555);margin:0}
.ff-p .bad{color:#b3122e}
.ff-st{display:inline-block;min-width:4.5rem;padding:0 .3rem;border-radius:2px;color:#fff;text-align:center;font-size:.75rem}
.ff-running{background:#1f7a3a}.ff-idle{background:#8a6d00}.ff-stopped{background:#b55a00}.ff-setup{background:#4b5bb3}.ff-down{background:#b3122e}.ff-offline{background:#666}.ff-planned{background:#3a6f8f}
.ff-ov{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5}
.ff-tag{position:absolute;transform:translate(-50%,-100%);background:rgba(20,22,28,.86);color:#fff;border-radius:3px;padding:.15rem .35rem;font:12px/1.3 system-ui,sans-serif;white-space:nowrap;border-left:4px solid #666}
.ff-tag b{font-weight:600}.ff-tag .a{color:#ff9aa8}
.ff-tag.ff-running{border-left-color:#3ccf6a;background:rgba(20,22,28,.86)}.ff-tag.ff-down{border-left-color:#ff4d6a;background:rgba(60,10,18,.9)}.ff-tag.ff-idle{border-left-color:#f0c419;background:rgba(20,22,28,.86)}
.ff-tag.ff-stopped{border-left-color:#ff9a3c;background:rgba(20,22,28,.86)}.ff-tag.ff-setup{border-left-color:#8f9cff;background:rgba(20,22,28,.86)}.ff-tag.ff-offline{background:rgba(20,22,28,.7)}.ff-tag.ff-planned{border-left-color:#7cc3ea;background:rgba(20,22,28,.86)}
`;
const BADMSG = 'msg bad';   // i18n-ignore (class names)
const SPEEDS = [1, 60, 600], POLLS = [1, 2, 5, 10, 30], PERIODS = [['hour', 3600e3], ['shift', 8 * 3600e3], ['all', Infinity]];

export function mountFactory(el, host) {
  const t = wordsOf(host.t), d = el.ownerDocument;
  const now = host.now || (() => Date.now());
  const SI = host.setInterval || ((f, ms) => setInterval(f, ms)), CI = host.clearInterval || ((h) => clearInterval(h));
  const raf = host.raf || ((f) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(f) : setTimeout(f, 50)));
  const caf = host.caf || ((h) => (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame(h) : clearTimeout(h)));
  function h(tag, attrs = {}, ...kids) {
    const n = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (v === undefined || v === null || v === false) continue; if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : String(v)); }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : d.createTextNode(String(c)));
    return n;
  }

  // ------------------------------------------------------------------------------------------------ state
  const saved = (host.load && host.load()) || {};
  let config = cleanConfig(saved.config);
  let jobs = (Array.isArray(saved.jobs) ? saved.jobs : []).map(cleanJob).filter(Boolean).slice(-200);
  let seed = Number.isInteger(saved.seed) ? saved.seed : 7, pollS = POLLS.includes(saved.pollS) ? saved.pollS : 2, speed = 1, period = 'all';
  const recorder = makeRecorder(); recorder.load(saved.history);
  let sel = null, running = false, timer = null, overlayOn = !!saved.overlay, ovEl = null, ovRaf = 0, msg = '', bad = false, lastSave = 0, probeList = null;
  let clockT = null, clockReal = 0;
  const clock = () => { const r = now(); if (clockT === null) { clockT = r; clockReal = r; } clockT += (r - clockReal) * speed; clockReal = r; return Math.round(clockT); };
  let shop = null, shopKey = '';
  let mon = null;
  const persist = (force = false) => {
    const tt = now(); if (!force && tt - lastSave < 10000) return; lastSave = tt;
    host.save && host.save({ config, jobs, seed, pollS, overlay: overlayOn, history: recorder.toJSON() });
  };
  const say = (text, isBad = false) => { msg = text; bad = isBad; const m = el.querySelector('[data-ff-msg]'); if (m) { m.textContent = text; m.className = isBad ? BADMSG : 'msg'; } };

  const machines = () => machinesFrom(host.layout ? host.layout() : null, config);
  const allSim = () => { const ms = machines().filter((m) => m.source.protocol !== 'none'); return ms.length > 0 && ms.every((m) => m.source.protocol === 'sim'); };
  function ensureShop() {
    const sims = machines().filter((m) => m.source.protocol === 'sim');
    const flow = new Map(((host.layout && host.layout()) || { items: [] }).items.map((i) => [i.id, i]));
    const spec = sims.map((m) => { const p = (flow.get(m.id) || {}).params || {}; const c = m.idealCycleS || 30; return { id: m.id, name: m.name, cycleS: c * 1.12, mtbfH: Number(p.mtbf) > 0 ? Number(p.mtbf) : 1.5, mttrMin: Number(p.mttr) > 0 ? Number(p.mttr) : 8, scrap: 0.03, pauseEvery: 12, pauseS: c * 2 }; });
    const key = seed + '|' + JSON.stringify(spec);
    if (key === shopKey && shop) return;
    shopKey = key; shop = makeShop({ seed, machines: spec, start: clock() });
    mon = makeMonitor({ shop, fetch: host.fetch || null, bridge: host.bridge || (() => null), recorder, Store: host.Store || null, now: clock, policy: host.policy || null });
  }
  ensureShop();

  // ------------------------------------------------------------------------------------------------ reading
  let lastPoll = [];
  async function poll() {
    ensureShop();
    lastPoll = await mon.poll(machines());
    persist(); live(); return lastPoll;
  }
  function start() { if (running) return; running = true; speed = allSim() ? speed : 1; poll(); timer = SI(() => { poll(); }, pollS * 1000); say(t('factory.mon.started')); render(); }
  function stop() { if (!running) return; running = false; CI(timer); timer = null; persist(true); say(t('factory.mon.stopped')); render(); }

  // ------------------------------------------------------------------------------------------------ the operator screen over the layout
  function overlay() {
    const root = host.overlay && host.overlay.root && host.overlay.root();
    if (!overlayOn || !root) { if (ovEl) { ovEl.remove(); ovEl = null; } caf(ovRaf); ovRaf = 0; return; }
    if (!ovEl || !ovEl.isConnected) { ovEl = h('div', { class: 'ff-ov', 'data-ff-overlay': '' }); if (getComputedStyle(root).position === 'static') root.style.position = 'relative'; root.append(ovEl); }
    const ms = machines().filter((m) => m.at);
    ovEl.replaceChildren(...ms.map((m) => {
      const r = lastPoll.find((x) => x.id === m.id), st = r ? r.state || 'offline' : 'offline', snap = mon.snap(m.id), o = recorder.oee(m.id, { idealCycleS: m.idealCycleS });
      const vals = mon.values(m.id).slice(0, 2).map((v) => `${v.name} ${v.value === null ? '--' : +Number(v.value).toPrecision(4)}`);
      const al = recorder.openAlarms(m.id)[0] || null, lim = mon.values(m.id).find((v) => v.state === 'high' || v.state === 'low');
      return h('div', { class: 'ff-tag ff-' + st, 'data-ff-tag': m.id },
        h('b', { text: m.name }), ' ', t('factory.state.' + st),
        h('br'), t('factory.ov.parts', { n: o.seen ? o.total : 0 }) + (o.oee !== null && o.oee !== undefined ? ' · OEE ' + Math.round(o.oee * 100) + ' %' : ''),   // i18n-ignore (separator, unit)
        vals.length ? [h('br'), vals.join('  ')] : null,
        al ? [h('br'), h('span', { class: 'a', text: '⚠ ' + al.text })] : lim ? [h('br'), h('span', { class: 'a', text: '⚠ ' + t('factory.ov.limit', { name: lim.name }) })] : null,
        snap && snap.program ? [h('br'), t('factory.ov.program', { p: snap.program })] : null);
    }));
    place();
  }
  function place() {
    caf(ovRaf); ovRaf = 0;
    if (!ovEl || !overlayOn) return;
    const ms = new Map(machines().map((m) => [m.id, m]));
    for (const tag of ovEl.children) { const m = ms.get(tag.getAttribute('data-ff-tag')); const p = m && host.overlay.project(m.at); if (p) { tag.style.display = ''; tag.style.left = p.x + 'px'; tag.style.top = p.y + 'px'; } else tag.style.display = 'none'; }
    ovRaf = raf(place);
  }

  // ------------------------------------------------------------------------------------------------ the panel
  const num = (label, value, onset, attrs = {}) => h('label', {}, h('span', { text: label }), h('input', { type: 'number', step: 'any', value: value ?? '', ...attrs, onchange: (e) => { const v = e.target.value === '' ? null : Number(e.target.value); if (v === null || Number.isFinite(v)) onset(v); } }));
  const txt = (label, value, onset, attrs = {}) => h('label', {}, h('span', { text: label }), h('input', { type: 'text', value: value ?? '', ...attrs, onchange: (e) => onset(e.target.value) }));
  const choice = (label, value, opts, onset, attrs = {}) => h('label', {}, h('span', { text: label }), h('select', { ...attrs, onchange: (e) => onset(e.target.value) }, opts.map(([v, l]) => h('option', { value: v, selected: String(v) === String(value), text: l }))));
  const btn = (key, fn, attrs = {}) => h('button', { type: 'button', text: t(key), 'data-ff-act': key, ...attrs, onclick: () => { Promise.resolve().then(fn).catch((e) => say(String((e && e.message) || e), true)); } });
  const mc = (id) => (config.machines[id] = config.machines[id] || {});
  const setM = (id, fn) => { const m = machines().find((x) => x.id === id); const cur = mc(id); cur.name = cur.name || m.name; cur.cell = cur.cell || m.cell; cur.kind = cur.kind || m.kind; cur.source = cur.source || m.source; fn(cur); config = cleanConfig(config); mon.forget(id); ensureShop(); persist(true); render(); };
  const pct = (v) => (v === null || v === undefined ? '--' : (v * 100).toFixed(1) + ' %');
  const spark = (pts) => {
    const W = 80, H = 18; if (pts.length < 2) return h('span', { text: '' });
    const xs = pts.map((p) => p.t), ys = pts.map((p) => p.value), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + (((p.t - x0) / ((x1 - x0) || 1)) * W).toFixed(1) + ' ' + (H - ((p.value - y0) / ((y1 - y0) || 1)) * (H - 2) - 1).toFixed(1)).join(' ');
    const svg = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
    const p = d.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', path); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.2'); svg.append(p); return svg;
  };

  function machineDetail(m) {
    const c = config.machines[m.id] || {}, s = m.source;
    const f = h('fieldset', { 'data-ff-machine': m.id }, h('legend', { text: m.name }));
    f.append(txt(t('factory.m.name'), m.name, (v) => setM(m.id, (x) => { x.name = v; })),
      choice(t('factory.m.cell'), m.cell, config.cells.map((cl) => [cl.id, cl.name]), (v) => setM(m.id, (x) => { x.cell = v; })),
      choice(t('factory.m.kind'), m.kind, KINDS.map((k) => [k, t('factory.kind.' + k)]), (v) => setM(m.id, (x) => { x.kind = v; })),
      num(t('factory.m.cycle'), m.idealCycleS, (v) => setM(m.id, (x) => { x.idealCycleS = v; }), { min: 0 }),
      txt(t('factory.m.post'), m.post, (v) => setM(m.id, (x) => { x.post = v; }), { placeholder: t('factory.m.postHint') }),
      choice(t('factory.m.source'), s.protocol, PROTOCOLS.map((p) => [p, t('factory.proto.' + p)]), (v) => setM(m.id, (x) => { x.source = cleanSource({ ...x.source, protocol: v }); }), { 'data-ff-protocol': '' }));
    const setS = (k) => (v) => setM(m.id, (x) => { x.source = cleanSource({ ...x.source, [k]: v }); });
    if (s.protocol === 'mtconnect') {
      f.append(txt(t('factory.src.base'), s.base, setS('base'), { placeholder: 'http://192.168.1.20:5000', 'data-ff-base': '' }), txt(t('factory.src.device'), s.device, setS('device'), { 'data-ff-device': '' }),
        h('p', { class: 'msg', text: t(host.bridge && host.bridge() && host.bridge().hostFetch ? 'factory.src.viaStudio' : 'factory.src.viaPage') }),
        h('div', { class: 'row' }, btn('factory.src.probe', async () => {
          const b = host.bridge && host.bridge(), f2 = b && b.hostFetch ? (u) => b.hostFetch(u, { method: 'GET' }) : host.fetch;
          if (!f2) { say(t('factory.err.transport'), true); return; }
          const devs = await makeReader({ base: s.base, device: '', fetch: f2 }).probe(); probeList = { id: m.id, devs };
          say(t('factory.src.probed', { n: devs.filter((x) => !x.agent).length })); render();
        })));
      if (probeList && probeList.id === m.id) f.append(h('ul', { class: 'msg' }, probeList.devs.filter((x) => !x.agent).map((x) => h('li', {}, h('button', { type: 'button', text: x.name, onclick: () => setS('device')(x.name) }), ' ' + t('factory.src.items', { n: x.dataItems.length })))));
    } else if (['opcua', 'mqtt', 'modbus', 'bacnet'].includes(s.protocol)) {
      f.append(txt(t('factory.src.host'), s.host, setS('host')), num(t('factory.src.port'), s.port, (v) => setS('port')(v === null ? undefined : Math.round(v)), { min: 1, max: 65535, step: 1 }));
      if (s.protocol === 'modbus') f.append(num(t('factory.src.unit'), s.unit, (v) => setS('unit')(v === null ? undefined : Math.round(v)), { min: 0, max: 255, step: 1 }));
      for (const k of NODE_KEYS) f.append(txt(t('factory.node.' + k), (s.nodes || {})[k], (v) => setM(m.id, (x) => { x.source = cleanSource({ ...x.source, nodes: { ...(x.source.nodes || {}), [k]: v } }); })));
      f.append(h('p', { class: 'msg', text: t(host.bridge && host.bridge() ? 'factory.src.bridge' : 'factory.src.needsStudio') }));
    } else if (s.protocol === 'sim') f.append(h('p', { class: 'msg', text: t('factory.src.sim') }));
    if (s.protocol !== 'sim' && s.protocol !== 'none') f.append(h('label', { title: t('factory.src.approveHint') }, h('span', { text: t('factory.src.approve') }), h('input', { type: 'checkbox', checked: !!s.approved, onchange: (e) => setS('approved')(e.target.checked) })));
    // limits on the values seen
    const vals = mon.values(m.id);
    if (vals.length) {
      const lim = (mc(m.id).limits = mc(m.id).limits || {});
      const box = h('details', {}, h('summary', { text: t('factory.m.limits', { n: vals.length }) }));
      for (const v of vals) box.append(h('div', { class: 'row' }, h('span', { text: v.name }),
        num(t('factory.m.low'), (lim[v.name] || {}).low, (x) => { lim[v.name] = { ...(lim[v.name] || {}), low: x ?? undefined }; persist(true); }),
        num(t('factory.m.high'), (lim[v.name] || {}).high, (x) => { lim[v.name] = { ...(lim[v.name] || {}), high: x ?? undefined }; persist(true); })));
      f.append(box);
    }
    // planned stop; writing (off by default, a yes to switch on, a confirm per write; no write channel exists)
    f.append(h('div', { class: 'row' },
      btn(recorder.isPlanned(m.id) ? 'factory.m.plannedEnd' : 'factory.m.planned', () => { recorder.plan(m.id, !recorder.isPlanned(m.id), clock()); persist(true); render(); }, { 'aria-pressed': recorder.isPlanned(m.id) ? 'true' : 'false' }),
      m.fromLayout ? null : btn('factory.m.remove', () => { config.extra = config.extra.filter((x) => x !== m.id); delete config.machines[m.id]; sel = null; mon.forget(m.id); ensureShop(); persist(true); render(); })));
    const w = h('fieldset', { 'data-ff-write': m.id }, h('legend', { text: t('factory.w.title') }), h('p', { class: 'msg', text: t('factory.w.note') }),
      h('label', {}, h('span', { text: t('factory.w.allow') }), h('input', { type: 'checkbox', 'data-ff-write-allow': '', checked: writeAllowed(m), onchange: (e) => {
        if (e.target.checked && !(host.confirm ? host.confirm(t('factory.w.allowAsk', { name: m.name })) : false)) { e.target.checked = false; return; }
        setM(m.id, (x) => { x.write = e.target.checked; });
      } })));
    if (writeAllowed(m)) {
      const node = h('input', { type: 'text', 'aria-label': t('factory.w.node'), placeholder: t('factory.w.node'), 'data-ff-write-node': '' }), val = h('input', { type: 'text', 'aria-label': t('factory.w.value'), placeholder: t('factory.w.value'), 'data-ff-write-value': '' });
      w.append(h('div', { class: 'row' }, node, val, btn('factory.w.write', async () => {
        const confirmed = host.confirm ? host.confirm(t('factory.w.ask', { value: val.value, node: node.value, name: m.name })) : false;
        const r = await requestWrite(m, { node: node.value.trim(), value: val.value }, { confirmed, bridge: host.bridge && host.bridge() });
        say(t('factory.w.r.' + r.code), !r.ok);
      })));
    }
    f.append(w);
    return f;
  }

  function jobsPanel(ms) {
    const ob = outbox(host.storage || null), waiting = host.storage ? ob.list().length : 0;
    const f = h('fieldset', { 'data-ff-jobs': '' }, h('legend', { text: t('factory.jobs.title', { n: jobs.filter((j) => j.state === 'queued').length }) }), h('p', { class: 'msg', text: t('factory.jobs.note') }));
    f.append(h('div', { class: 'row' },
      btn('factory.jobs.openProgram', async () => { const r = await host.pickFile('.nc,.ngc,.gcode,.gco,.tap,.cnc,.g,.nc1,.txt'); if (!r) return; const j = jobFromProgram(r.name, r.text, { from: { app: 'file' } }); if (!j.file || !/\./.test(j.file)) { say(t('factory.jobs.badFile'), true); return; } addJob(j); }),
      btn('factory.jobs.openJob', async () => { const r = await host.pickFile('.json,.ccjob.json,application/json'); if (!r) return; const j = readJobFile(r.text); if (!j) { say(t('factory.jobs.notJob'), true); return; } addJob(j); }),
      host.storage ? btn('factory.jobs.take', () => { const got = ob.take(); for (const j of got) jobs.push(j); persist(true); say(t('factory.jobs.taken', { n: got.length })); render(); }, { disabled: !waiting, 'data-ff-outbox': String(waiting) }) : null));
    if (host.storage) f.append(h('p', { class: 'msg', text: t('factory.jobs.waiting', { n: waiting }) }));
    if (!host.send) f.append(h('p', { class: 'msg', text: t('factory.jobs.needsStudio') }));
    if (jobs.length) {
      const tb = h('table', {}, h('tr', {}, ...['factory.jobs.h.job', 'factory.jobs.h.machine', 'factory.jobs.h.state', ''].map((k) => h('th', { text: k ? t(k) : '' }))));
      for (const j of jobs.slice(-30).reverse()) {
        const mm = ms.find((x) => x.id === j.machine) || null, lp = lastPoll.find((x) => x.id === j.machine);
        const probs = checkJob(j, mm, { live: lp ? lp.state : null });
        tb.append(h('tr', { 'data-ff-job': j.id },
          h('td', { title: j.post ? t('factory.jobs.post', { post: j.post }) : '' }, j.name, j.from.app ? h('br') : null, j.from.app ? h('span', { class: 'msg', text: t('factory.jobs.from', { app: j.from.app, part: j.from.part }) }) : null),
          h('td', {}, h('select', { 'aria-label': t('factory.jobs.h.machine'), disabled: j.state !== 'queued', onchange: (e) => { j.machine = e.target.value; persist(true); render(); } }, h('option', { value: '', text: t('factory.jobs.pick') }), ms.map((x) => h('option', { value: x.id, selected: x.id === j.machine, text: x.name })))),
          h('td', {}, t('factory.jobs.s.' + j.state), probs.length ? [h('br'), h('span', { class: probs.some((p) => p.severity === 'error') ? BADMSG : 'msg', text: probs.map((p) => t('factory.jobs.p.' + p.code)).join(' ') })] : null),
          h('td', {}, h('div', { class: 'row' },
            j.state === 'queued' ? btn('factory.jobs.send', async () => {
              const r = await sendJob(j, mm, { send: host.send, now: now() }); persist(true);
              say(r.ok ? t('factory.jobs.sent', { name: j.name, machine: mm.name }) : t('factory.jobs.r.' + r.code, { error: r.error || '' }), !r.ok && r.code !== 'cancelled'); render();
            }, { disabled: !host.send || probs.some((p) => p.severity === 'error'), title: t('factory.jobs.sendHint') }) : null,
            j.state === 'sent' ? btn('factory.jobs.done', () => { j.state = 'done'; persist(true); render(); }) : null,
            j.state === 'queued' || j.state === 'failed' ? btn('factory.jobs.cancel', () => { j.state = 'cancelled'; persist(true); render(); }) : null,
            j.state === 'failed' ? btn('factory.jobs.retry', () => { j.state = 'queued'; persist(true); render(); }) : null,
            btn('factory.jobs.save', () => host.download((j.name || 'job').replace(/[^A-Za-z0-9._-]+/g, '-') + '.ccjob.json', jobFile(j), 'application/json'))))));
      }
      f.append(tb);
    }
    return f;
  }

  function live() {
    const box = el.querySelector('[data-ff-live]'); if (!box) return;
    const ms = machines(), win = PERIODS.find((p) => p[0] === period)[1], tt = clock();
    const tb = h('table', { 'data-ff-status': '' }, h('tr', {}, ...['factory.mon.h.machine', 'factory.mon.h.state', 'factory.mon.h.parts', 'OEE', 'factory.mon.h.trend'].map((k) => h('th', { text: k === 'OEE' ? 'OEE' : t(k) }))));
    for (const m of ms) {
      const r = lastPoll.find((x) => x.id === m.id), st = r ? r.state || 'offline' : 'offline', o = recorder.oee(m.id, { from: tt - win, to: tt, idealCycleS: m.idealCycleS });
      const v = mon.values(m.id)[0];
      tb.append(h('tr', { 'data-ff-row': m.id }, h('td', { text: m.name }), h('td', {}, h('span', { class: 'ff-st ff-' + st, 'data-ff-state': st, text: t('factory.state.' + st) }), r && !r.ok && r.code ? h('div', { class: 'msg', text: t('factory.err.' + r.code, { why: r.message || '' }) }) : null),
        h('td', { class: 'n', text: o.seen ? `${o.total} (${o.bad})` : '--' }), h('td', { class: 'n', text: o.seen ? pct(o.oee) : '--' }), h('td', { title: v ? v.name : '' }, v ? spark(mon.trend(m.id, v.name)) : '')));
    }
    const open = ms.flatMap((m) => recorder.openAlarms(m.id).map((a) => ({ ...a, name: m.name })));
    const lim = mon.problems().filter((p) => p.code === 'live.high' || p.code === 'live.low');
    box.replaceChildren(tb,
      h('p', { class: open.length || lim.length ? BADMSG : 'msg', 'data-ff-alarms': String(open.length + lim.length) }, open.length || lim.length ? [...open.map((a) => `⚠ ${a.name}: ${a.text}`), ...lim.map((p) => '⚠ ' + p.text)].join(' · ') : t('factory.mon.noAlarms')));   // i18n-ignore (marks)
    const oe = el.querySelector('[data-ff-oee]'); if (oe) oe.replaceChildren(oeeTable(ms, tt - win, tt));
    overlay();
  }
  function oeeRows(ms, from, to) { return ms.map((m) => ({ ...recorder.oee(m.id, { from, to, idealCycleS: m.idealCycleS }), name: m.name })); }
  function oeeTable(ms, from, to) {
    const rows = oeeRows(ms, from, to).filter((r) => r.seen);
    if (!rows.length) return h('p', { class: 'msg', text: t('factory.oee.none') });
    return h('table', {}, h('tr', {}, ...['factory.mon.h.machine', 'factory.oee.a', 'factory.oee.p', 'factory.oee.q', 'OEE'].map((k) => h('th', { text: k === 'OEE' ? 'OEE' : t(k) }))),
      rows.map((r) => h('tr', { 'data-ff-oee-row': r.id }, h('td', { text: r.name }), h('td', { class: 'n', text: pct(r.availability) }), h('td', { class: 'n', text: pct(r.performance), title: r.performanceMeasured > 1 ? t('factory.oee.over', { p: pct(r.performanceMeasured) }) : '' }), h('td', { class: 'n', text: pct(r.quality) }), h('td', { class: 'n', text: pct(r.oee) }))));
  }

  function render() {
    const ms = machines();
    if (sel && !ms.some((m) => m.id === sel)) sel = null;
    const p = h('div', { class: 'ff-p' });
    p.append(h('p', { class: 'msg', text: t('factory.lede') }), h('p', { class: 'msg', 'data-ff-safety': '', text: t('factory.safety') }));
    // machines and cells
    const flowN = ((host.layout && host.layout()) || { items: [] }).items.filter((i) => i.kind === 'station').length;
    const mf = h('fieldset', { 'data-ff-machines': '' }, h('legend', { text: t('factory.m.title', { n: ms.length }) }),
      h('p', { class: 'msg', text: flowN ? t('factory.m.fromFlow', { n: flowN }) : t('factory.m.noFlow') }),
      h('div', { class: 'row' },
        btn('factory.m.add', () => { const id = nextMachineId(ms); config.extra.push(id); config.machines[id] = { name: t('factory.m.newName', { n: id.split('-')[1] }), source: { protocol: 'sim' } }; config = cleanConfig(config); sel = id; ensureShop(); persist(true); render(); }),
        btn('factory.c.add', () => { let n = config.cells.length + 1; while (config.cells.some((c) => c.id === 'cell-' + n)) n++; config.cells.push({ id: 'cell-' + n, name: t('factory.c.name', { n }) }); persist(true); render(); }),
        btn('factory.m.allSim', () => { for (const m of ms) { const c = mc(m.id); c.name = c.name || m.name; c.source = { protocol: 'sim' }; } config = cleanConfig(config); for (const m of ms) mon.forget(m.id); ensureShop(); persist(true); say(t('factory.m.allSimDone')); render(); }, { disabled: !ms.length })));
    for (const c of config.cells) {
      const inCell = ms.filter((m) => m.cell === c.id);
      mf.append(h('div', { 'data-ff-cell': c.id }, h('div', { class: 'row' }, h('input', { type: 'text', value: c.name, 'aria-label': t('factory.c.rename'), onchange: (e) => { c.name = e.target.value.slice(0, 60) || c.id; persist(true); render(); } }), h('span', { class: 'msg', text: t('factory.c.count', { n: inCell.length }) })),
        inCell.length ? h('div', { class: 'row' }, inCell.map((m) => h('button', { type: 'button', 'aria-pressed': m.id === sel ? 'true' : 'false', 'data-ff-pick': m.id, text: m.name + ' · ' + t('factory.proto.' + m.source.protocol), onclick: () => { sel = sel === m.id ? null : m.id; render(); } }))) : null));   // i18n-ignore (separator)
    }
    p.append(mf);
    const m = ms.find((x) => x.id === sel); if (m) p.append(machineDetail(m));
    // monitoring
    const sim = allSim();
    p.append(h('fieldset', { 'data-ff-monitor': '' }, h('legend', { text: t('factory.mon.title') }),
      h('div', { class: 'row' },
        running ? btn('factory.mon.stop', stop) : btn('factory.mon.start', start, { class: 'primary', disabled: !ms.length }),
        btn('factory.mon.once', () => poll(), { disabled: !ms.length || running })),
      choice(t('factory.mon.every'), pollS, POLLS.map((s) => [s, t('factory.mon.s', { n: s })]), (v) => { pollS = Number(v); if (running) { CI(timer); timer = SI(() => { poll(); }, pollS * 1000); } persist(true); }),
      sim ? choice(t('factory.mon.speed'), speed, SPEEDS.map((s) => [s, t('factory.mon.x', { n: s })]), (v) => { clock(); speed = Number(v); }, { 'data-ff-speed': '' }) : null,
      sim ? num(t('factory.mon.seed'), seed, (v) => { seed = Math.max(0, Math.round(v || 0)); for (const x of ms) mon.forget(x.id); ensureShop(); persist(true); }, { min: 0, step: 1 }) : null,
      sim ? h('p', { class: 'msg', text: t('factory.mon.simNote') }) : null,
      host.overlay ? h('label', {}, h('span', { text: t('factory.ov.show') }), h('input', { type: 'checkbox', 'data-ff-overlay-on': '', checked: overlayOn, onchange: (e) => { overlayOn = e.target.checked; persist(true); overlay(); } })) : null,
      h('div', { 'data-ff-live': '' })));
    p.append(jobsPanel(ms));
    // history and OEE
    p.append(h('fieldset', { 'data-ff-history': '' }, h('legend', { text: t('factory.oee.title') }), h('p', { class: 'msg', text: t('factory.oee.note') }),
      choice(t('factory.oee.period'), period, PERIODS.map(([k]) => [k, t('factory.oee.per.' + k)]), (v) => { period = v; live(); }),
      h('div', { 'data-ff-oee': '' }),
      h('div', { class: 'row' },
        btn('factory.oee.csv', () => { const tt = clock(), win = PERIODS.find((x) => x[0] === period)[1]; host.download('factory-oee.csv', csvOee(oeeRows(machines(), tt - win, tt)), 'text/csv'); }),
        btn('factory.oee.states', () => host.download('factory-states.csv', recorder.csvStates(), 'text/csv')),
        btn('factory.oee.clear', () => { if (host.confirm && !host.confirm(t('factory.oee.clearAsk'))) return; recorder.clear(); persist(true); render(); })),
      (() => { const al = recorder.alarms().slice(-10).reverse(); return al.length ? h('details', {}, h('summary', { text: t('factory.oee.alarms', { n: recorder.alarms().length }) }), h('ul', { class: 'msg' }, al.map((a) => h('li', { text: `${new Date(a.from).toISOString().slice(11, 19)} ${(ms.find((x) => x.id === a.machine) || { name: a.machine }).name}: ${a.text}${a.to ? '' : ' (' + t('factory.oee.open') + ')'}` })))) : null; })()));
    p.append(h('p', { class: msg && bad ? BADMSG : 'msg', role: 'status', 'data-ff-msg': '', text: msg }));
    el.replaceChildren(p);
    live();
  }
  function addJob(j) { const c = cleanJob(j); if (!c) return null; jobs.push(c); jobs = jobs.slice(-200); persist(true); say(t('factory.jobs.added', { name: c.name })); render(); return c; }
  if (host.onLayout) host.onLayout(() => { ensureShop(); render(); });
  render();
  return {
    refresh: render, start, stop, poll, state: () => ({ running, speed, pollS, overlay: overlayOn, sel }), machines, recorder, get monitor() { return mon; }, jobs: () => jobs, addJob,
    select(id) { sel = id; render(); }, setSpeed(s) { clock(); speed = SPEEDS.includes(s) ? s : 1; }, clock, setPeriod(p) { period = p; live(); },
    load(savedState) { const s = savedState || {}; config = cleanConfig(s.config); jobs = (Array.isArray(s.jobs) ? s.jobs : []).map(cleanJob).filter(Boolean); recorder.load(s.history); shopKey = ''; ensureShop(); render(); },
    destroy() { if (running) { CI(timer); running = false; } persist(true); caf(ovRaf); if (ovEl) ovEl.remove(); ovEl = null; },
  };
}
export { JOB_STATES };
