/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sdf.js — SDF (Standard Delay Format, IEEE 1497) reader and writer for back-annotation: header, cells, ABSOLUTE / INCREMENT delays
 * (IOPATH, INTERCONNECT, PORT, DEVICE, COND IOPATH) and timing checks (SETUP, HOLD, SETUPHOLD, RECOVERY, REMOVAL, WIDTH, PERIOD, SKEW).
 * Written from the public description of the format. Constructs this model does not know are kept as raw lists and written back.
 *
 *   readSdf(text)  → { sdf: { header, cells: [{ type, instance, delays, checks, extra }] }, problems }
 *       delay = { mode: 'ABSOLUTE'|'INCREMENT', kind, from, to, cond?, values: [triple] }   triple = [] | [v] | [min, typ, max] (null = left out)
 *       port  = 'A' | { edge: 'posedge'|'negedge', port }
 *   writeSdf(sdf)  → text
 *   sdfDelays(sdf, 'typ'|'min'|'max') → [{ instance, kind, from, to, rise, fall }]   (what a gate-level run annotates)
 */
import { prob } from './problem.js';

function sexpr(text, problems) {
  const s = String(text), n = s.length; let i = 0, line = 1; const root = [], stack = [root];
  while (i < n) {
    const c = s[i];
    if (c === '\n') { line++; i++; continue; }
    if (c <= ' ') { i++; continue; }
    if (c === '/' && s[i + 1] === '/') { while (i < n && s[i] !== '\n') i++; continue; }
    if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); for (let k = i; k < (e < 0 ? n : e); k++) if (s[k] === '\n') line++; i = e < 0 ? n : e + 2; continue; }
    if (c === '(') { const l = []; l.line = line; stack[stack.length - 1].push(l); stack.push(l); i++; continue; }
    if (c === ')') { if (stack.length === 1) problems.push(prob('sdf.paren', 'An extra ")".', { line })); else stack.pop(); i++; continue; }
    if (c === '"') { const e = s.indexOf('"', i + 1); stack[stack.length - 1].push({ str: s.slice(i + 1, e < 0 ? n : e) }); i = e < 0 ? n : e + 1; continue; }
    let j = i; while (j < n && s[j] > ' ' && s[j] !== '(' && s[j] !== ')' && s[j] !== '"') { if (s[j] === '\\') j++; j++; }
    stack[stack.length - 1].push(s.slice(i, j)); i = j;
  }
  if (stack.length > 1) problems.push(prob('sdf.unclosed', 'The file ends with ' + (stack.length - 1) + ' "(" not closed.'));
  return root;
}
const head = (l) => (Array.isArray(l) && typeof l[0] === 'string' ? l[0].toUpperCase() : null);
const str = (x) => (x && typeof x === 'object' && 'str' in x ? x.str : x);
function triple(l) { // ( ) | (v) | (a:b:c) | (a::c)
  if (!Array.isArray(l)) return null;
  if (!l.length) return [];
  const t = String(l[0]); if (!t.includes(':')) return [Number(t)];
  return t.split(':').map((x) => (x === '' ? null : Number(x)));
}
function port(x) { if (Array.isArray(x) && /^(posedge|negedge)$/i.test(x[0])) return { edge: x[0].toLowerCase(), port: x[1] }; return str(x); }
const CHECKS = new Set(['SETUP', 'HOLD', 'SETUPHOLD', 'RECOVERY', 'REMOVAL', 'RECREM', 'SKEW', 'WIDTH', 'PERIOD', 'NOCHANGE']);

export function readSdf(text) {
  const problems = [], root = sexpr(text, problems), top = root.find((l) => head(l) === 'DELAYFILE');
  const sdf = { header: {}, cells: [] };
  if (!top) { problems.push(prob('sdf.no-delayfile', 'No (DELAYFILE …) found: this may not be an SDF file.')); return { sdf, problems }; }
  for (const it of top.slice(1)) {
    const h = head(it); if (!h) continue;
    if (h !== 'CELL') { sdf.header[h] = it.slice(1).map((x) => (Array.isArray(x) ? x : str(x))).map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); continue; }
    const cell = { type: undefined, instance: undefined, delays: [], checks: [], extra: [] };
    for (const c of it.slice(1)) {
      const k = head(c);
      if (k === 'CELLTYPE') cell.type = str(c[1]);
      else if (k === 'INSTANCE') cell.instance = c[1] === undefined ? '' : str(c[1]);
      else if (k === 'DELAY') for (const m of c.slice(1)) {
        const mode = head(m); if (mode !== 'ABSOLUTE' && mode !== 'INCREMENT') { cell.extra.push(c); continue; }
        for (const d of m.slice(1)) {
          let kind = head(d), cond, x = d;
          if (kind === 'COND') { cond = Array.isArray(d[1]) ? raw(d[1]) : str(d[1]); x = d[2]; kind = head(x); }
          if (kind === 'IOPATH') cell.delays.push({ mode, kind, from: port(x[1]), to: port(x[2]), cond, values: x.slice(3).filter(Array.isArray).map(triple) });
          else if (kind === 'INTERCONNECT') cell.delays.push({ mode, kind, from: str(x[1]), to: str(x[2]), values: x.slice(3).map(triple) });
          else if (kind === 'PORT') cell.delays.push({ mode, kind, from: null, to: str(x[1]), values: x.slice(2).map(triple) });
          else if (kind === 'DEVICE') cell.delays.push({ mode, kind, from: null, to: Array.isArray(x[1]) ? null : str(x[1]), values: x.slice(Array.isArray(x[1]) ? 1 : 2).map(triple) });
          else { cell.extra.push(['DELAY', [mode, d]]); problems.push(prob('sdf.kept', 'A ' + kind + ' delay is kept as written (not modelled).', { severity: 'note', line: d.line })); }
          const last = cell.delays[cell.delays.length - 1]; if (last && last.cond === undefined) delete last.cond;
        }
      } else if (k === 'TIMINGCHECK') for (const t of c.slice(1)) {
        const kk = head(t); if (!CHECKS.has(kk)) { cell.extra.push(['TIMINGCHECK', t]); continue; }
        const two = !(kk === 'WIDTH' || kk === 'PERIOD'); cell.checks.push({ kind: kk, data: port(t[1]), ref: two ? port(t[2]) : undefined, values: t.slice(two ? 3 : 2).map(triple) });
        const last = cell.checks[cell.checks.length - 1]; if (last.ref === undefined) delete last.ref;
      } else cell.extra.push(c);
    }
    if (!cell.extra.length) delete cell.extra;
    if (cell.type === undefined) problems.push(prob('sdf.celltype', 'A CELL has no CELLTYPE.', { line: it.line, severity: 'warning' }));
    sdf.cells.push(cell);
  }
  return { sdf, problems };
}

// ---------------------------------------------------------------- writer
const tri = (t) => '(' + (t.length === 1 ? t[0] : t.map((v) => (v === null ? '' : v)).join(':')) + ')';
const pw = (p) => (p && typeof p === 'object' ? '(' + p.edge + ' ' + p.port + ')' : p);
const raw = (x) => (Array.isArray(x) ? '(' + x.map(raw).join(' ') + ')' : x && typeof x === 'object' ? '"' + x.str + '"' : String(x));
const QUOTED = new Set(['SDFVERSION', 'DESIGN', 'DATE', 'VENDOR', 'PROGRAM', 'VERSION', 'PROCESS']);
export function writeSdf(sdf) {
  const L = ['(DELAYFILE'];
  for (const [k, v] of Object.entries(sdf.header)) L.push('  (' + k + ' ' + (QUOTED.has(k) ? '"' + v + '"' : v) + ')');
  for (const c of sdf.cells) {
    L.push('  (CELL'); L.push('    (CELLTYPE "' + (c.type ?? '') + '")'); L.push('    (INSTANCE' + (c.instance ? ' ' + c.instance : '') + ')');
    for (const mode of ['ABSOLUTE', 'INCREMENT']) {
      const ds = c.delays.filter((d) => d.mode === mode); if (!ds.length) continue;
      L.push('    (DELAY'); L.push('      (' + mode);
      for (const d of ds) {
        let s = d.kind === 'IOPATH' ? '(IOPATH ' + pw(d.from) + ' ' + pw(d.to) : d.kind === 'INTERCONNECT' ? '(INTERCONNECT ' + d.from + ' ' + d.to : d.kind === 'PORT' ? '(PORT ' + d.to : '(DEVICE' + (d.to ? ' ' + d.to : '');
        s += ' ' + d.values.map(tri).join(' ') + ')'; if (d.cond !== undefined) s = '(COND ' + d.cond + ' ' + s + ')';
        L.push('        ' + s);
      }
      L.push('      )'); L.push('    )');
    }
    if (c.checks.length) { L.push('    (TIMINGCHECK'); for (const t of c.checks) L.push('      (' + t.kind + ' ' + pw(t.data) + (t.ref !== undefined ? ' ' + pw(t.ref) : '') + ' ' + t.values.map(tri).join(' ') + ')'); L.push('    )'); }
    for (const e of c.extra || []) L.push('    ' + (e[0] === 'DELAY' || e[0] === 'TIMINGCHECK' ? '(' + e[0] + ' ' + raw(e[1]) + ')' : raw(e)));
    L.push('  )');
  }
  L.push(')'); return L.join('\n') + '\n';
}

/** Flat list of delays to annotate: rise = first value, fall = second (or the first again), at the chosen corner. */
export function sdfDelays(sdf, corner = 'typ') {
  const ix = corner === 'min' ? 0 : corner === 'max' ? 2 : 1;
  const pick = (t) => (!t || !t.length ? null : t.length === 1 ? t[0] : t[ix] ?? t.find((v) => v !== null) ?? null);
  const out = [];
  for (const c of sdf.cells) for (const d of c.delays) { const r = pick(d.values[0]), f = d.values.length > 1 ? pick(d.values[1]) : r; out.push({ instance: c.instance, cell: c.type, kind: d.kind, mode: d.mode, from: typeof d.from === 'object' && d.from ? d.from.port : d.from, edge: typeof d.from === 'object' && d.from ? d.from.edge : undefined, to: d.to, cond: d.cond, rise: r, fall: f }); }
  return out;
}

/** Build an SDF from arcs already worked out (for example with liberty.js lookup at a slew and load): cells = [{ type, instance, arcs: [{ from, to, rise, fall }] }]. */
export function sdfFromArcs({ design, timescale = '1ns', cells }) {
  return { header: { SDFVERSION: '3.0', DESIGN: design || '', PROGRAM: 'CadCraft Chip design', DIVIDER: '/', TIMESCALE: timescale }, cells: cells.map((c) => ({ type: c.type, instance: c.instance, delays: c.arcs.map((a) => ({ mode: 'ABSOLUTE', kind: 'IOPATH', from: a.from, to: a.to, values: [[a.rise, a.rise, a.rise], [a.fall, a.fall, a.fall]] })), checks: [] })) };
}
