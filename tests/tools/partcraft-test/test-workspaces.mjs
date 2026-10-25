#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-workspaces.mjs — PartCraft's workspace scaffold (DOM-free parts): the registry (workspaces.js and every
 * ws-<id>.js), the toolbar/placeholder markup through a stand-in el(), part.studies (version 3) with a study reader,
 * version 1 and 2 files, tampered studies, studies in the undo history, and the worker op registry (worker-ops.js).
 *   node tools/partcraft-test/test-workspaces.mjs [--verbose]     (or runWorkspaceTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runWorkspaceTests({ ok, section }) {
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const WS = await import(DEV + 'workspaces.js');
  for (const id of ['form', 'simulation', 'generative', 'manufacture']) await import(DEV + `ws-${id}.js`);
  const P = await import(DEV + 'part.js');
  const S = await import(DEV + 'sketch.js');
  const F = await import(path.join(HERE, 'fixtures.mjs'));

  section('workspaces: registry and markup');
  {
    const ids = WS.listWorkspaces().map((w) => w.id);
    ok(ids.join() === 'design,form,simulation,generative,manufacture', `the switcher lists Design, Form, Simulation, Generative, Manufacture (${ids.join(', ')})`);
    ok(WS.getWorkspace('design').builtin && WS.listWorkspaces().slice(1).every((w) => !w.builtin), 'Design is built in; the four others are registered by their ws files');
    ok(WS.listWorkspaces().every((w) => !/[A-Z]{2,}/.test(w.label) && /^[A-Z][a-z]+$/.test(w.label)), 'labels are one word, sentence case, no all-caps');
    // a stand-in el(): { tag, props, kids } trees
    const el = (tag, props = {}, ...kids) => ({ tag, props, kids: kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false) });
    const textOf = (n) => (typeof n === 'string' ? n : n.kids.map(textOf).join(' '));
    // (an empty workspace: the first scaffold without tools, or a stand-in once every workspace has some)
    const emptyWs = WS.listWorkspaces().slice(1).find((w) => !w.groups.length) || { id: 'form', label: 'Form', groups: [] };
    const g = WS.toolbarGroups(emptyWs, el);
    ok(g.length === 1 && g[0].props.className === 'pc-tool-group' && g[0].props.role === 'group' && g[0].props.dataset.workspaceGroup === emptyWs.id && g[0].props.hidden === true, `an empty workspace gets one hidden toolbar group (pc-tool-group, data-workspace-group="${emptyWs.id}")`);
    const ph = WS.placeholderPanel(WS.getWorkspace('simulation'), el);
    ok(/The Simulation workspace is being built\. Nothing in it works yet\./.test(textOf(ph)) && /Switch back to Design/.test(textOf(ph)) && !/[A-Z]{3,}/.test(textOf(ph)), 'the placeholder panel says, in sentence case, that the workspace is being built');
    // a workspace with tools
    const t = WS.registerWorkspace({ id: 'testbench', label: 'Test bench', icon: 'tools', groups: [{ label: 'Bench', items: [{ cmd: 'testbench-run', icon: 'play', label: 'Run', title: 'Run the bench' }, { cmd: 'testbench-stop', icon: 'stop', label: 'Stop', title: 'Stop it' }] }], command: (cmd) => cmd === 'testbench-run' });
    ok(WS.listWorkspaces().at(-1) === t && WS.workspaceOfCmd('testbench-run') === 'testbench' && WS.workspaceOfCmd('extrude') === null, 'a registered workspace follows the five; its commands are known, Design\'s are not');
    const tg = WS.toolbarGroups(t, el)[0];
    const btn = tg.kids[1].kids[0];
    ok(btn.tag === 'button' && btn.props.className === 'pc-tool' && btn.props.dataset.cmd === 'testbench-run' && btn.kids[0].props.className === 'bi bi-play' && btn.props.title === 'Run the bench', 'its buttons use ui.inc\'s markup: button.pc-tool[data-cmd] with a bi icon and a title');
    ok(throws(() => WS.registerWorkspace({ id: 'form', label: 'Form' }), /already registered/), 'a second "form" is refused');
    ok(throws(() => WS.registerWorkspace({ id: 'Bad id', label: 'X' }), /id/), 'a bad id is refused');
    ok(throws(() => WS.registerWorkspace({ id: 'other', label: 'Other', groups: [{ label: 'G', items: [{ cmd: 'extrude', icon: 'x', label: 'X', title: 'X' }] }] }), /must be named other-/), 'a command without the workspace prefix is refused (it would collide with Design)');
    ok(throws(() => WS.registerWorkspace({ id: 'other', label: 'Other', groups: [{ label: 'G', items: [{ cmd: 'other-a', icon: 'x', label: 'A', title: 'A' }, { cmd: 'other-a', icon: 'x', label: 'A', title: 'A' }] }] }), /already used/), 'a command used twice is refused');
    ok(throws(() => WS.registerWorkspace({ id: 'other', label: 'Other', enter: 'nope' }), /enter must be a function/), 'a hook that is not a function is refused');
    ok(WS.getWorkspace('other') === null, 'nothing half-registered after a refusal');
  }

  section('part studies (version 3): round trip, old versions, tampering, undo');
  {
    // a reader the way a workspace registers one: range-check everything, return a clean copy
    P.registerStudyReader('testbench', (raw, { ids }) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('The test bench study is bad.');
      if (!(typeof raw.n === 'number' && Number.isInteger(raw.n) && raw.n >= 0 && raw.n <= 10)) throw new Error('The test bench count is bad.');
      if (raw.face !== undefined && !ids.has(raw.face)) throw new Error('The test bench face reference is bad.');
      return { n: raw.n, ...(raw.face !== undefined ? { face: raw.face } : {}) };
    });
    ok(throws(() => P.registerStudyReader('testbench', () => 1), /already registered/) && throws(() => P.registerStudyReader('Bad Key', () => 1), /bad key/), 'a reader key is registered once, and must be a plain lower-case key');
    ok(P.studyKeys().includes('testbench'), 'studyKeys lists it');
    const fl = F.flange();
    const plain = JSON.parse(P.toJSON(fl.part));
    ok(plain.version === 2 && plain.studies === undefined, 'a part without studies still saves as version 2 (older builds open it)');
    P.setStudy(fl.part, 'testbench', { n: 3, face: fl.part.features[1].id });
    const j = JSON.parse(P.toJSON(fl.part));
    ok(j.format === 'partcraft' && j.version === 3 && j.studies.testbench.n === 3, 'with studies it saves as version 3 (a version-2 reader would drop them silently, so it refuses instead)');
    const back = P.readPart(JSON.stringify(j));
    ok(JSON.stringify(back.studies) === JSON.stringify({ testbench: { n: 3, face: fl.part.features[1].id } }) && back.features.length === fl.part.features.length, 'saved → opened: the study comes back as it was');
    ok(P.study(back, 'testbench').n === 3 && P.study(back, 'form') === undefined, 'study(part, key) reads it');
    // version 1 and 2 files
    const v1 = JSON.parse(P.toJSON(F.flange().part)); v1.version = 1;
    const v2 = JSON.parse(P.toJSON(F.flange().part)); v2.version = 2;
    ok(P.readPart(JSON.stringify(v1)).features.length === v1.features.length && P.readPart(JSON.stringify(v2)).features.length === v2.features.length, 'version 1 and version 2 files still open');
    const v4 = { ...j, version: P.VERSION + 1 };   // 0.6 LC.14 made 4 a real version (configurations that turn features off)
    ok(throws(() => P.readPart(JSON.stringify(v4)), new RegExp(`newer PartCraft.*version ${P.VERSION + 1}.*reads version ${P.VERSION}`)), `version ${P.VERSION + 1} is refused, saying this build reads version ${P.VERSION}`);
    // tampering
    const bad = (fn, re, what) => { const t = JSON.parse(JSON.stringify(j)); fn(t); ok(throws(() => P.readPart(JSON.stringify(t)), re), what); };
    bad((t) => { t.studies.mystery = {}; }, /"mystery" study data that this PartCraft does not read/, 'a study key nobody registered is refused, named');
    bad((t) => { t.studies = [1, 2]; }, /studies in this file are bad/, 'studies as a list is refused');
    bad((t) => { t.studies = 'x'; }, /studies in this file are bad/, 'studies as text is refused');
    bad((t) => { t.studies.testbench.n = 11; }, /count is bad/, 'the workspace\'s reader range-checks its data (n = 11 refused)');
    bad((t) => { t.studies.testbench.face = 'f999'; }, /face reference is bad/, 'a study pointing at a feature that is not in the file is refused');
    bad((t) => { t.studies = { constructor: {} }; }, /does not read/, 'a key like "constructor" is refused, not looked up on Object');
    const empty = P.readPart(JSON.stringify({ ...v2, studies: {} }));
    ok(empty.studies === undefined, 'an empty studies object is dropped');
    // undo history
    const part = P.newPart();
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [10, 10]);
    P.addFeature(part, 'sketch', { sketch: sk });
    const hist = new P.History();
    hist.push(part, 'Set study'); P.setStudy(part, 'testbench', { n: 1 });
    hist.push(part, 'Change study'); P.setStudy(part, 'testbench', { n: 2 });
    let u = hist.undo(part);
    ok(u.part.studies.testbench.n === 1, 'undo brings the previous study back (studies are in the history snapshots)');
    u = hist.undo(u.part);
    ok(u.part.studies === undefined, 'undo again: no studies');
    ok(hist.redo(u.part).part.studies.testbench.n === 1, 'redo puts it back');
    P.setStudy(part, 'testbench', null);
    ok(part.studies === undefined && JSON.parse(P.toJSON(part)).version === 2, 'setStudy(…, null) removes it; with none left the part is version 2 again');
    ok(throws(() => P.setStudy(part, 'nobody', { n: 1 }), /No study reader/), 'setStudy refuses a key without a reader');
  }

  section('worker op registry (worker-ops.js)');
  {
    const W = await import(DEV + 'worker-ops.js');
    W.addOps({ testDouble: (args, ctx) => { ctx.progress(0.5); return { v: args.v * 2 }; } });
    const seen = [];
    ok(W.OPS.testDouble({ v: 21 }, { progress: (p) => seen.push(p), transfer: () => {} }).v === 42 && seen[0] === 0.5, 'an added op runs with (args, ctx) and can report progress');
    ok(throws(() => W.addOps({ regen: () => 1 }), /already taken/) && throws(() => W.addOps({ testDouble: () => 1 }), /already taken/), 'the exact kernel\'s own ops and taken names are refused');
    ok(throws(() => W.addOps({ 'bad-name': () => 1 }), /camelCase/) && throws(() => W.addOps({ okName: 3 }), /camelCase/), 'bad names and non-functions are refused');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runWorkspaceTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
