#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rain-big.mjs — EG.69 "Make it rain" at a size the VPS must not run (KICKOFF rule 25): a few million cells of made-up ground (hills, a tilt, a walled pit)
 * under a 10-minute storm and a 5-minute tail. Run on workstation11a:
 *   tools/gpu-remote/run.sh --session civil-part-2 --wsl --with public_html/assets/apps/civilcraft/dev/rain.js -- tools/civilcraft-test/rain-big.mjs [--n 1600] [--minutes 15]
 * Prints the machine line, cells, steps, seconds, cell-updates per second, mass closure and the outflow peak.
 */
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const R = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/civilcraft/dev/rain.js')).href);
const n = arg('--n', 1600), minutes = arg('--minutes', 15), cell = 2;
const z = new Float64Array(n * n);
for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
  const x = i * cell, y = j * cell;
  z[j * n + i] = 50 - 0.02 * y + 3 * Math.sin(x / 120) * Math.cos(y / 90) + 1.5 * Math.sin(x / 31 + y / 47);
}
const dem = R.demFromGrid(z, n, n, cell);
const sim = new R.RainSim(dem, { rain: 60, duration: 10, tEnd: minutes, n: 0.035, lossRate: 5, abstraction: 1, edge: 'open', dtMax: 5, frames: 2, frameBytes: 64e6 });
const t0 = Date.now();
const res = sim.run();
const secs = (Date.now() - t0) / 1000;
const cpu = os.cpus();
console.log(`machine: ${cpu[0].model.trim()} x${cpu.length}, ${(os.totalmem() / 2 ** 30).toFixed(0)} GB, node ${process.version}, ${os.platform()} ${os.arch()}`);
console.log(`rain-big: ${res.cells} cells, ${res.steps} steps, ${secs.toFixed(1)} s, ${((res.cells * res.steps) / secs / 1e6).toFixed(1)} M cell-updates/s`);
console.log(`volumes (m3): rain ${res.volumes.rain.toFixed(0)} loss ${res.volumes.loss.toFixed(0)} out ${res.volumes.out.toFixed(0)} stored ${res.volumes.stored.toFixed(0)} closure error ${res.volumes.error.toExponential(2)}`);
console.log(`peak outflow ${res.peak.q.toFixed(2)} m3/s at ${(res.peak.t / 60).toFixed(1)} min; ponds ${res.ponds.length}, overtopped ${res.ponds.filter((p) => p.overtopped).length}`);
const ok = Math.abs(res.volumes.error) < 1e-3;
console.log(ok ? 'PASS mass closes' : 'FAIL mass does not close');
process.exit(ok ? 0 : 1);
