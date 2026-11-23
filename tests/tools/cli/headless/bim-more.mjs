/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bim-more.mjs: the agent-friendly extras of the headless BimCraft tools (GH.6 asks 2, FX.377; session assistant-11). Mounted by tools.mjs
 * inside its BimCraft block, so they exist exactly where ifc_new / walls_add / ifc_save exist. No second model code: every step runs
 * BimCraft's own tool (bimcraft/dev/agents.js modelTools) on the same editor.
 *
 *   ifc_batch        many edit-tool calls in ONE call, all or nothing, one undo step when the changes are the kind that can be joined
 *   ifc_describe     the levels, and on each level every wall with its ends, type, height and openings, in one call
 *   ifc_render_png   a flat-shaded picture of the model (iso, top, front, back, left, right), to check an edit by eye
 *   ifc_usd_export   (as usd_export on an IFC handle, see tools.mjs) OpenUSD of the model, written by BimCraft's own USD writer
 *   withElements(session, args, err)   puts the GlobalIds an error is about on the error (error.elements)
 */
import path from 'node:path';
import { checkSchema } from '../../mcp/core.mjs';

const GUID = /[0-9A-Za-z_$]{22}/g;

/** The elements a failed call was about: GlobalIds in the arguments that are in the model, and any named in the message. Returns the error. */
export function withElements(s, args, err) {
  try {
    if (!err || typeof err !== 'object' || err.elements) return err;
    const known = new Map();
    for (const id of [...s.elements, ...s.storeyIds]) { const g = s.attrText(id, 'GlobalId'); if (g) known.set(g, id); }
    const out = [], seen = new Set();
    const add = (g, mentioned) => {
      if (seen.has(g) || out.length >= 10) return;
      const id = known.get(g);
      if (id === undefined) { if (mentioned) { seen.add(g); out.push({ guid: g, found: false }); } return; }
      seen.add(g);
      const st = s.storeyOf(id);
      out.push({ guid: g, found: true, class: s.pretty(id), name: s.attrText(id, 'Name'), level: st ? s.attrText(st, 'Name') : null });
    };
    for (const g of String(JSON.stringify(args ?? {})).match(GUID) || []) add(g, false);
    for (const m of String(err.message || '').matchAll(/GlobalId\s+([0-9A-Za-z_$]{22})/g)) add(m[1], true);
    for (const g of String(err.message || '').match(GUID) || []) if (known.has(g)) add(g, false);
    if (out.length) err.elements = out;
  } catch { /* never hide the original error */ }
  return err;
}

const mergeJournals = (a, b) => {   // the rule of bimcraft/dev/trust-agents.js mergeJournals and model-ui.js mergeJournals
  if (!a) return b; if (!b) return a;
  const before = new Map(a.before);
  for (const [id, line] of b.before) if (!before.has(id) && !a.created.includes(id)) before.set(id, line);
  return { created: [...a.created, ...b.created], before, retyped: [...(a.retyped || []), ...(b.retyped || [])] };
};

const REF = /^[$@](\d+)\.([A-Za-z0-9_.]+)$/;   // "$1.walls.0" or "@1.walls.0" (a harness that fills "$name" itself can use the @ form)
function resolveRefs(v, results, step) {
  if (typeof v === 'string') {
    const m = REF.exec(v);
    if (!m) return v;
    const n = +m[1];
    if (n < 1 || n > results.length) throw new Error('"' + v + '" points at step ' + n + ', which has not run yet (steps count from 1, and a step can use only an earlier one).');
    let cur = results[n - 1];
    for (const k of m[2].split('.')) { cur = cur == null ? undefined : cur[k]; }
    if (cur === undefined) throw new Error('"' + v + '": step ' + n + ' returned nothing at ' + m[2] + '.');
    return cur;
  }
  if (Array.isArray(v)) return v.map((x) => resolveRefs(x, results, step));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveRefs(x, results, step)]));
  return v;
}

export function bimExtras({ T, env, get, keep, write, S, obj, BIM, bimEnv, extOf, load }) {
  const editNames = () => BIM.modelTools(bimEnv(null)).filter((t) => t.group === 'edit').map((t) => t.name);
  const names = editNames();

  T({ name: 'ifc_batch', group: 'edit', title: 'Many edits in one call',
    description: 'Run several of the BimCraft edit tools (' + names.join(', ') + ') in one call: for example a closed set of walls, then the doors and windows in them. One round trip instead of many. All or nothing: if a step is refused, the steps before it are undone and nothing changed, and the error names the step. When every step made a joinable change (walls, openings, floors, levels, grids, furniture, massing) the whole batch is ONE undo step; steps that rename or set a property are separate undo steps, and the result says how many (undoSteps). A later step can use an earlier result: write "$1.walls.0" or "@1.walls.0" (the first wall GlobalId of step 1; steps count from 1). Works on an IFC model opened with ifc_open or ifc_new (doc).',
    inputSchema: obj({ doc: S.doc, steps: { type: 'array', minItems: 1, maxItems: 200, items: obj({ tool: { type: 'string', enum: names }, args: { type: 'object' } }, ['tool']) }, label: { type: 'string', maxLength: 100, description: 'The undo step\'s name (default: "batch of N steps").' } }, ['doc', 'steps']),
    run: async (a) => {
      const d = get(env, a.doc, 'ifc'), s = d.s, ed = await s.editor();
      s.undoPrefix = env.undoPrefix;
      const tools = new Map(BIM.modelTools(bimEnv(s)).filter((t) => t.group === 'edit').map((t) => [t.name, t]));
      const start = ed.changes.length, keepUndone = ed.undone.slice(), results = [];
      const undoAll = () => { let n = 0; while (ed.changes.length > start && n++ < 1000) { if (ed.undo() === null) break; } ed.undone.length = 0; ed.undone.push(...keepUndone); s.index(); };
      for (let i = 0; i < a.steps.length; i++) {
        const st = a.steps[i], tool = tools.get(st.tool);
        let args = null;
        try {
          args = resolveRefs(st.args || {}, results, i + 1);
          const bad = checkSchema(tool.inputSchema, args, 'steps[' + i + '].args');
          if (bad.length) throw new Error(bad.slice(0, 3).join(' '));
          results.push(await tool.run(args));
        } catch (e) {
          undoAll();
          const err = new Error('Step ' + (i + 1) + ' (' + st.tool + ') was refused: ' + e.message + ' Nothing was changed.');
          err.name = e.name; if (e.code) err.code = e.code; if (e.next) err.next = e.next;
          withElements(s, args || st.args, e);
          if (e.elements) err.elements = e.elements;
          err.step = i + 1;
          throw err;
        }
      }
      const added = ed.changes.slice(start);
      const label = env.undoPrefix + (a.label || 'batch of ' + a.steps.length + ' step' + (a.steps.length > 1 ? 's' : ''));
      let undoSteps = added.length;
      if (added.length > 1 && added.every((c) => c.kind === 'model' && c.journal && c.again?.run)) {
        ed.changes.length = start;
        const runs = added.map((c) => c.again.run);
        const made = new Map();
        for (const c of added) for (const [g, id] of c.made || []) made.set(g, id);
        const combined = { kind: 'model', id: added[added.length - 1].id ?? null, ids: added.flatMap((c) => c.ids || []), made, label, verb: added[0].verb || '',
          journal: added.map((c) => c.journal).reduce(mergeJournals), old: null, value: null, result: { made },
          again: { run: (editor) => { let j = null; const mm = new Map(); for (const r of runs) { const x = r(editor); j = mergeJournals(j, x.journal); for (const [g, id] of x.made || []) mm.set(g, id); } return { journal: j, made: mm }; } } };
        ed.changes.push(combined);
        undoSteps = 1;
      } else if (added.length === 1) added[0].label = label;
      s.index();
      return { steps: a.steps.map((st, i) => ({ step: i + 1, tool: st.tool, result: results[i] })), undoSteps, undo: label };
    } });

  T({ name: 'ifc_describe', group: 'read', title: 'Describe the model with its walls', untrusted: true,
    description: 'One summary of an open IFC model in millimetres: the levels (name, GlobalId, elevation, height), what model_describe counts (wall types, doors, windows, rooms and their areas, floors, grids, columns, site) and, level by level, every wall BimCraft\'s tools can change: GlobalId, start and end, type, thickness, height, length and the doors and windows in it. Up to maxWalls walls per level (default 100).',
    inputSchema: obj({ doc: S.doc, maxWalls: { type: 'integer', minimum: 0, maximum: 1000, default: 100 } }, ['doc']),
    run: async (a) => {
      const d = get(env, a.doc, 'ifc');
      await d.s.editor();
      const tools = BIM.modelTools(bimEnv(d.s));
      const run = (n, x) => tools.find((t) => t.name === n).run(x);
      const model = await run('model_describe', {});
      const cap = a.maxWalls ?? 100;
      const levels = [];
      for (const l of model.levels || []) {
        const r = await run('walls_list', { level: l.guid });
        levels.push({ ...l, wallCount: r.walls.length, walls: r.walls.slice(0, cap), wallsTruncated: r.walls.length > cap });
      }
      const { levels: _drop, ...rest } = model;
      return { file: d.path || d.s.name, ...rest, levels };
    } });

  T({ name: 'ifc_render_png', group: 'export', title: 'Picture of the model (PNG)',
    description: 'A PNG picture of an open IFC model, with no window or graphics card, so an assistant can look at its own edits: the model\'s triangles from the engine BimCraft uses, drawn flat-shaded from one direction (iso, top, front, back, left, right). It is a checking picture, not BimCraft\'s render: no shadows, materials or textures, elements the engine cannot mesh are missing (the result counts the elements and triangles drawn), spaces are left out. Written to a .png file inside the folders you may use.',
    inputSchema: obj({ doc: S.doc, out: S.path, view: { type: 'string', enum: ['iso', 'top', 'front', 'back', 'left', 'right'], default: 'iso' }, width: { type: 'integer', minimum: 100, maximum: 4000, default: 1200 }, height: { type: 'integer', minimum: 100, maximum: 4000, default: 800 }, overwrite: S.overwrite }, ['doc', 'out']),
    run: async (a) => {
      const d = get(env, a.doc, 'ifc');
      if (extOf(a.out) !== 'png') throw new Error('The picture is written to a .png file.');
      await d.s.editor();
      const { meshModel } = await import('./ifc-mesh.mjs');
      const { renderPng } = await import('./ifc-raster.mjs');
      const m = await meshModel(d.s);
      const r = renderPng(m.triangles, { view: a.view || 'iso', width: a.width || 1200, height: a.height || 800 });
      const out = write(env, a.out, r.bytes, { overwrite: a.overwrite });
      return { out, bytes: r.bytes.length, width: r.width, height: r.height, view: r.view, elements: m.elements, trianglesDrawn: r.triangles, notes: m.notes };
    } });

  /** OpenUSD of an IFC handle: BimCraft's own writer (usd-bimcraft.js) over the engine's meshes (ifc-mesh.mjs). */
  const usd = async (d, { format, name }) => {
    await d.s.editor();
    const { meshModel } = await import('./ifc-mesh.mjs');
    const { bimUsd } = await load('bimcraft', 'usd-bimcraft.js');
    const m = await meshModel(d.s);
    if (!m.elements) throw new Error('The model has no geometry the engine could mesh, so there is nothing to export.');
    const r = await bimUsd(m.entries, { format, name });
    return { bytes: typeof r.data === 'string' ? new TextEncoder().encode(r.data) : r.data, report: r.report, notes: m.notes };
  };
  void path;
  return { usd };
}
