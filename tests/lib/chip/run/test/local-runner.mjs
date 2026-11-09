/* SPDX-License-Identifier: Apache-2.0 */
/**
 * local-runner.mjs — test only: does what Studio's engines.rs add-on run does (unzip the package into a fresh folder, start
 * `node engine/cc-chip-run.mjs <folder>/cc-engine-job.json`, read out/result.zip back), in Node, with no Studio. Also a stand-in bridge
 * with the same calls as window.cadcraftDesktop.engines (addonFind / addonPick / addonStart / status / result / cancel).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { unzipStored } from '../zip.js';

export function runPackage(pkg, { keep = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-chip-test-'));
  for (const [name, data] of Object.entries(unzipStored(pkg))) { const p = path.join(dir, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); }
  fs.writeFileSync(path.join(dir, 'cc-engine-job.json'), '{}');
  const r = spawnSync(process.execPath, [path.join(dir, 'engine/cc-chip-run.mjs'), path.join(dir, 'cc-engine-job.json')], { cwd: dir, encoding: 'utf8', timeout: 120000 });
  const lines = (r.stdout || '').split('\n');
  const res = lines.find((l) => l.startsWith('CCRESULT '));
  const bytes = res ? new Uint8Array(fs.readFileSync(path.join(dir, res.slice(9).trim()))) : null;
  if (!keep) fs.rmSync(dir, { recursive: true, force: true });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, bytes, lines, dir };
}

export function standInBridge({ found = true } = {}) {
  const calls = [], jobs = new Map();
  let n = 0;
  return {
    calls,
    addonFind: async (decl) => { calls.push(['addonFind', JSON.stringify(decl)]); return { found, program: 'node', allowed: true }; },
    addonPick: async (decl) => { calls.push(['addonPick', decl.addon]); return found ? { found: true } : null; },
    addonStart: async (decl, bytes, settings) => { calls.push(['addonStart', decl.addon, bytes.length, JSON.stringify(settings)]); const id = ++n; jobs.set(id, runPackage(bytes)); return id; },
    status: async (id) => { const j = jobs.get(id); return j.bytes ? { state: 'done', progress: 1, error: '', log: j.lines.slice(-5) } : { state: 'failed', progress: 0, error: 'script_failed', log: [j.stderr] }; },
    result: async (id) => jobs.get(id).bytes,
    cancel: async () => {},
  };
}
