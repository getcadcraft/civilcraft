/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol words and tool descriptions; the step card's own words are shell.guide.* in the shell's language file (app-ai-assist.js). */
/**
 * ai-teach.js — the teacher's step on screen (BK.168, bk-r3-assistant-10): one step of a task at a time, with the real button, panel or
 * object it is about marked on the screen. DOM-free, no imports; tested in Node (bin/test-teach.mjs). The page side (app-ai-assist.js) draws the
 * card and puts the tour's ring (app-newhere.js) on the target; a lesson, a skill pack recipe or an assistant calls the same two tools.
 *
 *   const guide = createGuide({ find })
 *     find(target) → { found: bool, label?, why? }     the page: is that button / panel / object on screen now, and what is it called
 *   guide.show(step) → { shown, step, of, found, target, label, why }     step = { text, title?, step?, of?, target?: { command | panel | object } }
 *   guide.close() · guide.current() · guide.on(fn)
 *   guideTools({ guide, commands, panels }) → [guide_show, guide_close]
 *
 * A target is exactly one of:
 *   command  a command id of the app's input registry (the knowledge pack's commands/<app>.txt lists them): its button in the layout in use
 *   panel    one of PANELS: a shell panel or its button
 *   object   an element's id as the app's tools return it: the app selects it, so its own highlight marks it
 * A step never presses anything and never changes the document: the person does the step. Text is shown as plain text.
 */

export const PANELS = Object.freeze(['help', 'settings', 'find', 'ask', 'activity', 'details', 'problems', 'lessons', 'calc', 'reasons', 'totals', 'suggest', 'about']);
export const LIMITS = Object.freeze({ text: 600, title: 80, id: 120, steps: 60 });
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);

/** A step as it will be shown, or an Error-like { error } that says what is wrong with it. */
export function cleanStep(a) {
  const s = a && typeof a === 'object' ? a : {};
  const text = clean(s.text, LIMITS.text);
  if (!text) return { error: 'A step needs text: what the person does now, in one or two sentences.' };
  const t = s.target && typeof s.target === 'object' ? s.target : null;
  let target = null;
  if (t) {
    const kinds = ['command', 'panel', 'object'].filter((k) => t[k] !== undefined && t[k] !== null && t[k] !== '');
    if (kinds.length !== 1) return { error: 'A target is exactly one of command, panel or object.' };
    const kind = kinds[0], id = clean(t[kind], LIMITS.id);
    if (kind === 'panel' && !PANELS.includes(id)) return { error: 'panel must be one of: ' + PANELS.join(', ') + '.' };
    if (kind === 'command' && !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/.test(id)) return { error: 'command must be a command id such as model.wall.' };
    target = { kind, id };
  }
  const of = Number.isInteger(s.of) && s.of >= 1 && s.of <= LIMITS.steps ? s.of : null;
  const step = Number.isInteger(s.step) && s.step >= 1 && s.step <= LIMITS.steps ? s.step : null;
  if (of !== null && step !== null && step > of) return { error: 'step cannot be larger than of.' };
  return { text, title: clean(s.title, LIMITS.title), step, of, target };
}

export function createGuide({ find = () => ({ found: false }) } = {}) {
  let cur = null;
  const listeners = new Set();
  const emit = (why) => { for (const fn of listeners) { try { fn(why, cur); } catch { /* a listener */ } } };
  return {
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    current: () => (cur ? { ...cur, target: cur.target ? { ...cur.target } : null } : null),
    show(a) {
      const s = cleanStep(a);
      if (s.error) return { shown: false, error: s.error };
      let hit = { found: false };
      if (s.target) { try { hit = find(s.target) || { found: false }; } catch { hit = { found: false }; } }
      cur = { ...s, found: !!hit.found, label: hit.label ? clean(hit.label, 120) : '', why: hit.found ? '' : s.target ? clean(hit.why || 'It is not on the screen in the layout the person uses now.', 200) : '' };
      emit('show');
      return { shown: true, step: cur.step, of: cur.of, target: cur.target, found: cur.found, label: cur.label, why: cur.why };
    },
    close() { if (!cur) return false; cur = null; emit('close'); return true; },
  };
}

/** guide_show / guide_close: what a teacher (an assistant, a skill pack's recipe) calls to walk a task step by step. */
export function guideTools({ guide }) {
  return [
    { name: 'guide_show', group: 'read', title: 'Show a step on screen',
      description: 'Shows one step of a task to the person in a small card and marks what the step is about on their screen: the button of a command (by its command id), a shell panel, or an object (by its id, which the app selects). It presses nothing and changes nothing: the person does the step, then you show the next one. Returns found: false with the reason when the target is not on screen, so you can say where to look instead. Use guide_close when the task is done.',
      inputSchema: { type: 'object', properties: {
        text: { type: 'string', maxLength: LIMITS.text, description: 'What the person does now, in one or two plain sentences.' },
        title: { type: 'string', maxLength: LIMITS.title, description: 'The task\'s name, shown above the step.' },
        step: { type: 'integer', minimum: 1, maximum: LIMITS.steps, description: 'This step\'s number.' },
        of: { type: 'integer', minimum: 1, maximum: LIMITS.steps, description: 'How many steps the task has.' },
        target: { type: 'object', description: 'What to mark: exactly one of command, panel or object. Leave it out for a step with nothing to point at.', properties: {
          command: { type: 'string', maxLength: LIMITS.id, description: 'A command id of this app, for example model.wall.' },
          panel: { type: 'string', enum: [...PANELS], description: 'A shell panel or its button.' },
          object: { type: 'string', maxLength: LIMITS.id, description: 'An element\'s id as this app\'s tools return it.' },
        }, additionalProperties: false },
      }, required: ['text'], additionalProperties: false },
      run: async (a) => { const r = guide.show(a); if (r.error) { const e = new Error(r.error); e.name = 'ToolError'; e.code = 'invalid_argument'; e.next = ['Read this tool\'s inputSchema and call it again.']; e.retry = 'never'; throw e; } return r; } },
    { name: 'guide_close', group: 'read', title: 'Close the step card',
      description: 'Takes the step card and its mark off the person\'s screen. Call it when the task is done or the person wants to stop. Returns closed: false when no step was showing.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      run: async () => ({ closed: guide.close() }) },
  ];
}
