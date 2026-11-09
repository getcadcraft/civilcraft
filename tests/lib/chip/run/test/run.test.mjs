#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * run.test.mjs — the Chip design runners (lib/chip/run, 0.9 HD.4–HD.9).
 *   node lib/chip/run/test/run.test.mjs
 * REAL runs (when the tool is on this computer): Icarus Verilog (iverilog + vvp) and Yosys run a 4-bit counter end to end through the whole
 * page path — planStage → makePackage → the Studio bridge's calls (a stand-in that does what engines.rs does: unzip, `node engine/cc-chip-run.mjs`,
 * read out/result.zip) → readStage → Problems rows and run records with hashes; synthesis onto a made-up cell library (fixtures/cc_cells.lib),
 * gate-level simulation of that netlist with an SDF written by chip-formats (fmt/sdf.js) and back-annotated by Icarus, test patterns written
 * by chip-formats' STIL writer from those waves.
 * NOT run for real (not installed here): Verilator, OpenROAD, KLayout, Netgen — their command lines are built and checked, and their parsers
 * are fed hand-written sample outputs in the shape of those tools' reports. Say so wherever these results are quoted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { zipStored, unzipStored, crc32 } from '../zip.js';
import { newProject, readProject, writeProject, recordRun, repeatable, sha256, stage as stageOf } from '../project.js';
import { ALLOWED_PROGRAMS, parseVersion, probeSteps } from '../tools.js';
import { readVcd, valueAt, formatValue, isFst } from '../vcd.js';
import { findTestbenches, simSteps, parseSimLog } from '../sim.js';
import { synthScript, parseStat, parseTiming, parseYosysLog } from '../synth.js';
import { pnrTcl, pnrSteps, parseOpenroadLog, pnrRows } from '../pnr.js';
import { drcSteps, readLyrdb, drcRows, drcSummary } from '../drc.js';
import { lvsSteps, parseLvsText, parseLvsJson, lvsRows } from '../lvs.js';
import { glsSteps, parseGlsLog, stilPlan } from '../gls.js';
import { planStage, runStage, stilFrom } from '../flow.js';
import { makePackage, studioRunner, resultOf, DECL } from '../runner.js';
import { waveSegments } from '../wave-view.js';
import { layoutSvg, bounds } from '../layout-view.js';
import { PROGRAMS, checkArg } from '../driver/cc-chip-run.mjs';
import { standInBridge, runPackage } from './local-runner.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), RUN = path.resolve(HERE, '..'), CHIP = path.resolve(RUN, '..'), ROOT = path.resolve(CHIP, '../..');
const FX = (n) => fs.readFileSync(path.join(HERE, 'fixtures', n), 'utf8');
const script = new Uint8Array(fs.readFileSync(path.join(RUN, 'driver/cc-chip-run.mjs')));
const dec = new TextDecoder();
let pass = 0, fail = 0, skipped = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const skip = (m) => { skipped++; console.log('  skip ' + m); };
const has = (p) => spawnSync('sh', ['-c', 'command -v ' + p], { encoding: 'utf8' }).status === 0;
const fmtDir = path.join(CHIP, 'fmt');
const fmt = {};
for (const n of ['def', 'lef', 'stil', 'sdf']) if (fs.existsSync(path.join(fmtDir, n + '.js'))) fmt[n] = await import(path.join(fmtDir, n + '.js'));

console.log('zip, project, tools');
{
  const z = zipStored({ 'a.txt': 'hello', 'd/b.bin': new Uint8Array([0, 1, 2, 255]) });
  const u = unzipStored(z);
  ok(dec.decode(u['a.txt']) === 'hello' && u['d/b.bin'][3] === 255, 'a stored zip reads back');
  ok(crc32(new TextEncoder().encode('123456789')) === 0xcbf43926, 'CRC-32 check value');
  const p = newProject({ name: 'c', top: 'counter' });
  const back = readProject(writeProject(p));
  ok(back.ok && back.project.stages.length === 7 && back.project.top === 'counter', 'a project writes and reads back with its seven stages');
  ok(!readProject('{"format":"x"}').ok && !readProject('nope').ok, 'something else is refused');
  const bad = readProject({ format: 'cadcraft-chip-project', version: 1, stages: [{ id: 'Bad Id', kind: 'sim' }, { id: 'sim', kind: 'sim', tool: 'rm -rf', options: { a: 1, 'b c': 2 } }], runs: [{ stage: 'sim', inputs: { '../x': 'a'.repeat(64), 'ok.v': 'b'.repeat(64) } }] });
  ok(bad.ok && bad.project.stages.length === 1 && bad.project.stages[0].tool === 'icarus' && !('b c' in bad.project.stages[0].options) && Object.keys(bad.project.runs[0].inputs).join() === 'ok.v', 'a hostile project file is cleaned (bad stage, tool, option, path dropped)');
  const h1 = { 'a.v': await sha256('x') };
  recordRun(p, { stage: 'sim', ok: true, inputs: h1, outputs: {} });
  ok(repeatable(p, 'sim', h1).same && !repeatable(p, 'sim', { 'a.v': await sha256('y') }).same, 'repeatable(): same inputs = same, a changed file is named');
  ok(JSON.stringify([...ALLOWED_PROGRAMS].sort()) === JSON.stringify([...PROGRAMS].sort()), 'the run script starts exactly the programs tools.js lists');
  ok(parseVersion('yosys', 'Yosys 0.9 (git sha1 1979e0b)\n') === 'Yosys 0.9 (git sha1 1979e0b)' && parseVersion('iverilog', 'Icarus Verilog version 11.0 (stable) ()\n') .startsWith('Icarus Verilog version 11.0'), 'versions are read from the tools\' words');
  ok(DECL.programs.join() === 'node' && DECL.script === 'engine/cc-chip-run.mjs' && DECL.args.join() === '{script},{job}', 'the add-on run declaration: node + the shipped script, placeholders only');
  // the declaration passes the same rules as engines.rs validate_addon_run (render/engine-addon.js validateAddonEngine has the same table)
  const ea = await import(path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/render/engine-addon.js')).catch(() => null);
  if (ea) { const v = ea.validateAddonEngine({ id: 'chip.run', name: 'Chip design', run: { programs: DECL.programs, script: DECL.script, args: DECL.args } }, 'chip'); ok(v.ok, 'the declaration passes the engine.run rules (validateAddonEngine)', JSON.stringify(v.problems)); }
}

console.log('run script: arguments and programs');
{
  const job = { toolsDir: '/opt/eda/bin', pdkDir: '' };
  let refused = 0;
  for (const a of ['/etc/passwd', '../x.v', '-I../inc', 'C:\\x', '{pdk}/x']) { try { checkArg(a, job); } catch { refused++; } }
  ok(refused === 5, 'absolute paths, .. steps and a PDK path with no PDK folder are refused (' + refused + '/5)');
  ok(checkArg('{tools}/share/simcells.v', job) === '/opt/eda/bin/share/simcells.v' && checkArg('-DWIDTH=4', job) === '-DWIDTH=4' && checkArg('src/a.v', job) === 'src/a.v', '{tools}/ becomes the tools folder; plain words and relative names pass');
  const r = runPackage(makePackage({ files: {}, steps: [{ tool: 'bash', args: ['-c', 'echo hi'] }], script }));
  const res = resultOf(r.bytes);
  ok(r.code === 0 && res.record && !res.record.ok && res.record.steps[0].code === 126, 'a program that is not on the list (bash) is not started; the result says so');
  const r2 = runPackage(makePackage({ files: {}, steps: [{ tool: 'netgen', args: ['-batch', 'quit'] }], toolsDir: '/nonexistent', script }));
  const res2 = resultOf(r2.bytes);
  ok(res2.record.steps[0].code === (has('netgen') ? 0 : 127) && /not found/.test(dec.decode(res2.files['out/log-01-netgen.txt'] || new Uint8Array())) === !has('netgen'), 'a tool that is not installed fails its step with "not found"');
  const pr = runPackage(makePackage({ files: {}, steps: probeSteps(), script }));
  const pres = resultOf(pr.bytes);
  const found = pres.record.steps.filter((s) => s.code === 0).map((s) => s.label);
  ok(pres.record.ok, 'Find my tools: every probe is optional, the run finishes (' + found.join(', ') + ')');
  if (has('yosys')) ok(/Yosys \d/.test(dec.decode(pres.files['out/version-yosys.txt'] || new Uint8Array())), 'the probe read the installed Yosys\' version'); else skip('yosys not installed');
}

console.log('VCD reader (hand-written dump)');
{
  const v = readVcd(`$date today $end
$timescale 1 ns $end
$scope module tb $end
$var reg 1 ! clk $end
$var wire 4 " q [3:0] $end
$var real 64 # r $end
$scope module dut $end
$var wire 4 " q [3:0] $end
$upscope $end
$upscope $end
$enddefinitions $end
#0
$dumpvars
0!
bx "
r0.5 #
$end
#5
1!
b1 "
#10
0!
b10 "
#10
b11 "
#15
z!
`);
  const q = v.signals.find((s) => s.path === 'tb.q'), dq = v.signals.find((s) => s.path === 'tb.dut.q'), clk = v.signals.find((s) => s.name === 'clk');
  ok(v.ok && v.signals.length === 4 && v.timescale.seconds === 1e-9 && v.end === 15, 'header, scopes, four vars, the timescale');
  ok(valueAt(q, 0) === 'xxxx' && valueAt(q, 5) === '0001' && valueAt(q, 12) === '0011' && valueAt(dq, 12) === '0011', 'vectors left-extended (x stays x), the same code in two scopes, the last value at one time wins');
  ok(valueAt(clk, 16) === 'z' && formatValue('0011', 4, 'hex') === '3' && formatValue('1010', 4, 'dec') === '10', 'scalars incl. z; hex and dec');
  ok(valueAt(v.signals.find((s) => s.name === 'r'), 1) === '0.5', 'real values');
  ok(waveSegments(q, 0, 15).map((s) => s.v).join() === 'xxxx,0001,0011', 'wave segments for the viewer');
  ok(isFst(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 0x49, 0])) && !isFst(new TextEncoder().encode('$date')), 'an FST header is spotted (FST is not read)');
}

console.log('simulation (HD.4)');
const files = { 'counter.v': FX('counter.v'), 'counter_tb.v': FX('counter_tb.v') };
{
  const tbs = findTestbenches(files);
  ok(tbs[0]?.name === 'counter_tb' && tbs.length === 1 && tbs[0].timescale === '1ns/1ps', 'the testbench is picked (no ports + initial), with its timescale');
  const ver = simSteps({ tool: 'verilator', files: Object.keys(files), top: 'counter_tb', defines: { W: 4 } });
  ok(ver.steps[0].tool === 'verilator' && ver.steps[0].args.includes('--binary') && ver.steps[0].args.includes('--trace') && ver.steps[1].tool === 'obj_dir/Vcounter_tb' && ver.waves === '', 'Verilator: --binary --trace, then ./obj_dir/V<top>; no waves without $dumpfile (command line only: Verilator is NOT installed here)');
  const vlog = parseSimLog('%Error: counter.v:9:5: syntax error, unexpected <=\n%Warning-WIDTH: counter.v:10:20: Operator ADD expects 4 bits\n', 'verilator');
  ok(vlog.length === 2 && vlog[0].severity === 'error' && vlog[0].line === 9 && vlog[1].text.startsWith('WIDTH'), 'Verilator messages (hand-written sample) become rows at their line');
  if (has('iverilog') && has('vvp')) {
    const p = newProject({ name: 'counter', top: 'counter' });
    const runner = studioRunner(standInBridge(), {});
    ok((await runner.available()).ok, 'the stand-in Studio bridge answers addonFind');
    const res = await runStage({ project: p, stage: stageOf(p, 'sim'), files, runner, script });
    ok(res.record?.ok && res.waves && res.run.ok, 'REAL Icarus run through the bridge path: compiled and simulated', JSON.stringify(res.record?.steps?.map((s) => [s.tool, s.code])));
    const v = readVcd(res.waves);
    const cnt = v.signals.find((s) => s.path === 'counter_tb.count');
    ok(v.ok && cnt && valueAt(cnt, 220000) === '0100' && valueAt(cnt, 100) === 'xxxx', 'REAL waves: count is x before reset and 4 at the end (' + (cnt && valueAt(cnt, 220000)) + ')');
    ok(Object.keys(res.run.inputs).sort().join() === 'cc_dump.v,counter.v,counter_tb.v' && Object.values(res.run.outputs).every((h) => /^[0-9a-f]{64}$/.test(h)), 'the run record keeps SHA-256 of every input (incl. the added cc_dump.v) and output', Object.keys(res.run.inputs).join());
    ok(parseSimLog('ERROR: counter_tb.v:12: count is 3, expected 4\n       Time: 222000  Scope: counter_tb\n').some((r) => r.code === 'chip.sim.assert.error' && r.line === 12), 'a testbench $error (vvp\'s words) is an error row at its line');
    const again = repeatable(p, 'sim', res.run.inputs);
    ok(again.same, 'the same inputs again: "same as last run"');
    const bad = await runStage({ project: p, stage: stageOf(p, 'sim'), files: { ...files, 'counter.v': files['counter.v'].replace('count <= 4\'d0;', 'count <= 4\'d0') }, runner, script });
    const err = bad.rows.find((r) => r.severity === 'error' && r.file === 'counter.v');
    ok(!bad.ok && err && err.line > 0 && err.id.startsWith('chip.sim:'), 'REAL syntax error: an error row at counter.v:' + (err && err.line));
  } else skip('iverilog not installed');
}

console.log('synthesis (HD.5)');
let netlistV = '';
{
  const s = synthScript({ files: ['counter.v', 'counter_tb.v'], top: 'counter', liberty: 'cc_cells.lib', period: 1 });
  ok(/read_verilog counter\.v/.test(s) && /dfflibmap -liberty cc_cells\.lib/.test(s) && /abc -liberty cc_cells\.lib -D 1000/.test(s) && /tee -q -o out\/stat\.txt stat -liberty/.test(s), 'the script from the project: read, synth, map to the liberty, stat, netlist out');
  const newer = parseStat(`=== counter ===

        18 wires
        24 wire bits
        18   5.3E+01 cells
         3   6.000 AND2
         4  24.000 DFF

   Chip area for module '\\counter': 53.000000
`);
  ok(newer.cells === 18 && newer.modules.counter.types.DFF === 4 && newer.area === 53, 'the column layout of newer Yosys releases (hand-written sample)');
  const tm = parseTiming('ABC: WireLoad = "none"  Gates =     23 ( 17.4 %)   Cap =  4.2 ff (  0.0 %)   Area =    109.00 ( 92.9 %)   Delay =  1372.80 ps  ( 13.0 %)\nLatest arrival time in \'\\counter\' is 812:\n');
  ok(tm.delayPs === 1372.8 && tm.gates === 23 && tm.arrival.value === 812, 'ABC\'s delay line and Yosys sta\'s arrival time (hand-written samples: Yosys 0.9 here prints neither)');
  const rows = parseYosysLog('Warning: Identifier `\\x\' is implicitly declared at counter.v:7.\nERROR: Module `\\foo\' referenced in module `\\top\' in cell `\\u1\' is not part of the design.\n' + 'ABC: Gates = 3 Area = 3 Delay = 1500 ps\n', { period: 1 });
  ok(rows.length === 3 && rows[0].line === 7 && rows[1].severity === 'error' && rows[2].code === 'chip.synth.timing.delay' && rows[2].found.value === 1500, 'warnings at their line, errors, a delay over the period = an error with required/found');
  if (has('yosys')) {
    const p = newProject({ name: 'counter', top: 'counter', testbench: 'counter_tb' });
    const st = stageOf(p, 'synth');
    st.options = { liberty: 'cc_cells.lib' };
    const runner = studioRunner(standInBridge(), {});
    const res = await runStage({ project: p, stage: st, files: { ...files, 'cc_cells.lib': FX('cc_cells.lib') }, runner, script });
    const stat = res.summary.stat;
    ok(res.record?.ok && stat.cells === 18 && stat.area === 53 && stat.modules.counter.types.DFF === 4, 'REAL Yosys onto cc_cells: 18 cells, area 53, 4 DFF', JSON.stringify(stat));
    ok(!Object.keys(res.run.inputs).includes('counter_tb.v') && Object.keys(res.run.inputs).includes('cc_cells.lib'), 'the testbench is not synthesized; the liberty is an input and is hashed');
    ok(/Yosys \d/.test(res.run.version), 'the run records the Yosys version: ' + res.run.version);
    netlistV = dec.decode(res.files['out/netlist.v']);
    ok(/\bDFF\b/.test(netlistV) && /module counter/.test(netlistV), 'REAL mapped netlist out/netlist.v');
  } else skip('yosys not installed');
}

console.log('gate-level simulation with SDF (HD.9)');
{
  const g = glsSteps({ netlist: 'out/synth/netlist.v', cells: ['cc_cells.v'], testbench: 'counter_tb.v', top: 'counter_tb', dut: 'counter_tb.dut', sdf: 'counter.sdf', timescale: '1ns/1ps' });
  ok(g.steps[0].args.includes('-gspecify') && g.steps[0].args.join(' ').includes('-s counter_tb -s cc_dump -s cc_sdf') && /\$sdf_annotate\("counter\.sdf", counter_tb\.dut\)/.test(g.extra['cc_sdf.v']), 'iverilog -gspecify with a cc_sdf root that annotates the design under test');
  const gl = parseGlsLog('counter.sdf:12: SDF WARNING: INTERCONNECT not supported.\nSDF ERROR: counter.sdf:3: Invalid DELAYFILE format\nTiming violation: setup violation at time 1200 on DFF\n');
  ok(gl.length === 3 && gl[0].line === 12 && gl[1].severity === 'error' && gl[1].line === 3 && gl[2].code === 'chip.gls.check.setup', 'SDF messages in both orders and timing-check violations become rows');
  if (netlistV && has('iverilog') && fmt.sdf) {
    const inst = [...netlistV.matchAll(/^\s*(INV|BUF|NAND2|NOR2|AND2|OR2|XOR2|XNOR2|DFF)\s+(\S+)\s*\(/gm)].map((m) => ({ type: m[1], instance: m[2].replace(/^\\/, '') }));
    const cells = inst.map((c) => ({ ...c, arcs: c.type === 'DFF' ? [{ from: { edge: 'posedge', port: 'C' }, to: 'Q', rise: 2, fall: 2 }] : (c.type === 'INV' || c.type === 'BUF' ? ['A'] : ['A', 'B']).map((pin) => ({ from: pin, to: 'Y', rise: 0.3, fall: 0.3 })) }));
    const sdf = fmt.sdf.writeSdf(fmt.sdf.sdfFromArcs({ design: 'counter', timescale: '1ns', cells }));
    const p = newProject({ name: 'counter', top: 'counter', testbench: 'counter_tb' });
    const st = stageOf(p, 'gls');
    st.options = { netlist: 'out/synth/netlist.v', cells: ['cc_cells.v'], sdf: 'counter.sdf', dut: 'counter_tb.dut' };
    const all = { ...files, 'out/synth/netlist.v': netlistV, 'cc_cells.v': FX('cc_cells.v'), 'counter.sdf': sdf };
    const runner = studioRunner(standInBridge(), {});
    const res = await runStage({ project: p, stage: st, files: all, runner, script });
    const v = readVcd(res.waves || '');
    const cnt = v.signals.find((s) => s.path === 'counter_tb.count');
    // clock edges are at 5, 15, 25 … ns; with the SDF's 2 ns clock-to-Q, count changes 2 ns after an edge, not at it
    const t0 = cnt ? cnt.t.find((tt, i) => tt > 20000 && cnt.v[i] !== 'xxxx' && cnt.v[i] !== '0000') : null;
    ok(res.record?.ok && v.ok && cnt, 'REAL gate-level run of the mapped netlist with the cell models', JSON.stringify(res.record?.steps?.map((s) => [s.tool, s.code])));
    ok(t0 !== null && ((t0 - 5000) % 10000) >= 2000 && ((t0 - 5000) % 10000) <= 3000, 'REAL SDF back-annotation: count changes ' + (t0 !== null ? ((t0 - 5000) % 10000) / 1000 : '?') + ' ns after the clock edge (the SDF says 2 ns clock-to-Q, plus gate delays)');
    const endCnt = cnt ? valueAt(cnt, 220000) : '';
    ok(endCnt === '0100', 'the gate-level counter ends at 4, as the RTL one (' + endCnt + ')');
    if (fmt.stil) {
      const r = stilFrom(res.waves, { scope: 'counter_tb', period: 10000, strobe: 9000, clock: ['clk'], title: 'counter' }, fmt);
      ok(r.plan.signals.map((s) => s.name + ':' + s.dir).join(' ') === 'clk:in en:in rst:in count[3]:out count[2]:out count[1]:out count[0]:out', 'STIL plan: testbench regs drive, wires are compared, buses split msb first');
      ok(r.stil && /STIL 1\.0;/.test(r.stil.text) && /Pattern/.test(r.stil.text) && !(r.stil.problems || []).some((x) => x.severity === 'error'), 'chip-formats\' STIL writer wrote the patterns (' + r.plan.vectors.length + ' vectors)', JSON.stringify(r.stil?.problems));
      if (fmt.stil.readStilVectors) { const back = fmt.stil.readStilVectors(r.stil.text); const n = (back.vectors || back).length; ok(n === r.plan.vectors.length, 'the STIL reads back with the same number of vectors (' + n + ')'); }
    } else skip('chip-formats STIL writer not present');
  } else skip('no netlist, iverilog or chip-formats SDF writer');
}

console.log('place and route (HD.6) — OpenROAD NOT installed: command line + hand-written log');
{
  const tcl = pnrTcl({ lefs: ['tech.lef', 'cells.lef'], libs: ['cells.lib'], netlist: 'out/synth/netlist.v', top: 'counter', sdc: 'counter.sdc', site: 'core', utilization: 30, hLayers: 'metal1', vLayers: 'metal2', route: 'detailed' });
  const order = ['read_lef {tech.lef}', 'read_lef {cells.lef}', 'read_liberty {cells.lib}', 'read_verilog {out/synth/netlist.v}', 'link_design counter', 'read_sdc {counter.sdc}', 'initialize_floorplan -utilization 30', 'place_pins -hor_layers metal1 -ver_layers metal2', 'global_placement', 'detailed_placement', 'global_route', 'detailed_route -output_drc out/route_drc.rpt', 'write_def out/final.def', 'write_sdf out/final.sdf'];
  let at = -1, inOrder = true;
  for (const o of order) { const i = tcl.indexOf(o); if (i <= at) { inOrder = false; console.log('    missing/out of order: ' + o); } at = i; }
  ok(inOrder, 'the TCL from the project: LEF, liberty, netlist, SDC, floorplan, pins, place, route, DEF/SDF out, in that order');
  ok(pnrSteps({ script: 'my.tcl' }).steps[0].args.join(' ') === '-no_splash -exit -log out/openroad.log my.tcl', 'your own .tcl is run as it is');
  const log = parseOpenroadLog(`[INFO GPL-0002] DBU: 1000
[WARNING STA-0053] cells.lib line 12, library cc_cells already exists.
[ERROR GRT-0119] Routing congestion too high.
Design area 312 u^2 34% utilization.
wns -0.21
tns -1.05
[INFO DRT-0199]   Number of violations = 3.
`);
  ok(log.area === 312 && log.util === 34 && log.wns === -0.21 && log.tns === -1.05 && log.drcCount === 3 && log.messages.length === 2, 'the log: area, utilization, WNS/TNS, route violations, tool messages');
  const rows = pnrRows(log);
  ok(rows.some((r) => r.code === 'chip.pnr.timing.slack' && r.found.value === -0.21) && rows.some((r) => r.code === 'chip.pnr.route.drc') && rows.some((r) => r.severity === 'error' && /GRT-0119/.test(r.text)), 'negative slack, route violations and ERROR lines are Problems');
  if (fmt.def) {
    const d = fmt.def.readDef(fs.readFileSync(path.join(fmtDir, 'test/fixtures/demo.def'), 'utf8'));
    let lef;
    if (fmt.lef && fs.existsSync(path.join(fmtDir, 'test/fixtures/demo.lef'))) lef = fmt.lef.lefModel(fmt.lef.readLef(fs.readFileSync(path.join(fmtDir, 'test/fixtures/demo.lef'), 'utf8')).tree);
    const shapes = fmt.def.defShapes(d.def, lef);
    const svg = layoutSvg(shapes);
    ok(shapes.cells.length === 3 && (svg.match(/class="chip-cell/g) || []).length === 3 && /class="chip-wire"/.test(svg) && /class="chip-die"/.test(svg), 'chip-formats\' DEF reader → our floorplan/placement/routing SVG (3 placed cells, wires, die)');
    ok(!/class="chip-cell/.test(layoutSvg(shapes, { show: { floorplan: true, placement: false, routing: false } })) && bounds(shapes)[2] >= 20, 'the switches hide placement; bounds take the die');
    const p = newProject({ top: 'counter' });
    const st = stageOf(p, 'pnr'); st.options = { lefs: ['tech.lef'], netlist: 'out/synth/netlist.v' };
    const pl = planStage(p, st, { 'tech.lef': 'x', 'out/synth/netlist.v': 'module counter; endmodule' });
    ok(!pl.problems.length && pl.steps[0].tool === 'openroad' && pl.inputs.includes('tech.lef') && pl.inputs.includes('out/synth/netlist.v'), 'planStage: the pnr stage takes the synthesized netlist and the LEF');
  } else skip('chip-formats DEF reader not present');
}

console.log('DRC and LVS (HD.8) — KLayout and Netgen NOT installed: command lines + hand-written reports');
{
  const ds = drcSteps({ gds: 'counter.gds', deck: 'pdk.lydrc', top: 'counter' });
  ok(ds.steps[0].tool === 'klayout' && ds.steps[0].args.join(' ') === '-b -r pdk.lydrc -rd input=counter.gds -rd report=out/drc.lyrdb -rd topcell=counter', 'KLayout batch mode: -b -r <deck> -rd input= -rd report= -rd topcell=');
  const db = readLyrdb(`<?xml version="1.0" encoding="utf-8"?>
<report-database>
 <description>DRC for counter</description>
 <top-cell>counter</top-cell>
 <categories>
  <category><name>m1</name><description>Metal 1</description><categories>
   <category><name>width</name><description>Metal 1 width &lt; 0.14 µm</description><categories/></category>
  </categories></category>
  <category><name>m2.space</name><description>Metal 2 spacing &lt; 0.14 µm</description><categories/></category>
 </categories>
 <cells><cell><name>counter</name></cell><cell><name>DFF</name></cell></cells>
 <items>
  <item><category>'m1'.'width'</category><cell>DFF</cell><visited>false</visited><multiplicity>1</multiplicity><values><value>polygon: (1,1;1,1.1;2,1.1;2,1)</value></values></item>
  <item><category>'m2.space'</category><cell>counter</cell><multiplicity>1</multiplicity><values><value>edge-pair: (10,5;10,6)|(10.1,5;10.1,6)</value></values></item>
  <item><category>'m2.space'</category><cell>counter</cell><multiplicity>1</multiplicity><values><value>box: (20,20;21,22)</value></values></item>
 </items>
</report-database>`);
  ok(db.top === 'counter' && db.categories.map((c) => c.path).join() === 'm1,m1.width,m2.space' && db.items.length === 3 && db.items[0].category === 'm1.width', 'our .lyrdb reader: nested categories, cells, items');
  const rows = drcRows(db);
  ok(rows.length === 3 && rows[0].where.at[0] === 1.5 && Math.abs(rows[0].where.at[1] - 1.05) < 1e-9 && rows[0].about[0].id === 'DFF' && rows[1].where.at[0] === 10.05 && /Metal 2 spacing < 0\.14/.test(rows[1].text), 'DRC rows: the cell and the middle of the shapes, in µm (the units GDSIN draws in)');
  ok(drcSummary(db)[0].category === 'm2.space' && drcSummary(db)[0].count === 2, 'the summary counts per rule');
  ok(new Set(rows.map((r) => r.id)).size === 3, 'row ids are stable and distinct');
  const ls = lvsSteps({ layout: 'counter.ext.spice', layoutCell: 'counter', schematic: 'out/synth/netlist.spice', setup: 'pdk_setup.tcl' });
  ok(ls.steps[0].tool === 'netgen' && ls.steps[0].args.join('|') === '-batch|lvs|counter.ext.spice counter|out/synth/netlist.spice counter|pdk_setup.tcl|out/lvs.out|-json', 'Netgen: -batch lvs "<layout> <cell>" "<schematic> <cell>" setup out -json');
  const good = parseLvsText(`Subcircuit summary:
Circuit 1: counter                         |Circuit 2: counter
-------------------------------------------|-------------------------------------------
Number of devices: 18                      |Number of devices: 18
Number of nets: 24                         |Number of nets: 24
---------------------------------------------------------------------------------------
Netlists match uniquely.
Cell pin lists are equivalent.
Final result: Circuits match uniquely.
`);
  ok(good.match === true && good.unique && good.circuits[0].devices.join() === '18,18' && !lvsRows(good).length, 'a matching report: no Problems');
  const badR = parseLvsText(`Subcircuit summary:
Circuit 1: counter                         |Circuit 2: counter
Number of devices: 17 **Mismatch**         |Number of devices: 18 **Mismatch**
Number of nets: 24                         |Number of nets: 25 **Mismatch**
Netlists do not match.
Final result: Netlists do not match.
`);
  const br = lvsRows(badR);
  ok(badR.match === false && br.some((r) => r.code === 'chip.lvs.mismatch' && r.about[0].id === 'counter') && br.some((r) => r.code === 'chip.lvs.devices' && r.found.value === 17) && br.some((r) => r.code === 'chip.lvs.nets'), 'a mismatch: the cell, device and net counts with required/found');
  const js = parseLvsJson(JSON.stringify([{ name: ['DFF', 'DFF'], devices: [[['nfet', 12], ['pfet', 12]], [['nfet', 12], ['pfet', 12]]], nets: [14, 14], pins: [['C', 'D', 'Q'], ['C', 'D', 'Q']] }, { name: ['counter', 'counter'], devices: [[['DFF', 4]], [['DFF', 4]]], nets: [24, 24], badnets: [[[{ name: 'n3' }], [{ name: 'n3' }]]] }]));
  ok(js.circuits.length === 2 && js.circuits[0].match && !js.circuits[1].match && js.match === false, 'Netgen\'s -json shape (hand-written): per cell, bad nets make a mismatch');
}

console.log('the add-on copy (tools/chip/sync.mjs)');
{
  // this suite owns run/ and the run script; the other parts (hdl/, fmt/) are checked by their own suites (they may be mid-change)
  const { compare } = await import(path.join(ROOT, 'tools/chip/sync.mjs'));
  const rows = compare(['cadcraft']).filter((x) => x.file.startsWith('lib/run/') || x.file.startsWith('engine/'));
  ok(rows.length > 10 && rows.every((x) => x.state === 'ok'), 'the add-on carries lib/chip/run byte for byte and the run script (' + rows.length + ' files)', rows.filter((x) => x.state !== 'ok').map((x) => x.file + ' ' + x.state).join(', '));
  const others = compare(['cadcraft']).filter((x) => x.state !== 'ok' && !x.file.startsWith('lib/run/') && !x.file.startsWith('engine/'));
  if (others.length) console.log('    note: ' + others.length + ' files of the other parts differ from lib/chip (run node tools/chip/sync.mjs cadcraft)');
  const mods = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons/chip/lib/modules.json'), 'utf8')).panels;
  ok(mods.includes('./lib/run/panels.js'), 'modules.json lists the run panels: ' + mods.join(' '));
  ok(mods[0] === './lib/hdl/ui-source.js' && !mods.some((m) => /index\.js$/.test(m)), 'tab order starts with Source; no index.js (hdl exports allPanels there, so nothing mounts twice)');
  const chk = spawnSync(process.execPath, [path.join(ROOT, 'tools/chip/make-sample.mjs'), '--check'], { encoding: 'utf8' });
  ok(chk.status === 0, 'the sample (fixtures/showcase/chip-pebble) matches its sources: ' + chk.stdout.trim());
  const sidx = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons/chip/sample/index.json'), 'utf8'));
  ok(sidx.files.every((f) => !/\.(md|log)$/.test(f) && fs.existsSync(path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons/chip/sample', f))), 'the add-on\'s sample/ has every file of its index, none with a name the site refuses (.md, .log)');
  const sp = readProject(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/chip-pebble/chip-project.json'), 'utf8'));
  ok(sp.ok && sp.project.runs.some((r) => r.stage === 'synth' && /Yosys/.test(r.version)) && sp.project.runs.some((r) => r.stage === 'gls' && r.ok), 'the sample project carries its real run records (Yosys synthesis, a passing gate-level run)');
  // the core never imports GPL code: nothing in lib/chip/run imports outside lib/chip/run (relative imports only, node: built-ins in the script)
  const bad = [];
  for (const f of fs.readdirSync(RUN).filter((n) => n.endsWith('.js'))) for (const m of fs.readFileSync(path.join(RUN, f), 'utf8').matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)) if (!m[1].startsWith('./')) bad.push(f + ': ' + m[1]);
  for (const m of fs.readFileSync(path.join(RUN, 'driver/cc-chip-run.mjs'), 'utf8').matchAll(/^import[^'"]*['"]([^'"]+)['"]/gm)) if (!m[1].startsWith('node:')) bad.push('driver: ' + m[1]);
  ok(!bad.length, 'lib/chip/run imports only its own files; the run script only Node\'s', bad.join(', '));
  const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons/chip/lang/en.json'), 'utf8'));
  const used = new Set();
  for (const f of [...fs.readdirSync(RUN).filter((n) => n.endsWith('.js')).map((n) => path.join(RUN, n)), path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons/chip/main.js')]) for (const m of fs.readFileSync(f, 'utf8').matchAll(/t\('(chip\.[a-z0-9_.]+[a-z0-9])'/gi)) used.add(m[1]);
  const missing = [...used].filter((k) => !(k in en));
  ok(!missing.length, 'every string the runners and the shell use is in lang/en.json (' + used.size + ')', missing.join(', '));
}

console.log(`\n${pass} passed, ${fail} failed, ${skipped} skipped`);
process.exit(fail ? 1 : 0);
