/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geo-state.js — what the second round-2 CivilCraft session keeps in the project file (0.8 EG.9, EG.10, EG.11, EG.27, EG.28, CV.1), under one key `geo`.
 * Every cleaner takes a file's word for nothing (the file is untrusted): numbers are bounded, text is cut, unknown fields dropped. No DOM, no strings.
 *
 *   geo.borings   [{ id, name, x, y, z, depth, water, layers: […] }]                       geotech.js cleanBoring
 *   geo.sections  [{ id, name, line: [{x,y}], width }]                                      a line the soil profile and a slope are cut along
 *   geo.slopes    [{ id, name, section, ru, kh, method, water: number | null, surcharge: [{ x0, x1, q }], materials: { unit: { gamma, c, phi, cu } }, floor }]
 *   geo.settles   [{ id, name, boring, load: { q, B, L, depth, at, method }, water }]
 *   geo.junctions [{ id, name, centre, legs: [{ bearing (deg, math), halfWidth, length, name }], radius, speed, gap }]
 *   geo.stripes   [{ id, name, alignment, plan: { lanesLeft, lanesRight, laneWidth, centre, edge, breaks }, signs: [{ kind, station, side, offset }] }]
 *   geo.links     [{ id, name, a: {x,y,h}, b: {x,y,h}, f (GHz), pt, gt, gr, … }]
 *   geo.covers [{ id, name, tx: {x,y,h}, f, pt, gt, gr, sensitivity, rxH, range, step, k, clutter, show }]   a coverage sketch over the ground (telecom.js coverage)
 *   geo.pits      [{ id, name, nx, ny, nz, size, origin, samples, price, … , slope }]
 *   geo.nets      [{ id, name, points, obs }]                                               an adjustment network (bounded)
 *   geo.turnouts  [{ id, name, n, gauge, side, switchLength, switchAngle, alignment, station, spacing }]
 *   geo.traverses [{ id, name, start: {x,y}, end?: {x,y}, legs: [{ dist, az (degrees from north, clockwise) }] }]   a traverse closed by the compass rule
 *   geo.clearances [{ id, name, outline: [{o,z}], radius (0 = straight), cant (mm), base (mm), length, bogie, curve }]   a structure gauge or vehicle outline for a curve
 *   cleanGeo(obj, units, id) → geo | null     id(v, prefix) gives an unused id (the project's counter)
 */
import { cleanBoring } from './geotech.js';

const fin = (v) => Number.isFinite(Number(v)) && v !== '' && v !== null && v !== undefined;
const N = (v, d, lo = -1e9, hi = 1e9) => (fin(v) ? Math.min(hi, Math.max(lo, Number(v))) : d);
const S = (v, n = 80) => String(v ?? '').slice(0, n);
const pt = (p) => (p && fin(p.x) && fin(p.y) ? { x: N(p.x, 0), y: N(p.y, 0) } : null);
const arr = (a, f, max) => (Array.isArray(a) ? a.slice(0, max).map(f).filter(Boolean) : []);

export function cleanGeo(obj, units, id) {
  if (!obj || typeof obj !== 'object') return null;
  const g = {}, has = (k) => g[k] && g[k].length;
  g.borings = arr(obj.borings, (b) => { const c = cleanBoring(b, units); if (c) c.id = id(b?.id, 'bo'); return c; }, 500);
  g.sections = arr(obj.sections, (s) => { const line = arr(s?.line, pt, 500); return line.length >= 2 ? { id: id(s.id, 'sx'), name: S(s.name), line, width: N(s.width, 1e9, 0, 1e9) } : null; }, 200);
  g.slopes = arr(obj.slopes, (s) => !s ? null : {
    id: id(s.id, 'sl'), name: S(s.name), section: S(s.section, 20), ru: N(s.ru, 0, 0, 1), kh: N(s.kh, 0, 0, 1), method: s.method === 'ordinary' ? 'ordinary' : 'bishop',
    water: fin(s.water) ? N(s.water, null) : null, floor: fin(s.floor) ? N(s.floor, null) : null,
    surcharge: arr(s.surcharge, (q) => (fin(q?.x0) && fin(q?.x1) && fin(q?.q) ? { x0: N(q.x0, 0), x1: N(q.x1, 0), q: N(q.q, 0, 0, 1e5) } : null), 20),
    materials: Object.fromEntries(Object.entries(s.materials && typeof s.materials === 'object' ? s.materials : {}).slice(0, 40).map(([k, m]) => [S(k, 40), { gamma: N(m?.gamma, 18, 5, 35), c: N(m?.c, 0, 0, 5000), phi: N(m?.phi, 28, 0, 60), ...(fin(m?.cu) ? { cu: N(m.cu, 0, 0, 5000) } : {}) }])),
  }, 100);
  g.settles = arr(obj.settles, (s) => !s ? null : { id: id(s.id, 'se'), name: S(s.name), boring: S(s.boring, 20), water: fin(s.water) ? N(s.water, null) : null,
    load: { q: N(s.load?.q, 100, 0, 1e6), B: N(s.load?.B, 2, 0.01, 1e4), L: N(s.load?.L, 2, 0.01, 1e4), depth: N(s.load?.depth, 0, -1e4, 1e4), at: s.load?.at === 'corner' ? 'corner' : 'centre', method: s.load?.method === '2:1' ? '2:1' : 'boussinesq' } }, 100);
  g.junctions = arr(obj.junctions, (j) => { const c = pt(j?.centre), legs = arr(j?.legs, (l) => (fin(l?.bearing) ? { bearing: N(l.bearing, 0, -720, 720), halfWidth: N(l.halfWidth, 6, 0.1, 200), length: N(l.length, 30, 1, 1e4), name: S(l.name, 40), ...(fin(l.radius) ? { radius: N(l.radius, 9, 0, 500) } : {}) } : null), 8);
    return c && legs.length >= 2 ? { id: id(j.id, 'ju'), name: S(j.name), centre: c, legs, radius: N(j.radius, 9, 0, 500), speed: N(j.speed, 50, 5, 200), gap: N(j.gap, 7.5, 1, 20), curb: j.curb === '3centre' ? '3centre' : 'simple', crossings: ['continental', 'ladder'].includes(j.crossings) ? j.crossings : 'none', show: j.show === 'no' ? 'no' : 'yes' } : null; }, 100);
  g.stripes = arr(obj.stripes, (s) => !s ? null : { id: id(s.id, 'st'), name: S(s.name), alignment: S(s.alignment, 20), show: s.show === 'no' ? 'no' : 'yes',
    plan: { lanesLeft: N(s.plan?.lanesLeft, 1, 0, 8), lanesRight: N(s.plan?.lanesRight, 1, 0, 8), laneWidth: N(s.plan?.laneWidth, 3.6, 1, 10), centre: ['double', 'dashed', 'none'].includes(s.plan?.centre) ? s.plan.centre : 'double', edge: s.plan?.edge !== false,
      breaks: arr(s.plan?.breaks, (b) => (fin(b?.from) && fin(b?.to) ? { from: N(b.from, 0), to: N(b.to, 0) } : null), 50) },
    signs: arr(s.signs, (q) => (fin(q?.station) && ['stop', 'yield', 'speed', 'street', 'no-parking', 'crossing'].includes(q?.kind) ? { kind: q.kind, station: N(q.station, 0), side: q.side === 'L' ? 'L' : 'R', offset: N(q.offset, 2, 0, 100), text: S(q.text, 40) } : null), 200) }, 100);
  g.links = arr(obj.links, (l) => { const a = pt(l?.a), b = pt(l?.b); return a && b ? { id: id(l.id, 'lk'), name: S(l.name), a: { ...a, h: N(l.a.h, 30, 0, 500) }, b: { ...b, h: N(l.b.h, 30, 0, 500) }, f: N(l.f, 5, 0.1, 100), pt: N(l.pt, 20, -50, 80), gt: N(l.gt, 30, -20, 80), gr: N(l.gr, 30, -20, 80), sensitivity: N(l.sensitivity, -85, -140, 0), k: N(l.k, 4 / 3, 0.5, 5), clutter: N(l.clutter, 0, 0, 100), terrain: ['average', 'smooth', 'mountain'].includes(l.terrain) ? l.terrain : 'average', towerWidth: N(l.towerWidth, 0, 0, 50), towerSolidity: N(l.towerSolidity, 0.3, 0.01, 1), antennaArea: N(l.antennaArea, 0.5, 0, 100), wind: N(l.wind, 40, 0, 120), towerWeight: N(l.towerWeight, 0, 0, 1e6), footing: N(l.footing, 0, 0, 100),
    towerLegs: l.towerLegs === 3 || l.towerLegs === '3' ? 3 : 4, legCapacity: N(l.legCapacity, 0, 0, 1e7), loadFactor: N(l.loadFactor, 1, 0.1, 5), legE: N(l.legE, 200, 1, 1000), legI: N(l.legI, 0, 0, 1e7), legLength: N(l.legLength, 0, 0, 100), legK: N(l.legK, 1, 0.3, 3) } : null; }, 100);   // 0.8 EG.28 (civil_PART_4): the leg check's inputs
  g.covers = arr(obj.covers, (c) => { const a = pt(c?.tx); return a ? { id: id(c.id, 'cg'), name: S(c.name), tx: { ...a, h: N(c.tx.h, 30, 0, 500) }, f: N(c.f, 2, 0.1, 100), pt: N(c.pt, 30, -50, 80), gt: N(c.gt, 10, -20, 80), gr: N(c.gr, 0, -20, 80), sensitivity: N(c.sensitivity, -90, -140, 0),
    rxH: N(c.rxH, 2, 0, 200), range: N(c.range, 3000, 10, 200000), step: N(c.step, 100, 1, 5000), k: N(c.k, 4 / 3, 0.5, 5), clutter: N(c.clutter, 0, 0, 100), show: c.show === 'no' ? 'no' : 'yes' } : null; }, 30);   // 0.8 EG.28 (civil_PART_4): coverage sketches
  g.pits = arr(obj.pits, (p) => !p ? null : { id: id(p.id, 'pt'), name: S(p.name), nx: N(p.nx, 10, 1, 120), ny: N(p.ny, 10, 1, 120), nz: N(p.nz, 6, 1, 60), size: [N(p.size?.[0], 10, 0.1, 1e3), N(p.size?.[1], 10, 0.1, 1e3), N(p.size?.[2], 10, 0.1, 1e3)], origin: [N(p.origin?.[0], 0), N(p.origin?.[1], 0), N(p.origin?.[2], 0)],
    density: N(p.density, 2.7, 0.5, 10), price: N(p.price, 0, 0, 1e9), recovery: N(p.recovery, 0.9, 0, 1), processCost: N(p.processCost, 0, 0, 1e9), miningCost: N(p.miningCost, 0, 0, 1e9), slope: N(p.slope, 45, 10, 85),
    phases: N(p.phases, 0, 0, 12), oreCapacity: N(p.oreCapacity, 0, 0, 1e12), moveCapacity: N(p.moveCapacity, 0, 0, 1e12), discount: N(p.discount, 0.1, 0, 1), rampGrade: N(p.rampGrade, 0.1, 0.01, 0.3),
    rampWidth: N(p.rampWidth, 0, 0, 200), rampOn: p.rampOn === 'yes' ? 'yes' : 'no', cut: p.cut === 'yes' ? 'yes' : 'no', show3d: p.show3d === 'no' ? 'no' : 'yes',   // 0.8 EG.27 (civil_PART_4): the ramp's width (0 = none) and whether it flattens the pit wall, the pit cut into the ground, drawn in 3D
    samples: arr(p.samples, (q) => (fin(q?.x) && fin(q?.y) && fin(q?.z) && fin(q?.grade) ? { x: N(q.x, 0), y: N(q.y, 0), z: N(q.z, 0), grade: N(q.grade, 0, 0, 1e6) } : null), 5000) }, 50);
  g.nets = arr(obj.nets, (n) => !n || typeof n.points !== 'object' ? null : { id: id(n.id, 'nw'), name: S(n.name), free: n.free === 'yes' ? 'yes' : 'no',
    points: Object.fromEntries(Object.entries(n.points).slice(0, 400).filter(([, p]) => fin(p?.x) && fin(p?.y)).map(([k, p]) => [S(k, 30), { x: N(p.x, 0), y: N(p.y, 0), ...(p.fixed ? { fixed: true } : {}), ...(fin(p.sx) ? { sx: N(p.sx, 0, 0, 1e3) } : {}), ...(fin(p.sy) ? { sy: N(p.sy, 0, 0, 1e3) } : {}) }])),
    obs: arr(n.obs, (o) => (o && ['dist', 'dir', 'angle', 'az', 'vec'].includes(o.type) ? Object.fromEntries(Object.entries(o).filter(([k, v]) => ['type', 'from', 'to', 'at', 'back', 'fore', 'set'].includes(k) ? typeof v === 'string' || typeof v === 'number' : ['value', 'sd', 'dx', 'dy', 'sdx', 'sdy'].includes(k) && fin(v)).map(([k, v]) => [k, typeof v === 'string' ? S(v, 30) : v])) : null), 4000) }, 20);
  g.turnouts = arr(obj.turnouts, (t) => !t ? null : { id: id(t.id, 'tu'), name: S(t.name), n: N(t.n, 8, 3, 30), gauge: N(t.gauge, 1.435, 0.5, 3), side: t.side === 'R' ? 'R' : 'L', switchLength: N(t.switchLength, 6.1, 1, 50), switchAngle: N(t.switchAngle, 0.0143, 0.001, 0.2), alignment: S(t.alignment, 20), station: N(t.station, 0), spacing: N(t.spacing, 0, 0, 100), show: t.show === 'no' ? 'no' : 'yes' }, 200);
  g.clearances = arr(obj.clearances, (c) => { const outline = arr(c?.outline, (p) => (fin(p?.o) && fin(p?.z) ? { o: N(p.o, 0, -50, 50), z: N(p.z, 0, -5, 50) } : null), 60); return outline.length >= 3 ? { id: id(c.id, 'cl'), name: S(c.name), outline, radius: N(c.radius, 0, 0, 1e7), cant: N(c.cant, 0, 0, 400), base: N(c.base, 1500, 500, 3000), length: N(c.length, 20, 0, 100), bogie: N(c.bogie, 14, 0, 100), curve: c.curve === 'L' ? 'L' : 'R' } : null; }, 100);
  g.traverses = arr(obj.traverses, (t) => { const a = pt(t?.start); if (!a) return null; const legs = arr(t.legs, (l) => (fin(l?.dist) && fin(l?.az) ? { dist: N(l.dist, 0, 0, 1e7), az: N(l.az, 0, -720, 720) } : null), 2000), e = pt(t.end);
    return legs.length ? { id: id(t.id, 'tv'), name: S(t.name), start: a, ...(e ? { end: e } : {}), legs } : null; }, 100);
  const out = {}; for (const k of Object.keys(g)) if (has(k)) out[k] = g[k];
  return Object.keys(out).length ? out : null;
}
export const geoCount = (g) => Object.values(g || {}).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);
