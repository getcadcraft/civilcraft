/* SPDX-License-Identifier: Apache-2.0 */
/**
 * clean-ui.js — cleaning with the edit log (spec § 7, PC.3 / PC.4): lasso / box / polygon selection (overlay.js), the count of what is
 * inside BEFORE anything changes, then class / delete / restore / crop to boundary; the outlier filter dialog; Undo and Redo bound to
 * the cloud's edit log (never to the project's); the log can be saved as JSON for a report. The source file and the tiles are never touched.
 */
import { el, field, select, numInput, dialog, progressRow, download } from './ui.js';
import { drawRing } from './overlay.js';
import { fmtN } from './ctx.js';

const CLASSES = [[1, 'pc.class.1'], [2, 'pc.class.2'], [3, 'pc.class.3'], [4, 'pc.class.4'], [5, 'pc.class.5'], [6, 'pc.class.6'], [7, 'pc.class.7'], [9, 'pc.class.9'], [18, 'pc.class.18']];

export function mountClean(ctx) {
  const t = ctx.t;
  let region = null, count = null;
  const countBox = el('div', { className: 'pc-note', 'data-pc-count': '', role: 'status' });
  const zmin = numInput('', { placeholder: t('pc.clean.any'), 'data-pc-zmin': '' }), zmax = numInput('', { placeholder: t('pc.clean.any'), 'data-pc-zmax': '' });
  const fromSel = select([['', t('pc.clean.anyclass')], ...CLASSES.map(([c, k]) => [c, c + ' ' + t(k)])], '', { 'data-pc-from': '' });
  const action = select([['delete', t('pc.act.delete')], ['class', t('pc.act.class')], ['restore', t('pc.act.restore')], ['crop', t('pc.act.crop')]], 'delete', { 'data-pc-action': '' });
  const toSel = select(CLASSES.map(([c, k]) => [c, c + ' ' + t(k)]), 7, { 'data-pc-to': '' });
  const applyBtn = el('button', { type: 'button', className: 'btn-plot', disabled: true, 'data-pc-apply': '' }, t('pc.apply'));
  const undoBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-undo': '' }, t('pc.undo'));
  const redoBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-redo': '' }, t('pc.redo'));
  const log = el('ol', { className: 'pc-list', 'data-pc-log': '' });
  const tools = el('div', { className: 'pc-row' }, ...[['lasso', 'pc.tool.lasso'], ['box', 'pc.tool.box'], ['polygon', 'pc.tool.polygon']].map(([k, w]) =>
    el('button', { type: 'button', className: 'btn-line', 'data-pc-tool': k, disabled: true, onclick: () => pick(k) }, t(w))));
  const allBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-tool': 'all', onclick: () => setRegion({ type: 'all' }) }, t('pc.tool.all'));
  tools.append(allBtn);
  const hint = el('p', { className: 'pc-note' }, t('pc.clean.hint'));

  const enabled = () => !!ctx.cloud;
  function sync() {
    for (const b of tools.querySelectorAll('button')) b.disabled = !enabled();
    const e = ctx.cloud && ctx.cloud.edits;
    undoBtn.disabled = !e || !e.canUndo(); redoBtn.disabled = !e || !e.canRedo();
    applyBtn.disabled = !enabled() || !region || count === null || (count.count === 0 && action.value !== 'crop');
    toSel.disabled = action.value !== 'class';
    log.replaceChildren();
    if (e) for (const r of e.list()) log.append(el('li', {}, el('span', {}, r.label + (r.summary ? ' · ' + summaryText(r.summary) : ''))));
  }
  const summaryText = (s) => (typeof s === 'object' ? Object.entries(s).filter(([, v]) => typeof v === 'number').map(([k, v]) => k + ' ' + fmtN(v)).join(', ') : String(s));

  async function pick(shape) {
    ctx.status(t('pc.clean.draw.' + shape));
    const ring = await drawRing(ctx, shape, { message: t('pc.clean.draw.' + shape) });
    if (!ring || ring.length < 3) { ctx.status(''); return; }
    const z0 = zmin.value === '' ? undefined : Number(zmin.value), z1 = zmax.value === '' ? undefined : Number(zmax.value);
    await setRegion({ type: 'polygon', ring, ...(z0 !== undefined ? { zmin: z0 } : {}), ...(z1 !== undefined ? { zmax: z1 } : {}) });
  }
  async function setRegion(r) {
    region = r; count = null; ctx.cleanRegion = r;
    countBox.textContent = t('pc.clean.counting');
    try {
      count = await ctx.cloud.preview(r);
      if (fromSel.value !== '') { const n = count.byClass[fromSel.value] || 0; count = { count: n, byClass: n ? { [fromSel.value]: n } : {} }; }
      const byClass = Object.entries(count.byClass).map(([c, n]) => c + ': ' + fmtN(n)).join(', ');
      countBox.textContent = t('pc.clean.count', { n: fmtN(count.count), total: fmtN(ctx.cloud.count) }) + (byClass ? ' (' + byClass + ')' : '');
    } catch (e) { countBox.textContent = ctx.err(e); }
    sync();
  }
  [zmin, zmax].forEach((c) => c.addEventListener('change', () => {
    if (!region || region.type !== 'polygon') return;
    const r = { ...region }; delete r.zmin; delete r.zmax;
    if (zmin.value !== '') r.zmin = Number(zmin.value);
    if (zmax.value !== '') r.zmax = Number(zmax.value);
    setRegion(r);
  }));
  fromSel.addEventListener('change', () => region && setRegion(region));

  applyBtn.addEventListener('click', async () => {
    if (!region) return;
    const op = action.value === 'crop' ? 'delete' : action.value;
    const from = fromSel.value === '' ? null : [Number(fromSel.value)];
    const crop = action.value === 'crop';
    const changed = crop ? ctx.cloud.count - (count ? count.count : 0) : count.count;
    const go = async () => {
      const label = t('pc.label.' + action.value, { n: fmtN(changed) });
      ctx.cloud.edits.add({ op, region, from, to: op === 'class' ? Number(toSel.value) : null, params: crop ? { invert: true } : null, label });
      await ctx.cloud.edits.saved();
      region = null; count = null; countBox.textContent = t('pc.clean.applied', { label });
      ctx.status(label);
      ctx.emit('edited');
      sync();
    };
    if (changed > ctx.cloud.count * 0.5) {
      dialog({ title: t('pc.big.title'), body: el('p', {}, t('pc.big.body', { n: fmtN(changed), pct: Math.round((100 * changed) / ctx.cloud.count) })), buttons: [
        { label: t('pc.cancel'), onClick: (close) => close() },
        { label: t('pc.apply'), kind: 'plot', attr: 'data-pc-big-yes', onClick: (close) => { close(); go(); } }] });
    } else go();
  });
  const step = async (dir) => {
    const e = ctx.cloud && ctx.cloud.edits;
    if (!e) return;
    const r = dir < 0 ? e.undo() : e.redo();
    if (!r) return;
    await e.saved();
    ctx.status(t(dir < 0 ? 'pc.undone' : 'pc.redone', { label: r.label }));
    ctx.emit('edited');
    sync();
  };
  undoBtn.addEventListener('click', () => step(-1));
  redoBtn.addEventListener('click', () => step(1));

  // ---- the noise filter
  const noiseBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-noise': '', onclick: noiseDialog }, t('pc.noise.open'));
  function noiseDialog() {
    const mode = select([['isolated', t('pc.noise.isolated')], ['statistical', t('pc.noise.statistical')], ['both', t('pc.noise.both')]], 'isolated', { 'data-pc-noise-mode': '' });
    const radius = numInput(2, { min: 0.1, step: 0.1, 'data-pc-noise-radius': '' }), minN = numInput(6, { min: 1, step: 1, 'data-pc-noise-min': '' });
    const kIn = numInput(8, { min: 2, step: 1 }), sd = numInput(3, { min: 0.5, step: 0.5 });
    const remove = el('input', { type: 'checkbox', 'data-pc-noise-remove': '' });
    const res = el('div', { className: 'pc-note', 'data-pc-noise-result': '', role: 'status' });
    let ctl = null;
    const prog = progressRow(t('pc.cancel'), () => ctl && ctl.abort());
    const body = el('div', {}, el('p', { className: 'pc-note' }, t('pc.noise.what')), field(t('pc.noise.mode'), mode),
      field(t('pc.noise.radius'), radius, t('pc.noise.radius.hint')), field(t('pc.noise.min'), minN, t('pc.noise.min.hint')),
      field(t('pc.noise.k'), kIn, t('pc.noise.k.hint')), field(t('pc.noise.sd'), sd, t('pc.noise.sd.hint')),
      el('label', { className: 'cv-check' }, remove, t('pc.noise.remove')), prog.row, res);
    const d = dialog({ title: t('pc.noise.title'), body, buttons: [
      { label: t('pc.close'), onClick: (close) => { if (ctl) ctl.abort(); close(); } },
      { label: t('pc.noise.run'), kind: 'plot', attr: 'data-pc-noise-run', onClick: async () => {
        ctl = new AbortController(); res.textContent = '';
        try {
          const r = await ctx.PC.runOutliers(ctx.cloud, { mode: mode.value, radius: Number(radius.value), minNeighbours: Number(minN.value), k: Number(kIn.value), stdMul: Number(sd.value), remove: remove.checked },
            { signal: ctl.signal, progress: (f) => prog.set(f, Math.round(f * 100) + ' %') });
          await ctx.cloud.edits.saved();
          prog.hide();
          res.textContent = t('pc.noise.done', { n: fmtN(r.marked), low: fmtN(r.low || 0), high: fmtN(r.high || 0), ms: Math.round(r.ms || 0) });
          ctx.emit('edited'); sync();
        } catch (e) { prog.hide(); res.textContent = ctx.isAbort(e) ? t('pc.stopped') : ctx.err(e); }
        ctl = null;
      } }] });
    void d;
  }

  const saveLog = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-savelog': '', onclick: () => {
    if (ctx.cloud) download((ctx.cloud.meta.name || 'cloud') + '-edits.json', JSON.stringify(ctx.cloud.edits.exportJson(), null, 2), 'application/json');
  } }, t('pc.log.save'));
  ctx.on('cloud', () => { region = null; count = null; countBox.textContent = ''; sync(); noiseBtn.disabled = !enabled(); saveLog.disabled = !enabled(); });
  ctx.on('edited', sync);
  action.addEventListener('change', sync);

  return el('details', { open: true, 'data-pc-sec': 'clean' }, el('summary', {}, t('pc.sec.clean')), hint, tools,
    field(t('pc.clean.zmin'), zmin), field(t('pc.clean.zmax'), zmax), field(t('pc.clean.from'), fromSel), countBox,
    field(t('pc.clean.action'), action), field(t('pc.clean.to'), toSel),
    el('div', { className: 'pc-row' }, applyBtn, undoBtn, redoBtn), el('div', { className: 'pc-row' }, noiseBtn, saveLog),
    el('div', { className: 'pc-note' }, t('pc.log.title')), log);
}
