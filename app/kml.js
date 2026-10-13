/* SPDX-License-Identifier: Apache-2.0 */
/**
 * kml.js — KML (OGC KML 2.2) read and written (0.4 V6). No DOM; the Node test drives it (bin/test-civilcraft-kml.mjs).
 * A KMZ is a zip holding the KML (gis-read.js unpacks it). Coordinates are WGS 84 longitude, latitude and height in
 * metres, like GeoJSON — so an import goes through the same coordinate system steps (src kind 'wgs84').
 *
 *   readKml(text, name, { maxFeatures }) → { layers, notes }
 *     Every Placemark: Point, LineString, LinearRing, Polygon (outer + inner boundaries), MultiGeometry (flattened into
 *     its parts), gx:Track (as a line). One layer per kind (points, lines, polygons) and Folder: "<folder> (lines)" …;
 *     placemarks outside any folder go to "<file>". Attributes: name, description (markup removed), and every
 *     ExtendedData Data/value and SchemaData/SimpleData (as text, numbers when they all read as numbers). Altitude
 *     modes are not applied: a height is kept as given (clampToGround placemarks with 0 heights are read as 2D).
 *     Untrusted: no entity expansion beyond XML's five (xml.js), ≤ maxFeatures, bad coordinates drop that geometry
 *     (counted in notes), ≤ 1 M vertices.
 *   writeKml(groups, { toLonLat, zToMetres (a factor or z → metres), name }) → text
 *     One Document; a Folder per group (its kind); every feature a Placemark named from its NAME field (else the kind and
 *     its number), its fields as ExtendedData, geometry in lon/lat to 1e-9°, polygons outer counter-clockwise; with z
 *     (when the group has it) altitudeMode absolute and heights in metres.
 */

import { parseXml, esc } from './xml.js';
import { orient } from './gis-geom.js';
import { t } from './i18n.js';

export class KmlError extends Error {}
const MAX_VERTS = 1e6;

const childrenNamed = (el, name) => (el ? el.children.filter((c) => c.name === name) : []);
const firstNamed = (el, name) => (el ? el.children.find((c) => c.name === name) || null : null);
const textIn = (el) => (el ? (el.text || '').trim() : '');

function coords(text, notes, counter) {
  const out = [];
  for (const tok of String(text || '').trim().split(/\s+/)) {
    if (!tok) continue;
    const v = tok.split(',').map(Number);
    if (v.length < 2 || !Number.isFinite(v[0]) || !Number.isFinite(v[1]) || Math.abs(v[0]) > 180 || Math.abs(v[1]) > 90) return null;
    if (++counter.n > MAX_VERTS) return null;
    out.push(v.length >= 3 && Number.isFinite(v[2]) ? [v[0], v[1], v[2]] : [v[0], v[1]]);
  }
  return out;
}

export function readKml(text, name = 'KML', { maxFeatures = 500000 } = {}) {
  let root;
  try { root = parseXml(String(text).replace(/^﻿/, '')); } catch (e) { throw new KmlError(t('kml.bad', { name, why: e.message })); }
  const kmlEl = root.children.find((c) => c.name === 'kml') || root;
  const notes = [];
  const counter = { n: 0 };
  const groups = new Map();   // "<folder>|<kind>" → layer
  let bad = 0, count = 0, cut = false;
  const fieldTypes = new Map();
  const layerFor = (folder, kind) => {
    const k = folder + '|' + kind;
    let l = groups.get(k);
    if (!l) groups.set(k, (l = { folder, kind, features: [], fields: new Map() }));
    return l;
  };
  function geoms(g, out) {
    if (!g) return;
    switch (g.name) {
      case 'Point': { const c = coords(textIn(firstNamed(g, 'coordinates')), notes, counter); if (c && c.length) out.push({ t: 'pt', c: c[0] }); else bad++; break; }
      case 'LineString': case 'LinearRing': { const c = coords(textIn(firstNamed(g, 'coordinates')), notes, counter); if (c && c.length >= 2) out.push({ t: 'ln', c: [c] }); else bad++; break; }
      case 'Polygon': {
        const ring = (b) => coords(textIn(firstNamed(firstNamed(b, 'LinearRing'), 'coordinates')), notes, counter);
        const outer = ring(firstNamed(g, 'outerBoundaryIs'));
        if (!outer || outer.length < 4) { bad++; break; }
        const holes = childrenNamed(g, 'innerBoundaryIs').map(ring).filter((r) => r && r.length >= 4);
        out.push({ t: 'pg', c: [[outer, ...holes]] });
        break;
      }
      case 'MultiGeometry': for (const c of g.children) geoms(c, out); break;
      case 'Track': {   // gx:Track (namespace prefixes are dropped): <gx:coord>lon lat alt</gx:coord>
        const c = childrenNamed(g, 'coord').map((x) => textIn(x).split(/\s+/).map(Number)).filter((v) => v.length >= 2 && v.every(Number.isFinite)).map((v) => (v.length >= 3 ? [v[0], v[1], v[2]] : [v[0], v[1]]));
        if (c.length >= 2) out.push({ t: 'ln', c: [c] }); else bad++;
        break;
      }
      default: break;
    }
  }
  function placemark(pm, folder) {
    if (cut) return;
    const props = {};
    const nm = textIn(firstNamed(pm, 'name')); if (nm) props.name = nm;
    const ds = textIn(firstNamed(pm, 'description')).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); if (ds) props.description = ds.slice(0, 10000);
    const ext = firstNamed(pm, 'ExtendedData');
    for (const d of childrenNamed(ext, 'Data')) { const k = String(d.attrs.name || '').slice(0, 64); if (k && k !== '__proto__') props[k] = textIn(firstNamed(d, 'value')).slice(0, 10000); }
    for (const sd of childrenNamed(ext, 'SchemaData')) for (const d of childrenNamed(sd, 'SimpleData')) { const k = String(d.attrs.name || '').slice(0, 64); if (k && k !== '__proto__') props[k] = textIn(d).slice(0, 10000); }
    const out = [];
    for (const c of pm.children) geoms(c, out);
    for (const g of out) {
      if (++count > maxFeatures) { cut = true; return; }
      const flat2d = (g.t === 'pt' ? [g.c] : g.t === 'ln' ? g.c[0] : g.c.flat()).every((p) => p.length < 3 || p[2] === 0);
      const geom = flat2d ? stripZ(g) : g;
      const l = layerFor(folder, g.t);
      l.features.push({ g: geom, p: { ...props } });
      for (const [k, v] of Object.entries(props)) { if (!l.fields.has(k)) l.fields.set(k, true); const ty = fieldTypes.get(l.folder + '|' + l.kind + '|' + k); fieldTypes.set(l.folder + '|' + l.kind + '|' + k, ty === 'text' ? 'text' : /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(v) ? 'number' : 'text'); }
    }
    if (pm.children.some((c) => c.name === 'MultiGeometry') && out.length > 1) multi++;
  }
  let multi = 0;
  function walk(el, folder) {
    for (const c of el.children) {
      if (cut) return;
      if (c.name === 'Placemark') placemark(c, folder);
      else if (c.name === 'Folder' || c.name === 'Document') walk(c, textIn(firstNamed(c, 'name')) || folder);   // a named Folder or Document (GDAL writes layers as either) groups its placemarks
    }
  }
  walk(kmlEl, name);
  const KIND = { pt: t('kml.kind.pt'), ln: t('kml.kind.ln'), pg: t('kml.kind.pg') };
  const layers = [...groups.values()].map((l) => {
    const sameFolder = [...groups.values()].filter((x) => x.folder === l.folder).length > 1;
    const fields = [...l.fields.keys()].map((k) => ({ name: k, type: fieldTypes.get(l.folder + '|' + l.kind + '|' + k) || 'text' }));
    for (const f of l.features) for (const fd of fields) if (fd.type === 'number' && typeof f.p[fd.name] === 'string') f.p[fd.name] = Number(f.p[fd.name]);
    const hasZ = l.features.some((f) => hasZOf(f.g));
    return { name: sameFolder ? t('kml.layer', { folder: l.folder, kind: KIND[l.kind] }) : l.folder, geom: l.kind, hasZ, fields, features: l.features, notes: [] };
  });
  if (bad) notes.push(t('kml.bad.geom', { n: bad }));
  if (cut) notes.push(t('kml.cut', { n: maxFeatures.toLocaleString('en-US') }));
  if (multi) notes.push(t('kml.multi', { n: multi }));
  return { layers, notes };
}
const stripZ = (g) => (g.t === 'pt' ? { t: 'pt', c: g.c.slice(0, 2) } : g.t === 'ln' ? { t: 'ln', c: g.c.map((r) => r.map((p) => p.slice(0, 2))) } : { t: 'pg', c: g.c.map((poly) => poly.map((r) => r.map((p) => p.slice(0, 2)))) });
const hasZOf = (g) => (g.t === 'pt' ? g.c.length > 2 : (g.t === 'ln' ? g.c : g.c.flat()).some((r) => r.some((p) => p.length > 2)));

// ---------------------------------------------------------------------------- writing
const f9 = (v) => String(Math.round(v * 1e9) / 1e9);
export function writeKml(groups, { toLonLat, zToMetres = 1, name = 'CivilCraft' } = {}) {
  const out = ['<?xml version="1.0" encoding="UTF-8"?>', '<kml xmlns="http://www.opengis.net/kml/2.2">', '<Document>', '<name>' + esc(name) + '</name>'];
  const zm = typeof zToMetres === 'function' ? zToMetres : (z) => z * zToMetres;
  const pos = (p, z) => { const [lon, lat] = toLonLat(p[0], p[1]); return f9(lon) + ',' + f9(lat) + (z && p.length > 2 && Number.isFinite(p[2]) ? ',' + String(Math.round(zm(p[2]) * 1e4) / 1e4) : ''); };
  const ring = (r, z) => r.map((p) => pos(p, z)).join(' ');
  for (const g of groups) {
    out.push('<Folder>', '<name>' + esc(g.kind) + '</name>');
    const z = !!g.hasZ;
    g.features.forEach((f, i) => {
      if (!f.g) return;
      const nameField = Object.keys(f.p || {}).find((k) => /^name$/i.test(k));
      out.push('<Placemark>', '<name>' + esc(nameField ? f.p[nameField] : g.kind + ' ' + (i + 1)) + '</name>');
      const ext = Object.entries(f.p || {}).filter(([, v]) => v !== null && v !== undefined);
      if (ext.length) { out.push('<ExtendedData>'); for (const [k, v] of ext) out.push('<Data name="' + esc(k) + '"><value>' + esc(v) + '</value></Data>'); out.push('</ExtendedData>'); }
      const alt = z ? '<altitudeMode>absolute</altitudeMode>' : '';
      const geo = f.g;
      if (geo.t === 'pt') out.push('<Point>' + alt + '<coordinates>' + pos(geo.c, z) + '</coordinates></Point>');
      else if (geo.t === 'ln') {
        const parts = geo.c.map((r) => '<LineString>' + alt + '<coordinates>' + ring(r, z) + '</coordinates></LineString>');
        out.push(parts.length > 1 ? '<MultiGeometry>' + parts.join('') + '</MultiGeometry>' : parts[0]);
      } else if (geo.t === 'pg') {
        const o = orient(geo, true);   // outer counter-clockwise, holes clockwise (the order KML expects)
        const polys = o.c.map((poly) => '<Polygon>' + alt + '<outerBoundaryIs><LinearRing><coordinates>' + ring(poly[0], z) + '</coordinates></LinearRing></outerBoundaryIs>' + poly.slice(1).map((h) => '<innerBoundaryIs><LinearRing><coordinates>' + ring(h, z) + '</coordinates></LinearRing></innerBoundaryIs>').join('') + '</Polygon>');
        out.push(polys.length > 1 ? '<MultiGeometry>' + polys.join('') + '</MultiGeometry>' : polys[0]);
      }
      out.push('</Placemark>');
    });
    out.push('</Folder>');
  }
  out.push('</Document>', '</kml>');
  return out.join('\n') + '\n';
}
