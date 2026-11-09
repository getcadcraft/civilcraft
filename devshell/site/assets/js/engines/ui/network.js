/* SPDX-License-Identifier: Apache-2.0 */
// Descriptor for the shell's Engines panel: lib/network (XE.2). Input is JSON with any of: fluid, loadflow, shortcircuit, protection.
const WATER = { fluid: { nodes: [{ id: 'R', head: 100 }, { id: 'J', demand: 0.05 }], links: [{ id: 'p', from: 'R', to: 'J', type: 'pipe', L: 1000, D: 0.3, C: 120 }] } };
const POWER = {
  loadflow: { baseMVA: 100, buses: [{ id: 1, type: 'slack', V: 1 }, { id: 2, type: 'pq', Pd: 0.8, Qd: 0.3 }], branches: [{ id: 'l', from: 1, to: 2, r: 0.02, x: 0.06 }] },
  shortcircuit: { baseMVA: 100, buses: [{ id: 1, kV: 11 }], branches: [], sources: [{ bus: 1, z1: [0, 0.1], z2: [0, 0.1], z0: [0, 0.3] }] },
  protection: { up: { pickup: 100, curve: 'VI', tms: 0.5 }, down: { pickup: 100, curve: 'NI', tms: 0.1 }, currents: [500, 1000, 2000], cti: 0.3 },
};
const rows = (o, f) => Object.entries(o || {}).map(([k, v]) => [k, ...f(v)]);

export default {
  inputLabel: 'Network model (JSON: fluid, loadflow, shortcircuit, protection)',
  examples: [
    { id: 'water', name: 'One pipe from a reservoir', text: JSON.stringify(WATER, null, 1) },
    { id: 'power', name: 'Two-bus load flow, a fault and relay grading', text: JSON.stringify(POWER, null, 1) },
  ],
  load: () => import('../network/index.js'),
  run(N, text) {
    const m = JSON.parse(text); if (!m || typeof m !== 'object') throw new Error('The model must be a JSON object.');
    const tables = [], problems = [], notes = [];
    if (m.fluid) {
      const r = N.solveNetwork(m.fluid); problems.push(...r.problems); notes.push(...(r.notes || []));
      tables.push({ title: 'Nodes (head, m)', head: ['Node', 'Head', 'Pressure head', 'Demand'], rows: rows(r.nodes, (n) => [n.head, n.pressureHead, n.demand]) });
      tables.push({ title: 'Links', head: ['Link', 'Flow (m³/s)', 'Loss (m)', 'Velocity (m/s)', 'Status'], rows: rows(r.links, (l) => [l.Q, l.loss, l.v, l.status]) });
      notes.push('Solved in ' + r.iterations + ' iterations.');
    }
    if (m.loadflow) {
      const r = N.loadFlow(m.loadflow, m.options || {}); problems.push(...r.problems);
      tables.push({ title: 'Buses (per unit)', head: ['Bus', 'V', 'Angle (°)', 'P', 'Q'], rows: rows(r.buses, (b) => [b.V, b.theta, b.P, b.Q]) });
      tables.push({ title: 'Branches', head: ['Branch', 'P from', 'Q from', 'Loading (MVA)', 'Loss (pu)'], rows: rows(r.branches, (b) => [b.Pf, b.Qf, b.Sf, b.loss]) });
      if (r.slack) notes.push('Slack supplies P = ' + +r.slack.P.toPrecision(6) + ' pu, losses ' + +r.loss.P.toPrecision(6) + ' pu.');
    }
    if (m.shortcircuit) {
      const r = N.faultStudy(m.shortcircuit, m.study || {}); problems.push(...r.problems);
      tables.push({ title: 'Fault currents', head: ['Bus', 'Type', 'Ik (A)', 'Peak ip (A)', 'Ik (pu)'], rows: r.rows.map((x) => [x.bus, x.type, x.Ik, x.ip, x.pu]) });
    }
    if (m.protection) {
      const p = m.protection, r = N.coordinate(p.up, p.down, p.currents || [], { cti: p.cti ?? 0.3 }); problems.push(...r.problems);
      tables.push({ title: 'Relay grading', head: ['Current (A)', 'Downstream (s)', 'Upstream (s)', 'Margin (s)', 'OK'], rows: r.rows.map((x) => [x.I, x.down, x.up, x.margin, x.ok ? 'yes' : 'no']) });
    }
    if (!tables.length) throw new Error('Give at least one of fluid, loadflow, shortcircuit, protection.');
    return { tables, problems, notes };
  },
};
