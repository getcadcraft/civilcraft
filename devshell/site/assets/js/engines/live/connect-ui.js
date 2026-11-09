/* SPDX-License-Identifier: Apache-2.0 */
/**
 * connect-ui.js — "Connect to a device" and the tag map (0.8 XE.9, chem-mount_PART_5): one panel for the P&ID add-on (CadCraft) and the Plant add-on (BimCraft). The person lists the devices
 * (Modbus TCP, MQTT, BACnet/IP, OPC UA), types or pastes the tag map as a table, checks it (Problems words, a public address needs a yes per host), tries it with a CSV of readings
 * (works anywhere), or reads the devices through Studio when Studio's bridge is there. Read only: nothing here writes to a device. DOM text goes in through textContent.
 *
 *   mountConnect(el, { t, load(), save(state), onReadings(store, tags), bridge?() , download?, publish? }) → { check(), readCsv(text), readDevices(), state(), refresh() }
 *     state  { devices: [device], csv: 'tag map table' }       saved by the host (add-on storage), so it goes with the drawing's person and machine, never a secret
 *     bridge()  → the Studio bridge or null. Contract for Studio's native side (one function per protocol, read once):
 *               bridge.live.read({ protocol, host, port, unit?, nodes: [address…] }) → Promise<[{ node, value, quality: 'good'|'uncertain'|'bad', at }]>
 *               (the host opens the socket after the person said yes to that host; OPC UA keeps the older bridge.opcua.read(nodeIds))
 *     onReadings(store, tags)  called after readings are applied: the host paints them on the drawing or the model
 */
import * as TM from './tagmap.js';
import { wordsOf } from './connect-words.js';

export function mountConnect(el, { t: t0, load, save, onReadings = () => {}, bridge = () => globalThis.ccStudioBridge || null, download = null, publish = () => {} }) {
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
    onReadings(store, tags);
  }
  function readCsv(text = rd.value) {
    const c = check(); if (c.tags.length === 0 || c.problems.some((x) => x.severity === 'error' && x.code !== 'live.map.address')) return null;
    const { store, problems } = TM.makeStore(c.tags); if (problems.some((x) => x.severity === 'error')) { say(problems[0].text, true); return null; }
    const r = TM.applyCsvReadings(store, c.tags, text); paint(store, c.tags, 'live.read.done');
    if (r.unknown.length) out.append(mk('p', 'text-ink-2', t('live.read.unknown', { tags: r.unknown.slice(0, 5).join(', ') })));
    return store;
  }
  async function readDevices() {
    const c = check(); if (c.problems.some((x) => x.severity === 'error')) return null;
    const b = bridge(); if (!b || (!b.live && !b.opcua)) { say(t('live.bridge.none'), true); return null; }
    const { store } = TM.makeStore(c.tags), plans = TM.planReads(st.devices, c.tags);
    for (const p of plans) {
      const dev = st.devices.find((x) => x.id === p.device);
      if (dev.approved !== true && !TM.check({ devices: [dev], tags: [] }).ok) continue;
      let got = null;
      if (p.protocol === 'opcua' && b.opcua && b.opcua.read) got = (await b.opcua.read(p.nodes)).map((r) => ({ node: r.nodeId, value: r.value, quality: r.quality === 'good' || r.statusCode === 'Good' ? 'good' : 'bad', at: r.sourceTime ?? r.time ?? Date.now() }));
      else if (b.live && b.live.read) got = await b.live.read({ protocol: p.protocol, host: p.host, port: p.port, unit: dev.unit, nodes: p.nodes });
      else { say(t('live.bridge.noproto', { protocol: t('live.proto.' + p.protocol) }), true); continue; }
      store.apply(p.device, got);
    }
    paint(store, c.tags, 'live.read.device'); return store;
  }

  const dl = (name, text, mime) => { if (download) { download(name, text, mime); return; } const w = d.defaultView, a = d.createElement('a'); a.href = w.URL.createObjectURL(new w.Blob([text], { type: mime })); a.download = name; a.click(); };
  const row1 = mk('div'); row1.append(field(t('live.dev.id'), idI), field(t('live.dev.protocol'), proto), field(t('live.dev.host'), hostI), field(t('live.dev.port'), portI), field(t('live.dev.unit'), unitI), field(t('live.dev.approve'), appr), addB);
  const bar = mk('div'); bar.append(btn('live.act.check', check), btn('live.act.read', () => readCsv()), btn('live.act.device', readDevices), btn('live.act.export', () => { parse(); dl('tag-map.csv', '﻿' + csv.value, 'text/csv'); }), btn('live.act.template', () => { csv.value = TM.TEMPLATE; parse(); }));
  csv.addEventListener('change', parse);
  el.replaceChildren(mk('p', 'text-ink-2', t('live.lede')), mk('h4', '', t('live.h.devices')), devBox, row1, mk('h4', '', t('live.h.map')), csv, mk('h4', '', t('live.h.readings')), rd, bar, out, mk('p', 'text-ink-2', t('live.note')));
  drawDevices();
  return { check, readCsv, readDevices, state: () => st, refresh: drawDevices };
}
