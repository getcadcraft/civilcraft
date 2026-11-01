#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * detail.mjs — plan and 3D detail for the generic block objects (tools/library/blocks/*.csv, 2026-10-29).
 *
 *   node tools/library/detail/detail.mjs [--check]
 *
 * Each object keeps its CSV footprint, height and z (its body box). This adds what the box leaves out: door leaves
 * with hinge points and 90° swings (plan), cabinet and appliance doors, drawer fronts, shelves, handles, roofs, burners,
 * beds, seats, and simple figures for people, trees and vehicles. The 3D body becomes a mesh (mm, z up; plan front
 * faces −Y, the back is y = 0). Writes <out>/<key>.item.json (partial items, checked with validateItem) and
 * <out>/detail-manifest.json [{key, name, file, sha256, changelog}], which bin/library-seed.php publishes as new versions.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { figure2 as figure } from './figure.mjs';
import { furnitureDetail } from './furniture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const L = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/libitem.js')).href);
const BLOCKS = path.join(HERE, '..', 'blocks');
const args = process.argv.slice(2);
const check = args.includes('--check');
const oi = args.indexOf('--out');
const OUT = path.resolve(oi >= 0 ? args[oi + 1] : path.join(HERE, '..', 'seed', 'detail'));

const T = 19;        // door and drawer-front thickness, mm
const GAP = 3;       // gap between a door and its opening, mm
const r = (v) => Math.round(v * 100) / 100;

/** Plan entities in mm, one layer per meaning (the layer names set the linetype, see /library/format). */
function plan() {
  const ents = [];
  return {
    ents,
    line(layer, x1, y1, x2, y2) { ents.push({ type: 'line', layer, color: null, x1: r(x1), y1: r(y1), x2: r(x2), y2: r(y2) }); },
    rect(layer, x0, y0, x1, y1) { ents.push({ type: 'poly', layer, color: null, closed: true, pts: [[r(x0), r(y0)], [r(x1), r(y0)], [r(x1), r(y1)], [r(x0), r(y1)]] }); },
    circle(layer, x, y, rad) { ents.push({ type: 'circle', layer, color: null, x: r(x), y: r(y), r: r(rad) }); },
    arc(layer, x, y, rad, a0, a1) { ents.push({ type: 'arc', layer, color: null, x: r(x), y: r(y), r: r(rad), a0, a1 }); },
  };
}

/** A triangle mesh (mm). */
function mesh() {
  const pos = [], idx = [];
  const tri = (a, b, c) => {
    const i = pos.length / 3;
    for (const p of [a, b, c]) pos.push(r(p[0]), r(p[1]), r(p[2]));
    idx.push(i, i + 1, i + 2);
  };
  return {
    tri,
    quad(a, b, c, d) { tri(a, b, c); tri(a, c, d); },
    box(x0, y0, z0, x1, y1, z1) {
      const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [2, 3, 7], [2, 7, 6], [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3]];
      const i = pos.length / 3;
      for (const p of v) pos.push(r(p[0]), r(p[1]), r(p[2]));
      for (const t of f) idx.push(i + t[0], i + t[1], i + t[2]);
    },
    /** Eight-sided blob (trees, shrubs): a centre, a top and a bottom point, four side points. */
    blob(cx, cy, z0, z1, rad) {
      const zc = (z0 + z1) / 2;
      const s = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([x, y]) => [cx + x * rad, cy + y * rad, zc]);
      for (let i = 0; i < 4; i++) {
        tri([cx, cy, z1], s[i], s[(i + 1) % 4]);
        tri([cx, cy, z0], s[(i + 1) % 4], s[i]);
      }
    },
    body() { return { type: 'mesh', positions: pos, indices: idx }; },
  };
}

/** Split [a, b] into n leaves; hinge on the left for the first half, on the right for the rest (one leaf: left). */
function leaves(a, b, n) {
  const w = (b - a) / n;
  return Array.from({ length: n }, (_, i) => ({ a: a + i * w + (i ? GAP : 0), b: a + (i + 1) * w - (i < n - 1 ? GAP : 0), hinge: n === 1 || i < n / 2 ? 'L' : 'R' }));
}

/** One object: its plan entities, 3D mesh and clearances, from its body box (mm). */
/** Plan shapes (kind rect|circle|line|ellipse) → plan entities on a layer. */
function planShapes(p, shapes) {
  for (const sh of shapes) {
    if (sh.kind === 'rect') p.rect('EQUIP', sh.x0, sh.y0, sh.x1, sh.y1);
    else if (sh.kind === 'circle') p.circle('EQUIP', sh.x, sh.y, sh.r);
    else if (sh.kind === 'line') p.line('EQUIP-DETAIL', sh.x1, sh.y1, sh.x2, sh.y2);
    else if (sh.kind === 'ellipse') p.ents.push({ type: 'ellipse', layer: 'EQUIP', color: null, cx: r(sh.x), cy: r(sh.y), mx: r(sh.rx), my: 0, ratio: r(sh.ry / sh.rx), t0: 0, t1: 6.283185 });
  }
}

function detail(base) {
  // Furniture (seating, tables, beds, desks) gets the finer 3D and plan detail from furniture.mjs.
  if (base.category.startsWith('furniture/')) {
    const fd = furnitureDetail(base.name, base.body);
    if (fd) {
      const p0 = plan(), m0 = mesh();
      for (const t of fd.tris) m0.tri(t[0], t[1], t[2]);
      planShapes(p0, fd.plan);
      p0.rect('EQUIP', base.body.x, base.body.y, base.body.x + base.body.w, base.body.y + base.body.d);
      return { ents: p0.ents, body: m0.body(), clear: fd.clear, changelog: fd.changelog };
    }
  }
  const b = base.body;
  const X0 = b.x, X1 = b.x + b.w, YF = b.y, YB = 0, Z0 = b.z, Z1 = b.z + b.h, W = b.w, D = -b.y, H = b.h;
  const name = base.name, cat = base.category;
  const p = plan(), m = mesh();
  const clear = [];
  const outline = () => p.rect('EQUIP', X0, YF, X1, YB);
  const zm = (z0, z1) => (z0 + z1) / 2;
  let changelog = 'Added plan and 3D detail to the generic object.';

  /** Front doors: swing (hinged leaves with a 90° swing and a clearance) or flat (door seams). */
  const doors = (n, swing, dashedOutline = false, z0 = Z0, z1 = Z1) => {
    const L_ = leaves(X0, X1, n);
    if (dashedOutline) p.rect('EQUIP-HIDDEN', X0, YF, X1, YB); else outline();
    m.box(X0, YF + T, Z0, X1, YB, Z1);
    for (const lf of L_) {
      m.box(lf.a, YF, z0 + GAP, lf.b, YF + T, z1 - GAP);
      const fx = lf.hinge === 'L' ? lf.b : lf.a, hx = lf.hinge === 'L' ? lf.a : lf.b;
      const len = lf.b - lf.a;
      p.rect('EQUIP-DETAIL', fx - (lf.hinge === 'L' ? 80 : -40), YF - 40, fx - (lf.hinge === 'L' ? 40 : -80), YF);  // handle
      m.box(fx - (lf.hinge === 'L' ? 80 : -40), YF - 40, zm(z0, z1) - 250, fx - (lf.hinge === 'L' ? 40 : -80), YF, zm(z0, z1) + 250);
      if (swing) {
        p.line('EQUIP-SWING', hx, YF, hx, YF - len);                                   // leaf open at 90°
        p.arc('EQUIP-SWING', hx, YF, len, lf.hinge === 'L' ? 270 : 180, lf.hinge === 'L' ? 360 : 270);
        p.circle('EQUIP', hx, YF + 20, 9);                                              // hinge
      } else {
        p.line('EQUIP-DETAIL', lf.a, YF + 50, lf.a, YF);                              // seam
        p.line('EQUIP-DETAIL', lf.b, YF + 50, lf.b, YF);
      }
    }
    if (swing) clear.push(clearFor('door swing', X0, YF - Math.max(...L_.map((l) => l.b - l.a)), X1, YF, 80));
    return L_;
  };
  const clearFor = (n2, x0, y0, x1, y1, h) => ({ name: n2, x: r(x0), y: r(y0), z: 0, w: r(x1 - x0), d: r(y1 - y0), h: r(h) });

  /** Drawer fronts, rows of one or two columns. */
  const drawers = (rows, cols) => {
    outline();
    m.box(X0, YF + T, Z0, X1, YB, Z1);
    const rh = (H - GAP * 2) / rows;
    for (let i = 0; i < rows; i++) {
      const z0 = Z0 + GAP + i * rh, z1 = z0 + rh - GAP;
      for (let c = 0; c < cols; c++) {
        const a = X0 + GAP + c * (W / cols), bb = X0 + (c + 1) * (W / cols) - GAP;
        m.box(a, YF, z0, bb, YF + T, z1);
        p.rect('EQUIP-DETAIL', (a + bb) / 2 - 60, YF - 30, (a + bb) / 2 + 60, YF);
      }
    }
    changelog = `Added ${rows} drawer ${rows === 1 ? 'front' : 'fronts'}${cols > 1 ? ' in ' + cols + ' columns' : ''} and their pulls (plan and 3D).`;
  };

  /** One front panel with a pull bar (appliances, panels, machines). */
  const front = (z0 = Z0, z1 = Z1, label = 'front') => {
    outline();
    m.box(X0, YF + T, Z0, X1, YB, Z1);            // carcass, behind the panel
    m.box(X0 + GAP, YF, z0 + GAP, X1 - GAP, YF + T, z1 - GAP);
    m.box(X0 + 60, YF - 30, z1 - 120, X1 - 60, YF, z1 - 90);  // pull bar
    p.line('EQUIP-DETAIL', X0 + 60, YF - 20, X1 - 60, YF - 20);
    changelog = `Added the ${label} panel and its pull bar (plan and 3D).`;
  };

  const flatBox = () => { outline(); m.box(X0, YF, Z0, X1, YB, Z1); };

  const swingN = (n) => doors(n, true);

  // --- dispatch -------------------------------------------------------------------------------------------------
  if (/shed/i.test(name)) {
    outline();
    const door = 914, dx0 = -door / 2, dx1 = door / 2, hz = Z0 + 2032;
    m.box(X0, YF, Z0, X1, YB, Z0 + H);                        // walls
    const ridge = Z0 + H + 800;
    m.quad([X0 - 100, YF - 100, Z0 + H], [0, YF - 100, ridge], [0, 100, ridge], [X0 - 100, 100, Z0 + H]);
    m.quad([X1 + 100, YF - 100, Z0 + H], [X1 + 100, 100, Z0 + H], [0, 100, ridge], [0, YF - 100, ridge]);
    m.tri([X0, YF, Z0 + H], [X1, YF, Z0 + H], [0, YF, ridge]);
    m.tri([X0, YB, Z0 + H], [0, YB, ridge], [X1, YB, Z0 + H]);
    m.box(dx0 + GAP, YF, Z0 + GAP, dx1 - GAP, YF + T, hz);     // door leaf
    m.box(dx1 - 80, YF - 30, Z0 + 900, dx1 - 60, YF, Z0 + 1000);
    p.line('EQUIP-CENTER', 0, YF, 0, YB);                       // ridge
    p.line('EQUIP-HIDDEN', X0 - 100, YF - 100, X1 + 100, YF - 100);
    p.line('EQUIP-HIDDEN', X0 - 100, 100, X1 + 100, 100);
    p.line('EQUIP-DETAIL', X0, YF + 100, X1, YF + 100);
    p.arc('EQUIP-SWING', dx0, YF, door, 270, 360);
    p.line('EQUIP-SWING', dx0, YF, dx0, YF - door);
    clear.push(clearFor('door swing', dx0, YF - door, dx1, YF, 80));
    changelog = 'Added the gable roof, the front door with its 90° swing and clearance, and the ridge line (plan and 3D).';
  } else if (/entry door/i.test(name)) {
    outline();
    m.box(X0 + GAP, YF, Z0 + GAP, X1 - GAP, YF + T, Z1 - GAP);
    m.box(X1 - 80, YF - 30, zm(Z0, Z1) - 250, X1 - 40, YF, zm(Z0, Z1) + 250);
    p.arc('EQUIP-SWING', X0, YF, W, 270, 360);
    p.line('EQUIP-SWING', X0, YF, X0, YF - W);
    clear.push(clearFor('door swing', X0, YF - W, X1, YF, 80));
    changelog = 'Added the door leaf, its pull, the 90° swing and the clearance (plan and 3D).';
  } else if (/french door/i.test(name)) {
    swingN(2); changelog = 'Added both French door leaves with their 90° swings and clearance (plan and 3D).';
  } else if (/sliding glass/i.test(name)) {
    outline();
    m.box(X0, YF, Z0, X0 + W / 2, YF + T, Z1);
    m.box(X0 + W / 2, YF - T, Z0, X1, YF, Z1);
    p.line('EQUIP-DETAIL', X0 + W / 2, YF, X0 + W / 2, YB);
    changelog = 'Added the two sliding glass panels and their track (plan and 3D).';
  } else if (/garage door|overhead door/i.test(name)) {
    outline();
    for (let z = Z0 + 300; z < Z1 - 100; z += 300) m.box(X0 + 10, YF - 6, z - 4, X1 - 10, YF, z + 4);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the door panels and their seams (3D).';
  } else if (/window/i.test(name)) {
    outline();
    const mid = (YF + YB) / 2;
    m.box(X0 + 40, mid - 6, Z0 + 40, X1 - 40, mid + 6, Z1 - 40);
    m.box(X0, YF, Z0, X0 + 40, YB, Z1); m.box(X1 - 40, YF, Z0, X1, YB, Z1);
    m.box(X0, YF, Z1 - 40, X1, YB, Z1); m.box(X0, YF, Z0, X1, YB, Z0 + 40);
    p.line('EQUIP-DETAIL', X0 + 40, mid, X1 - 40, mid);
    p.line('EQUIP-CENTER', X0 + W / 2, YF, X0 + W / 2, YB);
    changelog = 'Added the frame, the glass and the sash lines (plan and 3D).';
  } else if (/refrigerator|fridge|freezer|reach-in|cooler/i.test(name) && !/chest|kegerator|beverage|ice|bottle|water/i.test(name)) {
    const n = /walk-in/i.test(name) ? 1 : /three/i.test(name) ? 3 : /one door/i.test(name) ? 1 : 2;
    if (/walk-in/i.test(name)) { outline(); m.box(X0, YF, Z0, X1, YB, Z1); m.box(X0 + GAP, YF - 6, Z0 + GAP, X0 + W * 0.5, YF, Z1 - 50); p.rect('EQUIP-DETAIL', X0 + W * 0.5 - 80, YF - 80, X0 + W * 0.5 - 20, YF); changelog = 'Added the walk-in panel and door (plan and 3D).'; }
    else { doors(n, true); changelog = `Added ${n} hinged ${n === 1 ? 'door' : 'doors'} with 90° swings, handles and clearance (plan and 3D).`; }
  } else if (/wardrobe|display cabinet/i.test(name)) {
    doors(2, true); changelog = 'Added two hinged doors with 90° swings, handles and clearance (plan and 3D).';
  } else if (/bookcase/i.test(name)) {
    outline();
    m.box(X0, YF, Z0, X0 + T, YB, Z1); m.box(X1 - T, YF, Z0, X1, YB, Z1);
    m.box(X0, YF, Z1 - T, X1, YB, Z1); m.box(X0, YF, Z0, X1, YB, Z0 + T);
    m.box(X0, -T, Z0, X1, YB, Z1);
    for (let i = 1; i <= 4; i++) { const z = Z0 + (H * i) / 5; m.box(X0 + T, YF, z, X1 - T, YB - T, z + T); }
    changelog = 'Added the sides, back, top and four shelves (plan and 3D).';
  } else if (/two-door cabinet|tv cabinet|credenza|bookshelf/i.test(name)) {
    doors(2, false); changelog = 'Added two doors with their seams and pulls (plan and 3D).';
  } else if (/dresser/i.test(name)) { drawers(3, 2); }
  else if (/file cabinet/i.test(name)) { drawers(4, 1); }
  else if (/lateral/i.test(name)) { drawers(2, 2); }
  else if (/nightstand/i.test(name)) { drawers(1, 1); }
  else if (/pot drawer|drawer base/i.test(name)) { drawers(/pot/i.test(name) ? 3 : 4, 1); }
  else if (/^Generic (base|wall|tall|corner|pantry|broom|oven|linen|glass-door|refrigerator|microwave|utility|bathroom)|cabinet|tower/i.test(name) && /casework/.test(cat)) {
    const n = /corner|lazy|appliance garage/i.test(name) ? 1 : /sink base/i.test(name) ? 2 : Math.max(1, Math.round(W / 457));
    doors(n, false, /wall cabinet|over-fridge|microwave wall|corner wall|glass-door wall/i.test(name) || cat === 'casework/wall');
    changelog = `Added ${n} ${n === 1 ? 'door' : 'doors'} with their seams and pulls (plan and 3D).`;
  } else if (/dishwasher|washer|dryer|microwave|wall oven|oven/i.test(name) && !/range/i.test(name)) {
    front(Z0, Z1, /microwave/i.test(name) ? 'door' : 'door');
  } else if (/range|cooktop/i.test(name)) {
    outline();
    m.box(X0, YF, Z0, X1, YB, Z0 + H * 0.55);
    m.box(X0 + GAP, YF, Z0 + GAP, X1 - GAP, YF + T, Z0 + H * 0.5);
    m.box(X0, YF, Z0 + H * 0.55, X1, YB, Z1);
    const cols = W > 800 ? 3 : 2, rows = 2;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) p.circle('EQUIP-DETAIL', X0 + W * (i + 0.5) / cols, YB - D * (j + 0.6) / rows * 0.7, Math.min(W, D) / (cols * 4.5));
    changelog = 'Added the burners, the oven door and its pull (plan and 3D).';
  } else if (cat !== 'people/entourage' && /table|desk|workstation|reception|counter|dish table|work table|serving counter/i.test(name)) {
    outline();
    const t = 30, lg = 50;
    m.box(X0, YF, Z1 - t, X1, YB, Z1);
    for (const [x, y] of [[X0, YF], [X1 - lg, YF], [X0, YB - lg], [X1 - lg, YB - lg]]) m.box(x + 25, y + 25, Z0, x + 25 + lg, y + 25 + lg, Z1 - t);
    for (const [x, y] of [[X0 + 25, YF + 25], [X1 - 25, YF + 25], [X0 + 25, YB - 25], [X1 - 25, YB - 25]]) p.rect('EQUIP-HIDDEN', x - 25, y - 25, x + 25, y + 25);
    if (/shelf|undershelf|work table/i.test(name)) p.rect('EQUIP-HIDDEN', X0 + 80, YF + 80, X1 - 80, YB - 80);
    changelog = 'Added the top, four legs (hidden in plan) and an undershelf where one is shown (plan and 3D).';
  } else if (cat !== 'people/entourage' && /chair|stool|sofa|loveseat|ottoman|armchair|lounge|banquette|bench, 48|bench, 72|daybed|bench/i.test(name)) {
    outline();
    const seatZ = Z0 + H * 0.45, back = /sofa|loveseat|banquette|armchair|lounge|chair/i.test(name) && !/bar|counter|stool/i.test(name);
    m.box(X0, YF, seatZ, X1, YB - (back ? 60 : 0), seatZ + 60);
    if (back) m.box(X0, YB - 60, seatZ, X1, YB, Z1);
    for (const [x, y] of [[X0 + 40, YF + 40], [X1 - 80, YF + 40], [X0 + 40, YB - 80], [X1 - 80, YB - 80]]) m.box(x, y, Z0, x + 40, y + 40, seatZ);
    p.rect('EQUIP-DETAIL', X0 + 50, YF + 50, X1 - 50, YB - 50);
    if (/sofa|loveseat|banquette/i.test(name)) {
      const seats = Math.max(1, Math.round(W / 610));
      for (let i = 1; i < seats; i++) p.line('EQUIP-DETAIL', X0 + (W * i) / seats, YF + 50, X0 + (W * i) / seats, YB - 50);
    }
    changelog = 'Added the seat, legs and back, with the seat lines in plan (plan and 3D).';
  } else if (/bed|bunk/i.test(name)) {
    outline();
    m.box(X0, YF, Z0, X1, YB, Z0 + H * 0.3);
    m.box(X0 + 30, YF + 30, Z0 + H * 0.3, X1 - 30, YB - 30, Z0 + H * 0.3 + 200);
    for (const [a, bb] of [[X0 + 80, X0 + W / 2 - 40], [X0 + W / 2 + 40, X1 - 80]]) p.rect('EQUIP-DETAIL', a, YB - D * 0.22, bb, YB - 60);
    changelog = 'Added the frame, mattress and pillows at the head (plan and 3D).';
  } else if (/hydrant|fire department/i.test(name)) {
    p.circle('EQUIP', (X0 + X1) / 2, (YF + YB) / 2, W / 2);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the outline and cap detail (plan and 3D).';
  } else if (/wc|water closet|toilet/i.test(name)) {
    outline();
    p.rect('EQUIP-DETAIL', X0 + 40, YB - D * 0.35, X1 - 40, YB - 40);
    p.circle('EQUIP', (X0 + X1) / 2, YF + D * 0.45, W / 2 - 40);
    m.box(X0, YB - D * 0.35, Z0, X1, YB, Z1);
    m.box(X0 + 40, YF, Z0, X1 - 40, YB - D * 0.35, Z0 + H * 0.4);
    changelog = 'Added the bowl, tank and seat outline (plan and 3D).';
  } else if (/lavatory|washbasin|sink|basin|bar sink|laundry tub|floor sink|mop sink|prep sink|utility sink/i.test(name)) {
    outline();
    p.rect('EQUIP-DETAIL', X0 + 60, YF + 60, X1 - 60, YB - 60);
    p.circle('EQUIP-DETAIL', (X0 + X1) / 2, (YF + YB) / 2, Math.min(W, D) / 12);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the bowl outline and drain (plan and 3D).';
  } else if (/bathtub|tub|shower|drain/i.test(name) && !/shower head|shower column|shower drain|drain/i.test(name)) {
    outline();
    p.rect('EQUIP-DETAIL', X0 + 75, YF + 75, X1 - 75, YB - 75);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the inner outline of the basin (plan and 3D).';
  } else if (/light|lantern|sconce|cove|strip|troffer|track|pendant|chandelier|flood|emergency|exit sign|fan|high bay|downlight|surface ceiling/i.test(name) && cat === 'electrical/fixtures') {
    const round = /downlight|surface ceiling|pendant light|chandelier|post lantern|high bay|ceiling fan|track light head/i.test(name);
    if (round) p.circle('EQUIP', (X0 + X1) / 2, (YF + YB) / 2, W / 2); else p.rect('EQUIP', X0, YF, X1, YB);
    if (round) p.circle('EQUIP-DETAIL', (X0 + X1) / 2, (YF + YB) / 2, W / 4); else p.line('EQUIP-DETAIL', X0 + 20, (YF + YB) / 2, X1 - 20, (YF + YB) / 2);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the lens or lamp outline (plan and 3D).';
  } else if (cat === 'electrical/equipment' && /panel|disconnect|transfer|lighting control|battery|ups|transformer|generator|junction|intercom/i.test(name)) {
    front(Z0, Z1, 'panel');
  } else if (cat === 'electrical/equipment') {
    p.circle('EQUIP', (X0 + X1) / 2, (YF + YB) / 2, Math.max(W, D) / 2);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the device outline (plan and 3D).';
  } else if (cat === 'mechanical/equipment' && /diffuser|grille|register|damper|valve|sensor|silencer|access door|thermostat/i.test(name)) {
    outline();
    if (/diffuser|grille|register/i.test(name) && W > D) for (let i = 1; i < 4; i++) p.line('EQUIP-DETAIL', X0 + 40, YF + (D * i) / 4, X1 - 40, YF + (D * i) / 4);
    if (/diffuser|grille|register/i.test(name) && W <= D) p.circle('EQUIP-DETAIL', (X0 + X1) / 2, (YF + YB) / 2, W / 3);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the face and vane or ring lines (plan and 3D).';
  } else if (cat === 'mechanical/equipment') {
    front(Z0, Z1, 'access');
  } else if (cat === 'appliances/residential' && /refrigerator|freezer/i.test(name)) {
    doors(2, true);
  } else if (cat === 'appliances/residential' && /cooktop|range|oven/i.test(name)) {
    flatBox();
  } else if (cat === 'appliances/residential') {
    front(Z0, Z1, 'front');
  } else if (cat === 'people/entourage' && !/^Generic (dog|cat)/i.test(name)) {
    // A generic person from primitives (figure.mjs): walking or standing, with a suitcase when the name says so.
    const pose = /seated|sitting|wheelchair|bench|desk|sitting/i.test(name) ? 'sit' : /walk|jogger|pedestrian|shopper|stroller|suitcase|cyclist|with dog|bicycle|umbrella|briefcase|cane/i.test(name) ? 'walk' : 'stand';
    const fig = figure({
      pose,
      suitcase: /suitcase/i.test(name),
      hi: true,   // all people figures get the finer detail (the suitcase figure was the first)
      scale: /child|toddler/i.test(name) ? 0.7 : 1,
      cx: 0,
      cy: (YF + YB) / 2,
    });
    for (const t of fig.tris) m.tri(t[0], t[1], t[2]);
    for (const sh of fig.plan) {
      if (sh.kind === 'ellipse') p.ents.push({ type: 'ellipse', layer: 'EQUIP', color: null, cx: r(sh.x), cy: r(sh.y), mx: r(sh.rx), my: 0, ratio: r(sh.ry / sh.rx), t0: 0, t1: 6.283185 });
      else if (sh.kind === 'circle') p.circle('EQUIP', sh.x, sh.y, sh.r);
      else if (sh.kind === 'rect') p.rect('EQUIP', sh.x0, sh.y0, sh.x1, sh.y1);
      else if (sh.kind === 'line') p.line('EQUIP-DETAIL', sh.x1, sh.y1, sh.x2, sh.y2);
    }
    changelog = `Added a generic ${pose === 'walk' ? 'walking' : pose === 'sit' ? 'seated' : 'standing'} figure${/suitcase/i.test(name) ? ' with a wheeled suitcase' : ''}: built from lofted sections with clothing shells (head, torso, arms, legs, shoes), with the shoulder, head and suitcase outlines in plan.`;
  } else if (cat === 'people/entourage') {
    const body = Z0 + H * 0.82, hd = Math.min(W, D) * 0.45;
    m.box(X0, YF, Z0, X1, YB, Z1);
    p.circle('EQUIP', (X0 + X1) / 2, (YF + YB) / 2, W / 2);
    p.circle('EQUIP-DETAIL', (X0 + X1) / 2, (YF + YB) / 2 + (YB - YF) * 0.1, hd / 2);
    changelog = 'Added a simple outline and body (animal placeholder).';
  } else if (cat === 'site/landscape' && /tree|palm/i.test(name)) {
    const cx = (X0 + X1) / 2, cy = (YF + YB) / 2;
    m.box(cx - W * 0.04, cy - W * 0.04, Z0, cx + W * 0.04, cy + W * 0.04, Z0 + H * 0.4);
    m.blob(cx, cy, Z0 + H * 0.35, Z1, W / 2);
    p.circle('EQUIP', cx, cy, W / 2);
    p.circle('EQUIP-DETAIL', cx, cy, W * 0.08);
    changelog = 'Added the trunk and canopy in 3D, and the canopy and trunk outlines in plan.';
  } else if (cat === 'site/landscape' && /shrub|grass|groundcover|hedge|flower|planter pot/i.test(name)) {
    const cx = (X0 + X1) / 2, cy = (YF + YB) / 2;
    if (/planter pot/i.test(name)) { p.circle('EQUIP', cx, cy, W / 2); p.circle('EQUIP-DETAIL', cx, cy, W * 0.4); m.box(X0, YF, Z0, X1, YB, Z1); }
    else if (/hedge|flower/i.test(name)) { p.rect('EQUIP', X0, YF, X1, YB); m.box(X0, YF, Z0, X1, YB, Z1); }
    else { p.circle('EQUIP', cx, cy, W / 2); m.blob(cx, cy, Z0, Z1, W / 2); }
    changelog = 'Added the plant mass in plan and 3D.';
  } else if (cat === 'site/landscape' && /pool|pond|fountain/i.test(name)) {
    outline(); p.rect('EQUIP-DETAIL', X0 + 150, YF + 150, X1 - 150, YB - 150); m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the water line inset from the edge (plan and 3D).';
  } else if (cat === 'site/landscape' && /patio|walkway|parking|deck|lawn/i.test(name)) {
    outline();
    const step = /parking/i.test(name) ? 2000 : 600;
    for (let x = X0 + step; x < X1; x += step) p.line('EQUIP-DETAIL', x, YF, x, YB);
    for (let y = YF + step; y < YB; y += step) p.line('EQUIP-DETAIL', X0, y, X1, y);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the paving joints or stall lines (plan and 3D).';
  } else if (cat === 'site/landscape' && /pergola|gazebo/i.test(name)) {
    outline();
    const step = 600;
    for (let x = X0 + step; x < X1; x += step) p.line('EQUIP-DETAIL', x, YF, x, YB);
    for (let y = YF + step; y < YB; y += step) p.line('EQUIP-DETAIL', X0, y, X1, y);
    for (const [x, y] of [[X0, YF], [X1 - 100, YF], [X0, YB - 100], [X1 - 100, YB - 100]]) m.box(x, y, Z0, x + 100, y + 100, Z1);
    m.box(X0, YF, Z1 - 150, X1, YB, Z1);
    changelog = 'Added the posts, the beam and the rafter lines (plan and 3D).';
  } else if (cat === 'site/landscape' && /bench|picnic|trash|bike|bollard|fence|gate|wall|stair|light pole/i.test(name)) {
    outline();
    if (/picnic|bench|bike/i.test(name)) for (let y = YF + 90; y < YB; y += 90) p.line('EQUIP-DETAIL', X0 + 20, y, X1 - 20, y);
    if (/trash/i.test(name)) p.circle('EQUIP-DETAIL', (X0 + X1) / 2, (YF + YB) / 2, W / 2 - 40);
    m.box(X0, YF, Z0, X1, YB, Z1);
    changelog = 'Added the slats or the rim in plan and the solid form in 3D.';
  } else if (cat === 'site/vehicles') {
    outline();
    const wz = Z0 + 60;
    for (const [x, y] of [[X0 - 30, YF + D * 0.15], [X1 - 60, YF + D * 0.15], [X0 - 30, YB - D * 0.25], [X1 - 60, YB - D * 0.25]]) p.rect('EQUIP-DETAIL', x, y, x + 90, y + 200);
    p.line('EQUIP-DETAIL', X0 + W * 0.15, YF + D * 0.3, X1 - W * 0.15, YF + D * 0.3);
    m.box(X0, YF, wz, X1, YB, Z0 + H * 0.5);
    m.box(X0 + W * 0.15, YF + D * 0.25, Z0 + H * 0.5, X1 - W * 0.15, YB - D * 0.25, Z1);
    changelog = 'Added the body, cabin, glass line and wheels (plan and 3D).';
  } else if (/fence|retaining|gate|walkway|pool|patio/i.test(name)) {
    outline(); m.box(X0, YF, Z0, X1, YB, Z1);
  } else {
    outline();
    m.box(X0, YF, Z0, X1, YB, Z1);
  }

  return { ents: p.ents, body: m.body(), clear, changelog };
}

// --- the run -------------------------------------------------------------------------------------------------
const LAYERS = [
  { name: 'EQUIP', color: 7 }, { name: 'EQUIP-DETAIL', color: 8 }, { name: 'EQUIP-HIDDEN', color: 8 },
  { name: 'EQUIP-CENTER', color: 1 }, { name: 'EQUIP-SWING', color: 8 },
];
const files = fs.readdirSync(BLOCKS).filter((f) => f.endsWith('.csv')).sort();
const manifest = [];
let bad = 0, count = 0;
for (const f of files) {
  const { items, notes } = L.itemsFromCsv(fs.readFileSync(path.join(BLOCKS, f), 'utf8'));
  if (notes.length) { console.error(f + ' notes: ' + notes.join(' ')); bad++; continue; }
  for (const base of items) {
    if (!base.body || base.body.type !== 'box') { console.error('not a box: ' + base.name); bad++; continue; }
    const d = detail(base);
    const item = {
      ...base,
      plan: { layers: LAYERS.filter((l) => d.ents.some((e) => e.layer === l.name)), entities: d.ents },
      body: d.body,
      clearances: d.clear,
    };
    const v = L.validateItem(item, { partial: true });
    if (!v.ok) { console.error(base.name + ': ' + v.errors.join('; ')); bad++; continue; }
    const json = JSON.stringify(item);
    const slug = base.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const file = slug + '.item.json';
    manifest.push({ key: slug, name: base.name, file, sha256: crypto.createHash('sha256').update(json).digest('hex'), changelog: d.changelog });
    if (!check) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, file), json); }
    count++;
  }
}
if (bad) { console.error(bad + ' item(s) failed'); process.exit(1); }
if (!check) fs.writeFileSync(path.join(OUT, 'detail-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log((check ? 'checked ' : 'wrote ') + count + ' items' + (check ? '' : ' to ' + OUT));
