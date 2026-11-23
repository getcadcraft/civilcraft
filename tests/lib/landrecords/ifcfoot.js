/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifcfoot.js — building footprints straight from an IFC model (0.11 LR.16): each IfcBuilding's elements are laid flat on the plan and their
 * outline is traced, so a model made in any BIM program can be set over the parcels without being redrawn. DOM-free; Node-tested.
 *
 * THE IFC READER IS THE HOST'S. This file imports nothing: the caller hands it cc-ifc's classes (lib/ifc: IfcFile, GeoCtx, Geometry), which
 * every app that reads IFC already carries. There is no second IFC parser here.
 *
 *   buildingsFromIfc(bytes, { IfcFile, GeoCtx, Geometry }, { unitM, shift: { x, y }, turn (degrees, anticlockwise), maxCells, maxTriangles })
 *     → { ok: true, schema, fileUnit, georef: bool, cell (project units), buildings: [building], notes: [code], counts } | { ok: false, why }
 *     building = { name, ring: [{ x, y }] (project units), area (the ground inside the traced outline, project units²), floors, height (project units),
 *                  gfa (project units²), gfaFrom: 'stated' | 'slabs' | 'footprint', part (1… when one IfcBuilding stands in several pieces) }
 *     why: 'read' (not an IFC file cc-ifc can open) | 'nobuilding' (no geometry under any IfcBuilding) | 'big'
 *     notes: 'nogeoref' (the file has no map conversion: its own coordinates were used, moved by `shift` and `turn`) · 'skipped' (elements whose
 *            geometry could not be made) · 'loose' (elements under no IfcBuilding, left out) · 'coarse' (the grid had to be coarser than 5 cm)
 *
 * HOW THE OUTLINE IS FOUND. Every triangle of every element of a building is projected onto the plan and painted into a grid of square cells
 * (a cell is painted when its centre is inside a triangle). The outline of the painted cells is traced along the cell edges and straightened
 * to within one cell; the footprint is the ground inside that outline. Ground the building encloses counts as footprint: a model with walls
 * and no floor slab still has a footprint, and so a courtyard closed on every side is counted too (said in the listing). So a footprint is true to about one cell along its edge: the cell is 5 cm unless the model is so large
 * that the grid would pass `maxCells`, and its size is returned and shown. That is the price of taking any geometry an IFC file can hold
 * (extrusions, breps, booleans, mapped items) without a solid-modelling kernel, and it is far inside what a planning figure needs.
 *
 * Floor area, best first: the model's own figure (Qto_BuildingBaseQuantities GrossFloorArea, else the storeys' GrossFloorArea added up, else
 * CadCraft's own pset) = 'stated'; else the plan area of each storey's floor slabs added up = 'slabs'; else footprint × storeys = 'footprint'.
 * Height is the highest point of the building's elements less the lowest. Openings are not cut (they do not change a footprint).
 *
 *   traceMask(mask, w, h) → [[ [i, j], … ]]   the outer outlines of the painted cells, in cell corners, counter-clockwise (exported for the test)
 *   straighten(ring, tol) → ring              Douglas–Peucker on a closed ring
 */
const fin = Number.isFinite;

export function traceMask(mask, w, h) {
  const on = (i, j) => i >= 0 && j >= 0 && i < w && j < h && mask[j * w + i] === 1;
  // directed edges with the painted cell on the left; next: from a corner, the edges leaving it
  const out = new Map(), key = (i, j) => j * (w + 1) + i;
  const add = (a, b, c, d) => { const k = key(a, b); if (!out.has(k)) out.set(k, []); out.get(k).push([c, d]); };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (!mask[j * w + i]) continue;
    if (!on(i, j - 1)) add(i, j, i + 1, j);            // bottom, going east
    if (!on(i + 1, j)) add(i + 1, j, i + 1, j + 1);    // right, going north
    if (!on(i, j + 1)) add(i + 1, j + 1, i, j + 1);    // top, going west
    if (!on(i - 1, j)) add(i, j + 1, i, j);            // left, going south
  }
  const rings = [];
  for (const [k0, list0] of out) while (list0.length) {
    const start = [k0 % (w + 1), Math.floor(k0 / (w + 1))], ring = [start];
    let cur = start, dir = null, guard = 0;
    for (;;) {
      const list = out.get(key(cur[0], cur[1])); if (!list || !list.length) break;
      // where two painted cells touch only at a corner, turn left first: the two pieces stay one outline each
      let pick = 0;
      if (list.length > 1 && dir) { const left = [-dir[1], dir[0]]; const at = list.findIndex((n) => n[0] - cur[0] === left[0] && n[1] - cur[1] === left[1]); if (at >= 0) pick = at; }
      const nx = list.splice(pick, 1)[0]; dir = [nx[0] - cur[0], nx[1] - cur[1]]; cur = nx;
      if (cur[0] === start[0] && cur[1] === start[1]) break;
      ring.push(cur); if (++guard > 4 * (w + 1) * (h + 1)) break;
    }
    let a2 = 0; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a2 += p[0] * q[1] - q[0] * p[1]; }
    if (a2 > 0 && ring.length >= 4) rings.push(ring);   // holes (courtyards) come out clockwise and are not footprints
  }
  return rings;
}

export function straighten(ring, tol) {
  if (ring.length < 5) return ring.slice();
  // start at the two points farthest apart, so the closed ring becomes two open runs
  let a = 0, b = 0, best = -1;
  for (let i = 0; i < ring.length; i++) { const d = (ring[i].x - ring[0].x) ** 2 + (ring[i].y - ring[0].y) ** 2; if (d > best) { best = d; b = i; } }
  best = -1; for (let i = 0; i < ring.length; i++) { const d = (ring[i].x - ring[b].x) ** 2 + (ring[i].y - ring[b].y) ** 2; if (d > best) { best = d; a = i; } }
  const run = (from, to) => { const o = []; for (let i = from; ; i = (i + 1) % ring.length) { o.push(ring[i]); if (i === to) break; } return o; };
  const dp = (pts) => {
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1; const stack = [[0, pts.length - 1]];
    while (stack.length) {
      const [s, e] = stack.pop(), p = pts[s], q = pts[e], L = Math.hypot(q.x - p.x, q.y - p.y); let worst = 0, at = -1;
      for (let i = s + 1; i < e; i++) { const d = L > 0 ? Math.abs((q.x - p.x) * (pts[i].y - p.y) - (q.y - p.y) * (pts[i].x - p.x)) / L : Math.hypot(pts[i].x - p.x, pts[i].y - p.y); if (d > worst) { worst = d; at = i; } }
      if (worst > tol && at > 0) { keep[at] = 1; stack.push([s, at], [at, e]); }
    }
    return pts.filter((_, i) => keep[i]);
  };
  const one = dp(run(a, b)), two = dp(run(b, a));
  return [...one.slice(0, -1), ...two.slice(0, -1)];
}

const NOT_BUILDING_PARTS = new Set(['IFCOPENINGELEMENT', 'IFCSPACE', 'IFCSITE', 'IFCANNOTATION', 'IFCGRID', 'IFCVIRTUALELEMENT', 'IFCGEOGRAPHICELEMENT']);

export function buildingsFromIfc(bytes, deps, { unitM = 1, shift = { x: 0, y: 0 }, turn = 0, maxCells = 6e6, maxTriangles = 3e6 } = {}) {
  const { IfcFile, GeoCtx, Geometry } = deps || {};
  let f, g, geom;
  try { f = IfcFile.open(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)); g = new GeoCtx(f); geom = new Geometry(f); geom.voids = new Map(); } catch { return { ok: false, why: 'read' }; }
  const notes = new Set(), fileUnit = fin(g.lengthUnit) && g.lengthUnit > 0 ? g.lengthUnit : 1, k = fileUnit / unitM;
  let geo = null; try { geo = g.georef(); } catch { geo = null; }
  const ct = Math.cos(turn * Math.PI / 180), st = Math.sin(turn * Math.PI / 180), sx = fin(shift?.x) ? shift.x : 0, sy = fin(shift?.y) ? shift.y : 0;
  const M = geo && geo.matrix ? geo.matrix : null;
  if (!M) notes.add('nogeoref');
  const toProject = M ? (x, y, z) => [(M[0] * x + M[4] * y + M[8] * z + M[12]) * k, (M[1] * x + M[5] * y + M[9] * z + M[13]) * k, (M[2] * x + M[6] * y + M[10] * z + M[14]) * k]
    : (x, y, z) => [(x * ct - y * st) * k + sx, (x * st + y * ct) * k + sy, z * k];

  // who is part of what: aggregation (building > storey, assembly > part) and containment (storey > element)
  const parent = new Map();
  const rels = (type, one, many) => { for (const rel of f.ofType(type)) { const o = g.ref(g.a(rel, one)); if (o === null) continue; for (const c of g.refs(g.a(rel, many))) if (!parent.has(c)) parent.set(c, o); } };
  try { rels('IFCRELAGGREGATES', 'RelatingObject', 'RelatedObjects'); rels('IFCRELCONTAINEDINSPATIALSTRUCTURE', 'RelatingStructure', 'RelatedElements'); } catch { return { ok: false, why: 'read' }; }
  const home = (id) => { let building = null, storey = null, cur = id; for (let i = 0; i < 64 && cur !== undefined && cur !== null; i++) { const t = f.type(cur); if (t === 'IFCBUILDINGSTOREY' && storey === null) storey = cur; if (t === 'IFCBUILDING') { building = cur; break; } cur = parent.get(cur); } return { building, storey }; };

  // what the model itself states: quantities and CadCraft's own pset
  const stated = new Map();
  const say = (obj, name, v) => { if (!fin(v) || !(v > 0)) return; if (!stated.has(obj)) stated.set(obj, {}); stated.get(obj)[name] = v; };
  try {
    for (const rel of f.ofType('IFCRELDEFINESBYPROPERTIES')) {
      const def = g.ref(g.a(rel, 'RelatingPropertyDefinition')); if (def === null) continue;
      const t = f.type(def), objs = g.refs(g.a(rel, 'RelatedObjects'));
      if (t === 'IFCELEMENTQUANTITY') { for (const q of g.refs(g.a(def, 'Quantities'))) if (f.type(q) === 'IFCQUANTITYAREA' && g.str(g.a(q, 'Name')) === 'GrossFloorArea') for (const o of objs) say(o, 'qto', g.num(g.a(q, 'AreaValue')) * fileUnit * fileUnit); }
      else if (t === 'IFCPROPERTYSET' && g.str(g.a(def, 'Name')) === 'CadCraft_SiteMass') { for (const p of g.refs(g.a(def, 'HasProperties'))) if (g.str(g.a(p, 'Name')) === 'GrossFloorArea') { const v = g.a(p, 'NominalValue'); for (const o of objs) say(o, 'cc', v && typeof v === 'object' ? Number(v.value) : NaN); } }   // square metres, as CivilCraft writes it
    }
  } catch { /* a model with no readable quantities: the slabs are measured instead */ }

  // every element's triangles, in project coordinates, kept by building
  const B = new Map(); let tris = 0, loose = 0, skipped = 0;
  const isA = (t, base) => { try { return f.schema.isA(t, base); } catch { return false; } };
  for (const pid of geom.products()) {
    const tp = f.type(pid);
    if (NOT_BUILDING_PARTS.has(tp) || isA(tp, 'IFCSPATIALSTRUCTUREELEMENT') || isA(tp, 'IFCFEATUREELEMENT')) continue;
    const h = home(pid);
    if (h.building === null) { loose++; continue; }
    let pieces; try { pieces = geom.pieces(pid); } catch { skipped++; continue; }
    const pos = [];
    for (const pc of pieces) {
      let m; try { m = geom.mesh(pc.geomId); } catch { m = null; }
      if (!m || m.isEmpty) continue;
      const T = pc.matrix, P = m.pos, at = (i) => { const x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2]; return toProject(T[0] * x + T[4] * y + T[8] * z + T[12], T[1] * x + T[5] * y + T[9] * z + T[13], T[2] * x + T[6] * y + T[10] * z + T[14]); };
      for (let i = 0; i + 2 < m.idx.length; i += 3) { const a = at(m.idx[i]), b = at(m.idx[i + 1]), c = at(m.idx[i + 2]); pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
    }
    if (!pos.length) continue;
    tris += pos.length / 9; if (tris > maxTriangles) return { ok: false, why: 'big' };
    if (!B.has(h.building)) B.set(h.building, { els: [], storeys: new Set() });
    const pre = String(g.enm ? g.enm(g.a(pid, 'PredefinedType')) || '' : '');
    B.get(h.building).els.push({ id: pid, pos, storey: h.storey, floor: tp === 'IFCSLAB' && pre !== 'ROOF' && pre !== 'LANDING' });
    if (h.storey !== null) B.get(h.building).storeys.add(h.storey);
  }
  // every storey the model gives a building counts as a floor, with or without elements of its own
  for (const sid of f.ofType('IFCBUILDINGSTOREY')) { const b = B.get(home(sid).building); if (b) b.storeys.add(sid); }
  if (loose) notes.add('loose'); if (skipped) notes.add('skipped');
  if (!B.size) return { ok: false, why: 'nobuilding' };

  // one grid for the whole model
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const b of B.values()) for (const e of b.els) for (let i = 0; i < e.pos.length; i += 3) { const x = e.pos[i], y = e.pos[i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const fine = 0.05 / unitM; let cell = Math.max(fine, Math.sqrt(Math.max(1e-12, (x1 - x0) * (y1 - y0)) / maxCells));
  if (cell > fine * 1.0001) notes.add('coarse');
  x0 -= cell; y0 -= cell;
  const w = Math.ceil((x1 - x0) / cell) + 2, hh = Math.ceil((y1 - y0) / cell) + 2;
  const paint = (mask, e) => {
    const p = e.pos;
    for (let t = 0; t < p.length; t += 9) {
      const ax = (p[t] - x0) / cell, ay = (p[t + 1] - y0) / cell, bx = (p[t + 3] - x0) / cell, by = (p[t + 4] - y0) / cell, cx = (p[t + 6] - x0) / cell, cy = (p[t + 7] - y0) / cell;
      if (Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) < 1e-9) continue;   // edge-on in plan: a wall face
      const j0 = Math.max(0, Math.ceil(Math.min(ay, by, cy) - 0.5)), j1 = Math.min(hh - 1, Math.floor(Math.max(ay, by, cy) - 0.5));
      for (let j = j0; j <= j1; j++) {
        const y = j + 0.5; let lo = Infinity, hi = -Infinity;
        for (const [px, py, qx, qy] of [[ax, ay, bx, by], [bx, by, cx, cy], [cx, cy, ax, ay]]) { if ((py <= y && qy >= y) || (qy <= y && py >= y)) { if (py === qy) { lo = Math.min(lo, px, qx); hi = Math.max(hi, px, qx); } else { const x = px + (y - py) / (qy - py) * (qx - px); if (x < lo) lo = x; if (x > hi) hi = x; } } }
        const i0 = Math.max(0, Math.ceil(lo - 0.5)), i1 = Math.min(w - 1, Math.floor(hi - 0.5));
        for (let i = i0; i <= i1; i++) mask[j * w + i] = 1;
      }
    }
  };
  const count = (mask) => { let n = 0; for (let i = 0; i < mask.length; i++) n += mask[i]; return n; };

  const buildings = [];
  for (const [bid, b] of B) {
    const mask = new Uint8Array(w * hh); let zLo = Infinity, zHi = -Infinity;
    for (const e of b.els) { paint(mask, e); for (let i = 2; i < e.pos.length; i += 3) { if (e.pos[i] < zLo) zLo = e.pos[i]; if (e.pos[i] > zHi) zHi = e.pos[i]; } }
    const total = count(mask) * cell * cell; if (!(total > 0)) continue;
    const floors = Math.max(1, b.storeys.size), name = g.str(g.a(bid, 'Name')) || g.str(g.a(bid, 'LongName')) || '';
    // floor area: stated, else the storeys' slabs, else footprint × storeys
    const own = stated.get(bid) || {}; let gfa = own.qto ? own.qto / (unitM * unitM) : 0, gfaFrom = 'stated';
    if (!gfa) { let s = 0; for (const sid of b.storeys) s += (stated.get(sid) || {}).qto || 0; gfa = s / (unitM * unitM); }
    if (!gfa) { let s = own.cc || 0; for (const e of b.els) s += (stated.get(e.id) || {}).cc || 0; gfa = s / (unitM * unitM); }   // CivilCraft's own masses: on the mass element
    if (!gfa) {
      gfaFrom = 'slabs';
      for (const sid of b.storeys) { const els = b.els.filter((e) => e.floor && e.storey === sid); if (!els.length) continue; const sm = new Uint8Array(w * hh); for (const e of els) paint(sm, e); gfa += count(sm) * cell * cell; }
    }
    if (!gfa) { gfaFrom = 'footprint'; gfa = total * floors; }
    // the outline(s): one IfcBuilding may stand in several pieces
    const rings = traceMask(mask, w, hh).map((r) => r.map(([i, j]) => ({ x: x0 + i * cell, y: y0 + j * cell })));
    const sized = rings.map((r) => { let a2 = 0; for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length]; a2 += p.x * q.y - q.x * p.y; } return { r, a: Math.abs(a2) / 2 }; }).filter((x) => x.a >= 0.25 / (unitM * unitM))   // a quarter of a square metre: smaller is a post or a step, not a building.sort((p, q) => q.a - p.a).slice(0, 50);
    const sumA = sized.reduce((m, x) => m + x.a, 0); if (!(sumA > 0)) continue;
    sized.forEach((x, n) => {
      const ring = straighten(x.r, cell * 0.75); if (ring.length < 3) return;
      const part = x.a / sumA;
      buildings.push({ name: (name || 'Building') + (sized.length > 1 ? ' (' + (n + 1) + ')' : ''), ring, area: x.a, floors, height: zHi - zLo, gfa: gfaFrom === 'footprint' ? x.a * floors : gfa * part, gfaFrom, part: n + 1 });
    });
  }
  if (!buildings.length) return { ok: false, why: 'nobuilding' };
  return { ok: true, schema: f.schemaName || '', fileUnit, georef: !!M, cell, buildings, notes: [...notes], counts: { buildings: B.size, triangles: tris, loose, skipped } };
}
