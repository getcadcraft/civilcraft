/* SPDX-License-Identifier: Apache-2.0 */
// Descriptor for the shell's Engines panel: lib/em (XE.10), the circuit solver. Input is a SPICE-style netlist (title line first, cards .op .dc .ac .tran).
const RC = `RC low-pass
V1 in 0 DC 0 AC 1
R1 in out 1k
C1 out 0 159.1549n
.ac dec 10 10 100k
.end`;
const DIVIDER = `Divider and a step
V1 a 0 PULSE(0 5 0 1n 1n 1 2)
R1 a b 1k
C1 b 0 1u
.op
.tran 10u 3m
.end`;
const take = (arr, n) => { if (arr.length <= n) return arr.map((_, i) => i); const out = []; for (let k = 0; k < n; k++) out.push(Math.round(k * (arr.length - 1) / (n - 1))); return out; };

export default {
  inputLabel: 'Netlist (SPICE-style cards: R C L V I E G D Q M S, .model, .op .dc .ac .tran)',
  examples: [
    { id: 'rc', name: 'RC low-pass, AC sweep', text: RC },
    { id: 'step', name: 'RC step response, operating point and transient', text: DIVIDER },
  ],
  load: () => import('../em/index.js'),
  run(E, text) {
    const d = E.parseDeck(text), problems = [...d.problems], tables = [], notes = [];
    if (!d.analyses.length) problems.push({ code: 'em:no-analysis', severity: 'warning', text: 'The netlist has no analysis card (.op, .dc, .ac or .tran), so nothing was run.' });
    if (problems.some((p) => p.severity === 'error')) return { tables, problems };
    const nodes = (v) => Object.keys(v).filter((n) => n !== '0');
    for (const { type, result: r } of E.runDeck(d)) {
      problems.push(...(r.problems || []));
      if (!r.ok) continue;
      if (type === 'op') tables.push({ title: 'Operating point', head: ['Node', 'Volts'], rows: Object.entries(r.v).map(([n, v]) => [n, v]) });
      else if (type === 'dc') { const ns = nodes(r.v); tables.push({ title: 'DC sweep', head: ['Sweep', ...ns], rows: take(r.sweep, 12).map((k) => [r.sweep[k], ...ns.map((n) => r.v[n][k])]) }); }
      else if (type === 'ac') { const ns = nodes(r.v); tables.push({ title: 'AC response (magnitude, phase °)', head: ['Hz', ...ns.flatMap((n) => [n + ' mag', n + ' deg'])], rows: take(r.f, 41).map((k) => [r.f[k], ...ns.flatMap((n) => [E.mag(r.v[n][k]), E.phaseDeg(r.v[n][k])])]) }); }
      else if (type === 'tran') { const ns = nodes(r.v); tables.push({ title: 'Transient', head: ['t (s)', ...ns], rows: take(r.t, 12).map((k) => [r.t[k], ...ns.map((n) => r.v[n][k])]) }); notes.push('Transient: ' + r.t.length + ' points.'); }
    }
    return { tables, problems, notes };
  },
};
