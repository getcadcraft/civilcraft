/* SPDX-License-Identifier: Apache-2.0 */
/**
 * connect-ui.js — "Connect to a device" and the tag map (0.8 XE.9, chem-mount_PART_5): one panel for the P&ID add-on (CadCraft) and the Plant add-on (BimCraft). The person lists the devices
 * (Modbus TCP, MQTT, BACnet/IP, OPC UA), types or pastes the tag map as a table, checks it (Problems words, a public address needs a yes per host), tries it with a CSV of readings
 * (works anywhere), or reads the devices through Studio when Studio's bridge is there. Read only: nothing here writes to a device. DOM text goes in through textContent.
 *
 *   mountConnect(el, { t, load(), save(state), onReadings(store, tags), bridge?() , download?, publish?, drawingTags?() }) → { check(), readCsv(text), readDevices(), loadHistory(hours, range?), fill(), poll(seconds), stop(), store(), trend(), state(), refresh() }
 *     0.11 IND.12: ONE store for the panel's life (LiveStore.define keeps the values of tags that stay), so every read adds to the trend; "Keep reading every N s" (Studio only;
 *     stop() and the host's deactivate end it); "Load history" asks bridge.opcua.history(nodeId, from, to) → [{ value, quality|statusCode, sourceTime|time }] for every OPC UA tag;
 *     drawingTags() → the drawing's tags, for "Fill the map from the drawing" (rows with the tag as target and the address left for the person); the Trend section draws
 *     trend.js's layout as SVG (limit lines, gaps) and saves it as CSV.
 *     state  { devices: [device], csv: 'tag map table' }       saved by the host (add-on storage), so it goes with the drawing's person and machine, never a secret
 *     bridge()  → the Studio bridge or null. Contract for Studio's native side (one function per protocol, read once):
 *               bridge.live.read({ protocol, host, port, unit?, nodes: [address…] }) → Promise<[{ node, value, quality: 'good'|'uncertain'|'bad', at }]>
 *               (the host opens the socket after the person said yes to that host; OPC UA keeps the older bridge.opcua.read(nodeIds))
 *     onReadings(store, tags)  called after readings are applied: the host paints them on the drawing or the model
 */
import * as TM from './tagmap.js';
import { wordsOf } from './connect-words.js';
import { studioBridge } from './read.js';
import { LiveStore } from './store.js';
import { trendOf, trendCsv } from './trend.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const pad2 = (n) => String(n).padStart(2, '0');
const timeLabel = (ms, stepS) => { const d = new Date(ms); return stepS >= 86400 ? d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) : (stepS >= 3600 * 6 ? pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' : '') + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + (stepS < 60 ? ':' + pad2(d.getSeconds()) : ''); };
const qualOf = (r) => { const q = String(r.quality ?? r.statusCode ?? 'good').toLowerCase(); return /^good/.test(q) ? 'good' : /^unc/.test(q) ? 'uncertain' : 'bad'; };

export function mountConnect(el, { t: t0, load, save, onReadings = () => {}, bridge = () => globalThis.ccStudioBridge || studioBridge() || null, download = null, publish = () => {}, drawingTags = null }) {
  const t = wordsOf(t0), d = el.ownerDocument, mk = (tag, cls, text) => { const n = d.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const st = (() => { const s = load() || {}; return { devices: Array.isArray(s.devices) ? s.devices : [], csv: typeof s.csv === 'string' ? s.csv : TM.TEMPLATE }; })();
  const persist = () => save({ devices: st.devices, csv: st.csv });
  const attr = (n, k, v = '') => { n.setAttribute(k, v); return n; };
  const out = attr(mk('div'), 'data-live-out'); out.setAttribute('aria-live', 'polite');
  const say = (text, bad = false) => { out.replaceChildren(mk('p', bad ? 'text-danger' : '', text)); };
  const devBox = attr(mk('ul', 'meta-items'), 'data-live-devices');
  const field = (label, node) => { const l = mk('label'); l.style.cssText = 'display:inline-flex;gap:0.25rem;align-items:center;margin:0 0.5rem 0.25rem 0'; l.append(mk('span', '', label), node); return l; };
  const inp = (name, ph, w) => { const i = d.createElement('input'); i.className = 'form-control'; i.name = name; i.placeholder = ph; i.setAttribute('aria-label', ph); i.style.width = w; i.setAttribute('data-live-' + name, ''); return i; };
  const idI = inp('id', t('live.dev.id'), '6rem'), hostI = inp('host', t('live.dev.host'), '10rem'), portI = inp('port', t('live.dev.port'), '5rem'), unitI = inp('unit', t('live.dev.unit'), '4rem');
  const proto = d.createElement('select'); proto.className = 'select-cc'; proto.setAttribute('data-live-protocol', ''); proto.setAttribute('aria-label', t('live.dev.protocol'));
  for (const p of TM.PROTOCOL_IDS) { const o = d.createElement('option'); o.value = p; o.textContent = t('live.proto.' + p); proto.append(o); }
  const appr = d.createElement('input'); appr.type = 'checkbox'; appr.setAttribute('data-live-approve', '');
  const addB = mk('button', 'btn-line btn-sm-cc', t('live.dev.add')); addB.type = 'button'; addB.setAttribute('data-live-add', '');
  const csv = d.createElement('textarea'); csv.className = 'form-control'; csv.rows = 6; csv.spellcheck = false; csv.value = st.csv; csv.setAttribute('data-live-csv', ''); csv.setAttribute('aria-label', t('live.map.csv'));
  csv.style.cssText = 'font-family:monospace;font-size:0.75rem;width:100%;margin:0.375rem 0';
  const rd = d.createElement('textarea'); rd.className = 'form-control'; rd.rows = 3; rd.spellcheck = false; rd.setAttribute('data-live-readings', ''); rd.setAttribute('aria-label', t('live.read.csv'));
  rd.placeholder = 'tag,time,value,quality'; rd.style.cssText = 'font-family:monospace;font-size:0.75rem;width:100%;margin:0.375rem 0';
  const btn = (key, fn) => { const b = mk('button', 'btn-line btn-sm-cc', t(key)); b.type = 'button'; b.setAttribute('data-live-act', key); b.style.margin = '0 0.25rem 0.25rem 0'; b.addEventListener('click', () => { Promise.resolve().then(fn).catch((e) => say(String(e && e.message || e), true)); }); return b; };

  function drawDevices() {
    devBox.replaceChildren(...(st.devices.length ? st.devices.map((v, i) => {
      const li = mk('li'); li.setAttribute('data-live-device', v.id);
      li.append(mk('span', '', `${v.id}: ${t('live.proto.' + v.protocol)} ${v.host}:${v.port || ''}${v.approved ? ' (' + t('live.dev.approved') + ')' : ''} `));
      const rm = mk('button', 'btn-line btn-sm-cc', t('live.dev.remove')); rm.type = 'button'; rm.addEventListener('click', () => { st.devices.splice(i, 1); persist(); drawDevices(); }); li.append(rm); return li;
    }) : [mk('li', 'text-ink-2', t('live.dev.none'))]));
  }
  addB.addEventListener('click', () => {
    const v = { id: idI.value.trim(), protocol: proto.value, host: hostI.value.trim(), approved: appr.checked };
    if (portI.value.trim()) v.port = Number(portI.value); if (unitI.value.trim()) v.unit = Number(unitI.value);
    const r = TM.check({ devices: [...st.devices, v], tags: [] });
    const mine = r.problems.filter((p) => p.about.some((a) => a.id === v.id) && p.severity === 'error' || (p.severity === 'warning' && p.about.some((a) => a.id === v.id)));
    if (mine.length) { publish(mine); say(mine.map((p) => p.text).join(' '), true); return; }
    st.devices.push(v); persist(); drawDevices(); say(t('live.dev.added', { id: v.id }));
  });

  let live = null, busy = false, timer = null;
  function storeFor(tags) { if (!live) live = new LiveStore({ trend: 5000 }); const r = live.define(TM.toStoreMap(TM.bound(tags))); return { store: live, problems: r.problems }; }
  function parse() { st.csv = csv.value; persist(); return TM.parseCsv(csv.value); }
  function check() {
    const p = parse(), c = TM.check({ devices: st.devices, tags: p.tags }), all = p.problems.concat(c.problems);
    publish(all);
    out.replaceChildren(mk('p', all.some((x) => x.severity === 'error') ? 'text-danger' : '', t('live.check.done', { tags: p.tags.length, devices: st.devices.length, problems: all.length })), ...(all.length ? [(() => { const ul = mk('ul', 'meta-items'); for (const x of all.slice(0, 20)) ul.append(mk('li', '', x.text)); return ul; })()] : []));
    return { ...c, problems: all, tags: p.tags };
  }
  function paint(store, tags, label) {
    const rows = store.markers(); publish(store.problems());
    const ul = mk('ul', 'meta-items'); ul.setAttribute('data-live-values', '');
    for (const m of rows) ul.append(mk('li', '', `${m.label}: ${m.text} (${t('live.state.' + m.state)})`));
    out.replaceChildren(mk('p', '', t(label, { n: rows.filter((r) => r.state !== 'waiting').length })), ul);
    drawTrend();
    onReadings(store, tags);
  }
  function readCsv(text = rd.value) {
    const c = check(); if (c.tags.length === 0 || c.problems.some((x) => x.severity === 'error' && x.code !== 'live.map.address')) return null;
    const { store, problems } = storeFor(c.tags); if (problems.some((x) => x.severity === 'error')) { say(problems[0].text, true); return null; }
    const r = TM.applyCsvReadings(store, c.tags, text); paint(store, c.tags, 'live.read.done');
    if (r.unknown.length) out.append(mk('p', 'text-ink-2', t('live.read.unknown', { tags: r.unknown.slice(0, 5).join(', ') })));
    return store;
  }
  async function readDevices() {
    if (busy) return live; busy = true;
    try { return await readOnce(); } finally { busy = false; }
  }
  async function readOnce() {
    const c = check(); if (c.problems.some((x) => x.severity === 'error')) return null;
    const b = bridge(); if (!b || (!b.live && !b.opcua)) { say(t('live.bridge.none'), true); return null; }
    const { store } = storeFor(c.tags), plans = TM.planReads(st.devices, c.tags);
    for (const p of plans) {
      const dev = st.devices.find((x) => x.id === p.device);
      if (dev.approved !== true && !TM.check({ devices: [dev], tags: [] }).ok) continue;
      let got = null;
      if (p.protocol === 'opcua' && b.opcua && b.opcua.read) got = (await b.opcua.read(p.nodes)).map((r) => ({ node: r.nodeId, value: r.value, quality: r.quality === 'good' || r.statusCode === 'Good' ? 'good' : 'bad', at: r.sourceTime ?? r.time ?? Date.now() }));
      else if (b.live && b.live.read) got = await b.live.read({ protocol: p.protocol, host: p.host, port: p.port, unit: dev.unit, nodes: p.nodes, tags: p.tags });
      else { say(t('live.bridge.noproto', { protocol: t('live.proto.' + p.protocol) }), true); continue; }
      store.apply(p.device, got);
    }
    paint(store, c.tags, 'live.read.device'); return store;
  }
  /** Past values of every OPC UA tag (the server's own history) into the trend. */
  async function loadHistory(hours = Number(histI.value) || 24, range = null) {   // range { from, to } (ms or ISO) instead of the last N hours
    const c = check(); if (c.problems.some((x) => x.severity === 'error')) return null;
    const b = bridge(); if (!b || !b.opcua || typeof b.opcua.history !== 'function') { say(t('live.hist.none'), true); return null; }
    const { store } = storeFor(c.tags), to = range ? new Date(range.to) : new Date(), from = range ? new Date(range.from) : new Date(to.getTime() - Math.max(0.01, Math.min(24 * 366, hours)) * 3600e3);
    let n = 0;
    for (const p of TM.planReads(st.devices, c.tags)) {
      if (p.protocol !== 'opcua') continue;
      const dev = st.devices.find((x) => x.id === p.device); if (dev.approved !== true && !TM.check({ devices: [dev], tags: [] }).ok) continue;
      for (const node of p.nodes) {
        const got = await b.opcua.history(node, from.toISOString(), to.toISOString());
        n += store.mergeHistory(p.device, (Array.isArray(got) ? got : []).slice(0, 20000).map((r) => ({ node, value: r.value, quality: qualOf(r), at: r.sourceTime ?? r.time ?? r.at })));
      }
    }
    paint(store, c.tags, 'live.read.device'); out.append(mk('p', '', t('live.hist.done', { n }))); return store;
  }
  /** Rows for the drawing's tags the map does not have yet. */
  function fill() {
    const p = parse(), r = TM.fillFromDrawing(p.tags, drawingTags ? drawingTags() : [], st.devices.length === 1 ? st.devices[0].id : '');
    if (r.added.length) { csv.value = TM.toCsv(r.tags); parse(); say(t('live.fill.done', { n: r.added.length })); } else say(t('live.fill.none'));
    return r.added;
  }
  function stop() { if (timer) { (globalThis.clearInterval || clearInterval)(timer); timer = null; } pollC.checked = false; }
  function poll(seconds = Number(pollS.value) || 10) {
    stop(); const b = bridge(); if (!b || (!b.live && !b.opcua)) { say(t('live.bridge.none'), true); return false; }
    const s = Math.max(2, Math.min(3600, seconds)); pollC.checked = true;
    timer = (globalThis.setInterval || setInterval)(() => { readDevices().catch((e) => { stop(); say(String(e && e.message || e), true); }); }, s * 1000);
    readDevices().catch((e) => say(String(e && e.message || e), true)); say(t('live.poll.on', { s })); return true;
  }

  // ---- the trend (0.11 IND.12)
  const tagSel = d.createElement('select'); tagSel.className = 'select-cc'; tagSel.setAttribute('data-live-trend-tag', ''); tagSel.setAttribute('aria-label', t('live.trend.tag'));
  const chart = attr(mk('div'), 'data-live-trend'), cap = attr(mk('p', 'text-ink-2'), 'data-live-trend-caption');
  function drawTrend() {
    const ids = live ? [...live.map.keys()].filter((id) => live.history(id).length) : [];
    const keep = ids.includes(tagSel.value) ? tagSel.value : ids[0] || '';
    tagSel.replaceChildren(...ids.map((id) => { const o = d.createElement('option'); o.value = id; o.textContent = live.map.get(id).label + (live.map.get(id).label !== id ? ' (' + id + ')' : ''); return o; }));
    tagSel.value = keep;
    const L = keep ? trendOf(live, keep, { buckets: 160 }) : null;
    if (!L || !L.n || !d.createElementNS) { chart.replaceChildren(); cap.textContent = t('live.trend.none'); return L; }
    const W = 320, H = 180, l = 40, r = 8, top = 8, bot = 22, X = (ms) => l + (L.to > L.from ? (ms - L.from) / (L.to - L.from) : 0.5) * (W - l - r), Y = (v) => top + (1 - (v - L.y.lo) / ((L.y.hi - L.y.lo) || 1)) * (H - top - bot);
    const S = (tag, a, text) => { const n = d.createElementNS(SVGNS, tag); for (const k in a) n.setAttribute(k, String(a[k])); if (text !== undefined) n.textContent = text; return n; };
    const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'img', 'aria-label': t('live.trend.caption', { label: L.label, n: L.n, min: +L.min.toPrecision(4), max: +L.max.toPrecision(4), unit: L.unit }), 'data-live-trend-svg': keep });
    svg.style.cssText = 'max-width:100%;height:auto;font-size:10px;color:inherit';
    for (const v of L.y.ticks) { svg.append(S('line', { x1: l, x2: W - r, y1: Y(v), y2: Y(v), stroke: 'currentColor', 'stroke-opacity': 0.15 }), S('text', { x: l - 6, y: Y(v) + 4, 'text-anchor': 'end', fill: 'currentColor' }, String(+v.toPrecision(6)))); }
    for (const ms of L.x.ticks) svg.append(S('line', { x1: X(ms), x2: X(ms), y1: top, y2: H - bot, stroke: 'currentColor', 'stroke-opacity': 0.08 }), S('text', { x: X(ms), y: H - bot + 14, 'text-anchor': 'middle', fill: 'currentColor' }, timeLabel(ms, L.x.stepS)));
    for (const [k, v] of [['high', L.limits.high], ['low', L.limits.low]]) if (v != null) svg.append(S('line', { x1: l, x2: W - r, y1: Y(v), y2: Y(v), stroke: '#d9534f', 'stroke-dasharray': '6 4', 'data-live-limit': k }), S('text', { x: W - r - 2, y: Y(v) - 3, 'text-anchor': 'end', fill: '#d9534f' }, t('live.state.' + k) + ' ' + v));
    for (const seg of L.segments) {
      if (seg.length === 1) svg.append(S('circle', { cx: X(seg[0][0]), cy: Y(seg[0][1]), r: 2.5, fill: 'currentColor', 'data-live-point': '' }));
      else svg.append(S('polyline', { points: seg.map(([ms, v]) => X(ms).toFixed(1) + ',' + Y(v).toFixed(1)).join(' '), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'data-live-line': seg.length }));
    }
    svg.append(S('rect', { x: l, y: top, width: W - l - r, height: H - top - bot, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.3 }));
    chart.replaceChildren(svg);
    cap.textContent = t('live.trend.caption', { label: L.label, n: L.n, min: +L.min.toPrecision(4), max: +L.max.toPrecision(4), unit: L.unit }) + (L.segments.length > 1 && L.gapS ? ' ' + t('live.trend.gap', { s: Math.round(L.gapS) }) : '');
    return L;
  }
  tagSel.addEventListener('change', drawTrend);

  const pollC = d.createElement('input'); pollC.type = 'checkbox'; pollC.setAttribute('data-live-poll', '');
  const pollS = inp('poll-s', t('live.poll.seconds'), '4rem'); pollS.value = '10'; pollS.type = 'number';
  const histI = inp('hist-h', t('live.hist.hours'), '4rem'); histI.value = '24'; histI.type = 'number';
  pollC.addEventListener('change', () => { if (pollC.checked) poll(); else { stop(); say(t('live.poll.off')); } });
  const dl = (name, text, mime) => { if (download) { download(name, text, mime); return; } const w = d.defaultView, a = d.createElement('a'); a.href = w.URL.createObjectURL(new w.Blob([text], { type: mime })); a.download = name; a.click(); };
  const row1 = mk('div'); row1.append(field(t('live.dev.id'), idI), field(t('live.dev.protocol'), proto), field(t('live.dev.host'), hostI), field(t('live.dev.port'), portI), field(t('live.dev.unit'), unitI), field(t('live.dev.approve'), appr), addB);
  const bar = mk('div'); bar.append(btn('live.act.check', check), btn('live.act.read', () => readCsv()), btn('live.act.device', readDevices), btn('live.act.export', () => { parse(); dl('tag-map.csv', '﻿' + csv.value, 'text/csv'); }), btn('live.act.template', () => { csv.value = TM.TEMPLATE; parse(); }));
  const mapBar = mk('div'); if (drawingTags) mapBar.append(btn('live.act.fill', fill));
  const row2 = mk('div'); row2.append(field(t('live.poll.label'), pollC), field('', pollS), mk('span', 'text-ink-2', t('live.poll.seconds') + ' '), btn('live.act.history', () => loadHistory()), field(t('live.hist.hours'), histI));
  const trendBar = mk('div'); trendBar.append(field(t('live.trend.tag'), tagSel), btn('live.trend.save', () => { if (!live) return; dl('trend.csv', '﻿' + trendCsv(live, tagSel.value ? [tagSel.value] : [...live.map.keys()]), 'text/csv'); }));
  csv.addEventListener('change', parse);
  el.replaceChildren(mk('p', 'text-ink-2', t('live.lede')), mk('h4', '', t('live.h.devices')), devBox, row1, mk('h4', '', t('live.h.map')), csv, mapBar, mk('h4', '', t('live.h.readings')), rd, bar, row2, out,
    mk('h4', '', t('live.h.trend')), trendBar, chart, cap, mk('p', 'text-ink-2', t('live.note')));
  drawDevices(); drawTrend();
  return { check, readCsv, readDevices, loadHistory, fill, poll, stop, store: () => live, trend: drawTrend, state: () => st, refresh: drawDevices };
}
