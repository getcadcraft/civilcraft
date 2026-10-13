#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-crs.mjs — CivilCraft's coordinate systems (civilcraft/<build>/crs.js and crs-pick.js) against PROJ.
 *
 *   node bin/test-civilcraft-crs.mjs [--build dev|x.y] [--verbose] [--every n]
 *
 * Second reader: PROJ through pyproj in tools/civilcraft-test/venv (tools/civilcraft-test/crs_check.py; no grids
 * installed, no network). On a sample of the catalog (every n-th projected system, default 15 → ~330, plus named ones:
 * state plane ftUS and ft, UTM north and south, Lambert-93, British National Grid, GDA2020 MGA, NZTM, web Mercator):
 *   - forward/inverse with the catalog's own definition (proj4js vs PROJ on the same +towgs84) to 1 cm, round trips 1e-9°
 *   - the projection maths against PROJ's EPSG definition (each on its own datum) to 1 cm
 *   - the full EPSG → WGS 84 transformation PROJ picks, within EPSG's stated accuracy for the named systems (the rest are
 *     reported: PROJ without grids sometimes falls back to a "ballpark" shift the catalog does better than)
 *   - scale factors (meridian, parallel) to 1e-9 and convergence to 1e-6° against Proj.get_factors
 *   - .prj (ESRI and OGC WKT 1 written by PROJ) → crsFromPrj for ≥ 50 systems, and prjFor → PROJ reads the same system
 *   - local / ground round trips to 1e-9, localFromPairs, misclosure, groundLocal
 *   - search, suggest, systemsThatFit, area words, lat/long text and parsing, reprojectProject
 *   - untrusted values: project-file `crs`, .prj text, crsProblem
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const EVERY = Number(arg('--every')) || 15;
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const C = await mod('crs.js');
const K = await mod('crs-pick.js');
const PJ = await mod('project.js');
const proj4 = (await import('proj4')).default;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);
const section = (s) => console.log('\n== ' + s);
const python = path.join(TOOLS, 'venv/bin/python');
if (!fs.existsSync(python)) { console.log('tools/civilcraft-test/venv is missing (python3 -m venv … && pip install pyproj): PROJ is the second reader here.'); process.exit(1); }
const py = (jobs) => JSON.parse(execFileSync(python, [path.join(TOOLS, 'crs_check.py')], { input: JSON.stringify(jobs), maxBuffer: 1 << 30 }).toString());
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const fmt = (v) => (Math.abs(v) < 1e-3 && v !== 0 ? v.toExponential(2) : +v.toPrecision(4));

// ---------------------------------------------------------------------------
section('catalog');
const cat = C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
C.setWktCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-wkt.json'), 'utf8')));
ok(cat.length > 5000, `catalog has ${cat.length} systems`);
ok(cat.every((e) => Number.isInteger(e.code) && typeof e.name === 'string' && /\+proj=/.test(e.proj4) && ['m', 'ft', 'ftUS', 'deg'].includes(e.unit)), 'every entry has a code, a name, a proj4 definition and a unit');
ok(cat.every((e) => !/nadgrids|geoidgrids/.test(e.proj4)), 'no entry needs a grid file');
ok(cat.every((e) => e.area === null || (e.area.length === 4 && e.area.every(Number.isFinite) && e.area[1] <= e.area[3])), 'areas of use are [w, s, e, n]');
const NAMED = [2277, 2278, 2229, 3435, 2264, 6588, 32615, 32614, 32755, 32733, 26914, 6343, 2154, 27700, 7856, 7855, 2193, 3857, 25832, 28992, 3067];
for (const c of NAMED) ok(!!C.byCode(c), `EPSG:${c} is in the catalog (${C.byCode(c)?.name})`);
const nad27 = cat.filter((e) => /^NAD27\b/.test(e.name)).length;
if (nad27) note(`${nad27} NAD27 systems are in the catalog (with EPSG's grid-free shift, stated accuracy ${C.byCode(32040)?.shiftAccuracy} m) — GIS-SPEC §1 says NAD27 is left out; the dialog shows their accuracy`);
ok(C.byCode('2277') === C.byCode(2277) && C.byCode(999999) === null, 'byCode takes a number or a string; unknown → null');

const projected = cat.filter((e) => !e.geographic);
const sample = [...new Set([...NAMED.map((c) => C.byCode(c)), ...projected.filter((e, i) => i % EVERY === 0)])];
ok(sample.length >= 300, `${sample.length} projected systems sampled (every ${EVERY}th + ${NAMED.length} named)`);
const r = rng(7);
const ptsIn = (a, n = 5) => {
  let [w, s, e, nn] = a; if (e < w) e += 360;
  const out = [[(w + e) / 2, (s + nn) / 2]];
  while (out.length < n) out.push([w + (e - w) * (0.08 + 0.84 * r()), s + (nn - s) * (0.08 + 0.84 * r())]);
  return out.map(([x, y]) => [((x + 180) % 360 + 360) % 360 - 180, y]);
};
const samplePts = new Map(sample.map((e) => [e.code, ptsIn(e.area)]));

// ---------------------------------------------------------------------------
section('forward and inverse vs PROJ, same definition (proj4js vs PROJ)');
{
  const res = py(sample.map((e) => ({ op: 'proj4', def: e.proj4, pts: samplePts.get(e.code) })));
  const CONF = /\+proj=(tmerc|utm|lcc|merc|stere|sterea|omerc|somerc)\b/; // exact both ways; equal-area etc. use series (~1e-8°)
  let worst = 0, worstName = '', bad = 0, rtWorst = 0, rt7 = 0, rtName = '';
  sample.forEach((e, i) => {
    const f = C.frame(C.crsFromEntry(e)), m = C.METRES_PER[e.unit];
    // through a datum shift (geocentric, iterated back; a 7-parameter one undone by negating it, as PROJ does): ~1e-7°
    const seven = /\+towgs84=(?!0,0,0(\s|$))/.test(e.proj4);
    let w = 0;
    samplePts.get(e.code).forEach((p, k) => {
      const a = f.fromLonLat(p[0], p[1]), b = res[i].pts?.[k];
      if (!b || b[0] == null) { w = Infinity; return; }
      w = Math.max(w, Math.hypot(a[0] - b[0], a[1] - b[1]) * m);
      const back = f.toLonLat(a[0], a[1]);
      const d = Math.max(Math.abs(((back[0] - p[0] + 540) % 360) - 180), Math.abs(back[1] - p[1])); // ±180° is one meridian
      if (seven || !CONF.test(e.proj4)) rt7 = Math.max(rt7, d); else { if (d > rtWorst) rtName = e.code + ' ' + e.name + ' ' + e.proj4; rtWorst = Math.max(rtWorst, d); }
    });
    if (w > worst) { worst = w; worstName = e.code + ' ' + e.name; }
    if (!(w <= 0.01)) { bad++; if (bad < 6) console.log(`    ${e.code} ${e.name}: ${fmt(w)} m`); }
  });
  ok(bad === 0, `fromLonLat agrees with PROJ to 1 cm on all ${sample.length} (worst ${fmt(worst)} m, ${worstName})`);
  ok(rtWorst < 1e-9, `toLonLat(fromLonLat(p)) = p to 1e-9° for conformal projections without a datum shift (worst ${fmt(rtWorst)}°, ${rtName})`);
  ok(rt7 < 3e-7, `the others (a datum shift to WGS 84, or an equal-area/series projection) to 3e-7° — about 3 cm (worst ${fmt(rt7)}°)`);
}

section('projection maths vs PROJ\'s own EPSG definitions (each on its own datum)');
{
  const set = sample.filter((e) => !/\+pm=/.test(e.proj4)); // a non-Greenwich prime meridian: PROJ's geodetic CRS counts from it
  const res = py(set.map((e) => ({ op: 'own', code: e.code, pts: samplePts.get(e.code) })));
  let worst = 0, worstName = '', bad = 0;
  set.forEach((e, i) => {
    const P = proj4.Proj(e.proj4), m = C.METRES_PER[e.unit], k = P.to_meter || 1;
    let w = 0;
    samplePts.get(e.code).forEach((p, j) => {
      const q = P.forward({ x: p[0] * Math.PI / 180, y: p[1] * Math.PI / 180 }), b = res[i].pts?.[j];
      if (!b || b[0] == null) { w = Infinity; return; }
      w = Math.max(w, Math.hypot(q.x / k - b[0], q.y / k - b[1]) * m);
    });
    if (w > worst) { worst = w; worstName = e.code + ' ' + e.name; }
    if (!(w <= 0.01)) { bad++; if (bad < 6) console.log(`    ${e.code} ${e.name}: ${fmt(w)} m`); }
  });
  ok(bad === 0, `the catalog's definitions give EPSG's projection to 1 cm on ${set.length} (worst ${fmt(worst)} m, ${worstName})`);
}

section('the full transformation to WGS 84 vs the one PROJ picks');
{
  const res = py(sample.map((e) => ({ op: 'fwd', code: e.code, pts: samplePts.get(e.code) })));
  const named = new Set(NAMED);
  let within = 0, ballpark = 0, beyond = [];
  sample.forEach((e, i) => {
    const f = C.frame(C.crsFromEntry(e)), m = C.METRES_PER[e.unit];
    let w = 0;
    samplePts.get(e.code).forEach((p, k) => {
      const a = f.fromLonLat(p[0], p[1]), b = res[i].pts?.[k];
      w = !b || b[0] == null ? Infinity : Math.max(w, Math.hypot(a[0] - b[0], a[1] - b[1]) * m);
    });
    const tol = Math.max(0.05, e.shiftAccuracy || 0);
    if (named.has(e.code)) ok(w <= tol, `${e.code} ${e.name}: ${fmt(w)} m from PROJ (allowed ${tol} m: EPSG's accuracy of the shift)`);
    if (w <= tol) within++;
    else if (/allpark/.test(res[i].desc || '')) ballpark++;
    else beyond.push(`${e.code} ${e.name} ${fmt(w)} m (accuracy ${e.shiftAccuracy ?? 'unknown'}; PROJ: ${String(res[i].desc).slice(0, 80)})`);
  });
  note(`${within} of ${sample.length} within EPSG's stated shift accuracy of PROJ's own choice; ${ballpark} where PROJ (no grids) falls back to a ballpark shift; ${beyond.length} where PROJ picks another shift`);
  if (VERBOSE) for (const b of beyond) note('  ' + b);
  ok(within >= sample.length * 0.85, 'at least 85% of the sample agree with PROJ\'s pick within the stated accuracy');
}

section('scale factors and convergence vs Proj.get_factors');
{
  // a non-Greenwich prime meridian (Ferro, Paris): pyproj's Proj hands get_factors longitudes from another meridian than
  // its own inverse returns (17°40′ off for Ferro), so those are checked for consistency only (k ≈ 1 on the central meridian)
  const set = sample.filter((e) => !/\+pm=/.test(e.proj4));
  const ferro = C.frame(C.crsFromEntry(C.byCode(31283))), fx0 = ferro.fromLonLat(16.3, 48.2), ff = ferro.factors(fx0[0], fx0[1]);
  ok(Math.abs(ff.k - 1) < 1e-6 && Math.abs(ff.convergence) < 0.05, `MGI (Ferro) Austria East: k ${ff.k.toFixed(9)} and γ ${ff.convergence.toFixed(4)}° near its central meridian`);
  const grid = py(set.map((e) => ({ op: 'proj4', def: e.proj4, pts: samplePts.get(e.code).slice(0, 3) })));
  const jobs = set.map((e, i) => ({ op: 'factors', code: e.code, pts: (grid[i].pts || []).filter((p) => p && p[0] != null) }));
  const res = py(jobs);
  // conformal projections: both libraries are exact to rounding; others (Cassini, polyconic, Albers…) are series whose
  // last digits differ between proj4js and PROJ (0.1 mm in position), so their derivatives agree to ~1e-8
  const CONFORMAL = /\+proj=(tmerc|utm|lcc|merc|stere|sterea|omerc|somerc)\b/;
  let wk = 0, wc = 0, n = 0, wkName = '', wcName = '', wkn = 0, wcn = 0;
  set.forEach((e, i) => {
    if (!Array.isArray(res[i])) return;
    const f = C.frame(C.crsFromEntry(e));
    res[i].forEach((q, j) => {
      const [x, y] = jobs[i].pts[j], a = f.factors(x, y);
      const dk = Math.max(Math.abs(a.kMeridian - q.km), Math.abs(a.kParallel - q.kp)), dc = Math.abs(a.convergence - q.conv);
      if (!CONFORMAL.test(e.proj4)) { wkn = Math.max(wkn, dk); wcn = Math.max(wcn, dc); n++; return; }
      if (dk > wk) { wk = dk; wkName = e.code + ' ' + e.name; }
      if (dc > wc) { wc = dc; wcName = e.code + ' ' + e.name; }
      n++;
    });
  });
  ok(n >= 600, `${n} points compared`);
  ok(wk < 1e-9, `conformal projections: k along the meridian and the parallel within 1e-9 of PROJ (worst ${fmt(wk)}, ${wkName})`);
  ok(wc < 1e-6, `convergence within 1e-6° of PROJ, PROJ's sign (worst ${fmt(wc)}°, ${wcName})`);
  ok(wkn < 1e-8 && wcn < 1e-6, `non-conformal projections: k within 1e-8 (worst ${fmt(wkn)}), convergence within 1e-6° (worst ${fmt(wcn)}°)`);
  // by hand: Texas Central at a point east of the central meridian, northern hemisphere → γ > 0
  const f = C.frame(C.crsFromEntry(C.byCode(2277)));
  const tx = f.fromLonLat(-97.0, 30.5), fx = f.factors(tx[0], tx[1], 1000);
  ok(fx.convergence > 0, 'east of the central meridian in the north: convergence is positive');
  const R = 6378137 * Math.sqrt(1 - 0.00669438002290) / (1 - 0.00669438002290 * Math.sin(30.5 * Math.PI / 180) ** 2);
  ok(Math.abs(fx.elevation - R / (R + 1000 * 1200 / 3937)) < 1e-9, `elevation factor at 1000 ft = R/(R+h) (${fx.elevation.toFixed(10)})`);
  ok(Math.abs(fx.combined - fx.k * fx.elevation) < 1e-15, 'combined = k × elevation factor');
  const g = K.groundFactor(C.crsFromEntry(C.byCode(2277)), tx[0], tx[1], 1000);
  ok(g.combined === fx.combined && Math.abs(g.lon + 97) < 1e-9 && Math.abs(g.lat - 30.5) < 1e-9, 'groundFactor = frame.factors, with the point\'s lat/long');
}

section('between two systems (frame.to / from, transformer) vs PROJ');
{
  const pairs = [[2277, 32614], [2277, 6588], [27700, 25830], [2154, 25831], [7856, 7855], [2193, 3857], [32755, 7855]];
  const jobs = [];
  for (const [a, b] of pairs) {
    const ea = C.byCode(a), p = ptsIn(ea.area, 4).map(([lon, lat]) => C.transformer(null, ea)(lon, lat));
    jobs.push({ op: 'between', a, b, pts: p });
  }
  const res = py(jobs);
  pairs.forEach(([a, b], i) => {
    const ea = C.byCode(a), eb = C.byCode(b);
    const f = C.frame(C.crsFromEntry(ea)), to = f.to(eb), from = f.from(eb), t = C.transformer(ea, eb);
    let w = 0, rt = 0, same = 0;
    jobs[i].pts.forEach((p, k) => {
      const q = to(p[0], p[1]), o = res[i].pts[k];
      w = Math.max(w, Math.hypot(q[0] - o[0], q[1] - o[1]) * C.METRES_PER[eb.unit]);
      const back = from(q[0], q[1]); rt = Math.max(rt, Math.hypot(back[0] - p[0], back[1] - p[1]));
      const tq = t(p[0], p[1]); same = Math.max(same, Math.hypot(tq[0] - q[0], tq[1] - q[1]));
    });
    const tol = Math.max(0.05, (ea.shiftAccuracy || 0) + (eb.shiftAccuracy || 0));
    ok(w <= tol, `${a} → ${b}: ${fmt(w)} m from PROJ (allowed ${tol} m)`);
    // a 7-parameter shift is undone by negating its parameters (PROJ does the same): ~1 mm for OSGB36's rotations
    ok(rt < 0.002 && same < 1e-9, `${a} → ${b} → ${a} returns to the start (${fmt(rt)} units); transformer() gives the same numbers`);
  });
}

// ---------------------------------------------------------------------------
section('.prj files: ESRI and OGC WKT 1 written by PROJ → crsFromPrj');
{
  const codes = [...new Set([...NAMED, 4326, 4269, 6318, 4258, 4283, 7844, ...projected.filter((e, i) => i % 61 === 3).map((e) => e.code)])].filter((c) => C.byCode(c));
  ok(codes.length >= 50, `${codes.length} systems`);
  const w = py(codes.map((c) => ({ op: 'wkt', code: c })));
  let exact = 0, sameMaths = 0, unreadable = [], total = 0;
  const maths = (a, b) => {
    const A = proj4.Proj(a.proj4), B = proj4.Proj(b.proj4);
    if (Math.abs(A.a - B.a) > 1e-3 || Math.abs((A.es || 0) - (B.es || 0)) > 1e-9 || a.unit !== b.unit) return false;
    const p = ptsIn(a.area, 3), geo = a.unit === 'deg';
    return p.every(([lon, lat]) => { const u = A.forward({ x: lon * Math.PI / 180, y: lat * Math.PI / 180 }), v = B.forward({ x: lon * Math.PI / 180, y: lat * Math.PI / 180 }); return Math.hypot(u.x - v.x, u.y - v.y) < (geo ? 1e-9 : 1e-3); });
  };
  const t0 = Date.now();
  codes.forEach((c, i) => {
    for (const kind of ['esri', 'gdal']) {
      total++;
      let res;
      try { res = C.crsFromPrj(w[i][kind]); } catch (e) { unreadable.push(`${c} ${kind}: ${e.message}`); continue; }
      const got = res.matched;
      if (got?.code === c) { exact++; sameMaths++; } else if (got && maths(C.byCode(c), got)) { sameMaths++; if (VERBOSE) note(`${kind} ${c} ${C.byCode(c).name} → ${got.code} ${got.name} (same maths)`); } else note(`${kind} ${c} ${C.byCode(c).name} → ${got ? got.code + ' ' + got.name : 'no match: ' + res.notes.join(' ')}`);
    }
  });
  const ms = Date.now() - t0;
  ok(exact >= total * 0.9, `${exact} of ${total} .prj files matched their exact EPSG code`);
  ok(sameMaths + unreadable.length === total, `every other one matched a system with the same maths on the same ellipsoid (${sameMaths - exact}), or could not be read`);
  ok(unreadable.length <= 2, `${unreadable.length} .prj files proj4js cannot read${unreadable.length ? ': ' + unreadable.join('; ') : ''}`);
  note(`matching took ${Math.round(ms / total)} ms per .prj on average`);
  // a known limit: proj4js cannot read ESRI's polar stereographic WKT (Stereographic_North_Pole) — a plain message, said in help
  const polar = py([{ op: 'wkt', code: 32661 }])[0].esri;
  let pe = null; try { C.crsFromPrj(polar); } catch (e) { pe = e; }
  ok(!pe || /could not be read/.test(pe.message), 'ESRI WKT of UPS North (32661): ' + (pe ? 'refused with "' + pe.message + '" (help says so)' : 'read'));
  for (const c of [2277, 32615, 27700, 2154, 7856, 2193, 3857, 4326, 6588]) {
    const i = codes.indexOf(c);
    ok(C.crsFromPrj(w[i].esri).matched?.code === c, `ESRI .prj of ${c} ${C.byCode(c).name} → ${c}`);
  }
}

section('prjFor → PROJ reads the same system → crsFromPrj gives it back');
{
  const codes = [...NAMED, ...projected.filter((e, i) => i % 97 === 5).map((e) => e.code)];
  const wkts = await Promise.all(codes.map((c) => C.prjFor(C.crsFromEntry(C.byCode(c)))));
  ok(wkts.every((w) => typeof w === 'string' && /^(PROJCS|GEOGCS)\[/.test(w)), `prjFor gives ESRI WKT for all ${codes.length}`);
  const res = py(codes.map((c, i) => ({ op: 'read', wkt: wkts[i], code: c, pts: ptsIn(C.byCode(c).area, 3) })));
  const notSame = codes.filter((c, i) => !(res[i].diff < 0.001));
  ok(notSame.length === 0, `PROJ projects each written .prj as EPSG:code does, to 1 mm${notSame.length ? ' (not: ' + notSame.join(', ') + ')' : ''}`);
  note(`${codes.filter((c, i) => res[i].same === true).length} of ${codes.length} are even "equal" to EPSG:code in PROJ's strict sense (ESRI names its datums its own way)`);
  const back = codes.filter((c, i) => C.crsFromPrj(wkts[i]).matched?.code !== c);
  ok(back.length <= codes.length * 0.05, `crsFromPrj(prjFor(code)) = code for ${codes.length - back.length} of ${codes.length}${back.length ? ' (others: ' + back.join(', ') + ')' : ''}`);
  ok((await C.prjFor(null)) === null, 'prjFor(null) → null');
  ok((await C.prjFor({ code: null, proj4: '+proj=tmerc +units=m' })) === null, 'prjFor of a typed proj4 system without WKT → null');
  const own = 'PROJCS["Site grid",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",1000.0],PARAMETER["False_Northing",2000.0],PARAMETER["Central_Meridian",-97.123],PARAMETER["Scale_Factor",0.99991],PARAMETER["Latitude_Of_Origin",30.0],UNIT["Meter",1.0]]';
  const r = C.crsFromPrj(own);
  ok(!r.matched && r.crs.code === null && r.crs.unit === 'm' && r.crs.name === 'Site grid' && r.notes.length === 1, 'an unmatched .prj is used as is, with a note');
  ok((await C.prjFor(r.crs)) === own, 'prjFor of a .prj-defined system writes the .prj back');
  const f = C.frame(r.crs), xy = f.fromLonLat(-97.1, 30.2);
  const pr = py([{ op: 'read', wkt: own }])[0];
  const pp = py([{ op: 'proj4', def: pr.proj4, pts: [[-97.1, 30.2]] }])[0].pts[0];
  ok(Math.hypot(xy[0] - pp[0], xy[1] - pp[1]) < 0.01, `a custom .prj projects as PROJ reads it (${fmt(Math.hypot(xy[0] - pp[0], xy[1] - pp[1]))} m)`);
}

section('.prj files that are not what they say (untrusted)');
{
  const throws = (t, m) => { let e = null; try { C.crsFromPrj(t); } catch (x) { e = x; } ok(e instanceof Error && e.message.length < 200, m + (e ? ' — "' + e.message + '"' : ' (no error)')); };
  throws('', 'empty');
  throws('hello world', 'plain text');
  throws('PROJCS[' + 'x'.repeat(30000) + ']', 'over 20 000 characters');
  throws('LOCAL_CS["Site",LOCAL_DATUM["x",0],UNIT["Meter",1]]', 'a local (engineering) system');
  throws('PROJCS["x",GEOGCS["y",DATUM["z",SPHEROID["s",1,0]]],PROJECTION["Nonsense"],UNIT["Meter",1]]', 'an unknown projection');
  throws('PROJCS["Km",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",0],PARAMETER["False_Northing",0],PARAMETER["Central_Meridian",0],PARAMETER["Scale_Factor",1],PARAMETER["Latitude_Of_Origin",0],UNIT["Kilometer",1000.0]]', 'kilometers (a unit CivilCraft does not handle)');
  const g = C.crsFromPrj('GEOGCS["GCS_North_American_1983",DATUM["D_North_American_1983",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]');
  ok(g.crs.unit === 'deg' && g.matched?.code === 4269, 'a geographic .prj reads as geographic (NAD83 → 4269)');
  ok(/projected system/.test(C.crsProblem(g.crs, 'ft')), 'and a geographic system is refused for a project: ' + C.crsProblem(g.crs, 'ft'));
  const auth = C.crsFromPrj('PROJCS["anything",GEOGCS["x",DATUM["y",SPHEROID["z",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["central_meridian",-93],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],PARAMETER["latitude_of_origin",0],UNIT["metre",1],AUTHORITY["EPSG","32615"]]');
  ok(auth.matched?.code === 32615, 'an EPSG authority on the outermost object wins');
}

// ---------------------------------------------------------------------------
section('local and ground coordinates');
{
  const base = C.crsFromEntry(C.byCode(2277));
  let worst = 0, worstLL = 0;
  const rr = rng(11);
  for (let i = 0; i < 200; i++) {
    const local = { scale: 0.9995 + rr() * 0.001, rotation: (rr() - 0.5) * 360, from: [rr() * 1e4, rr() * 1e4], to: [3.0e6 + rr() * 2e5, 1.0e7 + rr() * 2e5] };
    const crs = { ...base, local }, f = C.frame(crs);
    const p = [rr() * 2e4 - 5e3, rr() * 2e4 - 5e3], g = f.toGrid(p[0], p[1]), b = f.fromGrid(g[0], g[1]);
    worst = Math.max(worst, Math.hypot(b[0] - p[0], b[1] - p[1]) / Math.max(1, Math.hypot(...p)));
    const ll = f.toLonLat(p[0], p[1]), back = f.fromLonLat(ll[0], ll[1]);
    worstLL = Math.max(worstLL, Math.hypot(back[0] - p[0], back[1] - p[1]));
    const viaGrid = C.frame(base).toLonLat(g[0], g[1]);
    if (i === 0) ok(Math.abs(viaGrid[0] - ll[0]) < 1e-12 && Math.abs(viaGrid[1] - ll[1]) < 1e-12, 'toLonLat with a local step = the system\'s toLonLat of toGrid');
    const lg = K.localToGrid(local, p[0], p[1]);
    if (i === 0) ok(Math.hypot(lg[0] - g[0], lg[1] - g[1]) < 1e-6, 'crs-pick localToGrid = frame.toGrid');
  }
  ok(worst < 1e-9, `fromGrid(toGrid(p)) = p to 1e-9 relative over 200 random local steps (worst ${fmt(worst)})`);
  ok(worstLL < 1e-5, `fromLonLat(toLonLat(p)) through a local step returns to p (worst ${fmt(worstLL)} ft)`);

  // two control points → exact fit; a third gives the misclosure
  const truth = { scale: 1.00012, rotation: 12.5, from: [5000, 5000], to: [3115000, 10070000] };
  const T = (p) => K.localToGrid(truth, p[0], p[1]);
  const a = [5000, 5000], b = [5400, 5300], c = [4800, 5600];
  const fit = C.localFromPairs([[a, T(a)], [b, T(b)]]);
  ok(Math.abs(fit.scale - truth.scale) < 1e-12 && Math.abs(fit.rotation - truth.rotation) < 1e-9, `localFromPairs finds scale ${fit.scale} and rotation ${fit.rotation}°`);
  const fa = K.localToGrid(fit, ...a), fb = K.localToGrid(fit, ...b);
  ok(Math.hypot(fa[0] - T(a)[0], fa[1] - T(a)[1]) < 1e-9 * 1e7 && Math.hypot(fb[0] - T(b)[0], fb[1] - T(b)[1]) < 1e-9 * 1e7, 'both control points fit exactly');
  const m0 = K.misclosure(fit, c, T(c));
  ok(m0.dist < 1e-6, `a third point on the same grid closes (${fmt(m0.dist)})`);
  const off = T(c); off[0] += 0.12; off[1] -= 0.05;
  const m1 = K.misclosure(fit, c, off);
  ok(Math.abs(m1.dist - 0.13) < 1e-6 && Math.abs(m1.dx - 0.12) < 1e-6 && m1.ppm > 0, `a third point 0.13 off shows a misclosure of ${m1.dist.toFixed(4)} (${m1.ppm.toFixed(1)} ppm)`);
  let e = null; try { C.localFromPairs([[a, T(a)], [a, T(b)]]); } catch (x) { e = x; } ok(!!e, 'two control points in the same place are refused: ' + e?.message);
  e = null; try { C.localFromPairs([[a, T(a)]]); } catch (x) { e = x; } ok(!!e, 'one control point is refused');

  // ground: grid = base + csf (ground − base)
  const gl = C.groundLocal(0.99987, [0, 0]);
  const gf = C.frame({ ...base, local: gl });
  const gp = gf.toGrid(3115000 / 0.99987, 10070000 / 0.99987);
  ok(Math.abs(gp[0] - 3115000) < 1e-6 && Math.abs(gp[1] - 10070000) < 1e-6, 'ground: grid = combined factor × ground about the base point 0,0');
  const d = gf.fromGrid(3115000, 10070000), d2 = gf.fromGrid(3116000, 10070000);
  ok(Math.abs((d2[0] - d[0]) - 1000 / 0.99987) < 1e-6, 'a grid distance of 1000 ft is 1000 / CSF on the ground');
  ok(gl.rotation === 0 && gl.from[0] === gl.to[0], 'groundLocal has no rotation and the same base in both');
  ok(C.crsProblem({ ...base, local: gl }, 'ft') === null, 'a ground system passes crsProblem');
  ok(/not valid/.test(C.crsProblem({ ...base, local: { scale: 0, rotation: 0, from: [0, 0], to: [0, 0] } }, 'ft')), 'a zero scale is refused');
  ok(/not valid/.test(C.crsProblem({ ...base, local: { scale: 1, rotation: NaN, from: [0, 0], to: [0, 0] } }, 'ft')), 'a NaN rotation is refused');
}

// ---------------------------------------------------------------------------
section('crsProblem: unit families');
{
  const ftUS = C.crsFromEntry(C.byCode(2277)), ft = C.crsFromEntry(C.byCode(2264)), m = C.crsFromEntry(C.byCode(32614));
  ok(C.crsProblem(ftUS, 'ft') === null, 'a feet project takes a US survey foot system (the project\'s feet mean the system\'s foot)');
  ok(ft.unit === 'ft' ? C.crsProblem(ft, 'ft') === null : true, 'a feet project takes an international foot system');
  ok(/metres|meters/.test(C.crsProblem(m, 'ft') || ''), 'a feet project refuses a metre system: ' + C.crsProblem(m, 'ft'));
  ok(/feet/.test(C.crsProblem(ftUS, 'm') || ''), 'a metre project refuses a feet system');
  ok(/definition/.test(C.crsProblem({ code: null, name: 'x', proj4: '', unit: 'm' }, 'm') || ''), 'no definition is refused');
  ok(/could not be used/.test(C.crsProblem({ code: null, name: 'x', proj4: '+proj=nonsense +units=m', unit: 'm' }, 'm') || ''), 'a definition proj4js cannot run is refused, not thrown');
  ok(/metres, feet|meters, feet/.test(C.crsProblem({ code: null, name: 'x', proj4: '+proj=utm +zone=1', unit: 'km' }, 'm') || ''), 'an unknown unit is refused');
  ok(C.crsProblem(null, 'ft') === null, 'no system is not a problem');
}

section('the project file\'s crs (untrusted)');
{
  const base = { format: 'civilcraft-project', version: 1, name: 'x', units: 'ft', points: [] };
  const load = (crs) => PJ.Project.fromJSON({ ...base, crs });
  const good = load({ code: 2277, name: 'NAD83 / Texas Central (ftUS)', proj4: C.byCode(2277).proj4, unit: 'ftUS', local: { scale: 0.99987, rotation: 0, from: [0, 0], to: [0, 0] } });
  ok(good.project.state.crs?.code === 2277 && good.project.state.crs.local.scale === 0.99987 && !good.notes.length, 'a good crs reads back');
  const cases = [
    ['a string', 'EPSG:2277'], ['a number', 2277], ['an array', [2277]], ['no proj4', { code: 2277, unit: 'ftUS' }],
    ['proj4 not a string', { proj4: { a: 1 }, unit: 'm' }], ['an empty proj4', { proj4: '   ', unit: 'm' }],
    ['a huge proj4', { proj4: '+proj=utm ' + 'x'.repeat(30000), unit: 'm' }], ['an unknown unit', { proj4: '+proj=utm +zone=14', unit: 'km' }],
    ['a zero scale', { proj4: '+proj=utm +zone=14', unit: 'm', local: { scale: 0, rotation: 0, from: [0, 0], to: [0, 0] } }],
    ['a scale of 5', { proj4: '+proj=utm +zone=14', unit: 'm', local: { scale: 5, rotation: 0, from: [0, 0], to: [0, 0] } }],
    ['a NaN-ish rotation', { proj4: '+proj=utm +zone=14', unit: 'm', local: { scale: 1, rotation: 'x', from: [0, 0], to: [0, 0] } }],
    ['a short point', { proj4: '+proj=utm +zone=14', unit: 'm', local: { scale: 1, rotation: 0, from: [0], to: [0, 0] } }],
    ['a local that is a string', { proj4: '+proj=utm +zone=14', unit: 'm', local: 'ground' }],
  ];
  for (const [what, crs] of cases) {
    const r = load(crs);
    ok(r.project.state.crs === null && r.notes.some((n) => /coordinate system/.test(n)), `${what}: no system, with a note`);
  }
  const odd = load({ code: -5, name: 'Bad\u0000name\u001f' + 'n'.repeat(400), proj4: '+proj=utm\u0000 +zone=14 +units=m', unit: 'm', __proto__: { polluted: true }, extra: 1 });
  const s = odd.project.state.crs;
  ok(s && s.code === null && !/[\u0000-\u001f]/.test(s.name + s.proj4) && s.name.length <= 200 && !('extra' in s) && !('polluted' in s), 'odd values are cleaned: bad code dropped, control characters removed, name cut, extra keys dropped');
  ok(({}).polluted === undefined, 'nothing reaches Object.prototype');
  const bogus = load({ proj4: '+proj=nonsense', unit: 'm' }).project.state.crs;
  ok(bogus && typeof C.crsProblem(bogus, 'ft') === 'string', 'a definition that reads but cannot run is judged later by crsProblem, without throwing');
  ok(load(undefined).project.state.crs === null && load(null).project.state.crs === null, 'no crs → null, no note');
  // round trip through toJSON
  const again = PJ.Project.fromJSON(JSON.parse(JSON.stringify(good.project.toJSON())));
  ok(JSON.stringify(again.project.state.crs) === JSON.stringify(good.project.state.crs), 'toJSON → fromJSON keeps the system and its ground step');
  // the system is an undo step
  const p = new PJ.Project();
  p.change('Set the coordinate system', (st) => { st.crs = C.crsFromEntry(C.byCode(2277)); });
  ok(p.state.crs?.code === 2277 && p.undo() && p.state.crs === null && p.redo() && p.state.crs?.code === 2277, 'setting the system is one undo step');
}

// ---------------------------------------------------------------------------
section('search, suggest and "systems these coordinates fit"');
{
  ok(C.search('2277')[0]?.code === 2277, 'a code finds itself first');
  ok(C.search('EPSG:2277')[0]?.code === 2277 && C.search('epsg: 27700')[0]?.code === 27700, '"EPSG:" is ignored');
  ok(C.search('22').every((e) => String(e.code).startsWith('22')), 'a partial code lists codes starting with it');
  const tc = C.search('texas central ftus');
  ok(tc.length >= 3 && tc.every((e) => /Texas .*Central \(ftUS\)/.test(e.name)) && /^NAD83\(2011\) \/ Texas Central/.test(tc[0].name) && tc.slice(0, 5).some((e) => e.code === 2277), `words find "${tc[0]?.name}" first, 2277 among the first five (${tc.length} hits)`);
  ok(C.search('utm 14n', { near: [-97.7, 30.3] })[0]?.area && C.search('utm', { near: [-97.7, 30.3], limit: 5 }).every((e) => e.area[0] <= -97.7 && e.area[2] >= -97.7), 'near puts systems whose area holds the point first');
  ok(C.search('no such system at all').length === 0, 'nothing found → []');
  ok(C.search('', { limit: 3 }).length === 3, 'limit');
  const sg = C.suggest([-97.7, 30.3], { unit: 'ft' });
  ok(sg.some((e) => e.code === 2277) && sg.every((e) => ['ft', 'ftUS'].includes(e.unit)), `suggest for Austin in feet includes Texas Central (${sg.slice(0, 3).map((e) => e.code).join(', ')}…)`);
  const sm = C.suggest([-97.7, 30.3], { unit: 'm' });
  ok(sm.some((e) => /UTM zone 14N/.test(e.name)) && sm.every((e) => e.unit === 'm'), 'suggest in metres includes UTM zone 14N');
  ok(C.suggest([2.35, 48.85], { unit: 'm' }).some((e) => e.code === 2154), 'Paris → Lambert-93');
  ok(C.suggest([174.78, -41.29], { unit: 'm' }).some((e) => e.code === 2193), 'Wellington → NZTM');
  ok(C.suggest([151.2, -33.87], { unit: 'm' }).some((e) => e.code === 7856), 'Sydney → GDA2020 MGA zone 56');
  ok(C.suggest([-0.13, 51.5], { unit: 'm' }).some((e) => e.code === 27700), 'London → British National Grid');

  // the catalog's areas against PROJ's
  const info = py(sample.slice(0, 60).map((e) => ({ op: 'info', code: e.code })));
  const areaBad = sample.slice(0, 60).filter((e, i) => !info[i].area || e.area.some((v, k) => Math.abs(v - info[i].area[k]) > 0.0051));
  ok(areaBad.length === 0, 'areas of use match PROJ\'s (to the catalog\'s rounding)' + (areaBad.length ? ': ' + areaBad.map((e) => e.code).join(', ') : ''));

  // fits: a Texas Central project at E 3,115,000 N 10,070,000 (US survey feet)
  const t0 = Date.now();
  const fit = K.systemsThatFit({ x: 3115000, y: 10070000 }, 'ft');
  const ms = Date.now() - t0;
  ok(fit.total >= 1 && fit.total <= 8 && fit.list.every((x) => /Texas Central/.test(x.entry.name)), `E 3,115,000 N 10,070,000 ft fits only ${fit.total} systems, all Texas Central (${ms} ms)`);
  ok(fit.list.some((x) => x.entry.code === 2277), 'Texas Central (2277) is among them');
  const p0 = fit.list.find((x) => x.entry.code === 2277), pyll = py([{ op: 'inv', code: 2277, pts: [[3115000, 10070000]] }])[0].pts[0];
  ok(Math.abs(p0.lon - pyll[0]) < 1e-6 && Math.abs(p0.lat - pyll[1]) < 1e-6, `and its lat/long there matches PROJ (${p0.lat.toFixed(6)}, ${p0.lon.toFixed(6)})`);
  ok(K.systemsThatFit({ x: 3115000, y: 10070000 }, 'm').list.every((x) => x.entry.unit === 'm'), 'a metre project lists metre systems only');
  ok(K.systemsThatFit({ x: 1e12, y: 1e12 }, 'ft').total === 0, 'coordinates no system can hold fit nothing');
  ok(K.systemsThatFit(null, 'ft').total === 0 && K.systemsThatFit({ x: NaN, y: 1 }, 'ft').total === 0, 'no point → nothing');
  const fitM = K.systemsThatFit({ x: 621000, y: 3354000 }, 'm', { limit: 500 });
  ok(fitM.list.some((x) => x.entry.code === 32614 || x.entry.code === 26914), `UTM 14N metres fits (${fitM.total} systems, UTM zones of many datums)`);
}

section('words, lat/long text and parsing');
{
  ok(K.areaWords([-106.66, 29.78, -93.5, 32.27]) === 'Latitude 29.78° N to 32.27° N, longitude 106.66° W to 93.50° W', 'area in words');
  ok(K.areaWords([-180, -90, 180, 90]) === 'The whole world' && K.areaWords(null) === 'Not stated', 'whole world / not stated');
  ok(/not known/.test(K.shiftWords({ code: 1, name: 'X / Y', shiftAccuracy: null })), 'unknown shift accuracy is said plainly');
  ok(/a few meters/.test(K.shiftWords(C.byCode(2277))), 'NAD83 = WGS 84 to "a few meters"');
  ok(/2 m/.test(K.shiftWords(C.byCode(27700))), 'British National Grid: EPSG\'s 2 m');
  ok(/WGS 84 itself/.test(K.shiftWords(C.byCode(32614))), 'WGS 84 UTM: no shift');
  ok(/\.prj/.test(K.shiftWords({ code: null, name: 'Site grid', proj4: 'PROJCS[…]' })), 'a .prj system says the file decides');
  const d = K.describe(C.crsFromEntry(C.byCode(2277)));
  ok(d.code === 2277 && d.unit === 'US survey feet' && /Latitude/.test(d.area) && /Grid/.test(d.local), 'describe() for the dialog');
  ok(/Ground/.test(K.describe({ ...C.crsFromEntry(C.byCode(2277)), local: C.groundLocal(0.99987, [0, 0]) }).local), 'describe() names a ground system');
  ok(K.latLonText(-97.7, 30.3) === '30°18′00.00″ N  97°42′00.00″ W', 'DMS: ' + K.latLonText(-97.7, 30.3));
  ok(K.latLonText(151.2093, -33.8688, 'dd') === '33.868800° S  151.209300° E', 'decimal: ' + K.latLonText(151.2093, -33.8688, 'dd'));
  ok(K.latLonText(-0.0000001, 59.99999999) === '60°00′00.00″ N  0°00′00.00″ W', 'seconds round up into minutes and degrees');
  ok(K.latLonText(NaN, 1) === '', 'NaN → empty');
  const eq = (a, b) => a && b && Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
  ok(eq(K.parseLatLon('30.3, -97.7'), [-97.7, 30.3]), 'parse "30.3, -97.7"');
  ok(eq(K.parseLatLon('30°18\'00"N 97°42\'00"W'), [-97.7, 30.3]), 'parse DMS with hemispheres');
  ok(eq(K.parseLatLon('N30 18 00 W97 42 00'), [-97.7, 30.3]), 'parse "N30 18 00 W97 42 00"');
  ok(eq(K.parseLatLon('97.7W, 30.3N'), [-97.7, 30.3]), 'longitude first when the letters say so');
  ok(eq(K.parseLatLon('-33.8688; 151.2093'), [151.2093, -33.8688]), 'semicolon');
  for (const bad of ['', 'junk', '95, 10', '10, 200', '30 70 00 N, 97 W', '1, 2, 3', 'N30 E97 S10', '30.3N, 97.7N'.repeat(1)]) ok(K.parseLatLon(bad) === null, `refused: "${bad}"`);
  const g = K.gridOf(C.crsFromEntry(C.byCode(2277)), -97.7, 30.3), pg = py([{ op: 'fwd', code: 2277, pts: [[-97.7, 30.3]] }])[0].pts[0];
  ok(Math.hypot(g[0] - pg[0], g[1] - pg[1]) < 0.01, `gridOf(lat/long) matches PROJ (${fmt(Math.hypot(g[0] - pg[0], g[1] - pg[1]))} ft)`);
}

section('reprojectProject: converting a project into another system');
{
  const p = new PJ.Project();
  const a = C.crsFromEntry(C.byCode(2277)), b = C.crsFromEntry(C.byCode(6588));
  p.setPoints([{ n: '1', x: 3115000, y: 10070000, z: 600, d: 'TOPO' }, { n: '2', x: 3115500, y: 10070400, z: 610, d: 'TOPO' }, { n: '3', x: 3115200, y: 10070900, z: 605, d: 'TOPO' }], 'x.csv');
  p.change('design', (s) => { s.crs = a; s.alignments.push({ id: 'a1', name: 'A', start: 0, pis: [{ x: 3115000, y: 10070000, r: 0 }, { x: 3115400, y: 10070300, r: 0 }], pvis: [], corridor: null }); s.pads.push({ id: 'p1', name: 'P', pts: [{ x: 3115100, y: 10070100 }, { x: 3115200, y: 10070100 }, { x: 3115200, y: 10070200 }], z: 600, cut: 2, fill: 2 }); });
  const map = C.frame(b).from(a);
  let res = null;
  p.editPoints('Convert to ' + b.name, (pts, s) => { res = K.reprojectProject(s, pts, map); if (res.refused) return null; s.crs = b; return res.points; });
  const want = map(3115000, 10070000);
  ok(!res.refused && Math.hypot(p.points[0].x - want[0], p.points[0].y - want[1]) < 1e-9 && p.state.alignments[0].pis[0].x === want[0] && p.state.crs.code === 6588, `points, PIs and pads converted (${res.moved} coordinates)`);
  ok(p.undo() && p.points[0].x === 3115000 && p.state.crs.code === 2277 && p.state.alignments[0].pis[0].x === 3115000, 'one undo step puts every coordinate and the system back');
  p.state.surface.tin = { pts: [{ x: 1, y: 2, z: 3 }], faces: [] };
  const r2 = K.reprojectProject(p.state, p.points, map);
  ok(!!r2.refused && r2.points === p.points, 'a LandXML TIN is refused with the reason');
  let e = null; try { K.reprojectProject({ surface: {} }, [{ n: '9', x: 1, y: 2 }], () => [NaN, 1]); } catch (x) { e = x; }
  ok(!!e && /Point 9/.test(e.message), 'a coordinate the system cannot convert stops the conversion');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
