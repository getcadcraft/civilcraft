#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * clean-machine.mjs — AS.8: the published package as a stranger gets it. Installs the packed tarball into an empty folder with
 * npm (nothing from this repo on the path), then checks the installed programs with clients we did not write: the official MCP
 * SDK client and the MCP inspector over stdio, the package's reference HTTP server (mcp/live-server.mjs) with check-server.mjs and
 * the SDK's Streamable HTTP client, the package's own smoke test, and every recipe replayed through the installed tools.
 *
 *   node tools/mcp/test/clean-machine.mjs [--tgz <file>] [--node <node binary>]…     (default tgz: tmp/public-repos/getcadcraft-mcp-<v>.tgz)
 *
 * Needs (cd tools/mcp/test && npm install) for the SDK and the inspector (test only). Each --node runs the smoke test and the
 * recipes once more with that Node (the SDK and inspector checks use this one).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const TEST_MODULES = path.join(ROOT, 'tools/mcp/test/node_modules');
const args = process.argv.slice(2);
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/mcp/package.json'), 'utf8')).version;
const ti = args.indexOf('--tgz');
const TGZ = path.resolve(ti >= 0 ? args[ti + 1] : path.join(ROOT, 'tmp/public-repos/getcadcraft-mcp-' + version + '.tgz'));
const NODES = [process.execPath, ...args.flatMap((a, i) => (a === '--node' ? [path.resolve(args[i + 1])] : []))];
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + String(typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 400) : '')); } };
if (!fs.existsSync(TGZ)) { console.error('No tarball at ' + TGZ + ': run node tools/mcp/repo.mjs --tgz first.'); process.exit(2); }

// ---- an empty folder, the tarball installed by npm
const CLEAN = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-mcp-clean-'));
execFileSync('npm', ['init', '-y'], { cwd: CLEAN, stdio: 'ignore' });
const inst = spawnSync('npm', ['install', '--no-audit', '--no-fund', TGZ], { cwd: CLEAN, encoding: 'utf8' });
ok(inst.status === 0, 'npm install ' + path.basename(TGZ) + ' into an empty folder', inst.stderr);
const PKG = path.join(CLEAN, 'node_modules/@getcadcraft/mcp');
const BIN = path.join(CLEAN, 'node_modules/.bin');
ok(fs.existsSync(path.join(BIN, 'cadcraft-mcp')) && fs.existsSync(path.join(BIN, 'cadcraft')), 'npm linked both programs (cadcraft-mcp, cadcraft)');
ok(spawnSync(path.join(BIN, 'cadcraft-mcp'), ['--version'], { encoding: 'utf8' }).stdout.trim() === version, 'cadcraft-mcp --version = ' + version);
ok(!fs.existsSync(path.join(PKG, 'test')) && !fs.existsSync(path.join(PKG, 'fixtures')) && !fs.existsSync(path.join(PKG, '.github')), 'the package carries no tests, fixtures or workflows');

// ---- files for the clients
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-mcp-clean-work-'));
const REPO_FIX = path.join(ROOT, 'tmp/public-repos/mcp/fixtures');
fs.cpSync(REPO_FIX, WORK, { recursive: true });

// ---- the package's own smoke test and the recipes, per Node
for (const node of NODES) {
  const v = spawnSync(node, ['--version'], { encoding: 'utf8' }).stdout.trim();
  const sm = spawnSync(node, [path.join(ROOT, 'tmp/public-repos/mcp/test/smoke.mjs'), '--bin', PKG], { encoding: 'utf8', timeout: 900000 });
  ok(sm.status === 0, 'smoke test on the installed package, Node ' + v + ': ' + (sm.stdout.trim().split('\n').pop() || ''), sm.stdout.slice(-600) + sm.stderr.slice(-300));
  const rc = spawnSync(node, [path.join(ROOT, 'tools/mcp/test/recipes.mjs'), '--package', PKG], { encoding: 'utf8', timeout: 900000 });
  ok(rc.status === 0, 'every recipe replayed through the installed tools, Node ' + v + ': ' + (rc.stdout.trim().split('\n').pop() || ''), rc.stdout.slice(-600));
}

// ---- the official SDK client and the inspector over stdio, against the installed server
if (!fs.existsSync(path.join(TEST_MODULES, '@modelcontextprotocol/sdk'))) ok(false, 'MCP SDK installed for the test', 'run (cd tools/mcp/test && npm install)');
else {
  const sdk = path.join(TEST_MODULES, '@modelcontextprotocol/sdk/dist/esm');
  const { Client } = await import(pathToFileURL(path.join(sdk, 'client/index.js')).href);
  const { StdioClientTransport } = await import(pathToFileURL(path.join(sdk, 'client/stdio.js')).href);
  const c = new Client({ name: 'clean-machine', version: '1.0.0' });
  await c.connect(new StdioClientTransport({ command: path.join(BIN, 'cadcraft-mcp'), args: ['--root', WORK, '--allow', 'read,export'], stderr: 'pipe' }));
  ok(c.getServerVersion().name === 'cadcraft' && c.getServerVersion().version === version, 'SDK client (stdio) connects to the installed cadcraft-mcp');
  ok(/CivilCraft sites, PartCraft parts/.test(c.getInstructions() || ''), 'the server tells the assistant every kind of file it opens');
  const names = (await c.listTools()).tools.map((t) => t.name);
  ok(['drawing_open', 'site_open', 'part_open', 'drawing_plot'].every((n) => names.includes(n)) && !names.includes('command_run'), 'SDK: read + export tools listed, no edit tools', names.length);
  let r = await c.callTool({ name: 'drawing_open', arguments: { path: 'kitchen-equipment.dwg' } });
  r = await c.callTool({ name: 'drawing_plot', arguments: { doc: r.structuredContent.doc, out: 'kitchen.svg' } });
  ok(!r.isError && fs.readFileSync(path.join(WORK, 'kitchen.svg'), 'utf8').includes('<svg'), 'SDK: drawing_plot to SVG', r.content && r.content[0] && r.content[0].text);
  r = await c.callTool({ name: 'part_open', arguments: { path: 'screw.partcraft.json' } });
  r = await c.callTool({ name: 'part_export', arguments: { doc: r.structuredContent.doc, out: 'screw.3mf' } });
  ok(!r.isError && fs.readFileSync(path.join(WORK, 'screw.3mf')).subarray(0, 2).toString() === 'PK', 'SDK: part_export to 3MF', r.content && r.content[0] && r.content[0].text);
  await c.close();

  const insp = path.join(TEST_MODULES, '.bin/mcp-inspector');
  if (!fs.existsSync(insp)) ok(false, 'MCP inspector installed for the test');
  else {
    const cfg = path.join(CLEAN, 'mcp.json');
    fs.writeFileSync(cfg, JSON.stringify({ mcpServers: { cadcraft: { command: path.join(BIN, 'cadcraft-mcp'), args: ['--root', WORK] } } }));
    const ip = spawnSync(insp, ['--cli', '--config', cfg, '--server', 'cadcraft', '--method', 'tools/list'], { encoding: 'utf8', timeout: 120000 });
    let tools = null;
    try { tools = JSON.parse(ip.stdout.slice(ip.stdout.indexOf('{'))).tools; } catch { /* below */ }
    ok(tools && tools.length > 10 && tools.every((t) => t.inputSchema), 'inspector --cli tools/list on the installed server (' + (tools ? tools.length : 0) + ' read tools)', (ip.stdout || ip.stderr).slice(0, 300));
    const ic = spawnSync(insp, ['--cli', '--config', cfg, '--server', 'cadcraft', '--method', 'tools/call', '--tool-name', 'site_open', '--tool-arg', 'path=site.civilcraft.json'], { encoding: 'utf8', timeout: 120000 });
    ok(/Sample site/.test(ic.stdout), 'inspector --cli tools/call site_open', (ic.stdout || ic.stderr).slice(0, 300));
  }

  // ---- the package's reference HTTP server (what Studio's local server is built to), with the installed tools behind it
  const { createLiveServer } = await import(pathToFileURL(path.join(PKG, 'mcp/live-server.mjs')).href);
  const { createDispatcher } = await import(pathToFileURL(path.join(PKG, 'mcp/core.mjs')).href);
  const { createEnv, headlessTools } = await import(pathToFileURL(path.join(PKG, 'cli/headless/tools.mjs')).href);
  const d = createDispatcher({ server: { name: 'cadcraft', title: 'CadCraft', version }, allowed: () => new Set(['read']) });
  for (const t of headlessTools(createEnv({ roots: [WORK], undoPrefix: 'Assistant: ' }))) d.tool(t);
  const srv = createLiveServer({ port: 0, forward: (m, s) => d.handle(m, s) });
  const { url, token } = await srv.start();
  const { checkServer } = await import(pathToFileURL(path.join(ROOT, 'tools/mcp/test/check-server.mjs')).href);
  const cs = await checkServer(url, token);
  ok(cs.fail === 0 && cs.pass >= 15, 'check-server.mjs on the installed reference HTTP server (' + cs.pass + ' checks)', cs.lines.join(' | '));
  const { StreamableHTTPClientTransport } = await import(pathToFileURL(path.join(sdk, 'client/streamableHttp.js')).href);
  const h = new Client({ name: 'clean-http', version: '1.0.0' });
  await h.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers: { Authorization: 'Bearer ' + token } } }));
  r = await h.callTool({ name: 'ifc_open', arguments: { path: 'house.ifc' } });
  ok(!r.isError && r.structuredContent.doc, 'SDK client over Streamable HTTP: ifc_open', r.content && r.content[0] && r.content[0].text);
  await h.close();
  await srv.close();
}

fs.rmSync(CLEAN, { recursive: true, force: true });
fs.rmSync(WORK, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
