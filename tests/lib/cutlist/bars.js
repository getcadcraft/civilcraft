/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bars.js — one-dimensional cutting: pieces of profile cut from stock bars (0.8 SU.874, session `fab-08`; the window builder's
 * profiles, any bar, tube or moulding). DOM-free and import-free. Canonical in lib/cutlist; copies by `node tools/cutlist/sync.mjs`.
 * Units are the caller's (mm or inches).
 *
 * A piece: { id, length (the longest edge, mitres included), qty = 1, cuts: [a, b] (end angles in degrees, 90 = square, 45 = mitre;
 *   default [90, 90]), depth (the profile's face width: what a shared mitre saves), group (the profile + colour it is cut from) }.
 *
 *   expandPieces(pieces) → one entry per piece { ...piece, copy, pieceId }
 *   mitreEnds(piece) → 0 | 1 | 2   how many ends are cut at an angle other than 90°
 *   packBars(pieces, { length, kerf = 0, trimStart = 0, trimEnd = 0, share = false, nodeLimit = 200000 }) →
 *       { bars: [{ items: [index into pieces], used }], optimal, bound, nodes }
 *     pieces already expanded, one stock length. Heuristics first (first-fit and best-fit, longest first), then an exact search
 *     (depth-first, bars never exceed the best count found, equal bars tried once) within `nodeLimit`; `optimal` is true when the
 *     result equals the lower bound or the search finished. `share`: mitred ends that meet are one cut, which saves `depth` once
 *     for each such pair (see barUsed); it is a way of sawing (the operator flips every other piece), so it is off by default.
 *   barUsed(items, { kerf, share }) → length one bar takes: Σ (length + kerf) − depth × shared cuts
 *   optimizeBars(pieces, { stock: [{ length, qty = Infinity }] | length, kerf, trimStart, trimEnd, share, nodeLimit }) →
 *       { bars: [{ no, stock, length, pieces: [{ pieceId, id, length, cuts, pos }], used, waste, offcut }], unplaced: [piece], bars_n,
 *         pieceLength, stockLength, waste, wastePct, optimal }
 *     several stock lengths: bars are opened at the shortest length that holds the piece and each closed bar is changed to the
 *     shortest stock length that still holds what is on it, while that length lasts. `pos` = where the piece starts on the bar
 *     (after trimStart; pieces in cutting order). `offcut` = what is left past the last cut.
 *   optimizeGroups(pieces, opts) → { groups: [{ group, ...optimizeBars }], bars_n, pieceLength, stockLength, waste, wastePct }
 *     one optimisation per `group`; opts.stock may be an object { group: stock | length } with '*' as the default.
 *   barsCsv(result, { head }) → CSV: one row per piece on a bar (group, bar no, stock length, piece id, length, angles, position)
 */

const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const r6 = (v) => { const r = Math.round(v * 1e6) / 1e6; return Object.is(r, -0) ? 0 : r; };

export function expandPieces(list) {
  const out = [];
  for (const p of list || []) {
    if (!p || typeof p !== 'object') continue;
    const length = num(p.length);
    if (!(length > 0)) continue;
    const qty = Math.max(1, Math.min(10000, Math.round(num(p.qty, 1))));
    const cuts = Array.isArray(p.cuts) && p.cuts.length === 2 ? [num(p.cuts[0], 90), num(p.cuts[1], 90)] : [90, 90];
    for (let c = 1; c <= qty; c++) out.push({ ...p, length, cuts, depth: Math.max(0, num(p.depth)), group: p.group ?? '', copy: c, pieceId: qty > 1 ? p.id + '.' + c : String(p.id) });
  }
  return out;
}
export const mitreEnds = (p) => (p.cuts || [90, 90]).filter((a) => Math.abs(num(a, 90) - 90) > 1e-9).length;

/** The length a bar takes. Mitres that meet share one cut: min(⌊mitred ends / 2⌋, mitred pieces − 1) pairs, each saves the profile depth. */
export function barUsed(items, { kerf = 0, share = false } = {}) {
  let sum = 0, M = 0, nm = 0, depth = Infinity;
  for (const p of items) {
    sum += p.length + kerf;
    const m = mitreEnds(p);
    if (m) { M += m; nm++; depth = Math.min(depth, p.depth || 0); }
  }
  if (!share || nm < 2) return r6(sum);
  return r6(sum - depth * Math.min(Math.floor(M / 2), nm - 1));
}

function heuristic(order, usable, opt, best) {
  // first-fit and best-fit over the given order
  const run = (pick) => {
    const bars = [];
    for (const i of order) {
      let at = -1, score = Infinity;
      for (let b = 0; b < bars.length; b++) {
        const u = barUsed([...bars[b].items.map((k) => opt.pieces[k]), opt.pieces[i]], opt);
        if (u <= usable + 1e-9) { if (pick === 'first') { at = b; break; } if (usable - u < score) { score = usable - u; at = b; } }
      }
      if (at < 0) bars.push({ items: [i] }); else bars[at].items.push(i);
    }
    return bars;
  };
  for (const pick of ['first', 'best']) { const r = run(pick); if (!best || r.length < best.length) best = r; }
  return best;
}

export function packBars(pieces, { length, kerf = 0, trimStart = 0, trimEnd = 0, share = false, nodeLimit = 200000 } = {}) {
  const usable = num(length) - trimStart - trimEnd;
  const opt = { pieces, kerf, share };
  const fits = (i) => pieces[i].length + kerf <= usable + 1e-9;
  const idx = pieces.map((_, i) => i).filter(fits).sort((a, b) => pieces[b].length - pieces[a].length || a - b);
  const total = idx.reduce((a, i) => a + pieces[i].length + kerf, 0);
  // a lower bound: all the length at once (sharing saves up to the depth for each mitred piece after the first, which a bar can't beat per bar)
  const bound = idx.length ? Math.max(1, Math.ceil((total - (share ? idx.reduce((a, i) => a + (mitreEnds(pieces[i]) ? pieces[i].depth : 0), 0) : 0)) / usable - 1e-9)) : 0;
  let best = idx.length ? heuristic(idx, usable, opt, null) : [];
  let nodes = 0, exact = best.length <= bound;
  if (!exact) {
    // depth-first: each piece goes into a bar that holds it or opens one; never more bars than the best minus one
    const bars = [];
    const seen = new Set();
    const dfs = (k) => {
      if (exact || nodes > nodeLimit) return;
      nodes++;
      if (k === idx.length) { if (bars.length < best.length) { best = bars.map((b) => ({ items: b.items.slice() })); if (best.length <= bound) exact = true; } return; }
      const i = idx[k];
      seen.clear();
      for (let b = 0; b < bars.length; b++) {
        const sig = bars[b].items.length + ':' + barUsed(bars[b].items.map((j) => pieces[j]), opt);
        if (seen.has(sig)) continue;
        bars[b].items.push(i);
        if (barUsed(bars[b].items.map((j) => pieces[j]), opt) <= usable + 1e-9) { seen.add(sig); dfs(k + 1); }
        bars[b].items.pop();
        if (exact) return;
      }
      if (bars.length + 1 < best.length) { bars.push({ items: [i] }); dfs(k + 1); bars.pop(); }
    };
    dfs(0);
    if (nodes <= nodeLimit) exact = true;
  }
  return { bars: best.map((b) => ({ items: b.items, used: barUsed(b.items.map((i) => pieces[i]), opt) })), optimal: exact, bound, nodes };
}

export function optimizeBars(list, opts = {}) {
  const kerf = num(opts.kerf), trimStart = num(opts.trimStart), trimEnd = num(opts.trimEnd), share = !!opts.share;
  const stockIn = Array.isArray(opts.stock) ? opts.stock : [{ length: opts.stock ?? opts.length ?? 6000 }];
  const stock = stockIn.map((s) => ({ length: num(s.length), left: s.qty === undefined ? Infinity : Math.max(0, Math.round(num(s.qty))) })).filter((s) => s.length > trimStart + trimEnd).sort((a, b) => a.length - b.length);
  const pieces = expandPieces(list);
  const longest = stock.length ? stock[stock.length - 1].length : 0;
  const unplaced = pieces.filter((p) => p.length + kerf > longest - trimStart - trimEnd + 1e-9);
  const ok = pieces.filter((p) => !unplaced.includes(p));
  const bars = [];
  let optimal = true;
  if (ok.length && stock.length) {
    // pack against the longest bar (fewest bars), then give each bar the shortest stock length that holds it
    const r = packBars(ok, { length: longest, kerf, trimStart, trimEnd, share, nodeLimit: opts.nodeLimit });
    optimal = r.optimal && stock.length === 1;
    const sorted = r.bars.slice().sort((a, b) => b.used - a.used);
    for (const b of sorted) {
      const need = b.used + trimStart + trimEnd;
      const s = stock.find((x) => x.length >= need - 1e-9 && x.left > 0) || stock.slice().reverse().find((x) => x.left > 0) || stock[stock.length - 1];
      if (s.left !== Infinity) s.left--;
      const items = b.items.map((i) => ok[i]);
      // cutting order: the longest first (a short offcut is kept at the end); mitred pieces that share a cut sit together
      items.sort((x, y) => (mitreEnds(y) - mitreEnds(x)) || y.length - x.length);
      let pos = trimStart;
      const placed = items.map((p) => { const o = { pieceId: p.pieceId, id: p.id, length: p.length, cuts: p.cuts, pos: r6(pos), group: p.group }; pos += p.length + kerf; return o; });
      const used = b.used;
      const offcut = r6(s.length - trimStart - trimEnd - used);
      bars.push({ no: bars.length + 1, stock: s.length, length: s.length, pieces: placed, used, waste: r6(s.length - items.reduce((a, p) => a + p.length, 0)), offcut });
    }
  }
  const pieceLength = r6(ok.reduce((a, p) => a + p.length, 0)), stockLength = r6(bars.reduce((a, b) => a + b.length, 0));
  return { bars, unplaced, bars_n: bars.length, pieceLength, stockLength, waste: r6(stockLength - pieceLength), wastePct: stockLength ? Math.round((1 - pieceLength / stockLength) * 10000) / 100 : 0, optimal };
}

export function optimizeGroups(list, opts = {}) {
  const groups = new Map();
  for (const p of list || []) { const g = p.group ?? ''; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(p); }
  const out = [];
  for (const [group, items] of groups) {
    const s = opts.stock && !Array.isArray(opts.stock) && typeof opts.stock === 'object' ? (opts.stock[group] ?? opts.stock['*']) : opts.stock;
    out.push({ group, ...optimizeBars(items, { ...opts, stock: s ?? opts.length ?? 6000 }) });
  }
  const pieceLength = r6(out.reduce((a, g) => a + g.pieceLength, 0)), stockLength = r6(out.reduce((a, g) => a + g.stockLength, 0));
  return { groups: out, bars_n: out.reduce((a, g) => a + g.bars_n, 0), pieceLength, stockLength, waste: r6(stockLength - pieceLength), wastePct: stockLength ? Math.round((1 - pieceLength / stockLength) * 10000) / 100 : 0 };
}

const cell = (v) => { const s = String(v ?? ''); return /[",\r\n]/.test(s) || /^[=+\-@]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function barsCsv(result, { head = {} } = {}) {
  const cols = ['group', 'bar', 'stock', 'piece', 'length', 'cut1', 'cut2', 'position'];
  const lines = [cols.map((c) => cell(head[c] ?? c)).join(',')];
  for (const g of result.groups || [{ group: '', ...result }]) for (const b of g.bars) for (const p of b.pieces) lines.push([g.group, b.no, b.stock, p.pieceId, p.length, p.cuts[0], p.cuts[1], p.pos].map(cell).join(','));
  return lines.join('\r\n') + '\r\n';
}
