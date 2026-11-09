/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui/risk.js — the Engines panel's descriptor for lib/risk (0.8 XE.8). Input: one JSON object with any of the sections
 *   faultTree { tree, events }, rbd { node, comps, t }, fmea { rows, rpnLimit }, weibull { times, censored }, markov { states, transitions, p0, t, up }, riskFile { hazards, matrix }.
 * Sections that are absent are skipped. The engine's own problems pass through unchanged.
 */
const EX_PLANT = {
  faultTree: { tree: { or: [{ event: 'A' }, { and: [{ event: 'B' }, { event: 'C' }] }] }, events: { A: { p: 0.01 }, B: { p: 0.1 }, C: { p: 0.2 } } },
  rbd: { node: { series: [{ parallel: [{ block: 'A' }, { block: 'B' }] }, { block: 'C' }] }, comps: { A: { lambda: 0.001 }, B: { lambda: 0.001 }, C: { lambda: 0.0005 } }, t: 500 },
  markov: { states: ['up', 'down'], transitions: [{ from: 'up', to: 'down', rate: 0.002 }, { from: 'down', to: 'up', rate: 0.1 }], p0: [1, 0], t: 100, up: [true, false] },
};
const EX_LIFE = {
  weibull: { times: [38, 52, 61, 70, 78, 85, 93, 101, 110, 124], censored: [false, false, false, false, false, false, false, false, false, false] },
  fmea: { rpnLimit: 150, rows: [
    { id: 'a', item: 'pump', mode: 'seal leaks', S: 6, O: 4, D: 5, action: 'inspect seals' },
    { id: 'b', item: 'valve', mode: 'sticks', S: 9, O: 2, D: 2 },
    { id: 'c', item: 'sensor', mode: 'drifts', S: 3, O: 8, D: 7 }] },
  riskFile: {
    matrix: { severity: ['Minor', 'Serious'], probability: ['Rare', 'Occasional'], levels: ['acceptable', 'reduce', 'unacceptable'], cells: [['acceptable', 'reduce'], ['reduce', 'unacceptable']] },
    hazards: [{ id: 'H1', hazard: 'Hot surface', situation: 'Touch during use', harm: 'Burn', S: 1, P: 1, controls: [{ id: 'C1', text: 'Guard', verified: true }], residual: { S: 1, P: 0 } }] },
};

const sec = (title, head, rows) => ({ title, head, rows });

export default {
  inputLabel: 'Risk model (JSON)',
  examples: [
    { id: 'plant', name: 'Fault tree, diagram and repairable pair', text: JSON.stringify(EX_PLANT, null, 1) },
    { id: 'life', name: 'Weibull life data, FMEA and a risk file', text: JSON.stringify(EX_LIFE, null, 1) },
  ],
  load: () => import('../risk/index.js'),
  run(R, text) {
    const o = JSON.parse(text);
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('The input must be a JSON object with sections such as faultTree, rbd, fmea, weibull, markov or riskFile.');
    const tables = [], problems = [], notes = [];
    const take = (r) => { for (const p of r.problems || []) problems.push(p); if (r.method) notes.push(r.method.name + ' (' + r.method.ref + ')'); return r; };
    if (o.faultTree) {
      const r = take(R.faultTree(o.faultTree.tree, o.faultTree.events || {}));
      if (r.ok) {
        tables.push(sec('Fault tree', ['Measure', 'Value'], [['Top event probability', r.top], ['Rare-event bound', r.rareEvent], ['Min-cut upper bound', r.minCutUpperBound], ['Repeated events', r.repeated.join(', ')]]));
        tables.push(sec('Minimal cut sets', ['Cut set', 'Probability'], r.cutSets.map((s, i) => [s.join(' + '), r.cutSetProbabilities[i]])));
        tables.push(sec('Importance', ['Event', 'p', 'Birnbaum', 'Fussell-Vesely', 'RAW', 'RRW'], Object.entries(r.importance).map(([id, m]) => [id, m.p, m.birnbaum, m.fussellVesely, m.raw, m.rrw])));
      }
    }
    if (o.rbd) {
      const t = Number(o.rbd.t);
      const r = take(R.rbd(o.rbd.node, o.rbd.comps || {}, t));
      if (r.ok) {
        const m = R.rbdMttf(o.rbd.node, o.rbd.comps || {});
        tables.push(sec('Reliability block diagram', ['Measure', 'Value'], [['Mission time', t], ['Reliability', r.reliability], ['Unreliability', r.unreliability], ['MTTF (not repairable)', m.mttf]]));
      }
    }
    if (o.fmea) {
      const r = take(R.fmea(o.fmea.rows || [], { rpnLimit: o.fmea.rpnLimit ?? null }));
      tables.push(sec('FMEA ranked by RPN', ['Rank', 'Id', 'Item', 'Mode', 'S', 'O', 'D', 'RPN', 'Cumulative share'], r.ranked.map((x) => [x.rank, x.id, x.item, x.mode, x.S, x.O, x.D, x.rpn, x.cumulative])));
    }
    if (o.weibull) {
      const r = take(R.fitMLE(o.weibull.times || [], o.weibull.censored || null));
      if (r.ok) tables.push(sec('Weibull fit (maximum likelihood)', ['Measure', 'Value'], [['Shape (beta)', r.beta], ['Scale (eta)', r.eta], ['Failures', r.failures], ['Suspended', r.suspended], ['Mean life', r.mean], ['B10 life', r.b10], ['Reading', r.shape],
        ['Beta bounds', r.bounds ? r.bounds.beta.map((v) => +v.toPrecision(4)).join(' to ') : ''], ['Eta bounds', r.bounds ? r.bounds.eta.map((v) => +v.toPrecision(4)).join(' to ') : '']]));
    }
    if (o.markov) {
      const c = take(R.chain(o.markov.states || [], o.markov.transitions || []));
      if (c.ok) {
        const s = take(R.steady(c));
        const rows = [];
        if (s.ok) for (const [k, v] of Object.entries(s.probs)) rows.push([k, v]);
        tables.push(sec('Long-run state probabilities', ['State', 'Probability'], rows));
        if (Array.isArray(o.markov.p0) && o.markov.t >= 0) {
          const p = R.transient(c, o.markov.p0, o.markov.t);
          tables.push(sec('State probabilities at t = ' + o.markov.t, ['State', 'Probability'], c.states.map((k, i) => [k, p[i]])));
        }
        if (Array.isArray(o.markov.up) && s.ok) { const a = R.availability(c, o.markov.up); if (a.ok) tables.push(sec('Availability', ['Measure', 'Value'], [['Long-run availability', a.availability]])); }
      }
    }
    if (o.riskFile) {
      const r = take(R.riskFile(o.riskFile.hazards || [], o.riskFile.matrix || {}));
      if (r.rows) {
        tables.push(sec('Risk file', ['Hazard', 'Harm', 'Initial', 'Residual', 'Controls'], r.rows.map((h) => [h.id, h.harm, h.initial, h.residualLevel, (h.controls || []).length])));
        tables.push(sec('Residual risk counts', ['Level', 'Hazards'], Object.entries(r.residualCounts || {})));
      }
    }
    if (!tables.length && !problems.length) problems.push({ code: 'empty', severity: 'warning', text: 'No known section found: use faultTree, rbd, fmea, weibull, markov or riskFile.' });
    return { tables, problems, notes: [...new Set(notes)] };
  },
};
