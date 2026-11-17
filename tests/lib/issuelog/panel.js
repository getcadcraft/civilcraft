/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js: the issue history panel every host shows (0.10 BK.46, BK.48; session bk-r3-stages-10). Plain DOM, no app imports: the
 * host hands over its words, its history and what it can do. One panel, so an issue, a site instruction or a shop drawing reads
 * and is recorded the same way in BimCraft, MarkupCraft, TakeoffCraft, DetailCraft and SuperCad Studio.
 *
 *   mountIssuePanel(root, host) → { render(), state, changes(issueId) }
 *   host = {
 *     t(key, vars)                      words from the host's language file (keys issues.*, lib/issuelog/lang/en.json)
 *     app                               the host's name, stamped on what it records
 *     get() → history                   (history.js shape; the host keeps it in its own file)
 *     set(history, label) → void        one undo step in the host
 *     sheets?() → [{ id, number, title, hash, scope }]   the drawing's sheets now; with issue() it offers "Record an issue"
 *     issue?({ code, purpose, name, date, by, note, sheetIds, snapshot }) → Promise<issue | null>   the host prints the model and stores the issue
 *     changes?(issueId) → changesSince() result | null
 *     records?() → [record]             the host's own records in the shared shape (read only here: MarkupCraft's clouds and field records)
 *     select?(guids) · openSheet?(id) · nameOf?(guid) → text
 *     download(name, text, type) · today() → 'YYYY-MM-DD' · who() → name · stage?() → the project stage word
 *     kinds?                            the record kinds offered (default: all of RECORD_KINDS but 'cloud')
 *     openRecord?(record)               shows what a record points at (its `target`: a markup, a linked model)
 *     actions?() → [{ id, label, run() → text | void }]   the host's own buttons beside Add a record (MarkupCraft: record the selected markups)
 *     cls? { button, input, table, muted, note }   class names (the host's own look)
 *   }
 */
import { PURPOSES, RECORD_KINDS, RECORD_STATES, nextCode, nextRef, putRecord, dropRecord, removeIssue, changelog, changelogTable, changelogCsv, historyJson, readHistoryJson, mergeHistory, cleanHistory, textPrint } from './history.js';

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') n.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'selected' || k === 'open') n[k] = !!v;
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
export async function fileRecord(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let sha256 = '';
  try { sha256 = [...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join(''); } catch (e) { sha256 = ''; }
  return { name: file.name, bytes: bytes.length, sha256 };
}

/** The panel's own layout (sizes follow the host's text; colours are the host's): one style element for the page. */
const CSS = `.il-panel{font-size:.85rem}.il-panel h4{font-size:.9rem;font-weight:600;margin:.9rem 0 .3rem}.il-panel p{margin:.25rem 0 .5rem}
.il-row{display:flex;flex-wrap:wrap;gap:.35rem;margin:.4rem 0}.il-form{display:grid;gap:.35rem;margin:.5rem 0;padding:.5rem;border:1px solid currentColor;border-radius:.25rem}
.il-field{display:grid;gap:.1rem}.il-field>span{font-size:.75rem;opacity:.8}.il-field input,.il-field select,.il-field textarea{width:100%}
.il-sheets{border:0;padding:0;margin:0;display:grid;gap:.15rem}.il-sheets legend{font-size:.75rem;opacity:.8;float:none;margin:0}.il-check{display:block}
.il-panel table{width:100%;border-collapse:collapse;font-size:.78rem}.il-panel th,.il-panel td{padding:.2rem .3rem;border-bottom:1px solid rgba(128,128,128,.35);text-align:left;vertical-align:top}
.il-scroll{overflow-x:auto}.il-link{background:none;border:0;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit}
.il-err{color:#b3261e}.il-import{cursor:pointer}.il-changes{margin:.5rem 0;padding:.5rem;border:1px dashed currentColor;border-radius:.25rem}`;
function style() {
  if (typeof document === 'undefined' || document.getElementById('cc-issuelog-style')) return;
  const s = document.createElement('style'); s.id = 'cc-issuelog-style'; s.textContent = CSS; document.head.append(s);
}

export function mountIssuePanel(root, host) {
  style();
  const t = (k, v) => host.t(k, v);   // full keys (issues.*), so each host's language check finds them
  const C = { button: 'btn btn-sm btn-outline-secondary', input: 'form-control form-control-sm', table: 'table table-sm', muted: 'text-muted', note: 'small', ...(host.cls || {}) };
  const kinds = host.kinds || RECORD_KINDS.filter((k) => k !== 'cloud');
  const S = { form: false, recForm: false, edit: null, changes: null, changesOf: '', busy: false, msg: '', err: false, pick: null, snapshot: true };
  const H = () => cleanHistory(host.get());
  const say = (text, err = false) => { S.msg = text; S.err = err; };
  const btn = (label, attr, fn, extra = {}) => el('button', { type: 'button', className: C.button, [attr]: true, onClick: fn, ...extra }, label);
  const field = (label, control) => el('label', { className: 'il-field' }, el('span', {}, label), control);
  const input = (attr, value, type = 'text', more = {}) => el('input', { type, className: C.input, [attr]: true, value: value ?? '', ...more });
  const select = (attr, options, value) => el('select', { className: C.input, [attr]: true }, options.map(([v, label]) => el('option', { value: v, selected: v === value }, label)));
  const q = (sel) => root.querySelector(sel);

  async function doIssue() {
    if (S.busy) return;
    const sheetIds = [...root.querySelectorAll('[data-il-sheet]')].filter((c) => c.checked).map((c) => c.value);
    if (!sheetIds.length) { say(t('issues.err.nosheets'), true); render(); return; }
    const spec = { code: q('[data-il-code]').value.trim(), purpose: q('[data-il-purpose]').value, name: q('[data-il-name]').value.trim(), date: q('[data-il-date]').value, by: q('[data-il-by]').value.trim(), note: q('[data-il-note]').value.trim(), sheetIds, snapshot: !!q('[data-il-snapshot]')?.checked };
    if (H().issues.some((i) => i.code === spec.code)) { say(t('issues.err.code', { code: spec.code }), true); render(); return; }
    S.busy = true; say(t('issues.working')); render();
    try {
      const issue = await host.issue(spec);
      S.busy = false;
      if (issue) { S.form = false; say(t('issues.issued', { code: issue.code, n: issue.sheets.length, revised: issue.sheets.filter((s) => s.state === 'revised').length })); }
    } catch (e) { S.busy = false; say(t('issues.err.failed', { why: e?.message || String(e) }), true); }
    render();
  }
  function showChanges(id) {
    let res = null;
    try { res = host.changes(id); } catch (e) { res = null; }
    S.changes = res; S.changesOf = res ? id : '';
    if (!res) say(t('issues.err.nochanges'), true);
    else { const n = res.counts; say(t('issues.changes.sum', { changed: n.changed, added: n.added, removed: n.removed, same: n.same })); }
    render();
    return res;
  }
  async function saveRecord() {
    const h = H(), old = S.edit ? h.records.find((r) => r.id === S.edit) : null;
    const kind = q('[data-il-rkind]').value;
    const title = q('[data-il-rtitle]').value.trim();
    if (!title) { say(t('issues.err.title'), true); render(); return; }
    const f = q('[data-il-rfile]')?.files?.[0];
    const file = f ? await fileRecord(f) : old?.file || null;
    const rec = {
      id: old?.id || 'r' + textPrint(kind + '|' + title + '|' + Date.now() + '|' + h.records.length), kind, issue: q('[data-il-rissue]').value, ref: q('[data-il-rref]').value.trim() || nextRef(h, kind, host.records?.() || []),
      title, date: q('[data-il-rdate]').value, by: q('[data-il-rby]').value.trim(), note: q('[data-il-rnote]').value.trim(), status: q('[data-il-rstatus]').value,
      sheets: q('[data-il-rsheets]').value.split(/[\s,;]+/).filter(Boolean), rev: q('[data-il-rrev]').value.trim(), link: q('[data-il-rlink]').value.trim(), file,
      elements: old?.elements || (S.pick || []), app: old?.app || host.app || '', target: old?.target || '', at: new Date().toISOString(),
    };
    host.set(putRecord(h, rec), (old ? t('issues.undo.record.edit', { ref: rec.ref }) : t('issues.undo.record.add', { ref: rec.ref })));
    S.recForm = false; S.edit = null; S.pick = null;
    say(t('issues.record.saved', { ref: rec.ref }));
    render();
  }
  function importFile(file) {
    file.text().then((text) => {
      const r = readHistoryJson(text);
      if (!r.ok) { say(t('issues.err.import.' + r.why), true); render(); return; }
      const m = mergeHistory(H(), r.history);
      const added = m.added; delete m.added;
      if (host.keepPrints) for (const [id, p] of Object.entries(r.prints || {})) host.keepPrints(id, p);
      host.set(m, t('issues.undo.import'));
      say(t('issues.imported', { issues: added.issues, records: added.records }));
      render();
    });
  }

  function issueForm(h) {
    const sheets = host.sheets();
    const last = h.issues[h.issues.length - 1];
    return el('div', { className: 'il-form', 'data-il-form': true },
      field(t('issues.f.code'), input('data-il-code', nextCode(h), 'text', { maxlength: 12 })),
      field(t('issues.f.purpose'), select('data-il-purpose', PURPOSES.map((p) => [p, t('issues.purpose.' + p)]), S.purpose || last?.purpose || 'information')),
      field(t('issues.f.name'), input('data-il-name', '', 'text', { maxlength: 160, placeholder: t('issues.f.name.ph') })),
      field(t('issues.f.date'), input('data-il-date', host.today(), 'date')),
      field(t('issues.f.by'), input('data-il-by', host.who?.() || '', 'text', { maxlength: 120 })),
      field(t('issues.f.note'), el('textarea', { className: C.input, rows: 2, 'data-il-note': true, maxlength: 2000 })),
      el('fieldset', { className: 'il-sheets' }, el('legend', {}, t('issues.f.sheets')),
        sheets.length ? sheets.map((s) => {
          const lastOf = [...h.issues].reverse().map((i) => i.sheets.find((x) => x.id === s.id)).find(Boolean);
          const state = !lastOf ? 'first' : lastOf.hash !== s.hash ? 'revised' : 'unchanged';
          return el('label', { className: 'il-check' }, el('input', { type: 'checkbox', 'data-il-sheet': true, value: s.id, checked: S.preset ? S.preset.includes(s.id) : true }), ' ', s.number + (s.title ? ' ' + s.title : ''), ' ',
            el('span', { className: C.muted, 'data-il-sheetstate': state }, t('issues.sheet.' + state, { rev: lastOf?.rev || '' })));
        }) : el('p', { className: C.muted, 'data-il-nosheets': true }, t('issues.nosheets'))),
      host.canSnapshot ? el('label', { className: 'il-check' }, el('input', { type: 'checkbox', 'data-il-snapshot': true, checked: S.snapshot, onChange: (e) => { S.snapshot = e.target.checked; } }), ' ', t('issues.f.snapshot')) : null,
      el('p', { className: C.muted + ' ' + C.note }, t('issues.f.help')),
      el('div', { className: 'il-row' }, btn(t('issues.btn.issue.go'), 'data-il-issue-go', doIssue, { disabled: S.busy || !sheets.length }), ' ', btn(t('issues.btn.cancel'), 'data-il-cancel', () => { S.form = false; render(); })));
  }
  function changesBox(h) {
    const res = S.changes, issue = h.issues.find((i) => i.id === S.changesOf);
    if (!res || !issue) return null;
    const count = (label, ids, attr) => (ids.length ? el('button', { type: 'button', className: 'il-link', [attr]: true, onClick: () => host.select?.(ids) }, label + ' ' + ids.length) : null);
    const e = res.elements;
    return el('div', { className: 'il-changes', 'data-il-changes': issue.id },
      el('h4', {}, t('issues.changes.title', { code: issue.code, date: issue.date })),
      e ? el('p', { 'data-il-els': true }, t('issues.changes.els', { added: e.added.length, removed: e.removed.length, changed: e.changed.length, same: e.same }), ' ',
        count(t('issues.changes.added'), e.added, 'data-il-sel-added'), ' ', count(t('issues.changes.changed'), e.changed.map((c) => c.guid), 'data-il-sel-changed'))
        : el('p', { className: C.muted, 'data-il-noprints': true }, t('issues.changes.noprints')),
      el('table', { className: C.table, 'data-il-changes-table': true },
        el('thead', {}, el('tr', {}, [t('issues.h.sheet'), t('issues.h.title'), t('issues.h.rev'), t('issues.h.state'), t('issues.h.elements')].map((x) => el('th', {}, x)))),
        el('tbody', {}, res.sheets.map((s) => el('tr', { 'data-il-ch-sheet': s.id, 'data-il-ch-state': s.state },
          el('td', {}, host.openSheet ? el('button', { type: 'button', className: 'il-link', onClick: () => host.openSheet(s.id) }, s.number || s.id) : s.number || s.id),
          el('td', {}, s.title), el('td', {}, s.rev),
          el('td', {}, t('issues.state.' + s.state) + (s.why.length ? ' (' + s.why.map((w) => t('issues.why.' + w)).join(', ') + ')' : '')),
          el('td', {}, count(t('issues.changes.added'), s.elements.added, 'data-il-ch-added'), ' ', count(t('issues.changes.changed'), s.elements.changed, 'data-il-ch-changed'), ' ',
            s.elements.removed.length ? el('span', { 'data-il-ch-removed': true }, t('issues.changes.removed') + ' ' + s.elements.removed.length) : null))))),
      e && e.removed.length ? el('p', { className: C.muted + ' ' + C.note }, t('issues.changes.removed.note', { n: e.removed.length })) : null,
      btn(t('issues.btn.close'), 'data-il-changes-close', () => { S.changes = null; S.changesOf = ''; render(); }));
  }
  function recordForm(h) {
    const old = S.edit ? h.records.find((r) => r.id === S.edit) : null;
    const kind = old?.kind || S.recKind || kinds[0];
    const lastIssue = h.issues[h.issues.length - 1];
    return el('div', { className: 'il-form', 'data-il-rform': true },
      field(t('issues.r.kind'), (() => { const s = select('data-il-rkind', kinds.map((k) => [k, t('issues.kind.' + k)]), kind); s.addEventListener('change', () => { S.recKind = s.value; const r = q('[data-il-rref]'); if (r && !old) r.value = nextRef(h, s.value, host.records?.() || []); }); return s; })()),
      field(t('issues.r.issue'), select('data-il-rissue', [['', t('issues.r.noissue')], ...h.issues.map((i) => [i.id, i.code + (i.date ? ' ' + i.date : '') + (i.name ? ' ' + i.name : '')])], old ? old.issue : lastIssue?.id || '')),
      field(t('issues.r.ref'), input('data-il-rref', old?.ref || nextRef(h, kind, host.records?.() || []), 'text', { maxlength: 40 })),
      field(t('issues.r.title'), input('data-il-rtitle', old?.title || '', 'text', { maxlength: 200 })),
      field(t('issues.r.date'), input('data-il-rdate', old?.date || host.today(), 'date')),
      field(t('issues.r.by'), input('data-il-rby', old?.by || '', 'text', { maxlength: 120, placeholder: t('issues.r.by.ph') })),
      field(t('issues.r.status'), select('data-il-rstatus', RECORD_STATES.map((s) => [s, t('issues.status.' + s)]), old?.status || 'open')),
      field(t('issues.r.sheets'), input('data-il-rsheets', (old?.sheets || []).join(' '), 'text', { placeholder: t('issues.r.sheets.ph') })),
      field(t('issues.r.rev'), input('data-il-rrev', old?.rev || '', 'text', { maxlength: 12 })),
      field(t('issues.r.link'), input('data-il-rlink', old?.link || '', 'text', { maxlength: 500, placeholder: t('issues.r.link.ph') })),
      field(t('issues.r.file'), el('span', {}, el('input', { type: 'file', className: C.input, 'data-il-rfile': true }), old?.file ? el('span', { className: C.muted }, ' ' + t('issues.r.file.has', { name: old.file.name })) : null)),
      field(t('issues.r.note'), el('textarea', { className: C.input, rows: 2, 'data-il-rnote': true, maxlength: 2000 }, old?.note || '')),
      host.selection ? el('p', { className: C.muted + ' ' + C.note, 'data-il-rpick': true }, t('issues.r.elements', { n: (old?.elements || S.pick || []).length }), ' ', btn(t('issues.r.elements.take'), 'data-il-rtake', () => { S.pick = host.selection(); const p = q('[data-il-rpick]'); if (p) p.firstChild.textContent = t('issues.r.elements', { n: S.pick.length }); })) : null,
      el('p', { className: C.muted + ' ' + C.note }, t('issues.r.help')),
      el('div', { className: 'il-row' }, btn(t('issues.btn.record.save'), 'data-il-rsave', saveRecord), ' ', btn(t('issues.btn.cancel'), 'data-il-rcancel', () => { S.recForm = false; S.edit = null; S.pick = null; render(); })));
  }

  function render() {
    const h = H(), own = host.records?.() || [];
    const L = changelog(h, { records: own });
    const canIssue = !!(host.issue && host.sheets);
    const T = changelogTable(h, { sheet: t('issues.h.sheet'), title: t('issues.h.title'), current: t('issues.h.current') }, { records: own });
    const ownIds = new Set(h.records.map((r) => r.id));
    root.replaceChildren(el('div', { className: 'il-panel', 'data-il': true },
      el('p', { className: C.muted }, t('issues.intro')),
      S.msg ? el('p', { className: S.err ? 'il-err' : 'il-ok', role: 'status', 'data-il-msg': S.err ? 'error' : 'ok' }, S.msg) : null,
      el('div', { className: 'il-row' },
        canIssue ? btn(t('issues.btn.issue'), 'data-il-issue', () => { S.form = !S.form; S.preset = host.preset?.() || null; S.purpose = host.presetPurpose?.() || ''; render(); }) : null, ' ',
        btn(t('issues.btn.record'), 'data-il-record', () => { S.recForm = !S.recForm; S.edit = null; render(); }), ' ',
        (host.actions?.() || []).map((x) => [btn(x.label, 'data-il-action', () => { const said = x.run(); if (said) say(said.text || said, !!said.error); render(); }, { 'data-il-action-id': x.id }), ' ']),
        btn(t('issues.btn.export'), 'data-il-export', () => host.download(host.fileBase?.() ? host.fileBase() + '.issues.json' : 'issues.json', historyJson(h, { prints: host.allPrints?.() || null }), 'application/json'), { disabled: !h.issues.length && !h.records.length }), ' ',
        el('label', { className: C.button + ' il-import' }, t('issues.btn.import'), el('input', { type: 'file', accept: '.json,application/json', hidden: true, 'data-il-import': true, onChange: (e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = ''; } }))),
      S.form && canIssue ? issueForm(h) : null,
      S.recForm ? recordForm(h) : null,
      el('h4', {}, t('issues.h.issues')),
      L.issues.length ? el('div', { className: 'il-scroll' }, el('table', { className: C.table, 'data-il-issues': true },
        el('thead', {}, el('tr', {}, [t('issues.h.issue'), t('issues.h.date'), t('issues.h.purpose'), t('issues.h.name'), t('issues.h.sheets'), t('issues.h.records'), ''].map((x) => el('th', {}, x)))),
        el('tbody', {}, L.issues.map((i) => el('tr', { 'data-il-issue-row': i.id },
          el('td', {}, i.code), el('td', {}, i.date), el('td', {}, t('issues.purpose.' + i.purpose)), el('td', {}, [i.name, i.by].filter(Boolean).join(', ')),
          el('td', { 'data-il-issue-sheets': true }, t('issues.issue.sheets', { n: i.sheets, first: i.first, revised: i.revised, unchanged: i.unchanged })),
          el('td', {}, String(i.records)),
          el('td', {}, host.changes ? btn(t('issues.btn.changes'), 'data-il-changes-btn', () => showChanges(i.id)) : null, ' ',
            btn(t('issues.btn.remove'), 'data-il-issue-remove', () => { if (globalThis.confirm && !globalThis.confirm(t('issues.confirm.remove', { code: i.code }))) return; host.dropPrints?.(i.id); host.set(removeIssue(h, i.id), t('issues.undo.issue.remove', { code: i.code })); say(t('issues.removed', { code: i.code })); render(); })))))))
        : el('p', { className: C.muted, 'data-il-none': true }, t('issues.none')),
      changesBox(h),
      el('h4', {}, t('issues.h.records.title')),
      L.records.length ? el('div', { className: 'il-scroll' }, el('table', { className: C.table, 'data-il-records': true },
        el('thead', {}, el('tr', {}, [t('issues.h.ref'), t('issues.h.kind'), t('issues.h.issue'), t('issues.h.date'), t('issues.h.title'), t('issues.h.status'), ''].map((x) => el('th', {}, x)))),
        el('tbody', {}, L.records.map((r) => el('tr', { 'data-il-record-row': r.id, 'data-il-record-kind': r.kind },
          el('td', {}, r.ref), el('td', {}, t('issues.kind.' + r.kind)), el('td', {}, r.issueCode), el('td', {}, r.date),
          el('td', {}, r.title, r.sheets.length ? el('span', { className: C.muted }, ' ' + r.sheets.join(' ') + (r.rev ? ' ' + t('issues.rev', { rev: r.rev }) : '')) : null,
            r.link ? [' ', /^https?:\/\//.test(r.link) ? el('a', { href: r.link, target: '_blank', rel: 'noopener noreferrer' }, t('issues.r.open')) : el('span', { className: C.muted }, r.link)] : null,   // i18n-ignore: a link attribute
            r.file ? el('span', { className: C.muted, 'data-il-record-file': true }, ' ' + r.file.name) : null,
            r.target && host.openRecord ? [' ', el('button', { type: 'button', className: 'il-link', 'data-il-record-show': true, onClick: () => host.openRecord(r) }, t('issues.r.show'))] : null,
            r.elements.length && host.select ? [' ', el('button', { type: 'button', className: 'il-link', 'data-il-record-els': true, onClick: () => host.select(r.elements) }, t('issues.r.elements', { n: r.elements.length }))] : null),
          el('td', {}, t('issues.status.' + r.status)),
          el('td', {}, ownIds.has(r.id) ? [btn(t('issues.btn.edit'), 'data-il-record-edit', () => { S.edit = r.id; S.recForm = true; render(); }), ' ',
            btn(t('issues.btn.remove'), 'data-il-record-remove', () => { host.set(dropRecord(h, r.id), t('issues.undo.record.remove', { ref: r.ref })); render(); })] : el('span', { className: C.muted }, t('issues.r.fromapp'))))))))
        : el('p', { className: C.muted, 'data-il-norecords': true }, t('issues.norecords')),
      el('h4', {}, t('issues.h.changelog')),
      L.issues.length ? [el('div', { className: 'il-scroll' }, el('table', { className: C.table, 'data-il-log': true },
        el('thead', {}, el('tr', {}, T.head.map((x) => el('th', {}, x)))),
        el('tbody', {}, T.rows.map((r, k) => el('tr', { 'data-il-log-sheet': L.sheets[k].id }, r.map((c) => el('td', {}, c))))))),
      el('p', { className: C.muted + ' ' + C.note }, t('issues.log.help')),
      btn(t('issues.btn.csv'), 'data-il-csv', () => host.download((host.fileBase?.() || 'drawing') + '-changelog.csv', String.fromCharCode(0xfeff) + changelogCsv(h, words(), { records: own }), 'text/csv'))]
        : el('p', { className: C.muted }, t('issues.log.none'))));
  }
  function words() {
    const w = { sheet: t('issues.h.sheet'), title: t('issues.h.title'), current: t('issues.h.current'), issue: t('issues.h.issue'), date: t('issues.h.date'), purpose: t('issues.h.purpose'), name: t('issues.h.name'), by: t('issues.f.by'), sheets: t('issues.h.sheets'), first: t('issues.w.first'), revised: t('issues.w.revised'), unchanged: t('issues.w.unchanged'), records: t('issues.h.records'), note: t('issues.f.note'), ref: t('issues.h.ref'), kind: t('issues.h.kind'), status: t('issues.h.status'), rev: t('issues.h.rev'), link: t('issues.r.link'), none: t('issues.none') };
    for (const p of PURPOSES) w['purpose.' + p] = t('issues.purpose.' + p);
    for (const k of RECORD_KINDS) w['kind.' + k] = t('issues.kind.' + k);
    for (const s of RECORD_STATES) w['status.' + s] = t('issues.status.' + s);
    return w;
  }
  render();
  return { render, state: S, changes: showChanges, words, openIssueForm: (preset, purpose) => { S.form = true; S.preset = preset || null; S.purpose = purpose || ''; render(); } };
}
