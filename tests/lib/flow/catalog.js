/* SPDX-License-Identifier: Apache-2.0 */
/**
 * catalog.js — the Material flow catalogue (0.8 SU.858 step 1, session sx-flow). DOM-free. Each kind of item has parameters
 * (with defaults and limits) and ports in its own frame: metres, x along the flow, y to the left, z up; a port has a position
 * and a heading (degrees, the direction loads move through it). layout.js places items and joins ports.
 *
 *   KINDS                       ordered list of kinds (the catalogue as the panel shows it)
 *   KIND[kind]                  { group, sim (the simulation element), params: {name: {def, min, max, step?, choices?, kind}} }
 *   defaults(kind)              a fresh params object
 *   cleanParams(kind, raw)      untrusted params → clean ones (unknown keys dropped, numbers clamped, choices checked)
 *   localPorts(kind, params)    [{name, dir: 'in'|'out'|'agv', p: [x, y, z], h}]
 *   localPath(kind, params)     for conveyors: { length, at(s) → {p:[x,y,z], h} } along the centre line; else null
 *   footprint(kind, params)     {l, w, h} of a box drawn for it (stations, buffers …), x from −l/2 … +l/2 unless noted
 *
 * Kinds: conveyor (straight), curve, incline, zone (zone accumulation conveyor), merge, divert, transfer, buffer, station,
 * gate (a stop), source, sink, sensor (a photo-eye on a conveyor), agv-path (one-way segment, or a two-way lane), agv-pick, agv-drop.
 * A station (and, from round 3, a belt: conveyor, curve, incline) can run to a shift calendar (`calendar`, an id from the layout's calendars) and break down (`mtbf` hours of clock time
 * between failures, `mttr` minutes to repair, 0 mtbf = never); a source can follow a calendar too.
 */
import { cleanDist } from './rng.js';

const conveyorCommon = {
  width: { def: 0.6, min: 0.1, max: 5, kind: 'm' },
  speed: { def: 0.5, min: 0.01, max: 10, kind: 'mps' },
  gap: { def: 0.1, min: 0, max: 10, kind: 'm' },
  accumulate: { def: true, kind: 'bool' },
  // 0.8 round 3 (SU.858): belts break down too (0 = never), as stations do
  mtbf: { def: 0, min: 0, max: 1e5, kind: 'h' },
  mttr: { def: 15, min: 0.01, max: 1e5, kind: 'min' },
};
export const KIND = {
  conveyor: { group: 'conveyors', sim: 'conveyor', params: { length: { def: 3, min: 0.2, max: 500, kind: 'm' }, ...conveyorCommon } },
  curve: { group: 'conveyors', sim: 'conveyor', params: { radius: { def: 1, min: 0.2, max: 50, kind: 'm' }, angle: { def: 90, min: -180, max: 180, kind: 'deg' }, ...conveyorCommon } },
  incline: { group: 'conveyors', sim: 'conveyor', params: { length: { def: 3, min: 0.2, max: 500, kind: 'm' }, rise: { def: 0.5, min: -20, max: 20, kind: 'm' }, ...conveyorCommon } },
  zone: { group: 'conveyors', sim: 'conveyor', params: { zones: { def: 4, min: 1, max: 200, step: 1, kind: 'int' }, zoneLength: { def: 1, min: 0.2, max: 20, kind: 'm' }, width: conveyorCommon.width, speed: conveyorCommon.speed } },
  merge: { group: 'conveyors', sim: 'merge', params: { inputs: { def: 2, min: 2, max: 3, step: 1, kind: 'int' }, rule: { def: 'priority', choices: ['priority', 'fifo', 'alternate'], kind: 'choice' } } },
  divert: { group: 'conveyors', sim: 'divert', params: { outputs: { def: 2, min: 2, max: 3, step: 1, kind: 'int' }, rule: { def: 'round-robin', choices: ['round-robin', 'first-free', 'type', 'percent', 'sensor'], kind: 'choice' }, map: { def: '', kind: 'text' }, weights: { def: '1 1', kind: 'text' }, sensors: { def: '', kind: 'text' } } },
  transfer: { group: 'conveyors', sim: 'station', params: { time: { def: { kind: 'const', v: 2 }, kind: 'dist' } } },
  gate: { group: 'conveyors', sim: 'gate', params: { mode: { def: 'open', choices: ['open', 'closed', 'cycle', 'plc'], kind: 'choice' }, open: { def: 60, min: 0.1, max: 1e6, kind: 's' }, closed: { def: 30, min: 0.1, max: 1e6, kind: 's' }, offset: { def: 0, min: 0, max: 1e6, kind: 's' }, mtbf: { def: 0, min: 0, max: 1e5, kind: 'h' }, mttr: { def: 15, min: 0.01, max: 1e5, kind: 'min' } } },
  buffer: { group: 'process', sim: 'buffer', params: { capacity: { def: 10, min: 1, max: 100000, step: 1, kind: 'int' } } },
  station: { group: 'process', sim: 'station', params: { servers: { def: 1, min: 1, max: 100, step: 1, kind: 'int' }, queue: { def: 5, min: 0, max: 100000, step: 1, kind: 'int' }, time: { def: { kind: 'const', v: 30 }, kind: 'dist' }, calendar: { def: '', kind: 'ref' }, pool: { def: '', kind: 'ref' }, mtbf: { def: 0, min: 0, max: 1e5, kind: 'h' }, mttr: { def: 15, min: 0.01, max: 1e5, kind: 'min' } } },
  source: { group: 'process', sim: 'source', params: { mode: { def: 'interval', choices: ['interval', 'saturate', 'orders'], kind: 'choice' }, orders: { def: '', kind: 'ref' }, interarrival: { def: { kind: 'exp', mean: 10 }, kind: 'dist' }, types: { def: 'A 1 0.4', kind: 'text' }, limit: { def: 0, min: 0, max: 1e9, step: 1, kind: 'int' }, calendar: { def: '', kind: 'ref' } } },
  sink: { group: 'process', sim: 'sink', params: {} },
  sensor: { group: 'process', sim: 'sensor', params: { on: { def: '', kind: 'ref' }, at: { def: 1, min: 0, max: 500, kind: 'm' } } },
  'agv-path': { group: 'agv', sim: null, params: { length: { def: 5, min: 0.2, max: 1000, kind: 'm' }, twoWay: { def: false, kind: 'bool' } } },
  'agv-pick': { group: 'agv', sim: 'agv-pick', params: { to: { def: '', kind: 'ref' }, capacity: { def: 4, min: 1, max: 1000, step: 1, kind: 'int' } } },
  'agv-drop': { group: 'agv', sim: 'agv-drop', params: { capacity: { def: 4, min: 1, max: 1000, step: 1, kind: 'int' } } },
};
export const KINDS = Object.keys(KIND);
export const GROUPS = ['conveyors', 'process', 'agv'];
export const CONVEYOR_KINDS = ['conveyor', 'curve', 'incline', 'zone'];

export function defaults(kind) {
  const out = {};
  for (const [k, d] of Object.entries(KIND[kind].params)) out[k] = typeof d.def === 'object' ? { ...d.def } : d.def;
  return out;
}

export function cleanParams(kind, raw) {
  const out = defaults(kind);
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, d] of Object.entries(KIND[kind].params)) {
    const v = raw[k];
    if (v === undefined) continue;
    switch (d.kind) {
      case 'bool': out[k] = !!v; break;
      case 'choice': if (d.choices.includes(v)) out[k] = v; break;
      case 'text': case 'ref': if (typeof v === 'string') out[k] = v.replace(/[\u0000-\u001f<>]/g, '').slice(0, 200); break;
      case 'dist': out[k] = cleanDist(v, out[k]); break;
      default: {
        if (typeof v !== 'number' || !Number.isFinite(v)) break;
        let n = Math.min(d.max, Math.max(d.min, v));
        if (d.kind === 'int') n = Math.round(n);
        out[k] = n;
      }
    }
  }
  return out;
}

const DEG = Math.PI / 180;
const HALF = { merge: 0.3, divert: 0.3, transfer: 0.3, gate: 0.1, buffer: 0.5, station: 0.6, source: 0.3, sink: 0.3, sensor: 0.05, 'agv-pick': 0.3, 'agv-drop': 0.3 };

export function localPath(kind, p) {
  switch (kind) {
    case 'conveyor': case 'agv-path': return { length: p.length, at: (s) => ({ p: [s, 0, 0], h: 0 }) };
    case 'zone': { const L = p.zones * p.zoneLength; return { length: L, at: (s) => ({ p: [s, 0, 0], h: 0 }) }; }
    case 'incline': {
      const L = Math.hypot(p.length, p.rise);
      return { length: L, at: (s) => ({ p: [(s / L) * p.length, 0, (s / L) * p.rise], h: 0 }) };
    }
    case 'curve': {
      const r = p.radius, a = p.angle * DEG, sg = a >= 0 ? 1 : -1, L = r * Math.abs(a);
      return { length: L, at: (s) => { const th = s / r; return { p: [r * Math.sin(th), sg * r * (1 - Math.cos(th)), 0], h: (sg * th) / DEG }; } };
    }
  }
  return null;
}

export function localPorts(kind, p) {
  if (kind === 'agv-path') return [{ name: 'a', dir: 'agv', p: [0, 0, 0], h: 0 }, { name: 'b', dir: 'agv', p: [p.length, 0, 0], h: 0 }];
  const path = localPath(kind, p);
  if (path) { const e = path.at(path.length); return [{ name: 'in', dir: 'in', p: [0, 0, 0], h: 0 }, { name: 'out', dir: 'out', p: e.p, h: e.h }]; }
  const hl = HALF[kind] ?? 0.3;
  switch (kind) {
    case 'merge': {
      const ins = [{ name: 'in1', dir: 'in', p: [-hl, 0, 0], h: 0 }, { name: 'in2', dir: 'in', p: [0, -hl, 0], h: 90 }, { name: 'in3', dir: 'in', p: [0, hl, 0], h: -90 }];
      return [...ins.slice(0, p.inputs), { name: 'out', dir: 'out', p: [hl, 0, 0], h: 0 }];
    }
    case 'divert': {
      const outs = [{ name: 'out1', dir: 'out', p: [hl, 0, 0], h: 0 }, { name: 'out2', dir: 'out', p: [0, hl, 0], h: 90 }, { name: 'out3', dir: 'out', p: [0, -hl, 0], h: -90 }];
      return [{ name: 'in', dir: 'in', p: [-hl, 0, 0], h: 0 }, ...outs.slice(0, p.outputs)];
    }
    case 'source': return [{ name: 'out', dir: 'out', p: [hl, 0, 0], h: 0 }];
    case 'sink': return [{ name: 'in', dir: 'in', p: [-hl, 0, 0], h: 0 }];
    case 'sensor': return [];
    case 'agv-pick': return [{ name: 'in', dir: 'in', p: [-hl, 0, 0], h: 0 }, { name: 'node', dir: 'agv', p: [hl + 0.5, 0, 0], h: 0 }];
    case 'agv-drop': return [{ name: 'node', dir: 'agv', p: [-hl - 0.5, 0, 0], h: 0 }, { name: 'out', dir: 'out', p: [hl, 0, 0], h: 0 }];
    default: return [{ name: 'in', dir: 'in', p: [-hl, 0, 0], h: 0 }, { name: 'out', dir: 'out', p: [hl, 0, 0], h: 0 }];
  }
}

export function footprint(kind, p) {
  const hl = HALF[kind] ?? 0.3;
  switch (kind) {
    case 'station': return { l: 1.2, w: 1.2, h: 1.0 };
    case 'buffer': return { l: 1.0, w: 0.8, h: 0.3 };
    case 'source': case 'sink': return { l: 0.6, w: 0.8, h: 0.6 };
    case 'merge': case 'divert': return { l: 0.6, w: 0.6, h: 0.08 };
    case 'gate': return { l: 0.2, w: 0.7, h: 0.4 };
    case 'sensor': return { l: 0.05, w: 0.05, h: 0.5 };
    case 'agv-pick': case 'agv-drop': return { l: 0.6, w: 0.8, h: 0.5 };
    case 'transfer': return { l: 0.6, w: 0.7, h: 0.1 };
    default: return { l: 2 * hl, w: p.width || 0.6, h: 0.1 };
  }
}

/** "A 1 0.4, B 3 0.6" → [{type, weight, length}] (a source's load types); nothing usable → one type A. */
export function parseTypes(text) {
  const out = [];
  for (const part of String(text || '').split(',')) {
    const [type, w, l] = part.trim().split(/\s+/);
    if (!type || !/^[A-Za-z0-9_-]{1,20}$/.test(type)) continue;
    const weight = Number(w ?? 1), length = Number(l ?? 0.4);
    if (!(weight >= 0) || !(length > 0 && length <= 20)) continue;
    out.push({ type, weight, length });
  }
  return out.length ? out.slice(0, 20) : [{ type: 'A', weight: 1, length: 0.4 }];
}
/** "A 1, B 2" → {A: 1, B: 2} (divert by type). */
export function parseMap(text) {
  const out = {};
  for (const part of String(text || '').split(',')) {
    const [type, n] = part.trim().split(/\s+/);
    if (type && /^[A-Za-z0-9_-]{1,20}$/.test(type) && Number.isInteger(Number(n)) && Number(n) >= 1) out[type] = Number(n);
  }
  return out;
}
export const parseNumbers = (text) => String(text || '').split(/[\s,]+/).filter(Boolean).map(Number).filter((x) => Number.isFinite(x) && x >= 0);
export const parseIds = (text) => String(text || '').split(/[\s,]+/).filter(Boolean);
