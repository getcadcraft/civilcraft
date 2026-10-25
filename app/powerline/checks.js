/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/checks.js — one overhead line, analysed (0.7 PL.3 + PL.4): sections, sag per load case, clearances along every span,
 * phase spacing, insulator swing, uplift, support loads, support sizing, foundations, fittings. No DOM. A design aid: the rule
 * set (load cases, limits, clearances, k, factors) is the user's; an engineer checks the result.
 *
 *   analyzeLine(state, line, { lib, groundAt, units }) → result
 *     lib       Map key → library item (the project's copy merged with the person's library)
 *     groundAt  (x, y) → ground elevation in project units, or null where there is no surface
 *     units     'ft' | 'm' (plan and heights); everything inside is converted to metres
 *   result = {
 *     ok, line: id, conductor, roles[], angles[], ch[] (chainage, project units),
 *     supports: [{ i, id, role, groundZ, attachZ, aboveGround_m, item, loads: { caseId → { T, L, V, Feq } }, worstFeq, worstCase,
 *                  sizeOk, suggest (key | null), swing_deg, uplift, foundation: { depth_m, dia_m, volume_m3 } | null, fittings: [{ key, need_N, rated_N, ok }] }],
 *     sections: [{ from, to, Lr, solve (sag.js solveSection result), stringing: [...] }],
 *     spans: [{ i, section, from, to, L_m, dz_m, clear: { caseId → { min_m, at_m, need_m, ok } }, worst: { caseId, margin_m },
 *               spacing: { need_m, have_m, ok } | null, obstacles: [{ id, name, kind, source, top (z, project units), at_m, clear_m, need_m, ok }] }],
 *     state.obstacles may carry box { x0, y0, x1, y1 } (skipped when a span's box misses it) and top (an absolute z that wins over
 *     ground + h) — the Landscape's obstacles do (landscape-obstacles.js, 0.7 PL.11)
 *     issues: [{ code, sev: 'error' | 'warn', support?, span?, vals }]
 *   }
 *   conductorCurve(result, spanIndex, caseId, n) → [{ ch, z }]   the conductor's lowest phase in project units, for the profile
 *
 * Formulas (each one also in the help topic):
 *   attachment height = ground + (support height − embedment) − drop of the crossarm / fitting − insulator length (suspension only)
 *   wind span = half the sum of the two adjacent spans; weight span = distance between the lowest points either side
 *   transverse load = conductors × (wind per metre × wind span + 2·H·sin(turn/2)); longitudinal = the difference of the two sides'
 *   horizontal tensions (dead-ends) or the unbalanced-ice load (suspension); vertical = conductors × vertical load × weight span + equipment
 *   equivalent load at the support's nominal point = horizontal resultant × attachment height ÷ nominal-point height (both above ground);
 *   with a stay (equipment type 'stay') the stay carries the horizontal resultant ÷ sin(stay angle, 45° default) and the support none of it
 *   phase spacing needed = k·√(sag + insulator length) + U/150 (U in kV) — a common form; k is the rule set's
 *   swing angle = atan(transverse ÷ vertical) on a suspension insulator, under the rule set's wind case
 */

import { solveSection, stringingTable, unbalancedIce, catenary, conductorLoad } from './sag.js';
import { supportRoles, sections as sectionsOf, chainage, turnAngles } from './model.js';
import { unitM, G } from './units.js';

const DEG = Math.PI / 180;

export function analyzeLine(state, line, { lib, groundAt, units }) {
  const um = unitM(units);
  const R = state.rules;
  const issues = [];
  const get = (k) => (k ? lib.get(k) || null : null);
  const c = get(line.conductor);
  const n = line.supports.length;
  const roles = supportRoles(line, R), angles = turnAngles(line), ch = chainage(line);
  const res = { ok: false, line: line.id, conductor: c, roles, angles, ch, supports: [], sections: [], spans: [], issues };
  if (n < 2) { issues.push({ code: 'few', sev: 'warn', vals: {} }); return res; }
  if (!line.conductor) issues.push({ code: 'noconductor', sev: 'error', vals: {} });
  else if (!c) issues.push({ code: 'nolib', sev: 'error', vals: { key: line.conductor } });
  const nCond = Math.max(1, (line.phases || 1) * (line.circuits || 1));
  const kV = line.voltage_kV || 0;

  // ---- supports: ground, item, equipment, attachment height (m) ----
  const sup = line.supports.map((p, i) => {
    const item = get(p.support);
    if (!p.support) issues.push({ code: 'nosupport', sev: 'warn', support: i, vals: { name: p.name || String(i + 1) } });
    else if (!item) issues.push({ code: 'nolib', sev: 'error', support: i, vals: { key: p.support } });
    const g = p.ground != null ? p.ground : groundAt(p.x, p.y);
    if (g == null) issues.push({ code: 'noground', sev: 'warn', support: i, vals: { name: p.name || String(i + 1) } });
    const eq = [...(line.equip || []), ...(p.equip || [])].map(get).filter(Boolean);
    for (const k of [...(line.equip || []), ...(p.equip || [])]) if (!get(k)) issues.push({ code: 'nolib', sev: 'error', support: i, vals: { key: k } });
    const arm = eq.find((e) => e.type === 'crossarm');
    const stay = eq.find((e) => e.type === 'stay');   // a stay (guy) takes the horizontal pull off the support
    const fitDrop = eq.filter((e) => e.type === 'fitting' || e.type === 'crossarm').reduce((m, e) => Math.max(m, e.drop_m || 0), 0);
    const ins = eq.find((e) => e.type === 'insulator');
    const H_m = p.h != null ? p.h * um : item?.height_m ?? null;
    const embed = item?.embed_m ?? (H_m != null ? H_m / 10 + 0.5 : 0);
    const above = H_m != null ? H_m - (p.h != null ? 0 : embed) : null;   // a height typed on the support is the height above ground
    const insL = roles[i] === 'suspension' && ins ? ins.length_m || 0 : 0;
    const attach = g != null && above != null ? g * um + above - fitDrop - insL : null;
    const massN = eq.reduce((t, e) => t + (e.mass_kg || 0) * G, 0);
    return { i, id: p.id, role: roles[i], groundZ: g, item, eq, arm, stay, ins, insL, above, embed, attach, massN, attachZ: attach != null ? attach / um : null };
  });

  // ---- sections and sag ----
  const secs = sectionsOf(line, roles);
  const spanSec = new Array(n - 1).fill(-1);
  const cases = R.cases;
  for (const [si, s] of secs.entries()) {
    const spans = [];
    for (let i = s.from; i < s.to; i++) {
      spanSec[i] = si;
      const a = line.supports[i], b = line.supports[i + 1];
      const L = Math.hypot(b.x - a.x, b.y - a.y) * um;
      const dz = sup[i].attach != null && sup[i + 1].attach != null ? sup[i + 1].attach - sup[i].attach : 0;
      spans.push({ L, dz, i });
    }
    const solve = c && spans.every((x) => x.L > 0) ? solveSection(c, spans, cases, R.limits) : null;
    if (solve && !solve.ok) issues.push({ code: 'nosolve', sev: 'error', vals: { section: si + 1 } });
    if (solve?.ok) for (const k of solve.checks) if (!k.ok) issues.push({ code: 'tension', sev: 'error', vals: { section: si + 1, caseId: k.caseId, value: k.value, limit: k.limit } });
    const temps = [];
    for (let t = R.temps.from; t <= R.temps.to + 1e-9; t += R.temps.step) temps.push(+t.toFixed(3));
    const ed = solve?.ok ? solve.ref : null;
    const stringing = ed ? stringingTable(c, spans, ed, temps) : [];
    res.sections.push({ from: s.from, to: s.to, spans, Lr: solve?.Lr ?? null, solve, stringing });
  }

  // ---- spans: clearance at every case, obstacles, phase spacing ----
  const clearNeed = (id) => R.clearances.find((x) => x.id === id)?.min_m ?? R.clearances[0]?.min_m ?? 0;
  const lineNeed = clearNeed(line.clearance || 'ground');
  for (let i = 0; i < n - 1; i++) {
    const si = spanSec[i], S = res.sections[si], a = line.supports[i], b = line.supports[i + 1];
    const k = S ? S.spans.findIndex((x) => x.i === i) : -1;
    const span = { i, section: si, from: i, to: i + 1, L_m: S?.spans[k]?.L ?? 0, dz_m: S?.spans[k]?.dz ?? 0, clear: {}, worst: null, spacing: null, obstacles: [] };
    if (S?.solve?.ok && sup[i].attach != null && sup[i + 1].attach != null) {
      const N = Math.max(20, Math.ceil(span.L_m / 2));
      for (const lc of cases) {
        const cat = S.solve.cases[lc.id].spans[k];
        let min = Infinity, at = 0;
        for (let j = 0; j <= N; j++) {
          const t = j / N, x = t * span.L_m;
          const gz = groundAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
          if (gz == null) continue;
          const cz = sup[i].attach + cat.yAt(x);
          const cl = cz - gz * um;
          if (cl < min) { min = cl; at = x; }
        }
        if (min < Infinity) {
          span.clear[lc.id] = { min_m: min, at_m: at, need_m: lineNeed, ok: min >= lineNeed - 1e-6 };
          const margin = min - lineNeed;
          if (!span.worst || margin < span.worst.margin_m) span.worst = { caseId: lc.id, margin_m: margin };
        }
      }
      if (span.worst && span.worst.margin_m < -1e-6) issues.push({ code: 'clearance', sev: 'error', span: i, vals: { span: i + 1, caseId: span.worst.caseId, have: lineNeed + span.worst.margin_m, need: lineNeed } });
      // obstacles crossed by the span (plan intersection), checked at every case
      for (const o of state.obstacles) {
        if (o.box && (Math.max(a.x, b.x) < o.box.x0 || Math.min(a.x, b.x) > o.box.x1 || Math.max(a.y, b.y) < o.box.y0 || Math.min(a.y, b.y) > o.box.y1)) continue;
        const hits = crossings(a, b, o.pts);
        let bad = null;   // one problem per obstacle and span: its lowest clearance
        for (const t of hits) {
          const x = t * span.L_m, gz = o.ground != null ? o.ground : groundAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
          if (gz == null && o.top == null) continue;
          const top = (o.top != null ? o.top : gz + (o.h || 0)) * um, need = clearNeed(o.clearance);
          let worst = Infinity, wc = null;
          for (const lc of cases) { const cz = sup[i].attach + S.solve.cases[lc.id].spans[k].yAt(x); if (cz - top < worst) { worst = cz - top; wc = lc.id; } }
          const hit = { id: o.id, name: o.name, kind: o.kind || null, source: o.source || null, top: top / um, at_m: x, clear_m: worst, need_m: need, caseId: wc, ok: worst >= need - 1e-6 };
          span.obstacles.push(hit);
          if (!hit.ok && (!bad || hit.clear_m < bad.clear_m)) bad = hit;
        }
        if (bad) issues.push({ code: 'obstacle', sev: 'error', span: i, vals: { span: i + 1, name: o.name || o.id, have: bad.clear_m, need: bad.need_m, caseId: bad.caseId } });
      }
      // phase spacing: k·√(f + l) + U/150 with the hot case's sag (the largest)
      const have = sup[i].arm?.spacing_m ?? sup[i + 1].arm?.spacing_m ?? null;
      if (have != null && nCond > 1) {
        const hot = R.hotCase && S.solve.cases[R.hotCase] ? R.hotCase : cases[cases.length - 1].id;
        const f = S.solve.cases[hot].spans[k].sag, l = Math.max(sup[i].insL, sup[i + 1].insL);
        const need = (R.spacingK || 0) * Math.sqrt(Math.max(0, f + l)) + kV / 150;
        span.spacing = { need_m: need, have_m: have, ok: have >= need - 1e-6 };
        if (!span.spacing.ok) issues.push({ code: 'spacing', sev: 'error', span: i, vals: { span: i + 1, have, need } });
      }
    }
    res.spans.push(span);
  }

  // ---- support loads, swing, uplift, sizing, foundations, fittings ----
  const asymCase = R.asymCase ? cases.find((x) => x.id === R.asymCase) : null;
  const unb = new Map();   // support index → dT (suspension supports inside a section)
  if (c && asymCase) for (const S of res.sections) if (S.solve?.ok && S.spans.length > 1) for (const u of unbalancedIce(c, S.spans, S.solve.ref, asymCase, { temp: asymCase.temp })) unb.set(S.from + u.support, u.dT);
  for (const s of sup) {
    const i = s.i, left = i > 0 ? spanCase(res, i - 1) : null, right = i < n - 1 ? spanCase(res, i) : null;
    const out = { i, id: s.id, role: s.role, groundZ: s.groundZ, attachZ: s.attachZ, aboveGround_m: s.above, item: s.item?.key ?? null, loads: {}, worstFeq: 0, worstCase: null,
      sizeOk: null, suggest: null, swing_deg: null, uplift: false, foundation: null, fittings: [] };
    if (c && (left || right)) {
      for (const lc of cases) {
        const L0 = conductorLoad(c, lc);
        const sl = left ? left.S.solve?.cases?.[lc.id] : null, sr = right ? right.S.solve?.cases?.[lc.id] : null;
        const catL = sl ? sl.spans[left.k] : null, catR = sr ? sr.spans[right.k] : null;
        const HL = sl?.H ?? 0, HR = sr?.H ?? 0;
        const windSpan = ((catL?.L ?? 0) + (catR?.L ?? 0)) / 2;
        // weight span: from the left span's lowest point to the right span's lowest point
        const wL = catL ? catL.L - catL.x0 : 0, wR = catR ? catR.x0 : 0;
        const weightSpan = wL + wR;
        const turn = (angles[i] || 0) * DEG;
        const T = nCond * (L0.wh * windSpan + (HL + HR) * Math.sin(turn / 2));
        let Lg;
        if (s.role === 'deadend' || !left || !right) Lg = nCond * Math.abs(HL * Math.cos(turn / 2) - HR * Math.cos(turn / 2));
        else Lg = lc.id === R.asymCase ? nCond * (unb.get(i) || 0) : 0;
        const V = nCond * L0.wv * weightSpan + s.massN;
        const Fh = Math.hypot(T, Lg);
        const nomH = s.item && s.above != null ? s.above - (s.item.loadDrop_m ?? 0.25) : null;
        const attachH = s.attach != null && s.groundZ != null ? s.attach - s.groundZ * um : null;
        // a stay carries the horizontal resultant at its angle (45° from the vertical unless the item says): the support keeps none of it,
        // and takes the stay's downward pull as extra vertical load
        const stayN = s.stay ? Fh / Math.sin(((s.stay.angle_deg ?? 45) * Math.PI) / 180) : 0;
        const Feq = s.stay ? 0 : nomH > 0 && attachH != null ? Fh * attachH / nomH : Fh;
        out.loads[lc.id] = { T, L: Lg, V: V + (s.stay ? stayN * Math.cos(((s.stay.angle_deg ?? 45) * Math.PI) / 180) : 0), Feq, windSpan, weightSpan, stay: stayN };
        if (s.stay?.rated_N > 0) {
          const need = stayN * (R.sizeFactor || 1), prev = out.fittings.find((x) => x.key === s.stay.key);
          if (!prev) out.fittings.push({ key: s.stay.key, name: s.stay.name, need_N: need, rated_N: s.stay.rated_N, ok: need <= s.stay.rated_N });
          else if (need > prev.need_N) { prev.need_N = need; prev.ok = need <= s.stay.rated_N; }
        }
        if (Feq > out.worstFeq) { out.worstFeq = Feq; out.worstCase = lc.id; }
        if (lc.kind === 'cold' && weightSpan < 0 && s.role === 'suspension') out.uplift = true;
        if (lc.id === R.windCase && s.role === 'suspension' && s.ins) {
          const insW = (s.ins.mass_kg || 0) * G;
          const sw = Math.atan2(nCond ? T / nCond : 0, Math.max(1e-9, (nCond ? V / nCond : 0) + insW / 2)) / DEG;
          out.swing_deg = sw;
          if (sw > R.swingMax_deg) issues.push({ code: 'swing', sev: 'warn', support: i, vals: { name: line.supports[i].name || String(i + 1), have: sw, max: R.swingMax_deg } });
        }
        // fittings: an anchoring fitting carries the conductor's tension; a suspension one its share of the vertical and transverse load
        for (const e of s.eq) {
          if (!(e.rated_N > 0) || e.type === 'crossarm' || e.type === 'stay') continue;
          const need = (s.role === 'deadend' || s.role === 'angle' ? Math.max(sl ? Math.max(catL.Tleft, catL.Tright) : 0, sr ? Math.max(catR.Tleft, catR.Tright) : 0) : Math.hypot(T, V) / nCond) * (R.sizeFactor || 1);
          const prev = out.fittings.find((x) => x.key === e.key);
          if (!prev) out.fittings.push({ key: e.key, name: e.name, need_N: need, rated_N: e.rated_N, ok: need <= e.rated_N });
          else if (need > prev.need_N) { prev.need_N = need; prev.ok = need <= e.rated_N; }
        }
        if (s.arm?.rated_N > 0) {
          const need = Math.hypot(T, V) * (R.sizeFactor || 1);
          const prev = out.fittings.find((x) => x.key === s.arm.key);
          if (!prev) out.fittings.push({ key: s.arm.key, name: s.arm.name, need_N: need, rated_N: s.arm.rated_N, ok: need <= s.arm.rated_N });
          else if (need > prev.need_N) { prev.need_N = need; prev.ok = need <= s.arm.rated_N; }
        }
      }
      if (out.uplift) issues.push({ code: 'uplift', sev: 'error', support: i, vals: { name: line.supports[i].name || String(i + 1) } });
      for (const ft of out.fittings) if (!ft.ok) issues.push({ code: 'fitting', sev: 'error', support: i, vals: { name: line.supports[i].name || String(i + 1), item: ft.name, need: ft.need_N, rated: ft.rated_N } });
      if (s.item) {
        const f = R.sizeFactor || 1;
        out.sizeOk = out.worstFeq * f <= s.item.nominal_N * (1 + 1e-6);
        if (!out.sizeOk) issues.push({ code: 'strength', sev: 'error', support: i, vals: { name: line.supports[i].name || String(i + 1), need: out.worstFeq * f, nominal: s.item.nominal_N, caseId: out.worstCase } });
        // the smallest support of the library that carries it: same material, at least as tall, the role allowed
        const cands = [...lib.values()].filter((x) => x.kind === 'support' && x.height_m >= s.item.height_m - 1e-9 && (!s.item.material || x.material === s.item.material)
          && (!x.roles || x.roles.split(/[,; ]+/).includes(s.role)) && x.nominal_N >= out.worstFeq * f);
        cands.sort((a, b) => a.nominal_N - b.nominal_N || a.height_m - b.height_m);
        out.suggest = cands[0]?.key ?? null;
        const embed = s.item.embed_m ?? s.item.height_m / 10 + 0.5;
        const dia = Math.max(0.6, (s.item.footDiam_mm || 300) / 1000 + 0.3);
        out.foundation = { depth_m: embed, dia_m: dia, volume_m3: Math.PI * dia * dia / 4 * embed };
      }
    }
    res.supports.push(out);
  }
  res.ok = !!c && res.sections.every((S) => S.solve?.ok);
  return res;
}

function spanCase(res, spanIndex) {
  const sp = res.spans[spanIndex];
  if (!sp || sp.section < 0) return null;
  const S = res.sections[sp.section];
  const k = S.spans.findIndex((x) => x.i === spanIndex);
  return k < 0 ? null : { S, k };
}

/** Where the plan segment a→b crosses the polyline pts (or passes a single point within 0.5 % of its length): → [t in 0..1]. */
export function crossings(a, b, pts) {
  const out = [];
  const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
  if (!(L2 > 0)) return out;
  if (pts.length === 1) {
    const p = pts[0], t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2;
    if (t > 0 && t < 1 && Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / Math.sqrt(L2) <= Math.sqrt(L2) * 0.005 + 1e-9) out.push(t);
    return out;
  }
  for (let j = 0; j < pts.length - 1; j++) {
    const p = pts[j], q = pts[j + 1], ex = q.x - p.x, ey = q.y - p.y;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = ((p.x - a.x) * ey - (p.y - a.y) * ex) / den, u = ((p.x - a.x) * dy - (p.y - a.y) * dx) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && !out.some((o) => Math.abs(o - t) < 1e-9)) out.push(t);   // a shared vertex: once
  }
  return out;
}

export function conductorCurve(res, spanIndex, caseId, units, n = 40) {
  const um = unitM(units);
  const sp = res.spans[spanIndex];
  if (!sp || sp.section < 0) return [];
  const S = res.sections[sp.section];
  const k = S.spans.findIndex((x) => x.i === spanIndex);
  const r = S.solve?.cases?.[caseId];
  const a = res.supports[spanIndex];
  if (!r || k < 0 || a.attachZ == null) return [];
  const cat = r.spans[k], ch0 = res.ch[spanIndex];
  const out = [];
  for (let j = 0; j <= n; j++) { const x = (j / n) * cat.L; out.push({ ch: ch0 + x / um, z: a.attachZ + cat.yAt(x) / um }); }
  return out;
}
