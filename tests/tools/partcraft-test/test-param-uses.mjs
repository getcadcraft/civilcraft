#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-param-uses.mjs — where each parameter is used (0.5 WL.30; params-uses.js) and scripts reading parameters
 * (cs-lib-io.js param() / params()).
 *   - a part with w = 40, h = w / 2, d = h + 2, t = 3: w drives Extrude1 depth directly, Sketch1's dimension through h and
 *     Hole1's diameter through h → d; t is used by nothing; a configuration sets w; one script reads param('h'), another
 *     params(), a third names a parameter the part lacks;
 *   - scriptParams on CraftScript, Lua (cs.param) and Python text: quotes, spacing, duplicates, names built at run time;
 *   - param('w') / params() in CraftScript and Lua against an io host with the part's values; a missing name says which exist;
 *     no host values → "no parameters with a value";
 *   - the CLI: `partcraft run x.craft --part p.json` hands the part's parameters to the script.
 *   node tools/partcraft-test/test-param-uses.mjs [--verbose]    (or runParamUsesTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runParamUsesTests({ ok, section }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), PP = await import(DEV + 'params-part.js');
  const U = await import(DEV + 'params-uses.js');

  // the part: a block (Sketch1 with its width dimension), extruded; a hole sketch; a hole
  const part = P.newPart('Uses');
  const b = F.blockSketch(100, 50);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
  const sk = S.newSketch(); S.addPoint(sk, 20, 20);
  const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
  const h1 = P.addFeature(part, 'hole', { sketch: s2.id, d: 6 });
  const tg = PP.partAdapter.targets(part);
  const dimKey = [...tg.keys()].find((k) => k.startsWith(s1.id + '.'));
  part.params = { vars: [{ name: 'w', expr: '40' }, { name: 'h', expr: 'w / 2' }, { name: 'd', expr: 'h + 2' }, { name: 't', expr: '3' }],
    links: [{ target: e1.id + '.depth', expr: 'w' }, { target: dimKey, expr: 'h' }, { target: h1.id + '.d', expr: 'd' }] };
  part.configs = { rows: [{ name: 'Small', values: { w: 30 } }, { name: 'Big', values: { w: 60 } }], active: null };
  part.studies = { script: { v: 1, active: 0, keepVars: false, scripts: [
    { name: 'half.craft', lang: 'craft', text: "x = param('h') * 2;\ny = param(\"h\");  % twice, listed once" },
    { name: 'all.lua', lang: 'lua', text: 'local p = cs.params()\nprint(p.w)' },
    { name: 'gone.py', lang: 'python', text: "v = cs.param( 'nope' ) + cs.param('w')" },
  ] } };

  section('parameters: where each one is used (0.5 WL.30)');
  {
    const u = U.paramUses(part);
    const w = u.get('w'), h = u.get('h'), d = u.get('d'), t0 = u.get('t');
    ok(w.direct.length === 1 && w.direct[0].target === e1.id + '.depth' && w.direct[0].label === 'Extrude1 depth' && w.direct[0].kind === 'feature' && w.direct[0].feature === e1.id,
      'w drives Extrude1 depth directly (a feature field, with its feature id)');
    const vs = w.via.map((x) => `${x.label} [${x.through.join('>')}] ${x.kind}`).sort();
    ok(vs.length === 2 && vs[0] === 'Hole1 diameter [h>d] feature' && /^Sketch1 D\d \(.+\) \[h\] dimension$/.test(vs[1]), 'and through other parameters: Hole1 diameter (through h → d) and Sketch1\'s dimension (through h): ' + vs.join('; '));
    ok(w.vars.join() === 'h' && h.vars.join() === 'd' && d.vars.length === 0, 'parameters built on it: w → h, h → d');
    ok(w.configs.join() === 'Small,Big' && h.configs.length === 0, 'the configurations that set w');
    ok(w.scripts.map((x) => x.name + (x.all ? '*' : '')).join() === 'all.lua*,gone.py' && h.scripts.map((x) => x.name + (x.all ? '*' : '')).join() === 'half.craft,all.lua*',
      'scripts: half.craft reads h, gone.py reads w, all.lua reads every parameter (marked)');
    ok(h.direct.length === 1 && h.direct[0].kind === 'dimension' && h.via.length === 1 && h.via[0].through.join() === 'd', 'h: the sketch dimension directly, the hole through d');
    ok(U.usesCount(t0) === 1 && t0.scripts[0].all && U.usesCount(U.paramUses({ ...part, studies: {} }).get('t')) === 0, 't is used by nothing but the params() script; without scripts, by nothing');
    const cyc = { ...part, params: { vars: [{ name: 'a', expr: 'b + 1' }, { name: 'b', expr: 'a + 1' }], links: [{ target: e1.id + '.depth', expr: 'b' }] }, configs: null, studies: {} };
    const uc = U.paramUses(cyc);
    ok(uc.get('a').via.length === 1 && uc.get('a').via[0].through.join() === 'b' && uc.get('b').direct.length === 1, 'parameters that use each other (an error elsewhere) still list their uses, no endless loop');
    ok(U.paramUses(P.newPart('Empty')).size === 0, 'a part without parameters: an empty map');
  }

  section('parameters: what a script reads');
  {
    const r = (s) => U.scriptParams(s);
    ok(r("a = param('w') + param(\"h\") + param( 'w' )").names.join() === 'w,h' && !r("param('w')").all, 'param(\'w\') and param("h"), spaced or not, each once');
    ok(r('local x = cs.param("depth")').names.join() === 'depth' && r("x = cs.param('w')  # python").names.join() === 'w', 'Lua and Python (cs.param) read the same way');
    ok(r('s = params(); x = s.w').all && r('s = params ( )').all && r('s = paramsx()').all === false, 'params() reads every parameter');
    ok(r("n = 'w'; x = param(n)").names.length === 0 && r("x = myparam('w')").names.length === 0 && r("x = param('2bad')").names.length === 0, 'a name built at run time, another function, a bad name: not counted');
  }

  section('parameters: param() and params() in scripts');
  {
    const CS = await import(DEV + 'cs-all.js');
    const out = [];
    CS.IO.setIoHost(CS.IO.memoryFs({ params: { w: 40, h: 20, bad: NaN, '1x': 3 } }));
    const rt = CS.makeRuntime({ onPrint: (x) => out.push(x), budget: 1e6 });
    let res = await rt.run("a = param('w'); b = param('h') * 2; s = params(); c = s.w + s.h;");
    ok(res.ok && rt.ws.get('a') === 40 && rt.ws.get('b') === 40 && rt.ws.get('c') === 60, 'CraftScript: param(\'w\') = 40, param(\'h\') * 2 = 40, params().w + .h = 60');
    ok(Object.keys(rt.ws.get('s').fields).join() === 'w,h', 'params() holds only finite numbers with good names');
    res = await rt.run("q = param('depth');");
    ok(!res.ok && res.error.message === 'param(): the part has no parameter called depth (it has w, h)' && res.error.line === 1, 'a missing parameter says which exist, at its line: ' + res.error.message);
    res = await rt.run('q = param(3);');
    ok(!res.ok && res.error.message === "param(name): the name must be text, e.g. param('width')", 'a name that is not text is refused: ' + res.error.message);
    if (CS.languageList().some((l) => l.id === 'lua')) {
      res = await rt.run("x = cs.param('w') + cs.params().h", { lang: 'lua' });
      ok(res.ok && rt.ws.get('x') === 60, 'Lua: cs.param(\'w\') + cs.params().h = 60');
    }
    CS.IO.setIoHost(CS.IO.memoryFs({}));
    res = await rt.run("q = param('w');");
    ok(!res.ok && res.error.message === 'param(): the part has no parameter called w (it has no parameters with a value)', 'no part parameters: said so');
    CS.IO.setIoHost(null);
  }

  section('parameters: the CLI hands them to a script');
  {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pc-param-'));
    try {
      const pf = path.join(dir, 'p.json'), sf = path.join(dir, 's.craft');
      fs.writeFileSync(pf, P.toJSON(part));
      fs.writeFileSync(sf, "disp(param('d') + 0.5)\n");
      const r = spawnSync(process.execPath, [path.join(REPO, 'tools/partcraft-cli/partcraft.mjs'), 'run', sf, '--part', pf], { encoding: 'utf8', timeout: 120000 });
      ok(r.status === 0 && r.stdout.split('\n')[0].trim() === '22.5', `partcraft run --part (a part with scripts, which the CLI could not open before): param('d') + 0.5 = 22.5 (w 40 → h 20 → d 22): ${r.stdout.split('\n')[0].trim() || r.stderr.trim().split('\n').pop()}`);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runParamUsesTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
