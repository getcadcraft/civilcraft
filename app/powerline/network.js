/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/network.js — the power network of a project (0.7 PL.6): supports, equipment, spans and cable routes joined into one
 * graph; voltage drop and load current along radial circuits from each source; the live checks the Checks panel shows. No DOM.
 * A design aid (decision D7): a radial load flow with lumped loads at equipment, LV and MV. No protection, short-circuit or
 * earthing study, no thermal rating (ampacity is the library's number). An engineer checks the result.
 *
 *   buildNetwork(state, { units, snap_m = 1 }) → { nodes, edges, sources, loose }
 *     nodes:  [{ id, kind: 'support' | 'equipment', ref, x, y }]   ref = { line, support } | { equipment }; id = the support's or
 *             the equipment's own id; x, y in project units
 *     edges:  [{ id, kind: 'span' | 'route' | 'tie', from, to, length_m, item (library key), line | route, span }]
 *             span  = one per pair of neighbouring supports of an overhead line (id `<line>:<i>`, item = the line's conductor;
 *                     one circuit per line for now)
 *             route = an underground route (id = the route's), ends through its from / to refs, else snapped to the nearest
 *                     equipment or support within snap_m (metres); an end that finds nothing is left out of the graph and
 *                     listed in `loose`
 *             tie   = equipment standing within snap_m of a support (a pole-mounted transformer, a cabinet at a pole):
 *                     length 0, no item, no drop
 *     sources: [node id] = equipment with `source: true`
 *     loose:   [{ route, end: 'from' | 'to' }]
 *   voltageDrop(net, state, lib, { units }) → { nodes: { id → { U_kV, drop_pct, I_A } }, edges: { id → { I_A, ampacity_A,
 *                                               load_pct, dU_V } }, notes: [{ code, edge?, node?, key? }] }
 *     Radial from each source (breadth-first tree). An edge that closes a loop, or joins the tree of another source, is not
 *     used and is reported (notes code 'loop' / 'twosources'). Nodes no source reaches have U_kV null.
 *     Loads: every equipment that is not a source, load_kW at pf (default 0.95): P, Q = P·tan(acos pf); each edge carries
 *     the P and Q of everything downstream.
 *     Three phases: I = S / (√3 · U), S = √(P² + Q²) (= P / (√3 · U · pf) for one load);
 *       ΔU = √3 · I · L · (R cos φ + X sin φ)  (V, L in km, cos φ = P / S downstream)  — the usual approximate formula;
 *     R, X in Ω/km from the library item: r20_ohm_km (R at 20 °C: a warm cable drops a little more), x_ohm_km, else X =
 *     0.08 Ω/km for an underground cable and 0.35 Ω/km for an overhead conductor (typical values, noted 'xdefault').
 *     A route's `count` = cables in parallel: R and X ÷ count, ampacity × count.
 *     U (the nominal voltage of an edge): a span → its line's voltage_kV; a route or a tie → the voltage of the node it
 *     leaves. A source's voltage = its project entry's voltage_kV if set, else its library item's voltage_kV, else the first
 *     edge it feeds (line voltage_kV, or the cable's voltage_kV — the cable's rating, so set the source's own when it
 *     differs). No transformation inside a tree: put the source at the transformer's secondary.
 *     drop_pct at a node = the sum of ΔU / U over the edges from the source; U_kV = U nominal × (1 − drop_pct / 100);
 *     I_A at a node = the current the node draws (its own load), at an edge = the current it carries.
 *   liveChecks(state, lib, { analyses, net, drop, units }) → [{ code, sev: 'error' | 'warn', ref: { kind, id, … }, vals }]
 *     kind = 'line' | 'support' | 'route' | 'equipment' | 'obstacle'
 *     nolib (error)        a library key with no item                           vals { key }
 *     missing (warn)       an item used with required fields empty (library.js missingFields)   vals { item (key), name, fields }
 *     disconnected (warn)  a route end attached to nothing (vals { end }), equipment connected to nothing
 *     overload (error)     load_pct > 100                                        vals { I, ampacity, pct, span? }
 *     drop (error)         drop_pct > rules.dropMax_pct (default 5)               vals { pct, max, U_kV }
 *     loop / twosources (warn)  a loop or two sources feeding one network (radial only)        vals { edge }
 *     + every issue of each overhead line's analysis (checks.js analyzeLine, `analyses` = Map lineId → result) with its own
 *       code and vals, re-shaped: support → ref support, obstacle → ref obstacle, span or none → ref line (+ span)
 *     net and drop are worked out here when not given. Never throws: odd input gives fewer checks, not an error.
 */

import { unitM, fin } from './units.js';
import { missingFields } from './library.js';

const SQ3 = Math.sqrt(3);
const X_CABLE = 0.08, X_OVERHEAD = 0.35;
const getItem = (lib, k) => (k && lib && typeof lib.get === 'function' ? lib.get(k) || null : null);
const asMap = (lib) => (lib instanceof Map ? lib : Array.isArray(lib) ? new Map(lib.filter((x) => x && x.key).map((x) => [x.key, x])) : new Map());
const arr = (a) => (Array.isArray(a) ? a : []);
const pt = (p) => p && fin(p.x) && fin(p.y);

export function buildNetwork(state, { units, snap_m = 1 } = {}) {
  const um = unitM(units);
  const net = { nodes: [], edges: [], sources: [], loose: [] };
  const byId = new Map();
  const addNode = (n) => { if (!byId.has(n.id)) { byId.set(n.id, n); net.nodes.push(n); } return byId.get(n.id); };
  const lines = arr(state?.lines), equipment = arr(state?.equipment);
  for (const l of lines) {
    if (!l) continue;
    const S = arr(l.supports).filter(pt);
    for (const p of S) addNode({ id: p.id, kind: 'support', ref: { line: l.id, support: p.id }, x: p.x, y: p.y });
    for (let i = 1; i < S.length; i++) {
      const a = S[i - 1], b = S[i];
      net.edges.push({ id: `${l.id}:${i - 1}`, kind: 'span', from: a.id, to: b.id, length_m: Math.hypot(b.x - a.x, b.y - a.y) * um, item: l.conductor || null, line: l.id, span: i - 1 });
    }
  }
  for (const e of equipment) {
    if (!e || !pt(e)) continue;
    addNode({ id: e.id, kind: 'equipment', ref: { equipment: e.id }, x: e.x, y: e.y });
    if (e.source === true) net.sources.push(e.id);
  }
  const snap = fin(snap_m) && snap_m >= 0 ? snap_m : 1;
  const nearest = (q, kinds) => {
    let best = null, bd = Infinity;
    for (const n of net.nodes) {
      if (!kinds.includes(n.kind)) continue;
      const d = Math.hypot(n.x - q.x, n.y - q.y) * um;
      if (d <= snap + 1e-9 && (d < bd - 1e-12 || (Math.abs(d - bd) <= 1e-12 && n.kind === 'equipment'))) { bd = d; best = n; }
    }
    return best;
  };
  // equipment standing at a support: a tie
  for (const n of net.nodes.filter((x) => x.kind === 'equipment')) {
    const s = nearest(n, ['support']);
    if (s) net.edges.push({ id: `tie:${n.id}`, kind: 'tie', from: n.id, to: s.id, length_m: 0, item: null });   // i18n-ignore: an edge id
  }
  const refNode = (r) => {
    if (!r || typeof r !== 'object') return null;
    if (r.equipment) { const n = byId.get(r.equipment); return n && n.kind === 'equipment' ? n : null; }
    if (r.support) { const n = byId.get(r.support); return n && n.kind === 'support' && (!r.line || n.ref.line === r.line) ? n : null; }
    return null;
  };
  for (const r of arr(state?.routes)) {
    if (!r) continue;
    const P = arr(r.pts).filter(pt);
    if (P.length < 2) continue;
    let L = 0;
    for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
    const a = refNode(r.from) || nearest(P[0], ['equipment', 'support']);
    const b = refNode(r.to) || nearest(P[P.length - 1], ['equipment', 'support']);
    if (!a) net.loose.push({ route: r.id, end: 'from' });
    if (!b) net.loose.push({ route: r.id, end: 'to' });
    net.edges.push({ id: r.id, kind: 'route', from: a ? a.id : null, to: b ? b.id : null, length_m: L * um, item: r.cable || null, route: r.id });
  }
  return net;
}

export function voltageDrop(net, state, lib, { units } = {}) {
  void units;
  const out = { nodes: {}, edges: {}, notes: [] };
  try {
    lib = asMap(lib);
    const nodes = arr(net?.nodes), edges = arr(net?.edges);
    const lines = new Map(arr(state?.lines).filter(Boolean).map((l) => [l.id, l]));
    const routes = new Map(arr(state?.routes).filter(Boolean).map((r) => [r.id, r]));
    const equip = new Map(arr(state?.equipment).filter(Boolean).map((e) => [e.id, e]));
    for (const n of nodes) out.nodes[n.id] = { U_kV: null, drop_pct: null, I_A: null };
    const adj = new Map(nodes.map((n) => [n.id, []]));
    for (const e of edges) {
      out.edges[e.id] = { I_A: null, ampacity_A: null, load_pct: null, dU_V: null };
      if (e.from == null || e.to == null || e.from === e.to || !adj.has(e.from) || !adj.has(e.to)) continue;
      adj.get(e.from).push(e); adj.get(e.to).push(e);
    }
    // edge electrical data: R, X (Ω/km, parallel cables counted), ampacity, U from a line
    const elec = (e) => {
      if (e.kind === 'tie') return { R: 0, X: 0, amp: null, U: null };
      const it = getItem(lib, e.item);
      const n = e.kind === 'route' ? Math.max(1, routes.get(e.route)?.count || 1) : 1;
      if (!it) return { R: null, X: null, amp: null, U: e.kind === 'span' ? lines.get(e.line)?.voltage_kV ?? null : null, cableU: null };
      let X = fin(it.x_ohm_km) ? it.x_ohm_km : null;
      if (X == null) { X = it.kind === 'cable' ? X_CABLE : X_OVERHEAD; out.notes.push({ code: 'xdefault', edge: e.id, key: e.item, value: X }); }
      return { R: fin(it.r20_ohm_km) ? it.r20_ohm_km / n : null, X: X / n, amp: fin(it.ampacity_A) ? it.ampacity_A * n : null,
        U: e.kind === 'span' ? lines.get(e.line)?.voltage_kV ?? null : null, cableU: fin(it.voltage_kV) ? it.voltage_kV : null };
    };
    const E = new Map(edges.map((e) => [e.id, elec(e)]));
    const seen = new Map();   // node → source
    const usedEdge = new Set();
    for (const src of arr(net?.sources)) {
      if (!adj.has(src)) continue;
      if (seen.has(src)) { out.notes.push({ code: 'twosources', node: src }); continue; }
      const se = equip.get(src);
      let U0 = fin(se?.voltage_kV) && se.voltage_kV > 0 ? se.voltage_kV : null;
      if (U0 == null) { const it = getItem(lib, se?.item); if (fin(it?.voltage_kV) && it.voltage_kV > 0) U0 = it.voltage_kV; }
      if (U0 == null) for (const e of adj.get(src)) { const k = E.get(e.id); const u = k.U ?? k.cableU; if (fin(u) && u > 0) { U0 = u; break; } }
      // breadth-first tree
      const order = [src], parent = new Map([[src, null]]), Unom = new Map([[src, U0]]);
      seen.set(src, src);
      for (let qi = 0; qi < order.length; qi++) {
        const v = order[qi];
        for (const e of adj.get(v)) {
          if (usedEdge.has(e.id)) continue;
          const w = e.from === v ? e.to : e.from;
          if (seen.has(w)) {
            if (parent.get(v)?.id !== e.id) out.notes.push({ code: seen.get(w) === src ? 'loop' : 'twosources', edge: e.id });
            usedEdge.add(e.id);
            continue;
          }
          usedEdge.add(e.id);
          seen.set(w, src); parent.set(w, e); order.push(w);
          const k = E.get(e.id);
          Unom.set(w, fin(k.U) && k.U > 0 ? k.U : Unom.get(v));
        }
      }
      // loads, summed upstream (reverse BFS order)
      const P = new Map(), Q = new Map();
      for (const v of order) {
        const eq = equip.get(v);
        const p = eq && eq.source !== true && fin(eq.load_kW) && eq.load_kW > 0 ? eq.load_kW : 0;
        const pf = fin(eq?.pf) && eq.pf > 0 && eq.pf <= 1 ? eq.pf : 0.95;
        P.set(v, p); Q.set(v, p * Math.tan(Math.acos(pf)));
        const U = Unom.get(v);
        out.nodes[v].I_A = fin(U) && U > 0 ? Math.hypot(p, p * Math.tan(Math.acos(pf))) / (SQ3 * U) : null;
      }
      for (let i = order.length - 1; i > 0; i--) {
        const v = order[i], e = parent.get(v), u = e.from === v ? e.to : e.from;
        P.set(u, P.get(u) + P.get(v)); Q.set(u, Q.get(u) + Q.get(v));
      }
      // edges and voltages (BFS order: the parent first)
      out.nodes[src].U_kV = U0; out.nodes[src].drop_pct = fin(U0) ? 0 : null;
      for (const v of order.slice(1)) {
        const e = parent.get(v), u = e.from === v ? e.to : e.from, k = E.get(e.id);
        const U = Unom.get(v);   // the edge's nominal voltage
        const p = P.get(v), q = Q.get(v), S = Math.hypot(p, q);
        const r = out.edges[e.id];
        const I = fin(U) && U > 0 ? S / (SQ3 * U) : null;   // kVA / (√3 kV) = A
        r.I_A = I;
        r.ampacity_A = k.amp;
        r.load_pct = I != null && k.amp > 0 ? (I / k.amp) * 100 : null;
        if (I != null && fin(k.R) && fin(k.X)) {
          const cos = S > 0 ? p / S : 1, sin = S > 0 ? q / S : 0;
          r.dU_V = SQ3 * I * (e.length_m / 1000) * (k.R * cos + k.X * sin);
        } else if (I != null && I > 0) out.notes.push({ code: 'nor', edge: e.id, key: e.item });
        const d0 = out.nodes[u].drop_pct;
        const d = d0 != null && fin(U) && U > 0 ? d0 + (r.dU_V ?? 0) / (U * 1000) * 100 : null;
        out.nodes[v].drop_pct = d;
        out.nodes[v].U_kV = d != null ? U * (1 - d / 100) : null;
      }
    }
  } catch { /* odd input: what was worked out so far */ }
  return out;
}

export function liveChecks(state, lib, { analyses, net, drop, units } = {}) {
  const out = [];
  const seen = new Set();
  const push = (x) => { const k = JSON.stringify([x.code, x.ref, x.vals]); if (!seen.has(k)) { seen.add(k); out.push(x); } };
  const L = asMap(lib);
  const lines = arr(state?.lines).filter(Boolean), routes = arr(state?.routes).filter(Boolean), equipment = arr(state?.equipment).filter(Boolean);
  // library keys: no item, missing data (one 'missing' per item, at its first use)
  try {
    const missingDone = new Set();
    const use = (key, ref) => {
      if (!key) return;
      const it = L.get(key);
      if (!it) { push({ code: 'nolib', sev: 'error', ref, vals: { key } }); return; }
      if (missingDone.has(key)) return;
      missingDone.add(key);
      const f = missingFields(it);
      if (f.length) push({ code: 'missing', sev: 'warn', ref, vals: { item: key, name: it.name, fields: f } });
    };
    for (const l of lines) {
      use(l.conductor, { kind: 'line', id: l.id });
      for (const k of arr(l.equip)) use(k, { kind: 'line', id: l.id });
      for (const p of arr(l.supports)) { if (!p) continue; use(p.support, { kind: 'support', id: p.id, line: l.id }); for (const k of arr(p.equip)) use(k, { kind: 'support', id: p.id, line: l.id }); }
    }
    for (const r of routes) { use(r.cable, { kind: 'route', id: r.id }); use(r.trench, { kind: 'route', id: r.id }); }
    for (const e of equipment) use(e.item, { kind: 'equipment', id: e.id });
  } catch { /* keep going */ }
  // the network
  let N = net, D = drop;
  try { if (!N) N = buildNetwork(state, { units }); } catch { N = null; }
  try { if (!D && N) D = voltageDrop(N, state, L, { units }); } catch { D = null; }
  try {
    if (N) {
      for (const x of arr(N.loose)) push({ code: 'disconnected', sev: 'warn', ref: { kind: 'route', id: x.route }, vals: { end: x.end } });
      const deg = new Map();
      for (const e of arr(N.edges)) for (const v of [e.from, e.to]) if (v != null) deg.set(v, (deg.get(v) || 0) + 1);
      for (const n of arr(N.nodes)) if (n.kind === 'equipment' && !deg.get(n.id)) push({ code: 'disconnected', sev: 'warn', ref: { kind: 'equipment', id: n.id }, vals: {} });
    }
    if (N && D) {
      const max = fin(state?.rules?.dropMax_pct) ? state.rules.dropMax_pct : 5;
      for (const e of arr(N.edges)) {
        const r = D.edges?.[e.id];
        if (!r || !(r.load_pct > 100)) continue;
        const ref = e.kind === 'span' ? { kind: 'line', id: e.line, span: e.span } : { kind: 'route', id: e.route ?? e.id };
        push({ code: 'overload', sev: 'error', ref, vals: { I: r.I_A, ampacity: r.ampacity_A, pct: r.load_pct, ...(e.kind === 'span' ? { span: e.span + 1 } : {}) } });
      }
      for (const n of arr(N.nodes)) {
        const r = D.nodes?.[n.id];
        if (!r || !(r.drop_pct > max + 1e-9)) continue;
        const ref = n.kind === 'equipment' ? { kind: 'equipment', id: n.id } : { kind: 'support', id: n.id, line: n.ref?.line };
        push({ code: 'drop', sev: 'error', ref, vals: { pct: r.drop_pct, max, U_kV: r.U_kV } });
      }
      for (const x of arr(D.notes)) if (x.code === 'loop' || x.code === 'twosources') {
        const e = arr(N.edges).find((y) => y.id === x.edge);
        const ref = e ? (e.kind === 'span' ? { kind: 'line', id: e.line, span: e.span } : e.kind === 'route' ? { kind: 'route', id: e.route } : { kind: 'equipment', id: e.from })
          : { kind: 'equipment', id: x.node };
        push({ code: x.code, sev: 'warn', ref, vals: { edge: x.edge ?? null } });
      }
    }
  } catch { /* keep going */ }
  // the overhead lines' own analyses
  try {
    const A = analyses instanceof Map ? analyses : new Map();
    for (const [lineId, res] of A) {
      const line = lines.find((l) => l.id === lineId);
      for (const is of arr(res?.issues)) {
        if (!is || typeof is.code !== 'string') continue;
        let ref = { kind: 'line', id: lineId };
        if (fin(is.support)) {
          const sid = line?.supports?.[is.support]?.id ?? res.supports?.[is.support]?.id;
          if (sid) ref = { kind: 'support', id: sid, line: lineId };
        } else if (is.code === 'obstacle' && fin(is.span)) {
          const o = arr(res.spans?.[is.span]?.obstacles).find((x) => !x.ok && (x.name || x.id) === is.vals?.name) || arr(res.spans?.[is.span]?.obstacles).find((x) => !x.ok);
          ref = o ? { kind: 'obstacle', id: o.id, line: lineId, span: is.span } : { kind: 'line', id: lineId, span: is.span };
        } else if (fin(is.span)) ref = { kind: 'line', id: lineId, span: is.span };
        push({ code: is.code, sev: is.sev === 'error' ? 'error' : 'warn', ref, vals: is.vals && typeof is.vals === 'object' ? is.vals : {} });
      }
    }
  } catch { /* keep going */ }
  return out;
}
