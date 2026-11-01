#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ground-50m.mjs — SU.935 at the size the VPS must not run (KICKOFF rule 25; 0.8 round 3, civil_PART_3): a made-up drone survey of about 50 million unclassified points
 * (4 points a m² over 3.5 km × 3.5 km: the 300 m scene of drone-scene.mjs repeated, on one big smooth terrain), written as a LAS 1.2 file, then read the way CivilCraft's
 * "Find the ground myself" reads it — readLasHeader, the 2 MB streaming scan, Thinner (lowest per cell) — and classified by classifyGround. The file is made inside the run
 * and removed at its end (nothing is kept on the workstation); pass --keep to keep it.
 *
 *   tools/gpu-remote/run.sh --session civil-part-3 --wsl --with public_html/assets/apps/civilcraft/dev -- tools/civilcraft-test/ground-50m.mjs [--side 3536] [--cell 1]
 *   node tools/civilcraft-test/ground-50m.mjs --side 300        (a small run anywhere: 360 000 points)
 *
 * Prints the machine line, the file size, points a second for writing, scanning and thinning, the classify time, the peak memory and the truth checks (RMS of the ground
 * against the terrain, roofs and canopies kept as ground). PASS needs RMS < 0.15 m, no roof kept, canopies under 0.1 % of the ground points.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
// a 50-million-point run needs a bigger heap than Node's default: start again with one (the child does the work)
if (!process.argv.includes('--child') && !process.execArgv.some((a) => a.startsWith('--max-old-space-size'))) {
  try { execFileSync(process.execPath, ['--max-old-space-size=14336', fileURLToPath(import.meta.url), ...process.argv.slice(2), '--child'], { stdio: 'inherit' }); process.exit(0); } catch (e) { process.exit(e.status || 1); }
}
const SIDE = arg('--side', 3536), CELL = arg('--cell', 1), KEEP = process.argv.includes('--keep');
const APP = path.join(ROOT, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
// vendor files are reached through `current` symlinks, which the runner's rsync does not carry: fall back to the one versioned folder beside it
const vend = (m) => { const p = path.join(ROOT, 'public_html', m); if (fs.existsSync(p)) return p; const dir = path.dirname(path.dirname(p)); const v = fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x !== 'current')[0] : null; return v ? path.join(dir, v, path.basename(p)) : p; };
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(vend(m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const LAS = await mod('las.js'), TH = await mod('thin.js'), GC = await mod('ground-classify.js');
const SC = await import(pathToFileURL(path.join(HERE, 'drone-scene.mjs')).href);
const { SIZE: TILE, X0, Y0, terrainZ, standing, trees, rng } = SC;
const cpu = os.cpus();
console.log(`machine: ${cpu[0].model.trim()} x${cpu.length}, ${(os.totalmem() / 2 ** 30).toFixed(0)} GB, node ${process.version}, ${os.platform()} ${os.arch()}`);

// ---- the scene: a tile of buildings and trees (1 m raster) repeated; the terrain is one smooth surface over everything
const T = trees(), occ = new Uint8Array(TILE * TILE), occH = new Float32Array(TILE * TILE);
for (let u = 0; u < TILE; u++) for (let v = 0; v < TILE; v++) { const s = standing(u + 0.5, v + 0.5, T); if (s) { occ[u * TILE + v] = s.kind === 'building' ? 1 : 2; occH[u * TILE + v] = s.h; } }
const stand = (u, v) => { const k = (Math.floor(u) % TILE) * TILE + (Math.floor(v) % TILE); return occ[k] ? { kind: occ[k] === 1 ? 'building' : 'tree', h: occH[k] } : null; };

// ---- write the LAS (format 0, 20 bytes a point, unclassified), in 2 million point pieces
const N = Math.round(SIDE * SIDE * 4), file = path.join(ROOT, 'tmp', 'ground-50m-' + process.pid + '.las');
fs.mkdirSync(path.dirname(file), { recursive: true });
const sc = 0.001, rec = 20, r = rng(12345);
const hdr = Buffer.alloc(227);
hdr.write('LASF', 0, 'latin1'); hdr[24] = 1; hdr[25] = 2; hdr.writeUInt16LE(227, 94); hdr.writeUInt32LE(227, 96); hdr[104] = 0; hdr.writeUInt16LE(rec, 105); hdr.writeUInt32LE(N + 200, 107);
[sc, sc, sc, X0, Y0, 0].forEach((v, k) => hdr.writeDoubleLE(v, 131 + 8 * k));
const hi = terrainZ(X0 + SIDE, Y0) + 30;
[X0 + SIDE, X0, Y0 + SIDE, Y0, hi, 0].forEach((v, k) => hdr.writeDoubleLE(v, 179 + 8 * k));
const fd = fs.openSync(file, 'w'); fs.writeSync(fd, hdr);
let t0 = Date.now(), written = 0; const PER = 2e6;
const put = (buf, o, x, y, z) => { buf.writeInt32LE(Math.round((x - X0) / sc), o); buf.writeInt32LE(Math.round((y - Y0) / sc), o + 4); buf.writeInt32LE(Math.round(z / sc), o + 8); };
while (written < N) {
  const n = Math.min(PER, N - written), buf = Buffer.alloc(n * rec);
  for (let i = 0; i < n; i++) {
    const u = r() * SIDE, v = r() * SIDE, g = terrainZ(X0 + u, Y0 + v), s = stand(u, v);
    let z = g + (r() - 0.5) * 0.06;
    if (s?.kind === 'building') z = g + s.h + (r() - 0.5) * 0.04;
    else if (s?.kind === 'tree') { if (r() < 0.12) z = g + (r() - 0.5) * 0.06; else z = g + s.h * (0.5 + r() * 0.5); }
    put(buf, i * rec, X0 + u, Y0 + v, z);
  }
  fs.writeSync(fd, buf); written += n;
}
const stray = Buffer.alloc(200 * rec); for (let i = 0; i < 200; i++) { const u = r() * SIDE, v = r() * SIDE; put(stray, i * rec, X0 + u, Y0 + v, terrainZ(X0 + u, Y0 + v) - 6 - r() * 10); }
fs.writeSync(fd, stray); fs.closeSync(fd);
const gen = (Date.now() - t0) / 1000, bytes = fs.statSync(file).size;
console.log(`file: ${(N + 200).toLocaleString('en')} points, ${(bytes / 1e6).toFixed(0)} MB, written in ${gen.toFixed(1)} s (${((N / gen) / 1e6).toFixed(1)} M points/s); side ${SIDE} m`);

// ---- read it as CivilCraft does
const blob = await fs.openAsBlob(file);
const h = await LAS.readLasHeader(blob);
console.log(`header: ${h.count.toLocaleString('en')} points, record ${h.recordLength} bytes`);
const th = new TH.Thinner({ cell: CELL, mode: 'lowest', origin: [X0, Y0] });
t0 = Date.now();
const classes = new Set();
await LAS.scanPoints(blob, h, (x, y, z, c) => { classes.add(c); th.add(x, y, z, c); });
const scan = (Date.now() - t0) / 1000;
const thin = th.points();
console.log(`scan + thin: ${scan.toFixed(1)} s (${((h.count / scan) / 1e6).toFixed(2)} M points/s), classes ${[...classes].join(',')}, ${thin.length.toLocaleString('en')} cells of ${CELL} m; rss ${(process.memoryUsage().rss / 2 ** 30).toFixed(2)} GB`);
const cells = Math.ceil(SIDE / CELL) ** 2;
if (cells > 20e6) console.log(`note: ${cells.toLocaleString('en')} cells is over the 20 million the import dialog allows; the dialog would ask for a coarser cell`);

// ---- classify
t0 = Date.now();
const res = GC.classifyGround(thin, { cell: CELL, maxObject: 40, slope: 0.3, initialHeight: 0.4, maxHeight: 3, maxCells: 40e6 });
const cls = (Date.now() - t0) / 1000;
let s2 = 0, worst = 0, onBuilding = 0, onTree = 0;
for (const p of res.ground) {
  const e = p.z - terrainZ(p.x, p.y); s2 += e * e; worst = Math.max(worst, Math.abs(e));
  const s = stand(p.x - X0, p.y - Y0);
  if (s?.kind === 'building' && Math.abs(e) > 0.5) onBuilding++;
  if (s?.kind === 'tree' && Math.abs(e) > 0.5) onTree++;
}
const rms = Math.sqrt(s2 / res.ground.length);
console.log(`classify: ${cls.toFixed(1)} s; ground ${res.ground.length.toLocaleString('en')} of ${thin.length.toLocaleString('en')} cells (objects ${res.counts.objects.toLocaleString('en')}, stray low ${res.counts.lowNoise}); RMS ${rms.toFixed(3)} m, worst ${worst.toFixed(3)} m, on roofs ${onBuilding}, in canopy ${onTree}; windows ${JSON.stringify(res.windows)}; peak rss ${(process.memoryUsage().rss / 2 ** 30).toFixed(2)} GB`);
if (!KEEP) fs.rmSync(file, { force: true });
const pass = rms < 0.15 && onBuilding === 0 && onTree <= res.ground.length * 1e-3 && res.counts.lowNoise >= 195;
console.log(pass ? 'PASS the ground is found: RMS under 15 cm, no roof kept, canopies under 0.1 %, the stray low points dropped' : 'FAIL see the numbers above');
process.exit(pass ? 0 : 1);
