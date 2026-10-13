/* SPDX-License-Identifier: Apache-2.0 */
/*
 * help-panel.js — the in-app help (docs/HELP-SPEC.md). Loaded by app-shell.inc on every app page.
 * The topics come from the build's own compiled help module, import('app-help') through the
 * build's import map, so they match the version running and work with no connection.
 *
 * Opens with F1 (captured before the app's own keys) or any [data-help-open] button; Esc inside
 * it closes it. It is a side panel, not a dialog: the drawing stays usable beside it. Key and
 * wheel events that start inside the panel stop at its edge, so typing in the search box never
 * reaches the app's command line or shortcuts.
 *
 * window.cadcraftHelp = {open(slug?), close(), toggle()} lets an app open a topic (e.g. a HELP command).
 *
 * Languages (docs/LANG.md § Help): the panel's own words are shell strings (window.ccShellT, app-shell.js); the topics
 * come from help.<locale>.js beside help.js for the page's locale, then its language (es-MX, es), else help.js. A topic
 * still in English in a translated help says so (shell.help.untranslated).
 */
import { detect, apply, describe, search, excerpt, LABELS, label } from './help-core.js';

const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const LOCALE = (window.ccShellT && window.ccShellT.locale()) || document.documentElement.lang || 'en';
const primary = (l) => String(l || 'en').split('-')[0];
/** Links to the website: on the site they are root-relative; the browser edition (static files anywhere) sets
 *  data-site on the panel (https://getcadcraft.com) so /tutorials… still reaches the site. */
const SITE = ((document.querySelector('[data-help-panel]') || { dataset: {} }).dataset.site || '').replace(/\/+$/, '');
const siteHref = (h) => (SITE && h.startsWith('/') ? SITE + h : h);
function siteLinks(scopeEl) {
  if (!SITE) return;
  for (const a of scopeEl.querySelectorAll('a[href^="/"]')) a.setAttribute('href', siteHref(a.getAttribute('href')));
}

const STORE = 'cadcraft.help.ctx';
const root = document.querySelector('[data-help-panel]');
const openers = document.querySelectorAll('[data-help-open]');
let help = null;           // compiled data
const extra = [];          // add-on help: [{scope, name, topics}] (cadcraftHelp.addTopics; assets/js/addons.js)
let loadError = null;
let ctx = loadCtx();       // reader context (null = show every variant)
let history = [];          // [{view, slug, scope, q}]
let returnFocus = null;

function loadCtx() {
  const auto = detect();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved === 'all') return null;
    if (saved && typeof saved === 'object') return { ...auto, os: saved.os || auto.os, browser: saved.browser || auto.browser, input: saved.input || auto.input };
  } catch (_) { /* storage blocked: use detection */ }
  return auto;
}
function saveCtx(v) {
  try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (_) {}
}

function el(tag, attrs, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}

/** help.<l>.js URLs to try for the page's locale: [locale, its language] (never English or the pseudo-locale). Each
 *  file's own ?v= comes from the offline list (#cc-offline) when it is there — the URL "Save for offline" kept —, and a
 *  locale is tried only when its file is listed (so no 404 in the console); without a list (dev shell) it is tried. */
function localeUrls() {
  const chain = [...new Set([LOCALE, primary(LOCALE)])].filter((l) => l && l !== 'en' && l !== 'en-XA');
  if (!chain.length) return [];
  let base;
  try { base = new URL(import.meta.resolve('app-help'), location.href); } catch (_) { return []; }
  let listed = null;
  try { listed = JSON.parse(document.getElementById('cc-offline').textContent).urls || null; } catch (_) { listed = null; }
  const out = [];
  for (const l of chain) {
    const u = new URL('help.' + l + '.js', base);
    if (listed) {
      const hit = listed.find((x) => x.split('?')[0] === u.pathname);
      if (hit) out.push(new URL(hit, location.href).href);
    } else {
      u.search = base.search;
      out.push(u.href);
    }
  }
  return out;
}

async function ensureLoaded() {
  if (help || loadError) return;
  for (const url of localeUrls()) {
    try { help = (await import(url)).default; return; } catch (_) { /* not translated: next, then English */ }
  }
  try {
    help = (await import('app-help')).default;
  } catch (e) {
    loadError = e;
  }
}

/** A section's heading: shell.help.section.<key> when translated, else the compiled (English) name. */
function sectionName(key) {
  const k = 'shell.help.section.' + key;
  const v = T(k);
  return v !== k ? v : (help.sections[key] || '');
}

// ---------------------------------------------------------------- frame

const ui = {};
function build() {
  root.replaceChildren();
  ui.search = el('input', { type: 'search', class: 'help-search', placeholder: T('shell.help.search'), 'aria-label': T('shell.help.search'), autocomplete: 'off', spellcheck: 'false' });
  ui.search.addEventListener('input', () => {
    const q = ui.search.value.trim();
    if (q) show({ view: 'search', q }, true);
    else show({ view: 'index' }, true);
  });
  ui.back = el('button', { type: 'button', class: 'help-icon', 'aria-label': T('shell.help.back'), title: T('shell.help.back'), onclick: back },
    el('i', { class: 'bi bi-arrow-left', 'aria-hidden': 'true' }));
  ui.home = el('button', { type: 'button', class: 'help-icon', 'aria-label': T('shell.help.all_topics'), title: T('shell.help.all_topics'), onclick: () => { ui.search.value = ''; show({ view: 'index' }); } },
    el('i', { class: 'bi bi-list-ul', 'aria-hidden': 'true' }));
  ui.close = el('button', { type: 'button', class: 'help-icon', 'aria-label': T('shell.help.close'), title: T('shell.help.close.title'), onclick: close },
    el('i', { class: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  ui.ctxLine = el('div', { class: 'help-ctx' });
  ui.body = el('div', { class: 'help-body', tabindex: '-1' });
  root.append(
    el('div', { class: 'help-head' },
      el('p', { class: 'help-title', id: 'help-title' }, el('i', { class: 'bi bi-question-circle', 'aria-hidden': 'true' }), ' ' + T('shell.help.title')),
      ui.back, ui.home, ui.close),
    el('div', { class: 'help-tools' }, ui.search),
    ui.ctxLine,
    ui.body,
  );
  root.setAttribute('aria-labelledby', 'help-title');
  renderCtx(false);
}

function renderCtx(expanded) {
  const hadFocus = ui.ctxLine.contains(document.activeElement);
  ui.ctxLine.replaceChildren();
  // Re-rendering removes the focused control; keep focus in the panel so Esc and typing still land here.
  if (hadFocus) queueMicrotask(() => { const f = ui.ctxLine.querySelector('select, button'); (f || ui.body).focus({ preventScroll: true }); });
  if (!expanded) {
    ui.ctxLine.append(
      el('span', { text: ctx ? T('shell.help.ctx.for', { what: describe(ctx) }) : T('shell.help.ctx.all') }), ' ',
      el('button', { type: 'button', class: 'help-link', onclick: () => renderCtx(true) }, T('shell.help.ctx.change')),
    );
    return;
  }
  const cur = ctx || detect();
  const select = (dim, name) => {
    const s = el('select', { 'aria-label': name, class: 'help-select' },
      Object.keys(LABELS[dim]).filter(() => dim !== 'shell').map((k) => el('option', { value: k, selected: cur[dim] === k }, label(dim, k, true))));
    s.addEventListener('change', () => { ctx = { ...(ctx || detect()), [dim]: s.value }; saveCtx({ os: ctx.os, browser: ctx.browser, input: ctx.input }); refresh(); renderCtx(true); });
    return el('label', { class: 'help-field' }, el('span', { text: name }), s);
  };
  ui.ctxLine.append(
    select('os', T('shell.help.ctx.os')), select('browser', T('shell.help.ctx.browser')), select('input', T('shell.help.ctx.input')),
    el('label', { class: 'help-check' },
      el('input', { type: 'checkbox', checked: !ctx, onchange: (e) => { ctx = e.target.checked ? null : detect(); saveCtx(ctx ? null : 'all'); refresh(); renderCtx(true); } }),
      ' ' + T('shell.help.ctx.show_all')),
    el('button', { type: 'button', class: 'help-link', onclick: () => { saveCtx(null); ctx = detect(); refresh(); renderCtx(false); } }, T('shell.help.ctx.this_computer')),
    el('button', { type: 'button', class: 'help-link', onclick: () => renderCtx(false) }, T('shell.help.ctx.done')),
  );
}

function refresh() {
  if (ctx) ctx.net = navigator.onLine === false ? 'offline' : 'online';
  apply(ui.body, ctx);
  root.classList.toggle('is-offline', navigator.onLine === false);
}

// ---------------------------------------------------------------- views

function allTopics() { return extra.length ? help.topics.concat(...extra.map((x) => x.topics)) : help.topics; }
function topicsOf(scope) { return allTopics().filter((t) => t.scope === scope); }
function find(scope, slug) { return allTopics().find((t) => t.scope === scope && t.slug === slug) || null; }
const isAddon = (scope) => extra.some((x) => x.scope === scope);

/** Add an add-on's compiled help ({name, topics: [...]} as bin/build-help.php writes it) under its own heading. The
 *  topics are scoped "addon:<id>" (they have no page on the website). Replaces an earlier call for the same id. */
function addTopics(id, data) {
  if (!data || !Array.isArray(data.topics) || !/^[a-z][a-z0-9.-]{1,63}$/.test(String(id))) return false;
  const scope = 'addon:' + id;
  const topics = data.topics.filter((t) => t && typeof t.slug === 'string' && typeof t.title === 'string' && typeof t.html === 'string')
    .map((t) => ({ ...t, scope, section: t.section || 'reference', summary: String(t.summary || ''), keywords: Array.isArray(t.keywords) ? t.keywords : [],
      headings: Array.isArray(t.headings) ? t.headings : [], text: String(t.text || '') }));
  const at = extra.findIndex((x) => x.scope === scope);
  const entry = { scope, name: String(data.name || id), topics };
  if (at >= 0) extra[at] = entry; else extra.push(entry);
  if (help && !root.hidden) render();
  return true;
}

function show(state, replace = false) {
  if (replace && history.length) history[history.length - 1] = state; else history.push(state);
  render();
}
function back() {
  if (history.length > 1) { history.pop(); render(); }
}

function render() {
  const st = history[history.length - 1] || { view: 'index' };
  ui.back.disabled = history.length < 2;
  ui.body.replaceChildren();
  if (loadError || !help) {
    ui.body.append(el('div', { class: 'help-empty' },
      el('p', { text: T('shell.help.none') }),
      el('p', {}, T('shell.help.none.tutorials') + ' ', el('a', { href: siteHref('/tutorials'), target: '_blank', rel: 'noopener' }, 'getcadcraft.com/tutorials'))));
    return;
  }
  if (st.view === 'topic') renderTopic(st);
  else if (st.view === 'search') renderSearch(st.q);
  else renderIndex();
  refresh();
  ui.body.scrollTop = 0;
  if (st.hash) {
    const target = ui.body.querySelector('#' + CSS.escape(st.hash));
    if (target) target.scrollIntoView({ block: 'start' });
  }
}

function topicLink(t, extra) {
  return el('a', { href: isAddon(t.scope) ? '#' : siteHref('/tutorials/' + t.scope + '/' + t.slug), class: 'help-topic-link', onclick: (e) => { e.preventDefault(); openTopic(t.scope, t.slug); } },
    el('span', { class: 'help-topic-title', text: t.title }),
    el('span', { class: 'help-topic-sum', text: extra || t.summary }));
}

function renderIndex() {
  ui.body.append(el('h2', { class: 'help-h', text: help.name }));
  const own = topicsOf(help.app);
  for (const key of Object.keys(help.sections)) {
    const list = own.filter((t) => t.section === key);
    if (!list.length) continue;
    ui.body.append(el('h3', { class: 'help-sec', text: sectionName(key) }), el('ul', { class: 'help-list' }, list.map((t) => el('li', {}, topicLink(t)))));
  }
  for (const x of extra) {
    if (x.topics.length) ui.body.append(el('h3', { class: 'help-sec', text: T('shell.help.addon', { name: x.name }) }), el('ul', { class: 'help-list' }, x.topics.map((t) => el('li', {}, topicLink(t)))));
  }
  const basics = topicsOf(help.common);
  if (basics.length) {
    ui.body.append(el('h3', { class: 'help-sec', text: T('shell.help.basics') }), el('ul', { class: 'help-list' }, basics.map((t) => el('li', {}, topicLink(t)))));
  }
}

function renderSearch(q) {
  const hits = search(allTopics(), q);
  ui.body.append(el('p', { class: 'help-count', text: hits.length ? T('shell.help.hits', { n: hits.length, q }) : T('shell.help.no_hits', { q }) }));
  if (!hits.length) {
    ui.body.append(el('p', { class: 'help-hint', text: T('shell.help.no_hits.hint') }));
    return;
  }
  ui.body.append(el('ul', { class: 'help-list' }, hits.slice(0, 40).map((t) => el('li', {}, topicLink(t, excerpt(t, q))))));
}

function renderTopic(st) {
  const t = find(st.scope, st.slug);
  if (!t) { renderIndex(); return; }
  const sec = sectionName(t.section);
  const article = el('article', { class: 'help-topic help-content' });
  article.innerHTML = t.html;   // compiled and escaped by Help.php; never built from page input
  wireLinks(article);
  siteLinks(article);
  const list = topicsOf(t.scope);
  const i = list.indexOf(t);
  const prev = list[i - 1], next = list[i + 1];
  ui.body.append(
    el('p', { class: 'help-crumb', text: (t.scope === help.common ? T('shell.help.basics.short') : isAddon(t.scope) ? T('shell.help.addon', { name: extra.find((x) => x.scope === t.scope).name }) : help.name) + (sec ? ' · ' + sec : '') }),
    el('h2', { class: 'help-h', text: t.title }),
    t.lang && primary(t.lang) !== primary(LOCALE) && LOCALE !== 'en-XA' ? el('p', { class: 'help-untranslated', lang: 'en', text: T('shell.help.untranslated') }) : null,
    article,
    el('nav', { class: 'help-pager', 'aria-label': T('shell.help.pager') },
      prev ? el('button', { type: 'button', class: 'help-link', onclick: () => openTopic(prev.scope, prev.slug) }, el('i', { class: 'bi bi-chevron-left', 'aria-hidden': 'true' }), ' ' + prev.title) : el('span'),
      next ? el('button', { type: 'button', class: 'help-link', onclick: () => openTopic(next.scope, next.slug) }, next.title + ' ', el('i', { class: 'bi bi-chevron-right', 'aria-hidden': 'true' })) : el('span')),
    isAddon(t.scope) ? null : el('p', { class: 'help-web' },
      el('a', { href: siteHref('/tutorials/' + t.scope + '/' + t.slug), target: '_blank', rel: 'noopener' }, T('shell.help.web')),
      el('span', { class: 'help-web-off', text: T('shell.help.web.offline') })),
  );
}

function wireLinks(scopeEl) {
  for (const a of scopeEl.querySelectorAll('a[data-topic]')) {
    const [scope, slug] = a.dataset.topic.split('/');
    if (scope === help.app || scope === help.common || isAddon(scope)) {
      a.addEventListener('click', (e) => { e.preventDefault(); openTopic(scope, slug, a.dataset.hash); });
    } else {
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = T('shell.help.link.other_app');
    }
  }
  for (const a of scopeEl.querySelectorAll('a.hx')) a.title = T('shell.help.link.external');
}

function openTopic(scope, slug, hash) {
  show({ view: 'topic', scope, slug, hash: hash || null });
  ui.body.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- open / close

function placeUnderBar() {
  const bar = document.querySelector('.app-bar');
  const r = bar && !(document.body.classList.contains('shell-autohide') && !document.body.classList.contains('shell-reveal')) ? bar.getBoundingClientRect() : null;
  root.style.setProperty('--help-top', (r && r.bottom > 0 ? Math.round(r.bottom) : 0) + 'px');
}

async function open(slug, scope) {
  if (!root.childElementCount) build();
  await ensureLoaded();
  placeUnderBar();
  if (root.hidden) returnFocus = document.activeElement;
  root.hidden = false;
  document.body.classList.add('help-open');
  for (const b of openers) b.setAttribute('aria-expanded', 'true');
  if (slug && scope && help && find(scope, slug)) openTopic(scope, slug);
  else if (slug && help && find(help.app, slug)) openTopic(help.app, slug);
  else if (slug && help && find(help.common, slug)) openTopic(help.common, slug);
  else if (!history.length) show({ view: 'index' });
  else render();
  if (!slug) ui.search.focus();
}

function close() {
  if (root.hidden) return;
  root.hidden = true;
  document.body.classList.remove('help-open');
  for (const b of openers) b.setAttribute('aria-expanded', 'false');
  const f = returnFocus;
  returnFocus = null;
  if (f && document.contains(f) && f !== document.body) { f.blur(); f.focus({ preventScroll: true }); }
}

function toggle() { root.hidden ? open() : close(); }

if (root) {
  for (const b of openers) {
    b.hidden = false;
    b.addEventListener('click', toggle);
  }
  // F1 before the app sees it (capture), and stop the browser's own help page.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F1' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopImmediatePropagation();
      toggle();
    }
  }, true);
  // Esc with nothing focused (focus fell back to the page) closes the panel too; Esc in the app stays the app's.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !root.hidden && (document.activeElement === document.body || document.activeElement === null)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
    }
  }, true);
  // Nothing typed or scrolled in the panel reaches the app.
  for (const type of ['keydown', 'keyup', 'keypress', 'wheel', 'pointerdown', 'pointerup', 'pointermove', 'contextmenu']) {
    root.addEventListener(type, (e) => {
      if (type === 'keydown' && e.key === 'Escape' && !e.defaultPrevented) {
        if (e.target === ui.search && ui.search.value) { ui.search.value = ''; show({ view: 'index' }, true); }
        else close();
        e.preventDefault();
      }
      e.stopPropagation();
    });
  }
  window.addEventListener('online', () => { if (!root.hidden) refresh(); });
  window.addEventListener('offline', () => { if (!root.hidden) refresh(); });
  window.addEventListener('resize', () => { if (!root.hidden) placeUnderBar(); });
  // topics() / load(): the command palette (app-palette.js) searches the topics; load() fetches them without opening.
  const topics = () => (help ? allTopics().map((t) => ({ scope: t.scope, slug: t.slug, title: t.title, summary: t.summary, keywords: t.keywords })) : []);
  window.cadcraftHelp = { open, close, toggle, addTopics, load: ensureLoaded, topics };
}
