/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dryrun.js — a dry-run checker for the files a job hands to a machine (0.8.2 DC.117, session `cabinetcraft_addon` round 3). DOM-free, pure.
 *
 * It does NOT run anything on a machine and says so: it reads the generated G-code like a very small tool-path simulator (straight moves and arcs in the XY
 * plane, absolute coordinates, modal feed and Z) and reports what it can see, so the owner starts the first real run with fewer surprises. A machine
 * run, a boring machine reading the hole list and a cabinet maker's look at the sizes stay a person's job.
 *
 *   parseGcode(text) → { moves: [{ line, rapid, arc, x0, y0, z0, x1, y1, z1, feed, len, ext }], tools: [n…], toolChanges: [{ line, n }], units ('mm' | 'in' | null),
 *                        relative (bool), spindle (bool), problems: [{ code, line, ... }] }
 *   dryRunGcode(text, { sheet: { w, h }, thickness, unit, rapid (rate in mm/min or in/min, blank = unknown) }) → report
 *     { bbox: [x0, y0, z0, x1, y1, z1], moves, cuts, rapids, arcs, cutLen, rapidLen, minFeed, maxFeed, tools, toolChanges, deepest, throughStock (how far below the stock's bottom),
 *       minutesCut, minutesRapid (null when `rapid` is blank), minutes (null when rapids are unknown: then minutesCut is a lower bound), issues: [{ code, severity, line?, vars }] }
 *     codes: units · relative · no-tool · no-spindle · no-feed · rapid-in-stock · outside · outside-z · deep · empty
 *   checkHoles(build) → { holes, parts, checked, minEdge (the rule), tightest, blanks, issues: [{ code, severity, part, hole, vars }] }
 *     every hole of the drilling plan lies inside its panel; a face hole's rim keeps at least `cupEdge` (the smallest edge distance the drilling rules themselves use)
 *     from every edge; an edge hole lies on the panel's blank; a hole with a size no deeper than the panel is thick.
 */
const r3 = (v) => Math.round(v * 1000) / 1000;

export function parseGcode(text) {
  const moves = [], tools = [], toolChanges = [], problems = [];
  let units = null, relative = false, spindle = false;
  let x = 0, y = 0, z = 0, feed = 0, mode = null, plane = 17;
  const lines = String(text || '').split(/\r?\n/);
  lines.forEach((raw, k) => {
    const line = k + 1;
    const code = raw.replace(/\([^)]*\)/g, ' ').replace(/;.*$/, '').trim().toUpperCase();
    if (!code) return;
    const words = [...code.matchAll(/([A-Z])\s*(-?\d*\.?\d+)/g)].map((m) => [m[1], Number(m[2])]);
    let target = { x, y, z }, ijk = { i: 0, j: 0 }, hasXYZ = false;
    for (const [c, v] of words) {
      if (c === 'G') {
        if (v === 20) units = 'in'; else if (v === 21) units = 'mm';
        else if (v === 90) relative = false; else if (v === 91) relative = true;
        else if (v === 0 || v === 1 || v === 2 || v === 3) mode = v;
        else if (v === 17 || v === 18 || v === 19) plane = v;
      } else if (c === 'M') { if (v === 3 || v === 4) spindle = true; else if (v === 5) spindle = false; else if (v === 6) toolChanges.push({ line, n: tools[tools.length - 1] ?? null }); }
      else if (c === 'T') { tools.push(v); toolChanges.push({ line, n: v }); }
      else if (c === 'F') feed = v;
      else if (c === 'X') { target.x = relative ? x + v : v; hasXYZ = true; }
      else if (c === 'Y') { target.y = relative ? y + v : v; hasXYZ = true; }
      else if (c === 'Z') { target.z = relative ? z + v : v; hasXYZ = true; }
      else if (c === 'I') ijk.i = v; else if (c === 'J') ijk.j = v;
    }
    if (!hasXYZ || mode === null) return;
    const rapid = mode === 0, arc = mode === 2 || mode === 3;
    const m = { line, rapid, arc, cw: mode === 2, x0: x, y0: y, z0: z, x1: target.x, y1: target.y, z1: target.z, feed: rapid ? 0 : feed, spindle };
    if (arc && plane === 17) {
      const cx = x + ijk.i, cy = y + ijk.j, r0 = Math.hypot(x - cx, y - cy);
      let a0 = Math.atan2(y - cy, x - cx), a1 = Math.atan2(target.y - cy, target.x - cx);
      let d = a1 - a0;
      if (m.cw) { while (d >= -1e-9) d -= 2 * Math.PI; } else { while (d <= 1e-9) d += 2 * Math.PI; }
      if (Math.hypot(target.x - x, target.y - y) < 1e-6) d = m.cw ? -2 * Math.PI : 2 * Math.PI;   // a full circle
      m.len = Math.hypot(r0 * Math.abs(d), target.z - z);
      // extent of the arc: its end points and every axis crossing inside the sweep
      const xs = [x, target.x], ys = [y, target.y];
      for (let q = 0; q < 4; q++) {
        const ang = q * Math.PI / 2;
        let t = m.cw ? a0 - ang : ang - a0;
        while (t < 0) t += 2 * Math.PI;
        if (t <= Math.abs(d) + 1e-9) { xs.push(cx + r0 * Math.cos(ang)); ys.push(cy + r0 * Math.sin(ang)); }
      }
      m.ext = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    } else {
      m.len = Math.hypot(target.x - x, target.y - y, target.z - z);
      m.ext = [Math.min(x, target.x), Math.min(y, target.y), Math.max(x, target.x), Math.max(y, target.y)];
    }
    moves.push(m);
    x = target.x; y = target.y; z = target.z;
  });
  return { moves, tools, toolChanges, units, relative, spindle: moves.some((m) => m.spindle), problems, lines: lines.length };
}

export function dryRunGcode(text, { sheet = null, thickness = 0, unit = 'mm', rapid = null, tol = 0.01 } = {}) {
  const p = parseGcode(text);
  const issues = [];
  const add = (code, severity, line, vars = {}) => issues.push({ code, severity, line: line ?? null, vars });
  const cuts = p.moves.filter((m) => !m.rapid);
  const rapids = p.moves.filter((m) => m.rapid);
  if (!p.moves.length) { add('empty', 'error', null); }
  if (p.units && p.units !== unit) add('units', 'error', null, { found: p.units, expected: unit });
  if (!p.units && p.moves.length) add('units', 'warning', null, { found: '', expected: unit });
  if (p.relative) add('relative', 'warning', null);
  if (cuts.length && !p.tools.length) add('no-tool', 'warning', null);
  if (cuts.length && !p.spindle) add('no-spindle', 'warning', null);
  const bbox = p.moves.length ? [
    Math.min(...p.moves.map((m) => Math.min(m.ext[0]))), Math.min(...p.moves.map((m) => m.ext[1])), Math.min(...p.moves.map((m) => Math.min(m.z0, m.z1))),
    Math.max(...p.moves.map((m) => m.ext[2])), Math.max(...p.moves.map((m) => m.ext[3])), Math.max(...p.moves.map((m) => Math.max(m.z0, m.z1))),
  ].map(r3) : null;
  const cutLen = cuts.reduce((s, m) => s + m.len, 0), rapidLen = rapids.reduce((s, m) => s + m.len, 0);
  const feeds = cuts.map((m) => m.feed).filter((f) => f > 0);
  const noFeed = cuts.filter((m) => !(m.feed > 0));
  if (noFeed.length) add('no-feed', 'error', noFeed[0].line, { n: noFeed.length });
  // a rapid that moves sideways while the tool is below the top of the stock (Z < 0 at either end of a move that changes X or Y)
  const inStock = rapids.filter((m) => (m.x0 !== m.x1 || m.y0 !== m.y1) && (m.z0 < -tol || m.z1 < -tol));
  if (inStock.length) add('rapid-in-stock', 'error', inStock[0].line, { n: inStock.length });
  let outside = [];
  if (sheet) outside = cuts.filter((m) => m.ext[0] < -tol || m.ext[1] < -tol || m.ext[2] > sheet.w + tol || m.ext[3] > sheet.h + tol);
  if (outside.length) add('outside', 'error', outside[0].line, { n: outside.length, w: sheet.w, h: sheet.h });
  const deepest = cuts.length ? Math.min(...cuts.map((m) => Math.min(m.z0, m.z1))) : 0;
  const through = thickness > 0 ? Math.max(0, -deepest - thickness) : 0;
  if (thickness > 0 && -deepest < thickness - tol && cuts.length) add('deep', 'warning', null, { deepest: r3(-deepest), t: thickness });
  if (through > tol) add('outside-z', 'note', null, { over: r3(through) });
  const minutesCut = feeds.length ? cuts.reduce((s, m) => s + (m.feed > 0 ? m.len / m.feed : 0), 0) : 0;
  const minutesRapid = rapid > 0 ? rapidLen / rapid : null;
  return {
    bbox, moves: p.moves.length, cuts: cuts.length, rapids: rapids.length, arcs: p.moves.filter((m) => m.arc).length, cutLen: r3(cutLen), rapidLen: r3(rapidLen),
    minFeed: feeds.length ? Math.min(...feeds) : 0, maxFeed: feeds.length ? Math.max(...feeds) : 0, tools: [...new Set(p.tools)], toolChanges: p.toolChanges.length, deepest: r3(deepest), throughStock: r3(through),
    minutesCut: r3(minutesCut), minutesRapid: minutesRapid === null ? null : r3(minutesRapid), minutes: minutesRapid === null ? null : r3(minutesCut + minutesRapid),
    issues, units: p.units, ok: !issues.some((i) => i.severity === 'error'),
  };
}

export function checkHoles(build) {
  const { R } = build;
  const parts = new Map(build.parts.map((p) => [p.id, p]));
  const issues = [];
  const rule = R.cupEdge;
  let holes = 0, checked = 0, tightest = Infinity;
  const plans = build.cells.filter((c) => c.kind === 'cab' && !c.bad).flatMap((c) => c.drill.map((pl) => ({ ...pl, cab: c.no })));
  const blanks = {};
  for (const pl of plans) {
    const part = parts.get(pl.id);
    pl.holes.forEach((h, i) => {
      holes++;
      const ref = pl.id + '#' + (i + 1);
      if (!part) { issues.push({ code: 'hole.nopart', severity: 'error', part: pl.id, hole: i + 1, vars: { id: pl.id } }); return; }
      const L = part.length, W = part.width, T = part.thickness;
      const r = h.d > 0 ? h.d / 2 : 0;
      if (h.d === '' || h.depth === '') { blanks[h.kind] = (blanks[h.kind] || 0) + 1; }
      checked++;
      const face = h.face || pl.face;
      const inRect = h.x >= -1e-6 && h.x <= L + 1e-6 && h.y >= -1e-6 && h.y <= W + 1e-6;
      if (!inRect) { issues.push({ code: 'hole.outside', severity: 'error', part: pl.id, hole: i + 1, vars: { ref, kind: h.kind, x: h.x, y: h.y, l: L, w: W } }); return; }
      if (face !== 'edge') {
        const e = Math.min(h.x - r, L - h.x - r, h.y - r, W - h.y - r);
        tightest = Math.min(tightest, e);
        if (e < rule - 1e-6) issues.push({ code: 'hole.edge', severity: 'error', part: pl.id, hole: i + 1, vars: { ref, kind: h.kind, edge: r3(e), min: r3(rule) } });
      }
      if (h.depth > 0 && T > 0 && h.depth > T + 1e-6 && face !== 'edge') issues.push({ code: 'hole.deep', severity: 'error', part: pl.id, hole: i + 1, vars: { ref, kind: h.kind, depth: h.depth, t: T } });
    });
  }
  if (Object.keys(blanks).length) issues.push({ code: 'hole.blank', severity: 'note', part: null, hole: null, vars: { list: Object.entries(blanks).map(([k, n]) => k + ' ×' + n).join(', ') } });
  return { holes, parts: new Set(plans.map((p) => p.id)).size, checked, minEdge: r3(rule), tightest: tightest === Infinity ? null : r3(tightest), blanks, issues, ok: !issues.some((i) => i.severity === 'error') };
}
