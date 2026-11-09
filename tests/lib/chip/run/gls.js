/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gls.js — HD.9 gate-level simulation with back-annotated delays, and test patterns for a tester (STIL) from a simulation's waves.
 * DOM-free; imports ./rows.js, ./vcd.js, ./sim.js.
 *
 * Gate-level sim runs the person's own Icarus Verilog with `-gspecify` on the netlist (synthesis or place and route), the cell models of
 * their PDK and the testbench; delays come from an SDF file through `$sdf_annotate`, which a small extra root module (cc_sdf) calls on the
 * design under test, so the testbench needs no change. SPEF (parasitics) is not read by Icarus: OpenROAD/OpenSTA read it (`read_spef`,
 * pnr.js with RCX rules) and write the SDF (`write_sdf`) that this run annotates. Icarus Verilog 11 applies IOPATH cell delays and says
 * "INTERCONNECT not supported" for wire delays, which it leaves out: its gate-level timing is cell delays only (parseGlsLog keeps that warning).
 *
 *   glsSteps({ netlist, cells: [files], testbench, top, dut: 'counter_tb.dut', sdf, timescale, defines, corner: 'max'|'typ'|'min' })
 *       → { steps: [iverilog -g2012 -gspecify …, vvp -n out/gls.vvp], extra: { cc_sdf.v, cc_dump.v }, waves: 'out/gls.vcd' }
 *   parseGlsLog(text) → rows  (SDF WARNING / SDF ERROR from vvp, timing-check violations "setup/hold violation", plus parseSimLog's)
 *   stilPlan(vcd, { scope, inputs, outputs, period, strobe }) → { signals: [{name, dir}], period, strobe, timescale, vectors: [{ t, in: '01…', out: 'LH…' }] }
 *       inputs/outputs default to the scope's regs (driven by the testbench) and wires; buses are split into bits name[i], msb first
 *       outputs: 0 → L, 1 → H, x/z → X (not compared)
 */
import { row } from './rows.js';
import { valueAt } from './vcd.js';
import { parseSimLog, dumpModule } from './sim.js';

const PATH = /^[A-Za-z_][\w$]*(\.[A-Za-z_\\][\w$\\[\]]*)*$/;

export function sdfModule(dut, sdf, corner = 'max', timescale = '') {
  const ts = /^\d+[munpf]?s\/\d+[munpf]?s$/.test(timescale) ? '`timescale ' + timescale + '\n' : '';
  const c = { min: 'MINIMUM', typ: 'TYPICAL', max: 'MAXIMUM' }[corner] || 'MAXIMUM';
  return `// added by CadCraft's Chip design add-on: back-annotate ${sdf} onto ${dut}\n${ts}module cc_sdf;\n  initial $sdf_annotate("${sdf}", ${dut});   // wanted corner: ${c.toLowerCase()} (write the SDF for that corner)\nendmodule\n`;
}

export function glsSteps({ netlist, cells = [], testbench, top, dut, sdf = '', timescale = '', defines = {}, corner = 'max', vcd = 'out/gls.vcd' } = {}) {
  if (!netlist || !testbench || !top) throw new Error('glsSteps: netlist, testbench and top');
  if (sdf && !(dut && PATH.test(dut))) throw new Error('glsSteps: the design under test (e.g. counter_tb.dut)');
  const extra = { 'cc_dump.v': dumpModule(top, vcd, timescale) };
  if (sdf) extra['cc_sdf.v'] = sdfModule(dut, sdf, corner, timescale);
  const defs = Object.entries({ GLS: '', ...defines }).filter(([k]) => /^[A-Za-z_]\w*$/.test(k)).map(([k, v]) => (v === '' ? '-D' + k : '-D' + k + '=' + String(v).replace(/[^\w.+-]/g, '')));
  const roots = ['-s', top, '-s', 'cc_dump', ...(sdf ? ['-s', 'cc_sdf'] : [])];
  return {
    steps: [
      { tool: 'iverilog', label: 'iverilog gls', args: ['-g2012', '-gspecify', '-o', 'out/gls.vvp', ...roots, ...defs, ...cells, netlist, testbench, ...Object.keys(extra)] },
      { tool: 'vvp', label: 'vvp gls', args: ['-n', 'out/gls.vvp'] },
    ],
    extra,
    waves: vcd,
  };
}

export function parseGlsLog(text) {
  const rows = parseSimLog(text);
  const seen = new Set(rows.map((r) => r.id));
  for (const raw of String(text).split(/\r?\n/)) {
    const l = raw.trim();
    let m;
    if ((m = /^(?:([^:\s]+):(\d+):\s*)?SDF (WARNING|ERROR):\s*(.*)$/.exec(l))) {
      const inner = !m[1] && /^([^:\s]+):(\d+):\s*(.*)$/.exec(m[4]);   // "SDF WARNING: file:line: …" (the other order)
      if (inner) m = [m[0], inner[1], inner[2], m[3], inner[3]];
      const r = row({ source: 'gls', code: 'sdf.' + m[3].toLowerCase(), severity: m[3] === 'ERROR' ? 'error' : 'warning', file: m[1] || '', line: Number(m[2]) || 0, vars: { what: m[4] }, text: 'SDF: ' + m[4], key: (m[1] || '') + ':' + (m[2] || '') + ':' + m[4].replace(/\d+/g, '#').slice(0, 60) });
      if (!seen.has(r.id)) { seen.add(r.id); rows.push(r); }
    } else if ((m = /(setup|hold|width|period|recovery|removal)(?:\(.*?\))?\s*(?:timing )?violation/i.exec(l))) {
      const at = /time\s*[=:]?\s*(\d+)/i.exec(l);
      const r = row({ source: 'gls', code: 'check.' + m[1].toLowerCase(), severity: 'error', vars: { what: l }, text: l.slice(0, 300), key: m[1].toLowerCase() + ':' + (at ? at[1] : l.slice(0, 60)) });
      if (!seen.has(r.id)) { seen.add(r.id); rows.push(r); }
    }
  }
  return rows;
}

const bits = (sig) => {
  if (sig.width === 1) return [{ name: sig.name, sig, bit: 0 }];
  const out = [];
  const hi = sig.msb ?? sig.width - 1, lo = sig.lsb ?? 0, step = hi >= lo ? -1 : 1;
  for (let b = hi, k = 0; k < sig.width; b += step, k++) out.push({ name: `${sig.name}[${b}]`, sig, bit: k });
  return out;
};

export function stilPlan(vcd, { scope = '', inputs = null, outputs = null, period, strobe = null, maxVectors = 100000 } = {}) {
  if (!(period > 0)) throw new Error('stilPlan: a period in the dump\'s time units');
  const inScope = vcd.signals.filter((s) => s.path === (scope ? scope + '.' : '') + s.name && (!scope || s.path.split('.').length === scope.split('.').length + 1));
  const pick = (names, kindTest) => (names ? names.map((n) => inScope.find((s) => s.name === n)).filter(Boolean) : inScope.filter((s) => kindTest(s.kind)));
  const ins = pick(inputs, (k) => k === 'reg');
  const outs = pick(outputs, (k) => k === 'wire' || k === 'tri');
  const inBits = ins.flatMap(bits), outBits = outs.flatMap(bits);
  const s = strobe === null ? period * 0.9 : strobe;
  const vectors = [];
  for (let t0 = 0; t0 <= vcd.end && vectors.length < maxVectors; t0 += period) {
    const drive = (b) => { const v = valueAt(b.sig, t0); const c = v.length > 1 ? v[b.bit] : v; return c === '0' || c === '1' ? c : 'N'; };
    const expect = (b) => { const v = valueAt(b.sig, t0 + s); const c = v.length > 1 ? v[b.bit] : v; return c === '0' ? 'L' : c === '1' ? 'H' : 'X'; };
    vectors.push({ t: t0, in: inBits.map(drive).join(''), out: outBits.map(expect).join('') });
  }
  return { signals: [...inBits.map((b) => ({ name: b.name, dir: 'in' })), ...outBits.map((b) => ({ name: b.name, dir: 'out' }))], period, strobe: s, timescale: vcd.timescale, vectors };
}
