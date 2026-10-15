/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: data. Item names, descriptions and attribute values are written into library items and drawings as
   they are (English, like every item in the library); the apps label their own controls in their language. */
/**
 * items.js — steel sections and standard parts as "CadCraft library item" format 1 documents (docs/LIBRARY-SPEC.md §1;
 * 0.5 MQ.3 / MQ.4). DOM-free; imports only sections.js and parts.js beside it. The same code makes CadCraft's Standard tab
 * items (in the page) and the public library repo's items/standard-parts/ (tools/make-standard-parts.mjs), so a part
 * placed from either is drawn the same. Edit lib/shapes/items.js only; tools/shapes/sync.mjs copies it.
 *
 *   sectionItem(sec, { view: 'section'|'elevation', length (mm) })  → item (partial: no uuid / version / license)
 *   partItem(part)                                                  → item (part = parts.js makePart(…).part)
 *   localItem(item)        the item + license CC0 (holder CadCraft) + provenance { library: 'standard' }, for placing
 *                          straight from the page (no library round trip)
 *   PART_TAGS              the attributes every item here carries in source_attrs (CadCraft makes them block attributes):
 *                          CC-PART-TYPE, CC-PART-STD, CC-PART-SIZE, CC-PART-LENGTH (mm, members and fasteners),
 *                          CC-PART-MATERIAL (editable on a placed block)
 *   memberLoops(sec)       the section's outline loops (mm, centred), what CadCraft's 3D member sweeps
 *
 * Drawings (mm, the item's plan; no name text, as the library's own items): layers PART / STEEL (object lines),
 * …-THIN (thin: thread roots, ring faces), …-CENTER (centre lines), …-HIDDEN (hidden lines), …-FILL (the section's light
 * fill). Library previews and CadCraft pick each layer's line type from its name (layerLinetype). Sections: the outline at
 * its centre (insertion point = the middle of the bounding box); elevations: the member along +X from the insertion point
 * at the middle of its left end. Fasteners and pins: side view, the bearing face of the head at the insertion point;
 * nuts, washers, bearings, gears: face view about their axis; keys: top view, centred.
 */

import { SECTION_SOURCES, outline, bbox, exactArea, STEEL_DENSITY } from './sections.js';
import { findFamily } from './parts.js';

export const PART_TAGS = { type: 'CC-PART-TYPE', std: 'CC-PART-STD', size: 'CC-PART-SIZE', length: 'CC-PART-LENGTH', material: 'CC-PART-MATERIAL' };
export const CC0 = { id: 'CC0-1.0', holder: 'CadCraft', url: 'https://creativecommons.org/publicdomain/zero/1.0/' };

const r3 = (v) => Math.round(v * 1000) / 1000;
const r1 = (v) => Math.round(v * 10) / 10;
const kgm = (v) => Math.round(v * 100) / 100;
const num = (v) => String(Number(Number(v).toFixed(2))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const P = (pts) => pts.map(([x, y, b]) => (b ? [r3(x), r3(y), r3(b)] : [r3(x), r3(y)]));
const FAMILY_TYPE = { W: 'W shape', S: 'S shape', C: 'Channel', L: 'Angle', HSS: 'Hollow structural section', Pipe: 'Pipe', IPE: 'IPE beam', HEA: 'HEA beam', HEB: 'HEB beam', UPN: 'UPN channel' };

function layers(prefix) {
  return [{ name: prefix, color: 7 }, { name: prefix + '-THIN', color: 8 }, { name: prefix + '-CENTER', color: 1 }, { name: prefix + '-HIDDEN', color: 4 }, { name: prefix + '-FILL', color: 254 }];
}
function drawer(prefix) {
  const ents = [];
  const L = (k) => (k ? prefix + '-' + k : prefix);
  return {
    ents,
    line: (x1, y1, x2, y2, k = '') => ents.push({ type: 'line', layer: L(k), color: null, x1: r3(x1), y1: r3(y1), x2: r3(x2), y2: r3(y2) }),
    poly: (pts, closed = true, k = '') => ents.push({ type: 'poly', layer: L(k), color: null, pts: P(pts), closed }),
    circle: (x, y, r, k = '') => ents.push({ type: 'circle', layer: L(k), color: null, x: r3(x), y: r3(y), r: r3(r) }),
    arc: (x, y, r, a0, a1, k = '') => ents.push({ type: 'arc', layer: L(k), color: null, x: r3(x), y: r3(y), r: r3(r), a0, a1 }),
    fill: (loops) => ents.push({ type: 'hatch', layer: L('FILL'), color: null, solid: true, loops: loops.map((l) => l.flatMap(([x, y]) => [r3(x), r3(y)])) }),
    cross: (x, y, a, b = a) => { ents.push({ type: 'line', layer: L('CENTER'), color: null, x1: r3(x - a), y1: r3(y), x2: r3(x + a), y2: r3(y) }); ents.push({ type: 'line', layer: L('CENTER'), color: null, x1: r3(x), y1: r3(y - b), x2: r3(x), y2: r3(y + b) }); },
  };
}

function item({ name, description, plan, params, attrs }) {
  return {
    format: 'cadcraft-library-item', format_version: 1, name, kind: 'detail', category: 'details/generic', description,
    maker: '', model: '', plan, body: null, params, source_attrs: attrs,
  };
}

/** The section's outline loops (mm), centred on its bounding box: what a 3D member sweeps. */
export const memberLoops = (sec) => outline(sec, 8);

const secDims = (s) => {
  const mm = (v) => r1(v) + '';
  switch (s.kind) {
    case 'I': case 'C': return 'd ' + mm(s.d) + ', bf ' + mm(s.bf) + ', tw ' + mm(s.tw) + ', tf ' + mm(s.tf) + (s.r ? ', r ' + mm(s.r) : '') + ' mm';
    case 'L': return 'legs ' + mm(s.h ?? s.b) + ' × ' + mm(s.b) + ', t ' + mm(s.t) + ' mm';
    case 'RHS': return mm(s.h) + ' × ' + mm(s.b) + ' mm, wall ' + mm(s.t) + ' mm (design)';
    case 'CHS': return 'OD ' + mm(s.D) + ' mm, wall ' + mm(s.t) + ' mm (design)';
    default: return '';
  }
};

/** A steel section as a library item: its section view, or an elevation `length` mm long. */
export function sectionItem(sec, { view = 'section', length = 3000 } = {}) {
  const src = SECTION_SOURCES[sec.source];
  const loops = outline(sec, 8);
  const bb = bbox(loops[0]);
  const d = drawer('STEEL');
  const massM = sec.massPub ?? exactArea(sec) * 1e-6 * STEEL_DENSITY;
  const type = FAMILY_TYPE[sec.family] || sec.family;
  const attrs = { [PART_TAGS.type]: type, [PART_TAGS.std]: src.title, [PART_TAGS.size]: sec.name, [PART_TAGS.material]: '' };
  const how = sec.kind === 'I' && sec.r ? '' : sec.kind === 'I' || sec.kind === 'C' ? ' Drawn with parallel flanges and square corners.' : sec.kind === 'L' ? ' Drawn with square corners.' : '';
  if (view === 'elevation') {
    const Lm = Number(length);
    if (!(Lm > 0 && Lm <= 1e6)) throw new Error('length out of range');
    const h = bb.h / 2, e = Math.min(Lm * 0.04, Math.max(10, h * 0.5));
    d.poly([[0, -h], [Lm, -h], [Lm, h], [0, h]]);
    if (sec.kind === 'I' || sec.kind === 'C') for (const s of [1, -1]) d.line(0, s * (h - sec.tf), Lm, s * (h - sec.tf));
    if (sec.kind === 'L') d.line(0, -h + sec.t, Lm, -h + sec.t);
    if (sec.kind === 'RHS' || sec.kind === 'CHS') for (const s of [1, -1]) d.line(0, s * (h - sec.t), Lm, s * (h - sec.t), 'HIDDEN');
    d.line(-e, 0, Lm + e, 0, 'CENTER');
    attrs[PART_TAGS.length] = String(r1(Lm));
    return item({
      name: sec.name + ' elevation, ' + num(Lm) + ' mm',
      description: sec.name + ' (' + type + ') from the ' + src.title + ': ' + secDims(sec) + '; ' + kgm(massM) + ' kg/m. Side elevation, ' + num(Lm) + ' mm long, from the middle of the left end.' + how,
      plan: { layers: layers('STEEL'), entities: d.ents },
      params: { width: r1(Lm), depth: r1(bb.h), weight_kg: Math.round(massM * Lm / 1000 * 100) / 100, remarks: kgm(massM) + ' kg/m' },
      attrs,
    });
  }
  d.fill(loops);
  for (const l of loops) d.poly(l);
  d.cross(0, 0, bb.w / 2 + Math.max(5, bb.w * 0.12), bb.h / 2 + Math.max(5, bb.h * 0.12));
  return item({
    name: sec.name + ' section',
    description: sec.name + ' (' + type + ') from the ' + src.title + ': ' + secDims(sec) + '; ' + kgm(massM) + ' kg/m. Cross-section at its centre.' + how,
    plan: { layers: layers('STEEL'), entities: d.ents },
    params: { width: r1(bb.w), depth: r1(bb.h), remarks: kgm(massM) + ' kg/m' },
    attrs,
  });
}

const DRAW = {
  bolt(d, p) {
    const { d: D, s, e, k, l, b, P: pitch } = p.dims;
    // head across corners, its three visible faces
    d.poly([[-e / 2, 0], [e / 2, 0], [e / 2, k], [-e / 2, k]]);
    for (const x of [-e / 4, e / 4]) d.line(x, 0, x, k);
    // shank with a 45° end chamfer of one pitch
    const c = Math.min(pitch, D / 4);
    d.poly([[-D / 2, 0], [-D / 2, -l + c], [-D / 2 + c, -l], [D / 2 - c, -l], [D / 2, -l + c], [D / 2, 0]], false);
    // ISO 6410: thread root thin, thread limit thick
    const d3 = D - 1.22687 * pitch, yTop = b >= l ? -Math.min(2 * pitch, l / 4) : -(l - b);   // threaded to the head: up to the run-out
    for (const x of [-d3 / 2, d3 / 2]) d.line(x, -l + c, x, yTop, 'THIN');
    if (b < l) d.line(-D / 2, yTop, D / 2, yTop);
    d.line(0, k + 3, 0, -l - 3, 'CENTER');
  },
  nut(d, p) {
    const { d: D, s, e, P: pitch } = p.dims;
    const hex = [];
    for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; hex.push([e / 2 * Math.cos(a), e / 2 * Math.sin(a)]); }
    d.poly(hex);
    d.circle(0, 0, 0.95 * s / 2, 'THIN');                      // the chamfer circle on the bearing face
    d.circle(0, 0, (D - 1.0825 * pitch) / 2);                  // minor diameter, thick
    d.arc(0, 0, D / 2, 100, 10, 'THIN');                       // major diameter, a thin three-quarter arc (ISO 6410)
    d.cross(0, 0, e / 2 + 3);
  },
  washer(d, p) {
    const { d1, d2 } = p.dims;
    d.circle(0, 0, d2 / 2); d.circle(0, 0, d1 / 2); d.cross(0, 0, d2 / 2 + 3);
  },
  pin(d, p) {
    const { d: D, c, l } = p.dims, a = l / 2, h = D / 2;
    d.poly([[-a + c, -h], [a - c, -h], [a, -h + c], [a, h - c], [a - c, h], [-a + c, h], [-a, h - c], [-a, -h + c]]);
    for (const x of [-a + c, a - c]) d.line(x, -h, x, h, 'THIN');
    d.line(-a - 3, 0, a + 3, 0, 'CENTER');
  },
  bearing(d, p) {
    const { d: di, D } = p.dims, w = (D - di) / 2;
    d.circle(0, 0, D / 2); d.circle(0, 0, di / 2);
    d.circle(0, 0, D / 2 - 0.3 * w, 'THIN'); d.circle(0, 0, di / 2 + 0.3 * w, 'THIN');   // the rings' shoulders (simplified)
    d.circle(0, 0, (D + di) / 4, 'CENTER');                                               // ball pitch circle
    d.cross(0, 0, D / 2 + 3);
  },
  key(d, p) {
    const { b, l } = p.dims, x = l / 2 - b / 2, y = b / 2;
    d.poly([[-x, -y, 0], [x, -y, 1], [x, y, 0], [-x, y, 1]]);
    d.line(-l / 2 - 3, 0, l / 2 + 3, 0, 'CENTER');
  },
  gear(d, p) {
    const { da, d: dp, df, bore } = p.dims;
    d.circle(0, 0, da / 2); d.circle(0, 0, dp / 2, 'CENTER'); d.circle(0, 0, df / 2, 'THIN');
    if (bore > 0) d.circle(0, 0, bore / 2);
    d.cross(0, 0, da / 2 + 3);
  },
};
const DRAW_OF = { 'hex-screw': 'bolt', 'hex-bolt': 'bolt', 'hex-nut': 'nut', washer: 'washer', pin: 'pin', bearing: 'bearing', key: 'key', gear: 'gear' };

function partDims(p) {
  const x = p.dims, mm = (v) => r1(v) + ' mm';
  switch (p.type) {
    case 'hex-screw': case 'hex-bolt': return 'thread ' + (p.units === 'in' ? p.size + ' in, ' + x.tpi + ' threads per inch' : 'M' + x.d + ' × ' + x.P) + ', across flats ' + mm(x.s) + ', head ' + mm(x.k) + ', length ' + mm(x.l) + (x.b < x.l ? ', thread ' + mm(x.b) : ', threaded to the head');
    case 'hex-nut': return 'thread ' + (p.units === 'in' ? p.size + ' in, ' + x.tpi + ' threads per inch' : 'M' + x.d + ' × ' + x.P) + ', across flats ' + mm(x.s) + ', height ' + mm(x.m);
    case 'washer': return 'inside ' + mm(x.d1) + ', outside ' + mm(x.d2) + ', thickness ' + mm(x.h);
    case 'pin': return 'diameter ' + mm(x.d) + ', length ' + mm(x.l);
    case 'bearing': return 'bore ' + mm(x.d) + ', outside ' + mm(x.D) + ', width ' + mm(x.B);
    case 'key': return x.b + ' × ' + x.h + ' mm, length ' + mm(x.l) + ', for shafts ' + x.shaft[0] + '–' + x.shaft[1] + ' mm (keyseat depth ' + x.t1 + ' mm in the shaft, ' + x.t2 + ' mm in the hub)';
    case 'gear': return 'module ' + x.m + ', ' + x.z + ' teeth, 20° pressure angle, pitch diameter ' + mm(x.d) + ', tip ' + mm(x.da) + ', root ' + mm(x.df) + ', face width ' + mm(x.width) + (x.bore ? ', bore ' + mm(x.bore) : '');
    default: return '';
  }
}
const VIEW_TEXT = {
  bolt: 'Side view across corners; thread drawn by the ISO 6410 convention.', nut: 'Face view; thread drawn by the ISO 6410 convention.',
  washer: 'Face view.', pin: 'Side view.', bearing: 'Face view, simplified (rings and ball pitch circle).', key: 'Top view (form A, round ends).',
  gear: 'Face view by the drawing convention: tip circle, pitch circle as a centre line, root circle thin; teeth not drawn one by one.',
};

/** A standard part (parts.js makePart(…).part) as a library item. */
export function partItem(p) {
  const fam = findFamily(p.family);
  const how = DRAW_OF[p.type];
  const d = drawer('PART');
  DRAW[how](d, p);
  const attrs = { [PART_TAGS.type]: p.name, [PART_TAGS.std]: p.standard, [PART_TAGS.size]: p.sizeText, [PART_TAGS.material]: p.material };
  if (p.dims.l) attrs[PART_TAGS.length] = String(r1(p.dims.l));
  const params = { width: r1(p.box.w), depth: r1(p.box.d), height: r1(p.box.h) };
  if (p.massKg) params.weight_kg = p.massKg;
  const ref = p.type === 'gear' ? 'Modules from ISO 54:1996, tooth form from the ISO 53:1998 basic rack.' : 'Dimensions from ' + p.standardTitle.split(' ').slice(0, 2).join(' ') + '.';
  return item({
    name: fam.name + ' ' + p.designation,
    description: (fam.name + ', ' + partDims(p) + '. ' + VIEW_TEXT[how] + ' ' + ref + (p.massKg ? ' Weight from the nominal shape in steel (7850 kg/m³), threads not taken off.' : '')).slice(0, 500),
    plan: { layers: layers('PART'), entities: d.ents },
    params,
    attrs,
  });
}

/** The item ready to place from the page: CC0, credited to CadCraft and to the table it comes from. */
export function localItem(it) {
  const src = it.source_attrs?.[PART_TAGS.std] || '';
  return {
    ...it,
    license: { ...CC0, attribution: '“' + it.name + '” by CadCraft' + (src ? ', dimensions from ' + src : '') + ', CC0 1.0' },
    provenance: { library: 'standard' },
  };
}
