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
 *          cli/apps/civilcraft/ — project.js, points.js, civil-agent.js and their imports + lang/en.json + imports.json (0.7 AS.3);
 *          cli/vendor/{delaunator,robust-predicates,proj4}/<version>/ (ISC, Unlicense, MIT; LICENSE + SOURCE.txt each, as every vendor/ folder)
 *          cli/apps/partcraft/ — agents.js, part.js, kernel.js, params-part.js, cs-all.js and their imports + craftlib/ + lang/en.json
 *          (0.7 AS.4); cli/vendor/manifold-3d/<version>/ (Apache-2.0: manifold.js + .wasm) — Lua and Python runtimes are not packed;
 *          + usd-partcraft.js and illustrate/ (0.7 AS.6 illustrate_export), cli/vendor/three/<version>/ (MIT: the interactive manual's viewer)
 *          cli/lib/ifc/ (cc-ifc) · cli/vendor/pdf-lib/<version>/ (MIT) · cli/vendor/liberation-sans/<version>/ (OFL-1.1)  — pdfjs-dist is an optional dependency (PDF markups).
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

/**
 * Copy the files these entry modules import, recursively (static, side-effect and quoted dynamic imports of './…'), + lang/en.json.
 * `staticOnly`: files whose dynamic imports are not followed (they load window-only code on use: render-tools.js, 0.7 AS.6).
 */
function copyClosure(src, dst, entries, { staticOnly = [] } = {}) {
  const seen = new Set(), todo = [...entries];
  while (todo.length) {
    const f = path.normalize(todo.pop());
    if (seen.has(f) || !fs.existsSync(path.join(src, f))) continue;
    seen.add(f);
    const text = fs.readFileSync(path.join(src, f), 'utf8');
    const re = staticOnly.includes(f) ? /(?:from\s*|^\s*import\s+)['"](\.{1,2}\/[^'"]+\.m?js)['"]/gm : /(?:from\s*|import\(\s*|^\s*import\s+)['"](\.{1,2}\/[^'"]+\.m?js)['"]/gm;
    for (const m of text.matchAll(re)) todo.push(path.join(path.dirname(f), m[1]));   // + bare `import './x.js'` (cs-all.js)
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
copyClosure(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev'), path.join(OUT, 'cli/apps/bimcraft'), ['agents.js', 'ifc-edit.js', 'new-model.js'], { staticOnly: ['render-tools.js'] });
// CivilCraft (0.7 AS.3): its project and assistant tools, the libraries they import by name (as its import map maps them)
const CIVIL = path.join(ROOT, 'public_html/assets/apps/civilcraft/dev');
copyClosure(CIVIL, path.join(OUT, 'cli/apps/civilcraft'), ['project.js', 'points.js', 'civil-agent.js']);
const civilImports = JSON.parse(fs.readFileSync(path.join(CIVIL, 'manifest.json'), 'utf8')).imports || {};
const CIVIL_LIBS = ['delaunator', 'robust-predicates', 'proj4'];
fs.writeFileSync(path.join(OUT, 'cli/apps/civilcraft/imports.json'), JSON.stringify(Object.fromEntries(Object.entries(civilImports).filter(([k]) => CIVIL_LIBS.includes(k))), null, 1) + '\n');
// PartCraft (0.7 AS.4): its part, mesh kernel, assistant functions and CraftScript (+ craftlib/), manifold-3d (Apache-2.0)
const PARTC = path.join(ROOT, 'public_html/assets/apps/partcraft/dev');
// 0.7 AS.6 (illustrate_export): the Illustrate writers and the interactive file's own modules; agents.js's other dynamic imports load
// window-only code (the Illustrate workspace, the script worker client), so only the ones the headless tools use are listed here
copyClosure(PARTC, path.join(OUT, 'cli/apps/partcraft'), ['agents.js', 'part.js', 'kernel.js', 'params-part.js', 'cs-all.js', 'cs-lib-io.js', 'usd-partcraft.js',
  ...['all', 'lineart', 'pdf', 'svg', 'instructions', 'viewer-data', 'viewer-app', 'anim'].map((f) => 'illustrate/' + f + '.js')], { staticOnly: ['agents.js'] });
for (const f of fs.readdirSync(path.join(PARTC, 'craftlib'))) if (/\.(craft|m|lua|json)$/.test(f)) cp(path.join(PARTC, 'craftlib', f), path.join(OUT, 'cli/apps/partcraft/craftlib', f));
// third-party libraries as the site keeps them: cli/vendor/<lib>/<version>/ with LICENSE and SOURCE.txt (the license gate's
// layout; apps.mjs vendorDir() takes the one version folder)
const vend = (lib, pick) => {
  const real = fs.realpathSync(path.join(ROOT, 'public_html/assets/vendor', lib, 'current'));
  const dst = path.join(OUT, 'cli/vendor', lib, path.basename(real));
  const take = (rel) => { for (const e of fs.readdirSync(path.join(real, rel), { withFileTypes: true })) { const r = path.join(rel, e.name); if (e.isDirectory()) take(r); else if ((pick ? pick.includes(r) : /\.(m?js)$/.test(e.name)) || /^(LICENSE|SOURCE\.txt$)/i.test(e.name)) cp(path.join(real, r), path.join(dst, r)); } };
  take('');
  if (!fs.existsSync(path.join(dst, 'SOURCE.txt'))) fs.writeFileSync(path.join(dst, 'SOURCE.txt'), lib + ' ' + path.basename(real) + ' from npm (https://www.npmjs.com/package/' + lib + '), unmodified; copied from CadCraft\'s assets/vendor/' + lib + '/' + path.basename(real) + '/.\n');
  return real;
};
const manifoldDir = vend('manifold-3d', ['manifold.js', 'manifold.wasm']);
const threeDir = vend('three', ['three.module.js', 'three.core.js', path.join('addons', 'controls', 'OrbitControls.js')]);   // MIT: the interactive manual carries it (0.7 AS.6)
const libDirs = {};
for (const lib of CIVIL_LIBS) libDirs[lib] = vend(lib);   // robust-predicates' index.js imports its esm/ folder
copyCode(path.join(ROOT, 'lib/ifc'), path.join(OUT, 'cli/lib/ifc'));
const pl = vend('pdf-lib', ['pdf-lib.esm.js']);
// the font CadCraft's plotted PDFs embed for text outside Windows-1252 (0.6.1; plot.js, headless/cad.mjs)
const lf = vend('liberation-sans', ['LiberationSans-Regular.ttf']);
const lic = ['/var/www/CADCRAFT/repos/cadcraft/LICENSE', path.join(ROOT, 'LICENSE')].find((p) => fs.existsSync(p));
if (!lic) { console.error('No Apache-2.0 LICENSE found to ship.'); process.exit(1); }
cp(lic, path.join(OUT, 'LICENSE'));
fs.writeFileSync(path.join(OUT, 'THIRD_PARTY.md'), '# Third-party code in @getcadcraft/mcp\n\n'
  + '## pdf-lib ' + path.basename(pl) + ' (MIT) — cli/vendor/pdf-lib/\n\n' + fs.readFileSync(path.join(pl, 'LICENSE.md'), 'utf8').trim() + '\n\n'
  + '## Liberation Sans ' + path.basename(lf) + ' (SIL Open Font License 1.1) — cli/vendor/liberation-sans/\n\n' + fs.readFileSync(path.join(lf, 'LICENSE'), 'utf8').trim() + '\n\n'
  + '## three.js ' + path.basename(threeDir) + ' (MIT) — cli/vendor/three/ (copied into the interactive manuals illustrate_export writes, its notice kept)\n\n' + fs.readFileSync(path.join(threeDir, 'LICENSE'), 'utf8').trim() + '\n\n'
  + '## manifold-3d ' + path.basename(manifoldDir) + ' (Apache-2.0) — cli/vendor/manifold-3d/ (PartCraft\'s mesh kernel)\n\n' + fs.readFileSync(path.join(manifoldDir, 'LICENSE'), 'utf8').trim() + '\n\n'
  + CIVIL_LIBS.map((lib) => { const lf = fs.readdirSync(libDirs[lib]).find((f) => /^LICENSE/i.test(f)); return '## ' + lib + ' ' + path.basename(libDirs[lib]) + ' — cli/vendor/' + lib + '/ (CivilCraft)\n\n' + fs.readFileSync(path.join(libDirs[lib], lf), 'utf8').trim() + '\n\n'; }).join('')
  + '## pdfjs-dist (Apache-2.0) — optional dependency, installed by npm, used to read PDF markups\n\nSee its own LICENSE in node_modules/pdfjs-dist.\n');
fs.writeFileSync(path.join(OUT, 'README.md'), `# @getcadcraft/mcp

CadCraft's tools for AI assistants and scripts: an MCP server (\`cadcraft-mcp\`, stdio) and a command line (\`cadcraft\`). They run the
CadCraft apps' own code with no window: DWG and DXF drawings (CadCraft), IFC models (BimCraft), CivilCraft sites, PartCraft parts,
takeoffs (TakeoffCraft) and PDF markups (MarkupCraft). The apps contain no AI; your assistant brings its own, and you decide what it
may touch. Node.js 20.19 or newer.

## MCP server

    npx -y @getcadcraft/mcp --root ~/Drawings --allow read,edit

- \`--root <folder>\` (repeat for more): the only folders it opens files in and writes to. Without one, no file is reachable.
- \`--allow\`: read (default) · edit (run commands and scripts; each call one undo step) · save (write files) · export (PDF, SVG, conversions, CSV/XLSX, LandXML, STL/3MF/STEP, OpenUSD, PartCraft manuals).
- \`--log activity.jsonl\`: every call as a JSON line. Environment: \`CADCRAFT_MCP_ROOTS\`, \`CADCRAFT_MCP_ALLOW\`.

In your assistant's MCP settings, add it as a stdio server: \`{"mcpServers": {"cadcraft": {"command": "npx", "args": ["-y", "@getcadcraft/mcp", "--root", "/Users/me/Drawings"]}}}\`

What your assistant reads goes to whoever runs that assistant: a cloud assistant's maker sees the parts of the files it is shown.
Keep folders out of \`--root\` when that matters.

## Command line

    cadcraft info plan.dwg
    cadcraft run cleanup.scr plan.dwg -o plan-clean.dwg
    cadcraft convert plan.dwg plan.dxf --version 2018
    cadcraft convert *.dwg out --to dxf
    cadcraft plot plan.dwg plan.pdf --all
    cadcraft check *.dwg --rules rules.json
    cadcraft convert site.civilcraft.json site.xml
    cadcraft convert bracket.partcraft.json bracket.stl
    cadcraft convert bracket.partcraft.json bracket.usdz
    cadcraft convert linkage.partcraft-manual.json linkage.pdf
    cadcraft count kitchen.dwg --block SHELF-18X48 --sheet K-101
    cadcraft tools

\`--json\` on any command; exit codes 0 ok, 1 problems, 2 bad usage. \`cadcraft tools\` lists every tool and which ones need the app
open in CadCraft Studio. Apache-2.0. https://getcadcraft.com
`);
let files = 0, bytes = 0;
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } };
walk(OUT);
console.log('packed ' + OUT + ': ' + files + ' files, ' + (bytes / 1048576).toFixed(1) + ' MB (not published: publishing is the owner\'s)');
if (args.includes('--tgz')) console.log(execFileSync('npm', ['pack', '--pack-destination', path.dirname(OUT)], { cwd: OUT, encoding: 'utf8' }).trim().split('\n').pop());
