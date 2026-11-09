/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tagmap.js — the tag map of live plant and building data (0.8 XE.9, chem-mount_PART_5): which device a value comes from, which address on it, what it is called, its unit, its limits and the
 * place in a drawing or a model that shows it. Pure data and checks, DOM-free, no network: connect-ui.js is the panel, the host (Studio) opens any socket after the person says yes.
 *
 *   device  { id, protocol: 'modbus'|'mqtt'|'bacnet'|'opcua', host, port?, unit?, approved? }        approved = the person said yes to this host (a public address needs it)
 *   tag     { id, device, address, label?, unit?, scale?, offset?, low?, high?, deadband?, staleS?, type?, target? }
 *           address by protocol:  modbus  40001 | hr:100 | ir:5 | co:0 | di:7        mqtt  a topic (with an optional #json.path suffix, e.g. plant/t1#value)
 *                                 bacnet  analog-input,1                              opcua  a node id such as ns=2;s=Tank1.Level
 *           type (modbus only)    u16 s16 u32 s32 f32 bool       target  a tag of the drawing ("TI-101") or "kind:id" (pid, 3d, drawing, element)
 *   check({ devices, tags }, { loopback? }) → { ok, problems }          (shared problem shape, code live.map.*; docs/0.8-PROBLEMS-SPEC.md)
 *   parseCsv(text) → { tags, problems } · toCsv(tags) · toStoreMap(tags) → the LiveStore.define map · planReads(devices, tags) → what to ask each device, by protocol
 * Nothing here writes to a device: planReads only lists reads (the codecs of this library have no write function).
 */
import * as modbus from './modbus.js';
import * as mqtt from './mqtt.js';
import * as bacnet from './bacnet.js';
import { addressPolicy, cleanTarget, PROTOCOLS } from './policy.js';
import { problem, LiveStore } from './store.js';
import { cleanText } from './bytes.js';

export const COLUMNS = ['id', 'device', 'address', 'label', 'unit', 'scale', 'offset', 'low', 'high', 'deadband', 'staleS', 'type', 'target'];
export const TEMPLATE = 'id,device,address,label,unit,scale,offset,low,high,deadband,staleS,type,target\nTI-101,plc1,40001,Reactor temperature,C,0.1,0,,300,5,30,s16,TI-101\n';
export const PROTOCOL_IDS = Object.keys(PROTOCOLS);

const num = (v) => { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : NaN; };

/** One address for its protocol → { ok } or { ok: false, message }. */
export function checkAddress(protocol, address, type) {
  const a = String(address ?? '').trim();
  if (!a) return { ok: false, message: 'The address is empty.' };
  try {
    if (protocol === 'modbus') {
      const r = modbus.parseAddress(a);
      if (type && !modbus.TYPES[type]) return { ok: false, message: `Type "${type}" is not one of ${Object.keys(modbus.TYPES).join(', ')}.` };
      if ((r.fc === 1 || r.fc === 2) && type && type !== 'bool') return { ok: false, message: 'A coil or discrete input is one bit: use type bool or none.' };
      return { ok: true, parsed: r };
    }
    if (protocol === 'mqtt') { const topic = a.split('#json.')[0] || a; return mqtt.validFilter(topic) ? { ok: true } : { ok: false, message: 'That is not a valid topic.' }; }
    if (protocol === 'bacnet') {
      const m = /^([a-z\-]+)\s*,\s*(\d{1,7})$/i.exec(a);
      if (!m || !(m[1].toLowerCase() in bacnet.OBJECT_TYPES)) return { ok: false, message: 'Use an object such as analog-input,1.' };
      return { ok: true, parsed: { type: m[1].toLowerCase(), instance: +m[2] } };
    }
    if (protocol === 'opcua') return a.length <= 300 && /^(ns=\d+;)?[isgb]=.+/.test(a) ? { ok: true } : { ok: false, message: 'Use a node id such as ns=2;s=Tank1.Level.' };
  } catch (e) { return { ok: false, message: String(e && e.message || e) }; }
  return { ok: false, message: 'Unknown protocol.' };
}

/** The devices and tags → problems. A public address is refused until the person approved that host. */
export function check({ devices = [], tags = [] } = {}, { loopback = false } = {}) {
  const P = [], dev = new Map();
  for (const d of devices) {
    const about = [{ kind: 'device', id: String(d && d.id || '?') }];
    if (!d || !/^[A-Za-z0-9_.\-]{1,40}$/.test(String(d.id || ''))) { P.push(problem('map.device', 'error', 'A device needs a short id (letters, digits, - _ .).', about)); continue; }
    if (dev.has(d.id)) { P.push(problem('map.devdup', 'error', `The device id ${d.id} is used twice.`, about)); continue; }
    dev.set(d.id, d);
    const t = cleanTarget(d, d.protocol);
    if (!t.ok) { P.push(problem('map.target', 'error', `${d.id}: ${t.message}`, about)); continue; }
    const pol = addressPolicy(t.host, { allow: d.approved ? [t.host] : [], loopback });
    if (!pol.ok) P.push(problem('map.address', pol.code === 'public' ? 'warning' : 'error', `${d.id}: ${pol.message}`, about, { fix: pol.code === 'public' ? 'approve' : undefined }));
  }
  const seen = new Set(), P2 = [];
  for (const g of tags) {
    const id = cleanText(g && g.id, 120), about = [{ kind: 'tag', id: id || '?' }];
    if (!id) { P2.push(problem('map.tag', 'error', 'A tag needs an id.', about)); continue; }
    if (seen.has(id)) { P2.push(problem('map.dup', 'error', `The tag id ${id} is used twice.`, about)); continue; }
    seen.add(id);
    const d = dev.get(g.device);
    if (!d) { P2.push(problem('map.nodevice', 'error', `${id}: there is no device called "${g.device || ''}".`, about)); continue; }
    const a = checkAddress(d.protocol, g.address, g.type);
    if (!a.ok) P2.push(problem('map.address', 'error', `${id}: ${a.message}`, about));
    for (const k of ['scale', 'offset', 'low', 'high', 'deadband', 'staleS']) if (g[k] != null && g[k] !== '' && !Number.isFinite(Number(g[k]))) P2.push(problem('map.number', 'error', `${id}: ${k} is not a number.`, about));
    if (g.low != null && g.high != null && g.low !== '' && g.high !== '' && !(Number(g.low) < Number(g.high))) P2.push(problem('map.limits', 'error', `${id}: the low limit must be below the high limit.`, about));
  }
  const all = P.concat(P2);
  return { ok: !all.some((p) => p.severity === 'error'), problems: all };
}

// ---- CSV -----------------------------------------------------------------------------------------------------------------------------
function splitCsv(text) {
  const rows = []; let row = [], cur = '', q = false;
  const s = String(text ?? '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some((x) => x !== '')) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}
export function parseCsv(text) {
  const rows = splitCsv(text), P = [];
  if (!rows.length) return { tags: [], problems: [problem('map.empty', 'error', 'The table is empty.')] };
  const head = rows[0].map((h) => h.trim()), col = (n) => head.indexOf(n);
  for (const need of ['id', 'device', 'address']) if (col(need) < 0) return { tags: [], problems: [problem('map.columns', 'error', `The table needs a "${need}" column. Columns: ${COLUMNS.join(', ')}.`)] };
  const tags = [];
  for (const r of rows.slice(1, 5001)) {
    const g = {}; for (const c of COLUMNS) { const i = col(c); const v = i >= 0 ? String(r[i] ?? '').trim() : ''; if (v !== '') g[c] = v; }
    for (const k of ['scale', 'offset', 'low', 'high', 'deadband', 'staleS']) if (g[k] !== undefined) { const n = num(g[k]); if (Number.isNaN(n)) P.push(problem('map.number', 'error', `${g.id || '?'}: ${k} "${g[k]}" is not a number.`, [{ kind: 'tag', id: g.id || '?' }])); else g[k] = n; }
    if (g.id || g.address) tags.push(g);
  }
  return { tags, problems: P };
}
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function toCsv(tags) { return COLUMNS.join(',') + '\n' + tags.map((g) => COLUMNS.map((c) => csvCell(g[c])).join(',')).join('\n') + (tags.length ? '\n' : ''); }

/** The tags → the LiveStore.define map. A tag with no `target` is shown at the drawing tag of its own id. */
export function toStoreMap(tags) {
  return tags.map((g) => {
    const tg = String(g.target || g.id || ''), m = /^(pid|3d|drawing|element):(.+)$/.exec(tg), target = m ? { kind: m[1], id: m[2] } : { kind: 'pid', id: tg };
    const e = { id: g.id, source: g.device, node: g.address, label: g.label || g.id, unit: g.unit || '', target };
    for (const k of ['scale', 'offset', 'low', 'high', 'deadband', 'staleS']) if (Number.isFinite(Number(g[k])) && g[k] !== '' && g[k] != null) e[k] = Number(g[k]);
    return e;
  });
}

/** What to ask each device (reads only), grouped. Modbus gets the request bytes; the host decides how to send them. */
export function planReads(devices, tags) {
  const out = [];
  for (const d of devices) {
    const mine = tags.filter((g) => g.device === d.id); if (!mine.length) continue;
    const plan = { device: d.id, protocol: d.protocol, host: d.host, port: d.port ?? PROTOCOLS[d.protocol], nodes: [], requests: [] };
    for (const g of mine) {
      const a = checkAddress(d.protocol, g.address, g.type); if (!a.ok) continue;
      plan.nodes.push(g.address);
      if (d.protocol === 'modbus') { const words = modbus.TYPES[g.type || 'u16'] || 1; plan.requests.push({ node: g.address, bytes: modbus.readRequest({ tid: plan.requests.length + 1, unit: d.unit ?? 1, fc: a.parsed.fc, address: a.parsed.address, quantity: a.parsed.fc <= 2 ? 1 : words }) }); }
      else if (d.protocol === 'bacnet') plan.requests.push({ node: g.address, bytes: bacnet.readProperty({ invoke: plan.requests.length & 255, object: a.parsed, property: 'present-value' }) });
      else if (d.protocol === 'mqtt') plan.requests.push({ node: g.address, filter: g.address.split('#json.')[0] });
    }
    out.push(plan);
  }
  return out;
}

/** A store ready for the map, and the problems of defining it. */
export function makeStore(tags, opts = {}) { const s = new LiveStore(opts), r = s.define(toStoreMap(tags)); return { store: s, problems: r.problems }; }

/** Readings from a CSV export (tag,time,value,quality) applied to a store by tag id: how a map is tried with no device at all. */
export function applyCsvReadings(store, tags, text) {
  const rows = splitCsv(text); if (rows.length < 2) return { applied: 0, unknown: [] };
  const head = rows[0].map((h) => h.trim().toLowerCase()), ix = (n) => head.indexOf(n), unknown = [];
  const byId = new Map(tags.map((g) => [g.id, g]));
  let applied = 0;
  for (const r of rows.slice(1)) {
    const id = String(r[ix('tag')] ?? '').trim(), g = byId.get(id);
    if (!g) { if (id) unknown.push(id); continue; }
    const v = Number(r[ix('value')]), q = String(r[ix('quality')] ?? 'good').toLowerCase(), at = r[ix('time')] ? Date.parse(r[ix('time')]) : Date.now();
    store.apply(g.device, [{ node: g.address, value: Number.isFinite(v) ? v : String(r[ix('value')] ?? ''), quality: /^(good|ok|192)/.test(q) ? 'good' : /^(unc)/.test(q) ? 'uncertain' : 'bad', at: Number.isFinite(at) ? at : Date.now() }]);
    applied++;
  }
  return { applied, unknown };
}
