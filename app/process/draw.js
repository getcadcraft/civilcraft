/* SPDX-License-Identifier: Apache-2.0 */
/**
 * draw.js — what the P&ID add-on and the Plant tab draw from the process engines (0.8 chem-draw_PART_4; DOM-free, no imports). Everything returns plain entities
 * ({ type: 'line'|'circle'|'poly'|'text', layer, … } in the units asked for) and plain tables, so the hosts only have to add them.
 *
 *   pfdEntities(def, res?, opts)        CH.2   the block flow / process flow diagram of a flowsheet: units in columns by flow, streams as arrows with their names, recycles over the top
 *   nodeInside(node-rect, items)        CH.14  which tags and line numbers lie inside a hazop node's region
 *   regionEntities(node, opts)          CH.14  the node boundary and its label as entities on layer HAZOP-NODE
 *   markerEntities(markers, at, opts)   CH.27 / XE.9  value labels beside tagged symbols, coloured by state
 *   markerLevels(markers)               XE.9   0..1 level per tag for tinting 3D elements
 *   loopTable(loops, bindings, spec)    CH.5   the loop binding screen's rows and what is unbound
 *   faceplate(ctrl, trend)              CH.5   the numbers a controller faceplate shows from a simulation
 */
const f = (v) => (Number.isFinite(v) ? +Number(v).toFixed(3) : 0);
const short = (s, n = 18) => String(s ?? '').slice(0, n);

/** @param def a flowsheet definition ({ feeds, units[{id,type,in,out}] }); @param res optional solved result ({ streams }) for the labels under the arrows */
export function pfdEntities(def, res = null, { unitW = 60, unitH = 30, gapX = 50, gapY = 24, h = 3, x0 = 0, y0 = 0 } = {}) {
  const U = def.units || [], ents = [], prod = {};
  U.forEach((u, i) => (u.out || []).forEach((s) => { prod[s] = i; }));
  const level = U.map(() => 0);
  U.forEach((u, i) => { for (const s of u.in || []) { const p = prod[s]; if (p != null && p < i) level[i] = Math.max(level[i], level[p] + 1); } });
  const rowIn = new Map(), pos = [];
  U.forEach((u, i) => { const k = rowIn.get(level[i]) || 0; rowIn.set(level[i], k + 1); pos.push({ x: x0 + (level[i] + 1) * (unitW + gapX), y: y0 - k * (unitH + gapY) }); });
  const line = (x1, y1, x2, y2, layer) => ents.push({ type: 'line', x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), layer });
  const text = (x, y, s, layer = 'PFD-TEXT', ha = 'center', size = h) => ents.push({ type: 'text', x: f(x), y: f(y), h: size, rot: 0, s: String(s), ha, va: 'middle', layer });
  const arrow = (x1, y1, x2, y2, layer = 'PFD-STREAM') => {
    line(x1, y1, x2, y2, layer);
    const a = Math.atan2(y2 - y1, x2 - x1), l = h * 1.2;
    for (const d of [0.45, -0.45]) line(x2, y2, x2 - l * Math.cos(a + d), y2 - l * Math.sin(a + d), layer);
  };
  U.forEach((u, i) => {
    const { x, y } = pos[i], w = unitW, hh = unitH, t = u.type;
    if (/pump|compressor/.test(t)) ents.push({ type: 'circle', cx: f(x), cy: f(y), r: f(Math.min(w, hh) / 2), layer: 'PFD-UNIT' });
    else if (t === 'valve') ents.push({ type: 'poly', pts: [[x - w / 4, y, 0], [x, y + hh / 3, 0], [x + w / 4, y, 0], [x, y - hh / 3, 0]], closed: true, layer: 'PFD-UNIT' });
    else ents.push({ type: 'poly', pts: [[x - w / 2, y - hh / 2, 0], [x + w / 2, y - hh / 2, 0], [x + w / 2, y + hh / 2, 0], [x - w / 2, y + hh / 2, 0]], closed: true, layer: 'PFD-UNIT' });
    text(x, y + h * 0.7, short(u.id, 14), 'PFD-TEXT'); text(x, y - h * 0.9, short(t, 16), 'PFD-TEXT', 'center', h * 0.8);
  });
  const edge = (i, side) => ({ x: pos[i].x + (side === 'r' ? 1 : -1) * (/pump|compressor/.test(U[i].type) ? Math.min(unitW, unitH) / 2 : unitW / 2), y: pos[i].y });
  const streamLabel = (id) => { const s = res && res.streams && res.streams[id]; return s && Number.isFinite(s.T) ? `${id}  ${f(s.T - 273.15)} C  ${f(s.P / 1e5)} bar` : id; };
  const consumed = new Set();
  U.forEach((u, j) => (u.in || []).forEach((s) => {
    const p = prod[s];
    if (p == null) {                                                 // a feed
      const b = edge(j, 'l'), k = (u.in || []).indexOf(s);
      arrow(b.x - gapX * 0.9, b.y + (k ? -1 : 1) * (k ? unitH * 0.3 : 0), b.x, b.y + (k ? -unitH * 0.3 : 0), 'PFD-FEED'); text(b.x - gapX * 0.45, b.y + (k ? -1 : 1) * h * 1.4 - (k ? unitH * 0.3 : 0), streamLabel(s), 'PFD-TEXT', 'center', h * 0.8);
      consumed.add(s); return;
    }
    consumed.add(s);
    const a = edge(p, 'r'), b = edge(j, 'l'), kOut = (U[p].out || []).indexOf(s), dy = (U[p].out || []).length > 1 ? (kOut === 0 ? 1 : -1) * unitH * 0.3 : 0;
    if (p < j && level[p] < level[j]) {
      const ya = a.y + dy;
      if (Math.abs(ya - b.y) < 1e-6) arrow(a.x, ya, b.x, b.y);
      else { line(a.x, ya, (a.x + b.x) / 2, ya, 'PFD-STREAM'); line((a.x + b.x) / 2, ya, (a.x + b.x) / 2, b.y, 'PFD-STREAM'); arrow((a.x + b.x) / 2, b.y, b.x, b.y); }
      text((a.x + b.x) / 2, Math.max(ya, b.y) + h * 1.6, streamLabel(s), 'PFD-TEXT', 'center', h * 0.8);
    } else {                                                          // a recycle: out of the top of the producer, over, down into the consumer
      const top = Math.max(pos[p].y, pos[j].y) + unitH + gapY * 0.8 + (j % 3) * h * 2;
      line(pos[p].x, pos[p].y + unitH / 2, pos[p].x, top, 'PFD-RECYCLE'); line(pos[p].x, top, b.x - gapX * 0.4, top, 'PFD-RECYCLE'); line(b.x - gapX * 0.4, top, b.x - gapX * 0.4, b.y, 'PFD-RECYCLE'); arrow(b.x - gapX * 0.4, b.y, b.x, b.y, 'PFD-RECYCLE');
      text((pos[p].x + b.x) / 2, top + h * 1.2, streamLabel(s) + ' (recycle)', 'PFD-TEXT', 'center', h * 0.8);
    }
  }));
  U.forEach((u, i) => (u.out || []).forEach((s, k) => {                // products
    if (consumed.has(s)) return;
    const a = edge(i, 'r'), dy = (u.out || []).length > 1 ? (k === 0 ? 1 : -1) * unitH * 0.3 : 0;
    arrow(a.x, a.y + dy, a.x + gapX * 0.9, a.y + dy, 'PFD-PRODUCT'); text(a.x + gapX * 0.45, a.y + dy + h * 1.4, streamLabel(s), 'PFD-TEXT', 'center', h * 0.8);
  }));
  const xs = ents.flatMap((e) => (e.type === 'line' ? [e.x1, e.x2] : e.type === 'poly' ? e.pts.map((p) => p[0]) : e.type === 'circle' ? [e.cx - e.r, e.cx + e.r] : [e.x])), ys = ents.flatMap((e) => (e.type === 'line' ? [e.y1, e.y2] : e.type === 'poly' ? e.pts.map((p) => p[1]) : e.type === 'circle' ? [e.cy - e.r, e.cy + e.r] : [e.y]));
  return { entities: ents, bounds: { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }, levels: level, positions: pos };
}

const inPoly = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p.y) !== (b[1] > p.y) && p.x < ((b[0] - a[0]) * (p.y - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
/** items: [{ tag?, ln?, x, y }]; region: [[x,y]…] (a polygon) or a rectangle [x0,y0,x1,y1]. → { tags, lines } inside. */
export function nodeInside(region, items) {
  const poly = region.length === 4 && typeof region[0] === 'number' ? [[region[0], region[1]], [region[2], region[1]], [region[2], region[3]], [region[0], region[3]]] : region;
  const tags = [], lines = [];
  for (const it of items || []) { if (!inPoly(it, poly)) continue; if (it.tag && !tags.includes(it.tag)) tags.push(it.tag); if (it.ln && !lines.includes(it.ln)) lines.push(it.ln); }
  return { tags, lines };
}
export function regionEntities(node, { h = 3 } = {}) {
  const r = node.region || []; if (r.length < 3) return [];
  const ents = [{ type: 'poly', pts: r.map(([x, y]) => [x, y, 0]), closed: true, layer: 'HAZOP-NODE' }], minY = Math.max(...r.map((p) => p[1])), minX = Math.min(...r.map((p) => p[0]));
  ents.push({ type: 'text', x: f(minX + h * 0.5), y: f(minY - h * 1.2), h, rot: 0, s: `${node.id} ${short(node.name, 40)}`, ha: 'left', va: 'middle', layer: 'HAZOP-NODE' });
  return ents;
}

const STATE_COLOUR = { ok: 3, uncertain: 2, bad: 1, stale: 8, high: 1, low: 5, waiting: 8 };
/** markers: [{ tag, text, state }]; at: Map tag → { x, y } of the symbol. Layers LIVE-<STATE>. → entities (a label to the right of each symbol) and the layer colours to create. */
export function markerEntities(markers, at, { h = 3, dx = 0, dy = 0 } = {}) {
  const ents = [], missing = [];
  for (const m of markers || []) {
    const p = at.get(String(m.tag)); if (!p) { missing.push(m.tag); continue; }
    ents.push({ type: 'text', x: f(p.x + (p.r || 0) + dx + h), y: f(p.y + dy), h, rot: 0, s: `${m.text}${m.state && m.state !== 'ok' ? ' [' + m.state + ']' : ''}`, ha: 'left', va: 'middle', layer: 'LIVE-' + String(m.state || 'ok').toUpperCase(), tag: String(m.tag) });
  }
  return { entities: ents, missing, layers: Object.fromEntries(Object.entries(STATE_COLOUR).map(([s, c]) => ['LIVE-' + s.toUpperCase(), c])) };
}
export function markerLevels(markers) { return (markers || []).filter((m) => m && m.tag != null).map((m) => ({ tag: String(m.tag), level: Number.isFinite(m.level) ? Math.max(0, Math.min(1, m.level)) : null, state: m.state || 'ok' })); }

/** loops: controls.loops(pid) → [{ id, members[{tag, role}] }]. bindings: { controllerTag: { pv, mv, sp, Kc, Ti, Td, action, span } }. → rows for the screen. */
export function loopTable(loops, bindings = {}) {
  const rows = [];
  for (const l of loops || []) for (const m of l.members || []) if (m.role === 'controller') {
    const b = bindings[m.tag] || {};
    rows.push({ loop: l.id, tag: m.tag, pv: b.pv || '', mv: b.mv || '', sp: b.sp ?? '', Kc: b.Kc ?? '', Ti: b.Ti ?? '', Td: b.Td ?? '', action: b.action || 'reverse', span: b.span || null, bound: !!(b.pv && b.mv), members: l.members.map((x) => x.tag + ' (' + x.role + ')') });
  }
  return rows;
}
/** A faceplate from a simulation result: the controller record, the trend of its pv and output, and the numbers the plate shows. */
export function faceplate(ctrl, trend = null) {
  const last = (a) => (Array.isArray(a) && a.length ? a[a.length - 1] : null);
  const pv = trend && trend.pv, out = trend && trend.out;
  return { tag: ctrl.id, mode: ctrl.auto === false ? 'MAN' : 'AUTO', sp: ctrl.sp, pv: last(pv), out: ctrl.auto === false ? ctrl.out ?? null : last(out), action: ctrl.action, Kc: ctrl.Kc, Ti: ctrl.Ti ?? null, Td: ctrl.Td ?? null, span: ctrl.span || null,
    error: Number.isFinite(last(pv)) && Number.isFinite(ctrl.sp) ? ctrl.sp - last(pv) : null };
}
