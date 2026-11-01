/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbol-palette.js — the symbol palette: a flyout panel (a bottom sheet at phone width) that lists the symbols of every registered set with
 * their pictures and names, searchable, with favourites kept per browser, click to pick. Canonical in lib/symbols/; copied by tools/symbols/sync.mjs
 * (never edit a copy). The host decides what a pick does (BimCraft: it starts the Electrical tool, or the plan-symbol tool, with that symbol).
 *
 *   const pal = mountSymbolPalette(container, { registry, favourites, t, onPick(setId, symbol), onClose?, initialSet? })
 *   pal.show(opener?) · pal.hide() · pal.toggle(opener?) · pal.isOpen() · pal.setSet(id | '') · pal.setQuery(q) · pal.refresh() · pal.say(text) · pal.destroy()
 *
 * Keyboard: the search box takes focus on open; Down moves into the list; arrows, Home and End move between symbols; Enter or Space picks the
 * focused symbol; F stars / unstars it; Esc closes and gives focus back to what opened the palette. Words come from `t` (keys `sym.palette.*`); the
 * English fallbacks below are used when a key is missing. Symbol names and pictures are data from a set: they go in through text nodes and the
 * registry's own SVG (numbers only), never as HTML.
 */
import { symbolSvg } from './symbol-sets.js';

const EN = {
  'sym.palette.title': 'Symbols', 'sym.palette.search': 'Search symbols', 'sym.palette.placeholder': 'Search by name or abbreviation', 'sym.palette.close': 'Close the symbol palette',
  'sym.palette.all': 'All sets', 'sym.palette.favs': 'Favourites', 'sym.palette.favsonly': 'Only favourites', 'sym.palette.none': 'No symbols match.', 'sym.palette.nofavs': 'No favourites yet: press the star on a symbol, or F on the focused one.',
  'sym.palette.fav.add': 'Add {name} to favourites', 'sym.palette.fav.remove': 'Remove {name} from favourites', 'sym.palette.sets': 'Symbol sets', 'sym.palette.picked': '{name} picked. Click the plan to place it; Esc stops.',
  'sym.palette.count': '{n} symbols', 'sym.palette.item': '{name}, {category}', 'sym.palette.faved': '{name} added to favourites', 'sym.palette.unfaved': '{name} removed from favourites',
};
let styled = false;
const CSS = `
.symp{position:fixed;right:16px;top:96px;width:340px;max-height:calc(100vh - 120px);z-index:1040;display:flex;flex-direction:column;background:var(--bs-body-bg,#fff);color:var(--bs-body-color,#212529);border:1px solid var(--bs-border-color,#ccc);border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.25);font-size:14px}
.symp[hidden]{display:none}
.symp-head{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--bs-border-color,#ddd)}
.symp-title{font-size:15px;font-weight:600;margin:0;flex:1}
.symp button{font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:6px;cursor:pointer}
.symp button:focus-visible,.symp input:focus-visible{outline:2px solid var(--bs-primary,#0d6efd);outline-offset:1px}
.symp-close{min-width:44px;min-height:44px;font-size:20px;line-height:1}
.symp-tools{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-bottom:1px solid var(--bs-border-color,#ddd)}
.symp-q{width:100%;min-height:40px;padding:6px 10px;border:1px solid var(--bs-border-color,#bbb);border-radius:6px;background:var(--bs-body-bg,#fff);color:inherit;font:inherit}
.symp-row{display:flex;flex-wrap:wrap;gap:6px}
.symp-chip{min-height:36px;padding:2px 10px;border-color:var(--bs-border-color,#bbb)!important}
.symp-chip[aria-pressed="true"]{background:var(--bs-primary,#0d6efd)!important;color:#fff!important;border-color:var(--bs-primary,#0d6efd)!important}
.symp-list{overflow:auto;padding:6px 10px 10px;flex:1;min-height:80px}
.symp-cat{margin:10px 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;opacity:.7}
.symp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px}
.symp-item{position:relative;border:1px solid var(--bs-border-color,#ddd);border-radius:8px}
.symp-pick{width:100%;min-height:92px;padding:6px 4px 4px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;text-align:center}
.symp-pick:hover,.symp-pick[aria-pressed="true"]{background:var(--bs-secondary-bg,#eef2f7)}
.symp-pick[aria-pressed="true"]{border-color:var(--bs-primary,#0d6efd)}
.symp-name{font-size:12px;line-height:1.2;overflow-wrap:anywhere}
.symp-star{position:absolute;top:0;right:0;min-width:32px;min-height:32px;font-size:15px;line-height:1}
.symp-none,.symp-status{margin:8px 2px;font-size:13px;opacity:.85}
.symp-status{margin:0;padding:6px 10px;border-top:1px solid var(--bs-border-color,#ddd);min-height:28px}
@media (max-width:640px){.symp{left:8px;right:8px;top:auto;bottom:8px;width:auto;max-height:62vh}.symp-grid{grid-template-columns:repeat(auto-fill,minmax(84px,1fr))}}
`;

export function mountSymbolPalette(container, { registry, favourites, t = null, onPick = () => {}, onClose = () => {}, initialSet = '' } = {}) {
  if (!styled && typeof document !== 'undefined') { const st = document.createElement('style'); st.dataset.sympStyle = ''; st.textContent = CSS; document.head.append(st); styled = true; }
  const tt = (k, v = {}) => { let s = t ? t(k, v) : k; if (!s || s === k) { s = EN[k] || k; for (const [a, b] of Object.entries(v)) s = s.replace('{' + a + '}', b); } return s; };
  const mk = (tag, props = {}, ...kids) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role') e.setAttribute(k, v); else e[k] = v; } e.append(...kids.flat().filter((x) => x != null)); return e; };

  const S = { set: initialSet || registry.list()[0]?.id || '', query: '', favsOnly: false, current: null, opener: null };
  const q = mk('input', { type: 'search', class: 'symp-q', placeholder: tt('sym.palette.placeholder'), autocomplete: 'off', spellcheck: false, 'aria-label': tt('sym.palette.search'), 'data-symp-q': '' });
  const setsRow = mk('div', { class: 'symp-row', role: 'group', 'aria-label': tt('sym.palette.sets'), 'data-symp-sets': '' });
  const favBtn = mk('button', { type: 'button', class: 'symp-chip', 'aria-pressed': 'false', 'data-symp-favs': '' }, '★ ' + tt('sym.palette.favsonly'));
  const list = mk('div', { class: 'symp-list', 'data-symp-list': '' });
  const status = mk('p', { class: 'symp-status', role: 'status', 'aria-live': 'polite', 'data-symp-status': '' });
  const close = mk('button', { type: 'button', class: 'symp-close', 'aria-label': tt('sym.palette.close'), 'data-symp-close': '' }, '×');
  const root = mk('section', { class: 'symp', role: 'region', 'aria-label': tt('sym.palette.title'), hidden: true, 'data-symp': '' },
    mk('div', { class: 'symp-head' }, mk('h2', { class: 'symp-title' }, tt('sym.palette.title')), close),
    mk('div', { class: 'symp-tools' }, q, mk('div', { class: 'symp-row' }, setsRow, favBtn)),
    list, status);
  container.append(root);

  const label = (sym) => registry.label(sym, t);
  const say = (s) => { status.textContent = s; };

  function renderSets() {
    const sets = registry.list();
    const btns = [mk('button', { type: 'button', class: 'symp-chip', 'aria-pressed': S.set === '' ? 'true' : 'false', 'data-symp-set': '' }, tt('sym.palette.all')),
      ...sets.map((s) => mk('button', { type: 'button', class: 'symp-chip', 'aria-pressed': S.set === s.id ? 'true' : 'false', 'data-symp-set': s.id }, t && s.nameKey && t(s.nameKey) !== s.nameKey ? t(s.nameKey) : s.name))];
    setsRow.replaceChildren(...btns);
    for (const b of btns) b.addEventListener('click', () => { S.set = b.getAttribute('data-symp-set'); renderSets(); render(); });
  }

  function item(r) {
    const sym = r.symbol, nm = r.label;
    const cat = registry.get(r.set)?.categories.find((c) => c.id === r.category);
    const pick = mk('button', { type: 'button', class: 'symp-pick', 'aria-pressed': S.current && S.current.set === r.set && S.current.key === sym.key ? 'true' : 'false', 'aria-label': tt('sym.palette.item', { name: nm + (sym.abbr ? ' (' + sym.abbr + ')' : ''), category: registry.catLabel(cat, t) }), tabIndex: -1, 'data-symp-pick': '' });
    pick.setAttribute('data-set', r.set); pick.setAttribute('data-key', sym.key);
    const pic = mk('span', { class: 'symp-pic' });
    pic.innerHTML = symbolSvg(sym, { size: 52 });   // numbers only (symbolSvg); text inside it is escaped there
    pick.append(pic, mk('span', { class: 'symp-name' }, nm));
    pick.addEventListener('click', () => choose(r.set, sym.key));
    const on = favourites.has(r.set, sym.key);
    const star = mk('button', { type: 'button', class: 'symp-star', tabIndex: -1, 'aria-pressed': on ? 'true' : 'false', 'aria-label': tt(on ? 'sym.palette.fav.remove' : 'sym.palette.fav.add', { name: nm }), 'data-symp-star': '' }, on ? '★' : '☆');
    star.addEventListener('click', (e) => { e.stopPropagation(); fav(r.set, sym.key, nm); });
    return mk('div', { class: 'symp-item' }, pick, star);
  }

  function render() {
    const keys = S.favsOnly ? new Set([...favourites.list()]) : null;
    const results = registry.search(S.query, { set: S.set || null, keys, t });
    favBtn.setAttribute('aria-pressed', S.favsOnly ? 'true' : 'false');
    const out = [];
    if (!results.length) out.push(mk('p', { class: 'symp-none', 'data-symp-none': '' }, tt(S.favsOnly && !S.query ? 'sym.palette.nofavs' : 'sym.palette.none')));
    else {
      const favs = results.filter((r) => favourites.has(r.set, r.symbol.key));
      const group = (title, rs, id) => { out.push(mk('h3', { class: 'symp-cat', 'data-symp-cat': id }, title)); out.push(mk('div', { class: 'symp-grid', role: 'group', 'aria-label': title }, rs.map(item))); };
      if (favs.length && !S.favsOnly) group('★ ' + tt('sym.palette.favs'), favs, 'favourites');
      const seen = new Set();
      for (const st of registry.list()) {
        for (const c of st.categories) {
          const rs = results.filter((r) => r.set === st.id && r.category === c.id);
          if (!rs.length) continue;
          const title = (S.set ? '' : (t && st.nameKey && t(st.nameKey) !== st.nameKey ? t(st.nameKey) : st.name) + ': ') + registry.catLabel(c, t);
          group(title, rs, st.id + '/' + c.id); seen.add(c.id);
        }
      }
    }
    list.replaceChildren(...out);
    say(results.length ? tt('sym.palette.count', { n: results.length }) : '');
    const items = pickers();
    if (items.length) items[0].tabIndex = 0;
  }

  const pickers = () => [...list.querySelectorAll('[data-symp-pick]')];
  function choose(setId, key) {
    const sym = registry.find(setId, key);
    if (!sym) return;
    S.current = { set: setId, key };
    for (const b of pickers()) b.setAttribute('aria-pressed', b.getAttribute('data-set') === setId && b.getAttribute('data-key') === key ? 'true' : 'false');
    say(tt('sym.palette.picked', { name: registry.label(sym, t) }));
    onPick(setId, sym);
  }
  function fav(setId, key, nm) {
    const on = favourites.toggle(setId, key);
    const at = document.activeElement?.getAttribute?.('data-key') === key ? 'pick' : 'star';
    render();
    const again = pickers().find((b) => b.getAttribute('data-set') === setId && b.getAttribute('data-key') === key);
    if (again && at === 'pick') { again.tabIndex = 0; again.focus(); }
    say(tt(on ? 'sym.palette.faved' : 'sym.palette.unfaved', { name: nm }));
  }

  q.addEventListener('input', () => { S.query = q.value; render(); });
  favBtn.addEventListener('click', () => { S.favsOnly = !S.favsOnly; render(); });
  close.addEventListener('click', () => api.hide());
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); api.hide(); return; }
    const items = pickers(), i = items.indexOf(document.activeElement);
    if (e.target === q) { if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); focusItem(items[0]); } return; }
    if (i < 0) return;
    const to = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : null;
    if (to != null) { e.preventDefault(); if (to < 0) q.focus(); else focusItem(items[Math.min(to, items.length - 1)]); return; }
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); const b = items[i]; fav(b.getAttribute('data-set'), b.getAttribute('data-key'), b.querySelector('.symp-name').textContent); }
  });
  function focusItem(b) { for (const x of pickers()) x.tabIndex = -1; b.tabIndex = 0; b.focus(); b.scrollIntoView?.({ block: 'nearest' }); }

  renderSets(); render();
  const api = {
    el: root,
    show(opener = null) { S.opener = opener || document.activeElement; root.hidden = false; render(); q.focus(); },
    hide() { if (root.hidden) return; root.hidden = true; try { onClose(); } catch (e) { /* host */ } const o = S.opener; S.opener = null; if (o && o.isConnected && o.focus) o.focus(); },
    toggle(opener) { if (root.hidden) api.show(opener); else api.hide(); },
    isOpen: () => !root.hidden,
    setSet(id) { S.set = id; renderSets(); render(); },
    setQuery(v) { S.query = v; q.value = v; render(); },
    refresh() { if (S.set && !registry.has(S.set)) S.set = ''; renderSets(); render(); },
    say, pick: choose,
    destroy() { root.remove(); },
  };
  return api;
}
