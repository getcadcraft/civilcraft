/* SPDX-License-Identifier: Apache-2.0 */
/**
 * landxml.js — LandXML 1.2 in and out. No DOM.
 *
 *   writeLandXml({ name, units, points, surfaces, alignments, date }) → string
 *     points      [{ n, x, y, z, d }]                          → CgPoints/CgPoint (name, desc, code)
 *     surfaces    [{ name, desc, surface, breaklines, boundary }] → Surface: SourceData (Breaklines, Boundaries)
 *                                                                  + Definition surfType="TIN" (Pnts/P, Faces/F)
 *     alignments  [{ name, alignment, eg: {name, pts:[{sta,z}]}, profile: {name, profile} }]
 *                   → Alignment/CoordGeom (Line, Curve crvType="arc") + Profile (ProfSurf, ProfAlign PVI/ParaCurve)
 *     networks    [{ name, type, structures, pipes }] (pipes.js shape; structures may carry rimShown/sump to write) → PipeNetworks
 *     features    [feature line (featureline.js)] (0.6 WL.24) → PlanFeatures/PlanFeature/CoordGeom: Line and Curve
 *                   (crvType="arc") with 3D Start/End ("N E Z"), the arc's Center 2D, + Feature code="CivilCraft" with
 *                   Property use / closed. An arc's ends may sit at different elevations (z along the arc, one grade).
 *     crs         state.crs (GIS) → <CoordinateSystem name epsgCode (when it has one) ogcWktCode (a .prj's WKT, no code)
 *                   desc (ground/local coordinates: the scale and base, so a reader knows they are not grid)>
 *   readLandXml(text) → { units, linearUnit, name, points, surfaces, alignments, networks, coordinateSystem, notes }
 *     coordinateSystem  null | { name, epsgCode (number | null), ogcWktCode (text | null), desc } (GIS: offered as the
 *                       project's system when opened)
 *     surfaces    [{ name, desc, pts:[{x,y,z}|null], faces:[[i,j,k]], breaklines:[{name,pts}], boundary:[{x,y}]|null }]
 *     alignments  [{ name, start, pis:[{x,y,r}], profiles:[{name, pvis:[{sta,z,L}]}], surfProfiles:[{name, pts}] }]
 *     features    [{ name, pts:[{x,y,z,b?}], closed, use|null }] (0.6 WL.24) from PlanFeatures (Line, Curve, IrregularLine
 *                 PntList3D; Start/Center/End, rot); use from our Feature/Property, else null (the app decides)
 *   scaleImport(data, k)   multiplies every length/elevation/station (unit conversion)
 *
 * LandXML writes coordinates northing first ("N E Z"); here x = easting, y = northing. Anything the
 * reader does not handle yet (spirals, grid surfaces, point references, parcels…) is named in
 * `notes`, never guessed.
 */

import { t } from "./i18n.js";
import { parseXml, kids, kid, textOf, esc } from './xml.js';
import { METRES_PER } from './units.js';
import { groupKey } from './points.js';

const NS = 'http://www.landxml.org/schema/LandXML-1.2';
const num = (v, d = 6) => {
  if (!Number.isFinite(v)) return '0';
  const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};
const ne = (p, d) => num(p.y, d) + ' ' + num(p.x, d);
const nez = (p, d) => ne(p, d) + ' ' + num(p.z, d);

// i18n-ignore: the default <Project name> written into the file (file content)
export function writeLandXml({ name = 'CivilCraft project', units = 'ft', points = [], surfaces = [], alignments = [], networks = [], features = [], date = new Date(), crs = null }) {
  const L = [];
  const pad = (x) => String(x).padStart(2, '0');
  const ds = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  const ts = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  L.push('<?xml version="1.0" encoding="UTF-8"?>');
  L.push(`<LandXML xmlns="${NS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="${NS} http://www.landxml.org/schema/LandXML-1.2/LandXML-1.2.xsd" version="1.2" date="${ds}" time="${ts}">`);
  L.push('  <Units>');
  if (units === 'm') L.push('    <Metric areaUnit="squareMeter" linearUnit="meter" volumeUnit="cubicMeter" temperatureUnit="celsius" pressureUnit="milliBars" diameterUnit="millimeter" angularUnit="decimal degrees" directionUnit="decimal degrees"/>');
  else L.push('    <Imperial areaUnit="squareFoot" linearUnit="USSurveyFoot" volumeUnit="cubicYard" temperatureUnit="fahrenheit" pressureUnit="inHG" diameterUnit="inch" angularUnit="decimal degrees" directionUnit="decimal degrees"/>');
  L.push('  </Units>');
  if (crs && crs.name) {   // GIS: the project's coordinate system (docs/GIS-SPEC.md §2)
    const l = crs.local;
    // i18n-ignore: LandXML desc attribute (file content)
    const desc = l ? `Coordinates are ${l.rotation ? 'local (assumed)' : 'ground'} coordinates, not grid: grid = (${num(l.to[0], 4)}, ${num(l.to[1], 4)}) + ${num(l.scale, 10)} × rotate ${num(l.rotation, 8)}° × (point − (${num(l.from[0], 4)}, ${num(l.from[1], 4)}))` : '';
    const wkt = crs.code == null && /^(PROJCS|GEOGCS)\[/i.test(crs.proj4 || '') ? crs.proj4 : '';
    L.push(`  <CoordinateSystem name="${esc(crs.name)}"` + (crs.code ? ` epsgCode="${esc(String(crs.code))}"` : '') + (wkt ? ` ogcWktCode="${esc(wkt)}"` : '') + (desc ? ` desc="${esc(desc)}"` : '') + '/>');
  }
  L.push(`  <Project name="${esc(name)}"/>`);
  L.push('  <Application name="CivilCraft" manufacturer="CadCraft" version="lab" manufacturerURL="https://getcadcraft.com"/>');

  if (points.length) {
    L.push('  <CgPoints>');
    for (const p of points) {
      const code = groupKey(p.d);
      const attrs = `name="${esc(p.n)}"` + (p.d ? ` desc="${esc(p.d)}" code="${esc(code)}"` : '');
      L.push(`    <CgPoint ${attrs}>${p.z === null || p.z === undefined ? ne(p) : nez(p)}</CgPoint>`);
    }
    L.push('  </CgPoints>');
  }

  if (alignments.length) {
    L.push(`  <Alignments name="${esc(name)}">`);
    for (const a of alignments) {
      const al = a.alignment;
      if (!al?.ok) continue;
      L.push(`    <Alignment name="${esc(a.name)}" length="${num(al.length)}" staStart="${num(al.start)}">`);
      L.push('      <CoordGeom>');
      for (const e of al.elements) {
        if (e.type === 'line') {
          L.push(`        <Line staStart="${num(e.sta)}" length="${num(e.len)}"><Start>${ne(e.p0)}</Start><End>${ne(e.p1)}</End></Line>`);
        } else {
          L.push(`        <Curve rot="${e.ccw ? 'ccw' : 'cw'}" crvType="arc" radius="${num(e.r)}" length="${num(e.len)}" staStart="${num(e.sta)}" chord="${num(e.chord)}" delta="${num(e.delta * 180 / Math.PI, 8)}" tangent="${num(e.T)}" external="${num(e.E)}" midOrd="${num(e.M)}">` +
            `<Start>${ne(e.p0)}</Start><Center>${ne(e.c)}</Center><End>${ne(e.p1)}</End><PI>${ne(e.pi)}</PI></Curve>`);
        }
      }
      L.push('      </CoordGeom>');
      const eg = a.eg, fg = a.profile;
      if ((eg && eg.pts?.length) || fg?.profile?.pvis?.length) {
        L.push(`      <Profile name="${esc(a.name)}">`);
        if (eg && eg.pts?.length) {
          // runs of stations with elevations (gaps where the alignment leaves the surface start a new list)
          const runs = [];
          let cur = [];
          for (const p of eg.pts) { if (p.z === null) { if (cur.length) runs.push(cur); cur = []; } else cur.push(p); }
          if (cur.length) runs.push(cur);
          for (const r of runs) if (r.length >= 2) L.push(`        <ProfSurf name="${esc(eg.name)}"><PntList2D>${r.map((p) => num(p.sta, 4) + ' ' + num(p.z, 4)).join(' ')}</PntList2D></ProfSurf>`);
        }
        if (fg?.profile?.pvis?.length) {
          L.push(`        <ProfAlign name="${esc(fg.name)}">`);
          fg.profile.pvis.forEach((v, i) => {
            const curve = i > 0 && i < fg.profile.pvis.length - 1 && v.L > 0;
            L.push(curve ? `          <ParaCurve length="${num(v.L)}">${num(v.sta)} ${num(v.z)}</ParaCurve>` : `          <PVI>${num(v.sta)} ${num(v.z)}</PVI>`);
          });
          L.push('        </ProfAlign>');
        }
        L.push('      </Profile>');
      }
      L.push('    </Alignment>');
    }
    L.push('  </Alignments>');
  }

  if (surfaces.length) {
    L.push(`  <Surfaces name="${esc(name)}">`);
    for (const s of surfaces) {
      const sf = s.surface;
      if (!sf) continue;
      const st = sf.stats();
      L.push(`    <Surface name="${esc(s.name)}"${s.desc ? ` desc="${esc(s.desc)}"` : ''}>`);
      const bls = (s.breaklines || []).filter((b) => b.pts.length >= 2);
      const bnd = s.boundary && s.boundary.length >= 3 ? s.boundary : null;
      if (bls.length || bnd) {
        L.push('      <SourceData>');
        if (bls.length) {
          L.push('        <Breaklines>');
          for (const b of bls) L.push(`          <Breakline brkType="standard" name="${esc(b.name)}"><PntList3D>${b.pts.map((p) => nez(p)).join(' ')}</PntList3D></Breakline>`);
          L.push('        </Breaklines>');
        }
        if (bnd) {
          L.push('        <Boundaries>');
          L.push(`          <Boundary name="Outer" bndType="outer" edgeTrim="true"><PntList2D>${[...bnd, bnd[0]].map((p) => ne(p)).join(' ')}</PntList2D></Boundary>`);
          L.push('        </Boundaries>');
        }
        L.push('      </SourceData>');
      }
      const { pts, faces } = sf.toFaces();
      L.push(`      <Definition surfType="TIN" area2DSurf="${num(st.area2d, 4)}" area3DSurf="${num(st.area3d, 4)}" elevMax="${num(st.maxZ)}" elevMin="${num(st.minZ)}">`);
      L.push('        <Pnts>');
      pts.forEach((p, i) => L.push(`          <P id="${i + 1}">${nez(p)}</P>`));
      L.push('        </Pnts>');
      L.push('        <Faces>');
      for (const f of faces) L.push(`          <F>${f[0] + 1} ${f[1] + 1} ${f[2] + 1}</F>`);
      L.push('        </Faces>');
      L.push('      </Definition>');
      L.push('    </Surface>');
    }
    L.push('  </Surfaces>');
  }
  for (const n of networks) {
    // a structure needs at least one pipe (LandXML wants an Invert in each); a network needs two structures
    const used = new Set(n.pipes.flatMap((p) => [p.from, p.to]));
    const structs = n.structures.filter((x) => used.has(x.id));
    const pipes = n.pipes.filter((p) => Number.isFinite(p.invUp) && Number.isFinite(p.invDn));
    if (structs.length < 2 || !pipes.length) continue;
    const sName = new Map(structs.map((x) => [x.id, x.name]));
    L.push(`  <PipeNetworks name="${esc(name)}">`);
    L.push(`    <PipeNetwork name="${esc(n.name)}" pipeNetType="${n.type === 'sanitary' ? 'sanitary' : 'storm'}">`);
    L.push('      <Structs>');
    for (const x of structs) {
      const inv = [];
      for (const p of pipes) {
        if (p.from === x.id) inv.push(`<Invert elev="${num(p.invUp)}" flowDir="out" refPipe="${esc(p.name)}"/>`);
        if (p.to === x.id) inv.push(`<Invert elev="${num(p.invDn)}" flowDir="in" refPipe="${esc(p.name)}"/>`);
      }
      if (!inv.length) inv.push(`<Invert elev="${num(x.sump ?? 0)}" flowDir="both" refPipe=""/>`);
      const rim = Number.isFinite(x.rimShown) ? ` elevRim="${num(x.rimShown)}"` : '';
      const sump = Number.isFinite(x.sump) ? ` elevSump="${num(x.sump)}"` : '';
      // 0.6 WL.27: a structure of a type writes its inside size, wall thickness and type name; a rectangular type RectStruct
      const k = x.type ? (n.types || []).find((q) => q.id === x.type) : null;
      const shapeEl = !k ? `<CircStruct diameter="${num(x.dia)}"/>`
        : k.shape === 'rect' ? `<RectStruct length="${num(k.l)}" width="${num(k.w)}" thickness="${num(k.wall || 0)}" desc="${esc(k.name)}"/>`
        : `<CircStruct diameter="${num(k.dia)}" thickness="${num(k.wall || 0)}" desc="${esc(k.name)}"/>`;
      L.push(`        <Struct name="${esc(x.name)}"${rim}${sump}><Center>${ne(x)}</Center>${shapeEl}${inv.join('')}</Struct>`);
    }
    L.push('      </Structs>');
    L.push('      <Pipes>');
    for (const p of pipes) {
      const a = structs.find((x) => x.id === p.from), b = structs.find((x) => x.id === p.to);
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      L.push(`        <Pipe name="${esc(p.name)}" refStart="${esc(sName.get(p.from))}" refEnd="${esc(sName.get(p.to))}" length="${num(len)}" slope="${num(len ? (p.invUp - p.invDn) / len : 0, 8)}"><CircPipe diameter="${num(p.dia)}"/></Pipe>`);
    }
    L.push('      </Pipes>');
    L.push('    </PipeNetwork>');
    L.push('  </PipeNetworks>');
  }
  // 0.6 WL.24: feature lines, arcs and all
  const fls = features.filter((f) => f?.pts?.length >= 2);
  if (fls.length) {
    L.push(`  <PlanFeatures name="${esc(name)}">`);
    for (const f of fls) {
      L.push(`    <PlanFeature name="${esc(f.name)}">`);
      L.push('      <CoordGeom>');
      const n = f.pts.length, m = f.closed ? n : n - 1;
      for (let i = 0; i < m; i++) {
        const a = f.pts[i], b = f.pts[(i + 1) % n], A = arcGeom(a, b);
        if (!A) { L.push(`        <Line length="${num(Math.hypot(b.x - a.x, b.y - a.y))}"><Start>${nez(a)}</Start><End>${nez(b)}</End></Line>`); continue; }
        L.push(`        <Curve rot="${A.sweep > 0 ? 'ccw' : 'cw'}" crvType="arc" radius="${num(A.r)}" length="${num(A.L)}" chord="${num(Math.hypot(b.x - a.x, b.y - a.y))}" delta="${num(Math.abs(A.sweep) * 180 / Math.PI, 8)}">` +
          `<Start>${nez(a)}</Start><Center>${ne({ x: A.cx, y: A.cy })}</Center><End>${nez(b)}</End></Curve>`);
      }
      L.push('      </CoordGeom>');
      L.push(`      <Feature code="CivilCraft"><Property label="use" value="${esc(f.use || 'eg')}"/><Property label="closed" value="${f.closed ? 1 : 0}"/></Feature>`);
      L.push('    </PlanFeature>');
    }
    L.push('  </PlanFeatures>');
  }
  L.push('</LandXML>');
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------------------

const nums = (s) => { const t = String(s || '').trim(); return t ? t.split(/[\s,]+/).map(Number) : []; };

export function readLandXml(text) {
  const root = parseXml(text);
  if (root.name !== 'LandXML') throw new Error(t('lx.err.root', { tag: '<' + root.name + '>' }));
  const notes = [];
  const note = (m) => { if (!notes.includes(m)) notes.push(m); };
  const out = { units: null, linearUnit: null, name: '', points: [], surfaces: [], alignments: [], notes };

  const U = kid(root, 'Units');
  const unitEl = U && (kid(U, 'Imperial') || kid(U, 'Metric'));
  if (unitEl) {
    out.linearUnit = unitEl.attrs.linearUnit || (unitEl.name === 'Metric' ? 'meter' : 'foot');
    out.units = METRES_PER[out.linearUnit] !== undefined && METRES_PER[out.linearUnit] > 0.5 ? 'm' : 'ft';
    if (!(out.linearUnit in METRES_PER)) note(t(out.units === 'm' ? 'lx.unit.m' : 'lx.unit.ft', { unit: out.linearUnit }));
  }
  out.name = kid(root, 'Project')?.attrs.name || '';
  // GIS: <CoordinateSystem> (untrusted; the page offers it as the project's system, docs/GIS-SPEC.md §2)
  const csEl = kid(root, 'CoordinateSystem');
  out.coordinateSystem = null;
  if (csEl) {
    const a = csEl.attrs, code = String(a.epsgCode || '').match(/^\s*(?:EPSG:)?(\d{3,6})\s*$/i);
    const wkt = String(a.ogcWktCode || '').trim();
    out.coordinateSystem = { name: String(a.name || a.projectedCoordinateSystemName || a.horizontalCoordinateSystemName || '').slice(0, 200), epsgCode: code ? Number(code[1]) : null, ogcWktCode: wkt && wkt.length <= 20000 ? wkt : null, desc: String(a.desc || '').slice(0, 500) };
    if (!out.coordinateSystem.epsgCode && !out.coordinateSystem.ogcWktCode && !out.coordinateSystem.name) out.coordinateSystem = null;
  }

  // points (CgPoints can nest)
  const seen = new Set();
  const walkPts = (el) => {
    for (const c of el.children) {
      if (c.name === 'CgPoints') walkPts(c);
      else if (c.name === 'CgPoint') {
        if (c.attrs.pntRef && !textOf(c)) { note(t('lx.pntref')); continue; }
        const v = nums(textOf(c));
        if (v.length < 2 || v.some((x) => !Number.isFinite(x))) { note(t('lx.pts.bad')); continue; }
        let n = c.attrs.name || c.attrs.oID || String(out.points.length + 1);
        if (seen.has(n)) { note(t('lx.pts.twice')); continue; }
        seen.add(n);
        out.points.push({ n, x: v[1], y: v[0], z: v.length >= 3 ? v[2] : null, d: (c.attrs.desc || c.attrs.code || '').slice(0, 200) });
      }
    }
  };
  for (const c of kids(root, 'CgPoints')) walkPts(c);

  // surfaces
  for (const ss of kids(root, 'Surfaces')) for (const s of kids(ss, 'Surface')) {
    const def = kid(s, 'Definition');
    const rec = { name: s.attrs.name || t('lx.def.surface'), desc: s.attrs.desc || '', pts: [], faces: [], breaklines: [], boundary: null };
    if (def && def.attrs.surfType && def.attrs.surfType !== 'TIN') { note(t('lx.surf.type', { name: rec.name, type: def.attrs.surfType })); continue; }
    const src = kid(s, 'SourceData');
    for (const bs of kids(src, 'Breaklines')) for (const b of kids(bs, 'Breakline')) {
      const l3 = kid(b, 'PntList3D');
      if (!l3) { note(t('lx.bl.no3d')); continue; }
      const v = nums(textOf(l3)), pts = [];
      for (let i = 0; i + 2 < v.length; i += 3) pts.push({ x: v[i + 1], y: v[i], z: v[i + 2] });
      if (pts.length >= 2) rec.breaklines.push({ name: b.attrs.name || b.attrs.desc || t('lx.def.breakline'), pts });
    }
    for (const bs of kids(src, 'Boundaries')) for (const b of kids(bs, 'Boundary')) {
      if ((b.attrs.bndType || 'outer') !== 'outer') { note(t('lx.bndy.outer')); continue; }
      const l2 = kid(b, 'PntList2D'), l3 = kid(b, 'PntList3D');
      const v = nums(textOf(l2 || l3)), k = l2 ? 2 : 3, pts = [];
      for (let i = 0; i + k - 1 < v.length; i += k) pts.push({ x: v[i + 1], y: v[i] });
      if (pts.length > 1 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1e-9) pts.pop();
      if (pts.length >= 3) rec.boundary = pts;
    }
    if (def) {
      const id = new Map();
      for (const pnts of kids(def, 'Pnts')) for (const p of kids(pnts, 'P')) {
        const v = nums(textOf(p));
        if (v.length < 3 || v.some((x) => !Number.isFinite(x))) continue;
        id.set(p.attrs.id, rec.pts.length);
        rec.pts.push({ x: v[1], y: v[0], z: v[2] });
      }
      let hidden = 0;
      for (const fs of kids(def, 'Faces')) for (const f of kids(fs, 'F')) {
        if (f.attrs.i === '1') { hidden++; continue; }
        const ids = textOf(f).split(/\s+/);
        if (ids.length < 3) continue;
        rec.faces.push(ids.slice(0, 3).map((k) => (id.has(k) ? id.get(k) : -1)));
      }
      if (hidden) note(t('lx.faces.hidden', { n: hidden }));
    }
    if (!rec.faces.length && !rec.breaklines.length) { note(t('lx.surf.nofaces', { name: rec.name })); continue; }
    out.surfaces.push(rec);
  }

  // alignments
  for (const as of kids(root, 'Alignments')) for (const a of kids(as, 'Alignment')) {
    const name = a.attrs.name || t('scene.al.default');
    const cg = kid(a, 'CoordGeom');
    if (!cg) { note(t('lx.al.nogeom', { name })); continue; }
    const els = cg.children.filter((c) => ['Line', 'Curve', 'Spiral', 'IrregularLine', 'Chain'].includes(c.name));
    if (els.some((e) => e.name !== 'Line' && e.name !== 'Curve')) { note(t('lx.al.spirals', { name })); continue; }
    const pt = (el, tag) => { const v = nums(textOf(kid(el, tag))); return v.length >= 2 ? { x: v[1], y: v[0] } : null; };
    const pis = [];
    let ok = true;
    els.forEach((e, i) => {
      const s = pt(e, 'Start'), en = pt(e, 'End');
      if (!s || !en) { ok = false; return; }
      if (i === 0) pis.push({ x: s.x, y: s.y, r: 0 });
      if (e.name === 'Curve') {
        const c = pt(e, 'Center');
        let pi = pt(e, 'PI');
        const r = Number(e.attrs.radius) || (c ? Math.hypot(s.x - c.x, s.y - c.y) : 0);
        if (!pi && c) pi = tangentsMeet(s, en, c);
        if (!pi) { ok = false; return; }
        pis.push({ x: pi.x, y: pi.y, r });
      } else if (els[i + 1]?.name === 'Line') pis.push({ x: en.x, y: en.y, r: 0 });
      if (i === els.length - 1) pis.push({ x: en.x, y: en.y, r: 0 });
    });
    if (!ok || pis.length < 2) { note(t('lx.al.unread', { name })); continue; }
    const start = Number(a.attrs.staStart) || 0;
    const rec = { name, start, pis, profiles: [], surfProfiles: [] };
    for (const pr of kids(a, 'Profile')) {
      for (const pa of kids(pr, 'ProfAlign')) {
        const pvis = [];
        for (const c of pa.children) {
          const v = nums(textOf(c));
          if (c.name === 'PVI' && v.length >= 2) pvis.push({ sta: v[0], z: v[1], L: 0 });
          else if (c.name === 'ParaCurve' && v.length >= 2) pvis.push({ sta: v[0], z: v[1], L: Number(c.attrs.length) || 0 });
          else if (c.name === 'CircCurve' || c.name === 'UnsymParaCurve') note(t('lx.vc.other')), v.length >= 2 && pvis.push({ sta: v[0], z: v[1], L: 0 });
        }
        if (pvis.length >= 2) rec.profiles.push({ name: pa.attrs.name || t('lx.def.profile'), pvis });
      }
      for (const ps of kids(pr, 'ProfSurf')) {
        const v = nums(textOf(kid(ps, 'PntList2D'))), pts = [];
        for (let i = 0; i + 1 < v.length; i += 2) pts.push({ sta: v[i], z: v[i + 1] });
        if (pts.length) rec.surfProfiles.push({ name: ps.attrs.name || t('lx.def.surface'), pts });
      }
    }
    out.alignments.push(rec);
  }
  out.networks = [];
  for (const pns of kids(root, 'PipeNetworks')) for (const pn of kids(pns, 'PipeNetwork')) {
    const net = { name: pn.attrs.name || t('lx.def.network'), type: pn.attrs.pipeNetType === 'sanitary' ? 'sanitary' : 'storm', structures: [], pipes: [] };
    if (!['storm', 'sanitary'].includes(pn.attrs.pipeNetType)) note(pn.attrs.pipeNetType ? t('lx.net.type', { name: net.name, type: pn.attrs.pipeNetType }) : t('lx.net.untyped', { name: net.name }));
    const byName = new Map(), inv = new Map();
    let k = 0;
    for (const sts of kids(pn, 'Structs')) for (const st of kids(sts, 'Struct')) {
      const c = nums(textOf(kid(st, 'Center')));
      if (c.length < 2) { note(t('lx.st.nocentre')); continue; }
      const shape = kid(st, 'CircStruct') || kid(st, 'RectStruct') || kid(st, 'InletStruct') || kid(st, 'OutletStruct');
      const rec = { id: 's' + ++k, name: st.attrs.name || 'S' + k, x: c[1], y: c[0], rim: Number.isFinite(Number(st.attrs.elevRim)) && st.attrs.elevRim !== undefined ? Number(st.attrs.elevRim) : null, sumpElev: st.attrs.elevSump !== undefined ? Number(st.attrs.elevSump) : null, dia: Number(shape?.attrs.diameter) || 0, sumpDepth: 0 };
      // 0.6 WL.27: a rectangular structure, or one with a wall thickness, is read as a structure type (the app makes them)
      const thick = Number(shape?.attrs.thickness);
      if (shape?.name === 'RectStruct' && Number(shape.attrs.length) > 0 && Number(shape.attrs.width) > 0) {
        rec.shapeIn = { shape: 'rect', l: Number(shape.attrs.length), w: Number(shape.attrs.width), wall: thick >= 0 ? thick : 0, name: shape.attrs.desc || '' };
        rec.dia = rec.shapeIn.w;
      } else if (shape?.name === 'CircStruct' && rec.dia > 0 && Number.isFinite(thick) && shape.attrs.thickness !== undefined) rec.shapeIn = { shape: 'round', dia: rec.dia, wall: thick >= 0 ? thick : 0, name: shape.attrs.desc || '' };
      else if (shape && shape.name !== 'CircStruct') note(t('lx.st.round'));
      byName.set(rec.name, rec); net.structures.push(rec);
      for (const iv of kids(st, 'Invert')) inv.set(rec.name + '|' + iv.attrs.refPipe + '|' + iv.attrs.flowDir, Number(iv.attrs.elev));
    }
    let q = 0;
    for (const ps of kids(pn, 'Pipes')) for (const p of kids(ps, 'Pipe')) {
      const a = byName.get(p.attrs.refStart), b = byName.get(p.attrs.refEnd);
      if (!a || !b) { note(t('lx.pipe.missing')); continue; }
      const circ = kid(p, 'CircPipe');
      if (!circ) note(t('lx.pipe.round'));
      const name = p.attrs.name || 'P' + (q + 1);
      const up = inv.get(a.name + '|' + name + '|out') ?? inv.get(a.name + '|' + name + '|both');
      const dn = inv.get(b.name + '|' + name + '|in') ?? inv.get(b.name + '|' + name + '|both');
      net.pipes.push({ id: 'q' + ++q, name, from: a.id, to: b.id, dia: Number(circ?.attrs.diameter) || 0, invUp: Number.isFinite(up) ? up : null, invDn: Number.isFinite(dn) ? dn : null });
    }
    for (const st of net.structures) {
      const v = [];
      for (const p of net.pipes) { if (p.from === st.id && Number.isFinite(p.invUp)) v.push(p.invUp); if (p.to === st.id && Number.isFinite(p.invDn)) v.push(p.invDn); }
      if (Number.isFinite(st.sumpElev) && v.length) st.sumpDepth = Math.max(0, Math.min(...v) - st.sumpElev);
      delete st.sumpElev;
    }
    if (net.pipes.length) out.networks.push(net);
  }
  // 0.6 WL.24: feature lines (PlanFeatures): consecutive Line / Curve / IrregularLine pieces joined into one line
  out.features = [];
  for (const pfs of kids(root, 'PlanFeatures')) for (const pf of kids(pfs, 'PlanFeature')) {
    const pts = [];
    let gaps = 0, noZ = false;
    const P = (el) => { const v = nums(textOf(el)); if (v.length < 2 || !v.every(Number.isFinite)) return null; if (v.length < 3) noZ = true; return { x: v[1], y: v[0], z: v.length >= 3 ? v[2] : 0 }; };
    const join = (a) => {
      const last = pts[pts.length - 1];
      if (!last) { pts.push(a); return pts[0]; }
      if (Math.hypot(a.x - last.x, a.y - last.y) > 1e-6) { gaps++; pts.push(a); }
      return pts[pts.length - 1];
    };
    for (const cg of kids(pf, 'CoordGeom')) for (const c of cg.children) {
      if (c.name === 'Line' || c.name === 'Curve') {
        const a = P(kid(c, 'Start')), b = P(kid(c, 'End'));
        if (!a || !b) { note(t('lx.fl.bad', { name: pf.attrs.name || '' })); continue; }
        const from = join(a);
        if (c.name === 'Curve') {
          const cc = P(kid(c, 'Center'));
          const bulge = cc ? curveBulge(from, cc, b, c.attrs.rot) : 0;
          if (bulge) from.b = bulge; else note(t('lx.fl.bad', { name: pf.attrs.name || '' }));
        }
        pts.push(b);
      } else if (c.name === 'IrregularLine') {
        const v = nums(kid(c, 'PntList3D') ? textOf(kid(c, 'PntList3D')) : textOf(kid(c, 'PntList2D')));
        const three = !!kid(c, 'PntList3D'), k = three ? 3 : 2;
        if (!three) noZ = true;
        for (let i = 0; i + k - 1 < v.length; i += k) { const q = { x: v[i + 1], y: v[i], z: three ? v[i + 2] : 0 }; if (i === 0) join(q); else pts.push(q); }
      } else if (c.name === 'Spiral') note(t('lx.fl.spiral'));
    }
    if (pts.length < 2) continue;
    const props = {};
    for (const ft of kids(pf, 'Feature')) if (ft.attrs.code === 'CivilCraft') for (const pr of kids(ft, 'Property')) props[pr.attrs.label] = pr.attrs.value;
    const first = pts[0], last = pts[pts.length - 1];
    let closed = props.closed === '1';
    if (pts.length >= 3 && Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) {   // ends where it began: a closed line
      pts.pop(); closed = true;
    }
    if (gaps) note(t('lx.fl.gaps', { name: pf.attrs.name || '', n: gaps }));
    if (noZ) note(t('lx.fl.noz', { name: pf.attrs.name || '' }));
    out.features.push({ name: pf.attrs.name || '', pts, closed, use: ['eg', 'design', 'off'].includes(props.use) ? props.use : null });
  }
  for (const k of ['Parcels', 'Roadways', 'GradeModel', 'Survey']) if (kid(root, k)) note(t('lx.notyet', { what: k }));
  return out;
}

/** The arc from a to b with bulge a.b (+ = left), or null (featureline.js arcOf, kept here so this module stands alone). */
function arcGeom(a, b) {
  const bb = Number.isFinite(a.b) && a.b !== 0 && Math.abs(a.b) < 100 ? a.b : 0, dx = b.x - a.x, dy = b.y - a.y, c = Math.hypot(dx, dy);
  if (!bb || !(c > 1e-12)) return null;
  const k = (1 - bb * bb) / (4 * bb), r = (c * (1 + bb * bb)) / (4 * Math.abs(bb)), sweep = 4 * Math.atan(bb);
  return { cx: (a.x + b.x) / 2 - k * dy, cy: (a.y + b.y) / 2 + k * dx, r, sweep, L: r * Math.abs(sweep) };
}
/** A LandXML Curve (Start, Center, End, rot cw|ccw) → the bulge of the segment from start to end (0 = not an arc). */
function curveBulge(s, c, e, rot) {
  const a0 = Math.atan2(s.y - c.y, s.x - c.x), a1 = Math.atan2(e.y - c.y, e.x - c.x), ccw = rot !== 'cw';
  let sw = ccw ? a1 - a0 : a0 - a1;
  sw = ((sw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (sw < 1e-12) return 0;
  return (ccw ? 1 : -1) * Math.tan(sw / 4);
}

/** The point where the tangents at a curve's start and end meet (from its centre). */
function tangentsMeet(s, e, c) {
  const a = { x: -(s.y - c.y), y: s.x - c.x }, b = { x: -(e.y - c.y), y: e.x - c.x };
  const den = a.x * b.y - a.y * b.x;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((e.x - s.x) * b.y - (e.y - s.y) * b.x) / den;
  return { x: s.x + a.x * t, y: s.y + a.y * t };
}

export function scaleImport(d, k) {
  if (k === 1) return d;
  const p = (q) => (q ? { ...q, x: q.x * k, y: q.y * k, ...(q.z !== undefined && q.z !== null ? { z: q.z * k } : {}) } : q);
  d.points = d.points.map(p);
  for (const s of d.surfaces) { s.pts = s.pts.map(p); s.breaklines = s.breaklines.map((b) => ({ ...b, pts: b.pts.map(p) })); s.boundary = s.boundary && s.boundary.map(p); }
  for (const a of d.alignments) {
    a.start *= k; a.pis = a.pis.map((q) => ({ ...p(q), r: q.r * k }));
    for (const pr of a.profiles) pr.pvis = pr.pvis.map((v) => ({ sta: v.sta * k, z: v.z * k, L: v.L * k }));
    for (const ps of a.surfProfiles) ps.pts = ps.pts.map((v) => ({ sta: v.sta * k, z: v.z * k }));
  }
  for (const f of d.features || []) f.pts = f.pts.map(p);   // bulges are ratios: they stay
  for (const n of d.networks || []) {
    n.structures = n.structures.map((x) => ({ ...x, x: x.x * k, y: x.y * k, rim: x.rim === null ? null : x.rim * k, sumpDepth: x.sumpDepth * k }));
    n.pipes = n.pipes.map((p) => ({ ...p, invUp: p.invUp === null ? null : p.invUp * k, invDn: p.invDn === null ? null : p.invDn * k }));
  }
  return d;
}
