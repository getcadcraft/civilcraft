/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/lib-ui.js — the Library section of the Power lines workspace (0.7 PL.1): the person's own library of conductors,
 * cables, supports, equipment and trench types, in their own categories, beside the starter items and the project's copy.
 *
 *   createLibUi(ctx, { P, edit, U }) → { section, render(), lib() → Map key → item, pickSelect(kind, value, onPick, opts),
 *                                        ensureInProject(keys), nameOf(key), own(), addItems(items) → { added, replaced } | null,
 *                                        exportItems() (own items, else the project's own: what a library file carries),
 *                                        packItems() (own items, else every item the project keeps: what a pack carries) }
 *
 * Where items live: the starter library (library.js, ours), the person's own library in this browser (localStorage
 * civilcraft.powerline.library, format cadcraft-lines), and the project's copy (state.powerlines.items: every item a line, route
 * or equipment uses, so a project opens anywhere). When keys meet, own beats project beats starter. Starter and project items
 * are read-only here: "Copy to my library" makes an own item to edit.
 */

import { KINDS, FIELDS, EQUIP_TYPES, readLibrary, libraryToJson, libraryFromCsv, libraryToCsv, categoryTree, missingFields, starterLibrary, cleanItem, cleanPath } from './library.js';
import { t } from '../i18n.js';

const OWN_KEY = 'civilcraft.powerline.library';
const MAX_OWN_BYTES = 4 * 1024 * 1024;

export function createLibUi(ctx, { P, edit }) {
  const { el } = ctx;
  const starter = starterLibrary();
  let own = loadOwn();
  let kind = 'conductor', query = '', cur = null;
  const section = el('section', { className: 'cv-sec cv-pl-lib', dataset: { plLib: '' }, hidden: true, 'aria-labelledby': 'cv-pl-lib-h' });

  function loadOwn() {
    try { const raw = localStorage.getItem(OWN_KEY); return raw ? readLibrary(JSON.parse(raw)).items : []; } catch { return []; }
  }
  function saveOwn() {
    try {
      const s = JSON.stringify(libraryToJson(own, { name: t('pl.lib.own.name') }));
      if (s.length > MAX_OWN_BYTES) { ctx.say(t('pl.lib.full')); return false; }
      localStorage.setItem(OWN_KEY, s);
    } catch { ctx.say(t('pl.lib.nostore')); return false; }
    return true;
  }
  let cache = { key: '', map: new Map() };
  function lib() {
    const proj = P().state.powerlines?.items || [];
    const key = own.length + ':' + JSON.stringify(proj).length + ':' + (cache.ownStamp || 0);
    if (cache.key === key) return cache.map;
    const m = new Map();
    for (const it of starter) m.set(it.key, it);
    for (const it of proj) m.set(it.key, { ...it, source: m.has(it.key) && m.get(it.key).source === 'starter' ? 'starter' : 'project' });
    for (const it of own) m.set(it.key, { ...it, source: 'own' });
    cache = { key, map: m, ownStamp: cache.ownStamp };
    return m;
  }
  const bump = () => { cache.ownStamp = (cache.ownStamp || 0) + 1; cache.key = ''; };
  const nameOf = (key) => lib().get(key)?.name || (key ? t('pl.lib.missing', { key }) : t('pl.lib.none'));

  /** Copy the items these keys name into the project (an own or starter item a line now uses). Inside an edit. */
  function ensureInProject(keys, s) {
    const m = lib();
    s.items = s.items || [];
    for (const k of keys) {
      if (!k) continue;
      const it = m.get(k);
      if (!it) continue;
      const i = s.items.findIndex((x) => x.key === k);
      const copy = cleanItem(it, []);
      if (!copy) continue;
      if (i < 0) s.items.push(copy); else if (JSON.stringify(s.items[i]) !== JSON.stringify(copy)) s.items[i] = copy;
    }
  }

  /** A select of one kind's items (by category), the current value kept even when it is missing. */
  function pickSelect(k, value, onPick, { id, none = true, filter = null } = {}) {
    const items = [...lib().values()].filter((x) => x.kind === k && (!filter || filter(x)));
    const groups = new Map();
    for (const it of items) { const c = it.category || t('pl.lib.uncat'); if (!groups.has(c)) groups.set(c, []); groups.get(c).push(it); }
    const s = el('select', { className: 'cv-select', id },
      none ? el('option', { value: '' }, t('pl.lib.none')) : null,
      ...[...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([c, list]) => el('optgroup', { label: c }, ...list.sort((a, b) => a.name.localeCompare(b.name)).map((it) => el('option', { value: it.key }, it.name)))));
    if (value && !lib().has(value)) s.prepend(el('option', { value }, t('pl.lib.missing', { key: value })));
    s.value = value || '';
    s.addEventListener('change', () => onPick(s.value || null));
    return s;
  }

  // ---- the section ----
  function render() {
    const m = lib();
    const kindSel = el('select', { className: 'cv-select', id: 'cv-pl-lib-kind', 'data-pl-lib-kind': '' }, ...KINDS.map((k) => el('option', { value: k }, t('pl.kind.' + k))));
    kindSel.value = kind;
    kindSel.addEventListener('change', () => { kind = kindSel.value; cur = null; render(); });
    const q = el('input', { type: 'search', className: 'cv-input', id: 'cv-pl-lib-q', value: query, placeholder: t('pl.lib.search.ph'), 'data-pl-lib-search': '', autocomplete: 'off' });
    q.addEventListener('input', () => { query = q.value; renderTree(); });
    const tree = el('div', { className: 'cv-pl-tree', 'data-pl-lib-tree': '', role: 'tree', 'aria-label': t('pl.lib.tree') });
    const detail = el('div', { className: 'cv-pl-detail', 'data-pl-lib-detail': '' });
    function renderTree() {
      const ql = query.trim().toLowerCase();
      const items = [...m.values()].filter((x) => x.kind === kind && (!ql || (x.name + ' ' + (x.category || '') + ' ' + (x.maker || '') + ' ' + (x.ref || '')).toLowerCase().includes(ql)));
      const node = (n, depth) => {
        const kids = [...n.children.map((c) => node(c, depth + 1)), ...n.items.map((it) => {
          const miss = missingFields(it).length;
          const li = el('li', { role: 'treeitem', 'aria-selected': String(it.key === cur), tabIndex: 0, className: 'cv-pl-item' + (it.key === cur ? ' is-cur' : ''), dataset: { plKey: it.key } },
            el('span', {}, it.name), ' ', el('span', { className: 'cv-pl-src' }, t('pl.lib.src.' + (it.source || 'own'))), miss ? el('span', { className: 'cv-pl-miss', title: t('pl.lib.miss.title') }, ' !') : '');
          const choose = () => { cur = it.key; renderTree(); renderDetail(); };
          li.addEventListener('click', choose);
          li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
          return li;
        })];
        if (!depth) return el('ul', { role: 'group' }, ...kids);
        const d = el('details', { open: depth < 2 || !!ql }, el('summary', {}, n.name), el('ul', { role: 'group' }, ...kids));
        return el('li', { role: 'treeitem' }, d);
      };
      tree.replaceChildren(items.length ? node(categoryTree(items), 0) : el('p', { className: 'cv-note' }, t('pl.lib.empty')));
    }
    function renderDetail() {
      const it = m.get(cur);
      if (!it) { detail.replaceChildren(el('p', { className: 'cv-note' }, t('pl.lib.pick'))); return; }
      const editable = it.source === 'own';
      const rows = FIELDS[it.kind].map((fd) => {
        const id = 'cv-pl-f-' + fd.k;
        const lab = el('label', { for: id }, t('pl.f.' + fd.k.toLowerCase()) + (fd.unit ? ' (' + fd.unit + ')' : '') + (fd.req ? ' *' : ''));
        let inp;
        if (fd.type === 'enum') inp = el('select', { className: 'cv-select', id, disabled: !editable }, el('option', { value: '' }, '—'), ...fd.opts.map((o) => el('option', { value: o }, t('pl.opt.' + o))));
        else inp = el('input', { type: 'text', className: 'cv-input', id, value: it[fd.k] ?? '', disabled: !editable, inputMode: fd.type === 'num' ? 'decimal' : undefined, maxLength: fd.k === 'note' ? 1000 : 200 });
        if (fd.type === 'enum') inp.value = it[fd.k] || '';
        inp.addEventListener('change', () => {
          const i = own.findIndex((x) => x.key === it.key);
          if (i < 0) return;
          const raw = { ...own[i], [fd.k]: fd.type === 'num' ? inp.value.replace(',', '.') : inp.value };
          if (inp.value.trim() === '') delete raw[fd.k];
          const notes = [], c = cleanItem(raw, notes, it.kind);
          if (!c || notes.some((n) => n.field === fd.k)) { inp.setAttribute('aria-invalid', 'true'); ctx.say(t('pl.lib.bad', { field: t('pl.f.' + fd.k.toLowerCase()) })); return; }
          inp.removeAttribute('aria-invalid');
          own[i] = c; saveOwn(); bump(); syncProject(c.key);
          if (fd.k === 'name' || fd.k === 'category') renderTree();
        });
        return [lab, inp];
      });
      const miss = missingFields(it);
      detail.replaceChildren(
        el('h3', { className: 'cv-h3' }, it.name),
        el('p', { className: 'cv-note' }, t('pl.lib.src.long.' + (it.source || 'own'))),
        miss.length ? el('p', { className: 'cv-report is-error', 'data-pl-lib-miss': '' }, t('pl.lib.miss', { fields: miss.map((k) => t('pl.f.' + k.toLowerCase())).join(', ') })) : '',
        el('div', { className: 'cv-props' }, ...rows.flat()),
        el('div', { className: 'cv-actions' },
          !editable ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-copy': '', onclick: () => copyToOwn(it) }, t('pl.lib.copy')) : '',
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-dup': '', onclick: () => copyToOwn(it, true) }, t('pl.lib.dup')),
          editable ? el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', 'data-pl-lib-del': '', onclick: () => removeOwn(it) }, t('pl.lib.del')) : ''));
    }
    const fileIn = el('input', { type: 'file', accept: '.json,.csv,.txt', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-pl-lib-file': '' });
    fileIn.addEventListener('change', async () => { const f = fileIn.files?.[0]; fileIn.value = ''; if (f) await importFile(f); });
    section.replaceChildren(
      el('h2', { className: 'cv-h', id: 'cv-pl-lib-h' }, t('pl.lib.head')),
      el('p', { className: 'cv-note' }, t('pl.lib.lede')),
      el('div', { className: 'cv-props' }, el('label', { for: 'cv-pl-lib-kind' }, t('pl.lib.kind')), kindSel, el('label', { for: 'cv-pl-lib-q' }, t('pl.lib.search')), q),
      tree, detail,
      el('div', { className: 'cv-actions' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-new': '', onclick: () => newOwn() }, t('pl.lib.new')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-import': '', onclick: () => fileIn.click() }, t('pl.lib.import')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-export': '', onclick: () => exportOwn('json') }, t('pl.lib.export')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pl-lib-csv': '', onclick: () => exportOwn('csv') }, t('pl.lib.csv'))),
      el('p', { className: 'cv-note' }, t('pl.lib.counts', { own: own.length, project: (P().state.powerlines?.items || []).length, starter: starter.length })), fileIn);
    renderTree(); renderDetail();
  }

  function syncProject(key) {
    const s = P().state.powerlines;
    if (!s || !(s.items || []).some((x) => x.key === key)) return;
    edit(t('pl.undo.libsync'), (st) => ensureInProject([key], st));
  }
  function copyToOwn(it, dup = false) {
    const c = cleanItem({ ...it, key: undefined, source: undefined, name: dup ? t('pl.lib.copyname', { name: it.name }) : it.name }, [], it.kind);
    if (!c) return;
    own.push(c); if (!saveOwn()) { own.pop(); return; }
    bump(); cur = c.key; render();
    ctx.say(t('pl.lib.copied', { name: c.name }));
  }
  function newOwn() {
    const base = { name: t('pl.lib.newname.' + kind), category: t('pl.lib.mine') };
    if (kind === 'equipment') base.type = EQUIP_TYPES[0];
    const c = cleanItem(base, [], kind);
    own.push(c); if (!saveOwn()) { own.pop(); return; }
    bump(); cur = c.key; render();
    section.querySelector('#cv-pl-f-name')?.focus();
  }
  function removeOwn(it) {
    if (P().state.powerlines && usedBy(it.key)) { ctx.say(t('pl.lib.inuse', { name: it.name })); return; }
    own = own.filter((x) => x.key !== it.key); saveOwn(); bump(); cur = null; render();
    ctx.say(t('pl.lib.deleted', { name: it.name }));
  }
  function usedBy(key) {
    const s = P().state.powerlines;
    return s.lines.some((l) => l.conductor === key || l.equip.includes(key) || l.supports.some((p) => p.support === key || p.equip.includes(key)))
      || s.routes.some((r) => r.cable === key || r.trench === key) || s.equipment.some((e) => e.item === key);
  }
  async function importFile(f) {
    if (f.size > 16 * 1024 * 1024) { ctx.say(t('pl.lib.import.big')); return; }
    const text = await f.text();
    let r;
    try { r = /^\s*[[{]/.test(text) ? readLibrary(JSON.parse(text)) : libraryFromCsv(text, kind); } catch (e) { ctx.say(t('pl.lib.import.bad', { why: String(e.message || e) })); return; }
    if (!r.items.length) { ctx.say(t('pl.lib.import.none', { why: r.notes.map((n) => n.why).join(', ') })); return; }
    const n = addItems(r.items);
    if (n) ctx.say(t('pl.lib.import.done', { added: n.added, replaced: n.replaced, notes: r.notes.length }));
  }
  /** Items (already read as untrusted) into the person's own library: same key = replaced. → { added, replaced } | null (not saved). */
  function addItems(items) {
    const keys = new Set(own.map((x) => x.key));
    let added = 0, replaced = 0;
    for (const it of items) {
      if (it.source === 'starter') delete it.source;
      if (keys.has(it.key)) { own[own.findIndex((x) => x.key === it.key)] = it; replaced++; } else { own.push(it); added++; keys.add(it.key); }
    }
    if (!saveOwn()) { own = loadOwn(); return null; }
    bump(); render();
    return { added, replaced };
  }
  /** What "my library" means for a file: the own items, else the project's (never the starter ones). */
  const exportItems = () => (own.length ? own : [...lib().values()].filter((x) => x.source !== 'starter'));
  /** What a pack carries: the own items, else every item the project keeps a copy of (starter ones included). */
  const packItems = () => (own.length ? own : (P().state.powerlines?.items || []).map((x) => ({ ...x })));
  function exportOwn(fmt) {
    const items = exportItems();
    if (fmt === 'csv') {
      const rows = items.filter((x) => x.kind === kind);
      ctx.download(new TextEncoder().encode('﻿' + libraryToCsv(rows, kind)), ctx.fileStem() + '-' + kind + '-library.csv', 'text/csv');   // i18n-ignore: a file name ending
      ctx.say(t('pl.lib.export.csv', { n: rows.length, kind: t('pl.kind.' + kind) }));
      return;
    }
    ctx.download(new TextEncoder().encode(JSON.stringify(libraryToJson(items, { name: t('pl.lib.own.name') }), null, 1)), ctx.fileStem() + '-library.cclines.json', 'application/json');   // i18n-ignore: a file name ending
    ctx.say(t('pl.lib.export.done', { n: items.length }));
  }

  return { section, render, lib, pickSelect, ensureInProject, nameOf, own: () => own, cleanPath, addItems, exportItems, packItems };
}
