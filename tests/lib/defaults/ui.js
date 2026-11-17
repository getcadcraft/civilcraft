// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: every word a person reads comes from the add-on's language file (api.t) or from the host adapter. */
/**
 * ui.js: the Default Policies screens, the same in every app (0.10 DP.1, session bk-defaults-10). Drawn from the policy list
 * (policies.js POLICIES): a new policy shows up here with no change to this file, as long as its words are in lang/en.json
 * (dp.p.<id>, optional dp.p.<id>.hint, dp.o.<id>.<value> for a fixed choice).
 *
 *   mountDefaultsUi(api, host) → { provider, repaint() }
 *     api   the add-on API (t, ui.settingsSection, defaults.provide / changed)
 *     host  the app's adapter:
 *       app                         'bimcraft'
 *       appName                     'BimCraft'
 *       optionsOf(policy, system) → [{ value, label }] | null     the app's list for an optionsFrom policy, and labels for the others
 *       ownText?(policy, system) → string                          what the app does when the policy is not set, in words ('' = say nothing)
 *       lenText?(mm, system) → string · parseLen?(text, system) → mm | NaN          for 'length' policies
 *
 * Two places, as the Settings pages are laid out:
 *   Settings › Global › Default Policies        the office: its name, the policies that hold for every app, save to / load from a
 *                                               file, reset everything
 *   Settings › <App> › Default Policies         this app's policies by group, reset this app's
 * Every change is saved at once (store.js), then api.defaults.changed() tells the app. Nothing here touches an open project.
 */
import { POLICIES, SYSTEMS, policyList, valueOf, setValue, resetDoc, countSet, toFile, fromFile, FILE_EXT, cleanDoc } from './policies.js';
import { load, save, onStoreChange } from './store.js';
import { makeProvider } from './provider.js';

const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) n.append(k);
  return n;
};
const CSS = `
.dp-set { display: grid; gap: .6rem; min-width: 0; }
.dp-lede { margin: 0; }
.dp-group { margin: .35rem 0 0; font-size: var(--fs-sm, .8125rem); font-weight: 700; color: var(--ink-2, inherit); }
.dp-row { display: grid; grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr); gap: .35rem .75rem; align-items: start; }
.dp-row > .dp-label { padding-top: .3rem; }
.dp-ctl { display: grid; gap: .3rem; min-width: 0; }
.dp-sys { display: grid; grid-template-columns: 5.5rem minmax(0, 1fr); gap: .5rem; align-items: center; }
.dp-ctl select, .dp-ctl input[type="text"], .dp-ctl input[type="number"] { width: 100%; min-width: 0; padding: .3rem .5rem; color: var(--ink, inherit); background: var(--sheet, transparent); border: var(--pen-1, 1px) solid var(--line, currentColor); border-radius: var(--radius, .25rem); font: inherit; }
.dp-ctl [disabled] { opacity: .55; }
.dp-hint { margin: 0; font-size: var(--fs-sm, .8125rem); color: var(--ink-2, inherit); }
.dp-set-mark { font-size: var(--fs-sm, .8125rem); font-style: italic; color: var(--ink-2, inherit); }
.dp-btns { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.dp-msg { margin: 0; min-height: 1.2em; font-size: var(--fs-sm, .8125rem); }
.dp-msg-bad { color: var(--red, #b3261e); }
@media (max-width: 40rem) { .dp-row { grid-template-columns: minmax(0, 1fr); } }
`;
function style() {
  if (document.getElementById('dp-style')) return;
  document.head.append(h('style', { id: 'dp-style', text: CSS }));
}

export function mountDefaultsUi(api, host) {
  const t = api.t;
  const word = (key, fallback) => { const v = t(key); return v === key ? fallback : v; };
  const listOf = (p, system) => { try { return host.optionsOf ? host.optionsOf(p, system) : null; } catch (e) { return null; } };
  const valuesOf = (p, system) => { const l = listOf(p, system); return Array.isArray(l) ? l.map((o) => o.value) : null; };
  const provider = makeProvider({ doc: load, source: () => t('dp.from'), optionsOf: (p, system) => (p.optionsFrom ? valuesOf(p, system) : null) });
  api.defaults.provide(provider);

  const painters = new Set();
  const repaint = () => { for (const fn of [...painters]) { try { fn(); } catch (e) { api.log('repaint failed', e); } } };
  const changed = () => { api.defaults.changed(); repaint(); };
  const stop = onStoreChange(() => { api.defaults.changed(); repaint(); });   // another tab or another app saved
  api.onDeactivate(stop);
  if (typeof document === 'undefined') return { provider, repaint };
  style();

  /** One control for one policy (and one unit system, for a per-system policy). */
  function control(p, system, say) {
    const sysOpt = system ? { system } : {};
    const cur = () => valueOf(load(), p.id, sysOpt);
    const own = () => { let w = ''; try { w = host.ownText ? host.ownText(p, system) || '' : ''; } catch (e) { w = ''; } return w ? t('dp.own.is', { app: host.appName, what: w }) : t('dp.own', { app: host.appName }); };
    const put = (v) => {
      try { save(setValue(load(), p.id, v, { ...sysOpt, optionsOf: (q, s) => (q.optionsFrom ? valuesOf(q, s) : null) })); say(v === undefined ? t('dp.saved.unset', { app: host.appName }) : t('dp.saved')); changed(); return true; }
      catch (e) { say(t('dp.err.' + (['range', 'type', 'empty', 'option'].includes(e.why) ? e.why : 'value'), { min: p.min ?? '', max: p.max ?? '' }), true); return false; }
    };
    const attrs = { 'data-dp': p.id, 'data-dp-system': system || null, 'aria-label': word('dp.p.' + p.id, p.id) + (system ? ' (' + t('dp.sys.' + system) + ')' : '') };
    let node, show;
    if (p.kind === 'choice') {
      node = h('select', attrs);
      show = () => {
        const v = cur();
        const opts = (listOf(p, system) || (p.options || []).map((o) => ({ value: o, label: String(o) }))).map((o) => ({ value: o.value, label: p.options && !p.optionsFrom ? word('dp.o.' + p.id + '.' + o.value, o.label) : o.label }));
        node.replaceChildren(h('option', { value: '', text: own() }), ...opts.map((o) => h('option', { value: String(o.value), text: o.label })));
        node.value = v === undefined ? '' : String(v);
        node._values = opts.map((o) => o.value);
      };
      node.addEventListener('change', () => { const raw = node.value; const v = raw === '' ? undefined : (node._values || []).find((x) => String(x) === raw); if (!put(v)) show(); });
    } else {
      const numeric = p.kind === 'int' || p.kind === 'number';
      node = h('input', { ...attrs, type: numeric ? 'number' : 'text', ...(numeric ? { min: p.min, max: p.max, step: p.kind === 'int' ? 1 : 'any' } : { maxlength: p.max || 120 }), autocomplete: 'off', spellcheck: 'false' });
      show = () => {
        const v = cur();
        node.placeholder = own();
        if (document.activeElement === node) return;
        node.value = v === undefined ? '' : p.kind === 'length' && host.lenText ? host.lenText(v, system) : String(v);
      };
      node.addEventListener('change', () => {
        const raw = node.value.trim();
        let v;
        if (raw === '') v = undefined;
        else if (numeric) v = Number(raw);
        else if (p.kind === 'length') { v = host.parseLen ? host.parseLen(raw, system) : Number(raw); if (!Number.isFinite(v)) { say(t('dp.err.length'), true); return; } }
        else v = raw;
        put(v);
        node.blur(); show();
      });
    }
    show();
    return { node, show };
  }

  /** The rows of a list of policies, by group. */
  function rows(list, say) {
    const shows = [], out = [];
    let group = null;
    for (const p of list) {
      if (p.group !== group) { group = p.group; out.push(h('p', { class: 'dp-group', 'data-dp-group': group, text: word('dp.group.' + group, group) })); }
      const ctl = h('div', { class: 'dp-ctl' });
      const controls = [];
      if (p.perSystem) for (const s of SYSTEMS) { const c = control(p, s, say); controls.push(c); ctl.append(h('label', { class: 'dp-sys' }, h('span', { text: t('dp.sys.' + s) }), c.node)); }
      else { const c = control(p, null, say); controls.push(c); ctl.append(c.node); }
      const hint = word('dp.p.' + p.id + '.hint', '');
      if (hint) ctl.append(h('p', { class: 'dp-hint', text: hint }));
      if (p.kind === 'pattern') ctl.append(h('p', { class: 'dp-hint', text: t('dp.tokens', { list: (p.tokens || []).map((k) => '{' + k + '}').join(' ') }) }));
      const mark = h('span', { class: 'dp-set-mark', 'data-dp-mark': p.id });
      out.push(h('div', { class: 'dp-row', 'data-dp-row': p.id }, h('span', { class: 'dp-label' }, word('dp.p.' + p.id, p.id), ' ', mark), ctl));
      shows.push(() => {
        const doc = load(), isSet = Object.prototype.hasOwnProperty.call(doc.policies, p.id);
        mark.textContent = isSet ? t('dp.mark.set') : '';
        const off = p.needs ? valueOf(doc, p.needs) === 'none' : false;   // "no first sheet": its paper, scale and names do not matter
        for (const c of controls) { c.node.disabled = off; c.show(); }
      });
    }
    return { nodes: out, show: () => { for (const fn of shows) fn(); } };
  }

  const lede = () => h('p', { class: 'dp-lede shell-hint-text', 'data-dp-lede': true, text: t('dp.lede') });
  const sayer = (msg) => (text, bad) => { msg.textContent = text || ''; msg.className = 'dp-msg' + (bad ? ' dp-msg-bad' : ''); };
  /** A button that asks once more before it acts (no browser dialog). */
  const twice = (label, again, run, attrs) => {
    const b = h('button', { type: 'button', class: 'btn-line btn-sm-cc', ...attrs, text: label });
    let armed = 0;
    b.addEventListener('click', () => {
      if (armed && Date.now() - armed < 6000) { armed = 0; b.textContent = label; run(); return; }
      armed = Date.now(); b.textContent = again;
      setTimeout(() => { if (armed && Date.now() - armed >= 5900) { armed = 0; b.textContent = label; } }, 6000);
    });
    return b;
  };
  function fileButtons(say) {
    const pick = h('input', { type: 'file', accept: '.json,application/json', hidden: true, 'data-dp-file': true });
    pick.addEventListener('change', async () => {
      const f = pick.files && pick.files[0];
      pick.value = '';
      if (!f) return;
      let text = '';
      try { text = await f.text(); } catch (e) { say(t('dp.file.err.read'), true); return; }
      const r = fromFile(text, { optionsOf: (p, s) => (p.app === host.app && p.optionsFrom ? valuesOf(p, s) : null) });
      if (!r.ok) { say(t('dp.file.err.' + r.error), true); return; }
      save(r.doc);
      const n = countSet(r.doc), left = r.ignored.map((x) => x.id + (x.system ? ' (' + t('dp.sys.' + x.system) + ')' : ''));
      say(t('dp.file.loaded', { n, name: f.name }) + (left.length ? ' ' + t('dp.file.ignored', { n: left.length, list: [...new Set(left)].slice(0, 12).join(', ') }) : '') + (r.newer ? ' ' + t('dp.file.newer') : ''), false);
      changed();
    });
    const exp = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-dp-export': true, text: t('dp.file.export'), title: t('dp.file.export.title') });
    exp.addEventListener('click', () => {
      const doc = load(), text = toFile(doc);
      const name = (doc.office ? doc.office.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) : '') || 'default-policies';
      try {
        const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'application/json' })), download: name + FILE_EXT });
        document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        say(t('dp.file.saved', { name: name + FILE_EXT, n: countSet(doc) }));
      } catch (e) { say(t('dp.file.err.save'), true); }
    });
    const imp = h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-dp-import': true, text: t('dp.file.import'), title: t('dp.file.import.title') });
    imp.addEventListener('click', () => pick.click());
    return [exp, imp, pick];
  }

  // ---- Settings › Global: the office
  api.ui.settingsSection({
    id: 'defaults-office',
    scope: 'global',
    title: t('dp.title'),
    render(fs) {
      fs.setAttribute('data-dp-global', '');
      const msg = h('p', { class: 'dp-msg', role: 'status', 'data-dp-msg': true }), say = sayer(msg);
      const office = h('input', { type: 'text', maxlength: 120, 'data-dp-office': true, autocomplete: 'off', placeholder: t('dp.office.placeholder'), 'aria-label': t('dp.office') });
      office.addEventListener('change', () => { const d = load(); save({ ...d, office: office.value }); say(t('dp.saved')); changed(); });
      const r = rows(policyList('*'), say);
      const count = h('p', { class: 'dp-hint', 'data-dp-count': true });
      const reset = twice(t('dp.reset.all'), t('dp.reset.again'), () => { save(resetDoc(load())); say(t('dp.reset.all.done')); changed(); }, { 'data-dp-reset-all': true, title: t('dp.reset.all.title') });
      fs.append(h('div', { class: 'dp-set' }, lede(),
        h('div', { class: 'dp-row' }, h('span', { class: 'dp-label', text: t('dp.office') }), h('div', { class: 'dp-ctl' }, office, h('p', { class: 'dp-hint', text: t('dp.office.hint') }))),
        r.nodes, count, h('p', { class: 'dp-hint', text: t('dp.file.hint') }), h('div', { class: 'dp-btns' }, fileButtons(say), reset), msg));
      const paint = () => {
        const d = load();
        if (document.activeElement !== office) office.value = d.office;
        r.show();
        const apps = [...new Set(POLICIES.map((p) => p.app))].filter((a) => a !== '*' && countSet(d, a));
        count.textContent = countSet(d) ? t('dp.count', { n: countSet(d) }) + (apps.length ? ' ' + t('dp.count.apps', { list: apps.join(', ') }) : '') : t('dp.count.none');
      };
      painters.add(paint); paint();
    },
  });

  // ---- Settings › <App>: this app's policies (an app with none of its own, such as TakeoffCraft, has only the Global section)
  if (policyList(host.app).length) api.ui.settingsSection({
    id: 'defaults',
    title: t('dp.title'),
    render(fs) {
      fs.setAttribute('data-dp-app', host.app);
      const msg = h('p', { class: 'dp-msg', role: 'status', 'data-dp-msg': true }), say = sayer(msg);
      const r = rows(policyList(host.app), say);
      const reset = twice(t('dp.reset.app', { app: host.appName }), t('dp.reset.again'), () => { save(resetDoc(load(), { app: host.app })); say(t('dp.reset.app.done', { app: host.appName })); changed(); }, { 'data-dp-reset-app': true });
      fs.append(h('div', { class: 'dp-set' }, lede(), h('p', { class: 'dp-hint', text: t('dp.app.hint', { app: host.appName }) }), r.nodes, h('div', { class: 'dp-btns' }, fileButtons(say), reset), msg));
      painters.add(r.show); r.show();
    },
  });
  return { provider, repaint, cleanDoc };
}
