/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-combos.js — load combinations generated from a design code (0.7 SU.878, session make-07). DOM-free, imports
 * nothing. The code-neutral half of the structural-design step: it only turns the model's load cases (by kind) into
 * combinations `{ id, name, factors: [{ case, f }], limit, clause }` that frame-solve.js solves like any typed one; the
 * member checks (frame-design.js) then read the combinations marked `limit: 'strength'`.
 *
 * Two families, chosen per project:
 *   'asce-aisc'  ASCE 7-16 §2.3.1 basic combinations for strength design (LRFD), with W taken as the strength-level wind
 *                load; serviceability: D + L, D + (Lr or S), D + 0.6 W (a common reading of ASCE 7 Appendix C, the engineer
 *                sets the project's own)
 *   'en'         EN 1990 Eq. (6.10), or (6.10a) + (6.10b) with ξ, for the persistent and transient STR/GEO situation;
 *                seismic Eq. (6.12b) = G + E + Σψ2 Q; serviceability, characteristic Eq. (6.14). The factors are the
 *                RECOMMENDED values of EN 1990 Annex A1 (Tables A1.1, A1.2(B)); a country's National Annex changes them,
 *                so they are an editable table (`EN_NA`, `cleanNA`) kept with the project.
 *
 * Case kinds (frame-model.js CASE_KINDS): dead → D / G; live → L / imposed; roof → Lr / roof imposed (category H);
 * snow → S; wind → W; seismic → E. Several cases of one kind: dead and live (ASCE) add up as one action; every wind,
 * snow, roof and seismic case is its own alternative (one combination each). Cases of kind 'other' are not combined
 * (warning code 'other-skipped'). A combination whose leading action has no case is not made.
 *
 *   CODES, EN_NA, cleanNA(obj) → table with every value a finite number in range
 *   generateCombos(code, cases, { na, eq: '6.10' | '6.10ab', service: true, max }) → { combos, warnings, table }
 *     table: [{ name, clause, limit, terms: [[kind, f]] }] — the factors as the report prints them
 */
export const CODES = ['asce-aisc', 'en'];

export const EN_NA = Object.freeze({
  gammaG: 1.35,            // γG,sup — permanent, unfavourable (Table A1.2(B))
  gammaGinf: 1.0,          // γG,inf — permanent, favourable
  gammaQ: 1.5,             // γQ — variable
  xi: 0.85,                // ξ of Eq. (6.10b)
  psi0: Object.freeze({ live: 0.7, roof: 0, snow: 0.5, wind: 0.6 }),     // Table A1.1: imposed (category A), category H, snow (CEN, ≤ 1000 m), wind
  psi1: Object.freeze({ live: 0.5, roof: 0, snow: 0.2, wind: 0.2 }),
  psi2: Object.freeze({ live: 0.3, roof: 0, snow: 0, wind: 0 }),
});
const VAR = ['live', 'roof', 'snow', 'wind'];

export function cleanNA(x) {
  const n = (v, d, lo = 0, hi = 3) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);
  const set = (o, d, hi) => Object.fromEntries(VAR.map((k) => [k, n(o?.[k], d[k], 0, hi)]));
  return {
    gammaG: n(x?.gammaG, EN_NA.gammaG, 0.5, 3), gammaGinf: n(x?.gammaGinf, EN_NA.gammaGinf, 0.5, 3), gammaQ: n(x?.gammaQ, EN_NA.gammaQ, 0.5, 3),
    xi: n(x?.xi, EN_NA.xi, 0.5, 1),
    psi0: set(x?.psi0, EN_NA.psi0, 1), psi1: set(x?.psi1, EN_NA.psi1, 1), psi2: set(x?.psi2, EN_NA.psi2, 1),
  };
}

const num = (f) => String(Math.round(f * 1e4) / 1e4);

/** Cartesian product of the alternatives, `pick` = [slotName → [caseIds]] in order. */
function product(slots) {
  let out = [{}];
  for (const [name, ids] of slots) out = out.flatMap((o) => ids.map((id) => ({ ...o, [name]: id })));
  return out;
}

export function generateCombos(code, cases, { na = null, eq = '6.10', service = true, max = 190 } = {}) {
  const warnings = [];
  const of = (k) => cases.filter((c) => c.kind === k).map((c) => c.id);
  const byId = new Map(cases.map((c) => [c.id, c]));
  if (cases.some((c) => c.kind === 'other')) warnings.push({ code: 'other-skipped' });
  const rows = [];   // { name, clause, limit, terms: [[caseId, f, kind]] }
  const seen = new Set();
  const add = (clause, limit, terms) => {
    const t = terms.map(([c, f]) => [c, Math.round(f * 1e6) / 1e6]).filter(([, f]) => f !== 0);
    if (!t.length) return;
    const key = limit + '|' + t.map(([c, f]) => c + '*' + f).sort().join('+');
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ clause, limit, terms: t });
  };

  if (code === 'asce-aisc') {
    const D = of('dead'), L = of('live'), Lr = of('roof'), S = of('snow'), W = of('wind'), E = of('seismic');
    const LrS = [...Lr, ...S];
    const all = (ids, f) => ids.map((c) => [c, f]);
    // a table row = ordered [slot, factor]; slots: 'D','L' add up; 'LrS','S','W','E' take one case at a time
    const spec = [
      ['ASCE 7-16 §2.3.1 (1)', null, [['D', 1.4]]],
      ['ASCE 7-16 §2.3.1 (2)', 'L', [['D', 1.2], ['L', 1.6], ['LrS', 0.5]]],
      ['ASCE 7-16 §2.3.1 (3)', 'LrS', [['D', 1.2], ['LrS', 1.6], ['L', 1]]],
      ['ASCE 7-16 §2.3.1 (3)', 'LrS', [['D', 1.2], ['LrS', 1.6], ['W', 0.5]], 'W'],
      ['ASCE 7-16 §2.3.1 (4)', 'W', [['D', 1.2], ['W', 1], ['L', 1], ['LrS', 0.5]]],
      ['ASCE 7-16 §2.3.1 (5)', 'E', [['D', 1.2], ['E', 1], ['L', 1], ['S', 0.2]]],
      ['ASCE 7-16 §2.3.1 (6)', 'W', [['D', 0.9], ['W', 1]]],
      ['ASCE 7-16 §2.3.1 (7)', 'E', [['D', 0.9], ['E', 1]]],
    ];
    const pool = { D, L, LrS, S, W, E };
    for (const [clause, lead, terms, need] of spec) {
      if (lead && !pool[lead].length) continue;
      if (need && !pool[need].length) continue;
      const each = terms.filter(([s]) => s === 'LrS' || s === 'S' || s === 'W' || s === 'E').map(([s]) => [s, pool[s].length ? pool[s] : [null]]);
      for (const pick of product(each)) {
        const t = [];
        for (const [s, f] of terms) {
          if (s === 'D' || s === 'L') t.push(...all(pool[s], f));
          else if (pick[s]) t.push([pick[s], f]);
        }
        add(clause, 'strength', t);
      }
    }
    /* i18n-ignore-start: clause names of the design codes, the same in every language */
    if (service) {
      add('ASCE 7 App. C: D + L', 'service', [...all(D, 1), ...all(L, 1)]);
      for (const c of LrS) add('ASCE 7 App. C: D + (Lr or S)', 'service', [...all(D, 1), [c, 1]]);
      for (const c of W) add('ASCE 7 App. C: D + 0.6 W', 'service', [...all(D, 1), [c, 0.6]]);
    }
    /* i18n-ignore-end */
  } else if (code === 'en') {
    const T = cleanNA(na);
    const G = of('dead'), Q = VAR.flatMap((k) => of(k).map((id) => ({ id, kind: k }))), E = of('seismic');
    const g = (f) => G.map((c) => [c, f]);
    const variants = eq === '6.10ab'
      ? [['6.10a', 'all0', 1], ['6.10b', 'lead', T.xi]]
      : [['6.10', 'lead', 1]];
    for (const [name, mode, xi] of variants) {
      for (const [gf, gname] of [[T.gammaG * xi, 'sup'], [T.gammaGinf, 'inf']]) {
        if (gname === 'inf' && mode === 'all0') continue;      // (6.10a) is written for the unfavourable permanent actions
        for (const lead of Q) {
          const t = [...g(gf)];
          for (const q of Q) {
            const lone = q.id === lead.id && mode === 'lead';
            t.push([q.id, T.gammaQ * (lone ? 1 : T.psi0[q.kind])]);
          }
          add('EN 1990 Eq. (' + name + ')', 'strength', t);
        }
        if (!Q.length && G.length) add('EN 1990 Eq. (' + name + ')', 'strength', g(gf));
      }
    }
    for (const e of E) add('EN 1990 Eq. (6.12b)', 'strength', [...g(1), [e, 1], ...Q.map((q) => [q.id, T.psi2[q.kind]])]);
    if (service) {
      for (const lead of Q) add('EN 1990 Eq. (6.14)', 'service', [...g(1), ...Q.map((q) => [q.id, q.id === lead.id ? 1 : T.psi0[q.kind]])]);
      if (!Q.length) add('EN 1990 Eq. (6.14)', 'service', g(1));
    }
  } else warnings.push({ code: 'bad-code' });

  let rowsOut = rows;
  if (rowsOut.length > max) { warnings.push({ code: 'too-many', n: rowsOut.length, max }); rowsOut = rowsOut.slice(0, max); }
  // strength first, then service; stable numbering
  rowsOut = [...rowsOut.filter((r) => r.limit === 'strength'), ...rowsOut.filter((r) => r.limit !== 'strength')];
  const combos = rowsOut.map((r, k) => ({
    id: 'k' + (k + 1),
    name: r.terms.map(([c, f]) => num(f) + ' ' + (byId.get(c)?.name || c)).join(' + '),
    factors: r.terms.map(([c, f]) => ({ case: c, f })),
    limit: r.limit, clause: r.clause,
  }));
  const table = rowsOut.map((r) => ({ name: r.clause, clause: r.clause, limit: r.limit, terms: r.terms.map(([c, f]) => [byId.get(c)?.kind || '', f]) }));
  return { combos, warnings, table };
}
