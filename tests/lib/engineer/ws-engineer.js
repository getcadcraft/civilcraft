/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ws-engineer.js — the Engineer workspace (0.8 CE.9, Track CE; owner decision O1 "Engineer"): parts written from physics and rules.
 * The work is a Generated feature (generated.js: a script with typed inputs that adds a body to the part) and the panel that runs it
 * (gen-ui.js); this workspace puts them in one place: the generators that ship, the ones the person opened from files (ADDONS-SPEC § 17),
 * the Generated bodies in this part, the selected body's inputs form, Run / Stop, its data sheet, its manufacturing checks (also in the
 * shell's Problems) and the files it writes. It holds no state of its own beyond which body is selected and which generator is picked
 * for "New": the bodies live in the part, so Undo, save and open work as for every feature.
 * Engine-neutral (0.8 CE.12): makeWorkspace() returns the workspace definition and the host registers it with its own call. Top level is
 * DOM-free (Node imports it); the page is touched only in the hooks, through `host` (the host hands in `host.generated`).
 */
import { t, host as hostOf } from './host.js';
import { EXPORT_NOTICE_TITLE, EXPORT_NOTICE } from './notice.js';

const S = { sel: null, pick: '', box: null };
const bodies = (host) => host.part.features.filter((f) => f.type === 'generated');
const current = (host) => { const all = bodies(host); return all.find((f) => f.id === S.sel) || all[0] || null; };

async function addBody(host, id) {
  const GU = host.generated, props = GU.propsFor(id);
  if (!props) { host.status(t('gb.ui.loading')); return; }
  const f = host.commit(t('eng.ws.undo.new'), () => hostOf().features.add(host.part, 'generated', props));
  S.sel = f.id;
  host.renderAll();
  await host.built();
  GU.run(f);
}
function openFile(host) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.craft,.lua,.py,.json,.txt';
  inp.addEventListener('change', async () => {
    const file = inp.files && inp.files[0];
    if (!file) return;
    try {
      const ids = host.generated.addGenerators(await file.text(), file.name);
      S.pick = ids[0] || S.pick;
      host.status(t('eng.ws.opened', { n: ids.length }));
    } catch (e) { host.status(t('eng.ws.open_failed', { error: e && e.message ? e.message : String(e) }), true); }
    host.renderPanel();
  });
  inp.click();
}

function renderPanel(host, box) {
  const el = host.el, GU = host.generated;
  const f = current(host);
  if (f) S.sel = f.id;
  const cat = GU.catalog();
  box.append(el('p', { className: 'pc-note' }, t('eng.ws.intro')));
  // 1. the generators
  const sec = el('div', { className: 'pc-props', dataset: { engGenerators: '' } });
  if (!cat.some((g) => g.id === S.pick)) S.pick = cat[0] ? cat[0].id : '';
  const sel = el('select', { className: 'pc-select', id: 'pc-eng-pick' }, ...cat.map((g) => el('option', { value: g.id, selected: g.id === S.pick }, (g.own ? '+ ' : '') + g.title)));
  sel.addEventListener('change', () => { S.pick = sel.value; host.renderPanel(); });
  sec.append(el('label', { htmlFor: 'pc-eng-pick' }, t('eng.ws.generators')), sel);
  // the export-control notice beside a generator that carries it (the nozzle; O3)
  const picked = cat.find((g) => g.id === S.pick);
  if (picked && picked.exportNotice) sec.append(el('p', { className: 'pc-note', dataset: { engNotice: 'generator' } }, el('strong', {}, EXPORT_NOTICE_TITLE), ' ' + EXPORT_NOTICE));
  box.append(el('p', { className: 'pc-props-sub' }, t('eng.ws.generators')), sec,
    el('div', { className: 'pc-actions' },
      el('button', { type: 'button', className: 'pc-btn is-primary', disabled: !cat.length, onclick: () => addBody(host, S.pick), dataset: { engNew: '' } }, t('eng.ws.new')),
      el('button', { type: 'button', className: 'pc-btn', onclick: () => openFile(host), dataset: { engOpen: '' } }, t('eng.ws.open')),
      ...(cat.find((g) => g.id === S.pick && g.own) ? [el('button', { type: 'button', className: 'pc-btn', onclick: () => { GU.removeGenerator(S.pick); S.pick = ''; host.renderPanel(); }, dataset: { engRemove: '' } }, t('eng.ws.remove'))] : [])));
  // 2. the bodies in this part
  const all = bodies(host);
  box.append(el('p', { className: 'pc-props-sub' }, t('eng.ws.in_part')));
  if (!all.length) box.append(el('p', { className: 'pc-note' }, t('eng.ws.none')));
  else box.append(el('ul', { className: 'pc-list', dataset: { engBodies: '' } }, ...all.map((g) => el('li', {},
    el('button', { type: 'button', className: 'pc-btn' + (f && g.id === f.id ? ' is-primary' : ''), onclick: () => { S.sel = g.id; host.renderPanel(); }, dataset: { engBody: g.id } },
      g.name + (GU.isBusy(g.id) ? ' …' : !g.mesh ? ' ' + t('eng.ws.state.never') : ''))))));
  // 3. the selected body: the same panel the Design tree shows
  if (f) {
    const grid = [], out = [];
    GU.panel(f, grid, out);
    box.append(el('p', { className: 'pc-props-sub' }, f.name), ...out);
  }
  return t('eng.ws.heading');
}

/** Make a registered workspace's labels words that follow the language (call it on what the host's register returned). */
export function lazyLabels(ws) {
  const lazy = (o, k) => { const key = o[k]; Object.defineProperty(o, k, { get: () => t(key), enumerable: true, configurable: true }); };
  lazy(ws, 'label'); if (ws.blurb !== undefined) lazy(ws, 'blurb');
  for (const g of ws.groups) { lazy(g, 'label'); for (const it of g.items) { lazy(it, 'label'); lazy(it, 'title'); } }
  return ws;
}

/** The Engineer workspace definition for the host to register: lazyLabels(registerWorkspace(makeWorkspace())). */
export const makeWorkspace = () => ({
  id: 'engineer',
  label: 'eng.ws.label',
  icon: 'cpu',
  blurb: 'eng.ws.blurb',
  groups: [{ label: 'eng.tb.generate', items: [
    { cmd: 'engineer-new', icon: 'plus-square', label: 'eng.tb.new', title: 'eng.tb.new.title' },
    { cmd: 'engineer-run', icon: 'play-fill', label: 'eng.tb.run', title: 'eng.tb.run.title' },
    { cmd: 'engineer-stop', icon: 'stop-fill', label: 'eng.tb.stop', title: 'eng.tb.stop.title' },
    { cmd: 'engineer-open', icon: 'folder2-open', label: 'eng.tb.open', title: 'eng.tb.open.title' },
  ] }],
  enter(host) { const f = host.sel && host.sel.kind === 'feature' ? host.part.features.find((x) => x.id === host.sel.id && x.type === 'generated') : null; if (f) S.sel = f.id; host.generated.ready(); },
  command(cmd, host) {
    if (cmd === 'engineer-new') { addBody(host, S.pick || (host.generated.catalog()[0] || {}).id); return true; }
    if (cmd === 'engineer-run') { const f = current(host); if (f) host.generated.run(f); return true; }
    if (cmd === 'engineer-stop') { const f = current(host); if (f) host.generated.stop(f); return true; }
    if (cmd === 'engineer-open') { openFile(host); return true; }
    return false;
  },
  renderPanel,
  toolState(cmd, host) {
    const f = current(host), busy = f && host.generated.isBusy(f.id);
    if (cmd === 'engineer-run') return !f ? { ok: false, why: t('eng.ws.none') } : busy ? { ok: false, why: t('eng.ws.busy') } : { ok: true };
    if (cmd === 'engineer-stop') return busy ? { ok: true } : { ok: false, why: t('eng.ws.not_running') };
    if (cmd === 'engineer-new') return host.generated.catalog().length ? { ok: true } : { ok: false, why: t('gb.ui.loading') };
    return { ok: true };
  },
  rebuilt(host) { host.generated.ready(); },
});

export const _state = S;   // tests
