#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * byok.mjs test — bring your own key / local models (AC.11, AC.7): the three provider shapes, the key never leaving the transport, and the
 * three limits (calls an hour, money a day and a month, tokens when no price is known). Fake provider; nothing leaves this machine.
 *   node tools/mcp/test/byok.mjs
 */
import http from 'node:http';
import { createByok, directTransport, memoryKeystore, buildRequest, parseResponse, redact, isLocalUrl, DEFAULT_PRICES } from '../byok.mjs';

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const sec = (s) => console.log('\n== ' + s);
const KEY = 'sk-ant-api03-THISISASECRETKEY1234567890abcdef';
const store = (init) => { let v = init; return { get: () => v, set: (x) => { v = x; } }; };
const TOOLS = [{ name: 'cad_objects_list', description: 'Lists objects.', inputSchema: { type: 'object', properties: { limit: { type: 'integer' } } } }];

sec('redact');
ok(!redact('failed with ' + KEY, [KEY]).includes('THISISASECRET') && redact('x', [KEY]) === 'x', 'an exact stored key is removed');
ok(!redact('key sk-proj-abcdefghijklmnopqrstuvwxyz0123').includes('abcdefghijkl') && !redact('Authorization: Bearer abcdefghijklmnop12345').includes('abcdefghijklmnop'), 'key-shaped text and Authorization headers are removed');
ok(redact('Layer WALLS, 12 objects') === 'Layer WALLS, 12 objects' && redact(null) === '', 'ordinary text is untouched');
ok(isLocalUrl('http://127.0.0.1:11434/v1') && isLocalUrl('http://localhost:1234/v1') && !isLocalUrl('http://192.168.1.5:11434') && !isLocalUrl('https://api.openai.com/v1') && !isLocalUrl('nonsense'), 'only this computer counts as local');

sec('Provider shapes');
const msgs = [{ role: 'user', text: 'hi' }, { role: 'assistant', text: 'ok', calls: [{ id: 'c1', name: 'cad_objects_list', args: { limit: 3 } }] }, { role: 'tool', results: [{ id: 'c1', name: 'cad_objects_list', text: '[]', isError: false }, { id: 'c2', name: 'x', text: 'bad', isError: true }] }];
let q = buildRequest({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 1000 }, { messages: msgs, tools: TOOLS });
ok(q.path === '/v1/messages' && q.headers['anthropic-version'] === '2023-06-01' && q.body.max_tokens === 1000 && q.body.tools[0].input_schema.type === 'object' && !('tool_choice' in q.body) && !('temperature' in q.body), 'anthropic: Messages API, no tool_choice, no sampling parameters');
ok(q.body.messages[1].content[1].type === 'tool_use' && q.body.messages[2].content[0].type === 'tool_result' && q.body.messages[2].content[1].is_error === true && !JSON.stringify(q).includes('x-api-key'), 'anthropic: tool_use / tool_result blocks, errors flagged, no key in the request');
q = buildRequest({ provider: 'openai', model: 'm', maxOutputTokens: 500 }, { messages: msgs, tools: TOOLS });
ok(q.path === '/chat/completions' && q.body.max_completion_tokens === 500 && q.body.messages[0].role === 'system' && q.body.messages.filter((m) => m.role === 'tool').length === 2 && q.body.tools[0].type === 'function', 'openai: chat completions, one tool message per result');
q = buildRequest({ provider: 'compatible', model: 'm', maxOutputTokens: 500 }, { messages: msgs, tools: [] });
ok(q.body.max_tokens === 500 && !('tools' in q.body) && !('max_completion_tokens' in q.body), 'compatible: max_tokens, no tools key when there are none');
let p = parseResponse('anthropic', { content: [{ type: 'text', text: 'a' }, { type: 'tool_use', id: 't', name: 'n', input: { a: 1 } }], usage: { input_tokens: 10, output_tokens: 5 }, stop_reason: 'tool_use' });
ok(p.text === 'a' && p.calls[0].args.a === 1 && p.usage.in === 10 && p.usage.out === 5 && p.stop === 'tool_use', 'parse anthropic');
p = parseResponse('openai', { choices: [{ message: { content: 'b', tool_calls: [{ id: 'x', function: { name: 'n', arguments: '{"z":2}' } }, { id: 'y', function: { name: 'n', arguments: '{broken' } }] }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 7, completion_tokens: 3 } });
ok(p.calls[0].args.z === 2 && p.calls[1].args.__invalid === true && p.usage.in === 7, 'parse openai (broken arguments are flagged, not crashed on)');
ok(parseResponse('anthropic', null).text === '' && parseResponse('openai', {}).calls.length === 0, 'junk responses parse to nothing');
ok(DEFAULT_PRICES['claude-opus-5-5'].in === 4 && DEFAULT_PRICES['claude-haiku-5-5'].out === 0.5, 'Anthropic default prices are the dated published ones');

sec('The transport: the key is added here and goes nowhere else');
const ks = memoryKeystore({ default: KEY });
const seen = [];
const fakeFetch = async (url, init) => { seen.push({ url, init }); return { status: 200, text: async () => JSON.stringify({ content: [{ type: 'text', text: 'hello ' + KEY }], usage: { input_tokens: 1, output_tokens: 1 } }) }; };
const tr = directTransport({ keystore: ks, fetch: fakeFetch });
const req = buildRequest({ provider: 'anthropic', model: 'm', maxOutputTokens: 10 }, { messages: [{ role: 'user', text: 'x' }], tools: [] });
let r = await tr({ provider: 'anthropic', baseUrl: '', keyName: 'default', request: req });
ok(r.status === 200 && seen[0].url === 'https://api.anthropic.com/v1/messages' && seen[0].init.headers['x-api-key'] === KEY && seen[0].init.redirect === 'error', 'anthropic: key in x-api-key, to api.anthropic.com, redirects refused');
ok(Object.keys(r).sort().join() === 'json,status', 'only status and JSON come back (no headers)');
r = await tr({ provider: 'openai', baseUrl: '', keyName: 'default', request: buildRequest({ provider: 'openai', model: 'm', maxOutputTokens: 10 }, { messages: [{ role: 'user', text: 'x' }] }) });
ok(seen[1].url === 'https://api.openai.com/v1/chat/completions' && seen[1].init.headers.authorization === 'Bearer ' + KEY, 'openai: Bearer');
r = await tr({ provider: 'compatible', baseUrl: 'http://evil.example.com/v1', keyName: 'default', request: req });
ok(r.error === 'insecure_address' && seen.length === 2, 'a key is never sent over plain http to another computer');
r = await tr({ provider: 'compatible', baseUrl: 'http://192.168.1.9:1234/v1', keyName: 'default', request: req });
ok(r.error === 'insecure_address', 'nor to one on the local network');
r = await tr({ provider: 'compatible', baseUrl: 'https://remote.example.com/v1', keyName: 'default', request: req });
ok(r.status === 200 && seen[2].init.headers.authorization === 'Bearer ' + KEY, 'a remote compatible endpoint over https gets the key');
r = await tr({ provider: 'compatible', baseUrl: 'http://127.0.0.1:11434/v1', keyName: 'none', request: req });
ok(r.status === 200 && !seen[3].init.headers.authorization, 'a local model needs no key and gets none');
r = await tr({ provider: 'anthropic', baseUrl: '', keyName: 'missing', request: req });
ok(r.error === 'no_key', 'no stored key: no_key, nothing sent');
r = await tr({ provider: 'compatible', baseUrl: '', keyName: 'default', request: req });
ok(r.error === 'no_address', 'no address: no_address');
const bigT = directTransport({ keystore: ks, fetch: async () => ({ status: 200, text: async () => 'x'.repeat(100), }), maxBytes: 50 });
ok((await bigT({ provider: 'anthropic', baseUrl: '', keyName: 'default', request: req })).error === 'too_large', 'an over-size answer is refused');
const slowT = directTransport({ keystore: ks, timeoutMs: 100, fetch: (u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => rej(new Error('aborted')))) });
ok((await slowT({ provider: 'anthropic', baseUrl: '', keyName: 'default', request: req })).error === 'timeout', 'a model that never answers times out');
const ac = new AbortController(); setTimeout(() => ac.abort(), 50);
ok((await slowT({ provider: 'anthropic', baseUrl: '', keyName: 'default', request: req, signal: ac.signal })).error === 'aborted', 'the person can stop a call');
const redirT = directTransport({ keystore: ks, fetch: async () => { throw new TypeError('redirect mode is set to error'); } });
ok((await redirT({ provider: 'anthropic', baseUrl: '', keyName: 'default', request: req })).error === 'unreachable', 'a redirect is a failure, never followed');

sec('The engine: a question with a tool, and what it records');
let clock = Date.parse('2026-10-28T10:00:00Z');
const now = () => clock;
const script = [];
const calls = [];
const provider = async ({ request }) => { calls.push(request); const next = script.shift(); return next; };
const settings = store({ provider: 'anthropic', model: 'claude-opus-5-5', caps: { dayAmount: 1, monthAmount: 3, callsPerHour: 5, dayTokens: 100000 } });
const ledger = store([]);
const eng = createByok({ settings, ledger, keystore: ks, transport: provider, now });
const textOnly = (t, i = 1000, o = 200) => ({ status: 200, json: { content: [{ type: 'text', text: t }], usage: { input_tokens: i, output_tokens: o }, stop_reason: 'end_turn' } });
const toolUse = (i = 1000, o = 100) => ({ status: 200, json: { content: [{ type: 'tool_use', id: 'u1', name: 'cad_objects_list', input: { limit: 2 } }], usage: { input_tokens: i, output_tokens: o }, stop_reason: 'tool_use' } });
script.push(toolUse(), textOnly('There are 2 objects.'));
const toolRuns = [];
let a = await eng.ask({ prompt: 'what is in the drawing?', tools: TOOLS, callTool: async (n, args) => { toolRuns.push([n, args]); return { text: '{"objects":2}' }; } });
ok(a.ok && a.text === 'There are 2 objects.' && a.steps === 1 && toolRuns.length === 1 && toolRuns[0][1].limit === 2, 'the model asks for a tool, gets the result, answers');
ok(a.usage.in === 2000 && a.usage.out === 300 && a.history.length === 4 && a.history[3].role === 'assistant', 'usage is summed and the history continues');
ok(calls[1].body.messages.at(-1).content[0].tool_use_id === 'u1' && calls[1].body.messages.at(-1).content[0].content === '{"objects":2}', 'the tool result went back to the model as a tool_result');
ok(JSON.stringify(calls).indexOf(KEY) === -1, 'the key is not in any request body the engine built');
let u = eng.usage();
ok(u.day.calls === 2 && Math.abs(u.day.amount - (2000 * 4 + 300 * 20) / 1e6) < 1e-9 && u.priced, 'the ledger holds 2 calls costing 2000×$4 + 300×$20 per million');
script.push(textOnly('again'));
a = await eng.ask({ prompt: 'and now?', history: a.history, tools: TOOLS, callTool: async () => ({ text: '{}' }) });
ok(a.ok && calls.at(-1).body.messages.length === 5, 'the next question continues the history');

sec('Limits: calls an hour');
clock += 10; script.length = 0;
for (let i = 0; i < 10; i++) script.push(textOnly('x', 10, 5));
let last = null, n = 0;
for (let i = 0; i < 6; i++) { last = await eng.ask({ prompt: 'q' + i, tools: [], callTool: async () => ({ text: '' }) }); if (last.ok) n++; }
ok(n === 2 && last.code === 'calls_hour' && last.raise === 'caps.callsPerHour' && /5 calls/.test(last.message), 'the 6th call in an hour is refused (3 + 2 allowed, then calls_hour), naming the setting', `${n} ok, ${last.code}`);
const before = calls.length;
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && calls.length === before, 'a refused call never reaches the provider');
clock += 3600000 + 10;
script.length = 0; script.push(textOnly('ok', 10, 5));
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.ok, 'an hour later it works again');

sec('Limits: money a day and a month (worst case of the call included)');
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 500, caps: { dayAmount: 0.05, monthAmount: 3, callsPerHour: 1000, dayTokens: 100000 } });
ledger.set([]);
script.length = 0; script.push(textOnly('x', 100, 100));
last = await eng.ask({ prompt: 'short', tools: [], callTool: async () => ({ text: '' }) });
ok(last.ok, 'a small call fits under a $0.05 day');
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 500, caps: { dayAmount: 0.05, monthAmount: 3, callsPerHour: 1000 } });
last = await eng.ask({ prompt: 'x'.repeat(60000), tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && last.code === 'cap_day' && last.raise === 'caps.dayAmount' && /0\.05 USD/.test(last.message), 'a call whose WORST case would pass the daily limit is refused before it is made');
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 4096, caps: { dayAmount: 100, monthAmount: 0.01, callsPerHour: 1000 } });
last = await eng.ask({ prompt: 'x', tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && last.code === 'cap_month', 'the monthly limit stops it too');
clock += 86400000 * 40;
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 4096, caps: { dayAmount: 100, monthAmount: 100, callsPerHour: 1000 } });
script.push(textOnly('ok', 10, 5));
ok((await eng.ask({ prompt: 'x', tools: [], callTool: async () => ({ text: '' }) })).ok, 'a new month starts a new count');
ok(eng.usage().month.calls === 1, 'old months are not counted (and the ledger drops entries older than ~2 months)');
const L = ledger.get(); ok(L.every((e) => clock - e.t < 62 * 86400000), 'the ledger is pruned');

sec('Limits: no price known → a token cap; local models cost nothing');
settings.set({ provider: 'openai', model: 'some-model', maxOutputTokens: 1000, caps: { dayAmount: 1, monthAmount: 1, callsPerHour: 1000, dayTokens: 3000 } });
ledger.set([]);
script.length = 0; script.push({ status: 200, json: { choices: [{ message: { content: 'x' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1500, completion_tokens: 500 } } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.ok && !eng.usage().priced && eng.usage().day.amount === 0, 'with no price the cost is not invented (0, and usage says not priced)');
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && last.code === 'cap_tokens' && last.raise === 'prices' && /price/.test(last.message), 'the token cap stops it and says to enter a price');
settings.set({ provider: 'openai', model: 'some-model', maxOutputTokens: 1000, prices: { 'some-model': { in: 1, out: 2 } }, caps: { dayAmount: 1, monthAmount: 1, callsPerHour: 1000 } });
script.push({ status: 200, json: { choices: [{ message: { content: 'x' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1000, completion_tokens: 1000 } } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.ok && Math.abs(eng.usage().day.amount - 0.003) < 1e-9 || eng.usage().day.amount > 0, 'a price the person entered is used');
settings.set({ provider: 'compatible', model: 'llama', baseUrl: 'http://127.0.0.1:11434/v1', maxOutputTokens: 1000, caps: { dayAmount: 0.0001, monthAmount: 0.0001, callsPerHour: 1000, dayTokens: 10 } });
ledger.set([]);
script.length = 0; script.push({ status: 200, json: { choices: [{ message: { content: 'local answer' }, finish_reason: 'stop' }], usage: { prompt_tokens: 5000, completion_tokens: 5000 } } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.ok && last.text === 'local answer' && eng.usage().day.amount === 0 && eng.usage().priced, 'a local model: no money cap, no token cap, cost 0');
settings.set({ provider: 'compatible', model: 'llama', baseUrl: 'http://127.0.0.1:11434/v1', maxOutputTokens: 1000, caps: { callsPerHour: 1 } });
script.push({ status: 200, json: { choices: [{ message: { content: 'x' }, finish_reason: 'stop' }], usage: {} } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && last.code === 'calls_hour', 'but a local model still has the calls-an-hour limit');

sec('Errors say what to do, and never carry the key');
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 100, caps: { dayAmount: 100, monthAmount: 100, callsPerHour: 1000 } }); ledger.set([]);
script.length = 0; script.push({ status: 401, json: { error: { message: 'invalid x-api-key: ' + KEY } } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(!last.ok && last.code === 'bad_key' && /did not accept the key/.test(last.message) && !last.message.includes('THISISASECRET'), '401: bad_key, and the provider\'s echo of the key is removed');
for (const [st, code] of [[429, 'rate_limited'], [404, 'bad_model'], [503, 'provider_down'], [400, 'bad_request']]) { script.push({ status: st, json: { error: { message: 'm' } } }); last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) }); ok(last.code === code, `${st} → ${code}`); }
script.push({ status: 200, json: { content: [], stop_reason: 'refusal', usage: { input_tokens: 5, output_tokens: 0 } } });
last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.code === 'refused', 'a refusal stop reason is handled');
script.push({ error: 'no_key' }); last = await eng.ask({ prompt: 'q', tools: [], callTool: async () => ({ text: '' }) });
ok(last.code === 'no_key' && /Add your key/.test(last.message), 'no key: says where to add it');
settings.set({ provider: 'anthropic', model: '' });
ok((await eng.ask({ prompt: 'q' })).code === 'no_model', 'no model chosen');
settings.set({ provider: 'anthropic', model: 'claude-opus-5-5', maxOutputTokens: 100, maxToolSteps: 2, caps: { dayAmount: 100, monthAmount: 100, callsPerHour: 1000 } });

sec('Tool steps, bad arguments, tool failures, stopping');
script.length = 0; for (let i = 0; i < 6; i++) script.push(toolUse(10, 5));
last = await eng.ask({ prompt: 'loop', tools: TOOLS, callTool: async () => ({ text: 'x' }) });
ok(!last.ok && last.code === 'too_many_steps' && /2 tool steps/.test(last.message), 'a model that keeps calling tools stops at the step limit');
script.length = 0;
script.push({ status: 200, json: { choices: [{ message: { content: null, tool_calls: [{ id: 'z', function: { name: 'cad_objects_list', arguments: '{bad' } }] }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 1, completion_tokens: 1 } } }, { status: 200, json: { choices: [{ message: { content: 'done' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } } });
settings.set({ provider: 'openai', model: 'm', maxOutputTokens: 100, prices: { m: { in: 0, out: 0 } }, caps: { dayAmount: 9, monthAmount: 9, callsPerHour: 1000 } });
let ran = 0;
last = await eng.ask({ prompt: 'q', tools: TOOLS, callTool: async () => { ran++; return { text: 'x' }; } });
ok(last.ok && ran === 0 && last.history.find((m) => m.role === 'tool').results[0].isError === true, 'broken tool arguments never run the tool; the model is told');
script.length = 0;
script.push({ status: 200, json: { choices: [{ message: { content: null, tool_calls: [{ id: 'z', function: { name: 'cad_objects_list', arguments: '{}' } }] }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 1, completion_tokens: 1 } } }, { status: 200, json: { choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } } });
last = await eng.ask({ prompt: 'q', tools: TOOLS, callTool: async () => { throw new Error('boom with ' + KEY); } });
ok(last.ok && last.history.find((m) => m.role === 'tool').results[0].isError && !JSON.stringify(last.history).includes('THISISASECRET'), 'a tool that throws becomes an error result, key-shaped text removed');
script.length = 0; script.push({ status: 200, json: { choices: [{ message: { content: null, tool_calls: [{ id: 'z', function: { name: 'cad_objects_list', arguments: '{}' } }] }, finish_reason: 'tool_calls' }], usage: { prompt_tokens: 1, completion_tokens: 1 } } });
const stop = new AbortController(); stop.abort();
last = await eng.ask({ prompt: 'q', tools: TOOLS, callTool: async () => ({ text: 'x' }), signal: stop.signal });
ok(!last.ok && last.code === 'aborted', 'stopping before a tool runs');

sec('Keys: set / has / remove never read the key back');
const e2 = createByok({ settings: store({ provider: 'anthropic', model: 'm', keyName: 'k2' }), ledger: store([]), keystore: memoryKeystore(), transport: provider, now });
ok(!(await e2.hasKey())); await e2.setKey('abc12345678'); ok(await e2.hasKey()); await e2.removeKey(); ok(!(await e2.hasKey()), 'set, has, remove');
ok(typeof e2.getKey === 'undefined', 'the engine offers no way to read a key');

sec('A real local server (OpenAI-compatible, like Ollama or LM Studio)');
const hits = [];
const srv = http.createServer((rq, rs) => { let b = ''; rq.on('data', (c) => { b += c; }); rq.on('end', () => { hits.push({ url: rq.url, auth: rq.headers.authorization || null, body: JSON.parse(b) }); rs.writeHead(200, { 'content-type': 'application/json' }); rs.end(JSON.stringify({ choices: [{ message: { content: 'from local' }, finish_reason: 'stop' }], usage: { prompt_tokens: 3, completion_tokens: 2 } })); }); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const e3 = createByok({ settings: store({ provider: 'compatible', model: 'llama3', baseUrl: `http://127.0.0.1:${port}/v1`, caps: { callsPerHour: 100 } }), ledger: store([]), keystore: memoryKeystore(), transport: directTransport({ keystore: memoryKeystore() }), now });
last = await e3.ask({ prompt: 'hello', tools: TOOLS, callTool: async () => ({ text: '' }) });
ok(last.ok && last.text === 'from local' && hits[0].url === '/v1/chat/completions' && hits[0].auth === null && hits[0].body.tools[0].function.name === 'cad_objects_list', 'a real local OpenAI-compatible server: right URL, tools sent, no key');
srv.close();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
