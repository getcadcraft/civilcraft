/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-plant-graph (0.10 SU.1561, session pid-10): ONE connectivity graph under both the 3D plant model and the P&ID.
 * DOM-free, no imports outside this folder. A drafting aid, not an engineering approval; it makes no claim to equal any plant design program.
 *
 *   equipment {id, tag, kind, nozzles[{name, size, flow}], guid?}      kind: vessel | tank | column | pump | exchanger | other
 *   line      {id, number, size, spec, service, from:{equip,nozzle}|null, to:{...}|null, run?, length?}     number "3\"-PW-101-CS40"
 *   item      {id, line, cls: valve | instrument, kind, tag, s?, loc?, run?}      valves: gate globe ball check butterfly control psv;
 *                                                                              instruments: loc field | panel | aux (the ISA-5.1 idea of the balloon)
 *   Every element carries state {three, pid}: ok | add | change | remove — what THAT view still has to do to match the graph.
 *
 * An edit made in one view (`addItem('pid', …)`) is `ok` there and pending (`add`, `change`, `remove`) in the other, until the other view's
 * reading shows it (`merge(view, snapshot)`) or the person adopts it (`acknowledge`). One `bom(graph)` serves both views, so the lists cannot differ.
 *
 *   PlantGraph  · bom(graph) / bomCsv · layout(graph) → sheets · toSvg(doc) · readPid(doc) → snapshot · snapshotFrom3d(desc, graph) → snapshot
 *   toSchematic(graph) → a cc-schematic (domain pid) · checkPlant(graph) → problems · lineNumber / nextTag helpers
 */
import { Schematic, problem } from './model.js';
import { csvCell, toCsv } from './plans.js';

export const PLANT_FORMAT = 'cc-plant-graph', PLANT_VERSION = 1;
export const VIEWS = ['three', 'pid'];
export const EQUIP_KINDS = ['vessel', 'tank', 'column', 'pump', 'exchanger', 'other'];
export const VALVE_KINDS = ['gate', 'globe', 'ball', 'check', 'butterfly', 'control', 'psv'];
export const LOCS = ['field', 'panel', 'aux'];
/** Plant add-on equipment types → graph kinds. */
export const KIND_OF_TYPE = { 'vessel-v': 'vessel', 'vessel-h': 'vessel', 'vessel-profile': 'vessel', tank: 'tank', column: 'column', 'pump-cf': 'pump', 'exch-shell': 'exchanger', 'exch-plate': 'exchanger' };
const other = (v) => (v === 'three' ? 'pid' : 'three');
const text = (s, n = 60) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const PREFIX = { vessel: 'V', tank: 'TK', column: 'C', pump: 'P', exchanger: 'E', other: 'X' };

/** The next free "PREFIX-n" (numbers start at 101) among tags. */
export function nextTag(tags, prefix, start = 101) {
  const re = new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-(\\d+)$', 'i');
  let max = start - 1;
  for (const t of tags) { const m = re.exec(String(t || '')); if (m) max = Math.max(max, +m[1]); }
  return prefix + '-' + (max + 1);
}
/** Line number: size in inches, service code, sequence, spec — 3"-PW-101-CS40. */
export const lineNumber = (size, service, seq, spec) => [String(size || '?') + '"', String(service || 'P').toUpperCase(), String(seq), spec].filter(Boolean).join('-');
const seqOf = (n) => { const m = /^[^-]*-[^-]*-(\d+)/.exec(String(n || '')); return m ? +m[1] : 0; };

export class PlantGraph {
  constructor(name = '') { this.name = text(name); this.equipment = []; this.lines = []; this.items = []; this._seq = 0; }
  _id(p) { return p + (++this._seq); }
  _all() { return [...this.equipment, ...this.lines, ...this.items]; }
  _get(id) { return this._all().find((e) => e.id === id) || null; }
  live(list) { return list.filter((e) => !e.removed); }
  equip(tag) { return this.equipment.find((e) => !e.removed && e.tag === tag) || null; }
  line(number) { return this.lines.find((e) => !e.removed && e.number === number) || null; }
  item(tag) { return this.items.find((e) => !e.removed && e.tag === tag) || null; }
  itemsOn(lineId) { return this.items.filter((i) => !i.removed && i.line === lineId).sort((a, b) => (a.s ?? a.order ?? 0) - (b.s ?? b.order ?? 0)); }
  _born(view, o) { o.state = { three: 'ok', pid: 'ok' }; o.state[other(view)] = 'add'; o.by = view; return o; }

  addEquipment(view, e) {
    const kind = EQUIP_KINDS.includes(e.kind) ? e.kind : 'other';
    const tag = text(e.tag, 24) || nextTag(this.equipment.map((x) => x.tag), PREFIX[kind]);
    if (this.equip(tag)) return this.equip(tag);
    const o = this._born(view, { id: e.id || this._id('E'), tag, kind, name: text(e.name), nozzles: (e.nozzles || []).map((n) => ({ name: text(n.name, 24), size: text(n.size, 8), flow: n.flow === 'SINK' ? 'SINK' : 'SOURCE' })) });
    if (e.guid) o.guid = text(e.guid, 40);
    this.equipment.push(o); return o;
  }
  addLine(view, l) {
    const size = text(l.size, 8), service = text(l.service || 'P', 6).toUpperCase(), spec = text(l.spec, 12);
    const number = text(l.number, 40) || lineNumber(size, service, this.nextLineSeq(), spec);
    if (this.line(number)) return this.line(number);
    const o = this._born(view, { id: l.id || this._id('L'), number, size, spec, service, from: l.from || null, to: l.to || null });
    if (l.run) o.run = text(l.run, 40);
    if (num(l.length) !== undefined) o.length = l.length;
    this.lines.push(o); return o;
  }
  nextLineSeq() { return Math.max(100, ...this.lines.map((l) => seqOf(l.number))) + 1; }
  addItem(view, i) {
    const line = typeof i.line === 'string' ? (this._get(i.line) || this.line(i.line)) : null;
    if (!line || line.removed) return null;
    const cls = i.cls === 'instrument' ? 'instrument' : 'valve';
    const kind = cls === 'valve' ? (VALVE_KINDS.includes(i.kind) ? i.kind : 'gate') : text(i.kind, 8).toUpperCase() || 'PI';
    const tag = text(i.tag, 24) || (cls === 'valve' ? nextTag(this.items.filter((x) => x.cls === 'valve').map((x) => x.tag), 'V') : nextTag(this.items.filter((x) => x.cls === 'instrument').map((x) => x.tag), kind));
    if (this.item(tag)) return this.item(tag);
    const o = this._born(view, { id: i.id || this._id('I'), line: line.id, cls, kind, tag, order: this.items.filter((x) => x.line === line.id).length });
    if (num(i.s) !== undefined) o.s = i.s;
    if (cls === 'instrument') o.loc = LOCS.includes(i.loc) ? i.loc : 'field';
    this.items.push(o); return o;
  }
  /** A change made in `view`: line size/spec, valve kind. The other view must follow. */
  change(view, id, patch) {
    const o = this._get(id); if (!o || o.removed) return null;
    const keys = o.nozzles ? [] : o.number !== undefined ? ['size', 'spec'] : ['kind'];
    const was = {}; let any = false;
    for (const k of keys) if (patch[k] !== undefined && text(patch[k], 12) !== o[k]) { was[k] = o[k]; o[k] = text(patch[k], 12); any = true; }
    if (!any) return o;
    o.state[view] = 'ok'; o.by = view;
    if (o.state[other(view)] === 'ok') { o.state[other(view)] = 'change'; o.was = was; } else if (o.was) o.was = { ...was, ...o.was };
    if (o.number !== undefined && patch.size !== undefined) o.number = this._renumber(o);
    return o;
  }
  _renumber(l) { return lineNumber(l.size, l.service, seqOf(l.number), l.spec); }
  /** Remove in `view`: the other view must remove it too; an element the other view never had goes at once. */
  remove(view, id) {
    const o = this._get(id); if (!o || o.removed) return false;
    if (o.state[other(view)] === 'add') { this._purge(o); return true; }
    if (o.number !== undefined) for (const i of this.items.filter((x) => x.line === o.id && !x.removed)) this.remove(view, i.id);
    if (o.nozzles) for (const l of this.lines.filter((x) => !x.removed && ((x.from && x.from.equip === o.tag) || (x.to && x.to.equip === o.tag)))) this.remove(view, l.id);
    o.removed = true; o.state[view] = 'ok'; o.state[other(view)] = 'remove'; o.by = view; return true;
  }
  _purge(o) { for (const k of ['equipment', 'lines', 'items']) this[k] = this[k].filter((x) => x !== o); }
  /** What `view` still has to do: [{id, type, op, label}]. */
  pending(view) {
    const out = [];
    const add = (list, type, label) => { for (const o of list) if (o.state[view] !== 'ok') out.push({ id: o.id, type, op: o.state[view], label: label(o), by: o.by, was: o.was }); };
    add(this.equipment, 'equipment', (o) => o.tag);
    add(this.lines, 'line', (o) => o.number);
    add(this.items, 'item', (o) => o.tag + ' (' + (this.lines.find((l) => l.id === o.line)?.number || '?') + ')');
    return out;
  }
  /** `view` now matches this element (done by hand, or its reading shows it). */
  acknowledge(view, id) {
    const o = this._get(id); if (!o) return false;
    o.state[view] = 'ok'; if (o.state.three === 'ok' && o.state.pid === 'ok') { delete o.was; if (o.removed) this._purge(o); }
    return true;
  }
  acknowledgeAll(view) { for (const p of this.pending(view)) this.acknowledge(view, p.id); }

  /**
   * Reconcile with what `view` shows now (snapshot: {equipment[{tag,kind,nozzles,guid}], lines[{number,size,spec,service,from,to,run,length}], items[{tag,line(number),cls,kind,s,loc}]}).
   * New things there become graph edits made in that view; things the view lost become removals; pending things the view now shows are acknowledged.
   * → {added, removed, changed, adopted} counts.
   */
  merge(view, snap) {
    const r = { added: 0, removed: 0, changed: 0, adopted: 0 };
    const keyed = (list, key) => new Map((list || []).map((x) => [x[key], x]));
    const pass = (list, snapList, key, onNew, attrs) => {
      const seen = keyed(snapList, key);
      for (const o of [...list]) {
        const k = o[key], s = seen.get(k);
        if (o.removed) { if (!s && o.state[view] === 'remove') { this.acknowledge(view, o.id); r.adopted++; } continue; }
        if (!s) { if (o.state[view] === 'ok') { this.remove(view, o.id); r.removed++; } continue; }
        if (o.state[view] === 'add') { this.acknowledge(view, o.id); r.adopted++; }
        const diff = attrs.filter((a) => s[a] !== undefined && text(s[a], 12) !== o[a]);
        if (!diff.length) { if (o.state[view] === 'change') { this.acknowledge(view, o.id); r.adopted++; } continue; }
        if (o.state[view] === 'change' && diff.every((a) => text(s[a], 12) === (o.was || {})[a])) continue;   // the view still shows the old value: stays pending
        this.change(view, o.id, Object.fromEntries(diff.map((a) => [a, s[a]]))); r.changed++;
      }
      for (const [k, s] of seen) if (!list.some((o) => o[key] === k && !o.removed) && !list.some((o) => o[key] === k)) { onNew(s); r.added++; }
    };
    pass(this.equipment, snap.equipment, 'tag', (s) => this.addEquipment(view, s), []);
    pass(this.lines, snap.lines, 'number', (s) => this.addLine(view, { ...s, from: s.from || null, to: s.to || null }), ['size', 'spec']);
    const byNumber = (n) => this.line(n);
    pass(this.items, (snap.items || []).map((i) => ({ ...i, _key: i.tag })), 'tag', (s) => { const l = byNumber(s.line); if (l) this.addItem(view, { ...s, line: l.id }); }, ['kind']);
    return r;
  }

  toJSON() { return { format: PLANT_FORMAT, version: PLANT_VERSION, name: this.name, seq: this._seq, equipment: this.equipment, lines: this.lines, items: this.items }; }
  static fromJSON(input) {
    let o = input;
    if (typeof input === 'string') { try { o = JSON.parse(input); } catch { return null; } }
    if (!o || o.format !== PLANT_FORMAT || !Number.isInteger(o.version) || o.version > PLANT_VERSION) return null;
    const g = new PlantGraph(o.name), st = (s) => { const f = (v) => (['ok', 'add', 'change', 'remove'].includes(v) ? v : 'ok'); return { three: f(s?.three), pid: f(s?.pid) }; };
    for (const e of (Array.isArray(o.equipment) ? o.equipment : []).slice(0, 5000)) if (e && typeof e.id === 'string' && typeof e.tag === 'string') g.equipment.push({ ...e, kind: EQUIP_KINDS.includes(e.kind) ? e.kind : 'other', state: st(e.state), nozzles: Array.isArray(e.nozzles) ? e.nozzles.slice(0, 40) : [] });
    for (const l of (Array.isArray(o.lines) ? o.lines : []).slice(0, 20000)) if (l && typeof l.id === 'string' && typeof l.number === 'string') g.lines.push({ ...l, state: st(l.state) });
    for (const i of (Array.isArray(o.items) ? o.items : []).slice(0, 60000)) if (i && typeof i.id === 'string' && typeof i.tag === 'string' && typeof i.line === 'string') g.items.push({ ...i, state: st(i.state) });
    g._seq = Math.max(Number.isInteger(o.seq) ? o.seq : 0, ...g._all().map((e) => parseInt(String(e.id).replace(/\D/g, ''), 10) || 0));
    return g;
  }
}

// ------------------------------------------------------------------------------------------------------------------ the one BOM
/**
 * The bill of materials from the graph alone — the same list whichever view asks. Removed things are not in it; a row says `pending` while any
 * of its things is still waiting for a view. Sections: equipment, line, valve, instrument. Rows sorted by section then key.
 */
export function bom(g) {
  const rows = [], pend = (o) => o.state.three !== 'ok' || o.state.pid !== 'ok';
  for (const e of g.live(g.equipment)) rows.push({ section: 'equipment', key: e.tag, description: e.kind + (e.name ? ' ' + e.name : ''), size: '', spec: '', qty: 1, tags: [e.tag], length: '', pending: pend(e) });
  for (const l of g.live(g.lines)) rows.push({ section: 'line', key: l.number, description: 'pipe ' + (l.service || ''), size: l.size, spec: l.spec, qty: 1, tags: [l.number], length: l.length === undefined ? '' : Math.round(l.length), pending: pend(l) });
  const groups = new Map();
  for (const i of g.live(g.items)) {
    const l = g.lines.find((x) => x.id === i.line); if (!l || l.removed) continue;
    const key = i.cls + '|' + i.kind + '|' + l.size + '|' + l.spec;
    if (!groups.has(key)) groups.set(key, { section: i.cls, key: i.kind + ' ' + l.size + ' ' + l.spec, description: i.cls === 'valve' ? i.kind + ' valve' : 'instrument ' + i.kind, size: l.size, spec: l.spec, qty: 0, tags: [], length: '', pending: false });
    const r = groups.get(key); r.qty++; r.tags.push(i.tag); r.pending = r.pending || pend(i);
  }
  for (const r of groups.values()) { r.tags.sort(); rows.push(r); }
  const order = { equipment: 0, line: 1, valve: 2, instrument: 3 };
  rows.sort((a, b) => order[a.section] - order[b.section] || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { rows, totals: { equipment: rows.filter((r) => r.section === 'equipment').length, lines: rows.filter((r) => r.section === 'line').length, valves: rows.filter((r) => r.section === 'valve').reduce((n, r) => n + r.qty, 0), instruments: rows.filter((r) => r.section === 'instrument').reduce((n, r) => n + r.qty, 0), pending: rows.filter((r) => r.pending).length } };
}
export const bomCsv = (b) => toCsv([['Section', 'Item', 'Description', 'Size', 'Spec', 'Qty', 'Length mm', 'Tags', 'Status'], ...b.rows.map((r) => [r.section, r.key, r.description, r.size, r.spec, r.qty, r.length, r.tags.join(' '), r.pending ? 'pending' : 'ok'])]);
export { csvCell };

// ------------------------------------------------------------------------------------------------------------------ the 3D side's reading
/**
 * What the 3D model shows, as a snapshot for `merge('three', …)`. desc = { equipment[{tag, type, guid, nozzles[{name, size, flow, p:[x,y,z] mm world}]}],
 * runs[{guid, tag?, size, spec, system, points[[x,y,z] mm], valves[{s, kind}]}], tol? }. A run is tied to the line already holding its guid, else to its tag,
 * else it becomes a new line (service from its system); its ends are tied to the nozzles they touch (within `tol`, default 150 mm). Valves are paired with the
 * graph's valves of the same kind on that line in order (the model's valves carry no tag); extra ones are new.
 */
export function snapshotFrom3d(desc, graph, opts = {}) {
  const tol = opts.tol ?? 150, equipment = [], lines = [], items = [], used = new Set(graph.equipment.map((e) => e.tag));
  for (const e of desc.equipment || []) equipment.push({ tag: e.tag, kind: KIND_OF_TYPE[e.type] || 'other', guid: e.guid, nozzles: (e.nozzles || []).map((n) => ({ name: n.name, size: n.size, flow: n.flow })) });
  void used;
  const near = (p) => {
    let best = null, bd = tol;
    for (const e of desc.equipment || []) for (const n of e.nozzles || []) { const d = Math.hypot(p[0] - n.p[0], p[1] - n.p[1], (p[2] || 0) - (n.p[2] || 0)); if (d <= bd) { bd = d; best = { equip: e.tag, nozzle: n.name }; } }
    return best;
  };
  let seq = Math.max(100, ...graph.lines.map((l) => seqOf(l.number)));
  const taken = new Set();
  for (const r of desc.runs || []) {
    const prior = graph.lines.find((l) => !l.removed && l.run === r.guid) || (r.tag && graph.line(r.tag));
    const service = (r.system || 'P').toUpperCase().slice(0, 4);
    const size = String(r.size || '');
    const number = prior ? (prior.size === size ? prior.number : prior.number) : (r.tag && !taken.has(r.tag) ? r.tag : lineNumber(size, service, ++seq, r.spec));
    taken.add(number);
    const pts = r.points || [];
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], (pts[i][2] || 0) - (pts[i - 1][2] || 0));
    lines.push({ number, size, spec: r.spec || '', service: prior ? prior.service : service, run: r.guid, length: len, from: pts.length ? near(pts[0]) : null, to: pts.length ? near(pts[pts.length - 1]) : null });
    const mine = graph.lines.find((l) => l.number === number && !l.removed);
    const have = mine ? graph.itemsOn(mine.id).filter((i) => i.cls === 'valve') : [];
    const pool = new Map();
    for (const v of [...(r.valves || [])].sort((a, b) => a.s - b.s)) {
      const same = have.filter((h) => h.kind === v.kind && !pool.has(h.tag));
      const h = same[0];
      if (h) { pool.set(h.tag, 1); items.push({ tag: h.tag, line: number, cls: 'valve', kind: v.kind, s: v.s }); }
      else { const tag = nextTag([...graph.items.map((i) => i.tag), ...items.map((i) => i.tag)], 'V'); items.push({ tag, line: number, cls: 'valve', kind: v.kind, s: v.s }); }
    }
  }
  return { equipment, lines, items };
}

// ------------------------------------------------------------------------------------------------------------------ the P&ID
const SIDE_W = { vessel: [22, 40], tank: [30, 36], column: [18, 58], pump: [16, 16], exchanger: [34, 14], other: [24, 20] };
const nozzleSide = (kind, n) => {
  const nm = n.name.toLowerCase();
  if (kind === 'pump') return n.flow === 'SINK' ? 'left' : 'top';
  if (/top|vent|overhead/.test(nm)) return 'top';
  if (/bottom|drain/.test(nm)) return 'bottom';
  return n.flow === 'SINK' ? 'left' : 'right';
};
/**
 * Lay the graph out on P&ID sheets (A3-ish, millimetres on paper): equipment in columns by flow depth, nozzles on the side their flow and name suggest,
 * lines orthogonal, valves and instruments spaced on each line's longest horizontal run, a line crossing sheets ends in an off-sheet connector that names
 * the line and the sheet. Deterministic: the same graph gives the same sheets. Pending things are marked `pending`.
 */
export function layout(g, opts = {}) {
  const perSheet = opts.columnsPerSheet ?? 3, W = 420, H = 297, colPitch = opts.colPitch ?? 110, rowPitch = 80, x0 = 40, y0 = 50;
  const eq = g.live(g.equipment), ls = g.live(g.lines);
  const depth = new Map(eq.map((e) => [e.tag, 0]));
  for (let pass = 0; pass < eq.length; pass++) { let moved = false; for (const l of ls) if (l.from && l.to && depth.has(l.from.equip) && depth.has(l.to.equip) && depth.get(l.to.equip) <= depth.get(l.from.equip) && l.from.equip !== l.to.equip && depth.get(l.from.equip) < eq.length) { depth.set(l.to.equip, depth.get(l.from.equip) + 1); moved = true; } if (!moved) break; }
  const cols = new Map();
  for (const e of [...eq].sort((a, b) => depth.get(a.tag) - depth.get(b.tag) || (a.tag < b.tag ? -1 : 1))) { const d = depth.get(e.tag); if (!cols.has(d)) cols.set(d, []); cols.get(d).push(e); }
  const sheets = [], place = new Map();
  const colKeys = [...cols.keys()].sort((a, b) => a - b);
  colKeys.forEach((d, ci) => {
    const si = Math.floor(ci / perSheet);
    if (!sheets[si]) sheets[si] = { id: 'P' + (si + 1), name: 'P&ID ' + (si + 1), w: W, h: H, equipment: [], lines: [] };
    cols.get(d).forEach((e, ri) => {
      const [w, h] = SIDE_W[e.kind] || SIDE_W.other, cx = x0 + (ci % perSheet) * colPitch + 40, cy = y0 + 40 + ri * rowPitch;
      const x = cx - w / 2, y = cy - h / 2, byS = { left: [], right: [], top: [], bottom: [] };
      for (const n of e.nozzles) byS[nozzleSide(e.kind, n)].push(n);
      const noz = [];
      for (const [side, list] of Object.entries(byS)) list.forEach((n, k) => { const f = (k + 1) / (list.length + 1); noz.push({ name: n.name, size: n.size, side, x: side === 'left' ? x : side === 'right' ? x + w : x + w * f, y: side === 'top' ? y : side === 'bottom' ? y + h : y + h * f }); });
      const o = { id: e.id, tag: e.tag, kind: e.kind, x, y, w, h, pending: e.state.pid !== 'ok', nozzles: noz };
      sheets[si].equipment.push(o); place.set(e.tag, { sheet: si, o });
    });
  });
  if (!sheets.length) sheets.push({ id: 'P1', name: 'P&ID 1', w: W, h: H, equipment: [], lines: [] });
  const nozPt = (end) => { const p = end && place.get(end.equip); const n = p && p.o.nozzles.find((z) => z.name === end.nozzle); return n ? { sheet: p.sheet, ...n, equip: end.equip } : null; };
  const away = (side) => (side === 'left' ? [-1, 0] : side === 'right' ? [1, 0] : side === 'top' ? [0, -1] : [0, 1]);
  for (const l of ls) {
    const a = nozPt(l.from), b = nozPt(l.to), its = g.itemsOn(l.id);
    const put = (si, path, offs) => {
      let best = [0, -1];   // the longest horizontal run
      for (let i = 1; i < path.length; i++) if (path[i][1] === path[i - 1][1]) { const len = Math.abs(path[i][0] - path[i - 1][0]); if (len > best[1]) best = [i, len]; }
      const items = [];
      if (best[0]) {
        const [p, q] = [path[best[0] - 1], path[best[0]]], n = its.length, dir = Math.sign(q[0] - p[0]) || 1;
        its.forEach((it, k) => { const f = (k + 1) / (n + 1); items.push({ id: it.id, cls: it.cls, kind: it.kind, tag: it.tag, loc: it.loc, x: p[0] + (q[0] - p[0]) * f, y: p[1], dir, pending: it.state.pid !== 'ok' }); });
      }
      sheets[si].lines.push({ id: l.id, number: l.number, size: l.size, spec: l.spec, service: l.service, length: l.length, from: l.from, to: l.to, path, items: offs ? (offs.first ? items : []) : items, offsheet: offs ? offs.to : null, open: !!(offs && offs.open), pending: l.state.pid !== 'ok' });
    };
    const route = (p, q) => { const [dx, dy] = away(p.side), s = 8; const p1 = [p.x + dx * s, p.y + dy * s], q1 = [q.x + away(q.side)[0] * s, q.y + away(q.side)[1] * s]; const mx = Math.round((p1[0] + q1[0]) / 2); return [[p.x, p.y], p1, [mx, p1[1]], [mx, q1[1]], q1, [q.x, q.y]].filter((pt, i, arr) => !i || pt[0] !== arr[i - 1][0] || pt[1] !== arr[i - 1][1]); };
    if (a && b && a.sheet === b.sheet) put(a.sheet, route(a, b), null);
    else if (a && b) {
      const stub = (p, to) => { const [dx, dy] = away(p.side); return [[p.x, p.y], [p.x + dx * 24, p.y + dy * 24]].map(([x, y]) => [x, y]).concat(to ? [] : []); };
      put(a.sheet, stub(a, b.sheet), { to: sheetRef(sheets, b.sheet), first: true });
      put(b.sheet, stub(b, a.sheet).reverse(), { to: sheetRef(sheets, a.sheet), first: false });
    } else if (a || b) {
      const p = a || b, [dx, dy] = away(p.side);
      put(p.sheet, a ? [[p.x, p.y], [p.x + dx * 30, p.y + dy * 30]] : [[p.x + dx * 30, p.y + dy * 30], [p.x, p.y]], { to: '', open: true, first: true });
    }
  }
  return { format: 'cc-pid-sheet', version: 1, name: g.name, sheets };
}
const sheetRef = (sheets, i) => (sheets[i] ? sheets[i].id : '');

/** What a drawn P&ID shows, as a snapshot for `merge('pid', …)` — the way back from the drawing. */
export function readPid(doc) {
  const snap = { equipment: [], lines: [], items: [] };
  if (!doc || doc.format !== 'cc-pid-sheet') return snap;
  const seenLine = new Set();
  for (const sh of doc.sheets || []) {
    for (const e of sh.equipment || []) snap.equipment.push({ tag: e.tag, kind: e.kind, nozzles: (e.nozzles || []).map((n) => ({ name: n.name, size: n.size, flow: n.side === 'left' ? 'SINK' : 'SOURCE' })) });
    for (const l of sh.lines || []) {
      if (!seenLine.has(l.number)) { seenLine.add(l.number); snap.lines.push({ number: l.number, size: l.size, spec: l.spec, service: l.service, length: l.length, from: l.from, to: l.to }); }
      for (const i of l.items || []) snap.items.push({ tag: i.tag, line: l.number, cls: i.cls, kind: i.kind, loc: i.loc });
    }
  }
  return snap;
}

// ---- drawing (all shapes ours, from the common ideas of ISO 10628 and ISA-5.1; no vendor or standard artwork)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const f1 = (v) => Math.round(v * 100) / 100;
function valveSvg(kind, x, y, dir, pending) {
  const s = 3.2, d = dir < 0 ? -1 : 1, st = pending ? ' stroke-dasharray="1.2 1"' : '';
  const bow = `M${f1(x - s * d)} ${f1(y - s * 0.65)} L${f1(x + s * d)} ${f1(y + s * 0.65)} L${f1(x + s * d)} ${f1(y - s * 0.65)} L${f1(x - s * d)} ${f1(y + s * 0.65)} Z`;
  let extra = '';
  if (kind === 'globe') extra = `<circle cx="${f1(x)}" cy="${f1(y)}" r="1" fill="currentColor"/>`;
  else if (kind === 'ball') extra = `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.1" fill="none" stroke="currentColor" stroke-width="0.3"/>`;
  else if (kind === 'butterfly') extra = `<line x1="${f1(x)}" y1="${f1(y - 2.4)}" x2="${f1(x)}" y2="${f1(y + 2.4)}"/>`;
  else if (kind === 'control') extra = `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y - 4)}"/><path d="M${f1(x - 2.2)} ${f1(y - 4)} A2.2 2.2 0 0 1 ${f1(x + 2.2)} ${f1(y - 4)} Z" fill="none"/>`;
  if (kind === 'check') return `<g class="valve check"${st}><path d="M${f1(x - s)} ${f1(y - s * 0.65)} L${f1(x + s * d)} ${f1(y)} L${f1(x - s)} ${f1(y + s * 0.65)} Z" fill="none"/><line x1="${f1(x + s * d)}" y1="${f1(y - s * 0.65)}" x2="${f1(x + s * d)}" y2="${f1(y + s * 0.65)}"/></g>`;
  if (kind === 'psv') return `<g class="valve psv"${st}><path d="M${f1(x - 2.6)} ${f1(y + 2.6)} L${f1(x + 2.6)} ${f1(y + 2.6)} L${f1(x)} ${f1(y - 0.6)} Z" fill="none"/><rect x="${f1(x - 2.6)}" y="${f1(y - 3.6)}" width="5.2" height="3" fill="none"/></g>`;
  return `<g class="valve ${esc(kind)}"${st}><path d="${bow}" fill="none"/>${extra}</g>`;
}
function balloonSvg(i, ly) {
  const r = 4.4, cx = i.x, cy = i.y - 14, m = /^([A-Z]+)-?(.*)$/.exec(i.tag) || [0, i.kind, i.tag];
  const bar = i.loc === 'panel' ? `<line x1="${f1(cx - r)}" y1="${f1(cy)}" x2="${f1(cx + r)}" y2="${f1(cy)}"/>` : i.loc === 'aux' ? `<line x1="${f1(cx - r)}" y1="${f1(cy)}" x2="${f1(cx + r)}" y2="${f1(cy)}" stroke-dasharray="1 0.8"/>` : '';
  return `<g class="instrument ${esc(i.loc || 'field')}"${i.pending ? ' stroke-dasharray="1.2 1"' : ''}><line x1="${f1(cx)}" y1="${f1(cy + r)}" x2="${f1(i.x)}" y2="${f1(ly)}" stroke-width="0.25"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="none"/>${bar}<text x="${f1(cx)}" y="${f1(cy - 0.7)}" text-anchor="middle" font-size="2.4" stroke="none" fill="currentColor">${esc(m[1])}</text><text x="${f1(cx)}" y="${f1(cy + 2.6)}" text-anchor="middle" font-size="2.2" stroke="none" fill="currentColor">${esc(m[2])}</text></g>`;
}
function equipSvg(e) {
  const { x, y, w, h } = e, st = e.pending ? ' stroke-dasharray="2 1.2"' : '';
  let body;
  if (e.kind === 'vessel') body = `<path d="M${f1(x)} ${f1(y + 6)} Q${f1(x)} ${f1(y)} ${f1(x + w / 2)} ${f1(y)} Q${f1(x + w)} ${f1(y)} ${f1(x + w)} ${f1(y + 6)} L${f1(x + w)} ${f1(y + h - 6)} Q${f1(x + w)} ${f1(y + h)} ${f1(x + w / 2)} ${f1(y + h)} Q${f1(x)} ${f1(y + h)} ${f1(x)} ${f1(y + h - 6)} Z" fill="none"/>`;
  else if (e.kind === 'tank') body = `<path d="M${f1(x)} ${f1(y + 8)} L${f1(x + w / 2)} ${f1(y)} L${f1(x + w)} ${f1(y + 8)} L${f1(x + w)} ${f1(y + h)} L${f1(x)} ${f1(y + h)} Z" fill="none"/>`;
  else if (e.kind === 'column') body = `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="5" fill="none"/>` + [0.25, 0.4, 0.55, 0.7, 0.85].map((f) => `<line x1="${f1(x)}" y1="${f1(y + h * f)}" x2="${f1(x + w)}" y2="${f1(y + h * f)}" stroke-width="0.25"/>`).join('');
  else if (e.kind === 'pump') body = `<circle cx="${f1(x + w / 2)}" cy="${f1(y + h / 2)}" r="${f1(w / 2)}" fill="none"/><path d="M${f1(x + w / 2)} ${f1(y)} L${f1(x + w)} ${f1(y + h / 2 - 1)}" fill="none"/>`;
  else if (e.kind === 'exchanger') body = `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="${f1(h / 2)}" fill="none"/><path d="M${f1(x + 5)} ${f1(y + h / 2)} l3 -4 l3 8 l3 -8 l3 8 l3 -8 l3 8 l3 -4" fill="none" stroke-width="0.3"/>`;
  else body = `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" fill="none"/>`;
  return `<g class="equipment ${esc(e.kind)}"${st}>${body}<text x="${f1(x + w / 2)}" y="${f1(y + h + 5)}" text-anchor="middle" font-size="3" stroke="none" fill="currentColor">${esc(e.tag)}</text></g>`;
}
/** One sheet (index) of a layout as SVG, millimetres on paper. labels = {pending, offsheet, open, sheet} words in the person's language. */
export function toSvg(doc, index = 0, opts = {}) {
  const sh = doc.sheets[index], L = { pending: 'pending in the other view', offsheet: 'to sheet', open: 'open end', sheet: 'Sheet', of: 'of', ...(opts.labels || {}) };
  if (!sh) return '';
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sh.w} ${sh.h}" width="${sh.w}mm" height="${sh.h}mm" fill="none" stroke="currentColor" stroke-width="0.4" font-family="sans-serif">`, `<rect x="5" y="5" width="${sh.w - 10}" height="${sh.h - 10}"/>`];
  for (const e of sh.equipment) out.push(equipSvg(e));
  for (const l of sh.lines) {
    out.push(`<g class="line" data-line="${esc(l.number)}"><polyline points="${l.path.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')}"${l.pending ? ' stroke-dasharray="2 1.2"' : ''}/>`);
    const mid = l.path[Math.floor(l.path.length / 2)], p0 = l.path[Math.max(0, Math.floor(l.path.length / 2) - 1)];
    out.push(`<text x="${f1((mid[0] + p0[0]) / 2)}" y="${f1(Math.min(mid[1], p0[1]) - 2)}" text-anchor="middle" font-size="2.4" stroke="none" fill="currentColor">${esc(l.number)}</text>`);
    for (const i of l.items) out.push(i.cls === 'valve' ? valveSvg(i.kind, i.x, i.y, i.dir, i.pending) + `<text x="${f1(i.x)}" y="${f1(i.y + 7)}" text-anchor="middle" font-size="2.2" stroke="none" fill="currentColor">${esc(i.tag)}</text>` : balloonSvg(i, i.y));
    if (l.offsheet) { const e = l.path[l.path.length - 1]; out.push(`<g class="offsheet"><path d="M${f1(e[0])} ${f1(e[1] - 3)} l7 3 l-7 3 Z"/><text x="${f1(e[0] + 9)}" y="${f1(e[1] + 1)}" font-size="2.2" stroke="none" fill="currentColor">${esc(L.offsheet + ' ' + l.offsheet)}</text></g>`); }
    if (l.open) { const e = l.path[l.path.length - 1]; out.push(`<text x="${f1(e[0] + 2)}" y="${f1(e[1] - 2)}" font-size="2.2" stroke="none" fill="currentColor">${esc(L.open)}</text>`); }
    out.push('</g>');
  }
  out.push(`<text x="10" y="${sh.h - 10}" font-size="3.2" stroke="none" fill="currentColor">${esc(doc.name || '')}  ${esc(L.sheet)} ${index + 1} ${esc(L.of)} ${doc.sheets.length}</text></svg>`);
  return out.join('');
}

// ------------------------------------------------------------------------------------------------------------------ the shared connectivity model
/** The graph as a cc-schematic (domain pid): equipment symbols with a pin per nozzle, valves and instruments with two pins, one wire per hop of each line. */
export function toSchematic(g) {
  const s = new Schematic(g.name, 'pid'); s.addSheet('Plant', 's1');
  const eq = g.live(g.equipment);
  eq.forEach((e, i) => s.addSymbol({ id: e.id, tag: e.tag, type: 'equipment:' + e.kind, sheet: 's1', col: i, pins: e.nozzles.map((n) => ({ id: n.name, name: n.name, kind: 'io' })), attrs: { kind: e.kind } }));
  for (const l of g.live(g.lines)) {
    const chain = [];
    const end = (x) => { const e = x && g.equip(x.equip); return e && s.pin(e.id + '.' + x.nozzle) ? e.id + '.' + x.nozzle : null; };
    const a = end(l.from), b = end(l.to);
    const its = g.itemsOn(l.id);
    its.forEach((it, k) => { const sym = s.addSymbol({ id: it.id, tag: it.tag, type: it.cls + ':' + it.kind, sheet: 's1', col: 100 + k, pins: [{ id: 'in', kind: 'pass' }, { id: 'out', kind: 'pass' }], through: [['in', 'out']] }); if (sym) chain.push(it.id); });
    const pts = [a, ...chain.flatMap((id) => [id + '.in', id + '.out']), b];
    const hops = []; for (let i = 0; i < pts.length; i += 1) hops.push(pts[i]);
    // wires: from → first.in, first.out → second.in …, last.out → to (an open end has no wire on that side)
    const seq = [a, ...chain.map((id) => [id + '.in', id + '.out']).flat(), b].filter((x) => x);
    for (let i = 0; i + 1 < seq.length; i += 1) { const isInside = seq[i].endsWith('.in') && seq[i + 1].endsWith('.out'); if (!isInside) s.addWire(seq[i], seq[i + 1], { number: l.number, id: l.id + '-' + i }); }
  }
  return s;
}
/** Plausibility checks in the Problems shape: two things share a tag, a line with no end, a line size the nozzle it joins does not have, what is pending. */
export function checkPlant(g) {
  const out = [], seen = new Map();
  for (const t of [...g.live(g.equipment).map((e) => e.tag), ...g.live(g.items).map((i) => i.tag)]) seen.set(t, (seen.get(t) || 0) + 1);
  for (const [t, n] of seen) if (n > 1) out.push(problem('plant-dup-tag', 'error', 'The tag ' + t + ' is used ' + n + ' times', { tag: t }));
  for (const l of g.live(g.lines)) {
    if (!l.from && !l.to) out.push(problem('plant-line-loose', 'warning', 'Line ' + l.number + ' is joined to no equipment at either end', { line: l.id }));
    for (const [side, end] of [['from', l.from], ['to', l.to]]) {
      if (!end) continue;
      const e = g.equip(end.equip), n = e && e.nozzles.find((z) => z.name === end.nozzle);
      if (!e || !n) out.push(problem('plant-line-nozzle', 'error', 'Line ' + l.number + ' ' + side + ' ' + end.equip + '.' + end.nozzle + ' is not a nozzle in the graph', { line: l.id }));
      else if (n.size && l.size && String(n.size) !== String(l.size)) out.push(problem('plant-size', 'warning', 'Line ' + l.number + ' is ' + l.size + '" but nozzle ' + end.equip + '.' + end.nozzle + ' is ' + n.size + '"', { line: l.id }));
    }
  }
  for (const v of VIEWS) for (const p of g.pending(v)) out.push(problem('plant-pending-' + v, 'info', (v === 'three' ? '3D' : 'P&ID') + ' must ' + p.op + ' ' + p.label, { view: v, id: p.id }));
  return out;
}
