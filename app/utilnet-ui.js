/* SPDX-License-Identifier: Apache-2.0 */
/**
 * utilnet-ui.js — the Utility networks window (0.10 SU.1810): a run (pipe or cable) per service with material, size, depth and owner; runs made from the
 * selected alignment, feature line or pipe; OpenStreetMap data read from an Overpass JSON file and placed through the project's coordinate system; the
 * OpenStreetMap map under the plan (needs "map layers from the internet" in Settings); crossings between runs and their clear height; trench sections
 * with volumes; CSV; plan items on service layers. Every change is one undo step (state.utilities). The numbers are utilnet.js's
 * (bin/test-civilcraft-utilnet.mjs). 0.11: the Utility run tool draws a run point by point on the plan (ownsTool / finish, as the other drawing tools).
 *
 *   createUtilnet(ctx) → { command(c) → handled, sceneItems(mm), open(), crossingsAlong(line), ownsTool(t), hints, finish(tool, pts) → done }
 *   ctx = { setTool(t), root, el, project, units, say, refocus, download(name, blob), fileStem(), selected() → { kind, id, name, pts } | null, groundAt(x, y), refresh() }
 */
import { t } from './i18n.js';
import { LAYERS } from './scene.js';
import * as N from './utilnet.js';
import { fixed } from './units.js';

for (const [name, key, aci] of N.LAYER_DEFS) if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: 'blue', aci, get label() { return t(key); } });

const TOOL = 'util-run';

export function createUtilnet(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const get = () => P().state.utilities || N.emptyUtilities();
  const edit = (label, fn) => P().change(label, (s) => { s.utilities ||= N.emptyUtilities(); fn(s.utilities, s); if (!s.utilities.runs.length && !s.utilities.nodes.length) delete s.utilities; });
  let dlg = null, svc = 'water';

  function addRuns(runs, nodes = [], osm = false) {
    edit(t('un.undo.add'), (u) => {
      for (const r of runs) u.runs.push({ ...r, id: P().nextId('ur') });
      for (const n of nodes) u.nodes.push({ ...n, id: P().nextId('un') });
      if (osm) u.osm = { attribution: N.ATTRIBUTION, importedAt: new Date().toISOString(), count: (u.osm?.count || 0) + runs.length + nodes.length };
    });
  }
  function fromSelection() {
    const g = ctx.selected();
    if (!g || !g.pts || g.pts.length < 2) { ctx.say(t('un.err.nosel')); return; }
    addRuns([{ service: svc, name: g.name || '', pts: g.pts.map((p) => ({ x: p.x, y: p.y })), material: '', size: N.DEFAULTS.size, depth: N.DEFAULTS.depth[U()], owner: '', source: 'drawn' }]);
    ctx.say(t('un.made', { name: g.name || g.id })); render(); ctx.refresh();
  }
  async function readOsm(file) {
    try {
      const crs = P().state.crs;
      if (!crs) { ctx.say(t('un.err.nocrs')); return; }
      const { frame } = await import('./crs.js'), f = frame(crs);
      const json = JSON.parse(await file.text());
      const r = N.fromOverpass(json, { toProject: (lon, lat) => { const [x, y] = f.fromLonLat(lon, lat); return { x, y }; }, units: U() });
      if (!r.runs.length && !r.nodes.length) { ctx.say(t('un.osm.none', { n: Object.values(r.skipped).reduce((a, b) => a + b, 0) })); return; }
      addRuns(r.runs, r.nodes, true);
      ctx.say(t('un.osm.done', { runs: r.runs.length, nodes: r.nodes.length, skipped: Object.values(r.skipped).reduce((a, b) => a + b, 0) }));
      render(); ctx.refresh();
    } catch (e) { ctx.say(t('un.osm.failed', { file: file.name, why: e.message })); }
  }
  function osmMap() {
    const s = P().state;
    if ((s.gis?.maps || []).some((m) => m.name === 'OpenStreetMap')) { ctx.say(t('un.map.have')); return; }
    P().change(t('un.undo.map'), (st) => { (st.gis.maps ||= []).push({ id: P().nextId('m'), name: 'OpenStreetMap', kind: 'xyz', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', crsCode: 3857, attribution: N.ATTRIBUTION, opacity: 1, visible: true }); });
    ctx.say(t('un.map.added')); ctx.refresh();
  }
  const zAt = (x, y) => { const z = ctx.groundAt(x, y); return Number.isFinite(z) ? z : null; };
  function csv() {
    const u = get(), q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"', rows = [['id', 'service', 'name', 'material', 'size_mm', 'depth_' + U(), 'owner', 'length_' + U(), 'trench_width', 'trench_depth', 'trench_volume', 'source']];
    for (const r of u.runs) { const tr = N.trench(r, U()); rows.push([r.id, r.service, r.name, r.material, r.size, r.depth, r.owner, N.runLength(r), tr.width, tr.depthToInvert, tr.volume, r.source === 'osm' ? 'OpenStreetMap ' + r.osm : 'drawn']); }
    const text = rows.map((r) => r.map(q).join(',')).join('\n') + (u.osm ? '\n' + q(N.ATTRIBUTION) : '') + '\n';
    ctx.download(ctx.fileStem() + '-utilities.csv', new Blob(['﻿' + text], { type: 'text/csv' }));
  }

  function render() {
    if (!dlg) return;
    const u = get(), body = dlg.querySelector('[data-un-body]');
    const field = (r, k, num) => { const i = el('input', { type: num ? 'text' : 'text', className: 'cv-input', value: String(r[k] ?? ''), 'aria-label': t('un.c.' + k, { u: U() }), style: num ? 'width:5rem' : 'width:8rem', onchange: () => {
      const v = num ? Number(i.value) : i.value; if (num && !(v >= 0)) { i.value = String(r[k]); return; }
      edit(t('un.undo.edit'), (x) => { x.runs.find((y) => y.id === r.id)[k] = v; }); render(); ctx.refresh(); } }); return i; };
    const rows = u.runs.map((r) => {
      const s = el('select', { className: 'cv-select', 'aria-label': t('un.c.service'), onchange: () => { edit(t('un.undo.edit'), (x) => { x.runs.find((y) => y.id === r.id).service = s.value; }); render(); ctx.refresh(); } }, ...Object.keys(N.SERVICES).map((k) => el('option', { value: k, selected: k === r.service }, t('un.s.' + k))));
      return el('tr', { 'data-un-row': r.id }, el('td', {}, s), el('td', {}, field(r, 'name')), el('td', {}, field(r, 'material')), el('td', {}, field(r, 'size', true)), el('td', {}, field(r, 'depth', true)), el('td', {}, field(r, 'owner')),
        el('td', { className: 'num' }, fixed(N.runLength(r), 1)),
        el('td', {}, el('button', { type: 'button', className: 'cv-x', 'aria-label': t('un.remove'), 'data-un-remove': r.id, onclick: () => { edit(t('un.undo.remove'), (x) => { x.runs.splice(x.runs.findIndex((y) => y.id === r.id), 1); }); render(); ctx.refresh(); } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))));
    });
    const cr = N.crossings(u.runs, U(), { zAt }), tr = u.runs.map((r) => N.trench(r, U()));
    const vol = tr.reduce((a, x) => a + x.volume, 0), len = tr.reduce((a, x) => a + x.length, 0);
    body.replaceChildren(
      el('p', { className: 'cv-note', 'data-un-sum': '' }, t('un.sum', { runs: u.runs.length, nodes: u.nodes.length, len: fixed(len, 0), u: U(), vol: fixed(vol, 1), vu: U() === 'm' ? 'm³' : 'ft³' })),   // i18n-ignore: unit symbols
      u.runs.length ? el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-un-table': '' }, el('thead', {}, el('tr', {}, ...['service', 'name', 'material', 'size', 'depth', 'owner', 'length', ''].map((h) => el('th', { scope: 'col' }, h ? t('un.c.' + h, { u: U() }) : '')))), el('tbody', {}, ...rows))) : el('p', { className: 'cv-note' }, t('un.none')),
      cr.length ? el('div', { 'data-un-cross': '' }, el('p', {}, el('strong', {}, t('un.cross', { n: cr.length, flagged: cr.filter((c) => c.flag).length }))),
        el('ul', {}, ...cr.slice(0, 40).map((c) => el('li', {}, t('un.cross.row', { a: c.a, b: c.b, clear: c.clear === null ? t('un.cross.noground') : fixed(c.clear, 2) + ' ' + U(), x: fixed(c.x, 1), y: fixed(c.y, 1) }) + (c.flag ? ' — ' + t('un.cross.flag') : ''))))) : '',
      u.osm ? el('p', { className: 'cv-note', 'data-un-attr': '' }, N.ATTRIBUTION + ' — ' + t('un.osm.licence')) : '');
  }
  function open() {
    if (dlg) { dlg.remove(); dlg = null; }
    const id = 'cv-un';
    const sel = el('select', { className: 'cv-select', id: id + '-s', 'data-un-service': '', onchange: () => { svc = sel.value; } }, ...Object.keys(N.SERVICES).map((k) => el('option', { value: k }, t('un.s.' + k))));
    const file = el('input', { type: 'file', accept: '.json,.osm.json', hidden: true, 'data-un-osmfile': '' });
    file.addEventListener('change', () => { if (file.files[0]) readOsm(file.files[0]); file.value = ''; });
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-un-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('un.title')), close),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('un.lede')),
        el('div', { className: 'cv-row' }, el('label', { for: id + '-s' }, t('un.f.service')), sel, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-un-fromsel': '', onclick: fromSelection }, t('un.fromsel')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-un-osm': '', onclick: () => file.click() }, t('un.osm')), el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-un-map': '', onclick: osmMap }, t('un.map'))),
        el('p', { className: 'cv-note' }, t('un.defaults')), el('div', { 'data-un-body': '' })),
      el('div', { className: 'cv-dlg-foot' }, file, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-un-csv': '', onclick: csv }, 'CSV'), el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('iss.close')))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; ctx.refocus(); });
    ctx.root.append(dlg); render(); dlg.showModal();
  }
  return {
    command(c) { if (c === 'utilities') { open(); return true; } if (c === TOOL) { ctx.setTool(ctx.tool() === TOOL ? 'select' : TOOL); return true; } return false; },
    ownsTool: (tl) => tl === TOOL,
    hints: { [TOOL]: 'un.tool.hint' },
    /** The points clicked on the plan become one run of the service chosen in the Utility networks window (water until another is chosen). */
    finish(tool, pts) {
      if (tool !== TOOL) return false;
      if (pts.length < 2) { ctx.say(t('un.tool.need2')); return false; }
      const n = get().runs.filter((r) => r.source === 'drawn').length + 1;
      addRuns([{ service: svc, name: t('un.tool.name', { service: t('un.s.' + svc), n }), pts: pts.map((p) => ({ x: p.x, y: p.y })), material: '', size: N.DEFAULTS.size, depth: N.DEFAULTS.depth[U()], owner: '', source: 'drawn' }]);
      ctx.say(t('un.tool.made', { service: t('un.s.' + svc), len: fixed(N.runLength(get().runs[get().runs.length - 1]), 1), u: U() }));
      render(); ctx.refresh();
      return true;
    },
    service: () => svc, setService: (k) => { if (N.SERVICES[k]) svc = k; },
    sceneItems: (mm) => N.sceneItems(P().state.utilities, { mmPerUnit: mm }),
    crossingsAlong: (line) => N.crossingsAlong(line, get().runs, U(), { zAt }),
    open, refreshWindow: () => render(),
  };
}
