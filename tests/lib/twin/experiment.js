/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library. */
/**
 * experiment.js — compare layouts (0.9 TW.4): repeat runs with common random numbers, Student t intervals on the paired differences, and a bottleneck ranking. DOM-free; the flow code is handed in.
 *
 *   parsePatch('station-1.servers=2, conveyor-1.speed=1') → { patch: [{id, param, value}], bad: [text] }
 *   applyPatch(layout, patch, clean) → a new layout (clean = flow's cleanParams-checked cleanLayout)
 *   await compare({ layout, variants: [{name, patch}], flow: {buildGraph, simulate, cleanLayout}, runs, hours, warmup, seed, onProgress }) →
 *       { base, rows: [{name, perHour, leadMean, leadP95, wip, diff: {perHour: {mean, half, verdict}, leadMean: …}}], problems }
 *   bottlenecks(result) → [{id, type, score, utilisation, blocked, queueMean}]   highest first
 *   suggestPatch(bottleneck, layout) → patch text | ''
 */
const T975 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042];
export const t975 = (df) => (df < 1 ? Infinity : df <= 30 ? T975[df - 1] : df <= 60 ? 2.0 : df <= 120 ? 1.98 : 1.96);
export function meanHalf(xs) {
  const n = xs.length, m = xs.reduce((a, x) => a + x, 0) / (n || 1);
  if (n < 2) return { mean: m, half: Infinity, n };
  const s2 = xs.reduce((a, x) => a + (x - m) ** 2, 0) / (n - 1);
  return { mean: m, half: t975(n - 1) * Math.sqrt(s2 / n), n };
}

export function parsePatch(text) {
  const patch = [], bad = [];
  for (const part of String(text || '').split(/[,\n]/)) {
    const s = part.trim(); if (!s) continue;
    const m = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_]+)\s*=\s*(-?[0-9.]+(?:e-?\d+)?|[A-Za-z-]+)$/.exec(s);
    if (!m) { bad.push(s); continue; }
    const n = Number(m[3]);
    patch.push({ id: m[1], param: m[2], value: Number.isFinite(n) ? n : m[3] });
  }
  return { patch, bad };
}

export function applyPatch(layout, patch, cleanLayout) {
  const out = JSON.parse(JSON.stringify(layout)), missing = [];
  for (const p of patch) {
    if (p.id === 'fleet') { out.fleet = { ...out.fleet, [p.param]: p.value }; continue; }
    const it = out.items.find((i) => i.id === p.id);
    if (!it) { missing.push(p.id); continue; }
    // a distribution's mean: "station-1.time=30" is the time in seconds, kept as its kind where it has a mean, else constant
    if (it.params[p.param] && typeof it.params[p.param] === 'object') {
      const d = it.params[p.param];
      it.params[p.param] = d.kind === 'const' ? { kind: 'const', v: p.value } : { ...d, mean: p.value };
    } else if (p.param in it.params) it.params[p.param] = p.value;
    else missing.push(p.id + '.' + p.param);
  }
  return { layout: cleanLayout ? cleanLayout(out).layout : out, missing };
}

const METRICS = { perHour: (r) => r.perHour, leadMean: (r) => r.lead.mean, leadP95: (r) => r.lead.p95, wip: (r) => r.wip };
const BIGGER_BETTER = { perHour: true, leadMean: false, leadP95: false, wip: false };
const tick = () => new Promise((res) => setTimeout(res, 0));

export async function compare({ layout, variants = [], flow, runs = 5, hours = 8, warmup = 30, seed = 1, onProgress = null, isCancelled = null }) {
  const all = [{ name: 'Base', patch: [] }, ...variants];
  const rows = [], problems = [];
  let done = 0;
  const total = all.length * runs;
  for (const v of all) {
    const { layout: L, missing } = applyPatch(layout, v.patch, flow.cleanLayout);
    if (missing.length) problems.push({ variant: v.name, code: 'missing', items: missing });
    const built = flow.buildGraph(L);
    if (built.problems.length) { problems.push({ variant: v.name, code: 'layout', items: built.problems.map((p) => p.code) }); rows.push({ name: v.name, skipped: true }); done += runs; continue; }
    const samples = { perHour: [], leadMean: [], leadP95: [], wip: [] };
    let last = null;
    for (let i = 0; i < runs; i++) {
      if (isCancelled && isCancelled()) return { cancelled: true, rows, problems };
      const r = flow.simulate(built.graph, { seed: seed + i, until: hours * 3600, warmup: warmup * 60 });
      if (!r.ok) { problems.push({ variant: v.name, code: (r.failed && r.failed.code) || 'failed' }); break; }
      for (const k of Object.keys(samples)) samples[k].push(METRICS[k](r));
      last = r; done++;
      if (onProgress) onProgress(done / total);
      await tick();
    }
    rows.push({ name: v.name, samples, last, perHour: meanHalf(samples.perHour), leadMean: meanHalf(samples.leadMean), leadP95: meanHalf(samples.leadP95), wip: meanHalf(samples.wip) });
  }
  const base = rows[0];
  for (const r of rows.slice(1)) {
    if (r.skipped || !r.samples || !base.samples) continue;
    r.diff = {};
    for (const k of Object.keys(METRICS)) {
      const n = Math.min(r.samples[k].length, base.samples[k].length);
      const d = meanHalf(Array.from({ length: n }, (_, i) => r.samples[k][i] - base.samples[k][i]));
      const clear = Number.isFinite(d.half) && Math.abs(d.mean) > d.half;
      const better = d.mean > 0 === BIGGER_BETTER[k];
      r.diff[k] = { ...d, verdict: !clear ? 'no-clear-difference' : better ? 'better' : 'worse' };
    }
  }
  return { base, rows, problems, runs, hours };
}

export function bottlenecks(result) {
  const out = [];
  for (const [id, s] of Object.entries(result.elements || {})) {
    if (s.type === 'station') out.push({ id, type: 'station', utilisation: s.utilisation, blocked: s.blocked, queueMean: s.queueMean, servers: s.servers, availability: s.availability, score: s.utilisation - s.blocked + Math.min(0.2, (s.queueMean || 0) / 100) });
    else if (s.type === 'conveyor' && s.availability !== undefined && s.availability < 0.98) out.push({ id, type: 'conveyor', utilisation: 1 - s.availability, blocked: s.blockedFraction, queueMean: s.onMean, score: 1 - s.availability });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function suggestPatch(b, layout) {
  if (!b) return '';
  const it = layout.items.find((i) => i.id === b.id);
  if (it && it.kind === 'station') return `${b.id}.servers=${(it.params.servers || 1) + 1}`;
  return '';
}
