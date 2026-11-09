/* SPDX-License-Identifier: Apache-2.0 */
/**
 * store.js — live values on drawings and 3D (0.8 XE.9). One store for every source (OPC UA, MQTT, Modbus, BACnet, a CSV): a tag map says which
 * source node feeds which place in a drawing or model, samples come in, rows and markers come out. It never writes to a plant.
 *
 *   map entry  { id, source, node, label?, unit?, scale?, offset?, target: { kind: 'pid'|'3d'|'drawing'|'element', id, prop? }, low?, high?, deadband?, staleS?, range?: [lo, hi] }
 *   new LiveStore({ now, staleS, trend })     .define(map) → { ok, problems }     .apply(source, samples)     .rows()     .markers()     .problems()     .history(id)
 *   sample     { node, value, quality: 'good'|'uncertain'|'bad', at }       (at: ISO text or ms)
 * Alarms have a deadband: once high, it stays high until the value falls below high − deadband (so a value on the limit does not flicker).
 */
import { cleanText } from './bytes.js';
export const DISCLAIMER = 'Read-only plant and building data, for viewing and comparison. Nothing here controls equipment, and nothing here is an alarm system or a safety function.';
export const STATES = ['waiting', 'ok', 'uncertain', 'bad', 'stale', 'high', 'low'];
const SRC = { kind: 'engine', name: 'live' };
export function problem(code, severity, text, about = [], extra = {}) { return { id: 'live:' + code + ':' + about.map((a) => a.id).join(','), code: 'live.' + code, severity, text, about, source: SRC, ...extra }; }
const qual = (q) => (q === 'good' || q === 'uncertain' ? q : 'bad');

export class LiveStore {
  constructor({ now = () => Date.now(), staleS = 60, trend = 600 } = {}) { this.now = now; this.staleS = staleS; this.trendMax = trend; this.map = new Map(); this.byKey = new Map(); this.cur = new Map(); }
  define(entries) {
    const problems = []; this.map.clear(); this.byKey.clear();
    for (const m of Array.isArray(entries) ? entries : []) {
      const id = cleanText(m?.id, 120); const about = [{ kind: 'tag', id: id || '?' }];
      if (!id || !m.source || !m.node) { problems.push(problem('map', 'error', 'A tag needs an id, a source and a node.', about)); continue; }
      if (this.map.has(id)) { problems.push(problem('dup', 'error', `The tag id ${id} is used twice.`, about)); continue; }
      if (m.low != null && m.high != null && !(m.low < m.high)) { problems.push(problem('limits', 'error', `${id}: the low limit must be below the high limit.`, about)); continue; }
      const e = { id, source: cleanText(m.source, 80), node: cleanText(m.node, 300), label: cleanText(m.label || id, 120), unit: cleanText(m.unit, 20), scale: Number.isFinite(m.scale) ? m.scale : 1, offset: Number.isFinite(m.offset) ? m.offset : 0, target: m.target && m.target.id ? { kind: cleanText(m.target.kind || 'drawing', 20), id: cleanText(m.target.id, 120), prop: cleanText(m.target.prop || '', 60) } : null,
        low: Number.isFinite(m.low) ? m.low : null, high: Number.isFinite(m.high) ? m.high : null, deadband: Number.isFinite(m.deadband) && m.deadband > 0 ? m.deadband : 0, staleS: Number.isFinite(m.staleS) && m.staleS > 0 ? m.staleS : null, range: Array.isArray(m.range) && m.range.length === 2 && m.range[0] < m.range[1] ? [+m.range[0], +m.range[1]] : null };
      this.map.set(id, e); const k = e.source + '\u0000' + e.node; if (!this.byKey.has(k)) this.byKey.set(k, []); this.byKey.get(k).push(e);
      if (!this.cur.has(id)) this.cur.set(id, { value: null, raw: null, quality: 'bad', at: null, received: null, alarm: null, trend: [], updates: 0 });
    }
    for (const id of [...this.cur.keys()]) if (!this.map.has(id)) this.cur.delete(id);
    return { ok: !problems.some((p) => p.severity === 'error'), problems };
  }
  /** Returns the ids that changed. An older sample than the one held is ignored (out-of-order delivery). */
  apply(source, samples) {
    const changed = [];
    for (const s of Array.isArray(samples) ? samples : []) {
      const list = this.byKey.get(String(source) + '\u0000' + String(s?.node)); if (!list) continue;
      const at = typeof s.at === 'number' ? s.at : Date.parse(s.at); const ms = Number.isFinite(at) ? at : this.now();
      for (const e of list) {
        const c = this.cur.get(e.id); if (c.at != null && ms < c.at) continue;
        const raw = typeof s.value === 'number' && Number.isFinite(s.value) ? s.value : null, num = typeof s.value === 'boolean' ? (s.value ? 1 : 0) : raw;
        c.raw = typeof s.value === 'string' ? cleanText(s.value, 200) : s.value === true || s.value === false ? s.value : raw;
        c.quality = qual(s.quality); c.at = ms; c.received = this.now(); c.updates++;
        c.value = num == null ? null : num * e.scale + e.offset;
        if (c.value != null && c.quality !== 'bad') {
          c.trend.push([ms, c.value]); if (c.trend.length > this.trendMax) c.trend.splice(0, c.trend.length - this.trendMax);
          if (e.high != null) { if (c.value > e.high) c.alarm = 'high'; else if (c.alarm === 'high' && c.value < e.high - e.deadband) c.alarm = null; }
          if (e.low != null) { if (c.value < e.low) c.alarm = 'low'; else if (c.alarm === 'low' && c.value > e.low + e.deadband) c.alarm = null; }
        }
        changed.push(e.id);
      }
    }
    return changed;
  }
  state(e, c = this.cur.get(e.id)) {
    if (c.at == null) return 'waiting';
    if (c.quality === 'bad' || (c.value == null && typeof c.raw !== 'string' && typeof c.raw !== 'boolean')) return 'bad';
    if ((this.now() - c.at) / 1000 > (e.staleS ?? this.staleS)) return 'stale';
    if (c.alarm) return c.alarm;
    return c.quality === 'uncertain' ? 'uncertain' : 'ok';
  }
  rows() {
    return [...this.map.values()].map((e) => { const c = this.cur.get(e.id), st = this.state(e, c); return { id: e.id, label: e.label, source: e.source, node: e.node, target: e.target, unit: e.unit, value: c.value, raw: c.raw, quality: c.quality, at: c.at == null ? null : new Date(c.at).toISOString(), ageS: c.at == null ? null : Math.max(0, (this.now() - c.at) / 1000), state: st, updates: c.updates }; });
  }
  /** One marker per tag that has a place: text for a drawing label, and `level` 0..1 across the tag's range for colouring a 3D object. */
  markers() {
    return this.rows().filter((r) => r.target).map((r) => { const e = this.map.get(r.id), shown = typeof r.raw === 'boolean' ? (r.raw ? 'on' : 'off') : r.value != null ? +r.value.toPrecision(4) + (e.unit ? ' ' + e.unit : '') : typeof r.raw === 'boolean' ? (r.raw ? 'on' : 'off') : typeof r.raw === 'string' ? r.raw : '--';
      const level = r.value != null && e.range ? Math.min(1, Math.max(0, (r.value - e.range[0]) / (e.range[1] - e.range[0]))) : null;
      return { id: r.id, target: r.target, label: r.label, text: shown, state: r.state, level, ageS: r.ageS }; });
  }
  problems() {
    const P = [];
    for (const r of this.rows()) {
      const about = [{ kind: 'tag', id: r.id }], e = this.map.get(r.id);
      if (r.state === 'stale') P.push(problem('stale', 'warning', `${r.label} has not updated for ${Math.round(r.ageS)} s.`, about));
      else if (r.state === 'bad') P.push(problem('bad', 'warning', `${r.label} has bad quality at the source.`, about));
      else if (r.state === 'high') P.push(problem('high', 'warning', `${r.label} is above ${e.high} ${e.unit}.`.trim(), about, { req: { op: '<=', value: e.high, unit: e.unit }, found: r.value }));
      else if (r.state === 'low') P.push(problem('low', 'warning', `${r.label} is below ${e.low} ${e.unit}.`.trim(), about, { req: { op: '>=', value: e.low, unit: e.unit }, found: r.value }));
    }
    return P;
  }
  history(id) { return (this.cur.get(id)?.trend || []).map(([t, v]) => ({ t, value: v })); }
  /** Model against plant: modelValues { tagId: value in the tag's own unit }. */
  compare(modelValues, rel = 0.05) {
    const out = [], P = [];
    for (const r of this.rows()) { const mv = modelValues[r.id]; if (mv == null || r.value == null || r.state === 'stale' || r.state === 'bad') continue; const dev = (r.value - mv) / (Math.abs(mv) || 1); out.push({ id: r.id, plant: r.value, model: mv, deviation: dev });
      if (Math.abs(dev) > rel) P.push(problem('deviates', 'warning', `${r.label}: the plant reads ${r.value.toPrecision(4)} and the model says ${mv.toPrecision(4)} (${(dev * 100).toFixed(1)} %).`, [{ kind: 'tag', id: r.id }], { req: { op: '~', value: mv, unit: r.unit, tol: rel }, found: r.value })); }
    return { rows: out, problems: P };
  }
}
