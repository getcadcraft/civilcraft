#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** The shell's journal mode (app-autosave.js) with a ChunkHistory: writes only what changed, recovers base + changes, survives a failed write and a crash between writes.  node lib/history/test/autosave-journal.mjs */
import assert from 'node:assert/strict';
import { Autosave, memoryStore } from '../../../public_html/assets/js/app-autosave.js';
import { ChunkHistory, chunkJournal, objectJournal, recoverState } from '../index.js';

let pass = 0;
const ok = (c, m) => { assert.ok(c, m); pass++; };
const eq = (a, b, m) => { assert.deepEqual(a, b, m); pass++; };
const spec = { arrays: { members: 'id' } };
const store = memoryStore();
const written = [];
const spy = { ...store, putData: async (k, d) => { written.push([k, d]); if (spy.fail) throw new Error('disk full'); return store.putData(k, d); } };
const mk = (session) => new Autosave({ app: 'detailcraft', store: spy, session, locks: null, alive: async () => [session], onError: () => {}, delay: 0, maxWait: 0 });

const state = { name: 'T', members: Array.from({ length: 2000 }, (_, i) => ({ id: 'm' + i, x: i, pad: 'p'.repeat(100) })) };
const h = new ChunkHistory({ spec }).reset(state);
const a = mk('s1');
const doc = a.doc({ name: 'T', journal: chunkJournal(h) });

doc.changed(); await doc.save();
const baseWrite = written.at(-1);
ok(baseWrite[1].kind === 'chunks' && baseWrite[1].chunks.length > 2000, 'first write is the base');
written.length = 0;

state.members[5].x = -1; h.commit(state, 'e1'); doc.changed(); await doc.save();
eq(written.length, 1, 'one edit, one write'); ok(written[0][0].includes('#0'), 'it is a change');
eq(written[0][1].set.map((x) => x[0]), ['e:members:m5'], 'only that element');
ok(JSON.stringify(written[0][1]).length < 400, 'a change is a few hundred bytes, not the document (' + JSON.stringify(written[0][1]).length + ')');

// a failed write loses nothing
state.members[6].x = -2; h.commit(state, 'e2'); spy.fail = true; doc.changed(); await doc.save(); spy.fail = false;
state.members[7].x = -3; h.commit(state, 'e3'); doc.changed(); await doc.save();
// the change written for e3 also carries e2 (still dirty)
const last = written.at(-1)[1];
eq(last.set.map((x) => x[0]).sort(), ['e:members:m6', 'e:members:m7'], 'the failed change is written with the next');

// "kill the page": no close, no clean. A new session sees the copy.
await a.stop();
const b = mk('s2');
const orphans = await b.orphans();
eq(orphans.length, 1, 'the dead session left one copy'); eq(orphans[0].app, 'detailcraft', 'listed under the app name');
const rec = await b.load(orphans[0]);
eq(rec.segments.length, 2, 'base + 2 changes');
eq(recoverState(rec, spec), state, 'recovered = the last state');

// a crash between a change and its index entry: the unlisted change is ignored, the copy is the last whole state
const idx = (await store.index('detailcraft~j'))[0];
await store.putData(idx.key + '@' + idx.gen + '#' + idx.segs, { kind: 'chunks-delta', v: 1, set: [['k:name', '"HALF"']], del: [] });
eq(recoverState(await b.load(orphans[0]), spec), state, 'an unlisted change is never applied');

// compaction: many changes -> a new base, old generation gone
const c = mk('s3'); const h3 = new ChunkHistory({ spec }).reset(state); const doc3 = c.doc({ name: 'C', journal: chunkJournal(h3) });
doc3.changed(); await doc3.save();
const keysBefore = (await store.index('detailcraft~j')).length;
for (let i = 0; i < 450; i++) { state.members[i].x = 1000 + i; h3.commit(state, 'k' + i); doc3.changed(); await doc3.save(); }
const mine = (await store.index('detailcraft~j')).find((r) => r.session === 's3');
ok(mine.segs < 450, 'the base was rewritten along the way (segs ' + mine.segs + ')');
eq(recoverState(await b.load(mine), spec), state, 'after compaction the copy is still the last state');

// clean() and discard() remove base and changes
await doc3.clean();
ok(!(await store.index('detailcraft~j')).some((r) => r.session === 's3'), 'clean() drops the copy');
await b.discard(orphans[0]);
eq((await store.index('detailcraft~j')).length, 0, 'discard() drops the copy');
// a journal that builds its document on demand (objectJournal) starts its baseline inside base(): the second write is still a change, not a new base
{
  const live = { name: 'o', items: Array.from({ length: 50 }, (_, i) => ({ id: 'i' + i, v: i })) };
  const d = mk('s4'); const oj = objectJournal({ spec: { autoArrays: 'id' }, get: () => live, identity: () => live });
  const docO = d.doc({ name: 'O', journal: oj });
  written.length = 0;
  docO.changed(); await docO.save();
  ok(written.at(-1)[1].kind === 'chunks', 'the first write is a base');
  live.items[3].v = -1; docO.changed(); await docO.save();
  ok(written.at(-1)[1].kind === 'chunks-delta' && written.at(-1)[1].set.length === 1, 'the second write is one changed chunk, not a new base');
  live.items[4].v = -1; docO.changed(); await docO.save();
  const idxO = (await store.index('detailcraft~j')).find((r) => r.session === 's4');
  eq(idxO.segs, 2, 'two changes after one base');
  eq(recoverState(await mk('s5').load(idxO), { autoArrays: 'id' }), live, 'and they recover');
}
console.log(`autosave journal: ${pass} checks passed`);
