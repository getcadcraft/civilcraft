/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC §5) */
/**
 * water-agent.js — the Water mains tools for AI assistants and scripts (0.8 LC.16, session `civil-extra-08`), in the shape
 * landscape/ls-agent.js uses (host.control.tool(def)); civilcraft.js registers them and tools/cli/headless/civil.mjs loads them for the
 * MCP server and the command line. No DOM. Coordinates and quantities in the project's units (ft: ft / in / gpm / psi; m: m / mm / L/s / kPa).
 *
 *   waterTools(app) → [tool definitions]   app.project(), app.groundAt?(x, y), app.changed?()
 *
 *   water_describe   read  nodes and links with their data
 *   water_build      edit  add nodes and links (ids you give or the next free), one undo step; or `replace: true` to start over
 *   water_solve      read  heads, pressures, flows, velocities, problems — a calculation aid
 *   water_fire_flow  read  the pressures with a draw at a junction, and the flow that leaves a residual pressure
 *   water_inp        read  the network as EPANET-format text (export) · or, with `text`, edit: read EPANET-format text into the project
 *   water_fittings   read  the hydrants and valves placed, the tees, bends, reducers and caps the layout implies, and the schedule (0.8 CV.2)
 *   water_fitting_add edit  place a hydrant on a junction, or a valve / air valve / blow-off / meter on a main — one undo step
 */
import { cleanWater, emptyWater, solve, fireFlow, writeInp, readInp } from './water.js';
import { layout, schedule, FITTING_KINDS } from './water-objects.js';   // 0.8 CV.2 (civil_PART_3)

const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const AID = 'A calculation aid, not a stamped design: an engineer checks every result.';
const NODE = { type: 'object', properties: {
  id: { type: 'string', maxLength: 255 }, name: { type: 'string', maxLength: 255 }, x: { type: 'number' }, y: { type: 'number' }, z: { type: ['number', 'null'], description: 'Elevation; null takes it from the ground.' },
  kind: { type: 'string', enum: ['junction', 'reservoir', 'tank'] }, demand: { type: 'number', minimum: 0, description: 'Junction demand (gpm | L/s).' },
  head: { type: ['number', 'null'], description: 'Reservoir total head (blank = its elevation).' },
  level: { type: 'number' }, minLevel: { type: 'number' }, maxLevel: { type: 'number' }, diameter: { type: 'number', description: 'Tank diameter, in length units.' } },
  required: ['x', 'y'], additionalProperties: false };
const LINK = { type: 'object', properties: {
  id: { type: 'string', maxLength: 255 }, name: { type: 'string', maxLength: 255 }, a: { type: 'string', maxLength: 255 }, b: { type: 'string', maxLength: 255 }, kind: { type: 'string', enum: ['pipe', 'pump', 'prv'] },
  length: { type: ['number', 'null'], description: 'Null = along the plan.' }, d: { type: 'number', description: 'Diameter (in | mm).' }, c: { type: ['number', 'null'] }, minor: { type: 'number', minimum: 0 },
  status: { type: 'string', enum: ['open', 'closed'] }, check: { type: 'boolean' }, setting: { type: 'number', description: 'PRV: the pressure it holds downstream (psi | kPa).' },
  curve: { type: 'array', maxItems: 3, items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, description: 'Pump: [[flow, head]] (one design point, or shutoff + two points).' } },
  required: ['a', 'b'], additionalProperties: false };

export function waterTools(app) {
  const P = () => app.project();
  const U = () => (P().state.units === 'm' ? 'm' : 'ft');
  const W = () => P().state.water || emptyWater(U());
  const edit = (label, fn) => { const r = P().change(label, (s) => { if (!s.water) s.water = emptyWater(U()); fn(s.water, s); }); app.changed?.(); return r; };
  const units = () => (U() === 'm' ? { length: 'm', diameter: 'mm', flow: 'L/s', pressure: 'kPa' } : { length: 'ft', diameter: 'in', flow: 'gpm', pressure: 'psi' });
  const shape = (res) => ({
    ok: res.ok, iterations: res.iterations, units: units(), note: AID,
    nodes: [...res.nodes].map(([id, n]) => ({ id, kind: n.kind, head: r3(n.head), pressure: r3(n.pressure), demand: r3(n.demand), ...(n.inflow != null ? { inflow: r3(n.inflow) } : {}) })),
    links: [...res.pipes].map(([id, p]) => ({ id, kind: p.kind, flow: r3(p.q), velocity: r3(p.v), headLoss: r3(p.hl), headLossPer1000: r3(p.hl1000), status: p.status })),
    problems: res.problems, totalDemand: r3(res.totals.demand),
  });
  return [
    { name: 'water_describe', group: 'read', untrusted: true, title: 'Describe the water mains',
      description: 'The water network of the open site: junctions, reservoirs, tanks, pipes, pumps and pressure reducing valves with their data, and the limits it is checked against.',
      run: () => { const w = W(); return { units: units(), settings: w.settings, nodes: w.nodes, links: w.pipes }; } },
    { name: 'water_build', group: 'edit', rollbackPreview: true, title: 'Build water mains',
      description: 'Add nodes (junction, reservoir, tank) and links (pipe, pump, prv) to the water network in one undo step. Link ends name node ids. With replace: true the old network goes first. A junction with no z takes the ground elevation. ' + AID,
      inputSchema: { type: 'object', properties: { nodes: { description: 'Nodes to add: junction, reservoir or tank, with id, x, y and data.', type: 'array', items: NODE, maxItems: 2000 }, links: { description: 'Links to add: pipe, pump or prv, with id, the two node ids and data.', type: 'array', items: LINK, maxItems: 4000 }, replace: { description: 'true replaces the whole network instead of adding to it (default false).', type: 'boolean' } }, additionalProperties: false },
      run: (a) => {
        if (!a.nodes?.length && !a.links?.length) throw new Error('Give nodes, links or both.');
        const p = P(), have = new Set(a.replace ? [] : W().nodes.map((n) => n.id));
        const given = (a.nodes || []).map((n) => ({ ...n, id: n.id || p.nextId('wm') }));
        for (const n of given) {
          if (have.has(n.id)) throw new Error(`Node ${n.id} exists already.`);
          have.add(n.id);
          if ((n.z == null) && app.groundAt && n.kind !== 'reservoir') { const z = app.groundAt(n.x, n.y); n.z = z == null ? null : r3(z); }
        }
        const links = (a.links || []).map((l) => ({ ...l, id: l.id || p.nextId('wm'), kind: l.kind || 'pipe' }));
        for (const l of links) if (!have.has(l.a) || !have.has(l.b)) throw new Error(`Link ${l.id} joins ${l.a} and ${l.b}: both must be nodes (new or already there).`);
        const before = a.replace ? { nodes: 0, links: 0 } : { nodes: W().nodes.length, links: W().pipes.length };
        edit('Assistant: build water mains', (w, s) => {
          const base = a.replace ? emptyWater(U()) : w;
          const merged = cleanWater({ nodes: [...base.nodes, ...given], pipes: [...base.pipes, ...links], settings: base.settings }, U());
          s.water = merged;
        });
        const now = W();
        return { nodes: now.nodes.length - before.nodes, links: now.pipes.length - before.links, droppedNodes: given.length - (now.nodes.length - before.nodes), droppedLinks: links.length - (now.pipes.length - before.links) };
      } },
    { name: 'water_solve', group: 'read', title: 'Solve the water mains',
      description: 'Steady-state heads, pressures, flows and velocities (Hazen–Williams, the gradient method), with every problem found: low or high pressure, fast pipes, cut-off nodes, a solver that did not settle. ' + AID,
      inputSchema: { type: 'object', properties: { demandMultiplier: { description: 'Multiplies every demand (default 1).', type: 'number', minimum: 0 } }, additionalProperties: false },
      run: (a) => {
        const w = W();
        if (!w.nodes.length || !w.pipes.length) throw new Error('No water network yet. Use water_build.');
        return shape(solve(w, U(), { mult: a.demandMultiplier ?? 1 }));
      } },
    { name: 'water_fire_flow', group: 'read', title: 'Fire flow',
      description: 'Draw a flow at one junction (others as they are): the pressure there and the lowest anywhere; and the flow available while the weakest node keeps the residual pressure. ' + AID,
      inputSchema: { type: 'object', properties: { node: { description: 'Id of the junction to draw the flow at.', type: 'string', maxLength: 255 }, flow: { description: 'Flow to draw there, in the project flow unit.', type: 'number', minimum: 0 }, residual: { type: 'number', exclusiveMinimum: 0, description: 'Pressure to keep (psi | kPa); default 20 psi | 140 kPa.' } }, required: ['node'], additionalProperties: false },
      run: (a) => {
        const f = fireFlow(W(), U(), a.node, { flow: a.flow, residual: a.residual });
        if (f.error) throw new Error('Fire flow is drawn at a junction: ' + a.node + ' is not one.');
        return { units: units(), note: AID, residual: f.residual, basePressureMin: r3(f.base), available: f.available == null ? null : r3(f.available),
          atFlow: f.atFlow && { flow: a.flow, nodePressure: r3(f.atFlow.nodePressure), minPressure: r3(f.atFlow.minPressure), at: f.atFlow.at, problems: f.atFlow.problems } };
      } },
    { name: 'water_inp', group: 'edit', rollbackPreview: true, title: 'EPANET-format text',
      description: 'Without `text`: the water network as EPANET-format text (GPM/ft/in/psi, or LPS/m/mm). With `text`: read such text into the open site (one undo step), replacing the water network. Pumps with power ratings, other valve types and other flow units are named and left out.',
      inputSchema: { type: 'object', properties: { text: { description: 'EPANET-format text to read into the project; without it the network is returned as text.', type: 'string', maxLength: 8000000 } }, additionalProperties: false },
      run: (a) => {
        if (a.text == null) { const w = W(); if (!w.nodes.length) throw new Error('No water network yet.'); return { text: writeInp(w, U()), units: units() }; }
        const r = readInp(a.text, U());
        if (!r.water) throw new Error('Could not read it: ' + r.notes.join(', '));
        if (r.units !== U()) throw new Error(`The file is in ${r.units === 'm' ? 'SI (LPS)' : 'US (GPM)'} units and this project is in ${U()}.`);
        edit('Assistant: read EPANET text', (w, s) => { s.water = r.water; });
        return { nodes: r.water.nodes.length, links: r.water.pipes.length, notes: r.notes };
      } },
    { name: 'water_fittings', group: 'read', title: 'Hydrants, valves and fittings',
      description: 'The objects on the water mains: hydrants and valves placed by the person, and the tees, crosses, bends, reducers and caps the layout implies, each with its place and size, plus a schedule that counts them and the mains by size. Mains are laid at the ground less the cover. ' + AID,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      outputSchema: { type: 'object', properties: { fixtures: { type: 'array', items: { type: 'object' } }, schedule: { type: 'object' } } },
      run: () => {
        const w = W();
        if (!w.nodes.length) throw new Error('No water network yet. Use water_build.');
        const L = layout(w, U(), { zAt: (x, y) => (app.groundAt ? app.groundAt(x, y) : null) }), sch = schedule(L.fixtures, L.pipes, U());
        return { note: AID + ' The derived fittings are what the layout implies, not a bill of quantities.', units: units(), cover: L.cover,
          fixtures: L.fixtures.map((f) => ({ id: f.id, kind: f.kind, source: f.source, x: r3(f.x), y: r3(f.y), depthLevel: f.z == null ? null : r3(f.z), size: f.dia ?? null, ...(f.angle != null ? { angleDegrees: f.angle } : {}), on: f.host })),
          schedule: sch };
      } },
    { name: 'water_fitting_add', group: 'edit', rollbackPreview: true, title: 'Place a hydrant or valve',
      description: 'Place a hydrant on a junction (node), or a valve, air valve, blow-off or meter on a node or along a main (pipe, t from 0 at its start to 1 at its end). One undo step.',
      inputSchema: { type: 'object', properties: { kind: { description: 'What to place.', type: 'string', enum: FITTING_KINDS }, node: { description: 'A junction id (hydrants go here).', type: 'string', maxLength: 255 }, pipe: { description: 'A main id, for a valve and the like.', type: 'string', maxLength: 255 },
        t: { description: 'Where along the main, 0–1. Default 0.5.', type: 'number', minimum: 0, maximum: 1 }, name: { description: 'A label for the plan.', type: 'string', maxLength: 60 } }, required: ['kind'], additionalProperties: false },
      outputSchema: { type: 'object', properties: { fitting: { type: 'string' } } },
      run: (a) => {
        const w = W(), host = a.node ? { node: a.node } : a.pipe ? { pipe: a.pipe, t: a.t ?? 0.5 } : null;
        if (!host) throw new Error('Say where: node or pipe.');
        if (a.node && !w.nodes.some((n) => n.id === a.node)) throw new Error('There is no node ' + a.node + '.');
        if (a.pipe && !w.pipes.some((p) => p.id === a.pipe)) throw new Error('There is no main ' + a.pipe + '.');
        if (a.kind === 'hydrant' && !host.node) throw new Error('A hydrant stands on a junction: give node.');
        const id = P().nextId('wf');
        edit('Assistant: place a ' + a.kind, (wm) => { (wm.fittings ||= []).push({ id, kind: a.kind, host, name: String(a.name || '').slice(0, 60), note: '' }); });
        return { fitting: id };
      } },
  ];
}
