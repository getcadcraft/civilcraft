/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shell-mount.js — CivilCraft's side of the shell's modules (0.8 round 3, session civil_PART_3; mount lines from shell_PART_2 § Mount lines and
 * ai-trust_PART_2 § Mount): calc sheets (EG.18), design reasons (EG.34), running totals (EG.30), lessons (EG.23), Suggest mode (AC.12), the activity log
 * (AC.13) and the Ask box (AC.8). The shell never touches the project: this file hands over what CivilCraft has and keeps what comes back
 * (`project.shell.calcs` / `.reasons` / `.docinfo`, saved in the project file as `shell`, outside the undo snapshots).
 *
 *   const m = mountShell({ project: () => project, host, selection: () => sel, select: (s) => …, undoDepth: () => n, undoTo: (n) => …, say })
 *   m.opened()   call when another project replaces the open one (loads the sheets, closes pending suggestions)
 *   m.changed()  call on every project change (lessons look at what exists now)
 *
 * Every module is optional: an app build whose manifest leaves one off simply never fires its ready event, and nothing here waits for it.
 */
import * as UNITS from './unit-table.js';
import { assistantPrefs, ASSIST_KEY } from './host.js';
import { t } from './i18n.js';

/** The selection kinds a reason can be written about (the names the plan and the 3D view already use). */
export const REASON_KINDS = ['alignment', 'pad', 'feature', 'pipe', 'structure', 'mass', 'ls-hard', 'ls-grade'];

/** The first lesson: points → surface → alignment → pad. Each step is a question the project can answer (no events to wire). */
export function firstSiteLesson(tr = t) {
  return {
    id: 'civil.first-site', title: tr('cv.lesson.first.title'), intro: tr('cv.lesson.first.intro'), level: 1,
    steps: [
      { id: 'points', text: tr('cv.lesson.first.points'), hints: [tr('cv.lesson.first.points.h1')], done: { probe: 'civil.points' } },
      { id: 'surface', text: tr('cv.lesson.first.surface'), hints: [tr('cv.lesson.first.surface.h1')], done: { probe: 'civil.surface' } },
      { id: 'alignment', text: tr('cv.lesson.first.alignment'), hints: [tr('cv.lesson.first.alignment.h1'), tr('cv.lesson.first.alignment.h2')], done: { probe: 'civil.alignment' } },
      { id: 'pad', text: tr('cv.lesson.first.pad'), hints: [tr('cv.lesson.first.pad.h1')], done: { probe: 'civil.pad' } },
    ],
    badge: { title: tr('cv.lesson.first.badge') },
  };
}

/** What `sel` (or a reason's element) means as the shell's { kind, id, label }. */
export function elementOf(project, sel) {
  if (!sel || !REASON_KINDS.includes(sel.kind) || sel.id == null) return null;
  const s = project.state;
  const find = { alignment: s.alignments, pad: s.pads, feature: s.features, mass: s.masses, pipe: s.network?.pipes, structure: s.network?.structures }[sel.kind];
  const row = (find || []).find((x) => x.id === sel.id);
  return { kind: sel.kind, id: String(sel.id), label: String(row?.name || sel.id).slice(0, 80) };
}

export function mountShell({ project, host, selection, select, undoDepth, undoTo, say }) {
  { const h = { document: () => ({ name: project().state.name }), dirty: () => !!project().dirty }, f = () => window.ccDocTitleFollow && window.ccDocTitleFollow(h); if (window.ccDocTitleFollow) f(); else window.addEventListener('load', f); }   // 2026-11-09: tab title = project name (one pattern, app-shell.js)
  const subs = [];
  let packText = '';   // the skill pack for CivilCraft (AC.5), read once; the Ask box sends it with each question
  import('../../../js/skill-packs.js').then((m) => { packText = m.PACKS.filter((x) => x.app === 'civilcraft').map((x) => x.skill).join('\n\n'); }, () => {});
  const on = (name, f) => { const m = window[name]; if (m) f(m); else document.addEventListener('cc-' + name.slice(2).toLowerCase() + '-ready', () => f(window[name]), { once: true }); };
  const kept = (k) => project().shell[k] || null;
  const keep = (k, json) => { const p = project(); if (json) p.shell[k] = json; else delete p.shell[k]; p.touch('shell'); };
  const step = (label, fn) => project().change(label, () => { fn(); });   // a drive or an assistant's edit: one undo step (an edit that changes nothing leaves none)

  // DI.1: real counts only — the TIN's triangle count is the surface's own (stats), never a guess; a project with no surface has none
  const docInfoRead = () => {
    const p = project(), st = p.state, n = (a) => (Array.isArray(a) ? a.length : 0);
    const elements = n(st.alignments) + n(st.pads) + n(st.features) + n(st.parcels) + n(st.masses) + n(st.network?.pipes) + n(st.network?.structures);
    const counts = { points: p.points.length, elements };
    let extents = null;
    const surf = p.eg().surface, ss = surf?.stats?.();
    if (ss) { counts.triangles = ss.triangles; const b = ss.bounds; if (b && [b.minX, b.minY, b.maxX, b.maxY, ss.minZ, ss.maxZ].every(Number.isFinite)) extents = { min: [b.minX, b.minY, ss.minZ], max: [b.maxX, b.maxY, ss.maxZ] }; }
    return { units: st.units || '', path: st.name || '', extents, counts };
  };

  const wireAssistants = (m) => {
    m.attach({ control: host.control, rev: undoDepth, document: () => ({ name: project().state.name }), step: host.control.step, undoTo,
      perms: { get: () => assistantPrefs(host), set: (r) => { try { host.win?.localStorage?.setItem(ASSIST_KEY + host.app, JSON.stringify(r)); } catch { /* private mode */ } } },
      history: null, version: () => project().version, context: () => ({ document: project().state.name, selection: selection() ? { kind: selection().kind, count: 1 } : { kind: 'none', count: 0 } }) });
  };

  on('ccCalc', (m) => {
    m.attach({ units: UNITS, params: { get: () => null, set: () => false, list: () => [] }, step, persist: (json) => keep('calcs', json) });
    m.load(kept('calcs')); m.registerTools(host.control); subs.push(() => m.load(kept('calcs')));
  });
  on('ccReasons', (m) => {
    m.attach({ selection: () => elementOf(project(), selection()), onSelection: () => () => {}, select: (el) => select({ kind: el.kind, id: el.id }), expected: () => [], persist: (json) => keep('reasons', json), step });
    m.load(kept('reasons')); m.registerTools(host.control); subs.push(() => m.load(kept('reasons')));
  });
  // DI.1 drawing details — what the app counts, and where the written details are kept in its file
  on('ccDocInfo', (m) => {
    m.attach({ read: docInfoRead, persist: (json) => keep('docinfo', json), step, onChange: (fn) => project().on(() => fn()) });
    m.load(kept('docinfo')); m.registerTools(host.control); subs.push(() => m.load(kept('docinfo')));
  });
  // Running totals: CivilCraft has no cost, carbon, weight or time of its own to stand behind, so no source is fed (a measure nobody feeds is not shown).
  on('ccTotals', (m) => m.registerTools(host.control));
  on('ccLessons', (m) => {
    const p = () => project();
    m.probe('civil.points', () => p().points.length > 0);
    m.probe('civil.surface', () => !!p().eg().surface);
    m.probe('civil.alignment', () => p().state.alignments.length > 0);
    m.probe('civil.pad', () => p().state.pads.length > 0);
    m.register(firstSiteLesson());
    m.registerTools(host.control);
  });
  on('ccSuggest', (m) => { wireAssistants(m); m.registerTools(host.control); subs.push((why) => m.reset(why)); });
  on('ccActivity', (m) => wireAssistants(m));
  on('ccAsk', (m) => {
    m.attach({ control: host.control, context: () => ({ document: project().state.name, selection: selection() ? { kind: selection().kind, count: 1 } : { kind: 'none', count: 0 } }), system: () => packText });
    m.registerTools(host.control);
  });

  return {
    opened() { for (const f of subs) f(t('cv.shell.opened')); },
    changed() { window.ccLessons?.emit?.('changed'); },
  };
}
