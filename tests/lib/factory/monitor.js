/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and protocol names; the panel words them. */
/**
 * monitor.js — reading every machine and recording what it did (0.9 D8.13). One poll reads each machine through its source, records the
 * state, counts and alarms (record.js), and puts its numeric values through lib/live's tag store (trends, high/low limits with a deadband,
 * stale readings) — the same store the P&ID and Plant panels use. READ ONLY: no source here has a write call.
 *
 * Sources (machine.source.protocol):
 *   sim        the seeded shop (sim.js), read through the MTConnect reader, so the whole path is the real one
 *   mtconnect  an MTConnect agent over HTTP: Studio's `ccStudioBridge.hostFetch(url)` when Studio has it, else the page's own fetch (only an
 *              https agent that allows this site by CORS can answer a web page; most shop-floor agents are plain http, which needs Studio)
 *   opcua      Studio's `ccStudioBridge.opcua.read(nodeIds)` (lib/opcua's connector; the Studio launch of it is not built yet)
 *   mqtt, modbus, bacnet   Studio's `ccStudioBridge.live.read({ protocol, host, port, unit, nodes })` (lib/live's contract; not built yet in Studio)
 * Without the bridge a machine says `needs-studio` and nothing is sent.
 *
 *   makeMonitor({ shop, fetch, bridge, recorder, Store, now, policy }) → { poll(machines) → [{ id, ok, code?, message?, state }], snap(id), values(id), trend(id, name), problems() }
 */
import { makeReader, MtcError, cleanBase } from './mtconnect.js';
import { SIM_BASE } from './sim.js';

const EXEC_WORDS = { running: 'running', active: 'running', run: 'running', idle: 'idle', ready: 'idle', stopped: 'stopped', stop: 'stopped', hold: 'stopped', down: 'down', fault: 'down', alarm: 'down', setup: 'setup', manual: 'setup', offline: 'offline' };
/** A state from a plain tag: a word (MTConnect-like or our own), or a number (0 offline, 1 idle, 2 running, 3 stopped, 4 down, 5 setup). */
export function stateFromValue(v) {
  if (typeof v === 'number') return ['offline', 'idle', 'running', 'stopped', 'down', 'setup'][v] || 'offline';
  if (typeof v === 'boolean') return v ? 'running' : 'idle';
  const w = String(v ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return EXEC_WORDS[w] || (w === 'program_completed' || w === 'wait' ? 'idle' : w === 'feed_hold' || w === 'interrupted' ? 'stopped' : 'offline');
}

export function makeMonitor({ shop = null, fetch = null, bridge = () => null, recorder, Store = null, now = () => Date.now(), policy = null } = {}) {
  const readers = new Map(), snaps = new Map(), keys = new Map();
  const store = Store ? new Store({ now, staleS: 120, trend: 600 }) : null;
  let defined = new Map();                   // tag id → entry
  const tagId = (m, name) => m.id + '.' + name;
  function defineValues(m, values) {
    if (!store) return;
    let grew = false;
    for (const name of Object.keys(values)) {
      const id = tagId(m, name); const lim = (m.limits || {})[name] || {};
      const e = { id, source: 'factory', node: id, label: m.name + ' ' + name, low: Number.isFinite(lim.low) ? lim.low : undefined, high: Number.isFinite(lim.high) ? lim.high : undefined, deadband: Number.isFinite(lim.deadband) ? lim.deadband : 0 };
      const old = defined.get(id);
      if (!old || old.low !== e.low || old.high !== e.high) { defined.set(id, e); grew = true; }
    }
    if (grew) store.define([...defined.values()]);
  }
  function readerFor(m) {
    const s = m.source, key = s.protocol + '|' + (s.base || '') + '|' + (s.device || m.id);
    if (keys.get(m.id) !== key) { readers.delete(m.id); keys.set(m.id, key); }
    if (readers.has(m.id)) return readers.get(m.id);
    let r;
    if (s.protocol === 'sim') r = makeReader({ base: SIM_BASE, device: m.id, fetch: (u) => shop.fetch(u) });
    else {
      const b = bridge(); const hostFetch = b && typeof b.hostFetch === 'function' ? (u) => b.hostFetch(u, { method: 'GET' }) : null;
      r = makeReader({ base: s.base, device: s.device, fetch: hostFetch || fetch || (() => { throw new MtcError('transport', 'no fetch'); }) });
      r.via = hostFetch ? 'studio' : 'page';
    }
    readers.set(m.id, r); return r;
  }
  async function readTags(m) {
    const s = m.source, b = bridge(), nodes = s.nodes || {};
    const list = Object.entries(nodes).filter(([, n]) => n);
    if (!list.length) return { ok: false, code: 'no-nodes' };
    let rows;
    if (s.protocol === 'opcua') { if (!b || !b.opcua || typeof b.opcua.read !== 'function') return { ok: false, code: 'needs-studio' }; rows = await b.opcua.read(list.map(([, n]) => n)); }
    else { if (!b || !b.live || typeof b.live.read !== 'function') return { ok: false, code: 'needs-studio' }; rows = await b.live.read({ protocol: s.protocol, host: s.host, port: s.port, unit: s.unit, nodes: list.map(([, n]) => n) }); }
    const byNode = new Map((Array.isArray(rows) ? rows : []).map((x) => [String(x.node ?? x.nodeId), x]));
    const val = (k) => { const x = byNode.get(nodes[k]); return x && x.quality !== 'bad' ? x.value : undefined; };
    const st = val('state'), num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
    const alarm = val('alarm');
    const alarms = alarm && alarm !== '0' && alarm !== 0 && alarm !== false ? [{ id: 'alarm', level: 'fault', text: String(alarm === true ? 'Alarm' : alarm), code: '' }] : [];
    const snap = { state: st === undefined ? 'offline' : alarms.length ? 'down' : stateFromValue(st), counts: { total: num(val('total')), good: num(val('good')), bad: num(val('bad')) }, alarms, values: {}, steps: [] };
    return { ok: true, snap };
  }
  function checkHost(m) {
    if (!policy) return null;
    const s = m.source; let host = s.host;
    if (s.protocol === 'mtconnect') { const b = cleanBase(s.base); if (!b) return { ok: false, code: 'url' }; host = new URL(b).hostname; }
    const r = policy(host, { allow: s.approved ? [host] : [] });
    return r.ok ? null : { ok: false, code: 'host-' + r.code };
  }
  return {
    store,
    async poll(machines) {
      const out = [];
      for (const m of machines) {
        const t = now();
        if (m.source.protocol === 'none') { out.push({ id: m.id, ok: false, code: 'not-read' }); continue; }
        let res;
        try {
          if (m.source.protocol === 'sim') { if (!shop) throw new MtcError('transport', 'no simulator'); shop.advance(t); }
          else { const bad = checkHost(m); if (bad) { out.push({ id: m.id, ...bad }); recorder.observe(m.id, { state: 'offline' }, t); continue; } }
          if (m.source.protocol === 'sim' || m.source.protocol === 'mtconnect') res = { ok: true, snap: await readerFor(m).poll() };
          else res = await readTags(m);
        } catch (e) { res = { ok: false, code: (e && e.code) || 'error', message: String((e && e.message) || e) }; }
        if (!res.ok) { recorder.observe(m.id, { state: 'offline' }, t); out.push({ id: m.id, ...res, state: 'offline' }); continue; }
        const snap = res.snap; snaps.set(m.id, snap);
        if (snap.steps && snap.steps.length) for (const st of snap.steps) recorder.observe(m.id, st.snap, Math.min(st.at, t));
        recorder.observe(m.id, snap, t);
        defineValues(m, snap.values || {});
        if (store) store.apply('factory', Object.entries(snap.values || {}).map(([name, v]) => ({ node: tagId(m, name), value: v.value, quality: 'good', at: Date.parse(v.at) || t })));
        out.push({ id: m.id, ok: true, state: recorder.isPlanned(m.id) ? 'planned' : snap.state, via: readers.get(m.id)?.via || (m.source.protocol === 'sim' ? 'sim' : 'studio') });
      }
      return out;
    },
    snap: (id) => snaps.get(id) || null,
    values(id) { if (!store) return []; return store.rows().filter((r) => r.id.startsWith(id + '.')).map((r) => ({ ...r, name: r.id.slice(id.length + 1) })); },
    trend: (id, name) => (store ? store.history(id + '.' + name) : []),
    problems: () => (store ? store.problems() : []),
    forget(id) { readers.delete(id); keys.delete(id); snaps.delete(id); },
  };
}
