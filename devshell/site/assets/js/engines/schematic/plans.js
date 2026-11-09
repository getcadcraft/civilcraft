/* SPDX-License-Identifier: Apache-2.0 */
/** Reports built from the model: terminal plan, cable plan, BOM, netlist; CSV with formula-looking cells quoted. */
import { buildNets } from './nets.js';
import { numberWires } from './number.js';
import { problem, splitRef } from './model.js';

export const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export const toCsv = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

/** BOM: one line per part number (symbols with no part are listed apart, never silently dropped). */
export function bom(sch) {
  const lines = new Map(), missing = [];
  for (const s of sch.symbols) {
    if (s.type === 'label' || s.type === 'junction') continue;
    if (!s.part) { missing.push(s.tag || s.id); continue; }
    const key = (s.mfr || '') + '\u0000' + s.part;
    if (!lines.has(key)) lines.set(key, { part: s.part, mfr: s.mfr || '', qty: 0, tags: [] });
    const l = lines.get(key); l.qty++; l.tags.push(s.tag || s.id);
  }
  const rows = [...lines.values()].sort((a, b) => a.part < b.part ? -1 : a.part > b.part ? 1 : 0);
  return { rows, missing, problems: missing.length ? [problem('bom-no-part', 'warning', missing.length + ' symbol(s) have no part number and are not in the BOM: ' + missing.slice(0, 8).join(', '), { tags: missing })] : [] };
}
export const bomCsv = (b) => toCsv([['Part', 'Maker', 'Qty', 'Tags'], ...b.rows.map((r) => [r.part, r.mfr, r.qty, r.tags.join(' ')])]);

/** Netlist: net, wire number, pins as "TAG:pin". */
export function netlist(sch, built = buildNets(sch)) {
  const nums = numberWires(sch, { built }), byNet = new Map(nums.nets.map((n) => [n.net, n.number]));
  return built.nets.map((n) => ({ net: n.id, name: n.name, number: byNet.get(n.id) || '', pins: n.pins.map((r) => { const p = splitRef(r); return (sch.symbol(p.sym).tag || p.sym) + ':' + p.pin; }) }));
}
export const netlistCsv = (nl) => toCsv([['Net', 'Name', 'Wire no.', 'Pins'], ...nl.map((n) => [n.net, n.name, n.number, n.pins.join(' ')])]);

/** Terminal plan: per strip, each terminal's two sides (net, wire number, cable/core of the wire that lands there). */
export function terminalPlan(sch, built = buildNets(sch)) {
  const nums = numberWires(sch, { built }).numbers, strips = new Map();
  const side = (sym, pinId) => {
    const r = sym.id + '.' + pinId, n = built.netOf.get(r);
    if (!n) return { net: '', number: '', cable: '', core: '' };
    const w = sch.wires.find((x) => x.from === r || x.to === r);
    return { net: n.name, number: w ? nums.get(w.id) || '' : '', cable: w && w.cable || '', core: w && w.core || '' };
  };
  for (const s of sch.symbols) {
    if (s.role !== 'terminal') continue;
    const k = s.strip || '(no strip)'; if (!strips.has(k)) strips.set(k, []);
    const ids = s.pins.map((p) => p.id);
    strips.get(k).push({ id: s.id, number: s.number || '', a: side(s, ids[0]), b: ids[1] ? side(s, ids[1]) : null, part: s.part || '', sheet: s.sheet, col: s.col });
  }
  const out = [];
  for (const [strip, rows] of [...strips].sort((a, b) => a[0] < b[0] ? -1 : 1)) {
    rows.sort((a, b) => (parseFloat(a.number) || 1e9) - (parseFloat(b.number) || 1e9) || (a.id < b.id ? -1 : 1));
    out.push({ strip, terminals: rows });
  }
  return out;
}
export const terminalPlanCsv = (plan) => toCsv([['Strip', 'Terminal', 'Side A net', 'Side A wire', 'Side A cable/core', 'Side B net', 'Side B wire', 'Side B cable/core'],
  ...plan.flatMap((p) => p.terminals.map((t) => [p.strip, t.number, t.a.net, t.a.number, t.a.cable ? t.a.cable + '/' + t.a.core : '', t.b ? t.b.net : '', t.b ? t.b.number : '', t.b && t.b.cable ? t.b.cable + '/' + t.b.core : '']))]);

/** Cable plan: wires grouped by `cable`; both ends named by device tag; core used twice and ends that disagree are problems. */
export function cablePlan(sch, built = buildNets(sch)) {
  const nums = numberWires(sch, { built }).numbers, cables = new Map(), problems = [];
  const end = (r) => { const p = splitRef(r), s = sch.symbol(p.sym); return (s ? s.tag || s.id : p.sym) + ':' + p.pin; };
  for (const w of sch.wires) {
    if (!w.cable) continue;
    if (!cables.has(w.cable)) cables.set(w.cable, { cable: w.cable, cores: [], length: 0 });
    const c = cables.get(w.cable);
    if (w.core && c.cores.some((x) => x.core === w.core)) problems.push(problem('core-twice', 'error', 'Cable ' + w.cable + ' core ' + w.core + ' is used by two wires', { wire: w.id, cable: w.cable }));
    c.cores.push({ core: w.core || '', color: w.color || '', from: end(w.from), to: end(w.to), net: (built.netOf.get(w.from) || {}).name || '', number: nums.get(w.id) || '', length: w.length ?? null });
    if (w.length) c.length = Math.max(c.length, w.length);
  }
  for (const c of cables.values()) c.cores.sort((a, b) => (parseFloat(a.core) || 1e9) - (parseFloat(b.core) || 1e9) || (a.core < b.core ? -1 : 1));
  return { cables: [...cables.values()].sort((a, b) => a.cable < b.cable ? -1 : 1), problems };
}
export const cablePlanCsv = (cp) => toCsv([['Cable', 'Core', 'Colour', 'From', 'To', 'Net', 'Wire no.', 'Length'], ...cp.cables.flatMap((c) => c.cores.map((k) => [c.cable, k.core, k.color, k.from, k.to, k.net, k.number, k.length ?? '']))]);
