/* SPDX-License-Identifier: Apache-2.0 */
// Panel descriptor for lib/schedule (XE.6): critical path, calendar dates, resource levelling, cost curve, earned value, schedule risk.
const EX1 = {
  start: '2026-11-02',
  tasks: [
    { id: 'A', name: 'Excavate', dur: 5, cost: 1000 },
    { id: 'B', name: 'Footings', dur: 3, deps: ['A'], cost: 600 },
    { id: 'D', name: 'Services', dur: 4, deps: ['A'], cost: 800 },
    { id: 'C', name: 'Slab', dur: 2, deps: ['B', 'D'], cost: 500 },
  ],
};
const EX2 = {
  start: '2026-11-02',
  tasks: [
    { id: 'A', name: 'Strip out', dur: 4, res: { crew: 2 }, cost: 400 },
    { id: 'B', name: 'Pipework', dur: 6, deps: ['A'], res: { crew: 2 } },
    { id: 'C', name: 'Cabling', dur: 5, deps: ['A'], res: { crew: 2 } },
    { id: 'D', name: 'Commission', dur: 2, deps: [{ id: 'B', type: 'FS', lag: 1 }, 'C'], res: { crew: 1 } },
  ],
  rates: { crew: 300 },
  limits: { crew: 2 },
  status: { day: 6, progress: { A: { pct: 1, ac: 1300 }, B: { pct: 0.2, ac: 400 } } },
  simulate: { n: 500, seed: 3 },
};
const fmt = (x) => (x == null ? '' : x);

export default {
  inputLabel: 'Schedule (JSON: start, tasks, optional rates, limits, status, simulate)',
  examples: [
    { id: 'simple', name: 'Four tasks, two paths', text: JSON.stringify(EX1, null, 1) },
    { id: 'crew', name: 'One crew, lags, cost and risk', text: JSON.stringify(EX2, null, 1) },
  ],
  load: () => import('../schedule/index.js'),
  run(S, text) {
    const input = JSON.parse(text);
    if (!input || !Array.isArray(input.tasks)) throw new Error('The input needs a "tasks" list.');
    const tasks = input.tasks, rates = input.rates || {}, problems = [], notes = [], tables = [];
    const r = S.cpm(tasks, { deadline: input.deadline });
    problems.push(...(r.problems || []));
    if (!r.ok) return { tables, problems, notes };
    const cal = input.start ? S.makeCalendar({ start: input.start, workdays: input.workdays, holidays: input.holidays }) : null;
    const ids = tasks.map((t) => t.id);
    tables.push({ title: 'Critical path (working days from the start)', head: ['Task', 'Name', 'Days', 'Start', 'Finish', 'Total float', 'Free float', 'Critical'].concat(cal ? ['Starts on', 'Finishes on'] : []),
      rows: ids.map((i) => { const x = r.tasks[i]; return [i, x.name, x.dur, x.ES, x.EF, x.TF, x.FF, x.critical ? 'yes' : ''].concat(cal ? [cal.dateOf(x.ES), cal.finishDate(x.EF, x.dur)] : []); }) });
    notes.push('Project finishes after ' + r.finish + ' working days' + (cal ? ' (' + cal.finishDate(r.finish) + ')' : '') + '.');
    if (r.method) notes.push(r.method.name + ' — ' + r.method.limits.join(' '));
    let starts = r.tasks;
    if (input.limits && Object.keys(input.limits).length) {
      const l = S.level(tasks, { limits: input.limits });
      problems.push(...(l.problems || []).filter((p) => p.code !== 'late'));
      if (l.ok) {
        starts = l.starts;
        tables.push({ title: 'Levelled to the resource limits', head: ['Task', 'Start', 'Finish'], rows: ids.map((i) => [i, l.starts[i].ES, l.starts[i].EF]) });
        notes.push('Levelled finish ' + l.finish + ' working days (unlimited: ' + l.unlimitedFinish + '). Peak use: ' + JSON.stringify(l.peak) + '.');
      }
    }
    const cc = S.costCurve(tasks, starts, rates);
    if (cc.total > 0) {
      tables.push({ title: 'Cost curve (cumulative, by working day)', head: ['Day', 'Cost that day', 'Cumulative'], rows: cc.perDay.map((v, k) => [k, v, cc.cumulative[k]]) });
      notes.push('Budget at completion ' + cc.total + '.');
    }
    if (input.status && cc.total > 0) {
      const e = S.earnedValue(tasks, starts, input.status.day, input.status.progress || {}, rates);
      problems.push(...(e.problems || []).filter((p) => p.severity !== 'info'));
      tables.push({ title: 'Earned value on day ' + input.status.day, head: ['Measure', 'Value'], rows: [['Planned value', e.pv], ['Earned value', e.ev], ['Actual cost', e.ac], ['Schedule variance', e.sv], ['Cost variance', e.cv],
        ['SPI', fmt(e.spi)], ['CPI', fmt(e.cpi)], ['Earned schedule', fmt(e.earnedSchedule)], ['EAC (typical)', e.eac ? e.eac.typical : ''], ['VAC', fmt(e.vac)]] });
    }
    if (input.simulate) {
      const s = S.simulate(tasks.map((t) => ({ ...t })), { n: Math.min(5000, input.simulate.n || 1000), seed: input.simulate.seed || 1 });
      if (s.ok) {
        tables.push({ title: 'Schedule risk (finish, working days)', head: ['P10', 'P50', 'P80', 'P90', 'Mean', 'Runs'], rows: [[s.p10, s.p50, s.p80, s.p90, s.mean, s.n]] });
        tables.push({ title: 'Criticality index', head: ['Task', 'Critical in'], rows: ids.map((i) => [i, Math.round(s.criticality[i] * 100) + ' %']) });
      } else problems.push(...(s.problems || []));
    }
    return { tables, problems, notes };
  },
};
