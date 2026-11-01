/* SPDX-License-Identifier: Apache-2.0 */
/**
 * totals.js — running totals for the status bar (0.8 round 2, EG.30): cost, carbon, weight and time, summed from numbers each app feeds
 * through ONE hook. DOM-free, no imports; tested in Node (bin/test-totals.mjs). The shell's UI is app-totals.js.
 *
 *   const totals = createTotals({ now, timers })
 *   const h = totals.source({ id, measure, label, read })
 *     measure  'cost' | 'carbon' | 'weight' | 'time'
 *     read()   → { value, currency?, note?, parts? } | number | null     in the measure's BASE unit: cost = money in `currency`, carbon = kg CO2e,
 *              weight = kg, time = hours. null / not a number = "this source has nothing to say yet" (it is left out, never counted as 0)
 *   h.invalidate()  the app's numbers changed: the totals re-read (debounced); h.remove().
 *
 * Honesty (CLAUDE.md): a measure nobody feeds is not shown; a total says how many sources it adds up and how many have no number yet;
 * costs in different currencies are never added together (the total reads "mixed currencies" and each is listed); a source that throws
 * is left out and named. Nothing is estimated here — the factors and prices live with the app that feeds the number.
 */

export const MEASURES = Object.freeze(['cost', 'carbon', 'weight', 'time']);
export const BASE = Object.freeze({ cost: 'currency', carbon: 'kg CO₂e', weight: 'kg', time: 'h' });

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const cleanId = (s) => String(s ?? '').replace(/[^\w.:-]/g, '').slice(0, 60);
const cleanText = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').slice(0, n);
const cur = (s) => (/^[A-Za-z]{3}$/.test(String(s || '')) ? String(s).toUpperCase() : '');

/** Words for a number: grouped, 3 significant digits when small. `t(key, vars)` is the shell's translator; without it, English units. */
export function format(measure, value, { currency = '', locale = undefined } = {}) {
  const v = num(value); if (v === null) return '';
  const n = (x, max) => new Intl.NumberFormat(locale, { maximumFractionDigits: max }).format(x);
  const a = Math.abs(v);
  if (measure === 'cost') {
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: a >= 1000 ? 0 : 2 }).format(v); } catch { return n(v, 2) + (currency ? ' ' + currency : ''); }
  }
  if (measure === 'carbon') return a >= 1e6 ? n(v / 1e6, 2) + ' kt CO₂e' : a >= 1000 ? n(v / 1000, 2) + ' t CO₂e' : n(v, a >= 100 ? 0 : 1) + ' kg CO₂e';
  if (measure === 'weight') return a >= 1000 ? n(v / 1000, 2) + ' t' : n(v, a >= 100 ? 0 : 1) + ' kg';
  if (measure === 'time') return a >= 8 * 5 * 8 ? n(v / (8 * 5), 1) + ' weeks' : a >= 8 ? n(v / 8, 1) + ' days' : a >= 1 ? n(v, 1) + ' h' : n(v * 60, 0) + ' min';
  return n(v, 2);
}

export function createTotals({ now = () => Date.now(), timers = { set: (f, ms) => setTimeout(f, ms), clear: (h) => clearTimeout(h) }, debounceMs = 120 } = {}) {
  const sources = new Map();
  const listeners = new Set();
  let snap = null, timer = null;
  const base = new Map();   // measure → the total at the last save (or the first number read): what "the change since" is measured from

  function read(src) {
    let r; try { r = src.read(); } catch (e) { return { failed: cleanText(e && e.message, 120) || 'failed' }; }
    if (r === null || r === undefined) return null;
    if (typeof r === 'number') return num(r) === null ? null : { value: r };
    if (typeof r !== 'object') return null;
    const v = num(r.value); if (v === null) return null;
    return { value: v, currency: cur(r.currency), note: cleanText(r.note, 160), parts: Array.isArray(r.parts) ? r.parts.slice(0, 20).map((p) => ({ label: cleanText(p && p.label, 60), value: num(p && p.value) })).filter((p) => p.value !== null) : [] };
  }
  function compute() {
    const out = [];
    for (const m of MEASURES) {
      const mine = [...sources.values()].filter((s) => s.measure === m);
      if (!mine.length) continue;
      let sum = 0, have = 0, waiting = 0; const failed = [], parts = [], byCur = new Map();
      for (const s of mine) {
        const r = read(s);
        if (!r) { waiting++; continue; }
        if (r.failed) { failed.push({ id: s.id, label: s.label, why: r.failed }); continue; }
        have++; sum += r.value;
        parts.push({ id: s.id, label: s.label, value: r.value, currency: r.currency, note: r.note, parts: r.parts });
        if (m === 'cost') byCur.set(r.currency, (byCur.get(r.currency) || 0) + r.value);
      }
      if (!have && !failed.length) { out.push({ measure: m, value: null, since: null, sinceText: '', text: '', waiting, sources: mine.length, parts, failed, mixed: false }); continue; }
      const mixed = m === 'cost' && byCur.size > 1;
      const currency = m === 'cost' && byCur.size === 1 ? [...byCur.keys()][0] : '';
      // the change since the last save: the first number read becomes the baseline until the app says it saved (markSaved); never across currencies
      let since = null, sinceText = '';
      if (have && !mixed) {
        const b = base.get(m);
        if (!b || b.currency !== currency) base.set(m, { value: sum, currency });
        else if (Math.abs(sum - b.value) > 1e-9 * Math.max(1, Math.abs(b.value))) { since = sum - b.value; sinceText = (since > 0 ? '+' : '−') + format(m, Math.abs(since), { currency }); }
        else since = 0;
      }
      out.push({ since, sinceText,
        measure: m, value: have && !mixed ? sum : null, currency, mixed, unit: m === 'cost' ? currency : BASE[m],
        text: mixed ? [...byCur].map(([c, v]) => format('cost', v, { currency: c })).join(' + ') : have ? format(m, sum, { currency }) : '',
        sources: mine.length, counted: have, waiting, parts, failed,
      });
    }
    return out;
  }
  function refresh() { timer = null; snap = compute(); for (const f of listeners) { try { f(snap); } catch { /* a listener must not break the totals */ } } }
  function invalidate() { if (timer !== null) return; timer = timers.set(refresh, debounceMs); }

  return {
    source(def) {
      const id = cleanId(def && def.id); const measure = def && def.measure;
      if (!id || !MEASURES.includes(measure) || typeof def.read !== 'function') throw new Error('A totals source needs an id, a measure (' + MEASURES.join(', ') + ') and a read() function.');
      sources.set(id, { id, measure, label: cleanText(def.label || id, 60), read: def.read });
      invalidate();
      return { id, invalidate, remove() { sources.delete(id); invalidate(); } };
    },
    invalidate,
    /** The app saved: what is shown now is the new baseline for "since the last save". */
    markSaved() { base.clear(); invalidate(); },
    /** Another file was opened: the old baseline means nothing. */
    reset() { base.clear(); invalidate(); },
    /** Read now (tests, reports). */
    snapshot() { return compute(); },   // a read only: the pending refresh (and the listeners it tells) is left alone
    last: () => snap,
    measures: () => [...new Set([...sources.values()].map((s) => s.measure))],
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    format,
  };
}

/** The assistants' read tool: totals_get. Numbers come from the app's own sources; nothing is estimated here. */
export function totalsTools({ totals } = {}) {
  return [{
    name: 'totals_get', group: 'read', title: 'Get the running totals',
    description: 'Returns the running totals the app shows in its status bar: cost, carbon, weight and time, with how many sources each adds up and how many have no number yet. A measure no one feeds is absent. Costs in different currencies are listed, not added.',
    inputSchema: { type: 'object', properties: { measure: { type: 'string', enum: [...MEASURES], description: 'Only this measure.' } }, additionalProperties: false },
    untrusted: true,
    run: (a = {}) => ({ totals: totals.snapshot().filter((t) => !a.measure || t.measure === a.measure) }),
  }];
}
