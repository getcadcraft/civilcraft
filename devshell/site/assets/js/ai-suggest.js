/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages; what a person reads goes through app-ai-suggest.js and the shell's language file. */
/**
 * ai-suggest.js — Suggest mode (0.8 round 2, ai-trust_PART_2, AC.12; docs/AI-CONNECT-SPEC.md § 3.1): an assistant allowed to *Suggest* but not
 * to *Edit* does not change the document. Each of its edit calls becomes an item in a **change set**; the person looks at the set (drawn on
 * the drawing or model by the app's `ghost` adapter, or listed) and accepts or rejects it whole or item by item. DOM-free, no imports,
 * tested in Node (bin/test-suggest.mjs). The panel is app-ai-suggest.js.
 *
 *   const sug = createSuggestions({ apply, step, rev, now, uid, gapMs, max, ghost, log })
 *     apply(item, set)  runs the item's tool for real, as the menu would (host.control.runTool: the dispatcher with Edit allowed) →
 *                       its result; throws (ToolError or Error) when it cannot
 *     step(label, fn)   the app's ONE undo step (host.control.step); one step per accept action, labelled "Assistant: <set title>"
 *     rev()             optional: a number that changes whenever the document does (the undo stack length); items recorded under an older
 *                       number are marked stale (the document moved on: accept still works, the person is told)
 *     ghost             optional adapter { show(items), clear(), focus(item) } that draws the pending items over the drawing or model
 *     log(entry)        optional: the activity log (ai-activity.js) — every record / accept / reject is one entry
 *   sug.suggest        pass as host.control.configure({ suggest: sug.suggest }): (tool, args, ctx) → { id }   (core.mjs § opts.suggest)
 *
 * Items of one client that arrive less than `gapMs` apart (default 90 s) join the open set, so "draw the stair, then dimension it" is
 * ONE set the person can take whole or in part. `sug.begin(client, title)` / `sug.end()` let a transport group explicitly.
 *
 * A set: { id, client, app, title, createdAt, state: 'pending'|'accepted'|'rejected'|'partial'|'closed', items[] }
 * An item: { id, tool, title, args, would, summary, ghosts, state: 'pending'|'accepted'|'rejected'|'failed', error, result, undo,
 *            at, baseRev, stale }
 */

export const FORMAT = 'cadcraft-suggestions';
export const LIMITS = Object.freeze({ sets: 50, items: 200, args: 4000, title: 120, error: 300, client: 80 });
const STATES = ['pending', 'accepted', 'rejected', 'failed'];

export class SuggestError extends Error {
  constructor(code, message, next = '') { super(message); this.name = 'SuggestError'; this.code = code; this.next = next; }
}

const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);
const clone = (v) => { try { return JSON.parse(JSON.stringify(v ?? null)); } catch { return null; } };
const listOf = (v) => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);
const countOf = (v) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : Array.isArray(v) ? v.length : 0);

/**
 * What an item would do, in a shape the panel can word: {added, changed, removed} counts and the ids, read from the `would` the tool's
 * preview returned (the apps' previews all say added / changed / removed; others give `count`, `created`, `deleted`, `updated`). Nothing
 * here parses the free text of a tool's arguments: they are shown as given, cut, never acted on (rule 36).
 */
export function summarize(tool, would) {
  const w = would && typeof would === 'object' ? would : {};
  const pick = (...keys) => { for (const k of keys) if (w[k] !== undefined) return w[k]; return undefined; };
  const added = pick('added', 'adds', 'created', 'add');
  const changed = pick('changed', 'changes', 'updated', 'modified');
  const removed = pick('removed', 'deleted', 'removes', 'remove');
  const ids = (v) => listOf(v).map((x) => (x && typeof x === 'object' ? x.id : x)).filter((x) => x !== undefined && x !== null && x !== '').map((x) => String(x).slice(0, 80)).slice(0, 200);
  const s = { added: countOf(added), changed: countOf(changed), removed: countOf(removed), ids: { added: ids(added), changed: ids(changed), removed: ids(removed) } };
  if (!s.added && typeof pick('count') === 'number') s.added = countOf(pick('count'));
  if (typeof w.undo === 'string') s.undo = clean(w.undo, LIMITS.title);
  s.known = !!(s.added || s.changed || s.removed);
  s.tool = String(tool && tool.name || tool || '');
  return s;
}

/**
 * The shapes to draw for an item: `would.ghost` when the tool's preview gives drawable shapes ([{ op: 'add'|'change'|'remove', kind,
 * id?, … }], in document units), else just the ids by operation, which an app highlights (selecting, tinting) instead of drawing.
 */
export function ghostsOf(item) {
  const w = item && item.would && typeof item.would === 'object' ? item.would : {};
  const shapes = Array.isArray(w.ghost) ? w.ghost.filter((g) => g && typeof g === 'object').slice(0, 500).map((g) => ({ ...g, op: ['add', 'change', 'remove'].includes(g.op) ? g.op : 'add' })) : [];
  const ids = item && item.summary ? item.summary.ids : { added: [], changed: [], removed: [] };
  return { shapes, ids, drawable: shapes.length > 0 };
}

export function createSuggestions(o = {}) {
  const now = o.now || (() => Date.now());
  const gapMs = o.gapMs ?? 90000;
  const maxSets = o.max ?? LIMITS.sets;
  let seq = 0;
  const uid = o.uid || ((p) => p + (++seq).toString(36) + now().toString(36).slice(-4));
  const sets = [];
  const listeners = new Set();
  let open = null;            // { client, title } while a transport groups explicitly
  let focusId = null;
  const note = (entry) => { try { if (o.log) o.log(entry); } catch { /* the log never breaks a suggestion */ } };
  const emit = (why) => {
    try { if (o.ghost) { const p = pendingItems(); if (p.length && o.ghost.show) o.ghost.show(p, { focus: focusId }); else if (o.ghost.clear) o.ghost.clear(); } } catch { /* a drawing adapter's trouble */ }
    for (const fn of listeners) { try { fn(why); } catch { /* a listener */ } }
  };
  const revNow = () => { try { return o.rev ? o.rev() : null; } catch { return null; } };

  const setState = (s) => {
    const n = s.items.length, p = s.items.filter((i) => i.state === 'pending').length, a = s.items.filter((i) => i.state === 'accepted').length, r = s.items.filter((i) => i.state === 'rejected').length, f = s.items.filter((i) => i.state === 'failed').length;
    s.state = p ? (a || r || f ? 'partial' : 'pending') : a && !r && !f ? 'accepted' : r && !a && !f ? 'rejected' : n ? 'closed' : 'closed';
    return s.state;
  };
  const staleNow = (it) => { const r = revNow(); it.stale = it.state === 'pending' && r !== null && it.baseRev !== null && it.baseRev !== r; return it.stale; };
  const pendingItems = () => sets.flatMap((s) => s.items.filter((i) => i.state === 'pending').map((i) => ({ ...i, set: s.id })));
  const find = (id) => sets.find((s) => s.id === id) || null;

  const api = {
    format: FORMAT,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /** Group the next suggestions from `client` into one set (until end()). */
    begin(client, title) { open = { client: clean(client || '', LIMITS.client), title: clean(title || '', LIMITS.title) }; return api; },
    end() { open = null; return api; },

    /** The dispatcher's seam: opts.suggest(tool, args, ctx). Returns { id } = the change set's id. */
    suggest(tool, args, ctx = {}) {
      const client = clean(ctx.client || (open && open.client) || '', LIMITS.client) || null;
      const t = now();
      let s = open ? sets.find((x) => x.state === 'pending' || x.state === 'partial') : null;
      if (!s || (open && s.client !== client)) s = sets.slice().reverse().find((x) => x.client === client && (x.state === 'pending' || x.state === 'partial') && t - x.updatedAt < gapMs) || null;
      if (!s) {
        s = { id: uid('cs'), client, app: ctx.app || o.app || null, title: (open && open.title) || '', createdAt: t, updatedAt: t, state: 'pending', items: [] };
        sets.push(s);
        while (sets.length > maxSets) { const gone = sets.findIndex((x) => x.state !== 'pending' && x.state !== 'partial'); sets.splice(gone < 0 ? 0 : gone, 1); }
      }
      if (s.items.length >= LIMITS.items) throw new SuggestError('too_many', 'This change set already holds ' + LIMITS.items + ' suggestions.', 'Ask the person to accept or reject the pending ones first.');
      let argText = '';
      try { argText = JSON.stringify(args ?? {}); } catch { argText = ''; }
      const item = {
        id: uid('ci'), tool: String(tool && tool.name || tool), title: clean(tool && tool.title || tool && tool.name || tool, LIMITS.title),
        args: argText.length <= LIMITS.args ? clone(args) : { truncated: true, bytes: argText.length },
        would: clone(ctx.would), summary: summarize(tool, ctx.would), state: 'pending', error: null, result: null, undo: null, at: t, baseRev: revNow(), stale: false,
      };
      item.ghosts = ghostsOf(item);
      s.items.push(item);
      s.updatedAt = t;
      if (!s.title) s.title = item.title;
      else if (s.items.length > 1 && !open) s.title = clean(s.items[0].title + ' and ' + (s.items.length - 1) + ' more', LIMITS.title);
      setState(s);
      note({ time: new Date(t).toISOString(), client, tool: item.tool, group: 'edit', outcome: 'suggested', changeSet: s.id, item: item.id, summary: item.summary, undo: null });
      emit('suggest');
      return { id: s.id, item: item.id };
    },

    list() { return sets.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i, stale: staleNow(i) })) })); },
    get(id) { const s = find(id); return s ? { ...s, items: s.items.map((i) => ({ ...i, stale: staleNow(i) })) } : null; },
    pending: pendingItems,
    counts() { const p = pendingItems(); return { sets: sets.filter((s) => s.state === 'pending' || s.state === 'partial').length, items: p.length, stale: p.filter((i) => staleNow(i)).length }; },
    focus(itemId) { focusId = itemId || null; emit('focus'); },

    /**
     * Accept the pending items of a set (or just `itemIds`): they are run in order through `apply`, together as ONE undo step labelled
     * "Assistant: <title>". An item that cannot run is marked failed with the reason; the rest still run. → { applied, failed, set }.
     */
    async accept(setId, itemIds = null, by = 'person') {
      const s = find(setId);
      if (!s) throw new SuggestError('not_found', 'There is no change set ' + setId + '.', 'List the pending sets first.');
      if (typeof o.apply !== 'function') throw new SuggestError('unsupported', 'This app cannot apply a suggestion yet.', 'Ask the person to allow Edit instead.');
      const want = itemIds ? new Set(itemIds) : null;
      const todo = s.items.filter((i) => i.state === 'pending' && (!want || want.has(i.id)));
      if (!todo.length) return { applied: 0, failed: 0, set: api.get(setId) };
      let applied = 0, failed = 0;
      const label = 'Assistant: ' + clean(todo.length === s.items.length ? s.title : todo.length === 1 ? todo[0].title : todo[0].title + ' and ' + (todo.length - 1) + ' more', LIMITS.title);
      const run = async () => {
        for (const it of todo) {
          const wasStale = staleNow(it);
          try {
            it.result = clone(await o.apply(it, s));
            it.state = 'accepted'; it.error = null; applied++;
            if (it.result && typeof it.result.undo === 'string') it.undo = clean(it.result.undo, LIMITS.title);
          } catch (e) {
            it.state = 'failed'; failed++;
            it.error = clean(e && e.message || String(e), LIMITS.error);
          }
          it.stale = false;
          note({ time: new Date(now()).toISOString(), client: s.client, tool: it.tool, group: 'edit', outcome: it.state === 'accepted' ? 'accepted' : 'error', changeSet: s.id, item: it.id, by, stale: wasStale || undefined, message: it.error || undefined, undo: label, summary: it.summary });
        }
      };
      if (typeof o.step === 'function') await o.step(label, run); else await run();
      todo.forEach((it) => { if (it.state === 'accepted') it.undo = it.undo || label; });
      s.updatedAt = now();
      setState(s);
      emit('accept');
      return { applied, failed, undo: label, set: api.get(setId) };
    },

    /** Reject the pending items of a set (or just `itemIds`). Nothing is run; the drawing never changed. */
    reject(setId, itemIds = null, by = 'person') {
      const s = find(setId);
      if (!s) throw new SuggestError('not_found', 'There is no change set ' + setId + '.', 'List the pending sets first.');
      const want = itemIds ? new Set(itemIds) : null;
      let n = 0;
      for (const it of s.items) {
        if (it.state !== 'pending' || (want && !want.has(it.id))) continue;
        it.state = 'rejected'; n++;
        note({ time: new Date(now()).toISOString(), client: s.client, tool: it.tool, group: 'edit', outcome: 'rejected', changeSet: s.id, item: it.id, by, summary: it.summary });
      }
      s.updatedAt = now();
      setState(s);
      if (n) emit('reject');
      return { rejected: n, set: api.get(setId) };
    },

    acceptAll(by) { return Promise.all(sets.filter((s) => s.state === 'pending' || s.state === 'partial').map((s) => api.accept(s.id, null, by))); },
    rejectAll(by) { return sets.filter((s) => s.state === 'pending' || s.state === 'partial').map((s) => api.reject(s.id, null, by)); },

    /** Drop the finished sets (accepted, rejected, closed): the person's "Clear" button. Pending ones stay. */
    clearDone() { for (let i = sets.length - 1; i >= 0; i--) if (sets[i].state !== 'pending' && sets[i].state !== 'partial') sets.splice(i, 1); emit('clear'); },

    /** The document was replaced (a file opened): pending suggestions pointed at the old one, so they are closed, not applied. */
    reset(why = 'document changed') { let n = 0; for (const s of sets) for (const it of s.items) if (it.state === 'pending') { it.state = 'rejected'; it.error = clean(why, LIMITS.error); n++; } sets.forEach(setState); open = null; focusId = null; if (n) emit('reset'); return n; },
  };
  return api;
}

/** Assistants' own tools over a store (read-only: an assistant can see what is pending, never accept its own suggestion). */
export function registerTools(control, sug) {
  const offs = [];
  const T = (def) => { if (control && typeof control.tool === 'function') offs.push(control.tool(def)); };
  T({
    name: 'suggestions_list', group: 'read', title: 'List pending suggestions',
    description: 'Lists the change sets this assistant suggested that the person has not accepted or rejected yet, with each item\'s tool, state and what it would add, change or remove. Returns sets and counts. The person accepts or rejects in the app; an assistant cannot.',
    inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50, description: 'How many sets to return, newest first. Default 20.' }, offset: { type: 'integer', minimum: 0, maximum: 1000, description: 'How many sets to skip, newest first. Default 0.' } }, additionalProperties: false },
    run: async (a) => {
      const all = sug.list().reverse();
      const sets = all.slice(a.offset || 0, (a.offset || 0) + (a.limit || 20)).map((s) => ({ id: s.id, state: s.state, title: s.title, client: s.client, items: s.items.map((i) => ({ id: i.id, tool: i.tool, state: i.state, added: i.summary.added, changed: i.summary.changed, removed: i.summary.removed, stale: i.stale, error: i.error })) }));
      return { sets, total: all.length, returned: sets.length, counts: sug.counts() };
    },
    untrusted: true,   // client names and error sentences are data
  });
  return () => offs.forEach((f) => { try { f && f(); } catch { /* gone */ } });
}
