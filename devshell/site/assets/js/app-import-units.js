/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-import-units.js — units on import, the page side (0.10 BK.8; the rule and its memory are import-units.js). One dialog for every
 * app and every import path; lab (dev) builds load it from app-shell.inc. An import path that finds no window.ccImportUnits (a
 * released build, a packed edition without it) does what it did before.
 *
 *   const r = await window.ccImportUnits.resolve({ file, format, stated, choices, suggest, again, say });
 *     file     the File (or { name, size, lastModified }, or a name) — the memory is per file
 *     format   what the person calls the file: 'DXF', 'OBJ', 'point cloud' … (shown in the dialog)
 *     stated   the unit id the file itself states (lib/units/unit-table.js ids: mm, cm, m, in, ft, usft …), else null
 *     choices  unit ids to offer (default CHOICES); suggest: the one selected when the dialog opens (never applied without a click)
 *     again    true = ask even when this file was answered before (a "Change units…" control)
 *     say      (text) → the app's status line; told what was used and why, every time
 *   → { unit, how: 'stated' | 'remembered' | 'asked', text } or null when the person cancels: then NOTHING is placed.
 *   recall(file) · remember(file, unit) · forget(file | null) · CHOICES · unitName(id)
 * The dialog is a native <dialog> (the shell drags and remembers it like every other); Esc or Cancel = null.
 * The command palette has "Ask again for the units of imported files" (forgets every remembered answer).
 */
import { decide, recall, remember, forget, CHOICES, isUnit, fileKey, statedInText, MM_PER, recallSize, rememberSize } from './import-units.js';

const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const store = () => { try { return window.localStorage; } catch (e) { return null; } };
const unitName = (id) => { const k = 'shell.units.' + id; return window.ccShellT?.has?.(k) ? T(k) : id; };
const nameOf = (file) => String((file && typeof file === 'object' ? file.name : file) || '').slice(0, 120);

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v === null || v === undefined || v === false) continue; if (k === 'className') n.className = v; else n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : String(c));
  return n;
}

let open = null;   // one question at a time: a second import waits for the first answer
function ask({ file, format, choices, suggest }) {
  const prev = open || Promise.resolve();
  const next = prev.then(() => new Promise((done) => {
    const ids = (Array.isArray(choices) && choices.length ? choices : CHOICES).filter(isUnit);
    const select = el('select', { className: 'form-select form-select-sm', id: 'cc-iu-unit', 'data-iu-unit': '' }, ids.map((id) => el('option', { value: id, selected: id === suggest }, unitName(id))));
    const okBtn = el('button', { type: 'submit', className: 'btn btn-primary btn-sm', value: 'ok', 'data-iu-ok': '' }, T('shell.iu.use'));
    const cancel = el('button', { type: 'button', className: 'btn btn-outline-secondary btn-sm', 'data-iu-cancel': '' }, T('shell.iu.cancel'));
    const form = el('form', { method: 'dialog', className: 'cc-iu-form' },
      el('h2', { className: 'cc-iu-title', id: 'cc-iu-title' }, T('shell.iu.title', { file: nameOf(file) || T('shell.iu.thisfile') })),
      el('p', { className: 'cc-iu-text' }, T('shell.iu.text', { format: format || T('shell.iu.file') })),
      el('label', { className: 'cc-iu-label', for: 'cc-iu-unit' }, T('shell.iu.label')), select,
      el('p', { className: 'cc-iu-note' }, T('shell.iu.note')),
      el('div', { className: 'cc-iu-actions' }, cancel, okBtn));
    const dlg = el('dialog', { className: 'cc-iu-dialog', 'data-import-units': '', 'aria-labelledby': 'cc-iu-title' }, form);
    let answer = null;
    form.addEventListener('submit', () => { answer = isUnit(select.value) ? select.value : null; });
    cancel.addEventListener('click', () => dlg.close());
    dlg.addEventListener('close', () => { dlg.remove(); done(answer); });
    document.body.append(dlg);
    dlg.showModal();
    select.focus();
  }));
  open = next.catch(() => null);
  return next;
}

export async function resolve({ file = null, format = '', stated = null, choices = null, suggest = null, again = false, say = null } = {}) {
  const d = decide({ file, stated, storage: store(), again });
  const name = nameOf(file) || T('shell.iu.thisfile');
  let unit = d.unit, how = d.how;
  if (how === 'ask') {
    unit = await ask({ file, format, choices, suggest: isUnit(suggest) ? suggest : (again ? recall(store(), file) : null) });
    if (!unit) { const text = T('shell.iu.cancelled', { file: name }); if (say) say(text); return null; }
    remember(store(), file, unit);
    how = 'asked';
  }
  const v = { file: name, unit: unitName(unit) };
  const text = how === 'stated' ? T('shell.iu.said.stated', v) : how === 'remembered' ? T('shell.iu.said.remembered', v) : T('shell.iu.said.asked', v);
  if (say) say(text);
  return { unit, how, text };
}

const api = { resolve, recall: (file) => recall(store(), file), remember: (file, unit) => remember(store(), file, unit), forget: (file = null) => forget(store(), file), CHOICES, unitName, fileKey, statedInText, MM_PER,
  /** A picture's size: the width of the whole picture in mm as the person last set it for this file (a picture has no units; BK.8), or null. */
  recallSize: (file) => recallSize(store(), file), rememberSize: (file, widthMm) => rememberSize(store(), file, widthMm) };
window.ccImportUnits = api;

const style = el('style', {}, '.cc-iu-dialog { width: min(30rem, calc(100vw - 2rem)); padding: 1rem 1.25rem; border: 1px solid var(--line, #c9ced6); border-radius: var(--radius, .375rem); background: var(--sheet, #fff); color: var(--ink, #1d2733); }' +
  ' .cc-iu-dialog::backdrop { background: rgba(0, 0, 0, .35); } .cc-iu-title { margin: 0 0 .5rem; font-size: 1.0625rem; font-weight: 600; overflow-wrap: anywhere; } .cc-iu-text, .cc-iu-note { margin: 0 0 .75rem; font-size: .875rem; }' +
  ' .cc-iu-note { color: var(--ink-2, #5b6573); } .cc-iu-label { display: block; margin-bottom: .25rem; font-size: .875rem; font-weight: 600; } .cc-iu-form select { margin-bottom: .75rem; } .cc-iu-actions { display: flex; justify-content: flex-end; gap: .5rem; }');
(document.head || document.documentElement).append(style);

const palette = () => window.ccPalette?.register?.([{ id: 'import-units-forget', label: T('shell.iu.forget.cmd'), group: 'shell', keywords: 'units import ask again millimeters inches feet meters file scale remembered',
  run: () => { api.forget(null); window.ccShellScreen?.say?.(T('shell.iu.forget.done')); } }]);
if (window.ccPalette) palette(); else window.addEventListener('load', palette);
