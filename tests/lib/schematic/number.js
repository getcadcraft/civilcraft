/* SPDX-License-Identifier: Apache-2.0 */
/** Wire and terminal numbering. Deterministic: the same schematic always gets the same numbers. */
import { buildNets } from './nets.js';
import { problem, splitRef } from './model.js';

/**
 * numberWires(sch, {mode, prefix, start, width})
 *   mode 'net'     every net one number (a wire number is a potential number), 1, 2, 3 … in net order
 *   mode 'sheet'   "<sheet index>.<n>", counted per sheet of the net's first pin
 * A wire that already has a `number` keeps it; two nets sharing one manual number is a problem. Nets with a label keep their label as `net`.
 * → {numbers: Map(wireId → string), nets: [{net, number}], problems}
 */
export function numberWires(sch, opts = {}) {
  const { mode = 'net', prefix = '', start = 1, width = 0 } = opts;
  const built = opts.built || buildNets(sch), problems = [], numbers = new Map(), out = [];
  const fmt = (n) => prefix + (width ? String(n).padStart(width, '0') : String(n));
  const taken = new Map();
  for (const n of built.nets) {
    const manual = new Set(n.wires.map((id) => sch.wires.find((w) => w.id === id)).filter((w) => w && w.number).map((w) => w.number));
    if (manual.size > 1) problems.push(problem('number-two-on-net', 'warning', 'Net ' + n.name + ' has the wire numbers ' + [...manual].join(', ') + '; one potential should carry one number', { net: n.id }));
    for (const m of manual) { if (taken.has(m) && taken.get(m) !== n.id) problems.push(problem('number-dup', 'error', 'Wire number ' + m + ' is on two different nets (' + taken.get(m) + ', ' + n.id + ')', { net: n.id })); taken.set(m, n.id); }
  }
  const counters = new Map(); let seq = start;
  for (const n of built.nets) {
    if (!n.wires.length) continue;
    const manual = n.wires.map((id) => sch.wires.find((w) => w.id === id).number).find(Boolean);
    let num = manual;
    if (!num) {
      do {
        if (mode === 'sheet') {
          const sh = sch.symbol(splitRef(n.pins[0]).sym).sheet, c = (counters.get(sh) || start - 1) + 1; counters.set(sh, c);
          num = sch.sheetIndex(sh) + '.' + fmt(c);
        } else num = fmt(seq++);
      } while (taken.has(num));
      taken.set(num, n.id);
    }
    for (const id of n.wires) numbers.set(id, sch.wires.find((w) => w.id === id).number || num);
    out.push({ net: n.id, name: n.name, number: num });
  }
  return { numbers, nets: out, problems };
}

/**
 * numberTerminals(sch, {strip, start}) → assigns `number` to terminals of a strip that have none, in (sheet, column, id) order, never reusing a
 * number already on the strip. Mutates the schematic. → {assigned: [{id, number}], problems}
 */
export function numberTerminals(sch, { strip, start = 1 } = {}) {
  const terms = sch.symbols.filter((s) => s.role === 'terminal' && s.strip === strip);
  const used = new Set(terms.map((t) => t.number).filter(Boolean)), problems = [], assigned = [];
  const seen = new Set();
  for (const t of terms) if (t.number) { if (seen.has(t.number)) problems.push(problem('terminal-dup', 'error', 'Strip ' + strip + ' has two terminals numbered ' + t.number, { symbol: t.id })); seen.add(t.number); }
  terms.sort((a, b) => sch.sheetIndex(a.sheet) - sch.sheetIndex(b.sheet) || a.col - b.col || (a.id < b.id ? -1 : 1));
  let n = start;
  for (const t of terms) {
    if (t.number) continue;
    while (used.has(String(n))) n++;
    t.number = String(n); used.add(t.number); assigned.push({ id: t.id, number: t.number }); n++;
  }
  return { assigned, problems };
}
