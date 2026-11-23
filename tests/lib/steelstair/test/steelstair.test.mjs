// SPDX-License-Identifier: Apache-2.0
/** lib/steelstair/test/steelstair.test.mjs: the steel stair generator (0.10 SU.1814c). Numbers worked by hand, said beside each check.  node lib/steelstair/test/steelstair.test.mjs */
import { RULES, defaults, clean, solve, build, cutList, cutListCsv, treadDetail, bimElement, rule } from '../steelstair.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);
// a section table stand-in: kg per metre from the AISC / DetailCraft values (the host passes its own)
const SEC = {
  'C10x15.3': { kind: 'C', mass: 22.768908282, width: 66.04, depth: 254 }, 'L3x3x1/4': { kind: 'L', mass: 7.292003306, width: 76.2, depth: 76.2 },
  'HSS4x4x1/4': { kind: 'RHS', mass: 18.1704817074, width: 101.6, depth: 101.6 }, 'Pipe1-1/2STD': { kind: 'CHS', mass: 4.0478059168, width: 48.26, depth: 48.26 },
  'PL25x25': { kind: 'PL', t: 25, b: 25, mass: 0.025 * 0.025 * 7850, width: 25, depth: 25 }, 'PL16x16': { kind: 'PL', t: 16, b: 16, mass: 0.016 * 0.016 * 7850, width: 16, depth: 16 },
};
const plate = (name) => { const m = /^PL([\d.]+)x([\d.]+)$/.exec(name); return m ? { kind: 'PL', t: +m[1], b: +m[2], mass: (+m[1] / 1000) * (+m[2] / 1000) * 7850, width: +m[2], depth: +m[1] } : null; };
const profileOf = (n) => SEC[n] || plate(n);

// the rules say where each number came from
for (const r of Object.values(RULES)) ok(r.cite.length > 0 && r.cite.every((c) => c.ref && c.says && ['primary', 'secondary', 'unverified'].includes(c.checked)), r.id + ': every rule cites its source and how it was checked');
ok(RULES['us-osha-1910'].cite.every((c) => c.checked === 'primary'), 'OSHA: read in the regulation itself');
ok(RULES['us-ibc-2021'].cite.some((c) => c.checked === 'unverified'), 'IBC: the 12 ft flight limit is shown as unverified');
near(RULES['us-ibc-2021'].riser.max, 177.8, 1e-9, 'IBC riser 7 in'); near(RULES['us-ibc-2021'].going.min, 279.4, 1e-9, 'IBC going 11 in');
near(RULES['us-osha-1910'].going.min, 241.3, 1e-9, 'OSHA going 9.5 in'); near(RULES['us-osha-1910'].landing.min, 762, 1e-9, 'OSHA landing 30 in');
ok(rule('nope').id === 'us-ibc-2021', 'an unknown rule id falls back to the default');

// IBC, 3000 floor to floor: 7 in = 177.8 -> at least ceil(3000/177.8) = 17 risers. 2R + G aims at 625 (middle of 600..650): 17 gives 272.06 < 279.4, so the
// going clamps to 279.4 and 2R + G = 632.3 (fine, penalty 0.073); 18 gives R = 166.667, G = 625 - 333.333 = 291.667 exactly (penalty 0). Fewest risers at penalty 0: 18.
{
  const s = solve({ ...defaults('us-ibc-2021'), rise: 3000 });
  ok(s.n === 18, 'IBC 3000: 18 risers, got ' + s.n);
  near(s.riser, 166.6667, 1e-3, 'riser'); near(s.going, 291.6667, 1e-3, 'going'); near(s.run, 17 * 291.6667, 1e-2, 'run = 17 treads');
  near(s.pitch, Math.atan(166.6667 / 291.6667) * 180 / Math.PI, 1e-4, 'pitch'); ok(s.flights.length === 1 && s.flights[0].treads === 17, 'one flight, 17 treads');
  ok(s.problems.length === 0, 'IBC 3000: no problems, got ' + JSON.stringify(s.problems));
}
// OSHA 3000: 9.5 in = 241.3 -> ceil(3000/241.3) = 13; the going cannot go under 241.3, so 13 (2R+G 702.9), 14 (669.9), 15 (641.3) all miss the comfort range; 16 gives R = 187.5, G = 625 - 375 = 250: pitch 36.87 deg, inside 30..50
{
  const s = solve({ ...defaults('us-osha-1910'), rise: 3000 });
  ok(s.n === 16, 'OSHA 3000: 16 risers, got ' + s.n); near(s.riser, 187.5, 1e-9, 'riser'); near(s.going, 250, 1e-9, 'going'); near(s.pitch, 36.8699, 1e-3, 'pitch'); ok(s.problems.length === 0, 'OSHA: no problems');
}
// UK general access 3000: 170 -> ceil(3000/170) = 18 risers (17.65), R = 166.667, 2R+G middle 625 -> G = 291.667 (>= 250)
{
  const s = solve({ ...defaults('uk-adk-2013-general'), rise: 3000 });
  ok(s.n === 18, 'UK general 3000: 18 risers, got ' + s.n); near(s.going, 291.6667, 1e-3, 'going'); ok(s.problems.length === 0, 'UK: no problems');
  const u = solve({ ...defaults('uk-adk-2013-utility'), rise: 3000 });
  ok(u.n === 16 || u.n === 17 || u.n === 18, 'UK utility 3000 takes the higher rise limit: ' + u.n + ' risers');   // 190 -> ceil(3000/190) = 16
  ok(u.riser <= 190 + 1e-9 && u.riser >= 150 - 1e-9, 'utility riser inside 150..190');
}
// a flight over the rule's limit gets a landing: IBC 4000 > 3657.6 -> 2 flights; at least ceil(4000/177.8) = 23 risers; 12 + 11; treads = 23 - 2 = 21; landing as deep as the stair is wide
{
  const s = solve({ ...defaults('us-ibc-2021'), rise: 4000, width: 1100 });
  ok(s.flights.length === 2, 'IBC 4000: two flights'); ok(s.flights[0].risers + s.flights[1].risers === s.n && Math.abs(s.flights[0].risers - s.flights[1].risers) <= 1, 'risers split evenly');
  ok(s.flights.every((f) => f.risers * s.riser <= 3657.6 + 1e-6), 'no flight over 12 ft'); near(s.landingDepth, 1100, 1e-9, 'landing as deep as the stair is wide');
  near(s.run, (s.n - 2) * s.going + 1100, 1e-6, 'run = treads x going + one landing');
  const o = solve({ ...defaults('us-osha-1910'), rise: 2000, width: 600 });
  near(o.landingDepth, 762, 1e-9, 'OSHA: the landing is not under 30 in even when the stair is 600 wide'); ok(o.flights.length === 1, 'OSHA has no flight limit');
  const forced = solve({ ...defaults('us-osha-1910'), rise: 3000, landings: 1 });
  ok(forced.flights.length === 2, 'a landing asked for by hand splits the flight');
}
// a given run: UK, 3000 rise, run 4800 -> every candidate count is tried with going = 4800 / (n - 1): n = 18 gives 282.35 (in 250..400, 2R+G 615.7 in 550..700)
{
  const s = solve({ ...defaults('uk-adk-2013-general'), rise: 3000, run: 4800 });
  near(s.run, 4800, 1e-6, 'the run asked for is the run got'); ok(s.problems.length === 0, 'run 4800: fits the rule: ' + JSON.stringify(s.problems)); near(s.going, 4800 / (s.n - 1), 1e-9, 'going = run / treads');
  const tight = solve({ ...defaults('us-ibc-2021'), rise: 3000, run: 2000 });
  ok(tight.problems.some((p) => p.code === 'going' || p.code === 'pitch' || p.code === 'comfort'), 'a run too short for the rule says so: ' + JSON.stringify(tight.problems.map((p) => p.code)));
}
// OSHA width: 22 in = 558.8
ok(solve({ ...defaults('us-osha-1910'), width: 500 }).problems.some((p) => p.code === 'width'), 'OSHA: a stair under 22 in wide says so');

// clean(): untrusted input
ok(clean(null) === null && clean({ rise: -5 }) === null && clean({ width: 'x' }) === null, 'clean refuses nonsense');
ok(clean({ rule: 'zz' }).rule === 'us-ibc-2021', 'clean: an unknown rule becomes the default'); ok(clean({ treadType: 'evil' }).treadType === 'folded', 'clean: an unknown tread type becomes the default');
ok(clean({ stringer: 'C10x15.3\u0000x' }).stringer === 'C10x15.3x', 'clean strips control characters');

// build: IBC 3000, folded treads, rails both sides
{
  const rec = { ...defaults('us-ibc-2021'), rise: 3000, run: 0, width: 1000, x: 100, y: 200, z: 50, dir: 90 };
  const b = build(rec, { profileOf });
  const stringers = b.parts.filter((p) => /^f1stringer[LR]$/.test(p.key));
  ok(stringers.length === 2, 'two stringers');
  // the stringer is 18 pitch-line steps long: 18 x sqrt(R^2 + G^2) = 18 x 335.9 = 6046.9 (R = 166.667, G = 291.667)
  const L = Math.hypot(...stringers[0].end.map((v, i) => v - stringers[0].start[i]));
  near(L, 18 * Math.hypot(166.6667, 291.6667), 0.05, 'stringer length');
  // dir 90: the climb goes +y; the first stringer starts left of it (-x side as seen climbing +y is x = -...): both at x = 100 -/+ (500 + 33.02)
  near(stringers[0].start[0], 100 - 533.02, 0.01, 'left stringer across'); near(stringers[1].start[0], 100 + 533.02, 0.01, 'right stringer across');
  ok(stringers[0].end[1] > stringers[0].start[1], 'it climbs along +y');
  // top of the stringer's axis at the upper floor: z = 50 + 3000 + drop-ish; the end sits where the axis meets the upper floor: z(end) = 50 + 3000 - drop + ... = 3050 - drop at a1? (checked as 'above the lower end by the rise')
  near(stringers[0].end[2] - stringers[0].start[2], 3000, 0.01, 'the stringer rises the floor-to-floor height');
  const treads = b.parts.filter((p) => /^f1tread\d+$/.test(p.key)), returns = b.parts.filter((p) => /^f1tread\d+n$/.test(p.key));
  ok(treads.length === 17 && returns.length === 17, 'folded: 17 treads, each with its nosing return');
  near(treads[0].end[2] - 50 + 4 / 2, 166.6667, 1e-3, 'tread 1 top at one riser'); near(treads[16].start[2] - 50 + 2, 17 * 166.6667, 1e-2, 'tread 17 top at 17 risers (the 18th is the floor)');
  const withHoles = stringers.every((s) => s.holes.length === 34);
  ok(withHoles, 'bolted treads: two holes per tread on each stringer (34), got ' + stringers.map((s) => s.holes.length));
  ok(stringers.every((s) => s.holes.every((h) => h.x > 0 && h.x < Math.hypot(...s.end.map((v, i) => v - s.start[i])) && Math.abs(h.y) < 127 - 15 + 1e-6 && h.d === 14)), 'holes lie inside the stringer web, diameter bolt + 2');
  const xs = stringers[0].holes.map((h) => h.x); let spacingOk = true;
  for (let i = 4; i < xs.length; i += 2) if (Math.abs((xs[i] - xs[i - 2]) - (xs[2] - xs[0])) > 0.11) spacingOk = false;
  ok(spacingOk, 'the hole stations repeat at the tread pitch (uniform treads)');
  ok(b.problems.every((p) => p.code !== 'stringer'), 'no section problem: ' + JSON.stringify(b.problems));
  // rails: nosing line + 914.4 (36 in, middle of IBC 34..38) minus half the pipe
  const rail = b.parts.find((p) => p.key === 'r1Lrail');
  ok(!!rail && !!b.parts.find((p) => p.key === 'r1Rrail'), 'a top rail each side');
  near(rail.end[2] - rail.start[2], 17 * 166.6667, 0.01, 'the rail is parallel to the pitch line');
  ok(b.rails.length === 2 && b.rails.every((r) => r.balusters > 0 && r.posts >= 2), 'posts and balusters on both flights sides');
  // balusters: the clear gap between bars is at most 100 mm (4 in sphere rule is 101.6; the default is min(rule, 100))
  const bal = b.parts.filter((p) => /^r1Lbal\d+$/.test(p.key));
  const along = bal.map((p) => Math.hypot(p.start[0] - 100 + 533.02 + 0 * 1, p.start[1] - 200)).sort((a, c) => a - c);
  let gapOk = true; for (let i = 1; i < along.length; i++) if (along[i] - along[i - 1] - 16 > 100.001) gapOk = false;
  ok(gapOk && bal.length >= 10, 'balusters: every clear gap at most 100 mm (' + bal.length + ' bars)');
  ok(!b.problems.some((p) => p.code === 'opening' || p.code === 'rail-height'), 'IBC default rail height 914.4 is inside 34..38 in');
  // weights and cut list
  const cl = cutList(b, { profileOf });
  let want = 0; for (const p of b.parts) { const len = p.length ?? Math.hypot(...p.end.map((v, i) => v - p.start[i])); want += profileOf(p.profileName).mass * len / 1000; }
  near(cl.totalKg, want, 0.6 + cl.rows.length * 0.01, 'cut list total = the sum of every part');
  ok(cl.count === b.parts.length, 'cut list counts every part: ' + cl.count + ' of ' + b.parts.length);
  // a stringer with its ends cut to the floors is longer than the square-ended one by 50 (k + 1/k) mm, k = riser / going (worked: the cut's corners sit (sd/2)(k + 1/k) off the axis points, the nominal ends are (sd/2 - 50)(k + 1/k) short of the floors):
  // 6046.9 mm + 50 (0.571429 + 1.75) = 6162.97 mm; 6.16297 m x 22.768908 kg/m = 140.32 kg each
  const sRow = cl.rows.find((r) => r.section === 'C10x15.3' && /^Stringer/.test(r.role));
  ok(!!sRow, 'a stringer row'); near(sRow ? sRow.unitKg : 0, (6.0469 + 0.05 * (0.571429 + 1.75)) * 22.768908, 0.1, 'one stringer kg (cut to the floors)');
  const csv = cutListCsv(cl); ok(csv.startsWith('Item,Assembly,Part,Section,Length mm,Qty,Each kg,Total kg,Note') && csv.split('\n').length === cl.rows.length + 3, 'the CSV has a head, a row each and a total');
  ok(!/\n[=+\-@]/.test(csv.replace(/\n-?\d/g, '\n0')), 'no formula-looking cell');
  const td = treadDetail(b); ok(td.type === 'folded' && td.bolted && td.holeD === 14 && td.fold === 40 && td.count === 17, 'tread detail: folded, bolted, 14 mm holes, 40 mm return, 17 treads'); near(td.depth, 291.6667 + 25, 0.06, 'tread depth = going + nosing');
  const el = bimElement(b); ok(el.kind === 'stair' && el.flights.length === 1 && el.flights[0].treads === 17 && el.railings.length === 2, 'the BIM element: one flight, two railings');
}
// chequer: welded, no holes, plain plate
{
  const b = build({ ...defaults(), treadType: 'chequer', rise: 3000, tread: { ...defaults().tread, t: 6 } }, { profileOf });
  ok(b.parts.filter((p) => /^f1tread\d+$/.test(p.key)).length === 17 && !b.parts.some((p) => /tread\d+n$/.test(p.key)), 'chequer: a plate per tread and no return');
  ok(b.parts.filter((p) => p.key === 'f1stringerL')[0].holes.length === 0, 'chequer treads are welded: no stringer holes'); ok(b.welds.every((w) => !w.bolted && w.length > 0), 'welds listed with their length');
  const cl = cutList(b, { profileOf }); ok(cl.rows.some((r) => r.role === 'Chequer tread' && r.qty === 17), 'cut list: 17 chequer treads in one row');
}
// grating: equivalent plate thickness 25 x 5 / 30 = 4.17 mm, said in the note
{
  const b = build({ ...defaults(), treadType: 'grating', rise: 3000 }, { profileOf });
  const tp = b.parts.find((p) => p.key === 'f1tread1'); ok(tp.profileName.startsWith('PL4.17x'), 'grating tread profile is the equal-weight plate: ' + tp.profileName);
  ok(cutList(b, { profileOf }).rows.some((r) => /equivalent solid plate/.test(r.note)), 'the equivalent weight is said in the cut list');
}
// two flights and a landing
{
  const b = build({ ...defaults('us-ibc-2021'), rise: 4000, width: 1100 }, { profileOf });
  ok(b.flights.length === 2 && b.landings.length === 1, 'two flights and a landing');
  ok(!!b.parts.find((p) => p.key === 'l1beamL') && !!b.parts.find((p) => p.key === 'l1cover') && !!b.parts.find((p) => p.key === 'l1crossA'), 'the landing has beams, cross angles and a cover');
  ok(b.parts.filter((p) => /^l1post[LR]$/.test(p.key)).length === 2, 'two landing posts'); const cover = b.parts.find((p) => p.key === 'l1cover'); ok(cover.profileName.startsWith('PL4x1100'), 'the cover is as deep as the stair is wide: ' + cover.profileName);
  const f2 = b.parts.find((p) => p.key === 'f2stringerL'), f1 = b.parts.find((p) => p.key === 'f1stringerL');
  ok(f2.start[2] > f1.end[2] - 10 && b.stats.landings === 1, 'the second flight starts at the landing level');
  const off = build({ ...defaults('us-ibc-2021'), rise: 4000, width: 1100, landingPosts: false }, { profileOf }); ok(!off.parts.some((p) => /^l1post/.test(p.key)), 'landing posts can be left off');
  ok(b.rails.some((r) => r.key.startsWith('r2')), 'rails on the second flight too');
}
// rule checks on the rail
{
  const b = build({ ...defaults('us-osha-1910'), rise: 3000, railTop: 1000 }, { profileOf });
  ok(b.problems.some((p) => p.code === 'rail-height'), 'OSHA: a top rail used as handrail at 1000 mm is outside 36..38 in');
  const none = build({ ...defaults('uk-adk-2013-general'), rise: 3000 }, { profileOf }); ok(none.problems.some((p) => p.code === 'rail-unruled'), 'UK: the rail height has no rule value here and says so');
  const noRail = build({ ...defaults(), rails: 'none' }, { profileOf }); ok(noRail.rails.length === 0 && !noRail.parts.some((p) => /rail|bal/.test(p.key)), 'no rails when none is chosen');
  const missing = build({ ...defaults(), stringer: 'XYZ' }, { profileOf }); ok(missing.problems.some((p) => p.code === 'stringer'), 'an unknown stringer section is a problem');
}
// 0.11 SU.1814c: stringer end cuts and post base plates (worked by hand in the comments)
{
  const rec = { ...defaults('us-ibc-2021'), rise: 4000, width: 1100 };   // 4000 mm: two flights and a landing (the rule's 12 ft flight limit is 3658 mm), landing posts
  const b = build(rec, { profileOf });
  const st = b.parts.find((p) => p.key === 'f1stringerL');
  ok(!!st.planes && st.planes.start.n.join() === '0,0,-1' && st.planes.end.n.join() === '1,0,0', 'floor stringer: a level cut at the floor (outward normal down) and a plumb cut at the upper edge (normal along the climb)');
  // dir 0: the lower face's point is on the floor (z = rec.z), the upper face's x is where the last tread ends: (risers - 1) * going from the foot
  ok(Math.abs(st.planes.start.p[2] - 0) < 1e-9, 'the level cut is at the floor: z 0');
  const f1 = b.flights[0];
  ok(Math.abs(st.planes.end.p[0] - (f1.risers - 1) * b.going) < 1e-6 && Math.abs(st.planes.end.p[2] - f1.risers * b.riser) < 1e-6, 'the plumb cut is at the end of the last tread of the flight (' + st.planes.end.p[0].toFixed(3) + ', ' + st.planes.end.p[2].toFixed(3) + ')');
  const f2 = b.parts.find((p) => p.key === 'f2stringerL');
  ok(Math.abs(f2.planes.start.p[2] - f1.risers * b.riser) < 1e-6, 'the second flight is cut level on the landing: its z is the first flight\'s rise');
  const sq = build({ ...rec, endCuts: 'square' }, { profileOf });
  ok(!sq.parts.find((p) => p.key === 'f1stringerL').planes, 'endCuts "square" leaves the stringer as before: no planes');
  const old = { ...rec }; delete old.endCuts; delete old.postBase; delete old.baseT; delete old.anchor;
  const ob = build(old, { profileOf });
  ok(!ob.parts.find((p) => p.key === 'f1stringerL').planes && !ob.parts.some((p) => /base$/.test(p.key)), 'a stair stored before 0.11 (no endCuts, no postBase) builds as it did: square ends, no base plates');
  const bases = b.parts.filter((p) => /^l1post[LR]base$/.test(p.key));
  ok(bases.length === 2 && bases.every((p) => p.holes.length === 4 && p.profileName === 'PL12x210'), 'a base plate under each landing post: PL12x210 (post width 101.6 + 100 -> 210), four holes');
  const post = b.parts.find((p) => p.key === 'l1postL');
  ok(Math.abs(post.start[2] - 12) < 1e-9, 'the post stands on the plate: it starts 12 mm up');
  // anchors 30 mm in from the edges: x = 30 and 180 along the plate, y = -75 and 75 from its centre; hole 16 + 2 = 18
  const h = bases[0].holes.map((q) => q.x + ':' + q.y + ':' + q.d).sort().join(' ');
  ok(h === '180:-75:18 180:75:18 30:-75:18 30:75:18', 'anchor holes at 30 mm from the edges, 18 mm for a 16 mm anchor: ' + h);
  ok(b.welds.some((w) => w.where === 'post to base plate'), 'the post is welded to its plate');
}

console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
