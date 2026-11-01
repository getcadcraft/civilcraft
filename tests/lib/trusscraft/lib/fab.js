/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fab.js — pre-fab shop outputs of a truss design (DOM-free; pure; mm).
 *   jigSvg(d, { title, plates }) → string   a jig / assembly layout of ONE truss drawn 1:1: the SVG has a physical size in millimetres, so printed at
 *                                           100 % every member outline, every plate rectangle and every cut angle is life size. Member marks, node
 *                                           numbers, plate ids (placeholder or yours), the panel-point dimensions along the bottom and a cut table.
 *   stockItems(layout, designs) → [{ key, label, design, qty }]   the distinct designs of a set with how many trusses each stands for (or one design alone)
 *   stockPlan(items, { lengths: [mm…], kerf }) → { bars, groups, csv, unplaced, bars_n, wastePct, optimal }   the cut pieces nested onto stock lengths with
 *                                           lib/cutlist/bars.js (1-D cutting; reused, not forked), one run per sawn size
 *   stockCsv(plan) → CSV text
 * The cut length is the cutList() length (long point to long point), the end angles are its plumb / butt cuts.
 */
import { t, csv } from './core.js';
import { sizeById, PLATES } from './tables.js';
import { cutList, jointSchedule } from './cutlist.js';
import { optimizeGroups, expandPieces } from './cutlist/bars.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f = (v) => Math.round(v * 10) / 10;
const groupOf = (r) => (r === 'tail' ? 'top' : r === 'post' || r === 'stub' ? 'web' : r);

export function jigSvg(d, { title = '', plates = null } = {}) {
  const g = d.g, raise = d.heel ? d.heel.raise || 0 : 0;
  const xs = g.nodes.map((n) => n.x), zs = g.nodes.map((n) => n.z + raise);
  const pad = 150, tableW = 2400;
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, zlo = Math.min(0, ...zs) - 200, zhi = Math.max(...zs) + 300;
  const W = x1 - x0 + tableW, H = zhi - zlo + 500;
  const X = (x) => f(x - x0), Z = (z) => f(zhi - z);
  const out = [];
  const rows = cutList(g, d.sizes, { stock: 1e9 }), js = jointSchedule(g, d.sizes, d.res, plates);
  for (const m of g.members) {
    const a = g.nodes[m.a], b = g.nodes[m.b], size = sizeById(d.sizes[groupOf(m.role)]) || sizeById('2x4');
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), nx = -dz / L * size.d / 2, nz = dx / L * size.d / 2;
    const pts = [[a.x + nx, a.z + nz], [b.x + nx, b.z + nz], [b.x - nx, b.z - nz], [a.x - nx, a.z - nz]].map((p) => X(p[0]) + ',' + Z(p[1] + raise)).join(' ');
    out.push(`<polygon points="${pts}" fill="#f3e6cf" stroke="#222" stroke-width="2"/>`);
    out.push(`<text x="${X((a.x + b.x) / 2)}" y="${Z((a.z + b.z) / 2 + raise)}" font-size="46" text-anchor="middle" fill="#222" transform="rotate(${f(-Math.atan2(dz, dx) * 180 / Math.PI)} ${X((a.x + b.x) / 2)} ${Z((a.z + b.z) / 2 + raise)})">${esc(m.mark || '')}</text>`);
  }
  // plates: a rectangle centred on each joint that has one (the plate id says whose table it is)
  const pl = (plates && plates.list && plates.list.length ? plates.list : PLATES);
  for (const j of js) {
    const p = pl.find((q) => q.id === j.plate);
    if (!p) continue;
    const n = g.nodes[j.node];
    out.push(`<rect x="${X(n.x - p.w / 2)}" y="${Z(n.z + raise + p.h / 2)}" width="${p.w}" height="${p.h}" fill="none" stroke="#c00" stroke-width="1.5" stroke-dasharray="14 8"/>`);
    out.push(`<text x="${X(n.x)}" y="${Z(n.z + raise - p.h / 2) + 34}" font-size="30" text-anchor="middle" fill="#c00">${esc(j.plate)}</text>`);
  }
  for (const n of g.nodes) out.push(`<circle cx="${X(n.x)}" cy="${Z(n.z + raise)}" r="5" fill="#06c"/><text x="${X(n.x) + 10}" y="${Z(n.z + raise) - 10}" font-size="28" fill="#06c">${n.id + 1}</text>`);
  // panel-point dimensions along the bottom
  const bx = [...new Set(g.nodes.filter((n) => Math.abs(n.z) < 1e-6 || n.z === Math.min(...g.nodes.map((q) => q.z))).map((n) => Math.round(n.x * 10) / 10))].sort((a, b) => a - b);
  const yd = Z(zlo + 80);
  for (let i = 0; i + 1 < bx.length; i++) out.push(`<line x1="${X(bx[i])}" y1="${yd}" x2="${X(bx[i + 1])}" y2="${yd}" stroke="#06c" stroke-width="2"/><text x="${X((bx[i] + bx[i + 1]) / 2)}" y="${yd - 12}" font-size="34" text-anchor="middle" fill="#06c">${Math.round(bx[i + 1] - bx[i])}</text>`);
  out.push(`<text x="${X(g.span / 2)}" y="${yd + 50}" font-size="38" text-anchor="middle" fill="#06c">${esc(t('dwg.span'))} ${Math.round(g.span)} mm</text>`);
  // cut table at the right
  const tx = x1 - x0 + 120;
  out.push(`<text x="${tx}" y="60" font-size="44" font-weight="bold">${esc(title || t('fab.jig.title', { type: g.type }))}</text>`);
  out.push(`<text x="${tx}" y="120" font-size="30" fill="#900">${esc(t('label.notdesign'))}</text>`);
  out.push(`<text x="${tx}" y="170" font-size="30">${esc(t('fab.jig.scale'))}</text>`);
  out.push(`<text x="${tx}" y="230" font-size="32" font-weight="bold">${esc(t('fab.jig.cuts'))}</text>`);
  rows.forEach((r, i) => out.push(`<text x="${tx}" y="${280 + i * 40}" font-size="28">${esc(`${r.mark}  ${r.size}  ${r.cutLen} mm  ${r.cutA}° / ${r.cutB}°${r.notes ? '  ' + r.notes : ''}`)}</text>`));
  out.push(`<rect x="0" y="0" width="100" height="0" fill="none"/>`);   // keeps the viewBox honest for empty tables
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" width="${f(W)}mm" height="${f(H)}mm" role="img" aria-label="${esc(title || t('fab.jig.title', { type: g.type }))}" font-family="sans-serif">${out.join('')}</svg>`;
}

export function stockItems(layout, designs) {
  const items = [];
  if (layout && layout.groups && designs) for (const gr of layout.groups) { const d = designs.get ? designs.get(gr.key) : null; if (d && d.ok) items.push({ key: gr.key, label: gr.key, design: d, qty: gr.ids.length }); }
  return items;
}

export function stockPlan(items, { lengths = [6000], kerf = 3 } = {}) {
  const pieces = [];
  for (const it of items) {
    for (const r of cutList(it.design.g, it.design.sizes, { stock: 1e9 })) {
      const size = sizeById(r.size) || sizeById('2x4');
      pieces.push({ id: `${it.label}:${r.mark}`, length: r.cutLen, qty: it.qty, cuts: [90 - r.cutA, 90 - r.cutB], depth: size.d, group: r.size });
    }
  }
  const stock = lengths.filter((n) => n > 0).sort((a, b) => a - b).map((length) => ({ length }));
  const res = optimizeGroups(expandPieces(pieces), { stock: { '*': stock.length ? stock : [{ length: 6000 }] }, kerf });
  const rows = [['size', 'bar', 'stock mm', 'piece', 'length mm', 'angle A', 'angle B', 'position mm']];
  const unplaced = [];
  for (const gp of res.groups) {
    for (const b of gp.bars) for (const p of b.pieces) rows.push([gp.group, b.no, b.stock, p.pieceId, p.length, p.cuts[0], p.cuts[1], Math.round(p.pos)]);
    for (const u of gp.unplaced || []) unplaced.push({ size: gp.group, id: u.pieceId || u.id, length: u.length });
  }
  return { ...res, unplaced, csv: csv(rows), pieces: pieces.length };
}
