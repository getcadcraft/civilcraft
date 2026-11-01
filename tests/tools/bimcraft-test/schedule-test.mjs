/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --schedule` (0.8 SU.931, session ifc-08): schedule-io.js — MSPDI and CSV in and out, links
 * (FS/SS/FF/SF with lag), the critical path on a network worked by hand, cycles, hostile XML, the Gantt SVG.
 * Known network (calendar days, Finish inclusive), all durations in days:
 *   A 5 (day 0..4) → FS → B 3 → FS → D 2 ;  A → FS+2 → C 10 ;  C → FS → D ;  E 4 starts day 0, no links.
 *   B starts 5..7, C starts 7..16, D = after C: 17..18. Critical: A, C, D. B float: LS(B) = 15−... computed below.
 */
import path from 'node:path';

export async function scheduleMode({ APP }) {
  const S = await import(path.join(APP, 'schedule-io.js'));
  const F = await import(path.join(APP, 'ifc-4d.js'));
  let bad = 0, good = 0;
  const ok = (c, l) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + l); };
  const d0 = F.parseDay('2026-11-02');
  const T = (uid, name, s, n, preds = [], extra = {}) => ({ uid, name, start: d0 + s, finish: d0 + s + n - 1, stage: '', package: '', rows: [], preds, ...extra });
  const net = [
    T('1', 'A', 0, 5, [], { stage: 'Shell', package: 'Walls', rows: [{ field: 'Storey', value: 'Level 1', line: 0 }] }),
    T('2', 'B', 5, 3, [{ uid: '1', type: 'FS', lag: 0 }], { stage: 'Shell', package: 'Walls' }),
    T('3', 'C', 7, 10, [{ uid: '1', type: 'FS', lag: 2 }], { stage: 'Shell' }),
    T('4', 'D', 17, 2, [{ uid: '2', type: 'FS', lag: 0 }, { uid: '3', type: 'FS', lag: 0 }]),
    T('5', 'E', 0, 4),
  ];
  // by hand: A 0..4 · B es 5..7 · C es 7..16 · D es 17..18 · E 0..3 · finish 18
  // float: B ls = D.ls(17) − 3 = 14 → B float 9 · E ls = 18−4+1 = 15 → float 15 · A,C,D critical
  const p = S.plan(net);
  const by = Object.fromEntries(p.tasks.map((t) => [t.name, t]));
  ok(p.finish === d0 + 18, 'finish day 18');
  ok(p.critical.join() === '1,3,4', 'critical path A, C, D');
  ok(by.B.float === 9 && by.E.float === 15, 'floats B 9, E 15');
  ok(by.C.es === d0 + 7 && by.D.es === d0 + 17, 'early starts follow the links');
  // SS / FF / SF with lags, by hand
  const x = S.plan([T('a', 'a', 0, 10), T('b', 'b', 0, 4, [{ uid: 'a', type: 'SS', lag: 3 }]), T('c', 'c', 0, 2, [{ uid: 'a', type: 'FF', lag: 1 }]), T('d', 'd', 0, 3, [{ uid: 'a', type: 'SF', lag: 5 }])]);
  const xb = Object.fromEntries(x.tasks.map((t) => [t.name, t]));
  ok(xb.b.es === d0 + 3, 'SS+3: b starts day 3');
  ok(xb.c.ef === d0 + 10, 'FF+1: c finishes day 10 (a finishes day 9)');
  ok(xb.d.ef === d0 + 4, 'SF+5: d finishes day 4 (a starts day 0, +5, the day before the FS slot)');
  ok(S.plan([T('p', 'p', 0, 2, [{ uid: 'q', type: 'FS', lag: 0 }]), T('q', 'q', 0, 2, [{ uid: 'p', type: 'FS', lag: 0 }])]).errors[0]?.message === 'cycle', 'a cycle is an error');
  ok(S.plan([T('p', 'p', 0, 2, [{ uid: 'zz', type: 'FS', lag: 0 }])]).errors[0]?.message === 'nopred', 'a missing predecessor is reported');
  // MSPDI round trip
  const xml = S.writeMspdi(net, { title: 'Fixture & <test>' });
  ok(xml.includes('Fixture &amp; &lt;test&gt;'), 'MSPDI escapes the title');
  const back = S.readMspdi(xml);
  ok(!back.errors.length && back.tasks.length === 5, 'MSPDI reads back five tasks, no errors');
  const bb = Object.fromEntries(back.tasks.map((t) => [t.name, t]));
  ok(bb.A.start === net[0].start && bb.A.finish === net[0].finish, 'dates survive');
  ok(bb.A.stage === 'Shell' && bb.A.package === 'Walls' && bb.C.stage === 'Shell' && bb.C.package === '', 'outline gives stage and package');
  ok(bb.A.rows[0]?.field === 'Storey' && bb.A.rows[0].value === 'Level 1', 'element rows ride in Notes');
  ok(bb.C.preds[0]?.type === 'FS' && bb.C.preds[0].lag === 2 && bb.D.preds.length === 2, 'links and lag survive');
  const p2 = S.plan(back.tasks);
  ok(p2.critical.length === 3 && p2.finish === p.finish, 'the read-back plans to the same critical path');
  // a file written by Project: UID 0 summary row, summary tasks, a lag in tenths of a minute (2 days = 9600), type 3 = SS
  const real = `<?xml version="1.0"?><Project xmlns="http://schemas.microsoft.com/project"><MinutesPerDay>480</MinutesPerDay><Tasks>
    <Task><UID>0</UID><ID>0</ID><Name>Plan</Name><OutlineLevel>0</OutlineLevel><Summary>1</Summary></Task>
    <Task><UID>1</UID><Name>Phase</Name><OutlineLevel>1</OutlineLevel><Summary>1</Summary></Task>
    <Task><UID>2</UID><Name>Dig</Name><OutlineLevel>2</OutlineLevel><Summary>0</Summary><Start>2026-11-02T08:00:00</Start><Finish>2026-11-06T17:00:00</Finish></Task>
    <Task><UID>3</UID><Name>Pour</Name><OutlineLevel>2</OutlineLevel><Summary>0</Summary><Start>2026-11-04T08:00:00</Start><Finish>2026-11-10T17:00:00</Finish>
      <PredecessorLink><PredecessorUID>2</PredecessorUID><Type>3</Type><LinkLag>9600</LinkLag></PredecessorLink></Task></Tasks></Project>`;
  const r = S.readMspdi(real);
  ok(r.tasks.length === 2 && r.tasks[0].stage === 'Phase' && r.tasks[1].preds[0].type === 'SS' && r.tasks[1].preds[0].lag === 2, 'a Project-style file: summary → stage, Type 3 = SS, lag 9600 = 2 days');
  ok(S.readMspdi('<!DOCTYPE x [<!ENTITY a "b">]><Project/>').errors[0].message === 'doctype', 'DOCTYPE / entity declarations are refused');
  ok(S.readMspdi('<Project><Tasks><Task><UID>1</UID><Name>x</Name><Start>2026-02-30T08:00:00</Start><Finish>2026-03-01T08:00:00</Finish></Task></Tasks></Project>').errors[0].message === 'date', 'an impossible date is reported');
  ok(S.readMspdi('not xml at all').errors.length === 1, 'not a project file is one error');
  // CSV round trip + ifc-4d.js still reads our CSV
  const csv = S.writeCsv(net);
  const c = S.readCsv(csv);
  ok(!c.errors.length && c.tasks.length === 5, 'CSV reads back five tasks');
  ok(c.tasks.find((t) => t.name === 'C').preds[0].lag === 2 && c.tasks.find((t) => t.name === 'D').preds.length === 2, 'CSV predecessors with lag survive');
  const old = F.parseTasks(csv);
  ok(old.tasks.length === 5 && !old.errors.length, "ifc-4d.js's reader still opens the file we write");
  ok(S.readCsv('Task,Start,Finish,Predecessors\r\nA,2026-11-02,2026-11-04,\r\nB,2026-11-05,2026-11-06,1SS+2d|A\r\n').errors.some((e) => e.message === 'nopred'), 'a predecessor that names no task is reported');
  const pp = S.parsePreds('3FS+2d|4SS|5FF-1d|7');
  ok(pp.preds.length === 4 && pp.preds[0].lag === 2 && pp.preds[1].type === 'SS' && pp.preds[2].lag === -1 && pp.preds[3].type === 'FS', 'predecessor cells parse (FS default, +/- days)');
  ok(S.writeCsv([T('=1', '=SUM(A1)', 0, 1)]).includes("\"'=SUM(A1)\""), 'CSV formula injection is neutralised');
  // Gantt
  const svg = S.ganttSvg(p);
  ok(svg.startsWith('<svg') && (svg.match(/data-critical="1"/g) || []).length === 3 && (svg.match(/data-critical="0"/g) || []).length === 2, 'Gantt: five bars, three marked critical');
  ok(svg.includes('<path') && !svg.includes('<script'), 'Gantt: dependency arrows, no script');
  ok(S.ganttSvg([]) === '', 'Gantt of nothing is empty');
  console.log(`schedule: ${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
