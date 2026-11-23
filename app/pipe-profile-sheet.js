/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipe-profile-sheet.js — 0.11 SU.1937: a pipe run's profile (pipe-profile.js) as one drawing sheet, and that sheet as SVG.
 * The sheet is plot.js's own shape ({ w, h, name, views: [{ clip, strokes, texts }], chrome, chromeTexts }, millimetres, y up), so
 * plot.js toPdfPages writes the PDF; sheetSvg writes the SVG. No DOM.
 *
 *   pipeProfileSheet(prof, { paper, landscape, units, title, name, vex }) → { sheet, vex, notes }
 *     ground dashed grey; crown and invert as lines with the pipe's two walls between them; each manhole as a box from its rim down to its sump,
 *     named, with the rim and the lowest invert written; each pipe labelled with its length, size and slope; the HGL dashed when the profile has it.
 *     vex = the vertical exaggeration used (the sheet says it).
 *   sheetSvg(sheet) → text   (one <svg>, in millimetres)
 */
import { t } from './i18n.js';
import { MARGIN, TITLE_H, orient, paperBy } from './plot.js';
import { formatStation, fixed, pct } from './units.js';
import { escXml as esc } from './util.js';   // shared helpers (0.11 PERF.74; tools/perf/util-copies.mjs)

const INK = '#000000', GROUND = '#606060', PIPE = '#c00000', HGL = '#1e48c8', GRID = '#b8b8b8';
const STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

export function pipeProfileSheet(prof, { paper = 'a3', landscape = true, units = 'ft', title = '', name = '' } = {}) {
  const P = orient(paperBy(paper), landscape), notes = [];
  const VW = { x0: MARGIN + 20, x1: P.w - MARGIN - 20, y0: MARGIN + TITLE_H + 14, y1: P.h - MARGIN - 14 };
  const zs = [];
  for (const q of [...prof.ground, ...prof.crown, ...prof.invert, ...(prof.hgl || [])]) if (Number.isFinite(q.z)) zs.push(q.z);
  for (const s of prof.structs) for (const v of [s.rim, s.floor]) if (Number.isFinite(v)) zs.push(v);
  const zLo = Math.min(...zs), zHi = Math.max(...zs), span = Math.max(zHi - zLo, 1e-6);
  const s = (VW.x1 - VW.x0) / Math.max(prof.length, 1e-6), sv = (VW.y1 - VW.y0 - 16) / (span * 1.12), vex = sv / s;
  const X = (sta) => VW.x0 + sta * s, Y = (z) => VW.y0 + 8 + (z - zLo) * sv;
  const strokes = [], texts = [];
  const sStep = STEPS.find((v) => v * s >= 14) || 1000, zStep = STEPS.find((v) => v * sv >= 7) || 1000;
  for (let st = 0; st <= prof.length + 1e-9; st += sStep) {
    strokes.push({ color: GRID, width: 0.1, pts: [{ x: X(st), y: VW.y0 }, { x: X(st), y: VW.y1 }] });
    texts.push({ color: INK, x: X(st), y: VW.y0 - 4, h: 1.8, rot: 0, align: 'center', text: formatStation(st, units, 0) });
  }
  for (let z = Math.ceil(zLo / zStep) * zStep; Y(z) <= VW.y1; z += zStep) {
    strokes.push({ color: GRID, width: 0.1, pts: [{ x: VW.x0, y: Y(z) }, { x: VW.x1, y: Y(z) }] });
    const lbl = fixed(z, zStep < 1 ? 1 : 0).replace(/,/g, '');
    texts.push({ color: INK, x: VW.x0 - 1.5, y: Y(z), h: 1.8, rot: 0, align: 'right', middle: true, text: lbl }, { color: INK, x: VW.x1 + 1.5, y: Y(z), h: 1.8, rot: 0, align: 'left', middle: true, text: lbl });
  }
  strokes.push({ color: INK, width: 0.35, closed: true, pts: [{ x: VW.x0, y: VW.y0 }, { x: VW.x1, y: VW.y0 }, { x: VW.x1, y: VW.y1 }, { x: VW.x0, y: VW.y1 }] });
  // ground, in runs (gaps where off the surface)
  let run = [];
  const flush = () => { if (run.length >= 2) strokes.push({ color: GROUND, width: 0.3, dash: [2, 1], pts: run }); run = []; };
  for (const q of prof.ground) { if (!Number.isFinite(q.z)) { flush(); continue; } run.push({ x: X(q.sta), y: Y(q.z) }); }
  flush();
  for (const p of prof.pipes) {
    const a = { x: X(p.sta0), y0: Y(p.invUp), y1: Y(p.invUp + p.D) }, b = { x: X(p.sta1), y0: Y(p.invDn), y1: Y(p.invDn + p.D) };
    strokes.push({ color: PIPE, width: 0.5, pts: [{ x: a.x, y: a.y0 }, { x: b.x, y: b.y0 }] }, { color: PIPE, width: 0.5, pts: [{ x: a.x, y: a.y1 }, { x: b.x, y: b.y1 }] });
    const m = (p.sta0 + p.sta1) / 2, ym = (Y(p.invUp) + Y(p.invDn)) / 2 - 2.8, ang = Math.atan2((b.y0 - a.y0), (b.x - a.x));
    const dia = units === 'm' ? fixed(p.dia, 0) + ' mm' : fixed(p.dia, 0) + ' in';
    texts.push({ color: PIPE, x: X(m), y: ym, h: 1.8, rot: ang, align: 'center', text: t('pps.pipe', { len: fixed(p.len, 1), dia, slope: p.slope === null ? '—' : pct(p.slope) }) });
    if (p.cover !== null && Number.isFinite(p.cover)) texts.push({ color: INK, x: X(m), y: Math.max(Y(p.invUp + p.D), Y(p.invDn + p.D)) + 2.2, h: 1.5, rot: 0, align: 'center', text: t('pps.cover', { cover: fixed(p.cover, 2) }) });
  }
  if (prof.hgl) strokes.push({ color: HGL, width: 0.4, dash: [3, 1], pts: prof.hgl.map((q) => ({ x: X(q.sta), y: Y(q.z) })) });
  for (const st of prof.structs) {
    const D = (Number(st.dia) || 0) / (units === 'm' ? 1000 : 12), w = Math.max(1.6, D * s) / 2;
    if (Number.isFinite(st.rim) && Number.isFinite(st.floor)) {
      strokes.push({ color: INK, width: 0.4, closed: true, pts: [{ x: X(st.sta) - w, y: Y(st.rim) }, { x: X(st.sta) - w, y: Y(st.floor) }, { x: X(st.sta) + w, y: Y(st.floor) }, { x: X(st.sta) + w, y: Y(st.rim) }] });
      texts.push({ color: INK, x: X(st.sta), y: Y(st.rim) + 2.2, h: 1.9, rot: 0, align: 'center', text: st.name });
      texts.push({ color: INK, x: X(st.sta), y: Y(st.rim) + 4.6, h: 1.5, rot: 0, align: 'center', text: t('pps.rim', { rim: fixed(st.rim, 2) }) });
      texts.push({ color: INK, x: X(st.sta), y: Y(st.floor) - 2.4, h: 1.5, rot: 0, align: 'center', text: t('pps.sump', { z: fixed(st.floor, 2) }) });
    } else notes.push(t('pps.norim', { name: st.name }));
    const inv = Number.isFinite(st.invOut) ? st.invOut : st.invIn[0]?.inv;
    if (Number.isFinite(inv)) texts.push({ color: PIPE, x: X(st.sta) + (st.invOut === null ? -w - 1 : w + 1), y: Y(inv) - 0.8, h: 1.5, rot: 0, align: st.invOut === null ? 'right' : 'left', text: t('pps.inv', { z: fixed(inv, 2) }) });
  }
  const pv = { strokes, texts, clip: { x0: VW.x0 - 15, y0: VW.y0 - 8, x1: VW.x1 + 15, y1: VW.y1 + 12 } };
  const chrome = [{ color: INK, width: 0.5, closed: true, pts: [{ x: MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: P.h - MARGIN }, { x: MARGIN, y: P.h - MARGIN }] },
    { color: INK, width: 0.35, pts: [{ x: MARGIN, y: MARGIN + TITLE_H }, { x: P.w - MARGIN, y: MARGIN + TITLE_H }] }];
  const first = prof.structs[0]?.name || '', last = prof.structs[prof.structs.length - 1]?.name || '';
  const tt = [{ color: INK, x: MARGIN + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'left', text: title || t('pps.title', { name }) },
    { color: INK, x: MARGIN + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'left', text: t('pps.strip', { from: first, to: last, len: fixed(prof.length, 1), vex: +vex.toFixed(1), h: units === 'm' ? '1:' + Math.round(1000 / s) : '1" = ' + +(25.4 / s).toFixed(0) + "'" }) },
    { color: INK, x: P.w - MARGIN - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'right', text: t('pp.made', { date: new Date().toISOString().slice(0, 10) }) }];
  return { sheet: { w: P.w, h: P.h, name: (title || name) || t('pps.title', { name }), views: [pv], chrome, chromeTexts: tt }, vex, notes };
}

export function sheetSvg(sheet) {
  const H = sheet.h, f = (n) => +n.toFixed(3);
  const pl = (st) => `<${st.closed ? 'polygon' : 'polyline'} points="${st.pts.map((p) => f(p.x) + ',' + f(H - p.y)).join(' ')}" fill="none" stroke="${st.color || '#000'}" stroke-width="${f(st.width || 0.25)}"${st.dash ? ` stroke-dasharray="${st.dash.join(' ')}"` : ''} stroke-linejoin="round"/>`;
  const tx = (q) => `<text x="${f(q.x)}" y="${f(H - q.y)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(q.h)}" fill="${q.color || '#000'}" text-anchor="${q.align === 'right' ? 'end' : q.align === 'center' ? 'middle' : 'start'}"${q.middle ? ' dominant-baseline="central"' : ''}${q.rot ? ` transform="rotate(${f((-q.rot * 180) / Math.PI)} ${f(q.x)} ${f(H - q.y)})"` : ''}>${esc(q.text)}</text>`;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${sheet.w}mm" height="${sheet.h}mm" viewBox="0 0 ${sheet.w} ${sheet.h}"><rect width="${sheet.w}" height="${sheet.h}" fill="#fff"/>`];
  for (const v of sheet.views) {
    const c = v.clip, id = 'c' + out.length;
    if (c) out.push(`<clipPath id="${id}"><rect x="${f(c.x0)}" y="${f(H - c.y1)}" width="${f(c.x1 - c.x0)}" height="${f(c.y1 - c.y0)}"/></clipPath><g clip-path="url(#${id})">`);
    for (const st of v.strokes || []) out.push(pl(st));
    for (const q of v.texts || []) out.push(tx(q));
    if (c) out.push('</g>');
  }
  for (const st of sheet.chrome || []) out.push(pl(st));
  for (const q of sheet.chromeTexts || []) out.push(tx(q));
  out.push('</svg>');
  return out.join('\n');
}
