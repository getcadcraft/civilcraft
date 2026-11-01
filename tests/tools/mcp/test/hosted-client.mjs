#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * hosted-client.mjs test — Studio's side of the hosted connector (AC.3; docs/AI-CONNECT-HOSTED-SPEC.md § 6, threats T5, T6, T8, T10, T12).
 * A real local hub (tools/mcp/live-server.mjs) with a stand-in forward, the real hosted client in front of it, frames written by hand
 * (including frames from a relay that lies upward).
 *
 *   node tools/mcp/test/hosted-client.mjs
 */
import { createLiveServer } from '../live-server.mjs';
import { createHostedClient, effectiveLevels, expandLevels, makeScrubber, groupOfTool, RESULT_MAX } from '../hosted-client.mjs';

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const sec = (s) => console.log('\n== ' + s);

// ------------------------------------------------------------------ levels
sec('Levels: relay ∩ cap, Edit ⊃ Suggest ⊃ Read, save/export only with a yes');
ok(JSON.stringify(expandLevels(['edit'])) === '["read","suggest","edit"]', 'edit brings suggest and read');
ok(JSON.stringify(expandLevels(['save'])) === '["read","save"]', 'save brings read, not edit');
ok(JSON.stringify(expandLevels(['banana', 7, null])) === '[]' && expandLevels('read').length === 0 && expandLevels(undefined).length === 0, 'junk gives nothing');
const cap = (levels, extra = {}) => ({ on: true, levels, askForSaveExport: true, ...extra });
ok(JSON.stringify(effectiveLevels(['read', 'suggest', 'edit', 'save', 'export'], cap(['read', 'suggest']))) === '["read","suggest"]', 'a relay that says everything is cut to the cap (read, suggest)');
ok(JSON.stringify(effectiveLevels(['read'], cap(['read', 'suggest', 'edit']))) === '["read"]', 'a token with less than the cap keeps less');
ok(effectiveLevels(['read', 'save'], { on: false, levels: ['read', 'save'] }).length === 0, 'cap off: nothing');
ok(effectiveLevels(['read', 'save'], null).length === 0 && effectiveLevels(null, cap(['read'])).length === 0, 'no cap or no levels: nothing');
ok(JSON.stringify(effectiveLevels(['read', 'save', 'export'], cap(['read', 'save', 'export']))) === '["read"]', 'save and export need a yes first');
ok(JSON.stringify(effectiveLevels(['read', 'save', 'export'], cap(['read', 'save', 'export']), new Set(['save']))) === '["read","save"]', 'a yes for save does not give export');
ok(JSON.stringify(effectiveLevels(['read', 'save'], cap(['read', 'save'], { askForSaveExport: false }))) === '["read","save"]', 'with asking switched off, the cap alone decides');

// ------------------------------------------------------------------ scrubber
sec('Absolute paths never leave (T8)');
const roots = ['C:\\Drawings', 'C:\\Drawings\\Client A', '/home/ann/Models'];
const sc = makeScrubber(roots, 'C:\\Users\\Ann');
ok(sc.str('Opened C:\\Drawings\\Client A\\plan.dwg ok') === 'Opened <Client A>/plan.dwg ok', 'the most specific granted folder wins', sc.str('Opened C:\\Drawings\\Client A\\plan.dwg ok'));
ok(sc.str('C:/Drawings/b/c.dxf') === '<Drawings>/b/c.dxf', 'forward slashes too');
ok(sc.str('"C:\\\\Drawings\\\\x.dwg"') === '"<Drawings>/x.dwg"', 'a path inside JSON text (escaped backslashes)', sc.str('"C:\\\\Drawings\\\\x.dwg"'));
ok(sc.str('c:\\drawings\\y.dwg') === '<Drawings>/y.dwg', 'case-insensitive on drive and folder');
ok(sc.str('/home/ann/Models/house.ifc') === '<Models>/house.ifc', 'a granted POSIX folder');
ok(sc.str('C:\\Users\\Ann\\Desktop\\a.dwg') === '~/Desktop/a.dwg' || sc.str('C:\\Users\\Ann\\Desktop\\a.dwg') === '~\\Desktop\\a.dwg' || sc.str('C:\\Users\\Ann\\Desktop\\a.dwg').startsWith('~'), 'the home folder becomes ~', sc.str('C:\\Users\\Ann\\Desktop\\a.dwg'));
ok(sc.str('D:\\Secret\\x.dwg') === '<path removed>', 'another drive: removed');
ok(sc.str('see /etc/passwd now') === 'see <path removed> now' && sc.str('/var/log/x') === '<path removed>' && sc.str('/Users/bob/x') === '<path removed>', 'other absolute POSIX paths: removed');
ok(sc.str('https://example.com/home/x/y') === 'https://example.com/home/x/y' && sc.str('http://localhost:3000/tmp/z') === 'http://localhost:3000/tmp/z', 'web addresses are not touched');
ok(sc.str('Layer WALLS has 12 objects; scale 1:50') === 'Layer WALLS has 12 objects; scale 1:50' && sc.str('a/b relative/path.dwg') === 'a/b relative/path.dwg', 'ordinary text and relative paths are not touched');
ok(sc.str('C:\\Drawings') === '<Drawings>' && sc.str('C:\\DrawingsOther\\x') === '<path removed>', 'a folder matches only on a boundary (Drawings vs DrawingsOther)');
const o = sc.deep({ a: ['C:\\Drawings\\q.dwg', { b: '/home/ann/Models/m.ifc', n: 5, t: true, z: null }], 'C:\\Drawings\\key': 1 });
ok(o.a[0] === '<Drawings>/q.dwg' && o.a[1].b === '<Models>/m.ifc' && o.a[1].n === 5 && o.a[1].t === true && o.a[1].z === null, 'nested values are scrubbed, numbers and booleans are not');
ok(JSON.stringify(sc.deep(null)) === 'null' && sc.deep(7) === 7, 'null and numbers pass');
const deepObj = {}; let cur = deepObj; for (let i = 0; i < 100; i++) { cur.x = {}; cur = cur.x; } cur.p = 'C:\\Drawings\\z';
ok(typeof sc.deep(deepObj) === 'object', 'a 100-deep object does not crash it');
ok(makeScrubber([], '').str('C:\\Foo\\bar') === '<path removed>', 'with no folders and no home it still removes absolute paths');
ok(makeScrubber(['/'], '/').str('abc') === 'abc', 'a root of "/" is ignored (too short to be a folder)');

// ------------------------------------------------------------------ hub + client
const TOOLS = [
  { name: 'cad_objects_list', title: 'List objects', description: 'Lists objects. (Permission: read.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true } },
  { name: 'cad_command_run', title: 'Run command', description: 'Runs a command. (Permission: edit.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
  { name: 'cad_file_save', title: 'Save', description: 'Saves. (Permission: save.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true } },
  { name: 'cad_export_pdf', title: 'Export PDF', description: 'Exports. (Permission: export.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true } },
  { name: 'cad_big', title: 'Big', description: 'Returns a lot. (Permission: read.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: true } },
  { name: 'cad_nogroup', title: 'No group', description: 'A tool that does not say.', inputSchema: { type: 'object', properties: {} } },
  { name: 'studio_windows_list', title: 'Windows', description: 'Lists windows. (Permission: read.)', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: true } },
];
const hubSeen = [];
let hubDown = false;
const hubSrv = createLiveServer({
  port: 0,
  forward: async (msg, session) => {
    hubSeen.push({ method: msg.method, name: msg.params && msg.params.name, client: session.client && session.client.name, args: msg.params && msg.params.arguments });
    if (msg.method === 'tools/list') return { jsonrpc: '2.0', id: msg.id, result: { resultType: 'complete', tools: TOOLS, ttlMs: 1000, cacheScope: 'private' } };
    if (msg.method === 'tools/call') {
      const n = msg.params.name;
      if (n === 'cad_big') return { jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: 'x'.repeat(RESULT_MAX + 10) }] } };
      if (n === 'cad_objects_list') return { jsonrpc: '2.0', id: msg.id, result: { resultType: 'complete', content: [{ type: 'text', text: JSON.stringify({ file: 'C:\\Drawings\\Client A\\plan.dwg', other: 'D:\\Private\\x.dwg', layers: ['WALLS'] }) }], structuredContent: { file: 'C:\\Drawings\\Client A\\plan.dwg' } } };
      return { jsonrpc: '2.0', id: msg.id, result: { content: [{ type: 'text', text: n + ' done' }], structuredContent: { ok: true } } };
    }
    return { jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'no' } };
  },
});
const { url, token } = await hubSrv.start();
const confirms = [];
let confirmAnswer = false;
const state = { cap: cap(['read', 'suggest']), roots: ['C:\\Drawings'] };
const hc = createHostedClient({
  site: 'http://127.0.0.1:1', deviceToken: () => 'x', hub: () => (hubDown ? null : { url, token }), cap: () => state.cap, roots: () => state.roots, home: 'C:\\Users\\Ann',
  confirm: async (q) => { confirms.push(q); return confirmAnswer; },
});
let n = 0;
const req = (msg, levels, client = 'ctest', id) => hc.handleReq({ id: id || 'r' + ++n, client: { name: client }, levels, msg });
const modern = { _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' } };
const call = (name, args = {}, extra = {}) => ({ jsonrpc: '2.0', id: ++n, method: 'tools/call', params: { name, arguments: args, ...extra } });
const err = (a) => a && a.result && a.result.structuredContent && a.result.structuredContent.error;

sec('tools/list is cut to what the cap and the token allow');
let a = await req({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: modern }, ['read', 'suggest', 'edit', 'save', 'export']);
let names = a.result.tools.map((t) => t.name);
ok(names.includes('cad_objects_list') && names.includes('cad_command_run') && names.includes('studio_windows_list'), 'read and edit tools are listed (suggest is in the cap, so edit tools can be diverted)');
ok(!names.includes('cad_file_save') && !names.includes('cad_export_pdf'), 'save and export tools are NOT listed under a read+suggest cap, even when the relay says everything');
ok(!names.includes('cad_nogroup') === true, 'a tool with no declared group is not listed (fail closed)');
a = await req({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: modern }, ['read']);
ok(a.result.tools.map((t) => t.name).sort().join() === 'cad_big,cad_objects_list,studio_windows_list', 'a read-only token lists only read tools');
a = await req({ jsonrpc: '2.0', id: 3, method: 'tools/list' }, ['read']);
ok(a.result && !('resultType' in a.result) && !('ttlMs' in a.result), 'a legacy-era client (no _meta) gets no 2026-only fields');
a = await req({ jsonrpc: '2.0', id: 4, method: 'tools/list', params: modern }, ['read']);
ok(a.result.resultType === 'complete', 'a 2026-era client keeps them');
state.cap = cap(['read', 'suggest', 'edit', 'save', 'export']);
a = await req({ jsonrpc: '2.0', id: 5, method: 'tools/list', params: modern }, ['read', 'suggest', 'edit', 'save', 'export']);
ok(a.result.tools.some((t) => t.name === 'cad_file_save') && a.result.tools.some((t) => t.name === 'cad_export_pdf'), 'with a raised cap and a token that has them, save and export tools are listed');
state.cap = cap(['read', 'suggest']);

sec('tools/call: groups, the cap, fail closed (T5, T6)');
hubSeen.length = 0;
a = await req(call('cad_objects_list'), ['read']);
ok(!a.result.isError && hubSeen.some((h) => h.name === 'cad_objects_list'), 'a read tool is forwarded to the hub');
ok(hubSeen.find((h) => h.name === 'cad_objects_list').client === 'hosted:ctest', 'the hub sees the client as "hosted:<name>" (the activity log shows who)');
a = await req(call('cad_command_run'), ['read']);
ok(err(a) && err(a).code === 'permission_needed' && !hubSeen.some((h) => h.name === 'cad_command_run'), 'an edit tool with a read-only token: refused here, never reached the hub');
a = await req(call('cad_command_run'), ['read', 'suggest']);
ok(!a.result.isError && hubSeen.some((h) => h.name === 'cad_command_run'), 'suggest lets an edit tool through (the hub diverts it into a change set)');
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'save', 'export']);
ok(err(a) && err(a).code === 'permission_needed' && /save/.test(err(a).message) && !hubSeen.some((h) => h.name === 'cad_file_save'), 'a LYING relay (everything allowed) cannot make Studio save: the cap is read+suggest');
a = await req(call('cad_export_pdf'), ['read', 'suggest', 'edit', 'save', 'export']);
ok(err(a) && err(a).code === 'permission_needed' && !hubSeen.some((h) => h.name === 'cad_export_pdf'), 'nor export');
a = await req(call('does_not_exist'), ['read']);
ok(err(a) && err(a).code === 'not_found', 'an unknown tool: not_found, not forwarded');
a = await req(call('cad_nogroup'), ['read', 'suggest', 'edit', 'save', 'export']);
ok(err(a) && err(a).code === 'not_found' && !hubSeen.some((h) => h.name === 'cad_nogroup'), 'a tool with no group: refused (fail closed)');
a = await req(call(''), ['read']);
ok(err(a) && err(a).code === 'invalid_argument', 'an empty tool name');
a = await req(call('x'.repeat(200)), ['read']);
ok(err(a) && err(a).code === 'invalid_argument', 'a 200-character tool name');
a = await req({ jsonrpc: '2.0', id: 9, method: 'resources/list' }, ['read']);
ok(a.error && a.error.code === -32601, 'methods other than tools/* and ping: method not found');
a = await req({ jsonrpc: '2.0', id: 10, method: 'ping' }, ['read']);
ok(a.result && Object.keys(a.result).length === 0, 'ping answers');
ok((await hc.handleReq({ id: 'z', msg: null })) === null && (await hc.handleReq({ msg: { id: 1 } })) === null && (await hc.handleReq(null)) === null && (await hc.handleReq({ id: 'q', msg: [1] })) === null, 'malformed frames are ignored');

sec('The cap off, and the call ceiling (T10)');
state.cap = { ...cap(['read']), on: false };
a = await req(call('cad_objects_list'), ['read']);
ok(err(a) && err(a).code === 'permission_needed' && /turned off/.test(err(a).message), 'cap off: every call is refused');
a = await req({ jsonrpc: '2.0', id: 11, method: 'tools/list' }, ['read']);
ok(a.error, 'cap off: no tool list');
state.cap = cap(['read'], { perSessionCalls: 3 });
let busy = null;
for (let i = 0; i < 5; i++) { const r = await req(call('cad_objects_list'), ['read'], 'looper'); if (err(r) && err(r).code === 'busy') busy = r; }
ok(busy && /session/.test(err(busy).message), 'a looping AI stops at the per-session call ceiling');
a = await req(call('cad_objects_list'), ['read'], 'another-ai');
ok(!a.result.isError, 'another AI has its own count');
state.cap = cap(['read', 'suggest']);

sec('Replay (T12)');
hubSeen.length = 0;
const rid = 'replay-1';
await hc.handleReq({ id: rid, client: { name: 'ctest' }, levels: ['read'], msg: call('cad_objects_list') });
const again = await hc.handleReq({ id: rid, client: { name: 'ctest' }, levels: ['read'], msg: call('cad_objects_list') });
ok(again === null && hubSeen.filter((h) => h.name === 'cad_objects_list').length === 1, 'the same request id twice: the second is dropped and never reaches the hub');

sec('Paths and size in results (T8)');
state.cap = cap(['read', 'suggest']); state.roots = ['C:\\Drawings'];
a = await req(call('cad_objects_list'), ['read']);
const text = JSON.stringify(a);
ok(!text.includes('C:\\\\Drawings') && !text.includes('C:\\Drawings') && !text.includes('D:\\\\Private') && !text.includes('Private\\\\x'), 'no absolute path in the answer', text);
ok(text.includes('<Drawings>/Client A/plan.dwg') && text.includes('<path removed>'), 'the granted folder shows by name, the other path is removed');
ok(a.result.structuredContent.file === '<Drawings>/Client A/plan.dwg', 'structured content is scrubbed too');
a = await req(call('cad_big'), ['read']);
ok(err(a) && err(a).code === 'result_too_large' && JSON.stringify(a).length < 2000, 'a result over 64 KB is refused with advice (and the big text is not sent)');

sec('Save and Export need a yes for the session (T5)');
state.cap = cap(['read', 'suggest', 'edit', 'save', 'export']);
confirms.length = 0; hubSeen.length = 0; confirmAnswer = false;
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'save', 'export'], 'saver');
ok(err(a) && err(a).code === 'needs_person' && confirms.length === 1 && confirms[0].level === 'save' && confirms[0].client === 'saver' && !hubSeen.some((h) => h.name === 'cad_file_save'), 'no yes: refused, Studio asked once, nothing reached the hub');
confirmAnswer = true;
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'save', 'export'], 'saver');
ok(!a.result.isError && hubSeen.some((h) => h.name === 'cad_file_save') && confirms.length === 2, 'a yes: the save goes through');
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'save', 'export'], 'saver');
ok(!a.result.isError && confirms.length === 2, 'the yes is remembered for the session (not asked again)');
a = await req(call('cad_export_pdf'), ['read', 'suggest', 'edit', 'save', 'export'], 'saver');
ok(confirms.length === 3 && confirms[2].level === 'export' && !a.result.isError, 'export asks separately');
confirmAnswer = false;
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'save', 'export'], 'other-saver');
ok(err(a) && err(a).code === 'needs_person' && confirms.length === 4, 'another AI does not inherit the yes');
a = await req(call('cad_file_save'), ['read', 'suggest', 'edit', 'export'], 'saver');
ok(err(a) && err(a).code === 'permission_needed', 'a yes does not widen a token that lacks save (the token is checked first)');
const failing = createHostedClient({ site: 'x', deviceToken: () => 'x', hub: () => ({ url, token }), cap: () => state.cap, confirm: async () => { throw new Error('dialog closed'); } });
a = await failing.handleReq({ id: 'f1', client: { name: 'c' }, levels: ['read', 'save'], msg: call('cad_file_save') });
ok(err(a) && err(a).code === 'needs_person', 'a confirm that throws counts as no');
state.cap = cap(['read', 'suggest', 'edit', 'save', 'export'], { askForSaveExport: false }); confirms.length = 0;
a = await req(call('cad_file_save'), ['read', 'save'], 'free');
ok(!a.result.isError && confirms.length === 0, 'with asking switched off (the person\'s choice) the cap alone decides');
state.cap = cap(['read', 'suggest']);

sec('Studio\'s local hub is not running');
hubDown = true;
a = await req(call('cad_objects_list'), ['read'], 'down');
ok(err(a) && err(a).code === 'not_open' && err(a).retry === 'after_change', 'a tool call says Studio is not open');
a = await req({ jsonrpc: '2.0', id: 77, method: 'tools/list' }, ['read'], 'down');
ok(a.error && a.error.code === -32603, 'tools/list says so too');
hubDown = false;

const st = hc.status();
ok(st.state === 'off' && Array.isArray(st.recent) && st.recent.length > 0 && !JSON.stringify(st).includes('plan.dwg'), 'status() lists recent calls (tool, group, client) and never a result or a path');
await hubSrv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
