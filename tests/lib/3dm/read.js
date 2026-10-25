/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is file-format text. */
/**
 * read.js — a .3dm file's tables into a plain model. Untrusted input: every count, offset and index is checked (archive.js,
 * objects.js), one object that cannot be read is left out and counted, never guessed; the whole file fails only when its
 * outline (the start, the tables) is broken. Table order and layouts from openNURBS's ON_BinaryArchive (see NOTICE).
 *
 *   read3dm(bytes, opts) → {
 *     version (2–4, 50, 60, 70, 80), onVersion, application, units { system, name, metres (per file unit) }, tolerance,
 *     layers [{ index, name, path, color, visible, locked, material, id, parent }],
 *     materials [{ index, name, diffuse [r,g,b,a], transparency }],
 *     blocks Map(id → { id, name, objects [uuid], linked }),
 *     objects [{ attrs (objects.js readAttributes), geom (objects.js record) }],
 *     unread { kind → n }  (records of a class read as "not read yet"),  unreadable n  (records that would not read),
 *     notes [{ key, vars }]
 *   }
 *   opts.limits: lower caps (util.js LIMITS)
 */
import { Archive, TC } from './archive.js';
import { readObject, readAttributes } from './objects.js';
import { ThreeDmError, damaged, tooBig, unsupported, limitsOf } from './util.js';

/** File units (ON::LengthUnitSystem) → [name, metres per unit]. */
export const UNITS = {
  0: ['none', 1], 1: ['um', 1e-6], 2: ['mm', 1e-3], 3: ['cm', 1e-2], 4: ['m', 1], 5: ['km', 1e3], 6: ['uin', 2.54e-8], 7: ['mil', 2.54e-5],
  8: ['in', 0.0254], 9: ['ft', 0.3048], 10: ['mi', 1609.344], 12: ['A', 1e-10], 13: ['nm', 1e-9], 14: ['dm', 0.1], 15: ['dam', 10],
  16: ['hm', 100], 17: ['Mm', 1e6], 18: ['Gm', 1e9], 19: ['yd', 0.9144], 20: ['pt', 0.0254 / 72], 21: ['pc', 0.0254 / 6],
  22: ['nmi', 1852], 23: ['au', 1.495978707e11], 24: ['ly', 9.4607304725808e15], 25: ['pc', 3.0856776e16],
};

export function read3dm(bytes, opts = {}) {
  const limits = limitsOf(opts);
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  if (bytes.length > limits.fileBytes) throw tooBig('ccdm.too_big.count', { n: bytes.length });
  const ar = new Archive(bytes);
  if (ar.version < 2) throw unsupported('ccdm.unsupported.version', { version: ar.version });
  const ctx = { ar, depth: 0, limits };
  const out = {
    version: ar.version, onVersion: 0, application: '', units: { system: 2, name: 'mm', metres: 1e-3 }, tolerance: 0.001,
    layers: [], materials: [], blocks: new Map(), objects: [], unread: {}, unreadable: 0, notes: [],
  };
  const top = ar.reader();
  let sawObjects = false;
  while (!top.atEnd()) {
    const c = top.chunk();
    if (c.tc === TC.ENDOFFILE || (c.short && c.tc === (TC.ENDOFFILE | TC.SHORT))) break;
    if (c.short) continue;
    const r = top.sub(c);
    switch (c.tc) {
      case TC.PROPERTIES_TABLE: properties(r, out, ar); break;
      case TC.SETTINGS_TABLE: settings(r, out); break;
      case TC.LAYER_TABLE: table(r, TC.LAYER_RECORD, ctx, out, (o) => { if (o && o.cls === 'layer' && !o.unread) out.layers.push(o); }); break;
      case TC.MATERIAL_TABLE: table(r, TC.MATERIAL_RECORD, ctx, out, (o) => { out.materials.push(o && o.cls === 'material' && !o.unread ? o : { cls: 'material', unread: true, name: '', diffuse: null }); }); break;
      case TC.IDEF_TABLE: table(r, TC.IDEF_RECORD, ctx, out, (o) => { if (o && o.cls === 'instanceDefinition' && !o.unread && o.id) out.blocks.set(o.id, o); }); break;
      case TC.OBJECT_TABLE: sawObjects = true; objectTable(r, ctx, out); break;
      default: break;
    }
  }
  if (!sawObjects) out.notes.push({ key: 'ccdm.note.no_objects', vars: {} });
  // layer paths ("Parent::Child") for tags; a loop in the parents stops at the first repeat
  const byId = new Map(out.layers.filter((l) => l.id).map((l) => [l.id, l]));
  for (const l of out.layers) {
    const names = [l.name];
    const seen = new Set([l]);
    let p = l.parent && byId.get(l.parent);
    while (p && !seen.has(p) && names.length < limits.depth) { names.unshift(p.name); seen.add(p); p = p.parent && byId.get(p.parent); }
    l.path = names.join('::');
    // a layer inside a hidden parent is hidden too
    let q = l.parent && byId.get(l.parent);
    const seen2 = new Set([l]);
    while (q && !seen2.has(q)) { if (!q.visible) l.shownByParent = false; seen2.add(q); q = q.parent && byId.get(q.parent); }
  }
  return out;
}

function properties(r, out, ar) {
  while (!r.atEnd()) {
    const c = r.chunk();
    if (c.tc === TC.OPENNURBS_VERSION) { ar.onVersion = c.value >>> 0; out.onVersion = ar.onVersion; continue; }
    if (c.short) continue;
    const s = r.sub(c);
    if (c.tc === TC.PROPERTIES_APPLICATION) { try { s.versioned(); out.application = s.wstring().slice(0, 200); } catch { /* the program's name is a courtesy */ } }
  }
}

function settings(r, out) {
  while (!r.atEnd()) {
    const c = r.chunk();
    if (c.short) continue;
    const s = r.sub(c);
    if (c.tc !== TC.UNITSANDTOLS) continue;
    try {
      const v = s.i32();
      if (v < 100 || v >= 200) continue;
      const system = s.u32();
      const tol = s.f64();
      s.f64(); s.f64();
      let metres = UNITS[system] ? UNITS[system][1] : 1e-3;
      let name = UNITS[system] ? UNITS[system][0] : 'mm';
      if (v >= 102) {
        s.i32(); s.i32();
        const mpu = s.f64();
        if (system === 11 && mpu > 0 && Number.isFinite(mpu)) { metres = mpu; name = 'custom'; }
      } else if (system === 11) { name = 'mm'; metres = 1e-3; }
      out.units = { system, name, metres };
      if (tol > 0 && Number.isFinite(tol)) out.tolerance = tol;
    } catch { /* keep millimetres */ }
  }
}

/** A table of records, each a chunk of `recTc` holding one class. A record that will not read is counted and skipped. */
function table(r, recTc, ctx, out, take) {
  while (!r.atEnd()) {
    const c = r.chunk();
    if (c.tc === TC.ENDOFTABLE) break;
    if (c.short) continue;
    const s = r.sub(c);
    if (c.tc !== recTc) continue;
    try { take(readObject(s, ctx)); } catch (e) { if (e instanceof ThreeDmError && e.code === 'too_big') throw e; take(null); }
  }
}

function objectTable(r, ctx, out) {
  while (!r.atEnd()) {
    const c = r.chunk();
    if (c.tc === TC.ENDOFTABLE) break;
    if (c.short) continue;
    const s = r.sub(c);
    if (c.tc !== TC.OBJECT_RECORD) continue;
    if (out.objects.length >= ctx.limits.objects) throw tooBig('ccdm.too_big.objects', { n: out.objects.length });
    let geom = null, attrs = null;
    try {
      const t = s.chunk();
      if (t.tc !== TC.OBJECT_RECORD_TYPE) throw damaged('ccdm.damaged.layout', { tc: 'object' });
      geom = readObject(s, ctx);
      while (!s.atEnd()) {
        const a = s.chunk();
        if (a.tc === TC.OBJECT_RECORD_END) break;
        if (a.short) continue;
        const q = s.sub(a);
        if (a.tc === TC.OBJECT_RECORD_ATTRIBUTES) { try { attrs = readAttributes(q, ctx); } catch { attrs = null; } }
      }
    } catch (e) {
      if (e instanceof ThreeDmError && e.code === 'too_big') throw e;
      out.unreadable++;
      continue;
    }
    if (!geom) continue;
    if (geom.cls === 'unknown' || geom.unread || !READ_KINDS.has(geom.cls)) {
      const k = geom.cls === 'unknown' ? 'other' : geom.cls === 'brep' ? 'oldBrep' : geom.cls;
      out.unread[k] = (out.unread[k] || 0) + 1;
    }
    out.objects.push({ attrs: attrs || { id: null, layer: 0, name: '', material: -1, color: null, colorSource: 0, materialSource: 0, visible: true, mode: 0 }, geom });
  }
}

/** Geometry the scene builder turns into meshes or polylines (everything else is counted as not read yet). */
export const READ_KINDS = new Set(['mesh', 'brep', 'extrusion', 'nurbsSurface', 'planeSurface', 'revSurface', 'sumSurface', 'nurbsCurve', 'lineCurve', 'polylineCurve', 'arcCurve', 'polyCurve', 'instanceRef']);
