/* SPDX-License-Identifier: Apache-2.0 */
/**
 * platform-ui.js — house platforms on sloped sites in CivilCraft (0.8 SU.914, lab): the cut and fill map (the plan's Show ›
 * Cut and fill map: cells shaded by depth, a legend, spot levels; and the same colours draped on the 3D view's "Cut and fill"
 * colouring), the Free section tool (a line drawn anywhere → a section through the existing and graded ground for council
 * drawings: SVG and CSV) and the Ramp / sloped pad tool (two clicks and a width → a pad whose corners carry the ramp's levels).
 * The numbers are platform.js (bin/test-civilcraft-platform.mjs); retaining walls with heights read from the ground already
 * come from sides.js (0.7.1 71.22).
 *
 *   createPlatform(ctx) → { ownsTool(t), hints, command(c) → handled, finish(tool, pts) → done, bands() → [{ color, loop }] | null,
 *                           sceneItems(unitPerMm), canvasFor(box, size) → canvas | null }
 *   ctx = { root, el, project: () => Project, units: () => 'ft'|'m'|…, say(msg), setTool(name), download(name, blob), fileStem(),
 *           legend: the plan's legend element, refresh() }
 */

import { t } from './i18n.js';
import { LAYERS } from './scene.js';
import { depthMap, depthClasses, spotLevels, rampPad, freeSection, freeSectionSvg, freeSectionCsv } from './platform.js';

if (!LAYERS.some((l) => l.name === 'C-GRAD-CUTF')) LAYERS.push({ name: 'C-GRAD-CUTF', token: 'major', aci: 8, get label() { return t('sx.su914.layer'); } });

const TOOLS = ['free-section', 'ramp'];
const CUT = ['#fbd3c2', '#f2a487', '#d9684f', '#b0282a'], FILL = ['#cfe3f1', '#8fc0de', '#4a8dc2', '#1f5fa6'], LEVEL = '#e6e6e6';
const shade = (list, k, n) => list[n <= 1 ? list.length - 1 : Math.min(list.length - 1, Math.round((k / (n - 1)) * (list.length - 1)))];
const MAX_CELLS = 60000;

export function createPlatform(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const fx = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '');

  // ---- the map, worked out once per project change
  let cache = null;
  function map() {
    const p = P();
    if (!p.state.display.cutfill) return null;
    const key = p.version + '|' + p.pointsVersion;
    if (cache?.key === key) return cache.value;
    let value = null;
    const eg = p.eg().surface, g = p.graded();
    if (eg && g.surface && g.regions.some(Boolean)) {
      const regions = g.regions.filter(Boolean), bb = g.surface.stats().bounds;
      let cell = Math.max(0.25, Math.sqrt(((bb.maxX - bb.minX) * (bb.maxY - bb.minY)) / MAX_CELLS));
      const m = depthMap(eg, g.surface, { cell, region: regions, maxCells: MAX_CELLS * 4 });
      const classes = depthClasses(m);
      const span = Math.sqrt(regions.reduce((s, r) => s + Math.abs(r.reduce((a, q, i) => a + (q.x * r[(i + 1) % r.length].y - r[(i + 1) % r.length].x * q.y), 0)) / 2, 0)) || 1;
      const step = Math.max(m.cell, niceSpacing(span / 4));
      value = { m, classes, regions, spots: spotLevels(eg, g.surface, { spacing: step, region: regions }), unit: U() };
    }
    cache = { key, value };
    return value;
  }
  const niceSpacing = (v) => { const e = 10 ** Math.floor(Math.log10(v)), f = v / e; return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e; };
  const colorOf = (cl, dz) => {
    const c = cl.classOf(dz);
    if (c === cl.nCut) return LEVEL;
    return c < cl.nCut ? shade(CUT, cl.nCut - 1 - c, cl.nCut) : shade(FILL, c - cl.nCut - 1, cl.nFill);
  };

  /** The plan's bands: one square per cell, and the legend. */
  function bands() {
    const v = map();
    if (!v) return null;
    if (!v.list) v.list = (() => { const h = v.m.cell / 2; return v.m.cells.map((c) => ({ color: colorOf(v.classes, c.dz), loop: [c.x - h, c.y - h, c.x + h, c.y - h, c.x + h, c.y + h, c.x - h, c.y + h] })); })();
    const list = v.list;
    if (ctx.legend) {
      const u = v.unit;
      ctx.legend.replaceChildren(...v.classes.legend.map((l) => el('div', {}, el('span', { className: 'cv-swatch', style: 'background:' + (l.kind === 'level' ? LEVEL : l.kind === 'cut' ? shade(CUT, v.classes.nCut - 1 - v.classes.legend.indexOf(l), v.classes.nCut) : shade(FILL, v.classes.legend.indexOf(l) - v.classes.nCut - 1, v.classes.nFill)) }),
        l.kind === 'level' ? t('sx.su914.legend.level') : t(l.kind === 'cut' ? 'sx.su914.legend.cut' : 'sx.su914.legend.fill', { lo: fx(Math.abs(l.kind === 'cut' ? l.hi : l.lo), 2), hi: fx(Math.abs(l.kind === 'cut' ? l.lo : l.hi), 2), unit: u }))).reverse());
      ctx.legend.hidden = false;
    }
    return list;
  }

  function sceneItems(unitPerMm) {
    const v = map();
    if (!v) return [];
    const out = [];
    for (const s of v.spots) {
      if (!s.extreme && v.spots.length > 30) continue;   // a crowded plan: only the deepest cut and the highest fill
      const text = (s.dz > 0 ? '+' : s.dz < 0 ? '−' : '') + fx(Math.abs(s.dz), 2) + (s.extreme ? ' ▲' : '');
      out.push({ layer: 'C-GRAD-CUTF', kind: 'text', x: s.x, y: s.y, mm: s.extreme ? 2.2 : 1.6, rot: 0, align: 'center', middle: true, text });
    }
    return out;
  }

  /** The map as a picture over `box` (project coordinates) for the 3D view: cells coloured, the rest light grey. */
  function canvasFor(box, size = 2048) {
    const v = map() || (() => { const keep = P().state.display.cutfill; return keep ? null : forcedMap(); })();
    if (!v) return null;
    const W = box.maxX - box.minX, H = box.maxY - box.minY, k = size / Math.max(W, H);
    const cv = document.createElement('canvas'); cv.width = Math.max(2, Math.round(W * k)); cv.height = Math.max(2, Math.round(H * k));
    const c = cv.getContext('2d');
    c.fillStyle = '#d8d8d8'; c.fillRect(0, 0, cv.width, cv.height);
    const h = v.m.cell / 2;
    for (const q of v.m.cells) { c.fillStyle = colorOf(v.classes, q.dz); c.fillRect((q.x - h - box.minX) * k, (box.maxY - (q.y + h)) * k, v.m.cell * k + 1, v.m.cell * k + 1); }
    return cv;
  }
  function forcedMap() {   // the 3D view asks even when the plan's switch is off
    const p = P(), d = p.state.display, was = d.cutfill;
    d.cutfill = true; cache = null;
    const v = map();
    d.cutfill = was; cache = null;
    return v;
  }

  // ---- tools
  function btn(label, fn, data) { return el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data]: '', onclick: fn }, label); }
  function dialog(title, body, foot, data) {
    const did = 'cv-pf-' + Math.random().toString(36).slice(2, 8);
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sx.su957.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': did, [data]: '' },
      el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did }, title), close), el('div', { className: 'cv-dlg-body' }, body),
        el('div', { className: 'cv-dlg-foot' }, ...foot, btn(t('sx.su957.close'), () => dlg.close(), 'data-pf-close'))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => dlg.remove());
    ctx.root.append(dlg);
    dlg.showModal();
    return dlg;
  }

  function freeSectionDialog(line, saved = null) {
    const p = P(), eg = p.eg().surface, g = p.graded();
    if (!eg) { ctx.say(t('sx.su914.need.ground')); return; }
    const sec = freeSection(eg, g.surface || null, line, { regions: g.surface ? g.regions.filter(Boolean) : null });
    if (!sec.ground.length) { ctx.say(t('sx.su914.sec.off')); return; }
    const vex = el('select', { className: 'cv-select', 'data-pf-vex': '' }, el('option', { value: '0' }, t('sx.su914.sec.vex.fit')), ...[1, 2, 5, 10].map((x) => el('option', { value: String(x) }, t('v3d.exag.opt', { x }))));
    const holder = el('div', { className: 'cv-pf-section', 'data-pf-section': '' });
    const draw = () => { holder.innerHTML = freeSectionSvg(sec, { t, units: U(), vexag: Number(vex.value) || 0 }); };   // eslint-disable-line no-unsanitized/property -- our own SVG: numbers and our strings, escaped in freeSectionSvg
    vex.onchange = draw;
    draw();
    const stem = () => (ctx.fileStem?.() || 'civilcraft') + '-section';
    const nm = el('input', { type: 'text', className: 'cv-input', value: saved ? saved.name : t('sx.su914.line.default', { n: (p.state.sectionLines || []).length + 1 }), maxLength: 80, 'data-pf-name': '' });
    const keep = () => {
      const name = nm.value.trim() || t('sx.su914.line.default', { n: (p.state.sectionLines || []).length + 1 });
      if (saved) { p.change(t('sx.su914.line.undo.rename', { name }), (st) => { const l = (st.sectionLines || []).find((x) => x.id === saved.id); if (l) l.name = name; }); ctx.say(t('sx.su914.line.saved', { name })); return; }
      const id = p.nextId('sl');
      p.change(t('sx.su914.line.undo.add', { name }), (st) => { (st.sectionLines ||= []).push({ id, name, line: line.map((q) => ({ x: q.x, y: q.y })) }); });
      saved = { id, name, line }; ctx.say(t('sx.su914.line.saved', { name })); ctx.redraw?.();
    };
    dialog(t('sx.su914.sec.head'), [el('p', { className: 'cv-note' }, t('sx.su914.sec.note', { cut: fx(sec.cut), fill: fx(sec.fill), unit: U() + '²' })),
      el('label', {}, t('sx.su914.sec.vex'), ' ', vex), holder, el('label', {}, t('sx.su914.line.name'), ' ', nm)],
    [btn(t('sx.su914.line.save'), keep, 'data-pf-save-line'), btn(t('sx.su914.sec.svg'), () => { ctx.download(stem() + '.svg', new Blob([freeSectionSvg(sec, { t, units: U(), vexag: Number(vex.value) || 0 })], { type: 'image/svg+xml' })); ctx.say(t('sx.su957.saved')); }, 'data-pf-svg'),
      btn(t('sx.su914.sec.csv'), () => { ctx.download(stem() + '.csv', new Blob(['﻿' + freeSectionCsv(sec, { units: U(), t })], { type: 'text/csv' })); ctx.say(t('sx.su957.saved')); }, 'data-pf-csv')], 'data-pf-dialog');
    ctx.say(t('sx.su914.sec.done', { cut: fx(sec.cut), fill: fx(sec.fill), unit: U() + '²' }));
  }

  function rampDialog(a, b) {
    const p = P(), eg = p.eg().surface;
    const za = eg?.elevationAt(a.x, a.y), L = Math.hypot(b.x - a.x, b.y - a.y);
    const num = (v, data) => el('input', { type: 'number', step: 'any', value: String(v), [data]: '' });
    const w = num(U() === 'm' ? 3 : 10, 'data-pf-width'), z0 = num(za === null || za === undefined ? 0 : +za.toFixed(3), 'data-pf-z0'), g = num(8, 'data-pf-grade');
    const out = el('p', { className: 'cv-note', role: 'status' });
    const upd = () => { const r = rampPad(a, b, Number(z0.value), Number(z0.value) + Number(g.value) / 100 * L, Number(w.value)); out.textContent = r.ok ? t('sx.su914.ramp.sum', { len: fx(L), z1: fx(Number(z0.value) + Number(g.value) / 100 * L), unit: U() }) : t('sx.su914.ramp.bad'); return r; };
    for (const i of [w, z0, g]) i.oninput = upd;
    upd();
    const lab = (txt, i) => el('label', { className: 'cv-field' }, txt, ' ', i);
    const dlg = dialog(t('sx.su914.ramp.head'), [el('p', { className: 'cv-note' }, t('sx.su914.ramp.lede')), lab(t('sx.su914.ramp.width', { unit: U() }), w), lab(t('sx.su914.ramp.z0', { unit: U() }), z0), lab(t('sx.su914.ramp.grade'), g), out],
      [btn(t('sx.su914.ramp.make'), () => {
        const r = upd();
        if (!r.ok) return;
        const id = p.nextId('p'), n = p.state.pads.length + 1, zmid = (r.pts[0].z + r.pts[1].z) / 2;
        p.change(t('sx.su914.ramp.undo'), (st) => st.pads.push({ id, name: t('sx.su914.ramp.name', { n }), pts: r.pts.map((q) => ({ x: q.x, y: q.y, z: q.z })), z: zmid, cut: 2, fill: 2 }));
        ctx.say(t('sx.su914.ramp.made', { grade: fx(r.grade * 100, 1) }));
        dlg.close(); ctx.refresh();
      }, 'data-pf-make')], 'data-pf-ramp');
  }

  function finish(tool, pts) {
    if (pts.length < 2) { ctx.say(t('sx.su914.need.two')); return false; }
    if (tool === 'free-section') { freeSectionDialog(pts.map((q) => ({ x: q.x, y: q.y }))); return true; }
    if (tool === 'ramp') { rampDialog(pts[0], pts[pts.length - 1]); return true; }
    return false;
  }
  /** The saved free-section lines: open, rename (inside), remove. */
  function linesDialog() {
    const p = P(), lines = p.state.sectionLines || [];
    const rows = lines.map((l) => el('li', { 'data-pf-line': l.id },
      el('span', {}, l.name + ' — ' + fx(lineLen(l.line), 1) + ' ' + U()), ' ',
      btn(t('sx.su914.line.open'), () => { dlg.close(); freeSectionDialog(l.line, l); }, 'data-pf-line-open'),
      btn(t('sx.su914.line.remove'), () => { p.change(t('sx.su914.line.undo.del', { name: l.name }), (st) => { st.sectionLines = (st.sectionLines || []).filter((x) => x.id !== l.id); if (!st.sectionLines.length) delete st.sectionLines; }); dlg.close(); ctx.redraw?.(); linesDialog(); }, 'data-pf-line-remove')));
    const dlg = dialog(t('sx.su914.line.head'), [lines.length ? el('ul', { className: 'cv-plainlist' }, ...rows) : el('p', { className: 'cv-muted', 'data-pf-line-none': '' }, t('sx.su914.line.none'))], [], 'data-pf-lines');
  }
  const lineLen = (pts) => pts.reduce((a, q, i) => (i ? a + Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) : 0), 0);
  /** The saved lines on the plan: dashed, with their names at the start. */
  function overlay(c2d, S, C) {
    const ls = P().state.sectionLines || [];
    if (!ls.length) return;
    c2d.save(); c2d.strokeStyle = C.action; c2d.fillStyle = C.action; c2d.lineWidth = 1.25; c2d.setLineDash([6, 4]); c2d.font = '11px sans-serif';   // i18n-ignore: canvas font
    for (const l of ls) {
      c2d.beginPath(); l.line.forEach((q, i) => { const a = S(q.x, q.y); i ? c2d.lineTo(a.x, a.y) : c2d.moveTo(a.x, a.y); }); c2d.stroke();
      const a = S(l.line[0].x, l.line[0].y); c2d.fillText(l.name, a.x + 4, a.y - 4);
    }
    c2d.restore();
  }
  function command(c) {
    if (c === 'section-lines') { linesDialog(); return true; }
    if (TOOLS.includes(c)) { ctx.setTool(c); return true; }
    return false;
  }
  return { ownsTool: (tl) => TOOLS.includes(tl), hints: { 'free-section': 'sx.su914.hint.section', ramp: 'sx.su914.hint.ramp' }, command, finish, bands, sceneItems, canvasFor, map, overlay };
}
