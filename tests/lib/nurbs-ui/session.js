/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs-ui speaks keys (nurbs.ui.*, nurbs.cmd.*, nurbs.err.*); the host's t() words them. */
/**
 * session.js — cc-nurbs-ui (0.8 round 3, session model_PART_3; SU.747b mount): what a host's Surfaces panel does between a click and
 * cc-nurbs' tools.run, with no DOM, so every host (ModelCraft, PartCraft, SuperCad Studio) behaves the same and Node tests it. The geometry
 * and the numbers stay in lib/nurbs; this file only turns picks + typed options into a command's arguments and keeps the patch set's history.
 *
 *   new Session(N, { doc, onChange }) — N = the host's copy of cc-nurbs (`import * as N from './nurbs/index.js'`)
 *     .doc                          the patch set now (cc-nurbs doc.js shape)
 *     .start(cmdId) / .cancel()     a command collects picks; .cmd, .picks, .need() → { kind, n, have } of what is still missing (null = ready)
 *     .pick(ref)                    ref = { id, sub? } (sub: an edge u0|u1|v0|v1 of a surface, start|end of a curve); false when it does not fit;
 *                                   a solid is picked by its own id or by any of its faces (0.9 DC.54)
 *     .env                          what the commands run with: env.manifold = the mesh engine for solid Booleans (the host loads it)
 *     .extra()                      the kind a command takes any number of (solid.make: surfaces; none picked = all of them) or null
 *     .setPoints(pts)               the points a curve.points / curve.cvs command is made from ([[x, y, z] mm, …])
 *     .fields() → [{ name, kind: number|int|continuity|vec3|bool|frame|dir, value }]   the command's options as form fields
 *     .setOption(name, text)        → null | { key, vars } (a key for the host's t(): the field's error)
 *     .run(label) → { ok, ids, report, error? { key, vars } }   one history step per run (the doc is replaced, never changed)
 *     .remove(id) · .rename(id, name) · .setHidden(id, on) · .importDoc(doc) (merge another patch set's items, new ids, with their
 *     trims and solids) · .removeSolid(id, { faces }) (the group, or the group and its faces)
 *     .undo() / .redo() → label | null · .canUndo / .canRedo · .load(doc) (a file opened: history cleared) · .clear()
 *   argsFor(cmdId, picks, opts) → the tools.run arguments (exported for tests)
 *   needsOf(N, cmdId, picks) → the first unmet need, or null
 */

const MAX_HISTORY = 100;
const EDGE = /^[uv][01]$/;
const END = /^(start|end)$/;

/** What each pick slot of a command is: the kind of thing and, for edges and ends, that a sub-part is needed. */
function slots(N, cmdId) {
  const cmd = N.tools.COMMANDS[cmdId];
  if (!cmd) return [];
  const out = [];
  for (const need of cmd.needs) {
    if (need.kind === 'points') continue;
    const kind = need.kind === 'edge' ? 'surface' : need.kind === 'end' ? 'curve' : need.kind;   // curve | surface | solid
    for (let i = 0; i < need.n; i++) out.push({ kind, sub: need.kind === 'edge' ? 'edge' : need.kind === 'end' ? 'end' : null });
  }
  return out;
}

export function needsOf(N, cmdId, picks, points = null) {
  const cmd = N.tools.COMMANDS[cmdId];
  if (!cmd) return null;
  const pn = cmd.needs.find((n) => n.kind === 'points');
  if (pn && !(points && points.length >= pn.n)) return { kind: 'points', n: pn.n, have: points ? points.length : 0 };
  const sl = slots(N, cmdId);
  if (picks.length < sl.length) { const s = sl[picks.length]; return { kind: s.sub || s.kind, n: sl.length, have: picks.length }; }
  return null;
}

/** tools.run arguments from the picks, in the order the person picked them (tools.js § run reads these names). */
export function argsFor(cmdId, picks, opts = {}) {
  const a = { ...opts };
  const id = (i) => picks[i] && picks[i].id;
  const sub = (i) => picks[i] && picks[i].sub;
  switch (cmdId) {
    case 'curve.points': case 'curve.cvs': break;
    case 'curve.match': Object.assign(a, { curve: id(0), end: sub(0), target: id(1), targetEnd: sub(1) }); break;
    case 'curve.blend': Object.assign(a, { a: id(0), endA: sub(0), b: id(1), endB: sub(1) }); break;
    case 'surface.network': {
      const k = Math.max(2, Math.min(picks.length - 2, Number.isInteger(a.profiles) ? a.profiles : Math.floor(picks.length / 2)));
      Object.assign(a, { profiles: picks.slice(0, k).map((p) => p.id), guides: picks.slice(k).map((p) => p.id) });
      delete a.curves; break;
    }
    case 'surface.match': Object.assign(a, { surface: id(0), edge: sub(0), target: id(1), targetEdge: sub(1) }); break;
    case 'surface.blend': Object.assign(a, { a: id(0), edgeA: sub(0), b: id(1), edgeB: sub(1) }); break;
    case 'surface.trimCurve': Object.assign(a, { surface: id(0), curve: id(1) }); break;
    case 'surface.trimRect': case 'surface.trimCircle': case 'surface.untrim': a.surface = id(0); break;
    case 'surface.extend': Object.assign(a, { surface: id(0), edge: sub(0) }); break;
    case 'surface.offset': case 'surface.rebuild': case 'surface.insertKnot': case 'surface.elevate': a.surface = id(0); break;
    case 'solid.box': case 'solid.cylinder': case 'solid.sphere': break;
    case 'solid.make': a.surfaces = picks.map((p) => p.id); break;
    case 'solid.union': case 'solid.subtract': case 'solid.intersect': Object.assign(a, { a: id(0), b: id(1) }); break;
    case 'solid.fillet': Object.assign(a, { a: id(0), b: id(1) }); break;
    case 'solid.fillet_edges': a.faces = picks.map((p) => p.id); break;
    case 'solid.thicken': a.surface = id(0); break;
    case 'solid.ungroup': a.solid = id(0); break;
    case 'scan.fit': case 'scan.solid': break;
    default: a.curves = picks.map((p) => p.id);
  }
  return a;
}

/** The kind of form field an option is, from its default value and its name. */
function fieldKind(name, v) {
  if (name === 'continuity') return 'continuity';
  if (name === 'frame') return 'frame';
  if (name === 'dir' && typeof v === 'string') return 'dir';
  if (typeof v === 'boolean') return 'bool';
  if (Array.isArray(v) && v.length === 3) return 'vec3';
  if (Array.isArray(v) && v.length === 2) return 'pair';
  if (['degree', 'times', 'by', 'count', 'nu', 'nv', 'du', 'dv', 'maxPatches'].includes(name)) return 'int';
  return 'number';
}
const LIMITS = { radius: [0.001, 1e6], radius2: [0, 1e6], thickness: [0.001, 1e6], height: [0.001, 1e6], u0: [0, 1], u1: [0, 1], v0: [0, 1], v1: [0, 1], u: [0, 1], v: [0, 1], r: [0.001, 0.5], degree: [1, 15], times: [1, 15], by: [1, 10], count: [2, 1000], nu: [2, 1000], nv: [2, 1000], du: [1, 15], dv: [1, 15], at: [0, 1], tol: [1e-6, 1000], minShare: [0.0005, 0.5], maxPatches: [1, 200], gap: [1e-4, 1000], angle: [-360, 360] };

export class Session {
  constructor(N, { doc = null, onChange = () => {} } = {}) {
    this.N = N; this.onChange = onChange;
    this.doc = doc ? N.doc.cleanDoc(doc) : N.doc.newDoc();
    this.past = []; this.future = [];
    this.cmd = null; this.picks = []; this.points = null; this.opts = {};
    this.env = {};
  }
  extra() { return this.cmd ? this.N.tools.COMMANDS[this.cmd].more || null : null; }
  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
  /** A file opened (or a new one): its patch set, history cleared. */
  load(doc) { this.doc = doc ? this.N.doc.cleanDoc(doc) : this.N.doc.newDoc(); this.past = []; this.future = []; this.cancel(); this.onChange('load'); }
  clear() { this.load(null); }
  start(cmdId) {
    if (!this.N.tools.COMMANDS[cmdId]) return false;
    this.cmd = cmdId; this.picks = []; this.points = null; this.opts = { ...this.N.tools.COMMANDS[cmdId].options };
    if (cmdId === 'surface.network') this.opts.profiles = 2;
    this.onChange('cmd');
    return true;
  }
  cancel() { if (this.cmd) { this.cmd = null; this.picks = []; this.points = null; this.opts = {}; this.onChange('cmd'); } }
  need() { return this.cmd ? needsOf(this.N, this.cmd, this.picks, this.points) : null; }
  /** Add a pick; a surface command that wants an edge needs ref.sub = u0|u1|v0|v1, a curve end command start|end. */
  pick(ref) {
    if (!this.cmd || !ref || typeof ref.id !== 'string') return false;
    const sl = slots(this.N, this.cmd);
    const net = this.cmd === 'surface.network', more = this.extra();
    const s = sl[this.picks.length] || (net ? { kind: 'curve', sub: null } : more ? { kind: more, sub: null } : null);   // a network takes more than four curves
    if (!s) return false;
    if (s.kind === 'solid') {   // by the solid's own id, or by one of its faces (a click in the view)
      const SO = this.N.solid, b = SO.solid(this.doc, ref.id) || SO.solidOf(this.doc, ref.id);
      if (!b || this.picks.some((p) => p.id === b.id)) return false;
      this.picks.push({ id: b.id });
      this.onChange('pick');
      return true;
    }
    const it = this.N.doc.item(this.doc, ref.id);
    if (!it || it.kind !== s.kind) return false;
    if (s.sub === 'edge' && !EDGE.test(ref.sub || '')) return false;
    if (s.sub === 'end' && !END.test(ref.sub || '')) return false;
    if (this.cmd === 'solid.fillet_edges') { if (this.picks.length % 2 === 1 && this.picks.at(-1).id === ref.id) return false; }   // pairs of faces, one pair per edge: a face may be in several pairs, never twice in one
    else if (!s.sub && this.picks.some((p) => p.id === ref.id)) return false;   // the same curve twice is never meant
    this.picks.push(s.sub ? { id: ref.id, sub: ref.sub } : { id: ref.id });
    this.onChange('pick');
    return true;
  }
  unpick() { if (this.picks.length) { this.picks.pop(); this.onChange('pick'); } }
  setPoints(pts) {
    this.points = Array.isArray(pts) ? pts.filter((p) => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite)).map((p) => p.slice()) : null;
    this.onChange('pick');
  }
  fields() {
    if (!this.cmd) return [];
    return Object.entries(this.opts).map(([name, value]) => ({ name, kind: name === 'profiles' ? 'int' : fieldKind(name, this.N.tools.COMMANDS[this.cmd].options[name] ?? value), value }));
  }
  /** One option from the text in its field (numbers in mm, angles in degrees, a share 0–1 for `at`). */
  setOption(name, text) {
    if (!this.cmd || !(name in this.opts)) return { key: 'nurbs.ui.err.option' };
    const kind = name === 'profiles' ? 'int' : fieldKind(name, this.N.tools.COMMANDS[this.cmd].options[name] ?? this.opts[name]);
    const s = String(text ?? '').trim();
    const num = (x) => { const v = Number(String(x).trim().replace(',', '.')); return Number.isFinite(v) ? v : NaN; };
    let v;
    if (kind === 'continuity') { if (!['G0', 'G1', 'G2'].includes(s)) return { key: 'nurbs.ui.err.continuity' }; v = s; }
    else if (kind === 'frame') { if (!['rmf', 'fixed'].includes(s)) return { key: 'nurbs.ui.err.option' }; v = s; }
    else if (kind === 'dir') { if (!['u', 'v'].includes(s)) return { key: 'nurbs.ui.err.option' }; v = s; }
    else if (kind === 'bool') v = s === 'true' || s === '1' || s === 'on';
    else if (kind === 'vec3' || kind === 'pair') {
      const parts = s.split(/[\s,;]+/).filter(Boolean).map(num);   // "0, 0, 10" or "0 0 10" (a decimal point, never a comma, inside a vector)
      const n = kind === 'vec3' ? 3 : 2;
      if (parts.length !== n || parts.some(Number.isNaN)) return { key: kind === 'vec3' ? 'nurbs.ui.err.vec3' : 'nurbs.ui.err.pair' };
      v = parts;
    } else {
      v = num(s);
      if (Number.isNaN(v)) return { key: 'nurbs.ui.err.number' };
      if (kind === 'int' && !Number.isInteger(v)) return { key: 'nurbs.ui.err.whole' };
      const lim = name === 'profiles' ? [2, 1000] : LIMITS[name];
      if (lim && (v < lim[0] || v > lim[1])) return { key: 'nurbs.ui.err.range', vars: { min: lim[0], max: lim[1] } };
      if (name === 'distance' && v === 0) return { key: 'nurbs.ui.err.zero' };
    }
    this.opts[name] = v;
    return null;
  }
  push(doc, label) {
    this.past.push({ doc: this.doc, label });
    if (this.past.length > MAX_HISTORY) this.past.shift();
    this.future = [];
    this.doc = doc;
    this.onChange('doc', label);
  }
  /** Run the collected command: one history step. Errors from cc-nurbs come back as { key, vars }, nothing changes. */
  run(label = '') {
    if (!this.cmd) return { ok: false, error: { key: 'nurbs.ui.err.no_command' } };
    const miss = this.need();
    if (miss) return { ok: false, error: { key: 'nurbs.ui.need.' + miss.kind, vars: { n: miss.n, have: miss.have } } };
    const args = argsFor(this.cmd, this.picks, this.opts);
    if (this.points) args.points = this.points;
    let r;
    try { r = this.N.tools.run(this.doc, this.cmd, args, this.env); } catch (e) {
      if (e && typeof e.code === 'string') return { ok: false, error: { key: e.code, vars: e.vars || {} } };
      return { ok: false, error: { key: 'nurbs.ui.err.failed', vars: { error: String(e && e.message || e) } } };
    }
    const cmd = this.cmd;
    this.push(r.doc, label || cmd);
    this.cmd = null; this.picks = []; this.points = null; this.opts = {};
    this.onChange('cmd');
    return { ok: true, cmd, ids: r.ids, report: r.report, problems: r.problems };
  }
  /** A fix from Problems ("Match"): surface.match with the problem's own arguments. */
  match({ a, edgeA, b, edgeB, want }, label = 'surface.match') {
    let r;
    try { r = this.N.tools.run(this.doc, 'surface.match', { surface: a, edge: edgeA, target: b, targetEdge: edgeB, continuity: want }); } catch (e) {
      return { ok: false, error: { key: e && e.code ? e.code : 'nurbs.ui.err.failed', vars: (e && e.vars) || {} } };
    }
    this.push(r.doc, label);
    return { ok: true, report: r.report };
  }
  remove(id, label = 'remove') { if (!this.N.doc.item(this.doc, id)) return false; this.push(this.N.doc.remove(this.doc, id), label); return true; }
  rename(id, name, label = 'rename') {
    if (!this.N.doc.item(this.doc, id)) return false;
    const clean = this.N.doc.cleanDoc({ ...this.doc, items: this.doc.items.map((i) => (i.id === id ? { ...i, name: String(name ?? '') } : i)) });
    this.push(clean, label); return true;
  }
  setHidden(id, on, label = 'hide') {
    if (!this.N.doc.item(this.doc, id)) return false;
    this.push({ ...this.doc, items: this.doc.items.map((i) => { if (i.id !== id) return i; const c = { ...i }; if (on) c.hidden = true; else delete c.hidden; return c; }) }, label);
    return true;
  }
  /** Add another patch set's curves and surfaces (an imported STEP or IGES), each with a fresh id; its links come along. */
  importDoc(other, label = 'import') {
    const src = this.N.doc.cleanDoc(other);
    let d = this.doc;
    const ids = new Map();
    for (const it of src.items) {
      const r = this.N.doc.add(d, it.kind, it[it.kind], { name: it.name }); d = r.doc; ids.set(it.id, r.id);
      if (it.trim) d = this.N.doc.setTrim(d, r.id, it.trim);   // a trimmed face stays trimmed
    }
    for (const l of src.links) if (ids.has(l.a) && ids.has(l.b)) d = this.N.doc.link(d, ids.get(l.a), l.edgeA, ids.get(l.b), l.edgeB, l.want);
    const sols = this.N.solid.solids(src).map((b) => ({ name: b.name, faces: b.faces.map((f) => ids.get(f)).filter(Boolean) })).filter((b) => b.faces.length);
    if (sols.length) {   // the solids come along as groups of the new faces (checked again by cleanDoc)
      let n = this.N.solid.solids(d).length;
      const used = new Set([...d.items.map((i) => i.id), ...this.N.solid.solids(d).map((b) => b.id)]);
      const add = sols.map((b) => { do n++; while (used.has('b' + n)); used.add('b' + n); return { id: 'b' + n, name: b.name, faces: b.faces }; });
      d = this.N.doc.cleanDoc({ ...d, solids: [...this.N.solid.solids(d), ...add] });
    }
    if (!src.items.length) return { ok: false, error: { key: 'nurbs.ui.err.import_empty' } };
    this.push(d, label);
    return { ok: true, n: src.items.length, ids: [...ids.values()] };
  }
  removeSolid(id, { faces = false } = {}, label = 'remove') {
    if (!this.N.solid.solid(this.doc, id)) return false;
    this.push(this.N.solid.removeSolid(this.doc, id, { faces }), label); return true;
  }
  undo() { const s = this.past.pop(); if (!s) return null; this.future.push({ doc: this.doc, label: s.label }); this.doc = s.doc; this.cancel(); this.onChange('doc', s.label); return s.label; }
  redo() { const s = this.future.pop(); if (!s) return null; this.past.push({ doc: this.doc, label: s.label }); this.doc = s.doc; this.cancel(); this.onChange('doc', s.label); return s.label; }
}
