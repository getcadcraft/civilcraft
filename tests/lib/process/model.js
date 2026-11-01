/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — the one living model (0.8 Track CH, CH.4, decision D-CH5). DOM-free, deterministic, no imports outside lib/process.
 *
 * A PROCESS ID ties a flowsheet unit ↔ a P&ID tag ↔ 3D equipment, and a flowsheet stream ↔ a P&ID line number ↔ a 3D pipe run. The flowsheet's own
 * ids are the keys and are never re-keyed: the P&ID tag, line number and 3D guid hang off them as links. The whole thing is stored ONCE as a
 * `cadcraft-process` block (this file's `toJSON`) saved with each file and as `process.json` in a SuperCad Studio `.ccproject`.
 *
 *   model = { format: 'cadcraft-process', version: 1, name, flowsheet (the cc-process definition), links: { <flowsheet id>: link }, limits?, layout?: { equipment, runs } (3D, mm) }
 *   link  (unit)   { kind: 'unit',   tag?, plant?: guid }
 *   link  (stream) { kind: 'stream', ln?, run?: guid, size?, L?, dz?, fittings?, mu?, eps?, dpMax?, sizeBy?: 'pid'|'3d' }
 *
 * The two drawings are described to this file in neutral terms (the add-ons build them from their own models):
 *   pid   = { equipment: [{ uid, tag, type }], lines: [{ ln, size, svc, from: [labels], to: [labels] }], instruments?, valves?, signals? }
 *           a label is a P&ID terminal as `trace` writes it: "P-101 (discharge)" or just "P-101"
 *   plant = { equipment: [{ guid, tag }], runs: [{ guid, tag?, system?, size (NPS text), points: [[x, y, z] mm], valves: [{ s, kind }] }] }
 *
 *   newModel · cleanModel · toJSON · fromJSON · toChunks · fromChunks · projectEntry
 *   linkUnit · linkStream · autoLink(model, pid, plant)
 *   runGeometry(run)                  → { L (m), dz (m), fittings, bends }
 *   hydraulics(model, result, plant?) → per stream with a line: { id, ln, size, D, v, Re, dp, ... }
 *   streamTable(model, result)        → { name, keys, columns, rows } for the P&ID (drawn as a table) and for CSV
 *   applyChange(model, change, ctx)   → { result, hydraulics, edits: { pid: [...], plant: [...] }, table, problems }   (a size change reruns all of it)
 *   check(model, result, ctx)         → Problems (shared shape) where the drawings, the flowsheet and the hydraulics disagree
 */
import { solve, thermoFor } from './flowsheet.js';
import { problem } from './report.js';
import { lineDrop, fluidOf, insideDiameter, npsKey, nominalOf, erosionalVelocity } from './hydraulics.js';
import { massFlow } from './stream.js';

export const FORMAT = 'cadcraft-process';
export const VERSION = 1;
export const LIMITS = { links: 4000, text: 80, json: 4 * 1024 * 1024 };

const str = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
export const norm = (tag) => String(tag ?? '').toUpperCase().replace(/\(.*\)/, '').replace(/[^A-Z0-9]/g, '');
const termTag = (label) => norm(String(label).replace(/\s*\(.*\)\s*$/, ''));

export function newModel(name, flowsheet) {
  return { format: FORMAT, version: VERSION, name: str(name, 120), flowsheet: flowsheet || { v: 1, thermo: { components: [], model: 'pr' }, feeds: {}, units: [] }, links: {} };
}

/** Untrusted data (a file) → clean model | null. */
export function cleanModel(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || !(raw.version >= 1) || raw.version > VERSION) return null;
  const fs = raw.flowsheet;
  if (!fs || typeof fs !== 'object' || !fs.thermo || !Array.isArray(fs.units)) return null;
  const m = newModel(raw.name, JSON.parse(JSON.stringify(fs)));
  const ids = new Set([...Object.keys(fs.feeds || {}), ...fs.units.map((u) => u.id), ...fs.units.flatMap((u) => [...(u.in || []), ...(u.out || [])])]);
  let n = 0;
  for (const [id, l] of Object.entries(raw.links && typeof raw.links === 'object' ? raw.links : {})) {
    if (!l || typeof l !== 'object' || ++n > LIMITS.links) continue;
    const isUnit = fs.units.some((u) => u.id === id);
    if (!ids.has(id)) continue;
    const c = isUnit ? { kind: 'unit' } : { kind: 'stream' };
    if (l.tag) c.tag = str(l.tag, 24);
    if (l.plant) c.plant = str(l.plant, 64);
    if (!isUnit) {
      for (const k of ['ln', 'run', 'size', 'sizeBy', 'fittingsNote']) if (l[k] != null && l[k] !== '') c[k] = str(l[k]);
      if (c.sizeBy && !['pid', '3d'].includes(c.sizeBy)) delete c.sizeBy;
      for (const k of ['L', 'dz', 'mu', 'eps', 'dpMax', 'K']) if (num(l[k]) !== undefined) c[k] = l[k];
      if (l.fittings && typeof l.fittings === 'object') c.fittings = Object.fromEntries(Object.entries(l.fittings).filter(([, v]) => num(v) !== undefined && v >= 0).slice(0, 30).map(([k, v]) => [str(k, 30), v]));
    } else if (l.ln) c.ln = str(l.ln);   // a `pipe` unit carries its line number
    m.links[id] = c;
  }
  if (raw.layout && typeof raw.layout === 'object') {   // the 3D layout the assistant proposed (BimCraft's Plant takes it into its equipment table)
    const f = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
    const equipment = (Array.isArray(raw.layout.equipment) ? raw.layout.equipment : []).slice(0, 200).filter((e) => e && typeof e === 'object').map((e) => ({ type: str(e.type, 24), tag: str(e.tag, 24), x: f(e.x), y: f(e.y), z: f(e.z), rot: f(e.rot), params: e.params && typeof e.params === 'object' ? JSON.parse(JSON.stringify(e.params)) : {} }));
    const ep = (x) => (x && typeof x === 'object' ? { equip: str(x.equip, 24), nozzle: str(x.nozzle, 24) } : null);
    const runs = (Array.isArray(raw.layout.runs) ? raw.layout.runs : []).slice(0, 400).filter((r) => r && typeof r === 'object').map((r) => ({ tag: str(r.tag), size: str(r.size, 12), system: str(r.system), from: ep(r.from), to: ep(r.to), rackZ: f(r.rackZ, 4500), mat: str(r.mat, 16), cls: str(r.cls, 16) }));
    if (equipment.length || runs.length) m.layout = { equipment, runs };
  }
  return m;
}
export const toJSON = (m) => JSON.stringify(m);
export function fromJSON(text) { try { if (String(text).length > LIMITS.json) return null; return cleanModel(JSON.parse(text)); } catch { return null; } }

/** Split the JSON into pieces that fit one drawing object's extended data (DWG xdata is 16 KB per object): [{ i, n, s }]. */
export function toChunks(model, size = 11000) {
  const j = toJSON(model).replace(/[^\x20-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')), out = [];
  for (let i = 0; i < j.length; i += size) out.push({ i: out.length, s: j.slice(i, i + size) });
  return out.map((c) => ({ ...c, n: out.length }));
}
export function fromChunks(chunks) {
  const list = [...(chunks || [])].filter((c) => c && Number.isInteger(c.i) && typeof c.s === 'string').sort((a, b) => a.i - b.i);
  if (!list.length || list.some((c, k) => c.i !== k || c.n !== list.length)) return null;
  return fromJSON(list.map((c) => c.s).join(''));
}
/** The entry a SuperCad Studio .ccproject keeps (stored once; the apps' own files carry the same block). */
export const projectEntry = (model) => ({ path: 'process.json', text: toJSON(model) });

export function linkUnit(model, unitId, link) { model.links[unitId] = { ...(model.links[unitId] || {}), kind: 'unit', ...link }; return model; }
export function linkStream(model, streamId, link) { model.links[streamId] = { ...(model.links[streamId] || {}), kind: 'stream', ...link }; return model; }

// ---- flowsheet structure ------------------------------------------------------------------------------------------------------------
function structure(model) {
  const U = model.flowsheet.units, prod = {}, cons = {};
  for (const u of U) { for (const s of u.out || []) prod[s] = u; for (const s of u.in || []) (cons[s] ||= []).push(u); }
  const streams = [...new Set([...Object.keys(model.flowsheet.feeds || {}), ...U.flatMap((u) => [...(u.in || []), ...(u.out || [])])])];
  return { units: U, prod, cons, streams };
}
const unitTag = (model, u) => model.links[u.id]?.tag || u.id;

/**
 * Link by what the two drawings say. Equipment: the P&ID tag (or the 3D tag) equals the unit's tag or id. Streams: the P&ID line whose ends
 * are at the producing and the consuming unit; else a line number already linked; 3D runs: the run tagged with the line number.
 * Existing links are kept. → { linked: [...], unmatched: { units, streams, equipment, lines, runs }, ambiguous: [...] }
 */
export function autoLink(model, pid = null, plant = null) {
  const st = structure(model), linked = [], ambiguous = [];
  const usedLines = new Set(Object.values(model.links).map((l) => l.ln).filter(Boolean)), usedRuns = new Set(Object.values(model.links).map((l) => l.run).filter(Boolean));
  const eqByTag = new Map((pid?.equipment || []).map((e) => [norm(e.tag), e])), plByTag = new Map((plant?.equipment || []).map((e) => [norm(e.tag), e]));
  for (const u of st.units) {
    const t = norm(unitTag(model, u)), l = model.links[u.id] || { kind: 'unit' };
    const e = eqByTag.get(t), p = plByTag.get(t);
    if (e && !l.tag) { l.tag = e.tag; linked.push({ id: u.id, kind: 'unit', tag: e.tag }); }
    if (p && !l.plant) { l.plant = p.guid; linked.push({ id: u.id, kind: 'unit', plant: p.guid }); }
    if (l.tag || l.plant) model.links[u.id] = { ...l, kind: 'unit' };
  }
  for (const s of st.streams) {
    const l = model.links[s] || { kind: 'stream' };
    if (!l.ln && pid) {
      const p = st.prod[s], cs = st.cons[s] || [];
      const cands = pid.lines.filter((ln) => !usedLines.has(ln.ln) && (!p || (ln.from || []).some((x) => termTag(x) === norm(unitTag(model, p)))) && (!cs.length || cs.some((c) => (ln.to || []).some((x) => termTag(x) === norm(unitTag(model, c))))) && (p || cs.length));
      if (cands.length === 1) { l.ln = cands[0].ln; usedLines.add(l.ln); if (!l.size && cands[0].size) l.size = cands[0].size; linked.push({ id: s, kind: 'stream', ln: l.ln }); }
      else if (cands.length > 1) ambiguous.push({ id: s, candidates: cands.map((c) => c.ln) });
    }
    if (!l.run && plant && l.ln) {
      const r = plant.runs.filter((x) => !usedRuns.has(x.guid) && (norm(x.tag) === norm(l.ln) || norm(x.system) === norm(l.ln)));
      if (r.length === 1) { l.run = r[0].guid; usedRuns.add(l.run); linked.push({ id: s, kind: 'stream', run: l.run }); }
      else if (r.length > 1) ambiguous.push({ id: s, candidates: r.map((x) => x.guid) });
    }
    if (l.ln || l.run) model.links[s] = { ...l, kind: 'stream' };
  }
  const ln = new Set(Object.values(model.links).map((l) => l.ln).filter(Boolean)), rn = new Set(Object.values(model.links).map((l) => l.run).filter(Boolean));
  const tags = new Set(st.units.map((u) => norm(unitTag(model, u))));
  return {
    linked, ambiguous,
    unmatched: {
      units: st.units.filter((u) => !model.links[u.id]?.tag && !model.links[u.id]?.plant).map((u) => u.id),
      streams: st.streams.filter((s) => !model.links[s]?.ln).filter((s) => st.prod[s] || st.cons[s]).map((s) => s),
      equipment: (pid?.equipment || []).filter((e) => !tags.has(norm(e.tag))).map((e) => e.tag),
      lines: (pid?.lines || []).filter((x) => !ln.has(x.ln)).map((x) => x.ln),
      runs: (plant?.runs || []).filter((x) => !rn.has(x.guid)).map((x) => x.guid),
    },
  };
}

// ---- 3D geometry → line data ------------------------------------------------------------------------------------------------------------
const VALVE_K = { gate: 'gate_open', globe: 'globe_open', ball: 'ball_open', check: 'check_swing', butterfly: 'butterfly_open' };
/** A pipe run's length, rise and fittings (a corner of 60 degrees or more is a 90 degree elbow, a smaller turn a 45; mm in, metres out). */
export function runGeometry(run) {
  const p = run.points || []; let L = 0; const fittings = {};
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], (p[i][2] || 0) - (p[i - 1][2] || 0));
  let bends = 0;
  for (let i = 1; i + 1 < p.length; i++) {
    const a = [p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1], (p[i][2] || 0) - (p[i - 1][2] || 0)], b = [p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1], (p[i + 1][2] || 0) - (p[i][2] || 0)];
    const la = Math.hypot(...a), lb = Math.hypot(...b); if (!la || !lb) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (la * lb)))) * 180 / Math.PI;
    if (ang >= 60) { fittings.elbow90 = (fittings.elbow90 || 0) + 1; bends++; } else if (ang >= 15) { fittings.elbow45 = (fittings.elbow45 || 0) + 1; bends++; }
  }
  for (const v of run.valves || []) { const k = VALVE_K[v.kind]; if (k) fittings[k] = (fittings[k] || 0) + 1; }
  const dz = p.length > 1 ? ((p[p.length - 1][2] || 0) - (p[0][2] || 0)) / 1000 : 0;
  return { L: L / 1000, dz, fittings, bends };
}

/** Solve and keep the thermo package on the result (not enumerable: it never reaches JSON). */
export function solveModel(model) {
  const r = solve(model.flowsheet);
  Object.defineProperty(r, '_thermo', { value: thermoFor(model.flowsheet), enumerable: false });
  return r;
}
const runOf = (plant, guid) => (plant?.runs || []).find((r) => r.guid === guid);
const lineOf = (pid, ln) => (pid?.lines || []).find((x) => x.ln === ln);

/** The size that applies: the one just set, else the 3D run's, else the P&ID line's. */
function sizeFor(link, run, pidLine) { return link.sizeBy === '3d' || link.sizeBy === 'pid' ? link.size : (run?.size || link.size || pidLine?.size); }

/** Pressure drop, velocity and erosion screening for every stream that has a line. Needs the solved result. */
export function hydraulics(model, result, ctx = {}) {
  const out = [], th = result._thermo, st = structure(model);
  if (!th) return out;
  for (const id of st.streams) {
    const link = model.links[id], s = result.streams[id];
    if (!link || link.kind !== 'stream' || !s || !(s.F > 0)) continue;
    const run = runOf(ctx.plant, link.run), pl = lineOf(ctx.pid, link.ln);
    const size = sizeFor(link, run, pl), D = insideDiameter(size);
    if (!D) { out.push({ id, ln: link.ln, size: size || '', missing: 'size' }); continue; }
    const g = run ? runGeometry(run) : { L: link.L || 0, dz: link.dz || 0, fittings: link.fittings || {}, bends: 0 };
    const geom = { D, L: link.L ?? g.L, dz: link.dz ?? g.dz, fittings: { ...g.fittings, ...(link.fittings || {}) }, K: link.K, eps: link.eps };
    const fl = fluidOf(th, s, link.mu), r = lineDrop(fl, geom);
    out.push({ id, ln: link.ln, size: nominalOf(size) || String(size), D, L: geom.L, v: r.v, Re: r.Re, f: r.f, K: r.K, dp: r.dp, rho: fl.rho, phase: fl.phase, erosional: r.erosional, notes: r.notes, dpMax: link.dpMax, mdot: fl.mdot });
  }
  return out;
}

const bar = (p) => p / 1e5;
/** Stream table for the P&ID: one row per stream, the line it runs in, its ends, state and composition. Numbers are rounded for reading; the model keeps the full values. */
export function streamTable(model, result, { hyd = null, maxComps = 6 } = {}) {
  const st = structure(model), th = result._thermo, ids = th ? th.ids : [];
  const tot = ids.map((_, i) => st.streams.reduce((a, s) => a + (result.streams[s] ? result.streams[s].F * result.streams[s].z[i] : 0), 0));
  const top = ids.map((c, i) => i).sort((a, b) => tot[b] - tot[a]).slice(0, maxComps);
  const keys = ['stream', 'line', 'from', 'to', 'T', 'P', 'vf', 'F', 'mass', 'v', 'dp', ...top.map((i) => 'x:' + ids[i])];
  const columns = ['Stream', 'Line', 'From', 'To', 'T (°C)', 'P (bar)', 'Vapour fraction', 'Flow (mol/s)', 'Mass flow (kg/h)', 'Velocity (m/s)', 'Line drop (bar)', ...top.map((i) => ids[i] + ' (mol fraction)')];
  const rows = [], round = (v, d) => (Number.isFinite(v) ? String(Number(v.toPrecision(d))) : '');
  const hmap = new Map((hyd || []).map((h) => [h.id, h]));
  for (const id of st.streams) {
    const s = result.streams[id]; if (!s) continue;
    const l = model.links[id], p = st.prod[id], c = (st.cons[id] || [])[0], h = hmap.get(id);
    rows.push([id, l?.ln || '', p ? unitTag(model, p) : '', c ? unitTag(model, c) : '', round(s.T - 273.15, 5), round(bar(s.P), 5), round(s.vf, 3), round(s.F, 5), th ? round(massFlow(th, s) * 3600, 5) : '',
      h && h.v != null ? round(h.v, 3) : '', h && h.dp != null ? round(bar(h.dp), 3) : '', ...top.map((i) => round(s.z[i], 4))]);
  }
  return { name: 'Stream table', keys, columns, rows };
}

const limitsOf = (model) => ({ liquid: 3, gas: 25, low: 0.3, ...(model.limits || {}) });

/** Everything that disagrees between the drawings, the flowsheet and the hydraulics, as Problems. */
export function check(model, result, ctx = {}) {
  const P = [], st = structure(model), pid = ctx.pid, plant = ctx.plant, lim = limitsOf(model);
  const hyd = ctx.hyd || hydraulics(model, result, ctx);
  const about = (kind, id) => [{ kind, id }];
  if (pid) {
    const tags = new Set(pid.equipment.map((e) => norm(e.tag)));
    for (const u of st.units) if (!tags.has(norm(unitTag(model, u)))) P.push(problem('link.unit-no-equipment', 'warning', `Flowsheet unit ${u.id} has no equipment tagged ${unitTag(model, u)} on the P&ID.`, about('unit', u.id)));
    const ut = new Set(st.units.map((u) => norm(unitTag(model, u))));
    for (const e of pid.equipment) if (!ut.has(norm(e.tag))) P.push(problem('link.equipment-no-unit', 'info', `${e.tag} on the P&ID is not in the flowsheet.`, about('pid', e.uid ?? e.tag)));
    const linkedLn = new Set(Object.values(model.links).map((l) => l.ln).filter(Boolean));
    for (const l of pid.lines) if (l.ln && !linkedLn.has(l.ln)) P.push(problem('link.line-no-stream', 'warning', `Line ${l.ln} on the P&ID carries no flowsheet stream.`, about('pid', l.ln)));
    for (const s of st.streams) {
      const link = model.links[s], p = st.prod[s], cs = st.cons[s] || [];
      if (!link?.ln) { if (p && cs.length) P.push(problem('link.stream-no-line', 'warning', `Stream ${s} (${unitTag(model, p)} to ${unitTag(model, cs[0])}) has no line on the P&ID.`, about('stream', s))); continue; }
      const pl = lineOf(pid, link.ln); if (!pl) { P.push(problem('link.line-missing', 'warning', `Stream ${s} is linked to line ${link.ln}, which is no longer on the P&ID.`, about('stream', s))); continue; }
      if (p && (pl.from || []).length && !pl.from.some((x) => termTag(x) === norm(unitTag(model, p)))) P.push(problem('link.topology', 'error', `Line ${link.ln} leaves ${pl.from.join(', ')} on the P&ID but stream ${s} leaves ${unitTag(model, p)} in the flowsheet.`, [...about('stream', s), ...about('pid', link.ln)]));
      if (cs.length && (pl.to || []).length && !cs.some((c) => pl.to.some((x) => termTag(x) === norm(unitTag(model, c))))) P.push(problem('link.topology', 'error', `Line ${link.ln} enters ${pl.to.join(', ')} on the P&ID but stream ${s} enters ${cs.map((c) => unitTag(model, c)).join(', ')} in the flowsheet.`, [...about('stream', s), ...about('pid', link.ln)]));
    }
  }
  if (plant) {
    const pt = new Set(plant.equipment.map((e) => norm(e.tag)));
    for (const u of st.units) { const l = model.links[u.id]; if (l?.plant && !plant.equipment.some((e) => e.guid === l.plant)) P.push(problem('link.plant-missing', 'warning', `${u.id} is linked to 3D equipment that is no longer in the model.`, about('unit', u.id))); else if (!l?.plant && !pt.has(norm(unitTag(model, u))) && plant.equipment.length) P.push(problem('link.unit-no-3d', 'info', `${u.id} has no equipment in 3D yet.`, about('unit', u.id))); }
    const rn = new Set(Object.values(model.links).map((l) => l.run).filter(Boolean));
    for (const r of plant.runs) if (!rn.has(r.guid)) P.push(problem('link.run-no-line', 'info', `A pipe run${r.tag ? ' ' + r.tag : ''} in 3D is not tied to a line.`, about('plant', r.guid)));
    for (const [id, l] of Object.entries(model.links)) if (l.kind === 'stream' && l.run) {
      const run = runOf(plant, l.run), pl = lineOf(pid, l.ln);
      if (!run) { P.push(problem('link.run-missing', 'warning', `Stream ${id} is linked to a pipe run that is no longer in the 3D model.`, about('stream', id))); continue; }
      if (pl?.size && run.size && npsKey(pl.size) && npsKey(run.size) && npsKey(pl.size) !== npsKey(run.size) && !(l.sizeBy))
        P.push(problem('link.size-mismatch', 'warning', `Line ${l.ln} is ${pl.size} on the P&ID but the pipe in 3D is ${run.size}.`, [...about('stream', id), ...about('pid', l.ln), ...about('plant', run.guid)], { req: pl.size, found: run.size }));
    }
  }
  for (const h of hyd) {
    const a = about('stream', h.id);
    if (h.missing) { P.push(problem('hyd.size-unknown', 'info', `Line ${h.ln || h.id} has no size that can be read, so its pressure drop was not worked out.`, a)); continue; }
    if (h.notes && h.notes.some((n) => /viscosity assumed/.test(n))) P.push(problem('hyd.viscosity-assumed', 'info', `Line ${h.ln || h.id}: viscosity is an assumed default; give the line a viscosity for a real drop.`, a));
    if (h.v > h.erosional) P.push(problem('hyd.erosional', 'error', `Line ${h.ln || h.id}: velocity ${h.v.toPrecision(3)} m/s is above the erosional velocity ${h.erosional.toPrecision(3)} m/s (API RP 14E, C = 100).`, a, { req: h.erosional, found: h.v }));
    else if (h.phase === 'liquid' ? h.v > lim.liquid : h.v > lim.gas) P.push(problem('hyd.velocity-high', 'warning', `Line ${h.ln || h.id}: velocity ${h.v.toPrecision(3)} m/s is above the ${h.phase === 'liquid' ? lim.liquid : lim.gas} m/s screening limit.`, a, { req: h.phase === 'liquid' ? lim.liquid : lim.gas, found: h.v }));
    else if (h.v < lim.low) P.push(problem('hyd.velocity-low', 'info', `Line ${h.ln || h.id}: velocity ${h.v.toPrecision(2)} m/s is low; solids may settle or the line is oversized.`, a));
    if (h.dpMax != null && h.dp > h.dpMax) P.push(problem('hyd.dp-high', 'warning', `Line ${h.ln || h.id}: drop ${(h.dp / 1e5).toPrecision(3)} bar is above its allowed ${(h.dpMax / 1e5).toPrecision(3)} bar.`, a, { req: h.dpMax, found: h.dp }));
  }
  return P;
}

/**
 * A change made in one place, carried to all of them. change = { ln | stream, size (NPS text or mm), by: '3d'|'pid', L?, fittings? }.
 * It sets the line's size, reruns the flowsheet (a `pipe` unit linked to the line takes the new size, so downstream pressures move), reruns the
 * hydraulics, and answers the edits the two drawings should take: the P&ID line's size and its data, and the stream table to redraw.
 */
export function applyChange(model, change, ctx = {}) {
  const st = structure(model);
  const id = change.stream || Object.keys(model.links).find((k) => model.links[k].kind === 'stream' && model.links[k].ln === change.ln);
  if (!id) throw new Error('no stream is linked to ' + (change.ln || change.stream));
  const link = (model.links[id] ||= { kind: 'stream' });
  if (change.size != null) {
    if (!insideDiameter(change.size)) throw new Error('size ' + change.size + ' is not a nominal pipe size or a diameter in mm');
    link.size = String(change.size); link.sizeBy = change.by === 'pid' ? 'pid' : '3d';
  }
  for (const k of ['L', 'dz', 'mu', 'eps', 'K', 'dpMax']) if (num(change[k]) !== undefined) link[k] = change[k];
  if (change.fittings) link.fittings = { ...(link.fittings || {}), ...change.fittings };
  for (const u of st.units) if (u.type === 'pipe' && model.links[u.id]?.ln && model.links[u.id].ln === link.ln && change.size != null) { const p = (u.p ||= {}); delete p.D; p.nps = String(change.size); }
  const result = solveModel(model);
  const hyd = hydraulics(model, result, ctx), problems = [...result.problems, ...check(model, result, { ...ctx, hyd })];
  const edits = { pid: [], plant: [] };
  const mine = hyd.find((h) => h.id === id);
  if (mine && link.ln) edits.pid.push({ ln: link.ln, set: { size: nominalOf(link.size) || link.size, v: mine.v, dp: mine.dp } });
  if (link.run && change.by === 'pid' && change.size != null) edits.plant.push({ run: link.run, set: { size: nominalOf(link.size) || link.size } });
  return { result, hydraulics: hyd, edits, table: streamTable(model, result, { hyd }), problems };
}

/** Solve the model's flowsheet and keep the thermo package on the result for the functions above. */
export function run(model, ctx = {}) {
  const result = solveModel(model), hyd = hydraulics(model, result, ctx);
  return { result, hydraulics: hyd, table: streamTable(model, result, { hyd }), problems: [...result.problems, ...check(model, result, { ...ctx, hyd })] };
}
export { erosionalVelocity };
