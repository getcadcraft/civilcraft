/* SPDX-License-Identifier: Apache-2.0 */
const { ok, eq, section, fixture, mine } = globalThis.__chipTest;
const SE = await mine('session.js');
import { makeCtx } from './ctx.mjs';


section('Session');
{
  const { ctx, sets, writes, store } = makeCtx({ 'alu.v': fixture('alu.v'), 'two_stage.v': fixture('two_stage.v'), 'readme.txt': 'x', 'bad.v': fixture('bad.v') });
  const s = SE.sessionFor(ctx);
  ok(SE.sessionFor(ctx) === s, 'one session per ctx');
  eq(await s.load(), ['alu.v', 'bad.v', 'two_stage.v'], 'loads HDL files only, sorted');
  eq(s.current, 'alu.v', 'first file selected');
  eq([sets.length, sets[0].src], [1, 'hdl'], 'rows handed to the Problems store once, source chip.hdl');
  eq(s.counts(), { error: 4, warning: 3, note: 0 }, 'bad.v errors; spare_block, bad and bad2 not used');
  eq(s.counts('bad.v').error, 4, 'counts per file');
  let edits = 0; s.on('edit', () => edits++);
  s.edit('bad.v', fixture('bad.v').replace('output y)', 'output y);').replace('a & ;', 'a & b;').replace('t | c', 't').replace("1'b1\n", "1'b1;\n"));
  eq([edits, s.dirty.has('bad.v')], [1, true], 'edit marks the file');
  s.check();
  eq(s.counts('bad.v'), { error: 0, warning: 2, note: 0 }, 'fixed: only "not used" warnings for bad and bad2');
  await s.save('bad.v');
  ok(writes.includes('bad.v') && store.get('bad.v').includes('a & b;') && !s.dirty.has('bad.v'), 'save writes through ctx.files');
  eq(s.addFile('notes.txt', 'x'), false, 'a file that is not HDL is refused');
  eq(s.addFile('new.vhd', 'entity n is end;'), true, 'new VHDL file');
  eq(s.current, 'new.vhd', 'and selected');
  s.setTop('pipe2_tb');
  eq(s.result.hier.top, 'pipe2_tb', 'top chosen by hand');
  s.setTop('');
  eq(s.result.hier.top, 'pipe2', 'back to automatic');
  await s.load();
  ok(s.files.has('new.vhd'), 'a new unsaved file survives a reload');
  const { ctx: c3 } = makeCtx({ 'rtl.v': fixture('alu.v'), 'out/synth.v': fixture('alu.v').replace('module alu', 'module alu'), 'out/notes.txt': 'x' });
  const s3 = SE.sessionFor(c3); await s3.load();
  eq([s3.names(), s3.result.outputs.map((o) => o.file + ':' + o.modules.map((m) => m.name))], [['rtl.v'], ['out/synth.v:alu']], 'out/ files are outputs, not sources (no "defined twice")');
  eq(s3.result.problems.length, 0, 'and add no problems');
  const { ctx: c2 } = makeCtx({ 'a.v': 'module a(input x); FOO u(.i(x)); endmodule' }, { knownCells: () => ['FOO'] });
  const s2 = SE.sessionFor(c2); await s2.load();
  eq(s2.result.hier.missing, [], 'known cells from the host (HD.3 Liberty) are not missing');
}
{
  const rows = [{ file: 'a.v', line: 3, severity: 'warning', text: 'w' }, { file: 'a.v', line: 3, severity: 'error', text: 'e' }, { file: 'b.v', line: 1, severity: 'error', text: 'x' }, { file: 'a.v', line: 0, severity: 'note', text: 'n' }];
  const g = SE.gutterMarks(rows, 'a.v');
  eq([...g.keys()], [3], 'marks only lines of this file');
  eq(g.get(3), { severity: 'error', texts: ['w', 'e'] }, 'worst severity wins, every text kept');
  const t = 'ab\ncde\n\nf';
  eq([SE.offsetOf(t, 1, 1), SE.offsetOf(t, 2, 2), SE.offsetOf(t, 4, 1), SE.offsetOf(t, 9, 1)], [0, 4, 8, 9], 'offsetOf');
  eq([SE.lineColOf(t, 4), SE.lineColOf(t, 8)], [{ line: 2, col: 2 }, { line: 4, col: 1 }], 'lineColOf');
}
