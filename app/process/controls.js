/* SPDX-License-Identifier: Apache-2.0 */
/**
 * controls.js — control system export from a P&ID (0.8 Track CH, CH.28). DOM-free. Loops are found from the instrument tags (the letters of
 * the common identification convention: first letter = what is measured, the letters after it = what the device does; loop number = the digits)
 * and, when the P&ID gives them, the signal lines between devices. A drafting and study aid, not an engineering approval: the rules below for
 * which device needs which kind of channel are ours and are meant to be edited (`attrs.io` on a symbol overrides them).
 *
 * Input (neutral, built from the pid add-on's model): {
 *   instruments: [{ uid, tag, sym ('inst-field'|'inst-panel'|'inst-local'|'inst-shared'|'inst-computer'|'inst-plc'), desc, svc, attrs: { io?, range?, unit?, sil? } }],
 *   valves:      [{ uid, tag, type, act ('none'|'diaphragm'|'motor'|'solenoid'|'piston'|'manual'), line, desc, attrs }],
 *   equipment:   [{ uid, tag, type, desc, attrs }],
 *   signals?:    [{ style, a: tag, b: tag }]          signal lines between tagged devices
 * }
 *   parseTag(tag)              → { fn, variable, later, num, loop } | null
 *   loops(pid)                 → [{ id, variable, num, members: [{ tag, role, uid, location, io: [...] }], problems? }]
 *   instrumentIndex(pid)       → list { name, columns, rows }  (instrument index: tag, function in words, loop, service, location, channels)
 *   tagList(pid)               → every tagged item: tag, kind, description, service
 *   ioList(pid)                → one row per channel: tag, description, type AI/AO/DI/DO, signal, loop, location, range, unit, spare
 *   ioSummary(list, spare)     → counts by type, with the spare allowance
 *   loopSheet(loop)            → { svg, entities }  a loop diagram in balloons
 *   check(pid)                 → Problems: no controller, no measurement, duplicate tags, etc.
 *   toCsv(list) · toSheets(lists)
 */
import { problem } from './report.js';

export const FIRST = { A: 'Analysis', B: 'Burner/combustion', C: 'Conductivity', D: 'Density', E: 'Voltage', F: 'Flow', G: 'Gauging', H: 'Hand', I: 'Current', J: 'Power', K: 'Time', L: 'Level', M: 'Moisture', P: 'Pressure', Q: 'Quantity', R: 'Radiation', S: 'Speed/frequency', T: 'Temperature', U: 'Multivariable', V: 'Vibration', W: 'Weight', X: 'Unclassified', Y: 'Event/state', Z: 'Position' };
export const LATER = { A: 'alarm', C: 'control', E: 'element', G: 'glass/gauge', H: 'high', I: 'indicate', K: 'control station', L: 'low', O: 'orifice', R: 'record', S: 'switch', T: 'transmit', V: 'valve/damper', W: 'well', X: 'unclassified', Y: 'relay/compute', Z: 'driver/actuator' };
const MOTORS = new Set(['pump-cf', 'pump-pd', 'compressor', 'fan', 'agitator']);
const LOCATION = { 'inst-field': 'Field', 'inst-local': 'Field', 'inst-panel': 'Panel', 'inst-shared': 'DCS/PLC', 'inst-computer': 'DCS/PLC', 'inst-plc': 'DCS/PLC' };

export function parseTag(tag) {
  const m = /^([A-Za-z]{1,6})[- ]?(\d+[A-Za-z]?)$/.exec(String(tag ?? '').trim());
  if (!m) return null;
  const fn = m[1].toUpperCase(), variable = fn[0], later = fn.slice(1);
  if (!FIRST[variable]) return null;
  return { fn, variable, later, num: m[2], loop: variable + m[2] };
}
const csv = (rows) => rows.map((r) => r.map((v) => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n') + '\r\n';

/** What a device needs from the control system: [{ type: 'AI'|'AO'|'DI'|'DO'|'soft'|'none', signal, note }]. */
export function channelsFor(item, kind) {
  const ov = item.attrs && item.attrs.io;
  if (ov) return String(ov).split(/[,; ]+/).filter(Boolean).map((t) => ({ type: t.toUpperCase(), signal: /^[AD][IO]$/i.test(t) ? (/^A/i.test(t) ? '4-20 mA' : '24 VDC') : '', note: 'set on the symbol' }));
  if (kind === 'equipment') return MOTORS.has(item.type) || /^pump|^compressor|^fan/.test(item.type || '') ? [{ type: 'DO', signal: '24 VDC', note: 'start/stop' }, { type: 'DI', signal: '24 VDC', note: 'running' }] : [];
  if (kind === 'valve') {
    const a = item.act || 'none', p = parseTag(item.tag);
    if (a === 'manual' || a === 'none') return [];
    if (a === 'solenoid') return [{ type: 'DO', signal: '24 VDC', note: 'open/close' }];
    if (a === 'motor') return [{ type: 'DO', signal: '24 VDC', note: 'open/close' }, { type: 'DI', signal: '24 VDC', note: 'position' }];
    return p && p.variable !== 'X' && p.variable !== 'H' ? [{ type: 'AO', signal: '4-20 mA', note: 'positioner' }] : [{ type: 'DO', signal: '24 VDC', note: 'open/close' }];
  }
  const p = parseTag(item.tag); if (!p) return [];
  const l = p.later;
  if (l.includes('T')) return [{ type: 'AI', signal: '4-20 mA', note: 'transmitter' }];
  if (l.includes('S') && !l.includes('C')) return [{ type: 'DI', signal: '24 VDC', note: 'switch' }];
  if (l.includes('E') && p.variable === 'T') return [{ type: 'AI', signal: 'RTD/TC', note: 'element' }];
  if (l.includes('Z') || l.includes('V')) return [{ type: 'AO', signal: '4-20 mA', note: 'actuator' }];
  if (l.includes('C') || l.includes('Y') || l.includes('A')) return [{ type: 'soft', signal: '', note: 'in the controller' }];
  return [];
}
const roleOf = (p) => (p.later.includes('V') ? 'final element' : p.later.includes('T') ? 'transmitter' : p.later.includes('C') ? 'controller' : p.later.includes('S') ? 'switch' : p.later.includes('E') ? 'element' : p.later.includes('I') ? 'indicator' : p.later.includes('A') ? 'alarm' : p.later.includes('Y') ? 'compute' : 'device');

function devices(pid) {
  const out = [];
  for (const i of pid.instruments || []) out.push({ ...i, kind: 'instrument', location: LOCATION[i.sym] || 'Field' });
  for (const v of pid.valves || []) if (v.tag) out.push({ ...v, kind: 'valve', location: 'Field' });
  for (const e of pid.equipment || []) if (e.tag) out.push({ ...e, kind: 'equipment', location: 'Field' });
  return out;
}

export function loops(pid) {
  const map = new Map();
  for (const d of devices(pid)) {
    if (d.kind === 'equipment') continue;
    const p = parseTag(d.tag); if (!p || (d.kind === 'valve' && !p.later.includes('V'))) continue;
    if (!map.has(p.loop)) map.set(p.loop, { id: p.loop, variable: p.variable, name: FIRST[p.variable], num: p.num, members: [] });
    map.get(p.loop).members.push({ tag: d.tag, role: roleOf(p), uid: d.uid, location: d.location, io: channelsFor(d, d.kind).filter((c) => c.type !== 'none'), desc: d.desc || '' });
  }
  const order = { element: 0, transmitter: 1, switch: 1, indicator: 2, compute: 3, controller: 4, alarm: 5, 'final element': 6, device: 7 };
  const out = [...map.values()];
  for (const l of out) l.members.sort((a, b) => (order[a.role] - order[b.role]) || a.tag.localeCompare(b.tag));
  return out.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

const byTag = (a, b) => String(a[0]).localeCompare(String(b[0]), 'en', { numeric: true, sensitivity: 'base' });
export function instrumentIndex(pid) {
  const rows = [];
  for (const d of devices(pid)) {
    if (d.kind !== 'instrument') continue;
    const p = parseTag(d.tag);
    rows.push([d.tag, p ? [FIRST[p.variable], ...[...p.later].map((c) => LATER[c]).filter(Boolean)].join(', ') : '', p ? p.loop : '', d.svc || '', d.desc || '', d.location, channelsFor(d, 'instrument').filter((c) => c.type !== 'none').map((c) => c.type).join(' ') || '-']);
  }
  rows.sort(byTag);
  return { name: 'Instrument index', columns: ['Tag', 'Function', 'Loop', 'Service', 'Description', 'Location', 'Channels'], rows };
}
export function tagList(pid) {
  const rows = devices(pid).map((d) => [d.tag, d.kind === 'instrument' ? 'Instrument' : d.kind === 'valve' ? 'Valve' : 'Equipment', d.type || d.sym || '', d.desc || '', d.svc || d.attrs?.svc || '']);
  rows.sort(byTag);
  return { name: 'Tag list', columns: ['Tag', 'Kind', 'Type', 'Description', 'Service'], rows };
}
export function ioList(pid, { spare = 0.2 } = {}) {
  const rows = [], lp = new Map();
  for (const l of loops(pid)) for (const m of l.members) lp.set(m.tag, l.id);
  for (const d of devices(pid)) {
    for (const c of channelsFor(d, d.kind)) {
      if (c.type === 'soft' || c.type === 'none') continue;
      const p = parseTag(d.tag);
      rows.push([d.tag, d.desc || '', c.type, c.signal, lp.get(d.tag) || (p ? p.loop : ''), d.location === 'Field' ? 'Field' : d.location, d.attrs?.range || '', d.attrs?.unit || '', c.note, d.attrs?.sil ? 'SIL ' + d.attrs.sil : '']);
    }
  }
  rows.sort(byTag);
  const list = { name: 'I/O list', columns: ['Tag', 'Description', 'Type', 'Signal', 'Loop', 'Location', 'Range', 'Unit', 'Function', 'Safety'], rows };
  list.summary = ioSummary(list, spare);
  return list;
}
export function ioSummary(list, spare = 0.2) {
  const n = { AI: 0, AO: 0, DI: 0, DO: 0 };
  for (const r of list.rows) if (n[r[2]] !== undefined) n[r[2]]++;
  const withSpare = Object.fromEntries(Object.entries(n).map(([k, v]) => [k, Math.ceil(v * (1 + spare))]));
  return { counts: n, spare, withSpare, total: Object.values(n).reduce((a, b) => a + b, 0) };
}

export function check(pid) {
  const P = [], seen = new Map();
  for (const d of devices(pid)) { const k = String(d.tag).toUpperCase(); if (seen.has(k)) P.push(problem('ctl.duplicate-tag', 'error', `Tag ${d.tag} is used twice.`, [{ kind: 'pid', id: d.uid ?? d.tag }])); seen.set(k, d); }
  for (const l of loops(pid)) {
    const has = (r) => l.members.some((m) => m.role === r), a = [{ kind: 'loop', id: l.id }];
    if (has('final element') && !has('controller') && !l.members.some((m) => m.role === 'switch')) P.push(problem('ctl.loop-no-controller', 'warning', `Loop ${l.id}: a valve with no controller or switch in the loop.`, a));
    if (has('controller') && !has('transmitter') && !has('element')) P.push(problem('ctl.loop-no-measurement', 'warning', `Loop ${l.id}: a controller with nothing measuring.`, a));
    if (has('controller') && !has('final element')) P.push(problem('ctl.loop-no-output', 'info', `Loop ${l.id}: a controller with no valve or actuator in the loop (it may drive a drive or setpoint elsewhere).`, a));
  }
  return P;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** A loop diagram: devices as balloons in signal order, the line between them, location bands (field above the line, DCS/PLC below). */
export function loopSheet(loop, { w = 120, h = 90 } = {}) {
  const ms = loop.members, W = Math.max(300, (ms.length + 1) * w), H = 260;
  const ents = [], svg = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="sans-serif" font-size="10" role="img">`, `<text x="8" y="16" font-size="12" font-weight="bold">Loop ${esc(loop.id)} - ${esc(loop.name || '')}</text>`, `<line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="#888" stroke-dasharray="4 3"/><text x="8" y="${H / 2 - 4}" fill="#888">Field</text><text x="8" y="${H / 2 + 12}" fill="#888">DCS / PLC</text>`];
  const pos = ms.map((m, i) => ({ m, x: (i + 1) * w - w / 2 + 30, y: m.location === 'Field' ? H / 2 - 60 : H / 2 + 60 }));
  for (let i = 1; i < pos.length; i++) { svg.push(`<line x1="${pos[i - 1].x}" y1="${pos[i - 1].y}" x2="${pos[i].x}" y2="${pos[i].y}" stroke="#2e7dd1"/>`); ents.push({ type: 'line', x1: pos[i - 1].x, y1: -pos[i - 1].y, x2: pos[i].x, y2: -pos[i].y }); }
  for (const { m, x, y } of pos) {
    svg.push(`<circle cx="${x}" cy="${y}" r="22" fill="#fff" stroke="#000"/><text x="${x}" y="${y + 3}" text-anchor="middle">${esc(m.tag)}</text><text x="${x}" y="${y + 38}" text-anchor="middle" fill="#555">${esc(m.role)}${m.io.length ? ' ' + esc(m.io.map((c) => c.type).join('/')) : ''}</text>`);
    ents.push({ type: 'circle', cx: x, cy: -y, r: 22 }, { type: 'text', x, y: -y, h: 8, rot: 0, s: m.tag, ha: 'center', va: 'middle' }, { type: 'text', x, y: -y - 34, h: 6, rot: 0, s: m.role + (m.io.length ? ' ' + m.io.map((c) => c.type).join('/') : ''), ha: 'center', va: 'middle' });
  }
  svg.push('</svg>');
  return { svg: svg.join(''), entities: ents, width: W, height: H };
}

export const toCsv = (list) => csv([list.columns, ...list.rows]);
export const toCsvAll = (lists) => csv(lists.flatMap((l, i) => [...(i ? [[]] : []), [l.name], l.columns, ...l.rows]));
export function toSheets(lists) {
  return lists.map((l) => ({ name: l.name, cols: l.columns.map((c, j) => Math.min(48, Math.max(8, String(c).length + 2, ...l.rows.map((r) => String(r[j] ?? '').length + 2)))), rows: [l.columns.map((c) => ({ v: c, s: 'head' })), ...l.rows.map((r) => r.map((v) => (v === '' ? null : String(v))))], freeze: 1 }));
}
/** The four documents as lists: tag list, instrument index, I/O list, loop summary. */
export function exportAll(pid, opts = {}) {
  const ls = loops(pid), io = ioList(pid, opts);
  return [tagList(pid), instrumentIndex(pid), io, { name: 'Loop list', columns: ['Loop', 'Measured', 'Devices'], rows: ls.map((l) => [l.id, l.name, l.members.map((m) => m.tag).join('; ')]) }];
}
