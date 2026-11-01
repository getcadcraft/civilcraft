/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geo-run.js — the one place each EG.9/10/11/27/28 and CV.1 calculation is run from a saved item (0.8, session civil-geo_PART_2). The window (geo-ui.js) and the assistant
 * tools (geo-agent.js) both call these, so there is one code path (rule 34). No DOM, no strings. Items are what geo-state.js keeps, in the PROJECT's length unit;
 * `units` is 'm' or 'ft' and every engine works in metres, so lengths go in through `toM` and out through `fromM`. Stresses and unit weights are always kPa and kN/m³.
 *
 *   runProfile(geo, sectionId, units, { step })                 → sectionProfile + stations
 *   slopeGeometry(geo, slope, units, ground)                    → geom for geotech.bishop (metres) + the section it came from
 *   runSlope(geo, slope, units, ground, { search, circle })     → { geom, fs, critical, problems }
 *   runSettlement(geo, settle, units)                           → { consolidation, immediate, total, rows, time }
 *   runJunction(j, units, { obstacles })                        → { intersection, isd, triangles, problems }
 *   runStripe(item, line, units)                                → { stripe, signs }
 *   runNet(net, opts)                                           → adjustNetwork result
 *   runPit(pit, units)                                          → { model, values, result, summary, gradeTonnage }
 *   runLink(link, units, ground)                                → { los, budget, mast }
 *   runCover(cover, units, ground)                              → { nx, ny, x0, y0, step, pr (dBm, metres), covered, farthest }
 *   runTurnout(t, units)                                        → turnout / crossover result
 *   runTraverse(tv, units)                                       → closing traverse by the compass rule (0.8 round 3)
 *   runDrawing(geo, units, lineOf)                               → plan entities for junctions, striping, signs, crossings and turnouts (window overlay, .dxf, assistant tool)
 *   runClearance(c)                                             → { polygon, allowance, spacing } a structure gauge on a curve (metres)
 */
import { sectionProfile, stackAt, bishop, searchSlip, settlement, timeCurve, timeFor, FS_TARGETS, mirrorGeom } from './geotech.js';
import { intersection, isd, sightTriangle, triangleBlocked, stripe, signsFor, crossingsFor } from './intersection.js';
import { adjustNetwork, minimalConstraints, bowditch } from './adjust.js';
import { makeModel, idw, blockValues, ultimatePit, gradeTonnage, pitSummary, nestedPits, schedule, rampLength } from './mining.js';
import { losProfile, linkBudget, mastHeightFor, terrainAlong, fspl, availability, towerBase, coverage, towerLegs } from './telecom.js';
import { rampRoute, benchLoops, slopeWithRamp } from './pit-geom.js';   // 0.8 EG.27 (civil_PART_4)
import { turnout, crossover, divergingSpeed, envelopeAt, minSpacing, curveAllowance } from './turnout.js';

export const FT = 0.3048;
export const toM = (units) => (units === 'ft' ? FT : 1);
const D2R = Math.PI / 180;
const pl = (line, k) => line.map((p) => ({ x: p.x * k, y: p.y * k }));

export function runProfile(geo, sectionId, units, { step = null } = {}) {
  const sec = (geo?.sections || []).find((s) => s.id === sectionId); if (!sec) return null;
  const k = toM(units), borings = (geo.borings || []).map((b) => ({ ...b, x: b.x * k, y: b.y * k, z: b.z * k, depth: b.depth * k, water: b.water === null ? null : b.water * k, layers: b.layers.map((l) => ({ ...l, from: l.from * k, to: l.to * k })) }));
  const prof = sectionProfile(borings, pl(sec.line, k), { width: sec.width * k });
  const n = Math.max(2, Math.round(prof.length / (step ? step * k : Math.max(prof.length / 40, 0.5))));
  prof.stations = Array.from({ length: n + 1 }, (_, i) => { const sta = (prof.length * i) / n; return { sta, stack: stackAt(prof, sta) }; });
  return { section: sec, profile: prof, k };
}

export function slopeGeometry(geo, slope, units, ground, { points = 80 } = {}) {
  const p = runProfile(geo, slope.section, units); if (!p) return { problems: [{ code: 'geo.slope.nosection' }] };
  const { profile, k } = p, L = profile.length; if (!ground) return { problems: [{ code: 'geo.slope.noground' }] };
  const line = pl(p.section.line, k), pos = (d) => { let acc = 0; for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y); if (d <= acc + l || i === line.length - 1) { const u = Math.max(0, Math.min(1, (d - acc) / l)); return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }; } acc += l; } return line[0]; };
  const gz = (d) => { const q = pos(d), v = ground.elevationAt(q.x / k, q.y / k); return v === null || v === undefined ? NaN : v * k; };
  const gp = []; for (let i = 0; i <= points; i++) { const d = (L * i) / points, z = gz(d); if (Number.isFinite(z)) gp.push({ x: d, z }); }
  if (gp.length < 3) return { problems: [{ code: 'geo.slope.noground' }] };
  // units from the profile (named strata, top first at each station); a unit's top line = its top at every station where it exists
  const units_ = []; for (const s of profile.strata) units_.push(s.unit);
  const topLine = (unit) => { const pts = []; for (let i = 0; i <= points; i++) { const d = (L * i) / points, st = stackAt(profile, d).find((q) => q.unit === unit); if (st) pts.push({ x: d, z: Math.min(st.top, gp[Math.min(i, gp.length - 1)].z) }); } return pts; };
  const mats = slope.materials || {}, byUnit = {};
  for (const b of geo.borings || []) for (const l of b.layers) if (!byUnit[l.unit]) byUnit[l.unit] = l;
  const layers = [];
  const order = units_.map((u) => ({ u, line: topLine(u) })).filter((q) => q.line.length).sort((a, b) => b.line.reduce((s, q) => s + q.z, 0) / b.line.length - a.line.reduce((s, q) => s + q.z, 0) / a.line.length);
  for (const { u, line: tl } of order) { const m = mats[u] || byUnit[u] || { gamma: 18, c: 0, phi: 28 }; layers.push({ name: u, top: tl.length > 1 ? tl : [{ x: 0, z: tl[0].z }, { x: L, z: tl[0].z }], gamma: m.gamma, c: m.c, phi: m.phi, ...(m.cu !== undefined ? { cu: m.cu } : {}) }); }
  if (!layers.length) layers.push({ name: 'soil', top: gp.map((q) => ({ ...q })), gamma: 18, c: 5, phi: 28 });
  layers[0].top = gp.map((q) => ({ ...q }));   // the first layer starts at the ground
  const floor = slope.floor !== null && slope.floor !== undefined ? slope.floor * k : Math.min(...profile.borings.map((b) => b.z - b.depth), Math.min(...gp.map((q) => q.z)) - 0.5 * (Math.max(...gp.map((q) => q.z)) - Math.min(...gp.map((q) => q.z))));
  const geom = { ground: gp, layers, water: slope.water === null || slope.water === undefined ? null : slope.water * k, ru: slope.ru || 0, surcharge: (slope.surcharge || []).map((s) => ({ x0: s.x0 * k, x1: s.x1 * k, q: s.q })), floor };
  return { geom, profile, k, problems: profile.problems || [] };
}

export function runSlope(geo, slope, units, ground, { search = true, circle = null, slices = 60 } = {}) {
  const g = slopeGeometry(geo, slope, units, ground); if (!g.geom) return { problems: g.problems };
  const o = { method: slope.method, kh: slope.kh, slices };
  if (circle) { const r = bishop(g.geom, { xc: circle.xc * g.k, zc: circle.zc * g.k, R: circle.R * g.k }, o); return { geom: g.geom, fs: r.fs, critical: { circle, fs: r.fs, xl: r.xl, xr: r.xr }, problems: r.problems, k: g.k }; }
  const r = searchSlip(g.geom, { ...o, nx: 14, nz: 10, nr: 14 });
  return { geom: g.geom, fs: r.critical ? r.critical.fs : NaN, critical: r.critical, grid: r.grid, problems: [...(r.problems || []), ...(r.critical?.problems || []), ...(r.critical ? (r.critical.fs < FS_TARGETS.long ? [{ code: 'geo.slope.low', value: r.critical.fs, limit: FS_TARGETS.long }] : []) : [])], k: g.k, tried: r.tried };
}

export function runSettlement(geo, s, units) {
  const b = (geo?.borings || []).find((x) => x.id === s.boring); if (!b) return { problems: [{ code: 'geo.settle.noboring' }] };
  const k = toM(units), layers = b.layers.map((l) => ({ top: (b.z - l.from) * k, bottom: (b.z - l.to) * k, gamma: l.gamma, gammaSat: l.gammaSat, cc: l.cc, cs: l.cs, e0: l.e0, sigmaC: l.sigmaC, es: l.es, nu: l.nu, cv: l.cv }));
  const water = s.water !== null && s.water !== undefined ? (b.z - s.water) * k : b.water !== null ? (b.z - b.water) * k : null;
  const base = layers[0].top + (s.load.depth || 0) * 0;
  const res = settlement({ layers, load: { q: s.load.q, B: s.load.B * k, L: s.load.L * k, depth: base - Math.max(s.load.depth, 0) * k, at: s.load.at, method: s.load.method }, water, ground: layers[0].top, step: 1 });
  const clay = b.layers.filter((l) => l.cv && l.cc);
  let time = null;
  if (clay.length && res.consolidation > 0) { const l = clay[0], H = ((l.to - l.from) * k) / 2, cv = l.cv; time = { t50: timeFor(0.5, H, cv), t90: timeFor(0.9, H, cv), curve: timeCurve(res.consolidation, H, cv, timeFor(0.95, H, cv), 20), Hdr: H, cv }; }
  const problems = res.total > 0.025 ? [{ code: 'geo.settle.total', value: res.total, limit: 0.025 }] : [];
  return { ...res, time, problems };
}

export function runJunction(j, units, { obstacles = [] } = {}) {
  const k = toM(units), legs = j.legs.map((l) => ({ bearing: l.bearing * D2R, halfWidth: l.halfWidth, length: l.length, name: l.name }));
  const r = intersection({ centre: j.centre, legs: legs.map((l, i) => (Number.isFinite(j.legs[i].radius) ? { ...l, radius: j.legs[i].radius } : l)), radius: j.radius, curb: j.curb === '3centre' ? '3c' : 'simple' });
  const d = isd({ speed: j.speed, gap: j.gap }) / k, tri = [], problems = [...r.problems];
  // sight triangles: each minor leg looking along the major (the first two legs are taken as the major road)
  if (legs.length >= 3) for (const minor of r.legs.slice(2)) {
    const hw = minor.halfWidth, back = 4.5 / k, dirOut = minor.dir;
    for (const sgn of [-1, 1]) {
      const major = r.legs[0].dir, towards = { x: major.x * sgn, y: major.y * sgn }, setback = r.legs[0].halfWidth;
      const driver = { x: j.centre.x + dirOut.x * (setback + back) + towards.x * 0, y: j.centre.y + dirOut.y * (setback + back) };
      const t = sightTriangle({ driver, minorDir: { x: -dirOut.x, y: -dirOut.y }, majorDir: towards, minorLeg: back, majorLeg: d });
      const hit = triangleBlocked(t, obstacles); tri.push({ leg: minor.name, side: sgn, pts: t, blocked: hit });
      if (hit.length) problems.push({ code: 'int.sight.blocked', leg: minor.name, objects: hit, need: d });
    }
    void hw;
  }
  const m = 1 / k, crossings = j.crossings === 'continental' || j.crossings === 'ladder' ? crossingsFor(r, { style: j.crossings, gap: 1.5 * m, stopGap: 1.2 * m, length: 3 * m, stopWidth: 0.6 * m, bar: 0.4 * m, barGap: 0.6 * m }) : [];
  return { intersection: r, isd: d, triangles: tri, crossings, problems };
}

export function runStripe(item, line, units) {
  const k = toM(units), m = 1 / k;   // defaults in the engine are metres: scale to project units
  const dflt = { 'centre-double': { width: 0.1 * m, gapBetween: 0.1 * m }, 'centre-dashed': { width: 0.1 * m, dash: 3 * m, gap: 9 * m }, 'lane-dashed': { width: 0.1 * m, dash: 3 * m, gap: 9 * m }, edge: { width: 0.1 * m }, 'lane-solid': { width: 0.1 * m } };
  const s = stripe(line, { ...item.plan, marking: { ...dflt, ...(item.plan.marking || {}) } });
  return { stripe: s, signs: signsFor(line, { signs: item.signs || [], repeat: item.repeat || [] }) };
}

export function runNet(net, opts = {}) { return adjustNetwork(net.free === 'yes' ? minimalConstraints(net.points, net.obs) : net.points, net.obs, opts); }

/** A traverse (start, legs of distance + azimuth in degrees, optionally a known end) closed by the compass rule. Lengths in the project unit. */
export function runTraverse(tv) {
  const r = bowditch(tv.start, tv.legs.map((l) => ({ dist: l.dist, az: l.az * D2R })), { end: tv.end || null });
  const problems = r.precision < 5000 ? [{ code: 'geo.traverse.loose', value: r.precision }] : [];
  return { ...r, problems };
}

export function runPit(p, units) {
  const k = toM(units), model = makeModel({ nx: p.nx, ny: p.ny, nz: p.nz, size: p.size.map((v) => v * k), origin: p.origin.map((v) => v * k), density: p.density });
  idw(model, p.samples.map((s) => ({ x: s.x * k, y: s.y * k, z: s.z * k, grade: s.grade })), { power: 2, radius: Infinity });
  const values = blockValues(model, { price: p.price, recovery: p.recovery, processCost: p.processCost, miningCost: p.miningCost });
  const rampW = (p.rampWidth || 0) * k, slopeRad = p.rampOn === 'yes' && rampW > 0 ? slopeWithRamp(p.slope * D2R, p.size[2] * k, rampW) : p.slope * D2R;   // a ramp lane on every bench flattens the wall (spiral ramp)
  const result = ultimatePit(model, values, { slope: slopeRad });
  let phases = null, plan = null;
  if (p.phases > 0) {
    const n = Math.max(1, Math.round(p.phases)), factors = Array.from({ length: n }, (_, i) => (n === 1 ? 1 : 0.4 + (0.6 * i) / (n - 1)));
    phases = nestedPits(model, { price: p.price, recovery: p.recovery, processCost: p.processCost, miningCost: p.miningCost }, { factors, slope: slopeRad });
    if (p.oreCapacity > 0 || p.moveCapacity > 0) plan = schedule(model, phases, values, { oreCapacity: p.oreCapacity > 0 ? p.oreCapacity : Infinity, moveCapacity: p.moveCapacity > 0 ? p.moveCapacity : Infinity, discount: p.discount });
  }
  const summary = pitSummary(model, values, result), ramp = rampLength({ benchHeight: p.size[2] * k, grade: p.rampGrade || 0.1, benches: Math.max(0, summary.benches.length) });
  // the haul ramp laid on the pit's walls and the problems it raises (rule 29): the road is a sketch on the block model's stepped walls
  const road = rampW > 0 ? rampRoute(model, result.mined, { grade: p.rampGrade || 0.1, width: rampW }) : null;
  const problems = (road?.flags || []).filter((f) => f !== 'noRamp').map((code) => ({ code: 'pit.ramp.' + code, item: p.name || p.id }));
  return { model, values, result, phases, plan, ramp, road, problems, slopeUsed: slopeRad / D2R, summary, gradeTonnage: gradeTonnage(model, [0, 0.25, 0.5, 1, 2, 4].map((v) => v * (Math.max(...model.grade) / 4 || 1)), result.mined) };
}

/** Each bench's outline (metres) of a finished pit run, for the picture. */
export const pitLoops = (r) => { const out = []; for (let kk = r.model.nz - 1; kk >= 0; kk--) { const L = benchLoops(r.model, r.result.mined, kk); if (L.length) out.push({ level: kk, z: r.model.origin[2] + (kk + 1) * r.model.size[2], loops: L }); } return out; };

export function runLink(l, units, ground) {
  const k = toM(units), A = { x: l.a.x * k, y: l.a.y * k }, B = { x: l.b.x * k, y: l.b.y * k };
  const g = (x, y) => { const v = ground ? ground.elevationAt(x / k, y / k) : 0; return v === null || v === undefined ? NaN : v * k; };
  const terrain = terrainAlong(g, A, B, 100), dKm = Math.hypot(B.x - A.x, B.y - A.y) / 1000;
  const los = losProfile(terrain, { hA: l.a.h * k, hB: l.b.h * k, f: l.f, k: l.k, clutter: l.clutter * k });
  const budget = linkBudget({ pt: l.pt, gt: l.gt, gr: l.gr, dKm, fMHz: l.f * 1000, sensitivity: l.sensitivity });
  const mast = los.clear ? null : mastHeightFor(terrain, { hB: l.b.h * k, f: l.f, k: l.k, clutter: l.clutter * k });
  const avail = availability({ dKm, fGHz: l.f, fadeMargin: budget.margin, terrain: l.terrain }), tower = l.towerWidth > 0 ? towerBase({ height: l.a.h * k, width: l.towerWidth * k, solidity: l.towerSolidity, antennas: [{ area: l.antennaArea * k * k, h: l.a.h * k, cd: 1.2 }], v: l.wind, weight: l.towerWeight, footing: l.footing * k }) : null;
  const problems = []; if (!los.clear) problems.push({ code: 'tel.los.blocked', clearance: los.min?.clearance, ratio: los.min?.ratio });
  if (budget.margin < 10) problems.push({ code: 'tel.margin.low', margin: budget.margin });
  // 0.8 EG.28: the legs under that wind moment, against the person's capacity and factor (no code's numbers are built in)
  const legs = tower ? towerLegs({ legs: l.towerLegs, width: l.towerWidth * k, moment: tower.moment, vertical: l.towerWeight, legCapacity: l.legCapacity, loadFactor: l.loadFactor, E: l.legE, I: l.legI, L: l.legLength * k, K: l.legK }) : null;
  if (legs?.utilization > 1) problems.push({ code: 'tel.leg.over', util: legs.utilization });
  if (legs?.bucklingUtil > 1) problems.push({ code: 'tel.leg.buckling', util: legs.bucklingUtil });
  return { terrain, los, budget, mast: mast === null ? null : mast / k, dKm, fspl: fspl(dKm, l.f * 1000), availability: avail, tower, legs, problems };
}

/** A coverage sketch: the received power over the ground around a transmitter (telecom.js coverage). `ground(x, y)` in the project unit, like runLink's. */
export function runCover(c, units, ground) {
  const k = toM(units), g = (x, y) => { const v = ground ? ground.elevationAt(x / k, y / k) : 0; return v === null || v === undefined ? NaN : v * k; };
  const n = Math.floor(c.range / c.step);
  if (n > 150) return { ok: false, problems: [{ code: 'tel.cover.fine', cells: (2 * n + 1) ** 2 }] };
  const r = coverage(g, { x: c.tx.x * k, y: c.tx.y * k, h: c.tx.h * k }, { f: c.f, pt: c.pt, gt: c.gt, gr: c.gr, sensitivity: c.sensitivity, rxH: c.rxH * k, radius: c.range * k, step: c.step * k, k: c.k, clutter: c.clutter * k });
  let far = 0; for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) { const p = r.pr[i + r.nx * j]; if (p >= c.sensitivity) far = Math.max(far, Math.hypot(r.x0 + i * r.step - c.tx.x * k, r.y0 + j * r.step - c.tx.y * k)); }
  const problems = [];
  if (!r.cells) problems.push({ code: 'tel.cover.noground' });
  return { ok: true, ...r, farthest: far / k, problems };
}

export function runTurnout(t) {
  if (t.spacing > 0) return crossover({ n: t.n, gauge: t.gauge, switchLength: t.switchLength, switchAngle: t.switchAngle, spacing: t.spacing });
  const r = turnout({ n: t.n, gauge: t.gauge, switchLength: t.switchLength, switchAngle: t.switchAngle, side: t.side });
  return r.ok ? { ...r, speed: divergingSpeed(r.R) } : r;
}
void mirrorGeom; void timeFor;

/** A structure gauge on a curve: the outline tilted by the cant and widened by the curve's overhangs, and the least track-centre spacing for two such tracks. Outline in metres (o right of the track, z above rail). */
export function runClearance(c) {
  const R = c.radius > 0 ? c.radius : Infinity, poly = envelopeAt({ outline: c.outline, radius: R, cant: c.cant, base: c.base, length: c.length, bogie: c.bogie, curve: c.curve });
  const al = Number.isFinite(R) ? curveAllowance({ radius: R, length: c.length, bogie: c.bogie }) : { inside: 0, outside: 0 };
  const straight = envelopeAt({ outline: c.outline });
  const o = c.outline.map((p) => p.o), width = Math.max(...o) - Math.min(...o);
  return { polygon: poly, straight, allowance: al, spacing: minSpacing(poly, poly), width, problems: [] };
}


// ------------------------------------------------------------------ the drawing: junctions, striping, signs, crossings and turnouts as plan entities (dxf.js shapes)
const LAYERS = { 'C-ROAD-EDGE': 'white', 'C-ROAD-MARK-YELLOW': 'yellow', 'C-ROAD-MARK-WHITE': 'white', 'C-ROAD-XWALK': 'cyan', 'C-ROAD-SIGN': 'green', 'C-RAIL-TURNOUT': 'orange', 'C-RAIL-MAIN': 'gray' };
export const DRAWING_LAYERS = Object.entries(LAYERS).map(([name, color]) => ({ name, color }));
const along = (line, d) => {   // the point and unit direction at distance d along a polyline
  let acc = 0; for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y); if (l > 0 && (d <= acc + l || i === line.length - 1)) { const u = Math.max(0, Math.min(1, (d - acc) / l)); return { p: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }, d: { x: (b.x - a.x) / l, y: (b.y - a.y) / l } }; } acc += l; }
  return null;
};
/** lineOf(alignmentId) → [{x,y}] in the project unit, or null. Everything shown is what the windows save (items with show 'no' are left out). */
export function runDrawing(geo, units, lineOf) {
  const ents = [], notes = [];
  for (const j of geo?.junctions || []) {
    if (j.show === 'no') continue;
    const r = runJunction(j, units); if (!r.intersection.pavement.length) continue;
    ents.push({ type: 'poly', layer: 'C-ROAD-EDGE', pts: r.intersection.pavement, closed: true, elev: 0, of: j.id });
    for (const c of r.crossings) { for (const b of c.bars) ents.push({ type: 'poly', layer: 'C-ROAD-XWALK', pts: b, closed: true, elev: 0, of: j.id }); ents.push({ type: 'poly', layer: 'C-ROAD-MARK-WHITE', pts: c.stopBar, closed: true, elev: 0, of: j.id }); }
  }
  for (const s of geo?.stripes || []) {
    if (s.show === 'no') continue;
    const line = lineOf(s.alignment); if (!line || line.length < 2) { notes.push({ code: 'geo.draw.noalignment', item: s.id }); continue; }
    const r = runStripe(s, line, units);
    for (const it of r.stripe.items) ents.push({ type: 'poly', layer: it.colour === 'yellow' ? 'C-ROAD-MARK-YELLOW' : 'C-ROAD-MARK-WHITE', pts: it.pts, closed: false, elev: 0, of: s.id });
    for (const g of r.signs.signs) { ents.push({ type: 'point', layer: 'C-ROAD-SIGN', x: g.x, y: g.y, z: 0, of: s.id }); ents.push({ type: 'text', layer: 'C-ROAD-SIGN', x: g.x, y: g.y, h: 0.6 / toM(units), rot: 0, text: g.code, align: 'left', of: s.id }); }
  }
  for (const t of geo?.turnouts || []) {
    if (t.show === 'no' || !t.alignment) continue;
    const line = lineOf(t.alignment); if (!line || line.length < 2) { notes.push({ code: 'geo.draw.noalignment', item: t.id }); continue; }
    const r = runTurnout(t); const T = r.turnout || r; if (!r.ok) continue;
    const k = toM(units), at = along(line, t.station); if (!at) continue;
    const place = (x, y) => ({ x: at.p.x + (at.d.x * x - at.d.y * y) / k, y: at.p.y + (at.d.y * x + at.d.x * y) / k });
    const len = (r.length || T.length || 0);
    ents.push({ type: 'poly', layer: 'C-RAIL-MAIN', pts: [place(0, 0), place(len, 0)], closed: false, elev: 0, of: t.id });
    ents.push({ type: 'poly', layer: 'C-RAIL-TURNOUT', pts: T.centre.map((q) => place(q.x, q.y)), closed: false, elev: 0, of: t.id });
    if (r.straight !== undefined && r.turnout) { /* a crossover: the second turnout is the mirror, drawn from the far track */ }
  }
  return { entities: ents, notes, layers: DRAWING_LAYERS };
}
