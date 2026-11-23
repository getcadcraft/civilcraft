/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-ask.js — the Ask box (round 2, session ai-trust_PART_2, AC.8; map docs/AI-TRUST-SPEC.md § 3): the page side of ai-ask.js. Loaded by app-shell.inc for a build whose manifest says
 * "ai-ask": true (AppBuilds::extras; dev builds only). Reads #cc-ai-ask {app, appName}.
 *
 * A box in the app where the person types a question for the AI they connected. It answers by using this app's tools: through an AI app
 * connected over MCP (the question waits there until the AI picks it up), or through the person's own key / a local model: in CadCraft Studio
 * and SuperCad Studio the engine is Studio's and is passed down to the app (nothing to add); in one app without Studio the "Your own AI key"
 * add-on brings the same engine (owner 2026-11-20). The shell holds no engine; app-ai-ownkey.js is the seam. Plain text only; the box shows which tools were used. Nothing in an answer or a tool result is run or opened.
 *
 *   window.ccAsk = {
 *     attach({ control, context, system, engine, openSettings }) → ask   control = the app's host.control; context() → { document, selection };
 *                                                              system(ctx) → the app's skill-pack text (AC.5); engine = { name, kind, ask | run } (AC.11/AC.7:
 *                                                              ai-ask.js says which shapes); openSettings(path) shows the setting a refused limit names ('caps.dayAmount')
 *     setEngine(engine) · registerTools(control) · ask(text) · open() · close() · toggle() · state()
 *   }
 * Apps that load before this module wait for it: `window.ccAsk ? go() : addEventListener('cc-ask-ready', go, { once: true })`.
 */
import { createAsk, registerTools as askTools, WAIT_SENTENCE } from './ai-ask.js';
import { splitTool } from './ai-activity.js';
import { T, h, readCfg, makePanel, palette } from './app-tools-ui.js';
import { aiStyles } from './app-ai-ui.js';
import { ownEngine, ownState, watchOwn, ownSetup } from './app-ai-ownkey.js';
import { mountAssist } from './app-ai-assist.js';   // bk-r3-assistant-10: model data only, the history ("Why did this happen?"), Report a problem, the step card, the knowledge pack   // the seam for the "Your own AI key" add-on: no provider code in the shell

const cfg = readCfg('cc-ai-ask');
if (cfg && cfg.app && !window.ccAsk) boot();

function boot() {
  aiStyles();
  let ask = null, control = null, off = () => {}, draft = '', toSettings = null, starters = [], offOwn = () => {};
  const assist = mountAssist({ app: cfg.app, appName: cfg.appName });
  let why = null;   // BK.147: the steps shown under "Why did this happen?" (null = not asked)
  assist.on(() => render());
  // AC.5: the tested prompt starters of this app's skill packs, as a gallery under the box (a click fills the box; the person edits and sends). Absent where the packs file is not reachable.
  import('./skill-packs.js').then((m) => { starters = (m.PACKS || []).filter((x) => x.app === cfg.app).flatMap((x) => x.prompts || []); render(); }, () => {});
  const P = makePanel({ key: 'ask', icon: 'chat-dots', titleKey: 'shell.ask.title', buttonKey: 'shell.ask.button', hidden: true, onOpen: () => { render(); const t = P.body.querySelector('textarea'); if (t) t.focus(); } });
  P.btn.title = T('shell.ask.button.title');

  const toolWords = (name) => { const s = splitTool(name); return (s.verb ? s.verb + ' ' : '') + s.area; };
  function stepEl(s) {
    if (s.kind === 'tool') return h('li', { class: 'cct-ask-step ' + (s.ok ? 'is-ok' : 'is-bad') }, h('i', { class: 'bi bi-' + (s.ok ? 'wrench' : 'exclamation-triangle'), 'aria-hidden': 'true' }), ' ', T(s.ok ? 'shell.ask.step.tool' : 'shell.ask.step.tool.bad', { tool: toolWords(s.tool) }), s.text ? h('small', { class: 'cct-err', text: ' ' + s.text }) : null);
    if (s.kind === 'say' || s.kind === 'reply') return h('li', { class: 'cct-ask-step is-say', text: s.text });
    return h('li', { class: 'cct-ask-step is-wait', text: s.kind === 'waiting' ? T('shell.ask.waiting', { who: s.text.replace(/^Waiting for | to pick it up\.$/g, '') }) : s.text });
  }

  function qEl(q) {
    const open = q.state === 'working' || q.state === 'waiting';
    const kids = [h('p', { class: 'cct-ask-q' }, h('strong', { text: T('shell.ask.you') }), ' ', q.text)];
    const steps = q.steps.filter((s) => !(q.state === 'answered' && s.kind === 'reply' && s.text === q.answer));
    if (steps.length) kids.push(h('ul', { class: 'cct-list cct-ask-steps' }, steps.map(stepEl)));
    if (q.state === 'waiting') kids.push(h('p', { class: 'cct-note', 'data-k': 'wait' }, T('shell.ask.wait.hint', { sentence: WAIT_SENTENCE }), ' ',
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'copy', onclick: () => { try { navigator.clipboard.writeText(WAIT_SENTENCE); } catch (e) { /* no clipboard */ } } }, T('shell.ask.copy'))));
    if (q.state === 'answered' && q.answer) kids.push(h('p', { class: 'cct-ask-a', 'data-k': 'answer' }, h('strong', { text: (q.client || T('shell.assistants.someone')) + ': ' }), q.answer));
    if (q.state === 'answered' && q.check && q.check.figures && q.check.figures.length) kids.push(h('p', { class: 'cct-snip ' + (q.check.ok ? 'is-ok' : 'is-warn'), 'data-k': 'figures', role: q.check.ok ? null : 'note',
      text: q.check.ok ? T('shell.ask.figures.ok') : T('shell.ask.figures.bad', { figures: q.check.untraced.slice(0, 8).map((x) => x.text).join(', ') }) }));   // BK.141
    if (q.state === 'failed' || q.state === 'no_route') kids.push(h('p', { class: 'cct-err', role: 'alert', text: q.error }));
    if (q.state === 'failed' && q.partial) kids.push(h('p', { class: 'cct-ask-a', 'data-k': 'partial' }, h('strong', { text: T('shell.ask.partial') + ' ' }), q.partial));
    if (q.state === 'failed' && q.raise && toSettings) kids.push(h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'raise', onclick: () => { try { toSettings(q.raise); } catch (e) { /* the app's own settings */ } } }, T('shell.ask.raise'))));
    if (q.state === 'cancelled') kids.push(h('p', { class: 'cct-snip', text: T('shell.ask.cancelled') }));
    if (open) kids.push(h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'cancel', onclick: () => ask.cancel(q.id) }, T('shell.ask.cancel'))));
    return h('li', { class: 'cct-ask-item is-' + q.state, 'data-q': q.id }, ...kids);
  }

  function render() {
    if (!ask) return;
    const routes = ask.routes();
    const ready = routes.filter((r) => r.ready);
    P.show(!!control && (control.enabled || P.isOpen));
    for (const b of document.querySelectorAll('[data-ask-open]')) b.hidden = !control;   // BK.124: the Help panel's and Help menu's "Ask the assistant"
    if (P.panel.hidden) return;
    const qs = ask.questions();
    P.sum.textContent = ready.length ? (routes[0].ready ? T('shell.ask.via.engine', { name: routes[0].name }) : T('shell.ask.via.queue', { name: routes[1].name })) : '';
    const kids = [];
    if (control && !control.enabled) kids.push(h('p', { class: 'cct-note', 'data-k': 'off', text: T('shell.ask.off', { app: cfg.appName || cfg.app }) }));
    if (!ready.length) kids.push(h('p', { class: 'cct-note', 'data-k': 'noroute', text: T('shell.ask.noroute') }));
    const ownNote = ownKeyNote(); if (ownNote) kids.push(ownNote);
    const kn = assist.knowledge();   // BK.57 / BK.146: the knowledge pack an add-on connected, and whether it is for this app's version (said plainly when not)
    if (kn) kids.push(h('p', { class: 'cct-note' + (kn.match.ok ? '' : ' cct-err'), 'data-k': 'knowledge', 'data-state': kn.match.state, ...(kn.match.ok ? {} : { role: 'alert' }), text: T('shell.assist.knowledge', { version: kn.pack.version }) + ' ' + kn.match.message }));
    const ta = h('textarea', { class: 'cct-in', rows: '3', maxlength: '2000', 'data-k': 'input', placeholder: T('shell.ask.placeholder'), 'aria-label': T('shell.ask.title'), oninput: (e) => { draft = e.target.value; },
      onkeydown: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } } });
    ta.value = draft;
    const fill = (p) => String(p.template || '').replace(/\{\{(\w+)\}\}/g, (m, k) => { const a = (p.arguments || []).find((x) => x.name === k); return a && a.example ? a.example : m; });
    if (starters.length) kids.push(h('details', { class: 'cct-ask-starters', 'data-k': 'starters' }, h('summary', { text: T('shell.ask.starters') }),
      h('ul', { class: 'cct-list' }, starters.map((p) => h('li', {}, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'starter', title: p.description || '', onclick: () => { draft = fill(p); render(); const t = P.body.querySelector('textarea'); if (t) t.focus(); } }, p.title))))));
    kids.push(h('div', { class: 'cct-f' }, ta), h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'send', onclick: send }, T('shell.ask.send')), qs.some((q) => !['working', 'waiting'].includes(q.state)) ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'clear', onclick: () => ask.clear() }, T('shell.ask.clear')) : null));
    // BK.147 "Why did this happen?" and BK.124 / BK.148 "Report a problem": both work with no assistant connected
    kids.push(h('div', { class: 'cct-bar cct-ask-more' },
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'why', title: T('shell.assist.why.title'), onclick: () => { why = assist.why(12); render(); } }, h('i', { class: 'bi bi-clock-history', 'aria-hidden': 'true' }), ' ', T('shell.assist.why')),
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'how', title: T('shell.ask.how.title'), onclick: () => showHow() }, h('i', { class: 'bi bi-signpost-split', 'aria-hidden': 'true' }), ' ', T('shell.ask.how')),
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'report', title: T('shell.assist.report.title'), onclick: () => { assist.report(draft.trim()); } }, h('i', { class: 'bi bi-bug', 'aria-hidden': 'true' }), ' ', T('shell.assist.report'))));
    if (why) kids.push(h('div', { class: 'cct-ask-why', 'data-k': 'why-steps' },
      h('p', { class: 'cct-ask-q' }, h('strong', { text: T('shell.assist.why.h') }), ' ', why.counts.earlier ? T('shell.assist.why.earlier', { n: why.counts.earlier }) : ''),
      why.steps.length ? h('ol', { class: 'cct-list cct-ask-steps' }, why.steps.map((s) => h('li', { class: 'cct-ask-step is-' + s.kind, text: s.text }))) : h('p', { class: 'cct-empty', text: T('shell.assist.why.none') }),
      h('div', { class: 'cct-bar' },
        ready.length ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'why-ask', onclick: () => { draft = T('shell.assist.why.question'); send(); } }, T('shell.assist.why.ask')) : null,
        h('button', { type: 'button', class: 'cct-btn', 'data-k': 'why-close', onclick: () => { why = null; render(); } }, T('shell.assist.why.close')))));
    if (how) kids.push(h('div', { class: 'cct-ask-how', 'data-k': 'how-topics' },
      h('p', { class: 'cct-ask-q', text: how.list.length ? T('shell.ask.how.pick') : T('shell.ask.how.none') }),
      how.list.length ? h('ul', { class: 'cct-list' }, how.list.map((t) => h('li', {}, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'how-topic', 'data-slug': t.slug, title: t.summary || '', onclick: () => startHow(t) }, t.title)))) : null,
      how.error ? h('p', { class: 'cct-err', role: 'alert', text: how.error }) : null));
    if (qs.length) kids.push(h('ol', { class: 'cct-list cct-ask-list', reversed: true }, qs.slice().reverse().map(qEl)));
    kids.push(h('details', { class: 'cct-ask-rules', 'data-k': 'rules' }, h('summary', { text: T('shell.principles.title') }),   // BK.56: the four rules, in plain words
      h('ul', { class: 'cct-list' }, assist.principles.map((p) => h('li', { 'data-rule': p.id, text: T('shell.principles.' + p.id) })))));
    kids.push(h('p', { class: 'cct-note', text: T('shell.ask.note') }));
    P.body.replaceChildren(...kids);
  }

  /**
   * A model the person brings (owner 2026-11-20: AI belongs to the Studios and is passed down to the apps). Inside Studio the engine is
   * Studio's and is already on the page: the only thing left to say is where to set a model up. In one app without Studio the
   * "Your own AI key" add-on brings the same engine and its own set-up. Nothing here calls a provider; with an engine ready there is no note.
   */
  function ownKeyNote() {
    const s = ownState();
    if (s.ready) return null;
    if (s.host) return h('p', { class: 'cct-note', 'data-k': 'ownkey', 'data-state': 'studio' }, h('span', { text: T('shell.ask.studio.setup') }), ' ',
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'ownkey-studio', onclick: () => { try { window.cadcraftStudio.hub(); } catch (e) { /* no hub window */ } } }, T('shell.ask.studio.open')));
    if (!s.inStudio && s.standalone) return h('p', { class: 'cct-note', 'data-k': 'ownkey', 'data-state': 'addon' }, h('span', { text: T('shell.ask.ownkey.setup') }), ' ',
      h('button', { type: 'button', class: 'cct-btn', 'data-k': 'ownkey-setup', onclick: () => { ownSetup(); } }, T('shell.ask.ownkey.setup.open')));
    return null;
  }

  // BK.60 the teacher: no assistant needed. What was typed is searched in the app's own help, ranked with the layout, tool and stage in use.
  let how = null;
  async function showHow() {
    const t = draft.trim();
    how = { list: t ? await assist.how(t) : [], error: '' };
    render();
  }
  function startHow(t) {
    const r = assist.teach(t.scope, t.slug);
    how = r.started ? null : { list: how ? how.list : [], error: r.error ? T('shell.ask.how.nosteps') : '' };
    render();
  }

  async function send() {
    const t = draft.trim(); if (!t || !ask) return;
    draft = '';
    try { await ask.submit(t); } catch (e) { draft = t; }
    render();
  }

  const api = {
    attach(a = {}) {
      off(); control = a.control || null; toSettings = typeof a.openSettings === 'function' ? a.openSettings : null;
      assist.attach({ control, context: a.context });   // the filter is on the control before a question can be asked
      ask = createAsk({ control, engine: a.engine || null, context: () => assist.context(), system: a.system, check: (text, q) => assist.check(text, q) });
      off = ask.on(() => render());
      // AC.11: the person's own model answers the box. Inside Studio the engine is Studio's, passed down to this page (the key stays in the hub);
      // in one app without Studio it is the "Your own AI key" add-on's. app-ai-ownkey.js reads whichever is registered; when it goes, the box drops the engine.
      offOwn();
      if (!a.engine) {
        const useOwn = () => {
          if (!ask) return;
          const e = ownEngine(), mine = !!(ask.engine && ask.engine.kind === 'byok');
          if (e && !mine) ask.setEngine(e); else if (!e && mine) ask.setEngine(null);
          render();
        };
        useOwn(); offOwn = watchOwn(useOwn);
      }
      if (control && typeof control.on === 'function') control.on('change', () => render());
      render(); return ask;
    },
    setEngine(e) { if (ask) ask.setEngine(e); },
    registerTools(c) { return askTools(c, ask); },
    ask(text) { return ask ? ask.submit(text) : Promise.reject(new Error('The Ask box is not attached.')); },
    get box() { return ask; },
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
    state: () => ({ attached: !!ask, open: P.isOpen, questions: ask ? ask.questions().length : 0, routes: ask ? ask.routes() : [] }),
  };
  window.ccAsk = api;
  // BK.124: a Help button opens the assistant. Any [data-ask-open] button (the Help panel carries one) opens this box, with the layout and the tool in the context.
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-ask-open]'); if (b) { e.preventDefault(); P.open(); } });
  window.addEventListener('cc-ask-open', () => P.open());
  palette({ id: 'cc-ask-why', label: T('shell.assist.why'), group: T('shell.ask.title'), keywords: 'why happened history steps undo explain teacher', run: () => { P.open(); why = assist.why(12); render(); } });   // i18n-ignore: search words
  palette({ id: 'cc-ask-open', label: T('shell.ask.palette'), group: T('shell.ask.title'), keywords: 'ask question assistant ai chat', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-ask-ready'));
}
