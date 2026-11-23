/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words for people here. */
/**
 * ui-util-core.js — the part of every app's dev/ui-util.js that was the same text eight times (0.11 PERF.74; drafted by perf-finish-11
 * code, landed by perf-finish-11 round 2 lane util). Canonical copy here; each app's dev/ carries a byte-identical copy
 * (node tools/shell/sync.mjs), and its own ui-util.js re-exports what it uses and keeps what is its own (BimCraft's day / isPlaceholder,
 * MarkupCraft's download / dates, TakeoffCraft's icon / ask …). Proof that each app's el() is the one it had:
 * tools/shell-test/browser-ui-util-core.mjs (old and new module side by side in a real page).
 *
 * makeEl(rules) builds the app's el(): the element builder is the only way file-derived text reaches the page — children are
 * appended as text nodes (textContent semantics), never parsed as HTML; a drawing or model file is untrusted input. The apps' el()
 * differed in a few property rules, so each app passes the rules its own el() had and gets the same function it had:
 *   on: 'any'    `onX: fn` adds an `x` listener (seven apps)  |  'click': only `onClick` adds a click listener (BimCraft)
 *   dataset      `dataset: {…}` is copied into the element's dataset (seven apps; BimCraft's el had no such rule)
 *   textareaValue  `value` on a <textarea> sets its text (MarkupCraft)
 *   htmlFor      `htmlFor` sets the label's for (PartCraft)
 *   styleObject  `style: {…}` is copied into element.style (TakeoffCraft)
 */
export function makeEl({ on = 'any', dataset = true, textareaValue = false, htmlFor = false, styleObject = false } = {}) {
  return function el(tag, props = {}, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'className') n.className = v;
      else if (textareaValue && k === 'value' && n.tagName === 'TEXTAREA') n.value = String(v);
      else if (htmlFor && k === 'htmlFor') n.htmlFor = String(v);
      else if (on === 'click' ? k === 'onClick' : k.startsWith('on') && typeof v === 'function') n.addEventListener(on === 'click' ? 'click' : k.slice(2).toLowerCase(), v);
      else if (dataset && k === 'dataset') Object.assign(n.dataset, v);
      else if (styleObject && k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k in n && typeof v !== 'string') n[k] = v;
      else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of children.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c);
    return n;
  };
}

/** A <dl> from [key, value] rows; empty values are left out. Needs the app's el (passed, so the app's own rules build the rows). */
export function fillDlWith(el, dl, rows) {
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
