/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cloud-panel.js — the right-panel tab (PC.2 / PC.10): open a file, look at what it is and what a build needs from this browser's
 * storage, build with progress / Cancel / Resume, the list of clouds on this computer, and how they are drawn (colour, size, budget).
 * The other parts (clean, classify, surface, section) mount their own folds below it.
 */
import { el, field, select, progressRow, dialog } from './ui.js';
import { fmtN, fmt, bytesText, saveFolderHandle, loadFolderHandle } from './ctx.js';

export function mountPanel(ctx, root, mounts) {
  const t = ctx.t;
  const fileIn = el('input', { type: 'file', accept: '.las,.laz', 'data-pc-file': '' });
  const infoBox = el('div', { 'data-pc-info': '', className: 'pc-note' });
  const buildBtn = el('button', { type: 'button', className: 'btn-plot', disabled: true, 'data-pc-build': '' }, t('pc.build'));
  let ctl = null, picked = null, resumeId = null;
  const prog = progressRow(t('pc.cancel'), () => ctl && ctl.abort());
  prog.row.setAttribute('data-pc-progress', '');
  const resumeBtn = el('button', { type: 'button', className: 'btn-line', hidden: true, 'data-pc-resume': '' }, t('pc.resume'));
  const list = el('ul', { className: 'pc-list', 'data-pc-list': '' });
  const stats = el('div', { className: 'pc-note', 'data-pc-stats': '', role: 'status' });
  ctx.statusEl = el('div', { className: 'pc-note', 'data-pc-status': '', role: 'status' });

  // ---- open + inspect
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files && fileIn.files[0];
    infoBox.replaceChildren(); buildBtn.disabled = true; picked = null;
    if (!f) return;
    try {
      const info = await ctx.PC.inspect(f);
      let est = null;
      try { est = await navigator.storage.estimate(); } catch { /* the browser will not say */ }
      const need = info.estimate.storeBytes + info.estimate.spillBytes, free = est ? est.quota - est.usage : null;
      const rows = [
        [t('pc.info.points'), fmtN(info.available)],
        [t('pc.info.size'), bytesText(f.size)],
        [t('pc.info.extent'), fmt(info.max[0] - info.min[0], 1) + ' × ' + fmt(info.max[1] - info.min[1], 1) + ' × ' + fmt(info.max[2] - info.min[2], 1)],
        [t('pc.info.format'), (info.kind || '').toUpperCase() + ' ' + (info.version || '') + ' / ' + t('pc.info.pointformat', { n: info.format })],
        [t('pc.info.crs'), info.crs ? String(info.crs.name || info.code || info.crs) : t('pc.info.crs.none')],
        [t('pc.info.need'), bytesText(need)],
        [t('pc.info.free'), free == null ? t('pc.info.free.unknown') : bytesText(free)],
      ];
      const tb = el('table', { className: 'pc-table' }, ...rows.map(([k, v]) => el('tr', {}, el('th', {}, k), el('td', {}, v))));
      infoBox.append(tb, ...(info.notes || []).map((n) => el('div', {}, String(n))));
      const short = free != null && need > free;
      if (short) infoBox.append(el('div', { className: 'pc-warn', 'data-pc-short': '' }, t('pc.info.short', { need: bytesText(need), free: bytesText(free) })));
      picked = { file: f, info };
      buildBtn.disabled = short;
      resumeBtn.hidden = !resumeId;
    } catch (e) { infoBox.append(el('div', { className: 'pc-warn' }, ctx.err(e))); }
  });

  // ---- build
  async function runBuild(resume) {
    if (!picked) return;
    ctl = new AbortController();
    buildBtn.disabled = true; resumeBtn.hidden = true;
    const id = resume && resumeId ? resumeId : 'c' + Date.now().toString(36);
    resumeId = id;
    const name = picked.file.name.replace(/\.[^.]+$/, '');
    try {
      prog.set(0, t('pc.progress.start'));
      const cloud = await ctx.PC.buildCloud(picked.file, ctx.getStore(), {
        id, name, resume: !!resume, signal: ctl.signal,
        progress: (f, phase) => prog.set(f, t('pc.progress.' + phase) !== 'pc.progress.' + phase ? t('pc.progress.' + phase) + ' ' + Math.round(f * 100) + ' %' : Math.round(f * 100) + ' %'),
      });
      resumeId = null;
      prog.hide();
      ctx.status(t('pc.built', { name, count: fmtN(cloud.count) }));
      await refreshList();
      await openById(id);
    } catch (e) {
      prog.hide();
      if (ctx.isAbort(e)) { ctx.status(t('pc.stopped')); resumeBtn.hidden = false; }
      else { ctx.status(ctx.err(e)); resumeBtn.hidden = !resumeId; }
    } finally { buildBtn.disabled = false; ctl = null; }
  }
  buildBtn.addEventListener('click', () => runBuild(false));
  resumeBtn.addEventListener('click', () => runBuild(true));

  // ---- where the clouds are kept: this browser's own storage, or a folder you choose (a 10 GB tiled cloud does not have to fit the browser's quota)
  const canFolder = typeof window.showDirectoryPicker === 'function';
  const where = el('div', { className: 'pc-note', 'data-pc-where': '', role: 'status' });
  const pickBtn = el('button', { type: 'button', className: 'btn-line', hidden: !canFolder, 'data-pc-folder-pick': '' }, t('pc.where.pick'));
  const backBtn = el('button', { type: 'button', className: 'btn-line', hidden: true, 'data-pc-folder-reset': '' }, t('pc.where.back'));
  const againBtn = el('button', { type: 'button', className: 'btn-line', hidden: true, 'data-pc-folder-again': '' }, '');
  let savedHandle = null;
  const showWhere = () => {
    where.textContent = ctx.folderName ? t('pc.where.folder', { name: ctx.folderName }) : t('pc.where.browser');
    backBtn.hidden = !ctx.folderName; againBtn.hidden = !(savedHandle && !ctx.folderName);
    if (savedHandle) againBtn.textContent = t('pc.where.again', { name: savedHandle.name });
  };
  async function switchTo(handle) {
    if (ctx.cloud) await ctx.setCloud(null);
    ctx.useFolder(handle);
    await saveFolderHandle(handle);
    savedHandle = handle;
    showWhere(); await refreshList();
    ctx.emit('store');
  }
  pickBtn.addEventListener('click', async () => {
    try { await switchTo(await window.showDirectoryPicker({ id: 'cc-clouds', mode: 'readwrite', startIn: 'documents' })); ctx.status(t('pc.where.set', { name: ctx.folderName })); }
    catch (e) { if (!e || e.name !== 'AbortError') ctx.status(ctx.err(e)); }
  });
  backBtn.addEventListener('click', async () => { await switchTo(null); ctx.status(t('pc.where.reset')); });
  againBtn.addEventListener('click', async () => {
    try { if (savedHandle && (await savedHandle.requestPermission({ mode: 'readwrite' })) === 'granted') { await switchTo(savedHandle); ctx.status(t('pc.where.set', { name: ctx.folderName })); } }
    catch (e) { ctx.status(ctx.err(e)); }
  });
  (async () => {   // the folder chosen last time: used straight away when the browser still allows it, else one button asks again
    if (!canFolder) return;
    savedHandle = await loadFolderHandle();
    if (savedHandle && savedHandle.queryPermission && (await savedHandle.queryPermission({ mode: 'readwrite' })) === 'granted') { ctx.useFolder(savedHandle); await refreshList(); }
    showWhere();
  })().catch(() => {});

  // ---- the clouds on this computer
  async function listIds() {
    const keys = await ctx.getStore().list('cct/');
    return [...new Set(keys.map((k) => k.split('/')[1]).filter(Boolean))];
  }
  async function refreshList() {
    list.replaceChildren();
    let ids = [];
    try { ids = await listIds(); } catch (e) { list.append(el('li', {}, ctx.err(e))); return; }
    if (!ids.length) list.append(el('li', { className: 'pc-note' }, t('pc.list.empty')));
    for (const id of ids) {
      let meta = null, building = false;
      try {
        const b = await ctx.getStore().get('cct/' + id + '/cloud.json');
        meta = b ? JSON.parse(new TextDecoder().decode(b)) : null;
        building = !!(meta && meta.building) || !meta;
      } catch { /* unreadable */ }
      const label = meta ? (meta.name || id) + (building ? ' (' + t('pc.list.unfinished') + ')' : ' · ' + fmtN(meta.count)) : id + ' (' + t('pc.list.unfinished') + ')';
      const isOpen = ctx.cloud && ctx.cloud.id === id;
      const li = el('li', { 'data-pc-cloud': id },
        el('span', {}, label),
        el('span', { className: 'pc-row' },
          building ? el('button', { type: 'button', className: 'btn-line', onclick: () => { resumeId = id; ctx.status(t('pc.list.resume.hint')); fileIn.click(); } }, t('pc.resume'))
            : el('button', { type: 'button', className: 'btn-line', disabled: isOpen, 'data-pc-open': id, onclick: () => openById(id) }, isOpen ? t('pc.list.open.now') : t('pc.list.open')),
          el('button', { type: 'button', className: 'btn-line', 'data-pc-remove': id, onclick: () => confirmRemove(id, label) }, t('pc.list.remove'))));
      list.append(li);
    }
  }
  async function openById(id) {
    try {
      ctx.status(t('pc.opening'));
      const cloud = await ctx.PC.openCloud(ctx.getStore(), id);
      await ctx.setCloud(cloud);
      ctx.status(t('pc.opened', { name: cloud.meta.name || id, count: fmtN(cloud.count) }));
      await refreshList();
    } catch (e) { ctx.status(ctx.err(e)); }
  }
  function confirmRemove(id, label) {
    dialog({ title: t('pc.remove.title'), body: el('p', {}, t('pc.remove.body', { name: label })), buttons: [
      { label: t('pc.cancel'), onClick: (close) => close() },
      { label: t('pc.list.remove'), kind: 'plot', attr: 'data-pc-remove-yes', onClick: async (close) => {
        close();
        try {
          if (ctx.cloud && ctx.cloud.id === id) await ctx.setCloud(null);
          const st = ctx.getStore();
          for (const k of await st.list('cct/' + id + '/')) await st.delete(k);
          await refreshList();
        } catch (e) { ctx.status(ctx.err(e)); }
      } }] });
  }
  ctx.openCloudById = openById;
  ctx.refreshCloudList = refreshList;

  // ---- how it is drawn
  const mode = select([['rgb', t('pc.mode.rgb')], ['height', t('pc.mode.height')], ['class', t('pc.mode.class')], ['intensity', t('pc.mode.intensity')], ['residual', t('pc.mode.residual')]], 'height', { 'data-pc-mode': '' });
  mode.addEventListener('change', () => {
    if (mode.value === 'residual' && !ctx.resid) mode.value = 'height';
    ctx.view.setMode(mode.value);
    ctx.emit('mode');
  });
  const size = el('input', { type: 'range', min: 1, max: 8, step: 0.5, value: 2, 'data-pc-size': '' });
  size.addEventListener('input', () => ctx.view.setSize(Number(size.value)));
  const atten = el('input', { type: 'checkbox', 'data-pc-atten': '' });
  atten.addEventListener('change', () => ctx.view.setAttenuation(atten.checked));
  const edlBox = el('input', { type: 'checkbox', checked: !ctx.view.phone, 'data-pc-edl': '' });
  edlBox.addEventListener('change', () => ctx.view.setEdl(edlBox.checked));
  const budget = select([[250000, '250 k'], [500000, '500 k'], [1000000, '1 M'], [2500000, '2.5 M'], [5000000, '5 M']], ctx.view.budget, { 'data-pc-budget': '' });
  budget.addEventListener('change', () => ctx.view.setBudget(Number(budget.value)));
  const planBox = el('input', { type: 'checkbox', checked: true, 'data-pc-plan': '' });
  planBox.addEventListener('change', () => mounts.plan.setVisible(planBox.checked));
  const fitBtn = el('button', { type: 'button', className: 'btn-line', 'data-pc-fit': '', onclick: () => ctx.cloud && ctx.view.fit() }, t('pc.fit'));
  const show3d = el('button', { type: 'button', className: 'btn-line', 'data-pc-3d': '', onclick: async () => { if (ctx.cloud) { await ctx.view.attach(); ctx.view.fit(); } } }, t('pc.show3d'));

  ctx.on('cloud', (cloud) => {
    mode.value = cloud && cloud.meta.attrs && cloud.meta.attrs.rgb ? 'rgb' : 'height';
    if (cloud) ctx.view.setMode(mode.value);
    refreshList();
  });
  ctx.on('surface', () => { if (ctx.resid) mode.querySelector('option[value=residual]').disabled = false; });
  mode.querySelector('option[value=residual]').disabled = true;
  const statTimer = setInterval(() => {
    if (!ctx.cloud || !ctx.view.attached) { stats.textContent = ''; return; }
    const s = ctx.view.stats();
    stats.textContent = t('pc.stats', { drawn: fmtN(s.drawn), budget: fmtN(s.budget), nodes: s.loaded, loading: s.loading, mb: Math.round(s.cachedMB) });
  }, 500);
  ctx.api.onDeactivate(() => clearInterval(statTimer));

  root.append(
    el('p', { className: 'pc-note' }, t('pc.privacy')),
    el('p', { className: 'pc-note' }, t('pc.numbers')),
    el('details', { open: true, 'data-pc-sec': 'open' }, el('summary', {}, t('pc.sec.open')),
      field(t('pc.file'), fileIn), infoBox, el('div', { className: 'pc-row' }, buildBtn, resumeBtn), prog.row),
    el('details', { open: true, 'data-pc-sec': 'clouds' }, el('summary', {}, t('pc.sec.clouds')), list,
      where, el('div', { className: 'pc-row' }, pickBtn, againBtn, backBtn), canFolder ? el('p', { className: 'pc-note' }, t('pc.where.hint')) : null),
    el('details', { open: true, 'data-pc-sec': 'display' }, el('summary', {}, t('pc.sec.display')),
      field(t('pc.mode'), mode), field(t('pc.size'), size), field(t('pc.budget'), budget),
      el('label', { className: 'cv-check' }, atten, t('pc.atten')), el('label', { className: 'cv-check' }, edlBox, t('pc.edl')),
      el('label', { className: 'cv-check' }, planBox, t('pc.plan')), el('div', { className: 'pc-row' }, fitBtn, show3d), stats),
    ...mounts.folds,
    ctx.statusEl);
  showWhere();
  refreshList().catch(() => {});
}
