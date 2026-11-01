/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; the words come from the app's t (keys ids.p.*, tools/ids/lang.mjs). */
/**
 * problems.js — an IDS check result (check.js) as shared Problems (docs/0.8-PROBLEMS-SPEC.md; source kind "check", the app
 * registers it as `<app>.ids`) and as the check report's summary. DOM-free.
 *
 *   idsProblems(result, { t, severity = 'warning', perSpec = 1000, total = 4800, setKey }) → [problem]
 *     One problem per element and failed requirement: about the element by GlobalId (kind 'element', so a click selects and
 *     frames it), source.name = the specification's name, msg { key: 'ids.p.<code>', vars: { spec, facet, req, found, el, fh } },
 *     text = the same in words through t. Its id stays the same between runs and languages: '<setKey>:<spec key>:<facet>:<GlobalId>'
 *     (spec key = the specification's identifier, else its place and a hash of its name), so an acceptance survives a re-check;
 *     `fh` (a number hashed from what was found) re-opens one when the found value changes.
 *     A required specification nothing applies to = one problem about the specification ('ids.p.spec.none'); more failures
 *     than perSpec = one note with how many more ('ids.p.more').
 *   idsSummary(result, { title, version, author, date, file }) → the report's check set (problems.js cleanCheckSet shape)
 */

import { idsHash } from './ids.js';

const fnv = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const specKey = (s) => (s.identifier ? String(s.identifier).replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 40) : 's' + s.index + '-' + fnv(s.name || '').toString(36));
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function idsProblems(result, { t = (k, v) => k + (v ? ' ' + JSON.stringify(v) : ''), severity = 'warning', perSpec = 1000, total = 4800, setKey = 'ids' } = {}) {
  const out = [];
  if (!result) return out;
  for (const s of result.specs) {
    const sk = setKey + ':' + specKey(s);
    const name = clip(s.name || '#' + (s.index + 1), 80);
    const aboutSpec = [{ kind: 'ids', id: sk, label: name }];
    if (s.specFailure) {
      const vars = { spec: name, req: clip(s.applicabilityText || '', 200) };
      out.push({ id: sk + ':none', code: 'ids.' + s.specFailure.code, severity, msg: { key: 'ids.p.spec.none', vars }, text: t('ids.p.spec.none', vars), about: aboutSpec, source: { name } });
    }
    let listed = 0, rows = 0;
    for (const f of s.failures) {
      if (rows >= perSpec || out.length >= total) break;
      const el = (f.cls || f.type || '') + (f.name ? ' “' + clip(f.name, 60) + '”' : '');
      const about = [{ kind: 'element', id: f.guid || '#' + f.id, label: el || '#' + f.id }];
      listed++;
      for (const fc of f.facets) {
        const found = clip(fc.found.join(', '), 200);
        const code = fc.code;
        const vars = { spec: name, facet: t('ids.facet.' + fc.kind.toLowerCase()), req: clip(fc.text, 200), found: found || '–', el: el || '#' + f.id, fh: fnv(found) % 1000003 };
        out.push({
          id: sk + ':' + (fc.index < 0 ? 'x' : fc.index) + ':' + (f.guid || '#' + f.id), code: 'ids.' + code, severity,
          msg: { key: 'ids.p.' + code, vars }, text: t('ids.p.' + code, vars), about, source: { name },
        });
        rows++;
      }
    }
    if (s.failed > listed) {
      const vars = { spec: name, n: s.failed - listed };
      out.push({ id: sk + ':more', code: 'ids.more', severity: 'note', msg: { key: 'ids.p.more', vars }, text: t('ids.p.more', vars), about: aboutSpec, source: { name } });
    }
  }
  return out;
}

/** The check set the report shows: the IDS's own title, version, author and date, and every specification's counts. */
export function idsSummary(result, { title = '', version = '', author = '', date = '', file = '', text = '' } = {}) {
  if (!result) return null;
  const info = result.info || {};
  return {
    kind: 'ids', title: title || info.title || file, version: version || info.version || '', author: author || info.author || '', date: date || info.date || '',
    file, schema: result.schema || '', hash: text ? idsHash(text) : '',
    specs: result.specs.map((s) => ({ name: s.name || '#' + (s.index + 1), status: s.status, applicable: s.applicable, passed: s.passed, failed: s.failed })),
  };
}
