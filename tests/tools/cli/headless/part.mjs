/* SPDX-License-Identifier: Apache-2.0 */
/**
 * part.mjs — PartCraft without a screen (0.7 AS.4; docs/AGENTS-SPEC.md §2): the app's own part document (part.js), mesh
 * kernel (kernel.js on manifold-3d from the vendor folder) and assistant functions (agents.js), loaded from the build.
 *
 *   const s = await PartSession.open(bytes, 'Bracket.partcraft.json');
 *   s.regen() · s.set(name, value, label) (one undo step) · s.undo(steps, {any, prefix}) · s.save() → bytes
 *   await s.script(source, {lang, file, budget}) → {ok, error?, printed, displayed, variables}
 *
 * Scripts run in this process, sealed as in the Script workspace's worker: no files (an in-memory store), no network, the
 * built solid as `part`, the parameters through param() / params(). CraftScript always; Lua and Python when their runtimes
 * (wasmoon, CPython for WASI) are in the vendor folder (the repository), not in the npm package.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load, vendorDir } from './apps.mjs';

const APP = 'partcraft';
let M = null;
export async function partModules() {
  if (M) return M;
  const [P, K, A, CS] = await Promise.all([load(APP, 'part.js'), load(APP, 'kernel.js'), load(APP, 'agents.js'), load(APP, 'cs-all.js')]);
  const dir = vendorDir('manifold-3d');
  if (!dir) throw new Error('PartCraft needs manifold-3d (its vendor folder) to build parts.');
  const { default: Module } = await import(pathToFileURL(path.join(dir, 'manifold.js')).href);
  const man = await Module({ locateFile: (f) => path.join(dir, f) });
  man.setup();
  M = { P, K, A, CS, man };
  return M;
}

export class PartSession {
  constructor(part, m) { this.part = part; this.m = m; this.hist = new m.P.History(); this.cache = null; }

  static async open(bytes, name) {
    const m = await partModules();
    const base = String(name).replace(/^.*[\\/]/, '');
    if (!/\.json$/i.test(base)) throw new Error('PartCraft opens .partcraft.json parts here; "' + base + '" is not one.');
    let raw;
    try { raw = JSON.parse(new TextDecoder().decode(bytes)); } catch (e) { throw new Error(base + ' is not a PartCraft part (' + e.message + ').'); }
    if (raw && raw.format === 'partcraft-assembly') throw new Error(base + ' is an assembly; the PartCraft tools here work on parts.');
    return new PartSession(m.P.readPart(raw), m);
  }

  /** The built part (cached until the part changes). */
  regen() {
    const key = JSON.stringify(this.part);
    if (!this.cache || this.cache.key !== key) this.cache = { key, r: this.m.K.regenerate(this.part, this.m.man) };
    return this.cache.r;
  }

  /** agents.js setParameter as one undo step `label` (tried on a copy first: a refusal changes nothing). */
  set(name, value, label) {
    const trial = JSON.parse(JSON.stringify(this.part));
    const t = this.m.A.setParameter(trial, name, value);
    if (!t.ok) throw new Error(t.error);
    this.hist.push(this.part, label);
    return this.m.A.setParameter(this.part, name, value);
  }

  undo(steps = 1, { any = false, prefix = 'Assistant: ' } = {}) {
    const undone = [];
    for (let i = 0; i < steps; i++) {
      const top = this.hist.undoStack[this.hist.undoStack.length - 1];
      if (!top || (!any && !String(top.label).startsWith(prefix))) break;
      const r = this.hist.undo(this.part);
      this.part = this.m.P.readPart(r.part);
      undone.push(r.label);
    }
    return undone;
  }

  save() { return new TextEncoder().encode(this.m.P.toJSON(this.part)); }

  async script(source, { lang = 'craft', file = 'assistant.craft', budget = 2e9 } = {}) {
    const { CS, A } = this.m;
    const { model, params } = A.scriptPart(this.part, this.regen());
    const prints = [], displayed = {};
    CS.IO.setIoHost(CS.IO.memoryFs({ part: model, params }));   // sealed: an in-memory store, never the disk
    const libDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'apps', APP, 'craftlib');
    const devLib = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', 'public_html/assets/apps', APP, 'dev', 'craftlib');
    const lib = [libDir, devLib].find((d) => fs.existsSync(d));
    const library = (name) => {
      if (!lib || !/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(name)) return null;
      for (const ext of ['.craft', '.m', '.lua']) { const p = path.join(lib, name + ext); if (fs.existsSync(p)) return { source: fs.readFileSync(p, 'utf8'), file: name + ext, lang: ext === '.lua' ? 'lua' : 'craft' }; }
      return null;
    };
    const rt = CS.makeRuntime({ budget, library, onPrint: (s) => { if (prints.length < 4000) prints.push(String(s)); },
      onDisplay: (cmd) => { const k = cmd.show ? 'show ' + cmd.show : Object.keys(cmd).find((x) => x !== 'opts') || 'display'; displayed[k] = (displayed[k] || 0) + 1; } });
    let r;
    try { r = await rt.run(String(source), { file, lang }); }
    catch (e) { if (lang !== 'craft' && /vendor|wasm|ENOENT|Cannot find module/i.test(String(e && e.message))) throw new Error((lang === 'lua' ? 'Lua' : 'Python') + ' is not in this copy of the CadCraft tools (its runtime is not installed beside it); CraftScript runs everywhere.'); throw e; }
    const missing = (msg) => lang !== 'craft' && /vendor|wasm|ENOENT|Cannot find module/i.test(String(msg || ''));
    if (!r.ok && r.error && missing(r.error.message)) r = { ...r, error: { message: (lang === 'lua' ? 'Lua' : 'Python') + ' is not in this copy of the CadCraft tools (its runtime is not installed beside it); CraftScript runs everywhere.' } };
    const vars = rt.ws && rt.ws.map ? [...rt.ws.map.keys()].slice(0, 200) : [];
    return { ok: !!r.ok, ...(r.error ? { error: r.error } : {}), printed: prints.join('').split('\n').slice(0, 2000), displayed, variables: vars, steps: r.steps };
  }
}
