/* SPDX-License-Identifier: Apache-2.0 */
/**
 * classify-ui.js — ground and geometric classes (spec § 8, PC.5 / PC.6). Tile by tile, so memory is a tile and not the cloud. The
 * result is ONE undo step in the cloud's edit log. The report lists what was found, the tiles and every seam the tiles disagree on.
 */
import { el, field, numInput, select, progressRow } from './ui.js';
import { fmtN, fmt } from './ctx.js';

export function mountClassify(ctx) {
  const t = ctx.t;
  const cell = numInput(1, { min: 0.1, step: 0.1, 'data-pc-g-cell': '' });
  const tol = numInput(0.15, { min: 0.01, step: 0.01, 'data-pc-g-tol': '' });
  const survey = el('input', { type: 'checkbox', 'data-pc-g-survey': '' });
  const slope = numInput(0.3, { min: 0.01, step: 0.05, 'data-pc-g-slope': '' });
  const maxObj = numInput(20, { min: 2, step: 1, 'data-pc-g-obj': '' });
  const start = select([['file', t('pc.g.start.file')], ['reset', t('pc.g.start.reset')]], 'reset', { 'data-pc-g-start': '' });
  survey.addEventListener('change', () => { tol.value = survey.checked ? '0.08' : '0.15'; tol.disabled = survey.checked; });
  const runG = el('button', { type: 'button', className: 'btn-plot', disabled: true, 'data-pc-ground': '' }, t('pc.g.run'));
  const runC = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-geom': '' }, t('pc.c.run'));
  const report = el('div', { className: 'pc-note', 'data-pc-g-report': '', role: 'status' });
  let ctl = null;
  const prog = progressRow(t('pc.cancel'), () => ctl && ctl.abort());
  prog.row.setAttribute('data-pc-g-progress', '');
  const sync = () => { runG.disabled = runC.disabled = !ctx.cloud || !!ctl; };
  ctx.on('cloud', () => { report.replaceChildren(); sync(); });

  async function run(kind) {
    ctl = new AbortController(); sync(); report.replaceChildren();
    const progress = (f, phase) => prog.set(f, (phase ? (t('pc.progress.' + phase) !== 'pc.progress.' + phase ? t('pc.progress.' + phase) : phase) + ' ' : '') + Math.round(f * 100) + ' %');
    try {
      if (kind === 'ground') {
        const p = { cell: Number(cell.value), tolerance: Number(tol.value), surveyGrade: survey.checked, slope: Number(slope.value), maxObject: Number(maxObj.value), start: start.value, label: t('pc.g.label') };
        ctx.classTolerance = survey.checked ? 0.08 : Number(tol.value);
        const r = await ctx.PC.classifyGround(ctx.cloud, p, { signal: ctl.signal, progress });
        await ctx.cloud.edits.saved();
        ctx.groundResult = r;
        report.append(el('div', { 'data-pc-g-done': '' }, t('pc.g.done', { ground: fmtN(r.ground), noise: fmtN(r.noise), tiles: r.tiles, ms: Math.round(r.ms) })));
        const seams = r.seamFlags || [];
        report.append(el('div', { 'data-pc-g-seams': seams.length }, seams.length ? t('pc.g.seams', { n: seams.length }) : t('pc.g.seams.none')));
        if (seams.length) report.append(el('ul', { className: 'pc-list' }, ...seams.slice(0, 12).map((s) => el('li', {}, t('pc.g.seam', { a: s.a.join(','), b: s.b.join(','), step: fmt(s.step, 3) })))));
      } else {
        const r = await ctx.PC.classifyGeometric(ctx.cloud, { label: t('pc.c.label') }, { signal: ctl.signal, progress });
        await ctx.cloud.edits.saved();
        const c = r.counts || {};
        report.append(el('div', { 'data-pc-c-done': '' }, t('pc.c.done', { low: fmtN(c[3] || 0), mid: fmtN(c[4] || 0), high: fmtN(c[5] || 0), building: fmtN(c[6] || 0), ms: Math.round(r.ms) })));
      }
      prog.hide();
      ctx.emit('edited');
    } catch (e) {
      prog.hide();
      report.append(el('div', {}, ctx.isAbort(e) ? t('pc.stopped') : ctx.err(e)));
    }
    ctl = null; sync();
  }
  runG.addEventListener('click', () => run('ground'));
  runC.addEventListener('click', () => run('geom'));

  return el('details', { open: true, 'data-pc-sec': 'ground' }, el('summary', {}, t('pc.sec.ground')),
    el('p', { className: 'pc-note' }, t('pc.g.what')),
    field(t('pc.g.cell'), cell, t('pc.g.cell.hint')),
    field(t('pc.g.tol'), tol, t('pc.g.tol.hint')),
    el('label', { className: 'cv-check' }, survey, t('pc.g.survey')),
    field(t('pc.g.slope'), slope, t('pc.g.slope.hint')),
    field(t('pc.g.obj'), maxObj, t('pc.g.obj.hint')),
    field(t('pc.g.start'), start),
    el('div', { className: 'pc-row' }, runG, runC), prog.row, report);
}
