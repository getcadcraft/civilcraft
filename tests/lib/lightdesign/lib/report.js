/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — the room report (0.9 LD.7): a self-contained HTML page (print it to PDF from the browser) and a CSV. DOM-free: strings out.
 *   reportHtml(res, { t, title, project, luminaireNames, requirementsNote }) → string        reportCsv(res, { t }) → string
 *   scaleColor(v, max) → '#rrggbb' (a dark-blue to yellow sequential scale, so lowest to highest reads in print and for most colour-vision types)
 */
const STOPS = [[0.0, [38, 24, 94]], [0.25, [28, 94, 150]], [0.5, [24, 150, 140]], [0.75, [120, 190, 84]], [1.0, [250, 230, 80]]];
export function scaleColor(v, max) {
  const f = max > 0 ? Math.min(1, Math.max(0, v / max)) : 0;
  let i = 0; while (i < STOPS.length - 2 && f > STOPS[i + 1][0]) i++;
  const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1], u = (f - a) / (b - a);
  return '#' + ca.map((x, k) => Math.round(x + (cb[k] - x) * u).toString(16).padStart(2, '0')).join('');
}
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : '');
const csvq = (v) => { let x = String(v ?? ''); if (/^[=+\-@]/.test(x)) x = "'" + x; return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };

export function reportCsv(res, { t = (k) => k, title = '' } = {}) {
  const rows = [[t('rep.title'), title], [t('rep.area'), f(res.areaM2, 1)], [t('rep.count'), res.count], [t('rep.lumens'), f(res.lumens)], [t('rep.watts'), f(res.watts)], [t('rep.lpd'), f(res.lpd, 2)],
    [t('rep.em'), f(res.em)], [t('rep.emin'), f(res.emin)], [t('rep.emax'), f(res.emax)], [t('rep.uo'), f(res.uo, 2)], ['UGR', res.ugr === null || res.ugr === undefined ? '' : f(res.ugr, 1)],
    [t('rep.walls'), f(res.surfaces.walls)], [t('rep.ceiling'), f(res.surfaces.ceiling)], [t('rep.floor'), f(res.surfaces.floor)], [t('rep.llf'), res.llf],
    ...(res.daylight ? [[t('day.df'), f(res.daylight.dfAvg, 2)], [t('day.dfminmax'), f(res.daylight.dfMin, 2) + ' / ' + f(res.daylight.dfMax, 2)]] : []),
    ...(res.emergency ? res.emergency.checks.map((c) => [t('chk.' + c.key), f(c.found, 2), c.ok ? 'ok' : 'fail']) : []),
    [], ['x_mm', 'y_mm', 'z_mm', 'lux']];
  res.grid.points.forEach((p, i) => rows.push([...p.map((x) => Math.round(x)), f(res.grid.values[i], 1)]));
  return rows.map((r) => r.map(csvq).join(',')).join('\n') + '\n';
}

function mapSvg(res, W = 640) {
  const P = res.room.polygon, xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const k = (W - 20) / (x1 - x0), H = (y1 - y0) * k + 20, X = (x) => 10 + (x - x0) * k, Y = (y) => 10 + (y1 - y) * k, sp = res.grid.spacing, max = Math.max(res.emax, 1e-9);
  const label = res.grid.points.length <= 300 && sp * k >= 26;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" width="${W}" role="img" aria-label="lux">`;
  res.grid.points.forEach((p, i) => {
    const v = res.grid.values[i], c = scaleColor(v, max), dark = (parseInt(c.slice(1, 3), 16) * 0.3 + parseInt(c.slice(3, 5), 16) * 0.59 + parseInt(c.slice(5, 7), 16) * 0.11) < 140;
    s += `<rect x="${f(X(p[0] - sp / 2), 1)}" y="${f(Y(p[1] + sp / 2), 1)}" width="${f(sp * k + 0.5, 1)}" height="${f(sp * k + 0.5, 1)}" fill="${c}"/>`;
    if (label) s += `<text x="${f(X(p[0]), 1)}" y="${f(Y(p[1]) + 3.5, 1)}" font-size="10" text-anchor="middle" fill="${dark ? '#fff' : '#111'}" font-family="sans-serif">${Math.round(v)}</text>`;
  });
  s += `<polygon points="${P.map((p) => f(X(p[0]), 1) + ',' + f(Y(p[1]), 1)).join(' ')}" fill="none" stroke="#111" stroke-width="2"/>`;
  for (const L of res.luminaires || []) s += `<circle cx="${f(X(L.p[0]), 1)}" cy="${f(Y(L.p[1]), 1)}" r="4" fill="#fff" stroke="#111" stroke-width="1.5"/>`;
  return s + '</svg>';
}
function scaleSvg(res) {
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 36" width="320" role="img" aria-label="scale">';
  for (let i = 0; i < 32; i++) s += `<rect x="${i * 10}" y="0" width="10.5" height="14" fill="${scaleColor(i + 0.5, 32)}"/>`;
  return s + `<text x="0" y="30" font-size="11" font-family="sans-serif">0 lx</text><text x="320" y="30" font-size="11" text-anchor="end" font-family="sans-serif">${Math.round(res.emax)} lx</text></svg>`;
}


/** Daylight and emergency sections of the report (IL.7); '' when the result carries neither. */
function extraHtml(res, t) {
  const row = (a, b) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`, ck = (c) => `<tr><td>${esc(t('chk.' + c.key))}</td><td>${c.op === '>=' ? '≥' : '≤'} ${esc(f(c.req, 1))}</td><td>${esc(Number.isFinite(c.found) ? f(c.found, 2) : '∞')}</td><td>${c.ok ? '✓' : '✗'}</td></tr>`;
  let out = '';
  const d = res.daylight;
  if (d) out += `<h2>${esc(t('sec.dayres'))}</h2><table>${row(t('day.df'), f(d.dfAvg, 2) + ' %')}${row(t('day.dfminmax'), f(d.dfMin, 2) + ' / ' + f(d.dfMax, 2) + ' %')}${row(t('day.uo'), f(d.uo, 2))}${row(t('day.lux'), f(d.luxAvg) + ' lx (' + f(d.eext) + ' lx)')}${row(t('day.glazing'), f(d.windowArea, 2) + ' m² (' + f(d.glazingRatio * 100, 1) + ' %)')}</table><ul class="n">${d.notes.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>`;
  const e = res.emergency;
  if (e) out += `<h2>${esc(t('sec.emres'))}</h2><p class="n">${esc(t('em.facts', { n: e.count, of: e.of ?? e.count, share: f(e.share * 100) }))}</p><table>${row(t('em.r.route'), e.route.min === null ? '-' : f(e.route.min, 2) + ' / ' + f(e.route.max, 2) + ' lx')}${row(t('em.r.open'), e.open.min === null ? '-' : f(e.open.min, 2) + ' / ' + f(e.open.max, 2) + ' lx')}</table>${e.checks.length ? `<table>${e.checks.map(ck).join('')}</table>` : ''}<ul class="n">${e.notes.map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>`;
  return out;
}

export function reportHtml(res, { t = (k) => k, title = '', project = '', requirementsNote = '', luminaireNames = [] } = {}) {
  const row = (a, b) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`;
  const checks = (res.checks || []).map((c) => `<tr><td>${esc(t('chk.' + c.key))}</td><td>${c.op === '>=' ? '≥' : '≤'} ${esc(f(c.req, c.key === 'uo' ? 2 : c.key === 'lpd' ? 1 : 0))}</td><td>${esc(f(c.found, c.key === 'uo' ? 2 : c.key === 'ugr' ? 1 : c.key === 'lpd' ? 1 : 0))}</td><td>${c.ok ? esc(t('rep.met')) : '<b>' + esc(t('rep.notmet')) + '</b>'}</td></tr>`).join('');
  const names = luminaireNames.length ? `<p>${luminaireNames.map(esc).join('; ')}</p>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title || t('rep.title'))}</title><style>
body{font:14px/1.45 system-ui,sans-serif;max-width:46rem;margin:1.5rem auto;padding:0 1rem;color:#111}h1{font-size:1.4rem}h2{font-size:1.05rem;margin-top:1.6rem}table{border-collapse:collapse;margin:.4rem 0}th,td{text-align:left;padding:.15rem .8rem .15rem 0;vertical-align:top}
.n{color:#444;font-size:.85rem}svg{max-width:100%;height:auto}@media print{body{margin:0}}</style></head><body>
<h1>${esc(title || t('rep.title'))}</h1><p class="n">${esc(project)}</p>
<h2>${esc(t('rep.summary'))}</h2><table>${row(t('rep.area'), f(res.areaM2, 1) + ' m²')}${row(t('rep.height'), f(res.room.height / 1000, 2) + ' m')}${row(t('rep.workplane'), f(res.room.workplane / 1000, 2) + ' m')}${row(t('rep.refl'), `${f(res.room.refl.ceiling, 2)} / ${f(res.room.refl.walls, 2)} / ${f(res.room.refl.floor, 2)}`)}${row(t('rep.count'), res.count)}${row(t('rep.lumens'), f(res.lumens) + ' lm')}${row(t('rep.watts'), f(res.watts) + ' W')}${row(t('rep.lpd'), f(res.lpd, 2) + ' W/m² (' + f(res.lpd100, 2) + ' W/m² per 100 lx)')}${row(t('rep.llf'), res.llf)}</table>
${names}
<h2>${esc(t('rep.results'))}</h2><table>${row(t('rep.em'), f(res.em) + ' lx')}${row(t('rep.emin'), f(res.emin) + ' lx')}${row(t('rep.emax'), f(res.emax) + ' lx')}${row(t('rep.uo'), f(res.uo, 2))}${res.ugr === null || res.ugr === undefined ? '' : row('UGR', f(res.ugr, 1))}${row(t('rep.walls'), f(res.surfaces.walls) + ' lx')}${row(t('rep.ceiling'), f(res.surfaces.ceiling) + ' lx')}${row(t('rep.floor'), f(res.surfaces.floor) + ' lx')}${row(t('rep.direct'), Math.round(res.directShare * 100) + ' %')}</table>
${checks ? `<h2>${esc(t('rep.checks'))}</h2><table><tr><th>${esc(t('rep.item'))}</th><th>${esc(t('rep.required'))}</th><th>${esc(t('rep.found'))}</th><th></th></tr>${checks}</table><p class="n">${esc(requirementsNote)}</p>` : ''}
${extraHtml(res, t)}
<h2>${esc(t('rep.map'))}</h2>${mapSvg(res)}${scaleSvg(res)}
<h2>${esc(t('rep.notes'))}</h2><ul class="n">${(res.notes || []).map((k) => `<li>${esc(t(k))}</li>`).join('')}</ul>
</body></html>`;
}
