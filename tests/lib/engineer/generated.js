/* SPDX-License-Identifier: Apache-2.0 */
/**
 * generated.js — the Generated feature: a script that adds a body to the part (0.8 CE.3, Track CE; DOM-free).
 *
 *   generated { script: { lang, text }, inputs: { <name>: number|string|boolean }, op: 'add'|'cut'|'intersect', up: 'z'|'y',
 *               gen: null | { id, hash }, mesh, report, ran, sheet, problems, log }
 *     script: the generator (CraftScript, Lua or Python); its header comments declare the inputs (below). inputs: the values
 *     the part was run with (a name left out takes the header's default). gen: which shipped / add-on generator it came from and
 *     the hash of its text then (null for a script written here). mesh / report: the body the last run made, kept in the file
 *     exactly like a body from a mesh (meshimport.js encodeMesh, repaired), so a part opens, rebuilds and prints without running
 *     any script (opening a part never runs its scripts). ran: the key (below) of the script + inputs that made `mesh`; the
 *     feature is "stale" when it no longer matches. sheet: the data sheet rows the run returned. log: the first lines it printed.
 *   The file stays byte-identical for the same script and inputs (rule D2): no times, no counters, nothing from the clock.
 *
 * The script's contract: inputs are variables already set when it starts; it leaves `body` (a surface mesh, e.g. from to_body)
 * and may leave `sheet` (a struct; each field a number, a text, or a struct { value, unit, ref, note }) and `problems` (the cell
 * mfg_check returns: what a manufacturing check found, kept in the part and shown in the Problems panel).
 *
 * Header lines (comment lines anywhere before the code; the comment marker of any language works: % -- # //):
 *   @generator Heat exchanger                         a title for the list
 *   @input mdot: kg/s = 0.2 [0.01 .. 10] "Mass flow"   name: unit = default, optional [min .. max], optional "label"
 *   @input kind: = gyroid {gyroid, schwarzp, diamond}  a choice
 *   @input solid: = true                              a switch
 *   @input note: = "text"                              text
 *
 *   parseHeader(text) → { title, inputs: [{ name, unit, kind: 'number'|'bool'|'text'|'choice', def, min, max, choices, label }] }
 *   inputValues(head, given) → { name: value } with defaults filled in and every value clamped / checked
 *   genKey(f) → 16 hex characters: the fingerprint of the script, its language and the effective inputs
 *   readGenerated(f, g, c) / usesGenerated(part)      part.js's reader and version rule
 *   runGenerator(engine, f, hooks) → { ok, mesh, report, sheet, log, error }   the page's side: sets the inputs, runs, reads `body`
 */
import { t, MESH, F } from './host.js';

export const GEN_LABELS = { get generated() { return t('gb.feature.generated'); } };
export const GEN_BASE = { generated: 'Generated' };
export const GEN_DEFAULTS = { generated: () => ({ script: { lang: 'craft', text: '' }, inputs: {}, op: 'add', up: 'z', gen: null, mesh: null, ran: '', sheet: null }) };
export const MAX_SCRIPT = 1024 * 1024, MAX_INPUTS = 200, MAX_SHEET = 500;
const NAME = /^[A-Za-z][A-Za-z0-9_]{0,40}$/;
const RESERVED = new Set(['body', 'sheet', 'ans', 'pi', 'e', 'i', 'j', 'true', 'false']);
const num = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
const text = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max);

// ---------------------------------------------------------------- the header

const LINE = /^\s*(?:%|--|#|\/\/)\s*@([a-z]+)\b[ \t]*(.*)$/;
/** One @input line's text after the keyword → an input, or null when it is not one. */
function parseInput(rest) {
  const m = /^([A-Za-z][A-Za-z0-9_]{0,40})\s*:\s*((?:[^=\s"\[{(]|\([^)]*\))*)\s*=\s*(.*)$/.exec(rest);   // the unit may hold a bracket with spaces: J/(kg K)
  if (!m || RESERVED.has(m[1])) return null;
  const [, name, unit, tail0] = m;
  let tail = tail0.trim(), label = '', choices = null, min = null, max = null;
  const lab = /\s*"([^"]*)"\s*$/.exec(tail);                      // a trailing "label" (a lone quoted default is the text default below)
  let def;
  if (lab && lab.index > 0) { label = text(lab[1], 80); tail = tail.slice(0, lab.index).trim(); }
  const ch = /\{([^}]*)\}\s*$/.exec(tail);
  if (ch) { choices = ch[1].split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50); tail = tail.slice(0, ch.index).trim(); }
  const rg = /\[\s*(-?[\d.eE+-]+)\s*\.\.\s*(-?[\d.eE+-]+)\s*\]\s*$/.exec(tail);
  if (rg) { min = +rg[1]; max = +rg[2]; tail = tail.slice(0, rg.index).trim(); if (!(Number.isFinite(min) && Number.isFinite(max) && min <= max)) return null; }
  const quoted = /^"([^"]*)"$/.exec(tail);
  if (quoted) def = text(quoted[1], 200);
  else if (tail === 'true' || tail === 'false') def = tail === 'true';
  else if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(tail)) def = +tail;
  else if (tail) def = text(tail, 200);
  else return null;
  const kind = choices && choices.length ? 'choice' : typeof def === 'boolean' ? 'bool' : typeof def === 'number' ? 'number' : 'text';
  if (kind === 'choice' && !choices.includes(String(def))) return null;
  if (kind === 'number' && min !== null && (def < min || def > max)) return null;
  return { name, unit: unit === '-' ? '' : text(unit, 20), kind, def: kind === 'choice' ? String(def) : def, min, max, choices, label: label || name };
}

export function parseHeader(src) {
  const head = { title: '', inputs: [] };
  const seen = new Set();
  for (const line of String(src || '').split(/\r?\n/).slice(0, 400)) {
    const m = LINE.exec(line);
    if (!m) continue;
    if (m[1] === 'generator' && !head.title) head.title = text(m[2], 80).trim();
    else if (m[1] === 'input') {
      const inp = parseInput(m[2]);
      if (inp && !seen.has(inp.name) && head.inputs.length < MAX_INPUTS) { seen.add(inp.name); head.inputs.push(inp); }
    }
  }
  return head;
}

/** The value of every declared input: the given one when it is valid, else the default. Numbers are clamped to [min, max]. */
export function inputValues(head, given = {}) {
  const out = {};
  for (const i of head.inputs) {
    let v = given[i.name];
    if (i.kind === 'number') { v = typeof v === 'number' && Number.isFinite(v) ? v : i.def; if (i.min !== null) v = Math.min(i.max, Math.max(i.min, v)); }
    else if (i.kind === 'bool') v = typeof v === 'boolean' ? v : i.def;
    else if (i.kind === 'choice') v = i.choices.includes(String(v)) ? String(v) : i.def;
    else v = typeof v === 'string' ? text(v, 200) : i.def;
    out[i.name] = v;
  }
  return out;
}

/** What a run depends on, as a fingerprint: the language, the text and the effective inputs (sorted by name). */
export function genKey(f) {
  const head = parseHeader(f.script.text), vals = inputValues(head, f.inputs);
  const body = JSON.stringify([f.script.lang, f.script.text, Object.keys(vals).sort().map((k) => [k, vals[k]])]);
  return F.fingerprint(new TextEncoder().encode(body));
}
export const isStale = (f) => !!f.mesh && f.ran !== genKey(f);
export const hasRun = (f) => !!f.mesh;

// ---------------------------------------------------------------- the file

export const usesGenerated = (part) => part.features.some((f) => f.type === 'generated');
const idOk = (s) => typeof s === 'string' && /^[A-Za-z0-9._-]{1,60}$/.test(s);

/** Fill g from the untrusted feature f; c = part.js's reader context. → true for a generated feature. */
export function readGenerated(f, g, c) {
  if (f.type !== 'generated') return false;
  const need = (ok, key) => { if (!ok) throw new Error(t(key, { name: g.name })); };   // "{name}: … is bad."
  need(f.script && typeof f.script === 'object' && typeof f.script.text === 'string' && f.script.text.length <= MAX_SCRIPT && ['craft', 'lua', 'python'].includes(f.script.lang), 'gb.file.bad.its_script');
  need(f.inputs && typeof f.inputs === 'object' && !Array.isArray(f.inputs) && Object.keys(f.inputs).length <= MAX_INPUTS, 'gb.file.bad.its_inputs');
  const inputs = {};
  for (const [k, v] of Object.entries(f.inputs)) {
    need(NAME.test(k) && (typeof v === 'boolean' || (typeof v === 'string' && v.length <= 200) || num(v, -1e15, 1e15)), 'gb.file.bad.its_inputs');
    inputs[k] = typeof v === 'string' ? text(v, 200) : v;
  }
  need(['add', 'cut', 'intersect'].includes(f.op ?? 'add'), 'gb.file.bad.the_operation');
  need(f.gen == null || (typeof f.gen === 'object' && idOk(f.gen.id) && /^[0-9a-f]{16}$/.test(f.gen.hash)), 'gb.file.bad.its_generator');
  need(f.ran === '' || f.ran === undefined || /^[0-9a-f]{16}$/.test(f.ran), 'gb.file.bad.its_generator');
  // keys in the order addFeature and applyRun make them, so a file read and written again is byte-identical
  g.script = { lang: f.script.lang, text: f.script.text }; g.inputs = inputs; g.op = f.op ?? 'add'; g.up = f.up === 'y' ? 'y' : 'z'; g.gen = f.gen ? { id: f.gen.id, hash: f.gen.hash } : null;
  let rep = null;
  if (f.mesh != null) {
    try { MESH.decodeMesh(f.mesh); } catch { need(false, 'gb.file.bad.its_mesh'); }
    g.mesh = { nv: f.mesh.nv, nt: f.mesh.nt, v: f.mesh.v, i: f.mesh.i };
    rep = MESH.readReport(f.report);
  } else g.mesh = null;
  g.ran = f.ran || '';
  g.sheet = readSheet(f.sheet);
  if (rep) g.report = rep;
  const probs = readProblems(f.problems);
  if (probs) g.problems = probs;
  if (f.log != null && f.log !== '') g.log = text(f.log, 4000);
  return true;
}

/** Data sheet rows from an untrusted value: [{ name, value, unit?, ref?, note? }] (value a number or a text), or null. */
export function readSheet(raw) {
  if (raw == null) return null;
  if (!Array.isArray(raw) || raw.length > MAX_SHEET) return null;
  const rows = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object' || !NAME.test(String(r.name)) && !/^[\w .\-/()%°²³µ]{1,60}$/.test(String(r.name))) continue;
    if (!(typeof r.value === 'string' || num(r.value, -1e300, 1e300) || typeof r.value === 'boolean')) continue;
    rows.push({ name: text(r.name, 60), value: typeof r.value === 'string' ? text(r.value, 200) : r.value, ...(r.unit ? { unit: text(r.unit, 20) } : {}), ...(r.ref ? { ref: text(r.ref, 240) } : {}), ...(r.note ? { note: text(r.note, 200) } : {}) });
  }
  return rows.length ? rows : null;
}

/**
 * Manufacturing or design problems a run found, as the generator's `problems` variable left them (mfg_check's `problems` cell):
 * [{ code, severity: 'error'|'warning'|'note', vars: {name: number|text}, req?: { op, value, unit }, found?: { value, unit }, at?: [[x, y, z] …] }],
 * positions in the generator's own frame (mm, z up). Untrusted when read from a file: every field checked, sizes bounded.
 */
export const MAX_PROBLEMS = 50;
export function readProblems(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const p of raw.slice(0, MAX_PROBLEMS)) {
    if (!p || typeof p !== 'object' || !/^[a-z][a-z0-9_.]{1,40}$/.test(String(p.code)) || !['error', 'warning', 'note'].includes(p.severity)) continue;
    const row = { code: p.code, severity: p.severity, vars: {} };
    if (p.vars && typeof p.vars === 'object') for (const [k, v] of Object.entries(p.vars).slice(0, 12)) if (/^[A-Za-z][A-Za-z0-9_]{0,20}$/.test(k) && (typeof v === 'string' || num(v, -1e15, 1e15))) row.vars[k] = typeof v === 'string' ? text(v, 60) : v;
    if (p.req && ['<=', '>=', '=', 'between'].includes(p.req.op) && num(p.req.value, -1e15, 1e15)) row.req = { op: p.req.op, value: p.req.value, unit: text(p.req.unit, 8) };
    if (p.found && num(p.found.value, -1e15, 1e15)) row.found = { value: p.found.value, unit: text(p.found.unit, 8) };
    if (Array.isArray(p.at)) row.at = p.at.slice(0, 20).filter((q) => Array.isArray(q) && q.length === 3 && q.every((x) => num(x, -1e9, 1e9))).map((q) => [q[0], q[1], q[2]]);
    out.push(row);
  }
  return out.length ? out : null;
}
/** The `problems` cell of structs a generator leaves → rows readProblems accepts. */
export function problemRows(cellValue) {
  if (!cellValue || cellValue.t !== 'cell') return null;
  const rows = [];
  for (const s of cellValue.items) {
    if (!s || s.t !== 'struct') continue;
    const f = s.fields, vars = {};
    if (f.vars && f.vars.t === 'struct') for (const [k, v] of Object.entries(f.vars.fields)) vars[k] = typeof v === 'number' || typeof v === 'string' ? v : (v && v.t === 'tensor' && v.data.length === 1 ? v.data[0] : undefined);
    const at = [];
    if (f.at && f.at.t === 'tensor' && f.at.shape[1] === 3) { const n = f.at.shape[0]; for (let i = 0; i < n; i++) at.push([f.at.data[i], f.at.data[i + n], f.at.data[i + 2 * n]]); }
    rows.push({ code: f.code, severity: f.severity, vars,
      ...(f.req_op !== undefined ? { req: { op: f.req_op, value: f.req_value, unit: f.req_unit } } : {}), ...(f.found_value !== undefined ? { found: { value: f.found_value, unit: f.found_unit } } : {}), at });
  }
  return readProblems(rows);
}

// ---------------------------------------------------------------- running a generator (the page's side)

/** A `sheet` struct value → rows. A field that is a plain number / text is a row; a struct { value, unit, ref, note } is a row with its facts. */
export function sheetRows(v) {
  if (!v || v.t !== 'struct') return null;
  const rows = [];
  for (const [name, x] of Object.entries(v.fields)) {
    if (typeof x === 'number' || typeof x === 'string' || typeof x === 'boolean') rows.push({ name, value: x });
    else if (x && x.t === 'struct' && x.fields.value !== undefined) {
      const val = x.fields.value, f = x.fields;
      const value = typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean' ? val : (val && val.t === 'tensor' && val.data.length === 1 ? val.data[0] : null);
      if (value === null) continue;
      rows.push({ name, value, ...(typeof f.unit === 'string' ? { unit: f.unit } : {}), ...(typeof f.ref === 'string' ? { ref: f.ref } : {}), ...(typeof f.note === 'string' ? { note: f.note } : {}) });
    }
  }
  return readSheet(rows);
}

/**
 * Run the feature's script in `engine` (cs-client.js createEngine): a clean workspace, the inputs set, the script run, `body`
 * read back, repaired and encoded the way the file keeps meshes. Nothing is changed on f; the caller stores the result.
 * `printed` is the array the engine's onPrint pushes the script's output into (the caller made the engine with it); `libBase` is
 * the URL of craftlib/ so the script can call the engineering library by name.
 * → { ok: true, mesh, report, sheet, log, key } | { ok: false, error: { message, line, col } , log }
 */
export async function runGenerator(engine, f, { printed = [], libBase } = {}) {
  const head = parseHeader(f.script.text), vals = inputValues(head, f.inputs), key = genKey(f);
  try {
    await engine.clear();
    for (const [k, v] of Object.entries(vals)) await engine.set(k, v);
    const r = await engine.run(f.script.text, { lang: f.script.lang, ...(libBase ? { libBase } : {}) });   // libBase: craftlib/ and craftlib/eng/, where the engineering library lives
    const log = text(printed.join('\n'), 4000);
    if (!r.ok) return { ok: false, error: r.error, log };
    if (!r.vars.includes('body')) return { ok: false, error: { message: t('gb.err.no_body'), line: 0, col: 0 }, log };
    const b = await engine.get('body');
    if (!b || b.t !== 'mesh' || b.kind !== 'tri' || !b.nodes.length || !b.elems.length) return { ok: false, error: { message: t('gb.err.body_not_mesh'), line: 0, col: 0 }, log };
    if (b.elems.length / 3 > MESH.MAX_TRIS) return { ok: false, error: { message: t('gb.err.too_big', { n: MESH.MAX_TRIS }), line: 0, col: 0 }, log };
    const fixed = MESH.repairMesh({ positions: Float64Array.from(b.nodes), indices: Uint32Array.from(b.elems) });
    const sheet = r.vars.includes('sheet') ? sheetRows(await engine.get('sheet')) : null;
    const problems = r.vars.includes('problems') ? problemRows(await engine.get('problems')) : null;
    return { ok: true, mesh: MESH.encodeMesh(fixed), report: MESH.readReport(fixed.report), sheet, problems, log, key };
  } catch (e) {
    return { ok: false, error: { message: String(e && e.message || e), line: 0, col: 0 }, log: text(printed.join('\n'), 4000) };
  }
}

/** Store a successful run on the feature (inside commit()). */
export function applyRun(f, r) {
  f.mesh = r.mesh; f.report = r.report; f.ran = r.key; f.sheet = r.sheet;
  if (r.problems) f.problems = r.problems; else delete f.problems;
  if (r.log) f.log = r.log; else delete f.log;
  if (!f.sheet) f.sheet = null;
}
