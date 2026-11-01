/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-structures.js — culverts, bridges and junctions in the 1D steady river model (0.8 SU.957 rest, round 3 civil_PART_3).
 * No DOM, no strings: notes come back as codes the UI words (`river.struct.<code>`). Tested by bin/test-civilcraft-river-structures.mjs.
 * Every result is a design aid that needs an engineer's review (the UI and the report say so). Clean room: published hydraulics only,
 * no coefficient table is copied; the defaults below are typed round numbers, marked as such, and every one can be changed.
 *
 * CULVERT (a barrel or several equal barrels under a road; `culvertHeadwater`)
 *   Inlet control. Free surface at the entrance: weir flow  Q = Cw·B·HW^1.5 (B = box span or the diameter; Cw 1.7 SI, 3.1 US).
 *   Entrance submerged: orifice flow  Q = Cd·A·√(2g(HW − D/2))  (Cd 0.6, a square edge). Between HW/D = 1 and 1.5 the two are blended
 *   (the transition zone the usual design charts draw). The charts' fitted polynomials are NOT used.
 *   Outlet control (energy):  HW = H + ho − L·S0,  H = (1 + Ke + Kf)·V²/2g,  Kf = 2g·n²·L / (k²·R^(4/3)) for the full barrel,
 *   ho = the higher of the tailwater and (dc + D)/2 above the outlet invert (dc = critical depth in the barrel).
 *   Headwater = the larger of the two (the control). Water over the road: weir flow  Q = Cr·Lr·(HW − crest)^1.5, shared with the barrels
 *   so that the barrels' flow + the road's = Q. HW is the depth above the upstream invert, taken as the energy level at the entrance.
 *
 * BRIDGE (`bridgeUpstream`; the energy method through the opening, then pressure and weir flow)
 *   The opening is the downstream section clipped to the abutments, with each pier as an area that carries no flow. Water surface at
 *   the opening from the section below it (energy, expansion coefficient ce), then up to the section above (energy, contraction cc).
 *   If the opening cannot pass Q at the tailwater the opening runs at critical depth and the upstream surface is found from the energy
 *   there (`choked`). If the upstream surface passes the low chord: pressure flow, sluice type  Q = Cd·An·√(2g(EGLu − (zb + Z/2)))
 *   while the tailwater is below the low chord, drowned  Q = Cd·An·√(2g(EGLu − WSd))  above it; water above the deck top adds weir flow
 *   Q = Cw·L·(EGLu − deck)^1.5. The upstream surface is the one at which the two add up to Q (never lower than the energy answer).
 *
 * JUNCTION (`solveNetwork`; reaches that join, a tree flowing to one outlet)
 *   Flows add. The water surface at the head of the downstream reach is carried up to the ends of the reaches that join it (the
 *   equal-water-surface method, the simple one: no angle, no momentum). Fine at low Froude numbers; flagged `junction`.
 *
 *   structures in the model: [{ id, kind: 'culvert' | 'bridge', rs, name, … }] (river.js cleanStructures)
 *   culvertHeadwater(c, q, tw, units) → { hw, control: 'inlet'|'outlet', qCulvert, qRoad, hwIn, hwOut, dc, v, flags }
 *   bridgeUpstream(b, secD, secU, q, wsD, units) → { wsU, wsB, egl, mode: 'low'|'pressure'|'weir', qPress, qWeir, choked, flags }
 *   solveStructures(model) → { units, issues, profiles: [{ name, regime, rows, flags, structures }] }
 *   solveNetwork({ reaches: [{ id, model, to }] }) → { order, reaches: { id → { issues, profiles } }, junctions, issues }
 */

import { UNIT_CONST, ordered, flowAt, nZonesFor } from './river.js';
import { geometry, hydraulics, criticalWs, brent, solveProfile } from './river-solve.js';

const G = (u) => UNIT_CONST[u === 'ft' ? 'ft' : 'm'].g;
const KC = (u) => UNIT_CONST[u === 'ft' ? 'ft' : 'm'].k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function STRUCT_DEFAULTS(units = 'm') {
  const ft = units === 'ft';
  return {
    culvert: { shape: 'box', rise: ft ? 4 : 1.2, span: ft ? 6 : 1.8, barrels: 1, length: ft ? 60 : 18, n: 0.013, ke: 0.5, cd: 0.6, cw: ft ? 3.1 : 1.7, roadCw: ft ? 3.1 : 1.7, roadLength: ft ? 100 : 30 },
    bridge: { cd: 0.8, cw: ft ? 3.1 : 1.7, cc: 0.3, ce: 0.5, deckWidth: ft ? 30 : 9 },
  };
}

// ---------------------------------------------------------------------------
// Culvert

/** Flow area, top width and the full-barrel hydraulic radius of one barrel at depth y. */
function barrel(c) {
  const D = c.rise;
  if (c.shape === 'circle') {
    const r = D / 2;
    return {
      D, B: D, full: Math.PI * r * r, R: D / 4,
      area: (y) => { if (y <= 0) return 0; if (y >= D) return Math.PI * r * r; const th = 2 * Math.acos((r - y) / r); return (r * r * (th - Math.sin(th))) / 2; },
      top: (y) => { if (y <= 0 || y >= D) return 0; return 2 * Math.sqrt(Math.max(0, y * (D - y))); },
    };
  }
  const B = c.span;
  return { D, B, full: B * D, R: (B * D) / (2 * (B + D)), area: (y) => B * clamp(y, 0, D), top: (y) => (y > 0 && y < D ? B : 0) };
}

/** Critical depth in one barrel for flow qb (Q²T = gA³; the depth is capped at the rise). */
function barrelCritical(br, qb, g) {
  const f = (y) => qb * qb * br.top(y) - g * Math.pow(br.area(y), 3);
  const hi = br.D * 0.999;
  if (f(hi) > 0) return br.D;   // still supercritical at the crown: the barrel runs full
  const r = brent(f, 1e-9 * br.D, hi, 1e-9 * br.D);
  return r.ok ? r.x : br.D;
}

function hwOfBarrelFlow(c, br, qb, tw, units) {
  const g = G(units), k = KC(units), D = br.D;
  const S0 = (c.invUp - c.invDown) / c.length;
  // inlet control
  const hwW = Math.pow(qb / (c.cw * br.B), 2 / 3);
  const hwO = (qb * qb) / (c.cd * c.cd * br.full * br.full * 2 * g) + D / 2;
  const phi = clamp((hwO / D - 1) / 0.5, 0, 1);
  const hwIn = (1 - phi) * hwW + phi * hwO;
  // outlet control
  const dc = barrelCritical(br, qb, g);
  const ho = Math.max(tw, (dc + D) / 2);
  const v = qb / br.full;
  const kf = (2 * g * c.n * c.n * c.length) / (k * k * Math.pow(br.R, 4 / 3));
  const hwOut = (1 + c.ke + kf) * (v * v) / (2 * g) + ho - c.length * S0;
  return { hwIn, hwOut, dc, v, hw: Math.max(hwIn, hwOut), control: hwIn >= hwOut ? 'inlet' : 'outlet' };
}

export function culvertHeadwater(c, q, tw, units = 'm') {
  const g = G(units), br = barrel(c), nb = Math.max(1, c.barrels | 0), flags = [];
  const roadQ = (hw) => { const over = c.invUp + hw - c.roadCrest; return Number.isFinite(c.roadCrest) && over > 0 ? c.roadCw * c.roadLength * Math.pow(over, 1.5) : 0; };
  // barrel flow for a headwater: invert hwOfBarrelFlow by bisection (it grows with the flow)
  const qbOf = (hw) => {
    let lo = 0, hi = Math.max(1e-6, q / nb);
    for (let i = 0; i < 80 && hwOfBarrelFlow(c, br, hi, tw, units).hw < hw; i++) hi *= 2;
    for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if (hwOfBarrelFlow(c, br, m, tw, units).hw < hw) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const total = (hw) => nb * qbOf(hw) + roadQ(hw);
  let lo = 0, hi = br.D;
  for (let i = 0; i < 60 && total(hi) < q; i++) hi *= 2;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (total(m) < q) lo = m; else hi = m; }
  const hw = (lo + hi) / 2, qRoad = roadQ(hw), qCulvert = Math.max(0, q - qRoad);
  const at = hwOfBarrelFlow(c, br, qCulvert / nb, tw, units);
  if (qRoad > 1e-9) flags.push('overtop');
  if (hw > 1.5 * br.D) flags.push('submerged');
  if (at.v > (units === 'ft' ? 15 : 4.5)) flags.push('fast');   // a typical scour limit: a hint, not a rule
  void g;
  return { hw, control: at.control, qCulvert, qRoad, hwIn: at.hwIn, hwOut: at.hwOut, dc: at.dc, v: at.v, flags };
}

// ---------------------------------------------------------------------------
// Bridge

/** The downstream section clipped to the abutments, piers as areas that carry no flow. */
export function openingSection(secD, b) {
  const lo = Math.max(secD.pts[0].o, b.abutL), hi = Math.min(secD.pts[secD.pts.length - 1].o, b.abutR);
  const zAt = (o) => {
    const p = secD.pts;
    for (let i = 1; i < p.length; i++) {
      if (o <= p[i].o + 1e-12 && p[i].o > p[i - 1].o) { const f = (o - p[i - 1].o) / (p[i].o - p[i - 1].o); return p[i - 1].z + f * (p[i].z - p[i - 1].z); }
    }
    return p[p.length - 1].z;
  };
  const pts = [{ o: lo, z: zAt(lo) }];
  for (const p of secD.pts) if (p.o > lo + 1e-9 && p.o < hi - 1e-9) pts.push({ o: p.o, z: p.z });
  pts.push({ o: hi, z: zAt(hi) });
  const bl = Math.max(lo, Math.min(hi, secD.banks[0])), br = Math.max(lo, Math.min(hi, secD.banks[1]));
  const banks = br > bl ? [bl, br] : [lo, hi];
  const ineff = (b.piers || []).map((p) => ({ o0: Math.max(lo, p.o - p.w / 2), o1: Math.min(hi, p.o + p.w / 2), trigger: null })).filter((r) => r.o1 > r.o0);
  const n = nZonesFor(secD).map((z) => ({ o: Math.max(lo, z.o0), n: z.n })).filter((z) => z.o < hi);
  return { ...secD, id: secD.id + '-bridge', pts, banks, n: n.length ? n : [{ o: lo, n: 0.035 }], ineff, levees: null, alpha: null };
}

function stateAt(geo, ws, q, units) {
  const h = hydraulics(geo, ws, units), g = G(units);
  return { h, ws, vh: h.A > 0 ? (h.alpha * q * q) / (2 * g * h.A * h.A) : Infinity };
}

export function bridgeUpstream(b, secD, secU, q, wsD, units = 'm') {
  const g = G(units), flags = [];
  const geoD = geometry(secD), geoU = geometry(secU), opening = openingSection(secD, b), geoB = geometry(opening);
  const dn = stateAt(geoD, wsD, q, units), eD = dn.ws + dn.vh;
  const critB = criticalWs(geoB, q, units), critU = criticalWs(geoU, q, units);
  const LB = Math.max(1e-6, b.rsB - b.rsD), LU = Math.max(1e-6, b.rsU - b.rsB);
  // opening, from the tailwater (expansion on the way out)
  const fB = (w) => { const s = stateAt(geoB, w, q, units); const sf = Math.pow(q / (0.5 * (s.h.K + dn.h.K)), 2); return s.ws + s.vh - (eD + LB * sf + b.ce * Math.max(0, s.vh - dn.vh)); };
  let wsB, choked = false;
  if (!(fB(critB) < 0)) { wsB = critB; choked = true; flags.push('choked'); } else {
    let hi = Math.max(critB, eD) + Math.max(1e-3, eD - geoB.minZ);
    for (let k = 0; k < 60 && !(fB(hi) > 0); k++) hi = critB + (hi - critB) * 2;
    const r = brent(fB, critB, hi);
    wsB = r.ok ? r.x : critB;
    if (!r.ok) flags.push('noconv');
  }
  const sB = stateAt(geoB, wsB, q, units), eB = sB.ws + sB.vh;
  // upstream section (contraction on the way in)
  const fU = (w) => { const s = stateAt(geoU, w, q, units); const sf = Math.pow(q / (0.5 * (s.h.K + sB.h.K)), 2); return s.ws + s.vh - (eB + LU * sf + b.cc * Math.max(0, sB.vh - s.vh)); };
  let hi = Math.max(critU, eB) + Math.max(1e-3, eB - geoU.minZ);
  for (let k = 0; k < 60 && !(fU(hi) > 0); k++) hi = critU + (hi - critU) * 2;
  const rU = fU(critU) < 0 ? brent(fU, critU, hi) : { ok: true, x: critU };
  let wsU = rU.ok ? rU.x : critU, mode = 'low', qPress = q, qWeir = 0;
  const uS = (w) => stateAt(geoU, w, q, units);
  if (wsU > b.lowChord) {
    // pressure (and weir) flow
    const An = hydraulics(geoB, b.lowChord, units).A, zb = geoB.minZ, Z = b.lowChord - zb;
    const Lw = Number.isFinite(b.weirLength) ? b.weirLength : secU.pts[secU.pts.length - 1].o - secU.pts[0].o;
    const flowAt2 = (w) => {
      const s = uS(w), egl = s.ws + s.vh;
      const head = wsD >= b.lowChord ? egl - wsD : egl - (zb + Z / 2);
      const qp = head > 0 ? b.cd * An * Math.sqrt(2 * g * head) : 0;
      const qw = egl > b.deckTop ? b.cw * Lw * Math.pow(egl - b.deckTop, 1.5) : 0;
      return { qp, qw };
    };
    const f = (w) => { const r = flowAt2(w); return r.qp + r.qw - q; };
    let top = Math.max(wsU, b.lowChord) + 1;
    for (let k = 0; k < 60 && !(f(top) > 0); k++) top = b.lowChord + (top - b.lowChord) * 2;
    const r = f(b.lowChord) < 0 ? brent(f, b.lowChord, top) : { ok: true, x: b.lowChord };
    if (r.ok && r.x > wsU) wsU = r.x;
    const fl = flowAt2(wsU);
    qPress = fl.qp; qWeir = fl.qw;
    mode = qWeir > 1e-9 ? 'weir' : 'pressure';
    flags.push(mode === 'weir' ? 'overtop' : 'pressure');
    if (!r.ok) flags.push('noconv');
  }
  const sU = uS(wsU);
  return { wsU, wsB, egl: sU.ws + sU.vh, mode, qPress, qWeir, choked, flags, openingArea: hydraulics(geoB, Math.min(wsB, b.lowChord), units).A };
}

// ---------------------------------------------------------------------------
// A model with structures

function between(secs, rs) {
  let d = -1;
  for (let i = 0; i < secs.length; i++) if (secs[i].rs < rs) d = i;
  return d >= 0 && d + 1 < secs.length && secs[d + 1].rs > rs ? d : -1;   // d = the section just below the structure
}

/** Standard-step profiles with the structures in the way (subcritical, downstream to upstream). */
export function solveStructures(model) {
  const units = model?.units === 'ft' ? 'ft' : 'm', issues = [];
  const structs = (model?.structures || []).slice().sort((a, b) => a.rs - b.rs);
  const secs = ordered(model);
  const profiles = [];
  if (model.regime && model.regime !== 'sub') issues.push({ code: 'structsub' });
  const cuts = [];
  for (const s of structs) {
    const d = between(secs, s.rs);
    if (d < 0) { issues.push({ code: 'structplace', id: s.id }); continue; }
    cuts.push({ s, d });
  }
  // sections per reach: reach j = sections between cut j-1 and cut j (downstream first)
  const reaches = [];
  let from = 0;
  for (const c of cuts) { reaches.push(secs.slice(from, c.d + 1)); from = c.d + 1; }
  reaches.push(secs.slice(from));
  if (reaches.some((r) => r.length < 2)) { issues.push({ code: 'structreach' }); return { units, issues, profiles: [] }; }
  for (const profile of model.profiles || []) {
    let down = profile.down, rows = [];
    const out = [], flagsTotal = {};
    for (let j = 0; j < reaches.length; j++) {
      const sub = { ...model, regime: 'sub', sections: reaches[j], structures: [] };
      const res = solveProfile(sub, { ...profile, down });
      rows.push(...res.rows);
      if (j >= cuts.length) break;
      const { s, d } = cuts[j];
      const dRow = res.rows[res.rows.length - 1], secD = secs[d], secU = secs[d + 1];
      const q = flowAt(profile, s.rs), wsD = dRow.wse;
      let wsU, info;
      if (s.kind === 'culvert') {
        const tw = Math.max(0, wsD - s.invDown), r = culvertHeadwater(s, q, tw, units);
        wsU = s.invUp + r.hw;
        info = { id: s.id, kind: 'culvert', rs: s.rs, q, tw: wsD, hwWse: wsU, control: r.control, qCulvert: r.qCulvert, qRoad: r.qRoad, v: r.v, dc: r.dc, flags: r.flags };
      } else {
        const r = bridgeUpstream({ ...s, rsD: secD.rs, rsU: secU.rs, rsB: s.rs }, secD, secU, q, wsD, units);
        wsU = r.wsU;
        info = { id: s.id, kind: 'bridge', rs: s.rs, q, tw: wsD, hwWse: wsU, control: r.mode, qCulvert: r.qPress, qRoad: r.qWeir, v: 0, dc: r.wsB, flags: r.flags };
      }
      out.push(info);
      for (const f of info.flags) flagsTotal[f] = (flagsTotal[f] || 0) + 1;
      down = { type: 'ws', wse: wsU };
    }
    const fl = {};
    for (const r of rows) for (const f of r.flags) fl[f] = (fl[f] || 0) + 1;
    profiles.push({ name: profile.name, regime: 'sub', rows, flags: fl, structures: out });
  }
  return { units, issues, profiles };
}

// ---------------------------------------------------------------------------
// Junctions

/**
 * Reaches that join. `reaches`: [{ id, model, to }]; `to` = the id of the reach this one flows into (null = the outlet; one only).
 * A reach with others joining its upstream end carries the sum of their flows (the same profile number in each). The water
 * surface at the first section of a reach becomes the downstream boundary of each reach that joins it.
 */
export function solveNetwork(net) {
  const reaches = new Map((net.reaches || []).map((r) => [r.id, r]));
  const issues = [];
  const kids = new Map();
  for (const r of reaches.values()) {
    if (r.to != null && !reaches.has(r.to)) { issues.push({ code: 'joinmissing', id: r.id }); continue; }
    if (r.to != null) { if (!kids.has(r.to)) kids.set(r.to, []); kids.get(r.to).push(r.id); }
  }
  const outlets = [...reaches.values()].filter((r) => r.to == null);
  if (outlets.length !== 1) issues.push({ code: 'oneoutlet' });
  // a cycle never reaches an outlet
  for (const r of reaches.values()) { let x = r, n = 0; while (x && x.to != null && n < reaches.size + 1) { x = reaches.get(x.to); n++; } if (n > reaches.size) { issues.push({ code: 'joincycle', id: r.id }); break; } }
  if (issues.length) return { order: [], reaches: {}, junctions: [], issues };
  const out = {}, junctions = [], order = [];
  const qOf = (id, pi) => {   // the flow of profile index pi at the head of reach id (sum of the ones joining it)
    const r = reaches.get(id), k = kids.get(id) || [];
    return k.length ? k.reduce((s, c) => s + qOf(c, pi), 0) : r.model.profiles[pi]?.q ?? 0;
  };
  const run = (id, downFor) => {   // downFor(pi) → boundary of this reach's profile pi
    const r = reaches.get(id);
    const m = { ...r.model, profiles: r.model.profiles.map((p, pi) => ({ ...p, q: qOf(id, pi), changes: (kids.get(id) || []).length ? [] : p.changes, down: downFor(pi) })) };
    const hasStruct = (m.structures || []).length > 0;
    const res = hasStruct ? solveStructures(m) : { units: m.units, issues: [], profiles: m.profiles.map((p) => solveProfile({ ...m, regime: m.regime || 'sub' }, p)) };
    out[id] = res; order.push(id);
    const k = kids.get(id) || [];
    if (k.length) {
      const heads = res.profiles.map((p) => p.rows[p.rows.length - 1]);
      const j = { into: id, ups: k, profiles: heads.map((h, pi) => ({ name: m.profiles[pi].name, q: h.q, wse: h.wse, parts: k.map((c) => qOf(c, pi)) })) };
      junctions.push(j);
      for (const c of k) run(c, (pi) => ({ type: 'ws', wse: heads[pi].wse }));
    }
  };
  const root = outlets[0];
  run(root.id, (pi) => root.model.profiles[pi].down);
  return { order, reaches: out, junctions, issues };
}

/**
 * The rivers joined to river `id` through `joinsTo` (both ways, a tree), as solveNetwork wants them. `rivers`: the project's cleaned models. null when `id` joins nothing and nothing joins it.
 * Every river in the group must have the same number of profiles (profile 1 of each is the same event); the flows of the ones that join are added into the one they join.
 *   networkOf(rivers, id) → { ids, reaches: [{ id, model, to }], issues: [{ code, id? }] } | null
 */
export function networkOf(rivers, id) {
  const by = new Map(rivers.map((r) => [r.id, r]));
  if (!by.has(id)) return null;
  const group = new Set([id]); let grew = true;
  while (grew) { grew = false; for (const r of rivers) { const j = r.joinsTo && by.has(r.joinsTo) ? r.joinsTo : null; if (j && (group.has(r.id) !== group.has(j))) { group.add(r.id); group.add(j); grew = true; } } }
  if (group.size < 2) return null;
  const reaches = [...group].map((rid) => { const r = by.get(rid); return { id: rid, model: r, to: r.joinsTo && group.has(r.joinsTo) ? r.joinsTo : null }; });
  const issues = [], n = reaches[0].model.profiles.length;
  for (const r of reaches) if (r.model.profiles.length !== n) issues.push({ code: 'profilecount', id: r.id });
  return { ids: [...group], reaches, issues };
}
