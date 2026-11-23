/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rulesets-ui.js — 0.11 SU.1937b: the Rule sets block of the storm drainage settings (the network's named rule sets: apply one, with its
 * return period; save the current settings as one; edit one in a window; import and export the .ccrules.json file) and the pipe's material
 * box. The data and its checks are rulesets.js; the rainfall and roughness the sizing and the grade line use are hydro.js's.
 *
 *   createRulesets(ctx) → { block(net, h, change) → [nodes], pipeMaterial(p, net, set) → [nodes] }
 *   ctx = { el, root, project, units, numInput, row, say, download, fileStem, refresh }
 */
import { t } from './i18n.js';
import { cleanRuleset, applyRuleset, returnPeriods, ruleFromNetwork, rulesetFile, readRulesetFile, RS_EXT, MAX_RULESETS } from './rulesets.js';

export function createRulesets(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), iU = () => (U() === 'm' ? 'mm/h' : 'in/h');
  const list = () => P().state.network?.rulesets || [];
  const edit = (label, fn) => P().change(label, (s) => { fn(s.network); });
  const nextId = (l) => { let n = 1; while (l.some((r) => r.id === 'rs' + n)) n++; return 'rs' + n; };
  const btn = (text, onclick, data = {}, extra = {}) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick, ...Object.fromEntries(Object.entries(data).map(([k, v]) => ['data-' + k, v])), ...extra }, text);

  function block(net, h) {
    const out = [el('h3', { className: 'cv-h3', 'data-rs-head': '' }, t('rs.head')), el('p', { className: 'cv-note' }, t('rs.lead'))];
    const L = list();
    const pick = el('select', { className: 'cv-select', id: 'cv-rs-pick', 'data-rs-pick': '', 'aria-label': t('rs.pick') }, el('option', { value: '' }, t('rs.none')), ...L.map((r) => el('option', { value: r.id, selected: r.id === h.rsId }, r.name)));
    const retSel = (rs) => el('select', { className: 'cv-select', id: 'cv-rs-ret', 'data-rs-ret': '', 'aria-label': t('rs.ret') }, ...returnPeriods(rs).map((y) => el('option', { value: String(y), selected: y === h.ret }, t('rs.ret.opt', { y }))));
    const ret = el('span', {});
    const fillRet = () => { const rs = L.find((r) => r.id === pick.value); ret.replaceChildren(rs && returnPeriods(rs).length ? retSel(rs) : ''); };
    pick.addEventListener('change', fillRet); fillRet();
    out.push(el('div', { className: 'cv-row' }, pick, ret,
      btn(t('rs.apply'), () => {
        const rs = L.find((r) => r.id === pick.value); if (!rs) return;
        const y = Number(ret.querySelector('select')?.value) || returnPeriods(rs)[0] || null;
        edit(t('rs.undo.apply'), (nw) => { const a = applyRuleset(nw.hydro || h, nw.rules || {}, rs, y); nw.hydro = a.hydro; nw.rules = a.rules; });
        ctx.say(t('rs.applied', { name: rs.name }));
      }, { 'rs-apply': '' }),
      btn(t('rs.detach'), () => edit(t('rs.undo.detach'), (nw) => { if (nw.hydro) { delete nw.hydro.rs; delete nw.hydro.rsId; delete nw.hydro.ret; } }), { 'rs-detach': '' }, { disabled: !h.rs })));
    if (h.rs) out.push(el('p', { className: 'cv-note', 'data-rs-force': '' }, t('rs.force', { name: h.rs.name, ret: h.ret ?? '—', rows: h.rs.rainfall.length, mats: h.rs.materials.length })));
    // rows the settings cannot use
    const cites = h.rs ? [...h.rs.rainfall, ...h.rs.materials, ...(h.rs.limits ? [h.rs.limits] : [])].filter((x) => x.src).map((x) => x.src) : [];
    if (cites.length) out.push(el('p', { className: 'cv-note', 'data-rs-cites': '' }, t('rs.cites', { list: [...new Set(cites)].join('; ') })));
    out.push(el('div', { className: 'cv-actions' },
      btn(t('rs.save.current'), () => { const nm = t('rs.default.name', { n: L.length + 1 }); edit(t('rs.undo.add'), (nw) => { const l = (nw.rulesets ||= []); if (l.length >= MAX_RULESETS) return; l.push({ ...ruleFromNetwork(nw, nm), id: nextId(l) }); }); ctx.say(t('rs.saved', { name: nm })); }, { 'rs-save-current': '' }),
      btn(t('rs.edit'), () => { const rs = L.find((r) => r.id === pick.value); if (rs) openEditor(rs.id); }, { 'rs-edit': '' }, { disabled: !L.length }),
      btn(t('rs.remove'), () => { const id = pick.value; if (id) edit(t('rs.undo.remove'), (nw) => { nw.rulesets = (nw.rulesets || []).filter((r) => r.id !== id); if (!nw.rulesets.length) delete nw.rulesets; }); }, { 'rs-remove': '' }, { disabled: !L.length }),
      btn(t('rs.export'), () => { const name = ctx.fileStem() + ' ' + t('rs.file') + RS_EXT; ctx.download(JSON.stringify(rulesetFile(L), null, 1), name, 'application/json'); ctx.say(t('rs.exported', { name })); }, { 'rs-export': '' }, { disabled: !L.length }),
      btn(t('rs.import'), () => fileIn.click(), { 'rs-import': '' })));
    const fileIn = el('input', { type: 'file', accept: RS_EXT + ',application/json', hidden: true, 'data-rs-file': '' });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files?.[0]; if (!f) return;
      let obj = null; try { obj = JSON.parse(await f.text()); } catch { /* said below */ }
      const r = readRulesetFile(obj, U());
      if (!r.rulesets.length) { ctx.say(t('rs.import.none')); return; }
      edit(t('rs.undo.import'), (nw) => { const l = (nw.rulesets ||= []); for (const x of r.rulesets) { if (l.length >= MAX_RULESETS) break; l.push({ ...x, id: nextId(l) }); } });
      ctx.say(t('rs.imported', { n: r.rulesets.length }) + (r.notes.length ? ' ' + t('rs.import.dropped', { n: r.notes.length }) : ''));
    });
    out.push(fileIn);
    return out;
  }

  /** The editor: three small tables (rainfall, materials) and the limits, each group with its citation or "entered by me". */
  function openEditor(id) {
    const rs0 = list().find((r) => r.id === id); if (!rs0) return;
    ctx.root.querySelector('#cv-rs-ed')?.remove();
    const d = JSON.parse(JSON.stringify(rs0));
    d.limits ||= {};
    const body = el('div', { className: 'cv-dlg-body' }), probs = el('div', { 'data-rs-problems': '', 'aria-live': 'polite' });
    const txt = (v, on, attrs = {}) => { const i = el('input', { type: 'text', className: 'cv-input', value: v ?? '', ...attrs }); i.addEventListener('change', () => on(i.value)); return i; };
    const nm = (v, on, attrs = {}) => txt(v === undefined || v === null ? '' : String(v), (s) => on(s.trim() === '' ? undefined : Number(s)), { style: 'width:4.8rem', ...attrs });
    const proofCell = (o, lab) => el('td', {}, txt(o.src || '', (v) => { if (v.trim()) { o.src = v.trim(); delete o.entered; } else delete o.src; }, { style: 'width:11rem', 'aria-label': t('rs.ed.src', { what: lab }), placeholder: t('rs.ed.src.ph') }),
      el('label', { className: 'cv-check' }, el('input', { type: 'checkbox', checked: o.entered === true, 'aria-label': t('rs.ed.entered', { what: lab }), onchange: (e) => { if (e.target.checked) { o.entered = true; delete o.src; } else delete o.entered; draw(); } }), ' ', t('rs.ed.entered.short')));
    function draw() {
      const th = (keys) => el('thead', {}, el('tr', {}, ...keys.map((k) => el('th', { scope: 'col' }, k ? t(k, { u: iU() }) : ''))));
      const rr = d.rainfall.map((r, i) => el('tr', { 'data-rs-rain': i },
        el('td', {}, nm(r.ret, (v) => { r.ret = v; }, { 'aria-label': t('rs.ed.r.ret', { n: i + 1 }) })), el('td', {}, nm(r.tMin, (v) => { r.tMin = v; }, { 'aria-label': t('rs.ed.r.tmin', { n: i + 1 }) })), el('td', {}, nm(r.tMax, (v) => { r.tMax = v; }, { 'aria-label': t('rs.ed.r.tmax', { n: i + 1 }) })),
        el('td', {}, el('select', { className: 'cv-select', 'aria-label': t('rs.ed.r.form', { n: i + 1 }), onchange: (e) => { r.form = e.target.value; } }, ...['idf', 'montana'].map((f) => el('option', { value: f, selected: r.form === f }, t('rs.form.' + f))))),
        el('td', {}, nm(r.a, (v) => { r.a = v; }, { 'aria-label': t('rs.ed.r.a', { n: i + 1 }) })), el('td', {}, nm(r.b, (v) => { r.b = v; }, { 'aria-label': t('rs.ed.r.b', { n: i + 1 }) })), el('td', {}, nm(r.c, (v) => { r.c = v; }, { 'aria-label': t('rs.ed.r.c', { n: i + 1 }) })),
        proofCell(r, t('rs.ed.row', { n: i + 1 })), el('td', {}, btn('×', () => { d.rainfall.splice(i, 1); draw(); }, {}, { 'aria-label': t('rs.ed.r.remove', { n: i + 1 }), className: 'cv-x' }))));
      const mr = d.materials.map((m, i) => el('tr', { 'data-rs-mat': i },
        el('td', {}, txt(m.key, (v) => { m.key = v.trim(); }, { style: 'width:6rem', 'aria-label': t('rs.ed.m.key', { n: i + 1 }) })), el('td', {}, txt(m.name, (v) => { m.name = v; }, { style: 'width:8rem', 'aria-label': t('rs.ed.m.name', { n: i + 1 }) })),
        el('td', {}, nm(m.n, (v) => { m.n = v; }, { 'aria-label': t('rs.ed.m.n', { n: i + 1 }) })), proofCell(m, t('rs.ed.mat', { n: i + 1 })), el('td', {}, btn('×', () => { d.materials.splice(i, 1); draw(); }, {}, { 'aria-label': t('rs.ed.m.remove', { n: i + 1 }), className: 'cv-x' }))));
      body.replaceChildren(
        el('div', { className: 'cv-props' }, el('label', { for: 'cv-rs-name' }, t('rs.ed.name')), txt(d.name, (v) => { d.name = v; }, { id: 'cv-rs-name', maxLength: 80, 'data-rs-name': '' })),
        el('p', { className: 'cv-note' }, t('rs.ed.lede')), probs,
        el('h3', { className: 'cv-h3' }, t('rs.ed.rain')), el('p', { className: 'cv-note' }, t('rs.ed.rain.note', { u: iU() })),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' }, th(['rs.ed.c.ret', 'rs.ed.c.tmin', 'rs.ed.c.tmax', 'rs.ed.c.form', 'rs.ed.c.a', 'rs.ed.c.b', 'rs.ed.c.c', 'rs.ed.c.src', '']), el('tbody', {}, ...rr))),
        el('div', { className: 'cv-actions' }, btn(t('rs.ed.r.add'), () => { d.rainfall.push({ ret: 10, tMin: 0, tMax: 60, form: 'idf', a: 60, b: 10, c: 0.75, entered: true }); draw(); }, { 'rs-radd': '' })),
        el('h3', { className: 'cv-h3' }, t('rs.ed.mats')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' }, th(['rs.ed.c.key', 'rs.ed.c.name', 'rs.ed.c.n', 'rs.ed.c.src', '']), el('tbody', {}, ...mr))),
        el('div', { className: 'cv-actions' }, btn(t('rs.ed.m.add'), () => { let n = d.materials.length + 1; while (d.materials.some((m) => m.key === 'mat' + n)) n++; d.materials.push({ key: 'mat' + n, name: '', n: 0.013, entered: true }); draw(); }, { 'rs-madd': '' })),
        el('h3', { className: 'cv-h3' }, t('rs.ed.limits')),
        el('table', { className: 'cv-table' }, th(['rs.ed.c.minslope', 'rs.ed.c.mincover', 'rs.ed.c.mindrop', 'rs.ed.c.src']), el('tbody', {}, el('tr', {},
          el('td', {}, nm(d.limits.minSlope === undefined ? undefined : d.limits.minSlope * 100, (v) => { if (v === undefined) delete d.limits.minSlope; else d.limits.minSlope = v / 100; }, { 'aria-label': t('rs.ed.l.slope') })),
          el('td', {}, nm(d.limits.minCover, (v) => { if (v === undefined) delete d.limits.minCover; else d.limits.minCover = v; }, { 'aria-label': t('rs.ed.l.cover') })), el('td', {}, nm(d.limits.minDrop, (v) => { if (v === undefined) delete d.limits.minDrop; else d.limits.minDrop = v; }, { 'aria-label': t('rs.ed.l.drop') })), proofCell(d.limits, t('rs.ed.limits'))))));
    }
    const save = btn(t('rs.ed.save'), () => {
      const c = cleanRuleset(d, U());
      if (!c.rs) { probs.replaceChildren(el('p', { className: 'cv-report is-error' }, t('rs.ed.empty'))); return; }
      if (c.dropped.length) { probs.replaceChildren(el('ul', { className: 'cv-report is-error', 'data-rs-dropped': '' }, ...c.dropped.map((x) => el('li', {}, t('rs.ed.dropped.' + x.why, { group: t('rs.group.' + x.group), at: x.at }))))); return; }
      edit(t('rs.undo.edit'), (nw) => { const i = (nw.rulesets || []).findIndex((r) => r.id === id); if (i >= 0) nw.rulesets[i] = { ...c.rs, id }; });
      dlg.close(); ctx.say(t('rs.edited', { name: c.rs.name }));
    }, { 'rs-ed-save': '' });
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('rs.ed.close'), onclick: () => dlg.close() }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog', id: 'cv-rs-ed', 'aria-labelledby': 'cv-rs-ed-h', 'data-rs-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-rs-ed-h' }, t('rs.ed.head')), close), body,
      el('div', { className: 'cv-dlg-foot' }, btn(t('rs.ed.close'), () => dlg.close()), save)));
    dlg.addEventListener('close', () => dlg.remove());
    ctx.root.append(dlg); draw(); dlg.showModal();
  }

  /** The pipe's material (rule set in force): a select over its materials; none = the network's n. */
  function pipeMaterial(p, net, set) {
    const mats = net?.hydro?.rs?.materials || [];
    if (!mats.length) return [];
    const sel = el('select', { className: 'cv-select', id: 'cv-pp-mat', 'data-pp-mat': '', 'aria-label': t('rs.pipe.mat') }, el('option', { value: '' }, t('rs.pipe.mat.none')), ...mats.map((m) => el('option', { value: m.key, selected: m.key === p.mat }, m.name + ' (n ' + m.n + ')')));
    sel.addEventListener('change', () => set(sel.value));
    return ctx.row(t('rs.pipe.mat'), sel, 'cv-pp-mat');
  }
  return { block, pipeMaterial, openEditor };
}
