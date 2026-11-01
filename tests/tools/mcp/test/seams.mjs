#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * seams.mjs — the AI seams ai-trust_PART_2 asked for and ai_PART_3 landed (docs/0.8-sessions/ai_PART_3.md):
 *   1 host.control.apply · 1b packs on the hub and the stand-alone server · 2 project rules kept and enforced · 3 the hub's activity feed
 *   4 opts.capabilities · 5 the contract allow-list · 6 preview listed only where it works (and works for the headless drawing tools)
 *   node tools/mcp/test/seams.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const CHANNEL_JS = process.env.CADCRAFT_STUDIO ? path.join(process.env.CADCRAFT_STUDIO, 'hub/channel.js') : '/var/www/CADCRAFT/studio/hub/channel.js';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m, x === undefined ? '' : JSON.stringify(x).slice(0, 500)); } };
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const H = await imp('public_html/assets/js/host.js');
const core = await imp('tools/mcp/core.mjs');
const { mountPacks } = await imp('tools/mcp/packs.mjs');
const { PACKS } = await imp('public_html/assets/js/skill-packs.js');
const perms = await imp('public_html/assets/js/assist-perms.js');
const { checkTool } = await imp('tools/mcp/contract.mjs');

const obj = (p = {}, req = []) => ({ type: 'object', properties: p, required: req, additionalProperties: false });
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const doc = { items: [], undoStack: [], redoStack: [], undo() { const s = this.undoStack.pop(); if (!s) return null; this.items.pop(); this.redoStack.push(s); return s; } };
const add = { name: 'item_add', group: 'edit', rollbackPreview: true, title: 'Add an item', description: 'Add an item to the toy document as one undo step.', inputSchema: obj({ label: { type: 'string', maxLength: 40, description: 'The label.' } }, ['label']),
  run: async (a) => { doc.items.push(a.label); doc.undoStack.push(a.label); return { n: doc.items.length, undo: 'Assistant: add ' + a.label }; } };
const plain = { name: 'thing_set', group: 'edit', title: 'Set a thing', description: 'An edit tool with no way to preview, for the listing test.', inputSchema: obj({ v: { type: 'integer', minimum: 0, maximum: 9, description: 'A value.' } }), run: async () => ({ ok: true }) };
const text = (r) => (r.content && r.content[0] && r.content[0].text) || '';

// ---- 1 + 2: apply and the project rule, on a real host.control
{
  const win = { localStorage: mem() };
  const host = H.createHost({ app: 'cadcraft', window: win, document: null, indexedDB: null, desktop: null });
  const c = host.control;
  c.tool(add); c.tool(plain);
  const recorded = [];
  c.configure({ enabled: true, groups: ['read', 'suggest'], title: 'CadCraft', rollback: H.stackRollback(() => doc), suggest: async (t, args, ctx) => { recorded.push({ tool: t.name, args }); return { id: 'cs1' }; } });
  let r = await c.call('item_add', { label: 'a' });
  ok(r.structuredContent && r.structuredContent.suggested === true && recorded.length === 1 && doc.items.length === 0, 'Suggest-only: the edit is recorded, nothing changes', r.structuredContent);
  r = await c.apply('item_add', { label: 'b' }, { client: { name: 'Studio' } });
  ok(!r.isError && r.structuredContent.n === 1 && doc.items[0] === 'b', 'apply() runs the real tool at the Suggest level', r);
  ok(c.log.some((e) => e.tool === 'item_add' && e.outcome === 'ok' && e.client === 'Studio'), 'apply() is in the log with the client', c.log.slice(-2));
  r = await c.call('item_add', { label: 'c' });
  ok(r.structuredContent.suggested === true && doc.items.length === 1, 'a later call is still only suggested (apply left nothing on)');
  r = await c.apply('thing_set', { v: 1 });
  ok(!r.isError, 'apply() on an edit tool without preview');
  // save/export are not widened by apply
  c.tool({ name: 'thing_save', group: 'save', title: 'Save', description: 'A save tool for the apply test, writes nothing.', inputSchema: obj(), run: async () => ({ saved: true }) });
  r = await c.apply('thing_save', {});
  ok(r.isError && r.structuredContent.error.code === 'permission_needed', 'apply() adds Edit only: Save stays refused', r.structuredContent);
  c.configure({ enabled: false });
  r = await c.apply('item_add', { label: 'z' });
  ok(r.isError && r.structuredContent.error.code === 'permission_needed' && doc.items.length === 1, 'apply() on an app that is off is refused');

  // the project rule narrows, never widens, and is enforced by the dispatcher
  c.configure({ enabled: true, groups: ['read', 'edit'] });
  ok(!(await c.call('item_add', { label: 'd' })).isError && doc.items.length === 2, 'Edit level: the call is applied');
  c.configure({ rules: () => ({ groups: ['read'], folders: [] }) });
  r = await c.call('item_add', { label: 'e' });
  ok(r.isError && r.structuredContent.error.code === 'permission_needed' && doc.items.length === 2, 'a project rule of Read refuses an edit the app allows', r.structuredContent);
  ok(c.effective.groups.join() === 'read', 'host.control.effective shows the narrowed groups', c.effective);
  c.configure({ rules: () => ({ groups: ['read', 'edit', 'export'], folders: [] }) });
  ok(!c.effective.groups.includes('export') && c.effective.groups.includes('edit'), 'a rule cannot widen: Export was never allowed', c.effective);
  c.configure({ rules: () => ({ groups: ['read', 'suggest'], folders: [] }) });
  r = await c.call('item_add', { label: 'f' });
  ok(r.structuredContent && r.structuredContent.suggested === true, 'a project rule of Suggest turns the edit into a suggestion');
  c.configure({ rules: () => { throw new Error('boom'); } });
  ok(c.effective.groups.includes('edit'), 'a rule that throws falls back to the app\'s own level');
  c.configure({ rules: null });
  const rec = perms.setProject({ enabled: true, groups: ['read', 'edit'], folders: [] }, 'doc:abc', { groups: ['read', 'suggest'] });
  c.configure({ rules: () => { const e = perms.effective(rec, 'doc:abc'); return { groups: e.groups, folders: e.folders }; } });
  r = await c.call('item_add', { label: 'g' });
  ok(r.structuredContent && r.structuredContent.suggested === true, 'assist-perms.effective() through configure({ rules }) is what is enforced');

  // prefs: projects survive the card's save and a reload
  const prefs = { enabled: true, groups: ['read', 'suggest'], folders: [], projects: rec.projects };
  H.saveAssistantPrefs(host, prefs);
  ok(JSON.stringify(H.assistantPrefs(host).projects) === JSON.stringify(rec.projects) && H.assistantPrefs(host).groups.includes('suggest'), 'assistantPrefs keeps projects and the Suggest level', H.assistantPrefs(host));
  H.saveAssistantPrefs(host, { enabled: true, groups: ['read'], folders: [] });
  ok(Object.keys(H.assistantPrefs(host).projects).length === 1, 'a save from the card (no projects given) keeps the per-file rules');
  win.localStorage.setItem('cadcraft.assistants.cadcraft', JSON.stringify({ enabled: true, groups: ['read'], projects: { [('x').repeat(200)]: { groups: ['edit'] }, ok: { groups: ['bogus', 'read'], folders: ['/a'], note: 'n\u0000n' } } }));
  const p2 = H.assistantPrefs(host).projects;
  ok(Object.keys(p2).length === 1 && p2.ok.groups.join() === 'read' && !/\u0000/.test(p2.ok.note), 'a hand-edited record is cleaned', p2);
}

// ---- 6: preview is listed only where it works
{
  const host = H.createHost({ app: 'bimcraft', window: null, document: null, indexedDB: null, desktop: null });
  const c = host.control;
  c.tool(add); c.tool(plain);
  c.configure({ enabled: true, groups: ['read', 'edit'], title: 'BimCraft' });
  let tools = c.list();
  ok(!tools.find((t) => t.name === 'item_add').inputSchema.properties.preview, 'a rollback-preview tool with no rollback configured lists no preview');
  c.configure({ rollback: H.stackRollback(() => doc) });
  tools = c.list();
  ok(tools.find((t) => t.name === 'item_add').inputSchema.properties.preview, 'once the app gives a rollback, preview is listed');
  ok(!tools.find((t) => t.name === 'thing_set').inputSchema.properties.preview, 'a tool with no preview of any kind does not list one');
  const r = await c.call('thing_set', { preview: true });
  ok(r.isError && r.structuredContent.error.code === 'invalid_argument', 'asking for it anyway is an argument error, not a silent "unsupported"', r.structuredContent);
  const sv = { name: 'x_save', group: 'save', title: 'Save', description: 'A save tool: preview validates by default.', inputSchema: obj({ path: { type: 'string', maxLength: 100, description: 'Where.' } }), run: async () => ({}) };
  c.tool(sv); c.configure({ groups: ['read', 'edit', 'save'] });
  ok(c.list().find((t) => t.name === 'x_save').inputSchema.properties.preview, 'save and export tools always preview (validate)');
}

// ---- 4 + 1b: capabilities and the packs
{
  const d = core.createDispatcher({ server: { name: 'x', title: 'X', version: '1' }, allowed: () => ['read'], capabilities: { logging: {}, completions: {}, tools: { listChanged: true } } });
  let r = await d.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', clientInfo: { name: 't', version: '1' } } }, {});
  ok(r.result.capabilities.completions && r.result.capabilities.tools.listChanged === true, 'opts.capabilities is merged into initialize and never replaces tools', r.result.capabilities);
  r = await d.handle({ jsonrpc: '2.0', id: 2, method: 'server/discover', params: {} }, {});
  ok(r.result.capabilities.completions && r.result.capabilities.tools.listChanged === false, 'and into server/discover', r.result.capabilities);
  mountPacks(d, { packs: PACKS });
  r = await d.handle({ jsonrpc: '2.0', id: 3, method: 'initialize', params: { protocolVersion: '2025-06-18', clientInfo: { name: 't', version: '1' } } }, {});
  ok(r.result.capabilities.prompts && r.result.capabilities.resources && r.result.capabilities.completions, 'mountPacks adds prompts and resources through addCapabilities', r.result.capabilities);
  r = await d.handle({ jsonrpc: '2.0', id: 4, method: 'prompts/list', params: {} }, {});
  ok(r.result.prompts.length >= 30 && r.result.prompts.some((p) => p.name === 'ask-box.answer'), 'prompts/list serves the starters (' + (r.result.prompts || []).length + ')');
}
if (fs.existsSync(CHANNEL_JS)) {
  const { openChannel } = await import(pathToFileURL(CHANNEL_JS).href);
  const mk = (app, id, tools, document) => { const ch = openChannel({ app, id, storage: null }); const host = H.createHost({ app, window: null, document: null, indexedDB: null, desktop: null }); for (const t of tools) host.control.tool(t); host.control.configure({ enabled: true, groups: ['read', 'edit'], title: app, channel: ch, document: () => document, rollback: H.stackRollback(() => doc) }); return { ch, host }; };
  const cad = mk('cadcraft', 'cadcraft-1', [add], 'plan a.dwg');
  const fed = [], mounted = [];
  const hubCh = openChannel({ app: 'studio', id: 'studio-hub', storage: null });
  const relay = H.createControlRelay({ channel: hubCh, hosted: () => ({ on: true, levels: ['read', 'suggest', 'bogus'] }), activityLog: { add: (e) => fed.push(e) }, mount: (d, o) => { mounted.push(o); mountPacks(d, { packs: PACKS, enabled: o.enabled }); } });
  await new Promise((r) => setTimeout(r, 200));
  const META = { 'io.modelcontextprotocol/protocolVersion': '2026-07-28', 'io.modelcontextprotocol/clientCapabilities': {}, 'io.modelcontextprotocol/clientInfo': { name: 'seams', version: '1' } };
  const rpc = (method, params = {}) => relay.handle({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e6), method, params: { ...params, _meta: META } }, { id: 's1' });
  let r = await rpc('tools/call', { name: 'cad_item_add', arguments: { label: 'hub' } });
  await new Promise((x) => setTimeout(x, 100));
  ok(!r.result.isError && fed.some((e) => e.tool === 'item_add' && e.app === 'cadcraft' && e.document === 'plan a.dwg' && e.outcome === 'ok'), 'a window\'s call reaches the hub\'s activity log with app and document', fed);
  r = await rpc('prompts/list');
  ok(r.result && r.result.prompts.some((p) => p.name === 'cad-draw.layers' || /^cad/.test(p.name) || p.name === 'ask-box.answer') && mounted.length === 1, 'prompts/list is answered by the hub, not forwarded to a window', r.result && r.result.prompts && r.result.prompts.length);
  const names = r.result.prompts.map((p) => p.name);
  ok(!names.some((n) => /^bim/.test(n)), 'a pack of an app with no open window is not offered', names.filter((n) => /^bim/.test(n)));
  r = await rpc('resources/read', { uri: 'cadcraft://packs/index' });
  ok(r.result && r.result.contents && r.result.contents[0].mimeType === 'application/json', 'resources/read is the hub\'s too');
  r = await rpc('tools/call', { name: 'studio_apps_list', arguments: {} });
  const apps = r.result.structuredContent;
  const cadRow = apps.apps.find((x) => x.app === 'cadcraft');
  ok(apps.hosted && apps.hosted.on === true && apps.hosted.levels.join() === 'read,suggest' && cadRow.hostedAllowed.join() === 'read' && cadRow.allowed.includes('edit'), 'studio_apps_list says which levels the hosted connector may use per app (read of read+edit)', apps.hosted);
  cad.ch.close && cad.ch.close();
} else console.log('seams: the relay part is skipped (no ' + CHANNEL_JS + ')');

// ---- directories want every non-read tool to say readOnly or destructive; the package names itself for the registry
{
  for (const g of ['edit', 'save', 'export']) { const h = core.groupHints(g); ok(h.readOnlyHint === false && h.destructiveHint === true, g + ' tools carry destructiveHint: true (a directory needs one of the two hints)', h); }
  ok(core.groupHints('read').readOnlyHint === true, 'read tools carry readOnlyHint: true');
  const pj = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/mcp/package.json'), 'utf8'));
  ok(pj.mcpName === 'com.getcadcraft/studio' && /^[a-z0-9.-]+\/[a-z0-9._-]+$/i.test(pj.mcpName), 'package.json has mcpName for the MCP Registry', pj.mcpName);
  const cards = await imp('tools/mcp/cards.mjs');
  ok(cards.HOSTED.universal === 'https://getcadcraft.com/connect/mcp' && cards.HOSTED.open === false, 'cards.mjs knows the universal address and keeps it out of public text while the switch is off');
  const help = fs.readFileSync(path.join(ROOT, 'public_html/assets/help/common/connect-ai-mobile.md'), 'utf8');
  ok(!help.includes('/connect/mcp'), 'the public phone topic does not print the address before the connector is open');
}

// ---- 5: the contract allow-list
{
  for (const name of ['ask_list', 'ask_reply', 'suggestions_list', 'standards_get']) {
    const res = checkTool({ name, group: 'read', title: 'T', description: 'A read tool the person\'s own words come from, for the contract test.', inputSchema: obj({ limit: { type: 'integer', minimum: 1, maximum: 50, description: 'How many.' }, offset: { type: 'integer', minimum: 0, maximum: 1000, description: 'Where from.' } }) });
    ok(!res.warnings.some((w) => /untrusted/.test(w)), name + ' does not warn about untrusted text', res.warnings);
  }
  ok(checkTool({ name: 'objects_list', group: 'read', title: 'T', description: 'A read tool that returns text from the file, for the contract test.', inputSchema: obj({ limit: { type: 'integer', minimum: 1, maximum: 50, description: 'How many.' }, offset: { type: 'integer', minimum: 0, maximum: 1000, description: 'Where from.' } }) }).warnings.some((w) => /untrusted/.test(w)), 'a file-text tool still warns');
}

// ---- 6: headless drawing previews, over the real stdio server's tools
{
  const { createEnv, headlessTools, headlessRollback } = await imp('tools/cli/headless/tools.mjs');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seams-'));
  const env = createEnv({ roots: [tmp], undoPrefix: 'Assistant: ' });
  const d = core.createDispatcher({ server: { name: 'cadcraft', title: 'CadCraft', version: '0' }, allowed: () => ['read', 'edit', 'save', 'export'], rollback: headlessRollback(env) });
  for (const t of headlessTools(env)) d.tool(t);
  const listed = d.list();
  for (const n of ['command_run', 'script_run', 'block_insert', 'undo']) ok(listed.find((t) => t.name === n).inputSchema.properties.preview, n + ' lists preview', n);
  const call = async (name, args) => { const r = await d.call(name, args, {}); return r.structuredContent || r; };
  const n0 = await call('drawing_new', {});
  const doc1 = n0.doc;
  const before = (await call('objects_list', { doc: doc1 })).total ?? (await call('objects_list', { doc: doc1 })).objects?.length ?? 0;
  const pv = await call('command_run', { doc: doc1, input: ['LINE', '0,0', '@10,0', ''], preview: true });
  ok(pv.preview === true && pv.applied === false && pv.would && (pv.would.counts ? pv.would.counts.added >= 1 : true), 'command_run preview says what would be added', pv);
  const after = (await call('objects_list', { doc: doc1 })).total ?? (await call('objects_list', { doc: doc1 })).objects?.length ?? 0;
  ok(after === before, 'and the drawing is unchanged afterwards (' + before + ' → ' + after + ')');
  const real = await call('command_run', { doc: doc1, input: ['LINE', '0,0', '@10,0', ''] });
  ok(real.counts && real.counts.added >= 1, 'the same call for real adds the line', real);
  const up = await call('undo', { doc: doc1, preview: true });
  ok(up.preview === true && Array.isArray(up.would.wouldUndo) && up.would.wouldUndo.length === 1, 'undo preview names the step it would take', up);
  const sp = await call('script_run', { doc: doc1, script: 'LINE 0,0 5,5 ', language: 'scr', preview: true });
  ok(sp.preview === true && sp.applied === false, 'script_run preview', sp);
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
