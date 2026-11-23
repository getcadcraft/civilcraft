/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shell-mount-core.js — the doc's block (docs/apps/shell-modules.md § Mounting 2) that seven apps' shell-mount.js carried as the same text
 * (0.11 PERF.74, perf-finish-11 round 2 lane util). Canonical copy here; each app's dev/ carries a byte-identical copy (node tools/shell/sync.mjs);
 * the app's own shell-mount.js imports it and re-exports mountShellModules, and keeps what is its own (its host, lessons, probes, reload).
 * CivilCraft's shell-mount.js mounts the modules its own way (mountShell) and does not use this file.
 *
 *   mountShellModules(host, { titleFollow, opened })
 *     titleFollow  (default true) the tab title follows host.document() / host.dirty() (app-doc-title.js); DetailCraft passes false: its render
 *                  calls ccSetDocTitle itself
 *     opened()     the words Suggest is reset with when another file opens and the app gave none. Each app passes its own: CadCraft,
 *                  ModelCraft, BimCraft, PartCraft their 'shellmount.file.opened' key; DetailCraft, MarkupCraft, TakeoffCraft the English
 *                  words their copies had (their language files have no such key). This file names no key, so no language check sees one.
 */
/** The doc's block (shell-modules.md § Mounting 2), as the doc has it; the two app differences are the options above. */
export function mountShellModules(host, { titleFollow = true, opened } = {}) {
  if (titleFollow) { const f = () => window.ccDocTitleFollow && window.ccDocTitleFollow(host); if (window.ccDocTitleFollow) f(); else window.addEventListener('load', f); }   // 2026-11-09: tab title = document name (one pattern, app-shell.js)
  const when = (api, name, go) => (window[api] ? go() : document.addEventListener('cc-' + name + '-ready', go, { once: true }));
  // EG.18 calc sheets — parameters in, drives out, saved inside the app's own file
  when('ccCalc', 'calc', () => {
    ccCalc.attach({ units: host.units /* the build's unit-table.js, optional */, params: host.params /* { get, set, list } */,
                    step: host.step, persist: (json) => host.file.set('calcs', json) });
    ccCalc.registerTools(host.control);
  });
  // EG.34 design reasons — the selection, optionally the elements that should have a reason
  when('ccReasons', 'reasons', () => {
    ccReasons.attach({ selection: host.selection, onSelection: host.onSelection, select: host.select, expected: host.expected /* optional */,
                       step: host.step, persist: (json) => host.file.set('reasons', json) });
    ccReasons.registerTools(host.control);
  });
  // EG.30 running totals — one source per kind of number the app can stand behind (null until it has one)
  when('ccTotals', 'totals', () => {
    for (const s of host.totals || []) ccTotals.source(s);              // { id, measure: cost|carbon|weight|time, label, read: () => number | null }
    if (host.statusBar) ccTotals.mount(host.statusBar);                 // optional: the app's own status bar element
    ccTotals.registerTools(host.control);
  });
  // EG.23 lessons — the app's lessons, and where it already knows something happened
  when('ccLessons', 'lessons', () => {
    for (const l of host.lessons || []) ccLessons.register(l);          // { id, title, steps: [{ id, text, hints, done: { event, match } | { probe } }] }
    for (const [name, fn] of Object.entries(host.probes || {})) ccLessons.probe(name, fn);
    ccLessons.registerTools(host.control);
    host.emit = (event, data) => ccLessons.emit(event, data);           // the app calls host.emit('tool', { name: 'line' }) where it runs a command
  });
  // DI.1 drawing details — what the app counts, and where the written details are kept in its file
  when('ccDocInfo', 'docinfo', () => {
    ccDocInfo.attach({ read: host.docinfo?.read, persist: (json) => host.file.set('docinfo', json), step: host.step, onChange: host.docinfo?.onChange });   // read() → { units, extents, counts, extra, bytes, path }
    ccDocInfo.registerTools(host.control);
  });
  // AC.12 Suggest, AC.13 activity log, AC.8 Ask box — they ride on host.control, so the app hands over very little
  when('ccSuggest', 'suggest', () => {
    ccSuggest.attach({ control: host.control, rev: host.rev, step: host.step, document: host.document, perms: host.perms, ghost: host.ghost });
    ccSuggest.registerTools(host.control);
    host.fileOpened = (why) => ccSuggest.reset(why || opened());   // call when another file opens
  });
  when('ccActivity', 'activity', () => {
    ccActivity.attach({ control: host.control, rev: host.rev, document: host.document, undoTo: host.undoTo, history: host.history, version: host.version });
  });
  when('ccAsk', 'ask', () => {
    ccAsk.attach({ control: host.control, context: host.askContext, system: host.skillPack /* the app's skill pack text, AC.5 */ });
    ccAsk.registerTools(host.control);
  });
  // when a file opens / saves (the app's own two places):  open: ccCalc.load(file.calcs); ccReasons.load(file.reasons);
  //                                                        save: file.calcs = ccCalc.save(); file.reasons = ccReasons.save();
}
