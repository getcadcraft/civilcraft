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
 * window.civilcraft.gis.cad (host.cad) = { open(files), last } for tests. Every word goes through t() (lang/en.json, cad.*).
 */

import { t } from './i18n.js';
import { cadLinework, unitScale } from './cad-linework.js';
import { addLayers, useChoices, useForSurface, layerOf } from './gis-layers.js';

const CAD = /\.(dwg|dxf)$/i;
const MAX_BYTES = 200 * 1024 * 1024;
const CONTOUR = /TOPO|CONT|CNTR|CTR|CONTOUR/i;
const UNIT_CHOICES = [['', null], ['ft', 2], ['ft-us', 21], ['m', 6], ['mm', 4], ['cm', 5], ['in', 1]];

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
      let r = cadLinework(model, { file, projectUnit });
      if (!r.layers.length) { host.say([t('cad.ui.nothing', { file }), ...r.notes].join(' ')); done(null); return; }
      const pick = new Set(r.cadLayers.filter((l) => l.on).map((l) => l.name));
      const use = new Map();   // cad layer name + geom → choice index (into useChoices of that layer)
      const tbody = el('tbody', {});
      const notesBox = el('div', { className: 'cv-report', 'data-cad-notes': '' });
      const unitSel = el('select', { className: 'cv-select', id: 'cv-cad-unit-' + uid, 'data-cad-units': '' },
        ...UNIT_CHOICES.map(([k, code]) => el('option', { value: code === null ? '' : String(code) }, code === null ? t('cad.ui.units.file', { unit: r.units.label || t('cad.ui.units.none') }) : t('cad.ui.unit.' + k))));
      const unitNote = el('p', { className: 'cv-note', 'data-cad-unit-note': '' });
      const what = el('p', { className: 'cv-note', 'data-cad-what': '' });
      const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-cad-go': '' }, t('cad.ui.add'));

      const choicesFor = (l) => useChoices({ geom: l.geom, fields: l.fields }, l.features);
      function rebuild() {
        const header = unitCode === null ? model.header : { ...model.header, INSUNITS: unitCode };
        r = cadLinework({ ...model, header }, { file, projectUnit });
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
        what.textContent = ls.length ? t('cad.ui.what', { n: ls.length, uses }) : t('cad.ui.what.none');
        go.disabled = !ls.length;
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
        el('h3', { className: 'cv-h3' }, t('cad.ui.what.head')), what]);
      let result = null;
      go.onclick = () => {
        const ls = chosen();
        const ids = addLayers(P(), ls, { label: t('cad.ui.undo', { file }) });
        const msgs = [t('cad.ui.added', { n: ids.length, file })];
        ls.forEach((l, i) => {
          const k = use.get(l.cadLayer + '|' + l.geom) ?? -1;
          if (k < 0 || !ids[i]) return;
          const c = choicesFor(l)[k];
          const field = c.from === 'field' ? (c.fields.includes('ELEV') ? 'ELEV' : c.fields[0]) : null;
          const u = useForSurface(P(), ids[i], { use: c.use, from: c.from, field });
          msgs.push(u.message);
        });
        result = { ids, layers: ids.map((id) => layerOf(P(), id)?.name), notes: r.notes, scale: r.scale };
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
