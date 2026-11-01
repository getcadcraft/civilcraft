/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * checkers.mjs — the oracle of the eval set (docs/AI-CONNECT-SPEC.md § 8). A checker reads the SAVED FILE, never the server's
 * answer: the model and the tool's own reply are not trusted, the file is.
 *
 *   factsOf(kind, file)        → a plain object about the file
 *     bytes   { size, head }                         first 8 bytes as text, size
 *     json    the parsed JSON file itself            (.takeoff.json, .civilcraft.json, .partcraft.json, project files)
 *     cad     CadSession.open(...).describe()        DWG / DXF read back with CadCraft's own reader (layers, byType, blocks, layouts)
 *     ifc     { classes: {IFCWALL: n…}, names: [{cls, name}], lines }    the STEP text counted by class name (no IFC library involved)
 *     pdf     { pages, text }                         page count and the text strings of the PDF's content streams
 *     text    { text, lines }
 *     part    a .partcraft.json built by PartCraft's own mesh kernel: { volume, mass, bbox, bodies, failing, thickness, stressPerN }
 *             (stressPerN = 6·L/(b·t²) read back from the saved sketch and the built box: MPa per newton of tip load on an L bracket)
 *   at(obj, path)              'layers[name=A-NEW].objects' · 'byType.LINE' · 'items.length' · 'faces[normal.2=1].id' (a dotted key inside the brackets)
 *   judge(value, check)        eq · gte · lte · approx ± tol · includes · matches · exists
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const mod = (p) => import(pathToFileURL(path.join(ROOT, p)).href);

export async function factsOf(kind, file) {
  const buf = fs.readFileSync(file);
  switch (kind) {
    case 'bytes': return { size: buf.length, head: buf.subarray(0, 8).toString('latin1') };
    case 'json': return JSON.parse(buf.toString('utf8'));
    case 'text': { const text = buf.toString('utf8'); return { text, lines: text.split('\n').length }; }
    case 'cad': { const { CadSession } = await mod('tools/cli/headless/cad.mjs'); return (await CadSession.open(new Uint8Array(buf), path.basename(file))).describe(); }
    case 'ifc': {
      const text = buf.toString('latin1'), classes = {};
      for (const m of text.matchAll(/^#\d+\s*=\s*(IFC[A-Z0-9_]+)\s*\(/gm)) classes[m[1]] = (classes[m[1]] || 0) + 1;
      const names = [];   // [{cls, name}] from IfcRoot (GlobalId, OwnerHistory, Name…): lets a rename be checked
      for (const m of text.matchAll(/^#\d+\s*=\s*(IFC[A-Z0-9_]+)\s*\(\s*'[^']*'\s*,\s*(?:#\d+|\$)\s*,\s*'((?:[^']|'')*)'/gm)) names.push({ cls: m[1], name: m[2].replace(/''/g, "'") });
      return { classes, names, lines: text.split('\n').length, header: text.slice(0, 200) };
    }
    case 'pdf': {
      const s = buf.toString('latin1');
      const pages = (s.match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      return { pages, text: s, head: s.slice(0, 8) };
    }
    case 'part': {
      const { PartSession, partModules } = await mod('tools/cli/headless/part.mjs');
      const s = await PartSession.open(new Uint8Array(buf), path.basename(file));
      const m = await partModules();
      const d = m.A.describePart(s.part, s.regen());
      const mp = m.A.massOf(s.part, s.regen());
      const sk = (s.part.features.find((f) => f.type === 'sketch') || {}).sketch;
      const dist = sk && (sk.constraints || []).find((c) => c.type === 'distance');
      const bb = d.solid && d.solid.bbox, t = dist ? dist.value : null;
      return { volume: d.solid && d.solid.volume, mass: mp.mass, bbox: bb, bodies: d.solid && d.solid.bodies, failing: d.failing || [], thickness: t,
        stressPerN: bb && t ? 6 * (bb.max[0] - bb.min[0]) / ((bb.max[2] - bb.min[2]) * t * t) : null };
    }
    default: throw new Error('unknown checker kind ' + kind);
  }
}

/** 'layers[name=A-NEW].objects' → the value; undefined when any step is missing. */
export function at(obj, p) {
  let cur = obj;
  for (const part of String(p).match(/[^.[\]]+(\[[^\]]+\])?/g) || []) {
    const m = /^([^[]+)(?:\[([^=\]]+)=([^\]]*)\])?$/.exec(part);
    if (!m) return undefined;
    if (cur == null) return undefined;
    cur = m[1] === 'length' && typeof cur.length === 'number' ? cur.length : cur[m[1]];
    if (m[2] !== undefined) cur = Array.isArray(cur) ? cur.find((x) => String(m[2].split('.').reduce((o, k) => (o == null ? undefined : o[k]), x)) === m[3]) : undefined;   // [name=A] or a dotted key: [normal.2=1]
  }
  return cur;
}

export function judge(v, c) {
  if ('exists' in c) return (v !== undefined && v !== null) === c.exists;
  if ('eq' in c) return JSON.stringify(v) === JSON.stringify(c.eq);
  if ('gte' in c && !(typeof v === 'number' && v >= c.gte)) return false;
  if ('lte' in c && !(typeof v === 'number' && v <= c.lte)) return false;
  if ('approx' in c && !(typeof v === 'number' && Math.abs(v - c.approx) <= (c.tol ?? 1e-6))) return false;
  if ('includes' in c && !(v != null && String(Array.isArray(v) ? JSON.stringify(v) : v).includes(c.includes))) return false;
  if ('matches' in c && !(v != null && new RegExp(c.matches).test(String(v)))) return false;
  return ['gte', 'lte', 'approx', 'includes', 'matches'].some((k) => k in c);
}
