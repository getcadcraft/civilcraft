/* SPDX-License-Identifier: Apache-2.0 */
/**
 * breakit.js — "Break it" (0.8 round 3, EG.31; DOM-free, no imports, canonical copy: lib/study/).
 *
 * Break it asks one question of a design: what gives way first, and how far is it from giving way? It does not design anything; it runs
 * the checks the design already has (a frame's member checks, a part's stress and buckling study, a regulation pack's egress rules) in the
 * worst way they allow and says so in findings the person can read, see on the model and fix.
 *
 *   reserve(util, opts)            → { factor, bounded, evals }   the load factor that takes utilisation to 1 (search on the real solver)
 *   routes(graph, rule)            → { rows, worst, failing }     escape routes from every room: the widest way out, its narrowest door
 *   partFindings(result, opts)     → [finding]                    a solved part: load factor to first yield, to buckling; where
 *   rank(findings)                 → findings, worst first
 *   findingProblems(findings, opts)→ [problem]                    the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1), one per finding that fails
 *   summaryOf(findings)            → { failing, weakest, governing }
 *
 * A finding: { id, kind: 'combo' | 'member' | 'connection' | 'route' | 'yield' | 'buckling', subject: { kind, id, label? },
 *              util (1 = at the limit; null when not a ratio), factor (load factor to failure: < 1 fails now; null = not found / not a load),
 *              failing, what: short words key vars, req/found, clause?, pack? (regulation findings), where?: { at: [x, y, z] } }
 * Frame and route adapters (frame-breakit.js, regs add-on route.js) build the inputs; this file never knows which app it serves.
 */
export const FORMAT = 'cc-breakit';
export const VERSION = 1;
export const LIMITS = { evals: 80, findings: 200, factorMax: 64 };

const finite = (x) => typeof x === 'number' && Number.isFinite(x);

/**
 * The load factor λ at which `util(λ)` reaches 1. `util` is the utilisation of the design when every load is multiplied by λ, computed by
 * the design's own solver (so nonlinear interaction formulas are honoured); it is assumed to rise with λ and to be 0 at 0. If util(1) is
 * already ≥ 1 the factor is below 1 (the design fails as loaded). If nothing fails up to `max`, `bounded` is false and `factor` is
 * Infinity (the design holds at least `atLeast`). `evals` counts the solves, so a caller can bound the cost.
 */
export async function reserve(util, { max = LIMITS.factorMax, tol = 1e-4, maxEvals = LIMITS.evals, cancelled = () => false } = {}) {
  let evals = 0;
  const f = async (l) => { evals++; const u = await util(l); if (!finite(u)) throw new Error('The check did not give a number.'); return u; };   // i18n-ignore: a programming error
  const u1 = await f(1);
  let lo, hi;
  if (u1 >= 1) { lo = 0; hi = 1; }
  else {
    lo = 1; hi = 2;
    for (;;) {
      if (cancelled() || evals >= maxEvals) return { factor: null, bounded: false, evals, cancelled: true };
      if (hi > max) return { factor: Infinity, bounded: false, atLeast: lo, evals };
      if ((await f(hi)) >= 1) break;
      lo = hi; hi *= 2;
    }
  }
  // lo holds (util < 1, or λ = 0), hi fails. Bisection on the ratio; the factor reported is the passing side, so "holds up to" is true.
  while (hi - lo > tol * hi && evals < maxEvals && !cancelled()) {
    const mid = lo > 0 ? Math.sqrt(lo * hi) : hi / 2;
    if ((await f(mid)) >= 1) hi = mid; else lo = mid;
  }
  return { factor: (lo + hi) / 2, bounded: true, evals, utilAsLoaded: u1 };
}

/**
 * Escape routes. graph = { rooms: [{ id, label?, at? }], doors: [{ id, a, b, width, label? }] } — a door joins room `a` to room `b`;
 * `b: null` is a door to the outside. rule = { min (mm, the pack's smallest clear width), id, clause?, pack? }.
 * For each room the route out whose narrowest door is widest is found (a widest-path search); the row names that door.
 * A room with no way out is `reachable: false` and fails whatever the rule says.
 */
export function routes(graph, rule) {
  const rooms = new Map(graph.rooms.map((r) => [r.id, r]));
  const adj = new Map(graph.rooms.map((r) => [r.id, []]));
  const out = [];   // doors to the outside, with the room inside
  for (const d of graph.doors) {
    if (!rooms.has(d.a) && !(d.b !== null && rooms.has(d.b))) continue;
    if (d.b === null || d.b === undefined) { if (rooms.has(d.a)) out.push(d); continue; }
    if (rooms.has(d.a)) adj.get(d.a).push({ to: d.b, door: d });
    if (rooms.has(d.b)) adj.get(d.b).push({ to: d.a, door: d });
  }
  // widest path from the outside inwards: best[r] = the largest "narrowest door" over ways from r out
  const best = new Map(), via = new Map();
  const queue = [];
  for (const d of out) {
    if (!(best.has(d.a)) || d.width > best.get(d.a)) { best.set(d.a, d.width); via.set(d.a, { door: d, next: null, narrow: d }); queue.push(d.a); }
  }
  while (queue.length) {
    queue.sort((p, q) => best.get(q) - best.get(p));
    const r = queue.shift();
    for (const e of adj.get(r) || []) {
      const w = Math.min(best.get(r), e.door.width);
      if (!best.has(e.to) || w > best.get(e.to) + 1e-9) {
        best.set(e.to, w);
        const prev = via.get(r);
        via.set(e.to, { door: e.door, next: r, narrow: e.door.width <= prev.narrow.width ? e.door : prev.narrow });
        queue.push(e.to);
      }
    }
  }
  const min = finite(rule && rule.min) ? rule.min : 0;
  const rows = graph.rooms.map((r) => {
    if (!best.has(r.id)) return { room: r.id, label: r.label || r.id, at: r.at || null, reachable: false, bottleneck: null, door: null, margin: -Infinity, failing: true, path: [] };
    const path = []; let at = r.id;
    for (let guard = 0; guard < 200 && at !== null; guard++) { const v = via.get(at); path.push(v.door.id); at = v.next; }
    const narrow = via.get(r.id).narrow, w = best.get(r.id);
    return { room: r.id, label: r.label || r.id, at: r.at || null, reachable: true, bottleneck: w, door: narrow.id, doorLabel: narrow.label || narrow.id, margin: w - min, failing: w < min - 1e-6, path };
  });
  rows.sort((p, q) => p.margin - q.margin);
  return { rows, worst: rows[0] || null, failing: rows.filter((r) => r.failing), rule: rule || null };
}

/**
 * A solved part → findings. `result` is a static (maxVm, minSafety) or buckling (factors) result of the Simulation study; `sf` is the
 * safety factor a design wants (default 1: first yield). For a linear static study stress is proportional to load, so the load factor to
 * first yield is the minimum safety factor itself; the caller may confirm it with `reserve` on a rescaled solve.
 */
export function partFindings(result, { sf = 1, material = null } = {}) {
  const out = [];
  if (!result) return out;
  const at = (p) => (p && Array.isArray(p.at) ? { at: p.at.slice(0, 3) } : undefined);
  if (result.kind === 'static' && finite(result.minSafety)) {
    const lam = result.minSafety / sf;
    out.push({ id: 'part.yield', kind: 'yield', subject: { kind: 'part', id: 'part' }, util: lam > 0 ? 1 / lam : null, factor: lam, failing: lam < 1,
      what: { vm: result.maxVm && finite(result.maxVm.value) ? result.maxVm.value : null, yield: material && material.yield ? material.yield : (result.material && result.material.yield) || null }, where: at(result.maxVm) });
  }
  if (result.kind === 'buckling' && Array.isArray(result.factors) && finite(result.factors[0])) {
    const lam = result.factors[0];
    out.push({ id: 'part.buckling', kind: 'buckling', subject: { kind: 'part', id: 'part' }, util: lam > 0 ? 1 / lam : null, factor: lam, failing: lam < 1, what: { mode: 1 } });
  }
  return out;
}

/** Worst first: failing before holding, then the smallest reserve (highest utilisation); ties by id so the order is repeatable. */
export function rank(findings) {
  const key = (f) => (f.failing ? 0 : 1);
  const u = (f) => (finite(f.util) ? -f.util : finite(f.factor) ? f.factor : 0);
  return findings.slice().sort((a, b) => key(a) - key(b) || u(a) - u(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function summaryOf(findings) {
  const r = rank(findings);
  return { failing: r.filter((f) => f.failing).length, weakest: r[0] || null, governing: r.find((f) => f.kind === 'combo') || null };
}

const num = (x, d = 3) => (finite(x) ? Number(x.toPrecision(d)) : null);

/**
 * Findings → Problems (rule 29). Only what fails is an error; what holds with less than `warnBelow` reserve (default utilisation > 0.9, a load
 * factor under 1.1) is a warning; the weakest of the rest is a note, so the person always sees what gives way first. Regulation findings
 * carry the pack and clause (`source.pack`); the shell prints the not-legal-advice line on them.
 */
export function findingProblems(findings, { source = 'breakit', warnAt = 0.9 } = {}) {
  const out = [];
  const ranked = rank(findings);
  ranked.forEach((f, i) => {
    const warn = !f.failing && ((finite(f.util) && f.util > warnAt) || (finite(f.factor) && f.factor < 1 / warnAt));
    if (!f.failing && !warn && i !== 0) return;
    const severity = f.failing ? 'error' : warn ? 'warning' : 'note';
    const vars = { subject: String((f.subject && (f.subject.label || f.subject.id)) || ''), util: num(f.util), factor: num(f.factor), ...(f.what || {}) };
    for (const k of Object.keys(vars)) if (vars[k] === null || vars[k] === undefined) delete vars[k];
    const p = {
      id: source + ':breakit.' + f.kind + ':' + (f.subject ? f.subject.kind + ':' + f.subject.id : f.id), code: 'breakit.' + f.kind, severity,
      msg: { key: 'breakit.p.' + f.kind + (f.failing ? '.fail' : ''), vars },
      about: f.subject ? [{ kind: f.subject.kind, id: String(f.subject.id), ...(f.subject.label ? { label: String(f.subject.label) } : {}) }] : [],
      source: { kind: f.pack ? 'regulation' : 'engine', name: source, ...(f.pack ? { pack: f.pack } : {}) },
    };
    if (f.where) p.where = f.where;
    if (f.req) p.req = f.req;
    if (f.found) p.found = f.found;
    if (f.clause && p.source.pack && !p.source.pack.clause) p.source.pack = { ...p.source.pack, clause: f.clause };
    out.push(p);
  });
  return out.slice(0, LIMITS.findings);
}
