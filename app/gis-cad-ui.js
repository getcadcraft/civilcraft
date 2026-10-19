/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-cad-ui.js — open a DWG or DXF as linework (0.4 V1): the page side of cad-linework.js. gis-ui.js installs it;
 * install(host) registers an opener for .dwg / .dxf (Open, drop, GIS › Import) and the command 'cad-open'.
 *
 * The drawing is read in the browser (nothing is uploaded): DWG by cc-dwg in a worker (dwg/read-async.js), DXF by
 * dxf-model.js — both loaded on first use. The dialog lists the drawing's layers that hold linework (lines, closed
 * shapes, points; with or without elevations), the drawing units and what they become, and for each layer an optional
 * "Use for the surface" (breaklines from the lines' own elevations or their ELEV, the boundary, survey points — the same
 * choices as a GIS layer's). Add = the chosen layers become GIS layers (one undo step), then each chosen use is one
 * more undo step. Layers named like contours (TOPO, CONT, CNTR) that carry elevations start as breaklines.
 * Survey points from blocks (0.5 WL.19; block-points.js): the drawing's block references in model space, by block or by
 * layer, each insertion point → one survey point (description from the block name, its layer or an attribute; elevation
 * from the insertion or an attribute; number from an attribute or the next free ones), added as ONE undo step; the
 * drawing is not changed and every point keeps the block it came from (`blk`). Attribute choices start on likely tags.
 * CivilCraft's own feature lines (0.6 WL.24; cad-linework.js cadFeatureLines): when the drawing holds 3D polylines CivilCraft
 * wrote as feature lines, a box (`[data-cad-fl]`, on at first) brings them back as feature lines with their arcs (one undo
 * step) instead of as linework.
 * window.civilcraft.gis.cad (host.cad) = { open(files), last } for tests. Every word goes through t() (lang/en.json, cad.*).
 */

import { t } from './i18n.js';
import { cadLinework, unitScale, cadFeatureLines } from './cad-linework.js';
import { blockRefs, pointsFromBlocks } from './block-points.js';
import { addLayers, useChoices, useForSurface, layerOf } from './gis-layers.js';

const CAD = /\.(dwg|dxf)$/i;
const MAX_BYTES = 200 * 1024 * 1024;
const CONTOUR = /TOPO|CONT|CNTR|CTR|CONTOUR/i;
const UNIT_CHOICES = [['', null], ['ft', 2], ['ft-us', 21], ['m', 6], ['mm', 4], ['cm', 5], ['in', 1]];
// likely attribute tags of survey point blocks (upper case), for the first choice of each select
const TAG_GUESS = { num: /^(PT|PNT|POINT|PT_?NO|PNT_?NO|POINT_?(NO|NUM|NUMBER)|NO|NUM|NUMBER|ID)$/, desc: /^(DESC|DESCRIPTION|CODE|DESCR|RAW_?DESC|FULL_?DESC|NAME)$/, z: /^(ELEV|ELEVATION|EL|Z|HEIGHT|ELV|LEVEL|RL)$/ };

export async function install(host) {
  const { reg, el } = host;
  const P = () => host.project;
  const num = (n) => Number(n).toLocaleString('en-US');
  const api = { last: null };
  let uid = 0;

  reg.openers.unshift({ accepts: (files) => files.length >= 1 && files.every((f) => CAD.test(f.name)), open: (files) => openFiles(files) });
  reg.commands.set('cad-open', async () => {
    const inp = el('input', { type: 'file', accept: '.dwg,.dxf', className: 'visually-hidden' });
    inp.addEventListener('change', async () => { const fs = [...inp.files]; inp.remove(); if (fs.length) await openFiles(fs); });
    inp.addEventListener('cancel', () => inp.remove());
    host.root.append(inp);
    inp.click();
  });

  /** Read one drawing → its model, or null (said). */
  async function readModel(f) {
    if (f.size > MAX_BYTES) { host.say(t('cad.ui.too.big', { file: f.name, mb: 200 })); return null; }
    host.busy(t('cad.ui.reading', { file: f.name }));
    try {
      if (/\.dxf$/i.test(f.name)) {
        let m;
        try { m = await import('./dxf-model.js'); } catch { host.say(t('cad.ui.no.reader')); return null; }
        const text = await f.text();
        if (/^\s*AutoCAD Binary DXF/.test(text.slice(0, 32))) { host.say(t('cad.ui.binary.dxf', { file: f.name })); return null; }
        return m.readDxfModel(text);
      }
      let m;
      try { m = await import('./dwg/read-async.js'); } catch { host.say(t('cad.ui.no.reader')); return null; }
      return await m.readDwgAsync(new Uint8Array(await f.arrayBuffer()));
    } catch (e) {
      host.say(t('cad.ui.read.failed', { file: f.name, why: e?.message || String(e) }));
      return null;
    } finally { host.busy(''); }
  }

  async function openFiles(files) {
    for (const f of files) {
      const model = await readModel(f);
      if (!model) return;
      await chooseDialog(f.name, model);
    }
  }

  function dialog(title, body) {
    const id = 'cv-cad-h-' + (++uid);
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cad.ui.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const foot = el('div', { className: 'cv-dlg-foot' });
    const dlg = el('dialog', { className: 'cv-dialog cv-gisv cv-cad', 'aria-labelledby': id, 'data-cad-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, title), close),
        el('div', { className: 'cv-dlg-body' }, body), foot));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); host.refocus(); });
    return { dlg, foot };
  }

  function chooseDialog(file, model) {
    return new Promise((done) => {
      const projectUnit = P().state.units === 'm' ? 'm' : 'ft';
      let unitCode = null;   // null = what the file says
      let flOn = true, fls = cadFeatureLines(model, { projectUnit });   // 0.6 WL.24
      let r = cadLinework(model, { file, projectUnit, skipFeatureLines: fls.length > 0 });
      let br = blockRefs(model, { projectUnit, scale: r.scale });
      if (!r.layers.length && !br.refs.length && !fls.length) { host.say([t('cad.ui.nothing', { file }), ...r.notes].join(' ')); done(null); return; }
      const pick = new Set(r.cadLayers.filter((l) => l.on).map((l) => l.name));
      const use = new Map();   // cad layer name + geom → choice index (into useChoices of that layer)
      const tbody = el('tbody', {});
      const notesBox = el('div', { className: 'cv-report', 'data-cad-notes': '' });
      const unitSel = el('select', { className: 'cv-select', id: 'cv-cad-unit-' + uid, 'data-cad-units': '' },
        ...UNIT_CHOICES.map(([k, code]) => el('option', { value: code === null ? '' : String(code) }, code === null ? t('cad.ui.units.file', { unit: r.units.label || t('cad.ui.units.none') }) : t('cad.ui.unit.' + k))));
      const unitNote = el('p', { className: 'cv-note', 'data-cad-unit-note': '' });
      const what = el('p', { className: 'cv-note', 'data-cad-what': '' });
      const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-cad-go': '' }, t('cad.ui.add'));
      const flBox = el('input', { type: 'checkbox', checked: true, 'data-cad-fl': '' });
      const flSec = el('section', { className: 'cv-blk', 'data-cad-fl-sec': '', hidden: !fls.length },
        el('h3', { className: 'cv-h3' }, t('cad.fl.head')), el('label', { className: 'cv-check' }, flBox, ' ', el('span', { 'data-cad-fl-label': '' })));
      flBox.onchange = () => { flOn = flBox.checked; rebuild(); };
      // ---- survey points from blocks (WL.19) ----
      const bPick = new Set(), lPick = new Set();
      const bBody = el('tbody', {}), lList = el('div', { className: 'cv-blk-layers', 'data-blk-layers': '' });
      const bDesc = el('select', { className: 'cv-select', id: 'cv-blk-desc-' + uid, 'data-blk-desc': '' });
      const bZ = el('select', { className: 'cv-select', id: 'cv-blk-z-' + uid, 'data-blk-z': '' });
      const bNum = el('select', { className: 'cv-select', id: 'cv-blk-num-' + uid, 'data-blk-num': '' });
      const bWhat = el('p', { className: 'cv-note', 'data-blk-what': '' });
      const touched = { desc: false, z: false, num: false };
      bDesc.onchange = () => { touched.desc = true; sum(); };
      bZ.onchange = () => { touched.z = true; sum(); };
      bNum.onchange = () => { touched.num = true; sum(); };
      const blkSec = el('section', { className: 'cv-blk', 'data-blk-sec': '', hidden: true },
        el('h3', { className: 'cv-h3' }, t('cad.blk.head')),
        el('p', { className: 'cv-note' }, t('cad.blk.lede')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-blk-table': '' },
          el('thead', {}, el('tr', {}, el('th', {}, el('span', { className: 'visually-hidden' }, t('cad.blk.col.take'))), el('th', { scope: 'col' }, t('cad.blk.col.block')),
            el('th', { scope: 'col' }, t('cad.blk.col.count')), el('th', { scope: 'col' }, t('cad.blk.col.layers')), el('th', { scope: 'col' }, t('cad.blk.col.tags')))), bBody)),
        el('p', { className: 'cv-note' }, t('cad.blk.bylayer')), lList,
        el('div', { className: 'cv-props cv-blk-how' },
          el('label', { for: bNum.id }, t('cad.blk.num')), bNum,
          el('label', { for: bDesc.id }, t('cad.blk.desc')), bDesc,
          el('label', { for: bZ.id }, t('cad.blk.z')), bZ),
        bWhat);
      const chosenRefs = () => br.refs.filter((x) => bPick.has(x.block) || lPick.has(x.layer));
      /** Fill a select with fixed choices + one per attribute tag of the chosen references; keep or guess its value. */
      function fillSelect(sel, fixed, tags, guess, keep) {
        const was = sel.value;
        sel.replaceChildren(...fixed.map(([v, label]) => el('option', { value: v }, label)), ...tags.map((tg) => el('option', { value: 'attr:' + tg }, t('cad.blk.attr', { tag: tg }))));
        const vals = [...sel.options].map((o) => o.value);
        if (keep && vals.includes(was)) sel.value = was;
        else { const g = tags.find((tg) => guess.test(tg)); sel.value = g ? 'attr:' + g : fixed[0][0]; }
      }
      function rebuildBlocks() {
        blkSec.hidden = !br.refs.length;
        if (!br.refs.length) return;
        bBody.replaceChildren(...br.blocks.map((b) => {
          const box = el('input', { type: 'checkbox', checked: bPick.has(b.name), 'aria-label': t('cad.blk.take', { block: b.name }), 'data-blk-pick': b.name });
          box.onchange = () => { if (box.checked) bPick.add(b.name); else bPick.delete(b.name); howChoices(); sum(); };
          return el('tr', { 'data-blk-row': b.name }, el('td', {}, box), el('td', {}, b.name), el('td', {}, num(b.count)), el('td', {}, b.layers.join(', ')), el('td', {}, b.tags.join(', ') || '—'));
        }));
        lList.replaceChildren(...br.layers.map((l) => {
          const box = el('input', { type: 'checkbox', checked: lPick.has(l.name), 'data-blk-layer': l.name });
          box.onchange = () => { if (box.checked) lPick.add(l.name); else lPick.delete(l.name); howChoices(); sum(); };
          return el('label', { className: 'cv-check' }, box, ' ', t('cad.blk.layer', { layer: l.name, n: num(l.count) }));
        }));
        howChoices();
      }
      function howChoices() {
        const tags = [...new Set(chosenRefs().flatMap((x) => Object.keys(x.attrs)))].sort();
        fillSelect(bNum, [['next', t('cad.blk.num.next')]], tags, TAG_GUESS.num, touched.num);
        fillSelect(bDesc, [['block', t('cad.blk.desc.block')], ['layer', t('cad.blk.desc.layer')]], tags, TAG_GUESS.desc, touched.desc);
        // an elevation attribute is only guessed when the blocks sit at zero (a 2D drawing)
        const flat = chosenRefs().every((x) => x.z === 0);
        fillSelect(bZ, [['insert', t('cad.blk.z.insert')], ['none', t('cad.blk.z.none')]], tags, flat ? TAG_GUESS.z : /^$/, touched.z);
      }

      const choicesFor = (l) => useChoices({ geom: l.geom, fields: l.fields }, l.features);
      function rebuild() {
        const header = unitCode === null ? model.header : { ...model.header, INSUNITS: unitCode };
        fls = cadFeatureLines({ ...model, header }, { projectUnit, scale: unitScale(header, projectUnit).scale });
        r = cadLinework({ ...model, header }, { file, projectUnit, skipFeatureLines: flOn && fls.length > 0 });
        flSec.querySelector('[data-cad-fl-label]').textContent = t('cad.fl.take', { n: fls.length, arcs: fls.reduce((a, f) => a + f.pts.filter((p) => p.b).length, 0) });
        const us = unitScale(header, projectUnit);
        unitNote.textContent = us.note || t('cad.ui.units.same', { unit: t('cad.unit.' + projectUnit) });
        const rows = [];
        for (const cl of r.cadLayers) {
          const box = el('input', { type: 'checkbox', checked: pick.has(cl.name), 'aria-label': t('cad.ui.add.layer', { layer: cl.name }) });
          box.onchange = () => { if (box.checked) pick.add(cl.name); else pick.delete(cl.name); sum(); };
          const kinds = [cl.lines && t('cad.ui.n.lines', { n: cl.lines }), cl.polygons && t('cad.ui.n.closed', { n: cl.polygons }), cl.points && t('cad.ui.n.points', { n: cl.points })].filter(Boolean).join(', ');
          const uses = r.layers.filter((l) => l.cadLayer === cl.name).map((l) => {
            const ch = choicesFor(l), key = cl.name + '|' + l.geom;
            if (!ch.length) return null;
            if (!use.has(key)) {
              const auto = CONTOUR.test(cl.name) && l.geom !== 'pt' ? ch.findIndex((c) => c.use === 'breaklines' && c.from === 'z') : -1;
              use.set(key, auto);
            }
            const s = el('select', { className: 'cv-select cv-cad-use', 'aria-label': t('cad.ui.use.for', { layer: l.name }), 'data-cad-use': key },
              el('option', { value: '-1' }, t('cad.ui.use.none')), ...ch.map((c, i) => el('option', { value: String(i) }, c.label)));
            s.value = String(use.get(key));
            s.onchange = () => { use.set(key, Number(s.value)); sum(); };
            return s;
          }).filter(Boolean);
          rows.push(el('tr', { 'data-cad-layer': cl.name }, el('td', {}, box), el('td', {}, cl.name + (cl.on ? '' : ' ' + t('cad.ui.off'))), el('td', {}, kinds),
            el('td', {}, cl.z ? t('cad.ui.z.yes') : t('cad.ui.z.no')), el('td', { className: 'cv-cad-uses' }, ...(uses.length ? uses : [el('span', { className: 'cv-note' }, t('cad.ui.use.nothing'))]))));
        }
        tbody.replaceChildren(...rows);
        br = blockRefs({ ...model, header }, { projectUnit, scale: r.scale });
        rebuildBlocks();
        notesBox.replaceChildren(...(r.notes.length ? [el('ul', {}, ...r.notes.map((n) => el('li', {}, n)))] : []));
        notesBox.hidden = !r.notes.length;
        sum();
      }
      function chosen() {
        return r.layers.filter((l) => pick.has(l.cadLayer));
      }
      function sum() {
        const ls = chosen();
        const uses = ls.filter((l) => (use.get(l.cadLayer + '|' + l.geom) ?? -1) >= 0).length;
        const nPts = chosenRefs().length;
        const nFl = flOn ? fls.length : 0;
        what.textContent = [ls.length ? t('cad.ui.what', { n: ls.length, uses }) : '', nPts ? t('cad.blk.what', { n: nPts }) : '', nFl ? t('cad.fl.what', { n: nFl }) : ''].filter(Boolean).join(' ') || t('cad.ui.what.none');
        bWhat.textContent = nPts ? t('cad.blk.what', { n: nPts }) : t('cad.blk.what.none');
        go.disabled = !ls.length && !nPts && !nFl;
      }
      unitSel.onchange = () => { unitCode = unitSel.value === '' ? null : Number(unitSel.value); rebuild(); };

      const { dlg, foot } = dialog(t('cad.ui.title', { file }), [
        el('p', { className: 'cv-note' }, t('cad.ui.lede')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table cv-gisv-layers', 'data-cad-layers': '' },
          el('thead', {}, el('tr', {}, el('th', {}, el('span', { className: 'visually-hidden' }, t('cad.ui.col.add'))), el('th', { scope: 'col' }, t('cad.ui.col.layer')),
            el('th', { scope: 'col' }, t('cad.ui.col.holds')), el('th', { scope: 'col' }, t('cad.ui.col.z')), el('th', { scope: 'col' }, t('cad.ui.col.use')))),
          tbody)),
        el('div', { className: 'cv-props' }, el('label', { for: unitSel.id }, t('cad.ui.units')), unitSel), unitNote,
        notesBox,
        flSec,
        blkSec,
        el('h3', { className: 'cv-h3' }, t('cad.ui.what.head')), what]);
      let result = null;
      go.onclick = () => {
        const ls = chosen();
        const ids = ls.length ? addLayers(P(), ls, { label: t('cad.ui.undo', { file }) }) : [];
        const msgs = ls.length ? [t('cad.ui.added', { n: ids.length, file })] : [];
        let blk = null;
        if (chosenRefs().length) {
          blk = pointsFromBlocks(br.refs, { blocks: [...bPick], layers: [...lPick], desc: bDesc.value, z: bZ.value, number: bNum.value, existing: P().points });
          P().editPoints(t('cad.blk.undo', { file }), (pts) => [...pts, ...blk.points]);
          msgs.push(t('cad.blk.added', { n: blk.points.length, file }));
          if (blk.renumbered) msgs.push(t('cad.blk.renumbered', { n: blk.renumbered }));
          if (blk.skipped.noZ) msgs.push(t('cad.blk.noz', { n: blk.skipped.noZ }));
          if (blk.skipped.noNumber) msgs.push(t('cad.blk.nonum', { n: blk.skipped.noNumber }));
        }
        if (flOn && fls.length) {   // 0.6 WL.24: the feature lines, arcs and all, as one undo step
          const p = P();
          p.change(t('cad.fl.undo', { file }), (s) => { for (const f of fls) (s.features ||= []).push({ ...f, id: p.nextId('f') }); });
          msgs.push(t('cad.fl.added', { n: fls.length, file }));
        }
        ls.forEach((l, i) => {
          const k = use.get(l.cadLayer + '|' + l.geom) ?? -1;
          if (k < 0 || !ids[i]) return;
          const c = choicesFor(l)[k];
          const field = c.from === 'field' ? (c.fields.includes('ELEV') ? 'ELEV' : c.fields[0]) : null;
          const u = useForSurface(P(), ids[i], { use: c.use, from: c.from, field });
          msgs.push(u.message);
        });
        result = { ids, layers: ids.map((id) => layerOf(P(), id)?.name), notes: r.notes, scale: r.scale, points: blk ? blk.points.length : 0, features: flOn ? fls.length : 0 };
        api.last = result;
        dlg.close();
        host.fitAll();
        host.refresh();
        host.say(msgs.join(' ') + ' ' + t('cad.ui.after'));
      };
      dlg.addEventListener('close', () => done(result));
      foot.append(el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('cad.ui.cancel')), go);
      rebuild();
      host.root.append(dlg);
      dlg.showModal();
      go.focus();
    });
  }

  api.open = openFiles;
  host.cad = api;
}
