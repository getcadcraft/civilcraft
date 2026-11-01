#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-slab.mjs — slab reinforcement from the plate moments (0.8 round 3, SU.1056 next step; lib/frame/slab-design.js): the Wood–Armer moments by hand, a simply supported
 * square slab against Timoshenko's plate theory, the steel and shear against hand calculations.   node tools/frame/test-slab.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const SD = await load('lib/frame/slab-design.js'), ACI = await load('lib/frame/rc-aci318.js'), FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), PM = await load('lib/frame/plate-mesh.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

console.log('Wood–Armer');
{
  const w = (a, b, c) => SD.woodArmer(a, b, c);
  let r = w(100, 50, 0);
  ok(r.bx === 100 && r.by === 50 && r.tx === 0 && r.ty === 0, 'no twist: the layers take the moments, nothing on top');
  r = w(100, 50, 30);
  ok(r.bx === 130 && r.by === 80, 'both positive: Mx + |Mxy|, My + |Mxy|');
  ok(r.tx === 0 && r.ty === 0, 'both sagging: the top layers stay empty');
  r = w(100, -40, 30);
  ok(r.by === 0 && Math.abs(r.bx - (100 + 900 / 40)) < 1e-12, 'My* < 0: it is dropped and Mx* = Mx + Mxy² / |My| = 122.5 (hand)', r);
  ok(r.tx === 0 && Math.abs(r.ty - (40 + 900 / 100)) < 1e-12, 'the top layers: Mx → −100 (< −30 so dropped), My → 40 + 900 / 100 = 49 (hand)', r);
  r = w(0, 0, 50);
  ok(r.bx === 50 && r.by === 50 && r.tx === 50 && r.ty === 50, 'pure twist: every layer takes |Mxy|');
  r = w(-80, -20, 10);
  ok(r.tx === 90 && r.ty === 30 && r.bx === 0 && r.by === 0, 'hogging: the top layers take the moments plus the twist');
  // the work done: each design moment pair covers the plate moments in every direction (Nielsen yield condition) – checked on a sweep
  let bad = 0;
  for (let i = 0; i < 400; i++) {
    const Mx = (Math.sin(i * 1.7) * 120), My = (Math.cos(i * 2.3) * 90), Mxy = Math.sin(i * 0.9) * 60;
    const d = w(Mx, My, Mxy);
    for (let a = 0; a < 180; a += 5) {
      const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
      const Mn = Mx * c * c + My * s * s + 2 * Mxy * s * c;              // the moment in the direction a (tension at the bottom)
      const cover = d.bx * c * c + d.by * s * s;                          // what the two bottom layers give in that direction
      const coverTop = -(d.tx * c * c + d.ty * s * s);                    // and the top layers (negative = tension on top)
      if (Mn > 1e-9 && cover < Mn - 1e-6) bad++;
      if (Mn < -1e-9 && coverTop > Mn + 1e-6) bad++;
    }
  }
  ok(bad === 0, 'the layers cover the moment in every direction (400 random fields, 36 directions each)', bad);
}

console.log('A simply supported square slab');
{
  // 6 m square, 200 thick, 10 kPa: Timoshenko, Theory of Plates and Shells: M = 0.0479 q a² at the middle for ν = 0.3
  const a = 6000, t = 200, q = 10e-3;   // q in N/mm² (10 kPa)
  const E = 24870, nu = 0.3;
  const json = { format: FM.FORMAT, version: FM.VERSION, name: 'slab', nodes: [], materials: [{ id: 'c', name: 'C28', E, G: E / (2 * (1 + nu)), rho: 0 }], sections: [], members: [], supports: [], cases: [], combos: [] };
  const r = PM.slabPlates(json, { id: 's', outline: [[0, 0], [a, 0], [a, a], [0, a]], z: 0, t, material: 'c', size: 375 });
  const edge = (p) => p.x < 1e-6 || p.y < 1e-6 || p.x > a - 1e-6 || p.y > a - 1e-6;
  json.supports = json.nodes.map((p) => ({ node: p.id, fix: [true, true, edge(p), false, false, true] }));
  json.cases = [{ id: 'q', name: 'q', kind: 'live', selfWeight: 0, loads: json.plates.map((p) => ({ type: 'area', plate: p.id, dir: 'Z', p: -q })) }];
  json.combos = [{ id: 'U', name: 'U', factors: [{ case: 'q', f: 1 }], limit: 'strength' }];
  const { model } = FM.cleanFrame(json);
  const sol = FS.solveFrame(model);
  ok(sol.ok && r.plates.length === 256, 'a 16 × 16 plate slab solves');
  const res = SD.slabDesign(model, sol, { h: 200, cover: 25, fc: 28, fy: 420, bottomX: { d: 12, s: 150 }, bottomY: { d: 12, s: 150 }, topX: { d: 10, s: 200 }, topY: { d: 10, s: 200 } });
  ok(res.ok && res.rows.length === 4, 'four layers are designed');
  const Mtheory = 0.0479 * 10 * 36;     // kN·m/m
  ok(rel(res.max.bx.Mu, Mtheory) < 0.03 && rel(res.max.by.Mu, Mtheory) < 0.03, 'the sagging moment at the middle is 0.0479 q a² = 17.24 kN·m/m within 3 %', [res.max.bx.Mu.toFixed(2), res.max.by.Mu.toFixed(2), Mtheory.toFixed(2)]);
  ok(Math.abs(res.max.bx.Mu - res.max.by.Mu) / res.max.bx.Mu < 1e-6, 'a square slab: the same in both directions');
  // the steel for that moment, by the closed form with the layer depths: x outermost (200 − 25 − 6), y inside it (169 − 12)
  const dx = 200 - 25 - 6, dy = 200 - 25 - 12 - 6;
  const reqX = ACI.requiredAs({ b: 1000, d: dx, fc: 28, fy: 420, Mu: res.max.bx.Mu * 1e6, phi: 0.9 }), reqY = ACI.requiredAs({ b: 1000, d: dy, fc: 28, fy: 420, Mu: res.max.by.Mu * 1e6, phi: 0.9 });
  ok(rel(res.max.bx.req, reqX) < 1e-12 && rel(res.max.by.req, reqY) < 1e-12 && res.max.by.req > res.max.bx.req, 'required steel = requiredAs at each layer\'s own depth (the inner layer needs more)', [res.max.bx.req.toFixed(0), res.max.by.req.toFixed(0)]);
  ok(Math.abs(res.max.bx.min - 0.0018 * 1000 * 200) < 1e-9, 'minimum steel 0.0018 · 1000 · 200 = 360 mm²/m (24.4.3.2)', res.max.bx.min);
  ok(Math.abs(res.max.bx.prov - Math.PI * 36 * 1000 / 150) < 1e-6, '12 mm at 150 gives 754 mm²/m');
  // Timoshenko: the corner twisting moment of a simply supported square slab is 0.0325 q a² = 11.7 kN·m/m; the plate centres next to the corner read about three quarters of it, and Wood–Armer puts it in the top layers
  ok(res.max.tx.Mu > 0.5 * 0.0325 * 10 * 36 && res.max.tx.Mu < 1.1 * 0.0325 * 10 * 36, 'the corners lift: the top layers carry the twisting moment, about 0.0325 q a² = 11.7 kN·m/m (hand)', res.max.tx.Mu.toFixed(2));
  // shear: the edge shear of a simply supported square slab is about 0.338 q a / ... use the plate centre values, which are below the support value; just bound it
  const sh = res.checks[0];
  // Timoshenko: the shear at the middle of a side is 0.338 q a = 20.3 kN/m; next to the corners a Reissner–Mindlin plate reads more, up to about q a / 2 = 30 kN/m
  ok(sh.demand > 0.8 * 0.338 * q * a * 1000 && sh.demand < 1.3 * q * a / 2 * 1000, 'the shear is between the mid-side value (20 kN/m) and the corner effect (about 30 kN/m)', (sh.demand / 1000).toFixed(1));
  // problems: bars far too few fail flexure; the right bars pass
  const thin = SD.slabDesign(model, sol, { h: 200, cover: 25, fc: 28, fy: 420, bottomX: { d: 8, s: 300 }, bottomY: { d: 8, s: 300 }, topX: { d: 8, s: 300 }, topY: { d: 8, s: 300 } });
  ok(SD.slabProblems(thin).length >= 2 && SD.slabProblems(thin).every((p) => /^concrete\.slab/.test(p.code) && p.clause), 'too little steel: the layers that fail are problems with their clause');
  const enough = SD.slabDesign(model, sol, { h: 200, cover: 25, fc: 28, fy: 420, bottomX: { d: 12, s: 100 }, bottomY: { d: 12, s: 100 }, topX: { d: 12, s: 150 }, topY: { d: 12, s: 150 } });
  ok(SD.slabProblems(enough).length === 0 && enough.util < 1, 'enough steel: no problems', enough.util);
  ok(SD.slabDesign(model, sol, null).error === 'no-slab' && SD.slabDesign({ ...model, plates: [] }, sol, {}).error === 'no-plates', 'no settings or no plates are refused with the reason');
}
console.log('Settings');
{
  const c = SD.cleanSlab({ cover: 5, fc: 999, bottomX: { d: 2, s: 5000 }, topY: { d: 16, s: 125 } });
  ok(c.cover === 25 && c.fc === 28 && c.bottomX.d === 12 && c.bottomX.s === 200 && c.topY.d === 16 && c.topY.s === 125, 'out-of-range values go back to defaults, good ones stay');
  ok(SD.cleanSlab(undefined) === null && SD.cleanSlab('x') === null, 'nothing → null');
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
