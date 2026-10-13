/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-terrain-ui.js — elevation grids and LiDAR into CivilCraft, surfaces out as GeoTIFF (docs/GIS-SPEC.md §3,
 * builder B). The only terrain module that touches the DOM — through host.el (text nodes only: file contents are
 * untrusted). Installed by gis-ui.js: install(host).
 *
 * Opening (Open, drop, GIS › Import): reg.openers gets one entry, put FIRST (unshift) so it runs before builder C's
 * image opener: .las/.laz/.asc → yes; .tif/.tiff → reads the TIFF's first image and says yes only for one band of
 * 16+ bits or floats (an elevation grid) — RGB(A), palette and 8-bit images return false, so they reach the map layers.
 * accepts() is async for TIFFs (civilcraft.js awaits it); if a caller does not await, open() still hands a picture on
 * to the next opener that takes it.
 *
 * The import dialog: the file's facts (size, cells or points, its system, extent in latitude/longitude, z range,
 * LiDAR classes with counts — read in a first pass with progress), then area (the project's extents + a margin / what
 * the plan shows / the whole file), thin to (spacing in project units, the resulting count live; LiDAR: lowest /
 * nearest the cell center / average), classes (ground ticked when present, else all), z units (the file's when it
 * says; else asked — the dialog shows the range both ways), as survey points (description DEM / LIDAR; the default) or,
 * for a grid, the surface itself (a grid TIN in state.surface.tin). Reading has a progress bar and Cancel.
 * Coordinate systems: file → project through crs.js; a project without a system is offered the file's (same unit
 * family) or asked through reg.pickCrs (null until builder C lands: the dialog then says what to do instead).
 *
 * Export: a "Surface as a GeoTIFF" section — filled into builder A's GIS › Export dialog where it leaves an element with
 * [data-gis-geotiff], and also as its own small dialog (command 'gis-geotiff'; and 'gis-export' when no other part has
 * registered it). GIS › Import, when no other part has registered it, opens the Open picker (all GIS files go through
 * reg.openers from there). window.civilcraft.gis.terrain = { openFiles, exportDialog, dialog, last, lastExport } for tests.
 */

import { openRaster, readWindow, sampleStats, probeTiff, fmtBig } from './raster.js';
import { t } from "./i18n.js";   // 0.4 V9 strings
import { readLasHeader, scanPoints, className } from './las.js';
import { Thinner, gridStep, Coverage } from './thin.js';
import { LIMITS, UNIT_WORDS, projectZUnit, zFactor, toProject, toSource, lonLatOf, boxThrough, gridWindow, nodeXY, gridPoints, gridTin, nextNumber, niceStep } from './terrain.js';
import { crsProblem, frame, byCode, METRES_PER } from './crs.js';
import { averageEdge, surfaceGrid, writeDemTiff, NODATA } from './geotiff-write.js';
import { fixed } from './units.js';

const GRID_EXT = /\.(tiff?|asc)$/i, LIDAR_EXT = /\.(las|laz)$/i;
const isAbort = (e) => e?.name === 'AbortError';
// i18n-ignore: English unit words for the GeoTIFF description (file content, not the page's language)
const FILE_UNIT_WORDS = { m: 'meters', ft: 'feet', ftUS: 'US survey feet' };

export async function install(host) {
  const { reg, el } = host;
  const num = (n) => Number(n).toLocaleString('en-US');
  const pUnits = () => host.project.state.units;
  const uWord = () => (pUnits() === 'm' ? 'm' : 'ft');
  const api = { last: null };

  // ------------------------------------------------------------------ opener
  const tiffKind = new WeakMap();
  async function isElevationTiff(f) {
    if (!tiffKind.has(f)) tiffKind.set(f, probeTiff(f).then((p) => !p.image, () => true));   // unreadable: ours, to explain why
    return tiffKind.get(f);
  }
  const opener = {
    accepts(files) {
      if (files.some((f) => LIDAR_EXT.test(f.name) || /\.asc$/i.test(f.name))) return true;
      const tif = files.find((f) => /\.tiff?$/i.test(f.name));
      if (!tif || files.some((f) => /\.(tfw|tifw|wld)$/i.test(f.name))) return false;   // a world file: a picture for map layers
      return isElevationTiff(tif);
    },
    async open(files, heads) {
      const tif = files.find((f) => /\.tiff?$/i.test(f.name));
      if (tif && !files.some((f) => LIDAR_EXT.test(f.name) || /\.asc$/i.test(f.name)) && !(await isElevationTiff(tif))) {
        const i = reg.openers.indexOf(opener);
        for (const o of reg.openers.slice(i + 1)) { if (await o.accepts(files, heads || [])) return o.open(files, heads); }
        host.say(t('tui.picture', { name: tif.name }));
        return;
      }
      return openFiles(files);
    },
  };
  reg.openers.unshift(opener);

  // ------------------------------------------------------------------ dialogs
  function dialog(title, body, foot) {
    const id = 'cv-terrain-h-' + Math.random().toString(36).slice(2, 8);
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('cad.ui.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const dlg = el('dialog', { className: 'cv-dialog cv-terrain', 'aria-labelledby': id },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, title), close),
        el('div', { className: 'cv-dlg-body' }, body),
        el('div', { className: 'cv-dlg-foot' }, foot)));
    return { dlg, close };
  }
  const row = (label, value, forId) => [forId ? el('label', { for: forId }, label) : el('span', { className: 'k' }, label), value];
  const v = (t) => el('span', { className: 'v' }, t);

  function progressBox() {
    const bar = el('progress', { className: 'cv-progress', max: '1', value: '0' });
    const text = el('span', { className: 'cv-note' }, '');
    const box = el('div', { className: 'cv-progress-box', hidden: true }, bar, text);
    return { box, set(f, t) { box.hidden = false; bar.value = Math.max(0, Math.min(1, f)); if (t != null) text.textContent = t; }, hide() { box.hidden = true; } };
  }

  const fmtLat = (lat) => Math.abs(lat).toFixed(5) + '° ' + (lat >= 0 ? 'N' : 'S');
  const fmtLon = (lon) => Math.abs(lon).toFixed(5) + '° ' + (lon >= 0 ? 'E' : 'W');
  const crsText = (c) => (c ? c.name + (c.code ? ' (EPSG:' + c.code + ')' : '') : t('tui.crs.not_stated'));
  // two systems on different datums: say how well the shift between them is known (EPSG's accuracy, from the list)
  function shiftWarning(a, b) {
    const datum = (c) => (c?.name || '').split(' / ')[0];
    if (!a || !b || datum(a) === datum(b)) return null;
    const acc = (c) => (/^WGS 84$/.test(datum(c)) ? 0 : c?.code ? byCode(c.code)?.shiftAccuracy : undefined);
    const worst = [acc(a), acc(b)];
    if (worst.some((x) => x === null)) return t('tui.shift.unknown', { a: datum(a), b: datum(b) });
    const m = Math.max(...worst.filter((x) => Number.isFinite(x)), 0);
    return m > 1 ? (m <= 4 ? t('tui.shift.few', { a: datum(a), b: datum(b) }) : t('tui.shift.about', { a: datum(a), b: datum(b), m })) : null;
  }

  // ------------------------------------------------------------------ import
  async function openFiles(files) {
    const lidar = files.find((f) => LIDAR_EXT.test(f.name));
    const grid = files.find((f) => GRID_EXT.test(f.name));
    const ctl = new AbortController();
    let src, kind;
    host.busy(t('tui.reading', { name: (lidar || grid).name }));
    try {
      if (lidar) { kind = 'lidar'; src = await readLasHeader(lidar); src.file = lidar; }
      else { kind = 'grid'; src = await openRaster(files); }
    } catch (e) {
      host.busy(null);
      host.say(t('tui.read_failed', { name: (lidar || grid).name, error: e.message }));
      return;
    }
    host.busy(null);
    return importDialog(kind, src, ctl);
  }

  function importDialog(kind, src, ctl) {
    const project = host.project;
    const st = {
      srcCrs: src.crs, srcChosen: !!src.crs, adopt: !project.state.crs && !!src.crs && !crsProblem(src.crs, project.state.units), newCrs: null,
      area: 'all', margin: pUnits() === 'm' ? 30 : 100, spacing: null, mode: 'nearest',
      classes: null, zUnit: src.zUnit || null, as: 'points', job: null, coverage: null, scanned: false,
    };
    const pc = project.state.crs;
    const ext = host.extentsAll();
    if (ext) st.area = 'extents';
    const fid = (k) => 'cv-ter-' + k;

    // --- controls
    const facts = el('div', { className: 'cv-props' });
    const crsBox = el('div', { className: 'cv-terrain-crs' });
    const areaSel = el('select', { className: 'cv-select', id: fid('area') },
      el('option', { value: 'extents', disabled: !ext }, t('tui.area.extents')),
      el('option', { value: 'view', disabled: !ext }, t('tui.area.view')),
      el('option', { value: 'all' }, t('tui.area.all')));
    areaSel.value = st.area;
    const marginIn = el('input', { className: 'cv-input', id: fid('margin'), type: 'number', min: '0', step: 'any', value: String(st.margin), inputMode: 'decimal' });
    const spacingIn = el('input', { className: 'cv-input', id: fid('spacing'), type: 'number', min: '0', step: 'any', inputMode: 'decimal' });
    const modeSel = el('select', { className: 'cv-select', id: fid('mode') },
      el('option', { value: 'nearest' }, t('tui.keep.nearest')),
      el('option', { value: 'lowest' }, t('tui.keep.lowest')),
      el('option', { value: 'average' }, t('tui.keep.average')));
    const zSel = el('select', { className: 'cv-select', id: fid('z') },
      el('option', { value: '', className: 'select-placeholder' }, t('tui.choose')),
      el('option', { value: 'm' }, t('cad.ui.unit.m')), el('option', { value: 'ft' }, t('cad.ui.unit.ft')), el('option', { value: 'ftUS' }, t('cad.ui.unit.ft-us')));
    zSel.value = st.zUnit || '';
    const asPts = el('input', { type: 'radio', name: fid('as'), value: 'points', checked: true });
    const asTin = el('input', { type: 'radio', name: fid('as'), value: 'surface' });
    const classBox = el('div', { className: 'cv-terrain-classes' });
    const count = el('p', { className: 'cv-note', role: 'status', 'aria-live': 'polite' });
    const zInfo = el('p', { className: 'cv-note' });
    const prog = progressBox();
    const okBtn = el('button', { type: 'button', className: 'btn-plot btn-sm-cc' }, t('tui.import'));
    const cancelBtn = el('button', { type: 'button', className: 'btn-line btn-sm-cc' }, t('cad.ui.cancel'));

    const settings = el('div', { className: 'cv-props' },
      ...row(t('tui.l.area'), areaSel, fid('area')),
      ...row(t('tui.l.margin', { unit: uWord() }), marginIn, fid('margin')),
      ...row(t('tui.l.thin', { unit: uWord() }), spacingIn, fid('spacing')),
      ...(kind === 'lidar' ? row(t('tui.l.keep'), modeSel, fid('mode')) : []),
      ...row(t('tui.l.zfile'), zSel, fid('z')),
      ...(kind === 'grid' ? [el('span', { className: 'k' }, t('tui.l.as')), el('span', { className: 'v cv-terrain-as' },
        el('label', { className: 'cv-check' }, asPts, t('tui.as.points')),
        el('label', { className: 'cv-check' }, asTin, t('tui.as.surface')))] : []));
    const body = [facts, crsBox, kind === 'lidar' ? classBox : null, settings, zInfo, count, prog.box];
    const { dlg, close } = dialog(kind === 'lidar' ? t('tui.title.lidar') : t('tui.title.grid'), body, [cancelBtn, okBtn]);

    // --- facts
    const ll = lonLatOf(src.crs);
    let fileBox;   // file's own box (its coordinates)
    if (kind === 'grid') {
      const xs = [], ys = [];
      for (const [c, r] of [[0, 0], [src.width, 0], [src.width, src.height], [0, src.height]]) { const g = src.gt; xs.push(g[0] + c * g[1] + r * g[2]); ys.push(g[3] + c * g[4] + r * g[5]); }
      fileBox = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
    } else fileBox = { minX: src.min[0], minY: src.min[1], maxX: src.max[0], maxY: src.max[1] };
    const boxOk = [fileBox.minX, fileBox.minY, fileBox.maxX, fileBox.maxY].every(Number.isFinite) && fileBox.maxX >= fileBox.minX && fileBox.maxY >= fileBox.minY;
    let llText = '—';
    if (ll && boxOk) {
      try {
        const a = ll(fileBox.minX, fileBox.minY), b = ll(fileBox.maxX, fileBox.maxY);
        if ([...a, ...b].every(Number.isFinite)) llText = t('tui.ll.range', { lat1: fmtLat(a[1]), lon1: fmtLon(a[0]), lat2: fmtLat(b[1]), lon2: fmtLon(b[0]) });
      } catch { /* unknown */ }
    }
    let zRange = null;
    function renderFacts() {
      const rows = [[t('tui.f.file'), src.name], [t('tui.f.size'), src.size < 1048576 ? t('tui.size.kb', { n: Math.max(1, Math.round(src.size / 1024)) }) : t('tui.size.mb', { n: (src.size / 1048576).toFixed(1) })]];
      if (kind === 'grid') {
        rows.push([t('tui.f.kind'), src.kind === 'asc' ? t('tui.kind.asc') : t('tui.kind.tiff', { dtype: src.dtype })]);
        rows.push([t('tui.f.cells'), t('tui.cells', { w: num(src.width), h: num(src.height), total: fmtBig(src.width * src.height) })]);
        if (src.cell) rows.push([t('tui.f.cell'), fixed(src.cell, src.cell < 0.01 ? 8 : 3) + (src.crs?.unit === 'deg' ? '°' : src.crs ? ' ' + (UNIT_WORDS[src.crs.unit] || '') : '')]);
        if (src.nodata != null) rows.push([t('tui.f.nodata'), String(src.nodata)]);
        if (src.pixelIsPoint) rows.push([t('tui.f.cells_are'), t('tui.cells_are.points')]);
      } else {
        rows.push([t('tui.f.kind'), t('tui.kind.las', { format: src.compressed ? 'LAZ' : 'LAS', version: src.version, pf: src.format })]);
        rows.push([t('tui.f.points'), src.available < src.count ? t('tui.points.short', { count: num(src.count), available: num(src.available) }) : num(src.count)]);
      }
      rows.push([t('tui.crs.head'), crsText(src.crs)]);
      rows.push([t('tui.f.extent'), llText]);
      rows.push([t('tui.f.z'), zRange ? t(zRange.sampled ? 'tui.z.range_sample' : 'tui.z.range', { min: fixed(zRange.min, 2), max: fixed(zRange.max, 2) }) : '—']);
      facts.replaceChildren(...rows.flatMap(([k, t]) => [el('span', { className: 'k' }, k), v(t)]));
      const notes = [...(src.notes || []), ...(src.crsNote && !src.crs ? [src.crsNote] : [])];
      if (notes.length) facts.append(el('ul', { className: 'span cv-note' }, ...notes.map((n) => el('li', {}, n))));
    }
    if (kind === 'lidar') zRange = Number.isFinite(src.min[2]) && Number.isFinite(src.max[2]) && src.max[2] >= src.min[2] ? { min: src.min[2], max: src.max[2] } : null;
    renderFacts();

    // --- coordinate systems
    const effCrs = () => pc || (st.adopt ? st.srcCrs : st.newCrs) || null;
    const near = () => { if (!ll || !boxOk) return null; try { const p = ll((fileBox.minX + fileBox.maxX) / 2, (fileBox.minY + fileBox.maxY) / 2); return p.every(Number.isFinite) ? p : null; } catch { return null; } };
    let crsBlock = null;   // why Import can't run, or null
    async function pick(reason) {
      if (!reg.pickCrs) return null;
      try { return await reg.pickCrs({ reason, near: near() }); } catch { return null; }
    }
    function renderCrs() {
      const out = [];
      crsBlock = null;
      const s = st.srcCrs;
      if (!s && !st.srcChosen) {
        if (pc) out.push(el('p', { className: 'cv-note' }, t('tui.crs.file_none', { crs: crsText(pc) })));
        else out.push(el('p', { className: 'cv-note' }, t('tui.crs.none_both')));
        if (reg.pickCrs) out.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: async () => { const c = await pick(t('tui.crs.pick_file_q', { name: src.name })); if (c) { st.srcCrs = c; st.srcChosen = true; refresh(); } } }, t('tui.crs.pick_file')));
      } else if (pc) {
        const same = toProject(s, pc).identity;
        out.push(el('p', { className: 'cv-note' }, same ? t('tui.crs.same', { crs: crsText(pc) }) : t(pc.local ? 'tui.crs.convert_local' : 'tui.crs.convert', { from: crsText(s), to: crsText(pc) })));
        if (!same) { const w = shiftWarning(s, pc); if (w) out.push(el('p', { className: 'cv-note' }, w)); }
      } else {
        const prob = crsProblem(s, pUnits());
        if (!prob) {
          const cb = el('input', { type: 'checkbox', checked: st.adopt });
          cb.onchange = () => { st.adopt = cb.checked; refresh(); };
          out.push(el('label', { className: 'cv-check' }, cb, t('tui.crs.use', { crs: crsText(s) })));
          if (!st.adopt) out.push(el('p', { className: 'cv-note' }, t('tui.crs.not_ticked')));
        } else if (st.newCrs) {
          out.push(el('p', { className: 'cv-note' }, t('tui.crs.convert_new', { from: crsText(s), to: crsText(st.newCrs) })));
          const w = shiftWarning(s, st.newCrs); if (w) out.push(el('p', { className: 'cv-note' }, w));
        } else {
          crsBlock = s.unit === 'deg' ? (pUnits() === 'm' ? t('tui.crs.deg.m') : t('tui.crs.deg.ft')) : prob;
          out.push(el('p', { className: 'cv-note' }, crsBlock));
          if (reg.pickCrs) out.push(el('button', { type: 'button', className: 'cv-linkbtn', onclick: async () => { const c = await pick(t('tui.crs.pick_proj_q', { name: src.name, crs: s.name })); if (c && !crsProblem(c, pUnits())) { st.newCrs = c; refresh(); } else if (c) host.say(crsProblem(c, pUnits())); } }, t('tui.crs.pick_proj')));
          else out.push(el('p', { className: 'cv-note' }, t('tui.crs.set_first')));
        }
      }
      crsBox.replaceChildren(el('h3', { className: 'cv-h cv-terrain-h' }, t('tui.crs.head')), ...out);
    }
    // a project-unit transform for the import
    const xf = () => toProject(st.srcCrs, effCrs());
    // project units per file unit near the file's middle (for spacings)
    function unitScale() {
      const f = xf().fn, c = boxOk ? [(fileBox.minX + fileBox.maxX) / 2, (fileBox.minY + fileBox.maxY) / 2] : [0, 0];
      const d = kind === 'grid' ? Math.hypot(src.gt[1], src.gt[4]) : Math.max(1e-6, (fileBox.maxX - fileBox.minX) / 1000) || 1;
      try {
        const a = f(c[0], c[1]), b = f(c[0] + d, c[1]);
        const k = Math.hypot(b[0] - a[0], b[1] - a[1]) / d;
        if (Number.isFinite(k) && k > 0) return k;
      } catch { /* fall through */ }
      return 1;
    }
    // the area in project coordinates (null = the whole file) and in the file's coordinates
    function areaBoxes() {
      if (st.area === 'all') return { pBox: null, sBox: null };
      let b = st.area === 'view' ? host.view.viewBounds() : host.extentsAll();
      if (!b) return { pBox: null, sBox: null };
      if (st.area === 'extents') { const m = Math.max(0, Number(st.margin) || 0); b = { minX: b.minX - m, minY: b.minY - m, maxX: b.maxX + m, maxY: b.maxY + m }; }
      let sBox = null;
      try { sBox = boxThrough(b, toSource(st.srcCrs, effCrs())); } catch { sBox = null; }
      return { pBox: b, sBox };
    }

    // --- LiDAR classes (first pass: counts + coverage)
    async function scanClasses() {
      const cov = boxOk ? new Coverage(fileBox, 128) : null;
      const counts = new Map();
      prog.set(0, t('tui.classes.reading'));
      okBtn.disabled = true;
      st.job = new AbortController();
      try {
        await scanPoints(src.file, src, (x, y, z, c) => { if (cov) cov.add(x, y, c); else counts.set(c, (counts.get(c) || 0) + 1); }, { signal: st.job.signal, progress: (f) => prog.set(f, t('tui.classes.reading_pct', { pct: Math.round(f * 100) })) });
      } catch (e) {
        st.job = null;
        if (isAbort(e)) { dlg.close(); return; }
        prog.set(1, t('tui.points.read_failed', { error: e.message }));
        return;
      }
      st.job = null;
      prog.hide();
      st.coverage = cov;
      st.classCounts = cov ? cov.counts : counts;
      st.scanned = true;
      const has = [...st.classCounts.keys()].sort((a, b) => a - b);
      st.classes = new Set(st.classCounts.has(2) ? [2] : has);
      renderClasses();
      refresh();
    }
    function renderClasses() {
      if (!st.classCounts) { classBox.replaceChildren(); return; }
      const has = [...st.classCounts.keys()].sort((a, b) => a - b);
      const rows = has.map((c) => {
        const cb = el('input', { type: 'checkbox', checked: st.classes.has(c), 'aria-label': t('tui.class.aria', { c }) });
        cb.onchange = () => { if (cb.checked) st.classes.add(c); else st.classes.delete(c); refresh(); };
        return el('tr', {}, el('td', {}, cb), el('td', { className: 'num' }, String(c)), el('td', {}, className(c) || (c <= 63 ? t('tui.class.reserved') : t('tui.class.user'))), el('td', { className: 'num' }, num(st.classCounts.get(c))));
      });
      classBox.replaceChildren(el('h3', { className: 'cv-h cv-terrain-h' }, t('tui.classes.head')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' }, el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', { className: 'num' }, t('tui.th.class')), el('th', {}, t('tui.th.name')), el('th', { className: 'num' }, t('tui.f.points')))), el('tbody', {}, ...rows))),
        el('p', { className: 'cv-note' }, st.classCounts.has(2) ? t('tui.classes.ground') : t('tui.classes.no_ground')));
    }

    // --- live count and checks
    let plan = null;
    function compute() {
      const out = { ok: false, msg: '', count: 0 };
      if (crsBlock) { out.msg = crsBlock; return out; }
      if (!st.zUnit) { out.msg = t('tui.z.say'); return out; }
      const k = unitScale();   // project units per file unit
      const { pBox, sBox } = areaBoxes();
      const sp = Number(st.spacing);
      if (!(sp > 0)) { out.msg = t('tui.spacing.bad'); return out; }
      const cap = kind === 'grid' && st.as === 'surface' ? LIMITS.tinNodes : LIMITS.points;
      if (kind === 'grid') {
        const win = sBox ? gridWindow(src, sBox) : { c0: 0, r0: 0, c1: src.width, r1: src.height };
        if (!win) { out.msg = t('raster.no_overlap'); return out; }
        const cells = (win.c1 - win.c0) * (win.r1 - win.r0);
        if (cells > LIMITS.readCells) { out.msg = t('tui.area.big', { cells: fmtBig(cells), w: num(win.c1 - win.c0), h: num(win.r1 - win.r0), max: fmtBig(LIMITS.readCells) }); return out; }
        const cellP = Math.hypot(src.gt[1], src.gt[4]) * k;
        const step = gridStep(sp, cellP);
        const n = Math.ceil((win.c1 - win.c0) / step) * Math.ceil((win.r1 - win.r0) / step);
        Object.assign(out, { win, step, count: n, cellP, pBox, sBox, cap });
        out.text = t(st.as === 'surface' ? 'tui.plan.tin' : 'tui.plan.pts', { n: step, count: num(n), tri: num(2 * Math.max(0, Math.ceil((win.c1 - win.c0) / step) - 1) * Math.max(0, Math.ceil((win.r1 - win.r0) / step) - 1)), w: num(win.c1 - win.c0), h: num(win.r1 - win.r0), d: fixed(cellP * step, 2), unit: uWord() });
        if (n > cap) { out.msg = out.text + ' ' + t('tui.over.grid', { cap: num(cap), d: fixed(niceStep(cellP * Math.ceil(Math.sqrt(n * step * step / cap))), 2), unit: uWord() }); return out; }
      } else {
        if (!st.scanned) { out.msg = t('tui.classes.reading_short'); return out; }
        if (!st.classes.size) { out.msg = t('tui.classes.tick'); return out; }
        let est;
        if (st.coverage) est = st.coverage.estimate({ spacing: sp / k, classes: st.classes, box: sBox });
        else { let n = 0; for (const c of st.classes) n += st.classCounts.get(c) || 0; est = { points: n, inArea: n }; }
        Object.assign(out, { count: est.points, pBox, sBox, cap, scale: k });
        out.text = t('tui.plan.lidar', { count: num(est.points), sp: fixed(sp, 2), unit: uWord(), inside: num(est.inArea) });
        if (est.points > cap) { out.msg = out.text + ' ' + t('tui.over.lidar', { cap: num(cap) }); return out; }
      }
      out.ok = true;
      return out;
    }
    function defaultSpacing() {
      const k = unitScale();
      if (kind === 'grid') {
        const cellP = Math.hypot(src.gt[1], src.gt[4]) * k;
        const { sBox } = areaBoxes();
        const win = sBox ? gridWindow(src, sBox) : { c0: 0, r0: 0, c1: src.width, r1: src.height };
        const n = win ? (win.c1 - win.c0) * (win.r1 - win.r0) : src.width * src.height;
        const cap = st.as === 'surface' ? LIMITS.tinNodes : LIMITS.points;
        const step = Math.max(1, Math.ceil(Math.sqrt(n / (cap * 0.98))));
        return +(cellP * step).toPrecision(6);
      }
      const area = (fileBox.maxX - fileBox.minX) * (fileBox.maxY - fileBox.minY) * k * k;
      const n = Math.max(1, src.count);
      const natural = Math.sqrt(area / n);
      return +niceStep(Math.max(natural * 1.5, Math.sqrt(area / LIMITS.points) * 1.1)).toPrecision(6);
    }
    function showZ() {
      if (!zRange) { zInfo.textContent = ''; return; }
      const to = projectZUnit(host.project);
      const parts = ['m', 'ft'].map((u) => { const f = zFactor(u, to); return t('tui.z.as', { word: UNIT_WORDS[u], min: fixed(zRange.min * f, 2), max: fixed(zRange.max * f, 2), unit: uWord() }); });
      zInfo.textContent = t('tui.z.info', { min: fixed(zRange.min, 2), max: fixed(zRange.max, 2), parts: parts.join('; ') }) + ' ' + (src.zUnit ? (src.zUnitFrom ? t('tui.z.says_from', { word: UNIT_WORDS[src.zUnit], from: src.zUnitFrom }) : t('tui.z.says', { word: UNIT_WORDS[src.zUnit] })) : t('tui.z.unsaid'));
    }
    function refresh() {
      renderCrs();
      marginIn.disabled = st.area !== 'extents';
      plan = compute();
      count.textContent = plan.ok ? plan.text : plan.msg;
      count.classList.toggle('is-error', !plan.ok);
      okBtn.disabled = !plan.ok || !!st.job;
      showZ();
    }

    // --- events
    areaSel.onchange = () => { st.area = areaSel.value; if (!spacingTouched) { st.spacing = defaultSpacing(); spacingIn.value = String(st.spacing); } refresh(); };
    marginIn.oninput = () => { st.margin = Number(marginIn.value); refresh(); };
    let spacingTouched = false;
    spacingIn.oninput = () => { spacingTouched = true; st.spacing = Number(spacingIn.value); refresh(); };
    modeSel.onchange = () => { st.mode = modeSel.value; };
    zSel.onchange = () => { st.zUnit = zSel.value || null; refresh(); };
    for (const r of [asPts, asTin]) r.onchange = () => { st.as = asTin.checked ? 'surface' : 'points'; if (!spacingTouched) { st.spacing = defaultSpacing(); spacingIn.value = String(st.spacing); } refresh(); };
    const stop = () => { if (st.job) st.job.abort(); else dlg.close(); };
    cancelBtn.onclick = stop; close.onclick = stop;
    dlg.addEventListener('cancel', (e) => { if (st.job) { e.preventDefault(); st.job.abort(); } });
    dlg.addEventListener('close', () => { if (st.job) st.job.abort(); dlg.remove(); host.refocus(); });
    okBtn.onclick = () => run();

    async function run() {
      plan = compute();
      if (!plan.ok) return;
      st.job = new AbortController();
      okBtn.disabled = true;
      for (const c of [areaSel, marginIn, spacingIn, modeSel, zSel, asPts, asTin]) c.disabled = true;
      const signal = st.job.signal;
      const t0 = performance.now();
      const proj = host.project, epc = effCrs(), tr = xf(), zf = zFactor(st.zUnit, projectZUnit({ state: { ...proj.state, crs: epc } }));
      const notes = [];
      try {
        if (kind === 'grid') {
          prog.set(0, t('tui.grid.reading'));
          const grid = await readWindow(src, { ...plan.win, step: plan.step, signal, progress: (f) => prog.set(f * 0.9, t('tui.grid.reading_pct', { pct: Math.round(f * 100) })) });
          prog.set(0.92, t('tui.building'));
          await new Promise((r) => setTimeout(r, 0));
          if (st.as === 'surface') {
            const tin = gridTin(grid, src, { fn: tr.fn, zf });
            if (!tin.faces.length) throw new Error(t('tui.err.no_corners'));
            const replaced = await applySurface(tin, epc);
            notes.push(t('tui.done.surface', { name: src.name, pts: num(tin.pts.length), faces: num(tin.faces.length), skipped: num(tin.skipped) }));
            if (replaced) notes.push(t('grid.replaced'));   // 0.4 V9: undoable now
          } else {
            const pts = gridPoints(grid, src, { fn: tr.fn, zf, desc: 'DEM', start: nextNumber(proj.points) });
            if (!pts.length) throw new Error(t('tui.err.no_cell'));
            applyPoints(pts, epc, t('tui.undo.import', { name: src.name }));
            notes.push(t('tui.done.dem', { n: plan.step, count: num(pts.length), name: src.name, d: fixed(plan.cellP * plan.step, 2), unit: uWord() }));
          }
        } else {
          const { pBox, sBox } = plan;
          const origin = pBox ? [pBox.minX, pBox.minY] : (() => { const b = boxThrough(fileBox, tr.fn); return b ? [b.minX, b.minY] : [0, 0]; })();
          const th = new Thinner({ cell: Number(st.spacing), mode: st.mode, origin, classes: st.classes, region: pBox, max: LIMITS.points });
          const f = tr.fn, id = tr.identity;
          prog.set(0, t('tui.points.reading'));
          await scanPoints(src.file, src, (x, y, z, c) => {
            if (sBox && (x < sBox.minX || x > sBox.maxX || y < sBox.minY || y > sBox.maxY)) { th.seen++; th.outside++; return; }
            if (!st.classes.has(c)) { th.seen++; th.filtered++; return; }
            if (id) th.add(x, y, z * zf, c);
            else { const q = f(x, y); th.add(q[0], q[1], z * zf, c); }
          }, { signal, progress: (fr) => prog.set(fr * 0.95, t('tui.points.reading_pct', { pct: Math.round(fr * 100), kept: num(th.count) })) });
          if (!th.count) throw new Error(t('tui.err.no_point'));
          let n = nextNumber(proj.points);
          const pts = th.points().map((p) => ({ n: String(n++), x: p.x, y: p.y, z: p.z, d: 'LIDAR' }));
          applyPoints(pts, epc, t('tui.undo.import', { name: src.name }));
          const keep = { nearest: t('tui.keep.nearest.in'), lowest: t('tui.keep.lowest.in'), average: t('tui.keep.average.in') }[st.mode] || modeSel.selectedOptions[0].textContent.toLowerCase();
          notes.push(t('tui.done.lidar', { count: num(pts.length), name: src.name, sp: fixed(Number(st.spacing), 2), unit: uWord(), keep, seen: num(th.seen), filtered: num(th.filtered), outside: num(th.outside) }));
          if (th.capped) notes.push(t('tui.capped', { max: num(LIMITS.points), dropped: num(th.dropped) }));
          if (src.notes.length) notes.push(...src.notes);
        }
      } catch (e) {
        st.job = null;
        for (const c of [areaSel, marginIn, spacingIn, modeSel, zSel, asPts, asTin]) c.disabled = false;
        if (isAbort(e)) { prog.set(0, t('tui.cancelled.import')); host.say(t('tui.cancelled.say')); refresh(); return; }
        prog.set(1, t('tui.import_failed', { error: e.message }));
        refresh();
        return;
      }
      st.job = null;
      if (!tr.identity) notes.push(t('tui.done.converted', { from: crsText(st.srcCrs), to: crsText(epc) }));
      if (zf !== 1) notes.push(t('tui.done.zconv', { word: UNIT_WORDS[st.zUnit], f: zf.toPrecision(8) }));
      api.last = { kind, notes, ms: Math.round(performance.now() - t0) };
      dlg.close();
      host.report(notes);
      host.say(notes[0]);
    }

    function setCrs(proj, epc, s) {
      if (!proj.state.crs && epc) { s.crs = { ...epc, local: epc.local ? { ...epc.local } : null }; return true; }
      return false;
    }
    function applyPoints(pts, epc, label) {
      const proj = host.project, before = proj.state.crs;
      const wasEmpty = !proj.points.length && !proj.state.surface.tin && !proj.state.alignments.length;
      let changed = false;
      proj.editPoints(label, (old, s) => { changed = setCrs(proj, epc, s); return old.concat(pts); });
      if (changed) for (const f of reg.crsChange) { try { f(before, proj.state.crs); } catch { /* a part's problem stays its own */ } }
      host.refresh();
      if (wasEmpty) host.fitAll();
    }
    async function applySurface(tin, epc) {
      const proj = host.project;
      const hasSurface = proj.points.length || proj.state.surface.tin;
      if (hasSurface) {
        const c = await host.ask({ title: t('tui.replace.title'), text: t('grid.replace.ask', { name: src.name }), buttons: [['cancel', t('cad.ui.cancel'), 'btn-line'], ['replace', t('tui.replace.btn'), 'btn-plot']] });
        if (c !== 'replace') throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
      }
      const before = proj.state.crs;
      let changed = false;
      // 0.4 V9: one undo step — the grid surface, the system it brings (when the project had none) and the name
      proj.setTin(t('grid.undo', { name: src.name }), { pts: tin.pts, faces: tin.faces, from: 'grid' }, (s) => {
        if (!s.crs && epc) changed = setCrs(proj, epc, s) !== false;
        if (!hasSurface && s.name === t('project.untitled')) s.name = src.name.replace(/\.[^.]+$/, '').slice(0, 120);
      });
      if (changed) for (const f of reg.crsChange) { try { f(before, proj.state.crs); } catch { /* ignore */ } }
      host.refresh();
      host.fitAll();
      return !!hasSurface;
    }

    // --- open
    root().append(dlg);
    dlg.showModal();
    st.spacing = defaultSpacing();
    spacingIn.value = String(st.spacing);
    refresh();
    (kind === 'grid' ? areaSel : cancelBtn).focus();
    if (kind === 'grid') {
      sampleStats(src).then((s) => { if (s && s.min != null) { zRange = s; renderFacts(); showZ(); } }).catch(() => {});
    } else scanClasses();
    api.dialog = { dlg, st, refresh: () => refresh(), get plan() { return plan; } };
    return dlg;
  }
  const root = () => host.root || document.body;

  // ------------------------------------------------------------------ export (GeoTIFF)
  function geotiffSection({ onDone } = {}) {
    const proj = host.project;
    const eg = proj.eg().surface, fg = proj.graded().surface;
    const box = el('div', { className: 'cv-terrain-export' });
    if (!eg) { box.append(el('p', { className: 'cv-note' }, t('tui.gt.none'))); return { box, ready: false }; }
    const sid = 'cv-gt-' + Math.random().toString(36).slice(2, 7);
    const which = el('select', { className: 'cv-select', id: sid + '-s' }, el('option', { value: 'eg' }, t('surface.eg')), fg ? el('option', { value: 'fg' }, t('surface.fg')) : null);
    const surf = () => (which.value === 'fg' && fg ? fg : eg);
    const cellDefault = () => { const a = averageEdge(surf()); return a > 0 ? +niceStep(a / 2.5).toPrecision(6) : 1; };
    const cellIn = el('input', { className: 'cv-input', id: sid + '-c', type: 'number', min: '0', step: 'any', inputMode: 'decimal', value: String(cellDefault()) });
    const info = el('p', { className: 'cv-note', role: 'status', 'aria-live': 'polite' });
    const crs = proj.state.crs, zU = projectZUnit(proj);
    const crsNote = el('p', { className: 'cv-note' },
      !crs ? t('tui.gt.nocrs')
        : !crs.code ? t('tui.gt.nocode', { name: crs.name })
          : t(crs.local ? 'tui.gt.crs_local' : 'tui.gt.crs', { name: crs.name, code: crs.code }),
      ' ' + t('tui.gt.z', { word: UNIT_WORDS[zU] }));
    const prog = progressBox();
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc' }, t('tui.gt.download'));
    let job = null;
    const upd = () => {
      const c = Number(cellIn.value), s = surf();
      if (!(c > 0)) { info.textContent = t('tui.gt.cell_bad'); go.disabled = true; return; }
      const b = s.bounds, f = crs ? frame(crs) : null;
      let w = b.maxX - b.minX, h = b.maxY - b.minY;
      if (f && crs.local) w = w * crs.local.scale, h = h * crs.local.scale;
      const nx = Math.ceil(w / c) + 1, ny = Math.ceil(h / c) + 1;
      info.textContent = t('tui.gt.info', { nx: num(nx), ny: num(ny), c: fixed(c, 3), unit: uWord(), total: fmtBig(nx * ny), mb: Math.max(0.1, nx * ny * 4 / 1048576 / 2).toFixed(1) });
      go.disabled = nx * ny > 25e6 || !!job;
      if (nx * ny > 25e6) info.textContent += ' ' + t('tui.gt.over');
    };
    which.onchange = () => { cellIn.value = String(cellDefault()); upd(); };
    cellIn.oninput = upd;
    go.onclick = async () => {
      job = new AbortController();
      go.disabled = true;
      const f = crs ? frame(crs) : null;
      try {
        prog.set(0, t('tui.gt.sampling'));
        const g = await surfaceGrid(surf(), { cell: Number(cellIn.value), toGrid: f ? f.toGrid : undefined, fromGrid: f ? f.fromGrid : undefined, signal: job.signal, progress: (x) => prog.set(x * 0.8, t('tui.gt.sampling_pct', { pct: Math.round(x * 100) })) });
        prog.set(0.85, t('tui.gt.writing'));
        const bytes = await writeDemTiff({ ...g, epsg: crs?.code || null, citation: crs?.name || '', xyUnit: crs?.unit || (pUnits() === 'm' ? 'm' : 'ftUS'), zUnit: zU,
          // i18n-ignore: the description is written into the GeoTIFF (ImageDescription, GDAL metadata): file content
          description: (which.value === 'fg' ? 'Graded surface' : 'Existing ground') + ' elevations in ' + FILE_UNIT_WORDS[zU] + ' (project units). ' + (crs ? (crs.local ? 'Grid coordinates of ' : 'Coordinates in ') + crs.name + '.' : 'Project coordinates (no coordinate system).') + ' Cells outside the surface are nodata. Made by CivilCraft.', signal: job.signal });
        const name = host.fileStem() + '-' + (which.value === 'fg' ? 'graded' : 'eg') + '.tif';
        host.download(bytes, name, 'image/tiff');
        prog.set(1, t('tui.gt.downloaded', { name, w: num(g.width), h: num(g.height) }));
        host.say(t(which.value === 'fg' ? 'tui.gt.done.fg' : 'tui.gt.done.eg', { name, w: num(g.width), h: num(g.height), c: fixed(g.gt[1], 3), unit: uWord() }));
        api.lastExport = { name, width: g.width, height: g.height, gt: g.gt, surface: which.value };
        onDone?.();
      } catch (e) {
        prog.set(0, isAbort(e) ? t('tui.cancelled') : t('tui.gt.failed', { error: e.message }));
      } finally { job = null; upd(); }
    };
    box.append(el('div', { className: 'cv-props' }, ...row(t('tui.l.surface'), which, sid + '-s'), ...row(t('tui.l.cell', { unit: uWord() }), cellIn, sid + '-c')), info, crsNote, prog.box);
    upd();
    return { box, go, ready: true, cancel: () => job?.abort(), busy: () => !!job };
  }

  function exportDialog() {
    const sec = geotiffSection();
    const cancel = el('button', { type: 'button', className: 'btn-line btn-sm-cc' }, t('cad.ui.close'));
    const { dlg, close } = dialog(t('tui.gt.title'), [el('p', { className: 'cv-note' }, t('tui.gt.lede')), sec.box], [cancel, sec.go || null]);
    const stop = () => { if (sec.busy?.()) sec.cancel(); else dlg.close(); };
    cancel.onclick = stop; close.onclick = stop;
    dlg.addEventListener('close', () => { sec.cancel?.(); dlg.remove(); host.refocus(); });
    root().append(dlg);
    dlg.showModal();
    (sec.go && !sec.go.disabled ? sec.go : cancel).focus();
    return dlg;
  }
  reg.commands.set('gis-geotiff', async () => { exportDialog(); });
  // builder A's GIS › Export dialog: a [data-gis-geotiff] element is our spot — filled each time its dialog opens
  const fillSpots = () => {
    for (const spot of document.querySelectorAll('[data-gis-geotiff]')) {
      const d = spot.closest('dialog');
      if (d && !d.open) { spot.dataset.filled = ''; continue; }
      if (spot.dataset.filled === '1') continue;
      spot.dataset.filled = '1';
      const sec = geotiffSection();
      spot.replaceChildren(el('h3', { className: 'cv-h cv-terrain-h' }, t('tui.gt.head')), sec.box, sec.go ? el('div', { className: 'cv-terrain-go' }, sec.go) : null);
    }
  };
  new MutationObserver(fillSpots).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] });
  // nobody else offers GIS › Export yet: ours alone
  queueMicrotask(() => {
    if (!reg.commands.has('gis-export')) reg.commands.set('gis-export', async () => { exportDialog(); });
    // nobody else offers GIS › Import yet: the Open picker (it takes every GIS file and hands it to the openers)
    if (!reg.commands.has('gis-import') && host.ui?.file) reg.commands.set('gis-import', async () => { host.ui.file.click(); });
  });

  api.openFiles = openFiles;
  api.exportDialog = exportDialog;
  host.terrain = api;
}

export { NODATA, METRES_PER, nodeXY };
