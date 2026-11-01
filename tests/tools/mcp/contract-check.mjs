#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * contract-check.mjs — the AI tool contract over every tool of every app (docs/AI-CONNECT-SPEC.md § 2, rule 34).
 *
 *   node tools/mcp/contract-check.mjs [--app cadcraft,bimcraft…] [--json] [--warnings] [--tools] [--spec]
 *
 * Loads each app's dev/agents.js (CivilCraft: civil-agent.js + water-agent.js) in Node, runs its installAgents on the app's own
 * host.js with a stand-in for the page, records every tool definition passed to host.control.tool, and checks it with
 * contract.mjs. Exit 1 when any tool has an error. `--tools` lists every tool with its hub name and preview kind.
 */
import { APP_KEYS, publicName, checkTool } from './contract.mjs';
import { loadTools } from './contract-load.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const has = (k) => process.argv.includes(k);
if (has('--spec')) { console.log('Built against Model Context Protocol revision 2026-07-28 (docs/AI-CONNECT-SPEC.md § 0)'); process.exit(0); }

const apps = (arg('--app') ? arg('--app').split(',') : Object.keys(APP_KEYS));
const report = {}, defsByApp = {};
let errorCount = 0, warnCount = 0, toolCount = 0;
for (const app of apps) {
  try {
    const defs = await loadTools(app);
    defsByApp[app] = defs;
    report[app] = defs.map((d) => ({ name: d.name, hub: publicName(app, d.name), group: d.group, ...checkTool(d, { app }) }));
    toolCount += defs.length;
  } catch (e) { report[app] = { loadError: String(e && e.message || e).slice(0, 300) }; errorCount++; }
}
if (has('--missing')) {   // top-level arguments with no description, with a compact schema: the list to write descriptions from
  const short = (v) => JSON.stringify(v, (k, x) => (k === 'description' ? undefined : x)).slice(0, 110);
  for (const [app, defs] of Object.entries(defsByApp)) for (const d of defs) {
    const miss = Object.entries((d.inputSchema && d.inputSchema.properties) || {}).filter(([, v]) => !v.description);
    if (miss.length) console.log(app + '/' + d.name + '  [' + String(d.description).slice(0, 70) + ']\n   ' + miss.map(([k, v]) => k + '=' + short(v)).join('\n   '));
  }
  process.exit(0);
}
for (const [app, list] of Object.entries(report)) {
  if (list.loadError) { if (!has('--json')) console.log(app + ': could not load — ' + list.loadError); continue; }
  const bad = list.filter((t) => t.errors.length), warn = list.filter((t) => t.warnings.length);
  errorCount += list.reduce((n, t) => n + t.errors.length, 0); warnCount += list.reduce((n, t) => n + t.warnings.length, 0);
  if (has('--json')) continue;
  console.log(app.padEnd(13) + String(list.length).padStart(3) + ' tools  ' + String(bad.length).padStart(3) + ' with errors  ' + String(warn.length).padStart(3) + ' with warnings');
  for (const t of list) {
    if (has('--tools')) console.log('   ' + t.hub.padEnd(34) + t.group.padEnd(7) + ' preview:' + t.preview);
    for (const e of t.errors) console.log('   ERROR ' + t.name + ': ' + e);
    if (has('--warnings')) for (const w of t.warnings) console.log('   warn  ' + t.name + ': ' + w);
  }
}
if (has('--json')) console.log(JSON.stringify(report, null, 1));
else console.log('\n' + toolCount + ' tools, ' + errorCount + ' errors, ' + warnCount + ' warnings');
process.exit(errorCount ? 1 : 0);
