/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edits.js — the non-destructive edit log (spec § 7). Edits never touch n/*.bin: they live in edits.json, and the patches of the
 * operations that need the whole cloud (outliers, ground, geometric classes) in edits/<editId>/<nodeIndex>.bin.
 *
 *   cloud.edits.list() → [record…]            { id, op, region?, from?, to?, params?, label, at }
 *   cloud.edits.add({ op:'class'|'delete'|'restore', region, from?, to?, params?, label? }) → id    one undo step
 *       params.invert: the region is inverted (Crop to boundary = delete + invert)
 *   cloud.edits.undo() → record | null         cloud.edits.redo() → record | null
 *   cloud.edits.count() / canUndo() / canRedo() / version
 *   await cloud.edits.saved()                  resolves when edits.json is on the store
 *   cloud.edits.exportJson() → object          the whole log, for a report
 *
 * Evaluation is lazy and per node: apply(cloud, nodeIndex, rawNode) replays the log in order into the final class and deleted
 * planes (cached by node and log version). Materialised operations carry a patch per node: [cls plane (255 = unchanged)]
 * [del plane (0 none, 1 delete, 2 restore)].
 *
 *   engine use: const id = edits.allocId(); const ps = new PatchSet(cloud, id); ps.setClass(node, idx, cls) …; await ps.flush();
 *               edits.addMaterialised({ id, op, params, label, summary }) — undo keeps the patches (redo needs them); they are
 *               deleted when the record is discarded for good.
 */
import { fail, jsonBytes, parseJson } from './util.js';
import { compileRegion, regionNeedsGround } from './select.js';

const LAZY = new Set(['class', 'delete', 'restore']);
const MATERIAL = new Set(['outliers', 'ground', 'geometric']);

export class PatchSet {
  constructor(cloud, editId) { this.cloud = cloud; this.id = editId; this.m = new Map(); this.changed = 0; }
  _get(node) {
    let p = this.m.get(node);
    if (!p) { const n = this.cloud.t.count[node]; p = { cls: new Uint8Array(n).fill(255), del: new Uint8Array(n) }; this.m.set(node, p); }
    return p;
  }
  setClass(node, idx, cls) { const p = this._get(node); if (p.cls[idx] === 255) this.changed++; p.cls[idx] = cls; }
  setDel(node, idx, v) { this._get(node).del[idx] = v; }
  async flush() {
    for (const [node, p] of this.m) {
      let any = false;
      for (let k = 0; k < p.cls.length; k++) if (p.cls[k] !== 255 || p.del[k]) { any = true; break; }
      if (!any) continue;
      const b = new Uint8Array(2 * p.cls.length); b.set(p.cls, 0); b.set(p.del, p.cls.length);
      await this.cloud.put('edits/' + this.id + '/' + node + '.bin', b);
    }
    this.m.clear();
  }
}

export class EditLog {
  constructor(cloud) {
    this.cloud = cloud; this.recs = []; this.redoRecs = []; this.nextId = 1; this.version = 0;
    this._cache = new Map(); this._saving = Promise.resolve(); this._compiled = new Map();
    this.now = () => new Date().toISOString();
  }
  static async load(cloud) {
    const e = new EditLog(cloud), b = await cloud.get('edits.json');
    if (b) { const j = parseJson(b); e.recs = j.list || []; e.redoRecs = j.redo || []; e.nextId = j.nextId || 1; }
    return e;
  }
  list() { return this.recs.map((r) => ({ ...r })); }
  count() { return this.recs.length; }
  canUndo() { return this.recs.length > 0; }
  canRedo() { return this.redoRecs.length > 0; }
  exportJson() { return { format: 'cct-edits', version: 1, cloud: this.cloud.id, list: this.list(), redo: this.redoRecs.map((r) => ({ ...r })) }; }
  saved() { return this._saving; }
  _save() {
    const body = jsonBytes({ format: 'cct-edits', version: 1, list: this.recs, redo: this.redoRecs, nextId: this.nextId });
    this._saving = this._saving.then(() => this.cloud.put('edits.json', body));
    return this._saving;
  }
  _bump() { this.version++; this._cache.clear(); }
  allocId() { return 'e' + this.nextId++; }
  _dropRedo() {
    for (const r of this.redoRecs) this._discard(r);
    this.redoRecs = [];
  }
  _discard(r) {
    if (!MATERIAL.has(r.op)) return;
    this._saving = this._saving.then(async () => {
      const pre = this.cloud.prefix;
      for (const k of await this.cloud.store.list(pre + 'edits/' + r.id + '/')) await this.cloud.store.delete(k);
      for (const k of await this.cloud.store.list(pre + 'ground/' + r.id + '/')) await this.cloud.store.delete(k);
    });
  }
  add(rec) {
    if (!rec || !LAZY.has(rec.op)) fail('bad_edit', { op: rec && rec.op }, MATERIAL.has(rec && rec.op) ? 'pointcloud: outliers/ground/geometric edits are made by runOutliers/classifyGround/classifyGeometric' : undefined);   // i18n-ignore: developer error
    if (rec.op === 'class' && !Number.isInteger(rec.to)) fail('bad_edit', { op: rec.op });
    compileRegion(rec.region, { ground: regionNeedsGround(rec.region) ? { at: () => 0 } : null });   // validates
    this._dropRedo();
    const id = this.allocId();
    this.recs.push({ id, op: rec.op, region: rec.region || { type: 'all' }, from: rec.from ?? null, to: rec.to ?? null, params: rec.params || null, label: rec.label || rec.op, at: this.now() });
    this._bump(); this._save();
    return id;
  }
  addMaterialised(rec) {
    if (!MATERIAL.has(rec.op) || !rec.id) fail('bad_edit', { op: rec.op });
    this._dropRedo();
    this.recs.push({ id: rec.id, op: rec.op, region: rec.region || null, from: null, to: null, params: rec.params || null, label: rec.label || rec.op, at: this.now(), summary: rec.summary || null });
    this._bump(); this._save();
    return rec.id;
  }
  discard(id) { this._discard({ id, op: 'ground' }); }
  undo() {
    const r = this.recs.pop();
    if (!r) return null;
    this.redoRecs.push(r); this._bump(); this._save();
    return { ...r };
  }
  redo() {
    const r = this.redoRecs.pop();
    if (!r) return null;
    this.recs.push(r); this._bump(); this._save();
    return { ...r };
  }

  /** The final planes of node `idx` after the whole log. */
  async apply(cloud, idx, raw) {
    const hit = this._cache.get(idx);
    if (hit) return hit;
    const n = raw.n, cls = new Uint8Array(raw.cls), del = new Uint8Array(n);
    for (let k = 0; k < n; k++) del[k] = raw.flags[k] & 1;
    const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
    const box = cloud.nodeBox(idx);
    for (const rec of this.recs) {
      if (MATERIAL.has(rec.op)) {
        const b = await cloud.get('edits/' + rec.id + '/' + idx + '.bin');
        if (!b) continue;
        for (let k = 0; k < n; k++) { const c = b[k], d = b[n + k]; if (c !== 255) cls[k] = c; if (d === 1) del[k] = 1; else if (d === 2) del[k] = 0; }
        continue;
      }
      if (this._compVer !== this.version) { this._compiled.clear(); this._compVer = this.version; }
      let comp = this._compiled.get(rec.id);
      if (!comp) {
        const ground = regionNeedsGround(rec.region) ? await cloud.ground() : null;
        comp = compileRegion(rec.region, { ground, invert: !!(rec.params && rec.params.invert) });
        this._compiled.set(rec.id, comp);
      }
      const bb = comp.bbox;
      if (bb && (box.max[0] < bb[0] || box.min[0] > bb[2] || box.max[1] < bb[1] || box.min[1] > bb[3])) continue;
      const from = rec.from ? new Set(rec.from) : null, to = rec.to;
      for (let k = 0; k < n; k++) {
        if (from && !from.has(cls[k])) continue;
        if (!comp.test(ox + raw.x[k] * sx, oy + raw.y[k] * sy, oz + raw.z[k] * sz, cls[k])) continue;
        if (rec.op === 'class') cls[k] = to; else if (rec.op === 'delete') del[k] = 1; else del[k] = 0;
      }
    }
    const out = { cls, del };
    if (this._cache.size > 4096) this._cache.clear();
    this._cache.set(idx, out);
    return out;
  }
}
