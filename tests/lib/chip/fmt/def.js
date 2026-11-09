/* SPDX-License-Identifier: Apache-2.0 */
/**
 * def.js — DEF (Design Exchange Format) reader and writer: die area, rows, tracks, components, pins, nets and special nets with their routed
 * wires. Written from the public LEF/DEF language description. Coordinates stay in database units (UNITS DISTANCE MICRONS n).
 *
 *   readDef(text)          → { def, problems }
 *   writeDef(def)          → text  (canonical order; "*" in wires is written out as the number it stands for)
 *   defShapes(def, lef?)   → { die, rows, cells, pins, wires, vias } in microns, ready for a floorplan view
 *   orientPoint(o, x, y, w, h) → [x', y']   DEF orientations N S E W FN FS FE FW (lower-left of the turned box stays at 0,0)
 *
 * Sections this reader does not model (BLOCKAGES, REGIONS, GROUPS, FILLS, SCANCHAINS, …) are kept as words and written back.
 */
import { prob } from './problem.js';

function lex(text) {
  const out = []; let i = 0, line = 1; const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '\n') { line++; i++; continue; }
    if (c <= ' ') { i++; continue; }
    if (c === '#') { while (i < n && text[i] !== '\n') i++; continue; }
    if (c === '"') { let j = i + 1; while (j < n && text[j] !== '"') { if (text[j] === '\n') line++; j++; } out.push({ v: text.slice(i, j + 1), line }); i = j + 1; continue; }
    if (c === '(' || c === ')' || c === ';') { out.push({ v: c, line }); i++; continue; }
    let j = i; while (j < n && text[j] > ' ' && text[j] !== ';' && text[j] !== '(' && text[j] !== ')') { if (text[j] === '\\' && j + 1 < n) j++; j++; }
    out.push({ v: text.slice(i, j), line }); i = j;
  }
  return out;
}
const SECTIONS = new Set(['COMPONENTS', 'PINS', 'NETS', 'SPECIALNETS', 'VIAS', 'BLOCKAGES', 'REGIONS', 'GROUPS', 'FILLS', 'NONDEFAULTRULES', 'SCANCHAINS', 'STYLES', 'PINPROPERTIES', 'SLOTS', 'COMPONENTMASKSHIFT']);
const N = Number;

/** Split an item's words ("- name … + KEY … + KEY …") at top-level "+" signs. */
function groups(w, from) { const out = []; let cur = null; for (let i = from; i < w.length; i++) { if (w[i] === '+') { cur = []; out.push(cur); } else if (cur) cur.push(w[i]); } return out; }
function point(w, i) { return w[i] === '(' ? [w[i + 1], w[i + 2]] : null; }

function component(w, line, problems) {
  const c = { name: w[1], model: w[2], extra: [] };
  for (const g of groups(w, 3)) {
    if (['PLACED', 'FIXED', 'COVER'].includes(g[0])) { c.status = g[0]; c.at = [N(g[2]), N(g[3])]; c.orient = g[5]; }
    else if (g[0] === 'UNPLACED') c.status = 'UNPLACED';
    else if (g[0] === 'SOURCE') c.source = g[1];
    else if (g[0] === 'WEIGHT') c.weight = N(g[1]);
    else c.extra.push(g);
  }
  if (!c.model) problems.push(prob('def.component', 'Component ' + c.name + ' has no cell name.', { line }));
  if (!c.extra.length) delete c.extra; return c;
}
function pinItem(w) {
  const p = { name: w[1], extra: [] };
  for (const g of groups(w, 2)) {
    if (g[0] === 'NET') p.net = g[1]; else if (g[0] === 'DIRECTION') p.direction = g[1]; else if (g[0] === 'USE') p.use = g[1]; else if (g[0] === 'SPECIAL') p.special = true;
    else if (g[0] === 'LAYER') { const rest = g.slice(1); const L = { layer: rest[0], rect: [] }; const nums = rest.filter((x) => x !== '(' && x !== ')').slice(1).map(N); L.rect = nums.slice(-4); (p.layers ||= []).push(L); }
    else if (['PLACED', 'FIXED', 'COVER'].includes(g[0])) { p.status = g[0]; p.at = [N(g[2]), N(g[3])]; p.orient = g[5]; }
    else p.extra.push(g);
  }
  if (!p.extra.length) delete p.extra; return p;
}
// Routing: "+ ROUTED layer [width] [+ SHAPE s] [+ STYLE n] ( x y [ext] ) ( x * ) via … NEW layer …"
function routing(w, i, special) {
  const wires = []; let cur = null, last = [0, 0], status = w[i];
  i++;
  const start = () => { cur = { status, layer: w[i++], items: [] }; if (special && /^-?\d/.test(w[i] || '')) cur.width = N(w[i++]); wires.push(cur); };
  start();
  while (i < w.length) {
    const x = w[i];
    if (x === '+') { if (['SHAPE', 'STYLE', 'MASK'].includes(w[i + 1]) && cur) { cur[w[i + 1].toLowerCase()] = w[i + 2]; i += 3; continue; } break; }
    if (x === 'NEW') { i++; start(); continue; }
    if (x === '(') { const a = w[i + 1], b = w[i + 2]; const px = a === '*' ? last[0] : N(a), py = b === '*' ? last[1] : N(b); const it = { p: [px, py] }; let j = i + 3; if (w[j] !== ')') { it.ext = N(w[j]); j++; } last = [px, py]; cur.items.push(it); i = j + 1; continue; }
    if (x === 'MASK' || x === 'TAPERRULE' || x === 'STYLE') { cur.items.push({ w: [x, w[i + 1]] }); i += 2; continue; }
    if (x === 'TAPER') { cur.items.push({ w: [x] }); i++; continue; }
    if (x === 'RECT' || x === 'VIRTUAL') { const j = w.indexOf(')', i); cur.items.push({ w: w.slice(i, j + 1) }); i = j + 1; continue; }
    cur.items.push({ via: x }); i++;
  }
  return { wires, next: i };
}
function netItem(w, special) {
  const n = { name: w[1], conns: [], wires: [], extra: [] }; let i = 2;
  while (i < w.length && w[i] === '(') { const j = w.indexOf(')', i); n.conns.push(w.slice(i + 1, j)); i = j + 1; }
  while (i < w.length) {
    if (w[i] !== '+') { i++; continue; }
    const k = w[i + 1];
    if (['ROUTED', 'FIXED', 'COVER', 'NOSHIELD'].includes(k)) { const r = routing(w, i + 1, special); n.wires.push(...r.wires); i = r.next; continue; }
    let j = i + 1; const g = []; while (j < w.length && w[j] !== '+') g.push(w[j++]);
    if (k === 'USE') n.use = g[1]; else if (k === 'SOURCE') n.source = g[1]; else if (k === 'WEIGHT') n.weight = N(g[1]); else n.extra.push(g);
    i = j;
  }
  if (!n.extra.length) delete n.extra; return n;
}

/** Parse DEF text. */
export function readDef(text) {
  const t = lex(String(text)), problems = [];
  const def = { version: undefined, design: undefined, units: 1000, header: [], dieArea: null, rows: [], tracks: [], gcellGrids: [], vias: [], components: [], pins: [], specialNets: [], nets: [], other: [] };
  let p = 0;
  const stmt = () => { const w = [], line = t[p]?.line; while (p < t.length && t[p].v !== ';') w.push(t[p++].v); if (p < t.length) p++; return { w, line }; };
  let ended = false;
  while (p < t.length) {
    const a = t[p];
    if (a.v === 'END' && t[p + 1]?.v === 'DESIGN') { ended = true; p += 2; break; }
    if (SECTIONS.has(a.v) || a.v === 'PROPERTYDEFINITIONS') {
      const key = a.v; let count = null;
      if (key === 'PROPERTYDEFINITIONS') p++; else { const h = stmt(); count = N(h.w[1]); }
      const items = [];
      while (p < t.length && !(t[p].v === 'END' && t[p + 1]?.v === key)) { const s = stmt(); if (s.w.length) items.push(s); }
      if (p >= t.length) problems.push(prob('def.section', key + ' is never closed with END ' + key + '.', { line: a.line })); else p += 2;
      if (count !== null && !Number.isNaN(count) && count !== items.length) problems.push(prob('def.count', key + ' says ' + count + ' items but has ' + items.length + '.', { line: a.line, severity: 'warning' }));
      for (const s of items) if (key !== 'PROPERTYDEFINITIONS' && s.w[0] !== '-') problems.push(prob('def.item', 'An item in ' + key + ' does not start with "-".', { line: s.line, severity: 'warning' }));
      if (key === 'COMPONENTS') def.components = items.map((s) => component(s.w, s.line, problems));
      else if (key === 'PINS') def.pins = items.map((s) => pinItem(s.w));
      else if (key === 'NETS') def.nets = items.map((s) => netItem(s.w, false));
      else if (key === 'SPECIALNETS') def.specialNets = items.map((s) => netItem(s.w, true));
      else if (key === 'VIAS') def.vias = items.map((s) => s.w);
      else def.other.push({ key, count, items: items.map((s) => s.w) });
      continue;
    }
    const s = stmt(); const w = s.w; if (!w.length) continue;
    switch (w[0]) {
      case 'VERSION': def.version = w[1]; break;
      case 'DESIGN': def.design = w[1]; break;
      case 'UNITS': def.units = N(w[3]); break;
      case 'DIEAREA': { const pts = []; for (let i = 1; i < w.length; i++) if (w[i] === '(') { pts.push([N(w[i + 1]), N(w[i + 2])]); i += 3; } def.dieArea = pts; break; }
      case 'ROW': { const r = { name: w[1], site: w[2], at: [N(w[3]), N(w[4])], orient: w[5] }; let i = 6; if (w[i] === 'DO') { r.num = [N(w[i + 1]), N(w[i + 3])]; i += 4; } if (w[i] === 'STEP') { r.step = [N(w[i + 1]), N(w[i + 2])]; i += 3; } if (i < w.length) r.extra = w.slice(i); def.rows.push(r); break; }
      case 'TRACKS': { const tr = { dir: w[1], start: N(w[2]), num: N(w[4]), step: N(w[6]) }; const li = w.indexOf('LAYER'); tr.layers = li >= 0 ? w.slice(li + 1) : []; const mi = w.indexOf('MASK'); if (mi >= 0 && mi < (li < 0 ? w.length : li)) tr.mask = w.slice(mi, li < 0 ? w.length : li); def.tracks.push(tr); break; }
      case 'GCELLGRID': def.gcellGrids.push({ dir: w[1], start: N(w[2]), num: N(w[4]), step: N(w[6]) }); break;
      default: def.header.push(w);
    }
  }
  if (!ended) problems.push(prob('def.no-end', 'The file has no END DESIGN.', { severity: 'warning' }));
  if (!def.design) problems.push(prob('def.no-design', 'The file has no DESIGN name.', { severity: 'warning' }));
  // nets refer to components that exist
  const comps = new Set(def.components.map((c) => c.name)), pins = new Set(def.pins.map((x) => x.name));
  for (const n of [...def.nets, ...def.specialNets]) for (const c of n.conns) {
    if (c[0] === 'PIN') { if (!pins.has(c[1])) problems.push(prob('def.net-pin', 'Net ' + n.name + ' names pin ' + c[1] + ', which is not in PINS.', { severity: 'warning', about: [{ kind: 'net', id: n.name }] })); }
    else if (c[0] !== '*' && !comps.has(c[0])) problems.push(prob('def.net-comp', 'Net ' + n.name + ' names component ' + c[0] + ', which is not in COMPONENTS.', { about: [{ kind: 'net', id: n.name }] }));
  }
  return { def, problems };
}

// ---------------------------------------------------------------- writer
const pt = (p) => '( ' + p[0] + ' ' + p[1] + ' )';
function wiresText(wires, special) {
  return wires.map((wr, i) => {
    let s = (i === 0 || wr.status !== wires[i - 1].status ? '+ ' + wr.status + ' ' : 'NEW ') + wr.layer;
    if (special && wr.width !== undefined) s += ' ' + wr.width;
    if (wr.shape) s += ' + SHAPE ' + wr.shape; if (wr.style) s += ' + STYLE ' + wr.style; if (wr.mask) s += ' + MASK ' + wr.mask;
    for (const it of wr.items) s += ' ' + (it.p ? '( ' + it.p[0] + ' ' + it.p[1] + (it.ext !== undefined ? ' ' + it.ext : '') + ' )' : it.via !== undefined ? it.via : it.w.join(' '));
    return s;
  });
}
/** Write a def object (as readDef returns) as DEF text. */
export function writeDef(d) {
  const L = [];
  if (d.version) L.push('VERSION ' + d.version + ' ;');
  for (const w of d.header) L.push(w.join(' ') + ' ;');
  if (d.design) L.push('DESIGN ' + d.design + ' ;');
  L.push('UNITS DISTANCE MICRONS ' + d.units + ' ;');
  if (d.dieArea) L.push('DIEAREA ' + d.dieArea.map(pt).join(' ') + ' ;');
  for (const r of d.rows) L.push(['ROW', r.name, r.site, r.at[0], r.at[1], r.orient, ...(r.num ? ['DO', r.num[0], 'BY', r.num[1]] : []), ...(r.step ? ['STEP', r.step[0], r.step[1]] : []), ...(r.extra || [])].join(' ') + ' ;');
  for (const t of d.tracks) L.push(['TRACKS', t.dir, t.start, 'DO', t.num, 'STEP', t.step, ...(t.mask || []), ...(t.layers.length ? ['LAYER', ...t.layers] : [])].join(' ') + ' ;');
  for (const g of d.gcellGrids) L.push(['GCELLGRID', g.dir, g.start, 'DO', g.num, 'STEP', g.step].join(' ') + ' ;');
  const sec = (key, items, line) => { L.push(key + ' ' + items.length + ' ;'); for (const it of items) L.push('  ' + line(it) + ' ;'); L.push('END ' + key); };
  if (d.vias.length) sec('VIAS', d.vias, (w) => w.join(' '));
  for (const o of d.other) { if (o.key === 'PROPERTYDEFINITIONS') { L.push('PROPERTYDEFINITIONS'); for (const w of o.items) L.push('  ' + w.join(' ') + ' ;'); L.push('END PROPERTYDEFINITIONS'); } else sec(o.key, o.items, (w) => w.join(' ')); }
  const ex = (e) => (e || []).map((g) => ' + ' + g.join(' ')).join('');
  if (d.components.length || d.design) sec('COMPONENTS', d.components, (c) => '- ' + c.name + ' ' + c.model + (c.source ? ' + SOURCE ' + c.source : '') + (c.status === 'UNPLACED' ? ' + UNPLACED' : c.status ? ' + ' + c.status + ' ' + pt(c.at) + ' ' + c.orient : '') + (c.weight !== undefined ? ' + WEIGHT ' + c.weight : '') + ex(c.extra));
  if (d.pins.length) sec('PINS', d.pins, (p) => '- ' + p.name + (p.net ? ' + NET ' + p.net : '') + (p.special ? ' + SPECIAL' : '') + (p.direction ? ' + DIRECTION ' + p.direction : '') + (p.use ? ' + USE ' + p.use : '') + (p.layers || []).map((l) => ' + LAYER ' + l.layer + ' ' + pt(l.rect.slice(0, 2)) + ' ' + pt(l.rect.slice(2))).join('') + (p.status ? ' + ' + p.status + ' ' + pt(p.at) + ' ' + p.orient : '') + ex(p.extra));
  const net = (special) => (n) => ['- ' + n.name + n.conns.map((c) => ' ( ' + c.join(' ') + ' )').join(''), ...wiresText(n.wires, special).map((s) => '    ' + s.trim()), (n.source ? ' + SOURCE ' + n.source : '') + (n.use ? ' + USE ' + n.use : '') + (n.weight !== undefined ? ' + WEIGHT ' + n.weight : '') + ex(n.extra)].filter(Boolean).join('\n  ');
  if (d.specialNets.length) sec('SPECIALNETS', d.specialNets, net(true));
  if (d.nets.length) sec('NETS', d.nets, net(false));
  L.push('END DESIGN');
  return L.join('\n') + '\n';
}

// ---------------------------------------------------------------- geometry for the floorplan view
/** A macro-local point (x, y) of a w × h cell placed with DEF orientation o; the turned box's lower-left corner stays at (0, 0). */
export function orientPoint(o, x, y, w, h) {
  switch (o) {
    case 'S': return [w - x, h - y]; case 'W': return [h - y, x]; case 'E': return [y, w - x];
    case 'FN': return [w - x, y]; case 'FS': return [x, h - y]; case 'FW': return [y, x]; case 'FE': return [h - y, w - x];
    default: return [x, y];
  }
}
const turned = (o) => o === 'E' || o === 'W' || o === 'FE' || o === 'FW';
/**
 * Shapes in microns: die outline, rows, one box per placed component (size from the LEF macro when given, else a 1 µm stand-in, counted),
 * pin pads, wire segments (width from the special-net wire, else the LEF layer width, else 0.1 µm) and via points.
 */
export function defShapes(d, lef) {
  const u = d.units || 1000, macros = new Map((lef?.macros || []).map((m) => [m.name, m])), lw = new Map((lef?.layers || []).map((l) => [l.name, l.width]));
  const sites = new Map((lef?.sites || []).map((s) => [s.name, s]));
  const out = { die: d.dieArea ? (d.dieArea.length === 2 ? [[d.dieArea[0][0] / u, d.dieArea[0][1] / u], [d.dieArea[1][0] / u, d.dieArea[0][1] / u], [d.dieArea[1][0] / u, d.dieArea[1][1] / u], [d.dieArea[0][0] / u, d.dieArea[1][1] / u]] : d.dieArea.map((p) => [p[0] / u, p[1] / u])) : null, rows: [], cells: [], pins: [], wires: [], vias: [], unknownMacros: 0 };
  for (const r of d.rows) { const s = sites.get(r.site), sw = s?.size?.[0] ?? 0, sh = s?.size?.[1] ?? 0, nx = r.num?.[0] ?? 1, ny = r.num?.[1] ?? 1, st = r.step || [sw * u, 0]; out.rows.push({ name: r.name, box: [r.at[0] / u, r.at[1] / u, r.at[0] / u + (nx - 1) * st[0] / u + sw, r.at[1] / u + (ny - 1) * st[1] / u + (sh || 0)] }); }
  for (const c of d.components) {
    if (!c.at) continue; const m = macros.get(c.model); if (!m) out.unknownMacros++;
    const w = m?.size?.[0] ?? 1, h = m?.size?.[1] ?? 1, [bw, bh] = turned(c.orient) ? [h, w] : [w, h], x = c.at[0] / u, y = c.at[1] / u;
    out.cells.push({ name: c.name, model: c.model, box: [x, y, x + bw, y + bh], orient: c.orient, status: c.status });
  }
  for (const p of d.pins) {
    if (!p.at || !p.layers) continue; const x = p.at[0] / u, y = p.at[1] / u;
    for (const l of p.layers) { const a = orientPoint(p.orient, l.rect[0] / u, l.rect[1] / u, 0, 0), b = orientPoint(p.orient, l.rect[2] / u, l.rect[3] / u, 0, 0); out.pins.push({ name: p.name, layer: l.layer, box: [x + Math.min(a[0], b[0]), y + Math.min(a[1], b[1]), x + Math.max(a[0], b[0]), y + Math.max(a[1], b[1])] }); }
  }
  for (const [list, special] of [[d.specialNets, true], [d.nets, false]]) for (const n of list) for (const wr of n.wires) {
    const width = special && wr.width !== undefined ? wr.width / u : lw.get(wr.layer) ?? 0.1; let prev = null;
    for (const it of wr.items) {
      if (it.p) { const q = [it.p[0] / u, it.p[1] / u]; if (prev) out.wires.push({ net: n.name, layer: wr.layer, a: prev, b: q, width, special }); prev = q; }
      else if (it.via !== undefined && prev) out.vias.push({ net: n.name, name: it.via, at: prev });
    }
  }
  return out;
}
