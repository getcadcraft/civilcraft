/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages for a host author (the adapter check) */
/**
 * host.js — the one file of the Engineer module that talks to a host (0.8 CE.12; docs/apps/engineer.md § The host-adapter contract).
 * A host calls setHost(adapter) before it uses the module; it may call it twice, because the CraftScript worker only needs the script
 * part (level 'script') and the page needs the rest (level 'full'): the parts are merged. Every other file reads the host through the
 * names below, so the same bytes run in every host and in Node. DOM-free, and it imports only
 * ./contract.js and ./messages.js (a worker links modules by './name.js' only).
 */
import { checkAdapter } from './contract.js';
import { MESSAGES } from './messages.js';

let H = null;
/** The helpers of the host's CraftScript runtime. Call them through this object at run time; never destructure it when a file loads. */
export const SH = {};
/** The mesh codec of the host (repairMesh, encodeMesh, decodeMesh, readReport, MAX_TRIS). */
export const MESH = {};
/** The field kernel (lib/field, as the host carries it) plus detmath's dpow and dlog10. */
export const F = {};

const fill = (o, from) => { for (const k of Object.keys(o)) delete o[k]; Object.assign(o, from || {}); };
/** Give the module its host. level 'data' = the Generated feature in the host's file; 'script' = the CraftScript builtins (the worker); 'full' = the panel and workspace. Calls merge. */
export function setHost(adapter, level = 'full') {
  const next = { ...(H || {}), ...adapter, script: { ...(H && H.script), ...(adapter && adapter.script) }, mesh: { ...(H && H.mesh), ...(adapter && adapter.mesh) } };
  const bad = checkAdapter(next, level);
  if (bad.length) throw new Error('Engineer host adapter (' + level + '): ' + bad.join('; '));
  H = next;
  fill(SH, H.script); fill(MESH, H.mesh); fill(F, H.field);
  return H;
}
export const host = () => H;
export const hostName = () => (H ? H.name : '');
/** Say a word: the host's catalog first (its language), else the module's own English table. */
export const t = (key, vars) => {
  const s = H && H.t ? H.t(key, vars) : null;
  if (s != null && s !== key) return s;
  let m = MESSAGES[key];
  if (m === undefined) return key;
  if (m && typeof m === 'object') m = (vars && vars.n === 1) ? m.one : m.other;
  return String(m).replace(/\{(\w+)\}/g, (x, k) => (vars && vars[k] !== undefined ? vars[k] : x));
};
export const has = (key) => !!(H && H.has && H.has(key)) || key in MESSAGES;
/** Does this host have a solver of the kind ('stress' | 'thermal' | 'flow')? */
export const hasCheck = (kind) => !!(H && H.checks && H.checks.includes(kind));
