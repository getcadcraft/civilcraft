/* SPDX-License-Identifier: Apache-2.0 */
/**
 * review.js — the two printable sheets that help a person do what a session cannot (0.8.2 DC.117, session `cabinetcraft_addon` round 3). DOM-free: they return
 * HTML text (every person-typed string is escaped).
 *
 *   firstRunChecklist(build, { t, files, dry, holes, date }) → one printable page, "First machine run": what to check before the first sheet goes on the
 *       machine, with empty boxes. It lists the programs and what the dry-run saw. It never says a run happened: the first line says it has not.
 *   makerReview(build, { t, fmt }) → the maker's review sheet: every size and rule the corner cabinets, angled and curved walls and drilling used, where it
 *       came from, and empty "maker confirms / corrects to" boxes.
 *   reviewRows(build, { t, fmt }) → [{ group, what, value, source }] the rows of the second sheet
 */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const STYLE = `<style>@page{size:A4;margin:12mm}body{font:12px/1.35 sans-serif;color:#111;margin:0 auto;max-width:190mm}h1{font-size:18px;margin:0 0 4px}h2{font-size:13px;margin:12px 0 4px;border-bottom:1px solid #111}
.note{border:1px solid #111;padding:4px 6px;margin:6px 0;font-weight:bold}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:3px 5px;vertical-align:top;text-align:left}
.box{display:inline-block;width:12px;height:12px;border:1px solid #111;vertical-align:-2px;margin-right:6px}.line{display:inline-block;min-width:60mm;border-bottom:1px solid #111}small{color:#444}</style>`;

export function firstRunChecklist(build, { t, files = [], dry = null, holes = null, date = '' } = {}) {
  const p = build.project, unit = p.unit === 'in' ? 'in' : 'mm';
  const sheet = p.sheet;
  const box = (text) => `<li><span class="box"></span>${esc(text)}</li>`;
  const progs = files.length ? files.map((f) => `<li>${esc(f.name)}${f.sheet ? ' · ' + esc(t('run.sheet', { n: f.sheet })) : ''}${f.thickness ? ' · ' + esc(f.thickness + ' ' + unit) : ''}</li>`).join('') : `<li>${esc(t('run.noprograms'))}</li>`;
  const dryLines = [];
  if (dry && dry.length) for (const d of dry) dryLines.push(`<li>${esc(d.name)}: ${esc(t(d.ok ? 'run.dry.ok' : 'run.dry.bad', { moves: d.moves, len: Math.round(d.cutLen), min: d.minutesCut, issues: d.issues.filter((i) => i.severity === 'error').length }))}</li>`);
  else dryLines.push(`<li>${esc(t('run.dry.none'))}</li>`);
  const holeLine = holes ? esc(t(holes.ok ? 'run.holes.ok' : 'run.holes.bad', { n: holes.holes, parts: holes.parts, errors: holes.issues.filter((i) => i.severity === 'error').length })) : esc(t('run.dry.none'));
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t('run.title'))}</title>${STYLE}</head><body>
<h1>${esc(t('run.title'))}</h1>
<div>${esc(p.name || '')}${date ? ' · ' + esc(date) : ''} · ${esc(sheet.w + ' × ' + sheet.h + ' ' + unit)}</div>
<p class="note">${esc(t('run.notrun'))}</p>
<h2>${esc(t('run.h.files'))}</h2><ul>${progs}</ul>
<h2>${esc(t('run.h.dry'))}</h2><ul>${dryLines.join('')}<li>${esc(t('run.holes'))}: ${holeLine}</li></ul><small>${esc(t('run.dry.note'))}</small>
<h2>${esc(t('run.h.before'))}</h2><ul style="list-style:none;padding:0">
${['run.c.post', 'run.c.units', 'run.c.tool', 'run.c.spindle', 'run.c.origin', 'run.c.spoil', 'run.c.hold', 'run.c.limits', 'run.c.air', 'run.c.estop'].map((k) => box(t(k))).join('')}</ul>
<h2>${esc(t('run.h.first'))}</h2><ul style="list-style:none;padding:0">
${['run.f.cut', 'run.f.size', 'run.f.compare', 'run.f.sheet', 'run.f.holes'].map((k) => box(t(k))).join('')}</ul>
<h2>${esc(t('run.h.sign'))}</h2>
<p>${esc(t('run.sign.machine'))} <span class="line"></span> &nbsp; ${esc(t('run.sign.post'))} <span class="line"></span></p>
<p>${esc(t('run.sign.by'))} <span class="line"></span> &nbsp; ${esc(t('run.sign.date'))} <span class="line"></span></p>
<p>${esc(t('run.sign.notes'))}<br><span class="line" style="width:100%"></span><br><span class="line" style="width:100%"></span></p>
</body></html>`;
}

export function reviewRows(build, { t, fmt = (v) => String(Math.round(v * 100) / 100) } = {}) {
  const { R, layout, project } = build;
  const unit = project.unit === 'in' ? 'in' : 'mm';
  const f = (v) => fmt(v) + ' ' + unit;
  const rows = [];
  const add = (group, what, value, source) => rows.push({ group, what, value, source });
  const common = t('rev.src.common'), rule = t('rev.src.rule'), geo = t('rev.src.geometry'), typed = t('rev.src.typed'), mine = t('rev.src.mine');
  for (const c of build.cells) {
    if (c.kind !== 'cab' || !c.corner || !c.cell.turn) continue;
    const cb = c.corner;
    const g = c.no + ' · ' + t('tpl.' + c.cell.entry.tpl);
    add(g, t('rev.width'), f(c.cab.w), common);
    add(g, t('rev.depth'), f(c.cab.d), common);
    add(g, t('rev.arm'), f(c.cab.w - c.cab.d), rule);
    add(g, t('rev.angle'), (cb.tau ?? 90) + '°', geo);
    if (cb.form === 'adiag') {
      add(g, t('rev.mitre'), f1(cb.dg.mitreAngle) + '°', geo);
      add(g, t('rev.front'), f(cb.frontLen), geo);
      add(g, t('rev.tri'), f(cb.dg.ell) + ' / ' + f1(cb.dg.apex) + '°', geo);
    } else if (cb.form !== 'l') add(g, t('rev.front'), f((c.cab.w - c.cab.d) * Math.SQRT2), geo);
    add(g, t('rev.door'), f(cb.doorW) + ' × ' + f(cb.doorH), common);
    add(g, t('rev.reveal'), f(R.reveal), rule);
    add(g, t('rev.shelf'), t('rev.shelf.how'), common);
    if (cb.form === 'lazy') add(g, t('rev.lazy'), f(cb.lazy ? cb.lazy.r * 2 : 0), common);
    add(g, t('rev.drill.pins'), f(R.sysLine) + ' / ' + f(R.pitch) + ' / ' + f(R.sysStart), rule);
    add(g, t('rev.drill.cup'), f(R.cupD) + ' ⌀, ' + f(R.cupEdge), rule);
    add(g, t('rev.drill.plate'), f(R.plateD) + ' ⌀', rule);
    const hw = project.hw || {};
    add(g, t('rev.fasten'), hw.fastenDia ? f(hw.fastenDia) + ' ⌀ / ' + (hw.fastenDepth ? f(hw.fastenDepth) : t('rev.blank')) : t('rev.blank'), typed);
    if (cb.form === 'lazy') {
      add(g, t('rev.pivot'), hw.pivotDia ? f(hw.pivotDia) + ' ⌀' : t('rev.blank'), typed);
      add(g, t('rev.shaft'), hw.shaftDia ? f(hw.shaftDia) + ' ⌀' : t('rev.blank'), typed);
    }
  }
  for (const wd of build.wedges || []) {
    const g = wd.no + ' · ' + t('rev.wedge');
    add(g, t('rev.angle'), (180 - wd.tau) + '° ' + t('rev.inside'), geo);
    add(g, t('rev.wedge.legs'), f(wd.leg1) + ' × ' + f(wd.leg2), geo);
    add(g, t('rev.wedge.panel'), f(wd.depth) + ' × ' + f(wd.height), mine);
  }
  for (const L of layout.runs) for (const row of ['base', 'upper']) {
    const ar = L.rows[row].arc;
    if (!ar || ar.invalid) continue;
    const g = L.run.id + ' · ' + t('rev.arc') + ' · ' + t('row.' + row);
    add(g, t('rev.radius'), f(ar.r) + (ar.bay ? ' (' + t('rev.bay') + ')' : ' (' + t('rev.bow') + ')'), geo);
    add(g, t('rev.gap'), f(ar.gapMax), geo);
    const w = ar.wedges.filter((q) => q.cabs).map((q) => (ar.bay ? q.back : q.front));
    if (w.length) add(g, t(ar.bay ? 'rev.void' : 'rev.wedgefront'), f(Math.max(...w)), geo);
  }
  for (const c of build.cells) if (c.kind === 'cab' && c.madeToOrder) add(c.no + ' · ' + t('rev.mto'), t('rev.radius'), f(c.madeToOrder.rFront) + ' / ' + f(c.madeToOrder.arcLen), geo);
  if (!rows.length) add(t('rev.none.group'), t('rev.none'), '', '');
  return rows;
}
const f1 = (v) => String(Math.round(v * 10) / 10);

export function makerReview(build, { t, fmt } = {}) {
  const rows = reviewRows(build, { t, fmt });
  const groups = [...new Set(rows.map((r) => r.group))];
  const body = groups.map((g) => `<h2>${esc(g)}</h2><table><tr><th>${esc(t('rev.col.what'))}</th><th>${esc(t('rev.col.value'))}</th><th>${esc(t('rev.col.source'))}</th><th>${esc(t('rev.col.confirm'))}</th><th>${esc(t('rev.col.correct'))}</th></tr>${rows.filter((r) => r.group === g).map((r) => `<tr><td>${esc(r.what)}</td><td>${esc(r.value)}</td><td><small>${esc(r.source)}</small></td><td><span class="box"></span></td><td style="min-width:36mm">&nbsp;</td></tr>`).join('')}</table>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(t('rev.title'))}</title>${STYLE}</head><body>
<h1>${esc(t('rev.title'))}</h1><div>${esc(build.project.name || '')}</div>
<p class="note">${esc(t('rev.note'))}</p>${body}
<p>${esc(t('rev.sign.maker'))} <span class="line"></span> &nbsp; ${esc(t('run.sign.date'))} <span class="line"></span></p></body></html>`;
}
