#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * repo.mjs — build the public repo getcadcraft/mcp in a local folder (0.7 AS.2; session assistants). It never pushes and never
 * publishes: the owner creates the GitHub repo, pushes and publishes (docs/0.7-sessions/assistants.md § For the owner).
 *
 *   node tools/mcp/repo.mjs [--out tmp/public-repos/mcp] [--commit] [--tgz]
 *
 * The repo root IS the npm package (pack.mjs's output) plus what only the repo carries, all left out of the package by
 * package.json "files": test/smoke.mjs (the package's own check: the stdio server and the CLI on the fixtures, no dev
 * dependencies), fixtures/ (public samples; the site and part files made once here with CivilCraft's and PartCraft's own code),
 * CONTRIBUTING.md, .github/workflows/{test,publish}.yml (tests on Linux, Windows, macOS × Node 20/22/24; publish with npm
 * provenance from a GitHub release), .gitignore. A .git folder already in --out is kept once it has a remote; until then --commit starts it again as one commit by
 * CadCraft.
 * --tgz runs `npm pack` → <out>/../getcadcraft-mcp-<version>.tgz.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const OUT = path.resolve(oi >= 0 ? args[oi + 1] : path.join(ROOT, 'tmp/public-repos/mcp'));
const AUTHOR = ['-c', 'user.name=CadCraft', '-c', 'user.email=ddgconsultant@getcadcraft.com'];

// ---- the package, into a fresh folder, then over OUT (keeping OUT/.git)
const STAGE = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-mcp-repo-'));
execFileSync(process.execPath, [path.join(ROOT, 'tools/mcp/pack.mjs'), '--out', path.join(STAGE, 'pkg')], { stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT)) if (e !== '.git') fs.rmSync(path.join(OUT, e), { recursive: true, force: true });
fs.cpSync(path.join(STAGE, 'pkg'), OUT, { recursive: true });
fs.rmSync(STAGE, { recursive: true, force: true });
const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true }); fs.writeFileSync(path.join(OUT, rel), text); };

// ---- package.json: publishable from this repo
const pkg = JSON.parse(fs.readFileSync(path.join(OUT, 'package.json'), 'utf8'));
delete pkg.private;
pkg.repository = { type: 'git', url: 'git+https://github.com/getcadcraft/mcp.git' };
pkg.bugs = { url: 'https://github.com/getcadcraft/mcp/issues' };
pkg.scripts = { test: 'node test/smoke.mjs' };
pkg.publishConfig = { access: 'public', provenance: true };
fs.writeFileSync(path.join(OUT, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

// ---- fixtures: public samples, and a site and a part made with the apps' own code
const FIX = path.join(OUT, 'fixtures');
fs.mkdirSync(FIX, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'fixtures/dwg/kitchen-equipment.dwg'), path.join(FIX, 'kitchen-equipment.dwg'));
fs.copyFileSync(path.join(ROOT, 'fixtures/dwg/base-plan.dxf'), path.join(FIX, 'base-plan.dxf'));
fs.copyFileSync(path.join(ROOT, 'fixtures/showcase/bimcraft-house.ifc'), path.join(FIX, 'house.ifc'));
fs.copyFileSync(path.join(ROOT, 'tools/mcp/test/fixtures/job.takeoff.json'), path.join(FIX, 'job.takeoff.json'));
{
  const { load } = await import(pathToFileURL(path.join(ROOT, 'tools/cli/headless/apps.mjs')).href);
  const PJ = await load('civilcraft', 'project.js'), PT = await load('civilcraft', 'points.js');
  const p = new PJ.Project();
  p.setPoints(PT.parsePoints(fs.readFileSync(path.join(ROOT, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site-topo.csv');
  p.state.name = 'Sample site';
  const xs = p.points.map((q) => q.x), ys = p.points.map((q) => q.y), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const z = Math.round(p.eg().surface.elevationAt(mx, my)) + 2;
  p.state.pads.push({ id: 'd1', name: 'Pad A', pts: [{ x: mx - 25, y: my - 25 }, { x: mx + 25, y: my - 25 }, { x: mx + 25, y: my + 25 }, { x: mx - 25, y: my + 25 }], z, cut: 2, fill: 2 });
  fs.writeFileSync(path.join(FIX, 'site.civilcraft.json'), JSON.stringify(p.toJSON()));
  const STD = await load('partcraft', 'stdparts.js'), PP = await load('partcraft', 'part.js');
  const id = STD.TEMPLATES[0].id;
  fs.writeFileSync(path.join(FIX, 'screw.partcraft.json'), PP.toJSON(STD.makeTemplate(id, STD.templateSizes(id)[2])));
}
put('fixtures/README.md', `# Test files

Public samples the smoke test opens. None of them is a client's file.

| File | What it is |
|---|---|
| kitchen-equipment.dwg | A two-sheet kitchen equipment drawing made for CadCraft's tests (AutoCAD 2018 format) |
| base-plan.dxf | A small floor plan in DXF |
| house.ifc | BimCraft's showcase house (IFC4) |
| job.takeoff.json | A small TakeoffCraft takeoff |
| site.civilcraft.json | A CivilCraft site: a sample topographic survey with one pad |
| screw.partcraft.json | A PartCraft part: an ISO 4017 screw from the standard-part templates |

Apache-2.0, like the rest of the repo.
`);

// ---- the smoke test: the installed package's two programs, no dev dependencies
put('test/smoke.mjs', `#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * smoke.mjs — the package's own check (npm test). Starts the MCP server over stdio on a copy of fixtures/, the way an assistant
 * does, and calls one tool per kind of file; then runs the cadcraft command line. Exit 1 on any failure.
 *
 *   node test/smoke.mjs [--bin <folder with mcp/ and cli/>]     (default: this repo; CI also runs it on the installed package)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const bi = process.argv.indexOf('--bin');
const PKG = path.resolve(bi > 0 ? process.argv[bi + 1] : path.join(HERE, '..'));
const SERVER = path.join(PKG, 'mcp/server.mjs'), CLI = path.join(PKG, 'cli/cadcraft.mjs');
let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra === undefined ? '' : ' — ' + JSON.stringify(extra).slice(0, 400))); } };

const DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cadcraft-mcp-smoke-'));
fs.cpSync(path.join(HERE, '../fixtures'), DIR, { recursive: true });
fs.mkdirSync(path.join(DIR, 'out'));

// ---- MCP over stdio: one JSON-RPC message per line
const srv = spawn(process.execPath, [SERVER, '--root', DIR, '--allow', 'read,export', '--log', path.join(DIR, 'out/calls.jsonl')], { stdio: ['pipe', 'pipe', 'inherit'] });
const waiting = new Map();
let buf = '', nextId = 1;
srv.stdout.on('data', (d) => {
  buf += d;
  for (let i; (i = buf.indexOf('\\n')) >= 0;) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.id !== undefined && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
  }
});
const rpc = (method, params) => new Promise((res, rej) => {
  const id = nextId++;
  const t = setTimeout(() => rej(new Error(method + ': no answer in 120 s')), 120000);
  waiting.set(id, (m) => { clearTimeout(t); res(m); });
  srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\\n');
});
const call = async (name, a) => {
  const r = await rpc('tools/call', { name, arguments: a });
  const res = r.result || {};
  const text = (res.content || []).map((c) => c.text || '').join('');
  let data = res.structuredContent; if (!data) { try { data = JSON.parse(text); } catch { data = text; } }
  if (res.isError || r.error) throw new Error(name + ': ' + (text || JSON.stringify(r.error)));
  return data;
};
const step = async (label, fn) => { try { await fn(); } catch (e) { ok(false, label, String(e.message || e)); } };

const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } });
ok(init.result && init.result.serverInfo && init.result.protocolVersion, 'initialize', init);
srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\\n');
const list = await rpc('tools/list', {});
const names = (list.result && list.result.tools || []).map((t) => t.name);
ok(['drawing_open', 'ifc_open', 'site_open', 'part_open', 'takeoff_open'].every((n) => names.includes(n)), 'tools/list names a tool for each kind of file', names);

await step('a DWG drawing: describe and plot', async () => {
  const { doc } = await call('drawing_open', { path: 'kitchen-equipment.dwg' });
  const d = await call('drawing_describe', { doc });
  ok(Array.isArray(d.layers) && d.layers.length > 0, 'drawing_describe lists layers');
  await call('drawing_plot', { doc, out: 'out/kitchen.pdf' });
  ok(fs.readFileSync(path.join(DIR, 'out/kitchen.pdf')).subarray(0, 5).toString() === '%PDF-', 'drawing_plot writes a PDF');
});
await step('a DXF drawing opens', async () => { const { doc } = await call('drawing_open', { path: 'base-plan.dxf' }); ok(!!doc, 'drawing_open reads DXF'); });
await step('an IFC model: doors', async () => {
  const { doc } = await call('ifc_open', { path: 'house.ifc' });
  const q = await call('ifc_query', { doc, class: 'IfcDoor' });
  ok(JSON.stringify(q).includes('IfcDoor'), 'ifc_query finds doors');
});
await step('a CivilCraft site: cut and fill', async () => {
  const { doc } = await call('site_open', { path: 'site.civilcraft.json' });
  const v = await call('surface_volume', { doc });
  ok(v && typeof v === 'object' && /cut/i.test(JSON.stringify(v)), 'surface_volume answers cut and fill');
});
await step('a PartCraft part: mass', async () => {
  const { doc } = await call('part_open', { path: 'screw.partcraft.json' });
  const m = await call('mass_properties', { doc });
  ok(/volume/i.test(JSON.stringify(m)), 'mass_properties gives a volume');
});
await step('a takeoff: estimate', async () => {
  const { doc } = await call('takeoff_open', { path: 'job.takeoff.json' });
  const e = await call('takeoff_estimate', { doc });
  ok(e && typeof e === 'object', 'takeoff_estimate answers');
});
await step('refusals', async () => {
  const r = await rpc('tools/call', { name: 'drawing_open', arguments: { path: '../outside.dwg' } });
  ok(r.result && r.result.isError, 'a path outside --root is refused');
  const { doc } = await call('drawing_open', { path: 'base-plan.dxf' });
  const w = await rpc('tools/call', { name: 'command_run', arguments: { doc, input: 'ERASE ALL ' } });
  ok(w.result && w.result.isError, 'an edit without --allow edit is refused');
});
srv.stdin.end();
await new Promise((r) => srv.on('exit', r));
ok(fs.existsSync(path.join(DIR, 'out/calls.jsonl')) && fs.readFileSync(path.join(DIR, 'out/calls.jsonl'), 'utf8').trim().split('\\n').length >= 10, '--log keeps every call');

// ---- the command line
const cli = (...a) => spawnSync(process.execPath, [CLI, ...a], { cwd: DIR, encoding: 'utf8', timeout: 180000 });
let r = cli('info', 'kitchen-equipment.dwg', '--json');
ok(r.status === 0 && JSON.parse(r.stdout), 'cadcraft info --json', r.stderr);
r = cli('convert', 'kitchen-equipment.dwg', 'out/kitchen-2013.dwg', '--version', '2013');
ok(r.status === 0 && fs.existsSync(path.join(DIR, 'out/kitchen-2013.dwg')), 'cadcraft convert to DWG 2013', r.stderr);
r = cli('convert', 'site.civilcraft.json', 'out/site.xml');
ok(r.status === 0 && fs.readFileSync(path.join(DIR, 'out/site.xml'), 'utf8').includes('<LandXML'), 'cadcraft convert site → LandXML', r.stderr);
r = cli('convert', 'screw.partcraft.json', 'out/screw.stl');
ok(r.status === 0 && fs.statSync(path.join(DIR, 'out/screw.stl')).size > 84, 'cadcraft convert part → STL', r.stderr);
r = cli('convert', 'screw.partcraft.json', 'out/screw.usdz');
ok(r.status === 0 && fs.readFileSync(path.join(DIR, 'out/screw.usdz')).subarray(0, 2).toString() === 'PK', 'cadcraft convert part → USDZ', r.stderr);
r = cli('tools', '--json');
ok(r.status === 0 && JSON.parse(r.stdout), 'cadcraft tools --json', r.stderr);
r = cli('frobnicate');
ok(r.status === 2, 'a mistake in the command exits 2', r.status);

fs.rmSync(DIR, { recursive: true, force: true });
console.log(pass + ' passed, ' + fail + ' failed (Node ' + process.versions.node + ', ' + process.platform + ')');
process.exit(fail ? 1 : 0);
`);

// ---- GitHub workflows
put('.github/workflows/test.yml', `# The smoke test on every pull request and every change to main: the repo itself, then the packed package installed into an
# empty folder (what \`npx @getcadcraft/mcp\` gets). Linux, Windows and macOS, Node 20, 22 and 24.
name: Tests

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [20, 22, 24]
    runs-on: \${{ matrix.os }}
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
      - name: npm test (the repo)
        run: npm test
      - name: Installed from the packed tarball
        shell: bash
        run: |
          npm pack --pack-destination "$RUNNER_TEMP"
          mkdir "$RUNNER_TEMP/clean" && cd "$RUNNER_TEMP/clean"
          npm init -y > /dev/null
          npm install "$RUNNER_TEMP"/getcadcraft-mcp-*.tgz
          node "$GITHUB_WORKSPACE/test/smoke.mjs" --bin node_modules/@getcadcraft/mcp
`);
put('.github/workflows/publish.yml', `# Publishes to npm when a GitHub release is published (tag v<version> = package.json's version), with provenance: npm shows
# which commit and workflow built it. Needs the repo secret NPM_TOKEN (an automation token of the getcadcraft npm org).
name: Publish

on:
  release:
    types: [published]

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org
      - name: Tag matches the version
        run: test "v$(node -p "require('./package.json').version")" = "\${{ github.event.release.tag_name }}"
      - run: npm test
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`);
put('CONTRIBUTING.md', `# Contributing

Thank you for looking. A few things to know first.

- **The code here comes from the CadCraft apps.** \`cli/apps/\` holds each app's own modules, copied when the package is built; the
  tools themselves are in \`mcp/\` and \`cli/\`. A fix to how an app reads or writes a file belongs in that app's repo
  (github.com/getcadcraft/<app>); a fix to a tool, the server or the command line belongs here.
- **Pull requests run the Tests workflow** (\`npm test\` on Linux, Windows and macOS with Node 20, 22 and 24, then the same test on
  the packed package installed into an empty folder). Run \`npm test\` before you send one.
- **Rules every tool keeps:** no AI inside, nothing sent anywhere, files only in the folders given with \`--root\`, read only unless
  \`--allow\` says otherwise, every edit one undo step, every call in the log. A change that breaks one of these is not taken.
- **Test files** in \`fixtures/\` must be your own or openly licensed; never a client's drawing.
- Contributions are under Apache-2.0, the license of this repo.

Questions: open an issue, or the CadCraft Discord (https://getcadcraft.com).
`);
put('.gitignore', 'node_modules/\n*.tgz\n');

// ---- commit, tarball
if (args.includes('--commit')) {
  const git = (...a) => execFileSync('git', [...AUTHOR, ...a], { cwd: OUT, encoding: 'utf8' });
  // never pushed (no remote yet): start the history again, so the first push is one commit
  if (fs.existsSync(path.join(OUT, '.git')) && !git('remote').trim()) fs.rmSync(path.join(OUT, '.git'), { recursive: true, force: true });
  if (!fs.existsSync(path.join(OUT, '.git'))) git('init', '-q', '-b', 'main');
  git('add', '-A');
  if (git('status', '--porcelain').trim()) git('commit', '-q', '-m', 'CadCraft MCP server and command line ' + pkg.version, '--author', 'CadCraft <ddgconsultant@getcadcraft.com>');
  console.log('committed: ' + git('log', '-1', '--format=%h %an <%ae> %s').trim());
}
if (args.includes('--tgz')) console.log(execFileSync('npm', ['pack', '--pack-destination', path.dirname(OUT)], { cwd: OUT, encoding: 'utf8' }).trim().split('\n').pop());
console.log('repo ready in ' + OUT + ' (not pushed, not published)');
