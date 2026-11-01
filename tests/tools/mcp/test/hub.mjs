#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * hub.mjs — the hub as an AI app sees it (docs/AI-CONNECT-SPEC.md § 1): three app windows behind host.control, Studio's relay, the
 * reference HTTP server. One address, every enabled app's tools with their app prefix, the same list for every client, a call routed
 * to its app, an app that closed, the 0.7 unprefixed names, Disconnect by name. Needs studio/hub/channel.js (skipped without it).
 *   node tools/mcp/test/hub.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CHANNEL_JS = process.env.CADCRAFT_STUDIO ? path.join(process.env.CADCRAFT_STUDIO, 'hub/channel.js') : '/var/www/CADCRAFT/studio/hub/channel.js';
if (!fs.existsSync(CHANNEL_JS)) { console.log('hub: skipped (no ' + CHANNEL_JS + ')'); process.exit(0); }
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m, x === undefined ? '' : JSON.stringify(x).slice(0, 500)); } };
const { openChannel } = await import(pathToFileURL(CHANNEL_JS).href);
const H = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/js/host.js')).href);
const { createLiveServer } = await import(pathToFileURL(path.join(ROOT, 'tools/mcp/live-server.mjs')).href);

const obj = (p = {}, req = []) => ({ type: 'object', properties: p, required: req, additionalProperties: false });
const makeWindow = (app, id, tools, groups = ['read', 'edit'], document = null) => {
  const ch = openChannel({ app, id, storage: null });
  const host = H.createHost({ app, window: null, document: null, indexedDB: null, desktop: null });
  for (const t of tools) host.control.tool(t);
  host.control.configure({ enabled: true, groups, title: app, channel: ch, document: () => document, rollback: H.stackRollback(() => doc) });
  return { ch, host };
};
const doc = { items: [], undoStack: [], redoStack: [], undo() { const s = this.undoStack.pop(); if (!s) return null; this.items.pop(); this.redoStack.push(s); return s; } };
const add = (label) => ({ name: 'item_add', group: 'edit', rollbackPreview: true, title: 'Add an item', description: 'Add an item to the toy document as one undo step.', inputSchema: obj({ label: { type: 'string', maxLength: 20, description: 'Name.' } }, ['label']),
  run: async (a) => { doc.items.push(a.label); doc.undoStack.push(a.label); return { n: doc.items.length, undo: 'Assistant: add ' + a.label }; } });
const cadWin = makeWindow('cadcraft', 'cadcraft-1', [
  { name: 'objects_list', group: 'read', title: 'List objects', description: 'Objects of the toy drawing, from the file.', untrusted: true, run: async () => ({ objects: doc.items.slice() }) },
  add('a'),
  { name: 'takeoff_quantities', group: 'read', title: 'Q', description: 'A tool whose name already starts with the other key.', run: async () => ({ q: 1 }) },
], ['read', 'edit'], 'plan a.dwg');
const markWin = makeWindow('markupcraft', 'markupcraft-1', [
  { name: 'markups_list', group: 'read', title: 'List markups', description: 'Markups of the toy PDF, from the file.', untrusted: true, run: async () => ({ markups: [] }) },
  { name: 'objects_list', group: 'read', title: 'List objects', description: 'A tool with the same local name as CadCraft\'s, to prove the prefix tells them apart.', run: async () => ({ app: 'markup' }) },
], ['read'], 'set.pdf');
const bimWin = makeWindow('bimcraft', 'bimcraft-1', [{ name: 'walls_list', group: 'read', title: 'List walls', description: 'Walls of the toy model.', run: async () => ({ walls: [] }) }], ['read'], null);
bimWin.host.control.configure({ enabled: false });   // open, but it does not take assistants

const hubCh = openChannel({ app: 'studio', id: 'studio-hub', storage: null });
let srv;
const relay = H.createControlRelay({ channel: hubCh, onDisconnect: (sid) => srv && srv.dropSession(sid), openApp: async (app) => { opened.push(app); } });
const opened = [];
srv = createLiveServer({ port: 0, forward: (m, s) => relay.handle(m, s) });
const { url, token } = await srv.start();
await new Promise((r) => setTimeout(r, 200));

const META = (name) => ({ 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {}, 'io.modelcontextprotocol/clientInfo': { name, version: '1' } });
let n = 100;
const rpc = async (name, method, params = {}) => {
  const body = { jsonrpc: '2.0', id: ++n, method, params: { ...params, _meta: META(name) } };
  const h = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json', 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': method };
  if (method === 'tools/call') h['Mcp-Name'] = params.name;
  const r = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(body) });
  return { status: r.status, body: await r.json() };
};
const names = (r) => r.body.result.tools.map((t) => t.name);

let r = await rpc('claude-desktop', 'tools/list');
const want = ['cad_item_add', 'cad_objects_list', 'markup_markups_list', 'markup_objects_list', 'studio_apps_list', 'studio_windows_list', 'cad_takeoff_quantities', 'studio_apps_open'].sort();
ok(r.status === 200 && r.body.result.resultType === 'complete' && JSON.stringify(names(r)) === JSON.stringify(want), 'one list: every enabled app\'s tools, app-prefixed (takeoff_ not doubled), sorted; the app that takes no assistants is absent', names(r));
ok(!names(r).includes('bim_walls_list') && names(r).includes('studio_apps_open'), 'studio_apps_open is offered when Studio can open apps (openApp given)', names(r));
const t1 = JSON.stringify(names(await rpc('cursor', 'tools/list'))), t2 = JSON.stringify(names(await rpc('claude-desktop', 'tools/list')));
ok(t1 === t2, 'the same list for every client (it does not follow a focused window)');
const addTool = r.body.result.tools.find((t) => t.name === 'cad_item_add');
ok(addTool.inputSchema.properties.preview && addTool.inputSchema.properties.window && addTool.description.includes('(Permission: edit.)'), 'edit tools list preview and window', addTool.inputSchema.properties);

r = await rpc('claude-desktop', 'tools/call', { name: 'cad_objects_list', arguments: {} });
ok(r.body.result.structuredContent.objects && r.body.result.content.length === 2 && r.body.result._meta['com.getcadcraft/untrusted'] === true && r.body.result.resultType === 'complete', 'cad_objects_list reaches CadCraft, marked as file data', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'markup_objects_list', arguments: {} });
ok(r.body.result.structuredContent.app === 'markup', 'markup_objects_list reaches MarkupCraft, not CadCraft (same local name)', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'cad_item_add', arguments: { label: 'x', preview: true } });
ok(r.body.result.structuredContent.preview === true && r.body.result.structuredContent.would.n === 1 && doc.items.length === 0, 'a preview through the hub changes nothing', r.body.result.structuredContent);
r = await rpc('claude-desktop', 'tools/call', { name: 'cad_item_add', arguments: { label: 'x' } });
ok(r.body.result.structuredContent.undo === 'Assistant: add x' && doc.items.length === 1, 'the real call applies, one undo step labelled');
r = await rpc('claude-desktop', 'tools/call', { name: 'cad_objects_list', arguments: { window: 'markupcraft' } });
ok(r.body.result.isError && r.body.result.structuredContent.error.code === 'invalid_argument', 'a window of another app is refused with a reason', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'cad_takeoff_quantities', arguments: {} });
ok(r.body.result.structuredContent.q === 1, 'a name that already starts with the key is not doubled');
r = await rpc('claude-desktop', 'tools/call', { name: 'markups_list', arguments: {} });
ok(r.body.result.structuredContent.markups, 'the 0.7 unprefixed name still works when exactly one app has it');
r = await rpc('claude-desktop', 'tools/call', { name: 'objects_list', arguments: {} });
ok(r.body.result.isError && /Use the name with its app/.test(r.body.result.content[0].text), 'an unprefixed name that two apps have says which to use', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'windows_list', arguments: {} });
ok(r.body.result.structuredContent.windows.length === 3 && r.body.result.structuredContent.windows.find((w) => w.app === 'cadcraft').window === 'cadcraft:plan a.dwg', 'windows_list (0.7) = studio_windows_list, with stable window ids', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'studio_apps_list', arguments: {} });
const apps = r.body.result.structuredContent.apps;
ok(apps.length === 8 && apps.find((a) => a.app === 'cadcraft').assistants && apps.find((a) => a.app === 'bimcraft').open && !apps.find((a) => a.app === 'bimcraft').assistants && !apps.find((a) => a.app === 'partcraft').open && apps.find((a) => a.app === 'cadcraft').allowed.includes('edit'), 'studio_apps_list: eight apps, open / takes assistants / allowed', apps);
r = await rpc('claude-desktop', 'tools/call', { name: 'nonsense_tool', arguments: {} });
ok(r.status === 400 || r.body.error, 'an unknown tool is a protocol error (-32602)', r.body);

// an app that closes keeps its tools listed; a call says it is not open
markWin.ch.close();
await new Promise((x) => setTimeout(x, 150));
r = await rpc('claude-desktop', 'tools/list');
ok(names(r).includes('markup_markups_list'), 'a closed app\'s tools stay listed (the list does not change under a client)', names(r));
r = await rpc('claude-desktop', 'tools/call', { name: 'markup_markups_list', arguments: {} });
ok(r.body.result.isError && r.body.result.structuredContent.error.code === 'not_open' && r.body.result.structuredContent.error.retry === 'after_change' && /studio_apps_open/.test(r.body.result.content[0].text), 'a call to a closed app: not_open, with what to do', r.body.result);
r = await rpc('claude-desktop', 'tools/call', { name: 'studio_apps_open', arguments: { app: 'markupcraft' } });
ok(r.body.result.structuredContent.opened && opened[0] === 'markupcraft', 'studio_apps_open asks Studio to open the app');

// who is connected, and Disconnect by name
const cl = relay.clients();
ok(cl.some((c) => c.name === 'claude-desktop' && c.calls >= 5) && cl.some((c) => c.name === 'cursor'), 'the relay lists who connected', cl);
relay.block('cursor');
r = await rpc('cursor', 'tools/list');
ok(r.body.error && /cursor was disconnected in CadCraft Studio/.test(r.body.error.message), 'Disconnect: that AI app is answered with a sentence', r.body);
ok((await rpc('claude-desktop', 'tools/list')).status === 200, 'the others are untouched');
relay.allow('cursor');
ok((await rpc('cursor', 'tools/list')).status === 200, 'Connect again');

// a legacy client (initialize, a session) sees the same list
const ini = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'legacy-app', version: '9' } } }) });
const sid = ini.headers.get('mcp-session-id');
const ll = await (await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/json', 'Mcp-Session-Id': sid }, body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }) })).json();
ok(JSON.stringify(ll.result.tools.map((t) => t.name)) === JSON.stringify(want) && ll.result.resultType === undefined, 'a legacy client (initialize + session) gets the same tools, in the legacy shape', ll.result.tools.map((t) => t.name));
ok(relay.clients().some((c) => c.name === 'legacy-app'), 'and is listed by the name its initialize gave');

await srv.close();
relay.close();
console.log(`\nhub: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
