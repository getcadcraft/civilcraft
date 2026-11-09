/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Chip design add-on — Source and Hierarchy panels (0.9 HD.1). DOM-light: all logic is in session.js / hier.js; this file only draws.
 *
 *   panels(ctx) → [{id:'chip-source', title, mount(el, ctx)}, {id:'chip-hierarchy', title, mount(el, ctx)}]
 *   ctx = { files: {list(), read(name), write(name, text)}, problems: {set(source, rows)}, t(key, vars), knownCells?() → [names],
 *           reveal?(file, line, col), focus?(tabId), outputPrefix? ('out/') }   (list/read/write may return promises)
 * Each mount returns {refresh(), destroy()}. The panels of one ctx share one session (sessionFor).
 */
import { sessionFor, gutterMarks, offsetOf } from './session.js';
import { flattenTree } from './hier.js';
import { rowText, fill } from './problems.js';
import EN from './strings.en.js';

export const tr = (ctx, key, vars = {}) => {
  const s = ctx && typeof ctx.t === 'function' ? ctx.t(key, vars) : null;
  return fill(typeof s === 'string' && s && s !== key ? s : EN[key] || key, vars);
};

export function h(doc, tag, attrs = {}, ...kids) {
  const e = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(typeof k === 'string' ? doc.createTextNode(k) : k);
  return e;
}

export const CSS = `
.chip-src{display:flex;flex-direction:column;gap:6px;height:100%;min-height:320px;font-size:13px}
.chip-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.chip-bar select,.chip-bar button,.chip-bar input{font:inherit;padding:2px 6px}
.chip-ed{position:relative;display:grid;grid-template-columns:auto 1fr;flex:1 1 auto;min-height:200px;border:1px solid var(--ws-line,#bbb);overflow:hidden}
.chip-gut{margin:0;padding:4px 4px 4px 2px;text-align:right;user-select:none;overflow:hidden;color:var(--chip-muted,#888);background:var(--ws-panel-bg,transparent);border-right:1px solid var(--ws-line,#ccc)}
.chip-gut span{display:block}
.chip-gut .error{color:#c92a2a;font-weight:700}.chip-gut .warning{color:#b26a00;font-weight:700}.chip-gut .note{color:#1864ab}
.chip-ta{margin:0;padding:4px;border:0;resize:none;outline:none;white-space:pre;overflow:auto;background:transparent;color:inherit;tab-size:2}
.chip-gut,.chip-ta{font:12px/18px ui-monospace,Menlo,Consolas,monospace}
.chip-sum{font-size:12px}
.chip-list{list-style:none;margin:0;padding:0;max-height:30%;overflow:auto;font-size:12px}
.chip-list li{padding:2px 4px;cursor:pointer;border-bottom:1px solid var(--ws-line,#eee)}
.chip-list li:hover{background:rgba(127,127,127,.12)}
.chip-sev{display:inline-block;min-width:4.5em;font-weight:600}.chip-sev.error{color:#c92a2a}.chip-sev.warning{color:#b26a00}.chip-sev.note{color:#1864ab}
.chip-tree{list-style:none;margin:0;padding:0;font:12px/20px ui-monospace,Menlo,Consolas,monospace;overflow:auto}
.chip-tree li{cursor:pointer;white-space:nowrap}.chip-tree li:hover{background:rgba(127,127,127,.12)}
.chip-tag{font:11px system-ui,sans-serif;border:1px solid currentColor;border-radius:3px;padding:0 3px;margin-left:6px;opacity:.85}
.chip-tag.missing,.chip-tag.cycle{color:#c92a2a}.chip-tag.unused{color:#b26a00}.chip-tag.top{color:#2b8a3e}.chip-tag.testbench{color:#1864ab}
.chip-empty{opacity:.75;padding:8px}
`;
export function ensureCss(doc) {
  if (doc.getElementById('chip-hdl-css')) return;
  const s = doc.createElement('style'); s.id = 'chip-hdl-css'; s.textContent = CSS; (doc.head || doc.documentElement).append(s);
}

/** Jump to a place: the host's reveal() first, else the Source panel of this ctx. */
export function reveal(ctx, file, line, col) {
  const ses = sessionFor(ctx);
  if (file && ses.files.has(file)) ses.select(file);
  if (typeof ctx.focus === 'function' && file && ses.files.has(file)) { try { ctx.focus('chip-source'); } catch { /* host without that tab */ } }   // the add-on host's tab switch
  ses.emit('reveal', { file, line, col });
  if (typeof ctx.reveal === 'function') ctx.reveal(file, line, col);
}

function mountSource(el, ctx) {
  const doc = el.ownerDocument, ses = sessionFor(ctx), T = (k, v) => tr(ctx, k, v);
  ensureCss(doc);
  const fileSel = h(doc, 'select', { 'aria-label': T('chip.src.file') });
  const topSel = h(doc, 'select', { 'aria-label': T('chip.src.top') });
  const btnSave = h(doc, 'button', { type: 'button', text: T('chip.src.save') });
  const btnCheck = h(doc, 'button', { type: 'button', text: T('chip.src.check') });
  const btnNew = h(doc, 'button', { type: 'button', text: T('chip.src.new') });
  const gut = h(doc, 'pre', { class: 'chip-gut', 'aria-hidden': 'true' });
  const ta = h(doc, 'textarea', { class: 'chip-ta', spellcheck: 'false', wrap: 'off', 'aria-label': T('chip.src.editor') });
  const sum = h(doc, 'div', { class: 'chip-sum', role: 'status' });
  const list = h(doc, 'ul', { class: 'chip-list' });
  const root = h(doc, 'div', { class: 'chip-src' },
    h(doc, 'div', { class: 'chip-bar' }, h(doc, 'label', {}, T('chip.src.file') + ' ', fileSel), btnNew, btnSave, btnCheck, h(doc, 'label', {}, T('chip.src.top') + ' ', topSel)),
    h(doc, 'div', { class: 'chip-ed' }, gut, ta), sum, list);
  el.replaceChildren(root);
  let timer = null;

  const drawFiles = () => {
    const names = ses.names();
    fileSel.replaceChildren(...names.map((n) => h(doc, 'option', { value: n, selected: n === ses.current, text: n + (ses.dirty.has(n) ? ' *' : '') })));
    ta.disabled = !names.length;
    if (!names.length) { ta.value = ''; ta.placeholder = T('chip.src.nofiles'); }
  };
  const drawTop = () => {
    const r = ses.result, mods = r.modules.map((m) => m.name).sort();
    const auto = r.hier && r.hier.top ? T('chip.src.topAuto', { name: r.hier.top }) : T('chip.src.topAutoNone');
    topSel.replaceChildren(h(doc, 'option', { value: '', text: auto, selected: !ses.top }), ...mods.map((m) => h(doc, 'option', { value: m, text: m, selected: m === ses.top })));
  };
  const drawGutter = () => {
    const lines = ta.value.split('\n').length, marks = gutterMarks(ses.rows(), ses.current);
    const out = [];
    for (let i = 1; i <= lines; i++) {
      const mk = marks.get(i);
      out.push(h(doc, 'span', mk ? { class: mk.severity, title: mk.texts.join('\n') } : {}, (mk ? '● ' : '') + i));
    }
    gut.replaceChildren(...out);
    gut.scrollTop = ta.scrollTop;
  };
  const drawRows = () => {
    const c = ses.counts();
    sum.textContent = c.error + c.warning + c.note ? T('chip.src.count', { errors: c.error, warnings: c.warning, notes: c.note }) : T('chip.src.clean');
    list.replaceChildren(...ses.rows().slice(0, 500).map((r) => h(doc, 'li', { onclick: () => reveal(ctx, r.file, r.line, r.col), title: r.file + ':' + r.line + ':' + r.col },
      h(doc, 'span', { class: 'chip-sev ' + r.severity, text: T('chip.src.sev.' + r.severity) }), ' ', (r.file ? r.file + ':' + r.line + ':' + r.col + ' ' : ''), rowText(r, ctx.t))));
  };
  const showCurrent = () => { ta.value = ses.text(); drawFiles(); drawGutter(); };

  fileSel.addEventListener('change', () => ses.select(fileSel.value));
  topSel.addEventListener('change', () => ses.setTop(topSel.value));
  btnSave.addEventListener('click', async () => { if (ses.current) { await ses.save(); sum.textContent = T('chip.src.saved', { name: ses.current }); drawFiles(); } });
  btnCheck.addEventListener('click', () => ses.check());
  btnNew.addEventListener('click', () => {
    const name = (doc.defaultView && doc.defaultView.prompt ? doc.defaultView.prompt(T('chip.src.newName'), 'top.v') : null);
    if (!name) return;
    if (!ses.addFile(name.trim(), starter(name.trim()))) sum.textContent = T('chip.src.badName');
  });
  ta.addEventListener('input', () => { if (!ses.current) return; ses.edit(ses.current, ta.value); drawGutter(); clearTimeout(timer); timer = setTimeout(() => ses.check(), 400); });
  ta.addEventListener('scroll', () => { gut.scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', (e) => { if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const s = ta.selectionStart; ta.setRangeText('  ', s, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); btnSave.click(); } });

  const offs = [
    ses.on('files', () => drawFiles()),
    ses.on('select', () => showCurrent()),
    ses.on('checked', () => { drawTop(); drawGutter(); drawRows(); drawFiles(); }),
    ses.on('reveal', ({ file, line, col }) => {
      if (file && file !== ses.current) ses.select(file);
      const off = offsetOf(ta.value, line || 1, col || 1);
      ta.focus(); ta.setSelectionRange(off, off);
      ta.scrollTop = Math.max(0, ((line || 1) - 4) * 18);
    }),
  ];
  const refresh = () => ses.load().then(showCurrent);
  if (!ses.loaded) refresh(); else { showCurrent(); drawTop(); drawRows(); }
  return { refresh, destroy: () => { clearTimeout(timer); offs.forEach((f) => f()); el.replaceChildren(); } };
}

/** A first line for a new file: an empty module or entity named after the file. */
export function starter(name) {
  const base = String(name).replace(/^.*\//, '').replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9_]/g, '_') || 'top';
  return /\.vhdl?$/i.test(name) ? 'entity ' + base + ' is\nend entity;\n\narchitecture rtl of ' + base + ' is\nbegin\nend architecture;\n' : 'module ' + base + ' ();\nendmodule\n';
}

/** Hierarchy rows for display (DOM-free): every tree, flattened, with words for the flags. */
export function hierarchyRows(hier, T = (k) => k) {
  if (!hier) return [];
  const out = [];
  for (const t of hier.trees) for (const r of flattenTree(t)) out.push({ ...r, label: (r.inst ? r.inst + ' : ' : '') + r.module, tags: r.flags.map((f) => ({ flag: f, text: T('chip.src.flag.' + f) })) });
  return out;
}

function mountHierarchy(el, ctx) {
  const doc = el.ownerDocument, ses = sessionFor(ctx), T = (k, v) => tr(ctx, k, v);
  ensureCss(doc);
  const head = h(doc, 'div', { class: 'chip-sum', role: 'status' });
  const ul = h(doc, 'ul', { class: 'chip-tree', role: 'tree' });
  el.replaceChildren(h(doc, 'div', { class: 'chip-src' }, head, ul));
  const draw = () => {
    const hier = ses.result.hier, rows = hierarchyRows(hier, T);
    if (!rows.length) { head.textContent = ''; ul.replaceChildren(h(doc, 'li', { class: 'chip-empty', text: T('chip.src.hier.empty') })); return; }
    head.textContent = T('chip.src.hier.summary', { top: hier.top || '-', modules: ses.result.modules.length, missing: hier.missing.length, unused: hier.unused.length });
    ul.replaceChildren(...rows.map((r) => h(doc, 'li', { role: 'treeitem', 'aria-level': r.depth + 1, style: 'padding-left:' + (4 + r.depth * 16) + 'px', title: (r.file || '') + (r.line ? ':' + r.line : ''), onclick: () => reveal(ctx, r.file, r.line, r.col) },
      (r.depth ? '└ ' : '') + r.label, ...r.tags.map((g) => h(doc, 'span', { class: 'chip-tag ' + g.flag, text: g.text })))));
  };
  const off = ses.on('checked', draw);
  if (!ses.loaded) ses.load(); else draw();
  return { refresh: () => ses.load(), destroy: () => { off(); el.replaceChildren(); } };
}

export function panels(ctx) {
  return [
    { id: 'chip-source', title: tr(ctx, 'chip.src.title'), mount: (el, c = ctx) => mountSource(el, c) },
    { id: 'chip-hierarchy', title: tr(ctx, 'chip.src.hier.title'), mount: (el, c = ctx) => mountHierarchy(el, c) },
  ];
}
