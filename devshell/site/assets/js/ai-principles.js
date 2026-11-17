/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol words, developer messages and the text an assistant reads; the person's own words are shell.principles.* in the shell's language file (app-ai-ask.js). */
/**
 * ai-principles.js — the four AI principles as checks the hub runs (0.10 BK.56, BK.140, BK.141; session assistant-10). DOM-free, no imports, no network;
 * tested in Node (bin/test-principles.mjs). The apps contain no AI (rule 35): an assistant the person connected calls tools and writes words. This
 * file is what holds the words to the rules.
 *
 *   1  Optional           everything works without an AI and offline  (BK.140)  → a test: bin/test-principles.mjs runs the Ask box, the tools and the
 *                         filter with no assistant connected and every network door trapped; tools/ai-scan/no-ai-scan.mjs finds no model client in an app
 *   2  The model          every number an AI feature shows comes from an engine call; the AI never writes a figure  (BK.141)  → the figure ledger below
 *      calculates
 *   3  Trust but verify   scanned and AI-made elements are marked unverified (BK.143), estimates and audits are signed off by a person (BK.144)
 *                         → ai-signoff.js and the apps' unverified flag; a person clears and signs, an assistant cannot
 *   4  Model data only    personal and admin information is never sent (BK.145)  → ai-model-only.js
 *
 *   const ledger = createLedger()
 *     ledger.record(value, { tool })      every tool result passes here on its way out (the dispatcher's `outgoing`): its numbers are kept, never its words
 *     ledger.allow(text)                  numbers the person typed (the question) are the person's own figures, not the AI's
 *     ledger.has(n, decimals?)            is that figure in a result (within the rounding it was written with, or as a percentage of one)
 *     ledger.size · ledger.clear()
 *   checkFigures(text, ledger) → { figures: [{ text, value }], traced, untraced: [{ text, value }], ok, note }
 *   figuresIn(text) → [{ text, value, decimals }]
 *   withLedger(outgoing, ledger) → an `outgoing` function that records, then passes the value on unchanged
 *   PRINCIPLES · principleStatus({ ledger, answer }) → the four rules with how each is checked
 *
 * What counts as a figure: a number written in the text that is not part of a word or an identifier (A4, wall_12), not the number of a list item, not a
 * year, not inside a date. "Level 2" is traced because the tool result that named the level holds a 2. A figure the AI worked out itself (a sum, a unit
 * conversion) is NOT in any result and is listed as untraced: the box says so, and the answer's author (the assistant, through ask_reply) is told, so it can
 * call the tool that gives the number instead.
 */

export const LIMITS = Object.freeze({ numbers: 60000, text: 6000, figures: 40 });

const NUM = /(?<![\w.,])[-−+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?![\w])/g;
const YEAR = /^(?:19|20)\d{2}$/;

/** The numbers in a text with the decimals each was written with. A thousands comma is dropped; a list marker, a date, a year and an identifier are not figures. */
export function figuresIn(text) {
  const s = String(text ?? '').slice(0, LIMITS.text * 4);
  const out = [];
  const lines = s.split(/\n/);
  let pos = 0;
  for (const line of lines) {
    // a list item's own number ("1." "2)" "3 -") at the start of a line
    const lead = /^\s*(?:[-*•]\s*)?(\d{1,3})[.)]\s/.exec(line);
    const skipTo = lead ? lead[0].length : 0;
    NUM.lastIndex = 0;
    let m;
    while ((m = NUM.exec(line))) {
      if (m.index < skipTo) continue;
      const raw = m[0];
      const next = line[m.index + raw.length] || '';
      const before = line.slice(Math.max(0, m.index - 1), m.index);
      if (/[A-Za-z_]/.test(before)) continue;
      const num = raw.replace(/,/g, '').replace('−', '-');
      if (YEAR.test(num) && !/[.,]/.test(raw)) continue;
      // dates: 2026-11-14, 14/11/2026, 11.14.2026
      const around = line.slice(Math.max(0, m.index - 10), m.index + raw.length + 10);
      if (/\d{4}-\d{2}-\d{2}/.test(around) || /\d{1,2}[/.]\d{1,2}[/.]\d{2,4}/.test(around)) continue;
      if (next === '/' && /\d/.test(line[m.index + raw.length + 1] || '')) continue;
      const value = Number(num);
      if (!Number.isFinite(value)) continue;
      const dot = num.indexOf('.');
      const percent = /^\s*%/.test(line.slice(m.index + raw.length));
      out.push({ text: raw + (percent ? '%' : ''), value, decimals: dot < 0 ? 0 : num.length - dot - 1, percent });
      if (out.length >= LIMITS.figures * 4) return out;
    }
    pos += line.length + 1;
  }
  return out;
}

/** The numbers in a tool result: numeric values, and the numbers inside its texts ("Level 2", "1200 x 2100"). Names and words are not kept. */
function walk(v, put, depth = 0, budget = { n: 20000 }) {
  if (budget.n-- <= 0 || depth > 12 || v === null || v === undefined) return;
  if (typeof v === 'number') { if (Number.isFinite(v)) put(v); return; }
  if (typeof v === 'boolean') return;
  if (typeof v === 'string') { for (const f of figuresIn(v.slice(0, 2000))) put(f.value); const all = v.match(/\d+(?:\.\d+)?/g); if (all) for (const a of all.slice(0, 200)) put(Number(a)); return; }
  if (Array.isArray(v)) { for (const x of v) walk(x, put, depth + 1, budget); return; }
  if (typeof v === 'object') {
    if (Array.isArray(v.content)) { for (const b of v.content) if (b && b.type === 'text') { try { walk(JSON.parse(b.text), put, depth + 1, budget); } catch { walk(b.text, put, depth + 1, budget); } } return; }
    for (const k of Object.keys(v)) walk(v[k], put, depth + 1, budget);
  }
}

export function createLedger({ max = LIMITS.numbers } = {}) {
  let nums = [];           // every number a tool result held, in the order seen
  let sorted = null;       // lazily sorted copy for lookups
  let own = [];            // numbers the person typed
  const put = (n) => { if (Number.isFinite(n)) { nums.push(n); sorted = null; } };
  const lookup = (n, tol) => {
    if (!sorted) sorted = Float64Array.from(nums).sort();
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < n - tol) lo = mid + 1; else hi = mid; }
    return lo < sorted.length && sorted[lo] <= n + tol;
  };
  const api = {
    record(value, ctx = {}) {
      if (ctx && /^ask_/.test(ctx.tool || '')) return;   // the question board is the person's words, not a result
      walk(value, put);
      if (nums.length > max) { nums = nums.slice(nums.length - max); sorted = null; }
    },
    allow(text) { for (const f of figuresIn(text)) own.push(f.value); if (own.length > 2000) own = own.slice(-2000); },
    has(n, decimals = 0, percent = false) {
      const tol = 0.5 * 10 ** -decimals + 1e-9 * Math.max(1, Math.abs(n));
      if (own.some((x) => Math.abs(x - n) <= tol)) return true;
      if (lookup(n, tol)) return true;
      if (percent && lookup(n / 100, tol / 100 + 1e-9)) return true;
      return false;
    },
    get size() { return nums.length; },
    clear() { nums = []; sorted = null; own = []; },
  };
  return api;
}

/** An answer's figures against the ledger. */
export function checkFigures(text, ledger) {
  const fs = figuresIn(text);
  const seen = new Set();
  const figures = [], untraced = [];
  for (const f of fs) {
    const key = f.text;
    if (seen.has(key)) continue;
    seen.add(key);
    const item = { text: f.text, value: f.value };
    figures.push(item);
    if (!ledger.has(f.value, f.decimals, f.percent)) untraced.push(item);
    if (figures.length >= LIMITS.figures) break;
  }
  const ok = untraced.length === 0;
  const note = ok ? (figures.length ? 'Every figure in this answer is in a result the app returned.' : '')
    : (untraced.length === 1 ? 'This figure is not in any result the app returned: ' : 'These figures are not in any result the app returned: ') + untraced.slice(0, 8).map((x) => x.text).join(', ') + (untraced.length > 8 ? ', …' : '') +
      '. Do not use it until the app has calculated it.';
  return { figures, traced: figures.length - untraced.length, untraced, ok, note };
}

/** An `outgoing` (dispatcher) function that keeps the numbers of each result in the ledger and passes the value on as it came. */
export function withLedger(outgoing, ledger) {
  return (value, ctx) => {
    const out = typeof outgoing === 'function' ? outgoing(value, ctx) : { value };
    try { ledger.record(out && 'value' in out ? out.value : value, ctx || {}); } catch { /* a ledger that fails records nothing */ }
    return out;
  };
}

export const PRINCIPLES = Object.freeze([
  { id: 'optional', rows: ['BK.56', 'BK.140'], rule: 'Optional: everything works without an AI, and offline.', how: 'No model client in any app (no-ai-scan); the Ask box, the tools and the filters run with no assistant connected and the network shut (bin/test-principles.mjs).' },
  { id: 'calculates', rows: ['BK.56', 'BK.141'], rule: 'The model calculates; the AI explains, arranges and checks, and never writes a figure.', how: 'Every figure in an answer is looked up in the results the app returned this session; the box lists the ones it cannot find, and ask_reply tells the assistant.' },
  { id: 'verify', rows: ['BK.56', 'BK.143', 'BK.144'], rule: 'Trust but verify: scanned and AI-made elements are unverified until a person checks them; estimates and audits are signed off by a person.', how: 'The unverified flag on elements (a person clears it; no tool does); the sign-off record in the file (a person writes it; no tool does) and the line on every estimate or audit an assistant hands back.' },
  { id: 'model-only', rows: ['BK.56', 'BK.145'], rule: 'Model data only: personal and admin information is never sent to an AI.', how: 'The filter every tool result passes (ai-model-only.js) and the list under each call in Activity.' },
]);

/** The four rules with live facts: how many figures the session holds, and what the last answer's check found. */
export function principleStatus({ ledger, answer } = {}) {
  const check = answer ? checkFigures(answer, ledger || createLedger()) : null;
  return PRINCIPLES.map((p) => ({ ...p, live: p.id === 'calculates' ? { results: ledger ? ledger.size : 0, answer: check ? { figures: check.figures.length, untraced: check.untraced.map((x) => x.text) } : null } : null }));
}

/** principles_get: the four rules and how each is checked, for an assistant that wants to follow them (read only). */
export function principleTools({ ledger } = {}) {
  return [{
    name: 'principles_get', group: 'read', title: 'The rules every assistant follows',
    description: 'The four rules an assistant follows in CadCraft: optional, the model calculates (you never write a figure: call a tool and quote its result), trust but verify (what you make is unverified until a person checks it; estimates and audits are signed off by a person, not you), model data only. Each comes with how the app checks it. Read it once before answering with numbers.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: () => ({ principles: principleStatus({ ledger }).map((p) => ({ id: p.id, rule: p.rule, how: p.how, rows: p.rows })), resultsKnown: ledger ? ledger.size : 0 }),
  }];
}
