/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — marks and shape codes are data; the app words the roles */
/**
 * schedule.js — bar marks and the bending schedule over a whole structure (cc-rc, 0.9 RC.1). No DOM.
 *
 *   rcSchedule(items, { bars, roleLabel }) → { rows, byElement: Map(id → [{ group, mark }]) }
 *     items = [{ el: { id, kind }, groups }]  (elements.js), plus loose bars as { el: { id, kind: 'loose' }, groups } (loose.js)
 *     row = { mark, bar, shape, dims, count, length, mass, roles: [text], elements: [id], totalLength, unitWeight, totalWeight }
 *   The row has the shape of rebar.js bendingSchedule's rows, so the app's schedule table, CSV, report and totals read both.
 *
 * Marks: identical bars (size, shape, schedule dimensions and cut length to the millimetre) of the same kind of element share one
 * mark, numbered per size in the order the model lists them: <size><K><n> with K = B beam, C column, S slab, W wall (footings
 * keep rebar.js's F). Loose bars read from a file keep the file's mark when it has one (and no other bar of a different shape
 * already took it), else get X.
 */

export const KIND_LETTER = { beam: 'B', column: 'C', slab: 'S', wall: 'W', loose: 'X' };

export function rcSchedule(items, { bars, roleLabel = (el, g) => g.role, barOf = (name) => bars.get(name) } = {}) {
  const byKey = new Map(), rows = [], byElement = new Map(), counters = new Map(), taken = new Map();
  for (const { el, groups } of items) {
    const list = [];
    for (const g of groups) {
      const b = barOf(g.bar);
      if (!b) continue;
      const dimKey = Object.keys(g.dims).sort().map((k) => k + Math.round(g.dims[k])).join(',');
      const K = KIND_LETTER[el.kind] || 'X';
      const fileMark = el.kind === 'loose' && g.mark ? String(g.mark) : '';
      const key = [fileMark || K, g.bar, g.shape, dimKey, Math.round(g.length)].join('|');
      let row = byKey.get(key);
      if (!row) {
        let mark = fileMark && !taken.has(fileMark) ? fileMark : '';
        if (!mark) {
          const pre = b.markPre + K;
          let n = (counters.get(pre) || 0) + 1;
          while (taken.has(pre + n)) n++;
          counters.set(pre, n);
          mark = pre + n;
        }
        taken.set(mark, key);
        row = { mark, bar: g.bar, shape: g.shape, dims: { ...g.dims }, count: 0, length: g.length, mass: b.mass, roles: new Set(), elements: new Set() };
        byKey.set(key, row);
        rows.push(row);
      }
      row.count += g.count;
      row.roles.add(roleLabel(el, g));
      row.elements.add(el.id);
      list.push({ group: g, mark: row.mark });
    }
    byElement.set(el.id, list);
  }
  for (const r of rows) {
    r.totalLength = r.length * r.count;
    r.unitWeight = r.mass * r.length / 1000;
    r.totalWeight = r.unitWeight * r.count;
    r.roles = [...r.roles];
    r.elements = [...r.elements];
  }
  return { rows, byElement };
}
