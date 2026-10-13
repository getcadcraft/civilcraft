/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-crs-ui.js — the coordinate system dialog (GIS › Coordinates), the latitude/longitude readout in the status bar and
 * reg.pickCrs for the other GIS parts (docs/GIS-SPEC.md §4.1). Builder C. The maths is in crs.js and crs-pick.js.
 *
 *   install(host)  registers: commands 'crs' · reg.pickCrs · status (lat/long) · onProject · an opener for a lone .prj
 *   reg.pickCrs({ reason, near: [lon, lat], purpose: 'project' | 'source' }) → state.crs-shaped object (not applied) | null
 *     'project' (default): must suit the project (crsProblem with its units); 'source': any system, geographic too —
 *     for "what system is this file in"
 *   reg.crsChange: called (before, after, { converted }) after the dialog changes state.crs; converted = the project's
 *     coordinates were converted into the new system in the same undo step (else nothing moved)
 *
 * The dialog: what the project's system is now · pick (search by code or name; "Systems these coordinates fit"; systems
 * near a typed latitude/longitude; a .prj file opened or dropped) · the chosen system's facts and whether it can be the
 * project's · Grid / Ground (combined scale factor typed or computed at a point) / Local (two control points) · Apply —
 * one undo step. Everything from a file reaches the page as text (el()).
 */

import { el } from './ui-util.js';
import { search, suggest, byCode, crsFromEntry, crsFromPrj, crsProblem, frame, localFromPairs, groundLocal, loadGrid, gridInfo, suggestGrids, GRID_CDN } from './crs.js';
import { t } from './i18n.js';   // 0.4 V11
import { systemsThatFit, describe, latLonText, parseLatLon, gridOf, misclosure, groundFactor, reprojectProject, unitWords } from './crs-pick.js';

const sameBase = (a, b) => !!a && !!b && a.proj4 === b.proj4 && (a.code ?? null) === (b.code ?? null);
const fx = (v, d = 3) => (Number.isFinite(v) ? Number(v.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d }) : '—');
/** A sentence with one fill shown as <strong>: the language file's text split round {name}. */
const strongIn = (key, name, value) => t(key).split('{' + name + '}').flatMap((part, i) => (i ? [el('strong', {}, value), part] : [part])).filter((x) => x !== '');
const numIn = (v) => { const s = String(v ?? '').trim().replace(/,/g, ''); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : NaN; };
let uid = 0;

export function install(host) {
  const { reg } = host;
  const units = () => host.project.state.units;

  // ---------------------------------------------------------------- latitude / longitude in the status bar
  const out = host.root.querySelector('[data-latlon]');
  let fr = null, frKey = null;
  const frameNow = () => {
    // 0.4 V11: the key changes once the project's grid shift file loads
    const c = host.project.state.crs, k = c ? JSON.stringify(c) + units() + (c.grid && gridInfo(c.grid) ? '+grid' : '') : '';
    if (k !== frKey) { frKey = k; fr = null; if (c && !crsProblem(c, units())) { try { fr = frame(c); } catch { fr = null; } } }
    return fr;
  };
  function showLatLon(cur) {
    if (!out) return;
    const f = frameNow();
    out.hidden = !f;
    if (!f) { out.textContent = ''; return; }
    if (!cur) { out.textContent = t('crs.d.latlon.none'); return; }
    try { const [lon, lat] = f.toLonLat(cur.x, cur.y); out.textContent = latLonText(lon, lat, host.settings.latlon); } catch { out.textContent = t('crs.d.latlon.off'); }
  }
  reg.status.push(showLatLon);
  reg.onProject.push(() => showLatLon(host.cursor));
  const settingsDlg = document.querySelector('[data-app-settings]');
  settingsDlg?.addEventListener('change', (e) => { if (e.target.name === 'cvLatlon') showLatLon(host.cursor); });
  settingsDlg?.addEventListener('cc-settings-reset', () => showLatLon(host.cursor));
  window.addEventListener('storage', (e) => { if (e.key === 'civilcraft.settings') setTimeout(() => showLatLon(host.cursor), 0); });
  host.project.on?.(() => showLatLon(host.cursor));
  showLatLon(host.cursor);

  // ---------------------------------------------------------------- registry
  reg.commands.set('crs', () => openDialog({ mode: 'project' }));
  reg.pickCrs = ({ reason = '', near = null, purpose = 'project' } = {}) => openDialog({ mode: 'pick', reason, near, purpose });
  reg.openers.push({
    accepts: (files) => files.length === 1 && /\.prj$/i.test(files[0].name),
    open: (files) => openDialog({ mode: 'project', prjFile: files[0] }),
  });

  // ---------------------------------------------------------------- the dialog
  let openNow = null;
  function openDialog(opts) {
    if (openNow) return openNow;
    openNow = new Promise((resolve) => runDialog(opts, resolve)).finally(() => { openNow = null; });
    return openNow;
  }

  function runDialog({ mode, reason = '', near = null, purpose = 'project', prjFile = null }, resolve) {
    const p = host.project, s = p.state, id = 'cv-crs-' + (++uid);
    const pick = mode === 'pick';
    const forProject = !pick || purpose !== 'source';
    let current = s.crs;   // (0.4 V11: a grid added in the dialog changes it)
    let chosen = !pick && current ? { crs: { ...current, local: null }, entry: current.code != null ? safeByCode(current.code) : null, notes: [] } : null;
    let done = false, picking = null;

    // the project's middle (for "fits" and for the ground factor) and where it is, when that is known
    const ext = host.extentsAll();
    const hasData = !!ext && (p.points.length > 0 || !!p.eg?.().surface);
    const mid = ext ? { x: (ext.minX + ext.maxX) / 2, y: (ext.minY + ext.maxY) / 2 } : null;
    let here = near && near.every?.(Number.isFinite) ? near : null;
    if (!here && current && mid) { try { here = frame(current).toLonLat(mid.x, mid.y); } catch { here = null; } }

    const $ = (sel) => dlg.querySelector(sel);
    const list = el('ul', { className: 'cv-crs-list', role: 'listbox', 'aria-label': t('crs.d.list') });
    const listHead = el('p', { className: 'cv-note cv-crs-listhead', 'aria-live': 'polite' });
    const q = el('input', { type: 'search', className: 'cv-input', id: id + '-q', placeholder: t('crs.d.search.ph'), autocomplete: 'off', spellcheck: 'false' });
    // i18n-ignore: example numbers
    const nearIn = el('input', { type: 'text', className: 'cv-input', id: id + '-near', placeholder: '30.27, -97.74', autocomplete: 'off', value: here ? here[1].toFixed(5) + ', ' + here[0].toFixed(5) : '' });
    const prjIn = el('input', { type: 'file', accept: '.prj,.txt,.wkt', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true' });
    const chosenBox = el('div', { className: 'cv-crs-chosen', 'aria-live': 'polite' });
    const problemBox = el('p', { className: 'cv-crs-problem', role: 'alert', hidden: true });
    const applyBtn = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', dataset: { crsApply: '' } }, pick ? t('vec.ask.go') : t('crs.d.apply'));

    // grid / ground / local (project mode)
    const modeName = id + '-mode';
    const cur = current?.local;
    const curIsGround = !!cur && cur.rotation === 0 && cur.from[0] === cur.to[0] && cur.from[1] === cur.to[1];
    let gmode = !cur ? 'grid' : curIsGround ? 'ground' : 'local';
    const radio = (v, label) => el('label', {}, el('input', { type: 'radio', name: modeName, value: v, checked: gmode === v, dataset: { crsMode: v } }), ' ' + label);
    const csf = el('input', { type: 'text', className: 'cv-input', id: id + '-csf', inputMode: 'decimal', value: curIsGround ? String(cur.scale) : '', placeholder: '0.99987', dataset: { crsCsf: '' } });
    const baseE = el('input', { type: 'text', className: 'cv-input', id: id + '-be', inputMode: 'decimal', value: curIsGround ? String(cur.from[0]) : '0' });
    const baseN = el('input', { type: 'text', className: 'cv-input', id: id + '-bn', inputMode: 'decimal', value: curIsGround ? String(cur.from[1]) : '0' });
    const atE = el('input', { type: 'text', className: 'cv-input', id: id + '-ae', inputMode: 'decimal', value: mid ? mid.x.toFixed(2) : '' });
    const atN = el('input', { type: 'text', className: 'cv-input', id: id + '-an', inputMode: 'decimal', value: mid ? mid.y.toFixed(2) : '' });
    const atZ = el('input', { type: 'text', className: 'cv-input', id: id + '-az', inputMode: 'decimal', value: '' });
    const factorsBox = el('div', { className: 'cv-crs-factors', 'aria-live': 'polite' });
    const cps = [0, 1, 2].map((i) => ({
      n: el('input', { type: 'text', className: 'cv-input', id: `${id}-c${i}n`, placeholder: t('crs.d.cp.no'), autocomplete: 'off', dataset: { crsCp: String(i) } }),
      at: el('span', { className: 'cv-note cv-crs-at' }),
      ge: el('input', { type: 'text', className: 'cv-input', id: `${id}-c${i}e`, inputMode: 'decimal', placeholder: t('crs.d.cp.ge.ph') }),
      gn: el('input', { type: 'text', className: 'cv-input', id: `${id}-c${i}g`, inputMode: 'decimal', placeholder: t('crs.d.cp.gn.ph') }),
      ll: el('input', { type: 'text', className: 'cv-input', id: `${id}-c${i}l`, placeholder: t('crs.d.cp.ll.ph') }),
      xy: null,
    }));
    const localBox = el('div', { className: 'cv-crs-factors', 'aria-live': 'polite' });
    if (cur && !curIsGround) {
      cps[0].xy = [...cur.from]; cps[0].ge.value = String(cur.to[0]); cps[0].gn.value = String(cur.to[1]); cps[0].at.textContent = t('crs.d.en', { e: fx(cur.from[0]), n: fx(cur.from[1]) });
    }

    const pickBtn = (label, what) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { crsPickPlan: what } }, el('i', { className: 'bi bi-crosshair', 'aria-hidden': 'true' }), ' ' + label);
    const u = unitWords(units() === 'm' ? 'm' : 'ft');
    const gridPanel = el('div', { className: 'cv-crs-mode', dataset: { crsPanel: 'grid' } },
      el('p', { className: 'cv-note' }, t('crs.d.grid.note')));
    const groundPanel = el('div', { className: 'cv-crs-mode', dataset: { crsPanel: 'ground' } },
      el('p', { className: 'cv-note' }, t('crs.d.ground.note')),
      el('div', { className: 'cv-props' },
        el('label', { htmlFor: csf.id }, t('crs.d.csf')), csf,
        el('label', { htmlFor: baseE.id }, t('crs.d.base.e')), baseE,
        el('label', { htmlFor: baseN.id }, t('crs.d.base.n')), baseN),
      el('p', { className: 'cv-note' }, t('crs.d.base.note')),
      el('h3', { className: 'cv-h3' }, t('crs.d.factor.head')),
      el('div', { className: 'cv-props' },
        el('label', { htmlFor: atE.id }, t('crs.d.e')), atE, el('label', { htmlFor: atN.id }, t('crs.d.n')), atN,
        el('label', { htmlFor: atZ.id }, t('crs.d.elev', { unit: units() === 'm' ? 'm' : 'ft' })), atZ),
      el('div', { className: 'cv-links' }, pickBtn(t('crs.d.pick.point'), 'factor'), el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { crsCompute: '' } }, t('crs.d.compute'))),
      factorsBox);
    const cpRow = (i, title) => el('fieldset', { className: 'cv-crs-cp' }, el('legend', {}, title),
      el('div', { className: 'cv-crs-cprow' }, el('label', { className: 'visually-hidden', htmlFor: cps[i].n.id }, t('crs.d.cp.num', { point: title })), cps[i].n, pickBtn(t('crs.d.pick'), 'cp' + i), cps[i].at),
      el('div', { className: 'cv-crs-cprow' }, el('label', { className: 'visually-hidden', htmlFor: cps[i].ge.id }, t('crs.d.cp.ge', { point: title })), cps[i].ge, el('label', { className: 'visually-hidden', htmlFor: cps[i].gn.id }, t('crs.d.cp.gn', { point: title })), cps[i].gn,
        el('label', { className: 'visually-hidden', htmlFor: cps[i].ll.id }, t('crs.d.cp.ll', { point: title })), cps[i].ll));
    const localPanel = el('div', { className: 'cv-crs-mode', dataset: { crsPanel: 'local' } },
      el('p', { className: 'cv-note' }, t('crs.d.local.note')),
      cpRow(0, t('crs.d.cp1')), cpRow(1, t('crs.d.cp2')), cpRow(2, t('crs.d.cp3')),
      localBox);
    const gglPanel = el('section', { className: 'cv-crs-sec', hidden: pick },
      el('h3', { className: 'cv-h3' }, t('crs.d.ggl')),
      el('div', { className: 'shell-seg cv-crs-seg', role: 'radiogroup', 'aria-label': t('crs.d.ggl') }, radio('grid', t('crs.d.mode.grid')), radio('ground', t('crs.d.mode.ground')), radio('local', t('crs.d.mode.local'))),
      gridPanel, groundPanel, localPanel);

    const nowBox = el('div', { className: 'cv-crs-now' });
    // 0.4 V11: the grid shift file for the project's system (its datum shift), applied at once, one undo step each
    const gridSec = el('section', { className: 'cv-crs-sec', dataset: { gridSec: '' }, hidden: true });
    const gridIn = el('input', { type: 'file', accept: '.gsb,.tif,.tiff', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true' });
    function renderGrid(msg = '', bad = false) {
      const c = current;
      const sug = suggestGrids(c);
      const acc = c?.code != null ? safeByCode(c.code)?.shiftAccuracy : undefined;   // a grid helps where the shift is rough or unknown
      gridSec.hidden = pick || !c || (!c.grid && !sug.length && !(acc === null || acc > 1) && !/NAD27/i.test(c.name || ''));
      if (gridSec.hidden) return;
      const g = c.grid ? gridInfo(c.grid) : null;
      const kids = [el('h3', { className: 'cv-h3' }, t('grid.head'))];
      kids.push(el('p', { className: 'cv-note', dataset: { gridStatus: '' } }, c.grid ? (g ? t('grid.using', { name: g.name, kind: g.kind === 'ntv2' ? 'NTv2' : 'GeoTIFF', w: g.extent[0].toFixed(2), s: g.extent[1].toFixed(2), e: g.extent[2].toFixed(2), n: g.extent[3].toFixed(2) }) : t('grid.shift.missing', { name: c.grid })) : t('grid.none')));
      if (g && here) { const inside = here[0] >= g.extent[0] && here[0] <= g.extent[2] && here[1] >= g.extent[1] && here[1] <= g.extent[3]; kids.push(el('p', { className: inside ? 'cv-note' : 'cv-crs-problem', dataset: { gridInside: inside ? '1' : '0' } }, t(inside ? 'grid.inside' : 'grid.outside'))); }
      const btns = [];
      for (const q of sug) if (q.name !== c.grid || !g) btns.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { gridCdn: q.name } }, el('i', { className: 'bi bi-cloud-download', 'aria-hidden': 'true' }), ' ', t('grid.cdn', { label: q.label, size: (q.size / 1048576).toFixed(q.size < 1048576 ? 2 : 1) })));
      btns.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { gridFile: '' } }, t('grid.file')));
      if (c.grid) btns.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { gridOff: '' } }, t('grid.off')));
      kids.push(el('div', { className: 'cv-links' }, ...btns), gridIn);
      if (msg) kids.push(el('p', { className: bad ? 'cv-crs-problem' : 'cv-note', role: bad ? 'alert' : null, dataset: { gridMsg: '' } }, msg));
      kids.push(el('p', { className: 'cv-note' }, t('grid.note')));
      gridSec.replaceChildren(...kids);
    }
    async function useGrid(name, bytes) {
      let info;
      try { info = await loadGrid(name, bytes); } catch (e) { renderGrid(e.message, true); return; }
      const before = current;
      p.crsGrids.set(info.name, bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
      p.change(t('grid.undo.on'), (st) => { st.crs = { ...st.crs, grid: info.name }; });
      current = p.state.crs;
      for (const f of reg.crsChange) { try { f(before, current, { converted: false }); } catch (e) { console.warn(e); } }
      renderNow(); renderGrid(t('grid.done', { name: info.name }));
      host.say(t('grid.done', { name: info.name }));
      showLatLon(host.cursor);
    }
    gridSec.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.gridFile !== undefined) gridIn.click();
      else if (b.dataset.gridOff !== undefined) {
        const before = current;
        p.change(t('grid.undo.off'), (st) => { const c = { ...st.crs }; delete c.grid; st.crs = c; });
        current = p.state.crs;
        for (const f of reg.crsChange) { try { f(before, current, { converted: false }); } catch (err) { console.warn(err); } }
        renderNow(); renderGrid(t('grid.offdone')); showLatLon(host.cursor);
      } else if (b.dataset.gridCdn) {
        const name = b.dataset.gridCdn;
        b.disabled = true; renderGrid(t('grid.fetching', { name }));
        try {
          const r = await fetch(GRID_CDN + name);
          if (!r.ok) throw new Error(t('grid.fetch.http', { status: r.status }));
          await useGrid(name, new Uint8Array(await r.arrayBuffer()));
        } catch (err) { renderGrid(t('grid.fetch.fail', { msg: err.message }), true); }
      }
    });
    gridIn.addEventListener('change', async () => {
      const f = gridIn.files?.[0];
      gridIn.value = '';
      if (!f) return;
      if (f.size > 20 * 1024 * 1024) { renderGrid(t('grid.big'), true); return; }
      await useGrid(f.name, new Uint8Array(await f.arrayBuffer()));
    });
    const dlg = el('dialog', { className: 'cv-dialog cv-crs', 'aria-labelledby': id + '-h', dataset: { crsDialog: mode } },
      el('form', { method: 'dialog', className: 'cv-dlg', onsubmit: (e) => e.preventDefault() },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, pick ? t('crs.d.title.pick') : t('vec.import.crs')),
          el('button', { type: 'button', className: 'cv-x', 'aria-label': t('vec.close'), dataset: { close: '' } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }))),
        el('div', { className: 'cv-dlg-body' },
          reason ? el('p', { className: 'cv-crs-reason' }, reason) : null,
          pick ? null : nowBox,
          gridSec,
          el('section', { className: 'cv-crs-sec' },
            el('h3', { className: 'cv-h3' }, pick || !current ? t('crs.d.pick.head') : t('crs.d.change.head')),
            el('div', { className: 'cv-props' },
              el('label', { htmlFor: q.id }, t('crs.d.search')), q,
              el('label', { htmlFor: nearIn.id }, t('crs.d.near')), el('div', { className: 'cv-row' }, nearIn, el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { crsNear: '' } }, t('crs.d.suggest')))),
            el('div', { className: 'cv-links' },
              hasData ? el('button', { type: 'button', className: 'cv-linkbtn', dataset: { crsFits: '' } }, t('crs.d.fits')) : null,
              el('button', { type: 'button', className: 'cv-linkbtn', dataset: { crsPrj: '' } }, t('crs.d.prj')), prjIn),
            listHead, list),
          el('section', { className: 'cv-crs-sec' }, el('h3', { className: 'cv-h3' }, t('crs.d.chosen')), chosenBox, problemBox),
          gglPanel),
        el('div', { className: 'cv-dlg-foot' },
          !pick && current ? el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-crs-remove', dataset: { crsRemove: '' } }, t('crs.d.remove')) : null,
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { close: '' } }, t('vec.cancel')),
          applyBtn)));

    // ---------------- now
    function renderNow() {
      if (!current) { nowBox.replaceChildren(el('p', { className: 'cv-crs-none' }, ...strongIn('crs.d.none', 'none', t('crs.d.none.word')))); return; }
      const d = describe(current);
      nowBox.replaceChildren(el('h3', { className: 'cv-h3' }, t('crs.d.now')), facts(d));
    }
    function facts(d) {
      return el('dl', { className: 'cv-dl cv-crs-dl' },
        el('dt', {}, t('vec.ask.system')), el('dd', {}, d.name),
        el('dt', {}, t('crs.d.f.code')), el('dd', {}, d.code != null ? String(d.code) : t('crs.d.f.code.none')),
        el('dt', {}, t('crs.d.f.unit')), el('dd', {}, d.unit),
        el('dt', {}, t('crs.d.f.shift')), el('dd', {}, d.shift),
        el('dt', {}, t('crs.d.f.area')), el('dd', {}, d.area),
        el('dt', {}, t('crs.d.f.coords')), el('dd', {}, d.local));
    }

    // ---------------- lists
    let listing = [];
    function showList(head, entries, extra = () => '') {
      listing = entries;
      listHead.textContent = head;
      list.replaceChildren(...entries.map((e, i) => {
        const fam = e.unit === 'deg' ? t('crs.unit.deg') : unitWords(e.unit);
        const mismatch = forProject && e.unit !== 'deg' && (e.unit === 'm') !== (units() === 'm');
        const sel = chosen?.entry && chosen.entry.code === e.code;
        return el('li', { role: 'option', 'aria-selected': sel ? 'true' : 'false' },
          el('button', { type: 'button', className: 'cv-crs-item' + (sel ? ' is-sel' : ''), dataset: { crsCode: String(e.code), i: String(i) } },
            el('span', { className: 'cv-crs-name' }, e.name),
            el('span', { className: 'cv-crs-meta' }, 'EPSG:' + e.code + ' · ' + fam + (mismatch ? ' ' + t(units() === 'm' ? 'crs.d.mismatch.m' : 'crs.d.mismatch.ft') : '') + extra(e))));
      }));
    }
    function doSearch() {
      const qt = q.value.trim();
      if (!qt) { defaultList(); return; }
      const hits = search(qt, { near: here, limit: 60 }).filter((e) => !forProject || !e.geographic);
      const count = hits.length + (hits.length === 60 ? '+' : '');
      showList(hits.length ? t(here ? 'crs.d.match.near' : 'crs.d.match', { count, q: qt.slice(0, 60) }) : t('crs.d.nomatch', { q: qt.slice(0, 60) }), hits);
    }
    let fitsCache = null;
    function doFits() {
      if (!mid) return;
      fitsCache ||= systemsThatFit(mid, units(), { limit: 60 });
      const { list: l, total } = fitsCache;
      const where = new Map(l.map((x) => [x.entry.code, x]));
      const unit = t(units() === 'm' ? 'crs.unit.m' : 'gread.unit.ft'), e = fx(mid.x, 0), n = fx(mid.y, 0);
      showList(total
        ? t('crs.d.fit', { n: total, unit, e, n2: n }) + (total > l.length ? ' ' + t('crs.d.fit.first', { n: l.length }) : '')
        : t('crs.d.fit.none', { unit, e, n }),
      l.map((x) => x.entry), (ent) => { const w = where.get(ent.code); return w ? ' · ' + t('crs.d.middleat', { at: latLonText(w.lon, w.lat, 'dd') }) : ''; });
    }
    function doNear() {
      const ll = parseLatLon(nearIn.value);
      if (!ll) { listHead.textContent = t('crs.d.near.bad'); list.replaceChildren(); return; }
      here = ll;
      const sg = suggest(ll, { unit: forProject ? units() : null, limit: 40 });
      showList(sg.length ? t('crs.d.near.list', { place: latLonText(ll[0], ll[1], 'dd') }) : t('crs.d.near.none'), sg);
    }
    function defaultList() {
      if (hasData && !current && !pick) { doFits(); return; }
      if (here) { nearIn.value = here[1].toFixed(5) + ', ' + here[0].toFixed(5); doNear(); return; }
      if (hasData) { doFits(); return; }
      showList(t('crs.d.list.start'), []);
    }

    // ---------------- chosen
    function choose(c) {
      chosen = c;
      for (const b of list.querySelectorAll('.cv-crs-item')) { const on = !!c?.entry && Number(b.dataset.crsCode) === c.entry.code; b.classList.toggle('is-sel', on); b.parentElement.setAttribute('aria-selected', on ? 'true' : 'false'); }
      renderChosen();
    }
    function renderChosen() {
      problemBox.hidden = true;
      if (!chosen) { chosenBox.replaceChildren(el('p', { className: 'cv-note' }, pick ? t('crs.d.chosen.none') : current ? t('crs.d.chosen.keep') : t('crs.d.chosen.none'))); updateApply(); return; }
      const d = describe(chosen.crs);
      const kids = [facts(d)];
      for (const n of chosen.notes || []) kids.push(el('p', { className: 'cv-note' }, n));
      if (mid && hasData && chosen.crs.unit !== 'deg') {
        try {
          const [lon, lat] = frame({ ...chosen.crs, local: null }).toLonLat(mid.x, mid.y);
          const a = chosen.entry?.area, inside = a ? lat >= a[1] && lat <= a[3] && (a[0] <= a[2] ? lon >= a[0] && lon <= a[2] : lon >= a[0] || lon <= a[2]) : null;
          kids.push(el('p', { className: 'cv-note' }, t(inside === false ? 'crs.d.mid.out' : inside ? 'crs.d.mid.in' : 'crs.d.mid', { at: latLonText(lon, lat, host.settings.latlon) })));
        } catch { kids.push(el('p', { className: 'cv-note' }, t('crs.d.mid.cannot'))); }
      }
      chosenBox.replaceChildren(...kids);
      const prob = forProject ? crsProblem(chosen.crs, units()) : (!chosen.crs.proj4 ? t('crs.p.nodef') : null);
      if (prob) { problemBox.textContent = prob; problemBox.hidden = false; }
      updateApply();
    }
    function updateApply() {
      const prob = !chosen ? t('crs.d.pickfirst') : forProject ? crsProblem(chosen.crs, units()) : null;
      applyBtn.disabled = pick ? !!prob : false;
      applyBtn.title = pick && prob ? prob : '';
    }

    // ---------------- grid / ground / local
    function showMode() {
      for (const pnl of dlg.querySelectorAll('[data-crs-panel]')) pnl.hidden = pnl.dataset.crsPanel !== gmode;
      if (gmode === 'local') renderLocal();
    }
    const baseCrs = () => (chosen ? chosen.crs : current ? { ...current, local: null } : null);
    function computeFactor() {
      const b = baseCrs();
      if (!b) { factorsBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, t('crs.d.pickfirst2'))); return null; }
      const x = numIn(atE.value), y = numIn(atN.value);
      if (!Number.isFinite(x) || !Number.isFinite(y)) { factorsBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, t('crs.d.factor.en'))); return null; }
      let z = numIn(atZ.value);
      if (z === null) { const g = p.eg?.().surface?.elevationAt?.(x, y); z = Number.isFinite(g) ? g : 0; atZ.value = Number.isFinite(g) ? g.toFixed(2) : '0'; }
      if (!Number.isFinite(z)) { factorsBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, t('crs.d.factor.z'))); return null; }
      let r;
      try { r = groundFactor(sameBase(current, b) && current.local ? { ...b, local: current.local } : b, x, y, z); } catch { r = null; }
      if (!r || !Number.isFinite(r.k)) { factorsBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, t('crs.d.factor.out'))); return null; }
      const ppm = (v) => ((v - 1) * 1e6).toFixed(1) + ' ppm';   // i18n-ignore: unit symbol
      factorsBox.replaceChildren(
        el('dl', { className: 'cv-dl cv-crs-dl', dataset: { crsFactors: '' } },
          el('dt', {}, t('crs.d.k')), el('dd', {}, t('crs.d.k.v', { k: r.k.toFixed(9), ppm: ppm(r.k) })),
          el('dt', {}, t('crs.d.ef')), el('dd', {}, t('crs.d.ef.v', { f: r.elevation.toFixed(9), ppm: ppm(r.elevation), z: fx(z, 2), unit: units() === 'm' ? 'm' : 'ft' })),
          el('dt', {}, t('crs.d.cf')), el('dd', { dataset: { crsCombined: '' } }, t('crs.d.cf.v', { f: r.combined.toFixed(9) })),
          el('dt', {}, t('crs.d.conv')), el('dd', {}, t('crs.d.conv.v', { deg: r.convergence.toFixed(6) })),
          el('dt', {}, t('crs.d.latlon')), el('dd', {}, latLonText(r.lon, r.lat, host.settings.latlon))),
        el('p', { className: 'cv-note' }, t('crs.d.geoid')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', dataset: { crsUseFactor: r.combined.toFixed(9) } }, t('crs.d.usef', { f: r.combined.toFixed(9) })));
      return r;
    }
    function cpPoint(i) {
      const c = cps[i], v = c.n.value.trim();
      if (v) {
        const pt = p.points.find((q2) => q2.n === v);
        c.xy = pt ? [pt.x, pt.y] : null;
        c.at.textContent = pt ? t('crs.d.en', { e: fx(pt.x), n: fx(pt.y) }) : t('crs.d.nopoint', { n: v.slice(0, 20) });
      } else if (c.xy) c.at.textContent = t('crs.d.en', { e: fx(c.xy[0]), n: fx(c.xy[1]) });
      else c.at.textContent = '';
      return c.xy;
    }
    function cpGrid(i) {
      const c = cps[i], b = baseCrs();
      const ll = c.ll.value.trim();
      if (ll) {
        const l = parseLatLon(ll);
        if (!l) return { error: t('crs.d.cp.err.ll', { n: i + 1 }) };
        if (!b) return { error: t('crs.d.pickfirst2') };
        try { const g = gridOf(b, l[0], l[1]); c.ge.placeholder = fx(g[0]); c.gn.placeholder = fx(g[1]); return { g }; } catch { return { error: t('crs.d.cp.err.out', { n: i + 1 }) }; }
      }
      const e = numIn(c.ge.value), n = numIn(c.gn.value);
      if (e === null && n === null) return { g: null };
      if (!Number.isFinite(e) || !Number.isFinite(n)) return { error: t('crs.d.cp.err.num', { n: i + 1 }) };
      return { g: [e, n] };
    }
    let localFit = null;
    function renderLocal() {
      localFit = null;
      const a = cpPoint(0), b = cpPoint(1), c3 = cpPoint(2);
      const ga = cpGrid(0), gb = cpGrid(1), gc = cpGrid(2);
      const err = ga.error || gb.error;
      if (err) { localBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, err)); return; }
      if (!a || !b || !ga.g || !gb.g) { localBox.replaceChildren(el('p', { className: 'cv-note' }, t('crs.d.local.need'))); return; }
      try { localFit = localFromPairs([[a, ga.g], [b, gb.g]]); } catch (e) { localBox.replaceChildren(el('p', { className: 'cv-crs-problem' }, e.message)); return; }
      const kids = [el('dl', { className: 'cv-dl cv-crs-dl', dataset: { crsLocal: '' } },
        el('dt', {}, t('crs.d.l.scale')), el('dd', {}, t('crs.d.l.scale.v', { s: localFit.scale.toFixed(9), ppm: ((localFit.scale - 1) * 1e6).toFixed(1) })),
        el('dt', {}, t('crs.d.l.rot')), el('dd', {}, t('crs.d.l.rot.v', { deg: localFit.rotation.toFixed(6) })),
        el('dt', {}, t('crs.d.l.fit')), el('dd', {}, t('crs.d.l.fit.v')))];
      if (c3 && gc.g) {
        const m = misclosure(localFit, c3, gc.g);
        kids.push(el('p', { className: m.dist > 0.1 * (units() === 'm' ? 0.3048 : 1) ? 'cv-crs-problem' : 'cv-note', dataset: { crsMisclosure: m.dist.toFixed(4) } },
          t(m.ppm != null ? 'crs.d.check.ppm' : 'crs.d.check', { d: fx(m.dist, 3), unit: units() === 'm' ? 'm' : 'ft', dx: fx(m.dx, 3), dy: fx(m.dy, 3), ppm: m.ppm != null ? m.ppm.toFixed(0) : '' })));
      } else if (c3 || gc.g) kids.push(el('p', { className: 'cv-note' }, t('crs.d.check.need')));
      if (gc.error) kids.push(el('p', { className: 'cv-crs-problem' }, gc.error));
      localBox.replaceChildren(...kids);
    }
    function localNow() {
      if (gmode === 'grid') return { local: null };
      if (gmode === 'ground') {
        const k = numIn(csf.value), e = numIn(baseE.value), n = numIn(baseN.value);
        if (!(k > 0.9 && k < 1.1)) return { error: t('crs.d.err.csf') };
        if (!Number.isFinite(e) || !Number.isFinite(n) || e === null || n === null) return { error: t('crs.d.err.base') };
        return { local: groundLocal(k, [e, n]) };
      }
      renderLocal();
      if (!localFit) return { error: t('crs.d.err.local') };
      if (!(localFit.scale > 0.5 && localFit.scale < 2)) return { error: t('crs.d.err.scale', { s: localFit.scale.toFixed(4) }) };
      return { local: localFit };
    }

    // ---------------- pick on the plan (the dialog steps aside for one click)
    function pickOnPlan(what) {
      picking = what;
      dlg.close();
      host.say(what === 'factor' ? t('crs.d.click.factor') : t('crs.d.click.cp', { n: Number(what.slice(2)) + 1 }));
      const over = host.ui.over;
      const finish = (pt) => {
        over.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey, true);
        picking = null;
        dlg.showModal();
        if (!pt) return;
        if (what === 'factor') { atE.value = pt.x.toFixed(3); atN.value = pt.y.toFixed(3); atZ.value = ''; computeFactor(); }
        else {
          const c = cps[Number(what.slice(2))];
          if (pt.n) { c.n.value = pt.n; c.xy = null; } else { c.n.value = ''; c.xy = [pt.x, pt.y]; }
          renderLocal();
          c.ge.focus();
        }
      };
      const onDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        const r = over.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
        const w = host.view.toWorld(sx, sy);
        // the nearest survey point within 10 px
        let best = null, bd = 10;
        for (const q2 of p.points) { const sp = host.view.toScreen(q2.x, q2.y), d = Math.hypot(sp.x - sx, sp.y - sy); if (d < bd) { bd = d; best = q2; } }
        finish(best ? { x: best.x, y: best.y, n: best.n } : what === 'factor' ? { x: w.x, y: w.y } : (host.say(t('crs.d.click.miss')), null));
      };
      const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); } };
      over.addEventListener('pointerdown', onDown, true);
      window.addEventListener('keydown', onKey, true);
    }

    // ---------------- .prj
    async function readPrj(file) {
      if (!file) return;
      if (file.size > 64 * 1024) { listHead.textContent = t('crs.d.prj.big', { file: file.name }); return; }
      let text = '';
      try { text = await file.text(); } catch { listHead.textContent = t('crs.d.prj.unread', { file: file.name }); return; }
      try {
        const r = crsFromPrj(text);
        choose({ crs: r.crs, entry: r.matched, notes: [(r.matched ? t('crs.d.prj.same', { file: file.name, code: r.matched.code }) : t('crs.d.prj.from', { file: file.name })), ...r.notes] });
        listHead.textContent = t('crs.d.prj.read', { file: file.name });
        if (r.matched) showList(t('crs.d.prj.this', { file: file.name }), [r.matched]);
      } catch (e) { listHead.textContent = t('gread.file.note', { file: file.name, note: e.message }); list.replaceChildren(); }
    }

    // ---------------- apply
    async function apply() {
      if (pick) {
        if (!chosen) return;
        const prob = forProject ? crsProblem(chosen.crs, units()) : null;
        if (prob) { problemBox.textContent = prob; problemBox.hidden = false; return; }
        finish({ ...chosen.crs, local: null });
        return;
      }
      const base = baseCrs();
      if (!base) { problemBox.textContent = t('crs.d.apply.none'); problemBox.hidden = false; return; }
      const L = localNow();
      if (L.error) { problemBox.textContent = L.error; problemBox.hidden = false; if (gmode === 'ground') csf.focus(); return; }
      const next = { ...base, local: L.local };
      if (current?.grid && sameBase(current, base)) next.grid = current.grid; else delete next.grid;   // 0.4 V11: a grid belongs to its system
      const prob = crsProblem(next, units());
      if (prob) { problemBox.textContent = prob; problemBox.hidden = false; return; }
      if (current && JSON.stringify(current) === JSON.stringify(next)) { finish(null); return; }
      let convert = false;
      if (current && !sameBase(current, base) && (p.points.length || s.alignments.length || s.pads.length || s.network)) {
        const ans = await host.ask({
          title: t('crs.d.ask.title', { crs: base.name }),
          text: t('crs.d.ask.text', { old: current.name, crs: base.name }),
          buttons: [['cancel', t('vec.cancel'), 'btn-line'], ['convert', t('crs.d.ask.convert'), 'btn-line'], ['yes', t('crs.d.ask.yes'), 'btn-plot']],
        });
        if (ans === 'cancel') return;
        convert = ans === 'convert';
      }
      const before = current;
      if (convert) {
        const fOld = frame(current), fNew = frame(next).from({ ...current, local: null });
        const map = (x, y) => { const g = fOld.toGrid(x, y); return fNew(g[0], g[1]); };
        let res = null, err = null;
        try { p.editPoints(t('crs.d.undo.convert', { crs: next.name }), (pts, st) => { res = reprojectProject(st, pts, map); if (res.refused) return null; st.crs = next; return res.points; }); } catch (e) { err = e.message; }
        if (err || res?.refused) { problemBox.textContent = err || res.refused; problemBox.hidden = false; return; }
        host.say(t('crs.d.converted', { count: res.moved.toLocaleString('en-US'), crs: next.name }));
      } else {
        p.change(t('crs.d.undo.set', { crs: next.name }), (st) => { st.crs = next; });
        host.say(t(next.local ? (gmode === 'ground' ? 'crs.d.set.ground' : 'crs.d.set.local') : 'crs.d.set', { crs: next.name, f: next.local?.scale }));
      }
      for (const f of reg.crsChange) { try { f(before, next, { converted: convert }); } catch (e) { console.warn(e); } }
      finish(next);
    }
    async function removeSystem() {
      const before = current;
      p.change(t('crs.d.undo.remove'), (st) => { st.crs = null; });
      for (const f of reg.crsChange) { try { f(before, null, { converted: false }); } catch (e) { console.warn(e); } }
      host.say(t('crs.d.removed'));
      finish(null);
    }

    function finish(v) {
      if (done) return;
      done = true;
      if (dlg.open) dlg.close();
      dlg.remove();
      showLatLon(host.cursor);
      host.refresh();
      host.refocus();
      resolve(v);
    }

    // ---------------- events
    dlg.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.close !== undefined) { finish(null); return; }
      if (btn.dataset.crsCode) { const ent = safeByCode(Number(btn.dataset.crsCode)); if (ent) choose({ crs: crsFromEntry(ent), entry: ent, notes: [] }); return; }
      if (btn.dataset.crsFits !== undefined) { q.value = ''; doFits(); return; }
      if (btn.dataset.crsNear !== undefined) { doNear(); return; }
      if (btn.dataset.crsPrj !== undefined) { prjIn.click(); return; }
      if (btn.dataset.crsCompute !== undefined) { computeFactor(); return; }
      if (btn.dataset.crsUseFactor) { csf.value = btn.dataset.crsUseFactor; csf.focus(); return; }
      if (btn.dataset.crsPickPlan) { pickOnPlan(btn.dataset.crsPickPlan); return; }
      if (btn.dataset.crsRemove !== undefined) { removeSystem(); return; }
      if (btn === applyBtn) { apply(); }
    });
    dlg.addEventListener('change', (e) => {
      if (e.target.dataset?.crsMode) { gmode = e.target.value; showMode(); return; }
      if (e.target === prjIn) { readPrj(prjIn.files[0]); prjIn.value = ''; }
    });
    dlg.addEventListener('input', (e) => {
      if (e.target === q) { clearTimeout(q._t); q._t = setTimeout(doSearch, 150); return; }
      if (gmode === 'local' && localPanel.contains(e.target)) { clearTimeout(localPanel._t); localPanel._t = setTimeout(renderLocal, 200); }
    });
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch(); } if (e.key === 'ArrowDown') { e.preventDefault(); list.querySelector('button')?.focus(); } });
    nearIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doNear(); } });
    list.addEventListener('keydown', (e) => {
      const bs = [...list.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i >= 0) { e.preventDefault(); bs[Math.min(bs.length - 1, i + 1)].focus(); }
      if (e.key === 'ArrowUp' && i >= 0) { e.preventDefault(); (i === 0 ? q : bs[i - 1]).focus(); }
    });
    dlg.addEventListener('dragover', (e) => { e.preventDefault(); });
    dlg.addEventListener('drop', (e) => { e.preventDefault(); const f = [...(e.dataTransfer?.files || [])].find((x) => /\.(prj|wkt|txt)$/i.test(x.name)); if (f) readPrj(f); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); finish(null); });
    dlg.addEventListener('close', () => { if (!done && !picking) finish(null); });
    // typing in the dialog never reaches the plan's keys
    dlg.addEventListener('keydown', (e) => e.stopPropagation());

    host.root.append(dlg);
    renderNow(); renderGrid();   // 0.4 V11
    renderChosen();
    showMode();
    defaultList();
    dlg.showModal();
    q.focus();
    if (prjFile) readPrj(prjFile);
  }

  function safeByCode(c) { try { return byCode(c); } catch { return null; } }
  return { showLatLon };
}
