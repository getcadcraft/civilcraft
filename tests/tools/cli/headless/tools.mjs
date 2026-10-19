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
import { CadSession, extOf, scriptLines } from './cad.mjs';
import { load } from './apps.mjs';

// BimCraft's Draw edits (0.6 DF.25, session `bim-draw`): the same tool definitions as its live window (bimcraft/dev/agents.js),
// each given a `doc` handle here. A build without them (an older package) simply lists none.
let BIM = null;
try { BIM = await load('bimcraft', 'agents.js'); } catch { BIM = null; }

export const MAX_OPEN = 16;
export const MAX_FILE = 500 * 1024 * 1024;

export function createEnv({ roots = [], undoPrefix = 'Assistant: ' } = {}) {
  return { roots: roots instanceof Roots ? roots : new Roots(roots), undoPrefix, docs: new Map(), seq: 0, mine: new Set() };
}

const S = {
  doc: { type: 'string', pattern: '^d[0-9]{1,6}$', description: 'A handle from drawing_open, ifc_open or takeoff_open.' },
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
  if (!d) throw new Error('No open file ' + id + '. Open one first (' + (kind === 'cad' ? 'drawing_open' : kind === 'ifc' ? 'ifc_open' : 'takeoff_open') + ').');
  if (kind && d.kind !== kind) throw new Error(id + ' is ' + ({ cad: 'a drawing', ifc: 'an IFC model', takeoff: 'a takeoff' }[d.kind]) + ', not ' + ({ cad: 'a drawing', ifc: 'an IFC model', takeoff: 'a takeoff' }[kind]) + '.');
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
    inputSchema: obj({ doc: S.doc, type: { type: 'string', enum: ['line', 'circle', 'arc', 'poly', 'ellipse', 'text', 'point', 'insert', 'hatch', 'dim', 'viewport', 'mleader', 'spline', 'face3d', 'image', 'wipeout'] }, layer: { type: 'string', maxLength: 255 }, block: { type: 'string', maxLength: 255, description: 'References of this block only.' }, text: { type: 'string', maxLength: 200, description: 'Texts (and attribute values) containing this.' }, within: { ...box, description: 'Only objects entirely inside this box.' }, space: { type: 'string', maxLength: 255, description: '"model" (default) or a sheet name.' }, offset: S.offset, limit: { type: 'integer', minimum: 1, maximum: 1000, default: 100 } }, ['doc']),
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
    description: 'Type at CadCraft\'s command line: one string, or a list where each item answers the next prompt ("" = Enter). Items may also be {pick: [x, y]}, {window: [x1, y1, x2, y2], crossing}, {entity: id} or {escape: true}. Example: ["LINE", "0,0", "@100,0", "@0,50", ""]. A command still waiting at the end is ended with Esc. The whole call is one undo step labelled "Assistant: …". Commands that need a dialog on screen are refused.',
    inputSchema: obj({ doc: S.doc, input: { anyOf: [{ type: 'string', maxLength: 100000 }, { type: 'array', items: inputItem, minItems: 1, maxItems: 5000 }] }, select: { type: 'array', items: { type: 'integer', minimum: 1 }, maxItems: 100000, description: 'Object ids selected before the command (noun-verb).' } }, ['doc', 'input']),
    run: async (a) => {
      const r = await get(env, a.doc, 'cad').s.run(a.input, { select: a.select });
      return { ...r, added: r.added.slice(0, 2000), changed: r.changed.slice(0, 2000), removed: r.removed.slice(0, 2000), counts: { added: r.added.length, changed: r.changed.length, removed: r.removed.length } };
    } });

  T({ name: 'script_run', group: 'edit', title: 'Run a script',
    description: 'Run a script on an open drawing as one undo step: language "scr" (command-line lines, as a .scr file) or "lisp" (AutoLISP-style, run by CadCraft\'s own interpreter; (command …) drives CadCraft\'s commands).',
    inputSchema: obj({ doc: S.doc, script: { type: 'string', minLength: 1, maxLength: 1000000 }, language: { type: 'string', enum: ['scr', 'lisp'], default: 'scr' } }, ['doc', 'script']),
    run: async (a) => {
      const s = get(env, a.doc, 'cad').s;
      const r = a.language === 'lisp' ? await s.runLisp(a.script) : await s.run(scriptLines(a.script), { label: 'SCRIPT' });
      return { ...r, added: r.added.slice(0, 2000), changed: r.changed.slice(0, 2000), removed: r.removed.slice(0, 2000), counts: { added: r.added.length, changed: r.changed.length, removed: r.removed.length } };
    } });

  T({ name: 'undo', group: 'edit', title: 'Undo',
    description: 'Undo the assistant\'s last steps on a drawing or an IFC model (only steps labelled "Assistant:" unless any is true).',
    inputSchema: obj({ doc: S.doc, steps: { type: 'integer', minimum: 1, maximum: 100, default: 1 }, any: { type: 'boolean', default: false } }, ['doc']),
    run: async (a) => {
      const d = get(env, a.doc);
      if (d.kind === 'ifc') return { undone: await d.s.undo(a.steps, { any: a.any }) };
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
    description: 'A vector PDF of a sheet (layout, as set up) or of the model (extents or a window, on a paper at a scale or fitted). Papers: iso-a4 … iso-a0, letter, legal, ansi-b … ansi-d, arch-c … arch-e. Scales "1:50", "1/4\\" = 1\'-0\\"" or "fit".',
    inputSchema: obj({ doc: S.doc, out: S.path, layout: { type: 'string', maxLength: 255 }, window: box, paper: { type: 'string', enum: ['iso-a4', 'iso-a3', 'iso-a2', 'iso-a1', 'iso-a0', 'letter', 'legal', 'ansi-b', 'ansi-c', 'ansi-d', 'arch-c', 'arch-d', 'arch-e'], default: 'iso-a3' }, portrait: { type: 'boolean', default: false }, scale: { type: 'string', maxLength: 40, default: 'fit' }, mono: { type: 'boolean', default: true }, pen: { type: 'number', minimum: 0.05, maximum: 2, default: 0.25 }, overwrite: S.overwrite }, ['doc', 'out']),
    run: async (a) => {
      const d = get(env, a.doc, 'cad');
      if (extOf(a.out) !== 'pdf') throw new Error('The plot is written to a .pdf file.');
      const r = await d.s.plot({ layout: a.layout || null, area: a.window || 'extents', paper: a.paper, portrait: a.portrait, scale: a.scale, mono: a.mono, pen: a.pen });
      const out = write(env, a.out, r.bytes, { overwrite: a.overwrite });
      return { out, bytes: r.bytes.length, sheetMm: { w: r.sheet.w, h: r.sheet.h }, scale: r.sheet.scale, fitsOnPaper: r.sheet.fits, unprintableCharacters: r.missing };
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

  // ---- TakeoffCraft ----
  T({ name: 'takeoff_open', group: 'read', title: 'Open a takeoff',
    description: 'Open a TakeoffCraft project (.takeoff.json): items, marks, the PDFs it was measured on and their scales.',
    inputSchema: obj({ path: S.path }, ['path']),
    run: async (a) => {
      const { TakeoffSession } = await import('./takeoff.mjs');
      const { real, bytes } = readFile(env, a.path);
      const s = await TakeoffSession.open(bytes, real);
      return { doc: keep(env, 'takeoff', s, real), ...s.summary() };
    } });

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
