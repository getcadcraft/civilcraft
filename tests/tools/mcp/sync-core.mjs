#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync-core.mjs — host.js (assets/js/host.js, the app windows' side of the control channel) carries the dispatcher of
 * tools/mcp/core.mjs byte for byte, between the lines "// >>> mcp-core" and "// <<< mcp-core" (docs/AGENTS-SPEC.md §6.2).
 * Owner: session agents. After changing core.mjs:
 *
 *   node tools/mcp/sync-core.mjs            write core.mjs's block into host.js, then: node tools/shell/sync.mjs (the app copies)
 *   node tools/mcp/sync-core.mjs --check    exit 1 when they differ (bin/test-agents.mjs checks it too)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CORE = path.join(ROOT, 'tools/mcp/core.mjs');
const HOST = path.join(ROOT, 'public_html/assets/js/host.js');
const START = '// >>> mcp-core', END = '// <<< mcp-core';

export function block(text) {
  const a = text.indexOf(START), b = text.indexOf(END);
  if (a < 0 || b < a) return null;
  return { a, b: b + END.length, text: text.slice(a, b + END.length) };
}

const core = block(fs.readFileSync(CORE, 'utf8'));
if (!core) { console.error('core.mjs has no mcp-core block'); process.exit(2); }
const hostText = fs.readFileSync(HOST, 'utf8');
const have = block(hostText);
if (!have) { console.error('host.js has no mcp-core block'); process.exit(2); }
if (have.text === core.text) { console.log('host.js: mcp-core up to date'); process.exit(0); }
if (process.argv.includes('--check')) { console.log('host.js: mcp-core differs from tools/mcp/core.mjs — run node tools/mcp/sync-core.mjs'); process.exit(1); }
fs.writeFileSync(HOST, hostText.slice(0, have.a) + core.text + hostText.slice(have.b));
console.log('host.js: mcp-core written; now node tools/shell/sync.mjs');
