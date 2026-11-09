/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sim.js — HD.4 run simulation: the command lines for Icarus Verilog (iverilog + vvp) and Verilator, the testbench pick, and the
 * simulator's messages as Problems. DOM-free; imports only ./rows.js. The person's own simulator runs; we only write its command line.
 *
 *   findTestbenches({ name: text }) → [{ name (module), file, score, dumps (has $dumpfile), timescale ('1ns/1ps' | '') }] best first
 *     a testbench = a Verilog module with no ports that has an `initial` block; names like tb, tb_x, x_tb, test… rank first.
 *   simSteps({ tool: 'icarus'|'verilator', files: [names], top, defines: {N: v}, includes: [dirs], plusargs: [], vcd = 'out/wave.vcd', dumps, timescale })
 *     → { steps: [{tool, args, label, stdout?}], extra: { name: text } (files the run adds, e.g. cc_dump.v), waves: 'out/wave.vcd' | '' }
 *     Icarus: iverilog -g2012 -o out/sim.vvp -s <top> [-s cc_dump] … ; vvp -n out/sim.vvp. When the testbench has no $dumpfile we add a
 *     second root module cc_dump that dumps everything under <top> into out/wave.vcd (Icarus allows several roots).
 *     Verilator: verilator --binary -j 0 --trace -Mdir obj_dir --top-module <top> …; ./obj_dir/V<top>. Waves only when the testbench calls
 *     $dumpfile itself (Verilator has one root); it needs make and a C++ compiler on the computer, which Verilator calls.
 *   parseSimLog(text, tool) → rows   (iverilog "file:line: error: …", vvp $error/$fatal "ERROR: file:line:", Verilator "%Error: file:line:col: …")
 */
import { row } from './rows.js';

const HDL = /\.(v|sv|vh|svh)$/i;
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, '');

export function findTestbenches(files) {
  const out = [];
  for (const [file, text] of Object.entries(files)) {
    if (!HDL.test(file)) continue;
    const src = stripComments(String(text));
    const re = /\bmodule\s+([A-Za-z_][\w$]*)\s*(#\s*\([\s\S]*?\)\s*)?(\(\s*\))?\s*;([\s\S]*?)\bendmodule\b/g;
    let m;
    while ((m = re.exec(src))) {
      const body = m[4];
      if (!/\binitial\b/.test(body)) continue;
      const name = m[1];
      let score = 1;
      if (/^(tb|test|testbench)$/i.test(name) || /^tb_|_tb$|^test_|_test$|testbench/i.test(name)) score += 4;
      if (/\$finish\b/.test(body)) score += 1;
      if (/\$dumpfile\b/.test(body)) score += 1;
      const ts = /`timescale\s+(\d+\s*[munpf]?s\s*\/\s*\d+\s*[munpf]?s)/.exec(src);
      out.push({ name, file, score, dumps: /\$dumpfile\b/.test(body), timescale: ts ? ts[1].replace(/\s+/g, '') : '' });
    }
  }
  return out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

const defArgs = (defines = {}) => Object.entries(defines).filter(([k]) => /^[A-Za-z_]\w*$/.test(k)).map(([k, v]) => (v === '' || v === true ? '-D' + k : '-D' + k + '=' + String(v).replace(/[^\w.+-]/g, '')));

export function dumpModule(top, vcd = 'out/wave.vcd', timescale = '') {
  const ts = /^\d+[munpf]?s\/\d+[munpf]?s$/.test(timescale) ? '`timescale ' + timescale + '\n' : '';
  return `// added by CadCraft's Chip design add-on: dump every signal under ${top}\n${ts}module cc_dump;\n  initial begin\n    $dumpfile("${vcd}");\n    $dumpvars(0, ${top});\n  end\nendmodule\n`;
}

export function simSteps({ tool = 'icarus', files = [], top, defines = {}, includes = [], plusargs = [], vcd = 'out/wave.vcd', dumps = false, timescale = '' } = {}) {
  if (!top || !/^[A-Za-z_][\w$]*$/.test(top)) throw new Error('simSteps: no testbench');
  const src = files.filter((f) => /\.(v|sv)$/i.test(f));
  const inc = includes.flatMap((d) => ['-I', d]);
  const plus = plusargs.filter((p) => /^\+[\w=.+-]+$/.test(p));
  if (tool === 'verilator') {
    const steps = [
      { tool: 'verilator', label: 'verilator', args: ['--binary', '-j', '0', '--trace', '-Wno-fatal', '-Mdir', 'obj_dir', '--top-module', top, ...defArgs(defines), ...includes.map((d) => '-I' + d), ...src] },
      { tool: 'obj_dir/V' + top, label: 'run', args: plus },
    ];
    return { steps, extra: {}, waves: dumps ? vcd : '' };
  }
  const extra = dumps ? {} : { 'cc_dump.v': dumpModule(top, vcd, timescale) };
  const steps = [
    { tool: 'iverilog', label: 'iverilog', args: ['-g2012', '-Wall', '-o', 'out/sim.vvp', '-s', top, ...(dumps ? [] : ['-s', 'cc_dump']), ...defArgs(defines), ...inc, ...src, ...Object.keys(extra)] },
    { tool: 'vvp', label: 'vvp', args: ['-n', 'out/sim.vvp', ...plus] },
  ];
  return { steps, extra, waves: vcd };
}

export function parseSimLog(text, tool = 'icarus') {
  const rows = [], seen = new Set();
  const add = (r) => { if (!seen.has(r.id)) { seen.add(r.id); rows.push(r); } };
  for (const raw of String(text).split(/\r?\n/)) {
    const l = raw.trim();
    let m;
    if ((m = /^%(Error|Warning)(?:-([A-Z0-9_]+))?:\s*([^:\s]+):(\d+):(?:(\d+):)?\s*(.*)$/.exec(l))) {   // Verilator
      add(row({ source: 'sim', code: m[1] === 'Error' ? 'error' : 'warning', severity: m[1] === 'Error' ? 'error' : 'warning', file: m[3], line: Number(m[4]), vars: { what: m[6], tag: m[2] || '' }, text: (m[2] ? m[2] + ': ' : '') + m[6], key: m[3] + ':' + m[4] + ':' + (m[2] || '') }));
    } else if ((m = /^(ERROR|WARNING|FATAL|INFO):\s*([^:\s]+):(\d+):\s*(.*)$/.exec(l))) {   // vvp: $error / $warning / $fatal / $info
      const sev = m[1] === 'WARNING' ? 'warning' : m[1] === 'INFO' ? 'note' : 'error';
      add(row({ source: 'sim', code: 'assert.' + m[1].toLowerCase(), severity: sev, file: m[2], line: Number(m[3]), vars: { what: m[4] }, text: m[4] || m[1], key: m[2] + ':' + m[3] }));
    } else if ((m = /^([^:\s]+\.(?:s?v|vh|svh)):(\d+):\s*(error|warning|sorry)?:?\s*(.*)$/i.exec(l))) {   // iverilog
      const kind = (m[3] || (/syntax error|unknown|unable|not declared|failed/i.test(m[4]) ? 'error' : 'warning')).toLowerCase();
      if (/^(\.\.\.|:)/.test(m[4])) continue;   // a continuation line ("... It was declared here as a net.")
      add(row({ source: 'sim', code: kind === 'warning' ? 'warning' : 'error', severity: kind === 'warning' ? 'warning' : 'error', file: m[1], line: Number(m[2]), vars: { what: m[4] }, text: m[4], key: m[1] + ':' + m[2] }));
    } else if (/^\d+ error\(s\) during elaboration\.?$/.test(l) || /^I give up\.?$/.test(l)) {
      add(row({ source: 'sim', code: 'elab', severity: 'error', text: l, key: 'elab' }));
    }
  }
  return rows;
}

/** What vvp said at the end: the time $finish was called, VCD opened. */
export function simSummary(text) {
  const s = String(text);
  const fin = /(?:\$finish|\$stop) called at (\d+) \(([^)]+)\)/.exec(s) || /- (?:\S+):(\d+): Verilog \$finish/.exec(s);
  return { finished: !!fin, at: fin ? Number(fin[1]) : null, unit: fin && fin[2] ? fin[2] : '', vcd: /VCD info: dumpfile (\S+) opened/.exec(s)?.[1] || '' };
}
