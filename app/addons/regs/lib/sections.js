/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sections.js — the optional local-requirement sections of a regulation pack (booklet rows BK.67, BK.156, BK.157; session bk-r3-regs).
 * ONE pack format: `cadcraft-regulation-pack` v1 stays as it was; a pack MAY also carry any of these four sections, so an approval
 * process, a submission format, drawing conventions and standard notes are data by jurisdiction like the rules are. DOM-free and
 * import-free (regs.js imports it; tools/regs/sync.mjs copies it byte-identically into the other apps). PHP twin:
 * LibraryRegulations::cleanSections (bin/test-library-regulations.php runs both on the same documents).
 *
 *   process      { authority, summary, sources[], steps[ { id, title, who, handIn, documents[], detail, clause, source, fee?, time? } ] }
 *                the approval steps of a jurisdiction, in order. `fee` / `time` = { text, source }: a fee or a time frame is accepted ONLY
 *                with the index of a source that has a date it was read (sources[n].fetched): no source, no figure.
 *   submission   { authority, summary, sources[], format{}, drawings[], documents[] }
 *                format = { sheetSizes[] (sheet paper keys: a0…a4, letter, tabloid, archd …), orientation, fileFormats[], singleFile, maxFileMB,
 *                fileNaming, copies { paper, electronic, text }, stampSpace, titleBlock { fields[ { key, label, words[] } ] }, note, source }
 *                drawings[] = the drawings a submission set must hold: { id, title, detail, clause, when 'always' | 'if-applicable',
 *                scale { text, minDenominator?, maxDenominator? }, satisfy[ { view[] } | { schedule[] } | { words[] } ] (what in the model satisfies it), site, source }
 *                documents[] = supporting papers the person supplies: { id, title, detail, clause, when, source }
 *   conventions  { sources[], text[ { id, use, kind?, mm | pt, min, clause, source } ] (text heights on paper), lines[ { id, use, mm, clause, source } ],
 *                penTable { ref, clause, source }, marks[ { id, label, required, clause, rule?, source } ] (north point, scale bar, hatch…;
 *                `rule` names a draw.* rule that checks it), note }
 *   notes        { sources[], items[ { id, region, discipline, title, text, clause, source } ] }  standard / general notes in OUR words (a
 *                standard's text is never copied), placeable on a sheet from the pack
 *
 * Every section is untrusted data (a person's own file, the Library): only known fields, bounded. Honesty lives in the pack's review state and
 * authority; this file adds the one hard rule above (fees and time frames need a dated source).
 *
 *   cleanSections(raw, bad) → { process?, submission?, conventions?, notes? }   `bad(message)` collects the reasons a section is refused
 *   mergeSections(chain) → { process?, submission?, conventions?, notes? }      the packs of a base chain, lower levels winning; every item gets `from`
 *   checklistFromSections(profile) → checklist pack | null                       submission as permit-checklist.js's list shape
 */
export const SECTION_KEYS = ['process', 'submission', 'conventions', 'notes'];
export const DISCIPLINES = ['general', 'architectural', 'structural', 'civil', 'mechanical', 'electrical', 'plumbing', 'fire', 'accessibility', 'energy', 'landscape'];
export const VIEW_KINDS = ['plan', 'rcp', 'callout', 'elevation', 'section', 'schedule'];
export const TEXT_KINDS = ['text', 'dimension', 'tag', 'room', 'grid', 'title', 'schedule'];   // the annotation kinds the office standard (annoscale.js KINDS) sizes
export const SCHEDULE_KINDS = ['doors', 'windows', 'rooms', 'walls'];
export const SECTION_LIMITS = { items: 60, sources: 8, text: 600, detail: 600, title: 120, short: 160 };

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s"<>]*)?$/i;
const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const str = (v, max) => (typeof v === 'string' ? v.replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

/* i18n-ignore-start: the reasons a section is refused are for whoever writes the pack, in English like the format itself */
function cleanSources(raw, at, bad) {
  const out = [];
  for (const s of list(raw, SECTION_LIMITS.sources)) {
    const src = { title: str(s?.title, 300), url: str(s?.url, 400), fetched: str(s?.fetched, 10), licence: str(s?.licence, 400) };
    if (!src.title) bad(at + ': a source has no title');
    if (!HTTPS.test(src.url)) bad(at + ': source "' + src.title.slice(0, 40) + '": url must be an https address');
    if (!DAY.test(src.fetched)) bad(at + ': source "' + src.title.slice(0, 40) + '": fetched must be the date it was read (YYYY-MM-DD)');
    out.push(src);
  }
  return out;
}
/** An item's source index: a whole number that names one of the section's sources (0 when the section has one and the item says nothing). */
function srcIndex(v, sources, at, bad, required) {
  if (v === undefined || v === null) { if (required) bad(at + ': source is missing (the number of one of the section\'s sources)'); return sources.length ? 0 : -1; }
  if (!Number.isInteger(v) || v < 0 || v >= sources.length) { bad(at + ': source ' + String(v).slice(0, 12) + ' is not one of the section\'s sources'); return -1; }
  return v;
}
/** A fee or a time frame: { text, source }, accepted only with a source that carries the date it was read. */
function cleanFigure(v, kind, sources, at, bad) {
  if (v === undefined || v === null) return null;
  if (!isObj(v) || !str(v.text, 160)) { bad(at + ': ' + kind + ' is { text, source }'); return null; }
  if (!Number.isInteger(v.source) || v.source < 0 || v.source >= sources.length || !DAY.test(sources[v.source].fetched)) { bad(at + ': a ' + kind + ' needs the source it was read from, with the date it was read'); return null; }
  return { text: str(v.text, 160), source: v.source };
}
function ids(items, at, bad) {
  const seen = new Set();
  return items.filter((it) => {
    if (!ID.test(it.id)) { bad(at + ': an id is lower-case words joined by dashes: "' + String(it.id).slice(0, 30) + '"'); return false; }
    if (seen.has(it.id)) { bad(at + ': id used twice: ' + it.id); return false; }
    seen.add(it.id);
    return true;
  });
}
const when = (v) => (v === 'if-applicable' ? 'if-applicable' : 'always');

function cleanProcess(raw, bad) {
  const at = 'process';
  if (!isObj(raw)) { bad(at + ' is an object'); return null; }
  const sources = cleanSources(raw.sources, at, bad);
  const steps = [];
  list(raw.steps, SECTION_LIMITS.items).forEach((s, i) => {
    const a = at + ' step ' + (i + 1);
    if (!isObj(s)) { bad(a + ' is not an object'); return; }
    const st = { id: str(s.id, 60), title: str(s.title, SECTION_LIMITS.title), who: str(s.who, 120), handIn: str(s.handIn, 300), documents: list(s.documents, 8).map((d) => str(d, 120)).filter(Boolean),
      detail: str(s.detail, SECTION_LIMITS.detail), clause: str(s.clause, 80), source: srcIndex(s.source, sources, a, bad, false) };
    if (!st.title) bad(a + ': title is missing');
    const fee = cleanFigure(s.fee, 'fee', sources, a, bad), time = cleanFigure(s.time, 'time frame', sources, a, bad);
    if (fee) st.fee = fee;
    if (time) st.time = time;
    steps.push(st);
  });
  if (!steps.length) bad(at + ': no steps');
  return { authority: str(raw.authority, 200), summary: str(raw.summary, 400), sources, steps: ids(steps, at, bad) };
}

function cleanScale(v, at, bad) {
  if (v === undefined || v === null) return null;
  if (!isObj(v) || !str(v.text, 40)) { bad(at + ': scale is { text, minDenominator?, maxDenominator? }'); return null; }
  const s = { text: str(v.text, 40) };
  for (const k of ['minDenominator', 'maxDenominator']) if (v[k] !== undefined && v[k] !== null) { if (!num(v[k]) || v[k] <= 0 || v[k] > 100000) bad(at + ': ' + k + ' is a number above 0'); else s[k] = v[k]; }
  return s;
}
function cleanSatisfy(v, at, bad) {
  const out = [];
  for (const s of list(v, 8)) {
    if (isObj(s) && Array.isArray(s.view)) { const k = s.view.filter((x) => VIEW_KINDS.includes(x)); if (k.length !== s.view.length) bad(at + ': unknown view kind'); if (k.length) out.push({ view: k }); }
    else if (isObj(s) && Array.isArray(s.schedule)) { const k = s.schedule.filter((x) => SCHEDULE_KINDS.includes(x)); if (k.length !== s.schedule.length) bad(at + ': unknown schedule kind'); if (k.length) out.push({ schedule: k }); }
    else if (isObj(s) && Array.isArray(s.words)) { const w = s.words.map((x) => str(x, 40).toLowerCase()).filter(Boolean).slice(0, 12); if (w.length) out.push({ words: w }); }
    else bad(at + ': a satisfy entry has view, schedule or words');
  }
  return out;
}
const SIZE = /^[a-z0-9-]{2,20}$/;
function cleanFormat(f, sources, at, bad) {
  if (!isObj(f)) { bad(at + ' format is an object'); return null; }
  const o = {};
  if (f.sheetSizes !== undefined) o.sheetSizes = list(f.sheetSizes, 12).map((x) => (typeof x === 'string' && SIZE.test(x) ? x : (bad(at + ' format: a sheet size is like a1, a3, letter'), ''))).filter(Boolean);
  if (f.orientation !== undefined) o.orientation = ['landscape', 'portrait', 'either'].includes(f.orientation) ? f.orientation : (bad(at + ' format: orientation is landscape, portrait or either'), 'either');
  if (f.fileFormats !== undefined) o.fileFormats = list(f.fileFormats, 8).map((x) => (typeof x === 'string' && /^[a-z0-9]{2,6}$/.test(x) ? x : (bad(at + ' format: a file format is like pdf, dwg'), ''))).filter(Boolean);
  if (f.singleFile !== undefined) o.singleFile = f.singleFile === true;
  if (f.maxFileMB !== undefined && f.maxFileMB !== null) { if (!num(f.maxFileMB) || f.maxFileMB <= 0 || f.maxFileMB > 10000) bad(at + ' format: maxFileMB is a number above 0'); else o.maxFileMB = f.maxFileMB; }
  if (f.fileNaming !== undefined) o.fileNaming = str(f.fileNaming, 300);
  if (f.copies !== undefined) {
    const c = isObj(f.copies) ? f.copies : {};
    o.copies = { text: str(c.text, 200) };
    for (const k of ['paper', 'electronic']) if (c[k] !== undefined && c[k] !== null) { if (!Number.isInteger(c[k]) || c[k] < 0 || c[k] > 99) bad(at + ' format: copies.' + k + ' is a whole number'); else o.copies[k] = c[k]; }
  }
  if (f.stampSpace !== undefined) o.stampSpace = str(f.stampSpace, 160);
  if (f.titleBlock !== undefined) {
    const tf = [];
    for (const x of list(isObj(f.titleBlock) ? f.titleBlock.fields : null, 20)) {
      const fld = { key: str(x?.key, 30), label: str(x?.label, 60), words: list(x?.words, 8).map((w) => str(w, 30).toLowerCase()).filter(Boolean) };
      if (!/^[a-z][a-z0-9_]*$/.test(fld.key) || !fld.label) bad(at + ' format: a title block field has a key (letters, digits, _) and a label'); else tf.push(fld);
    }
    o.titleBlock = { fields: tf };
  }
  if (f.note !== undefined) o.note = str(f.note, 300);
  o.source = srcIndex(f.source, sources, at + ' format', bad, false);
  return o;
}
function cleanSubmission(raw, bad) {
  const at = 'submission';
  if (!isObj(raw)) { bad(at + ' is an object'); return null; }
  const sources = cleanSources(raw.sources, at, bad);
  const base = (x, a) => ({ id: str(x?.id, 60), title: str(x?.title, SECTION_LIMITS.title), detail: str(x?.detail, SECTION_LIMITS.detail), clause: str(x?.clause, 120), when: when(x?.when), source: srcIndex(x?.source, sources, a, bad, false) });
  const drawings = list(raw.drawings, SECTION_LIMITS.items).map((x, i) => {
    const a = at + ' drawing ' + (i + 1), d = base(x, a);
    if (!d.title) bad(a + ': title is missing');
    const sc = cleanScale(x?.scale, a, bad);
    if (sc) d.scale = sc;
    d.satisfy = cleanSatisfy(x?.satisfy, a, bad);
    if (!d.satisfy.length) bad(a + ': say what satisfies it (satisfy: view, schedule or words)');
    d.site = x?.site === true;
    return d;
  });
  const documents = list(raw.documents, SECTION_LIMITS.items).map((x, i) => {
    const a = at + ' document ' + (i + 1), d = base(x, a);
    if (!d.title) bad(a + ': title is missing');
    return d;
  });
  const out = { authority: str(raw.authority, 200), summary: str(raw.summary, 400), sources };
  if (raw.format !== undefined) { const f = cleanFormat(raw.format, sources, at, bad); if (f) out.format = f; }
  const all = ids([...drawings, ...documents], at, bad);
  out.drawings = all.filter((x) => drawings.includes(x));
  out.documents = all.filter((x) => documents.includes(x));
  if (!out.drawings.length && !out.documents.length && !out.format) bad(at + ': holds no format, drawings or documents');
  return out;
}

function cleanConventions(raw, bad) {
  const at = 'conventions';
  if (!isObj(raw)) { bad(at + ' is an object'); return null; }
  const sources = cleanSources(raw.sources, at, bad);
  const text = list(raw.text, SECTION_LIMITS.items).map((x, i) => {
    const a = at + ' text ' + (i + 1), t = { id: str(x?.id, 60), use: str(x?.use, 60), ...(x?.kind !== undefined && x?.kind !== null ? { kind: TEXT_KINDS.includes(x.kind) ? x.kind : (bad(a + ': kind is one of ' + TEXT_KINDS.join(', ')), '') } : {}), clause: str(x?.clause, 120), min: x?.min === true, source: srcIndex(x?.source, sources, a, bad, false) };
    const hasMm = x?.mm !== undefined && x?.mm !== null, hasPt = x?.pt !== undefined && x?.pt !== null;
    if (hasMm === hasPt) bad(a + ': give the height in mm or the FONT size in pt, one of them (mm is the height of a capital letter on paper)');
    else if (hasMm) { if (!num(x.mm) || x.mm <= 0 || x.mm > 100) bad(a + ': mm is a number above 0'); else t.mm = x.mm; }
    else if (!num(x.pt) || x.pt <= 0 || x.pt > 300) bad(a + ': pt is a number above 0'); else t.pt = x.pt;
    if (!t.use) bad(a + ': use is missing');
    return t;
  });
  const lines = list(raw.lines, SECTION_LIMITS.items).map((x, i) => {
    const a = at + ' line ' + (i + 1), l = { id: str(x?.id, 60), use: str(x?.use, 60), clause: str(x?.clause, 120), source: srcIndex(x?.source, sources, a, bad, false) };
    if (!num(x?.mm) || x.mm <= 0 || x.mm > 20) bad(a + ': mm is a line weight above 0'); else l.mm = x.mm;
    if (!l.use) bad(a + ': use is missing');
    return l;
  });
  const marks = list(raw.marks, SECTION_LIMITS.items).map((x, i) => {
    const a = at + ' mark ' + (i + 1), m = { id: str(x?.id, 60), label: str(x?.label, SECTION_LIMITS.title), required: x?.required === true, clause: str(x?.clause, 120), source: srcIndex(x?.source, sources, a, bad, false) };
    if (!m.label) bad(a + ': label is missing');
    if (x?.rule !== undefined && x?.rule !== null) { if (typeof x.rule === 'string' && /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){1,3}$/.test(x.rule)) m.rule = x.rule; else bad(a + ': rule is a rule id like draw.scale.listed'); }
    return m;
  });
  const out = { sources, text: ids(text, at + ' text', bad), lines: ids(lines, at + ' lines', bad), marks: ids(marks, at + ' marks', bad), note: str(raw.note, 300) };
  if (raw.penTable !== undefined && raw.penTable !== null) {
    const p = isObj(raw.penTable) ? raw.penTable : {};
    if (!str(p.ref, 200)) bad(at + ': penTable.ref is the name of the pen table'); else out.penTable = { ref: str(p.ref, 200), clause: str(p.clause, 120), source: srcIndex(p.source, sources, at + ' penTable', bad, false) };
  }
  if (!out.text.length && !out.lines.length && !out.marks.length && !out.penTable) bad(at + ': holds nothing');
  return out;
}

function cleanNotes(raw, bad) {
  const at = 'notes';
  if (!isObj(raw)) { bad(at + ' is an object'); return null; }
  const sources = cleanSources(raw.sources, at, bad);
  const items = list(raw.items, 200).map((x, i) => {
    const a = at + ' item ' + (i + 1);
    const n = { id: str(x?.id, 60), region: str(x?.region, 40), discipline: DISCIPLINES.includes(x?.discipline) ? x.discipline : (bad(a + ': discipline is one of ' + DISCIPLINES.join(', ')), ''),
      title: str(x?.title, 80), text: str(x?.text, SECTION_LIMITS.text), clause: str(x?.clause, 120), source: srcIndex(x?.source, sources, a, bad, false) };
    if (!n.title) bad(a + ': title is missing');
    if (!n.text) bad(a + ': text is missing');
    return n;
  });
  if (!items.length) bad(at + ': no items');
  return { sources, items: ids(items, at, bad) };
}
/* i18n-ignore-end */

/** The four optional sections of a raw pack, cleaned: a key appears only when the raw pack has it. */
export function cleanSections(raw, bad) {
  const out = {}, fn = { process: cleanProcess, submission: cleanSubmission, conventions: cleanConventions, notes: cleanNotes };
  for (const k of SECTION_KEYS) if (raw && raw[k] !== undefined && raw[k] !== null) { const v = fn[k](raw[k], bad); if (v) out[k] = v; }
  return out;
}

const withSource = (it, sources, from) => ({ ...it, from, src: it.source >= 0 && sources[it.source] ? sources[it.source] : null });
/**
 * A base chain (country → state → county → city) as one set of sections: a lower pack's process replaces the one above (steps are a
 * sequence), the submission format's keys, the drawings, documents, marks, text sizes, lines and notes merge by id with the lower one winning.
 * Items carry `from` (the pack id) and `src` (their source, resolved: an index means nothing once packs are merged).
 */
export function mergeSections(chain) {
  const out = {};
  for (const p of chain) {
    if (p.process) out.process = { ...p.process, from: p.id, steps: p.process.steps.map((s) => ({ ...withSource(s, p.process.sources, p.id), ...(s.fee ? { fee: { ...s.fee, src: p.process.sources[s.fee.source] } } : {}), ...(s.time ? { time: { ...s.time, src: p.process.sources[s.time.source] } } : {}) })) };
    if (p.submission) {
      const s = p.submission, prev = out.submission || { drawings: [], documents: [], format: {}, sources: [] };
      const byId = (a, b) => { const m = new Map(a.map((x) => [x.id, x])); for (const x of b) m.set(x.id, withSource(x, s.sources, p.id)); return [...m.values()]; };
      out.submission = { ...prev, authority: s.authority || prev.authority || '', summary: s.summary || prev.summary || '', from: p.id, sources: [...prev.sources, ...s.sources],
        format: { ...prev.format, ...(s.format ? { ...s.format, src: s.format.source >= 0 ? s.sources[s.format.source] || null : null, from: p.id } : {}) }, drawings: byId(prev.drawings, s.drawings), documents: byId(prev.documents, s.documents) };
    }
    if (p.conventions) {
      const c = p.conventions, prev = out.conventions || { text: [], lines: [], marks: [], sources: [] };
      const byId = (a, b) => { const m = new Map(a.map((x) => [x.id, x])); for (const x of b) m.set(x.id, withSource(x, c.sources, p.id)); return [...m.values()]; };
      out.conventions = { ...prev, from: p.id, sources: [...prev.sources, ...c.sources], note: c.note || prev.note || '', text: byId(prev.text, c.text), lines: byId(prev.lines, c.lines), marks: byId(prev.marks, c.marks),
        ...(c.penTable ? { penTable: withSource(c.penTable, c.sources, p.id) } : prev.penTable ? { penTable: prev.penTable } : {}) };
    }
    if (p.notes) {
      const n = p.notes, prev = out.notes || { items: [], sources: [] }, m = new Map(prev.items.map((x) => [x.id, x]));
      for (const x of n.items) m.set(x.id, withSource(x, n.sources, p.id));
      out.notes = { from: p.id, sources: [...prev.sources, ...n.sources], items: [...m.values()] };
    }
  }
  return out;
}

/** Several profiles' sections side by side is never merged (each pack keeps its own authority): a list helper for the apps. */
export const hasSection = (profile, key) => !!(profile && profile.sections && profile.sections[key]);

/**
 * The submission section as permit-checklist.js's list (the same shape its own files had: items with `satisfy` or `supplied`, sources with
 * `fetched`), so the one checklist engine resolves it against the model's sheets. `review` follows the pack: only a reviewed pack is
 * 'practitioner' (and must say who; the pack's review note stands in); anything else is 'unchecked' and is shown as unverified.
 */
export function checklistFromSections(profile) {
  const s = profile && profile.sections && profile.sections.submission;
  if (!s || (!s.drawings.length && !s.documents.length && !s.format?.sheetSizes && !Object.keys(s.format || {}).length)) return null;
  const sources = (s.sources || []).map((x) => ({ title: x.title, url: x.url, fetched: x.fetched, licence: x.licence || '' }));
  const src = (it) => Math.max(0, sources.findIndex((x) => it.src && x.url === it.src.url && x.fetched === it.src.fetched));
  const items = [
    ...s.drawings.map((d) => ({ id: d.id, title: d.title, detail: [d.detail, d.scale ? 'Scale: ' + d.scale.text + '.' : ''].filter(Boolean).join(' '), clause: d.clause, when: d.when, source: src(d), supplied: false, site: d.site, satisfy: d.satisfy, scale: d.scale || null, kind: 'drawing' })),
    ...s.documents.map((d) => ({ id: d.id, title: d.title, detail: d.detail, clause: d.clause, when: d.when, source: src(d), supplied: true, site: false, satisfy: [], scale: null, kind: 'document' })),
  ];
  return { format: 'cadcraft-submission-checklist', version: 1, id: profile.id, name: profile.name, authority: s.authority || '', submission: s.summary || '',
    jurisdiction: { country: profile.jurisdiction?.country || '', region: profile.jurisdiction?.region || '', name: profile.jurisdiction?.name || '' },
    review: profile.review.state === 'reviewed' ? 'practitioner' : 'unchecked', reviewedBy: profile.review.state === 'reviewed' ? (profile.review.note || 'reviewed') : '', note: profile.review.note || '',
    sources, items, fromPack: true, subFormat: s.format && Object.keys(s.format).length ? s.format : null, process: profile.sections.process || null };
}
