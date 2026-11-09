/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — reasons are codes (the app words them: rc.imp.*); IFC names are a data format */
/**
 * loose.js — bars read from a file, kept as their geometry (cc-rc, 0.9 RC.1): an IFC IfcReinforcingBar's swept disk (I.5 swept
 * solids) back to the vertices of its legs and one bend radius, its shape and schedule dimensions; and the same bars written out
 * again. No DOM.
 *
 *   readRebar(acc)       → { bars: [loose bar], hosts: Map(guid → { cls, name, guid }), skipped: [{ code, n }], read, lengthDiff }
 *   cleanLoose(b, bars)  → loose bar | null        (untrusted, from a saved model)
 *   looseGroups(list)    → groups (elements.js shape) for the schedule, the view and the IFC writer
 *   classify(pts)        → 'S' | 'L' | 'U' | 'T' | 'K'
 *   barFor(db, bars)     → the bar size of the table within 0.6 mm of a diameter, or null
 *   loose bar = { id, bar, db, pts: [[x,y,z]…] (leg vertices, mm), rc (centre-line bend radius, 0 = sharp), mark, host?: { guid, cls, name },
 *                 fileLength? (BarLength as written in the file) }
 *
 * acc (what the IFC reader hands over, cc-ifc's call surface): { ids(TYPE) → [expressId], line(id), ref(x), val(x), clsName(line),
 *   placementOf(element) → { X, Y, Z, O } (file units), apply(M, p), toMm, mapped(M, mappingSource, mappedItem) → M, axisOf(placementId, M) → M,
 *   T: { REINFORCINGBAR, RELAGGREGATES, RELNESTS } }.
 * Directrices read: IfcIndexedPolyCurve (IfcLineIndex / IfcArcIndex segments, or none = a polyline), IfcPolyline, IfcCompositeCurve of
 * IfcPolyline / IfcTrimmedCurve on IfcCircle segments (by trimming points) and IfcSweptDiskSolidPolygonal (IFC4: a polyline and its
 * FilletRadius). An arc becomes a vertex where its end tangents meet, its radius the bend's. Bodies through IfcMappedItem are read with the
 * mapping applied. Anything else is skipped with a reason, never silently.
 */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const r3 = (v) => Math.round(v * 1000) / 1000 + 0;

export function barFor(db, bars) {
  let best = null, d = 0.6;
  for (const b of bars.values()) { const e = Math.abs(b.db - db); if (e <= d) { best = b; d = e; } }
  return best;
}

/** The angle of each bend (degrees) of a vertex polyline. */
export function bends(pts) {
  const o = [];
  for (let i = 1; i < pts.length - 1; i++) { const a = norm(sub(pts[i], pts[i - 1])), b = norm(sub(pts[i + 1], pts[i])); o.push(Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180 / Math.PI); }
  return o;
}
export function classify(pts) {
  const bd = bends(pts);
  if (!bd.length) return 'S';
  const near = (v, w) => Math.abs(v - w) < 3;
  if (bd.length === 1 && near(bd[0], 90)) return 'L';
  if (bd.length === 2 && near(bd[0], 90) && near(bd[1], 90)) {
    const n1 = cross(sub(pts[1], pts[0]), sub(pts[2], pts[1])), n2 = cross(sub(pts[2], pts[1]), sub(pts[3], pts[2]));
    if (dot(norm(n1), norm(n2)) > 0.99) return 'U';
  }
  if (bd.length === 5 && near(bd[0], 135) && near(bd[4], 135) && bd.slice(1, 4).every((v) => near(v, 90))) return 'T';
  return 'K';
}

/** Drops vertices where the polyline goes straight on (within 0.5°) and points closer than 0.01 mm. */
export function tidy(pts) {
  const p = [];
  for (const q of pts) if (!p.length || len(sub(q, p[p.length - 1])) > 0.01) p.push(q);
  for (let i = p.length - 2; i >= 1; i--) {
    const a = norm(sub(p[i], p[i - 1])), b = norm(sub(p[i + 1], p[i]));
    if (dot(a, b) > Math.cos(0.5 * Math.PI / 180)) p.splice(i, 1);
  }
  return p;
}

/** An arc (start, a point on it, end) as the vertex where the end tangents meet + its radius. */
export function arcVertex(a, m, b) {
  const ab = sub(b, a), am = sub(m, a);
  const n = cross(ab, am);
  if (len(n) < 1e-9) return null;
  // circumcentre
  const A2 = dot(ab, ab), M2 = dot(am, am), nn = dot(n, n);
  const c = add(a, mul(add(mul(cross(n, ab), M2), mul(cross(am, n), A2)), 1 / (2 * nn)));
  const r = len(sub(a, c));
  const t1 = norm(cross(n, sub(a, c))), t2 = norm(cross(n, sub(b, c)));   // tangents, the arc's direction of travel
  // the tangent lines a + s·t1 and b − u·t2 meet at the vertex (in the arc's plane)
  const w = sub(b, a), d = dot(t1, t2);
  const den = 1 - d * d;
  if (den < 1e-12) return null;   // a half circle: no single vertex
  const s = (dot(w, t1) - d * dot(w, t2)) / den;
  return { v: add(a, mul(t1, s)), r };
}

export function readRebar(acc) {
  const { ids, line, ref, val, clsName, placementOf, apply, toMm, T } = acc;
  const out = [], skipped = new Map(), hosts = new Map();
  const skip = (code) => skipped.set(code, (skipped.get(code) || 0) + 1);
  // placements are in the file's length unit: apply them first, then scale to mm
  const P = (id, M) => { const p = line(id); const c = (p?.Coordinates || []).map((v) => Number(val(v))); return mul(apply(M, [c[0] || 0, c[1] || 0, c[2] || 0]), toMm); };
  const listPts = (id, M) => { const l = line(id); return (l?.CoordList || []).map((row) => { const c = row.map((v) => Number(val(v))); return mul(apply(M, [c[0] || 0, c[1] || 0, c[2] || 0]), toMm); }); };
  // hosts: IfcRelAggregates / IfcRelNests whose relating object is an element (a beam, a column …)
  const hostOf = new Map();
  for (const ty of [T.RELAGGREGATES, T.RELNESTS]) {
    if (ty === undefined) continue;
    for (const rid of ids(ty)) {
      const r = line(rid);
      const h = line(ref(r.RelatingObject));
      if (!h) continue;
      const hc = clsName(h);
      if (/^Ifc(Project|Site|Building|BuildingStorey|Space)$/.test(hc)) continue;
      const host = { guid: String(val(h.GlobalId) || ''), cls: hc, name: String(val(h.Name) || '').slice(0, 60) };
      for (const o of r.RelatedObjects || r.RelatedObjectsGroup || []) hostOf.set(ref(o), host);
    }
  }
  /** One curve → vertices + radius, in world mm. */
  function curve(id, M) {
    const c = line(id);
    if (!c) return null;
    const k = clsName(c);
    if (k === 'IfcPolyline') return { pts: (c.Points || []).map((p) => P(ref(p), M)), rc: 0 };
    if (k === 'IfcIndexedPolyCurve') {
      const pts = listPts(ref(c.Points), M);
      if (!c.Segments || !c.Segments.length) return { pts, rc: 0 };
      const verts = [];
      let rc = 0;
      for (const sg of c.Segments) {
        const ii = (Array.isArray(sg?.value) ? sg.value : []).map((v) => Number(val(v)) - 1);
        if (ii.some((j) => !(j >= 0 && j < pts.length))) return { why: 'curve' };
        const kind = String(sg?.name || '');
        if (/ARC/i.test(kind) && ii.length === 3) {
          const av = arcVertex(pts[ii[0]], pts[ii[1]], pts[ii[2]]);
          if (!av) return { why: 'half-circle' };
          if (!verts.length) verts.push(pts[ii[0]]);
          verts.push(av.v);
          rc = av.r;
          verts.push(pts[ii[2]]);
        } else {
          for (const j of ii) if (!verts.length || len(sub(verts[verts.length - 1], pts[j])) > 1e-6) verts.push(pts[j]);
        }
      }
      return { pts: verts, rc };
    }
    if (k === 'IfcCompositeCurve') {
      const verts = [];
      let rc = 0;
      for (const sid of c.Segments || []) {
        const s = line(ref(sid));
        const pc = line(ref(s?.ParentCurve));
        if (!pc) return { why: 'curve' };
        const pk = clsName(pc);
        if (pk === 'IfcPolyline') { for (const p of pc.Points || []) verts.push(P(ref(p), M)); continue; }
        if (pk === 'IfcTrimmedCurve') {
          const basis = line(ref(pc.BasisCurve));
          if (!basis || clsName(basis) !== 'IfcCircle') return { why: 'curve' };
          const t1 = (pc.Trim1 || []).map((x) => line(ref(x))).find((x) => x && clsName(x) === 'IfcCartesianPoint');
          const t2 = (pc.Trim2 || []).map((x) => line(ref(x))).find((x) => x && clsName(x) === 'IfcCartesianPoint');
          if (!t1 || !t2) return { why: 'trim-params' };
          const r = Number(val(basis.Radius)) * toMm;
          const p1 = P(ref((pc.Trim1 || []).find((x) => clsName(line(ref(x))) === 'IfcCartesianPoint')), M), p2 = P(ref((pc.Trim2 || []).find((x) => clsName(line(ref(x))) === 'IfcCartesianPoint')), M);
          // the arc's middle: from the circle's centre, half way between the ends (the shorter way: bends are under 180°)
          const posM = acc.axisOf ? acc.axisOf(ref(basis.Position), M) : null;
          if (!posM) return { why: 'curve' };
          const ctr = mul(posM.O, toMm), mid = add(ctr, mul(norm(add(sub(p1, ctr), sub(p2, ctr))), r));
          const sense = val(pc.SenseAgreement);
          const av = arcVertex(sense === false || sense === 'F' ? p2 : p1, mid, sense === false || sense === 'F' ? p1 : p2);
          if (!av) return { why: 'half-circle' };
          if (!verts.length) verts.push(p1);
          verts.push(av.v, p2);
          rc = r;
          continue;
        }
        return { why: 'curve' };
      }
      return { pts: verts, rc };
    }
    return { why: 'curve' };
  }
  function solidOf(el) {
    const pds = line(ref(el.Representation));
    if (!pds) return { why: 'no-shape' };
    const M0 = placementOf(el);
    for (const rid of pds.Representations || []) {
      const rep = line(ref(rid));
      for (const iid of rep?.Items || []) {
        let it = line(ref(iid)), M = M0;
        if (it && clsName(it) === 'IfcMappedItem') {
          const src = line(ref(it.MappingSource));
          M = acc.mapped ? acc.mapped(M0, src, it) : M0;
          const mr = line(ref(src?.MappedRepresentation));
          it = mr ? line(ref((mr.Items || [])[0])) : null;
        }
        if (!it) continue;
        const k = clsName(it);
        if (k === 'IfcSweptDiskSolid' || k === 'IfcSweptDiskSolidPolygonal') {
          const cv = curve(ref(it.Directrix), M);
          if (!cv || cv.why) return { why: cv?.why || 'curve' };
          const rad = Number(val(it.Radius)) * toMm;
          let rc = cv.rc;
          if (k === 'IfcSweptDiskSolidPolygonal' && it.FilletRadius !== undefined && it.FilletRadius !== null) rc = Number(val(it.FilletRadius)) * toMm;
          return { pts: cv.pts, rc, d: 2 * rad };
        }
      }
    }
    return { why: 'not-swept-disk' };
  }
  let read = 0, lengthDiff = 0;
  for (const id of ids(T.REINFORCINGBAR)) {
    const el = line(id);
    if (!el) continue;
    const s = solidOf(el);
    if (s.why) { skip(s.why); continue; }
    const pts = tidy(s.pts);
    if (pts.length < 2) { skip('curve'); continue; }
    if (pts.some((p) => p.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e7))) { skip('far'); continue; }
    const dNom = el.NominalDiameter !== undefined && el.NominalDiameter !== null ? Number(val(el.NominalDiameter)) * toMm : s.d;
    const bar = { pts: pts.map((p) => p.map(r3)), rc: r3(s.rc || 0), db: r3(dNom || s.d), mark: String(val(el.Tag) || '').slice(0, 20), name: String(val(el.Name) || '').slice(0, 60) };
    if (el.BarLength !== undefined && el.BarLength !== null) bar.fileLength = r3(Number(val(el.BarLength)) * toMm);
    const h = hostOf.get(id);
    if (h) { bar.host = h; if (h.guid) hosts.set(h.guid, h); }
    out.push(bar);
    read++;
  }
  return { bars: out, hosts, skipped: [...skipped].map(([code, n]) => ({ code, n })), read, lengthDiff };
}

/** A loose bar from a saved model (untrusted). */
export function cleanLoose(b, bars) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.pts) || b.pts.length < 2 || b.pts.length > 64) return null;
  const pts = b.pts.map((p) => (Array.isArray(p) && p.length === 3 ? p.map(Number) : null));
  if (pts.some((p) => !p || p.some((v) => !Number.isFinite(v) || Math.abs(v) > 1e7))) return null;
  const db = Number(b.db), rc = Number(b.rc) || 0;
  if (!(db > 3 && db < 80) || rc < 0 || rc > 2000) return null;
  const tx = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, '').trim().slice(0, n);
  const size = bars.has(String(b.bar)) ? String(b.bar) : barFor(db, bars)?.name || null;
  const out = { pts, db, rc, bar: size, mark: tx(b.mark, 20) };
  if (b.host && typeof b.host === 'object') out.host = { guid: tx(b.host.guid, 22), cls: tx(b.host.cls, 40), name: tx(b.host.name, 60) };
  if (Number.isFinite(Number(b.fileLength)) && b.fileLength > 0) out.fileLength = Number(b.fileLength);
  if (Number.isInteger(b.phase) && b.phase >= 1 && b.phase <= 999) out.phase = b.phase;
  return out;
}
