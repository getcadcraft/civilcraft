// SPDX-License-Identifier: Apache-2.0
/**
 * policies.js: the Default Policies engine, host-free (0.10 DP.1, owner decision 2026-11-11, session bk-defaults-10). No imports, no DOM.
 * A person or an office says once what a new project starts with and what new things get; the apps ask for each value when they need it.
 * A policy that is not set leaves the app's own built-in behaviour exactly as it is: the engine then answers `undefined` and the app
 * does what it always did.
 *
 * THE LIST IS DATA (POLICIES below). Adding a policy later is ONE entry here plus a small reader in the host that asks for it through
 * the host's defaults hook (defaults-hook.js: policy(id, { system })). The Settings screens (ui.js) are drawn from the list.
 *
 *   policy = { id          '<app>.<what>' ('all.' for every app); letters, digits, dots
 *              app         'bimcraft' | 'cadcraft' | … | '*' (every app: shown in Settings › Global)
 *              group       the heading it sits under in Settings (a string key; the words are the add-on's language file: dp.group.<group>)
 *              kind        'choice' (one of options) | 'int' (min..max) | 'number' (min..max, in the app's own unit) | 'length' (mm, min..max) |
 *                          'text' (max chars) |
 *                          'pattern' (text with {tokens}; tokens lists the ones that mean something)
 *              options     for a choice: the values (strings or numbers)
 *              optionsFrom for a choice whose list the host knows (wall types, papers, scales): a name the host's adapter answers;
 *                          the engine then checks only the type and the host's reader checks the value is still offered
 *              perSystem   true: one value for metric projects and one for imperial ones ({ metric?, imperial? })
 *              min, max, tokens, needs (the id of a policy that must not be 'none' for this one to matter) }
 *   The default of EVERY policy is "the app's own": not set. There is no other default, so nothing changes until a person sets one.
 *
 * THE DOCUMENT (what is kept on this computer and what the file holds; the file is open JSON anybody can read or write):
 *   { "format": "cc-default-policies", "version": 1, "office": "Name of the office (optional)", "saved": "2026-11-11T10:00:00Z",
 *     "policies": { "bimcraft.wall.first": { "metric": "ext-300" }, "bimcraft.levels.count": 3, "bimcraft.tool.afterCreate": "wall" } }
 *   A policy that is not in "policies" is not set. An id this version does not know is ignored and named (never an error): a file
 *   written by a later version, or for an app this computer does not have, still loads.
 *
 *   policyList(app)                         the policies of one app ('*' = the ones for every app)
 *   policyById(id)
 *   checkValue(policy, value, { optionsOf })   → { ok, value } | { ok: false, why }     one plain value (not the per-system pair)
 *   cleanDoc(raw, { optionsOf })            → { doc, ignored: [{ id, system?, why: 'unknown' | 'invalid' }] }
 *   emptyDoc()
 *   valueOf(doc, id, { system })            → the value, or undefined when not set (the app's own)
 *   setValue(doc, id, value, { system })    → a new doc (value undefined = not set); throws on a value the policy refuses
 *   resetDoc(doc, { app })                  → a new doc without that app's policies (no app: none at all; the office name stays)
 *   countSet(doc, app)                      how many are set (a per-system pair counts once)
 *   toFile(doc, { now })                    → JSON text
 *   fromFile(text, { optionsOf })           → { ok: true, doc, ignored, newer } | { ok: false, error: 'json' | 'format' | 'size' }
 *   fillPattern(pattern, vars)              '{n}' etc. replaced; unknown tokens stay as typed
 *   levelNameVars(i)                        the tokens of a level name for level i (0-based): n, n0, nn, nn0
 */
export const FORMAT = 'cc-default-policies';
export const VERSION = 1;
export const FILE_EXT = '.ccdefaults.json';
export const MAX_FILE = 200000;
export const SYSTEMS = ['metric', 'imperial'];
export const LOD_OPTIONS = [100, 200, 300, 350, 400, 500];   // the scale of lib/walls/lod.js (LOD_SCALE); the engine test checks they agree

export const POLICIES = [
  // ---- every app (Settings › Global)
  { id: 'all.system', app: '*', group: 'project', kind: 'choice', options: ['metric', 'imperial'] },
  // 0.10 BK.10 (bk-r3-scale-10): the office's annotation standard: paper heights in millimetres (capital height) by kind; the kinds and
  // the limits are lib/annoscale/annoscale.js KINDS, MIN_MM, MAX_MM (the engine test checks they agree). A new building takes them.
  { id: 'all.anno.text', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.dimension', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.tag', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.room', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.grid', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.title', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  { id: 'all.anno.schedule', app: '*', group: 'annotation', kind: 'number', min: 0.5, max: 50 },
  // 0.10 BK.149 (bk-r3-schedules-10): the office standard for schedule layouts: grouping, totals, the title and the case of column
  // headings. A schedule or set-up that states one of these keeps its own; the values are lib/tables/table.js GROUPS, totals, CASES.
  { id: 'all.schedule.group', app: '*', group: 'schedules', kind: 'choice', options: ['none', 'level', 'type', 'room'] },
  { id: 'all.schedule.totals', app: '*', group: 'schedules', kind: 'choice', options: ['none', 'grand', 'groups'] },
  { id: 'all.schedule.title', app: '*', group: 'schedules', kind: 'pattern', tokens: ['schedule', 'project'], max: 120 },
  { id: 'all.schedule.headings', app: '*', group: 'schedules', kind: 'choice', options: ['asis', 'upper', 'title'] },

  // ---- BimCraft: a new building
  { id: 'bimcraft.units', app: 'bimcraft', group: 'project', kind: 'choice', options: ['mm', 'cm', 'm', 'ftin', 'ftdec', 'in'] },
  { id: 'bimcraft.levels.count', app: 'bimcraft', group: 'levels', kind: 'int', min: 1, max: 200 },
  { id: 'bimcraft.levels.name', app: 'bimcraft', group: 'levels', kind: 'pattern', tokens: ['n', 'n0', 'nn', 'nn0'], max: 60 },
  { id: 'bimcraft.levels.height', app: 'bimcraft', group: 'levels', kind: 'length', perSystem: true, min: 10, max: 1e7 },
  { id: 'bimcraft.wall.first', app: 'bimcraft', group: 'walls', kind: 'choice', optionsFrom: 'wallTypes', perSystem: true },
  { id: 'bimcraft.wall.starterLod', app: 'bimcraft', group: 'walls', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.wall.newLod', app: 'bimcraft', group: 'walls', kind: 'choice', options: LOD_OPTIONS },
  // 0.10 BK.65 (bk-r3-checks-10): the LOD the audit asks of the elements at each project stage (lib/modelaudit/stagelod.js STAGE_LOD is
  // CadCraft's starting point, not a standard; an office sets its own here). Not set = the starting value.
  { id: 'bimcraft.audit.lod.concept', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.audit.lod.designDevelopment', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.audit.lod.submission', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.audit.lod.workingDrawings', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.audit.lod.tender', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.audit.lod.closeOut', app: 'bimcraft', group: 'audit', kind: 'choice', options: LOD_OPTIONS },
  { id: 'bimcraft.sheet.first', app: 'bimcraft', group: 'sheet', kind: 'choice', options: ['sheet', 'none'] },
  { id: 'bimcraft.sheet.paper', app: 'bimcraft', group: 'sheet', kind: 'choice', optionsFrom: 'papers', perSystem: true, needs: 'bimcraft.sheet.first' },
  { id: 'bimcraft.sheet.scale', app: 'bimcraft', group: 'sheet', kind: 'choice', optionsFrom: 'scales', perSystem: true, needs: 'bimcraft.sheet.first' },
  { id: 'bimcraft.sheet.number', app: 'bimcraft', group: 'sheet', kind: 'text', max: 20, perSystem: true, needs: 'bimcraft.sheet.first' },
  { id: 'bimcraft.sheet.title', app: 'bimcraft', group: 'sheet', kind: 'pattern', tokens: ['level'], max: 120, perSystem: true, needs: 'bimcraft.sheet.first' },
  { id: 'bimcraft.tool.afterCreate', app: 'bimcraft', group: 'tool', kind: 'choice', options: ['select', 'wall'] },

  // ---- CadCraft: a new drawing
  { id: 'cadcraft.units', app: 'cadcraft', group: 'project', kind: 'choice', options: ['none', 'mm', 'cm', 'm', 'in', 'ft'] },
  { id: 'cadcraft.length.format', app: 'cadcraft', group: 'project', kind: 'choice', options: ['decimal', 'architectural', 'engineering', 'fractional', 'scientific'], perSystem: true },
  { id: 'cadcraft.length.precision', app: 'cadcraft', group: 'project', kind: 'int', min: 0, max: 8, perSystem: true },
  { id: 'cadcraft.text.height', app: 'cadcraft', group: 'styles', kind: 'number', min: 0.001, max: 100000, perSystem: true },
  { id: 'cadcraft.sheet.paper', app: 'cadcraft', group: 'sheet', kind: 'choice', optionsFrom: 'papers', perSystem: true },
];

const ID_RE = /^[a-z][a-z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*){1,4}$/;
const BY_ID = new Map(POLICIES.map((p) => [p.id, p]));
const plain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
// control characters never belong in a name or a pattern (they would end up in a file name, an IFC string or a sheet title)
const tidy = (s) => String(s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();

export const policyById = (id) => BY_ID.get(String(id)) || null;
export const policyList = (app) => POLICIES.filter((p) => p.app === app);
export const policyApps = () => [...new Set(POLICIES.map((p) => p.app))];
export const emptyDoc = () => ({ format: FORMAT, version: VERSION, office: '', policies: {} });

/** One plain value against its policy. `optionsOf(policy, system)` (optional) → the host's list for an optionsFrom policy, or null. */
export function checkValue(p, value, { optionsOf = null, system = null } = {}) {
  const no = (why) => ({ ok: false, why });
  if (!p) return no('unknown');
  if (value === undefined || value === null) return no('empty');
  if (p.kind === 'choice') {
    if (typeof value !== 'string' && typeof value !== 'number') return no('type');
    if (typeof value === 'string' && (!value || value.length > 80)) return no('type');
    if (typeof value === 'number' && !Number.isFinite(value)) return no('type');
    const list = p.options || (optionsOf ? optionsOf(p, system) : null);
    if (list && !list.includes(value)) return no('option');
    return { ok: true, value };
  }
  if (p.kind === 'int' || p.kind === 'length' || p.kind === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) return no('type');
    if (p.kind === 'int' && Math.round(value) !== value) return no('type');
    if (value < p.min || value > p.max) return no('range');
    return { ok: true, value: p.kind === 'length' ? Math.round(value * 1000) / 1000 : value };
  }
  if (p.kind === 'text' || p.kind === 'pattern') {
    if (typeof value !== 'string') return no('type');
    const s = tidy(value);
    if (!s) return no('empty');
    if (s.length > (p.max || 120)) return no('range');
    return { ok: true, value: s };
  }
  return no('kind');
}

/** Anything → a document this version understands, and what it left out. Never throws. */
export function cleanDoc(raw, { optionsOf = null } = {}) {
  const doc = emptyDoc(), ignored = [];
  if (!plain(raw)) return { doc, ignored };
  if (typeof raw.office === 'string') doc.office = tidy(raw.office).slice(0, 120);
  const src = plain(raw.policies) ? raw.policies : {};
  for (const id of Object.keys(src).slice(0, 2000)) {
    const p = BY_ID.get(id);
    if (!p) { ignored.push({ id: String(id).slice(0, 80), why: 'unknown' }); continue; }
    const v = src[id];
    if (p.perSystem) {
      if (!plain(v)) { ignored.push({ id, why: 'invalid' }); continue; }
      const out = {};
      for (const s of SYSTEMS) {
        if (v[s] === undefined || v[s] === null) continue;
        const r = checkValue(p, v[s], { optionsOf, system: s });
        if (r.ok) out[s] = r.value; else ignored.push({ id, system: s, why: 'invalid' });
      }
      if (Object.keys(out).length) doc.policies[id] = out;
    } else {
      const r = checkValue(p, v, { optionsOf });
      if (r.ok) doc.policies[id] = r.value; else ignored.push({ id, why: 'invalid' });
    }
  }
  return { doc, ignored };
}

/** The value a policy has, or undefined: not set, the app's own. `system` picks the half of a per-system policy. */
export function valueOf(doc, id, { system = null } = {}) {
  const p = BY_ID.get(id);
  if (!p || !plain(doc) || !plain(doc.policies) || !Object.prototype.hasOwnProperty.call(doc.policies, id)) return undefined;
  const v = doc.policies[id];
  if (!p.perSystem) return checkValue(p, v).ok ? v : undefined;
  if (!plain(v) || !SYSTEMS.includes(system)) return undefined;
  return v[system] !== undefined && checkValue(p, v[system]).ok ? v[system] : undefined;
}

/** A new document with one policy set (or, with `value` undefined, no longer set). Throws on a value the policy refuses. */
export function setValue(doc, id, value, { system = null, optionsOf = null } = {}) {
  const p = BY_ID.get(id);
  if (!p) throw Object.assign(new Error('unknown policy ' + id), { why: 'unknown' });
  if (p.perSystem && !SYSTEMS.includes(system)) throw Object.assign(new Error(id + ' needs a unit system'), { why: 'system' });
  const next = { ...emptyDoc(), office: String(doc?.office || ''), policies: { ...(plain(doc?.policies) ? doc.policies : {}) } };
  let clean;
  if (value !== undefined && value !== null && value !== '') {
    const r = checkValue(p, value, { optionsOf, system });
    if (!r.ok) throw Object.assign(new Error(id + ': ' + r.why), { why: r.why });
    clean = r.value;
  }
  if (p.perSystem) {
    const pair = { ...(plain(next.policies[id]) ? next.policies[id] : {}) };
    if (clean === undefined) delete pair[system]; else pair[system] = clean;
    if (Object.keys(pair).length) next.policies[id] = pair; else delete next.policies[id];
  } else if (clean === undefined) delete next.policies[id];
  else next.policies[id] = clean;
  return next;
}

/** A new document without one app's policies ('*' = the ones for every app); with no app, without any. The office name stays. */
export function resetDoc(doc, { app = null } = {}) {
  const next = { ...emptyDoc(), office: String(doc?.office || ''), policies: {} };
  if (app === null) return next;
  for (const [id, v] of Object.entries(plain(doc?.policies) ? doc.policies : {})) if (BY_ID.get(id)?.app !== app) next.policies[id] = v;
  return next;
}

export function countSet(doc, app = null) {
  return Object.keys(plain(doc?.policies) ? doc.policies : {}).filter((id) => { const p = BY_ID.get(id); return p && (app === null || p.app === app); }).length;
}

/** The file: the document with the day it was saved, keys in the list's order so two saves of the same policies are the same text. */
export function toFile(doc, { now = new Date() } = {}) {
  const { doc: clean } = cleanDoc(doc);
  const policies = {};
  for (const p of POLICIES) if (clean.policies[p.id] !== undefined) policies[p.id] = clean.policies[p.id];
  return JSON.stringify({ format: FORMAT, version: VERSION, office: clean.office, saved: now.toISOString().slice(0, 19) + 'Z', policies }, null, 2) + '\n';
}

/** A file's text → the document. An id this version does not know is left out and named in `ignored`; `newer` says a later version wrote it. */
export function fromFile(text, { optionsOf = null } = {}) {
  if (typeof text !== 'string' || text.length > MAX_FILE) return { ok: false, error: 'size' };
  let raw;
  try { raw = JSON.parse(text.replace(/^﻿/, '')); } catch (e) { return { ok: false, error: 'json' }; }
  if (!plain(raw) || raw.format !== FORMAT || !Number.isInteger(raw.version) || raw.version < 1 || !plain(raw.policies)) return { ok: false, error: 'format' };
  const { doc, ignored } = cleanDoc(raw, { optionsOf });
  return { ok: true, doc, ignored, newer: raw.version > VERSION };
}

/** '{n}' and friends replaced by vars.n; a token that is not in vars stays as typed (so a typing slip is seen, not swallowed). */
export function fillPattern(pattern, vars = {}) {
  return String(pattern ?? '').replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
}
/** The tokens of a level name: level i (0-based, the lowest first) → n (1, 2, 3), n0 (0, 1, 2), nn (01, 02), nn0 (00, 01). */
export function levelNameVars(i) {
  const two = (v) => String(v).padStart(2, '0');
  return { n: i + 1, n0: i, nn: two(i + 1), nn0: two(i) };
}
export const validId = (id) => ID_RE.test(String(id));
