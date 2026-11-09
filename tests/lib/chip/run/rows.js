/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rows.js — Problems rows from the Chip design runners (0.9 HD.4–HD.9). DOM-free, no imports. The shape is the shared Problems store's
 * (docs/0.8-PROBLEMS-SPEC.md § 1): an add-on's words are not in the page catalog, so every row carries `text` (English, or the add-on's
 * words when `t` is given) and `msg {key, vars}` for the add-on's own language file (`chip.run.p.<code>`).
 *   row({ source, code, severity, vars, text, file, line, cell, at, key }) → problem
 *   ids are stable between runs and languages: chip.<source>:<code>:<key> (key = file:line, cell, a category + a rounded point …)
 */

export function row({ source, code, severity = 'warning', vars = {}, text, file = '', line = 0, cell = '', at = null, key = '', req, found }) {
  const about = [];
  if (file) about.push({ kind: 'file', id: file, label: line ? file + ':' + line : file });
  if (cell) about.push({ kind: 'cell', id: cell, label: cell });
  const r = {
    id: ('chip.' + source + ':' + code + ':' + (key || [file, line, cell, at ? at.map((v) => Math.round(v * 1000) / 1000).join(',') : ''].filter(Boolean).join(':'))).slice(0, 200),
    code: 'chip.' + source + '.' + code,
    severity: severity === 'error' || severity === 'note' ? severity : 'warning',
    msg: { key: 'chip.run.p.' + code, vars },
    text: String(text || code).slice(0, 600),
    about,
    source: { kind: 'engine', name: source },
  };
  if (at) r.where = { space: '2d', at: [at[0], at[1]] };
  if (req) r.req = req;
  if (found) r.found = found;
  if (file) { r.file = file; r.line = line; }
  return r;
}

/** Fill {name} from vars. */
export const fill = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
