#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** lib/history: chunks, undo by change records (compared with whole-document snapshots on random edits), the journal.  node lib/history/test/test.mjs */
import assert from 'node:assert/strict';
import { split, join, ChunkHistory, chunkJournal, objectJournal, foldChunks, recoverState, recoverExtras, serializeKeys } from '../index.js';

let pass = 0;
const ok = (c, m) => { assert.ok(c, m); pass++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); pass++; };
const J = (x) => JSON.stringify(x);
let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const pick = (a) => a[Math.floor(rnd() * a.length)];

const spec = { arrays: { members: 'id', conns: 'id' } };
const doc = () => ({ name: 'x', seq: 1, members: [{ id: 'm1', n: 1 }, { id: 'm2', n: 2 }], conns: [{ id: 'c1', a: 'm1' }], cfg: { a: [1, 2], b: null }, list: [1, 2, 3] });

// split / join
{
  const d = doc();
  eq(join(new Map(split(d, spec)), spec), d, 'join(split) = the document');
  eq(Object.keys(join(new Map(split(d, spec)), spec)), Object.keys(d), 'key order kept');
  const dup = { members: [{ id: 'a' }, { id: 'a' }] };
  eq(join(new Map(split(dup, spec)), spec), dup, 'duplicate ids stay one chunk');
  const noid = { members: [{ x: 1 }, 5] };
  eq(join(new Map(split(noid, spec)), spec), noid, 'elements without ids stay one chunk');
  eq(join(new Map(split({ members: [] }, spec)), spec), { members: [] }, 'empty array');
  const keys = new Set(['k:name', 'e:members:m2', 'o:members', 'e:members:zz', '#keys']);
  const s = serializeKeys(d, spec, keys);
  eq(s.get('k:name'), '"x"'); eq(s.get('e:members:m2'), J(d.members[1])); eq(s.get('e:members:zz'), null, 'unknown element = absent');
}

// undoing the edit that made a list's first element takes the list's key away again (tests-10 FX: CivilCraft sectionLines)
{
  const d = doc(); delete d.conns; const h = new ChunkHistory({ spec }).reset(d);
  d.conns = [{ id: 'c1', a: 'm1' }];
  ok(h.commit(d, 'make the list'), 'the new list is a step');
  h.undo(d); ok(!('conns' in d), 'undo: the key is gone, not an empty list');
  h.redo(d); eq(d.conns, [{ id: 'c1', a: 'm1' }], 'redo brings it back');
}

// one step costs what changed
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d);
  d.members[1].n = 99;
  const st = h.commit(d, 'edit');
  eq([...st.redo.keys()], ['e:members:m2'], 'only the changed element is recorded');
  ok(h.commit(d, 'nothing') === null, 'no change, no step');
  eq(h.undo(d), 'edit'); eq(d.members[1].n, 2, 'undone');
  ok(h.canRedo && !h.canUndo);
  eq(h.redo(d), 'edit'); eq(d.members[1].n, 99, 'redone');
}

// random edits: change records agree with whole-document snapshots at every step of undo and redo
{
  const d = doc(); const h = new ChunkHistory({ spec, limit: 1000 }).reset(d);
  const snaps = [J(d)], redoSnaps = [];
  let nextId = 10;
  const edit = () => {
    const r = rnd();
    if (r < 0.2) d.members.push({ id: 'm' + nextId++, n: Math.floor(rnd() * 9) });
    else if (r < 0.35 && d.members.length) d.members.splice(Math.floor(rnd() * d.members.length), 1);
    else if (r < 0.5 && d.members.length) pick(d.members).n = Math.floor(rnd() * 100);
    else if (r < 0.6 && d.members.length > 1) { const a = d.members.splice(0, 1)[0]; d.members.push(a); }
    else if (r < 0.7) d.conns.push({ id: 'c' + nextId++, a: 'm1' });
    else if (r < 0.78) d.cfg.a.push(nextId++);
    else if (r < 0.84) d.seq++;
    else if (r < 0.9) { d.extra = d.extra ? undefined : { z: 1 }; if (d.extra === undefined) delete d.extra; }
    else if (r < 0.95) d.list.reverse();
    else d.name = 'n' + nextId++;
  };
  for (let i = 0; i < 300; i++) {
    const before = J(d); edit();
    const st = h.commit(d, 'e' + i);
    if (J(d) === before) { ok(st === null, 'no-op edit makes no step'); continue; }
    ok(st, 'edit makes a step'); snaps.push(J(d)); redoSnaps.length = 0;
    if (rnd() < 0.3) {   // undo a few, check each against the snapshot of that time, then redo them
      const n = 1 + Math.floor(rnd() * 4); let k = 0;
      for (; k < n && h.canUndo; k++) { h.undo(d); eq(J(d), snaps[snaps.length - 2 - k], 'undo matches snapshot'); }
      for (let j = k - 1; j >= 0; j--) { h.redo(d); eq(J(d), snaps[snaps.length - 1 - j], 'redo matches snapshot'); }
    }
  }
  // the table still equals the state
  eq(new Map(split(d, spec)), h.cur, 'chunk table = state after the run');
}

// keys hint: same result as a full scan
{
  const a = doc(), b = doc();
  const ha = new ChunkHistory({ spec }).reset(a), hb = new ChunkHistory({ spec }).reset(b);
  a.members[0].n = 5; b.members[0].n = 5;
  ha.commit(a, 'x'); hb.commit(b, 'x', { keys: new Set(['e:members:m1']) });
  eq(ha.cur, hb.cur, 'hinted commit = full commit');
  a.members.push({ id: 'q', n: 0 }); b.members.push({ id: 'q', n: 0 });
  ha.commit(a, 'y'); hb.commit(b, 'y', { keys: new Set(['o:members', 'e:members:q']) });
  eq(ha.cur, hb.cur, 'hinted add = full add');
  hb.undo(b); eq(J(b), J(a.members.pop() && a), 'hinted undo');
}

// rollback after a throw
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d); const before = J(d);
  d.members[0].n = -1; d.members.push({ id: 'zz' }); d.name = 'broken'; delete d.cfg;
  ok(h.rollback(d)); eq(J(d), before, 'rollback restores the state'); ok(!h.rollback(d));
}

// limits: bytes and steps
{
  const d = { big: 'x'.repeat(1000), seq: 0 }; const h = new ChunkHistory({ limit: 5, minSteps: 2 }).reset(d);
  for (let i = 0; i < 20; i++) { d.seq++; h.commit(d, 's' + i); }
  eq(h.undoStack.length, 5, 'limit steps');
  const h2 = new ChunkHistory({ maxBytes: 3000, minSteps: 2, limit: 100 }).reset(d);
  for (let i = 0; i < 20; i++) { d.big = String(i).repeat(300); h2.commit(d, 's' + i); }
  ok(h2.undoStack.length === 2 && h2.bytes > 3000, 'maxBytes trims the oldest, keeps minSteps');
}

// amend
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d);
  d.members[0].n = 5; h.commit(d, 'drag');
  d.members[0].n = 7; d.seq = 5; h.amend(d);
  eq(h.undoStack.length, 1, 'amend keeps one step'); h.undo(d); eq(d.members[0].n, 1, 'undo goes to before the drag'); eq(d.seq, 1);
}

// journal: base, deltas, a failed write, recovery
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d); const j = chunkJournal(h);
  const base = await j.base(); await base.commit();
  ok((await j.delta()) === null, 'nothing dirty after a base');
  d.members[0].n = 11; h.commit(d, 'a');
  const d1 = await j.delta();               // write fails: no commit
  const d1b = await j.delta();
  eq(d1b.data.set.map((x) => x[0]), ['e:members:m1'], 'a failed write leaves the chunk dirty');
  d1b.commit();
  d.members.push({ id: 'm9', n: 9 }); d.cfg = { z: 1 }; h.commit(d, 'b');
  h.undo(d); h.redo(d); d.members.splice(0, 1); h.commit(d, 'c');
  const d2 = await j.delta(); d2.commit();
  const rec = { data: base.data, segments: [d1b.data, d2.data] };
  eq(recoverState(rec, spec), d, 'base + deltas recover the last state');
  eq(foldChunks(rec.data, rec.segments), h.cur, 'folded table = live table');
  ok(d2.size < (await h.takeAll()).bytes, 'a delta is smaller than the whole');
}

// begin / sync: the snapshot-before-edit protocol (PartCraft)
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d); const before = J(d);
  h.begin('drag'); d.members[0].n = 50;
  ok(h.sync(d), 'mid-edit sync (autosave) sees the change'); ok(h.undoStack[0].open, 'the step stays open');
  d.members[0].n = 60; d.cfg = { z: 1 }; h.sync(d, { close: true });
  ok(!h.undoStack[0].open, 'closed');
  eq(h.undo(d), 'drag'); eq(J(d), before, 'one undo reverts the whole drag, also what an autosave saw half-way');
  h.redo(d); eq(d.members[0].n, 60);
  // an edit without a step is adopted, not undoable
  d.seq = 77; h.sync(d); ok(h.undoStack.length === 1, 'adopted, no step'); h.undo(d); eq(d.seq, 77, 'the adopted change stays through undo');
  // a failed edit pops its open step
  h.begin('bad'); h.undoStack.pop(); ok(h.sync(d) === false, 'nothing to settle');
  eq(h.undoStack.history, h, 'stacks know their history'); const st = h.undoStack; h.reset(d); ok(h.undoStack === st, 'stack arrays are never replaced');
}

// a state with keys kept outside the history (view), capture / restore, objectJournal
{
  const view = (st) => { const { display, ...rest } = st; return rest; };
  const sp = { arrays: { members: 'id' }, view };
  const d = { name: 'a', display: { grid: true }, members: [{ id: 'm1', n: 1 }], seq: 1 };
  const h = new ChunkHistory({ spec: sp }).reset(d);
  d.members[0].n = 2; d.display.grid = false; d.seq = 3;
  const rec = h.capture(d);
  eq([...rec.redo.keys()].sort(), ['e:members:m1', 'k:seq'], 'the display is not cut');
  h.restore(d, rec.undo); eq(d.members[0].n, 1); eq(d.display, { grid: false }, 'what is outside the history stays through undo');
  ok('display' in d, 'display key kept'); h.restore(d, rec.redo); eq(d.members[0].n, 2); eq(d.seq, 3);
  ok(h.capture(d) === null);
  const live = { name: 'o', members: [{ id: 'a', n: 1 }, { id: 'b', n: 2 }] }; let who = 1;
  const oj = objectJournal({ spec, get: () => live, identity: () => who, extras: (hh) => hh.setExtra('x:big', 'BIG' + live.members.length) });
  const b0 = await oj.base(); b0.commit();
  ok((await oj.delta()) === null, 'nothing changed, nothing written');
  live.members[1].n = 9; live.members.push({ id: 'c', n: 0 });
  const dd = await oj.delta(); ok(dd.data.set.some(([k]) => k === 'x:big') && dd.data.set.some(([k]) => k === 'e:members:b'), 'the change and the extra'); dd.commit();
  eq(recoverState({ data: b0.data, segments: [dd.data] }, spec), live, 'recovered object');
  const e1 = oj.epoch(); who = 2; await oj.delta(); ok(oj.epoch() !== e1, 'another document: a new baseline (Autosave writes a new base)');
}

// extra chunks: in copies, never in steps or state
{
  const d = doc(); const h = new ChunkHistory({ spec }).reset(d);
  h.setExtra('x:pic:abc', 'PNGDATA');
  d.seq = 5; h.commit(d, 'a');
  ok(!h.undoStack[0].undo.has('x:pic:abc'), 'an extra is no part of a step');
  h.undo(d); ok(h.cur.has('x:pic:abc'), 'undo keeps extras'); ok(!h.rollback(d), 'an extra is not a difference');
  eq(h.setExtra('x:pic:abc', 'PNGDATA'), false, 'unchanged extra');
  const j = chunkJournal(h, { prepare: () => h.setExtra('x:pic:def', 'MORE') });
  const base = await j.base();
  eq(recoverExtras({ data: base.data }), new Map([['x:pic:abc', 'PNGDATA'], ['x:pic:def', 'MORE']]), 'extras come back with the copy');
  eq(recoverState({ data: base.data }, spec), d, 'extras do not enter the recovered state');
}

console.log(`lib/history: ${pass} checks passed`);
