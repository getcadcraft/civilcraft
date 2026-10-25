#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-script.mjs — the Script workspace's DOM-free parts (builder C, docs/SCRIPTING-SPEC.md §5): its registration,
 * scripts stored in the part (cs-ui.js readScriptStudy: untrusted, capped, saved variables), the display geometry
 * (surfaceOf for tri/quad/tet4/tet10/hex8/voxel, field components, deformation scale), sub-display helpers (plots, ticks,
 * tables, CSV/JSON), the library index reader, the editor's tokenizer, and the engine client (cs-client.js) against the
 * worker ops called directly: print/display streaming, errors with lines, the step budget, Stop keeping the workspace.
 *   node tools/partcraft-test/test-script.mjs [--verbose]     (or runScriptTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runScriptTests({ ok, section }) {
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const WS = await import(DEV + 'workspaces.js');
  const SCR = await import(DEV + 'ws-script.js');
  const C = await import(DEV + 'cs-ui.js');
  const V = await import(DEV + 'cs-values.js');
  const P = await import(DEV + 'part.js');
  const E = await import(DEV + 'cs-editor.js');
  const { createEngine, normResult } = await import(DEV + 'cs-client.js');

  section('script workspace: registration');
  {
    const w = WS.getWorkspace('script');
    ok(w && w.label === 'Script' && w.icon === 'code-square', 'the Script workspace is registered (label Script, icon code-square)');
    const cmds = w.groups.flatMap((g) => g.items.map((i) => i.cmd));
    ok(cmds.join() === 'script-new,script-open,script-save,script-run,script-run-sel,script-stop', 'its toolbar group: New, Open, Save, Run, Selection, Stop');
    ok(w.groups[0].items.every((i) => !/[A-Z]{2,}/.test(i.label) && !i.label.includes('→')), 'button labels: sentence case, no arrows');
    ok(w.toolState('script-stop').ok === false && /Nothing is running/.test(w.toolState('script-stop').why) && w.toolState('script-run').ok, 'Stop is off while nothing runs; Run is on');
    ok(Array.isArray(SCR.WORKER_MODULES) && SCR.WORKER_MODULES.every((m) => /^[a-z0-9-]+\.js$/.test(m)), `worker modules are this build's files (${SCR.WORKER_MODULES.join(', ')})`);
  }

  section('script workspace: scripts saved in the part (untrusted)');
  {
    const st = C.readScriptStudy({ scripts: [{ name: 'beam test.craft', lang: 'craft', text: 'x = 1\r\ny = 2' }, { name: 'beam_test', lang: 'lua', text: 'print(1)' }, { name: '9lives', lang: 'cobol', text: 'a\u0000b\u0007c\td' }], active: 1, keepVars: false });
    ok(st.scripts.map((s) => s.name).join() === 'beam_test,beam_test2,lives', `names cleaned and kept unique (${st.scripts.map((s) => s.name).join(', ')})`);
    ok(st.scripts[0].text === 'x = 1\ny = 2' && st.scripts[2].text === 'abc\td', 'CRLF → LF; control characters other than tab and newline dropped');
    ok(st.scripts[2].lang === 'craft' && st.scripts[1].lang === 'lua' && st.active === 1, 'an unknown language becomes CraftScript; lua kept; active kept');
    ok(C.readScriptStudy({ scripts: [{ name: 'wing', lang: 'python', text: 'x = 1' }], active: 0 }).scripts[0].lang === 'python', 'a Python script is kept as Python (0.4 P10)');
    ok(throws(() => C.readScriptStudy({ scripts: Array.from({ length: 65 }, () => ({ name: 'a', text: '' })) }), /more than 64 scripts/), 'more than 64 scripts → refused');
    ok(throws(() => C.readScriptStudy({ scripts: [{ name: 'a', text: 'x'.repeat((1 << 20) + 1) }] }), /longer than/), 'a script over 1 MB → refused');
    ok(throws(() => C.readScriptStudy({ scripts: 'nope' }), /no list/) && throws(() => C.readScriptStudy([1]), /not readable/) && throws(() => C.readScriptStudy({ scripts: [{ name: 'a', text: 5 }] }), /not text/), 'bad shapes → plain messages');
    ok(throws(() => C.readScriptStudy({ scripts: Array.from({ length: 9 }, (_, i) => ({ name: 's' + i, text: 'x'.repeat(1 << 20) })) }), /too long altogether/), 'scripts over 8 MB altogether → refused');
    ok(C.readScriptStudy({ scripts: [], active: 99 }).active === 0, 'an out-of-range active tab → 0');
    // saved variables
    const snap = { A: V.tensor([2, 3], Float64Array.from([1, 2, 3, 4, NaN, Infinity])), s: 'hi', n: 4.5, m: { t: 'mesh', kind: 'tri', nodes: Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), elems: Int32Array.from([0, 1, 2]) } };
    const enc = C.encodeVars(snap);
    const json = JSON.parse(JSON.stringify(enc.vars));
    const st2 = C.readScriptStudy({ scripts: [{ name: 'a', text: '' }], keepVars: true, vars: json });
    const dec = C.decodeVars(st2.vars).vars;
    ok(dec.A && dec.A.shape.join() === '2,3' && dec.A.data[3] === 4 && Number.isNaN(dec.A.data[4]) && dec.A.data[5] === Infinity && dec.s === 'hi' && dec.n === 4.5, 'saved variables survive JSON: a 2×3 array with NaN and Inf, text, a number');
    ok(dec.m && dec.m.elems instanceof Int32Array && dec.m.nodes.length === 9, 'a mesh keeps its typed arrays');
    ok(!('vars' in C.readScriptStudy({ scripts: [], keepVars: false, vars: json })), 'saved variables without the switch on are dropped');
    const bad = C.readScriptStudy({ scripts: [], keepVars: true, vars: { 'bad name': 1, ok: { t: 'tensor', shape: [2, 2], data: { $type: 'f64', $b64: 'AAAA' } }, good: 3 } });
    ok(Object.keys(bad.vars).join() === 'good', 'bad names and arrays whose bytes do not fit their shape are dropped');
    // through a part file
    const part = P.newPart('Scripted');
    P.setStudy(part, C.SCRIPT_KEY, C.readScriptStudy({ scripts: [{ name: 'main', text: 'disp(1)' }] }));
    const back = P.readPart(JSON.stringify(part));
    ok(P.study(back, 'script').scripts[0].text === 'disp(1)', 'scripts round-trip through a saved part (study "script")');
    const raw = JSON.parse(JSON.stringify(part)); raw.studies.script.scripts = 7;
    ok(throws(() => P.readPart(JSON.stringify(raw))), 'a part whose scripts are tampered with does not open');
  }

  section('script workspace: what the canvas draws');
  {
    const tri = C.surfaceOf({ t: 'mesh', kind: 'tri', nodes: Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]), elems: Int32Array.from([0, 1, 2, 1, 3, 2]) });
    ok(tri.indices.length === 6 && tri.positions.length === 12 && tri.lines.length === 10, 'tri: 2 triangles, 4 vertices, 5 edges');
    const quad = C.surfaceOf({ t: 'mesh', kind: 'quad', nodes: Float64Array.from([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]), elems: Int32Array.from([0, 1, 2, 3]) });
    ok(quad.indices.length === 6 && quad.triElem.join() === '0,0', 'quad: 2 triangles of element 0');
    const tet = C.surfaceOf({ t: 'mesh', kind: 'tet4', nodes: Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]), elems: Int32Array.from([0, 1, 2, 3]) });
    // every face's normal points away from the opposite corner
    let out = true;
    for (let t = 0; t < 4; t++) {
      const p = (k) => [0, 1, 2].map((c) => tet.positions[3 * tet.indices[3 * t + k] + c]);
      const a = p(0), b = p(1), c = p(2), u = b.map((x, i) => x - a[i]), w = c.map((x, i) => x - a[i]);
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const cen = [0.25, 0.25, 0.25].map((x, i) => x - a[i]);
      if (n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] >= 0) out = false;
    }
    ok(tet.indices.length === 12 && out, 'tet4: 4 outward faces');
    // a cube as 6 tets around the 0-6 diagonal: 12 boundary triangles, 8 nodes
    const cubeN = Float64Array.from([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1]);
    const tets = Int32Array.from([0, 1, 2, 6, 0, 2, 3, 6, 0, 3, 7, 6, 0, 7, 4, 6, 0, 4, 5, 6, 0, 5, 1, 6]);
    const cube = C.surfaceOf({ t: 'mesh', kind: 'tet4', nodes: cubeN, elems: tets });
    ok(cube.indices.length / 3 === 12 && cube.vertNode.length === 8, `6 tets in a cube: ${cube.indices.length / 3} boundary triangles, ${cube.vertNode.length} nodes`);
    const t10N = Float64Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0.5, 0, 0, 0, 0.5, 0.5, 0, 0.5, 0, 0.5, 0.5]);
    const t10 = C.surfaceOf({ t: 'mesh', kind: 'tet10', nodes: t10N, elems: Int32Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) });
    ok(t10.indices.length / 3 === 16 && t10.vertNode.length === 10, 'tet10: each face split at its midside nodes (16 triangles, 10 nodes)');
    const hex = C.surfaceOf({ t: 'mesh', kind: 'hex8', nodes: cubeN, elems: Int32Array.from([0, 1, 2, 3, 4, 5, 6, 7]) });
    ok(hex.indices.length / 3 === 12 && hex.lines.length / 2 === 12, 'hex8: 6 faces, 12 triangles, 12 edges');
    const solid = new Uint8Array(27).fill(1); solid[13] = 0;   // 3×3×3 with the middle cube empty (an inside hole)
    const vox = C.surfaceOf({ t: 'mesh', kind: 'voxel', nx: 3, ny: 3, nz: 3, h: 2, origin: [0, 0, 0], solid });
    ok(vox.indices.length / 3 === 2 * (54 + 6) && vox.elems === 27 && vox.nodes === 64, `voxel 3×3×3 with a hole: ${vox.indices.length / 3} triangles (outer 54 + hole 6 squares)`);
    let mx = 0; for (const x of vox.positions) mx = Math.max(mx, x);
    ok(mx === 6, 'voxel node coordinates from origin + h');
    ok(throws(() => C.surfaceOf({ t: 'mesh', kind: 'tet4', nodes: cubeN, elems: Int32Array.from([0, 1, 2, 99]) }), /node 100/), 'an element pointing at a missing node → plain message');
    ok(throws(() => C.surfaceOf({ t: 'mesh', kind: 'wedge6', nodes: cubeN, elems: Int32Array.from([0]) }), /cannot be shown yet/), 'an unknown mesh kind → says it cannot be shown yet');
    ok(C.surfaceOf({ t: 'model', source: 'part', mesh: { positions: Float32Array.from([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: Uint32Array.from([0, 1, 2]) } }).indices.length === 3, 'a model with a PartCraft display mesh is drawn');
    const s6 = { comps: 6, data: Float64Array.from([100, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0]) };
    const vm = C.fieldScalar(s6, 'vm').values;
    ok(Math.abs(vm[0] - 100) < 1e-9 && Math.abs(vm[1] - 10 * Math.sqrt(3)) < 1e-9, 'von Mises: uniaxial 100 → 100, pure shear 10 → 17.32');
    ok(C.fieldScalar({ comps: 3, data: Float64Array.from([3, 4, 0]) }, 'mag').values[0] === 5 && C.fieldScalar({ comps: 3, data: Float64Array.from([3, 4, 0]) }, 'y').values[0] === 4, 'vector field: magnitude 5, Y 4');
    ok(C.componentsOf({ comps: 6 }).length === 7 && C.componentsOf({ comps: 1 }).length === 1, 'component choices: 7 for a tensor field, 1 for a scalar');
    const sc = C.autoScale(cube.positions, Float64Array.from({ length: 24 }, (_, i) => (i % 3 === 1 ? -0.001 : 0)), cube.vertNode);
    ok(sc === 200, `deformation scale: 0.001 on a unit cube → ×${sc} (8 % of the diagonal = 139, rounded up to 1-2-5)`);
    const r = C.rangeOf(Float64Array.from([5, 5, 5]));
    ok(r.hi > r.lo, 'a constant field still gets a range');
  }

  section('script workspace: sub-displays and files');
  {
    const p = C.normalizePlot({ plot: { y: V.tensor([3, 2], Float64Array.from([1, 2, 3, 10, 20, 30])), title: 'Two' } });
    ok(p.series.length === 2 && p.series[1].y[2] === 30 && p.series[0].x[2] === 3 && p.title === 'Two', 'a 3×2 matrix plots as two series against 1…3');
    const q = C.normalizePlot({ plot: V.tensor([1, 4], Float64Array.from([4, 3, 2, 1])), opts: { title: 'c', log: 'y' } });
    ok(q.series.length === 1 && q.log === 'y' && q.title === 'c', 'a bare tensor plot with options (log y)');
    ok(throws(() => C.normalizePlot({ plot: {} }), /no values/), 'a plot without values → plain message');
    const nt = C.niceTicks(0.013, 0.97, 5);
    ok(nt.lo === 0 && nt.hi === 1 && nt.ticks.length >= 5, `ticks 0.013…0.97 → ${nt.ticks.join(' ')}`);
    const T3 = V.tensor([2, 2, 2], Float64Array.from([1, 2, 3, 4, 5, 6, 7, 8]));
    const g = C.grid2d(T3, 1);
    ok(g.pages === 2 && g.get(0, 1) === 7 && g.get(1, 0) === 6, 'a 2×2×2 array: page 2, column-major');
    const tb = C.tableOf(V.tensor([300, 2]), { maxRows: 200 });
    ok(tb.rows.length === 200 && /200 of 300 rows/.test(tb.more), 'tables show at most 200 rows and say so');
    ok(C.tableOf(V.struct({ a: 1, b: 'x' })).rows.map((x) => x.join('=')).join() === 'a=1,b=x', 'a struct as field/value rows');
    ok(C.tensorCsv(V.tensor([2, 2], Float64Array.from([1, 3, 2, NaN]))) === '1,2\r\n3,NaN\r\n', 'CSV: rows in order, NaN written');
    const js = JSON.parse(C.valuesJson({ A: V.tensor([1, 2], Float64Array.from([1, Infinity])) }));
    ok(js.format === 'craftscript-workspace' && js.vars.A.data[1] === 'Infinity', 'JSON: format named, Inf as text');
    ok(C.fileKind('a.CRAFT') === 'script' && C.fileKind('b.lua') === 'script' && C.fileKind('m.stl') === 'data' && C.fileKind('x.h5') === 'data' && C.fileKind('p.partcraft.json') === 'part' && C.fileKind('q.step') === 'part' && C.fileKind('r.exe') === null, 'file kinds: scripts, data, parts, other');
    ok(C.varNameFromFile('beam mesh (2).stl') === 'beam_mesh_2' && C.varNameFromFile('2024.csv') === 'data', 'data files load under a valid variable name');
    ok(C.cleanName('../../etc') === 'etc' && C.uniqueName('a', ['a', 'a2']) === 'a3', 'script names: cleaned, unique');
  }

  section('script workspace: the library index (builder D) and the editor');
  {
    const g1 = C.readLibraryIndex({ groups: [{ id: 'static', label: 'Static', items: [{ name: 'static_tet', summary: 'Linear static, tets' }, { name: 'bad name' }, { name: 'x', file: '../../etc/passwd.craft' }] }] });
    ok(g1.length === 1 && g1[0].items.length === 2 && g1[0].items[1].file === 'x.craft', 'groups read; bad names dropped; a path outside the library falls back to <name>.craft');
    const g2 = C.readLibraryIndex({ mesh: ['box_mesh', { name: 'tet_mesh', doc: 'Tets' }], topopt: [] });
    ok(g2.length === 1 && g2[0].label === 'Mesh' && g2[0].items[1].summary === 'Tets', 'the {group: [...]} form; empty groups hidden');
    ok(C.readLibraryIndex({ groups: [] }).length === 0 && C.readLibraryIndex(null).length === 0, 'an empty or missing index → no groups');
    ok(C.headerDoc('function c = top88(nelx)\n% TOP88  Topology optimization\n% Reference: Andreassen 2011\nx = 1') === 'TOP88  Topology optimization\nReference: Andreassen 2011', 'header doc after a function line');
    ok(C.headerDoc('%{\nWhat: a box\n%}\nx=1') === 'What: a box' && C.headerDoc('-- Lua doc\nlocal x') === 'Lua doc', 'block and Lua header docs');
    const tk = (l, g, b) => E.tokenizeLine(l, E.DEFAULT_GRAMMARS[g], { block: false }, b).tokens.filter((t) => t.t !== 'sp').map((t) => t.t + ':' + t.s).join(' ');
    ok(tk("s = 'a b'; y = x';", 'craft') === "id:s op:= str:'a b' op:; id:y op:= id:x op:' op:;", 'quotes: a string after =, a transpose after a name');
    ok(tk('for i = 1:3.5e2 % loop', 'craft') === 'kw:for id:i op:= num:1 op:: num:3.5e2 com:% loop', 'keywords, numbers with exponents, comments');
    ok(tk('zeros(3)', 'craft', new Set(['zeros'])) === 'bi:zeros op:( num:3 op:)', 'builtin names marked');
    let st = { block: false };
    const kinds = ['%{', 'x = 1', '%}', 'y'].map((l) => { const r = E.tokenizeLine(l, E.DEFAULT_GRAMMARS.craft, st); st = r.state; return r.tokens.map((t) => t.t).join(); });
    ok(kinds.join('|') === 'com|com|com|id', 'a %{ … %} block comments every line inside it');
    ok(tk('local x = 1 -- note', 'lua') === 'kw:local id:x op:= num:1 com:-- note', 'Lua: keywords and -- comments');
    // builder A's grammar shape: comment: [line, open, close]
    st = { block: false };
    const ag = { keywords: ['end'], comment: ['%', '%{', '%}'], string: ["'"], number: true };
    const ak = ['%{', 'end', '%}', 'end'].map((l) => { const r = E.tokenizeLine(l, ag, st); st = r.state; return r.tokens.map((t) => t.t).join(); });
    ok(ak.join('|') === 'com|com|com|kw', "the runtime's grammar form (comment: ['%', '%{', '%}']) works too");
    let long = ''; for (let i = 0; i < 10000; i++) long += `x${i} = sin(${i}) * 2; % line ${i}\n`;
    const t0 = Date.now(); let s2 = { block: false };
    for (const l of long.split('\n')) s2 = E.tokenizeLine(l, E.DEFAULT_GRAMMARS.craft, s2).state;
    ok(Date.now() - t0 < 1500, `tokenizing 10,000 lines takes ${Date.now() - t0} ms (the editor only does the visible ones)`);
  }

  section('script workspace: find and replace, folding, autocomplete (0.4 P7, cs-edit-tools.js)');
  {
    const ET = await import(DEV + 'cs-edit-tools.js');
    const txt = 'x = sum(xs);\nX = max(x, xs(end));\n% x in a comment\nfoo_x = x2 + x;';
    const at = (r) => r.matches.map((m) => txt.slice(m.s, m.e) + '@' + m.s).join(' ');
    const nX = [...txt].filter((c) => c === 'x' || c === 'X').length, nx = [...txt].filter((c) => c === 'x').length;
    ok(ET.findAll(txt, 'x').matches.length === nX && ET.findAll(txt, 'x', { matchCase: true }).matches.length === nx, `find: case-insensitive by default (${nX} x or X, counted letter by letter), Match case ${nx}`);
    const wordRef = [...txt.matchAll(/\bx\b/g)].map((m) => 'x@' + m.index).join(' ');
    ok(at(ET.findAll(txt, 'x', { wholeWord: true, matchCase: true })) === wordRef && wordRef.split(' ').length === 4, `whole words: x alone, not xs, x2, max or foo_x — the same as /\\bx\\b/ (${wordRef})`);
    ok(ET.findAll(txt, 'x\\w+', { regex: true }).matches.map((m) => txt.slice(m.s, m.e)).join() === 'xs,xs,x2' && ET.findAll(txt, '(', { regex: true }).error && !ET.findAll(txt, '(').error, 'regular expressions; a broken one reports its error, a literal "(" is fine');
    ok(ET.findAll('aaa', 'a*', { regex: true }).matches.length === 1 && ET.findAll('abc', 'x*', { regex: true }).matches.length === 0, 'a pattern that can match nothing finds only real matches (no endless empty hits)');
    const r1 = ET.replaceAll(txt, 'x', 'y', { wholeWord: true, matchCase: true });
    ok(r1.count === 4 && r1.text === 'y = sum(xs);\nX = max(y, xs(end));\n% y in a comment\nfoo_x = x2 + y;', 'Replace all, whole words, case: 4 replaced, xs / x2 / foo_x / X kept');
    const r2 = ET.replaceAll('f(1) + f(22)', 'f\\((\\d+)\\)', 'g[$1]$$', { regex: true });
    ok(r2.text === 'g[1]$ + g[22]$' && r2.count === 2, `regex groups in the replacement: ${r2.text}`);
    const mm = ET.findAll('ab xx ab', '(?<=x )ab', { regex: true }).matches[0];
    ok(mm && ET.replaceMatch('ab xx ab', mm, '(?<=x )ab', '[$&]', { regex: true }) === '[ab]', 'one replacement keeps its context (a lookbehind still sees the text before it)');
    // folding
    const craft = ['function y = f(x)', '  if x > 0', '    y = x(end);', '  else', '    y = 0;', '  end', 'end', 'c = {1, 2};', 'z = c{end};', '%{', 'if end', '%}', 's = "for end";'];
    ok(JSON.stringify(ET.foldBlocks(craft, 'craft')) === JSON.stringify([{ start: 0, end: 6 }, { start: 1, end: 5 }]), "MATLAB-style blocks: function … end and if … end; x(end), c{end}, strings and %{ %} comments don't count");
    const lua = ['local function g(a)', '  for i = 1, 3 do', '    print(i)', '  end', '  if a then', '    return 1', '  elseif b then', '    return 2', '  end', 'end', 'repeat', '  x = x + 1', 'until x > 3', '--[[ if', 'end ]]', 's = "do end"'];
    ok(JSON.stringify(ET.foldBlocks(lua, 'lua')) === JSON.stringify([{ start: 0, end: 9 }, { start: 1, end: 3 }, { start: 4, end: 8 }, { start: 10, end: 12 }]), 'Lua blocks: function, for … do, if (elseif does not open), repeat … until; long comments and strings skipped');
    ok(ET.foldBlocks(['if x', 'end'], 'craft').length === 0, 'a block with nothing inside cannot fold');
    const hid = new Map(), m5 = ET.foldMarker(5), m9 = ET.foldMarker(9);
    ok([...m5].every((c) => /[⁣⁤​-‍⁠]/.test(c)) && ET.markersIn('a' + m5 + 'b' + m9).map((m) => m.id).join() === '5,9' && ET.stripMarkers('a' + m5 + 'b') === 'ab', 'fold markers are zero-width characters carrying the fold id, found again and stripped');
    hid.set(5, '  y = 1;\n  z = 2;');
    ok(ET.expandFolds('if x' + m5 + '\nend', hid) === 'if x\n  y = 1;\n  z = 2;\nend', 'a folded block expands back after its first line');
    ok(ET.expandFolds('if x' + m5 + ' && w\nend', hid) === 'if x && w\n  y = 1;\n  z = 2;\nend', 'text typed after the marker stays on the first line; the folded lines follow the line');
    hid.set(9, '    deep'); hid.set(5, '  for k = 1:2' + m9 + '\n  end');
    ok(ET.expandFolds('if x' + m5 + '\nend', hid) === 'if x\n  for k = 1:2\n    deep\n  end\nend', 'folds inside folds expand too');
    ok(ET.expandFolds('a' + ET.foldMarker(77) + '\nb', hid) === 'a\nb', 'a marker nobody knows (pasted, or a fold Undo took back) is just dropped');
    // completion
    const cs = ET.completions('pl', { keywords: ['plot'], builtins: [{ name: 'plot', args: 'x, y', doc: 'Draw a line' }, { name: 'plus', args: 'a, b' }, { name: 'Plane' }], vars: ['plane', 'pl'], text: 'place = 1; placement2 = place; pl' });
    ok(cs.map((c) => c.label).join() === 'plane,plot,plus,place,placement2,Plane' && cs.find((c) => c.label === 'plot').detail === 'plot(x, y) — Draw a line', `completions: variables, then functions (with their arguments), the script's words, other case last; the prefix itself left out (${cs.map((c) => c.kind + ':' + c.label).join(' ')})`);
    ok(ET.completions('', {}).length === 0 && ET.completions('9a', {}).length === 0 && ET.completions('z', { text: 'zz' }).length === 0, 'no prefix, or not a name: nothing; words shorter than 3 letters are not offered from the text');
  }

  section('script workspace: plot export (0.4 P9, cs-plot-export.js)');
  {
    const PX = await import(DEV + 'cs-plot-export.js'), UI = await import(DEV + 'cs-ui.js');
    const { spawnSync } = await import('node:child_process');
    const fsx = await import('node:fs'), I18N = await import(DEV + 'i18n.js');
    I18N.init({ locale: 'en', strings: JSON.parse(fsx.readFileSync(DEV + 'lang/en.json', 'utf8')) });
    const p1 = UI.normalizePlot({ plot: { x: [1, 2, 3, 4], y: [10, 20, 15, 30] }, opts: { title: 'Compliance <history>', xlabel: 'iteration', ylabel: 'c' } });
    const p2 = UI.normalizePlot({ plot: { series: [{ x: [0, 1, 2], y: [1, 4, 9], name: 'square' }, { x: [0, 1, 2], y: [1, 2, 3], name: '=line' }] }, opts: { title: 'two' } });
    const p3 = UI.normalizePlot({ plot: { series: [{ x: [0, 1], y: [5, 6], name: 'a, "b"' }, { x: [0, 0.5, 1], y: [1, NaN, 3], name: 'c' }] }, opts: { log: 'y' } });
    const svg = PX.plotSvg(p1);
    const xml = spawnSync('python3', ['-c', 'import sys, xml.etree.ElementTree as E; r = E.fromstring(sys.stdin.read()); print(r.tag.split("}")[1], len([e for e in r.iter() if e.tag.endswith("polyline")]), r.get("width"))'], { input: svg, encoding: 'utf8' });
    ok(xml.status === 0 && xml.stdout.trim() === 'svg 1 800', `the SVG is well-formed XML (Python's ElementTree: ${xml.stdout.trim() || xml.stderr.trim()}): one polyline, 800 wide`);
    ok(svg.includes('Compliance &lt;history&gt;') && !/<script|href=/i.test(svg) && svg.includes('fill="#FFFFFF"'), 'title text escaped, no script or links, printed on white');
    const Ly = PX.plotLayout(p1, 800, 500), pts = [...svg.matchAll(/points="([^"]+)"/g)][0][1].split(' ').map((q) => q.split(',').map(Number));
    ok(pts.length === 4 && pts.every(([x, y], i) => Math.abs(x - Ly.sx(p1.series[0].x[i])) < 0.006 && Math.abs(y - Ly.sy(p1.series[0].y[i])) < 0.006), 'the polyline points are the values through the same layout the canvas draws with');
    ok(PX.plotCsv(p1) === 'iteration,c\r\n1,10\r\n2,20\r\n3,15\r\n4,30\r\n', 'CSV, one series: x and y columns named by the axis labels (CRLF)');
    ok(PX.plotCsv(p2) === "x,square,'=line\r\n0,1,1\r\n1,4,2\r\n2,9,3\r\n", 'CSV, series sharing x: one row per x; a series name that starts with = gets a leading \' (not a formula)');
    ok(PX.plotCsv(p3) === 'series,x,y\r\n"a, ""b""",0,5\r\n"a, ""b""",1,6\r\nc,0,1\r\nc,0.5,\r\nc,1,3\r\n', 'CSV, different x: series, x, y rows; quotes and commas quoted (RFC 4180); a missing value left empty');
    const svg3 = PX.plotSvg(p3);
    ok((svg3.match(/<polyline/g) || []).length === 3 && svg3.includes('data-series="a, &quot;b&quot;"'), 'a gap (NaN) breaks the line in two; series names are escaped in the SVG');
    ok(PX.plotFileName(p1, 'png') === 'Compliance history.png' && PX.plotFileName(p3, 'svg') === 'plot.svg', 'file names from the title (characters a file name cannot hold dropped), else "plot"');
  }

  section('script workspace: the engine client against the worker ops');
  {
    const { OPS } = await import(DEV + 'worker-ops.js');
    if (!OPS.csRun) await import(DEV + SCR.WORKER_MODULES[0]);
    // a terminated worker takes its workspace with it: clearing it stands for that here
    const reset = () => { OPS.csWorkspace({ op: 'clear' }); };
    reset();
    const prints = [], displays = [];
    let starts = 0;
    const fake = () => { starts++; let dead = false; return {
      call: async (op, args, { onProgress } = {}) => { if (dead) throw new Error('Stopped.'); return OPS[op](structuredClone(args), { progress: (v) => onProgress && onProgress(structuredClone(v)), transfer() {} }); },
      terminate() { dead = true; reset(); },
    }; };
    const eng = createEngine({ makeWorker: fake, onPrint: (t) => prints.push(t), onDisplay: (d) => displays.push(d) });
    const r1 = await eng.run("a = 5;\nb = [1 2 3]\ndisp('hello')\nplot(b, 'title', 'Curve')", { lang: 'craft', file: 'one' });
    ok(r1.ok && prints.join('').includes('hello') && prints.some((p) => /^b =/.test(p)), 'run: prints and echoes stream back');
    ok(displays.some((d) => d.plot && C.normalizePlot(d).title === 'Curve'), 'run: a display command streams back (plot titled Curve)');
    ok(r1.list.some((v) => v.name === 'a' && v.type === 'number') && r1.list.some((v) => v.name === 'b' && v.size.join() === '1,3'), 'after a run: the variable list (name, type, size)');
    const r2 = await eng.run('c = a * 2\nd = nope + 1', { file: 'two' });
    ok(!r2.ok && r2.error.line === 2 && /nope/.test(r2.error.message), `an error carries its line (${r2.error.line}: ${r2.error.message})`);
    ok((await eng.get('c')) === 10, 'the workspace carries a into the next script (c = 10)');
    const r3 = await eng.run('i = 0;\nwhile 1\n  i = i + 1;\nend', { budget: 5000 });
    ok(!r3.ok && r3.stopped && /budget/.test(r3.error.message), 'an endless loop stops at the step budget with a message');
    // Stop: the worker goes; the variables come back in the next one
    eng.stop();
    const before = starts;
    ok((await eng.get('a')) === 5 && starts === before + 1, 'after Stop a new worker starts with the variables as they were');
    await eng.set('z', V.tensor([1, 2], Float64Array.from([7, 8])));
    ok((await eng.get('z')).data[1] === 8, 'set/get a variable');
    await eng.del('z');
    ok(!(await eng.list()).some((v) => v.name === 'z'), 'delete a variable');
    const info = await eng.info();
    if (info.languages.some((l) => l.id === 'lua')) {
      const lr = await eng.run('x = ws.a + 1', { lang: 'lua' });
      ok(lr.ok && (await eng.get('x')) === 6, 'a Lua script runs and shares the workspace (x = ws.a + 1 = 6)');
    } else console.log('  note: the runtime has no Lua yet (cs-all.js does not load cs-lang-lua.js): Lua check skipped');
    ok(info.languages.some((l) => l.id === 'craft' && l.highlight && l.highlight.keywords.includes('for')) && info.builtins.length > 50, `csInfo: languages with their grammar, ${info.builtins.length} builtins`);
    const nr = normResult({ ok: false, error: { message: 'm', line: 3, stack: [{ name: 'f', line: 2, file: 'lib' }] } });
    ok(nr.error.line === 3 && nr.error.stack[0] === 'in f at line 2 (lib)', 'call-stack frames as text');
    ok(normResult(null).ok === false && /no answer/.test(normResult(null).error.message), 'no result → a plain error');
    reset();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  // run alone, the app's words come from its language file, as bin/test-partcraft.mjs sets them up (closing_PART_2)
  const fs = await import('node:fs');
  (await import(DEV + 'i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
  await runScriptTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
