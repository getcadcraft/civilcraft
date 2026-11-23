/* SPDX-License-Identifier: Apache-2.0 */
/**
 * synth.js — HD.5 run synthesis with the person's own Yosys (ISC): the script from the project, the command line, and the reports
 * (cells, area, ABC's delay, Yosys's `sta` arrival time) as numbers and Problems. DOM-free; imports only ./rows.js.
 * Owner 2026-11-03 (O2): no Yosys build is bundled, in the web or anywhere; the web edition reads reports, Studio runs the person's Yosys.
 *
 *   synthScript({ files, top, liberty, period (ns), flatten = true, script }) → text      (a project .ys given as `script` is used as it is)
 *   synthSteps(opts) → { steps, extra: { 'cc_synth.ys': text }, collect }
 *       yosys -l out/yosys.log -s cc_synth.ys    → out/netlist.v, out/netlist.json, out/stat.txt
 *   parseStat(text) → { modules: { name: { cells, wires, wireBits, types: {type: n}, area } }, top, cells, area }
 *       reads both the classic "Number of cells: N" layout and the column layout of newer Yosys releases
 *   parseTiming(text) → { delayPs, areaAbc, arrival, gates }  ABC "Delay = 372.80 ps", Yosys sta "Latest arrival time in 'top' is 1234"
 *   parseYosysLog(text, { period }) → rows   (ERROR / Warning lines with file:line when Yosys gives one; a delay over the period = error)
 */
import { row } from './rows.js';

const ID = /^[A-Za-z_][\w$]*$/;

const PAT = (x) => String(x).replace(/[^\w*?]/g, '');
const CELL = (x) => String(x).replace(/[^\w]/g, '');
/** Options a real PDK needs (sky130, 2026-11-21): dontUse ['*lpflow*', …] keeps cells the library has but placement should not get
 *  (dfflibmap/abc -dont_use); tie { cell, hi, lo } puts tie cells on constants (hilomap); buffer { cell, in, out } replaces the netlist's
 *  plain `assign`s with buffers (insbuf), so placement and LVS see only cells. */
export function synthScript({ files = [], top, liberty = '', period = 0, flatten = true, dontUse = [], tie = null, buffer = null } = {}) {
  if (!top || !ID.test(top)) throw new Error('synthScript: no top module');
  const src = files.filter((f) => /\.(v|sv)$/i.test(f));
  const sv = src.some((f) => /\.sv$/i.test(f)) ? ' -sv' : '';
  const L = liberty ? ' -liberty ' + liberty : '';
  const lines = [
    '# made by the Chip design add-on from the project (change the stage options, or point the stage at your own .ys)',
    ...(liberty ? ['read_liberty -lib ' + liberty] : []),   // the cells as black boxes with their pin directions (else `check` calls every flip-flop output undriven)
    ...src.map((f) => 'read_verilog' + sv + ' ' + f),
    'hierarchy -check -top ' + top,
    'synth -top ' + top + (flatten ? ' -flatten' : ''),
  ];
  if (liberty) {
    const du = (dontUse || []).map(PAT).filter(Boolean).map((p) => ' -dont_use ' + p).join('');
    lines.push('dfflibmap' + L + du, 'abc' + L + du + (period > 0 ? ' -D ' + Math.round(period * 1000) : ''), 'opt_clean');
    if (tie && tie.cell) lines.push('setundef -zero', `hilomap -singleton -hicell ${CELL(tie.cell)} ${CELL(tie.hi || 'HI')} -locell ${CELL(tie.cell)} ${CELL(tie.lo || 'LO')}`);
    if (buffer && buffer.cell) lines.push('splitnets', 'opt_clean -purge', `insbuf -buf ${CELL(buffer.cell)} ${CELL(buffer.in || 'A')} ${CELL(buffer.out || 'X')}`);
  } else if (period > 0) {
    lines.push('abc -D ' + Math.round(period * 1000));
  }
  lines.push('check', 'tee -q -o out/stat.txt stat' + L, 'write_verilog -noattr out/netlist.v', 'write_json out/netlist.json');
  return lines.join('\n') + '\n';
}

/** Timing of the mapped netlist with the person's OpenSTA (`sta`, BSD-3), when the stage has a Liberty file and an SDC. Newer Yosys runs
 *  ABC's `&nf` mapper, which prints no "Delay =" line (Yosys 0.71, 2026-11-21), so the delay comes from a real timer instead. */
export function staScript({ liberty, top, sdc, netlist = 'out/netlist.v' } = {}) {
  if (!liberty || !sdc || !top || !ID.test(top)) return '';
  return ['# made by the Chip design add-on: timing of the synthesized netlist (no wires yet: placement and routing add them)',
    'read_liberty ' + liberty, 'read_verilog ' + netlist, 'link_design ' + top, 'read_sdc ' + sdc,
    'report_checks -path_delay max -digits 3', 'report_wns -digits 3', 'report_tns -digits 3', 'report_worst_slack -max -digits 3', 'exit', ''].join('\n');
}

export function synthSteps(opts = {}) {
  const extra = {};
  let script = opts.script;
  if (!script) { script = 'cc_synth.ys'; extra[script] = synthScript(opts); }
  const steps = [{ tool: 'yosys', label: 'yosys', args: ['-l', 'out/yosys.log', '-s', script] }];
  const sta = opts.script ? '' : staScript(opts);
  if (sta) { extra['cc_sta.tcl'] = sta; steps.push({ tool: 'sta', label: 'sta', args: ['-no_splash', '-exit', 'cc_sta.tcl'], stdout: 'out/sta.log', optional: true }); }
  return { steps, extra, collect: ['out/'] };
}

/** OpenSTA's report_wns / report_tns / report_worst_slack (also inside OpenROAD's log): the last value of each. */
export function parseSlack(text) {
  const s = String(text);
  const last = (re) => { let r = null, x; const g = new RegExp(re.source, 'gim'); while ((x = g.exec(s))) r = Number(x[1]); return r; };
  return { wns: last(/^\s*wns\s+(?:max\s+)?(-?[\d.]+)/), tns: last(/^\s*tns\s+(?:max\s+)?(-?[\d.]+)/), worst: last(/^\s*worst slack\s+(?:max\s+)?(-?[\d.]+)/) };
}

export function parseStat(text) {
  const out = { modules: {}, top: '', cells: 0, area: null };
  let cur = null, inCells = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const l = raw.replace(/\s+$/, '');
    let m;
    if ((m = /^===\s*(\S+)\s*===$/.exec(l.trim()))) { cur = out.modules[m[1].replace(/^\\/, '')] = { cells: 0, wires: 0, wireBits: 0, types: {}, area: null }; inCells = false; continue; }
    if ((m = /^=== design hierarchy ===$/.exec(l.trim()))) { cur = null; inCells = false; continue; }
    if ((m = /Chip area for (?:top )?module '\\?([^']+)':\s*([\d.eE+-]+)/.exec(l))) { const a = Number(m[2]); if (out.modules[m[1]]) out.modules[m[1]].area = a; if (/top module/.test(l) || out.area === null) out.area = a; continue; }
    if (!cur) continue;
    if ((m = /^\s+Number of wires:\s+(\d+)/.exec(l))) { cur.wires = Number(m[1]); continue; }
    if ((m = /^\s+Number of wire bits:\s+(\d+)/.exec(l))) { cur.wireBits = Number(m[1]); continue; }
    if ((m = /^\s+Number of cells:\s+(\d+)/.exec(l))) { cur.cells = Number(m[1]); inCells = true; continue; }
    if ((m = /^\s+(\d+)\s+(?:[\d.]+(?:[eE][+-]?\d+)?\s+|-\s+)?cells$/.exec(l))) { cur.cells = Number(m[1]); inCells = true; continue; }   // newer layout
    if ((m = /^\s+(\d+)\s+(?:[\d.]+(?:[eE][+-]?\d+)?\s+|-\s+)?wires$/.exec(l))) { cur.wires = Number(m[1]); continue; }
    if ((m = /^\s+(\d+)\s+(?:[\d.]+(?:[eE][+-]?\d+)?\s+|-\s+)?wire bits$/.exec(l))) { cur.wireBits = Number(m[1]); continue; }
    if (inCells && (m = /^\s{4,}(\$?[\w$\\.]+)\s+(\d+)$/.exec(l))) { cur.types[m[1].replace(/^\\/, '')] = Number(m[2]); continue; }   // classic: "     $_AND_   3"
    if (inCells && (m = /^\s{4,}(\d+)\s+(?:[\d.]+(?:[eE][+-]?\d+)?\s+)?(\$?[\w$\\.]+)$/.exec(l))) { cur.types[m[2].replace(/^\\/, '')] = Number(m[1]); continue; }   // newer: "   3   1.2E+01   $_AND_"
    if (/^\s*$/.test(l)) continue;
    if (inCells && !/^\s{4,}/.test(l)) inCells = false;
  }
  const names = Object.keys(out.modules);
  out.top = names[names.length - 1] || '';
  out.cells = out.top ? out.modules[out.top].cells : 0;
  if (out.area === null && out.top) out.area = out.modules[out.top].area;
  return out;
}

export function parseTiming(text) {
  const s = String(text);
  const res = { delayPs: null, areaAbc: null, gates: null, arrival: null };
  const all = [...s.matchAll(/Gates\s*=\s*(\d+)[^\n]*?Area\s*=\s*([\d.]+)[^\n]*?Delay\s*=\s*([\d.]+)\s*ps/g)];
  if (all.length) { const m = all[all.length - 1]; res.gates = Number(m[1]); res.areaAbc = Number(m[2]); res.delayPs = Number(m[3]); }
  const a = /Latest arrival time in '\\?([^']+)' is (\d+(?:\.\d+)?)/.exec(s);
  if (a) res.arrival = { module: a[1], value: Number(a[2]) };
  return res;
}

export function parseYosysLog(text, { period = 0 } = {}) {
  const rows = [], seen = new Set();
  const add = (r) => { if (!seen.has(r.id)) { seen.add(r.id); rows.push(r); } };
  const where = (l) => /(?:at |in )?([\w./-]+\.(?:s?v|vh|svh|ys|lib)):(\d+)/.exec(l);
  for (const raw of String(text).split(/\r?\n/)) {
    const l = raw.trim();
    let m;
    // Yosys 0.9 prints "ERROR: …"; newer releases (0.71 seen 2026-11-21) put the place first: "pdk/x.v:36: ERROR: syntax error …"
    const at = /^([\w./-]+\.(?:s?v|vh|svh|ys|lib)):(\d+):\s*(ERROR|Warning):\s*(.*)$/.exec(l);
    if (at) {
      const err = at[3] === 'ERROR';
      const sev = err || /logic loop|conflicting drivers|undriven|is used but has no driver/i.test(at[4]) ? 'error' : 'warning';
      add(row({ source: 'synth', code: err ? 'error' : 'warning', severity: sev, file: at[1], line: Number(at[2]), vars: { what: at[4] }, text: at[4], key: at[1] + ':' + at[2] + (err ? '' : ':' + at[4].replace(/\d+/g, '#').slice(0, 80)) }));
    } else if ((m = /^ERROR:\s*(.*)$/.exec(l))) {
      const w = where(m[1]);
      add(row({ source: 'synth', code: 'error', severity: 'error', file: w ? w[1] : '', line: w ? Number(w[2]) : 0, vars: { what: m[1] }, text: m[1], key: w ? w[1] + ':' + w[2] : 'error:' + m[1].slice(0, 60) }));
    } else if ((m = /^Warning:\s*(.*)$/.exec(l))) {
      const w = where(m[1]);
      const sev = /logic loop|conflicting drivers|undriven|is used but has no driver/i.test(m[1]) ? 'error' : 'warning';
      add(row({ source: 'synth', code: 'warning', severity: sev, file: w ? w[1] : '', line: w ? Number(w[2]) : 0, vars: { what: m[1] }, text: m[1], key: (w ? w[1] + ':' + w[2] + ':' : '') + m[1].replace(/\d+/g, '#').slice(0, 80) }));
    }
  }
  const t = parseTiming(text);
  if (period > 0 && t.delayPs !== null) {
    const need = period * 1000;
    if (t.delayPs > need) add(row({ source: 'synth', code: 'timing.delay', severity: 'error', vars: { delay: t.delayPs, period: need }, text: `The longest path after mapping is ${t.delayPs} ps, longer than the clock period of ${need} ps`, key: 'delay', req: { op: '<=', value: need, unit: 'ps' }, found: { value: t.delayPs, unit: 'ps' } }));
  }
  return rows;
}
