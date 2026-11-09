/* SPDX-License-Identifier: Apache-2.0 */
/**
 * runner.js — how a Chip design stage reaches the person's own tools (0.9 HD.4–HD.9). DOM-free; imports ./zip.js.
 *
 * ONE bridge, the one Studio already has: engines.rs's add-on run (docs/ADDONS-SPEC.md § 16; `window.cadcraftDesktop.engines.addonFind /
 * addonPick / addonStart / status / result / cancel`, desktop-shell bridge.js). The add-on declares
 *     { addon: 'chip', programs: ['node'], script: 'engine/cc-chip-run.mjs', args: ['{script}', '{job}'] }
 * and hands a stored zip: the stage's input files + chip-job.json (the steps) + the script itself (from the add-on's own files). Studio
 * asks the person once ("The add-on … wants to run the program node …"), runs the script in a fresh folder, and returns out/result.zip.
 * The web edition has no bridge: `saveForHand` gives the same package as a file to run by hand (README inside).
 *
 *   DECL                                         the add-on's run declaration
 *   makePackage({ files, steps, collect, toolsDir, pdkDir, script, stepSeconds }) → Uint8Array (stored zip)
 *   studioRunner(bridge, { script, name }) → { kind: 'studio', available() → {ok, why}, run(pkg, {signal, onProgress, pollMs}) → {files, record} }
 *   resultOf(zipBytes) → { files: {name: Uint8Array}, record }      record = cc-run.json (steps, exit codes, ok)
 *   handReadme() → text
 */
import { zipStored, unzipStored } from './zip.js';

export const SCRIPT = 'engine/cc-chip-run.mjs';
export const DECL = Object.freeze({ addon: 'chip', name: 'Chip design', programs: ['node'], script: SCRIPT, args: ['{script}', '{job}'] });

export function handReadme() {
  return [
    'Chip design run package (CadCraft).',
    '',
    'This folder holds a stage of your chip project: the input files, chip-job.json (the steps, in order) and engine/cc-chip-run.mjs,',
    'a small Node script that starts YOUR installed tools (Icarus Verilog, Verilator, Yosys, OpenROAD, KLayout, Netgen) as separate',
    'programs. Nothing is bundled. To run it by hand:',
    '',
    '    node engine/cc-chip-run.mjs chip-job.json',
    '',
    'It writes out/result.zip; open it in the Chip design panel with "Open a result" to see the reports, waves and layout.',
    '',
  ].join('\n');
}

export function makePackage({ files = {}, steps = [], collect = ['out/'], toolsDir = '', pdkDir = '', script, stepSeconds = 3600 } = {}) {
  if (!(script instanceof Uint8Array) || !script.length) throw new Error('makePackage: the run script is missing');
  const job = { format: 'cadcraft-chip-job', version: 1, toolsDir, pdkDir, stepSeconds, steps, collect };
  const all = { ...files, 'chip-job.json': JSON.stringify(job, null, 2), [SCRIPT]: script, 'README.txt': handReadme() };
  return zipStored(all);
}

export function resultOf(bytes) {
  const files = unzipStored(bytes);
  let record = null;
  if (files['cc-run.json']) { try { record = JSON.parse(new TextDecoder().decode(files['cc-run.json'])); } catch { record = null; } delete files['cc-run.json']; }
  return { files, record };
}

const sleep = (ms, signal) => new Promise((res) => { const t = setTimeout(res, ms); signal?.addEventListener('abort', () => { clearTimeout(t); res(); }, { once: true }); });
const fail = (code, message = code) => Object.assign(new Error(message), { code });   // i18n-ignore: caught by the caller
const codeOf = (e) => { const m = /^([a-z0-9_]+):/.exec(String((e && e.message) || e || '')); return m ? m[1] : (e && e.code) || 'bridge'; };

/** The bridge, or null on the web / tablets / a Studio without engines. */
export function chipBridge(win = globalThis) {
  const b = win && win.cadcraftDesktop && win.cadcraftDesktop.engines;
  return b && typeof b.addonStart === 'function' && typeof b.status === 'function' ? b : null;
}

export function studioRunner(bridge, { script, name = DECL.name } = {}) {
  const decl = { ...DECL, name, programs: DECL.programs.slice(), args: DECL.args.slice() };
  return {
    kind: 'studio',
    decl,
    async available() {
      if (!bridge) return { ok: false, why: 'studio_only' };
      try { const r = await bridge.addonFind(decl); return r && r.found ? { ok: true, program: r.program || 'node', allowed: !!r.allowed } : { ok: false, why: 'no_node' }; } catch (e) { return { ok: false, why: codeOf(e) === 'unsupported' ? 'studio_only' : 'unknown' }; }
    },
    async run(pkg, { signal = null, onProgress = null, pollMs = 300 } = {}) {
      if (!bridge) throw fail('studio_only');
      let found = await bridge.addonFind(decl).catch(() => null);
      if (!found || !found.found) { const picked = await bridge.addonPick(decl).catch(() => null); if (!picked) throw fail('no_node'); }
      let job;
      try { job = await bridge.addonStart(decl, pkg, {}); } catch (e) { throw fail(codeOf(e), String((e && e.message) || e)); }
      for (;;) {
        if (signal?.aborted) { try { await bridge.cancel(job); } catch { /* finished already */ } throw fail('cancelled'); }
        let s;
        try { s = await bridge.status(job); } catch (e) { throw fail('bridge', String((e && e.message) || e)); }
        onProgress?.(Math.max(0, Math.min(1, Number(s.progress) || 0)), s.log || []);
        if (s.state === 'done') return resultOf(await bridge.result(job));
        if (s.state === 'failed' || s.state === 'cancelled') throw fail(s.error || s.state, (s.log || []).slice(-5).join('\n'));
        await sleep(pollMs, signal);
      }
    },
  };
}
