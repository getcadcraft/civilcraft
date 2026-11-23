// SPDX-License-Identifier: Apache-2.0
/**
 * lib/steelstair/steelstair.js: the steel stair generator (0.10 SU.1814c, session detail-10). Host-free: no DOM, no imports. Millimetres, kilograms, z up.
 * lib/steelstair/ is canonical; each host carries a byte-identical copy in <app>/dev/steelstair/ (node tools/steelstair/sync.mjs [--check] <host>).
 * Hosts: DetailCraft (stair.js, build.js: the stair becomes parts, marks, shop drawings, NC, IFC like any other); BimCraft's mount (one stair element
 * from `bimElement`) is an Inbox line to `bim-core-10`.
 *
 * Starting values, not design. Nothing here checks a stringer, a tread or a rail for strength; the rule sets below limit the SHAPE of the stair (rise,
 * going, pitch, landing, rail height, opening) and are only as good as what the person chose. The numbers of each rule set say where they came from and
 * how well that was checked (`checked`: 'primary' = read in the regulation's own text, 'secondary' = read in a report or guide that quotes it,
 * 'unverified' = remembered, not read: shown to the person as such). A rule set with no value for something says so (null) and the setting beside it decides.
 *
 *   RULES                          the rule sets by id; `rule(id)` → one (unknown id → the default)
 *   defaults(ruleId)               a stair record with the usual choices for that rule set
 *   clean(rec)                     → a checked record or null (untrusted: a saved model)
 *   solve(rec)                     → { n, flights: [{ risers, treads }], riser, going, run, pitch, blondel, landingDepth, problems }
 *   build(rec, { profileOf })      → { ...solve, parts, welds, stats, problems }
 *       part = { key, type ('stringer'|'column'|'plate'), group, role, profileName, material, start, end, rotation, position, attachTo, holes, mass? }
 *       Linear steel (stringers, landing beams, rails, balusters) are type 'stringer', posts 'column', treads and covers 'plate' (the host's marks
 *       and IFC writer know those five types); `group` names the assembly a part belongs to ('flight1', 'landing1', 'rail1L' ...).
 *   cutList(layout, { profileOf }) → { rows: [{ item, group, role, section, length, qty, unitKg, totalKg, note }], totalKg, count }
 *   cutListCsv(list)               → CSV text
 *   treadDetail(layout)            → what the tread's shop sheet draws: { type, depth, width, t, nosing, fold, holes }
 *   bimElement(layout)             → { kind: 'stair', flights, landings, railings, steps } for a host's BIM element (IfcStair / IfcStairFlight / IfcRailing)
 *
 * THE RULES the tests hold to (lib/steelstair/test/steelstair.test.mjs, numbers worked by hand): the number of risers is the fewest whose 2 x riser + going
 * sits at the middle of the rule's range (the comfort range 600 to 650 when the rule has none) without the going falling under the rule's minimum, and
 * every riser, going and pitch inside the rule's ranges when any count can do that; every flight has uniform risers and treads; a flight of more than `maxFlightRise` gets
 * a landing; a landing is as deep as the stair is wide and not less than the rule's minimum; the baluster gap is the clear opening a sphere of the
 * rule's size would have to pass, so no more than that.
 */

const R = Math.PI / 180;
const DENSITY = 7850;   // kg/m3: the value DetailCraft's profile table uses for plates (profiles.js STEEL_DENSITY)
const INCH = 25.4;
const r1 = (v) => Math.round(v * 10) / 10;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const num = (v, lo, hi, d) => { const n = Number(v ?? d); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };

/** Rule sets. Every number is mm (inches converted exactly: 1 in = 25.4 mm) unless it says degrees. */
export const RULES = Object.freeze({
  'us-ibc-2021': Object.freeze({
    id: 'us-ibc-2021', region: 'US', name: 'International Building Code 2021 (buildings)',
    riser: { min: 4 * INCH, max: 7 * INCH }, going: { min: 11 * INCH, max: null }, blondel: null, pitch: null, minWidth: null,
    maxFlightRise: 144 * INCH, landing: { min: 0, asWide: true },
    handrail: { min: 34 * INCH, max: 38 * INCH }, topRailAsHandrail: null, guard: 42 * INCH, opening: 4 * INCH,
    cite: [
      { ref: 'IBC 2021 section 1011.5.2', says: 'riser 4 in minimum, 7 in maximum; tread depth 11 in minimum', checked: 'secondary', note: 'also quoted in the DetailCraft help since 0.4 (stair.js D23)' },
      { ref: 'IBC 2021 section 1011.8', says: 'vertical rise of a flight 12 ft maximum between floor levels or landings', checked: 'unverified', note: 'not read in the code text: the ICC page was not reachable (403); confirm before relying on it' },
      { ref: 'IBC 2021 section 1014.2', says: 'handrail height 34 in minimum, 38 in maximum, above the nosings', checked: 'secondary', note: 'agreed by several building-department handouts; not read in the code text' },
      { ref: 'IBC 2021 sections 1015.3 and 1015.4', says: 'guard 42 in; no opening a 4 in sphere passes', checked: 'secondary', note: 'stair-side openings have their own larger limits there; this generator uses the 4 in everywhere' },
    ],
  }),
  'us-osha-1910': Object.freeze({
    id: 'us-osha-1910', region: 'US', name: 'OSHA 29 CFR 1910.25 and 1910.29 (industrial stairs, standard stairs)',
    riser: { min: null, max: 9.5 * INCH }, going: { min: 9.5 * INCH, max: null }, blondel: null, pitch: { min: 30, max: 50 }, minWidth: 22 * INCH,
    maxFlightRise: null, landing: { min: 30 * INCH, asWide: true },
    handrail: { min: 30 * INCH, max: 38 * INCH }, topRailAsHandrail: { min: 36 * INCH, max: 38 * INCH }, guard: 42 * INCH, opening: 19 * INCH,
    cite: [
      { ref: '29 CFR 1910.25(c)(1) to (c)(4)', says: 'standard stairs at 30 to 50 degrees; riser 9.5 in maximum; tread 9.5 in minimum; 22 in minimum between vertical barriers', checked: 'primary', note: 'read at osha.gov 2026-11-14' },
      { ref: '29 CFR 1910.25(b)(3) and (b)(4)', says: 'uniform risers and treads between landings; landing as wide as the stair and 30 in deep or more in the direction of travel', checked: 'primary', note: 'same page' },
      { ref: '29 CFR 1910.29(f)(1) and (f)(4)', says: 'handrail 30 to 38 in; stair rail 42 in (installed since 17 Jan 2017), or a top rail used as handrail 36 to 38 in; no opening over 19 in', checked: 'primary', note: 'read at osha.gov 2026-11-14' },
    ],
  }),
  'uk-adk-2013-general': Object.freeze({
    id: 'uk-adk-2013-general', region: 'UK', name: 'Approved Document K (England, 2013 edition), general access stairs',
    riser: { min: 150, max: 170 }, going: { min: 250, max: 400 }, blondel: { min: 550, max: 700 }, pitch: null, minWidth: null,
    maxFlightRise: null, landing: { min: 0, asWide: true },
    handrail: null, topRailAsHandrail: null, guard: null, opening: 100,
    cite: [
      { ref: 'Approved Document K (2013) Table 1.1, general access stair', says: 'rise 150 to 170 mm, going 250 to 400 mm, 2R + G 550 to 700 mm', checked: 'secondary', note: 'read in Table 1 of the Rise and Going Consultancy report for MHCLG, "Approved Document K - general access and utility stairs" (gov.uk, 2026), which tabulates the 2013 values; the Approved Document itself was not reachable' },
      { ref: 'Approved Document K (2013) the 100 mm opening', says: 'openings in guarding no larger than 100 mm', checked: 'unverified', note: 'remembered, not read; confirm' },
    ],
  }),
  'uk-adk-2013-utility': Object.freeze({
    id: 'uk-adk-2013-utility', region: 'UK', name: 'Approved Document K (England, 2013 edition), utility stairs',
    riser: { min: 150, max: 190 }, going: { min: 250, max: 400 }, blondel: { min: 550, max: 700 }, pitch: null, minWidth: null,
    maxFlightRise: null, landing: { min: 0, asWide: true },
    handrail: null, topRailAsHandrail: null, guard: null, opening: 100,
    cite: [
      { ref: 'Approved Document K (2013) Table 1.1, utility stair', says: 'rise 150 to 190 mm, going 250 to 400 mm, 2R + G 550 to 700 mm', checked: 'secondary', note: 'same report, same table as the general access row' },
      { ref: 'Approved Document K (2013) the 100 mm opening', says: 'openings in guarding no larger than 100 mm', checked: 'unverified', note: 'remembered, not read; confirm' },
    ],
  }),
});
export const DEFAULT_RULE = 'us-ibc-2021';
export const rule = (id) => RULES[id] || RULES[DEFAULT_RULE];
/** The comfort rule the existing DetailCraft stair check has used since 0.4 (stair.js: 2 x riser + going 600 to 650 mm, Blondel); used to pick a going when the rule set has no 2R + G range. */
export const COMFORT = Object.freeze({ min: 600, max: 650 });
export const TREAD_TYPES = Object.freeze(['chequer', 'grating', 'folded']);

export function defaults(ruleId = DEFAULT_RULE) {
  const ru = rule(ruleId);
  const hr = ru.topRailAsHandrail ? (ru.topRailAsHandrail.min + ru.topRailAsHandrail.max) / 2 : ru.handrail ? (ru.handrail.min + ru.handrail.max) / 2 : 900;
  return {
    gen: 1, rule: ru.id, dir: 0, rise: 3000, run: 0, width: 1000, treadType: 'folded', stringer: 'C10x15.3', material: 'A36',
    tread: { t: 4, nosing: 25, fold: 40, bolt: 12, barDepth: 25, barT: 5, barPitch: 30 },
    fix: 'auto', endCuts: 'floor', postBase: true, baseT: 12, anchor: 16, landings: -1, landingDepth: 0, landingPosts: true, postSection: 'HSS4x4x1/4', crossSection: 'L3x3x1/4',
    rails: 'both', railTop: Math.round(hr), railSection: 'Pipe1-1/2STD', postSection2: 'PL25x25', postSpacing: 1200, infill: 'balusters', balusterBar: 'PL16x16', balusterGap: ru.opening ? Math.min(ru.opening, 100) : 100,
  };
}

/** A stored or pasted stair: every field checked, missing ones from the defaults; null when a number is out of range. */
export function clean(rec) {
  if (!rec || typeof rec !== 'object') return null;
  const d = defaults(typeof rec.rule === 'string' && RULES[rec.rule] ? rec.rule : DEFAULT_RULE), tr = rec.tread || {}, dt = d.tread;
  const str = (v, dv, n = 40) => String(v ?? dv).replace(/[\u0000-\u001f]/g, '').trim().slice(0, n) || dv;
  const out = {
    gen: 1, rule: d.rule, x: num(rec.x, -1e7, 1e7, 0), y: num(rec.y, -1e7, 1e7, 0), z: num(rec.z, -1e7, 1e7, 0),
    dir: num(rec.dir, -3600, 3600, d.dir), rise: num(rec.rise, 600, 12000, d.rise), run: num(rec.run, 0, 40000, d.run), width: num(rec.width, 400, 5000, d.width),
    treadType: TREAD_TYPES.includes(rec.treadType) ? rec.treadType : d.treadType, stringer: str(rec.stringer, d.stringer), material: str(rec.material, d.material, 30),
    tread: { t: num(tr.t, 2, 25, dt.t), nosing: num(tr.nosing, 0, 100, dt.nosing), fold: num(tr.fold, 20, 100, dt.fold), bolt: num(tr.bolt, 6, 24, dt.bolt), barDepth: num(tr.barDepth, 15, 80, dt.barDepth), barT: num(tr.barT, 2, 12, dt.barT), barPitch: num(tr.barPitch, 15, 80, dt.barPitch) },
    fix: ['auto', 'weld', 'bolt'].includes(rec.fix) ? rec.fix : d.fix, landings: num(rec.landings, -1, 4, d.landings), landingDepth: num(rec.landingDepth, 0, 5000, d.landingDepth),
    // 0.11 SU.1814c: a stair stored before the end cuts and base plates existed has neither (its geometry stays as it was); a new one carries both fields
    endCuts: rec.endCuts === 'floor' ? 'floor' : 'square', postBase: rec.postBase === undefined ? false : !!rec.postBase, baseT: num(rec.baseT, 6, 40, d.baseT), anchor: num(rec.anchor, 8, 36, d.anchor),
    landingPosts: rec.landingPosts === undefined ? d.landingPosts : !!rec.landingPosts, postSection: str(rec.postSection, d.postSection), crossSection: str(rec.crossSection, d.crossSection),
    rails: ['both', 'left', 'right', 'none'].includes(rec.rails) ? rec.rails : d.rails, railTop: num(rec.railTop, 500, 1500, rec.rule && RULES[rec.rule] ? defaults(rec.rule).railTop : d.railTop), railSection: str(rec.railSection, d.railSection),
    postSection2: str(rec.postSection2, d.postSection2), postSpacing: num(rec.postSpacing, 400, 3000, d.postSpacing), infill: ['balusters', 'none'].includes(rec.infill) ? rec.infill : d.infill,
    balusterBar: str(rec.balusterBar, d.balusterBar), balusterGap: num(rec.balusterGap, 20, 600, d.balusterGap),
  };
  if (Object.values(out).some((v) => v === null) || Object.values(out.tread).some((v) => v === null)) return null;
  out.dir = ((out.dir % 360) + 360) % 360;
  return out;
}

/** Riser and going for a floor-to-floor height and a rule set: the number of risers, split into flights, and the going. Pure arithmetic; see THE RULES. */
export function solve(rec0) {
  const rec = clean(rec0) || defaults();
  const ru = rule(rec.rule), H = rec.rise, W = rec.width, problems = [];
  const F = Math.max(ru.maxFlightRise ? Math.ceil(H / ru.maxFlightRise - 1e-9) : 1, rec.landings >= 0 ? rec.landings + 1 : 1);
  const landD = Math.max(W, ru.landing.min || 0, rec.landingDepth || 0);
  const rmin = ru.riser.min ?? 100, rmax = ru.riser.max ?? 300;
  const gmin = ru.going.min ?? 150, gmax = ru.going.max ?? 600;
  const between = (v, rg) => !rg || ((rg.min == null || v >= rg.min - 1e-6) && (rg.max == null || v <= rg.max + 1e-6));
  const miss = (v, rg) => (!rg ? 0 : v < (rg.min ?? -Infinity) ? rg.min - v : v > (rg.max ?? Infinity) ? v - rg.max : 0);
  let best = null;
  const lo = Math.max(2 * F, Math.ceil(H / rmax - 1e-9)), hi = Math.max(lo, Math.floor(H / rmin + 1e-9));
  for (let n = lo; n <= hi + 2; n++) {
    const riser = H / n, treads = n - F;
    if (treads < 1) continue;
    const blLo = ru.blondel ? ru.blondel.min : COMFORT.min, blHi = ru.blondel ? ru.blondel.max : COMFORT.max;
    let going;
    if (rec.run > 0) going = (rec.run - (F - 1) * landD) / treads;
    else going = clamp((blLo + blHi) / 2 - 2 * riser, gmin, gmax);
    const pitch = Math.atan2(riser, going) / R, bl = 2 * riser + going;
    const pen = miss(riser, { min: ru.riser.min, max: ru.riser.max }) * 10 + miss(going, { min: ru.going.min, max: ru.going.max }) * 10 + miss(bl, ru.blondel || COMFORT) * (ru.blondel ? 10 : 1) + miss(pitch, ru.pitch) * 20 + Math.abs(bl - (blLo + blHi) / 2) * 0.01;
    if (!best || pen < best.pen - 1e-9) best = { n, riser, going, pitch, bl, treads, pen };
  }
  const { n, riser, going, pitch } = best;
  // risers per flight as even as possible, the longer flights first
  const flights = [];
  for (let k = 0; k < F; k++) { const risers = Math.floor(n / F) + (k < n % F ? 1 : 0); flights.push({ risers, treads: risers - 1 }); }
  const run = (n - F) * going + (F - 1) * landD;
  const bl = 2 * riser + going;
  if (!between(riser, ru.riser)) problems.push({ code: 'riser', fills: { v: r1(riser), min: ru.riser.min == null ? null : r1(ru.riser.min), max: ru.riser.max == null ? null : r1(ru.riser.max) } });
  if (!between(going, ru.going)) problems.push({ code: 'going', fills: { v: r1(going), min: ru.going.min == null ? null : r1(ru.going.min), max: ru.going.max == null ? null : r1(ru.going.max) } });
  if (ru.blondel && !between(bl, ru.blondel)) problems.push({ code: 'blondel', fills: { v: r1(bl), min: ru.blondel.min, max: ru.blondel.max } });
  if (!ru.blondel && !between(bl, COMFORT)) problems.push({ code: 'comfort', fills: { v: r1(bl), min: COMFORT.min, max: COMFORT.max } });
  if (ru.pitch && !between(pitch, ru.pitch)) problems.push({ code: 'pitch', fills: { v: r1(pitch), min: ru.pitch.min, max: ru.pitch.max } });
  if (ru.minWidth && W < ru.minWidth - 1e-6) problems.push({ code: 'width', fills: { v: W, min: r1(ru.minWidth) } });
  if (ru.maxFlightRise && flights.some((f) => f.risers * riser > ru.maxFlightRise + 1e-6)) problems.push({ code: 'flight', fills: { max: r1(ru.maxFlightRise) } });
  if (rec.run > 0 && going <= 0) problems.push({ code: 'run', fills: { run: rec.run } });
  return { n, flights, riser, going, run, pitch, blondel: bl, landingDepth: landD, rule: ru.id, problems };
}

/** A part's mass in kg from its section's mass per metre and its length, as the host's weight table does. */
const massOf = (profileOf, name, length) => { const p = profileOf?.(name); return p && Number.isFinite(p.mass) ? (p.mass * length) / 1000 : 0; };

/** The stair as parts. `profileOf(name)` → { kind, mass (kg/m), width, depth, t, b ... } or null (the host's section table). */
export function build(rec0, { profileOf = () => null } = {}) {
  const rec = clean(rec0) || defaults();
  const so = solve(rec), ru = rule(rec.rule);
  const { riser: r, going: g } = so, tr = rec.tread;
  const problems = so.problems.map((p) => ({ ...p }));
  const c = Math.cos((rec.dir || 0) * R), sn = Math.sin((rec.dir || 0) * R);
  const x0 = rec.x || 0, y0 = rec.y || 0, z0 = rec.z || 0;
  const P = (along, across, up) => [x0 + c * along - sn * across, y0 + sn * along + c * across, z0 + up];
  const sp = profileOf(rec.stringer);
  if (!sp) problems.push({ code: 'stringer', fills: { name: rec.stringer } });
  const isPL = sp?.kind === 'PL';
  const sw = sp ? (isPL ? sp.t : sp.width) : 100, sd = sp ? (isPL ? sp.b : sp.depth) : 250;
  const k = r / g, ang = Math.atan(k), cosA = Math.cos(ang), sinA = Math.sin(ang);
  const drop = (sd / 2 - 50) / cosA;   // the stringer's axis lies this far below the nosing line, so its top edge is 50 mm above the nosings
  if (sd / 2 - 50 < tr.t + 10) problems.push({ code: 'shallow', fills: { name: rec.stringer } });
  const half = rec.width / 2 + sw / 2;
  const fixBolt = rec.fix === 'bolt' || (rec.fix === 'auto' && rec.treadType !== 'chequer');
  const depth = g + tr.nosing;
  // a grating tread is drawn as the solid plate of equal weight: bar depth x bar thickness over the pitch (the cross bars and the banding are not counted)
  const tEff = rec.treadType === 'grating' ? Math.round((tr.barDepth * tr.barT / tr.barPitch) * 100) / 100 : tr.t;
  const parts = [], welds = [], steps = [];
  const add = (p) => { parts.push({ position: 'middle', rotation: 0, attachTo: null, holes: [], ...p }); return p.key; };
  const roleOf = { stringerL: 'Stringer, left', stringerR: 'Stringer, right', tread: rec.treadType === 'grating' ? 'Grating tread' : rec.treadType === 'folded' ? 'Folded tread' : 'Chequer tread', nosing: 'Tread nosing return' };

  let s = 0, z = 0;   // along the climb and up, where the current flight starts
  const flights = [], landings = [];
  so.flights.forEach((fl, fi) => {
    const fk = 'f' + (fi + 1), asm = 'flight' + (fi + 1), nk = fl.risers;
    const axisZ = (a) => z + k * (a - s + g) - drop;
    const a0 = s + drop / k - g, a1 = s + (nk * r + drop) / k - g;
    const mainKey = fk + 'stringerL';
    for (const [sk, sign, role] of [['stringerL', 1, roleOf.stringerL], ['stringerR', -1, roleOf.stringerR]]) {
      // end cuts (0.11 SU.1814c): the lower end level on the floor (the cut face is horizontal, at the floor's top), the upper end plumb against the floor's edge (the cut face is vertical,
      // square to the climb, where the upper floor ends). `planes` = outward normal and a point on each face, world coordinates; build.js turns them into the part's cut ends. The holes stay
      // measured from the nominal start (the axis meets the floor), build.js moves them to the cut start.
      // the cut part's length (worked in the plane of the stair, slope angle A with tan A = riser / going, section depth sd): the level cut's face meets the section's two edges sd/2 / tan A either side of the axis point on the floor,
      // so the part starts (sd/2) / tan A before it; the plumb cut at along = s + (nk - 1) g meets them (sd/2) tan A either side along the axis, so it ends (sd/2) tan A after the axis point there: length = (that along distance) / cos A + (sd/2) tan A + (sd/2) / tan A
      const cutLength = ((s + (nk - 1) * g) - a0) / cosA + (sd / 2) * k + (sd / 2) / k;
      const planes = rec.endCuts === 'floor' ? { start: { n: [0, 0, -1], p: P(a0, sign * half, z) }, end: { n: [c, sn, 0], p: P(s + (nk - 1) * g, sign * half, z + nk * r) } } : null;
      add({ key: fk + sk, type: 'stringer', group: asm, role, profileName: rec.stringer, material: rec.material, start: P(a0, sign * half, axisZ(a0)), end: P(a1, sign * half, axisZ(a1)),
        rotation: sp && sp.kind === 'C' ? (sign > 0 ? 180 : 0) : isPL ? 90 : 0, attachTo: sk === 'stringerL' ? null : mainKey, holes: [], planes, _L: planes ? cutLength : Math.hypot(a1 - a0, axisZ(a1) - axisZ(a0)) });
    }
    const L = parts.find((p) => p.key === mainKey), Rr = parts.find((p) => p.key === fk + 'stringerR');
    const treadKeys = [];
    for (let j = 1; j <= fl.treads; j++) {
      const top = z + j * r, front = s + (j - 1) * g - tr.nosing, back = s + j * g, mid = front + depth / 2;
      steps.push({ flight: fi + 1, n: j, front, back, top });
      const key = fk + 'tread' + j; treadKeys.push(key);
      add({ key, type: 'plate', group: asm, role: roleOf.tread, profileName: 'PL' + tEff + 'x' + r1(depth), material: rec.material, start: P(mid, rec.width / 2, top - tEff / 2), end: P(mid, -rec.width / 2, top - tEff / 2), attachTo: mainKey });
      if (rec.treadType === 'folded') add({ key: key + 'n', type: 'plate', group: asm, role: roleOf.nosing, profileName: 'PL' + tEff + 'x' + tr.fold, material: rec.material,
        start: P(front + tEff / 2, rec.width / 2, top - tEff - tr.fold / 2), end: P(front + tEff / 2, -rec.width / 2, top - tEff - tr.fold / 2), rotation: 90, attachTo: key });
      for (const sg of [fk + 'stringerL', fk + 'stringerR']) welds.push({ between: [sg, key], size: Math.min(6, tr.t), length: fixBolt ? 0 : 2 * depth, where: 'treads to stringers', bolted: fixBolt });
      // bolted treads: two holes through each stringer web at the tread's end flange (a folded pan's returned end, a chequer or grating tread's clip), 0.3 and 0.7 of the depth
      if (fixBolt) for (const f of [0.3, 0.7]) {
        const af = front + f * depth, zf = top - tEff - tr.fold / 2;
        for (const [stp, sign] of [[L, 1], [Rr, -1]]) {
          const dx = af - a0, dz = zf - axisZ(a0);
          const xloc = dx * cosA + dz * sinA, v = -dx * sinA + dz * cosA;
          const y = stp.rotation === 180 ? -v : v;
          if (Math.abs(y) > sd / 2 - 15) problems.push({ code: 'hole-edge', fills: { part: stp.key, tread: j } });
          stp.holes.push({ face: 'web', x: r1(xloc), y: r1(y), d: tr.bolt + 2, tread: j });
        }
      }
    }
    flights.push({ n: fi + 1, risers: nk, treads: fl.treads, start: { along: s, up: z }, end: { along: s + (nk - 1) * g, up: z + nk * r }, stringer: mainKey, group: asm });
    s += (nk - 1) * g; z += nk * r;
    if (fi < so.flights.length - 1) {
      // an intermediate landing: a frame of two side beams and two cross angles under a cover, on posts at the far corners
      const lk = 'l' + (fi + 1), lasm = 'landing' + (fi + 1), D = so.landingDepth, top = z, beamZ = top - tEff - sd / 2, w2 = rec.width / 2 + sw / 2;
      const lm = lk + 'beamL';
      for (const [bk, sign, role] of [['beamL', 1, 'Landing beam, left'], ['beamR', -1, 'Landing beam, right']])
        add({ key: lk + bk, type: 'stringer', group: lasm, role, profileName: rec.stringer, material: rec.material, start: P(s, sign * w2, beamZ), end: P(s + D, sign * w2, beamZ), rotation: sp && sp.kind === 'C' ? (sign > 0 ? 180 : 0) : isPL ? 90 : 0, attachTo: bk === 'beamL' ? null : lm });
      const cs = profileOf(rec.crossSection), ch = cs ? (cs.depth || 76) : 76;
      for (const [ck, along, role] of [['crossA', s + ch / 2, 'Landing cross angle, near'], ['crossB', s + D - ch / 2, 'Landing cross angle, far']])
        add({ key: lk + ck, type: 'stringer', group: lasm, role, profileName: rec.crossSection, material: rec.material, start: P(along, rec.width / 2, top - tEff - ch / 2), end: P(along, -rec.width / 2, top - tEff - ch / 2), attachTo: lm });
      add({ key: lk + 'cover', type: 'plate', group: lasm, role: rec.treadType === 'grating' ? 'Grating landing panel' : 'Landing plate', profileName: 'PL' + tEff + 'x' + r1(D), material: rec.material,
        start: P(s + D / 2, rec.width / 2, top - tEff / 2), end: P(s + D / 2, -rec.width / 2, top - tEff / 2), attachTo: lm });
      if (rec.landingPosts) {
        const ps = profileOf(rec.postSection), pw = ps ? (ps.width || 100) : 100;
        for (const [pk, sign] of [['postL', 1], ['postR', -1]]) {
          const px = s + D - pw / 2 - 5, top2 = beamZ - sd / 2;
          const bt = rec.postBase ? rec.baseT : 0;
          if (top2 > bt + 100) {
            add({ key: lk + pk, type: 'column', group: lasm, role: 'Landing post', profileName: rec.postSection, material: rec.material, start: P(px, sign * w2, bt), end: P(px, sign * w2, top2), attachTo: lm });
            if (rec.postBase) {
              // a square base plate under the post: the post's width plus 50 mm each side, to the next 10 mm; four anchor holes 30 mm in from the edges. A starting detail: the anchors, the plate's thickness
              // and the floor are not checked (say so in the help); the numbers are defaults the person can change, not values read from a standard
              const B = Math.ceil((pw + 100) / 10) * 10, e = 30, hd = rec.anchor + 2, key = lk + pk + 'base';
              add({ key, type: 'plate', group: lasm, role: 'Post base plate', profileName: 'PL' + bt + 'x' + B, material: rec.material, start: P(px, sign * w2 + B / 2, bt / 2), end: P(px, sign * w2 - B / 2, bt / 2), attachTo: lk + pk,
                holes: [[e, e], [e, B - e], [B - e, e], [B - e, B - e]].map(([x, y]) => ({ face: 'plate', x, y: y - B / 2, d: hd })) });
              welds.push({ between: [lk + pk, key], size: Math.min(6, bt), length: 4 * pw, where: 'post to base plate', bolted: false });
            }
          }
        }
      }
      landings.push({ n: fi + 1, along: [s, s + D], up: top, depth: D, width: rec.width, group: lasm });
      s += D;
    }
  });
  const topAlong = s;

  // rails: a pipe top rail on posts, with balusters, along each flight and round each landing; the rail's height is above the nosing line (vertical), the rule's
  const rails = [];
  const sides = rec.rails === 'both' ? [['L', 1], ['R', -1]] : rec.rails === 'left' ? [['L', 1]] : rec.rails === 'right' ? [['R', -1]] : [];
  const rp = profileOf(rec.railSection), rod = rp ? (rp.width || 48.3) : 48.3;
  if (sides.length) {
    if (!rp) problems.push({ code: 'rail-section', fills: { name: rec.railSection } });
    const bp = profileOf(rec.balusterBar), bw = bp ? (bp.width || 16) : 16;
    const pp = profileOf(rec.postSection2), ppw = pp ? (pp.width || 25) : 25;
    const hr = ru.topRailAsHandrail || ru.handrail;
    if (hr && (rec.railTop < hr.min - 1e-6 || rec.railTop > hr.max + 1e-6)) problems.push({ code: 'rail-height', fills: { v: rec.railTop, min: r1(hr.min), max: r1(hr.max) } });
    if (!hr) problems.push({ code: 'rail-unruled', fills: { v: rec.railTop } });
    const across = rec.width / 2 + sw + 0;   // the rail stands on the outer face of the stringer: outside the clear width plus the stringer's own
    flights.forEach((fl) => {
      for (const [side, sign] of sides) {
        const rk = 'r' + fl.n + side, asm = 'rail' + fl.n + side;
        const a0 = fl.start.along, z0f = fl.start.up;
        // the nosing line: z = z0f + k * (a - a0 + g); the rail runs along it, railTop above, from the first tread's nosing to the top
        const aStart = a0, aEnd = fl.end.along;
        const lineZ = (a) => z0f + k * (a - a0 + g) + rec.railTop - rod / 2;
        const edgeZ = (a) => z0f + k * (a - a0 + g) + 50 / cosA;   // the stringer's top edge stands 50 mm above the nosing line, measured square to the slope
        const nPost = Math.max(2, Math.ceil(((aEnd - aStart) / cosA) / rec.postSpacing) + 1);
        const rail = add({ key: rk + 'rail', type: 'stringer', group: asm, role: 'Top rail', profileName: rec.railSection, material: rec.material, start: P(aStart, sign * across, lineZ(aStart)), end: P(aEnd, sign * across, lineZ(aEnd)) });
        const posts = [];
        for (let i = 0; i < nPost; i++) {
          const a = aStart + (aEnd - aStart) * (i / (nPost - 1)), top = lineZ(a) - rod / 2, bottom = edgeZ(a);
          posts.push(add({ key: rk + 'post' + (i + 1), type: 'column', group: asm, role: 'Rail post', profileName: rec.postSection2, material: rec.material, start: P(a, sign * across, bottom), end: P(a, sign * across, top), attachTo: rail }));
        }
        let nBal = 0;
        if (rec.infill === 'balusters') {
          // balusters between the posts: vertical bars, clear gap (centre spacing minus the bar) at most `balusterGap`, from the stringer's top edge to under the rail
          const total = aEnd - aStart, perAlong = rec.balusterGap + bw;   // the gap is measured in plan, between the bars (a vertical sphere meets them there)
          const nb = Math.max(0, Math.ceil(total / perAlong) - 1);
          for (let i = 1; i <= nb; i++) {
            const a = aStart + (total * i) / (nb + 1);
            const bottom = edgeZ(a), top = lineZ(a) - rod / 2;
            add({ key: rk + 'bal' + i, type: 'stringer', group: asm, role: 'Baluster', profileName: rec.balusterBar, material: rec.material, start: P(a, sign * across, bottom), end: P(a, sign * across, top), rotation: 0, attachTo: rail }); nBal++;
          }
          if (ru.opening && total / (nb + 1) - bw > ru.opening + 1e-6) problems.push({ code: 'opening', fills: { v: r1(total / (nb + 1) - bw), max: r1(ru.opening) } });
        }
        rails.push({ key: rk, side, flight: fl.n, posts: posts.length, balusters: nBal, group: asm });
      }
    });
    // the rail along each landing: a pipe on the landing's outer edge at the same height above the landing plate, with posts at the ends and balusters
    landings.forEach((ld) => {
      for (const [side, sign] of sides) {
        const rk = 'rl' + ld.n + side, asm = 'rail-landing' + ld.n + side, a0 = ld.along[0], a1 = ld.along[1], zt = ld.up + rec.railTop - rod / 2;
        const rail = add({ key: rk + 'rail', type: 'stringer', group: asm, role: 'Landing rail', profileName: rec.railSection, material: rec.material, start: P(a0, sign * across, zt), end: P(a1, sign * across, zt) });
        const nPost = Math.max(2, Math.ceil((a1 - a0) / rec.postSpacing) + 1);
        for (let i = 0; i < nPost; i++) { const a = a0 + (a1 - a0) * (i / (nPost - 1)); add({ key: rk + 'post' + (i + 1), type: 'column', group: asm, role: 'Rail post', profileName: rec.postSection2, material: rec.material, start: P(a, sign * across, ld.up), end: P(a, sign * across, zt - rod / 2), attachTo: rail }); }
        if (rec.infill === 'balusters') {
          const nb = Math.max(0, Math.ceil((a1 - a0) / (rec.balusterGap + bw)) - 1);
          for (let i = 1; i <= nb; i++) { const a = a0 + ((a1 - a0) * i) / (nb + 1); add({ key: rk + 'bal' + i, type: 'stringer', group: asm, role: 'Baluster', profileName: rec.balusterBar, material: rec.material, start: P(a, sign * across, ld.up), end: P(a, sign * across, zt - rod / 2), attachTo: rail }); }
        }
      }
    });
  }
  // top and bottom landings of the flight are the host's floors: said once so the person knows the stringer ends are not detailed to them
  const stats = { risers: so.n, treadCount: so.n - so.flights.length, flights: so.flights.length, landings: landings.length, riser: r, going: g, run: so.run, pitch: so.pitch, height: rec.rise, width: rec.width, topAlong };
  for (const p of parts) {
    p.length = p._L ?? Math.hypot(p.end[0] - p.start[0], p.end[1] - p.start[1], p.end[2] - p.start[2]);
    delete p._L;
  }
  return { ...so, parts, welds, flights, landings, rails, steps, stats, problems, rec };
}

const lenOf = (p) => p.length ?? Math.hypot(p.end[0] - p.start[0], p.end[1] - p.start[1], p.end[2] - p.start[2]);

/** The cut list: one row per section and length, the quantity, the mass of one and of all. Grating's mass is the equivalent plate (noted). */
export function cutList(layout, { profileOf = () => null } = {}) {
  const rows = new Map();
  for (const p of layout.parts) {
    const length = Math.round(lenOf(p) * 10) / 10, key = p.profileName + '|' + length + '|' + p.group.replace(/\d+[LR]?$/, '') + '|' + p.role;
    if (!rows.has(key)) rows.set(key, { item: 0, group: p.group.replace(/\d+[LR]?$/, ''), role: p.role, section: p.profileName, length, qty: 0, unitKg: 0, totalKg: 0, note: '' });
    const row = rows.get(key);
    row.qty++;
    row.unitKg = Math.round(massOf(profileOf, p.profileName, length) * 100) / 100;
    if (/^Grating/.test(p.role)) row.note = 'equivalent solid plate of the bars (bearing bar depth x thickness / pitch); cross bars and banding not counted';
  }
  const out = [...rows.values()].sort((a, b) => a.group.localeCompare(b.group) || a.role.localeCompare(b.role) || b.length - a.length);
  out.forEach((r, i) => { r.item = i + 1; r.totalKg = Math.round(r.unitKg * r.qty * 100) / 100; });
  return { rows: out, totalKg: Math.round(out.reduce((a, r) => a + r.totalKg, 0) * 10) / 10, count: out.reduce((a, r) => a + r.qty, 0) };
}

const csvCell = (v) => { const s = String(v ?? ''); const safe = /^[=+\-@]/.test(s) ? "'" + s : s; return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe; };
export function cutListCsv(list) {
  const head = ['Item', 'Assembly', 'Part', 'Section', 'Length mm', 'Qty', 'Each kg', 'Total kg', 'Note'];
  return [head, ...list.rows.map((r) => [r.item, r.group, r.role, r.section, r.length, r.qty, r.unitKg, r.totalKg, r.note]), ['', '', '', '', '', '', 'Total', list.totalKg, '']].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
}

/** What a tread's shop sheet draws (the first tread stands for all: they are uniform), and where its fixing holes are across the end flange. */
export function treadDetail(layout) {
  const rec = layout.rec, tr = rec.tread;
  const bolted = rec.fix === 'bolt' || (rec.fix === 'auto' && rec.treadType !== 'chequer');
  const depth = layout.going + tr.nosing;
  return { type: rec.treadType, width: rec.width, depth: Math.round(depth * 10) / 10, t: rec.treadType === 'grating' ? Math.round((tr.barDepth * tr.barT / tr.barPitch) * 100) / 100 : tr.t, nosing: tr.nosing, fold: rec.treadType === 'folded' ? tr.fold : 0,
    bolted, holeD: tr.bolt + 2, holeAt: [0.3, 0.7].map((f) => Math.round((f * depth) * 10) / 10), bar: rec.treadType === 'grating' ? { depth: tr.barDepth, t: tr.barT, pitch: tr.barPitch } : null, count: layout.stats.treadCount };
}

/** One BIM element for a host: the flights, landings and railings with their placement, so a host can write IfcStair / IfcStairFlight / IfcRailing. */
export function bimElement(layout) {
  const rec = layout.rec, c = Math.cos(rec.dir * R), sn = Math.sin(rec.dir * R);
  const P = (along, across, up) => [(rec.x || 0) + c * along - sn * across, (rec.y || 0) + sn * along + c * across, (rec.z || 0) + up];
  return {
    kind: 'stair', material: rec.material, predefined: 'STRAIGHT_RUN_STAIR',
    origin: [rec.x || 0, rec.y || 0, rec.z || 0], dir: rec.dir, height: rec.rise, width: rec.width, riser: layout.riser, going: layout.going, rule: layout.rule,
    flights: layout.flights.map((f) => ({ n: f.n, risers: f.risers, treads: f.treads, from: P(f.start.along, 0, f.start.up), to: P(f.end.along, 0, f.end.up), width: rec.width, riser: layout.riser, going: layout.going })),
    landings: layout.landings.map((l) => ({ n: l.n, from: P(l.along[0], 0, l.up), to: P(l.along[1], 0, l.up), width: l.width, depth: l.depth })),
    railings: layout.rails.map((r) => ({ key: r.key, side: r.side, flight: r.flight, height: rec.railTop, posts: r.posts, balusters: r.balusters })),
    mass: null,
  };
}
