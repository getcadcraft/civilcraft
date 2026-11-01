/* SPDX-License-Identifier: Apache-2.0 */
/**
 * batch.js — batch and bioprocess (0.8 Track CH, CH.6). DOM-free, deterministic.
 *
 *   schedule(recipe, opts)       a recipe's steps placed on the plant's equipment for n batches: start, finish, which vessel, occupancy, utilisation
 *   toScheduleTasks(sched, o)    the same as tasks for BimCraft's schedule view (schedule-io.js ganttSvg; whole days) — SU.931's Gantt
 *   occupancySvg(sched, opts)    a Gantt by equipment in hours (what a batch plant is read by)
 *   fermentation(par, opts)      Monod growth in a batch or fed-batch vessel: biomass X, substrate S, product P, volume V (rk45)
 *   inventory(components, ops)   batch mass balance by moles of each component: charge, transfer, react, discharge; closes by atoms
 *
 * recipe = { name, equipment: [{ id, cls, cap?, clean? (h cleaning after a batch leaves the vessel) }],
 *            steps: [{ id, name, cls | equip | sameAs (the vessel an earlier step used), dur (h), after?: [step ids], size? (same unit as cap) }] }   steps are listed so predecessors come first
 */
import { rk45 } from './numeric.js';
import { COMPONENTS, atoms } from './data.js';
import { problem } from './report.js';

export function schedule(recipe, { batches = 1, interval = 0, start = 0 } = {}) {
  const eq = recipe.equipment || [], free = Object.fromEntries(eq.map((e) => [e.id, start])), busy = Object.fromEntries(eq.map((e) => [e.id, []]));
  const problems = [], tasks = [], ids = new Set();
  for (const s of recipe.steps) {
    if (ids.has(s.id)) throw new Error('step id ' + s.id + ' is used twice'); ids.add(s.id);
    for (const a of s.after || []) if (!ids.has(a)) throw new Error('step ' + s.id + ' comes after ' + a + ', which is not listed before it');
    if (!(s.dur >= 0)) throw new Error('step ' + s.id + ' needs a duration in hours');
    if (!s.equip && !s.sameAs && !eq.some((e) => e.cls === s.cls)) throw new Error('step ' + s.id + ' needs equipment of class ' + s.cls + ', and the plant has none');
  }
  const lastUse = (s) => !recipe.steps.some((q) => q.sameAs === s.id);   // cleaning follows the last step a batch spends in a vessel
  for (let b = 0; b < batches; b++) {
    const done = {}, where = {}, release = start + b * interval;
    for (const s of recipe.steps) {
      const ready = Math.max(release, ...(s.after || []).map((a) => done[a]), release);
      const pool = s.sameAs ? eq.filter((e) => e.id === where[s.sameAs]) : s.equip ? eq.filter((e) => e.id === s.equip) : eq.filter((e) => e.cls === s.cls);
      if (!pool.length) throw new Error('step ' + s.id + ' names equipment ' + (s.equip || where[s.sameAs]) + ', which is not in the plant');
      let best = null;
      for (const e of pool) { const t0 = Math.max(ready, free[e.id]); if (!best || t0 < best.t0 - 1e-12) best = { e, t0 }; }
      const t1 = best.t0 + s.dur;
      free[best.e.id] = t1 + (lastUse(s) ? best.e.clean || 0 : 0); busy[best.e.id].push({ batch: b + 1, step: s.id, start: best.t0, end: t1 });
      done[s.id] = t1; where[s.id] = best.e.id; tasks.push({ batch: b + 1, step: s.id, name: s.name || s.id, equip: best.e.id, start: best.t0, finish: t1, wait: best.t0 - ready });
      if (best.e.cap != null && s.size != null && s.size > best.e.cap) problems.push(problem('batch.capacity', 'error', `Batch ${b + 1}, step ${s.name || s.id}: ${s.size} does not fit ${best.e.id} (${best.e.cap}).`, [{ kind: 'unit', id: best.e.id }]));
    }
  }
  const makespan = Math.max(...tasks.map((t) => t.finish)) - start;
  const util = Object.fromEntries(eq.map((e) => [e.id, makespan > 0 ? busy[e.id].reduce((a, i) => a + (i.end - i.start), 0) / makespan : 0]));
  // the bottleneck class sets the steady rate: its total work (steps plus cleaning) per batch divided by how many vessels it has
  const clsOf = (s) => (s.sameAs ? clsOf(recipe.steps.find((q) => q.id === s.sameAs)) : s.cls || eq.find((e) => e.id === s.equip)?.cls);
  const byCls = {}; for (const s of recipe.steps) { const cls = clsOf(s); if (lastUse(s)) (byCls[cls] ||= { work: 0, n: eq.filter((e) => e.cls === cls).length, clean: 0, uses: 0 }).uses++; (byCls[cls] ||= { work: 0, n: eq.filter((e) => e.cls === cls).length, clean: 0, uses: 0 }).work += s.dur; }
  for (const cls of Object.keys(byCls)) { const es = eq.filter((e) => e.cls === cls); byCls[cls].clean = es.length ? Math.max(...es.map((e) => e.clean || 0)) : 0; }
  let cycle = 0, bottleneck = null;
  for (const [cls, v] of Object.entries(byCls)) { const c = (v.work + v.clean * v.uses) / Math.max(1, v.n); if (c > cycle) { cycle = c; bottleneck = cls; } }
  const first = tasks.filter((t) => t.batch === 1);
  return { tasks, occupancy: busy, makespan, utilisation: util, firstBatchHours: Math.max(...first.map((t) => t.finish)) - start, cycleHours: cycle, bottleneck, batchesPerDay: cycle > 0 ? 24 / cycle : null, problems };
}

/** Tasks for schedule-io.js: whole days since 1970-01-01 UTC (Finish inclusive), FS links between a batch's steps. `day0` = day number of hour 0. */
export function toScheduleTasks(sched, { day0 = 0 } = {}) {
  const uid = (t) => `b${t.batch}.${t.step}`;
  const bySt = new Map(sched.tasks.map((t) => [uid(t), t]));
  return sched.tasks.map((t) => {
    const s = day0 + Math.floor(t.start / 24 + 1e-9), f = day0 + Math.max(Math.floor((t.finish - 1e-9) / 24), Math.floor(t.start / 24 + 1e-9));
    const preds = (t.after || []).map((a) => ({ uid: `b${t.batch}.${a}`, type: 'FS', lag: 0 })).filter((p) => bySt.has(p.uid));
    return { uid: uid(t), name: `B${t.batch} ${t.name} (${t.equip})`, start: s, finish: f, stage: 'Batch ' + t.batch, package: t.equip, rows: [], preds };
  });
}
export function withLinks(sched, recipe) {   // adds `after` to each task from the recipe so toScheduleTasks can link them
  const aft = Object.fromEntries(recipe.steps.map((s) => [s.id, s.after || []]));
  return { ...sched, tasks: sched.tasks.map((t) => ({ ...t, after: aft[t.step] })) };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function occupancySvg(sched, { width = 960, rowH = 24, labelW = 90 } = {}) {
  const eqs = Object.keys(sched.occupancy), t1 = Math.max(1e-9, ...sched.tasks.map((t) => t.finish)), px = (width - labelW - 10) / t1, H = 30 + eqs.length * rowH + 6;
  const colours = ['#2e7dd1', '#c0392b', '#27ae60', '#d68910', '#8e44ad', '#16a085'];
  const s = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${H}" width="${width}" height="${H}" font-family="sans-serif" font-size="11" role="img">`];
  const step = t1 > 200 ? 24 : t1 > 60 ? 6 : t1 > 12 ? 2 : 1;
  for (let h = 0; h <= t1 + 1e-9; h += step) s.push(`<line x1="${(labelW + h * px).toFixed(1)}" y1="18" x2="${(labelW + h * px).toFixed(1)}" y2="${H}" stroke="#8884"/><text x="${(labelW + h * px + 2).toFixed(1)}" y="14" fill="currentColor">${h} h</text>`);
  eqs.forEach((e, i) => {
    const y = 30 + i * rowH; s.push(`<text x="4" y="${y + rowH * 0.65}" fill="currentColor">${esc(e)}</text>`);
    for (const o of sched.occupancy[e]) s.push(`<rect x="${(labelW + o.start * px).toFixed(1)}" y="${y + 3}" width="${Math.max(1.5, (o.end - o.start) * px).toFixed(1)}" height="${rowH - 6}" rx="2" fill="${colours[(o.batch - 1) % colours.length]}"><title>${esc(`Batch ${o.batch} ${o.step}`)}</title></rect>`);
  });
  s.push('</svg>'); return s.join('');
}

/**
 * Monod kinetics, with maintenance, death and product formation (Luedeking–Piret), in a batch (F = 0) or fed-batch vessel.
 * par = { mumax (1/h), Ks (g/L), Yxs (g/g), m? (g/g/h), kd? (1/h), alpha? , beta? (Luedeking–Piret), X0, S0, P0?, V0, F? (L/h), Sf? (g/L), Feed after tFeed? }
 * → { t[], X[], S[], P[], V[], mass: {X,S,P} } over [0, tEnd] (hours).
 */
export function fermentation(par, { tEnd, n = 200 } = {}) {
  const { mumax, Ks, Yxs, m = 0, kd = 0, alpha = 0, beta = 0, F = 0, Sf = 0, tFeed = 0 } = par;
  const f = (t, y) => {
    const [X, S, P, V] = y, Sx = Math.max(S, 0), mu = mumax * Sx / (Ks + Sx), Fi = t >= tFeed ? F : 0, D = Fi / V;
    const dX = (mu - kd) * X - D * X, dS = -(mu / Yxs + m) * X * (Sx > 0 ? 1 : 0) + D * (Sf - S), dP = (alpha * mu + beta) * X - D * P;
    return [dX, dS, dP, Fi];
  };
  const out = { t: [0], X: [par.X0], S: [par.S0], P: [par.P0 || 0], V: [par.V0] };
  let y = [par.X0, par.S0, par.P0 || 0, par.V0];
  for (let i = 1; i <= n; i++) { const r = rk45(f, y, (i - 1) * tEnd / n, i * tEnd / n, { rtol: 1e-9, atol: 1e-12 }); y = r.y; out.t.push(i * tEnd / n); out.X.push(y[0]); out.S.push(y[1]); out.P.push(y[2]); out.V.push(y[3]); }
  out.mass = { X: out.X.map((x, i) => x * out.V[i]), S: out.S.map((x, i) => x * out.V[i]), P: out.P.map((x, i) => x * out.V[i]) };
  return out;
}

/**
 * Batch mass balance. components = ids (data.js); ops: { op: 'charge', vessel, comp, mol } | { op: 'transfer', from, to, fraction } |
 * { op: 'react', vessel, nu: { comp: coefficient }, extent (mol) | key + conversion } | { op: 'discharge', vessel }.
 * → { inventory: { vessel: { comp: mol } }, discharged: { comp: mol }, atomError (relative; charged atoms vs held + discharged), steps: [...] }
 */
export function inventory(components, ops) {
  const inv = {}, out = Object.fromEntries(components.map((c) => [c, 0])), charged = {}, steps = [];
  const get = (v) => (inv[v] ||= Object.fromEntries(components.map((c) => [c, 0])));
  const need = (c) => { if (!components.includes(c)) throw new Error(c + ' is not one of the components'); };
  const addAtoms = (acc, c, mol) => { const a = atoms(COMPONENTS[c]?.formula || ''); for (const [k, v] of Object.entries(a)) acc[k] = (acc[k] || 0) + v * mol; };
  for (const o of ops) {
    if (o.op === 'charge') { need(o.comp); get(o.vessel)[o.comp] += o.mol; addAtoms(charged, o.comp, o.mol); }
    else if (o.op === 'transfer') { const a = get(o.from), b = get(o.to), f = o.fraction ?? 1; for (const c of components) { const q = a[c] * f; a[c] -= q; b[c] += q; } }
    else if (o.op === 'react') {
      const v = get(o.vessel); let xi = o.extent;
      if (xi == null) { need(o.key); const nk = o.nu[o.key]; if (!(nk < 0)) throw new Error('the key component must be a reactant'); xi = o.conversion * v[o.key] / Math.abs(nk); }
      for (const [c, nu] of Object.entries(o.nu)) { need(c); v[c] += nu * xi; if (v[c] < -1e-9) throw new Error(`step ${steps.length + 1}: ${c} would go negative in ${o.vessel}`); v[c] = Math.max(v[c], 0); }
    } else if (o.op === 'discharge') { const v = get(o.vessel); for (const c of components) { out[c] += v[c]; v[c] = 0; } }
    else throw new Error('unknown batch operation ' + o.op);
    steps.push(JSON.parse(JSON.stringify(inv)));
  }
  const held = {}; for (const v of Object.values(inv)) for (const c of components) addAtoms(held, c, v[c]); for (const c of components) addAtoms(held, c, out[c]);
  let err = 0; for (const k of new Set([...Object.keys(charged), ...Object.keys(held)])) err = Math.max(err, Math.abs((charged[k] || 0) - (held[k] || 0)) / ((charged[k] || 0) + 1e-30));
  return { inventory: inv, discharged: out, atomError: err, steps };
}
