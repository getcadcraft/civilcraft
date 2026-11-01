/* SPDX-License-Identifier: Apache-2.0 */
/**
 * engines.js — the process engine interface (0.8 Track CH, CH.7; DOM-free). A flowsheet can be solved by ours or by another engine that is
 * allowed (rule 43: nothing GPL, LGPL or AGPL, in any form, including as a program Studio would launch). The other engine's answer is read back
 * into the same model: its streams are checked, re-flashed with OUR thermodynamics so they are complete, and put through OUR balance report,
 * so a wrong answer from any engine shows up as Problems instead of as a number.
 *
 *   checkLicense(spdx)                  → { ok, reason }   permissive licences only (MIT, BSD-2/3-Clause, Apache-2.0, ISC, Zlib, Unlicense, CC0-1.0)
 *   createRegistry(extra?)              → { register(engine), list(), get(id), usable(id) }   `ours` is always there
 *   makeCase(def, engineId, request)    → the case file (`cadcraft-process-case` v1) a program engine reads
 *   readBack(def, output, { engineId }) → { result, problems }  validated, completed and balance-checked
 *   solveWith(def, engineId, { registry, host }) → { result, problems, engine }   host.runProgram(job) asks Studio to run the installed program
 *   compare(a, b, tol)                  → [{ stream, prop, a, b, rel }] where two results differ by more than tol
 *
 * An engine record: { id, name, license (SPDX), kind: 'builtin'|'program', program?: { exe: 'python', script, requires: [packages] }, caps: [...], solve?(def) }
 * A program engine runs ONLY through Studio's installed-programs path (RE.3): the page names the engine id and hands over the case; it never builds a
 * command line, and the script is the one shipped inside Studio (tools/process/engines/<script>). The output file is `cadcraft-process-result` v1:
 *   { format, version: 1, engine, streams: { id: { T (K), P (Pa), F (mol/s), z: { component: mole fraction } } }, units?: { id: { Q, W } }, notes?: [] }
 */
import { solve, thermoFor } from './flowsheet.js';
import { balanceReport, problem } from './report.js';
import { fromFlash } from './stream.js';

export const PERMISSIVE = ['MIT', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 'ISC', 'Zlib', 'Unlicense', 'CC0-1.0'];
export function checkLicense(spdx) {
  const s = String(spdx || '').trim();
  if (!s) return { ok: false, reason: 'no licence is given' };
  if (/\b(A|L)?GPL\b|GPL-|AGPL|LGPL/i.test(s)) return { ok: false, reason: s + ' is a GPL-family licence (rule 43: not linked, bundled or launched)' };
  const ok = s.split(/\s+AND\s+/i).every((part) => part.replace(/[()]/g, '').split(/\s+OR\s+/i).some((t) => PERMISSIVE.includes(t.trim())));
  return ok ? { ok: true, reason: '' } : { ok: false, reason: s + ' is not on the permissive list (' + PERMISSIVE.join(', ') + ')' };
}

export const BUILTIN = [
  { id: 'ours', name: 'CadCraft process engine', license: 'Apache-2.0', kind: 'builtin', caps: ['flowsheet', 'equilibrium'], solve: (def) => solve(def) },
  { id: 'cantera', name: 'Cantera', license: 'BSD-3-Clause', kind: 'program', program: { exe: 'python', script: 'cc_cantera_equilibrate.py', requires: ['cantera'] }, caps: ['equilibrium'], note: 'Reads a mechanism file the person loads; only single-stream equilibrium is asked of it.' },
  { id: 'idaes', name: 'IDAES with Pyomo', license: 'IDAES-PSE (BSD-style terms, not yet confirmed)', kind: 'program', program: { exe: 'python', script: 'cc_idaes_flowsheet.py', requires: ['idaes', 'pyomo'] }, caps: ['flowsheet'], note: 'Held back until the licence text is confirmed to be permissive.' },
];

export function createRegistry(extra = []) {
  const engines = new Map();
  const reg = {
    register(e) {
      if (!e || !/^[a-z][a-z0-9-]{1,30}$/.test(String(e.id))) throw new Error('an engine needs an id of lower-case letters, digits and hyphens');
      const lic = checkLicense(e.license);
      engines.set(e.id, { ...e, allowed: lic.ok, why: lic.reason });
      return engines.get(e.id);
    },
    list: () => [...engines.values()].map(({ solve: _s, ...e }) => e),
    get: (id) => engines.get(id) || null,
    usable: (id) => { const e = engines.get(id); return !!(e && e.allowed); },
  };
  for (const e of [...BUILTIN, ...extra]) reg.register(e);
  return reg;
}

export function makeCase(def, engineId, request = { type: 'flowsheet' }) {
  return { format: 'cadcraft-process-case', version: 1, engine: engineId, request, thermo: def.thermo, feeds: def.feeds, units: def.units.map((u) => ({ id: u.id, type: u.type, in: u.in, out: u.out || [], p: u.p || {} })) };
}

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
/** An engine's output → a full result of ours, or problems saying why not. */
export function readBack(def, output, { engineId = 'engine', tol = {} } = {}) {
  const problems = [], th = thermoFor(def), SRC = { engine: engineId };
  const bad = (code, text, id) => problems.push(problem('engine.' + code, 'error', text, id ? [{ kind: 'stream', id }] : [], SRC));
  if (output && typeof output.error === 'string') { bad('failed', engineId + ' said: ' + output.error.slice(0, 200)); return { result: null, problems }; }
  if (!output || output.format !== 'cadcraft-process-result' || output.version !== 1) { bad('format', engineId + ' did not return a cadcraft-process-result file.'); return { result: null, problems }; }
  const streams = {}, ids = th.ids;
  for (const [id, s] of Object.entries(output.streams && typeof output.streams === 'object' ? output.streams : {})) {
    if (!fin(s.T) || !fin(s.P) || !fin(s.F) || s.F < 0 || s.T < 1 || s.T > 5000 || s.P <= 0) { bad('stream', `${engineId} gave stream ${id} an impossible T, P or flow.`, id); continue; }
    const extra = Object.keys(s.z || {}).filter((k) => !ids.includes(k));
    if (extra.length) { bad('component', `${engineId} gave stream ${id} components that are not in the package (${extra.join(', ')}).`, id); continue; }
    let z = ids.map((c) => (fin(s.z?.[c]) && s.z[c] > 0 ? s.z[c] : 0)); const sum = z.reduce((a, b) => a + b, 0);
    if (s.F > 0 && Math.abs(sum - 1) > 1e-4) { bad('composition', `${engineId} gave stream ${id} mole fractions that sum to ${sum.toPrecision(5)}.`, id); continue; }
    z = z.map((v) => v / (sum || 1));
    streams[id] = s.F > 0 ? fromFlash(s.F, th.flashPT(s.T, s.P, z), id) : { id, F: 0, z, T: s.T, P: s.P, H: 0, S: 0, vf: 0, state: 'empty', phases: [] };
  }
  const need = new Set(def.units.flatMap((u) => u.out || []));
  for (const id of need) if (!streams[id]) bad('missing', `${engineId} did not return stream ${id}.`, id);
  if (problems.length) return { result: null, problems };
  const units = {}; for (const u of def.units) { const o = (output.units || {})[u.id] || {}; units[u.id] = { type: u.type, Q: fin(o.Q) ? o.Q : 0, W: fin(o.W) ? o.W : 0, notes: [] }; }
  const result = { converged: true, iterations: 0, streams, units, tears: [], order: [def.units.map((u) => u.id)], problems: [], engine: engineId };
  const rep = balanceReport(th, def, result, tol); result.report = rep;
  // the engine's own heat and work are taken as given, so an energy mismatch is the engine's duty being inconsistent with its streams
  result.problems = rep.problems.map((p) => ({ ...p, text: engineId + ': ' + p.text, source: { kind: 'engine', name: engineId } }));
  return { result, problems: result.problems };
}

export function compare(a, b, tol = { T: 0.5, P: 1e-3, F: 1e-4, x: 1e-3 }) {
  const out = [];
  for (const id of Object.keys(a.streams)) {
    const s = a.streams[id], t = b.streams[id]; if (!t) { out.push({ stream: id, prop: 'missing' }); continue; }
    const chk = (prop, x, y, abs, rel) => { const d = Math.abs(x - y); if (d > abs && (rel == null || d > rel * Math.max(Math.abs(x), Math.abs(y)))) out.push({ stream: id, prop, a: x, b: y, rel: d / (Math.abs(x) || 1) }); };
    chk('T', s.T, t.T, tol.T); chk('P', s.P, t.P, 0, tol.P); chk('F', s.F, t.F, 1e-12, tol.F);
    s.z.forEach((z, i) => chk('x' + i, z, t.z[i], tol.x));
  }
  return out;
}

/** Solve with a chosen engine. A program engine needs Studio's host.runProgram({ engine, case }) → Promise<output>. */
export async function solveWith(def, engineId = 'ours', { registry = createRegistry(), host = null } = {}) {
  const e = registry.get(engineId);
  if (!e) return { result: null, problems: [problem('engine.unknown', 'error', 'There is no engine called ' + engineId + '.', [], { engine: engineId })], engine: engineId };
  if (!e.allowed) return { result: null, problems: [problem('engine.licence', 'error', `${e.name} is not offered: ${e.why}.`, [], { engine: engineId })], engine: engineId };
  if (e.kind === 'builtin') { const r = e.solve(def); return { result: r, problems: r.problems, engine: engineId }; }
  if (!host || typeof host.runProgram !== 'function') return { result: null, problems: [problem('engine.needs-studio', 'warning', `${e.name} runs as a program installed on this computer, which only CadCraft Studio can start. Open the file in Studio.`, [], { engine: engineId })], engine: engineId };
  let out;
  try { out = await host.runProgram({ engine: engineId, program: e.program, case: makeCase(def, engineId) }); }
  catch (err) { return { result: null, problems: [problem('engine.failed', 'error', `${e.name} could not be run: ${String(err && err.message || err).slice(0, 200)}`, [], { engine: engineId })], engine: engineId }; }
  const r = readBack(def, out, { engineId });
  return { ...r, engine: engineId };
}

/**
 * Studio's side of `host.runProgram` (0.8 CH.7, owner 2026-10-29): `desktop` is CadCraft Studio's bridge (`window.cadcraftDesktop`); the case goes to its engines (`engines.start`, which only
 * runs an engine in Studio's own table — Cantera behind the `cantera` build feature — through the shipped script), the job is polled, and the result file comes back as JSON.
 *   const host = studioHost(window.cadcraftDesktop);  await solveWith(def, 'cantera', { host });
 * Nothing from the page is a path or an argument: the engine id and the case's bytes only. Errors from the runner (`cantera_missing`, `script_failed`, `timed_out`…) come back as text.
 */
export function studioHost(desktop, { pollMs = 400, timeoutMs = 10 * 60 * 1000, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  return {
    async runProgram({ engine, case: caseDoc }) {
      if (!desktop || !desktop.engines || typeof desktop.engines.start !== 'function') throw new Error('this is not CadCraft Studio: it cannot run an installed program');
      const found = typeof desktop.engines.find === 'function' ? await desktop.engines.find(engine) : null;
      if (found && found.found === false) throw new Error(`${found.name || engine} is not available on this computer (${found.why || 'not_found'})`);
      const job = await desktop.engines.start(engine, new TextEncoder().encode(JSON.stringify(caseDoc)));
      const t0 = Date.now();
      for (;;) {
        const s = await desktop.engines.status(job);
        if (s.state === 'done') break;
        if (s.state === 'failed' || s.state === 'cancelled') throw new Error(`${engine} ${s.state}${s.error ? ': ' + s.error : ''}`);
        if (Date.now() - t0 > timeoutMs) { try { await desktop.engines.cancel(job); } catch { /* it may already be gone */ } throw new Error(`${engine} did not answer in time`); }
        await sleep(pollMs);
      }
      const bytes = await desktop.engines.result(job);
      return JSON.parse(new TextDecoder().decode(bytes));
    },
  };
}
