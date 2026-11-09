/* SPDX-License-Identifier: Apache-2.0 */
/**
 * combos-asce7.js — ASCE 7 chapter 2 load combinations, LRFD (2.3) and ASD (2.4), with the wind and seismic cases of the panel (0.9 SU.1056b).
 * DOM-free, imports nothing. The factors are the 7-10 / 7-16 forms that at least two independent public pages print (loads-sources.js:
 * combo.lrfd, combo.asd, combo.Ev; the standard is not held here, and the 7-22 section 2.3.6 was not read). An aid until an engineer has
 * reviewed it; the combinations a project needs are the engineer's to set.
 *
 *   LRFD   1.4D · 1.2D+1.6L+0.5(Lr|S) · 1.2D+1.6(Lr|S)+(L|0.5W) · 1.2D+1.0W+L+0.5(Lr|S) · 1.2D+Ev+Eh+L+0.2S · 0.9D+1.0W · 0.9D−Ev+Eh
 *   ASD    D · D+L · D+(Lr|S) · D+0.75L+0.75(Lr|S) · D+0.6W · D+0.7E · D+0.75L+0.75(0.6W)+0.75(Lr|S) · D+0.75L+0.75(0.7E)+0.75S · 0.6D+0.6W · 0.6D+0.7E
 *   E = Eh ± Ev, Eh = ρ QE, Ev = 0.2 SDS D (so 1.2D+Ev = (1.2 + 0.2 SDS)D; ASD 0.7 Ev gives 0.14 SDS), overstrength Em = Ω0 QE in place of Eh (the
 *   LRFD ones with Ω0 are made too, and are not marked for the member checks). Each seismic case QE is combined with + and − sign (the case holds one direction).
 *
 *   asce7Combos(cases [{ id, name, kind }], { method: 'lrfd'|'asd', SDS = 0, rho = 1, Omega0 = null, vertical = true, prefix = 'A7-' })
 *       → { combos: [{ id, name, factors: [{ case, f }], limit?: 'strength', clause }], warnings }
 *   `limit: 'strength'` only on the LRFD combinations with ρ (what frame-design.js checks members against); ASD and overstrength ones have none.
 */
const r6 = (v) => Math.round(v * 1e6) / 1e6;

export function asce7Combos(cases, { method = 'lrfd', SDS = 0, rho = 1, Omega0 = null, vertical = true, prefix = 'A7-' } = {}) {
  const warnings = [];
  const of = (k) => cases.filter((c) => c.kind === k);
  const D = of('dead'), L = of('live'), LrS = [...of('roof'), ...of('snow')], S = of('snow'), W = of('wind'), E = of('seismic');
  if (cases.some((c) => c.kind === 'other')) warnings.push({ code: 'other-skipped' });
  if (!D.length) warnings.push({ code: 'no-dead' });
  if (E.length && !(SDS > 0) && vertical) warnings.push({ code: 'no-sds' });
  const rows = [], seen = new Set();
  const push = (clause, limit, terms, names) => {
    const t = [];
    for (const [c, f] of terms) { const v = r6(f); if (v !== 0) t.push([c, v]); }
    if (!t.length) return;
    const key = limit + '|' + clause + '|' + t.map(([c, f]) => c + '*' + f).sort().join('+');
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ clause, limit, terms: t, names });
  };
  const ev = vertical ? 0.2 * SDS : 0;            // Ev = 0.2 SDS D
  const dead = (f) => D.map((c) => [c.id, f]);
  const live = (f) => L.map((c) => [c.id, f]);
  const lrs = (c, f) => [[c.id, f]];
  const lrsPick = LrS.length ? LrS : [null];
  const std = method === 'lrfd' ? 'ASCE 7 2.3.1' : 'ASCE 7 2.4.1';

  const seismic = (name, Dfac, Efac, extra, lim, clause) => {
    for (const e of E) for (const sg of [1, -1]) push(clause, lim, [...dead(Dfac), [e.id, sg * Efac], ...extra], [e.name + (sg > 0 ? ' +' : ' −')]);
  };

  if (method === 'lrfd') {
    push(std + ' (1)', 'strength', dead(1.4), []);
    push(std + ' (2)', 'strength', [...dead(1.2), ...live(1.6)], []);
    for (const x of lrsPick) {
      push(std + ' (2)', 'strength', [...dead(1.2), ...live(1.6), ...(x ? lrs(x, 0.5) : [])], x ? [x.name] : []);
      if (x) {
        push(std + ' (3)', 'strength', [...dead(1.2), ...lrs(x, 1.6), ...live(1)], [x.name]);
        for (const w of W) push(std + ' (3)', 'strength', [...dead(1.2), ...lrs(x, 1.6), [w.id, 0.5]], [x.name, w.name]);
        for (const w of W) push(std + ' (4)', 'strength', [...dead(1.2), [w.id, 1], ...live(1), ...lrs(x, 0.5)], [w.name, x.name]);
      }
    }
    for (const w of W) { push(std + ' (4)', 'strength', [...dead(1.2), [w.id, 1], ...live(1)], [w.name]); push(std + ' (6)', 'strength', [...dead(0.9), [w.id, 1]], [w.name]); }
    const sTerm = S.length ? [[S[0].id, 0.2]] : [];
    for (const s of (S.length ? S : [null])) {
      const ex = [...live(1), ...(s ? [[s.id, 0.2]] : [])];
      seismic('E', 1.2 + ev, rho, ex, 'strength', 'ASCE 7 2.3.6 (5) 1.2D + Ev + Eh + L + 0.2S');
      if (Omega0) seismic('Em', 1.2 + ev, Omega0, ex, null, 'ASCE 7 overstrength (5) 1.2D + Ev + Em + L + 0.2S');
    }
    void sTerm;
    seismic('E', 0.9 - ev, rho, [], 'strength', 'ASCE 7 2.3.6 (7) 0.9D − Ev + Eh');
    if (Omega0) seismic('Em', 0.9 - ev, Omega0, [], null, 'ASCE 7 overstrength (7) 0.9D − Ev + Em');
  } else {
    push(std + ' (1)', null, dead(1), []);
    push(std + ' (2)', null, [...dead(1), ...live(1)], []);
    for (const x of LrS) {
      push(std + ' (3)', null, [...dead(1), ...lrs(x, 1)], [x.name]);
      push(std + ' (4)', null, [...dead(1), ...live(0.75), ...lrs(x, 0.75)], [x.name]);
      for (const w of W) push(std + ' (6a)', null, [...dead(1), ...live(0.75), [w.id, 0.75 * 0.6], ...lrs(x, 0.75)], [w.name, x.name]);
    }
    push(std + ' (4)', null, [...dead(1), ...live(0.75)], []);
    for (const w of W) {
      push(std + ' (5)', null, [...dead(1), [w.id, 0.6]], [w.name]);
      push(std + ' (6a)', null, [...dead(1), ...live(0.75), [w.id, 0.75 * 0.6]], [w.name]);
      push(std + ' (7)', null, [...dead(0.6), [w.id, 0.6]], [w.name]);
    }
    seismic('E', 1 + 0.7 * ev, 0.7 * rho, [], null, 'ASCE 7 2.4.5 (5) D + 0.7 Ev + 0.7 Eh');
    for (const s of (S.length ? S : [null])) seismic('E', 1 + 0.75 * 0.7 * ev, 0.75 * 0.7 * rho, [...live(0.75), ...(s ? [[s.id, 0.75]] : [])], null, 'ASCE 7 2.4.5 (6b) D + 0.75 L + 0.75 (0.7 E) + 0.75 S');
    seismic('E', 0.6 - 0.7 * ev, 0.7 * rho, [], null, 'ASCE 7 2.4.5 (8) 0.6D − 0.7 Ev + 0.7 Eh');
    if (Omega0) {
      seismic('Em', 1 + 0.7 * ev, 0.7 * Omega0, [], null, 'ASCE 7 overstrength D + 0.7 Ev + 0.7 Em');
      seismic('Em', 0.6 - 0.7 * ev, 0.7 * Omega0, [], null, 'ASCE 7 overstrength 0.6D − 0.7 Ev + 0.7 Em');
    }
  }
  const tag = method === 'lrfd' ? 'LRFD' : 'ASD';
  const combos = rows.map((r, i) => {
    const cb = { id: prefix + (i + 1), name: tag + (r.clause.includes('overstrength') ? ' Ω0' : '') + ((r.clause.match(/\((\w+)\)/) || [])[0] ? ' ' + r.clause.match(/\((\w+)\)/)[0] : '') + (r.names.length ? ' · ' + r.names.join(' + ') : ''),
      factors: r.terms.map(([c, f]) => ({ case: c, f })), clause: r.clause };
    if (r.limit) cb.limit = r.limit;
    return cb;
  });
  return { combos, warnings };
}
