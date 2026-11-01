/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cadents.js — the job as CAD drawing content for CadCraft (0.8 DC.117, session `cabinetcraft_hosts`): the plan, the elevation of every run, the section of every
 * distinct cabinet, the cabinet schedule, the cut list and the nested sheets, as plain CadCraft entities (cadcraft/dev/doc.js shapes: line, poly, text, dim, insert,
 * hatch) on named layers, with one BLOCK per cabinet type in the elevations. DOM-free, pure: the CadCraft adapter only does `doc.add`.
 *
 *   cadSheets(build, { t, list, nest, est, unit }) → { layers: { NAME: { color, linetype?, lineweight? } }, blocks: [{ name, base, entities }],
 *                                                     sheets: [{ id, title, w, h, entities }] }
 *   Every sheet is laid out at its own origin (0, 0) in drawing units = the job's unit; the adapter moves a sheet by adding its offset (`place(ents, dx, dy)`).
 *   place(entities, dx, dy) → copies moved by dx, dy (inserts, hatch loops, dimension points included)
 *   LAYERS: CC-ROOM (walls, openings) · CC-BASE · CC-UPPER (dashed) · CC-FILL · CC-HIDDEN · CC-COUNTER · CC-TEXT · CC-DIM · CC-TABLE · CC-SHEET
 */
import { planEnts, elevationEnts, sectionEnts } from './drawings.js';
import { fmtLen, t as T } from './core.js';

export const LAYERS = {
  'CC-ROOM': { color: 7, lineweight: 0.5 }, 'CC-BASE': { color: 3, lineweight: 0.25 }, 'CC-UPPER': { color: 4, lineweight: 0.18, linetype: 'HIDDEN' },
  'CC-FILL': { color: 8 }, 'CC-HIDDEN': { color: 5, linetype: 'HIDDEN', lineweight: 0.13 }, 'CC-COUNTER': { color: 30, lineweight: 0.18 },
  'CC-TEXT': { color: 7 }, 'CC-DIM': { color: 1, lineweight: 0.13 }, 'CC-TABLE': { color: 7, lineweight: 0.18 }, 'CC-SHEET': { color: 9, lineweight: 0.13 },
};
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const rad = (d) => (d * Math.PI) / 180;

/** One drawing-list entity → the CadCraft entities it becomes (a fill adds a hatch under the outline). */
export function toCad(e, { layer = null } = {}) {
  const out = [];
  if (e.dimPart) return out;   // dimensions are real dimension entities (below), not the lines and text that draw them in the SVG
  const L = (def) => layer || def;
  if (e.type === 'line') out.push({ type: 'line', layer: L(e.dash ? 'CC-HIDDEN' : e.heavy ? 'CC-ROOM' : e.thin ? 'CC-SHEET' : 'CC-BASE'), x1: r4(e.x1), y1: r4(e.y1), x2: r4(e.x2), y2: r4(e.y2) });
  else if (e.type === 'poly') {
    const pts = e.pts.map((p) => ({ x: r4(p.x), y: r4(p.y) }));
    const counter = e.color === '#8a6d3b';
    const lyr = L(counter ? 'CC-COUNTER' : e.dash ? 'CC-HIDDEN' : e.heavy ? 'CC-ROOM' : e.thin ? 'CC-SHEET' : 'CC-BASE');
    if (e.closed && e.fill && e.fill !== 'none' && pts.length >= 3) out.push({ type: 'hatch', layer: 'CC-FILL', loops: [pts.flatMap((p) => [p.x, p.y])], solid: true, color: e.fill });
    if (e.closed && counter && pts.length >= 3) out.push({ type: 'hatch', layer: 'CC-COUNTER', loops: [pts.flatMap((p) => [p.x, p.y])], solid: false, pattern: 'ANSI31', pscale: 1, pangle: 0 });
    out.push({ type: 'poly', layer: lyr, pts, closed: !!e.closed });
  } else if (e.type === 'text') out.push({ type: 'text', layer: layer || 'CC-TEXT', x: r4(e.x), y: r4(e.y), h: r4(e.h), rot: rad(e.rot || 0), s: String(e.s), ha: e.ha || 'center', va: e.va || 'middle' });
  return out;
}

/** The dimension parts of a drawing list as real linear dimensions (once each). */
export function dimsOf(ents) {
  const seen = new Set(), out = [];
  for (const e of ents) {
    const d = e.dimPart;
    if (!d || seen.has(d)) continue;
    seen.add(d);
    if (d.vertical) out.push({ type: 'dim', kind: 'linear', layer: 'CC-DIM', p1: { x: r4(d.x1), y: r4(d.y1) }, p2: { x: r4(d.x2), y: r4(d.y2) }, loc: { x: r4(d.x1 + d.off), y: r4((d.y1 + d.y2) / 2) }, rot: Math.PI / 2, text: '', st: { scale: r4(Math.max(0.01, d.th / 2.5)) } });
    else out.push({ type: 'dim', kind: 'linear', layer: 'CC-DIM', p1: { x: r4(d.x1), y: r4(d.y1) }, p2: { x: r4(d.x2), y: r4(d.y2) }, loc: { x: r4((d.x1 + d.x2) / 2), y: r4(d.y1 + d.off) }, rot: 0, text: '', st: { scale: r4(Math.max(0.01, d.th / 2.5)) } });
  }
  return out;
}

export function place(ents, dx, dy) {
  const mv = (p) => ({ ...p, x: r4(p.x + dx), y: r4(p.y + dy) });
  return ents.map((e) => {
    switch (e.type) {
      case 'line': return { ...e, x1: r4(e.x1 + dx), y1: r4(e.y1 + dy), x2: r4(e.x2 + dx), y2: r4(e.y2 + dy) };
      case 'poly': return { ...e, pts: e.pts.map(mv) };
      case 'text': case 'insert': case 'point': return mv(e);
      case 'hatch': return { ...e, loops: e.loops.map((l) => l.map((v, i) => r4(v + (i % 2 ? dy : dx)))) };
      case 'dim': return { ...e, p1: mv(e.p1), p2: mv(e.p2), loc: mv(e.loc) };
      default: return e;
    }
  });
}

/** Everything in the result multiplied by k (drawing units per millimetre-or-inch of the job): coordinates, text heights, the dimensions' text size. */
export function scaleEnts(ents, k) {
  const sc = (v) => r4(v * k);
  const P = (p) => ({ ...p, x: sc(p.x), y: sc(p.y) });
  return ents.map((e) => {
    switch (e.type) {
      case 'line': return { ...e, x1: sc(e.x1), y1: sc(e.y1), x2: sc(e.x2), y2: sc(e.y2) };
      case 'poly': return { ...e, pts: e.pts.map(P) };
      case 'text': return { ...e, x: sc(e.x), y: sc(e.y), h: sc(e.h) };
      case 'insert': return { ...e, x: sc(e.x), y: sc(e.y) };
      case 'hatch': return { ...e, loops: e.loops.map((l) => l.map(sc)), ...(e.pscale ? { pscale: e.pscale * k } : {}) };
      case 'dim': return { ...e, p1: P(e.p1), p2: P(e.p2), loc: P(e.loc), st: { ...(e.st || {}), scale: r4(((e.st && e.st.scale) || 1) * k) } };
      default: return e;
    }
  });
}
export function scaleSheets(res, k) {
  if (k === 1) return res;
  return { ...res, blocks: res.blocks.map((b) => ({ ...b, entities: scaleEnts(b.entities, k) })), sheets: res.sheets.map((s) => ({ ...s, w: s.w * k, h: s.h * k, entities: scaleEnts(s.entities, k) })) };
}

const bboxOf = (ents) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const see = (x, y) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; };
  for (const e of ents) {
    if (e.type === 'line') { see(e.x1, e.y1); see(e.x2, e.y2); } else if (e.type === 'poly') for (const p of e.pts) see(p.x, p.y);
    else if (e.type === 'text') { see(e.x - e.h * String(e.s).length * 0.35, e.y - e.h); see(e.x + e.h * String(e.s).length * 0.35, e.y + e.h); }
    else if (e.type === 'hatch') for (const l of e.loops) for (let i = 0; i + 1 < l.length; i += 2) see(l[i], l[i + 1]);
    else if (e.type === 'dim') { see(e.p1.x, e.p1.y); see(e.p2.x, e.p2.y); see(e.loc.x, e.loc.y); }
    else if (e.type === 'insert') see(e.x, e.y);
  }
  return Number.isFinite(x0) ? { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 } : { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0 };
};

/** Move a list so its lower-left corner is (0, 0). */
function home(ents) { const b = bboxOf(ents); return { entities: place(ents, -b.x0, -b.y0), w: b.w, h: b.h }; }

/**
 * Elevation geometry grouped into blocks: every cabinet's boxes and lines (not its number or dimension) that look the same share one block, inserted where it stands.
 * `cab` marks the parts the drawing code made per cabinet (elevationEnts tags them).
 */
function elevationWithBlocks(ents, runId, blocks, byName) {
  const geo = new Map(), rest = [];
  for (const e of ents) { if (e.cab && !e.dimPart && e.type !== 'text') { if (!geo.has(e.cab)) geo.set(e.cab, []); geo.get(e.cab).push(e); } else rest.push(e); }
  const out = [];
  for (const [no, list] of geo) {
    const cad = list.flatMap((e) => toCad(e, {}));
    const b = bboxOf(cad.filter((e) => e.type !== 'hatch').length ? cad.filter((e) => e.type !== 'hatch') : cad);
    const local = place(cad, -b.x0, -b.y0);
    const sig = JSON.stringify(local);
    let name = byName.get(sig);
    if (!name) { name = 'CC-CAB-' + (byName.size + 1); byName.set(sig, name); blocks.push({ name, base: { x: 0, y: 0 }, entities: local.map((x) => ({ ...x, layer: '0' === x.layer ? '0' : x.layer })) }); }
    out.push({ type: 'insert', layer: 'CC-BASE', block: name, x: r4(b.x0), y: r4(b.y0), sx: 1, sy: 1, rot: 0, no });
  }
  for (const e of rest) out.push(...toCad(e, {}));
  out.push(...dimsOf(ents));
  return out;
}

const table = (rows, { x = 0, y = 0, colW, rowH, th }) => {
  const out = [];
  const W = colW.reduce((a, b) => a + b, 0), H = rows.length * rowH;
  out.push({ type: 'poly', layer: 'CC-TABLE', closed: true, pts: [{ x, y }, { x: x + W, y }, { x: x + W, y: y - H }, { x, y: y - H }] });
  let cx = x;
  for (const w of colW.slice(0, -1)) { cx += w; out.push({ type: 'line', layer: 'CC-TABLE', x1: cx, y1: y, x2: cx, y2: y - H }); }
  rows.forEach((r, i) => {
    if (i) out.push({ type: 'line', layer: 'CC-TABLE', x1: x, y1: y - i * rowH, x2: x + W, y2: y - i * rowH });
    let tx = x;
    r.forEach((cell, j) => { out.push({ type: 'text', layer: 'CC-TEXT', x: r4(tx + th * 0.5), y: r4(y - i * rowH - rowH / 2), h: r4(th * (i === 0 ? 0.9 : 0.8)), rot: 0, s: String(cell), ha: 'left', va: 'middle' }); tx += colW[j]; });
  });
  return { entities: out, w: W, h: H };
};

export function cadSheets(build, { t = (k) => k, list = null, nest = null, est = null } = {}) {
  const { project } = build;
  const u = project.unit, k = u === 'in' ? 1 / 25.4 : 1;   // drawing units per mm
  const sheets = [], blocks = [], byName = new Map();
  const push = (id, title, ents) => { const h = home(ents); sheets.push({ id, title, w: h.w, h: h.h, entities: h.entities }); };

  // plan
  const pl = planEnts(build);
  push('plan', T('draw.plan'), [...pl.flatMap((e) => toCad(e, {})), ...dimsOf(pl)]);

  // an elevation of each run
  for (const L of build.layout.runs) {
    const ents = elevationEnts(build, L.run.id);
    if (!ents.length) continue;
    push('elev-' + L.run.id, T('draw.elevation', { run: L.run.id + (L.run.name ? ' ' + L.run.name : '') }), elevationWithBlocks(ents, L.run.id, blocks, byName));
  }

  // a section of each distinct cabinet template
  const seen = new Set();
  for (const c of build.cells) {
    if (c.kind !== 'cab') continue;
    const key = c.cell.entry.tpl + (c.construction === 'faceframe' ? '-ff' : '');
    if (seen.has(key)) continue;
    seen.add(key);
    let ents = [];
    try { ents = sectionEnts(build, c.no); } catch { ents = []; }   // a corner or made-to-order cabinet has no section to draw
    if (ents.length) push('section-' + c.no, T('draw.section', { no: c.no, name: T(c.cell.tpl.name) }), [...ents.flatMap((e) => toCad(e, {})), ...dimsOf(ents)]);
  }

  // the cabinet schedule
  const th = 20 * k * 2.5;
  const cabs = build.cells.filter((c) => c.kind === 'cab');
  const rowsBy = new Map();
  for (const c of cabs) {
    const key = [c.cab.type, c.cab.w, c.cab.h, c.cab.d, c.cab.elev].join('|');
    const r = rowsBy.get(key) || { type: T(c.cell.tpl.name), w: c.cab.w, h: c.cab.h, d: c.cab.d, elev: c.cab.elev, nos: [], mto: c.madeToOrder };
    r.nos.push(c.no); rowsBy.set(key, r);
  }
  const head = [t('cad.sch.type'), t('cad.sch.w'), t('cad.sch.h'), t('cad.sch.d'), t('cad.sch.elev'), t('cad.sch.qty'), t('cad.sch.marks')];
  const srows = [head, ...[...rowsBy.values()].map((r) => [r.type, fmtLen(r.w, u), fmtLen(r.h, u), fmtLen(r.d, u), fmtLen(r.elev, u), r.nos.length, r.nos.join(' ')])];
  const tb = table(srows, { colW: [60, 22, 22, 22, 22, 14, 100].map((v) => v * th / 2.5 * 0.5), rowH: th * 1.8, th });
  push('schedule', t('cad.schedule'), tb.entities);

  // the cut list as a table
  const rowsOfList = list && Array.isArray(list.groups) ? list.groups.flatMap((g) => g.rows) : [];
  if (rowsOfList.length) {
    const nm = (x) => (/^(part|lib)\./.test(String(x)) ? t(x) : String(x ?? ''));
    const cols = [t('csv.cut.id'), t('csv.cut.name'), t('csv.cut.material'), t('csv.cut.thickness'), t('csv.cut.length'), t('csv.cut.width'), t('csv.cut.qty')];
    const body = rowsOfList.slice(0, 400).map((r) => [r.id ?? '', nm(r.name), nm(r.material), fmtLen(r.thickness ?? 0, u), fmtLen(r.length ?? 0, u), fmtLen(r.width ?? 0, u), r.qty ?? 1]);
    const ct = table([cols, ...body], { colW: [26, 90, 70, 18, 24, 24, 14].map((v) => v * th / 2.5 * 0.5), rowH: th * 1.6, th });
    push('cutlist', t('cad.cutlist'), ct.entities);
  }

  // the nested sheets: each sheet's outline, every placed part as a rectangle with its id; the sheets side by side
  if (nest && Array.isArray(nest.mats) && nest.mats.length) {
    const ents = [];
    let ox = 0;
    const seq = new Map((nest.seq || []).map((s) => [s.id + '#' + s.copy, s]));
    for (const m of nest.mats) {
      const gap = (m.sheet.w || 1000) * 0.08;
      const n = m.result.sheets.length;
      for (let si = 0; si < n; si++) {
        ents.push({ type: 'poly', layer: 'CC-SHEET', closed: true, pts: [{ x: ox, y: 0 }, { x: ox + m.sheet.w, y: 0 }, { x: ox + m.sheet.w, y: m.sheet.h }, { x: ox, y: m.sheet.h }] });
        ents.push({ type: 'text', layer: 'CC-TEXT', x: ox + m.sheet.w / 2, y: m.sheet.h + gap * 0.3, h: gap * 0.22, rot: 0, s: `${(/^(lib)\./.test(String(m.material)) ? t(m.material) : m.material)} ${m.thickness} - ${m.sheetBase + si + 1}`, ha: 'center', va: 'middle' });
        for (const p of m.result.placed.filter((q) => q.sheet === si)) {
          const lp = (p.loops && p.loops[0]) || [];
          if (lp.length < 3) continue;
          const pts = lp.map((q) => ({ x: r4(ox + q.x), y: r4(q.y) }));
          ents.push({ type: 'poly', layer: 'CC-BASE', closed: true, pts });
          const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
          const s2 = seq.get(p.id + '#' + ((p.copy ?? 0) + 1));
          ents.push({ type: 'text', layer: 'CC-TEXT', x: r4((Math.min(...xs) + Math.max(...xs)) / 2), y: r4((Math.min(...ys) + Math.max(...ys)) / 2), h: Math.max(1, Math.min(w, h) * 0.16), rot: 0, s: s2 ? s2.pieceId + ' (' + s2.n + ')' : String(p.id), ha: 'center', va: 'middle' });
        }
        ox += m.sheet.w + gap;
      }
    }
    if (ents.length) push('nest', t('cad.nest'), ents);
  }
  void est;
  return { layers: { ...LAYERS }, blocks, sheets };
}

/**
 * The sheets side by side in rows (shelf packing), each in a frame with its title above it, from (x, y) at the lower-left. `res` is cadSheets' result already scaled to the drawing's units.
 * → { entities, frames: [{ id, x0, y0, x1, y1 }] }
 */
export function layoutSheets(res, { x = 0, y = 0, rowW = null } = {}) {
  const sheets = res.sheets;
  if (!sheets.length) return { entities: [], frames: [] };
  const maxW = Math.max(...sheets.map((s) => s.w)), maxH = Math.max(...sheets.map((s) => s.h));
  const gap = Math.max(maxW, maxH) * 0.06 + 1e-6, pad = gap * 0.35;
  const limit = rowW || Math.max(maxW * 2.2, 1);
  const out = [], frames = [];
  let cx = x, rowTop = y, rowH = 0;
  const th = Math.max(maxW, maxH) * 0.018;
  for (const s of sheets) {
    const w = s.w + 2 * pad, h = s.h + 2 * pad;
    if (cx > x && cx - x + w > limit) { rowTop -= rowH + gap * 2; cx = x; rowH = 0; }
    const x0 = cx, y1 = rowTop, y0 = rowTop - h;
    out.push({ type: 'poly', layer: 'CC-SHEET', closed: true, pts: [{ x: r4(x0), y: r4(y0) }, { x: r4(x0 + w), y: r4(y0) }, { x: r4(x0 + w), y: r4(y1) }, { x: r4(x0), y: r4(y1) }] });
    out.push({ type: 'text', layer: 'CC-TEXT', x: r4(x0), y: r4(y1 + th * 0.9), h: r4(th), rot: 0, s: s.title, ha: 'left', va: 'baseline' });
    out.push(...place(s.entities, x0 + pad, y0 + pad));
    frames.push({ id: s.id, x0, y0, x1: x0 + w, y1 });
    cx += w + gap; rowH = Math.max(rowH, h);
  }
  return { entities: out, frames };
}
