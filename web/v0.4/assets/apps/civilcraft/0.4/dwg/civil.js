/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civil.js — fromCivilList(list) → Model (cc-dwg, Apache-2.0): the adapter that keeps CivilCraft's (and
 * CadCraft's) existing `writeDwg({ units, layers, entities })` calls working on top of the library.
 *
 *   list = { units: 'ft' | 'm' | undefined, insunits?, metric?, layers: [{ name, color, on, frozen, locked, plot }],
 *            blocks?: [{ name, base: {x, y}, entities }], entities, extents?, created? }
 *   entities (the shapes CivilCraft's dxf.js / dwg-write.js take; each has `layer` and optional `color`
 *   (null by layer, 0 by block, 1–255 ACI)):
 *     poly {pts:[{x,y,b?}], closed, elev}           → LWPOLYLINE        poly3d {pts:[{x,y,z}], closed} → POLYLINE_3D
 *     line {a, b}                                   → LINE              arc {c, r, a0, a1} (radians, CCW) → ARC
 *     circle {c, r}                                 → CIRCLE            point {x, y, z} → POINT
 *     text {x, y, h, rot, text, align|ha, va, wf}   → TEXT              mtext {x, y, h, rot, text, width, attach, ls} → MTEXT
 *     ellipse {c, major, ratio, t0, t1}             → ELLIPSE           solid {pts: 4 corners} → SOLID
 *     hatch {loops: [[{x,y}…]]} (solid, even-odd)   → HATCH             insert {block, x, y, sx, sy, rot, attribs} → INSERT
 *     attdef {…text, tag, prompt, invisible, constant, preset} (in blocks) → ATTDEF
 * No DWG knowledge here — only the mapping. Layer colours may be ACI numbers or a few names (red, yellow, …).
 */

const ACI = { red: 1, yellow: 2, green: 3, cyan: 4, blue: 5, magenta: 6, white: 7, gray: 8, orange: 30, brown: 34 };
const H_ALIGN = { left: 0, center: 1, right: 2 }, V_ALIGN = { baseline: 0, bottom: 1, middle: 2, top: 3 };
const fin = (...v) => v.every(Number.isFinite);

export function fromCivilList({ units, insunits, metric, layers = [], blocks = [], entities = [], extents = null, created } = {}) {
  if (insunits === undefined) insunits = units === 'm' ? 6 : units === 'ft' ? 2 : 0;
  if (metric === undefined) metric = units !== undefined ? units === 'm' : ![1, 2, 3, 8, 9, 10].includes(insunits);
  const header = { INSUNITS: insunits, MEASUREMENT: metric ? 1 : 0, LUPREC: metric ? 3 : 2 };
  if (extents && fin(extents.minX, extents.minY, extents.maxX, extents.maxY)) {
    header.EXTMIN = { x: extents.minX, y: extents.minY, z: 0 };
    header.EXTMAX = { x: extents.maxX, y: extents.maxY, z: 0 };
  }
  const colorOf = (c) => (c === 0 ? { index: 0 } : Number.isInteger(c) && c >= 1 && c <= 255 ? { index: c } : { index: 256 });
  const tableLayers = [];
  const seen = new Set();
  const addLayer = (l) => {
    const name = String(l.name ?? '0');
    if (seen.has(name)) return;
    seen.add(name);
    const c = typeof l.color === 'number' ? l.color : ACI[l.color] || 7;
    tableLayers.push({ name, color: { index: Math.min(255, Math.max(1, Math.round(Math.abs(c)) || 7)) }, off: l.on === false, frozen: !!l.frozen, locked: !!l.locked, plot: l.plot !== false });
  };
  addLayer(layers.find((l) => l.name === '0') || { name: '0', color: 7 });
  for (const l of layers) addLayer(l);
  const text = (e) => {
    const ha = H_ALIGN[e.ha ?? e.align] ?? (Number.isInteger(e.ha) ? e.ha : 0), va = V_ALIGN[e.va] ?? (Number.isInteger(e.va) ? e.va : 0);
    const at = { x: e.x, y: e.y, z: 0 };
    return { insert: at, align: ha || va ? at : undefined, hAlign: ha, vAlign: va, height: e.h, rotation: Number.isFinite(e.rot) ? e.rot : 0,
      widthFactor: e.wf > 0 ? e.wf : 1, value: String(e.text ?? '') };
  };
  const tagOf = (t) => String(t).toUpperCase().replace(/\s+/g, '_').replace(/[\x00-\x1f]/g, '') || 'TAG';
  const attFlags = (a) => (a.invisible ? 1 : 0) | (a.constant ? 2 : 0) | (a.verify ? 4 : 0) | (a.preset ? 8 : 0);
  /** one list item → model entity (null = left out, as the old writer did) */
  function conv(e) {
    const base = { layer: String(e.layer || '0'), color: colorOf(e.color) };
    if (!seen.has(base.layer)) addLayer({ name: base.layer, color: 7 });
    switch (e.type) {
      case 'poly': {
        const pts = (e.pts || []).filter((p) => fin(p.x, p.y));
        if (pts.length < 2) return null;
        return { ...base, type: 'LWPOLYLINE', vertices: pts.map((p) => ({ x: p.x, y: p.y, bulge: Number.isFinite(p.b) ? p.b : 0 })), closed: !!e.closed, elevation: Number.isFinite(e.elev) ? e.elev : 0 };
      }
      case 'poly3d': {
        const pts = (e.pts || []).filter((p) => fin(p.x, p.y));
        if (pts.length < 2) return null;
        return { ...base, type: 'POLYLINE_3D', vertices: pts.map((p) => ({ x: p.x, y: p.y, z: p.z || 0 })), closed: !!e.closed };
      }
      case 'line':
        if (!fin(e.a?.x, e.a?.y, e.b?.x, e.b?.y)) return null;
        return { ...base, type: 'LINE', start: { x: e.a.x, y: e.a.y, z: e.a.z || 0 }, end: { x: e.b.x, y: e.b.y, z: e.b.z || 0 } };
      case 'arc':
        if (!fin(e.c?.x, e.c?.y, e.r, e.a0, e.a1) || !(e.r > 0)) return null;
        return { ...base, type: 'ARC', center: { x: e.c.x, y: e.c.y, z: 0 }, radius: e.r, startAngle: e.a0, endAngle: e.a1 };
      case 'circle':
        if (!fin(e.c?.x, e.c?.y, e.r) || !(e.r > 0)) return null;
        return { ...base, type: 'CIRCLE', center: { x: e.c.x, y: e.c.y, z: 0 }, radius: e.r };
      case 'point':
        if (!fin(e.x, e.y)) return null;
        return { ...base, type: 'POINT', position: { x: e.x, y: e.y, z: Number.isFinite(e.z) ? e.z : 0 } };
      case 'text':
        if (!fin(e.x, e.y) || !(e.h > 0) || !String(e.text ?? '').length) return null;
        return { ...base, type: 'TEXT', ...text(e) };
      case 'mtext':
        if (!fin(e.x, e.y) || !(e.h > 0) || !String(e.text ?? '').length) return null;
        return { ...base, type: 'MTEXT', insert: { x: e.x, y: e.y, z: 0 }, rotation: Number.isFinite(e.rot) ? e.rot : 0, height: e.h, value: String(e.text),
          width: e.width > 0 ? e.width : 0, attach: Number.isInteger(e.attach) && e.attach >= 1 && e.attach <= 9 ? e.attach : 1, lineSpacing: e.ls > 0 ? e.ls : 1,
          extWidth: e.extW > 0 ? e.extW : 0, extHeight: e.extH > 0 ? e.extH : 0 };
      case 'ellipse':
        if (!fin(e.c?.x, e.c?.y, e.major?.x, e.major?.y, e.ratio, e.t0, e.t1) || !(e.ratio > 0) || !(Math.hypot(e.major.x, e.major.y) > 0)) return null;
        return { ...base, type: 'ELLIPSE', center: { x: e.c.x, y: e.c.y, z: 0 }, majorAxis: { x: e.major.x, y: e.major.y, z: 0 }, ratio: e.ratio, startParam: e.t0, endParam: e.t1 };
      case 'solid': {
        const p = (e.pts || []).filter((q) => fin(q.x, q.y));
        if (p.length < 3) return null;
        return { ...base, type: 'SOLID', points: [p[0], p[1], p[2], p[3] || p[2]].map((q) => ({ x: q.x, y: q.y, z: 0 })) };
      }
      case 'hatch': {
        const loops = (e.loops || []).map((l) => l.filter((q) => fin(q.x, q.y))).filter((l) => l.length >= 3);
        if (!loops.length) return null;
        return { ...base, type: 'HATCH', solid: true, pattern: 'SOLID', style: 0, patternType: 1,
          loops: loops.map((l) => ({ flags: 1, polyline: { vertices: l.map((q) => ({ x: q.x, y: q.y })), closed: true } })) };
      }
      case 'attdef':
        if (!fin(e.x, e.y) || !(e.h > 0) || !e.tag) return null;
        return { ...base, type: 'ATTDEF', ...text(e), tag: tagOf(e.tag), prompt: String(e.prompt ?? ''), flags: attFlags(e) };
      case 'insert':
        if (!fin(e.x, e.y)) return null;
        return { ...base, type: 'INSERT', block: e.block, insert: { x: e.x, y: e.y, z: 0 },
          scale: { x: Number.isFinite(e.sx) && e.sx ? e.sx : 1, y: Number.isFinite(e.sy) && e.sy ? e.sy : 1, z: 1 }, rotation: Number.isFinite(e.rot) ? e.rot : 0,
          attribs: (e.attribs || []).filter((a) => fin(a.x, a.y) && a.h > 0 && a.tag).map((a) => ({ type: 'ATTRIB', layer: String(a.layer || e.layer || '0'), color: colorOf(a.color ?? e.color), ...text(a), tag: tagOf(a.tag), flags: attFlags(a) })) };
      default: return null;
    }
  }
  // an item that cannot be drawn is passed on as an empty LINE: the writer leaves it out and says so
  const convOrEmpty = (e) => conv(e) || { type: 'LINE', layer: String(e?.layer || '0') };
  const msEntities = entities.map(convOrEmpty);
  const modelBlocks = [{ name: '*Model_Space', entities: msEntities }, { name: '*Paper_Space', entities: [] }];
  for (const b of blocks) {
    const ents = (b.entities || []).map(convOrEmpty);
    modelBlocks.push({ name: b.name, base: { x: b.base?.x || 0, y: b.base?.y || 0, z: 0 }, entities: ents });
  }
  return {
    version: 'AC1015', codepage: 'ANSI_1252', header,
    tables: { layers: tableLayers },
    blocks: modelBlocks, layouts: [], objects: [],
    created: created instanceof Date ? created : undefined,
  };
}
