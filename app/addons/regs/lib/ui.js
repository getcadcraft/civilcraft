/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui.js — the Building regulations add-on's screens, the same in every app (0.8 REG.1 step 4, session `regs_PART_3`; rule 39: one library,
 * a thin adapter per app). BimCraft's add-on is canonical; `node tools/regs/sync.mjs --to …` copies this file byte-identical. It has no app
 * imports: everything the app owns comes in through `host` (the adapter in main.js):
 *
 *   setupRegs(api)             loads the packs, the person's uploads, choices and installed regions (once, before anything asks)
 *   mountRegsUi(api, host)     Settings › <App> › Building regulations (the checkbox tree + upload), Settings › Global › Building regulations
 *                              (regions), the Regulations panel (api.ui.panelTab) with the drawing's own ticks and pinned versions, the
 *                              code summary sheet (HTML) and, when the app has a PDF writer, the report as PDF
 *   host = {
 *     allRows(prof, ctx) → [row]     every check row of one pack profile on the app's model (lib/check.js rows)
 *     ctx() → object | null          what the last check ran on (allRows' second argument); null before the app has checked
 *     hasModel() · modelName() · onModelChange(fn)
 *     drawing: { read() → JSON text | null, write(label, json text) → Promise }   where this drawing keeps its ticks (BimCraft: an IFC
 *                                       property set; CadCraft: the drawing's own data; CivilCraft and DetailCraft: the project file)
 *     lenText(mm) · areaText(m2)     numbers in the person's units
 *     pdf?(markdown, opts) → { bytes }   optional; without it the PDF button is hidden
 *   }
 */
import { loadPacks, listPacks, setActivePacks, activeIds, listedIds, setMode, mode, MODES, profiles, packProfile, onRegsChange, setOwnPacks, addOwnPack, ownPacks,
  setLibraryPacks, setRegions, regions, setDrawing, drawing, packVersion, appMode, removeOwnPack } from './active.js';
import { pinStatus, keepPins, ruleSource, reportMarkdown } from './report.js';
import * as LIB from './library.js';
import { ruleBounds, LEVELS } from './regs.js';

const UPLOAD_MAX = 256 * 1024;   // a pack is a few kB; anything this big is not one

export const pct = (v) => (Math.round(v * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' %';
export const packLabel = (t, p) => p.name + ' (' + t('regs.state.' + p.review.state + '.short') + ')';

const CSS = `
.rg-set { display: grid; gap: .875rem; font-size: .9375rem; line-height: 1.45; }
.rg-hint { margin: 0; color: var(--ink-2); font-size: .875rem; }
.rg-h { margin: .25rem 0 0; font-size: .9375rem; font-weight: 600; }
.rg-tree, .rg-tree ul { list-style: none; margin: 0; padding: 0; }
.rg-tree { border: 1px solid var(--line); }
.rg-tree > li + li { border-top: 1px solid var(--line); }
.rg-tree ul { padding-left: 1.75rem; }
.rg-row { display: flex; align-items: center; gap: .375rem; min-height: 2.25rem; padding: .125rem .5rem .125rem .25rem; }
.rg-row label { display: flex; align-items: center; gap: .5rem; min-width: 0; flex: 1 1 auto; cursor: pointer; }
.rg-row input[type=checkbox] { flex: none; width: 1rem; height: 1rem; margin: 0; }
.rg-name { min-width: 0; overflow-wrap: anywhere; }
.rg-setrow > .rg-row .rg-name { font-weight: 600; }
.rg-pack[data-level="1"] > .rg-row { padding-left: 1.5rem; }
.rg-pack[data-level="2"] > .rg-row { padding-left: 2.75rem; }
.rg-pack[data-level="3"] > .rg-row { padding-left: 4rem; }
.rg-twisty { flex: none; width: 1.75rem; height: 1.75rem; padding: 0; border: 0; background: none; color: var(--ink-2); cursor: pointer; line-height: 1; }
.rg-twisty::before { content: '\\25B8'; display: inline-block; }
@media (prefers-reduced-motion: no-preference) { .rg-twisty::before { transition: transform .1s; } }
.rg-twisty[aria-expanded=true]::before { transform: rotate(90deg); }
.rg-twisty:focus-visible { outline: 2px solid var(--action); outline-offset: -2px; }
.rg-tags { display: flex; flex-wrap: wrap; gap: .25rem; justify-content: flex-end; }
.rg-tag { padding: 0 .375rem; border: 1px solid var(--line); border-radius: var(--radius, 2px); font-size: .75rem; line-height: 1.5; white-space: nowrap; color: var(--ink-2); }
.rg-tag-paid { border-color: var(--layer-ochre, #b7791f); color: var(--ink); }
.rg-tag-own { border-color: var(--layer-blue, #2b6cb0); color: var(--ink); }
.rg-tag-unchecked { border-color: var(--layer-red, #c0392b); }
.rg-tag-reviewed { border-color: var(--layer-green, #2f855a); }
.rg-tag-auth-adopted-law { border-color: var(--layer-green, #2f855a); color: var(--ink); }
.rg-tag-auth-model-code { border-color: var(--layer-blue, #2b6cb0); }
.rg-detail { display: grid; gap: .625rem; margin: 0 .5rem .625rem 2.25rem; }
.rg-state { display: grid; gap: .25rem; margin: 0; padding: .25rem 0 .25rem .875rem; border-left: 3px solid var(--line); }
.rg-state strong { font-size: .875rem; font-weight: 600; }
.rg-state p { margin: 0; color: var(--ink-2); font-size: .8125rem; }
.rg-state-unchecked { border-left-color: var(--layer-red, #c0392b); }
.rg-state-draft { border-left-color: var(--layer-ochre, #b7791f); }
.rg-state-reviewed { border-left-color: var(--layer-green, #2f855a); }
.rg-meta { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: .15rem .875rem; margin: 0; font-size: .8125rem; color: var(--ink-2); }
.rg-meta dt { font-weight: 600; }
.rg-meta dd { margin: 0; overflow-wrap: anywhere; }
.rg-table { width: 100%; border-collapse: collapse; font-size: .8125rem; line-height: 1.35; font-variant-numeric: tabular-nums; }
.rg-table th, .rg-table td { padding: .3rem .5rem; border: 1px solid var(--line); text-align: left; vertical-align: top; }
.rg-table thead th { background: var(--sheet-2, transparent); font-weight: 600; }
.rg-table .rg-nowrap { white-space: nowrap; }
.rg-note { display: block; margin-top: .125rem; color: var(--ink-2); font-size: .75rem; font-weight: 400; }
.rg-mode { display: grid; gap: .25rem; margin: 0; padding: 0; border: 0; }
.rg-mode legend { padding: 0; font-size: .9375rem; font-weight: 600; }
.rg-mode label { display: flex; align-items: baseline; gap: .5rem; font-size: .875rem; }
.rg-upload { display: grid; gap: .5rem; padding-top: .75rem; border-top: 1px solid var(--line); }
.rg-upload input[type=file] { max-width: 100%; font-size: .875rem; }
.rg-msg { margin: 0; font-size: .875rem; }
.rg-msg-bad { color: var(--layer-red, #c0392b); }
.rg-msg ul { margin: .25rem 0 0; padding-left: 1.25rem; }
.rg-remove { justify-self: start; }
.rg-filter { display: grid; gap: .5rem; }
.rg-filter input[type=search] { width: 100%; padding: .375rem .5rem; border: 1px solid var(--line); border-radius: var(--radius, 2px); background: var(--sheet); color: var(--ink); font: inherit; font-size: .875rem; }
.rg-filter input[type=search]::placeholder { color: var(--placeholder, var(--ink-2)); }
.rg-trades { display: flex; flex-wrap: wrap; gap: .25rem; margin: 0; padding: 0; border: 0; }
.rg-trades { align-items: center; }
.rg-trades-l { margin-right: .25rem; font-size: .8125rem; color: var(--ink-2); }
.rg-detail-lean > .rg-state, .rg-detail-lean > .rg-meta { display: none; }
.rg-trades button { min-height: 1.75rem; padding: 0 .625rem; border: 1px solid var(--line); border-radius: var(--radius, 2px); background: none; color: var(--ink); font: inherit; font-size: .8125rem; cursor: pointer; }
.rg-trades button[aria-pressed=true] { border-color: var(--action); background: var(--action); color: var(--on-action, #fff); }
.rg-trades button:focus-visible, .rg-filter input:focus-visible { outline: 2px solid var(--action); outline-offset: 1px; }
.rg-table tbody th { padding: .375rem .5rem .25rem; font-size: .75rem; font-weight: 600; color: var(--ink-2); background: var(--sheet-2, transparent); }
.rg-group > .rg-row .rg-name { color: var(--ink-2); font-size: .8125rem; font-weight: 600; }
.rg-filter-compact .rg-trades button { min-height: 1.5rem; padding: 0 .375rem; font-size: .75rem; }
.rg-filter-compact .rg-trades-l { flex: 1 0 100%; font-size: .75rem; }
.rg-filter-compact input[type=search] { font-size: .8125rem; }
.rg-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.rg-count { font-size: .8125rem; color: var(--ink-2); margin: 0; }
/* the Regulations panel is narrow: names get the room, tags wrap under them */
.rg-tree[data-regs-panel] ul { padding-left: .5rem; }
.rg-tree[data-regs-panel] .rg-row { flex-wrap: wrap; row-gap: .125rem; }
.rg-tree[data-regs-panel] .rg-row label { flex: 1 1 10rem; }
.rg-tree[data-regs-panel] .rg-tags { flex: 1 0 100%; justify-content: flex-start; padding-left: 3.75rem; }
.rg-tree[data-regs-panel] .rg-pack[data-level="1"] > .rg-row { padding-left: 2rem; }
.rg-tree[data-regs-panel] .rg-note { display: block; }
`;

const BUILDING_TRADES = ['stair', 'room', 'egress', 'elec', 'found', 'frame', 'energy'];   // the filter buttons BimCraft has always had; an app passes host.trades for its own
/** Rule trades, for the filter buttons and the groups in a pack's rule table (by rule id prefix, lib/regs.js RULES) */
const TRADES = [['stair', /^stair\./], ['room', /^(room|hall)\./], ['egress', /^(door|escape)\./], ['elec', /^(elec|alarm)\./], ['found', /^found\./], ['frame', /^frame\./], ['energy', /^energy\./], ['drawing', /^draw\./], ['zone', /^zone\./], ['road', /^road\./], ['conn', /^conn\./]];

/** Load the packs and the person's choices (through ONE place, lib/active.js); installed regions follow the Library. */
export async function setupRegs(api) {
  await loadPacks({ base: api.url('packs/') });
  setOwnPacks(api.storage.get('own'));
  setMode(api.storage.get('mode'));
  const on = api.storage.get('on'), old = api.storage.get('pack');   // 'pack' = the first slice's single choice
  setActivePacks(Array.isArray(on) ? on : (typeof old === 'string' ? [old] : null));
  const fromStore = () => { setLibraryPacks(LIB.installedPacks()); setRegions(LIB.regionCodes()); };
  fromStore();
  api.onDeactivate(LIB.onExternalChange(fromStore));
  // installed regions follow the Library by themselves (every 6 h for every app; every start in the lab, where packs change all day)
}

export function mountRegsUi(api, host) {
  const t = api.t;
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (v === false || v === null || v === undefined) continue; e.setAttribute(k, v === true ? '' : String(v)); }
    for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
    return e;
  };
  const style = h('style', { 'data-addon-style': 'regs' }, CSS);
  document.head.append(style);
  api.onDeactivate(() => style.remove());

  const label = (p) => packLabel(t, p);
  const save = () => { api.storage.set('on', listedIds()); };
  const fromStore = () => { setLibraryPacks(LIB.installedPacks()); setRegions(LIB.regionCodes()); };
  const lang = () => document.documentElement.lang || 'en';
  const packsN = (n) => (n === 1 ? t('regs.set.one') : t('regs.set.count', { n }));
  const rulesN = (n) => (n === 1 ? t('regs.rg.rule1') : t('regs.rg.rules', { n }));
  const money = (pr) => { try { return new Intl.NumberFormat(lang(), { style: 'currency', currency: pr.currency }).format(pr.amount); } catch (e) { return pr.amount + ' ' + pr.currency; } };
  const place = (code, fallback) => { try { return new Intl.DisplayNames([lang()], { type: 'region' }).of(code) || fallback || code; } catch (e) { return fallback || code; } };
  // ---- the filter, shared by the Settings tree and the Regulations panel (owner 2026-10-27): words match places, packs, rules and
  // clauses; a trade keeps only that trade's rules (and the packs that have any)
  const norm = (x) => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tradeOf = (id) => (TRADES.find(([, re]) => re.test(id)) || ['other'])[0];
  /** What a filter { q, trade } keeps of pack p with rules `all`: null = hidden; else { shown (rules to list; null = all), openIt (open at them) } */
  const keepPack = (p, all, { q, trade }) => {
    if (!q && !trade) return { shown: null, openIt: false };
    const byTrade = trade ? all.filter((r) => tradeOf(r.id) === trade) : all;
    if (!byTrade.length) return null;
    const words = q.split(/\s+/).filter(Boolean);
    const hay = norm([p.name, p.id, p.edition, p.jurisdiction.name, p.jurisdiction.region, place(p.jurisdiction.country)].join(' '));
    if (words.every((w) => hay.includes(w))) return { shown: byTrade, openIt: !!trade && !q };
    const hits = byTrade.filter((r) => { const rt = norm([r.label, r.clause, r.id, r.note].join(' ')); return words.every((w) => hay.includes(w) || rt.includes(w)) && words.some((w) => rt.includes(w)); });
    return hits.length ? { shown: hits, openIt: true } : null;
  };
  /** The filter box + trade buttons; onChange({ q, trade }) on every change. → { el, count (the status line), state } */
  let fuid = 0;
  const filterBar = (onChange, { compact = false } = {}) => {
    const st = { q: '', trade: '' }, id = 'rg-filter-' + (++fuid);
    const search = h('input', { type: 'search', id, 'data-regs-filter': true, placeholder: t(compact ? 'regs.f.ph.short' : 'regs.f.ph'), autocomplete: 'off', 'aria-describedby': id + '-n' });
    const trades = h('div', { class: 'rg-trades', role: 'group', 'aria-label': t('regs.f.trade'), 'data-regs-trades': true }, h('span', { class: 'rg-trades-l' }, t('regs.f.trade')),
      ['', ...TRADES.map(([k]) => k).filter((k) => (host.trades || BUILDING_TRADES).includes(k))].map((k) => h('button', { type: 'button', 'data-regs-trade': k, 'aria-pressed': String(k === '') }, t('regs.trade.' + (k || 'all')))));
    const count = h('p', { class: 'rg-count', id: id + '-n', role: 'status', 'data-regs-filter-count': true });
    search.addEventListener('input', () => { st.q = norm(search.value).trim(); onChange(st); });
    trades.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-regs-trade]');
      if (!b) return;
      st.trade = b.dataset.regsTrade;
      for (const x of trades.querySelectorAll('[data-regs-trade]')) x.setAttribute('aria-pressed', String(x === b));
      onChange(st);
    });
    return { el: h('div', { class: 'rg-filter' + (compact ? ' rg-filter-compact' : '') }, h('label', { for: id, class: 'rg-sr' }, t('regs.f.label')), search, trades, count), count, state: st };
  };


  // ---- Settings › BimCraft › Building regulations
  api.ui.settingsSection({
    id: 'regs',
    title: t('regs.legend'),
    render(fs) {
      const opened = new Set();   // the sets and packs the person opened; a repaint keeps them open
      const tree = h('ul', { class: 'rg-tree', 'data-regs-tree': true, 'aria-label': t('regs.tree') });
      const empty = h('p', { class: 'rg-hint', 'data-regs-empty': true, hidden: true }, t('regs.none'));
      const modeBox = h('fieldset', { class: 'rg-mode', 'data-regs-mode': true }, h('legend', {}, t('regs.mode.legend')),
        MODES.map((m) => h('label', {}, h('input', { type: 'radio', name: 'rg-mode', value: m, 'data-regs-mode-pick': m }), t('regs.mode.' + m))));
      const file = h('input', { type: 'file', id: 'rg-upload', accept: '.json,application/json', 'data-regs-upload': true });
      const msg = h('div', { class: 'rg-msg', role: 'status', 'data-regs-upload-msg': true });
      // filter (owner 2026-10-27: "filter down the tree to get to … the packs"): words match places, packs, rules and clauses; the trade
      // buttons keep only rules of one trade (and the packs that have any)
      const fb = filterBar(() => paint()), count = fb.count, F = fb.state;
      fs.append(h('div', { class: 'rg-set' },
        h('p', { class: 'rg-hint' }, t('regs.hint')),
        fb.el,
        tree, empty, modeBox,
        h('div', { class: 'rg-upload', 'data-regs-upload-box': true },
          h('h3', { class: 'rg-h' }, t('regs.up.title')),
          h('p', { class: 'rg-hint' }, t('regs.up.hint')),
          h('label', { for: 'rg-upload', class: 'rg-hint' }, t('regs.up.pick')), file, msg)));

      modeBox.addEventListener('change', (ev) => { if (ev.target.name === 'rg-mode') { setMode(ev.target.value); api.storage.set('mode', ev.target.value); } });
      file.addEventListener('change', async () => {
        const f = file.files && file.files[0];
        file.value = '';
        if (!f) return;
        const say = (text, bad, list) => msg.replaceChildren(...[h('p', { class: 'rg-msg' + (bad ? ' rg-msg-bad' : '') }, text), list && list.length ? h('ul', {}, list.slice(0, 12).map((x) => h('li', {}, x))) : null].filter(Boolean));
        if (f.size > UPLOAD_MAX) return say(t('regs.up.big'), true);
        let raw;
        try { raw = JSON.parse(await f.text()); } catch (e) { return say(t('regs.up.json'), true); }
        const r = addOwnPack(raw);
        if (!r.ok) return say(t('regs.up.bad'), true, r.errors);
        api.storage.set('own', ownPacks());
        setActivePacks([...new Set([...listedIds(), r.pack.id])]);
        save();
        opened.add('set:' + r.pack.jurisdiction.country);
        say(t('regs.up.ok', { name: r.pack.name }));
      });

      const fmt = (v, unit) => (unit === 'pct' ? pct(v) : unit === 'm2' ? host.areaText(v) : unit === 'count' ? String(Math.round(v)) : unit === 'ratio' ? String(Math.round(v * 100) / 100) : unit === 'r' ? 'R-' + (Math.round(v * 10) / 10) : unit === 'u' ? 'U-' + (Math.round(v * 100) / 100) : host.lenText(v));
      const limit = (r) => {
        const b = ruleBounds(r);
        if (r.op === 'between') return t('regs.op.between', { a: fmt(b.min, r.unit), b: fmt(b.max, r.unit) });
        return t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmt(r.value, r.unit) });
      };
      let uid = 0;
      const twisty = (key, controls) => {
        const b = h('button', { type: 'button', class: 'rg-twisty', 'aria-expanded': String(opened.has(key)), 'aria-controls': controls, 'aria-label': t('regs.open') });
        b.addEventListener('click', () => {
          const open = b.getAttribute('aria-expanded') !== 'true';
          b.setAttribute('aria-expanded', String(open));
          document.getElementById(controls).hidden = !open;
          if (open) opened.add(key); else opened.delete(key);
        });
        return b;
      };
      const packRow = (p, ticked, { shown = null, openIt = false, kids = [] } = {}) => {
        const key = 'pack:' + p.id, did = 'rg-d-' + (++uid);
        const rules = shown || p.rulesList || [];
        if (openIt) opened.add(key);
        const groups = TRADES.map(([k, re]) => [k, rules.filter((r) => re.test(r.id))]).filter(([, l]) => l.length);
        const other = rules.filter((r) => !TRADES.some(([, re]) => re.test(r.id)));
        if (other.length) groups.push(['other', other]);
        const ruleTr = (r) => h('tr', { 'data-regs-rule': r.id },
          h('td', {}, r.label, r.note ? h('span', { class: 'rg-note' }, r.note) : null),
          h('td', { class: 'rg-nowrap' }, r.clause || '–'),
          h('td', { class: 'rg-nowrap' }, limit(r)));
        const meta = [
          [t('regs.meta.edition'), p.edition],
          [t('regs.meta.authority'), p.authority ? t('regs.auth.' + p.authority) : ''],
          [t('regs.meta.inforce'), p.in_force || ''],
          [t('regs.meta.source'), p.source && p.source.name ? (p.source.url ? h('a', { href: p.source.url, target: '_blank', rel: 'noopener' }, p.source.name) : p.source.name) : ''],
          [t('regs.meta.sourcedate'), p.source && p.source.date],
          [t('regs.meta.checked'), p.source && p.source.checked],
          [t('regs.meta.maker'), p.maker && p.maker.name],
          [t('regs.meta.base'), p.base ? (listPacks().find((x) => x.id === p.base) || { name: p.base }).name : ''],
          [t('regs.meta.price'), p.price ? h('span', {}, money(p.price), ' · ', h('a', { href: p.price.url, target: '_blank', rel: 'noopener', 'data-regs-buy': p.id }, t('regs.buy'))) : ''],
        ].filter(([, v]) => v);
        const detail = h('div', { class: 'rg-detail' + (shown && (F.q || F.trade) ? ' rg-detail-lean' : ''), id: did, hidden: !opened.has(key), 'data-regs-detail': p.id },
          h('div', { class: 'rg-state rg-state-' + p.review.state, 'data-regs-state': p.review.state },
            h('strong', {}, t(p.own ? 'regs.state.own' : 'regs.state.' + p.review.state)), p.review.note ? h('p', {}, p.review.note) : null),
          meta.length ? h('dl', { class: 'rg-meta' }, meta.flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])) : null,
          rules.length ? h('table', { class: 'rg-table', 'data-regs-rules': p.id },
            h('caption', { class: 'rg-h', style: 'text-align:left;caption-side:top' }, rules.length === (p.rulesList || []).length ? t('regs.rules', { n: rules.length }) : t('regs.rules.some', { n: rules.length, all: (p.rulesList || []).length })),
            h('thead', {}, h('tr', {}, h('th', {}, t('regs.col.rule')), h('th', { class: 'rg-nowrap' }, t('regs.col.clause')), h('th', { class: 'rg-nowrap' }, t('regs.col.required')))),
            groups.length > 1 ? groups.map(([k, l]) => h('tbody', { 'data-regs-group': k }, h('tr', {}, h('th', { colspan: 3, scope: 'colgroup' }, t('regs.trade.' + k))), l.map(ruleTr)))
              : h('tbody', {}, rules.map(ruleTr))) : null,
          p.own ? h('button', { type: 'button', class: 'btn-line btn-sm-cc rg-remove', 'data-regs-remove': p.id }, t('regs.up.remove')) : null);
        const box = h('input', { type: 'checkbox', 'data-regs-on': p.id, checked: ticked });
        return h('li', { class: 'rg-pack', 'data-regs-pack': p.id, 'data-level': p.level },
          h('div', { class: 'rg-row' }, twisty(key, did), h('label', {}, box, h('span', { class: 'rg-name' }, p.name)),
            h('span', { class: 'rg-tags' },
              kids.length ? h('span', { class: 'rg-tag', 'data-regs-tag': 'kids' }, t('regs.f.kids', { n: kids.length })) : null,
              p.own ? h('span', { class: 'rg-tag rg-tag-own', 'data-regs-tag': 'own' }, t('regs.tag.own')) : null,
              p.from === 'library' ? h('span', { class: 'rg-tag', 'data-regs-tag': 'library' }, t('regs.tag.library', { v: p.version || 1 })) : null,
              p.authority ? h('span', { class: 'rg-tag rg-tag-auth-' + p.authority, 'data-regs-tag': 'authority' }, t('regs.auth.' + p.authority)) : null,
              h('span', { class: 'rg-tag rg-tag-' + p.review.state }, t('regs.state.' + p.review.state + '.short')),
              p.price ? h('span', { class: 'rg-tag rg-tag-paid', 'data-regs-tag': 'paid' }, t('regs.tag.paid', { price: money(p.price) })) : null)),
          detail, kids.length ? h('ul', { 'data-regs-kids': p.id }, kids) : null);
      };
      const keep = (p) => keepPack(p, p.rulesList || [], F);

      const paint = () => {
        const packs = listPacks(), ids = new Set(listedIds());
        for (const r of modeBox.querySelectorAll('input')) r.checked = r.value === appMode();
        if (!packs.length) { tree.replaceChildren(h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.5rem', 'data-regs-noregions': regions() !== null }, t(regions() !== null ? 'regs.noregions' : loadProblems().length ? 'regs.unavailable' : 'regs.loading')))); empty.hidden = true; return; }
        const sets = new Map();
        for (const p of packs) {
          const c = p.jurisdiction.country;
          if (!sets.has(c)) sets.set(c, []);
          const lv = Math.max(0, LEVELS.indexOf(p.jurisdiction.level));
          sets.get(c).push({ ...p, level: lv, at: sets.get(c).length, rulesList: packProfile(p.id)?.list() || [] });   // its own rules and those it builds on
        }
        const filtering = !!(F.q || F.trade);
        let shownN = 0, allN = 0;
        const items = [...sets.entries()].sort((a, b) => place(a[0]).localeCompare(place(b[0]), lang())).map(([country, list]) => {
          list.sort((a, b) => a.level - b.level || Number(a.own) - Number(b.own) || a.at - b.at);   // country first, then lower levels; the library's order within
          allN += list.length;
          // a state's city and county packs sit under it (same region); a place whose state has no pack stays at the top
          const kept = new Map(list.map((p) => [p.id, keep(p)]));
          const stateOf = (p) => (p.level >= 2 ? list.find((x) => x.level === 1 && x.jurisdiction.region && x.jurisdiction.region === p.jurisdiction.region) : null);
          const kidsOf = new Map();
          for (const p of list) { const st = stateOf(p); if (st) { if (!kidsOf.has(st.id)) kidsOf.set(st.id, []); kidsOf.get(st.id).push(p); } }
          const rowOf = (p) => {
            const kids = (kidsOf.get(p.id) || []).map(rowOf).filter(Boolean);
            const k = kept.get(p.id);
            if (!k && !kids.length) return null;
            if (k) shownN++;
            return packRow(p, ids.has(p.id), { shown: k ? k.shown : [], openIt: !!(k && k.openIt), kids });
          };
          const rows = list.filter((p) => !stateOf(p)).map(rowOf).filter(Boolean);
          if (filtering && !rows.length) return null;
          const key = 'set:' + country, sid = 'rg-s-' + (++uid);
          if (!opened.has('seen:' + key)) { opened.add('seen:' + key); if (list.some((p) => ids.has(p.id)) || list.length > 1) opened.add(key); }
          if (filtering) opened.add(key);
          const n = list.filter((p) => ids.has(p.id)).length, paid = list.filter((p) => p.price).length;
          const box = h('input', { type: 'checkbox', 'data-regs-seton': country, checked: n === list.length });
          box.indeterminate = n > 0 && n < list.length;
          const countryPack = list.find((p) => p.level === 0);
          return h('li', { class: 'rg-setrow', 'data-regs-set': country },
            h('div', { class: 'rg-row' }, twisty(key, sid), h('label', {}, box, h('span', { class: 'rg-name' }, place(country, countryPack && countryPack.jurisdiction.name))),
              h('span', { class: 'rg-tags' },
                h('span', { class: 'rg-tag' }, packsN(list.length)),
                paid ? h('span', { class: 'rg-tag rg-tag-paid', 'data-regs-tag': 'paid-set' }, t('regs.set.paid', { n: paid })) : null)),
            h('ul', { id: sid, hidden: !opened.has(key) }, rows));
        }).filter(Boolean);
        tree.replaceChildren(...(items.length ? items : [h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.5rem', 'data-regs-filter-none': true }, t('regs.f.none')))]));
        count.textContent = filtering ? t('regs.f.count', { n: shownN, all: allN }) : t('regs.f.total', { all: allN });
        empty.hidden = ids.size > 0;
      };
      tree.addEventListener('change', (ev) => {
        const el = ev.target;
        const ids = new Set(listedIds());
        if (el.dataset.regsOn) { if (el.checked) ids.add(el.dataset.regsOn); else ids.delete(el.dataset.regsOn); }
        else if (el.dataset.regsSeton) {
          for (const p of listPacks()) if (p.jurisdiction.country === el.dataset.regsSeton) { if (el.checked) ids.add(p.id); else ids.delete(p.id); }
        } else return;
        setActivePacks([...ids]);
        save();
      });
      tree.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-regs-remove]');
        if (!b) return;
        removeOwnPack(b.dataset.regsRemove);
        api.storage.set('own', ownPacks());
        save();
        msg.replaceChildren(h('p', { class: 'rg-msg' }, t('regs.up.removed')));
      });
      paint();
      const stop = onRegsChange(paint);
      api.onDeactivate(stop);
    },
    reset() { api.storage.remove('on'); api.storage.remove('pack'); api.storage.remove('mode'); setMode('each'); setActivePacks(null); },
  });

  // ---- Settings › Global › Building regulations (owner decision 8): the regions installed from the CadCraft Library, once for every app.
  // A tree: each country a checkbox (ticked = installed on this computer), opening to the packs the Library has for it.
  api.ui.settingsSection({
    id: 'regs-regions',
    scope: 'global',
    title: t('regs.legend'),
    render(fs) {
      const opened = new Set(), rowsOf = new Map();   // country → the Library's pack rows (loaded when it opens)
      let list = null, offline = false, busy = false;
      const tree = h('ul', { class: 'rg-tree', 'data-regs-regions': true, 'aria-label': t('regs.rg.tree') });
      const msg = h('div', { class: 'rg-msg', role: 'status', 'data-regs-regions-msg': true });
      const upd = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-regs-update': true }, t('regs.rg.update'));
      fs.append(h('div', { class: 'rg-set' }, h('p', { class: 'rg-hint' }, t('regs.rg.hint')), tree, h('div', { class: 'rg-row', style: 'padding:0' }, upd), msg));
      const say = (text, bad, more) => msg.replaceChildren(...[h('p', { class: 'rg-msg' + (bad ? ' rg-msg-bad' : '') }, text), more && more.length ? h('ul', {}, more.slice(0, 8).map((x) => h('li', {}, x))) : null].filter(Boolean));
      const kb = (n) => (n < 1024 ? n + ' B' : Math.round(n / 102.4) / 10 + ' KB');
      let uid = 0;
      const paint = () => {
        const inst = LIB.installed();
        const codes = new Set([...(list || []).map((c) => c.country), ...Object.keys(inst)]);
        if (!codes.size) { tree.replaceChildren(h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.5rem' }, t(list === null && !offline ? 'regs.rg.loading' : 'regs.rg.none')))); return; }
        const byCode = new Map((list || []).map((c) => [c.country, c]));
        tree.replaceChildren(...[...codes].sort((a, b) => place(a).localeCompare(place(b), lang())).map((cc) => {
          const c = byCode.get(cc), here = inst[cc], key = 'rg:' + cc, sid = 'rg-r-' + (++uid);
          const box = h('input', { type: 'checkbox', 'data-regs-region': cc, checked: !!here, disabled: busy || (!c && !here) });
          const tw = h('button', { type: 'button', class: 'rg-twisty', 'aria-expanded': String(opened.has(key)), 'aria-controls': sid, 'aria-label': t('regs.open') });
          const sub = h('ul', { id: sid, hidden: !opened.has(key) });
          const fill = () => {
            const rows = rowsOf.get(cc) || (here ? here.packs.map((x) => ({ name: x.pack.name, level: x.pack.jurisdiction.level, review: x.pack.review.state, rules: x.pack.rules.length, price: x.pack.price, version: x.version, authority: x.pack.authority, in_force: x.pack.in_force })) : null);
            sub.replaceChildren(...(rows ? rows.map((r) => h('li', { class: 'rg-pack', 'data-level': Math.max(0, ['country', 'state', 'county', 'city'].indexOf(r.level)), 'data-regs-region-pack': r.pack_id || '' },
              h('div', { class: 'rg-row' }, h('span', { class: 'rg-name', style: 'padding-left:1.75rem' }, r.name),
                h('span', { class: 'rg-tags' },
                  r.authority ? h('span', { class: 'rg-tag rg-tag-auth-' + r.authority }, t('regs.auth.' + r.authority)) : null,
                  r.in_force ? h('span', { class: 'rg-tag' }, t('regs.rg.inforce', { date: r.in_force })) : null,
                  h('span', { class: 'rg-tag' }, rulesN(r.rules)),
                  h('span', { class: 'rg-tag rg-tag-' + r.review }, t('regs.state.' + r.review + '.short')),
                  r.price ? h('span', { class: 'rg-tag rg-tag-paid', 'data-regs-tag': 'paid' }, t('regs.tag.paid', { price: money(r.price) })) : null))))
              : [h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.25rem 2.25rem' }, t('regs.rg.loading')))]));
          };
          tw.addEventListener('click', async () => {
            const open = tw.getAttribute('aria-expanded') !== 'true';
            tw.setAttribute('aria-expanded', String(open)); sub.hidden = !open;
            if (open) opened.add(key); else opened.delete(key);
            fill();
            if (open && !rowsOf.has(cc) && c) { try { rowsOf.set(cc, await LIB.countryPacks(cc)); fill(); } catch (e) { /* offline: the installed packs stay listed */ } }
          });
          fill();
          return h('li', { class: 'rg-setrow', 'data-regs-region-row': cc },
            h('div', { class: 'rg-row' }, tw, h('label', {}, box, h('span', { class: 'rg-name' }, c ? c.name : here.name)),
              h('span', { class: 'rg-tags' },
                here ? h('span', { class: 'rg-tag rg-tag-own', 'data-regs-tag': 'installed' }, t('regs.rg.installed')) : null,
                h('span', { class: 'rg-tag' }, packsN(c ? c.packs : here.packs.length)),
                c ? h('span', { class: 'rg-tag' }, kb(c.bytes)) : null,
                c && c.paid ? h('span', { class: 'rg-tag rg-tag-paid', 'data-regs-tag': 'paid-set' }, t('regs.set.paid', { n: c.paid })) : null)),
            sub);
        }));
      };
      const refreshList = async () => {
        try { list = await LIB.countries(); offline = false; } catch (e) { list = []; offline = true; say(t('regs.rg.offline'), true); }
        paint();
      };
      const installOne = async (cc) => {
        const r = await LIB.install(cc);
        if (!r.ok) return r;
        fromStore();
        setActivePacks([...new Set([...listedIds(), ...r.packs.map((x) => x.pack.id)])]);   // list the new region's packs in this app
        save();
        return r;
      };
      tree.addEventListener('change', async (ev) => {
        const cc = ev.target.dataset.regsRegion;
        if (!cc || busy) return;
        busy = true; paint();
        try {
          if (ev.target.checked) {
            say(t('regs.rg.installing', { name: place(cc) }));
            const r = await installOne(cc);
            if (r.ok) say(t('regs.rg.done', { name: r.name, packs: packsN(r.packs.length) })); else say(t('regs.rg.failed', { name: r.name }), true, r.failed);
          } else {
            LIB.remove(cc); fromStore();
            save();   // the removed region's packs leave this app's list (listedIds() holds only the shown packs)
            say(t('regs.rg.removed', { name: place(cc) }));
          }
        } catch (e) { say(t('regs.rg.offline'), true); }
        busy = false; paint();
      });
      upd.addEventListener('click', async () => {
        if (busy) return;
        busy = true; paint(); say(t('regs.rg.checking'));
        const codes = Object.keys(LIB.installed()), bad = [];
        for (const cc of codes) { try { const r = await LIB.install(cc); if (!r.ok) bad.push(r.name + ': ' + r.failed[0]); } catch (e) { bad.push(place(cc) + ': ' + (e && e.message)); } }
        fromStore(); rowsOf.clear(); await refreshList();
        busy = false; paint();
        if (bad.length) say(t('regs.rg.failed', { name: bad.length }), true, bad); else say(t('regs.rg.uptodate', { n: codes.length }));
      });
      paint();
      refreshList();
    },
    reset() { /* the installed regions are kept: removing them is unticking them */ },
  });

  // ---- The drawing's own ticks (owner decision 7): saved in the IFC as CadCraft_Regulations on IfcProject (Settings = JSON text)
  const readDrawing = () => {
    try {
      if (!host.hasModel()) return null;
      const raw = host.drawing.read();
      const j = typeof raw === 'string' ? JSON.parse(raw) : null;
      return j && j.format === 'cc-regs-drawing' ? j : null;
    } catch (e) { return null; }
  };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let readTimer = 0;
  const syncFromModel = () => { clearTimeout(readTimer); readTimer = setTimeout(() => { const d = readDrawing(); if (!same(d && { packs: d.packs, rulesOff: d.rulesOff, mode: d.mode }, drawing())) setDrawing(d); }, 150); };
  host.onModelChange(syncFromModel);
  syncFromModel();
  // REG.1c: a drawing keeps the pack versions it was checked against. A pack that stays keeps its pin; one newly ticked is pinned at the
  // installed version; only `repin` (the person accepted an update) moves a pin. A newer installed pack is offered, never applied silently.
  const writeDrawing = async (d, { repin = [] } = {}) => {
    setDrawing(d);
    if (!host.hasModel()) return false;
    const versions = d ? keepPins(readDrawing()?.versions, d.packs, listPacks({ all: true }), { repin }) : {};
    const json = JSON.stringify(d ? { format: 'cc-regs-drawing', version: 1, packs: d.packs, rulesOff: d.rulesOff, mode: d.mode, versions } : null);
    try {
      await host.drawing.write(t('regs.p.undo'), json);
      return true;
    } catch (e) { return false; }
  };

  // ---- The code summary sheet (owner 2026-10-27: "help the drafter get the permits smoother"): one printable page for the permit set —
  // the adopted codes (each ticked pack's chain, edition, in force, authority, source and its date), the design criteria, every check with its
  // section, required and found, and the problems accepted with their reasons. Built from the last model the app checked (Draw on).
  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function sheetHtml() {
    const list = profiles(), ctx = host.ctx();
    const fmtV = (v, unit) => (v === null || v === undefined ? '–' : unit === 'pct' ? pct(v) : unit === 'm2' ? host.areaText(v) : unit === 'count' ? String(Math.round(v)) : unit === 'ratio' ? String(Math.round(v * 100) / 100) : unit === 'r' ? 'R-' + (Math.round(v * 10) / 10) : unit === 'u' ? 'U-' + (Math.round(v * 100) / 100) : host.lenText(v));
    const limitTxt = (r) => (r.op === 'between' ? t('regs.op.between', { a: fmtV(r.req[0], r.unit), b: fmtV(r.req[1], r.unit) }) : t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmtV(r.req, r.unit) }));
    const file = host.modelName() || '';
    const codes = list.flatMap((p) => (p.parts || [p])).map((p) => '<tr><td>' + p.chain.map((c) => esc(c.name)).join('<br>↳ ') + '</td><td>' + esc(p.chain.map((c) => c.edition).filter(Boolean).join(' / '))
      + '</td><td>' + esc(p.chain.map((c) => c.in_force).filter(Boolean).pop() || '') + '</td><td>' + esc(p.chain.map((c) => c.authority && t('regs.auth.' + c.authority)).filter(Boolean).join(' / '))
      + '</td><td>' + p.chain.map((c) => (c.source?.url ? '<a href="' + esc(c.source.url) + '">' + esc(c.source.name || c.source.url) + '</a>' : esc(c.source?.name || '')) + (c.source?.date ? ' (' + esc(c.source.date) + ')' : '')).join('<br>') + '</td></tr>').join('');
    const crit = Object.assign({}, ...list.map((p) => p.criteria || {}));
    const CK = ['ground_snow_load', 'wind_speed', 'wind_topographic', 'special_wind_region', 'windborne_debris', 'seismic_category', 'weathering', 'frost_depth', 'termite', 'winter_design_temp', 'ice_barrier', 'flood_hazards', 'air_freezing_index', 'mean_annual_temp', 'climate_zone'];
    const critRows = CK.map((k) => '<tr><td>' + esc(t('regs.crit.' + k)) + '</td><td>' + (crit[k] ? esc(crit[k].text) : '<em>' + esc(t('regs.sheet.notset')) + '</em>') + '</td></tr>').join('');
    const rows = ctx ? list.flatMap((prof) => host.allRows(prof, ctx).map((r) => ({ ...r, pack: prof.name }))) : [];
    const res = (ok) => (ok === true ? t('regs.result.meets') : ok === false ? t('regs.result.fails') : t('regs.result.none'));
    const checks = rows.map((r) => '<tr class="' + (r.ok === false ? 'fail' : '') + '"><td>' + esc(r.where) + '</td><td>' + esc(r.label) + '</td><td>' + esc(r.clause) + '</td><td>' + esc(limitTxt(r)) + '</td><td>' + esc(fmtV(r.found, r.unit)) + '</td><td>' + esc(res(r.ok)) + '</td>' + (list.length > 1 ? '<td>' + esc(r.pack) + '</td>' : '') + '</tr>').join('');
    const sum = { meets: rows.filter((r) => r.ok === true).length, fails: rows.filter((r) => r.ok === false).length, none: rows.filter((r) => r.ok !== true && r.ok !== false).length };
    let accepted = [];
    try { accepted = (window.ccProblems?.report?.()?.rows || []).filter((x) => x.sourceKind === 'regulation' && (x.acceptedBy || x.reason)); } catch (e) { accepted = []; }
    const acc = accepted.map((x) => '<tr><td>' + esc(x.about) + '</td><td>' + esc(x.message) + '</td><td>' + esc([x.pack, x.clause].filter(Boolean).join(', ')) + '</td><td>' + esc(x.reason) + '</td><td>' + esc([x.acceptedBy, x.acceptedOn].filter(Boolean).join(', ')) + '</td></tr>').join('');
    const L = (k, v) => esc(t(k, v));
    return '<!doctype html><html lang="' + esc(document.documentElement.lang || 'en') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + L('regs.sheet.title') + (file ? ' · ' + esc(file) : '') + '</title>'
      + '<style>body{font:13px/1.45 system-ui,sans-serif;color:#111;background:#fff;margin:1.5cm}h1{font-size:20px;margin:0 0 .2rem}h2{font-size:15px;margin:1.4rem 0 .4rem;border-bottom:2px solid #111}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #888;padding:.25rem .4rem;text-align:left;vertical-align:top}th{background:#eee}tr.fail td{background:#fff3e0}.meta{color:#444}.legal{border-left:4px solid #8A6200;padding:.4rem .7rem;margin:1rem 0}a{color:#0b4f9c}@media print{body{margin:1cm}h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body>'
      + '<h1>' + L('regs.sheet.title') + '</h1><p class="meta">' + L('regs.sheet.meta', { file: file || '–', date: new Date().toISOString().slice(0, 10) }) + '</p>'
      + '<p class="legal">' + L('regs.sheet.legal') + '</p><p class="legal">' + L('regs.sheet.norep') + '</p>'
      + '<h2>' + L('regs.sheet.codes') + '</h2>' + (codes ? '<table><thead><tr><th>' + L('regs.sheet.col.place') + '</th><th>' + L('regs.meta.edition') + '</th><th>' + L('regs.meta.inforce') + '</th><th>' + L('regs.meta.authority') + '</th><th>' + L('regs.meta.source') + '</th></tr></thead><tbody>' + codes + '</tbody></table>' : '<p>' + L('regs.sheet.nopacks') + '</p>')
      + '<h2>' + L('regs.sheet.criteria') + '</h2><table><tbody>' + critRows + '</tbody></table>'
      + '<h2>' + L('regs.sheet.checks') + '</h2>' + (ctx ? '<p>' + L('regs.sheet.sum', sum) + '</p><table><thead><tr><th>' + L('regs.col.where') + '</th><th>' + L('regs.col.rule') + '</th><th>' + L('regs.col.clause') + '</th><th>' + L('regs.col.required') + '</th><th>' + L('regs.col.found') + '</th><th>' + L('regs.col.result') + '</th>' + (list.length > 1 ? '<th>' + L('regs.col.pack') + '</th>' : '') + '</tr></thead><tbody>' + checks + '</tbody></table>' : '<p>' + L('regs.sheet.nodraw') + '</p>')
      + '<h2>' + L('regs.sheet.accepted') + '</h2>' + (acc ? '<table><thead><tr><th>' + L('regs.col.where') + '</th><th>' + L('regs.sheet.col.problem') + '</th><th>' + L('regs.col.clause') + '</th><th>' + L('regs.sheet.col.reason') + '</th><th>' + L('regs.sheet.col.by') + '</th></tr></thead><tbody>' + acc + '</tbody></table>' : '<p>' + L('regs.sheet.noaccepted') + '</p>')
      + '</body></html>';
  }
  /** What the PDF report holds: the ticked packs with their pinned versions and sources, every check with the level its rule came from. */
  function reportData() {
    const list = profiles(), ctx = host.ctx(), d = readDrawing();
    const known = new Map(listPacks({ all: true }).map((p) => [p.id, p]));
    const nameOf = (id) => known.get(id)?.name || id;
    const pins = pinStatus(d?.versions, listPacks({ all: true }));
    const packs = list.flatMap((p) => (p.parts || [p])).map((p) => {
      const pin = pins.find((x) => x.id === p.id);
      return { chain: p.chain, review: p.review.state, version: pin?.pinned ?? pin?.current ?? null, pinState: pin?.state || 'unversioned' };
    });
    const fmtV = (v, unit) => (v === null || v === undefined ? '–' : fmtAny(v, unit));
    const limitTxt = (r) => (r.op === 'between' ? t('regs.op.between', { a: fmtV(r.req[0], r.unit), b: fmtV(r.req[1], r.unit) }) : t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmtV(r.req, r.unit) }));
    const rows = ctx ? list.flatMap((prof) => host.allRows(prof, ctx).map((r) => ({ ...r, pack: prof.name, prof }))) : [];
    const sourceText = (r) => {
      const s = ruleSource(r.prof, r.id, nameOf);
      return s.text.replace(/, overrides (.*)$/, (m, rest) => ', ' + t('regs.rep.overrides', { pack: rest.replace(/ \S*$/, ''), clause: rest.split(' ').pop() }));
    };
    const crit = Object.assign({}, ...list.map((p) => p.criteria || {}));
    const CK = Object.keys(crit);
    let accepted = [];
    try { accepted = (window.ccProblems?.report?.()?.rows || []).filter((x) => x.sourceKind === 'regulation' && (x.acceptedBy || x.reason)); } catch (e) { accepted = []; }
    return { title: t('regs.sheet.title'), file: host.modelName() || '', date: new Date().toISOString().slice(0, 10), packs,
      criteria: CK.map((k) => [t('regs.crit.' + k), crit[k].text]), sum: { meets: rows.filter((r) => r.ok === true).length, fails: rows.filter((r) => r.ok === false).length, none: rows.filter((r) => r.ok !== true && r.ok !== false).length },
      rows: rows.map((r) => ({ where: r.where, label: r.label, clause: r.clause, required: limitTxt(r), found: fmtV(r.found, r.unit), result: t(r.ok === true ? 'regs.result.meets' : r.ok === false ? 'regs.result.fails' : 'regs.result.none'), source: sourceText(r), raw: { id: r.id, ok: r.ok, req: r.req, found: r.found, op: r.op, unit: r.unit } })),   // raw: the numbers, for permit-package.js (0.8 EG.44)
      accepted: accepted.map((x) => ({ about: x.about, message: x.message, pack: [x.pack, x.clause].filter(Boolean).join(', '), reason: x.reason, by: x.acceptedBy, on: x.acceptedOn })) };
  }
  function reportPdf() {
    if (!host.pdf) return null;
    const out = host.pdf(reportMarkdown(reportData(), t), { title: t('regs.sheet.title'), paper: 'letter', footer: t('regs.sheet.title') + ' · ' + (host.modelName() || '') });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([out.bytes], { type: 'application/pdf' }));
    a.download = ((host.modelName() || 'drawing').replace(/\.[a-z0-9]+$/i, '')) + ' - ' + t('regs.sheet.pdf.file') + '.pdf';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return out;
  }
  window.ccRegsReportData = () => reportData();   // tests read the report without a download
  window.ccRegsReportPdf = () => (host.pdf ? host.pdf(reportMarkdown(reportData(), t), { title: t('regs.sheet.title'), paper: 'letter' }) : null);
  function codeSheet() {
    const html = sheetHtml(), a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = ((host.modelName() || 'drawing').replace(/\.[a-z0-9]+$/i, '')) + ' - ' + t('regs.sheet.file') + '.html';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  window.ccRegsSheet = () => sheetHtml();   // tests read the sheet without a download

  // ---- The Regulations panel (right panel tab): the listed packs, each ticked or not for THIS drawing, opening to its rules
  let panePaint = null;
  api.ui.panelTab({
    id: 'regs',
    title: t('regs.p.title'),
    render(pane) {
      const opened = new Set();
      const head = h('p', { class: 'rg-hint', 'data-regs-p-state': true });
      const tree = h('ul', { class: 'rg-tree', 'data-regs-panel': true, 'aria-label': t('regs.p.title') });
      const modeBox = h('fieldset', { class: 'rg-mode', 'data-regs-p-mode': true }, h('legend', {}, t('regs.mode.legend')),
        MODES.map((m) => h('label', {}, h('input', { type: 'radio', name: 'rg-p-mode', value: m, 'data-regs-p-mode-pick': m }), t('regs.mode.' + m))));
      const reset = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-regs-p-defaults': true }, t('regs.p.defaults'));
      const settings = h('button', { type: 'button', class: 'btn-link-cc', 'data-regs-p-settings': true }, t('regs.p.settings'));
      const sheet = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-regs-p-sheet': true }, t('regs.sheet.button'));
      sheet.addEventListener('click', () => codeSheet());
      const pdfBtn = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-regs-p-pdf': true }, t('regs.sheet.pdf'));
      pdfBtn.addEventListener('click', () => reportPdf());
      pdfBtn.hidden = !host.pdf;
      const offers = h('div', { class: 'rg-offers', 'data-regs-p-offers': true });
      const fb = filterBar(() => paint(), { compact: true }), F = fb.state;
      pane.append(h('div', { class: 'rg-set', style: 'padding:.75rem' }, h('h2', { class: 'rg-h', style: 'font-size:1rem' }, t('regs.p.title')), head, offers, fb.el, tree, modeBox, h('div', { class: 'rg-row', style: 'padding:0;flex-wrap:wrap' }, sheet, pdfBtn, reset, settings)));
      const current = () => drawing() || { packs: activeIds(), rulesOff: [], mode: null };
      let uid = 0;
      const paint = () => {
        if (!pane.isConnected) return;
        const d = drawing(), on = new Set(activeIds()), off = new Set(d ? d.rulesOff : []);
        head.textContent = !host.hasModel() ? t('regs.p.nomodel') : d ? t('regs.p.saved') : t('regs.p.defaultsused');
        head.dataset.regsPState = !host.hasModel() ? 'none' : d ? 'drawing' : 'defaults';
        for (const r of modeBox.querySelectorAll('input')) r.checked = r.value === mode();
        reset.disabled = !d;
        // REG.1c: the versions this drawing was checked against; a newer installed pack is offered, never applied silently
        const saved = readDrawing(), pins = d && saved ? pinStatus(saved.versions, listPacks({ all: true }).filter((p) => d.packs.includes(p.id))) : [];
        offers.replaceChildren(...pins.filter((x) => x.state === 'newer').map((x) => {
          const name = (listPacks({ all: true }).find((p) => p.id === x.id) || { name: x.id }).name;
          const b = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-regs-p-accept': x.id }, t('regs.p.upd.accept', { now: x.current }));
          b.addEventListener('click', () => writeDrawing(current(), { repin: [x.id] }));
          return h('p', { class: 'rg-hint', 'data-regs-p-update': x.id }, t('regs.p.upd', { pack: name, now: x.current, was: x.pinned }), ' ', b);
        }));
        const listed = new Set([...listedIds(), ...on]);
        const packs = listPacks({ all: true }).filter((p) => listed.has(p.id));
        fb.el.hidden = !packs.length;
        if (!packs.length) { tree.replaceChildren(h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.5rem' }, t('regs.p.empty')))); return; }
        const filtering = !!(F.q || F.trade);
        const sets = new Map();
        let shownN = 0;
        for (const p of packs) {
          const all = packProfile(p.id)?.list() || [], k = keepPack(p, all, F);
          if (!k) continue;
          shownN++;
          const c = p.jurisdiction.country;
          if (!sets.has(c)) sets.set(c, []);
          sets.get(c).push({ p, rules: k.shown || all, openIt: k.openIt, all: all.length });
        }
        fb.count.textContent = filtering ? t('regs.f.count', { n: shownN, all: packs.length }) : t('regs.f.total', { all: packs.length });
        if (!sets.size) { tree.replaceChildren(h('li', {}, h('p', { class: 'rg-hint', style: 'margin:.5rem', 'data-regs-filter-none': true }, t('regs.f.none')))); return; }
        tree.replaceChildren(...[...sets.entries()].sort((a, b) => place(a[0]).localeCompare(place(b[0]), lang())).map(([cc, ps]) => h('li', { class: 'rg-setrow', 'data-regs-p-set': cc },
          h('div', { class: 'rg-row' }, h('span', { class: 'rg-name', style: 'padding-left:.5rem' }, place(cc))),
          h('ul', {}, ps.map(({ p, rules: list, openIt, all }) => {
            const key = 'p:' + p.id, rid = 'rg-p-' + (++uid), open = opened.has(key) || openIt;
            const tw = h('button', { type: 'button', class: 'rg-twisty', 'aria-expanded': String(open), 'aria-controls': rid, 'aria-label': t('regs.open') });
            const rules = h('ul', { id: rid, hidden: !open, 'data-regs-p-rules': p.id }, list.map((r) => h('li', { class: 'rg-pack', 'data-level': 1 },
              h('div', { class: 'rg-row' }, h('label', {}, h('input', { type: 'checkbox', 'data-regs-p-rule': p.id + ':' + r.id, checked: !off.has(p.id + ':' + r.id), disabled: !on.has(p.id) }),
                h('span', { class: 'rg-name' }, r.label, h('span', { class: 'rg-note' }, (r.clause || '–') + ' · ' + limitOf(r))))))));
            tw.addEventListener('click', () => { const o = tw.getAttribute('aria-expanded') !== 'true'; tw.setAttribute('aria-expanded', String(o)); rules.hidden = !o; if (o) opened.add(key); else opened.delete(key); });
            return h('li', { class: 'rg-pack', 'data-regs-p-pack': p.id },
              h('div', { class: 'rg-row' }, tw, h('label', {}, h('input', { type: 'checkbox', 'data-regs-p-on': p.id, checked: on.has(p.id) }), h('span', { class: 'rg-name' }, p.name)),
                h('span', { class: 'rg-tags' }, filtering && list.length < all ? h('span', { class: 'rg-tag', 'data-regs-tag': 'shown' }, t('regs.f.some', { n: list.length, all })) : null,
                  h('span', { class: 'rg-tag rg-tag-' + p.review.state }, t('regs.state.' + p.review.state + '.short')),
                  p.price ? h('span', { class: 'rg-tag rg-tag-paid' }, t('regs.tag.paid', { price: money(p.price) })) : null)),
              rules);
          })))));
      };
      tree.addEventListener('change', (ev) => {
        const el = ev.target, d = current();
        if (el.dataset.regsPOn) {
          const ids = new Set(d.packs);
          if (el.checked) ids.add(el.dataset.regsPOn); else ids.delete(el.dataset.regsPOn);
          writeDrawing({ ...d, packs: [...ids] });
        } else if (el.dataset.regsPRule) {
          const off = new Set(d.rulesOff);
          if (el.checked) off.delete(el.dataset.regsPRule); else off.add(el.dataset.regsPRule);
          writeDrawing({ ...d, rulesOff: [...off] });
        }
      });
      modeBox.addEventListener('change', (ev) => { if (ev.target.name === 'rg-p-mode') writeDrawing({ ...current(), mode: ev.target.value }); });
      reset.addEventListener('click', () => writeDrawing(null));
      settings.addEventListener('click', () => document.querySelector('[data-settings-open]')?.click());
      panePaint = paint;
      paint();
    },
  });
  const fmtAny = (v, unit) => (unit === 'pct' ? pct(v) : unit === 'm2' ? host.areaText(v) : unit === 'count' ? String(Math.round(v)) : unit === 'ratio' ? String(Math.round(v * 100) / 100) : unit === 'r' ? 'R-' + (Math.round(v * 10) / 10) : unit === 'u' ? 'U-' + (Math.round(v * 100) / 100) : host.lenText(v));
  const limitOf = (r) => { const b = ruleBounds(r); return r.op === 'between' ? t('regs.op.between', { a: fmtAny(b.min, r.unit), b: fmtAny(b.max, r.unit) }) : t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmtAny(r.value, r.unit) }); };
  const stopPanel = onRegsChange(() => panePaint && panePaint());
  api.onDeactivate(stopPanel);
  api.onDeactivate(() => clearTimeout(readTimer));
}
