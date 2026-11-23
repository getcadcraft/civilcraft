/* SPDX-License-Identifier: Apache-2.0 */
/**
 * jobs.js — Material flow reads the jobs of imported CAD, and joints move the part in the view (0.11 TW.13, the part 0.9 left). A behaviour (behaviours.js) may be linked to one item of the flow layout
 * (`behaviour.flow` = the item's id). The link is kept with the behaviour, never in the flow layout, so the flow file stays as it was. DOM-free, no imports but ./behaviours.js. Metres, seconds, degrees.
 *
 *   applyJobs(layout, behaviours, resolve) → { layout (a copy with the numbers the jobs give), report: [{ id, item, kind, set: {…} | null, why? }] }
 *       resolve(b) → { face, M } | null     the face of the part now and the part's world matrix (null = the part or face is not there: the item keeps its own numbers)
 *     conveyor job  → item kind conveyor or incline: length = the face's length along the belt (world), speed = the job's speed (incline: rise from the slope)
 *     joint job     → item kind station or transfer: time = one swing out and back (2 × travel ÷ rate), a constant; kept as the job's, so the station is as slow as the joint
 *     sensor job    → item kind sensor: `at` = where the beam meets the belt the sensor is on (`on`), when that belt is also a conveyor job; else the item keeps its own `at`
 *   (the optional 4th argument { links } = the flow layout's connections before the change: items after a belt that changed length move with its far end)
 *   jointWindows(trace, itemId) → [[t0, t1]] the times a load is on that item (merged)
 *   jointValueAt(b, windows, t) → the joint's value at t: leaves home toward its far limit at its rate while a load is on the item, comes home at its rate after (never past a limit)
 *   jointPoses(behaviours, trace, t) → [{ id, part, value, matrix }] one entry per switched-on joint linked to an item that has a trace
 *   compose(M, J) → the part's world matrix with the joint turn applied in the part's own frame (column-major 4x4)
 */
import { conveyorOf, jointMatrix, sensorRay } from './behaviours.js';

export const ITEM_OK = { conveyor: ['conveyor', 'incline'], joint: ['station', 'transfer'], sensor: ['sensor'] };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const copy = (l) => JSON.parse(JSON.stringify(l));

export function jointTravel(b) { return Math.max(Math.abs(b.max - b.home), Math.abs(b.home - b.min)); }
/** The limit a joint swings toward (the farther one from home). */
export function jointFar(b) { return Math.abs(b.max - b.home) >= Math.abs(b.home - b.min) ? b.max : b.min; }

export function applyJobs(layout, behaviours, resolve, { links = [] } = {}) {
  const out = copy(layout), report = [], byId = new Map((out.items || []).map((i) => [i.id, i]));
  // a belt that gets longer or shorter pushes everything after it along (the items join where their ports touch, and that must stay true): `links` = connect(layout).links of the layout as it was
  const shiftAfter = (id, d) => {
    const seen = new Set([id]), q = [id];
    while (q.length) { const c = q.shift(); for (const l of links) if (l.from === c && !seen.has(l.to)) { seen.add(l.to); q.push(l.to); const it = byId.get(l.to); if (it) { it.x += d[0]; it.y += d[1]; it.z += d[2]; } } }
  };
  const conv = new Map();
  for (const b of behaviours || []) {
    if (!b.flow) continue;
    const rep = { id: b.id, item: b.flow, kind: b.kind, set: null };
    report.push(rep);
    if (b.on === false) { rep.why = 'off'; continue; }
    const it = byId.get(b.flow);
    if (!it) { rep.why = 'no-item'; continue; }
    if (!ITEM_OK[b.kind].includes(it.kind)) { rep.why = 'wrong-item'; continue; }
    const r = typeof resolve === 'function' ? resolve(b) : null;
    if (b.kind === 'sensor') continue;   // second pass: it needs the belts
    if (b.kind === 'joint') { rep.set = { time: { kind: 'const', v: Math.round((2 * jointTravel(b) / b.rate) * 1e6) / 1e6 } }; it.params = { ...it.params, ...rep.set }; continue; }
    if (!r || !r.face) { rep.why = 'no-face'; continue; }
    const C = conveyorOf(b, r.face, r.M);
    if (!C.ok) { rep.why = C.code; continue; }
    const set = { length: clamp(Math.round(C.len * 1e4) / 1e4, 0.2, 500), speed: clamp(b.speed, 0.01, 10) };
    if (it.kind === 'incline') set.rise = clamp(Math.round(C.len * Math.sin(C.pitch) * 1e4) / 1e4, -20, 20);
    const rot = ((it.rot || 0) * Math.PI) / 180, dl = set.length - (it.params.length ?? set.length), dz = it.kind === 'incline' ? set.rise - (it.params.rise ?? set.rise) : 0;
    if (dl || dz) shiftAfter(it.id, [dl * Math.cos(rot), dl * Math.sin(rot), dz]);
    it.params = { ...it.params, ...set }; rep.set = set; conv.set(it.id, { C, b });
  }
  for (const b of behaviours || []) {
    if (b.kind !== 'sensor' || !b.flow) continue;
    const rep = report.find((x) => x.id === b.id); if (!rep || rep.why) continue;
    const it = byId.get(b.flow), belt = conv.get(it.params && it.params.on);
    const r = typeof resolve === 'function' ? resolve(b) : null;
    if (!belt) { rep.why = 'belt-not-a-job'; continue; }
    if (!r || !r.face) { rep.why = 'no-face'; continue; }
    const ray = sensorRay(b, r.face, r.M); if (!ray) { rep.why = 'needs-plane'; continue; }
    const d = (ray.o[0] - belt.C.start[0]) * belt.C.dir[0] + (ray.o[1] - belt.C.start[1]) * belt.C.dir[1] + (ray.o[2] - belt.C.start[2]) * belt.C.dir[2];
    const set = { at: clamp(Math.round(d * 1e4) / 1e4, 0, 500) }; it.params = { ...it.params, ...set }; rep.set = set;
  }
  return { layout: out, report };
}

export function jointWindows(trace, itemId) {
  const w = [];
  for (const r of (trace && trace.res) || []) if (r.el === itemId) w.push([r.t0, Number.isFinite(r.t1) ? r.t1 : Infinity]);
  w.sort((a, b) => a[0] - b[0]);
  const m = [];
  for (const x of w) { const l = m[m.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else m.push(x.slice()); }
  return m;
}

export function jointValueAt(b, windows, t) {
  const far = jointFar(b), sgn = Math.sign(far - b.home) || 1;
  let v = b.home, now = 0;
  for (const [t0, t1] of windows) {
    if (t0 > t) break;
    const idle = t0 - now; if (idle > 0) v = b.home + sgn * Math.max(0, Math.abs(v - b.home) - b.rate * idle);   // coming home before this load
    const dur = Math.min(t, t1) - t0; v = b.home + sgn * Math.min(Math.abs(far - b.home), Math.abs(v - b.home) + b.rate * dur);
    now = Math.min(t, t1);
    if (t <= t1) return clamp(v, b.min, b.max);
  }
  v = b.home + sgn * Math.max(0, Math.abs(v - b.home) - b.rate * Math.max(0, t - now));
  return clamp(v, b.min, b.max);
}

const mul = (A, B) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += A[k * 4 + r] * B[c * 4 + k]; return o; };
export function compose(M, J) { return mul(M, J); }

export function jointPoses(behaviours, trace, t, resolve) {
  const out = [];
  for (const b of behaviours || []) {
    if (b.kind !== 'joint' || !b.flow || b.on === false) continue;
    const r = typeof resolve === 'function' ? resolve(b) : null; if (!r || !r.face) continue;
    const value = jointValueAt(b, jointWindows(trace, b.flow), t);
    out.push({ id: b.id, part: b.part, value, matrix: compose(r.M, jointMatrix(b, r.face, value - b.home)), home: b.home });
  }
  return out;
}
