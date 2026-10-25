#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * partcraft — PartCraft from the command line (Node 24). It runs the same DOM-free modules as the app
 * (public_html/assets/apps/partcraft/dev) and builds with the same exact kernel (OpenCascade from the vendor folder);
 * when OpenCascade cannot load it builds with manifold-3d (faceted) and says so.
 *
 *   partcraft info      <part>                         features, parameters, rollback bar, and the built solid
 *   partcraft params    <part> [--json]                variables and equations with their values
 *   partcraft set       <part> name=value …            forward: set variables, link (=expr) or set numbers
 *   partcraft drive     <part> <target|var>=<value>    backward: solve the variable behind a driven number [--prefer v]
 *   partcraft build     <part> --out <file>            .step .stl .3mf .json .pcscript .swb
 *                       [--set k=v …] [--upto <feature>] [--table t.csv --out-dir <dir> [--format step]]
 *   partcraft variants  <part> --out-dir <dir> | --zip <f.zip>   the variant pack: every configuration (or --only "A,B") as
 *                       STEP, IFC, DWG and a preview, a variants table (CSV + JSON) and a LibraryCraft item with the variants
 *                       [--formats step,ifc,dwg,preview] [--no-item] [--kernel mesh]
 *   partcraft script    <in.pcscript> -o <part.json>   script → part
 *   partcraft to-script <part> -o <x.pcscript>         part → script (STEP of imports written beside it) [--exact]
 *   partcraft rollback  <part> [<feature> | --steps n] move the rollback bar back (default one feature)
 *   partcraft forward   <part> [--steps n | --end]     move it forward
 *   partcraft check     <part> [--strict]              the operator-discipline lint
 *   partcraft run       <script.craft|.lua>            run a CraftScript (or Lua) script in Node (docs/apps/craftscript.md)
 *                       [--part file] [--load name=file …] [--save-ws out.h5|.json] [--budget steps] [--lib dir]
 *
 * <part> is a .partcraft.json or a .pcscript. Commands that change a part write it back in place (a .json) or to
 * -o/--out (required for a .pcscript, whose comments a rewrite would lose). Every command takes --json.
 * Exit codes: 0 ok · 1 problems (a check finding, a failing feature, an equation error, an ambiguous drive) · 2 bad usage.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEV = pathToFileURL(path.join(REPO, 'public_html/assets/apps/partcraft/dev/')).href;
const VENDOR = path.join(REPO, 'public_html/assets/vendor');

// messages come from the app's English language file (0.4 G)
{
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(new URL('lang/en.json', DEV), 'utf8')) });
}
const P = await import(DEV + 'part.js');
const PR = await import(DEV + 'params.js');
const PP = await import(DEV + 'params-part.js');
const SC = await import(DEV + 'script.js');
const S = await import(DEV + 'sketch.js');
const { solveSketch } = await import(DEV + 'solver.js');
const { literal, formatNumber } = await import(DEV + 'expr.js');
// the workspaces' study readers (part.js refuses a file whose study data nobody reads): a part with scripts, a simulation, a
// CAM setup … opens here as in the app (0.5 WL.30 found `run --part` refusing a part with scripts)
await Promise.all(['ws-script.js', 'ws-simulation.js', 'ws-manufacture.js', 'ws-generative.js', 'ws-form.js'].map((m) => import(DEV + m)));

class Usage extends Error {}
const fmt = (v) => (typeof v === 'number' ? formatNumber(v) : String(v));

// ---------------------------------------------------------------- arguments
const VALUE_OPTS = new Set(['only', 'formats', 'zip', 'out', 'o', 'out-dir', 'set', 'upto', 'table', 'prefer', 'steps', 'kernel', 'format', 'part', 'load', 'save-ws', 'budget', 'lib']);
function parseArgs(argv) {
  const pos = [], opt = { set: [], load: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') { pos.push(...argv.slice(i + 1)); break; }
    const m = /^--?([a-z][a-z-]*)(?:=(.*))?$/.exec(a);
    if (!m || /^-\d/.test(a)) { pos.push(a); continue; }
    const k = m[1];
    if (VALUE_OPTS.has(k)) {
      const v = m[2] ?? argv[++i];
      if (v === undefined) throw new Usage(`--${k} needs a value.`);
      if (k === 'set' || k === 'load') opt[k].push(v); else opt[k === 'o' ? 'out' : k] = v;
    } else if (['json', 'strict', 'end', 'exact', 'no-build', 'no-item', 'help', 'h', 'quiet'].includes(k)) opt[k === 'h' ? 'help' : k] = true;
    else throw new Usage(`Unknown option --${k}. Try partcraft --help.`);
  }
  return { pos, opt };
}

// ---------------------------------------------------------------- loading and saving parts
function readInput(file) {
  if (!file) throw new Usage('Name a part file (.partcraft.json or .pcscript).');
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Usage(`Cannot read ${file}: ${e.code === 'ENOENT' ? 'no such file' : e.message}`); }
  if (/\.pcscript$/i.test(file) || SC.looksLikeScript(text)) {
    const dir = path.dirname(path.resolve(file));
    try {
      const r = SC.scriptToPart(text, { readFile: (p) => fs.readFileSync(path.resolve(dir, p), 'utf8') });
      return { part: r.part, warnings: r.warnings.map((w) => `${file}:${w.line ?? ''} ${w.message}`), script: true };
    } catch (e) {
      if (e instanceof SC.ScriptError) { const err = new Error(e.errors.map((x) => `${file}:${x.line ?? ''}: ${x.message}`).join('\n')); err.problem = true; throw err; }
      throw e;
    }
  }
  try { return { part: P.readPart(text), warnings: [], script: false }; } catch (e) { const err = new Error(`${file}: ${e.message}`); err.problem = true; throw err; }
}
function writePart(part, file) {
  if (/\.pcscript$/i.test(file)) {
    const s = SC.partToScript(part);
    fs.writeFileSync(file, s.text);
    for (const f of s.files) fs.writeFileSync(path.join(path.dirname(file), f.name), f.text);
    return [file, ...s.files.map((f) => path.join(path.dirname(file), f.name))];
  }
  fs.writeFileSync(file, P.toJSON(part));
  return [file];
}
function outFor(input, opt, loaded) {
  if (opt.out) return opt.out;
  if (loaded.script) throw new Usage('This part came from a script: give -o <file> (.partcraft.json or .pcscript), so the script and its comments stay as they are.');
  return input;
}

// ---------------------------------------------------------------- kernels
let kernelP = null;
function kernel(prefer) {
  return (kernelP ||= (async () => {
    if (prefer !== 'mesh') {
      try {
        const { default: init } = await import(pathToFileURL(path.join(VENDOR, 'replicad-opencascadejs/current/replicad_single.js')).href);
        const oc = await init({ print: () => {}, printErr: () => {} });
        const B = await import(DEV + 'brep.js');
        return { kind: 'exact', oc, B, note: null };
      } catch (e) {
        var why = e.message;
      }
    }
    const { default: Module } = await import(pathToFileURL(path.join(VENDOR, 'manifold-3d/current/manifold.js')).href);
    const M = await Module(); M.setup();
    const K = await import(DEV + 'kernel.js');
    return { kind: 'mesh', M, K, note: prefer === 'mesh' ? 'Built with the mesh kernel (manifold-3d), as asked: curves are faceted and fillets, chamfers, shells and imports are not built.' : `OpenCascade did not load (${why}); built with the mesh kernel (manifold-3d): curves are faceted and fillets, chamfers, shells and imports are not built.` };
  })());
}
async function regen(part, opt, upTo = null) {
  const k = await kernel(opt.kernel);
  const r = k.kind === 'exact' ? k.B.regenerateBrep(part, k.oc, { upTo }) : k.K.regenerate(part, k.M, { upTo });
  return { k, r };
}
const failing = (part, r) => part.features.filter((f) => r.results.get(f.id)?.status === 'error' || r.results.get(f.id)?.status === 'skipped')
  .map((f) => ({ feature: f.name, message: r.results.get(f.id).message || 'not built' }));
const statsOf = (r) => (r.stats ? { volume: r.stats.volume, area: r.stats.area, bbox: r.stats.bbox ? { min: [...r.stats.bbox.min], max: [...r.stats.bbox.max] } : null, bodies: r.stats.bodies, exact: !!r.exact } : null);

// ---------------------------------------------------------------- output
let JSON_OUT = false;
const lines = [];
const say = (s = '') => { if (!JSON_OUT) lines.push(s); };
function finish(code, data) {
  if (JSON_OUT) process.stdout.write(JSON.stringify({ ok: code === 0, ...data }, null, 1) + '\n');
  else if (lines.length) process.stdout.write(lines.join('\n') + '\n');
  process.exitCode = code;
}

// ---------------------------------------------------------------- assignments (set / build --set)
function splitAssign(a) {
  const i = a.indexOf('=');
  if (i <= 0) throw new Usage(`"${a}" is not name=value.`);
  return [a.slice(0, i).trim(), a.slice(i + 1).trim()];
}
/** Forward assignments → { changes: [text], errors: [text] } (part mutated). */
function assign(part, list) {
  const changes = [], errors = [];
  for (const a of list) {
    const [k, v] = splitAssign(a);
    if (!v) throw new Usage(`${k}= needs a value.`);
    const p = PP.paramsOf(part);
    const key = PR.varByName(p, k) ? null : PP.resolveTarget(part, k);
    if (key) {
      const t = PP.partAdapter.targets(part).get(key);
      const link = PP.linkOf(part, key);
      const linkIt = v.startsWith('=') || literal(v) === null;
      if (linkIt) {
        const expr = v.replace(/^=\s*/, '');
        const r = PR.setLink(p, PP.partAdapter, part, key, expr);
        if (!r.ok) errors.push(`${t.label}: ${r.error}`); else changes.push(`${t.label} = ${expr}${link ? ` (was = ${link.expr})` : ''}`);
      } else {
        const n = literal(v);
        if (link) { errors.push(`${t.label} is driven by = ${link.expr}. Use "partcraft drive" to solve what drives it, or set ${k}==${v} to replace the equation with a fixed one.`); continue; }
        const vp = PR.valueProblem(t, n);
        if (vp) { errors.push(vp); continue; }
        const from = t.get(); t.set(n);
        changes.push(`${t.label}: ${fmt(from)} → ${fmt(n)}`);
      }
      continue;
    }
    if (!PR.varByName(p, k) && PR.nameProblem(k)) throw new Usage(`"${k}" is neither a parameter nor a number of this part (${PR.nameProblem(k)}). See partcraft params.`);
    const before = PR.varByName(p, k)?.expr;
    const r = PR.setVar(p, k, v.replace(/^=\s*/, ''));
    if (!r.ok) errors.push(`${k}: ${r.error}`); else changes.push(before === undefined ? `new parameter ${k} = ${v}` : `${k}: ${before} → ${v.replace(/^=\s*/, '')}`);
  }
  PP.tidyParams(part);
  return { changes, errors };
}
function applyAndReport(part) {
  const before = new Map([...PP.partAdapter.targets(part)].map(([k, t]) => [k, t.get()]));
  const r = PP.applyPartParams(part);
  const targets = PP.partAdapter.targets(part);
  const moved = r.changed.map((k) => `${targets.get(k)?.label || k}: ${fmt(before.get(k))} → ${fmt(targets.get(k)?.get())}`);
  const errors = r.errors.map((e) => `${targets.get(e.where)?.label || e.where}: ${e.message}`);
  return { moved, errors };
}

// ---------------------------------------------------------------- commands
const commands = {
  async info(pos, opt) {
    const L = readInput(pos[0]);
    const part = L.part;
    const rep = PP.paramsReport(part);
    let built = null, fails = [], note = null;
    const data = { name: part.name, fileVersion: P.fileVersion(part), features: [], parameters: rep.vars.length, equations: rep.links.length, rollback: PP.rollbackWords(part), warnings: L.warnings };
    if (!opt['no-build']) { const { k, r } = await regen(part, opt); built = r; fails = failing(part, r); note = k.note; data.kernel = k.kind; data.solid = statsOf(r); data.failing = fails; if (note) data.note = note; }
    say(`${part.name}  (PartCraft file version ${data.fileVersion})`);
    const n = part.features.length, b = part.rollback === null ? n : part.rollback;
    part.features.forEach((f, i) => {
      if (i === b && b < n) say('  ── rollback bar ──');
      const st = built?.results.get(f.id);
      const flag = f.suppressed ? 'suppressed' : st?.status === 'error' ? 'ERROR ' + st.message : st?.status === 'skipped' ? 'not built: ' + st.message : st?.status === 'rolled' ? 'rolled back' : f.type === 'sketch' && st?.solve ? st.solve.status + (st.solve.status === 'under' ? ` (${st.solve.dof} DOF)` : '') : '';
      data.features.push({ id: f.id, name: f.name, type: f.type, status: f.suppressed ? 'suppressed' : st?.status || null, message: st?.message || null });
      say(`  ${String(i + 1).padStart(3)}  ${f.name.padEnd(18)} ${P.FEATURE_LABELS[f.type].padEnd(16)} ${flag}`);
    });
    say(`Parameters: ${rep.vars.length}, equations: ${rep.links.length}. ${data.rollback}`);
    if (data.solid) { const s = data.solid; const size = s.bbox ? s.bbox.max.map((v, i) => fmt(+(v - s.bbox.min[i]).toFixed(6))).join(' × ') : '—'; say(`Solid (${data.kernel} kernel): volume ${s.volume.toFixed(6)} mm³, area ${s.area.toFixed(4)} mm², size ${size} mm, ${s.bodies} bod${s.bodies === 1 ? 'y' : 'ies'}.`); }
    if (note) say(note);
    for (const w of L.warnings) say('warning: ' + w);
    finish(fails.length ? 1 : 0, data);
  },

  async params(pos) {
    const L = readInput(pos[0]);
    const rep = PP.paramsReport(L.part);
    say(rep.vars.length ? 'Parameters' : 'No parameters.');
    for (const v of rep.vars) say(`  ${v.name.padEnd(16)} = ${v.expr.padEnd(24)} ${v.error ? 'ERROR ' + v.error : '→ ' + fmt(v.value)}${v.note ? '   # ' + v.note : ''}`);
    if (rep.links.length) say('Equations');
    for (const l of rep.links) say(`  ${l.name.padEnd(22)} = ${l.expr.padEnd(24)} ${l.error ? 'ERROR ' + l.error : '→ ' + fmt(l.result)}${l.error ? '' : `   (${l.label})`}`);
    const bad = rep.vars.some((v) => v.error) || rep.links.some((l) => l.error);
    finish(bad ? 1 : 0, { vars: rep.vars, links: rep.links.map((l) => ({ target: l.target, name: l.name, label: l.label, expr: l.expr, value: l.value, result: l.result, error: l.error })) });
  },

  async set(pos, opt) {
    const [file, ...list] = pos;
    if (!list.length) throw new Usage('partcraft set <part> name=value … (a parameter, or a number like Extrude1.depth).');
    const L = readInput(file);
    const out = outFor(file, opt, L);
    const a = assign(L.part, list);
    const ap = a.errors.length ? { moved: [], errors: [] } : applyAndReport(L.part);
    const errors = [...a.errors, ...ap.errors];
    for (const c of a.changes) say(c);
    for (const m of ap.moved) say('  driven: ' + m);
    for (const e of errors) say('error: ' + e);
    let written = [];
    if (!errors.length) { written = writePart(L.part, out); say(`Wrote ${written.join(', ')}.`); } else say('Nothing written.');
    finish(errors.length ? 1 : 0, { changes: a.changes, driven: ap.moved, errors, written });
  },

  async drive(pos, opt) {
    const [file, a] = pos;
    if (!a || pos.length > 2) throw new Usage('partcraft drive <part> <target|parameter>=<value> [--prefer <parameter>].');
    const [k, v] = splitAssign(a);
    const value = literal(v);
    if (value === null) throw new Usage(`drive takes a number ("${v}" is not one). To link a value to an expression use partcraft set ${k}==<expr>.`);
    const L = readInput(file);
    const out = outFor(file, opt, L);
    const part = L.part, p = PP.paramsOf(part);
    let r, label;
    if (PR.varByName(p, k)) { r = PR.driveVar(p, k, value, { prefer: opt.prefer || null }); label = k; }
    else {
      const key = PP.resolveTarget(part, k);
      if (!key) throw new Usage(`"${k}" is neither a parameter nor a number of this part. See partcraft params.`);
      const t = PP.partAdapter.targets(part).get(key);
      label = t.label;
      r = PR.driveBack(p, PP.partAdapter, part, key, value, { prefer: opt.prefer || null });
      if (r.ok && r.direct) { const vp = PR.valueProblem(t, value); if (vp) r = { ok: false, error: vp }; else { const from = t.get(); t.set(value); r = { ok: true, direct: true, from, to: value }; } }
    }
    PP.tidyParams(part);
    if (!r.ok) {
      say('error: ' + r.error);
      if (r.choices?.length) say(`Pick one with --prefer: ${r.choices.join(', ')}.`);
      finish(1, { error: r.error, choices: r.choices || [] });
      return;
    }
    const ap = applyAndReport(part);
    if (r.direct) say(`${label}: ${fmt(r.from)} → ${fmt(r.to)} (no equation drives it, so it was set directly).`);
    else if (r.link) say(`${label}: its equation was the constant ${r.from}; now = ${r.to}.`);
    else say(`${r.var}: ${fmt(r.from)} → ${fmt(r.to)}, so that ${label} = ${fmt(value)}.`);
    for (const m of ap.moved) say('  driven: ' + m);
    for (const e of ap.errors) say('error: ' + e);
    let written = [];
    if (!ap.errors.length) { written = writePart(part, out); say(`Wrote ${written.join(', ')}.`); } else say('Nothing written.');
    finish(ap.errors.length ? 1 : 0, { result: r, driven: ap.moved, errors: ap.errors, written });
  },

  async build(pos, opt) {
    const L = readInput(pos[0]);
    if (!opt.out && !opt['out-dir']) throw new Usage('build needs --out <file> (.step .stl .3mf .json .pcscript .swb), or --table t.csv --out-dir <dir>.');
    const part = L.part;
    const a = assign(part, opt.set);
    if (a.errors.length) { for (const e of a.errors) say('error: ' + e); finish(1, { errors: a.errors }); return; }
    let upTo = null;
    if (opt.upto) {
      const i = part.features.findIndex((f) => f.name === opt.upto || f.id === opt.upto);
      if (i < 0) throw new Usage(`There is no feature called "${opt.upto}".`);
      upTo = i + 1;
    }
    const jobs = [];
    if (opt.table) {
      if (!opt['out-dir']) throw new Usage('--table writes one file per row: give --out-dir <dir> (and --format step|stl|3mf|json|pcscript|swb).');
      let csv;
      try { csv = fs.readFileSync(opt.table, 'utf8'); } catch (e) { throw new Usage(`Cannot read ${opt.table}: ${e.message}`); }
      let t;
      try { t = PR.readDesignTable(csv, PP.paramsOf(part)); } catch (e) { t = { ok: false, error: e.message }; }
      if (!t.ok) { say('error: ' + t.error); finish(1, { errors: [t.error] }); return; }
      const ext = (opt.format || (opt.out ? path.extname(opt.out).slice(1) : 'step')).toLowerCase();
      fs.mkdirSync(opt['out-dir'], { recursive: true });
      const used = new Set();
      for (const row of t.rows) {
        let base = row.name.replace(/[^A-Za-z0-9 _.-]+/g, '_').trim().slice(0, 80) || 'row';
        let name = base, i = 2; while (used.has(name)) name = `${base} (${i++})`;
        used.add(name);
        jobs.push({ row, file: path.join(opt['out-dir'], `${name}.${ext}`) });
      }
    } else jobs.push({ row: null, file: opt.out });
    const results = [];
    let bad = false;
    for (const job of jobs) {
      const pt = structuredClone(part);
      const ap = job.row ? PP.applyPartParams(pt, { overrides: job.row.overrides }) : PP.applyPartParams(pt);
      if (job.row) PR.applyOverrides(pt.params, job.row.overrides);
      const res = { row: job.row?.name ?? null, file: job.file, errors: ap.errors.map((e) => `${e.where}: ${e.message}`) };
      if (ap.errors.length) { bad = true; results.push(res); say(`${job.row ? job.row.name + ': ' : ''}error: ${res.errors.join('; ')}`); continue; }
      try {
        const w = await writeOutput(pt, job.file, opt, upTo);
        Object.assign(res, w);
        if (w.failing.length) bad = true;
        say(`${job.row ? job.row.name + ': ' : ''}wrote ${w.written.join(', ')}${w.solid ? ` — volume ${w.solid.volume.toFixed(6)} mm³ (${w.kernel} kernel)` : ''}`);
        for (const f of w.failing) say(`  failing: ${f.feature}: ${f.message}`);
        for (const n of w.notes) say('  note: ' + n);
      } catch (e) { bad = true; res.errors.push(e.message); say(`${job.row ? job.row.name + ': ' : ''}error: ${e.message}`); }
      results.push(res);
    }
    for (const w of L.warnings) say('warning: ' + w);
    finish(bad ? 1 : 0, { results, warnings: L.warnings });
  },

  async variants(pos, opt) {
    if (!opt['out-dir'] && !opt.zip) throw new Usage('variants needs --out-dir <dir> (one file each) or --zip <file.zip>.');
    const L = readInput(pos[0]);
    const V = await import(DEV + 'variants.js');
    const formats = opt.formats ? String(opt.formats).split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : V.PACK_FORMATS;
    const bad = formats.filter((f) => !V.PACK_FORMATS.includes(f));
    if (bad.length) throw new Usage(`--formats takes ${V.PACK_FORMATS.join(', ')} (not ${bad.join(', ')}).`);
    const names = opt.only ? String(opt.only).split(',').map((x) => x.trim()).filter(Boolean) : null;
    const k = await kernel(opt.kernel);
    const res = await V.buildPack(L.part, {
      names, formats, item: !opt['no-item'],
      build: async (p) => (k.kind === 'exact' ? k.B.regenerateBrep(p, k.oc, {}) : k.K.regenerate(p, k.M, {})),
      step: k.kind === 'exact' ? async (p) => k.B.exportStep(p, k.oc, { schema: opt.format === 'ap214' ? 'AP214' : 'AP242' }).text : null,
    });
    if (k.note) res.notes.unshift(k.note);
    for (const w of L.warnings) say('warning: ' + w);
    for (const p of res.problems) say(`${p.name ? p.name + ': ' : ''}error: ${p.error}`);
    if (res.files.length) {
      if (opt['out-dir']) {
        fs.mkdirSync(opt['out-dir'], { recursive: true });
        for (const f of res.files) fs.writeFileSync(path.join(opt['out-dir'], f.name), f.data);
        say(`Wrote ${res.files.length} files for ${res.variants.length} variants to ${opt['out-dir']}.`);
      }
      if (opt.zip) { fs.writeFileSync(opt.zip, V.packZip(res)); say(`Wrote ${opt.zip}: ${res.files.length} files for ${res.variants.length} variants.`); }
    }
    for (const n of res.notes) say('note: ' + n);
    finish(res.problems.length || !res.variants.length ? 1 : 0, { variants: res.variants, problems: res.problems, notes: res.notes, files: res.files.map((f) => f.name) });
  },

  async script(pos, opt) {
    const [file] = pos;
    if (!file || !opt.out) throw new Usage('partcraft script <in.pcscript> -o <part.partcraft.json>.');
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Usage(`Cannot read ${file}: ${e.message}`); }
    const dir = path.dirname(path.resolve(file));
    let r;
    try { r = SC.scriptToPart(text, { readFile: (p) => fs.readFileSync(path.resolve(dir, p), 'utf8') }); } catch (e) {
      if (!(e instanceof SC.ScriptError)) throw e;
      for (const x of e.errors) say(`${file}:${x.line ?? ''}: ${x.message}`);
      finish(1, { errors: e.errors });
      return;
    }
    const written = writePart(r.part, opt.out);
    for (const w of r.warnings) say(`${file}:${w.line ?? ''}: warning: ${w.message}`);
    say(`Wrote ${written.join(', ')}: ${r.part.features.length} features, ${r.part.params?.vars.length || 0} parameters, ${r.part.params?.links.length || 0} equations.`);
    finish(0, { written, warnings: r.warnings, features: r.part.features.length });
  },

  async 'to-script'(pos, opt) {
    const [file] = pos;
    if (!file || !opt.out) throw new Usage('partcraft to-script <part> -o <x.pcscript> [--exact].');
    const L = readInput(file);
    const s = SC.partToScript(L.part, { exact: !!opt.exact });
    fs.writeFileSync(opt.out, s.text);
    const written = [opt.out];
    for (const f of s.files) { const p = path.join(path.dirname(opt.out), f.name); fs.writeFileSync(p, f.text); written.push(p); }
    say(`Wrote ${written.join(', ')} (${s.text.split('\n').length - 1} lines).`);
    finish(0, { written });
  },

  async rollback(pos, opt) { return roll(pos, opt, -1); },
  async forward(pos, opt) { return roll(pos, opt, +1); },

  async check(pos, opt) {
    const L = readInput(pos[0]);
    const r = await lint(L.part, opt);
    for (const w of L.warnings) r.findings.unshift({ level: 'warning', kind: 'script', where: pos[0], message: w });
    if (opt.strict) for (const f of r.findings) f.level = 'error';
    const errors = r.findings.filter((f) => f.level === 'error'), warnings = r.findings.filter((f) => f.level === 'warning');
    for (const f of r.findings) say(`${f.level.padEnd(7)} ${f.where}: ${f.message}`);
    if (r.note) say('note: ' + r.note);
    say(`${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}${opt.strict ? ' (--strict: every finding counts)' : ''}.`);
    finish(errors.length ? 1 : 0, { errors: errors.length, warnings: warnings.length, findings: r.findings, kernel: r.kernel || null, note: r.note || null });
  },

  async run(pos, opt) { return runScript(pos, opt); },
};

// ---------------------------------------------------------------- run: CraftScript / Lua in Node (same runtime as the Script workspace)
async function runScript(pos, opt) {
  const [file] = pos;
  if (!file) throw new Usage('partcraft run <script.craft|.lua> [--part file] [--load name=file …] [--save-ws out.h5] [--budget steps] [--lib dir].');
  let source;
  try { source = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Usage(`Cannot read ${file}: ${e.code === 'ENOENT' ? 'no such file' : e.message}`); }
  const CS = await import(DEV + 'cs-all.js');
  const dir = path.dirname(path.resolve(file));
  const libDirs = [dir, ...(opt.lib ? [path.resolve(opt.lib)] : []), path.join(REPO, 'public_html/assets/apps/partcraft/dev/craftlib')];
  const library = (name) => {
    for (const d of libDirs) for (const ext of ['.craft', '.m', '.lua']) {
      const p = path.join(d, name + ext);
      if (fs.existsSync(p) && path.resolve(p) !== path.resolve(file)) return { source: fs.readFileSync(p, 'utf8'), file: path.relative(process.cwd(), p), lang: ext === '.lua' ? 'lua' : 'craft' };
    }
    return null;
  };
  let part = null;
  const params = {};   // the part's parameters for param() / params() (0.5 WL.30)
  if (opt.part) {
    const L = readInput(opt.part);
    const { r } = await regen(L.part, opt);
    if (!r.mesh) throw new Error(`${opt.part}: the part has no solid to hand to the script.`);
    part = CS.IO.modelFromMesh(r.mesh, { source: 'part', ref: L.part.name });
    if (L.part.params) for (const [k, v] of PR.evaluateVars(L.part.params).values) if (Number.isFinite(v)) params[k] = v;
  }
  CS.IO.setIoHost(CS.IO.nodeFs(null, { part, params }));
  const shown = new Map();
  let lastShown = null;
  const budget = opt.budget === undefined ? 2e9 : Number(opt.budget);
  if (!(budget > 0)) throw new Usage('--budget is a number of steps, e.g. 1e9.');
  const rt = CS.makeRuntime({
    budget,
    library,
    onPrint: (t) => { if (JSON_OUT) lines.push(t); else process.stdout.write(t); },
    onDisplay: (cmd) => {
      const kind = cmd.show ? 'show ' + cmd.show : Object.keys(cmd).find((k) => k !== 'opts') || 'display';
      shown.set(kind, (shown.get(kind) || 0) + 1);
      const v = cmd.image ?? cmd.table ?? cmd.value ?? (cmd.plot ? cmd.plot.y : null);
      lastShown = { kind, size: v && typeof v === 'object' && v.shape ? v.shape.join('×') : null };
    },
  });
  for (const a of opt.load) {
    const i = a.indexOf('=');
    if (i <= 0) throw new Usage(`--load takes name=file (got "${a}").`);
    const name = a.slice(0, i), f = a.slice(i + 1);
    await CS.IO.prepareIo(f);
    try { rt.ws.set(name, CS.IO.loadFile(f, {}, 1)); } catch (e) { const err = new Error(`--load ${a}: ${e.message}`); err.problem = true; throw err; }
  }
  const r = await rt.run(source, { file: path.basename(file), lang: CS.languageForFile(file) || 'craft' });
  const summary = [...shown].map(([k, n]) => `${n} × ${k}`).join(', ');
  if (summary && !JSON_OUT) process.stdout.write(`[display: ${summary}${lastShown && lastShown.size ? `; last ${lastShown.kind} ${lastShown.size}` : ''}]\n`);
  let saved = null;
  if (opt['save-ws']) {
    const fields = {};
    for (const [k, v] of rt.ws.map) if (v && v.t !== 'func') fields[k] = v;
    await CS.IO.prepareIo(opt['save-ws']);
    if (/\.h5$|\.hdf5$/i.test(opt['save-ws'])) await CS.IO.loadH5();
    CS.IO.saveFile(opt['save-ws'], { t: 'struct', fields }, {});
    saved = opt['save-ws'];
    if (!JSON_OUT) process.stdout.write(`Saved ${Object.keys(fields).length} variable${Object.keys(fields).length === 1 ? '' : 's'} to ${saved}.\n`);
  }
  if (!r.ok) {
    const e = r.error;
    const where = `${e.file || path.basename(file)}${e.line ? ':' + e.line + (e.col ? ':' + e.col : '') : ''}`;
    if (!JSON_OUT) {
      process.stderr.write(`${where}: ${e.stopped ? '' : 'error: '}${e.message}\n`);
      for (const f of e.stack || []) process.stderr.write(`  in ${f.name} at line ${f.line}${f.file ? ' (' + f.file + ')' : ''}\n`);
    }
  } else if (!JSON_OUT) process.stdout.write(`Done in ${(r.ms / 1000).toFixed(2)} s (${r.steps.toLocaleString('en-US')} steps). Workspace: ${rt.ws.names().join(', ') || 'empty'}.\n`);
  finish(r.ok ? 0 : 1, { result: r, output: JSON_OUT ? lines.splice(0).join('') : undefined, displays: Object.fromEntries(shown), workspace: rt.ws.list(), saved });
}

async function roll(pos, opt, dir) {
  const [file, target] = pos;
  const L = readInput(file);
  const out = outFor(file, opt, L);
  const part = L.part;
  let r;
  if (opt.end && dir > 0) r = PP.rollTo(part, null);
  else if (target && dir < 0) {
    const f = part.features.find((g) => g.name === target || g.id === target);
    if (!f) throw new Usage(`There is no feature called "${target}".`);
    r = PP.rollTo(part, f.id);
  } else {
    if (target) throw new Usage(dir > 0 ? 'forward takes --steps n or --end.' : 'rollback takes a feature name or --steps n.');
    const n = opt.steps === undefined ? 1 : Number(opt.steps);
    if (!Number.isInteger(n) || n < 1) throw new Usage('--steps is a whole number from 1.');
    r = PP.stepRollback(part, dir * n);
  }
  if (!r.ok) { say(r.message); finish(1, { message: r.message }); return; }
  const written = writePart(part, out);
  say(`${r.message} Wrote ${written.join(', ')}.`);
  finish(0, { built: r.to, of: part.features.length, message: r.message, written });
}

/** Write one output file for a part (values already applied). */
async function writeOutput(part, file, opt, upTo) {
  const ext = path.extname(file).toLowerCase();
  const notes = [];
  const out = { written: [file], notes, failing: [], solid: null, kernel: null };
  if (ext === '.json') { fs.writeFileSync(file, P.toJSON(part)); return out; }
  if (ext === '.pcscript') { out.written = writePart(part, file); return out; }
  if (!['.step', '.stp', '.stl', '.3mf', '.swb'].includes(ext)) throw new Usage(`${file}: build writes .step .stl .3mf .json .pcscript or .swb.`);
  const pt = upTo === null ? part : { ...part, rollback: upTo >= part.features.length ? null : upTo };
  const { k, r } = await regen(pt, opt);
  out.kernel = k.kind; out.solid = statsOf(r); out.failing = failing(pt, r);
  if (k.note) notes.push(k.note);
  const X = await import(DEV + 'export.js');
  if (ext === '.step' || ext === '.stp') {
    if (k.kind === 'exact') fs.writeFileSync(file, k.B.exportStep(pt, k.oc, { schema: opt.format === 'ap214' ? 'AP214' : 'AP242' }).text);
    else { if (!r.mesh) throw new Error('There is no solid to export.'); fs.writeFileSync(file, X.stepFaceted(r.mesh, part.name).text); notes.push('The STEP is faceted (flat triangles), not exact surfaces.'); }
  } else if (ext === '.stl') { if (!r.mesh) throw new Error('There is no solid to export.'); fs.writeFileSync(file, X.stlBinary(r.mesh, part.name)); }
  else if (ext === '.3mf') { if (!r.mesh) throw new Error('There is no solid to export.'); fs.writeFileSync(file, X.threeMf(r.mesh, part.name)); }
  else if (ext === '.swb') {
    let SW;
    try { SW = await import(DEV + 'swmacro.js'); } catch { throw new Error('The macro writer (swmacro.js) is not in this build yet, so a .swb cannot be written. Write a .step instead.'); }
    if (typeof SW.partToSwb !== 'function') throw new Error('swmacro.js has no partToSwb() yet, so a .swb cannot be written.');
    const m = SW.partToSwb(pt, { regen: r, name: part.name });
    fs.writeFileSync(file, cp1252(String(m.text).replace(/\r?\n/g, '\r\n')));
    for (const n of m.notes || []) notes.push(String(n));
    notes.push('The macro has not been run in SolidWorks here (it is not available on this server).');
  }
  return out;
}

const CP1252 = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
function cp1252(s) { const b = Buffer.alloc(s.length); let n = 0; for (const ch of s) { const c = ch.codePointAt(0); b[n++] = c < 0x80 || (c >= 0xa0 && c <= 0xff) ? c : CP1252[c] ?? 0x3f; } return b.subarray(0, n); }

// ---------------------------------------------------------------- check: the operator-discipline lint
async function lint(part, opt) {
  const findings = [];
  const add = (level, kind, where, message) => findings.push({ level, kind, where, message });
  const p = part.params || PR.emptyParams();
  const ev = PR.evaluateVars(p);
  // parameter errors and cycles
  for (const [name, msg] of ev.errors) add('error', /each other|itself/.test(msg) ? 'cycle' : 'parameter', name, msg);
  for (const l of PR.describeLinks(part, p, PP.partAdapter)) {
    if (l.error) add('error', 'equation', PP.targetName(part, l.target), `= ${l.expr}: ${l.error}`);
    else if (l.result !== null && l.value !== null && Math.abs(l.result - l.value) > 1e-9 * Math.max(1, Math.abs(l.result)) && !(Number.isInteger(l.value) && Math.round(l.result) === l.value)) add('warning', 'stale', PP.targetName(part, l.target), `holds ${fmt(l.value)} but its equation gives ${fmt(l.result)} (run partcraft set or open it in PartCraft to bring it up to date).`);
  }
  // unused parameters: not reached from any equation
  const used = new Set();
  const walk = (n) => { if (used.has(n)) return; used.add(n); for (const d of ev.uses.get(n) || []) walk(d); };
  for (const l of p.links) { const r = (await import(DEV + 'expr.js')).parse(l.expr); if (r.ok) r.uses.forEach(walk); }
  for (const v of p.vars) if (!used.has(v.name)) add('warning', 'unused', v.name, 'is not used by any equation.');
  // numbers typed straight in
  const targets = PP.partAdapter.targets(part);
  const byFeature = new Map();
  for (const [key, t] of targets) {
    if (PP.linkOf(part, key)) continue;
    const f = part.features.find((g) => g.id === t.feature);
    if (t.field && !PP.fieldInUse(f, t.field)) continue;
    if (t.field && t.kind === 'angle' && t.get() === 360 && t.max === 360) continue;   // a full turn is not a size
    if (!byFeature.has(f)) byFeature.set(f, []);
    byFeature.get(f).push(`${t.field ? PP.PARAM_FIELDS[f.type][t.field].label : t.dim + ' ' + S.CONSTRAINTS[f.sketch.constraints.find((c) => c.id === t.constraint).type].label.toLowerCase()} ${fmt(t.get())}`);
  }
  for (const [f, list] of byFeature) add('warning', 'typed', f.name, `typed numbers no parameter drives: ${list.join(', ')}.`);
  // sketches: under / over defined
  for (const f of part.features) {
    if (f.type !== 'sketch') continue;
    const r = solveSketch(f.sketch);
    const desc = (ids) => [...new Set(ids)].map((id) => { const c = f.sketch.constraints.find((k) => k.id === id); return c ? `${S.describe(c, fmt)} (${c.refs.join(' ')})` : id; }).join(', ');
    if (!r.ok || r.conflicts.length) add('error', 'over', f.name, `over defined: ${desc([...r.conflicts, ...r.redundant])} cannot all be met.`);
    else if (r.redundant.length) add('error', 'over', f.name, `over defined: ${desc(r.redundant)} ${r.redundant.length === 1 ? 'is' : 'are'} already implied.`);
    else if (r.status === 'under') add('warning', 'under', f.name, `under defined: ${r.dof} degree${r.dof === 1 ? '' : 's'} of freedom left.`);
  }
  // suppressed, rollback
  for (const f of part.features) if (f.suppressed) add('warning', 'suppressed', f.name, 'is suppressed (not built).');
  if (part.rollback !== null && part.rollback < part.features.length) add('warning', 'rollback', 'rollback bar', `${PP.rollbackWords(part)} Features below it are not built or checked by the kernel.`);
  // features that fail to build
  let kernelKind = null, note = null;
  if (!opt['no-build'] && part.features.length) {
    const pt = { ...part, rollback: null };
    const { k, r } = await regen(pt, opt);
    kernelKind = k.kind; note = k.note;
    for (const x of failing(pt, r)) add('error', 'build', x.feature, `does not build: ${x.message}`);
  } else if (opt['no-build']) note = 'Not built (--no-build): features that fail to build are not reported.';
  return { findings, kernel: kernelKind, note };
}

const HELP = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[1].replace(/^ \* ?/gm, '').trim();

// ---------------------------------------------------------------- main
try {
  const { pos, opt } = parseArgs(process.argv.slice(2));
  JSON_OUT = !!opt.json;
  const cmd = pos.shift();
  if (!cmd || opt.help || cmd === 'help') { process.stdout.write(HELP + '\n'); process.exitCode = cmd || opt.help ? 0 : 2; }
  else if (!Object.hasOwn(commands, cmd)) throw new Usage(`Unknown command "${cmd}". Commands: ${Object.keys(commands).join(', ')}.`);
  else await commands[cmd](pos, opt);
} catch (e) {
  const code = e instanceof Usage ? 2 : e.problem ? 1 : 1;
  if (JSON_OUT) process.stdout.write(JSON.stringify({ ok: false, error: e.message, usage: e instanceof Usage }) + '\n');
  else process.stderr.write((e instanceof Usage ? 'usage: ' : 'error: ') + e.message + '\n');
  process.exitCode = code;
}
