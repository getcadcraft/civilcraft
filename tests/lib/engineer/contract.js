/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages for a host author (the adapter check) */
/**
 * contract.js — what a host has to give Engineer (0.8 CE.12). The list is the contract; docs/apps/engineer.md says the same in words.
 * DOM-free; no imports, so a host or a test can read it without setting anything up.
 */
export const CONTRACT = Object.freeze([
  'add a body',                         // features.add / features.byId
  'rerun on input change',              // genKey + the host's setFeature (one undo step) — runtime host, gen-ui.js
  'run a check with the host\'s solvers, or say none',   // checks[] + script.hasBuiltin
  'open the data sheet',                // download() on the runtime host; the module builds the files
  'save and load the Generated feature data',            // readGenerated / GEN_DEFAULTS in the host's file reader
]);
export const CHECK_KINDS = Object.freeze(['stress', 'thermal', 'flow']);
/** The builtin (in the host's CraftScript) each kind of check stands on. */
export const CHECK_BUILTIN = Object.freeze({ stress: 'static_voxel', thermal: 'heat_steady', flow: 'lbm3d' });
const FN = (o, names, where) => names.filter((n) => !o || typeof o[n] !== 'function').map((n) => where + '.' + n + ' is missing');

/**
 * → a list of what is missing from the (merged) adapter for a level ([] = it will do). A host mounts in up to three steps, because the
 * CraftScript worker and the file reader must not load the page:
 *   'data'   the Generated feature in the host's file: name, t, field, mesh
 *   'script' the CraftScript builtins (worker and Node): name, t, field, checks, materials, script.*
 *   'full'   the panel and the workspace in the page: data + checks + features, urls, workerModules, storageKey, script.createEngine
 */
export function checkAdapter(a, level = 'full') {
  if (!a || typeof a !== 'object') return ['no adapter'];
  const bad = [];
  if (typeof a.name !== 'string' || !a.name) bad.push('name is missing');
  if (typeof a.t !== 'function') bad.push('t is missing');
  if (!a.field || typeof a.field.fingerprint !== 'function') bad.push('field is missing (the field kernel)');
  if (level === 'data' || level === 'full') {
    bad.push(...FN(a.mesh, ['repairMesh', 'encodeMesh', 'decodeMesh', 'readReport'], 'mesh'));
    if (!a.mesh || !(a.mesh.MAX_TRIS > 0)) bad.push('mesh.MAX_TRIS is missing');
  }
  if (level === 'script' || level === 'full') {
    if (!Array.isArray(a.checks) || a.checks.some((k) => !CHECK_KINDS.includes(k))) bad.push('checks must be a list of ' + CHECK_KINDS.join(', ') + ' (or [] for none)');
  }
  if (level === 'script') {
    bad.push(...FN(a.script, ['registerBuiltin', 'hasBuiltin', 'asTensor', 'scalarOf', 'mat', 'optsOf', 'typeName', 'tensor', 'voxelMeshOf', 'meshValue'], 'script'));
    if (!a.script || typeof a.script.CsError !== 'function') bad.push('script.CsError is missing');
    if (!Array.isArray(a.materials)) bad.push('materials is missing (the host\'s list of { id, … })');
    if (a.field && typeof a.field.dpow !== 'function') bad.push('field.dpow is missing (add detmath\'s dpow and dlog10)');
  }
  if (level === 'full') {
    bad.push(...FN(a.features, ['add', 'byId'], 'features'));
    bad.push(...FN(a.script, ['createEngine'], 'script'));
    if (!a.urls || !a.urls.generators || !a.urls.craftlib) bad.push('urls.generators and urls.craftlib are missing');
    if (!Array.isArray(a.workerModules) || !a.workerModules.length) bad.push('workerModules is missing (the CraftScript worker\'s modules)');
    if (typeof a.storageKey !== 'string' || !a.storageKey) bad.push('storageKey is missing');
  }
  return bad;
}

/** What a host can check: { stress: true|false, … } and the sentences for the ones it cannot (given the host's t). */
export function describeChecks(a, t = (k) => k) {
  const have = new Set(a && a.checks || []);
  return CHECK_KINDS.map((kind) => ({ kind, available: have.has(kind), builtin: CHECK_BUILTIN[kind], none: have.has(kind) ? '' : t('eng.check.none', { kind }) }));
}
