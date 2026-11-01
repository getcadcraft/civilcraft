/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; words come from the app's t. */
/**
 * session.js — one app's IDS check, start to end, without the DOM: the IDS the project remembers, reading it, checking the
 * app's IFC against it, the Problems list and the report summary. BimCraft, CivilCraft and DetailCraft each wrap it in their
 * own dialog and Problems source (`<app>.ids`, kind check, live: re-run after every change).
 *
 *   const s = idsSession({ t, setKey: 'ids', ifc: () => IfcFile | null | Promise, severity })
 *   s.use(record)          record = { name, hash, text } as the project saved it (null = none); reads it, keeps the error
 *   s.load(text, name) → record   a new IDS (throws IdsError when it is not one); the app saves the record in the project
 *   s.clear()
 *   s.run() → Promise<[problem]>   checks the IFC now (the Problems source's run); [] without an IDS or an IFC
 *   s.state → { record, ids, error, result, ifcError, changed (the text's hash is not the saved one) }
 *   s.summary() → the report's check set (problems.js idsSummary) or null
 *   s.view() → { title, meta: [text], issues: [text], sum, specs: [{ name, status, line, mismatch }] }   for the dialog
 */

import { readIds, idsHash } from './ids.js';
import { checkIds } from './check.js';
import { idsProblems, idsSummary } from './problems.js';
import { cleanIdsRecord } from './record.js';

export { cleanIdsRecord };

export function idsSession({ t = (k) => k, setKey = 'ids', ifc = () => null, severity = 'warning' } = {}) {
  const st = { record: null, ids: null, error: '', result: null, ifcError: '', changed: false };
  const s = {
    state: st,
    use(record) {
      const r = cleanIdsRecord(record);
      st.record = r; st.ids = null; st.error = ''; st.result = null; st.changed = false;
      if (!r) return null;
      try { st.ids = readIds(r.text); } catch (e) { st.error = String(e.message || e); }
      st.changed = !!r.hash && r.hash !== idsHash(r.text);
      return r;
    },
    load(text, name) {
      readIds(text);   // throws when it is not an IDS: nothing changes
      return s.use({ name, hash: idsHash(text), text });
    },
    clear() { s.use(null); },
    async run() {
      st.ifcError = '';
      if (!st.ids) { st.result = null; return []; }
      let file = null;
      try { file = await ifc(); } catch (e) { st.ifcError = String(e.message || e); }
      if (!file) { st.result = null; return []; }
      st.result = checkIds(st.ids, file);
      return idsProblems(st.result, { t, setKey, severity });
    },
    summary() { return st.result && st.record ? idsSummary(st.result, { file: st.record.name, text: st.record.text }) : null; },
    view() {
      if (!st.record) return null;
      const info = st.ids?.info || {};
      const meta = [info.version && t('ids.meta.version', { v: info.version }), info.author && t('ids.meta.author', { who: info.author }), info.date && t('ids.meta.date', { date: info.date })].filter(Boolean);
      const r = st.result;
      const specs = r ? r.specs.map((x) => ({
        name: x.name || '#' + (x.index + 1), status: x.status,
        line: x.specFailure ? t('ids.spec.none') : x.cardinality === 'prohibited' ? (x.applicable ? t('ids.spec.prohibited', { n: x.applicable }) : t('ids.spec.counts', { applicable: 0, failed: 0 })) : t('ids.spec.counts', { applicable: x.applicable, failed: x.failed }),
        mismatch: x.versionMismatch ? t('ids.mismatch', { versions: x.ifcVersion.join(', '), schema: r.schema }) : '',
      })) : [];
      return {
        title: t('ids.file', { title: info.title || st.record.name, file: st.record.name }), meta, error: st.error, ifcError: st.ifcError,
        issues: (st.ids?.issues || []).map((x) => (x.spec >= 0 && st.ids.specs[x.spec] ? (st.ids.specs[x.spec].name || '#' + (x.spec + 1)) + ': ' : '') + t('ids.issue.' + x.code, x.vars || {})),
        sum: r ? (r.specs.length ? t('ids.sum', { pass: r.counts.pass, n: r.counts.specs, failed: r.counts.failedElements }) : t('ids.sum.none')) : '',
        changed: st.changed ? t('ids.changed', { hash: st.record.hash }) : '',
        specs,
      };
    },
  };
  return s;
}
