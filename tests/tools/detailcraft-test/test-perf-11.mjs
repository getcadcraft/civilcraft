#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/test-perf-11.mjs (0.11 PERF.36): build(state, { cache }) and the fingerprinted markParts must give the SAME answer as the
 * 0.10 code (the release's build.js and marks.js, no cache), after every edit of a run of edits, on frames13 (gussets, splices, footings with bars)
 * and grid10x6x4. Also the Tx lookups by id (addHole, addConnection duplicate checks) against 0.10's scans: same ids, same state.
 * Prints the time of an edit's rebuild (build + markParts) with and without the cache. One model at a time; nothing here needs a browser.
 *   node tools/detailcraft-test/test-perf-11.mjs [--file <model.json>]... [--old 0.10]
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/detailcraft/';
const FILES = '/var/www/CADCRAFT/testfiles/generated/detail/';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OLD = arg('--old', '0.10');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
async function load(v) {
  const mod = (f) => import(pathToFileURL(ROOT + v + '/' + f).href);
  const I = await mod('i18n.js');
  I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(ROOT + v + '/lang/en.json', 'utf8')) });
  const [Md, B, Mk] = await Promise.all([mod('model.js'), mod('build.js'), mod('marks.js')]);
  return { Md, B, Mk };
}
const old = await load(OLD);
const cur = await load('dev');
const dump = (b, mk) => JSON.stringify({ parts: b.parts, bolts: b.bolts, welds: b.welds, footings: b.footings, problems: b.problems, infos: [...b.infos], byId: [...b.byId.keys()],
  marks: { pm: [...mk.partMark], am: [...mk.asmMark], ao: [...mk.asmOf], parts: mk.parts, asm: mk.assemblies } });
const files = process.argv.filter((a, i) => process.argv[i - 1] === '--file');
if (!files.length) files.push(FILES + 'frames13.detailcraft.json', FILES + 'grid10x6x4.detailcraft.json');

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const name = file.split('/').pop();
  // two models from the same file: one for the 0.10 code, one for dev, edited by the same calls
  const mA = new old.Md.Model(old.Md.readModel(text).state || old.Md.readModel(text));
  const mB = new cur.Md.Model(cur.Md.readModel(text).state || cur.Md.readModel(text));
  const cache = {}; let lastV = -1;
  let tOld = 0, tNew = 0, steps = 0, fastRuns = 0;
  const compare = (what) => {
    let t = performance.now();
    const ba = old.B.build(mA.state); const ka = old.Mk.markParts(ba, { perPhase: true }); tOld += performance.now() - t;
    t = performance.now();
    const dirty = mB.dirtySince(lastV); lastV = mB.version; fastRuns += dirty && ![...dirty].some((k) => /^(o:|k:members|k:connections|#keys)/.test(k)) ? 1 : 0;
    const bb = cur.B.build(mB.state, { cache, dirty }); const kb = cur.Mk.markParts(bb, { perPhase: true }); tNew += performance.now() - t; steps++;
    ok(dump(ba, ka) === dump(bb, kb), name + ': ' + what + ': build + marks differ from 0.10');
  };
  compare('first build');
  compare('second build (warm cache)');
  const both = (label, fn) => { mA.change(label, fn); mB.change(label, fn); compare(label); };
  const beams = mA.state.members.filter((m) => m.type === 'beam'), cols = mA.state.members.filter((m) => m.type === 'column');
  const b0 = beams[0], b1 = beams[Math.floor(beams.length / 2)], c0 = cols[0];
  const mat0 = b0.material;   // read before the first edit: both models get the same value
  both('material of a beam', (tx) => tx.updateMember(b0.id, { material: mat0 === 'A36' ? 'A992' : 'A36' }));
  both('move a beam end', (tx) => { const m = tx.s.members.find((x) => x.id === b1.id); tx.updateMember(b1.id, { end: [m.end[0] + 50, m.end[1], m.end[2]] }); });
  both('a hole in a column', (tx) => tx.addHole(c0.id, { face: 'web', x: 700, y: 0, d: 22 }));
  both('a cope on a beam', (tx) => { try { tx.addCut(b0.id, { kind: 'cope', end: 'start', side: 'top', length: 120, depth: 30 }); } catch (e) { /* not every build of cleanCut takes this shape */ } });
  const cn = mA.state.connections[0];
  both('a connection parameter', (tx) => { const p = { ...(tx.s.connections.find((c) => c.id === cn.id).params) }; const k = Object.keys(p).find((x) => typeof p[x] === 'number'); if (k) tx.updateConnection(cn.id, { [k]: p[k] + 2 }); });
  both('remove a connection (its member stays)', (tx) => { tx.s.connections = tx.s.connections.filter((c) => c.id !== cn.id); });
  both('remove a member and what hangs on it', (tx) => tx.removeMembers([b1.id]));
  const u1 = mA.undo(), u2 = mB.undo(); ok(u1 === u2, name + ': undo label'); compare('after undo');
  const r1 = mA.redo(), r2 = mB.redo(); ok(r1 === r2, name + ': redo label'); compare('after redo');
  console.log(`${name}: ${steps} comparisons; build + markParts per call: 0.10 ${Math.round(tOld / steps)} ms, dev with cache ${Math.round(tNew / steps)} ms; ${fastRuns} of them on the by-id path`);
  ok(fastRuns >= 4, name + ': edits that change only elements take the by-id path (' + fastRuns + ')');
}

// a version bumped from outside (live.js does m.version++ after writing the state itself): the model cannot say what changed, so the next build looks at everything
{
  const text = fs.readFileSync(files[0], 'utf8');
  const mA = new old.Md.Model(old.Md.readModel(text).state || old.Md.readModel(text)), mB = new cur.Md.Model(cur.Md.readModel(text).state || cur.Md.readModel(text));
  const cache = {}; let v = -1;
  const run = () => { const ba = old.B.build(mA.state), ka = old.Mk.markParts(ba, { perPhase: true }); const d = mB.dirtySince(v); v = mB.version; const bb = cur.B.build(mB.state, { cache, dirty: d }), kb = cur.Mk.markParts(bb, { perPhase: true }); return [dump(ba, ka) === dump(bb, kb), d]; };
  ok(run()[0], 'outside bump: first');
  const beam = mA.state.members.find((m) => m.type === 'beam');
  const edit = (m) => { const x = m.state.members.find((q) => q.id === beam.id); x.end = [x.end[0] + 120, x.end[1], x.end[2]]; };   // written into the state directly, not through change()
  edit(mA); edit(mB); mA.version++; mB.version++;
  const [same, d] = run();
  ok(d === null, 'a version bumped from outside leaves a gap: dirtySince is null');
  ok(same, 'and the build after it still equals 0.10 (the moved beam end is seen)');
  const [same2, d2] = run(); ok(same2 && d2 instanceof Set && d2.size === 0, 'a build with nothing changed: an empty dirty set, same answer');
}

// Tx lookups by id: the same ids and the same state as the 0.10 scans
{
  const make = (m) => { const mm = new m.Md.Model(m.Md.starterState('t')); return mm; };
  const a = make(old), b = make(cur);
  const run = (mm) => mm.change('x', (tx) => {
    const ids = [];
    for (let i = 0; i < 30; i++) ids.push(tx.addMember({ type: i % 2 ? 'column' : 'beam', start: [i * 100, 0, 0], end: [i * 100, 0, 3000], profile: 'W14x90' }));
    for (const id of ids) tx.addHole(id, { face: 'web', x: 500, y: 0, d: 20 });
    const errs = [];
    for (const id of ids) { try { tx.addConnection({ type: 'baseplate', column: id }); } catch (e) { errs.push(e.message); } }
    for (const id of ids) { try { tx.addConnection({ type: 'baseplate', column: id }); } catch (e) { errs.push(e.message); } }   // every second one is refused (taken)
    return { ids, errs };
  });
  const ra = run(a), rb = run(b);
  ok(JSON.stringify(ra) === JSON.stringify(rb) && JSON.stringify(a.state) === JSON.stringify(b.state), 'Tx: same ids, same refusals, same state as 0.10');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
