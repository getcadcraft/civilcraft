import { legendItems, legendHeight } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/keynotes.js';
/* perf-finish-11 #1995: res-sheets.js as it was before the change (2026-11-21), imports made absolute; only for sheets-stack-1995.mjs. Not served. */
import { notesItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/sheet-notes.js';   // 0.10 BK.157: standard notes from a regulation pack
import { documentItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/assembly-schedule-layout.js';
/* SPDX-License-Identifier: Apache-2.0 */
import { layerPrimitives, colorRgb } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/wall-plan-graphics.js';
import { cutFaceItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/wall-section-graphics.js';
import { dimensionFootprint } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/dimension-geometry.js';
import { penHex, penMm, penDash } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/pen-colors.js';
import { parseTitleSvg, svgTitleItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/title-svg.js';   // 0.9 D8.17: a design of the person's own
import { titleBlockItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/title-block.js';   // 0.9 SU.1123: title blocks from the library   // 0.9 D8.12-B: sheets print the view pens as shown
/**
 * res-sheets.js — a print-ready drawing set made from the model (0.5 part 4, RC.5): plans of each level, the four exterior
 * elevations, building sections from section lines, schedules, framing elevations of each framed wall — laid out on
 * sheets with title blocks and scales, made again from the model whenever it is asked for (so it always matches). No DOM:
 * bin/test-bimcraft.mjs --res builds a set and checks its PDF.
 *
 *   buildSet(input, { paper, units, project, date }) → sheets: [{ number, title, items }]
 *     input = { plans: [{ title, scene }], elevations: [{ title, view }], sections: [{ title, view }],
 *               schedules: [{ title, head, rows, total }], framing: [{ title, pieces, length, height }],
 *               rcps: [{ ref, title, scene }] (0.6 DC.117: ceiling plans; composeSheet only),
 *               callouts: [{ ref (its id), title, scene }] (0.6 DC.117 (c): callouts; composeSheet only) }
 *     scene.drafting [{ lines, closed, rings, solid, segs }] (0.6 DC.117 (d), drafting.js draftingItem): drawn on every plan sheet
 *     (scene: model-ui.js plan scene; view: res-views.js projectView, + grids [{ tag, x }] from model-grids.js gridsInView
 *     (0.6 DF.16: drawn as lines with a bubble on top); pieces: res-framing.js frameWall pieces)
 *   setPdf(sheets, { paper, title, attach }) → Uint8Array   one vector page per sheet (Helvetica, WinAnsi); attach =
 *                                                    { name, bytes, mime, desc }: a file attached to the PDF (EmbeddedFiles)
 *   planSheet(number, title, scene, { paper, units, project, date, extra }) → a sheet with `place` { P (plan mm → sheet mm),
 *                                                    ratio, label }: the plan at the largest standard scale that fits (RC.8)
 *   composeSheet(spec, input, opts) → a sheet you arranged (0.6 DF.19: views at their places and scales; see below)
 *   sheetSvg(sheet, { paper }) → svg text               the same drawing for the preview
 *   PAPERS · scaleFor(w, h, room, units, minRatio)
 *   readSectionLines(w) · placeSectionLine({ level, a, b, look, name }) → op · changeSectionLine(guid, ch) → op ·
 *   removeSectionLines([guid]) → op
 *
 * A section line is an IfcAnnotation (no geometry; ObjectType "Section line") in its level with CadCraft_SectionLine
 * (AX, AY, BX, BY in the level's plan, Look left | right of A→B, Name "A", Depth — how far behind it to look, 0 = all).
 *
 * An elevation marker (0.10 BT.10: the ribbon's Elevation) is the same record with Kind "elevation" (ObjectType "Elevation marker",
 * Name "1", "2", …): it stands at a point and looks one way, and its view is what is in front of it. It is kept as a short line
 * across that point (so every reader of section lines — sheets, copies, view settings, the elevation editor, key `section:<guid>` —
 * has it at once); only its name, its plan symbol and where the Project Browser lists it differ.
 *   placeElevationMarker({ level, at, toward, name }) → op · elevationMarkerOf(line) → { at, dir } · sectionTitle(line) → words
 */
import { ModelWriter, round } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/model-write.js';
import { ids, val } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/ifc-util.js';
import { t as tr } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/i18n.js';
import { isMetric } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/model-units.js';
import * as PDFI from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/picture-pdf.js';   // 0.8 D8.8 round 5: pictures in section / elevation views
import { noteItems } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/comforts-views.js';   // 0.6 round 2 (bim-comforts_PART_2): dimensions, level marks and tags on views
import { annoPt, annoK } from '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev/anno-scale-bim.js';   // 0.10 BK.10: text, dimensions, tags, room names, grid bubbles and view titles sized from paper heights (the one rule: annoscale.js)

export const SECTION_PSET = 'CadCraft_SectionLine';
export const PAPERS = { letter: [279.4, 215.9], tabloid: [431.8, 279.4], archd: [914.4, 609.6], a3: [420, 297], a1: [841, 594], a4: [297, 210], a2: [594, 420], a0: [1189, 841], archc: [609.6, 457.2], arche: [1219.2, 914.4] };   // 0.9: A4 (the plan Print's paper); SU.1123 adds the library's formats at run time (sheet-formats.js)
/** 0.9 D8.14: a sheet is landscape (the table above) or portrait: the paper key + ':p' (a3:p = 297 × 420), so every place that reads PAPERS[key] works as it was. */
export const PORTRAIT = ':p';
export const isPortrait = (k) => String(k).endsWith(PORTRAIT);
export const baseKey = (k) => (isPortrait(k) ? String(k).slice(0, -PORTRAIT.length) : String(k));
export const portraitKey = (k) => baseKey(k) + PORTRAIT;
for (const [k, [w, h]] of Object.entries(PAPERS)) PAPERS[k + PORTRAIT] = [h, w];
/** 0.9 D8.15: a scale typed by the person → the ratio (paper : real = 1 : ratio), or null when it is not one.
 *  "1:64", "1:2.5", "2:1" (enlarged: 0.5), "64", "1/4\" = 1'", "3/16 in = 1 ft", "1/8=1'-0\"". */
export function parseScale(text) {
  const s = String(text ?? '').trim().replace(/[\u2033\u201d]/g, '"').replace(/[\u2032\u2019]/g, "'").replace(/\s+/g, ' ');
  if (!s) return null;
  const frac = (x) => { const m = /^(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?$/.exec(x.trim()); return m ? (m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1])) : NaN; };
  let r = NaN, m;
  if ((m = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(s))) r = Number(m[2]) / Number(m[1]);
  else if (/^\d+(?:\.\d+)?$/.test(s)) r = Number(s);
  else if ((m = /^(\d+(?:\s*\/\s*\d+)?(?:\.\d+)?)\s*(?:"|in|inch|inches)?\s*=\s*(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)?(?:\s*-?\s*0\s*"?)?$/i.exec(s))) r = (Number(m[2]) * 12) / frac(m[1]);
  return Number.isFinite(r) && r >= 0.01 && r <= 100000 ? Math.round(r * 1000) / 1000 : null;
}
export const scalesFor = (units) => SCALES[isMetric(units) ? 'mm' : 'ftin'].map(([ratio, label]) => ({ ratio, label }));   // 0.6 DF.19: the sheet editor's list
const SCALES = {
  ftin: [[16, '3/4" = 1\'-0"'], [24, '1/2" = 1\'-0"'], [32, '3/8" = 1\'-0"'], [48, '1/4" = 1\'-0"'], [64, '3/16" = 1\'-0"'], [96, '1/8" = 1\'-0"'], [192, '1/16" = 1\'-0"'], [384, '1/32" = 1\'-0"']],   // i18n-ignore: drawing scales
  mm: [[20, '1:20'], [25, '1:25'], [50, '1:50'], [100, '1:100'], [200, '1:200'], [500, '1:500'], [1000, '1:1000']],   // i18n-ignore: drawing scales
};
export function scaleFor(w, h, room, units = 'ftin', minRatio = 0) {
  const list = SCALES[isMetric(units) ? 'mm' : 'ftin'].filter(([r]) => r >= minRatio);
  const s = list.find(([r]) => w / r <= room[0] && h / r <= room[1]);
  if (s) return { ratio: s[0], label: s[1] };
  const r = Math.ceil(Math.max(w / room[0], h / room[1]));
  return { ratio: r, label: '1:' + r };   // i18n-ignore: a scale ratio
}

// ------------------------------------------------------------------------------------------------- drawing → items
// item: { t: 'line', pts: [[x, y]…], w (mm), g (grey 0 black … 1 white), dash } | { t: 'fill', polys, g } | { t: 'text', s, x, y,
//        size (pt), align, bold, rot } | { t: 'clip', rect: [x0, y0, x1, y1] } … { t: 'unclip' } (0.6 DC.117: what lies between
//        is clipped to the rectangle — a view's crop region)   — all in sheet millimetres, y up from the sheet's bottom
const at = (k, ox, oy) => (p) => [ox + p[0] * k, oy + p[1] * k];
function planItems(scene, P, k) {
  const out = [], seg = (a, w, g, dash) => { for (let i = 0; i < a.length; i += 4) out.push({ t: 'line', pts: [P([a[i], a[i + 1]]), P([a[i + 2], a[i + 3]])], w, g, dash }); };
  // 0.9 D8.12-B: segments in a view pen { w (screen px), dash, color (token) }
  const segPen = (a, pen, w0) => { const w = pen.w ? penMm(pen.w) : w0, color = pen.color ? penHex(pen.color) : undefined, dash = penDash(pen.dash) || undefined; for (let i = 0; i < a.length; i += 4) out.push({ t: 'line', pts: [P([a[i], a[i + 1]]), P([a[i + 2], a[i + 3]])], w, g: 0, color, dash }); };
  if (scene.underlay?.segs?.length) seg(scene.underlay.segs, 0.13, 0.72);   // 0.6 DC.117: another level, light, under everything
  for (const b of scene.below || []) seg(b.segs, 0.13, 0.45);
  for (const b of scene.above || []) seg(b.segs, 0.13, 0.45, [2, 1.2]);   // 0.6 DF.19: above the cut, under the range's top
  for (const c of scene.cut || []) {
    if (c.loops?.length) out.push({ t: 'fill', polys: c.loops.map((l) => { const pts = []; for (let i = 0; i + 1 < l.length; i += 2) pts.push(P([l[i], l[i + 1]])); return pts; }), g: 0.75 });
    if (c.pen) segPen(c.segs, c.pen, 0.25); else seg(c.segs, 0.25, 0);   // 0.9 D8.12-B: printed as shown
  }
  for (const w of scene.walls || []) {
    if (w.layers) for (const it of layerPrimitives(w)) out.push(it.t === 'fill' ? { ...it, polys: it.polys.map(p => p.map(P)) } : { ...it, pts: it.pts.map(P) });
    else for (const p of w.pieces || [w.poly]) if (p?.length) out.push({ t: 'fill', polys: [p.map(P)], g: 0.55 });
  }
  for (const p of scene.wallEdges || []) out.push({ t: 'line', pts: [...p.map(P), P(p[0])], w: 0.5, g: 0 });
  // 0.9 D8.12-B: a view's pen override on a wall, printed as the screen shows it: the outline again in that weight, line and colour
  for (const w of scene.walls || []) if (w.pen) for (const p of w.pieces || [w.poly]) if (p?.length) out.push({ t: 'line', pts: [...p.map(P), P(p[0])], w: penMm(w.pen.w || 1.75), g: 0, color: w.pen.color ? penHex(w.pen.color) : undefined, dash: penDash(w.pen.dash) || undefined });
  for (const s of scene.symbols || []) {
    if (s.lw || s.color) { for (const l of s.lines || []) segPen(l, { w: s.lw, color: s.color }, 0.35); } else   // 0.9 D8.12-B: a door / window pen
    for (const l of s.lines || []) seg(l, 0.35, 0);
    for (const a of s.arcs || []) { const steps = Math.max(8, Math.ceil(Math.abs(a.a1 - a.a0) / (Math.PI / 32))); const pts = []; for (let i = 0; i <= steps; i++) { const t = a.a0 + (a.a1 - a.a0) * i / steps; pts.push(P([a.c[0] + a.r * Math.cos(t), a.c[1] + a.r * Math.sin(t)])); } out.push({ t: 'line', pts, w: 0.18, g: 0 }); }
    for (const l of s.thin || []) seg(l, 0.18, 0);
    for (const l of s.dashed || []) seg(l, 0.18, 0, [1.5, 1]);
  }
  // 0.6 DC.117 (d): drafting lines and hatch regions drawn in this view
  for (const d of scene.drafting || []) {
    const col = d.pen?.color ? penHex(d.pen.color) : undefined;   // 0.9 D8.12-B: a drafting pen
    if (d.solid && d.rings) out.push({ t: 'fill', polys: d.rings.map((r) => r.map(P)), g: 0.6, color: col });
    if (d.segs?.length) { if (col) segPen(d.segs, { color: d.pen.color }, 0.13); else seg(d.segs, 0.13, 0); }
    for (const l of d.lines || []) if (l.length > 1) out.push({ t: 'line', pts: [...l.map(P), ...(d.closed ? [P(l[0])] : [])], w: d.pen?.w ? penMm(d.pen.w) : d.kind === 'hatch' ? 0.18 : 0.25, g: 0, color: col, dash: penDash(d.pen?.dash) || undefined });
  }
  // BK.104: labels along lines (scene.labels [{ p, rot (degrees), text }]: building lines and servitudes)
  for (const lb of scene.labels || []) { const q = P(lb.p); out.push({ t: 'text', s: String(lb.text || ''), x: q[0], y: q[1], size: annoPt('text'), rot: (lb.rot || 0) * Math.PI / 180 }); }
  for (const d of scene.dims || []) {
    const L = Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]);
    if (L < 1) continue;
    const u = [(d.b[0] - d.a[0]) / L, (d.b[1] - d.a[1]) / L], n = [-u[1], u[0]], off = d.offPx !== undefined ? d.offPx * 0.3 / k : d.off || 0;   // screen px → about 0.3 mm of paper
    const A = [d.a[0] + n[0] * off, d.a[1] + n[1] * off], B = [d.b[0] + n[0] * off, d.b[1] + n[1] * off];
    out.push({ t: 'line', pts: [P(A), P(B)], w: 0.13, g: 0, color: d.pen?.color ? penHex(d.pen.color) : undefined });
    if (d.witnesses) for (const [i, q] of [A, B].entries()) out.push({ t: 'line', pts: [P(d.witnesses[i]), P(q)], w: 0.13, g: 0 });
    const tk = 1 / k, tick = [(u[0] - n[0]) * tk, (u[1] - n[1]) * tk];
    for (const q of [A, B]) out.push({ t: 'line', pts: [P([q[0] - tick[0], q[1] - tick[1]]), P([q[0] + tick[0], q[1] + tick[1]])], w: 0.13, g: 0 });
    let rot = Math.atan2(u[1], u[0]);
    if (rot > Math.PI / 2 + 1e-9 || rot <= -Math.PI / 2) rot += Math.PI;
    const mid = P([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]);
    const dg = 0.8 * annoK('dimension');   // 0.10 BK.10: the text's gap above the line grows with its paper height
    out.push({ t: 'text', s: d.text, x: mid[0] - Math.sin(rot) * dg, y: mid[1] + Math.cos(rot) * dg, size: annoPt('dimension'), rot });
  }
  for (const r of scene.rooms || []) {
    if (!r.at || !r.label) continue;
    const q = P(r.at);
    r.label.forEach((s, i) => out.push({ t: 'text', s, x: q[0], y: q[1] - (i - (r.label.length - 1) / 2) * 3.4 * annoK('room'), size: i ? annoPt('tag') : annoPt('room'), bold: !i }));   // 0.10 BK.10
  }
  // grid lines (0.6 DF.16): thin dash-dot, a 7 mm bubble beyond each end the grid shows them at
  for (const x of scene.grids || []) {
    const a = P(x.a), b = P(x.b), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    out.unshift({ t: 'line', pts: [a, b], w: 0.13, g: 0.35, dash: [5, 1, 0.6, 1] });
    if (x.bubbles === 'none') continue;
    const br = 3.5 * annoK('grid');   // 0.10 BK.10: the bubble grows with its letter
    if (x.bubbles !== 'end') out.push(...bubble([a[0] - u[0] * br, a[1] - u[1] * br], x.tag, br));
    if (x.bubbles !== 'start') out.push(...bubble([b[0] + u[0] * br, b[1] + u[1] * br], x.tag, br));
  }
  // 0.6 DC.117: a crop region clips the whole view
  if (scene.crop) { const a = P([scene.crop[0], scene.crop[1]]), b = P([scene.crop[2], scene.crop[3]]); return [{ t: 'clip', rect: [a[0], a[1], b[0], b[1]] }, ...out, { t: 'unclip' }]; }
  return out;
}
/** A grid bubble (sheet mm): a white circle, its outline, the label. */
function bubble(c, tag, r = 3.5 * annoK('grid')) {
  const pts = [];
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); }
  return [{ t: 'fill', polys: [pts], g: 1 }, { t: 'line', pts, w: 0.25, g: 0 }, { t: 'text', s: tag, x: c[0], y: c[1] - 1.1 * annoK('grid'), size: annoPt('grid') * (tag.length > 2 ? 5 / 6.5 : 1), bold: true }];
}
const LAYER_REASONS = ['unsupported-cut', 'unavailable-layers', 'end-cut'];   // wall-section-graphics.js: layered cut faces that fell back to the envelope
export function viewItems(view, P, k = 0) {
  const out = [];
  // 0.8 D8.8 round 5: pictures standing on a plane square to this view (res-ui.js attaches them as view.images), under all the lines
  if (view.images?.length) {
    const o = P([0, 0]), ex = P([1, 0]), kk = ex[0] - o[0], b = view.bounds;
    if (b) { const p0 = P([b.x0, b.y0]), p1 = P([b.x1, b.y1]); out.push({ t: 'clip', rect: [Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])] }); }
    for (const im of view.images) {
      const m = im.m;
      out.push({ t: 'image', image: im.image, w: im.w, h: im.h, opacity: im.opacity ?? 1, href: im.href || null, name: im.name || '', m: [m[0] * kk, m[1] * kk, m[2] * kk, m[3] * kk, o[0] + m[4] * kk, o[1] + m[5] * kk] });
    }
    if (b) out.push({ t: 'unclip' });
  }
  for (const l of view.lines || []) out.push({ t: 'line', pts: [P([l[0], l[1]]), P([l[2], l[3]])], w: 0.18, g: 0 });
  for (const c of view.cuts || []) out.push(...cutFaceItems(c,P,k>0?1/k:c.scale));
  // grid lines seen end on (0.6 DF.16): from under the ground line to above the top, the bubble on top
  const b = view.bounds;
  if (b) for (const g of view.grids || []) {
    if (g.x < b.x0 - 1 || g.x > b.x1 + 1) continue;
    const lo = P([g.x, b.y0 - 300]), hi = P([g.x, b.y1 + 600]);
    out.push({ t: 'line', pts: [lo, hi], w: 0.13, g: 0.35, dash: [5, 1, 0.6, 1] }, ...bubble([hi[0], hi[1] + 3.5 * annoK('grid')], g.tag));
  }
  // the ground line under it all, past both ends — unless the model has its ground (terrain draws itself)
  const groundY=view.groundY??b?.y0;
  if (b && !view.ground && groundY>=b.y0 && groundY<=b.y1) out.push({ t: 'line', pts: [P([b.x0 - 450, groundY]), P([b.x1 + 450, groundY])], w: 0.6, g: 0 });
  // 0.6 round 2 (bim-comforts_PART_2): the view's notes — level marks, dimensions, door / window / item tags (comforts-views.js)
  if (view.notes?.length && k > 0) out.push(...noteItems(view.notes, P, k));
  // 0.10 BK.4 (the small-house run): at coarse detail the cut is the plain envelope by design, so a wall whose LAYERS could not be
  // drawn (joined walls, a cut at a wall's end) is not a fault of the drawing: the line is printed only when layers were asked for.
  const said = (view.warnings || []).filter((w) => (view.detail && view.detail !== 'coarse') || !LAYER_REASONS.includes(w.reason));
  if(b && said.length)out.push({t:'text',s:tr('proj.diagnostic')+' '+[...new Set(said.map(w=>w.reason))].join(', '),x:P([b.x0,b.y1])[0],y:P([b.x0,b.y1])[1]+4,size:annoPt('text'),align:'left'});
  return out;
}
function framingItems(fr, P) {
  const out = [];
  for (const pc of fr.pieces) {
    if (!pc.box) continue;
    const b = pc.box, r = [P([b.x0, b.z0]), P([b.x1, b.z0]), P([b.x1, b.z1]), P([b.x0, b.z1])];
    if (/header|sill|plate/.test(pc.role)) out.push({ t: 'fill', polys: [r], g: /header/.test(pc.role) ? 0.8 : 0.9 });
    out.push({ t: 'line', pts: [...r, r[0]], w: 0.13, g: 0 });
  }
  return out;
}
/** 0.10 BK.10: a schedule row's height on paper (5 mm for the app's own text size; it grows with the office's). */
const ROW_H = () => 5 * annoK('schedule');
function tableItems(sc, x, yTop, width) {
  const out = [], rowH = ROW_H(), cols = sc.head.length;
  // sc.widths: each column's share of the width (a schedule with long text); the default is equal columns
  const shares = sc.widths || sc.head.map(() => 1 / cols), at = shares.map((_, i) => shares.slice(0, i).reduce((a, b) => a + b, 0) * width);
  const row = (cells, y, bold) => cells.forEach((c, i) => out.push({ t: 'text', s: String(c ?? ''), x: x + at[i] + 1.5, y: y - rowH + 1.6 * annoK('schedule'), size: annoPt('schedule'), align: 'left', bold }));
  out.push({ t: 'line', pts: [[x, yTop], [x + width, yTop]], w: 0.35, g: 0 });
  row(sc.head, yTop, true);
  out.push({ t: 'line', pts: [[x, yTop - rowH], [x + width, yTop - rowH]], w: 0.25, g: 0 });
  let y = yTop - rowH;
  for (const r of sc.rows) { row(r, y, false); y -= rowH; out.push({ t: 'line', pts: [[x, y], [x + width, y]], w: 0.1, g: 0.6 }); }
  if (sc.total) { row(sc.total, y, true); y -= rowH; }
  out.push({ t: 'line', pts: [[x, y], [x + width, y]], w: 0.35, g: 0 });
  return { items: out, bottom: y };
}

// ------------------------------------------------------------------------------------------------------------ sheets
function boundsOfScene(scene) {
  if (scene.crop) return { x0: scene.crop[0], y0: scene.crop[1], x1: scene.crop[2], y1: scene.crop[3] };   // 0.6 DC.117: the crop is the view
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const g = (x, y) => { if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y; };
  for (const w of scene.walls || []) for (const q of w.poly || []) g(q[0], q[1]);
  for (const c of [...(scene.cut || []), ...(scene.below || [])]) for (let i = 0; i + 1 < c.segs.length; i += 2) g(c.segs[i], c.segs[i + 1]);
  for (const s of scene.symbols || []) for (const q of s.poly || []) g(q[0], q[1]);
  for (const x of scene.grids || []) { g(x.a[0], x.a[1]); g(x.b[0], x.b[1]); }   // 0.6 DF.16
  for (const d of scene.drafting || []) for (const l of d.lines || []) for (const q of l) g(q[0], q[1]);   // 0.6 DC.117 (d)
  for (const d of scene.dims || []) if (d.key) for (const q of dimensionFootprint(d)) g(q[0], q[1]);
  if (!Number.isFinite(b.x0)) return null;
  const pad = Math.max(b.x1 - b.x0, b.y1 - b.y0) * 0.03 + 300;
  return { x0: b.x0 - pad, y0: b.y0 - pad, x1: b.x1 + pad, y1: b.y1 + pad };
}
/** A sheet: its frame, the title block along the bottom, its cells laid out left to right. */
function sheet(number, title, cells, { paper, project, date, titleBlock = null, fields = {}, margin = null, strip: more = [] }) {   // strip: more texts for the built-in strip (client, drawn by, revision: SC.7)
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  const m = margin ?? 10, strip = 18;
  let items = [];
  if (titleBlock) {   // 0.9 SU.1123: a title block from the library (sheet-formats.js); the strip below is the built-in 'strip'
    const labels = Object.fromEntries(['project', 'client', 'drawn', 'checked', 'scale', 'date', 'revision'].map((k) => [k, tr('sf.field.' + k)]));
    items = titleBlockItems(titleBlock, { PW, PH, margin: m, number, title, project, date, fields, labels, madeWith: tr('res.sh.madewith') }).items;
  } else {
  items.push({ t: 'line', pts: [[m, m], [PW - m, m], [PW - m, PH - m], [m, PH - m], [m, m]], w: 0.5, g: 0 });
  items.push({ t: 'line', pts: [[m, m + strip], [PW - m, m + strip]], w: 0.35, g: 0 });
  items.push({ t: 'line', pts: [[PW - m - 40, m], [PW - m - 40, m + strip]], w: 0.35, g: 0 });
  items.push({ t: 'text', s: number, x: PW - m - 20, y: m + 6, size: 18, bold: true });
  items.push({ t: 'text', s: title, x: m + 4, y: m + 10, size: 12, align: 'left', bold: true });
  items.push({ t: 'text', s: [project, ...more, date, tr('res.sh.madewith')].filter(Boolean).join('    '), x: m + 4, y: m + 4, size: 7, align: 'left', g: 0.25 });   // i18n-ignore: spacing between the strip's items
  }
  const room = [PW - 2 * m, PH - 2 * m - strip], cw = room[0] / Math.max(1, cells.length);
  const views = [];
  cells.forEach((c, i) => {
    const x = m + i * cw, y = m + strip;
    items.push(...c.draw(x + 6, y + 14, cw - 12, room[1] - 22));
    views.push({ title: c.title, scale: c.scale, bb: c.bb || null, place: c.place || null });
    if (c.title) {
      items.push({ t: 'text', s: c.title, x: x + 6, y: y + 7, size: annoPt('title'), align: 'left', bold: true });   // 0.10 BK.10
      if (c.scale) items.push({ t: 'text', s: c.scale, x: x + 6, y: y + 3, size: annoPt('title') * 7 / 9, align: 'left', g: 0.25 });
      items.push({ t: 'line', pts: [[x + 6, y + 6], [x + Math.min(cw - 12, 90), y + 6]], w: 0.35, g: 0 });
    }
  });
  return { number, title, items, views };
}
/** A drawing cell: content in its own millimetres with bounds, drawn at the scale that fits the space (or a shared one). */
function drawCell(title, bb, units, drawWith, forced = null, minRatio = 0) {
  const W = Math.max(1, bb.x1 - bb.x0), H = Math.max(1, bb.y1 - bb.y0);
  const cell = { title, scale: null, bb, draw: null };
  cell.draw = (x, y, w, h) => {
    const sc = forced ? { ratio: forced, label: SCALES[isMetric(units) ? 'mm' : 'ftin'].find((s) => s[0] === forced)?.[1] || '1:' + forced } : scaleFor(W, H, [w, h], units, minRatio);   // i18n-ignore: a scale ratio
    cell.scale = sc.label;
    const k = 1 / sc.ratio, ox = x + (w - W * k) / 2 - bb.x0 * k, oy = y + (h - H * k) / 2 - bb.y0 * k;
    cell.place = { P: at(k, ox, oy), ratio: sc.ratio, label: sc.label };
    return drawWith(at(k, ox, oy), k);
  };
  return cell;
}

export function buildSet(input, { paper = 'tabloid', units = 'ftin', project = '', date = '', strip = [] } = {}) {
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  const roomFor = (n) => [(PW - 20) / n - 12, PH - 20 - 18 - 22];
  const opts = { paper, project, date, strip };
  const BUILDING = isMetric(units) ? 50 : 48;   // plans, elevations and sections no larger than 1:50 or a quarter inch to the foot
  const sheets = [];
  // plans: one level a sheet
  (input.plans || []).forEach((p, i) => {
    const bb = boundsOfScene(p.scene);
    if (!bb) return;
    // 0.10 BK.4 / BK.10 (the small-house run): a plan with a scale of its own (its view range) is drawn at it, as the elevations and sections are
    const c = drawCell(p.title, bb, units, (P, k) => planItems(p.scene, P, k), p.scene.scale > 0 ? p.scene.scale : null, BUILDING);
    const s = sheet('A-1' + String(i + 1).padStart(2, '0'), p.title, [c], opts);
    s.scale = c.scale;
    sheets.push(s);
  });
  // elevations: two a sheet, all at one scale (the one the largest fits)
  const els = (input.elevations || []).filter((e) => e.view?.bounds);
  if (els.length) {
    const ratio = Math.max(...els.map((e) => scaleFor(e.view.bounds.x1 - e.view.bounds.x0 + 1000, e.view.bounds.y1 - e.view.bounds.y0 + 1000, roomFor(2), units, BUILDING).ratio));
    for (let i = 0; i < els.length; i += 2) {
      const cells = els.slice(i, i + 2).map((e) => drawCell(e.title, pad(e.view.bounds, e.view.crop?0:500), units, (P, k) => viewItems(e.view, P, k), e.view.scale || ratio));
      sheets.push(sheet('A-2' + String(i / 2 + 1).padStart(2, '0'), tr('res.sh.elevations'), cells, opts));
    }
  }
  // sections: two a sheet
  const secs = (input.sections || []).filter((e) => e.view?.bounds);
  for (let i = 0; i < secs.length; i += 2) {
    const cells = secs.slice(i, i + 2).map((e) => drawCell(e.title, pad(e.view.bounds, e.view.crop?0:500), units, (P, k) => viewItems(e.view, P, k), e.view.scale || null, BUILDING));
    sheets.push(sheet('A-3' + String(i / 2 + 1).padStart(2, '0'), tr('res.sh.sections'), cells, opts));
  }
  // schedules: side by side, as many columns as the paper's width takes; a table taller than the sheet goes on in the next
  // column ("continued"), its total under its last piece
  const perSheet = Math.max(1, Math.min(4, Math.floor((PW - 20) / 130)));
  const fit = Math.max(4, Math.floor((PH - 20 - 18 - 22) / ROW_H()) - 3);
  const pieces = [];
  for (const sc of (input.schedules || []).filter((x) => x.document)) {
    sheets.push(sheet('A-6'+String(sheets.length+1).padStart(2,'0'),sc.title,[{title:sc.title,draw:(x,y,w,h)=>documentItems(sc,x+(w-sc.document.width)/2,y+h)}],opts));
  }
  for (const sc of (input.schedules || []).filter((x) => !x.document && x.rows.length)) {
    for (let r = 0; r < sc.rows.length; r += fit) {
      const last = r + fit >= sc.rows.length;
      pieces.push({ title: r ? tr('res.sh.continued', { title: sc.title }) : sc.title, head: sc.head, widths: sc.widths, rows: sc.rows.slice(r, r + fit), total: last ? sc.total : null });
    }
  }
  for (let i = 0; i < pieces.length; i += perSheet) {
    const cells = pieces.slice(i, i + perSheet).map((sc) => ({ title: sc.title, scale: null, draw: (x, y, w, h) => tableItems(sc, x, y + h, w).items }));
    sheets.push(sheet('A-4' + String(i / perSheet + 1).padStart(2, '0'), tr('res.sh.schedules'), cells, opts));
  }
  // framing elevations: three walls a sheet, each at the scale its space allows
  const fr = (input.framing || []).filter((f) => f.pieces.length);
  for (let i = 0; i < fr.length; i += 3) {
    const cells = fr.slice(i, i + 3).map((f) => { const xs = f.pieces.filter((p) => p.box).flatMap((p) => [p.box.x0, p.box.x1]), zs = f.pieces.filter((p) => p.box).flatMap((p) => [p.box.z0, p.box.z1]); return drawCell(f.title, pad({ x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...zs), y1: Math.max(...zs) }, 300), units, (P) => framingItems(f, P)); });
    sheets.push(sheet('S-1' + String(i / 3 + 1).padStart(2, '0'), tr('res.sh.framing'), cells, opts));
  }
  // every sheet drawn once now (cells pick their scales as they draw)
  return sheets;
}
const pad = (b, p) => ({ x0: b.x0 - p, y0: b.y0 - p, x1: b.x1 + p, y1: b.y1 + p });

/** 0.6 DF.19: a sheet arranged by hand (views-model.js CadCraft_Sheets): each view at its place (its middle, sheet mm) and
 *  scale (1:ratio; 0 = the plan's own scale (DC.117), else the largest standard scale that fits a third of the sheet), drawn from `input` as buildSet's (plans,
 *  elevations, sections, schedules carry `ref`). → { number, title, items, views: [{ i, kind, ref, box [x0, y0, x1, y1],
 *  ratio, label }], missing: [index of views whose drawing is gone] }. */
/** 0.8 EG.56: where the keynote legend sits on a sheet: a column down the right margin, 66 mm wide (arrangeSheet keeps the views out of it). */
export const LEGEND_W = 70;
export const legendBlock = (paper) => { const [PW, PH] = PAPERS[paper] || PAPERS.tabloid; return { x: PW - 16 - LEGEND_W + 4, y: PH - 22 }; };
export function composeSheet(spec, input, { paper = 'tabloid', units = 'ftin', project = '', date = '' } = {}) {
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  const s = sheet(spec.number || '', spec.title || '', [], { paper, project, date, titleBlock: spec.titleBlockSpec || null, fields: spec.fields || {}, margin: spec.margin ?? null });   // 0.9 SU.1123
  s.views = []; s.missing = [];
  const label = (r) => SCALES[isMetric(units) ? 'mm' : 'ftin'].find((x) => x[0] === r)?.[1] || '1:' + r;   // i18n-ignore: a scale ratio
  const find = (kind, ref) => ((kind === 'plan' ? input.plans : kind === 'rcp' ? input.rcps : kind === 'callout' ? input.callouts : kind === 'elevation' ? input.elevations : kind === 'interior' ? input.interiors : kind === 'section' ? input.sections : input.schedules) || []).find((x) => x.ref === ref);
  const planLike = (kind) => kind === 'plan' || kind === 'rcp' || kind === 'callout';   // 0.6 DC.117: a ceiling plan and a callout draw as a plan
  (spec.views || []).forEach((v, i) => {
    const src = find(v.kind, v.ref);
    if (!src) { s.missing.push(i); return; }
    let w, h, draw, ratio = 0;
    if (v.kind === 'schedule') {
      w = src.document?.width || 130; h = src.document?.height || ROW_H() * (src.rows.length + 1 + (src.total ? 1 : 0));
      draw = (x0, y0) => src.document ? documentItems(src,x0,y0+h) : tableItems(src, x0, y0 + h, w).items;
    } else {
      const bb = planLike(v.kind) ? boundsOfScene(src.scene) : src.view?.bounds ? pad(src.view.bounds, src.view.crop?0:500) : null;
      if (!bb) { s.missing.push(i); return; }
      const W = bb.x1 - bb.x0, H = bb.y1 - bb.y0;
      // 1:ratio as placed; else the view's own scale (0.6 DC.117); else the largest standard scale that fits a third of the sheet
      ratio = v.ratio > 0 ? v.ratio : src.scene?.scale > 0 ? src.scene.scale : src.view?.scale > 0 ? src.view.scale : scaleFor(W, H, [PW / 3, PH / 3], units, isMetric(units) ? 50 : 48).ratio;
      const k = 1 / ratio;
      w = W * k; h = H * k;
      draw = (x0, y0) => { const P = at(k, x0 - bb.x0 * k, y0 - bb.y0 * k); return planLike(v.kind) ? planItems(src.scene, P, k) : viewItems(src.view, P, k); };
    }
    const x0 = v.x - w / 2, y0 = v.y - h / 2;
    s.items.push(...draw(x0, y0));
    if(src.document){
      const prefix=v.ref.split(':')[0]+':',omitted=input.schedules.filter(p=>p.ref.startsWith(prefix)&&!spec.views.some(v=>v.kind==='schedule'&&v.ref===p.ref));
      if(omitted.length)s.items.push({t:'text',s:tr('asched.omitted',{n:omitted.length}),x:x0,y:y0-12,size:8,align:'left'});
    }
    // its title under it, underlined, the scale under that (as the set's cells)
    s.items.push({ t: 'text', s: src.title, x: x0, y: y0 - 6, size: annoPt('title'), align: 'left', bold: true });   // 0.10 BK.10
    s.items.push({ t: 'line', pts: [[x0, y0 - 7], [x0 + Math.min(w, 90), y0 - 7]], w: 0.35, g: 0 });
    if (ratio) s.items.push({ t: 'text', s: label(ratio), x: x0, y: y0 - 10, size: annoPt('title') * 7 / 9, align: 'left', g: 0.25 });
    s.views.push({ i, kind: v.kind, ref: v.ref, box: [x0, y0, x0 + w, y0 + h], ratio, label: ratio ? label(ratio) : '' });
  });
  if (spec.legend?.length) { const at = legendBlock(paper); s.items.push(...legendItems(spec.legend, { ...at, title: spec.legendTitle || 'Keynotes' })); }   // i18n-ignore: the default heading; the editor passes the translated one
  if (spec.notes?.items?.length) {   // 0.10 BK.157: the standard notes go in the same column, under the legend
    const at = legendBlock(paper);
    s.items.push(...notesItems(spec.notes, { x: at.x, y: at.y - (spec.legend?.length ? legendHeight(spec.legend, { title: spec.legendTitle || 'Keynotes' }) + 8 : 0), width: LEGEND_W, size: annoPt('text'), words: { title: tr('sheet.notes.title'), from: (v) => tr(v.unverified ? 'sheet.notes.from.unverified' : 'sheet.notes.from', v) } }));
  }
  return s;
}
/** 0.8 EG.56: "Arrange for me". Picks ONE standard scale for the sheet's drawn views (the largest from the list, but never larger than 1:48 / 1:50, at which every
 *  view fits the free area) and shelf-packs them: tallest first, left to right, each row's views sharing a baseline, a label strip under every view.
 *  Schedules keep their size. → { views (the spec's views with new x, y, ratio), ratio, label, fits, rows }. Nothing is dropped: if even the smallest scale
 *  does not fit, `fits` is false and the views run past the top (the person changes the paper). */
export function arrangeSheet(spec, input, { paper = 'tabloid', units = 'ftin', gap = 8 } = {}) {
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  let left = 16, right = PW - 16 - (spec.legend?.length || spec.notes?.items?.length ? LEGEND_W : 0), bottom = 10 + 18 + 6, top = PH - 14;
  const strip = 14;
  if (spec.titleBlockSpec?.place === 'svg') {   // 0.9 D8.17: the person's own design says where the views go (its drawing-area rectangle, else inside the border)
    const p = parseTitleSvg(spec.titleBlockSpec.svg);
    if (p.ok) { const r = svgTitleItems(p, { PW, PH }).room; left = r[0] + 6; right = r[2] - 6 - (spec.legend?.length || spec.notes?.items?.length ? LEGEND_W : 0); bottom = r[1] + 6; top = r[3] - 4; }
  }
  const list = SCALES[isMetric(units) ? 'mm' : 'ftin'].map(([r, l]) => ({ ratio: r, label: l })).filter((x) => x.ratio >= (isMetric(units) ? 50 : 48)).sort((a, b) => a.ratio - b.ratio);
  const attempt = (ratio) => {
    const v2 = (spec.views || []).map((v) => ({ ...v, ratio: v.kind === 'schedule' ? 0 : ratio }));
    const c = composeSheet({ ...spec, views: v2 }, input, { paper, units });
    const items = c.views.map((x) => ({ i: x.i, w: x.box[2] - x.box[0], h: x.box[3] - x.box[1] })).sort((a, b) => b.h - a.h || a.i - b.i);
    let x = left, y = bottom, rowH = 0, rows = 1;
    for (const it of items) {
      if (x > left && x + it.w > right) { x = left; y += rowH + strip + gap; rowH = 0; rows++; }
      it.x0 = x; it.y0 = y + strip; x += it.w + gap; rowH = Math.max(rowH, it.h);
    }
    const used = y + strip + rowH;
    for (const it of items) { const v = v2[it.i]; v.x = Math.round((it.x0 + it.w / 2) * 10) / 10; v.y = Math.round((it.y0 + it.h / 2) * 10) / 10; }
    return { views: v2, fits: used <= top && items.every((it) => it.w <= right - left), rows };
  };
  let pick = null;
  for (const sc of list) { const r = attempt(sc.ratio); if (r.fits) { pick = { ...r, ratio: sc.ratio, label: sc.label }; break; } }
  if (!pick) { const sc = list[list.length - 1] || { ratio: 100, label: '1:100' }; pick = { ...attempt(sc.ratio), ratio: sc.ratio, label: sc.label }; }
  return pick;
}
/** A sheet with its frame and title block and nothing in it (the caller adds items). */
export const blankSheet = (number, title, opts = {}) => sheet(number, title, [], { paper: 'tabloid', ...opts });
/** One plan on its own sheet; `extra` = more plan points the drawing must take in (what is measured on it). */
export function planSheet(number, title, scene, { paper = 'tabloid', units = 'ftin', project = '', date = '', extra = [] } = {}) {
  let bb = boundsOfScene(scene);
  for (const q of extra) { if (!bb) bb = { x0: q[0] - 1000, y0: q[1] - 1000, x1: q[0] + 1000, y1: q[1] + 1000 }; bb = { x0: Math.min(bb.x0, q[0] - 300), y0: Math.min(bb.y0, q[1] - 300), x1: Math.max(bb.x1, q[0] + 300), y1: Math.max(bb.y1, q[1] + 300) }; }
  if (!bb) return null;
  const c = drawCell(title, bb, units, (P, k) => planItems(scene, P, k), null, isMetric(units) ? 50 : 48);
  const s = sheet(number, title, [c], { paper, project, date });
  s.place = s.views[0].place;
  return s;
}

// ------------------------------------------------------------------------------------------------------------ PDF / SVG
const PT = 72 / 25.4;
const HW = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const textW = (s, size) => { let w = 0; for (const ch of String(s)) { const c = ch.charCodeAt(0); w += c >= 32 && c <= 126 ? HW[c - 32] : 556; } return w / 1000 * size; };
function lit(s) {
  const map = { '²': 0xb2, '³': 0xb3, '°': 0xb0, '×': 0xd7, '—': 0x97, '–': 0x96, '’': 0x92, '“': 0x93, '”': 0x94, '…': 0x85, '½': 0xbd, '¼': 0xbc, '¾': 0xbe };
  let out = '';
  for (const ch of String(s)) {
    let c = map[ch] ?? ch.codePointAt(0);
    if (c > 0xff || (c >= 0x7f && c < 0xa0 && map[ch] === undefined) || c < 0x20) c = 0x3f;
    out += c === 0x28 || c === 0x29 || c === 0x5c ? '\\' + String.fromCharCode(c) : c >= 0x20 && c < 0x7f ? String.fromCharCode(c) : '\\' + c.toString(8).padStart(3, '0');
  }
  return '(' + out + ')';
}
const num = (v) => { const s = (Math.abs(v) < 5e-5 ? 0 : v).toFixed(3); return s.replace(/\.?0+$/, '') || '0'; };
const coord = v => String(Number(v.toFixed(6)));
function pageOps(items, names = new Map()) {
  const ops = ['1 J 1 j'];
  for (const it of items) {
    if (it.t === 'image') { const nm = names.get(it); if (nm) ops.push(PDFI.drawOps({ im: nm.im, gs: nm.gs, cm: PDFI.unitMatrix(it.m, it.w, it.h).map((v) => v * PT) })); continue; }
    if (it.t === 'fill') { ops.push(it.color ? colorRgb(it.color).map(coord).join(' ') + ' rg' : num(it.g) + ' g'); for (const p of it.polys) { p.forEach((q, i) => ops.push(coord(q[0] * PT) + ' ' + coord(q[1] * PT) + (i ? ' l' : ' m'))); ops.push('h'); } ops.push('f*'); }
    else if (it.t === 'line') { ops.push(num(it.w * PT) + ' w ' + (it.color ? colorRgb(it.color).map(coord).join(' ') + ' RG ' : num(it.g || 0) + ' G ') + (it.dash ? '[' + it.dash.map((d) => num(d * PT)).join(' ') + '] 0 d' : '[] 0 d')); it.pts.forEach((q, i) => ops.push(coord(q[0] * PT) + ' ' + coord(q[1] * PT) + (i ? ' l' : ' m'))); ops.push('S'); }
    else if (it.t === 'clip') { const [x0, y0, x1, y1] = it.rect; ops.push('q ' + [x0, y0, x1 - x0, y1 - y0].map((v) => num(v * PT)).join(' ') + ' re W n'); }   // i18n-ignore: PDF operators
    else if (it.t === 'unclip') ops.push('Q');
    else if (it.t === 'text') {
      const w = textW(it.s, it.size), dx = it.align === 'left' ? 0 : it.align === 'right' ? -w : -w / 2, rot = it.rot || 0, c = Math.cos(rot), sn = Math.sin(rot);
      ops.push('BT /' + (it.bold ? 'F2' : 'F1') + ' ' + num(it.size) + ' Tf ' + num(it.g || 0) + ' g ' + [c, sn, -sn, c, it.x * PT + dx * c, it.y * PT + dx * sn].map(num).join(' ') + ' Tm ' + lit(it.s) + ' Tj ET');   // i18n-ignore: PDF text operators
    }
  }
  return ops.join('\n');
}
export function setPdf(sheets, { paper = 'tabloid', title = '', attach = null } = {}) {
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  const enc = (s) => Uint8Array.from(String(s), (c) => c.charCodeAt(0) & 0xff);
  const n = sheets.length, objs = [];
  // 1 catalog, 2 pages, 3 F1, 4 F2, 5 info, then a page + its contents for each sheet, then an attachment's file spec + stream,
  // then (0.8 D8.8 round 5) each picture's image objects and opacity states
  const fsNo = 6 + 2 * n;
  let next = fsNo + (attach ? 2 : 0);
  const names = new Map(), pageRes = [], imgObjs = [];
  sheets.forEach((s, i) => {
    const xo = [], gs = [];
    for (const it of s.items) {
      if (it.t !== 'image' || !it.image) continue;
      const k = imgObjs.length, made = PDFI.imageObjects(it.image, next);
      const nm = { im: 'Im' + k, gs: null };
      xo.push('/' + nm.im + ' ' + next + ' 0 R'); imgObjs.push(...made.objs); next += made.objs.length;
      if ((it.opacity ?? 1) < 1) { nm.gs = 'GS' + k; gs.push('/' + nm.gs + ' ' + next + ' 0 R'); imgObjs.push({ dict: PDFI.gsDict(it.opacity), data: null }); next += 1; }
      names.set(it, nm);
    }
    pageRes[i] = (xo.length ? ' /XObject << ' + xo.join(' ') + ' >>' : '') + (gs.length ? ' /ExtGState << ' + gs.join(' ') + ' >>' : '');
  });
  objs.push('<< /Type /Catalog /Pages 2 0 R' + (attach ? ` /Names << /EmbeddedFiles << /Names [${lit(attach.name)} ${fsNo} 0 R] >> >>` : '') + ' >>');
  objs.push('<< /Type /Pages /Kids [' + sheets.map((_, i) => (6 + 2 * i) + ' 0 R').join(' ') + '] /Count ' + n + ' >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  objs.push('<< /Title ' + lit(title) + ' /Producer (BimCraft) >>');   // i18n-ignore: PDF metadata (the program's name)
  const streams = [], streamHead = [];
  sheets.forEach((s, i) => {
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(PW * PT)} ${num(PH * PT)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>${pageRes[i]} >> /Contents ${7 + 2 * i} 0 R >>`);
    const body = enc(pageOps(s.items, names));
    objs.push(null); streams[objs.length - 1] = body;
  });
  if (attach) {
    objs.push(`<< /Type /Filespec /F ${lit(attach.name)} /UF ${lit(attach.name)} /Desc ${lit(attach.desc || '')} /EF << /F ${fsNo + 1} 0 R >> >>`);
    objs.push(null); streams[objs.length - 1] = attach.bytes;
    streamHead[objs.length - 1] = `/Type /EmbeddedFile /Subtype /${String(attach.mime || 'application/octet-stream').replace(/\//g, '#2F')} /Params << /Size ${attach.bytes.length} >> `;
  }
  for (const o of imgObjs) {
    if (o.data) { objs.push(null); streams[objs.length - 1] = o.data; streamHead[objs.length - 1] = o.dict + ' '; }
    else objs.push(o.dict);
  }
  const parts = [], offs = [];
  let size = 0;
  const put = (b) => { parts.push(b); size += b.length; };
  put(enc('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'));   // i18n-ignore: PDF syntax
  objs.forEach((o, i) => {
    offs.push(size);
    if (o === null) { const b = streams[i]; put(enc(`${i + 1} 0 obj\n<< ${streamHead[i] || ''}/Length ${b.length} >>\nstream\n`)); put(b); put(enc('\nendstream\nendobj\n')); }   // i18n-ignore: PDF syntax
    else put(enc(`${i + 1} 0 obj\n${o}\nendobj\n`));
  });
  const xref = size;
  put(enc(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  const out = new Uint8Array(size);
  let p = 0;
  for (const b of parts) { out.set(b, p); p += b.length; }
  return out;
}
export function sheetSvg(s, { paper = 'tabloid' } = {}) {
  const [PW, PH] = PAPERS[paper] || PAPERS.tabloid;
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const Y = (y) => coord(PH - y), X = coord;
  const grey = (g) => { const v = Math.round((g || 0) * 255); return 'rgb(' + v + ',' + v + ',' + v + ')'; };
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}" width="${PW}mm" height="${PH}mm"><rect width="${PW}" height="${PH}" fill="#fff"/>`];
  let clips = 0;
  for (const it of s.items) {
    if (it.t === 'clip') { const [x0, y0, x1, y1] = it.rect, id = 'cc-crop-' + (clips++); out.push(`<clipPath id="${id}"><rect x="${X(x0)}" y="${Y(y1)}" width="${(x1 - x0).toFixed(2)}" height="${(y1 - y0).toFixed(2)}"/></clipPath><g clip-path="url(#${id})">`); continue; }
    if (it.t === 'unclip') { out.push('</g>'); continue; }
    if (it.t === 'image') { const m = it.m, f = [m[0], -m[1], m[2], -m[3], m[4], PH - m[5]].map(coord).join(' '); out.push(it.href ? `<image href="${it.href}" width="${it.w}" height="${it.h}" opacity="${it.opacity ?? 1}" transform="matrix(${f})"/>` : `<rect width="${it.w}" height="${it.h}" fill="none" stroke="#888" stroke-width="${coord(1 / Math.max(1e-6, Math.abs(m[0])))}" transform="matrix(${f})"/>`); continue; }
    if (it.t === 'fill') out.push(`<path fill-rule="evenodd" fill="${it.color || grey(it.g)}" d="${it.polys.map((p) => 'M' + p.map((q) => X(q[0]) + ',' + Y(q[1])).join('L') + 'Z').join('')}"/>`);
    else if (it.t === 'line') out.push(`<polyline fill="none" stroke="${it.color || grey(it.g)}" stroke-width="${it.w}" stroke-linecap="round" stroke-linejoin="round"${it.dash ? ' stroke-dasharray="' + it.dash.join(' ') + '"' : ''} points="${it.pts.map((q) => X(q[0]) + ',' + Y(q[1])).join(' ')}"/>`);
    else if (it.t === 'text') {
      const anchor = it.align === 'left' ? 'start' : it.align === 'right' ? 'end' : 'middle', rot = -(it.rot || 0) * 180 / Math.PI;
      out.push(`<text x="${X(it.x)}" y="${Y(it.y)}" font-family="Helvetica, Arial, sans-serif" font-size="${(it.size / PT).toFixed(2)}" font-weight="${it.bold ? 700 : 400}" fill="${it.color || grey(it.g)}" text-anchor="${anchor}"${rot ? ` transform="rotate(${rot.toFixed(2)} ${X(it.x)} ${Y(it.y)})"` : ''}>${esc(it.s)}</text>`);
    }
  }
  out.push('</svg>');
  return out.join('');
}

// ------------------------------------------------------------------------------------------------------- section lines
export function readSectionLines(w) {
  const out = [];
  let list = [];
  try { list = ids(w.api, w.mid, 'IFCANNOTATION'); } catch (e) { return out; }
  const so = w.storeyOf();
  for (const id of list) {
    const ps = w.readPset(id, SECTION_PSET);
    if (!ps) continue;
    const l = w.api.GetLine(w.mid, id, false);
    out.push({ id, guid: val(l.GlobalId), storey: so.get(id) ?? null, level: ps.Level || '', name: ps.Name || 'A', a: [Number(ps.AX) * w.unitMm, Number(ps.AY) * w.unitMm], b: [Number(ps.BX) * w.unitMm, Number(ps.BY) * w.unitMm], look: ps.Look === 'right' ? 'right' : 'left', depth: Number(ps.Depth || 0) * w.unitMm, kind: ps.Kind === 'elevation' ? 'elevation' : 'section' });
  }
  return out;
}
/** The plane of a section line: o, the way it looks (unit, horizontal, plan of its level). */
export function sectionDir(sl) {
  const d = [sl.b[0] - sl.a[0], sl.b[1] - sl.a[1]], L = Math.hypot(...d) || 1, u = [d[0] / L, d[1] / L];
  return { o: sl.a, dir: sl.look === 'right' ? [u[1], -u[0]] : [-u[1], u[0]], u };
}
/** What a section line or an elevation marker is called: "Section A", "Elevation 1". */
export const sectionTitle = (sl) => tr(sl?.kind === 'elevation' ? 'res.elv.name' : 'res.sec.name', { name: sl?.name || '' });
/** An elevation marker's point and the way it looks (unit), from its record. */
export function elevationMarkerOf(sl) {
  return { at: [(sl.a[0] + sl.b[0]) / 2, (sl.a[1] + sl.b[1]) / 2], dir: sectionDir(sl).dir };
}
export const ELEVATION_MARK = 500;   // half the length of the line an elevation marker is kept as (mm)
const op = (fn) => (ed) => new ModelWriter(ed.W, ed.api, ed.mid).run(fn);
const fail = (key) => { throw Object.assign(new Error(key), { key }); };
export function placeSectionLine(spec) {
  const s = { look: 'left', depth: 0, kind: 'section', ...spec };
  const elev = s.kind === 'elevation';
  return op((w) => {
    if (Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) < 100) fail('res.err.sectionshort');
    if (!s.guid) s.guid = val(w.guid());
    const storey = w.byGuid(s.level);
    if (!storey) fail('model.err.nolevel');
    if (!s.name && elev) { const have = new Set(readSectionLines(w).filter((x) => x.kind === 'elevation').map((x) => x.name)); let n = 1; while (have.has(String(n))) n++; s.name = String(n); }
    if (!s.name) { const have = new Set(readSectionLines(w).map((x) => x.name)); s.name = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('').find((c) => !have.has(c)) || 'S'; }
    const st = w.api.GetLine(w.mid, storey, false);
    const nm = w.L(sectionTitle(s));
    const id = w.make('IFCANNOTATION', s.guid, w.ownerHistory(), nm, null, w.L(elev ? 'Elevation marker' : 'Section line'), w.H(w.placeAt(st.ObjectPlacement.value, 0, 0, 0, 0)), null, ...(/^IFC4X3/i.test(w.schema || '') ? ['USERDEFINED'] : []));   // i18n-ignore: IFC ObjectType (IFC4X3 adds PredefinedType)
    w.noteGuid(s.guid, id);
    w.contain(id, storey);
    w.upsertPset(id, SECTION_PSET, [['Level', 'IFCIDENTIFIER', s.level], ['Name', 'IFCLABEL', s.name], ['AX', 'IFCLENGTHMEASURE', round(w.u(s.a[0]))], ['AY', 'IFCLENGTHMEASURE', round(w.u(s.a[1]))], ['BX', 'IFCLENGTHMEASURE', round(w.u(s.b[0]))], ['BY', 'IFCLENGTHMEASURE', round(w.u(s.b[1]))], ['Look', 'IFCLABEL', s.look], ['Depth', 'IFCLENGTHMEASURE', round(w.u(s.depth))], ...(elev ? [['Kind', 'IFCLABEL', 'elevation']] : [])]);
    return { id, ids: [id], made: new Map([[s.guid, id]]) };
  });
}
/** An elevation marker at `at` looking towards `toward` (both in the level's plan, mm): the view is what is in front of it. */
export function placeElevationMarker(spec) {
  const d = [spec.toward[0] - spec.at[0], spec.toward[1] - spec.at[1]], L = Math.hypot(...d);
  if (!(L >= 100)) return op(() => fail('res.err.elevationshort'));
  const u = [d[1] / L, -d[0] / L];   // the marker's line runs across the way it looks; "left" of a → b is then that way
  const { at, toward, ...rest } = spec;
  return placeSectionLine({ ...rest, kind: 'elevation', look: 'left', a: [at[0] - u[0] * ELEVATION_MARK, at[1] - u[1] * ELEVATION_MARK], b: [at[0] + u[0] * ELEVATION_MARK, at[1] + u[1] * ELEVATION_MARK] });
}
export function changeSectionLine(guid, ch) {
  return op((w) => {
    const sl = readSectionLines(w).find((x) => x.guid === guid);
    if (!sl) fail('model.err.gone');
    const rows = [];
    if (ch.name && String(ch.name).trim()) { rows.push(['Name', 'IFCLABEL', String(ch.name).trim().slice(0, 8)]); const l = w.touch(sl.id); l.Name = w.L(sectionTitle({ kind: sl.kind, name: String(ch.name).trim().slice(0, 8) })); w.write(l); }
    if (ch.look === 'left' || ch.look === 'right') rows.push(['Look', 'IFCLABEL', ch.look]);
    if (Number.isFinite(ch.depth) && ch.depth >= 0) rows.push(['Depth', 'IFCLENGTHMEASURE', round(w.u(ch.depth))]);
    if (Array.isArray(ch.a)) rows.push(['AX', 'IFCLENGTHMEASURE', round(w.u(ch.a[0]))], ['AY', 'IFCLENGTHMEASURE', round(w.u(ch.a[1]))]);
    if (Array.isArray(ch.b)) rows.push(['BX', 'IFCLENGTHMEASURE', round(w.u(ch.b[0]))], ['BY', 'IFCLENGTHMEASURE', round(w.u(ch.b[1]))]);
    w.upsertPset(sl.id, SECTION_PSET, rows);
    return { id: sl.id, ids: [sl.id] };
  });
}
export function removeSectionLines(guids) {
  return op((w) => {
    const list = readSectionLines(w).filter((x) => guids.includes(x.guid));
    if (list.length) w.dropProduct(list.map((x) => x.id));
    return { id: null, ids: [] };
  });
}
