/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plant-table-ui.js — the plant table editor (0.8 LA.6, session `landscape-arch_PART_4`): the project's own plant list as an editable
 * table (add, duplicate, edit, delete, CSV in/out, a plants file out). Every cell edit goes through plants.js patchSpecies (the same
 * checks as an untrusted file) and is one undo step. Also the cultivar + supplied-size picker the Properties of plants, bed mixes and
 * hedges use (variantSelect).
 *
 *   createPlantTable(ctx, { edit(label, fn), LS(), index(), lang(), current() → species key, importList(file) })
 *     → { open(), variantSelect(id, sp, cv, sup, onPick(cv, sup)) }
 */
import { patchSpecies, duplicateSpecies, plantsToCsv, writePlants, displayName, suppliesToText, suppliesFromText, TYPES, cleanSpecies } from './plants.js';
import { t } from '../i18n.js';
import { loadMine, saveList, mergeMine, forLibrary } from './plant-library.js';   // 0.8 LA.6: the person's own Library plant list

const MAX_ROWS = 500;   // rows shown at a time (a bigger list still saves; filter to find a row)

export function createPlantTable(ctx, { edit, LS, index, lang, current, importList }) {
  const { el, root } = ctx;
  const own = () => LS().palette || [];

  /** "Bloodgood; Osakazuki" ↔ cultivars: names typed, keys from the names; a cultivar kept by key keeps its sizes and notes. */
  const cvText = (sp) => (sp.cultivars || []).map((c) => c.name).join('; ');
  const cvFrom = (sp, text) => {
    const was = new Map((sp.cultivars || []).map((c) => [c.key, c]));
    return String(text).split(';').map((x) => x.trim()).filter(Boolean).slice(0, 50).map((name) => {
      const key = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
      return { ...(was.get(key) || {}), key, name };
    });
  };
  const base = () => String(lang() || 'en').split('-')[0];
  const num = (v) => (String(v).trim() === '' ? null : Number(String(v).replace(',', '.')));

  // column → [label key, read(sp) → text, write(sp, text) → patch | null]
  const COLS = [
    ['ls.pt.c.botanical', (s) => s.botanical, (s, v) => ({ botanical: v })],
    ['ls.pt.c.name', (s) => s.names?.[base()] || s.names?.en || '', (s, v) => ({ names: { ...(s.names || {}), [base()]: v } })],
    ['ls.pt.c.type', (s) => s.type, (s, v) => ({ type: v }), TYPES],
    ['ls.pt.c.h', (s) => s.size.mature.h, (s, v) => ({ size: { ...s.size, mature: { ...s.size.mature, h: num(v) } } })],
    ['ls.pt.c.s', (s) => s.size.mature.s, (s, v) => ({ size: { ...s.size, mature: { ...s.size.mature, s: num(v) } } })],
    ['ls.pt.c.spacing', (s) => s.spacing ?? '', (s, v) => ({ spacing: num(v) })],
    ['ls.pt.c.density', (s) => s.density ?? '', (s, v) => ({ density: num(v) })],
    ['ls.pt.c.container', (s) => s.container, (s, v) => ({ container: v })],
    ['ls.pt.c.supplies', (s) => suppliesToText(s.supplies), (s, v) => ({ supplies: suppliesFromText(v) })],
    ['ls.pt.c.cultivars', (s) => cvText(s), (s, v) => ({ cultivars: cvFrom(s, v) })],
    ['ls.pt.c.spec', (s) => s.spec || '', (s, v) => ({ spec: v })],
  ];

  function open() {
    let filter = '';
    const body = el('tbody', {});
    const note = el('p', { className: 'cv-note', 'data-ls-pt-note': '', role: 'status' });
    const q = el('input', { type: 'search', className: 'cv-input', id: 'cv-ls-pt-q', placeholder: t('ls.pl.search.ph'), 'data-ls-pt-search': '', autocomplete: 'off' });
    q.addEventListener('input', () => { filter = q.value.trim().toLowerCase(); render(); });
    function setCell(key, ci, value) {
      const sp = own().find((x) => x.key === key);
      if (!sp) return false;
      const patch = COLS[ci][2](sp, value);
      const r = patchSpecies(sp, patch);
      if (r.why) { note.textContent = t('ls.pt.bad', { why: t('ls.pt.why.' + r.why) }); return false; }
      edit(t('ls.undo.pt.edit', { name: r.sp.botanical }), (l) => { l.palette = (l.palette || []).map((x) => (x.key === key ? r.sp : x)); });
      note.textContent = '';
      return true;
    }
    function render() {
      const list = own().filter((s) => !filter || (s.botanical + ' ' + Object.values(s.names || {}).join(' ') + ' ' + s.key).toLowerCase().includes(filter));
      body.replaceChildren(...list.slice(0, MAX_ROWS).map((sp) => el('tr', { dataset: { lsPtRow: sp.key } },
        ...COLS.map(([lk, read, , opts], ci) => {
          const id = `cv-ls-pt-${sp.key}-${ci}`;   // i18n-ignore: an element id
          let input;
          if (opts) { input = el('select', { className: 'cv-select', id, 'aria-label': t(lk) }, ...opts.map((o) => el('option', { value: o }, t('ls.type.' + o)))); input.value = read(sp); }
          else input = el('input', { type: 'text', className: 'cv-input', id, value: String(read(sp)), 'aria-label': t(lk), maxLength: ci === 10 ? 2000 : 400 });
          input.dataset.lsPtCell = String(ci);
          input.addEventListener('change', () => { if (!setCell(sp.key, ci, input.value)) input.value = String(read(own().find((x) => x.key === sp.key) || sp)); else render(); });
          return el('td', {}, input);
        }),
        el('td', { className: 'cv-ls-pt-act' },
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-ls-pt-dup': sp.key, title: t('ls.pt.dup'), 'aria-label': t('ls.pt.dup'), onclick: () => { edit(t('ls.undo.pt.dup'), (l) => { l.palette = duplicateSpecies(l.palette || [], sp.key); }); render(); } }, el('i', { className: 'bi bi-copy', 'aria-hidden': 'true' })),
          el('button', { type: 'button', className: 'cv-linkbtn', 'data-ls-pt-del': sp.key, title: t('ls.pt.del'), 'aria-label': t('ls.pt.del'), onclick: () => { edit(t('ls.undo.pt.del'), (l) => { l.palette = (l.palette || []).filter((x) => x.key !== sp.key); }); render(); } }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }))))));
      if (list.length > MAX_ROWS) body.append(el('tr', {}, el('td', { colSpan: COLS.length + 1, className: 'cv-note' }, t('ls.pl.more', { n: list.length - MAX_ROWS }))));
      count.textContent = t('ls.pt.count', { n: own().length });
    }
    const count = el('p', { className: 'cv-note', 'data-ls-pt-count': '' });
    const addRow = () => {
      const keys = new Set([...own().map((x) => x.key), ...index().keys()]);
      let k = 'my-plant', n = 2;
      while (keys.has(k)) k = 'my-plant-' + n++;
      const sp = cleanSpecies({ key: k, botanical: t('ls.pt.newname'), type: 'shrub', size: { mature: { h: 1, s: 1 } } }).sp;
      edit(t('ls.undo.pt.add'), (l) => { l.palette = [...(l.palette || []), sp]; });
      render();
    };
    const addCurrent = () => {
      const sp = index().get(current());
      if (!sp) { ctx.say(t('ls.need.species')); return; }
      if (own().some((x) => x.key === sp.key)) { ctx.say(t('ls.pt.already', { name: displayName(sp, lang()) })); return; }
      edit(t('ls.undo.own'), (l) => { l.palette = [...(l.palette || []), JSON.parse(JSON.stringify(sp))]; });
      render();
    };
    // ---- the person's own Library plant list (0.8 LA.6): bring it in, edit it here, save it back ----
    const acct = () => (typeof window !== 'undefined' ? window.ccAddonsAccount || null : null);
    const attest = el('input', { type: 'checkbox', id: 'cv-ls-pt-attest', 'data-ls-pt-attest': '' });
    async function libToken() {
      const a = acct();
      if (!a) return '';
      if (!a.signedIn()) { note.textContent = t('ls.pt.lib.connecting'); await a.connect(); }
      return a.token || '';
    }
    const say = (r) => { note.textContent = t('ls.pt.lib.err.' + (r.why || 'bad'), { why: r.message || '' }); };
    async function fromLibrary() {
      const tok = await libToken();
      const r = await loadMine({ fetchFn: ctx.fetchFn?.(), base: acct()?.base || '', token: tok });
      if (!r.ok) { say(r); return; }
      if (!r.rows.length) { note.textContent = t('ls.pt.lib.none'); return; }
      const m = mergeMine(own(), r.rows);
      edit(t('ls.undo.pt.lib'), (l) => { l.palette = m.list; });
      note.textContent = t('ls.pt.lib.loaded', { n: r.rows.length, a: m.added, u: m.updated });
      render();
    }
    async function toLibrary() {
      if (!own().length) { note.textContent = t('ls.pt.lib.empty'); return; }
      if (!attest.checked) { note.textContent = t('ls.pt.lib.need'); attest.focus(); return; }
      const tok = await libToken();
      const r = await saveList({ fetchFn: ctx.fetchFn?.(), base: acct()?.base || '', token: tok, species: own() });
      if (!r.ok) { say(r); return; }
      const kept = forLibrary(own()).kept;
      note.textContent = [t('ls.pt.lib.saved', { a: r.added, u: r.updated, s: r.unchanged, p: r.pending ? t('ls.pt.lib.pending', { p: r.pending }) : '' }),
        r.refused.length ? t('ls.pt.lib.refused', { n: r.refused.length, list: r.refused.slice(0, 5).map((x) => x.key + ' (' + x.why + ')').join('; ') }) : '',
        kept ? t('ls.pt.lib.kept', { n: kept }) : ''].filter(Boolean).join(' ');
    }
    const fileIn = el('input', { type: 'file', accept: '.csv,.txt,.json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-ls-pt-file': '' });
    fileIn.addEventListener('change', async () => { const f = fileIn.files?.[0]; fileIn.value = ''; if (f) { await importList(f); render(); } });
    const dlg = el('dialog', { className: 'cv-dialog cv-ls-ptdlg', 'aria-labelledby': 'cv-ls-pt-h', 'data-ls-plant-table': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ls-pt-h' }, t('ls.pt.head'))),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('ls.pt.lede')),
          el('div', { className: 'cv-props' }, el('label', { for: q.id }, t('ls.pl.search')), q),
          count,
          el('div', { className: 'cv-ls-schwrap' }, el('table', { className: 'cv-groups cv-ls-pt', 'data-ls-pt-table': '' },
            el('thead', {}, el('tr', {}, ...COLS.map(([lk]) => el('th', { scope: 'col' }, t(lk))), el('th', {}))), body)),
          el('div', { className: 'cv-actions', 'data-ls-pt-lib': '' },
            el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-fromlib': '', title: t('ls.pt.lib.load.title'), onclick: fromLibrary }, t('ls.pt.lib.load')),
            el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-tolib': '', title: t('ls.pt.lib.save.title'), onclick: toLibrary }, t('ls.pt.lib.save')),
            el('label', { className: 'cv-check', for: 'cv-ls-pt-attest' }, attest, ' ', t('ls.pt.lib.attest'))),
          note, fileIn),
        el('div', { className: 'cv-dlg-foot' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-add': '', onclick: addRow }, t('ls.pt.add')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-addcur': '', onclick: addCurrent }, t('ls.pt.addcur')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-import': '', onclick: () => fileIn.click() }, t('ls.pl.import')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-csv': '', onclick: () => { ctx.download(new TextEncoder().encode('﻿' + plantsToCsv(own())), ctx.fileStem() + '-my-plants.csv', 'text/csv'); ctx.say(t('ls.pl.export.done', { n: own().length })); } }, t('ls.pt.csv')),   // i18n-ignore: a file name ending
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-pt-json': '', onclick: () => { const lib = writePlants({ name: ctx.fileStem(), license: { id: 'OWN' }, species: own() }); ctx.download(new TextEncoder().encode(JSON.stringify(lib, null, 1)), ctx.fileStem() + '-my-plants.plants.json', 'application/json'); ctx.say(t('ls.pt.json.done', { n: own().length })); } }, t('ls.pt.json')),   // i18n-ignore: a file name ending
          el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ls-pt-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); ctx.refresh(); });
    root.append(dlg);
    render();
    dlg.showModal();
  }

  /** One select for a placement's cultivar and supplied size: "species" · "species, 10 L container" · "'Bloodgood', 10 L container"… */
  function variantSelect(id, sp, cv, sup, onPick, labelOf) {
    const opts = [['', '', t('ls.v.species')]];
    for (const s of sp.supplies || []) opts.push(['', s.id, labelOf(s)]);
    for (const c of sp.cultivars || []) {
      opts.push([c.key, '', `'${c.name}'`]);
      for (const s of c.supplies?.length ? c.supplies : sp.supplies || []) opts.push([c.key, s.id, `'${c.name}', ${labelOf(s)}`]);
    }
    const s = el('select', { className: 'cv-select', id, 'data-ls-variant': '' }, ...opts.map(([c, u, txt]) => el('option', { value: c + '|' + u }, txt)));
    s.value = (cv || '') + '|' + (sup || '');
    if (s.selectedIndex < 0) s.value = '|';
    s.addEventListener('change', () => { const [c, u] = s.value.split('|'); onPick(c, u); });
    return s;
  }

  return { open, variantSelect, hasVariants: (sp) => !!(sp && ((sp.supplies || []).length || (sp.cultivars || []).length)) };
}
