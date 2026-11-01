#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cadcraft-mcp — CadCraft's headless MCP server (docs/AGENTS-SPEC.md §5.1; 0.4 part 2 item X.4). MCP over stdio:
 * newline-delimited JSON-RPC 2.0 on stdin/stdout, anything else on stderr. No dependencies; Node 20.19+.
 *
 *   cadcraft-mcp --root ~/Drawings [--root …] [--allow read,edit,save,export] [--log activity.jsonl] [--verbose]
 *   (or CADCRAFT_MCP_ROOTS=<folders separated by : or ;> and CADCRAFT_MCP_ALLOW=read,edit in the environment)
 *
 * Files only inside the --root folders; tools only from the --allow groups (default read). The apps contain no AI: this
 * server gives the person's own assistant tools, and the person decides which.
 *
 * In any MCP client's settings (a stdio server):
 *   { "mcpServers": { "cadcraft": { "command": "npx", "args": ["-y", "@getcadcraft/mcp", "--root", "/Users/me/Drawings"] } } }
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createDispatcher, TOOL_GROUPS } from './core.mjs';
import { createEnv, headlessTools, headlessRollback } from '../cli/headless/tools.mjs';
import { PACKAGE_VERSION } from '../cli/headless/apps.mjs';

const HELP = `cadcraft-mcp ${PACKAGE_VERSION} — CadCraft's tools for an AI assistant (MCP over stdio)

  cadcraft-mcp --root <folder> [--root <folder> …] [--allow read,edit,save,export] [--log <file.jsonl>] [--standards <file.json>] [--verbose]
  cadcraft-mcp connect          the bridge to CadCraft Studio (what an AI app's settings launch; no token in them)
  cadcraft-mcp setup [--client <id>] [--yes] [--dry-run]    add CadCraft to the AI apps found on this computer (asks first)
  cadcraft-mcp unsetup [--client <id>] [--yes]              take it out again

  --root     a folder the assistant may open files in and write to (repeat for more). Without one, no file is reachable.
  --allow    permission groups (default read):
               read    open, describe, list, query and check drawings, IFC models, takeoffs and PDF markups; count in a DWG/DXF
               edit    run commands and scripts on open drawings, count or measure into a takeoff (each call one undo step)
               save    write drawings (DWG/DXF) back, or as new drawing files; takeoffs, sites, parts, IFC models
               export  write PDF plots, converted drawings, CSV/XLSX, OpenUSD, PartCraft exports and manuals
  --log      append every call as a JSON line (inside a --root folder or the current folder)
  --standards  the firm's standards file (JSON, under 48 KB); put in front of every prompt starter
  --verbose  also print every call on stderr

  Or in the environment: CADCRAFT_MCP_ROOTS (folders separated by ${path.delimiter}) and CADCRAFT_MCP_ALLOW (read,edit,…).
`;

function parseArgs(argv) {
  const o = { roots: [], allow: ['read'], log: null, verbose: false, standards: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => { if (i + 1 >= argv.length) throw new Error(a + ' needs a value.'); return argv[++i]; };
    if (a === '--root' || a === '-r') o.roots.push(val());
    else if (a.startsWith('--root=')) o.roots.push(a.slice(7));
    else if (a === '--allow') { o.allow = val().split(',').map((s) => s.trim()).filter(Boolean); o.allowGiven = true; }
    else if (a.startsWith('--allow=')) { o.allow = a.slice(8).split(',').map((s) => s.trim()).filter(Boolean); o.allowGiven = true; }
    else if (a === '--log') o.log = val();
    else if (a === '--standards') o.standards = val();
    else if (a === '--verbose' || a === '-v') o.verbose = true;
    else if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--version') o.version = true;
    else throw new Error('Unknown option ' + a + '. See --help.');
  }
  // the same from the environment (MCP clients' "env" settings; tools that keep a server's own flags for themselves)
  if (!o.roots.length && process.env.CADCRAFT_MCP_ROOTS) o.roots = process.env.CADCRAFT_MCP_ROOTS.split(path.delimiter).filter(Boolean);
  if (!o.allowGiven && process.env.CADCRAFT_MCP_ALLOW) o.allow = process.env.CADCRAFT_MCP_ALLOW.split(',').map((s) => s.trim()).filter(Boolean);
  if (o.allow.includes('all')) o.allow = [...TOOL_GROUPS];
  for (const g of o.allow) if (!TOOL_GROUPS.includes(g)) throw new Error('Unknown permission "' + g + '". Groups: ' + TOOL_GROUPS.join(', ') + '.');
  return o;
}

// `cadcraft-mcp connect` is the bridge to CadCraft Studio's hub (tools/mcp/bridge.mjs); `setup` writes AI apps' settings (tools/mcp/setup.mjs)
if (process.argv[2] === 'connect') {
  const { runBridge } = await import('./bridge.mjs');
  await runBridge({ input: process.stdin, output: process.stdout, log: (m) => process.stderr.write('cadcraft-mcp connect: ' + m + '\n') });
  process.exit(0);
}
if (process.argv[2] === 'openapi') {   // AC.10: the same tools as an OpenAPI 3.1 description (written when the package was packed)
  const f = new URL('./openapi.json', import.meta.url);
  if (!fs.existsSync(f)) { process.stderr.write('cadcraft-mcp: openapi.json is made when the package is packed (node tools/mcp/openapi.mjs --out file.json in the site tree).\n'); process.exit(1); }
  process.stdout.write(fs.readFileSync(f, 'utf8'));
  process.exit(0);
}
if (process.argv[2] === 'setup' || process.argv[2] === 'unsetup') {
  const { main } = await import('./setup.mjs');
  process.exit(await main(process.argv.slice(2)));
}

let opts;
try { opts = parseArgs(process.argv.slice(2)); } catch (e) { process.stderr.write('cadcraft-mcp: ' + e.message + '\n'); process.exit(2); }
if (opts.help) { process.stdout.write(HELP); process.exit(0); }
if (opts.version) { process.stdout.write(PACKAGE_VERSION + '\n'); process.exit(0); }

// stdout is the protocol: anything a library prints goes to stderr
const err = (...a) => process.stderr.write(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ') + '\n');
console.log = err; console.info = err; console.warn = err; console.debug = err;

let env;
try { env = createEnv({ roots: opts.roots, undoPrefix: 'Assistant: ' }); } catch (e) { err('cadcraft-mcp: ' + e.message); process.exit(2); }

let logFile = null;
if (opts.log) {
  const abs = path.resolve(opts.log);
  const dir = fs.realpathSync(path.dirname(abs));
  const okDir = env.roots.rootOf(dir) || dir === fs.realpathSync(process.cwd());
  if (!okDir) { err('cadcraft-mcp: --log must be inside a --root folder or the current folder.'); process.exit(2); }
  logFile = path.join(dir, path.basename(abs));
}

const allowed = new Set(opts.allow);
const d = createDispatcher({
  server: { name: 'cadcraft', title: 'CadCraft', version: PACKAGE_VERSION },
  allowed: () => allowed,
  rollback: headlessRollback(env),   // previews of command_run, script_run and block_insert on a drawing
  howToAllow: (g) => 'The person can restart the server with --allow ' + [...new Set([...allowed, g])].join(',') + '.',
  instructions: () => 'CadCraft tools for DWG/DXF drawings (CadCraft), IFC models (BimCraft), CivilCraft sites, PartCraft parts and manuals, takeoffs (TakeoffCraft, on PDFs or straight from a DWG/DXF) and PDF markups (MarkupCraft). '
    + 'Files: only inside ' + (env.roots.any ? env.roots.list.join(', ') : 'no folders (no --root was given)') + '. Allowed: ' + [...allowed].join(', ') + '. '
    + 'Open a file first (drawing_open, ifc_open, site_open, part_open, takeoff_open — a .takeoff.json or a .dwg/.dxf for the cad_* tools; markups_list and illustrate_export take a path) and pass the handle it returns. command_run types at CadCraft\'s command line, one prompt answer per list item; every edit is one undo step labelled "Assistant: …".',
  log: (entry) => {
    if (logFile) { try { fs.appendFileSync(logFile, JSON.stringify(entry) + '\n'); } catch (e) { err('cadcraft-mcp: could not write the log: ' + e.message); } }
    if (opts.verbose) err('[' + entry.time + '] ' + entry.tool + ' ' + entry.outcome + ' ' + entry.ms + ' ms' + (entry.message ? ' — ' + entry.message : ''));
  },
});
for (const t of headlessTools(env)) d.tool(t);

// Skill packs and prompt starters as MCP prompts/resources (AC.5, packs.mjs), and the firm's standards from --standards (AC.14). The files sit
// beside this one in the npm package and under public_html/assets/js in the repo.
const sibling = async (name, ...repoRel) => { for (const rel of ['./' + name, ...repoRel]) { try { return await import(new URL(rel, import.meta.url).href); } catch { /* try the next place */ } } return null; };
const packsMod = await sibling('packs.mjs'), skillMod = await sibling('skill-packs.js', '../../public_html/assets/js/skill-packs.js');
if (packsMod && skillMod && Array.isArray(skillMod.PACKS)) {
  let standards = null;
  if (opts.standards) {
    const stdMod = await sibling('ai-standards.js', '../../public_html/assets/js/ai-standards.js');
    try {
      const file = path.resolve(opts.standards);
      if (fs.statSync(file).size > 48 * 1024) throw new Error('over 48 KB');
      const text = fs.readFileSync(file, 'utf8');
      if (stdMod && stdMod.cleanStandards) { const r0 = stdMod.cleanStandards(text); if (!r0.standards) throw new Error(r0.problems.join(' ')); standards = { get: () => r0.standards, text: (s1, app) => stdMod.standardsText(s1, app) }; }
    } catch (e) { err('cadcraft-mcp: could not read --standards ' + opts.standards + ': ' + e.message); process.exit(2); }
  }
  packsMod.mountPacks(d, { packs: skillMod.PACKS, standards });
}

err('cadcraft-mcp ' + PACKAGE_VERSION + ': folders ' + (env.roots.any ? env.roots.list.join(', ') : '(none — no file access)') + '; allowed: ' + [...allowed].join(', ') + '.');

const session = { id: 'stdio' };
const send = (msg) => { if (msg) process.stdout.write(JSON.stringify(msg) + '\n'); };
let queue = Promise.resolve();
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); return; }
  if (Array.isArray(msg)) { send({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Batches are not supported' } }); return; }
  if (msg && msg.method === 'ping' && msg.id !== undefined) { send({ jsonrpc: '2.0', id: msg.id, result: {} }); return; }   // never queued behind a long call
  queue = queue.then(() => d.handle(msg, session)).then(send, (e) => send({ jsonrpc: '2.0', id: msg && msg.id !== undefined ? msg.id : null, error: { code: -32603, message: String(e && e.message || e) } }));
});
rl.on('close', () => { queue.then(() => process.exit(0)); });
