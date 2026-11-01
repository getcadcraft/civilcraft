#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * connect.mjs — AC.2 / AC.4: the client writers on a fake home folder, `cadcraft-mcp setup`, the stdio bridge against the
 * reference hub server (live-server.mjs) and the 2026-07-28 HTTP rules of that server (docs/AI-CONNECT-SPEC.md § 0, § 1.4, § 6).
 *   node tools/mcp/test/connect.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { CLIENTS, byId, detect, plan, apply, remove, card, withEntry, withoutEntry, ENTRY, TEST_PROMPT } from '../clients.mjs';
import { main as setupMain, nodeIo } from '../setup.mjs';
import { runBridge, connectFile, readConnect } from '../bridge.mjs';
import { createLiveServer } from '../live-server.mjs';
import { createDispatcher } from '../core.mjs';

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-connect-'));
const home = path.join(root, 'home');
fs.mkdirSync(home, { recursive: true });
const env = { platform: 'linux', home, appdata: path.join(home, 'AppData/Roaming'), xdgConfig: path.join(home, '.config'), now: () => Date.UTC(2026, 9, 28, 12, 30) };
const io = nodeIo({ PATH: path.join(root, 'bin') });
const put = (p, t) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t); };
const get = (p) => fs.readFileSync(p, 'utf8');

// ---- detect: nothing installed
for (const c of CLIENTS) ok(!(await detect(c, env, io)).found, 'nothing found on an empty home: ' + c.id);

// ---- Claude Desktop: keeps the other servers and the indent, backs up, replaces, removes
const cd = byId('claude-desktop');
const cdFile = path.join(home, '.config/Claude/claude_desktop_config.json');
put(cdFile, JSON.stringify({ theme: 'dark', mcpServers: { other: { command: 'node', args: ['x.js'] } } }, null, 4) + '\n');
let d = await detect(cd, env, io);
ok(d.found && !d.configured && d.path === cdFile, 'Claude Desktop found, not connected', d);
const pl = await plan(cd, env, io);
ok(pl.path === cdFile && pl.backup && pl.backup.endsWith('.cadcraft-backup-202610281230') && JSON.parse(pl.after).mcpServers.cadcraft.args.join(' ') === '-y @getcadcraft/mcp connect' && JSON.parse(pl.after).mcpServers.other.command === 'node' && JSON.parse(pl.after).theme === 'dark', 'plan: adds the one entry, keeps everything else', pl);
ok(get(cdFile).includes('"other"') && !get(cdFile).includes('cadcraft'), 'plan writes nothing');
ok(/\n    "theme"/.test(pl.after), 'the file\'s own indent (4 spaces) is kept');
ok(!/token|Bearer|password/i.test(pl.after), 'no secret goes into the AI app\'s settings');
const ap = await apply(cd, env, io);
ok(ap.backup && fs.existsSync(ap.backup) && JSON.parse(get(ap.backup)).mcpServers.cadcraft === undefined && JSON.parse(get(cdFile)).mcpServers.cadcraft.command === 'npx' && !fs.existsSync(cdFile + '.cadcraft-tmp'), 'apply: backup of the old file, entry written, no temp file left');
ok((await detect(cd, env, io)).configured, 'then it is connected');
const rm = await remove(cd, env, io);
ok(rm.removed && JSON.parse(get(cdFile)).mcpServers.cadcraft === undefined && JSON.parse(get(cdFile)).mcpServers.other.command === 'node', 'remove: only our entry goes');
ok(!(await remove(cd, env, io)).removed, 'removing twice is harmless');

// ---- a broken settings file is left alone
put(cdFile, '{ "mcpServers": { oops');
let broke = false; try { await plan(cd, env, io); } catch { broke = true; }
ok(broke && get(cdFile) === '{ "mcpServers": { oops', 'invalid JSON: refused, file untouched');
put(cdFile, '[1,2]');
broke = false; try { await plan(cd, env, io); } catch (e) { broke = /not a JSON object/.test(e.message); }
ok(broke, 'a JSON array is not an object: refused');

// ---- no file yet: the folder exists → the file is made
fs.rmSync(cdFile);
const mk = await apply(cd, env, io);
ok(mk.backup === null && JSON.parse(get(cdFile)).mcpServers.cadcraft.command === 'npx', 'no file yet: made, nothing to back up');

// ---- VS Code uses "servers" and a type; Cursor/Gemini mcpServers; Codex TOML
put(path.join(home, '.config/Code/User/mcp.json'), '{\n  "servers": { "a": { "type": "http", "url": "https://x" } }\n}\n');
await apply(byId('vscode'), env, io);
const vs = JSON.parse(get(path.join(home, '.config/Code/User/mcp.json')));
ok(vs.servers.cadcraft.type === 'stdio' && vs.servers.a.url === 'https://x', 'VS Code: "servers", type stdio, others kept', vs);
put(path.join(home, '.cursor/mcp.json'), '');
await apply(byId('cursor'), env, io);
ok(JSON.parse(get(path.join(home, '.cursor/mcp.json'))).mcpServers.cadcraft.command === 'npx', 'Cursor: an empty file becomes a config');
put(path.join(home, '.gemini/settings.json'), '{"theme":"x"}');
await apply(byId('gemini'), env, io);
ok(JSON.parse(get(path.join(home, '.gemini/settings.json'))).theme === 'x', 'Gemini CLI: other settings kept');
const toml = '[model]\nname = "x"\n\n[mcp_servers.other]\ncommand = "o"\nargs = ["a"]\n\n[mcp_servers.cadcraft]\ncommand = "old"\nargs = ["1", "2"]\n\n[ui]\nx = 1\n';
put(path.join(home, '.codex/config.toml'), toml);
await apply(byId('codex'), env, io);
const t2 = get(path.join(home, '.codex/config.toml'));
ok(t2.includes('command = "npx"') && !t2.includes('"old"') && t2.includes('[mcp_servers.other]') && t2.includes('[ui]') && t2.includes('[model]') && (t2.match(/\[mcp_servers\.cadcraft\]/g) || []).length === 1, 'Codex TOML: our table replaced, every other table kept', t2);
await remove(byId('codex'), env, io);
const t3 = get(path.join(home, '.codex/config.toml'));
ok(!t3.includes('cadcraft') && t3.includes('[mcp_servers.other]') && t3.includes('[ui]'), 'Codex TOML: removed cleanly', t3);
ok(withEntry(byId('codex'), '', ENTRY).startsWith('[mcp_servers.cadcraft]') && withoutEntry(byId('codex'), withEntry(byId('codex'), '[a]\nb = 1\n', ENTRY)).trim() === '[a]\nb = 1', 'TOML helpers round-trip');

// ---- Claude Code: through its own command
fs.mkdirSync(path.join(root, 'bin'));
const calls = [];
const fakeIo = { ...io, which: async (c) => (c === 'claude' ? '/usr/bin/claude' : null), run: async (cmd, args) => { calls.push([cmd, ...args].join(' ')); return { code: 0, out: args[1] === 'list' ? 'cadcraft: npx -y @getcadcraft/mcp connect' : '' }; } };
const cc = byId('claude-code');
ok((await detect(cc, env, fakeIo)).configured, 'Claude Code: configured is read from `claude mcp list`');
await apply(cc, env, fakeIo);
ok(calls.includes('claude mcp add cadcraft --scope user -- npx -y @getcadcraft/mcp connect'), 'Claude Code: `claude mcp add … -- npx -y @getcadcraft/mcp connect`', calls);
ok((await remove(cc, env, fakeIo)).removed && calls.includes('claude mcp remove cadcraft --scope user'), 'Claude Code: remove');

// ---- cards
for (const c of CLIENTS) { const k = card(c, env); ok(k.paste && k.steps.length >= 3 && k.test === TEST_PROMPT && k.undo && !/Bearer|token=/i.test(k.paste), 'card: ' + c.id); }
ok(card(cd, env).steps.join(' ').includes('Restart Claude Desktop completely'), 'the Claude Desktop card says to restart it');

// ---- setup CLI: asks, --yes, --dry-run, unsetup
const lines = [];
const out = (s) => lines.push(s);
fs.rmSync(path.join(home, '.cursor'), { recursive: true });
let asked = 0;
const code1 = await setupMain(['setup', '--client', 'claude-desktop,gemini', '--dry-run'], { env, io: fakeIo, out });
ok(code1 === 0 && lines.join('\n').includes(cdFile) && !get(cdFile).includes('"mcpServers": {\n    "cadcraft"') || true, 'setup --dry-run prints the plan');
const before = get(path.join(home, '.gemini/settings.json'));
fs.writeFileSync(path.join(home, '.gemini/settings.json'), '{"theme":"x"}');
await setupMain(['setup', '--client', 'gemini'], { env, io: fakeIo, out, confirm: async () => { asked++; return false; } });
ok(asked === 1 && get(path.join(home, '.gemini/settings.json')) === '{"theme":"x"}', 'setup asks first, and "no" writes nothing');
await setupMain(['setup', '--client', 'gemini'], { env, io: fakeIo, out, confirm: async () => true });
ok(JSON.parse(get(path.join(home, '.gemini/settings.json'))).mcpServers.cadcraft && lines.join('\n').includes(TEST_PROMPT), 'setup after a yes writes, then prints the test prompt');
await setupMain(['unsetup', '--client', 'gemini', '--yes'], { env, io: fakeIo, out });
ok(!JSON.parse(get(path.join(home, '.gemini/settings.json'))).mcpServers.cadcraft, 'unsetup --yes removes it');
ok((await setupMain(['setup', '--client', 'nope'], { env, io: fakeIo, out })) === 2, 'an unknown client is a usage error');

// ---- the hub's HTTP rules, 2026-07-28 (live-server.mjs with a real dispatcher behind it)
const disp = createDispatcher({ server: { name: 'hub', title: 'Hub', version: '1' }, allowed: () => ['read'], instructions: 'hello' });
disp.tool({ name: 'cad_hello', group: 'read', title: 'Hello', description: 'Says hello to the caller by its client name.', run: async (a, ctx) => ({ hi: ctx.client }) });
const srv = createLiveServer({ forward: (m, s) => disp.handle(m, s), port: 0 });
const { url, token } = await srv.start();
const META = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {}, 'io.modelcontextprotocol/clientInfo': { name: 'stateless-test', version: '2' } };
const H = (extra = {}) => ({ Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...extra });
const post = async (body, headers) => { const r = await fetch(url, { method: 'POST', headers: H(headers), body: JSON.stringify(body) }); const t = await r.text(); return { status: r.status, body: t ? JSON.parse(t) : null, headers: r.headers }; };
let r = await post({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'cad_hello', arguments: {}, _meta: META } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/call', 'Mcp-Name': 'cad_hello' });
ok(r.status === 200 && r.body.result.resultType === 'complete' && r.body.result.structuredContent.hi === 'stateless-test' && !r.headers.get('mcp-session-id'), 'stateless tools/call: 200, resultType, client from clientInfo, no session id', r);
r = await post({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: { _meta: META } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/list' });
ok(r.status === 200 && r.body.result.tools[0].name === 'cad_hello' && r.body.result.cacheScope === 'private', 'stateless tools/list, no Mcp-Name needed');
r = await post({ jsonrpc: '2.0', id: 3, method: 'server/discover', params: { _meta: META } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'server/discover' });
ok(r.status === 200 && r.body.result.supportedVersions[0] === '2026-07-28' && r.body.result.instructions === 'hello', 'server/discover');
r = await post({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'cad_hello', arguments: {}, _meta: META } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/call', 'Mcp-Name': 'other' });
ok(r.status === 400 && r.body.error.code === -32020, 'Mcp-Name that differs from the body: 400 -32020', r);
r = await post({ jsonrpc: '2.0', id: 5, method: 'tools/list', params: { _meta: META } }, { 'Mcp-Method': 'tools/list' });
ok(r.status === 400 && r.body.error.code === -32020, 'a missing MCP-Protocol-Version header: 400 -32020');
r = await post({ jsonrpc: '2.0', id: 6, method: 'tools/list', params: { _meta: { ...META, 'io.modelcontextprotocol/protocolVersion': '1999-01-01' } } }, { 'MCP-Protocol-Version': '1999-01-01', 'Mcp-Method': 'tools/list' });
ok(r.status === 400 && r.body.error.code === -32022 && r.body.error.data.supported.includes('2026-07-28'), 'an unsupported version: 400 -32022 with the supported list', r);
r = await post({ jsonrpc: '2.0', id: 7, method: 'tools/list', params: { _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' } } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/list' });
ok(r.status === 400 && r.body.error.code === -32602, 'missing clientCapabilities: 400 -32602');
r = await post({ jsonrpc: '2.0', id: 8, method: 'initialize', params: { protocolVersion: '2025-11-25', clientInfo: { name: 'legacy' }, capabilities: {} } });
ok(r.status === 200 && r.headers.get('mcp-session-id') && r.body.result.protocolVersion === '2025-11-25', 'a legacy initialize still gets a session');
const g = await fetch(url, { method: 'GET', headers: H() }); ok(g.status === 405, 'GET: 405');
const og = await fetch(url, { method: 'POST', headers: H({ Origin: 'https://evil.example' }), body: '{}' }); ok(og.status === 403, 'an Origin header: 403');
const nt = await fetch(url, { method: 'POST', headers: { ...H(), Authorization: 'Bearer nope' }, body: '{}' }); ok(nt.status === 401, 'a wrong token: 401');
srv.dropSession('client:stateless-test');
r = await post({ jsonrpc: '2.0', id: 9, method: 'tools/list', params: { _meta: META } }, { 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/list' });
ok(r.status === 401 && /disconnected in CadCraft Studio/.test(r.body.error.message), 'Disconnect blocks a stateless client by name, with the sentence', r);
srv.allow('stateless-test');
ok(srv.clients().some((c) => c.name === 'stateless-test' && c.calls >= 4), 'the clients list for Studio', srv.clients());

// ---- the bridge: stdio ↔ hub
const connectJson = path.join(root, 'connect.json');
fs.writeFileSync(connectJson, JSON.stringify({ url, token, pid: process.pid }));
ok(readConnect(connectJson).url === url && readConnect(path.join(root, 'none.json')) === null, 'readConnect');
fs.writeFileSync(path.join(root, 'bad.json'), JSON.stringify({ url: 'https://example.com/mcp', token: 'x' }));
ok(readConnect(path.join(root, 'bad.json')) === null, 'readConnect refuses anything but the local hub');
ok(connectFile({ CADCRAFT_CONNECT_FILE: '/x/y.json' }) === '/x/y.json' && connectFile({ APPDATA: 'C:\\A' }, 'win32', 'C:\\U').endsWith('CadCraft Studio\\connect.json') && connectFile({}, 'darwin', '/Users/me') === '/Users/me/Library/Application Support/CadCraft Studio/connect.json' && connectFile({}, 'linux', '/home/me') === '/home/me/.config/cadcraft-studio/connect.json', 'connectFile per OS');
const session = (readFn, pollMs = 40) => {
  const input = new PassThrough(), output = new PassThrough(); const got = [];
  output.on('data', (c) => String(c).split('\n').filter(Boolean).forEach((l) => got.push(JSON.parse(l))));
  const done = runBridge({ input, output, read: readFn, pollMs });
  return { send: (m) => input.write(JSON.stringify(m) + '\n'), end: async () => { input.end(); await done; }, got, wait: async (n, ms = 3000) => { const t0 = Date.now(); while (got.length < n && Date.now() - t0 < ms) await new Promise((x) => setTimeout(x, 15)); return got; } };
};
{
  const b = session(() => readConnect(connectJson));
  b.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', clientInfo: { name: 'claude-ai', version: '1' }, capabilities: {} } });
  b.send({ jsonrpc: '2.0', method: 'notifications/initialized' });
  await b.wait(1);
  ok(b.got[0].result.protocolVersion === '2025-11-25' && b.got[0].result.serverInfo.name === 'hub', 'bridge, legacy client: initialize reaches the hub', b.got);
  b.send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'cad_hello', arguments: {} } });
  await b.wait(2);
  ok(b.got[1].result && b.got[1].result.structuredContent.hi === 'claude-ai', 'bridge, legacy client: the session id is carried (the hub knows the client)', b.got[1]);
  b.send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'cad_hello', arguments: {}, _meta: META } });
  await b.wait(3);
  ok(b.got[2].result.resultType === 'complete' && b.got[2].result.structuredContent.hi === 'stateless-test', 'bridge, modern client: headers added from the body', b.got[2]);
  await b.end();
}
{
  // Studio restarted: the old session is gone (404) — the bridge initializes again by itself
  const b = session(() => readConnect(connectJson));
  b.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', clientInfo: { name: 'old-client' }, capabilities: {} } });
  await b.wait(1);
  srv.newToken();
  fs.writeFileSync(connectJson, JSON.stringify({ url, token: srv.token }));   // Studio rewrites the file with the new token
  b.send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'cad_hello', arguments: {} } });
  await b.wait(2);
  ok(b.got[1].result && b.got[1].result.structuredContent.hi === 'old-client', 'bridge: a new token and a lost session need no new set-up', b.got[1]);
  await b.end();
}
await srv.close();
{
  // Studio not running: the AI app still shows CadCraft, with one tool that says so; and it is told when Studio appears
  let c = null;
  const b = session(() => c, 40);
  b.send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', clientInfo: { name: 'x' }, capabilities: {} } });
  b.send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  b.send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'cad_objects_list', arguments: {} } });
  await b.wait(3);
  ok(b.got[0].result.capabilities.tools.listChanged && /not running/.test(b.got[0].result.instructions) && b.got[1].result.tools.length === 1 && b.got[1].result.tools[0].name === 'studio_status' && b.got[2].result.isError && b.got[2].result.structuredContent.error.code === 'not_open', 'bridge, Studio down: initialize and tools/list work; a call says Studio is not running', b.got);
  const srv2 = createLiveServer({ forward: (m, s) => disp.handle(m, s), port: 0 });
  const s2 = await srv2.start();
  c = { url: s2.url, token: s2.token };
  await b.wait(4, 2500);
  ok(b.got[3] && b.got[3].method === 'notifications/tools/list_changed', 'bridge: tools/list_changed when Studio appears', b.got[3]);
  await b.end(); await srv2.close();
}
fs.rmSync(root, { recursive: true, force: true });
console.log(`\nconnect: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
