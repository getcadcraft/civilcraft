#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-command-map.mjs — help/command-map.md (0.7 D7.06 c): every CadCraft command with its short names and what it does, A to Z,
 * made from the command registry itself, so the page cannot say a command exists that does not (or miss one that does). Because
 * CadCraft takes the names people know from other drafting programs, "what to type" and "what runs" are the same column; the page
 * says so, lists the habits that differ, and names what is not built. Add-ons' commands are not in it (they come with the add-on).
 *
 *   node tools/cadcraft-test/make-command-map.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const CHECK = process.argv.includes('--check');
const I18n = await import(pathToFileURL(APP + 'i18n.js').href);
I18n.init({ strings: JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8')) });
const C = await import(pathToFileURL(APP + 'commands.js').href);

// Every module the page (cadcraft.js) imports that adds commands to the registry is imported here too, found from cadcraft.js's own
// import lines, so a new feature module is picked up without an edit here (0.7 honesty-fixes: PDF*, SCAN*, POINTCLOUD*, REGISTERSCANS,
// ASBUILT, MAPLAYERS, TEXTMASK, XCLIP were missing because only spline-cmd.js and pictures-cmd.js were imported).
const PAGE = fs.readFileSync(APP + 'cadcraft.js', 'utf8');
const ADDS = /commandRegistry\s*\.\s*add\b/;
export const MODULES = [...PAGE.matchAll(/^import\s+(?:[^'"]*?\s+from\s+)?['"]\.\/([^'"]+\.js)['"]/gm)].map((m) => m[1])
  .filter((f) => f !== 'commands.js' && fs.existsSync(APP + f) && ADDS.test(fs.readFileSync(APP + f, 'utf8')));
for (const m of MODULES) await import(pathToFileURL(APP + m).href);   // most register when imported, as the page does
// …and the two sets the page installs once at start-up: the Standard tab's commands (libpanel.js → stdlib.js) and IMPORT / EXPORT
// (addons/cadcraft-api.js, CadCraft's own commands for the file types add-ons bring)
const STD = await import(pathToFileURL(APP + 'stdlib.js').href);
if (!C.lookup('STEELMEMBER')) STD.installStandard(C.commandRegistry.add, C.commandRegistry.option);
const API = await import(pathToFileURL(APP + 'addons/cadcraft-api.js').href);
API.installFileCommands({ registry: { importers: new Map(), exporters: new Map() } });

/** Commands that exist only for a while, so the map leaves them out: LIVEHOLD is added while a Studio Live session is open (live.js). */
const WHILE_ONLY = new Set(['LIVEHOLD']);

/** Command names written literally in the app's code (def('NAME', … / commandRegistry.add('NAME', …)) that the registry here lacks. */
export function unregistered() {
  const files = [];
  const walk = (dir) => { for (const n of fs.readdirSync(dir, { withFileTypes: true })) { if (n.isDirectory()) { if (!['lang', 'help', 'addons-bundled'].includes(n.name)) walk(path.join(dir, n.name)); } else if (n.name.endsWith('.js')) files.push(path.join(dir, n.name)); } };
  walk(APP);
  const missing = new Set();
  for (const f of files) {
    const rel = path.relative(APP, f).split(path.sep).join('/');
    if (rel.startsWith('addons/') && rel !== 'addons/cadcraft-api.js') continue;   // bundled add-ons bring their own commands (not listed here)
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:\bdef|commandRegistry\.add|\badd)\(\s*'([A-Z][A-Z0-9_]*)'\s*,\s*\[/g)) if (!C.lookup(m[1]) && !WHILE_ONLY.has(m[1])) missing.add(m[1] + ' (' + path.relative(APP, f) + ')');
  }
  return [...missing];
}

export function page() {
  const list = C.commandList().filter((c) => !c.name.startsWith('_') && !c.name.startsWith('-')).sort((a, b) => a.name.localeCompare(b.name));
  const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
  const rows = list.map((c) => `| \`${c.name}\` | ${c.aliases.length ? c.aliases.map((a) => '`' + a + '`').join(', ') : ''} | ${esc(c.help)} |`).join('\n');
  return `---
title: Command map: what to type
summary: Every command CadCraft has with its short names, A to Z, made from the program itself, and the habits from other drafting programs that differ.
section: switching
order: 215
keywords: command map, commands, aliases, short names, coming from, command list, what to type, erase, trim, equivalent, differences
---

CadCraft takes the command names and short names people know from other drafting programs: type \`L\` for a line, \`TR\` to trim, \`E\` to erase. So there is no translation table to learn for most of them: the name you know is the name here. The list below is every command CadCraft has, made from the program itself. {{key:Enter}} repeats the last one; \`HELP\` in the command line prints the same list.

The few that are not the same, or not built:

- **Save** downloads a copy in the browser ({{cmd:SAVE}}, {{cmd:SAVEAS}}); in CadCraft Studio it writes the file. See [Coming from other drafting software](topic:coming-from).
- **PLOT** makes a PDF (also PNG and SVG), with a plot style table; there is no page setup manager.
- **DIMSTYLE** and **PEDIT** are built; **PEDIT** has no Edit-vertex option (grips do that).
- **TABLE** is not built; {{cmd:XREF}}, {{cmd:SPLINE}} and {{cmd:WBLOCK}} are.
- A routine's own commands (AutoLISP \`C:NAME\`) show up after you load it with {{cmd:APPLOAD}}; they are not listed here.

## All commands (${list.length})

| Command | Short names | What it does |
|---|---|---|
${rows}
`;
}

const target = APP + 'help/command-map.md';
const out = page();
const lost = unregistered();
if (lost.length) { console.log('commands in the code that this generator does not register (import their module above): ' + lost.join(', ')); process.exit(1); }
if (CHECK) {
  const have = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (have !== out) { console.log('help/command-map.md is out of date: run node tools/cadcraft-test/make-command-map.mjs'); process.exit(1); }
  console.log('help/command-map.md is up to date');
} else { fs.writeFileSync(target, out); console.log('wrote help/command-map.md,', out.split('\n').length, 'lines'); }
