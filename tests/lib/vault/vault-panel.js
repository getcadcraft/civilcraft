/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vault-panel.js — the Documents panel, the same in every app that has one (0.8 SU.1058, sessions `sx-vault`, `vault-08`).
 * Canonical here (lib/vault); each app's copy (dev/vault/) is written by `node tools/vault/sync.mjs`. A project folder's files with
 * their revision and state, check out / check in with locks, submit, approve or reject, a new revision from a released one, broken
 * locks with a reason, history, what a file uses and what uses it, a BOM as CSV, and the project settings. Text through t();
 * names from files only through el() text nodes. What differs per app is the `app` adapter:
 *
 *   createVaultPanel({ stage, el, t, print, focusCommandLine, fileHost, app }) → { open, close, node, state, useFolder, saveBlocked }
 *     fileHost  host.js getHost() (pickFolder, account); folders: Studio's bridge (window.cadcraftDesktop) or the browser's
 *               File System Access API (Chromium); elsewhere the panel says it needs one of them
 *     app = {
 *       cloud?: { request(method, url, { body, headers }) → { status, bytes() }, available?() → bool, base? ('/api/v1/vault') }   a cloud folder
 *                                         (0.8 SU.1058 step 8, VaultCloud on B2): the app's signed-in transport; absent = no cloud button
 *       kinds: ['dwg','dxf']              the file kinds this app opens (lib/vault kindOf)
 *       saveBlob(name, text, mime)        hand a file to the person (the BOM as CSV)
 *       open(rec, bytes, folder)          open the file in the app; mark it as the vault's (so openRef() answers)
 *       openRef()                         → { id, folder } of the vault file that is open now, or null
 *       current(rec)                      → { bytes, links? } the open file as the app saves it, { wrong: true } when its format is not
 *                                           the file's, or null (checked in as it lies in the folder). links = what it uses
 *       afterCheckin(rec)                 the open file is now the vault's copy (mark it saved)
 *       extras: ['fields', …]             extra per-file action names (strings sx.vault.act.<name>), shown for the open file
 *       runExtra(name, rec, H)            → true when handled;  revActions(rec, r, H) → node | null (a revision row's buttons)
 *       detail(rec, H)                    → node | null (under a Revisions list);  afterApprove(rec, H);  onSelect();  onClose()
 *     }
 *   H (handed to the adapter) = { st, run(fn), say(r, key, vars), btn(label, onclick, cls, data), render(), refresh(), print, t, el }
 */
import { openVault, initVault, kindOf } from './vault.js';
import { fromHostFolder } from './vault-fs.js';
import { cloudFs } from './vault-cloud.js';
import { whereUsed, usesOf, bom, bomCsv, revisionTable } from './vault-links.js';
import { actionsFor, errorKey, stateKey, identity, saveIdentity, folderNote, readOnlyKey, settingsForm, settingsPatch, ASME_SKIP } from './vault-model.js';

const MAX_UNTRACKED = 200;
const SET_LABEL = { approvers: 'sx.vault.set.approvers', admins: 'sx.vault.set.admins', revSkip: 'sx.vault.set.revskip', staleLockDays: 'sx.vault.set.stale' };
const CSV_COLS = ['item', 'level', 'number', 'name', 'path', 'rev', 'state', 'qty', 'total', 'note'];
const when = (iso) => { try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); } catch { return String(iso || ''); } };
const base = (p) => String(p).split('/').pop();

export function createVaultPanel({ stage, el: baseEl, t, print, focusCommandLine, fileHost, app }) {
  // the apps' el() helpers differ on `dataset` (one assigns it, one sets it); data-* attributes work with all of them
  const kebab = (k) => 'data-' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  const el = (tag, props = {}, ...kids) => {
    if (!props || !props.dataset) return baseEl(tag, props, ...kids);
    const { dataset, ...rest } = props;
    for (const [k, v] of Object.entries(dataset)) rest[kebab(k)] = v === '' ? true : String(v);
    return baseEl(tag, rest, ...kids);
  };
  const canOpenRec = (rec) => !!rec && (app.kinds || []).includes(rec.kind);
  let node = null, body = null;
  const bridge = typeof window !== 'undefined' && window.cadcraftDesktop && Number(window.cadcraftDesktop.version) >= 1 ? window.cadcraftDesktop : null;
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  const st = { settings: {}, setOpen: false, fsx: null, folder: '', vault: null, files: [], scan: null, sel: null, busy: false, error: '', notice: '', prompt: null,
    who: identity(store, fileHost?.account?.() || null), detail: 'history', events: [] };

  const canPick = () => !!(bridge?.openFolderDialog || (typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'));
  const ctx = () => ({ user: st.who.user, machine: st.who.machine });
  const say = (r, okKey, vars = {}) => {
    if (r && r.ok) { st.error = ''; st.notice = t(okKey, vars); print(st.notice); }
    else { st.notice = ''; st.error = t(errorKey(r?.code), { who: r?.lock?.user || '', machine: r?.lock?.machine || '', state: r?.state ? t(stateKey(r.state)) : '' }); }
  };
  const recOf = (id) => st.files.find((f) => f.id === id) || null;
  const isOpen = (rec) => { const r = rec && app.openRef?.(); return !!r && r.id === rec.id && r.folder === st.folder; };

  async function refresh({ scan = true } = {}) {
    if (!st.vault) { render(); return; }
    try {
      st.files = await st.vault.files();
      st.settings = (await st.vault.state()).settings;
      if (scan) st.scan = await st.vault.scan({ hash: true });
      if (st.sel) st.events = await st.vault.history(st.sel);
    } catch (e) { st.error = t('sx.vault.err.read', { why: e?.message || '' }); }
    render();
  }
  async function run(fn) {
    if (st.busy) return;
    st.busy = true; render();
    try { await fn(); } catch (e) { console.error(e); st.error = t('sx.vault.err.other', { why: e?.message || '' }); }
    st.busy = false;
    await refresh();
  }

  async function pickFolder() {
    const f = await fileHost.pickFolder({ write: true, id: 'cadcraft-vault', title: t('sx.vault.pick') }).catch(() => null);
    if (!f) return;
    st.fsx = fromHostFolder(f, bridge);
    if (!st.fsx) { st.error = t('sx.vault.err.folder'); render(); return; }
    st.folder = f.path || f.name;
    st.vault = await openVault(st.fsx, ctx());
    st.sel = null; st.scan = null; st.error = ''; st.notice = '';
    await refresh();
  }
  // ---- a cloud folder (VaultCloud: the server supplies the strict exclusive create the vault's locks need)
  const cloudOk = () => { const c = app.cloud; return !!(c && typeof c.request === 'function' && (typeof c.available !== 'function' || c.available())); };
  const cloudBase = () => String(app.cloud?.base || '/api/v1/vault').replace(/\/+$/, '');
  async function pickCloud() {
    st.error = '';
    try {
      const r = await app.cloud.request('GET', cloudBase() + '/folders');
      if (r.status === 401 || r.status === 403) { st.error = t('sx.vault.cloud.signin'); st.cloudList = null; render(); return; }
      if (r.status !== 200) { st.error = t('sx.vault.cloud.err', { status: r.status }); st.cloudList = null; render(); return; }
      st.cloudList = (JSON.parse(new TextDecoder().decode(await r.bytes())).data?.folders || []).slice(0, 100);
    } catch (e) { st.error = t('sx.vault.cloud.err', { status: e?.status || 0 }); st.cloudList = null; }
    render();
  }
  async function useCloud(f) {
    st.fsx = cloudFs(app.cloud.request, cloudBase() + '/' + encodeURIComponent(f.uuid));
    st.folder = f.workspace + ' / ' + f.name; st.cloudList = null;
    try { st.vault = await openVault(st.fsx, ctx()); } catch (e) { st.vault = null; st.error = t('sx.vault.err.read', { why: e?.message || '' }); }
    st.sel = null; st.scan = null; st.notice = '';
    await refresh();
  }
  const reopen = async () => { if (st.fsx) st.vault = await openVault(st.fsx, ctx()); };

  // ---- actions
  async function act(name, rec, text = '') {
    const v = st.vault;
    if (!st.who.user) { st.prompt = { kind: 'who' }; render(); return; }
    if (name === 'open') return run(async () => {
      const bytes = await st.fsx.read(rec.path);
      if (!bytes) { st.error = t('sx.vault.err.missing_file'); return; }
      await app.open(rec, bytes, st.folder);
      print(t(rec.lock?.mine ? 'sx.vault.opened.mine' : 'sx.vault.opened.readonly', { name: rec.path, rev: rec.rev }));
    });
    if (name === 'checkout') return run(async () => say(await v.checkOut(rec.id, { note: text }), 'sx.vault.done.checkout', { name: rec.path }));
    if (name === 'newrev') return run(async () => { const r = await v.checkOut(rec.id, { newRevision: true }); say(r, 'sx.vault.done.newrev', { name: rec.path, next: r.next || '' }); });
    if (name === 'checkin') return run(async () => {
      let uses;
      if (isOpen(rec)) {
        const cur = app.current?.(rec);
        if (cur && cur.wrong) { st.error = t('sx.vault.err.format', { name: rec.path }); return; }
        if (cur) { await st.fsx.write(rec.path, cur.bytes); uses = cur.links; }
        app.afterCheckin?.(rec);
      }
      const r = await v.checkIn(rec.id, { note: text, ...(uses ? { uses } : {}) });
      say(r, r.same ? 'sx.vault.done.checkin.same' : 'sx.vault.done.checkin', { name: rec.path, rev: r.rev || '' });
    });
    if (name === 'undo') return run(async () => say(await v.undoCheckOut(rec.id, { revert: false }), 'sx.vault.done.undo', { name: rec.path }));
    if (name === 'submit') return run(async () => say(await v.submit(rec.id, { note: text }), 'sx.vault.done.submit', { name: rec.path }));
    if (name === 'approve') return run(async () => { const r = await v.approve(rec.id, { approver: text }); say(r, 'sx.vault.done.approve', { name: rec.path, rev: r.rev || '', who: text }); if (r.ok) await app.afterApprove?.(rec, H); });
    if (name === 'reject') return run(async () => say(await v.reject(rec.id, { reason: text }), 'sx.vault.done.reject', { name: rec.path }));
    if (name === 'obsolete') return run(async () => say(await v.obsolete(rec.id, { reason: text }), 'sx.vault.done.obsolete', { name: rec.path }));
    if (name === 'breaklock') return run(async () => say(await v.breakLock(rec.id, { reason: text }), 'sx.vault.done.breaklock', { name: rec.path }));
    if (await app.runExtra?.(name, rec, H)) return;
  }
  // actions that take a typed value first (approver, reason, note)
  const ASKS = { approve: 'sx.vault.ask.approver', reject: 'sx.vault.ask.reason', breaklock: 'sx.vault.ask.break', obsolete: 'sx.vault.ask.obsolete', checkin: 'sx.vault.ask.note' };
  function start(name, rec) {
    if (ASKS[name]) { st.prompt = { kind: name, id: rec.id, value: name === 'approve' ? st.who.user : '' }; render(); body.querySelector('[data-vault-prompt] input')?.focus(); return; }
    act(name, rec);
  }

  // ---- views
  const btn = (label, onclick, cls = 'btn-line', data = {}) => el('button', { type: 'button', className: cls === 'cc-linkbtn' ? 'cc-vlink' : 'cc-vbtn' + (cls === 'btn-plot' ? ' is-primary' : ''), disabled: st.busy, onclick, dataset: data }, label);

  function promptView() {
    const p = st.prompt;
    if (!p) return null;
    const input = el('input', { type: 'text', className: 'cc-vinput', value: p.kind === 'who' ? st.who.user : p.value || '', maxLength: p.kind === 'who' ? 80 : 500,
      'aria-label': t(p.kind === 'who' ? 'sx.vault.ask.who' : p.kind === 'init' ? 'sx.vault.ask.name' : ASKS[p.kind]) });
    const machine = p.kind === 'who' ? el('input', { type: 'text', className: 'cc-vinput', value: st.who.machine, maxLength: 80, 'aria-label': t('sx.vault.ask.machine') }) : null;
    const ok = async () => {
      const val = input.value.trim();
      const rec = recOf(p.id);
      st.prompt = null;
      if (p.kind === 'who') { st.who = { user: val, machine: machine.value.trim() || st.who.machine }; saveIdentity(store, st.who); await reopen(); return refresh({ scan: false }); }
      if (p.kind === 'init') return run(async () => { const r = await initVault(st.fsx, { name: val }, ctx()); if (r.ok) st.vault = r.vault; say(r, 'sx.vault.done.init', { name: val }); });
      if (rec) act(p.kind, rec, val);
    };
    const form = el('form', { className: 'cc-vault-prompt', dataset: { vaultPrompt: p.kind }, onsubmit: (e) => { e.preventDefault(); ok(); } },
      el('label', {}, t(p.kind === 'who' ? 'sx.vault.ask.who' : p.kind === 'init' ? 'sx.vault.ask.name' : ASKS[p.kind]), ' ', input),
      machine ? el('label', {}, t('sx.vault.ask.machine'), ' ', machine) : null,
      el('div', { className: 'cc-vault-acts' }, el('button', { type: 'submit', className: 'cc-vbtn is-primary' }, t('sx.vault.ok')), btn(t('sx.vault.cancel'), () => { st.prompt = null; render(); })));
    return form;
  }

  async function saveSettings(form) {
    if (!st.who.user) { st.prompt = { kind: 'who' }; render(); return; }
    return run(async () => say(await st.vault.setSettings(settingsPatch(form)), 'sx.vault.done.settings'));
  }
  function settingsView() {
    const cur = settingsForm(st.settings);
    const field = (key, area) => (area
      ? el('textarea', { className: 'cc-vinput', rows: 3, name: key, value: cur[key], 'aria-label': t(SET_LABEL[key]) })
      : el('input', { className: 'cc-vinput', type: key === 'staleLockDays' ? 'number' : 'text', name: key, value: cur[key], 'aria-label': t(SET_LABEL[key]), ...(key === 'staleLockDays' ? { min: 1, max: 3650 } : {}) }));
    const approvers = field('approvers', true), admins = field('admins', true), revSkip = field('revSkip'), stale = field('staleLockDays');
    const four = el('input', { type: 'checkbox', name: 'approverNotAuthor', checked: cur.approverNotAuthor });
    const asme = el('input', { type: 'checkbox', name: 'asme', checked: cur.revSkip === ASME_SKIP, onchange: () => { revSkip.value = asme.checked ? ASME_SKIP : ''; } });
    const read = () => ({ approvers: approvers.value, admins: admins.value, approverNotAuthor: four.checked, revSkip: revSkip.value, staleLockDays: stale.value });
    return el('details', { className: 'cc-vault-settings', open: !!st.setOpen, ontoggle: (e) => { st.setOpen = e.target.open; }, dataset: { vaultSettings: '' } },
      el('summary', {}, t('sx.vault.set.title')),
      el('form', { onsubmit: (e) => { e.preventDefault(); saveSettings(read()); } },
        el('label', {}, t('sx.vault.set.approvers'), approvers), el('label', {}, t('sx.vault.set.admins'), admins),
        el('label', { className: 'cc-vault-check' }, four, ' ', t('sx.vault.set.foureyes')),
        el('label', { className: 'cc-vault-check' }, asme, ' ', t('sx.vault.set.asme')),
        el('label', {}, t('sx.vault.set.revskip'), revSkip), el('label', {}, t('sx.vault.set.stale'), stale),
        el('p', { className: 'cc-note' }, t('sx.vault.set.note')),
        el('div', { className: 'cc-vault-acts' }, el('button', { type: 'submit', className: 'cc-vbtn is-primary', disabled: st.busy }, t('sx.vault.set.save')))));
  }

  function detailView(rec) {
    const tabs = ['history', 'revisions', 'uses', 'used'].map((k) => el('label', { className: 'cc-vault-tab' },
      el('input', { type: 'radio', name: 'cc-vault-detail', value: k, checked: st.detail === k, onchange: () => { st.detail = k; render(); } }), ' ', t('sx.vault.detail.' + k)));
    let list;
    if (st.detail === 'history') list = st.events.map((e) => el('li', {}, el('strong', {}, t('sx.vault.ev.' + e.type.replace(/-/g, '_'), { rev: e.rev || '', to: e.to || '', next: e.next || '' })), ' ',
      el('span', { className: 'cc-note' }, [when(e.at), e.by + (e.machine ? ' (' + e.machine + ')' : ''), e.approver ? t('sx.vault.by.approver', { who: e.approver }) : '', e.reason || e.note || ''].filter(Boolean).join(' · '))));
    else if (st.detail === 'revisions') list = [...rec.revs].reverse().map((r) => el('li', { className: 'cc-vault-rev-row', dataset: { vaultRev: r.rev } }, el('strong', {}, r.rev), ' ', el('span', { className: 'cc-note' }, [when(r.at), r.by, r.approver ? t('sx.vault.by.approver', { who: r.approver }) : '', r.note].filter(Boolean).join(' · ')),
      app.revActions?.(rec, r, H) || null));
    else if (st.detail === 'uses') list = usesOf(st.files, rec.id).map((u) => el('li', {}, u.file ? u.file.path + ' (' + u.file.rev + ')' : u.link.ref || u.link.name || '', u.file ? null : el('span', { className: 'cc-note' }, ' ' + t('sx.vault.notinvault')),
      u.link.qty ? el('span', { className: 'cc-note' }, ' × ' + u.link.qty) : null));
    else list = whereUsed(st.files, rec.id).map((u) => el('li', {}, u.file.path + ' (' + u.file.rev + ')'));
    const rows = revisionTable(rec);
    return el('section', { className: 'cc-vault-detail', 'aria-label': t('sx.vault.detail.title', { name: rec.path }) },
      el('div', { className: 'cc-vault-tabs', role: 'radiogroup', 'aria-label': t('sx.vault.detail.title', { name: rec.path }) }, ...tabs),
      list.length ? el('ul', { className: 'cc-vault-events' }, ...list) : el('p', { className: 'cc-note' }, t('sx.vault.detail.none')),
      st.detail === 'revisions' ? app.detail?.(rec, H) || null : null,
      el('div', { className: 'cc-vault-acts' },
        rec.uses?.length ? btn(t('sx.vault.bom'), () => { app.saveBlob?.(base(rec.path).replace(/\.[^.]+$/, '') + '-bom.csv', bomCsv(bom(st.files, rec.id), { head: CSV_COLS.map((k) => t('sx.vault.csv.' + k)), missing: t('sx.vault.notinvault'), cycle: t('sx.vault.csv.cycle'), state: (x) => t(stateKey(x)) }), 'text/csv'); }, 'btn-line', { vaultBom: '' }) : null,
        rows.length ? el('span', { className: 'cc-note' }, t('sx.vault.released.count', { n: rows.length })) : null));
  }

  function fileRow(rec) {
    const acts = actionsFor(rec, { open: isOpen(rec), canOpen: canOpenRec(rec), extras: app.extras || [] });
    const lock = rec.lock;
    const lockText = lock ? t(lock.mine ? 'sx.vault.lock.mine' : lock.stale ? 'sx.vault.lock.stale' : 'sx.vault.lock.other', { who: lock.user, machine: lock.machine, when: when(lock.at) }) : '';
    const modified = st.scan?.modified.includes(rec.id), missing = st.scan?.missing.includes(rec.id);
    const sel = st.sel === rec.id;
    return el('li', { className: 'cc-vault-row' + (sel ? ' is-sel' : ''), dataset: { vaultId: rec.id, vaultState: rec.state } },
      el('button', { type: 'button', className: 'cc-vault-name', 'aria-expanded': String(sel), onclick: async () => { app.onSelect?.(); st.sel = sel ? null : rec.id; st.events = st.sel ? await st.vault.history(rec.id) : []; render(); } },
        el('span', { className: 'cc-vault-path' }, rec.path), ' ', el('span', { className: 'cc-vault-rev' }, rec.rev + (rec.next ? ' → ' + rec.next : ''))),
      el('span', { className: 'cc-vault-chip is-' + rec.state }, t(stateKey(rec.state))),
      lock ? el('span', { className: 'cc-note cc-vault-lock' + (lock.mine ? ' is-mine' : '') }, lockText) : null,
      modified ? el('span', { className: 'cc-note cc-vault-mod' }, t(lock?.mine ? 'sx.vault.modified' : 'sx.vault.modified.unlocked')) : null,
      missing ? el('span', { className: 'cc-note cc-vault-mod' }, t('sx.vault.missing')) : null,
      el('div', { className: 'cc-vault-acts' }, ...acts.map((a) => btn(t('sx.vault.act.' + a), () => start(a, rec), a === 'checkin' || a === 'approve' ? 'btn-plot' : 'btn-line', { vaultAct: a }))),
      sel ? detailView(rec) : null);
  }

  function render() {
    if (!node || node.hidden) return;
    const parts = [];
    if (!st.fsx) {
      parts.push(el('p', { className: 'cc-note' }, t('sx.vault.intro')));
      if (cloudOk()) {
        parts.push(btn(t('sx.vault.cloud.pick'), () => pickCloud(), canPick() ? 'btn-line' : 'btn-plot', { vaultCloud: '' }));
        if (st.cloudList) parts.push(st.cloudList.length ? el('ul', { className: 'cc-vault-cloudlist' }, ...st.cloudList.map((f) => el('li', {}, btn(f.workspace + ' / ' + f.name, () => useCloud(f), 'cc-linkbtn', { vaultCloudFolder: f.uuid }))))
          : el('p', { className: 'cc-note', dataset: { vaultCloudNone: '' } }, t('sx.vault.cloud.none')));
      }
      parts.push(canPick() ? btn(t('sx.vault.pick'), () => pickFolder(), 'btn-plot', { vaultPick: '' }) : el('p', { className: 'cc-note', dataset: { vaultNoFolders: '' } }, cloudOk() ? '' : t('sx.vault.nofolders')));
    } else {
      parts.push(el('p', { className: 'cc-note cc-vault-folder' }, t('sx.vault.folder', { name: st.folder }), ' ', btn(t('sx.vault.pick.other'), () => pickFolder(), 'cc-linkbtn')));
      parts.push(el('p', { className: 'cc-note' }, st.who.user ? t('sx.vault.you', { who: st.who.user, machine: st.who.machine }) : t('sx.vault.you.none'), ' ',
        btn(t('sx.vault.you.change'), () => { st.prompt = { kind: 'who' }; render(); }, 'cc-linkbtn', { vaultWho: '' })));
      if (!st.vault) parts.push(el('p', { className: 'cc-note' }, t('sx.vault.novault')), btn(t('sx.vault.init'), () => { if (!st.who.user) st.prompt = { kind: 'who' }; else st.prompt = { kind: 'init', value: '' }; render(); }, 'btn-plot', { vaultInit: '' }));
      else parts.push(el('p', { className: 'cc-note' }, t(folderNote(st.fsx))));
    }
    const pv = promptView();
    if (pv) parts.push(pv);
    if (st.error) parts.push(el('p', { className: 'cc-note cc-vault-error', role: 'alert' }, st.error));
    if (st.notice) parts.push(el('p', { className: 'cc-note', role: 'status' }, st.notice));
    if (st.vault) {
      parts.push(settingsView());
      parts.push(st.files.length ? el('ul', { className: 'cc-vault-list', 'aria-label': t('sx.vault.files') }, ...st.files.map(fileRow)) : el('p', { className: 'cc-note' }, t('sx.vault.empty')));
      const un = (st.scan?.untracked || []).slice(0, MAX_UNTRACKED);
      if (un.length) parts.push(el('details', { className: 'cc-vault-untracked' }, el('summary', {}, t('sx.vault.untracked', { n: st.scan.untracked.length })),
        el('ul', {}, ...un.map((p) => el('li', {}, el('span', {}, p), ' ', el('span', { className: 'cc-note' }, t('sx.vault.kind.' + kindOf(p))), ' ',
          btn(t('sx.vault.act.add'), () => run(async () => say(await st.vault.add(p), 'sx.vault.done.add', { name: p })), 'btn-line', { vaultAdd: p }))))));
      parts.push(btn(t('sx.vault.refresh'), () => run(async () => {}), 'cc-linkbtn', { vaultRefresh: '' }));
    }
    const had = node.contains(document.activeElement);
    body.replaceChildren(...parts.filter(Boolean));
    if (had && !node.contains(document.activeElement)) (body.querySelector('[data-vault-prompt] input') || node).focus();   // keys stay in the panel (Esc)
  }

  function build() {
    const close = el('button', { type: 'button', className: 'cc-vault-x', 'aria-label': t('sx.vault.close'), title: t('sx.vault.close'), onclick: () => api.close() },
      el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    body = el('div', { className: 'cc-vault-body' });
    node = el('section', { className: 'cc-vaultpanel', tabIndex: -1, role: 'region', 'aria-label': t('sx.vault.title'), dataset: { vaultPanel: '' } },
      el('div', { className: 'cc-vault-head' }, el('h2', { className: 'cc-vault-h' }, t('sx.vault.title')), close), body);
    node.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') { if (st.prompt) { st.prompt = null; render(); } else api.close(); } });
    stage.append(node);
  }
  const api = {
    async open() { if (!node) build(); node.hidden = false; await refresh(); node.querySelector('button')?.focus(); },
    close() { app.onClose?.(); if (node) node.hidden = true; focusCommandLine?.(); },
    get node() { return node; },
    /**
     * SAVE asks this first (cadcraft.js saveFile, in place only): a drawing opened from the vault is saved over only while it is
     * checked out to you. → the sentence to print when SAVE must not go ahead, else null. Read fresh from the vault each time.
     */
    async saveBlocked() {
      const m = app.openRef?.();
      if (!m || !st.vault || m.folder !== st.folder) return null;
      let rec = null;
      try { rec = await st.vault.file(m.id); } catch { return null; }   // an unreadable folder must not trap the person's work
      const key = readOnlyKey(rec);
      if (!key) return null;
      return t(key, { name: rec.path, rev: rec.rev, who: rec.lock?.user || '', machine: rec.lock?.machine || '', state: t(stateKey(rec.state)) });
    },

    state: st,
    /** For tests and Studio: use a VaultFs directly (no picker). */
    async useFolder(fsx, name) { st.fsx = fsx; st.folder = name; st.vault = await openVault(fsx, ctx()); await refresh(); },
  };
  const H = { st, run, say, btn, render, refresh, print, t, el };
  return api;
}
