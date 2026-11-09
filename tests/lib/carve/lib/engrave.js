/* SPDX-License-Identifier: Apache-2.0 */
/**
 * engrave.js — following lines at a depth (lib/carve). DOM-free. Millimetres.
 *   engrave(paths, { depth, passDepth, tool }) → { ops, stats }
 *     paths = [{ pts: [[x, y]…], closed }]   open or closed; a closed one is run round and back to its start
 *     depth = how deep (default 1 mm), passDepth = the most per pass (default the depth), tool = { type: 'v', angle } | { type: 'ball' | 'flat', dia }
 *   A V-bit's line is 2 × depth × tan(angle / 2) wide at the top: stats.width says how wide.
 */
import { orderPaths, pathLength } from './geom.js';

export function engrave(paths, o = {}) {
  const depth = Number(o.depth) > 0 ? Number(o.depth) : 1;
  const pass = Number(o.passDepth) > 0 ? Math.min(depth, Number(o.passDepth)) : depth;
  const tool = o.tool && o.tool.type ? o.tool : { type: 'v', angle: 60 };
  const lines = (paths || []).filter((p) => p && Array.isArray(p.pts) && p.pts.length >= 2).map((p) => (p.closed ? p.pts.concat([p.pts[0]]) : p.pts));
  if (!lines.length) throw Object.assign(new Error('carve.err.noshape'), { key: 'carve.err.noshape' });
  const levels = [];
  for (let z = pass; z < depth - 1e-9; z += pass) levels.push(z);
  levels.push(depth);
  const out = [];
  let flip = false;
  for (const z of levels) {
    for (const p of orderPaths(lines, [0, 0])) { const q = p.map((a) => [a[0], a[1], -z]); out.push(flip && !(p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) ? q.reverse() : q); }
    flip = !flip;
  }
  const width = tool.type === 'v' ? 2 * depth * Math.tan((tool.angle * Math.PI) / 360) : tool.dia;
  return { ops: [{ id: 'engrave', tool, paths: out }], stats: { depth, passes: levels.length, width, length: out.reduce((s, p) => s + pathLength(p), 0) } };
}
