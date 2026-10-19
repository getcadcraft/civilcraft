/* SPDX-License-Identifier: Apache-2.0 */
/**
 * targets-ui.js — the corridor's Targets block in the alignment's Properties (0.6 WL.25): each target moves one point of
 * ONE side of the corridor's sections — the edge of pavement or the shoulder's outer edge, in width or in elevation — to a
 * feature line or to another corridor's line (which follows that corridor as it changes). Every change is one undo step
 * (project.change on alignment.corridor.targets, through corridor.js cleanTargets).
 *
 *   targetProps(ctx, a, item) → nodes     ctx = { el, project: () => Project, say }
 *                                         item = the corridor's graded item (its info.targets: found / of / missing / loop)
 *   targetSources(project, a) → [{ value, label, from }]   feature lines, then the other corridors' lines
 */

import { t } from './i18n.js';
import { cleanTargets, CORRIDOR_LINES, TARGET_SIDES, TARGET_WHAT, TARGET_PARTS, MAX_TARGETS } from './corridor.js';

const keyOf = (f) => (f.kind === 'feature' ? 'feature:' + f.id : 'corridor:' + f.id + ':' + f.line);

export function targetSources(P, a) {
  const out = [];
  for (const f of P.state.features || []) out.push({ value: keyOf({ kind: 'feature', id: f.id }), label: t('corr.tg.src.feature', { name: f.name }), from: { kind: 'feature', id: f.id } });
  for (const b of P.state.alignments) {
    if (b.id === a.id || !b.corridor?.on) continue;
    for (const line of CORRIDOR_LINES) out.push({ value: keyOf({ kind: 'corridor', id: b.id, line }), label: t('corr.tg.of', { name: b.name, line: t('corr.line.' + line.toLowerCase()) }), from: { kind: 'corridor', id: b.id, line } });
  }
  return out;
}

export function targetProps(ctx, a, item) {
  const { el } = ctx, P = ctx.project();
  const out = [el('h3', { className: 'cv-h3' }, t('corr.tg.head'))];
  const cur = a.corridor?.targets || [];
  const info = item?.targets || [];
  const sources = targetSources(P, a);
  /** Replace the list (one undo step); a second target for the same side, kind and point is refused. */
  const put = (label, next) => {
    const seen = new Set();
    for (const g of next) { const k = g.side + g.what + g.part; if (seen.has(k)) { ctx.say(t('corr.tg.twice')); return false; } seen.add(k); }
    P.change(label, (s) => { s.alignments.find((x) => x.id === a.id).corridor.targets = cleanTargets(next); });
    return true;
  };
  const sel = (name, value, opts, label, onChange) => {
    const s = el('select', { className: 'cv-select', 'aria-label': label, dataset: { ['tg' + name[0].toUpperCase() + name.slice(1)]: '' } }, ...opts.map(([v, l]) => el('option', { value: v }, l)));
    s.value = value;
    s.addEventListener('change', () => { if (onChange(s.value) === false) s.value = value; });
    return s;
  };
  const rows = cur.map((g, i) => {
    const n = i + 1, set = (patch) => put(t('corr.tg.undo.change', { n }), cur.map((x, k) => (k === i ? { ...x, ...patch } : x)));
    const srcOpts = sources.map((s) => [s.value, s.label]);
    const curKey = keyOf(g.from);
    if (!sources.some((s) => s.value === curKey)) srcOpts.unshift([curKey, t('corr.tg.gone')]);
    const inf = info[i];
    const state = !inf ? '' : inf.loop ? t('corr.tg.loop') : inf.missing ? t('corr.tg.missing') : t('corr.tg.found', { n: inf.found, of: inf.of });
    return el('tr', { 'data-tg-row': String(i) },
      el('td', {}, sel('side', g.side, TARGET_SIDES.map((v) => [v, t('corr.tg.side.' + v.toLowerCase())]), t('corr.tg.side.of', { n }), (v) => set({ side: v }))),
      el('td', {}, sel('part', g.part, TARGET_PARTS.map((v) => [v, t('corr.tg.part.' + v)]), t('corr.tg.part.of', { n }), (v) => set({ part: v }))),
      el('td', {}, sel('what', g.what, TARGET_WHAT.map((v) => [v, t('corr.tg.what.' + v)]), t('corr.tg.what.of', { n }), (v) => set({ what: v }))),
      el('td', {}, sel('src', curKey, srcOpts, t('corr.tg.src.of', { n }), (v) => { const s = sources.find((x) => x.value === v); return s ? set({ from: s.from }) : false; })),
      el('td', { className: 'cv-note', 'data-tg-state': '' }, state),
      el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('corr.tg.remove', { n }), 'data-tg-remove': String(i), onclick: () => put(t('corr.tg.undo.remove', { n }), cur.filter((x, k) => k !== i)) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))));
  });
  if (rows.length) {
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tg-table': '' },
      el('thead', {}, el('tr', {}, ...['side', 'part', 'what', 'src', 'state'].map((k) => el('th', { scope: 'col' }, t('corr.tg.col.' + k))), el('th', {}, el('span', { className: 'visually-hidden' }, t('corr.tg.col.remove'))))),
      el('tbody', {}, ...rows))));
  }
  // a new target: the first side / point / kind not used yet, aimed at the first line there is
  const free = [];
  for (const side of ['R', 'L']) for (const part of TARGET_PARTS) for (const what of ['elev', 'width']) if (!cur.some((g) => g.side === side && g.part === part && g.what === what)) free.push({ side, part, what });
  const add = el('button', { type: 'button', className: 'cv-linkbtn', 'data-tg-add': '', disabled: !sources.length || !free.length || cur.length >= MAX_TARGETS, onclick: () => {
    if (put(t('corr.tg.undo.add'), [...cur, { ...free[0], from: sources[0].from }])) ctx.say(t('corr.tg.added'));
  } }, t('corr.tg.add'));
  out.push(add);
  out.push(el('p', { className: 'cv-note' }, sources.length ? t('corr.tg.note') : t('corr.tg.none')));
  return out;
}
