/* SPDX-License-Identifier: Apache-2.0 */
/**
 * historian.js — live plant data onto the model (0.8 Track CH, CH.27; DOM-free). A tag map ties a historian or OPC UA node to a P&ID tag / process id and a property;
 * a connector reads values; the module normalises units and quality, flags stale and out-of-limit data, overlays it on the drawing and compares it with the
 * flowsheet's own answer. This is the digital-twin read side: it never writes to a plant and never sends a command.
 *
 *   Connectors   restAdapter({ baseUrl, fetch, headers, paths })    JSON over https: GET read?tags=a,b  and  GET history?tag=&from=&to=
 *                csvAdapter({ text })                               tag,time,value,quality rows from an export
 *                opcuaAdapter({ bridge })                           OPC UA through the HOST (Studio): bridge.read(nodeIds) and bridge.history?(nodeId, from, to)
 *   Reading      snapshot(connector, map, { now, staleAfterS })     → { rows, problems }
 *   Drawing      overlay(rows)                                      → [{ target, text, state }] for the P&ID and 3D markers
 *   Twin         compareModel(rows, modelValues, map, tol)          deviation rows and Problems
 *   Trends       trend(points, maxPoints)  ·  summary(points)
 * A browser page cannot speak OPC UA's binary protocol: that needs Studio (host access asked, D5). Without a bridge `opcuaAdapter` reports itself unavailable and
 * says why; nothing is faked. Values from a plant are DATA (rule 36).
 */
import { problem as baseProblem } from '../report.js';
import { checkAddress, parseCsv } from './lims.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('plant.' + code, severity, text, about, extra); p.source = SRC; return p; };
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
export const DISCLAIMER = 'Read-only plant data for study and comparison. Nothing here controls the plant and nothing is an engineering approval.';

/** To SI. Gauge units need the atmosphere the person gives (default 101325 Pa is NOT assumed: the row says if it is missing). */
const UNITS = { K: [1, 0], C: [1, 273.15], degC: [1, 273.15], F: [5 / 9, 255.372222], degF: [5 / 9, 255.372222], Pa: [1, 0], kPa: [1e3, 0], bar: [1e5, 0], MPa: [1e6, 0], psi: [6894.757, 0], 'kg/s': [1, 0], 'kg/h': [1 / 3600, 0], 't/h': [1000 / 3600, 0], 'mol/s': [1, 0], 'm3/h': [1 / 3600, 0], '%': [0.01, 0], m: [1, 0], mm: [1e-3, 0], fraction: [1, 0] };
export const GAUGE = { barg: 1e5, kPag: 1e3, psig: 6894.757 };
export function toSI(value, unit, { atm = null } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return { ok: false, reason: 'no number' };
  if (unit in GAUGE) { if (!(atm > 0)) return { ok: false, reason: 'gauge pressure needs the local atmospheric pressure' }; return { ok: true, value: value * GAUGE[unit] + atm, unit: 'Pa' }; }
  const u = UNITS[unit]; if (!u) return { ok: false, reason: 'unknown unit "' + str(unit, 20) + '"' };
  const siUnit = { K: 'K', C: 'K', degC: 'K', F: 'K', degF: 'K', Pa: 'Pa', kPa: 'Pa', bar: 'Pa', MPa: 'Pa', psi: 'Pa', 'kg/s': 'kg/s', 'kg/h': 'kg/s', 't/h': 'kg/s', 'mol/s': 'mol/s', 'm3/h': 'm3/s', '%': 'fraction', m: 'm', mm: 'm', fraction: 'fraction' }[unit];
  return { ok: true, value: (['C', 'degC'].includes(unit) ? value + 273.15 : ['F', 'degF'].includes(unit) ? (value - 32) * 5 / 9 + 273.15 : value * u[0]), unit: siUnit };
}
/** OPC UA StatusCode high bits: 00 good, 01 uncertain, 10 bad. Text qualities of REST/CSV sources are folded the same way. */
export function quality(q) {
  if (typeof q === 'number') { const hi = (q >>> 30) & 3; return hi === 0 ? 'good' : hi === 1 ? 'uncertain' : 'bad'; }
  const t = String(q ?? '').toLowerCase(); if (t === '' || t === 'good' || t === 'g' || t === '192' || t === 'ok') return 'good'; if (t.startsWith('unc') || t === 'u') return 'uncertain'; return 'bad';
}

const cleanPoint = (p) => ({ tag: str(p.tag ?? p.name ?? p.id, 160), t: Number.isFinite(Date.parse(p.time ?? p.t ?? p.timestamp)) ? Date.parse(p.time ?? p.t ?? p.timestamp) : null, value: typeof p.value === 'number' ? p.value : (p.value !== '' && p.value != null && Number.isFinite(+p.value) ? +p.value : null), quality: quality(p.quality) });
export function restAdapter({ baseUrl, fetch, headers = {}, paths = {}, id = 'rest', maxPoints = 20000 }) {
  const chk = checkAddress(baseUrl); if (!chk.ok) throw new Error('Address refused: ' + chk.reason);
  if (typeof fetch !== 'function') throw new Error('The host must supply fetch.');
  const P = { read: '/read', history: '/history', ...paths };
  const go = async (path) => { const res = await fetch(chk.url + path, { method: 'GET', headers: { accept: 'application/json', ...headers }, redirect: 'error' }); if (!res.ok) throw new Error('The historian answered ' + res.status); const t = await res.text(); if (t.length > 8e6) throw new Error('The answer is too large.'); return JSON.parse(t); };
  const arr = (j) => (Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : []);
  return { id, kind: 'rest', describe: () => ({ id, kind: 'rest', address: chk.url, writes: false }),
    async read(tags) { return arr(await go(P.read + '?tags=' + tags.map(encodeURIComponent).join(','))).slice(0, 2000).map(cleanPoint); },
    async history(tag, from, to) { return arr(await go(P.history + '?tag=' + encodeURIComponent(tag) + '&from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to))).slice(0, maxPoints).map(cleanPoint); } };
}
export function csvAdapter({ text, id = 'csv' }) {
  const pts = parseCsv(text).map(cleanPoint).filter((p) => p.tag);
  return { id, kind: 'csv', describe: () => ({ id, kind: 'csv', points: pts.length, writes: false }),
    async read(tags) { const out = []; for (const tg of tags) { const mine = pts.filter((p) => p.tag === tg && p.t != null).sort((a, b) => b.t - a.t); if (mine[0]) out.push(mine[0]); } return out; },
    async history(tag, from, to) { const a = Date.parse(from), b = Date.parse(to); return pts.filter((p) => p.tag === tag && p.t != null && p.t >= a && p.t <= b).sort((x, y) => x.t - y.t); } };
}
export function opcuaAdapter({ bridge = null, id = 'opcua' }) {
  const need = () => { if (!bridge || typeof bridge.read !== 'function') throw new Error('OPC UA needs CadCraft Studio: the browser cannot speak the protocol. Ask Studio for host access to a plant network first.'); };
  return { id, kind: 'opcua', available: !!(bridge && bridge.read), describe: () => ({ id, kind: 'opcua', available: !!(bridge && bridge.read), writes: false }),
    async read(nodeIds) { need(); return (await bridge.read(nodeIds)).slice(0, 2000).map((r) => cleanPoint({ tag: r.nodeId, time: r.sourceTime ?? r.time, value: r.value, quality: r.statusCode ?? r.quality })); },
    async history(nodeId, from, to) { need(); if (typeof bridge.history !== 'function') throw new Error('This Studio bridge has no history call.'); return (await bridge.history(nodeId, from, to)).slice(0, 20000).map((r) => cleanPoint({ tag: nodeId, time: r.sourceTime ?? r.time, value: r.value, quality: r.statusCode ?? r.quality })); } };
}

/** map [{ tag, target: { kind: 'pid'|'process'|'3d', id, prop }, unit, low?, high?, label?, atm? }]. → { rows, problems } */
export async function snapshot(connector, map, { now = Date.now(), staleAfterS = 120 } = {}) {
  const problems = [], rows = []; let pts = [];
  try { pts = await connector.read(map.map((m) => m.tag)); } catch (e) { return { rows: [], problems: [problem('connect', 'error', 'The plant data could not be read: ' + str(e.message, 200))] }; }
  const by = new Map(pts.map((p) => [p.tag, p]));
  for (const m of map) {
    const p = by.get(m.tag), about = [{ kind: 'tag', id: m.target?.id || m.tag }];
    if (!p) { rows.push({ tag: m.tag, target: m.target, state: 'missing', value: null }); problems.push(problem('missing', 'warning', `No value came back for ${m.tag}.`, about)); continue; }
    const si = toSI(p.value, m.unit, { atm: m.atm }); let state = p.quality === 'good' ? 'ok' : p.quality;
    if (!si.ok) { problems.push(problem('unit', 'warning', `${m.tag}: ${si.reason}.`, about)); state = 'bad'; }
    const age = p.t != null ? (now - p.t) / 1000 : null;
    if (age != null && age > staleAfterS) { state = state === 'ok' ? 'stale' : state; problems.push(problem('stale', 'warning', `${m.tag} is ${Math.round(age)} s old.`, about)); }
    if (si.ok && state === 'ok') { if (m.high != null && p.value > m.high) { state = 'high'; problems.push(problem('high', 'warning', `${m.tag} is above ${m.high} ${m.unit}.`, about, { req: { op: '<=', value: m.high, unit: m.unit }, found: p.value })); } else if (m.low != null && p.value < m.low) { state = 'low'; problems.push(problem('low', 'warning', `${m.tag} is below ${m.low} ${m.unit}.`, about, { req: { op: '>=', value: m.low, unit: m.unit }, found: p.value })); } }
    if (p.quality === 'bad') problems.push(problem('quality', 'warning', `${m.tag} has bad quality at the source.`, about));
    rows.push({ tag: m.tag, label: str(m.label || m.tag), target: m.target, raw: p.value, unit: m.unit, value: si.ok ? si.value : null, siUnit: si.ok ? si.unit : null, t: p.t, ageS: age, quality: p.quality, state });
  }
  return { rows, problems };
}
/** Marker data for the P&ID and the 3D model: one entry per row. */
export function overlay(rows) { return rows.map((r) => ({ target: r.target, text: r.value == null ? '--' : `${+r.raw.toPrecision(4)} ${r.unit}`, state: r.state, label: r.label })); }

/** modelValues { 'kind:id:prop': SI value } from the flowsheet; tol { rel: 0.05 }. → { rows, problems } */
export function compareModel(rows, modelValues, map, tol = {}) {
  const out = [], problems = [], rel = tol.rel ?? 0.05;
  for (const r of rows) {
    if (r.value == null || !r.target) continue; const key = `${r.target.kind}:${r.target.id}:${r.target.prop}`, mv = modelValues[key]; if (mv == null) continue;
    const dev = (r.value - mv) / (Math.abs(mv) || 1); out.push({ key, plant: r.value, model: mv, deviation: dev }); 
    if (Math.abs(dev) > rel) problems.push(problem('deviates', 'warning', `${r.label}: the plant reads ${r.value.toPrecision(4)} and the model says ${mv.toPrecision(4)} (${(dev * 100).toFixed(1)} %).`, [{ kind: r.target.kind, id: r.target.id }], { req: { op: '~', value: mv, unit: r.siUnit, tol: rel }, found: r.value }));
  }
  return { rows: out, problems };
}
/** Largest-triangle-three-buckets downsampling of [{ t, value }] to at most maxPoints (keeps the first and last). */
export function trend(points, maxPoints = 300) {
  const p = points.filter((x) => x.t != null && x.value != null); if (p.length <= maxPoints || maxPoints < 3) return p;
  const out = [p[0]], every = (p.length - 2) / (maxPoints - 2); let a = 0;
  for (let i = 0; i < maxPoints - 2; i++) {
    const s = Math.floor((i + 1) * every) + 1, e = Math.min(Math.floor((i + 2) * every) + 1, p.length), ns = e, ne = Math.min(Math.floor((i + 3) * every) + 1, p.length);
    let ax = 0, ay = 0, n = 0; for (let j = ns; j < ne; j++) { ax += p[j].t; ay += p[j].value; n++; } if (!n) { ax = p[p.length - 1].t; ay = p[p.length - 1].value; n = 1; } ax /= n; ay /= n;
    let best = -1, bi = s; for (let j = s; j < e; j++) { const area = Math.abs((p[a].t - ax) * (p[j].value - p[a].value) - (p[a].t - p[j].t) * (ay - p[a].value)); if (area > best) { best = area; bi = j; } }
    out.push(p[bi]); a = bi;
  }
  out.push(p[p.length - 1]); return out;
}
export function summary(points) { const v = points.map((x) => x.value).filter((x) => x != null); if (!v.length) return { n: 0 }; const n = v.length, mean = v.reduce((a, b) => a + b, 0) / n; return { n, min: Math.min(...v), max: Math.max(...v), mean, sd: Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / n) }; }
