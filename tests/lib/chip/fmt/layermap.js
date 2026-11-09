/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layermap.js — layer maps: GDSII/OASIS layer + datatype ↔ a name, a colour and a purpose.
 *
 *   readLayerMap(text)  → { map, problems }   accepts our JSON (format "cc-layer-map", the same shape lib/pcb uses) or a simple text map,
 *                         one layer a line, in any of these forms:
 *                           1/0 : METAL1                (layer/datatype : name)
 *                           METAL1 1/0 #2e6fd1 drawing   (name layer/datatype [#colour] [purpose])
 *                           METAL1 1 0                   (name layer datatype)
 *                           metal1 drawing 15 0          (name purpose layer datatype)
 *                         Lines starting with # or // are comments. Not read: XML layer property (.lyp) files with stipples — export a text map instead.
 *   writeLayerMapText(map) / writeLayerMapJson(map)
 *   layerInfo(map, layer, datatype) → { name, color, purpose, mapped }   (unmapped layers get a steady colour from their numbers)
 *   mapFromLayerNames(lib.layerNames) → map   (OASIS LAYERNAME records)
 */
import { prob } from './problem.js';

export const FORMAT = 'cc-layer-map';
const isInt = (s) => /^\d+$/.test(s);
const colour = (s) => (/^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : /^#[0-9a-f]{3}$/i.test(s) ? ('#' + s.slice(1).split('').map((c) => c + c).join('')).toLowerCase() : null);

export function readLayerMap(text) {
  const problems = [], s = String(text).trim();
  if (s.startsWith('{')) {
    let j; try { j = JSON.parse(s); } catch { return { map: null, problems: [prob('map.json', 'The layer map is not valid JSON.')] }; }
    if (j.format !== FORMAT || !Array.isArray(j.layers)) return { map: null, problems: [prob('map.format', 'Not a ' + FORMAT + ' file.')] };
    const layers = [];
    j.layers.forEach((l, i) => { if (!l || typeof l.name !== 'string' || !Array.isArray(l.gds) || !l.gds.every(Number.isInteger)) { problems.push(prob('map.entry', 'Entry ' + (i + 1) + ' needs a name and gds: [layer, datatype].', { severity: 'warning' })); return; } layers.push({ name: l.name, gds: [l.gds[0], l.gds[1] ?? 0], color: colour(l.color || '') || undefined, purpose: l.purpose }); });
    return { map: { format: FORMAT, name: j.name, note: j.note, layers }, problems };
  }
  const layers = [];
  s.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim(); if (!line || line.startsWith('//') || /^#(\s|$)/.test(line) || (line.startsWith('#') && !colour(line.split(/\s/)[0]))) return;
    let m;
    if ((m = /^(\d+)\s*[/;,]\s*(\d+)\s*:\s*(\S+)(?:\s+(#[0-9a-fA-F]{3,6}))?/.exec(line))) { layers.push({ name: m[3], gds: [+m[1], +m[2]], color: colour(m[4] || '') || undefined }); return; }
    const w = line.split(/\s+/);
    if (w.length >= 2 && /^\d+\s*\/\s*\d+$/.test(w[1])) { const [l, d] = w[1].split('/').map(Number); const e = { name: w[0], gds: [l, d] }; for (const x of w.slice(2)) { if (colour(x)) e.color = colour(x); else e.purpose = x; } layers.push(e); return; }
    if (w.length >= 3 && isInt(w[1]) && isInt(w[2])) { const e = { name: w[0], gds: [+w[1], +w[2]] }; for (const x of w.slice(3)) { if (colour(x)) e.color = colour(x); else e.purpose = x; } layers.push(e); return; }
    if (w.length >= 4 && isInt(w[2]) && isInt(w[3])) { const e = { name: w[0], purpose: w[1], gds: [+w[2], +w[3]] }; if (w[4] && colour(w[4])) e.color = colour(w[4]); layers.push(e); return; }
    problems.push(prob('map.line', 'Line ' + (i + 1) + ' is not a layer line: "' + line.slice(0, 60) + '".', { severity: 'warning' }));
  });
  const seen = new Map(); for (const l of layers) { const k = l.gds.join('/'); if (seen.has(k)) problems.push(prob('map.dup', 'Layer ' + k + ' is named twice (' + seen.get(k) + ', ' + l.name + '); the first name is used.', { severity: 'note' })); else seen.set(k, l.name); }
  if (!layers.length) problems.push(prob('map.empty', 'No layer lines were found.'));
  return { map: { format: FORMAT, layers }, problems };
}

export function writeLayerMapText(map) { return '# CadCraft layer map: name layer/datatype [colour] [purpose]\n' + map.layers.map((l) => [l.name, l.gds[0] + '/' + l.gds[1], l.color, l.purpose].filter(Boolean).join(' ')).join('\n') + '\n'; }
export function writeLayerMapJson(map) { return JSON.stringify({ format: FORMAT, name: map.name, note: map.note, layers: map.layers.map((l) => ({ name: l.name, gds: l.gds, color: l.color, purpose: l.purpose })) }, null, 1) + '\n'; }

/** A steady, readable colour for a layer nobody named (golden-angle hues). */
export function autoColour(layer, datatype = 0) { const h = Math.round(((layer * 137.508 + datatype * 47) % 360 + 360) % 360), s = 55, l = 50; const f = (n) => { const k = (n + h / 30) % 12, a = s / 100 * Math.min(l / 100, 1 - l / 100); return Math.round(255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); }

export function layerInfo(map, layer, datatype) {
  const m = map?.layers.find((x) => x.gds[0] === layer && x.gds[1] === datatype);
  return m ? { name: m.name, color: m.color || autoColour(layer, datatype), purpose: m.purpose, mapped: true } : { name: layer + '/' + datatype, color: autoColour(layer, datatype), mapped: false };
}

/** Layer map from OASIS LAYERNAME records (single layer/datatype ranges only; ranges are named in a note). */
export function mapFromLayerNames(names = []) {
  const layers = [], notes = [];
  for (const n of names) { if (n.layer[0] === n.layer[1] && n.datatype[0] === n.datatype[1]) layers.push({ name: n.name, gds: [n.layer[0], n.datatype[0]], purpose: n.text ? 'text' : undefined }); else notes.push(n.name + ' covers a range'); }
  return { format: FORMAT, name: 'from the file', note: notes.join('; ') || undefined, layers };
}
