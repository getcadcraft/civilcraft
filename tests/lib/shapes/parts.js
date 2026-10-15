/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: data. Part names, designations, standard titles and materials are written into drawings, library items
   and part files as they are (English, like the library's items); each app labels its own controls in its language. */
/**
 * parts.js — mechanical standard parts from public standard tables (0.5 MQ.4). DOM-free, imports nothing. The one copy
 * that is edited is lib/shapes/parts.js; `node tools/shapes/sync.mjs` copies it byte for byte into cadcraft/dev/shapes/,
 * partcraft/dev/shapes/ and the library repo's tools/shapes/, and `--check` fails when a copy differs.
 *
 * Only the numbers are taken from each standard (dimensions are facts), never its text, figures or layout. Each table was
 * checked against a second, independent open table (the FreeCAD Fasteners Workbench data files) where one exists, and
 * bin/test-shapes.mjs checks the relations each standard builds its tables on (across-corners from across-flats, thread
 * length rules, bearing series, key sizes by shaft range).
 *
 *   ISO 4014:2022  hexagon head bolts (partly threaded), M5–M36: d, P (coarse pitch, ISO 261), s, k; thread length b by
 *                  the standard's rule (2d + 6 up to l = 125, 2d + 12 up to 200, 2d + 25 beyond).
 *   ISO 4017:2022  hexagon head screws (threaded to the head), M5–M36: d, P, s, k.
 *   ISO 4032:2023  hexagon regular nuts (style 1), M5–M36: d, P, s, m (max).
 *   ISO 7089:2000  plain washers, normal series, grade A, sizes 5–36: d1 (min), d2 (max), h.
 *   ISO 2338:1997  parallel pins, unhardened, d 3–20: d, c (end chamfer, approx.).
 *   ISO 15:2017    deep groove ball bearings, diameter series 0, 2, 3 (60xx, 62xx, 63xx), bore 10–50: d, D, B.
 *   DIN 6885-1     parallel keys, form A (round ends), shafts 6–130 mm: b × h, shaft range, keyseat depths t1 (shaft), t2 (hub).
 *   ASME B18.2.1   hex bolts (inch), 1/4–1 in: D, UNC threads per inch (ASME B1.1), F (across flats), H (head height) basic;
 *                  thread length 2D + 1/4 in up to 6 in long, 2D + 1/2 in beyond.
 *   ASME B18.2.2   hex nuts (inch), 1/4–1 in: D, UNC threads per inch, F, H basic.
 *   ISO 54:1996    modules (series I) and ISO 53:1998 basic rack (20°, addendum 1 m, dedendum 1.25 m) for spur gears:
 *                  d = m z, da = m (z + 2), df = m (z − 2.5), db = d cos 20°. Drawn as the standard drawing convention
 *                  (tip circle, pitch circle as a centre line, root circle thin), not tooth by tooth.
 *
 * API (lengths in mm; inch families say their sizes in inches but every number here is mm):
 *   PART_STANDARDS                  id → { title, url }
 *   PART_FAMILIES                   [{ id, type, name, standard, units, material, options: [{ key, label?, unit, min, max }] }]
 *   partSizes(familyId)             [{ size, label, …dims (mm) }] in table order
 *   partOptions(familyId, size)     the default option values ({ length } / { teeth, width, bore })
 *   makePart(familyId, size, opts)  → { ok, part | error } — a part record:
 *     { family, type, name, standard, standardTitle, url, size, sizeText, designation, units, dims (mm), material, massKg|null,
 *       options, box: { w, d, h } (mm, the plan's extent and the height across) }
 *   findFamily(id) · LIBRARY_SET (the sizes published as library items: [[familyId, size, opts]…])
 */

export const STEEL_DENSITY = 7850;   // kg/m³
const IN = 25.4;

export const PART_STANDARDS = {
  'ISO 4014': { title: 'ISO 4014:2022 Fasteners — Hexagon head bolts — Product grades A and B', url: 'https://www.iso.org/standard/72579.html' },
  'ISO 4017': { title: 'ISO 4017:2022 Fasteners — Hexagon head screws — Product grades A and B', url: 'https://www.iso.org/standard/72585.html' },
  'ISO 4032': { title: 'ISO 4032:2023 Fasteners — Hexagon regular nuts (style 1)', url: 'https://www.iso.org/standard/75016.html' },
  'ISO 7089': { title: 'ISO 7089:2000 Plain washers — Normal series — Product grade A', url: 'https://www.iso.org/standard/13666.html' },
  'ISO 2338': { title: 'ISO 2338:1997 Parallel pins, of unhardened steel and austenitic stainless steel', url: 'https://www.iso.org/standard/20001.html' },
  'ISO 15': { title: 'ISO 15:2017 Rolling bearings — Radial bearings — Boundary dimensions, general plan', url: 'https://www.iso.org/standard/69977.html' },
  'DIN 6885-1': { title: 'DIN 6885-1 Drive type fastenings without taper action — Parallel keys, keyways, deep pattern', url: 'https://www.din.de/en/getting-involved/standards-committees/nam/publications/wdc-beuth:din21:346315269' },
  'ASME B18.2.1': { title: 'ASME B18.2.1 Square, hex, heavy hex and askew head bolts and hex, heavy hex, hex flange, lobed head and lag screws (inch series)', url: 'https://www.asme.org/codes-standards/find-codes-standards/b18-2-1-square-hex-heavy-hex-askew-head-bolts-hex-heavy-hex-hex-flange-lobed-head-lag-screws' },
  'ASME B18.2.2': { title: 'ASME B18.2.2-2022 Nuts for general applications: machine screw nuts, and hex, square, hex flange and coupling nuts (inch series)', url: 'https://www.asme.org/codes-standards/find-codes-standards/b18-2-2-nuts-general-applications-machine-screw-nuts-hex-square-hex-flange-coupling-nuts' },
  'ISO 54': { title: 'ISO 54:1996 Cylindrical gears for general engineering and for heavy engineering — Modules', url: 'https://www.iso.org/standard/22644.html' },
  'ISO 53': { title: 'ISO 53:1998 Cylindrical gears for general and heavy engineering — Standard basic rack tooth profile', url: 'https://www.iso.org/standard/22643.html' },
};

// ISO 4014 / 4017 / 4032 / 7089, one row per thread size: [size, d, P, s, k (bolt head), m (nut, max), d1, d2, h (washer)]
const METRIC = [
  ['M5', 5, 0.8, 8, 3.5, 4.7, 5.3, 10, 1],
  ['M6', 6, 1, 10, 4, 5.2, 6.4, 12, 1.6],
  ['M8', 8, 1.25, 13, 5.3, 6.8, 8.4, 16, 1.6],
  ['M10', 10, 1.5, 16, 6.4, 8.4, 10.5, 20, 2],
  ['M12', 12, 1.75, 18, 7.5, 10.8, 13, 24, 2.5],
  ['M16', 16, 2, 24, 10, 14.8, 17, 30, 3],
  ['M20', 20, 2.5, 30, 12.5, 18, 21, 37, 3],
  ['M24', 24, 3, 36, 15, 21.5, 25, 44, 4],
  ['M30', 30, 3.5, 46, 18.7, 25.6, 31, 56, 4],
  ['M36', 36, 4, 55, 22.5, 31, 37, 66, 5],
];
// ASME B18.2.1 hex bolts and B18.2.2 hex nuts, basic sizes in inches: [size, D, UNC tpi, F, H (bolt head), H (nut)]
const INCH = [
  ['1/4', 1 / 4, 20, 7 / 16, 11 / 64, 7 / 32],
  ['5/16', 5 / 16, 18, 1 / 2, 7 / 32, 17 / 64],
  ['3/8', 3 / 8, 16, 9 / 16, 1 / 4, 21 / 64],
  ['7/16', 7 / 16, 14, 5 / 8, 19 / 64, 3 / 8],
  ['1/2', 1 / 2, 13, 3 / 4, 11 / 32, 7 / 16],
  ['5/8', 5 / 8, 11, 15 / 16, 27 / 64, 35 / 64],
  ['3/4', 3 / 4, 10, 9 / 8, 1 / 2, 41 / 64],
  ['7/8', 7 / 8, 9, 21 / 16, 37 / 64, 3 / 4],
  ['1', 1, 8, 3 / 2, 43 / 64, 55 / 64],
];
// ISO 2338: [d, c]
const PINS = [[3, 0.5], [4, 0.63], [5, 0.8], [6, 1.2], [8, 1.6], [10, 2], [12, 2.5], [16, 3], [20, 3.5]];
// ISO 15: [designation, d, D, B]
const BEARINGS = [
  ['6000', 10, 26, 8], ['6001', 12, 28, 8], ['6002', 15, 32, 9], ['6003', 17, 35, 10], ['6004', 20, 42, 12], ['6005', 25, 47, 12],
  ['6006', 30, 55, 13], ['6007', 35, 62, 14], ['6008', 40, 68, 15], ['6009', 45, 75, 16], ['6010', 50, 80, 16],
  ['6200', 10, 30, 9], ['6201', 12, 32, 10], ['6202', 15, 35, 11], ['6203', 17, 40, 12], ['6204', 20, 47, 14], ['6205', 25, 52, 15],
  ['6206', 30, 62, 16], ['6207', 35, 72, 17], ['6208', 40, 80, 18], ['6209', 45, 85, 19], ['6210', 50, 90, 20],
  ['6300', 10, 35, 11], ['6301', 12, 37, 12], ['6302', 15, 42, 13], ['6303', 17, 47, 14], ['6304', 20, 52, 15], ['6305', 25, 62, 17],
  ['6306', 30, 72, 19], ['6307', 35, 80, 21], ['6308', 40, 90, 23], ['6309', 45, 100, 25], ['6310', 50, 110, 27],
];
// DIN 6885-1 form A: [b, h, shaft from, shaft to, t1 (shaft), t2 (hub)]
const KEYS = [
  [2, 2, 6, 8, 1.2, 1], [3, 3, 8, 10, 1.8, 1.4], [4, 4, 10, 12, 2.5, 1.8], [5, 5, 12, 17, 3, 2.3], [6, 6, 17, 22, 3.5, 2.8],
  [8, 7, 22, 30, 4, 3.3], [10, 8, 30, 38, 5, 3.3], [12, 8, 38, 44, 5, 3.3], [14, 9, 44, 50, 5.5, 3.8], [16, 10, 50, 58, 6, 4.3],
  [18, 11, 58, 65, 7, 4.4], [20, 12, 65, 75, 7.5, 4.9], [22, 14, 75, 85, 9, 5.4], [25, 14, 85, 95, 9, 5.4], [28, 16, 95, 110, 10, 6.4],
  [32, 18, 110, 130, 11, 7.4],
];
// ISO 54 series I modules (mm)
const MODULES = [0.5, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
// ISO 888 preferred nominal lengths (mm), used for the default lengths
const R_LENGTHS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 36, 40, 45, 50, 55, 56, 60, 63, 65, 70, 80, 90, 100, 110, 120, 125, 130, 140, 150, 160, 180, 200, 220, 240, 250, 260, 280, 300];
const KEY_LENGTHS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40, 45, 50, 56, 63, 70, 80, 90, 100, 110, 125, 140, 160, 180, 200, 220, 250, 280, 320, 360, 400];
const near = (list, v) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), list[0]);
const INCH_LENGTHS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 10, 12];

export const PART_FAMILIES = [
  { id: 'iso4017', type: 'hex-screw', name: 'Hex head screw', standard: 'ISO 4017', units: 'mm', material: 'Steel, property class 8.8',
    options: [{ key: 'length', unit: 'mm', min: 4, max: 500 }] },
  { id: 'iso4014', type: 'hex-bolt', name: 'Hex bolt', standard: 'ISO 4014', units: 'mm', material: 'Steel, property class 8.8',
    options: [{ key: 'length', unit: 'mm', min: 20, max: 500 }] },
  { id: 'iso4032', type: 'hex-nut', name: 'Hex nut', standard: 'ISO 4032', units: 'mm', material: 'Steel, property class 8', options: [] },
  { id: 'iso7089', type: 'washer', name: 'Plain washer', standard: 'ISO 7089', units: 'mm', material: 'Steel, 200 HV', options: [] },
  { id: 'asme-hex-bolt', type: 'hex-bolt', name: 'Hex bolt', standard: 'ASME B18.2.1', units: 'in', material: 'Steel',
    options: [{ key: 'length', unit: 'in', min: 0.25, max: 24 }] },
  { id: 'asme-hex-nut', type: 'hex-nut', name: 'Hex nut', standard: 'ASME B18.2.2', units: 'in', material: 'Steel', options: [] },
  { id: 'iso2338', type: 'pin', name: 'Parallel pin', standard: 'ISO 2338', units: 'mm', material: 'Steel, unhardened',
    options: [{ key: 'length', unit: 'mm', min: 4, max: 300 }] },
  { id: 'iso15', type: 'bearing', name: 'Deep groove ball bearing', standard: 'ISO 15', units: 'mm', material: 'Bearing steel', options: [] },
  { id: 'din6885', type: 'key', name: 'Parallel key', standard: 'DIN 6885-1', units: 'mm', material: 'Steel, key steel',
    options: [{ key: 'length', unit: 'mm', min: 4, max: 800 }] },
  { id: 'spur-gear', type: 'gear', name: 'Spur gear', standard: 'ISO 54', units: 'mm', material: 'Steel',
    options: [{ key: 'teeth', unit: '', min: 6, max: 400, integer: true }, { key: 'width', unit: 'mm', min: 1, max: 1000 }, { key: 'bore', unit: 'mm', min: 0, max: 5000 }] },
];
export const findFamily = (id) => PART_FAMILIES.find((f) => f.id === id) || null;

/** Sizes of a family: [{ size, label, …dims in mm }]. */
export function partSizes(id) {
  switch (id) {
    case 'iso4014': case 'iso4017':
      return METRIC.map(([size, d, P, s, k]) => ({ size, label: size, d, P, s, k }));
    case 'iso4032': return METRIC.map(([size, d, P, s, , m]) => ({ size, label: size, d, P, s, m }));
    case 'iso7089': return METRIC.map(([size, d, , , , , d1, d2, h]) => ({ size: String(d), label: String(d), thread: size, d1, d2, h }));
    case 'asme-hex-bolt': return INCH.map(([size, D, tpi, F, H]) => ({ size, label: size + '-' + tpi + ' UNC', d: D * IN, tpi, P: IN / tpi, s: F * IN, k: H * IN }));
    case 'asme-hex-nut': return INCH.map(([size, D, tpi, F, , Hn]) => ({ size, label: size + '-' + tpi + ' UNC', d: D * IN, tpi, P: IN / tpi, s: F * IN, m: Hn * IN }));
    case 'iso2338': return PINS.map(([d, c]) => ({ size: String(d), label: String(d), d, c }));
    case 'iso15': return BEARINGS.map(([size, d, D, B]) => ({ size, label: size, d, D, B }));
    case 'din6885': return KEYS.map(([b, h, s0, s1, t1, t2]) => ({ size: b + 'x' + h, label: b + ' × ' + h, b, h, shaft: [s0, s1], t1, t2 }));
    case 'spur-gear': return MODULES.map((m) => ({ size: 'm' + m, label: 'm ' + m, m }));
    default: return [];
  }
}

/** Default options for a size (a typical length; for gears 20 teeth, a face width of 10 m and a bore about a third of the root). */
export function partOptions(id, size) {
  const z = partSizes(id).find((x) => x.size === size);
  if (!z) return {};
  switch (id) {
    case 'iso4017': return { length: near(R_LENGTHS, 4 * z.d) };
    case 'iso4014': return { length: near(R_LENGTHS, Math.max(6 * z.d, 2 * z.d + 6 + 10)) };
    case 'asme-hex-bolt': return { length: near(INCH_LENGTHS, 4 * z.d / IN) };
    case 'iso2338': return { length: near(R_LENGTHS, 5 * z.d) };
    case 'din6885': return { length: near(KEY_LENGTHS, 4 * z.b) };
    case 'spur-gear': { const teeth = 20; return { teeth, width: 10 * z.m, bore: Math.max(0, Math.round(z.m * (teeth - 2.5) / 3)) }; }
    default: return {};
  }
}

const fmt = (v) => String(Number(Number(v).toFixed(3)));
const inchText = (v) => {   // 1.5 → "1-1/2", 0.75 → "3/4" (to 1/64)
  const n = Math.round(v * 64), w = Math.floor(n / 64);
  let num = n - w * 64, den = 64;
  while (num && num % 2 === 0) { num /= 2; den /= 2; }
  return num ? (w ? w + '-' : '') + num + '/' + den : String(w);
};
const hexArea = (s) => (Math.sqrt(3) / 2) * s * s;
const kg = (mm3) => Number((mm3 * 1e-9 * STEEL_DENSITY).toFixed(4));

/** A part record for a family, size and options, or { ok: false, error } (untrusted options: numbers are checked). */
export function makePart(id, size, opts = {}) {
  const fam = findFamily(id);
  if (!fam) return { ok: false, error: 'unknown family' };
  const z = partSizes(id).find((x) => x.size === String(size));
  if (!z) return { ok: false, error: 'unknown size' };
  const o = { ...partOptions(id, z.size) };
  for (const spec of fam.options) {
    if (opts[spec.key] === undefined || opts[spec.key] === null || opts[spec.key] === '') continue;
    const v = Number(opts[spec.key]);
    if (!Number.isFinite(v) || v < spec.min || v > spec.max || (spec.integer && !Number.isInteger(v))) return { ok: false, error: 'bad ' + spec.key, key: spec.key };
    o[spec.key] = v;
  }
  const std = PART_STANDARDS[fam.standard];
  const base = { family: id, type: fam.type, name: fam.name, standard: fam.standard, standardTitle: std.title, url: std.url, size: z.size, units: fam.units, material: fam.material, options: o };
  let dims, designation, sizeText, mass = null, box;
  switch (id) {
    case 'iso4017': case 'iso4014': {
      const l = o.length;
      if (!(l > z.k)) return { ok: false, error: 'bad length', key: 'length' };
      const b = id === 'iso4014' ? (l <= 125 ? 2 * z.d + 6 : l <= 200 ? 2 * z.d + 12 : 2 * z.d + 25) : l;
      if (id === 'iso4014' && !(b < l)) return { ok: false, error: 'bad length', key: 'length' };
      dims = { d: z.d, P: z.P, s: z.s, e: z.s * 2 / Math.sqrt(3), k: z.k, l, b };
      sizeText = z.size + ' × ' + fmt(l);
      designation = fam.standard + ' ' + sizeText;
      mass = kg(hexArea(z.s) * z.k + Math.PI / 4 * z.d * z.d * l);
      box = { w: dims.e, d: z.k + l, h: z.s };
      break;
    }
    case 'asme-hex-bolt': {
      const lin = o.length, l = lin * IN;
      dims = { d: z.d, P: z.P, tpi: z.tpi, s: z.s, e: z.s * 2 / Math.sqrt(3), k: z.k, l, b: Math.min(l, (lin <= 6 ? 2 * z.d / IN + 0.25 : 2 * z.d / IN + 0.5) * IN) };
      sizeText = z.label + ' × ' + inchText(lin) + ' in';
      designation = sizeText + ', ' + fam.standard;
      mass = kg(hexArea(z.s) * z.k + Math.PI / 4 * z.d * z.d * l);
      box = { w: dims.e, d: z.k + l, h: z.s };
      break;
    }
    case 'iso4032': case 'asme-hex-nut': {
      dims = { d: z.d, P: z.P, s: z.s, e: z.s * 2 / Math.sqrt(3), m: z.m, ...(z.tpi ? { tpi: z.tpi } : {}) };
      sizeText = id === 'iso4032' ? z.size : z.label;
      designation = id === 'iso4032' ? fam.standard + ' ' + z.size : z.label + ', ' + fam.standard;
      mass = kg((hexArea(z.s) - Math.PI / 4 * z.d * z.d) * z.m);
      box = { w: dims.e, d: dims.e, h: z.m };
      break;
    }
    case 'iso7089':
      dims = { d1: z.d1, d2: z.d2, h: z.h };
      sizeText = z.size;
      designation = fam.standard + ' ' + z.size;
      mass = kg(Math.PI / 4 * (z.d2 * z.d2 - z.d1 * z.d1) * z.h);
      box = { w: z.d2, d: z.d2, h: z.h };
      break;
    case 'iso2338': {
      const l = o.length;
      if (!(l > 2 * z.c)) return { ok: false, error: 'bad length', key: 'length' };
      dims = { d: z.d, c: z.c, l };
      sizeText = z.size + ' × ' + fmt(l);
      designation = fam.standard + ' ' + sizeText;
      mass = kg(Math.PI / 4 * z.d * z.d * l);
      box = { w: z.d, d: l, h: z.d };
      break;
    }
    case 'iso15':
      dims = { d: z.d, D: z.D, B: z.B };
      sizeText = z.size + ' (' + z.d + ' × ' + z.D + ' × ' + z.B + ')';
      designation = sizeText;
      box = { w: z.D, d: z.D, h: z.B };
      break;
    case 'din6885': {
      const l = o.length;
      if (!(l > z.b)) return { ok: false, error: 'bad length', key: 'length' };
      dims = { b: z.b, h: z.h, l, t1: z.t1, t2: z.t2, shaft: z.shaft };
      sizeText = 'A ' + z.b + ' × ' + z.h + ' × ' + fmt(l);
      designation = fam.standard + ' ' + sizeText;
      mass = kg((z.b * (l - z.b) + Math.PI / 4 * z.b * z.b) * z.h);
      box = { w: l, d: z.b, h: z.h };
      break;
    }
    case 'spur-gear': {
      const m = z.m, teeth = o.teeth, d = m * teeth, da = m * (teeth + 2), df = m * (teeth - 2.5);
      if (!(o.bore < df)) return { ok: false, error: 'bad bore', key: 'bore' };
      dims = { m, z: teeth, d, da, df, db: d * Math.cos(20 * Math.PI / 180), width: o.width, bore: o.bore, alpha: 20 };
      sizeText = 'm ' + fmt(m) + ', z ' + teeth + ', ' + fmt(o.width) + ' wide';
      designation = sizeText + ', ISO 53 / ISO 54';
      box = { w: da, d: da, h: o.width };
      break;
    }
  }
  return { ok: true, part: { ...base, dims, designation, sizeText, massKg: mass, box } };
}

/** The sizes published as LibraryCraft items (the library repo's tools/make-standard-parts.mjs). */
export const LIBRARY_SET = [
  ...[['M6', 20], ['M6', 40], ['M8', 25], ['M8', 50], ['M10', 30], ['M10', 60], ['M12', 40], ['M12', 80], ['M16', 50], ['M16', 100], ['M20', 60], ['M20', 120], ['M24', 80], ['M24', 150]]
    .map(([s, l]) => ['iso4017', s, { length: l }]),
  ...[['M10', 80], ['M12', 100], ['M16', 120], ['M20', 150], ['M24', 200]].map(([s, l]) => ['iso4014', s, { length: l }]),
  ...['M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24', 'M30', 'M36'].map((s) => ['iso4032', s, {}]),
  ...['6', '8', '10', '12', '16', '20', '24', '30', '36'].map((s) => ['iso7089', s, {}]),
  ...[['1/4', 1], ['3/8', 1.5], ['1/2', 2], ['5/8', 2.5], ['3/4', 3], ['1', 4]].map(([s, l]) => ['asme-hex-bolt', s, { length: l }]),
  ...INCH.map(([s]) => ['asme-hex-nut', s, {}]),
  ...[['4', 20], ['6', 30], ['8', 40], ['10', 50], ['12', 60]].map(([s, l]) => ['iso2338', s, { length: l }]),
  ...BEARINGS.map(([s]) => ['iso15', s, {}]),
  ...KEYS.map(([b, h]) => ['din6885', b + 'x' + h, {}]),
  ...[['m1', 20], ['m1', 40], ['m2', 20], ['m2', 40], ['m3', 30]].map(([s, z]) => ['spur-gear', s, { teeth: z }]),
];
