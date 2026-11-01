/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-lessons.js — guided lessons with badges and mentor mode in every app (round 2, session shell_PART_2, EG.23; map docs/apps/shell-modules.md
 * § Lessons): the page side of lessons.js. Loaded by app-shell.inc for a build whose manifest says "lessons": true (AppBuilds::extras; dev builds
 * only). Reads #cc-lessons {app, appName}.
 *
 * The shell runs the lesson (steps, hints, progress, badges, the panel); the app only says what happened:
 *
 *   window.ccLessons = {
 *     register(lesson) → cleaned | null      { id, title, intro?, level?, steps: [{ id, text, hints?: [..], done: { event, match? } | { probe } }], badge?: { title } }
 *                                             a lesson carries hints, never the answer (lessons.js drops answer / solution fields)
 *     probe(name, fn)      a check the app can answer: fn() → truthy when the step's goal is true now (a step with done: { probe: name })
 *     emit(event, data?)   something happened in the app ("tool", { name: 'line' }); the running step completes when it matches
 *     start(id) · stop() · open() · close() · toggle() · mentor(on?) · state()
 *     registerTools(control)   lessons_status / lessons_describe for an app's host.control (lessons_describe gives a hint, only in mentor mode)
 *   }
 * Apps that load before this module wait for it: `window.ccLessons ? go() : addEventListener('cc-lessons-ready', go, { once: true })`.
 * Progress, badges and the mentor switch are the person's, kept in the browser per app (localStorage cc-lessons:<app>); nothing is sent anywhere.
 * Without lessons registered the app-bar button stays hidden. Words: shell.lessons.* in assets/lang/shell.
 */
import { createLessons, lessonTools } from './lessons.js';
import { T, h, readCfg, store, makePanel, palette, registerTools } from './app-tools-ui.js';

const cfg = readCfg('cc-lessons');
if (cfg && cfg.app && !window.ccLessons) boot();

function boot() {
  const L = createLessons({ app: cfg.app, store });
  const P = makePanel({ key: 'lessons', icon: 'mortarboard', titleKey: 'shell.lessons.title', hidden: true, onOpen: () => render() });
  P.btn.title = T('shell.lessons.button.title');
  let hintText = '', toast = '';
  const live = h('div', { class: 'cct-live', role: 'status', 'aria-live': 'polite' }); document.body.append(live);

  const before = new Set(L.badges().map((b) => b.id));
  L.on((why) => {
    P.show(L.list().length > 0);
    P.btn.dataset.running = L.current() ? '1' : '';
    for (const b of L.badges()) if (!before.has(b.id)) { before.add(b.id); toast = T('shell.lessons.badge.won', { title: b.title }); live.textContent = toast; P.open(); }
    if (why === 'step' || why === 'start' || why === 'restart' || why === 'finish') hintText = '';
    render();
  });

  function render() {
    if (P.panel.hidden) return;
    const cur = L.current(); const list = L.list(); const badges = L.badges();
    P.sum.textContent = list.length ? T('shell.lessons.sum', { done: list.filter((x) => x.finished).length, total: list.length }) : '';
    const kids = [];
    kids.push(h('label', { class: 'cct-check cct-mentor' }, h('input', { type: 'checkbox', 'data-k': 'mentor', checked: L.mentor(), onchange: (e) => { L.mentor(e.target.checked); hintText = ''; } }), ' ' + T('shell.lessons.mentor'), h('small', { class: 'cct-note', text: ' ' + T('shell.lessons.mentor.what') })));
    if (toast) { kids.push(h('p', { class: 'cct-win', text: toast })); toast = ''; }
    if (cur) {
      kids.push(h('div', { class: 'cct-step', 'data-step': cur.step },
        h('p', { class: 'cct-step-n', text: T('shell.lessons.step', { n: cur.index, total: cur.of, title: cur.title }) }),
        h('p', { class: 'cct-step-t', text: cur.text }),
        hintText ? h('p', { class: 'cct-hint', role: 'note', text: hintText }) : null,
        h('div', { class: 'cct-bar' },
          cur.mentor ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'hint', onclick: () => { const r = L.hint(); hintText = r.ok ? r.text : r.why; render(); } }, cur.hintsLeft ? T('shell.lessons.hint') : T('shell.lessons.hint.again')) : null,
          stepIsManual(cur) ? h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'done', onclick: () => L.confirm() }, T('shell.lessons.done')) : null,
          h('button', { type: 'button', class: 'cct-btn', 'data-k': 'skip', onclick: () => L.skip() }, T('shell.lessons.skip')),
          h('button', { type: 'button', class: 'cct-btn', 'data-k': 'stop', onclick: () => L.stop() }, T('shell.lessons.stop')))));
    }
    if (!list.length) kids.push(h('p', { class: 'cct-empty', text: T('shell.lessons.none') }));
    kids.push(h('ul', { class: 'cct-list' }, list.map((x) => h('li', { 'data-lesson': x.id },
      h('div', { class: 'cct-lesson' }, h('strong', { text: x.title }), ' ', h('small', { text: T('shell.lessons.level.' + x.level) })),
      x.intro ? h('p', { class: 'cct-note', text: x.intro }) : null,
      h('progress', { max: x.steps, value: x.done, 'aria-label': T('shell.lessons.progress', { done: x.done, total: x.steps }) }),
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'start-' + x.id, disabled: x.active, onclick: () => { hintText = ''; if (x.finished) L.restart(x.id); else L.start(x.id); } },
        x.active ? T('shell.lessons.running') : x.finished ? T('shell.lessons.again') : x.done ? T('shell.lessons.resume') : T('shell.lessons.start'))))));
    kids.push(h('h3', { class: 'cct-sub', text: T('shell.lessons.badges') }));
    kids.push(badges.length ? h('ul', { class: 'cct-badges' }, badges.map((b) => h('li', { class: 'cct-badge', 'data-badge': b.id }, h('i', { class: 'bi bi-award', 'aria-hidden': 'true' }), ' ' + b.title))) : h('p', { class: 'cct-note', text: T('shell.lessons.badges.none') }));
    P.body.replaceChildren(...kids);
  }
  // a step with neither an event nor a probe can only be confirmed by the person
  const stepIsManual = (cur) => { const l = L.get(cur.lesson); const s = l && l.steps.find((x) => x.id === cur.step); return !!(s && s.done.manual); };

  const api = {
    register(def) { const r = L.register(def); P.show(L.list().length > 0); return r; },
    unregister(id) { const r = L.unregister(id); P.show(L.list().length > 0); return r; },
    probe: (n, f) => L.probe(n, f),
    emit: (e, d) => L.emit(e, d),
    start(id) { const r = L.start(id); if (r) P.open(); return r; },
    stop: () => L.stop(),
    mentor: (on) => L.mentor(on),
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    registerTools(control, opts = {}) { return registerTools(control, lessonTools({ lessons: L }), opts.skip); },
    tools: () => lessonTools({ lessons: L }),
    state: () => ({ lessons: L.list(), current: L.current(), badges: L.badges(), mentor: L.mentor(), open: P.isOpen }),
  };
  window.ccLessons = api;
  palette({ id: 'cc-lessons-open', label: T('shell.lessons.palette'), group: T('shell.lessons.title'), keywords: 'learn tutorial lesson mentor badge', run: () => { if (L.list().length) P.toggle(); } });
  document.dispatchEvent(new CustomEvent('cc-lessons-ready'));
}
