#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/** cards-openapi.mjs — AC.4 cards / help topics are current and complete; AC.10 OpenAPI is generated from the definitions and valid. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
const imp = (f) => import(pathToFileURL(path.join(ROOT, 'tools/mcp', f)).href);
const { cardsFor, helpTopic, PLATFORMS } = await imp('cards.mjs');
const { CLIENTS, TEST_PROMPT } = await imp('clients.mjs');
const { openApiFor, checkOpenApi } = await imp('openapi.mjs');
const { loadTools } = await imp('contract-load.mjs');
const { APP_KEYS, publicName } = await imp('contract.mjs');

for (const p of Object.keys(PLATFORMS)) {
  const f = path.join(ROOT, 'public_html/assets/help/common/connect-ai-' + p + '.md');
  ok(fs.existsSync(f) && fs.readFileSync(f, 'utf8') === helpTopic(p), 'help topic for ' + p + ' is what the generator makes (run node tools/mcp/cards.mjs --write-help)');
  const cards = cardsFor(p);
  if (p === 'mobile') { ok(cards.length === 0 && helpTopic(p).includes('hosted connector') && helpTopic(p).includes(TEST_PROMPT), 'mobile: the hosted-connector topic with the test prompt'); continue; }
  ok(cards.length >= 6 && cards.every((c) => c.paste && c.steps.length >= 2 && c.undo && c.test === TEST_PROMPT), p + ': every card has paste, steps, undo and the test prompt', cards.map((c) => c.id));
  const t = helpTopic(p);
  ok(CLIENTS.every((c) => t.includes('### ' + c.name)), p + ': every client has its card');
  ok(!/\bMCP\b[^\n]*\n/.test(t.split('## What you will learn')[0]) && !/^#+ .*MCP/m.test(t), p + ': "MCP" is in no heading');
  ok(!/token|secret|password/i.test(cards.map((c) => c.paste).join('\n')), p + ': no secret in any pasted text');
}
const entries = [];
for (const app of Object.keys(APP_KEYS)) for (const def of await loadTools(app)) entries.push({ app, def });
const doc = openApiFor(entries, {});
ok(doc.openapi.startsWith('3.1') && Object.keys(doc.paths).length >= entries.length, 'OpenAPI: one path per tool', Object.keys(doc.paths).length + ' vs ' + entries.length);
ok(entries.every(({ app, def }) => doc.paths['/tools/' + publicName(app, def.name)]), 'OpenAPI: every tool is there under its hub name');
const problems = checkOpenApi(doc);
ok(!problems.length, 'OpenAPI: checker finds nothing wrong', problems.slice(0, 5));
const sample = entries.find((e) => e.def.group === 'edit');
const op = doc.paths['/tools/' + publicName(sample.app, sample.def.name)].post;
const props = op.requestBody.content['application/json'].schema.properties;
ok(props.preview && props.window, 'OpenAPI: an edit tool takes preview and window');
ok(JSON.stringify(openApiFor(entries, {})) === JSON.stringify(doc), 'OpenAPI: generation is deterministic');
console.log(`\ncards-openapi: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
