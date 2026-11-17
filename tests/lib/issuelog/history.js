/* SPDX-License-Identifier: Apache-2.0 */
/**
 * history.js: the ONE issue history (0.10 BK.46, BK.48; session bk-r3-stages-10). Host-free, no DOM, no imports: BimCraft's sheets,
 * MarkupCraft's pages, TakeoffCraft's sheets and DetailCraft's shop drawings all record issues in this shape, so a drawing changelog
 * reads the same in every app and in SuperCad Studio. Synced byte-identical into <app>/dev/issuelog/ by tools/issuelog/sync.mjs.
 *
 * An ISSUE is a set of sheets given out on a date for a purpose, each sheet at a revision, with a print of what was on it:
 *   history = { format: 'cadcraft-issues', version: 1, issues: [issue…] (oldest first), records: [record…] }
 *   issue   = { id, code ('A', 'B' … or 'P1', 'P2' …: the revision this issue gives a changed sheet), purpose (PURPOSES), name, date
 *               ('YYYY-MM-DD'), by, note, app (who recorded it), stage (the project stage word at the time, '' when unknown),
 *               sheets: [{ id, number, title, rev, hash (what is on the sheet: its set-up and its elements), def (its set-up alone, optional), state: 'first' | 'revised' | 'unchanged',
 *                          scope: { all, storeys: [id…], classes: [name…] } | null }],
 *               elements: n (how many elements were printed; 0 = none kept), snapshot: { name, bytes, sha256 } | null }
 *   Element prints (which elements, and a print of each one's properties and shape) are kept beside the history by the host, packed by
 *   packPrints(): they can be large, and a host may keep them out of a small exchange file.
 *   print   = Map(guid → { p (print of its properties), g (print of its place and shape), c (class), s (storey id or '') })
 *
 * A RECORD is something that happened against an issue: a site instruction, a trade's shop drawing or markup set coming back, a linked
 * model, a revision cloud.
 *   record  = { id, kind (RECORD_KINDS), issue (an issue id or ''), ref ('SI-003'), title, date, by, note, status (RECORD_STATES),
 *               sheets: [sheet number…], elements: [guid…], rev (the revision a cloud belongs to), link (a web address or a file name),
 *               file: { name, bytes, sha256 } | null, app, target (the host's own id: a markup, a cloud, a linked model), at (ISO, last change) }
 *
 *   cleanHistory(raw) · emptyHistory() · historyJson(history, { prints }) · readHistoryJson(text) → { ok, history, prints, why }
 *   nextRev(rev) (letters, I and O skipped: moved here from DetailCraft's issue log) · nextCode(history) · textPrint(text)
 *   sheetPrint(sheet, parts) → hash · elementPrint(props, shape) → { p, g }
 *   planIssue(history, { sheets, prints, … }) → issue (not yet added: every sheet's rev and state worked out against the last issue it was in)
 *   addIssue(history, issue) → history' · removeIssue(history, id) → history' (its records stay, unattached)
 *   lastIssueOf(history, sheetId) · sheetRev(history, sheetId)
 *   comparePrints(old, now) → { added: [guid], removed: [guid], changed: [{ guid, props, shape }], same }
 *   changesSince(issue, { sheets, prints, oldPrints }) → { sheets: [{ id, number, title, rev, state: 'same' | 'changed' | 'added' | 'removed',
 *        why: ['sheet' | 'elements'], elements: { added, removed, changed: [guid…] } }], elements: comparePrints() | null, counts }
 *   changelog(history, { records }) → { issues: [{ id, code, date, purpose, name, by, note, sheets, first, revised, unchanged, records }],
 *        sheets: [{ id, number, title, revs: [{ issue, code, rev, state } | null per issue], current }], records: [record + issueCode] }
 *   changelogTable(history, words, opts) → { head, rows } · changelogCsv(history, words, opts) · changelogMarkdown(history, words, opts)
 *   nextRef(history, kind) · cleanRecord(raw) · putRecord(history, record) → history' · dropRecord(history, id) → history'
 *   recordsFor(history, { issue, sheet, kind, extra })
 *   mergeHistory(a, b) → the union (by issue id and record id; a record's newer `at` wins)
 *   fromSheetIssues(list, { app }) → history: a per-sheet issue log (DetailCraft's state.issues) regrouped as issues by date and note
 *   packPrints(Map) → text · unpackPrints(text) → Map
 */

export const FORMAT = 'cadcraft-issues', VERSION = 1;
export const PURPOSES = Object.freeze(['information', 'concept', 'submission', 'tender', 'construction', 'record']);
export const RECORD_KINDS = Object.freeze(['instruction', 'shop-drawing', 'markup', 'linked-model', 'cloud', 'note']);
export const RECORD_STATES = Object.freeze(['open', 'answered', 'approved', 'approved-as-noted', 'revise', 'closed']);
export const REF_PREFIX = Object.freeze({ instruction: 'SI', 'shop-drawing': 'SD', markup: 'MK', 'linked-model': 'LM', cloud: 'RC', note: 'N' });
export const LIMITS = Object.freeze({ issues: 500, sheets: 2000, records: 5000, elements: 60000, text: 2000, ids: 500 });

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const CONTROL = new RegExp('[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u2028\\u2029]', 'g');
const str = (v, n = 200) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(CONTROL, '').trim().slice(0, n) : '');
const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '');
const idOk = (v) => (/^[A-Za-z0-9._:$-]{1,80}$/.test(String(v ?? '')) ? String(v) : '');
const list = (v, n, f) => (Array.isArray(v) ? v.slice(0, n).map(f).filter((x) => x !== '' && x !== null && x !== undefined) : []);

/** The revision letter after rev ('' → 'A'); I and O are skipped, after Z comes AA. A numbered revision ('P1', '03') counts up. */
export function nextRev(rev) {
  const r = String(rev || '').toUpperCase();
  if (!r) return 'A';
  const m = /^([A-Z]*?)(\d+)$/.exec(r);
  if (m) return m[1] + String(Number(m[2]) + 1).padStart(m[2].length, '0');
  const digits = [...r].map((c) => LETTERS.indexOf(c));
  if (digits.some((d) => d < 0)) return 'A';
  let i = digits.length - 1;
  while (i >= 0 && digits[i] === LETTERS.length - 1) { digits[i] = 0; i--; }
  if (i < 0) digits.unshift(0); else digits[i]++;
  return digits.map((d) => LETTERS[d]).join('');
}

/** FNV-1a (32 bit) of a text, base 36: a print, not a secret. */
export function textPrint(text) {
  let h = 0x811c9dc5;
  const s = String(text ?? '');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36);
}
const stable = (v) => (v === null || typeof v !== 'object' ? JSON.stringify(v ?? null)
  : Array.isArray(v) ? '[' + v.map(stable).join(',') + ']'
    : '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}');
/** A sheet's print: what defines it (any plain object: number, title, views…) and the prints of the parts drawn on it, in a stable order. */
export const sheetPrint = (sheet, parts = []) => textPrint(stable(sheet) + '|' + [...parts].sort().join(','));
/** An element's print: p from its properties (any plain value), g from its place and shape (numbers are rounded to 6 significant places first). */
export function elementPrint(props, shape) {
  const r = (v) => (typeof v === 'number' ? Number(v.toPrecision(6)) : Array.isArray(v) ? v.map(r) : v);
  return { p: textPrint(stable(props)), g: textPrint(stable(r(shape))) };
}

const cleanScope = (s) => (s && typeof s === 'object' ? { all: !!s.all, storeys: list(s.storeys, 200, idOk), classes: list(s.classes, 100, (c) => str(c, 60)) } : null);
function cleanSheet(s) {
  const id = idOk(s?.id);
  if (!id) return null;
  return { id, number: str(s.number, 40), title: str(s.title, 160), rev: str(s.rev, 12), hash: str(s.hash, 40), def: str(s.def, 40), state: ['first', 'revised', 'unchanged'].includes(s.state) ? s.state : 'first', scope: cleanScope(s.scope) };
}
const cleanFile = (f) => (f && typeof f === 'object' && str(f.name, 200) ? { name: str(f.name, 200), bytes: Math.max(0, Math.round(Number(f.bytes) || 0)), sha256: /^[0-9a-f]{64}$/.test(String(f.sha256 || '')) ? f.sha256 : '' } : null);
function cleanIssue(x) {
  const id = idOk(x?.id);
  if (!id) return null;
  const seen = new Set();
  return {
    id, code: str(x.code, 12) || 'A', purpose: PURPOSES.includes(x.purpose) ? x.purpose : 'information', name: str(x.name, 160), date: day(x.date), by: str(x.by, 120), note: str(x.note, LIMITS.text),
    app: str(x.app, 40), stage: str(x.stage, 40),
    sheets: list(x.sheets, LIMITS.sheets, cleanSheet).filter((s) => (seen.has(s.id) ? false : seen.add(s.id))),
    elements: Math.max(0, Math.round(Number(x.elements) || 0)), snapshot: cleanFile(x.snapshot),
  };
}
export function cleanRecord(x) {
  const id = idOk(x?.id);
  if (!id || !RECORD_KINDS.includes(x.kind)) return null;
  return {
    id, kind: x.kind, issue: idOk(x.issue), ref: str(x.ref, 40), title: str(x.title, 200), date: day(x.date), by: str(x.by, 120), note: str(x.note, LIMITS.text),
    status: RECORD_STATES.includes(x.status) ? x.status : 'open', sheets: list(x.sheets, 200, (s) => str(s, 40)), elements: list(x.elements, LIMITS.ids, idOk), rev: str(x.rev, 12),
    link: str(x.link, 500), file: cleanFile(x.file), app: str(x.app, 40), target: str(x.target, 120), at: str(x.at, 40),
  };
}
export const emptyHistory = () => ({ format: FORMAT, version: VERSION, issues: [], records: [] });
export function cleanHistory(raw) {
  const h = emptyHistory();
  if (!raw || typeof raw !== 'object') return h;
  const seen = new Set(), seenR = new Set();
  h.issues = list(raw.issues, LIMITS.issues, cleanIssue).filter((x) => (seen.has(x.id) ? false : seen.add(x.id)));
  h.records = list(raw.records, LIMITS.records, cleanRecord).filter((x) => (seenR.has(x.id) ? false : seenR.add(x.id)));
  return h;
}

// ------------------------------------------------------------------------------------------------ element prints
/** Map(guid → { p, g, c, s }) → one text with no quotes or line ends (it is kept in an IFC text): classes,…|storeys,…|guid p g c s;… */
export function packPrints(map) {
  if (!map || !map.size) return '';
  const cls = [], sto = [], ci = new Map(), si = new Map();
  const ix = (m, a, v) => { if (!m.has(v)) { m.set(v, a.length); a.push(v); } return m.get(v); };
  const word = (v) => str(v, 60).replace(/[^A-Za-z0-9._:$-]/g, '_');
  const rows = [];
  for (const [g, e] of map) {
    if (!idOk(g) || rows.length >= LIMITS.elements) continue;
    rows.push(g + ' ' + word(e.p) + ' ' + word(e.g) + ' ' + ix(ci, cls, word(e.c)) + ' ' + ix(si, sto, word(e.s)));
  }
  return cls.join(',') + '|' + sto.join(',') + '|' + rows.join(';');
}
export function unpackPrints(text) {
  const out = new Map();
  const a = String(text || '').split('|');
  if (a.length !== 3) return out;
  const cls = a[0].split(','), sto = a[1].split(',');
  for (const line of a[2].split(';')) {
    const f = line.split(' ');
    if (f.length !== 5 || !idOk(f[0]) || out.size >= LIMITS.elements) continue;
    out.set(f[0], { p: f[1], g: f[2], c: cls[Number(f[3])] ?? '', s: sto[Number(f[4])] ?? '' });
  }
  return out;
}
export function comparePrints(old, now) {
  const added = [], removed = [], changed = [];
  let same = 0;
  for (const [g, a] of old || []) {
    const b = now?.get(g);
    if (!b) { removed.push(g); continue; }
    const props = a.p !== b.p, shape = a.g !== b.g;
    if (props || shape) changed.push({ guid: g, props, shape }); else same++;
  }
  for (const g of (now || new Map()).keys()) if (!old?.has(g)) added.push(g);
  return { added, removed, changed, same };
}
/** An element is on a sheet when the sheet shows the whole model, its storey, or its class (a schedule). */
const inScope = (scope, e) => !!scope && !!e && (scope.all || scope.storeys.includes(e.s) || scope.classes.includes(e.c));

// ------------------------------------------------------------------------------------------------ issues
export const lastIssueOf = (history, sheetId, before = null) => {
  const L = history.issues, end = before ? L.findIndex((x) => x.id === before) : L.length;
  for (let i = (end < 0 ? L.length : end) - 1; i >= 0; i--) { const s = L[i].sheets.find((x) => x.id === sheetId); if (s) return { issue: L[i], sheet: s }; }
  return null;
};
export const sheetRev = (history, sheetId) => lastIssueOf(history, sheetId)?.sheet.rev || '';
/** The code a new issue would take: the one after the last issue's. */
export const nextCode = (history) => nextRev(history.issues[history.issues.length - 1]?.code || '');

/**
 * A new issue, worked out against the history: a sheet never issued is `first` and takes the issue's code as its revision; a sheet
 * whose print differs from its last issue is `revised` and takes the code; an unchanged sheet keeps the revision it had.
 * sheets = [{ id, number, title, hash, scope }] (the ones chosen for this issue).
 */
export function planIssue(history, { id, code, purpose = 'information', name = '', date = '', by = '', note = '', app = '', stage = '', sheets = [], elements = 0, snapshot = null } = {}) {
  const c = str(code, 12) || nextCode(history);
  const out = [];
  for (const s of sheets) {
    const last = lastIssueOf(history, s.id);
    const state = !last ? 'first' : last.sheet.hash !== s.hash ? 'revised' : 'unchanged';
    out.push({ id: s.id, number: s.number, title: s.title, hash: s.hash, def: s.def || '', scope: s.scope || null, state, rev: state === 'unchanged' ? last.sheet.rev : c });
  }
  return cleanIssue({ id: id || 'i' + textPrint(c + '|' + date + '|' + name + '|' + history.issues.length + '|' + out.map((s) => s.id + s.hash).join(',')), code: c, purpose, name, date, by, note, app, stage, sheets: out, elements, snapshot });
}
export function addIssue(history, issue) {
  const x = cleanIssue(issue);
  if (!x) return history;
  return { ...history, issues: [...history.issues.filter((i) => i.id !== x.id), x].slice(-LIMITS.issues) };
}
export const removeIssue = (history, id) => ({ ...history, issues: history.issues.filter((i) => i.id !== id), records: history.records.map((r) => (r.issue === id ? { ...r, issue: '' } : r)) });

/**
 * What changed since an issue. sheets = the drawing's sheets now [{ id, number, title, hash }]; prints = the elements now and
 * oldPrints = the issue's (both Maps, or null when the host keeps none: then only sheets are told apart).
 */
export function changesSince(issue, { sheets = [], prints = null, oldPrints = null } = {}) {
  const els = prints && oldPrints && oldPrints.size ? comparePrints(oldPrints, prints) : null;
  const now = new Map(sheets.map((s) => [s.id, s]));
  const rows = [];
  const touch = (scope) => {
    const o = { added: [], removed: [], changed: [] };
    if (!els || !scope) return o;
    for (const g of els.added) if (inScope(scope, prints.get(g))) o.added.push(g);
    for (const g of els.removed) if (inScope(scope, oldPrints.get(g))) o.removed.push(g);
    for (const c of els.changed) if (inScope(scope, prints.get(c.guid)) || inScope(scope, oldPrints.get(c.guid))) o.changed.push(c.guid);
    return o;
  };
  for (const s of issue.sheets) {
    const cur = now.get(s.id);
    if (!cur) { rows.push({ id: s.id, number: s.number, title: s.title, rev: s.rev, state: 'removed', why: [], elements: { added: [], removed: [], changed: [] } }); continue; }
    const e = touch(s.scope), why = [];
    const els = e.added.length + e.removed.length + e.changed.length;
    if (s.def && cur.def ? s.def !== cur.def : cur.hash !== s.hash && !els) why.push('sheet');
    if (els) why.push('elements');
    if (!why.length && cur.hash !== s.hash) why.push('sheet');
    rows.push({ id: s.id, number: cur.number, title: cur.title, rev: s.rev, state: why.length ? 'changed' : 'same', why, elements: e });
  }
  for (const s of sheets) if (!issue.sheets.some((x) => x.id === s.id)) rows.push({ id: s.id, number: s.number, title: s.title, rev: '', state: 'added', why: [], elements: { added: [], removed: [], changed: [] } });
  const counts = { same: 0, changed: 0, added: 0, removed: 0 };
  for (const r of rows) counts[r.state]++;
  return { sheets: rows, elements: els, counts };
}

// ------------------------------------------------------------------------------------------------ records
export function nextRef(history, kind, extra = []) {
  const pre = REF_PREFIX[kind] || 'N';
  let n = 0;
  for (const r of [...history.records, ...extra]) { const m = new RegExp('^' + pre + '-(\\d+)$').exec(r.ref || ''); if (m) n = Math.max(n, Number(m[1])); }
  return pre + '-' + String(n + 1).padStart(3, '0');
}
export function putRecord(history, record) {
  const r = cleanRecord(record);
  if (!r) return history;
  const at = history.records.findIndex((x) => x.id === r.id);
  const records = at < 0 ? [...history.records, r].slice(-LIMITS.records) : history.records.map((x, i) => (i === at ? r : x));
  return { ...history, records };
}
export const dropRecord = (history, id) => ({ ...history, records: history.records.filter((r) => r.id !== id) });
/** Records of the history plus a host's own (`extra`: MarkupCraft's records and clouds, already in this shape), filtered. */
export function recordsFor(history, { issue = null, sheet = null, kind = null, extra = [] } = {}) {
  return [...history.records, ...list(extra, LIMITS.records, cleanRecord)].filter((r) => (issue === null || r.issue === issue) && (kind === null || r.kind === kind) && (sheet === null || r.sheets.includes(sheet)));
}

// ------------------------------------------------------------------------------------------------ the drawing changelog
const byNumber = (a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }) || a.id.localeCompare(b.id);
export function changelog(history, { records = [] } = {}) {
  const all = recordsFor(history, { extra: records });
  const code = new Map(history.issues.map((i) => [i.id, i.code]));
  const issues = history.issues.map((i) => {
    const n = { first: 0, revised: 0, unchanged: 0 };
    for (const s of i.sheets) n[s.state]++;
    return { id: i.id, code: i.code, date: i.date, purpose: i.purpose, name: i.name, by: i.by, note: i.note, stage: i.stage, app: i.app, sheets: i.sheets.length, ...n, records: all.filter((r) => r.issue === i.id).length };
  });
  const sheets = new Map();
  history.issues.forEach((i, k) => {
    for (const s of i.sheets) {
      let row = sheets.get(s.id);
      if (!row) sheets.set(s.id, (row = { id: s.id, number: s.number, title: s.title, revs: history.issues.map(() => null), current: '' }));
      row.number = s.number; row.title = s.title; row.current = s.rev;
      row.revs[k] = { issue: i.id, code: i.code, rev: s.rev, state: s.state };
    }
  });
  return { issues, sheets: [...sheets.values()].sort(byNumber), records: all.map((r) => ({ ...r, issueCode: code.get(r.issue) || '' })) };
}
const W = (words, k, d) => (words && words[k]) || d;
/** The changelog as one table: a row per sheet, a column per issue holding the sheet's revision there ("B" revised, "(A)" unchanged, "" not in it). */
export function changelogTable(history, words = {}, opts = {}) {
  const L = changelog(history, opts);
  const head = [W(words, 'sheet', 'Sheet'), W(words, 'title', 'Title'), ...L.issues.map((i) => i.code + (i.date ? ' ' + i.date : '')), W(words, 'current', 'Current revision')];   // i18n-ignore: defaults; hosts pass their words
  const rows = L.sheets.map((s) => [s.number, s.title, ...s.revs.map((r) => (!r ? '' : r.state === 'unchanged' ? '(' + r.rev + ')' : r.rev)), s.current]);
  return { head, rows, log: L };
}
const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
/** Three blocks in one CSV: the issues, the sheet by issue table, the records. No BOM (the host adds it). */
export function changelogCsv(history, words = {}, opts = {}) {
  const T = changelogTable(history, words, opts), L = T.log, w = (k, d) => W(words, k, d);
  const out = [[w('issue', 'Issue'), w('date', 'Date'), w('purpose', 'Purpose'), w('name', 'Name'), w('by', 'By'), w('sheets', 'Sheets'), w('first', 'First issue'), w('revised', 'Revised'), w('unchanged', 'Unchanged'), w('records', 'Records'), w('note', 'Note')]];   // i18n-ignore: defaults
  for (const i of L.issues) out.push([i.code, i.date, W(words, 'purpose.' + i.purpose, i.purpose), i.name, i.by, i.sheets, i.first, i.revised, i.unchanged, i.records, i.note]);
  out.push([], T.head, ...T.rows);
  if (L.records.length) {
    out.push([], [w('ref', 'Reference'), w('kind', 'Kind'), w('issue', 'Issue'), w('date', 'Date'), w('title', 'Title'), w('status', 'Status'), w('sheets', 'Sheets'), w('rev', 'Revision'), w('by', 'By'), w('link', 'Link or file'), w('note', 'Note')]);   // i18n-ignore: defaults
    for (const r of L.records) out.push([r.ref, W(words, 'kind.' + r.kind, r.kind), r.issueCode, r.date, r.title, W(words, 'status.' + r.status, r.status), r.sheets.join(' '), r.rev, r.by, r.link || r.file?.name || '', r.note]);
  }
  return out.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
const mdCell = (v) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/([\\*_`|#[\]])/g, '\\$1');
const mdRows = (head, rows) => [head, head.map(() => '---'), ...rows].map((r) => '| ' + r.map(mdCell).join(' | ') + ' |').join('\n');
export function changelogMarkdown(history, words = {}, opts = {}) {
  const T = changelogTable(history, words, opts), L = T.log, w = (k, d) => W(words, k, d);
  if (!L.issues.length) return w('none', 'Nothing has been issued yet.');   // i18n-ignore: default
  const parts = [mdRows([w('issue', 'Issue'), w('date', 'Date'), w('purpose', 'Purpose'), w('sheets', 'Sheets'), w('revised', 'Revised'), w('note', 'Note')],   // i18n-ignore: defaults
    L.issues.map((i) => [i.code, i.date, W(words, 'purpose.' + i.purpose, i.purpose), i.sheets, i.revised, [i.name, i.note].filter(Boolean).join(': ')])), mdRows(T.head, T.rows)];
  if (L.records.length) parts.push(mdRows([w('ref', 'Reference'), w('kind', 'Kind'), w('issue', 'Issue'), w('date', 'Date'), w('title', 'Title'), w('status', 'Status')],   // i18n-ignore: defaults
    L.records.map((r) => [r.ref, W(words, 'kind.' + r.kind, r.kind), r.issueCode, r.date, r.title, W(words, 'status.' + r.status, r.status)])));
  return parts.join('\n\n');
}

// ------------------------------------------------------------------------------------------------ exchange between apps
/** The file other apps read (`<name>.issues.json`). prints: { issueId: packed text } when the host wants them to travel. */
export function historyJson(history, { prints = null } = {}) {
  const h = cleanHistory(history);
  return JSON.stringify({ ...h, ...(prints && Object.keys(prints).length ? { prints } : {}) }, null, 1);
}
export function readHistoryJson(text) {
  let raw;
  if (typeof text === 'string' && text.length > 64 * 1024 * 1024) return { ok: false, why: 'size' };
  try { raw = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { return { ok: false, why: 'json' }; }
  if (!raw || raw.format !== FORMAT) return { ok: false, why: 'format' };
  if (Number(raw.version) > VERSION) return { ok: false, why: 'newer' };
  const prints = {};
  if (raw.prints && typeof raw.prints === 'object') for (const [k, v] of Object.entries(raw.prints)) if (idOk(k) && typeof v === 'string') prints[k] = v;
  return { ok: true, history: cleanHistory(raw), prints };
}
/** Two copies of a history made one: issues by id (a's order, then b's new ones by date), records by id (the newer `at` wins). */
export function mergeHistory(a, b) {
  const A = cleanHistory(a), B = cleanHistory(b);
  const have = new Set(A.issues.map((i) => i.id));
  const fresh = B.issues.filter((i) => !have.has(i.id));
  const issues = [...A.issues, ...fresh];
  if (fresh.length) issues.sort((x, y) => (x.date && y.date && x.date !== y.date ? x.date.localeCompare(y.date) : 0));
  const recs = new Map(A.records.map((r) => [r.id, r]));
  for (const r of B.records) { const m = recs.get(r.id); if (!m || String(r.at) > String(m.at)) recs.set(r.id, r); }
  return { ...A, issues, records: [...recs.values()], added: { issues: fresh.length, records: B.records.filter((r) => !A.records.some((x) => x.id === r.id)).length } };
}
/**
 * A per-sheet issue log ([{ sheet, number, rev, date, note, hash }], DetailCraft's) as issues: entries of one date and note are one
 * issue, coded by the highest revision in it. Titles come from `titles` (Map sheet id → title) when given.
 */
export function fromSheetIssues(entries, { app = '', purpose = 'construction', titles = null } = {}) {
  let h = emptyHistory();
  const groups = new Map();
  for (const e of entries || []) { const k = String(e.date || '') + '|' + String(e.note || ''); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
  const seen = new Set();
  for (const [k, g] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
    const code = g.map((e) => String(e.rev || '')).sort((a, b) => a.length - b.length || a.localeCompare(b)).pop() || 'A';
    const sheets = g.map((e) => { const id = idOk(String(e.sheet).replace(/[^A-Za-z0-9._:$-]/g, '_')); const first = !seen.has(id); seen.add(id); return { id, number: e.number, title: titles?.get(e.sheet) || '', rev: e.rev, hash: String(e.hash ?? ''), state: first ? 'first' : 'revised', scope: null }; }).filter((s) => s.id);
    h = addIssue(h, { id: 'i' + textPrint(app + '|' + k), code, purpose, name: '', date: g[0].date, by: '', note: g[0].note, app, sheets });
  }
  return h;
}
