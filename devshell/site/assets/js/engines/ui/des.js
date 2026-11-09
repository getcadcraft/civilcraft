/* SPDX-License-Identifier: Apache-2.0 */
// Panel descriptor for lib/des (XE.5): replicated discrete-event runs of a flow model.
const MM1 = { until: 8000, warmup: 500, runs: 8, seed: 5, model: { nodes: [
  { type: 'source', name: 'in', arrival: { exp: 1.25 }, to: 'desk' },
  { type: 'server', name: 'desk', service: { exp: 1 }, to: 'out' },
  { type: 'sink', name: 'out' }] } };
const TWO = { until: 4000, warmup: 200, runs: 6, seed: 11, model: { nodes: [
  { type: 'source', name: 'arrivals', arrival: { exp: 2 }, to: 'check-in' },
  { type: 'server', name: 'check-in', units: 2, service: { exp: 3 }, to: 'walk' },
  { type: 'delay', name: 'walk', time: { uniform: [1, 2] }, to: 'gate' },
  { type: 'server', name: 'gate', service: { const: 1.5 }, queue: 20, to: 'out' },
  { type: 'sink', name: 'out' }] } };

export default {
  inputLabel: 'Simulation (JSON: model.nodes, until, warmup, runs, seed)',
  examples: [
    { id: 'mm1', name: 'One server, arrivals every 1.25 (utilisation 0.8)', text: JSON.stringify(MM1, null, 1) },
    { id: 'line', name: 'Check-in, walk and gate', text: JSON.stringify(TWO, null, 1) },
  ],
  load: () => import('../des/index.js'),
  run(D, text) {
    const input = JSON.parse(text);
    if (!input || !input.model || !Array.isArray(input.model.nodes)) throw new Error('The input needs model.nodes.');
    const until = input.until, warmup = input.warmup || 0, runs = Math.min(50, Math.max(1, input.runs || 5)), seed = input.seed || 1;
    const first = D.simulate(input.model, { until, warmup, seed });
    if (!first.ok) return { tables: [], problems: first.problems };
    const res = first.result, names = Object.keys(res.nodes), sinks = names.filter((n) => res.nodes[n].type === 'sink'), servers = names.filter((n) => res.nodes[n].type === 'server');
    const metrics = { 'Entities in the system (average)': (r) => r.wip.average };
    for (const n of servers) { metrics[n + ': utilisation'] = (r) => r.nodes[n].utilization; metrics[n + ': wait in queue'] = (r) => r.nodes[n].wait.mean; metrics[n + ': queue length'] = (r) => r.nodes[n].queue.average; }
    for (const n of sinks) { metrics[n + ': throughput per time unit'] = (r) => r.nodes[n].throughput; if (res.nodes[n].cycle) metrics[n + ': time in the system'] = (r) => r.nodes[n].cycle.mean; }
    const rep = D.replicate(input.model, { runs, until, warmup, seed }, metrics);
    if (!rep.runs) return { tables: [], problems: rep.problems };
    const tables = [{ title: runs + ' replications, mean and 95 % interval', head: ['Measure', 'Mean', 'Low', 'High', 'Std dev'], rows: Object.entries(rep.metrics).map(([k, m]) => [k, m.mean, m.low, m.high, m.sd]) }];
    tables.push({ title: 'First run, node by node', head: ['Node', 'Type', 'Utilisation', 'Throughput', 'Mean wait'], rows: names.map((n) => { const r = res.nodes[n]; return [n, r.type, r.utilization ?? '', r.throughput ?? '', r.wait ? r.wait.mean : '']; }) });
    return { tables, problems: [...first.problems, ...(rep.problems || [])], notes: ['Time has no fixed unit: every number is in the unit you used in the model.', 'Events in the first run: ' + res.events + '.'] };
  },
};
