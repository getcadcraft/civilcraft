/* SPDX-License-Identifier: Apache-2.0 */
/**
 * codes-ui.js — the "Description keys and line codes" dialog (0.4 V16) and the field-coded lines on the plan.
 * Everything it changes goes through project.setCoding (one undo step); desckeys.js does the work.
 *
 *   createCodes(ctx)   ctx = { root, el, project: () => Project, say, refocus }
 *   → { open(), sceneItems() (lines that line codes make in groups that are not breaklines — breaklines draw as
 *       breaklines — on layer V-NODE-LINE), keyFor(point) → the matching key or null }
 * Dialog (dialog[data-codes-dialog]): line codes on (#cv-lc-on) and their tokens (#cv-lc-begin|end|close, comma
 * separated); a table of keys ([data-codes-rows] rows: code, group, use, description, how many points it catches,
 * remove); Add a key ([data-codes-add]); the live summary ([data-codes-summary]); Apply ([data-codes-go]).
 */

import { t } from './i18n.js';
import { cleanDescKeys, cleanLineCodes, compileKeys, keyStats, figures, USES } from './desckeys.js';

export function createCodes(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  let uid = 0;

  function open() {
    const p = P(), sf = p.state.surface;
    let rows = (sf.descKeys || []).map((k) => ({ ...k }));
    const lc = cleanLineCodes(sf.lineCodes);
    const id = 'cv-codes-' + (++uid);
    const on = el('input', { type: 'checkbox', id: 'cv-lc-on', checked: lc.on });
    const field = (key, list) => el('input', { type: 'text', className: 'cv-input', id: 'cv-lc-' + key, value: list.join(', ') });
    const begin = field('begin', lc.begin), end = field('end', lc.end), close = field('close', lc.close);
    const tbody = el('tbody', { 'data-codes-rows': '' });
    const summary = el('p', { className: 'cv-note', 'data-codes-summary': '' });
    const current = () => ({ keys: cleanDescKeys(rows), lc: cleanLineCodes({ on: on.checked, begin: begin.value, end: end.value, close: close.value }) });
    function update() {
      const { keys, lc: l } = current();
      const n = keyStats(p.points, keys);
      const ck = new Map(keys.map((k, i) => [k, n[i]]));
      [...tbody.rows].forEach((tr, i) => { const k = cleanDescKeys([rows[i]])[0]; tr.querySelector('[data-codes-n]').textContent = k ? String(ck.get(keys.find((x) => x.code === k.code)) ?? 0) : '—'; });
      const f = figures(p.points.filter((q) => q.z !== null), { keys, lineCodes: l });
      summary.textContent = t('codes.summary', { n: keys.length, keys: keys.length, lines: f.filter((x) => x.coded).length });
    }
    function render() {
      tbody.replaceChildren(...rows.map((r, i) => {
        const inp = (k, w, label) => { const x = el('input', { type: 'text', className: 'cv-input', value: r[k] || '', 'aria-label': label, style: 'width:' + w }); x.addEventListener('input', () => { rows[i][k] = x.value; update(); }); return x; };
        const use = el('select', { className: 'cv-select', 'aria-label': t('codes.col.use.of', { n: i + 1 }) }, el('option', { value: '' }, t('codes.use.keep')), ...USES.map((u) => el('option', { value: u }, t('codes.use.' + u))));
        use.value = r.use || '';
        use.addEventListener('change', () => { rows[i].use = use.value; update(); });
        return el('tr', {}, el('td', {}, inp('code', '6rem', t('codes.col.code.of', { n: i + 1 }))), el('td', {}, inp('group', '6rem', t('codes.col.group.of', { n: i + 1 }))), el('td', {}, use),
          el('td', {}, inp('label', '10rem', t('codes.col.label.of', { n: i + 1 }))), el('td', { className: 'num', 'data-codes-n': '' }),
          el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('codes.remove.of', { n: i + 1 }), onclick: () => { rows.splice(i, 1); render(); } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))));
      }));
      update();
    }
    for (const x of [on, begin, end, close]) x.addEventListener(x === on ? 'change' : 'input', update);
    const add = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-codes-add': '', onclick: () => { rows.push({ code: '', group: '', use: '', label: '' }); render(); tbody.rows[tbody.rows.length - 1]?.querySelector('input')?.focus(); } }, t('codes.add'));
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-codes-go': '' }, t('codes.apply'));
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('codes.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const row = (label, input) => [el('label', { for: input.id }, label), input];
    const dlg = el('dialog', { className: 'cv-dialog cv-codes', 'aria-labelledby': id + '-h', 'data-codes-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('codes.title')), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('h3', { className: 'cv-h3' }, t('codes.keys')),
          el('p', { className: 'cv-note' }, t('codes.keys.lede')),
          el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
            el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('codes.col.code')), el('th', { scope: 'col' }, t('codes.col.group')), el('th', { scope: 'col' }, t('codes.col.use')), el('th', { scope: 'col' }, t('codes.col.label')), el('th', { scope: 'col', className: 'num' }, t('codes.col.n')), el('th', {}, el('span', { className: 'visually-hidden' }, t('codes.col.remove'))))),
            tbody)),
          add,
          el('h3', { className: 'cv-h3' }, t('codes.lines')),
          el('label', { className: 'cv-check', for: 'cv-lc-on' }, on, ' ', t('codes.lines.on')),
          el('div', { className: 'cv-props' }, ...row(t('codes.lines.begin'), begin), ...row(t('codes.lines.end'), end), ...row(t('codes.lines.close'), close)),
          el('p', { className: 'cv-note' }, t('codes.lines.lede')),
          summary),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('codes.cancel')), go)));
    closeBtn.onclick = () => dlg.close();
    go.onclick = () => {
      const { keys, lc: l } = current();
      const dropped = rows.filter((r) => String(r.code || '').trim()).length - keys.length;
      const changed = p.setCoding(keys, l, t('codes.undo'));
      dlg.close();
      ctx.say(changed ? t('codes.done', { n: keys.length, keys: keys.length }) + (dropped > 0 ? ' ' + t('codes.dropped', { n: dropped }) : '') : t('codes.same'));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    render();
    dlg.showModal();
    (rows.length ? go : add).focus();
  }

  function sceneItems() {
    const p = P(), g = p.state.surface.groups;
    if (!p.points.length) return [];
    return p.figures().filter((f) => f.coded && g[f.group] !== 'breakline' && g[f.group] !== 'off')
      .map((f) => ({ layer: 'V-NODE-LINE', kind: 'poly', pts: f.pts.map((q) => ({ x: q.x, y: q.y, z: q.z })), closed: f.closed, z: true }));
  }
  const keyFor = (pt) => { const m = compileKeys(P().state.surface.descKeys || []); const code = String(pt?.d ?? '').trim().split(/\s+/)[0]?.toUpperCase(); return code ? m(code) : null; };
  return { open, sceneItems, keyFor };
}
