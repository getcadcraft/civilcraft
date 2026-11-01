/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-fields.js — field packs in every app (0.8 round 3, session fields_PART_3, FL.0; ADDONS-SPEC § 19): the page side of fields.js. Loaded by app-shell.inc for a
 * build whose manifest says "fields": true (AppBuilds::extras; dev builds only). Reads #cc-fields {app, appName}.
 *
 *   window.ccFields = {
 *     list() → Promise<[{ id, name, summary, today, here: bool }]>    the packs that name this app (from /assets/fields/index.json)
 *     install(id) · remove(id) → Promise                              the pack's own part in this app (lessons, calc templates); its Library items come with
 *                                                                     the account list (Add in the Library), not from here
 *     apply(ids) → Promise                                            the account list says which packs the person has: install the missing, remove the ones it took away
 *     templates() · insert(packId, templateId)                        calc-sheet templates → a sheet in the open document
 *     fields                                                          the engine (fields.js createFields)
 *     open() · close() · toggle()
 *   }
 * Calc sheets and lessons are the shell's own modules (app-calc.js, app-lessons.js); without them the pack says what it could not do. Words: shell.fields.*.
 */
import { createFields, readPack, hostKey, piecesFor, samplesFor, PIECES_NOT_YET } from './fields.js';
import { T, h, readCfg, store, makePanel, palette } from './app-tools-ui.js';

const cfg = readCfg('cc-fields');
if (cfg && cfg.app && !window.ccFields) boot();

function boot() {
  const key = hostKey(cfg.app);
  const slugOf = (id) => id.replace(/^field\./, '');
  const getJson = async (url) => { const r = await fetch(url, { credentials: 'omit' }); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
  const load = (id) => getJson('/assets/fields/' + slugOf(id) + '/pack.json');
  const F = createFields({ app: cfg.app, store, load,
    calc: () => (window.ccCalc && window.ccCalc.calcs ? window.ccCalc.calcs : null), lessons: () => window.ccLessons || null });
  const P = makePanel({ key: 'fields', icon: 'collection', titleKey: 'shell.fields.title', onOpen: () => render() });
  P.btn.title = T('shell.fields.button.title');
  let index = null, say = '';

  const listAll = async () => {
    if (!index) {
      try { index = (await getJson('/assets/fields/index.json')).packs || []; } catch { index = []; }
    }
    return index.filter((p) => key === 'super' || (p.hosts || []).includes(key));
  };
  async function install(id) {
    const r = readPack(await load(id));
    if (!r.ok) { say = T('shell.fields.bad', { why: r.errors[0] || '' }); render(); return r; }
    const d = F.install(r.pack, 'here');
    say = T('shell.fields.installed', { name: r.pack.name, lessons: d.lessons, templates: d.templates, pieces: d.pieces });
    render(); return d;
  }
  function remove(id) { const ok = F.remove(id); say = ok ? T('shell.fields.removed') : ''; render(); return ok; }

  async function render() {
    if (P.panel.hidden) return;
    const packs = await listAll();
    P.sum.textContent = T('shell.fields.sum', { n: F.installed().length });
    const kids = [h('p', { class: 'cct-note', text: T('shell.fields.what') })];
    if (say) kids.push(h('p', { class: 'cct-win', role: 'status', text: say }));
    if (!packs.length) kids.push(h('p', { class: 'cct-empty', text: T('shell.fields.none') }));
    kids.push(h('ul', { class: 'cct-list cct-packs' }, packs.map((p) => {
      const here = F.has(p.id);
      return h('li', { 'data-pack': p.id },
        h('div', { class: 'cct-lesson' }, h('strong', { text: p.name }), ' ', h('small', { text: T('shell.fields.today.' + p.today) })),
        h('p', { class: 'cct-note', text: p.summary }),
        h('div', { class: 'cct-pack-act' },
          h('a', { href: '/library/kits/' + p.id, target: '_blank', rel: 'noopener', text: T('shell.fields.card') }),
          here ? h('button', { type: 'button', class: 'cct-btn', 'data-k': 'remove-' + p.id, onclick: () => remove(p.id) }, T('shell.fields.remove'))
            : h('button', { type: 'button', class: 'cct-btn cct-primary', 'data-k': 'install-' + p.id, onclick: () => install(p.id) }, T('shell.fields.install'))));
    })));
    const tpl = F.templates();
    if (tpl.length) {
      kids.push(h('h3', { class: 'cct-sub', text: T('shell.fields.templates') }));
      kids.push(h('ul', { class: 'cct-list' }, tpl.map((t) => h('li', { 'data-template': t.pack + '/' + t.id },
        h('strong', { text: t.title }), t.about ? h('p', { class: 'cct-note', text: t.about }) : null,
        h('button', { type: 'button', class: 'cct-btn', 'data-k': 'insert-' + t.id, disabled: !window.ccCalc, onclick: () => { const s = F.insert(t.pack, t.id); say = s ? T('shell.fields.inserted', { title: t.title }) : T('shell.fields.nocalc'); render(); } }, T('shell.fields.insert'))))));
    }
    const lists = F.checklists();
    if (lists.length) {
      kids.push(h('h3', { class: 'cct-sub', text: T('shell.fields.checklists') }));
      kids.push(...lists.map((c) => h('div', { 'data-checklist': c.pack + '/' + c.id }, h('strong', { text: c.title }), c.about ? h('p', { class: 'cct-note', text: c.about }) : null,
        h('ul', { class: 'cct-list' }, c.items.map((i) => h('li', {}, h('label', {},
          h('input', { type: 'checkbox', checked: i.done, 'aria-label': T('shell.fields.tick'), 'data-k': 'tick-' + c.id + '-' + i.id, onchange: (ev) => { F.tick(c.pack, c.id, i.id, ev.target.checked); } }), ' ', i.text)))))));
    }
    const tabs = F.tables();
    if (tabs.length) {
      kids.push(h('h3', { class: 'cct-sub', text: T('shell.fields.tables') }));
      kids.push(...tabs.map((t) => h('div', { 'data-table': t.pack + '/' + t.id }, h('strong', { text: t.title }), t.about ? h('p', { class: 'cct-note', text: t.about }) : null,
        h('table', { class: 'cct-table' }, h('thead', {}, h('tr', {}, t.columns.map((c) => h('th', { text: c })))), h('tbody', {}, t.rows.map((r) => h('tr', {}, r.map((c) => h('td', { text: c })))))),
        h('p', { class: 'cct-note', text: (t.source ? T('shell.fields.source', { source: t.source }) + ' ' : '') + (t.confirmed ? '' : T('shell.fields.unconfirmed')) }))));
    }
    kids.push(h('p', { class: 'cct-note', text: T('shell.fields.notyet', { list: Object.values(PIECES_NOT_YET).join(', ') }) }));
    P.body.replaceChildren(...kids);
  }

  const api = {
    fields: F, key,
    list: async () => (await listAll()).map((p) => ({ ...p, here: F.has(p.id) })),
    install, remove: async (id) => remove(id),
    apply: (ids) => F.apply(ids),
    checklists: () => F.checklists(), tick: (p, l, i, on) => F.tick(p, l, i, on), tables: () => F.tables(),
    templates: () => F.templates(), insert: (p, t) => F.insert(p, t),
    pieces: (id) => { const p = F.pack(id); return p ? piecesFor(p, key) : []; },
    samples: (id) => { const p = F.pack(id); return p ? samplesFor(p, key) : []; },
    open() { P.open(); }, close() { P.close(); }, toggle() { P.toggle(); },
  };
  window.ccFields = api;
  F.restore().then(() => render());
  // D-FL2: the account list follows into this app. The one mount of app-addons-account.js's sync until the add-on host owns it: a page that already made
  // window.ccAddonsAccount only gets our hook; signed out or offline, nothing changes. Edition: the browser build (Studio's shell sets window.ccEdition).
  import('./app-addons-account.js').then((m) => {
    const acc = window.ccAddonsAccount || (window.ccAddonsAccount = new m.AddonsAccount({ app: cfg.app, edition: window.ccEdition || 'web', fields: () => window.ccFields }));
    if (!acc.fields) acc.fields = () => window.ccFields;
    if (acc.due()) acc.sync().then(() => render());
  }).catch(() => {});
  palette({ id: 'cc-fields-open', label: T('shell.fields.palette'), group: T('shell.fields.title'), keywords: 'field pack industry kit template calc lesson', run: () => P.toggle() });
  document.dispatchEvent(new CustomEvent('cc-fields-ready'));
}
