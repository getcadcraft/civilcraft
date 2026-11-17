/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol words and tool descriptions; the card's and the box's own words are shell.teach.* in the shell's language file (app-ai-assist.js, app-ai-ask.js). */
/**
 * ai-teacher.js — the teacher (0.10 BK.60; session assistant-10): knows which workspace, tool and project stage the person is in, finds the help
 * topic that answers "how do I ...", and walks them through it one step at a time with the real button marked on the screen. DOM-free, no imports,
 * no model: it reads the app's own compiled help (the same topics F1 shows) and the person's context. An assistant the person connected calls the same
 * two read tools (teach_find, teach_steps) and then guide_show (ai-teach.js) for each step: the card is the same either way. Tested in Node
 * (bin/test-teacher.mjs). The page side (app-ai-assist.js) draws the card with Back and Next and the Ask box (app-ai-ask.js) offers "Show me how".
 *
 *   rankTopics(topics, question, ctx, { limit }) → [{ scope, slug, title, summary, score, why }]     topics: [{ scope, slug, title, summary, keywords, html? }]
 *       ctx = { tool, workspace, stage }  (what the Ask box already sends): a topic that names the tool in use, or suits the stage, ranks higher
 *   stepsOf(html, { keep }) → [{ text, commands: ['WALL'], ui: ['File'] }]     the numbered steps of a topic (help's <ol>), variants for other systems left out
 *   lessonOf(topic, { resolve }) → { title, scope, slug, steps: [{ n, of, text, target? }] }     resolve(typedWord) → command id | null (the app's own registry)
 *   createTeacher({ guide, topics, resolve, context }) → { find(q), start(scope, slug), next(), back(), stop(), active() }
 *   teacherTools({ teacher }) → [teach_find, teach_steps]
 *
 * A step never presses anything: the person does it (ai-teach.js). A step that names a command is marked on its button when the layout in use has one;
 * when it has not, the card says so and the step's own words still tell what to do. Nothing is invented: the steps are the topic's.
 */

export const LIMITS = Object.freeze({ question: 300, topics: 5, steps: 40, text: 500 });
const STOP = new Set('how do does did can could would should i me my we you the a an to of in on at for with and or is are be it this that what where when why which make get use using want need please show tell about from into add create new insert put place go'.split(' '));
const STAGE_WORDS = Object.freeze({
  brief: 'brief requirements program site start new',
  concept: 'concept sketch massing 3d model form',
  'design-development': 'wall door window level room floor stair roof',
  submission: 'permit sheet plot print export pdf submission',
  'working-drawings': 'dimension annotation detail schedule tag sheet text',
  tender: 'schedule quantity takeoff cost export price',
  'close-out': 'asbuilt handover export verified record',
});
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const stem = (w) => w.replace(/(ing|es|s)$/i, (m, x, o) => (o >= 3 ? '' : m));
const words = (s) => String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !STOP.has(w)).map(stem);
const textOf = (html) => stepsText(String(html || '')).slice(0, 4000);
function stepsText(html) { return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' '); }

/** Topics that answer the question, best first. A word of the question counts most in the title, then the keywords, then the summary, then the text. */
export function rankTopics(topics, question, ctx = {}, { limit = LIMITS.topics } = {}) {
  const q = words(clean(question, LIMITS.question));
  if (!q.length || !Array.isArray(topics)) return [];
  const tool = new Set(words(ctx.tool || '')), stage = new Set(words(STAGE_WORDS[ctx.stage_key] || STAGE_WORDS[String(ctx.stage || '').toLowerCase().replace(/\s+/g, '-')] || ''));
  const out = [];
  for (const t of topics) {
    if (!t || !t.slug || !t.title) continue;
    const title = new Set(words(t.title)), kw = new Set(words(t.keywords)), sum = new Set(words(t.summary)), body = t.html ? new Set(words(textOf(t.html))) : new Set();
    let score = 0; const hit = [];
    for (const w of q) {
      const s = title.has(w) ? 4 : kw.has(w) ? 3 : sum.has(w) ? 2 : body.has(w) ? 0.5 : 0;
      if (s) { score += s; hit.push(w); }
    }
    if (!score) continue;
    if (new Set(hit).size === new Set(q).size && q.length > 1) score += 2;   // every word of the question is somewhere in the topic
    let why = 'matches ' + [...new Set(hit)].slice(0, 4).join(', ');
    const names = [...tool].some((w) => title.has(w) || kw.has(w));
    if (names) { score += 3; why += '; about the tool you are using'; }
    const suits = [...stage].some((w) => title.has(w) || kw.has(w));
    if (suits) { score += 2; why += '; suits the ' + ctx.stage + ' stage'; }
    out.push({ scope: t.scope || '', slug: t.slug, title: t.title, summary: t.summary || '', score: Math.round(score * 10) / 10, why });
  }
  out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return out.slice(0, Math.min(LIMITS.topics, Math.max(1, limit)));
}

/**
 * The numbered steps of a compiled help topic: the items of its <ol> lists, in order. Text for another system (a variant block or pick whose data-v
 * `keep` refuses) is left out. {{cmd:NAME}} is <code class="hcmd">NAME</code>, {{ui:Name}} is <span class="hui">Name</span> in the compiled html.
 */
export function stepsOf(html, { keep = () => true } = {}) {
  const src = String(html || '');
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g;
  const stack = [];   // { tag, skip, li, ol }
  const steps = [];
  let li = null, olDepth = 0, m;
  const skipping = () => stack.some((s) => s.skip);
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) {
      if (skipping() || !li) continue;
      const top = stack[stack.length - 1];
      const t = stepsText(m[4]);
      li.text += t;
      if (top && top.cmd) li.commands.push(clean(t, 40));
      if (top && top.ui) li.ui.push(clean(t, 60));
      continue;
    }
    const close = m[1] === '/', tag = m[2].toLowerCase(), attrs = m[3] || '';
    if (/^(br|hr|img|input|wbr)$/.test(tag) || /\/\s*$/.test(attrs)) { if (li && tag === 'br' && !skipping()) li.text += ' '; continue; }
    if (!close) {
      const cls = (/class\s*=\s*"([^"]*)"/.exec(attrs) || [])[1] || '', spec = (/data-v\s*=\s*"([^"]*)"/.exec(attrs) || [])[1] || '';
      const frame = { tag, skip: false, cmd: /\bhcmd\b/.test(cls), ui: /\bhui\b/.test(cls) };
      if (spec && /\b(hv|hpv)\b/.test(cls)) { try { frame.skip = !keep(spec); } catch { frame.skip = false; } }
      if (tag === 'ol') olDepth++;
      if (tag === 'li' && olDepth > 0 && !li) { li = { text: '', commands: [], ui: [], depth: stack.length }; frame.li = true; }
      stack.push(frame);
    } else {
      let i = stack.length - 1; while (i >= 0 && stack[i].tag !== tag) i--;
      if (i < 0) continue;
      const done = stack.splice(i);
      for (const f of done) {
        if (f.tag === 'ol') olDepth = Math.max(0, olDepth - 1);
        if (f.li && li) { const text = clean(li.text, LIMITS.text); if (text) steps.push({ text, commands: [...new Set(li.commands.filter((c) => /^[A-Z][A-Z0-9_]*$/.test(c)))], ui: [...new Set(li.ui)] }); li = null; }
      }
    }
    if (steps.length >= LIMITS.steps) break;
  }
  return steps;
}

/** A lesson: the topic's steps, each with the command to mark when the app's registry knows it. */
export function lessonOf(topic, { resolve = () => null, keep } = {}) {
  const raw = stepsOf(topic && topic.html, { keep });
  const steps = raw.map((s, i) => {
    let target = null;
    for (const name of s.commands) { let id = null; try { id = resolve(name); } catch { id = null; } if (id) { target = { command: String(id) }; break; } }
    return { n: i + 1, of: raw.length, text: s.text, ...(target ? { target } : {}) };
  });
  return { title: clean(topic && topic.title, 80), scope: topic && topic.scope || '', slug: topic && topic.slug || '', steps };
}

export function createTeacher({ guide, topics = () => [], resolve = () => null, context = () => ({}), keep } = {}) {
  let lesson = null, at = 0;
  const listeners = new Set();
  const emit = () => { for (const f of listeners) { try { f(); } catch { /* a listener */ } } };
  const find = (question) => { let ctx = {}; try { ctx = context() || {}; } catch { ctx = {}; } return rankTopics(topics(), question, ctx); };
  const show = () => {
    const s = lesson.steps[at];
    const r = guide.show({ text: s.text, title: lesson.title, step: s.n, of: s.of, ...(s.target ? { target: s.target } : {}) });
    emit(); return r;
  };
  const api = {
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    find,
    /** Starts the lesson of a topic and shows its first step; { started: false, error } when the topic has no numbered steps. */
    start(scope, slug) {
      const t = topics().find((x) => x.slug === slug && (!scope || (x.scope || '') === scope));
      if (!t) return { started: false, error: 'There is no help topic ' + clean(slug, 60) + '.' };
      const l = lessonOf(t, { resolve, keep });
      if (!l.steps.length) return { started: false, error: 'That topic has no numbered steps to walk through: open it in Help instead.', title: l.title };
      lesson = l; at = 0;
      return { started: true, title: l.title, steps: l.steps.length, ...show() };
    },
    next() { if (!lesson) return { shown: false }; if (at + 1 >= lesson.steps.length) { const done = lesson.title; api.stop(); return { shown: false, finished: true, title: done }; } at++; return show(); },
    back() { if (!lesson || at === 0) return { shown: false }; at--; return show(); },
    stop() { if (!lesson) return false; lesson = null; at = 0; guide.close(); emit(); return true; },
    active: () => (lesson ? { title: lesson.title, step: at + 1, of: lesson.steps.length } : null),
    steps: (scope, slug) => { const t = topics().find((x) => x.slug === slug && (!scope || (x.scope || '') === scope)); return t ? lessonOf(t, { resolve, keep }) : null; },
  };
  return api;
}

/** teach_find / teach_steps: for an assistant that walks a person through a task itself (then guide_show, one step at a time). */
export function teacherTools({ teacher }) {
  const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  return [
    { name: 'teach_find', group: 'read', title: 'Find the help topic for "how do I..."',
      description: 'Finds the help topics of this app that answer a question such as "how do I add a door", ranked with what the person is doing now (the layout, the tool in use, the project stage) in mind. Returns each topic\'s scope, slug, title, summary and why it matched. Then call teach_steps for its numbered steps and show them with guide_show, one at a time.',
      inputSchema: obj({ question: { type: 'string', minLength: 1, maxLength: LIMITS.question, description: 'What the person wants to do, in their own words.' } }, ['question']),
      run: (a) => ({ topics: teacher.find(a.question) }) },
    { name: 'teach_steps', group: 'read', title: 'The numbered steps of a help topic',
      description: 'The numbered steps of one help topic, each with the command to mark on screen when this app knows it (target.command, for guide_show). Steps are the help\'s own words: do not add steps of your own that the topic does not have.',
      inputSchema: obj({ scope: { type: 'string', maxLength: 80, description: 'The topic\'s scope from teach_find.' }, slug: { type: 'string', minLength: 1, maxLength: 120, description: 'The topic\'s slug from teach_find.' } }, ['slug']),
      run: (a) => { const l = teacher.steps(a.scope || '', a.slug); if (!l) { const e = new Error('There is no help topic ' + clean(a.slug, 60) + '.'); e.name = 'ToolError'; e.code = 'not_found'; e.next = ['Call teach_find for the topics of this app.']; throw e; } return l; } },
  ];
}
