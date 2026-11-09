/* SPDX-License-Identifier: Apache-2.0 */
/**
 * examples.js — the Material flow add-on's example layouts (0.8 SU.858, session sx-flow), built only by snapping items to each
 * other's ports (layout.addAfter), so they also prove the snapping. DOM-free.
 *   exampleLine()  source → belt → divert (round-robin) → two lanes with a station each → merge → belt → sink
 *   exampleAgv()   source → belt → AGV pickup; a square one-way AGV loop with 2 vehicles; drop → belt → sink
 */
import { newLayout, addAfter, worldPorts, nextId, place } from './layout.js';
import { defaults } from './catalog.js';

function chain(layout, start, steps) {
  let at = start;
  for (const [kind, params, port = 'out'] of steps) {
    const it = addAfter(layout, at.id, at.port, kind, { ...defaults(kind), ...params });
    layout.items.push(it);
    at = { id: it.id, port };
  }
  return at;
}

export function exampleLine() {
  const L = newLayout();
  L.items.push({ id: 'source-1', kind: 'source', x: 0, y: 0, z: 0.8, rot: 0, params: { ...defaults('source'), interarrival: { kind: 'exp', mean: 20 }, types: 'A 3 0.4, B 1 0.6' } });
  const belt = { speed: 0.5, gap: 0.1, accumulate: true, width: 0.6 };
  const d = chain(L, { id: 'source-1', port: 'out' }, [['conveyor', { ...belt, length: 4 }], ['divert', { outputs: 2, rule: 'round-robin' }]]);
  const divert = d.id;
  // lane 1 straight on
  chain(L, { id: divert, port: 'out1' }, [
    ['conveyor', { ...belt, length: 2 }], ['station', { servers: 1, queue: 3, time: { kind: 'normal', mean: 30, sd: 5 } }], ['conveyor', { ...belt, length: 2 }],
    ['merge', { inputs: 3, rule: 'fifo' }, 'out'],
  ]);
  const merge = L.items[L.items.length - 1].id;
  // lane 2 round to the left and back into the merge's third input
  chain(L, { id: divert, port: 'out2' }, [
    ['conveyor', { ...belt, length: 1 }], ['curve', { ...belt, radius: 1, angle: -90 }], ['conveyor', { ...belt, length: 1.3 }],
    ['station', { servers: 1, queue: 3, time: { kind: 'normal', mean: 30, sd: 5 } }], ['conveyor', { ...belt, length: 1.3 }],
    ['curve', { ...belt, radius: 1, angle: -90 }], ['conveyor', { ...belt, length: 1 }],
  ]);
  chain(L, { id: merge, port: 'out' }, [['conveyor', { ...belt, length: 3 }], ['sink', {}]]);
  L.run = { seed: 1, hours: 8, warmup: 30 };
  return L;
}

export function exampleAgv() {
  const L = newLayout();
  L.items.push({ id: 'source-1', kind: 'source', x: 0, y: 0, z: 0.8, rot: 0, params: { ...defaults('source'), interarrival: { kind: 'exp', mean: 40 } } });
  const pk = chain(L, { id: 'source-1', port: 'out' }, [['conveyor', { length: 3, speed: 0.5, gap: 0.1, accumulate: true, width: 0.6 }], ['agv-pick', { capacity: 4 }, 'node']]);
  const pick = L.items.find((i) => i.id === pk.id);
  // a one-way square loop from the pickup's node: north, east, south, west, 6 m each (each segment starts where the last ends)
  let p = worldPorts(pick).find((x) => x.name === 'node').p;
  const corners = [];
  for (const h of [90, 0, -90, 180]) {
    const it = { id: nextId(L, 'agv-path'), kind: 'agv-path', x: p[0], y: p[1], z: p[2], rot: (h + 360) % 360, params: { ...defaults('agv-path'), length: 6 } };
    L.items.push(it);
    p = worldPorts(it).find((x) => x.name === 'b').p;
    corners.push(p);
  }
  const dropParams = { ...defaults('agv-drop'), capacity: 4 };
  const drop = { id: 'agvdrop-1', kind: 'agv-drop', ...place('agv-drop', dropParams, 'node', corners[1], 0), params: dropParams };
  L.items.push(drop);
  pick.params.to = drop.id;
  chain(L, { id: drop.id, port: 'out' }, [['conveyor', { length: 3, speed: 0.5, gap: 0.1, accumulate: true, width: 0.6 }], ['sink', {}]]);
  L.fleet = { vehicles: 2, speed: 1, load: 5, unload: 5 };
  L.run = { seed: 1, hours: 8, warmup: 30 };
  return L;
}
