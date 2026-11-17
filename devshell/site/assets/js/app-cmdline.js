/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-cmdline.js — the command line docked in the status strip, for every app whose layout asks for one (0.10 BK.34, session
 * bk-r3-shell-10; UI.9 "command line anywhere" is this component: there is no second one). The layout's status bar block says
 * `"command": true` (app-workspace.js mountStatusbar builds it with dockedCommandLine()). While that field is on screen the shell's
 * key gate (app-input-ui.js, lab builds) sends every plain letter or digit typed outside a field to it: type anywhere.
 *
 *   matchWord(word, list)      DOM-free. A typed word → a command id | null. list = [{ id, label, words: ['WALL','WA'], keys: ['W','W A'] }]
 *                              In order: a typed word of the style; a key of the command typed as letters ("WA" for the keys W A, "W" for W);
 *                              the command's own name ("wall", "Split wall"); then a unique start of a word; then a unique start of a
 *                              name (two letters or more). Nothing here is written per command: words, keys and names are the registry's.
 *   suggest(text, list, max)   DOM-free. What could be meant by the letters so far: [{ id, label, word, key }], exact first.
 *   makeHistory(storage, key)  { items (oldest first, live), add(word) } kept in localStorage `cc-cmd-history:<app>` (50 words; the
 *                              same word twice in a row is kept once). app-input-ui.js gives a style's own command line the same one.
 *   dockedCommandLine({ t, app })  → the <form> for the status strip. Focus (a click, Tab, or the first key typed anywhere) opens the
 *                              history above the strip; Up / Down walk it (or the suggestions while something is typed); Enter runs
 *                              the marked line or the typed word; Space runs a word that is exactly a command word or key; Esc
 *                              empties the field and gives the keys back to the drawing. An unknown word opens the command finder
 *                              with it (as before). The list is a listbox the field owns (aria-activedescendant), never a focus trap.
 *                              The list and the history are for lab (dev) builds (the page's #cc-input says `lab`); a released page
 *                              keeps the plain field: Enter hands the word to the style's words, else the command finder.
 */

const up = (s) => String(s ?? '').trim().toUpperCase();
const bare = (s) => up(s).replace(/[^A-Z0-9]/g, '');
/** A key sequence as the letters a person would type for it ("W A" → "WA"); '' for keys with Ctrl / Alt / F-keys / names. */
export const keyLetters = (k) => (/^((Shift\+)?[A-Z0-9])( (Shift\+)?[A-Z0-9])*$/.test(k || '') ? k.replace(/Shift\+| /g, '') : '');

export function matchWord(word, list) {
  const w = up(word), b = bare(word);
  if (!w || !Array.isArray(list)) return null;
  for (const c of list) if ((c.words || []).includes(w)) return c.id;
  for (const c of list) if ((c.keys || []).some((k) => keyLetters(k) === w)) return c.id;
  if (b) for (const c of list) if (bare(c.label) === b) return c.id;
  let hits = list.filter((c) => (c.words || []).some((x) => x.startsWith(w)));
  if (hits.length === 1) return hits[0].id;
  if (hits.length > 1 || b.length < 2) return null;
  hits = list.filter((c) => bare(c.label).startsWith(b));
  return hits.length === 1 ? hits[0].id : null;
}

export function suggest(text, list, max = 8) {
  const w = up(text), b = bare(text);
  if (!w || !Array.isArray(list)) return [];
  const out = [];
  for (const c of list) {
    const words = c.words || [], letters = (c.keys || []).map(keyLetters).filter(Boolean);
    const key = letters[0] || '';
    let rank = -1, word = '';
    if (words.includes(w)) { rank = 0; word = w; }
    else if (letters.includes(w)) { rank = 1; word = w; }
    else if (b && bare(c.label) === b) { rank = 2; word = words[0] || up(c.label); }
    else if (words.some((x) => x.startsWith(w))) { rank = 3; word = words.find((x) => x.startsWith(w)); }
    else if (b && bare(c.label).startsWith(b)) { rank = 4; word = words[0] || up(c.label); }
    if (rank >= 0) out.push({ id: c.id, label: c.label, word, key, rank });
  }
  out.sort((x, y) => x.rank - y.rank || x.word.length - y.word.length || x.label.localeCompare(y.label));
  return out.slice(0, Math.max(1, max)).map(({ rank, ...r }) => r);
}

export const HISTORY_MAX = 50;
export function makeHistory(storage, key, max = HISTORY_MAX) {
  let items = [];
  try { const v = JSON.parse(storage?.getItem(key) || '[]'); if (Array.isArray(v)) items = v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.slice(0, 80)).slice(-max); } catch (e) { items = []; }
  return {
    items,
    add(word) {
      const w = String(word ?? '').trim().slice(0, 80);
      if (!w || items[items.length - 1] === w) return;
      items.push(w); while (items.length > max) items.shift();
      try { storage?.setItem(key, JSON.stringify(items)); } catch (e) { /* this tab keeps it */ }
    },
  };
}

// ------------------------------------------------------------------------------------------------------------------ the page side
function node(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v === null || v === undefined || v === false) continue; if (k === 'className') n.className = v; else n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : String(c));
  return n;
}
let seq = 0;

export function dockedCommandLine({ t, app = '' } = {}) {
  const id = 'ws-cmd-pop-' + (++seq);
  const field = node('input', { type: 'text', className: 'ws-cmd-input', 'data-ws-cmd': '', autocomplete: 'off', spellcheck: 'false', placeholder: t('shell.ws.cmd.placeholder'),
    'aria-label': t('shell.ws.cmd'), role: 'combobox', 'aria-expanded': 'false', 'aria-controls': id, 'aria-autocomplete': 'list' });
  const pop = node('ul', { className: 'ws-cmd-pop', id, role: 'listbox', 'aria-label': t('shell.ws.cmd.history'), hidden: true });
  const form = node('form', { className: 'ws-cmdline', role: 'search', 'aria-label': t('shell.ws.cmd') }, node('span', { 'aria-hidden': 'true' }, '›'), field, pop);
  let fallback = null, rows = [], at = -1;
  // lab (dev) builds only, until the row is released: a released page keeps the plain field it had (Enter hands the word on, no list)
  const lab = (() => { try { return !!JSON.parse(document.getElementById('cc-input')?.textContent || '{}').lab; } catch (e) { return false; } })();
  const input = () => window.ccInput || null;
  const history = () => input()?.history || (fallback ||= makeHistory((() => { try { return localStorage; } catch (e) { return null; } })(), 'cc-cmd-history:' + app));
  const words = () => input()?.words?.() || [];

  function place() {
    const r = form.getBoundingClientRect(), w = form.ownerDocument.defaultView || window;
    pop.style.left = Math.max(4, r.left) + 'px'; pop.style.bottom = Math.max(4, w.innerHeight - r.top + 2) + 'px'; pop.style.minWidth = Math.max(r.width, 224) + 'px';
  }
  function close() { pop.hidden = true; rows = []; at = -1; field.setAttribute('aria-expanded', 'false'); field.removeAttribute('aria-activedescendant'); }
  function mark(i) {
    at = i;
    [...pop.children].forEach((li, k) => li.setAttribute('aria-selected', String(k === at)));
    if (at >= 0 && pop.children[at]) { field.setAttribute('aria-activedescendant', pop.children[at].id); pop.children[at].scrollIntoView?.({ block: 'nearest' }); } else field.removeAttribute('aria-activedescendant');
  }
  /** The list: the history (newest at the bottom, next to the field) while the field is empty, else what the letters could mean. */
  function fill() {
    if (!lab) return;
    const q = field.value.trim();
    if (q) rows = suggest(q, words()).map((s) => ({ text: s.word, label: s.label, key: s.key, id: s.id }));
    else rows = history().items.slice(-12).map((w) => ({ text: w, label: '', key: '' }));
    pop.setAttribute('aria-label', t(q ? 'shell.ws.cmd.matches' : 'shell.ws.cmd.history'));
    if (!rows.length) { close(); return; }
    pop.replaceChildren(...rows.map((r, i) => node('li', { role: 'option', id: id + '-' + i, 'aria-selected': 'false', 'data-ws-cmd-row': r.text },
      node('span', { className: 'ws-cmd-word' }, r.text), r.label ? node('span', { className: 'ws-cmd-name' }, r.label) : null, r.key && r.key !== r.text ? node('kbd', {}, r.key) : null)));
    pop.hidden = false; field.setAttribute('aria-expanded', 'true'); place(); mark(-1);
    if (!q) pop.scrollTop = pop.scrollHeight;
  }
  /** Run what was typed: the style's words, the command's keys or name (ccInput.typed), else the command finder with the words. */
  function run(text) {
    const q = String(text ?? '').trim();
    if (!q) return false;
    history().add(q.toUpperCase());
    field.value = ''; close();
    if (input()?.typed?.(q)) { field.blur(); return true; }
    if (!window.ccPalette?.open) return false;
    window.ccPalette.open();
    const box = document.querySelector('.shell-palette-input'); if (box) { box.value = q; box.dispatchEvent(new Event('input', { bubbles: true })); }
    return true;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); run(at >= 0 && rows[at] ? rows[at].text : field.value); });
  field.addEventListener('focus', fill);
  field.addEventListener('input', fill);
  field.addEventListener('blur', () => setTimeout(() => { if (form.ownerDocument.activeElement !== field) close(); }, 120));
  field.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (pop.hidden) fill();
      if (!rows.length) return;
      e.preventDefault(); e.stopPropagation();
      // the history reads upward from the field (newest nearest), so Up starts at the bottom row; suggestions read down from the top
      const hist = !field.value.trim() || (at >= 0 && rows[at] && !rows[at].label);
      const n = rows.length, d = e.key === 'ArrowUp' ? -1 : 1;
      const next = at < 0 ? (hist ? (d < 0 ? n - 1 : 0) : (d > 0 ? 0 : n - 1)) : Math.min(n - 1, Math.max(0, at + d));
      mark(next);
      if (hist) { field.value = rows[next].text; }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); field.value = ''; close(); field.blur(); return; }
    if (e.key === ' ' && field.value.trim() && !/\s/.test(field.value.trim())) {
      // Space ends a word that is exactly a command word or a command's key (the draughting habit); any other text takes the space
      const w = field.value.trim().toUpperCase();
      if (words().some((c) => (c.words || []).includes(w) || (c.keys || []).some((k) => keyLetters(k) === w))) { e.preventDefault(); e.stopPropagation(); run(field.value); }
    }
  });
  pop.addEventListener('pointerdown', (e) => { const li = e.target.closest?.('[data-ws-cmd-row]'); if (!li) return; e.preventDefault(); run(li.getAttribute('data-ws-cmd-row')); });
  window.addEventListener('resize', () => { if (!pop.hidden) place(); });
  return form;
}
