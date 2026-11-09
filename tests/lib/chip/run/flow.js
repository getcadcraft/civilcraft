/* SPDX-License-Identifier: Apache-2.0 */
/**
 * flow.js — one stage of a Chip design project from plan to result (0.9 HD.4–HD.9). DOM-free.
 *
 *   planStage(project, stage, files) → { steps, extra, collect, inputs: [names], waves, problems: [text] }
 *       files = { name: Uint8Array | string } (the project's files); the stage's options say which of them it uses
 *   runStage({ project, stage, files, runner, script, signal, onProgress }) → { ok, record, run, files (out), rows, summary, waves, layout }
 *       hashes the inputs (SHA-256), packs them with the steps (runner.js makePackage), runs them through `runner.run` (Studio's bridge),
 *       reads the results back and records the run in the project with input and output hashes and each tool's version
 *   readStage(stage, out, record, { fmt }) → { rows, summary, waves (VCD text), layout (defShapes result) }
 *       fmt = chip-formats' modules when present ({ def: { readDef, defShapes }, lef: { readLef, lefModel }, lefTexts: [text], stil: { writeStil } })
 *
 * Stage options (stage.options; every name a project file unless said):
 *   sim   testbench (module), tool icarus|verilator, defines {}, plusargs []
 *   synth liberty, script (.ys), period (ns, number), flatten (bool), exclude []
 *   pnr   lefs [], libs [], netlist (default out/netlist.v from synth: a project file the person saved), sdc, def, site, utilization,
 *         aspect, coreSpace, hLayers, vLayers, density, route global|detailed|none, rcx, script (.tcl)
 *   drc   gds, deck, top, vars {}
 *   lvs   layout, layoutCell, schematic, schematicCell, setup
 *   gls   netlist, cells [], sdf, dut (instance path), corner
 *   stil  as gls (or the RTL design when no netlist) + period (dump units), strobe, inputs [], outputs [], scope
 */
import { simSteps, findTestbenches, parseSimLog, simSummary } from './sim.js';
import { synthSteps, parseStat, parseTiming, parseYosysLog } from './synth.js';
import { pnrSteps, parseOpenroadLog, pnrRows } from './pnr.js';
import { drcSteps, readLyrdb, drcRows, drcSummary } from './drc.js';
import { lvsSteps, parseLvsText, parseLvsJson, lvsRows } from './lvs.js';
import { glsSteps, parseGlsLog, stilPlan } from './gls.js';
import { readVcd } from './vcd.js';
import { stageInputs, hashFiles, recordRun } from './project.js';
import { makePackage } from './runner.js';
import { parseVersion } from './tools.js';
import { row } from './rows.js';

const dec = new TextDecoder();
const text = (v) => (v === undefined || v === null ? '' : typeof v === 'string' ? v : dec.decode(v));
const list = (v) => [].concat(v || []).filter(Boolean);
const TOOL_OF = { iverilog: 'iverilog', vvp: 'iverilog', verilator: 'verilator', yosys: 'yosys', openroad: 'openroad', klayout: 'klayout', netgen: 'netgen' };

export function planStage(project, stage, files) {
  const names = Object.keys(files);
  const o = stage.options || {};
  const problems = [];
  const has = (n) => n && names.includes(n);
  const need = (k, label) => { for (const n of list(o[k])) if (!has(n)) problems.push(`${label}: ${n} is not a project file`); if (!list(o[k]).length) problems.push(`${label}: not set`); };
  let plan = { steps: [], extra: {}, collect: ['out/'], waves: '' };
  let synthFiles = null, simFiles = null;
  // cell models of the PDK (a stage's `cells`, used by gate-level sim) are not part of the design: not synthesized, not in RTL sim
  const cellModels = new Set(project.stages.flatMap((x) => list(x.options?.cells)));
  const more = [];   // inputs a stage found itself (the testbench's file)
  const srcTexts = Object.fromEntries(names.filter((n) => /\.(s?v)$/i.test(n)).map((n) => [n, text(files[n])]));
  switch (stage.kind) {
    case 'sim': {
      const tbs = findTestbenches(srcTexts);
      const top = o.testbench || project.testbench || tbs[0]?.name;
      const tb = tbs.find((t) => t.name === top);
      if (!top) problems.push('testbench: no module without ports that has an initial block');
      else { simFiles = stageInputs(project, stage, names).filter((n) => !cellModels.has(n)); plan = simSteps({ tool: stage.tool, files: simFiles, top, defines: o.defines || {}, plusargs: list(o.plusargs), dumps: !!tb?.dumps, timescale: tb?.timescale || '' }); }
      break;
    }
    case 'synth': {
      if (!project.top) problems.push('top: the project has no top module');
      if (o.liberty && !has(o.liberty)) problems.push('liberty: ' + o.liberty + ' is not a project file');
      // the testbench files are not synthesized: every file whose modules are all testbenches (findTestbenches), and the project's testbench
      const tbs = findTestbenches(srcTexts), tbNames = new Set(tbs.map((x) => x.name));
      const tbFiles = new Set(Object.entries(srcTexts).filter(([n, s]) => { const mods = [...String(s).replace(/\/\/[^\n]*/g, '').matchAll(/\bmodule\s+([A-Za-z_][\w$]*)/g)].map((m) => m[1]); return mods.length && mods.every((m) => tbNames.has(m)); }).map(([n]) => n));
      const tbOf = tbs.find((x) => x.name === project.testbench);
      if (tbOf) tbFiles.add(tbOf.file);
      synthFiles = names.filter((n) => /\.(s?v)$/i.test(n) && !/^out\//.test(n) && !tbFiles.has(n) && !cellModels.has(n) && !list(o.exclude).includes(n)).sort();   // sorted: the same script (and hash) whatever order the files came in
      if (!problems.length) plan = synthSteps({ files: synthFiles, top: project.top, liberty: o.liberty || '', period: Number(o.period) || 0, flatten: o.flatten !== false, script: has(o.script) ? o.script : '' });
      break;
    }
    case 'pnr': {
      if (!o.script) { need('lefs', 'LEF files'); if (!o.def) need('netlist', 'netlist'); }
      if (!problems.length) plan = pnrSteps({ ...o, lefs: list(o.lefs), libs: list(o.libs), top: project.top, script: has(o.script) ? o.script : '' });
      break;
    }
    case 'drc': need('gds', 'layout'); need('deck', 'DRC deck'); if (!problems.length) plan = drcSteps({ gds: o.gds, deck: o.deck, top: o.top || project.top, vars: o.vars || {} }); break;
    case 'lvs': need('layout', 'layout netlist'); need('schematic', 'schematic netlist'); need('setup', 'setup file'); if (!problems.length) plan = lvsSteps({ ...o, layoutCell: o.layoutCell || project.top }); break;
    case 'gls': case 'stil': {
      const tbs = findTestbenches(srcTexts);
      const top = o.testbench || project.testbench || tbs[0]?.name;
      const tb = tbs.find((t) => t.name === top);
      if (!top || !tb) { problems.push('testbench: not found'); break; }
      more.push(tb.file);
      if (stage.kind === 'gls' || o.netlist) {
        need('netlist', 'netlist');
        if (o.sdf && !has(o.sdf)) problems.push('SDF: ' + o.sdf + ' is not a project file');
        if (!problems.length) plan = glsSteps({ netlist: o.netlist, cells: list(o.cells), testbench: tb.file, top, dut: o.dut || '', sdf: o.sdf || '', timescale: tb.timescale, corner: o.corner || 'max' });
      } else plan = simSteps({ tool: 'icarus', files: stageInputs(project, { ...stage, kind: 'sim' }, names), top, dumps: tb.dumps, timescale: tb.timescale });
      break;
    }
    default: problems.push('unknown stage ' + stage.kind);
  }
  const base = simFiles ? [...simFiles, ...names.filter((n) => /\.(vh|svh)$/i.test(n) && !/^out\//.test(n))] : synthFiles ? [...synthFiles, ...names.filter((n) => /\.(vh|svh)$/i.test(n) && !/^out\//.test(n)), ...[o.liberty, o.script].filter(Boolean)] : stageInputs(project, stage, names);
  const inputs = [...new Set([...base, ...more, ...list(o.cells), ...list(o.lefs), ...list(o.libs)].filter(has))];
  return { ...plan, inputs, problems };
}

export function readStage(stage, out, record, { fmt = {} } = {}) {
  const logs = Object.keys(out).filter((n) => /^out\/log-\d+/.test(n)).sort().map((n) => text(out[n])).join('\n');
  const res = { rows: [], summary: {}, waves: '', layout: null };
  const notFound = (record?.steps || []).filter((s) => s.code === 127);
  for (const s of notFound) res.rows.push(row({ source: stage.kind, code: 'tool.missing', severity: 'error', vars: { tool: s.tool }, text: `${s.tool} was not found on this computer. Install it, or set the tools folder in the Chip design panel.`, key: 'missing:' + s.tool }));
  switch (stage.kind) {
    case 'sim': {
      res.rows.push(...parseSimLog(logs, stage.tool));
      res.summary = simSummary(logs);
      res.waves = text(out['out/wave.vcd']);
      break;
    }
    case 'synth': {
      const log = text(out['out/yosys.log']) || logs;
      res.rows.push(...parseYosysLog(log, { period: Number(stage.options?.period) || 0 }));
      res.summary = { stat: parseStat(text(out['out/stat.txt']) || log), timing: parseTiming(log) };
      break;
    }
    case 'pnr': {
      const p = parseOpenroadLog(text(out['out/openroad.log']) || logs);
      res.rows.push(...pnrRows(p));
      res.summary = p;
      const def = text(out['out/final.def']);
      if (def && fmt.def?.readDef) {
        const d = fmt.def.readDef(def);
        let lef;
        if (fmt.lef?.readLef && fmt.lef?.lefModel && fmt.lefTexts?.length) {   // every LEF of the stage, read as one library (tech LEF first)
          try { lef = fmt.lef.lefModel(fmt.lefTexts.flatMap((t) => fmt.lef.readLef(t).tree)); } catch { lef = undefined; }
        }
        res.layout = fmt.def.defShapes ? fmt.def.defShapes(d.def, lef) : null;
        res.summary.defProblems = (d.problems || []).length;
      } else if (def) res.summary.layoutNote = 'no_def_reader';
      break;
    }
    case 'drc': {
      const db = out['out/drc.lyrdb'] ? readLyrdb(text(out['out/drc.lyrdb'])) : null;
      if (db) { res.rows.push(...drcRows(db)); res.summary = { top: db.top, count: db.items.length, categories: drcSummary(db) }; }
      else res.summary = { count: null };
      break;
    }
    case 'lvs': {
      let r = null;
      if (out['out/lvs.json']) { try { r = parseLvsJson(text(out['out/lvs.json'])); } catch { r = null; } }
      if (!r && out['out/lvs.out']) r = parseLvsText(text(out['out/lvs.out']));
      if (r) { res.rows.push(...lvsRows(r)); res.summary = r; }
      break;
    }
    case 'gls': case 'stil': {
      res.rows.push(...parseGlsLog(logs));
      res.waves = text(out['out/gls.vcd'] || out['out/wave.vcd']);
      break;
    }
  }
  return res;
}

/** Test patterns from a stage's waves: the plan (gls.js stilPlan), then chip-formats' STIL writer (fmt/stil.js writeStil) when present.
 *  The dump's times become ns; an input that is x or z at its drive time is written as 0 and counted in `unknownDrives`; a signal named in
 *  `clock` is written as a pulse (P) in the middle of the period. → { plan, stil: { text, problems } | null, unknownDrives } */
export function stilFrom(vcdText, opts, fmt = {}) {
  const v = readVcd(vcdText);
  const plan = stilPlan(v, opts);
  const write = fmt.stil?.writeStil;
  const toNs = (v.timescale?.seconds || 1e-9) / 1e-9;
  let unknownDrives = 0;
  const nIn = plan.signals.filter((s) => s.dir === 'in').length;
  const clocks = new Set([].concat(opts.clock || []));
  const signals = plan.signals.map((s) => ({ name: s.name, dir: s.dir === 'in' ? 'In' : 'Out', ...(clocks.has(s.name) ? { clock: { rise: plan.period * toNs * 0.25, fall: plan.period * toNs * 0.75 } } : {}) }));
  const vectors = plan.vectors.map((x) => {
    let ins = '';
    for (let i = 0; i < nIn; i++) { const c = x.in[i]; if (clocks.has(signals[i].name)) ins += 'P'; else if (c === 'N') { unknownDrives++; ins += '0'; } else ins += c; }
    return ins + x.out;
  });
  const stil = typeof write === 'function' ? write({ title: opts.title || 'CadCraft patterns', signals, period: plan.period * toNs, drive: 0, strobe: plan.strobe * toNs, vectors, date: opts.date }) : null;
  return { plan, stil, unknownDrives };
}

export async function runStage({ project, stage, files, runner, script, toolsDir = project.tools?.folder || '', pdkDir = project.tools?.pdk || '', signal = null, onProgress = null, fmt = {} }) {
  const plan = planStage(project, stage, files);
  if (plan.problems.length) return { ok: false, planned: plan, rows: plan.problems.map((p, i) => row({ source: stage.kind, code: 'plan', severity: 'error', vars: { what: p }, text: p, key: 'plan:' + i })), files: {}, record: null };
  const inputs = Object.fromEntries(plan.inputs.map((n) => [n, files[n]]));
  const hashes = await hashFiles({ ...inputs, ...plan.extra });
  const pkg = makePackage({ files: { ...inputs, ...plan.extra }, steps: plan.steps, collect: plan.collect, toolsDir, pdkDir, script });
  const t0 = Date.now();
  const { files: out, record } = await runner.run(pkg, { signal, onProgress });
  const read = readStage(stage, out, record, { fmt });
  const versions = {};
  for (const s of record?.steps || []) {
    const t = TOOL_OF[s.tool];
    if (t && out[s.log]) { const v = parseVersion(t, text(out[s.log])); if (v) versions[t] = v; }
  }
  const outHashes = await hashFiles(Object.fromEntries(Object.entries(out).filter(([n]) => !/^out\/log-/.test(n))));
  const run = recordRun(project, {
    stage: stage.id, tool: stage.tool, version: versions[stage.tool === 'icarus' ? 'iverilog' : stage.tool] || project.tools?.versions?.[stage.tool] || '',
    ok: !!record?.ok && !read.rows.some((r) => r.severity === 'error'), ms: Date.now() - t0,
    cmd: plan.steps.map((s) => [s.tool, ...s.args]), inputs: hashes, outputs: outHashes,
  });
  return { ok: run.ok, planned: plan, record, run, files: out, ...read };
}
