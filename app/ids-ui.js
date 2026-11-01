/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ids-ui.js — Check against IDS… (0.7.1 71.25; map docs/apps/ids.md), in the Export › IFC dialog ([data-ifc-ids]): the client's .ids
 * file (buildingSMART Information Delivery Specification) checked against the IFC this project exports — the same file Export › IFC
 * writes (ifc-civil-model.js + ifc-civil.js, in the schema picked there), read back by cc-ifc — with cc-ids (./ids/, lib/ids synced).
 * The IDS is remembered in the project file (state.ids, one undo step); every failure is a Problem (source civilcraft.ids, kind
 * check, warning) about the exported element by GlobalId, re-checked a moment after every change; the check report lists the IDS
 * and each specification. The writer's GlobalIds come from the project name and object ids (tags), so a click finds the alignment,
 * pad, pipe, structure or mass an element came from (refOf).
 *
 *   mountIds({ root, el, t, say, ifc() → Promise<{ file: IfcFile, tags }>, readRecord(), writeRecord(rec | null), refocus }) →
 *     { open(), changed(), refOf(guid) → { kind, tag } | null }
 */
import { cleanIdsRecord } from './ids/record.js';   // tiny; the checker (./ids/session.js and cc-ifc's schemas) loads only with an IDS

export function mountIds({ root, el, t, say = () => {}, ifc, readRecord, writeRecord, refocus = () => {} }) {
  let session = null, src = null, dlg = null, busy = false, last = '', tags = {};
  const ready = async () => session || (session = (await import('./ids/session.js')).idsSession({ t, setKey: 'ids', ifc: async () => { const r = await ifc(); tags = r?.tags || {}; return r?.file || null; } }));
  const input = el('input', { type: 'file', accept: '.ids,.xml,application/xml,text/xml', hidden: true, 'data-ids-input': '' });
  input.addEventListener('change', () => { const f = input.files?.[0]; input.value = ''; loadFile(f); });
  root.append(input);

  function body() {
    const v = session ? session.view() : null;
    const rows = [el('p', { className: 'cv-note' }, t('ids.intro', { what: t('ids.what.export') }))];
    if (!v) rows.push(el('p', { 'data-ids-none': '' }, t('ids.none')));
    else {
      rows.push(el('h3', { className: 'cv-h', 'data-ids-title': '' }, v.title));
      if (v.meta.length) rows.push(el('p', { className: 'cv-note' }, v.meta.join(', ')));
      rows.push(el('p', { className: 'cv-note' }, t('ids.remembered', { where: t('ids.where.project') })));
      for (const w of [v.changed, v.error && t('ids.err.read', { msg: v.error }), v.ifcError && t('ids.err.ifc', { msg: v.ifcError })]) if (w) rows.push(el('p', { className: 'cv-note', role: 'alert' }, w));
      if (v.issues.length) rows.push(el('details', {}, el('summary', { className: 'cv-note' }, t('ids.issues', { n: v.issues.length })), el('ul', {}, v.issues.slice(0, 50).map((x) => el('li', { className: 'cv-note' }, x)))));
      if (v.sum) rows.push(el('p', { 'data-ids-sum': '' }, v.sum));
      if (v.specs.length) rows.push(el('ul', { className: 'cv-ids-specs', 'data-ids-specs': '' }, v.specs.map((s) => el('li', { 'data-ids-spec': s.status },
        el('strong', {}, t('ids.spec.' + s.status)), ' ', s.name, el('br'), el('span', { className: 'cv-note' }, s.line + (s.mismatch ? ' ' + s.mismatch : ''))))));
    }
    return rows;
  }
  function render() {
    if (!dlg) return;
    const v = session?.state.record;
    dlg.querySelector('[data-ids-body]').replaceChildren(...body());
    dlg.querySelector('[data-ids-foot]').replaceChildren(
      el('button', { type: 'button', className: (v ? 'btn-line' : 'btn-plot') + ' btn-sm-cc', 'data-ids-load': '', onclick: () => input.click() }, v ? t('ids.load.other') : t('ids.load')),
      v ? el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ids-run': '', disabled: busy, onclick: () => recheck() }, busy ? t('ids.running') : t('ids.run')) : null,
      v && window.ccProblems ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => { dlg.close(); window.ccProblems.open({}); } }, t('ids.show.problems')) : null,
      v ? el('button', { type: 'button', className: 'cv-linkbtn', 'data-ids-forget': '', onclick: () => forget() }, t('ids.forget')) : null,
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('ids.close')));
  }
  function open() {
    if (dlg) return;
    dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-ids-h', 'data-ids-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ids-h' }, t('ids.title'))),
        el('div', { className: 'cv-dlg-body', 'data-ids-body': '' }),
        el('div', { className: 'cv-dlg-foot', 'data-ids-foot': '' })));
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; refocus(); });
    root.append(dlg);
    render();
    dlg.showModal();
    dlg.querySelector('[data-ids-load], [data-ids-run]')?.focus();
  }

  async function recheck() {
    busy = true; render();
    try {
      await ready();
      if (src) await src.recheck(); else await session.run();
      const r = session.state.result;
      if (r) say(t('ids.done', { title: session.state.ids?.info?.title || session.state.record?.name || '', pass: r.counts.pass, n: r.counts.specs }));
    } finally { busy = false; render(); }
  }
  async function loadFile(f) {
    if (!f) return;
    try { await ready(); session.load(await f.text(), f.name); } catch (e) { say(t('ids.err.read', { msg: String(e?.message || e) })); render(); return; }
    last = session.state.record.hash;
    writeRecord(session.state.record);   // one undo step; the project's change hook calls changed()
    await recheck();
  }
  function forget() { session?.clear(); last = ''; writeRecord(null); src?.clear(); render(); }

  const go = () => {
    const P = window.ccProblems;
    if (!P || src) return;
    src = P.source({ id: 'civilcraft.ids', kind: 'check', label: t('ids.source'), run: () => (session ? session.run().then((list) => { render(); return list; }) : []), summary: () => session?.summary() || null, budgetMs: 300 });
    if (session?.state.record) src.invalidate();
  };
  if (document.getElementById('cc-problems')) { if (window.ccProblems) go(); else document.addEventListener('cc-problems-ready', go, { once: true }); }
  // the button in the Export › IFC dialog (ui.inc): the IDS dialog opens over it
  root.querySelector('[data-ifc]')?.addEventListener('click', (e) => { if (e.target.closest('[data-ifc-ids]')) { e.target.closest('dialog').close(); open(); } });

  /** The project changed (an edit, undo, redo, another project): read the remembered IDS again and re-check. */
  async function changed() {
    const rec = cleanIdsRecord(readRecord());
    const h = rec ? rec.hash || rec.text.length + ':' + rec.text.slice(0, 64) : '';
    if (h !== last) {
      last = h;
      if (rec) await ready();
      if (h !== last) return;
      session?.use(rec);
      if (!rec) src?.clear();
    }
    if (session?.state.record) { if (src) src.invalidate(); else session.run().then(render); }
    render();
  }
  changed();
  /** The project object an exported element came from: the writer's tag ('al|a3', 'el|pad|p2|…') for that GlobalId. */
  const refOf = (guid) => { const tag = tags[guid]; return tag ? { tag: String(tag).replace(/^el\|/, '') } : null; };
  return { open, changed, refOf, session: () => session, recheck };
}
