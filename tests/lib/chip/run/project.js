/* SPDX-License-Identifier: Apache-2.0 */
/**
 * project.js — the Chip design project: the flow as data (0.9 HD.4–HD.9, docs/0.8-PART8.md § 3 "Flow as data"). DOM-free, no imports.
 *
 * A project is one JSON file (`chip-project.json`) next to the design files:
 *   { format: 'cadcraft-chip-project', version: 1, name, top, testbench,
 *     tools: { folder, pdk, versions: { yosys: 'Yosys 0.9 …', … } },        folder/pdk: where the person's own tools and PDK live (Studio only)
 *     stages: [ { id, kind, tool, enabled, options: {…} } ],                kind: sim | synth | pnr | drc | lvs | gls | stil
 *     runs: [ { id, stage, tool, version, at, ok, cmd: [[program, …args]], inputs: {name: sha256}, outputs: {name: sha256}, ms } ] }
 * Every run keeps the hashes of what went in and what came out, so `repeatable(project, stage, files)` can say whether running the stage
 * again would see the same inputs, and two runs can be compared file by file.
 *
 *   newProject({ name, top }) → project          readProject(text|object) → { ok, project, problems[] }     writeProject(p) → text
 *   STAGE_KINDS · defaultStages() · stageInputs(project, stage, fileNames) → [names]
 *   sha256(bytes) → Promise<hex>                 hashFiles({name: bytes|string}) → Promise<{name: hex}>
 *   recordRun(project, run) → run (kept, newest last, 50 per stage at most)
 *   lastRun(project, stageId) · repeatable(project, stageId, hashes) → { same, changed[], added[], removed[] }
 */

export const FORMAT = 'cadcraft-chip-project';
export const STAGE_KINDS = Object.freeze(['sim', 'synth', 'pnr', 'drc', 'lvs', 'gls', 'stil']);
const TOOLS_FOR = { sim: ['icarus', 'verilator'], synth: ['yosys'], pnr: ['openroad'], drc: ['klayout'], lvs: ['netgen'], gls: ['icarus'], stil: ['icarus'] };
const ID_RE = /^[a-z][a-z0-9-]{0,31}$/;
const NAME_RE = /^[A-Za-z0-9_][A-Za-z0-9_.+-]*(\/[A-Za-z0-9_][A-Za-z0-9_.+-]*)*$/;
export const safeName = (n) => typeof n === 'string' && n.length <= 160 && NAME_RE.test(n);

export function defaultStages() {
  return [
    { id: 'sim', kind: 'sim', tool: 'icarus', enabled: true, options: {} },
    { id: 'synth', kind: 'synth', tool: 'yosys', enabled: true, options: {} },
    { id: 'pnr', kind: 'pnr', tool: 'openroad', enabled: false, options: {} },
    { id: 'drc', kind: 'drc', tool: 'klayout', enabled: false, options: {} },
    { id: 'lvs', kind: 'lvs', tool: 'netgen', enabled: false, options: {} },
    { id: 'gls', kind: 'gls', tool: 'icarus', enabled: false, options: {} },
    { id: 'stil', kind: 'stil', tool: 'icarus', enabled: false, options: {} },
  ];
}

export function newProject({ name = 'chip', top = '', testbench = '' } = {}) {
  return { format: FORMAT, version: 1, name: String(name).slice(0, 80), top, testbench, tools: { folder: '', pdk: '', versions: {} }, stages: defaultStages(), runs: [] };
}

const str = (v, max = 400) => (typeof v === 'string' ? v.slice(0, max) : '');
const plainOptions = (o) => {
  const out = {};
  if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
  for (const [k, v] of Object.entries(o).slice(0, 60)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,31}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 20000);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'boolean') out[k] = v;
    else if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === 'string').slice(0, 200).map((x) => x.slice(0, 400));
  }
  return out;
};
const hashMap = (m) => {
  const out = {};
  if (m && typeof m === 'object') for (const [k, v] of Object.entries(m).slice(0, 2000)) if (safeName(k) && /^[0-9a-f]{64}$/.test(String(v))) out[k] = v;
  return out;
};

/** A project read from a file is untrusted: every field is checked, bad parts left out and named in `problems`. */
export function readProject(src) {
  const problems = [];
  let j = src;
  if (typeof src === 'string') { try { j = JSON.parse(src); } catch { return { ok: false, project: null, problems: ['not_json'] }; } }
  if (!j || typeof j !== 'object' || j.format !== FORMAT) return { ok: false, project: null, problems: ['not_a_project'] };
  if (!(j.version >= 1)) problems.push('version');
  if (j.version > 1) return { ok: false, project: null, problems: ['newer_version'] };
  const p = newProject({ name: str(j.name, 80) || 'chip', top: str(j.top, 120), testbench: str(j.testbench, 120) });
  const t = j.tools || {};
  p.tools = { folder: str(t.folder, 1000), pdk: str(t.pdk, 1000), versions: {} };
  if (t.versions && typeof t.versions === 'object') for (const [k, v] of Object.entries(t.versions).slice(0, 20)) if (/^[a-z-]{2,20}$/.test(k)) p.tools.versions[k] = str(v, 200);
  if (Array.isArray(j.stages)) {
    p.stages = [];
    for (const s of j.stages.slice(0, 40)) {
      if (!s || !ID_RE.test(s.id) || !STAGE_KINDS.includes(s.kind)) { problems.push('stage'); continue; }
      const tool = TOOLS_FOR[s.kind].includes(s.tool) ? s.tool : TOOLS_FOR[s.kind][0];
      if (p.stages.some((x) => x.id === s.id)) { problems.push('stage_twice'); continue; }
      p.stages.push({ id: s.id, kind: s.kind, tool, enabled: s.enabled !== false, options: plainOptions(s.options) });
    }
  }
  if (Array.isArray(j.runs)) {
    for (const r of j.runs.slice(-400)) {
      if (!r || !ID_RE.test(String(r.stage))) { problems.push('run'); continue; }
      p.runs.push({ id: str(r.id, 40), stage: r.stage, tool: str(r.tool, 20), version: str(r.version, 200), at: str(r.at, 40), ok: !!r.ok, ms: Number(r.ms) || 0,
        cmd: Array.isArray(r.cmd) ? r.cmd.slice(0, 20).map((c) => (Array.isArray(c) ? c.slice(0, 80).map((a) => str(a, 400)) : [])) : [],
        inputs: hashMap(r.inputs), outputs: hashMap(r.outputs) });
    }
  }
  return { ok: true, project: p, problems };
}

export const writeProject = (p) => JSON.stringify(p, null, 2) + '\n';
export const stage = (p, id) => p.stages.find((s) => s.id === id) || null;
export const toolsFor = (kind) => (TOOLS_FOR[kind] || []).slice();

const HDL = /\.(v|sv|vh|svh|vhd|vhdl)$/i;
/** Which project files a stage reads (what gets hashed and packed). */
export function stageInputs(p, st, names) {
  const o = st.options || {};
  const pick = (re) => names.filter((n) => re.test(n));
  const named = (k) => [].concat(o[k] || []).filter((n) => names.includes(n));
  switch (st.kind) {
    case 'sim': return pick(HDL).filter((n) => !/^(out|runs)\//.test(n));
    case 'synth': return [...new Set([...pick(HDL).filter((n) => n !== p.testbench && !named('exclude').includes(n)), ...pick(/\.(lib|ys|tcl)$/i).filter((n) => named('liberty').includes(n) || named('script').includes(n))])];
    case 'pnr': return [...new Set([...pick(/\.(lef|lib|sdc|tcl)$/i), ...named('netlist'), ...named('def')])];
    case 'drc': return [...new Set([...named('gds'), ...named('deck')])];
    case 'lvs': return [...new Set([...named('layout'), ...named('schematic'), ...named('setup')])];
    case 'gls': case 'stil': return [...new Set([...named('netlist'), ...named('cells'), ...named('sdf'), ...(p.testbench && names.includes(p.testbench) ? [p.testbench] : []), ...pick(/\.(vh|svh)$/i)])];
    default: return [];
  }
}

const enc = new TextEncoder();
export async function sha256(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : enc.encode(String(bytes));
  const d = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', b));
  return [...d].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export async function hashFiles(files) {
  const out = {};
  for (const [k, v] of Object.entries(files)) out[k] = await sha256(v);
  return out;
}

export function recordRun(p, run) {
  const r = { id: run.id || Date.now().toString(36), stage: run.stage, tool: run.tool || '', version: run.version || '', at: run.at || new Date().toISOString(), ok: !!run.ok, ms: run.ms || 0, cmd: run.cmd || [], inputs: hashMap(run.inputs), outputs: hashMap(run.outputs) };
  p.runs.push(r);
  const mine = p.runs.filter((x) => x.stage === r.stage);
  if (mine.length > 50) { const drop = new Set(mine.slice(0, mine.length - 50)); p.runs = p.runs.filter((x) => !drop.has(x)); }
  return r;
}
export const lastRun = (p, stageId) => [...p.runs].reverse().find((r) => r.stage === stageId) || null;

export function repeatable(p, stageId, hashes) {
  const last = lastRun(p, stageId);
  if (!last) return { same: false, changed: [], added: Object.keys(hashes), removed: [], last: null };
  const changed = [], added = [], removed = [];
  for (const [k, v] of Object.entries(hashes)) { if (!(k in last.inputs)) added.push(k); else if (last.inputs[k] !== v) changed.push(k); }
  for (const k of Object.keys(last.inputs)) if (!(k in hashes)) removed.push(k);
  return { same: !changed.length && !added.length && !removed.length, changed, added, removed, last };
}
