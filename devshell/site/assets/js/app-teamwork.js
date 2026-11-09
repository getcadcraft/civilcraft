/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-teamwork.js — comments and issues on a cloud file, in every app (0.8 LC.2, session oltl2-b_PART_3; map docs/apps/shell-modules.md § Team comments):
 * the page side of teamwork.js. Loaded by app-shell.inc for a build whose manifest says "teamwork": true (AppBuilds::extras; dev builds only). Reads #cc-teamwork {app, appName}.
 *
 * A "Team" button in the app bar opens a panel for the file this page was opened from (Studio's ?cloud=<uuid>): the threads, a box to comment, "Pin as issue" when the
 * app can say where (adapter.anchor), Resolve / Reopen, a reply under each thread, and the unread count from the team's notifications. It reaches the site only through
 * cadcraftDesktop.cloud.request (Studio's sign-in; this page never holds a token). Outside Studio, or for a file that is not in the cloud, the button stays hidden. The
 * site decides who may read or post (CloudAccess) and whether team work is open for the account; a closed switch is said in words, never hidden behind an empty list.
 *
 *   window.ccTeamwork = {
 *     attach({ anchor, goto, version, request, drawing }) → tw
 *        anchor()   → { kind, ref?, xyz?, page? } | null    where the app's selection / view is, for "Pin as issue" (default: the element selected for Design reasons, ref "<kind>:<id>")
 *        goto(a)    the panel asks the app to show an issue's place
 *        version()  → number | null                          the cloud version the person is looking at
 *        request / drawing   override the transport / the file (tests, Studio's embedded frames)
 *     open() · close() · toggle() · tw (the core) · refresh()
 *   }
 * Apps that load before this module wait for it: `window.ccTeamwork ? go() : addEventListener('cc-teamwork-ready', go, { once: true })`. Words: shell.teamwork.*.
 */
import { createTeamwork, cloudRefFromSearch, counts, vaultCloudFrom } from './teamwork.js';
import { T, h, readCfg, makePanel, palette } from './app-tools-ui.js';

const cfg = readCfg('cc-teamwork');
// 0.8 SU.1058: the Documents panel (cloud folders) gets Studio's signed-in transport from here; a page that already set its own keeps it
if (cfg && cfg.app && !window.ccVaultCloud) { const vc = vaultCloudFrom(window.cadcraftDesktop && window.cadcraftDesktop.cloud); if (vc) window.ccVaultCloud = vc; }
if (cfg && cfg.app && !window.ccTeamwork) boot();

function boot() {
  const ref = cloudRefFromSearch(location.search);      // read now: an app strips ?cloud= from the address once it has opened the file
  const cloud = window.cadcraftDesktop && window.cadcraftDesktop.cloud;
  // Where an issue can be pinned, unless the app attaches its own: the element the app has selected (the same selection the Design reasons panel reads).
  // ref = "<kind>:<id>" exactly as the reasons store keys it; goto selects it again through the same adapter.
  const reasonsAnchor = () => {
    const rs = window.ccReasons, sel = rs && rs.selected ? rs.selected() : null;
    return sel && sel.kind && sel.id !== undefined && sel.id !== null ? { kind: 'element', ref: (sel.kind + ':' + sel.id).slice(0, 200) } : null;
  };
  const reasonsGoto = (a) => {
    const rs = window.ccReasons, m = a && a.ref ? /^([^:]+):(.*)$/.exec(a.ref) : null;
    if (rs && rs.selectElement && m) rs.selectElement({ kind: m[1], id: /^-?\d+$/.test(m[2]) ? Number(m[2]) : m[2] });
  };
  let adapter = { anchor: reasonsAnchor, goto: reasonsGoto, version: null };
  const tw = createTeamwork({ request: cloud && typeof cloud.request === 'function' ? cloud.request : null, drawing: ref ? ref.drawing : '' });
  let msg = '', unread = 0, draft = '', replyDraft = {}, modelOpen = false, modelData = null, modelDisc = '';
  const DISCIPLINES = ['', 'architecture', 'structure', 'mep', 'civil', 'site', 'landscape', 'interiors', 'survey', 'other'];

  const P = makePanel({ key: 'teamwork', icon: 'chat-square-text', titleKey: 'shell.teamwork.title', onOpen: () => { refresh(); } });
  P.btn.title = T('shell.teamwork.button.title');
  const show = () => P.show(tw.available() && !!tw.drawing);
  show();

  const say = (r) => {
    const m = { teamwork_closed: 'shell.teamwork.closed', not_found: 'shell.teamwork.notfound', forbidden: 'shell.teamwork.forbidden', throttled: 'shell.teamwork.throttled',
      offline: 'shell.teamwork.offline', not_allowed: 'shell.teamwork.offline', no_file: 'shell.teamwork.nofile', invalid: 'shell.teamwork.invalid' }[r.code];
    msg = r.ok ? '' : (r.code === 'invalid' && r.message ? r.message : T(m || 'shell.teamwork.error'));
    render();
  };

  function threadView(c) {
    const when = (c.at || '').slice(0, 16).replace('T', ' ');
    const rep = replyDraft[c.uuid] || '';
    const gotoBtn = c.anchor && adapter.goto ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', text: T('shell.teamwork.show'), onclick: () => adapter.goto(c.anchor) }) : null;
    return h('li', { class: 'cct-tw-thread' + (c.state === 'resolved' ? ' is-resolved' : ''), 'data-comment': c.uuid },
      h('div', { class: 'cct-tw-meta' }, h('strong', { text: c.author && c.author.name ? c.author.name : T('shell.teamwork.someone') }), ' ', h('span', { class: 'cct-tw-when', text: when }),
        c.kind === 'issue' ? h('span', { class: 'cct-tw-tag', text: T('shell.teamwork.issue') }) : null, c.state === 'resolved' ? h('span', { class: 'cct-tw-tag', text: T('shell.teamwork.resolved') }) : null),
      h('p', { class: 'cct-tw-body', text: c.body }),
      (c.replies || []).map((r) => h('div', { class: 'cct-tw-reply' }, h('strong', { text: r.author && r.author.name ? r.author.name : T('shell.teamwork.someone') }), ': ', r.body)),
      h('div', { class: 'cct-tw-actions' }, gotoBtn,
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', text: T(c.state === 'resolved' ? 'shell.teamwork.reopen' : 'shell.teamwork.resolve'),
          onclick: async () => say(await (c.state === 'resolved' ? tw.reopen(c.uuid) : tw.resolve(c.uuid))) })),
      c.state === 'resolved' ? null : h('form', { class: 'cct-tw-replyform', onsubmit: async (e) => {
        e.preventDefault(); const b = (replyDraft[c.uuid] || '').trim(); if (!b) return;
        const r = await tw.add({ body: b, parent: c.uuid }); if (r.ok) delete replyDraft[c.uuid]; say(r); } },
      h('input', { type: 'text', class: 'form-control', 'aria-label': T('shell.teamwork.reply'), placeholder: T('shell.teamwork.reply'), value: rep, maxlength: 4000,
        oninput: (e) => { replyDraft[c.uuid] = e.target.value; } }),
      h('button', { type: 'submit', class: 'btn-line btn-sm-cc', text: T('shell.teamwork.send') })));
  }

  function render() {
    const { open, resolved } = counts(tw.threads);
    P.sum.textContent = tw.drawing ? T('shell.teamwork.sum', { open, resolved }) + (unread ? ' · ' + T('shell.teamwork.unread', { n: unread }) : '') : '';
    const canPin = !!(adapter.anchor && adapter.anchor());
    const form = h('form', { class: 'cct-tw-form', onsubmit: async (e) => {
      e.preventDefault(); const kind = e.submitter && e.submitter.dataset.kind === 'issue' ? 'issue' : 'comment';
      const r = await tw.add({ body: draft, kind, anchor: kind === 'issue' && adapter.anchor ? adapter.anchor() : null, version: adapter.version ? adapter.version() : null });
      if (r.ok) draft = ''; say(r); } },
    h('textarea', { class: 'form-control', rows: 3, maxlength: 4000, 'aria-label': T('shell.teamwork.write'), placeholder: T('shell.teamwork.write'), oninput: (e) => { draft = e.target.value; } }, draft),
    h('div', { class: 'cct-tw-actions' }, h('button', { type: 'submit', class: 'btn-plot btn-sm-cc', 'data-kind': 'comment', text: T('shell.teamwork.post') }),
      h('button', { type: 'submit', class: 'btn-line btn-sm-cc', 'data-kind': 'issue', disabled: !canPin, title: canPin ? '' : T('shell.teamwork.pin.none'), text: T('shell.teamwork.pin') }),
      unread ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', text: T('shell.teamwork.markread'), onclick: async () => { const r = await tw.markRead('all'); if (r.ok) unread = 0; render(); } }) : null));
    const bcf = h('div', { class: 'cct-tw-actions cct-tw-bcf' },
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-bcf-export': '', text: T('shell.teamwork.bcf.export'), onclick: async () => {
        const r = await tw.exportBcf(); if (!r.ok) { say(r); return; }
        const a = h('a', { href: URL.createObjectURL(new Blob([r.bytes], { type: 'application/zip' })), download: (tw.name || 'issues') + '.bcfzip' }); document.body.append(a); a.click(); a.remove();
        msg = T('shell.teamwork.bcf.exported'); render(); } }),
      h('label', { class: 'btn-line btn-sm-cc cct-tw-file' }, T('shell.teamwork.bcf.import'),
        h('input', { type: 'file', accept: '.bcfzip,.bcf,.zip', 'data-bcf-import': '', 'aria-label': T('shell.teamwork.bcf.import'), hidden: true, onchange: async (e) => {
          const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
          const r = await tw.importBcf(new Uint8Array(await f.arrayBuffer()));
          if (!r.ok) { say(r); return; }
          msg = T('shell.teamwork.bcf.imported', { n: r.imported, skipped: r.skipped }) + (r.problems.length ? ' ' + T('shell.teamwork.bcf.problems', { n: r.problems.length }) : ''); render(); } })));
    const reloadModel = async () => { modelData = await tw.model(); render(); };
    const modelBody = () => {
      if (!modelData) return [h('p', { class: 'cct-note', text: T('shell.teamwork.model.loading') })];
      if (!modelData.ok) return [h('p', { class: 'cct-tw-msg', text: modelData.message || T('shell.teamwork.error') })];
      const mine = modelData.models.find((m) => m.drawing && m.drawing.uuid === tw.drawing);
      const rows = modelData.models.length ? h('ul', { class: 'cct-tw-list', 'data-team-model-list': '' }, modelData.models.map((m) => h('li', {},
        h('strong', { text: m.drawing && m.drawing.name ? m.drawing.name : '' }), ' ', h('span', { class: 'cct-tw-tag', text: T('shell.teamwork.model.disc.' + (m.discipline || 'none')) }),
        m.drawing && m.drawing.uuid === tw.drawing ? h('span', { class: 'cct-tw-tag', text: T('shell.teamwork.model.this') }) : null))) : h('p', { class: 'cct-tw-empty', text: T('shell.teamwork.model.none') });
      const out = [rows];
      if (modelData.hidden) out.push(h('p', { class: 'cct-note', text: T('shell.teamwork.model.hidden', { n: modelData.hidden }) }));
      if (modelData.canEdit) {
        const sel = h('select', { class: 'form-select', 'aria-label': T('shell.teamwork.model.discipline'), onchange: (e) => { modelDisc = e.target.value; } },
          DISCIPLINES.map((k) => h('option', { value: k, selected: k === (mine ? mine.discipline || '' : modelDisc), text: T('shell.teamwork.model.disc.' + (k || 'none')) })));
        out.push(h('div', { class: 'cct-tw-actions' }, sel,
          h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-team-model-set': '', text: T(mine ? 'shell.teamwork.model.update' : 'shell.teamwork.model.add'),
            onclick: async () => { const r = await tw.modelSet({ discipline: sel.value }); if (!r.ok) { say(r); return; } await reloadModel(); } }),
          mine ? h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-team-model-remove': '', text: T('shell.teamwork.model.remove'),
            onclick: async () => { const r = await tw.modelRemove(); if (!r.ok) { say(r); return; } await reloadModel(); } }) : null));
      }
      return out;
    };
    const mdl = h('details', { class: 'cct-tw-model', 'data-team-model': '', open: modelOpen, ontoggle: (e) => { modelOpen = e.target.open; if (modelOpen && !modelData) reloadModel(); } },
      h('summary', { text: T('shell.teamwork.model.title') }), modelOpen ? modelBody() : null);
    const list = tw.threads.length ? h('ul', { class: 'cct-tw-list' }, tw.threads.filter((c) => c.state !== 'removed').map(threadView)) : h('p', { class: 'cct-tw-empty', text: tw.loaded ? T('shell.teamwork.none') : '' });
    P.body.replaceChildren(h('p', { class: 'cct-note', text: T('shell.teamwork.note') }), msg ? h('p', { class: 'cct-tw-msg', role: 'alert', text: msg }) : null, form, bcf, mdl, list);
  }

  async function refresh() {
    show();
    if (!tw.drawing) { msg = T('shell.teamwork.nofile'); render(); return; }
    const r = await tw.load(); say(r);
    if (r.ok) { const n = await tw.notifications({ unread: true }); if (n.ok) { unread = n.unread; render(); } }
  }

  const api = {
    attach(a = {}) {
      adapter = { anchor: a.anchor || reasonsAnchor, goto: a.goto || reasonsGoto, version: a.version || null };
      if (a.request) tw.setRequest(a.request);
      if (a.drawing) tw.setDrawing(a.drawing);
      show(); return tw;
    },
    open: () => P.open(), close: () => P.close(), toggle: () => P.toggle(), refresh, tw, get panel() { return P; },
  };
  tw.on(() => { show(); });
  palette({ id: 'cc-teamwork-open', label: T('shell.teamwork.palette'), group: T('shell.teamwork.title'), keywords: 'comments issues team cloud review', run: () => P.toggle() });
  window.ccTeamwork = api;
  document.dispatchEvent(new CustomEvent('cc-teamwork-ready'));
}
