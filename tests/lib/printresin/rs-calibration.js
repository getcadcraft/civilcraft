/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-calibration.js — the exposure test part and the ladder of exposures (roadmap RSN.4). No DOM; manifold-3d is handed in.
 *
 *   testPart(MF) → tris          mm, standing on z = 0 and centred on the origin (what the stage's place() takes): a 1.2 mm base carrying
 *                                square pillars 0.3 to 1.5 mm wide (too little light and the thin ones do not stand), a block with round holes
 *                                0.4 to 1.5 mm (too much light and the small ones close), and two flat bridges over a gap (sag shows overexposure)
 *   ladder(base, steps = 5) → [seconds …]   exposures around `base`, from 70 % to 130 %, to 0.1 s
 * Print the same part once at each exposure of the ladder and keep the one with the sharpest small pillars and open holes: that exposure is the resin's on this printer.
 */
export const PILLARS = [0.3, 0.5, 0.8, 1.0, 1.5];
export const HOLES = [0.4, 0.6, 0.8, 1.0, 1.5];

export function testPart(MF) {
  const { Manifold } = MF, parts = [], drop = [];
  const cube = (x, y, z, at) => { const c = Manifold.cube([x, y, z], false).translate(at); drop.push(c); return c; };
  parts.push(cube(46, 30, 1.2, [0, 0, 0]));
  PILLARS.forEach((w, i) => parts.push(cube(w, w, 5, [3 + i * 8, 3, 1.2])));
  const block = cube(46, 10, 4, [0, 0, 0]).translate([0, 16, 1.2]);
  let holes = null;
  HOLES.forEach((d, i) => { const c = Manifold.cylinder(6, d / 2, d / 2, 24, false).translate([4.5 + i * 9, 21, 1]); drop.push(c); holes = holes ? holes.add(c) : c; });
  parts.push(block.subtract(holes));
  // two bridges: 4 and 8 mm over a 2 mm gap (the posts are 2 mm wide)
  parts.push(cube(2, 4, 5, [32, 8, 1.2]), cube(2, 4, 5, [38, 8, 1.2]), cube(8, 4, 1, [32, 8, 5.2]));
  parts.push(cube(2, 4, 3, [4, 10, 1.2]), cube(2, 4, 3, [10, 10, 1.2]), cube(8, 4, 1, [4, 10, 3.2]));
  const all = Manifold.union(parts).translate([-23, -15, 0]);
  const m = all.getMesh(), np = m.numProp, tris = [];
  for (let i = 0; i < m.triVerts.length; i += 3) tris.push([0, 1, 2].map((k) => { const v = m.triVerts[i + k] * np; return [m.vertProperties[v], m.vertProperties[v + 1], m.vertProperties[v + 2]]; }));
  for (const d of new Set([...drop, ...parts, all, block, holes])) d?.delete?.();
  return tris;
}

export const ladder = (base, steps = 5) => {
  const out = [];
  for (let i = 0; i < steps; i++) out.push(Math.round(base * (0.7 + 0.6 * i / (steps - 1)) * 10) / 10);
  return [...new Set(out)];
};
