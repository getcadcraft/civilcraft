/* SPDX-License-Identifier: Apache-2.0 */
/**
 * engines.js — the DOM-free core of the shell's Engines panel (0.8 XE.1, 2, 4–13; rule 39: built for every host, SuperCad Studio included).
 * One registry of the twelve shared engines (lib/<name>/, copied byte for byte into ./engines/<name>/ by tools/engines/sync.mjs) and ONE way to
 * run each: its descriptor (./engines/ui/<id>.js) says what to import, gives worked examples and turns a pasted model into plain tables.
 *
 *   ENGINES                 [{ id, rows: ['XE.n'], name, summary, kind, input }]   the registry (names are plain English; the panel prefers shell.engines.<id>.* words)
 *   createEngines({ load }) → { list(), descriptor(id), run(id, text) → Promise<result>, example(id, exampleId?) }
 *        load(id) → Promise<module>   default: import('./engines/ui/<id>.js')   (Node tests give their own)
 *   result = { ok, id, ms, tables: [{ title, head: [..], rows: [[..]] }], problems: [{ code, severity, text }], notes: [text] }
 *   Descriptor (default export of ui/<id>.js): { examples: [{ id, name, text }], inputLabel, load: () => import(engine), run(lib, text) → { tables, problems?, notes? } }
 *   A descriptor that throws is a problem in the result (error), never an exception in the page. Everything is bounded: LIMITS.
 */
export const ENGINES = [
  { id: 'schematic', rows: ['XE.1'], name: 'Schematics and connectivity', kind: 'JSON', summary: 'Symbols, pins, nets, wire and terminal numbers, cross-references, plans, bill of materials and twelve rule checks.' },
  { id: 'network', rows: ['XE.2'], name: 'Pipe networks and power systems', kind: 'JSON', summary: 'Pipe network flows and pressures, power load flow, short circuit, protection curves.' },
  { id: 'motion', rows: ['XE.4', 'XE.4b'], name: 'Motion and robots', kind: 'JSON', summary: 'Robot chains, forward and inverse kinematics, joint torques, trajectories, URDF in and out; closed planar loops (four-bar, slider-crank, parallel robots) with Grashof class and velocity ratios.' },
  { id: 'des', rows: ['XE.5'], name: 'Queues and flow simulation', kind: 'JSON', summary: 'Discrete-event simulation of queues, servers, conveyors and shifts, with replications.' },
  { id: 'schedule', rows: ['XE.6'], name: 'Schedule and cost', kind: 'JSON', summary: 'Critical path with lags and calendars, resources, cost curve and earned value.' },
  { id: 'trace', rows: ['XE.7'], name: 'Requirements and traceability', kind: 'JSON', summary: 'Requirements linked to elements and tests, coverage matrix, impact, ReqIF in and out.' },
  { id: 'risk', rows: ['XE.8'], name: 'Risk and reliability', kind: 'JSON', summary: 'Fault trees, reliability blocks, FMEA, Weibull fits, Markov models.' },
  { id: 'live', rows: ['XE.9'], name: 'Live data', kind: 'JSON', summary: 'Modbus, MQTT and BACnet message codecs and the tag store with markers (read-only).' },
  { id: 'em', rows: ['XE.10'], name: 'Circuits and fields', kind: 'text', summary: 'A circuit solver for a netlist: operating point, sweep, AC and transient.' },
  { id: 'pcb', rows: ['XE.11'], name: 'Boards', kind: 'JSON', summary: 'Place and route a board from a netlist, check the design rules, write Gerber and IPC-2581.' },
  { id: 'sys', rows: ['XE.12'], name: 'Systems (lumped models)', kind: 'text', summary: 'Acausal models across electrical, thermal, hydraulic and mechanical domains; a Modelica subset reader.' },
  { id: 'plc', rows: ['XE.13'], name: 'Controls (PLC)', kind: 'text', summary: 'IEC 61131-3 structured text: check it, scan it, watch the variables.' },
];

export const LIMITS = { tables: 12, rows: 400, cols: 16, cell: 160, problems: 200, notes: 20, text: 400000 };

const SEVS = ['error', 'warning', 'note'];
const cut = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
/** One table cell as text: numbers to six significant digits, objects as short JSON. */
export function cell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(+v.toPrecision(6)) : String(v);
  if (typeof v === 'object') { try { return cut(JSON.stringify(v), LIMITS.cell); } catch (e) { return ''; } }
  return cut(v, LIMITS.cell);
}
/** A problem from any engine ({ code, severity, text | message }) in the one shape the panel and the Problems panel take. */
export function cleanProblem(p) {
  const text = cut(p && (p.text || p.message || p.msg?.text || p.id) || '', 400);
  return { code: cut(p && (p.code || (typeof p.id === 'string' ? p.id : '')) || 'problem', 80), severity: SEVS.includes(p && p.severity) ? p.severity : 'note', text };
}
export function cleanResult(id, raw, ms = 0) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const tables = (Array.isArray(r.tables) ? r.tables : []).slice(0, LIMITS.tables).map((t) => ({
    title: cut(t && t.title, 120),
    head: (Array.isArray(t && t.head) ? t.head : []).slice(0, LIMITS.cols).map((c) => cut(c, 60)),
    rows: (Array.isArray(t && t.rows) ? t.rows : []).slice(0, LIMITS.rows).map((row) => (Array.isArray(row) ? row : [row]).slice(0, LIMITS.cols).map(cell)),
    more: Array.isArray(t && t.rows) && t.rows.length > LIMITS.rows ? t.rows.length - LIMITS.rows : 0,
  }));
  const problems = (Array.isArray(r.problems) ? r.problems : []).slice(0, LIMITS.problems).map(cleanProblem);
  const notes = (Array.isArray(r.notes) ? r.notes : []).slice(0, LIMITS.notes).map((n) => cut(n, 400));
  return { ok: !problems.some((p) => p.severity === 'error'), id, ms: Math.round(ms), tables, problems, notes };
}

export function createEngines({ load = (id) => import('./engines/ui/' + id + '.js') } = {}) {
  const cache = new Map();
  const descriptor = async (id) => {
    if (!ENGINES.some((e) => e.id === id)) throw new Error('unknown engine ' + id);
    if (!cache.has(id)) cache.set(id, Promise.resolve(load(id)).then((m) => m.default || m));
    return cache.get(id);
  };
  return {
    list: () => ENGINES.map((e) => ({ ...e })),
    descriptor,
    async example(id, exampleId) {
      const d = await descriptor(id);
      return (d.examples || []).find((x) => x.id === exampleId) || (d.examples || [])[0] || { id: '', name: '', text: '' };
    },
    async run(id, text) {
      const t0 = Date.now();
      try {
        const d = await descriptor(id);
        const input = String(text ?? '');
        if (input.length > LIMITS.text) return cleanResult(id, { problems: [{ code: 'too-big', severity: 'error', text: 'The input is larger than ' + LIMITS.text + ' characters.' }] }, 0);
        const lib = await d.load();
        return cleanResult(id, await d.run(lib, input), Date.now() - t0);
      } catch (e) {
        return cleanResult(id, { problems: [{ code: 'input', severity: 'error', text: cut(e && e.message || e, 300) }] }, Date.now() - t0);
      }
    },
  };
}
