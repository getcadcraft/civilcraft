/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-board (0.8 XE.11): the board model. Units millimetres, y up, angles degrees counter-clockwise. A board has parts (footprint pads in local
 * coordinates, a side and a rotation), tracks, vias and zones, all carrying net names. Untrusted input goes through readBoard().
 */
import { rectPoly, rotPt, bbox } from './geom.js';
export const FORMAT = 'cc-board', VERSION = 1;
export const problem = (id, message, extra = {}) => ({ id: 'pcb:' + id, message, source: { kind: 'engine', engine: 'pcb' }, ...extra, severity: extra.severity || 'error' });

export const copperNames = (n) => (n <= 1 ? ['F.Cu'] : ['F.Cu', ...Array.from({ length: n - 2 }, (_, i) => 'In' + (i + 1) + '.Cu'), 'B.Cu']);
/** Example fabrication capabilities. They are EXAMPLES: set them from your board house's published capability sheet. */
export const EXAMPLE_RULES = { clearance: 0.2, trackWidth: 0.25, minTrackWidth: 0.15, viaDrill: 0.3, viaDia: 0.6, minDrill: 0.2, minAnnular: 0.13, holeToHole: 0.25, edgeClearance: 0.3, maskMargin: 0.05, courtyardMargin: 0.25 };

export class Board {
  constructor({ name = 'board', outline = [[0, 0], [50, 0], [50, 40], [0, 40]], copper = 2, rules = {}, thickness = 1.6 } = {}) {
    this.name = name; this.outline = outline.map((p) => [+p[0], +p[1]]); this.copper = copper; this.layers = copperNames(copper); this.thickness = thickness;
    this.rules = { ...EXAMPLE_RULES, ...rules }; this.parts = []; this.tracks = []; this.vias = []; this.zones = []; this.nets = new Set(); this.holes = [];
  }
  part(ref) { return this.parts.find((p) => p.ref === ref) || null; }
  /** Add a part from a footprint (see footlib.js). padNets: {padNumber: netName}. */
  addPart(ref, fp, { x = 0, y = 0, rot = 0, side = 'top', value = '', padNets = {}, locked = false, part = '' } = {}) {
    if (this.part(ref)) throw new Error('duplicate reference ' + ref);
    const p = { ref, footprint: fp.name, value, part, x, y, rot, side, locked, pads: fp.pads.map((q) => ({ ...q })), courtyard: fp.courtyard.slice(), silk: (fp.silk || []).map((l) => l.map((q) => q.slice())), padNets: { ...padNets } };
    for (const n of Object.values(padNets)) if (n) this.nets.add(n);
    this.parts.push(p); return p;
  }
  setNet(ref, pad, net) { const p = this.part(ref); if (!p) throw new Error('no part ' + ref); p.padNets[pad] = net; if (net) this.nets.add(net); }
  addTrack(net, layer, width, pts) { this.nets.add(net); this.tracks.push({ net, layer, width, pts: pts.map((q) => [q[0], q[1]]) }); }
  addVia(net, x, y, drill = this.rules.viaDrill, dia = this.rules.viaDia) { this.nets.add(net); this.vias.push({ net, x, y, drill, dia }); }
  addZone(net, layer, poly, clearance = this.rules.clearance) { this.nets.add(net); this.zones.push({ net, layer, poly: poly.map((q) => [q[0], q[1]]), clearance }); }
  addHole(x, y, drill, plated = false) { this.holes.push({ x, y, drill, plated }); }

  /** World placement of a pad: {x, y, shape, w, h, rot, drill, layers[], net, ref, num, poly (outline for rect-like), cap (for round/oval)}. */
  padWorld(part, pad) {
    const bottom = part.side === 'bottom', lx = bottom ? -pad.x : pad.x, r = rotPt([lx, pad.y], part.rot), x = part.x + r[0], y = part.y + r[1];
    const rot = part.rot + (bottom ? -(pad.rot || 0) : (pad.rot || 0)), thru = (pad.drill || 0) > 0;
    const layers = thru ? this.layers.slice() : [bottom ? this.layers[this.layers.length - 1] : this.layers[0]];
    const out = { x, y, shape: pad.shape, w: pad.w, h: pad.h, rot, drill: pad.drill || 0, plated: pad.plated !== false, layers, net: part.padNets[pad.num] || '', ref: part.ref, num: pad.num, smd: !thru };
    if (pad.shape === 'circle') out.prim = { k: 'cap', a: [x, y], b: [x, y], r: pad.w / 2 };
    else if (pad.shape === 'oval') { const L = Math.max(pad.w, pad.h), W = Math.min(pad.w, pad.h), ang = (pad.w >= pad.h ? rot : rot + 90) * Math.PI / 180, d = (L - W) / 2; out.prim = { k: 'cap', a: [x - d * Math.cos(ang), y - d * Math.sin(ang)], b: [x + d * Math.cos(ang), y + d * Math.sin(ang)], r: W / 2 }; }
    else out.prim = { k: 'poly', pts: rectPoly(x, y, pad.w, pad.h, rot), r: 0 }; // rect and roundrect (corner radius ignored: checked as the full rectangle, which is conservative)
    return out;
  }
  /** Courtyard in world coordinates as a polygon. */
  courtyardWorld(part) { const [x0, y0, x1, y1] = part.courtyard, c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map((p) => { const lx = part.side === 'bottom' ? [-p[0], p[1]] : p; const r = rotPt(lx, part.rot); return [part.x + r[0], part.y + r[1]]; }); return c; }
  /** Every copper object as {id, kind, net, layers, prim, …}. Tracks become one stadium per segment. */
  items() {
    const out = [];
    for (const part of this.parts) for (const pad of part.pads) { const w = this.padWorld(part, pad); out.push({ id: part.ref + '.' + pad.num, kind: 'pad', net: w.net, layers: w.layers, prim: w.prim, pad: w, ref: part.ref, num: pad.num }); }
    this.tracks.forEach((t, ti) => t.pts.slice(1).forEach((q, i) => out.push({ id: 'track' + ti + '.' + i, kind: 'track', track: ti, net: t.net, layers: [t.layer], prim: { k: 'cap', a: t.pts[i], b: q, r: t.width / 2 }, width: t.width })));
    this.vias.forEach((v, i) => out.push({ id: 'via' + i, kind: 'via', via: i, net: v.net, layers: this.layers.slice(), prim: { k: 'cap', a: [v.x, v.y], b: [v.x, v.y], r: v.dia / 2 }, drill: v.drill }));
    this.zones.forEach((z, i) => out.push({ id: 'zone' + i, kind: 'zone', zone: i, net: z.net, layers: [z.layer], prim: { k: 'poly', pts: z.poly, r: 0 }, clearance: z.clearance }));
    return out;
  }
  /** All drilled holes in world coordinates: {x, y, drill, plated, kind, id}. */
  drills() {
    const out = [];
    for (const part of this.parts) for (const pad of part.pads) if (pad.drill > 0) { const w = this.padWorld(part, pad); out.push({ x: w.x, y: w.y, drill: pad.drill, plated: pad.plated !== false, kind: 'pad', id: part.ref + '.' + pad.num }); }
    this.vias.forEach((v, i) => out.push({ x: v.x, y: v.y, drill: v.drill, plated: true, kind: 'via', id: 'via' + i }));
    this.holes.forEach((h, i) => out.push({ x: h.x, y: h.y, drill: h.drill, plated: !!h.plated, kind: 'hole', id: 'hole' + i }));
    return out;
  }
  extent() { return bbox(this.outline); }
  toJSON() { return { format: FORMAT, version: VERSION, name: this.name, outline: this.outline, copper: this.copper, thickness: this.thickness, rules: this.rules, parts: this.parts, tracks: this.tracks, vias: this.vias, zones: this.zones, holes: this.holes }; }
}

/** Untrusted file → Board. Returns {board, problems}; what could not be read is named and dropped, never guessed. */
export function readBoard(json) {
  const problems = [];
  let d; try { d = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { return { board: null, problems: [problem('read.json', 'The file is not valid JSON.')] }; }
  if (!d || d.format !== FORMAT) return { board: null, problems: [problem('read.format', 'Not a cc-board file.')] };
  if (d.version > VERSION) problems.push(problem('read.version', 'The file is a newer version (' + d.version + ') than this reader (' + VERSION + ').', { severity: 'warning' }));
  const num = (v) => typeof v === 'number' && Number.isFinite(v), pt = (p) => Array.isArray(p) && p.length >= 2 && num(p[0]) && num(p[1]);
  if (!Array.isArray(d.outline) || d.outline.length < 3 || !d.outline.every(pt)) return { board: null, problems: [...problems, problem('read.outline', 'The board outline needs at least three numeric points.')] };
  const copper = [1, 2, 4, 6, 8, 10, 12].includes(d.copper) ? d.copper : 2; if (copper !== d.copper) problems.push(problem('read.copper', 'Copper layer count ' + d.copper + ' is not supported; 2 used.', { severity: 'warning' }));
  const b = new Board({ name: String(d.name || 'board').slice(0, 120), outline: d.outline, copper, rules: d.rules && typeof d.rules === 'object' ? Object.fromEntries(Object.entries(d.rules).filter(([, v]) => num(v) && v >= 0)) : {}, thickness: num(d.thickness) ? d.thickness : 1.6 });
  for (const p of Array.isArray(d.parts) ? d.parts : []) {
    if (!p || typeof p.ref !== 'string' || !Array.isArray(p.pads) || !num(p.x) || !num(p.y)) { problems.push(problem('read.part', 'A part without a reference, pads or position was dropped.', { severity: 'warning' })); continue; }
    if (b.part(p.ref)) { problems.push(problem('read.duplicate', 'Reference ' + p.ref + ' appears twice; the second was dropped.', { severity: 'warning' })); continue; }
    const pads = p.pads.filter((q) => q && ['rect', 'circle', 'oval', 'roundrect'].includes(q.shape) && num(q.x) && num(q.y) && num(q.w) && q.w > 0 && num(q.h) && q.h > 0 && String(q.num) !== '').map((q) => ({ num: String(q.num), shape: q.shape, x: q.x, y: q.y, w: q.w, h: q.h, drill: num(q.drill) && q.drill > 0 ? q.drill : 0, plated: q.plated !== false, rot: num(q.rot) ? q.rot : 0 }));
    if (pads.length !== p.pads.length) problems.push(problem('read.pad', p.ref + ': ' + (p.pads.length - pads.length) + ' unreadable pad(s) dropped.', { severity: 'warning' }));
    const cy = Array.isArray(p.courtyard) && p.courtyard.length === 4 && p.courtyard.every(num) ? p.courtyard : bbox(pads.flatMap((q) => [[q.x - q.w / 2, q.y - q.h / 2], [q.x + q.w / 2, q.y + q.h / 2]]));
    const padNets = {}; if (p.padNets && typeof p.padNets === 'object') for (const [k, v] of Object.entries(p.padNets)) if (typeof v === 'string') padNets[k] = v;
    b.addPart(p.ref, { name: String(p.footprint || ''), pads, courtyard: cy, silk: Array.isArray(p.silk) ? p.silk.filter((l) => Array.isArray(l) && l.every(pt)) : [] }, { x: p.x, y: p.y, rot: num(p.rot) ? p.rot : 0, side: p.side === 'bottom' ? 'bottom' : 'top', value: String(p.value || ''), padNets, locked: !!p.locked, part: String(p.part || '') });
  }
  for (const t of Array.isArray(d.tracks) ? d.tracks : []) { if (t && b.layers.includes(t.layer) && num(t.width) && t.width > 0 && Array.isArray(t.pts) && t.pts.length >= 2 && t.pts.every(pt)) b.addTrack(String(t.net || ''), t.layer, t.width, t.pts); else problems.push(problem('read.track', 'A track with a bad layer, width or points was dropped.', { severity: 'warning' })); }
  for (const v of Array.isArray(d.vias) ? d.vias : []) { if (v && num(v.x) && num(v.y) && num(v.drill) && v.drill > 0 && num(v.dia) && v.dia > v.drill) b.addVia(String(v.net || ''), v.x, v.y, v.drill, v.dia); else problems.push(problem('read.via', 'A via with a bad position, drill or diameter was dropped.', { severity: 'warning' })); }
  for (const z of Array.isArray(d.zones) ? d.zones : []) { if (z && b.layers.includes(z.layer) && Array.isArray(z.poly) && z.poly.length >= 3 && z.poly.every(pt)) b.addZone(String(z.net || ''), z.layer, z.poly, num(z.clearance) ? z.clearance : b.rules.clearance); else problems.push(problem('read.zone', 'A zone with a bad layer or outline was dropped.', { severity: 'warning' })); }
  for (const h of Array.isArray(d.holes) ? d.holes : []) if (h && num(h.x) && num(h.y) && num(h.drill) && h.drill > 0) b.addHole(h.x, h.y, h.drill, !!h.plated);
  return { board: b, problems };
}

/**
 * Schematic-to-board: netlist = {parts: [{ref, footprint, value?, part?}], nets: [{name, pins: ['R1:1', …]}]} (the shape lib/schematic's netlist() gives, with
 * parts from its symbols). lib = {name: footprint}. Unplaced parts go to (0,0) with `placed: false` noted in the result; place() moves them.
 * pinMap (optional): {ref: {pin: padNumber}} when schematic pin ids differ from pad numbers.
 */
export function fromNetlist(board, netlist, lib, pinMap = {}) {
  const problems = [], placed = [];
  for (const q of netlist.parts) {
    const fp = lib[q.footprint]; if (!fp) { problems.push(problem('import.footprint', q.ref + ': footprint "' + q.footprint + '" is not in the library.', { ref: q.ref, fix: 'Choose a footprint for ' + q.ref + '.' })); continue; }
    if (board.part(q.ref)) { problems.push(problem('import.duplicate', q.ref + ' is already on the board.', { severity: 'warning', ref: q.ref })); continue; }
    board.addPart(q.ref, fp, { value: q.value || '', part: q.part || '' }); placed.push(q.ref);
  }
  const used = new Set();
  for (const n of netlist.nets) for (const pin of n.pins) {
    const i = pin.lastIndexOf(':'), ref = pin.slice(0, i), pn = pin.slice(i + 1), part = board.part(ref);
    if (!part) { if (!netlist.parts.some((q) => q.ref === ref)) problems.push(problem('import.unknown-part', 'Net ' + n.name + ' lists ' + pin + ' but no part ' + ref + ' is in the netlist.', { net: n.name })); continue; }
    const pad = pinMap[ref]?.[pn] ?? pn;
    if (!part.pads.some((p) => p.num === String(pad))) { problems.push(problem('import.no-pad', ref + ' (' + part.footprint + ') has no pad ' + pad + ' for pin ' + pn + ' on net ' + n.name + '.', { net: n.name, ref, fix: 'Map the pin to a pad, or fix the footprint.' })); continue; }
    if (part.padNets[pad] && part.padNets[pad] !== n.name) { problems.push(problem('import.pad-two-nets', ref + '.' + pad + ' is on both ' + part.padNets[pad] + ' and ' + n.name + '.', { ref, net: n.name })); continue; }
    board.setNet(ref, String(pad), n.name); used.add(ref + '.' + pad);
  }
  for (const ref of placed) for (const p of board.part(ref).pads) if (!used.has(ref + '.' + p.num)) problems.push(problem('import.pad-unconnected', ref + '.' + p.num + ' is on no net.', { severity: 'info', ref }));
  return { placed, problems };
}
