/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui-util.js — small DOM and formatting helpers for the CivilCraft UI (copied from CadCraft).
 * el() is the only way file-derived text reaches the page: children are appended as text
 * nodes (textContent semantics), never parsed as HTML. A drawing is untrusted input.
 */

export function el(tag, props = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'className') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k in n && typeof v !== 'string') n[k] = v;
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}

export function fillDl(dl, rows) {
  dl.replaceChildren();
  for (const [k, v] of rows) {
    if (v === null || v === undefined || v === '') continue;
    dl.append(el('dt', {}, k), el('dd', {}, String(v)));
  }
}

export function bytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

export const num = (n) => Number(n).toLocaleString('en-US');

/** A coordinate or length for display: up to 4 decimals, no trailing zeros. */
export function fmt(n) {
  if (!Number.isFinite(n)) return '';
  const a = Math.abs(n) < 1e-10 ? 0 : n;
  return Number(a.toFixed(4)).toString();
}

export const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
