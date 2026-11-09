/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tool-panels.js — Hardscape, Areas and Levels get their own section in the Landscape panel, as Plants, Grading checks and Irrigation have
 * (owner 2026-11-05: "do these NOT have panels? it feels weird that they don't"). Each section: what it is, the tools as buttons (they run
 * the same commands as the ribbon menu), and the things already drawn, each a button that selects it on the plan (its settings then show
 * in Properties). Plain DOM; the numbers come from the lists the modules already keep.
 *   createToolPanels(ctx, { LS }) → { sections: [el…], render(), ids }
 */
import { t } from '../i18n.js';
import { AREA_KINDS } from './planted.js';

const HARD_KINDS = ['paving', 'path', 'wall', 'kerb', 'ramp', 'steps'];

export function createToolPanels(ctx, { LS }) {
  const { el } = ctx;
  const defs = [
    { id: 'hard', cls: 'cv-ls-hard', head: 'ls.h.menu', lede: 'ls.tp.hard.lede', empty: 'ls.tp.hard.empty',
      tools: HARD_KINDS.map((k) => ['ls-' + k, t('ls.h.k.' + k), t('ls.h.k.' + k + '.title')]),
      items: () => (LS().hardscape || []).map((h) => ({ id: h.id, name: h.name, what: t('ls.h.k.' + h.kind), sel: { kind: 'ls-hard', id: h.id } })) },
    { id: 'areas', cls: 'cv-ls-areas', head: 'ls.a.menu', lede: 'ls.tp.areas.lede', empty: 'ls.tp.areas.empty',
      tools: AREA_KINDS.map((k) => ['ls-pa-' + k, t('ls.a.k.' + k), t('ls.a.k.' + k + '.title')]),
      items: () => (LS().areas || []).map((a) => ({ id: a.id, name: a.name, what: t('ls.a.k.' + a.kind), sel: { kind: 'ls-pa', id: a.id } })) },
    { id: 'levels', cls: 'cv-ls-levels', head: 'ls.lv.menu', lede: 'ls.tp.levels.lede', empty: '',
      tools: [['ls-spotlevel', t('ls.lv.spot'), t('ls.lv.spot.title')], ['ls-gradearrow', t('ls.lv.grade'), t('ls.lv.grade.title')], ['ls-stack', t('ls.st.open'), t('ls.st.open.title')]],
      items: () => [] },
  ];
  const sections = defs.map((d) => {
    const s = el('section', { className: 'cv-sec ' + d.cls, dataset: { lsPanel: d.id, afId: d.id }, hidden: true, 'aria-labelledby': 'cv-lsp-' + d.id + '-h' });
    return s;
  });
  const sigs = {};

  function render() {
    defs.forEach((d, i) => {
      const items = d.items(), sig = JSON.stringify(items.map((x) => [x.id, x.name, x.what]));
      if (sigs[d.id] === sig && sections[i].firstChild) return;
      sigs[d.id] = sig;
      const tools = el('div', { className: 'cv-actions' }, ...d.tools.map(([cmd, label, title]) =>
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', title, dataset: { cmd }, onclick: () => ctx.command(cmd) }, label)));
      const list = items.length
        ? el('ul', { className: 'cv-ls-list cv-ls-drawn', 'aria-label': t(d.head) }, ...items.map((x) => el('li', {},
          el('button', { type: 'button', className: 'cv-ls-pick', onclick: () => ctx.select(x.sel) }, el('span', {}, x.name), el('small', {}, x.what)))))
        : (d.empty ? el('p', { className: 'cv-note' }, t(d.empty)) : '');
      sections[i].replaceChildren(el('h2', { className: 'cv-h', id: 'cv-lsp-' + d.id + '-h' }, t(d.head) + (items.length ? ' (' + items.length + ')' : '')),
        el('p', { className: 'cv-note' }, t(d.lede)), tools, list);
    });
  }
  return { sections, render, ids: defs.map((d) => d.id) };
}
