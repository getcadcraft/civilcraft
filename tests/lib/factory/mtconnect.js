/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — MTConnect element and value names; the panel words what a person reads (words.js). */
/**
 * mtconnect.js — our own reader of an MTConnect agent's public XML (0.9 D8.13), written from the published standard's document shapes
 * (MTConnectDevices for /probe, MTConnectStreams for /current and /sample, MTConnectError), clean room. Read only: an agent has no write
 * call, and nothing here sends anything but GET. DOM-free; the XML reader is lib/plc's (no DOCTYPE, no entities, size-bounded).
 *
 *   parseDoc(text) → { kind: 'devices'|'streams'|'error', header, devices?, streams?, errors? }
 *   snapshotOf(observations) → { state, execution, availability, mode, program, counts: { total, good, bad }, alarms[], values{} }
 *   makeReader({ base, device, fetch, count }) → { probe(), poll(), reset(), state() }   fetch(url) → { ok, status, text() }
 *   urlFor(base, device, 'probe'|'current'|'sample', { from, count }) → string
 *
 * States: running (Execution ACTIVE), idle (READY, WAIT, PROGRAM_COMPLETED), stopped (STOPPED, FEED_HOLD, INTERRUPTED, OPTIONAL_STOP,
 * PROGRAM_STOPPED), down (a Fault condition, or EmergencyStop TRIGGERED), setup (controller mode MANUAL / MANUAL_DATA_INPUT / EDIT and not
 * running), offline (Availability UNAVAILABLE, or nothing heard).
 */
import { parseXml, kids, kid } from '../plc/xml.js';

export const STATES = ['running', 'idle', 'stopped', 'setup', 'down', 'offline', 'planned'];
const EXEC = { ACTIVE: 'running', READY: 'idle', WAIT: 'idle', PROGRAM_COMPLETED: 'idle', STOPPED: 'stopped', FEED_HOLD: 'stopped', INTERRUPTED: 'stopped', OPTIONAL_STOP: 'stopped', PROGRAM_STOPPED: 'stopped' };
const SETUP_MODES = ['MANUAL', 'MANUAL_DATA_INPUT', 'EDIT'];
const CATS = { Samples: 'SAMPLE', Events: 'EVENT', Condition: 'CONDITION' };
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const camelToType = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();   // PartCount → PART_COUNT

export class MtcError extends Error { constructor(code, message) { super(message); this.code = code; } }

function header(root) { const h = kid(root, 'Header'); const a = h ? h.attrs : {}; return { instanceId: a.instanceId || '', sender: a.sender || '', creationTime: a.creationTime || '', bufferSize: num(a.bufferSize), nextSequence: num(a.nextSequence), firstSequence: num(a.firstSequence), lastSequence: num(a.lastSequence) }; }

function dataItemsOf(comp, path, out) {
  const di = kid(comp, 'DataItems');
  if (di) for (const d of kids(di, 'DataItem')) out.push({ id: d.attrs.id || '', name: d.attrs.name || '', type: d.attrs.type || '', subType: d.attrs.subType || '', category: d.attrs.category || '', units: d.attrs.units || '', component: path });
  const cs = kid(comp, 'Components');
  if (cs) for (const c of cs.children) dataItemsOf(c, path ? path + '/' + (c.attrs.name || c.name) : (c.attrs.name || c.name), out);
}

/** Reads one agent document. Throws MtcError('xml') on text that is not one. */
export function parseDoc(text) {
  let root;
  try { root = parseXml(text); } catch (e) { throw new MtcError('xml', 'Not an MTConnect document: ' + e.message); }
  if (root.name === 'MTConnectError') {
    const errs = kid(root, 'Errors'); const list = errs ? kids(errs, 'Error') : kids(root, 'Error');
    return { kind: 'error', header: header(root), errors: list.map((e) => ({ code: e.attrs.errorCode || '', text: e.text.trim() })) };
  }
  if (root.name === 'MTConnectDevices') {
    const ds = kid(root, 'Devices'); const devices = [];
    for (const d of ds ? ds.children.filter((c) => c.name === 'Device' || c.name === 'Agent') : []) { const items = []; dataItemsOf(d, '', items); devices.push({ id: d.attrs.id || '', name: d.attrs.name || '', uuid: d.attrs.uuid || '', agent: d.name === 'Agent', dataItems: items }); }
    return { kind: 'devices', header: header(root), devices };
  }
  if (root.name === 'MTConnectStreams') {
    const ss = kid(root, 'Streams'); const streams = [];
    for (const ds of ss ? kids(ss, 'DeviceStream') : []) {
      const obs = [];
      for (const cs of kids(ds, 'ComponentStream')) for (const group of cs.children) {
        const category = CATS[group.name]; if (!category) continue;
        for (const o of group.children) {
          const a = o.attrs, raw = o.text.trim();
          const ob = { dataItemId: a.dataItemId || '', name: a.name || '', element: o.name, type: category === 'CONDITION' ? (a.type || '') : camelToType(o.name), subType: a.subType || '', category, timestamp: a.timestamp || '', sequence: num(a.sequence), component: cs.attrs.name || cs.attrs.component || '', value: raw === '' ? null : raw };
          if (category === 'CONDITION') { ob.level = o.name.toUpperCase(); ob.nativeCode = a.nativeCode || ''; ob.text = raw; }
          obs.push(ob);
        }
      }
      obs.sort((x, y) => (x.sequence ?? 0) - (y.sequence ?? 0));
      streams.push({ name: ds.attrs.name || '', uuid: ds.attrs.uuid || '', observations: obs });
    }
    return { kind: 'streams', header: header(root), streams };
  }
  throw new MtcError('xml', 'Not an MTConnect document (root ' + root.name + ').');
}

/** The newest value of each data item wins; conditions are kept per data item (Normal clears that item's fault/warning). */
export function snapshotOf(observations, prev = null) {
  const last = new Map(prev ? prev._last : []); const cond = new Map(prev ? prev._cond : []);
  for (const o of observations || []) {
    const key = o.dataItemId || o.name || o.type;
    if (o.category === 'CONDITION') { if (o.level === 'NORMAL' || o.level === 'UNAVAILABLE') cond.delete(key); else cond.set(key, o); continue; }
    last.set(key, o);
  }
  const byType = (type, sub) => { let hit = null; for (const o of last.values()) if (o.type === type && (sub === undefined || (o.subType || '') === sub)) { if (!hit || (o.sequence ?? 0) >= (hit.sequence ?? 0)) hit = o; } return hit; };
  const v = (o) => (o && o.value !== null && o.value !== 'UNAVAILABLE' ? o.value : null);
  const execution = v(byType('EXECUTION')), availability = (byType('AVAILABILITY') || {}).value ?? null, mode = v(byType('CONTROLLER_MODE')), estop = v(byType('EMERGENCY_STOP'));
  const program = v(byType('PROGRAM')) || v(byType('PROGRAM', 'MAIN'));
  const count = (subs) => { for (const s of subs) { const o = v(byType('PART_COUNT', s)); if (o !== null && num(o) !== null) return num(o); } return null; };
  const counts = { total: count(['', 'ALL', 'TOTAL']), good: count(['GOOD']), bad: count(['BAD', 'REJECT']) };
  const alarms = [...cond.values()].map((c) => ({ id: c.dataItemId || c.type, level: c.level === 'FAULT' ? 'fault' : 'warning', type: c.type, code: c.nativeCode, text: c.text || c.type, at: c.timestamp }));
  if (estop === 'TRIGGERED') alarms.unshift({ id: 'estop', level: 'fault', type: 'EMERGENCY_STOP', code: '', text: 'Emergency stop', at: '' });
  const values = {};
  for (const o of last.values()) if (o.category === 'SAMPLE' && num(o.value) !== null) values[o.name || o.dataItemId] = { value: num(o.value), type: o.type, at: o.timestamp };
  let state;
  if (availability === 'UNAVAILABLE' || (!last.size && !cond.size)) state = 'offline';
  else if (alarms.some((a) => a.level === 'fault')) state = 'down';
  else if (execution === 'ACTIVE') state = 'running';
  else if (mode && SETUP_MODES.includes(mode)) state = 'setup';
  else state = EXEC[execution] || (execution ? 'stopped' : 'idle');
  const snap = { state, execution, availability, mode, program, counts, alarms, values };
  Object.defineProperty(snap, '_last', { value: [...last.entries()] }); Object.defineProperty(snap, '_cond', { value: [...cond.entries()] });
  return snap;
}

/** Agent addresses: http or https, a host, an optional port and path; no user info, no query. */
export function cleanBase(base) {
  let u; try { u = new URL(String(base || '').trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.search || u.hash || !u.hostname) return null;
  return u.origin + u.pathname.replace(/\/+$/, '');
}
const DEVICE = /^[A-Za-z0-9_.-]{1,80}$/;
export function urlFor(base, device, what, { from, count } = {}) {
  const b = cleanBase(base); if (!b) throw new MtcError('url', 'The agent address must be http:// or https:// with a host.');
  const d = device ? (DEVICE.test(device) ? '/' + device : null) : '';
  if (d === null) throw new MtcError('url', 'A device name is letters, digits, dot, dash or underscore.');
  if (what === 'sample') { const q = []; if (Number.isFinite(from)) q.push('from=' + Math.max(0, Math.floor(from))); if (Number.isFinite(count)) q.push('count=' + Math.max(1, Math.min(10000, Math.floor(count)))); return b + d + '/sample' + (q.length ? '?' + q.join('&') : ''); }
  if (what !== 'probe' && what !== 'current') throw new MtcError('url', 'Unknown request ' + what);
  return b + d + '/' + what;
}

/**
 * A reader for one device on one agent. poll(): the first call reads /current; then /sample from the next sequence, so no change is
 * missed between polls; an agent that restarted (new instanceId) or a gap the agent's buffer no longer holds goes back to /current.
 */
export function makeReader({ base, device = '', fetch, count = 1000, maxBytes = 4 * 1024 * 1024 }) {
  if (typeof fetch !== 'function') throw new MtcError('transport', 'No way to reach the agent was given.');
  let next = null, instance = null, snap = null, polls = 0;
  async function get(url) {
    let r; try { r = await fetch(url); } catch (e) { throw new MtcError('network', 'The agent did not answer: ' + String((e && e.message) || e)); }
    const text = await r.text();
    if (text.length > maxBytes) throw new MtcError('size', 'The agent sent more than ' + maxBytes + ' bytes.');
    const doc = parseDoc(text);
    if (doc.kind === 'error') { const e = doc.errors[0] || { code: 'ERROR', text: '' }; throw new MtcError(e.code === 'OUT_OF_RANGE' ? 'range' : 'agent', e.code + (e.text ? ': ' + e.text : '')); }
    if (!r.ok) throw new MtcError('http', 'The agent answered ' + r.status + '.');
    return doc;
  }
  const pick = (doc) => (doc.streams || []).find((s) => !device || s.name === device || s.uuid === device) || (device ? null : (doc.streams || [])[0]) || null;
  async function current() {
    const doc = await get(urlFor(base, device, 'current'));
    const s = pick(doc); if (!s) throw new MtcError('device', 'The agent has no device ' + device + '.');
    instance = doc.header.instanceId; next = doc.header.nextSequence; snap = snapshotOf(s.observations);
    return { ...snap, steps: [], at: Date.parse(doc.header.creationTime) };
  }
  return {
    async probe() { const doc = await get(urlFor(base, device, 'probe')); if (doc.kind !== 'devices') throw new MtcError('agent', 'The probe answer is not a device list.'); return doc.devices; },
    async poll() {
      polls++;
      if (next === null) return current();
      let doc;
      try { doc = await get(urlFor(base, device, 'sample', { from: next, count })); }
      catch (e) { if (e.code === 'range') return current(); throw e; }
      if (doc.header.instanceId !== instance || (doc.header.firstSequence !== null && doc.header.firstSequence > next)) return current();
      const s = pick(doc); next = doc.header.nextSequence ?? next;
      // every change at its own time (the agent's timestamps), so a stop between two polls is recorded where it happened
      const steps = []; let group = [], ts = null;
      const flush = () => { if (!group.length) return; snap = snapshotOf(group, snap); const at = Date.parse(ts); if (Number.isFinite(at)) steps.push({ at, snap }); group = []; };
      for (const o of s ? s.observations : []) { if (o.timestamp !== ts) { flush(); ts = o.timestamp; } group.push(o); }
      flush();
      if (!snap) snap = snapshotOf([]);
      return { ...snap, steps };
    },
    reset() { next = null; instance = null; snap = null; },
    state() { return { next, instance, polls }; },
  };
}
