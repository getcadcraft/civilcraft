/* SPDX-License-Identifier: Apache-2.0 */
/**
 * eg-win.js — the small window kit the round-2 CivilCraft tools share (0.8 EG.69/70/71/63/12/39): a non-modal window, a labelled number or text box
 * that writes into an object, a table, a CSV, a download, remembered settings. DOM only; the words come from the callers' t() keys.
 *
 *   openWin(ctx, id, titleKey, build) → { dlg, body, redraw() }     build(body, win) fills body; redraw() calls it again
 *   field(ctx, label, obj, key, { unit, id, min, max, kind, options, onChange }) → [labelEl, inputEl]    kind 'num' (default) | 'text' | 'select' | 'check'
 *   table(ctx, head, rows, attr) → element        rows are arrays of strings or elements; numbers right-aligned by the 'num' class on strings starting with a digit or sign
 *   csv(head, rows) → text (CRLF, formula cells quoted)
 *   saved(key, defaults) → object · save(key, obj)           localStorage with try/catch; this visit only when it is blocked
 */
import { t } from './i18n.js';

export function saved(key, defaults) {
  try { const s = JSON.parse(localStorage.getItem('civilcraft.' + key) || 'null'); if (s && typeof s === 'object') return { ...defaults, ...s }; } catch { /* defaults */ }
  return { ...defaults };
}
export function save(key, obj) { try { localStorage.setItem('civilcraft.' + key, JSON.stringify(obj)); } catch { /* this visit only */ } }

export function openWin(ctx, id, titleKey, build, { wide = false } = {}) {
  const { el } = ctx;
  document.getElementById(id)?.remove();
  const body = el('div', { className: 'cv-dlg-body', 'data-eg-body': id });
  const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('eg.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg' + (wide ? ' cv-egwide' : ''), id, 'aria-labelledby': id + '-h', 'data-eg-dialog': id },
    el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t(titleKey)), close), body));
  const win = { dlg, body, redraw: () => build(body, win), onClose: null };
  close.onclick = () => dlg.close();
  dlg.addEventListener('close', () => { win.onClose?.(); dlg.remove(); });
  ctx.root.append(dlg);
  build(body, win);
  dlg.show();   // not modal: the plan stays usable
  return win;
}

export function field(ctx, label, obj, key, { unit = '', id = null, min = -Infinity, max = Infinity, kind = 'num', options = [], onChange = null } = {}) {
  const { el } = ctx, fid = id || 'eg-f-' + key + '-' + Math.random().toString(36).slice(2, 7);
  let inp;
  if (kind === 'select') {
    inp = el('select', { className: 'select-cc cv-input', id: fid }, ...options.map(([v, l]) => el('option', { value: v, selected: obj[key] === v }, l)));
    inp.addEventListener('change', () => { obj[key] = inp.value; onChange?.(obj[key]); });
  } else if (kind === 'check') {
    inp = el('input', { type: 'checkbox', id: fid, checked: !!obj[key] });
    inp.addEventListener('change', () => { obj[key] = inp.checked; onChange?.(obj[key]); });
  } else {
    inp = el('input', { type: 'text', className: 'cv-input', id: fid, value: obj[key] ?? '', inputMode: kind === 'num' ? 'decimal' : 'text', style: kind === 'num' ? 'width:7rem' : undefined });
    inp.addEventListener('change', () => {
      if (kind === 'text') { obj[key] = inp.value; onChange?.(obj[key]); return; }
      const raw = inp.value.trim().replace(',', '.');
      if (raw === '') { inp.setAttribute('aria-invalid', 'true'); return; }
      const v = Number(raw);
      if (!Number.isFinite(v) || v < min || v > max) { inp.setAttribute('aria-invalid', 'true'); return; }
      inp.removeAttribute('aria-invalid'); obj[key] = v; onChange?.(v);
    });
  }
  return [el('label', { className: 'k', for: fid }, label + (unit ? ' (' + unit + ')' : '')), inp];
}

export function table(ctx, head, rows, attr = 'data-eg-table') {
  const { el } = ctx;
  return el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', [attr]: '' },
    el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
    el('tbody', {}, ...rows.map((r) => el('tr', {}, ...r.map((c) => el('td', { className: typeof c === 'string' && /^[+\-−]?[\d.,]/.test(c) ? 'num' : '' }, c)))))));
}

export function csv(head, rows) {
  const q = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?\d/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
}
