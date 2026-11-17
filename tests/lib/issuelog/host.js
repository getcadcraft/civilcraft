/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js: the panel's host for an app that keeps the issue history as one JSON object in its own file (0.10 BK.48; session
 * bk-r3-stages-10). MarkupCraft, TakeoffCraft and DetailCraft use it; BimCraft has its own (the history lives in the IFC and it
 * prints elements). No app imports.
 *
 *   fileHost({ t, app, read() → stored object | null, write(history, label), sheets?() → [{ id, number, title, hash }],
 *              canIssue = !!sheets, own?() → history of issues the app keeps itself (shown, never stored twice),
 *              records?() → [record], stage?(), ...rest (download, today, who, fileBase, cls, kinds, openSheet, openRecord, actions) })
 *     → the host mountIssuePanel() takes
 *   sheetId(text) → an id made of the characters the history allows
 */
import { cleanHistory, mergeHistory, planIssue, addIssue, changesSince } from './history.js';

export const sheetId = (text) => String(text ?? '').replace(/[^A-Za-z0-9._:$-]/g, '_').slice(0, 80);

export function fileHost({ t, app, read, write, sheets = null, canIssue = !!sheets, own = null, records = null, stage = null, ...rest }) {
  const ownIds = () => new Set((own ? cleanHistory(own()) : { issues: [] }).issues.map((i) => i.id));
  const get = () => {
    const kept = cleanHistory(read());
    if (!own) return kept;
    const m = mergeHistory(cleanHistory(own()), kept); delete m.added;
    return m;
  };
  const set = (history, label) => {
    const mine = ownIds();
    write({ ...cleanHistory(history), issues: cleanHistory(history).issues.filter((i) => !mine.has(i.id)) }, label);
  };
  const host = { t, app, get, set, records: records || undefined, ...rest };
  if (sheets) {
    host.sheets = sheets;
    host.changes = (id) => { const issue = get().issues.find((i) => i.id === id); return issue ? changesSince(issue, { sheets: sheets() }) : null; };
  }
  if (sheets && canIssue) host.issue = async (spec) => {
    const h = get(), chosen = sheets().filter((s) => spec.sheetIds.includes(s.id));
    const issue = planIssue(h, { code: spec.code, purpose: spec.purpose, name: spec.name, date: spec.date, by: spec.by, note: spec.note, app, stage: stage ? stage() : '', sheets: chosen });
    set(addIssue(h, issue), t('issues.undo.issue', { code: issue.code }));
    return issue;
  };
  return host;
}
