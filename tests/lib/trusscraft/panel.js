/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the TrussCraft add-on, host-independent (DOM-light glue; the engine is in lib/). Used by BimCraft, PartCraft, ModelCraft and CadCraft:
 * main.js calls start(api, makeHost) with the adapter in host.js, the one file that differs per app (docs/ADDONS-SPEC.md § TrussCraft).
 *
 * The host adapter, makeHost(api, { t }) → {
 *   id                       'bimcraft' | 'partcraft' | 'modelcraft' | 'cadcraft'
 *   roofs()                  roofs of the open model as layout input (BimCraft); [] where the app has none
 *   canPlace, placeKey       whether the app can take the trusses into its document, and the button's language key
 *   place({ layout, designs, designFor, roof, species, speciesId, z0, storey, outline }) → Promise<count>
 *   clear?()                 take what place() made away again (one undo step) → Promise<bool>
 *   pickOutline?()           the roof outline from what is selected in the app → [[x, y] mm…] (throws a message when nothing fits)
 *   pickKey                  language key of that button
 *   buttons?: [{ id, key, run({ design, layout, designs, outline, say }) → Promise<string> }]   the app's own outputs (CadCraft: draw elevation …)
 *   limits()                 what this app cannot do, as plain words: shown in Problems (notes) after the not-a-design label
 * }
 * Panel tab "Trusses", commands trusscraft:design · layout · check · place, exports for the lists, the layout, the elevation, the jig drawing, STL and OBJ.
 * Loads, combinations, Fb, plate and species tables are the person's. A design aid, not a substitute for engineered truss design or manufacturer sign-off.
 */
import { setT, t } from './lib/core.js';
import { SIZES, TYPES, DEFAULT_SPECIES, DEFAULT_LOADS, DEFAULT_COMBOS, DEFAULT_TRUSS, TABLE_LABEL, DISCLAIMER, COMBO_LABEL, PLATE_PLACEHOLDER_LABEL, cleanSpecies, speciesById } from './lib/tables.js';
import { designTruss } from './lib/design.js';
import { layoutRoof, valleyLayout } from './lib/roofset.js';
import { designSet, setProblems, setTotals, KIND_NAME } from './lib/setdesign.js';
import { trussProblems, setSourceName, sourceName } from './lib/problems.js';
import { elevationSvg } from './lib/drawing.js';
import { layoutSegments, toSvg } from './lib/view3d.js';
import { memberCsv, cutCsv, jointCsv, layoutCsv, setCutCsv, setJointCsv } from './lib/report.js';
import { typedRoof } from './lib/roofs-typed.js';
import { jigSvg, stockItems, stockPlan } from './lib/fab.js';
import { buildBodies, stlText, objText } from './lib/bodies.js';
import { parsePlateTable, parseSpeciesTable } from './lib/plates.js';

const PSF = 0.04788026;   // kPa per psf (a unit conversion, not a code value)

export function start(api, makeHost) {
  setT(api.t);
  const H = makeHost(api, { t: api.t });
  setSourceName(H.id + '.addon.trusscraft');
  const say0 = (s) => { S.notice = s; if (typeof api.status === 'function') api.status(s); else if (typeof api.print === 'function') api.print(s); };
  const stored = (k, d) => { const v = api.storage.get(k); return v === undefined || v === null ? d : v; };
  const S = {
    spec: { ...DEFAULT_TRUSS, ...stored('spec', {}) }, loads: { ...DEFAULT_LOADS, ...stored('loads', {}) }, loadUnit: stored('loadUnit', 'kPa'), combos: stored('combos', DEFAULT_COMBOS).map((c) => ({ ...c })),
    species: stored('species', 'spf-2'), fb: stored('fb', ''), fcp: stored('fcp', ''), momentDiv: stored('momentDiv', 8), deflLimit: stored('deflLimit', ''), fixity: stored('fixity', 'rigid'),
    stockLengths: stored('stockLengths', ''), ridge: stored('ridge', 'auto'), roof: stored('roof', ''), outline: stored('outline', '0, 0\n12000, 0\n12000, 8000\n0, 8000'), ends: stored('ends', 'gable'),
    hipMethod: stored('hipMethod', 'stepdown'), setback: stored('setback', 0), minHeight: stored('minHeight', 300), valleyMode: stored('valleyMode', 'cross'), valley: stored('valley', { wingWidth: 6000, wingPitch: 30, mainPitch: 30 }),
    fixed: stored('fixed', null), draft: stored('fixed', null), az: 35, el: 30,
    design: null, layout: null, designs: null, show: '', roofs: [], z0: 0, storey: '', notice: '',
  };
  const save = () => { for (const k of ['spec', 'loads', 'loadUnit', 'combos', 'species', 'fb', 'fcp', 'momentDiv', 'deflLimit', 'fixity', 'ridge', 'roof', 'outline', 'ends', 'hipMethod', 'setback', 'minHeight', 'valleyMode', 'valley', 'fixed', 'stockLengths']) api.storage.set(k, S[k]); };
  const table = () => { const c = cleanSpecies(stored('speciesTable', [])); return c.length ? c : DEFAULT_SPECIES; };
  const plateTable = () => { const p = stored('plateTable', null); return p && Array.isArray(p.list) && p.list.length ? { list: p.list, label: String(p.label || 'Your plate table'), placeholder: false } : null; };
  let src = null;
  try { if (api.problems && typeof api.problems.source === 'function') src = api.problems.source({ id: 'trusscraft', kind: 'engine', label: t('name') }); } catch { src = null; }

  const hostNotes = () => (H.limits ? H.limits() : []).map((text, i) => ({ code: 'host' + i, severity: 'note', part: 'host', msg: { key: 'truss.host', vars: { app: H.id } }, text, about: [], source: { name: sourceName() } }));
  const num = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Number(v) : d);
  const poly = () => String(S.outline).split(/\n|;/).map((l) => l.trim().split(/[\s,]+/).map(Number)).filter((p) => p.length >= 2 && p.every(Number.isFinite)).map((p) => [p[0], p[1]]);
  const roofs = () => { try { S.roofs = (H.roofs && H.roofs()) || []; } catch { S.roofs = []; } return S.roofs; };
  const specNow = (over = {}) => ({ ...S.spec, ...over });
  const loadsKpa = () => { const k = S.loadUnit === 'psf' ? PSF : 1, o = {}; for (const [a, v] of Object.entries(S.loads)) o[a] = a === 'duration' ? Number(v) : (Number(v) || 0) * k; return o; };
  const speciesNow = () => { const sp = speciesById(table(), S.species); return sp; };
  const designOpts = (trib) => ({ loads: loadsKpa(), combos: S.combos.map((c) => ({ ...c, name: c.name, fD: num(c.fD, 0), fS: num(c.fS, 0), fW: num(c.fW, 0), fU: num(c.fU, 0), CD: num(c.CD, 1) })), species: speciesNow(), spacing: trib ?? num(S.spec.spacing, 600),
    duration: num(S.loads.duration, 1), braceLen: num(S.spec.braceLen, 600), fixed: S.fixed, stock: num(S.spec.stock, 6000), plates: plateTable(), momentDiv: num(S.momentDiv, 8) || 8,
    Fb: S.fb === '' ? null : Number(S.fb), Fcp: S.fcp === '' ? null : Number(S.fcp), deflLimit: num(S.deflLimit, 0), fixity: S.fixity === 'pinned' ? 'pinned' : 'rigid' });

  function doDesign(over = {}) {
    const d = designTruss(specNow(over), designOpts());
    if (!d.ok) throw new Error(t('err.' + d.error));
    if (!over.span) { S.design = d; S.layout = null; S.designs = null; src?.set([...trussProblems(d, S.spec), ...hostNotes()]); }
    return d;
  }
  const designFor = (span, tr) => {
    if (S.designs) { const d = tr ? S.designs.get(tr.key) : S.designs.get(S.show); return d && d.ok ? d : null; }
    const d = designTruss(specNow({ span: Math.round(span) }), designOpts());
    return d.ok ? d : null;
  };
  function finishLayout(L) {
    if (!L.ok) throw new Error(t('err.' + (L.error === 'valleyparams' ? 'valleyparams' : L.error || 'outline')));
    S.layout = L;
    S.designs = designSet(L, designOpts());
    S.show = (L.groups.find((g) => S.designs.get(g.key) && S.designs.get(g.key).ok) || L.groups[0]).key;
    S.design = S.designs.get(S.show);
    if (S.design && S.design.ok) S.spec.span = S.design.g.span;
    src?.set([...setProblems(L, S.designs, S.spec), ...hostNotes()]);
    return L;
  }
  function doLayout() {
    const r = S.roofs.find((x) => x.guid === S.roof);
    let roof;
    if (r) {
      S.spec.pitch = r.pitch || S.spec.pitch; S.spec.overhang = Math.round(r.overhang ?? S.spec.overhang); S.z0 = r.top; S.storey = r.storey;
      roof = r.plan ? r : { ...r, ...typedRoof(r.outline, { pitch: r.pitch, overhang: r.overhang, ends: r.gables && r.gables.length ? 'gable' : 'hip', ridge: S.ridge }) };
    } else {
      S.z0 = 0; S.storey = '';
      roof = typedRoof(poly(), { pitch: num(S.spec.pitch, 30), overhang: num(S.spec.overhang, 450), ends: S.ends, ridge: S.ridge });
    }
    if (roof.error) throw new Error(t('err.' + roof.error));
    const type = S.spec.type === 'mono' ? 'fink' : S.spec.type;
    const L = layoutRoof(roof, { spacing: num(S.spec.spacing, 600), ridge: S.ridge, hipMethod: S.hipMethod, setback: num(S.setback, 0), minHeight: num(S.minHeight, 300), valleyMode: S.valleyMode, type,
      base: { panels: S.spec.panels, heel: S.spec.heel, bottomPitch: S.spec.bottomPitch, atticWidth: S.spec.atticWidth, atticHeight: S.spec.atticHeight, overhang: S.spec.overhang } });
    return finishLayout(L);
  }
  function doValley() {
    S.z0 = 0; S.storey = '';
    return finishLayout(valleyLayout({ wingWidth: num(S.valley.wingWidth, 0), wingPitch: num(S.valley.wingPitch, 0), mainPitch: num(S.valley.mainPitch, 0), spacing: num(S.spec.spacing, 600), minHeight: num(S.minHeight, 300) }));
  }
  const outlineNow = () => { const r = S.roofs.find((x) => x.guid === S.roof); return r ? r.outline : poly(); };
  async function doPlace() {
    if (!S.layout) throw new Error(t('err.nolayout'));
    if (!H.canPlace || typeof H.place !== 'function') throw new Error(t('err.write'));
    const sp = speciesNow(), r = S.roofs.find((x) => x.guid === S.roof), L = S.layout, ds = S.designs;
    if (H.needsStorey && !S.storey) throw new Error(t('err.noroof'));
    return H.place({ layout: L, designs: ds, designFor: (span, tr) => { const d = tr ? ds.get(tr.key) : null; return d && d.ok ? d : null; }, roof: r || null, species: sp ? sp.label : '', speciesId: sp ? sp.id : '', z0: S.z0, storey: S.storey, outline: outlineNow() });
  }
  const stockLens = () => { const l = String(S.stockLengths || '').split(/[\s,;]+/).map(Number).filter((n) => n > 0); return l.length ? l : [num(S.spec.stock, 6000)]; };
  const designForAny = (span, tr) => { if (tr) { const d = S.designs && S.designs.get(tr.key); return d && d.ok ? d : null; } return designFor(span, tr); };
  const bodiesNow = () => { if (!S.layout || !S.designs) throw new Error(t('err.nolayout')); const sp = speciesNow(); return buildBodies(S.layout, designForAny, { z0: S.z0, speciesId: sp ? sp.id : '' }); };
  const jigNow = () => { const d = needDesign(); return jigSvg(d, { title: t('fab.jig.title', { type: d.g.type }), plates: plateTable() }); };
  const stockNow = () => {
    const items = S.layout && S.designs ? stockItems(S.layout, S.designs) : [{ key: 'one', label: 'T1', design: needDesign(), qty: 1 }];
    return stockPlan(items, { lengths: stockLens(), kerf: 3 });
  };

  const fmt = (x, d = 1) => (Number.isFinite(x) ? String(Math.round(x * 10 ** d) / 10 ** d) : '—');
  const maxUtil = (d) => Math.max(0, ...d.rows.map((r) => r.util));
  const summary = () => {
    const d = S.design;
    if (!d || !d.ok) return '';
    const a = d.res.status === 'ok' ? t('result.design', { type: d.g.type, top: d.sizes.top, bottom: d.sizes.bottom, web: d.sizes.web, n: d.g.members.filter((m) => m.role !== 'tail').length, max: fmt(maxUtil(d), 2) })
      : t('result.nosolve', { type: d.g.type, status: d.res.status });
    if (!S.layout) return a;
    const T = setTotals(S.layout, S.designs), kinds = {};
    for (const x of S.layout.trusses) kinds[x.kind] = (kinds[x.kind] || 0) + 1;
    return a + '\n' + t('result.layout', { n: S.layout.count, sp: fmt(S.layout.spacing, 0), spans: [...new Set(S.layout.trusses.map((x) => x.span))].slice(0, 8).join(', ') }) + '\n' + t('result.set', { kinds: Object.entries(kinds).map(([k, v]) => v + ' ' + k).join(', '), designs: T.designs, members: T.members });
  };
  const needDesign = () => { if (!S.design) doDesign(); return S.design; };
  const problemsNow = () => [...(S.layout && S.designs ? setProblems(S.layout, S.designs, S.spec) : S.design ? trussProblems(S.design, S.spec) : []), ...hostNotes()];

  const addCmd = (name, fn, label) => { if (H.addCommand) H.addCommand(name, fn, label); else api.commands?.add(name, fn, { label }); };
  addCmd('design', async () => { try { doDesign(); say0(summary()); } catch (e) { say0(e.message); } }, t('cmd.design'));
  /** The command-line route (also where an app gives the tab no home, as SuperCad Studio's mounted CadCraft): a selected outline is used when the app can take one. */
  const pickIfAny = () => { try { const o = H.pickOutline && H.pickOutline(); if (o && o.length >= 3) { S.outline = o.map((p) => Math.round(p[0] * 10) / 10 + ', ' + Math.round(p[1] * 10) / 10).join('\n'); S.roof = ''; save(); } } catch { /* nothing selected: the typed outline */ } };
  addCmd('layout', async () => { try { pickIfAny(); roofs(); doLayout(); say0(summary()); } catch (e) { say0(e.message); } }, t('cmd.layout'));
  addCmd('check', async () => { try { const d = needDesign(); const p = S.layout ? problemsNow() : trussProblems(d, S.spec); say0(t('result.check', { n: p.filter((x) => x.severity !== 'note').length })); } catch (e) { say0(e.message); } }, t('cmd.check'));
  addCmd('place', async () => { try { roofs(); if (!S.layout) doLayout(); const n = await doPlace(); say0(t('result.placed', { n })); } catch (e) { say0(e.message); } }, t('cmd.place'));

  for (const b of H.buttons || []) addCmd(b.id, async () => { try { if (!S.design && !S.layout) doDesign(); say0(await b.run({ design: needDesign(), layout: S.layout, designs: S.designs, outline: outlineNow(), say: say0 })); } catch (e) { say0(e.message); } }, t(b.key));
  const exp = (id, label, extension, mime, fn) => api.files.exporter({ id, label, extension, mime, write: async () => fn() });
  exp('members-csv', t('export.members'), 'csv', 'text/csv', () => memberCsv(needDesign()));
  exp('cuts-csv', t('export.cuts'), 'csv', 'text/csv', () => (S.layout && S.designs ? setCutCsv(S.layout, S.designs) : cutCsv(needDesign(), 1)));
  exp('joints-csv', t('export.joints'), 'csv', 'text/csv', () => (S.layout && S.designs ? setJointCsv(S.layout, S.designs) : jointCsv(needDesign())));
  exp('layout-csv', t('export.layout'), 'csv', 'text/csv', () => { if (!S.layout) doLayout(); return layoutCsv(S.layout, designFor); });
  exp('elevation-svg', t('export.elevation'), 'svg', 'image/svg+xml', () => { const d = needDesign(); return elevationSvg(d.g, d.sizes, { raise: d.heel.raise, forces: d.res.forces, title: t('dwg.title', { type: d.g.type }) }); });

  exp('jig-svg', t('export.jig'), 'svg', 'image/svg+xml', () => jigNow());
  exp('stock-csv', t('export.stock'), 'csv', 'text/csv', () => stockNow().csv);
  exp('set-stl', t('export.stl'), 'stl', 'model/stl', () => stlText(bodiesNow()));
  exp('set-obj', t('export.obj'), 'obj', 'text/plain', () => objText(bodiesNow()));
  api.ui.panelTab({ id: 'trusses', title: t('tab'), render: (pane) => render(pane) });
  function render(pane) {
    const d = pane.ownerDocument;
    const el = (tag, attrs = {}, ...kids) => {
      const n = d.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'on') for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn); else if (v !== undefined && v !== false) n.setAttribute(k, v === true ? '' : String(v)); }
      n.append(...kids.flat().filter((x) => x !== null && x !== undefined && x !== false));
      return n;
    };
    const again = () => { pane.replaceChildren(); render(pane); };
    const say = el('pre', { class: 'trs-say', style: 'white-space:pre-wrap;font-size:0.8rem;margin:0.5rem 0' }, S.notice || summary());
    const run = (fn) => async () => { try { S.notice = ''; await fn(); again(); } catch (e) { say.textContent = e.message; } };
    const field = (label, input) => el('label', { style: 'display:grid;gap:0.15rem;font-size:0.8rem;margin:0.35rem 0' }, el('span', {}, label), input);
    const numIn = (obj, key, step, after) => { const i = el('input', { type: 'number', step: step || 'any', value: obj[key] ?? '', class: 'form-control form-control-sm' }); i.addEventListener('change', () => { obj[key] = i.value === '' ? '' : Number(i.value); S.design = S.layout ? S.design : null; save(); if (after) after(); }); return i; };
    const sel = (opts, cur, on) => { const s = el('select', { class: 'form-select form-select-sm' }, ...opts.map(([v, l]) => el('option', { value: v, selected: v === cur }, l))); s.addEventListener('change', () => on(s.value)); return s; };
    const download = (name, data, mime) => { const a = el('a', { download: name, href: URL.createObjectURL(new Blob([data], { type: mime })) }); d.body.append(a); a.click(); a.remove(); };
    const fileIn = (label, accept, onText) => { const i = el('input', { type: 'file', accept, class: 'form-control form-control-sm' }); i.addEventListener('change', async () => { const f = i.files && i.files[0]; if (!f) return; try { onText(await f.text(), f.name); } catch (e) { S.notice = e.message; } again(); }); return field(label, i); };
    const roofList = roofs();
    const roofSel = sel([['', roofList.length ? t('roof.manual') : t('roof.none')], ...roofList.map((r) => [r.guid, `${r.level ? r.level + ' — ' : ''}${r.name} (${fmt(r.pitch, 1)}°)`])], S.roof, (v) => { S.roof = v; save(); });
    const outline = el('textarea', { rows: 4, class: 'form-control form-control-sm' }, S.outline); outline.addEventListener('change', () => { S.outline = outline.value; save(); });
    const typeSel = sel(TYPES.map((k) => [k, t('type.' + k)]), S.spec.type, (v) => { S.spec.type = v; S.design = S.layout ? S.design : null; save(); });
    const spSel = sel(table().map((s) => [s.id, s.label]), S.species, (v) => { S.species = v; save(); });
    const sizeSel = (grp) => sel([['', t('size.auto')], ...SIZES.map((s) => [s.id, s.id + ' (' + s.b + ' × ' + s.d + ')'])], (S.draft || {})[grp] || '', (v) => { S.draft = { ...(S.draft || {}), [grp]: v }; S.fixed = S.draft.top && S.draft.bottom && S.draft.web ? { ...S.draft } : null; save(); });
    const d0 = S.design && S.design.ok ? S.design : null;
    const probs = problemsNow().filter((p) => p.severity !== 'note');
    const hasWrite = !!H.canPlace;
    const row = (...x) => el('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:0.4rem' }, ...x);
    const unit = S.loadUnit;
    const comboRows = S.combos.map((c, i) => el('div', { style: 'display:grid;grid-template-columns:2fr repeat(5,1fr);gap:0.25rem;align-items:end' },
      field(i === 0 ? t('combo.name') : '', (() => { const x = el('input', { type: 'text', value: c.name, class: 'form-control form-control-sm' }); x.addEventListener('change', () => { c.name = x.value; save(); }); return x; })()),
      ...['fD', 'fS', 'fW', 'fU', 'CD'].map((k) => field(i === 0 ? t('combo.' + k) : '', numIn(c, k)))));
    const groupRows = S.layout && S.designs ? S.layout.groups.map((g) => { const x = S.designs.get(g.key); return x && x.ok ? [g, x] : [g, null]; }) : [];
    const poolMsg = S.roof || roofList.length ? '' : t('roof.none');
    pane.append(el('div', { style: 'padding:0.5rem' },
      el('p', { style: 'font-size:0.8rem' }, t('intro')),
      el('p', { style: 'font-size:0.8rem;font-weight:600;color:var(--danger,#900)', 'data-trs-label': '' }, DISCLAIMER),
      field(t('type'), typeSel),
      row(field(t('span'), numIn(S.spec, 'span')), field(t('pitch'), numIn(S.spec, 'pitch'))),
      row(field(t('overhang'), numIn(S.spec, 'overhang')), field(t('heel'), numIn(S.spec, 'heel'))),
      row(field(t('spacing'), numIn(S.spec, 'spacing')), field(t('panels'), numIn(S.spec, 'panels'))),
      field(t('stockLengths'), (() => { const i = el('input', { type: 'text', value: S.stockLengths, placeholder: String(S.spec.stock), class: 'form-control form-control-sm' }); i.addEventListener('change', () => { S.stockLengths = i.value; save(); }); return i; })()),
      el('details', { class: 'trs-timber' }, el('summary', {}, t('timber')),
        el('p', { style: 'font-size:0.75rem;opacity:0.8' }, TABLE_LABEL), field(t('species'), spSel),
        row(field(t('size.top'), sizeSel('top')), field(t('size.bottom'), sizeSel('bottom'))), field(t('size.web'), sizeSel('web')),
        row(field(t('fb'), numIn(S, 'fb')), field(t('fcp'), numIn(S, 'fcp'))),
        fileIn(t('species.load'), '.csv,.json,text/csv,application/json', (text) => { const r = parseSpeciesTable(text); if (!r.ok) throw new Error(r.error); api.storage.set('speciesTable', r.species); S.species = r.species[0].id; save(); S.notice = t('species.loaded', { n: r.species.length }); }),
        el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: () => { api.storage.set('speciesTable', []); S.species = DEFAULT_SPECIES[0].id; save(); S.notice = t('species.reset'); again(); } } }, t('species.reset.btn'))),
      el('details', { class: 'trs-loads', open: true }, el('summary', {}, t('loads')),
        el('p', { style: 'font-size:0.75rem;opacity:0.85', 'data-trs-loads-label': '' }, COMBO_LABEL),
        field(t('load.unit'), sel([['kPa', 'kPa'], ['psf', 'psf']], unit, (v) => { S.loadUnit = v; save(); again(); })),
        row(field(t('load.roofDead') + ' (' + unit + ')', numIn(S.loads, 'roofDead')), field(t('load.snow') + ' (' + unit + ')', numIn(S.loads, 'snow'))),
        row(field(t('load.ceilingDead') + ' (' + unit + ')', numIn(S.loads, 'ceilingDead')), field(t('load.floorLive') + ' (' + unit + ')', numIn(S.loads, 'floorLive'))),
        row(field(t('load.windward') + ' (' + unit + ')', numIn(S.loads, 'windward')), field(t('load.leeward') + ' (' + unit + ')', numIn(S.loads, 'leeward'))),
        row(field(t('load.uplift') + ' (' + unit + ')', numIn(S.loads, 'uplift')), field(t('load.duration'), numIn(S.loads, 'duration'))),
        el('p', { style: 'font-size:0.78rem;margin:0.4rem 0 0' }, t('combos')), ...comboRows,
        row(field(t('momentDiv'), numIn(S, 'momentDiv')), field(t('deflLimit'), numIn(S, 'deflLimit'))),
        field(t('fixity'), sel([['rigid', t('fixity.rigid')], ['pinned', t('fixity.pinned')]], S.fixity, (v) => { S.fixity = v; save(); }))),
      el('details', { class: 'trs-plates' }, el('summary', {}, t('plates')),
        el('p', { style: 'font-size:0.78rem', 'data-trs-plates': '' }, plateTable() ? t('plates.yours', { label: plateTable().label, n: plateTable().list.length }) : PLATE_PLACEHOLDER_LABEL + '.'),
        fileIn(t('plates.load'), '.csv,.json,text/csv,application/json', (text) => { const r = parsePlateTable(text); if (!r.ok) throw new Error(r.error); api.storage.set('plateTable', { label: r.label, list: r.plates }); S.notice = t('plates.loaded', { n: r.plates.length, label: r.label }); }),
        el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: () => { api.storage.set('plateTable', null); S.notice = t('plates.reset'); again(); } } }, t('plates.reset.btn'))),
      el('fieldset', { style: 'border:1px solid var(--line);padding:0.4rem;margin:0.4rem 0' }, el('legend', { style: 'font-size:0.8rem' }, t('layout')),
        field(t('roof'), roofSel), field(t('outline'), outline), H.pickOutline ? el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-trs-pick': '', on: { click: () => { try { const o = H.pickOutline(); S.outline = o.map((p) => Math.round(p[0] * 10) / 10 + ', ' + Math.round(p[1] * 10) / 10).join('\n'); S.roof = ''; save(); S.notice = t('pick.done', { n: o.length }); again(); } catch (e) { say.textContent = e.message; } } } }, t(H.pickKey || 'btn.pick')) : null, field(t('ends'), sel([['gable', t('ends.gable')], ['hip', t('ends.hip')]], S.ends, (v) => { S.ends = v; save(); })),
        field(t('ridge'), sel([['auto', t('ridge.auto')], ['x', 'X'], ['y', 'Y']], S.ridge, (v) => { S.ridge = v; save(); })),
        field(t('hipMethod'), sel([['stepdown', t('hip.stepdown')], ['girder', t('hip.girder')]], S.hipMethod, (v) => { S.hipMethod = v; save(); })),
        row(field(t('setback'), numIn(S, 'setback')), field(t('minHeight'), numIn(S, 'minHeight'))),
        field(t('valleyMode'), sel([['cross', t('valley.cross')], ['set', t('valley.set')]], S.valleyMode, (v) => { S.valleyMode = v; save(); })),
        el('details', {}, el('summary', {}, t('valley.typed')),
          row(field(t('valley.wingWidth'), numIn(S.valley, 'wingWidth')), field(t('valley.wingPitch'), numIn(S.valley, 'wingPitch'))), field(t('valley.mainPitch'), numIn(S.valley, 'mainPitch')),
          el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: run(async () => { doValley(); }) } }, t('btn.valley')))),
      el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap' },
        el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: run(async () => { doDesign(); }) } }, t('btn.design')),
        el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: run(async () => { roofs(); doLayout(); }) } }, t('btn.layout')),
        hasWrite ? el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-trs-place': '', on: { click: async () => { try { roofs(); if (!S.layout) doLayout(); const n = await doPlace(); say.textContent = t('result.placed', { n }); } catch (e) { say.textContent = e.message; } } } }, t(H.placeKey || 'btn.place')) : el('span', { style: 'font-size:0.75rem' }, t('err.write')),
        hasWrite && H.clear ? el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-trs-clear': '', on: { click: async () => { try { const ok = await H.clear(); say.textContent = t(ok ? 'result.cleared' : 'result.nothing'); } catch (e) { say.textContent = e.message; } } } }, t('btn.clear')) : null,
        ...(H.buttons || []).map((b) => el('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-trs-host': b.id, on: { click: async () => { try { if (!S.design && !S.layout) doDesign(); say.textContent = await b.run({ design: needDesign(), layout: S.layout, designs: S.designs, outline: outlineNow(), say: (s) => { say.textContent = s; } }); } catch (e) { say.textContent = e.message; } } } }, t(b.key)))),
      say, poolMsg ? null : null,
      probs.length ? el('ul', { style: 'font-size:0.78rem;padding-left:1.1rem', 'data-trs-problems': '' }, ...probs.slice(0, 14).map((p) => el('li', {}, `${p.severity}: ${p.text}`))) : null,
      groupRows.length ? el('table', { class: 'trs-set table table-sm', 'data-trs-set': '', style: 'font-size:0.76rem' },
        el('thead', {}, el('tr', {}, ...['set.form', 'set.n', 'set.span', 'set.sizes', 'set.util', 'set.status'].map((k) => el('th', {}, t(k))))),
        el('tbody', {}, ...groupRows.map(([g, x]) => el('tr', { 'data-key': g.key, style: g.key === S.show ? 'font-weight:600' : '', on: { click: () => { S.show = g.key; S.design = x; again(); } } },
          el('td', {}, KIND_NAME[g.kind] || g.kind), el('td', {}, String(g.ids.length)), el('td', {}, String(g.span)),
          el('td', {}, x ? `${x.sizes.top}/${x.sizes.bottom}/${x.sizes.web}` : '—'), el('td', {}, x ? fmt(maxUtil(x), 2) : '—'), el('td', {}, x ? x.res.status : t('set.failed')))))) : null,
      d0 ? el('div', { 'data-trs-drawing': '', style: 'overflow:auto;max-width:100%' }, (() => { const w = d.createElement('div'); w.innerHTML = elevationSvg(d0.g, d0.sizes, { raise: d0.heel.raise, forces: d0.res.forces, title: t('dwg.title', { type: d0.g.type }) }); return w; })()) : null,
      S.layout ? el('div', { 'data-trs-3d': '' },
        el('div', { style: 'display:flex;gap:0.5rem;font-size:0.78rem' },
          el('label', {}, t('view.az') + ' ', (() => { const i = el('input', { type: 'range', min: 0, max: 359, value: S.az }); i.addEventListener('input', () => { S.az = Number(i.value); box.innerHTML = view(); }); return i; })()),
          el('label', {}, t('view.el') + ' ', (() => { const i = el('input', { type: 'range', min: 5, max: 85, value: S.el }); i.addEventListener('input', () => { S.el = Number(i.value); box.innerHTML = view(); }); return i; })())),
        (() => { box = el('div', { style: 'overflow:auto' }); box.innerHTML = view(); return box; })()) : null,
      el('div', { style: 'display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.5rem' },
        ...[['members.csv', t('export.members'), () => memberCsv(needDesign()), 'text/csv'], ['cut-list.csv', t('export.cuts'), () => (S.layout && S.designs ? setCutCsv(S.layout, S.designs) : cutCsv(needDesign(), 1)), 'text/csv'], ['joints.csv', t('export.joints'), () => (S.layout && S.designs ? setJointCsv(S.layout, S.designs) : jointCsv(needDesign())), 'text/csv'],
          ['jig.svg', t('export.jig'), () => jigNow(), 'image/svg+xml'], ['stock.csv', t('export.stock'), () => stockNow().csv, 'text/csv'], ['trusses.stl', t('export.stl'), () => stlText(bodiesNow()), 'model/stl'], ['trusses.obj', t('export.obj'), () => objText(bodiesNow()), 'text/plain']]
          .map(([n, l, fn, m]) => el('button', { type: 'button', class: 'btn-line btn-sm-cc', on: { click: () => { try { download(n, fn(), m); } catch (e) { say.textContent = e.message; } } } }, l)))));
    var box;
    function view() { return S.layout ? toSvg(layoutSegments(S.layout, (sp, tr) => designFor(sp, tr)?.g, S.z0), { az: S.az, el: S.el }) : ''; }
  }
  return { design: doDesign, layout: doLayout, valley: doValley, designFor, place: doPlace, roofs, bodies: bodiesNow, jig: jigNow, stock: stockNow, host: H, state: () => S, problems: () => problemsNow() };
}
