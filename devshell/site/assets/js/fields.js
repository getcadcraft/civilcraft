/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fields.js — field packs (0.8 round 3, session fields_PART_3, FL.0; ADDONS-SPEC § 19, docs/0.8-PART6.md). DOM-free, no imports; tested in Node
 * (bin/test-field-packs.mjs). The shell's panel is app-fields.js.
 *
 * A field pack (`cadcraft-field-pack` v1) is data: it names, per app, the Library items a person in one field wants (add-ons, regulation packs, skill
 * packs, layouts …, by Library id), and it carries what only the pack has: calc-sheet templates (EG.18 rows), lessons (EG.23) and sample files. It holds no
 * code. Adding it to the account list adds its Library items (the resolver's job, spec § 3.5: a pack is a collection); this file does the pack's own part
 * in one app:
 *
 *   readPack(json, opts)           untrusted JSON → { ok, pack, warnings[], errors[] }   (every field checked, bad parts left out and counted)
 *   hostKey(slug)                  'partcraft' → 'part'      piecesFor(pack, key)  → the Library items for that app (Super gets every app's)
 *   calcsFor(pack, key), lessonsFor(pack, key), samplesFor(pack, key)
 *   createFields({ app, store, calc, lessons, load })
 *        installed() → [{ id, version, via }]    install(pack, via) · remove(id) · apply(ids)    templates() → [{ pack, id, title, about, sources, rows }]
 *        insert(packId, templateId) → the sheet id added to the document (the person's own from then on; removing the pack never takes it back)
 *        on(fn)                                  restore() reads the packs the person had installed (load(id) → JSON) and puts their lessons back
 *
 * "Removing the pack removes only what it added": its lessons and its templates. A sheet the person inserted is theirs and stays; so does their lesson
 * progress. Library items it brought are removed through the account list (their orphans are offered, spec § 3.5), not here.
 */

export const FORMAT = 'cadcraft-field-pack';
export const VERSION = 1;
export const LIMITS = Object.freeze({ id: 60, name: 80, summary: 300, pieces: 60, calcs: 12, rows: 60, lessons: 6, sources: 8, checklists: 6, checkItems: 40, tables: 8, columns: 8, tableRows: 60, does: 20, notYet: 20, text: 400 });
export const APP_KEYS = Object.freeze(['cad', 'bim', 'model', 'markup', 'takeoff', 'civil', 'detail', 'part', 'super']);
export const PIECE_KINDS = Object.freeze(['addon', 'regulation', 'pack', 'linepack', 'workspace', 'input', 'skill', 'generator', 'materials', 'library', 'engine']);
/** Pieces a pack cannot carry yet (no loader in the apps): every coverage card of a pack that wanted one must say so (build.mjs checks the words). */
export const PIECES_NOT_YET = Object.freeze({ symbols: 'drawing symbols', families: 'families', footprints: 'footprints', templates: 'drawing, panel and instrument-index templates', generators: 'bracket and part generators', schedules: 'schedules', starters: "the pack's own skill starters" });
export const TODAY = Object.freeze({ well: 'Well covered', partly: 'Partly covered', thin: 'A thin pack' });

const ID_RE = /^field\.[a-z][a-z0-9-]{1,40}$/;
const LIB_ID_RE = /^[a-z][a-z0-9.-]{1,79}$/;
const SUB_ID_RE = /^[a-z][a-z0-9_-]{1,40}$/;
const NAME_RE = /^[\p{L}_][\p{L}\p{N}_]{0,39}$/u;
const text = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

export const hostKey = (slug) => { const s = String(slug || '').toLowerCase(); if (APP_KEYS.includes(s)) return s; if (s.startsWith('supercad') || s === 'super') return 'super'; return s.replace(/craft$/, ''); };

/** An untrusted pack file → a clean pack. Bad parts are dropped and counted; a pack with no id, name or any piece is refused. */
export function readPack(json, { knownIds = null } = {}) {
  const errors = [], warnings = [];
  const j = json && typeof json === 'object' ? json : null;
  if (!j) return { ok: false, pack: null, warnings, errors: ['Not a field pack.'] };
  if (j.format !== FORMAT) errors.push('This is not a field pack (format "' + text(j.format, 40) + '").');
  else if (j.version !== VERSION) errors.push(Number(j.version) > VERSION ? 'This field pack was made for a newer CadCraft.' : 'Unknown field pack version.');
  if (errors.length) return { ok: false, pack: null, warnings, errors };
  const id = text(j.id, LIMITS.id);
  if (!ID_RE.test(id)) errors.push('The id must look like field.<name>.');
  const name = text(j.name, LIMITS.name);
  if (!name) errors.push('The pack has no name.');
  const hosts = {}; let pieceCount = 0;
  for (const [k, list] of Object.entries(j.hosts && typeof j.hosts === 'object' ? j.hosts : {})) {
    if (!APP_KEYS.includes(k)) { warnings.push('Unknown app "' + text(k, 20) + '" left out.'); continue; }
    const out = [];
    for (const p of Array.isArray(list) ? list.slice(0, LIMITS.pieces) : []) {
      if (!p || typeof p !== 'object') continue;
      const kind = text(p.kind, 20);
      if (kind === 'calc' || kind === 'lessons' || kind === 'sample') { const ref = text(p.ref, 40); if (SUB_ID_RE.test(ref)) out.push({ kind, ref }); else warnings.push('A ' + kind + ' piece has no good ref.'); continue; }
      if (!PIECE_KINDS.includes(kind) || !LIB_ID_RE.test(String(p.id || ''))) { warnings.push('A piece that is not a Library item was left out.'); continue; }
      if (knownIds && !knownIds.has(p.id)) { warnings.push('"' + p.id + '" is not in the Library.'); continue; }
      out.push({ kind, id: p.id, ...(p.note ? { note: text(p.note, 160) } : {}) });
    }
    if (out.length) { hosts[k] = out; pieceCount += out.length; }
  }
  if (!pieceCount) errors.push('The pack names nothing for any app.');
  // calc templates: rows of the shell's calc sheets (calc.js cleans them again when one is inserted)
  const calcs = [];
  for (const c of Array.isArray(j.calcs) ? j.calcs.slice(0, LIMITS.calcs) : []) {
    if (!c || typeof c !== 'object' || !SUB_ID_RE.test(String(c.id || ''))) { warnings.push('A calc template with no good id was left out.'); continue; }
    const rows = [], seen = new Set();
    for (const r of Array.isArray(c.rows) ? c.rows.slice(0, LIMITS.rows) : []) {
      if (!r || typeof r !== 'object' || !NAME_RE.test(String(r.name || '')) || seen.has(r.name)) continue;
      const expr = text(r.expr, 400); if (!expr) continue;
      seen.add(r.name); rows.push({ name: r.name, expr, unit: text(r.unit, 40), note: text(r.note, LIMITS.text) });
    }
    if (!rows.length) { warnings.push('Calc template "' + c.id + '" has no good rows.'); continue; }
    const hs = (Array.isArray(c.hosts) ? c.hosts : []).filter((x) => APP_KEYS.includes(x));
    calcs.push({ id: c.id, title: text(c.title, 80) || c.id, about: text(c.about, LIMITS.text), sources: (Array.isArray(c.sources) ? c.sources : []).slice(0, LIMITS.sources).map((s) => text(s, 160)).filter(Boolean), hosts: hs, rows });
  }
  const lessons = [];
  for (const l of Array.isArray(j.lessons) ? j.lessons.slice(0, LIMITS.lessons) : []) {
    if (!l || typeof l !== 'object' || !SUB_ID_RE.test(String(l.id || '')) || !Array.isArray(l.steps) || !l.steps.length) { warnings.push('A lesson that is not well formed was left out.'); continue; }
    // hints, never answers (lessons.js drops answer / solution again)
    const steps = l.steps.slice(0, 20).filter((s) => s && typeof s === 'object' && SUB_ID_RE.test(String(s.id || '')) && text(s.text, 400)).map((s) => ({ id: s.id, text: text(s.text, 400), hints: (Array.isArray(s.hints) ? s.hints : []).slice(0, 4).map((x) => text(x, 400)).filter(Boolean), done: s.done && typeof s.done === 'object' ? s.done : {} }));
    if (!steps.length) continue;
    lessons.push({ id: l.id, title: text(l.title, 100) || l.id, intro: text(l.intro, 400), level: ['beginner', 'intermediate', 'advanced'].includes(l.level) ? l.level : 'beginner', hosts: (Array.isArray(l.hosts) ? l.hosts : []).filter((x) => APP_KEYS.includes(x)), steps });
  }
  // checklists and reference tables: pure data, read in the Field packs panel (FL.0, the pieces the thin packs wanted that need no app code)
  const checklists = [];
  for (const c of Array.isArray(j.checklists) ? j.checklists.slice(0, LIMITS.checklists) : []) {
    if (!c || typeof c !== 'object' || !SUB_ID_RE.test(String(c.id || ''))) { warnings.push('A checklist with no good id was left out.'); continue; }
    const seen = new Set(), items = [];
    for (const it of Array.isArray(c.items) ? c.items.slice(0, LIMITS.checkItems) : []) if (it && typeof it === 'object' && SUB_ID_RE.test(String(it.id || '')) && !seen.has(it.id) && text(it.text, 200)) { seen.add(it.id); items.push({ id: it.id, text: text(it.text, 200) }); }
    if (!items.length) { warnings.push('Checklist "' + c.id + '" has no good items.'); continue; }
    checklists.push({ id: c.id, title: text(c.title, 80) || c.id, about: text(c.about, LIMITS.text), hosts: (Array.isArray(c.hosts) ? c.hosts : []).filter((x) => APP_KEYS.includes(x)), items });
  }
  const tables = [];
  for (const t of Array.isArray(j.tables) ? j.tables.slice(0, LIMITS.tables) : []) {
    if (!t || typeof t !== 'object' || !SUB_ID_RE.test(String(t.id || ''))) { warnings.push('A table with no good id was left out.'); continue; }
    const columns = (Array.isArray(t.columns) ? t.columns.slice(0, LIMITS.columns) : []).map((x) => text(x, 40)).filter(Boolean);
    const rows = columns.length ? (Array.isArray(t.rows) ? t.rows.slice(0, LIMITS.tableRows) : []).filter((r) => Array.isArray(r) && r.length === columns.length).map((r) => r.map((x) => text(x, 80))) : [];
    if (!rows.length) { warnings.push('Table "' + t.id + '" has no good rows.'); continue; }
    // a table is data a person typed from a source: it says where from, and is "not confirmed" until a pack is marked reviewed
    tables.push({ id: t.id, title: text(t.title, 80) || t.id, about: text(t.about, LIMITS.text), hosts: (Array.isArray(t.hosts) ? t.hosts : []).filter((x) => APP_KEYS.includes(x)), source: text(t.source, 200), columns, rows });
  }
  const samples = {};
  for (const [k, s] of Object.entries(j.samples && typeof j.samples === 'object' ? j.samples : {})) {
    if (!APP_KEYS.includes(k) || !s || typeof s !== 'object') continue;
    const file = String(s.file || '');
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(file) || file.includes('..')) { warnings.push('A sample with a bad file name was left out.'); continue; }
    samples[k] = { file, name: text(s.name, 80) || file };
  }
  const cov = j.coverage && typeof j.coverage === 'object' ? j.coverage : {};
  const coverage = {
    today: Object.keys(TODAY).includes(cov.today) ? cov.today : 'partly',
    does: (Array.isArray(cov.does) ? cov.does : []).slice(0, LIMITS.does).map((s) => text(s, LIMITS.text)).filter(Boolean),
    not_yet: (Array.isArray(cov.not_yet) ? cov.not_yet : []).slice(0, LIMITS.notYet).map((n) => (n && typeof n === 'object' ? { text: text(n.text, LIMITS.text), rows: (Array.isArray(n.rows) ? n.rows : []).slice(0, 6).map((r) => text(r, 20)).filter(Boolean) } : null)).filter((n) => n && n.text),
  };
  if (!coverage.not_yet.length) errors.push('A coverage card must say what the pack does not do yet.');   // the honesty rule: no card without limits
  if (errors.length) return { ok: false, pack: null, warnings, errors };
  const pack = {
    format: FORMAT, version: VERSION, id, name, summary: text(j.summary, LIMITS.summary), packVersion: text(j.packVersion, 20) || '0.1.0',
    status: j.status === 'reviewed' ? 'reviewed' : 'starter', coverage, hosts, calcs, lessons, checklists, tables, samples,
    rows: (Array.isArray(j.rows) ? j.rows : []).slice(0, 8).map((r) => text(r, 20)).filter(Boolean), license: text(j.license, 40) || 'Apache-2.0', author: text(j.author, 80) || 'CadCraft',
    notice: text(j.notice, 400),
  };
  return { ok: true, pack, warnings, errors };
}

/** The Library items a pack names for one app. Super (the all-in-one) takes every app's, once each. */
export function piecesFor(pack, key) {
  const lists = key === 'super' ? Object.values(pack.hosts) : [pack.hosts[key] || []];
  const seen = new Set(), out = [];
  for (const l of lists) for (const p of l) { const sig = p.id ? p.kind + ':' + p.id : null; if (!sig || seen.has(sig)) continue; seen.add(sig); out.push(p); }
  return out;
}
const forHost = (items, key) => items.filter((x) => key === 'super' || !x.hosts.length || x.hosts.includes(key));
export const calcsFor = (pack, key) => forHost(pack.calcs, key);
export const lessonsFor = (pack, key) => forHost(pack.lessons, key);
export const checklistsFor = (pack, key) => forHost(pack.checklists || [], key);
export const tablesFor = (pack, key) => forHost(pack.tables || [], key);
export const samplesFor = (pack, key) => (key === 'super' ? Object.entries(pack.samples).map(([k, s]) => ({ host: k, ...s })) : pack.samples[key] ? [{ host: key, ...pack.samples[key] }] : []);

/**
 * The installer for one app. `calc` is the shell's calc engine (window.ccCalc.calcs: addSheet, setRow, sheet) or null; `lessons` is window.ccLessons or
 * null. Both are optional: without them the pack still installs and says what it could not do.
 */
export function createFields({ app, store = null, calc = null, lessons = null, load = null } = {}) {
  const key = hostKey(app);
  const KEY = 'cc-fields:' + key;
  const listeners = new Set();
  const packs = new Map();   // id → pack (clean)
  let state = (() => { try { const j = JSON.parse(store && store.get(KEY) || 'null'); return j && Array.isArray(j.installed) ? j : { installed: [] }; } catch { return { installed: [] }; } })();
  if (!state.ticks || typeof state.ticks !== 'object' || Array.isArray(state.ticks)) state.ticks = {};
  state.installed = state.installed.filter((x) => x && ID_RE.test(String(x.id))).slice(0, 80);
  const save = () => { try { store && store.set(KEY, JSON.stringify(state)); } catch { /* kept for this page */ } };
  const changed = (why) => { save(); for (const f of listeners) { try { f(why); } catch { /* a listener must not break the install */ } } };
  const getCalc = () => (typeof calc === 'function' ? calc() : calc);
  const getLessons = () => (typeof lessons === 'function' ? lessons() : lessons);
  const lessonId = (pack, l) => pack.id + '.' + l.id;

  function putLessons(pack) {
    let n = 0; const lessons = getLessons();
    if (lessons && typeof lessons.register === 'function') for (const l of lessonsFor(pack, key)) {
      if (lessons.register({ id: lessonId(pack, l), title: l.title, intro: l.intro, level: l.level, steps: l.steps, badge: { title: l.title } })) n++;
    }
    return n;
  }
  function dropLessons(pack) {
    const lessons = getLessons();
    if (lessons && typeof lessons.unregister === 'function') for (const l of pack.lessons) lessons.unregister(lessonId(pack, l));
  }

  const api = {
    key,
    installed: () => state.installed.map((x) => ({ ...x })),
    has: (id) => state.installed.some((x) => x.id === id),
    pack: (id) => packs.get(id) || null,
    /** Install a clean pack (from readPack). Returns what it did, so the panel can say it. */
    install(pack, via = 'here') {
      if (!pack || !ID_RE.test(pack.id)) return { ok: false, why: 'Not a field pack.' };
      packs.set(pack.id, pack);
      const had = state.installed.find((x) => x.id === pack.id);
      if (had) { had.version = pack.packVersion; if (via === 'account') had.via = 'account'; } else state.installed.push({ id: pack.id, version: pack.packVersion, via });
      const nl = putLessons(pack);
      changed('install');
      return { ok: true, lessons: nl, templates: calcsFor(pack, key).length, checklists: checklistsFor(pack, key).length, tables: tablesFor(pack, key).length, pieces: piecesFor(pack, key).length, lessonsAvailable: !!getLessons(), calcAvailable: !!getCalc() };
    },
    remove(id) {
      const i = state.installed.findIndex((x) => x.id === id); if (i < 0) return false;
      const pack = packs.get(id); if (pack) dropLessons(pack);
      state.installed.splice(i, 1); packs.delete(id); changed('remove'); return true;
    },
    /** The account list says which packs the person has (id list): install the missing, remove the ones that came from the account and are gone. */
    async apply(ids) {
      const want = new Set(ids.filter((x) => ID_RE.test(String(x))));
      const done = { installed: [], removed: [], failed: [] };
      for (const id of want) {
        if (api.has(id) && packs.has(id)) continue;
        const r = typeof load === 'function' ? readPack(await load(id).catch(() => null)) : { ok: false };
        if (r.ok) { api.install(r.pack, 'account'); done.installed.push(id); } else done.failed.push(id);
      }
      for (const x of api.installed()) if (x.via === 'account' && !want.has(x.id)) { api.remove(x.id); done.removed.push(x.id); }
      return done;
    },
    /** Puts back the packs this app had installed (their lessons; templates read from the pack again). */
    async restore() {
      const out = [];
      for (const x of state.installed.slice()) {
        if (packs.has(x.id) || typeof load !== 'function') continue;
        const r = readPack(await load(x.id).catch(() => null));
        if (r.ok) { packs.set(x.id, r.pack); putLessons(r.pack); out.push(x.id); }
      }
      if (out.length) changed('restore');
      return out;
    },
    templates() {
      const out = [];
      for (const x of state.installed) { const p = packs.get(x.id); if (p) for (const c of calcsFor(p, key)) out.push({ pack: p.id, packName: p.name, id: c.id, title: c.title, about: c.about, sources: c.sources, rows: c.rows.length }); }
      return out;
    },
    /** Adds a template's rows to the document as a sheet of its own. Returns the sheet id, or null. */
    insert(packId, templateId) {
      const p = packs.get(packId); const c = p && calcsFor(p, key).find((x) => x.id === templateId);
      const calc = getCalc();
      if (!c || !api.has(packId) || !calc || typeof calc.addSheet !== 'function') return null;
      const base = (packId.replace(/^field\./, '') + '_' + c.id).replace(/[^a-z0-9_]/g, '_').slice(0, 36);
      let id = base, n = 2; while (calc.sheet && calc.sheet(id)) id = base + '_' + n++;
      const s = calc.addSheet({ id, title: c.title });
      const sid = (s && s.id) || id;
      for (const r of c.rows) calc.setRow(sid, null, { name: r.name, expr: r.expr, unit: r.unit, note: r.note });
      changed('insert');
      return sid;
    },
    /** Checklists of the installed packs for this app, with the person's ticks (progress is theirs: removing a pack keeps it, like lesson progress). */
    checklists() {
      const out = [];
      for (const x of state.installed) { const p = packs.get(x.id); if (p) for (const c of checklistsFor(p, key)) { const done = state.ticks[p.id + '/' + c.id] || []; out.push({ pack: p.id, packName: p.name, id: c.id, title: c.title, about: c.about, items: c.items.map((i) => ({ ...i, done: done.includes(i.id) })) }); } }
      return out;
    },
    tick(packId, listId, itemId, on = true) {
      const p = packs.get(packId); const c = p && checklistsFor(p, key).find((z) => z.id === listId);
      if (!c || !api.has(packId) || !c.items.some((i) => i.id === itemId)) return false;
      const k = packId + '/' + listId; const cur = new Set(state.ticks[k] || []);
      if (on) cur.add(itemId); else cur.delete(itemId);
      state.ticks[k] = [...cur]; changed('tick'); return true;
    },
    /** Reference tables of the installed packs for this app; `confirmed` is false unless the pack itself is marked reviewed. */
    tables() {
      const out = [];
      for (const x of state.installed) { const p = packs.get(x.id); if (p) for (const t of tablesFor(p, key)) out.push({ pack: p.id, packName: p.name, ...t, confirmed: p.status === 'reviewed' }); }
      return out;
    },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  return api;
}
