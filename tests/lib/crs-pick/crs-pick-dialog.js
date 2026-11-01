/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-pick-dialog.js — the one dialog that picks a coordinate system in an app that has no dialog of its own for it (0.8 D8.9,
 * session `crs-share_PART_3`; CivilCraft's project system and CadCraft's drawing system). The logic is crs-pick.js (EPSG number, UTM
 * zone, words, proj4 definition, .prj text, "My projections" in localStorage `cadcraft.projections`, shared by every app on the
 * origin). DOM only here, no app classes: canonical in lib/crs-pick, copied byte for byte by `node tools/crs-pick/sync.mjs`.
 *
 *   await openCrsDialog({ title, intro, near, current, projectedOnly = true, check(crs) → string | null, onPick(crs), say(text),
 *                         onProblem(problem | null), root = document.body }) → the <dialog>
 *     check   the host's rule for what it can keep (CadCraft: only a system with an EPSG code; CivilCraft: crsProblem for the units);
 *             a string is the reason, shown beside the choice and given to onProblem as a Problems-shaped message
 *     onPick  gets a crs.js state.crs ({ code, name, proj4, unit, local: null }); the dialog closes
 *   pickProblem(why, crs) → the Problems-shaped message (docs/0.8-PROBLEMS-SPEC.md § 1): code crs.pick.refused, severity warning
 *   problemSource(label) → { set(problem | null) } registering one source `crs.pick` with the shell's window.ccProblems when it is there
 * Test hooks: dialog[data-crs-pick]; [data-crs-q] [data-crs-prj] [data-crs-name] [data-crs-hit] [data-crs-use] [data-crs-keep]
 * [data-crs-mine-use] [data-crs-mine-remove] [data-crs-msg] [data-crs-problem].
 */
import { t } from './i18n.js';

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in e && k !== 'list') e[k] = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
  return e;
};

const STYLE = `dialog.crs-pick{width:min(44rem,94vw);max-height:90vh;overflow:auto;padding:1rem 1.25rem;border:1px solid GrayText;border-radius:8px;background:Canvas;color:CanvasText}
dialog.crs-pick::backdrop{background:rgba(0,0,0,.45)}
.crs-pick h2{font-size:1.15rem;margin:0 0 .5rem}.crs-pick h3{font-size:1rem;margin:1rem 0 .4rem}
.crs-pick .crs-pick-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.5rem 0}
.crs-pick input[type=text]{flex:1 1 16rem;min-width:0;padding:.35rem .5rem;font:inherit;color:inherit;background:transparent;border:1px solid GrayText;border-radius:4px}
.crs-pick .crs-pick-hits{display:flex;flex-direction:column;gap:.25rem;margin:.5rem 0;max-height:14rem;overflow:auto}
.crs-pick .crs-pick-hits button{text-align:left}
.crs-pick .crs-pick-mine{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.25rem}
.crs-pick .crs-pick-sub{margin:.35rem 0}.crs-pick .crs-pick-err{color:#b3261e}
@media (prefers-color-scheme:dark){.crs-pick .crs-pick-err{color:#f2b8b5}}
.crs-pick .crs-pick-foot{display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem}`;

/** The Problems-shaped message for a system that cannot be used here (spec § 1: code, severity, msg + text, about, source). */
export function pickProblem(why, crs) {
  const name = String(crs?.name || '').slice(0, 120);
  return {
    id: 'crs.pick:refused', code: 'crs.pick.refused', severity: 'warning',
    msg: { key: 'crs.pick.problem', vars: { name, why: String(why).slice(0, 300) } },
    text: t('crs.pick.problem', { name, why: String(why).slice(0, 300) }),
    about: crs?.code != null ? [{ kind: 'crs', id: 'EPSG:' + crs.code, label: name }] : [],
    source: { name: 'crs.pick' }, acceptable: false,
  };
}

/** One source `crs.pick` in the shell's Problems when it is there (nothing when the app has none). set(null) clears. */
export function problemSource(label = 'Coordinate system') {
  let src = null;
  return {
    set(p) {
      try {
        const store = globalThis.ccProblems;
        if (!store?.source) return false;
        src ||= store.source({ id: 'crs.pick', kind: 'check', label });
        src.set(p ? [p] : []);
        return true;
      } catch { return false; }
    },
  };
}

export async function openCrsDialog({ title = '', intro = '', near = null, current = '', projectedOnly = true, check = null, onPick, say = () => {}, onProblem = null, root = document.body } = {}) {
  const [crsLib, P] = await Promise.all([import('./crs.js'), import('./crs-pick-shared.js')]);
  if (!crsLib.catalogLoaded()) await crsLib.loadCatalog();
  if (!document.querySelector('style[data-crs-pick-style]')) document.head.append(h('style', { 'data-crs-pick-style': '' }, STYLE));
  let sel = null, custom = false;
  const q = h('input', { type: 'text', id: 'crs-pick-q', 'data-crs-q': '', autocomplete: 'off', spellcheck: false, placeholder: t('geo.pick.search.ph') });
  const prj = h('input', { type: 'file', accept: '.prj,.txt', hidden: true, 'data-crs-prj': '' });
  const name = h('input', { type: 'text', id: 'crs-pick-name', maxLength: 120, 'data-crs-name': '' });
  const msg = h('p', { class: 'crs-pick-sub', role: 'status', 'aria-live': 'polite', 'data-crs-msg': '' });
  const prob = h('p', { class: 'crs-pick-sub crs-pick-err', role: 'alert', hidden: true, 'data-crs-problem': '' });
  const hits = h('div', { class: 'crs-pick-hits', 'data-crs-hits': '' });
  const customRow = h('div', { class: 'crs-pick-row', hidden: true }, h('label', { for: 'crs-pick-name' }, t('geo.pick.name')), name,
    h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-crs-keep': '', onClick: () => keep() }, t('geo.pick.keep')));
  const mine = h('ul', { class: 'crs-pick-mine', 'data-crs-mine': '' });
  const use = h('button', { type: 'button', class: 'btn-plot btn-sm-cc', disabled: true, 'data-crs-use': '', onClick: () => finish() }, t('geo.pick.use'));
  const dlg = h('dialog', { class: 'crs-pick', 'aria-label': title, 'data-crs-pick': '' },
    h('h2', {}, title),
    intro ? h('p', { class: 'crs-pick-sub' }, intro) : null,
    current ? h('p', { class: 'crs-pick-sub', 'data-crs-current': '' }, current) : null,
    h('div', { class: 'crs-pick-row' }, h('label', { for: 'crs-pick-q' }, t('geo.pick.search')), q,
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', onClick: () => prj.click() }, t('geo.pick.prj')), prj),
    msg, prob, hits, customRow,
    h('h3', {}, t('geo.pick.mine')), mine, h('p', { class: 'crs-pick-sub' }, t('geo.pick.share.note')),
    h('div', { class: 'crs-pick-foot' }, use, h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-crs-close': '', onClick: () => dlg.close() }, t('geo.pick.share.close'))));
  dlg.addEventListener('close', () => dlg.remove());

  const unitLabel = (u) => (u === 'deg' ? '°' : u);
  const label = (e) => t('geo.pick.hit', { code: e.code, name: e.name, unit: unitLabel(e.unit) });
  /** Why the host cannot keep this system (or null): a geographic system when only a projected one will do, then the host's own rule. */
  const refusal = (c) => {
    if (projectedOnly && c.unit === 'deg') return t('geo.pick.share.geographic');
    return (check && check(c)) || null;
  };
  const setProblem = (why, c) => {
    prob.hidden = !why;
    prob.textContent = why ? pickProblem(why, c).text : '';
    onProblem?.(why ? pickProblem(why, c) : null);
  };
  const setSel = (crs, isCustom, text) => {
    sel = crs; custom = isCustom;
    const why = crs ? refusal(crs) : null;
    use.disabled = !crs || !!why;
    customRow.hidden = !(crs && isCustom);
    if (crs && isCustom) name.value = crs.name;
    msg.textContent = text !== undefined ? text : msg.textContent;
    setProblem(why, crs);
  };
  const fail = (text) => { setSel(null, false, ''); prob.hidden = false; prob.textContent = text; };
  function showHits(list) {
    hits.replaceChildren(...list.map((e) => h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-crs-hit': String(e.code),
      onClick: () => { setSel(crsLib.crsFromEntry(e), false, label(e)); q.value = 'EPSG:' + e.code; hits.replaceChildren(); } }, label(e))));
  }
  function describeSel(r) {
    const isCustom = r.crs.code == null;
    setSel(r.crs, isCustom, [isCustom ? t('geo.pick.custom', { name: r.crs.name, unit: unitLabel(r.crs.unit) }) : label(r.crs), ...r.notes].join(' '));
  }
  function run(text) {
    hits.replaceChildren();
    const r = P.parse(text, { near, limit: 40 });
    if (r.kind === 'none') { setSel(null, false, ''); return; }
    if (r.error) { fail(r.error); return; }
    if (r.kind === 'words') { setSel(null, false, t(r.hits.length >= 40 ? 'geo.pick.hits.more' : 'geo.pick.hits', { n: r.hits.length })); showHits(projectedOnly ? r.hits.filter((e) => !e.geographic) : r.hits); return; }
    describeSel(r);
  }
  let timer = 0;
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => run(q.value), 150); });
  q.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); run(q.value); if (sel && !use.disabled) finish(); } });
  name.addEventListener('keydown', (e) => e.stopPropagation());
  prj.addEventListener('change', async () => {
    const f = prj.files?.[0];
    prj.value = '';
    if (!f) return;
    try {
      const r = P.parse(await f.text());
      if (r.error || !r.crs) { fail(t('geo.pick.prj.bad', { name: f.name, error: r.error || t('crs.prj.not') })); return; }
      q.value = f.name;
      describeSel(r);
    } catch (e) { fail(t('geo.pick.prj.bad', { name: f.name, error: e.message })); }
  });
  function paintMine() {
    const list = P.readMine();
    mine.replaceChildren(...(list.length ? list.map((e) => h('li', {},
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-crs-mine-use': e.id,
        onClick: () => {
          q.value = ''; hits.replaceChildren();
          // read it again as a definition: one equal to a listed system takes its EPSG number and says so ("same coordinates as…")
          const r = P.parse(e.name.replace(/[+=]/g, ' ').trim() + ' = ' + e.proj4);
          if (r.crs && !r.error) describeSel(r); else setSel(P.mineCrs(e), false, t('geo.pick.custom', { name: e.name, unit: unitLabel(e.unit) }));
        } }, t('geo.pick.mine.use', { name: e.name })), ' ',
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-crs-mine-remove': e.id, 'aria-label': t('geo.pick.mine.remove', { name: e.name }),
        onClick: () => { P.removeMine(null, e.id); paintMine(); } }, '×')))   // i18n-ignore: the multiplication sign is a symbol
      : [h('li', { class: 'crs-pick-sub' }, t('geo.pick.mine.none'))]));
  }
  function named() { return sel && custom ? { ...sel, name: name.value.trim() || sel.name } : sel; }
  function keep() {
    const c = named();
    if (!c || c.code != null) return;
    P.addMine(null, c, c.name);
    msg.textContent = t('geo.pick.kept', { name: c.name });
    paintMine();
  }
  function finish() {
    const c = named();
    if (!c) return;
    const why = refusal(c);
    if (why) { setProblem(why, c); return; }
    onPick?.(c);
    onProblem?.(null);
    dlg.close();
  }
  paintMine();
  root.append(dlg);
  dlg.showModal();
  q.focus();
  return dlg;
}
