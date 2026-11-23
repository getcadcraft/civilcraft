// SPDX-License-Identifier: Apache-2.0
/**
 * lib/fence/index.js: the fence generator (0.10 SU.1814b, session civil-site-10). Host-free: no DOM, no imports. lib/fence/ is canonical; each host
 * carries a byte-identical copy in <app>/dev/fence/ (node tools/fence/sync.mjs <host>). Hosts: CivilCraft (fence-ui.js, site-gen-agent.js);
 * BimCraft's adapter is an Inbox line to `bim-core-10`.
 *
 * Units are the caller's (project units, metres or feet); the defaults below are labelled usual choices, a designer sets the real ones, and
 * local rules limit a fence's height. Nothing here is a code requirement.
 *
 *   defaults(units) → { height, postSize, postSpacing, embed, gap, maxGap, panelThk, rails, railSize, picketW, picketGap, gateWidth, doubleFrom, cornerDeg, terrain, style }
 *   clean(rec, units) → a checked record or null (untrusted: a saved project)
 *       rec = { id, name, pts [{x, y}], closed, style 'panel'|'rails'|'pickets', terrain 'raked'|'stepped', height, postSize, postSpacing, embed, gap, maxGap,
 *               panelThk, rails, railSize, picketW, picketGap, cornerDeg, doubleFrom (gate width from which it has two leaves), gates [{ s (station from the start, in units), width, name }], type (a name from the Library, free text) }
 *   build(rec, { zAt(x, y) → ground | null, units }) → layout
 *       layout = { posts: [{ id, kind 'end'|'line'|'corner'|'gate', x, y, ground, base, top, size }],
 *                  panels: [{ id, a: { x, y, z }, b: { x, y, z }, height, len, plan, gapMax, gapMin }],     z = the panel's bottom at that post
 *                  rails: [{ id, a: { x, y, z }, b: { x, y, z }, size }],     the rails of a 'rails' fence, centre line heights
 *                  gates: [{ id, name, a: { x, y, z }, b: { x, y, z }, width, height, leaves, normal: { x, y } }],
 *                  stats: { length, spans, steps, postsByKind, panelArea, railLength, pickets, maxGap, minGap }, problems: [{ code, ... }] }
 *   schedule(layout, units) → { rows: [{ item, kind, qty, length, size }], totals }     posts by kind, panels, rails, pickets, gates
 *   scheduleCsv(layout, units) → CSV text
 *   planItems(layout, { mmPerUnit }) → drawing items (layers FENCE_LAYERS)
 *   ifcModel(layout, units) → { posts, panels, rails, gates } in project units for the host's IFC writer
 *
 * THE RULES the tests hold to (lib/fence/test/fence.test.mjs, numbers worked by hand):
 *   posts at the start and end (not on a closed path), at every vertex (a corner post when the path turns by cornerDeg or more), at both edges of every gate,
 *   and at equal spacing between those, each bay no longer than postSpacing. A gate lies inside one straight run.
 *   raked: each panel's bottom runs parallel to the straight line between its posts' ground, `gap` above it; stepped: each panel is level, its bottom `gap`
 *   above the highest ground it covers, so the gap is widest at the downhill post. A gap above maxGap, or ground above a panel's bottom, is a problem.
 */
export const STYLES = ['panel', 'rails', 'pickets'];
export const TERRAIN = ['raked', 'stepped'];
export const KINDS = ['end', 'line', 'corner', 'gate'];
export const FENCE_LAYERS = [['C-FENC-POST', 'fc.layer.post', 3], ['C-FENC', 'fc.layer.run', 3], ['C-FENC-GATE', 'fc.layer.gate', 4]];
export const MAX_POSTS = 5000;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const EPS = 1e-9;
const r6 = (v) => Math.round(v * 1e6) / 1e6;

export function defaults(units) {
  const m = units === 'm';
  return { height: m ? 1.8 : 6, postSize: m ? 0.1 : 0.33, postSpacing: m ? 2.4 : 8, embed: m ? 0.6 : 2, gap: m ? 0.05 : 0.15, maxGap: m ? 0.15 : 0.5, panelThk: m ? 0.03 : 0.1,
    rails: 2, railSize: m ? 0.05 : 0.17, picketW: m ? 0.09 : 0.3, picketGap: m ? 0.01 : 0.03, gateWidth: m ? 1 : 3.5, doubleFrom: m ? 1.8 : 6, cornerDeg: 20, terrain: 'raked', style: 'panel' };
}

export function clean(rec, units) {
  if (!rec || typeof rec !== 'object' || !/^fc\d{1,9}$/.test(String(rec.id))) return null;
  const pts = (Array.isArray(rec.pts) ? rec.pts.slice(0, 5000) : []).filter((q) => q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9).map((q) => ({ x: q.x, y: q.y }));
  const closed = rec.closed === true;
  if (pts.length < (closed ? 3 : 2)) return null;
  const d = defaults(units), pos = (v, dv, max = 1e4) => (fin(v) && v > 0 && v <= max ? v : dv), nn = (v, dv, max = 1e4) => (fin(v) && v >= 0 && v <= max ? v : dv);
  const gates = (Array.isArray(rec.gates) ? rec.gates.slice(0, 200) : []).filter((g) => g && fin(g.s) && g.s >= 0 && fin(g.width) && g.width > 0 && g.width < 1e3)
    .map((g) => ({ s: g.s, width: g.width, name: str(g.name, 60) })).sort((a, b) => a.s - b.s);
  return { id: String(rec.id), name: str(rec.name) || String(rec.id), pts, closed, style: STYLES.includes(rec.style) ? rec.style : d.style, terrain: TERRAIN.includes(rec.terrain) ? rec.terrain : d.terrain,
    height: pos(rec.height, d.height, 100), postSize: pos(rec.postSize, d.postSize, 10), postSpacing: pos(rec.postSpacing, d.postSpacing, 1000), embed: nn(rec.embed, d.embed, 100),
    gap: nn(rec.gap, d.gap, 100), maxGap: nn(rec.maxGap, d.maxGap, 100), panelThk: pos(rec.panelThk, d.panelThk, 10), rails: Number.isInteger(rec.rails) && rec.rails >= 1 && rec.rails <= 8 ? rec.rails : d.rails,
    railSize: pos(rec.railSize, d.railSize, 10), picketW: pos(rec.picketW, d.picketW, 10), picketGap: nn(rec.picketGap, d.picketGap, 10), cornerDeg: nn(rec.cornerDeg, d.cornerDeg, 180), doubleFrom: pos(rec.doubleFrom, d.doubleFrom, 1000), gates, type: str(rec.type, 120), typeRef: /^[0-9a-f-]{8,40}$/i.test(String(rec.typeRef ?? '')) ? String(rec.typeRef) : '' };
}

const lerp = (a, b, f) => ({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });

/** The fence of one record on the ground (see the header). Never throws on a clean record. */
export function build(rec, { zAt = null, units = 'ft' } = {}) {
  const r = clean(rec, units), out = { posts: [], panels: [], rails: [], gates: [], stats: null, problems: [] };
  if (!r) { out.problems.push({ code: 'record' }); out.stats = { length: 0, spans: 0, steps: 0, postsByKind: {}, panelArea: 0, railLength: 0, pickets: 0, maxGap: 0, minGap: 0 }; return out; }
  const P = r.closed ? [...r.pts, r.pts[0]] : r.pts, segs = [];
  let L = 0;
  for (let i = 0; i + 1 < P.length; i++) { const l = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y); if (l > EPS) segs.push({ a: P[i], b: P[i + 1], l, s0: L }); L += l; }
  if (!segs.length) { out.problems.push({ code: 'short' }); out.stats = { length: 0, spans: 0, steps: 0, postsByKind: {}, panelArea: 0, railLength: 0, pickets: 0, maxGap: 0, minGap: 0 }; return out; }
  const at = (s) => { const g = segs.find((q) => s <= q.s0 + q.l + 1e-7) || segs[segs.length - 1]; return lerp(g.a, g.b, Math.min(1, Math.max(0, (s - g.s0) / g.l))); };
  // deflection (degrees) at each vertex station
  const defl = (i) => { const a = segs[(i + segs.length - 1) % segs.length], b = segs[i % segs.length]; const t1 = Math.atan2(a.b.y - a.a.y, a.b.x - a.a.x), t2 = Math.atan2(b.b.y - b.a.y, b.b.x - b.a.x); let d = Math.abs(t2 - t1) * 180 / Math.PI; if (d > 180) d = 360 - d; return d; };
  // mandatory stations: ends, vertices, gate edges
  const mand = new Map();   // station → { vertex: i | null, gate: true }
  const mark = (s, f) => { const k = r6(s); const cur = mand.get(k) || {}; mand.set(k, { ...cur, ...f }); };
  mark(0, { vertex: 0 }); mark(L, { vertex: r.closed ? 0 : segs.length });
  segs.forEach((g, i) => { if (i > 0) mark(g.s0, { vertex: i }); });
  const gates = [];
  for (const g of r.gates) {
    const seg = segs.find((q) => g.s >= q.s0 - 1e-7 && g.s + g.width <= q.s0 + q.l + 1e-7);
    if (!seg) { out.problems.push({ code: 'gate.span', s: g.s, name: g.name }); continue; }
    if (gates.some((o) => g.s < o.s + o.width - 1e-7 && o.s < g.s + g.width - 1e-7)) { out.problems.push({ code: 'gate.overlap', s: g.s, name: g.name }); continue; }
    gates.push(g); mark(g.s, { gate: true }); mark(g.s + g.width, { gate: true });
  }
  const st = [...mand.keys()].sort((a, b) => a - b);
  // posts at stations, with equal bays between the mandatory ones (never a gate span)
  const gateAt = (a, b) => gates.find((g) => Math.abs(g.s - a) < 1e-6 && Math.abs(g.s + g.width - b) < 1e-6);
  const nodes = [];   // { s, kind }
  const kindOf = (s) => { const m = mand.get(r6(s)); if (!m) return 'line'; if (m.gate) return 'gate'; if (m.vertex != null) { if (!r.closed && (m.vertex === 0 || m.vertex === segs.length)) return 'end'; const i = m.vertex === segs.length ? 0 : m.vertex; return defl(i) >= r.cornerDeg ? 'corner' : 'line'; } return 'line'; };
  const spans = [];   // { s0, s1, gate | null }
  for (let i = 0; i + 1 < st.length; i++) {
    const a = st[i], b = st[i + 1];
    if (b - a < EPS) continue;
    const gt = gateAt(a, b);
    if (gt) { nodes.push({ s: a }); spans.push({ s0: a, s1: b, gate: gt }); continue; }
    const n = Math.max(1, Math.ceil((b - a) / r.postSpacing - 1e-9));
    for (let k = 0; k < n; k++) { nodes.push({ s: a + ((b - a) * k) / n }); spans.push({ s0: a + ((b - a) * k) / n, s1: a + ((b - a) * (k + 1)) / n, gate: null }); }
  }
  nodes.push({ s: L });
  if (nodes.length > MAX_POSTS) { out.problems.push({ code: 'toomany', posts: nodes.length }); out.stats = { length: L, spans: 0, steps: 0, postsByKind: {}, panelArea: 0, railLength: 0, pickets: 0, maxGap: 0, minGap: 0 }; return out; }
  let off = 0;
  const zOf = (x, y) => { const z = zAt ? zAt(x, y) : 0; if (fin(z)) return z; off++; return null; };
  const ground = nodes.map((n) => { const p = at(n.s); return zOf(p.x, p.y); });
  // fill unknown ground from the nearest known post so the geometry stays closed (reported once)
  let last = ground.find((z) => z !== null) ?? 0;
  for (let i = 0; i < ground.length; i++) { if (ground[i] === null) ground[i] = last; else last = ground[i]; }
  if (off) out.problems.push({ code: 'ground.off', count: off });
  const closedLast = r.closed ? nodes.length - 1 : -1;   // the last node is the first again on a closed path
  const nz = (s) => ({ s });
  // spans → panels / gates
  let maxGap = 0, minGap = Infinity, steps = 0, railLen = 0, pickets = 0, area = 0;
  const top = nodes.map(() => -Infinity);
  const samples = (a, b, f) => { const o = []; for (let k = 0; k <= 6; k++) { const p = lerp(a, b, k / 6); o.push(f(p, k / 6)); } return o; };
  spans.forEach((sp, i) => {
    const a = at(sp.s0), b = at(sp.s1), za = ground[i], zb = ground[i + 1], len = sp.s1 - sp.s0;
    const gr = samples(a, b, (p) => { const z = zOf(p.x, p.y); return z === null ? za + (zb - za) : z; });
    if (sp.gate) {
      const bz = Math.max(za, zb) + r.gap, nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
      out.gates.push({ id: r.id + '-g' + (out.gates.length + 1), name: sp.gate.name, a: { x: a.x, y: a.y, z: bz }, b: { x: b.x, y: b.y, z: bz }, width: len, height: r.height, leaves: len >= r.doubleFrom ? 2 : 1, normal: { x: nx, y: ny } });
      top[i] = Math.max(top[i], bz + r.height); top[i + 1] = Math.max(top[i + 1], bz + r.height);
      return;
    }
    let ba, bb;
    if (r.terrain === 'stepped') { ba = bb = Math.max(...gr) + r.gap; } else { ba = za + r.gap; bb = zb + r.gap; }
    const gaps = gr.map((g, k) => (ba + (bb - ba) * (k / 6)) - g), gMax = Math.max(...gaps), gMin = Math.min(...gaps);
    maxGap = Math.max(maxGap, gMax); minGap = Math.min(minGap, gMin);
    const slope = Math.hypot(len, bb - ba);
    out.panels.push({ id: r.id + '-n' + (out.panels.length + 1), a: { x: a.x, y: a.y, z: ba }, b: { x: b.x, y: b.y, z: bb }, height: r.height, len: slope, plan: len, gapMax: gMax, gapMin: gMin });
    area += slope * r.height;
    if (gMax > r.maxGap + 1e-9) out.problems.push({ code: 'gap.wide', panel: out.panels.at(-1).id, gap: gMax, limit: r.maxGap });
    if (gMin < -1e-9) out.problems.push({ code: 'gap.ground', panel: out.panels.at(-1).id, by: -gMin });
    top[i] = Math.max(top[i], ba + r.height); top[i + 1] = Math.max(top[i + 1], bb + r.height);
    if (r.style === 'rails') {
      for (let k = 0; k < r.rails; k++) {
        const f = r.rails === 1 ? 0.5 : k / (r.rails - 1), h = r.railSize / 2 + f * (r.height - r.railSize);
        out.rails.push({ id: r.id + '-r' + (out.rails.length + 1), a: { x: a.x, y: a.y, z: ba + h }, b: { x: b.x, y: b.y, z: bb + h }, size: r.railSize }); railLen += slope;
      }
    }
    if (r.style === 'pickets') pickets += Math.max(0, Math.floor((len + r.picketGap) / (r.picketW + r.picketGap) + 1e-9));
  });
  // stepped panels: a step at each post where the neighbours' bottoms differ
  if (r.terrain === 'stepped') for (let i = 1; i < out.panels.length; i++) if (Math.abs(out.panels[i].a.z - out.panels[i - 1].b.z) > 1e-6) steps++;
  const kinds = {};
  nodes.forEach((n, i) => {
    if (i === closedLast) return;   // the first post again
    const p = at(n.s), kind = kindOf(n.s);
    const t = fin(top[i]) ? top[i] : ground[i] + r.height;
    out.posts.push({ id: r.id + '-p' + (out.posts.length + 1), kind, x: p.x, y: p.y, ground: ground[i], base: ground[i] - r.embed, top: t, size: r.postSize });
    kinds[kind] = (kinds[kind] || 0) + 1;
  });
  // on a closed path the first post also carries the last panel's top
  if (r.closed && out.posts.length && fin(top[closedLast])) out.posts[0].top = Math.max(out.posts[0].top, top[closedLast]);
  out.stats = { length: L, spans: spans.length, steps, postsByKind: kinds, panelArea: area, railLength: railLen, pickets, maxGap: out.panels.length ? maxGap : 0, minGap: out.panels.length ? minGap : 0 };
  void nz;
  return out;
}

export function schedule(layout, units = 'ft') {
  const m = units === 'm', rows = [];
  for (const k of KINDS) {
    const ps = layout.posts.filter((p) => p.kind === k);
    if (ps.length) rows.push({ item: 'post', kind: k, qty: ps.length, length: ps.reduce((s, p) => s + (p.top - p.base), 0), size: ps[0].size });
  }
  if (layout.panels.length) rows.push({ item: 'panel', kind: '', qty: layout.panels.length, length: layout.panels.reduce((s, p) => s + p.len, 0), size: layout.panels[0].height, area: layout.stats.panelArea });
  if (layout.rails.length) rows.push({ item: 'rail', kind: '', qty: layout.rails.length, length: layout.stats.railLength, size: layout.rails[0].size });
  if (layout.stats.pickets) rows.push({ item: 'picket', kind: '', qty: layout.stats.pickets, length: layout.panels[0] ? layout.panels[0].height * layout.stats.pickets : 0, size: 0 });
  for (const g of layout.gates) rows.push({ item: 'gate', kind: g.leaves === 2 ? 'double' : 'single', qty: 1, length: g.width, size: g.height, name: g.name });
  return { rows, totals: { length: layout.stats.length, posts: layout.posts.length, panels: layout.panels.length, gates: layout.gates.length, unit: m ? 'm' : 'ft' } };
}

export function scheduleCsv(layout, units = 'ft') {
  const s = schedule(layout, units), q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"', n = (v) => (v === undefined ? '' : String(Math.round(v * 1000) / 1000));
  const lines = [['item', 'kind', 'name', 'qty', 'length_' + units, 'size_' + units, 'area_' + units + '2'].map(q).join(',')];
  for (const r of s.rows) lines.push([r.item, r.kind, r.name || '', r.qty, n(r.length), n(r.size), n(r.area)].map(q).join(','));
  lines.push(['total', '', '', '', n(s.totals.length), '', ''].map(q).join(','));
  return lines.join('\n') + '\n';
}

/** Plan symbols: a square per post, the run line, each gate's leaves open 90 degrees with their swing arcs. */
export function planItems(layout, { mmPerUnit = 1 } = {}) {
  const items = [];
  for (const p of layout.posts) { const h = p.size / 2; items.push({ layer: 'C-FENC-POST', kind: 'poly', closed: true, pts: [{ x: p.x - h, y: p.y - h }, { x: p.x + h, y: p.y - h }, { x: p.x + h, y: p.y + h }, { x: p.x - h, y: p.y + h }] }); }
  for (const n of layout.panels) items.push({ layer: 'C-FENC', kind: 'poly', pts: [{ x: n.a.x, y: n.a.y }, { x: n.b.x, y: n.b.y }] });
  for (const g of layout.gates) {
    const leaves = g.leaves, w = g.width / leaves;
    for (let k = 0; k < leaves; k++) {
      const hinge = k === 0 ? g.a : g.b, dir = k === 0 ? 1 : -1, ux = (g.b.x - g.a.x) / g.width * dir, uy = (g.b.y - g.a.y) / g.width * dir;
      const tip = { x: hinge.x + g.normal.x * w, y: hinge.y + g.normal.y * w };
      items.push({ layer: 'C-FENC-GATE', kind: 'poly', pts: [{ x: hinge.x, y: hinge.y }, tip] });
      const arc = []; for (let i = 0; i <= 8; i++) { const t = (i / 8) * Math.PI / 2; arc.push({ x: hinge.x + (ux * Math.cos(t) + g.normal.x * Math.sin(t)) * w, y: hinge.y + (uy * Math.cos(t) + g.normal.y * Math.sin(t)) * w }); }
      items.push({ layer: 'C-FENC-GATE', kind: 'poly', pts: arc });
    }
  }
  void mmPerUnit;
  return items;
}

export function ifcModel(layout, units = 'ft') {
  void units;
  if (!layout.posts.length && !layout.panels.length) return null;
  return { posts: layout.posts, panels: layout.panels, rails: layout.rails, gates: layout.gates };
}

/**
 * pickets(layout, rec) → [{ id, x, y, w, z (bottom), height, panel }]: one element per picket (SU.1814b: one element per part). Pickets stand on a panel's
 * bottom line (raked: parallel to the ground; stepped: level), each picketW wide, picketGap apart, the leftover split at both ends of the bay.
 */
export function pickets(layout, rec) {
  const r = clean(rec, rec?.units || 'ft');
  if (!r || r.style !== 'pickets') return [];
  const out = [];
  for (const p of layout.panels) {
    const L = Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y);
    const n = Math.max(0, Math.floor((L + r.picketGap) / (r.picketW + r.picketGap) + 1e-9));
    if (!n || out.length + n > 20000) continue;
    const used = n * r.picketW + (n - 1) * r.picketGap, lead = (L - used) / 2;
    for (let i = 0; i < n; i++) {
      const t = (lead + r.picketW / 2 + i * (r.picketW + r.picketGap)) / L;
      out.push({ id: p.id + '-k' + (i + 1), x: r6(p.a.x + (p.b.x - p.a.x) * t), y: r6(p.a.y + (p.b.y - p.a.y) * t), w: r.picketW, z: r6(p.a.z + (p.b.z - p.a.z) * t), height: p.height, panel: p.id, dx: (p.b.x - p.a.x) / L, dy: (p.b.y - p.a.y) / L });
    }
  }
  return out;
}

/**
 * parts(layout, rec) → one element per part, for a BIM host: [{ id, part 'post'|'panel'|'rail'|'picket'|'gate', ifc 'IfcMember'|'IfcRailing'|'IfcDoor', name, ...geometry as the layout gives it }].
 * A panel of a 'pickets' fence is NOT also listed as one solid element: its pickets are the elements (the panel row stays for the schedule, flagged `virtual`).
 */
export function parts(layout, rec) {
  const pk = pickets(layout, rec), list = [];
  for (const p of layout.posts) list.push({ ...p, part: 'post', ifc: 'IfcMember', name: 'Post ' + p.id });
  for (const p of layout.panels) list.push({ ...p, part: 'panel', ifc: 'IfcRailing', name: 'Panel ' + p.id, virtual: pk.some((k) => k.panel === p.id) });
  for (const p of layout.rails) list.push({ ...p, part: 'rail', ifc: 'IfcMember', name: 'Rail ' + p.id });
  for (const k of pk) list.push({ ...k, part: 'picket', ifc: 'IfcMember', name: 'Picket ' + k.id });
  for (const g of layout.gates) list.push({ ...g, part: 'gate', ifc: 'IfcDoor', name: g.name || 'Gate ' + g.id });
  return list;
}

/**
 * typeFromItem(item, units) → a record patch from a Library fence type (SU.1814b), or null. Two shapes are read:
 *   the Library's (0.11, owner 2026-11-21): kind 'type', category 'types/barriers', type { element 'barrier', barrier { subtype 'fence', height, style,
 *     terrain, postSize, postSpacing, rails, railSize, picketW, picketGap, panelThk, gap, maxGap, embed } } in MILLIMETRES (item format 1);
 *   the older item file: kind 'fence-type', params { the same keys } in METRES (files people saved before the Barriers category).
 * The patch is in the caller's units and passes clean(); `type` carries the item's name, `typeRef` its uuid. Unknown or out of range values are dropped, never guessed.
 * A Barriers type of another sub-type (guard, handrail, balustrade, road guardrail) is not a fence: null.
 */
export const BARRIER_CATEGORY = 'types/barriers';
function fenceParams(item) {
  if (item.kind === 'fence-type') return item.params && typeof item.params === 'object' ? { pr: item.params, mm: false } : null;
  const b = item.kind === 'type' && item.type && typeof item.type === 'object' && item.type.element === 'barrier' ? item.type.barrier : null;
  return b && typeof b === 'object' && b.subtype === 'fence' ? { pr: b, mm: true } : null;
}
export function typeFromItem(item, units = 'ft') {
  const fp = item && typeof item === 'object' ? fenceParams(item) : null;
  if (!fp) return null;
  const f = (units === 'ft' ? 1 / 0.3048 : 1) * (fp.mm ? 0.001 : 1), pr = fp.pr, patch = { type: str(item.name, 120) };
  if (/^[0-9a-f-]{8,40}$/i.test(String(item.uuid ?? ''))) patch.typeRef = String(item.uuid);
  if (STYLES.includes(pr.style)) patch.style = pr.style;
  if (TERRAIN.includes(pr.terrain)) patch.terrain = pr.terrain;
  for (const k of ['height', 'postSize', 'postSpacing', 'railSize', 'picketW', 'picketGap', 'panelThk', 'gap', 'maxGap', 'embed']) if (fin(pr[k]) && pr[k] >= 0 && pr[k] < (fp.mm ? 1e6 : 1e3)) patch[k] = r6(pr[k] * f);
  if (Number.isInteger(pr.rails) && pr.rails >= 1 && pr.rails <= 8) patch.rails = pr.rails;
  return patch;
}

/**
 * The Library picker's data (0.11 SU.1814b; su-finish-11 fence-stair, then lane barriers). Host-free: the host passes its own fetch and the Library API base.
 * Fence types are Library Types in the category Barriers with the sub-type fence (owner 2026-11-21: no fence-only kind).
 *   LIBRARY_KIND                                   'type'   (LIBRARY_QUERY = kind=type&category=types/barriers)
 *   libraryTypes({ fetch, base, lang }) → Promise<[{ uuid, name, version, itemUrl, item }]>   the Barriers types whose sub-type is fence (published items only;
 *        the list does not carry the sub-type, so each row's item JSON is read once, with ?view=1 so a look is not counted as an install; [] when none or offline)
 *   loadLibraryType(row, { fetch }) → Promise<item | null>                            the item (row.item, else the JSON at row.itemUrl), kept only when typeFromItem() reads it
 *   typeFromFile(text) → item | null                                                  a Library item file (format 1 JSON): a fence Barriers type, or the older kind fence-type
 * Nothing here guesses: an item typeFromItem() cannot read is null, and the caller says so.
 */
export const LIBRARY_KIND = 'type';
export const LIBRARY_QUERY = 'kind=type&category=' + encodeURIComponent(BARRIER_CATEGORY);
const viewUrl = (u) => u + (u.includes('?') ? '&' : '?') + 'view=1';
async function getJson(f, url) { try { const r = await f(url, { credentials: 'same-origin' }); return r && r.ok ? await r.json() : null; } catch { return null; } }
export async function libraryTypes({ fetch: f = globalThis.fetch, base = '/api/v1/library', lang = '' } = {}) {
  if (typeof f !== 'function') return [];
  try {
    const j = await getJson(f, base + '/items?' + LIBRARY_QUERY + '&per=100' + (lang ? '&lang=' + encodeURIComponent(lang) : ''));
    const list = j?.data?.items ?? j?.items ?? [];
    const rows = (Array.isArray(list) ? list : []).filter((x) => x && x.kind === LIBRARY_KIND && x.category === BARRIER_CATEGORY && x.item_url).slice(0, 100)
      .map((x) => ({ uuid: str(x.uuid, 40), name: str(x.name, 120), version: Number.isInteger(x.version) ? x.version : null, itemUrl: String(x.item_url) }));
    const items = await Promise.all(rows.map((r) => getJson(f, viewUrl(r.itemUrl))));
    return rows.map((r, i) => ({ ...r, item: items[i] })).filter((r) => r.item && typeFromItem(r.item, 'm'));
  } catch { return []; }
}
export async function loadLibraryType(row, { fetch: f = globalThis.fetch } = {}) {
  if (!row) return null;
  if (row.item && typeof row.item === 'object') return typeFromItem(row.item, 'm') ? row.item : null;
  if (typeof row.itemUrl !== 'string' || typeof f !== 'function') return null;
  const it = await getJson(f, row.itemUrl);
  return it && typeFromItem(it, 'm') ? it : null;
}
export function typeFromFile(text) {
  let it = null;
  try { it = JSON.parse(String(text).replace(/^﻿/, '')); } catch { return null; }
  if (!it || typeof it !== 'object' || (it.format !== undefined && it.format !== 'cadcraft-library-item')) return null;
  return typeFromItem(it, 'm') ? it : null;
}
