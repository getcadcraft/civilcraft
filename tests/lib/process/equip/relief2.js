/* SPDX-License-Identifier: Apache-2.0 */
/**
 * relief2.js — depressuring, control-valve failure and the header load summary (0.8 Track CH, CH.12; DOM-free, deterministic).
 * A drafting and study aid, "to be checked by an engineer" (O7): NOT an engineering approval.
 *   depressuring(spec)      a gas-filled vessel vented through an orifice to a back pressure. Ideal gas, constant heat capacity ratio, no wall heat capacity:
 *       dm/dt = -mdot,   m cv dT/dt = Q - mdot Rs T   (Q = heat input, e.g. fire),   P = m Rs T / V (Z = 1).
 *       mdot = Cd A P sqrt(k M/(R T)) (2/(k+1))^((k+1)/(2(k-1))) when choked, the subsonic form otherwise.
 *       With Q = 0 the temperature follows T = T0 (P/P0)^((k-1)/k): the closed form the test checks.
 *       spec = { V (m3), P0 (Pa), T0 (K), M (kg/mol), k, Cd?, A (m2), Pb (Pa), Q? (W, or a function of t), tEnd (s), Ptarget? (Pa: the time it is reached) }
 *   controlValveFailure(spec)  the relief load when a control valve fails open: liquid by Kv (Q = Kv sqrt(dP/SG), Q in m3/h, dP in bar, the definition of Kv),
 *       gas through an effective orifice area A (the valve maker's, at full opening): critical flow at the relieving pressure. The load is the flow at the
 *       relieving condition minus the normal flow the downstream system already handles.
 *   headerSummary(spec)     the load on each flare or relief header per case: scenarios { id, header, loads { deviceId: kg/s } } and cases { name, scenarios [ids] }
 *       (which scenarios can happen together is the person's: a case names them). → per header: the governing case, its load, and the table.
 */
import { R } from '../data.js';
import { problem } from '../report.js';

export function depressuring(spec) {
  const { V, P0, T0, M, k, Cd = 0.8, A, Pb = 101325, tEnd, Ptarget = null } = spec, Rs = R / M, cv = Rs / (k - 1);
  const Qf = typeof spec.Q === 'function' ? spec.Q : () => spec.Q || 0;
  let m = P0 * V / (Rs * T0), Tg = T0, t = 0; const out = { t: [0], P: [P0], T: [T0], mdot: [], tReach: null }, crit = Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1)));
  const flow = (P, T) => {
    const r = Pb / P; if (r >= 1) return 0;
    if (r <= Math.pow(2 / (k + 1), k / (k - 1))) return Cd * A * P * Math.sqrt(k * M / (R * T)) * crit;
    return Cd * A * P * Math.sqrt(2 * M / (R * T) * k / (k - 1) * (Math.pow(r, 2 / k) - Math.pow(r, (k + 1) / k)));
  };
  const f = (mm, T, tt) => { const P = mm * Rs * T / V, md = flow(P, T); return [-md, (Qf(tt) - md * Rs * T) / (mm * cv), md]; };
  const dt0 = Math.max(tEnd / 20000, 1e-4); let dt = dt0, nstep = 0;
  while (t < tEnd) {
    const [a1, b1, c1] = f(m, Tg, t), [a2, b2] = f(m + dt / 2 * a1, Tg + dt / 2 * b1, t + dt / 2), [a3, b3] = f(m + dt / 2 * a2, Tg + dt / 2 * b2, t + dt / 2), [a4, b4] = f(m + dt * a3, Tg + dt * b3, t + dt);
    void c1; m += dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4); Tg += dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4); t += dt;
    const P = m * Rs * Tg / V; out.mdot.push(-a1);
    if (++nstep % 10 === 0 || t >= tEnd) { out.t.push(t); out.P.push(P); out.T.push(Tg); }
    if (Ptarget != null && out.tReach == null && P <= Ptarget) out.tReach = t;
    if (P <= Pb * 1.0001) break;
  }
  const problems = [];
  if (Ptarget != null && out.tReach == null) problems.push(problem('depressuring.target', 'warning', `The vessel does not reach ${(Ptarget / 1e5).toFixed(2)} bar within ${tEnd} s.`, [{ id: 'depressuring' }]));
  return { ...out, Tmin: Math.min(...out.T), mdotInitial: out.mdot[0], problems, notes: ['ideal gas, Z = 1, no wall heat capacity: the real metal temperature and the two-phase case need the maker/engineer'] };
}

export function controlValveFailure(spec) {
  const problems = [];
  let flow, unit;
  if (spec.fluid === 'liquid') {
    const { Kv, dP, SG, rho = 1000 } = spec; if (!(Kv > 0 && dP > 0 && SG > 0)) throw new Error('liquid: give Kv, dP (bar) and the specific gravity');
    const Qm3h = Kv * Math.sqrt(dP / SG); flow = Qm3h / 3600 * SG * rho; unit = 'kg/s';
  } else {
    const { A, P1, T, M, k, Z = 1, Cd = 0.975 } = spec; if (!(A > 0 && P1 > 0)) throw new Error('gas: give the effective area A and the relieving pressure P1');
    flow = Cd * A * P1 * Math.sqrt(k * M / (Z * R * T)) * Math.pow(2 / (k + 1), (k + 1) / (2 * (k - 1))); unit = 'kg/s';
  }
  const normal = spec.normal || 0, load = Math.max(flow - normal, 0);
  if (load <= 0) problems.push(problem('cvfail.none', 'info', 'The failed-open valve passes no more than the normal flow: no relief load from this scenario.', [{ id: spec.id || 'valve' }]));
  return { flow, normal, load, unit, problems, source: 'valve Kv definition (liquid) / critical orifice flow (gas); the maker\'s area or Kv at full opening is the input' };
}

export function headerSummary({ scenarios, cases, devices = null }) {
  const byId = Object.fromEntries(scenarios.map((s) => [s.id, s])), headers = new Map(), problems = [];
  for (const c of cases) {
    const per = new Map();
    for (const id of c.scenarios) {
      const s = byId[id]; if (!s) { problems.push(problem('header.scenario', 'error', `Case "${c.name}" names a scenario "${id}" that does not exist.`, [{ id }])); continue; }
      const seen = per.get(s.header) || { load: 0, devices: {} };
      for (const [dev, kgs] of Object.entries(s.loads || {})) { if (!(kgs >= 0)) { problems.push(problem('header.load', 'error', `Load of ${dev} in ${id} is not a number.`, [{ id: dev }])); continue; } seen.load += kgs; seen.devices[dev] = (seen.devices[dev] || 0) + kgs; }
      per.set(s.header, seen);
    }
    for (const [hd, v] of per) { const h = headers.get(hd) || { header: hd, cases: [] }; h.cases.push({ name: c.name, load: v.load, devices: v.devices }); headers.set(hd, h); }
  }
  const out = [...headers.values()].map((h) => { const g = h.cases.reduce((a, b) => (b.load > a.load ? b : a)); return { header: h.header, governing: g.name, load: g.load, cases: h.cases }; });
  for (const s of scenarios) if (!headers.has(s.header)) problems.push(problem('header.unused', 'info', `Scenario ${s.id} is not in any case: it does not load header ${s.header}.`, [{ id: s.id }]));
  return { headers: out, problems, toFlareSources: (hd) => { const h = out.find((x) => x.header === hd); if (!h) return {}; return h.cases.find((c) => c.name === h.governing).devices; } };
}
