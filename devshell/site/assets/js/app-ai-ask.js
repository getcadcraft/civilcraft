/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-ask.js — the Ask box (round 2, session ai-trust_PART_2, AC.8; map docs/AI-TRUST-SPEC.md § 3): the page side of ai-ask.js. Loaded by app-shell.inc for a build whose manifest says
 * "ai-ask": true (AppBuilds::extras; dev builds only). Reads #cc-ai-ask {app, appName}.
 *
 * A box in the app where the person types a question for the AI they connected. It answers by using this app's tools: through an AI app
 * connected over MCP (the question waits there until the AI picks it up), or through the person's own key / a local model when one is set
 * up (the box runs it here). Plain text only; the box shows which tools were used. Nothing in an answer or a tool result is run or opened.
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

const cfg = readCfg('cc-ai-ask');
if (cfg && cfg.app && !window.ccAsk) boot();

function boot() {
  aiStyles();
  let ask = null, control = null, off = () => {}, draft = '', toSettings = null, starters = [];
  // AC.5: the tested prompt starters of this app's skill packs, as a gallery under the box (a click fills the box; the person edits and sends). Absent where the packs file is not reachable.
  import('/assets/js/skill-packs.js').then((m) => { starters = (m.PACKS || []).filter((x) => x.app === cfg.app).flatMap((x) => x.prompts || []); render(); }, () => {});
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
    if (P.panel.hidden) return;
    const qs = ask.questions();
    P.sum.textContent = ready.length ? (routes[0].ready ? T('shell.ask.via.engine', { name: routes[0].name }) : T('shell.ask.via.queue', { name: routes[1].name })) : '';
    const kids = [];
    if (control && !control.enabled) kids.push(h('p', { class: 'cct-note', 'data-k': 'off', text: T('shell.ask.off', { app: cfg.appName || cfg.app }) }));
    if (!ready.length) kids.push(h('p', { class: 'cct-note', 'data-k': 'noroute', text: T('shell.ask.noroute') }));
    const ta = h('textarea', { class: 'cct-in', rows: '3', maxlength: '2000', 'data-k': 'input', placeholder: T('shell.ask.placeholder'), 'aria-label': T('shell.ask.title'), oninput: (e) => { draft = e.target.value; },
      onkeydown: (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } } });
    ta.value = draft;
    const fill = (p) => String(p.template || '').replace(/\{\{(\w+)\}\}/g, (m, k) => { const a = (p.arguments || []).find((x) => x.name === k); return a && a.example ? a.example : m; });
    if (starters.length) kids.push(h('details', { class: 'cct-ask-starters', 'data-k': 'starters' }, h('summary', { text: T('shell.ask.starters') }),
      h('ul', { class: 'cct-list' }, starters.map((p) => h('li', {}, h('button', { type: 'button', class: 'cct-btn', 'data-k': 'starter', title: p.description || '', onclick: () => { draft = fill(p); render(); const t = P.body.querySelector('textarea'); if (t) t.focus(); } }, p.title))))));
    kids.push(h('div', { class: 'cct-f' }, ta), h('div', { class: 'cct-bar' }, h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'send', onclick: send }, T('shell.ask.send')), qs.some((q) => !['working', 'waiting'].includes(q.state)) ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'clear', onclick: () => ask.clear() }, T('shell.ask.clear')) : null));
    if (qs.length) kids.push(h('ol', { class: 'cct-list cct-ask-list', reversed: true }, qs.slice().reverse().map(qEl)));
    kids.push(h('p', { class: 'cct-note', text: T('shell.ask.note') }));
    P.body.replaceChildren(...kids);
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
      ask = createAsk({ control, engine: a.engine || null, context: a.context, system: a.system });
      off = ask.on(() => render());
      // AC.11: inside Studio the person's own model (set up in the hub, Your own AI model) answers the box; the key stays in the hub (app-ai-byok.js)
      if (!a.engine && window.cadcraftStudio) {
        const useOwn = () => import('./app-ai-byok.js').then((m) => { const e = m.studioEngine({ studio: window.cadcraftStudio }); if (e && ask && !(ask.engine && ask.engine.kind === 'byok')) ask.setEngine(e); }, () => {});
        useOwn(); window.addEventListener('storage', (ev) => { if (ev.key === 'cadcraft.studio.byok.settings') useOwn(); });
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
  palette({ id: 'cc-ask-open', label: T('shell.ask.palette'), group: T('shell.ask.title'), keywords: 'ask question assistant ai chat', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-ask-ready'));
}
