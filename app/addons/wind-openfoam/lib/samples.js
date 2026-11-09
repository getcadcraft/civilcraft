/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * samples.js — turns the runner's cc-samples.json ({ time, n, U:[[u,v,w]|null], p:[number|null] }, one entry per probe point in the order the case writer gave) into
 * the pedestrian-height speed-ratio grid that lib/wind/study.js classify() takes (wind-openfoam add-on).
 *   speedRatioGrid(samples, probes, Uref) → Float32Array(n*n) of |U| / Uref (NaN where the point was outside the mesh)
 */
export function speedRatioGrid(samples, probes, Uref) {
  const n = probes.n, out = new Float32Array(n * n).fill(NaN);
  if (!samples || !Array.isArray(samples.U) || samples.U.length < n * n) throw new Error('samples do not cover the probe grid');
  for (let i = 0; i < n * n; i++) { const u = samples.U[i]; if (u && Number.isFinite(u[0])) out[i] = Math.hypot(u[0], u[1], u[2]) / Uref; }
  return out;
}

/**
 * OpenFOAM's own `probes` output (postProcessing/probes/<time>/U and /p; works on OpenFOAM v2512, aborted in the Ubuntu v1912 package). Lines: "# Probe n (x y z)" for each probe
 * (with "not found" appended when it fell outside the mesh), then rows "time  (u v w) (u v w) ...".
 *   parseProbes(text) → { n, found: [bool], time, values: [[u,v,w] | number | null] }   of the LAST row
 *   samplesFromProbes(Utext, ptext) → { time, n, U, p } in the shape of cc-samples.json
 */
export function parseProbes(text) {
  const found = [], rows = [];
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (line[0] === '#') { const m = /^#\s*Probe\s+(\d+)\s*\(([^)]*)\)(.*)$/.exec(line); if (m) found[Number(m[1])] = !/not found/i.test(m[3]); continue; }
    const t = /^\s*(\S+)/.exec(line); if (!t) continue;
    const rest = line.slice(line.indexOf(t[1]) + t[1].length), vecs = [...rest.matchAll(/\(([^)]*)\)/g)];
    rows.push({ t: Number(t[1]), v: vecs.length ? vecs.map((x) => x[1].trim().split(/\s+/).map(Number)) : rest.trim().split(/\s+/).filter(Boolean).map(Number) });
  }
  const last = rows[rows.length - 1]; if (!last) throw new Error('no probe rows');
  const idx = found.map((f, i) => (f ? i : -1)).filter((i) => i >= 0), values = new Array(found.length).fill(null);
  if (last.v.length === found.length) last.v.forEach((x, i) => { values[i] = found[i] ? x : null; }); else idx.forEach((pi, c) => { values[pi] = last.v[c] ?? null; });
  return { n: found.length, found, time: last.t, values };
}
export function samplesFromProbes(Utext, ptext) {
  const U = parseProbes(Utext), p = ptext ? parseProbes(ptext) : null;
  return { time: U.time, n: U.n, U: U.values, p: p ? p.values : U.values.map(() => null), cells: null, source: 'probes' };
}
