/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lessons.js — guided lessons with badges and mentor mode (0.8 round 2, EG.23). DOM-free, no imports; tested in Node (bin/test-lessons.mjs).
 * The shell's UI is app-lessons.js; each app (or add-on) hands over its lessons, this file keeps the steps, the hints, the progress and the badges.
 *
 *   const L = createLessons({ app, store, now })      store: { get(key) → string | null, set(key, string) }  (localStorage in the page)
 *   L.register({ id, title, intro, level, steps: [{ id, text, hints: [..], done: { event, match? } | { probe } }], badge: { title } })
 *   L.probe(name, fn)        a check the app can answer: fn() → truthy when the step's goal is true now ("the line exists")
 *   L.emit(event, data)      the app says something happened ("line.drawn"); the current step completes when its `done.event` matches
 *                            (every key of `match` equal to the same key of data)
 *   L.start(id) · L.skip() · L.restart(id) · L.stop() · L.current() · L.hint() · L.mentor(on) · L.progress() · L.badges()
 *
 * Mentor mode (owner EG.23, "hints, not answers"): with it on, hint() gives the next hint for the current step, one at a time, and a stuck
 * step can offer where to look. A lesson never carries an answer: cleanLesson drops any `answer`, `solution` or `do` field, so there is
 * nothing here to show. The last hint points at the tool or the place; the person does the step.
 * Badges: one per finished lesson (its own title), "First lesson", "No hints needed" (a lesson finished without one), and "Five lessons".
 * Progress is the person's, kept in the browser per app; it is not an account feature and nothing is sent anywhere.
 */

export const LIMITS = Object.freeze({ lessons: 60, steps: 40, hints: 5, id: 60, title: 100, text: 500 });
export const FORMAT = 'cadcraft-lessons';
const META = Object.freeze({ first: 'First lesson', clean: 'No hints needed', five: 'Five lessons' });

const text = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);
const idOf = (s) => String(s ?? '').replace(/[^\w.-]/g, '').slice(0, LIMITS.id);

export function cleanLesson(l) {
  if (!l || typeof l !== 'object') return null;
  const id = idOf(l.id); const title = text(l.title, LIMITS.title);
  if (!id || !title) return null;
  const seen = new Set(); const steps = [];
  for (const s of Array.isArray(l.steps) ? l.steps.slice(0, LIMITS.steps) : []) {
    if (!s || typeof s !== 'object') continue;
    const sid = idOf(s.id); if (!sid || seen.has(sid) || !text(s.text, LIMITS.text)) continue;
    const d = s.done && typeof s.done === 'object' ? s.done : {};
    const done = d.event ? { event: text(d.event, 60), match: d.match && typeof d.match === 'object' ? Object.fromEntries(Object.entries(d.match).slice(0, 6).filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))) : {} }
      : d.probe ? { probe: text(d.probe, 60) } : { manual: true };
    seen.add(sid);
    // hints, never answers: any answer / solution / do field the author sent is dropped here
    steps.push({ id: sid, text: text(s.text, LIMITS.text), hints: (Array.isArray(s.hints) ? s.hints : []).slice(0, LIMITS.hints).map((h) => text(h, LIMITS.text)).filter(Boolean), done });
  }
  if (!steps.length) return null;
  return { id, title, intro: text(l.intro, LIMITS.text), level: ['beginner', 'intermediate', 'advanced'].includes(l.level) ? l.level : 'beginner', steps, badge: { title: text(l.badge && l.badge.title, 60) || title } };
}

export function createLessons({ app = 'app', store = null, now = () => Date.now() } = {}) {
  const KEY = 'cc-lessons:' + idOf(app);
  const lessons = new Map(); const probes = new Map(); const listeners = new Set();
  let state = (() => { try { const j = JSON.parse(store && store.get(KEY) || 'null'); return j && typeof j === 'object' ? j : {}; } catch { return {}; } })();
  state = { progress: {}, badges: {}, mentor: false, ...state };
  if (typeof state.progress !== 'object' || !state.progress) state.progress = {};
  if (typeof state.badges !== 'object' || !state.badges) state.badges = {};
  let active = null;   // lesson id
  const save = () => { try { store && store.set(KEY, JSON.stringify({ progress: state.progress, badges: state.badges, mentor: !!state.mentor })); } catch { /* kept for this page */ } };
  const changed = (why) => { save(); for (const f of listeners) { try { f(why); } catch { /* a listener must not break the lesson */ } } };
  const prog = (id) => (state.progress[id] ||= { steps: {}, hints: {}, used: 0 });

  function award(id, title) { if (state.badges[id]) return false; state.badges[id] = { title, at: now() }; return true; }
  function finish(lesson) {
    const p = prog(lesson.id); p.done = now();
    const won = [];
    if (award('lesson:' + lesson.id, lesson.badge.title)) won.push('lesson:' + lesson.id);
    if (award('meta:first', META.first)) won.push('meta:first');
    if (!p.used && award('meta:clean', META.clean)) won.push('meta:clean');
    if (Object.values(state.progress).filter((x) => x.done).length >= 5 && award('meta:five', META.five)) won.push('meta:five');
    active = null; changed('finish'); return won;
  }
  const stepsDone = (l) => l.steps.filter((s) => prog(l.id).steps[s.id]).length;
  const nextStep = (l) => l.steps.find((s) => !prog(l.id).steps[s.id]) || null;
  function complete(lesson, step) {
    const p = prog(lesson.id); if (p.steps[step.id]) return false;
    p.steps[step.id] = now();
    if (!nextStep(lesson)) finish(lesson); else changed('step');
    return true;
  }
  /** Look at the current step with what the app can answer now. */
  function check() {
    const l = active && lessons.get(active); const s = l && nextStep(l); if (!s) return false;
    if (s.done.probe) { const f = probes.get(s.done.probe); let ok = false; try { ok = !!(f && f()); } catch { ok = false; } return ok ? complete(l, s) : false; }
    return false;
  }

  return {
    register(def) { const l = cleanLesson(def); if (!l) return null; if (!lessons.has(l.id) && lessons.size >= LIMITS.lessons) return null; lessons.set(l.id, l); changed('register'); return l; },
    /** Take a lesson out (a field pack removed): its progress and badges stay the person's. */
    unregister(id) { if (!lessons.delete(id)) return false; if (active === id) active = null; changed('unregister'); return true; },
    probe(name, fn) { probes.set(text(name, 60), fn); },
    list: () => [...lessons.values()].map((l) => ({ id: l.id, title: l.title, intro: l.intro, level: l.level, steps: l.steps.length, done: stepsDone(l), finished: !!prog(l.id).done, active: active === l.id })),
    get: (id) => lessons.get(id) || null,
    start(id) { const l = lessons.get(id); if (!l) return null; if (prog(id).done) return null; active = id; changed('start'); check(); return this.current(); },
    restart(id) { const l = lessons.get(id); if (!l) return null; state.progress[id] = { steps: {}, hints: {}, used: 0 }; active = id; changed('restart'); check(); return this.current(); },
    stop() { active = null; changed('stop'); },
    current() {
      const l = active && lessons.get(active); if (!l) return null;
      const s = nextStep(l); if (!s) return null;
      return { lesson: l.id, title: l.title, step: s.id, index: stepsDone(l) + 1, of: l.steps.length, text: s.text, hintsLeft: Math.max(0, s.hints.length - (prog(l.id).hints[s.id] || 0)), mentor: !!state.mentor };
    },
    /** The app says something happened. Returns true when it completed the current step. */
    emit(event, data = {}) {
      const l = active && lessons.get(active); const s = l && nextStep(l); if (!s) return false;
      if (s.done.event && s.done.event === event && Object.entries(s.done.match || {}).every(([k, v]) => data && data[k] === v)) return complete(l, s);
      return check();
    },
    check,
    /** "I did it" for steps with no way to tell (done: manual). A step the app can check is not skippable by a click. */
    confirm() { const l = active && lessons.get(active); const s = l && nextStep(l); if (!s || !s.done.manual) return false; return complete(l, s); },
    skip() { const l = active && lessons.get(active); const s = l && nextStep(l); if (!s) return false; prog(l.id).used++; return complete(l, s); },
    /** The next hint for the current step — only with mentor mode on; never the answer. */
    hint() {
      if (!state.mentor) return { ok: false, why: 'Mentor mode is off. Switch it on to get hints.' };
      const l = active && lessons.get(active); const s = l && nextStep(l); if (!s) return { ok: false, why: 'No lesson is running.' };
      const p = prog(l.id); const n = p.hints[s.id] || 0;
      if (!s.hints.length) return { ok: true, text: 'Read the step again: ' + s.text, last: true };
      const t = s.hints[Math.min(n, s.hints.length - 1)];
      if (n < s.hints.length) { p.hints[s.id] = n + 1; p.used++; changed('hint'); }
      return { ok: true, text: t, n: Math.min(n + 1, s.hints.length), of: s.hints.length, last: n + 1 >= s.hints.length };
    },
    mentor(on) { if (on !== undefined) { state.mentor = !!on; changed('mentor'); } return !!state.mentor; },
    progress() { return Object.fromEntries([...lessons.values()].map((l) => [l.id, { done: stepsDone(l), of: l.steps.length, finished: !!prog(l.id).done, hints: prog(l.id).used }])); },
    badges: () => Object.entries(state.badges).map(([id, b]) => ({ id, title: b.title, at: b.at })),
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    resetAll() { state = { progress: {}, badges: {}, mentor: state.mentor }; active = null; changed('reset'); },
  };
}

/** The assistants' tools: lessons_status (read) and lessons_describe (hints for a stuck step, never the answer; needs mentor mode on). */
export function lessonTools({ lessons } = {}) {
  const obj = (properties) => ({ type: 'object', properties, additionalProperties: false });
  return [
    { name: 'lessons_status', group: 'read', title: 'Get the lesson state', untrusted: true,
      description: 'Returns the lessons available in this app, the running lesson and its current step, progress, badges and whether mentor mode is on.',
      inputSchema: obj({}), run: () => ({ lessons: lessons.list(), current: lessons.current(), progress: lessons.progress(), badges: lessons.badges(), mentor: lessons.mentor() }) },
    { name: 'lessons_describe', group: 'read', title: 'Give a hint for the lesson step', untrusted: true,
      description: 'Returns the next hint for the step the person is on, never the answer. Works only while mentor mode is on; tell the person to switch it on otherwise. Call it only when they ask for help.',
      inputSchema: obj({}), run: () => { const h = lessons.hint(); if (!h.ok) throw Object.assign(new Error(h.why), { code: lessons.mentor() ? 'no_lesson' : 'mentor_off', next: [lessons.mentor() ? 'Ask the person to start a lesson in the Lessons panel.' : 'Ask the person to switch mentor mode on in the Lessons panel.'] }); return h; } },
  ];
}
