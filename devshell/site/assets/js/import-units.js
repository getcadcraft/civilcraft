/* SPDX-License-Identifier: Apache-2.0 */
/**
 * import-units.js — units on import, the rule and its memory (0.10 BK.8, session bk-r3-shell-10). DOM-free, no imports, Node-tested
 * (bin/test-import-units.mjs). The page side (the one dialog, window.ccImportUnits) is app-import-units.js.
 *
 * THE RULE, for every file brought into a drawing or model (IFC, DWG, DXF, a library item, an OBJ / STL mesh, a point cloud, a picture):
 *   1. the file states its length unit        → it is used, and shown (never asked);
 *   2. it does not, and this file was answered before → the answer is used, and shown as remembered;
 *   3. it does not, and was never answered     → ASK before anything is placed; the answer is remembered for that file.
 * Never a silent guess. An app's import path is a thin adapter: it says what the file states (or null) and waits for the answer.
 *
 *   CHOICES                       the length units offered when nothing narrows them: ids of lib/units/unit-table.js
 *   fileKey(file)                 'name|size|lastModified' in lower case, from a File, { name, size, lastModified } or a name alone
 *                                 ('name||'). A file is the same file when all three agree; a path that only knows the name is matched
 *                                 by name.
 *   recall(storage, file)         → unit id | null         remember(storage, file, unit)         forget(storage, file | null = all)
 *   statedInText(text)            the unit a point list / CSV states in its first lines ("units: ft", "Elevation (m)"), or null
 *   MM_PER                        mm in one unit (mm cm m in ft usft)
 *   recallSize(storage, file) · rememberSize(storage, file, widthMm)   a picture's width in mm as last set, per file (a picture has no units)
 *   decide({ file, stated, storage, again }) → { how: 'stated' | 'remembered' | 'ask', unit: id | null }   (again: ask even if remembered)
 * Stored: one JSON map under localStorage `cc-import-units` { key: [unit, time] }, the 300 most recent files, shared by every app on
 * this origin (a file answered in CadCraft is not asked again in BimCraft).
 */

export const STORE_KEY = 'cc-import-units';
export const MAX_FILES = 300;
export const CHOICES = Object.freeze(['mm', 'cm', 'm', 'in', 'ft', 'usft']);
const UNIT_RE = /^[a-z][a-z0-9-]{0,15}$/;
export const isUnit = (u) => typeof u === 'string' && UNIT_RE.test(u);

const clean = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f|]/g, ' ').trim().slice(0, 200).toLowerCase();
export function fileKey(file) {
  if (file === null || file === undefined) return '';
  if (typeof file === 'string') return clean(file) ? clean(file) + '||' : '';
  const name = clean(file.name);
  if (!name) return '';
  const n = (v) => (Number.isFinite(v) && v >= 0 ? String(Math.round(v)) : '');
  return name + '|' + n(file.size) + '|' + n(file.lastModified);
}
const nameOnly = (key) => key.split('|')[0] + '||';

function read(storage) {
  try { const v = JSON.parse(storage?.getItem(STORE_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; }
}
function write(storage, map) {
  const rows = Object.entries(map).filter(([k, v]) => k && Array.isArray(v) && isUnit(v[0])).sort((a, b) => (b[1][1] || 0) - (a[1][1] || 0)).slice(0, MAX_FILES);
  try { storage?.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(rows))); } catch (e) { /* storage may be off: asked again next time */ }
}

export function recall(storage, file) {
  const key = fileKey(file);
  if (!key) return null;
  const map = read(storage);
  // a path that knows only the name: the newest answer given for any file of that name; a full file: its own answer, else the one given by name
  const hit = key === nameOnly(key) ? Object.entries(map).filter(([k]) => nameOnly(k) === key).sort((a, b) => (b[1]?.[1] || 0) - (a[1]?.[1] || 0))[0]?.[1] : map[key] || map[nameOnly(key)];
  return Array.isArray(hit) && isUnit(hit[0]) ? hit[0] : null;
}
export function remember(storage, file, unit, now = Date.now()) {
  const key = fileKey(file);
  if (!key || !isUnit(unit)) return false;
  const map = read(storage);
  map[key] = [unit, now];
  write(storage, map);
  return true;
}
/** A picture file's size as the person last set it: the WIDTH of the whole picture in mm (kept in the same map under 'pic:' + its key). */
export function recallSize(storage, file) {
  const key = fileKey(file);
  if (!key) return null;
  const map = read(storage), hit = key === nameOnly(key) ? Object.entries(map).filter(([k]) => k.startsWith('pic:') && nameOnly(k.slice(4)) === key).sort((a, b) => (b[1]?.[1] || 0) - (a[1]?.[1] || 0))[0]?.[1] : map['pic:' + key] || map['pic:' + nameOnly(key)];
  return Array.isArray(hit) && hit[0] === 'px' && Number.isFinite(hit[2]) && hit[2] > 0 ? hit[2] : null;
}
export function rememberSize(storage, file, widthMm, now = Date.now()) {
  const key = fileKey(file);
  if (!key || !(Number.isFinite(widthMm) && widthMm > 0)) return false;
  const map = read(storage);
  map['pic:' + key] = ['px', now, widthMm];
  write(storage, map);
  return true;
}
export function forget(storage, file = null) {
  if (file === null) { try { storage?.removeItem(STORE_KEY); } catch (e) { /* nothing kept */ } return; }
  const key = fileKey(file), map = read(storage);
  if (!key) return;
  for (const k0 of Object.keys(map)) { const k = k0.startsWith('pic:') ? k0.slice(4) : k0; if (k === key || (key === nameOnly(key) && nameOnly(k) === key)) delete map[k0]; }
  write(storage, map);
}

const WORDS = { m: 'm', meter: 'm', meters: 'm', metre: 'm', metres: 'm', ft: 'ft', foot: 'ft', feet: 'ft', 'international feet': 'ft', usft: 'usft', ftus: 'usft', 'us ft': 'usft', 'us survey foot': 'usft', 'us survey feet': 'usft',
  mm: 'mm', millimeter: 'mm', millimeters: 'mm', millimetre: 'mm', millimetres: 'mm', cm: 'cm', centimeters: 'cm', centimetres: 'cm', in: 'in', inch: 'in', inches: 'in' };
const WORD_LIST = Object.keys(WORDS).sort((a, b) => b.length - a.length);
/** mm in one unit, for the units a text file can state or a person can answer (the exact definitions of lib/units/unit-table.js). */
export const MM_PER = Object.freeze({ mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8, usft: 1200000 / 3937 });
/**
 * The length unit a text file (a list of points, a CSV) states in its first eight lines, or null: a line that says "units: ft" /
 * "# unit = meters", or column headings that carry one unit in brackets ("Easting (m), Northing (m), Elevation (m)"). Headings
 * that carry two different units state nothing (asked).
 */
export function statedInText(text) {
  const head = String(text ?? '').slice(0, 4000).split(/\r?\n/, 8).join('\n').toLowerCase();
  const word = (s) => { const w = s.trim().replace(/\s+/g, ' '); const k = WORD_LIST.find((x) => w === x || w.startsWith(x + ' ') || w.startsWith(x + ',') || w.startsWith(x + ';')); return k ? WORDS[k] : null; };
  const m = /\bunits?\s*[:=]\s*([a-z ]{1,24})/.exec(head);
  if (m && word(m[1])) return word(m[1]);
  const found = new Set();
  for (const x of head.matchAll(/[([]\s*([a-z ]{1,24}?)\s*[)\]]/g)) { const u = WORDS[x[1].trim().replace(/\s+/g, ' ')]; if (u) found.add(u); }
  return found.size === 1 ? [...found][0] : null;
}

export function decide({ file, stated = null, storage = null, again = false } = {}) {
  if (isUnit(stated)) return { how: 'stated', unit: stated };
  const kept = again ? null : recall(storage, file);
  return kept ? { how: 'remembered', unit: kept } : { how: 'ask', unit: null };
}
