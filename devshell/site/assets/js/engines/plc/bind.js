/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bind.js — bind the soft PLC (sim.js) to a plant that is NOT one of plant.js's three: a flow model (lib/des) or the objects of a 3D scene (0.8 XE.13, virtual
 * commissioning). The PLC's contract with a plant is three methods, sense() / command(name, value) / step(dtMs); this file builds them from plain descriptions.
 * DOM-free, imports nothing (a des Sim and a scene are handed in, so lib/plc stays free of lib/des).
 *
 *   callbackPlant({ sense, command, step })                       any object: sense() → {name: value}, command(name, value), step(dtMs)
 *   desPlant(sim, { sensors, commands, timePerSecond })           a lib/des Sim (needs sim.advance(until), sim.nodes)
 *        sensors:  { <name>: 'queue:<node>' | 'busy:<node>' | 'count:<sink>' | 'inside:<node>' | 'open:<gate>' | 'blocked:<node>' }   numbers or booleans
 *        commands: { <name>: 'gate:<node>' }                       a command opens (true) or shuts (false) that gate
 *        timePerSecond: model time units per second of PLC time (default 1)
 *   scenePlant(scene, { sensors, commands })                      a 3D scene: scene.read(object, property) → value, scene.apply(object, property, value), scene.step?(dtMs)
 *        sensors:  { <name>: 'object.property' }   commands: { <name>: 'object.property' }
 *   addressMap(sensors, commands, { inputBase = 0, outputBase = 0 })  → { sense: {'%IX0.0': name}, command: {'%QX0.0': name}, st: 'VAR … END_VAR' }   the bind() tables and the ST declarations
 * A binding that names something that is not there is a Problems-shape problem returned in `problems` (rule 29), never a throw.
 */
const problem = (code, text, about = []) => ({ id: 'plc:bind:' + code + ':' + about.map((a) => a.id).join(','), code, severity: 'error', text, about, source: { kind: 'engine', name: 'cc-plc' } });

export function callbackPlant({ sense, command, step } = {}) {
  return { sense: () => (sense ? sense() : {}), command: (n, v) => { if (command) command(n, v); }, step: (dt) => { if (step) step(dt); } };
}

const KINDS = {
  queue: (n) => (Array.isArray(n.q) ? n.q.length : Array.isArray(n.items) ? n.items.length : Number(n.items) || 0),
  busy: (n) => (Array.isArray(n.units) ? n.units.some((u) => u.state === 'busy') : Array.isArray(n.v) ? n.v.some((v) => v.state !== 'idle') : false),
  count: (n) => Number(n.count) || 0,
  inside: (n) => (n.n !== undefined ? Number(n.n) : Number(n.items) || 0),
  open: (n) => !!n.isOpen,
  blocked: (n) => (Array.isArray(n.units) ? n.units.some((u) => u.state === 'blocked') : false),
};

export function desPlant(sim, { sensors = {}, commands = {}, timePerSecond = 1 } = {}) {
  const problems = [], reads = {}, writes = {};
  const node = (name, what, id) => { const n = sim && sim.nodes && sim.nodes.get(name); if (!n) problems.push(problem('node', `${what} "${id}" names "${name}", which is not a node of the model.`, [{ id }])); return n; };
  for (const [id, spec] of Object.entries(sensors)) {
    const m = /^(\w+):(.+)$/.exec(String(spec));
    if (!m || !KINDS[m[1]]) { problems.push(problem('sensor', `Sensor "${id}": "${spec}" must be one of ${Object.keys(KINDS).map((k) => k + ':<node>').join(', ')}.`, [{ id }])); continue; }
    const n = node(m[2], 'Sensor', id); if (n) reads[id] = () => KINDS[m[1]](n);
  }
  for (const [id, spec] of Object.entries(commands)) {
    const m = /^gate:(.+)$/.exec(String(spec));
    if (!m) { problems.push(problem('command', `Command "${id}": "${spec}" must be gate:<node>.`, [{ id }])); continue; }
    const n = node(m[1], 'Command', id);
    if (n && typeof n.setOpen !== 'function') problems.push(problem('gate', `Command "${id}": "${m[1]}" is not a gate (a node of type gate).`, [{ id }])); else if (n) writes[id] = (v) => n.setOpen(!!v);
  }
  const plant = callbackPlant({
    sense: () => Object.fromEntries(Object.entries(reads).map(([k, f]) => [k, f()])),
    command: (name, v) => { if (writes[name]) writes[name](v); },
    step: (dtMs) => { sim.advance(sim.t + (dtMs / 1000) * timePerSecond); },
  });
  plant.problems = problems;
  return plant;
}

export function scenePlant(scene, { sensors = {}, commands = {} } = {}) {
  const problems = [], split = (s) => { const m = /^([^.]+)\.(.+)$/.exec(String(s)); return m ? [m[1], m[2]] : null; };
  const reads = {}, writes = {};
  if (!scene || typeof scene.read !== 'function' || typeof scene.apply !== 'function') problems.push(problem('scene', 'The scene needs read(object, property) and apply(object, property, value).'));
  else {
    for (const [id, spec] of Object.entries(sensors)) { const p = split(spec); if (!p) problems.push(problem('sensor', `Sensor "${id}": "${spec}" must be object.property.`, [{ id }])); else reads[id] = () => scene.read(p[0], p[1]); }
    for (const [id, spec] of Object.entries(commands)) { const p = split(spec); if (!p) problems.push(problem('command', `Command "${id}": "${spec}" must be object.property.`, [{ id }])); else writes[id] = (v) => scene.apply(p[0], p[1], v); }
  }
  const plant = callbackPlant({ sense: () => Object.fromEntries(Object.entries(reads).map(([k, f]) => [k, f()])), command: (n, v) => { if (writes[n]) writes[n](v); }, step: (dt) => { if (scene && scene.step) scene.step(dt); } });
  plant.problems = problems;
  return plant;
}

/** SoftPLC.bind tables and the ST variable declarations for them: booleans on %IX/%QX, numbers on %IW/%QW (sensors named in `numeric` are numbers). */
export function addressMap(sensors, commands, { numeric = [] } = {}) {
  const sense = {}, command = {}, lines = [];
  let bi = 0, wi = 0;
  for (const id of Object.keys(sensors)) {
    const isNum = numeric.includes(id), addr = isNum ? `%IW${wi++}` : `%IX${Math.floor(bi / 8)}.${bi++ % 8}`;
    sense[addr] = id; lines.push(`  ${id} AT ${addr} : ${isNum ? 'INT' : 'BOOL'};`);
  }
  let bo = 0;
  for (const id of Object.keys(commands)) { const addr = `%QX${Math.floor(bo / 8)}.${bo++ % 8}`; command[addr] = id; lines.push(`  ${id} AT ${addr} : BOOL;`); }
  return { sense, command, st: 'VAR\n' + lines.join('\n') + '\nEND_VAR' };
}
