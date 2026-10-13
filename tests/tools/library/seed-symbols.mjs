#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * seed-symbols.mjs — the six generic seed items (docs/LIBRARY-SPEC.md §4.9) drawn as real plan symbols, the way a
 * foodservice consultant draws them, written as format-1 item.json files ready to publish.
 *
 *   node tools/library/seed-symbols.mjs [--out tools/library/seed] [--check]
 *
 * Data (name, category, kind, description, sizes, height, z, remarks) comes from tools/library/seed.csv through
 * libitem.js itemsFromCsv — nothing about a real maker is invented (generic items: no maker, no model). This script
 * only replaces each item's plan (and adds clearances where natural). Plans are in mm; the origin is the back centre
 * (the back is the +Y edge at y = 0, the front faces −Y). No name text inside a symbol: a tag belongs to the
 * placement, not the symbol.
 *
 * Layers follow the library's linetype-by-layer-name convention (/library/format):
 *   EQUIP          object lines (the outline the renderers draw heaviest is the one that matches the body footprint)
 *   EQUIP-DETAIL   thin lines (ribs, grates, knobs, drains)            /detail|thin|fine/i
 *   EQUIP-HIDDEN   hidden lines (undershelf, legs, oven door, above)    /hidden|dashed|above|below/i
 *   EQUIP-CENTER   centre lines                                         /center|centre/i
 *   EQUIP-SWING    door swings and service space, light dashed          /clear|swing|service/i
 *
 * Writes <out>/<key>.item.json (partial items: no uuid/version/license/provenance — the server fills them; each is
 * checked with validateItem({partial: true})) and <out>/manifest.json [{key, name, file, sha256, changelog}], which
 * bin/library-seed.php reads to publish them as new versions. --check validates and prints without writing.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const L = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/libitem.js')).href);

const args = process.argv.slice(2);
const check = args.includes('--check');
const oi = args.indexOf('--out');
const OUT = path.resolve(oi >= 0 ? args[oi + 1] : path.join(HERE, 'seed'));

const IN = 25.4;
const B90 = Math.tan(Math.PI / 8);            // bulge of a 90° arc
const r4 = (v) => Math.round(v * 10000) / 10000;
const LAYERS = [
  { name: 'EQUIP', color: 7 }, { name: 'EQUIP-DETAIL', color: 8 }, { name: 'EQUIP-HIDDEN', color: 8 },
  { name: 'EQUIP-CENTER', color: 1 }, { name: 'EQUIP-SWING', color: 8 },
];

/** A small drawing kit working in inches, writing mm entities. */
function kit() {
  const ents = [];
  const P = (x, y, b) => (b ? [r4(x * IN), r4(y * IN), r4(b)] : [r4(x * IN), r4(y * IN)]);
  return {
    ents,
    line(layer, x1, y1, x2, y2) { ents.push({ type: 'line', layer, color: null, x1: r4(x1 * IN), y1: r4(y1 * IN), x2: r4(x2 * IN), y2: r4(y2 * IN) }); },
    rect(layer, x0, y0, x1, y1) { ents.push({ type: 'poly', layer, color: null, pts: [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], closed: true }); },
    /** Rounded rectangle, corners of radius r (CCW, so every corner bulges +). */
    rrect(layer, x0, y0, x1, y1, r) {
      ents.push({ type: 'poly', layer, color: null, closed: true, pts: [
        P(x0 + r, y0), P(x1 - r, y0, B90), P(x1, y0 + r), P(x1, y1 - r, B90), P(x1 - r, y1), P(x0 + r, y1, B90), P(x0, y1 - r), P(x0, y0 + r, B90),
      ] });
    },
    poly(layer, pts, closed = false) { ents.push({ type: 'poly', layer, color: null, closed, pts: pts.map(([x, y, b]) => P(x, y, b)) }); },
    circle(layer, x, y, r) { ents.push({ type: 'circle', layer, color: null, x: r4(x * IN), y: r4(y * IN), r: r4(r * IN) }); },
    arc(layer, x, y, r, a0, a1) { ents.push({ type: 'arc', layer, color: null, x: r4(x * IN), y: r4(y * IN), r: r4(r * IN), a0, a1 }); },
  };
}
const clear = (name, x0, y0, x1, y1, h) => ({ name, x: r4(x0 * IN), y: r4(y0 * IN), z: 0, w: r4((x1 - x0) * IN), d: r4((y1 - y0) * IN), h: r4(h * IN) });

// ---------------------------------------------------------------------------
// The six symbols. Each gets (w, d) in inches from the CSV and returns {entities, clearances, changelog}.

const SYMBOLS = {
  /** Work table: top, backsplash band at the back, rolled front edge, undershelf (hidden), four legs (hidden). */
  'work-table': (w, d) => {
    const k = kit(), x = w / 2;
    k.rect('EQUIP', -x, -d, x, 0);
    k.line('EQUIP', -x, -1.75, x, -1.75);                               // backsplash band
    k.line('EQUIP-DETAIL', -x, -0.75, x, -0.75);
    k.line('EQUIP-DETAIL', -x + 0.75, -d + 1.25, x - 0.75, -d + 1.25);  // rolled front edge
    const lx = x - 2.5, ly0 = -d + 2.5, ly1 = -4;
    k.rect('EQUIP-HIDDEN', -lx, ly0, lx, ly1);                          // undershelf between the legs
    for (const [cx, cy] of [[-lx, ly0], [lx, ly0], [-lx, ly1], [lx, ly1]]) k.circle('EQUIP-HIDDEN', cx, cy, 0.8125);
    return { entities: k.ents, clearances: [clear('service', -x, -d - 36, x, -d, 80)],
             changelog: 'Drew the full plan symbol (backsplash, rolled edge, undershelf and legs) and a service space in front.' };
  },

  /** Three-compartment sink: outline, backsplash, three rounded basins with drains, drainboards with ribs, two faucets. */
  'three-compartment-sink': (w, d) => {
    const k = kit(), x = w / 2;
    k.rect('EQUIP', -x, -d, x, 0);
    k.line('EQUIP', -x, -2.5, x, -2.5);                                  // backsplash
    k.line('EQUIP-DETAIL', -x, -1.25, x, -1.25);
    const bowl = 18, gap = 0, span = 3 * bowl + 2 * gap, bx0 = -span / 2;     // 18 in bowls, 18 in drainboards (seed.csv)
    const by0 = -d + 2, by1 = by0 + bowl;                                // 2 in front rim
    for (let i = 0; i < 3; i++) {
      const a = bx0 + i * (bowl + gap), cx = a + bowl / 2, cy = (by0 + by1) / 2;
      k.rrect('EQUIP', a, by0, a + bowl, by1, 1.5);
      k.rrect('EQUIP-DETAIL', a + 0.75, by0 + 0.75, a + bowl - 0.75, by1 - 0.75, 1);
      k.circle('EQUIP-DETAIL', cx, cy, 1.75);                            // drain
      k.circle('EQUIP-DETAIL', cx, cy, 0.75);
      k.line('EQUIP-DETAIL', cx - 0.75, cy, cx + 0.75, cy);
    }
    // Drainboards both ends: raised rim and ribs running toward the basins.
    for (const s of [-1, 1]) {
      const outer = s * (x - 1), inner = s * (span / 2 + 0.5);
      const xa = Math.min(outer, inner), xb = Math.max(outer, inner);
      k.rect('EQUIP-DETAIL', xa, -d + 1, xb, -3.5);
      for (let j = 1; j <= 5; j++) {
        const yy = -d + 1 + j * ((d - 4.5) / 6);
        k.line('EQUIP-DETAIL', xa + 1.5, yy, xb - 1.5, yy);
      }
    }
    // Faucets on the backsplash: one swing spout between each pair of basins.
    for (const fx of [bx0 + bowl + gap / 2, bx0 + 2 * bowl + 1.5 * gap]) {
      k.circle('EQUIP', fx, -1.25, 0.9);
      k.poly('EQUIP-DETAIL', [[fx - 0.35, -2.1], [fx - 0.35, -11], [fx + 0.35, -11], [fx + 0.35, -2.1]]);
      k.circle('EQUIP-DETAIL', fx, -11.4, 0.55);
      k.circle('EQUIP-DETAIL', fx - 2.75, -1.25, 0.6);                    // hot and cold handles
      k.circle('EQUIP-DETAIL', fx + 2.75, -1.25, 0.6);
    }
    return { entities: k.ents, clearances: [clear('service', -x, -d - 36, x, -d, 80)],
             changelog: 'Drew the full plan symbol (basins, drains, drainboards, faucets) and a service space in front.' };
  },

  /** Wall-mounted hand sink: back flush to the wall, rounded front, bowl, drain, faucet with wrist handles. */
  'hand-sink': (w, d) => {
    const k = kit(), x = w / 2, r = 2.5;
    k.poly('EQUIP', [[-x + r, -d], [x - r, -d, B90], [x, -d + r], [x, 0], [-x, 0], [-x, -d + r, B90]], true);
    k.line('EQUIP', -x, -3, x, -3);                                      // backsplash deck
    k.rrect('EQUIP', -x + 2, -d + 2, x - 2, -4.5, 3);                    // bowl
    k.rrect('EQUIP-DETAIL', -x + 2.75, -d + 2.75, x - 2.75, -5.25, 2.4);
    const cy = (-d + 2 + -4.5) / 2;
    k.circle('EQUIP-DETAIL', 0, cy, 1);                                  // drain
    k.circle('EQUIP-DETAIL', 0, cy, 0.45);
    k.circle('EQUIP', 0, -1.5, 0.75);                                    // faucet
    k.poly('EQUIP-DETAIL', [[-0.3, -2.25], [-0.3, -6.5], [0.3, -6.5], [0.3, -2.25]]);
    for (const s of [-1, 1]) {
      k.circle('EQUIP-DETAIL', s * 3.25, -1.5, 0.55);                    // wrist handles
      k.line('EQUIP-DETAIL', s * 3.25, -1.5, s * 5.5, -1.5);
    }
    k.line('EQUIP-CENTER', 0, 1.5, 0, -d - 1.5);
    return { entities: k.ents, clearances: [clear('service', -15, -d - 30, 15, -d, 80)],
             changelog: 'Drew the full plan symbol (bowl, drain, faucet with wrist handles) and the space to stand at it.' };
  },

  /** Two-door reach-in: cabinet, door line, two doors with hinge points, 90° swings toward the front, handles. */
  'reach-in': (w, d) => {
    const k = kit(), x = w / 2, door = x;                                 // each door spans half the front
    k.rect('EQUIP', -x, -d, x, 0);
    k.line('EQUIP', -x, -d + 2.25, x, -d + 2.25);                         // door faces
    k.line('EQUIP', 0, -d, 0, -d + 2.25);                                 // between the doors
    k.line('EQUIP-DETAIL', -x + 1, -1, x - 1, -1);                        // back panel
    for (const s of [-1, 1]) {
      const hx = s * x;
      k.circle('EQUIP', hx - s * 0.75, -d + 0.75, 0.5);                   // hinge point
      k.rect('EQUIP', s * 1.5, -d - 1.25, s * 3, -d);                     // handle, proud of the door
      k.line('EQUIP-SWING', hx - s * 0.75, -d + 0.75, hx - s * 0.75, -d + 0.75 - door);   // door leaf open 90°
      if (s < 0) k.arc('EQUIP-SWING', hx + 0.75, -d + 0.75, door - 0.75, 270, 360);
      else k.arc('EQUIP-SWING', hx - 0.75, -d + 0.75, door - 0.75, 180, 270);
    }
    return { entities: k.ents, clearances: [clear('door swing', -x, -d - door, x, -d, 80)],
             changelog: 'Drew the full plan symbol (two doors with hinges, handles and 90° swings) and the door swing clearance.' };
  },

  /** Six-burner range: body, back riser and flue band, six grates with burners, knob rail, oven door (hidden). */
  'range': (w, d) => {
    const k = kit(), x = w / 2;
    k.rect('EQUIP', -x, -d, x, 0);
    k.line('EQUIP', -x, -6, x, -6);                                       // back riser
    k.rect('EQUIP-DETAIL', -x + 2, -4.5, x - 2, -1.5);                    // flue
    for (let fx = -x + 4; fx <= x - 4 + 1e-9; fx += 2) k.line('EQUIP-DETAIL', fx, -4, fx, -2);
    k.line('EQUIP', -x, -d + 3.5, x, -d + 3.5);                           // knob rail
    const top = -6, bottom = -d + 3.5, g = (bottom - top) / 2;            // two rows of grates
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = -x + w / 6 + col * (w / 3), cy = top + g / 2 + row * g;
        const hw = w / 6 - 0.5, hh = -g / 2 - 0.5;                        // g is negative (rows run toward −Y)
        k.rect('EQUIP-DETAIL', cx - hw, cy + hh, cx + hw, cy - hh);
        k.line('EQUIP-DETAIL', cx - hw, cy, cx + hw, cy);
        k.line('EQUIP-DETAIL', cx, cy + hh, cx, cy - hh);
        k.circle('EQUIP', cx, cy, 2.5);
        k.circle('EQUIP-DETAIL', cx, cy, 1.1);
      }
    }
    for (let i = 0; i < 7; i++) k.circle('EQUIP-DETAIL', -x + 3 + i * ((w - 6) / 6), -d + 1.75, 0.65);   // knobs
    const ox = 13, oh = 15;                                               // oven door open flat (drops toward the front)
    k.rect('EQUIP-HIDDEN', -ox, -d - oh, ox, -d);
    k.line('EQUIP-HIDDEN', -ox + 2, -d - oh + 1.5, ox - 2, -d - oh + 1.5);
    return { entities: k.ents, clearances: [clear('oven door', -ox, -d - oh, ox, -d, 36), clear('service', -x, -d - 36, x, -d, 80)],
             changelog: 'Drew the full plan symbol (six grates with burners, knob rail, flue riser, oven door shown hidden) and the oven door and service clearances.' };
  },

  /** Wall shelf above: everything hidden (it is above the cut plane), with the wall brackets. */
  'wall-shelf': (w, d) => {
    const k = kit(), x = w / 2;
    k.rect('EQUIP-HIDDEN', -x, -d, x, 0);
    k.line('EQUIP-HIDDEN', -x + 0.5, -d + 0.75, x - 0.5, -d + 0.75);     // front lip
    for (const bx of [-x + 6, x - 6]) k.rect('EQUIP-HIDDEN', bx - 0.5, -d + 1.5, bx + 0.5, 0);   // brackets
    return { entities: k.ents, clearances: [],
             changelog: 'Drew the full plan symbol (shelf above shown hidden, with its wall brackets).' };
  },
};

/** Which symbol a CSV row is (by its name; the CSV is ours). */
const KEY_OF = [
  [/work table/i, 'work-table'], [/three-compartment sink/i, 'three-compartment-sink'], [/hand sink/i, 'hand-sink'],
  [/reach-in/i, 'reach-in'], [/range/i, 'range'], [/wall shelf/i, 'wall-shelf'],
];

const csv = fs.readFileSync(path.join(HERE, 'seed.csv'), 'utf8');
const { items, notes } = L.itemsFromCsv(csv);
if (notes.length) { console.error('seed.csv notes: ' + notes.join(' ')); process.exit(1); }
const manifest = [];
let bad = 0;
for (const base of items) {
  const key = (KEY_OF.find(([re]) => re.test(base.name)) || [])[1];
  if (!key) { console.error('no symbol for ' + base.name); bad++; continue; }
  const w = base.params.width / IN, d = base.params.depth / IN;
  const s = SYMBOLS[key](w, d);
  const item = { ...base, plan: { layers: LAYERS.filter((l) => s.entities.some((e) => e.layer === l.name)), entities: s.entities }, clearances: s.clearances };
  // The body stays the CSV's box (same footprint as the symbol's outline).
  const v = L.validateItem(item, { partial: true });
  if (!v.ok) { console.error(key + ': ' + v.errors.join('; ')); bad++; continue; }
  const json = JSON.stringify(item);
  const file = key + '.item.json';
  manifest.push({ key, name: item.name, file, sha256: crypto.createHash('sha256').update(json).digest('hex'), changelog: s.changelog });
  if (!check) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, file), json); }
  console.log((check ? 'ok    ' : 'wrote ') + file + '  ' + item.plan.entities.length + ' entities, ' + item.clearances.length + ' clearances');
}
if (bad) process.exit(1);
if (!check) fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
