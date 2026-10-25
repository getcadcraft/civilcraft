/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools.mjs — the headless tools (docs/AGENTS-SPEC.md §5.1), shared by the MCP server (tools/mcp/server.mjs) and the CLI.
 *
 *   const env = createEnv({ roots: ['~/Drawings'], undoPrefix: 'Assistant: ' });
 *   for (const t of headlessTools(env)) dispatcher.tool(t);
 *
 * Open files are kept by handle ('d1', 'd2', …; 16 at most). Files only inside env.roots (paths.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';
import { Roots, PathError, writeFileAtomic, listFiles } from './paths.mjs';
import { CadSession, extOf } from './cad.mjs';
import { load, appDir, vendorDir } from './apps.mjs';

// BimCraft's Draw edits (0.6 DF.25, session `bim-draw`): the same tool definitions as its live window (bimcraft/dev/agents.js),
// each given a `doc` handle here. A build without them (an older package) simply lists none.
let BIM = null;
// block_insert's arguments: the live window's (cadcraft/dev/agents.js), so both paths take the same ones
const BLOCK_SCHEMA = () => JSON.parse(JSON.stringify(CAD_AGENTS.BLOCK_INSERT_SCHEMA));
const CAD_AGENTS = await load('cadcraft', 'agents.js');
// param_set's arguments: the live window's (partcraft/dev/agents.js)
const M_PART_SCHEMA = () => JSON.parse(JSON.stringify(PART_AGENTS.PARAM_SET_SCHEMA));
let PART_AGENTS = null;
try { PART_AGENTS = await load('partcraft', 'agents.js'); } catch { PART_AGENTS = null; }
// CivilCraft (0.7 AS.3): its project and tools from the build (civil.mjs); a package without them lists none
let CIVIL = null, M_CIVIL = null;
try { CIVIL = await import('./civil.mjs'); M_CIVIL = await CIVIL.civilModules(); } catch { CIVIL = null; }
// PartCraft (0.7 AS.4): its part, mesh kernel and assistant functions (part.mjs); a package without them lists none
let PART = null;
try { PART = await import('./part.mjs'); await PART.partModules(); } catch { PART = null; }
try { BIM = await load('bimcraft', 'agents.js'); } catch { BIM = null; }
// TakeoffCraft (0.7 AS.6): the window's CAD counting and measuring functions (agents.js); a package without them lists none
let TAKEOFF_AGENTS = null;
try { TAKEOFF_AGENTS = await load('takeoffcraft', 'agents.js'); } catch { TAKEOFF_AGENTS = null; }

/**
 * What the app windows offer (each app's dev/agents.js) that this server does not, and why (0.7 AS.1). `cadcraft tools`
 * prints it; bin/test-agents.mjs checks it against every agents.js, so a new live tool must be listed here or get a
 * headless twin. `same` = live name → the headless tool that does it.
 */
export const WINDOW_ONLY = {
  cadcraft: { same: {}, only: ['app_info', 'selection_get', 'selection_set', 'view_describe', 'view_screenshot'], why: 'they work on what is on screen' },
  bimcraft: { same: { model_save: 'ifc_save' }, only: ['app_info', 'selection_get', 'selection_set', 'usd_export', 'render_still', 'render_queue'], why: 'they work on what is on screen (USD is written from the 3D view\'s triangles; renders need the window\'s graphics card)' },
  takeoffcraft: { same: { sheets_list: 'takeoff_open', items_list: 'takeoff_open', cad_sheets: 'takeoff_open' }, only: ['app_info', 'marks_add', 'usd_export'], why: 'marks by points need the PDF page the window shows, and the 3D check model needs the open sheet (on a DWG / DXF: cad_count_add and cad_measure work here too)' },
  markupcraft: { same: { sheets_list: 'markups_list' }, only: ['app_info', 'markup_add', 'markup_status', 'markup_reply', 'markups_export'], why: 'markups are changed and exported in the window (saving a PDF with markups headless is not built)' },
  modelcraft: { same: {}, only: '*', why: 'ModelCraft has no headless tools yet (render_still and render_queue need the window\'s graphics card)' },
  detailcraft: { same: {}, only: '*', why: 'DetailCraft has no headless tools yet' },
  civilcraft: { same: {}, only: ['points_select', 'project_save', 'dwg_export'], why: 'selecting is on screen; the window\'s Save and its DWG drawing (made from its panels) need the window — headless: site_save; LandXML is also opened only in the window' },
  partcraft: { same: {}, only: ['app_info'], why: 'it describes the window' },
};

/**
 * The interactive manual's module sources read from disk (viewer-data.js BUNDLE: illustrate/ files of PartCraft's build, three.js
 * from its vendor folder) and three.js's licence. Used by illustrate_export and `cadcraft convert <manual> <out.html>`.
 */
export function manualSources() {
  const il = path.join(appDir('partcraft'), 'illustrate');
  const three = vendorDir('three');
  const SPEC = { three: 'three.module.js', 'three/addons/controls/OrbitControls.js': 'addons/controls/OrbitControls.js' };
  const loadSource = async (b) => {
    if (b.own) return fs.readFileSync(path.join(il, b.own), 'utf8');
    if (!three) throw new Error('The interactive file needs three.js (its vendor folder), which this copy of the tools does not have.');
    const f = b.file || SPEC[b.spec];
    if (!f) throw new Error('Unknown viewer module ' + b.spec + '.');
    return fs.readFileSync(path.join(three, f), 'utf8');
  };
  const licence = three && fs.existsSync(path.join(three, 'LICENSE')) ? fs.readFileSync(path.join(three, 'LICENSE'), 'utf8') : '';
  return { loadSource, licence };
}

export const MAX_OPEN = 16;
export const MAX_FILE = 500 * 1024 * 1024;

export function createEnv({ roots = [], undoPrefix = 'Assistant: ' } = {}) {
  return { roots: roots instanceof Roots ? roots : new Roots(roots), undoPrefix, docs: new Map(), seq: 0, mine: new Set() };
}

const S = {
  doc: { type: 'string', pattern: '^d[0-9]{1,6}$', description: 'A handle from drawing_open, ifc_open, takeoff_open, site_open or part_open.' },
  path: { type: 'string', minLength: 1, maxLength: 4096, description: 'A file inside the folders the assistant may use (relative = inside the first one).' },
  offset: { type: 'integer', minimum: 0, default: 0 },
  overwrite: { type: 'boolean', default: false, description: 'Replace a file that already exists (and was not opened or written in this session).' },
};
const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const box = { type: 'object', properties: { minX: { type: 'number' }, minY: { type: 'number' }, maxX: { type: 'number' }, maxY: { type: 'number' } }, required: ['minX', 'minY', 'maxX', 'maxY'], additionalProperties: false };
const inputItem = { anyOf: [
  { type: 'string', maxLength: 10000 },
  obj({ pick: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, shift: { type: 'boolean' } }, ['pick']),
  obj({ window: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4 }, crossing: { type: 'boolean' } }, ['window']),
  obj({ entity: { type: 'integer', minimum: 1 }, at: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 }, shift: { type: 'boolean' } }, ['entity']),
  obj({ escape: { type: 'boolean', const: true } }, ['escape']),
] };

function readFile(env, p) {
  const real = env.roots.read(p);
  const st = fs.statSync(real);
  if (st.size > MAX_FILE) throw new Error(path.basename(real) + ' is ' + Math.round(st.size / 1048576) + ' MB; the limit is ' + MAX_FILE / 1048576 + ' MB.');
  return { real, bytes: new Uint8Array(fs.readFileSync(real)) };
}

function keep(env, kind, session, real) {
  if (env.docs.size >= MAX_OPEN) throw new Error(MAX_OPEN + ' files are open. Close one with doc_close first.');
  const id = 'd' + ++env.seq;
  env.docs.set(id, { kind, s: session, path: real });
  env.mine.add(real);
  return id;
}

function get(env, id, kind) {
  const d = env.docs.get(id);
  const OPENER = { cad: 'drawing_open', ifc: 'ifc_open', takeoff: 'takeoff_open', civil: 'site_open', part: 'part_open' }, WHAT = { cad: 'a drawing', ifc: 'an IFC model', takeoff: 'a takeoff', civil: 'a civil site', part: 'a part' };
  if (!d) throw new Error('No open file ' + id + '. Open one first (' + (OPENER[kind] || 'drawing_open') + ').');
  if (kind && d.kind !== kind) throw new Error(id + ' is ' + WHAT[d.kind] + ', not ' + WHAT[kind] + '.');
  return d;
}

function write(env, p, bytes, { overwrite = false, ext = null } = {}) {
  const real = env.roots.write(p, { overwrite, mine: env.mine });
  if (ext && extOf(real) !== ext) throw new Error('The file name must end in .' + ext + '.');
  writeFileAtomic(real, bytes);
  env.mine.add(real);
  return real;
}

const FORMAT_OF = { dwg: 'dwg', dxf: 'dxf' };

/** Format + DWG version for a target file name. */
function targetFormat(out, format, version) {
  const ext = extOf(out);
  if (!['dwg', 'dxf'].includes(ext)) throw new Error('Drawings are written as .dwg or .dxf.');
  const f = format || (ext === 'dxf' ? 'dxf2000' : 'dwg');
  if ((f === 'dwg') !== (ext === 'dwg')) throw new Error('Format ' + f + ' is written to a .' + (f === 'dwg' ? 'dwg' : 'dxf') + ' file.');
  return { format: f, version: version || '2018' };
}

export function headlessTools(env) {
  const tools = [];
  const T = (t) => tools.push(t);
  let civilUsdRun = null;

  T({ name: 'files_list', group: 'read', title: 'List files',
    description: 'Files in a folder the assistant may use, newest first (up to 2000). Hidden files and links are skipped.',
    inputSchema: obj({ folder: { ...S.path, description: 'A folder inside the allowed ones; default the first allowed folder.' }, extensions: { type: 'array', items: { type: 'string', maxLength: 12 }, maxItems: 20, description: 'e.g. ["dwg", "dxf"]' }, recursive: { type: 'boolean', default: false } }),
    run: async (a) => {
      const r = listFiles(env.roots, a.folder, { extensions: a.extensions, recursive: a.recursive });
      return { folder: r.folder, folders: env.roots.list, files: r.files, truncated: r.truncated };
    } });

  T({ name: 'drawing_open', group: 'read', title: 'Open a drawing',
    description: 'Open a DWG or DXF drawing with CadCraft. Returns a handle (d1, …) for the other drawing tools and a short summary.',
    inputSchema: obj({ path: S.path }, ['path']),
    run: async (a) => {
      const { real, bytes } = readFile(env, a.path);
      const s = await CadSession.open(bytes, real, { undoPrefix: env.undoPrefix });
      const doc = keep(env, 'cad', s, real);
      const dsc = s.describe();
      return { doc, path: real, name: dsc.name, format: dsc.format, objects: dsc.objects, layers: dsc.layers.length, sheets: dsc.layouts.map((l) => l.name), units: dsc.units, notes: dsc.notes.slice(0, 10) };
    } });

  T({ name: 'drawing_new', group: 'edit', title: 'Start a new drawing',
    description: 'A new, empty drawing in memory (save it with drawing_save and a path).',
    inputSchema: obj({ name: { type: 'string', maxLength: 120, default: 'Drawing1' } }),
    run: async (a) => {
      const s = await CadSession.blank({ undoPrefix: env.undoPrefix });
      s.doc.meta.name = a.name;
      return { doc: keep(env, 'cad', s, null) };
    } });

  T({ name: 'drawing_describe', group: 'read', title: 'Describe a drawing',
    description: 'Units and length format, extents, the layer table (state and object counts), blocks and their uses, objects by type, sheets with their viewports, views, notes from reading the file.',
    inputSchema: obj({ doc: S.doc }, ['doc']),
    run: async (a) => get(env, a.doc, 'cad').s.describe() });

  T({ name: 'objects_list', group: 'read', title: 'List objects',
    description: 'Objects in an open drawing, filtered and paged: each with its id, type, layer, colour, geometry, length/area where it has one, and a one-line description. Coordinates are drawing units.',
    inputSchema: obj({ doc: S.doc, type: { type: 'string', enum: ['line', 'circle', 'arc', 'poly', 'ellipse', 'text', 'point', 'insert', 'hatch', 'dim', 'viewport', 'mleader', 'spline', 'face3d', 'image', 'wipeout'] }, layer: { type: 'string', maxLength: 255 }, block: { type: 'string', maxLength: 255, description: 'References of this block only.' }, text: { type: 'string', maxLength: 200, description: 'Texts (and attribute values) containing this.' }, within: { ...box, description: 'Only objects entirely inside this box.' }, space: { type: 'string', maxLength: 255, description: '"model" (default) or a sheet name.' }, offset: S.offset, limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }, countOnly: { type: 'boolean', default: false, description: 'Only the total, by type and by layer (no objects).' } }, ['doc']),
    run: async (a) => get(env, a.doc, 'cad').s.objects(a) });

  T({ name: 'object_get', group: 'read', title: 'Get one object',
    description: 'One object in full (every field, block attributes and the block definition of a reference).',
    inputSchema: obj({ doc: S.doc, id: { type: 'integer', minimum: 1 } }, ['doc', 'id']),
    run: async (a) => { const o = get(env, a.doc, 'cad').s.object(a.id); if (!o) throw new Error('There is no object ' + a.id + '.'); return o; } });

  T({ name: 'drawing_check', group: 'read', title: 'Check against standards',
    description: 'Check a drawing against layer and drafting rules: layers.allowed (names or /regex/), layers.required, layers.noObjectsOn, objects.colorByLayer / linetypeByLayer / lineweightByLayer, objects.textHeights, objects.textStyles, blocks.noUnused, units.lunits / units.insunits. Returns each finding with the ids it concerns.',
    inputSchema: obj({ doc: S.doc, rules: { type: 'object', properties: {
      layers: obj({ allowed: { type: 'array', items: { type: 'string' }, maxItems: 500 }, required: { type: 'array', items: { type: 'string' }, maxItems: 500 }, noObjectsOn: { type: 'array', items: { type: 'string' }, maxItems: 50 } }),
      objects: obj({ colorByLayer: { type: 'boolean' }, linetypeByLayer: { type: 'boolean' }, lineweightByLayer: { type: 'boolean' }, textHeights: { type: 'array', items: { type: 'number' }, maxItems: 50 }, textStyles: { type: 'array', items: { type: 'string' }, maxItems: 50 } }),
      blocks: obj({ noUnused: { type: 'boolean' } }),
      units: obj({ lunits: { type: 'integer', minimum: 1, maximum: 5 }, insunits: { type: 'string', maxLength: 40 } }),
    }, additionalProperties: false } }, ['doc', 'rules']),
    run: async (a) => get(env, a.doc, 'cad').s.check(a.rules) });

  T({ name: 'command_run', group: 'edit', title: 'Run a CadCraft command',
    description: 'Type at CadCraft\'s command line: one string, or a list where each item answers the next prompt ("" = Enter). Items may also be {pick: [x, y]}, {window: [x1, y1, x2, y2], crossing}, {entity: id} or {escape: true}. Example: ["LINE", "0,0", "@100,0", "@0,50", ""]. A command still waiting at the end is ended with Esc unless keepOpen. One string is read as typed at the command line: each line and each space ends an answer, as Space does there (two spaces = an empty answer; a text prompt takes the rest of the line), e.g. "LINE 0,0 @100,0 @0,50 " (the last space ends LINE). A list gives one answer per item instead. The whole call is one undo step labelled "Assistant: …". Commands that need a dialog on screen are refused.',
    inputSchema: obj({ doc: S.doc, input: { anyOf: [{ type: 'string', maxLength: 100000 }, { type: 'array', items: inputItem, minItems: 1, maxItems: 5000 }] }, select: { type: 'array', items: { type: 'integer', minimum: 1 }, maxItems: 100000, description: 'Object ids selected before the command (noun-verb).' }, openFiles: { type: 'array', items: S.path, minItems: 1, maxItems: 20, description: 'Files (inside the allowed folders) that answer the file questions the commands ask, in order: INSERT F, XATTACH, ASBUILT\'s point file.' }, keepOpen: { type: 'boolean', default: false, description: 'Leave a command that still waits after the last answer open (the result says what it waits for); the next command_run with continue: true answers it. Each call is still one undo step.' }, continue: { type: 'boolean', default: false, description: 'Answer the command a keepOpen call left waiting, instead of starting at the command prompt.' } }, ['doc', 'input']),
    run: async (a) => {
      const s = get(env, a.doc, 'cad').s;
      if (a.continue && !s.held) throw new Error('No command is waiting for the assistant: leave one open with keepOpen: true first.');
      const files = (a.openFiles || []).map((p) => { const { real, bytes } = readFile(env, p); return { name: path.basename(real), path: real, bytes }; });
      const r = await s.run(a.input, { select: a.select, keepOpen: a.keepOpen, resume: a.continue, files });
      if (files.length) r.filesOpened = s.filesUsed.slice();
      return { ...r, added: r.added.slice(0, 2000), changed: r.changed.slice(0, 2000), removed: r.removed.slice(0, 2000), counts: { added: r.added.length, changed: r.changed.length, removed: r.removed.length } };
    } });

  T({ name: 'script_run', group: 'edit', title: 'Run a script',
    description: 'On a drawing: run a script as one undo step, language "scr" (command-line lines, as a .scr file) or "lisp" (AutoLISP-style, run by CadCraft\'s own interpreter; (command …) drives CadCraft\'s commands). On a part (part_open): a CraftScript ("craft", the default there), Lua or Python script, sealed (no files, no network), with `part` = the built solid and param()/params() its parameters; it prints and displays, the part does not change. Lua and Python need their runtimes beside these tools (the repository), CraftScript runs everywhere.',
    inputSchema: obj({ doc: S.doc, script: { type: 'string', minLength: 1, maxLength: 1000000 }, language: { type: 'string', enum: ['scr', 'lisp', 'craft', 'lua', 'python'] }, budget: { type: 'number', minimum: 1e3, maximum: 1e11, default: 2e9 } }, ['doc', 'script']),
    run: async (a) => {
      const d0 = get(env, a.doc);
      if (d0.kind === 'part') {
        const lang = a.language || 'craft';
        if (!['craft', 'lua', 'python'].includes(lang)) throw new Error('A part runs CraftScript ("craft"), Lua or Python scripts.');
        return d0.s.script(a.script, { lang, file: 'assistant.' + ({ craft: 'craft', lua: 'lua', python: 'py' }[lang]), budget: a.budget });
      }
      if (a.language && !['scr', 'lisp'].includes(a.language)) throw new Error('A drawing runs "scr" or "lisp" scripts.');
      const s = get(env, a.doc, 'cad').s;
      const r = a.language === 'lisp' ? await s.runLisp(a.script) : await s.run(a.script, { label: 'SCRIPT' });   // a .scr reads as typed: a space is Enter
      return { ...r, added: r.added.slice(0, 2000), changed: r.changed.slice(0, 2000), removed: r.removed.slice(0, 2000), counts: { added: r.added.length, changed: r.changed.length, removed: r.removed.length } };
    } });

  T({ name: 'block_insert', group: 'edit', title: 'Insert a block',
    description: 'Place a block of the drawing at a point with its attribute values in one call (as INSERT does, its questions answered), optionally on a layer; one undo step. A block from another drawing: command_run with ["INSERT", "F", …] and openFiles.',
    inputSchema: (() => { const sc = BLOCK_SCHEMA(); return { ...sc, properties: { doc: S.doc, ...sc.properties }, required: ['doc', ...sc.required] }; })(),
    run: async (a) => { const { doc, ...o } = a; const r = await get(env, doc, 'cad').s.insert(o); if (!r.id) throw new Error(r.error || 'The block was not placed.'); return r; } });

  T({ name: 'undo', group: 'edit', title: 'Undo',
    description: 'Undo the assistant\'s last steps on a drawing, an IFC model, a civil site, a part or a takeoff (only steps labelled "Assistant:" unless any is true).',
    inputSchema: obj({ doc: S.doc, steps: { type: 'integer', minimum: 1, maximum: 100, default: 1 }, any: { type: 'boolean', default: false } }, ['doc']),
    run: async (a) => {
      const d = get(env, a.doc);
      if (d.kind === 'ifc') return { undone: await d.s.undo(a.steps, { any: a.any }) };
      if (d.kind === 'part') return { undone: d.s.undo(a.steps, { any: a.any, prefix: env.undoPrefix }) };   // 0.7 AS.4
      if (d.kind === 'takeoff') {   // 0.7 AS.6: the takeoff's own undo (only the assistant's steps unless any)
        const t = d.s.model, undone = [];
        for (let i = 0; i < a.steps; i++) { const top = t.undoStack[t.undoStack.length - 1]; if (!top || (!a.any && !String(top.label).startsWith(env.undoPrefix))) break; undone.push(t.undo()); }
        return { undone };
      }
      if (d.kind === 'civil') {   // CivilCraft's project undo (0.7 AS.3): only the assistant's steps unless any
        const p = d.s.project, undone = [];
        for (let i = 0; i < a.steps; i++) {
          const top = p.undoStack[p.undoStack.length - 1];
          if (!top || (!a.any && !String(top.label).startsWith(env.undoPrefix))) break;
          p.undo(); undone.push(top.label);
        }
        return { undone };
      }
      return { undone: get(env, a.doc, 'cad').s.undo(a.steps, { any: a.any }) };
    } });

  T({ name: 'drawing_save', group: 'save', title: 'Save a drawing',
    description: 'Write the drawing: to its own file (default) or to a new .dwg/.dxf path. format dwg | dxf2000 | dxf (R12); DWG version 2000, 2004, 2007, 2010, 2013 or 2018 (default 2018).',
    inputSchema: obj({ doc: S.doc, path: S.path, format: { type: 'string', enum: ['dwg', 'dxf2000', 'dxf'] }, version: { type: 'string', enum: ['2000', '2004', '2007', '2010', '2013', '2018'] }, overwrite: S.overwrite }, ['doc']),
    run: async (a) => {
      const d = get(env, a.doc, 'cad');
      const target = a.path || d.path;
      if (!target) throw new Error('This drawing has no file yet: give a path.');
      const { format, version } = targetFormat(target, a.format, a.version);
      const r = d.s.save(format, { version });
      const real = write(env, target, r.bytes, { overwrite: a.overwrite });
      d.s.doc.markSaved();
      if (!d.path) d.path = real;
      return { path: real, bytes: r.bytes.length, format: r.format, notes: r.notes };
    } });

  T({ name: 'drawing_convert', group: 'export', title: 'Convert a drawing',
    description: 'Read a DWG/DXF and write it as another .dwg (version) or .dxf (DXF 2000, or R12 with format dxf). The original is not changed.',
    inputSchema: obj({ path: S.path, out: S.path, format: { type: 'string', enum: ['dwg', 'dxf2000', 'dxf'] }, version: { type: 'string', enum: ['2000', '2004', '2007', '2010', '2013', '2018'] }, overwrite: S.overwrite }, ['path', 'out']),
    run: async (a) => {
      const { real, bytes } = readFile(env, a.path);
      const s = await CadSession.open(bytes, real);
      const { format, version } = targetFormat(a.out, a.format, a.version);
      const r = s.save(format, { version });
      const out = write(env, a.out, r.bytes, { overwrite: a.overwrite });
      return { from: real, out, bytes: r.bytes.length, format: r.format, objects: s.doc.count(), notes: r.notes };
    } });

  T({ name: 'drawing_plot', group: 'export', title: 'Plot to PDF',
    description: 'A vector PDF (or SVG, by the file name) of a sheet (layout, as set up) or of the model (extents or a window, on a paper at a scale or fitted). The SVG is the plot preview\'s picture in mm, pictures left out. PNG is not made: convert the SVG or PDF. Papers: iso-a4 … iso-a0, letter, legal, ansi-b … ansi-d, arch-c … arch-e. Scales "1:50", "1/4\\" = 1\'-0\\"" or "fit".',
    inputSchema: obj({ doc: S.doc, out: S.path, layout: { type: 'string', maxLength: 255 }, window: box, paper: { type: 'string', enum: ['iso-a4', 'iso-a3', 'iso-a2', 'iso-a1', 'iso-a0', 'letter', 'legal', 'ansi-b', 'ansi-c', 'ansi-d', 'arch-c', 'arch-d', 'arch-e'], default: 'iso-a3' }, portrait: { type: 'boolean', default: false }, scale: { type: 'string', maxLength: 40, default: 'fit' }, mono: { type: 'boolean', default: true }, pen: { type: 'number', minimum: 0.05, maximum: 2, default: 0.25 }, overwrite: S.overwrite }, ['doc', 'out']),
    run: async (a) => {
      const d = get(env, a.doc, 'cad');
      if (!/^(pdf|svg)$/.test(extOf(a.out))) throw new Error('The plot is written to a .pdf or .svg file' + (extOf(a.out) === 'png' ? ' (PNG is not made: convert the SVG or PDF).' : '.'));
      const r = await d.s.plot({ layout: a.layout || null, area: a.window || 'extents', paper: a.paper, portrait: a.portrait, scale: a.scale, mono: a.mono, pen: a.pen, svg: extOf(a.out) === 'svg' });
      const out = write(env, a.out, r.bytes, { overwrite: a.overwrite });
      return { out, bytes: r.bytes.length, sheetMm: { w: r.sheet.w, h: r.sheet.h }, scale: r.sheet.scale, fitsOnPaper: r.sheet.fits, unprintableCharacters: r.missing };
    } });

  T({ name: 'usd_export', group: 'export', title: 'Export USD',
    description: 'OpenUSD (.usda, .usdc or .usdz, by the file name): the 3D model of an open drawing (solids on the 3D tab), or the 3D site of an open CivilCraft site (existing ground, graded surface, pads, corridors, pipes).',
    inputSchema: obj({ doc: S.doc, path: { ...S.path, description: 'The .usdz, .usda or .usdc file to write (inside the allowed folders).' }, overwrite: S.overwrite }, ['path']),
    run: async (a) => {
      const d = env.docs.get(a.doc);
      if (d?.kind === 'civil' && civilUsdRun) return civilUsdRun(a);
      const dd = get(env, a.doc, 'cad');
      const format = extOf(a.path);
      if (!/^usd[acz]$/.test(format)) throw new Error('A USD file ends in .usda, .usdc or .usdz.');
      const r = await dd.s.usd({ format, name: path.basename(a.path).replace(/\.[^.]+$/, '') });
      const out = write(env, a.path, r.bytes, { overwrite: a.overwrite });
      return { path: out, format, bytes: r.bytes.length, report: r.report };
    } });

  T({ name: 'doc_close', group: 'read', title: 'Close a file',
    description: 'Forget an open drawing, model or takeoff (unsaved changes are dropped).',
    inputSchema: obj({ doc: S.doc }, ['doc']),
    run: async (a) => { get(env, a.doc); env.docs.delete(a.doc); return { closed: a.doc }; } });

  // ---- BimCraft (IFC) ----
  T({ name: 'ifc_open', group: 'read', title: 'Open an IFC model',
    description: 'Open an IFC model (IFC2X3, IFC4, IFC4X3) for questions: schema, project, storeys, element classes. Geometry is not built.',
    inputSchema: obj({ path: S.path }, ['path']),
    run: async (a) => {
      const { IfcSession } = await import('./ifc.mjs');
      const { real, bytes } = readFile(env, a.path);
      const s = await IfcSession.open(bytes, real);
      return { doc: keep(env, 'ifc', s, real), ...s.summary() };
    } });

  T({ name: 'ifc_query', group: 'read', title: 'Find IFC elements',
    description: 'Elements of an open IFC model by class (subclasses included, e.g. IfcWall finds IfcWallStandardCase), storey name, name (contains) and a property (its set optional; equals or contains; type properties count). Paged.',
    inputSchema: obj({ doc: S.doc, class: { type: 'string', pattern: '^[A-Za-z0-9]{3,80}$' }, storey: { type: 'string', maxLength: 255 }, name: { type: 'string', maxLength: 255 }, property: obj({ set: { type: 'string', maxLength: 255 }, name: { type: 'string', minLength: 1, maxLength: 255 }, equals: { type: ['string', 'number', 'boolean'] }, contains: { type: 'string', maxLength: 255 } }, ['name']), offset: S.offset, limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 } }, ['doc']),
    run: async (a) => get(env, a.doc, 'ifc').s.query({ cls: a.class, storey: a.storey, name: a.name, property: a.property, offset: a.offset, limit: a.limit }) });

  T({ name: 'ifc_properties', group: 'read', title: 'IFC element properties',
    description: 'Attributes, property sets and quantities of one element (by its line id from ifc_query), and its type\'s property sets.',
    inputSchema: obj({ doc: S.doc, id: { type: 'integer', minimum: 1 } }, ['doc', 'id']),
    run: async (a) => get(env, a.doc, 'ifc').s.properties(a.id) });

  // ---- BimCraft: drawing in an IFC model (0.6 DF.25) ----
  if (BIM?.modelTools) {
    T({ name: 'ifc_new', group: 'edit', title: 'Start a new building',
      description: 'A new IFC4 building in memory, as BimCraft\'s File › New building makes it: a site, a building and levels (default 2 levels, 3000 mm apart). Draw in it with walls_add and the other BimCraft tools, then save it with ifc_save and a path.',
      inputSchema: obj({ name: { type: 'string', minLength: 1, maxLength: 120, default: 'Building' }, levels: { type: 'integer', minimum: 1, maximum: 100, default: 2 }, height: { type: 'number', minimum: 1000, maximum: 20000, default: 3000 } }),
      run: async (a) => {
        const { IfcSession } = await import('./ifc.mjs');
        const s = await IfcSession.blank({ name: a.name || 'Building', levels: a.levels || 2, height: a.height || 3000 });
        s.undoPrefix = env.undoPrefix;
        return { doc: keep(env, 'ifc', s, null), ...s.summary() };
      } });
    // each BimCraft tool, on the model a handle names (one undo step per edit, as in the window)
    const bimEnv = (s) => ({ ed: () => s.ed, apply: (label, op) => s.apply(label, op) });
    for (const def of BIM.modelTools(bimEnv(null))) {
      const schema = def.inputSchema || obj({});
      T({ ...def, description: def.description + ' Works on an IFC model opened with ifc_open or ifc_new (doc).',
        inputSchema: { ...schema, properties: { doc: S.doc, ...schema.properties }, required: ['doc', ...(schema.required || [])] },
        run: async (a) => {
          const d = get(env, a.doc, 'ifc');
          await d.s.editor();
          d.s.undoPrefix = env.undoPrefix;
          const { doc, ...rest } = a;
          return BIM.modelTools(bimEnv(d.s)).find((t) => t.name === def.name).run(rest);
        } });
    }
    T({ name: 'ifc_save', group: 'save', title: 'Save an IFC model',
      description: 'Write an IFC model with every change: to its own file (default) or a new .ifc path.',
      inputSchema: obj({ doc: S.doc, path: S.path, overwrite: S.overwrite }, ['doc']),
      run: async (a) => {
        const d = get(env, a.doc, 'ifc');
        const target = a.path || d.path;
        if (!target) throw new Error('This model has no file yet: give a path.');
        if (extOf(target) !== 'ifc') throw new Error('IFC models are written to a .ifc file.');
        const bytes = await d.s.save();
        const real = write(env, target, bytes, { overwrite: a.overwrite });
        if (!d.path) d.path = real;
        return { path: real, bytes: bytes.length };
      } });
  }

  // ---- CivilCraft (0.7 AS.3): the live window's tools (civil-agent.js) on a project a handle names ----
  if (CIVIL) {
    T({ name: 'site_open', group: 'read', title: 'Open a civil site',
      description: 'Open a CivilCraft project (.civilcraft.json) or a points file (.csv, .txt: PNEZD and the other orders, as CivilCraft reads them) for the CivilCraft tools. Returns a handle and what site_describe says. LandXML is opened in the CivilCraft window for now.',
      inputSchema: obj({ path: S.path }, ['path']),
      run: async (a) => {
        const { real, bytes } = readFile(env, a.path);
        const s = await CIVIL.CivilSession.open(bytes, real);
        const doc = keep(env, 'civil', s, real);
        return { doc, path: real, notes: s.notes.slice(0, 10), ...civilApp(s).describe() };
      } });
    T({ name: 'site_new', group: 'edit', title: 'Start a new civil site',
      description: 'An empty CivilCraft project in memory (units ft = US survey feet, or m); add points with points_add, save with site_save and a path.',
      inputSchema: obj({ name: { type: 'string', minLength: 1, maxLength: 120, default: 'Site' }, units: { type: 'string', enum: ['ft', 'm'], default: 'ft' } }),
      run: async (a) => { const s = await CIVIL.CivilSession.blank(a); return { doc: keep(env, 'civil', s, null), name: s.project.state.name, units: s.project.state.units }; } });
    const civilApp = (s) => {
      const app = { project: () => s.project, files: { available: true }, write: async (p, bytes, o) => write(env, p, bytes, o) };
      const tools = CIVIL_TOOLS(app);
      app.describe = () => tools.find((t) => t.name === 'site_describe').run({});
      app.tools = tools;
      return app;
    };
    const CIVIL_TOOLS = (app) => M_CIVIL.civilTools(app);
    civilUsdRun = async (a) => { const d = get(env, a.doc, 'civil'); const { doc, ...rest } = a; return civilApp(d.s).tools.find((x) => x.name === 'usd_export').run(rest); };
    for (const def of CIVIL_TOOLS({ project: () => null, files: { available: true } })) {
      if (def.name === 'usd_export') continue;   // one usd_export for CadCraft drawings and CivilCraft sites, below
      const schema = def.inputSchema || obj({});
      const pathNeeded = def.name === 'landxml_export' || def.name === 'usd_export';   // no download without a window: the file goes where the assistant says
      T({ ...def, description: def.description.replace(/ Studio: [^.]*\./, '') + ' Works on a site opened with site_open or site_new (doc).',
        inputSchema: { ...schema, properties: { doc: S.doc, ...(schema.properties || {}), ...(pathNeeded ? { path: { ...S.path, description: def.name === 'usd_export' ? 'The .usdz, .usda or .usdc file to write (inside the allowed folders).' : 'The .xml file to write (inside the allowed folders).' } } : {}) }, required: ['doc', ...(schema.required || []), ...(pathNeeded ? ['path'] : [])] },
        run: async (a) => {
          const d = get(env, a.doc, 'civil');
          const { doc, ...rest } = a;
          const r = await civilApp(d.s).tools.find((t) => t.name === def.name).run(rest);
          if (def.name === 'points_add') d.edited = true;
          return r;
        } });
    }
    T({ name: 'site_save', group: 'save', title: 'Save a civil site',
      description: 'Write the CivilCraft project (.civilcraft.json, as the app\'s Save writes it): to the file it was opened from (a project) or a new path.',
      inputSchema: obj({ doc: S.doc, path: S.path, overwrite: S.overwrite }, ['doc']),
      run: async (a) => {
        const d = get(env, a.doc, 'civil');
        const target = a.path || (d.path && /\.civilcraft\.json$/i.test(d.path) ? d.path : null);
        if (!target) throw new Error('Give a path ending in .civilcraft.json (this site was not opened from a project file).');
        if (!/\.civilcraft\.json$/i.test(target)) throw new Error('A CivilCraft project is a .civilcraft.json file.');
        const bytes = d.s.save();
        const real = write(env, target, bytes, { overwrite: a.overwrite });
        if (!d.path || !/\.civilcraft\.json$/i.test(d.path)) d.path = real;
        return { path: real, bytes: bytes.length };
      } });
  }

  // ---- PartCraft (0.7 AS.4): agents.js's functions on a part a handle names, built by its mesh kernel ----
  if (PART) {
    const A = () => PART.partModules().then((m) => m.A);
    T({ name: 'part_open', group: 'read', title: 'Open a part',
      description: 'Open a PartCraft part (.partcraft.json) and build it with PartCraft\'s mesh kernel. Returns a handle and what part_describe says. Units mm, model Y up.',
      inputSchema: obj({ path: S.path }, ['path']),
      run: async (a) => {
        const { real, bytes } = readFile(env, a.path);
        const s = await PART.PartSession.open(bytes, real);
        return { doc: keep(env, 'part', s, real), path: real, ...(await A()).describePart(s.part, s.regen()) };
      } });
    const partTool = (name, group, title, description, inputSchema, fn) => T({ name, group, title, description: description + ' Works on a part opened with part_open (doc).',
      inputSchema: { ...inputSchema, properties: { doc: S.doc, ...inputSchema.properties }, required: ['doc', ...(inputSchema.required || [])] },
      run: async (a) => fn(get(env, a.doc, 'part'), a, await A()) });
    partTool('part_describe', 'read', 'Describe the part', 'Features by type, failing ones, parameters and equations, configurations, material, and the built solid (volume mm³, area, bodies, bounding box).', obj({}), (d, a, X) => X.describePart(d.s.part, d.s.regen()));
    partTool('features_list', 'read', 'List features', 'The feature history in order: id, name, type, suppressed, after the rollback bar, build status and message.', obj({}), (d, a, X) => ({ features: X.featureRows(d.s.part, d.s.regen()) }));
    partTool('params_list', 'read', 'List parameters', 'Parameters (name, expression, value) and every number an equation can drive (key, label such as "Extrude1 depth", value, its equation when driven).', obj({}), (d, a, X) => X.paramRows(d.s.part));
    partTool('mass_properties', 'read', 'Mass properties', 'Volume, surface area, centre of mass and the inertia tensor about it; the mass when the part has a material. From the triangle mesh.', obj({}), (d, a, X) => X.massOf(d.s.part, d.s.regen()));
    partTool('param_set', 'edit', 'Set a parameter and rebuild', 'Set a parameter (a number or an expression) or one of the part\'s numbers ("Extrude1.depth", "Sketch1.D2"), apply the equations and rebuild: one undo step labelled "Assistant: set …". Returns what failed to build, if anything, and the new solid.',
      (() => { const sc = M_PART_SCHEMA(); return sc; })(), (d, a, X) => {
        const label = env.undoPrefix + 'set ' + a.name + ' = ' + a.value;
        const r = d.s.set(a.name, a.value, label);
        const dsc = X.describePart(d.s.part, d.s.regen());
        return { ...r, undo: label, failing: dsc.failing, solid: dsc.solid };
      });
    partTool('part_export', 'export', 'Export the part', 'The built solid as STL, 3MF, STEP (faceted: the mesh kernel has no exact surfaces) or OpenUSD (.usdz, .usda, .usdc, with its material and mass), as PartCraft\'s File › Export writes them, to a file in the allowed folders.',
      obj({ format: { type: 'string', enum: ['stl', '3mf', 'step', 'usdz', 'usda', 'usdc'] }, out: S.path, overwrite: S.overwrite }, ['out']), async (d, a, X) => {
        const fmt = a.format || ({ stl: 'stl', '3mf': '3mf', step: 'step', stp: 'step', usdz: 'usdz', usda: 'usda', usdc: 'usdc' }[extOf(a.out)]);
        if (!fmt) throw new Error('Give a format (stl, 3mf, step, usdz, usda, usdc) or a file ending in one of them.');
        const x = await X.exportBytes(d.s.regen(), fmt, d.s.part.name || 'part', d.s.part);
        const out = write(env, a.out, x.bytes, { overwrite: a.overwrite });
        return { out, format: fmt, bytes: x.bytes.length, ...(x.note ? { note: x.note } : {}) };
      });
    partTool('part_save', 'save', 'Save a part', 'Write the part (.partcraft.json, as PartCraft\'s Save writes it): to its own file (default) or a new path.',
      obj({ path: S.path, overwrite: S.overwrite }), (d, a) => {
        const target = a.path || d.path;
        if (!/\.partcraft\.json$/i.test(target)) throw new Error('A PartCraft part is a .partcraft.json file.');
        const bytes = d.s.save();
        const real = write(env, target, bytes, { overwrite: a.overwrite });
        return { path: real, bytes: bytes.length };
      });
  }

  // ---- PartCraft manuals (0.7 AS.6, session assistants-gaps): the Illustrate workspace's writers on a .partcraft-manual.json ----
  if (PART_AGENTS?.illustrateFiles) {
    const sc = PART_AGENTS.ILLUSTRATE_SCHEMA;
    T({ name: 'illustrate_export', group: 'export', title: 'Export a manual',
      description: 'A PartCraft manual (.partcraft-manual.json, made in the Illustrate workspace) as PDF or SVG line art of its saved views, as the interactive 3D file (html, opens offline in a browser), or its step-by-step instructions (what: instructions; pdf or html), as the workspace\'s Export and Instructions menus write them. Several SVG pages: out is an existing folder.',
      inputSchema: obj({ path: { ...S.path, description: 'The .partcraft-manual.json to read.' }, out: { ...S.path, description: 'The file to write (.pdf, .svg or .html); an existing folder for several SVG pages (one file per view).' }, ...sc.properties, overwrite: S.overwrite }, ['path', 'out']),
      run: async (a) => {
        const { real, bytes } = readFile(env, a.path);
        const MN = await load('partcraft', 'illustrate/all.js');
        let doc;
        try { doc = MN.readManual(bytes); } catch (e) { throw new Error(path.basename(real) + ': ' + (e.message || e)); }
        const as = a.as || { pdf: 'pdf', svg: 'svg', html: 'html', htm: 'html' }[extOf(a.out)] || 'pdf';
        const r = await PART_AGENTS.illustrateFiles(doc.m, doc.meshes, { ...a, as, ...manualSources() });
        const info = { manual: doc.m.name, as, what: a.what || 'views', ...(r.pages ? { pages: r.pages } : {}), ...(r.notes.length ? { notes: r.notes } : {}) };
        if (r.files.length === 1) {
          const ext = r.files[0].name.split('.').pop();
          if (extOf(a.out) !== ext && !(ext === 'html' && extOf(a.out) === 'htm')) throw new Error('This export is a .' + ext + ' file: give an out path ending in .' + ext + '.');
          return { ...info, files: [{ out: write(env, a.out, r.files[0].bytes, { overwrite: a.overwrite }), bytes: r.files[0].bytes.length }] };
        }
        return { ...info, files: r.files.map((f) => ({ out: write(env, path.join(a.out, f.name), f.bytes, { overwrite: a.overwrite }), bytes: f.bytes.length })) };
      } });
  }

  // ---- TakeoffCraft ----
  T({ name: 'takeoff_open', group: 'read', title: 'Open a takeoff',
    description: 'Open a TakeoffCraft project (.takeoff.json: items, marks, the PDFs or drawings it was measured on and their scales), or start a new takeoff on a DWG / DXF drawing (its sheets: Model, then each layout, scaled from the drawing\'s units and viewports as TakeoffCraft does). `drawings`: the .dwg / .dxf files a saved takeoff was made on (matched by their SHA-256), for the cad_* tools.',
    inputSchema: obj({ path: S.path, drawings: { type: 'array', items: S.path, minItems: 1, maxItems: 20 } }, ['path']),
    run: async (a) => {
      const { TakeoffSession } = await import('./takeoff.mjs');
      const { real, bytes } = readFile(env, a.path);
      const cad = ['dwg', 'dxf'].includes(extOf(real));
      let s;
      try { s = cad ? await TakeoffSession.openDrawing(bytes, path.basename(real)) : await TakeoffSession.open(bytes, real); } catch (e) { throw new Error(path.basename(real) + ': ' + (e.message || e)); }
      for (const p of a.drawings || []) { const d = readFile(env, p); try { await s.attach(d.bytes, path.basename(d.real)); } catch (e) { throw new Error(path.basename(d.real) + ': ' + (e.message || e)); } }
      return { doc: keep(env, 'takeoff', s, cad ? null : real), ...(cad ? { drawing: real, note: 'A new takeoff: save it with takeoff_save and a .takeoff.json path.' } : {}), ...s.summary() };
    } });

  // ---- TakeoffCraft on a DWG / DXF (0.7 AS.6, session assistants-gaps): the window's own functions (takeoffcraft agents.js) ----
  if (TAKEOFF_AGENTS?.cadCount) {
    const TA = TAKEOFF_AGENTS, Q = TA.CAD_QUERY_SCHEMA;
    const SHEET = { anyOf: [{ type: 'integer', minimum: 1 }, { type: 'string', maxLength: 255 }], description: 'A drawing\'s sheet: its key, its name (Model, a layout) or its number (1 = the first drawing\'s Model); default the first drawing\'s Model.' };
    const on = (a) => { const d = get(env, a.doc, 'takeoff'); return { d, x: d.s.cad(a.sheet) }; };
    T({ name: 'cad_catalog', group: 'read', title: 'What a drawing holds',
      description: 'What can be counted on a drawing\'s sheet (or in the whole drawing): blocks with their counts (top level, nested, dynamic states), shapes by layer and type, layers (hidden ones marked), texts and block attribute values. Works on a takeoff opened with takeoff_open on a drawing (doc).',
      inputSchema: obj({ doc: S.doc, sheet: SHEET, scope: Q.scope }, ['doc']),
      run: async (a) => { const { x } = on(a); return { sheet: x.name, ...(await TA.cadCatalog(x.set, x.i, a.scope)) }; } });
    T({ name: 'cad_count', group: 'read', title: 'Count in a drawing',
      description: 'Count exactly in a DWG / DXF, as TakeoffCraft\'s Count from drawing does: block references by name (and dynamic state), shapes by layer and entity type, or texts and attribute values; on the sheet (what it shows) or the whole drawing. Nothing changes; cad_count_add adds the marks.',
      inputSchema: obj({ doc: S.doc, sheet: SHEET, ...Q }, ['doc']),
      run: async (a) => { const { x } = on(a); return { sheet: x.name, ...(await TA.cadCount(x.set, x.i, a)) }; } });
    T({ name: 'cad_count_add', group: 'edit', title: 'Count into the takeoff',
      description: 'Count in the drawing (as cad_count) and put a count mark on each object found, into a count item (item: its id or name) or a new count item (name): one undo step. Counting again adds only the objects not marked yet.',
      inputSchema: obj({ doc: S.doc, sheet: SHEET, ...Q, item: { type: 'string', minLength: 1, maxLength: 200 }, name: { type: 'string', minLength: 1, maxLength: 200 } }, ['doc']),
      run: async (a) => { const { d, x } = on(a); return { sheet: x.name, ...(await TA.cadCountAdd(d.s.model, x.set, x.i, a, { item: a.item || null, name: a.name || '' })) }; } });
    T({ name: 'cad_measure', group: 'edit', title: 'Measure from a drawing',
      description: 'Measure a linear or an area item (items_add makes one) from the drawing\'s own geometry, as TakeoffCraft\'s Measure drawing does: the lines, arcs, polylines (bulges kept), circles, hatches (holes kept) and solids the sheet shows, filtered by layers, entity types or handles, become one mark each — one undo step. The sheet needs a scale.',
      inputSchema: obj({ doc: S.doc, sheet: SHEET, item: { type: 'string', minLength: 1, maxLength: 200 }, layers: { type: 'array', items: { type: 'string', maxLength: 255 }, maxItems: 200 }, types: { type: 'array', items: { type: 'string', maxLength: 40 }, maxItems: 40 }, handles: { type: 'array', items: { type: 'string', maxLength: 32 }, maxItems: 100000 } }, ['doc', 'item']),
      run: async (a) => { const { d, x } = on(a); return { sheet: x.name, ...(await TA.cadMeasure(d.s.model, x.set, x.i, a)) }; } });
    T({ name: 'items_add', group: 'edit', title: 'Add takeoff items',
      description: 'Add takeoff items as one undo step, as the window\'s items_add: name, type (linear, area, count, fixed), unit, material and labor rates in dollars per unit, waste in percent, heightFt. → their ids for cad_measure and cad_count_add.',
      inputSchema: (() => { const sc = JSON.parse(JSON.stringify(TA.ITEMS_ADD_SCHEMA)); return { ...sc, properties: { doc: S.doc, ...sc.properties }, required: ['doc', ...sc.required] }; })(),
      run: async (a) => TA.addItemsTo(get(env, a.doc, 'takeoff').s.model, a.items) });
    T({ name: 'takeoff_save', group: 'save', title: 'Save a takeoff',
      description: 'Write the takeoff (.takeoff.json, as TakeoffCraft\'s Save writes it: items, marks, scales and the names and SHA-256 of the drawings and PDFs it was made on): to its own file (default) or a new path.',
      inputSchema: obj({ doc: S.doc, path: S.path, overwrite: S.overwrite }, ['doc']),
      run: async (a) => {
        const d = get(env, a.doc, 'takeoff');
        const target = a.path || d.path;
        if (!target) throw new Error('This takeoff has no file yet: give a path ending in .takeoff.json.');
        if (!/\.takeoff\.json$/i.test(target)) throw new Error('A takeoff is a .takeoff.json file.');
        const real = write(env, target, d.s.save(), { overwrite: a.overwrite });
        if (!d.path) d.path = real;
        return { path: real, items: d.s.state.items.length, marks: d.s.state.marks.length };
      } });
  }

  T({ name: 'takeoff_quantities', group: 'read', title: 'Takeoff quantities',
    description: 'Quantities per item (in its unit) or per sheet. Marks on sheets with no scale are listed as unscaled, never counted as zero.',
    inputSchema: obj({ doc: S.doc, by: { type: 'string', enum: ['item', 'sheet'], default: 'item' } }, ['doc']),
    run: async (a) => get(env, a.doc, 'takeoff').s.quantities({ by: a.by }) });

  T({ name: 'takeoff_estimate', group: 'read', title: 'Takeoff estimate',
    description: 'The priced estimate as TakeoffCraft computes it: a row per item and per assembly component (quantity, waste, material and labor), totals in cents and as text; incomplete when a formula fails or marks are unscaled.',
    inputSchema: obj({ doc: S.doc }, ['doc']),
    run: async (a) => get(env, a.doc, 'takeoff').s.estimate() });

  T({ name: 'takeoff_export', group: 'export', title: 'Export a takeoff',
    description: 'Write the estimate as .csv or .xlsx (the workbook TakeoffCraft makes: estimate with live formulas, by sheet, marks, scales).',
    inputSchema: obj({ doc: S.doc, out: S.path, overwrite: S.overwrite }, ['doc', 'out']),
    run: async (a) => {
      const ext = extOf(a.out);
      if (!['csv', 'xlsx'].includes(ext)) throw new Error('Takeoffs are exported as .csv or .xlsx.');
      const bytes = await get(env, a.doc, 'takeoff').s.export(ext);
      const out = write(env, a.out, bytes, { overwrite: a.overwrite });
      return { out, bytes: bytes.length };
    } });

  // ---- MarkupCraft ----
  T({ name: 'markups_list', group: 'read', title: 'List PDF markups',
    description: 'The sheets of a PDF and its markups as MarkupCraft reads them (type, sheet, text, comment, status, author, dates, punch item, replies), filtered and paged. Annotations from other programs that MarkupCraft cannot edit are marked readOnly.',
    inputSchema: obj({ path: S.path, sheet: { type: 'string', maxLength: 255 }, status: { type: 'string', enum: ['Open', 'Accepted', 'Rejected', 'Completed'] }, type: { type: 'string', maxLength: 40 }, author: { type: 'string', maxLength: 200 }, offset: S.offset, limit: { type: 'integer', minimum: 1, maximum: 1000, default: 200 } }, ['path']),
    run: async (a) => {
      const { MarkupSession } = await import('./markup.mjs');
      const { real, bytes } = readFile(env, a.path);
      const s = await MarkupSession.open(bytes, real);
      return { sheets: s.sheets(), ...s.markups(a) };
    } });

  return tools;
}

export { PathError };
