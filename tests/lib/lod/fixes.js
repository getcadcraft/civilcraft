// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * fixes.js: the one-click fix lists for missing tags and unnamed rooms, host-free (0.10 booklet row BK.151, session bim-lod-10). No DOM.
 * The CHECKS are lib/modelaudit (rule sets `rooms` and `tags`, row BK.65); this file adds what the row's "left" said was missing: a
 * list of proposed fixes the person can edit and apply in one step. Nothing is applied here: the host writes the accepted rows
 * (one undo step) and the list only PROPOSES.
 *
 *   TAG_DEFAULTS                 { door: 'D', window: 'W', device: 'E', room: '' }  the prefix a kind starts with when the model has none yet
 *   proposeTags(items, { defaults, taken }) → [{ id, kind, label, tag }]
 *       items = [{ id, kind: 'door'|'window'|'room'|'device', tag, label }]; the model's own pattern wins: the commonest prefix among the
 *       tags the kind already has (D1, D2 → D3; 101, 102 → 103), numbering after the highest, skipping any tag taken anywhere.
 *   roomNameFixes(rooms, { isAutoName }) → [{ id, number, current, name: '' }]
 *       A room's name is the person's to give (nothing true can be proposed), so the list holds a blank to fill; `appliable` keeps the ones filled.
 *   appliable(rows, field) → the rows whose field is a non-empty text
 */
export const TAG_DEFAULTS = Object.freeze({ door: 'D', window: 'W', device: 'E', room: '' });
const PAT = /^(\D*?)(\d+)$/;

export function proposeTags(items, { defaults = TAG_DEFAULTS, taken = [] } = {}) {
  const used = new Set([...taken, ...(items || []).map((x) => String(x.tag ?? '').trim()).filter(Boolean)].map((s) => s.toLowerCase()));
  const out = [];
  for (const kind of [...new Set((items || []).map((x) => x.kind))]) {
    const mine = items.filter((x) => x.kind === kind);
    const have = mine.map((x) => String(x.tag ?? '').trim()).filter(Boolean).map((s) => PAT.exec(s)).filter(Boolean);
    const count = new Map();
    for (const m of have) count.set(m[1], (count.get(m[1]) || 0) + 1);
    let prefix = defaults[kind] ?? '', best = 0;
    for (const [p, n] of count) if (n > best) { best = n; prefix = p; }
    const width = have.filter((m) => m[1] === prefix).reduce((w, m) => Math.max(w, /^0/.test(m[2]) ? m[2].length : 0), 0);
    let next = have.filter((m) => m[1] === prefix).reduce((mx, m) => Math.max(mx, Number(m[2])), 0) + 1;
    for (const x of mine) {
      if (String(x.tag ?? '').trim()) continue;
      let tag;
      do { tag = prefix + (width ? String(next).padStart(width, '0') : String(next)); next++; } while (used.has(tag.toLowerCase()));
      used.add(tag.toLowerCase());
      out.push({ id: x.id, kind, label: x.label || '', tag });
    }
  }
  return out;
}
export function roomNameFixes(rooms, { isAutoName = () => false } = {}) {
  return (rooms || []).filter((r) => { const n = String(r.name ?? '').trim(); return !n || isAutoName(n, r); })
    .map((r) => ({ id: r.id, number: r.number || '', current: String(r.name ?? '').trim(), name: '' }));
}
export const appliable = (rows, field = 'name') => (rows || []).filter((r) => typeof r[field] === 'string' && r[field].trim());
