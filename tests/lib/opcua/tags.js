// SPDX-License-Identifier: Apache-2.0
/**
 * Tags (0.8 CH.27 / IND.12): the page's live view of a plant. DOM-free, no imports.
 *
 * `TagStore` keeps the last value of every node with its quality and times, and a bounded trend per tag (a ring), fed by the connector's
 * `values` events. `bind` ties a plant node to something in a drawing or model by name (a P&ID tag "P-101", a 3D object's id).
 * `compareModel` checks a model's number against the plant's (the "twin" part) and returns Problems-shape problems (KICKOFF rule 29):
 * source kind `engine`, never a panel of its own.
 */
export class TagStore {
  constructor({ trend = 600, staleMs = 30000, now = () => Date.now() } = {}) {
    this.trendMax = trend; this.staleMs = staleMs; this.now = now;
    this.tags = new Map();     // node → { node, name, unit, value, quality, at, received, trend: [[ms, value]] }
    this.binds = new Map();    // key ("pid:P-101") → node
  }
  /** Apply a connector `values` event (or a `read` answer's items). Returns the nodes that changed. */
  apply(items) {
    const changed = [];
    for (const it of Array.isArray(items) ? items : []) {
      if (!it || typeof it.node !== 'string') continue;
      let t = this.tags.get(it.node);
      if (!t) { t = { node: it.node, name: it.name || it.node, unit: it.unit || '', value: null, quality: 'bad', at: null, received: 0, trend: [] }; this.tags.set(it.node, t); }
      const at = Date.parse(it.at); const ms = Number.isFinite(at) ? at : this.now();
      if (t.at && ms < Date.parse(t.at)) continue;             // an older sample arriving late is not the current value
      t.value = it.value; t.quality = it.quality === 'good' || it.quality === 'uncertain' ? it.quality : 'bad';
      t.at = new Date(ms).toISOString(); t.received = this.now();
      if (it.unit) t.unit = it.unit; if (it.name) t.name = it.name;
      if (typeof it.value === 'number' && t.quality !== 'bad') { t.trend.push([ms, it.value]); if (t.trend.length > this.trendMax) t.trend.splice(0, t.trend.length - this.trendMax); }
      changed.push(it.node);
    }
    return changed;
  }
  /** Bring a historian read in (oldest first); samples older than the first kept one go in front, newer ones are merged by time. */
  mergeHistory(node, samples) {
    const t = this.tags.get(node) || (this.tags.set(node, { node, name: node, unit: '', value: null, quality: 'bad', at: null, received: 0, trend: [] }), this.tags.get(node));
    const seen = new Set(t.trend.map((p) => p[0]));
    for (const s of samples) { const ms = Date.parse(s.at); if (Number.isFinite(ms) && typeof s.value === 'number' && !seen.has(ms)) { t.trend.push([ms, s.value]); seen.add(ms); } }
    t.trend.sort((a, b) => a[0] - b[0]);
    if (t.trend.length > this.trendMax) t.trend.splice(0, t.trend.length - this.trendMax);
  }
  get(node) { return this.tags.get(node) || null; }
  /** 'fresh' | 'stale' | 'none': a value older than staleMs is shown as stale, never as current. */
  state(node) { const t = this.tags.get(node); if (!t || !t.received) return 'none'; return this.now() - t.received > this.staleMs ? 'stale' : 'fresh'; }
  bind(key, node) { this.binds.set(String(key), String(node)); }
  unbind(key) { this.binds.delete(String(key)); }
  valueFor(key) { const n = this.binds.get(String(key)); return n ? this.get(n) : null; }
  /** Summary a P&ID/3D label draws: { text, quality, state } — "12.4 bar", or "no data" / "stale". */
  label(key, digits = 2) {
    const t = this.valueFor(key);
    if (!t) return { text: 'no data', quality: 'bad', state: 'none' };
    const state = this.state(t.node);
    const v = typeof t.value === 'number' ? (Math.round(t.value * 10 ** digits) / 10 ** digits).toString() : t.value === null ? '—' : String(t.value);
    return { text: v + (t.unit ? ' ' + t.unit : ''), quality: t.quality, state };
  }
  /** Trend points in [from, to] (ms), thinned to at most `max` by keeping first, last and the extremes of each bucket. */
  series(node, { from = -Infinity, to = Infinity, max = 300 } = {}) {
    const t = this.tags.get(node); if (!t) return [];
    const pts = t.trend.filter((p) => p[0] >= from && p[0] <= to);
    if (pts.length <= max) return pts;
    const per = Math.ceil(pts.length / Math.floor(max / 2)), out = [];
    for (let i = 0; i < pts.length; i += per) {
      const b = pts.slice(i, i + per); let lo = b[0], hi = b[0];
      for (const p of b) { if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; }
      out.push(...(lo[0] <= hi[0] ? [lo, hi] : [hi, lo]).filter((p, k, a) => k === 0 || p !== a[0]));
    }
    return out;
  }
}

/**
 * Check the model against the plant. `pairs`: [{ key, label, model, unit, tolerance: { abs?, rel? }, node }]; the plant value comes from
 * the store. Returns { rows, problems }. A bad-quality or stale plant value is a `note` (we cannot judge), never a pass.
 */
export function compareModel(store, pairs) {
  const rows = [], problems = [];
  for (const p of pairs) {
    const t = store.get(p.node), state = store.state(p.node);
    const about = [{ kind: 'tag', id: String(p.key), label: p.label || String(p.key) }];
    const src = { kind: 'engine', name: 'opcua.twin' };
    if (!t || state === 'none' || t.quality === 'bad' || typeof t.value !== 'number') {
      rows.push({ key: p.key, model: p.model, plant: null, verdict: 'unknown' });
      problems.push({ code: 'twin.nodata', severity: 'note', source: src, about, vars: { tag: p.label || p.key }, text: 'No usable plant value for ' + (p.label || p.key) + ' (' + (t ? 'quality ' + t.quality : 'not read') + '), so it was not compared.' });
      continue;
    }
    if (state === 'stale') {
      rows.push({ key: p.key, model: p.model, plant: t.value, verdict: 'unknown' });
      problems.push({ code: 'twin.stale', severity: 'note', source: src, about, vars: { tag: p.label || p.key }, text: 'The plant value for ' + (p.label || p.key) + ' is older than ' + Math.round(store.staleMs / 1000) + ' s, so it was not compared.' });
      continue;
    }
    const diff = t.value - p.model, tol = Math.max((p.tolerance && p.tolerance.abs) || 0, Math.abs(p.model) * ((p.tolerance && p.tolerance.rel) || 0));
    const within = Math.abs(diff) <= tol;
    rows.push({ key: p.key, model: p.model, plant: t.value, diff, verdict: within ? 'agrees' : 'differs' });
    if (!within) problems.push({ code: 'twin.differs', severity: 'warning', source: src, about, vars: { tag: p.label || p.key, model: p.model, plant: t.value, unit: p.unit || '' },
      req: { op: 'between', value: [p.model - tol, p.model + tol], unit: p.unit || '' }, found: { value: t.value, unit: p.unit || '' },
      text: (p.label || p.key) + ': the plant reads ' + t.value + (p.unit ? ' ' + p.unit : '') + ' where the model says ' + p.model + ' (allowed difference ' + Math.round(tol * 1e6) / 1e6 + ').' });
  }
  return { rows, problems };
}
