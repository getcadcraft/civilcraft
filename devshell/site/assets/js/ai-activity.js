/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — the English sentences here are the export's and the tests'; the panel words the same parts through the shell's language file. */
/**
 * ai-activity.js — the activity log in plain words (0.8 round 2, ai-trust_PART_2, AC.13; docs/AI-CONNECT-SPEC.md § 4.2, rule 36). DOM-free, no
 * imports; tested in Node (bin/test-activity.mjs). The panel is app-ai-activity.js; Settings › Assistants › Activity (host.js) shows the raw list
 * of one window, this keeps it across a session, across the apps of Studio, and as something a person can read, filter and export.
 *
 *   const log = createActivityLog({ max, now })
 *   log.add(entry)       the dispatcher's entry: {time, client, tool, group, args, outcome, undo, ms, preview, message, changeSet, item,
 *                        by, stale, summary, window, files, live} (+ app, document where the hub knows them). `live` = { session, as, role, sheet?, area? }:
 *                        the call was made inside a Studio Live session (set by studio/hub/live/window-live.js from host.control.acting). What is kept is bounded; the
 *                        arguments were already cut at 200 characters by the dispatcher and a result is never kept (spec § 4.2).
 *   log.words(entry)     { who, verb, what, status, kind, text } — one plain sentence about it ("Claude added 3 objects in CadCraft.")
 *   log.list(filter)     newest first; filter { client, app, tool, outcome, group, kind: 'changes'|'reads'|'all', since, until, q, document, live: true|false }
 *   log.link(entry)      { undo, undoIndex, document, version } — what the panel needs to take a change back or open the file's history
 *   log.export(format, filter)   'csv' | 'json' | 'txt' → { name, type, text }
 *   log.merge(other)     fold another window's entries in (the hub), without doubling any
 *   log.save() / log.load(text)
 *
 * A "change" is an entry whose tool is not a read and that did something: ok, accepted, or error after a change set. Reads and previews are
 * kept (the person can see what the assistant looked at) but they are not changes and filter apart.
 */

export const FORMAT = 'cadcraft-assistant-log';
export const LIMITS = Object.freeze({ entries: 2000, text: 300, args: 200, files: 20, field: 120 });

const clean = (s, n = LIMITS.field) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

const VERBS = [
  [/(^|_)(list|get|describe|find|query|read|check|status|result|info|view|screenshot|count|summary|measure|show)$/, 'looked at', 'read'],
  [/(^|_)(add|create|insert|place|draw|make|new|start|apply|run|set|move|rotate|scale|update|rename|change|edit|mirror|copy|offset|trim|extend|fillet|accept)$/, null, 'change'],
  [/(^|_)(delete|remove|erase|clear|purge)$/, 'deleted', 'change'],
  [/(^|_)(open)$/, 'opened', 'open'],
  [/(^|_)(save)$/, 'saved', 'save'],
  [/(^|_)(export|plot|print|write)$/, 'exported', 'export'],
  [/(^|_)(undo|redo)$/, 'undid', 'change'],
];
const PAST = { add: 'added', create: 'created', insert: 'inserted', place: 'placed', draw: 'drew', make: 'made', new: 'made', start: 'started', apply: 'applied', run: 'ran', set: 'changed', move: 'moved', rotate: 'rotated', scale: 'scaled', update: 'updated', rename: 'renamed', change: 'changed', edit: 'edited', mirror: 'mirrored', copy: 'copied', offset: 'offset', trim: 'trimmed', extend: 'extended', fillet: 'filleted', accept: 'accepted' };
const APP_NAMES = { cad: 'CadCraft', bim: 'BimCraft', model: 'ModelCraft', markup: 'MarkupCraft', takeoff: 'TakeoffCraft', civil: 'CivilCraft', detail: 'DetailCraft', part: 'PartCraft', studio: 'Studio' };

/** Split a public tool name into app key, area words and verb: `cad_wall_add` → { app: 'cad', area: 'wall', verb: 'add' }. */
export function splitTool(tool) {
  const parts = String(tool || '').split('_').filter(Boolean);
  let app = null;
  if (parts.length > 1 && APP_NAMES[parts[0]]) app = parts.shift();
  const verb = parts.length > 1 ? parts.pop() : parts[0] || '';
  const area = (parts.length ? parts : [verb]).join(' ');
  return { app, area: parts.length ? area : '', verb };
}

/** The plural-agnostic noun for the area: `objects` stays, `wall` stays. */
const noun = (area) => clean(area.replace(/\bcommand\b/, 'command'), 40);

export function kindOf(entry) {
  const t = String(entry && entry.tool || '');
  const g = entry && entry.group;
  if (g === 'save') return 'save';
  if (g === 'export') return 'export';
  if (g === 'read') return /(^|_)open$/.test(t) ? 'open' : 'read';
  for (const [re, , k] of VERBS) if (re.test(t)) return k === 'read' && g === 'edit' ? 'change' : k;
  return g === 'edit' ? 'change' : 'read';
}

export function createActivityLog(o = {}) {
  const now = o.now || (() => Date.now());
  const max = o.max ?? LIMITS.entries;
  let rows = [];
  let seq = 0;
  const listeners = new Set();
  const emit = (why) => { for (const fn of listeners) { try { fn(why); } catch { /* a listener */ } } };

  const sig = (e) => [e.time, e.client, e.tool, e.outcome, e.item || '', e.changeSet || ''].join('|');

  function normalise(entry) {
    const e = entry && typeof entry === 'object' ? entry : {};
    const t = Date.parse(e.time);
    const row = {
      n: 0,
      time: Number.isFinite(t) ? new Date(t).toISOString() : new Date(now()).toISOString(),
      client: clean(e.client || '', 80) || null,
      app: clean(e.app || splitTool(e.tool).app || '', 20) || null,
      tool: clean(e.tool, 80),
      group: ['read', 'edit', 'save', 'export'].includes(e.group) ? e.group : null,
      outcome: ['ok', 'error', 'refused', 'suggested', 'accepted', 'rejected'].includes(e.outcome) ? e.outcome : 'ok',
      preview: e.preview === true || undefined,
      by: e.by === 'assistant' || e.by === 'person' ? e.by : undefined,
      stale: e.stale === true || undefined,
      undo: e.undo ? clean(e.undo, 120) : null,
      undoIndex: Number.isInteger(e.undoIndex) ? e.undoIndex : null,
      document: e.document ? clean(e.document, 200) : null,
      version: e.version ? clean(e.version, 80) : null,
      window: e.window ? clean(e.window, 120) : null,
      live: e.live && typeof e.live === 'object' && !Array.isArray(e.live) ? { session: clean(e.live.session, 40), as: clean(e.live.as, 80), role: clean(e.live.role, 20), ...(e.live.sheet ? { sheet: clean(e.live.sheet, 80) } : {}), ...(e.live.area ? { area: clean(e.live.area, 80) } : {}) } : null,
      changeSet: e.changeSet ? clean(e.changeSet, 40) : null,
      item: e.item ? clean(e.item, 40) : null,
      message: e.message ? clean(e.message, LIMITS.text) : null,
      ms: Number.isFinite(e.ms) ? Math.max(0, Math.round(e.ms)) : null,
      args: e.args && typeof e.args === 'object' ? e.args : e.args ? clean(e.args, LIMITS.args) : null,
      files: (Array.isArray(e.files) ? e.files : []).slice(0, LIMITS.files).map((f) => clean(f, 200)),
      added: 0, changed: 0, removed: 0,
    };
    const s = e.summary && typeof e.summary === 'object' ? e.summary : null;
    if (s) { row.added = Math.max(0, s.added | 0); row.changed = Math.max(0, s.changed | 0); row.removed = Math.max(0, s.removed | 0); }
    row.kind = kindOf(row);
    return row;
  }

  const api = {
    format: FORMAT,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get size() { return rows.length; },

    add(entry) {
      const r = normalise(entry);
      r.n = ++seq;
      // Accepting a suggestion runs the real tool (the dispatcher logs that as "ok") and then the person's decision is logged as "accepted":
      // one change, one line. The decision takes over the run's undo step and timing, and the run's own line goes.
      if (r.outcome === 'accepted' && r.item) {
        const t = Date.parse(r.time);
        for (let i = rows.length - 1; i >= 0 && i >= rows.length - 12; i--) {
          const x = rows[i];
          if (x.outcome === 'ok' && !x.preview && x.tool === r.tool && x.client === r.client && Math.abs(t - Date.parse(x.time)) <= 5000) {
            r.undo = r.undo || x.undo; r.ms = r.ms ?? x.ms; r.undoIndex = r.undoIndex ?? x.undoIndex; r.document = r.document || x.document;
            rows.splice(i, 1);
            break;
          }
        }
      }
      rows.push(r);
      if (rows.length > max) rows = rows.slice(rows.length - max);
      emit('add');
      return r;
    },

    /** One plain sentence. `who` is the client's own name as it reported it (data: shown, never acted on). */
    words(entry) {
      const r = entry && entry.kind && entry.n !== undefined ? entry : normalise(entry);
      const sp = splitTool(r.tool);
      const who = r.client || 'An assistant';
      const appName = APP_NAMES[r.app || sp.app] || null;
      let verb = null;
      for (const [re, v] of VERBS) if (re.test(r.tool)) { verb = v; break; }
      if (verb === null) verb = PAST[sp.verb] || (sp.verb ? sp.verb : 'used');
      const area = noun(sp.area);
      const counts = [];
      if (r.added) counts.push(r.added + ' added');
      if (r.changed) counts.push(r.changed + ' changed');
      if (r.removed) counts.push(r.removed + ' removed');
      let status;
      if (r.preview) status = 'previewed: nothing changed';
      else if (r.outcome === 'suggested') status = 'suggested: waiting for you';
      else if (r.outcome === 'accepted') status = 'you accepted it';
      else if (r.outcome === 'rejected') status = 'you rejected it';
      else if (r.outcome === 'refused') status = 'was not allowed';
      else if (r.outcome === 'error') status = "didn't work" + (r.message ? ': ' + r.message : '');
      else status = r.kind === 'read' ? '' : 'done';
      const what = (area ? area : '') + (counts.length ? ' (' + counts.join(', ') + ')' : '');
      const live = r.live && (r.live.as || r.live.session) ? 'in a Live session' + (r.live.as ? ' as ' + r.live.as + (r.live.role ? ' (' + r.live.role + ')' : '') : '') : '';
      const text = clean(who + ' ' + verb + (what ? ' ' + what : '') + (appName ? ' in ' + appName : '') + (live ? ' ' + live : '') + (status ? ' — ' + status : '') + '.', 400);
      return { who, verb, what, area, counts: { added: r.added, changed: r.changed, removed: r.removed }, app: appName, live: live || null, status, kind: r.kind, outcome: r.outcome, text };
    },

    list(f = {}) {
      const since = f.since ? Date.parse(f.since) : null, until = f.until ? Date.parse(f.until) : null;
      const q = f.q ? String(f.q).toLowerCase() : '';
      const kind = f.kind && f.kind !== 'all' ? f.kind : null;
      const out = rows.filter((r) => {
        if (f.client && r.client !== f.client) return false;
        if (f.app && r.app !== f.app) return false;
        if (f.tool && r.tool !== f.tool) return false;
        if (f.outcome && r.outcome !== f.outcome) return false;
        if (f.group && r.group !== f.group) return false;
        if (f.document && r.document !== f.document) return false;
        if (f.live === true && !r.live) return false;
        if (f.live === false && r.live) return false;
        if (kind === 'reads' && r.kind !== 'read') return false;
        if (kind === 'changes' && (r.kind === 'read' || r.preview || r.outcome === 'refused' || r.outcome === 'suggested' || r.outcome === 'rejected')) return false;
        if (since !== null && Date.parse(r.time) < since) return false;
        if (until !== null && Date.parse(r.time) > until) return false;
        if (q && !(api.words(r).text.toLowerCase().includes(q) || (r.document || '').toLowerCase().includes(q))) return false;
        return true;
      });
      return out.slice().reverse();
    },

    /** The people and apps that appear (for the panel's filters). */
    clients() { return [...new Set(rows.map((r) => r.client).filter(Boolean))].sort(); },
    apps() { return [...new Set(rows.map((r) => r.app).filter(Boolean))].sort(); },

    /** What the panel needs to take a change back or open its file's history. null parts mean "this entry has none". */
    link(entry) {
      const r = entry && entry.n !== undefined ? entry : normalise(entry);
      const changed = r.kind !== 'read' && !r.preview && (r.outcome === 'ok' || r.outcome === 'accepted');
      return { undo: changed ? r.undo : null, undoIndex: changed ? r.undoIndex : null, document: r.document, version: r.version, canUndo: changed && !!r.undo };
    },

    /** Which entries belong to one undo step (the panel marks them when the step is undone). */
    byUndo(label) { return rows.filter((r) => r.undo === label).slice().reverse(); },

    /** Count by client for the "who did what" strip. */
    summary(f = {}) {
      const l = api.list(f), by = {};
      for (const r of l) { const k = r.client || 'An assistant'; (by[k] ||= { client: k, reads: 0, changes: 0, suggestions: 0, refused: 0, errors: 0 }); const b = by[k];
        if (r.outcome === 'refused') b.refused++; else if (r.outcome === 'error') b.errors++; else if (r.outcome === 'suggested') b.suggestions++; else if (r.kind === 'read' || r.preview) b.reads++; else if (r.outcome !== 'rejected') b.changes++; }
      return Object.values(by).sort((a, b) => b.changes - a.changes || a.client.localeCompare(b.client));
    },

    /** csv | json | txt of what `filter` shows, oldest first (the order it happened in). A cell that starts like a formula is quoted. */
    export(format = 'csv', f = {}) {
      const l = api.list(f).reverse();
      const stamp = new Date(now()).toISOString().slice(0, 10);
      if (format === 'json') {
        return { name: 'assistant-activity-' + stamp + '.json', type: 'application/json', text: JSON.stringify({ format: FORMAT, version: 1, exported: new Date(now()).toISOString(), entries: l.map(({ n, ...r }) => ({ ...r, words: api.words({ n, ...r }).text })) }, null, 1) };
      }
      if (format === 'txt') {
        const text = l.map((r) => r.time.replace('T', ' ').slice(0, 19) + '  ' + api.words(r).text + (r.undo && api.link(r).canUndo ? ' (undo step: ' + r.undo + ')' : '')).join('\n') + (l.length ? '\n' : '');
        return { name: 'assistant-activity-' + stamp + '.txt', type: 'text/plain', text };
      }
      const cols = ['time', 'app', 'assistant', 'what happened', 'result', 'tool', 'permission', 'undo step', 'file', 'file version', 'change set', 'live session', 'milliseconds'];
      const cell = (v) => { let s = v === null || v === undefined ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      const lines = [cols.join(',')];
      for (const r of l) { const w = api.words(r); lines.push([r.time, r.app || '', r.client || '', w.text, w.status || r.outcome, r.tool, r.group || '', api.link(r).canUndo ? r.undo : '', r.document || '', r.version || '', r.changeSet || '', r.live ? (r.live.as || '') + (r.live.role ? ' (' + r.live.role + ')' : '') + (r.live.session ? ' ' + r.live.session : '') : '', r.ms ?? ''].map(cell).join(',')); }
      return { name: 'assistant-activity-' + stamp + '.csv', type: 'text/csv', text: lines.join('\r\n') + '\r\n' };
    },

    /** Fold another log's entries in (the hub collecting each window's), keeping order and never doubling an entry. */
    merge(other) {
      const have = new Set(rows.map(sig));
      let n = 0;
      for (const e of (Array.isArray(other) ? other : other && typeof other.entries === 'function' ? other.entries() : [])) {
        const r = normalise(e);
        if (have.has(sig(r))) continue;
        have.add(sig(r)); r.n = ++seq; rows.push(r); n++;
      }
      if (n) { rows.sort((a, b) => Date.parse(a.time) - Date.parse(b.time) || a.n - b.n); if (rows.length > max) rows = rows.slice(rows.length - max); emit('merge'); }
      return n;
    },
    entries() { return rows.map((r) => ({ ...r })); },

    /** Forget entries older than `days` (retention). */
    prune(days) { const cut = now() - days * 86400000; const before = rows.length; rows = rows.filter((r) => Date.parse(r.time) >= cut); if (rows.length !== before) emit('prune'); return before - rows.length; },
    clear() { rows = []; emit('clear'); },

    save() { return JSON.stringify({ format: FORMAT, version: 1, entries: rows.slice(-max) }); },
    load(text) {
      let j = null;
      try { j = typeof text === 'string' ? JSON.parse(text) : text; } catch { return 0; }
      if (!j || j.format !== FORMAT || !Array.isArray(j.entries)) return 0;
      rows = []; seq = 0;
      for (const e of j.entries.slice(-max)) { const r = normalise(e); r.n = ++seq; rows.push(r); }
      emit('load');
      return rows.length;
    },
  };
  return api;
}
