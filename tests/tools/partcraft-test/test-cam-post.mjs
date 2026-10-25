#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam-post.mjs — PartCraft's post-processor file format (cam-postdef.js, cam-posts-builtin.js, cam-fmt.js):
 *   · the built-in Fanuc, GRBL and LinuxCNC posts, written as text, produce BYTE-IDENTICAL output to the older code
 *     (cam-post.js postLegacy) on hand-made programs and on 600 seeded random programs (tool changes, coolant, arcs,
 *     canned cycles with mixed return planes, repeated points, −0, long and odd names, cylinder and box stock, none);
 *   · the format itself: errors with line numbers, modal words, filters, `set`/`reset`/`do`, an edited post changes
 *     exactly what it says, custom posts through post(), the refusals.
 *   node tools/partcraft-test/test-cam-post.mjs [--verbose]   (or runCamPostTests() from test-cam.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

function rng(seed) { let s = seed >>> 0; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }

export async function runCamPostTests({ ok, section, near, extra = [] }) {
  const PO = await import(DEV + 'cam-post.js');
  const PD = await import(DEV + 'cam-postdef.js');
  const PB = await import(DEV + 'cam-posts-builtin.js');
  const C = await import(DEV + 'cam.js');
  const KINDS = ['fanuc', 'grbl', 'linuxcnc'];

  // ---- programs
  const tools = [
    { id: 'a', number: 1, kind: 'flat', d: 6, flutes: 3, fluteLen: 20, name: '' },
    { id: 'b', number: 2, kind: 'ball', d: 3.175, flutes: 2, fluteLen: 12.5, name: '' },
    { id: 'c', number: 5, kind: 'drill', d: 14, flutes: 2, fluteLen: 60, angle: 118, name: '' },
    { id: 'd', number: 12, kind: 'bull', d: 8, flutes: 4, fluteLen: 22, cornerR: 1, name: '' },
    { id: 'e', number: 7, kind: 'chamfer', d: 12, flutes: 4, fluteLen: 6, angle: 90, tipD: 0, name: '' },
  ];
  const stockBox = { kind: 'box', min: [0, 0, -20], max: [100, 60, 0], c: null, r: null };
  const stockCyl = { kind: 'cylinder', min: [-25.0004, -25, -41.2], max: [25, 25, 0], c: [0, 0], r: 25 };
  const setup0 = { program: 1001, coolant: 'flood', axis: '+y', origin: 'stock-top-min' };
  const prog = (paths, over = {}) => ({ setup: { ...setup0, ...(over.setup || {}) }, model: { stock: over.stock || stockBox }, paths });
  const path1 = (op, tool, moves, rpm = 12000) => ({ op, tool, speeds: { rpm }, moves });
  const cycle = (kind, init, f, holes) => ({ k: 'cycle', kind, init, f, holes });
  const hole = (x, y, z, r, q, ret = 'init') => ({ at: [x, y], top: 0, z, r, q, ret });
  const hand = [
    prog([]),
    prog([path1({ id: 'o1', name: 'Face', type: 'face' }, tools[0], [{ k: 'rapid', p: [0, 0, 10] }, { k: 'feed', p: [0, 0, -1], f: 300 }, { k: 'feed', p: [50, 0, -1], f: 900 }, { k: 'arc', p: [60, 10, -1], c: [50, 10], sw: Math.PI / 2, f: 900 }, { k: 'rapid', p: [60, 10, 10] }])]),
    prog([
      path1({ id: 'o1', name: 'Pocket (rough) ⌀6 °', type: 'pocket' }, tools[0], [{ k: 'rapid', p: [5, 5, 10] }, { k: 'feed', p: [5, 5, -2], f: 200 }, { k: 'arc', p: [5, 5, -3], c: [10, 5], sw: -Math.PI, f: 400 }, { k: 'rapid', p: [5, 5, 10] }]),
      path1({ id: 'o2', name: 'Drill', type: 'drill' }, tools[2], [{ k: 'rapid', p: [10, 10, 12] }, cycle('peck', 12, 150, [hole(10, 10, -22, 2, 3, 'r'), hole(30, 10, -22, 2, 3, 'r'), hole(50, 10, -18, 4, 3, 'init'), hole(70, 10, -18, 4, 2, 'init')])], 3000),
      path1({ id: 'o3', name: 'Chip' }, tools[2], [{ k: 'rapid', p: [10, 30, 12] }, cycle('chipbreak', 12, 150, [hole(10, 30, -10, 2, 1.5)]), cycle('drill', 12, 150, [hole(20, 30, -10, 2, 0)]), { k: 'rapid', p: [20, 30, 12] }], 3000),
      path1({ id: 'o4', name: 'Chamfer', type: 'chamfer' }, tools[4], [{ k: 'rapid', p: [0, 0, 5] }, { k: 'feed', p: [0, 0, -0.0002], f: 100 }, { k: 'feed', p: [0, 0, -0.0002], f: 250 }, { k: 'feed', p: [1, 1, -0.5], f: 250 }], 6000),
    ], { setup: { coolant: 'mist', program: 7 }, stock: stockCyl }),
    prog([path1({ id: 'o1', name: 'Only', type: 'contour' }, tools[3], [{ k: 'rapid', p: [1, 2, 3] }, { k: 'feed', p: [4, 5, 6], f: 100 }])], { setup: { coolant: 'off' } }),
  ];
  // ---- random programs
  function random(seed) {
    const r = rng(seed);
    const pick = (a) => a[Math.floor(r() * a.length)];
    const val = () => pick([0, 0, 1, -1, 5, 10, 12.5, -3.3333, 7.12345, -0.0002, 0.0004, 100, 25.4, -20, 0.0006]) + (r() < 0.2 ? r() * 2 : 0);
    const names = ['Face', 'Pocket (rough)', 'Contour ⌀6 outside', 'Drill ° holes', 'A very long operation name that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on', 'éè café', 'Adaptive - 1'];
    const types = ['face', 'pocket', 'adaptive', 'contour', 'drill', 'chamfer', undefined];
    const paths = [];
    const np = Math.floor(r() * 6);
    let tool = pick(tools);
    for (let i = 0; i < np; i++) {
      if (r() < 0.55) tool = pick(tools);
      let p = [val(), val(), val()];
      const moves = [{ k: 'rapid', p: p.slice() }];
      const nm = Math.floor(r() * 14);
      for (let j = 0; j < nm; j++) {
        const t = r();
        const nextP = () => { const n = p.slice(); const k = Math.floor(r() * 4); if (k === 0) return n; if (k === 1) n[2] = val(); else if (k === 2) { n[0] = val(); n[1] = val(); } else return [val(), val(), val()]; return n; };
        if (t < 0.25) { p = nextP(); moves.push({ k: 'rapid', p: p.slice() }); }
        else if (t < 0.55) { p = nextP(); moves.push({ k: 'feed', p: p.slice(), f: pick([100, 100, 250, 250.5, 1200, 33.3333]) }); }
        else if (t < 0.8) { const e = [val(), val(), r() < 0.5 ? p[2] : val()]; moves.push({ k: 'arc', p: e, c: [val(), val()], sw: (r() < 0.5 ? -1 : 1) * (0.1 + r() * 3), f: pick([100, 250, 1200]) }); p = e; }
        else {
          const kind = pick(['drill', 'peck', 'chipbreak']);
          const nh = 1 + Math.floor(r() * 4);
          const hs = [];
          let z = pick([-10, -22, -15.5]), rr = pick([2, 3, 5]), qq = pick([0, 1.5, 3]);
          for (let h = 0; h < nh; h++) {
            if (r() < 0.4) z = pick([-10, -22, -15.5, -9.9996]);
            if (r() < 0.4) rr = pick([2, 3, 5]);
            if (r() < 0.4) qq = pick([0, 1.5, 3]);
            hs.push(hole(val(), val(), z, rr, qq, pick(['r', 'init'])));
          }
          moves.push(cycle(kind, pick([10, 12, 15]), pick([150, 90.5]), hs));
          p = [hs[hs.length - 1].at[0], hs[hs.length - 1].at[1], 10];
        }
      }
      paths.push(path1({ id: 'o' + i, name: pick(names), type: pick(types) }, tool, moves, pick([12000, 12000, 3000, 24000])));
    }
    if (r() < 0.1) paths.push({ op: { id: 'x', name: 'Empty' }, tool, speeds: { rpm: 1 }, moves: [] });
    return prog(paths, { setup: { program: 1 + Math.floor(r() * 9999), coolant: pick(['flood', 'mist', 'off']), axis: pick(['+y', '+z']), origin: pick(Object.keys(C.ORIGINS)) }, stock: pick([stockBox, stockCyl]) });
  }

  // ===================================================================================
  section('CAM modules: no import cycles');
  {
    // the compute worker's module loader refuses a cycle ("Import cycle at cam.js"): found in the browser, so guarded here
    const graph = {};
    const load = (f) => {
      if (graph[f] || !fs.existsSync(DEV + f)) return;
      const src = fs.readFileSync(DEV + f, 'utf8');
      graph[f] = [...src.matchAll(/^(?:import|export)[^'"\n]*from\s+'\.\/([^']+)'/gm), ...src.matchAll(/^import\s+'\.\/([^']+)'/gm)].map((m) => m[1]);
      graph[f].forEach(load);
    };
    load('cam-worker.js'); load('ws-manufacture.js'); load('cam-post.js'); load('cam-post-editor.js'); load('cam-finish.js');
    const state = {};
    let cycle = null;
    const dfs = (n, stack) => {
      if (cycle) return;
      if (state[n] === 1) { cycle = [...stack.slice(stack.indexOf(n)), n]; return; }
      if (state[n] === 2) return;
      state[n] = 1;
      for (const d of graph[n] || []) if (graph[d]) dfs(d, [...stack, n]);
      state[n] = 2;
    };
    for (const n of Object.keys(graph)) dfs(n, []);
    ok(!cycle && Object.keys(graph).length > 20, `${Object.keys(graph).length} modules reached from the worker, the workspace, the posts and the finishing: no import cycle` + (cycle ? ' — ' + cycle.join(' → ') : ''));
  }

  // ===================================================================================
  section('CAM posts: the three built-ins written as text = the older code, byte for byte');
  {
    for (const k of KINDS) {
      const d = PD.parsePost(PB.BUILTIN_POSTS[k]);
      ok(d.id === k && d.ext === PO.EXT[k], `${k}: the file parses (id ${d.id}, extension ${d.ext}, ${Object.keys(d.events).length} events)`);
    }
    let bad = '', n = 0;
    const all = [...hand, ...extra.map((e) => e.program)];
    for (let s = 1; s <= 600; s++) all.push(random(s));
    for (const [i, pg] of all.entries()) {
      for (const k of KINDS) {
        n++;
        for (const name of ['Part', 'Bracket (rev B) ⌀ ° v2 with a long name that is cut']) {
          const a = PO.postLegacy(pg, { post: k, name }), b = PO.post(pg, { post: k, name });
          if (a.text !== b.text || a.ext !== b.ext || a.post !== b.post) {
            if (!bad) {
              const la = a.text.split('\n'), lb = b.text.split('\n');
              const at = la.findIndex((l, j) => l !== lb[j]);
              bad = `program ${i} ${k}: line ${at + 1}: legacy "${la[at]}" vs text "${lb[at]}"`;
            }
          }
        }
      }
    }
    ok(!bad, `${all.length} programs × 3 posts × 2 names (${n * 2} outputs): identical text, extension and id` + (bad ? ' — ' + bad : ''));
    const withCycles = all.filter((p) => p.paths.some((q) => q.moves.some((m) => m.k === 'cycle'))).length;
    const withArcs = all.filter((p) => p.paths.some((q) => q.moves.some((m) => m.k === 'arc'))).length;
    ok(withCycles > 100 && withArcs > 100, `the set exercises canned cycles (${withCycles} programs) and arcs (${withArcs})`);
    for (const e of extra) for (const k of KINDS) ok(PO.postLegacy(e.program, { post: k, name: e.name }).text === PO.post(e.program, { post: k, name: e.name }).text, `${e.name} (${e.label || 'from the CAM tests'}), ${k}: identical`);
    ok(PO.post(hand[1], { post: 'grbl' }).text === PO.postLegacy(hand[1], { post: 'grbl' }).text && !PO.post(hand[1], { post: 'grbl' }).text.includes('N10'), 'post() is the text posts now');
  }

  // ===================================================================================
  section('CAM posts: the format');
  {
    const err = (text) => { try { PD.parsePost(text); return null; } catch (e) { return e; } };
    const base = 'post t\n';
    let e = err('name x\n');
    ok(e && e.line === 1 && e.key === 'cam.post.err.no_id', 'a post without an id is refused');
    e = err(base + 'on nowhere\nend\n');
    ok(e && e.line === 2 && e.key === 'cam.post.err.unknown_event', 'unknown event refused, naming the line (2)');
    e = err(base + 'on start\n  emit G1 X{nothing.here}\nend\n');
    ok(e === null, 'a name that is not a variable is plain text');
    e = err(base + 'on start\n  emit X{tool.numbr}\nend\n');
    ok(e && e.line === 3 && e.key === 'cam.post.err.unknown_var', 'a misspelt variable in a known namespace is refused (line 3)');
    e = err(base + 'on start\n  if cool\n    emit M9\nend\n');
    ok(e && e.key === 'cam.post.err.unclosed_block', 'a block left open is refused');
    e = err(base + 'on start\n  end\nend\nend\n');
    ok(e && e.key === 'cam.post.err.end', 'an extra end is refused');
    e = err(base + 'on start\n  emit {name|shout}\nend\n');
    ok(e && e.key === 'cam.post.err.unknown_filter', 'unknown filter refused');
    e = err(base + 'on start\n  emit {name\nend\n');
    ok(e && e.key === 'cam.post.err.unclosed', 'unclosed { refused');
    e = err(base + 'on start\n  emit G1!\nend\n');
    ok(e && e.key === 'cam.post.err.force_alone', '! without ~ refused');
    e = err(base + 'modal motion G0 G1\non start\n  emit G9~\nend\n');
    ok(e && e.key === 'cam.post.err.not_in_group', 'a modal literal that is in no group is refused');
    e = err(base + 'on start\n  frobnicate\nend\n');
    ok(e && e.key === 'cam.post.err.unknown_statement', 'unknown statement refused');
    e = err(base + 'on start\nend\non start\nend\n');
    ok(e && e.key === 'cam.post.err.twice', 'the same event twice refused');
    e = err(base + 'line-numbers lots\n');
    ok(e && e.key === 'cam.post.err.line_numbers', 'bad line-numbers refused');
    e = err('post bad id\n');
    ok(e && e.key === 'cam.post.err.id', 'a post id with a space refused');
    e = err(base + 'on start\n  for t in lathe\n  end\nend\n');
    ok(e && e.key === 'cam.post.err.for', 'for only walks tools');
    e = err('// a comment\n\npost ok\n// another\non start\n  // inside\nend\n');
    ok(e === null, 'blank lines and // lines are ignored');
  }
  {
    // an edited post changes exactly what it says
    const pg = hand[2];
    const base = PB.BUILTIN_POSTS.fanuc;
    const edit = (from, to) => { if (!base.includes(from)) throw new Error('test: no ' + from); return base.replace(from, to); };
    const run = (text, p = pg) => PO.post(p, { post: 'custom:x', posts: [{ id: 'x', text }], name: 'Edit' }).text;
    const ref = PO.post(pg, { post: 'fanuc', name: 'Edit' }).text;
    ok(run(base) === ref, 'a copy of the Fanuc post as a custom post gives the same program');
    const t5 = run(edit('line-numbers 10', 'line-numbers 5'));
    ok(/^N5 /m.test(t5) && /^N10 /m.test(t5) && !/^N\d*[1-9]7 /m.test(t5) && t5.split('\n').filter((l) => /^N\d+ /.test(l)).every((l, i) => l.startsWith('N' + (i + 1) * 5 + ' ')), 'line-numbers 5: N5, N10, N15 … with no gaps');
    const off = run(edit('line-numbers 10', 'line-numbers off'));
    ok(!/^N\d/m.test(off) && off.split('\n').length === ref.split('\n').length, 'line-numbers off: the same lines, none numbered');
    ok(run(edit('decimal-point yes', 'decimal-point no')).includes('G28 G91 Z0.') && !/X\d+\.(\s|$)/.test(run(edit('decimal-point yes', 'decimal-point no'))), 'decimal-point no drops the point from numbers, not from a literal word');
    ok(run(edit('emit M30', 'emit M02')).includes('M02\n') && !run(edit('emit M30', 'emit M02')).includes('M30'), 'M30 → M02 in the end event');
    ok(run(edit('  raw %\n  raw O', '  comment my header\n  raw O')).split('\n')[0] === '(my header)', 'a comment line replaces the % line; comments get brackets');
    const noG43 = run(edit('emit G0~! G43 Z{first.z}~! H{tool.number}', 'emit G0~! Z{first.z}~!'));
    ok(!/G43|\bH\d/.test(noG43), 'the tool length offset taken out of the approach event is gone everywhere');
    const abs = run(base.replace('I{arc.i} J{arc.j}', 'I{arc.cx} J{arc.cy}'));
    ok(/Z-3\. I10\. J5\./.test(abs), 'arc.cx / arc.cy give the centre in work coordinates (absolute I J)');
    ok(/ I5\. J0\./.test(ref) && /X5\. Y5\. Z-3\. I5\. J0\./.test(ref), 'arc.i / arc.j give the centre from the start point as written (5, 0 here)');
  }
  {
    // modal words, forced words, reset, set, do, filters, conditions
    const mk = (body, head = '') => `post m\n${head}\non start\n${body}\nend\n`;
    const out = (text) => PD.renderPost(PD.parsePost(text), hand[0]).text;
    ok(out(mk('  emit G1~ G1~\n  emit G1~\n  emit G1~!\n  emit G2\n  emit G2~', 'modal motion G0 G1 G2')) === 'G1\nG1\nG2\nG2\n', 'modal group: written once (a second G1~ in the same line too), forced again with !, plain words always written and not remembered');
    ok(out(mk('  set a 3\n  emit X{a}~ X{a}~\n  emit X{a}~\n  set a 4\n  emit X{a}~\n  reset X\n  emit X{a}~', '')) === 'X3\nX4\nX4\n', 'letter+number modal: written when it changes; reset X forgets it');
    ok(out(mk('  set a 3.00049\n  emit X{a}~\n  set a 3.0004\n  emit X{a}~\n  set a 3.0006\n  emit X{a}~')) === 'X3\nX3.001\n', 'modal numbers compare at 1 µm');
    ok(out(mk('  word A\n  word B C\n  emit D\n  emit\n  emit')) === 'A B C D\n', 'word collects, emit ends the line; an empty emit writes nothing');
    ok(out(mk('  emit {none} X{name} {none}')) === 'XPart\n', 'empty words are left out');
    ok(out(mk('  set a yes\n  if a and not none\n    emit A\n  else\n    emit B\n  end\n  if a == yes\n    emit C\n  end\n  if zz??none == zz\n    emit D\n  end\n  if none??qq != qq\n    emit E\n  end')) === 'A\nC\nD\n', 'conditions: and / not / == / != / ?? (a name that is not a variable is text)');
    ok(out(mk('  set n 0\n  if n == 0\n    emit Z\n  end\n  if n != 0.0004\n    emit Y\n  end\n  if n != 0.0006\n    emit X\n  end')) === 'Z\nX\n', 'numbers compare at 1 µm in conditions');
    ok(out(mk('  raw {name|upper|cut:3}-{program|pad:6}-{name|lower}-{program|int}')) === 'PAR-001001-part-1001\n', 'filters: upper cut pad lower int');
    ok(out(mk('  comment a (b) é {stock.sx}')) === '(a b 100)\n', 'comment: brackets and non-ASCII removed, numbers without a point');
    ok(out(mk('  emit {stock.sx} {stock.minz}', 'decimal-point yes')) === '100. -20.\n', 'decimal-point yes: numbers carry the point in emit');
    ok(out(mk('  for tool in tools\n    emit {tool.number}\n  end')) === '\n', 'for tool in tools: nothing when no tool is used');
    ok(out(mk('  emit T1', 'line-numbers 100')) === 'N100 T1\n', 'line numbers step by the number given');
    ok(out(mk('  raw hello', 'line-numbers 100')) === 'hello\n', 'raw has no line number');
    let rec = null;
    try { PD.renderPost(PD.parsePost('post r\non rapid\n  do rapid 1 2 3\nend\n'), hand[1]); } catch (e) { rec = e.message; }
    ok(rec, 'an event that runs itself (do rapid inside on rapid) stops with a message, not a stack overflow');
    const withTools = PD.renderPost(PD.parsePost(mk('  for tool in tools\n    comment T{tool.number} {tool.desc} {tool.flutes} {tool.fluteLen}\n  end')), hand[2]).text;
    ok(withTools === '(T1 D6 flat end mill 3 20)\n(T5 D14 drill 118 deg 2 60)\n(T7 D12 chamfer mill 90 deg 4 6)\n', 'tool variables inside for: number, description, flutes, flute length');
  }
  {
    // a refused or missing post
    let m = null;
    try { PO.post(hand[0], { post: 'custom:nope', posts: [] }); } catch (e) { m = e.message; }
    ok(m, 'a custom post that is not in the study is refused');
    m = null;
    try { PO.post(hand[0], { post: 'mach3' }); } catch (e) { m = e.message; }
    ok(m, 'an unknown post is refused');
    // the read of a study keeps custom posts and refuses bad ones
    const st = C.newStudy();
    st.posts = [{ id: 'mine', text: PB.BUILTIN_POSTS.grbl.replace('post grbl', 'post mine') }];
    st.setup.machine.post = 'custom:mine';
    const back = C.readStudy(JSON.parse(JSON.stringify(st)));
    ok(back.posts.length === 1 && back.posts[0].id === 'mine' && back.setup.machine.post === 'custom:mine', 'a study keeps its own posts and the chosen custom post');
    const bad = (fn) => { const x = JSON.parse(JSON.stringify(st)); fn(x); try { C.readStudy(x); return false; } catch { return true; } };
    ok(bad((x) => { x.posts[0].text = 'name only\n'; }) && bad((x) => { x.posts[0].id = 'a b'; }) && bad((x) => { x.setup.machine.post = 'custom:other'; }) && bad((x) => { x.posts.push(x.posts[0]); }) && bad((x) => { x.posts[0].text = 'x'.repeat(70000); }), 'a study with a post that does not parse, a bad id, a missing chosen post, the same id twice or a huge text is refused');
    const old = C.newStudy(); delete old.posts;
    ok(C.readStudy(JSON.parse(JSON.stringify(old))).posts.length === 0, 'a study from before custom posts reads with none');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runCamPostTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
