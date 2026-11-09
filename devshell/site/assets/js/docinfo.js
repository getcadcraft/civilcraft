/* SPDX-License-Identifier: Apache-2.0 */
/**
 * docinfo.js — drawing details / properties (0.9 DI.1): the facts about the open drawing (what the person wrote: title, subject, author,
 * company, keywords, comments, and the dates; what the app counts: size, units, entities, triangles, elements) as one store the shell shows in a
 * panel. DOM-free, no imports; tested in Node (bin/test-docinfo.mjs). The UI is app-docinfo.js.
 *
 *   const info = createDocInfo({ now })
 *     get() → { title, subject, author, company, keywords, comments, created, modified, modifiedBy, revision }
 *     set(patch, { by })   the person's words (FIELDS only); creates `created` the first time anything is written
 *     stamp(by)            a save happened: modified = now, revision + 1 (the app's serializer calls it through ccDocInfo.save())
 *     load(json) · save() → json | null (null until something was written)
 *     on(fn) → off         fn(why)
 *
 * Everything the person did not write and the app cannot count is left out: summarize() drops a number the app did not hand over (never 0),
 * and a drawing with no known extent has no size row. Text from a file is untrusted: clean() strips control and bidi characters and cuts to LIMITS.
 */

export const FORMAT = 'cadcraft-docinfo';
export const FIELDS = Object.freeze(['title', 'subject', 'author', 'company', 'keywords', 'comments']);
export const LIMITS = Object.freeze({ title: 160, subject: 160, author: 120, company: 120, keywords: 300, comments: 1200, by: 120 });

const text = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);
const when = (v) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);

export function createDocInfo({ now = () => Date.now() } = {}) {
  let s = blank();
  const listeners = new Set();
  const changed = (why) => { for (const f of listeners) { try { f(why); } catch { /* a listener must not break the store */ } } };
  function blank() { return { title: '', subject: '', author: '', company: '', keywords: '', comments: '', created: 0, modified: 0, modifiedBy: '', revision: 0 }; }
  const api = {
    get: () => ({ ...s }),
    empty: () => !s.created && !FIELDS.some((f) => s[f]),
    set(patch = {}, { by = '' } = {}) {
      let any = false;
      for (const f of FIELDS) if (f in patch) { const v = text(patch[f], LIMITS[f]); if (v !== s[f]) { s[f] = v; any = true; } }
      if (!any) return false;
      if (!s.created) s.created = now();
      if (by) s.modifiedBy = text(by, LIMITS.by);
      changed('set'); return true;
    },
    stamp(by = '') {
      if (!s.created) s.created = now();
      s.modified = now(); s.revision += 1;
      if (by) s.modifiedBy = text(by, LIMITS.by);
      changed('stamp'); return api.get();
    },
    load(json) {
      const o = json && typeof json === 'object' && !Array.isArray(json) ? json : {};
      const next = blank();
      for (const f of FIELDS) next[f] = text(o[f], LIMITS[f]);
      next.created = when(o.created); next.modified = when(o.modified); next.modifiedBy = text(o.modifiedBy, LIMITS.by);
      next.revision = Math.min(1e9, Math.max(0, Math.floor(+o.revision) || 0));
      s = next; changed('load');
    },
    save() { return api.empty() ? null : { format: FORMAT, v: 1, ...s }; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  return api;
}

/** File sizes: 1,536 → "1.5 KB". Decimal units, as the site's downloads say. */
export function formatBytes(n) {
  n = Number(n);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n < 1000) return n + ' B';
  const u = ['KB', 'MB', 'GB', 'TB']; let i = -1;
  do { n /= 1000; i++; } while (n >= 1000 && i < u.length - 1);
  return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/\.?0+$/, '') + ' ' + u[i];
}

/** A count with thousands separators in the page's language. */
export const formatCount = (n, locale) => { try { return Number(n).toLocaleString(locale || undefined); } catch { return String(n); } };

/** One length in the drawing's unit, 15 significant digits kept in the number and 6 shown ("12.5 m"). */
export function formatLength(v, unit = '', locale) {
  v = Number(v);
  if (!Number.isFinite(v)) return '';
  let t;
  try { t = v.toLocaleString(locale || undefined, { maximumSignificantDigits: 6, maximumFractionDigits: 4 }); } catch { t = String(v); }
  return unit ? t + ' ' + unit : t;
}

export const COUNT_IDS = Object.freeze(['entities', 'elements', 'triangles', 'vertices', 'layers', 'blocks', 'sheets', 'levels', 'materials', 'groups', 'objects', 'annotations', 'points']);

/**
 * What an app's provider handed over → rows the panel draws. Provider shape (all optional):
 *   { units: 'mm', extents: { min: [x, y, z?], max: [x, y, z?] }, counts: { entities: 120, triangles: 40000, ... },
 *     extra: [{ label, value }], bytes: 51234, path: 'plans/house.dwg' }
 * Unknown count ids need a label in `extra`; a number that is not finite and ≥ 0 is dropped. Returns
 * { units, size: { dims: [w, h, d?], text }, counts: [{ id, n }], extra: [{ label, value }], bytes, path }.
 */
export function summarize(read, locale) {
  const r = read && typeof read === 'object' ? read : {};
  const out = { units: text(r.units, 24), size: null, counts: [], extra: [], bytes: null, path: text(r.path, 300) };
  const ex = r.extents;
  if (ex && Array.isArray(ex.min) && Array.isArray(ex.max)) {
    const dims = [];
    for (let i = 0; i < Math.min(3, ex.min.length, ex.max.length); i++) {
      const a = Number(ex.min[i]), b = Number(ex.max[i]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) { dims.length = 0; break; }
      dims.push(Math.abs(b - a));
    }
    if (dims.length >= 2) out.size = { dims, text: dims.map((d) => formatLength(d, '', locale)).join(' × ') + (out.units ? ' ' + out.units : '') };
  }
  const c = r.counts && typeof r.counts === 'object' ? r.counts : {};
  const ids = [...COUNT_IDS.filter((k) => k in c), ...Object.keys(c).filter((k) => !COUNT_IDS.includes(k))];
  for (const id of ids) { const n = c[id]; if (typeof n === 'number' && Number.isFinite(n) && n >= 0) out.counts.push({ id: text(id, 40), n: Math.floor(n) }); }
  for (const e of Array.isArray(r.extra) ? r.extra.slice(0, 40) : []) { const label = text(e?.label, 60), value = text(e?.value, 200); if (label && value) out.extra.push({ label, value }); }
  if (Number.isFinite(+r.bytes) && +r.bytes >= 0 && r.bytes !== null && r.bytes !== '') out.bytes = Math.floor(+r.bytes);
  return out;
}

/**
 * The assistants' tools (docs/AI-CONNECT-SPEC.md § 2): docinfo_get (read; the written text comes from the file, so untrusted) and docinfo_set
 * (edit, preview, the app's one undo step when it hands `step`).
 */
export function docinfoTools({ info, read, step = null } = {}) {
  const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const S = (d, max) => ({ type: 'string', maxLength: max, description: d });
  const run = (label, fn) => (typeof step === 'function' ? step(label, fn) : fn());
  const props = { title: S('Drawing title.', LIMITS.title), subject: S('Subject.', LIMITS.subject), author: S('Author.', LIMITS.author), company: S('Company or office.', LIMITS.company), keywords: S('Keywords, comma separated.', LIMITS.keywords), comments: S('Comments.', LIMITS.comments) };
  return [
    { name: 'docinfo_get', group: 'read', title: 'Get the drawing details', untrusted: true,
      description: 'Returns the open drawing\'s properties: title, subject, author, company, keywords, comments, created and last saved dates, and what the app counts (drawing size, units, entity, triangle and element counts). A number the app cannot count is left out, never 0.',
      inputSchema: obj({}),
      run: () => { let facts = null; try { facts = summarize(read ? read() : null); } catch { /* the app's own trouble */ } return { properties: info.get(), facts }; } },
    { name: 'docinfo_set', group: 'edit', title: 'Write the drawing details', outputSchema: { type: 'object', properties: { undo: { type: 'string' } } },
      description: 'Writes the drawing\'s title, subject, author, company, keywords or comments; fields you leave out are kept. The dates and counts cannot be written. One undo step.',
      inputSchema: obj(props),
      preview: (a) => ({ before: info.get(), changes: Object.fromEntries(FIELDS.filter((f) => f in a).map((f) => [f, text(a[f], LIMITS[f])])) }),
      run: (a) => run('Drawing details', () => { const changed = info.set(a, { by: 'assistant' }); return { changed, properties: info.get(), undo: 'Drawing details' }; }) },
  ];
}
