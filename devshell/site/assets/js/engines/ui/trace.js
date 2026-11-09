/* SPDX-License-Identifier: Apache-2.0 */
// Descriptor for the shell's Engines panel: lib/trace (XE.7). Input is a cadcraft-trace JSON file (an optional "impact": "<item id>" names the item whose
// neighbours are listed) or a ReqIF 1.2 file (anything starting with "<"). Output: the verification matrix, the roll-up to parents, coverage, problems and impact.
const PUMP = "{\"format\":\"cadcraft-trace\",\"version\":1,\"name\":\"Pump skid\",\"items\":[{\"id\":\"R-1\",\"kind\":\"requirement\",\"title\":\"Flow\",\"text\":\"The pump shall deliver 50 m3/h.\",\"status\":\"approved\",\"parent\":null,\"attrs\":{}},{\"id\":\"R-1.1\",\"kind\":\"requirement\",\"title\":\"Flow at low head\",\"text\":\"At 20 m head.\",\"status\":\"approved\",\"parent\":\"R-1\",\"attrs\":{}},{\"id\":\"R-1.2\",\"kind\":\"requirement\",\"title\":\"Flow at high head\",\"text\":\"At 40 m head.\",\"status\":\"approved\",\"parent\":\"R-1\",\"attrs\":{}},{\"id\":\"R-2\",\"kind\":\"requirement\",\"title\":\"Noise\",\"text\":\"Below 75 dB(A) at 1 m.\",\"status\":\"approved\",\"parent\":null,\"attrs\":{}},{\"id\":\"E-pump\",\"kind\":\"element\",\"title\":\"Pump P-101\",\"text\":\"\",\"status\":\"draft\",\"parent\":null,\"attrs\":{}},{\"id\":\"T-1\",\"kind\":\"test\",\"title\":\"Flow test A\",\"text\":\"\",\"status\":\"draft\",\"parent\":null,\"attrs\":{}},{\"id\":\"T-2\",\"kind\":\"test\",\"title\":\"Flow test B\",\"text\":\"\",\"status\":\"draft\",\"parent\":null,\"attrs\":{}}],\"links\":[{\"from\":\"E-pump\",\"to\":\"R-1.1\",\"type\":\"satisfies\"},{\"from\":\"E-pump\",\"to\":\"R-1.2\",\"type\":\"satisfies\"},{\"from\":\"E-pump\",\"to\":\"R-2\",\"type\":\"satisfies\"},{\"from\":\"T-1\",\"to\":\"R-1.1\",\"type\":\"verifies\"},{\"from\":\"T-2\",\"to\":\"R-1.2\",\"type\":\"verifies\"}],\"results\":[{\"test\":\"T-1\",\"outcome\":\"pass\",\"at\":\"2026-10-01T00:00:00.000Z\",\"by\":\"\",\"note\":\"\",\"evidence\":\"\"},{\"test\":\"T-2\",\"outcome\":\"fail\",\"at\":\"2026-10-02T00:00:00.000Z\",\"by\":\"\",\"note\":\"\",\"evidence\":\"\"}],\"impact\":\"E-pump\"}";

export default {
  inputLabel: 'Requirements (cadcraft-trace JSON, or a ReqIF file)',
  examples: [
    { id: 'pump', name: 'A pump skid: requirements, an element, two tests (one failed)', text: PUMP },
  ],
  load: () => import('../trace/index.js'),
  run(T, text) {
    const problems = [];
    let spec, want = null;
    if (/^\s*</.test(text)) { const r = T.readReqif(text); spec = r.spec; problems.push(...r.problems); }
    else {
      let o; try { o = JSON.parse(text); } catch (e) { return { tables: [], problems: [{ code: 'trace.json', severity: 'error', text: 'Not JSON: ' + e.message }] }; }
      spec = T.Spec.fromJSON(o); want = o && typeof o.impact === 'string' ? o.impact : null;
      problems.push(...spec.errors.map((t) => ({ code: 'trace.read', severity: 'error', text: t })));
    }
    if (!spec.items.size) return { tables: [], problems: problems.length ? problems : [{ code: 'trace.empty', severity: 'error', text: 'No items were read.' }] };
    const cyc = T.cycles(spec);
    problems.push(...T.check(spec), ...(Array.isArray(cyc) ? cyc.filter((p) => p && p.severity) : []));
    const roll = T.rollup(spec), m = T.matrix(spec), cov = T.coverage(spec);
    const tables = [
      { title: 'Verification matrix', head: ['Requirement', 'Title', 'Status', 'Elements', 'Tests', 'State', 'With children'], rows: m.map((r) => [r.id, r.title, r.status, r.elements.map((e) => e.id).join(' '), r.tests.map((t) => t.id + ':' + t.outcome).join(' '), r.state, roll.get(r.id)]) },
      { title: 'Coverage', head: ['Measure', 'Count'], rows: Object.entries(cov).filter(([, v]) => typeof v === 'number') },
    ];
    const target = want && spec.get(want) ? want : (m[0] && (m[0].elements[0] ? m[0].elements[0].id : m[0].id));
    if (target) tables.push({ title: 'Impact of ' + target, head: ['Item', 'Kind', 'Distance', 'Title'], rows: T.impact(spec, target).map((x) => [x.id, x.kind, x.distance, x.title]) });
    return { tables, problems, notes: [T.DISCLAIMER] };
  },
};
