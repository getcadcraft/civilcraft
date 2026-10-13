/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report-html.mjs — report.json → one self-contained static HTML page (no external assets; system
 * font; light/dark; sticky headers; green/amber/red cells; <details> to expand mismatches).
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const floor1 = (x) => (Math.floor(x * 1000) / 10).toFixed(1);   // never rounds 99.96% up to 100%
const pct = (a, b) => (b ? (a === b ? '100%' : floor1(a / b) + '%') : '—');
const p1 = (x) => (x == null ? '—' : x === 1 ? '100%' : floor1(x) + '%');
const ms = (x) => (x == null ? '—' : x >= 10000 ? (x / 1000).toFixed(1) + ' s' : Math.round(x) + ' ms');
const mb = (x) => (x == null ? '—' : x >= 100 ? Math.round(x) + ' MB' : (+x).toFixed(1) + ' MB');
const kb = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB');
const n = (x) => (x == null ? '—' : Number(x).toLocaleString('en-US'));

function cellClass(r, { truthOk = true } = {}) {
  if (!r) return 'na';
  if (r.built === false) return 'na';
  if (!r.opened) return 'bad';
  const m = r.match;
  if (!truthOk || !m) return r.errors ? 'warn' : 'ok';
  if ((m.pct === 1 || (!m.mismatched && !m.missing)) && !m.extra && !r.errors) return 'ok';
  if (m.pct >= 0.9) return 'warn';
  return 'bad';
}

function detailsBlock(r, { extraLabel = 'extra' } = {}) {
  const parts = [];
  const m = r.match;
  if (m?.explained) parts.push(`<p class="k">Differ only by ODA's DXF conventions (${n(m.explained)}; the DWG holds what we read)</p><ul>${Object.entries(m.explainedBy || {}).map(([k, v]) => `<li>${esc(k)}: ${n(v)}</li>`).join('')}</ul>`);
  if (m && (m.mismatched || m.missing || m.extra)) {
    const bf = Object.entries(m.byField || {}).sort((a, b) => b[1] - a[1]).slice(0, 12);
    if (bf.length) parts.push(`<p class="k">Fields that differ</p><ul>${bf.map(([k, v]) => `<li><code>${esc(k)}</code> ${n(v)}</li>`).join('')}</ul>`);
    if (m.details?.length) parts.push(`<p class="k">First mismatches (want → got)${m.agreed ? ` — ${n(m.agreed)} of ${n(m.details.length)} read the same by another DWG reader (marked =)` : ''}</p><ul class="mono">${m.details.slice(0, 40).map((d) => `<li>${esc(d.t)} ${esc(d.h)}${d.gh ? '↔' + esc(d.gh) : ''} <b>${esc(d.field)}</b>: ${esc(d.want)} → ${esc(d.got)}${d.agree ? ` <span class="agree" title="the same value as ${esc(d.agree.join(', '))}: probably how ODA writes the DXF">= ${esc(d.agree.join(', '))}</span>` : ''}</li>`).join('')}</ul>`);
    if (m.samplesMissing?.length) parts.push(`<p class="k">Missing (${n(m.missing)})</p><ul class="mono">${m.samplesMissing.slice(0, 15).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
    if (m.samplesExtra?.length) parts.push(`<p class="k">${esc(extraLabel)} (${n(m.extra)})</p><ul class="mono">${m.samplesExtra.slice(0, 15).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
    const tc = Object.entries(m.typeCounts || {}).filter(([, [a, b]]) => a !== b);
    if (tc.length) parts.push(`<p class="k">Counts that differ (want / got)</p><ul>${tc.map(([t, [a, b]]) => `<li>${esc(t)} ${n(a)} / ${n(b)}</li>`).join('')}</ul>`);
  }
  if (r.unknown && Object.keys(r.unknown).length) parts.push(`<p class="k">Unknown types</p><ul>${Object.entries(r.unknown).map(([t, c]) => `<li>${esc(t)} ${n(c)}</li>`).join('')}</ul>`);
  if (r.problems?.length) parts.push(`<p class="k">Problems${r.errors ? ` (${n(r.errors)} errors${r.warnings ? ', ' + n(r.warnings) + ' warnings' : ''})` : ''}</p><ul class="mono">${r.problems.slice(0, 20).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
  else if (r.warnings) parts.push(`<p class="k">${n(r.warnings)} warnings</p>`);
  if (r.notes?.length) parts.push(`<p class="k">Notes</p><ul>${r.notes.slice(0, 20).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
  if (r.note) parts.push(`<p>${esc(r.note)}</p>`);
  return parts.length ? `<details><summary>details</summary>${parts.join('')}</details>` : '';
}

function readerCell(r, truthOk) {
  if (!r) return '<td class="na">—</td>';
  if (r.built === false) return `<td class="na"><span class="st">not built yet</span></td>`;
  const cls = cellClass(r, { truthOk });
  const m = r.match;
  const status = !r.opened ? 'did not open' : r.errors ? `opened, ${n(r.errors)} error${r.errors === 1 ? '' : 's'}` : 'opened';
  const unk = r.unknown ? Object.values(r.unknown).reduce((s, x) => s + x, 0) : 0;
  return `<td class="${cls}"><span class="st">${esc(status)}</span>`
    + `<span class="row2"><b>${m ? p1(m.pct) : r.truth ? 'truth' : '—'}</b>${m?.explained ? ` <span class="mut">+${n(m.explained)} expl.</span>` : ''} <span class="mut">${n(r.count)} ent</span></span>`
    + (m && (m.mismatched || m.missing || m.extra) ? `<span class="row3 mut">${m.mismatched ? n(m.mismatched) + ' differ ' : ''}${m.missing ? n(m.missing) + ' missing ' : ''}${m.extra ? n(m.extra) + ' extra' : ''}</span>` : '')
    + (unk ? `<span class="row3 mut">${n(unk)} unknown</span>` : '')
    + `<span class="row3 mut">${ms(r.ms)} · ${mb(r.peakMB)}</span>`
    + detailsBlock(r) + '</td>';
}

function readerSection(rep) {
  const R = rep.reader;
  const ids = R.readers;
  const names = rep.readerNames;
  const order = ['orig', 'AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];
  const label = (d) => (d === 'orig' ? 'original' : d);
  // overall cards
  const o = R.totals.overall;
  const cards = ids.map((id) => {
    const a = o[id];
    if (!a || !a.built) return `<div class="card na"><h3>${esc(names[id])}</h3><p class="big">not built yet</p><p class="mut">${esc(rep.probe?.readerWhy || '')}</p></div>`;
    const cls = a.opened === a.built && a.matched + (a.explained || 0) === a.truth ? 'ok' : a.opened / a.built >= 0.9 ? 'warn' : 'bad';
    return `<div class="card ${id === 'oda' ? 'truth' : cls}"><h3>${esc(names[id])}</h3>`
      + `<p class="big">${id === 'oda' ? 'truth' : pct(a.matched, a.truth)}</p><p class="mut">${id === 'oda' ? n(a.truth) + ' entities' : n(a.matched) + ' of ' + n(a.truth) + ' entities match' + (a.explained ? `; + ${n(a.explained)} differ only by ODA's DXF conventions = ${pct(a.matched + a.explained, a.truth)}<br>${Object.entries(a.explainedBy || {}).map(([k, v]) => esc(k) + ': ' + n(v)).join('<br>')}` : '')}</p>`
      + `<dl><dt>opened</dt><dd>${a.opened}/${a.built}</dd><dt>no errors</dt><dd>${a.clean}/${a.built}</dd><dt>files 100%</dt><dd>${id === 'oda' ? '—' : a.full}</dd><dt>mean time</dt><dd>${ms(a.msN ? a.ms / a.msN : null)}</dd><dt>peak memory</dt><dd>${mb(a.peakMB)}</dd>${a.unknown ? `<dt>unknown</dt><dd>${n(a.unknown)}</dd>` : ''}</dl></div>`;
  }).join('');
  // per-version table
  const dirs = order.filter((d) => R.totals.perDir[d]);
  const vt = `<table class="tot"><thead><tr><th>Version</th>${ids.map((id) => `<th>${esc(names[id])}</th>`).join('')}</tr></thead><tbody>`
    + dirs.map((d) => `<tr><th>${esc(label(d))}</th>${ids.map((id) => {
      const a = R.totals.perDir[d][id];
      if (!a || !a.built) return '<td class="na">not built yet</td>';
      const cls = id === 'oda' ? (a.opened === a.built ? 'ok' : 'warn') : a.opened === a.built && a.matched + (a.explained || 0) === a.truth && a.clean === a.built ? 'ok' : a.truth && a.matched / a.truth >= 0.9 ? 'warn' : 'bad';
      return `<td class="${cls}"><b>${id === 'oda' ? n(a.truth) + ' ent' : pct(a.matched, a.truth)}</b>${id !== 'oda' && a.explained ? ` <span class="mut">(+expl. ${pct(a.matched + a.explained, a.truth)})</span>` : ''} <span class="mut">opened ${a.opened}/${a.built}, clean ${a.clean}, ${ms(a.msN ? a.ms / a.msN : null)}</span></td>`;
    }).join('')}</tr>`).join('')
    + `<tr class="sum"><th>All</th>${ids.map((id) => { const a = o[id]; return !a || !a.built ? '<td class="na">—</td>' : `<td><b>${id === 'oda' ? n(a.truth) + ' ent' : pct(a.matched, a.truth)}</b> <span class="mut">opened ${a.opened}/${a.built}, clean ${a.clean}</span></td>`; }).join('')}</tr></tbody></table>`;
  // main table
  const rows = [...R.rows].sort((a, b) => a.name.localeCompare(b.name) || order.indexOf(a.dir) - order.indexOf(b.dir));
  let last = '';
  const body = rows.map((r) => {
    const head = r.name !== last ? `<tr class="grp" data-file="${esc(r.name)}"><th colspan="${ids.length + 2}">${esc(r.name)} <span class="mut">${esc(r.source)}</span></th></tr>` : '';
    last = r.name;
    return head + `<tr data-file="${esc(r.name)}" data-dir="${esc(r.dir)}"><th class="file">${esc(label(r.dir))}<span class="mut">${esc(r.version)} · ${kb(r.size)}</span></th>`
      + `<td class="num">${r.truth.ok ? n(r.truth.entities) : '<span class="bad-t">no truth</span>'}</td>`
      + ids.map((id) => readerCell(r.results[id], r.truth.ok)).join('') + '</tr>';
  }).join('');
  const filt = `<div class="filters"><label>File <input id="ff" type="search" placeholder="name contains…"></label> <label>Version <select id="fv"><option value="">all</option>${dirs.map((d) => `<option>${esc(d)}</option>`).join('')}</select></label> <label><input id="fp" type="checkbox"> only rows that are not all green</label></div>`;
  return `<section id="reader"><h2>Reader</h2>
<p class="lede">Each corpus file (the same drawing in its original version and saved by the ODA File Converter in six versions) read by every reader. <b>Match</b> = entities equal to the truth (ODA → DXF 2018 → ezdxf) by handle — type, layer, owner block and the key geometry and text (numbers to 1e-9 relative, angles mod 2π). libdxfrw renumbers handles, so it is matched by content. Time is the reader's own (LibreDWG: <code>dwgread -v2</code>; libredwg-web: read + convert without module load); memory is the peak RSS of its process.</p>
<div class="cards">${cards}</div>
<h3>Per version</h3>${vt}
<h3>Per file</h3>${filt}
<div class="scroll"><table class="main" id="rt"><thead><tr><th>File / version</th><th>Truth</th>${ids.map((id) => `<th>${esc(names[id])}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div></section>`;
}

function writerSection(rep) {
  const W = rep.writer;
  const ids = W.verifyIds;
  const names = { oda: 'ODA File Converter', libredwg: 'LibreDWG dwgread', libdxfrw: 'libdxfrw', ours: 'Our reader' };
  const cell = (r) => {
    if (!r) return '<td class="na">—</td>';
    if (r.built === false) return `<td class="na"><span class="st">not built yet</span></td>`;
    const cls = cellClass(r);
    const status = !r.opened ? 'did not open' : r.errors ? `${n(r.errors)} error${r.errors === 1 ? '' : 's'}` : 'opened clean';
    return `<td class="${cls}"><span class="st">${esc(status)}</span><span class="row2"><b>${r.match ? p1(r.match.pct) : '—'}</b> <span class="mut">${n(r.count)} ent</span></span>${detailsBlock(r, { extraLabel: 'Not in the source' })}</td>`;
  };
  const totals = Object.values(W.totals || {}).sort((a, b) => a.writer.localeCompare(b.writer) || a.target.localeCompare(b.target));
  const tt = totals.length ? `<table class="tot"><thead><tr><th>Writer → version</th><th>Written</th>${ids.map((id) => `<th>${esc(names[id])}</th>`).join('')}</tr></thead><tbody>${totals.map((t) => `<tr><th>${esc(t.writer === 'seed' ? 'CivilCraft seed' : 'Ours')} → ${esc(t.target)}</th><td class="${t.written === t.jobs ? 'ok' : t.written ? 'warn' : 'bad'}">${t.written}/${t.jobs}</td>${ids.map((id) => { const b = t.readers[id]; if (!b || !b.runs) return '<td class="na">—</td>'; const cls = b.clean === b.runs && b.matched + (b.explained || 0) === b.source ? 'ok' : b.opened === b.runs ? 'warn' : 'bad'; return `<td class="${cls}">opened ${b.opened}/${b.runs}, clean ${b.clean} · <b>${pct(b.matched, b.source)}</b>${b.explained ? ` (+expl. ${pct(b.matched + b.explained, b.source)})` : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table>` : '';
  const rows = W.rows.map((r) => `<tr><th class="file">${esc(r.input)}<span class="mut">${r.writer === 'seed' ? 'CivilCraft dwg-write.js (seed)' : 'ours'} → ${esc(r.target)}${r.tag && r.tag !== r.target ? ' (file says ' + esc(r.tag) + ')' : ''}</span></th>`
    + `<td class="${r.written ? 'ok' : 'bad'}"><span class="st">${r.written ? 'written' : 'failed'}</span><span class="row3 mut">${r.bytes ? kb(r.bytes) : ''} ${ms(r.ms)}${r.peakMB ? ' · ' + mb(r.peakMB) : ''} · ${n(r.sourceCount)} source ent</span>${r.error || r.notes?.length ? `<details><summary>details</summary>${r.error ? `<pre>${esc(r.error)}</pre>` : ''}${r.notes?.length ? `<ul>${r.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</details>` : ''}</td>`
    + ids.map((id) => cell(r.readers?.[id])).join('') + '</tr>').join('');
  return `<section id="writer"><h2>Writer</h2>
<p class="lede">${W.built ? '' : `<span class="pill na">Our writer: not built yet</span> ${esc(W.why || '')}. `}Inputs: CivilCraft's three test drawings (fixture, every-kind, big) and every selected corpus file read by our reader, each written in ${esc((W.targets || []).join(', '))}. Each output is opened by the ODA File Converter (a .err = it had to repair it), LibreDWG <code>dwgread</code> (ERROR lines), libdxfrw (Success) and our reader; <b>match</b> = entities equal to the source model by type, layer, owner and geometry (handles may be renumbered).${W.built ? '' : ' Until then only the baseline rows show: CivilCraft\'s own R2000 writer (the seed of ours) on its three drawings.'}</p>
${tt}<div class="scroll"><table class="main"><thead><tr><th>Input → version</th><th>Write</th>${ids.map((id) => `<th>${esc(names[id])}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

export function renderHtml(rep) {
  const css = `
:root{color-scheme:light dark;--bg:#fbfbfa;--fg:#1d1f21;--mut:#6a6f75;--line:#d9dbde;--head:#f0f1f2;--ok:#dff3e4;--okb:#2f8f4e;--warn:#fff1cc;--warnb:#b07d00;--bad:#fde0dd;--badb:#c0392b;--na:#eceeef;--truth:#e3ecfb}
@media (prefers-color-scheme:dark){:root{--bg:#141618;--fg:#e4e6e8;--mut:#9aa0a6;--line:#30343a;--head:#1d2024;--ok:#16301f;--okb:#58c27d;--warn:#33290d;--warnb:#e0b341;--bad:#3a1a17;--badb:#ef6b5d;--na:#202327;--truth:#1a2638}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header,section{padding:16px 20px}h1{margin:0 0 4px;font-size:22px}h2{font-size:19px;margin:8px 0}h3{font-size:15px;margin:18px 0 8px}
.mut{color:var(--mut)}.lede{max-width:none;color:var(--mut)}code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}
nav a{margin-right:14px;color:inherit}
.cards{display:flex;flex-wrap:wrap;gap:12px}.card{border:1px solid var(--line);border-left:4px solid var(--line);border-radius:4px;padding:10px 14px;min-width:200px;flex:1 1 200px}
.card.ok{border-left-color:var(--okb)}.card.warn{border-left-color:var(--warnb)}.card.bad{border-left-color:var(--badb)}.card.truth{border-left-color:#4a7bd0}.card h3{margin:0 0 4px;font-size:14px}
.big{font-size:24px;font-weight:650;margin:0}.card dl{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;margin:8px 0 0}.card dt{color:var(--mut)}.card dd{margin:0}
table{border-collapse:separate;border-spacing:0;width:100%}th,td{border-bottom:1px solid var(--line);border-right:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
thead th{position:sticky;top:0;background:var(--head);z-index:2;white-space:nowrap}table.tot td,table.tot th{font-size:13px}
.scroll{overflow:auto;max-height:85vh;border:1px solid var(--line)}
td.ok{background:var(--ok)}td.warn{background:var(--warn)}td.bad{background:var(--bad)}td.na{background:var(--na);color:var(--mut)}
td .st{display:block;font-weight:600}td .row2,td .row3{display:block}td .row3{font-size:12px}
tr.grp th{background:var(--head);position:sticky;top:34px;z-index:1;font-weight:650}th.file{white-space:nowrap;font-weight:600}th.file .mut{display:block;font-weight:400;font-size:12px}
td.num{text-align:right;white-space:nowrap}.bad-t{color:var(--badb)}
details{margin-top:4px}summary{cursor:pointer;color:var(--mut);font-size:12px}details ul{margin:2px 0 6px;padding-left:18px;max-width:46em}details li{word-break:break-word}details .k{margin:6px 0 2px;font-weight:600;font-size:12px}
pre{white-space:pre-wrap;font-size:12px}
.filters{margin:6px 0 10px;display:flex;gap:16px;flex-wrap:wrap;align-items:center}.filters input[type=search],.filters select{font:inherit;padding:3px 6px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:3px}
.pill{display:inline-block;padding:1px 8px;border-radius:10px;font-weight:600}.pill.na{background:var(--warn)}
.agree{color:var(--okb);font-weight:600}.legend span{display:inline-block;padding:1px 8px;margin-right:6px;border-radius:3px}`;
  const js = `
(function(){var f=document.getElementById('ff'),v=document.getElementById('fv'),p=document.getElementById('fp');if(!f)return;
function run(){var q=f.value.toLowerCase(),d=v.value,only=p.checked,shown={};
document.querySelectorAll('#rt tbody tr[data-dir]').forEach(function(tr){var ok=(!q||tr.dataset.file.toLowerCase().indexOf(q)>=0)&&(!d||tr.dataset.dir===d)&&(!only||tr.querySelector('td.warn,td.bad'));tr.hidden=!ok;if(ok)shown[tr.dataset.file]=1;});
document.querySelectorAll('#rt tbody tr.grp').forEach(function(tr){tr.hidden=!shown[tr.dataset.file];});}
f.addEventListener('input',run);v.addEventListener('change',run);p.addEventListener('change',run);})();`;
  const ours = rep.probe ? `Our reader: <b>${rep.probe.reader ? 'built' : 'not built yet'}</b> · our writer: <b>${rep.probe.writer ? 'built' : 'not built yet'}</b> (lib/dwg ${esc(rep.libdwg)})` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>cc-dwg comparison</title><style>${css}</style></head><body>
<header><h1>cc-dwg — reader and writer comparison</h1>
<p class="mut">Generated ${esc(rep.generated)} in ${rep.seconds ?? '?'} s · corpus ${n(rep.corpus.files)} files of ${n(rep.corpus.drawings)} drawings · ${ours} · args: <code>${esc((rep.args || []).join(' ') || '(none)')}</code></p>
<p class="legend"><span style="background:var(--ok)">opened, no errors, 100% match</span><span style="background:var(--warn)">opened with errors, or ≥ 90% match</span><span style="background:var(--bad)">did not open, or &lt; 90% match</span><span style="background:var(--na)">not built / not run</span></p>
<nav>${rep.reader ? '<a href="#reader">Reader</a>' : ''}${rep.writer ? '<a href="#writer">Writer</a>' : ''}</nav></header>
${rep.reader ? readerSection(rep) : ''}${rep.writer ? writerSection(rep) : ''}
<script>${js}</script></body></html>`;
}
