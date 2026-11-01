/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scans-ui.js — cc-scanstart's Scans list: every sheet that came in by Scan is a workflow item of the project, shown where it was
 * placed with what has happened to it, until the drafter decides. Host-neutral; the host owns the data and the steps.
 *
 *   A scan goes  Placed (a picture under the plan) → Converted (its drawing is made: a line layer) → the drafter's call:
 *   Keep it (a reference under the plan; the project file carries it) or Remove it (the drawing stays, the picture goes).
 *   "Remove both" takes the drawing too. Each step is one undo step in the host.
 *
 *   renderScans(host, panel, items, act)
 *     items = [{ id, name, state: 'new' | 'drawn' | 'kept', visible, lines (features of its drawing, 0 = none), source, placed, when, page, pages }]
 *     act   = { show(id, on), zoom(id), convert(id), keep(id), remove(id, { drawing }) }   (the host's own steps)
 *   panel is hidden while there is no scan. Words: `scanin.list.*`.
 */
export function renderScans(host, panel, items, act) {
  const { el, t } = host;
  panel.hidden = !items.length;
  const list = panel.querySelector('[data-scans-list]') || panel;
  const need = items.filter((s) => s.state === 'drawn').length;
  const head = panel.querySelector('[data-scans-need]');
  if (head) head.textContent = need ? t('scanin.list.need', { n: need }) : '';
  list.replaceChildren(...items.map((s) => {
    const btn = (key, fn, extra = {}) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: fn, ...extra }, t(key));
    const show = el('input', { type: 'checkbox', checked: s.visible !== false, 'aria-label': t('scanin.list.show', { name: s.name }), 'data-scan-show': s.id });
    show.onchange = () => act.show(s.id, show.checked);
    const meta = [t('scanin.list.src.' + (s.source || 'file')), s.pages > 1 ? t('scanin.list.page', { page: s.page, pages: s.pages }) : '', s.placed ? t('scanin.how.' + s.placed) : '', s.when || ''].filter(Boolean).join(' · ');   // i18n-ignore: a separator
    const status = s.state === 'kept' ? t(s.lines ? 'scanin.list.kept.drawn' : 'scanin.list.kept', { n: s.lines })
      : s.lines ? t('scanin.list.drawn', { n: s.lines }) : t('scanin.list.new');
    const acts = [];
    if (s.state !== 'kept' && s.lines) acts.push(btn('scanin.list.keep', () => act.keep(s.id), { 'data-scan-keep': s.id }), btn('scanin.list.remove.scan', () => act.remove(s.id, { drawing: false }), { 'data-scan-remove': s.id }));
    if (!s.lines) acts.push(btn('scanin.list.convert', () => act.convert(s.id), { 'data-scan-convert': s.id }));
    if (s.state !== 'kept' && !s.lines) acts.push(btn('scanin.list.keep', () => act.keep(s.id), { 'data-scan-keep': s.id }), btn('scanin.list.remove', () => act.remove(s.id, { drawing: false }), { 'data-scan-remove': s.id }));
    if (s.state === 'kept') acts.push(btn(s.lines ? 'scanin.list.remove.scan' : 'scanin.list.remove', () => act.remove(s.id, { drawing: false }), { 'data-scan-remove': s.id }));
    if (s.lines) acts.push(btn('scanin.list.again', () => act.convert(s.id), { 'data-scan-convert': s.id }), btn('scanin.list.remove.both', () => act.remove(s.id, { drawing: true }), { 'data-scan-remove-both': s.id, className: 'btn-line btn-sm-cc cv-danger' }));
    acts.push(btn('scanin.list.zoom', () => act.zoom(s.id), { 'data-scan-zoom': s.id }));
    return el('li', { className: 'cv-scan', 'data-scan': s.id, 'data-scan-state': s.state },
      el('div', { className: 'cv-scan-head' }, el('label', { className: 'cv-check' }, show, ' ', el('strong', {}, s.name))),
      el('p', { className: 'cv-note' }, meta),
      el('p', { className: 'cv-scan-status', 'data-scan-status': s.id }, status),
      el('div', { className: 'cv-actions cv-scan-acts' }, ...acts));
  }));
}
