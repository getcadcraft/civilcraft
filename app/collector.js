/* SPDX-License-Identifier: Apache-2.0 */
/**
 * collector.js — raw data collector files in (0.8 EG.11): total-station field books read into setups and shots, reduced to coordinates, and handed to the
 * least-squares adjustment (adjust.js) as directions and distances. No DOM, no strings. Plan units are the file's; angles are read into radians.
 * Tested by bin/test-civilcraft-collector.mjs on files WE wrote from the formats' public descriptions: no real instrument file has been through it yet
 * (owner: send some, rule 33 of the first 0.8 round), so every reader says what it did not understand instead of guessing.
 *
 * Formats read: Carlson/SurvCE RW5 ("OC,…" lines), Leica GSI-8/16 (word blocks), Trimble JobXML (<FieldBook> records), and a plain CSV
 * (station, backsight, target, hz, vz, slope distance, target height, code). Each is the vendor's own documented text format; nothing is copied from a
 * product, and the names appear only to say which file we read.
 *
 *   readCollector(text, { name, format, angle: 'deg'|'dms'|'gon' }) → { format, setups: [{ station, hi, coords?, backsight: {id, hz?}, shots: [{ id, hz, vz, sd, hr, code }] }], points: { id: { n, e, z, code } }, problems }
 *   reduce(job, { scale, refraction }) → { points, shots } polar reduction from each setup's station and backsight
 *   toObservations(job, { sdDir (rad), sdDist (units), sdCtrl }) → { points (for adjustNetwork), obs }
 */
import { parseXml, kids, kid, textOf } from './xml.js';

const D2R = Math.PI / 180;
const num = (v) => { const x = Number(String(v).replace(/[^\d.+\-eE]/g, '')); return Number.isFinite(x) && String(v).trim() !== '' ? x : NaN; };
/** DDD.MMSSss → radians (the dotted degrees-minutes-seconds many data collectors write). */
export function dmsDotted(v) { const s = Math.abs(v), d = Math.floor(s), f = Math.round((s - d) * 1e6) / 1e6, m = Math.floor(f * 100 + 1e-7), sec = (f * 100 - m) * 100; return Math.sign(v || 1) * (d + m / 60 + sec / 3600) * D2R; }
const toRad = (v, kind) => (kind === 'dms' ? dmsDotted(v) : kind === 'gon' ? v * Math.PI / 200 : v * D2R);

function parseRW5(text, o) {
  const setups = [], points = {}, problems = []; let cur = null, hi = 0, hr = 0, units = o.angle || 'deg';
  const field = (parts, key) => { const p = parts.find((x) => x.startsWith(key)); return p === undefined ? null : p.slice(key.length).trim(); };
  const coord = (parts) => ({ n: num(field(parts, 'N ') ?? field(parts, 'N')), e: num(field(parts, 'E ') ?? field(parts, 'E')), z: num(field(parts, 'EL') ?? 'NaN') });
  text.split(/\r?\n/).forEach((line, i) => {
    const l = line.trim(); if (!l || l.startsWith('--')) return;
    const parts = l.split(','), tag = parts[0].toUpperCase();
    if (tag === 'MO') { const au = field(parts, 'AU'); if (au === '1') units = 'gon'; else if (!o.angle && field(parts, 'AD') === '0') units = 'dms'; return; }
    if (tag === 'SP') { const c = coord(parts); const code = (parts.find((x) => x.startsWith('--')) || '').slice(2); const id = field(parts, 'PN'); if (id !== null && Number.isFinite(c.n) && Number.isFinite(c.e)) points[id] = { ...c, code }; return; }
    if (tag === 'OC') { const id = field(parts, 'OP'), c = coord(parts); cur = { station: id, hi, coords: Number.isFinite(c.n) ? c : (points[id] || null), backsight: null, shots: [] }; if (cur.coords && id) points[id] = points[id] || { ...cur.coords }; setups.push(cur); return; }
    if (tag === 'BK') { if (!cur) { problems.push({ code: 'col.order', line: i + 1 }); return; } const a = num(field(parts, 'BS')); cur.backsight = { id: field(parts, 'BP'), hz: Number.isFinite(a) ? toRad(a, units) : 0 }; return; }
    if (tag === 'LS') { const h1 = num(field(parts, 'HI')), h2 = num(field(parts, 'HR')); if (Number.isFinite(h1)) { hi = h1; if (cur) cur.hi = h1; } if (Number.isFinite(h2)) hr = h2; return; }
    if (tag === 'SS') {
      if (!cur) { problems.push({ code: 'col.order', line: i + 1 }); return; }
      const hz = num(field(parts, 'AR')), vz = num(field(parts, 'ZE')), sd = num(field(parts, 'SD'));
      if (![hz, vz, sd].every(Number.isFinite)) { problems.push({ code: 'col.shot', line: i + 1 }); return; }
      cur.shots.push({ id: field(parts, 'FP'), hz: toRad(hz, units), vz: toRad(vz, units), sd, hr, code: (parts.find((x) => x.startsWith('--')) || '').slice(2) }); return;
    }
    if (['JB', 'GPS', 'TR', 'TP'].includes(tag)) return;
    problems.push({ code: 'col.unknown', line: i + 1, tag });
  });
  return { setups, points, problems };
}

function parseGSI(text) {
  const setups = [], points = {}, problems = []; let cur = null;
  const unit = (info, raw) => {
    const sign = raw[0] === '-' ? -1 : 1, digits = raw.replace(/^[+-]/, ''), u = info.slice(-1), n = Number(digits);
    switch (u) { case '0': return { v: sign * n / 1000, k: 'len' }; case '1': return { v: sign * n / 1000, k: 'len' }; case '2': return { v: sign * n / 1e5 * Math.PI / 200, k: 'ang' };
      case '3': return { v: sign * n / 1e5 * D2R, k: 'ang' }; case '4': { const s = String(Math.abs(n)).padStart(9, '0'); const d = Number(s.slice(0, -5)), m = Number(s.slice(-5, -3)), sc = Number(s.slice(-3, -1)) + Number(s.slice(-1)) / 10; return { v: sign * (d + m / 60 + sc / 3600) * D2R, k: 'ang' }; }
      case '6': return { v: sign * n / 1e4 * Math.PI / 200, k: 'ang' }; case '7': return { v: sign * n / 1e4, k: 'len' }; case '8': return { v: sign * n / 1e5, k: 'len' }; default: return { v: NaN, k: '?' }; }
  };
  text.split(/\r?\n/).forEach((line, i) => {
    const l = line.trim().replace(/^\*/, ''); if (!l) return;
    const W = {}; for (const w of l.split(/\s+/)) { const m = /^(\d\d)(.{4})([+-][0-9A-Za-z]+)$/.exec(w); if (m) W[m[1]] = { info: m[2], raw: m[3] }; }
    if (!Object.keys(W).length) { problems.push({ code: 'col.unknown', line: i + 1 }); return; }
    const id = W['11'] ? W['11'].raw.replace(/^[+-]0*/, '') : null;
    if (W['81'] && W['82'] && !W['21']) { const e = unit(W['81'].info, W['81'].raw).v, nn = unit(W['82'].info, W['82'].raw).v, z = W['83'] ? unit(W['83'].info, W['83'].raw).v : NaN; if (id) points[id] = { n: nn, e, z, code: '' }; return; }
    if (W['88'] && !W['21']) { cur = { station: id, hi: unit(W['88'].info, W['88'].raw).v, coords: points[id] || null, backsight: null, shots: [] }; setups.push(cur); return; }
    if (W['21'] && W['22'] && (W['31'] || W['32'])) {
      if (!cur) { problems.push({ code: 'col.order', line: i + 1 }); return; }
      const hz = unit(W['21'].info, W['21'].raw).v, vz = unit(W['22'].info, W['22'].raw).v, sd = unit((W['31'] || W['32']).info, (W['31'] || W['32']).raw).v, hr = W['87'] ? unit(W['87'].info, W['87'].raw).v : 0;
      const slope = !!W['31'];
      if (!cur.backsight && !slope) { /* horizontal distance given: keep, reduce as is */ }
      if (!cur.backsight) { cur.backsight = { id, hz }; return; }
      cur.shots.push({ id, hz, vz, sd, hr, code: '', horizontal: !slope }); return;
    }
    problems.push({ code: 'col.unknown', line: i + 1 });
  });
  return { setups, points, problems };
}

function parseJobXML(text) {
  const setups = [], points = {}, problems = []; let root;
  try { root = parseXml(text); } catch (e) { return { setups, points, problems: [{ code: 'col.xml', message: String(e.message || e).slice(0, 120) }] }; }
  const fb = kid(root, 'FieldBook') || root;
  let cur = null;
  const angle = (el) => num(textOf(el)) * D2R;
  for (const r of fb.children) {
    if (r.name === 'StationRecord') { const id = textOf(kid(r, 'StationName')); cur = { station: id, hi: num(textOf(kid(r, 'TheodoliteHeight'))) || 0, coords: points[id] || null, backsight: null, shots: [] }; setups.push(cur); }
    else if (r.name === 'BackBearingRecord' && cur) cur.backsight = { id: null, hz: angle(kid(r, 'Circle')) };
    else if (r.name === 'PointRecord') {
      const id = textOf(kid(r, 'Name')), c = kid(r, 'Circle') || kid(r, 'Observation'), grid = kid(r, 'Grid') || kid(r, 'ComputedGrid');
      if (grid && !c) points[id] = { n: num(textOf(kid(grid, 'North'))), e: num(textOf(kid(grid, 'East'))), z: num(textOf(kid(grid, 'Elevation'))), code: textOf(kid(r, 'Code')) };
      else if (c && cur) {
        const hz = num(textOf(kid(c, 'HorizontalCircle'))), vz = num(textOf(kid(c, 'VerticalCircle'))), sd = num(textOf(kid(c, 'EDMDistance')));
        if (![hz, vz, sd].every(Number.isFinite)) { problems.push({ code: 'col.shot', id }); continue; }
        if (!cur.backsight && cur.coords === null && false) continue;
        cur.shots.push({ id, hz: hz * D2R, vz: vz * D2R, sd, hr: num(textOf(kid(r, 'TargetHeight'))) || 0, code: textOf(kid(r, 'Code')) });
      }
    }
  }
  for (const s of setups) if (!s.coords && points[s.station]) s.coords = points[s.station];
  return { setups, points, problems };
}

function parseCSV(text, o) {
  const setups = [], points = {}, problems = []; let cur = null;
  text.split(/\r?\n/).forEach((line, i) => {
    const l = line.trim(); if (!l || l.startsWith('#')) return;
    const c = l.split(',').map((x) => x.trim());
    if (/^(station|stn)$/i.test(c[0])) return;
    if (c[0].toLowerCase() === 'point') { const n = num(c[2]), e = num(c[3]); if (Number.isFinite(n) && Number.isFinite(e)) points[c[1]] = { n, e, z: num(c[4]), code: c[5] || '' }; return; }
    const [stn, bs, tg, hz, vz, sd, hr, code] = c, kind = o.angle || 'deg';
    if (!cur || cur.station !== stn) { cur = { station: stn, hi: 0, coords: null, backsight: null, shots: [] }; setups.push(cur); }
    const a = num(hz), v = num(vz), d = num(sd);
    if (![a, v, d].every(Number.isFinite)) { problems.push({ code: 'col.shot', line: i + 1 }); return; }
    if (tg === bs && !cur.backsight) { cur.backsight = { id: bs, hz: toRad(a, kind) }; return; }
    cur.shots.push({ id: tg, hz: toRad(a, kind), vz: toRad(v, kind), sd: d, hr: num(hr) || 0, code: code || '' });
    if (!cur.backsight && bs) cur.backsight = { id: bs, hz: null };
  });
  for (const s of setups) s.coords = points[s.station] || null;
  return { setups, points, problems };
}

export function sniff(text) {
  const t = text.slice(0, 2000);
  if (/<\s*JOBFile|<\s*FieldBook|<\s*JOBFILE/i.test(t)) return 'jobxml';
  if (/^\s*\*?11\d{4}[+-]/m.test(t)) return 'gsi';
  if (/^\s*(JB|MO|OC|SP|BK|LS|SS),/m.test(t)) return 'rw5';
  return 'csv';
}
export function readCollector(text, o = {}) {
  const src = String(text).slice(0, 20e6), format = o.format || sniff(src);
  const r = format === 'rw5' ? parseRW5(src, o) : format === 'gsi' ? parseGSI(src) : format === 'jobxml' ? parseJobXML(src) : parseCSV(src, o);
  const shots = r.setups.reduce((s, x) => s + x.shots.length, 0);
  if (!shots) r.problems.push({ code: 'col.empty' });
  return { format, ...r };
}

/** Polar reduction. Station coordinates are northing/easting (n, e); azimuth clockwise from north; the backsight fixes the orientation. */
export function reduce(job, { scale = 1 } = {}) {
  const points = {}, shots = [], problems = [];
  for (const s of job.setups) {
    const st = s.coords || job.points[s.station];
    if (!st) { problems.push({ code: 'col.nostation', station: s.station }); continue; }
    const bs = s.backsight && job.points[s.backsight.id];
    let orient = 0;
    if (bs && s.backsight.hz !== null) orient = Math.atan2(bs.e - st.e, bs.n - st.n) - s.backsight.hz; else problems.push({ code: 'col.nobacksight', station: s.station });
    for (const k of s.shots) {
      const hd = (k.horizontal ? k.sd : k.sd * Math.sin(k.vz)) * scale, az = orient + k.hz, dz = k.horizontal ? 0 : k.sd * Math.cos(k.vz) + s.hi - k.hr;
      const p = { n: st.n + hd * Math.cos(az), e: st.e + hd * Math.sin(az), z: Number.isFinite(st.z) ? st.z + dz : NaN, code: k.code };
      shots.push({ station: s.station, id: k.id, az, hd, ...p }); if (k.id && !points[k.id]) points[k.id] = p;
    }
  }
  return { points, shots, problems };
}

/** Turn a job into an adjustment: stations with coordinates + known backsights are control; every other shot target is free. x = easting, y = northing. */
export function toObservations(job, { sdDir = (5 / 3600) * D2R, sdDist = 0.005, sdCtrl = 0 } = {}) {
  const pts = {}, obs = []; const red = reduce(job);
  const known = (id) => job.points[id];
  for (const [id, p] of Object.entries(job.points)) pts[id] = { x: p.e, y: p.n, fixed: true, ...(sdCtrl ? { sx: sdCtrl, sy: sdCtrl } : {}) };
  const free = new Set();
  job.setups.forEach((s, k) => {
    if (!pts[s.station]) return;
    if (s.backsight?.id && pts[s.backsight.id] && s.backsight.hz !== null) obs.push({ type: 'dir', at: s.station, to: s.backsight.id, value: s.backsight.hz, sd: sdDir, set: k });
    for (const sh of s.shots) {
      const r = red.shots.find((q) => q.station === s.station && q.id === sh.id); if (!sh.id || !r) continue;
      if (!pts[sh.id]) { pts[sh.id] = { x: r.e, y: r.n }; free.add(sh.id); }
      obs.push({ type: 'dir', at: s.station, to: sh.id, value: sh.hz, sd: sdDir, set: k });
      obs.push({ type: 'dist', from: s.station, to: sh.id, value: r.hd, sd: sdDist });
    }
  });
  void known;
  return { points: pts, obs, free: [...free] };
}
