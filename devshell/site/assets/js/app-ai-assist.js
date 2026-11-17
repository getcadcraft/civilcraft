/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-assist.js — the assistant's entry inside the app (bk-r3-assistant-10): the page side of ai-model-only.js, ai-history.js, ai-teach.js and
 * knowledge-pack.js. Imported by app-ai-ask.js (the Ask box), so it is on every page that has the Ask box; no AI and no network of its own.
 *
 *   BK.124  what goes with a question: the app's file + selection, and now the screen layout, the tool in use and the project stage
 *   BK.145  model data only: every tool result passes the filter before it leaves (host.control.configure({ outgoing, incoming }))
 *   BK.147  "Why did this happen?": this window's history in plain words (the Ask box button, and the tool history_describe)
 *   BK.148  a problem report with the steps, the version and, only when ticked, a model excerpt (app-about.js sends it through /suggest)
 *   BK.168  a step card with the tour's ring on the real button (guide_show / guide_close)
 *   BK.141  the figure ledger (ai-principles.js): an answer's numbers are looked up in the results this window returned
 *   BK.144  every estimate or audit an assistant gets back says whether a person signed it off (ai-signoff.js)
 *   BK.60   the teacher (ai-teacher.js): "how do I ..." finds the help topic for the layout, tool and stage in use and walks it with the card (Back, Next)
 *   BK.57   the knowledge pack an add-on connected, checked against this app's version (knowledge_info / _find / _get)
 *
 *   const assist = mountAssist({ app, appName })      one per page, also window.ccAssist
 *     assist.attach({ control, context })             the Ask box calls it with the app's host.control and its own context()
 *     assist.context()                                → what goes with a question (filtered)
 *     assist.why(limit) → { steps, counts, text }     after reading the app's undo list
 *     assist.report(what)                             opens Report a problem (the About dialog) with the draft
 *     assist.reportParts({ what, steps, excerpt }) → { title, body, file | null, preview }     what app-about.js sends
 *     assist.knowledge() → { pack, match } | null     the connected knowledge pack and whether it fits this app
 *     assist.guide · assist.history · assist.version()
 *
 * What an app may hand over, read at each use (the pattern of window.ccInputHooks):
 *   window.ccHistorySource = { steps() → [label, …] }     its undo list, oldest first (BimCraft and CadCraft do; without it the history has the
 *                                                         commands started through the shell and what assistants did)
 * What an add-on may hand over: globalThis.ccKnowledge = [{ id, index, read(path) → Promise<text> }] and the event 'cc-knowledge' (addons/knowledge-pack).
 * Words: shell.assist.* and shell.guide.* in assets/lang/shell.
 */
import { createModelOnly, contextOnly } from './ai-model-only.js';
import { createHistory, historyTools, reportTools, bugReport, modelExcerpt } from './ai-history.js';
import { createGuide, guideTools } from './ai-teach.js';
import { withSignoff } from './ai-signoff.js';
import { createLedger, withLedger, checkFigures, principleTools, PRINCIPLES } from './ai-principles.js';
import { knowledgeTools, checkKnowledge, FORMAT as KNOWLEDGE_FORMAT } from './knowledge-pack.js';
import { createTeacher, teacherTools } from './ai-teacher.js';
import { detect as helpDetect, parseSpec as helpSpec, matches as helpMatches } from './help-core.js';
import { matchWord } from './app-cmdline.js';
import { T, h, registerTools } from './app-tools-ui.js';

const PANEL_SEL = {
  help: '[data-help-open]', settings: '[data-settings-open]', find: '[data-palette-open]', about: '[data-about-open]',
  ask: '[data-tool-open="ask"]', activity: '[data-tool-open="activity"]', details: '[data-tool-open="docinfo"]', problems: '[data-tool-open="problems"], [data-problems-open]',
  lessons: '[data-tool-open="lessons"], .app-bar-lessons', calc: '[data-tool-open="calc"]', reasons: '[data-tool-open="reasons"]', totals: '[data-tool-open="totals"]', suggest: '[data-tool-open="suggest"]',
};
const visible = (sel) => { let list = []; try { list = document.querySelectorAll(sel); } catch (e) { return null; } for (const el of list) { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return el; } return null; };
const esc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&'));

export function mountAssist({ app, appName }) {
  if (window.ccAssist) return window.ccAssist;
  const filter = createModelOnly();
  const ledger = createLedger();   // BK.141: the numbers of every result the app returned this session (never its words)
  const history = createHistory({});
  let control = null, appContext = null, offCall = () => {}, offTools = () => {}, lastCommand = null;
  const listeners = new Set();
  const changed = () => { for (const fn of listeners) { try { fn(); } catch (e) { /* a listener */ } } };

  // ---- the build's version, as the About box prints it ("0.9", or "dev · 1a2b3c4" in the lab)
  const versionText = () => (document.querySelector('[data-about-version]')?.textContent || '').trim();
  const version = () => { const v = versionText(); return /^\d+\.\d+/.test(v) ? v.split(/\s/)[0] : v ? 'dev' : ''; };

  // ---- history: the commands started through the shell, the app's undo list, the assistants' calls
  const refresh = () => { try { const src = window.ccHistorySource; if (src && typeof src.steps === 'function') history.sync(src.steps()); } catch (e) { /* the app's own trouble */ } };
  window.addEventListener('cc-input-run', (e) => { refresh(); const d = e.detail || {}; lastCommand = { id: d.id, label: d.label || d.id }; history.command(d.id, d.label); });
  let timer = 0;
  const soon = () => { clearTimeout(timer); timer = setTimeout(refresh, 500); };
  for (const type of ['pointerup', 'keyup']) window.addEventListener(type, soon, { capture: true, passive: true });
  setTimeout(refresh, 1500);

  // ---- BK.124: the layout, the tool in use, the stage
  function workspace() {
    try {
      const key = window.ccShellWorkspace && window.ccShellWorkspace.get ? window.ccShellWorkspace.get() : '';
      const eng = window.ccWorkspaceEngine;
      const l = eng && eng.layouts ? eng.layouts().find((x) => x.key === key) : null;
      const style = window.ccInput && window.ccInput.current ? window.ccInput.current() : null;
      const styleName = style ? (style.builtin && typeof style.name === 'string' ? T(style.name) : style.name) : '';
      const known = (k) => { const t = T('shell.ws.' + k); return t === 'shell.ws.' + k ? k : t; };   // the built-in layouts' own names (Settings lists the same)
      return [l && l.name && l.name !== key ? l.name : key ? known(key) : '', styleName && styleName !== (l && l.name) ? styleName : ''].filter(Boolean).join(', ');
    } catch (e) { return ''; }
  }
  function tool() {
    try {
      const cmds = window.ccInput && window.ccInput.commands ? window.ccInput.commands : [];
      const on = (c) => { const el = c.sel ? document.querySelector(c.sel) : null; return !!el && (el.getAttribute('aria-pressed') === 'true' || el.classList.contains('active')) && !/^(view|file|edit|shell)\./.test(c.id); };
      const pressed = cmds.filter(on);
      const pick = (lastCommand && pressed.find((c) => c.id === lastCommand.id)) || pressed[pressed.length - 1] || null;
      if (pick) return cmdName(pick.id);
      return lastCommand ? String(lastCommand.label) : '';
    } catch (e) { return ''; }
  }
  const cmdName = (id) => { try { return (window.ccInput && window.ccInput.labelOf && window.ccInput.labelOf(id)) || id; } catch (e) { return id; } };   // the registry's own name ("Wall"), not a button's hint
  const stage = () => { try { const k = window.ccDocInfo && window.ccDocInfo.info ? window.ccDocInfo.info.get().stage : ''; return k ? T('shell.docinfo.stage.' + k) : ''; } catch (e) { return ''; } };
  function context() {
    let c = {};
    try { c = appContext ? appContext() || {} : {}; } catch (e) { c = {}; }
    return contextOnly({ ...c, workspace: workspace(), tool: tool(), stage: stage() });
  }

  // ---- BK.168: the step card and the ring
  let card = null, marked = null, tick = 0;
  const ring = () => window.cadcraftNewHere && typeof window.cadcraftNewHere.mark === 'function' ? window.cadcraftNewHere : null;
  function mark(el) {
    if (marked && marked !== el) marked.classList.remove('cc-guide-mark');
    marked = el;
    const r = ring();
    if (!el) { if (r) r.unmark(); return; }
    if (r) r.mark(el); else el.classList.add('cc-guide-mark');   // no tour on this page: an outline on the element itself
  }
  function elementOf(t) {
    if (t.kind === 'panel') return visible(PANEL_SEL[t.id] || '');
    if (t.kind === 'command') {
      const id = esc(t.id);
      const c = window.ccInput && window.ccInput.commands ? window.ccInput.commands.find((x) => x.id === t.id) : null;
      return visible('[data-ws-command="' + id + '"]') || visible('[data-tbx-tool="' + id + '"]') || visible('[data-cmd="' + id + '"]') || (c && c.sel ? visible(c.sel) : null);
    }
    return null;
  }
  const labelOf = (el) => (el.getAttribute('aria-label') || el.getAttribute('data-bs-original-title') || el.getAttribute('title') || el.textContent || '').trim().split('\n')[0].slice(0, 120);
  function find(t) {
    if (t.kind === 'object') {
      let ok = false;
      try { ok = !!(window.ccReasons && window.ccReasons.selectElement && window.ccReasons.selectElement({ kind: 'element', id: t.id })); } catch (e) { ok = false; }
      return ok ? { found: true, label: T('shell.guide.selected') } : { found: false, why: 'This app cannot select an object for a step here.' };   // i18n-ignore: the tool's answer to the assistant
    }
    if (t.kind === 'command' && window.ccInput && window.ccInput.commands && !window.ccInput.commands.some((x) => x.id === t.id)) return { found: false, why: 'This app has no command with the id ' + t.id + '.' };   // i18n-ignore: the tool's answer to the assistant
    const el = elementOf(t);
    return el ? { found: true, label: t.kind === 'command' ? cmdName(t.id) : labelOf(el) } : { found: false };
  }
  const guide = createGuide({ find });
  // ---- BK.60: the teacher: the app's own compiled help, ranked with the layout, tool and stage, walked one step at a time
  let topicList = [], topicsLoaded = null;
  const loadTopics = () => topicsLoaded || (topicsLoaded = (async () => { try { const hp = (await import('app-help')).default; topicList = (hp && hp.topics) || []; } catch (e) { topicList = []; } return topicList; })());
  const keepVariant = (spec) => { try { return helpMatches(helpSpec(spec), helpDetect()); } catch (e) { return true; } };
  const resolveWord = (w) => { try { return window.ccInput && window.ccInput.words ? matchWord(w, window.ccInput.words()) : null; } catch (e) { return null; } };
  const teacher = createTeacher({ guide, topics: () => topicList, resolve: resolveWord, context: () => context(), keep: keepVariant });
  function drawGuide() {
    const s = guide.current();
    clearInterval(tick);
    if (!s) { mark(null); if (card) { try { card.hidePopover(); } catch (e) { card.hidden = true; } } changed(); return; }
    if (!card) {
      card = h('aside', { class: 'cc-guide', 'data-guide': true, role: 'status', 'aria-live': 'polite', popover: 'manual' });
      card.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') guide.close(); });
      document.body.append(card);
    }
    card.replaceChildren(
      h('div', { class: 'cc-guide-head' },
        h('strong', { 'data-k': 'title', text: s.title || T('shell.guide.title') }),
        s.step ? h('span', { class: 'cc-guide-n', 'data-k': 'n', text: s.of ? T('shell.guide.step.of', { n: s.step, total: s.of }) : T('shell.guide.step', { n: s.step }) }) : null,
        h('button', { type: 'button', class: 'cct-x', 'data-k': 'close', 'aria-label': T('shell.guide.close'), title: T('shell.guide.close'), onclick: () => guide.close() }, h('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' }))),
      h('p', { class: 'cc-guide-text', 'data-k': 'text', text: s.text }),
      teacher.active() ? h('div', { class: 'cc-guide-nav', 'data-k': 'nav' },
        h('button', { type: 'button', class: 'cct-btn', 'data-k': 'back', disabled: teacher.active().step <= 1, onclick: () => teacher.back() }, T('shell.teach.back')),
        h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'next', onclick: () => teacher.next() }, T(teacher.active().step >= teacher.active().of ? 'shell.teach.done' : 'shell.teach.next'))) : null,
      s.target ? h('p', { class: 'cc-guide-where ' + (s.found ? 'is-found' : 'is-missing'), 'data-k': 'where', text: s.found ? (s.target.kind === 'object' ? T('shell.guide.where.object') : T('shell.guide.where', { what: s.label || s.target.id })) : T('shell.guide.where.missing') }) : null);
    try { if (card.matches(':popover-open')) card.hidePopover(); card.showPopover(); } catch (e) { card.hidden = false; }
    const place = () => { const cur = guide.current(); if (!cur) return; mark(cur.target && cur.target.kind !== 'object' ? elementOf(cur.target) : null); };
    place();
    tick = setInterval(place, 500);   // the layout may move under it (a ribbon tab, a resized window)
    changed();
  }
  guide.on(drawGuide);

  // ---- BK.57 / BK.58: the knowledge pack an add-on connected
  const provider = () => { const l = Array.isArray(globalThis.ccKnowledge) ? globalThis.ccKnowledge : []; return l.find((p) => p && p.index && p.index.format === KNOWLEDGE_FORMAT && typeof p.read === 'function') || null; };
  const knowledge = () => { const p = provider(); return p ? { pack: p.index, match: checkKnowledge(p.index, version(), appName || app) } : null; };
  window.addEventListener('cc-knowledge', changed);

  // ---- BK.148: Report a problem, with the steps
  function report(what) {
    const a = window.cadcraftAbout;
    if (!a || typeof a.open !== 'function') return false;
    a.open({ text: what || '', steps: true });
    return true;
  }
  function facts() { const d = document.querySelector('[data-about]'); return { app: appName || app, edition: document.querySelector('[data-about-edition]')?.textContent.trim() || '', version: versionText() || (d ? '' : ''), browser: navigator.userAgent }; }
  function reportParts({ what = '', steps = true, excerpt = false } = {}) {
    refresh();
    const w = history.why({ limit: 15 });
    const ctx = context();
    let details = null;
    try { details = window.ccDocInfo && window.ccDocInfo.tools ? (window.ccDocInfo.tools().find((t) => t.name === 'docinfo_get').run({}) || {}).facts : null; } catch (e) { details = null; }
    const model = modelExcerpt({ app, version: versionText(), context: ctx, details: details ? { units: details.units, counts: Object.fromEntries((details.counts || []).map((c) => [c.id, c.n])) } : null, steps: w.steps });
    const text = JSON.stringify(model, null, 1);
    const file = excerpt ? new File([text], 'model-excerpt.json', { type: 'application/json' }) : null;
    const r = bugReport({ what, steps: steps ? w.steps : [], facts: facts(), stage: ctx.stage || '', excerpt: file ? { name: file.name, bytes: file.size } : null });
    return { title: r.title, body: r.body, file, preview: { steps: w.text, excerpt: text, count: w.steps.length } };
  }

  const api = {
    app, history, guide, teacher, principles: PRINCIPLES, filter, version, context, knowledge, ledger,
    /** BK.141: an answer's figures against the results (the person's own typed numbers are theirs). */
    check(text, q) { if (q && q.text) ledger.allow(q.text); return checkFigures(text, ledger); },
    get control() { return control; },   // the app's host.control once the Ask box attached (tests and the console)
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    attach(a = {}) {
      offCall(); offTools();
      control = a.control || null; appContext = typeof a.context === 'function' ? a.context : null;
      if (!control) return api;
      // BK.145: before anything can be asked. BK.146: the app says its real version to whoever connects (the lab says "dev").
      control.configure({ outgoing: withSignoff(withLedger(filter.outgoing, ledger), { signoff: (k) => (window.ccDocInfo && window.ccDocInfo.info ? window.ccDocInfo.info.signoff(k) : { signed: false }) }), incoming: filter.incoming, ...(/^\d/.test(version()) ? { version: version() } : {}) });
      offCall = typeof control.on === 'function' ? control.on('call', (e) => { refresh(); if (e && e.tool !== 'history_describe') history.call(e); }) || (() => {}) : () => {};
      const p = { pack: () => (provider() ? provider().index : null), read: (path) => provider().read(path), app, appName: appName || app, appVersion: version };
      offTools = registerTools(control, [...historyTools({ history, refresh }), ...guideTools({ guide }), ...principleTools({ ledger }), ...teacherTools({ teacher: { find: (q) => { return teacher.find(q); }, steps: (sc, sl) => teacher.steps(sc, sl) } }), ...reportTools({ open: report }), ...knowledgeTools(p)]);
      return api;
    },
    /** BK.60: "how do I ...": the help topics that answer it, with this window's layout, tool and stage in mind. */
    async how(question) { await loadTopics(); return teacher.find(question); },
    teach(scope, slug) { return teacher.start(scope, slug); },
    why(limit) { refresh(); return history.why({ limit }); },
    report, reportParts,
  };
  window.ccAssist = api;
  document.dispatchEvent(new CustomEvent('cc-assist-ready'));
  return api;
}
