/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-report.js — what the river results look like on paper (0.8 SU.957): the per-section table, its CSV, a plain-text
 * report and the water surface profile plot as SVG. No DOM: words come from the `t` passed in (keys sx.su957.*), so the Node
 * test drives it. Every output carries the review line (sx.su957.review): the results need an engineer's review.
 *
 *   COLUMNS                                     the table's columns: [{ key, label (string key), unit kind, digits }]
 *   tableRows(profile, { units }) → [[cell]]    numbers rounded for reading (rs, WSE, crit WS, EGL, depth, V channel, V,
 *                                               Froude (channel), area, top width, Q split, E.G. slope, flags)
 *   tableCsv(profile, { units, t }) → text     CRLF, a header line then one line per section (downstream first)
 *   reportText(model, result, { t }) → text    the whole run: model, boundaries, each profile's table and its warnings
 *   profileSvg(model, profile, { t, width, height }) → '<svg …>'   thalweg, banks, water surface, energy grade line and
 *       critical water surface along the river (flow left to right), axes, legend and the review line
 */

const U = {
  m: { len: 'm', vel: 'm/s', q: 'm³/s', area: 'm²' },
  ft: { len: 'ft', vel: 'ft/s', q: 'ft³/s', area: 'ft²' },
};
const f = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const COLUMNS = [
  { key: 'rs', label: 'sx.su957.c.rs', unit: 'len', d: 2 },
  { key: 'q', label: 'sx.su957.c.q', unit: 'q', d: 2 },
  { key: 'minZ', label: 'sx.su957.c.minz', unit: 'len', d: 3 },
  { key: 'wse', label: 'sx.su957.c.wse', unit: 'len', d: 3 },
  { key: 'crit', label: 'sx.su957.c.crit', unit: 'len', d: 3 },
  { key: 'egl', label: 'sx.su957.c.egl', unit: 'len', d: 3 },
  { key: 'depth', label: 'sx.su957.c.depth', unit: 'len', d: 3 },
  { key: 'vch', label: 'sx.su957.c.vch', unit: 'vel', d: 3 },
  { key: 'v', label: 'sx.su957.c.v', unit: 'vel', d: 3 },
  { key: 'frCh', label: 'sx.su957.c.fr', unit: '', d: 3 },
  { key: 'area', label: 'sx.su957.c.area', unit: 'area', d: 2 },
  { key: 'top', label: 'sx.su957.c.top', unit: 'len', d: 2 },
  { key: 'qLob', label: 'sx.su957.c.qlob', unit: 'q', d: 2 },
  { key: 'qCh', label: 'sx.su957.c.qch', unit: 'q', d: 2 },
  { key: 'qRob', label: 'sx.su957.c.qrob', unit: 'q', d: 2 },
  { key: 'sf', label: 'sx.su957.c.sf', unit: '', d: 6 },
];

export function header(t, units) {
  const u = U[units === 'ft' ? 'ft' : 'm'];
  return [...COLUMNS.map((c) => (c.unit ? t(c.label) + ' (' + u[c.unit] + ')' : t(c.label))), t('sx.su957.c.flags')];
}

export function tableRows(profile, { t = (k) => k } = {}) {
  return profile.rows.map((r) => [...COLUMNS.map((c) => f(r[c.key], c.d)), r.flags.map((x) => t('sx.su957.flag.' + x + '.short')).join('; ')]);
}

export function tableCsv(profile, { units = 'm', t = (k) => k } = {}) {
  const q = (s) => (/[",\r\n]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : /^[=+\-@]/.test(s) && !/^-?\d/.test(s) ? "'" + s : s);
  return [header(t, units), ...tableRows(profile, { t })].map((r) => r.map(q).join(',')).join('\r\n') + '\r\n';
}

function boundaryText(b, t, units) {
  if (!b) return t('sx.su957.bc.none');
  if (b.type === 'normal') return t('sx.su957.bc.normal.v', { s: f(b.slope, 5) });
  if (b.type === 'ws') return t('sx.su957.bc.ws.v', { z: f(b.wse, 3), u: U[units].len });
  return t('sx.su957.bc.critical');
}

export function reportText(model, result, { t = (k) => k, date = null } = {}) {
  const units = model.units === 'ft' ? 'ft' : 'm', u = U[units];
  const L = [];
  L.push(t('sx.su957.report.title', { name: model.name || model.id }));
  L.push(t('sx.su957.review'));
  if (date) L.push(t('sx.su957.report.date', { date }));
  L.push('');
  L.push(t('sx.su957.report.units', { len: u.len, q: u.q }));
  L.push(t('sx.su957.report.method'));
  L.push(t('sx.su957.report.regime', { r: t('sx.su957.regime.' + (model.regime || 'sub')) }));
  L.push(t('sx.su957.report.sections', { n: model.sections.length }));
  for (const i of result.issues || []) L.push('  ! ' + t('sx.su957.issue.' + i.code, { rs: f(i.rs, 2), profile: i.profile || '' }));
  for (const p of result.profiles || []) {
    const pr = model.profiles.find((x) => x.name === p.name) || {};
    L.push('');
    L.push(t('sx.su957.report.profile', { name: p.name, q: f(pr.q, 2), u: u.q }));
    if (p.regime !== 'super') L.push('  ' + t('sx.su957.bc.down') + ': ' + boundaryText(pr.down, t, units));
    if (p.regime !== 'sub') L.push('  ' + t('sx.su957.bc.up') + ': ' + boundaryText(pr.up, t, units));
    const head = header(t, units), rows = tableRows(p, { t });
    const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
    L.push(head.map((h, i) => h.padStart(w[i])).join('  '));
    for (const r of rows) L.push(r.map((c, i) => String(c).padStart(w[i])).join('  '));
    const counts = Object.entries(p.flags || {});
    if (counts.length) {
      L.push('  ' + t('sx.su957.report.flags'));
      for (const [k, n] of counts) L.push('  - ' + t('sx.su957.flag.' + k, { n }));
    }
  }
  L.push('');
  L.push(t('sx.su957.review'));
  return L.join('\n') + '\n';
}

function niceStep(x) {
  const p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

export function profileSvg(model, profile, { t = (k) => k, width = 820, height = 380 } = {}) {
  const units = model.units === 'ft' ? 'ft' : 'm';
  const rows = profile.rows.slice().sort((a, b) => b.rs - a.rs);   // upstream first: flow left to right
  const secs = new Map(model.sections.map((s) => [s.id, s]));
  const bankZ = (r, i) => {
    const s = secs.get(r.id);
    if (!s) return null;
    const o = s.banks[i];
    for (let k = 1; k < s.pts.length; k++) { const p = s.pts[k - 1], q = s.pts[k]; if (o >= p.o && o <= q.o) return q.o > p.o ? p.z + ((q.z - p.z) * (o - p.o)) / (q.o - p.o) : Math.max(p.z, q.z); }
    return null;
  };
  const W = width, H = height, ml = 64, mr = 16, mt = 30, mb = 74;
  const top = rows[0]?.rs ?? 0, xs = rows.map((r) => top - r.rs);
  const series = {
    bed: rows.map((r) => r.minZ),
    lb: rows.map((r) => bankZ(r, 0)),
    rb: rows.map((r) => bankZ(r, 1)),
    crit: rows.map((r) => r.crit),
    ws: rows.map((r) => r.wse),
    egl: rows.map((r) => r.egl),
  };
  const all = Object.values(series).flat().filter(Number.isFinite);
  let z0 = Math.min(...all), z1 = Math.max(...all);
  if (!(z1 > z0)) { z0 -= 1; z1 += 1; }
  const pad = (z1 - z0) * 0.06; z0 -= pad; z1 += pad;
  const x1 = Math.max(...xs, 1e-9);
  const X = (x) => ml + ((W - ml - mr) * x) / x1, Y = (z) => mt + ((H - mt - mb) * (z1 - z)) / (z1 - z0);
  const path = (vals) => {
    let d = '', pen = false;
    vals.forEach((v, i) => { if (!Number.isFinite(v)) { pen = false; return; } d += (pen ? 'L' : 'M') + X(xs[i]).toFixed(1) + ' ' + Y(v).toFixed(1); pen = true; });
    return d;
  };
  const style = {
    bed: 'stroke="currentColor" stroke-width="2"',
    lb: 'stroke="currentColor" stroke-width="1" stroke-dasharray="2 3" opacity="0.7"',
    rb: 'stroke="currentColor" stroke-width="1" stroke-dasharray="6 3" opacity="0.7"',
    crit: 'stroke="var(--layer-red, #c0392b)" stroke-width="1.25" stroke-dasharray="1 3"',
    ws: 'stroke="var(--layer-blue, #2266cc)" stroke-width="2"',
    egl: 'stroke="var(--layer-green, #2e8b57)" stroke-width="1.25" stroke-dasharray="6 4"',
  };
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(t('sx.su957.plot.label', { name: profile.name }))}" font-family="sans-serif" font-size="11" fill="none">`);
  o.push(`<text x="${ml}" y="18" fill="currentColor" font-size="13">${esc(t('sx.su957.plot.title', { name: profile.name }))}</text>`);
  // grid + axes
  const zs = niceStep((z1 - z0) / 6), xsS = niceStep(x1 / 8);
  for (let z = Math.ceil(z0 / zs) * zs; z <= z1; z += zs) o.push(`<line x1="${ml}" x2="${W - mr}" y1="${Y(z).toFixed(1)}" y2="${Y(z).toFixed(1)}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/><text x="${ml - 6}" y="${(Y(z) + 4).toFixed(1)}" text-anchor="end" fill="currentColor">${f(z, zs < 1 ? 1 : 0)}</text>`);
  for (let x = 0; x <= x1 + 1e-9; x += xsS) o.push(`<line x1="${X(x).toFixed(1)}" x2="${X(x).toFixed(1)}" y1="${mt}" y2="${H - mb}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/><text x="${X(x).toFixed(1)}" y="${H - mb + 14}" text-anchor="middle" fill="currentColor">${f(top - x, 0)}</text>`);
  o.push(`<rect x="${ml}" y="${mt}" width="${W - ml - mr}" height="${H - mt - mb}" stroke="currentColor" stroke-width="1"/>`);
  o.push(`<text x="${(ml + W - mr) / 2}" y="${H - mb + 30}" text-anchor="middle" fill="currentColor">${esc(t('sx.su957.plot.x', { u: U[units].len }))}</text>`);
  o.push(`<text transform="translate(14 ${(mt + H - mb) / 2}) rotate(-90)" text-anchor="middle" fill="currentColor">${esc(t('sx.su957.plot.y', { u: U[units].len }))}</text>`);
  // water body under the surface
  const wsPts = xs.map((x, i) => [X(x), Y(series.ws[i])]), bedPts = xs.map((x, i) => [X(x), Y(series.bed[i])]).reverse();
  if (wsPts.length > 1) o.push(`<path d="M${[...wsPts, ...bedPts].map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}Z" fill="var(--layer-blue, #2266cc)" opacity="0.15" stroke="none"/>`);
  for (const k of ['bed', 'lb', 'rb', 'crit', 'egl', 'ws']) { const d = path(series[k]); if (d) o.push(`<path d="${d}" ${style[k]} data-series="${k}"/>`); }
  // jumps and flagged sections
  rows.forEach((r, i) => { if (r.flags.includes('critical') || r.flags.includes('jump')) o.push(`<circle cx="${X(xs[i]).toFixed(1)}" cy="${Y(r.wse).toFixed(1)}" r="3" stroke="var(--layer-red, #c0392b)" stroke-width="1.5"/>`); });
  // legend
  const keys = [['ws', 'sx.su957.plot.ws'], ['egl', 'sx.su957.plot.egl'], ['crit', 'sx.su957.plot.crit'], ['bed', 'sx.su957.plot.bed'], ['lb', 'sx.su957.plot.lb'], ['rb', 'sx.su957.plot.rb']];
  let lx = ml;
  for (const [k, label] of keys) {
    const s = t(label);
    o.push(`<line x1="${lx}" x2="${lx + 22}" y1="${H - 22}" y2="${H - 22}" ${style[k]}/><text x="${lx + 26}" y="${H - 18}" fill="currentColor">${esc(s)}</text>`);
    lx += 34 + s.length * 6;
  }
  o.push(`<text x="${ml}" y="${H - 4}" fill="currentColor" font-style="italic">${esc(t('sx.su957.review'))}</text>`);
  o.push('</svg>');
  return o.join('');
}
