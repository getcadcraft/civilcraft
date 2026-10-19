#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pack.mjs — build the npm package @getcadcraft/mcp in a folder (docs/AGENTS-SPEC.md §8; session agents). Publishing it is the
 * owner's: this never runs npm publish.
 *
 *   node tools/mcp/pack.mjs [--out tmp/mcp-package] [--tgz]      (--tgz also runs `npm pack` in it → the .tgz beside it)
 *
 * Layout:  package.json (bins cadcraft-mcp → mcp/server.mjs, cadcraft → cli/cadcraft.mjs) · LICENSE · README.md · THIRD_PARTY.md
 *          mcp/{server,core,live-server}.mjs · cli/cadcraft.mjs · cli/headless/*.mjs
 *          cli/apps/{cadcraft,takeoffcraft,markupcraft}/ — the dev builds' JavaScript + lang/en.json (no pages, styles or help)
 *          cli/apps/bimcraft/ — only what its assistant tools import (agents.js, ifc-edit.js, new-model.js and their imports;
 *          0.6 DF.25, session bim-draw) + lang/en.json
 *          cli/lib/ifc/ (cc-ifc) · cli/vendor/pdf-lib/ (MIT; its LICENSE)  — pdfjs-dist is an optional dependency (PDF markups).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const OUT = path.resolve(oi >= 0 ? args[oi + 1] : path.join(ROOT, 'tmp/mcp-package'));
const APPS = ['cadcraft', 'takeoffcraft', 'markupcraft'];

fs.rmSync(OUT, { recursive: true, force: true });
const mk = (p) => fs.mkdirSync(p, { recursive: true });
const cp = (src, dst) => { mk(path.dirname(dst)); fs.copyFileSync(src, dst); };
/** Copy a folder's .js/.mjs files (and lang/en.json), skipping pages, styles, help and tests. */
function copyCode(src, dst) {
  for (const d of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, d.name), t = path.join(dst, d.name);
    if (d.isDirectory()) { if (['help', 'node_modules', 'tests', '.cc-test'].includes(d.name)) continue; if (d.name === 'lang') { if (fs.existsSync(path.join(s, 'en.json'))) cp(path.join(s, 'en.json'), path.join(t, 'en.json')); continue; } copyCode(s, t); continue; }
    if (/\.(m?js|json)$/.test(d.name) && d.name !== 'manifest.json' && d.name !== 'release.json') cp(s, t);
  }
}

/** Copy the files these entry modules import, recursively (static and quoted dynamic imports of './…'), + lang/en.json. */
function copyClosure(src, dst, entries) {
  const seen = new Set(), todo = [...entries];
  while (todo.length) {
    const f = path.normalize(todo.pop());
    if (seen.has(f) || !fs.existsSync(path.join(src, f))) continue;
    seen.add(f);
    const text = fs.readFileSync(path.join(src, f), 'utf8');
    for (const m of text.matchAll(/(?:from\s*|import\(\s*)['"](\.{1,2}\/[^'"]+\.m?js)['"]/g)) todo.push(path.join(path.dirname(f), m[1]));
  }
  for (const f of seen) cp(path.join(src, f), path.join(dst, f));
  if (fs.existsSync(path.join(src, 'lang/en.json'))) cp(path.join(src, 'lang/en.json'), path.join(dst, 'lang/en.json'));
  return seen.size;
}

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/mcp/package.json'), 'utf8'));
pkg.bin = { 'cadcraft-mcp': 'mcp/server.mjs', cadcraft: 'cli/cadcraft.mjs' };
pkg.files = ['mcp/', 'cli/', 'LICENSE', 'README.md', 'THIRD_PARTY.md'];
pkg.keywords = ['mcp', 'model-context-protocol', 'cad', 'dwg', 'dxf', 'ifc', 'takeoff', 'cli'];
mk(OUT);
fs.writeFileSync(path.join(OUT, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
for (const f of ['server.mjs', 'core.mjs', 'live-server.mjs']) cp(path.join(ROOT, 'tools/mcp', f), path.join(OUT, 'mcp', f));
cp(path.join(ROOT, 'tools/cli/cadcraft.mjs'), path.join(OUT, 'cli/cadcraft.mjs'));
for (const f of fs.readdirSync(path.join(ROOT, 'tools/cli/headless'))) if (f.endsWith('.mjs')) cp(path.join(ROOT, 'tools/cli/headless', f), path.join(OUT, 'cli/headless', f));
for (const a of APPS) copyCode(path.join(ROOT, 'public_html/assets/apps', a, 'dev'), path.join(OUT, 'cli/apps', a));
copyClosure(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev'), path.join(OUT, 'cli/apps/bimcraft'), ['agents.js', 'ifc-edit.js', 'new-model.js']);
copyCode(path.join(ROOT, 'lib/ifc'), path.join(OUT, 'cli/lib/ifc'));
const pl = fs.realpathSync(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current'));
for (const f of ['pdf-lib.esm.js', 'LICENSE.md']) cp(path.join(pl, f), path.join(OUT, 'cli/vendor/pdf-lib', f));
const lic = ['/var/www/CADCRAFT/repos/cadcraft/LICENSE', path.join(ROOT, 'LICENSE')].find((p) => fs.existsSync(p));
if (!lic) { console.error('No Apache-2.0 LICENSE found to ship.'); process.exit(1); }
cp(lic, path.join(OUT, 'LICENSE'));
fs.writeFileSync(path.join(OUT, 'THIRD_PARTY.md'), '# Third-party code in @getcadcraft/mcp\n\n'
  + '## pdf-lib ' + path.basename(pl) + ' (MIT) — cli/vendor/pdf-lib/\n\n' + fs.readFileSync(path.join(pl, 'LICENSE.md'), 'utf8').trim() + '\n\n'
  + '## pdfjs-dist (Apache-2.0) — optional dependency, installed by npm, used to read PDF markups\n\nSee its own LICENSE in node_modules/pdfjs-dist.\n');
fs.writeFileSync(path.join(OUT, 'README.md'), `# @getcadcraft/mcp

CadCraft's tools for AI assistants and scripts: an MCP server (\`cadcraft-mcp\`, stdio) and a command line (\`cadcraft\`). They run the
CadCraft apps' own code with no window: DWG and DXF drawings (CadCraft), IFC models (BimCraft), takeoffs (TakeoffCraft) and PDF markups
(MarkupCraft). The apps contain no AI; your assistant brings its own, and you decide what it may touch. Node.js 20.19 or newer.

## MCP server

    npx -y @getcadcraft/mcp --root ~/Drawings --allow read,edit

- \`--root <folder>\` (repeat for more): the only folders it opens files in and writes to. Without one, no file is reachable.
- \`--allow\`: read (default) · edit (run commands and scripts; each call one undo step) · save (write drawings) · export (PDF, conversions, CSV/XLSX).
- \`--log activity.jsonl\`: every call as a JSON line. Environment: \`CADCRAFT_MCP_ROOTS\`, \`CADCRAFT_MCP_ALLOW\`.

In your assistant's MCP settings, add it as a stdio server: \`{"mcpServers": {"cadcraft": {"command": "npx", "args": ["-y", "@getcadcraft/mcp", "--root", "/Users/me/Drawings"]}}}\`

## Command line

    cadcraft info plan.dwg
    cadcraft run cleanup.scr plan.dwg -o plan-clean.dwg
    cadcraft convert plan.dwg plan.dxf --version 2018
    cadcraft plot plan.dwg plan.pdf --all
    cadcraft check plan.dwg --rules rules.json

\`--json\` on any command; exit codes 0 ok, 1 problems, 2 bad usage. Apache-2.0. https://getcadcraft.com
`);
let files = 0, bytes = 0;
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } };
walk(OUT);
console.log('packed ' + OUT + ': ' + files + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB (not published: publishing is the owner\'s)');
if (args.includes('--tgz')) console.log(execFileSync('npm', ['pack', '--pack-destination', path.dirname(OUT)], { cwd: OUT, encoding: 'utf8' }).trim().split('\n').pop());
