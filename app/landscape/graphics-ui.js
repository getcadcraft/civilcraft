/* SPDX-License-Identifier: Apache-2.0 */
/**
 * graphics-ui.js — plant graphics on the page (0.8 LA.7, session `landscape-arch_PART_4`): Landscape › More › Plant graphics (plan detail
 * level: automatic by scale with its two thresholds, or fixed; the 3D view: simple masses, the built-in forms, or each record's own model),
 * and on a plant record: Own symbol (an SVG, or a block of a DXF/DWG) and Own 3D model (OBJ, STL or GLB — glb.js, landscape-finish_PART_4). Files are untrusted: sizes and counts
 * are capped (symbols.js), stored in the project (state.landscape.assets), and the record names them (record.own). One undo step each.
 *
 *   createGraphicsUi(ctx, { edit, LS, index }) → { open(), recordButtons(sp) → [elements] }
 */
import { symbolFromSvg, symbolFromCad, normalizeModel, LEVELS, DEFAULT_THRESHOLDS, SYMBOL_LIMITS } from './symbols.js';
import { readObj, readStl } from './freeform.js';
import { readGlbModel } from './glb.js';   // 0.8 LA.7: GLB, geometry only, capped, nothing fetched
import { t } from '../i18n.js';

export function createGraphicsUi(ctx, { edit, LS, index }) {
  const { el, root } = ctx;
  const newId = (pre) => { const used = new Set(Object.keys(LS().assets || {})); let n = 1; while (used.has(pre + n)) n++; return pre + n; };
  /** The record in the project's own list (a list species is copied in first, so the change belongs to this project). */
  const attach = (sp, field, id, asset, label) => edit(label, (l) => {
    l.assets = { ...(l.assets || {}), [id]: asset };
    let rec = (l.palette || []).find((x) => x.key === sp.key);
    if (!rec) { rec = JSON.parse(JSON.stringify(sp)); l.palette = [...(l.palette || []), rec]; }
    rec.own = { symbol: '', model: '', ...(rec.own || {}), [field]: id };
  });
  const pickFile = (accept, fn) => {
    const f = el('input', { type: 'file', accept, className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true' });
    f.addEventListener('change', async () => { const file = f.files?.[0]; f.remove(); if (file) { try { await fn(file); } catch (e) { ctx.say(t('ls.gx.bad', { why: t('ls.gx.why.' + (['too-big', 'empty', 'bad-svg', 'no-block', 'bad-glb', 'unsupported', 'external'].includes(e.message) ? e.message : 'other')) })); } } });
    root.append(f); f.click();
  };
  async function ownSymbol(sp) {
    pickFile('.svg,.dxf,.dwg', async (file) => {
      if (file.size > 16 * 1024 * 1024) throw new Error('too-big');
      let sym;
      if (/\.svg$/i.test(file.name)) sym = symbolFromSvg(await file.text());
      else {
        const model = /\.dwg$/i.test(file.name) ? (await import('../dwg/read.js')).readDwg(new Uint8Array(await file.arrayBuffer())) : (await import('../dxf-model.js')).readDxfModel(await file.text());
        const blocks = (model?.blocks || []).filter((b) => !String(b.name).startsWith('*') && (b.entities || []).length);
        if (!blocks.length) throw new Error('no-block');
        const name = blocks.length === 1 ? blocks[0].name : await chooseBlock(blocks.map((b) => b.name));
        if (!name) return;
        sym = symbolFromCad(blocks.find((b) => b.name === name).entities);
      }
      attach(sp, 'symbol', newId('sym-'), { kind: 'symbol', name: file.name.slice(0, 120), entities: sym.entities }, t('ls.gx.undo.symbol'));
      ctx.say(t('ls.gx.symbol.done', { n: sym.entities.length }) + (sym.notes.includes('transform') ? ' ' + t('ls.gx.transform') : ''));
      ctx.refresh();
    });
  }
  function chooseBlock(names) {
    return new Promise((done) => {
      const sel = el('select', { className: 'cv-select', id: 'cv-gx-block' }, ...names.slice(0, 500).map((n) => el('option', { value: n }, n)));
      const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-gx-bh' }, el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-gx-bh' }, t('ls.gx.block'))),
        el('div', { className: 'cv-dlg-body' }, el('label', { for: 'cv-gx-block' }, t('ls.gx.block')), sel),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => { dlg.close(); done(null); } }, t('ls.close')),
          el('button', { type: 'button', className: 'btn-plot btn-sm-cc', onclick: () => { const v = sel.value; dlg.close(); done(v); } }, t('ls.gx.use')))));
      dlg.addEventListener('close', () => dlg.remove());
      root.append(dlg); dlg.showModal();
    });
  }
  async function ownModel(sp) {
    pickFile('.obj,.stl,.glb', async (file) => {
      if (file.size > 32 * 1024 * 1024) throw new Error('too-big');
      const glb = /\.glb$/i.test(file.name), mesh = glb ? readGlbModel(new Uint8Array(await file.arrayBuffer()), { tris: SYMBOL_LIMITS.tris })
        : /\.stl$/i.test(file.name) ? readStl(new Uint8Array(await file.arrayBuffer())) : readObj(await file.text(), { yUp: true });
      if (!mesh) throw new Error('empty');
      if (mesh.indices.length / 3 > SYMBOL_LIMITS.tris) throw new Error('too-big');
      normalizeModel(mesh.positions, mesh.indices);   // throws when it will not draw
      const r = (v) => Math.round(v * 1e5) / 1e5;
      attach(sp, 'model', newId('mdl-'), { kind: 'model', name: file.name.slice(0, 120), positions: Array.from(mesh.positions, r), indices: Array.from(mesh.indices) }, t('ls.gx.undo.model'));
      ctx.say(t('ls.gx.model.done', { n: mesh.indices.length / 3 }) + (glb ? ' ' + t('ls.gx.glb.note') : ''));
      ctx.refresh();
    });
  }
  function clearOwn(sp, field) {
    edit(t('ls.gx.undo.clear'), (l) => { const rec = (l.palette || []).find((x) => x.key === sp.key); if (rec?.own) rec.own = { ...rec.own, [field]: '' }; });
    ctx.refresh();
  }
  function recordButtons(sp) {
    const own = (LS().palette || []).find((x) => x.key === sp.key)?.own || {};
    return [
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-ownsym': sp.key, onclick: () => ownSymbol(sp) }, t(own.symbol ? 'ls.gx.symbol.again' : 'ls.gx.symbol')),
      own.symbol ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => clearOwn(sp, 'symbol') }, t('ls.gx.symbol.clear')) : '',
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-ownmodel': sp.key, onclick: () => ownModel(sp) }, t(own.model ? 'ls.gx.model.again' : 'ls.gx.model')),
      own.model ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => clearOwn(sp, 'model') }, t('ls.gx.model.clear')) : '',
    ];
  }

  function open() {
    const ls = LS(), th = ls.symbolScale || DEFAULT_THRESHOLDS;
    const lv = el('select', { className: 'cv-select', id: 'cv-gx-level', 'data-gx-level': '' }, el('option', { value: '' }, t('ls.gx.auto')), ...LEVELS.map((x) => el('option', { value: x }, t('ls.gx.l.' + x))));
    lv.value = ls.symbolLevel || '';
    lv.addEventListener('change', () => edit(t('ls.gx.undo.set'), (l) => { if (lv.value) l.symbolLevel = lv.value; else delete l.symbolLevel; }));
    const num = (id, v, key) => ctx.numInput(v, (s) => { const n = Number(s); if (!(n >= 1 && n <= 1e6)) return false; edit(t('ls.gx.undo.set'), (l) => { l.symbolScale = { ...DEFAULT_THRESHOLDS, ...(l.symbolScale || {}), [key]: n }; }); return true; }, { label: t('ls.gx.th.' + key), id, calc: false });
    const v3 = el('select', { className: 'cv-select', id: 'cv-gx-3d', 'data-gx-3d': '' }, ...['simple', 'forms', 'own'].map((x) => el('option', { value: x }, t('ls.gx.3d.' + x))));
    v3.value = ls.plants3d || 'forms';
    v3.addEventListener('change', () => edit(t('ls.gx.undo.set'), (l) => { l.plants3d = v3.value; }));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-gx-h', 'data-ls-graphics': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-gx-h' }, t('ls.gx.head'))),
      el('div', { className: 'cv-dlg-body' },
        el('div', { className: 'cv-props' }, el('label', { for: 'cv-gx-level' }, t('ls.gx.level')), lv,
          el('label', { for: 'cv-gx-ths' }, t('ls.gx.th.simple')), num('cv-gx-ths', th.simple, 'simple'),
          el('label', { for: 'cv-gx-tho' }, t('ls.gx.th.outline')), num('cv-gx-tho', th.outline, 'outline'),
          el('label', { for: 'cv-gx-3d' }, t('ls.gx.3d')), v3),
        el('p', { className: 'cv-note' }, t('ls.gx.note'))),
      el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gx-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); ctx.redraw(); ctx.refresh(); });
    root.append(dlg); dlg.showModal();
  }
  return { open, recordButtons };
}
